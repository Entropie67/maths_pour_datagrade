// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c8369 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 07/10/2026 (commit b7c3576a0).
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c8369'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une évolution globale'
export const dateDePublication = '10/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class AutomatismesOld extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(p1: number, p2: number): void {
    const c1 = 1 + p1 / 100
    const c2 = 1 + p2 / 100
    const c = c1 * c2
    const p = (c - 1) * 100
    const evo = p > 0 ? 'augmentation' : 'réduction'
    const alea = randint(-2, 2, 0)
    const alea2 = randint(-3, 3, [0, alea])
    let evo1: string
    let evo2: string
    if (p1 >= 0) {
      evo1 = 'augmentation'
    } else {
      evo1 = 'réduction'
    }
    if (p2 >= 0) {
      evo2 = 'augmentation'
    } else {
      evo2 = 'réduction'
    }

    this.reponses = [
      `une ${evo} de $${texNombre(abs(p))}\\,\\%$`,
      p1 + p2 > 0
        ? `une augmentation de $${texNombre(p1 + p2)}\\,\\%$`
        : `une réduction de $${texNombre(abs(p1 + p2))}\\,\\%$`,
      `une ${evo} de $${texNombre(abs(p + alea))}\\,\\%$`,
      `une ${evo} de $${texNombre(abs(p + alea2))}\\,\\%$`,
    ]

    this.enonce = `Une ${evo1} de $${abs(p1)}\\,\\%$  suivie d'une ${evo2} de $${abs(p2)}\\,\\%$  équivaut à :`
    this.correction =
      'À partir des évolutions en pourcentage, on déduit les coefficients multiplicateurs : <br>'
    if (p1 > 0) {
      this.correction += `On note $CM_1 = 1 + \\dfrac{${p1}}{100}=${texNombre((100 + p1) / 100)}$`
    } else {
      this.correction += `On note  $CM_1  = 1 - \\dfrac{${abs(p1)}}{100}=${texNombre((100 + p1) / 100)}$`
    }
    if (p2 > 0) {
      this.correction += ` et $CM_2 = 1 + \\dfrac{${p2}}{100}=${texNombre((100 + p2) / 100)}$.<br>`
    } else {
      this.correction += ` et  $CM_2 = 1 - \\dfrac{${abs(p2)}}{100}=${texNombre((100 + p2) / 100)}$.<br>`
    }
    this.correction += ` Le coefficient multiplicateur global est : <br> $CM = CM_1 \\times CM_2 = ${texNombre((100 + p1) / 100)} \\times ${texNombre((100 + p2) / 100)} = ${texNombre((100 + p) / 100)}$ `
    this.correction += `<br>Or, multiplier par $${texNombre((100 + p) / 100)}$ revient à avoir ${texteEnCouleurEtGras('une')} ${texteEnCouleurEtGras(evo)} ${texteEnCouleurEtGras('de')} $${miseEnEvidence(`${texNombre(abs(p))}\\,\\%`)}$.`
    this.reponse = ` ${p} %`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-50, 50) // valeurs originales
    this.reponses = [
      'Une réduction de  $25\\,\\%$',
      'Une réduction de  $50\\,\\%$',
      'Une augmentation de $25\\,\\%$',
      'Une augmentation de $75\\,\\%$',
    ]
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const p1 = randint(-6, 6, 0) * 10
      const p2 = randint(-6, 6, 0) * 10 // On génère un polynôme de degré 2 ax^2+c

      this.appliquerLesValeurs(p1, p2)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
