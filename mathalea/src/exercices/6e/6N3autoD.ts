import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { sommeDesChiffres } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Reconnaitre diviseur, multiple, divisible'

export const dateDeModifImportante = '14/03/2026'

/**
 * Vrai ou faux sur les notions de diviseur ou multiple
 * @author Rémi Angot
 * Ajout du critère de divisibilité par 10 par Guillaume Valmont le 07/03/2022
 * formulaire texte pour permettre de cumuler les critères par olivier Mimeau

*/
export const uuid = 'af4b1'

export const refs = {
  'fr-fr': ['6N3autoD'],
  'fr-2016': ['6N43-3'],
  'fr-ch': ['9R1NO1A-2', '9R2NO1A-2', '9R3NO1A-2', 'PRQNO08A-4', 'PRQNO09A-7'],
}

function justification(N: number, a: number, critereOK: boolean) {
  let result
  if (critereOK) {
    if (N === 2) {
      result = ', car son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$.'
    } else if (N === 5) {
      result = ', car son chiffre des unités est $0$ ou $5$.'
    } else if (N === 3 || N === 9) {
      result = `, car la somme de ses chiffres est $${sommeDesChiffres(a)[1]}=${sommeDesChiffres(a)[0]}$ qui est divisible par $${N}$.`
    } else if (N === 10) {
      result = ', car son chiffre des unités est $0$.'
    } else {
      result = `, car $${texNombre(a)} = ${N}\\times ${a / N}$.`
    }
  } else {
    if (N === 2) {
      result =
        ", car son chiffre des unités n'est pas $0$, $2$, $4$, $6$ ou $8$."
    } else if (N === 5) {
      result = ", car son chiffre des unités n'est ni $0$ ni $5$."
    } else if (N === 3 || N === 9) {
      result = `, car la somme de ses chiffres est $${sommeDesChiffres(a)[1]}=${sommeDesChiffres(a)[0]}$ qui n'est pas divisible par $${N}$.`
    } else if (N === 10) {
      result = ", car son chiffre des unités n'est pas $0$."
    } else {
      result = `, car $${texNombre(a)} = ${N}\\times ${Math.floor(a / N)}+ ${a % N}$.`
    }
  }
  return result
}
export default class ExerciceVraiFauxDivisibleMultipleDiviseur extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Choix du nombre',
      `Nombres séparés par des tirets :
    1 : Critères de divisibilité par 2
    2 : Critères de divisibilité par 3
    3 : Critères de divisibilité par 5
    4 : Critères de divisibilité par 9
    5 : Critères de divisibilité par 10
    6 : Sans critère de divisibilité
    7 : Mélange`,
    ]

    this.consigne =
      'Pour chaque affirmation, indiquer si elle est vraie ou fausse.'
    this.nbQuestions = 5
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = '1-3-5'
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles = [
      'Ndiviseur',
      'divisibleParN',
      'multipleDeN',
      'NdiviseurF',
      'divisibleParNF',
      'multipleDeNF',
      'NdiviseurEnvers',
      'divisibleParNEnvers',
      'multipleDeNEnvers',
    ]
    if (this.nbQuestions < 8) {
      typeDeQuestionsDisponibles = [
        choice(['Ndiviseur', 'divisibleParN']),
        'multipleDeN',
        choice(['NdiviseurF', 'divisibleParNF']),
        'multipleDeNF',
        choice(['NdiviseurEnvers', 'divisibleParNEnvers', 'multipleDeNEnvers']),
      ]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    const listeDeN: number[] = [] // listeDeNDisponibles: number[] = []

    const listecritere = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      listeOfCase: ['2', '3', '5', '9', '10', 'Sans'], // critère de divisibilité
      nbQuestions: this.nbQuestions,
    })
    for (const critere of listecritere) {
      if (critere === 'Sans') {
        listeDeN.push(choice([7, 11, 13, 20, 30, 25]))
      } else {
        if (typeof critere === 'string') {
          listeDeN.push(parseInt(critere))
        }
      }
    }
    // const listeDeN = combinaisonListes(listeDeNDisponibles, this.nbQuestions) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, N, a, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      N = listeDeN[i]
      a = randint(199, 999) * N
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: 'Vrai',
          statut: false,
        },
        {
          texte: 'Faux',
          statut: false,
        },
        {
          texte: 'Je ne sais pas',
          statut: false,
        },
      ]
      this.autoCorrection[i].options = { ordered: true, radio: true } // On ne mélange pas les propositions 'Oui', 'Non' et 'Je ne sais pas'
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'Ndiviseur':
          texte = `$${N}$ est un diviseur de $${texNombre(a)}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Vrai')
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![0].statut = true
          break
        case 'divisibleParN':
          texte = `$${texNombre(a)}$ est divisible par $${N}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Vrai')
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![0].statut = true
          break
        case 'multipleDeN':
          texte = `$${texNombre(a)}$ est un multiple de $${N}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Vrai')
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![0].statut = true
          break
        case 'NdiviseurF':
          a += randint(1, N - 1)
          texte = `$${N}$ est un diviseur de $${texNombre(a)}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += justification(N, a, false)
          this.autoCorrection[i].propositions![1].statut = true
          break
        case 'divisibleParNF':
          a += randint(1, N - 1)
          texte = `$${texNombre(a)}$ est divisible par $${N}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += justification(N, a, false)
          this.autoCorrection[i].propositions![1].statut = true
          break
        case 'multipleDeNF':
          a += randint(1, N - 1)
          texte = `$${texNombre(a)}$ est un multiple de $${N}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += justification(N, a, false)
          this.autoCorrection[i].propositions![1].statut = true
          break
        case 'NdiviseurEnvers':
          texte = `$${texNombre(a)}$ est un diviseur de $${N}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += `, il faudrait plutôt dire $${N}$ est un diviseur de $${texNombre(a)}$`
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![1].statut = true
          break
        case 'divisibleParNEnvers':
          texte = `$${N}$ est divisible par $${texNombre(a)}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += `, il faudrait plutôt dire $${texNombre(a)}$ est divisible par $${N}$`
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![1].statut = true
          break
        case 'multipleDeNEnvers':
        default:
          texte = `$${N}$ est un multiple de $${texNombre(a)}$.`
          texteCorr =
            texte.replace('.', ' ') + ' : ' + texteEnCouleurEtGras('Faux')
          texteCorr += `, il faudrait plutôt dire $${texNombre(a)}$ est un multiple de $${N}$`
          texteCorr += justification(N, a, true)
          this.autoCorrection[i].propositions![1].statut = true
          break
      }
      const props = propositionsQcm(this, i)

      if (this.interactif) {
        texte += '<br>' + props.texte
      }
      if (this.questionJamaisPosee(i, N, a)) {
        this.autoCorrection[i].enonce = `${texte}\n`
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

// python3 list-to-js.py pour faire apparaître l'exercice dans le menu
