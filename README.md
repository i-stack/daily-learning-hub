# 每日学习库

统一收集定时学习任务产出的结构化内容。课程 JSON 是唯一事实源，首页、专题页、日课页、周索引和知识树由构建脚本自动生成。

## 接入新的学习专题

1. 在 `data/catalog.json` 注册专题，例如 `ddj`、`yijing` 或其他学习任务。
2. 在 `data/<key>/` 中写入该专题的课程 JSON。
3. 运行 `npm run build` 生成网站。
4. 运行 `npm run check` 校验数据与页面。

所有课程共享 `schemaVersion`、`work`、`id`、`title`、`date`、`status`、`chapter`、`keywords`、`summary` 与 `sections`；专题特有信息可增加 `extensions`。
