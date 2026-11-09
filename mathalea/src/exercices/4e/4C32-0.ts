import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  'Donner le résultat de nombres écrits avec des puissances de $10$ en écriture décimale'
export const dateDePublication = '18/01/2022'
export const dateDeModifImportante = '05/09/2023'

/**
 * On donne un calcul avec des puissances de 10 et on en attend le résultat en écriture décimale
 * @author Mireille Gain
 * Ajout du choix du signe de l'exposant par Guillaume Valmont le 26/04/2023
 */
export const uuid = '5d72b'

export const refs = {
  'fr-fr': ['4C32-0', 'BP2AutoE8'],
  'fr-ch': ['10LCNO5B-1', '10LSNO5B-1', 'PRQNO07C-9', 'PRQNO15C-7'],
}
export default class EcritureDecimaleApresPuissancesDeDix extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2

    this.besoinFormulaireNumerique = [
      'Exposants',
      3,
      '1 : Positifs\n2 : Négatifs\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2CaseACocher = ['Correction détaillée']
    this.sup2 = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Donner le résultat du calcul suivant en écriture décimale.'
        : 'Donner le résultat des calculs suivants en écriture décimale.'

    let typeQuestionsDisponibles = ['type1', 'type2', 'type3', 'type4']

    if (this.sup === 1) typeQuestionsDisponibles = ['type1', 'type3']
    if (this.sup === 2) typeQuestionsDisponibles = ['type2', 'type4']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, n, nb, d, p, rg, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'type1':
          n = new Decimal(
            choice([randint(2, 9), randint(11, 99), randint(101, 999)]),
          )
          p = randint(1, 7)

          texte = `$${texNombre(n)} \\times 10^{${p}}$`
          if (this.sup2) {
            texteCorr = `On veut calculer $${texNombre(n)} \\times 10^{${p}}$.<br>`
            if (p === 1) {
              rg = 'dizaines'
            } else if (p === 2) {
              rg = 'centaines'
            } else if (p === 3) {
              rg = 'unités de mille'
            } else if (p === 4) {
              rg = 'dizaines de mille'
            } else if (p === 5) {
              rg = 'centaines de mille'
            } else if (p === 6) {
              rg = 'unités de millions'
            } else if (p === 7) {
              rg = 'dizaines de millions'
            }
            texteCorr += `Le chiffre des unités de $${texNombre(n)}$ doit donc devenir celui des ${rg}.<br> `
          } else {
            texteCorr = ''
          }
          texteCorr += texte

          texteCorr += `$=${miseEnEvidence(texNombre(n.mul(Decimal.pow(10, p))))}$`
          handleAnswers(this, i, {
            reponse: { value: n.mul(Decimal.pow(10, p)) },
          })
          break
        case 'type2':
          n = new Decimal(
            choice([randint(2, 9), randint(11, 99), randint(101, 999)]),
          )
          p = randint(1, 6)
          n = new Decimal(8)
          texte = `$${texNombre(n)} \\times 10^{${-p}}$`
          if (this.sup2) {
            texteCorr = `On veut calculer $${texNombre(n)} \\times 10^{${-p}}$.<br>`
            if (p === 1) {
              rg = 'dixièmes'
            } else if (p === 2) {
              rg = 'centièmes'
            } else if (p === 3) {
              rg = 'millièmes'
            } else if (p === 4) {
              rg = 'dix-millièmes'
            } else if (p === 5) {
              rg = 'cent-millièmes'
            } else if (p === 6) {
              rg = 'millionièmes'
            } else if (p === 7) {
              rg = 'cent-millionièmes'
            }
            texteCorr += `Le chiffre des unités de $${texNombre(n)}$ doit donc devenir celui des ${rg}.<br> `
          } else {
            texteCorr = ''
          }
          texteCorr += texte
          texteCorr += `$=${miseEnEvidence(texNombre(n.mul(Decimal.pow(10, -p)), 6))}$`
          handleAnswers(this, i, {
            reponse: { value: n.mul(Decimal.pow(10, -p)) },
          })
          break
        case 'type3':
          n = choice([randint(2, 9), randint(11, 99), randint(101, 999)])
          d = choice([randint(2, 9), randint(11, 99), randint(101, 999)])
          p = randint(1, 7)
          nb = new Decimal(d).div(choice([10, 100, 1000])).add(n) // nb est Decimal !
          texte = `$${texNombre(nb, 3)} \\times 10^{${p}}$`
          if (this.sup2) {
            texteCorr = `On veut calculer $${texNombre(nb)} \\times 10^{${p}}$.<br>`
            if (p === 1) {
              rg = 'dizaines'
            } else if (p === 2) {
              rg = 'centaines'
            } else if (p === 3) {
              rg = 'unités de mille'
            } else if (p === 4) {
              rg = 'dizaines de mille'
            } else if (p === 5) {
              rg = 'centaines de mille'
            } else if (p === 6) {
              rg = 'unités de millions'
            } else if (p === 7) {
              rg = 'dizaines de millions'
            }
            texteCorr += `Le chiffre des unités de $${texNombre(nb)}$ doit donc devenir celui des ${rg}.<br> `
          } else {
            texteCorr = ''
          }
          texteCorr += texte
          texteCorr += `$=${miseEnEvidence(texNombre(nb.mul(Decimal.pow(10, p)), 3))}$`
          handleAnswers(this, i, {
            reponse: { value: nb.mul(Decimal.pow(10, p)) },
          })
          break
        case 'type4':
          n = choice([randint(2, 9), randint(11, 99), randint(101, 999)])
          d = choice([randint(2, 9), randint(11, 99), randint(101, 999)])
          p = randint(1, 7)
          nb = new Decimal(d).div(choice([10, 100, 1000])).add(n)
          texte = `$${texNombre(nb, 3)} \\times 10^{${-p}}$`
          if (this.sup2) {
            texteCorr = `On veut calculer $${texNombre(nb)} \\times 10^{${-p}}$.<br>`
            if (p === 1) {
              rg = 'dixièmes'
            } else if (p === 2) {
              rg = 'centièmes'
            } else if (p === 3) {
              rg = 'millièmes'
            } else if (p === 4) {
              rg = 'dix-millièmes'
            } else if (p === 5) {
              rg = 'cent-millièmes'
            } else if (p === 6) {
              rg = 'millionièmes'
            } else if (p === 7) {
              rg = 'cent-millionièmes'
            }
            texteCorr += `Le chiffre des unités de $${texNombre(nb)}$ doit donc devenir celui des ${rg}.<br> `
          } else {
            texteCorr = ''
          }
          texteCorr += texte
          texteCorr += `$=${miseEnEvidence(texNombre(nb.mul(Decimal.pow(10, -p)), 10))}$`
          handleAnswers(this, i, {
            reponse: { value: nb.mul(Decimal.pow(10, -p)) },
          })
          break
      }

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant: `${sp(2)}$=$${sp(2)}`,
      })

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
