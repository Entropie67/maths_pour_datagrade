import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { buildOdsBlob, buildXlsxBlob, type SheetData } from './spreadsheet'

const sheets: SheetData[] = [
  {
    name: 'Référentiel',
    rows: [
      ['Niveau', 'Thème', 'Sous-thème'],
      ['Quatrième', 'Nombres relatifs', ''],
      ['Sixième', 'Fractions', 'Écritures & <balises>'],
    ],
  },
  {
    name: 'Liste des exercices',
    rows: [
      ['Niveau', 'Thème', 'ID', 'Titre'],
      ['Quatrième', 'Nombres relatifs', '4C10', 'Additionner des relatifs'],
    ],
  },
]

describe('buildXlsxBlob', () => {
  it('produit une archive contenant les parties minimales OOXML', async () => {
    const blob = await buildXlsxBlob(sheets)
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const names = Object.keys(zip.files)
    expect(names).toContain('[Content_Types].xml')
    expect(names).toContain('_rels/.rels')
    expect(names).toContain('xl/workbook.xml')
    expect(names).toContain('xl/_rels/workbook.xml.rels')
    expect(names).toContain('xl/worksheets/sheet1.xml')
    expect(names).toContain('xl/worksheets/sheet2.xml')

    const workbook = await zip.file('xl/workbook.xml')!.async('string')
    expect(workbook).toContain('name="Référentiel"')
    expect(workbook).toContain('name="Liste des exercices"')

    const sheet1 = await zip.file('xl/worksheets/sheet1.xml')!.async('string')
    expect(sheet1).toContain('<t xml:space="preserve">Niveau</t>')
    // Les caractères réservés du XML sont échappés.
    expect(sheet1).toContain('Écritures &amp; &lt;balises&gt;')
  })
})

describe('buildOdsBlob', () => {
  it('produit une archive ODS avec mimetype non compressé en premier', async () => {
    const blob = await buildOdsBlob(sheets)
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const names = Object.keys(zip.files)
    expect(names[0]).toBe('mimetype')
    expect(await zip.file('mimetype')!.async('string')).toBe(
      'application/vnd.oasis.opendocument.spreadsheet',
    )
    expect(names).toContain('META-INF/manifest.xml')
    expect(names).toContain('content.xml')

    const content = await zip.file('content.xml')!.async('string')
    expect(content).toContain('table:name="Référentiel"')
    expect(content).toContain('table:name="Liste des exercices"')
    expect(content).toContain(
      '<text:p>Écritures &amp; &lt;balises&gt;</text:p>',
    )
  })
})
