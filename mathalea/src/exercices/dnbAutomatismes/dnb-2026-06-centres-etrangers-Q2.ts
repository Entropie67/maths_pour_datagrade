import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPoint } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea02'
export const refs = {
  'fr-fr': ['3AutoG14-2'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = "Déterminer l'image d'un motif par une translation"
export const dateDePublication = '11/08/2026'

const positionsMotifs: Record<number, [number, number]> = {
  1: [2, 2],
  2: [3, 2],
  3: [4, 2],
  4: [1, 1],
  5: [2, 1],
  6: [3, 1],
  7: [0, 0],
  8: [1, 0],
  9: [2, 0],
}

const numeroMotif = (position: [number, number]) =>
  Object.entries(positionsMotifs).find(
    ([, [col, lig]]) => col === position[0] && lig === position[1],
  )?.[0]

const positionMotif = (numero: number) => {
  const position = positionsMotifs[numero]
  if (position == null) {
    throw Error(`Le motif n° ${numero} n'existe pas dans la grille.`)
  }
  return position
}

const figureMotifs = () => {
  const objets: NestedObjetMathalea2dArray = []
  const base: [number, number][] = [
    [0, 0],
    [0.7, 0.35],
    [1.1, 0],
    [1.8, 1],
    [1.4, 1.35],
    [0.7, 1],
  ]
  Object.entries(positionsMotifs).forEach(([numero, [col, lig]]) => {
    const dx = 1.15 * col - 0.45 * lig
    const dy = lig
    const motif = base.map(([x, y]) => pointAbstrait(x + dx, y + dy))
    objets.push(polygone(...motif))
    objets.push(
      texteParPoint(
        `n° ${numero}`,
        pointAbstrait(dx + 0.9, dy + 0.55),
        0,
        'black',
        1,
        'milieu',
      ),
    )
  })
  return mathalea2d(
    { ...fixeBordures(objets), scale: 0.75, pixelsParCm: 35 },
    objets,
  )
}

const choixAleatoire = (): [number, number, number] => {
  const numeros = Object.keys(positionsMotifs).map(Number)
  const possibilites: [number, number, number][] = []
  for (const depart of numeros) {
    for (const arrivee of numeros) {
      if (depart === arrivee) continue
      const [colDepart, ligDepart] = positionMotif(depart)
      const [colArrivee, ligArrivee] = positionMotif(arrivee)
      const deplacement: [number, number] = [
        colArrivee - colDepart,
        ligArrivee - ligDepart,
      ]
      for (const motif of numeros) {
        if (motif === depart) continue
        const [colMotif, ligMotif] = positionMotif(motif)
        const image = numeroMotif([
          colMotif + deplacement[0],
          ligMotif + deplacement[1],
        ])
        if (image != null) possibilites.push([depart, arrivee, motif])
      }
    }
  }
  return choice(possibilites)
}

const coordonneesVisuelles = (numero: number): [number, number] => {
  const [col, lig] = positionMotif(numero)
  return [col - lig, 2 - lig]
}

const descriptionDeplacement = (motifDepart: number, motifArrivee: number) => {
  const [colDepart, ligneDepart] = coordonneesVisuelles(motifDepart)
  const [colArrivee, ligneArrivee] = coordonneesVisuelles(motifArrivee)
  const deltaCol = colArrivee - colDepart
  const deltaLigne = ligneArrivee - ligneDepart
  const morceaux: string[] = []
  if (deltaCol !== 0) {
    morceaux.push(
      `$${Math.abs(deltaCol)}$ colonne${Math.abs(deltaCol) > 1 ? 's' : ''} vers ${deltaCol > 0 ? 'la droite' : 'la gauche'}`,
    )
  }
  if (deltaLigne !== 0) {
    morceaux.push(
      `$${Math.abs(deltaLigne)}$ ligne${Math.abs(deltaLigne) > 1 ? 's' : ''} vers ${deltaLigne > 0 ? 'le bas' : 'le haut'}`,
    )
  }
  return morceaux.length === 0 ? 'aucun déplacement' : morceaux.join(' et ')
}

/**
 * DNB Centres étrangers juin 2026 - Question 2
 * @author Jean-Claude Lhote
 */
export default class AutoQ2CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  enonce(
    motifDepart?: number,
    motifArrivee?: number,
    motifDontOnChercheImage?: number,
  ) {
    if (
      motifDepart == null ||
      motifArrivee == null ||
      motifDontOnChercheImage == null
    ) {
      const tirage = choixAleatoire()
      motifDepart = tirage[0]
      motifArrivee = tirage[1]
      motifDontOnChercheImage = tirage[2]
    }
    const [colDepart, ligDepart] = positionMotif(motifDepart)
    const [colArrivee, ligArrivee] = positionMotif(motifArrivee)
    const deplacement: [number, number] = [
      colArrivee - colDepart,
      ligArrivee - ligDepart,
    ]
    const [colMotif, ligMotif] = positionMotif(motifDontOnChercheImage)
    const image = numeroMotif([
      colMotif + deplacement[0],
      ligMotif + deplacement[1],
    ])
    if (image == null) {
      throw Error(
        `La translation choisie fait sortir le motif n° $${motifDontOnChercheImage}$ de la grille.`,
      )
    }
    this.question = `Quelle est l'image du motif n° $${motifDontOnChercheImage}$ par la translation qui transforme le motif n° $${motifDepart}$ en motif n° $${motifArrivee}$ ?<br>${figureMotifs()}`
    this.reponse = image
    this.correction = `La translation qui transforme le motif n° $${motifDepart}$ en motif n° $${motifArrivee}$ déplace un motif de ${descriptionDeplacement(motifDepart, motifArrivee)}.<br>
L'image du motif n° $${motifDontOnChercheImage}$ par cette translation est donc le motif n° $${miseEnEvidence(`${image}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(2, 6, 4)
    } else {
      this.enonce()
    }
  }
}
