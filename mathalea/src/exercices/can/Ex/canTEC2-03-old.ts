// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 16c5e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 30/10/2026 (commit b54f9dbb7).
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
export const titre = "Résoudre |z-z'|=r"
export const interactifReady = true

export const dateDePublication = '4/5/2024'
export const dateDeModifImportante = '29/10/2026'

export const uuid = '16c5e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Stéphane Guyon
 */
export default class NomExerciceOld extends ExerciceSimple {
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
    this.question = `${enonce}Déterminer l'ensemble des points $M$ du plan complexe, d'affixe $z$, qui vérifient $${egalite}\\quad (1)$`
    // En interactif, une phrase à compléter tient lieu de consigne
    if (this.interactif && context.isHtml && !context.isTypst) {
      this.question = `${enonce}On considère l'ensemble des points $M$ du plan complexe, d'affixe $z$, qui vérifient $${egalite}\\quad (1)$.<br>${addMultiMathfield(this, 0, {
        dataTemplate: `L'ensemble des points $M$ est %{field0}<span data-show-when="field0:mediatrice"> du segment dont les extrémités ont pour affixes %{field1} et %{field2}</span><span data-show-when="field0:cercle"> de centre d'affixe %{field3} et de rayon %{field4}</span>.`,
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
          field1: { keyboard: KeyboardType.complexes },
          field2: { keyboard: KeyboardType.complexes },
          field3: { keyboard: KeyboardType.complexes },
          field4: { keyboard: KeyboardType.clavierNumbers },
        },
      })}`
    }
    this.correction = `Soit $A$ le point du plan complexe d'affixe $z_A=${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}$.`
    this.correction += `<br>On sait que $AM=\\vert z-z_A\\vert=\\vert z${ecritureAlgebrique(-a)}${ecritureAlgebriqueSauf1(-b)}\\mathrm{i}\\vert$.<br>`
    this.correction += `<br>On montre donc que  $(1) \\iff AM=${r}$.`
    this.correction += `<br>Les points $M$ solutions correspondent donc à l'ensemble des points du plan complexe,<br> situés à une distance de $${r}$ unités du point $A$.<br>`
    this.correction += `C'est donc le cercle de centre $A$ et de rayon $${r}$.`
    this.correction += `<br>$S=${miseEnEvidence(`\\mathcal{C}\\big(A, ${texNombre(r, 0)}\\big)`)}$.`
    // Total constant : le type d'ensemble, le centre et le rayon.
    this.reponse = {
      bareme: (points: number[]): [number, number] => [
        points[0] + points[3] + points[4],
        3,
      ],
      field0: { value: 'cercle' },
      field1: { value: '' },
      field2: { value: '' },
      field3: { value: zA },
      field4: { value: String(r) },
    }
  }
}
