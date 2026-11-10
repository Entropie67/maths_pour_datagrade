// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6fc42 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora (et Claude)
 *
 */
export const uuid = '6fc42'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Retrouver une fonction affine à partir de son tableau de signes'
export const dateDePublication = '10/07/2025'

export default class Auto1AC16cOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const f = (x: number | FractionEtendue) => -3 * Number(x) + 6
    this.enonce = `On considère une fonction $f$ définie sur $\\mathbb{R}$ dont le tableau de signes est donné ci-dessous. <br><br>
  ${tableauSignesFonction(f, -10, 10, {
    step: 1,
    tolerance: 0.1,
    substituts: [
      { antVal: -10, antTex: '-\\infty' },
      { antVal: 10, antTex: '+\\infty' },
    ],
  })}<br><br>
        Parmi les quatre expressions proposées pour la fonction $f$, une seule est possible. `
    this.reponses = ['$f(x)=-3x+6$', '$f(x)=x+2$', '$f(x)=x-2$', '$f(x)=-4x+2$']
    this.correction = `Parmi les réponses proposées, on cherche la fonction affine qui s'annule en $2$ et dont le coefficient directeur est négatif. En effet, 
     la droite représentant la fonction $f$ est décroissante car la fonction donne des images positives puis négatives d'après le tableau de signes.<br>
     Il s'agit de la fonction $f$ définie par  $${miseEnEvidence('f(x)=-3x+6')}$.`
  }

  versionAleatoire: () => void = () => {
    // Génération aléatoire de la racine (nombre entier entre -5 et 5, excluant 0)
    const racine = randint(-5, 5, 0)

    // Choix aléatoire entre fonction croissante ou décroissante
    const estDecroissante = choice([true, false])

    // Génération du coefficient directeur selon le sens de variation
    const coefficients = estDecroissante ? [-4, -3, -2, -1] : [1, 2, 3, 4]
    const a = choice(coefficients)

    // Calcul du terme constant : b = -a * racine (pour que f(racine) = 0)
    const b = -a * racine

    // Définition de la fonction f(x) = ax + b
    const f = (x: number | FractionEtendue) => a * Number(x) + b

    this.enonce = `On considère une fonction $f$ définie sur $\\mathbb{R}$ dont le tableau de signes est donné ci-dessous. <br><br>
${tableauSignesFonction(f, -10, 10, {
  step: 1,
  tolerance: 0.1,
  substituts: [
    { antVal: -10, antTex: '-\\infty' },
    { antVal: 10, antTex: '+\\infty' },
  ],
})}<br><br>
    Parmi les quatre expressions proposées pour la fonction $f$, une seule est possible. `

    // Construction de la bonne réponse
    const bonneReponse = `$f(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$`

    // Distracteur 1: même racine mais coefficient directeur de signe opposé
    const a1 = estDecroissante ? choice([1, 2, 3, 4]) : choice([-4, -3, -2, -1])
    const b1 = -a1 * racine
    const distracteur1 = `$f(x)=${rienSi1(a1)}x${ecritureAlgebrique(b1)}$`

    // Distracteur 2:

    const distracteur2 = `$f(x)=${rienSi1(racine)}x$`

    // Distracteur 3: racine opposée avec les bons signes dans le tableau
    const racineOpposee = -racine
    const a3 = estDecroissante ? choice([-4, -3, -2, -1]) : choice([1, 2, 3, 4])
    const b3 = -a3 * racineOpposee
    const distracteur3 = `$f(x)=${rienSi1(a3)}x${ecritureAlgebrique(b3)}$`

    // Construction du tableau des réponses (bonne réponse en premier)
    this.reponses = [bonneReponse, distracteur1, distracteur2, distracteur3]

    this.correction = `Parmi les réponses proposées, on cherche la fonction affine qui s'annule en $${texNombre(racine)}$ et dont le coefficient directeur est ${a < 0 ? 'négatif' : 'positif'}. En effet, 
 la droite représentant la fonction $f$ est ${a < 0 ? 'décroissante' : 'croissante'} car la fonction donne des images ${a < 0 ? 'positives puis négatives' : 'négatives puis positives'} d'après le tableau de signes.<br>
 Il s'agit de la fonction $f$ définie par $${miseEnEvidence(`f(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}`)}$.`
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
  }
}
