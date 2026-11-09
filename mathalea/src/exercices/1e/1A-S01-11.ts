import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Lire et interpréter un taux d'évolution annuel sur un graphique"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '27/10/2026'

export const uuid = '10768'
export const refs = {
  'fr-fr': ['1A-S01-11'],
  'fr-ch': [],
}

/**
 * Lecture des coordonnées d'un point d'un graphique donnant des taux
 * d'évolution annuels, puis interprétation par une phrase.
 * @author Stéphane Guyon
 */

type Scenario = {
  /** Ce que mesure le graphique : « le prix du … » */
  sujet: string
  /** Complément de la phrase d'énoncé : « du prix du … à … » */
  presentation: string
}

const scenarios: Scenario[] = [
  {
    sujet: 'le prix du litre de gazole',
    presentation: 'du prix du litre de gazole en France',
  },
  {
    sujet: 'le prix de la baguette de pain de la boulangerie',
    presentation: 'du prix de la baguette dans une boulangerie',
  },
  {
    sujet: "le nombre d'abonnés du club de sport",
    presentation: "du nombre d'abonnés à un club de sport",
  },
  {
    sujet: "le chiffre d'affaires de la librairie",
    presentation: "du chiffre d'affaires d'une librairie",
  },
  {
    sujet: 'la population de la commune de Valmont',
    presentation: 'de la population de la commune de Valmont',
  },
  {
    sujet: 'le nombre de visiteurs du musée',
    presentation: "du nombre de visiteurs d'un musée",
  },
  {
    sujet: "le prix de l'abonnement mensuel de transport",
    presentation: "du prix d'un abonnement mensuel de transport",
  },
]

const evolutions = [
  { label: 'Choisir…', value: '' },
  { label: 'a augmenté', value: 'augmente' },
  { label: 'a diminué', value: 'diminue' },
  { label: 'a stagné', value: 'stagne' },
]

const nombrePoints = 12
const derniereAnnee = 2025
const valeurMin = -3
const valeurMax = 5

/** Taux annuels (multiples de $0,5$) formant une ligne brisée sans palier. */
function genererTaux(): number[] {
  const taux: number[] = [randint(-2, 4) + choice([0, 0.5])]
  while (taux.length < nombrePoints) {
    const precedent = taux[taux.length - 1]
    const ecart = randint(1, 5) * 0.5 * choice([-1, 1])
    const suivant = precedent + ecart
    taux.push(
      suivant < valeurMin + 0.5 || suivant > valeurMax - 0.5
        ? precedent - ecart
        : suivant,
    )
  }
  return taux
}

export default class LireTauxEvolutionGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const scenario = choice(scenarios)
      const premiere = derniereAnnee - nombrePoints + 1
      const taux = genererTaux()
      // Point marqué : ni aux extrémités, ni sur l'axe des abscisses, et ni son
      // abscisse (année paire, étiquettes aux années impaires) ni son ordonnée
      // (décimale, étiquettes aux entiers) ne sont écrites sur la figure
      const indice = 2 * randint(1, 4)
      if (Number.isInteger(taux[indice])) continue
      if (!this.questionJamaisPosee(i, scenario.sujet, premiere, ...taux)) {
        continue
      }
      const annee = premiere + indice
      const valeur = taux[indice]
      const hausse = valeur > 0

      // L'axe des abscisses est placé en bas du graphique (valeurMin)
      const points = taux.map((t, k) => pointAbstrait(k, t - valeurMin))
      const ligne = polyline(points, 'green')
      ligne.epaisseur = 2
      const pointRouge = tracePoint(points[indice], 'red')
      pointRouge.taille = 5
      pointRouge.epaisseur = 3

      const hauteur = valeurMax - valeurMin
      const graphique = repere({
        xMin: 0,
        xMax: nombrePoints - 1,
        yMin: 0,
        yMax: hauteur,
        xThickDistance: 1,
        yThickDistance: 1,
        xLabelListe: Array.from(
          { length: Math.floor(nombrePoints / 2) },
          (_, k) => ({
            valeur: 2 * k + 1,
            texte: `${premiere + 2 * k + 1}`,
          }),
        ),
        yLabelListe: Array.from({ length: hauteur + 1 }, (_, k) => ({
          valeur: k,
          texte: `${valeurMin + k}`,
        })),
        grilleXDistance: 1,
        grilleYDistance: 0.5,
        grilleYCouleur: 'lightgray',
        grilleXCouleur: 'lightgray',
        grilleSecondaire: false,
      })
      const legende = latex2d(
        "\\text{Par rapport à l'année précédente, en}\\;\\%",
        5.5,
        hauteur + 0.7,
        { color: 'black' },
      )
      const figure = mathalea2d(
        {
          xmin: -1.5,
          xmax: nombrePoints + 1,
          ymin: -1,
          ymax: hauteur + 1.5,
          pixelsParCm: 28,
          scale: 1,
          center: !context.isHtml,
        },
        graphique,
        ligne,
        pointRouge,
        legende,
      )

      const valeurAbsolue = Math.abs(valeur)
      const verbe = hausse ? 'augmente' : 'diminue'

      const intro = `Le graphique suivant donne le taux d'évolution annuel ${scenario.presentation}, de $${premiere}$ à $${premiere + nombrePoints - 1}$.<br>${figure}<br>`
      const correction = `Le point rouge a pour coordonnées $(${annee}\\,;\\,${texNombre(valeur, 1)})$, donc en $${miseEnEvidence(annee)}$, ${scenario.sujet} ${texteEnCouleurEtGras(hausse ? 'a augmenté' : 'a diminué')} de $${miseEnEvidence(texNombre(valeurAbsolue, 1))}${sp()}\\%$ par rapport à $${annee - 1}$.`

      if (this.interactif && context.isHtml && !context.isTypst) {
        // Une seule phrase à compléter : les coordonnées ne sont pas demandées
        this.listeQuestions[i] =
          intro +
          addMultiMathfield(this, i, {
            dataTemplate: `En %{field0}, ${scenario.sujet} %{field1} de %{field2}${sp()}% par rapport à l'année précédente.`,
            dataOptions: {
              field0: { keyboard: KeyboardType.clavierNumbers },
              field1: { choices: evolutions },
              field2: { keyboard: KeyboardType.clavierNumbers },
            },
          })
        handleAnswers(
          this,
          i,
          {
            field0: { value: annee },
            field1: { value: verbe },
            field2: { value: valeurAbsolue },
            bareme: toutPourUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        this.listeQuestions[i] =
          intro +
          "Interpréter le point rouge, à partir de ses coordonnées, dans le contexte de l'exercice."
      }
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
