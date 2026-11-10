import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Déterminer la réunion de deux intervalles'
export const interactifReady = true

export const dateDePublication = '26/10/2023'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'bb947'

export const refs = {
  'fr-fr': ['can2N10-04', '2N12-flash3'],
  'fr-ch': [],
}
export default class ReunionIntervalles extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { intervalle: true }
  }

  nouvelleVersion() {
    const cours =
      'La réunion de deux intervalles $I$ et $J$ (notée $I\\cup J$) est l’ensemble qui contient les nombres appartenant à au moins un des deux intervalles $I$ ou $J$.<br>'
    switch (
      this.quotaChoice('type', [1, 2, 3, 4, 5, 6, 7]) //, 2,3,4,5,6,7
    ) {
      case 1: //  [a;b] union [c;d] avec c<b resultat [a;d]
        {
          const a = randint(-30, -20)
          const b = randint(-10, 5)
          const c = a + randint(1, 9)
          const d = randint(7, 15)
          const choix = choice([true, false])
          const crochet1 = choice([']', '['])
          const crochet2 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const crochet4 = choice([']', '['])
          this.reponse = `${crochet1}${a};${d}${crochet4}`
          this.question = `Donner une écriture simplifiée de
        ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$.` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$`} $= ${miseEnEvidence(`${crochet1}${a}\\,;\\,${d}${crochet4}`)}$.<br>
      `
        }
        break

      case 2: //  [a;b] union [c;d] avec [c;d] inclus dans [a;b] donc résultat [a;b]
        {
          const a = randint(-10, -6)
          const b = randint(1, 5)
          const c = a + randint(1, 3)
          const d = b - randint(1, 3)
          const choix = choice([true, false])
          const crochet1 = choice([']', '['])
          const crochet2 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const crochet4 = choice([']', '['])
          this.reponse = `${crochet1}${a};${b}${crochet2}`
          this.question = `Donner une écriture simplifiée de
        ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$.` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$`} $= ${miseEnEvidence(`${crochet1}${a}\\,;\\,${b}${crochet2}`)}$.<br>
        `
        }
        break

      case 3: //  [a;+infini[ union [c;d] avec c<a et d>a  donc résultat [c;+infini[
        {
          const a = randint(-5, 10)

          const c = a - randint(1, 5)
          const d = a + randint(1, 5)
          const crochet1 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const crochet4 = choice([']', '['])
          const choix = choice([true, false])
          this.reponse = `${crochet3}${c};+\\infty[`
          this.question = `Donner une écriture simplifiée de
            ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$.` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$`} $=${miseEnEvidence(`${crochet3}${c}\\,;\\,+\\infty[`)}$.<br>
          `
        }
        break

      case 4: //  [a;+infini[ union [c;d] avec a<c donc resultat [a;+infini[
        {
          const a = randint(-5, 10)
          const c = a + randint(1, 5)
          const d = c + randint(1, 5)
          const crochet1 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const crochet4 = choice([']', '['])
          const choix = choice([true, false])
          this.reponse = `${crochet1}${a};+\\infty[`
          this.question = `Donner une écriture simplifiée de
              ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$.` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$`} $= ${miseEnEvidence(`${crochet1}${a}\\,;\\,+\\infty[`)}$.<br>`
        }
        break

      case 5: //  [a;+infini[ union [c;+infini[ avec a<c donc resultat [a;+infini[]
        {
          const a = randint(-5, 10)
          const c = a + randint(1, 5)
          const crochet1 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const choix = choice([true, false])
          this.reponse = `${crochet1}${a};+\\infty[`
          this.question = `Donner une écriture simplifiée de
                ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,+\\infty[$.` : `$${crochet3}${c}\\,;\\,+\\infty[\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,+\\infty[\\,\\cup \\,${crochet3}${c}\\,;\\,+\\infty[$` : `$${crochet3}${c}\\,;\\,+\\infty[\\,\\cup \\,${crochet1} ${a}\\,;\\,+\\infty[$`} $= ${miseEnEvidence(`${crochet1}${a}\\,;\\,+\\infty[`)}$.<br>
               `
        }
        break

      case 6: //  ]-infini;b] union [c;+infini[ avec b>c donc resultat ]-infini;+infini[
        {
          const b = randint(-10, 10)
          const c = b - randint(1, 5)
          const crochet2 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const choix = choice([true, false])
          this.reponse = ']-\\infty;+\\infty['
          this.question = `Donner une écriture simplifiée de
                  ${choix ? `$]-\\infty \\,; \\,${b}${crochet2}\\cup ${crochet3}${c}\\,;\\,+\\infty[$.` : `$${crochet3}${c}\\,;\\,+\\infty[\\cup ]-\\infty \\,; \\,${b}${crochet2}$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, 
                  ${choix ? `$]-\\infty \\,; \\,${b}${crochet2}\\cup ${crochet3}${c}\\,;\\,+\\infty[$` : `$${crochet3}${c}\\,;\\,+\\infty[\\cup ]-\\infty \\,; \\,${b}${crochet2}$`} $= ${miseEnEvidence(']-\\infty\\,;\\,+\\infty[=\\mathbb{R}')}$.<br>
                 `
        }
        break

      case 7: //  ]-infini;b] union [c;d] avec c<b et d>b donc resultat ]-infini;d]
        {
          const b = randint(-10, 10)
          const c = b - randint(1, 5)
          const d = b + randint(1, 5)
          const crochet2 = choice([']', '['])
          const crochet3 = choice([']', '['])
          const crochet4 = choice([']', '['])
          const choix = choice([true, false])
          this.reponse = `]-\\infty;${d}${crochet4}`
          this.question = `Donner une écriture simplifiée de
                    ${choix ? `$]-\\infty \\,; \\,${b}${crochet2}\\cup ${crochet3}${c}\\,;\\,${d}${crochet4}$.` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\cup ]-\\infty \\,; \\,${b}${crochet2}$.`}`
          if (this.interactif) {
            this.question += '<br>'
          }
          this.correction =
            `${cours}` +
            `Ainsi, ${choix ? `$]-\\infty \\,; \\,${b}${crochet2}\\cup ${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\cup ]-\\infty \\,; \\,${b}${crochet2}$`} $= ${miseEnEvidence(`]-\\infty\\,;\\,${d}${crochet4}`)}$.<br>
                     `
        }
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
