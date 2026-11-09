import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { context } from '../../../modules/context'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
// Touches pour noter un segment [AB] ou une droite (AB)
const touchesNom = [['(', ')', '[', ']'], [...'ABCD']]
export const titre = "Résoudre |z-z'|=r"
export const interactifReady = true

export const dateDePublication = '4/5/2024'
export const dateDeModifImportante = '30/10/2026'

export const uuid = '3ad83'
export const refs = {
  'fr-fr': ['canTEC2-03'],
  'fr-ch': ['3mNC-2'],
}

/**
 * @author Stéphane Guyon
 */
export default class NomExercice extends ExerciceSimple {
  /** Point A nommé dans l'énoncé (TEC2-26 permet de le laisser anonyme) */
  protected nommerPoint = true

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'multi-mathfield'
  }

  nouvelleVersion() {
    const a = randint(-7, 7, 0)
    const b = randint(-7, 7, 0)
    const r = randint(1, 10)

    const egalite = `\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert=${r}`
    const enonce = 'Soit $z\\in\\mathbb{C}$. <br>'
    const zA = new Complexe(a, b).tex()
    const nomme = this.nommerPoint
    const presentation = `Dans le plan complexe, on note $A$ le point d'affixe $z_A=${zA}$.<br>`
    this.question = nomme
      ? `${enonce}${presentation}Déterminer l'ensemble des points $M$ d'affixe $z$ qui vérifient $${egalite}$.`
      : `${enonce}Déterminer l'ensemble des points $M$ du plan complexe, d'affixe $z$, qui vérifient $${egalite}$`
    // En interactif, une phrase à compléter tient lieu de consigne
    if (this.interactif && context.isHtml && !context.isTypst) {
      this.question = `${enonce}${nomme ? presentation : ''}On considère l'ensemble des points $M$ d'affixe $z$ qui vérifient $${egalite}$.<br>${addMultiMathfield(this, 0, {
        dataTemplate: `L'ensemble des points $M$ est %{field0}<span data-show-when="field0:mediatrice"> du segment %{field1}</span><span data-show-when="field0:cercle"> de centre d'affixe %{field2} et de rayon %{field3}</span><span data-show-when="field0:droite"> notée %{field4}</span><span data-show-when="field0:point"> noté %{field5}</span>.`,
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
          field1: {
            keyboard: KeyboardType.clavierEntierementPersonnalisable,
            dataKeys: touchesNom,
          },
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
        },
      })}`
    }
    this.correction = `Soit $A$ le point du plan complexe d'affixe $z_A=${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}$.`
    this.correction += `<br>On sait que $AM=\\vert z-z_A\\vert=\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert$.<br>`
    this.correction += `<br>On montre donc que  $${egalite}\\iff AM=${r}$.`
    this.correction += `<br>Les points $M$ solutions correspondent donc à l'ensemble des points du plan complexe,<br> situés à une distance de ${r} unités du point $A$.<br>`
    this.correction += `C'est donc le cercle de centre $A$ et de rayon ${r}.`
    this.correction += `<br>$S=${miseEnEvidence(`\\mathcal{C}\\big(A, ${texNombre(r, 0)}\\big)`)}$.`
    // Total constant de 3 points : le type d'ensemble, le centre et le rayon.
    // Les champs du segment, de la droite et du point ne servent que si l'élève se trompe de type.
    this.reponse = {
      bareme: (points: number[]): [number, number] => [
        points[0] + points[2] + points[3],
        3,
      ],
      field0: { value: 'cercle' },
      field1: { value: '' },
      field2: { value: zA },
      field3: { value: String(r) },
      field4: { value: '' },
      field5: { value: 'A' },
    }
  }
}
