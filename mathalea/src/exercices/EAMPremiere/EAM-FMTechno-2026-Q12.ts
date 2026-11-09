import { arc } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { texteParPosition } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'a2b75'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver un pourcentage à partir d'un diagramme circulaire"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ12FMt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    valBerlines: number,
    valMonospaces: number,
    valCabriolets: number,
    valToutTerrain: number,
    distracteurs: string[],
  ): void {
    const proportions = [
      valBerlines,
      valMonospaces,
      valCabriolets,
      valToutTerrain,
    ]
    const labels = ['Berlines', 'Monospaces', 'Cabriolets', 'Tout terrain']

    // --- CRÉATION MANUELLE DU DIAGRAMME ET DE LA LÉGENDE ---
    const objets2d = []
    const centre = pointAbstrait(0, 0)
    const rayon = 3.5
    let alpha = 90 // On commence à tracer à partir du haut (90 degrés)

    // Définition des nuances de gris via l'opacité (de 10% à 70%)
    const opacites = [0.1, 0.3, 0.5, 0.7]

    for (let i = 0; i < 4; i++) {
      const angle = (proportions[i] / 100) * 360
      const p1 = rotation(pointAbstrait(rayon, 0), centre, alpha)

      // 1. Tracé de la part du gâteau
      const secteur = arc(p1, centre, angle, true, 'black', 'black')
      secteur.opaciteDeRemplissage = opacites[i]
      objets2d.push(secteur)

      // 2. Tracé du petit carré de légende (placé à droite du cercle)
      const pt1 = pointAbstrait(5, 2 - i * 1.5)
      const pt2 = pointAbstrait(6, 2 - i * 1.5)
      const carreLegende = carre(pt1, pt2, 'black')

      // On utilise la fonction de conversion pour satisfaire TypeScript
      carreLegende.couleurDeRemplissage = colorToLatexOrHTML('black')
      carreLegende.opaciteDeRemplissage = opacites[i]

      objets2d.push(carreLegende)

      // 3. Tracé du texte à côté du carré
      const texteLegende = texteParPosition(
        labels[i],
        6.5,
        2.5 - i * 1.5,
        0,
        'black',
        1.2,
        'gauche',
      )
      objets2d.push(texteLegende)

      alpha += angle // On avance l'angle pour la part suivante
    }

    // On englobe le tout en s'assurant que rxmax va jusqu'à 13 pour inclure la légende
    const figure = mathalea2d(
      Object.assign(
        {
          display: 'block',
          center: !context.isHtml,
          pixelsParCm: 20,
          scale: 0.5,
        } as const,
        fixeBordures(objets2d, { rxmin: 0, rymin: 0, rxmax: 0, rymax: 0 }),
      ),
      objets2d,
    )
    // -------------------------------------------------------------

    this.enonce = `Le diagramme ci-dessous donne la répartition des ventes d'un concessionnaire automobile.<br><br>`
    this.enonce += figure
    this.enonce += `Quel pourcentage des ventes représentent les véhicules cabriolets ?`

    this.correction = `Par simple lecture visuelle du diagramme circulaire, on peut procéder par élimination :<br>`
    this.correction += `$\\bullet$ Les ${texteGras('Berlines')} occupent exactement la moitié du disque, soit $50 \\,\\%$.<br>`
    this.correction += `$\\bullet$ Les ${texteGras('Monospaces')} occupent un quart du disque (angle droit), soit $25\\, \\%$.<br>`
    this.correction += `$\\bullet$ Il reste donc $25 \\,\\%$ pour les deux dernières catégories réunies.<br>`
    this.correction += `$\\bullet$ Le secteur des ${texteGras('Cabriolets')} est visiblement plus grand que celui des ${texteGras('Tout terrain')}. Il représente donc plus de la moitié de ces $25\\,\\%$, c'est-à-dire plus de $12,5\\,\\%$.<br><br>`
    this.correction += `Parmi les propositions données, seule la valeur de $${miseEnEvidence(`${valCabriolets}\\,\\%`)}$ est cohérente avec cette observation (les autres valeurs étant soit trop petites, soit supérieures au quart restant du disque).`

    this.reponses = [`$${valCabriolets}\\,\\%$`, ...distracteurs]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(50, 25, 18, 7, [
      '$52\\,\\%$',
      '$12\\,\\%$',
      '$30\\,\\%$',
    ])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    let numEssais = 0
    do {
      numEssais++

      const valBerlines = 50
      const valMonospaces = 25
      const valCabriolets = 14 + Math.floor(Math.random() * 6)
      const valToutTerrain = 25 - valCabriolets

      const dist1 = `${valBerlines + Math.floor(Math.random() * 5) - 2}\\,\\%`
      const dist2 = `${Math.floor(25 / 2) - Math.floor(Math.random() * 3)}\\,\\%`
      const dist3 = `${valMonospaces + Math.floor(Math.random() * 7) + 2}\\,\\%`

      this.appliquerLesValeurs(
        valBerlines,
        valMonospaces,
        valCabriolets,
        valToutTerrain,
        [`$${dist1}$`, `$${dist2}$`, `$${dist3}$`],
      )
      compteur++
    } while (
      compteur < 100 &&
      numEssais < 500 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true)
    )
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Quel pourcentage des ventes représentent les véhicules cabriolets \?\s*$/,
        this.interactif
          ? 'À $2\\,\\%$ près, les véhicules cabriolets représentent '
          : 'Estimer, à $2\\,\\%$ près, le pourcentage des ventes que représentent les véhicules cabriolets.',
      )
    // La bonne réponse du QCM est de la forme « $18 \%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$(\d+).*$/, (_, nombre: string) => nombre)
    this.correctionCourte = () => {
      const valeur = Number(this.reponses[0].replace(/^\$(\d+).*$/, '$1'))
      const correction = this.correction ?? ''
      return `${correction.slice(0, correction.indexOf('Parmi les propositions données'))}Le secteur des cabriolets représente donc environ $${miseEnEvidence(String(valeur))}\\,\\%$ des ventes (toute valeur comprise entre $${valeur - 2}\\,\\%$ et $${valeur + 2}\\,\\%$ est acceptée).`
    }
    // Le diagramme n'est pas gradué : la réponse est une estimation, acceptée à 2 % près
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(
        saisie,
        `[${Number(reponse) - 2};${Number(reponse) + 2}]`,
        { estDecimalDansIntervalle: true },
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' % des ventes.'
  }
}
