// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 90af7 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import RepereBuilder from '../../../lib/2d/RepereBuilder'
import { spline } from '../../../lib/mathFonctions/Spline'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '90af7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : convexité'
export const dateDePublication = '08/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class MetropoleJuin24Exo4Q1Old extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    xA: number,
    xB: number,
    yB: number,
    xC: number,
    yD: number,
    xE: number,
    yE: number,
    xF: number,
  ): void {
    this.reponses = [
      `$f'$ admet un maximum en $${xC}$ `,
      `$f$ est convexe sur $[${xC};${xE}]$`,
      `$f$ est concave sur $[${xB};0]$`,
      `$f'$ est décroissante sur $[${xB};0]$`,
    ]

    this.enonce = `On a représenté ici, sur l'intervalle $[${xA};${xB}]$ la courbe représentative de $f^{\\prime\\prime}$, dérivée seconde d'une fonction $f$.<br>`
    const nuage = [
      { x: xA, y: 0, deriveeGauche: 0, deriveeDroit: 2, isVisible: true },
      { x: xB, y: yB, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: xC, y: 0, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
      { x: 0, y: yD, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: xE, y: yE, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: xF, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
    ]
    const f = spline(nuage)
    const rep = new RepereBuilder({
      xMin: xA,
      xMax: xF,
      yMin: yE,
      yMax: yB,
    }).buildStandard().objets
    const maCourbe = f.courbe({
      color: 'red',
      epaisseur: 2,
      ajouteNoeuds: true,
      optionsNoeuds: {},
    })
    this.enonce += mathalea2d(
      Object.assign({}, fixeBordures([rep, maCourbe])),
      rep,
      maCourbe,
    )
    this.enonce += `On peut en déduire que${sp()}: `
    this.correction = ''
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-3, -2, 3, -1, -2, 1, -3, 2) // valeurs originales
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const xA = randint(-8, -5)
      const xB = xA + randint(1, 2)
      const yB = randint(3, 5)
      const xC = xB + randint(1, 2)
      const yD = randint(-4, -3)
      const xE = randint(2, 5)
      const yE = yD - randint(2, 4)
      const xF = xE + randint(3, 5)
      this.appliquerLesValeurs(xA, xB, yB, xC, yD, xE, yE, xF)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
