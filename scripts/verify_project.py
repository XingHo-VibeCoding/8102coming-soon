#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_project.py —— 世末歌者 · 发布前检查（Day 25 verify-project Skill 的执行体）
只依赖 Python 3 标准库。在项目根目录运行：python scripts/verify_project.py
退出码：全 PASS = 0；任何 FAIL = 1。
"""
import subprocess
import sys
import urllib.request
import urllib.error
import json
import re
import os
import ssl

SITE = "https://xingho-vibecoding.github.io/8102coming-soon/"
API = "https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc"
# publishable key 是公开前端凭据，本就出现在客户端代码里（Day 23 已定性）
APIKEY = "sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO"
EXPECTED_SONGS = 37
# 线上 app.js 里应当存在的「当前版本标记」（Day 24 修复时写入的注释）
HEAD_MARKER = "Day 24"

CTX = ssl.create_default_context()
RESULTS = []


def fetch(url, data=None, headers=None, timeout=20):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.status, r.read().decode("utf-8", "replace")


def record(name, status, evidence):
    RESULTS.append((name, status, evidence))
    print(f"[{status:3}] {name}\n      证据: {evidence}")


def rpc_post(name, body):
    return fetch(f"{API}/{name}?apikey={APIKEY}",
                 data=json.dumps(body).encode(),
                 headers={"Content-Type": "application/json", "apikey": APIKEY})


def rpc_get_probe(name, params):
    """GET 探测函数存在性：存在但含写操作 → 25006 read-only（只读事务拒绝执行）；
    不存在 → PGRST202。两种返回都无副作用。"""
    q = "&".join(f"{k}={v}" for k, v in params.items())
    try:
        st, txt = fetch(f"{API}/{name}?{q}&apikey={APIKEY}")
        return st, txt
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def git(args):
    return subprocess.run(["git"] + args, capture_output=True, text=True,
                          encoding="utf-8", errors="replace").stdout


# ---------- 1. 公网首页 ----------
def check_home():
    try:
        st, html = fetch(SITE, timeout=25)
        ok = st == 200 and "中V歌曲故事" in html
        record("1 公网首页可访问", "PASS" if ok else "FAIL",
               f"HTTP {st}，标题命中={'是' if '中V歌曲故事' in html else '否'}，{SITE}")
    except Exception as e:
        record("1 公网首页可访问", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 2. 线上代码与仓库同步 ----------
def check_online_sync():
    try:
        st, js = fetch(SITE + "js/app.js", timeout=25)
        ok = st == 200 and HEAD_MARKER in js
        record("2 线上代码与仓库同步", "PASS" if ok else "FAIL",
               f"线上 js/app.js HTTP {st}，含版本标记「{HEAD_MARKER}」={'是' if ok else '否'}")
    except Exception as e:
        record("2 线上代码与仓库同步", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 3. 核心读接口 ----------
def check_songs():
    try:
        st, txt = rpc_post("get_songs", {})
        j = json.loads(txt)
        n = len(j.get("data") or [])
        ok = st == 200 and j.get("ok") is True and n == EXPECTED_SONGS
        record("3 核心读接口 get_songs", "PASS" if ok else "FAIL",
               f"HTTP {st}，ok={j.get('ok')}，条数={n}（应为 {EXPECTED_SONGS}）")
    except Exception as e:
        record("3 核心读接口 get_songs", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 4. 收藏读接口 ----------
def check_favorites():
    try:
        st, txt = rpc_post("get_favorites", {"uid": "verify-probe"})
        j = json.loads(txt)
        ok = st == 200 and j.get("ok") is True and isinstance(j.get("data"), list)
        record("4 收藏读接口 get_favorites", "PASS" if ok else "FAIL",
               f"HTTP {st}，ok={j.get('ok')}，data 类型={'list' if isinstance(j.get('data'), list) else type(j.get('data')).__name__}")
    except Exception as e:
        record("4 收藏读接口 get_favorites", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 5. Day 22 改/删接口存在性 ----------
def check_day22_api(name, params):
    try:
        st, txt = rpc_get_probe(name, params)
        if "25006" in txt:
            record(f"5 接口存在性 {name}", "PASS",
                   f"HTTP {st} 返回 25006 read-only = 函数存在且可执行（GET 只读事务拒绝写入，无副作用）")
        elif "PGRST202" in txt:
            record(f"5 接口存在性 {name}", "FAIL", f"HTTP {st} 返回 PGRST202 = 函数不存在（SQL 未执行？）")
        else:
            record(f"5 接口存在性 {name}", "PASS" if st == 200 else "FAIL",
                   f"HTTP {st}，返回片段：{txt[:120]}")
    except Exception as e:
        record(f"5 接口存在性 {name}", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 6. 收藏明细接口 ----------
def check_detail():
    try:
        st, txt = fetch(f"{API}/get_favorites_detail?uid=verify-probe&apikey={APIKEY}")
        j = json.loads(txt)
        ok = st == 200 and j.get("ok") is True and isinstance(j.get("data"), list)
        record("6 收藏明细接口 get_favorites_detail", "PASS" if ok else "FAIL",
               f"HTTP {st}，ok={j.get('ok')}，data 长度={len(j.get('data') or [])}")
    except Exception as e:
        record("6 收藏明细接口 get_favorites_detail", "FAIL", f"请求异常：{type(e).__name__}: {e}")


# ---------- 7. 密钥不泄漏（扫整个工作区，含未跟踪文件——它们也可能被提交） ----------
SECRET_PATTERNS = [
    ("带口令连接串", re.compile(r"postgres(ql)?://[^\s\"'<>]*:[^\s@/\"'<>]{6,}@")),
    ("service_role 赋值/引用", re.compile(r"(?i)service_role[\"']?\s*[:=]")),
    ("新式 secret key", re.compile(r"sb_secret_[A-Za-z0-9_-]{10,}")),
    ("sk- 开头密钥", re.compile(r"sk-[A-Za-z0-9]{20,}")),
    ("JWT", re.compile(r"eyJ[A-Za-z0-9_-]{20,}")),
]
SKIP_DIRS = {".git", "node_modules", "__pycache__"}
SKIP_FILES = {"verify_project.py", ".env"}  # 本脚本自身含特征词；.env 被忽略不入库

def check_secrets():
    hits = []
    for d, dirs, files in os.walk("."):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for fn in files:
            if fn in SKIP_FILES:
                continue
            path = os.path.join(d, fn).replace("\\", "/").lstrip("./")
            try:
                with open(os.path.join(d, fn), "r", encoding="utf-8", errors="ignore") as fh:
                    for ln, line in enumerate(fh, 1):
                        for label, pat in SECRET_PATTERNS:
                            if pat.search(line):
                                hits.append(f"{label} → {path}:{ln}")
            except OSError:
                pass
    ok = len(hits) == 0
    record("7 密钥不泄漏（赋值/引用 0 命中）", "PASS" if ok else "FAIL",
           "工作区 0 命中（含未跟踪文件；sb_publishable_ 为公开前端 key 已白名单；文档正文字样提及不算）" if ok
           else f"{len(hits)} 处命中：{'；'.join(hits[:5])}")


# ---------- 8. .gitignore 完整 ----------
def check_gitignore():
    ignored = git(["check-ignore", "-v", ".env"]).strip()
    tracked = git(["ls-files", ".env.example"]).strip()
    ok = bool(ignored) and bool(tracked)
    record("8 .gitignore 完整性", "PASS" if ok else "FAIL",
           f".env 忽略规则命中：{'是（' + ignored.split(':')[-2] + '）' if ignored else '否'}；"
           f".env.example 已入库：{'是（' + tracked + '）' if tracked else '否'}")


# ---------- 9. Git 历史无密钥提交（真密钥形状，避开文档字样污染） ----------
def check_history():
    # 用 -G 正则匹配「真密钥的形状」：文档正文只写特征词前缀（如 sb_secret_）不会命中；
    # .env.example 里的 <DB_PASSWORD> 占位符因含 <> 不匹配口令字符类。
    bad = []
    for label, pat in [
        ("sb_secret 真值", r"sb_secret_[A-Za-z0-9_-]{20,}"),
        ("连接串内嵌口令", r"postgres(ql)?://[^\s\"'<>]*:[^\s@/\"'<>]{6,}@"),
        ("JWT 真值", r"eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}"),
    ]:
        out = git(["log", "--all", "--oneline", "-G", pat]).strip()
        if out:
            bad.append(f"{label} → {out.splitlines()[0]}（等 {len(out.splitlines())} 个提交）")
    ok = len(bad) == 0
    record("9 Git 历史无密钥提交（真密钥形状抽查）", "PASS" if ok else "FAIL",
           "抽查 sb_secret 真值 / 连接串内嵌口令 / JWT 真值三类形状，0 个提交命中（文档字样与 <占位符> 不算）" if ok
           else "；".join(bad))


def main():
    print("=" * 64)
    print("verify-project · 世末歌者发布前检查")
    print("=" * 64)
    check_home()
    check_online_sync()
    check_songs()
    check_favorites()
    check_day22_api("update_favorite_note", {"uid": "verify-probe", "song_id": "verify-probe", "note": "x"})
    check_day22_api("delete_favorite", {"uid": "verify-probe", "song_id": "verify-probe"})
    check_detail()
    check_secrets()
    check_gitignore()
    check_history()

    p = sum(1 for _, s, _ in RESULTS if s == "PASS")
    f = sum(1 for _, s, _ in RESULTS if s == "FAIL")
    n = len(RESULTS) - p - f
    print("-" * 64)
    print(f"汇总：共 {len(RESULTS)} 项：PASS {p} / FAIL {f} / 未执行 {n}")
    verdict = "可以发布" if f == 0 else "存在 FAIL，禁止发布，先修复再重跑"
    print(f"结论：{verdict}")
    sys.exit(0 if f == 0 else 1)


if __name__ == "__main__":
    main()
