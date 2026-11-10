import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'croiss'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Croissance de fonctions'
export const dateDePublication = '03/07/2025'

/**
 * QCM sur la croissance de fonctions
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class CroissanceFonctions extends ExerciceQcmA {
  private appliquerLesValeurs(
    typeFonction: string,
    a: number,
    b: number,
    x1: number,
    x2: number,
    choix: number,
  ): void {
    let bonneReponse: string

    switch (typeFonction) {
      case 'lineaire':
        bonneReponse = a > 0 ? 'croissante' : 'décroissante'
        this.enonce = `Soit $f$ la fonction linéaire définie par $f(x) = ${rienSi1(a)}x$. Cette fonction est :`
        this.correction = `La fonction $f(x) = ${rienSi1(a)}x$ est une fonction linéaire avec $a = ${a}$.
        <br>Puisque $a ${a > 0 ? '> 0' : '< 0'}$, la fonction est ${texteEnCouleurEtGras(bonneReponse)}.`
        break

      case 'affine':
        bonneReponse = a > 0 ? 'croissante' : 'décroissante'
        this.enonce = `Soit $f$ la fonction affine définie par $f(x) = ${reduireAxPlusB(a, b)}$. Cette fonction est :`
        this.correction = `La fonction $f(x) = ${reduireAxPlusB(a, b)}$ est une fonction affine avec $a = ${a}$.<br>
        Puisque $a ${a > 0 ? '> 0' : '< 0'}$, la fonction est ${texteEnCouleurEtGras(bonneReponse)}.`
        break

      case 'carre':
        if (x1 < 0 && x2 < 0) {
          bonneReponse = 'décroissante sur $]-\\infty ; 0[$'
        } else if (x1 > 0 && x2 > 0) {
          bonneReponse = 'croissante sur $]0 ; +\\infty[$'
        } else {
          bonneReponse = 'ni croissante ni décroissante sur $\\mathbb{R}$'
        }
        this.enonce = `Soit $f$ la fonction définie par $f(x) = x^2$. Sur l'intervalle $[${x1} ; ${x2}]$, cette fonction est :`
        this.correction = `La fonction $f(x) = x^2$ est une fonction carré.<br>
        Sur l'intervalle $[${x1} ; ${x2}]$, elle est ${texteEnCouleurEtGras(bonneReponse)}.`
        break

      default:
        bonneReponse = 'croissante'
        break
    }

    // Génération des réponses selon le choix
    if (typeFonction === 'carre') {
      this.reponses =
        choix === 0
          ? [bonneReponse, 'toujours croissante', 'toujours décroissante']
          : choix === 1
            ? [bonneReponse, 'constante', 'toujours croissante']
            : [bonneReponse, 'toujours décroissante', 'constante']
    } else {
      const autrereponse =
        bonneReponse === 'croissante' ? 'décroissante' : 'croissante'
      this.reponses =
        choix === 0
          ? [bonneReponse, autrereponse, 'constante']
          : choix === 1
            ? [bonneReponse, 'constante', autrereponse]
            : [bonneReponse, autrereponse, 'ni croissante ni décroissante']
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('affine', 2, -3, 1, 5, 0)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const typeChoix = randint(0, 2)
      const typeFonction =
        typeChoix === 0 ? 'lineaire' : typeChoix === 1 ? 'affine' : 'carre'
      let a: number, b: number, x1: number, x2: number

      if (typeFonction === 'lineaire') {
        a = randint(-5, 5, 0)
        b = 0
        x1 = randint(-3, 3)
        x2 = randint(-3, 3)
      } else if (typeFonction === 'affine') {
        a = randint(-5, 5, 0)
        b = randint(-10, 10)
        x1 = randint(-3, 3)
        x2 = randint(-3, 3)
      } else {
        // carre
        a = 1
        b = 0
        // On choisit un intervalle soit dans les négatifs, soit dans les positifs
        const intervalleChoix = randint(0, 2)
        if (intervalleChoix === 0) {
          // negatif
          x1 = randint(-5, -1)
          x2 = randint(x1 + 1, 0)
        } else if (intervalleChoix === 1) {
          // positif
          x1 = randint(0, 3)
          x2 = randint(x1 + 1, 5)
        } else {
          // mixte
          x1 = randint(-3, -1)
          x2 = randint(1, 3)
        }
      }

      const choix = randint(0, 2)
      this.appliquerLesValeurs(typeFonction, a, b, x1, x2, choix)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
