import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  dents,
  tireDeuxRoues,
  type Train,
  tours,
} from '../../lib/outils/engrenages'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import ExerciceEngrenages, { type CasEngrenage } from '../ExerciceEngrenages'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const titre = 'Résoudre des problèmes avec des engrenages'
export const dateDePublication = '05/10/2022'
export const dateDeModifImportante = '11/10/2026'

/**
 * Calculer le nombre de dents ou de tours d'une roue d'un engrenage de deux roues
 * en utilisant que les deux roues font défiler le même nombre de dents.
 * @author Rémi Angot
 */
export const uuid = '8fd48'

export const refs = {
  'fr-fr': ['3A12'],
  'fr-ch': ['9R2NO1H-9', '9R3NO1H-9', '10CTNO1B-9', 'PRQNO09C-9', 'PRQNO15B-2', 'PRQNO15C-2'],
}

type Variante = (train: Train) => Omit<CasEngrenage, 'train' | 'signature'>

const PRINCIPE =
  'Les deux roues font défiler le même nombre de dents : le nombre de dents multiplié par le nombre de tours est le même pour chaque roue.<br>'

const NOTE_DESSIN = " Le dessin n'est pas représentatif."

/** Le dessin de l'énoncé ne doit pas permettre de compter les dents de la roue cherchée. */
function dentsLeurre(vraiNombre: number, autreRoue: number) {
  const leurre = vraiNombre > 16 ? vraiNombre - 5 : vraiNombre + 5
  return leurre === autreRoue ? leurre + 1 : leurre
}

const nombreDeDentsParTours: Variante = ({
  dents: [a, b],
  cycle,
  tours: [ta, tb],
}) => ({
  introduction: `La roue de gauche possède ${dents(a)}. Quand elle effectue ${tours(ta)}, la roue de droite en effectue ${tours(tb)}.${NOTE_DESSIN}`,
  dentsDessinees: [a, dentsLeurre(b, a)],
  questions: ['Combien de dents la roue de droite possède-t-elle ?'],
  reponses: [b],
  correction:
    PRINCIPE +
    `La roue de gauche tourne de $${ta}\\times${a}=${cycle}$ dents.<br>` +
    `Soit $n$ le nombre de dents de la roue de droite : $n\\times${tb}=${cycle}$, donc $n=\\dfrac{${cycle}}{${tb}}=${b}$.<br>` +
    `La roue de droite possède $${miseEnEvidence(b)}$ dents.`,
})

const nombreDeDentsParDentsTournees: Variante = ({
  dents: [a, b],
  cycle,
  tours: [ta, tb],
}) => ({
  introduction: `La roue de gauche possède ${dents(a)} et tourne de ${dents(cycle)}. Pendant ce temps, la roue de droite effectue ${tours(tb)}.${NOTE_DESSIN}`,
  dentsDessinees: [a, dentsLeurre(b, a)],
  questions: ['Combien de dents la roue de droite possède-t-elle ?'],
  reponses: [b],
  correction:
    PRINCIPE +
    `La roue de gauche tourne de $${cycle}$ dents en ${tours(ta)}.<br>` +
    `Soit $n$ le nombre de dents de la roue de droite : $n\\times${tb}=${cycle}$, donc $n=\\dfrac{${cycle}}{${tb}}=${b}$.<br>` +
    `La roue de droite possède $${miseEnEvidence(b)}$ dents.`,
})

const nombreDeToursParDentsTournees: Variante = ({
  dents: [a, b],
  cycle,
  tours: [ta, tb],
}) => ({
  introduction: `La roue de gauche possède ${dents(a)} et celle de droite ${dents(b)}. La roue de gauche tourne de ${dents(cycle)}.`,
  questions: [
    'Combien de tours la roue de droite effectue-t-elle pendant ce temps ?',
  ],
  reponses: [tb],
  correction:
    PRINCIPE +
    `La roue de droite tourne aussi de $${cycle}$ dents.<br>` +
    `Soit $n$ son nombre de tours : $n\\times${b}=${cycle}$, donc $n=\\dfrac{${cycle}}{${b}}=${tb}$.<br>` +
    `La roue de droite effectue $${miseEnEvidence(tb)}$ tours pendant que celle de gauche en effectue $${ta}$.`,
})

const VARIANTES = [
  nombreDeDentsParTours,
  nombreDeDentsParDentsTournees,
  nombreDeToursParDentsTournees,
]

export default class EngrenagesDeuxRoues extends ExerciceEngrenages {
  declare sup: string
  declare sup2: boolean
  private variantes: number[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '4'
    this.sup2 = false
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Nombre de dents (avec le nombre de tours)\n2 : Nombre de dents (avec le nombre de dents tournées)\n3 : Nombre de tours à droite (avec le nombre de dents tournées)\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      "Arrêt de l'animation après un cycle lors de la correction",
    ]
  }

  protected get animationUnCycle() {
    return this.sup2
  }

  protected prepare() {
    this.variantes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)
  }

  protected nouveauCas(i: number): CasEngrenage {
    const train = tireDeuxRoues()
    const variante = this.variantes[i]
    return {
      train,
      ...VARIANTES[variante - 1](train),
      signature: [variante, ...train.dents],
    }
  }
}
