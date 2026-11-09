import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { sp } from '../../lib/outils/outilString'

export const dateDeModifImportante = '23/10/2026'

export const uuid = 'dd385'
export const refs = {
  'fr-fr': ['1A-S01-8'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Analyser une série en boîte à moustaches'
export const dateDePublication = '20/08/2026'
/**
 * @author Jean-claude Lhote
 */

/** Grandeur que la saisie libre demande, selon l'affirmation vraie du QCM. */
type CibleSaisie = 'mediane' | 'min' | 'etendue' | 'q1' | 'q3'

type TypeProduction = 'pommes' | 'lait' | 'ble' | 'oeufs'

type Production = {
  nom: string
  unite: string
  min: number
  max: number
  pas: number
}

type ResumeSerie = {
  min: number
  q1: number
  mediane: number
  q3: number
  max: number
  pas: number
}

const productions: Record<TypeProduction, Production> = {
  pommes: {
    nom: 'pommes par arbre',
    unite: 'kg',
    min: 20,
    max: 120,
    pas: 5,
  },
  lait: {
    nom: 'lait par vache',
    unite: 'L',
    min: 5_000,
    max: 9_000,
    pas: 300,
  },
  ble: {
    nom: 'blé par hectare',
    unite: 'kg',
    min: 4_000,
    max: 10_000,
    pas: 500,
  },
  oeufs: {
    nom: 'œufs par poule',
    unite: 'œufs',
    min: 180,
    max: 320,
    pas: 10,
  },
}

const multipleDe = (valeur: number, pas: number) => valeur * pas

const valeurAvecUnite = (valeur: number, unite: string) =>
  `$${texNombre(valeur, 0)}\\text{ ${unite}}$`

function valeurAleatoireEntre(min: number, max: number, pas: number): number {
  if (min > max) return min
  return multipleDe(randint(Math.ceil(min / pas), Math.floor(max / pas)), pas)
}

function valeursAleatoiresTriees({
  min,
  max,
  pas,
  effectif,
}: {
  min: number
  max: number
  pas: number
  effectif: number
}): number[] {
  return Array.from({ length: effectif }, () =>
    valeurAleatoireEntre(min, max, pas),
  ).sort((a, b) => a - b)
}

function construireSerieDeResume({
  min,
  q1,
  mediane,
  q3,
  max,
  pas,
}: ResumeSerie): number[] {
  return [
    min,
    ...valeursAleatoiresTriees({ min, max: q1, pas, effectif: 8 }),
    q1,
    q1,
    ...valeursAleatoiresTriees({ min: q1, max: mediane, pas, effectif: 8 }),
    mediane,
    mediane,
    ...valeursAleatoiresTriees({ min: mediane, max: q3, pas, effectif: 8 }),
    q3,
    q3,
    ...valeursAleatoiresTriees({ min: q3, max, pas, effectif: 8 }),
    max,
  ]
}

function genererSerieProduction(typeProduction: TypeProduction): number[] {
  const production = productions[typeProduction]
  const min = multipleDe(
    randint(
      Math.ceil(production.min / production.pas),
      Math.floor((production.min + 2 * production.pas) / production.pas),
    ),
    production.pas,
  )
  const q1 = multipleDe(
    randint(
      min / production.pas + 1,
      Math.floor((production.min + 5 * production.pas) / production.pas),
    ),
    production.pas,
  )
  const mediane = multipleDe(
    randint(
      q1 / production.pas + 1,
      Math.floor((production.max - 4 * production.pas) / production.pas),
    ),
    production.pas,
  )
  const q3 = multipleDe(
    randint(
      mediane / production.pas + 1,
      Math.floor((production.max - production.pas) / production.pas),
    ),
    production.pas,
  )
  const max = multipleDe(
    randint(q3 / production.pas + 1, production.max / production.pas),
    production.pas,
  )

  return construireSerieDeResume({
    min,
    q1,
    mediane,
    q3,
    max,
    pas: production.pas,
  })
}

export default class LAnalyserMoustachesQCM extends ExerciceQcmACourt {
  // Saisie libre : la grandeur correspondant à l'affirmation vraie du QCM
  private questionSaisie = ''
  private reponseSaisie = ''
  private correctionSaisie = ''

  /** Question, réponse et correction de la saisie libre, sans nouveau tirage aléatoire. */
  private preparerLaSaisie(
    maSerie: Stat,
    unite: string,
    cible: CibleSaisie,
  ): void {
    const quartiles = maSerie.quartiles()
    const min = maSerie.min()
    const max = maSerie.max()
    const valeurs: Record<CibleSaisie, number> = {
      mediane: maSerie.mediane(),
      min,
      etendue: max - min,
      q1: quartiles.q1,
      q3: quartiles.q3,
    }
    const questions: Record<CibleSaisie, string> = {
      mediane: 'la médiane',
      min: 'le minimum',
      etendue: "l'étendue",
      q1: 'le premier quartile',
      q3: 'le troisième quartile',
    }
    const valeur = miseEnEvidence(texNombre(valeurs[cible], 0))
    const lectures: Record<CibleSaisie, string> = {
      mediane: `La médiane se lit au niveau du trait intermédiaire de la boîte : $${valeur}\\text{ ${unite}}$.`,
      min: `Le minimum se lit à l'extrémité gauche de la moustache : $${valeur}\\text{ ${unite}}$.`,
      etendue: `L'étendue est la différence entre le maximum et le minimum :<br>$${texNombre(max, 0)}-${texNombre(min, 0)}=${valeur}\\text{ ${unite}}$.`,
      q1: `Le premier quartile se lit au bord gauche de la boîte : $${valeur}\\text{ ${unite}}$.`,
      q3: `Le troisième quartile se lit au bord droit de la boîte : $${valeur}\\text{ ${unite}}$.`,
    }
    this.questionSaisie = `Déterminer ${questions[cible]} de cette série.`
    this.reponseSaisie = String(valeurs[cible])
    this.correctionSaisie = lectures[cible]
    this.texteApresReponseCourte = ` ${unite}`
  }

  private appliquerLesValeurs(
    serie: number[],
    production: Pick<Production, 'nom' | 'unite'>,
    props: string[],
    cible: CibleSaisie,
  ): void {
    const maSerie = new Stat(serie)
    const quartiles = maSerie.quartiles()
    const moustache = maSerie.traceBoiteAMoustache({
      size: 10,
      height: 4,
      legendeOn: false,
      valeursOn: true,
      echelle: 1,
    })

    // Réorganiser les réponses pour mettre la bonne en premier
    this.reponses = props
    this.enonce = `Le diagramme en boîte ci-dessous illustre la production annuelle de ${production.nom} (en ${production.unite}) dans une certaine région.<br>
    Parmi les affirmations suivantes, laquelle est vraie ?<br>
    ${moustache}`

    this.preparerLaSaisie(maSerie, production.unite, cible)

    // Correction : la valeur utile à l'affirmation vraie est mise en évidence,
    // l'affirmation elle-même est en couleur et en gras.
    const grandeurs: Record<Exclude<CibleSaisie, 'etendue'>, number> = {
      mediane: maSerie.mediane(),
      min: maSerie.min(),
      q1: quartiles.q1,
      q3: quartiles.q3,
    }
    const valeurCorrection = (cleValeur: keyof typeof grandeurs): string => {
      const texte = texNombre(grandeurs[cleValeur], 0)
      return cleValeur === cible ? miseEnEvidence(texte) : texte
    }
    const etendue = maSerie.max() - maSerie.min()
    this.correction = `La médiane de cette série est $${valeurCorrection('mediane')}$.<br>
    Cela signifie qu'au moins la moitié des valeurs de la série sont inférieures ou égales à $${valeurCorrection('mediane')}\\text{ ${production.unite}}$.<br>
    Le minimum est $${valeurCorrection('min')}\\text{ ${production.unite}}$, le premier quartile est $${valeurCorrection('q1')}\\text{ ${production.unite}}$, le troisième quartile est $${valeurCorrection('q3')}\\text{ ${production.unite}}$ et le maximum est $${texNombre(maSerie.max(), 0)}\\text{ ${production.unite}}$.<br>
    ${cible === 'etendue' ? `L'étendue est la différence entre le maximum et le minimum : $${texNombre(maSerie.max(), 0)}-${texNombre(maSerie.min(), 0)}=${miseEnEvidence(texNombre(etendue, 0))}\\text{ ${production.unite}}$.<br>` : ''}
    L'affirmation vraie est donc : «${sp()}${texteEnCouleurEtGras(props[0])}${sp()}».`
  }

  versionOriginale: () => void = () => {
    const maSerie = construireSerieDeResume({
      min: 17,
      max: 29,
      q1: 20,
      mediane: 21,
      q3: 25,
      pas: 1,
    })
    const props = [
      'Au moins la moitié des ruches a fourni moins de $21\\text{ kg}$ de miel.',
      'Une seule ruche a fourni $29\\text{ kg}$ de miel.',
      'Le tiers des ruches a fourni entre $25\\text{ kg}$ et $29\\text{ kg}$ de miel.',
    ]
    this.appliquerLesValeurs(
      maSerie,
      { nom: 'miel par ruche', unite: 'kg' },
      props,
      'mediane',
    )
  }

  versionAleatoire: () => void = () => {
    const n = 3 // Nombre de réponses différentes souhaitées
    do {
      const typeProduction = choice([
        'pommes',
        'lait',
        'ble',
        'oeufs',
      ] as TypeProduction[])
      const production = productions[typeProduction]
      const maSerie = genererSerieProduction(typeProduction)
      const stat = new Stat(maSerie)
      const quartiles = stat.quartiles()
      const min = stat.min()
      const max = stat.max()
      const mediane = stat.mediane()
      const etendue = max - min
      const q1 = quartiles.q1
      const q3 = quartiles.q3
      const ensembles = [
        [
          `Au moins la moitié des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(mediane, production.unite)}.`,
          `La production annuelle minimale est de ${valeurAvecUnite(q1, production.unite)}.`,
          `Au moins $75\\,\\%$ des productions annuelles sont supérieures ou égales à ${valeurAvecUnite(q3, production.unite)}.`,
        ],
        [
          `La production annuelle minimale est de ${valeurAvecUnite(min, production.unite)}.`,
          `La production annuelle maximale est de ${valeurAvecUnite(q3, production.unite)}.`,
          `L'étendue de la série est de ${valeurAvecUnite(max, production.unite)}.`,
        ],
        [
          `L'étendue de la série est de ${valeurAvecUnite(etendue, production.unite)}.`,
          `L'écart interquartile est de ${valeurAvecUnite(etendue, production.unite)}.`,
          `La médiane est égale à ${valeurAvecUnite(q1, production.unite)}.`,
        ],
        [
          `Au moins $25\\,\\%$ des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(q1, production.unite)}.`,
          `Au moins $50\\,\\%$ des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(q1, production.unite)}.`,
          `Au moins $75\\,\\%$ des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(q1, production.unite)}.`,
        ],
        [
          `Au moins $75\\,\\%$ des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(q3, production.unite)}.`,
          `Au moins $75\\,\\%$ des productions annuelles sont inférieures ou égales à ${valeurAvecUnite(q1, production.unite)}.`,
          `Au moins $50\\,\\%$ des productions annuelles sont supérieures ou égales à ${valeurAvecUnite(q3, production.unite)}.`,
        ],
      ]
      const props = choice(ensembles)
      // L'affirmation vraie de chaque ensemble porte sur une grandeur de la série
      const cibles: CibleSaisie[] = ['mediane', 'min', 'etendue', 'q1', 'q3']
      this.appliquerLesValeurs(
        maSerie,
        production,
        props,
        cibles[ensembles.indexOf(props)],
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.enonceCourt = () =>
      this.enonce.replace(
        /Parmi les affirmations suivantes, laquelle est vraie \?<br>/,
        `${this.questionSaisie}<br>`,
      )
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.options.vertical = true
    this.versionAleatoire()
  }
}
