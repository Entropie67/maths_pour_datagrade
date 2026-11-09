import Figure from 'apigeom'
import type VectorByPoints from 'apigeom/src/elements/vector/VectorByPoints'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { nomVecteurParPosition } from '../../lib/2d/NomVecteurParPosition'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import {
  representant,
  representantNomme,
} from '../../lib/2d/representantVecteur'
import {
  labelPoint,
  latex2d,
  latexParPoint,
  TexteParPoint,
  texteParPosition,
} from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre =
  'Représenter un vecteur dans un repère, à partir de ses coordonnées'
export const interactifReady = true
export const dateDeModifImportante = '06/08/2024'

// Changer couleur dans la correction

/**
 * Tracer un vecteur dont on connait les coordonnées dans un repère.
 * @author Stéphane Guyon légèrement modifié par Jean-claude Lhote, rendu interactif par Éric Elter
 */
export const uuid = '3a3ec'

export const refs = {
  'fr-fr': ['2G25-1', 'BP1GV01'],
  'fr-ch': ['3G91-4'],
}

export default class RepresenterUnVecteur extends Exercice {
  longueur?: number
  largeur?: number
  xA: number[]
  xB: number[]
  yA: number[]
  yB: number[]

  constructor() {
    super()
    this.nbQuestions = 2

    this.sup = 1 //
    this.besoinFormulaireNumerique = [
      'Situations différentes',
      3,
      '1 : Avec un point origine\n2 : Avec un point extrémité\n3 : Mélange',
    ]
    this.figuresApiGeom = []
    this.xA = []
    this.xB = []
    this.yA = []
    this.yB = []
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.longueur = 10
    this.largeur = 10
    this.figuresApiGeom = []
    this.xA = []
    this.xB = []
    this.yA = []
    this.yB = []
    let listeQuestions = []
    if (this.sup === 1)
      listeQuestions = combinaisonListes([1], this.nbQuestions)
    else if (this.sup === 2)
      listeQuestions = combinaisonListes([2], this.nbQuestions)
    else listeQuestions = combinaisonListes([1, 2], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      this.figuresApiGeom[i] = new Figure({
        xMin: -this.longueur - 0.25, // On enlève 0.25 unités
        yMin: -this.largeur - 0.25,
        // `width`/`height` sont exprimées à l'échelle 1 (30 px par unité) ;
        // `scale` réduit ensuite le SVG à 65 %.
        width: this.longueur * 2 * 30 + 20, // On ajoute 20 pixels
        height: this.largeur * 2 * 30 + 20,
        border: false,
        scale: 0.65,
      })

      const OVecteur = this.figuresApiGeom[i].create('Point', {
        x: 0,
        y: 0,
        isVisible: false,
      })
      const IVecteur = this.figuresApiGeom[i].create('Point', {
        x: 1,
        y: 0,
        isVisible: false,
      })
      const JVecteur = this.figuresApiGeom[i].create('Point', {
        x: 0,
        y: 1,
        isVisible: false,
      })
      this.figuresApiGeom[i].create('TextByPosition', {
        text: '$O$',
        x: -0.15,
        y: -0.15,
        anchor: 'topRight',
        color: orangeMathalea,
        fontSize: '8pt',
      })
      this.figuresApiGeom[i].create('Grid', {
        strokeWidthGrid: 1,
        color: 'black',
        yMin: -this.largeur + 0.1,
        yMax: this.largeur - 0.1,
        xMax: this.longueur - 0.1,
        xMin: -this.longueur + 0.1,
        axeX: true,
        axeY: true,
        labelX: true,
        labelY: true,
      })
      this.figuresApiGeom[i].create('TextByPosition', {
        text: '$\\vec \\imath$',
        x: 0.5,
        y: 0,
        anchor: 'topRight',
        color: orangeMathalea,
        fontSize: '1.5em',
      })
      this.figuresApiGeom[i].create('TextByPosition', {
        text: '$\\vec \\jmath$',
        x: -0.5,
        y: 0,
        anchor: 'bottomRight',
        color: orangeMathalea,
        fontSize: '1.5em',
      })
      this.figuresApiGeom[i].create('VectorByPoints', {
        point1: OVecteur,
        point2: IVecteur,
        color: orangeMathalea,
        thickness: 3,
        isSelectable: false,
      })
      this.figuresApiGeom[i].create('VectorByPoints', {
        point1: OVecteur,
        point2: JVecteur,
        color: orangeMathalea,
        thickness: 3,
        isSelectable: false,
      })
      this.figuresApiGeom[i].snapGrid = true
      this.figuresApiGeom[i].setToolbar({
        tools: ['DRAG', 'REMOVE', 'VECTOR', 'POINT', 'SET_OPTIONS'],
        // position: 'top'
      })
      this.figuresApiGeom[i].options.thickness = 3

      this.xA.push(randint(2, 8) * choice([-1, 1]))
      this.yA.push(randint(2, 8) * choice([-1, 1]))
      let ux = randint(3, 8) * choice([-1, 1])
      let uy = randint(3, 8) * choice([-1, 1])
      this.xB.push(this.xA[i] + ux)
      this.yB.push(this.yA[i] + uy)
      while (Math.abs(this.xB[i]) < 2 || Math.abs(this.xB[i]) > 8) {
        // On s'assure de choisir des points bien placés dans le repère.
        this.xA[i] = randint(3, 8) * choice([-1, 1])
        ux = randint(3, 8) * choice([-1, 1])
        this.xB[i] = this.xA[i] + ux
      }
      while (Math.abs(this.yB[i]) < 2 || Math.abs(this.yB[i]) > 8) {
        // Idem pour les ordonnées
        this.yA[i] = randint(3, 8) * choice([-1, 1])
        uy = randint(3, 8) * choice([-1, 1])
        this.yB[i] = this.yA[i] + uy
      }
      const A = pointAbstrait(this.xA[i], this.yA[i])
      const B = pointAbstrait(this.xB[i], this.yB[i])
      const AB = vecteur(A, B)
      const r = repere({ axesEpaisseur: 1 }) // On définit le repère
      const posLabelA = homothetie(B, A, -0.7 / longueur(A, B), '', 'center') // pour positionner les noms des points aux extrémités proprement
      const posLabelB = homothetie(A, B, -0.7 / longueur(A, B), '', 'center')
      const numeroPoint1 = randint(1, 26, [15]) // 15 : Pour éviter le point O
      const nomPoint1 = lettreDepuisChiffre(numeroPoint1)
      const numeroPoint2 = randint(1, 26, [15, numeroPoint1])
      const nomPoint2 = lettreDepuisChiffre(numeroPoint2)
      const labelA = latexParPoint(nomPoint1, posLabelA, 'red', 10, 12, '')
      const labelB = latexParPoint(nomPoint2, posLabelB, 'red', 10, 12, '')

      const H = pointAbstrait(this.xA[i] + ux, this.yA[i])
      const s = representant(AB, A) // On trace en rouge [AB]
      const h1 = representant(vecteur(A, H), A, bleuMathalea)
      const h2 = representant(vecteur(H, B), H, bleuMathalea)
      const longueurAH = latex2d(
        String(ux),
        milieu(A, H).x,
        milieu(A, H).y + 0.5,
        { color: bleuMathalea, letterSize: 'footnotesize' },
      )
      const longueurBH = latex2d(
        String(uy),
        milieu(B, H).x + 0.5,
        milieu(B, H).y,
        { color: bleuMathalea, letterSize: 'footnotesize' },
      )
      const O = pointAbstrait(0, 0) // On définit et on trace le point O
      const o = texteParPosition(
        'O',
        -0.3,
        -0.3,
        0,
        bleuMathalea,
        0.75,
        'milieu',
        true,
      )
      const I = pointAbstrait(1, 0) // On définit sans tracer le point I
      const J = pointAbstrait(0, 1) // On définit sans tracer le point J
      const k = representant(vecteur(O, I), O, bleuMathalea) // Variable qui trace [OI] en bleu
      const j = representant(vecteur(O, J), O, bleuMathalea) // Variable qui trace [OJ] en bleu
      s.epaisseur = 1.5 // Variable qui grossit le tracé du vecteur AB
      s.color = colorToLatexOrHTML(orangeMathalea)
      k.epaisseur = 1.1 // Variable qui grossit le tracé du vecteur OI
      j.epaisseur = 1.1 // Variable qui grossit le tracé du vecteur OJ
      h1.epaisseur = 1.5 // Variable qui grossit le tracé bleu
      h2.epaisseur = 1.5 // Variable qui grossit le tracé bleu
      const nomi = nomVecteurParPosition('i', 0.5, -0.7, 0.7, 0, bleuMathalea)
      const nomj = nomVecteurParPosition('j', -0.7, 0.5, 0.7, 0, bleuMathalea)
      const nomAB = representantNomme(AB, A, 'u', 0.7, 'red')
      let l: TexteParPoint[]
      if (listeQuestions[i] === 1) {
        l = labelPoint(A, 'red') as TexteParPoint[] // Variable qui trace les nom s A et B

        // texte = ` Dans un repère orthonormé $\\big(O ; \\vec i,\\vec j\\big)$, représenter le vecteur $\\vec{u}\\begin{pmatrix}${ux} \\\\${uy}\\end{pmatrix}$, `
        texte = ` Dans un repère orthonormé $\\big(O ; \\vec i,\\vec j\\big)$, représenter le vecteur $\\begin{pmatrix}${ux} \\\\${uy}\\end{pmatrix}$ ayant pour origine le point $${nomPoint1}\\left(${this.xA[i]};${this.yA[i]}\\right)$.`
        this.figuresApiGeom[i].create('Point', {
          x: this.xA[i],
          y: this.yA[i],
          label: nomPoint1,
          isFree: false,
          isSelectable: false,
        })
        this.figuresApiGeom[i].options.color = 'green'
        texteCorr = "On sait qu'un vecteur mesure un déplacement."
        texteCorr += `<br> À partir du point $${nomPoint1}$, on trace donc le déplacement correspondant à $${ux}$ unités horizontalement puis $${uy}$ unités verticalement pour arriver au point $${nomPoint2}$, extrémité du vecteur $\\vec{u}$.`
      } else {
        // texte = ` Dans un repère orthonormé $\\big(O ; \\vec i,\\vec j\\big)$, représenter le vecteur $\\vec{u}\\begin{pmatrix}${ux} \\\\${uy}\\end{pmatrix}$, `
        texte = ` Dans un repère orthonormé $\\big(O ; \\vec i,\\vec j\\big)$, représenter le vecteur $\\begin{pmatrix}${ux} \\\\${uy}\\end{pmatrix}$ ayant pour extrémité le point $${nomPoint2}\\left(${this.xB[i]};${this.yB[i]}\\right)$.`
        this.figuresApiGeom[i].create('Point', {
          x: this.xB[i],
          y: this.yB[i],
          label: nomPoint2,
          isFree: false,
          isSelectable: false,
        })
        texteCorr = "On sait qu'un vecteur mesure un déplacement."
        texteCorr += `<br> On cherche donc un point $${nomPoint1}$, à partir duquel en traçant le déplacement correspondant à $${ux}$ unités horizontalement puis $${uy}$ unités verticalement, on arrive au point $${nomPoint2}$.`
        l = labelPoint(A, B, 'red') as TexteParPoint[] // Variable qui trace les noms A et B
      }
      texteCorr += `<br> Voir les déplacements dans le repère ci-dessous et le tracé en orange du vecteur-solution $${miseEnEvidence('\\vec{u}')}$.<br>`
      texte += this.interactif
        ? `<br>Pour vous aider, vous pouvez créer autant de vecteurs que vous souhaitez mais pour valider votre réponse, ${texteEnCouleurEtGras('il faut que le vecteur-solution soit en vert')} et que seul ce vecteur-solution doit être en vert.`
        : ''
      texte += figureApigeom({
        exercice: this,
        figure: this.figuresApiGeom[i],
        i,
        defaultAction: 'VECTOR',
      })

      texteCorr += mathalea2d(
        {
          xmin: -10,
          ymin: -10,
          xmax: 10,
          ymax: 10,
          scale: 0.4,
        },
        r,
        l,
        k,
        j,
        s,
        o,
        nomi,
        nomj,
        nomAB,
        h1,
        h2,
        labelA,
        labelB,
        longueurAH,
        longueurBH,
      ) // On trace le graphique

      if (
        this.questionJamaisPosee(
          i,
          this.xA[i],
          this.yA[i],
          this.xB[i],
          this.yB[i],
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom[i].id] = figureAnswerJson(
      this.figuresApiGeom[i],
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    this.figuresApiGeom[i].isDynamic = false
    this.figuresApiGeom[i].divButtons.style.display = 'none'
    this.figuresApiGeom[i].divUserMessage.style.display = 'none'

    const { isValid, vectors } = this.figuresApiGeom[i].checkVector({
      color: 'green',
      xOrigin: this.xA[i],
      x: this.xB[i] - this.xA[i],
      yOrigin: this.yA[i],
      y: this.yB[i] - this.yA[i],
    })

    const nbVecteurs = [...this.figuresApiGeom[i].elements.values()].filter(
      (e) =>
        e.type === 'VectorByPoints' && (e as VectorByPoints).color === 'green',
    ).length

    if (isValid && nbVecteurs === 1) {
      divFeedback.innerHTML = 'Bravo !'
      if (vectors[0] !== undefined) {
        vectors[0].color = 'green'
      }
      return 'OK'
    }

    const wrongVectors = [...this.figuresApiGeom[i].elements.values()].filter(
      (e) => e.type === 'VectorByPoints' && (e as VectorByPoints).isSelectable,
    ) as VectorByPoints[]
    for (const vector of wrongVectors) {
      vector.color = 'red'
    }

    let message
    if (nbVecteurs === 0) {
      message = "Aucun vecteur vert n'est tracé."
    } else if (nbVecteurs > 1) {
      message = 'Trop de vecteurs sont tracés.'
    } else {
      message = "Le vecteur tracé n'est pas celui qui est attendu."
    }
    divFeedback.innerHTML = message
    return 'KO'
  }
}
