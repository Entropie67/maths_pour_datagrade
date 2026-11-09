import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { milieu, pointAdistance } from '../../lib/2d/utilitairesPoint'
import { texteGras } from '../../lib/format/style'
import Alea2iep from '../../modules/Alea2iep'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Réaliser le quotient de deux longueurs à la règle non graduée et au compas'

export const dateDePublication = '1/11/2021'

/**
 * @author Rémi Angot

*/
export const uuid = 'f9dd2'

export const refs = {
  'fr-fr': ['PEG24'],
  'fr-ch': [],
}
export default class QuotientDeDeuxLongueurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = ["Longueur de l'unité en cm", 10]
    this.besoinFormulaire2Numerique = ['Longueur de a en cm (hasard si 0)', 10]
    this.besoinFormulaire3Numerique = ['Longueur de b en cm (hasard si 0)', 10]

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 1
    this.sup2 = 0
    this.sup3 = 0
  }

  nouvelleVersion(numeroExercice: number) {
    const anim = new Alea2iep()
    const unite = this.sup
    const a =
      this.sup2 < 1 || this.sup2 === this.sup
        ? randint(2, 5, this.sup)
        : this.sup2
    const b =
      this.sup3 < 1 || this.sup3 === this.sup
        ? randint(2, 5, [this.sup, a])
        : this.sup3
    const monAngle = 40
    const u1 = pointAbstrait(1, 5)
    const u2 = pointAbstrait(u1.x + unite, u1.y)
    const um = milieu(u1, u2)
    const u1y1 = pointAbstrait(u1.x, u1.y - 0.1)
    const u1y2 = pointAbstrait(u1.x, u1.y + 0.1)
    const u2y1 = pointAbstrait(u2.x, u2.y - 0.1)
    const u2y2 = pointAbstrait(u2.x, u2.y + 0.1)
    const a1 = pointAbstrait(1, 4)
    const a2 = pointAbstrait(a1.x + a, a1.y)
    const am = milieu(a1, a2)
    const a1y1 = pointAbstrait(a1.x, a1.y - 0.1)
    const a1y2 = pointAbstrait(a1.x, a1.y + 0.1)
    const a2y1 = pointAbstrait(a2.x, a2.y - 0.1)
    const a2y2 = pointAbstrait(a2.x, a2.y + 0.1)
    const b1 = pointAbstrait(1, 3)
    const b2 = pointAbstrait(b1.x + b, b1.y)
    const bm = milieu(b1, b2)
    const b1y1 = pointAbstrait(b1.x, b1.y - 0.1)
    const b1y2 = pointAbstrait(b1.x, b1.y + 0.1)
    const b2y1 = pointAbstrait(b2.x, b2.y - 0.1)
    const b2y2 = pointAbstrait(b2.x, b2.y + 0.1)
    anim.traitRapide(u1, u2)
    anim.traitRapide(u1y1, u1y2)
    anim.traitRapide(u2y1, u2y2)
    anim.traitRapide(a1, a2)
    anim.traitRapide(a1y1, a1y2)
    anim.traitRapide(a2y1, a2y2)
    anim.traitRapide(b1, b2)
    anim.traitRapide(b1y1, b1y2)
    anim.traitRapide(b2y1, b2y2)
    anim.textePosition('u', um.x - 0.2, um.y + 0.8)
    anim.textePosition('a', am.x - 0.2, am.y + 0.8)
    anim.textePosition('b', bm.x - 0.2, bm.y + 0.8)
    const O = pointAbstrait(1, -2, 'O')
    const A = pointAbstrait(O.x + a, O.y, 'A')
    const M = pointAbstrait(O.x + a / b / unite, O.y, 'M')
    anim.regleMasquerGraduations()
    anim.regleDemiDroiteOriginePoint(O, M)
    anim.regleMasquer()
    anim.compasEcarter2Points(a1, a2)
    anim.pointCreer(O, { dx: -0.8, dy: 0.4 })
    anim.compasTracerArcCentrePoint(O, A)
    anim.compasMasquer()
    anim.pointCreer(A, { dx: -0.3, dy: -0.4 })
    const I = pointAdistance(O, unite, monAngle)
    const B = pointAdistance(O, b, monAngle)
    I.nom = 'I'
    B.nom = 'B'
    anim.regleDemiDroiteOriginePoint(O, B)
    anim.regleMasquer()
    anim.crayonMasquer()
    anim.compasEcarter2Points(u1, u2)
    anim.compasTracerArcCentrePoint(O, I)
    anim.pointCreer(I, { dx: -0.3, dy: 0.8 })
    anim.compasEcarter2Points(b1, b2)
    anim.compasTracerArcCentrePoint(O, B)
    anim.pointCreer(B, { dx: -0.3, dy: 0.8 })
    anim.compasMasquer()
    anim.regleSegment(B, A)
    anim.regleMasquer()
    anim.crayonMasquer()
    const m = anim.paralleleAuCompas(B, A, I)
    if (m.y > M.y) anim.regleSegment(I, M)
    anim.pointCreer(M, { dx: -0.3, dy: -0.4 })
    anim.regleSegment(O, M, { couleur: 'red', epaisseur: 3 })
    anim.regleMasquer()
    anim.crayonMasquer()

    const texte =
      "À partir d'un segment unité, d'un segment de longueur $a$ et d'un segment de longueur $b$, construire un segment de longueur $\\dfrac{a}{b}$."
    let texteCorr = texteGras('Programme de construction :')
    texteCorr += '<br>On trace une demi-droite $[OA)$ telle que $OA = a$.'
    texteCorr +=
      '<br>On trace une demi-droite de même origine $[OB)$ telle que $OB = b$.'
    texteCorr += '<br>On place le point $I$ sur $[OB)$ tel que $OI = 1u$.'
    texteCorr += '<br>On trace le segment $[BA]$.'
    texteCorr += '<br>On trace la parallèle à $(BA)$ passant par $I$.'
    texteCorr += '<br>Elle coupe $[OA)$ en $M$.'

    texteCorr += '<br><br>' + texteGras('Justification :')
    texteCorr +=
      "<br> Les droites $(BA)$ et $(IM)$ sont parallèles donc d'après le théorème de Thalès, on a  :"
    texteCorr +=
      '<br> $\\dfrac{OM}{OA}=\\dfrac{OI}{OB}$ soit $\\dfrac{OM}{a}=\\dfrac{1}{b}$'
    texteCorr += '<br><br> Finalement, on a $OM=\\dfrac{a}{b}$.'
    texteCorr += anim.html(numeroExercice)

    this.listeQuestions = [texte]
    this.listeCorrections = [texteCorr]
    listeQuestionsToContenu(this)
  }
}
