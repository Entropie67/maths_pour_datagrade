import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer si des points sont ou non coplanaires'

export const dateDePublication = '11/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '14e60'
export const refs = {
  'fr-fr': ['TSG2-16'],
  'fr-ch': ['3G99-1'],
}

/**
 *
 * @author Stéphane Guyon

*/
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['coplanaires', 'non-coplanaires']

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let finCorrection = ''
      const xA = randint(-6, 6, 0)
      const yA = randint(-6, 6, [0, xA])
      const zA = randint(-6, 6, 0)
      const xB = randint(-6, 6, [0, xA])
      const yB = randint(-6, 6, [0, yA, xB])
      const zB = randint(-6, 6, [0, zA])
      const xC = randint(-6, 6, [0, xA])
      const yC = randint(-6, 6, [0, yB, yA])
      const zC = randint(-6, 6, [0, yB, zA])
      const lambda1 = randint(-2, 2, 0) // coefficient de vect AB dans la combinaison linéaire
      const lambda2 = randint(-2, 2, [0, lambda1]) // coefficient de vect AC dans la combinaison linéaire
      const lambda3 = randint(-2, 2, [0, lambda1, lambda2]) // coefficient qui perturbe la coplanarité dans cas n°2
      const xD = lambda1 * xB + lambda2 * xC + (1 - lambda1 - lambda2) * xA // Abscisse de D avec vect AD = lambda1 vec AB + lambda 2 vect AC
      const yD = lambda1 * yB + lambda2 * yC + (1 - lambda1 - lambda2) * yA // Ordonnée de D avec vect AD = lambda1 vec AB + lambda 2 vect AC
      let zD: number
      switch (listeTypeQuestions[i]) {
        case 'coplanaires':
          zD = lambda1 * zB + lambda2 * zC + (1 - lambda1 - lambda2) * zA // Cote de D avec vect AD = lambda1 vec AB + lambda 2 vect AC
          finCorrection += `<br><br>$\\iff \\begin{cases}
           \\lambda_1&= ${lambda1}\\\\  
            \\lambda_2&= ${lambda2}\\\\  
            \\end{cases}$<br>`
          finCorrection += `Le système admet donc un couple solution : $S=\\{\\left(${lambda1};${lambda2}\\right)\\}$.<br>`
          finCorrection += `On vient donc de montrer que $\\overrightarrow{AD}=${rienSi1(lambda1)} \\overrightarrow{AB} ${ecritureAlgebriqueSauf1(lambda2)} \\overrightarrow{AC}$.`
          finCorrection += `<br>Les points $A$, $B$, $C$ et $D$ ${texteEnCouleurEtGras('sont coplanaires')}.`
          break
        default: {
          // case 'non-coplanaires':
          zD = lambda1 * zB + lambda3 * zC + (1 - lambda1 - lambda3) * zA // Cote de D avec vect AD = lambda1 vec AB + lambda 2 vect AC
          const lambda2Fraction = new FractionEtendue(
            (yD - yA) * (xC - xA) - (yB - yA) * (xC - xA) * lambda1,
            (yC - yA) * (xC - xA),
          )
          finCorrection += `$\\iff \\begin{cases}
           \\lambda_1&= ${lambda1}\\\\  
            \\lambda_2&= ${lambda2Fraction.texFractionSimplifiee}\\\\  
            \\lambda_2&= ${lambda3}\\\\  
            \\end{cases}$<br>`
          finCorrection +=
            "Il n'existe pas un unique couple $(\\lambda_1;\\lambda_2)$ vérifiant $(1)$.<br>"
          finCorrection +=
            "Le système n'admet donc pas de solution, $~~S=\\emptyset$.<br>"
          finCorrection +=
            "Il reste à vérifier que les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ forment une base d'un plan, c'est-à-dire qu'ils ne sont pas colinéaires.<br>"
          finCorrection +=
            "En effet, s'ils l'étaient, $\\overrightarrow{AD}$ serait nécessairement coplanaires avec $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.<br>"
          finCorrection +=
            "On sait que $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires si et seulement s'il existe un réel $\\lambda$ vérifiant $\\overrightarrow{AB}=\\lambda\\overrightarrow{AC}$.<br>"
          finCorrection += `Ce qui est équivalent à résoudre : $\\begin{cases}
           ${xB - xA}&= ${rienSi1(xD - xA)}\\lambda\\\\  
           ${yB - yA}&= ${rienSi1(yD - yA)}\\lambda\\\\  
           ${zB - zA}&= ${rienSi1(zD - zA)}\\lambda\\\\  
            \\end{cases}$<br>`
          finCorrection +=
            "On observe trivialement que ce système n'admet pas de solution. Les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ ne sont donc pas colinéaires."
          finCorrection +=
            "<br>On vient donc de montrer que les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ forment une base d'un plan et que le vecteur $\\overrightarrow{AD}$ n'est pas une combinaison linéaire de ces vecteurs."
          finCorrection += `<br>Les trois vecteurs ne sont donc pas coplanaires.<br> Les points $A$, $B$, $C$ et $D$ ${texteEnCouleurEtGras('ne sont pas coplanaires')}.`
          break
        }
      }
      texte =
        "On donne, dans un repère orthonormé de l'espace $\\big(O~;\\vec{\\imath}~;\\vec{\\jmath}~;\\vec{k}\\big)$,<br>"
      texte += 'les coordonnées des points suivants :<br>'
      texte += `$A(${xA}~;~${yA}~;~${zA}), ~~ B(${xB}~;~${yB}~;~${zB}), ~~ C(${xC}~;~${yC}~;~${zC}), ~~ D(${xD}~;~${yD}~;~${zD}).$<br> `
      texte +=
        'Déterminer si les points $A\\,,B\\,,C\\,\\text{et} \\, D$ sont ou non coplanaires.<br> '
      texteCorr =
        "Les quatre points sont coplanaires s'il existe deux réels $\\lambda_1$ et $\\lambda_2$ tels que <br>"
      texteCorr +=
        "$\\overrightarrow{AD}=\\lambda_1 \\overrightarrow{AB}+\\lambda_2 \\overrightarrow{AC}\\quad(1)$,<br> c'est-à-dire si "
      texteCorr +=
        '$\\overrightarrow{AD}$ est une combinaison linéaire des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.<br>'
      texteCorr += 'On calcule les coordonnées des trois vecteurs : <br>'
      texteCorr += `$\\overrightarrow{AD}\\begin{pmatrix}${xD} -${ecritureParentheseSiNegatif(xA)}\\\\ ${yD} -${ecritureParentheseSiNegatif(yA)}\\\\${zD}- ${ecritureParentheseSiNegatif(zA)}\\end{pmatrix}\\iff\\overrightarrow{AD}\\begin{pmatrix}${xD - xA} \\\\ ${yD - yA} \\\\${zD - zA}\\end{pmatrix}$<br><br>`
      texteCorr += `$\\overrightarrow{AB}\\begin{pmatrix}${xB} -${ecritureParentheseSiNegatif(xA)}\\\\ ${yB} -${ecritureParentheseSiNegatif(yA)}\\\\${zB}- ${ecritureParentheseSiNegatif(zA)}\\end{pmatrix}\\iff\\overrightarrow{AB}\\begin{pmatrix}${xB - xA} \\\\ ${yB - yA} \\\\${zB - zA}\\end{pmatrix}$<br><br>`
      texteCorr += `$\\overrightarrow{AC}\\begin{pmatrix}${xC} -${ecritureParentheseSiNegatif(xA)}\\\\ ${yC} -${ecritureParentheseSiNegatif(yA)}\\\\${zC}- ${ecritureParentheseSiNegatif(zA)}\\end{pmatrix}\\iff\\overrightarrow{AC}\\begin{pmatrix}${xC - xA} \\\\ ${yC - yA} \\\\${zC - zA}\\end{pmatrix}$<br>`
      texteCorr +=
        'On cherche des réels $\\lambda_1$ et $\\lambda_2$ qui vérifient $(1)$,<br> ce qui est équivalent à résoudre le système :'
      texteCorr += `<br><br>$\\begin{cases}${xD - xA}&= ${rienSi1(xB - xA)} \\lambda_1 ${ecritureAlgebriqueSauf1(xC - xA)} \\lambda_2\\quad\\quad \\left(L_1\\right)\\\\  
            ${yD - yA} &=${rienSi1(yB - yA)}\\lambda_1 ${ecritureAlgebriqueSauf1(yC - yA)}\\lambda_2\\quad\\quad \\left(L_2\\right)\\\\
            ${zD - zA}&=${rienSi1(zB - zA)}\\lambda_1 ${ecritureAlgebriqueSauf1(zC - zA)}\\lambda_2
            \\end{cases}\\iff$`
      texteCorr += `$\\begin{cases}${(xD - xA) * (yC - yA)}&= ${rienSi1((xB - xA) * (yC - yA))}\\lambda_1 ${ecritureAlgebriqueSauf1((xC - xA) * (yC - yA))} \\lambda_2\\quad\\quad \\left(${yC - yA}\\times L_1\\rightarrow L_1\\right)\\\\  
            ${(yD - yA) * (xC - xA)} &=${rienSi1((yB - yA) * (xC - xA))}\\lambda_1 ${ecritureAlgebriqueSauf1((yC - yA) * (xC - xA))}\\lambda_2\\quad\\quad \\left(${xC - xA}\\times L_2\\rightarrow L_2\\right)\\\\
            ${zD - zA}&=${rienSi1(zB - zA)}\\lambda_1 ${ecritureAlgebriqueSauf1(zC - zA)}\\lambda_2
            \\end{cases}$<br><br>`
      texteCorr += `$\\iff \\begin{cases}
            ${(xD - xA) * (yC - yA) - (yD - yA) * (xC - xA)}&= ${(xB - xA) * (yC - yA) - (yB - yA) * (xC - xA)} \\lambda_1\\quad\\quad \\left(L_1-L_2\\rightarrow L_1\\right)\\\\  
            ${(yD - yA) * (xC - xA)} &=${(yB - yA) * (xC - xA)}\\lambda_1 ${ecritureAlgebriqueSauf1((yC - yA) * (xC - xA))}\\lambda_2\\quad\\quad \\left(L_2\\right)\\\\  
            ${zD - zA}&=${rienSi1(zB - zA)}\\lambda_1 ${ecritureAlgebriqueSauf1(zC - zA)}\\lambda_2
              \\end{cases}\\iff 
              \\begin{cases}
           \\lambda_1&= ${lambda1}\\\\  
             ${(yD - yA) * (xC - xA)} &=${(yB - yA) * (xC - xA) * lambda1} ${ecritureAlgebriqueSauf1((yC - yA) * (xC - xA))}\\lambda_2\\\\  
            ${zD - zA}&=${rienSi1((zB - zA) * lambda1)} ${ecritureAlgebriqueSauf1(zC - zA)}\\lambda_2
              \\end{cases}$<br><br>`
      texteCorr += `$\\iff\\begin{cases}
       \\lambda_1&= ${lambda1}\\\\  
       ${rienSi1((yC - yA) * (xC - xA))}\\lambda_2&=${(yD - yA) * (xC - xA) - (yB - yA) * (xC - xA) * lambda1} \\\\  
        ${rienSi1(zC - zA)}\\lambda_2&= ${zD - zA + (zA - zB) * lambda1}
              \\end{cases}$`
      texteCorr += finCorrection
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
