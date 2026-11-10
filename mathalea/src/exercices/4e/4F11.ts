import {
  addTraceurDeCourbe,
  type TraceurDeCourbeOptions,
} from '../../lib/customElements/TraceurDeCourbe'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Représenter l'expression d'une grandeur en fonction d'une autre par un graphique"
export const interactifReady = true
export const dateDePublication = '10/09/2026'
export const uuid = '2ecde'

export const refs = {
  'fr-fr': ['4F11'],
  'fr-ch': ['PRQPF04C-5'],
}

type Situation = {
  enonce: string
  formule: string
  variable: string
  intervalSubject: string
  rowLabels: [string, string]
  target: (x: number) => number
  pgfplotsExpression: string
  xMax: number
  columns: number
}

function getSituation(type: number): Situation {
  switch (type) {
    case 1:
      return {
        enonce:
          "Représenter l'aire d'un carré en fonction de la longueur de son côté.",
        formule: 'A(x)=x^2',
        variable: 'x',
        intervalSubject: 'des longueurs de côté',
        rowLabels: ['Longueur du côté (en cm)', 'Aire du carré (en cm²)'],
        target: (x) => x ** 2,
        pgfplotsExpression: 'x^2',
        xMax: 6,
        columns: 6,
      }
    case 2:
      return {
        enonce:
          'Le rectangle $ABCD$ vérifie $AB=3~\\text{cm}$. Représenter son aire en fonction de la longueur $BC$.',
        formule: 'A(x)=3x',
        variable: 'x=BC',
        intervalSubject: 'des longueurs $BC$',
        rowLabels: ['Longueur BC (en cm)', 'Aire du rectangle (en cm²)'],
        target: (x) => 3 * x,
        pgfplotsExpression: '3*x',
        xMax: 10,
        columns: 5,
      }
    case 3:
      return {
        enonce:
          "Représenter le périmètre d'un cercle en fonction de son rayon.",
        formule: 'P(r)=2\\pi r',
        variable: 'r',
        intervalSubject: 'des rayons',
        rowLabels: ['Rayon (en cm)', 'Périmètre (en cm)'],
        target: (x) => 2 * Math.PI * x,
        pgfplotsExpression: '2*pi*x',
        xMax: 6,
        columns: 5,
      }
    case 4:
      return {
        enonce:
          "Représenter le périmètre d'un cercle en fonction de son diamètre.",
        formule: 'P(d)=\\pi d',
        variable: 'd',
        intervalSubject: 'des diamètres',
        rowLabels: ['Diamètre (en cm)', 'Périmètre (en cm)'],
        target: (x) => Math.PI * x,
        pgfplotsExpression: 'pi*x',
        xMax: 10,
        columns: 5,
      }
    case 5:
      return {
        enonce: "Représenter l'aire d'un disque en fonction de son rayon.",
        formule: 'A(r)=\\pi r^2',
        variable: 'r',
        intervalSubject: 'des rayons',
        rowLabels: ['Rayon (en cm)', 'Aire du disque (en cm²)'],
        target: (x) => Math.PI * x ** 2,
        pgfplotsExpression: 'pi*x^2',
        xMax: 5,
        columns: 6,
      }
    default:
      return {
        enonce: "Représenter l'aire d'un disque en fonction de son diamètre.",
        formule: 'A(d)=\\dfrac{\\pi d^2}{4}',
        variable: 'd',
        intervalSubject: 'des diamètres',
        rowLabels: ['Diamètre (en cm)', 'Aire du disque (en cm²)'],
        target: (x) => (Math.PI * x ** 2) / 4,
        pgfplotsExpression: 'pi*x^2/4',
        xMax: 10,
        columns: 6,
      }
  }
}

/**
 * Construire la représentation graphique d'une grandeur géométrique.
 *
 * @author Jean-Claude Lhote
 */
export default class RepresenterGrandeurParGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne =
      'Choisir des valeurs adaptées, compléter le tableau, puis construire la représentation graphique.'
    this.sup = '7'
    this.sup2 = true
    this.besoinFormulaireTexte = [
      'Choix des situations (nombres séparés par des tirets)',
      "1 : Aire d'un carré\n2 : Aire d'un rectangle\n3 : Périmètre en fonction du rayon\n4 : Périmètre en fonction du diamètre\n5 : Aire en fonction du rayon\n6 : Aire en fonction du diamètre\n7 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Tracer la ligne brisée', true]
  }

  nouvelleVersion(): void {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const situation = getSituation(type)
      const options: TraceurDeCourbeOptions = {
        rowLabels: situation.rowLabels,
        columns: situation.columns,
        xMin: 0,
        xMax: situation.xMax,
        step: 0.05,
        epsilon: 0.05,
        maxRelativeAreaError: 0.18,
        target: situation.target,
        pgfplotsExpression: situation.pgfplotsExpression,
        interactivityOn: this.interactif,
        joinPoints: Boolean(this.sup2),
      }

      const texte = `${situation.enonce} Pour cette représentation, utiliser ${situation.intervalSubject} comprises entre $0~\\text{cm}$ et $${situation.xMax}~\\text{cm}$.<br><br>${addTraceurDeCourbe(this, i, options)}`
      const texteCorr = `La grandeur représentée est donnée par $${situation.formule}$, avec $${situation.variable}$ exprimé en centimètres. Une représentation correcte est obtenue en plaçant des points de cette courbe sur tout l'intervalle demandé.<br><br>$${miseEnEvidence(situation.formule)}$<br><br>${addTraceurDeCourbe(
        this,
        i,
        {
          ...options,
          id: `traceur-de-courbe-correctionEx${this.numeroExercice}Q${i}`,
          interactivityOn: false,
          showExpected: true,
          animateCorrection: true,
          functionLabel: situation.formule.split('=')[0],
          calculationExpression: situation.formule.split('=')[1],
        },
      )}`

      if (this.questionJamaisPosee(i, type)) {
        handleAnswers(
          this,
          i,
          { reponse: { value: situation.target } },
          { formatInteractif: 'traceur-de-courbe' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
