import { gestionnaireFormulaireTexte } from '../../modules/outils'
import type Exercice from '../../exercices/Exercice'

const NB_QUESTIONS_SUJET = 30

/**
 * Paramètre « Questions à afficher » des anciens sujets CAN (une seule classe, un `switch` sur le numéro de question).
 * À affecter dans le constructeur : `this.besoinFormulaireTexte = besoinFormulaireChoixQuestionsCan` et `this.sup = ''`.
 */
export const besoinFormulaireChoixQuestionsCan: [string, string] = [
  'Questions à afficher',
  'Nombres de 1 à 30 séparés par des tirets (laisser vide pour tirer les questions au hasard) :',
]

/**
 * Retourne les numéros de questions à construire.
 * Sans saisie dans `exercice.sup`, ce sont les numéros tirés par défaut ; sinon ce sont ceux choisis par l'utilisateur,
 * dans l'ordre saisi, et le nombre de questions de l'exercice s'aligne sur leur nombre.
 * @param exercice
 * @param numerosParDefaut numéros tirés lorsque aucun choix n'est fait
 */
export function numerosQuestionsCan(
  exercice: Exercice,
  numerosParDefaut: number[],
): number[] {
  const saisie = String(exercice.sup ?? '').trim()
  exercice.nbQuestionsModifiable = saisie === ''
  if (saisie === '') return numerosParDefaut
  const nbQuestionsSaisies = saisie.split('-').length
  const numeros = gestionnaireFormulaireTexte({
    saisie,
    min: 1,
    max: NB_QUESTIONS_SUJET,
    defaut: 1,
    melange: NB_QUESTIONS_SUJET + 1,
    shuffle: false,
    nbQuestions: nbQuestionsSaisies,
  }) as number[]
  exercice.nbQuestions = numeros.length
  return numeros
}
