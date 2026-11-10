import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import Exercice from '../Exercice'

import { listeQuestionsToContenu, randint } from '../../modules/outils'
export const titre =
  'Déterminer si des droites sont parallèles, sécantes ou confondues'

/**
 *
 * @author Stéphane Guyon
 */
export const uuid = 'e715d'

export const refs = {
  'fr-fr': ['2G33-2', 'BP1AUTO062'],
  'fr-ch': [],
}
export default class PositionsDeDroites extends Exercice {
  constructor() {
    super()

    this.consigne =
      "Déterminer si les droites $(d)$ et $(d')$, dont on donne, ci-dessous, des équations cartésiennes, sont parallèles, confondues ou sécantes."
    this.nbQuestions = 3
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    // this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX

    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1', 'type1', 'type2'] //, 'type1', 'type2' On créé 2 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const a1 = randint(-9, 9, 0)
      let texte = 'On donne : $(d) : '
      if (a1 !== 0) {
        texte += `${reduireAxPlusB(a1, 0)}`
      }
      let texteCorr = ''
      let b1: number
      let c1: number
      let a2: number
      let b2: number
      let c2: number
      let k: number = 0
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1':
          b1 = randint(-9, 9, 0)
          c1 = randint(-9, 9)
          a2 = randint(-9, 9, 0)
          b2 = randint(-9, 9, 0)
          c2 = randint(-9, 9)
          break
        case 'type2':
        default:
          b1 = randint(-9, 5, 0)
          c1 = randint(-5, 5)
          k = randint(-9, 9, [0, 1])
          a2 = a1 * k
          b2 = b1 * k
          c2 = randint(-7, 7)
          break
      }
      if (b1 === 1) {
        // cas où b=1
        texte += '+ y '
      }
      if (b1 === -1) {
        // cas où b=1
        texte += '- y '
      }
      if (b1 !== 1 && b1 !== 0 && b1 !== -1) {
        // cas général
        texte += `${ecritureAlgebrique(b1)} y `
      }
      if (c1 !== 0) {
        texte += `${ecritureAlgebrique(c1)} `
      }
      texte += '=0$  '
      texte += " et  $(d') : "
      if (a2 !== 0) {
        texte += `${reduireAxPlusB(a2, 0)}`
      }
      if (b2 === 1) {
        // cas où b=1
        texte += '+ y '
      }
      if (b2 === -1) {
        // cas où b=1
        texte += '- y '
      }
      if (b2 !== 1 && b2 !== 0 && b2 !== -1) {
        // cas général
        texte += `${ecritureAlgebrique(b2)} y `
      }
      if (c2 !== 0) {
        texte += `${ecritureAlgebrique(c2)} `
      }
      texte += '=0$'

      texteCorr = "On sait qu'une droite $(d)$ ayant pour équation cartésienne "
      texteCorr += ' $ax+by+c=0$, avec $(a;b)\\neq (0;0)$,'
      texteCorr += ' admet un vecteur directeur $\\vec {u}$ de coordonnées  '
      texteCorr += '$\\begin{pmatrix}-b\\\\a\\end{pmatrix}$.'
      texteCorr += `<br>Comme on a d'après l'énoncé  : $a=${a1}$, $b=${b1}$, $c=${c1}$,`
      texteCorr += ' on en déduit que $\\vec {u} \\begin{pmatrix} '
      if (b1 === 0) {
        texteCorr += '0'
      } else {
        texteCorr += `-${ecritureParentheseSiNegatif(b1)}`
      }
      texteCorr += `\\\\${a1}\\end{pmatrix}$   est un vecteur directeur de $(d)$.`
      texteCorr += `<br>De même, appelons $\\vec {u'}$ le vecteur directeur de $(d')$. <br>Comme ici, on a : $a=${a2}$, $b=${b2}$, $c=${c2}$,`
      texteCorr += " on en déduit que $\\vec {u'} \\begin{pmatrix} "
      if (b2 === 0) {
        texteCorr += '0'
      } else {
        texteCorr += `-${ecritureParentheseSiNegatif(b2)}`
      }
      texteCorr += `\\\\${a2}\\end{pmatrix}$ est un vecteur directeur de $(d')$.`
      texteCorr +=
        "<br> Pour déterminer la position relative de $(d)$ et $(d')$, on étudie la colinéarité des deux vecteurs directeurs. "
      texteCorr += '<br> Pour cela, on calcule leur déterminant : <br>'
      texteCorr += `$Det\\big(\\vec u;\\vec {u'}\\big)=\\begin{vmatrix}${-b1}&${-b2}\\\\${a1}&${a2}\\end{vmatrix}=${ecritureParentheseSiNegatif(-b1)} \\times ${ecritureParentheseSiNegatif(a2)} - ${ecritureParentheseSiNegatif(a1)} \\times ${ecritureParentheseSiNegatif(-b2)}=${-b1 * a2 + a1 * b2}$`
      if (-b1 * a2 + a1 * b2 !== 0) {
        texteCorr +=
          '<br>On observe que le déterminant est non nul. <br>Les vecteurs directeurs des deux droites ne sont donc pas colinéaires.'
        texteCorr +=
          `<br>Les droites $(d)$ et $(d')$ ${texteEnCouleurEtGras('ne sont donc pas parallèles')}.`
      } else {
        texteCorr +=
          '<br>On observe que le déterminant est nul. <br>Les vecteurs directeurs des deux droites sont donc colinéaires.'
        texteCorr += `<br>Les droites $(d)$ et $(d')$ ${texteEnCouleurEtGras('sont alors parallèles')}.`
      }
      if (a1 * b2 === a2 * b1 && a1 * c1 === a2 * c2 && b1 * c2 === b2 * c1) {
        texteCorr +=
          `On observe même que dans cette situation, les équations étant multiples l'une de l'autre, les deux droites ${texteEnCouleurEtGras('sont confondues')}.`
      }

      if (this.questionJamaisPosee(i, a1, b1, c1, b2, c2, a2, k)) {
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
