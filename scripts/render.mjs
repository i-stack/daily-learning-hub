import MarkdownIt from 'markdown-it';
import katex from 'katex';
import 'katex/contrib/mhchem';

export const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${katex.version}/dist/katex.min.css`;

const renderMath = (tex, displayMode) => katex.renderToString(tex, {
  displayMode,
  throwOnError: false,
  strict: false,
});

const mathPlugin = md => {
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    if (state.src[state.pos] !== '$' || state.src[state.pos + 1] === '$') return false;
    if (/\s/.test(state.src[state.pos + 1] ?? '')) return false;
    let end = state.pos + 1;
    while ((end = state.src.indexOf('$', end)) !== -1) {
      if (state.src[end - 1] !== '\\' && !/\s/.test(state.src[end - 1] ?? '')) break;
      end += 1;
    }
    if (end === -1) return false;
    if (!silent) {
      const token = state.push('math_inline', 'math', 0);
      token.content = state.src.slice(state.pos + 1, end);
    }
    state.pos = end + 1;
    return true;
  });

  md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const firstLine = state.src.slice(start, state.eMarks[startLine]).trim();
    if (!firstLine.startsWith('$$')) return false;

    let content = firstLine.slice(2);
    let nextLine = startLine + 1;
    const sameLineEnd = content.indexOf('$$');
    if (sameLineEnd !== -1) {
      content = content.slice(0, sameLineEnd);
    } else {
      const lines = [content];
      let closed = false;
      for (; nextLine < endLine; nextLine += 1) {
        const line = state.src.slice(state.bMarks[nextLine] + state.tShift[nextLine], state.eMarks[nextLine]);
        const close = line.indexOf('$$');
        if (close !== -1) {
          lines.push(line.slice(0, close));
          nextLine += 1;
          closed = true;
          break;
        }
        lines.push(line);
      }
      if (!closed) return false;
      content = lines.join('\n');
    }

    if (silent) return true;
    const token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = content.trim();
    token.map = [startLine, nextLine];
    state.line = nextLine;
    return true;
  });

  md.renderer.rules.math_inline = (tokens, idx) => renderMath(tokens[idx].content, false);
  md.renderer.rules.math_block = (tokens, idx) => `${renderMath(tokens[idx].content, true)}\n`;
};

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
md.use(mathPlugin);

const defaultLinkOpen = md.renderer.rules.link_open
  ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim().toLowerCase() === 'mermaid') {
    return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

export const hasMath = text => /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/.test(String(text ?? ''));
export const hasMermaid = text => /^```mermaid\s*$/im.test(String(text ?? ''));

/** 渲染完整块级 Markdown；原始 HTML 被禁用并作为普通文本转义。 */
export const renderMarkdown = text => text == null ? '' : md.render(String(text));

/** 渲染列表项等不应产生外层段落的行内 Markdown。 */
export const renderInline = text => text == null ? '' : md.renderInline(String(text));

// 保留原公开名称，避免外部脚本因升级失效。
export const renderRich = renderInline;
