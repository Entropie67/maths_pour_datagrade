import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import DragAndDrop, { type Etiquette } from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Ranger des nombres relatifs'

export const dateDePublication = '22/09/2024'
export const dateDeModifImportante = '23/04/2025'
export const interactifReady = true

export const uuid = 'c7c3d'
export const refs = {
  'fr-fr': ['5N2F-1'],
  'fr-2016': ['5R13-1'],
  'fr-ch': ['9R1NO3B-5', '9R2NO3B-5', '9R3NO3B-5', 'PRQNO05A-3'],
}
/**
 * Ranger des nombres relatifs
 * @author Rémi Angot
 */
export default class RelatifsOrdre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireCaseACocher = ['Avec des nombres entiers', false]
    this.sup = false
  }

  nouvelleVersion() {
    this.dragAndDrops = []
    const typeQuestionsDisponibles = ['croissant', 'décroissant'] as [
      'croissant',
      'décroissant',
    ]

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = new Decimal(randint(10, 99)).div(-10)
      const b = a.add(new Decimal(randint(1, 9)).div(100))
      const c = a.add(new Decimal(randint(-9, -1)).div(100))
      const d = a.add(new Decimal(randint(1, 9)).div(10))
      const e = a.add(new Decimal(randint(-9, -1)).div(10))
      const f = a.add(new Decimal(choice([-1, 1])).mul(randint(10, 19)).div(10))
      let numbers = this.sup
        ? shuffle([a, b, c, d, e, f]).map((d) => d.mul(100))
        : shuffle([a, b, c, d, e, f])
      const n = randint(2, 3)
      for (let i = 0; i < n; i++) {
        numbers[i] = numbers[i].mul(-1)
      }
      numbers = shuffle(numbers)
      // Le glisser-déposer identifie chaque étiquette par un id : deux nombres égaux rendraient la réponse ambiguë.
      if (
        new Set(numbers.map((num) => num.toString())).size !== numbers.length
      ) {
        cpt++
        continue
      }

      const ordre = listeTypeQuestions[i]
      const orderedNumbers =
        ordre === 'croissant'
          ? numbers.slice().sort((a, b) => a.cmp(b))
          : numbers.slice().sort((a, b) => b.cmp(a))

      const symbole = ordre === 'croissant' ? '<' : '>'
      const avecGlisserDeposer =
        this.interactif && context.isHtml && !context.isTypst
      let texte = `Ranger les nombres suivants dans l'ordre ${ordre} : `
      if (avecGlisserDeposer) {
        const etiquettes: Etiquette[] = numbers.map((num, k) => ({
          id: String(k + 1),
          contenu: `$${texNombre(num)}$`,
        }))
        const dnd = new DragAndDrop({
          exercice: this,
          question: i,
          consigne: '',
          etiquettes: [etiquettes],
          enonceATrous: orderedNumbers
            .map((_, k) => `%{rectangle${k + 1}}`)
            .join(`$${symbole}$`),
          nomsZones: orderedNumbers.map(
            (_, k) =>
              `Position ${k + 1} sur ${orderedNumbers.length} dans l'ordre ${ordre}`,
          ),
        })
        this.dragAndDrops[i] = dnd
        texte +=
          '<br><br>' +
          dnd.ajouteDragAndDrop({ melange: false, duplicable: false })
        handleAnswers(
          this,
          i,
          Object.fromEntries(
            orderedNumbers.map((num, k) => [
              `rectangle${k + 1}`,
              { value: String(numbers.indexOf(num) + 1) },
            ]),
          ),
          { formatInteractif: 'dnd' },
        )
      } else {
        texte += `<br><br> $${numbers.map((num) => `${texNombre(num)}`).join('\\quad ; \\quad')}$.`
      }

      if (this.interactif && !avecGlisserDeposer) {
        texte +=
          '<br><br>' +
          remplisLesBlancs(
            this,
            i,
            `%{champ1}\\quad${symbole}\\quad%{champ2}\\quad${symbole}\\quad%{champ3}\\quad${symbole}\\quad%{champ4}\\quad${symbole}\\quad%{champ5}\\quad${symbole}\\quad%{champ6}`,
            ` ${KeyboardType.clavierDeBase}`,
            '\\ldots\\ldots',
          )
        handleAnswers(this, i, {
          champ1: { value: orderedNumbers[0] },

          champ2: { value: orderedNumbers[1] },

          champ3: { value: orderedNumbers[2] },

          champ4: { value: orderedNumbers[3] },

          champ5: { value: orderedNumbers[4] },

          champ6: { value: orderedNumbers[5] },
        })
      }
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'croissant':
          texteCorr = `$${miseEnEvidence(orderedNumbers.map((num) => `${texNombre(num)}`).join('\\quad < \\quad'))}$.`
          break
        case 'décroissant':
          texteCorr = `$${miseEnEvidence(orderedNumbers.map((num) => `${texNombre(num)}`).join('\\quad > \\quad'))}$.`
          break
      }
      if (this.questionJamaisPosee(i, JSON.stringify(numbers))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
