import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import {
  createSubQuestions,
  type SubQuestion,
} from '../../lib/interactif/subQuestions'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire graphiquement la convexité d'une fonction"
export const dateDePublication = '03/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = 'f5102'

export const refs = {
  'fr-fr': ['TSA3-47', 'TCA7-48'],
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
const choixPosition = [
  { label: 'Choisir', value: '' },
  { label: 'est au-dessus de', value: 'au-dessus' },
  { label: 'est en dessous de', value: 'en dessous' },
  { label: 'traverse', value: 'traverse' },
]

/**
 * Fonction « sinusoïdale » (avec un terme affine). Les points d'inflexion sont
 * aux zéros du sinus, donc à abscisses entières ; sans point d'inflexion, on
 * reste sur un seul arc de cosinus. Mise à l'échelle pour remplir la fenêtre
 * [-5 ; 5] en ordonnée.
 */
function construireModele(nbInflexions: 0 | 1 | 2): Modele {
  const signe = choice([1, -1])
  const centre = randint(-2, 2)
  // Demi-période : aucun zéro, un seul zéro dans la fenêtre, ou deux.
  const p = nbInflexions === 0 ? 8 : nbInflexions === 1 ? 4 : choice([3, 4])
  const marge = nbInflexions === 2 ? p - 1 : 3
  const xMin = centre - marge
  const xMax = centre + (nbInflexions === 2 ? p + marge : marge)
  const omega = Math.PI / p
  const pente = choice([-1, 0, 1]) * 0.5 * omega
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
  const xUnite = Math.min(3, 17 / (xMax - xMin))
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

/**
 * Lecture graphique de la convexité d'une fonction sur un intervalle borné :
 * intervalles de convexité et de concavité, abscisses des points d'inflexion
 * et position de la courbe par rapport à quelques tangentes.
 * @author Stéphane Guyon
 */
export default class LireConvexiteGraphiquement extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '1-2-3-4'
    this.sup2 = '1'
    this.sup3 = 4
    this.besoinFormulaireTexte = [
      'Lectures demandées',
      [
        'Nombres séparés par des tirets  :',
        '1 : Intervalles de convexité et de concavité',
        "2 : Nombre de points d'inflexion",
        "3 : Abscisses des points d'inflexion",
        '4 : Position de la courbe par rapport à sa tangente',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Tangentes',
      [
        'Nombres séparés par des tirets  :',
        "1 : Aux points d'inflexion",
        '2 : Une tangente horizontale',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Numerique = [
      "Nombre de points d'inflexion",
      4,
      '1 : Aucun\n2 : Un\n3 : Deux\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const demandes = String(this.sup)
      .split('-')
      .map(Number)
      .filter((n) => n >= 1 && n <= 4)
    const lectures = new Set(
      demandes.length === 0 || String(this.sup).includes('5')
        ? [1, 2, 3, 4]
        : demandes,
    )
    const typesTangentes = String(this.sup2)
      .split('-')
      .map(Number)
      .filter((n) => n >= 1 && n <= 2)
    const tangentesDemandees = new Set(
      String(this.sup2).includes('3') || typesTangentes.length === 0
        ? [1, 2]
        : typesTangentes,
    )
    const tracerTangentes = tangentesDemandees.has(1)
    // Avec champs de saisie : « … est : [champ] ». Sans : énoncé à l'infinitif.
    const avecChamps = this.interactif && context.isHtml && !context.isTypst

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nbInflexions: 0 | 1 | 2 =
        Number(this.sup3) === 1
          ? 0
          : Number(this.sup3) === 2
            ? 1
            : Number(this.sup3) === 3
              ? 2
              : choice([0, 1, 2])
      const modele = construireModele(nbInflexions)
      const { f, fPrime, fSeconde, inflexions, xMin, xMax } = modele

      const bornes = [xMin, ...inflexions, xMax]
      const morceaux = bornes.slice(0, -1).map((debut, k) => {
        const fin = bornes[k + 1]
        const convexe = fSeconde((debut + fin) / 2) > 0
        return { debut, fin, convexe }
      })

      // Tangentes tracées aux points d'inflexion et à l'extremum. Ailleurs, un
      // seul point : la position de la courbe est demandée, sans tangente.
      const tangentes = new Set<number>()
      const autresPoints = new Set<number>()
      if (tracerTangentes) {
        inflexions.forEach((x) => tangentes.add(x))
      }
      if (lectures.has(4)) {
        // Un seul point, au hasard, à distance d'au moins 1 des bornes de son
        // intervalle de convexité.
        const candidats: number[] = []
        for (const morceau of morceaux) {
          for (
            let x = Math.ceil(morceau.debut) + 1;
            x <= morceau.fin - 1;
            x++
          ) {
            if (x > xMin + 0.5 && x < xMax - 0.5) candidats.push(x)
          }
        }
        if (candidats.length > 0) autresPoints.add(choice(candidats))
      }
      // Tangente horizontale : en un point où f' s'annule (extremum).
      if (tangentesDemandees.has(2)) {
        const racines: number[] = []
        const pas = 0.02
        for (let x = xMin + 0.5; x < xMax - 0.5; x += pas) {
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
        if (racines.length > 0) tangentes.add(choice(racines))
      }
      const abscissesTangentes = [...tangentes].sort((a, b) => a - b)

      const abscissesInflexions = inflexions.map((x) => `$${texNombre(x)}$`)
      const unSeul = inflexions.length === 1
      const lieu = unSeul
        ? `au point d'abscisse ${abscissesInflexions[0]}`
        : `aux points d'abscisses ${abscissesInflexions.join(' et ')}`
      const listeMorceaux = morceaux
        .map((m) => `$${intervalle(m.debut, m.fin)}$`)
        .join(morceaux.length === 2 ? ' et ' : ', ')
      const analyse =
        inflexions.length === 0
          ? `On observe la courbe : elle ne change jamais de courbure et aucune tangente ne la traverse. La fonction $f$ ne change donc pas de convexité sur $${intervalle(xMin, xMax)}$.`
          : `On observe la courbe : ${
              tracerTangentes
                ? `${lieu}, la tangente traverse la courbe`
                : `${lieu}, la courbure de la courbe change (de « cuvette » à « bosse », ou l'inverse)`
            }. ${unSeul ? "C'est un point d'inflexion" : "Ce sont des points d'inflexion"} : la convexité de $f$ y change. On découpe donc $${intervalle(xMin, xMax)}$ en ${listeMorceaux}, puis on regarde la courbure de la courbe sur ${unSeul ? 'chacun de ces deux intervalles' : 'chacun de ces intervalles'} : une « cuvette » indique une fonction convexe, une « bosse » une fonction concave.`
      const sousQuestions: SubQuestion[] = []
      if (lectures.has(1)) {
        for (const convexe of [true, false]) {
          const nom = convexe ? 'convexe' : 'concave'
          const pieces = morceaux.filter((m) => m.convexe === convexe)
          // Un intervalle suffit : n'importe lequel des intervalles obtenus est
          // accepté (une réunion de deux intervalles n'est pas un intervalle).
          const reponses =
            pieces.length === 0
              ? ['\\emptyset']
              : pieces.map((m) => `[${m.debut};${m.fin}]`)
          const affichages = pieces.map(
            (m) => `$${miseEnEvidence(intervalle(m.debut, m.fin))}$`,
          )
          sousQuestions.push({
            question: avecChamps
              ? `La fonction $f$ est ${nom} sur l'intervalle : %{0}`
              : `Donner un intervalle sur lequel $f$ est ${nom}.`,
            correction:
              pieces.length === 0
                ? `$f$ n'est ${nom} sur aucun des intervalles obtenus. La réponse est $${miseEnEvidence('\\emptyset')}$.`
                : pieces.length === 1
                  ? `La fonction $f$ est ${nom} sur ${affichages[0]}.`
                  : `La fonction $f$ est ${nom} sur ${affichages.join(' et sur ')}. Un seul de ces intervalles est attendu, car leur réunion n'est pas un intervalle.`,
            answer: { value: reponses, options: { intervalle: true } },
            field: { keyboard: KeyboardType.clavierEnsemble },
          })
        }
      }
      const nb = inflexions.length
      if (lectures.has(2)) {
        sousQuestions.push({
          question: avecChamps
            ? `Nombre de points d'inflexion de $\\mathcal C_f$ : %{0}`
            : `Donner le nombre de points d'inflexion de $\\mathcal C_f$.`,
          correction:
            nb === 0
              ? `La courbe ne traverse aucune de ses tangentes : $f$ ne change jamais de convexité. Il y a $${miseEnEvidence(0)}$ point d'inflexion.`
              : `La courbe traverse sa tangente, et $f$ change de convexité, en ${nb === 1 ? 'un seul point' : `${nb} points`}. Il y a donc $${miseEnEvidence(nb)}$ point${nb > 1 ? 's' : ''} d'inflexion.`,
          answer: { value: nb },
        })
      }
      if (lectures.has(3)) {
        const liste = inflexions.join(';')
        sousQuestions.push({
          question: avecChamps
            ? `Abscisses des points d'inflexion, séparées par des « ; » : %{0}`
            : `Donner les abscisses des points d'inflexion de $\\mathcal C_f$.`,
          correction:
            nb === 0
              ? `Il n'y a aucun point d'inflexion : la réponse est $${miseEnEvidence('\\emptyset')}$.`
              : `${nb === 1 ? "L'abscisse du point d'inflexion est" : "Les abscisses des points d'inflexion sont"} $${miseEnEvidence(inflexions.map((x) => texNombre(x)).join(' ; '))}$.`,
          answer:
            nb === 0
              ? { value: '\\emptyset', options: { ensembleDeNombres: true } }
              : { value: liste, options: { suiteDeNombres: true } },
          field: { keyboard: KeyboardType.clavierEnsemble },
        })
      }
      if (lectures.has(4)) {
        ;[...autresPoints]
          .sort((a, b) => a - b)
          .forEach((x) => {
            const s = fSeconde(x)
            const reponse =
              Math.abs(s) < 1e-9
                ? 'traverse'
                : s > 0
                  ? 'au-dessus'
                  : 'en dessous'
            const morceau = morceaux.find((m) => x > m.debut && x < m.fin)
            const mot = reponse === 'traverse' ? 'traverse' : `est ${reponse} de`
            sousQuestions.push({
              question: avecChamps
                ? `Au voisinage de $${texNombre(x)}$, la courbe $\\mathcal C_f$ %{0} sa tangente en ce point.`
                : `Préciser la position de $\\mathcal C_f$ par rapport à sa tangente au point d'abscisse $${texNombre(x)}$.`,
              correction:
                reponse === 'traverse' || morceau == null
                  ? `La courbe traverse sa tangente en $${texNombre(x)}$ : c'est un point d'inflexion.`
                  : `On sait que $f$ est ${reponse === 'au-dessus' ? 'convexe' : 'concave'} sur $${intervalle(morceau.debut, morceau.fin)}$, donc la courbe est ${reponse} de ses tangentes sur cet intervalle. Au voisinage de $${texNombre(x)}$, la courbe $\\mathcal C_f$ ${texteEnCouleurEtGras(mot)} sa tangente en ce point.`,
              answer: { value: reponse, options: { texteSansCasse: true } },
              field: { choices: choixPosition, choix0: false },
            })
          })
      }
      if (sousQuestions.length === 0) {
        cpt++
        continue
      }

      if (
        this.questionJamaisPosee(
          i,
          nbInflexions,
          ...inflexions,
          ...abscissesTangentes,
          f(xMin).toFixed(2),
        )
      ) {
        const figure = graphique(modele, abscissesTangentes)
        const sub = createSubQuestions(this, i, sousQuestions, {
          bareme: troisPointsProportionnels,
        })
        const nbTangentes = abscissesTangentes.length
        const phraseTangentes =
          nbTangentes === 0
            ? ''
            : nbTangentes === 1
              ? ` On a tracé en ${couleursTangentes[0].nom} la tangente $(T)$ à $\\mathcal C_f$.`
              : ` On a tracé des tangentes à $\\mathcal C_f$ : ${abscissesTangentes
                  .map(
                    (_, k) =>
                      `$${nomTangente(k, nbTangentes)}$ en ${couleursTangentes[k % couleursTangentes.length].nom}`,
                  )
                  .join(', ')}.`
        this.listeQuestions[i] =
          `On considère une fonction $f$ définie et deux fois dérivable sur $${intervalle(xMin, xMax)}$. Sa courbe représentative $\\mathcal C_f$ est donnée ci-dessous.${phraseTangentes}<br>${figure}<br>
    ${avecChamps ? 'Compléter par lecture graphique.' : 'Répondre par lecture graphique.'}${avecChamps && (lectures.has(1) || lectures.has(3)) ? `<br>${texteGras('Consigne :')}${lectures.has(1) ? " Donner un intervalle au choix s'il y en a plusieurs." : ''} Écrire $\\emptyset$ s'il n'y a aucun intervalle ou aucun point d'inflexion.` : ''}<br><br>
    ${sub.question}`
        this.listeCorrections[i] =
          lectures.has(4) && lectures.size === 1
            ? sub.correction
            : `${analyse}<br>${sub.correction}`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
