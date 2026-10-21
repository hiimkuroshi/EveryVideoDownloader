"""Download an in-memory media descriptor; never persist signed URLs or headers."""

import json
import sys

from yt_dlp import YoutubeDL
from yt_dlp.extractor.common import InfoExtractor


def main():
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        stream.reconfigure(encoding='utf-8')
    descriptor = json.load(sys.stdin)
    headers = descriptor.get('headers') or {}
    options = {
        'outtmpl': descriptor['output'],
        'http_headers': headers,
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
    with YoutubeDL(options) as ydl:
        ie = InfoExtractor(ydl)
        media_id = descriptor['id']
        if descriptor.get('format'):
            formats = [descriptor['format']]
        elif descriptor['type'] == 'manifest':
            if descriptor.get('mime') == 'application/dash+xml' or '.mpd' in descriptor['url'].split('?')[0]:
                formats = ie._extract_mpd_formats(descriptor['url'], media_id, headers=headers)
            else:
                formats = ie._extract_m3u8_formats(descriptor['url'], media_id, 'mp4', headers=headers)
        else:
            formats = [{'url': descriptor['url'], 'ext': descriptor.get('ext'), 'http_headers': headers}]
        result = {
            'id': media_id,
            'title': descriptor.get('title') or 'media',
            'formats': formats,
            'http_headers': headers,
        }
        ydl.process_ie_result(result, download=True)


if __name__ == '__main__':
    main()
