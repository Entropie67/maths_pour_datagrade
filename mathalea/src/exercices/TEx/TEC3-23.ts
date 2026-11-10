import Figure from 'apigeom'
import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Placer l'image de nombres complexes écrits sous forme exponentielle"
export const interactifReady = true
export const dateDePublication = '05/11/2026'
export const uuid = 'a42b4'
export const refs = {
  'fr-fr': ['TEC3-23'],
  'fr-ch': [],
}

// En interactivité, les points sont E, F, G… (A, B, C… sont réservés aux constructions de l'élève)
const nomsInteractif = ['E', 'F', 'G', 'H', 'I', 'J']
const nomsClassique = ['A', 'B', 'C', 'D', 'E', 'F']
const LIMITE = 4 // demi-largeur du repère

/** Une coordonnée : k × √rac (rac vaut 1, 2 ou 3) */
type Coordonnee = { k: number; rac: 1 | 2 | 3 }
const valeur = (c: Coordonnee) => c.k * Math.sqrt(c.rac)
const texCoord = (c: Coordonnee) => {
  if (c.k === 0) return '0'
  const signe = c.k < 0 ? '-' : ''
  const abs = Math.abs(c.k)
  if (c.rac === 1) return `${signe}${abs}`
  return `${signe}${abs === 1 ? '' : abs}\\sqrt{${c.rac}}`
}

/** Directions possibles : type 1 (multiples de π/2), 2 (π/4), 3 (π/6 et π/3) */
const directions = [
  { type: 1, deg: 90, theta: '\\dfrac{\\pi}{2}' },
  { type: 1, deg: -90, theta: '-\\dfrac{\\pi}{2}' },
  { type: 1, deg: 180, theta: '\\pi' },
  { type: 2, deg: 45, theta: '\\dfrac{\\pi}{4}' },
  { type: 2, deg: 135, theta: '\\dfrac{3\\pi}{4}' },
  { type: 2, deg: -45, theta: '-\\dfrac{\\pi}{4}' },
  { type: 2, deg: -135, theta: '-\\dfrac{3\\pi}{4}' },
  { type: 3, deg: 30, theta: '\\dfrac{\\pi}{6}' },
  { type: 3, deg: 60, theta: '\\dfrac{\\pi}{3}' },
  { type: 3, deg: 120, theta: '\\dfrac{2\\pi}{3}' },
  { type: 3, deg: 150, theta: '\\dfrac{5\\pi}{6}' },
  { type: 3, deg: -30, theta: '-\\dfrac{\\pi}{6}' },
  { type: 3, deg: -60, theta: '-\\dfrac{\\pi}{3}' },
  { type: 3, deg: -120, theta: '-\\dfrac{2\\pi}{3}' },
  { type: 3, deg: -150, theta: '-\\dfrac{5\\pi}{6}' },
]

/** Écriture \mathrm{e}^{\mathrm{i}\theta} à partir de l'argument en LaTeX */
const texExponentielle = (argument: string) => {
  // Fraction de taille normale dans l'exposant
  const theta = argument.replaceAll('\\dfrac', '\\frac')
  return theta.startsWith('-')
    ? `\\mathrm{e}^{-\\mathrm{i}${theta.slice(1)}}`
    : `\\mathrm{e}^{\\mathrm{i}${theta}}`
}

/**
 * Placer dans le plan complexe l'image de nombres écrits sous forme exponentielle.
 * Randomisation de « Placer l'image des nombres complexes suivants dans le plan
 * complexe muni d'un repère » (a = 2e^{-iπ/2}, b = 4e^{iπ/3}, c = √2 e^{-3iπ/4}, d = e^{-iπ/6}).
 * Hors interactivité, le repère est proposé en paramétrage ; en interactivité,
 * l'élève place les points dans une figure apiGeom.
 * @author Stéphane Guyon
 */
export default class PlacerFormeExponentielle extends Exercice {
  /** Points à placer dans la figure de l'élève. */
  pointsAttendus: { label: string; x: number; y: number }[] = []
  /** Précision de la vérification (plus large si un point est hors quadrillage). */
  precision = 0.01

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.exoCustomResultat = true
    this.besoinFormulaireTexte = [
      "Types d'arguments",
      'Nombres séparés par des tirets :\n1 : Multiples de π/2\n2 : Multiples de π/4\n3 : Multiples de π/6 et π/3\n4 : Mélange',
    ]
    this.sup = '4'
    this.besoinFormulaire2Numerique = ['Nombre de points (de 2 à 6)', 6]
    this.sup2 = 4
    this.besoinFormulaire3CaseACocher = [
      "Afficher le repère dans l'énoncé (hors interactivité)",
      true,
    ]
    this.sup3 = true
    this.besoinFormulaire4CaseACocher = [
      "Afficher le cercle trigonométrique, les cercles et les droites d'aide dans l'énoncé (hors interactivité)",
      true,
    ]
    this.sup4 = true
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.pointsAttendus = []
    const types = String(this.sup)
      .split('-')
      .map(Number)
      .filter((t) => t >= 1 && t <= 3)
    const typesChoisis =
      types.length === 0 || String(this.sup).split('-').includes('4')
        ? [1, 2, 3]
        : types
    const pool = directions.filter((d) => typesChoisis.includes(d.type))
    const nbPoints = Math.min(
      pool.length,
      Math.min(6, Math.max(2, Number(this.sup2))),
    )
    const choisies = shuffle(pool).slice(0, nbPoints)

    const noms = this.interactif ? nomsInteractif : nomsClassique
    // Fraction ±1/2 en LaTeX
    const demi = (signe: number) => `${signe < 0 ? '-' : ''}\\dfrac{1}{2}`
    // Justification de la construction : valeur remarquable lue sur le cercle trigonométrique
    const justifier = (
      d: (typeof directions)[number],
      signeRe: number,
      signeIm: number,
      nom: string,
      rayon: string,
    ) => {
      const arg = `On sait que $\\arg\\left(z_${nom}\\right)=${d.theta}$, donc le point $${nom}$ est sur la demi-droite d'origine $O$ qui forme un angle de $${d.theta}$ avec l'axe des abscisses.`
      let suite: string
      if (d.type === 1)
        suite = `Le point du cercle trigonométrique d'argument $${d.theta}$ est le point de coordonnées $\\left(${signeRe}\\,;\\,${signeIm}\\right)$ : on trace la demi-droite d'origine $O$ passant par ce point.`
      else if (d.type === 2)
        suite = `Le point $\\left(${demi(signeRe)}\\,;\\,${demi(signeIm)}\\right)$, à l'intersection des droites d'équations $x=${demi(signeRe)}$ et $y=${demi(signeIm)}$, est sur cette demi-droite : on la trace en partant de $O$ et en passant par ce point.`
      else if (Math.abs(d.deg) % 180 === 30 || Math.abs(d.deg) % 180 === 150)
        suite = `On sait que $\\sin\\left(${d.theta}\\right)=${demi(signeIm)}$, donc le point du cercle trigonométrique d'argument $${d.theta}$ est sur la droite d'équation $y=${demi(signeIm)}$, ${signeRe > 0 ? 'à droite' : 'à gauche'} de l'axe des ordonnées : on trace la demi-droite d'origine $O$ passant par ce point.`
      else
        suite = `On sait que $\\cos\\left(${d.theta}\\right)=${demi(signeRe)}$, donc le point du cercle trigonométrique d'argument $${d.theta}$ est sur la droite d'équation $x=${demi(signeRe)}$, ${signeIm > 0 ? 'au-dessus' : 'en dessous'} de l'axe des abscisses : on trace la demi-droite d'origine $O$ passant par ce point.`
      return `On sait que $\\left|z_${nom}\\right|=${rayon}$, donc le point $${nom}$ est sur le cercle de centre $O$ et de rayon $${rayon}$.<br>${arg}<br>${suite}<br>Le point $${nom}$ est donc à l'intersection de cette demi-droite et du cercle de rayon $${rayon}$.`
    }
    const points = choisies.map((d, k) => {
      const signeRe = Math.sign(
        Math.round(Math.cos((d.deg * Math.PI) / 180) * 1000),
      )
      const signeIm = Math.sign(
        Math.round(Math.sin((d.deg * Math.PI) / 180) * 1000),
      )
      let re: Coordonnee
      let im: Coordonnee
      let module: string
      // Les modules sont toujours entiers
      if (d.type === 1) {
        const r = randint(1, 4)
        module = r === 1 ? '' : String(r)
        re = { k: signeRe * r, rac: 1 }
        im = { k: signeIm * r, rac: 1 }
        if (d.deg === 180) im = { k: 0, rac: 1 }
        else re = { k: 0, rac: 1 }
      } else if (d.type === 2) {
        const h = randint(1, 2) // module 2h : coordonnées h√2
        module = String(2 * h)
        re = { k: signeRe * h, rac: 2 }
        im = { k: signeIm * h, rac: 2 }
      } else {
        const h = randint(1, 2) // module 2h
        module = String(2 * h)
        const petit =
          Math.abs(d.deg) % 180 === 30 || Math.abs(d.deg) % 180 === 150
        // π/6 et 5π/6 : cos = √3/2 ; π/3 et 2π/3 : sin = √3/2
        re = { k: signeRe * h, rac: petit ? 3 : 1 }
        im = { k: signeIm * h, rac: petit ? 1 : 3 }
      }
      return {
        nom: noms[k],
        aff: `z_${noms[k]}`,
        deg: d.deg,
        theta: d.theta,
        re,
        im,
        x: valeur(re),
        y: valeur(im),
        expo: `${module}${texExponentielle(d.theta)}`,
        type: d.type,
        signeRe,
        signeIm,
        justification: justifier(
          d,
          signeRe,
          signeIm,
          noms[k],
          module === '' ? '1' : module,
        ),
      }
    })
    const horsQuadrillage = points.some((p) => p.re.rac !== 1 || p.im.rac !== 1)
    this.precision = horsQuadrillage ? 0.25 : 0.01
    this.pointsAttendus = points.map((p) => ({
      label: p.nom,
      x: p.x,
      y: p.y,
    }))

    const liste = points.map((p) => `$${p.aff}=${p.expo}$`)
    const enonce = `On considère les nombres complexes ${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}.`
    const consigne = `${enonce}<br>Dans le plan complexe muni d'un repère orthonormé direct $\\left(O\\,;\\ \\overrightarrow{u}\\,;\\ \\overrightarrow{v}\\right)$, placer les points ${points.map((p) => `$${p.nom}$`).join(', ')} d'affixes respectives ${points.map((p) => `$${p.aff}$`).join(', ')}.`

    // Figure apiGeom de l'élève
    const unite = 60 // pixels par unité : figure agrandie pour tracer cercles et points
    const figureEleve = new Figure({
      xMin: -LIMITE - 0.5,
      yMin: -LIMITE - 0.5,
      pixelsPerUnit: unite,
      dx: 0.5, // aimantation au demi-carreau
      dy: 0.5,
      width: (2 * LIMITE + 1) * unite,
      height: (2 * LIMITE + 1) * unite,
      border: false,
      scale: 1,
    })
    figureEleve.create('Grid', {
      strokeWidthGrid: 1,
      subGrid: true, // graduations de 1/2
      subGridDivisions: 2,
      color: 'black',
      xMin: -LIMITE,
      xMax: LIMITE,
      yMin: -LIMITE,
      yMax: LIMITE,
      axeX: true,
      axeY: true,
      labelX: true,
      labelY: true,
    })
    const origine = figureEleve.create('Point', {
      x: 0,
      y: 0,
      isVisible: false,
      isSelectable: false,
      isDeletable: false,
    })
    for (const [x, y] of [
      [1, 0],
      [0, 1],
    ]) {
      const extremite = figureEleve.create('Point', {
        x,
        y,
        isVisible: false,
        isSelectable: false,
        isDeletable: false,
      })
      figureEleve.create('Segment', {
        point1: origine,
        point2: extremite,
        shape: '->',
        color: 'black',
        thickness: 1,
        borderSize: 0.04,
        isSelectable: false,
        isDeletable: false,
      })
    }
    // Aides à la construction : cercle trigonométrique, cercles de rayon les modules
    // et droites d'équations x = ±1/2 et y = ±1/2 (restent sélectionnables pour les intersections)
    const modules = [
      ...new Set(points.map((p) => Math.round(Math.hypot(p.x, p.y) * 1000))),
    ]
      .map((m) => m / 1000)
      .filter((m) => Math.abs(m - 1) > 1e-6)
    for (const [rayon, couleur] of [
      [1, 'green'],
      ...modules.map((m) => [m, 'purple'] as [number, string]),
    ] as [number, string][]) {
      figureEleve.create('Circle', {
        center: origine,
        radius: rayon,
        color: couleur,
        thickness: 1,
        isDeletable: false,
      })
    }
    for (const [x1, y1, x2, y2] of [
      [0.5, 0, 0.5, 1],
      [-0.5, 0, -0.5, 1],
      [0, 0.5, 1, 0.5],
      [0, -0.5, 1, -0.5],
    ]) {
      const debut = figureEleve.create('Point', {
        x: x1,
        y: y1,
        isVisible: false,
        isSelectable: false,
        isDeletable: false,
      })
      const fin = figureEleve.create('Point', {
        x: x2,
        y: y2,
        isVisible: false,
        isSelectable: false,
        isDeletable: false,
      })
      figureEleve.create('Line', {
        point1: debut,
        point2: fin,
        color: 'orange',
        thickness: 1,
        isDeletable: false,
      })
    }
    // Graduation 1/2 sur chaque axe (un seul trait par axe)
    for (const [x1, y1, x2, y2] of [
      [0.5, -0.06, 0.5, 0.06],
      [-0.06, 0.5, 0.06, 0.5],
    ]) {
      const debut = figureEleve.create('Point', {
        x: x1,
        y: y1,
        isVisible: false,
        isSelectable: false,
        isDeletable: false,
      })
      const fin = figureEleve.create('Point', {
        x: x2,
        y: y2,
        isVisible: false,
        isSelectable: false,
        isDeletable: false,
      })
      figureEleve.create('Segment', {
        point1: debut,
        point2: fin,
        color: 'black',
        thickness: 2,
        isSelectable: false,
        isDeletable: false,
      })
    }
    for (const [texte, x, y, ancre] of [
      ['$O$', -0.3, -0.3, 'topRight'],
      // u et v sont écrits de l'autre côté des axes : la graduation 1/2 est du côté habituel
      ['$\\overrightarrow{u}$', 0.5, 0.15, 'bottomCenter'],
      ['$\\overrightarrow{v}$', 0.15, 0.5, 'middleLeft'],
      ['$\\dfrac{1}{2}$', 0.5, -0.12, 'topCenter'],
      ['$\\dfrac{1}{2}$', -0.12, 0.5, 'middleRight'],
    ] as const) {
      figureEleve.create('TextByPosition', {
        text: texte,
        x,
        y,
        anchor: ancre,
        color: 'black',
        fontSize: '0.8em',
        isSelectable: false,
        isDeletable: false,
      })
    }
    // Le 0 des graduations est retiré : le point O est nommé
    for (const element of figureEleve.elements.values()) {
      const texte = element as {
        type?: string
        text?: string
        isVisible?: boolean
      }
      if (texte.type === 'TextByPosition' && texte.text === '$0$')
        texte.isVisible = false
    }
    figureEleve.snapGrid = !horsQuadrillage
    figureEleve.options.color = 'blue' // Ne pas mettre bleuMathalea avec apigeom
    figureEleve.options.fontSize = '0.7em' // noms des points plus discrets
    figureEleve.options.labelAutomaticBeginsWith = 'A' // constructions de l'élève ; il nomme ensuite E, F, G…
    figureEleve.options.labelAutomaticForPoints = true
    figureEleve.setToolbar({
      tools: [
        'POINT',
        'CIRCLE_CENTER_POINT',
        'SEGMENT',
        'LINE',
        'LINE_PERPENDICULAR',
        'POINT_INTERSECTION',
        'NAME_POINT',
        'DRAG',
        'REMOVE',
        'UNDO',
        'REDO',
      ],
      position: 'top',
    })
    this.figuresApiGeom = [figureEleve]

    // Figures MathALÉA 2D (énoncé hors interactivité et correction)
    const couleurs = ['red', 'green', 'blue', 'orange', 'purple', 'brown']
    const dessiner = (
      objets: Parameters<typeof mathalea2d>[1][],
      zoomVoulu?: number,
    ) => {
      const graduations = Array.from(
        { length: 2 * LIMITE + 1 },
        (_, k) => k - LIMITE,
      ).filter((n) => n !== 0)
      const echelle = (0.5 * 14) / (2 * LIMITE + 2)
      return mathalea2d(
        {
          xmin: -LIMITE - 1,
          xmax: LIMITE + 1,
          ymin: -LIMITE - 1,
          ymax: LIMITE + 1,
          scale: echelle,
          zoom: zoomVoulu ?? Math.min(echelle / 0.5, 1.15),
        },
        repere({
          xMin: -LIMITE,
          xMax: LIMITE,
          yMin: -LIMITE,
          yMax: LIMITE,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
          axesEpaisseur: 0.8,
          thickEpaisseur: 0.8,
          xLabelListe: graduations,
          yLabelListe: graduations,
        }),
        ...objets,
      )
    }
    // Aides à la construction (cercle trigonométrique, cercles de rayon les modules,
    // droites d'équations x = ±1/2 et y = ±1/2), identiques à la figure interactive
    const aidesConstruction = (
      o: ReturnType<typeof pointAbstrait>,
      rayons: number[],
      // Par défaut, toutes les aides ; dans la correction, seulement celles qui servent
      {
        trigo = true,
        verticales = [0.5, -0.5],
        horizontales = [0.5, -0.5],
      }: {
        trigo?: boolean
        verticales?: number[]
        horizontales?: number[]
      } = {},
    ) => {
      const fin = <T extends { epaisseur: number }>(objet: T) => {
        objet.epaisseur = 0.5
        return objet
      }
      return [
        ...(trigo ? [fin(cercle(o, 1, 'green'))] : []),
        ...rayons.map((r) => fin(cercle(o, r, 'purple'))),
        ...verticales.map((c) =>
          fin(
            segment(
              pointAbstrait(c, -LIMITE),
              pointAbstrait(c, LIMITE),
              'orange',
            ),
          ),
        ),
        ...horizontales.map((c) =>
          fin(
            segment(
              pointAbstrait(-LIMITE, c),
              pointAbstrait(LIMITE, c),
              'orange',
            ),
          ),
        ),
      ]
    }
    const dessinRepere = (p?: (typeof points)[number], k = 0) => {
      const o = pointAbstrait(0, 0, 'O')
      const vecteurUnite = (x: number, y: number) => {
        const v = segment(o, pointAbstrait(x, y), 'black', '->')
        v.epaisseur = 1
        return v
      }
      const croixOrigine = tracePoint(o, 'black')
      croixOrigine.taille = 2
      croixOrigine.tailleTikz = 2 / 15
      const base = [
        vecteurUnite(1, 0),
        vecteurUnite(0, 1),
        latex2d('\\overrightarrow{u}', 0.5, -0.35, {}),
        latex2d('\\overrightarrow{v}', -0.32, 0.5, {}),
        croixOrigine,
        latex2d('O', -0.3, -0.45, {}),
      ]
      if (p == null)
        // Repère de l'énoncé de la taille de la figure interactive
        return dessiner(
          [...(this.sup4 ? aidesConstruction(o, modules) : []), ...base],
          3,
        )
      const couleur = couleurs[k]
      const m = pointAbstrait(p.x, p.y, p.nom)
      const module = segment(o, m, couleur)
      module.epaisseur = 1.5
      const rayon = 0.6 // arc de l'argument, à l'intérieur du cercle trigonométrique
      const sur = (angle: number, r: number) =>
        pointAbstrait(
          r * Math.cos((angle * Math.PI) / 180),
          r * Math.sin((angle * Math.PI) / 180),
        )
      const arcArgument = arc(
        pointAbstrait(rayon, 0),
        o,
        p.deg,
        false,
        'none',
        couleur,
      )
      arcArgument.epaisseur = 1
      const pointe = segment(
        sur(p.deg - Math.sign(p.deg) * 10, rayon),
        sur(p.deg, rayon),
        couleur,
        '->',
      )
      pointe.epaisseur = 1
      // Mesure de l'argument, près de l'arc, du côté de la bissectrice
      const angleMesure = p.deg === 180 ? 135 : p.deg / 2
      // Le nom du point est dans le prolongement de [OM]
      const norme = Math.hypot(p.x, p.y)
      // Près de l'origine, la mesure est placée au-delà du point pour ne pas le masquer
      const rMesure =
        norme <= 2.5
          ? norme + 0.9
          : rayon + (p.theta.includes('dfrac') ? 1 : 0.7)
      const nomX = p.x + (0.55 * p.x) / norme
      const nomY = p.y + (0.55 * p.y) / norme
      // Aides à la construction, comme en interactivité : cercle trigonométrique,
      // cercle de rayon le module, droites d'équations x = ±1/2 et y = ±1/2
      const norme2 = Math.hypot(p.x, p.y)
      // Seules les aides utiles : multiples de π/2 → cercles ; π/4 → droites x et y = ±1/2
      // et cercle du module ; π/6 et π/3 → cercle trigonométrique, une droite, cercle du module
      const sinus =
        Math.abs(p.deg) % 180 === 30 || Math.abs(p.deg) % 180 === 150
      const aides = aidesConstruction(
        o,
        Math.abs(norme2 - 1) > 1e-6 ? [norme2] : [],
        {
          trigo: p.type !== 2,
          verticales:
            p.type === 2
              ? [p.signeRe / 2]
              : p.type === 3 && !sinus
                ? [p.signeRe / 2]
                : [],
          horizontales:
            p.type === 2
              ? [p.signeIm / 2]
              : p.type === 3 && sinus
                ? [p.signeIm / 2]
                : [],
        },
      )
      // Point de la demi-droite [OM] situé sur le cercle trigonométrique
      // (pour les multiples de π/4 : le point (±1/2 ; ±1/2) des droites d'aide)
      const surCercleTrigo = tracePoint(
        p.type === 2
          ? pointAbstrait(p.signeRe / 2, p.signeIm / 2)
          : pointAbstrait(p.x / norme2, p.y / norme2),
        'green',
      )
      // Repères de correction plus grands, pour que les constructions restent lisibles
      return dessiner(
        [
          ...aides,
          ...base,
          surCercleTrigo,
          module,
          tracePoint(m, couleur),
          arcArgument,
          pointe,
          latex2d(
            p.theta,
            rMesure * Math.cos((angleMesure * Math.PI) / 180),
            rMesure * Math.sin((angleMesure * Math.PI) / 180),
            {
              color: couleur,
              letterSize: 'small',
            },
          ),
          texteParPoint(
            p.nom,
            pointAbstrait(nomX, nomY),
            0,
            couleur,
            0.55,
            'milieu',
            true,
          ),
        ],
        2.3,
      )
    }
    const cotACote = (dessins: string[]) =>
      context.isHtml
        ? `<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">${dessins.join('')}</div>`
        : dessins.join(' ')
    const figureCorrection = cotACote(points.map((p, k) => dessinRepere(p, k)))

    const explication = `Un nombre complexe $z=r\\mathrm{e}^{\\mathrm{i}\\theta}$, avec $r>0$, a pour module $r$ et pour argument $\\theta$.<br>Son image est donc le point $M$ tel que $OM=r$ et $\\left(\\overrightarrow{u}\\,;\\ \\overrightarrow{OM}\\right)=\\theta$.<br>${figureCorrection}`
    const detail = points
      .map((p) => `$${p.aff}=${p.expo}$.<br>${p.justification}`)
      .join('<br><br>')
    const correction = `${explication}<br>${detail}`

    const indicationAides =
      "<br>On pourra se servir des valeurs remarquables du cercle trigonométrique à l'aide des cercles et des droites tracés."
    if (this.interactif) {
      const figure = figureApigeom({
        exercice: this,
        i: 0,
        figure: figureEleve,
        defaultAction: 'POINT',
      })
      this.listeQuestions[0] = `${consigne}${indicationAides}${figure}`
    } else {
      this.listeQuestions[0] =
        consigne +
        (this.sup3
          ? `${this.sup4 ? indicationAides : ''}<br>${dessinRepere()}`
          : '')
    }
    this.listeCorrections[0] = correction
    this.listeReponsesCourtes[0] = `${figureCorrection}<br>${points
      .map(
        (p) =>
          `$${p.nom}\\left(${texCoord(p.re)}\\,;\\,${texCoord(p.im)}\\right)$`,
      )
      .join(' ; ')}.`
    listeQuestionsToContenu(this)
  }

  /**
   * Corrige la figure de l'élève : 1 point si tous les points sont bien placés
   * (le barème ne dépend pas du nombre de points demandés).
   */
  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    const figure = this.figuresApiGeom![i]
    this.answers[figure.id] = figureAnswerJson(figure)
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    let feedback = ''
    let tousPlaces = true
    for (const { label, x, y } of this.pointsAttendus) {
      const { isValid, message } = figure.checkCoords({
        label,
        x,
        y,
        precision: this.precision,
      })
      if (!isValid) tousPlaces = false
      if (message !== '') feedback += `${message}<br>`
    }
    if (divFeedback != null) divFeedback.innerHTML = feedback
    figure.isDynamic = false
    return tousPlaces ? 'OK' : 'KO'
  }
}
