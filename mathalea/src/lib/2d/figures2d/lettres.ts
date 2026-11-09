import { Figure2D } from '../Figures2D'
import { pointAbstrait } from '../PointAbstrait'
import { segment } from '../segmentsVecteurs'

/**
 * Génère une figure représentant une lettre "A".
 * @param options Options pour personnaliser le style de la lettre "A".
 * @returns Une instance de Figure2D représentant une lettre "A".
 */
export function lettreA(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "A" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "A" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "A" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "A" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'black'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 6
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Calcul des points de la lettre "A" en pixels
  const points = [
    `${-largeurPx / 2},${hauteurPx / 2}`, // Bas gauche
    `0,${-hauteurPx / 2}`, // Sommet
    `${largeurPx / 2},${hauteurPx / 2}`, // Bas droit
    `${(largeurPx * 7) / 16},${hauteurPx / 2}`, // Intérieur bas droit
    `0,${-hauteurPx / 3}`, // Intérieur milieu
    `${(-largeurPx * 7) / 16},${hauteurPx / 2}`, // Intérieur bas gauche
  ].join(' ')

  // Génération du code SVG
  const codeSvg = `
    <polygon points="${points}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linejoin="round" />
    <line x1="${-largeurPx / 3}" y1="${hauteurPx / 5}" x2="${largeurPx / 3}" y2="${hauteurPx / 5}" stroke="${strokeStyle}" stroke-width="${lineWidth * 1.5}" />
  `.trim()

  // Calcul des points de la lettre "A" en cm pour TikZ
  const tikzPoints = [
    `(${-largeur / 2},${-hauteur / 2})`, // Bas gauche
    `(0,${hauteur / 2})`, // Sommet
    `(${largeur / 2},${-hauteur / 2})`, // Bas droit
    `(${(largeur * 7) / 16},${-hauteur / 2})`, // Intérieur bas droit
    `(0,${hauteur / 3})`, // Intérieur milieu
    `(${(-largeur * 7) / 16},${-hauteur / 2})`, // Intérieur bas gauche
  ].join(' -- ')

  // Génération du code TikZ
  const codeTikz = `
    % Lettre A
   \\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt,, rounded corners, line cap=round]
        ${tikzPoints} -- cycle;
    \\draw[draw=${strokeStyle}, line width=${lineWidth * 1.5}pt,, rounded corners, line cap=round]
        (${-largeur / 4},${-hauteur / 5}) -- (${largeur / 4},${-hauteur / 5});
  `.trim()
  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "B".
 * @param options Options pour personnaliser le style de la lettre "B".
 * @returns Une instance de Figure2D représentant une lettre "B".
 */
export function lettreB(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "B" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "B" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "B" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "B" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  // const fillStyle = options?.fillStyle || 'black'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = hauteurPx / 4

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${-largeurPx / 2},${-hauteurPx / 2}
            L 0,${-hauteurPx / 2}
            A ${rayon},${rayon} 0 1,1 0,0
            L ${-largeurPx / 2},0
            L 0,0
            A ${rayon},${rayon} 0 1,1 0,${hauteurPx / 2}
            Z
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linejoin="round" />
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
            % Lettre B
            \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                    (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
                    -- (0,${hauteur / 2})
                    arc[start angle=90, end angle=-90, radius=${rayon / 20}cm]
                    -- (0,0)
                    -- (${-largeur / 2},0)
                    -- (0,0)
                    arc[start angle=90, end angle=-90, radius=${rayon / 20}cm]
                    -- cycle;
    `.trim()

  const axes = [
    segment(-largeur / 1.5, 0, largeur / 1.5, 0), // Axe vertical à gauche
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "C".
 * @param options Options pour personnaliser le style de la lettre "C".
 * @returns Une instance de Figure2D représentant une lettre "C".
 */
export function lettreC(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "C" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "C" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "C" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "C" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.4 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = hauteurPx / 2

  // Génération du code SVG
  const codeSvg = `
                <path d="
                        M ${largeurPx / 2},${-hauteurPx / 2}
                        L ${largeurPx / 4},${-hauteurPx / 2}
                        A ${(rayon * 3) / 4},${rayon} 0 1,0 ${largeurPx / 4},${hauteurPx / 2}
                        L ${largeurPx / 2},${hauteurPx / 2}
                " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linecap="round"/>
        `.trim()

  // Génération du code TikZ
  const codeTikz = `
                            % Lettre C
                            \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                                            (${largeur / 3},${hauteur / 2})
                                            -- (0,${hauteur / 2})
                                            arc[start angle=90, end angle=270, x radius=${(rayon * 3) / 80}cm, y radius=${rayon / 20}cm]
                                            -- (0,${-hauteur / 2})
                                            -- (${largeur / 3},${-hauteur / 2});
            `.trim()

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "D".
 * @param options Options pour personnaliser le style de la lettre "D".
 * @returns Une instance de Figure2D représentant une lettre "D".
 */
export function lettreD(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "D" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "D" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "D" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "D" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = hauteurPx / 2

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${-largeurPx / 2},${-hauteurPx / 2}
            L 0,${-hauteurPx / 2}
            A ${largeurPx / 2},${rayon} 0 1,1 0,${hauteurPx / 2}
            Z
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linejoin="round"/>
    `.trim()
  // Génération du code TikZ
  const codeTikz = `
                % Lettre D
                \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                        (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
                        -- (0,${hauteur / 2})
                        arc[start angle=90, end angle=-90, x radius=${largeur / 2}cm, y radius=${rayon / 20}cm]
                        -- cycle;
        `.trim()
  // Génération du code TikZ

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "E".
 * @param options Options pour personnaliser le style de la lettre "E".
 * @returns Une instance de Figure2D représentant une lettre "E".
 */
export function lettreE(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "E" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "E" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "E" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "E" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
                <path d="
                        M ${largeurPx / 2},${-hauteurPx / 2}
                        L ${-largeurPx / 2},${-hauteurPx / 2}
                        L ${-largeurPx / 2},${hauteurPx / 2}
                        L ${largeurPx / 2},${hauteurPx / 2}
                        M ${-largeurPx / 2},${0}
                        L ${largeurPx / 4},${0}
                " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linejoin="round" stroke-linecap="round" />
        `.trim()

  // Génération du code TikZ
  const codeTikz = `
                % Lettre E
                \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                        (${largeur / 2},${hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
                        -- (${-largeur / 2},${-hauteur / 2}) -- (${largeur / 2},${-hauteur / 2});
                \\draw[draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                        (${-largeur / 2},0) -- (${largeur / 4},0);
        `.trim()

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "F".
 * @param options Options pour personnaliser le style de la lettre "F".
 * @returns Une instance de Figure2D représentant une lettre "F".
 */
export function lettreF(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "F" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "F" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "F" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "F" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 1.9 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${-largeurPx / 2},${-hauteurPx / 2}
            L ${largeurPx / 2},${-hauteurPx / 2}
            M ${-largeurPx / 2},${0}
            L ${largeurPx / 4},${0}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linejoin="round" stroke-linecap="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
                    % Lettre F
                    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                                    (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
                                    -- (${largeur / 2},${hauteur / 2});
                    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
                                    (${-largeur / 2},0) -- (${largeur / 4},0);
    `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(3, 0, -3, 0),
  })
}
/**
 * Génère une figure représentant une lettre "G".
 * @param options Options pour personnaliser le style de la lettre "G".
 * @returns Une instance de Figure2D représentant une lettre "G".
 */
export function lettreG(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "G" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "G" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "G" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "G" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = largeurPx / 1.6
  const offsetX = largeurPx / 4
  const offsetY = hauteurPx / 8

  // Génération du code SVG
  const codeSvg = `
                <path d="
                        M ${offsetX + largeurPx / 3},${-hauteurPx / 3 + offsetY}
                        A ${rayon},${rayon} 0 1,0 ${offsetX + largeurPx / 2},${offsetY}
                        L ${largeurPx / 4},${offsetY}
                " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
        `.trim()

  // Génération du code TikZ
  const codeTikz = `
          % Lettre G
          \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${largeur / 2},${hauteur / 3 - offsetY / 10})
            arc[start angle=60, end angle=360, x radius=${rayon / 20}cm, y radius=${rayon / 20}cm]
            -- (${largeur / 4},${-offsetY / 10});
        `.trim()
  const figure = new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur + offsetX / 10,
    height: hauteur + offsetY / 20,
    opacite,
    nonAxe: null,
  })
  return figure.dilate({ x: 1, y: 1.1 }).translate(0, 0.7)
}
/**
 * Génère une figure représentant une lettre "H".
 * @param options Options pour personnaliser le style de la lettre "H".
 * @returns Une instance de Figure2D représentant une lettre "H".
 */
export function lettreH(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "H" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "H" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "H" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "H" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx * 0.4},${hauteurPx / 2}
            L ${-largeurPx * 0.4},${-hauteurPx / 2}
            M ${largeurPx * 0.4},${hauteurPx / 2}
            L ${largeurPx * 0.4},${-hauteurPx / 2}
            M ${-largeurPx * 0.4},0
            L ${largeurPx * 0.4},0
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre H
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${largeur / 2},${-hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},0) -- (${largeur / 2},0);
    `.trim()

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant une lettre "I".
 * @param options Options pour personnaliser le style de la lettre "I".
 * @returns Une instance de Figure2D représentant une lettre "I".
 */
export function lettreI(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "I" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "I" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "I" (par défaut 1 cm)
  hauteur?: number // Hauteur de la lettre "I" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 0.5 // en cm
  const hauteur = options?.hauteur || 1.7 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${largeurPx / 2},${hauteurPx / 2}
            M 0,${hauteurPx / 2}
            L 0,${-hauteurPx / 2}
            M ${-largeurPx / 2},${-hauteurPx / 2}
            L ${largeurPx / 2},${-hauteurPx / 2}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre I
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (0,${hauteur / 2}) -- (0,${-hauteur / 2});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2}) -- (${largeur / 2},${-hauteur / 2});
    `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant une lettre "J".
 * @param options Options pour personnaliser le style de la lettre "J".
 * @returns Une instance de Figure2D représentant une lettre "J".
 */
export function lettreJ(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "J" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "J" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "J" (par défaut 2 cm)
  hauteur?: number // Hauteur de la lettre "J" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = largeurPx / 2

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2 - largeurPx / 2}
            A ${rayon},${rayon} 1 0,0 ${largeurPx / 2},${hauteurPx / 2 - largeurPx / 2}
            L ${largeurPx / 2},${-hauteurPx / 2}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre J
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2 + largeur / 2})
            arc[start angle=-180, end angle=0, radius=${rayon / 20}cm]
            -- (${largeur / 2},${hauteur / 2});
    `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(-3, 0, 3, 0),
  })
}
/**
 * Génère une figure représentant une lettre "K".
 * @param options Options pour personnaliser le style de la lettre "K".
 * @returns Une instance de Figure2D représentant une lettre "K".
 */
export function lettreK(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "K" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "K" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "K" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "K" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${-largeurPx / 2},${-hauteurPx / 2}
            M ${-largeurPx / 2},0
            L ${largeurPx * 0.4},${hauteurPx / 2}
            M ${-largeurPx / 2},0
            L ${largeurPx * 0.4},${-hauteurPx / 2}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linecap="round" />
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre K
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur * 0.4},0) -- (${largeur * 0.4},${hauteur * 0.5});
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur * 0.4},0) -- (${largeur * 0.4},${-hauteur * 0.5});
    `.trim()

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "L".
 * @param options Options pour personnaliser le style de la lettre "L".
 * @returns Une instance de Figure2D représentant une lettre "L".
 */
export function lettreL(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "L" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "L" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "L" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "L" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.25 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${-hauteurPx / 2}
            L ${-largeurPx / 2},${hauteurPx / 2}
            L ${largeurPx / 2},${hauteurPx / 2}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre L
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${hauteur / 2}) -- (${-largeur / 2},${-hauteur / 2})
            -- (${largeur / 2},${-hauteur / 2});
    `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(-3, 0, 3, 0),
  })
}
/**
 * Génère une figure représentant une lettre "M".
 * @param options Options pour personnaliser le style de la lettre "M".
 * @returns Une instance de Figure2D représentant une lettre "M".
 */
export function lettreM(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "M" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "M" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "M" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "M" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
        <path d="
            M ${-largeurPx / 2},${hauteurPx / 2}
            L ${-largeurPx / 2},${-hauteurPx / 2}
            L 0,${hauteurPx / 4}
            L ${largeurPx / 2},${-hauteurPx / 2}
            L ${largeurPx / 2},${hauteurPx / 2}
        " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre M
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
            -- (0,${hauteur / 4}) -- (${largeur / 2},${hauteur / 2})
            -- (${largeur / 2},${-hauteur / 2});
    `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "N".
 * @param options Options pour personnaliser le style de la lettre "N".
 * @returns Une instance de Figure2D représentant une lettre "N".
 */
export function lettreN(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "N" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "N" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "N" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "N" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
           
            <path d="
                M ${-largeurPx / 2},${hauteurPx / 2}
                L ${-largeurPx / 2},${-hauteurPx / 2}
                L ${largeurPx / 2},${hauteurPx / 2}
                L ${largeurPx / 2},${-hauteurPx / 2}
            " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}"  stroke-linecap="round" stroke-linejoin="round"/>
    `.trim()

  // Génération du code TikZ
  const codeTikz = `
        % Lettre N
        \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
            (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
            -- (${largeur / 2},${-hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
    `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    centre: pointAbstrait(0, 0),
    nonAxe: segment(0, -4, 0, 4),
  })
}
/**
 * Génère une figure représentant une lettre "O".
 * @param options Options pour personnaliser le style de la lettre "O".
 * @returns Une instance de Figure2D représentant une lettre "O".
 */
export function lettreO(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "O" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "O" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "O" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "O" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <ellipse
      cx="0"
      cy="0"
      rx="${largeurPx / 2}"
      ry="${hauteurPx / 2}"
      fill="none"
      stroke="${strokeStyle}"
      stroke-width="${lineWidth}"
    />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre O
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt]
      (0,0) ellipse [x radius=${largeur / 2}cm, y radius=${hauteur / 2}cm];
  `.trim()

  const axes = [
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant une lettre "P".
 * @param options Options pour personnaliser le style de la lettre "P".
 * @returns Une instance de Figure2D représentant une lettre "P".
 */
export function lettreP(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "P" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "P" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "P" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "P" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.9 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = hauteurPx / 4

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${hauteurPx / 2}
      L ${-largeurPx / 2},${-hauteurPx / 2}
      L 0,${-hauteurPx / 2}
      A ${rayon},${rayon} 0 1,1 0,0
      L ${-largeurPx / 2},0
      Z
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre P
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
      -- (0,${hauteur / 2})
      arc[start angle=90, end angle=-90, radius=${rayon / 20}cm]
      -- (${-largeur / 2},0) -- cycle;
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(2.5, 0, -2.5, 0),
  })
}
/**
 * Génère une figure représentant une lettre "Q".
 * @param options Options pour personnaliser le style de la lettre "Q".
 * @returns Une instance de Figure2D représentant une lettre "Q".
 */
export function lettreQ(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "Q" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "Q" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "Q" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "Q" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <ellipse
      cx="0"
      cy="0"
      rx="${largeurPx / 2}"
      ry="${hauteurPx / 2}"
      fill="none"
      stroke="${strokeStyle}"
      stroke-width="${lineWidth}"
    />
    <line
      x1="${largeurPx / 4}"
      y1="${hauteurPx / 4}"
      x2="${largeurPx / 2}"
      y2="${hauteurPx / 2}"
      stroke="${strokeStyle}"
      stroke-width="${lineWidth}"
      stroke-linecap="round"
    />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre Q
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (0,0) ellipse [x radius=${largeur / 2}cm, y radius=${hauteur / 2}cm];
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt, line cap=round]
      (${largeur / 4},${-hauteur / 4}) -- (${largeur / 2},${-hauteur / 2});
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(-3, 3.6, 3, -3.6),
  })
}
/**
 * Génère une figure représentant une lettre "R".
 * @param options Options pour personnaliser le style de la lettre "R".
 * @returns Une instance de Figure2D représentant une lettre "R".
 */
export function lettreR(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "R" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "R" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "R" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "R" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = hauteurPx / 4

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${hauteurPx / 2}
      L ${-largeurPx / 2},${-hauteurPx / 2}
      L 0,${-hauteurPx / 2}
      A ${rayon},${rayon} 0 1,1 0,0
      L ${-largeurPx / 2},0
      M ${-largeurPx / 5},0
      L ${largeurPx / 3},${hauteurPx / 2 - lineWidth / 4}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre R
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${-hauteur / 2}) -- (${-largeur / 2},${hauteur / 2})
      -- (0,${hauteur / 2})
      arc[start angle=90, end angle=-90, radius=${rayon / 20}cm]
      -- (${-largeur / 2},0);
    \\draw[draw=${strokeStyle}, line width=${lineWidth}pt]
      (0,0) -- (${largeur / 2},${-hauteur / 2});
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    nonAxe: segment(-3, 0, 3, 0),
  })
}
/**
 * Génère une figure représentant une lettre "T".
 * @param options Options pour personnaliser le style de la lettre "T".
 * @returns Une instance de Figure2D représentant une lettre "T".
 */
export function lettreT(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "T" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "T" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "T" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "T" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L ${largeurPx / 2},${-hauteurPx / 2}
      M 0,${-hauteurPx / 2}
      L 0,${hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre T
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (0,${hauteur / 2}) -- (0,${-hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "U".
 * @param options Options pour personnaliser le style de la lettre "U".
 * @returns Une instance de Figure2D représentant une lettre "U".
 */
export function lettreU(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "U" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "U" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "U" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "U" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = largeurPx / 2

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L ${-largeurPx / 2},${hauteurPx / 2 - rayon}
      A ${rayon},${rayon} 0 0,0 ${largeurPx / 2},${hauteurPx / 2 - rayon}
      L ${largeurPx / 2},${-hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre U
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (${-largeur / 2},${-hauteur / 2 + largeur / 2})
      arc[start angle=-180, end angle=0, radius=${rayon / 20}cm]
      -- (${largeur / 2},${hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "V".
 * @param options Options pour personnaliser le style de la lettre "V".
 * @returns Une instance de Figure2D représentant une lettre "V".
 */
export function lettreV(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "V" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "V" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "V" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "V" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L 0,${hauteurPx / 2}
      L ${largeurPx / 2},${-hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre V
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (0,${-hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "W".
 * @param options Options pour personnaliser le style de la lettre "W".
 * @returns Une instance de Figure2D représentant une lettre "W".
 */
export function lettreW(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "W" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "W" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "W" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "W" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L ${-largeurPx / 4},${hauteurPx / 2}
      L 0,${-hauteurPx / 4}
      L ${largeurPx / 4},${hauteurPx / 2}
      L ${largeurPx / 2},${-hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre W
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (${-largeur / 4},${-hauteur / 2})
      -- (0,${hauteur / 4}) -- (${largeur / 4},${-hauteur / 2})
      -- (${largeur / 2},${hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "X".
 * @param options Options pour personnaliser le style de la lettre "X".
 * @returns Une instance de Figure2D représentant une lettre "X".
 */
export function lettreX(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "X" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "X" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "X" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "X" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${hauteurPx / 2}
      L ${largeurPx / 2},${-hauteurPx / 2}
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L ${largeurPx / 2},${hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre X
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (${largeur / 2},${-hauteur / 2});
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${-hauteur / 2}) -- (${largeur / 2},${hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
    segment(-largeur / 2, 0, largeur / 2, 0), // Axe horizontal au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
    centre: pointAbstrait(0, 0),
  })
}
/**
 * Génère une figure représentant une lettre "Y".
 * @param options Options pour personnaliser le style de la lettre "Y".
 * @returns Une instance de Figure2D représentant une lettre "Y".
 */
export function lettreY(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "Y" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "Y" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "Y" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "Y" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.9 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx / 2},${-hauteurPx / 2}
      L 0,0
      L ${largeurPx / 2},${-hauteurPx / 2}
      M 0,0
      L 0,${hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round"/>
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre Y
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur / 2},${hauteur / 2}) -- (0,0) -- (${largeur / 2},${hauteur / 2});
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (0,0) -- (0,${-hauteur / 2});
  `.trim()

  const axes = [
    segment(0, -hauteur / 2, 0, hauteur / 2), // Axe vertical au centre
  ]

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    axes,
    opacite,
  })
}
/**
 * Génère une figure représentant une lettre "Z".
 * @param options Options pour personnaliser le style de la lettre "Z".
 * @returns Une instance de Figure2D représentant une lettre "Z".
 */
export function lettreZ(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "Z" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "Z" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "Z" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "Z" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 1.8 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${-largeurPx * 0.4},${-hauteurPx / 2}
      L ${largeurPx * 0.4},${-hauteurPx / 2}
      L ${-largeurPx * 0.4},${hauteurPx / 2}
      L ${largeurPx * 0.4},${hauteurPx / 2}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linejoin="round" />
  `.trim()

  // Génération du code TikZ
  const codeTikz = `
    % Lettre Z
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, rounded corners, line cap=round]
      (${-largeur * 0.4},${hauteur * 0.5}) -- (${largeur * 0.4},${hauteur * 0.5})
      -- (${-largeur * 0.4},${-hauteur * 0.5}) -- (${largeur * 0.4},${-hauteur * 0.5});
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    centre: pointAbstrait(0, 0),
    nonAxe: segment(1.2, 1.8, -1.2, -1.8),
  })
}
/**
 * Génère une figure représentant une lettre "S".
 * @param options Options pour personnaliser le style de la lettre "S".
 * @returns Une instance de Figure2D représentant une lettre "S".
 */
export function lettreS(options?: {
  fillStyle?: string // Couleur de remplissage de la lettre "S" (par défaut noir)
  strokeStyle?: string // Couleur de la bordure de la lettre "S" (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure
  largeur?: number // Largeur de la lettre "S" (par défaut 3 cm)
  hauteur?: number // Hauteur de la lettre "S" (par défaut 4 cm)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 8
  const largeur = options?.largeur || 1.5 // en cm
  const hauteur = options?.hauteur || 2 // en cm
  const opacite = options?.opacite || 1

  // Conversion des dimensions en pixels (20 pixels par cm)
  const largeurPx = largeur * 20
  const hauteurPx = hauteur * 20
  const rayon = largeurPx / 2

  // Génération du code SVG
  const codeSvg = `
    <path d="
      M ${largeurPx / 2},${-hauteurPx / 4}
      A ${rayon},${rayon * 0.8} 0 0,0 ${0},${-hauteurPx / 2}
      A ${rayon},${rayon} 0 0,0 ${-largeurPx / 2},${-hauteurPx / 4}
      A ${rayon},${rayon * 0.8} 0 0,0 0,0
      A ${rayon},${rayon * 0.8} 0 0,1 ${largeurPx / 2},${hauteurPx / 4}
      A ${rayon},${rayon} 0 0,1 ${0},${hauteurPx / 2}
      A ${rayon},${rayon * 0.8} 0 0,1 ${-largeurPx / 2},${hauteurPx / 4}
    " fill="none" stroke="${strokeStyle}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round" />
  `.trim()
  // Adaptation du code TikZ pour correspondre au SVG
  // Le SVG dessine la lettre S avec une succession d'arcs alternés, on adapte donc le TikZ :
  // On part du haut à droite, on fait un arc vers le haut gauche, puis vers le bas gauche, puis vers le centre, puis vers le bas droite, puis vers le bas centre, puis vers le bas gauche.
  // Les rayons sont adaptés pour correspondre à ceux du SVG.

  // Génération du code TikZ
  const codeTikz = `
    % Lettre S
    \\draw[fill=none, draw=${strokeStyle}, line width=${lineWidth}pt, line cap=round]
      (${largeur / 2},${hauteur / 4}) arc[start angle=0, end angle=90, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm]
       arc[start angle=90, end angle=180, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm]
       arc[start angle=180, end angle=270, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm]
       arc[start angle=90, end angle=0, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm]
       arc[start angle=0, end angle=-90, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm]
       arc[start angle=-90, end angle=-180, x radius=${rayon / 20}cm, y radius=${hauteur / 4}cm];
  `.trim()

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: largeur,
    height: hauteur,
    opacite,
    centre: pointAbstrait(0, 0),
    nonAxe: segment(-largeur, 0, largeur, 0), // ce n'est pas un axe de symétrie, il sera utilisé dans la correction pour montrer que ce n'est pas symétrique
  })
}
