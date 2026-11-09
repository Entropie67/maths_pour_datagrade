import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { signe } from '../../lib/outils/nombres'
import Exercice from '../Exercice'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'

export const interactifReady = true

export const titre =
  "Calculer les coordonnées du produit d'un vecteur par un réel"
export const dateDePublication = '28/05/2023'
export const dateDeModifImportante = '14/06/2023'

/**
 * Produit d'un vecteur par un réel
 * @author Stéphan Grignon
 * @author Jean-claude Lhote
 * Interactif Gilles Mora le 11 juin 2024
 */
export const uuid = '68693'

export const refs = {
  'fr-fr': ['2G26-3', 'BP1GV06'],
  'fr-ch': ['3G92-6'],
}
export default class Calculercoordonneesproduitvecteurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Situations différentes ',
      '1 : Coordonnées entières\n2 : Coordonnées en écriture fractionnaire\n3 : À partir de quatre points\n4 : Mélange',
    ]

    this.nbQuestions = 2

    this.sup = '1'
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['t1', 't2', 't3'],
    }).map(String)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let wx: FractionEtendue
      let wy: FractionEtendue
      switch (listeTypeDeQuestions[i]) {
        case 't1':
          {
            // On donne 2 vecteurs à coordonnées entières & k entier
            let uy, vy
            const ux = randint(-9, 9)
            if (ux === 0) {
              uy = randint(-9, 9, [0])
            } else {
              uy = randint(-9, 9)
            } // Premier vecteur jamais nul
            const vx = randint(-9, 9)
            if (vx === 0) {
              vy = randint(-9, 9, [0])
            } else {
              vy = randint(-9, 9)
            } // Second vecteur jamais nul
            const k = randint(-9, 9, [-1, 0, 1])
            // wx et wy sont entier tout comme dans 't3' mais on uniformise avec 't2' la réponse pour l'interactif
            wx = new FractionEtendue(ux + k * vx, 1)
            wy = new FractionEtendue(uy + k * vy, 1)

            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne les vecteurs suivants : $\\vec{u}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx}\\\\${vy}\\end{pmatrix}$.<br>`
            texte += `Déterminer les coordonnées du vecteur $\\overrightarrow{w}=\\overrightarrow{u}${ecritureAlgebrique(k)}\\overrightarrow{v}$.`

            texteCorr = `$\\overrightarrow{w}\\begin{pmatrix}${ux}${ecritureAlgebrique(k)}\\times${ecritureParentheseSiNegatif(vx)}\\\\${uy}${ecritureAlgebrique(k)}\\times${ecritureParentheseSiNegatif(vy)}\\end{pmatrix}$, soit $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFSD)}\\\\${miseEnEvidence(wy.texFSD)}\\end{pmatrix}$.<br>`
            if (this.correctionDetaillee) {
              texteCorr =
                "Soit $k$ un nombre réel et soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
              texteCorr +=
                "On sait d'après le cours que $k\\overrightarrow{v}\\begin{pmatrix}k \\times x'\\\\k \\times y'\\end{pmatrix}$ et que $\\overrightarrow{u}+\\overrightarrow{v}\\begin{pmatrix}x+x'\\\\y+y'\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé :<br><br>"
              texteCorr += `$${k}\\overrightarrow{v}\\begin{pmatrix}${k}\\times${ecritureParentheseSiNegatif(vx)}\\\\${k}\\times${ecritureParentheseSiNegatif(vy)}\\end{pmatrix}$, soit $${k}\\overrightarrow{v}\\begin{pmatrix}${k * vx}\\\\${k * vy}\\end{pmatrix}$.<br><br>`
              texteCorr += `$\\overrightarrow{u}${ecritureAlgebrique(k)}\\overrightarrow{v}\\begin{pmatrix}${ux}+${ecritureParentheseSiNegatif(k * vx)}\\\\${uy}+${ecritureParentheseSiNegatif(k * vy)}\\end{pmatrix}$<br><br>`
              texteCorr += `Ce qui donne au final : $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFSD)}\\\\${miseEnEvidence(wy.texFSD)}\\end{pmatrix}$.<br>`
            }
          }
          break

        case 't2':
          {
            // On donne 1/2 vecteur à coordonnées fractionnaires & k fraction
            const listeFractions1 = [
              [1, 2],
              [3, 2],
              [5, 2],
              [1, 3],
              [2, 3],
              [4, 3],
              [5, 3],
              [1, 4],
              [3, 4],
              [5, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
            ]
            // u vecteur à coordonnées entières
            const ux = randint(-9, 9, [0])
            const uy = randint(-9, 9, [0])
            const frac1 = choice(listeFractions1)
            const k = new FractionEtendue(frac1[0], frac1[1])
            const a = choice([-1, 1])
            const frac2 = choice(listeFractions1)
            const vx = new FractionEtendue(frac2[0], frac2[1])
            // const vy = new FractionEtendue(randint(-9, 9, [0]), 1)
            const vy = fraction(randint(-9, 9, [0]), 1)
            wx = vx
              .produitFraction(k.multiplieEntier(a))
              .ajouteEntier(ux)
              .simplifie()
            // vy est un entier... pourquoi ne pas utiliser un number (Jean-claude Lhote le 21/01/2025 lors du passage à typescript)
            //   wy = vy.produitFraction(k.multiplieEntier(a)).ajouteEntier(uy).simplifie()
            wy = vy
              .produitFraction(k.multiplieEntier(a))
              .ajouteEntier(uy)
              .simplifie()
            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne les vecteurs suivants : $\\vec{u}\\begin{pmatrix}${ux}\\\\[0.7em]${uy}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx.texFraction}\\\\[0.7em]${vy.texFraction}\\end{pmatrix}$.<br>`
            texte += `Déterminer les coordonnées du vecteur $\\overrightarrow{w}=\\overrightarrow{u}${signe(a)}${k.texFSD}\\overrightarrow{v}$.`

            texteCorr = `$\\overrightarrow{w}\\begin{pmatrix}${ux}${signe(a)}${k.texFraction}\\times ${vx.texFraction}\\\\[0.7em]${uy}${signe(a)}${k.texFSD}\\times${vy.ecritureParentheseSiNegatif}\\end{pmatrix}$, soit $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFraction)}\\\\[0.7em]${miseEnEvidence(wy.texFraction)}\\end{pmatrix}$.`
            if (this.correctionDetaillee) {
              texteCorr =
                "Soit $k$ un nombre réel et soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
              texteCorr +=
                "On sait d'après le cours que $k\\overrightarrow{v}\\begin{pmatrix}k \\times x'\\\\k \\times y'\\end{pmatrix}$ et que $\\overrightarrow{u}+\\overrightarrow{v}\\begin{pmatrix}x+x'\\\\y+y'\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé :<br><br>"
              texteCorr += `$${fraction(frac1[0] * a, frac1[1]).texFractionSimplifiee}\\overrightarrow{v}\\begin{pmatrix}${fraction(frac1[0] * a, frac1[1]).texFractionSimplifiee}\\times${vx.texFraction}\\\\[0.7em]${fraction(frac1[0] * a, frac1[1]).texFractionSimplifiee}\\times${vy.ecritureParentheseSiNegatif}\\end{pmatrix}$, soit $${fraction(frac1[0] * a, frac1[1]).texFractionSimplifiee}\\overrightarrow{v}\\begin{pmatrix}${fraction(a * frac1[0] * frac2[0], frac1[1] * frac2[1]).texFractionSimplifiee}\\\\[0.7em]${vy.multiplieEntier(a * frac1[0]).entierDivise(frac1[1]).texFraction}\\end{pmatrix}$.<br><br>`

              texteCorr += `$\\overrightarrow{u}${signe(a)}${k.texFraction}\\overrightarrow{v}\\begin{pmatrix}${ux}+\\left(${fraction(a * frac1[0] * frac2[0], frac1[1] * frac2[1]).texFractionSimplifiee}\\right)\\\\[0.7em]${uy}+\\left(${vy.multiplieEntier(a * frac1[0]).entierDivise(frac1[1]).texFraction}\\right)\\end{pmatrix}$.<br><br>`

              texteCorr += `Ce qui donne au final : $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFraction)}\\\\[0.7em]${miseEnEvidence(wy.texFraction)}\\end{pmatrix}$.<br>`
            }
          }
          break

        case 't3':
        default:
          {
            // On donne 4 points à coordonnées entières & k entier
            const xA = randint(-9, 9)
            const yA = randint(-9, 9, xA)
            const xB = randint(-9, 9, xA)
            const yB = randint(-9, 9, [yA, xB])
            const xC = randint(-9, 9)
            const yC = randint(-9, 9, xC)
            const xD = randint(-9, 9, xC)
            const yD = randint(-9, 9, [yC, xD])
            const k = randint(-9, 9, [-1, 0, 1])
            wx = new FractionEtendue(xB - xA + k * (xD - xC), 1)
            wy = new FractionEtendue(yB - yA + k * (yD - yC), 1)

            texte = `Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on donne les points suivants : $A\\left(${xA}\\,;\\,${yA}\\right)$, $B\\left(${xB}\\,;\\,${yB}\\right)$, $C\\left(${xC}\\,;\\,${yC}\\right)$ et $D\\left(${xD}\\,;\\,${yD}\\right)$.<br>`
            texte += `Déterminer les coordonnées du vecteur $\\overrightarrow{w}=\\overrightarrow{AB}${ecritureAlgebrique(k)}\\overrightarrow{CD}$.`

            if (this.correctionDetaillee) {
              texteCorr =
                "On sait d'après le cours que si $A(x_A;y_A)$ et $B(x_B;y_B)$ sont deux points d'un repère, alors on a $\\overrightarrow{AB}\\begin{pmatrix}x_B-x_A\\\\y_B-y_A\\end{pmatrix}$.<br>"
              texteCorr += "On applique ici aux données de l'énoncé :<br><br>"
            } else {
              texteCorr = ''
            }
            texteCorr += `$\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$, soit $\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\end{pmatrix}$.<br><br>`
            texteCorr += `$\\overrightarrow{CD}\\begin{pmatrix}${xD}-${ecritureParentheseSiNegatif(xC)}\\\\${yD}-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$, soit $\\overrightarrow{CD}\\begin{pmatrix}${xD - xC}\\\\${yD - yC}\\end{pmatrix}$.<br><br>`
            if (this.correctionDetaillee) {
              texteCorr +=
                "Soit $k$ un nombre réel et soit $\\vec{u}\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$ deux vecteurs dans un repère $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$.<br><br>"
              texteCorr +=
                "On sait d'après le cours que $k\\overrightarrow{v}\\begin{pmatrix}k \\times x'\\\\k \\times y'\\end{pmatrix}$ et que $\\overrightarrow{u}+\\overrightarrow{v}\\begin{pmatrix}x+x'\\\\y+y'\\end{pmatrix}$.<br><br>"
              texteCorr += "Appliqué aux données de l'énoncé :<br><br>"
              texteCorr += `$${k}\\overrightarrow{CD}\\begin{pmatrix}${k}\\times${ecritureParentheseSiNegatif(xD - xC)}\\\\${k}\\times${ecritureParentheseSiNegatif(yD - yC)}\\end{pmatrix}$, soit $${k}\\overrightarrow{CD}\\begin{pmatrix}${k * (xD - xC)}\\\\${k * (yD - yC)}\\end{pmatrix}$.<br><br>`
              texteCorr += `$\\overrightarrow{AB}${ecritureAlgebrique(k)}\\overrightarrow{CD}\\begin{pmatrix}${xB - xA}+${ecritureParentheseSiNegatif(k * (xD - xC))}\\\\${yB - yA}+${ecritureParentheseSiNegatif(k * (yD - yC))}\\end{pmatrix}$<br><br>`
              texteCorr += `Ce qui donne au final : $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFSD)}\\\\${miseEnEvidence(wy.texFSD)}\\end{pmatrix}$.<br>`
            } else {
              texteCorr = `$\\overrightarrow{w}\\begin{pmatrix}${xB - xA}${ecritureAlgebrique(k)}\\times${ecritureParentheseSiNegatif(xD - xC)}\\\\${yB - yA}${ecritureAlgebrique(k)}\\times${ecritureParentheseSiNegatif(yD - yC)}\\end{pmatrix}$, soit $\\overrightarrow{w}\\begin{pmatrix}${miseEnEvidence(wx.texFSD)}\\\\${miseEnEvidence(wy.texFSD)}\\end{pmatrix}$.<br>`
            }
          }
          break
      }
      handleAnswers(this, i, {
        bareme: (listePoints) => [Math.min(listePoints[0], listePoints[1]), 1],
        champ1: { value: wx.texFraction },
        champ2: { value: wy.texFraction },
      })
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            '\\overrightarrow{w}\\begin{pmatrix}%{champ1}\\\\\\\\%{champ2}\\end{pmatrix}',
            KeyboardType.clavierDeBaseAvecFraction,
          )
      }

      if (this.questionJamaisPosee(i, wx, wy)) {
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
