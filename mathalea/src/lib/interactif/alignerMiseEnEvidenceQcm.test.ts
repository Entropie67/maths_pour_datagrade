import { describe, expect, it } from 'vitest'
import { orangeMathalea } from '../colors'
import { context } from '../../modules/context'
import {
  alignerMiseEnEvidenceQcm,
  imposerMiseEnEvidenceQcm,
  mettreEnEvidenceSelonMode,
  restreindreALaReponse,
} from './alignerMiseEnEvidenceQcm'

const mee = (texte: string) =>
  `{\\color{${orangeMathalea}}\\boldsymbol{${texte}}}`

describe('alignerMiseEnEvidenceQcm', () => {
  it('étend la mise en évidence à l’étiquette voisine', () => {
    expect(alignerMiseEnEvidenceQcm(`Donc $x = ${mee('6')}$.`, '$x = 6$')).toBe(
      `Donc $${mee('x = 6')}$.`,
    )
  })

  it('étend la mise en évidence à l’unité voisine', () => {
    expect(
      alignerMiseEnEvidenceQcm(
        `On a $${mee('12')}\\text{ cm}$.`,
        '$12\\text{ cm}$',
      ),
    ).toBe(`On a $${mee('12\\textbf{ cm}')}$.`)
  })

  it('conclut par la proposition complète quand l’étiquette est dans une équation alignée', () => {
    const corr = `$\\begin{aligned}x&=\\dfrac{18}{2}\\\\x&=${mee('9')}\\end{aligned}$`
    const attendu = alignerMiseEnEvidenceQcm(corr, '$x = 9$')
    expect(attendu).toContain('x&=9')
    expect(attendu).toContain(`<br>Donc $${mee('x = 9')}$.`)
  })

  it('conclut avec l’unité en texte quand elle n’est pas voisine', () => {
    const attendu = alignerMiseEnEvidenceQcm(`$a=${mee('90')}$`, '$90$ km')
    expect(attendu).toContain('La bonne proposition est : ')
    expect(attendu).toContain(`$${mee('90')}$`)
  })

  it('laisse intacte une correction déjà conforme', () => {
    const corr = `Donc $${mee('x = 6')}$.`
    expect(alignerMiseEnEvidenceQcm(corr, '$x = 6$')).toBe(corr)
  })

  it('laisse intacte une mise en évidence étrangère à la proposition', () => {
    const corr = `Donc $${mee('680')}$.`
    expect(alignerMiseEnEvidenceQcm(corr, '$970$')).toBe(corr)
  })

  it('ajoute la proposition quand rien n’est mis en évidence', () => {
    expect(alignerMiseEnEvidenceQcm('Voir la figure.', '$4x^{8}$')).toBe(
      `Voir la figure.<br>Donc $${mee('4x^{8}')}$.`,
    )
  })

  it('garde une phrase mise en évidence qui contient déjà la proposition', () => {
    const corr = `Donc, <span style="color:${orangeMathalea};font-weight: bold;">le nombre $1$ est un antécédent</span>.`
    expect(alignerMiseEnEvidenceQcm(corr, '$1$')).toBe(corr)
  })

  it('conclut par « La réponse est » quand la proposition tient en un mot', () => {
    const corr = `Le nombre est <span style="color:${orangeMathalea};font-weight: bold;">divisible par 3</span>.`
    const attendu = alignerMiseEnEvidenceQcm(corr, 'Oui')
    expect(attendu).toContain('divisible par 3.')
    expect(attendu).toContain('La réponse est ')
    expect(attendu).toContain('>Oui</span>')
  })

  it('ignore le repère de sous-question et complète une correction vide', () => {
    const repere = `<span style="color:${orangeMathalea};font-weight: bold;">a)</span>`
    expect(alignerMiseEnEvidenceQcm(repere, '$800$')).toBe(
      `${repere}<br>Donc $${mee('800')}$.`,
    )
    expect(alignerMiseEnEvidenceQcm('', '$800$')).toBe(`Donc $${mee('800')}$.`)
  })

  it('protège le signe % de la proposition en sortie LaTeX', () => {
    const htmlAvant = context.isHtml
    context.isHtml = false
    try {
      expect(alignerMiseEnEvidenceQcm('Calcul.', '$20$ %')).toContain('\\%}')
    } finally {
      context.isHtml = htmlAvant
    }
  })

  it('impose la bonne proposition comme seule mise en évidence', () => {
    const corr = `Donc <span style="color:${orangeMathalea};font-weight: bold;">la fonction</span> $${mee('6')}$ est fausse.`
    expect(imposerMiseEnEvidenceQcm(corr, 'Faux')).toBe(
      `Donc la fonction $6$ est fausse.<br>La réponse est <span style="color:${orangeMathalea};font-weight: bold;">Faux</span>.`,
    )
  })

  it('ignore le \\vphantom qui égalise la hauteur des propositions', () => {
    const proposition = '$\\vphantom{\\dfrac{1}{3}}4$'
    expect(
      alignerMiseEnEvidenceQcm(`Ainsi, $x=${mee('4')}$.`, proposition),
    ).toBe(`Ainsi, $x=${mee('4')}$.`)
    expect(
      alignerMiseEnEvidenceQcm('Ainsi, on trouve $x=4$.', proposition),
    ).toBe(`Ainsi, on trouve $x=4$.<br>Donc $${mee('4')}$.`)
  })

  describe('mode de la mise en évidence', () => {
    it('en saisie libre, sort l’unité de l’orange', () => {
      expect(
        restreindreALaReponse(
          `$5-(-3)=${mee('8\\,^{\\circ}\\textbf{C}')}$.`,
          '8',
        ),
      ).toBe(`$5-(-3)=${mee('8')}\\,^{\\circ}\\text{C}$.`)
      expect(restreindreALaReponse(`$x=${mee('20\\,\\%')}$`, '20')).toBe(
        `$x=${mee('20')}\\,\\%$`,
      )
    })

    it('en saisie libre, sort le libellé de l’orange', () => {
      expect(restreindreALaReponse(`$${mee('S=\\{1\\}')}$`, '\\{1\\}')).toBe(
        `$S=${mee('\\{1\\}')}$`,
      )
    })

    it('avec plusieurs champs, met chaque valeur en évidence', () => {
      expect(
        restreindreALaReponse(`$${mee('A\\left(5\\,;\\,-1\\right)')}$`, [
          '5',
          '-1',
        ]),
      ).toBe(`$A\\left(${mee('5')}\\,;\\,${mee('-1')}\\right)$`)
      const dejaSepare = `$A(${mee('5')};${mee('-1')})$`
      expect(restreindreALaReponse(dejaSepare, ['5', '-1'])).toBe(dejaSepare)
    })

    it('en saisie libre, sort du champ le texte mis en évidence qui n’est pas attendu', () => {
      const span = (texte: string) =>
        `<span style="color:${orangeMathalea};font-weight: bold;">${texte}</span>`
      expect(
        restreindreALaReponse(
          `Une ${span('hausse de ')}$${mee('17\\,\\%')}$.`,
          '17',
        ),
      ).toBe(`Une hausse de $${mee('17')}\\,\\%$.`)
    })

    it('en saisie libre, garde l’unité quand le champ l’attend', () => {
      const span = (texte: string) =>
        `<span style="color:${orangeMathalea};font-weight: bold;">${texte}</span>`
      const correction = `Donc $${mee('15')}$ ${span('cm')}.`
      expect(restreindreALaReponse(correction, '15\\text{ cm}')).toBe(
        correction,
      )
    })

    it('ne coupe jamais une commande LaTeX en deux', () => {
      const ensemble = `$S=${mee('\\left\\{-8\\,;\\,-7\\right\\}')}$`
      expect(restreindreALaReponse(ensemble, '\\{-8;-7\\}')).toBe(ensemble)
    })

    it('en saisie libre, retient la dernière occurrence de la réponse', () => {
      const egalite = `$${mee('\\dfrac{a^{8}}{a^{4}} = a^{4}')}$`
      expect(restreindreALaReponse(egalite, 'a^{4}')).toBe(
        `$\\dfrac{a^{8}}{a^{4}} = ${mee('a^{4}')}$`,
      )
    })

    it('laisse le signe + ou - avec la valeur qu’il ouvre', () => {
      expect(restreindreALaReponse(`soit $${mee('+36')}\\,\\%$`, '36')).toBe(
        `soit $${mee('+36')}\\,\\%$`,
      )
      expect(restreindreALaReponse(`soit $${mee('+36\\,\\%')}$`, '36')).toBe(
        `soit $${mee('+36')}\\,\\%$`,
      )
      expect(restreindreALaReponse(`$${mee('8+5')}$`, '5')).toBe(
        `$8+${mee('5')}$`,
      )
    })

    it('ne coupe pas un nombre en deux', () => {
      const prix = `$${mee('6,40')}$ €`
      expect(restreindreALaReponse(prix, '6,4')).toBe(prix)
      expect(restreindreALaReponse(`$${mee('40')}$`, '4')).toBe(
        `$${mee('40')}$`,
      )
    })

    it('laisse intacte une mise en évidence qui ne contient pas la réponse ou la coupe mal', () => {
      const autre = `$${mee('9')}$`
      expect(restreindreALaReponse(autre, '8')).toBe(autre)
      const dansTexte = `$${mee('\\text{12 cm}')}$`
      expect(restreindreALaReponse(dansTexte, '12')).toBe(dansTexte)
      expect(restreindreALaReponse(`$${mee('8')}$`, '8')).toBe(`$${mee('8')}$`)
    })

    it('étend une valeur seule à son unité, quelle que soit l’unité', () => {
      expect(
        alignerMiseEnEvidenceQcm(
          `$5-(-3)=${mee('8')}\\,^{\\circ}\\text{C}$.`,
          '$8\\,^{\\circ}\\text{C}$',
        ),
      ).toBe(`$5-(-3)=${mee('8\\,^{\\circ}\\textbf{C}')}$.`)
      expect(
        alignerMiseEnEvidenceQcm(`$x=${mee('20')}\\,\\%$`, '$20\\,\\%$'),
      ).toBe(`$x=${mee('20\\,\\%')}$`)
    })

    it('regroupe des valeurs mises en évidence séparément en une seule proposition', () => {
      expect(
        alignerMiseEnEvidenceQcm(
          `Le point $A\\left(${mee('1')}\\,;\\,${mee('-4')}\\right)$.`,
          '$A\\left(1\\,;\\,-4\\right)$',
        ),
      ).toBe(`Le point $${mee('A\\left(1\\,;\\,-4\\right)')}$.`)
    })

    it('met la proposition complète en évidence hors saisie libre', () => {
      expect(
        mettreEnEvidenceSelonMode(
          `On a $${mee('12')}\\text{ cm}$.`,
          '$12\\text{ cm}$',
        ),
      ).toBe(`On a $${mee('12\\textbf{ cm}')}$.`)
      expect(
        mettreEnEvidenceSelonMode(
          `On a $${mee('12')}\\text{ cm}$.`,
          '$12\\text{ cm}$',
          {
            reponseSaisie: '12',
          },
        ),
      ).toBe(`On a $${mee('12')}\\text{ cm}$.`)
    })
  })
})
