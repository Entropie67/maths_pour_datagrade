import { tableauColonneLigne } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Trouver un ordre de grandeur d'opérations sur les décimaux"
export const interactifReady = true

/**
 * * Ordre de grandeur d'une opération entre décimaux
 * @author Sébastien Lozano
 */

export const dateDeModifImportante = '31/10/2026' // suppression de coquilles, nettoyage du code et interactivité. Jean-claude Lhote
export const uuid = '843e5'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['PR-32'],
}
// une fonction pour ordre de grandeur en fonction de ... opération 1
function myOrdreOpe1(c: number, d: number) {
  if (c * d > 50000) {
    return ['', '', '', '', '', `${miseEnEvidence('\\text{X}')}`]
  } else {
    return ['', '', '', '', `${miseEnEvidence('\\text{X}')}`, '']
  }
}
// une fonction pour ordre de grandeur en fonction de ... opération 2
function myOrdreOpe2(c1: number, c2: number) {
  if (c1 + c2 >= 500) {
    return ['', '', '', `${miseEnEvidence('\\text{X}')}`, '', '']
  } else {
    return ['', '', `${miseEnEvidence('\\text{X}')}`, '', '', '']
  }
}
// une fonction pour ordre de grandeur en fonction de ... opération 3
function myOrdreOpe3(n: number) {
  if (n > 500) {
    return ['', '', '', `${miseEnEvidence('\\text{X}')}`, '', '']
  } else {
    return ['', '', `${miseEnEvidence('\\text{X}')}`, '', '', '']
  }
}
// une fonction pour ordre de grandeur en fonction de ... opération 5
function myOrdreOpe5(mult: number) {
  switch (mult) {
    case 1:
      return ['', '', '', `${miseEnEvidence('\\text{X}')}`, '', '']
    case 10:
      return ['', '', `${miseEnEvidence('\\text{X}')}`, '', '', '']
    case 100:
      return ['', `${miseEnEvidence('\\text{X}')}`, '', '', '', '']
    case 1000:
    default:
      return [`${miseEnEvidence('\\text{X}')}`, '', '', '', '', '']
  }
}
// une fonction pour ordre de grandeur en fonction de ... opération 4
function myOrdreOpe4(d: number, n: number) {
  switch (d) {
    case 0.1:
      if (n > 5000) {
        return ['', '', '', `${miseEnEvidence('\\text{X}')}`, '', '']
      } else {
        return ['', '', `${miseEnEvidence('\\text{X}')}`, '', '', '']
      }
    case 0.01:
      if (n > 5000) {
        return ['', '', `${miseEnEvidence('\\text{X}')}`, '', '', '']
      } else {
        return ['', `${miseEnEvidence('\\text{X}')}`, '', '', '', '']
      }
    case 0.001:
    default:
      if (n > 5000) {
        return ['', `${miseEnEvidence('\\text{X}')}`, '', '', '', '']
      } else {
        return [`${miseEnEvidence('\\text{X}')}`, '', '', '', '', '']
      }
  }
}
export default class OrdreDeGrandeurOperationsDecimaux extends Exercice {
  declare sup: number
  declare sup2: number

  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'choix des opérations ',
      'Nombres séparés par des tirets  :\n : Produit\n2 : Somme\n3 : Différence\n4 : multiplication par 0,1 ; 0,01 ; 0,001\n5 : Quotient\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = ['Nombre de ligne dans le tableau', 5]
    this.nbQuestions = 1

    this.consigne =
      "Pour chaque opération proposée dans la première colonne, cocher la case correspondant à l'ordre de grandeur du résultat."
    this.sup = 6
    this.sup2 = 3

    // this.nbQuestionsModifiable = false;
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: String(this.sup),
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.sup2,
    })

    // let listeTypeDeQuestions  = combinaisonListes(typesDeQuestionsDisponibles,this.nbQuestions) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let nb11 = 0,
      nb21 = 0,
      nb31 = 0,
      nb41 = 0,
      nb51 = 0
    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const ligneEntete = [
        '\\text{Opération}',
        '\\phantom{000}' + texNombre(1) + '\\phantom{000}',
        '\\phantom{00}' + texNombre(10) + '\\phantom{00}',
        '\\phantom{00}' + texNombre(100) + '\\phantom{00}',
        '\\phantom{0}' + texNombre(1000) + '\\phantom{0}',
        texNombre(10000),
        texNombre(100000),
      ]
      const calculs = []
      const tabLignesVides = []
      const tabEntetesLignes = []
      const tabEntetesLignesCorr = []
      const coches = []
      for (let j = 0; j < this.sup2; j++) {
        const m = randint(1, 9, [4, 5, 6])
        const c1 = randint(1, 9, 5)
        const c2 = randint(1, 9, 5)
        const c3 = randint(1, 9, [4, 5, 6])
        const c4 = randint(1, 4)
        const d = randint(1, 9)
        const d1 = randint(1, 9)
        const d2 = randint(1, 9)
        const d3 = randint(1, 9)
        const u = randint(1, 9)
        const u1 = randint(1, 9)
        const u2 = randint(1, 9)
        const u3 = randint(1, 9)

        let cbis, d1bis
        do {
          cbis = randint(2, 9)
          d1bis = randint(2, 9)
        } while (cbis * d1bis > 3 && cbis * d1bis < 7)

        const divAleatoireOpe3 = choice([10, 100])
        const divAleatoireOpe5 = choice([1, 10, 100, 1000])
        const multAleatoireOpe4 = choice([0.1, 0.01, 0.001])
        nb11 = cbis * 100 + d * 10 + u
        const nb11Rounded = (cbis + (d > 4 ? 1 : 0)) * 100
        const nb12 = d1bis * 10 + u1
        const nb12Rounded = (d1bis + (u1 > 4 ? 1 : 0)) * 10
        nb21 = (c2 * 100 + d2 * 10 + u1) / 10
        const nb21Rounded = 10 * (c2 + (d2 > 4 ? 1 : 0))
        const nb22 = c1 * 100 + d1 * 10 + u1
        const nb22Rounded = 100 * (c1 + (d1 > 4 ? 1 : 0))
        nb31 = c3 * 100 + d3 * 10 + u3
        const nb31Rounded = 100 * (c3 + (d3 > 4 ? 1 : 0))
        const nb32 = (c2 * 100 + d2 * 10 + u2) / divAleatoireOpe3
        const nb32Rounded = (100 * (c2 + (d2 > 4 ? 1 : 0))) / divAleatoireOpe3
        nb41 = m * 1000 + c3 * 100 + d2 * 10 + u1
        const nb41Rounded = 1000 * (m + (c3 > 4 ? 1 : 0))
        nb51 = (m * 1000 + c4 * 100 + d3 * 10 + u) / divAleatoireOpe5
        const nb51Rounded = (1000 * (m + (c4 > 4 ? 1 : 0))) / divAleatoireOpe5
        const situations = [
          {
            operation: `${nb11}\\times ${nb12}`,
            operation_corr: `${nb11}\\times ${nb12} \\approx  ${texNombre(nb11Rounded)}\\times ${nb12Rounded} \\text{, soit } ${texNombre(nb11Rounded * nb12Rounded, 0)}`,
            operation_coche: myOrdreOpe1(nb11Rounded, nb12Rounded),
          },
          {
            operation: `${texNombre(nb21, 1)}+${nb22}`,
            operation_corr: `${texNombre(nb21, 1)}+${nb22} \\approx ${nb21Rounded}+${texNombre(nb22Rounded)} \\text{, soit } ${texNombre(nb21Rounded + nb22Rounded)}`,
            operation_coche: myOrdreOpe2(nb21Rounded, nb22Rounded),
          },
          {
            operation: `${nb31}-${texNombre(nb32, 2)}`,
            operation_corr: `${nb31}-${texNombre(nb32, 2)} \\approx ${texNombre(nb31Rounded)}-${nb32Rounded} \\text{, soit } ${nb31Rounded - nb32Rounded}`,
            operation_coche: myOrdreOpe3(nb31Rounded - nb32Rounded),
          },
          {
            operation: `${texNombre(nb41)}\\times ${texNombre(multAleatoireOpe4, 3)}`,
            operation_corr: `${texNombre(nb41, 0)}\\times ${texNombre(multAleatoireOpe4, 3)} \\approx ${texNombre(nb41Rounded)}\\times ${texNombre(multAleatoireOpe4, 3)} \\text{, soit } ${texNombre(nb41Rounded * multAleatoireOpe4, 0)}`,
            operation_coche: myOrdreOpe4(multAleatoireOpe4, nb41Rounded),
          },
          {
            operation: `${texNombre(nb51, 3)}\\div ${m}`,
            operation_corr: `${texNombre(nb51, 3)}\\div ${m} \\approx ${texNombre(nb51Rounded, 3)}\\div ${m} \\text{, soit } ${texNombre(nb51Rounded / m, 0)}`,
            operation_coche: myOrdreOpe5(divAleatoireOpe5),
          },
        ]
        calculs.push(situations[Number(listeTypeDeQuestions[j]) - 1])
        tabEntetesLignes.push(calculs[j].operation)
        tabEntetesLignesCorr.push(calculs[j].operation_corr)
        coches.push(
          calculs[j].operation_coche[0],
          calculs[j].operation_coche[1],
          calculs[j].operation_coche[2],
          calculs[j].operation_coche[3],
          calculs[j].operation_coche[4],
          calculs[j].operation_coche[5],
        )
        tabLignesVides.push('', '', '', '', '', '')
      }
      const tabValue = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        ligneEntete,
        tabEntetesLignes,
        tabLignesVides,
      )
      const tableau = AddTabDbleEntryMathlive.create(
        this.numeroExercice,
        i,
        tabValue,
        'tableauMathlive',
        this.interactif,
        {},
      )
      const material = {
        enonce: tableau.output,
        question: '',
        correction: `
          Commençons par calculer un ordre de grandeur du résultat de chaque opération dans la première colonne du tableau.<br>
          ${tableauColonneLigne(ligneEntete, tabEntetesLignesCorr, coches)}`,
      }
      const reponses: Record<string, { value: string }> = {}
      coches.forEach((el, index) => {
        if (el !== '') {
          reponses[`L${Math.floor(index / 6) + 1}C${(index % 6) + 1}`] = {
            value: '\\times',
          }
        }
      })
      handleAnswers(this, i, reponses)
      texte = `${material.enonce}`
      texteCorr = `${material.correction}`

      if (this.questionJamaisPosee(i, nb11, nb21, nb31, nb41, nb51)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
