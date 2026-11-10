import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { sameGeometricName, seq } from '../../../lib/interactif/checks'
import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { context } from '../../../modules/context'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
// Touches pour noter un segment [AB] ou une droite (AB)
const touchesNom = [['(', ')', '[', ']'], [...'ABCD']]
export const titre = "Résoudre |z-z'|=|z-z''|"
export const interactifReady = true

export const dateDePublication = '05/02/2025'
export const dateDeModifImportante = '29/10/2026'

export const uuid = '9772d'
export const refs = {
  'fr-fr': ['canTEC2-02'],
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class NomExercice extends ExerciceSimple {
  /** Points A et B nommés dans l'énoncé (TEC2-25 permet de les laisser anonymes) */
  protected nommerPoints = true

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'multi-mathfield'
  }

  nouvelleVersion() {
    const a = randint(-7, 7, 0)
    const b = randint(-7, 7, 0)
    const c = randint(-7, 7, [0, a])
    const d = randint(-7, 7, [0, b])

    const egalite = `\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert=\\vert z${ecritureAlgebrique(-c)}${ecritureAlgebriqueSauf1(-d)}\\mathrm{i}\\vert`
    const enonce = 'Soit $z\\in\\mathbb{C}$. <br>'
    const zA = new Complexe(a, b).tex()
    const zB = new Complexe(c, d).tex()
    const nomme = this.nommerPoints
    const presentation = `Dans le plan complexe, on note $A$ et $B$ les points d'affixes $z_A=${zA}$ et $z_B=${zB}$.<br>`
    this.question = nomme
      ? `${enonce}${presentation}Déterminer l'ensemble des points $M$ d'affixe $z$ qui vérifient $${egalite}$.`
      : `${enonce}Déterminer l'ensemble des points $M$ du plan complexe, d'affixe $z$, qui vérifient $${egalite}$`
    // En interactif, une phrase à compléter tient lieu de consigne
    if (this.interactif && context.isHtml && !context.isTypst) {
      // Sans points nommés, le segment est désigné par les affixes de ses extrémités
      const segment = nomme
        ? ' du segment %{field1}'
        : ' du segment dont les extrémités ont pour affixes %{field1} et %{field6}'
      this.question = `${enonce}${nomme ? presentation : ''}On considère l'ensemble des points $M$ d'affixe $z$ qui vérifient $${egalite}$.<br>${addMultiMathfield(this, 0, {
        dataTemplate: `L'ensemble des points $M$ est %{field0}<span data-show-when="field0:mediatrice">${segment}</span><span data-show-when="field0:cercle"> de centre d'affixe %{field2} et de rayon %{field3}</span><span data-show-when="field0:droite"> notée %{field4}</span><span data-show-when="field0:point"> noté %{field5}</span>.`,
        dataOptions: {
          field0: {
            choices: [
              { label: 'Choisir…', value: '' },
              { label: 'le cercle', value: 'cercle' },
              { label: 'la médiatrice', value: 'mediatrice' },
              { label: 'une droite', value: 'droite' },
              { label: 'un point', value: 'point' },
            ],
          },
          field1: nomme
            ? {
                keyboard: KeyboardType.clavierEntierementPersonnalisable,
                dataKeys: touchesNom,
              }
            : { keyboard: KeyboardType.complexes },
          field2: { keyboard: KeyboardType.complexes },
          field3: { keyboard: KeyboardType.clavierNumbers },
          field4: {
            keyboard: KeyboardType.clavierEntierementPersonnalisable,
            dataKeys: touchesNom,
          },
          field5: {
            keyboard: KeyboardType.clavierEntierementPersonnalisable,
            dataKeys: touchesNom,
          },
          field6: { keyboard: KeyboardType.complexes },
        },
      })}`
    }
    this.correction = `Soit $A$ le point du plan complexe d'affixe $z_A=${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}$`
    this.correction += `<br>et  $B$ le point du plan complexe d'affixe $z_B=${c}${ecritureAlgebriqueSauf1(d)}\\mathrm{i}$.`
    this.correction += `<br>On sait que $AM=\\vert z-z_A\\vert=\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert$.<br>`
    this.correction += `<br>et que  $BM=\\vert z-z_B\\vert=\\vert z${ecritureAlgebrique(-c)}${ecritureAlgebriqueSauf1(-d)}\\mathrm{i}\\vert$.<br>`
    this.correction += `<br>On a : $\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert=\\vert z${ecritureAlgebrique(-c)}${ecritureAlgebriqueSauf1(-d)}\\mathrm{i}\\vert\\iff AM=MB$.`
    this.correction +=
      "<br>La solution est donc l'ensemble des points $M$ qui sont équidistants des points $A$ et $B$.<br>"
    this.correction += `<br>L'ensemble solution est donc ${texteEnCouleurEtGras('la médiatrice du segment')} $${miseEnEvidence('[AB]')}$.`
    // Total constant de 3 points : le type d'ensemble (1) et le segment (2).
    // Les champs du cercle, de la droite et du point ne servent que si l'élève se trompe de type.
    this.reponse = {
      bareme: (points: number[]): [number, number] => [
        nomme
          ? points[0] + 2 * points[1]
          : points[0] + points[1] + points[6],
        3,
      ],
      field0: { value: 'mediatrice' },
      field1: nomme
        ? { value: '[AB]', compare: seq([sameGeometricName()]) }
        : { value: [zA, zB] },
      field2: { value: '' },
      field3: { value: '' },
      field4: { value: '(AB)', compare: seq([sameGeometricName()]) },
      field5: { value: 'A' },
      ...(nomme ? {} : { field6: { value: [zB, zA] } }),
    }
  }
}
