import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer des nombres relatifs'
export const dateDePublication = '1/08/2024'
export const dateDeModifImportante = '01/08/2024'
export const uuid = '19060'
export const interactifReady = true
export const refs = {
  'fr-fr': ['5N2F', 'BP2AutoG3', '3AutoN02-1'],
  'fr-2016': ['5R13', 'BP2AutoG3', '3AutoN02-1'],
  'fr-ch': ['9R1NO3B-4', '9R2NO3B-4', '9R3NO3B-4', 'PRQNO05A-1'],
}

/**
 *  : Comparaison de nombres relatifs
 * @author Claire Rousset
 */
export default class InequationsLog extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.consigne = 'Compléter avec le signe < ou >.'
    this.spacingCorr = 3
    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n0 : Nombres entiers\n1 : Nombres décimaux à une seule décimale \n2 : Nombres décimaux à deux décimales \n3 : Nombres décimaux à trois décimales \n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = []
    const questionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 0,
      max: 3,
      melange: 4,
      defaut: 1,
      shuffle: false,
    })
    const unitQuests = shuffle([
      'entierMemeSignePos',
      'entierMemeSigneNeg',
      'entierMemeSigneNeg',
      'entierSignesContraires',
    ])
    const dixQuests = shuffle([
      'dixiemeMemeSignePos',
      'dixiemeMemeSigneNeg',
      'dixiemeMemeSigneNeg',
      'dixiemeSignesContraires',
    ])
    const centQuests = shuffle([
      'centiemeMemeSignePos',
      'centiemeMemeSigneNeg',
      'centiemePiege',
      'centiemeSigneContraire',
    ])
    const millQuests = shuffle([
      'milliemeMemeSignePos',
      'milliemeMemeSigneNeg',
      'milliemePiege',
      'milliemeSigneContraire',
    ])
    for (const val of questionsDisponibles) {
      if (val === 0) {
        const quest = unitQuests.shift()
        if (quest) typeQuestionsDisponibles.push(quest)
      } else if (val === 1) {
        const quest = dixQuests.shift()
        if (quest) typeQuestionsDisponibles.push(quest)
      } else if (val === 2) {
        const quest = centQuests.shift()
        if (quest) typeQuestionsDisponibles.push(quest)
      } else if (val === 3) {
        const quest = millQuests.shift()
        if (quest) typeQuestionsDisponibles.push(quest)
      }
    }
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let texte = ''
      let texteCorr = ''
      let answer = ''
      let a = new Decimal(0)
      let b = new Decimal(0)
      switch (listeTypeQuestions[i]) {
        case 'entierMemeSignePos': {
          a = new Decimal(randint(0, 99))
          b = new Decimal(randint(0, 99, a.toNumber()))
          break
        }
        case 'entierSignesContraires': {
          a = new Decimal(randint(0, 99))
          b = new Decimal(randint(0, 99, a.toNumber()))
          if (randint(0, 1) === 1) a = a.neg()
          else b = b.neg()
          break
        }
        case 'entierMemeSigneNeg': {
          a = new Decimal(-randint(0, 99))
          b = new Decimal(-randint(0, 99, -a.toNumber()))
          break
        }
        case 'dixiemeMemeSignePos': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9, dixiemeA)
          a = new Decimal(partieEntiere * 10 + dixiemeA).div(10)
          b = new Decimal(partieEntiere * 10 + dixiemeB).div(10)
          break
        }
        case 'dixiemeSignesContraires': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9, dixiemeA)
          a = new Decimal(partieEntiere * 10 + dixiemeA).div(10)
          b = new Decimal(partieEntiere * 10 + dixiemeB).div(10)
          if (randint(0, 1) === 1) a = a.neg()
          else b = b.neg()
          break
        }
        case 'dixiemeMemeSigneNeg': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9, dixiemeA)
          a = new Decimal(partieEntiere * 10 + dixiemeA).div(10)
          b = new Decimal(partieEntiere * 10 + dixiemeB).div(10)
          a = a.neg()
          b = b.neg()
          break
        }
        case 'centiemeMemeSignePos': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9, centiemeA)
          a = new Decimal(partieEntiere * 100 + dixiemeA * 10 + centiemeA).div(
            100,
          )
          b = new Decimal(partieEntiere * 100 + dixiemeB * 10 + centiemeB).div(
            100,
          )
          break
        }
        case 'centiemeMemeSigneNeg': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9, centiemeA)
          a = new Decimal(partieEntiere * 100 + dixiemeA * 10 + centiemeA).div(
            100,
          )
          b = new Decimal(partieEntiere * 100 + dixiemeB * 10 + centiemeB).div(
            100,
          )
          a = a.neg()
          b = b.neg()
          break
        }
        case 'centiemePiege': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(1, 9)
          const dixiemeB = randint(0, dixiemeA)
          const centiemeA = 0
          let centiemeB = 0
          if (dixiemeB === 0) {
            centiemeB = dixiemeA
          } else {
            centiemeB = randint(1, 9)
          }
          a = new Decimal(partieEntiere * 100 + dixiemeA * 10 + centiemeA).div(
            100,
          )
          b = new Decimal(partieEntiere * 100 + dixiemeB * 10 + centiemeB).div(
            100,
          )
          if (randint(0, 1) === 1) [a, b] = [b, a]
          break
        }
        case 'centiemeSigneContraire': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9, centiemeA)
          a = new Decimal(partieEntiere * 100 + dixiemeA * 10 + centiemeA).div(
            100,
          )
          b = new Decimal(partieEntiere * 100 + dixiemeB * 10 + centiemeB).div(
            100,
          )
          if (randint(0, 1) === 1) a = a.neg()
          else b = b.neg()
          break
        }
        case 'milliemeMemeSignePos': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9)
          const milliemeA = randint(0, 9)
          const milliemeB = randint(0, 9, milliemeA)
          a = new Decimal(
            partieEntiere * 1000 + dixiemeA * 100 + centiemeA * 10 + milliemeA,
          ).div(1000)
          b = new Decimal(
            partieEntiere * 1000 + dixiemeB * 100 + centiemeB * 10 + milliemeB,
          ).div(1000)
          break
        }
        case 'milliemeMemeSigneNeg': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9)
          const milliemeA = randint(0, 9)
          const milliemeB = randint(0, 9, milliemeA)
          a = new Decimal(
            partieEntiere * 1000 + dixiemeA * 100 + centiemeA * 10 + milliemeA,
          ).div(1000)
          b = new Decimal(
            partieEntiere * 1000 + dixiemeB * 100 + centiemeB * 10 + milliemeB,
          ).div(1000)
          a = a.neg()
          b = b.neg()
          break
        }
        case 'milliemePiege': {
          const partieEntiere = randint(0, 9)
          const dixiemeA = 0
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const milliemeA = randint(0, 9)
          let milliemeB = 0
          let centiemeB = 0
          if (milliemeA === 0) {
            milliemeB = centiemeA
            centiemeB = dixiemeA
          } else {
            milliemeB = randint(1, 9)
            centiemeB = randint(1, 9)
          }
          a = new Decimal(
            partieEntiere * 1000 + dixiemeA * 100 + centiemeA * 10 + milliemeA,
          ).div(1000)
          b = new Decimal(
            partieEntiere * 1000 + dixiemeB * 100 + centiemeB * 10 + milliemeB,
          ).div(1000)
          break
        }
        case 'milliemeSigneContraire':
        default: {
          const partieEntiere = randint(0, 9)
          const dixiemeA = randint(0, 9)
          const dixiemeB = randint(0, 9)
          const centiemeA = randint(0, 9)
          const centiemeB = randint(0, 9)
          const milliemeA = randint(0, 9)
          const milliemeB = randint(0, 9, milliemeA)
          a = new Decimal(
            partieEntiere * 1000 + dixiemeA * 100 + centiemeA * 10 + milliemeA,
          ).div(1000)
          b = new Decimal(
            partieEntiere * 1000 + dixiemeB * 100 + centiemeB * 10 + milliemeB,
          ).div(1000)
          if (randint(0, 1) === 1) a = a.neg()
          else b = b.neg()
          break
        }
      }

      texte = `$${texNombre(a!)} \\quad \\ldots\\ldots \\quad${texNombre(b!)}$`
      if (a.greaterThan(b)) {
        texteCorr = `$${texNombre(a!)} \\quad ${miseEnEvidence('>')} \\quad ${texNombre(b!)}$`
        answer = '>'
      } else if (a.lessThan(b)) {
        texteCorr = `$${texNombre(a!)} \\quad ${miseEnEvidence('<')} \\quad ${texNombre(b!)}$`
        answer = '<'
      } else {
        texteCorr = `$${texNombre(a!)} \\quad ${miseEnEvidence('=')} \\quad ${texNombre(b!)}$`
        answer = '='
      }
      if (this.interactif) {
        handleAnswers(
          this,
          i,
          {
            champ1: { value: answer },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
        texte = remplisLesBlancs(
          this,
          i,
          `${texNombre(a!)} \\quad %{champ1} \\quad ${texNombre(b!)}`,
          KeyboardType.clavierCompare,
        )
      }
      if (this.questionJamaisPosee(i, a.toString(), b.toString())) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
