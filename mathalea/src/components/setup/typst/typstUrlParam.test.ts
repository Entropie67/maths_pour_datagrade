import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildRedirectHtml,
  buildShareUrl,
  LOCAL_TYPST_PARAM,
  readTypstParam,
  typstParamForAddressBar,
} from './typstUrlParam'

const BASE = 'https://coopmaths.fr/alea/?uuid=abc&v=typst'
const BIG = 'A'.repeat(7000)

describe('typstParam dans l’URL', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('garde la valeur dans la barre d’adresse tant que l’URL reste courte', () => {
    expect(typstParamForAddressBar('abc', BASE)).toBe('abc')
  })

  it('ne garde qu’une référence quand l’URL serait trop longue, et la retrouve au rechargement', () => {
    expect(typstParamForAddressBar(BIG, BASE)).toBe(LOCAL_TYPST_PARAM)
    const reloaded = new URL(`${BASE}&typstParam=${LOCAL_TYPST_PARAM}`)
    expect(readTypstParam(reloaded)).toBe(BIG)
  })

  it('lit la valeur dans la requête ou dans le fragment', () => {
    expect(readTypstParam(new URL(`${BASE}&typstParam=xyz`))).toBe('xyz')
    expect(readTypstParam(new URL(`${BASE}#typstParam=xyz`))).toBe('xyz')
    expect(readTypstParam(new URL(BASE))).toBeNull()
  })

  it('ignore une référence locale dont la copie a disparu', () => {
    expect(readTypstParam(new URL(`${BASE}&typstParam=local`))).toBeNull()
  })

  it('place les réglages volumineux dans le fragment des liens à partager', () => {
    const short = buildShareUrl(`${BASE}&typstParam=local`, 'abc')
    expect(new URL(short).searchParams.get('typstParam')).toBe('abc')
    expect(new URL(short).hash).toBe('')

    const long = buildShareUrl(`${BASE}&typstParam=local`, BIG)
    expect(long.length).toBeLessThan(BASE.length + BIG.length + 50)
    expect(new URL(long).search).toBe('?uuid=abc&v=typst')
    expect(readTypstParam(new URL(long))).toBe(BIG)
  })

  it('échappe l’URL et le titre dans le fichier de redirection', () => {
    const html = buildRedirectHtml(`${BASE}&x="<b>`, 'Fiche <1> & "2"')
    expect(html).toContain(
      'content="0; url=https://coopmaths.fr/alea/?uuid=abc&amp;v=typst&amp;x=&quot;&lt;b&gt;"',
    )
    expect(html).toContain('Fiche &lt;1&gt; &amp; &quot;2&quot;')
    expect(html).not.toContain('<b>')
  })
})
