import JSZip from 'jszip'

/**
 * Générateur minimaliste de classeurs tableur (XLSX et ODS) sans dépendance
 * externe autre que JSZip (déjà présent dans le projet).
 *
 * Le besoin couvert est volontairement simple : plusieurs onglets, chaque
 * onglet étant une grille de chaînes ou de nombres. Aucune mise en forme,
 * formule ni style n'est produit. Les deux formats obtenus s'ouvrent dans
 * LibreOffice Calc et Microsoft Excel.
 */

/** Valeur acceptée dans une cellule. */
export type CellValue = string | number | null | undefined

/** Un onglet : un nom et une grille de lignes. */
export interface SheetData {
  name: string
  rows: CellValue[][]
}

/**
 * Échappe les caractères réservés du XML.
 * @param value valeur brute (convertie en chaîne)
 */
function escapeXml(value: CellValue): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Convertit un index de colonne (0 → « A », 26 → « AA »…) en référence
 * de colonne pour le format XLSX.
 * @param index index de colonne, à partir de 0
 */
function columnLetter(index: number): string {
  let result = ''
  let n = index + 1
  while (n > 0) {
    const remainder = (n - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

/**
 * Nettoie un nom d'onglet pour respecter les contraintes des tableurs :
 * 31 caractères maximum et pas de caractères `[ ] : * ? / \`.
 * @param name nom souhaité
 */
function sanitizeSheetName(name: string): string {
  return name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Feuille'
}

function isNumber(value: CellValue): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

// ===========================================================================
//   XLSX (Office Open XML)
// ===========================================================================

function xlsxSheet(rows: CellValue[][]): string {
  const rowsXml = rows
    .map((row, rowIndex) => {
      const cellsXml = row
        .map((value, colIndex) => {
          const ref = `${columnLetter(colIndex)}${rowIndex + 1}`
          if (value === null || value === undefined || value === '') {
            return ''
          }
          if (isNumber(value)) {
            return `<c r="${ref}"><v>${value}</v></c>`
          }
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            value,
          )}</t></is></c>`
        })
        .join('')
      return `<row r="${rowIndex + 1}">${cellsXml}</row>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`
}

/**
 * Construit un classeur au format XLSX.
 * @param sheets liste des onglets
 * @returns un `Blob` prêt à être téléchargé
 */
export async function buildXlsxBlob(sheets: SheetData[]): Promise<Blob> {
  const zip = new JSZip()

  const sheetOverrides = sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join('')
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetOverrides}</Types>`,
  )

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  )

  const sheetsXml = sheets
    .map(
      (sheet, i) =>
        `<sheet name="${escapeXml(sanitizeSheetName(sheet.name))}" sheetId="${
          i + 1
        }" r:id="rId${i + 1}"/>`,
    )
    .join('')
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetsXml}</sheets></workbook>`,
  )

  const relsXml = sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
          i + 1
        }.xml"/>`,
    )
    .join('')
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsXml}<Relationship Id="rId${
      sheets.length + 1
    }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  )

  zip.file(
    'xl/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`,
  )

  sheets.forEach((sheet, i) => {
    zip.file(`xl/worksheets/sheet${i + 1}.xml`, xlsxSheet(sheet.rows))
  })

  return zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// ===========================================================================
//   ODS (OpenDocument Spreadsheet)
// ===========================================================================

function odsCell(value: CellValue): string {
  if (value === null || value === undefined || value === '') {
    return '<table:table-cell/>'
  }
  if (isNumber(value)) {
    return `<table:table-cell office:value-type="float" office:value="${value}"><text:p>${escapeXml(
      value,
    )}</text:p></table:table-cell>`
  }
  return `<table:table-cell office:value-type="string"><text:p>${escapeXml(
    value,
  )}</text:p></table:table-cell>`
}

function odsContent(sheets: SheetData[]): string {
  const tables = sheets
    .map((sheet) => {
      const rows = sheet.rows
        .map(
          (row) =>
            `<table:table-row>${row.map(odsCell).join('')}</table:table-row>`,
        )
        .join('')
      return `<table:table table:name="${escapeXml(
        sanitizeSheetName(sheet.name),
      )}">${rows}</table:table>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2"><office:body><office:spreadsheet>${tables}</office:spreadsheet></office:body></office:document-content>`
}

/**
 * Construit un classeur au format ODS.
 * @param sheets liste des onglets
 * @returns un `Blob` prêt à être téléchargé
 */
export async function buildOdsBlob(sheets: SheetData[]): Promise<Blob> {
  const zip = new JSZip()
  // Le fichier `mimetype` doit être le premier de l'archive et non compressé.
  zip.file('mimetype', 'application/vnd.oasis.opendocument.spreadsheet', {
    compression: 'STORE',
  })
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
  )
  zip.file('content.xml', odsContent(sheets))
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
  })
}

/**
 * Déclenche le téléchargement d'un `Blob` dans le navigateur.
 * @param blob contenu du fichier
 * @param filename nom du fichier proposé à l'utilisateur
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Révoquer l'URL trop tôt annule le téléchargement encore en vol : un gros
  // blob (PDF) n'a pas fini d'être lu quand un petit (JSON) passe déjà. On
  // laisse le navigateur récupérer les octets avant de libérer l'URL.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
