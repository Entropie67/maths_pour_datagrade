import { createList } from '../../lib/format/lists'
import { lampeMessage } from '../../lib/format/message'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  egalOuApprox,
  rienSi0,
  reduireAxPlusByPlusCzPlusD,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  crossProduct,
  simplifieVector,
  type Vector3,
} from '../../lib/outils/geometrieVectorielle'
import { abs } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer le volume d'un tétraèdre"

export const dateDePublication = '28/01/2026'

export const uuid = '7c2r9'

export const refs = {
  'fr-fr': ['TSG2-50'],
  'fr-ch': ['3G99-11'],
}
/**
 *
 * @author Stéphane Guyon
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // Point A
      const xA = randint(-4, 4)
      const yA = randint(-4, 4)
      const zA = randint(-4, 4)

      // Vecteur AB non nul
      let ABx = randint(-4, 4, 0)
      let ABy = randint(-4, 4, 0)
      let ABz = randint(-4, 4, 0)
      while (ABx === 0 && ABy === 0 && ABz === 0) {
        ABx = randint(-4, 4, 0)
        ABy = randint(-4, 4, 0)
        ABz = randint(-4, 4, 0)
      }

      // Vecteur AC choisi orthogonal à AB, avec composantes entières simples
      let ACx: number
      let ACy: number
      let ACz: number
      if (ABx !== 0 || ABy !== 0) {
        ACx = -ABy
        ACy = ABx
        ACz = 0
      } else {
        // AB est (0,0,ABz)
        ACx = 1
        ACy = 0
        ACz = 0
      }

      // Points B et C
      const xB = xA + ABx
      const yB = yA + ABy
      const zB = zA + ABz
      const xC = xA + ACx
      const yC = yA + ACy
      const zC = zA + ACz

      // Vecteur normal via produit vectoriel AB ^ AC
      const normal: Vector3 = simplifieVector(
        crossProduct([ABx, ABy, ABz], [ACx, ACy, ACz]),
      )
      const [nx, ny, nz] = normal

      // Point D quelconque, distinct pour la droite (d)
      const xD = randint(-4, 4, [xA, xB, xC])
      const yD = randint(-4, 4, [yA, yB, yC])
      const zD = randint(-4, 4, [zA, zB, zC])

      const dPlan = -(nx * xA + ny * yA + nz * zA)

      const question1 = 'Montrer que le triangle $ABC$ est rectangle en $A$.'
      const question2 = `Soit $\\vec n \\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$. Vérifier que ce vecteur est orthogonal au plan $(ABC)$.`
      const question3 = 'En déduire une équation cartésienne du plan $(ABC)$.'
      const question4 = `Donner une représentation paramétrique de la droite $(d)$ passant par $D$ et de vecteur directeur $\\vec n$.`
      const question5 =
        'Calculer les coordonnées du point $H$, projection orthogonale de $D$ sur $(ABC)$.'
      const question6 = 'Calculer la longueur $DH$.'
      const question7 =
        'Calculer le volume du tétraèdre $ABCD$. On donnera la valeur exacte et le cas échéant, une valeur approchée au centième.'

      texte =
        'Dans un repère orthonormé de l’espace, on considère les points :<br>' +
        `$A(${xA}~;~${yA}~;~${zA})$, $B(${xB}~;~${yB}~;~${zB})$, $C(${xC}~;~${yC}~;~${zC})$ et $D(${xD}~;~${yD}~;~${zD})$.<br>` +
        createList({
          items: [
            question1,
            question2,
            question3,
            question4,
            question5,
            question6,
            question7,
          ],
          style: 'nombres',
        })

      // Corrections
      let reponse1 = lampeMessage({
        titre: 'Méthode :',
        texte:
          'Pour montrer qu’un triangle $ABC$ est rectangle en $A$, il suffit de vérifier que les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont orthogonaux en calculant leur produit scalaire.',
      })

      reponse1 +=
        'On calcule les coordonnées des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ : <br>' +
        `$\\overrightarrow{AB}\\begin{pmatrix}${xB}${ecritureAlgebrique(-xA)}\\\\${yB}${ecritureAlgebrique(-yA)}\\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ donc $\\overrightarrow{AB}\\begin{pmatrix}${ABx}\\\\${ABy}\\\\${ABz}\\end{pmatrix}$.<br>` +
        `$\\overrightarrow{AC}\\begin{pmatrix}${xC}${ecritureAlgebrique(-xA)}\\\\${yC}${ecritureAlgebrique(-yA)}\\\\${zC}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ donc $\\overrightarrow{AC}\\begin{pmatrix}${ACx}\\\\${ACy}\\\\${ACz}\\end{pmatrix}$.<br>` +
        'Pour vérifier si ces vecteurs sont orthogonaux, on calcule leur produit scalaire :<br>' +
        ` $\\begin{aligned}\\overrightarrow{AB}\\cdot\\overrightarrow{AC} &= ${ABx}\\times${ecritureParentheseSiNegatif(ACx)} + ${ABy}\\times${ecritureParentheseSiNegatif(ACy)} + ${ABz}\\times${ecritureParentheseSiNegatif(ACz)} \\\\
        &= ${ABx * ACx + ABy * ACy + ABz * ACz}\\end{aligned}$.<br>` +
        '$\\overrightarrow{AB}\\cdot\\overrightarrow{AC}$ et les deux vecteurs sont non nuls, ils sont donc orthogonaux. <br>' +
        'donc $ABC$ est un triangle rectangle en $A$.'

      let reponse2 = lampeMessage({
        titre: 'Méthode :',
        texte:
          "Pour montrer qu’un vecteur est orthogonal à un plan, il suffit de vérifier qu'il est orthogonal à deux vecteurs non-colinéaires de ce plan. <br> Il suffit ici de montrer par exemple que $\\vec n \\cdot \\overrightarrow{AB}=0$ et $\\vec n \\cdot \\overrightarrow{AC}=0$ .",
      })
      reponse2 +=
        `On calcule <br>$\\begin{aligned}\\vec n \\cdot \\overrightarrow{AB} &= ${nx}\\times${ecritureParentheseSiNegatif(
          ABx,
        )} ${ecritureAlgebrique(nx)}\\times ${ecritureParentheseSiNegatif(ABy)} ${ecritureAlgebrique(nx)}\\times ${ecritureParentheseSiNegatif(ABz)} \\\\
        &=${nx * ABx} ${ecritureAlgebrique(ny * ABy)} ${ecritureAlgebrique(nz * ABz)} \\\\
      &= ${nx * ABx + ny * ABy + nz * ABz}\\end{aligned}$<br>` +
        ` $\\begin{aligned}\\vec n \\cdot \\overrightarrow{AC} &= ${nx}\\times${ecritureParentheseSiNegatif(ACx)} ${ecritureAlgebrique(nx * ACy)} ${ecritureAlgebrique(nx * ACz)} \\\\
        &= ${nx * ACx} ${ecritureAlgebrique(ny * ACy)} ${ecritureAlgebrique(nz * ACz)} \\\\
        &= ${nx * ACx + ny * ACy + nz * ACz}\\end{aligned}$.<br>` +
        'Le vecteur $\\vec n$ est bien orthogonal à deux vecteurs non-colinéaires du plan $(ABC)$ (à une base), il est donc orthogonal au plan $(ABC)$.'

      const reponse3 =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "Un vecteur  $\\vec{n}\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est un vecteur normal aux plans d'équation cartésienne $ax+by+cz+d=0$ où $d$ est un réel. <br> Pour déterminer $d$, on remplace les coordonnées d'un point du plan dans l'équation.",
        }) +
        `On vient de montrer que le vecteur $\\vec n \\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$ est normal au plan $ABC$.<br>
         Une équation cartésienne de ce plan est donc sous la forme :
        $${reduireAxPlusByPlusCzPlusD(nx, ny, nz, 0)} + d = 0$ où $d$ est un réel à trouver.<br>
        Pour déterminer $d$, on utilise que le point $A(${xA}~;~${yA}~;~${zA})$ appartient au plan $(ABC)$, ses coordonnées vérifient donc l'équation cartésienne de ce plan :<br>
        $\\begin{aligned}&${nx}\\times ${ecritureParentheseSiNegatif(xA)} ${ecritureAlgebrique(ny)}\\times${ecritureParentheseSiNegatif(yA)} ${ecritureAlgebrique(nz)}\\times${ecritureParentheseSiNegatif(
          zA,
        )} + d = 0\\\\
       \\iff &${rienSi0(nx * xA)} ${ecritureAlgebriqueSauf0(ny * yA)} ${ecritureAlgebriqueSauf0(nz * zA)} + d = 0\\\\
        \\iff&d = ${dPlan}\\end{aligned}$.<br>` +
        `Ainsi, une équation du plan $(ABC)$ est : $${reduireAxPlusByPlusCzPlusD(nx, ny, nz, dPlan)} = 0$`

      const reponse4 =
        lampeMessage({
          titre: 'Méthode :',
          texte: `La représentation paramétrique d'une droite de vecteur directeur $\\vec{u} \\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ (avec $a,\\, b$ et $c$ trois réels) et passant par un point $A(x_A ; y_A ; z_A)$  est donnée par :
        $\\begin{cases} x=x_A+at\\\\y=y_A+bt\\quad(t\\in\\mathbb{R})\\\\z=z_A+ct\\end{cases}$`,
        }) +
        `La droite passe par le point $D(${xD}~;~${yD}~;~${zD})$ et a pour vecteur directeur $\\vec n \\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$.<br>
         Une représentation paramétrique de la droite $(d)$ est<br>` +
        `$ (d) :\\begin{cases}
x = ${xD} ${ecritureAlgebriqueSauf1(nx)}t \\\\
y = ${yD} ${ecritureAlgebriqueSauf1(ny)}t \\quad (t\\in\\mathbb{R})\\\\
z = ${zD} ${ecritureAlgebriqueSauf1(nz)}t
\\end{cases}  $.`

      // Projection orthogonale de D sur le plan (ABC)
      const denom = nx * nx + ny * ny + nz * nz // dénominateur de t pour calculer coordonénes de H
      const numer = nx * xD + ny * yD + nz * zD + dPlan // numérateur de t pour calculer coordonénes de H
      const fracT = new FractionEtendue(abs(-numer), abs(denom)) // Valeur de t pour trouver H
      const xHFrac = new FractionEtendue(xD * denom - numer * nx, denom) // coordonnées de H
      const yHFrac = new FractionEtendue(yD * denom - numer * ny, denom)
      const zHFrac = new FractionEtendue(zD * denom - numer * nz, denom)
      const fracTDec = -numer / denom
      const fracTSimplifie = fracT.simplifie().texFraction
      const reponse5 =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "Le point $H$ est le projeté orthogonal du point $D$ sur le plan $(ABC)$ donc $H\\in(ABC)$ et $H\\in(d)$. Les coordonnées du point $H$ vérifient donc l'équation cartésienne du plan $(ABC)$ et la représentation paramétrique de la droite $(d)$.",
        }) +
        `On cherche l'ensemble des $(x_H,y_H,z_H,t)$ qui vérifient le système :  :
      $\\begin{cases} 
      x_H = ${xD} ${ecritureAlgebriqueSauf1(nx)}t \\\\
      y_H = ${yD} ${ecritureAlgebriqueSauf1(ny)}t \\\\
      z_H = ${zD} ${ecritureAlgebriqueSauf1(nz)}t\\\\
      ${reduireAxPlusByPlusCzPlusD(nx, ny, nz, dPlan, 'x_H', 'y_H', 'z_H')} = 0
      \\end{cases}$.<br>` +
        `En remplaçant $x_H$, $y_H$ et $z_H$ par leurs expressions en fonction de $t$, dans l'équation cartésienne, on obtient :<br>` +
        `$\\begin{aligned}
        ${rienSi1(nx)}(${xD} ${ecritureAlgebriqueSauf1(nx)} t) ${ecritureAlgebriqueSauf1(ny)}(${yD} ${ecritureAlgebriqueSauf1(ny)}t) ${ecritureAlgebriqueSauf1(nz)}(${zD} ${ecritureAlgebriqueSauf1(nz)}t) ${ecritureAlgebrique(dPlan)} &= 0\\\\
         ${nx * nx + ny * ny + nz * nz} t ${ecritureAlgebrique(nx * xD + ny * yD + nz * zD + dPlan)} &= 0\\\\
         t&=${fracT.texFractionSimplifiee}
         \\end{aligned}.$<br>` +
        `En remplaçant $t$ dans les $3$ premières équations du système, on trouve : <br>` +
        `$\\begin{cases}  x_H = ${xD} ${ecritureAlgebrique(nx)}\\times ${fracTSimplifie}\\\\
      y_H = ${yD} ${ecritureAlgebrique(ny)}\\times ${fracTSimplifie} \\\\
      z_H = ${zD} ${ecritureAlgebrique(nz)}\\times ${fracTSimplifie}\\\\\\end{cases} 
      \\iff \\begin{cases}  x_H = ${xHFrac.texFractionSimplifiee} \\\\
      y_H = ${yHFrac.texFractionSimplifiee} \\\\
      z_H = ${zHFrac.texFractionSimplifiee}\\\\\\end{cases}$
      Donc $H\\left(${xHFrac.texFractionSimplifiee} ; ${yHFrac.texFractionSimplifiee} ; ${zHFrac.texFractionSimplifiee}\\right)$.`

      const normeDHDec = Math.abs(fracTDec) * Math.sqrt(denom)
      let reponse6 = lampeMessage({
        titre: 'Méthode :',
        texte:
          'Pour calculer la longueur $DH$, on peut calculer la norme du vecteur $\\overrightarrow{DH}$ : $\\vert\\vert\\overrightarrow{DH}\\vert\\vert=\\sqrt{(x_H - x_D)^2 + (y_H - y_D)^2 + (z_H - z_D)^2}$.',
      })
      reponse6 += `On calcule la norme du vecteur $\\overrightarrow{DH}$ :<br>
       $\\begin{aligned}\\vert\\vert\\overrightarrow{DH}\\vert\\vert&=\\sqrt{\\left(${xHFrac.texFractionSimplifiee} ${ecritureAlgebriqueSauf0(-xD)}\\right)^2 + \\left(${yHFrac.texFractionSimplifiee}  ${ecritureAlgebriqueSauf0(-yD)}\\right)^2 + \\left(${zHFrac.texFractionSimplifiee}  ${ecritureAlgebriqueSauf0(-zD)}\\right)^2}\\\\
       & = ${fracT.texFractionSimplifiee}\\sqrt{${denom}}. \\end{aligned}.$`

      // Volume tétraèdre sans produit vectoriel : aire du triangle rectangle ABC puis hauteur DH
      const AB2 = ABx * ABx + ABy * ABy + ABz * ABz
      const AC2 = ACx * ACx + ACy * ACy + ACz * ACz
      const volumeDec = (Math.sqrt(AB2) * Math.sqrt(AC2) * normeDHDec) / 6
      let reponse7 =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "Pour calculer le volume d'un tétraèdre, on utilise la formule de la pyramide : $\\mathcal V = \\dfrac{\\mathcal A_{base} \\times hauteur}{3}$, où $\\mathcal A_{base}$ est l'aire de la base et la hauteur la distance du sommet au plan de base.<br> Ici, on prend le triangle $ABC$ comme base et $DH$ comme hauteur.",
        }) +
        `Le triangle $ABC$ est rectangle en $A$, donc <br>$\\begin{aligned}
        \\mathcal A_{ABC} &= \\dfrac{\\|\\overrightarrow{AB}\\|\\times\\|\\overrightarrow{AC}\\|}{2}\\\\
        & = \\dfrac{\\sqrt{${AB2}}\\times \\sqrt{${AC2}}}{2}.\\end{aligned}$<br>` +
        `On peut maintenant calculer le volume du tétraèdre :<br>
        $\\begin{aligned}\\mathcal V &= \\dfrac{\\mathcal A_{ABC}\\times DH}{3}\\\\
        & = \\dfrac{\\sqrt{${AB2}}\\times\\sqrt{${AC2}}\\times${fracT.texFractionSimplifiee}\\times\\sqrt{${denom}}}{6} \\\\\\end{aligned}$`
      const egalOuPas = egalOuApprox(volumeDec, 3)
      reponse7 += `<br>
          $\\begin{aligned} \\phantom{ \\mathcal V}&${egalOuPas} ${texNombre(volumeDec, 3)}.\\end{aligned}$<br>
          La valeur ${egalOuPas === '=' ? 'exacte' : 'approchée'} du volume du tétraèdre est $${miseEnEvidence(`${texNombre(volumeDec, 3)}`)}$ `

      texteCorr = createList({
        items: [
          reponse1,
          reponse2,
          reponse3,
          reponse4,
          reponse5,
          reponse6,
          reponse7,
        ],
        style: 'nombres',
      })

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
