import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import C09_3 from '../../src/exercices/1e/1A-C09-3'
import C10_10 from '../../src/exercices/1e/1A-C10-10'
import C10_7 from '../../src/exercices/1e/1A-C10-7'
import E01_3 from '../../src/exercices/1e/1A-E01-3'
import E03_1 from '../../src/exercices/1e/1A-E03-1'
import F02_3 from '../../src/exercices/1e/1A-F02-3'
import F08_3 from '../../src/exercices/1e/1A-F08-3'
import Q12 from '../../src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q12'
import F03_1 from '../../src/exercices/1e/1A-F03-1'
import Q8 from '../../src/exercices/EAMPremiere/EAM-ANSpe-2026-Q8'
import P5 from '../../src/exercices/1e/1A-P5'
import R01_7 from '../../src/exercices/1e/1A-R01-7'
import R01_9 from '../../src/exercices/1e/1A-R01-9'
import R02_4 from '../../src/exercices/1e/1A-R02-4'
import R02_5 from '../../src/exercices/1e/1A-R02-5'
import R02_6 from '../../src/exercices/1e/1A-R02-6'
import { distracteursDistincts } from '../../src/lib/interactif/qcmDistractors'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Classe = new () => ExerciceSimple

function genere(
  Exercice: Classe,
  graine: string,
  nbQuestions: number,
  versionQcm: boolean,
  interactif = false,
) {
  seedrandom(graine, { global: true })
  const exercice = new Exercice()
  exercice.seed = graine
  exercice.nbQuestions = nbQuestions
  exercice.versionQcm = versionQcm
  mathaleaHandleExerciceSimple(exercice, interactif, 0)
  return exercice
}

const propositions = (question: string) =>
  [...question.matchAll(/propositions="([^"]*)"/g)].flatMap(
    ([, json]) =>
      JSON.parse(json.replaceAll('&quot;', '"')) as {
        texte: string
        statut: boolean
      }[],
  )

const forme = (texte: string) =>
  texte.replace(/\\,|\\ |\\!|~|\$|\s+/g, '')

/** Chiffres écrits hors mode mathématique (figures et composants exclus). */
function chiffresHorsDollars(html: string): string[] {
  const texte = html
    .replaceAll('&quot;', '"')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<div[^>]*divLatex[^>]*>[\s\S]*?<\/div>/g, ' ')
    .replace(/<(mathalea-[a-z-]+|tableau-mathlive|table)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<mathalea-[^>]*>/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
  return [...texte.matchAll(/\S*\d\S*/g)].map((m) => m[0])
}

describe('1A, exercices simples : relecture', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  describe('distracteursDistincts', () => {
    it('ne retire que les doublons, espaces compris, et garde l’ordre', () => {
      expect(
        distracteursDistincts('$25\\,\\%$', [
          '$2 \\,\\%$',
          '$2\\,\\%$',
          '$25 \\,\\%$',
          '$4\\,\\%$',
        ], [], 4),
      ).toEqual(['$2 \\,\\%$', '$4\\,\\%$'])
    })

    it('rend la même liste quand il n’y a aucun doublon', () => {
      const candidats = ['$1$', '$2$', '$3$', '$4$']
      expect(distracteursDistincts('$0$', candidats, ['$9$'], 4)).toEqual(candidats)
      expect(distracteursDistincts('$0$', candidats.slice(0, 3), ['$9$'])).toEqual(
        candidats.slice(0, 3),
      )
    })

    it('complète avec les distracteurs de secours seulement s’il en manque', () => {
      expect(
        distracteursDistincts('$1$', ['$1$', '$2$', '$2$'], ['$3$', '$4$', '$5$']),
      ).toEqual(['$2$', '$3$', '$4$'])
    })
  })

  it('1A-F08-3 : le QCM ne plante plus et toutes les questions ont un coefficient directeur non nul', () => {
    for (const nb of [2, 4, 8]) {
      for (let graine = 1; graine <= 60; graine++) {
        const exercice = genere(F08_3, `f08-3-${graine}`, nb, true)
        expect(exercice.listeQuestions).toHaveLength(nb)
        exercice.listeQuestions.forEach((question) => {
          const textes = propositions(question).map((p) => forme(p.texte))
          expect(new Set(textes).size, question).toBe(4)
        })
        const libre = genere(F08_3, `f08-3-${graine}`, nb, false)
        libre.listeCorrections.forEach((correction) => {
          expect(correction).not.toMatch(/\\dfrac\{0\}/)
        })
      }
    }
  })

  it('1A-R01-7 : les effectifs sont des entiers', () => {
    for (let graine = 1; graine <= 150; graine++) {
      for (const versionQcm of [false, true]) {
        const exercice = genere(R01_7, `r01-7-${graine}`, 3, versionQcm)
        exercice.listeQuestions.forEach((question, i) => {
          expect(question, `${graine} q${i}`).not.toMatch(
            /\$\d+[.,]\d+\$ (professeurs|employés|enseignants|membres) viennent/,
          )
          expect(exercice.listeCorrections[i], `${graine} q${i}`).not.toMatch(
            /=\s*\d+[.,]\d+\$\.<br>\s*Il y a/,
          )
        })
      }
    }
  })

  it('1A-R02-5 : la réponse attendue n’a pas d’erreur de flottant', () => {
    for (let graine = 1; graine <= 60; graine++) {
      const exercice = genere(R02_5, `r02-5-${graine}`, 4, false)
      exercice.autoCorrection.forEach((autoCorrection) => {
        const { value } = (
          autoCorrection as unknown as {
            valeur: { reponse: { value: number | string } }
          }
        ).valeur.reponse
        const nombre = Number(value)
        expect(nombre, String(value)).toBe(Math.round(nombre * 1e6) / 1e6)
      })
    }
  })

  it('1A-P5 : propositions sans étiquette ni doublon, réponse mise en évidence', () => {
    for (let graine = 1; graine <= 60; graine++) {
      const qcm = genere(P5, `p5-${graine}`, 1, true)
      const props = propositions(qcm.listeQuestions[0])
      expect(props).toHaveLength(4)
      for (const { texte } of props) expect(texte).not.toMatch(/[A-Za-z]/)
      expect(new Set(props.map((p) => forme(p.texte))).size).toBe(4)
      const libre = genere(P5, `p5-${graine}`, 1, false)
      expect(libre.listeCorrections[0]).toMatch(/boldsymbol/)
      expect(qcm.listeCorrections[0]).toMatch(/boldsymbol/)
    }
  })

  for (const [code, Exercice, nb] of [
    ['1A-C09-3', C09_3, 1],
    ['1A-C09-3', C09_3, 4],
    ['1A-F02-3', F02_3, 1],
    ['1A-F02-3', F02_3, 4],
    ['1A-E03-1', E03_1, 1],
    ['1A-E03-1', E03_1, 4],
  ] as const) {
    it(`${code} (${nb} question${nb > 1 ? 's' : ''}) : 4 propositions distinctes à l’écran`, () => {
      for (let graine = 1; graine <= 120; graine++) {
        const exercice = genere(Exercice, `${code}-${graine}`, nb, true)
        exercice.listeQuestions.forEach((question) => {
          const props = propositions(question)
          expect(props, `${code} ${graine}`).toHaveLength(4)
          expect(new Set(props.map((p) => forme(p.texte))).size, `${code} ${graine}`).toBe(4)
          expect(props.filter((p) => p.statut)).toHaveLength(1)
        })
      }
    })
  }

  for (const [code, Exercice] of [
    ['1A-C10-7', C10_7],
    ['1A-C10-10', C10_10],
    ['1A-E01-3', E01_3],
    ['1A-R01-9', R01_9],
    ['1A-R02-4', R02_4],
    ['1A-R02-5', R02_5],
    ['1A-R02-6', R02_6],
  ] as const) {
    for (const versionQcm of [false, true]) {
      it(`${code} (${versionQcm ? 'QCM' : 'saisie libre'}) : aucun chiffre hors $`, () => {
        for (let graine = 1; graine <= 40; graine++) {
          const exercice = genere(Exercice, `${code}-${graine}`, 3, versionQcm)
          exercice.listeQuestions.forEach((question, i) => {
            expect(chiffresHorsDollars(question), `${code} q${i}`).toEqual([])
            expect(
              chiffresHorsDollars(exercice.listeCorrections[i]),
              `${code} correction ${i}`,
            ).toEqual([])
          })
        }
      })
    }
  }

  it('1A-A01-1 (Q8) : les deux solutions de l’équation produit nul sont mises en évidence', () => {
    const exercice = new Q8()
    exercice.appliquerLesValeurs(5, 1, -4, 3)
    expect(exercice.correction).toContain('\\boldsymbol{-1}')
    expect(exercice.correction).toContain('\\boldsymbol{\\dfrac{4}{5}}')
    expect(exercice.enonceCourt?.()).toMatch(/\$\. Donner l'ensemble \$S\$ des solutions\.$/)
  })

  it('1A-F03-1 : les fonctions de la conclusion sont mises en évidence', () => {
    let vues = 0
    for (let graine = 1; graine <= 40; graine++) {
      seedrandom(`f03-1-${graine}`, { global: true })
      const exercice = new F03_1()
      exercice.nbQuestions = 4
      exercice.nouvelleVersion()
      for (const correction of exercice.listeCorrections) {
        const conclusion = correction.match(/Uniquement les? fonctions?.*$/)?.[0]
        if (!conclusion) continue
        vues++
        expect(conclusion).toMatch(/boldsymbol\{f_[123]\}/)
        expect(conclusion).not.toMatch(/\$f_[123]\$/)
      }
    }
    expect(vues).toBeGreaterThan(0)
  })

  it('1A-A01-2 (Q12) : saisie libre avec moyenne et médiane pour un seul point', () => {
    const exercice = new Q12()
    exercice.sup3 = false
    exercice.interactif = true
    exercice.nbQuestions = 1
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions[0]).toContain('moyenne et la médiane')
    expect(exercice.listeQuestions[0]).toContain('médiane')
    const { valeur } = exercice.autoCorrection[0] as unknown as {
      valeur: { champ1: { value: string }; champ2: { value: string }; bareme: unknown }
    }
    expect(valeur.champ1.value).toMatch(/^\d+$/)
    expect(valeur.champ2.value).toMatch(/^\d+$/)
    expect(typeof valeur.bareme).toBe('function')
    expect(exercice.listeCorrections[0]).toMatch(/boldsymbol\{\d+\}.*boldsymbol\{\d+\}/s)
  })

  it('miseEnEvidence reste celle du projet', () => {
    expect(miseEnEvidence('1')).toContain('\\boldsymbol{1}')
  })
})
