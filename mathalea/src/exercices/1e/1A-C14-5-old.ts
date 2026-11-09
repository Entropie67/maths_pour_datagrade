// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid af470 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '22/04/2026'
export const uuid = 'af470'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Retrouver la bonne fonction affine à partir de données'
/**
 * @author Gilles Mora
 */
export default class Auto1AC14eOld extends ExerciceQcmA {
  private tableau(f: (x: number | FractionEtendue) => number): string {
    return tableauSignesFonction(f, -20, 20, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    })
  }

  private appliquerLesValeurs(a: number, r: number): void {
    // bonne réponse   : f(x) = a(x - r)  => racine r, pente a
    // distracteur 1   : racine r,  pente -a  => g(x) = -a(x - r)
    // distracteur 2   : racine -r, pente a   => h(x) = a(x + r)
    // distracteur 3   : racine -r, pente -a  => k(x) = -a(x + r)

    const b = -a * r // f(x) = ax + b,  racine r
    const bOpp = a * r // h(x) = ax + bOpp, racine -r

    const fBonne = (x: number | FractionEtendue) => a * Number(x) + b

    // a > 0 : croissante => f < 0 pour x < r,  f > 0 pour x > r
    // a < 0 : décroissante => f > 0 pour x < r,  f < 0 pour x > r
    const sensVariation = a > 0 ? 'croissante' : 'décroissante'
    const signeFGauche = a > 0 ? '<' : '>' // signe de f pour x < r
    const signeFDroite = a > 0 ? '>' : '<' // signe de f pour x > r
    const motGauche = a > 0 ? 'négative' : 'positive'
    const motDroite = a > 0 ? 'positive' : 'négative'

    this.enonce = `$f$ est une fonction définie sur $\\mathbb{R}$ vérifiant :<br>
    $\\bullet$ $f(x) ${signeFGauche} 0$ pour $x < ${texNombre(r)}$<br>
    $\\bullet$ $f(${texNombre(r)}) = 0$<br>
    $\\bullet$ $f(x) ${signeFDroite} 0$ pour $x > ${texNombre(r)}$<br><br>
    Une seule des expressions suivantes est celle de la fonction $f$. Laquelle ?`

    this.correction = `La fonction $f$ s'annule en $x = ${texNombre(r)}$ et est ${sensVariation}
     (car elle est ${motGauche} avant $${texNombre(r)}$, ${motDroite} après).<br>
     On cherche une fonction affine qui s'annule en $${texNombre(r)}$ et qui a un coefficient directeur ${a > 0 ? 'positif' : 'négatif'}.<br>
     La bonne réponse est $${miseEnEvidence(`f(x)=${reduireAxPlusB(a, b)}`)}$.<br>
     Son tableau de signes est :<br>
     ${this.tableau(fBonne)}`

    this.reponses = [
      `$f(x)=${reduireAxPlusB(a, b)}$`,
      `$f(x)=${reduireAxPlusB(-a, b)}$`,
      `$f(x)=${reduireAxPlusB(a, bOpp)}$`,
      `$f(x)=${reduireAxPlusB(-a, bOpp)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // f(x) = -x + 4  => a=-1, r=4
    // dist1 : x+4 (racine -4... non : -a=1, b=-4 => racine 4, pente 1 => x-4)
    // dist2 : -x-4 (racine -4, pente -1)
    // dist3 : x+4 (racine -4, pente 1)  -- mais reduireAxPlusB(1,4) = x+4
    this.appliquerLesValeurs(-1, 4)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const a = randint(1, 5) * choice([-1, 1])
      // r non nul pour que r et -r soient distincts
      const r = randint(1, 6) * choice([-1, 1])
      this.appliquerLesValeurs(a, r)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
