export function isHtmlDocumentText(text: string): boolean {
  return /^<!doctype\s+html\b/i.test(text.trimStart())
}
