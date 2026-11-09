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
export const titre = 'Indiquer si des nombres sont premiers ou pas'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Justifier la non primalité réinvestissement des critères de divisibilité
 * Nombres à 3 ou 4 chiffres, un multiple de 2, de 3, de 5, de 7, de 11, sous forme d'un produit de deux nombres premiers inférieurs à 100
 * et un nombre premier inferieur à 529
 * dans cet exo on n'utilise pas les critères par 7 et 11
 * @author Sébastien Lozano + Jean-claude Lhote pour l'interactivité.

 */
export const uuid = 'bba55'

export const refs = {
  'fr-fr': ['3A10-1'],
  'fr-ch': ['9R2NO1F-3', '9R3NO1F-3', '10CTNO1A-3', 'PRQNO09B-6'],
}
const prems = cribleEratostheneN(529) // constante contenant tous les nombres premiers jusqu'à 529...

export default class PremierOuPas extends Exercice {
  // rang maximal (dans la liste des nombres premiers) des premiers tirés avec l'option « que des nombres premiers inférieurs à 100 »
  protected rangMaxPremierCourt = 24

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Sans calculatrice\n2 : Avec calculatrice',
    ]
    this.besoinFormulaire3CaseACocher = [
      'Que des nombres premiers inférieurs à 100',
    ]
    // pas de différence entre la version html et la version latex pour la consigne
    this.spacing = context.isHtml ? 1 : 2
    this.spacingCorr = context.isHtml ? 2 : 1

    // this.correctionDetailleeDisponible = true;
    this.nbCols = 2

    this.nbQuestions = 5
    this.sup = 1
    this.sup3 = false
    // this.nbQuestionsModifiable = false (EE : bloquant pour AMC sinon)
  }

  nouvelleVersion() {
    this.consigne = !this.sup3
      ? this.nbQuestions > 1
        ? 'Justifier que les nombres suivants sont premiers ou pas.'
        : 'Justifier que le nombre suivant est premier ou pas.'
      : this.nbQuestions > 1
        ? 'Indiquer si les nombres suivants sont premiers ou pas.' +
          (this.interactif ? '' : " Justifier s'ils ne le sont pas.")
        : 'Indiquer si le nombre suivant est premier ou pas.' +
          (this.interactif ? '' : " Justifier s'il ne l'est pas.")
    let typesDeQuestions

    let typesDeQuestionsDisponibles // = [1, 2, 3, 6, 7];
    /* 1: // nombre pair, 2: // Multiple de 3, 3: // Multiple de 5, 4: // Multiple de 7, 5: // multiple de 11
     6: // produit de deux nombres premiers inférieurs à 100,
     7: // nombre premier inférieur à 529
     8: // nombre premier inférieur à 100 pour permettre les tests de divisibilité sans calculatrice
    */
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2, 3, 8]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 6, 7]
    }
    typesDeQuestionsDisponibles = shuffle(typesDeQuestionsDisponibles) // on mélange l'ordre des questions

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      let N = 0 // le nombre de la question
      let r
      let tabPremiersATester
      let sum

      let Nlongueur // pour la taille du string N
      let N1 // pour la repetiton du critère
      let N1longueur // pour la taille du string N1
      let sum1 // pour la somme de la répétition du critère

      let evenSum // pour la somme des chiffres de rang impair
      let oddSum // pour la somme des chiffres de rang pair
      let bonneReponse
      switch (typesDeQuestions) {
        case 1: // nombre pair
          N = !this.sup3 ? 2 * randint(51, 499) : 2 * randint(12, 49)
          texte = `$${texNombre(N)}$`
          texteCorr =
            'Comme ' +
            `$${texNombre(N)}$` +
            ' est pair, il admet donc au moins trois diviseurs qui sont $1$, $2$ et lui-même, '
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 2: // Multiple de 3
          sum = 0 // pour la valeur de la somme;
          N = !this.sup3 ? 3 * randint(34, 333) : 3 * randint(11, 33) // on initialise avant la boucle car on a peut être de la chance
          while (N % 2 === 0 || N % 5 === 0) {
            N = !this.sup3 ? 3 * randint(34, 333) : 3 * randint(11, 33)
          }
          texte = `$${texNombre(N)}$`
          texteCorr = 'Comme $' + N.toString().charAt(0)
          sum = Number(N.toString().charAt(0))
          for (let k = 1; k < N.toString().length; k++) {
            texteCorr += ' + ' + N.toString().charAt(k)
            sum += Number(N.toString().charAt(k))
          }
          texteCorr += ` = ${sum}$ est un multiple de $3$ donc $${texNombre(N)}$ aussi, il admet donc au moins trois diviseurs qui sont $1$, $3$ et lui-même, `
          texteCorr +=
            '<br>' +
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 3: // Multiple de 5
          N = !this.sup3 ? 5 * randint(20, 200) : 5 * randint(3, 19)
          texte = `$${texNombre(N)}$`
          texteCorr = `Comme le chiffre des unités de $${texNombre(N)}$ est un $${N.toString().charAt(N.toString().length - 1)}$, alors $${texNombre(N)}$ est divisible par $5$, `
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
        case 4: // Multiple de 7
          N = !this.sup3 ? 7 * randint(15, 143) : 7 * randint(2, 14)
          while (N % 2 === 0 || N % 3 === 0 || N % 5 === 0) {
            N = !this.sup3 ? 7 * randint(15, 143) : 7 * randint(2, 14)
          }
          texte = `$${texNombre(N)}$`
          Nlongueur = N.toString().length
          texteCorr = ` $7$ divise $${texNombre(N)}$, en effet : `
          texteCorr += '<br>'
          N1 = N
          N1longueur = Nlongueur
          sum1 =
            Number(N1.toString().substring(0, N1longueur - 1)) +
            5 * Number(N1.toString().charAt(N1longueur - 1))
          while (sum1 >= 56) {
            texteCorr += `$${N1.toString().substring(0, N1longueur - 1)} + 5\\times${N1.toString().charAt(N1longueur - 1)}`
            texteCorr += ` = ${Number(N1.toString().substring(0, N1longueur - 1)) + 5 * Number(N1.toString().charAt(N1longueur - 1))}$`
            texteCorr += '<br>'
            N1 = sum1
            N1longueur = N1.toString().length
            sum1 =
              Number(N1.toString().substring(0, N1longueur - 1)) +
              5 * Number(N1.toString().charAt(N1longueur - 1))
          }
          texteCorr += `Comme $${N1.toString().substring(0, N1longueur - 1)} + 5\\times${N1.toString().charAt(N1longueur - 1)} = ${sum1}$ est un multiple de $7$ alors $7$ divise $${texNombre(N)}$ aussi `
          texteCorr +=
            'qui admet donc au moins trois diviseurs : $1$, $7$ et lui-même, '
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 5: // multiple de 11
          N = 11 * randint(10, 91)
          while (N % 2 === 0 || N % 3 === 0 || N % 5 === 0 || N % 7 === 0) {
            N = 11 * randint(10, 91)
          }

          texte = `$${texNombre(N)}$`
          texteCorr = `D'une part, la somme des chiffres de rang impair de $${texNombre(N)}$ vaut `
          if (Number(N.toString().length) % 2 === 0) {
            // si N a un nombre pair de chiffres
            evenSum = Number(N.toString().charAt(1))
            texteCorr += '$' + N.toString().charAt(1)
            for (let k = 3; k < N.toString().length; k++) {
              if (k % 2 === 1) {
                texteCorr += ' + ' + N.toString().charAt(k)
                evenSum += Number(N.toString().charAt(k))
              }
            }
            texteCorr += ' = ' + evenSum + '$<br> '
          } else {
            // sinon N a un nombre impair de chiffres
            evenSum = Number(N.toString().charAt(0))
            texteCorr += '$' + N.toString().charAt(0)
            for (let m = 1; m < N.toString().length; m++) {
              if (m % 2 === 0) {
                texteCorr += ' + ' + N.toString().charAt(m)
                evenSum += Number(N.toString().charAt(m))
              }
            }
            texteCorr += ' = ' + evenSum + '$<br> '
          }
          texteCorr += `d'autre part, la somme des chiffres de rang pair de $${texNombre(N)}$ vaut `
          if (Number(N.toString().length) % 2 === 0) {
            // si N a un nombre pair de chiffres
            oddSum = Number(N.toString().charAt(0))
            texteCorr += '$' + N.toString().charAt(0)
            for (let k = 1; k < N.toString().length; k++) {
              if (k % 2 === 0) {
                texteCorr += ' + ' + N.toString().charAt(k)
                oddSum += Number(N.toString().charAt(k))
              }
            }
            texteCorr += ' = ' + oddSum + '$<br> '
          } else {
            // sinon N a un nombre impair de chiffres
            oddSum = Number(N.toString().charAt(1))
            texteCorr += '$' + N.toString().charAt(1)
            for (let m = 3; m < N.toString().length; m++) {
              if (m % 2 === 1) {
                texteCorr += ' + ' + N.toString().charAt(m)
                oddSum += Number(N.toString().charAt(m))
              }
            }
            texteCorr += ' = ' + oddSum + '$<br> '
          }
          texteCorr +=
            'la différence entre la somme des chiffres de rangs pairs et celle des chiffres de rangs impairs vaut '
          if (oddSum - evenSum === 0) {
            texteCorr += `$${oddSum - evenSum}$, `
          } else {
            texteCorr += `$${Math.abs(oddSum - evenSum)}$ qui est un multiple de $11$, `
          }
          texteCorr += '<br>'
          texteCorr += ` cela signifie que $${texNombre(N)}$ est divisible par $11$, il admet donc au moins trois diviseurs qui sont $1$, $11$ et lui-même,`
          texteCorr +=
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras("n'est pas premier") +
            '.'
          bonneReponse = 'non'
          break
        case 6: // produit de deux nombres premiers inférieurs à 100
          // rang du premier facteur premier
          {
            const r1 = randint(0, 24)
            // rang du second facteur premier
            const r2 = randint(0, 24)
            const prime1 = prems[r1] // on tire un nombre premier inférieur à 100, il n'y en a que 25!
            const prime2 = prems[r2] // on tire un autre nombre premier inférieur à 100, ça peut être le même qu'avant!
            N = prime1 * prime2
            texte = `$${prime1} \\times ${prime2}$ `
            texteCorr = `${texte} est le produit de $${prime1}$ et de $${prime2}$, il admet donc au moins `
            if (prime1 === prime2) {
              texteCorr += `trois divisieurs qui sont $1$, $${prime1}$ et lui-même ${texte}=$${texNombre(N)}$, `
            } else {
              texteCorr += `quatre diviseurs qui sont $1$, $${prime1}$, $${prime2}$ et lui-même ${texte}=$${texNombre(N)}$, `
            }
            texteCorr +=
              'donc ' +
              `${texte} = ` +
              `$${texNombre(N)}$` +
              ' ' +
              texteEnCouleurEtGras("n'est pas premier") +
              '.'
            bonneReponse = 'non'
          }
          break
        case 7: // nombre premier inférieur à 529, si le nombre premier dépasse 100 on affiche le coup de pouce
          // rang du nombre premier choisi
          r = !this.sup3
            ? randint(25, prems.length - 1)
            : randint(6, this.rangMaxPremierCourt)
          N = prems[r] // on choisit un nombre premier inférieur à 529

          texte = `$${texNombre(N)}$`
          r = 0
          tabPremiersATester = []
          while (prems[r] ** 2 < N) {
            tabPremiersATester.push(prems[r])
            r++
          }
          texteCorr = `En effectuant la division euclidienne de $${texNombre(N)}$ par tous les nombres premiers inférieurs à $\\sqrt{${N}}$, c'est-à-dire par `
          if (N === 2 || N === 3) {
            texteCorr +=
              "aucun nombre dans le cas présent, le reste n'est jamais nul,"
          } else {
            texteCorr += 'les nombres '
            texteCorr += `$${tabPremiersATester[0]}$`
            for (let k = 1; k < tabPremiersATester.length - 1; k++) {
              texteCorr += ', ' + `$${tabPremiersATester[k]}$`
            }
            texteCorr +=
              ' et ' + `$${tabPremiersATester[tabPremiersATester.length - 1]}$`
            texteCorr += ", le reste n'est jamais nul,"
          }
          texteCorr +=
            ' ' +
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras('est premier') +
            '.'

          bonneReponse = 'oui'
          break
        case 8: // nombre premier inférieur à 100 pour permettre les tests de divisibilité sans calculatrice
          // rang du nombre premier choisi
          r = randint(6, this.rangMaxPremierCourt)
          N = prems[r] // on choisit un nombre premier inférieur à 100
          texte = `$${texNombre(N)}$`
          r = 0
          tabPremiersATester = []
          while (prems[r] ** 2 < N) {
            tabPremiersATester.push(prems[r])
            r++
          }
          texteCorr = !this.sup3
            ? ''
            : texteEnCouleurEtGras(
                `$${texNombre(N)}$` + ' est un nombre premier',
              ) +
              ' car il fait partie de la liste des nombres premiers à connaitre. Sinon, sans cette connaissance, il y a la méthode suivante.<br>'
          texteCorr += `En effectuant la division euclidienne de $${texNombre(N)}$ par tous les nombres premiers inférieurs à $\\sqrt{${N}}$, c'est-à-dire par `
          if (N === 2 || N === 3) {
            texteCorr +=
              "aucun nombre dans le cas présent, le reste n'est jamais nul,"
          } else {
            texteCorr += 'les nombres '
            texteCorr += `$${tabPremiersATester[0]}$`
            for (let k = 1; k < tabPremiersATester.length - 1; k++) {
              texteCorr += ', ' + `$${tabPremiersATester[k]}$`
            }
            texteCorr +=
              ' et ' + `$${tabPremiersATester[tabPremiersATester.length - 1]}$`
            texteCorr += ", le reste n'est jamais nul,"
          }
          texteCorr +=
            ' ' +
            'donc ' +
            `$${texNombre(N)}$` +
            ' ' +
            texteEnCouleurEtGras('est premier') +
            '.'
          bonneReponse = 'oui'
          break
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
      if (this.questionJamaisPosee(i, N)) {
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
