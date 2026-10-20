# -*- coding: utf-8 -*-
"""Day 22/23 本地验证服务器：静态站点 + 两种假后端。

/__mock/**  只回 HTTP 500 的假 PostgREST（Day 23 服务端错分支验证用）
/__full/**  按契约实现的假 PostgREST（Day 22 增改删查闭环联调用，内存态）

启动：python mockserver.py <端口> <站点根目录>
契约见 api-contract.md；响应形状 {ok,data,error} 与真接口一致。
"""
import json
import sys
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# 内存态收藏表：{uid: {song_id: note}}
DB = {}
SONG_OK = {"id": "xiafeng", "title": "夏风", "seriesId": "shimo"}


def ok(data):
    return {"ok": True, "data": data, "error": None}


def bad(msg, data=None):
    return {"ok": False, "data": data, "error": msg}


def rpc(name, body):
    uid = (body.get("uid") or "").strip()
    song = (body.get("song_id") or body.get("songId") or "").strip()
    user = DB.setdefault(uid, {}) if uid else None

    if name == "get_songs":
        return ok([SONG_OK])
    if name == "get_favorites":
        if not uid:
            return bad("缺少必填参数：uid")
        return ok(sorted(user.keys()))
    if name == "get_favorites_detail":
        if not uid:
            return bad("缺少必填参数：uid")
        return ok([{"song_id": k, "note": v, "created_at": "2026-10-20T22:00:00Z"}
                   for k, v in sorted(user.items())])
    if name == "add_favorite":
        if not uid or not song:
            return bad("缺少必填参数：" + "、".join(
                n for n, v in [("uid", uid), ("song_id", song)] if not v))
        if song in user:
            return bad("这首歌已经在收藏里了，不要重复添加",
                       {"uid": uid, "song_id": song, "duplicate": True})
        user[song] = None
        return ok({"uid": uid, "song_id": song})
    if name == "update_favorite_note":
        note = body.get("note")
        note = None if note is None or not note.strip() else note.strip()
        if not uid or not song:
            return bad("缺少必填参数：" + "、".join(
                n for n, v in [("uid", uid), ("song_id", song)] if not v))
        if note is not None and len(note) > 200:
            return bad("备注太长（最多 200 字），请删减后再保存")
        if song not in user:
            return bad("收藏不存在：%s（要先收藏这首歌才能改备注）" % song)
        user[song] = note
        return ok({"uid": uid, "song_id": song, "note": note})
    if name == "delete_favorite":
        if not uid or not song:
            return bad("缺少必填参数：" + "、".join(
                n for n, v in [("uid", uid), ("song_id", song)] if not v))
        if song not in user:
            return bad("这条收藏不存在或已被删除：%s" % song,
                       {"uid": uid, "song_id": song, "missing": True})
        del user[song]
        return ok({"uid": uid, "song_id": song, "deleted": True})
    return bad("未知接口：" + name)


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith("/__mock/rest/v1/rpc/"):
            self.send_json(500, {"code": "XX000", "message": "mock: internal error"})
        elif self.path.startswith("/__full/rest/v1/rpc/"):
            name = self.path.split("/rpc/")[-1].split("?")[0]
            ln = int(self.headers.get("Content-Length") or 0)
            try:
                body = json.loads(self.rfile.read(ln).decode("utf-8")) if ln else {}
            except Exception:
                body = {}
            self.send_json(200, rpc(name, body))
        else:
            self.send_error(404)

    def send_json(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8972
    root = sys.argv[2] if len(sys.argv) > 2 else "."
    ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=root)).serve_forever()
