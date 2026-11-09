import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const interactifReady = true

export const titre = 'Calculer un PGCD de tête'

export const dateDePublication = '17/02/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'b6918'
export const refs = {
  'fr-fr': ['canTEA3-01'],
  'fr-ch': ['NR'],
}

/**
 *
 * @author Stéphane Guyon

*/
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer mentalement'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1', 'type2', 'type3', 'type4']
    let a = 0
    let b = 0
    let pgcd = 0
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'type1': // deux nombres premiers
          a = choice([
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
            67, 71, 73, 79, 83, 89, 97,
          ])
          b = choice(
            [
              2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59,
              61, 67, 71, 73, 79, 83, 89, 97,
            ].filter((b) => b !== a),
          )
          pgcd = 1
          texteCorr = `$${a}$ et $${b}$ sont deux nombres premiers, donc `
          break
        case 'type2': // deux multiples
          a = randint(10, 40)
          b = a * randint(2, 4)
          pgcd = a
          texteCorr = `$${b}=${a}\\times ${b / a}$ donc $${a}$ est un diviseur de  $${b}$. Il vient `
          break
        case 'type3': // deux mêmes multiples premiers de deux nombres premiers distincts
          a = choice([2, 3, 5, 7, 11, 13, 17])
          b = choice([2, 3, 5, 7, 11, 13, 17].filter((b) => b !== a))
          pgcd = choice([2, 3, 5, 7])
          a = a * pgcd
          b = b * pgcd
          texteCorr = `$${a}=${pgcd}\\times${a / pgcd}$ avec $${a / pgcd}$ qui est premier. De même,  $${b}=${pgcd}\\times${b / pgcd}$ avec $${b / pgcd}$ qui est premier. Il vient `
          break
        case 'type4': // deux mêmes multiples de deux nombres premiers distincts
          a = choice([2, 3, 5, 7])
          b = choice([2, 3, 5, 7].filter((b) => b !== a))
          pgcd = randint(2, 5) * randint(2, 5)
          a = a * pgcd
          b = b * pgcd
          texteCorr = `$${a}=${pgcd}\\times${a / pgcd}$ avec $${a / pgcd}$ qui est premier. De même,  $${b}=${pgcd}\\times${b / pgcd}$ avec $${b / pgcd}$ qui est premier. Il vient `
          break
        default:
          a = choice([2, 3, 5, 7, 11, 13, 17])
          b = choice([2, 3, 5, 7, 11, 13, 17].filter((b) => b !== a))
          pgcd = randint(2, 5)
          a = a * pgcd
          b = b * pgcd
          texteCorr = `$${a}=${pgcd}\\times${a / pgcd}$ avec $${a / pgcd}$ qui est premier. De même,  $${b}=${pgcd}\\times${b / pgcd}$ avec $${b / pgcd}$ qui est premier. Il vient `
          break
      }
      texte = `$\\operatorname{PGCD}(${a};${b})=$`
      texte += this.interactif
        ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        : '$\\ldots$'
      texteCorr += `$\\operatorname{PGCD}(${a};${b})=${miseEnEvidence(pgcd)}$.`
      handleAnswers(this, i, { reponse: { value: pgcd } })
      if (this.questionJamaisPosee(i, a, b, pgcd)) {
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
