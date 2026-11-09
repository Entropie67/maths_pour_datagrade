import Decimal from 'decimal.js'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lier le rapport d'une homothétie à un agrandissement ou réduction"

export const dateDePublication = '27/11/2022'

/**
 * Distribultivité numérique
 * @author Sébastien LOZANO
 */

export const uuid = '1ebf7'

export const refs = {
  'fr-fr': ['3G11-1'],
  'fr-ch': ['11LCES3A-2', '11LSES3A-2'],
}
export default class HomothetieRapport extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1 // Ici le nombre de questions
    this.consigne =
      'Compléter le tableau ci-dessous en cochant les bonnes cases.'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1] // tableau à compléter par valeurs possibles des types de questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    if (this.nbQuestions > 1) {
      this.consigne =
        'Compléter les tableaux ci-dessous en cochant les bonnes cases.'
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;

    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.

      // Les rapports sont choisis parmi :
      // => un décimal inférieur à 1
      // => un entier négatif de module supérieur à 1
      // => un décimal positif supérieur à 1
      // => un décimal négatif de module inférieur à 1
      // => une fraction positive inférieure à 1
      // => une fraction négative de module supérieur à 1

      // On crée les nombres
      const decimalPositifInferieurUn = new Decimal(randint(1, 9)).div(10)
      const entierNegatifModuleSuperieurUn = 0 - randint(2, 9)
      const decimalPositifSuperieurUn = new Decimal(randint(11, 49)).div(10)
      const decimalNegatifModuleInferieurUn = 0 - randint(1, 9) / 10
      let numerateur = randint(2, 9)
      let denominateur = randint(2, 9, [numerateur])
      // Si le denominateur est inférieur au numérateur on inverse les deux
      if (denominateur < numerateur) {
        const temp = numerateur
        numerateur = denominateur
        denominateur = temp
      }
      const fraction = new FractionEtendue(numerateur, denominateur)
      const numerateurFractionInverseOpposee = -1 * denominateur
      const denominateurFractionInverseOpposee = numerateur
      const fractionInverseEtOpposee = new FractionEtendue(
        numerateurFractionInverseOpposee,
        denominateurFractionInverseOpposee,
      )

      // On crée les objets
      const cas1 = {
        rapport: texNombre(decimalPositifInferieurUn, 1),
        correctionReduction: miseEnEvidence('\\times'),
        correctionAgrandissement: '',
      }
      const cas2 = {
        rapport: texNombre(entierNegatifModuleSuperieurUn, 0),
        correctionReduction: '',
        correctionAgrandissement: miseEnEvidence('\\times'),
      }
      const cas3 = {
        rapport: texNombre(decimalPositifSuperieurUn, 1),
        correctionReduction: '',
        correctionAgrandissement: miseEnEvidence('\\times'),
      }
      const cas4 = {
        rapport: texNombre(decimalNegatifModuleInferieurUn, 1),
        correctionReduction: miseEnEvidence('\\times'),
        correctionAgrandissement: '',
      }
      const cas5 = {
        rapport: fraction.texFraction,
        correctionReduction: miseEnEvidence('\\times'),
        correctionAgrandissement: '',
      }
      const cas6 = {
        rapport: fractionInverseEtOpposee.texFraction,
        correctionReduction: '',
        correctionAgrandissement: miseEnEvidence('\\times'),
      }

      // On va remplir un tableau avec des objets contenant nombre et réponse
      const choixRapports = [cas1, cas2, cas3, cas4, cas5, cas6]
      const choixRapportsMelanges = shuffle(choixRapports)

      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent, ici 1 cas sont prévus...
      ) {
        case 1:
          texte += `$
          \\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|c|c|c|}
          \\hline
          \\text{Homothétie de rapport} & ${choixRapportsMelanges[0].rapport} & ${choixRapportsMelanges[1].rapport} & ${choixRapportsMelanges[2].rapport} & ${choixRapportsMelanges[3].rapport} & ${choixRapportsMelanges[4].rapport} & ${choixRapportsMelanges[5].rapport} \\\\
          \\hline
          \\text{Réduction} & & & & & & \\\\
          \\hline
          \\text{Agrandissement} & & & & & & \\\\
          \\hline
          \\end{array}
          $
          `
          texteCorr += `$
          \\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|c|c|c|}
          \\hline
          \\text{Homothétie de rapport} & ${choixRapportsMelanges[0].rapport} & ${choixRapportsMelanges[1].rapport} & ${choixRapportsMelanges[2].rapport} & ${choixRapportsMelanges[3].rapport} & ${choixRapportsMelanges[4].rapport} & ${choixRapportsMelanges[5].rapport} \\\\
          \\hline
          \\text{Réduction} & ${choixRapportsMelanges[0].correctionReduction} & ${choixRapportsMelanges[1].correctionReduction} & ${choixRapportsMelanges[2].correctionReduction} & ${choixRapportsMelanges[3].correctionReduction} & ${choixRapportsMelanges[4].correctionReduction} & ${choixRapportsMelanges[5].correctionReduction} \\\\
          \\hline
          \\text{Agrandissement} & ${choixRapportsMelanges[0].correctionAgrandissement} & ${choixRapportsMelanges[1].correctionAgrandissement} & ${choixRapportsMelanges[2].correctionAgrandissement} & ${choixRapportsMelanges[3].correctionAgrandissement} & ${choixRapportsMelanges[4].correctionAgrandissement} & ${choixRapportsMelanges[5].correctionAgrandissement} \\\\
          \\hline
          \\end{array}
          $
          `
          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
