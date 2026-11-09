import { texteGras } from '../../lib/format/style'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Démontrer l'équivalence de deux programmes de calcul"

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Aléatoirisation de l'exercice de la vidéo d'Yvan Monka https://www.youtube.com/watch?v=-iw4OkMhgCA
 * Affichage de deux programmes de calcul de 2 ou 3 opérations équivalents
 * Première question : Demande d'évaluer les deux programmes de calcul pour une valeur entre -9 et 9 et demande d'émettre une conjecture
 * Deuxième question : Demande de démontrer cette conjecture
 * @author Guillaume Valmont

*/
export const uuid = '501f9'

export const refs = {
  'fr-fr': ['4L12'],
  'fr-ch': ['10LCFA4E-6', '10LSFA4E-6', '11CTFA3D-2', '11LCFA3D-2', '11LSFA3D-2', '11LSFA3J-1'],
}
export default class EquivalenceProgrammesCalcul extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1

    this.nbCols = 2
    this.nbColsCorr = 2
    this.video = 'https://www.youtube.com/watch?v=-iw4OkMhgCA'
  }

  nouvelleVersion() {
    for (
      let i = 0,
        texte,
        texteCorr,
        texteOperationA1,
        texteOperationA2,
        texteOperationB1,
        texteOperationB3,
        signeA2,
        signeB1,
        signeB3,
        signeB1B2,
        signeB1B2B3,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const B1 = randint(-9, 9, [0])
      const B2 = randint(2, 6)
      const B3 = randint(-9, 9, [0, -1 * B2 * B1]) // pour éviter -1 * B2 * B1, car sinon A2 = 0
      const A1 = B2
      const A2 = B1 * B2 + B3
      const nombreATester = randint(-9, 9)
      const nombreChoisi = randint(-9, 9, [nombreATester])
      if (A1 === 2) {
        texteOperationA1 = 'doubler'
      } else if (A1 === 3) {
        texteOperationA1 = 'tripler'
      } else {
        texteOperationA1 = `multiplier par $${A1}$`
      }
      if (A2 < 0) {
        texteOperationA2 = `enlever $${-A2}$`
        signeA2 = ''
      } else {
        texteOperationA2 = `ajouter $${A2}$`
        signeA2 = '+'
      }
      if (B1 < 0) {
        texteOperationB1 = `soustraire $${-B1}$`
        signeB1 = ''
      } else {
        texteOperationB1 = `ajouter $${B1}$`
        signeB1 = '+'
      }
      if (B3 < 0) {
        texteOperationB3 = `soustraire $${-B3}$`
        signeB3 = ''
      } else {
        texteOperationB3 = `ajouter $${B3}$`
        signeB3 = '+'
      }
      if (B1 * B2 < 0) {
        signeB1B2 = ''
      } else {
        signeB1B2 = '+'
      }
      if (B1 * B2 + B3 < 0) {
        signeB1B2B3 = ''
      } else {
        signeB1B2B3 = '+'
      }
      texte = `On considère les programmes de calcul suivants :<br><br>
      ${texteGras('Programme A :')}<br>
      - choisir un nombre,<br>
      - le ${texteOperationA1},<br>
      - puis ${texteOperationA2}.<br><br>
      ${texteGras('Programme B :')}<br>
      - choisir un nombre,<br>
      - lui ${texteOperationB1},<br>
      - multiplier le résultat par $${B2}$,<br>
      - ${texteOperationB3}.<br><br>
      ${texteEnCouleurEtGras('$\\mathbf{1}$)')} Tester ces programmes avec le nombre $${nombreATester}$ et en choisissant un autre nombre quelconque. Émettre une conjecture.<br>
      ${texteEnCouleurEtGras('$\\mathbf{2}$)')} Prouver cette conjecture.`
      texteCorr = `${texteEnCouleurEtGras('$\\mathbf{1}$)')} ${this.testeProgrammesDeCalcul(nombreATester, A1, A2, B1, B2, B3, signeA2, signeB1, signeB3)}
      Testons ces deux programmes de calcul avec le nombre $${nombreChoisi}$ par exemple :<br>
      ${this.testeProgrammesDeCalcul(nombreChoisi, A1, A2, B1, B2, B3, signeA2, signeB1, signeB3)}
      À chaque fois, le programme A a donné le même résultat que le programme B.<br>
      On conjecture que le programme A donnera le même résultat que le programme B pour tous les nombres.<br><br>
      ${texteEnCouleurEtGras('$\\mathbf{2}$)')} Appliquons ces deux programmes de calcul à un nombre (n'importe lequel) qu'on va noter $${miseEnEvidence('\\textit{x}')}$ :<br>
      ${texteGras('Programme A :')}<br>
      $${miseEnEvidence('\\textit{x}')} \\times ${A1} = ${A1} ${miseEnEvidence('\\textit{x}')}$<br>
      $${A1} ${miseEnEvidence('\\textit{x}')} ${signeA2} ${A2} = ${miseEnEvidence(A1 + ' \\textit{x} ' + signeA2 + ' ' + A2)}$<br><br>
      ${texteGras('Programme B :')}<br>
      $${miseEnEvidence('\\textit{x}')} ${signeB1} ${B1} = ${miseEnEvidence('\\textit{x}')} ${signeB1} ${B1}$<br>
      $(${miseEnEvidence('\\textit{x}')} ${signeB1} ${B1}) \\times ${B2} = ${miseEnEvidence('\\textit{x}')} \\times ${B2} ${signeB1} ${B1} \\times ${B2} = ${B2} ${miseEnEvidence('\\textit{x}')} ${signeB1B2} ${B1 * B2}$<br>
      $${B2} ${miseEnEvidence('\\textit{x}')} ${signeB1B2} ${B1 * B2} ${signeB3} ${B3} = ${miseEnEvidence(B2 + ' \\textit{x} ' + signeB1B2B3 + ' ' + (B1 * B2 + B3))}$<br><br>
      
      On a obtenu le même résultat avec les deux programmes de calcul.<br>
      Comme on peut remplacer $${miseEnEvidence('\\textit{x}')}$ par n'importe quel nombre, on a donc montré qu'on obtient le même résultat avec les deux programmes de calcul pour n'importe quel nombre.`

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, A1, A2, B1, B3)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Supprime b, c et d dans la ligne ci-dessus et remplace les par NombreAAjouter !
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  testeProgrammesDeCalcul(
    nombreATester: number,
    A1: number,
    A2: number,
    B1: number,
    B2: number,
    B3: number,
    signeA2: string,
    signeB1: string,
    signeB3: string,
  ) {
    return `${texteGras('Programme A :')}<br>
  $${nombreATester} \\times ${A1} = ${nombreATester * A1}$ <br>
  $${nombreATester * A1} ${signeA2} ${A2} = ${miseEnEvidence(nombreATester * A1 + A2)}$ <br><br>
  ${texteGras('Programme B :')}<br>
  $${nombreATester} ${signeB1} ${B1} = ${nombreATester + B1}$ <br>
  $${nombreATester + B1} \\times ${B2} = ${(nombreATester + B1) * B2}$ <br>
  $${(nombreATester + B1) * B2} ${signeB3} ${B3} = ${miseEnEvidence((nombreATester + B1) * B2 + B3)}$ <br><br>`
  }
}
