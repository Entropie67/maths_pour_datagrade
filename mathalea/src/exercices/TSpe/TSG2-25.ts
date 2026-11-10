import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import {
  all,
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer le projeté orthogonal d'un point sur une droite"
export const interactifReady = true

export const dateDePublication = '26/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'd5251'

export const refs = {
  'fr-fr': ['TSG2-25'],
  'fr-ch': ['3G96-2'],
}

/**
 *
 * @author Stéphane Guyon et Nathan Scheinmann (ajout du cas avec la formule)
 */
export default class projOrthogonal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = [
      'Correction avec la formule de projection orthogonale',
      false,
    ]
    this.sup = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // Point A
      const xA = randint(-6, 6, 0)
      const yA = randint(-6, 6, 0)
      const zA = randint(-6, 6, 0)

      // Vecteurs directeurs u et v non nuls et non colinéaires
      const k = randint(-5, 5, [0, -1, 1])
      const ux = randint(-5, 5, 0)
      const uy = randint(-5, 5, 0)
      const uz = randint(-5, 5, 0)

      // Point H
      const xH = xA + ux * k
      const yH = yA + uy * k
      const zH = zA + uz * k
      const nx = uy - uz
      const ny = uz - ux
      const nz = ux - uy
      const xM = xH + nx
      const yM = yH + ny
      const zM = zH + nz
      const xB = xA + ux
      const yB = yA + uy
      const zB = zA + uz
      const produitScalaireAMAB =
        ux * xM + uy * yM + uz * zM - (ux * xA + uy * yA + uz * zA)
      const normeCarreeAB = ux * ux + uy * uy + uz * uz
      const valeurt = new FractionEtendue(produitScalaireAMAB, normeCarreeAB)
      const coordonneeXAH = new FractionEtendue(
        produitScalaireAMAB * ux,
        normeCarreeAB,
      )
      const coordonneeYAH = new FractionEtendue(
        produitScalaireAMAB * uy,
        normeCarreeAB,
      )
      const coordonneeZAH = new FractionEtendue(
        produitScalaireAMAB * uz,
        normeCarreeAB,
      )
      const abscisseH = new FractionEtendue(
        xA * (ux * ux + uy * uy + uz * uz) + ux * produitScalaireAMAB,
        normeCarreeAB,
      )
      const ordonneeH = new FractionEtendue(
        yA * (ux * ux + uy * uy + uz * uz) + uy * produitScalaireAMAB,
        normeCarreeAB,
      )
      const coteH = new FractionEtendue(
        zA * (ux * ux + uy * uy + uz * uz) + uz * produitScalaireAMAB,
        normeCarreeAB,
      )
      texte =
        "Dans un repère orthonormé de l'espace, on considère les points $A$, $B$ et $M$ de coordonnées respectives : "
      texte += `$A(${xA} ; ${yA} ; ${zA})$, $B(${xB} ; ${yB} ; ${zB})$ et $M(${xM} ; ${yM} ; ${zM})$ .<br>`
      texte += `Déterminer les coordonnées du point $H$ projeté orthogonal du point $M$ sur la droite $(AB)$ .<br><br>`
      if (this.interactif) {
        texte +=
          'Les coordonnées du point $H$ sont : ' +
          remplisLesBlancs(
            this,
            i,
            'H\\left(%{champ1}~;~%{champ2}~;~%{champ3}\\right).',
          )
      }
      handleAnswers(this, i, {
        champ1: {
          value: String(xH),
          compare: all([isEqual(), isReduced(), onlyIrreducibleFractions()]),
        },
        champ2: {
          value: String(yH),
          compare: all([isEqual(), isReduced(), onlyIrreducibleFractions()]),
        },
        champ3: {
          value: String(zH),
          compare: all([isEqual(), isReduced(), onlyIrreducibleFractions()]),
        },
      })

      const ortho = ` ${texteEnCouleurEtGras('Les vecteurs ', bleuMathalea)} $${miseEnEvidence(`\\overrightarrow{AB}`, bleuMathalea)}$ ${texteEnCouleurEtGras(' et ', bleuMathalea)} $${miseEnEvidence(`\\overrightarrow{MH}`, bleuMathalea)}$ ${texteEnCouleurEtGras('sont orthogonaux.', bleuMathalea)} <br>
      On calcule les coordonnées du vecteur $\\overrightarrow{AB}\\begin{pmatrix}${xB}${ecritureAlgebrique(-xA)} \\\\${yB}${ecritureAlgebrique(-yA)} \\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ d'où $\\overrightarrow{AB}\\begin{pmatrix}${ux} \\\\ ${uy} \\\\ ${uz}\\end{pmatrix}$ .<br>
      On calcule les coordonnées du vecteur $\\overrightarrow{MH} \\begin{pmatrix}x  ${ecritureAlgebrique(-xM)} \\\\ y  ${ecritureAlgebrique(-yM)} \\\\ z  ${ecritureAlgebrique(-zM)}\\end{pmatrix}$.<br>
      Le vecteur $\\overrightarrow{AB}$ est orthogonal au vecteur $\\overrightarrow{MH}$, leur produit scalaire est donc nul.<br>
      Donc : <br>$\\begin{aligned}\\phantom{\\iff}&\\overrightarrow{MH} \\cdot \\overrightarrow{AB} = 0\\\\
\\iff &(x ${ecritureAlgebrique(-xM)}) \\times ${ecritureParentheseSiNegatif(ux)} + (y ${ecritureAlgebrique(-yM)}) \\times ${ecritureParentheseSiNegatif(uy)} + (z ${ecritureAlgebrique(-zM)}) \\times ${ecritureParentheseSiNegatif(uz)} = 0\\\\
\\iff &${rienSi1(ux)}  x  ${ecritureAlgebriqueSauf1(uy)} y  ${ecritureAlgebriqueSauf1(uz)} z  ${ecritureAlgebrique(-(ux * xM + uy * yM + uz * zM))}=0\\quad(1)\\end{aligned}$ <br>`

      const pointH = `${texteEnCouleurEtGras('Le point ', bleuMathalea)} $${miseEnEvidence(`H`, bleuMathalea)}$ ${texteEnCouleurEtGras('appartient à la droite ', bleuMathalea)} $${miseEnEvidence(`(AB)`, bleuMathalea)}$.<br>
      Pour utiliser que le point $H$ appartient à la droite $(AB)$, on détermine une représentation paramétrique de cette droite : <br>
      $(AB):\\left\\{ \\begin{array}{l} x = ${xA}  ${ecritureAlgebriqueSauf1(ux)} t \\\\ y = ${yA}  ${ecritureAlgebriqueSauf1(uy)} t \\quad (t\\in\\mathbb{R}) \\\\ z = ${zA}  ${ecritureAlgebriqueSauf1(uz)} t \\end{array} \\right.$ <br>`

      if (this.sup === true) {
        texteCorr = `On calcule les coordonnées du vecteur $\\overrightarrow{AB}\\begin{pmatrix}${xB}${ecritureAlgebrique(-xA)} \\\\${yB}${ecritureAlgebrique(-yA)} \\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}$, d'où $\\overrightarrow{AB}\\begin{pmatrix}${ux} \\\\ ${uy} \\\\ ${uz}\\end{pmatrix}$.<br>
        On calcule aussi $\\overrightarrow{AM}\\begin{pmatrix}${xM}${ecritureAlgebrique(-xA)} \\\\${yM}${ecritureAlgebrique(-yA)} \\\\${zM}${ecritureAlgebrique(-zA)}\\end{pmatrix}$
        soit $\\overrightarrow{AM}\\begin{pmatrix}${xM - xA} \\\\ ${yM - yA} \\\\ ${zM - zA}\\end{pmatrix}$.<br>
        Le point $H$ étant le projeté orthogonal de $M$ sur $(AB)$, le vecteur $\\overrightarrow{AH}$ est le projeté orthogonal du vecteur $\\overrightarrow{AM}$ sur $\\overrightarrow{AB}$.<br>
        On utilise donc la formule : 
        $\\overrightarrow{AH}=\\dfrac{\\overrightarrow{AM}\\cdot\\overrightarrow{AB}}{\\Vert\\overrightarrow{AB}\\Vert^2}\\overrightarrow{AB}$.<br>
        Or :<br>
        $\\dfrac{\\overrightarrow{AM}\\cdot\\overrightarrow{AB}}{\\Vert\\overrightarrow{AB}\\Vert^2}
        =\\dfrac{${xM - xA}\\times ${ecritureParentheseSiNegatif(ux)}+${ecritureParentheseSiNegatif(yM - yA)}\\times ${ecritureParentheseSiNegatif(uy)}+${ecritureParentheseSiNegatif(zM - zA)}\\times ${ecritureParentheseSiNegatif(uz)}}{${ux}^2+${uy}^2+${uz}^2}
        =${valeurt.texFractionSimplifiee}$.<br>
        Ainsi $\\overrightarrow{AH}=${valeurt.texFSP}
        \\begin{pmatrix}
        ${ux} \\\\
         ${uy} \\\\
          ${uz}
          \\end{pmatrix}
        =\\begin{pmatrix}
        ${coordonneeXAH.texFractionSimplifiee} \\\\
         ${coordonneeYAH.texFractionSimplifiee} \\\\
          ${coordonneeZAH.texFractionSimplifiee}
          \\end{pmatrix}$.<br>
          Comme $A(${xA} ; ${yA} ; ${zA})$, on obtient :<br>
        $H(${abscisseH.texFractionSimplifiee} ; ${ordonneeH.texFractionSimplifiee} ; ${coteH.texFractionSimplifiee})$.<br>
        Ainsi, les coordonnées du point $H$ sont $${miseEnEvidence(`H(${abscisseH.texFractionSimplifiee} ; ${ordonneeH.texFractionSimplifiee} ; ${coteH.texFractionSimplifiee}).`)}$`
      } else {
        texteCorr = `Soit $x_H$, $y_H$ et $z_H$ des réels tels que les coordonnées du point $H$ soient $H(x_H;y_H;z_H)$.<br>
        Par définition du projeté orthogonal, on déduit deux informations :<br>
        ${createList({ items: [ortho, pointH], style: 'fleches' })}<br><br>
        ${texteEnCouleurEtGras('Synthèse des deux éléments précédents :', bleuMathalea)} <br><br>
        $H\\in(AB)\\cap\\mathcal{P}$. La droite $(AB)$ étant orthogonale au plan $\\mathcal{P}$, il existe un unique point $H$ solution. <br>
        $H(x_H,y_H,z_H)\\in(AB)\\cap\\mathcal{P}$ si et seulement s'il existe $t\\in\\mathbb{R}$ tel que : <br>
        $\\begin{cases}
x_H = ${xA}  ${ecritureAlgebriqueSauf1(ux)} t \\\\ y_H = ${yA}  ${ecritureAlgebriqueSauf1(uy)} t \\\\ z_H = ${zA}  ${ecritureAlgebriqueSauf1(uz)} t \\\\
${rienSi1(ux)}  x_H + ${rienSi1(uy)} y_H + ${rienSi1(uz)} z_H  ${ecritureAlgebrique(-(ux * xM + uy * yM + uz * zM))}=0\\end{cases}$ <br>
En remplaçant $x_H$, $y_H$ et $z_H$ dans la dernière équation, on obtient : <br>
$\\begin{aligned}
&${rienSi1(ux)}  (${xA}  ${ecritureAlgebriqueSauf1(ux)}  t) + ${rienSi1(uy)}  (${yA}  ${ecritureAlgebriqueSauf1(uy)}  t) + ${rienSi1(uz)}  (${zA}  ${ecritureAlgebriqueSauf1(uz)}  t)  ${ecritureAlgebrique(-(ux * xM + uy * yM + uz * zM))}=0\\\\
\\iff &${ux * xA}  ${ecritureAlgebriqueSauf1(ux * ux)}t  ${ecritureAlgebrique(uy * yA)} ${ecritureAlgebriqueSauf1(uy * uy)} t ${ecritureAlgebrique(uz * zA)} ${ecritureAlgebriqueSauf1(uz * uz)}t ${ecritureAlgebrique(-(ux * xM + uy * yM + uz * zM))}=0\\\\
\\iff &${ux * ux + uy * uy + uz * uz}t  = ${produitScalaireAMAB} \\\\
\\iff & t=${valeurt.texFractionSimplifiee}\\end{aligned}$<br>
On en déduit les coordonnées du point $H$ en remplaçant $t$ par $${valeurt.texFractionSimplifiee}$ dans les $3$ premières équations du système : <br>
$\\begin{cases}
x_H = ${xA}  ${ecritureAlgebrique(ux)} \\times ${valeurt.texFSP} \\\\
y_H = ${yA}  ${ecritureAlgebrique(uy)} \\times ${valeurt.texFSP} \\\\
z_H = ${zA}  ${ecritureAlgebrique(uz)} \\times ${valeurt.texFSP}
 \\end{cases}$ d'où finalement
 $\\begin{cases}
x_H = ${abscisseH.texFractionSimplifiee} \\\\
y_H = ${ordonneeH.texFractionSimplifiee} \\\\
z_H = ${coteH.texFractionSimplifiee} \\end{cases}$ <br>
On vérifie que le point $H$ ainsi déterminé satisfait bien la dernière équation du système. <br>
Ainsi, les coordonnées du point $H$ sont $${miseEnEvidence(`H(${abscisseH.texFractionSimplifiee} ; ${ordonneeH.texFractionSimplifiee} ; ${coteH.texFractionSimplifiee}).`)}$`
      }

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
