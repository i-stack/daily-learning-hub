import katex from 'katex';
import 'katex/contrib/mhchem';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// KaTeX CSS（与安装版本保持一致，走 jsdelivr，同 mermaid 的 CDN 约定）
export const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${katex.version}/dist/katex.min.css`;

const renderMath = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false });
  } catch (err) {
    return `<code class="katex-error">${esc(tex)}</code>`;
  }
};

// 判断文本里是否包含数学公式（用于按需引入 KaTeX CSS）
export const hasMath = text => /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/.test(String(text ?? ''));

/**
 * 渲染行内 Markdown + 数学公式（KaTeX 服务端渲染，mhchem 支持 \ce{}）。
 * 安全顺序：先抽离行内代码与数学，再转义 HTML，再套用行内 Markdown，最后还原。
 */
export function renderRich(text) {
  if (text == null) return '';
  const s = String(text);
  const tokens = [];
  const stash = html => { tokens.push(html); return `\u0000${tokens.length - 1}\u0000`; };

  let out = s
    // 1) 行内代码（先于数学，避免代码里的 $ 被误判）
    .replace(/`([^`]+)`/g, (m, code) => stash(`<code>${esc(code)}</code>`))
    // 2) 数学：块级 $$...$$ 与行内 $...$
    .replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g, m => {
      if (m.startsWith('$$')) return stash(renderMath(m.slice(2, -2), true));
      return stash(renderMath(m.slice(1, -1), false));
    });

  // 3) 转义剩余文本
  out = esc(out);

  // 4) 行内 Markdown
  out = out
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // 5) 还原占位
  return out.replace(/\u0000(\d+)\u0000/g, (m, i) => tokens[+i]);
}
