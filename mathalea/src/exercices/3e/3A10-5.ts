import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { all, isEqual, isPrimeFactorization } from '../../lib/interactif/checks'
import { choice } from '../../lib/outils/arrayOutils'
import {
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Recourir à une décomposition en facteurs premiers dans des cas simples'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '29/08/2022'
export const dateDeModifImportante = '23/10/2026'
/**
 *
 * Attendus de 3e : Recourir à une décomposition en facteurs premiers dans des cas simples
 * @author Éric Elter
 */

export const uuid = 'eee79'

export const refs = {
  'fr-fr': ['3A10-5'],
  'fr-ch': ['9R2NO1G-3', '9R3NO1G-3', '10CTNO1A-13', 'PRQNO09B-13', 'PRQNO09C-2'],
}

export function extraitLaDecomposition(expression: string) {
  const listeFacteurs = expression.split('\\times')
  const decompo: [number, number][] = []

  for (const facteur of listeFacteurs) {
    if (facteur.includes('^')) {
      // c'est une puissance
      const puissance = facteur.split('^')
      const mantisse = Number(puissance[0])
      const exposant = Number(puissance[1].replace('{', '').replace('}', ''))
      // Validation des nombres
      if (
        isNaN(mantisse) ||
        isNaN(exposant) ||
        !Number.isInteger(mantisse) ||
        !Number.isInteger(exposant)
      ) {
        return []
      }
      const element = decompo.find((el) => el[0] === mantisse)
      if (element == null) {
        // il n'y a pas eu encore ce facteur, on crée son élément dans decompo
        decompo.push([mantisse, exposant])
      } else {
        // il y a déjà eu un facteur mantisse, on incrément l'exposant
        element[1] += exposant
      }
    } else {
      // c'est un facteur simple
      const mantisse = Number(facteur)
      const exposant = 1
      // Validation des nombres
      if (
        isNaN(mantisse) ||
        isNaN(exposant) ||
        !Number.isInteger(mantisse) ||
        !Number.isInteger(exposant)
      ) {
        return []
      }
      const element = decompo.find((el) => el[0] === mantisse)
      if (element == null) {
        // il n'y a pas eu encore ce facteur, on crée son élément dans decompo
        decompo.push([mantisse, exposant])
      } else {
        // il y a déjà eu un facteur mantisse, on incrément l'exposant
        element[1] += exposant
      }
    }
  }
  return decompo
}
export default class RecourirDecompositionFacteursPremiers extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Nombres premiers utilisés ',
      'Nombres séparés par des tirets :\n1 : 2, 3 et 5\n2 : 2, 3 et 7\n3 : 2, 5 et 7\n4 : 3, 5 et 7\n5 : Au moins un nombre premier entre 10 et 20\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Puissance la plus élevée possible (entre 2 et 5)',
      3,
    ]
    this.sup = 6
    this.sup2 = 4
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.sup3 = 2
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    this.sup2 = contraindreValeur(1, 3, parseInt(this.sup2), 3)
    this.consigne = 'Décomposer, en produit de facteurs premiers, '
    this.consigne +=
      this.nbQuestions === 1 || context.isAmc
        ? 'le nombre suivant.'
        : 'les nombres suivants.'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    })
    const puissanceMax = contraindreValeur(2, 5, this.sup2, 3)
    for (
      let i = 0,
        texte,
        texteCorr,
        facteur1,
        facteur2,
        facteurX,
        cpt = 0,
        a,
        b,
        c,
        nbADecomposer;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(0, puissanceMax)
      b = randint(0, puissanceMax, a)
      c = randint(0, puissanceMax, [a, b])
      switch (listeTypeDeQuestions[i]) {
        case 1: // 2, 3 et 5
          nbADecomposer = Math.pow(2, a) * Math.pow(3, b) * Math.pow(5, c)
          texte = `$${texNombre(nbADecomposer)}`
          texteCorr = texCalculDecomposition(nbADecomposer)
          texte += '$'
          break
        case 2: // 2, 3 et 7
          nbADecomposer = Math.pow(2, a) * Math.pow(3, b) * Math.pow(7, c)
          texte = `$${texNombre(nbADecomposer)}`
          texteCorr = texCalculDecomposition(nbADecomposer)
          texte += '$'
          break
        case 3: // 2, 5 et 7
          nbADecomposer = Math.pow(2, a) * Math.pow(5, b) * Math.pow(7, c)
          texte = `$${texNombre(nbADecomposer)}`
          texteCorr = texCalculDecomposition(nbADecomposer)
          texte += '$'
          break
        case 4: // 3, 5 et 7
          nbADecomposer = Math.pow(3, a) * Math.pow(5, b) * Math.pow(7, c)
          texte = `$${texNombre(nbADecomposer)}`
          texteCorr = texCalculDecomposition(nbADecomposer)
          texte += '$'
          break
        case 5: // 11, 13, 17 ou 19 et deux autres facteurs parmi 2, 3 et 5
        default:
          facteur1 = choice([2, 3, 5])
          facteur2 = choice([2, 3, 5], [facteur1])
          if (facteur1 > facteur2) {
            facteurX = facteur1
            facteur1 = facteur2
            facteur2 = facteurX
          }
          facteurX = choice([11, 13, 17, 19])
          nbADecomposer =
            Math.pow(facteurX, 1) *
            Math.pow(facteur1, b) *
            Math.pow(facteur2, c)
          texte = `$${texNombre(nbADecomposer)}`
          texteCorr = texCalculDecomposition(nbADecomposer)
          texte += '$'
          break
      }
      handleAnswers(this, i, {
        reponse: {
          value: texFactorisation(nbADecomposer),
          compare: all([isEqual(), isPrimeFactorization()]),
        },
      })
      // En interactif, le nombre est écrit sur la même ligne que le « = » et le champ
      const champ = addPossibleMultiLinesAnswer(this, i, {
        prefix: `${texNombre(nbADecomposer)} =`,
        style: KeyboardType.clavierFullOperations,
        bareme: baremeMultiLignes(this.sup3),
        produitSeulement: true,
        valeurDeDepart: texNombre(nbADecomposer),
        enLigne: true,
      })
      if (champ !== '') texte = champ

      if (this.questionJamaisPosee(i, a, b, c)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce:
              this.consigne.substring(0, this.consigne.length - 1) +
              ' : ' +
              texte +
              '.<br>',
            propositions: [
              {
                texte: texteCorr,
                statut: 1,
                feedback: '',
                sanscadre: false,
                pointilles: false,
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
