import DOMPurify from 'dompurify'

const atsTags = [
  'a',
  'article',
  'b',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'i',
  'li',
  'ol',
  'p',
  'section',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]

export function sanitizeCvHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: atsTags,
    ALLOWED_ATTR: ['class', 'href', 'title'],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style', 'src', 'srcdoc'],
    FORBID_TAGS: ['form', 'iframe', 'math', 'object', 'script', 'style', 'svg', 'template'],
  })
}
