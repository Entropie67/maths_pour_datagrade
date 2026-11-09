import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Déterminer des antécédents avec une fonction de référence (ancien exercice)'
export const interactifReady = true

export const dateDePublication = '1/11/2021'
export const dateDeModifImportante = '12/08/2026'

export const uuid = '82d4a'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */

function illustrationDistance(centre: number, distance: number): string {
  const gauche = centre - distance
  const droite = centre + distance
  const min = gauche - 1
  const axe = droiteGraduee({
    Unite: 1,
    Min: min,
    Max: droite + 1,
    thickDistance: 1,
    labelsPrincipaux: false,
    labelListe: [[centre, `${centre}`]],
    pointListe: [[centre, '']],
    pointStyle: '|',
    pointEpaisseur: 3,
  })
  const pointGauche = pointAbstrait(gauche - min, 0)
  const pointDroite = pointAbstrait(droite - min, 0)
  const marqueGauche = tracePoint(pointGauche, bleuMathalea)
  const marqueDroite = tracePoint(pointDroite, bleuMathalea)
  marqueGauche.style = '|'
  marqueDroite.style = '|'
  marqueGauche.epaisseur = 3
  marqueDroite.epaisseur = 3
  const objets = [
    axe,
    marqueGauche,
    marqueDroite,
    latex2d(`${gauche}`, pointGauche.x, -0.7, { color: bleuMathalea }),
    latex2d(`${droite}`, pointDroite.x, -0.7, { color: bleuMathalea }),
    latex2d(
      `\\overbrace{\\hspace{${distance * 0.55}cm}}^{${distance}}`,
      (pointGauche.x + (centre - min)) / 2,
      1,
      { color: bleuMathalea },
    ),
    latex2d(
      `\\overbrace{\\hspace{${distance * 0.55}cm}}^{${distance}}`,
      (centre - min + pointDroite.x) / 2,
      1,
      { color: bleuMathalea },
    ),
  ]
  return mathalea2d(
    Object.assign({}, fixeBordures(objets), {
      pixelsParCm: 24,
      scale: 0.8,
    }),
    objets,
  )
}

export default class AntecedentFonctionReference extends ExerciceSimple {
  protected typeFonction?: number

  private casDisponibles(): number[] {
    switch (this.sup3) {
      case 1:
        return [1, 2, 3]
      case 2:
        return [2, 3, 4, 5]
      case 3:
      default:
        return [1, 2, 3, 4, 5]
    }
  }

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.sup3 = 3
    this.besoinFormulaire3Numerique = [
      'Fonctions proposées',
      3,
      '1 : Nouveau programme 2026\n2 : Années de transition\n3 : Toutes les fonctions de référence',
    ]
  }

  nouvelleVersion() {
    if (context.isHtml) this.spacingCorr = 2

    switch (this.typeFonction ?? choice(this.casDisponibles())) {
      case 1: {
        this.optionsDeComparaison = { ensembleDeNombres: true }
        const centre = randint(-5, 5)
        const distance = randint(1, 6)
        const gauche = centre - distance
        const droite = centre + distance
        const expression = `|x${ecritureAlgebrique(-centre)}|`
        this.question = `Chercher le ou les antécédents de $${distance}$ par la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x)=${expression}$.`
        this.correction = `Chercher un antécédent de $${distance}$ par la fonction $f$, c'est résoudre l'équation $f(x)=${distance}$.<br><br>
        <strong>Résolution géométrique :</strong><br>
        L'égalité $${expression}=${distance}$ signifie que la distance entre $x$ et $${centre}$ est égale à $${distance}$ unités. Les deux abscisses correspondantes sont $${gauche}$ et $${droite}$.<br>
        ${illustrationDistance(centre, distance)}<br>
        <strong>Résolution analytique :</strong><br>
        $\\begin{aligned}
        &\\phantom{\\iff} f(x)=${distance}\\\\[2ex]
        &\\iff ${expression}=${distance}\\\\
        &\\iff x${ecritureAlgebrique(-centre)}=${distance}\\quad\\text{ou}\\quad x${ecritureAlgebrique(-centre)}=-${distance}\\\\
        &\\iff x=${droite}\\quad\\text{ou}\\quad x=${gauche}.
        \\end{aligned}$<br>
        Ainsi, l'ensemble des antécédents de $${distance}$ est $${miseEnEvidence(`\\{${gauche}~;~${droite}\\}`)}$.`
        this.reponse = `\\{${gauche};${droite}\\}`
        break
      }
      case 2: {
        this.optionsDeComparaison = { ensembleDeNombres: true }
        const antecedent = randint(1, 9)
        const image = antecedent ** 2
        this.question = `Chercher le ou les antécédents de $${image}$ par la fonction carré $f$ définie sur $\\mathbb{R}$ par : $f(x)=x^2$.`
        this.correction = `Chercher un antécédent de $${image}$ par la fonction $f$, c'est résoudre l'équation $f(x)=${image}$.<br>
        $\\begin{aligned}
        &\\phantom{\\iff} f(x)=${image}\\\\[2ex]
        &\\iff x^2=${image}\\\\
        &\\iff x=-${antecedent}\\text{ ou }x=${antecedent}.
        \\end{aligned}$<br>
        Ainsi, l'ensemble des antécédents de $${image}$ est $${miseEnEvidence(`\\{-${antecedent}~;~${antecedent}\\}`)}$.`
        this.reponse = `\\{-${antecedent};${antecedent}\\}`
        break
      }
      case 3: {
        this.optionsDeComparaison = {}
        const antecedent = randint(-6, 6, [0])
        const image = randint(-6, 6, [0])
        const numerateur = antecedent * image
        this.question = `Chercher le ou les antécédents de $${image}$ par la fonction $f$ définie sur $\\mathbb{R}^*$ par : $f(x)=\\dfrac{${numerateur}}{x}$.`
        this.correction = `Chercher un antécédent de $${image}$ par la fonction $f$, c'est résoudre l'équation $f(x)=${image}$.<br>
        $\\begin{aligned}
        &\\phantom{\\iff} f(x)=${image}\\\\[2ex]
        &\\iff \\dfrac{${numerateur}}{x}=${image}\\\\
        &\\iff ${rienSi1(image)}x=${numerateur}\\\\
        &\\iff x=${antecedent}.
        \\end{aligned}$<br>
        Ainsi, l'unique antécédent de $${image}$ est $${miseEnEvidence(antecedent)}$.`
        this.reponse = antecedent
        break
      }
      case 4: {
        this.optionsDeComparaison = {}
        const antecedent = randint(-5, 5)
        const image = antecedent ** 3
        this.question = `Chercher le ou les antécédents de $${image}$ par la fonction cube $f$ définie sur $\\mathbb{R}$ par : $f(x)=x^3$.`
        this.correction = `Chercher un antécédent de $${image}$ par la fonction $f$, c'est résoudre l'équation $f(x)=${image}$.<br>
        $\\begin{aligned}
        &\\phantom{\\iff} f(x)=${image}\\\\[2ex]
        &\\iff x^3=${image}\\\\
        &\\iff x=${antecedent}\\qquad\\text{Comme la fonction cube est strictement croissante, l'équation }x^3=${image}\\text{ n'a qu'une seule solution.}
        \\end{aligned}$<br>
        Ainsi, l'unique antécédent de $${image}$ est $${miseEnEvidence(antecedent)}$.`
        this.reponse = antecedent
        break
      }
      case 5: {
        this.optionsDeComparaison = {}
        const m = this.quotaRandint('m', 2, 5)
        const p = randint(1, 4) * m
        const image = randint(5, 10) * m
        const maFraction = fraction(image - p, m)
        this.question = `Chercher le ou les antécédents de $${image}$ par la fonction $f$ définie sur $\\mathbb{R}_+$ par : $f(x)=${m}\\sqrt{x}+${p}$.`
        this.correction = `Chercher un antécédent de $${image}$ par la fonction $f$, c'est résoudre l'équation $f(x)=${image}$.<br>
        $\\begin{aligned}
        &\\phantom{\\iff} f(x)=${image}\\\\[2ex]
        &\\iff ${m}\\sqrt{x}+${p}=${image}\\\\
        &\\iff ${m}\\sqrt{x}=${image - p}\\\\
        &\\iff \\sqrt{x}=${maFraction.simplifie().texFSD}\\qquad\\text{Comme la fonction racine carrée est strictement croissante sur }\\mathbb{R}_+\\text{, cette équation n'a qu'une seule solution.}\\\\
        &\\iff x=${maFraction.puissanceFraction(2).simplifie().texFraction}.
        \\end{aligned}$<br>
        Ainsi, l'unique antécédent de $${image}$ est $${miseEnEvidence(maFraction.puissanceFraction(2).simplifie().texFraction)}$.`
        this.reponse = maFraction.puissanceFraction(2)
        break
      }
    }
  }
}
