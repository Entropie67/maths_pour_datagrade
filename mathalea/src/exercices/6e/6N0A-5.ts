import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'
import { sp } from '../../lib/outils/outilString'

export const titre = "Déterminer le dernier chiffre d'un calcul entre entiers"
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Trouver le dernier chiffre d'un calcul (somme, produit, différence) entre entiers
 * @author Erwan DUPLESSY
 */

export const uuid = 'b3843'

export const refs = {
  'fr-fr': ['6N0A-5'],
  'fr-2016': ['6C34'],
  'fr-ch': ['9R1NO7D-4', '9R2NO7D-4', '9R3NO7D-4', 'PRQST03A-4'],
}
export default class DernierChiffre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Sommes\n2 : Sommes et produits\n3 : Sommes, produits et différences',
    ]
    this.sup = 3
    this.nbQuestions = 4 // Ici le nombre de questions

    this.nbCols = 2 // Le nombre de colonnes dans l'énoncé LaTeX
    this.nbColsCorr = 2 // Le nombre de colonne pour la correction LaTeX

    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque calcul, déterminer le dernier chiffre du résultat.'
        : 'Déterminer le dernier chiffre du résultat de ce calcul.'
    let typeDeQuestionsDisponibles: string[] = []
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['somme']
    }
    if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['somme', 'produit']
    }
    if (this.sup === 3) {
      typeDeQuestionsDisponibles = ['somme', 'produit', 'difference']
    }
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, a = 0, b = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'somme':
          a = randint(11, 999)
          b = randint(11, 999)
          texte = `$ ${a} + ${b}$`
          texteCorr = ''
          if (this.correctionDetaillee) {
            texteCorr += `Le dernier chiffre de $${a} + ${b}$ est le dernier chiffre de $${a % 10} + ${b % 10}$. `
            texteCorr += `Or, $${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}$.<br>`
          }
          texteCorr += `Le dernier chiffre de $${a} + ${b}$ est $${miseEnEvidence((b + a) % 10)}$.`

          handleAnswers(this, i, { reponse: { value: (b + a) % 10 } })

          break
        case 'produit':
          a = randint(11, 999)
          b = randint(11, 999)
          texte = `$${a} \\times ${b}$`
          texteCorr = ''
          if (this.correctionDetaillee) {
            texteCorr += `Le dernier chiffre de $${a} \\times ${b}$ est le dernier chiffre de $${a % 10} \\times ${b % 10}$. `
            texteCorr += `Or, $${a % 10} \\times ${b % 10} = ${(a % 10) * (b % 10)}$.<br>`
          }
          texteCorr += `Le dernier chiffre de $${a} \\times ${b}$ est $${miseEnEvidence((b * a) % 10)}$.`

          handleAnswers(this, i, { reponse: { value: (b * a) % 10 } })
          break

        case 'difference':
          b = randint(11, 999)
          a = randint(b + 1, b + 999)
          texte = `$ ${texNombre(a)} - ${b}$`
          texteCorr = ''
          if (this.correctionDetaillee) {
            if ((a % 10) - (b % 10) >= 0) {
              texteCorr += `Le dernier chiffre de $${texNombre(a)} - ${b}$ est égal à${sp()}: $${a % 10} - ${b % 10} = ${(a % 10) - (b % 10)}$. <br>`
            } else {
              texteCorr += `Comme $${a % 10} < ${b % 10}$, on doit faire la soustraction${sp()}: $${(a % 10) + 10} - ${b % 10} = ${(a % 10) + 10 - (b % 10)}$. <br>`
            }
          }
          texteCorr += `Le dernier chiffre de $${texNombre(a)} - ${b}$ est $${miseEnEvidence((a - b) % 10)}$.`

          handleAnswers(this, i, { reponse: { value: (a - b) % 10 } })
          break
      }

      if (context.isHtml && this.interactif)
        texte +=
          `<br>Le chiffre des unités est${sp()}: ` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          ...this.autoCorrectionAMC[i],
          enonce: texte,
          propositions: [{ texte: texteCorr }],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits = 1
        amcParam.decimals = 0
      }
      if (this.questionJamaisPosee(i, a, b, listeTypeDeQuestions[i])) {
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
