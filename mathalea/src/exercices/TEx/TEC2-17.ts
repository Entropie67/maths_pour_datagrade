import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'

export const titre =
  "Déterminer un lieu géométrique avec la partie réelle ou imaginaire d'un complexe"
export const interactifReady = true
export const dateDePublication = '28/10/2026'
export const uuid = 'f6ad6'
export const refs = {
  'fr-fr': ['TEC2-15'],
  'fr-ch': [],
}

const natures = [
  { label: 'Choisir…', value: '' },
  { label: 'une droite', value: 'droite' },
  { label: 'une demi-droite', value: 'demi-droite' },
  { label: 'un cercle', value: 'cercle' },
]

/**
 * Déterminer l'ensemble des points M d'affixe z tels que Re(z)=k ou Im(z)=k.
 * @author Stéphane Guyon
 */
export default class LieuPartieReelleImaginaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Partie réelle',
        '2 : Partie imaginaire',
        '3 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeTypes = combinaisonListes(types, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const reel = listeTypes[i] === 1
      const k = randint(-4, 4)
      if (!this.questionJamaisPosee(i, listeTypes[i], k)) continue

      const fonction = reel ? '\\operatorname{Re}' : '\\operatorname{Im}'
      const axe = reel ? 'x' : 'y'
      const equation = `${axe}=${k}`
      const direction = reel
        ? "parallèle à l'axe des ordonnées"
        : "parallèle à l'axe des abscisses"
      const axeConfondu = reel ? "l'axe des ordonnées" : "l'axe des abscisses"
      const conclusion =
        k === 0
          ? `C'est ${axeConfondu}, d'équation $${miseEnEvidence(equation)}$.`
          : `C'est la droite ${direction} d'équation $${miseEnEvidence(equation)}$.`

      const enonce = `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, déterminer l'ensemble des points $M$ d'affixe $z=x+\\mathrm{i}y$ ($x$ et $y$ réels) tels que $${fonction}(z)=${k}$.`
      const debutCorrection = `Posons $z=x+\\mathrm{i}y$ avec $x$ et $y$ réels.<br>
        On a $${fonction}(z)=${axe}$, donc $${fonction}(z)=${k}\\iff ${axe}=${k}$.<br>
        L'ensemble cherché est donc l'ensemble des points $M(x\\,;\\,y)$ tels que $${axe}=${k}$.`

      const limite = 5
      const figure = mathalea2d(
        {
          xmin: -limite - 1,
          xmax: limite + 1,
          ymin: -limite - 1,
          ymax: limite + 1,
          scale: 0.5,
        },
        repere({
          xMin: -limite,
          xMax: limite,
          yMin: -limite,
          yMax: limite,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
        }),
        reel
          ? segment(point(k, -limite), point(k, limite), 'red')
          : segment(point(-limite, k), point(limite, k), 'red'),
        reel
          ? latex2d(equation, k + 0.9, limite - 0.5, { color: 'red' })
          : latex2d(equation, limite - 1, k + 0.5, { color: 'red' }),
      )

      if (this.interactif) {
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, on note $M$ le point d'affixe $z=x+\\mathrm{i}y$ ($x$ et $y$ réels).<br>L'ensemble des points $M$ du plan tels que $${fonction}(z)=${k}$ est %{field0} d'équation %{field1}.`,
          dataOptions: {
            field0: { choices: natures },
            field1: {
              keyboard: KeyboardType.clavierEntierementPersonnalisable,
              dataKeys: [
                ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'],
                ['+', '-', '\\times', '\\frac{#@}{#0}', 'SQ', '='],
                ['x', 'y', 'z', '\\mathrm{i}'],
              ],
            },
          },
        })
        this.listeCorrections[i] =
          `${debutCorrection}<br>${conclusion}<br>${figure}`
        handleAnswers(
          this,
          i,
          {
            field0: { value: 'droite' },
            field1: {
              value: equation,
              options: { egaliteExpression: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        createQuestion(this, i, {
          question: enonce,
          correction: `${debutCorrection}<br>${conclusion}<br>${figure}`,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
