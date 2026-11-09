import Figure from 'apigeom'
import { Coords } from 'apigeom/src/elements/calculus/Coords'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'c8ee7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver la représentation graphique d'une droite à partir de son équation réduite"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4CEs2026 extends ExerciceQcmACourt {
  /** Droite demandée dans la version à construire : `y = (num / den) x + p`. */
  private num = 1
  private den = 1
  private p = 0
  /** Repère sans droite, pour l'énoncé de la version à construire hors interactivité. */
  private repereVide = ''
  /** Droite attendue pour chaque figure, car l'index de la question change quand l'exercice est hébergé. */
  private droitesAttendues = new Map<Figure, [number, number, number]>()

  private appliquerLesValeurs(
    num: number,
    den: number,
    p: number,
    d1: [number, number, number],
    d2: [number, number, number],
    d3: [number, number, number],
  ): void {
    const fracM = new FractionEtendue(num, den)
    const equationTex = `$y = ${reduireAxPlusB(fracM, p)}$`

    this.num = num
    this.den = den
    this.p = p
    this.enonce = `Dans un repère orthonormé $(O ; \\vec{\\imath}, \\vec{\\jmath})$, la droite $d$ d’équation réduite ${equationTex} est représentée par :`

    const fenetreMathalea2d = {
      xmin: -4.3,
      xmax: 4.3,
      ymin: -3.3,
      ymax: 6.3,
      pixelsParCm: 20,
      scale: 0.45,
      display: 'inline-block' as const,
      center: !context.isHtml,
    }

    // Fonction locale pour générer un repère et une droite (utilisée pour les 4 propositions)
    const genererGraphique = (
      n: number,
      d_den: number,
      ord: number,
      avecCorrection = false,
      sansDroite = false,
    ) => {
      const r = repere({
        xMin: -4,
        xMax: 4,
        yMin: -3,
        yMax: 6,
        grilleSecondaire: false,
        grilleSecondaireXDistance: 0.5,
        grilleSecondaireYDistance: 0.5,
        // Astuce infaillible : on place les graduations et les labels à 100, loin hors de la zone visible
        xThickListe: [100],
        yThickListe: [100],
        xLabelListe: [100],
        yLabelListe: [100],
      })

      // Définition de la droite
      const ptA = pointAbstrait(0, ord)
      const ptB = pointAbstrait(d_den, ord + n)
      const d_trace = droite(ptA, ptB, '', avecCorrection ? 'red' : 'red')
      d_trace.epaisseur = 2

      // Vecteurs unitaires avec 'segment' pour une meilleure visibilité + Origine
      const vI = segment(0, 0, 1, 0, 'black', '->')
      vI.epaisseur = 1
      const vJ = segment(0, 0, 0, 1, 'black', '->')
      vJ.epaisseur = 1
      const o = latex2d('\\text{O}', -0.3, -0.6, { letterSize: 'scriptsize' })
      const textI = latex2d('\\vec{\\imath}', 0.7, -0.8, {
        letterSize: 'normalsize',
      })
      const textJ = latex2d('\\vec{\\jmath}', -0.5, 0.25, {
        letterSize: 'normalsize',
      })

      const objets = sansDroite
        ? [r, o, vI, vJ, textI, textJ]
        : [r, d_trace, o, vI, vJ, textI, textJ]

      // Ajout de l'escalier explicatif si c'est la figure de correction
      if (avecCorrection) {
        const ptCorner = pointAbstrait(d_den, ord)

        const sHoriz = segment(ptA, ptCorner, 'blue')
        sHoriz.epaisseur = 2
        sHoriz.pointilles = 5

        const sVert = segment(ptCorner, ptB, 'green')
        sVert.epaisseur = 2
        sVert.pointilles = 5

        const decY = n > 0 ? -0.4 : 0.4
        const lHoriz = latex2d(`+${d_den}`, d_den / 2, ord + decY, {
          color: 'blue',
          letterSize: 'scriptsize',
        })
        const lVertStr = n > 0 ? `+${n}` : `${n}`
        const lVert = latex2d(lVertStr, d_den + 0.4, ord + n / 2, {
          color: 'green',
          letterSize: 'scriptsize',
        })

        objets.push(sHoriz, sVert, lHoriz, lVert)
      }

      return mathalea2d(fenetreMathalea2d, ...objets)
    }

    this.correction = `Pour représenter la droite d'équation réduite ${equationTex} :<br>`
    this.correction += `$\\bullet$ L'ordonnée à l'origine est $p = ${p}$. La droite coupe l'axe des ordonnées au point de coordonnées $(0 ; ${p})$.<br>`
    this.correction += `$\\bullet$ Le coefficient directeur est $m = ${fracM.texFractionSimplifiee}$. En partant de l'ordonnée à l'origine, si on avance de $${den}$ unité(s) vers la droite, on se décale de $${Math.abs(num)}$ unité(s) vers le ${num > 0 ? 'haut' : 'bas'}.<br>`
    this.correction += `<br>${genererGraphique(num, den, p, true)}<br>`

    this.repereVide = genererGraphique(num, den, p, false, true)

    // Les réponses sont des graphiques générés dynamiquement
    this.reponses = [
      genererGraphique(num, den, p),
      genererGraphique(d1[0], d1[1], d1[2]),
      genererGraphique(d2[0], d2[1], d2[2]),
      genererGraphique(d3[0], d3[1], d3[2]),
    ]
  }

  versionOriginale: () => void = () => {
    // Énoncé : y = 1/3 x + 1
    // d1 (image a) : y = x + 2 (passe par (0,2) et (1,3)) -> [1, 1, 2]
    // d2 (image b) : y = 3x + 1 (passe par (0,1) et (1,4)) -> [3, 1, 1]
    // d3 (image d) : y = 2x + 1 (passe par (0,1) et (1,3)) -> [2, 1, 1]
    this.appliquerLesValeurs(1, 3, 1, [1, 1, 2], [3, 1, 1], [2, 1, 1])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const casFractions = [
      { num: 1, den: 3 },
      { num: -1, den: 3 },
      { num: 3, den: 1 },
      { num: 1, den: 2 },
      { num: -1, den: 2 },
      { num: 2, den: 3 },
      { num: -2, den: 3 },
    ]

    let compteur = 0
    do {
      const coeff = choice(casFractions)
      const p = choice([1, 2])

      // Génération de pièges mathématiquement logiques
      const d1Num = coeff.den
      const d1Den = Math.abs(coeff.num) === 0 ? 1 : Math.abs(coeff.num)

      const dist1: [number, number, number] = [d1Num, d1Den, p] // Piège : inverse fraction
      const dist2: [number, number, number] = [coeff.num, coeff.den, -p] // Piège : erreur de signe sur p
      const dist3: [number, number, number] = [-coeff.num, coeff.den, p] // Piège : erreur de signe sur m

      // Cas particulier pour éviter que dist1 soit identique à la bonne réponse si num == den
      if (d1Num === coeff.num && d1Den === coeff.den) {
        dist1[0] = coeff.num + 1
      }

      this.appliquerLesValeurs(coeff.num, coeff.den, p, dist1, dist2, dist3)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  /** Énoncé de la version où l'élève construit la droite. */
  private enonceConstruction(): string {
    const equationTex = `$y = ${reduireAxPlusB(new FractionEtendue(this.num, this.den), this.p)}$`
    return `Tracer la droite $d$ d’équation réduite ${equationTex} dans le repère orthonormé $(O ; \\vec{\\imath}, \\vec{\\jmath})$.`
  }

  /** Repère interactif : l'élève trace la droite avec l'outil « droite » sur une grille aimantée. */
  private figureConstruction(i: number): string {
    const figure = new Figure({
      xMin: -4.5,
      yMin: -3.5,
      width: 270,
      height: 300,
    })
    this.figuresApiGeom ??= []
    this.figuresApiGeom[i] = figure
    figure.setToolbar({
      tools: ['POINT', 'LINE', 'DRAG', 'REMOVE'],
      position: 'top',
    })
    // Le repère (O ; i, j) et ses graduations sont tracés ici plutôt que par les options
    // `repereOij` et `labelX` de la grille : ses vecteurs et ses étiquettes sont orange et
    // ne se règlent pas, et sans `repereOij`, le « 0 » de l'axe recouvre le « O ».
    figure.create('Grid', { labelX: false, labelY: false })
    for (let x = -4; x <= 4; x++) {
      if (x === 0) continue
      figure.create('TextByPosition', {
        text: `$${x}$`,
        x,
        y: 0,
        anchor: 'topCenter',
        dyInPixels: -6,
        fontSize: '0.67em',
        isSelectable: false,
        isDeletable: false,
      })
    }
    for (let y = -3; y <= 6; y++) {
      if (y === 0) continue
      figure.create('TextByPosition', {
        text: `$${y}$`,
        x: 0,
        y: y < 0 ? y - 0.1 : y,
        anchor: 'middleRight',
        dxInPixels: -9,
        dyInPixels: y < 0 ? 2 : 0,
        fontSize: '0.67em',
        isSelectable: false,
        isDeletable: false,
      })
    }
    const origine = figure.create('Point', {
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
      figure.create('Vector', {
        origin: origine,
        x,
        y,
        color: 'black',
        thickness: 2,
        isSelectable: false,
      })
    }
    for (const [texte, x, y, anchor] of [
      ['$O$', -0.25, -0.25, 'topRight'],
      ['$\\vec \\imath$', 0.5, -0.25, 'topRight'],
      ['$\\vec \\jmath$', -0.5, 0.25, 'bottomRight'],
    ] as const) {
      figure.create('TextByPosition', {
        text: texte,
        x,
        y,
        anchor,
        color: 'black',
        fontSize: '8pt',
        isSelectable: false,
        isDeletable: false,
      })
    }
    figure.options.color = bleuMathalea
    figure.options.thickness = 2
    figure.snapGrid = true
    figure.dx = 1
    figure.dy = 1
    this.droitesAttendues.set(figure, [this.num, this.den, this.p])
    const emplacement = figureApigeom({
      exercice: this,
      i,
      figure,
      defaultAction: 'LINE',
    })
    if (figure.ui) figure.ui.send({ type: 'LINE' })
    return emplacement
  }

  /**
   * La question n'est un QCM que si la case « Version QCM » est cochée. Sinon, l'élève
   * construit la droite : les tirages sont ceux du QCM (mêmes appels à `versionAleatoire`).
   */
  nouvelleVersion() {
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }
    this.consigne = ''
    this.figuresApiGeom = []
    this.droitesAttendues.clear()
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()
      if (this.questionJamaisPosee(i, this.num, this.den, this.p)) {
        this.listeQuestions[i] =
          this.enonceConstruction() +
          '<br>' +
          (this.interactif ? this.figureConstruction(i) : this.repereVide)
        this.listeCorrections[i] = this.correction ?? ''
        // La réponse est une construction : la correction complète est conservée.
        this.listeReponsesCourtes[i] = null
        i++
      }
    }
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApiGeom?.[i]
    const droiteAttendue =
      figure == null ? undefined : this.droitesAttendues.get(figure)
    if (figure == null || droiteAttendue == null) {
      throw new Error("La figure n'a pas été créée, n°" + i)
    }
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const lines = [...figure.elements.values()].filter((e) =>
      e.type.includes('Line'),
    )
    const [num, den, p] = droiteAttendue
    const { isValid } = figure.checkLine({
      point1: new Coords(0, p),
      point2: new Coords(den, p + num),
    })
    let result: 'OK' | 'KO' = 'KO'
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (isValid && lines.length === 1) result = 'OK'
    if (divFeedback != null) {
      if (result === 'OK') {
        divFeedback.innerHTML = '😎'
      } else {
        const message = document.createElement('p')
        message.innerText = '☹️'
        if (lines.length === 0) {
          message.innerHTML += " Aucune droite n'a été tracée."
        } else if (lines.length > 1) {
          message.innerHTML += " Il ne faut tracer qu'une seule droite."
        }
        divFeedback.insertBefore(message, divFeedback.firstChild)
      }
    }
    return result
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la construction.
    this.sup3 = true
  }
}
