# 备份说明（backups/）

## 现有备份

| 文件 | 内容 | 条数 | 导出时间 | 导出方式 | 密钥自查 |
|---|---|---|---|---|---|
| `songs-backup-2026-10-21.json` | songs 表全量（含简介、分镜、里程碑、系列归属） | 37 | 2026-10-21 | 公网 RPC `get_songs`（POST） | 0 命中 |

- 备份内容为**公开数据**（本站本来就公开展示这些内容），不含任何密钥、Cookie 或私人信息。
- **恢复方法**：在新环境按 `scripts/001_schema.sql` 建表 → 把 JSON 里 `data` 数组逐行 INSERT
  （`badges` / `panels` / `milestones` / `heat` 字段为 jsonb，直接存 JSON 即可）→ 执行
  `notify pgrst, 'reload schema';` → 用 `GET rpc/get_songs` 抽查条数。
- **验证过可恢复吗**：结构验证过（字段与 `001_schema.sql` 一致），完整恢复演练待有新环境后执行
  （见 `rollback-manual.md` 第三节）。

## 尚未备份的部分（如实标注）

| 表 | 状态 | 补齐方法 |
|---|---|---|
| `favorites` | **未导出**（公网 RPC 只能按 uid 读，无全量读权限；全量导出需要控制台或 `DB_URI`） | Supabase 控制台 → Table Editor → favorites → Export CSV（Day 27 资源检查时顺手做，截图留档） |
| 表结构 | 已在仓库（`scripts/001_schema.sql` + `005_update_delete.sql`），天然有备份 | — |

## 一句话结论

「如果明天环境没了」：用**仓库代码** + **本备份** + **控制台导出的 favorites CSV**，
在任意新的 Supabase 项目里按 `scripts/*.sql` 顺序执行 → 导入两份数据 → 把新 API 地址写进
`js/api.js` 的 `API_BASE` → 推送，公网即可恢复。预计 30–60 分钟。
