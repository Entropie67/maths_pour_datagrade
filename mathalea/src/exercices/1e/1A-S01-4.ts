import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import {
  DiagrammeCirculaire,
  diagrammeCirculaire,
} from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { latex2d } from '../../lib/2d/textes'
import { coopmathsAction, coopmathsStruct } from '../../lib/colors'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '0cfa9'
export const refs = {
  'fr-fr': ['1A-S01-4', '2A-S1-4'],
  'fr-ch': ['9R1FA2B-11', '9R2FA2B-11', '9R3FA2B-11'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Interpréter un diagramme circulaire avec des angles'
export const dateDePublication = '05/07/2026'

type ChoixOrientation = {
  nom: string
  angle: number
  effectif: number
}

/**
 * @author Stéphane Guyon
 */
export default class ChoixTerminaleDiagrammeCirculaireQCM extends ExerciceQcmA {
  private construireDiagramme(choixTerminale: ChoixOrientation[]): string {
    const rayon = 3.2
    const diag: DiagrammeCirculaire = diagrammeCirculaire({
      effectifs: choixTerminale.map(({ angle }) => angle),
      labels: choixTerminale.map(({ nom }) => nom),
      rayon,
      legendeAffichage: true,
      legendePosition: 'droite',
      visibles: Array(choixTerminale.length).fill(true),
      remplissage: Array(choixTerminale.length).fill(true),
    })
    const couleurs = [
      coopmathsAction,
      '#8DD7F7',
      coopmathsStruct,
      '#14415C',
    ].map(colorToLatexOrHTML)
    const objetsDiagramme = diag.objets as Array<{
      couleurDeRemplissage?: [string, string]
      couleurDesHachures?: [string, string]
      hachures?: boolean | string
    }>
    objetsDiagramme.forEach((objet) => {
      if (objet.hachures === '') objet.hachures = false
      if (objet.couleurDesHachures == null) {
        objet.couleurDesHachures = colorToLatexOrHTML('none')
      }
    })
    couleurs.forEach((couleur, index) => {
      const secteur = objetsDiagramme[1 + index]
      const carreLegende =
        objetsDiagramme[1 + choixTerminale.length + 2 * index]
      if (secteur != null) secteur.couleurDeRemplissage = couleur
      if (carreLegende != null) carreLegende.couleurDeRemplissage = couleur
    })
    let angleDepart = 0
    const labelsAngles = choixTerminale.map(({ angle }) => {
      const angleMilieu = angleDepart + angle / 2
      angleDepart += angle
      const angleRad = (angleMilieu * Math.PI) / 180
      return latex2d(
        `${texNombre(angle, 0)}^\\circ`,
        rayon + 0.6 * rayon * Math.cos(angleRad),
        rayon + 0.6 * rayon * Math.sin(angleRad),
        { letterSize: 'footnotesize' },
      )
    })
    const objets = [diag, ...labelsAngles]

    return mathalea2d(
      Object.assign(
        {
          display: 'block',
          pixelsParCm: 18,
          scale: 0.55,
        } as const,
        fixeBordures(objets, { rxmin: 0, rymin: 0, rxmax: 0, rymax: 0 }),
      ),
      objets,
    )
  }

  private construireAffirmation(nom: string, effectif: number): string {
    return `$${texNombre(effectif, 0)}$ élèves choisissent «${sp()}${nom}${sp()}».`
  }

  private construireDistracteur(
    { nom, angle, effectif }: ChoixOrientation,
    total: number,
    typeErreur: 'angle' | 'demi' | 'sur180',
  ) {
    const fauxEffectif =
      typeErreur === 'angle'
        ? angle
        : typeErreur === 'sur180'
          ? (angle * total) / 180
          : effectif / 2
    return this.construireAffirmation(nom, fauxEffectif)
  }

  private appliquerLesValeurs(): void {
    const total = choice([24, 48, 72, 96, 120])
    const angleArret = choice([30, 45])
    const angles = [
      angleArret,
      ...(angleArret === 30
        ? shuffle([90, 120, 120])
        : shuffle([75, 120, 120])),
    ]
    const choixTerminale = [
      {
        nom: 'arrêt des maths',
        angle: angles[0],
      },
      {
        nom: 'maths complémentaires',
        angle: angles[1],
      },
      {
        nom: 'spé maths',
        angle: angles[2],
      },
      {
        nom: 'spé maths avec maths expertes',
        angle: angles[3],
      },
    ].map((choix) => ({
      ...choix,
      effectif: (choix.angle * total) / 360,
    }))
    const choixCorrect = choice(choixTerminale)
    const choixDistracteurs = choixTerminale.filter(
      (choix) => choix !== choixCorrect,
    )
    const indexDemi = Math.max(
      0,
      choixDistracteurs.findIndex(({ effectif }) => effectif % 2 === 0),
    )
    const autresErreurs = shuffle(['angle', 'sur180'] as const)
    const typesErreurs = choixDistracteurs.map((_, index) =>
      index === indexDemi ? 'demi' : (autresErreurs.shift() ?? 'angle'),
    )
    const reponses = [
      this.construireAffirmation(choixCorrect.nom, choixCorrect.effectif),
      ...choixDistracteurs.map((choix, index) =>
        this.construireDistracteur(choix, total, typesErreurs[index]),
      ),
    ]
    const lignesCorrection = choixTerminale
      .map(
        ({ nom, angle, effectif }) =>
          `Pour «${sp()}${nom}${sp()}», l'effectif vaut $\\dfrac{${angle}}{360}\\times ${total}=${texNombre(effectif, 0)}$.`,
      )
      .join('<br>')
    const effectifCorrect = texNombre(choixCorrect.effectif, 0)

    this.enonce = `Une enquête est menée auprès de $${total}$ élèves de première spécialité mathématiques sur leur choix pour la terminale.<br>
    Le diagramme circulaire ci-dessous donne la répartition des réponses, avec les angles des secteurs.<br><br>
    ${this.construireDiagramme(choixTerminale)}<br>
    Quelle affirmation est vraie ?`

    this.reponses = reponses

    this.correction = `Dans un diagramme circulaire, l'effectif d'une catégorie se calcule avec la formule :<br>
    $\\dfrac{\\text{angle du secteur}}{360}\\times \\text{effectif total}$.<br>
    Ici, l'effectif total est $${total}$.<br>
    ${lignesCorrection}<br>
    La bonne affirmation est donc : $${miseEnEvidence(effectifCorrect)}$ ${texteEnCouleurEtGras(`élèves choisissent «${sp()}${choixCorrect.nom}${sp()}»`)}.`
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
