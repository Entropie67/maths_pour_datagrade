import Probleme from '../../../src/lib/problems/Probleme'
import { schemaProblemeVarie } from '../../../src/lib/problems/schemaProblemeVarie'
import type { SchemaEnBarreAttendu } from '../../../src/lib/customElements/SchemaEnBarreElement'
import { beforeEach, describe, expect, it } from 'vitest'
import seedrandom from 'seedrandom'
import ProblemesVaries from '../../../src/exercices/6e/6N5-10'
import { MathaleaCouteauSuisseElement } from '../../../src/lib/customElements/MathaleaCouteauSuisse'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../../src/modules/context'

function generer(
  categorie: number,
  mode: number,
  decimal = false,
  ordreFixe = false,
  interactif = true,
) {
  seedrandom('6N5-10-schemas', { global: true })
  const exercice = new ProblemesVaries()
  exercice.numeroExercice = 0
  exercice.interactif = interactif
  exercice.sup = String(categorie)
  exercice.sup2 = decimal
  exercice.sup3 = ordreFixe
  exercice.sup4 = mode
  exercice.nouvelleVersion()
  return exercice
}

beforeEach(() => setOutputHtml())

describe('6N5-10 : schémas en barre', () => {
  it.each(Array.from({ length: 15 }, (_, i) => i + 1))(
    'conserve les énoncés et les réponses de la catégorie %i dans les trois modes',
    (categorie) => {
      for (const decimal of [false, true]) {
        for (const ordreFixe of [false, true]) {
          const simple = generer(categorie, 1, decimal, ordreFixe)
          expect(simple.listeQuestions).toHaveLength(4)
          for (const mode of [2, 3]) {
            const schemas = generer(categorie, mode, decimal, ordreFixe)
            expect(schemas.listeCorrections).toEqual(simple.listeCorrections)
            for (let i = 0; i < 4; i++) {
              const ac = schemas.autoCorrection[i] as unknown as {
                elements: {
                  questionIndex?: number
                  autoCorrection: { valeur: { reponse: unknown } }
                }[]
              }
              expect(schemas.listeQuestions[i]).toContain(
                simple.listeQuestions[i].split('<br>')[0],
              )
              expect(ac.elements[1].autoCorrection.valeur.reponse).toEqual(
                simple.autoCorrection[i].valeur?.reponse,
              )
              expect(ac.elements[1].questionIndex).toBe(i + 100)
              expect(
                MathaleaCouteauSuisseElement.pointsMaxQuestion(schemas, i),
              ).toBe(2)
              expect(schemas.listeQuestions[i].includes('type-impose=')).toBe(
                mode === 2,
              )
              expect(schemas.listeCorrections[i]).not.toMatch(/NaN|undefined/)
            }
          }
        }
      }
    },
  )

  it('place les données connues et les inconnues sans confondre solde, partie et total', () => {
    const probleme = new Probleme('test', {
      nb1: 12,
      nb2: 30,
      nbFois: 3,
      facteur: 7,
      quotité: 5,
    })
    const cas: [number, SchemaEnBarreAttendu['textes']][] = [
      [1, { partieA: '12', partieB: '30', tout: '?' }],
      [2, { partieA: '12', partieB: '?', tout: '42' }],
      [3, { partieA: '?', partieB: '12', tout: '30' }],
      [4, { partieA: '12', partieB: '30', tout: '?' }],
      [5, { partieA: '12', partieB: '?', tout: '42' }],
      [6, { partieA: '?', partieB: '12', difference: '30' }],
      [7, { partieA: '42', partieB: '?', difference: '30' }],
      [8, { partieA: '30', partieB: '12', difference: '?' }],
      [9, { part: '7', nombreDeParts: '3', tout: '?' }],
      [10, { part: '?', nombreDeParts: '3', tout: '15' }],
      [11, { part: '5', nombreDeParts: '?', tout: '15' }],
      [12, { part: '12', nFois: '3', etiquetteB: 'Boîte\n?' }],
      [13, { part: '?', nFois: '3', etiquetteB: 'Boîte\n30' }],
      [14, { part: '12', nFois: '3', tout: '?' }],
      [15, { part: '12', nFois: '?', etiquetteB: 'Boîte\n36' }],
    ]
    for (const [categorie, textes] of cas) {
      expect(schemaProblemeVarie(probleme, categorie).attendu.textes).toEqual(
        textes,
      )
    }
    expect(schemaProblemeVarie(probleme, 3).correction.partieA).toBe('18')
    expect(schemaProblemeVarie(probleme, 14).correction.tout).toBe('48')
  })

  it('impose le schéma avec total seulement pour la recherche du tout multiplicatif', () => {
    for (const categorie of [12, 13, 14, 15]) {
      const exercice = generer(categorie, 2)
      const dom = document.createElement('div')
      dom.innerHTML = exercice.listeQuestions[0]
      const schema = dom.querySelector('schema-en-barre')!
      expect(schema.getAttribute('type-impose')).toBe(
        categorie === 14
          ? 'multiplicatif-comparaison-total'
          : 'multiplicatif-comparaison',
      )
    }
  })

  it('ne révèle ni le nombre de parts ni le multiplicateur inconnus', () => {
    for (const categorie of [11, 15]) {
      const exercice = generer(categorie, 2)
      const ac = exercice.autoCorrection[0] as unknown as {
        elements: {
          autoCorrection: { valeur: { reponse: { value: string } } }
        }[]
      }
      const attendu = JSON.parse(
        ac.elements[0].autoCorrection.valeur.reponse.value,
      )
      expect(attendu.nbRectangles).toBeUndefined()
      expect(attendu.textes[categorie === 11 ? 'nombreDeParts' : 'nFois']).toBe(
        '?',
      )
    }
  })

  it('produit les gabarits imposés et les corrections en LaTeX et en Typst', () => {
    for (const typst of [false, true]) {
      setOutputLatex()
      if (typst) {
        setOutputHtml()
        context.isTypst = true
      }
      const exercice = generer(14, 2, false, false, false)
      expect(exercice.listeQuestions[0]).toContain(
        typst ? '<mathalea-typst>' : '\\begin{tikzpicture}',
      )
      expect(exercice.listeCorrections[0]).toContain(
        typst ? '<mathalea-typst>' : '\\begin{tikzpicture}',
      )
      expect(exercice.listeQuestions[0]).toContain(
        typst ? 'stretch(brace.r' : 'decoration={brace',
      )
      context.isTypst = false
    }
  })
})
