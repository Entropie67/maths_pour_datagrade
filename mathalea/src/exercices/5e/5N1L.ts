import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { cribleEratostheneN } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Justifier la primalité ou pas'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Justifier la non primalité réinvestissement des critères de divisibilité
 * Nombres à 3 ou 4 chiffres, un multiple de 2, de 3, de 5, de 7, de 9, de 10, sous forme d'un produit de deux nombres premiers inférieurs à 30
 * et un nombre premier inferieur à 529
 * 5A12-1
 * @author Sébastien Lozano
 */
export const uuid = '36074'

export const refs = {
  'fr-fr': ['5N1L'],
  'fr-2016': ['5A12-1'],
  'fr-ch': ['9R2NO1F-4', '9R3NO1F-4', '10CTNO1A-4', 'PRQNO09B-7'],
}
export default class PremierOuPas5e extends Exercice {
  constructor() {
    super()

    // pas de différence entre la version html et la version latex pour la consigne
    this.consigne = 'Justifier que les nombres suivants sont premiers ou pas.'
    // this.consigne += `<br>`;
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 7
    // this.correctionDetailleeDisponible = true;
    this.nbCols = 2

    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? this.nbQuestions > 1
        ? `Les nombres suivants sont-ils premiers${sp()}?`
        : `Le nombre suivant est-il premier${sp()}?`
      : this.nbQuestions > 1
        ? 'Justifier que les nombres suivants sont premiers ou pas.'
        : 'Justifier que le nombre suivant est premier ou pas.'
    let typesDeQuestions

    let typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7]
    typesDeQuestionsDisponibles = shuffle(typesDeQuestionsDisponibles) // on mélange l'ordre des questions

    // let typesDeQuestionsDisponibles = [1];
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]

      let N // le nombre de la question
      let bonneReponse
      switch (typesDeQuestions) {
        case 1: // nombre pair
          N = 2 * randint(51, 4999)
          texte = `$${texNombre(N)}$`
          texteCorr = `Comme $${texNombre(N)}$ est pair, il admet donc au moins trois diviseurs qui sont $1$, $2$ et lui-même, `
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 2: {
          // Multiple de 3
          let sum3 = 0 // pour la valeur de la somme;
          N = 3 * randint(34, 3333) // on initialise avant la boucle car on a peut être de la chance
          while (N % 2 === 0 || N % 5 === 0) {
            N = 3 * randint(34, 3333)
          }
          texte = `$${texNombre(N)}$`
          texteCorr = 'Comme $' + N.toString().charAt(0)
          sum3 = Number(N.toString().charAt(0))
          for (let k = 1; k < N.toString().length; k++) {
            texteCorr += ' + ' + N.toString().charAt(k)
            sum3 += Number(N.toString().charAt(k))
          }
          texteCorr += ` = ${sum3}$ est un multiple de $3$ donc $${texNombre(N)}$ aussi, il admet donc au moins trois diviseurs qui sont $1$, $3$ et lui-même, `
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        }
        case 3: // Multiple de 5
          N = 5 * randint(20, 1999)
          texte = `$${texNombre(N)}$`
          texteCorr = `Comme le dernier chiffre de $${texNombre(N)}$ est un $${N.toString().charAt(N.toString().length - 1)}$ alors $${texNombre(N)}$ est divisible par $5$, `
          texteCorr +=
            'il admet donc au moins trois diviseurs qui sont $1$, $5$ et lui-même, '
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 4: {
          // Multiple de 9
          let sum9 = 0 // pour la valeur de la somme;
          N = 9 * randint(12, 1111) // on initialise avant la boucle car on a peut être de la chance
          while (N % 2 === 0 || N % 5 === 0) {
            N = 9 * randint(34, 3333)
          }
          texte = `$${texNombre(N)}$`
          texteCorr = 'Comme $' + N.toString().charAt(0)
          sum9 = Number(N.toString().charAt(0))
          for (let k = 1; k < N.toString().length; k++) {
            texteCorr += ' + ' + N.toString().charAt(k)
            sum9 += Number(N.toString().charAt(k))
          }
          texteCorr += ` = ${sum9}$ est un multiple de $9$ donc $${texNombre(N)}$ aussi, il admet donc au moins trois diviseurs qui sont $1$, $9$ et lui-même, `
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        }
        case 5: // multiple de 10
          N = 10 * randint(10, 999)
          texte = `$${texNombre(N)}$`
          texteCorr = `Comme le nombre $${texNombre(N)}$ se termine par un $${N.toString().charAt(N.toString().length - 1)}$ alors $${texNombre(N)}$ est un multiple de $10$, `
          texteCorr +=
            'il admet donc au moins trois diviseurs qui sont $1$, $10$ et lui-même, '
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 6: {
          // produit de deux nombres premiers inférieurs à 30
          // rang du premier facteur premier
          const r1 = randint(0, cribleEratostheneN(30).length - 1)
          // rang du second facteur premier
          const r2 = randint(0, cribleEratostheneN(30).length - 1)
          const prime1 = cribleEratostheneN(100)[r1] // on tire un nombre premier inférieur à 100, il n'y en a que 25!
          const prime2 = cribleEratostheneN(100)[r2] // on tire un autre nombre premier inférieur à 100, ça peut être le même qu'avant!
          N = `$${prime1} \\times ${prime2}$`
          texte = N
          texteCorr = `${N} est le produit de $${prime1}$ et de $${prime2}$, il admet donc au moins `
          if (prime1 === prime2) {
            texteCorr += `trois diviseurs qui sont $1$, $${prime1}$ et lui-même ${N}=$${texNombre(prime1 * prime2)}$ `
          } else {
            texteCorr += `quatre diviseurs qui sont $1$, $${prime1}$, $${prime2}$ et lui-même ${N}=$${texNombre(prime1 * prime2)}$, `
          }
          texteCorr +=
            'donc ' +
            `${N} = ` +
            `$${texNombre(prime1 * prime2)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        }
        case 7:
        default: {
          // nombre premier inférieur à 29
          // rang du nombre premier choisi
          const r = randint(0, cribleEratostheneN(29).length - 1)
          N = cribleEratostheneN(29)[r] // on choisit un nombre premier inférieur à 29
          if (N <= 3) {
            texte = `$${texNombre(N)}$`
            texteCorr = `$${N}$ a exactement deux diviseurs${sp()}: $1$ et $${N}$.<br>`
            texteCorr +=
              'donc ' +
              `$\\mathbf{${N}}$` +
              ' ' +
              texteEnCouleurEtGras('est premier') +
              '.'
            bonneReponse = 'oui'
            break
          }
          const prems = cribleEratostheneN(29)
          const tabPremiersATester = []
          let rg = 0
          while (prems[rg] ** 2 < N) {
            tabPremiersATester.push(prems[rg])
            rg++
          }
          let stringNbCorr1 = ''
          if (tabPremiersATester.length === 1) {
            stringNbCorr1 = 'le nombre'
          } else {
            stringNbCorr1 = 'les nombres'
          }

          const tabPremiersToTest = cribleEratostheneN(N - 1)
          let stringNbCorr2 = ''
          if (tabPremiersToTest.length === 1) {
            stringNbCorr2 = 'le nombre'
          } else {
            stringNbCorr2 = 'les nombres'
          }

          texte = `$${texNombre(N)}$`
          texteCorr = `<b>Proposition de deux corrections valables${sp()}:</b> <br>`
          texteCorr += `<b>Proposition de correction $\\mathbf{1}$${sp()}:</b> <br>`
          texteCorr += `En effectuant la division euclidienne de $${texNombre(N)}$ par tous les nombres premiers dont le carré est inférieur à $${N}$, c'est-à-dire par ${stringNbCorr1} `
          texteCorr += `$${tabPremiersATester[0]}$`
          for (let k = 1; k < tabPremiersATester.length; k++) {
            texteCorr += ', ' + `$${tabPremiersATester[k]}$`
          }
          texteCorr += ", le reste n'est jamais nul."
          texteCorr +=
            '<br>' +
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras('est premier') +
            '.'
          texteCorr += '<hr>'
          texteCorr += `<b>Proposition de correction $\\mathbf{2}$${sp()}:</b> <br>`
          texteCorr += `En effectuant la division euclidienne de $${texNombre(N)}$ par tous les nombres premiers inférieurs à $${N}$, c'est-à-dire par ${stringNbCorr2} `
          texteCorr += `$${tabPremiersToTest[0]}$`
          for (let k = 1; k < tabPremiersToTest.length; k++) {
            texteCorr += ', ' + `$${tabPremiersToTest[k]}$`
          }
          texteCorr += ", le reste n'est jamais nul."
          texteCorr +=
            '<br>' +
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras('est premier') +
            '.'
          bonneReponse = 'oui'
          break
        }
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: true }
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: 'est premier',
          statut: bonneReponse !== 'non',
        },
        {
          texte: "n'est pas premier",
          statut: bonneReponse !== 'oui',
        },
      ]
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }

      if (this.questionJamaisPosee(i, texteCorr)) {
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
