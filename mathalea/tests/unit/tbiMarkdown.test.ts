import { describe, expect, it } from 'vitest'
import {
  applyNoteStyle,
  renderTbiNote,
  toggleLinePrefix,
  toggleMarker,
} from '../../src/lib/tbiMarkdown'

describe('renderTbiNote', () => {
  it('rend le Markdown et les retours à la ligne', () => {
    const html = renderTbiNote(
      '# Titre\n\n**gras** et *italique*\nsuite\n\n- a',
    )
    expect(html).toContain('<h1>Titre</h1>')
    expect(html).toContain('<strong>gras</strong>')
    expect(html).toContain('<em>italique</em>')
    expect(html).toContain('<br>')
    expect(html).toContain('<li>a</li>')
  })

  it('rend les couleurs et les tailles, combinées et imbriquées', () => {
    expect(renderTbiNote('[mot]{rouge}')).toContain(
      '<span class="tbi-note-rouge">mot</span>',
    )
    expect(renderTbiNote('[mot]{bleu grand}')).toContain(
      '<span class="tbi-note-bleu tbi-note-grand">mot</span>',
    )
    expect(renderTbiNote('[**mot**]{vert}')).toContain(
      '<span class="tbi-note-vert"><strong>mot</strong></span>',
    )
    expect(renderTbiNote('[a [b]{rouge} c]{grand}')).toContain(
      '<span class="tbi-note-grand">a <span class="tbi-note-rouge">b</span> c</span>',
    )
  })

  it('laisse un style inconnu en texte, et les liens fonctionnent', () => {
    const html = renderTbiNote('[mot]{inconnu} [lien](https://a.fr)')
    expect(html).toContain('[mot]{inconnu}')
    expect(html).not.toContain('tbi-note-')
    expect(html).toContain('href="https://a.fr"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('rend les formules, sans les confondre avec un prix', () => {
    expect(renderTbiNote('$x_1 * y_2$')).toContain('class="katex"')
    expect(renderTbiNote('$$\\dfrac{1}{2}$$')).toContain('katex-display')
    expect(renderTbiNote('[$x^2$]{rouge}')).toMatch(
      /<span class="tbi-note-rouge"><span class="katex">/,
    )
    const prix = renderTbiNote('de 5 $ à 10 $')
    expect(prix).not.toContain('katex')
    expect(prix).toContain('de 5 $ à 10 $')
  })

  it('n’exécute rien de ce que contient une note', () => {
    const attaques = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      'texte <img src=x onerror=alert(1)> suite',
      '[clic](javascript:alert(1))',
      '[clic](JaVaScRiPt:alert(1))',
      '[clic](data:text/html,<script>alert(1)</script>)',
      '![image](javascript:alert(1))',
      '![image](data:image/svg+xml,<svg onload=alert(1)>)',
      '![x"onerror="alert(1)](https://a.fr/a.png)',
      '[x](https://a.fr "t\\"onmouseover=\\"alert(1)")',
      '[<img src=x onerror=alert(1)>]{rouge}',
      '$\\href{javascript:alert(1)}{x}$',
    ]
    for (const attaque of attaques) {
      const container = document.createElement('div')
      container.innerHTML = renderTbiNote(attaque)
      expect(container.querySelector('script, iframe, svg[onload]')).toBeNull()
      for (const element of container.querySelectorAll('*')) {
        for (const { name, value } of element.attributes) {
          expect(name.startsWith('on'), attaque).toBe(false)
          expect(/^\s*(?:javascript|data:text)/i.test(value), attaque).toBe(
            false,
          )
        }
      }
    }
  })
})

describe('toggleMarker', () => {
  it('entoure la sélection et garde les espaces dehors', () => {
    expect(toggleMarker('un mot ici', 3, 7, '**')).toEqual({
      text: 'un **mot** ici',
      start: 5,
      end: 8,
    })
  })

  it('retire le marqueur déjà présent', () => {
    expect(toggleMarker('un **mot** ici', 5, 8, '**')).toEqual({
      text: 'un mot ici',
      start: 3,
      end: 6,
    })
  })

  it('insère un texte à remplacer sans sélection', () => {
    expect(toggleMarker('', 0, 0, '*')).toEqual({
      text: '*texte*',
      start: 1,
      end: 6,
    })
  })
})

describe('applyNoteStyle', () => {
  it('applique une couleur à la sélection', () => {
    expect(applyNoteStyle('un mot', 3, 6, 'rouge')).toEqual({
      text: 'un [mot]{rouge}',
      start: 4,
      end: 7,
    })
  })

  it('remplace la couleur, garde la taille, et retire un style répété', () => {
    const rouge = applyNoteStyle('mot', 0, 3, 'rouge')
    const bleu = applyNoteStyle(rouge.text, rouge.start, rouge.end, 'bleu')
    expect(bleu.text).toBe('[mot]{bleu}')
    const grand = applyNoteStyle(bleu.text, bleu.start, bleu.end, 'grand')
    expect(grand.text).toBe('[mot]{bleu grand}')
    const sansBleu = applyNoteStyle(grand.text, grand.start, grand.end, 'bleu')
    expect(sansBleu.text).toBe('[mot]{grand}')
    const nu = applyNoteStyle(
      sansBleu.text,
      sansBleu.start,
      sansBleu.end,
      'grand',
    )
    expect(nu).toEqual({ text: 'mot', start: 0, end: 3 })
  })

  it('reconnaît un texte stylé sélectionné avec ses crochets', () => {
    const text = '[mot]{rouge}'
    expect(applyNoteStyle(text, 0, text.length, 'vert').text).toBe(
      '[mot]{vert}',
    )
  })

  it('style chaque ligne, sans casser une liste ni un titre', () => {
    const text = '# Titre\n\n- un\n- deux'
    expect(applyNoteStyle(text, 0, text.length, 'rouge').text).toBe(
      '# [Titre]{rouge}\n\n- [un]{rouge}\n- [deux]{rouge}',
    )
  })

  it('insère un texte à remplacer sans sélection', () => {
    expect(applyNoteStyle('', 0, 0, 'grand')).toEqual({
      text: '[texte]{grand}',
      start: 1,
      end: 6,
    })
  })
})

describe('toggleLinePrefix', () => {
  it('ajoute le préfixe aux lignes de la sélection, puis le retire', () => {
    const edit = toggleLinePrefix('a\nb\n\nc', 0, 3, '- ')
    expect(edit.text).toBe('- a\n- b\n\nc')
    expect(toggleLinePrefix(edit.text, edit.start, edit.end, '- ').text).toBe(
      'a\nb\n\nc',
    )
  })

  it('agit sur la ligne du curseur', () => {
    expect(toggleLinePrefix('a\nb', 2, 2, '# ').text).toBe('a\n# b')
  })
})
