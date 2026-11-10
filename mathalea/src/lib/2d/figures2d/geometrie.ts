import { bleuMathalea } from '../../../lib/colors'
import { Figure2D } from '../Figures2D'
import { pointAbstrait } from '../PointAbstrait'
import { segment } from '../segmentsVecteurs'

/**
 * Génère une figure représentant une étoile à 5 branches.
 * @param options Options pour personnaliser le style de l'étoile.
 * @param options.opacite Opacité de la figure (par défaut 1).
 * @returns Une instance de Figure2D représentant une étoile à 5 branches.
 */
export function etoile5Branches(options?: {
  fillStyle?: string // Couleur de remplissage de l'étoile (par défaut jaune)
  strokeStyle?: string // Couleur de la bordure de l'étoile (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayonExterieur?: number // Rayon des pointes de l'étoile (par défaut 1)
  rayonInterieur?: number // Rayon des creux de l'étoile (par défaut 0.5)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'lime'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayonExterieur = options?.rayonExterieur || 1
  const rayonInterieur = options?.rayonInterieur || 0.5
  const opacite = options?.opacite || 1

  // Calcul des points de l'étoile
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const rayon = i % 2 === 0 ? rayonExterieur * 20 : rayonInterieur * 20
    return `${rayon * Math.cos(angle)},${rayon * Math.sin(angle)}`
  }).join(' ')

  // Génération du code SVG
  const codeSvg = `
      <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    `.trim()

  // Génération du code TikZ
  const tikzPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const rayon = i % 2 === 0 ? rayonExterieur : rayonInterieur
    return `(${rayon * Math.cos(angle)},-${rayon * Math.sin(angle)})`
  }).join(' -- ')
  const codeTikz = `
    % Étoile à 5 branches
      \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
    `.trim()
  const axes = [0, 72, 144, 216, 288]
    .map((a) => a + 90)
    .map((angle) =>
      segment(
        -Math.cos((angle * Math.PI) / 180) * rayonExterieur,
        -Math.sin((angle * Math.PI) / 180) * rayonExterieur,
        Math.cos((angle * Math.PI) / 180) * rayonExterieur,
        Math.sin((angle * Math.PI) / 180) * rayonExterieur,
      ),
    )

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayonExterieur * 2,
    height: rayonExterieur * 2,
    axes,
    opacite,
  })
}

/**
 * Génère une figure représentant un pentagone régulier.
 * @param options Options pour personnaliser le style du pentagone.
 * @returns Une instance de Figure2D représentant un pentagone régulier.
 * @author Jean-claude Lhote
 */
export function pentagoneRegulier(options?: {
  fillStyle?: string // Couleur de remplissage du pentagone (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure du pentagone (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayon?: number // Rayon du pentagone (par défaut 3)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || bleuMathalea
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayon = options?.rayon || 2
  const opacite = options?.opacite || 1

  // Calcul des points du pentagone
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = ((2 * Math.PI) / 5) * i - Math.PI / 2
    return `${rayon * 20 * Math.cos(angle)},${rayon * 20 * Math.sin(angle)}`
  }).join(' ')

  // Génération du code SVG
  const codeSvg = `
            <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
        `.trim()

  // Génération du code TikZ
  const tikzPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = ((2 * Math.PI) / 5) * i - Math.PI / 2
    return `(${rayon * Math.cos(angle)},${-rayon * Math.sin(angle)})`
  }).join(' -- ')
  const codeTikz = `
            % Pentagone régulier
            \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
        `.trim()
  const axes = [0, 72, 144, 216, 288]
    .map((a) => a + 90)
    .map((angle) =>
      segment(
        -Math.cos((angle * Math.PI) / 180) * rayon * 1.1,
        -Math.sin((angle * Math.PI) / 180) * rayon * 1.1,
        Math.cos((angle * Math.PI) / 180) * rayon * 1.1,
        Math.sin((angle * Math.PI) / 180) * rayon * 1.1,
      ),
    )

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayon * 2,
    height: rayon * 2,
    axes,
    opacite,
  })
}

/**
 * Génère une figure représentant un cerf-volant (quadrilatère avec deux paires de côtés adjacents égaux).
 * @param options Options pour personnaliser le style du cerf-volant.
 * @returns Une instance de Figure2D représentant un cerf-volant.
 * @author Jean-claude Lhote
 */
export function cerfVolant(options?: {
  fillStyle?: string // Couleur de remplissage du cerf-volant (par défaut vert)
  strokeStyle?: string // Couleur de la bordure du cerf-volant (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur du cerf-volant (par défaut 2)
  hauteur?: number // Hauteur du cerf-volant (par défaut 3)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'green'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const largeur = options?.largeur || 1
  const hauteur = options?.hauteur || 1.5
  const opacite = options?.opacite || 1

  // Calcul des points du cerf-volant
  const points = [
    `0,${-hauteur * 10}`, // Sommet supérieur
    `${largeur * 10},${-hauteur * 7}`, // Coin droit
    `0,${hauteur * 10}`, // Sommet inférieur
    `${-largeur * 10},${-hauteur * 7}`, // Coin gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
            <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
        `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(0,${hauteur / 2})`, // Sommet supérieur
    `(${largeur},${hauteur * 0.35})`, // Coin droit
    `(0,${-hauteur / 2})`, // Sommet inférieur
    `(${-largeur},${hauteur * 0.35})`, // Coin gauche
  ].join(' -- ')
  const codeTikz = `
            % Cerf-volant
            \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
        `.trim()
  const axes = [segment(0, -hauteur * 0.6, 0, hauteur * 0.6)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur * 2,
    height: hauteur,
    axes,
    opacite,
  })
}

/**
 * Génère une figure représentant une aile delta (triangle isocèle).
 * @param options Options pour personnaliser le style de l'aile delta.
 * @returns Une instance de Figure2D représentant une aile delta.
 * @author Jean-claude Lhote
 */
export function aileDelta(options?: {
  fillStyle?: string // Couleur de remplissage de l'aile delta (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure de l'aile delta (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base de l'aile delta (par défaut 3)
  hauteur?: number // Hauteur de l'aile delta (par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'yellow'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 1.5
  const hauteur = options?.hauteur || 2
  const opacite = options?.opacite || 1

  // Calcul des points de l'aile delta
  const points = [
    `0,${-hauteur * 10}`, // Sommet supérieur
    `${base * 10},${hauteur * 10}`, // Coin droit
    `0,${hauteur * 5}`, // Sommet inférieur
    `${-base * 10},${hauteur * 10}`, // Coin gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
                        <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
                `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(0,${hauteur / 2})`, // Sommet supérieur
    `(${base / 2},${-hauteur / 2})`, // Coin droit
    `(0,${-hauteur / 4})`, // Sommet inférieur
    `(${-base / 2},${-hauteur / 2})`, // Coin gauche
  ].join(' -- ')
  const codeTikz = `
    % Aile delta
                        \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
                `.trim()
  const axes = [segment(0, -hauteur * 0.6, 0, hauteur * 0.7)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base,
    height: hauteur,
    axes,
    opacite,
  })
}

/**
 * Génère une figure représentant un trapèze isocèle.
 * @param options Options pour personnaliser le style du trapèze isocèle.
 * @returns Une instance de Figure2D représentant un trapèze isocèle.
 * @author Jean-claude Lhote
 */
export function trapezeIsocele(options?: {
  fillStyle?: string // Couleur de remplissage du trapèze (par défaut violet)
  strokeStyle?: string // Couleur de la bordure du trapèze (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  baseSuperieure?: number // Longueur de la base supérieure (par défaut 2)
  baseInferieure?: number // Longueur de la base inférieure (par défaut 4)
  hauteur?: number // Hauteur du trapèze (par défaut 2.5)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'pink'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const baseSuperieure = options?.baseSuperieure || 1
  const baseInferieure = options?.baseInferieure || 2
  const hauteur = options?.hauteur || 1.25
  const opacite = options?.opacite || 1

  // Calcul des points du trapèze
  const points = [
    `${-baseInferieure * 10},${hauteur * 10}`, // Coin inférieur gauche
    `${baseInferieure * 10},${hauteur * 10}`, // Coin inférieur droit
    `${baseSuperieure * 10},${-hauteur * 10}`, // Coin supérieur droit
    `${-baseSuperieure * 10},${-hauteur * 10}`, // Coin supérieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
        <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(${-baseInferieure / 2},${-hauteur / 2})`, // Coin inférieur gauche
    `(${baseInferieure / 2},${-hauteur / 2})`, // Coin inférieur droit
    `(${baseSuperieure / 2},${hauteur / 2})`, // Coin supérieur droit
    `(${-baseSuperieure / 2},${hauteur / 2})`, // Coin supérieur gauche
  ].join(' -- ')
  const codeTikz = `
    % Trapèze isocèle
        \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
    `.trim()
  const axes = [segment(0, -hauteur * 0.6, 0, hauteur * 0.6)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: baseInferieure,
    height: hauteur,
    axes,
    opacite,
  })
}

/**
 * Génère une figure représentant un hexagone non régulier avec 2 axes de symétrie perpendiculaires.
 * @param options Options pour personnaliser le style de l'hexagone.
 * @returns Une instance de Figure2D représentant un hexagone non régulier.
 * @author Jean-Claude
 */
export function hexagoneNonRegulier(options?: {
  fillStyle?: string // Couleur de remplissage de l'hexagone (par défaut orange)
  strokeStyle?: string // Couleur de la bordure de l'hexagone (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayonHorizontal?: number // Rayon horizontal (par défaut 1.5)
  rayonVertical?: number // Rayon vertical (par défaut 1)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'orange'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayonHorizontal = options?.rayonHorizontal || 1.5
  const rayonVertical = options?.rayonVertical || 1
  const opacite = options?.opacite || 1

  // Calcul des points de l'hexagone
  const points = [
    `${-rayonHorizontal * 10},${-rayonVertical * 20}`, // Sommet supérieur gauche
    `${rayonHorizontal * 10},${-rayonVertical * 20}`, // Sommet supérieur droit
    `${rayonHorizontal * 20},0`, // Coin droit
    `${rayonHorizontal * 10},${rayonVertical * 20}`, // Sommet inférieur droit
    `${-rayonHorizontal * 10},${rayonVertical * 20}`, // Sommet inférieur gauche
    `${-rayonHorizontal * 20},0`, // Coin gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
                <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
        `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(${-rayonHorizontal / 2},${rayonVertical})`, // Sommet supérieur gauche
    `(${rayonHorizontal / 2},${rayonVertical})`, // Sommet supérieur droit
    `(${rayonHorizontal},0)`, // Coin droit
    `(${rayonHorizontal / 2},${-rayonVertical})`, // Sommet inférieur droit
    `(${-rayonHorizontal / 2},${-rayonVertical})`, // Sommet inférieur gauche
    `(${-rayonHorizontal},0)`, // Coin gauche
  ].join(' -- ')
  const codeTikz = `
        % Hexagone non régulier
                \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
        `.trim()
  const axes = [
    segment(0, -rayonVertical * 1.2, 0, rayonVertical * 1.2),
    segment(-rayonHorizontal * 1.2, 0, rayonHorizontal * 1.2, 0),
  ]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayonHorizontal * 2,
    height: rayonVertical * 2,
    axes,
    centre: pointAbstrait(0, 0),
    opacite,
  })
}
/**
 * Génère une figure représentant un triangle quelconque.
 * @param options Options pour personnaliser le style du triangle.
 * @returns Une instance de Figure2D représentant un triangle quelconque.
 * @author Jean-claude Lhote
 */
export function triangleQuelconque1(options?: {
  fillStyle?: string // Couleur de remplissage du triangle (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure du triangle (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base du triangle (par défaut 3)
  hauteur?: number // Hauteur du triangle (par défaut 3.5)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'teal'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 2
  const hauteur = options?.hauteur || 2
  const opacite = options?.opacite || 1
  // Calcul des points du triangle
  const points = [
    `${-base * 10 - 5},${-hauteur * 8}`, // Sommet supérieur
    `${base * 10 + 5},${hauteur * 10}`, // Coin inférieur droit
    `${-base * 10},${hauteur * 10}`, // Coin inférieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
            <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
        `.trim()
  // Génération du code TikZ
  const tikzPoints = [
    `(${-base / 2 - 0.25},${hauteur * 0.4})`, // Sommet supérieur
    `(${base / 2 + 0.25},${-hauteur / 2})`, // Coin inférieur droit
    `(${-base / 2},${-hauteur / 2})`, // Coin inférieur gauche
  ].join(' -- ')
  const codeTikz = `
  % Triangle
            \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
        `.trim()
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: (base * 20 + 10) / 20,
    height: hauteur,
    opacite,
    nonAxe: segment(-base * 1.1, -hauteur * 1.1, base * 0.55, hauteur * 0.55),
  })
}
/**
 * Génère une figure représentant un croissant de lune.
 * @param options Options pour personnaliser le style du croissant de lune.
 * @returns Une instance de Figure2D représentant un croissant de lune.
 * @author Jean-claude Lhote
 */
export function croissantDeLune(options?: {
  fillStyle?: string // Couleur de remplissage du croissant (par défaut gris)
  strokeStyle?: string // Couleur de la bordure du croissant (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayonExterieur?: number // Rayon extérieur du croissant (par défaut 2)
  rayonInterieur?: number // Rayon intérieur du croissant (par défaut 3)
  angle?: number // Angle de rotation du croissant (par défaut 0)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'gray'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayonExterieur = options?.rayonExterieur || 1
  const rayonInterieur = options?.rayonInterieur || 1.5
  const angle = options?.angle || 0
  const rmin = Math.min(rayonExterieur, rayonInterieur)
  const rmax = Math.max(rayonExterieur, rayonInterieur)
  const opacite = options?.opacite || 1
  // Génération du code SVG
  const codeSvg =
    rayonExterieur < rayonInterieur
      ? `
     <path d="
      M 0,${-rmin * 10}
      A ${rmin * 10},${rmin * 10} 0 0 1 0,${rmin * 10}
      A ${rmax * 10},${rmax * 10} 0 0 0 0,${-rmin * 10}
      Z
    " fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()
      : `
    <path d="
      M 0,${-rmin * 10}
      A ${rmin * 10},${rmin * 10} 0 1 1 0,${rmin * 10}
      A ${rmax * 10},${rmax * 10} 0 1 0 0,${-rmin * 10}
      Z
    " fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const alpha = (Math.asin(rmin / rmax) * 180) / Math.PI

  const codeTikz = `
    % Croissant de lune
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] 
      (0,${-rmin / 2}) 
      arc[start angle=${-alpha}, end angle=${alpha}, radius=${rmax / 2}] 
      -- (0,${rmin / 2})
      arc[start angle=${90}, end angle=${-90}, radius=${rmin / 2}] 
      -- cycle;
  `.trim()

  const axes = [segment(-0.5, 0, rmin, 0)]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayonExterieur > rayonInterieur ? rmax : rmin,
    height: rayonExterieur > rayonInterieur ? rmax : rmin,
    axes,
    angle,
    opacite,
  })
}
/**
 * @author Jean-claude Lhote
 * @param options
 * @returns
 */
export function pacman(options?: {
  fillStyle?: string
  strokeStyle?: string
  lineWidth?: number
  opacite?: number
}): Figure2D {
  // Génération du code SVG
  const fillStyle = options?.fillStyle || 'yellow'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const opacite = options?.opacite || 1
  const svgPath = `
        M 0,0
        L 20,0
        A 20,20 0 1,1 0,-20
        Z
    `.trim()
  const codeSvg = `<path d="${svgPath}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />`

  // Génération du code TikZ
  const tikzFill = options?.fillStyle || 'yellow'
  const tikzStroke = options?.strokeStyle || 'black'
  const tikzLineWidth = options?.lineWidth || '1pt'
  const codeTikz = `
    % Pacman
        \\draw[fill=${tikzFill}, draw=${tikzStroke}, line width=${tikzLineWidth}] 
        (0,0) -- (0,1) 
        arc[start angle=90, end angle=360, radius=1cm] -- cycle;
    `.trim()
  const axes = [segment(-2.2, -2.2, 1, 1)]
  return new Figure2D({ codeSvg, codeTikz, width: 4, height: 4, axes, opacite })
}
/**
 * Génère une figure représentant un fer à cheval.
 * @param options Options pour personnaliser le style du fer à cheval.
 * @returns Une instance de Figure2D représentant un fer à cheval.
 * @author Jean-claude Lhote
 */
export function ferACheval(options?: {
  fillStyle?: string // Couleur de remplissage du fer à cheval (par défaut gris)
  strokeStyle?: string // Couleur de la bordure du fer à cheval (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayonExterieur?: number // Rayon extérieur du fer à cheval (par défaut 2)
  rayonInterieur?: number // Rayon intérieur du fer à cheval (par défaut 1.5)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'gray'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayonExterieur = options?.rayonExterieur || 1
  const rayonInterieur = options?.rayonInterieur || 0.75
  const opacite = options?.opacite || 1

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-rayonExterieur * 20},${-rayonExterieur * 20} 
      L 0,${-rayonExterieur * 20}
      A ${rayonExterieur * 20},${rayonExterieur * 20}  0 0 1 0,${rayonExterieur * 20}  
      L ${-rayonExterieur * 20},${rayonExterieur * 20}
      L ${-rayonExterieur * 20},${rayonInterieur * 20}
      L 0,${rayonInterieur * 20}
      A ${rayonInterieur * 20},${rayonInterieur * 20} 0 0 0 0,${-rayonInterieur * 20}
      L ${-rayonExterieur * 20},${-rayonInterieur * 20}
      L ${-rayonExterieur * 20},${-rayonExterieur * 20}

      Z
    " fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Fer à cheval
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt]
      (${-rayonExterieur},${rayonExterieur}) 
      -- (0,${rayonExterieur}) 
      arc[start angle=90, end angle=-90, radius=${rayonExterieur}]
      -- (${-rayonExterieur},${-rayonExterieur})
      -- (${-rayonExterieur},${-rayonInterieur})
      -- (0,${-rayonInterieur})
      arc[start angle=-90, end angle=90, radius=${rayonInterieur}]
      -- (${-rayonExterieur},${rayonInterieur})
      -- cycle;
  `.trim()

  const axes = [segment(-rayonExterieur, 0, rayonExterieur + 0.5, 0)]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayonExterieur * 2,
    height: rayonExterieur * 2,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant un parallélogramme.
 * @param options Options pour personnaliser le style du parallélogramme.
 * @returns Une instance de Figure2D représentant un parallélogramme.
 * @author
 */
export function parallelogramme(options?: {
  fillStyle?: string // Couleur de remplissage du parallélogramme (par défaut cyan)
  strokeStyle?: string // Couleur de la bordure du parallélogramme (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base du parallélogramme (par défaut 4)
  hauteur?: number // Hauteur du parallélogramme (par défaut 3)
  angle?: number // Angle entre la base et un côté adjacent en degrés (par défaut 60)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'cyan'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 1.5
  const hauteur = options?.hauteur || 1
  const angle = options?.angle || 60
  const opacite = options?.opacite || 1

  // Calcul des points du parallélogramme
  const offsetX = (hauteur * 20) / Math.tan((angle * Math.PI) / 180)
  const points = [
    `${-base * 10 - offsetX / 2},${hauteur * 10}`, // Coin inférieur gauche
    `${base * 10 - offsetX / 2},${hauteur * 10}`, // Coin inférieur droit
    `${base * 10 + offsetX / 2},${-hauteur * 10}`, // Coin supérieur droit
    `${-base * 10 + offsetX / 2},${-hauteur * 10}`, // Coin supérieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(${-base / 2 - offsetX / 20},${hauteur / 2})`, // Coin inférieur gauche
    `(${base / 2 - offsetX / 20},${hauteur / 2})`, // Coin inférieur droit
    `(${base / 2 + offsetX / 20},${-hauteur / 2})`, // Coin supérieur droit
    `(${-base / 2 + offsetX / 20},${-hauteur / 2})`, // Coin supérieur gauche
  ].join(' -- ')

  const codeTikz = `
  % Parallélogramme
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base + Math.abs(offsetX / 10),
    height: hauteur,
    centre: pointAbstrait(0, 0),
    nonAxe: segment(
      (-base / 2 + offsetX / 40) * 2.5,
      hauteur * 1.25,
      (base / 2 - offsetX / 40) * 2.5,
      -hauteur * 1.25,
    ),
    opacite,
  })
}

/**
 * Génère une figure représentant une forme de cœur.
 * @param options Options pour personnaliser le style du cœur.
 * @returns Une instance de Figure2D représentant une forme de cœur.
 * @author Jean-claude Lhote
 */
export function coeur(options?: {
  fillStyle?: string // Couleur de remplissage du cœur (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure du cœur (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Taille du cœur (par défaut 2)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'pink'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 2
  const opacite = options?.opacite || 1

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M 0,${-base * 10}
      C ${-base * 10},${-base * 20} ${-base * 20},${-base * 5} 0,${base * 10}
      C ${base * 20},${-base * 5} ${base * 10},${-base * 20} 0,${-base * 10}
      Z
    " fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Coeur
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt]
      (0,${base / 2})
      .. controls (${base / 2},${base}) and (${base},${base / 4}) .. (0,${-base / 2})
      .. controls (${-base},${base / 4}) and (${-base / 2},${base}) .. (0,${base / 2})
      -- cycle;
  `.trim()
  const axes = [segment(0, base * 0.7, 0, -base * 0.7)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base * 2,
    height: base * 2,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une ogive.
 * @param options Options pour personnaliser le style de l'ogive.
 * @returns Une instance de Figure2D représentant une ogive.
 * @author Jean-claude Lhote
 */
export function ogive(options?: {
  fillStyle?: string // Couleur de remplissage de l'ogive (par défaut violet)
  strokeStyle?: string // Couleur de la bordure de l'ogive (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  hauteur?: number // Hauteur de l'ogive (par défaut 4)
  rayon?: number // Rayon des arcs de l'ogive (par défaut 2.5)
  base?: number // Longueur de la base de l'ogive (par défaut 6)
  opacite?: number // Opacité de l'ogive (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'purple'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const hauteur = options?.hauteur || 2.25
  let rayon = options?.rayon || 1.5
  const base = options?.base || 2.25
  const opacite = options?.opacite || 1

  if (rayon < hauteur / 2) {
    rayon = hauteur / 2 + 1
  }

  // Calcul des points pour les arcs
  const dx = base / 2 // Distance horizontale entre le centre des arcs et les points d'intersection
  const points = [
    `${-dx * 20},0`, // Point gauche
    `${dx * 20},0`, // Point droit
  ]

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${points[0]}
      A ${rayon * 20},${rayon * 20} 0 0 1 ${points[1]}
      A ${rayon * 20},${rayon * 20} 0 0 1 ${points[0]}
      Z
    " fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()
  // Génération du code TikZ
  const codeTikz = `
    % Ogive
    \\begin{scope}
      \\clip (0,${rayon / base}) circle(${rayon});
      \\fill[fill=${fillStyle}] (0,${-rayon / base}) circle(${rayon});
      \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] (0,${-rayon / base}) circle(${rayon});
    \\end{scope}
    \\begin{scope}
      \\clip (0,${-rayon / base}) circle(${rayon});
      \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] (0,${rayon / base}) circle(${rayon});
      \\end{scope}
  `.trim()

  // Génération des axes
  const axes = [
    segment(-dx - 1, 0, dx + 1, 0),
    segment(0, -hauteur, 0, hauteur),
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base,
    height: hauteur,
    axes,
    centre: pointAbstrait(0, 0),
    opacite,
  })
}
/**
 * Génère une figure représentant une étoile à 4 branches.
 * @param options Options pour personnaliser le style de l'étoile.
 * @returns Une instance de Figure2D représentant une étoile à 4 branches.
 * @author Jean-claude Lhote
 */
export function etoile4Branches(options?: {
  fillStyle?: string // Couleur de remplissage de l'étoile (par défaut jaune)
  strokeStyle?: string // Couleur de la bordure de l'étoile (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  rayonExterieur?: number // Rayon des pointes de l'étoile (par défaut 1)
  rayonInterieur?: number // Rayon des creux de l'étoile (par défaut 0.3)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'gray'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const rayonExterieur = options?.rayonExterieur || 1
  const rayonInterieur = options?.rayonInterieur || 0.3
  const opacite = options?.opacite || 1

  // Calcul des points de l'étoile
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 4) * i
    const rayon = i % 2 === 0 ? rayonExterieur * 20 : rayonInterieur * 20
    return `${rayon * Math.cos(angle)},${rayon * Math.sin(angle)}`
  }).join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const tikzPoints = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 4) * i
    const rayon = i % 2 === 0 ? rayonExterieur : rayonInterieur
    return `(${rayon * Math.cos(angle)},-${rayon * Math.sin(angle)})`
  }).join(' -- ')
  const codeTikz = `
% Etoile à 4 branches
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
  `.trim()

  const axes = [0, 45, 90, 135].map((angle) =>
    segment(
      -Math.cos((angle * Math.PI) / 180) *
        Math.max(rayonExterieur, rayonInterieur) *
        1.1,
      -Math.sin((angle * Math.PI) / 180) *
        Math.max(rayonExterieur, rayonInterieur) *
        1.1,
      Math.cos((angle * Math.PI) / 180) *
        Math.max(rayonExterieur, rayonInterieur) *
        1.1,
      Math.sin((angle * Math.PI) / 180) *
        Math.max(rayonExterieur, rayonInterieur) *
        1.1,
    ),
  )

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: rayonExterieur * 2,
    height: rayonExterieur * 2,
    axes,
    centre: pointAbstrait(0, 0),
    opacite,
  })
}
/**
 * Génère une figure représentant une croix du style de celle de la Croix-Rouge.
 * @param options Options pour personnaliser le style de la croix.
 * @returns Une instance de Figure2D représentant une croix.
 * @author
 */
export function croixRouge(options?: {
  fillStyle?: string // Couleur de remplissage de la croix (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure de la croix (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeurBras?: number // Largeur des bras de la croix (par défaut 0.6)
  longueurBras?: number // Longueur des bras de la croix (par défaut 2.5)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'red'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const largeurBras = options?.largeurBras || 0.6
  const longueurBras = options?.longueurBras || 2.5
  const opacite = options?.opacite || 1

  // Calcul des points de la croix
  const points = [
    `${-largeurBras * 10},${-longueurBras * 10}`, // Haut gauche
    `${largeurBras * 10},${-longueurBras * 10}`, // Haut droit
    `${largeurBras * 10},${-largeurBras * 10}`, // Centre haut droit
    `${longueurBras * 10},${-largeurBras * 10}`, // Centre droit haut
    `${longueurBras * 10},${largeurBras * 10}`, // Centre droit bas
    `${largeurBras * 10},${largeurBras * 10}`, // Centre bas droit
    `${largeurBras * 10},${longueurBras * 10}`, // Bas droit
    `${-largeurBras * 10},${longueurBras * 10}`, // Bas gauche
    `${-largeurBras * 10},${largeurBras * 10}`, // Centre bas gauche
    `${-longueurBras * 10},${largeurBras * 10}`, // Centre gauche bas
    `${-longueurBras * 10},${-largeurBras * 10}`, // Centre gauche haut
    `${-largeurBras * 10},${-largeurBras * 10}`, // Centre haut gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" opacity="0.6"/>
  `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(${-largeurBras / 2},${-longueurBras / 2})`, // Haut gauche
    `(${largeurBras / 2},${-longueurBras / 2})`, // Haut droit
    `(${largeurBras / 2},${-largeurBras / 2})`, // Centre haut droit
    `(${longueurBras / 2},${-largeurBras / 2})`, // Centre droit haut
    `(${longueurBras / 2},${largeurBras / 2})`, // Centre droit bas
    `(${largeurBras / 2},${largeurBras / 2})`, // Centre bas droit
    `(${largeurBras / 2},${longueurBras / 2})`, // Bas droit
    `(${-largeurBras / 2},${longueurBras / 2})`, // Bas gauche
    `(${-largeurBras / 2},${largeurBras / 2})`, // Centre bas gauche
    `(${-longueurBras / 2},${largeurBras / 2})`, // Centre gauche bas
    `(${-longueurBras / 2},${-largeurBras / 2})`, // Centre gauche haut
    `(${-largeurBras / 2},${-largeurBras / 2})`, // Centre haut gauche
  ].join(' -- ')
  const codeTikz = `
  % Croix rouge
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt, opacity=0.6] ${tikzPoints} -- cycle;
  `.trim()

  const axes = [0, 45, 90, 135].map((angle) =>
    segment(
      -Math.cos((angle * Math.PI) / 180) * longueurBras * 0.7,
      -Math.sin((angle * Math.PI) / 180) * longueurBras * 0.7,
      Math.cos((angle * Math.PI) / 180) * longueurBras * 0.7,
      Math.sin((angle * Math.PI) / 180) * longueurBras * 0.7,
    ),
  )

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: longueurBras * 2,
    height: longueurBras * 2,
    axes,
    centre: pointAbstrait(0, 0),
    opacite,
  })
}
/**
 * Génère une figure représentant un rectangle.
 * @param options Options pour personnaliser le style du rectangle.
 * @returns Une instance de Figure2D représentant un rectangle.
 * @author Jean-claude Lhote
 */
export function rectangle(options?: {
  fillStyle?: string // Couleur de remplissage du rectangle (par défaut gris)
  strokeStyle?: string // Couleur de la bordure du rectangle (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur du rectangle (par défaut 4)
  hauteur?: number // Hauteur du rectangle (par défaut 2)
  coinsArrondis?: boolean // Indique si les coins du rectangle sont arrondis (par défaut faux)
  angle?: number // Angle de rotation du rectangle (par défaut 0)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'gray'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const largeur = options?.largeur || 2
  const hauteur = options?.hauteur || 1
  const coinArrondis = options?.coinsArrondis || false
  const angle = options?.angle || 0
  const opacite = options?.opacite || 1

  // Calcul des points du rectangle
  const points = [
    `${-largeur * 10},${-hauteur * 10}`, // Coin supérieur gauche
    `${largeur * 10},${-hauteur * 10}`, // Coin supérieur droit
    `${largeur * 10},${hauteur * 10}`, // Coin inférieur droit
    `${-largeur * 10},${hauteur * 10}`, // Coin inférieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = coinArrondis
    ? `
      <rect x="${-largeur * 10}" y="${-hauteur * 10}" width="${largeur * 20}" height="${hauteur * 20}" rx="${Math.min(largeur, hauteur) * 5}" ry="${Math.min(largeur, hauteur) * 5}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    `.trim()
    : `
      <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    `.trim()

  // Génération du code TikZ
  const codeTikz = (
    coinArrondis
      ? `\\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners=${Math.min(largeur, hauteur) / 5}cm] 
        (${-largeur / 2},${-hauteur / 2}) rectangle (${largeur / 2},${hauteur / 2});`
      : `\\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] 
        (${-largeur / 2},${-hauteur / 2}) rectangle (${largeur / 2},${hauteur / 2});`
  ).trim()

  const axes = [
    segment((-largeur * 5) / 8, 0, (largeur * 5) / 8, 0),
    segment(0, (-hauteur * 5) / 8, 0, (hauteur * 5) / 8),
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    centre: pointAbstrait(0, 0),
    angle,
    opacite,
  })
}
/**
 * Génère une figure représentant un losange.
 * @param options Options pour personnaliser le style du losange.
 * @returns Une instance de Figure2D représentant un losange.
 * @author
 */
export function losange(options?: {
  fillStyle?: string // Couleur de remplissage du losange (par défaut gris)
  strokeStyle?: string // Couleur de la bordure du losange (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base du losange (par défaut 4)
  hauteur?: number // Hauteur du losange (par défaut 2)
  angle?: number // Angle entre les diagonales en degrés (par défaut 0)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'orange'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 2
  const hauteur = options?.hauteur || 1
  const angle = options?.angle || 0

  const opacite = options?.opacite || 1

  // Calcul des points du losange
  const offsetX = base * 10
  const offsetY = hauteur * 10
  const points = [
    `0,${-offsetY}`, // Sommet supérieur
    `${offsetX},0`, // Coin droit
    `0,${offsetY}`, // Sommet inférieur
    `${-offsetX},0`, // Coin gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
      <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(0,${-hauteur / 2})`, // Sommet supérieur
    `(${base / 2},0)`, // Coin droit
    `(0,${hauteur / 2})`, // Sommet inférieur
    `(${-base / 2},0)`, // Coin gauche
  ].join(' -- ')
  const codeTikz = `
  % losange
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
  `.trim()

  const axes = [
    segment((-base * 5) / 8, 0, (base * 5) / 8, 0),
    segment(0, (-hauteur * 5) / 8, 0, (hauteur * 5) / 8),
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base,
    height: hauteur,
    axes,
    centre: pointAbstrait(0, 0),
    angle,
    opacite,
  })
}
/**
 * Génère une figure représentant un triangle isocèle.
 * @param options Options pour personnaliser le style du triangle isocèle.
 * @returns Une instance de Figure2D représentant un triangle isocèle.
 * @author
 */
export function triangleIsocele(options?: {
  fillStyle?: string // Couleur de remplissage du triangle (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure du triangle (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base du triangle (par défaut 4)
  hauteur?: number // Hauteur du triangle (par défaut 3)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || bleuMathalea
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 2
  const hauteur = options?.hauteur || 1
  const opacite = options?.opacite || 1

  // Calcul des points du triangle
  const points = [
    `0,${-hauteur * 10}`, // Sommet supérieur
    `${base * 10},${hauteur * 10}`, // Coin inférieur droit
    `${-base * 10},${hauteur * 10}`, // Coin inférieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(0,${-hauteur / 2})`, // Sommet supérieur
    `(${base / 2},${hauteur / 2})`, // Coin inférieur droit
    `(${-base / 2},${hauteur / 2})`, // Coin inférieur gauche
  ].join(' -- ')
  const codeTikz = `
  % triangle isocèle
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
  `.trim()

  const axes = [
    segment(0, (-hauteur * 5) / 8, 0, (hauteur * 5) / 8), // Axe vertical
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant un triangle équilatéral.
 * @param options Options pour personnaliser le style du triangle équilatéral.
 * @returns Une instance de Figure2D représentant un triangle équilatéral.
 * @author
 */
export function triangleEquilateral(options?: {
  fillStyle?: string // Couleur de remplissage du triangle (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure du triangle (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  base?: number // Longueur de la base du triangle (par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || bleuMathalea
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const base = options?.base || 2
  const opacite = options?.opacite || 1

  // Calcul de la hauteur du triangle équilatéral
  const hauteur = Math.round((Math.sqrt(3) / 2) * base * 100) / 100

  // Calcul des points du triangle
  const points = [
    `0,${((-hauteur * 40) / 3).toFixed(2)}`, // Sommet supérieur
    `${base * 10},${((hauteur * 20) / 3).toFixed(2)}`, // Coin inférieur droit
    `${-base * 10},${((hauteur * 20) / 3).toFixed(2)}`, // Coin inférieur gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const tikzPoints = [
    `(0,${(-hauteur / 3).toFixed(2)})`, // Sommet supérieur
    `(${base / 2},${((2 * hauteur) / 3).toFixed(2)})`, // Coin inférieur droit
    `(${-base / 2},${((2 * hauteur) / 3).toFixed(2)})`, // Coin inférieur gauche
  ].join(' -- ')
  const codeTikz = `
  % triangle équilatéral
    \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoints} -- cycle;
  `.trim()
  const axes = [90, 210, -30].map((angle) =>
    segment(
      -Math.cos((angle * Math.PI) / 180) * base * 0.7,
      -Math.sin((angle * Math.PI) / 180) * base * 0.7,
      Math.cos((angle * Math.PI) / 180) * base * 0.7,
      Math.sin((angle * Math.PI) / 180) * base * 0.7,
    ),
  )
  // Génération des axes]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: base,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant un ovale.
 * @param options Options pour personnaliser le style de l'ovale.
 * @returns Une instance de Figure2D représentant un ovale.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function ovale(options?: {
  fillStyle?: string // Couleur de remplissage de l'ovale
  strokeStyle?: string // Couleur de la bordure de l'ovale
  lineWidth?: number // Épaisseur de la bordure
  opacite?: number // Opacité de l'ovale
}): Figure2D {
  // Génération du code SVG
  const ovaleFill = options?.fillStyle || 'brown'
  const ovaleStroke = options?.strokeStyle || 'black'
  const ovaleLineWidth = options?.lineWidth || 1
  const opacite = options?.opacite || 0.7
  const codeSvg = `
    <ellipse cx="0" cy="0" rx="20" ry="10" fill="${ovaleFill}" stroke="${ovaleStroke}" stroke-width="${ovaleLineWidth}" />
  `.trim()

  // Génération du code TikZ
  const tikzOvaleFill = `fill=${ovaleFill}`
  const tikzOvaleStroke = `draw=${ovaleStroke}`
  const tikzOvaleLineWidth = `line width=${ovaleLineWidth}pt`
  const codeTikz = `
    \\draw[${tikzOvaleFill}, ${tikzOvaleStroke}, ${tikzOvaleLineWidth}] (0,0) ellipse (1cm and 0.5cm);
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 4,
    height: 2,
    opacite,
    axes: [segment(-2.2, 0, 2.2, 0), segment(0, -1.2, 0, 1.2)],
    centre: pointAbstrait(0, 0),
  })
}
