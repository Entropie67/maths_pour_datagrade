import { bleuMathalea } from '../../../lib/colors'
import { Figure2D } from '../Figures2D'
import { pointAbstrait } from '../PointAbstrait'
import { Segment, segment } from '../segmentsVecteurs'

/**
 * Génère une figure représentant un panneau de route prioritaire.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de route prioritaire.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauRoutePrioritaire(options?: {
  fillStyle?: string // Couleur de remplissage du losange jaune
  strokeStyle?: string // Couleur de la bordure du losange
  lineWidth?: number // Épaisseur de la bordure
  borderFillSyle?: string
}): Figure2D {
  // Génération du code SVG
  const diamondFill = options?.fillStyle || 'yellow'
  const diamondStroke = options?.strokeStyle || 'black'
  const diamondLineWidth = options?.lineWidth || 1
  const borderFillSyle = options?.borderFillSyle || 'white'
  const codeSvg = `
  <g transform="scale(0.707) rotate(45)"><rect x="-20" y="-20" width="40" height="40" fill="${borderFillSyle}" stroke="${diamondStroke}" stroke-width="${diamondLineWidth}" rx="2" ry="2"/>
    <rect x="-15" y="-15" width="30" height="30" fill="${diamondFill}" stroke="${diamondStroke}" stroke-width="${diamondLineWidth}" rx="2" ry="2"/></g>
  `.trim()

  // Génération du code TikZ
  const tikzDiamondFill = `fill=${diamondFill}`
  const tikzDiamondStroke = `draw=${diamondStroke}`
  const tikzDiamondLineWidth = `line width=${diamondLineWidth}pt`
  const codeTikz = `
    \\draw[fill=${borderFillSyle}, ${tikzDiamondStroke}, ${tikzDiamondLineWidth}] (0,-1) -- (1,0) -- (0,1) -- (-1,0) -- cycle;
    \\draw[${tikzDiamondFill}, ${tikzDiamondStroke}, ${tikzDiamondLineWidth}] (0,-0.75) -- (0.75,0) -- (0,0.75) -- (-0.75,0) -- cycle;
  `.trim()

  const axes = [
    segment(-1, -1, 1, 1),
    segment(-1, 1, 1, -1),
    segment(-1.2, 0, 1.2, 0),
    segment(0, -1.2, 0, 1.2),
  ]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}

export function panneauFinDeRoutePrioritaire(options?: {
  fillStyle?: string // Couleur de remplissage du losange jaune
  strokeStyle?: string // Couleur de la bordure du losange
  lineWidth?: number // Épaisseur de la bordure
  borderFillSyle?: string
  cancelStroke?: string // Couleur du trait qui barre le losange
}): Figure2D {
  // Génération du code SVG
  const diamondFill = options?.fillStyle || 'yellow'
  const diamondStroke = options?.strokeStyle || 'gray'
  const cancelStroke = options?.cancelStroke || 'black'
  const diamondLineWidth = options?.lineWidth || 1
  const borderFillSyle = options?.borderFillSyle || 'white'
  const codeSvg = `
   <g transform="scale(0.707) rotate(45)"><rect x="-20" y="-20" width="40" height="40" fill="${borderFillSyle}" stroke="${diamondStroke}" stroke-width="${diamondLineWidth}" rx="2" ry="2"/>
    <rect x="-15" y="-15" width="30" height="30" fill="${diamondFill}" stroke="${diamondStroke}" stroke-width="${diamondLineWidth}" rx="2" ry="2"/></g>
    <line x1="-10" y1="10" x2="10" y2="-10" stroke="${cancelStroke}" stroke-width="3" />
  `.trim()
  // Génération du code TikZ
  const tikzDiamondFill = `fill=${diamondFill}`
  const tikzDiamondStroke = `draw=${diamondStroke}`
  const tikzDiamondLineWidth = `line width=${diamondLineWidth}pt`
  const tikzDiamondCancelStroke = `draw=${cancelStroke}`
  const codeTikz = `
    \\draw[fill=${borderFillSyle}, ${tikzDiamondStroke}, ${tikzDiamondLineWidth}] (0,-1) -- (1,0) -- (0,1) -- (-1,0) -- cycle;
    \\draw[${tikzDiamondFill}, ${tikzDiamondStroke}, ${tikzDiamondLineWidth}] (0,-0.75) -- (0.75,0) -- (0,0.75) -- (-0.75,0) -- cycle;
    \\draw[${tikzDiamondCancelStroke}, line width=3pt] (-0.5,-0.5) -- (0.5,0.5);
  `.trim()
  const axes = [segment(-1, -1, 1, 1), segment(-1, 1, 1, -1)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant un panneau de stationnement interdit.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de stationnement interdit.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauStationnementInterdit(options?: {
  fillStyle?: string // Couleur de remplissage du cercle bleu
  strokeStyle?: string // Couleur de la bordure du cercle
  lineWidth?: number // Épaisseur de la bordure
}): Figure2D {
  // Génération du code SVG
  const circleFill = options?.fillStyle || bleuMathalea
  const circleStroke = options?.strokeStyle || 'red'
  const circleLineWidth = options?.lineWidth || 5
  const crossColor = 'red'
  const codeSvg = `
  <circle cx="0" cy="0" r="20" stroke="black" stroke-width="1" />
    <circle cx="0" cy="0" r="17" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${circleLineWidth}" />
    <line x1="-13" y1="-13" x2="13" y2="13" stroke="${crossColor}" stroke-width="3" />
  `.trim()

  // Génération du code TikZ
  const tikzCircleFill = `fill=${circleFill}`
  const tikzCircleStroke = `draw=${circleStroke}`
  const tikzCircleLineWidth = `line width=${circleLineWidth * 1.1}pt`
  const tikzCrossColor = 'red'
  const codeTikz = `
   \\draw[draw=black, line width=1pt] (0,0) circle (1cm);
    \\draw[${tikzCircleFill}, ${tikzCircleStroke}, ${tikzCircleLineWidth}] (0,0) circle (0.9cm);
      \\draw[${tikzCrossColor}, line width=5pt] (-0.7,0.7) -- (0.7,-0.7);
  `.trim()

  const axes = [segment(-1, -1, 1, 1), segment(-1, 1, 1, -1)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant un panneau STOP.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau STOP.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauStop(options?: {
  fillStyle?: string // Couleur de remplissage de l'octogone (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure de l'octogone (par défaut blanc)
  lineWidth?: number // Épaisseur de la bordure
  textColor?: string // Couleur du texte "STOP" (par défaut blanc)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'red'
  const strokeStyle = options?.strokeStyle || 'white'
  const lineWidth = options?.lineWidth || 2
  const textColor = options?.textColor || 'white'

  // Génération du code SVG
  const codeSvg = `
   <polygon points="-8.8,-20 8.8,-20 20,-8.8 20,8.8 8.8,20 -8.8,20 -20,8.8 -20,-8.8" fill="white" stroke="black" stroke-width="1"/>
  <polygon points="-8.8,-20 8.8,-20 20,-8.8 20,8.8 8.8,20 -8.8,20 -20,8.8 -20,-8.8" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" transform="scale(0.9)"/>
    <text x="0" y="5" fill="${textColor}" font-size="12" font-family="Arial" font-weight="bold" text-anchor="middle">STOP</text>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
                    \\draw[fill=white, draw=black, line width=1pt] (-0.5,-1) -- (0.5,-1) -- (1,-0.5) -- (1,0.5) -- (0.5,1) -- (-0.5,1) -- (-1,0.5) -- (-1,-0.5) -- cycle;
             \\begin{scope}[scale=0.95]\\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] (-0.5,-1) -- (0.5,-1) -- (1,-0.5) -- (1,0.5) -- (0.5,1) -- (-0.5,1) -- (-1,0.5) -- (-1,-0.5) -- cycle;\\end{scope}
                    \\node at (0,0) {\\textcolor{${textColor}}{\\textbf{\\small STOP}}};
    `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nonAxe: segment(0, -2.5, 0, 2.5),
  })
}
/**
 * Génère une figure représentant un panneau de voie sans issue.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de voie sans issue.
 * @author Jean-claude Lhote
 */
export function panneauVoieSansIssue(options?: {
  fillStyle?: string // Couleur de remplissage du carré bleu (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure noire (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure noire
  tFillStyle?: string // Couleur de la forme en T (par défaut blanc)
  barFillStyle?: string // Couleur de la barre rouge (par défaut rouge)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || bleuMathalea
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const tFillStyle = options?.tFillStyle || 'white'
  const barFillStyle = options?.barFillStyle || 'red'

  // Génération du code SVG
  const codeSvg = `
    <rect x="-20" y="-20" width="40" height="40" rx="5" fill="white" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    <rect x="-17" y="-17" width="34" height="34" fill="${fillStyle}" />
    <rect x="-2.5" y="-10" width="5" height="24" fill="${tFillStyle}" />
    <rect x="-7" y="-14" width="14" height="9" fill="${tFillStyle}" />
    <rect x="-6" y="-13" width="12" height="7" fill="${barFillStyle}" />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    \\draw[fill=white, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners=2pt] (-1,-1) rectangle (1,1);
    \\fill[${fillStyle}] (-0.85,-0.85) rectangle (0.85,0.85);
    \\fill[${tFillStyle}] (-0.125,-0.5) rectangle (0.125,0.7);
    \\fill[${tFillStyle}] (-0.35,0.35) rectangle (0.35,0.7);
    \\fill[${barFillStyle}] (-0.3,0.4) rectangle (0.3,0.6);
  `.trim()
  const axes = [segment(0, -1.2, 0, 1.2)]

  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}
/**
 * Génère une figure représentant un panneau de parking.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de parking.
 * @author Jean-claude Lhote
 */
export function panneauParking(options?: {
  fillStyle?: string // Couleur de remplissage du carré bleu (par défaut bleu)
  strokeStyle?: string // Couleur de la bordure noire (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure noire
  pFillStyle?: string // Couleur de la lettre P (par défaut blanc)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || bleuMathalea
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 1
  const pFillStyle = options?.pFillStyle || 'white'

  // Génération du code SVG
  const codeSvg = `
    <rect x="-20" y="-20" width="40" height="40" rx="5" fill="white" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    <rect x="-17" y="-17" width="34" height="34" fill="${fillStyle}" />
    <text x="0" y="12" font-size="30" font-family="Arial" font-weight="bold" text-anchor="middle" fill="${pFillStyle}">P</text>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    \\draw[fill=white, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners=2pt] (-1,-1) rectangle (1,1);
    \\fill[${fillStyle}] (-0.85,-0.85) rectangle (0.85,0.85);
    \\node[text=${pFillStyle}, font=\\bfseries, scale=1.5] at (0,0) {P};
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nonAxe: segment(0, -2.5, 0, 2.5),
  })
}
/**
 * Génère une figure représentant un panneau de céder le passage.
 * @param options Options pour personnaliser le style du panneau.
 * @returns
 * @author Jean-claude Lhote
 */
export function panneauCederLePassage(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [-90, 30, 150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [-90, 30, 150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()
  const tikzSommets1 = [-90, 30, 150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [-90, 30, 150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
  `.trim()
  // Génération du code TikZ

  const axes = [-90, 30, 150].map((angle) =>
    segment(
      1.2 * Math.cos((angle * Math.PI) / 180),
      -1.2 * Math.sin((angle * Math.PI) / 180),
      -1.2 * Math.cos((angle * Math.PI) / 180),
      1.2 * Math.sin((angle * Math.PI) / 180),
    ),
  )
  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}

/**
 * Génère une figure représentant un panneau signalant une circulation à double sens.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de danger pour une circulation à double sens.
 * @author Jean-claude Lhote
 */
export function panneauDoubleSens(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    <path d="M -2,-7 L -2,2 L -0.5,2 L -3,7 L -5.5,2 L -4,2 L -4,-7 Z" fill="black" />
    <path d="M 4,7 L 4,-2 L 5.5,-2 L 3,-7 L 0.5,-2 L 2,-2 L 2,7 Z" fill="black" />
  `.trim()
  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
      \\path[fill=black] 
        (-0.1,0.35) -- (-0.1,-0.1) -- (-0.025,-0.1) -- (-0.15,-0.35) -- (-0.275,-0.1) -- (-0.2,-0.1) -- (-0.2,0.35) -- cycle;
      \\path[fill=black] 
        (0.2,-0.35) -- (0.2,0.1) -- (0.275,0.1) -- (0.15,0.35) -- (0.025,0.1) -- (0.1,0.1) -- (0.1,-0.35) -- cycle;
  `.trim()
  // Génération du code TikZ

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nonAxe: segment(0, -2.5, 0, 2.5),
  })
}
/**
 *
 * @param options Options pour personnaliser le style du panneau.
 * @returns
 * @author Jean-claude Lhote
 */
export function panneauRetrecissementChaussee1(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    <line x1="-2" y1="6" x2="-2" y2="-6" stroke="black" stroke-width="2" />
    <path d="M 3.5,6 L 3.5,2 L 2,-2 L 2,-6" stroke="black" stroke-width="2" fill="none" />
  `.trim()

  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
     \\draw[draw=black, line width=2pt] (-0.1,-0.3) -- (-0.1,0.3);
    \\draw[draw=black, line width=2pt] (0.175,-0.3) -- (0.175,-0.1) -- (0.1,0.1) -- (0.1,0.3);
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nonAxe: segment(0, -2.5, 0, 2.5),
  })
}
/**
 *
 * @param options Options pour personnaliser le style du panneau.
 * @returns
 * @author Jean-claude Lhote
 */
export function panneauRetrecissementChaussee2(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
   <path d="M -3.9,6 L -3.9,2 L -1.9,-2 L -1.9,-6" stroke="black" stroke-width="2" fill="none" />
    <path d="M 3.9,6 L 3.9,2 L 1.9,-2 L 1.9,-6" stroke="black" stroke-width="2" fill="none" />
  `.trim()

  // Génération du code TikZ
  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
  % panneauRetrecissementChaussee2
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
     \\draw[draw=black, line width=2pt] (-0.195,-0.3) -- (-0.195,-0.1) -- (-0.1,0.1) -- (-0.1,0.3);
    \\draw[draw=black, line width=2pt] (0.195,-0.3) -- (0.195,-0.1) -- (0.1,0.1) -- (0.1,0.3);
  `.trim()
  const axes = [segment(0, -1.2, 0, 1.2)]
  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}
/**
 *
 * @param options Options pour personnaliser le style du panneau.
 * @returns
 * @author Jean-claude Lhote
 */
export function panneauRetrecissementChaussee3(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
   <line x1="2" y1="6" x2="2" y2="-6" stroke="black" stroke-width="2" />
    <path d="M -3.5,6 L -3.5,2 L -2,-2 L -2,-6" stroke="black" stroke-width="2" fill="none" />
  `.trim()

  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
     \\draw[draw=black, line width=2pt] (0.1,-0.3) -- (0.1,0.3);
    \\draw[draw=black, line width=2pt] (-0.175,-0.3) -- (-0.175,-0.1) -- (-0.1,0.1) -- (-0.1,0.3);
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nonAxe: segment(0, -2.5, 0, 2.5),
  })
}
/**
 *
 * @param options Options pour personnaliser le style du panneau.
 * @returns
 * @author Jean-claude Lhote
 */
export function panneauCroisementPrioriteADroite(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
     <line x1="-4.5" y1="4.5" x2="4.5" y2="-4.5" stroke="black" stroke-width="2"/>
    <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke="black" stroke-width="2"/>
  `.trim()

  // Génération du code TikZ
  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
  % panneau de croisement
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
     \\draw[draw=black, line width=3pt] (-0.25,0.25) -- (0.25,-0.25);
    \\draw[draw=black, line width=3pt] (-0.25,-0.25) -- (0.25,0.25);
  `.trim()
  const axes = [segment(0, -1.2, 0, 1.2)]
  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}
/**
 *
 * @param options Options pour personnaliser le style du panneau.
 * @returns Figure2D représentant un panneau de feu tricolore.
 * @author Jean-claude Lhote
 */
export function panneauFeuTricolore(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
      <rect x="-3" y="-8" width="6" height="14" rx="3" fill="black" />
    <circle cx="0" cy="-5" r="1.5" fill="red" />
    <circle cx="0" cy="-1" r="1.5" fill="orange" />
    <circle cx="0" cy="3" r="1.5" fill="green" />`.trim()

  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
  % Panneau feu tricolore
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
       \\fill[black, rounded corners=0.15cm] (-0.15,0.4) rectangle (0.15,-0.3);
    \\fill[red] (0,0.25) circle (0.075);
    \\fill[orange] (0,0.05) circle (0.075);
    \\fill[green] (0,-0.15) circle (0.075);
  `.trim()

  const axes = [segment(0, -1.2, 0, 1.2)]
  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}
/**
 * Génère une figure représentant un panneau signalant un croisement avec une route secondaire.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Figure2D représentant un panneau de danger pour un croisement avec une route secondaire.
 * @author
 */
export function panneauCroisementRouteSecondaire(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du triangle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  borderStyle?: string // Couleur du liseré noir
  borderWidth?: number // Épaisseur du liseré noir
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'white'
  const strokeStyle = options?.strokeStyle || 'red'
  const lineWidth = options?.lineWidth || 3
  const borderStyle = options?.borderStyle || 'black'
  const borderWidth = options?.borderWidth || 1
  const sommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `${(22 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-22 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  const sommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `${(19 * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(-19 * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`,
    )
    .join(' ')
  // Génération du code SVG
  const codeSvg = `
    <polygon points="${sommets1}" fill="${fillStyle}" stroke="${borderStyle}" stroke-width="${borderWidth}" />
    <polygon points="${sommets2}" fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
    <path d="M -3,-7 L 0,-11 L 3,-7 L 3,6 L 0,4 L -3,6 Z" fill="black" />
    <line x1="-6" y1="-1" x2="6" y2="-1" stroke="black" stroke-width="2" />
  `.trim()

  const tikzSommets1 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((22 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((22 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')
  const tikzSommets2 = [90, -30, -150]
    .map(
      (angle) =>
        `(${((19 * Math.cos((angle * Math.PI) / 180)) / 20).toFixed(3)},${((19 * Math.sin((angle * Math.PI) / 180)) / 20).toFixed(3)})`,
    )
    .join(' -- ')

  const codeTikz = `
  % Panneau de croisement avec une route secondaire
    \\draw[fill=${fillStyle}, draw=${borderStyle}, line width=${borderWidth}pt] 
      ${tikzSommets1} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt] 
      ${tikzSommets2} -- cycle;
    \\fill[black] (-0.15,0.35) -- (0,0.55) -- (0.15,0.35) -- (0.15,-0.3) -- (0,-0.2) -- (-0.15,-0.3) -- cycle;
    \\draw[draw=black, line width=2pt] (-0.3,0.05) -- (0.3,0.05);
  `.trim()

  const axes = [segment(0, -1.2, 0, 1.2)]
  return new Figure2D({ codeSvg, codeTikz, width: 2, height: 2, axes })
}
/**
 * Génère une figure représentant un panneau de sens interdit.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de sens interdit.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauSensInterdit(options?: {
  fillStyle?: string // Couleur de remplissage du cercle rouge
  strokeStyle?: string // Couleur de la bordure du cercle
  lineWidth?: number // Épaisseur de la bordure
}): Figure2D {
  // Génération du code SVG
  const circleFill = options?.fillStyle || 'red'
  const circleStroke = options?.strokeStyle || 'red'
  const circleLineWidth = options?.lineWidth || 2
  const svgPath = `
        <circle cx="0" cy="0" r="20" fill="${circleFill}" stroke="black" stroke-width="1" />
        <circle cx="0" cy="0" r="18" fill="${circleFill}" stroke="${circleStroke}" stroke-width="0" />
        <rect x="-13" y="-3.5" width="26" height="7" fill="white" />
    `.trim()
  const codeSvg = `${svgPath}`

  // Génération du code TikZ
  const tikzCircleFill = `fill=${circleFill}`
  const tikzCircleStroke = `draw=${circleStroke}`
  const tikzCircleLineWidth = `line width=${circleLineWidth}pt`
  const codeTikz = `
     \\draw[ draw=black, line width=1pt] (0,0) circle (1cm);
   \\draw[${tikzCircleFill}, ${tikzCircleStroke}, ${tikzCircleLineWidth}] (0,0) circle (0.95cm);
    \\fill[white] (-0.75, -0.125) rectangle (0.75, 0.125);
  `.trim()
  const axes = [segment(-1.2, 0, 1.2, 0), segment(0, -1.2, 0, 1.2)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}

/**
 * Génère une figure représentant un panneau d'interdiction de circuler.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau d'interdiction de circuler.
 *
 */
export function panneauInterdictionDeCirculer(options?: {
  fillStyle?: string // Couleur de remplissage de l'intérieur du cercle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure rouge
  lineWidth?: number // Épaisseur de la bordure rouge
  barFillStyle?: string // Couleur de la barre diagonale (par défaut rouge)
}): Figure2D {
  // Options par défaut
  const circleFill = options?.fillStyle || 'red'
  const circleStroke = options?.strokeStyle || 'red'
  const circleLineWidth = options?.lineWidth || 2

  // Génération du code SVG
  const codeSvg = `
     <circle cx="0" cy="0" r="20" fill="${circleFill}" stroke="black" stroke-width="1" />
        <circle cx="0" cy="0" r="18" fill="${circleFill}" stroke="${circleStroke}" stroke-width="0" />
        <circle cx="0" cy="0" r="14" fill="white" stroke="${circleStroke}" stroke-width="0" />
    `.trim()

  // Génération du code TikZ
  const tikzCircleFill = `fill=${circleFill}`
  const tikzCircleStroke = `draw=${circleStroke}`
  const tikzCircleLineWidth = `line width=${circleLineWidth}pt`
  const codeTikz = `
     \\draw[ draw=black, line width=1pt] (0,0) circle (1cm);
   \\draw[${tikzCircleFill}, ${tikzCircleStroke}, ${tikzCircleLineWidth}] (0,0) circle (0.95cm);
    \\fill[white] (-0,0) circle (0.7cm);
  `.trim()
  const axes: Segment[] = []
  for (let k = 0; k < 10; k++) {
    const axe = segment(
      -1.2 * Math.cos((Math.PI * ((k * 180) / 10)) / 180),
      -1.2 * Math.sin((Math.PI * ((k * 180) / 10)) / 180),
      1.2 * Math.cos((Math.PI * ((k * 180) / 10)) / 180),
      1.2 * Math.sin((Math.PI * ((k * 180) / 10)) / 180),
    )
    axes.push(axe)
  }
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    nbAxes: Number.POSITIVE_INFINITY,
    axes,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant un panneau de fin de limitation.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau de fin de limitation.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauFinDeLimitation(options?: {
  fillStyle?: string // Couleur de remplissage du cercle (par défaut blanc)
  strokeStyle?: string // Couleur de la bordure du cercle (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  diagonalColor?: string // Couleur des diagonales (par défaut gris)
}): Figure2D {
  // Génération du code SVG
  const circleFill = options?.fillStyle || 'white'
  const circleStroke = options?.strokeStyle || 'black'
  const circleLineWidth = options?.lineWidth || 2
  const diagonalColor = options?.diagonalColor || 'gray'
  const codeSvg = `
    <circle cx="0" cy="0" r="20" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${circleLineWidth}" />
    <line x1="-15" y1="15" x2="15" y2="-15" stroke="${diagonalColor}" stroke-width="2" />
  `.trim()

  // Génération du code TikZ
  const tikzCircleFill = `fill=${circleFill}`
  const tikzCircleStroke = `draw=${circleStroke}`
  const tikzCircleLineWidth = `line width=${circleLineWidth}pt`
  const tikzDiagonalColor = diagonalColor
  const codeTikz = `
    \\draw[${tikzCircleFill}, ${tikzCircleStroke}, ${tikzCircleLineWidth}] (0,0) circle (1cm);
    \\draw[${tikzDiagonalColor}, line width=1pt] (-0.75,-0.75) -- (0.75,0.75);
  `.trim()
  const axes = [segment(-1, -1, 1, 1), segment(-1, 1, 1, -1)]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}

/**
 * Génère une figure représentant un panneau d'interdiction de stationner.
 * @param options Options pour personnaliser le style du panneau.
 * @returns Une instance de Figure2D représentant un panneau d'interdiction de stationner.
 * @author Jean-claude Lhote
 * @version 1.0
 * @date 2025-05-10
 */
export function panneauArretInterdit(options?: {
  fillStyle?: string // Couleur de remplissage du cercle rouge
  strokeStyle?: string // Couleur de la bordure du cercle
  lineWidth?: number // Épaisseur de la bordure
}): Figure2D {
  // Génération du code SVG
  const circleFill = options?.fillStyle || bleuMathalea
  const circleStroke = options?.strokeStyle || 'red'
  const circleLineWidth = options?.lineWidth || 5
  const crossColor = 'red'
  const codeSvg = `
    <circle cx="0" cy="0" r="20" stroke="black" stroke-width="1" />
    <circle cx="0" cy="0" r="17" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${circleLineWidth}" />
    <line x1="-13" y1="-13" x2="13" y2="13" stroke="${crossColor}" stroke-width="3" />
    <line x1="-13" y1="13" x2="13" y2="-13" stroke="${crossColor}" stroke-width="3" />
  `.trim()

  // Génération du code TikZ
  const tikzCircleFill = `fill=${circleFill}`
  const tikzCircleStroke = `draw=${circleStroke}`
  const tikzCircleLineWidth = `line width=${circleLineWidth * 1.1}pt`
  const tikzCrossColor = 'red'
  const codeTikz = `
      \\draw[draw=black, line width=1pt] (0,0) circle (1cm);
    \\draw[${tikzCircleFill}, ${tikzCircleStroke}, ${tikzCircleLineWidth}] (0,0) circle (0.9cm);
    \\draw[${tikzCrossColor}, line width=5pt] (-0.7,-0.7) -- (0.7,0.7);
    \\draw[${tikzCrossColor}, line width=5pt] (-0.7,0.7) -- (0.7,-0.7);
  `.trim()
  // Retourne une nouvelle instance de Figure2D avec le code SVG et TikZ généré
  const axes = [
    segment(-1.2, 0, 1.2, 0),
    segment(0, -1.2, 0, 1.2),
    segment(-1, -1, 1, 1),
    segment(-1, 1, 1, -1),
  ]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 2,
    axes,
    centre: pointAbstrait(0, 0),
  })
}
