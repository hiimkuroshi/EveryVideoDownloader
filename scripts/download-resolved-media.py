"""Download an in-memory media descriptor; never persist signed URLs or headers."""

import json
import sys

from yt_dlp import YoutubeDL
from yt_dlp.extractor.common import InfoExtractor
from yt_dlp.postprocessor.ffmpeg import FFmpegMergerPP


def source_formats(ie, source):
    headers = source.get('headers') or {}
    if source.get('format'):
        formats = [dict(source['format'])]
    elif source['type'] == 'manifest':
        if source.get('mime') == 'application/dash+xml' or '.mpd' in source['url'].split('?')[0]:
            formats = ie._extract_mpd_formats(source['url'], source['id'], headers=headers)
        else:
            formats = ie._extract_m3u8_formats(source['url'], source['id'], 'mp4', headers=headers)
    else:
        formats = [{'url': source['url'], 'ext': source.get('ext')}]
    for item in formats:
        item['http_headers'] = {**(item.get('http_headers') or {}), **headers}
    return formats


def main():
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        stream.reconfigure(encoding='utf-8')
    descriptor = json.load(sys.stdin)
    headers = descriptor.get('headers') or {}
    options = {
        'outtmpl': descriptor['output'],
        'http_headers': {} if descriptor.get('audio') else headers,
        'noplaylist': True,
        'cachedir': False,
        'socket_timeout': 20,
        'retries': 3,
        'fragment_retries': 3,
        'noprogress': False,
        'progress_with_newline': True,
        'overwrites': False,
    }
    if descriptor.get('ffmpeg_location'):
        options['ffmpeg_location'] = descriptor['ffmpeg_location']
    if descriptor.get('audio'):
        options.update(format='bestvideo+bestaudio', merge_output_format=descriptor['merge_ext'])
    with YoutubeDL(options) as ydl:
        if descriptor.get('audio') and not FFmpegMergerPP(ydl).available:
            raise RuntimeError('FFmpeg is required to merge video and audio')
        ie = InfoExtractor(ydl)
        media_id = descriptor['id']
        formats = source_formats(ie, descriptor)
        if descriptor.get('audio'):
            videos = [dict(item, format_id=f'video-{index}', acodec='none', vcodec=item.get('vcodec') or 'unknown')
                      for index, item in enumerate(formats) if item.get('vcodec') != 'none']
            audios = [dict(item, format_id=f'audio-{index}', vcodec='none', acodec=item.get('acodec') or 'unknown')
                      for index, item in enumerate(source_formats(ie, descriptor['audio'])) if item.get('acodec') != 'none']
            formats = [*videos, *audios]
        result = {
            'id': media_id,
            'title': descriptor.get('title') or 'media',
            'formats': formats,
            'http_headers': {} if descriptor.get('audio') else headers,
        }
        ydl.process_ie_result(result, download=True)


if __name__ == '__main__':
    main()
