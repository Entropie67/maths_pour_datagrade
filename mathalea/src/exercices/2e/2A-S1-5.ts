import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { latex2d } from '../../lib/2d/textes'
import { coopmathsAction } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = 'Interpréter une courbe des effectifs cumulés croissants'
export const dateDePublication = '06/08/2026'
export const dateDeModifImportante = '23/10/2026'

export const uuid = 'aa571'
export const refs = {
  'fr-fr': ['2A-S1-5', '1A-S01-7'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'

type Situation = {
  introduction: (effectifTotal: number) => string
  grandeur: string
  unite: string
  individus: string
  debut: number
  pas: number
}

const preposition = (individus: string): string =>
  /^[aeiouyéèêàâîïôûœ]/i.test(individus) ? "d'" : 'de '

type TypeAffirmation = 'mediane' | 'inferieur' | 'superieur'

/**
 * @author Stéphane Guyon
 */
export default class LireEffectifsCumules extends ExerciceQcmACourt {
  // Saisie libre : la grandeur correspondant à l'affirmation vraie du QCM
  private questionSaisie = ''
  private reponseSaisie = ''
  private correctionSaisie = ''

  private static readonly SITUATIONS: Situation[] = [
    {
      introduction: (n) => `On a mesuré la taille de $${n}$ élèves.`,
      grandeur: 'Taille',
      unite: 'cm',
      individus: 'élèves',
      debut: 140,
      pas: 5,
    },
    {
      introduction: (n) =>
        `On a relevé la durée du trajet domicile-lycée de $${n}$ élèves.`,
      grandeur: 'Durée',
      unite: 'min',
      individus: 'élèves',
      debut: 0,
      pas: 5,
    },
    {
      introduction: (n) => `On a contrôlé la masse de $${n}$ colis.`,
      grandeur: 'Masse',
      unite: 'g',
      individus: 'colis',
      debut: 400,
      pas: 50,
    },
  ]

  private construireGraphique(
    situation: Situation,
    abscisses: number[],
    effectifsCumules: number[],
  ): string {
    const effectifTotal = effectifsCumules.at(-1)!
    const [graduationPrincipale, graduationSecondaire] = {
      60: [15, 5],
      80: [20, 10],
      100: [25, 5],
    }[effectifTotal] ?? [10, 5]
    const uniteX = 8 / (abscisses.at(-1)! - abscisses[0])
    const uniteY = 6 / effectifTotal
    const points = abscisses.map((abscisse, index) =>
      pointAbstrait(abscisse * uniteX, effectifsCumules[index] * uniteY),
    )
    const courbe = polyline(points, coopmathsAction)
    courbe.epaisseur = 2

    const repere = new RepereBuilder({
      xMin: abscisses[0],
      xMax: abscisses.at(-1)!,
      yMin: 0,
      yMax: effectifTotal,
    })
      .setUniteX(uniteX)
      .setUniteY(uniteY)
      .setThickX({
        xMin: abscisses[0],
        xMax: abscisses.at(-1)!,
        dx: 2 * situation.pas,
      })
      .setThickY({ yMin: 0, yMax: effectifTotal, dy: graduationPrincipale })
      .setLabelX({
        xMin: abscisses[0],
        xMax: abscisses.at(-1)!,
        dx: 2 * situation.pas,
        xLabelEcart: 0.5,
      })
      .setLabelY({
        yMin: 0,
        yMax: effectifTotal,
        dy: graduationPrincipale,
        yLabelEcart: 0.7,
      })
      .setGrille({
        grilleX: { dx: 2 * situation.pas * uniteX },
        grilleY: { dy: graduationPrincipale * uniteY },
      })
      .setGrilleSecondaire({
        grilleX: { dx: situation.pas * uniteX },
        grilleY: { dy: graduationSecondaire * uniteY },
      })
      .buildCustom()

    const titreOrdonnees = latex2d(
      `\\text{Nombre ${preposition(situation.individus)}${situation.individus}}`,
      abscisses[0] * uniteX + 2,
      effectifTotal * uniteY + 0.55,
      { letterSize: 'scriptsize' },
    )
    const titreAbscisses = latex2d(
      `\\text{${situation.grandeur} (en ${situation.unite})}`,
      abscisses.at(-1)! * uniteX - 1.2,
      -0.9,
      { letterSize: 'scriptsize' },
    )
    const titreGraphique = latex2d(
      '\\text{Graphique des effectifs cumulés croissants}',
      ((abscisses[0] + abscisses.at(-1)!) / 2) * uniteX,
      effectifTotal * uniteY + 1.4,
      { letterSize: 'small' },
    )
    const objets = [
      repere,
      courbe,
      titreOrdonnees,
      titreAbscisses,
      titreGraphique,
    ]

    return mathalea2d(
      Object.assign(
        { pixelsParCm: 26, scale: 0.8 },
        fixeBordures(objets, {
          rxmin: 0.3,
          rymin: 0.3,
          rxmax: 0.3,
          rymax: 0.3,
        }),
      ),
      objets,
    )
  }

  private appliquerLesValeurs(): void {
    const situation = choice(LireEffectifsCumules.SITUATIONS)
    const typeBonneReponse = choice<TypeAffirmation>([
      'mediane',
      'inferieur',
      'superieur',
    ])
    const abscisses = Array.from(
      { length: 9 },
      (_, index) => situation.debut + index * situation.pas,
    )
    const effectifTotal = choice([60, 80, 100])
    const effectifsCumules = [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1].map(
      (proportion) => Math.round(proportion * effectifTotal),
    )
    const mediane = abscisses[4]
    const seuil = abscisses[6]
    const effectifInferieur = effectifsCumules[6]
    const effectifSuperieur = effectifTotal - effectifInferieur

    const affirmationsVraies: Record<TypeAffirmation, string> = {
      mediane: `La médiane est environ égale à $${mediane}\\,${situation.unite}$.`,
      inferieur: `$${effectifInferieur}$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} inférieure ou égale à $${seuil}\\,${situation.unite}$.`,
      superieur: `Moins de $${effectifTotal / 4}$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} strictement supérieure à $${seuil}\\,${situation.unite}$.`,
    }
    const affirmationsFausses: Record<TypeAffirmation, string> = {
      mediane: `La médiane est environ égale à $${mediane + 2 * situation.pas}\\,${situation.unite}$.`,
      inferieur: `$${Math.round(0.6 * effectifTotal)}$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} inférieure ou égale à $${seuil}\\,${situation.unite}$.`,
      superieur: `Moins de $${effectifTotal / 10}$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} strictement supérieure à $${seuil}\\,${situation.unite}$.`,
    }
    const autresTypes = (['mediane', 'inferieur', 'superieur'] as const).filter(
      (type) => type !== typeBonneReponse,
    )
    const affirmationsProposees: Record<TypeAffirmation, string> = {
      mediane:
        typeBonneReponse === 'mediane'
          ? affirmationsVraies.mediane
          : affirmationsFausses.mediane,
      inferieur:
        typeBonneReponse === 'inferieur'
          ? affirmationsVraies.inferieur
          : affirmationsFausses.inferieur,
      superieur:
        typeBonneReponse === 'superieur'
          ? affirmationsVraies.superieur
          : affirmationsFausses.superieur,
    }

    this.enonce = `${situation.introduction(effectifTotal)}<br>
    Le graphique des effectifs cumulés croissants est représenté ci-dessous.<br><br>
    ${this.construireGraphique(situation, abscisses, effectifsCumules)}<br>
    Quelle affirmation est vraie ?`

    const typesDansOrdre = [typeBonneReponse, ...autresTypes]
    this.reponses = [
      ...typesDansOrdre.map((type) => affirmationsProposees[type]),
      `L'effectif total est égal à $${abscisses.at(-1)}$.`,
    ]

    const justifications: Record<TypeAffirmation, string> = {
      mediane: `L'effectif de la série est $${effectifTotal}$, donc la médiane se lit à l'ordonnée $${effectifTotal / 2}$. On obtient environ $${mediane}\\,${situation.unite}$. Cette affirmation est donc ${texteGras(typeBonneReponse === 'mediane' ? 'vraie' : 'fausse')}.`,
      inferieur: `À l'abscisse $${seuil}\\,${situation.unite}$, on lit un effectif cumulé de $${effectifInferieur}$. Il y a donc $${effectifInferieur}$ ${situation.individus} dont la ${situation.grandeur.toLowerCase()} est inférieure ou égale à ce seuil. Cette affirmation est donc ${texteGras(typeBonneReponse === 'inferieur' ? 'vraie' : 'fausse')}.`,
      superieur: `On lit $${effectifInferieur}$ ${situation.individus} jusqu'au seuil inclus. Il y en a donc $${effectifTotal}-${effectifInferieur}=${effectifSuperieur}$ strictement au-dessus de ce seuil. Cette affirmation est donc ${texteGras(typeBonneReponse === 'superieur' ? 'vraie' : 'fausse')}.`,
    }
    this.corrections = [
      ...typesDansOrdre.map(
        (type) =>
          `«${sp()}${typeBonneReponse === type ? texteEnCouleurEtGras(affirmationsProposees[type]) : affirmationsProposees[type]}${sp()}»<br>${justifications[type]}`,
      ),
      `«${sp()}L'effectif total est égal à $${abscisses.at(-1)}$.${sp()}»<br>
      On lit sur l'axe des ordonnées que l'effectif de la série est $${effectifTotal}$, et non $${abscisses.at(-1)}$. Cette affirmation est donc ${texteGras('fausse')}.`,
    ]
    this.correction = ''

    const individus = situation.individus
    const de = preposition(individus)
    const grandeur = situation.grandeur.toLowerCase()
    const unite = situation.unite
    const saisies: Record<
      TypeAffirmation,
      { question: string; reponse: number; apres: string; correction: string }
    > = {
      mediane: {
        question: 'Lire graphiquement la médiane de cette série.',
        reponse: mediane,
        apres: ` ${unite}`,
        correction: `L'effectif de la série est $${effectifTotal}$, donc la médiane se lit à l'ordonnée $${effectifTotal / 2}$. On obtient $${miseEnEvidence(mediane)}\\,\\text{${unite}}$.`,
      },
      inferieur: {
        question: `Déterminer le nombre ${de}${individus} dont la ${grandeur} est inférieure ou égale à $${seuil}\\,\\text{${unite}}$.`,
        reponse: effectifInferieur,
        apres: '',
        correction: `À l'abscisse $${seuil}\\,\\text{${unite}}$, on lit un effectif cumulé de $${miseEnEvidence(effectifInferieur)}$.`,
      },
      superieur: {
        question: `Déterminer le nombre ${de}${individus} dont la ${grandeur} est strictement supérieure à $${seuil}\\,\\text{${unite}}$.`,
        reponse: effectifSuperieur,
        apres: '',
        correction: `À l'abscisse $${seuil}\\,\\text{${unite}}$, on lit un effectif cumulé de $${effectifInferieur}$, c'est-à-dire que $${effectifInferieur}$ ${individus} ont une ${grandeur} inférieure ou égale à ce seuil. Il y en a donc $${effectifTotal}-${effectifInferieur}=${miseEnEvidence(effectifSuperieur)}$ dont la ${grandeur} est strictement supérieure à $${seuil}\\,\\text{${unite}}$.`,
      },
    }
    const saisie = saisies[typeBonneReponse]
    this.questionSaisie = saisie.question
    this.reponseSaisie = String(saisie.reponse)
    this.correctionSaisie = saisie.correction
    this.texteApresReponseCourte = saisie.apres
  }

  versionAleatoire: () => void = () => {
    this.appliquerLesValeurs()
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.enonceCourt = () =>
      this.enonce.replace(
        /Quelle affirmation est vraie \?\s*$/,
        this.questionSaisie,
      )
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.options.vertical = true
    this.versionAleatoire()
  }
}
