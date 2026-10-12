"""Local-only WBS 6 error/retry review. First active manifest request fails.

Run after npm run build; browse http://127.0.0.1:4181 and open Artists,
then use Try again. No production files are changed.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import time
import base64
from urllib.parse import parse_qs

ROOT = Path(__file__).resolve().parents[2]
PROOF_FORM = '''<!doctype html><html lang="en"><meta charset="utf-8"><title>Local screenshot evidence</title><h1>Save local browser evidence</h1><form method="post" action="/proof"><label for="filename">File name</label><input id="filename" name="filename" value="wbs6-desktop.jpg"><label for="data">Screenshot base64</label><textarea id="data" name="data"></textarea><button>Save screenshot</button></form>'''

class Handler(SimpleHTTPRequestHandler):
    first = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'dist'), **kwargs)

    def do_GET(self):
        if self.path == '/proof':
            self.html(PROOF_FORM)
            return
        if self.path == '/data/active.json' and Handler.first:
            Handler.first = False
            time.sleep(4)  # Make loading observable; only the first request is delayed.
            self.send_error(503, 'Intentional WBS 6 unavailable-data check')
            return
        super().do_GET()

    def html(self, value):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(value.encode('utf-8'))

    def do_POST(self):
        # Screenshot bytes originate from the browser tool and enter through this
        # local form. Restrict writes to named QA artifacts inside this workspace.
        if self.path != '/proof' or int(self.headers.get('Content-Length', '0')) > 4_000_000:
            self.send_error(400); return
        fields = parse_qs(self.rfile.read(int(self.headers['Content-Length'])).decode())
        name = fields.get('filename', [''])[0]
        if name not in {f'wbs6-{n}.jpg' for n in ['desktop', 'results', 'artists', 'mobile', 'portrait-fallback', 'error', 'narrow']} | {f'wbs7-{n}.jpg' for n in ['desktop', 'results', 'mobile', 'review', 'error']} | {f'wbs8-{n}.jpg' for n in ['library', 'restore', 'mobile', 'storage-error']} | {f'wbs9-{n}.jpg' for n in ['desktop', 'mobile', 'wrangler', 'relay']}:
            self.send_error(400); return
        try:
            data = base64.b64decode(fields['data'][0], validate=True)
            if not data.startswith(b'\xff\xd8\xff'): raise ValueError('Expected JPEG')
            (ROOT / 'reports/screenshots' / name).write_bytes(data)
        except (ValueError, KeyError):
            self.send_error(400); return
        self.html(PROOF_FORM + f'<p role="status">Saved {name} ({len(data)} bytes).</p></html>')

print('Local error/retry QA: http://127.0.0.1:4181', flush=True)
ThreadingHTTPServer(('127.0.0.1', 4181), Handler).serve_forever()
