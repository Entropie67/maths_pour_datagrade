import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Lire des abscisses décimales sous trois formes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '06/11/2025'
/**
 * @author Jean-claude Lhote (sauf erreur de ma part)
 * Amélioré par Éric Elter
 * Trois points sont placés sur un droite graduée
 * Il faut donner leur abscisse respective
 * Trois formes sont demandées : décimale, fraction décimale, décomposition partie entière + partie décimale fractionnaire.
 */
export const uuid = '12773'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class LireAbscisseDecimaleTroisFormes extends Exercice {
  niveau: string
  vspace: number // espace vertical entre les questions pourqoi en faire une propriété de l'exo ? aschant que le seul clone existant ne modifie pas cette valeur ?
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Au dixième\n2 : Au centième\n3 : Au millième',
    ]
    this.niveau = 'sixième'

    if (context.isHtml) {
      this.spacing = 2
      this.spacingCorr = 3
    }
    this.vspace = -1

    this.sup = 1
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let d1
      let extremite
      const noms = choisitLettresDifferentes(3, 'Q')
      let x1 = 0
      let x2 = 0
      let x3 = 0
      let thickOff
      let tableau = []
      let xmin
      let xmax
      let unite
      if (this.sup === 1) {
        if (this.niveau === 'CM') {
          xmin = 0
          thickOff = 0
        } else {
          xmin = randint(1, 15)
          thickOff = 2 / 10 ** this.sup
        }
        if (xmin === 0) extremite = '|->'
        else extremite = '->'
        xmax = xmin + 9
        x1 = xmin * 10 + randint(0, 2) * 10 + randint(2, 8)
        x2 = xmin * 10 + randint(3, 5) * 10 + randint(2, 8)
        x3 = xmin * 10 + randint(6, 8) * 10 + randint(2, 8)
        x1 = x1 / 10
        x2 = x2 / 10
        x3 = x3 / 10

        tableau = shuffle([x1, x2, x3])
        x1 = tableau[0]
        x2 = tableau[1]
        x3 = tableau[2]
        unite = 3
        d1 = droiteGraduee({
          x: 0,
          y: 0,
          Min: xmin,
          axePosition: 'H',
          Max: xmax,
          thickSec: true,
          thickTer: false,
          Unite: unite,
          thickOffset: thickOff,
          thickCouleur: 'black',
          axeCouleur: 'black',
          axeHauteur: 4,
          pointListe: [
            [x1, `${noms[0]}`],
            [x2, `${noms[1]}`],
            [x3, `${noms[2]}`],
          ],
          pointTaille: 6,
          pointOpacite: 0.8,
          pointCouleur: bleuMathalea,
          pointStyle: '|',
          pointEpaisseur: 2,
          axeStyle: extremite,
        })
      } else if (this.sup === 2) {
        if (this.niveau === 'CM') {
          xmin = 0
          thickOff = 0
        } else {
          xmin = randint(1, 15) - 0.1
          thickOff = 2 / 10 ** this.sup
        }
        if (xmin === 0) extremite = '|->'
        else extremite = '->'
        xmax = xmin + 1.5
        x1 = 10 + xmin * 100 + randint(1, 3) * 10 + randint(2, 8)
        x2 = 10 + xmin * 100 + randint(4, 6) * 10 + randint(2, 8)
        x3 = 10 + xmin * 100 + randint(7, 9) * 10 + randint(2, 8)

        x1 = x1 / 100
        x2 = x2 / 100
        x3 = x3 / 100
        tableau = shuffle([x1, x2, x3])
        x1 = tableau[0]
        x2 = tableau[1]
        x3 = tableau[2]
        unite = 20
        d1 = droiteGraduee({
          x: 0,
          y: 0,
          Min: xmin,
          axePosition: 'H',
          Max: xmax,
          thickSec: true,
          thickTer: true,
          Unite: unite,
          thickOffset: thickOff,
          thickCouleur: 'black',
          axeCouleur: 'black',
          axeHauteur: 4,
          pointListe: [
            [x1, `${noms[0]}`],
            [x2, `${noms[1]}`],
            [x3, `${noms[2]}`],
          ],
          pointTaille: 6,
          pointOpacite: 0.8,
          pointCouleur: bleuMathalea,
          pointStyle: '|',
          pointEpaisseur: 2,
          axeStyle: extremite,
        })
      } else {
        // this.sup === 3
        if (this.niveau === 'CM') {
          xmin = 0
          thickOff = 0
        } else {
          xmin = randint(0, 15) + randint(0, 9) * 0.1
          thickOff = 2 / 10 ** this.sup
        }
        if (xmin === 0) extremite = '|->'
        else extremite = '->'
        xmax = xmin + 0.15

        x1 = xmin * 1000 + randint(1, 5) * 10 + randint(2, 8)
        x2 = xmin * 1000 + randint(6, 9) * 10 + randint(2, 8)
        x3 = xmin * 1000 + randint(11, 14) * 10 + randint(2, 8)
        x1 = x1 / 1000
        x2 = x2 / 1000
        x3 = x3 / 1000

        tableau = shuffle([x1, x2, x3])
        x1 = tableau[0]
        x2 = tableau[1]
        x3 = tableau[2]
        unite = 200
        d1 = droiteGraduee({
          x: 0,
          y: 0,
          Min: xmin,
          axePosition: 'H',
          Max: xmax,
          thickSec: true,
          thickTer: true,
          Unite: unite,
          thickOffset: thickOff,
          thickDistance: 0.1,
          thickSecDist: 0.01,
          thickTerDist: 0.001,
          thickCouleur: 'black',
          axeCouleur: 'black',
          axeHauteur: 4,
          pointListe: [
            [x1, `${noms[0]}`],
            [x2, `${noms[1]}`],
            [x3, `${noms[2]}`],
          ],
          labelListe: [[xmin + 0.09, stringNombre(xmin + 0.09, 2)]],
          pointTaille: 6,
          pointOpacite: 0.8,
          pointCouleur: bleuMathalea,
          pointStyle: '|',
          pointEpaisseur: 2,
          axeStyle: extremite,
        })
      }
      const texte1 = `${numAlpha(0)} Donner l'abscisse de $${noms[0]}$ en écriture décimale.`
      texte =
        texte1 +
        ajouteChampTexteMathLive(this, i * 3, KeyboardType.clavierNumbers, {
          texteAvant: `${sp(10)} $${noms[0]}($`,
          texteApres: `$${sp(1)})$`,
        })
      texte +=
        `<br>${numAlpha(1)} Donner l'abscisse de $${noms[1]}$ comme la somme d'un nombre entier et d'une fraction décimale inférieure à $1$.` +
        ajouteChampTexteMathLive(
          this,
          i * 3 + 1,
          KeyboardType.clavierDeBaseAvecFraction,
          {
            texteAvant: `${sp(10)} $${noms[1]}($`,
            texteApres: `$${sp(1)})$`, // `$${sp(2)}+$`
          },
        )
      let texte3 = `Donner l'abscisse de $${noms[2]}$ sous la forme d'une fraction décimale.`
      texte +=
        `<br>${numAlpha(2)} ` +
        texte3 +
        ajouteChampTexteMathLive(
          this,
          i * 3 + 2,
          KeyboardType.clavierDeBaseAvecFraction,
          {
            texteAvant: `${sp(10)} $${noms[2]}($`,
            texteApres: `$${sp(1)})$`,
          },
        )
      texte3 = `${numAlpha(1)} ` + texte3
      const multiple = this.sup === 1 ? 10 : this.sup === 2 ? 100 : 1000
      texteCorr = `${numAlpha(0)} L'abscisse de $${noms[0]}$ est : $${miseEnEvidence(texNombre(x1, 3))}$.<br>`
      texteCorr += `${numAlpha(1)} L'abscisse de $${noms[1]}$ est : $${miseEnEvidence(`${texNombre(Math.floor(x2))} + ${new FractionEtendue(multiple * arrondi(x2 - Math.floor(x2)), multiple).toLatex()}`)}$.<br>`
      texteCorr += `${numAlpha(2)} L'abscisse de $${noms[2]}$ est : $${miseEnEvidence(new FractionEtendue(multiple * x3, multiple).toLatex())}$.`
      if (!context.isAmc) {
        handleAnswers(this, i * 3, { reponse: { value: x1 } })
        handleAnswers(this, i * 3 + 1, {
          reponse: {
            value: `${Math.floor(x2)}+${new FractionEtendue(multiple * arrondi(x2 - Math.floor(x2)), multiple).toLatex()}`,
            options: { expressionNumerique: true },
          },
        })
        handleAnswers(this, i * 3 + 2, {
          reponse: {
            value: new FractionEtendue(multiple * x3, multiple),
            options: { fractionDecimale: true },
          },
        })
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: '', // on le remplira à la fin.
          options: { multicols: true, barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  statut: '',
                  reponse: {
                    texte: texte1,
                    valeur: x1,
                    param: {
                      digits: nombreDeChiffresDe(x1),
                      decimals: nombreDeChiffresDansLaPartieDecimale(x1),
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: texte3,
                    valeur: new FractionEtendue(multiple * x3, multiple),
                    param: {
                      digitsNum:
                        nombreDeChiffresDansLaPartieEntiere(multiple * x3) + 1,
                      digitsDen: 5,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `${numAlpha(2)} Donner la partie entière de l'abscisse de $${noms[1]}$.`,
                    valeur: Math.floor(x2),
                    param: {
                      digits:
                        nombreDeChiffresDansLaPartieEntiere(Math.floor(x2)) + 1,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `${numAlpha(3)} Donner la partie décimale de l'abscisse de $${noms[1]}$.`,
                    valeur: new FractionEtendue(
                      multiple * (x2 - Math.floor(x2)),
                      multiple,
                    ),
                    param: {
                      digitsNum: nombreDeChiffresDansLaPartieEntiere(
                        multiple * (x2 - Math.floor(x2)),
                      ),
                      digitsDen: 4,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      const textedroite =
        '<br>' +
        mathalea2d(
          {
            xmin: -1.5,
            xmax: (xmax - xmin) * unite + 1.5, // la longueur totale de l'axe flèche comprise+ 1,
            ymin: -1.5,
            ymax: 1.5,
            pixelsParCm: 25,
            scale: 0.5,
          },
          d1,
        )
      texte += textedroite
      if (context.isAmc) {
        this.autoCorrection[i].enonce =
          'À partir de la droite graduée ci-dessous, répondre aux questions ci-dessous.' +
          textedroite
      }
      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
