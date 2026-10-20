# -*- coding: utf-8 -*-
"""Day 23 本地验证服务器：静态站点 + 一个只回 500 的假 PostgREST。

用途：本机到 supabase.co 的公网链路经常不通，无法对真服务触发 5xx，
所以把一个假服务端架在本地，让 api.js 的「服务端 5xx」分支真实走到一次。
响应是真 HTTP 500 + JSON 体；api.js 的代码路径没有任何改动。

启动：python mockserver.py <端口> <站点根目录>
假接口路径：/__mock/rest/v1/rpc/<任意函数名>
"""
import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith("/__mock/rest/v1/rpc/"):
            body = json.dumps({
                "code": "XX000",
                "message": "mock: internal error",
            }).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8972
    root = sys.argv[2] if len(sys.argv) > 2 else "."
    handler = Handler
    import functools
    handler = functools.partial(Handler, directory=root)
    ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
