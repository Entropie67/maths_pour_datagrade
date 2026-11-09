import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import type { ResultType, Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Écrire la liste de tous les diviseurs d'un entier - V2"
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDeModifImportante = '25/09/2026'

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Trouver tous les produits de deux entiers égaux à un nombre donné,
 * puis en déduire la liste de ses diviseurs.
 * @author Rémi Angot
 */
export const uuid = '9ea32'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1NO1B-3', '9R2NO1B-3', '9R3NO1B-3'],
}

/**
 * Lit une saisie de la forme a × b (a et b entiers naturels).
 * Renvoie le couple trié [min, max] ou null si la saisie n'est pas un produit
 * de deux entiers.
 */
function lireProduit(saisie: string): [number, number] | null {
  const facteurs = saisie
    .replace(/\\left|\\right|[{}\s]|\\,|\\;|\\!/g, '')
    .replace(/\\times|\\cdot|×|\*/g, 'x')
    .split('x')
  if (facteurs.length !== 2) return null
  if (!facteurs.every((facteur) => /^\d+$/.test(facteur))) return null
  const [a, b] = facteurs.map(Number)
  return a <= b ? [a, b] : [b, a]
}

export default class ListeDesDiviseurs5e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre de chiffres des entiers (entre 1 et 4)',
      'Nombres séparés par des tirets :',
    ]
    this.besoinFormulaire2Texte = [
      'Nombre maximum de diviseurs des entiers (entre 2 et 16)',
      'Nombres séparés par des tirets :',
    ]

    this.nbQuestions = 3
    this.sup = 2
    this.sup2 = 8
  }

  nouvelleVersion() {
    const nbChiffres = gestionnaireFormulaireTexte({
      min: 1,
      max: 4,
      defaut: 2,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      shuffle: false,
      melange: 0,
    }).map(Number)

    const nbDiviseursMax = gestionnaireFormulaireTexte({
      min: 2,
      max: 16,
      defaut: 8,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      shuffle: false,
      melange: 0,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Il n'existe pas d'entier à un chiffre ayant plus de 4 diviseurs.
      const nbChiffresQuestion =
        nbDiviseursMax[i] > 4 ? Math.max(2, nbChiffres[i]) : nbChiffres[i]
      let n = 0
      let diviseurs: number[] = []
      let essais = 0
      do {
        n = randint(
          Math.max(2, 10 ** (nbChiffresQuestion - 1)),
          10 ** nbChiffresQuestion - 1,
        )
        diviseurs = listeDesDiviseurs(n)
        essais++
      } while (
        (diviseurs.length < Math.max(2, nbDiviseursMax[i] - 3) ||
          diviseurs.length > nbDiviseursMax[i]) &&
        essais < 100
      )

      // Couples (d, n / d) avec d ≤ n / d : il y en a au plus 8.
      const produits = diviseurs
        .filter((d) => d * d <= n)
        .map((d) => [d, n / d] as [number, number])
      const nbProduits = produits.length

      let texte = `Compléter avec tous les produits de deux nombres entiers égaux à $${texNombre(n)}$ (l'ordre des facteurs ne compte pas).<br>`
      texte += `En déduire la liste de tous les diviseurs de $${texNombre(n)}$.<br>`

      if (this.interactif && context.isHtml) {
        const dataOptions: DataOptionsMultiMathfield = {}
        const lignes: string[] = []
        for (let k = 0; k < nbProduits; k++) {
          dataOptions[`field${k}` as 'field0'] = {
            keyboard: KeyboardType.clavierDeBase,
            minWidth: 100,
          }
          lignes.push(`%{field${k}}$\\;=${texNombre(n)}$`)
        }
        dataOptions[`field${nbProduits}` as 'field0'] = {
          keyboard: KeyboardType.clavierFullOperations,
          minWidth: 200,
        }
        lignes.push(
          `Les diviseurs de $${texNombre(n)}$ séparés par des points-virgules : %{field${nbProduits}}`,
        )
        texte += addMultiMathfield(this, i, {
          dataTemplate: lignes.join('\n'),
          dataOptions,
        })
      } else {
        texte += produits
          .map(
            () => `$\\ldots\\ldots \\times \\ldots\\ldots = ${texNombre(n)}$`,
          )
          .join('<br>')
      }

      /**
       * Une multiplication est juste si son résultat vaut n et si le même
       * produit (à l'ordre des facteurs près) n'a pas été écrit dans un champ
       * précédent.
       */
      const idMulti = `multi-mathfieldEx${this.numeroExercice}Q${i}`
      const compareProduit =
        (rang: number) =>
        (saisie: string): ResultType => {
          const couple = lireProduit(saisie)
          if (couple == null) {
            return {
              isOk: false,
              feedback: 'Il faut écrire un produit de deux nombres entiers.',
            }
          }
          if (couple[0] * couple[1] !== n) {
            return {
              isOk: false,
              feedback: `Certains produits ne sont pas égaux à $${texNombre(n)}$.`,
            }
          }
          const multi = document.getElementById(idMulti) as
            (HTMLElement & { getValue?: () => Record<string, string> }) | null
          const saisies = multi?.getValue?.() ?? {}
          for (let k = 0; k < rang; k++) {
            const autre = lireProduit(saisies[`field${k}`] ?? '')
            if (
              autre != null &&
              autre[0] === couple[0] &&
              autre[1] === couple[1]
            ) {
              return {
                isOk: false,
                feedback: 'Un même produit a été écrit plusieurs fois.',
              }
            }
          }
          return { isOk: true }
        }

      // Le nombre de champs dépend du nombre tiré : la question vaut
      // toujours 3 points (remontée des scores vers les recorders).
      const reponses: Valeur = { bareme: troisPointsProportionnels }
      for (let k = 0; k < nbProduits; k++) {
        reponses[`field${k}` as 'field0'] = {
          value: `${produits[k][0]}\\times${produits[k][1]}`,
          compare: compareProduit(k),
        }
      }
      reponses[`field${nbProduits}` as 'field0'] = {
        value: diviseurs.join(';'),
        options: { suiteDeNombres: true },
      }
      handleAnswers(this, i, reponses, {
        formatInteractif: 'multi-mathfield',
      })

      let texteCorr = `On cherche tous les produits de deux entiers égaux à $${texNombre(n)}$, en écrivant le plus petit facteur en premier. `
      texteCorr += `Il suffit de tester les entiers de $1$ à $${Math.trunc(Math.sqrt(n))}$ car $${Math.trunc(Math.sqrt(n)) + 1} \\times ${Math.trunc(Math.sqrt(n)) + 1} = ${texNombre((Math.trunc(Math.sqrt(n)) + 1) ** 2)}$ est supérieur à $${texNombre(n)}$.<br>`
      texteCorr += produits
        .map(
          ([a, b]) =>
            `$${texNombre(a)} \\times ${texNombre(b)} = ${texNombre(n)}$`,
        )
        .join('<br>')
      texteCorr += `<br>Chacun des facteurs ci-dessus est un diviseur de $${texNombre(n)}$.<br>`
      texteCorr += `La liste des diviseurs de $${texNombre(n)}$ est donc : $${miseEnEvidence(diviseurs.map((d) => texNombre(d)).join('\\;;\\;'))}$.`

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte + '\n',
          propositions: [
            {
              texte: texteCorr,
              statut: nbProduits + 2,
              sanscadre: false,
              pointilles: true,
              feedback: '',
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, n)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
