// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 76b4a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { latex2d } from '../../lib/2d/textes'
import { coopmathsAction } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Interpréter une courbe des effectifs cumulés croissants'
export const dateDePublication = '06/08/2026'
export const uuid = '76b4a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

type Situation = {
  introduction: string
  grandeur: string
  unite: string
  individus: string
  debut: number
  pas: number
}

type TypeAffirmation = 'mediane' | 'inferieur' | 'superieur'

/**
 * @author Stéphane Guyon
 */
export default class LireEffectifsCumulesOld extends ExerciceQcmA {
  private static readonly SITUATIONS: Situation[] = [
    {
      introduction: 'On a mesuré la taille de $50$ élèves.',
      grandeur: 'Taille',
      unite: 'cm',
      individus: 'élèves',
      debut: 140,
      pas: 5,
    },
    {
      introduction:
        'On a relevé la durée du trajet domicile-lycée de $50$ élèves.',
      grandeur: 'Durée',
      unite: 'min',
      individus: 'élèves',
      debut: 0,
      pas: 5,
    },
    {
      introduction: 'On a contrôlé la masse de $50$ colis.',
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
    const uniteX = 8 / (abscisses.at(-1)! - abscisses[0])
    const uniteY = 0.12
    const points = abscisses.map((abscisse, index) =>
      pointAbstrait(abscisse * uniteX, effectifsCumules[index] * uniteY),
    )
    const courbe = polyline(points, coopmathsAction)
    courbe.epaisseur = 2

    const repere = new RepereBuilder({
      xMin: abscisses[0],
      xMax: abscisses.at(-1)!,
      yMin: 0,
      yMax: 50,
    })
      .setUniteX(uniteX)
      .setUniteY(uniteY)
      .setThickX({
        xMin: abscisses[0],
        xMax: abscisses.at(-1)!,
        dx: 2 * situation.pas,
      })
      .setThickY({ yMin: 0, yMax: 50, dy: 10 })
      .setLabelX({
        xMin: abscisses[0],
        xMax: abscisses.at(-1)!,
        dx: 2 * situation.pas,
        xLabelEcart: 0.5,
      })
      .setLabelY({ yMin: 0, yMax: 50, dy: 10, yLabelEcart: 0.7 })
      .setGrille({
        grilleX: { dx: 2 * situation.pas * uniteX },
        grilleY: { dy: 10 * uniteY },
      })
      .setGrilleSecondaire({
        grilleX: { dx: situation.pas * uniteX },
        grilleY: { dy: 5 * uniteY },
      })
      .buildCustom()

    const titreOrdonnees = latex2d(
      '\\text{Effectif cumulé croissant}',
      abscisses[0] * uniteX + 2,
      50 * uniteY + 0.55,
      { letterSize: 'scriptsize' },
    )
    const titreAbscisses = latex2d(
      `\\text{${situation.grandeur} (en ${situation.unite})}`,
      abscisses.at(-1)! * uniteX - 1.2,
      -0.9,
      { letterSize: 'scriptsize' },
    )
    const objets = [repere, courbe, titreOrdonnees, titreAbscisses]

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
    const situation = choice(LireEffectifsCumulesOld.SITUATIONS)
    const typeBonneReponse = choice<TypeAffirmation>([
      'mediane',
      'inferieur',
      'superieur',
    ])
    const abscisses = Array.from(
      { length: 9 },
      (_, index) => situation.debut + index * situation.pas,
    )
    const effectifsCumules = [0, 4, 10, 18, 25, 34, 42, 48, 50]
    const mediane = abscisses[4]
    const seuil = abscisses[6]
    const effectifInferieur = effectifsCumules[6]
    const effectifSuperieur = 50 - effectifInferieur

    const affirmationsVraies: Record<TypeAffirmation, string> = {
      mediane: `La médiane est environ égale à $${mediane}\\,${situation.unite}$.`,
      inferieur: `$${effectifInferieur}$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} inférieure ou égale à $${seuil}\\,${situation.unite}$.`,
      superieur: `Moins de $10$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} strictement supérieure à $${seuil}\\,${situation.unite}$.`,
    }
    const affirmationsFausses: Record<TypeAffirmation, string> = {
      mediane: `La médiane est environ égale à $${mediane + 2 * situation.pas}\\,${situation.unite}$.`,
      inferieur: `$35$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} inférieure ou égale à $${seuil}\\,${situation.unite}$.`,
      superieur: `Moins de $5$ ${situation.individus} ont une ${situation.grandeur.toLowerCase()} strictement supérieure à $${seuil}\\,${situation.unite}$.`,
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

    this.enonce = `${situation.introduction}<br>
    La courbe des effectifs cumulés croissants est représentée ci-dessous.<br><br>
    ${this.construireGraphique(situation, abscisses, effectifsCumules)}<br>
    Quelle affirmation est vraie ?`

    const typesDansOrdre = [typeBonneReponse, ...autresTypes]
    this.reponses = [
      ...typesDansOrdre.map((type) => affirmationsProposees[type]),
      `L'effectif total est égal à $${abscisses.at(-1)}$.`,
    ]

    const justifications: Record<TypeAffirmation, string> = {
      mediane: `L'effectif de la série est $50$, donc la médiane se lit à l'ordonnée $25$. On obtient environ $${mediane}\\,${situation.unite}$. Cette affirmation est donc ${texteGras(typeBonneReponse === 'mediane' ? 'vraie' : 'fausse')}.`,
      inferieur: `À l'abscisse $${seuil}\\,${situation.unite}$, on lit un effectif cumulé de $${effectifInferieur}$. Il y a donc $${effectifInferieur}$ ${situation.individus} dont la ${situation.grandeur.toLowerCase()} est inférieure ou égale à ce seuil. Cette affirmation est donc ${texteGras(typeBonneReponse === 'inferieur' ? 'vraie' : 'fausse')}.`,
      superieur: `On lit $${effectifInferieur}$ ${situation.individus} jusqu'au seuil inclus. Il y en a donc $50-${effectifInferieur}=${effectifSuperieur}$ strictement au-dessus de ce seuil. Cette affirmation est donc ${texteGras(typeBonneReponse === 'superieur' ? 'vraie' : 'fausse')}.`,
    }
    this.corrections = [
      ...typesDansOrdre.map(
        (type) =>
          `« ${typeBonneReponse === type ? texteEnCouleurEtGras(affirmationsProposees[type]) : affirmationsProposees[type]} »<br>${justifications[type]}`,
      ),
      `« L'effectif total est égal à $${abscisses.at(-1)}$. »<br>
      On lit sur l'axe des ordonnées que l'effectif de la série est $50$, et non $${abscisses.at(-1)}$. Cette affirmation est donc ${texteGras('fausse')}.`,
    ]
    this.correction = ''
  }

  versionAleatoire: () => void = () => {
    this.appliquerLesValeurs()
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
