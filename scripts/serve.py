#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve web UI locally")
    parser.add_argument("--port", type=int, default=8016)
    parser.add_argument("--web-dir", default="web")
    args = parser.parse_args()

    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", args.web_dir))
    os.chdir(root)

    server = ThreadingHTTPServer(("0.0.0.0", args.port), SimpleHTTPRequestHandler)
    print(f"Serving: {root}")
    print(f"URL: http://127.0.0.1:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
