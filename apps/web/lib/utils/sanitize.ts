const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'blockquote',
  'code', 'pre', 'hr', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'sub', 'sup', 's', 'del', 'ins', 'small', 'mark'
]);

const ALLOWED_ATTRS = new Map<string, Set<string>>([
  ['a', new Set(['href', 'title', 'target', 'rel'])],
  ['td', new Set(['colspan', 'rowspan', 'align'])],
  ['th', new Set(['colspan', 'rowspan', 'align'])],
  ['table', new Set(['style'])],
  ['span', new Set(['style'])],
  ['div', new Set(['style'])],
  ['p', new Set(['style'])],
]);

const VOID_ELEMENTS = new Set([
  'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col',
  'embed', 'source', 'track', 'wbr'
]);

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'whatsapp:']);

function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let pos = 0;
  const result: string[] = [];
  const tagStack: string[] = [];

  while (pos < html.length) {
    const lt = html.indexOf('<', pos);

    if (lt === -1) {
      result.push(escapeText(html.slice(pos)));
      break;
    }

    result.push(escapeText(html.slice(pos, lt)));
    pos = lt;

    if (html.slice(pos, pos + 4) === '<!--') {
      const endComment = html.indexOf('-->', pos + 4);
      if (endComment === -1) {
        result.push('&lt;!--');
        pos += 4;
      } else {
        pos = endComment + 3;
      }
      continue;
    }

    const gt = html.indexOf('>', pos);
    if (gt === -1) {
      result.push(escapeText(html.slice(pos)));
      break;
    }

    const tagContent = html.slice(pos + 1, gt);
    pos = gt + 1;

    const isClosing = tagContent.startsWith('/');
    const cleanTagContent = isClosing ? tagContent.slice(1).trim() : tagContent.trim();
    const spaceIdx = cleanTagContent.search(/\s/);
    const tagName = (spaceIdx === -1 ? cleanTagContent : cleanTagContent.slice(0, spaceIdx)).toLowerCase();
    const isSelfClosing = tagContent.endsWith('/') || VOID_ELEMENTS.has(tagName);

    if (isClosing) {
      const expectedTag = tagStack.pop();
      if (expectedTag === tagName && ALLOWED_TAGS.has(tagName)) {
        result.push(`</${tagName}>`);
      }
      continue;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      continue;
    }

    const rawAttrs = spaceIdx !== -1 ? cleanTagContent.slice(spaceIdx + 1).trim() : '';
    const sanitizedAttrs = sanitizeAttributes(tagName, rawAttrs);

    result.push(`<${tagName}${sanitizedAttrs ? ' ' + sanitizedAttrs : ''}>`);

    if (!isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
      tagStack.push(tagName);
    }
  }

  while (tagStack.length > 0) {
    const tag = tagStack.pop()!;
    result.push(`</${tag}>`);
  }

  return result.join('');
}

function sanitizeAttributes(tagName: string, attrStr: string): string {
  if (!attrStr) return '';

  const allowedAttrs = ALLOWED_ATTRS.get(tagName);
  const parts: string[] = [];
  let i = 0;

  while (i < attrStr.length) {
    while (i < attrStr.length && /\s/.test(attrStr[i])) i++;
    if (i >= attrStr.length) break;

    const eqIdx = attrStr.indexOf('=', i);
    if (eqIdx === -1) {
      const name = attrStr.slice(i).trim().toLowerCase();
      if (allowedAttrs && allowedAttrs.has(name)) {
        parts.push(name);
      }
      break;
    }

    const attrName = attrStr.slice(i, eqIdx).trim().toLowerCase();
    i = eqIdx + 1;

    while (i < attrStr.length && /\s/.test(attrStr[i])) i++;

    let quote = '';
    if (attrStr[i] === '"' || attrStr[i] === "'") {
      quote = attrStr[i];
      i++;
    }

    const endQuote = quote ? attrStr.indexOf(quote, i) : (() => { const m = /\s|$/.exec(attrStr.slice(i)); return m ? i + m.index : -1; })();
    const attrValue = endQuote !== -1 ? attrStr.slice(i, endQuote) : attrStr.slice(i);

    if (allowedAttrs && allowedAttrs.has(attrName)) {
      let safeValue = attrValue;

      if (attrName === 'href' || attrName === 'src') {
        safeValue = isValidURL(attrValue) ? attrValue : '#';
      } else if (attrName === 'style') {
        safeValue = sanitizeCSS(attrValue);
      } else {
        safeValue = attrValue.replace(/[<>"']/g, '');
      }

      if (attrName === 'target') {
        safeValue = attrValue === '_blank' ? '_blank' : '_self';
      }

      if (attrName === 'rel') {
        safeValue = 'noopener noreferrer';
      }

      parts.push(`${attrName}="${safeValue}"`);
    }

    i = endQuote !== -1 ? endQuote + 1 : attrStr.indexOf(' ', i);
    if (i === -1) break;
  }

  return parts.join(' ');
}

function sanitizeCSS(css: string): string {
  const allowed = ['color', 'background-color', 'text-align', 'font-weight', 'margin', 'padding', 'border'];
  return css.split(';')
    .map(r => r.trim())
    .filter(r => {
      if (!r) return false;
      const colonIdx = r.indexOf(':');
      if (colonIdx === -1) return false;
      const prop = r.slice(0, colonIdx).trim().toLowerCase();
      const val = r.slice(colonIdx + 1).trim();
      if (!allowed.includes(prop)) return false;
      if (/url\s*\(/i.test(val)) return false;
      if (/expression\s*\(/i.test(val)) return false;
      if (/javascript\s*:/i.test(val)) return false;
      return true;
    })
    .join('; ');
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
