import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import { listeEmojisInfos } from '../../lib/2d/figures2d/listeEmojis'
import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { createList } from '../../lib/format/lists'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
  getRandomSubarray,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Comprendre un algorithme répétitif sur des motifs'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '29/06/2025'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes ${['e','a','é','i','o','u','y','è','ê'].includes(pattern.shapes[0][0]) ? 'd\'':'de'}${pattern.shapes[0]} du motif suivant.
 * Les patterns sont des motifs figuratifs ou numériques qui évoluent selon des règles définies.\n
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '328c3'

export const refs = {
  'fr-fr': ['6N4B-1'],
  'fr-2016': ['6I14'],
  'fr-ch': ['10LCFA3A-7', '10LSFA3A-7', '11CTFA2H-7', 'PRQNO14A-5'],
}

export default class PaternRepetitif extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.comment = `Étudier une série d'éléments figuratifs afin d'identifier un pattern et être capable d'interpoler l'élément de rang quelconque.\n
 <br>Les patterns (angliscisme utilisé dans certains documents de référence) sont des motifs figuratifs ou numériques répétitifs qui évoluent selon une règle définie.`
    this.besoinFormulaireTexte = [
      'Types de pattern',
      'Nombres séparés par des tirets\n1 : Pattern court sans symétrie\n2 : Pattern long sans symétrie\n3 : Pattern court avec symétrie\n4 : Pattern long avec symétrie\n5 : Pattern complexe avec sous-série\n6 : Mélange',
    ]
    this.sup = '1'
    this.besoinFormulaire4Texte = [
      'Types de questions',
      'Nombres séparés par des tirets\n1 : Élément suivant dans une liste\n2 : Longueur du pattern\n3 : Élément de rang quelconque\n4 : Mélange',
    ]
    this.sup4 = '2-1'
  }

  nouvelleVersion(): void {
    const listeTypeDeSerie = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
    })

    const typesQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup4,
          min: 1,
          max: 3,
          defaut: 1,
          melange: 4,
          nbQuestions: 4,
          shuffle: false,
        }).map(Number),
      ),
    )
    let indexInteractif = 0
    for (let i = 0; i < this.nbQuestions;) {
      let nbElements: number
      let shapes: string[]
      let longueurSerie: number
      let longueurSousSerie1: number
      const selectedShapes = combinaisonListes(
        Object.keys(listeShapes2DInfos),
        1,
      )

      switch (listeTypeDeSerie[i]) {
        case 1:
          longueurSerie = randint(2, 6)
          nbElements = randint(
            longueurSerie * 2 + 1,
            longueurSerie * 4 - 1,
            longueurSerie * 3,
          )
          shapes = selectedShapes.slice(0, longueurSerie)
          break
        case 2:
          longueurSerie = randint(5, 8)
          nbElements = randint(
            longueurSerie * 2 + 1,
            longueurSerie * 4 - 1,
            longueurSerie * 3,
          )
          shapes = selectedShapes.slice(0, longueurSerie)
          break
        case 3: {
          longueurSerie = randint(3, 6)
          const demiSerie = Math.ceil(longueurSerie / 2)
          shapes = selectedShapes.slice(0, demiSerie)
          shapes.push(...shapes.slice(0, longueurSerie - demiSerie).reverse())
          nbElements = randint(longueurSerie * 2, longueurSerie * 3)
          break
        }
        case 4: {
          longueurSerie = randint(5, 8)
          const demiSerie = Math.ceil(longueurSerie / 2)
          shapes = selectedShapes.slice(0, demiSerie)
          shapes.push(...shapes.slice(0, longueurSerie - demiSerie).reverse())
          nbElements = randint(longueurSerie * 2, longueurSerie * 3)
          break
        }
        case 5:
        default:
          longueurSousSerie1 = randint(4, 5)
          shapes = selectedShapes.slice(0, longueurSousSerie1)
          shapes.push(
            ...combinaisonListesSansChangerOrdre(shapes, 1).slice(
              randint(0, 1),
              randint(3, 5),
            ),
          )
          shapes.push(
            ...getRandomSubarray(
              selectedShapes.filter((s) => !shapes.includes(s)),
              randint(1, 2),
            ),
          )
          longueurSerie = shapes.length
          nbElements = randint(longueurSerie * 2, longueurSerie * 3)
      }

      const objetsCorr: NestedObjetMathalea2dArray = []
      const objets: NestedObjetMathalea2dArray = []
      for (const shape of selectedShapes) {
        objets.push(listeShapes2DInfos[shape].shapeDef)
      }

      const pattern = new VisualPattern([])

      for (let j = 1; j <= nbElements; j++) {
        const shape = listeShapes2DInfos[
          shapes[(j - 1) % longueurSerie]
        ].shape2D
          .clone()
          .translate(j * 1.2, 0)
        objets.push(shape)
      }
      let texte = `Voici les $${nbElements}$ premiers pictogrammes d'un motif répétitif.<br>`
      const laSerieEnImage = renderPictograms(
        Object.assign(
          fixeBordures(objets, { rxmin: 0, rymin: -1, rxmax: 0, rymax: 1 }),
          { pixelsParCm: 20, scale: 0.4, optionsTikz: 'transform shape' },
        ),
        objets,
      )
      texte += laSerieEnImage
      let texteCorr = ''
      const listeQuestions: string[] = []
      const listeCorrections: string[] = []
      const infosShape =
        pattern.shapes[0] in listeShapes2DInfos
          ? listeShapes2DInfos[pattern.shapes[0]]
          : pattern.shapes[0] in listeEmojisInfos
            ? listeEmojisInfos[pattern.shapes[0]]
            : {
                articleCourt: 'un',
                nomPluriel: 'formes',
                articleSingulier: 'une',
                nomSingulier: pattern.shapes[0],
              }
      const numeroTresLoin = randint(longueurSerie * 4 + 1, longueurSerie * 10)
      let unQcm: { texte: string; texteCorr: string }
      let indexQuestion = 0
      const listeProps: string[] = shapes.map(
        (s) =>
          `${listeShapes2DInfos[s].articleSingulier} ${listeShapes2DInfos[s].nomSingulier}`,
      )
      let laBonneProp: string
      for (const q of typesQuestions) {
        switch (q) {
          case 1:
            laBonneProp = `${listeShapes2DInfos[shapes[nbElements % longueurSerie]].articleSingulier} ${listeShapes2DInfos[shapes[nbElements % longueurSerie]].nomSingulier}`

            this.autoCorrection[i * typesQuestions.length + indexQuestion] = {
              propositions: listeProps.map((s) =>
                Object.assign({}, { texte: s, statut: s === laBonneProp }),
              ),
            }
            unQcm = propositionsQcm(
              this,
              i * typesQuestions.length + indexQuestion++,
            )
            listeQuestions.push(
              `\nQuel est le prochain pictogramme de cette suite ?<br>${unQcm.texte}`,
            )
            objetsCorr.push(
              listeShapes2DInfos[shapes[nbElements % longueurSerie]].shapeDef,
              listeShapes2DInfos[shapes[nbElements % longueurSerie]].shape2D,
            )
            listeCorrections.push(`Voici le motif $${nbElements + 1}$ :<br>
              ${renderPictograms(Object.assign(fixeBordures(objetsCorr, { rxmin: -0.2, rymin: -1, rxmax: 0.2, rymax: 1 }), { pixelsParCm: 20, scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr)}`)
            break
          case 2:
            {
              listeQuestions.push(
                `\nQuelle est la longueur ${texteEnCouleurEtGras('minimale', 'black')} du motif répété ?<br>${ajouteQuestionMathlive(
                  {
                    exercice: this,
                    question: i * typesQuestions.length + indexQuestion++,
                    objetReponse: { reponse: { value: longueurSerie } },
                    typeInteractivite: 'mathlive',
                    reponseParams: {
                      formatInteractif: 'mathlive',
                    },
                  },
                )}`,
              )
              const cadre = new BoiteBuilder({
                xMin: 0.5,
                xMax: longueurSerie * 1.2 + 0.6,
                yMin: -0.8,
                yMax: 0.8,
              })
              cadre.addColor({ color: '#222222', opacity: 0.8 })
              const objetsCorr2: NestedObjetMathalea2dArray = [
                ...objets,
                cadre.render(),
              ]

              listeCorrections.push(`La longueur du motif répété est $${miseEnEvidence(String(longueurSerie))}$ et le voici :<br>
            ${renderPictograms(Object.assign(fixeBordures(objetsCorr2, { rxmin: -0.2, rymin: -1, rxmax: 0.2, rymax: 1 }), { pixelsParCm: 20, scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr2)}`)
            }
            break
          case 3:
            laBonneProp = `${listeShapes2DInfos[shapes[numeroTresLoin % longueurSerie]].articleSingulier} ${listeShapes2DInfos[shapes[numeroTresLoin % longueurSerie]].nomSingulier}`

            this.autoCorrection[i * typesQuestions.length + indexQuestion] = {
              propositions: listeProps.map((s) =>
                Object.assign({}, { texte: s, statut: s === laBonneProp }),
              ),
            }
            unQcm = propositionsQcm(
              this,
              i * typesQuestions.length + indexQuestion++,
            )
            listeQuestions.push(
              `\nQuel sera l'élément numéro $${numeroTresLoin + 1}$ de la série ?<br>${unQcm.texte}`,
            )
            objetsCorr.push(
              listeShapes2DInfos[shapes[numeroTresLoin % longueurSerie]]
                .shapeDef,
              listeShapes2DInfos[shapes[numeroTresLoin % longueurSerie]]
                .shape2D,
            )
            listeCorrections.push(`Voici l'élément $${numeroTresLoin + 1}$ :<br>
              ${renderPictograms(Object.assign(fixeBordures(objetsCorr, { rxmin: -0.2, rymin: -1, rxmax: 0.2, rymax: 1 }), { pixelsParCm: 20, scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr)}<br>
              L'élément $${numeroTresLoin + 1}$ est ${infosShape.articleSingulier} ${texteEnCouleurEtGras(listeShapes2DInfos[shapes[numeroTresLoin % longueurSerie]].nomSingulier)}.<br>`)

            break
          case 4:
            listeQuestions.push(
              `\nQuelle sera la forme numéro $42$ de la série (donner juste le nom sans article) ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: {
                    reponse: {
                      value:
                        listeShapes2DInfos[shapes[42 % longueurSerie]]
                          .nomSingulier,
                    },
                  },
                  typeInteractivite: 'texte',
                },
              )}`,
            )
            listeCorrections.push(
              `La forme numéro $42$ est ${infosShape.articleSingulier} ${texteEnCouleurEtGras(listeShapes2DInfos[shapes[42 % longueurSerie]].nomSingulier)}.<br>`,
            )

            break
        }
      }
      texte +=
        listeQuestions.length === 1
          ? listeQuestions[0]
          : createList({
              items: listeQuestions,
              style: 'alpha',
            })
      texteCorr +=
        listeCorrections.length === 1
          ? listeCorrections[0]
          : createList({
              items: listeCorrections,
              style: 'alpha',
            })
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}

/** Réduire les pictogrammes à la largeur disponible sur un petit écran. */
function renderPictograms(...args: Parameters<typeof mathalea2d>): string {
  return mathalea2d(...args)
    .replace(
      'position: relative; display: inline-block',
      'position: relative; display: inline-block; max-width: min(100%, calc(100vw - 48px))',
    )
    .replace(
      'class="mathalea2d"',
      'class="mathalea2d" style="max-width:100%;height:auto"',
    )
}
