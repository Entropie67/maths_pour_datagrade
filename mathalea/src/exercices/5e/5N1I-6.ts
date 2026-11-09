import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer un multiple ou un nombre divisible par un autre'
export const interactifReady = true

export const dateDePublication = '18/09/2026'
/**
 * @author Gilles Mora
 */
export const uuid = '26e5f'

export const refs = {
  'fr-fr': ['5N1I-6'],
  'fr-ch': ['9R1NO1A-4', '9R2NO1A-4', '9R3NO1A-4', 'PRQNO09A-4'],
}

const DIVISEURS_FACILES = [2, 5, 10]
const DIVISEURS_DIFFICILES = [3, 9]
const DIVISEURS_AUTRES = [4, 6, 7, 8]

/**
 * "Quel est le plus grand entier à deux chiffres divisible par a ?" et sa
 * correction.
 */
export function texteDivisiblePar(a: number): {
  texte: string
  texteCorr: string
  reponse: number
} {
  const texte = `Quel est le plus grand entier à deux chiffres divisible par $${a}$ ?`
  let texteCorr = `Cela revient à chercher le plus grand multiple de $${a}$  inférieur à $100$.<br>`
  let reponse: number
  if (100 % a === 0) {
    reponse = 100 - a
    texteCorr += `Comme $100$ est divisible par $${a}$, le plus grand multiple cherché est $100-${a}=${miseEnEvidence(reponse)}$.`
  } else {
    reponse = Math.floor(100 / a) * a
    texteCorr += ` Comme $${a}\\times ${Math.floor(100 / a)}=${Math.floor(100 / a) * a} < 100$ et
        $ ${a}\\times ${Math.floor(100 / a) + 1}=${(Math.floor(100 / a) + 1) * a} > 100$,
        alors le plus grand multiple cherché est $${miseEnEvidence(reponse)}$.`
  }
  return { texte, texteCorr, reponse }
}

/**
 * "Quel est le plus grand/petit entier multiple de b inférieur/supérieur à c
 * ?" et sa correction.
 */
export function texteMultipleDe(
  b: number,
  c: number,
  sousVariante: boolean,
): { texte: string; texteCorr: string; reponse: number } {
  let texte: string
  let texteCorr: string
  let reponse: number
  if (sousVariante) {
    texte = `Quel est le plus grand entier multiple de $${b}$  inférieur à $${c}$ ?`
    if (c % b === 0) {
      reponse = c - b
      texteCorr = `Comme $${c}$ est divisible par $${b}$, le plus grand multiple cherché est $${c}-${b}=${miseEnEvidence(reponse)}$.`
    } else {
      reponse = Math.floor(c / b) * b
      texteCorr = ` Comme $${b}\\times ${Math.floor(c / b)} =${Math.floor(c / b) * b} < ${c}$ et
        $ ${b}\\times${Math.floor(c / b) + 1}=${Math.floor(c / b + 1) * b} > ${c}$,
        alors le plus grand multiple cherché est $${miseEnEvidence(reponse)}$.`
    }
  } else {
    texte = `Quel est le plus petit entier multiple de $${b}$  supérieur à $${c}$ ?`
    if (c % b === 0) {
      reponse = c + b
      texteCorr = `Comme $${c}$ est divisible par $${b}$, le plus petit multiple cherché est $${c}+${b}=${miseEnEvidence(reponse)}$.`
    } else {
      reponse = Math.ceil(c / b) * b
      texteCorr = ` Comme $${b}\\times ${Math.ceil(c / b) - 1} =${Math.ceil(c / b) * b - b} < ${c}$ et
        $ ${b}\\times${Math.ceil(c / b)}=${Math.ceil(c / b) * b} > ${c}$,
        alors le plus petit multiple cherché est $${miseEnEvidence(reponse)}$.`
    }
  }
  return { texte, texteCorr, reponse }
}

/**
 * "Quel est le plus grand/petit entier inférieur/supérieur à c divisible par
 * a ?" et sa correction : le pendant, pour le cas "divisible par", de
 * texteMultipleDe (même calcul, bornes variables au lieu des "deux chiffres"
 * fixes de texteDivisiblePar).
 */
export function texteDivisibleParAvecBorne(
  a: number,
  c: number,
  sousVariante: boolean,
): { texte: string; texteCorr: string; reponse: number } {
  let texte: string
  let texteCorr: string
  let reponse: number
  if (sousVariante) {
    texte = `Quel est le plus grand entier inférieur à $${c}$ divisible par $${a}$ ?`
    if (c % a === 0) {
      reponse = c - a
      texteCorr = `Comme $${c}$ est divisible par $${a}$, l'entier cherché est $${c}-${a}=${miseEnEvidence(reponse)}$.`
    } else {
      reponse = Math.floor(c / a) * a
      texteCorr = ` Comme $${a}\\times ${Math.floor(c / a)} =${Math.floor(c / a) * a} < ${c}$ et
        $ ${a}\\times${Math.floor(c / a) + 1}=${Math.floor(c / a + 1) * a} > ${c}$,
        alors l'entier cherché est $${miseEnEvidence(reponse)}$.`
    }
  } else {
    texte = `Quel est le plus petit entier supérieur à $${c}$ divisible par $${a}$ ?`
    if (c % a === 0) {
      reponse = c + a
      texteCorr = `Comme $${c}$ est divisible par $${a}$, l'entier cherché est $${c}+${a}=${miseEnEvidence(reponse)}$.`
    } else {
      reponse = Math.ceil(c / a) * a
      texteCorr = ` Comme $${a}\\times ${Math.ceil(c / a) - 1} =${Math.ceil(c / a) * a - a} < ${c}$ et
        $ ${a}\\times${Math.ceil(c / a)}=${Math.ceil(c / a) * a} > ${c}$,
        alors l'entier cherché est $${miseEnEvidence(reponse)}$.`
    }
  }
  return { texte, texteCorr, reponse }
}

export default class MultipleOuDivisible extends Exercice {
  can: boolean

  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 1.5

    this.besoinFormulaireTexte = [
      'Type de question',
      '1 : "Divisible par..."\n2 : "Multiple de..."\n3 : Mélange',
    ]
    this.sup = '1-2-2'

    this.besoinFormulaire2Texte = [
      'Difficulté des diviseurs/multiples',
      '1 : 2, 5, 10\n2 : 3, 9\n3 : Autres (4, 6, 7, 8)\n4 : Mélange',
    ]
    this.sup2 = '4'

    this.can = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const typesDeDifficulteDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeDifficulte = combinaisonListes(
      typesDeDifficulteDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const poolDiviseurs =
        listeDifficulte[i] === 1
          ? DIVISEURS_FACILES
          : listeDifficulte[i] === 2
            ? DIVISEURS_DIFFICILES
            : DIVISEURS_AUTRES
      const diviseur = choice(poolDiviseurs)
      let texte = ''
      let texteCorr = ''
      let reponse = 0
      let sousVariante: boolean | undefined
      let c: number | undefined

      if (listeTypeDeQuestions[i] === 1) {
        if (choice([true, false])) {
          ;({ texte, texteCorr, reponse } = texteDivisiblePar(diviseur))
        } else {
          c = randint(31, 91)
          sousVariante = choice([true, false])
          ;({ texte, texteCorr, reponse } = texteDivisibleParAvecBorne(
            diviseur,
            c,
            sousVariante,
          ))
        }
      } else {
        c = randint(31, 91)
        sousVariante = choice([true, false])
        ;({ texte, texteCorr, reponse } = texteMultipleDe(
          diviseur,
          c,
          sousVariante,
        ))
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { nombreDecimalSeulement: true },
          },
        })
      }

      if (this.can) {
        this.canEnonce = texte
        this.canReponseACompleter = ''
      }

      if (
        this.questionJamaisPosee(
          i,
          listeTypeDeQuestions[i],
          diviseur,
          c ?? '',
          String(sousVariante),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.listeCanEnonces.push(this.canEnonce ?? '')
        this.listeCanReponsesACompleter.push(this.canReponseACompleter ?? '')
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
