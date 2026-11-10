import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { creerSerieDeQuartiles } from '../../modules/outilsStat'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '0cd7a'
export const refs = {
  'fr-fr': ['1A-S03-4', '2A-S3-4'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer deux séries à partir de diagrammes en boîte'
export const dateDePublication = '06/08/2026'

type Resume = {
  min: number
  q1: number
  mediane: number
  q3: number
  max: number
}

type Cas = {
  serie1: Resume
  serie2: Resume
  bonneAffirmation: number
}

type Affirmation = {
  texte: string
  correction: string
}

/**
 * @author Stéphane Guyon
 */
export default class ComparerDeuxBoitesMoustaches extends ExerciceQcmA {
  private construireBoite(
    resume: Resume,
    ordonnee: number,
    axeMin: number,
    pas: number,
  ): ObjetMathalea2D[] {
    const x = (valeur: number) => (valeur - axeMin) / pas
    const demiHauteur = 0.35
    const minBas = pointAbstrait(x(resume.min), ordonnee - demiHauteur)
    const minHaut = pointAbstrait(x(resume.min), ordonnee + demiHauteur)
    const maxBas = pointAbstrait(x(resume.max), ordonnee - demiHauteur)
    const maxHaut = pointAbstrait(x(resume.max), ordonnee + demiHauteur)
    const q1Bas = pointAbstrait(x(resume.q1), ordonnee - demiHauteur)
    const q1Haut = pointAbstrait(x(resume.q1), ordonnee + demiHauteur)
    const q3Bas = pointAbstrait(x(resume.q3), ordonnee - demiHauteur)
    const q3Haut = pointAbstrait(x(resume.q3), ordonnee + demiHauteur)
    const medianeBas = pointAbstrait(x(resume.mediane), ordonnee - demiHauteur)
    const medianeHaut = pointAbstrait(x(resume.mediane), ordonnee + demiHauteur)

    const boite = polygone([q1Bas, q1Haut, q3Haut, q3Bas], bleuMathalea)
    boite.epaisseur = 2
    boite.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
    boite.opaciteDeRemplissage = 0.2

    const objets: ObjetMathalea2D[] = [
      boite,
      segment(minBas, minHaut, bleuMathalea),
      segment(maxBas, maxHaut, bleuMathalea),
      segment(
        pointAbstrait(x(resume.min), ordonnee),
        pointAbstrait(x(resume.q1), ordonnee),
        bleuMathalea,
      ),
      segment(
        pointAbstrait(x(resume.q3), ordonnee),
        pointAbstrait(x(resume.max), ordonnee),
        bleuMathalea,
      ),
      segment(medianeBas, medianeHaut, 'red'),
    ]
    for (const objet of objets.slice(1)) objet.epaisseur = 2
    return objets
  }

  private appliquerTransformation(
    resume: Resume,
    a: number,
    b: number,
  ): Resume {
    return {
      min: a * resume.min + b,
      q1: a * resume.q1 + b,
      mediane: a * resume.mediane + b,
      q3: a * resume.q3 + b,
      max: a * resume.max + b,
    }
  }

  private appliquerLesValeurs(cas: Cas): void {
    const coefficient = choice([1, 2])
    const translation = randint(-3, 6)
    const donnees1 = this.appliquerTransformation(
      cas.serie1,
      coefficient,
      translation,
    )
    const donnees2 = this.appliquerTransformation(
      cas.serie2,
      coefficient,
      translation,
    )

    const serie1 = creerSerieDeQuartiles({ ...donnees1, n: 40 })
    const serie2 = creerSerieDeQuartiles({ ...donnees2, n: 40 })
    const boite1 = new Stat(serie1).boiteAMoustache()
    const boite2 = new Stat(serie2).boiteAMoustache()
    const resume1: Resume = {
      min: boite1.min,
      q1: boite1.q1,
      mediane: boite1.q2,
      q3: boite1.q3,
      max: boite1.max,
    }
    const resume2: Resume = {
      min: boite2.min,
      q1: boite2.q1,
      mediane: boite2.q2,
      q3: boite2.q3,
      max: boite2.max,
    }

    const pas = 2 * coefficient
    const minimum = Math.min(resume1.min, resume2.min)
    const maximum = Math.max(resume1.max, resume2.max)
    const axeMin = pas * Math.floor(minimum / pas) - pas
    const axeMax = pas * Math.ceil(maximum / pas) + pas
    const largeur = (axeMax - axeMin) / pas
    const axe = repere({
      xMin: 0,
      xMax: largeur,
      yMin: 0,
      yMax: 4,
      xThickDistance: 1,
      xLabelListe: Array.from({ length: largeur + 1 }, (_, index) => ({
        valeur: index,
        texte: `${axeMin + pas * index}`,
      })),
      labelsYareVisible: false,
      grilleX: false,
      grilleY: false,
    })
    const objets = [
      axe,
      ...this.construireBoite(resume1, 3, axeMin, pas),
      ...this.construireBoite(resume2, 1.5, axeMin, pas),
      texteParPosition('Série 1', -1.2, 3, 0, 'black', 1),
      texteParPosition('Série 2', -1.2, 1.5, 0, 'black', 1),
    ]
    const figure = mathalea2d(
      {
        xmin: -2.2,
        xmax: largeur + 1,
        ymin: -1,
        ymax: 4.2,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      objets,
    )

    const affirmations = [
      `Environ $75\\,\\%$ des valeurs de la série $2$ sont inférieures ou égales à la médiane de la série $1$.`,
      `Environ $75\\,\\%$ des valeurs de la série $1$ sont supérieures ou égales à la médiane de la série $2$.`,
      `Au moins une valeur de la série $2$ est strictement inférieure à toutes les valeurs de la série $1$.`,
      `Au moins une valeur de la série $1$ est strictement supérieure à toutes les valeurs de la série $2$.`,
    ]
    const estVraie = (index: number) =>
      index === cas.bonneAffirmation ? texteGras('vraie') : texteGras('fausse')
    const affirmation = (i: number) =>
      estVraie(i).includes('fausse')
        ? affirmations[i]
        : texteEnCouleurEtGras(affirmations[i])
    const propositions: Affirmation[] = [
      {
        texte: affirmations[0],
        correction: `«${sp()}${affirmation(0)}${sp()}» <br>Le troisième quartile de la série $2$ vaut $${resume2.q3}$ et la médiane de la série $1$ vaut $${resume1.mediane}$. Cette affirmation est donc ${estVraie(0)}.`,
      },
      {
        texte: affirmations[1],
        correction: `«${sp()}${affirmation(1)}${sp()}» <br>Le premier quartile de la série $1$ vaut $${resume1.q1}$ et la médiane de la série $2$ vaut $${resume2.mediane}$. Cette affirmation est donc ${estVraie(1)}.`,
      },
      {
        texte: affirmations[2],
        correction: `«${sp()}${affirmation(2)}${sp()}» <br>Le minimum de la série $2$ vaut $${resume2.min}$ et celui de la série $1$ vaut $${resume1.min}$. Cette affirmation est donc ${estVraie(2)}.`,
      },
      {
        texte: affirmations[3],
        correction: `«${sp()}${affirmation(3)}${sp()}» <br>Le maximum de la série $1$ vaut $${resume1.max}$ et celui de la série $2$ vaut $${resume2.max}$. Cette affirmation est donc ${estVraie(3)}.`,
      },
    ]
    const bonneProposition = propositions[cas.bonneAffirmation]
    const mauvaisesPropositions = propositions.filter(
      (_, index) => index !== cas.bonneAffirmation,
    )
    const propositionsQcu = [bonneProposition, ...mauvaisesPropositions]
    this.reponses = propositionsQcu.map(({ texte }) => texte)
    this.corrections = propositionsQcu.map(({ correction }) => correction)
    this.bonnesReponses = undefined
    this.enonce = `On donne les diagrammes en boîte de deux séries statistiques.<br>
      ${figure}<br>
      On peut affirmer que :`
    this.correction = ''
  }

  versionAleatoire: () => void = () => {
    const cas: Cas[] = [
      {
        serie1: { min: 4, q1: 8, mediane: 12, q3: 15, max: 18 },
        serie2: { min: 5, q1: 7, mediane: 10, q3: 12, max: 20 },
        bonneAffirmation: 0,
      },
      {
        serie1: { min: 4, q1: 10, mediane: 13, q3: 16, max: 18 },
        serie2: { min: 5, q1: 7, mediane: 10, q3: 14, max: 20 },
        bonneAffirmation: 1,
      },
      {
        serie1: { min: 5, q1: 9, mediane: 12, q3: 15, max: 18 },
        serie2: { min: 3, q1: 7, mediane: 10, q3: 14, max: 20 },
        bonneAffirmation: 2,
      },
      {
        serie1: { min: 3, q1: 8, mediane: 12, q3: 16, max: 20 },
        serie2: { min: 5, q1: 7, mediane: 10, q3: 14, max: 18 },
        bonneAffirmation: 3,
      },
    ]
    this.appliquerLesValeurs(choice(cas))
  }

  constructor() {
    super()
    this.options = { vertical: true, radio: true }
    this.versionAleatoire()
  }
}
