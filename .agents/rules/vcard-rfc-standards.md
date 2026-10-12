# vCard Generation Standards (RFC 6350 / vCard 3.0)

## Standards
All vCard exporters and endpoints must:
1. **Line Endings**: Enforce strict `\r\n` (CRLF) line separators across all lines.
2. **Standard Envelopes**: Include mandatory `BEGIN:VCARD\r\n`, `VERSION:3.0\r\n`, `FN:<name>\r\n`, `N:;<name>;;;\r\n`, and terminate with `END:VCARD\r\n`.
3. **Escaping**: Sanitize and escape multiline values (`NOTE`, `ADR`) replacing `\r?\n` with `\n` and `;` with `\;` to prevent address book truncation.
4. **Privacy Invariants**: Strictly respect user privacy flags (`showPhone`, `showEmail`). If `showPhone` is false, omit `TEL;` completely. If `showEmail` is false, omit `EMAIL;` completely.
5. **Content-Type & Disposition**: Serve with `Content-Type: text/vcard; charset=utf-8` and `Content-Disposition: attachment; filename="<username>.vcf"`.
