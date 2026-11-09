import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer graphiquement l'ensemble de définition d'une fonction"
export const dateDePublication = '12/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const uuid = 'f14d1'
export const refs = {
  'fr-fr': ['2F15-1'],
  'fr-ch': [],
}

type TypeQuestion = 1 | 2 | 3 | 4

type DonneesQuestion = {
  graphique: string
  domaine: string
  distracteurs: string[]
  explication: string
  cle: string
}

function pointFerme(point: ReturnType<typeof pointAbstrait>) {
  const marque = tracePoint(point, bleuMathalea)
  marque.style = '.'
  marque.epaisseur = 2.5
  marque.taille = 2
  marque.opacite = 1
  return marque
}

function parentheseOuverte(
  point: ReturnType<typeof pointAbstrait>,
  cote: 'gauche' | 'droite',
) {
  return latex2d(cote === 'gauche' ? ')' : '(', point.x, point.y, {
    color: bleuMathalea,
    letterSize: 'normalsize',
  })
}

function labelCourbe(x: number, y: number) {
  return latex2d('\\mathcal C_f', x, y, {
    color: bleuMathalea,
    letterSize: 'small',
  })
}

function creerRepere(xMin: number, xMax: number) {
  return repere({
    xMin,
    xMax,
    yMin: -4.5,
    yMax: 4.5,
    grilleX: false,
    grilleY: false,
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
    axeXStyle: '->',
    axeYStyle: '->',
  })
}

function graphique(
  r: ReturnType<typeof repere>,
  objets: Parameters<typeof mathalea2d>[2][],
  xMin: number,
  xMax: number,
): string {
  const yMin = -4.5
  const yMax = 4.5
  return mathalea2d(
    {
      xmin: xMin - 0.2,
      xmax: xMax + 0.2,
      ymin: yMin - 0.2,
      ymax: yMax + 0.2,
      pixelsParCm: 22,
      scale: 0.65,
    },
    r,
    objets,
  )
}

function intervalleBorne(): DonneesQuestion {
  const a = randint(-5, -2)
  const b = randint(2, 5)
  const milieu = (a + b) / 2
  let yMin = randint(-3, -1)
  let yMax = yMin + randint(2, 4)
  while (yMin === a && yMax === b) {
    yMin = randint(-3, -1)
    yMax = yMin + randint(2, 4)
  }
  const f = (x: number) =>
    yMin + ((yMax - yMin) * 4 * (x - a) * (b - x)) / (b - a) ** 2
  const A = pointAbstrait(a, f(a), '')
  const B = pointAbstrait(b, f(b), '')
  const xMin = a - 2
  const xMax = b + 2
  const r = creerRepere(xMin, xMax)
  const objets = [
    courbe(f, {
      repere: r,
      xMin: a,
      xMax: b,
      color: bleuMathalea,
      epaisseur: 2.5,
      step: 0.05,
    }),
    pointFerme(A),
    pointFerme(B),
    labelCourbe(milieu, f(milieu) + 0.6),
  ]
  return {
    graphique: graphique(r, objets, xMin, xMax),
    domaine: `[${a}~;~${b}]`,
    distracteurs: [`[${yMin}~;~${yMax}]`, `]${a}~;~${b}[`, `[${a}~;~${b}[`],
    explication: `La courbe commence à l'abscisse $${a}$ et se termine à l'abscisse $${b}$. Les deux extrémités appartiennent à la courbe.`,
    cle: `1-${a}-${b}-${yMin}-${yMax}`,
  }
}

function intervalleSemiOuvert(): DonneesQuestion {
  const a = randint(-5, -2)
  const b = randint(2, 5)
  const ouvertAGauche = randint(0, 1) === 0
  let yA = randint(-3, -1)
  let yB = randint(1, 3)
  while (yA === a && yB === b) {
    yA = randint(-3, -1)
    yB = randint(1, 3)
  }
  const f = (x: number) => {
    const t = (x - a) / (b - a)
    return yA + (yB - yA) * (3 * t ** 2 - 2 * t ** 3)
  }
  const A = pointAbstrait(a, f(a), '')
  const B = pointAbstrait(b, f(b), '')
  const xMin = a - 2
  const xMax = b + 2
  const r = creerRepere(xMin, xMax)
  const objets = [
    courbe(f, {
      repere: r,
      xMin: a,
      xMax: b,
      color: bleuMathalea,
      epaisseur: 2.5,
      step: 0.05,
    }),
    ouvertAGauche ? parentheseOuverte(A, 'gauche') : pointFerme(A),
    ouvertAGauche ? pointFerme(B) : parentheseOuverte(B, 'droite'),
    labelCourbe((a + b) / 2, f((a + b) / 2) + 0.6),
  ]
  const domaine = ouvertAGauche ? `]${a}~;~${b}]` : `[${a}~;~${b}[`
  return {
    graphique: graphique(r, objets, xMin, xMax),
    domaine,
    distracteurs: [
      ouvertAGauche ? `]${yA}~;~${yB}]` : `[${yA}~;~${yB}[`,
      `[${a}~;~${b}]`,
      `]${a}~;~${b}[`,
    ],
    explication: ouvertAGauche
      ? `La courbe est tracée pour $x>${a}$ jusqu'à $x=${b}$. L'abscisse $${a}$ est exclue et l'abscisse $${b}$ est incluse.`
      : `La courbe est tracée de $x=${a}$ jusqu'aux valeurs strictement inférieures à $${b}$. L'abscisse $${a}$ est incluse et l'abscisse $${b}$ est exclue.`,
    cle: `2-${a}-${b}-${yA}-${yB}-${ouvertAGauche}`,
  }
}

function asymptoteVerticale(): DonneesQuestion {
  const a = randint(-3, 3)
  const signe = randint(0, 1) === 0 ? -1 : 1
  const decalage = randint(-2, 2, [a])
  const f = (x: number) => decalage + (2 * signe) / (x - a)
  const xMin = a - 5
  const xMax = a + 5
  const r = creerRepere(xMin, xMax)
  const asymptote = segment(a, -4.5, a, 4.5, 'gray')
  asymptote.pointilles = 5
  asymptote.epaisseur = 1.5
  const objets = [
    courbe(f, {
      repere: r,
      xMin,
      xMax: a - 0.15,
      yMin: -4.5,
      yMax: 4.5,
      color: bleuMathalea,
      epaisseur: 2.5,
      step: 0.02,
    }),
    courbe(f, {
      repere: r,
      xMin: a + 0.15,
      xMax,
      yMin: -4.5,
      yMax: 4.5,
      color: bleuMathalea,
      epaisseur: 2.5,
      step: 0.02,
    }),
    asymptote,
    labelCourbe(a + 2.5, f(a + 2.5) + 0.6),
  ]
  return {
    graphique: graphique(r, objets, xMin, xMax),
    domaine: `]-\\infty~;~${a}[\\,\\cup\\,]${a}~;~+\\infty[`,
    distracteurs: [
      '\\mathbb{R}',
      `]-\\infty~;~${a}[\\,\\cap\\,]${a}~;~+\\infty[`,
      `]-\\infty~;~${decalage}[\\,\\cup\\,]${decalage}~;~+\\infty[`,
    ],
    explication: `La courbe possède deux branches, mais aucun point d'abscisse $${a}$. La fonction est définie pour tout réel différent de $${a}$.`,
    cle: `3-${a}-${signe}-${decalage}`,
  }
}

function typeRacineCarree(): DonneesQuestion {
  const a = randint(-4, 4)
  const versLaDroite = randint(0, 1) === 0
  const signe = randint(0, 1) === 0 ? -1 : 1
  const decalage = randint(-2, 2, [a])
  const f = versLaDroite
    ? (x: number) => decalage + signe * 1.6 * Math.sqrt(x - a)
    : (x: number) => decalage + signe * 1.6 * Math.sqrt(a - x)
  const xMin = versLaDroite ? a - 2 : a - 7
  const xMax = versLaDroite ? a + 7 : a + 2
  const r = creerRepere(xMin, xMax)
  const extremite = pointAbstrait(a, f(a), '')
  const objets = [
    courbe(f, {
      repere: r,
      xMin: versLaDroite ? a : xMin,
      xMax: versLaDroite ? xMax : a,
      yMin: -4.5,
      yMax: 4.5,
      color: bleuMathalea,
      epaisseur: 2.5,
      step: 0.03,
    }),
    pointFerme(extremite),
    labelCourbe(
      versLaDroite ? a + 3.5 : a - 3.5,
      f(versLaDroite ? a + 3.5 : a - 3.5) + 0.6,
    ),
  ]
  return {
    graphique: graphique(r, objets, xMin, xMax),
    domaine: versLaDroite ? `[${a}~;~+\\infty[` : `]-\\infty~;~${a}]`,
    distracteurs: versLaDroite
      ? [
          signe > 0 ? `[${decalage}~;~+\\infty[` : `]-\\infty~;~${decalage}]`,
          `]${a}~;~+\\infty[`,
          '\\mathbb{R}',
        ]
      : [
          signe > 0 ? `[${decalage}~;~+\\infty[` : `]-\\infty~;~${decalage}]`,
          `]-\\infty~;~${a}[`,
          '\\mathbb{R}',
        ],
    explication: versLaDroite
      ? `La courbe commence à l'abscisse $${a}$, qui est incluse, puis se poursuit indéfiniment vers la droite.`
      : `La courbe se poursuit indéfiniment vers la gauche et se termine à l'abscisse $${a}$, qui est incluse.`,
    cle: `4-${a}-${versLaDroite}-${signe}-${decalage}`,
  }
}

function creerQuestion(type: TypeQuestion): DonneesQuestion {
  switch (type) {
    case 1:
      return intervalleBorne()
    case 2:
      return intervalleSemiOuvert()
    case 3:
      return asymptoteVerticale()
    case 4:
      return typeRacineCarree()
  }
}

/**
 * @author Stéphane Guyon
 */
export default class DomaineDefinitionGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Mode de réponse',
      2,
      '1 : QCM\n2 : Question ouverte',
    ]
  }

  nouvelleVersion(): void {
    const listeTypes = combinaisonListes<TypeQuestion>(
      [1, 2, 3, 4],
      this.nbQuestions,
    )
    const modeQcm = this.sup === 1

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const donnees = creerQuestion(listeTypes[i])
      const enonce = `La courbe $\\mathcal C_f$ représente une fonction $f$.<br>${donnees.graphique}<br>Quel est l'ensemble de définition $D_f$ de la fonction $f$ ?`
      let texte = enonce
      let correction = `${donnees.explication}<br>Ainsi, $D_f=${miseEnEvidence(donnees.domaine)}$.`

      if (modeQcm) {
        const propositions = shuffle([
          { texte: `$${donnees.domaine}$`, statut: true },
          ...donnees.distracteurs.map((distracteur) => ({
            texte: `$${distracteur}$`,
            statut: false,
          })),
        ])
        this.autoCorrection[i] = {
          enonce,
          options: { ordered: true, radio: true },
          propositions,
        }
        const qcm = propositionsQcm(this, i)
        texte += qcm.texte
        correction = `${qcm.texteCorr}${correction}`
      }

      if (this.questionJamaisPosee(i, donnees.cle)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
