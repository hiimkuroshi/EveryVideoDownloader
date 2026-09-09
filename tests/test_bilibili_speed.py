import io
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'core'))

from yt_dlp.extractor.bilibili import BilibiliBaseIE


class FakeResponse(io.BytesIO):
    def __init__(self, status, payload):
        super().__init__(payload)
        self.status = status

    def close(self):
        super().close()


class BilibiliSpeedTests(unittest.TestCase):
    def make_ie(self, strategy='auto', avoid_p2p='true'):
        ie = BilibiliBaseIE.__new__(BilibiliBaseIE)
        ie._get_extractor_arg = lambda key, default=None: {
            'cdn_strategy': strategy,
            'avoid_p2p': avoid_p2p,
        }.get(key, default)
        ie.to_screen = lambda *_args, **_kwargs: None
        return ie

    def test_p2p_matching_uses_hostname_boundaries(self):
        self.assertTrue(BilibiliBaseIE._is_p2p_host('https://mcdn.example.com/a'))
        self.assertTrue(BilibiliBaseIE._is_p2p_host('https://edge.example.com:8082/a'))
        self.assertFalse(BilibiliBaseIE._is_p2p_host('https://xylo.example.com/a'))
        self.assertFalse(BilibiliBaseIE._is_p2p_host('https://edge.example.com/video?marker=xy'))
        self.assertFalse(BilibiliBaseIE._is_p2p_host('https://edge.example.com/\r\nxy'))

    def test_stream_candidates_are_deduplicated(self):
        ie = self.make_ie()
        media = {
            'baseUrl': 'https://a.example/video.m4s',
            'backupUrl': ['https://a.example/video.m4s', 'https://b.example/video.m4s'],
        }
        self.assertEqual(ie._stream_candidates(media), [
            'https://a.example/video.m4s', 'https://b.example/video.m4s'])

    def test_fastest_uses_exact_returned_candidate_host(self):
        ie = self.make_ie(strategy='fastest')
        media = {
            'baseUrl': 'https://slow.example/video.m4s',
            'backupUrl': ['https://fast.example/video.m4s'],
        }
        ie._bili_fastest_host = 'fast.example'
        self.assertEqual(ie._optimize_stream_url(media), 'https://fast.example/video.m4s')

    def test_probe_accepts_partial_content_and_closes_response(self):
        ie = self.make_ie()
        response = FakeResponse(206, b'x' * 1024)
        ie._request_webpage = lambda *_args, **_kwargs: response
        with patch('yt_dlp.extractor.bilibili.time.monotonic', side_effect=[1.0, 1.1]):
            throughput = ie._probe_cdn_candidate('https://fast.example/video.m4s')
        self.assertGreater(throughput, 0)
        self.assertTrue(response.closed)

    def test_probe_accepts_full_content(self):
        ie = self.make_ie()
        response = FakeResponse(200, b'x' * 1024)
        ie._request_webpage = lambda *_args, **_kwargs: response
        with patch('yt_dlp.extractor.bilibili.time.monotonic', side_effect=[2.0, 2.2]):
            throughput = ie._probe_cdn_candidate('https://fast.example/video.m4s')
        self.assertGreater(throughput, 0)
        self.assertTrue(response.closed)

    def test_probe_rejects_forbidden_response(self):
        ie = self.make_ie()
        response = FakeResponse(403, b'forbidden')
        ie._request_webpage = lambda *_args, **_kwargs: response
        self.assertIsNone(ie._probe_cdn_candidate('https://blocked.example/video.m4s'))
        self.assertTrue(response.closed)

    def test_fastest_falls_back_when_probe_fails(self):
        ie = self.make_ie(strategy='fastest')
        ie._request_webpage = lambda *_args, **_kwargs: None
        play_info = {
            'dash': {
                'video': [{
                    'baseUrl': 'https://slow.example/video.m4s',
                    'backupUrl': ['https://also-slow.example/video.m4s'],
                }],
            },
        }
        ie._prepare_fastest_cdn(play_info, avoid_p2p=True)
        self.assertEqual(ie._bili_fastest_host, '')

    def test_fastest_skips_p2p_only_candidates(self):
        ie = self.make_ie(strategy='fastest')
        ie._probe_cdn_candidate = lambda *_args: self.fail('P2P candidate must not be probed')
        play_info = {
            'dash': {
                'video': [{
                    'baseUrl': 'https://mcdn.example/video.m4s',
                    'backupUrl': ['https://edge.xy.example/video.m4s'],
                }],
            },
        }
        ie._prepare_fastest_cdn(play_info, avoid_p2p=True)
        self.assertEqual(ie._bili_fastest_host, '')

    def test_fastest_selects_the_best_exact_candidate_once(self):
        ie = self.make_ie(strategy='fastest')
        play_info = {
            'dash': {
                'video': [{
                    'baseUrl': 'https://slow.example/video.m4s',
                    'backupUrl': ['https://fast.example/video.m4s', 'https://bad.example/video.m4s'],
                }],
            },
        }
        probes = {
            'https://slow.example/video.m4s': 10,
            'https://fast.example/video.m4s': 30,
            'https://bad.example/video.m4s': None,
        }
        ie._probe_cdn_candidate = lambda url: probes[url]
        ie._prepare_fastest_cdn(play_info, avoid_p2p=True)
        self.assertEqual(ie._bili_fastest_host, 'fast.example')
        self.assertEqual(ie._optimize_stream_url(play_info['dash']['video'][0]),
                         'https://fast.example/video.m4s')


if __name__ == '__main__':
    unittest.main()
