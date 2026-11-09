import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Exprimer une grandeur en fonction des autres dans une formule d'aire ou de volume"
export const dateDePublication = '29/10/2026'
export const uuid = 'e94b0'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['11LCFA4D-3', '11LSFA4D-3', '11CTGM1F-3', '11LCGM1F-3', '11LSGM1F-3', 'PRQAL06A-1'] }

type Tirage = {
  enonce: string
  correction: string
  inconnue: string
  reponse: string
}

/** Une formule et l'étape d'isolement de chaque grandeur. */
const familles: Record<number, () => Tirage[]> = {
  // Aire d'un triangle : A = (b × h) / 2
  1: () => [
    {
      enonce: `L'aire d'un triangle de base $b$ et de hauteur $h$ est $A=\\dfrac{b\\times h}{2}$.<br>Exprimer $h$ en fonction de $A$ et de $b$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=b\\times h$.<br>On divise les deux membres par $b$ : $h=${miseEnEvidence('\\dfrac{2A}{b}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{2A}{b}',
    },
    {
      enonce: `L'aire d'un triangle de base $b$ et de hauteur $h$ est $A=\\dfrac{b\\times h}{2}$.<br>Exprimer $b$ en fonction de $A$ et de $h$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=b\\times h$.<br>On divise les deux membres par $h$ : $b=${miseEnEvidence('\\dfrac{2A}{h}')}$.`,
      inconnue: 'b',
      reponse: '\\dfrac{2A}{h}',
    },
  ],
  // Aire d'un trapèze : A = ((B + b) × h) / 2
  2: () => [
    {
      enonce: `L'aire d'un trapèze de bases $B$ et $b$ et de hauteur $h$ est $A=\\dfrac{(B+b)\\times h}{2}$.<br>Exprimer $h$ en fonction de $A$, de $B$ et de $b$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=(B+b)\\times h$.<br>On divise les deux membres par $(B+b)$ : $h=${miseEnEvidence('\\dfrac{2A}{B+b}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{2A}{B+b}',
    },
    {
      enonce: `L'aire d'un trapèze de bases $B$ et $b$ et de hauteur $h$ est $A=\\dfrac{(B+b)\\times h}{2}$.<br>Exprimer $B$ en fonction de $A$, de $b$ et de $h$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=(B+b)\\times h$.<br>On divise les deux membres par $h$ : $\\dfrac{2A}{h}=B+b$.<br>On soustrait $b$ aux deux membres : $B=${miseEnEvidence('\\dfrac{2A}{h}-b')}$.`,
      inconnue: 'B',
      reponse: '\\dfrac{2A}{h}-b',
    },
  ],
  // Volume d'un pavé droit : V = L × l × h
  3: () => [
    {
      enonce: `Le volume d'un pavé droit de longueur $L$, de largeur $l$ et de hauteur $h$ est $V=L\\times l\\times h$.<br>Exprimer $h$ en fonction de $V$, de $L$ et de $l$.`,
      correction: `On divise les deux membres par $L\\times l$ : $h=${miseEnEvidence('\\dfrac{V}{L\\times l}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{V}{L\\times l}',
    },
  ],
  // Volume d'un cylindre : V = π × r² × h
  4: () => [
    {
      enonce: `Le volume d'un cylindre de rayon $r$ et de hauteur $h$ est $V=\\pi\\times r^2\\times h$.<br>Exprimer $h$ en fonction de $V$ et de $r$.`,
      correction: `On divise les deux membres par $\\pi\\times r^2$ : $h=${miseEnEvidence('\\dfrac{V}{\\pi\\times r^2}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{V}{\\pi\\times r^2}',
    },
    {
      enonce: `Le volume d'un cylindre de rayon $r$ et de hauteur $h$ est $V=\\pi\\times r^2\\times h$.<br>Exprimer $r^2$ en fonction de $V$ et de $h$.`,
      correction: `On divise les deux membres par $\\pi\\times h$ : $r^2=${miseEnEvidence('\\dfrac{V}{\\pi\\times h}')}$.`,
      inconnue: 'r^2',
      reponse: '\\dfrac{V}{\\pi\\times h}',
    },
  ],
  // Volume d'une pyramide : V = (B × h) / 3
  5: () => [
    {
      enonce: `Le volume d'une pyramide de hauteur $h$ dont la base a pour aire $B$ est $V=\\dfrac{B\\times h}{3}$.<br>Exprimer $h$ en fonction de $V$ et de $B$.`,
      correction: `On multiplie les deux membres par $3$ : $3V=B\\times h$.<br>On divise les deux membres par $B$ : $h=${miseEnEvidence('\\dfrac{3V}{B}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{3V}{B}',
    },
    {
      enonce: `Le volume d'une pyramide de hauteur $h$ dont la base a pour aire $B$ est $V=\\dfrac{B\\times h}{3}$.<br>Exprimer $B$ en fonction de $V$ et de $h$.`,
      correction: `On multiplie les deux membres par $3$ : $3V=B\\times h$.<br>On divise les deux membres par $h$ : $B=${miseEnEvidence('\\dfrac{3V}{h}')}$.`,
      inconnue: 'B',
      reponse: '\\dfrac{3V}{h}',
    },
  ],
  // Volume d'un cône : V = (π × r² × h) / 3
  6: () => [
    {
      enonce: `Le volume d'un cône de rayon $r$ et de hauteur $h$ est $V=\\dfrac{\\pi\\times r^2\\times h}{3}$.<br>Exprimer $h$ en fonction de $V$ et de $r$.`,
      correction: `On multiplie les deux membres par $3$ : $3V=\\pi\\times r^2\\times h$.<br>On divise les deux membres par $\\pi\\times r^2$ : $h=${miseEnEvidence('\\dfrac{3V}{\\pi\\times r^2}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{3V}{\\pi\\times r^2}',
    },
    {
      enonce: `Le volume d'un cône de rayon $r$ et de hauteur $h$ est $V=\\dfrac{\\pi\\times r^2\\times h}{3}$.<br>Exprimer $r^2$ en fonction de $V$ et de $h$.`,
      correction: `On multiplie les deux membres par $3$ : $3V=\\pi\\times r^2\\times h$.<br>On divise les deux membres par $\\pi\\times h$ : $r^2=${miseEnEvidence('\\dfrac{3V}{\\pi\\times h}')}$.`,
      inconnue: 'r^2',
      reponse: '\\dfrac{3V}{\\pi\\times h}',
    },
  ],
  // Volume d'une boule : V = (4 × π × r³) / 3
  7: () => [
    {
      enonce: `Le volume d'une boule de rayon $r$ est $V=\\dfrac{4\\times\\pi\\times r^3}{3}$.<br>Exprimer $r^3$ en fonction de $V$.`,
      correction: `On multiplie les deux membres par $3$ : $3V=4\\times\\pi\\times r^3$.<br>On divise les deux membres par $4\\times\\pi$ : $r^3=${miseEnEvidence('\\dfrac{3V}{4\\times\\pi}')}$.`,
      inconnue: 'r^3',
      reponse: '\\dfrac{3V}{4\\times\\pi}',
    },
  ],
  // Aire latérale d'un prisme droit : A = P × h
  9: () => [
    {
      enonce: `L'aire latérale d'un prisme droit dont la base a pour périmètre $P$ et dont la hauteur est $h$ est $A=P\\times h$.<br>Exprimer $h$ en fonction de $A$ et de $P$.`,
      correction: `On divise les deux membres par $P$ : $h=${miseEnEvidence('\\dfrac{A}{P}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{A}{P}',
    },
    {
      enonce: `L'aire latérale d'un prisme droit dont la base a pour périmètre $P$ et dont la hauteur est $h$ est $A=P\\times h$.<br>Exprimer $P$ en fonction de $A$ et de $h$.`,
      correction: `On divise les deux membres par $h$ : $P=${miseEnEvidence('\\dfrac{A}{h}')}$.`,
      inconnue: 'P',
      reponse: '\\dfrac{A}{h}',
    },
  ],
  // Aire d'un parallélogramme : A = b × h
  10: () => [
    {
      enonce: `L'aire d'un parallélogramme de base $b$ et de hauteur $h$ est $A=b\\times h$.<br>Exprimer $h$ en fonction de $A$ et de $b$.`,
      correction: `On divise les deux membres par $b$ : $h=${miseEnEvidence('\\dfrac{A}{b}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{A}{b}',
    },
    {
      enonce: `L'aire d'un parallélogramme de base $b$ et de hauteur $h$ est $A=b\\times h$.<br>Exprimer $b$ en fonction de $A$ et de $h$.`,
      correction: `On divise les deux membres par $h$ : $b=${miseEnEvidence('\\dfrac{A}{h}')}$.`,
      inconnue: 'b',
      reponse: '\\dfrac{A}{h}',
    },
  ],
  // Aire d'un losange : A = (D × d) / 2
  11: () => [
    {
      enonce: `L'aire d'un losange de diagonales $D$ et $d$ est $A=\\dfrac{D\\times d}{2}$.<br>Exprimer $d$ en fonction de $A$ et de $D$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=D\\times d$.<br>On divise les deux membres par $D$ : $d=${miseEnEvidence('\\dfrac{2A}{D}')}$.`,
      inconnue: 'd',
      reponse: '\\dfrac{2A}{D}',
    },
    {
      enonce: `L'aire d'un losange de diagonales $D$ et $d$ est $A=\\dfrac{D\\times d}{2}$.<br>Exprimer $D$ en fonction de $A$ et de $d$.`,
      correction: `On multiplie les deux membres par $2$ : $2A=D\\times d$.<br>On divise les deux membres par $d$ : $D=${miseEnEvidence('\\dfrac{2A}{d}')}$.`,
      inconnue: 'D',
      reponse: '\\dfrac{2A}{d}',
    },
  ],
  // Volume d'un prisme droit : V = B × h
  12: () => [
    {
      enonce: `Le volume d'un prisme droit dont la base a pour aire $B$ et dont la hauteur est $h$ est $V=B\\times h$.<br>Exprimer $h$ en fonction de $V$ et de $B$.`,
      correction: `On divise les deux membres par $B$ : $h=${miseEnEvidence('\\dfrac{V}{B}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{V}{B}',
    },
    {
      enonce: `Le volume d'un prisme droit dont la base a pour aire $B$ et dont la hauteur est $h$ est $V=B\\times h$.<br>Exprimer $B$ en fonction de $V$ et de $h$.`,
      correction: `On divise les deux membres par $h$ : $B=${miseEnEvidence('\\dfrac{V}{h}')}$.`,
      inconnue: 'B',
      reponse: '\\dfrac{V}{h}',
    },
  ],
  // Volume d'un prisme à base triangulaire : V = (b × h × H) / 2
  13: () => [
    {
      enonce: `Le volume d'un prisme droit dont la base est un triangle de base $b$ et de hauteur $h$, et dont la hauteur est $H$, est $V=\\dfrac{b\\times h\\times H}{2}$.<br>Exprimer $H$ en fonction de $V$, de $b$ et de $h$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=b\\times h\\times H$.<br>On divise les deux membres par $b\\times h$ : $H=${miseEnEvidence('\\dfrac{2V}{b\\times h}')}$.`,
      inconnue: 'H',
      reponse: '\\dfrac{2V}{b\\times h}',
    },
    {
      enonce: `Le volume d'un prisme droit dont la base est un triangle de base $b$ et de hauteur $h$, et dont la hauteur est $H$, est $V=\\dfrac{b\\times h\\times H}{2}$.<br>Exprimer $h$ en fonction de $V$, de $b$ et de $H$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=b\\times h\\times H$.<br>On divise les deux membres par $b\\times H$ : $h=${miseEnEvidence('\\dfrac{2V}{b\\times H}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{2V}{b\\times H}',
    },
  ],
  // Volume d'un prisme à base trapézoïdale : V = ((B + b) × h × H) / 2
  14: () => [
    {
      enonce: `Le volume d'un prisme droit dont la base est un trapèze de bases $B$ et $b$ et de hauteur $h$, et dont la hauteur est $H$, est $V=\\dfrac{(B+b)\\times h\\times H}{2}$.<br>Exprimer $H$ en fonction de $V$, de $B$, de $b$ et de $h$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=(B+b)\\times h\\times H$.<br>On divise les deux membres par $(B+b)\\times h$ : $H=${miseEnEvidence('\\dfrac{2V}{(B+b)\\times h}')}$.`,
      inconnue: 'H',
      reponse: '\\dfrac{2V}{(B+b)\\times h}',
    },
    {
      enonce: `Le volume d'un prisme droit dont la base est un trapèze de bases $B$ et $b$ et de hauteur $h$, et dont la hauteur est $H$, est $V=\\dfrac{(B+b)\\times h\\times H}{2}$.<br>Exprimer $h$ en fonction de $V$, de $B$, de $b$ et de $H$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=(B+b)\\times h\\times H$.<br>On divise les deux membres par $(B+b)\\times H$ : $h=${miseEnEvidence('\\dfrac{2V}{(B+b)\\times H}')}$.`,
      inconnue: 'h',
      reponse: '\\dfrac{2V}{(B+b)\\times H}',
    },
  ],
  // Volume d'un prisme à base losange : V = (D × d × H) / 2
  15: () => [
    {
      enonce: `Le volume d'un prisme droit dont la base est un losange de diagonales $D$ et $d$, et dont la hauteur est $H$, est $V=\\dfrac{D\\times d\\times H}{2}$.<br>Exprimer $H$ en fonction de $V$, de $D$ et de $d$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=D\\times d\\times H$.<br>On divise les deux membres par $D\\times d$ : $H=${miseEnEvidence('\\dfrac{2V}{D\\times d}')}$.`,
      inconnue: 'H',
      reponse: '\\dfrac{2V}{D\\times d}',
    },
    {
      enonce: `Le volume d'un prisme droit dont la base est un losange de diagonales $D$ et $d$, et dont la hauteur est $H$, est $V=\\dfrac{D\\times d\\times H}{2}$.<br>Exprimer $d$ en fonction de $V$, de $D$ et de $H$.`,
      correction: `On multiplie les deux membres par $2$ : $2V=D\\times d\\times H$.<br>On divise les deux membres par $D\\times H$ : $d=${miseEnEvidence('\\dfrac{2V}{D\\times H}')}$.`,
      inconnue: 'd',
      reponse: '\\dfrac{2V}{D\\times H}',
    },
  ],
  // Volume d'un prisme à base parallélogramme : V = b × h × H
  16: () => [
    {
      enonce: `Le volume d'un prisme droit dont la base est un parallélogramme de base $b$ et de hauteur $h$, et dont la hauteur est $H$, est $V=b\\times h\\times H$.<br>Exprimer $H$ en fonction de $V$, de $b$ et de $h$.`,
      correction: `On divise les deux membres par $b\\times h$ : $H=${miseEnEvidence('\\dfrac{V}{b\\times h}')}$.`,
      inconnue: 'H',
      reponse: '\\dfrac{V}{b\\times h}',
    },
  ],
  // Aire latérale d'un cylindre : A = 2 × π × r × h
  8: () => [
    {
      enonce: `L'aire latérale d'un cylindre de rayon $r$ et de hauteur $h$ est $A=2\\times\\pi\\times r\\times h$.<br>Exprimer $r$ en fonction de $A$ et de $h$.`,
      correction: `On divise les deux membres par $2\\times\\pi\\times h$ : $r=${miseEnEvidence('\\dfrac{A}{2\\times\\pi\\times h}')}$.`,
      inconnue: 'r',
      reponse: '\\dfrac{A}{2\\times\\pi\\times h}',
    },
  ],
}

/**
 * Isoler une grandeur d'une formule d'aire ou de volume, sans valeurs numériques.
 * @author Nathan Scheinmann
 */
export default class FormuleAireVolume extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = 17
    this.besoinFormulaireTexte = [
      'Formules',
      [
        'Nombres séparés par des tirets :',
        '1 : Aire d’un triangle',
        '2 : Aire d’un trapèze',
        '3 : Volume d’un pavé droit',
        '4 : Volume d’un cylindre',
        '5 : Volume d’une pyramide',
        '6 : Volume d’un cône',
        '7 : Volume d’une boule',
        '8 : Aire latérale d’un cylindre',
        '9 : Aire latérale d’un prisme droit',
        '10 : Aire d’un parallélogramme',
        '11 : Aire d’un losange',
        '12 : Volume d’un prisme droit (aire de la base)',
        '13 : Volume d’un prisme droit à base triangulaire',
        '14 : Volume d’un prisme droit à base trapézoïdale',
        '15 : Volume d’un prisme droit à base en losange',
        '16 : Volume d’un prisme droit à base en parallélogramme',
        '17 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      'La formule est rappelée dans l’énoncé. La réponse attendue est le second membre : par exemple, pour isoler $h$ dans $V=\\pi r^2 h$, la saisie est $\\dfrac{V}{\\pi r^2}$. Pour le cylindre, le cône et la boule, on isole $r^2$ ou $r^3$ plutôt que $r$.'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 16,
      melange: 17,
      defaut: 17,
      nbQuestions: this.nbQuestions,
    }) as number[]
    const liste = combinaisonListes(types, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const tirage = choice(familles[liste[i]]())
      if (!this.questionJamaisPosee(i, liste[i], tirage.inconnue)) continue
      let texte = tirage.enonce
      handleAnswers(this, i, { reponse: { value: tirage.reponse } })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric, {
          texteAvant: `<br>$${tirage.inconnue}=$`,
        })
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = tirage.correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
