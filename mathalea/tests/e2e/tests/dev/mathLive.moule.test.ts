import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'

async function test(page: Page) {
  const urlExercice = '' // Mettre ici l'url de l'exercice (éventuellement avec la graine mais push sans la graine)
  if (urlExercice === '') {
    console.error("Il faut renseigner l'url de l'exercice")
    return true
  }
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    const reponse = ''

    // ---------------------------------------------------------------
    // Dupliquer ce fichier
    // Se débrouiller à partir des console.log ci-dessous pour récupérer les informations nécessaires en utilisant
    // éventuellement les fonctions dans helpers/text.ts et construire une réponse selon question.isCorrect
    // (if (question.isCorrect) reponse = bonneReponse; else reponse = mauvaiseReponse)
    console.log(`Question ${question.numero} :`)
    console.log(`Texte énoncé : ${question.innerText}`)
    console.log('Éléments Katex :', question.katex.elements)
    console.log('Éléments MathField :', question.mathField)
    // Si question.katex.elements ne suffit pas, on peut aller chercher des infos supplémentaires avec d'autres
    // propriétés comme question.innerHTML ou pour les aventuriers question.locator.locator('sélecteur CSS')
    //
    // pnpm test:e2e:dev pour lancer les tests
    // Une fois le test fonctionnel, déplacer le fichier vers son dossier de destination
    // ---------------------------------------------------------------

    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

runTest(test, import.meta.url, { pauseOnError: true }) // true pendant le développement, false ensuite
