import { droite, Droite } from '../../lib/2d/droites'
import { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { Vecteur } from '../../lib/2d/Vecteur'
import ce from '../../lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Trouver l'équation cartésienne d'une droite"
export const dateDePublication = '24/06/2024'
export const dateDeModificationImportante = '10/01/2026'

/**
 * Calcul d'équations cartésiennes de droites
 * Beaucoup trop de fonctions... Comment les intégrer à la base
 * de code déjà existante ?
 * @author : florianpicard
 */

export const uuid = '8472c'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [''],
}

function pointVersTex(A: PointAbstrait): string {
  return `${A.nom}\\left(${A.x} ; ${A.y}\\right)`
}

function vecteurVersTex(u: Vecteur): string {
  const fonctionLatex = u.nom.length >= 2 ? 'overrightarrow' : 'vec'
  return `\\${fonctionLatex}{${u.nom}} \\begin{pmatrix} ${u.x} \\\\ ${u.y} \\end{pmatrix}`
}

function vecteurNormal(u: Vecteur, nom: string = 'n'): Vecteur {
  return new Vecteur(-u.y, u.x, nom)
}

function construireDroite(
  A: PointAbstrait,
  { B, u, n }: { B?: PointAbstrait; u?: Vecteur; n?: Vecteur },
): [Droite, string] | undefined {
  if (B instanceof PointAbstrait) {
    const u = new Vecteur(A, B, `${A.nom}${B.nom}`)
    const [d, details] = construireDroite(A, { u }) as [Droite, string]
    return [
      d,
      `Un vecteur directeur de la droite $(${A.nom}${B.nom})$ est $${vecteurVersTex(u)}$. ` +
        details,
    ]
  }
  if (u instanceof Vecteur) {
    const n = vecteurNormal(u)
    const [d, details] = construireDroite(A, { n }) as [Droite, string]
    return [
      d,
      `Un vecteur normal à la droite $(d)$ est $${vecteurVersTex(n)}$. ` +
        details,
    ]
  }
  if (n != null && n instanceof Vecteur) {
    const c = -(Number(A.x) * Number(n.x) + Number(A.y) * Number(n.y))
    const partial = ce.parse(`${n.x}x + ${n.y}y + c = 0`).simplify()
    const Aind = ce.parse(`${n.x}*(${A.x}) + ${n.y}* (${A.y}) + c = 0`)
    const equa = ce.parse(`${n.x}x + ${n.y}y + ${c} = 0`).simplify()
    return [
      droite(n.x, n.y, c),
      `La droite de vecteur normal $${vecteurVersTex(n)}$ admet pour équation cartésienne $${partial.latex}$, pour un certain nombre réel $c$. Comme $${A.nom}$ appartient à la droite, $${Aind.latex}$. Ainsi, $c = ${c}$, l'équation cartésienne de la droite est donc $${miseEnEvidence(equa.latex)}$.`,
    ]
  }
}

function hauteur(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
): [Droite, string] {
  const n = new Vecteur(B, C, 'BC')
  const [d, details] = construireDroite(A, { n }) as [Droite, string]
  return [
    d,
    `La hauteur $(h)$ issue de $${A.nom}$ dans le triangle $${A.nom}${B.nom}${C.nom}$ passe par le point $${A.nom}$ et est perpendiculaire à la droite $(${B.nom}${C.nom}$). Ainsi le vecteur $${vecteurVersTex(n)}$ est un vecteur normal à la droite $(h)$. ` +
      details,
  ]
}

function mediatrice(A: PointAbstrait, B: PointAbstrait): [Droite, string] {
  const I = milieu(A, B, 'I')
  const n = new Vecteur(A, B, 'AB')

  const [d, details] = construireDroite(I, { n }) as [Droite, string]
  // const equa = equationCartesienne(d)

  return [
    d,
    `La médiatrice du segment $[${A.nom}${B.nom}]$ coupe perpendiculairement $[${A.nom}${B.nom}]$ en son milieu $${pointVersTex(I)}$. Ainsi, $${vecteurVersTex(n)}$ est un vecteur normal à la médiatrice du segment $[${A.nom}${B.nom}]$. ` +
      details,
  ]
}

function questionDeuxPoints(_i: number = 0): [string, string] {
  const A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
  const B = new PointAbstrait(randint(-5, 5, [A.x]), randint(-5, 5, [A.y]), 'B')
  const [, details] = construireDroite(A, { B }) as [Droite, string]

  return [
    `Dans un repère orthonormé du plan on considère les points $${pointVersTex(A)}$, et $${pointVersTex(B)}$. Donner l'équation de la droite $(AB)$.`,
    details,
  ]
}

function questionPointvDir(_i: number = 0): [string, string] {
  const A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
  const ux = randint(-5, 5)
  const uy = randint(-5, 5, ux)
  const u = new Vecteur(ux, uy, 'u')
  const [, details] = construireDroite(A, { u }) as [Droite, string]

  return [
    `Dans un repère orthonormé du plan on considère le point $${pointVersTex(A)}$ et le vecteur $${vecteurVersTex(u)}$. Donner l'équation de la droite $(d)$ passant par le point $${A.nom}$ et de vecteur directeur $\\vec{${u.nom}}$.`,
    details,
  ]
}

function questionPointvNorm(_i: number = 0): [string, string] {
  const A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
  const ux = randint(-5, 5)
  const uy = randint(-5, 5, ux)
  const n = new Vecteur(ux, uy, 'n')
  const [, details] = construireDroite(A, { n }) as [Droite, string]
  return [
    `Dans un repère orthonormé du plan on considère le point $${pointVersTex(A)}$ et le vecteur $${vecteurVersTex(n)}$. Donner l'équation de la droite $(d)$ passant par le point $${A.nom}$ et de vecteur normal $\\vec{${n.nom}}$.`,
    details,
  ]
}

function questionHauteur(_i: number = 0): [string, string] {
  const A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
  const B = new PointAbstrait(randint(-5, 5, [A.x]), randint(-5, 5, [A.y]), 'B')
  const C = new PointAbstrait(
    randint(-5, 5, [A.x, B.x]),
    randint(-5, 5, [A.y, B.y]),
    'C',
  )
  const [, details] = hauteur(A, B, C)
  return [
    `Dans un repère orthonormé du plan on considère les trois points $${pointVersTex(A)}$, $${pointVersTex(B)}$, et $${pointVersTex(C)}$. Déterminer l'équation cartésienne de la hauteur issue de $${A.nom}$ dans le triangle $${A.nom}${B.nom}${C.nom}$.`,
    details,
  ]
}

function questionMediatrice(_i: number = 0): [string, string] {
  const A = new PointAbstrait(randint(-5, 5), randint(-5, 5), 'A')
  const B = new PointAbstrait(randint(-5, 5, [A.x]), randint(-5, 5, [A.y]), 'B')
  const [, details] = mediatrice(A, B)
  return [
    `Dans un repère orthonormé du plan on considère les points $${pointVersTex(A)}$ et $${pointVersTex(B)}$. Déterminer une équation cartésienne de la médiatrice du segment $[${A.nom}${B.nom}$].`,
    details,
  ]
}

export default class nom1G21Old extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    const questions = [
      questionPointvNorm,
      questionPointvDir,
      questionDeuxPoints,
      questionHauteur,
      questionMediatrice,
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const [texte, texteCorr] = questions[i % questions.length](i)
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr.replace(
          /\b(\d+)\.(\d+)\b/g,
          '$1,$2',
        )
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
