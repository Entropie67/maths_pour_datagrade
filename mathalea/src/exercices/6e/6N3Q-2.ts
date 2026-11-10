import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcType = 'AMCNum'
export const amcReady = true
export const titre = 'Résoudre des problèmes avec des calculs de pourcentages'
export const dateDeModificationImportante = '21/05/2026'

/**
 * Calculer le montant d'une réduction donnée en pourcentage d'un prix initial
 * @author Jean-claude Lhote
 */
export const uuid = 'd67e9'

export const refs = {
  'fr-fr': ['6N3Q-2', 'BP2AutoB6'],
  'fr-2016': ['6N33-3', 'BP2AutoB6'],
  'fr-ch': ['10CTFA1C-4', '10LCFA1C-4', '10LSFA1C-4', 'PRQPF05A-5'],
}
export default class AppliquerUnPourcentage6N3Q extends Exercice {
  onlyMoney = false
  constructor() {
    super()

    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = this.onlyMoney ? [1] : [1, 2]
    const choix = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const listePourcentages = [10, 20, 30, 40, 50]
    const article = [
      ['Un pull', 20, 40],
      ['Une chemise', 15, 35],
      ['Un pantalon', 30, 60],
      ['Un T-shirt', 15, 25],
      ['Une jupe', 20, 40],
    ]
    const legume = [
      ['Une aubergine', 100, 200, "l'aubergine"],
      ['Un melon', 200, 300, 'le melon'],
      ['Une tomate', 50, 100, 'la tomate'],
      ['Une betterave', 75, 100, 'la betterave'],
      ['Une carotte', 30, 50, 'la carotte'],
    ]
    const listeIndex = [0, 1, 2, 3, 4]
    const prix = []
    const pourcent = []
    const masse = []
    const index = combinaisonListes(listeIndex, this.nbQuestions)
    for (
      let i = 0, texte, texteCorr, montant, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      pourcent[i] = choice(listePourcentages)
      switch (choix[i]) {
        case 1:
          prix[i] = randint(
            article[index[i]][1] as number,
            article[index[i]][2] as number,
          )
          montant = (pourcent[i] * prix[i]) / 100
          texte = `${article[index[i]][0]} coûtait $${prix[i]}$${sp()}€. Son prix bénéficie, maintenant, d'une réduction de $${pourcent[i]}\\,\\%$.<br>`
          texte += 'Quel est le montant en euro de cette réduction ?'
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )
          texteCorr = `On doit calculer $${pourcent[i]}\\,\\%$ de $${prix[i]}$${sp()}€ :<br>`
          texteCorr += `$${pourcent[i]}\\,\\%\\text{ de }${prix[i]}=${texFractionFromString(pourcent[i], 100)}\\times${prix[i]}=(${pourcent[i]}\\times${prix[i]})\\div100=${texNombre(pourcent[i] * prix[i])}\\div100=${texNombre(montant)}$<br>`
          texteCorr += `Le montant de la réduction est de $${miseEnEvidence(texPrix(montant))}$${sp()}€.`
          handleAnswers(
            this,
            i,
            { reponse: { value: montant } },
            { digits: 5, decimals: 2, signe: false },
          )
          break
        case 2:
        default:
          masse[i] = randint(
            legume[index[i]][1] as number,
            article[index[i]][2] as number,
          )
          montant = (masse[i] * pourcent[i]) / 100
          // texte = `${legume[index[i]][0]} pesant $${masse[i]}$ grammes a eu une croissance de $${pourcent[i]}\\,\\%$.<br>`
          // texte +=
          //  'Quelle est la masse supplémentaire en grammes correspondant à cette croissance ?'
          texte = `${legume[index[i]][0]} pesait $${masse[i]}$ grammes. Depuis, ${legume[index[i]][3]} a poursuivi sa croissance et sa masse a augmenté de $${pourcent[i]}\\,\\%$.<br>`
          texte += 'De combien de grammes sa masse a-t-elle augmenté ?'
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteApres: ' g' },
          )
          texteCorr = `On doit calculer $${pourcent[i]}\\,\\%$ de $${masse[i]}$ grammes :<br>`
          texteCorr += `$${pourcent[i]}\\,\\%\\text{ de }${masse[i]}=${texFractionFromString(pourcent[i], 100)}\\times${masse[i]}=(${pourcent[i]}\\times${masse[i]})\\div100=${texNombre(pourcent[i] * masse[i])}\\div100=${texNombre(montant)}$<br>`
          texteCorr += `La masse a augmenté de $${miseEnEvidence(texNombre(montant))}$ g.`
          handleAnswers(
            this,
            i,
            { reponse: { value: montant } },
            { digits: 4, decimals: 2, signe: false },
          )
          break
      }
      if (this.questionJamaisPosee(i, pourcent[i], choix[i], montant)) {
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
