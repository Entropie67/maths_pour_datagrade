import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Trouver une fraction à partir d'un dessin"
export const interactifReady = true

export const uuid = 'a3bc7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q14 extends ExerciceCan {
  enonce(nbColonnes?: number, nbCasesColorees?: number) {
    const nbLignes = 2 // Toujours 2 lignes

    if (nbColonnes == null || nbCasesColorees == null) {
      nbColonnes = randint(2, 4) // 2, 3 ou 4 colonnes (4, 6 ou 8 cases max)
      const nbCasesTotales = nbColonnes * nbLignes
      nbCasesColorees = randint(2, nbCasesTotales - 1)
    }

    const taille = 2
    const nbCasesTotales = nbColonnes * nbLignes

    // Créer le rectangle principal
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(nbColonnes * taille, 0)
    const C = pointAbstrait(nbColonnes * taille, nbLignes * taille)
    const D = pointAbstrait(0, nbLignes * taille)
    const rectangle = polygone([A, B, C, D], 'black')
    rectangle.epaisseur = 2

    // Créer les segments de séparation
    const segments = []

    // Lignes verticales
    for (let i = 1; i < nbColonnes; i++) {
      const s = segment(
        pointAbstrait(i * taille, 0),
        pointAbstrait(i * taille, nbLignes * taille),
      )
      s.epaisseur = 1
      segments.push(s)
    }

    // Ligne horizontale (une seule car 2 lignes)
    const s = segment(
      pointAbstrait(0, taille),
      pointAbstrait(nbColonnes * taille, taille),
    )
    s.epaisseur = 1
    segments.push(s)

    // Choisir les cases à colorier
    const casesColorees: number[] = []

    if (this.canOfficielle) {
      // Version officielle : rectangle 3x2
      // Numérotation (de bas en haut, de gauche à droite):
      // Ligne du bas (y=0 à y=2): 0, 1, 2
      // Ligne du haut (y=2 à y=4): 3, 4, 5
      // Cases à colorier: 0 (bas-gauche), 3 (haut-gauche), 4 (haut-milieu)
      casesColorees.push(0, 3, 4)
    } else {
      // Choisir une case de départ aléatoire
      const caseDepart = randint(0, nbCasesTotales - 1)
      casesColorees.push(caseDepart)

      // Ajouter des cases adjacentes
      const casesDisponibles = []
      for (let i = 0; i < nbCasesTotales; i++) {
        if (i !== caseDepart) casesDisponibles.push(i)
      }

      while (
        casesColorees.length < nbCasesColorees &&
        casesDisponibles.length > 0
      ) {
        // Trouver les cases adjacentes aux cases déjà coloriées
        const adjacentes: number[] = []
        for (const caseNum of casesDisponibles) {
          const col = caseNum % nbColonnes
          const lig = Math.floor(caseNum / nbColonnes)

          for (const caseColoree of casesColorees) {
            const colC = caseColoree % nbColonnes
            const ligC = Math.floor(caseColoree / nbColonnes)

            // Vérifier si adjacente (horizontalement ou verticalement)
            if (
              (Math.abs(col - colC) === 1 && lig === ligC) ||
              (Math.abs(lig - ligC) === 1 && col === colC)
            ) {
              if (!adjacentes.includes(caseNum)) {
                adjacentes.push(caseNum)
              }
            }
          }
        }

        // Si on a des cases adjacentes, en choisir une
        if (adjacentes.length > 0) {
          const choix = adjacentes[randint(0, adjacentes.length - 1)]
          casesColorees.push(choix)
          casesDisponibles.splice(casesDisponibles.indexOf(choix), 1)
        } else {
          // Sinon prendre n'importe quelle case disponible
          const choix =
            casesDisponibles[randint(0, casesDisponibles.length - 1)]
          casesColorees.push(choix)
          casesDisponibles.splice(casesDisponibles.indexOf(choix), 1)
        }
      }
    }

    // Créer les carrés colorés
    const carresColores: Polygone[] = []
    for (const numCase of casesColorees) {
      const col = numCase % nbColonnes
      const lig = Math.floor(numCase / nbColonnes)
      const carre = polygone([
        pointAbstrait(col * taille, lig * taille),
        pointAbstrait((col + 1) * taille, lig * taille),
        pointAbstrait((col + 1) * taille, (lig + 1) * taille),
        pointAbstrait(col * taille, (lig + 1) * taille),
      ])
      carre.couleurDeRemplissage = colorToLatexOrHTML('magenta')
      carre.couleurDesBords = 'none'
      carresColores.push(carre)
    }

    const objets = [...carresColores, rectangle, ...segments]

    const fraction = new FractionEtendue(nbCasesColorees, nbCasesTotales)
    const diviseur = pgcd(nbCasesColorees, nbCasesTotales)
    const numSimp = nbCasesColorees / diviseur
    const denSimp = nbCasesTotales / diviseur

    this.question = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.question += 'Quelle part est coloriée ?'

    this.reponse = fraction.texFractionSimplifiee

    if (context.isHtml) {
      this.correction = `Il y a $${nbCasesTotales}$ cases au total et $${nbCasesColorees}$ ${nbCasesColorees > 1 ? 'cases coloriées' : 'case coloriée'}.<br>`
      this.correction += `La fraction coloriée est donc $${miseEnEvidence(`\\dfrac{${nbCasesColorees}}{${nbCasesTotales}}`)}$`
      if (diviseur > 1) {
        this.correction += `$=${miseEnEvidence(`\\dfrac{${numSimp}}{${denSimp}}`)}$.`
      } else {
        this.correction += '.'
      }
    } else {
      this.correction = mathalea2d(
        Object.assign({ scale: 0.5 }, fixeBordures(objets)),
        objets,
      )
      this.correction += `<br>Il y a $${nbCasesTotales}$ cases au total et $${nbCasesColorees}$ ${nbCasesColorees > 1 ? 'cases coloriées' : 'case coloriée'}.<br>`
      this.correction += `La fraction coloriée est donc $${miseEnEvidence(`\\dfrac{${nbCasesColorees}}{${nbCasesTotales}}`)}$`
      if (diviseur > 1) {
        this.correction += `$=${miseEnEvidence(`\\dfrac{${numSimp}}{${denSimp}}`)}$.`
      } else {
        this.correction += '.'
      }
    }
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 3)
    else this.enonce()
  }
}
