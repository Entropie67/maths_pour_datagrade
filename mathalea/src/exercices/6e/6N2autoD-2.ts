import { glisseNombreInteractif } from '../../lib/apps/glisse_nombre_interactif'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'
import DiviserDecimauxPar101001000 from './6N2autoD'
import MultiplierDecimauxPar101001000 from './6N2autoD-1'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre =
  'Multiplier ou diviser un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '17/08/2026'

/**
 * Mélange des questions de 6N2autoD (division) et 6N2autoD-1 (multiplication) d'un nombre décimal par 10, 100 ou 1000
 * @author Rémi Angot (à partir du travail d'Eric Elter sur les 2 exercices précédents)
 */
export const uuid = 'c5e16'

export const refs = {
  'fr-fr': ['6N2autoD-2', '6AutoN4-5'],
  'fr-2016': [],
  'fr-ch': ['9R1NO6F-10', '9R2NO6F-10', '9R3NO6F-10', 'PRQNO06A-6'],
}

export default class MultiplierOuDiviserDecimauxPar101001000 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Résultat (quotient ou produit)',
        '2 : Premier terme (dividende ou premier facteur)',
        '3 : Second terme (diviseur ou deuxième facteur)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type du premier terme',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Texte = [
      'Taille du premier terme par rapport à la puissance de 10',
      [
        'Nombres séparés par des tirets  :',
        '1 : Plus petit',
        '2 : Plus grand',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire4CaseACocher = ['Avec glisse-nombres']
    this.besoinFormulaire5Texte = [
      'Opération',
      [
        'Nombres séparés par des tirets  :',
        '1 : Division',
        '2 : Multiplication',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1-2'
    this.sup2 = '3'
    this.sup3 = '3'
    this.sup4 = true
    this.sup5 = '3'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.comment =
      'Le premier paramètre permet de déterminer le nombre à rechercher dans chaque division ou multiplication.<br><br>'
    this.comment +=
      'Le deuxième paramètre permet de choisir si le premier terme (dividende ou premier facteur) est un nombre entier, un nombre décimal ou un mélange des deux.<br><br>'
    this.comment +=
      'Le troisième paramètre permet de choisir si le premier terme est plus petit ou plus grand que la puissance de 10 utilisée.<br><br>'
    this.comment +=
      "Le quatrième paramètre permet de choisir si cet exercice dispose d'un glisse-nombre.<br><br>"
    this.comment +=
      'Le cinquième paramètre permet de choisir si les questions portent sur des divisions, des multiplications ou un mélange des deux.<br><br>'
    this.comment +=
      'Le sixième paramètre permet de choisir si cet exercice propose une correction sèche ou une correction détaillée.'
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.consigne = 'Compléter.'
  }

  nouvelleVersion() {
    const division = new DiviserDecimauxPar101001000()
    division.interactif = this.interactif
    division.nbQuestions = this.nbQuestions
    division.numeroExercice = this.numeroExercice // indispensable pour l'interactif
    division.sup = this.sup
    division.sup2 = this.sup2
    division.sup3 = this.sup3
    division.sup4 = this.sup4
    division.correctionDetaillee = this.correctionDetaillee
    // pas besoin d'utiliser un WRAPPER, l'objet est neuf, donc pas besoin de REINIT
    division.nouvelleVersion()

    const multiplication = new MultiplierDecimauxPar101001000()
    multiplication.interactif = this.interactif
    multiplication.nbQuestions = this.nbQuestions
    multiplication.numeroExercice = this.numeroExercice // indispensable pour l'interactif
    multiplication.sup = this.sup
    multiplication.sup2 = this.sup2
    multiplication.sup3 = this.sup3
    multiplication.sup4 = this.sup4
    multiplication.correctionDetaillee = this.correctionDetaillee
    // pas besoin d'utiliser un WRAPPER, l'objet est neuf, donc pas besoin de REINIT
    multiplication.nouvelleVersion()

    if (context.isHtml && !context.isTypst && this.sup4) {
      this.consigne = 'Compléter.'
      this.consigne += '<br>Un glisse-nombre est à disposition pour répondre '
      this.consigne +=
        this.nbQuestions === 1 ? 'à la question.' : 'aux questions.'
      this.consigne += glisseNombreInteractif({ number: 20.25 })
    } else {
      this.consigne = 'Compléter.'
    }

    this.listeQuestions = []
    this.listeCorrections = []
    this.autoCorrection = []
    this.autoCorrectionAMC = []
    this.questionsAMC = []

    const choixOperation = gestionnaireFormulaireTexte({
      saisie: this.sup5,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      listeOfCase: ['division', 'multiplication'],
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0; i < this.nbQuestions; i++) {
      const source =
        choixOperation[i] === 'multiplication' ? multiplication : division
      // On récupère tout ce qui fait la question, sa correction et l'interactif...
      this.listeQuestions[i] = source.listeQuestions[i]
      this.listeCorrections[i] = source.listeCorrections[i]
      this.autoCorrection[i] = source.autoCorrection[i]
      this.autoCorrectionAMC[i] = source.autoCorrectionAMC[i]
      this.questionsAMC[i] = source.questionsAMC[i]
    }
    listeQuestionsToContenu(this)
  }
}
