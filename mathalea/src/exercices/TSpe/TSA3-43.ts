import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { createSubQuestions } from '../../lib/interactif/subQuestions'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer graphiquement les signes de $f$, $f'$ et $f''$"
export const dateDePublication = '16/08/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = 'dc696'

export const refs = {
  'fr-fr': ['TSA3-43', 'TCA7-43'],
  'fr-ch': [],
}

type Signe = 'positif' | 'négatif' | 'nul'

type ScenarioRelatif = {
  decalageF: number
  decalageFPrime: number
  decalageFSeconde: number
}

const scenariosRelatifs: ScenarioRelatif[] = [
  {
    decalageF: 0,
    decalageFPrime: -10,
    decalageFSeconde: -5,
  },
  {
    decalageF: -5,
    decalageFPrime: 10,
    decalageFSeconde: 0,
  },
  {
    decalageF: 5,
    decalageFPrime: 0,
    decalageFSeconde: 0,
  },
  {
    decalageF: -10,
    decalageFPrime: 0,
    decalageFSeconde: 5,
  },
  {
    decalageF: 0,
    decalageFPrime: 5,
    decalageFSeconde: 10,
  },
  {
    decalageF: 10,
    decalageFPrime: -10,
    decalageFSeconde: -5,
  },
]

const centres = [-10, -5, 5, 10]
const orientations: Array<1 | -1> = [1, -1]

const choixSignes = [
  { label: 'Choisir un signe', value: '' },
  { label: 'positif', value: 'positif' },
  { label: 'négatif', value: 'négatif' },
  { label: 'nul', value: 'nul' },
]

function signe(valeur: number): Signe {
  if (Math.abs(valeur) < 1e-9) return 'nul'
  return valeur > 0 ? 'positif' : 'négatif'
}

/** Nom de la tangente : (T) s'il n'y en a qu'une, sinon (T_1), (T_2)… */
function nomTangente(index: number, nombre: number): string {
  return nombre === 1 ? '(T)' : `(T_{${index + 1}})`
}

function graphique(
  fonction: (x: number) => number,
  derivee: (x: number) => number,
  abscissesTangentes: number[],
  orientation: 1 | -1,
  xMin: number,
  xMax: number,
): string {
  const xUnite = 20 / (xMax - xMin)
  const yMin = -18
  const yMax = 18
  const yUnite = 12 / (yMax - yMin)
  const xGraduations = Array.from(
    { length: (xMax - xMin) / 5 + 1 },
    (_, index) => xMin + 5 * index,
  )
  const yGraduations = [-15, -10, -5, 0, 5, 10, 15]
  const r = repere({
    xMin,
    xMax,
    xUnite,
    yMin,
    yMax,
    yUnite,
    xLabelMin: xMin,
    xLabelMax: xMax,
    yLabelMin: -15,
    yLabelMax: 15,
    xThickDistance: 5,
    xLabelDistance: 5,
    yThickDistance: 5,
    yLabelDistance: 5,
    grilleX: true,
    grilleXListe: xGraduations,
    grilleY: true,
    grilleYListe: yGraduations,
    grilleOpacite: 0.25,
    grilleSecondaire: false,
  })
  const cadre = [
    segment(xMin * xUnite, yMin * yUnite, xMax * xUnite, yMin * yUnite),
    segment(xMax * xUnite, yMin * yUnite, xMax * xUnite, yMax * yUnite),
    segment(xMax * xUnite, yMax * yUnite, xMin * xUnite, yMax * yUnite),
    segment(xMin * xUnite, yMax * yUnite, xMin * xUnite, yMin * yUnite),
  ]
  const xCourbeLabel = xMax - 2.5
  const yCourbeLabel = fonction(xCourbeLabel) * yUnite
  const label = latex2d(
    '\\mathcal C_f',
    xCourbeLabel * xUnite + 0.4,
    yCourbeLabel + orientation * 0.55,
    { color: bleuMathalea, letterSize: 'small' },
  )
  const tangentes = abscissesTangentes.flatMap((abscisseTangente, index) => {
    const xTangenteMin = Math.max(xMin, abscisseTangente - 5)
    const xTangenteMax = Math.min(xMax, abscisseTangente + 5)
    const ordonneeTangente = fonction(abscisseTangente)
    const penteTangente = derivee(abscisseTangente)
    const ordonneeALOrigine = (x: number) =>
      ordonneeTangente + penteTangente * (x - abscisseTangente)
    const tangente = segment(
      xTangenteMin * xUnite,
      ordonneeALOrigine(xTangenteMin) * yUnite,
      xTangenteMax * xUnite,
      ordonneeALOrigine(xTangenteMax) * yUnite,
      'red',
    )
    tangente.epaisseur = 1.5
    tangente.pointilles = 4
    const yLabelTangente = Math.max(
      (yMin + 1) * yUnite,
      Math.min(
        (yMax - 1) * yUnite,
        ordonneeALOrigine(xTangenteMin) * yUnite + 0.2,
      ),
    )
    const labelTangente = latex2d(
      nomTangente(index, abscissesTangentes.length),
      xTangenteMin * xUnite + 0.4,
      yLabelTangente,
      { color: 'red', letterSize: 'small' },
    )
    return [tangente, labelTangente]
  })

  return mathalea2d(
    {
      xmin: xMin * xUnite - 0.7,
      xmax: xMax * xUnite + 0.7,
      ymin: yMin * yUnite - 0.35,
      ymax: yMax * yUnite + 0.35,
      pixelsParCm: 25,
      scale: 1,
      center: !context.isHtml,
    },
    r,
    ...cadre,
    courbe(fonction, {
      repere: r,
      color: bleuMathalea,
      epaisseur: 2.5,
      xMin,
      xMax,
      yMin,
      yMax,
      step: 0.02,
    }),
    ...tangentes,
    label,
  )
}

type LigneDemandee = {
  type: 1 | 2 | 3
  abscisse: number
}

/**
 * Un seul graphique, plusieurs lignes à compléter : le signe de f, f' ou f''
 * en une abscisse.
 * @author Stéphane Guyon
 */
export default class SignesFonctionEtDerivees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = '1-2-3'
    this.sup2 = 3
    this.besoinFormulaireTexte = [
      'Signes demandés',
      [
        'Nombres séparés par des tirets  :',
        '1 : Signe de f',
        "2 : Signe de f'",
        "3 : Signe de f''",
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de questions sur le graphique',
      9,
    ]
  }

  nouvelleVersion(): void {
    const nbLignes = Math.max(
      1,
      Math.min(9, Math.round(Number(this.sup2)) || 3),
    )
    // Un seul graphique : les tirages ci-dessous sont les mêmes que lorsque
    // l'exercice posait toujours trois lignes (liens déjà partagés).
    const centre = choice(centres)
    const orientation = choice(orientations)
    const scenarioRelatif = choice(scenariosRelatifs)
    const scenario = [
      centre + scenarioRelatif.decalageF,
      centre + scenarioRelatif.decalageFPrime,
      centre + scenarioRelatif.decalageFSeconde,
    ]
    const f = (x: number) => {
      const u = (Math.PI * (x - centre)) / 20
      return orientation * (-17 * Math.sin(u) - Math.sin(3 * u))
    }
    const fPrime = (x: number) => {
      const u = (Math.PI * (x - centre)) / 20
      return (
        (orientation * Math.PI * (-17 * Math.cos(u) - 3 * Math.cos(3 * u))) / 20
      )
    }
    const fSeconde = (x: number) => {
      const u = (Math.PI * (x - centre)) / 20
      return (
        (orientation *
          Math.PI ** 2 *
          (17 * Math.sin(u) + 9 * Math.sin(3 * u))) /
        400
      )
    }
    const fonctions = [f, fPrime, fSeconde]

    // Types des lignes. Par défaut (1-2-3), f, f' et f'' défilent dans cet ordre,
    // sans tirage.
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      melangeMax: 3,
      defaut: 4,
      nbQuestions: nbLignes,
      shuffle: false,
    })
    const typesLignes = (
      new Set(types).size > 1 && String(this.sup) !== '1-2-3'
        ? shuffle(types)
        : types
    ) as Array<1 | 2 | 3>

    // La première ligne d'un type garde l'abscisse du scénario ; les suivantes
    // en prennent une autre, parmi celles des scénarios.
    const candidates = [0, 1, 2].map((t) => {
      const cle = ['decalageF', 'decalageFPrime', 'decalageFSeconde'][
        t
      ] as keyof ScenarioRelatif
      return [...new Set(scenariosRelatifs.map((sc) => centre + sc[cle]))]
    })
    const utilisees: number[][] = [[], [], []]
    const lignes: LigneDemandee[] = typesLignes.map((type) => {
      const t = type - 1
      let abscisse = scenario[t]
      if (utilisees[t].length > 0) {
        const restantes = candidates[t].filter((x) => !utilisees[t].includes(x))
        abscisse = choice(restantes.length > 0 ? restantes : candidates[t])
      }
      utilisees[t].push(abscisse)
      return { type, abscisse }
    })

    const abscisses = lignes.map((l) => l.abscisse)
    const xMinGraphique = Math.min(-5, Math.min(...abscisses) - 5)
    const xMaxGraphique = Math.max(...abscisses) + 5
    const abscissesTangentes = [
      ...new Set(lignes.filter((l) => l.type === 3).map((l) => l.abscisse)),
    ]
    const figure = graphique(
      f,
      fPrime,
      abscissesTangentes,
      orientation,
      xMinGraphique,
      xMaxGraphique,
    )

    // Sans interactivité, pas de points de suspension : seule la ligne à lire.
    const champSigne =
      this.interactif && context.isHtml && !context.isTypst ? ' : %{0}' : ''
    const champ = { choices: choixSignes, choix0: false }
    const sousQuestions = lignes.map(({ type, abscisse }) => {
      const a = texNombre(abscisse)
      const s = signe(fonctions[type - 1](abscisse))
      const reponse = { value: s, options: { texteSansCasse: true } }
      if (type === 1) {
        return {
          question: `$f(${a})$${champSigne}`,
          correction: `À l'abscisse $${a}$, la courbe est ${s === 'nul' ? "sur l'axe des abscisses" : s === 'positif' ? "au-dessus de l'axe des abscisses" : "en dessous de l'axe des abscisses"}. Donc $f(${a})$ est ${texteEnCouleurEtGras(s)}.`,
          answer: reponse,
          field: champ,
        }
      }
      if (type === 2) {
        const variation =
          s === 'nul'
            ? `la tangente à $\\mathcal C_f$ au point d'abscisse $${a}$ est horizontale`
            : `la fonction est ${s === 'positif' ? 'croissante' : 'décroissante'}`
        return {
          question: `$f'(${a})$${champSigne}`,
          correction: `Au voisinage de $${a}$, ${variation}. Donc $f'(${a})$ est ${texteEnCouleurEtGras(s)}.`,
          answer: reponse,
          field: champ,
        }
      }
      return {
        question: `$f''(${a})$${champSigne}`,
        correction:
          s === 'nul'
            ? `En $${a}$, la courbe traverse sa tangente. Elle admet donc un point d'inflexion et la fonction change de convexité au point d'abscisse $${a}$. Donc $f''(${a})$ est ${texteEnCouleurEtGras('nul')}.`
            : `Au voisinage de $${a}$, la courbe est localement ${s === 'positif' ? 'au-dessus' : 'en dessous'} de sa tangente : la fonction est ${s === 'positif' ? 'convexe' : 'concave'}. Donc $f''(${a})$ est ${texteEnCouleurEtGras(s)}.`,
        answer: reponse,
        field: champ,
      }
    })

    const consigne = this.interactif
      ? "Compléter avec l'aide du graphique :"
      : 'Déterminer graphiquement le signe de :'
    const sub = createSubQuestions(this, 0, sousQuestions)
    const textesTangentes = abscissesTangentes.map((x) => texNombre(x))
    const phraseTangente =
      textesTangentes.length === 0
        ? ''
        : textesTangentes.length === 1
          ? ` On a représenté en rouge la tangente $(T)$ à $\\mathcal C_f$ au point d'abscisse $${textesTangentes[0]}$.`
          : ` On a représenté en rouge les tangentes ${textesTangentes.map((_, k) => `$${nomTangente(k, textesTangentes.length)}$`).join(', ')} à $\\mathcal C_f$ aux points d'abscisses respectives ${textesTangentes.map((x) => `$${x}$`).join(', ')}.`
    const introduction = `On considère une fonction $f$ définie et deux fois dérivable sur $[${xMinGraphique}\\,;\\,${xMaxGraphique}]$. Sa courbe représentative $\\mathcal C_f$ est donnée ci-dessous dans un repère orthogonal.${phraseTangente}`
    // En Typst (feuille imprimée), les questions se placent à droite du graphique
    // pour gagner de la place ; ailleurs, elles restent sous la figure.
    this.listeQuestions[0] = context.isTypst
      ? `${introduction}<br>${deuxColonnesResp(figure, `${consigne}<br><br>${sub.question}`, { largeur1: 62, eleId: `TSA3-43-${this.numeroExercice}` })}`
      : `${introduction}<br>${figure}<br>
    ${consigne}<br><br>
    ${sub.question}`
    this.listeCorrections[0] = `On lit successivement la position de la courbe par rapport à l'axe des abscisses, puis les variations et la convexité de la fonction $f$.${sub.correction}`
    listeQuestionsToContenu(this)
  }
}
