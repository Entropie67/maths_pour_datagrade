import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import Exercice from '../Exercice'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
export const titre =
  'Déterminer si un vecteur est orthogonal à un plan engendré par $3$ points'

export const dateDePublication = '26/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'd5253'
export const refs = {
  'fr-fr': ['TSG2-43'],
  'fr-ch': ['3G99-6'],
}

/**
 *
 * @author Stéphane Guyon

*/
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = ''
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1', 'type2'] // On créé 3 types de questions

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      let a1 = randint(-5, 5, 0) // coord du vecteur AB
      let b1 = randint(-5, 5, 0) // coord du vecteur AB
      let c1 = 0 // coord du vecteur AB
      let a2 = randint(-5, 5, [0, a1]) // coord du vecteur AC
      let b2 = randint(-5, 5, [0, b1]) // coord du vecteur AC
      let c2 = 0 // coord du vecteur AC
      const a = randint(-5, 5, 0) // coord du vecteur normal
      const b = randint(-5, 5, 0) // coord du vecteur normal
      const c = randint(-5, 5, 0) // coord du vecteur normal
      const xA = randint(-5, 5, 0) // coord de A
      const yA = randint(-5, 5, 0) // coord de A
      const zA = randint(-5, 5, 0) // coord de A
      let xB = 0
      let yB = 0
      let zB = 0
      let xC = 0
      let yC = 0
      let zC = 0

      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1': // Normal
          c1 = -(a * a1 + b * b1) // On calcule c1 pour annuler le pdt scla
          a1 = a1 * c // on adapte les coord du vect AB pour avoir des coord entières
          b1 = b1 * c // on adapte les coord du vect AB pour avoir des coord entières
          c2 = -(a * a2 + b * b2) // idem pour c2
          a2 = a2 * c // et vecteur AC
          b2 = b2 * c
          xB = xA + a1 // on déduit les coord de B
          yB = yA + b1
          zB = zA + c1
          xC = xA + a2 // et celles de C
          yC = yA + b2
          zC = zA + c2
          texte = `Dans un repère orthonormé de l'espace, déterminer si le vecteur $\\vec{n}\\begin{pmatrix}${a}\\\\${b}\\\\${c}\\end{pmatrix}$ est normal au plan $\\mathcal{ABC}$ engendré par les points :<br>`
          texte += `$A(${xA}~;${yA}~;${zA})\\quad B(${xB}~;${yB}~;${zB})\\quad\\text{et}~~C(${xC}~;${yC}~;${zC})$`
          texteCorr =
            'On calcule les coordonnées des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ :<br> '
          texteCorr += `$\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\\\${zB}-${ecritureParentheseSiNegatif(zA)}\\\\\\end{pmatrix}$ `
          texteCorr += `$\\iff\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\\\${zB - zA}\\\\\\end{pmatrix}$<br> `
          texteCorr += `$\\overrightarrow{AC}\\begin{pmatrix}${xC}-${ecritureParentheseSiNegatif(xA)}\\\\${yC}-${ecritureParentheseSiNegatif(yA)}\\\\${zC}-${ecritureParentheseSiNegatif(zA)}\\\\\\end{pmatrix}$ `
          texteCorr += `$\\iff\\overrightarrow{AC}\\begin{pmatrix}${xC - xA}\\\\${yC - yA}\\\\${zC - zA}\\\\\\end{pmatrix}$<br> `
          texteCorr += `On vérifie trivialement qu'ils ne sont pas colinéaires : $\\dfrac{x_B-x_A}{x_C-x_A}=\\dfrac{${texNombre(xB - xA)}}{${texNombre(xC - xA)}}\\neq\\dfrac{y_B-y_A}{y_C-y_A}=\\dfrac{${texNombre(yB - yA)}}{${texNombre(yC - yA)}}$`
          texteCorr +=
            '<br>$\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ forment donc une base du plan $\\mathcal{ABC}$.'
          texteCorr +=
            '<br>Pour vérifier si $\\vec n$ est normal au plan $\\mathcal{ABC}$, il suffit de vérifier que le vecteur $\\vec n$ est orthogonal aux deux vecteurs de sa base, donc à $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.'
          texteCorr += '<br>On calcule alors les deux produits scalaires :'
          texteCorr += `<br>$\\begin{aligned}\\overrightarrow{AB}\\cdot\\vec{n}&=${a1}\\times ${ecritureParentheseSiMoins(a)}${ecritureAlgebrique(b1)}\\times ${ecritureParentheseSiMoins(b)}${ecritureAlgebrique(c1)}\\times ${ecritureParentheseSiMoins(c)}\\\\&=${a1 * a + b1 * b + c1 * c}\\end{aligned}$`
          texteCorr += `<br>$\\begin{aligned}\\overrightarrow{AC}\\cdot\\vec{n}&=${a2}\\times ${ecritureParentheseSiMoins(a)}${ecritureAlgebrique(b2)}\\times ${ecritureParentheseSiMoins(b)}${ecritureAlgebrique(c2)}\\times ${ecritureParentheseSiMoins(c)}\\\\&=${a2 * a + b2 * b + c2 * c}\\end{aligned}$`
          texteCorr += `<br>On en déduit que $\\vec n$ est orthogonal aux vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$, il ${texteEnCouleurEtGras('est donc normal')} au plan $\\mathcal{ABC}$.`
          break
        case 'type2': // pas Normal
        default:
          c1 = -(a * a1 + b * b1) // On calcule c1 ne pas annuler le pdt scal
          a1 = a1 * c // on adapte les coord du vect AB pour avoir des coord entières
          b1 = b1 * c // on adapte les coord du vect AB pour avoir des coord entières
          c2 = -(a * a2 + b * b2) + 1 // idem pour c2
          a2 = a2 * c // et vecteur AC
          b2 = b2 * c
          xB = xA + a1 // on déduit les coord de B
          yB = yA + b1
          zB = zA + c1
          xC = xA + a2 // et celles de C
          yC = yA + b2
          zC = zA + c2
          texte = `Dans un repère orthonormé de l'espace, déterminer si le vecteur $\\vec{n}\\begin{pmatrix}${a}\\\\${b}\\\\${c}\\end{pmatrix}$ est normal au plan $\\mathcal{ABC}$ engendré par les points :<br>`
          texte += `$A(${xA}~;${yA}~;${zA})\\quad B(${xB}~;${yB}~;${zB})\\quad\\text{et}~~C(${xC}~;${yC}~;${zC})$`
          texteCorr =
            'On calcule les coordonnées des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ :<br> '
          texteCorr += `$\\overrightarrow{AB}\\begin{cases}x_B-x_A&=${xB}-${ecritureParentheseSiNegatif(xA)}\\\\y_B-y_A&=${yB}-${ecritureParentheseSiNegatif(yA)}\\\\z_B-z_A&=${zB}-${ecritureParentheseSiNegatif(zA)}\\\\\\end{cases}$ `
          texteCorr += ` et $\\quad\\overrightarrow{AC}\\begin{cases}x_C-x_A=${xC}-${ecritureParentheseSiNegatif(xA)}\\\\y_C-yA=${yC}-${ecritureParentheseSiNegatif(yA)}\\\\z_C-z_A=${zC}-${ecritureParentheseSiNegatif(zA)}\\\\\\end{cases}$ `
          texteCorr += `<br><br>Ce qui donne après simplification : $\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\\\${zB - zA}\\\\\\end{pmatrix}$ `
          texteCorr += `et $\\quad\\overrightarrow{AC}\\begin{pmatrix}${xC - xA}\\\\${yC - yA}\\\\${zC - zA}\\\\\\end{pmatrix}$<br> `
          texteCorr += `On vérifie trivialement qu'ils ne sont pas colinéaires : $\\dfrac{x_B-x_A}{x_C-x_A}=\\dfrac{${texNombre(xB - xA)}}{${texNombre(xC - xA)}}\\neq\\dfrac{y_B-y_A}{y_C-y_A}=\\dfrac{${texNombre(yB - yA)}}{${texNombre(yC - yA)}}$`
          texteCorr +=
            '<br><br>$\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ forment donc une base du plan $\\mathcal{ABC}$.'
          texteCorr +=
            '<br>Pour vérifier si $\\vec n$ est normal au plan $\\mathcal{ABC}$, il suffit de vérifier que le vecteur $\\vec n$ est orthogonal aux deux vecteurs de sa base, donc à $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.'
          texteCorr += '<br>On calcule alors les deux produits scalaires :'
          texteCorr += `<br>$\\begin{aligned}\\overrightarrow{AB}\\cdot\\vec{n}&=${a1}\\times ${ecritureParentheseSiMoins(a)}${ecritureAlgebrique(b1)}\\times ${ecritureParentheseSiMoins(b)}${ecritureAlgebrique(c1)}\\times ${ecritureParentheseSiMoins(c)}\\\\&=${a1 * a + b1 * b + c1 * c}\\end{aligned}$`
          texteCorr += `<br>$\\begin{aligned}\\overrightarrow{AC}\\cdot\\vec{n}&=${a2}\\times ${ecritureParentheseSiMoins(a)}${ecritureAlgebrique(b2)}\\times ${ecritureParentheseSiMoins(b)}${ecritureAlgebrique(c2)}\\times ${ecritureParentheseSiMoins(c)}\\\\&=${a2 * a + b2 * b + c2 * c}\\end{aligned}$`
          texteCorr += `<br>On en déduit que $\\vec n$ n'est pas orthogonal aux vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$, il ${texteEnCouleurEtGras("n'est donc pas normal")} au plan $\\mathcal{ABC}$.`

          break
      }

      if (this.questionJamaisPosee(i, a, b, c, a2, b2, c2, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
