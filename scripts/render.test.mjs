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
