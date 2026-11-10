import Figure from 'apigeom'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { arc } from '../../lib/2d/Arc'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Placer des points et lire l'argument d'un nombre complexe"
export const interactifReady = true
export const dateDePublication = '30/10/2026'
export const uuid = 'bb76c'
export const refs = {
  'fr-fr': ['TEC2-30'],
  'fr-ch': [],
}

const noms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/** Huit directions : signes de la partie réelle et imaginaire, argument principal. */
const directions = [
  { sr: 1, si: 0, arg: '0', deg: 0 },
  { sr: 1, si: 1, arg: '\\dfrac{\\pi}{4}', deg: 45 },
  { sr: 0, si: 1, arg: '\\dfrac{\\pi}{2}', deg: 90 },
  { sr: -1, si: 1, arg: '\\dfrac{3\\pi}{4}', deg: 135 },
  { sr: -1, si: 0, arg: '\\pi', deg: 180 },
  { sr: -1, si: -1, arg: '-\\dfrac{3\\pi}{4}', deg: -135 },
  { sr: 0, si: -1, arg: '-\\dfrac{\\pi}{2}', deg: -90 },
  { sr: 1, si: -1, arg: '-\\dfrac{\\pi}{4}', deg: -45 },
]

/**
 * Placer des nombres complexes dans le plan complexe (figure apiGeom), puis
 * lire un argument de chacun (directions multiples de π/4).
 * Randomisation de « À l'aide d'un dessin, déterminer un argument de
 * z₁ = i, z₂ = −5, z₃ = 1 + i et z₄ = 3 ».
 * @author Stéphane Guyon
 */
export default class LireArgument extends Exercice {
  /** Points à placer dans la figure de la question 0 (nom et coordonnées). */
  pointsAttendus: { label: string; x: number; y: number }[] = []

  constructor() {
    super()
    // Une seule question : placer les points (apiGeom), puis lire les arguments.
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.exoCustomResultat = true
    this.besoinFormulaireNumerique = ['Nombre de points (de 2 à 8)', 8]
    this.sup = 4
    this.besoinFormulaire2CaseACocher = [
      "Afficher le repère dans l'énoncé (hors interactivité)",
      true,
    ]
    this.sup2 = true
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.pointsAttendus = []
    const nbPoints = Math.min(8, Math.max(2, Number(this.sup)))
    const choisies = shuffle(directions).slice(0, nbPoints)
    const points = choisies.map((d, k) => {
      const module = randint(1, d.sr !== 0 && d.si !== 0 ? 4 : 5)
      const re = d.sr * module
      const im = d.si * module
      return {
        nom: noms[k],
        re,
        im,
        arg: d.arg,
        deg: d.deg,
        z: new Complexe(re, im).tex(),
      }
    })
    // Le repère est limité au plus grand module des affixes de l'énoncé (au moins 4)
    const limite = Math.max(
      4,
      ...points.flatMap((p) => [Math.abs(p.re), Math.abs(p.im)]),
    )
    const unite = (30 * 6) / limite // pixels par unité de la figure élève
    // Un point pour le placement, puis un point par argument
    this.pointsParQuestions = nbPoints + 1
    this.pointsAttendus = points.map((p) => ({
      label: p.nom,
      x: p.re,
      y: p.im,
    }))

    const liste = points.map((p) => `$z_${p.nom}=${p.z}$`)
    const enonce = `On considère les nombres complexes ${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}.`

    // Figure de l'élève (apiGeom)
    const creerFigureEleve = (premierNom: string) => {
      const figureEleve = new Figure({
        xMin: -limite - 0.5,
        yMin: -limite - 0.5,
        pixelsPerUnit: unite,
        width: (2 * limite + 1) * unite,
        height: (2 * limite + 1) * unite,
        border: false,
        scale: 0.65,
      })
      figureEleve.create('Grid', {
        strokeWidthGrid: 1,
        color: 'black',
        xMin: -limite,
        xMax: limite,
        yMin: -limite,
        yMax: limite,
        axeX: true,
        axeY: true,
        labelX: true,
        labelY: true,
      })
      // Origine, vecteurs u et v : éléments fixes de la figure
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
        // Segment fléché à pointe discrète (le vecteur apiGeom a une pointe trop grosse)
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
          borderSize: 0.1,
          isSelectable: false,
          isDeletable: false,
        })
      }
      for (const [texte, x, y, ancre] of [
        ['$O$', -0.3, -0.3, 'topRight'],
        ['$\\overrightarrow{u}$', 0.5, -0.1, 'topCenter'],
        ['$\\overrightarrow{v}$', -0.1, 0.5, 'middleRight'],
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
      figureEleve.snapGrid = true
      figureEleve.options.color = 'blue' // Ne pas mettre bleuMathalea avec apigeom
      figureEleve.options.labelAutomaticBeginsWith = premierNom
      figureEleve.options.labelAutomaticForPoints = true
      figureEleve.setToolbar({
        tools: ['POINT', 'NAME_POINT', 'DRAG', 'REMOVE', 'UNDO', 'REDO'],
        position: 'top',
      })
      return figureEleve
    }
    const figureEleve = creerFigureEleve('A')
    this.figuresApiGeom = [figureEleve]

    // Pas plus de 4 points par repère  : les repères sont côte à côte au-delà
    const groupes: (typeof points)[] = []
    for (let k = 0; k < points.length; k += 4)
      groupes.push(points.slice(k, k + 4))
    const couleurs = ['red', 'green', 'blue', 'orange']
    const cotACote = (dessins: string[]) =>
      context.isHtml
        ? `<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start">${dessins.join('')}</div>`
        : dessins.join(' ')
    // `lim` : demi-largeur du repère (limite de l'énoncé, ou 6 pour le repère complet)
    const dessiner = (
      objets: Parameters<typeof mathalea2d>[1][],
      lim = limite,
    ) => {
      const graduations = Array.from(
        { length: 2 * lim + 1 },
        (_, k) => k - lim,
      ).filter((n) => n !== 0)
      const echelleRepere = (0.5 * 14) / (2 * lim + 2)
      return mathalea2d(
        {
          xmin: -lim - 1,
          xmax: lim + 1,
          ymin: -lim - 1,
          ymax: lim + 1,
          scale: echelleRepere,
          // `scale` ne joue que sur la sortie LaTeX ; le zoom, plafonné, grossit aussi les textes
          zoom: Math.min(echelleRepere / 0.5, 1.15),
        },
        repere({
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
          // Graduations sans le 0 (le point O est nommé)
          xLabelListe: graduations,
          yLabelListe: graduations,
        }),
        ...objets,
      )
    }
    const dessinRepere = (
      groupe: typeof points,
      avecArguments: boolean,
      lim = limite,
    ) => {
      const o = pointAbstrait(0, 0, 'O')
      const epaisseur = 2.5
      const vecteurUnite = (x: number, y: number) => {
        const v = segment(o, pointAbstrait(x, y), 'black', '->')
        v.epaisseur = 1.5
        v.tailleExtremites = 8
        return v
      }
      // Les noms de u et v se placent du côté opposé au module (un seul point par repère
      // dans la correction), jamais sur un axe
      const ecartAngulaire = (a: number, b: number) =>
        Math.abs(((((a - b) % 360) + 540) % 360) - 180)
      const degreDuModule = avecArguments ? groupe[0].deg : undefined
      // u sous l'axe, v près de l'axe des ordonnées ; du côté opposé si le module les gêne
      const nomU =
        degreDuModule === undefined || ecartAngulaire(-42, degreDuModule) >= 35
          ? -0.35
          : 0.35
      const nomV =
        degreDuModule === undefined || ecartAngulaire(132, degreDuModule) >= 35
          ? -0.32
          : 0.32
      // Croix d'origine discrète
      const croixOrigine = tracePoint(o, 'black')
      croixOrigine.taille = 2
      croixOrigine.tailleTikz = 2 / 15
      const baseOrthonormee = [
        vecteurUnite(1, 0),
        vecteurUnite(0, 1),
        latex2d('\\overrightarrow{u}', 0.5, nomU, {}),
        latex2d('\\overrightarrow{v}', nomV, 0.5, {}),
        // Origine du repère
        croixOrigine,
        latex2d('O', -0.3, -0.45, {}),
      ]
      if (!avecArguments) return dessiner(baseOrthonormee, lim)

      // Points à éviter pour les mesures : u, v et leurs noms, modules, croix, noms, arcs
      const obstacles: [number, number][] = []
      const remplir = (cx: number, cy: number, hw: number, hh: number) => {
        for (let x = cx - hw; x <= cx + hw + 1e-9; x += 0.12)
          for (let y = cy - hh; y <= cy + hh + 1e-9; y += 0.12)
            obstacles.push([x, y])
      }
      for (let t = 0; t <= 1.001; t += 0.1) obstacles.push([t, 0], [0, t])
      // Graduations : chiffres sous l'axe des abscisses et à gauche de l'axe des ordonnées
      for (let n = -limite; n <= limite; n++) {
        remplir(n, -0.4, 0.25, 0.2)
        remplir(-0.45, n, 0.3, 0.2)
      }
      remplir(-0.3, -0.45, 0.2, 0.2)
      remplir(0.5, nomU, 0.3, 0.25)
      remplir(nomV, 0.5, 0.3, 0.25)
      const rayonDe = (k: number) => 1.4 + 0.55 * k
      const positionNom = (p: (typeof points)[number]) => ({
        x: p.re + (p.re < 0 ? -0.5 : 0.5),
        // Sur l'axe des abscisses, le nom passe sous l'axe, entre deux graduations
        y: p.im === 0 ? -0.5 : p.im + (p.im < 0 ? -0.5 : 0.5),
      })
      groupe.forEach((p, k) => {
        for (let t = 0; t <= 1.0001; t += 0.04)
          obstacles.push([p.re * t, p.im * t])
        remplir(p.re, p.im, 0.2, 0.2)
        const nom = positionNom(p)
        remplir(nom.x, nom.y, 0.25, 0.25)
        if (p.deg !== 0) {
          const pas = p.deg > 0 ? 3 : -3
          for (let a = 0; Math.abs(a) <= Math.abs(p.deg); a += pas)
            obstacles.push([
              rayonDe(k) * Math.cos((a * Math.PI) / 180),
              rayonDe(k) * Math.sin((a * Math.PI) / 180),
            ])
        }
      })
      // Mesure de l'argument : à côté de l'arc, sans toucher axe, flèche, module ni autre texte
      const placerMesure = (p: (typeof points)[number], k: number) => {
        const demiLargeur = p.arg.startsWith('-') ? 0.5 : 0.35
        const [hw, hh] = p.arg.includes('dfrac')
          ? [demiLargeur, 0.5]
          : [0.2, 0.25]
        const angleDeBase = p.deg === 0 ? 25 : p.deg === 180 ? 135 : p.deg / 2
        const valide = (cx: number, cy: number) =>
          Math.abs(cx) - hw >= 0.15 &&
          Math.abs(cy) - hh >= 0.15 &&
          Math.abs(cx) + hw <= limite + 0.7 &&
          Math.abs(cy) + hh <= limite + 0.7 &&
          obstacles.every(
            ([ox, oy]) =>
              Math.abs(ox - cx) >= hw + 0.1 || Math.abs(oy - cy) >= hh + 0.1,
          )
        // Le meilleur compromis : près de l'arc et près de la bissectrice de l'angle
        let meilleur: { x: number; y: number; cout: number } | undefined
        for (let dr = 0.5; dr <= 3; dr += 0.1) {
          for (let decalage = -90; decalage <= 90; decalage += 6) {
            const angle = ((angleDeBase + decalage) * Math.PI) / 180
            const cx = (rayonDe(k) + dr) * Math.cos(angle)
            const cy = (rayonDe(k) + dr) * Math.sin(angle)
            const cout = dr + 0.03 * Math.abs(decalage)
            if (
              (meilleur === undefined || cout < meilleur.cout) &&
              valide(cx, cy)
            )
              meilleur = { x: cx, y: cy, cout }
          }
        }
        if (meilleur !== undefined) {
          remplir(meilleur.x, meilleur.y, hw, hh)
          return meilleur
        }
        const angle = (angleDeBase * Math.PI) / 180
        return {
          x: (rayonDe(k) + 0.55) * Math.cos(angle),
          y: (rayonDe(k) + 0.55) * Math.sin(angle),
        }
      }
      const objets = groupe.flatMap((p, k) => {
        const m = pointAbstrait(p.re, p.im, p.nom)
        const couleur = couleurs[k]
        // Le module (O vers M) est un simple trait : la flèche orientée est celle de l'arc
        const module = segment(o, m, couleur)
        module.epaisseur = epaisseur
        const objetsArgument = () => {
          const rayon = rayonDe(k)
          const arcArgument = arc(
            pointAbstrait(rayon, 0),
            o,
            p.deg,
            false,
            'none',
            couleur,
          )
          arcArgument.epaisseur = epaisseur
          // Pointe à l'extrémité de l'arc, dans le sens de parcours
          const pointSurArc = (angle: number) =>
            pointAbstrait(
              rayon * Math.cos((angle * Math.PI) / 180),
              rayon * Math.sin((angle * Math.PI) / 180),
            )
          const pointe = segment(
            pointSurArc(p.deg - Math.sign(p.deg) * 8),
            pointSurArc(p.deg),
            couleur,
            '->',
          )
          pointe.epaisseur = epaisseur
          pointe.tailleExtremites = 8
          return [arcArgument, pointe]
        }
        const mesure = placerMesure(p, k)
        const nom = positionNom(p)
        return [
          module,
          // Croix pour positionner le point
          tracePoint(m, couleur),
          ...(p.deg === 0 ? [] : objetsArgument()),
          latex2d(p.arg, mesure.x, mesure.y, {
            color: couleur,
            letterSize: 'small',
          }),
          texteParPoint(
            p.nom,
            pointAbstrait(nom.x, nom.y),
            0,
            couleur,
            1,
            'milieu',
            true,
          ),
        ]
      })
      return dessiner([...baseOrthonormee, ...objets])
    }
    // Énoncé hors interactivité : le repère complet, de -6 à 6
    const repereVierge = dessinRepere([], false, 6)
    // Dans la correction : un repère par point
    const figureCorrection = cotACote(
      points.map((p) => dessinRepere([p], true)),
    )

    const consigne = `${enonce}<br>Dans le plan complexe muni d'un repère orthonormé direct $\\left(O\\,;\\ \\overrightarrow{u}\\,;\\ \\overrightarrow{v}\\right)$, placer les points ${points.map((p) => `$${p.nom}$`).join(', ')} d'affixes respectives ${points.map((p) => `$z_${p.nom}$`).join(', ')}, puis lire sur le repère un argument de chacun de ces nombres complexes, dans $]-\\pi\\,;\\,\\pi]$.`
    const explication = `Soit $z=a+\\mathrm{i}b$, avec $a$ et $b$ réels, et $M$ un point du plan complexe d'affixe $z$.<br>Le point $M$ a pour coordonnées $(a\\,;\\,b)$.<br>Un argument de $z$ est une mesure de l'angle orienté $\\left(\\overrightarrow{u}\\,;\\ \\overrightarrow{OM}\\right)$, à $2\\pi$ près.<br>${figureCorrection}`
    if (this.interactif) {
      // Une seule question : la figure à compléter, puis arg(z) = … pour chaque nombre
      const figure = figureApigeom({
        exercice: this,
        i: 0,
        figure: figureEleve,
        defaultAction: 'POINT',
      })
      const options: Record<
        string,
        { keyboard?: string; dataKeys?: string[][] }
      > = {}
      const reponses: Record<string, { value: string }> = {}
      points.forEach((p, k) => {
        // Clavier basique : dix chiffres, signe moins, π et quotient
        options[`field${k}`] = {
          keyboard: KeyboardType.clavierEntierementPersonnalisable,
          dataKeys: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['-', '\\pi', '\\frac{#0}{#1}'],
          ],
        }
        reponses[`field${k}`] = { value: p.arg }
      })
      const champs = addMultiMathfield(this, 1, {
        dataTemplate: points
          .map((p, k) => `$\\arg(z_${p.nom})=$ %{field${k}}`)
          .join('<br>'),
        dataOptions: options as DataOptionsMultiMathfield,
      })
      handleAnswers(
        this,
        1,
        { ...reponses, bareme: toutAUnPoint },
        { formatInteractif: 'multi-mathfield' },
      )
      this.listeQuestions[0] = `${consigne}${figure}<br>${champs}`
      this.listeCorrections[0] =
        explication +
        '<br>' +
        points
          .map((p) => `$\\arg(z_${p.nom})=${miseEnEvidence(p.arg)}$`)
          .join(' ; ') +
        '.'
    } else {
      // Hors interactivité : pas de sous-questions a), b)…, le repère vierge est optionnel
      this.listeQuestions[0] =
        consigne + (this.sup2 ? `<br>${repereVierge}` : '')
      this.listeCorrections[0] =
        explication +
        '<br>' +
        points
          .map((p) => `$\\arg(z_${p.nom})=${miseEnEvidence(p.arg)}$`)
          .join(' ; ') +
        '.'
    }
    // Réponse minimale (Typst) : seulement les repères et les arguments
    this.listeReponsesCourtes[0] = `${figureCorrection}<br>${points
      .map((p) => `$\\arg(z_${p.nom})=${miseEnEvidence(p.arg)}$`)
      .join(' ; ')}.`
    listeQuestionsToContenu(this)
  }

  /**
   * Corrige la figure de l'élève : 1 point si tous les points sont bien placés.
   * Les champs `arg(z)` sont l'entrée 1 de `autoCorrection` (multi-mathfield,
   * un point par argument juste) : le total vaut donc le nombre de points plus un.
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
      const { isValid, message } = figure.checkCoords({ label, x, y })
      if (!isValid) tousPlaces = false
      if (message !== '') feedback += `${message}<br>`
    }
    if (divFeedback != null) divFeedback.innerHTML = feedback
    figure.isDynamic = false
    return tousPlaces ? 'OK' : 'KO'
  }
}
