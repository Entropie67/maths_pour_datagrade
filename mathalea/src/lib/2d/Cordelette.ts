import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import MainLevee from './MainLevee'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, type PointAbstrait } from './PointAbstrait'

export class Cordelette extends ObjetMathalea2D {
  amplitude: number
  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    amplitude = 1,
    mollesse = 0.5,
    color = 'black',
  ) {
    super()
    this.typeObjet = 'cordelette'
    this.A = A
    this.B = B
    this.tailleExtremites = 0
    this.color = colorToLatexOrHTML(color)
    this.amplitude = amplitude
    this.bordures = [
      Math.min(A.x, B.x),
      Math.min(A.y, B.y),
      Math.max(A.x, B.x),
      Math.max(A.y, B.y),
    ]
  }

  svg(coeff: number) {
    const mainLevee = MainLevee.create()
    if (mainLevee != null) {
      const A = this.A
      const B = this.B

      // Calcul de la distance entre A et B
      const distance = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)

      // Nombre de points intermédiaires basé sur la distance
      // Plus la distance est grande, plus on a de points (environ 1 point tous les 0.5 unités)
      const nbPointsIntermediaires = Math.max(2, Math.floor(distance / 0.2))

      // Génération des points de la cordelette
      const points = this.genererPointsCordelette(A, B, nbPointsIntermediaires)

      // Conversion en coordonnées SVG
      const pointsSVG = points.map((point) => [
        point.x * coeff,
        -point.y * coeff,
      ]) as [number, number][]

      const code = mainLevee.curve(pointsSVG, {
        color: this.color[0],
        epaisseur: this.epaisseur,
        roughness: this.amplitude * 0.5, // Réduire la roughness car on a déjà le décalage
        bowing: 1, // Réduire le bowing aussi
      })

      mainLevee.destroy()
      return code
    } else return ''
  }

  /**
   * Génère des points intermédiaires décalés pour simuler une cordelette
   */
  private genererPointsCordelette(
    A: PointAbstrait,
    B: PointAbstrait,
    nbPoints: number,
  ) {
    const points = [A] // Commence par le point A

    // Vecteur directeur AB
    const vecteurAB = { x: B.x - A.x, y: B.y - A.y }
    // Vecteur perpendiculaire (pour les décalages)
    const vecteurPerp = { x: -vecteurAB.y, y: vecteurAB.x }
    // Normalisation du vecteur perpendiculaire
    const normePerp = Math.sqrt(vecteurPerp.x ** 2 + vecteurPerp.y ** 2)
    if (normePerp > 0) {
      vecteurPerp.x /= normePerp
      vecteurPerp.y /= normePerp
    }

    // Distance entre A et B
    const longueurAB = Math.sqrt(vecteurAB.x ** 2 + vecteurAB.y ** 2)

    // Génération d'une fonction de décalage continue basée sur plusieurs sinusoïdes
    // pour créer un aspect naturel mais lisse
    const frequence1 = 1 // Oscillation principale
    const frequence2 = 2.3 // Oscillation secondaire (nombre premier pour éviter la périodicité)
    const frequence3 = 3.7 // Oscillation tertiaire

    // Amplitudes relatives
    const amp1 = 1
    const amp2 = 0.6
    const amp3 = 0.3

    // Seed pour la reproductibilité (basé sur les coordonnées des points)
    const seed = (A.x + A.y + B.x + B.y) * 1000

    // Fonction de décalage continue
    const calculerDecalage = (t: number): number => {
      // Facteur d'atténuation aux extrémités (forme en cloche)
      const facteurExtremites = Math.sin(t * Math.PI)

      // Combinaison de plusieurs sinusoïdes avec phases différentes
      const phase1 = seed * 0.001
      const phase2 = seed * 0.0013
      const phase3 = seed * 0.0017

      const decalage =
        amp1 * Math.sin(t * Math.PI * frequence1 + phase1) +
        amp2 * Math.sin(t * Math.PI * frequence2 + phase2) +
        amp3 * Math.sin(t * Math.PI * frequence3 + phase3)

      return decalage * facteurExtremites
    }

    // Génération des points intermédiaires
    for (let i = 1; i < nbPoints; i++) {
      const t = i / nbPoints // Paramètre entre 0 et 1

      // Point sur le segment AB
      const pointSurSegment = {
        x: A.x + t * vecteurAB.x,
        y: A.y + t * vecteurAB.y,
      }

      // Amplitude du décalage basée sur la longueur et l'amplitude fournie
      const amplitudeDecalage = this.amplitude * 0.05 * longueurAB

      // Décalage continu et lisse
      const decalage = calculerDecalage(t) * amplitudeDecalage

      // Effet de gravité (la cordelette "tombe" naturellement)
      const decalageGravite =
        Math.sin(t * Math.PI) * this.amplitude * 0.02 * longueurAB

      // Point final décalé
      const pointDecale = pointAbstrait(
        pointSurSegment.x + decalage * vecteurPerp.x,
        pointSurSegment.y + decalage * vecteurPerp.y - decalageGravite,
      )

      points.push(pointDecale)
    }

    points.push(B) // Termine par le point B
    return points
  }

  tikz() {
    const A = this.A
    const B = this.B

    // Calcul de la distance entre A et B
    const distance = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)

    // Nombre de points intermédiaires basé sur la distance
    const nbPointsIntermediaires = Math.max(2, Math.floor(distance / 0.2))

    // Génération des points de la cordelette
    const points = this.genererPointsCordelette(A, B, nbPointsIntermediaires)

    // Construction des options TikZ
    const tableauOptions = []

    // Gestion de la couleur (utilise this.color[1] qui est le nom de couleur LaTeX)
    if (this.color[1] !== 'black') {
      tableauOptions.push(this.color[1])
    }

    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width=${this.epaisseur}`)
    }

    if (this.opacite !== 1) {
      tableauOptions.push(`opacity=${this.opacite}`)
    }

    const optionsDraw =
      tableauOptions.length > 0 ? `[${tableauOptions.join(', ')}]` : ''

    // Construction du path avec courbes lisses (sans décorateur conflictuel)
    const coordonnees = points
      .map((point) => `(${point.x.toFixed(3)},${point.y.toFixed(3)})`)
      .join(' ')

    return `\\draw${optionsDraw} plot[smooth] coordinates {${coordonnees}};`
  }
}

export function cordelette(
  A: PointAbstrait,
  B: PointAbstrait,
  amplitude = 1,
  mollesse = 0.5,
  color = 'black',
) {
  return new Cordelette(A, B, amplitude, mollesse, color)
}
