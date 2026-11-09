import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Déterminer si trois points sont alignés'
/**
 * Déterminer si trois points sont alignés avec les coefficients directeurs
 * @author Stéphane Guyon

*/
export const uuid = 'b1777'

export const refs = {
  'fr-fr': ['2G33-1'],
  'fr-ch': ['1mF2-7'],
}
export default class Alignementdetroispoints extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Soit $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$ un repère orthogonal. Déterminer si les $3$ points $A$, $B$ et $C$ suivants sont ou non alignés.'
    this.nbQuestions = 3
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['oui', 'non'] // On créé 3 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Boucle principale où i+1 correspond au numéro de la question
      let xA: number
      let xB: number
      let xC: number
      let yA: number
      let yB: number
      let yC: number
      let n1: number
      let d1: number
      let n2: number
      let d2: number
      let texte = ''
      let texteCorr = ''
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'non':
          xA = randint(-5, 5)
          yA = randint(-5, 5)
          xB = randint(-5, 5, xA)
          yB = randint(-5, 5)
          xC = randint(-5, 5, [xA, xB])
          yC = randint(-5, 5)
          n1 = yB - yA
          d1 = xB - xA
          n2 = yC - yA
          d2 = xC - xA
          if (n1 * d2 === n2 * d1) {
            // on évite le cas de l'alignement
            yA = yA + 1
          }
          texte = ` $A(${xA};${yA})$ ; $B(${xB};${yB})$ et $C(${xC};${yC})$.`
          texteCorr =
            'Pour déterminer si les points $A$, $B$, et $C$ sont alignés, on va étudier les positions relatives des droites $(AB)$ et $(AC)$'
          texteCorr +=
            '<br>On observe que les droites ne sont pas verticales car les abscisses respectives des points $A$, $B$ et $C$ sont distinctes.'
          texteCorr +=
            '<br>On peut donc calculer leur coefficient directeur respectif.'
          texteCorr +=
            "<br>On sait d'après le cours, que le coefficient directeur de la droite $(AB)$, si $x_A\\neq x_B$ est : $m=\\dfrac{y_B-y_A}{x_B-x_A}$."
          texteCorr +=
            `<br>On applique avec les données de l'énoncé pour chacune des deux droites${sp()}: `
          texteCorr += `<br><br>$\\bullet (AB)$${sp()}: $m_1=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=${texFractionFromString(n1, d1)}`
          if ((pgcd(n1, d1) !== 1 || d1 === 1 || d1 < 0) && n1 !== 0) {
            texteCorr += `=${texFractionReduite(n1, d1)}`
          }
          texteCorr += '$'
          texteCorr += `<br><br>$\\bullet (AC)$${sp()}: $m_2=\\dfrac{${yC}-${ecritureParentheseSiNegatif(yA)}}{${xC}-${ecritureParentheseSiNegatif(xA)}}=${texFractionFromString(n2, d2)}`
          if ((pgcd(n2, d2) !== 1 || d2 === 1 || d2 < 0) && n2 !== 0) {
            texteCorr += `=${texFractionReduite(n2, d2)}`
          }
          texteCorr += '$'
          texteCorr += '<br><br>On observe que $m_1 \\neq m_2$. '
          texteCorr +=
            '<br>Les droites $(AB)$ et $(AC)$ ne sont donc pas parallèles. '
          texteCorr += `<br>Les points $A$, $B$ et $C$ ${texteEnCouleurEtGras('ne sont pas alignés')}. `

          break
        case 'oui':
        default:
          {
            xA = randint(-4, 4)
            yA = randint(-4, 4)
            xB = randint(-4, 4, xA)
            yB = randint(-4, 4)
            const k = randint(-3, 3, [0, 1])
            xC = xA + (xB - xA) * k
            yC = yA + (yB - yA) * k
            n1 = yB - yA
            d1 = xB - xA
            n2 = yC - yA
            d2 = xC - xA
            texte = ` $A(${xA};${yA})$ ; $B(${xB};${yB})$ et $C(${xC};${yC})$.`
            texteCorr =
              'Pour déterminer si les points $A$, $B$, et $C$ sont alignés, on va étudier les positions relatives des droites $(AB)$ et $(AC)$'
            texteCorr +=
              "<br>On observe déjà que les $3$ abscisses sont distinctes. Ni la droite $(AB)$, ni la droite $(AC)$ n'est verticale."
            texteCorr +=
              '<br>On peut donc calculer leur coefficient directeur respectif.'
            texteCorr +=
              "<br>On sait d'après le cours, que le coefficient directeur de la droite $(AB)$, si $x_A\\neq x_B$ est : $m=\\dfrac{y_B-y_A}{x_B-x_A}$."
            texteCorr +=
              `<br>On applique avec les données de l'énoncé pour chacune des deux droites${sp()}: `
            texteCorr += `<br><br>$\\bullet (AB)$${sp()}: $m_1=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=${texFractionFromString(n1, d1)}`
            if ((pgcd(n1, d1) !== 1 || d1 === 1 || d1 < 0) && n1 !== 0) {
              texteCorr += `=${texFractionReduite(n1, d1)}`
            }
            texteCorr += '$'

            texteCorr += `<br><br>$\\bullet (AC)$${sp()}: $m_2=\\dfrac{${yC}-${ecritureParentheseSiNegatif(yA)}}{${xC}-${ecritureParentheseSiNegatif(xA)}}=${texFractionFromString(n2, d2)}`
            if ((pgcd(n2, d2) !== 1 || d2 === 1 || d2 < 0) && n2 !== 0) {
              texteCorr += `=${texFractionReduite(n2, d2)}`
            }
            texteCorr += '$'

            texteCorr += '<br><br>On observe que $m_1 = m_2$. '
            texteCorr +=
              '<br>Les droites $(AB)$ et $(AC)$ ont le même coefficient directeur, elles sont donc parallèles. '
            texteCorr +=
              '<br>Le point $A$ appartenant aux deux droites parallèles, $(AB)$ et $(AC)$ sont des droites confondues.'
            texteCorr += `<br>On en déduit que les points $A$, $B$ et $C$ ${texteEnCouleurEtGras('sont alignés')}. `
          }
          break
      }

      if (this.questionJamaisPosee(i, xA, yA, xB, yB, xC, yC)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté', 2,'1 : Facile\n2 : Difficile'];
}
