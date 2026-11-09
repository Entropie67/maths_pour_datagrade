import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb6e2'
export const refs = {
  'fr-fr': ['3Z1DNB-07'],
  'fr-ch': ['1mT-8'],
}
export const titre = 'Se préparer au DNB : Pythagore, Thalès, trigonométrie'
export const dateDePublication = '06/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExercicePythThalTrigo extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction =
      texteItalique("D'après l'exercice $3$ du brevet Antilles 2024.") + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    dk: number,
    dj: number,
    kj: number,
    kl: number,
    prenom: string,
    angle: number,
  ): void {
    const da = ((dk + kl) * dj) / dk
    this.enonce = `Sur la figure ci-après, qui n'est pas à l'échelle, on a représenté le trajet de la course que doit faire ${prenom}.<br>`
    const flecheDL = segment(pointAbstrait(0, 0.7), pointAbstrait(5, 6))
    flecheDL.styleExtremites = '<->'
    flecheDL.pointilles = 2
    const lDL = placeLatexSurSegment(
      `${texNombre(dk + kl)}\\text{ m}`,
      flecheDL.extremite1,
      flecheDL.extremite2,
      { distance: 0.5 },
    )
    const D = pointAbstrait(1, 0, 'D', 'below')
    const L = pointAbstrait(6, 5.5, 'L', 'above')
    const K = homothetie(L, D, 0.6, 'K', 'above left')
    const A = pointAbstrait(9, 3, 'A', 'right')
    const J = homothetie(A, D, 0.6, 'J', 'below right')
    const triangle = polygone(D, L, A)
    const ad = codageAngleDroit(D, L, A)
    const lKJ = placeLatexSurSegment(`${kj}\\text{ m}`, K, J, { distance: 0.5 })
    const lDJ = placeLatexSurSegment(`${texNombre(dj)}\\text{ m}`, J, D, {
      distance: 0.5,
    })
    const lKL = placeLatexSurSegment(`${kl}\\text{ m}`, K, L, { distance: 0.5 })
    const flecheDK = segment(D, K)
    flecheDK.styleExtremites = '->'
    flecheDK.epaisseur = 2
    const flecheKJ = segment(K, J)
    flecheKJ.styleExtremites = '->'
    flecheKJ.epaisseur = 2
    const flecheJA = segment(J, A)
    flecheJA.styleExtremites = '->'
    flecheJA.epaisseur = 2
    const objets = [
      triangle,
      ad,
      flecheDL,
      flecheDK,
      flecheKJ,
      flecheJA,
      labelPoint(D, L, K, A, J),
      lDL,
      lKJ,
      lDJ,
      lKL,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets)),
      objets,
    )

    this.enonce += `Dans le triangle $DLA$ rectangle en $L$, le point $J$ appartient au segment $[DA]$ et le point $K$ appartient au segment $[DL]$.<br>
${deuxColonnesResp(
  `On donne${sp()}:
$\\begin{array}{l}
DL = ${texNombre(dk + kl, 1)}\\text{ m} ;\\\\
KJ = ${texNombre(kj, 1)}\\text{ m} ;\\\\
DJ = ${texNombre(dj, 1)}\\text{ m} ;\\\\
KL = ${texNombre(kl, 1)}\\text{ m}.
\\end{array}$`,
  figure,
  { largeur1: 30, eleId: '', widthmincol1: '200px', widthmincol2: '400px' },
)}`
    const question1 = `Montrer que la longueur $DK$ est égale à $${texNombre(dk, 0)}\\text{ m}$.`
    const question2 = 'Montrer que le triangle $DKJ$ est rectangle en $K$.'
    const question3 =
      'Justifier que les droites $(KJ)$ et $(LA)$ sont parallèles.'
    const question4 = `Montrer que le segment $[DA]$ mesure $${texNombre(da, 0)}\\text{ m}$.`
    const question5 =
      'Calculer la longueur du trajet $DKJA$, fléché sur la figure.'
    const question6 = `Un photographe place une caméra au point $D$.<br>Afin de filmer l'ensemble de la course sans bouger la caméra, l'angle $\\widehat{\\text{LDA}}$ doit être inférieur à $${angle}^\\circ$.<br>Est-ce le cas${sp()}?`
    const listeQuestions = createList({
      items: [question1, question2, question3, question4, question5, question6],
      style: 'nombres',
    })
    this.enonce += listeQuestions
    const correction1 = `On a $DK + KL = DL$ soit $DK + ${kl} = ${texNombre(dk + kl)}$, d'où $DK = ${texNombre(dk + kl)} - ${kl} = ${miseEnEvidence(`${texNombre(dk)}\\text{ m}`)}$.`
    const correction2 =
      `On a $DK^2 + KJ^2 = ${texNombre(dk)}^2 + ${kj}^2 = ${texNombre(dk ** 2, 0)} + ${texNombre(kj ** 2, 0)} = ${texNombre(dk ** 2 + kj ** 2, 0)}$ et $DJ^2 = ${texNombre(dj, 0)}^2 = ${texNombre(dj ** 2, 0)}$.<br>
On a donc $DK^2 + KJ^2 = DJ^2$${sp()}: ` +
      texteEnCouleurEtGras(
        "d'après la réciproque du théorème de Pythagore le triangle $DKJ$ est rectangle en $K$.",
      )
    const correction3 =
      `Les droites $(LA)$ et $(KJ)$ sont perpendiculaires à la même droite $(DL)$${sp()}: ` +
      texteEnCouleurEtGras('elles sont donc parallèles.')
    const correction4 = `Les droites $(LA)$ et $(KJ)$ sont parallèles, les points $D$, $K$ et $L$ sont alignés et les points $D$, $J$ et $A$ le sont aussi.<br>
    On a donc une configuration de Thalès, et on peut donc écrire l'égalité${sp()}:<br>
$\\dfrac{DK}{DL} = \\dfrac{DJ}{DA}$, soit $\\dfrac{${texNombre(dk)}}{${texNombre(dk + kl)}} = \\dfrac{${texNombre(dj)}}{\\text{DA}}$, d'où $DA\\times ${texNombre(dk)} = ${texNombre(dk + kl)} \\times ${texNombre(dj)}$ puis $DA = \\dfrac{${texNombre(dk + kl)} \\times ${texNombre(dj)}}{${texNombre(dk)}} = ${miseEnEvidence(`${texNombre(da)}\\text{ m}`)}$.`
    const correction5 = `La longueur du trajet fléché est${sp()}:
$DK + KJ + JA = ${texNombre(dk)} + ${kj} + (${texNombre(da)} - ${texNombre(dj)}) = ${texNombre(dk + kj)}+${da - dj}=${miseEnEvidence(`${texNombre(dk + kj + (da - dj))}\\text{ m}`)}$.`
    const alpha = (Math.acos((dk + kl) / da) * 180) / Math.PI
    const correction6 = `Dans le triangle rectangle LDA on a${sp()}: $\\cos \\widehat{LDA} = \\dfrac{\\text{long. côté adjacent}}{\\text{long. hypoténuse}} = \\dfrac{${texNombre(dk + kl)}}{${texNombre(da)}}=${fraction(dk + kl, da).texFractionSimplifiee}$.<br>
La calculatrice donne $\\widehat{LDA} \\approx ${texNombre(alpha, 0)}$ (en degres).<br>
Cette valeur est ${alpha < angle ? 'inférieure' : 'supérieure'} à $${angle}$${sp()}: ${texteEnCouleurEtGras(`le photographe ${alpha < angle ? 'pourra' : 'ne pourra pas'} tout filmer sans bouger sa caméra.`)}`
    const listeCorrections = createList({
      items: [
        correction1,
        correction2,
        correction3,
        correction4,
        correction5,
        correction6,
      ],
      style: 'nombres',
    })
    this.correction = listeCorrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(480, 520, 200, 120, 'Oscar', 25)
  }

  versionAleatoire: () => void = () => {
    const listeTripletsPythagoriciens = [
      [12, 5, 13],
      [15, 8, 17],
      [16, 12, 20],
      [24, 7, 25],
      [40, 9, 41],
      [63, 16, 65],
    ]
    const [dk, kj, dj] = choice(listeTripletsPythagoriciens).map((v) => v * 20)
    const kl = choice([true, false])
      ? (randint(1, 3) * dk) / 4
      : (randint(1, 4) * dk) / 5

    const angle = choice([20, 25, 30])
    const prenom = prenomM()
    this.appliquerLesValeurs(
      dk,
      dj,
      kj,
      kl,
      Array.isArray(prenom) ? prenom[0] : prenom,
      angle,
    )
  }
}
