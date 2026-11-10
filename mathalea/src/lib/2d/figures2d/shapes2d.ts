import { Shape2D } from '../Figures2D'
import { ObjetMathalea2D } from '../ObjetMathalea2D'
import { emoji } from './Emojis'

export function shapeDefToShapeSvg(shapeName: string): string {
  const shapeDef = listeShapes2DInfos[shapeName].shapeDef
  const svg = shapeDef.svg ? String(shapeDef.svg(20)) : ''
  return svg.replace('<defs>', '').replace('</defs>', '').replaceAll('\n', '')
}

/*
La classe Shape2D est définie ddans le fichier Figures2D.ts car elle est une version simplifiée de la classe Figure2D.
Elle représente une forme géométrique 2D avec des propriétés de base comme le code SVG, le code TikZ, la largeur, la hauteur, l'opacité et le nom.
Elle est utilisée pour créer des formes géométriques simples comme des carrés, des ronds, des étoiles, etc.
Si vous ajoutez une nouvelle forme géométrique, respectez le format 20x20 pixels et pensez à l'ajouter à la liste qui se trouve en fin de fichier.
Il y a 2 constantes exportées qui sont l'instance de Shape2D et l'instance de ObjetMathalea2D qui définit la forme utilisée dans le code svg et tikz afin de limiter la taille du code nécessaire.
Voir l'exemple de shapeChat et chatDef.
 */
export const shapeCarre = new Shape2D({
  codeSvg: '<use href="#carre"></use>',
  codeTikz: '\\pic at (0,0) {carre};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'carré',
})
export const shapeCarreBleu = new Shape2D({
  codeSvg: '<use href="#carre-bleu"></use>',
  codeTikz: '\\pic at (0,0) {carre-bleu};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'carré bleu',
})

export const shapeRectangle = new Shape2D({
  codeSvg: '<use href="#rectangle-vert"></use>',
  codeTikz: '\\pic at (0,0) {rectangle-vert};',
  width: 1,
  height: 0.5,
  opacite: 1,
  name: 'rectangle',
})

export const rectangleDef = new ObjetMathalea2D()
rectangleDef.bordures = [-0.5, -0.25, 0.5, 0.25]
rectangleDef.svg = function (_coeff: number): string {
  return `
  <!-- Rectangle 1x0.5 -->
  <defs>
    <g id="rectangle-vert">
      <rect x="-10" y="-5" width="20" height="10" fill="green" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
rectangleDef.tikz = function (): string {
  return `
  \\tikzset{
   rectangle-vert/.pic = {
    \\draw[fill=green, draw=black, line width=0.3pt] (-0.5,-0.25) rectangle (0.5,0.25);
   }
  }`.trim()
}
export const shapeAllumette = new Shape2D({
  codeSvg: '<use href="#allumette-verticale"></use>',
  codeTikz: '\\pic at (0,0) {allumette-verticale};',
  width: 0.2,
  height: 1,
  opacite: 1,
  name: 'allumetteV',
})

export const shapeAllumetteHorizontale = new Shape2D({
  codeSvg: '<use href="#allumette-verticale" transform="rotate(90)"></use>',
  codeTikz: '\\pic[rotate=90] at (0,0) {allumette-verticale};',
  width: 1,
  height: 0.2,
  opacite: 1,
  name: 'allumetteH',
})

export const shapeAllumette60 = new Shape2D({
  codeSvg: '<use href="#allumette-verticale" transform="rotate(30)"></use>',
  codeTikz: '\\pic[rotate=-30] at (0,0) {allumette-verticale};',
  width: 0.8,
  height: 0.8,
  opacite: 1,
  name: 'allumette60',
})

export const shapeAllumette120 = new Shape2D({
  codeSvg: '<use href="#allumette-verticale" transform="rotate(-30)"></use>',
  codeTikz: '\\pic[rotate=30] at (0,0) {allumette-verticale};',
  width: 0.8,
  height: 0.8,
  opacite: 1,
  name: 'allumette120',
})

export const allumetteDef = new ObjetMathalea2D()
allumetteDef.bordures = [-0.1, -0.5, 0.1, 0.5]
allumetteDef.svg = function (_coeff: number): string {
  return `
  <!-- Allumette verticale -->
  <defs>
    <g id="allumette-verticale">
      <rect x="-1" y="-8" width="2" height="18" fill="#deb887" stroke="#8b5c2a" stroke-width="0.5"/>
      <ellipse cx="0" cy="-9" rx="1.5" ry="2" fill="red" stroke="darkred" stroke-width="0.5"/>
    </g>
  </defs>`
}
allumetteDef.tikz = function (): string {
  return `
  \\tikzset{
   allumette-verticale/.pic = {
    % Tige
    \\draw[fill=brown!30!yellow, draw=brown!80!black, line width=0.3pt] (-0.05,-0.5) rectangle (0.05,0.4);
    % Tête
    \\draw[fill=red, draw=red!70!black, line width=0.3pt] (0,0.45) ellipse [x radius=0.075, y radius=0.1];
   }
  }`.trim()
}

export const shapeSegmentHorizontal = new Shape2D({
  codeSvg: '<use href="#segment-horizontal"></use>',
  codeTikz: '\\pic at (0,0) {segment-horizontal};',
  width: 1,
  height: 0,
  opacite: 1,
  name: 'segment horizontal',
})

export const segmentHorizontalDef = new ObjetMathalea2D()
segmentHorizontalDef.bordures = [0, 0, 1, 0]
segmentHorizontalDef.svg = function (_coeff: number): string {
  return `
  <!-- Segment horizontal de (0,0) à (1,0) -->
  <defs>
      <line id="segment-horizontal" x1="-10" y1="0" x2="10" y2="0" stroke="black" stroke-width="2" />
  </defs>`
}

segmentHorizontalDef.tikz = function (): string {
  return `
  \\tikzset{
   segment-horizontal/.pic = {
    \\draw[thick] (-0.5,0) -- (0.5,0);
   }
  }`.trim()
}

export const shapeRectangleBlanc = new Shape2D({
  codeSvg: '<use href="#rectangle-blanc"></use>',
  codeTikz: '\\pic at (0,0) {rectangle-blanc};',
  width: 1,
  height: 0.5,
  opacite: 1,
  name: 'rectangle blanc',
})

export const rectangleBlancDef = new ObjetMathalea2D()
rectangleBlancDef.bordures = [-0.5, -0.25, 0.5, 0.25]
rectangleBlancDef.svg = function (_coeff: number): string {
  return `
  <!-- Rectangle blanc 1x0.5 -->
  <defs>
    <g id="rectangle-blanc">
      <rect x="-10" y="-5" width="20" height="10" fill="white" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
rectangleBlancDef.tikz = function (): string {
  return `
  \\tikzset{
   rectangle-blanc/.pic = {
    \\draw[fill=white, draw=black, line width=0.3pt] (-0.5,-0.25) rectangle (0.5,0.25);
   }
  }`.trim()
}

/**
 * Génère une figure représentant un carré aux bords arrondis de côté 0.8 centré en (0,0).
 * @returns Une instance de Shape2D représentant un carré aux coins arrondis.
 */
export const shapeCarreArrondi = new Shape2D({
  codeSvg: '<use href="#carre-arrondi"></use>',
  codeTikz: '\\pic at (0,0) {carre-arrondi};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'pastille',
})

/**
 * Génère une figure représentant un losange de taille 1x1 centré en (0,0).
 * @returns Une instance de Shape2D représentant un losange.
 */
export const shapeLosange = new Shape2D({
  codeSvg: '<use href="#losange"></use>',
  codeTikz: '\\pic at (0,0) {losange};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'losange',
})

export const shapeHexagone = new Shape2D({
  codeSvg: '<use href="#hexagone"></use>',
  codeTikz: '\\pic at (0,0) {hexagone};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'hexagone',
})

export const shapeHexagoneJaune = new Shape2D({
  codeSvg: '<use href="#hexagoneJaune"></use>',
  codeTikz: '\\pic at (0,0) {hexagoneJaune};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'hexagoneJaune',
})

export const shapePentagone = new Shape2D({
  codeSvg: '<use href="#pentagone"></use>',
  codeTikz: '\\pic at (0,0) {pentagone};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'pentagone',
})

export const pentagoneDef = new ObjetMathalea2D()
pentagoneDef.bordures = [-0.5, -0.5, 0.5, 0.5]
pentagoneDef.svg = function (_coeff: number): string {
  return `
  <!-- Pentagone régulier -->
  <defs>
    <g id="pentagone">
      <polygon points="0,-10 9.51,-3.09 5.88,8.09 -5.88,8.09 -9.51,-3.09"
        fill="orange" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
pentagoneDef.tikz = function (): string {
  return `
  \\tikzset{
   pentagone/.pic = {
    \\draw[fill=orange, draw=black, line width=0.3pt]
      (0,0.5) -- (0.475,0.154) -- (0.294,-0.404) -- (-0.294,-0.404) -- (-0.475,0.154) -- cycle;
   }
  }`.trim()
}

export const carreRondDef = new ObjetMathalea2D()
carreRondDef.bordures = [-0.5, -0.5, 0.5, 0.5]
carreRondDef.svg = function (_coeff: number): string {
  return `
  <!-- Carré arrondi -->
  <defs>
    <g id="carre-arrondi">
      <rect x="-8" y="-8" width="16" height="16" rx="3" ry="3"
        fill="gray" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
carreRondDef.tikz = function (): string {
  return `
  \\tikzset{
   carre-arrondi/.pic = {
    % Carré arrondi
    \\draw[fill=gray, draw=darkgray, line width=0.3pt, rounded corners=0.07cm]
      (-0.4,-0.4) rectangle (0.4,0.4);
   }
  }`.trim()
}
export const losangeDef = new ObjetMathalea2D()
losangeDef.bordures = [-0.5, -0.5, 0.5, 0.5]
losangeDef.svg = function (_coeff: number): string {
  return `
  <!-- Losange -->
  <defs>
      <polygon id="losange" points="0,-6 8,0 0,6 -8,0"
        fill="pink" stroke="black" stroke-width="0.3" />
  </defs>`
}
losangeDef.tikz = function (): string {
  return `
  \\tikzset{
   losange/.pic = {
    % Losange
    \\draw[fill=pink, draw=darkgray, line width=0.3pt]
      (0,-0.3) -- (0.5,0) -- (0,0.3) -- (-0.5,0) -- cycle;
   }
  }`.trim()
}

export const carreDef = new ObjetMathalea2D()
carreDef.bordures = [-0.5, -0.5, 0.5, 0.5]
carreDef.svg = function (_coeff: number): string {
  return `
  <!-- Carré -->
  <defs>
      <rect id="carre" x="-10" y="-10" width="20" height="20"
        fill="gray" stroke="black" stroke-width="0.5" />
  </defs>`
}
carreDef.tikz = function (): string {
  return `
  \\tikzset{
   carre/.pic = {
    % Carré
    \\draw[fill=gray, draw=darkgray, line width=0.3pt] (-0.5,-0.5) rectangle (0.5,0.5);
   }
  }`.trim()
}

export const carreBleuDef = new ObjetMathalea2D()
carreBleuDef.bordures = [-0.5, -0.5, 0.5, 0.5]
carreBleuDef.svg = function (_coeff: number): string {
  return `
  <!-- Carré bleu -->
  <defs>
      <rect id="carre-bleu" x="-10" y="-10" width="20" height="20"
        fill=blue stroke="black" stroke-width="0.5" />
  </defs>`
}
carreBleuDef.tikz = function (): string {
  return `
  \\tikzset{
   carre-bleu/.pic = {
    % Carré bleu
    \\draw[fill=blue, draw=darkgray, line width=0.3pt] (-0.5,-0.5) rectangle (0.5,0.5);
   }
  }`.trim()
}

export const hexagoneDef = new ObjetMathalea2D()
hexagoneDef.bordures = [-0.5, -0.5, 0.5, 0.5]
hexagoneDef.svg = function (_coeff: number): string {
  return `
  <!-- Hexagone -->
  <defs>
    <g id="hexagone">
      <polygon points="10,0 5,8.66 -5,8.66 -10,0 -5,-8.66 5,-8.66"
        fill="lightblue" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
hexagoneDef.tikz = function (): string {
  return `
  \\tikzset{
   hexagone/.pic = {
    \\draw[fill=cyan!30, draw=darkgray, line width=0.3pt]
      (0.5,0) -- (0.25,0.433) -- (-0.25,0.433) -- (-0.5,0) -- (-0.25,-0.433) -- (0.25,-0.433) -- cycle;
   }
  }`.trim()
}

export const hexagoneJauneDef = new ObjetMathalea2D()
hexagoneJauneDef.bordures = [-0.5, -0.5, 0.5, 0.5]
hexagoneJauneDef.svg = function (_coeff: number): string {
  return `
  <!-- Hexagone -->
  <defs>
    <g id="hexagoneJaune">
      <polygon points="10,0 5,8.66 -5,8.66 -10,0 -5,-8.66 5,-8.66"
        fill="yellow" stroke="black" stroke-width="0.5" />
    </g>
  </defs>`
}
hexagoneJauneDef.tikz = function (): string {
  return `
  \\tikzset{
   hexagoneJaune/.pic = {
    \\draw[fill=yellow, draw=darkgray, line width=0.3pt]
      (0.5,0) -- (0.25,0.433) -- (-0.25,0.433) -- (-0.5,0) -- (-0.25,-0.433) -- (0.25,-0.433) -- cycle;
   }
  }`.trim()
}

export const shapeRond = new Shape2D({
  codeSvg: '<use href="#rond"></use>',
  codeTikz: '\\pic at (0,0) {rond};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'rond',
})

export const rondDef = new ObjetMathalea2D()
rondDef.bordures = [-0.5, -0.5, 0.5, 0.5]
rondDef.svg = function (_coeff: number): string {
  return `
  <!-- Rond -->
  <defs>
    <g id="rond">
      <circle cx="0" cy="0" r="10" fill="lightblue" stroke=blue stroke-width="0.5" />
    </g>
  </defs>`
}
rondDef.tikz = function (): string {
  return `
  \\tikzset{
   rond/.pic = {
    \\draw[fill=cyan!30, draw=blue, line width=0.3pt] (0,0) circle (0.5);
   }
  }`.trim()
}
export const shapeBalle = new Shape2D({
  codeSvg: '<use href="#balle"></use>',
  codeTikz: '\\pic at (0,0) {balle};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'balle',
})

export const balleDef = new ObjetMathalea2D()
balleDef.bordures = [-0.5, -0.5, 0.5, 0.5]
balleDef.svg = function (_coeff: number): string {
  return `
  <!-- Balle de tennis -->
 <defs>
    <g id="balle" transform="scale(0.2) translate(-60, -60)">
      <!-- Dégradé -->
      <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stop-color="#f7f95a" />
        <stop offset="100%" stop-color="#b6d100" />
      </radialGradient>

      <!-- Ombre -->
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
      </filter>

      <!-- Corps de la balle -->
      <circle cx="60" cy="60" r="50" fill="url(#grad)" filter="url(#shadow)" />

      <!-- Couture principale -->
      <path d="M20,35 C40,30 80,35 100,25" stroke="white" stroke-width="5" fill="none" />

      <!-- Couture secondaire (plus haute et réduite) -->
      <path d="M35,110 C60,85 85,80 115,70" stroke="white" stroke-width="5" fill="none" />
    </g>
  </defs>`
}
balleDef.tikz = function (): string {
  return `
  \\tikzset{
   balle/.pic = {
    % Balle de tennis jaune citron
    \\shade[ball color=lime, opacity=0.5] 
      (0,0) circle (0.5);
    % Couture principale
    \\draw[white, line width=0.3pt] 
      plot [smooth, tension=1] coordinates {(-0.45,-0.15) (-0.2,-0.22) (0.1,-0.18) (0.45,-0.25)};
    % Couture secondaire
    \\draw[white, line width=0.3pt] 
      plot [smooth, tension=1] coordinates {(-0.45,0.4) (-0.15,0.25) (0.2,0.28) (0.45,0.15)};
   }
  }`.trim()
}
export const shapeTriangleEquilateral = new Shape2D({
  codeSvg: '<use href="#triangle-equilateral"></use>',
  codeTikz: '\\pic at (0,0) {triangle-equilateral};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'triangle équilatéral',
})

export const triangleEquilateralDef = new ObjetMathalea2D()
triangleEquilateralDef.bordures = [-0.5, -0.5, 0.5, 0.5]
triangleEquilateralDef.svg = function (_coeff: number): string {
  return `
  <!-- Triangle équilatéral -->
  <defs>
    <g id="triangle-equilateral">
      <polygon points="0,-10 8.666,5 -8.666,5"
        fill="lightgreen" stroke="darkgreen" stroke-width="0.5" />
    </g>
  </defs>`
}
triangleEquilateralDef.tikz = function (): string {
  return `
  \\tikzset{
   triangle-equilateral/.pic = {
    \\draw[fill=green!20, draw=green!50!black, line width=0.3pt]
      (0,0.5) -- (0.433,-0.25) -- (-0.433,-0.25) -- cycle;
   }
  }`.trim()
}
export const shapeRedCross = new Shape2D({
  codeSvg: '<use href="#red-cross"></use>',
  codeTikz: '\\pic at (0,0) {red-cross};',
  width: 1,
  height: 1,
  opacite: 1,
  name: 'red cross',
})

export const redCrossDef = new ObjetMathalea2D()
redCrossDef.bordures = [-0.5, -0.5, 0.5, 0.5]
redCrossDef.svg = function (_coeff: number): string {
  return `
  <!-- Red Cross -->
  <defs>
    <g id="red-cross">
      <rect x="-3" y="-10" width="6" height="20" fill="red" stroke="darkred" stroke-width="0.5"/>
      <rect x="-10" y="-3" width="20" height="6" fill="red" stroke="darkred" stroke-width="0.5"/>
    </g>
  </defs>`
}
redCrossDef.tikz = function (): string {
  return `
  \\tikzset{
   red-cross/.pic = {
    % Red Cross
    \\draw[fill=red, draw=red!70!black, line width=0.3pt] (-0.15,-0.5) rectangle (0.15,0.5);
    \\draw[fill=red, draw=red!70!black, line width=0.3pt] (-0.5,-0.15) rectangle (0.5,0.15);
   }
  }`.trim()
}

export const shapeNames: string[] = [
  'carré',
  'carréRond',
  'losange',
  'hexagone',
  'pentagone',
  'rond',
  'balle',
  'triangle',
  'redCross',
  'carréBleu',
  'hexagoneJaune',
  'rectangleBlanc',
  'rectangleVert',
  'allumetteV',
  'allumetteH',
  'allumette60',
  'allumette120',
  'segmentHorizontal',
]

export type ShapeName = (typeof shapeNames)[number]

export type ShapeInfos = {
  shape2D: Shape2D
  nomSingulier: string
  nomPluriel: string
  shapeDef: ObjetMathalea2D
  articleSingulier: string
  articlePluriel: string
  articleCourt: string
}

export const listeShapes2DInfos: Record<string, ShapeInfos> = {
  carré: {
    shape2D: shapeCarre,
    nomSingulier: 'carré',
    nomPluriel: 'carrés',
    shapeDef: carreDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  carréRond: {
    shape2D: shapeCarreArrondi,
    nomSingulier: 'carré arrondi',
    nomPluriel: 'carrés arrondis',
    shapeDef: carreRondDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  losange: {
    shape2D: shapeLosange,
    nomSingulier: 'losange',
    nomPluriel: 'losanges',
    shapeDef: losangeDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  hexagone: {
    shape2D: shapeHexagone,
    nomSingulier: 'hexagone',
    nomPluriel: 'hexagones',
    shapeDef: hexagoneDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  pentagone: {
    shape2D: shapePentagone,
    nomSingulier: 'pentagone',
    nomPluriel: 'pentagones',
    shapeDef: pentagoneDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  rond: {
    shape2D: shapeRond,
    nomSingulier: 'disque',
    nomPluriel: 'disques',
    shapeDef: rondDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  balle: {
    shape2D: shapeBalle,
    nomSingulier: 'balle',
    nomPluriel: 'balles',
    shapeDef: balleDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  triangle: {
    shape2D: shapeTriangleEquilateral,
    nomSingulier: 'triangle équilatéral',
    nomPluriel: 'triangles équilatéraux',
    shapeDef: triangleEquilateralDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  redCross: {
    shape2D: shapeRedCross,
    nomSingulier: 'croix rouge',
    nomPluriel: 'croix rouges',
    shapeDef: redCrossDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  carréBleu: {
    shape2D: shapeCarreBleu,
    nomSingulier: 'carré bleu',
    nomPluriel: 'carrés bleus',
    shapeDef: carreBleuDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  hexagoneJaune: {
    shape2D: shapeHexagoneJaune,
    nomSingulier: 'hexagone jaune',
    nomPluriel: 'hexagones jaunes',
    shapeDef: hexagoneJauneDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  rectangleBlanc: {
    shape2D: shapeRectangleBlanc,
    nomSingulier: 'rectangle blanc',
    nomPluriel: 'rectangles blancs',
    shapeDef: rectangleBlancDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  rectangleVert: {
    shape2D: shapeRectangle,
    nomSingulier: 'rectangle vert',
    nomPluriel: 'rectangles verts',
    shapeDef: rectangleDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  allumetteV: {
    shape2D: shapeAllumette,
    nomSingulier: 'allumette',
    nomPluriel: 'allumettes',
    shapeDef: allumetteDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  allumetteH: {
    shape2D: shapeAllumetteHorizontale,
    nomSingulier: 'allumette',
    nomPluriel: 'allumettes',
    shapeDef: allumetteDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  allumette60: {
    shape2D: shapeAllumette60,
    nomSingulier: 'allumette',
    nomPluriel: 'allumettes',
    shapeDef: allumetteDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  allumette120: {
    shape2D: shapeAllumette120,
    nomSingulier: 'allumette',
    nomPluriel: 'allumettes',
    shapeDef: allumetteDef,
    articleSingulier: 'une',
    articlePluriel: 'des',
    articleCourt: "d'",
  },
  segmentHorizontal: {
    shape2D: shapeSegmentHorizontal,
    nomSingulier: 'segment horizontal',
    nomPluriel: 'segments horizontaux',
    shapeDef: segmentHorizontalDef,
    articleSingulier: 'un',
    articlePluriel: 'des',
    articleCourt: 'de ',
  },
  smiley: {
    shape2D: emoji('smiley', '1f603'),
    shapeDef: emoji('smiley', '1f603').shapeDef,
    nomPluriel: 'smileys',
    nomSingulier: 'smiley',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  heart: {
    shape2D: emoji('heart', '2764'),
    shapeDef: emoji('heart', '2764').shapeDef,
    nomPluriel: 'cœurs',
    nomSingulier: 'cœur',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  thumbsUp: {
    shape2D: emoji('thumbsUp', '1f44d'),
    shapeDef: emoji('thumbsUp', '1f44d').shapeDef,
    nomPluriel: 'pouces levés',
    nomSingulier: 'pouce levé',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  étoile: {
    shape2D: emoji('étoile', '2b50'),
    shapeDef: emoji('étoile', '2b50').shapeDef,
    nomPluriel: 'étoiles',
    nomSingulier: 'étoile',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: "d'",
  },
  pizza: {
    shape2D: emoji('pizza', '1f355'),
    shapeDef: emoji('pizza', '1f355').shapeDef,
    nomPluriel: 'parts de pizza',
    nomSingulier: 'part de pizza',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  licorne: {
    shape2D: emoji('licorne', '1f984'),
    shapeDef: emoji('licorne', '1f984').shapeDef,
    nomPluriel: 'licornes',
    nomSingulier: 'licorne',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  chien: {
    shape2D: emoji('chien', '1f436'),
    shapeDef: emoji('chien', '1f436').shapeDef,
    nomPluriel: 'chiens',
    nomSingulier: 'chien',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  chat: {
    shape2D: emoji('chat', '1f431'),
    shapeDef: emoji('chat', '1f431').shapeDef,
    nomPluriel: 'chats',
    nomSingulier: 'chat',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  souris: {
    shape2D: emoji('souris', '1f42d'),
    shapeDef: emoji('souris', '1f42d').shapeDef,
    nomPluriel: 'souris',
    nomSingulier: 'souris',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  tortue: {
    shape2D: emoji('tortue', '1f422'),
    shapeDef: emoji('tortue', '1f422').shapeDef,
    nomPluriel: 'tortues',
    nomSingulier: 'tortue',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  pieuvre: {
    shape2D: emoji('pieuvre', '1f419'),
    shapeDef: emoji('pieuvre', '1f419').shapeDef,
    nomPluriel: 'pieuvres',
    nomSingulier: 'pieuvre',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  poisson: {
    shape2D: emoji('poisson', '1f41f'),
    shapeDef: emoji('poisson', '1f41f').shapeDef,
    nomPluriel: 'poissons',
    nomSingulier: 'poisson',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  papillon: {
    shape2D: emoji('papillon', '1f98b'),
    shapeDef: emoji('papillon', '1f98b').shapeDef,
    nomPluriel: 'papillons',
    nomSingulier: 'papillon',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  fantome: {
    shape2D: emoji('fantome', '1f47b'),
    shapeDef: emoji('fantome', '1f47b').shapeDef,
    nomPluriel: 'fantômes',
    nomSingulier: 'fantôme',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  dragon: {
    shape2D: emoji('dragon', '1f409'),
    shapeDef: emoji('dragon', '1f409').shapeDef,
    nomPluriel: 'dragons',
    nomSingulier: 'dragon',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  feu: {
    shape2D: emoji('feu', '1f525'),
    shapeDef: emoji('feu', '1f525').shapeDef,
    nomPluriel: 'feux',
    nomSingulier: 'feu',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  fleur: {
    shape2D: emoji('fleur', '1f33c'),
    shapeDef: emoji('fleur', '1f33c').shapeDef,
    nomPluriel: 'fleurs',
    nomSingulier: 'fleur',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  etoileBrillante: {
    shape2D: emoji('étoileBrillante', '1f31f'),
    shapeDef: emoji('étoileBrillante', '1f31f').shapeDef,
    nomPluriel: 'étoiles brillantes',
    nomSingulier: 'étoile brillante',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: "d'",
  },
  cloche: {
    shape2D: emoji('cloche', '1f514'),
    shapeDef: emoji('cloche', '1f514').shapeDef,
    nomPluriel: 'cloches',
    nomSingulier: 'cloche',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  crotte: {
    shape2D: emoji('crotte', '1f4a9'),
    shapeDef: emoji('crotte', '1f4a9').shapeDef,
    nomPluriel: 'crottes',
    nomSingulier: 'crotte',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  fusee: {
    shape2D: emoji('fusee', '1f680'),
    shapeDef: emoji('fusee', '1f680').shapeDef,
    nomPluriel: 'fusées',
    nomSingulier: 'fusée',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  drapeauDamier: {
    shape2D: emoji('drapeauDamier', '1f3c1'),
    shapeDef: emoji('drapeauDamier', '1f3c1').shapeDef,
    nomPluriel: 'drapeaux à damier',
    nomSingulier: 'drapeau à damier',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  arcEnCiel: {
    shape2D: emoji('arcEnCiel', '1f308'),
    shapeDef: emoji('arcEnCiel', '1f308').shapeDef,
    nomPluriel: 'arcs-en-ciel',
    nomSingulier: 'arc-en-ciel',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: "d'",
  },
  soleil: {
    shape2D: emoji('soleil', '2600'),
    shapeDef: emoji('soleil', '2600').shapeDef,
    nomPluriel: 'soleils',
    nomSingulier: 'soleil',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  lune: {
    shape2D: emoji('lune', '1f319'),
    shapeDef: emoji('lune', '1f319').shapeDef,
    nomPluriel: 'lunes',
    nomSingulier: 'lune',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  nuage: {
    shape2D: emoji('nuage', '2601'),
    shapeDef: emoji('nuage', '2601').shapeDef,
    nomPluriel: 'nuages',
    nomSingulier: 'nuage',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  cerise: {
    shape2D: emoji('cerise', '1f352'),
    shapeDef: emoji('cerise', '1f352').shapeDef,
    nomPluriel: 'paires de cerises',
    nomSingulier: 'paire de cerises',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  pomme: {
    shape2D: emoji('pomme', '1f34e'),
    shapeDef: emoji('pomme', '1f34e').shapeDef,
    nomPluriel: 'pommes',
    nomSingulier: 'pomme',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  biere: {
    shape2D: emoji('biere', '1f37a'),
    shapeDef: emoji('biere', '1f37a').shapeDef,
    nomPluriel: 'bières',
    nomSingulier: 'bière',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  pingouin: {
    shape2D: emoji('pingouin', '1f427'),
    shapeDef: emoji('pingouin', '1f427').shapeDef,
    nomPluriel: 'pingouins',
    nomSingulier: 'pingouin',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  banane: {
    shape2D: emoji('banane', '1f34c'),
    shapeDef: emoji('banane', '1f34c').shapeDef,
    nomPluriel: 'bananes',
    nomSingulier: 'banane',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  fraise: {
    shape2D: emoji('fraise', '1f353'),
    shapeDef: emoji('fraise', '1f353').shapeDef,
    nomPluriel: 'fraises',
    nomSingulier: 'fraise',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  raisin: {
    shape2D: emoji('raisin', '1f347'),
    shapeDef: emoji('raisin', '1f347').shapeDef,
    nomPluriel: 'grappes de raisin',
    nomSingulier: 'grappe de raisin',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  pasteque: {
    shape2D: emoji('pasteque', '1f349'),
    shapeDef: emoji('pasteque', '1f349').shapeDef,
    nomPluriel: 'parts de pastèque',
    nomSingulier: 'part de pastèque',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  melon: {
    shape2D: emoji('melon', '1f348'),
    shapeDef: emoji('melon', '1f348').shapeDef,
    nomPluriel: 'melons',
    nomSingulier: 'melon',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  orange: {
    shape2D: emoji('orange', '1f34a'),
    shapeDef: emoji('orange', '1f34a').shapeDef,
    nomPluriel: 'oranges',
    nomSingulier: 'orange',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: "d'",
  },
  citron: {
    shape2D: emoji('citron', '1f34b'),
    shapeDef: emoji('citron', '1f34b').shapeDef,
    nomPluriel: 'citrons',
    nomSingulier: 'citron',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  peche: {
    shape2D: emoji('peche', '1f351'),
    shapeDef: emoji('peche', '1f351').shapeDef,
    nomPluriel: 'pêches',
    nomSingulier: 'pêche',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  poire: {
    shape2D: emoji('poire', '1f350'),
    shapeDef: emoji('poire', '1f350').shapeDef,
    nomPluriel: 'poires',
    nomSingulier: 'poire',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  ananas: {
    shape2D: emoji('ananas', '1f34d'),
    shapeDef: emoji('ananas', '1f34d').shapeDef,
    nomPluriel: 'ananas',
    nomSingulier: 'ananas',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: "d'",
  },
  kiwi: {
    shape2D: emoji('kiwi', '1f95d'),
    shapeDef: emoji('kiwi', '1f95d').shapeDef,
    nomPluriel: 'kiwis',
    nomSingulier: 'kiwi',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
  mangue: {
    shape2D: emoji('mangue', '1f96d'),
    shapeDef: emoji('mangue', '1f96d').shapeDef,
    nomPluriel: 'mangues',
    nomSingulier: 'mangue',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: 'de ',
  },
  explosion: {
    shape2D: emoji('explosion', '1f4a5'),
    shapeDef: emoji('explosion', '1f4a5').shapeDef,
    nomPluriel: 'explosions',
    nomSingulier: 'explosion',
    articlePluriel: 'des',
    articleSingulier: 'une',
    articleCourt: "d'",
  },
  cadeau: {
    shape2D: emoji('cadeau', '1f381'),
    shapeDef: emoji('cadeau', '1f381').shapeDef,
    nomPluriel: 'cadeaux',
    nomSingulier: 'cadeau',
    articlePluriel: 'des',
    articleSingulier: 'un',
    articleCourt: 'de ',
  },
}
