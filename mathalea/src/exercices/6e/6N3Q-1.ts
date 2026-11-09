import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre = "Prendre $1\\,\\%$, $10\\,\\%$ ou $50\\,\\%$ d'un nombre"
export const dateDePublication = '30/08/2026'

/**
 * @author Éric Elter
 */
export const uuid = 'bea8b'

export const refs = {
  'fr-fr': ['6N3Q-1', '5N3autoJ'],
  'fr-ch': ['10CTFA1C-6', '10LCFA1C-6', '10LSFA1C-6', 'PRQPF05A-7'],
}
export default class PourcentageDunNombreAuto5e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.consigne = 'Calculer.'
    this.spacingCorr = 2
    this.nbCols = 2

    this.interactif = false
    this.sup2 = '4'
    this.besoinFormulaire2Texte = [
      'Choix des pourcentages',
      `Nombres séparés par des tirets
1 : 1 %
2 : 10 %
3 : 50 %
4 : Mélange`,
    ]
  }

  nouvelleVersion() {
    const pourcentages = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: [1, 10, 50],
    }).map(Number)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const p = pourcentages[i]
      const n = choice([
        randint(2, 9),
        randint(2, 9) * 10,
        randint(1, 9) * 10 + randint(1, 2),
      ])
      texte = `$${p}\\,\\%~\\text{de }${n}$`
      texteCorr = 'Utilisons la proportionnalité pour répondre.<br>'
      switch (p) {
        case 50:
          texteCorr += `$50$${sp()}%, c'est la moitié de $100$${sp()}% et ainsi, trouver $50$${sp()}% d'une valeur, c'est trouver sa moitié.<br>Donc $50\\,\\%$ de $${n}=${n}\\div${2} = ${texNombre(n / 2)}$`
          break
        case 10:
          texteCorr += `$10$${sp()}%, c'est un dixième de $100$${sp()}% et ainsi, trouver $10$${sp()}% d'une valeur, c'est trouver un dixième de cette valeur, soit diviser cette valeur par $10$.<br>Donc $10\\,\\%$ de $${n}=${n}\\div${10} = ${texNombre(n / 10)}$`
          break
        case 1:
        default:
          texteCorr += `$1$${sp()}%, c'est un centième de $100$${sp()}% et ainsi, trouver $1$${sp()}% d'une valeur, c'est trouver un centième de cette valeur, soit diviser cette valeur par $100$.<br>Donc $1\\,\\%$ de $${n}=${n}\\div${100} = ${texNombre(n / 100)}$`
      }
      if (context.isHtml && this.interactif)
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          { texteAvant: `${sp()}= ` },
        )
      handleAnswers(this, i, { reponse: { value: (n * p) / 100 } })
      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce = texte + '='
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [
          { texte: texteCorr, statut: false },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits = 3
        amcParam.decimals = 1
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, p, n)) {
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
