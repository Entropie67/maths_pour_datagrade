import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Connaitre le cours sur le périmètre et l'aire"

/**
 * Citer des formules de périmètre, des formules d'aire ou la définition de π
 * @author Rémi Angot

 */
export const uuid = 'dc7ba'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6M25'],
  'fr-ch': ['10CTGM1A-9', '10LCGM1A-9', '10LSGM1A-9', 'PRQMG01C-8', '9R1GM2B-1', '9R2GM2B-1', '9R3GM2B-1', 'PRQMG01B-14'],
}
export default class ConnaitreFormulesDePerimetreEtAires extends Exercice {
  version: string
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Définition du nombre $\\pi$',
        "2 : Longueur d'un cercle",
        '3 : Périmètre du rectangle',
        '4 : Périmètre du carré',
        '5 : Aire du rectangle',
        '6 : Aire du carré',
        '7 : Aire du triangle rectangle',
        '8 : Aire du triangle quelconque',
        "9 : Aire d'un disque",
        '10 : Mélange',
      ].join('\n'),
    ]
    this.sup = 10
    this.version = '5M10-2'
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    if (this.version === '6M1B')
      typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 2,
        defaut: 3,
        nbQuestions: this.nbQuestions,
        melange: 3,
        saisie: this.sup,
        enleveDoublons: true,
        listeOfCase: ['pi', 'pcercle'],
      })
    else if (this.version === '6M1autoE-4')
      typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 4,
        defaut: 5,
        nbQuestions: this.nbQuestions,
        melange: 5,
        saisie: this.sup,
        enleveDoublons: true,
        listeOfCase: ['prectangle', 'pcarre', 'acarre', 'arectangle'],
      })
    else if (this.version === '5M10-2a')
      typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 6,
        defaut: 7,
        nbQuestions: this.nbQuestions,
        melange: 7,
        saisie: this.sup,
        enleveDoublons: true,
        listeOfCase: [
          'prectangle',
          'pcarre',
          'acarre',
          'arectangle',
          'atrianglerectangle',
          'atriangle',
        ],
      })
    else if (this.version === '5M10-2b')
      typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 3,
        defaut: 4,
        nbQuestions: this.nbQuestions,
        melange: 4,
        saisie: this.sup,
        enleveDoublons: true,
        listeOfCase: ['pi', 'pcercle', 'adisque'],
      })
    else
      typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 9,
        defaut: 10,
        nbQuestions: this.nbQuestions,
        melange: 10,
        saisie: this.sup,
        enleveDoublons: true,
        listeOfCase: [
          'pi',
          'pcercle',
          'prectangle',
          'pcarre',
          'acarre',
          'arectangle',
          'atrianglerectangle',
          'atriangle',
          'adisque',
        ],
      })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'pi':
          texte = 'Rappeler la définition du nombre $\\pi$.'
          texteCorr = `$\\pi$ est ${texteEnCouleurEtGras("la longueur d'un cercle de diamètre $\\mathbf{1}$")}.`
          break
        case 'prectangle':
          texte = 'Donner une formule du périmètre du rectangle.'
          texteCorr =
            `$\\mathcal{P}_{\\text{rectangle}}=${miseEnEvidence('(L+l)\\times2')}=L\\times2+l\\times2=L+l+L+l$<br><br>`
          texteCorr += 'Avec $L$ la longueur et $l$ la largeur du rectangle.'
          break
        case 'pcarre':
          texte = 'Donner une formule du périmètre du carré.'
          texteCorr = `$\\mathcal{P}_{\\text{carré}}=${miseEnEvidence('c\\times4')}=c+c+c+c$<br><br>`
          texteCorr += 'Avec $c$ la longueur du côté du carré.'
          break
        case 'arectangle':
          texte = "Donner une formule de l'aire du rectangle."
          texteCorr = `$\\mathcal{A}_{\\text{rectangle}}=${miseEnEvidence('L\\times l')}$<br><br>`
          texteCorr += 'Avec $L$ la longueur et $l$ la largeur du rectangle.'
          break
        case 'acarre':
          texte = "Donner une formule de l'aire du carré."
          texteCorr = `$\\mathcal{A}_{\\text{carré}}=c\\times c=${miseEnEvidence('c^2')}$<br><br>`
          texteCorr += 'Avec $c$ la longueur du côté du carré.'
          break
        case 'atrianglerectangle':
          texte = "Donner une formule de l'aire du triangle rectangle."
          texteCorr =
            `$\\mathcal{A}_{\\text{triangle rectangle}}=a\\times b \\div2=${miseEnEvidence('\\dfrac{a\\times b}{2}')}$<br><br>`
          texteCorr +=
            "Avec $a$ et $b$ les longueurs des côtés de l'angle droit."
          break
        case 'atriangle':
          texte = "Donner une formule de l'aire d'un triangle quelconque."
          texteCorr =
            `$\\mathcal{A}_{\\text{triangle rectangle}}=b\\times h \\div2=${miseEnEvidence('\\dfrac{b\\times h}{2}')}$<br><br>`
          texteCorr +=
            "Avec $b$ la longueur d'un côté et $h$ la longueur de la hauteur relative à ce côté."
          break
        case 'pcercle':
          texte =
            "Donner une formule de la longueur d'un cercle (aussi appelée circonférence)."
          texteCorr =
            `$\\mathcal{P}_{\\text{cercle}}=D\\times \\pi = 2\\times R \\times \\pi =${miseEnEvidence('2\\pi{}R')}$<br><br>`
          texteCorr += 'Avec $D$ le diamètre et $R$ le rayon de ce cercle.'
          break
        case 'adisque':
        default:
          texte = "Donner une formule de l'aire d'un disque."
          texteCorr =
            `$\\mathcal{A}_{\\text{disque}}=R\\times R\\times\\pi=${miseEnEvidence('\\pi R^2')}$<br><br>`
          texteCorr += 'Avec $R$ le rayon de ce disque.'
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
}
