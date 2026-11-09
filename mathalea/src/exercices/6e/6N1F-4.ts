import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Exprimer une fraction sous la forme d'une valeur approchée d'un pourcentage"
export const interactifReady = true

export const dateDePublication = '06/02/2021'
export const dateDeModifImportante = '10/01/2024'

/**
 * Déterminer une valeur approchée d'un pourcentage à l'aide de la calculatrice
 * @author Rémi Angot
 * Ajout de l'interactivité par Guillaume Valmont le 17/03/2022
 * Amélioration de l'interactivité par Éric Elter le 10/01/2024
 */
export const uuid = '6b534'

export const refs = {
  'fr-fr': ['6N1F-4'],
  'fr-ch': ['9R1NO4G-7', '9R2NO4G-7', '9R3NO4G-7', '10CTFA1D-2', '10LCFA1D-2', '10LSFA1D-2', 'PRQNO11B-4', 'PRQPF05B-3'],
}
export default class ValeurApprocheeDePourcentages extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de précision',
      2,
      "1 : Donner un pourcentage à l'unité près\n2 : Donner un pourcentage au dixième près",
    ]

    this.nbQuestions = 6
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const denominateurDisponibles = [100, 200, 300, 1000]
    const listeTypeDeQuestions = combinaisonListes(
      denominateurDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    this.consigne = this.interactif
      ? this.sup === 1
        ? "À l'aide de la calculatrice, donner une valeur sous la forme d'un pourcentage à l'unité près."
        : "À l'aide de la calculatrice, donner une valeur sous la forme d'un pourcentage au dixième près."
      : this.sup === 1
        ? "À l'aide de la calculatrice, donner une valeur approchée au centième près du quotient puis l'écrire sous la forme d'un pourcentage à l'unité près."
        : "À l'aide de la calculatrice, donner une valeur approchée au millième près du quotient puis l'écrire sous la forme d'un pourcentage au dixième près."

    for (
      let i = 0, texte, texteCorr, num, den, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      den = randint(10, listeTypeDeQuestions[i])
      num = randint(1, den - 8)
      while (Math.round((num * 10000) / den) === (10000 * num) / den) {
        den = randint(10, listeTypeDeQuestions[i])
        num = randint(1, den - 8)
      }
      texte = `$\\dfrac{${num}}{${den}}\\approx$`
      texte += remplisLesBlancs(
        this,
        i,
        '%{champ1}\\text{ soit environ }%{champ2}\\%',
        '',
        '\\ldots\\ldots\\ldots',
      )

      const reponseTab1: string[] = []
      for (let ee = 0; ee < 12; ee++) {
        // Il faut accepter valeurs approchées par défaut et par excès
        reponseTab1.push(
          (
            Math.floor((num / den) * Math.pow(10, ee)) / Math.pow(10, ee)
          ).toFixed(ee),
        )
        reponseTab1.push(
          (
            Math.ceil((num / den) * Math.pow(10, ee)) / Math.pow(10, ee)
          ).toFixed(ee),
        )
      }

      if (this.sup === 1) {
        texteCorr = `$\\dfrac{${num}}{${den}}\\approx ${texNombre(num / den, 2)} $ soit environ $${miseEnEvidence(texNombre((num / den) * 100, 0))}~\\%$ $\\left(\\text{car } ${texNombre(num / den, 2)}=\\dfrac{${arrondi((num / den) * 100, 0)}}{100}\\right)$.`
        const reponseTab2: string[] = []
        reponseTab2.push(Math.floor((num / den) * Math.pow(10, 2)).toFixed(0)) // Il faut accepter valeurs approchées par défaut
        reponseTab2.push(Math.ceil((num / den) * Math.pow(10, 2)).toFixed(0)) // Il faut accepter valeurs approchées par excès
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
            champ1: {
              value: reponseTab1,
              options: { nombreDecimalSeulement: true },
            },
            champ2: {
              value: reponseTab2,
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      } else {
        texteCorr = `$\\dfrac{${num}}{${den}}\\approx ${texNombre(num / den, 3)} $ soit environ $${miseEnEvidence(texNombre((num / den) * 100, 1))}~\\%$ $\\left(\\text{car } ${texNombre(num / den, 3)}=\\dfrac{${texNombre(arrondi((num / den) * 100, 1))}}{100}\\right)$.`
        const reponseTab2: string[] = []
        reponseTab2.push(
          (Math.floor((num / den) * Math.pow(10, 3)) / 10).toFixed(1),
        )
        reponseTab2.push(
          (Math.ceil((num / den) * Math.pow(10, 3)) / 10).toFixed(1),
        )
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
            champ1: {
              value: reponseTab1,
              options: { nombreDecimalSeulement: true },
            },
            champ2: {
              value: reponseTab2,
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }

      if (this.questionJamaisPosee(i, num, den)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
