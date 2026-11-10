import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import {
  choice,
  combinaisonListes,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lier nombre décimal, fraction spécifique et pourcentage'
export const dateDePublication = '04/06/2025'
export const dateDeModifImportante = '17/12/2026'

export const interactifReady = true

/**
 * Lier nombre décimal, fraction spécifique et pourcentage
 * @author Éric Elter
 */

export const uuid = '13f50'

export const refs = {
  'fr-fr': ['6N1E-1'],
  'fr-2016': ['6N23-11'],
  'fr-ch': ['9R1NO4G-3', '9R2NO4G-3', '9R3NO4G-3', 'PRQNO11B-3'],
}
export default class DecimalFractionPourcentage extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de fractions désirées',
      [
        'Nombres séparés par des tirets  :',
        '1 : 1/4',
        '2 : 1/2',
        '3 : 3/4',
        '4 : 1/10',
        '5 : 1/5',
        '6 : 3/10',
        '7 : 2/5',
        '8 : 5/10',
        '9 : 3/5',
        '10 : 7/10',
        '11 : 4/5',
        '12 : 9/10',
        '13 : Mélange',
      ].join('\n'),
    ]

    this.sup = 13
    this.nbQuestions = 1
    this.consigne =
      'Dans chaque colonne de ce tableau, il y a un unique nombre exprimé sous $3$ formes différentes.<br>Compléter ce tableau.'
    this.comment =
      'Le tableau contiendra toujours 6 colonnes.<br>Un paramètre permettra de choisir des fractions.<br>'
    this.comment +=
      "Si vous en choisissez plus que 6, alors un choix aléatoire sera fait parmi les fractions choisies pour n'en garder que 6.<br>"
    this.comment +=
      'Si vous en choisissez moins que 6, alors un choix aléatoire sera fait parmi les fractions non choisies pour compléter jusque 6 fractions.'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Dans chaque colonne de ce tableau, il y a un unique nombre exprimé sous $3$ formes différentes.<br>Compléter ce tableau.'
        : 'Dans chaque colonne de ces tableaux, il y a un unique nombre exprimé sous $3$ formes différentes.<br>Compléter les tableaux suivants.'
    const numerateursSpecifiques = [
      25, 50, 75, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    ]

    let numerateur = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 12,
      defaut: 13,
      melange: 13,
      nbQuestions: 6,
      listeOfCase: numerateursSpecifiques,
    }).map(Number)

    numerateur = enleveDoublonNum(numerateur)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      numerateur = shuffle(numerateur)
      const longueurListe = numerateur.length
      if (longueurListe < 6) {
        for (let i = longueurListe; i < 6; i++) {
          numerateur.push(choice(numerateursSpecifiques, numerateur))
        }
      }

      const nbfractionDecimaleEtPourcentage = function (i: number) {
        const nbNum = numerateur[i]
        return {
          decimal: texNombre(arrondi(nbNum / 100)),
          fractionDecimale: new FractionEtendue(nbNum, 100).simplifie()
            .texFraction,
          pourcentage: texNombre(nbNum),
        }
      }
      const nbDecimal = []
      const nbDecimalCorr = []
      const nbDecimalCorrNu = []
      const pourcentage = []
      const pourcentageCorr = []
      const pourcentageCorrNu = []
      const fractionDecimale = []
      const fractionDecimaleCorr = []
      const fractionDecimaleCorrNu = []
      const typeLignes = combinaisonListes([0, 1, 2], 6)
      const pourEviterDeuxExosIdentiques = []
      for (let k = 0; k < 6; k++) {
        const nb = nbfractionDecimaleEtPourcentage(k)
        pourEviterDeuxExosIdentiques.push(nb.pourcentage)
        const lig = typeLignes[k]
        nbDecimalCorrNu.push(nb.decimal)
        pourcentageCorrNu.push(nb.pourcentage + sp() + '\\%')
        fractionDecimaleCorrNu.push(nb.fractionDecimale)
        if (lig === 0) {
          nbDecimal.push(this.interactif ? '' : '\\phantom{rrrrr}')
          nbDecimalCorr.push(miseEnEvidence(nb.decimal))
          pourcentage.push(nb.pourcentage + sp() + '\\%')
          pourcentageCorr.push(nb.pourcentage + sp() + '\\%')
          fractionDecimale.push(this.interactif ? '' : '\\phantom{rrrrr}')
          fractionDecimaleCorr.push(miseEnEvidence(nb.fractionDecimale))
        } else if (lig === 1) {
          nbDecimal.push(nb.decimal)
          nbDecimalCorr.push(nb.decimal)
          pourcentage.push(this.interactif ? '' : '\\phantom{rrrrr}\\%')
          pourcentageCorr.push(miseEnEvidence(nb.pourcentage) + sp() + '\\%')
          fractionDecimale.push(this.interactif ? '' : '\\phantom{rrrrr}')
          fractionDecimaleCorr.push(miseEnEvidence(nb.fractionDecimale))
        } else {
          nbDecimal.push(this.interactif ? '' : '\\phantom{rrrrr}')
          nbDecimalCorr.push(miseEnEvidence(nb.decimal))
          fractionDecimale.push(nb.fractionDecimale)
          fractionDecimaleCorr.push(nb.fractionDecimale)
          pourcentage.push(this.interactif ? '' : '\\phantom{rrrrr}\\%')
          pourcentageCorr.push(miseEnEvidence(nb.pourcentage) + sp() + '\\%')
        }
      }
      const enonces = []
      enonces.push({
        tabEntetesColonnes: [],
        tabEntetesLignes: [
          '\\text{Nombre décimal}',
          '\\text{Fraction}',
          '\\text{Pourcentage}',
        ],
        tabLines: nbDecimal.concat(fractionDecimale).concat(pourcentage),
        tabLinesCorr: nbDecimalCorrNu
          .concat(fractionDecimaleCorrNu)
          .concat(pourcentageCorrNu),
        enonce: `${tableauColonneLigne(
          [],
          ['\\text{Nombre décimal}', '\\text{Fraction}', '\\text{Pourcentage}'],
          nbDecimal.concat(fractionDecimale).concat(pourcentage),
          2.5,
          true,
        )}`,
        correction: `${tableauColonneLigne(
          [],
          ['\\text{Nombre décimal}', '\\text{Fraction}', '\\text{Pourcentage}'],
          nbDecimalCorr.concat(fractionDecimaleCorr).concat(pourcentageCorr),
          2.5,
          true,
        )}`,
      })
      let objetReponse = {}
      for (let i = 0; i < enonces[0].tabLines.length; i++) {
        if (enonces[0].tabLines[i] === '') {
          const ligne = Math.floor(i / 6)
          const colonne = i % 6
          const ref = `L${ligne + 1}C${colonne + 1}`
          const valeur = Object.assign(
            {},
            {
              value:
                ligne === 2
                  ? `${enonces[0].tabLinesCorr[i]}`.slice(0, 2)
                  : `${enonces[0].tabLinesCorr[i]}`,
              options:
                ligne === 1
                  ? { fractionEgale: true }
                  : { nombreDecimalSeulement: true },
            },
          )
          const cellule = Object.fromEntries([[ref, valeur]])
          objetReponse = Object.assign(objetReponse, cellule)
        }
      }

      objetReponse = Object.assign(objetReponse, {
        bareme: (listePoints: number[]) => {
          return [
            Math.floor(listePoints.reduce((a, b) => a + b / 2, 0)),
            listePoints.length / 2,
          ]
        },
      })
      handleAnswers(this, i, objetReponse)

      if (this.interactif) {
        const tableau = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          enonces[0].tabEntetesColonnes,
          enonces[0].tabEntetesLignes,
          enonces[0].tabLines,
        )
        for (let j = 0; j < tableau.raws[2].length; j++) {
          if (tableau.raws[2][j].texte === '')
            Object.assign(tableau.raws[2][j], {
              options: { texteApres: '$~\\%$' },
            })
        }
        const leTableau = AddTabDbleEntryMathlive.create(
          this.numeroExercice ?? 0,
          i,
          tableau,
          `tableauMathlive ${KeyboardType.clavierDeBaseAvecFraction}`,
          true,
          {},
        )
        texte = leTableau.output
      } else {
        texte = `${enonces[0].enonce}`
      }
      texteCorr = `${enonces[0].correction}`

      if (this.questionJamaisPosee(i, ...pourEviterDeuxExosIdentiques)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
