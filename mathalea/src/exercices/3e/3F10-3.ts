import { droiteParPointEtPente } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMult'
export const titre = 'Utiliser le vocabulaire et les notations des fonctions'
export const dateDePublication = '29/09/2022'
export const dateDeModifImportante = '15/03/2024'

/**
 * Répondre à des questions sur les fonctions.
 * @author Gilles Mora
 */

export const uuid = '4daef'

export const refs = {
  'fr-fr': ['3F10-3', '2F10-2', 'BP2AutoO4'],
  'fr-ch': ['1mF1-5', '10LCFA3C-3', '10LSFA3C-3', '11CTFA2B-3'],
}
export default class VocabulaireNotationsFonctions2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Traduire une égalité par une phrase',
        '2 : Traduire une phrase par une égalité',
        '3 : Interprétation graphique',
        '4 : Expression littérale',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = 5
    this.spacing = 1.5
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? 'Cocher toutes les réponses correctes.'
      : ''

    const r = repere({
      xMin: -5,
      xMax: 5,
      yMin: -4,
      yMax: 4,
      thickHauteur: 0.1,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1, 'milieu')
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const choixDesQuestions = []
    choixDesQuestions.push(
      combinaisonListes(
        this.interactif ? range(5) : range(3),
        this.nbQuestions,
      ),
    )
    choixDesQuestions.push(combinaisonListes(range(4), this.nbQuestions))
    choixDesQuestions.push(combinaisonListes(range(3), this.nbQuestions))
    choixDesQuestions.push(
      combinaisonListes(
        !this.interactif && !context.isAmc ? range(4) : range(2),
        this.nbQuestions,
      ),
    )

    const indice = [0, 0, 0, 0]
    for (
      let i = 0,
        texte,
        texteCorr,
        x,
        y,
        A,
        d,
        t,
        fonction1,
        listeFonction = [],
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let nomF = ''
      let PointC = ''
      texte = ''
      texteCorr = ''
      x = 0
      y = 0
      nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
      switch (typeDeQuestions[i]) {
        case 1: // 'Traduire une égalité par une phrase':
          x = randint(-9, 9, [0, 1, -1])
          y = randint(-9, 9, x)
          switch (choixDesQuestions[0][indice[0]]) {
            case 0: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase contenant le mot «${sp(1)}image${sp(1)}».`
              // if (this.interactif) { //  texte += '<br>Une ou plusieurs réponses correctes.' }
              texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $\\bullet$ ${texteEnCouleurEtGras(`L'image de `)}$${miseEnEvidence(x)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(y)}$.<br>
            $\\bullet$ $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `L'image de $${x}$ par la fonction $${nomF}$ est $${y}$.`,
                  statut: true,
                },
                {
                  texte: `L'image de $${y}$ par la fonction $${nomF}$ est $${x}$.`,
                  statut: false,
                },
                {
                  texte: ` $${x}$ est l'image de $${y}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
                {
                  texte: `$${x}$ a pour image $${y}$ par la fonction $${nomF}$.`,
                  statut: true,
                },
              ]
              break
            }
            case 1: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase contenant le mot «${sp(1)}image${sp(1)}».`
              // if (this.interactif) { //  texte += '<br>Une ou plusieurs réponses correctes.' }
              if (this.interactif) {
                texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            ${texteEnCouleurEtGras(`Par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(`, `)}$${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(y)}$.
            `
              } else {
                texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $\\bullet$ ${texteEnCouleurEtGras(`L'image de `)}$${miseEnEvidence(x)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(y)}$.<br>
            $\\bullet$ $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              }
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `Par la fonction $${nomF}$,  $${x}$  a pour image $${y}$.`,
                  statut: true,
                },
                {
                  texte: `L'image de $${y}$ par la fonction $${nomF}$ est $${x}$.`,
                  statut: false,
                },
                {
                  texte: `Par la fonction $${nomF}$, $${x}$ est l'image de $${y}$.`,
                  statut: false,
                },
                {
                  texte: `$${y}$ a pour image $${x}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
              ]
              break
            }
            case 2: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase contenant le mot «${sp(1)}antécédent${sp(1)}».`
              // if (this.interactif) { //  texte += '<br>Une ou plusieurs réponses correctes.' }
              texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $\\bullet$ ${texteEnCouleurEtGras(`Un antécédent de `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(x)}$.<br>
            $\\bullet$ $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` est un antécédent de `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `Un antécédent de $${x}$ par la fonction $${nomF}$ est $${y}$.`,
                  statut: false,
                },
                {
                  texte: `Un antécédent de $${y}$ par la fonction $${nomF}$ est $${x}$.`,
                  statut: true,
                },
                {
                  texte: ` $${x}$ est un antécédent de $${y}$ par la fonction $${nomF}$.`,
                  statut: true,
                },
                {
                  texte: `$${x}$ a pour antécédent $${y}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
              ]
              break
            }
            case 3: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase contenant le mot «${sp(1)}antécédent${sp(1)}».`
              // if (this.interactif) { //  texte += '<br>Une ou plusieurs réponses correctes.' }
              if (this.interactif) {
                texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            ${texteEnCouleurEtGras(`Par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(`, `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` a pour antécédent `)}$${miseEnEvidence(x)}$.
            `
              } else {
                texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $\\bullet$ ${texteEnCouleurEtGras(`Un antécédent de `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(x)}$.<br>
            $\\bullet$ $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` est un antécédent de `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              }
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `Par la fonction $${nomF}$, $${y}$ a pour antécédent $${x}$.`,
                  statut: true,
                },
                {
                  texte: `Un antécédent de $${x}$ par la fonction $${nomF}$ est $${y}$.`,
                  statut: false,
                },
                {
                  texte: `Par la fonction $${nomF}$, $${x}$ a pour antécédent $${y}$.`,
                  statut: false,
                },
                {
                  texte: `$${y}$ est un antécédent de $${x}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
              ]
              break
            }
            case 4: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase.`
              //  texte += '<br>Une ou plusieurs réponses correctes.'
              texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $\\bullet$ ${texteEnCouleurEtGras(`Un antécédent de `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(x)}$.<br>
            $\\bullet$ ${texteEnCouleurEtGras(`L'image de `)}$${miseEnEvidence(x)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$${texteEnCouleurEtGras(` est `)}$${miseEnEvidence(y)}$.<br>
            $\\bullet$ $${miseEnEvidence(y)}$${texteEnCouleurEtGras(` est l'image de `)}$${miseEnEvidence(x)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `Un antécédent de $${y}$ par la fonction $${nomF}$ est $${x}$.`,
                  statut: true,
                },
                {
                  texte: `L'image de $${x}$ par la fonction $${nomF}$ est $${y}$.`,
                  statut: true,
                },
                {
                  texte: ` $${y}$ est l'image de $${x}$ par la fonction $${nomF}$.`,
                  statut: true,
                },
                {
                  texte: `$${x}$ a pour antécédent $${y}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
              ]
              break
            }
            case 5: {
              texte = `Traduire l'égalité  $${nomF}(${x})=${y}$ par une phrase.`
              //  texte += '<br>Une ou plusieurs réponses correctes.'
              texteCorr = `L'égalité  $${nomF}(${x})=${y}$ se traduit par : <br>
            $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(y)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
            `
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: true },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${y}$ est un antécédent de $${x}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
                {
                  texte: ` $${x}$ a pour image $${y}$ par la fonction $${nomF}$.`,
                  statut: true,
                },
                {
                  texte: ` $${y}$ a pour image  $${x}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
                {
                  texte: `$${x}$ a pour antécédent $${y}$ par la fonction $${nomF}$.`,
                  statut: false,
                },
              ]
              break
            }
          }
          break
        case 2: // 'Traduire une phrase par une égalité':
          x = randint(-9, 9, [0, 1, -1])
          y = randint(-9, 9, x)
          switch (choixDesQuestions[1][indice[1]]) {
            case 0: {
              texte = `L'image de $${x}$ par la fonction $${nomF}$ est $${y}$.<br>
            Traduire cette phrase par une égalité.`
              break
            }
            case 1: {
              texte = ` $${x}$ est un antécédent de $${y}$ par la fonction $${nomF}$.<br>
            Traduire cette phrase par une égalité.`
              break
            }
            case 2: {
              texte = ` $${y}$ a pour antécédent  $${x}$ par la fonction $${nomF}$.<br>
            Traduire cette phrase par une égalité.`
              break
            }
            case 3: {
              texte = ` $${y}$ est l'image de  $${x}$ par la fonction $${nomF}$.<br>
            Traduire cette phrase par une égalité.`
              break
            }
            case 4: {
              texte = ` Un antécédent de $${y}$ par la fonction $${nomF}$ est  $${x}$.<br>
            Traduire cette phrase par une égalité.`

              break
            }
          }
          texteCorr = `L'égalité traduisant cette phrase est : $${miseEnEvidence(`${nomF}(${x})=${y}`)}$.
            `
          this.autoCorrection[i] = {
            options: { ordered: false, vertical: false },
          }
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${nomF}(${x})=${y}$`,
              statut: true,
            },
            {
              texte: `$${nomF}(${y})=${x}$`,
              statut: false,
            },
          ]
          break

        case 3: // 'Interprétation graphique':
          x = randint(-4, 4, [0, 1, -1])
          y = randint(-3, 3, x)
          switch (choixDesQuestions[2][indice[2]]) {
            case 0: {
              PointC = choice(['A', 'B', 'C', 'D', 'M', 'R', 'S', 'T'])

              A = pointAbstrait(x, y, `${PointC}`)
              A.positionLabel = 'above'
              d = droiteParPointEtPente(A, randint(-3, 3, 0) / 2, '', 'red')
              d.epaisseur = 3
              A.epaisseur = 3
              t = tracePoint(A, bleuMathalea)
              t.epaisseur = 2

              texte = `La fonction $${nomF}$ est représentée par la droite rouge ci-dessous.<br>
            Le point $${PointC}$ est sur la droite. Donner l'égalité correspondante.<br>`
              texte += mathalea2d(
                {
                  xmin: -5.1,
                  ymin: -4.1,
                  xmax: 5.1,
                  ymax: 4.1,
                  pixelsParCm: 30,
                  scale: 0.7,
                },
                r,
                d,
                o,
                t,
                labelPoint(A),
              )
              texteCorr = `L'égalité traduisant que $${PointC}$ est sur la courbe représentant $${nomF}$ est : $${miseEnEvidence(`${nomF}(${x})=${y}`)}$.`
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: false },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nomF}(${x})=${y}$`,
                  statut: true,
                },
                {
                  texte: `$${nomF}(${y})=${x}$`,
                  statut: false,
                },
              ]
              break
            }
            case 1: {
              PointC = choice(['A', 'B', 'C', 'D', 'M', 'R', 'S', 'T'])

              texte = `Le point $${PointC}(${x}\\;;\\;${y})$  est un point de la courbe représentant la fonction $${nomF}$.<br>
              Donner l'égalité correspondante.`
              texteCorr = `L'égalité traduisant que $${PointC}$ est sur la courbe représentant $${nomF}$ est : $${miseEnEvidence(`${nomF}(${x})=${y}`)}$.`
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: false },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nomF}(${x})=${y}$`,
                  statut: true,
                },
                {
                  texte: `$${nomF}(${y})=${x}$`,
                  statut: false,
                },
              ]
              break
            }
            case 2: {
              PointC = choice(['A', 'B', 'C', 'D', 'M', 'R', 'S', 'T'])

              texte = ` La courbe représentant la fonction $${nomF}$ passe par le point $${PointC}(${x}\\;;\\;${y})$.<br>
              Donner l'égalité correspondante. `
              texteCorr = `L'égalité traduisant que $${PointC}$ est sur la courbe représentant $${nomF}$ est : $${miseEnEvidence(`${nomF}(${x})=${y}`)}$.`
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: false },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nomF}(${x})=${y}$`,
                  statut: true,
                },
                {
                  texte: `$${nomF}(${y})=${x}$`,
                  statut: false,
                },
              ]
              break
            }
            case 3: {
              PointC = choice(['A', 'B', 'C', 'D', 'M', 'R', 'S', 'T'])

              texte = `
           Les coordonnées du point $${PointC}$ de la courbe représentant $${nomF}$ vérifient $${nomF}(${x})=${y}$.<br>
           Quelles sont les coordonnées du point $${PointC}$ ? `
              texteCorr = `L'égalité $${nomF}(${x})=${y}$ permet d'affirmer que le point  $${miseEnEvidence(`${PointC}(${x}\\;;\\;${y})`)}$ est sur la courbe représentant $${nomF}$.`
              this.autoCorrection[i] = {
                options: { ordered: false, vertical: false },
              }
              this.autoCorrection[i].enonce = `${texte}\n`
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${PointC}(${x}\\;;\\;${y})$`,
                  statut: true,
                },
                {
                  texte: `$${PointC}(${y};${x})$`,
                  statut: false,
                },
              ]
            }
          }
          break

        case 4: // 'Expression littérale':
          x = randint(-9, 9, [0, 1, -1])
          y = randint(-9, 9, x)

          listeFonction = [
            `${x}x`,
            `${x}x^2`,
            `${reduireAxPlusB(x, y)}`,
            `${reduirePolynomeDegre3(0, x, 0, y)}`,
          ]
          fonction1 = choice(listeFonction)
          if (!this.interactif && !context.isAmc) {
            switch (choixDesQuestions[3][indice[3]]) {
              case 0: {
                texte = `$x$ a pour image $${fonction1}$ par la fonction $${nomF}$.<br>
              Traduire cette phrase par une égalité.`
                break
              }
              case 1: {
                texte = ` L'image de $x$ par la fonction $${nomF}$ est $${fonction1}$.<br>
              Traduire cette phrase par une égalité.`
                break
              }
              case 2: {
                texte = `Par la fonction $${nomF}$, $${fonction1}$ est l'image de $x$.<br>
              Traduire cette phrase par une égalité.`
                break
              }
              case 3: {
                texte = ` $${fonction1}$ est l'image de  $x$ par la fonction $${nomF}$.<br>
              Traduire cette phrase par une égalité.`
                break
              }
              case 4: {
                texte = ` La fonction $${nomF}$ associe, à tout nombre $x$, le nombre $${fonction1}$.<br>
              Traduire cette phrase par une égalité.`
                break
              }
            }
            texteCorr = `L'égalité traduisant cette phrase est : $${miseEnEvidence(`${nomF}(x)=${fonction1}`)}$.`
          } else {
            switch (choixDesQuestions[3][indice[3]]) {
              case 0: {
                texte = `$x$ a pour image $${fonction1}$ par la fonction $${nomF}$.<br>
             Alors :`
                //  texte += '<br>Une ou plusieurs réponses correctes.'
                this.autoCorrection[i] = {
                  options: { ordered: false, vertical: true },
                }
                this.autoCorrection[i].enonce = `${texte}\n`
                this.autoCorrection[i].propositions = [
                  {
                    texte: `$${nomF}(x)=${fonction1}$`,
                    statut: true,
                  },
                  {
                    texte: `$x$ est l'image de $${fonction1}$ par la fonction $${nomF}$`,
                    statut: false,
                  },
                  {
                    texte: `Par la fonction $${nomF}$,  $${fonction1}$ a pour image $x$. `,
                    statut: false,
                  },
                ]
                texteCorr = `$x$ a pour image $${fonction1}$ par la fonction $${nomF}$.<br>
              Alors :<br>
              $${miseEnEvidence(`${nomF}(x)=${fonction1}`)}$
              `
                break
              }
              case 1: {
                texte = ` L'image de $x$ par la fonction $${nomF}$ est $${fonction1}$.<br>
              Alors :`
                //  texte += '<br>Une ou plusieurs réponses correctes.'
                this.autoCorrection[i] = {
                  options: { ordered: false, vertical: true },
                }
                this.autoCorrection[i].enonce = `${texte}\n`
                this.autoCorrection[i].propositions = [
                  {
                    texte: `$${nomF}(${fonction1})=x$`,
                    statut: false,
                  },
                  {
                    texte: `$x$ a pour image $${fonction1}$ par la fonction $${nomF}$`,
                    statut: true,
                  },
                  {
                    texte: `Par la fonction $${nomF}$,  $x$ est l'image de $${fonction1}$. `,
                    statut: false,
                  },
                ]
                texteCorr = ` L'image de $x$ par la fonction $${nomF}$ est $${fonction1}$.<br>
              Alors :<br>
              $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(fonction1)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
              `
                break
              }
              case 2: {
                texte = `Par la fonction $${nomF}$, $${fonction1}$ est l'image de $x$.<br>
              Alors :`
                //  texte += '<br>Une ou plusieurs réponses correctes.'
                this.autoCorrection[i] = {
                  options: { ordered: false, vertical: true },
                }
                this.autoCorrection[i].enonce = `${texte}\n`
                this.autoCorrection[i].propositions = [
                  {
                    texte: `$${nomF}(x)=${fonction1}$`,
                    statut: true,
                  },
                  {
                    texte: `$x$ a pour image $${fonction1}$ par la fonction $${nomF}$`,
                    statut: true,
                  },
                  {
                    texte: `L'image de $${fonction1}$ par la fonction $${nomF}$ est $x$`,
                    statut: false,
                  },
                ]
                texteCorr = `Par la fonction $${nomF}$, $${fonction1}$ est l'image de $x$.<br>
              Alors :<br>
               $\\bullet$ $${miseEnEvidence(nomF)}(x)=${miseEnEvidence(fonction1)}$, <br>
              $\\bullet$ $${miseEnEvidence(x)}$${texteEnCouleurEtGras(` a pour image `)}$${miseEnEvidence(fonction1)}$${texteEnCouleurEtGras(` par la fonction `)}$${miseEnEvidence(nomF)}$.
              `
                break
              }
            }
          }
          break
      }
      if (this.interactif) {
        texte += propositionsQcm(this, i).texte
      }
      if (this.questionJamaisPosee(i, x, y)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        indice[(typeDeQuestions[i] as number) - 1]++
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
