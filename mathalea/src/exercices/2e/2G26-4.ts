import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const interactifReady = true

export const titre =
  "Calculer les coordonnées d'un point à partir d'une égalité vectorielle"
export const dateDePublication = '12/06/2023'

/**
 * Coordonnées d'un point à partir d'une égalité
 * @author Stéphan Grignon
 *  Interactif Gilles Mora le 11 juin 2024
 */
export const uuid = '222f6'

export const refs = {
  'fr-fr': ['2G26-4'],
  'fr-ch': ['3G92-7'],
}
export default class Calculercoordonneesegalitevecteurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Situations différentes ',
      "1 : À partir d'une égalité\n 2 : À partir d'une somme\n 3 : À partir d'un produit par un réel\n4 : Mélange",
    ]

    this.nbQuestions = 2

    this.sup = '1'
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['t1', 't2', 't3'],
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let xB: FractionEtendue
      let yB: FractionEtendue
      let texte = ''
      let texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 't1':
          {
            // On donne 2 points et 1 vecteur
            const ux = randint(-9, 9, [0])
            const uy = randint(-9, 9, [0])
            const xA = randint(-9, 9, [0])
            const yA = randint(-9, 9, [0])
            const pr = choice(['A', 'B'])
            const se = choice(['A', 'B'], [pr])
            if (pr === 'A') {
              xB = new FractionEtendue(ux + xA, 1)
              yB = new FractionEtendue(uy + yA, 1)
            } else {
              xB = new FractionEtendue(xA - ux, 1)
              yB = new FractionEtendue(yA - uy, 1)
            }

            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne le point $A(${xA}\\,;\\,${yA})$ et le vecteur $\\vec{u}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$.<br>`
            texte += `Déterminer les coordonnées du point $B$ tel que $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}$.`

            texteCorr = `$\\overrightarrow{u}=\\overrightarrow{${pr}${se}}$ `
            if (pr === 'A') {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=x_B-${ecritureParentheseSiNegatif(xA)}\\\\${uy}=y_B-${ecritureParentheseSiNegatif(yA)}\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}${ecritureAlgebrique(xA)}=x_B\\\\${uy}${ecritureAlgebrique(yA)}=y_B\\end{cases}$ `
            } else {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=${xA}-x_B\\\\${uy}=${yA}-y_B\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xA}-${ecritureParentheseSiNegatif(ux)}\\\\y_B=${yA}-${ecritureParentheseSiNegatif(uy)}\\end{cases}$ `
            }
            texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xB.texFraction}\\\\y_B=${yB.texFraction}\\end{cases}$, soit $B(${miseEnEvidence(xB.texFraction)}\\,;\\,${miseEnEvidence(yB.texFraction)})$.`
            if (this.correctionDetaillee) {
              texteCorr =
                'Soit $(x_B;y_B)$ les coordonnées du point que nous cherchons à déterminer.<br><br>'
              texteCorr +=
                "On sait d'après le cours que si $M(x_M;y_M)$ et $N(x_N;y_N)$ sont deux points d'un repère, on a alors $\\overrightarrow{MN}\\begin{pmatrix}x_N-x_M\\\\y_N-y_M\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé : "
              if (pr === 'A') {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}x_B-${ecritureParentheseSiNegatif(xA)}\\\\y_B-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$.<br><br>`
                texteCorr +=
                  "Soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
                texteCorr +=
                  "On sait d'après le cours que $\\overrightarrow{u}=\\overrightarrow{v}$ équivaut à $\\begin{cases}x=x'\\\\y=y'\\end{cases}$.<br><br>"
                texteCorr += `D'après l'énoncé $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}$, ce qui équivaut à résoudre :<br><br>`
                texteCorr += `$\\begin{cases}${ux}=x_B-${ecritureParentheseSiNegatif(xA)}\\\\${uy}=y_B-${ecritureParentheseSiNegatif(yA)}\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}${ecritureAlgebrique(xA)}=x_B\\\\${uy}${ecritureAlgebrique(yA)}=y_B\\end{cases}$<br><br>`
              } else {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}${xA}-x_B\\\\${yA}-y_B\\end{pmatrix}$.<br><br>`
                texteCorr +=
                  "Soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
                texteCorr +=
                  "On sait d'après le cours que $\\overrightarrow{u}=\\overrightarrow{v}$ équivaut à $\\begin{cases}x=x'\\\\y=y'\\end{cases}$.<br><br>"
                texteCorr += `D'après l'énoncé $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}$, ce qui équivaut à résoudre :<br><br>`
                texteCorr += `$\\begin{cases}${ux}=${xA}-x_B\\\\${uy}=${yA}-y_B\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xA}-${ecritureParentheseSiNegatif(ux)}\\\\y_B=${yA}-${ecritureParentheseSiNegatif(uy)}\\end{cases}$<br><br>`
              }
              texteCorr += `Ce qui donne au final : $\\begin{cases}x_B=${xB.texFraction}\\\\y_B=${yB.texFraction}\\end{cases}$, soit $B(${miseEnEvidence(xB.texFraction)}\\,;\\,${miseEnEvidence(yB.texFraction)})$.`
            }
          }
          break

        case 't2':
          {
            // On donne 1 vecteur, 3 points et une somme
            const ux = randint(-9, 9, [0])
            const uy = randint(-9, 9, [0])
            const xA = randint(-9, 9, [0])
            const yA = randint(-9, 9, [0])
            const xC = randint(-9, 9, [0])
            const yC = randint(-9, 9, [0])
            const xD = randint(-9, 9, [0])
            const yD = randint(-9, 9, [0])
            const pr = choice(['A', 'B'])
            const se = choice(['A', 'B'], [pr])
            if (pr === 'A') {
              xB = new FractionEtendue(ux + xC + xA - xD, 1)
              yB = new FractionEtendue(uy + yC + yA - yD, 1)
            } else {
              xB = new FractionEtendue(xD - xC + xA - ux, 1)
              yB = new FractionEtendue(yD - yC + yA - uy, 1)
            }

            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne les points $A(${xA}\\,;\\,${yA})$, $C(${xC}\\,;\\,${yC})$, $D(${xD}\\,;\\,${yD})$ et le vecteur $\\vec{u}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$.<br>`
            texte += `Déterminer les coordonnées du point $B$ tel que $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}+\\overrightarrow{CD}$.`

            if (pr === 'A') {
              texteCorr = `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}x_B-${ecritureParentheseSiNegatif(xA)}\\\\y_B-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$.<br><br>`
            } else {
              texteCorr = `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}${xA}-x_B\\\\${yA}-y_B\\end{pmatrix}$.<br><br>`
            }
            texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
            texteCorr += `$\\overrightarrow{u}=\\overrightarrow{${pr}${se}}+\\overrightarrow{CD}$ `
            if (pr === 'A') {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=x_B-${ecritureParentheseSiNegatif(xA)}+${ecritureParentheseSiNegatif(xD - xC)}\\\\${uy}=y_B-${ecritureParentheseSiNegatif(yA)}+${ecritureParentheseSiNegatif(yD - yC)}\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=x_B${ecritureAlgebrique(xD - xC - xA)}\\\\${uy}=y_B${ecritureAlgebrique(yD - yC - yA)}\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}${ecritureAlgebrique(xC + xA - xD)}=x_B\\\\${uy}${ecritureAlgebrique(yC + yA - yD)}=y_B\\end{cases}$ `
            } else {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=${xA}-x_B+${ecritureParentheseSiNegatif(xD - xC)}\\\\${uy}=${yA}-y_B+${ecritureParentheseSiNegatif(yD - yC)}\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=${xD - xC + xA}-x_B\\\\${uy}=${yD - yC + yA}-y_B\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xD - xC + xA}-${ecritureParentheseSiNegatif(ux)}\\\\y_B=${yD - yC + yA}-${ecritureParentheseSiNegatif(uy)}\\end{cases}$ `
            }
            texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xB.texFraction}\\\\y_B=${yB.texFraction}\\end{cases}$, soit $B(${miseEnEvidence(xB.texFraction)}\\,;\\,${miseEnEvidence(yB.texFraction)})$.`
            if (this.correctionDetaillee) {
              texteCorr =
                'Soit $(x_B;y_B)$ les coordonnées du point que nous cherchons à déterminer.<br><br>'
              texteCorr +=
                "On sait d'après le cours que si $M(x_M;y_M)$ et $N(x_N;y_N)$ sont deux points d'un repère, on a alors $\\overrightarrow{MN}\\begin{pmatrix}x_N-x_M\\\\y_N-y_M\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé :<br><br>"
              if (pr === 'A') {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}x_B-${ecritureParentheseSiNegatif(xA)}\\\\y_B-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$ et `
                texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
                texteCorr +=
                  "Soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
                texteCorr +=
                  "On sait d'après le cours que $\\overrightarrow{u}=\\overrightarrow{v}$ équivaut à $\\begin{cases}x=x'\\\\y=y'\\end{cases}$ et que $\\vec{w}=\\vec{u}+\\vec{v}$ aura pour coordonnées $\\vec{w}\\begin{pmatrix}x+x'\\\\y+y'\\end{pmatrix}$.<br><br>"
                texteCorr += `D'après l'énoncé $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}+\\overrightarrow{CD}$, ce qui équivaut à résoudre :<br><br>`
                texteCorr += `$\\begin{cases}${ux}=x_B-${ecritureParentheseSiNegatif(xA)}+${ecritureParentheseSiNegatif(xD - xC)}\\\\${uy}=y_B-${ecritureParentheseSiNegatif(yA)}+${ecritureParentheseSiNegatif(yD - yC)}\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=x_B${ecritureAlgebrique(xD - xC - xA)}\\\\${uy}=y_B${ecritureAlgebrique(yD - yC - yA)}\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}${ecritureAlgebrique(xC + xA - xD)}=x_B\\\\${uy}${ecritureAlgebrique(yC + yA - yD)}=y_B\\end{cases}$<br><br>`
              } else {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}${xA}-x_B\\\\${yA}-y_B\\end{pmatrix}$ et `
                texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
                texteCorr +=
                  "Soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
                texteCorr +=
                  "On sait d'après le cours que $\\overrightarrow{u}=\\overrightarrow{v}$ équivaut à $\\begin{cases}x=x'\\\\y=y'\\end{cases}$ et que $\\vec{w}=\\vec{u}+\\vec{v}$ aura pour coordonnées $\\vec{w}\\begin{pmatrix}x+x'\\\\y+y'\\end{pmatrix}$.<br><br>"
                texteCorr += `D'après l'énoncé $\\overrightarrow{u}=\\overrightarrow{${pr}${se}}+\\overrightarrow{CD}$, ce qui équivaut à résoudre :<br><br>`
                texteCorr += `$\\begin{cases}${ux}=${xA}-x_B+${ecritureParentheseSiNegatif(xD - xC)}\\\\${uy}=${yA}-y_B+${ecritureParentheseSiNegatif(yD - yC)}\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}${ux}=${xD - xC + xA}-x_B\\\\${uy}=${yD - yC + yA}-y_B\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xD - xC + xA}-${ecritureParentheseSiNegatif(ux)}\\\\y_B=${yD - yC + yA}-${ecritureParentheseSiNegatif(uy)}\\end{cases}$<br><br>`
              }
              texteCorr += `Ce qui donne au final : $\\begin{cases}x_B=${xB.texFraction}\\\\y_B=${yB.texFraction}\\end{cases}$, soit $B(${miseEnEvidence(xB)}\\,;\\,${miseEnEvidence(yB)})$.`
            }
          }
          break

        case 't3':
        default:
          {
            // On donne 3 points & k entier
            const xA = randint(-9, 9, [0])
            const yA = randint(-9, 9, [0])
            const xC = randint(-9, 9, [0])
            const yC = randint(-9, 9, [0])
            const xD = randint(-9, 9, [0])
            const yD = randint(-9, 9, [0])
            const k = randint(-9, 9, [-1, 0, 1])
            const pr = choice(['A', 'B'])
            const se = choice(['A', 'B'], [pr])
            const a = new FractionEtendue(xD - xC, k).simplifie()
            const b = new FractionEtendue(yD - yC, k).simplifie()
            if (pr === 'A') {
              xB = new FractionEtendue(xD - xC + k * xA, k).simplifie()
              yB = new FractionEtendue(yD - yC + k * yA, k).simplifie()
            } else {
              xB = new FractionEtendue(k * xA - xD + xC, k).simplifie()
              yB = new FractionEtendue(k * yA - yD + yC, k).simplifie()
            }

            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne les points suivants : $A(${xA};${yA})$, $C(${xC};${yC})$ et $D(${xD};${yD})$.<br>`
            texte += `Déterminer les coordonnées du point $B$ tel que $\\overrightarrow{CD}=${k}\\overrightarrow{${pr}${se}}$.`

            if (pr === 'A') {
              texteCorr = `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}x_B-${ecritureParentheseSiNegatif(xA)}\\\\y_B-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$.<br><br>`
            } else {
              texteCorr = `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}${xA}-x_B\\\\${yA}-y_B\\end{pmatrix}$.<br><br>`
            }
            texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
            texteCorr += `$\\overrightarrow{CD}=${k}\\overrightarrow{${pr}${se}}$ `
            if (pr === 'A') {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${xD - xC}=${k}(x_B-${ecritureParentheseSiNegatif(xA)})\\\\[0.7em]${yD - yC}=${k}(y_B-${ecritureParentheseSiNegatif(yA)})\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}\\dfrac{${xD - xC}}{${k}}=x_B-${ecritureParentheseSiNegatif(xA)}\\\\[0.7em]\\dfrac{${yD - yC}}{${k}}=y_B-${ecritureParentheseSiNegatif(yA)}\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}${a.texFSD}${ecritureAlgebrique(xA)}=x_B\\\\[0.7em]${b.texFSD}${ecritureAlgebrique(yA)}=y_B\\end{cases}$ `
            } else {
              texteCorr += `$\\Leftrightarrow\\begin{cases}${xD - xC}=${k}(${xA}-x_B)\\\\[0.7em]${yD - yC}=${k}(${yA}-y_B)\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}\\dfrac{${xD - xC}}{${k}}=${xA}-x_B\\\\[0.7em]\\dfrac{${yD - yC}}{${k}}=${yA}-y_B\\end{cases}$ `
              texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xA}-${a.texFSP}\\\\[0.7em]y_B=${yA}-${b.texFSP}\\end{cases}$ `
            }
            texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xB.texFSD}\\\\[0.7em]y_B=${yB.texFSD}\\end{cases}$, soit $B\\left(${miseEnEvidence(xB.texFSD)}\\,;\\,${miseEnEvidence(yB.texFSD)}\\right)$.`
            if (this.correctionDetaillee) {
              texteCorr =
                'Soit $(x_B;y_B)$ les coordonnées du point que nous cherchons à déterminer.<br><br>'
              texteCorr +=
                "On sait d'après le cours que si $M(x_M;y_M)$ et $N(x_N;y_N)$ sont deux points d'un repère, on a alors $\\overrightarrow{MN}\\begin{pmatrix}x_N-x_M\\\\y_N-y_M\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé :<br><br>"
              if (pr === 'A') {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}x_B-${ecritureParentheseSiNegatif(xA)}\\\\y_B-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$ et `
                texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
              } else {
                texteCorr += `$\\overrightarrow{${pr}${se}}\\begin{pmatrix}${xA}-x_B\\\\${yA}-y_B\\end{pmatrix}$ et `
                texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
              }
              texteCorr +=
                "Soit $k$ un nombre réel et soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
              texteCorr +=
                "On sait d'après le cours que $k\\overrightarrow{u}\\begin{pmatrix}k \\times x\\\\k \\times y\\end{pmatrix}$ et que $\\overrightarrow{u}=\\overrightarrow{v}$ équivaut à $\\begin{cases}x=x'\\\\y=y'\\end{cases}$.<br><br>"
              texteCorr += `D'après l'énoncé $\\overrightarrow{CD}=${k}\\overrightarrow{${pr}${se}}$, ce qui équivaut à résoudre :<br><br>`
              if (pr === 'A') {
                texteCorr += `$\\begin{cases}${xD - xC}=${k}(x_B-${ecritureParentheseSiNegatif(xA)})\\\\[0.7em]${yD - yC}=${k}(y_B-${ecritureParentheseSiNegatif(yA)})\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}\\dfrac{${xD - xC}}{${k}}=x_B-${ecritureParentheseSiNegatif(xA)}\\\\[0.7em]\\dfrac{${yD - yC}}{${k}}=y_B-${ecritureParentheseSiNegatif(yA)}\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}${a.texFSD}${ecritureAlgebrique(xA)}=x_B\\\\[0.7em]${b.texFSD}${ecritureAlgebrique(yA)}=y_B\\end{cases}$<br><br>`
              } else {
                texteCorr += `$\\begin{cases}${xD - xC}=${k}(${xA}-x_B)\\\\[0.7em]${yD - yC}=${k}(${yA}-y_B)\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}\\dfrac{${xD - xC}}{${k}}=${xA}-x_B\\\\[0.7em]\\dfrac{${yD - yC}}{${k}}=${yA}-y_B\\end{cases}$ `
                texteCorr += `$\\Leftrightarrow\\begin{cases}x_B=${xA}-${a.texFSP}\\\\[0.7em]y_B=${yA}-${b.texFSP}\\end{cases}$<br><br>`
              }
              texteCorr += `Ce qui donne au final : $\\begin{cases}x_B=${xB.texFSD}\\\\[0.7em]y_B=${yB.texFSD}\\end{cases}$, soit $B\\left(${miseEnEvidence(xB.texFSD)};${miseEnEvidence(yB.texFSD)}\\right)$.`
            }
          }
          break
      }

      handleAnswers(this, i, {
        bareme: (listePoints) => [Math.min(listePoints[0], listePoints[1]), 1],
        champ1: { value: xB.texFraction },
        champ2: { value: yB.texFraction },
      })
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            'B(%{champ1}\\,;\\,%{champ2})',
            KeyboardType.clavierDeBaseAvecFraction,
          )
      }

      if (this.questionJamaisPosee(i, xB, yB)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
