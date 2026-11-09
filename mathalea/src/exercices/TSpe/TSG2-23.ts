import { createList } from '../../lib/format/lists'
import { lampeMessage } from '../../lib/format/message'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer une valeur approchée de l'angle formé par trois points de l'espace."

export const dateDePublication = '27/01/2026'

export const uuid = '6f9d4'

export const refs = {
  'fr-fr': ['TSG2-23'],
  'fr-ch': ['3G95-15'],
}

/**
 *
 * @author Stéphane Guyon
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing =2
    this.spacingCorr =  1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''

      const xA = randint(-6, 6, 0)
      const yA = randint(-6, 6, 0)
      const zA = randint(-6, 6, 0)
      const xB = randint(-6, 6, [xA, 0])
      const yB = randint(-6, 6, [yA, 0])
      const zB = randint(-6, 6, [zA, 0])
      const xC = randint(-6, 6, [0, xB])
      const yC = randint(-6, 6, [0, yB])
      const zC = randint(-6, 6, [0, zB])

      const BAx = xA - xB
      const BAy = yA - yB
      const BAz = zA - zB
      const BCx = xC - xB
      const BCy = yC - yB
      const BCz = zC - zB
      const normBASq = BAx * BAx + BAy * BAy + BAz * BAz
      const normBCSq = BCx * BCx + BCy * BCy + BCz * BCz
      const normBA = Math.sqrt(normBASq)
      const normBC = Math.sqrt(normBCSq)

      // on boucle si un point confond B, si A=C, ou si les trois points sont alignés

      // Si on est ici, la configuration est valide
      const produitScalaire = BAx * BCx + BAy * BCy + BAz * BCz
      const cosAlpha = produitScalaire / (normBA * normBC)
      const angleRad = Math.acos(cosAlpha)
      const angleDeg = (angleRad * 180) / Math.PI
      const angleArrondi = Math.round(angleDeg)

      texte =
        'Dans un repère orthonormé du plan, on considère les points suivants : '
      texte += `$A(${xA} ; ${yA} ; ${zA})$, $B(${xB} ; ${yB} ; ${zB})$ et $C(${xC} ; ${yC} ; ${zC})$.<br>`
      texte +=
        "Calculer une valeur approchée au degré près de l'angle $\\widehat{ABC}$."

      let vecteurs = `${texteEnCouleurEtGras('Calcul de $\\overrightarrow{BA}\\cdot\\overrightarrow{BC}$ avec les coordonnées des vecteurs :', 'black')}<br>`
      vecteurs += `On calcule les coordonnées des vecteurs $\\overrightarrow{BA}$ et $\\overrightarrow{BC}$ :<br>
        $\\overrightarrow{BA}\\begin{pmatrix}${xA}${ecritureAlgebrique(-xB)}\\\\${yA}${ecritureAlgebrique(-yB)}\\\\${zA}${ecritureAlgebrique(-zB)}\\end{pmatrix}$ et $\\overrightarrow{BC}\\begin{pmatrix}${xC}${ecritureAlgebrique(-xB)}\\\\${yC}${ecritureAlgebrique(-yB)}\\\\${zC}${ecritureAlgebrique(-zB)}\\end{pmatrix}$.<br>
        D'où 
         $\\overrightarrow{BA}\\begin{pmatrix}${BAx}\\\\${BAy}\\\\${BAz}\\end{pmatrix}$ et $\\overrightarrow{BC}\\begin{pmatrix}${BCx}\\\\${BCy}\\\\${BCz}\\end{pmatrix}$.<br>
        Le produit scalaire se calcule alors directement :<br>
        $\\overrightarrow{BA}\\cdot\\overrightarrow{BC} = ${BAx} \\times ${ecritureParentheseSiNegatif(BCx)} + ${BAy} \\times ${ecritureParentheseSiNegatif(BCy)} + ${BAz} \\times ${ecritureParentheseSiNegatif(BCz)} = ${produitScalaire}$.<br>`

      let normes = `${texteEnCouleurEtGras('Calcul de $\\overrightarrow{BA}\\cdot\\overrightarrow{BC}$ avec le produit des normes.','black')}<br>`
      normes +=
        'On calcule à nouveau le même produit scalaire mais avec la formule du produit des normes :<br>'
      normes +=
        '$\\overrightarrow{BA}\\cdot\\overrightarrow{BC} = \\vert\\vert\\overrightarrow{BA}\\vert\\vert\\ \\times \\vert\\vert\\overrightarrow{BC}\\vert\\vert\\ \\times\\cos(\\widehat{ABC})$.<br>'
      normes +=
        'Calculons les normes des deux vecteurs : <br>'
      normes += `$\\vert\\vert\\overrightarrow{BA}\\vert\\vert = \\sqrt{${ecritureParentheseSiNegatif(BAx)}^2 + ${ecritureParentheseSiNegatif(BAy)}^2 + ${ecritureParentheseSiNegatif(BAz)}^2} = \\sqrt{${normBASq}}\\quad$ `
      normes += `et $\\quad\\vert\\vert\\overrightarrow{BC}\\vert\\vert = \\sqrt{${ecritureParentheseSiNegatif(BCx)}^2 + ${ecritureParentheseSiNegatif(BCy)}^2 + ${ecritureParentheseSiNegatif(BCz)}^2} = \\sqrt{${normBCSq}}$.<br>`
      normes += `On en déduit que : $\\overrightarrow{BA}\\cdot\\overrightarrow{BC} = \\sqrt{${normBASq}}\\times \\sqrt{${normBCSq}}\\times\\cos(\\widehat{ABC})$.<br>`
      let calculCos = `${texteEnCouleurEtGras("Calcul de la valeur approchée de l'angle à partir de son cosinus :", 'black')}<br>`

      calculCos += `On déduit des deux calculs précédents que : <br>
      $\\begin{aligned} \\sqrt{${normBASq}}\\times\\sqrt{${normBCSq}}\\times\\cos(\\widehat{ABC})&= ${produitScalaire}\\\\
      \\iff \\cos(\\widehat{ABC})&= \\dfrac{${produitScalaire}}{\\sqrt{${normBASq}}\\times\\sqrt{${normBCSq}}} \\\\
    \\end{aligned}$.`

      
       
        calculCos +=`<br>À la calculatrice, on obtient : $ \\widehat{ABC} \\approx ${miseEnEvidence(`${texNombre(angleArrondi, 0)} ^\\circ`)}$ (arrondi au degré près).`

      texteCorr =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "L'idée consiste à calculer le produit scalaire de $\\overrightarrow{BA}\\cdot\\overrightarrow{BC}$ de deux manières différentes :<br> 1. Avec les coordonnées des vecteurs, on peut déterminer la valeur exacte du produit scalaire.<br>2. Avec le produit des normes qui fait intervenir le $\\cos{\\widehat{ABC}}$. <br>Ces deux calculs étant égaux, on en déduit une égalité qui nous donne la valeur exacte de $\\cos{\\widehat{ABC}}$.<br> À la calculatrice, on trouve alors la valeur approchée de l'angle. ",
        }) +
        createList({
          items: [vecteurs, normes, calculCos],
          style: 'fleches',
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
