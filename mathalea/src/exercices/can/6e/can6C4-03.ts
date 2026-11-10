import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Comprendre la division euclidienne'
export const interactifReady = true

export const dateDePublication = '03/07/2025'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '7a447'

export const refs = {
  'fr-fr': ['can6C4-03', '6N2J-flash3', '2N20-flash5'],
  'fr-ch': [],
}
export default class ComprendreDivisionEuclidienne extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.spacing = 1.5
  }

  nouvelleVersion() {
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1:
        {
          const diviseur = choice([7, 8, 9])
          const quotient = randint(25, 36)
          const reste = randint(2, 6)
          const dividende = diviseur * quotient + reste
          const choix = choice([true, false])
          this.reponse = `${choix ? quotient : reste} `
          this.question = `En utilisant l'égalité $${texNombre(dividende)}=${diviseur}\\times${texNombre(quotient)}+ ${texNombre(reste)}$, résoudre le problème suivant :<br>
            Un paysagiste dispose de $${dividende}$ fleurs et souhaite réaliser un maximum de bouquets avec $${diviseur}$ fleurs.<br>`
          this.question += `${choix ? 'Combien de bouquets peut-il confectionner ?' : 'Combien de fleurs restera-t-il ? '}`
          this.correction = ` L'égalité donnée dans l'énoncé est l'égalité obtenue à partir de la division euclidienne de 
    $${texNombre(dividende)}$ par $${diviseur}$. <br>
    On en déduit que le paysagiste pourra faire ${choix ? `$${miseEnEvidence(texNombre(quotient))}$ ` : `$${texNombre(quotient)}$ `} bouquets et 
    il restera ${choix ? `$${texNombre(reste)}$ ` : `$${miseEnEvidence(texNombre(reste))}$ `} ${reste === 1 ? 'fleur' : 'fleurs'}.`
          this.optionsChampTexte = {
            texteAvant: '<br>',
            texteApres: `${choix ? 'bouquet(s)' : 'fleur(s)'}`,
          }

          this.canReponseACompleter = `$\\ldots$ ${choix ? 'bouquet(s)' : 'fleur(s)'}`
        }
        break
      case 2:
        {
          const diviseur = choice([5, 6, 7]) // Nombre d’élèves par rangée
          const quotient = randint(20, 30) // Nombre de rangées pleines
          const reste = randint(1, 5) // Élèves sans rangée
          const dividende = diviseur * quotient + reste // Total d’élèves

          const choix = choice([true, false]) // true = question sur les rangées, false = sur les élèves sans place

          this.reponse = `${choix ? quotient : reste} `

          this.question = `En utilisant l'égalité : $${texNombre(dividende)} = ${diviseur}\\times${texNombre(quotient)} + ${texNombre(reste)}$, résoudre le problème suivant :<br>
Un professeur aligne ses $${dividende}$ élèves en rangées de $${diviseur}$.<br>`
          this.question += `${choix ? 'Combien de rangées complètes peut-il former ?' : 'Combien d’élèves ne seront pas dans une rangée complète ?'}`

          this.correction = `L'égalité donnée correspond à la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$.<br>
Cela signifie qu’il pourra former ${choix ? `$${miseEnEvidence(texNombre(quotient))}$` : `$${texNombre(quotient)}$`} rangées complètes 
et qu’il restera ${choix ? `$${texNombre(reste)}$` : `$${miseEnEvidence(texNombre(reste))}$`} ${reste === 1 ? 'élève' : 'élèves'} sans place dans une rangée.`

          this.optionsChampTexte = {
            texteAvant: '<br>',
            texteApres: `${choix ? 'rangée(s)' : 'élève(s)'}`,
          }

          this.canReponseACompleter = `$\\ldots$ ${choix ? 'rangée(s)' : 'élève(s)'}`
        }
        break
      case 3:
        {
          const diviseur = choice([6, 7, 8, 9]) // Livres par carton
          const quotient = randint(15, 25) // Nombre de cartons pleins
          const reste = randint(1, 5) // Livres restants
          const dividende = diviseur * quotient + reste // Total de livres

          const choix = choice([true, false]) // true = question sur les cartons, false = sur les livres restants

          this.reponse = `${choix ? quotient : reste} `

          this.question = `En utilisant l'égalité : $${texNombre(dividende)} = ${diviseur}\\times${texNombre(quotient)} + ${texNombre(reste)}$, résoudre le problème suivant :<br>
Une documentaliste reçoit $${dividende}$ livres à ranger dans des cartons, chaque carton peut contenir $${diviseur}$ livres.<br>`
          this.question += `${choix ? 'Combien de cartons pleins pourra-t-elle remplir ?' : 'Combien de livres ne pourront pas être rangés dans un carton ?'}`

          this.correction = `L’égalité donnée correspond à la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$.<br>
Cela signifie que la documentaliste pourra remplir ${choix ? `$${miseEnEvidence(texNombre(quotient))}$` : `$${texNombre(quotient)}$`} cartons pleins 
et qu’il lui restera ${choix ? `$${texNombre(reste)}$` : `$${miseEnEvidence(texNombre(reste))}$`} ${reste === 1 ? 'livre' : 'livres'} non rangés.`

          this.optionsChampTexte = {
            texteAvant: '<br>',
            texteApres: `${choix ? 'cartons' : 'livres'}`,
          }

          this.canReponseACompleter = `$\\ldots$ ${choix ? 'carton(s)' : 'livre(s)'}`
        }
        break
    }
  }
}
