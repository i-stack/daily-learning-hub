# 每日学习库

统一收集定时学习任务产出的结构化内容。课程 JSON 是唯一事实源，首页、专题页、日课页、周索引和知识树由构建脚本自动生成。

## 接入新的学习专题

1. 在 `data/catalog.json` 注册专题，例如 `ddj`、`yijing` 或其他学习任务。
2. 在 `data/<key>/` 中写入该专题的课程 JSON。
3. 运行 `npm run build` 生成网站。
4. 运行 `npm run check` 校验数据与页面。

所有课程共享 `schemaVersion`、`work`、`id`、`title`、`date`、`status`、`chapter`、`keywords`、`summary` 与 `sections`；专题特有信息可增加 `extensions`。

## 每日发布的进度规则

每个专题都只以 `data/<key>/` 中已发布课程 JSON 的最大编号为进度真值，不使用聊天记录、网页生成物或 `index.json` 中的编号。发布前运行：

```sh
npm run progress -- ddj
```

命令会返回当前最大课程 ID 和下一课程 ID。《道德经》使用 `DDJ-Dxxx`，《易经》使用 `YJ-Dxxx`；新课程必须按原文章次继续递增。《易经》从乾卦开始，严格依六十四卦通行次序发布。写入 JSON 后依次运行 `npm run build` 与 `npm run check`，校验会拒绝错前缀、重复编号、跳号和数据索引不同步；全部通过后才可提交和发布。`data/<key>/index.json`、专题列表、课程详情、周索引和知识树均由构建脚本生成，不手工维护。
