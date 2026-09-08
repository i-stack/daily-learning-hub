import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMarkdown,renderInline,hasMath,hasMermaid} from './render.mjs';

test('renders block Markdown and common extensions', () => {
  const html = renderMarkdown(`# 标题

> 引用

- 列表

| A | B |
| - | - |
| 1 | 2 |

\`\`\`swift
let value = 1
\`\`\`
`);
  assert.match(html, /<h1>标题<\/h1>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<table>/);
  assert.match(html, /language-swift/);
});

test('renders math, chemistry, and Mermaid', () => {
  const html = renderMarkdown(`行内 $a^2+b^2=c^2$

$$
\\ce{2H2 + O2 -> 2H2O}
$$

\`\`\`mermaid
graph TD
  A --> B
\`\`\``);
  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /class="mermaid"/);
  assert.equal(hasMath('$x$'), true);
  assert.equal(hasMermaid('```mermaid\ngraph TD\n```'), true);
});

test('blocks raw HTML and unsafe links', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert(1))');
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /href="javascript:/);
  assert.match(html, /&lt;script&gt;/);
});

test('keeps array items inline and hardens external links', () => {
  const html = renderInline('**重点** [文档](https://example.com)');
  assert.doesNotMatch(html, /<p>/);
  assert.match(html, /<strong>重点<\/strong>/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('renders bold tags that directly abut CJK text after a fullwidth colon', () => {
  // `**标签：**紧贴汉字` 在 CommonMark 中因闭合分隔符不满足规则而原样输出，这里应修复为加粗。
  const html = renderMarkdown('**版本说明：**本课依据通行约三百字本。\n\n**字面义：**“杀机”可先按机势理解。\n\n**注疏义：**历代解释取向不同。');
  assert.match(html, /<strong>版本说明：<\/strong>本课依据/);
  assert.match(html, /<strong>字面义：<\/strong>“杀机”/);
  assert.match(html, /<strong>注疏义：<\/strong>历代解释/);
  assert.doesNotMatch(html, /\*\*/);
});

test('does not disturb ordinary emphasis, code spans, or inline rendering', () => {
  assert.equal(renderMarkdown('**注：**abc 与 `**字面**` 保留。').includes('<strong>注：</strong>abc'), true);
  assert.equal(renderInline('**版：**正文'), '<strong>版：</strong>正文');
  const plain = renderMarkdown('普通 **加粗** 与 *斜体* 不受影响。');
  assert.match(plain, /普通 <strong>加粗<\/strong> 与 <em>斜体<\/em> 不受影响。/);
});
