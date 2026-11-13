"""Serve the self-contained built laboratory on localhost; no third-party Python packages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import threading
import webbrowser

root = Path(__file__).resolve().parent.parent / 'dist'
if not (root / 'index.html').is_file():
    raise SystemExit('Missing dist/index.html. Run npm ci and npm run build first.')
port = 8766
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    with ThreadingHTTPServer(('127.0.0.1', port), handler) as server:
        address = f'http://127.0.0.1:{port}/'
        print('Micrometer Atelier:', address, '\nKeep this window open. Press Ctrl+C to stop.')
        threading.Timer(.5, lambda: webbrowser.open(address)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nLaboratory closed.')
except OSError as error:
    raise SystemExit(f'Cannot start the local preview on port {port}: {error}')
