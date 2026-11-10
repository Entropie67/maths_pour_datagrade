import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { representantNomme } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea, vertMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Décomposer graphiquement un vecteur en fonction de deux vecteurs non colinéaires'
export const dateDePublication = '25/09/2026'
export const uuid = 'eee37'
export const interactifReady = true
export const interactifType = 'mathLive'

export const refs = { 'fr-fr': ['2G24-1'], 'fr-ch': [] }

type Coordonnees = { x: number; y: number }

const couleurA = bleuMathalea
const couleurB = orangeMathalea
const couleurU = vertMathalea

/** Tire deux vecteurs qui suivent les lignes du quadrillage, l'un horizontal, l'autre vertical. */
function vecteursSuivantQuadrillage(): [Coordonnees, Coordonnees] {
  const horizontal = { x: choice([-1, 1]) * randint(1, 2), y: 0 }
  const vertical = { x: 0, y: choice([-1, 1]) * randint(1, 2) }
  return choice([true, false]) ? [horizontal, vertical] : [vertical, horizontal]
}

/** Tire deux vecteurs non colinéaires, ni horizontaux ni verticaux. */
function vecteursObliques(): [Coordonnees, Coordonnees] {
  const tireVecteur = () => ({
    x: randint(-3, 3, 0),
    y: randint(-3, 3, 0),
  })
  let a = tireVecteur()
  let b = tireVecteur()
  // Un déterminant d'au moins 2 évite des vecteurs presque colinéaires.
  while (Math.abs(a.x * b.y - a.y * b.x) < 2) {
    a = tireVecteur()
    b = tireVecteur()
  }
  return [a, b]
}

/** Écrit k·v avec la convention 1·v = v et -1·v = -v. */
function produit(k: number, nom: string): string {
  return `${rienSi1(k)}\\vec{${nom}}`
}

/** Composante de p orthogonale à la droite dirigée par u. */
function composanteOrthogonale(p: Coordonnees, u: Coordonnees): Coordonnees {
  const k = (p.x * u.x + p.y * u.y) / (u.x ** 2 + u.y ** 2)
  return { x: p.x - k * u.x, y: p.y - k * u.y }
}

/** Place le nom d'un représentant à mi-longueur, décalé perpendiculairement du côté indiqué par `cote`. */
function nomRepresentant(
  origine: Coordonnees,
  v: Coordonnees,
  nom: string,
  couleur: string,
  cote: Coordonnees,
) {
  const norme = Math.hypot(v.x, v.y)
  const sens = -v.y * cote.x + v.x * cote.y < 0 ? -1 : 1
  return latex2d(
    nom,
    origine.x + v.x / 2 - (sens * 0.6 * v.y) / norme,
    origine.y + v.y / 2 + (sens * 0.6 * v.x) / norme,
    { color: couleur },
  )
}

/** Décomposer un vecteur en combinaison linéaire de deux vecteurs tracés sur un quadrillage. @author Arnaud Meistermann */
export default class DecomposerVecteurQuadrillage extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de vecteurs',
      'Nombres séparés par des tirets :\n1 : Vecteurs suivant le quadrillage\n2 : Vecteurs obliques\n3 : Mélange',
    ]
    this.sup = '3'
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'Les vecteurs $\\vec{a}$, $\\vec{b}$ et $\\vec{u}$ sont représentés sur le quadrillage ci-dessous.<br>Déterminer les entiers relatifs $x$ et $y$ tels que $\\vec{u}=x\\vec{a}+y\\vec{b}$.'
        : 'Pour chacune des figures suivantes, les vecteurs $\\vec{a}$, $\\vec{b}$ et $\\vec{u}$ sont représentés.<br> Déterminer les entiers relatifs $x$ et $y$ tels que $\\vec{u}=x\\vec{a}+y\\vec{b}$.'
    const typesDeVecteurs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 3,
      listeOfCase: ['quadrillage', 'obliques'],
      nbQuestions: this.nbQuestions,
      melange: 3,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let a: Coordonnees
      let b: Coordonnees
      let x: number
      let y: number
      let u: Coordonnees
      do {
        ;[a, b] =
          typesDeVecteurs[i] === 'quadrillage'
            ? vecteursSuivantQuadrillage()
            : vecteursObliques()
        x = randint(-3, 3, 0)
        y = randint(-3, 3, 0)
        u = { x: x * a.x + y * b.x, y: x * a.y + y * b.y }
      } while (Math.abs(u.x) > 8 || Math.abs(u.y) > 8)

      // Énoncé : les trois vecteurs côte à côte, séparés de deux carreaux.
      const vecteursEnonce = [
        { v: a, nom: 'a', couleur: couleurA },
        { v: b, nom: 'b', couleur: couleurB },
        { v: u, nom: 'u', couleur: couleurU },
      ]
      const hauteur = Math.max(...vecteursEnonce.map(({ v }) => Math.abs(v.y)))
      const objetsEnonce = []
      let curseur = 0
      for (const { v, nom, couleur } of vecteursEnonce) {
        const origine = pointAbstrait(
          curseur - Math.min(0, v.x),
          -Math.min(0, v.y),
        )
        const extremite = pointAbstrait(origine.x + v.x, origine.y + v.y)
        const fleche = segment(origine, extremite, couleur, '->')
        fleche.epaisseur = 2
        objetsEnonce.push(
          fleche,
          representantNomme(vecteur(v.x, v.y), origine, nom, 1.2, couleur),
        )
        curseur += Math.abs(v.x) + 2
      }
      const cadreEnonce = {
        xmin: -1,
        ymin: -1,
        xmax: curseur - 1,
        ymax: hauteur + 1,
      }
      let texte = mathalea2d(
        {
          ...cadreEnonce,
          center: !context.isHtml,
          pixelsParCm: 30,
          scale: 0.6,
        },
        grille(
          cadreEnonce.xmin,
          cadreEnonce.ymin,
          cadreEnonce.xmax,
          cadreEnonce.ymax,
        ),
        ...objetsEnonce,
      )
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          2 * i,
          KeyboardType.clavierDeBase,
          { texteAvant: '$x=$' },
        )
        texte += ajouteChampTexteMathLive(
          this,
          2 * i + 1,
          KeyboardType.clavierDeBase,
          { texteAvant: '$\\quad y=$' },
        )
      }
      handleAnswers(this, 2 * i, { reponse: { value: x } })
      handleAnswers(this, 2 * i + 1, { reponse: { value: y } })

      // Correction : |x| représentants de ±a puis |y| représentants de ±b, bout à bout.
      const pas = [
        ...Array.from({ length: Math.abs(x) }, () => ({
          v: { x: Math.sign(x) * a.x, y: Math.sign(x) * a.y },
          nom: produit(Math.sign(x), 'a'),
          couleur: couleurA,
        })),
        ...Array.from({ length: Math.abs(y) }, () => ({
          v: { x: Math.sign(y) * b.x, y: Math.sign(y) * b.y },
          nom: produit(Math.sign(y), 'b'),
          couleur: couleurB,
        })),
      ]
      const points: Coordonnees[] = [{ x: 0, y: 0 }]
      for (const { v } of pas) {
        const dernier = points[points.length - 1]
        points.push({ x: dernier.x + v.x, y: dernier.y + v.y })
      }
      const objetsCorrection = pas.flatMap(({ v, nom, couleur }, k) => {
        const fleche = segment(
          pointAbstrait(points[k].x, points[k].y),
          pointAbstrait(points[k + 1].x, points[k + 1].y),
          couleur,
          '->',
        )
        fleche.epaisseur = 2
        // Les noms sont placés à l'extérieur du triangle formé avec le représentant de u.
        const milieu = {
          x: points[k].x + v.x / 2,
          y: points[k].y + v.y / 2,
        }
        return [
          fleche,
          nomRepresentant(
            points[k],
            v,
            nom,
            couleur,
            composanteOrthogonale(milieu, u),
          ),
        ]
      })
      // Sommet du triangle opposé au représentant de u : le nom de u est placé de l'autre côté.
      const sommet = composanteOrthogonale(points[Math.abs(x)], u)
      const origineU = pointAbstrait(0, 0)
      const flecheU = segment(origineU, pointAbstrait(u.x, u.y), couleurU, '->')
      flecheU.epaisseur = 2
      objetsCorrection.push(flecheU)
      const cadreCorrection = {
        xmin: Math.min(...points.map((p) => p.x)) - 1,
        ymin: Math.min(...points.map((p) => p.y)) - 1,
        xmax: Math.max(...points.map((p) => p.x)) + 1,
        ymax: Math.max(...points.map((p) => p.y)) + 1,
      }
      const figureCorrection = mathalea2d(
        {
          ...cadreCorrection,
          center: !context.isHtml,
          pixelsParCm: 30,
          scale: 0.6,
        },
        grille(
          cadreCorrection.xmin,
          cadreCorrection.ymin,
          cadreCorrection.xmax,
          cadreCorrection.ymax,
        ),
        ...objetsCorrection,
        nomRepresentant(origineU, u, '\\vec{u}', couleurU, {
          x: -sommet.x,
          y: -sommet.y,
        }),
      )

      const representants = (k: number, nom: string) =>
        `${Math.abs(k) === 1 ? 'un représentant' : `$${Math.abs(k)}$ représentants`} de $${produit(Math.sign(k), nom)}$`
      let texteCorr = `En partant de l’origine du représentant de $\\vec{u}$ (en vert), on trace bout à bout ${representants(x, 'a')} (en bleu), puis ${representants(y, 'b')} (en orange). On arrive à l’extrémité du représentant de $\\vec{u}$.<br>`
      texteCorr += figureCorrection
      texteCorr += `<br>Donc $\\vec{u}=${produit(x, 'a')}${ecritureAlgebriqueSauf1(y)}\\vec{b}$, c’est-à-dire $x=${miseEnEvidence(x)}$ et $y=${miseEnEvidence(y)}$.`

      if (this.questionJamaisPosee(i, a.x, a.y, b.x, b.y, x, y)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
