import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import {
  createSubQuestions,
  type SubQuestion,
} from '../../lib/interactif/subQuestions'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Analyser la convexité à partir de tangentes'
export const dateDePublication = '03/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = '53a0d'

export const refs = {
  'fr-fr': ['TSA3-48', 'TCA7-49'],
  'fr-ch': [],
}

type Modele = {
  f: (x: number) => number
  fPrime: (x: number) => number
  fSeconde: (x: number) => number
  /** Abscisses des points d'inflexion, dans l'ordre croissant. */
  inflexions: number[]
  xMin: number
  xMax: number
}

const yMax = 5
/** Une couleur par tangente : code de couleur et nom français. */
const couleursTangentes = [
  { code: 'red', nom: 'rouge' },
  { code: 'green', nom: 'vert' },
  { code: 'purple', nom: 'violet' },
  { code: 'orange', nom: 'orange' },
  { code: 'magenta', nom: 'rose' },
]
const choixConvexite = [
  { label: 'Choisir', value: '' },
  { label: 'convexe', value: 'convexe' },
  { label: 'concave', value: 'concave' },
]

/**
 * Fonction « sinusoïdale » (avec un terme affine). Les points d'inflexion sont
 * aux zéros du sinus, donc à abscisses entières ; sans point d'inflexion, on
 * reste sur un seul arc de cosinus. Mise à l'échelle pour remplir la fenêtre
 * [-5 ; 5] en ordonnée.
 */
function construireModele(
  nbInflexions: 0 | 1 | 2,
  extremumsEntiers: boolean,
): Modele {
  const signe = choice([1, -1])
  const centre = randint(-2, 2)
  // Demi-période : aucun zéro, un seul zéro dans la fenêtre, ou deux.
  const p =
    nbInflexions === 0
      ? 8
      : nbInflexions === 1
        ? 4
        : extremumsEntiers
          ? 4
          : choice([3, 4])
  const marge = nbInflexions === 2 ? p - 1 : 3
  const xMin = centre - marge
  const xMax = centre + (nbInflexions === 2 ? p + marge : marge)
  const omega = Math.PI / p
  // Sans terme affine, les extremums sont à abscisses entières.
  const pente = extremumsEntiers ? 0 : choice([-1, 0, 1]) * 0.5 * omega
  const cosinus = nbInflexions === 0
  const brut = (u: number) =>
    signe * (cosinus ? Math.cos(omega * u) : Math.sin(omega * u)) + pente * u
  let mini = Infinity
  let maxi = -Infinity
  for (let x = xMin; x <= xMax; x += 0.05) {
    const y = brut(x - centre)
    mini = Math.min(mini, y)
    maxi = Math.max(maxi, y)
  }
  const milieu = (maxi + mini) / 2
  const echelle = (yMax - 0.5) / ((maxi - mini) / 2)
  return {
    f: (x) => echelle * (brut(x - centre) - milieu),
    fPrime: (x) => {
      const t = omega * (x - centre)
      return (
        echelle *
        (signe * omega * (cosinus ? -Math.sin(t) : Math.cos(t)) + pente)
      )
    },
    fSeconde: (x) => {
      const t = omega * (x - centre)
      return (
        -echelle * signe * omega ** 2 * (cosinus ? Math.cos(t) : Math.sin(t))
      )
    },
    inflexions:
      nbInflexions === 0
        ? []
        : nbInflexions === 1
          ? [centre]
          : [centre, centre + p],
    xMin,
    xMax,
  }
}

/** Nom de la tangente : (T) s'il n'y en a qu'une, sinon (T_1), (T_2)… */
function nomTangente(index: number, nombre: number): string {
  return nombre === 1 ? '(T)' : `(T_{${index + 1}})`
}

function graphique(modele: Modele, abscissesTangentes: number[]): string {
  const { f, fPrime, xMin, xMax } = modele
  const xUnite = Math.min(3.5, 19 / (xMax - xMin))
  const yUnite = 1
  const r = repere({
    xMin,
    xMax,
    xUnite,
    yMin: -yMax,
    yMax,
    yUnite,
    xLabelMin: xMin,
    xLabelMax: xMax,
    yLabelMin: -yMax + 1,
    yLabelMax: yMax - 1,
    xThickDistance: 1,
    xLabelDistance: 1,
    yThickDistance: 1,
    yLabelDistance: 1,
    grilleX: true,
    grilleXListe: Array.from({ length: xMax - xMin + 1 }, (_, k) => xMin + k),
    grilleY: true,
    grilleYListe: Array.from({ length: 2 * yMax + 1 }, (_, k) => k - yMax),
    grilleOpacite: 0.25,
    grilleSecondaire: false,
  })
  const cadre = [
    segment(xMin * xUnite, -yMax * yUnite, xMax * xUnite, -yMax * yUnite),
    segment(xMax * xUnite, -yMax * yUnite, xMax * xUnite, yMax * yUnite),
    segment(xMax * xUnite, yMax * yUnite, xMin * xUnite, yMax * yUnite),
    segment(xMin * xUnite, yMax * yUnite, xMin * xUnite, -yMax * yUnite),
  ]
  const tangentes = abscissesTangentes.flatMap((x0, index) => {
    // Longueur fixe à l'écran (4,4 cm), quelle que soit la pente.
    const direction = Math.hypot(xUnite, fPrime(x0) * yUnite)
    const dx = (2.2 * xUnite) / direction
    // La tangente reste dans le cadre du graphique.
    const penteTangente = fPrime(x0)
    let demiLargeur = dx
    const sortDuCadre = (h: number) =>
      x0 - h < xMin ||
      x0 + h > xMax ||
      Math.abs(f(x0) + penteTangente * h) > yMax ||
      Math.abs(f(x0) - penteTangente * h) > yMax
    while (sortDuCadre(demiLargeur) && demiLargeur > 0.2) demiLargeur -= 0.05
    const xA = x0 - demiLargeur
    const xB = x0 + demiLargeur
    const yA = f(x0) + fPrime(x0) * (xA - x0)
    const yB = f(x0) + fPrime(x0) * (xB - x0)
    const couleur = couleursTangentes[index % couleursTangentes.length].code
    const tangente = segment(
      xA * xUnite,
      yA * yUnite,
      xB * xUnite,
      yB * yUnite,
      couleur,
    )
    tangente.epaisseur = 1.5
    const etiquette = latex2d(
      nomTangente(index, abscissesTangentes.length),
      Math.min(xB * xUnite + 0.45, (xMax - 0.6) * xUnite),
      Math.max(
        -yMax * yUnite + 0.3,
        Math.min(yMax * yUnite - 0.3, yB * yUnite + (yB >= yA ? 0.2 : -0.2)),
      ),
      { color: couleur, letterSize: 'small' },
    )
    const marque = tracePoint(
      pointAbstrait(x0 * xUnite, f(x0) * yUnite),
      couleur,
    )
    marque.epaisseur = 2
    return [tangente, marque, etiquette]
  })
  return mathalea2d(
    {
      xmin: xMin * xUnite - 0.7,
      xmax: xMax * xUnite + 0.7,
      ymin: -yMax * yUnite - 0.35,
      ymax: yMax * yUnite + 0.35,
      pixelsParCm: 25,
      scale: 1,
      center: !context.isHtml,
    },
    r,
    ...cadre,
    courbe(f, {
      repere: r,
      color: bleuMathalea,
      epaisseur: 3.5,
      xMin,
      xMax,
      yMin: -yMax,
      yMax,
      step: 0.02,
    }),
    ...tangentes,
  )
}

function intervalle(a: number, b: number): string {
  return `[${texNombre(a)}\\,;\\,${texNombre(b)}]`
}

/** Abscisses où f' s'annule dans ]xMin + 0.7 ; xMax - 0.7[ (extremums). */
function racinesDeLaDerivee(modele: Modele): number[] {
  const { fPrime, xMin, xMax } = modele
  const racines: number[] = []
  const pas = 0.02
  for (let x = xMin + 0.7; x < xMax - 0.7; x += pas) {
    if (fPrime(x) * fPrime(x + pas) <= 0) {
      let gauche = x
      let droite = x + pas
      for (let k = 0; k < 40; k++) {
        const milieu = (gauche + droite) / 2
        if (fPrime(gauche) * fPrime(milieu) <= 0) droite = milieu
        else gauche = milieu
      }
      racines.push((gauche + droite) / 2)
    }
  }
  return racines
}

/**
 * Une courbe avec quelques tangentes tracées : à partir de la position de la
 * courbe par rapport à une tangente, on détermine la convexité au voisinage
 * de son point de tangence.
 * @author Stéphane Guyon
 */
export default class ConvexiteParTangentes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 2
    this.sup2 = 4
    this.besoinFormulaireNumerique = [
      'Nombre de tangentes',
      3,
      '1 : Deux\n2 : Trois\n3 : Quatre',
    ]
    this.besoinFormulaire2Numerique = [
      "Nombre de points d'inflexion de la courbe",
      4,
      '1 : Aucun\n2 : Un\n3 : Deux\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    // Tangentes horizontales (aux extremums) et en des points entiers.
    const tangentesDemandees = new Set([1, 2])
    const nbTangentes = 1 + Math.max(1, Math.min(3, Number(this.sup) || 2))
    // Avec champs de saisie : « … : [champ] ». Sans : énoncé à l'infinitif.
    const avecChamps = this.interactif && context.isHtml && !context.isTypst

    // Un seul graphique : `nbQuestions` est le nombre de questions posées dessus.
    for (let i = 0, cpt = 0; i < 1 && cpt < 50; cpt++) {
      const nbInflexions: 0 | 1 | 2 =
        Number(this.sup2) === 1
          ? 0
          : Number(this.sup2) === 2
            ? 1
            : Number(this.sup2) === 3
              ? 2
              : choice([0, 1, 2])
      const modele = construireModele(nbInflexions, tangentesDemandees.has(2))
      const { f, fSeconde, inflexions, xMin, xMax } = modele

      // Choix des abscisses de tangence : horizontales (extremums) puis points
      // entiers, à distance d'au moins 0,7 des points d'inflexion et entre eux.
      const abscisses: number[] = []
      const libre = (x: number) =>
        !inflexions.some((t) => Math.abs(t - x) < 0.7) &&
        !abscisses.some((t) => Math.abs(t - x) < 0.9)
      if (tangentesDemandees.has(2)) {
        const maxHorizontales = tangentesDemandees.has(1)
          ? Math.min(2, nbTangentes - 1)
          : nbTangentes
        for (const racine of shuffle(racinesDeLaDerivee(modele))) {
          const x = Math.round(racine)
          if (
            Math.abs(racine - x) < 0.05 &&
            abscisses.length < maxHorizontales &&
            libre(x)
          ) {
            abscisses.push(x)
          }
        }
      }
      const entiers: number[] = []
      for (let x = Math.ceil(xMin) + 1; x <= xMax - 1; x++) entiers.push(x)
      for (const x of shuffle(entiers)) {
        if (abscisses.length < nbTangentes && libre(x)) abscisses.push(x)
      }
      if (abscisses.length < 2) continue
      abscisses.sort((a, b) => a - b)
      const nb = abscisses.length
      // Chaque tangente est nommée dans sa couleur.
      const noms = abscisses.map((_, k) =>
        texteEnCouleur(
          `$${nomTangente(k, nb)}$`,
          couleursTangentes[k % couleursTangentes.length].code,
        ),
      )
      // L'abscisse de chaque point de tangence est aussi dans la couleur de sa tangente.
      const absc = abscisses.map((x, k) =>
        texteEnCouleur(
          `$${texNombre(x)}$`,
          couleursTangentes[k % couleursTangentes.length].code,
        ),
      )
      const positions = abscisses.map((x) =>
        fSeconde(x) > 0 ? 'au-dessus' : 'en dessous',
      )

      // Une question par point de tangence tiré, au plus une par tangente.
      const nbPosees = Math.max(
        1,
        Math.min(abscisses.length, Math.round(Number(this.nbQuestions)) || 1),
      )
      const indices = shuffle(abscisses.map((_, k) => k))
        .slice(0, nbPosees)
        .sort((a, b) => a - b)
      const sousQuestions: SubQuestion[] = indices.map((k) => {
        const convexe = positions[k] === 'au-dessus'
        const reponse = convexe ? 'convexe' : 'concave'
        return {
          question: avecChamps
            ? `Au voisinage du point d'abscisse ${absc[k]}, la fonction $f$ est : %{0}`
            : `Préciser la convexité de $f$ au voisinage du point d'abscisse ${absc[k]}.`,
          correction: `Au voisinage du point d'abscisse ${absc[k]}, la courbe est ${positions[k]} de sa tangente ${noms[k]}. La fonction $f$ est donc ${texteEnCouleurEtGras(reponse)}.`,
          answer: { value: reponse, options: { texteSansCasse: true } },
          field: { choices: choixConvexite, choix0: false },
        }
      })
      if (sousQuestions.length === 0) continue

      if (
        this.questionJamaisPosee(
          i,
          nbInflexions,
          ...abscisses.map((x) => x.toFixed(2)),
          f(xMin).toFixed(2),
        )
      ) {
        const figure = graphique(modele, abscisses)
        const sub = createSubQuestions(this, i, sousQuestions, {
          bareme: troisPointsProportionnels,
          // Pas de repère « a) » pour une question unique.
          labels: sousQuestions.length > 1,
        })
        const phraseTangentes = abscisses
          .map(
            (_, k) =>
              `${noms[k]} en ${couleursTangentes[k % couleursTangentes.length].nom}, au point d'abscisse ${absc[k]}`,
          )
          .join(' ; ')
        this.listeQuestions[i] =
          `On considère une fonction $f$ définie et deux fois dérivable sur $${intervalle(xMin, xMax)}$. Sa courbe représentative $\\mathcal C_f$ est donnée ci-dessous, avec quelques-unes de ses tangentes : ${phraseTangentes}.<br>${figure}<br>
    ${avecChamps ? 'Compléter à partir du graphique.' : 'Répondre à partir du graphique :'}<br><br>
    ${sub.question}`
        this.listeCorrections[i] = sub.correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
