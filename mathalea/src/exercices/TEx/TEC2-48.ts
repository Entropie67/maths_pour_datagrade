import { cercleCentrePoint } from '../../lib/2d/cercle'
import { grille } from '../../lib/2d/Grille'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le module et l’argument du conjugué, de l’opposé et de multiples d’un nombre complexe'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '31/10/2026'
export const uuid = '62042'
export const refs = {
  'fr-fr': ['TEC2-48'],
  'fr-ch': [],
}

/** Angle exprimé en multiple rationnel de π : `[n, d]` désigne nπ/d. */
type Angle = [number, number]

/** Écriture LaTeX de nπ/d, simplifiée. */
function texAngle([n, d]: Angle): string {
  if (n === 0) return '0'
  const g = pgcd(Math.abs(n), d)
  const num = n / g
  const den = d / g
  const signe = num < 0 ? '-' : ''
  const absNum = Math.abs(num)
  const pi = absNum === 1 ? '\\pi' : `${absNum}\\pi`
  return den === 1 ? `${signe}${pi}` : `${signe}\\dfrac{${pi}}{${den}}`
}

/** Ramène nπ/d dans l'intervalle ]-π ; π]. */
function argumentPrincipal([n, d]: Angle): Angle {
  let m = n
  while (m > d) m -= 2 * d
  while (m <= -d) m += 2 * d
  return [m, d]
}

/** Arguments (en multiples de π/12) autres que 0 et π, dans ]-π ; π]. */
const ANGLES: Angle[] = [
  [1, 6],
  [1, 4],
  [1, 3],
  [2, 3],
  [3, 4],
  [5, 6],
  [-1, 6],
  [-1, 4],
  [-1, 3],
  [-2, 3],
  [-3, 4],
  [-5, 6],
]

/**
 * Figure : plan complexe, cercle de centre O et de rayon |z|, point M d'affixe
 * z et point d'affixe zk, reliés à O.
 * `phi` est l'argument de zk en radians.
 */
function figure(
  r: number,
  theta: Angle,
  nomZk: string,
  module: number,
  phi: number,
): string {
  const thetaRad = (theta[0] * Math.PI) / theta[1]
  const bord = Math.ceil(Math.max(r, module)) + 1
  const O = pointAbstrait(0, 0)
  const etiquette = (
    texte: string,
    x: number,
    y: number,
    couleur = 'black',
    taille = 6,
  ) =>
    latexParPoint(
      texte,
      pointAbstrait(x, y, '', 'center'),
      couleur,
      30,
      12,
      '',
      taille,
    )
  const objets: ObjetMathalea2D[] = [
    grille(-bord, -bord, bord, bord, 'gray', 0.4, 1),
    segment(
      pointAbstrait(-bord - 0.3, 0),
      pointAbstrait(bord + 0.3, 0),
      'black',
      '->',
    ),
    segment(
      pointAbstrait(0, -bord - 0.3),
      pointAbstrait(0, bord + 0.3),
      'black',
      '->',
    ),
    etiquette('O', -0.35, -0.35),
  ]
  const cercle = cercleCentrePoint(O, pointAbstrait(r, 0), bleuMathalea)
  cercle.pointilles = 5
  objets.push(cercle)
  const memeDemiDroite = Math.abs(Math.cos(phi - thetaRad) - 1) < 1e-9
  const place = (
    rayon: number,
    angle: number,
    nom: string,
    couleur: string,
    decalage: number,
  ) => {
    const x = rayon * Math.cos(angle)
    const y = rayon * Math.sin(angle)
    objets.push(segment(O, pointAbstrait(x, y), couleur))
    const marque = tracePoint(pointAbstrait(x, y), couleur)
    marque.taille = 5
    marque.epaisseur = 2.5
    marque.opacite = 1
    objets.push(marque)
    // Étiquette au-delà du point, ou sur le côté si deux points sont alignés.
    const a = angle + decalage
    const d = decalage === 0 ? 0.8 : 0.9
    objets.push(
      etiquette(
        `\\mathbf{${nom}}`,
        x + d * Math.cos(a),
        y + d * Math.sin(a),
        couleur,
        10,
      ),
    )
  }
  place(r, thetaRad, 'z', bleuMathalea, memeDemiDroite ? Math.PI / 2 : 0)
  place(module, phi, nomZk, 'red', 0)
  return mathalea2d(
    {
      xmin: -bord - 0.8,
      xmax: bord + 0.8,
      ymin: -bord - 0.8,
      ymax: bord + 0.8,
      scale: 7.5 /(2 * bord + 1.6),
    },
    ...objets,
  )
}

/**
 * Connaissant la forme trigonométrique de z, donner sans calcul le module et
 * un argument de son conjugué, de son opposé ou d'un multiple réel de z.
 * @author Stéphane Guyon
 */
export default class ModuleArgumentConjugueOppose extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Conjugué',
        '2 : Opposé',
        '3 : Multiple positif',
        '4 : Multiple négatif',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion(): void {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    // Un seul z pour toutes les questions.
    const r = randint(1, 2)
    const theta = choice(ANGLES)
    const d = theta[1]
    const thetaRad = (theta[0] * Math.PI) / d
    const argZ = texAngle(theta)
    const argConj = texAngle(argumentPrincipal([-theta[0], d]))
    const argOppose = texAngle(argumentPrincipal([theta[0] + d, d]))
    this.consigne = `Soit $z=${r}(\\cos(${argZ})+\\mathrm{i}\\sin(${argZ}))$.<br>
Sans autre calcul, déterminer le module et un argument dans $]-\\pi\\,;\\pi]$ de chacun des nombres complexes suivants.`
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const lambda =
        type === 3 ? randint(2, 4) : type === 4 ? -randint(2, 4) : 1
      if (!this.questionJamaisPosee(i, type, lambda)) continue
      const nomZ = `z_{${i + 1}}`
      const cas = [
        {
          nom: '\\overline{z}',
          module: r,
          arg: argConj,
          phi: -thetaRad,
          explication: `$|\\overline{z}|=|z|$ et $\\arg(\\overline{z})=-\\arg(z)\\ (2\\pi)$.`,
        },
        {
          nom: '-z',
          module: r,
          arg: argOppose,
          phi: thetaRad + Math.PI,
          explication: `$|-z|=|z|$ et $\\arg(-z)=\\arg(z)+\\pi\\ (2\\pi)$.`,
        },
        {
          nom: `${lambda}z`,
          module: Math.abs(lambda) * r,
          arg: lambda > 0 ? argZ : argOppose,
          phi: lambda > 0 ? thetaRad : thetaRad + Math.PI,
          explication:
            lambda > 0
              ? `$${lambda}>0$ donc $|${lambda}z|=${lambda}|z|$ et $\\arg(${lambda}z)=\\arg(z)\\ (2\\pi)$.`
              : `$${lambda}<0$ donc $|${lambda}z|=${-lambda}|z|$ et $\\arg(${lambda}z)=\\arg(z)+\\pi\\ (2\\pi)$.`,
        },
      ][type <= 2 ? type - 1 : 2]
      const texte = `$${nomZ}=${cas.nom}$`
      if (this.interactif) {
        this.listeQuestions[i] = `${texte}<br>${remplisLesBlancs(
          this,
          i,
          `\\begin{aligned}\\left|${nomZ}\\right|&=%{champ1}\\\\\\arg\\left(${nomZ}\\right)&=%{champ2}\\end{aligned}`,
          KeyboardType.complexes,
        )}`
        // Toujours 2 champs : le barème ne dépend pas du tirage.
        handleAnswers(
          this,
          i,
          {
            champ1: { value: String(cas.module) },
            champ2: { value: cas.arg },
          },
          { formatInteractif: 'fill-in-the-blank' },
        )
      } else {
        this.listeQuestions[i] = texte
      }
      this.listeCorrections[i] =
        `Avec $|z|=${r}$ et $\\arg(z)=${argZ}$ : ${cas.explication}<br>
$|${nomZ}|=${miseEnEvidence(cas.module)}$ et $\\arg\\left(${nomZ}\\right)=${miseEnEvidence(cas.arg)}$.<br>${figure(r, theta, nomZ, cas.module, cas.phi)}`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
