import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer les coordonnées du milieu d'un segment"
export const interactifReady = true

export const dateDeModifImportante = '16/03/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '8bc88'

export const refs = {
  'fr-fr': ['can2G1-05', '2G12-flash1'],
  'fr-ch': [],
}
export default class CalculCoordonneesMilieu extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'fill-in-the-blank'
  }

  nouvelleVersion() {
    let a, b, c, d
    let enonce = ''
    const nom = creerNomDePolygone(2, 'MPQDO')
    switch (this.quotaChoice('type', ['a', 'b'])) {
      case 'a':
        a = randint(-10, 10)
        b = randint(-10, 10, 0)
        c = randint(-10, 10)
        d = randint(-10, 10, 0)
        {
          const xM = new FractionEtendue(a + b, 2)
          const yM = new FractionEtendue(c + d, 2)
          enonce = `Dans un repère du plan, on donne $${nom[0]}(${a}\\,;\\,${c})$ et $${nom[1]}(${b}\\,;\\,${d})$.<br>
        Déterminer les coordonnées du milieu $M$ de $[${nom[0] + nom[1]}]$.`
          this.question = `M\\left( %{champ1} ; %{champ2} \\right)`
          this.correction = `Les coordonnées du milieu $M$ sont données par :
        $\\left(\\dfrac{${a}+${ecritureParentheseSiNegatif(b)}}{2}\\,;\\,\\dfrac{${c}+${ecritureParentheseSiNegatif(d)}}{2}\\right)=
        \\left(\\dfrac{${texNombre(a + b, 0)}}{2}\\,;\\,\\dfrac{${texNombre(c + d, 0)}}{2}\\right)=
       ${miseEnEvidence(`\\left(${xM.texFractionSimplifiee}\\,;\\,${yM.texFractionSimplifiee}\\right)`)}$<br><br>`
          this.correction += texteEnCouleur(
            ` Mentalement : <br>
        On calcule les moyennes des abscisses et des ordonnées des deux points.
         `,
            bleuMathalea,
          )
          this.reponse = {
            bareme: toutPourUnPoint,
            champ1: {
              value: xM,
              options: { nombreDecimalSeulement: true, fractionEgale: true },
            },
            champ2: {
              value: yM,
              options: { nombreDecimalSeulement: true, fractionEgale: true },
            },
          }
        }
        break

      case 'b':
        a = randint(-9, 9, 0)
        b = randint(-9, 9, 0)
        {
          const xM = new FractionEtendue(a, 2)
          const yM = new FractionEtendue(b, 2)
          enonce = `Dans un repère du plan d'origine $O$, on donne $${nom[0]}(${a}\\,;\\,${b})$.<br>
        Déterminer les coordonnées du milieu $M$ de $[O${nom[0]}]$.`
          this.question = `M\\left( %{champ1} \\,;\\, %{champ2} \\right)`
          this.correction = `Comme les coordonnées du point $O$ sont $(0\\,;\\,0)$, les coordonnées du milieu $M$ sont données par :
        $\\left(\\dfrac{0+${ecritureParentheseSiNegatif(a)}}{2}\\,;\\,\\dfrac{0+${ecritureParentheseSiNegatif(b)}}{2}\\right)
        = ${miseEnEvidence(`\\left(${xM.texFractionSimplifiee}\\,;\\,${yM.texFractionSimplifiee}\\right)`)}$<br><br>`
          this.correction += texteEnCouleur(
            ` Mentalement : <br>
       Puisque le premier point est l'origine du repère, les coordonnées du milieu sont données par la moitié de l'abscisse et de l'ordonnée du deuxième point.
         `,
            bleuMathalea,
          )
          this.reponse = {
            bareme: toutPourUnPoint,
            champ1: {
              value: xM,
              options: { nombreDecimalSeulement: true, fractionEgale: true },
            },
            champ2: {
              value: yM,
              options: { nombreDecimalSeulement: true, fractionEgale: true },
            },
          }
        }
        break
    }
    this.canEnonce = enonce
    this.question =
      enonce +
      '<br>' +
      remplisLesBlancs(
        this,
        0,
        this.question ?? '',
        KeyboardType.clavierDeBaseAvecFraction,
      )
    this.canReponseACompleter = '$M(\\ldots\\,;\\,\\ldots)$'
  }
}
