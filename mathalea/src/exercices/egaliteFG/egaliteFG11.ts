import Figure from 'apigeom'
import { symboleParallele } from '../../lib/outils/notationsGeometrie'
import Element2D from 'apigeom/src/elements/Element2D'
import type { MathfieldElement } from 'mathlive'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteGras, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Hypatie d\'Alexandrie'
export const dateDePublication = '15/07/2026'
export const interactifReady = true
export const uuid = '1ed48'
export const refs = {
  'fr-fr': [ 'EgaliteFG3-4e-11', 'EgaliteFG4-3e-11'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Théorème de Thalès','Trigonométrie']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG11 extends Exercice {
  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.exoCustomResultat = true
    this.consigne = texteItalique(
      "D'après " + ajouterLien('https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true', '«\u00a0Sur le chemin de l\'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles'),
    )
    this.consigne +=
      (context.isHtml ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/hypatie.jpg" alt="Portrait d'Hypatie d'Alexandrie" style="width:130px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Hypatie d'Alexandrie (v. 355-415) — Source${sp()}: gravure de John Toland, 1720, domaine public</p></div>` : '') +
      "<br>Les travaux d'Hypatie d'Alexandrie traitaient de problèmes de géométrie. Aujourd'hui, nous allons explorer un cercle qui passe par trois points.<br><br>" +
      texteGras('Partie 1') + '<br>'
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []

    const schemaHtml = `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">
  <svg viewBox="0 0 280 200" style="max-width:340px; width:100%; height:auto;">
    <defs>
      <marker id="fleche11deb" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M6,0 L0,3 L6,6 z" fill="#3b6fd4" />
      </marker>
      <marker id="fleche11fin" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
        <path d="M2,0 L8,3 L2,6 z" fill="#3b6fd4" />
      </marker>
    </defs>
    <g stroke="#4a4a4a" stroke-width="1">
      <rect x="189" y="145" width="22" height="5" fill="#8a8a8a" />
      <rect x="192" y="108" width="16" height="37" fill="#fdfdfd" />
      <rect x="193" y="90" width="14" height="18" fill="#c0392b" />
      <rect x="194" y="62" width="12" height="28" fill="#fdfdfd" />
      <rect x="195" y="48" width="10" height="14" fill="#c0392b" />
      <path d="M196,145 v-9 a4,4 0 0 1 8,0 v9 z" fill="#5a3a22" stroke-width="0.6" />
      <rect x="197.5" y="116" width="5" height="6" fill="#8ecae6" stroke-width="0.6" />
      <rect x="197" y="70" width="6" height="7" fill="#8ecae6" stroke-width="0.6" />
      <rect x="192" y="45" width="16" height="3" fill="#333" stroke="none" />
      <rect x="195" y="28" width="10" height="17" fill="#cfe8f7" />
      <line x1="200" y1="28" x2="200" y2="45" stroke-width="0.6" />
      <rect x="193.5" y="25" width="13" height="3" fill="#333" stroke="none" />
      <path d="M194.5,25 L200,15 L205.5,25 Z" fill="#6b6b6b" />
    </g>
    <line x1="20" y1="150" x2="200" y2="150" stroke="#333" stroke-width="2" />
    <line x1="20" y1="150" x2="200" y2="15" stroke="#333" stroke-dasharray="4,3" />
    <line x1="80" y1="150" x2="80" y2="105" stroke="#333" stroke-width="3" />
    <circle cx="20" cy="150" r="3" fill="#333" />
    <circle cx="80" cy="150" r="3" fill="#333" />
    <circle cx="200" cy="150" r="3" fill="#333" />
    <circle cx="80" cy="105" r="3" fill="#333" />
    <circle cx="200" cy="15" r="3" fill="#333" />
    <text x="8" y="166" font-size="12" font-weight="bold">O</text>
    <text x="76" y="166" font-size="12" font-weight="bold">T</text>
    <text x="196" y="166" font-size="12" font-weight="bold">P</text>
    <text x="60" y="102" font-size="12" font-weight="bold">B</text>
    <text x="196" y="10" font-size="12" font-weight="bold">A</text>
    <line x1="20" y1="170" x2="80" y2="170" stroke="#3b6fd4" stroke-dasharray="3,2" marker-start="url(#fleche11deb)" marker-end="url(#fleche11fin)" />
    <text x="50" y="167" text-anchor="middle" font-size="10" fill="#3b6fd4" paint-order="stroke" stroke="#fff" stroke-width="3">60 m</text>
    <line x1="80" y1="170" x2="200" y2="170" stroke="#3b6fd4" stroke-dasharray="3,2" marker-start="url(#fleche11deb)" marker-end="url(#fleche11fin)" />
    <text x="140" y="167" text-anchor="middle" font-size="10" fill="#3b6fd4" paint-order="stroke" stroke="#fff" stroke-width="3">120 m</text>
    <line x1="20" y1="187" x2="200" y2="187" stroke="#3b6fd4" stroke-dasharray="3,2" marker-start="url(#fleche11deb)" marker-end="url(#fleche11fin)" />
    <text x="110" y="197" text-anchor="middle" font-size="10" fill="#3b6fd4">180 m</text>
    <line x1="60" y1="150" x2="60" y2="105" stroke="#3b6fd4" stroke-dasharray="3,2" marker-start="url(#fleche11deb)" marker-end="url(#fleche11fin)" />
    <text x="55" y="130" text-anchor="end" font-size="10" fill="#3b6fd4">45 m</text>
  </svg>
  <p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Schéma à l'échelle de la méthode d'Hypatie pour mesurer la hauteur du phare</p>
</div>`
    const schemaLatex = `
\\begin{center}
\\begin{tikzpicture}[scale=0.05, point/.style={circle, fill=black, inner sep=1pt}]
    \\coordinate (O) at (0,0);
    \\coordinate (T) at (60,0);
    \\coordinate (P) at (180,0);
    \\coordinate (B) at (60,45);
    \\coordinate (A) at (180,135);
    \\draw[thick] (O) -- (P);
    \\draw[thick] (O) -- (A);
    \\draw[thick] (T) -- (B);
    \\draw[thick, double, double distance=2pt] (P) -- (A);
    \\node at (O) {$\\times$};
    \\node[below left] at (O) {O};
    \\node at (T) {$\\times$};
    \\node[below] at (T) {T};
    \\node at (P) {$\\times$};
    \\node[below] at (P) {P};
    \\node at (B) {$\\times$};
    \\node[above left] at (B) {B};
    \\node at (A) {$\\times$};
    \\node[above] at (A) {A};
    \\draw[<->, dashed, blue] (0,-10) -- (60,-10) node[midway, fill=white] {60 m};
    \\draw[<->, dashed, blue] (60,-10) -- (180,-10) node[midway, fill=white] {120 m};
    \\draw[<->, dashed, blue] (0,-25) -- (180,-25) node[midway, fill=white] {180 m};
    \\draw[<->, dashed, blue] (45,0) -- (45,45) node[midway, fill=white] {45 m};
\\end{tikzpicture}
\\end{center}
`
    const partie2Intro =
      texteGras('Partie 2') + `<br>Hypatie d'Alexandrie veut connaître la hauteur du phare d'Alexandrie. Elle réalise un croquis à partir de mesures faites sur le terrain.<br>On sait que${sp()}:<br>` +
      '$\\bullet$ Les droites $(BT)$ et $(PA)$ sont parallèles.<br>' +
      "$\\bullet$ Les points $O$, $B$ et $A$ sont alignés.<br>" +
      "$\\bullet$ Les points $O$, $T$ et $P$ sont alignés.<br>" +
      "$\\bullet$ $OP=180\\text{ m}$, $BT=45\\text{ m}$, $OT=60\\text{ m}$." +
      (context.isHtml ? schemaHtml : schemaLatex)

    // --- Figure de correction : médiatrices déjà tracées + cercle circonscrit ---
    const figureCorr = new Figure({
      xMin: -5,
      yMin: -5,
      width: 260,
      height: 260,
      border: true,
    })
    this.figuresApiGeomCorr[0] = figureCorr
    const aCorr = figureCorr.create('Point', {
      x: -3,
      y: -2,
      label: 'A',
      labelDxInPixels: -16,
      labelDyInPixels: 14,
      shape: 'x',
    })
    const bCorr = figureCorr.create('Point', {
      x: 3,
      y: -1,
      label: 'B',
      labelDxInPixels: 10,
      labelDyInPixels: 14,
      shape: 'x',
    })
    const cCorr = figureCorr.create('Point', {
      x: -1,
      y: 3,
      label: 'C',
      labelDxInPixels: -8,
      labelDyInPixels: -12,
      shape: 'x',
    })
    figureCorr.create('Segment', { point1: aCorr, point2: bCorr })
    figureCorr.create('Segment', { point1: bCorr, point2: cCorr })
    figureCorr.create('Segment', { point1: cCorr, point2: aCorr })
    const medABCorr = figureCorr.create('PerpendicularBisectorByPoints', {
      point1: aCorr,
      point2: bCorr,
      color: 'red',
      isDashed: true,
    })
    const medBCCorr = figureCorr.create('PerpendicularBisectorByPoints', {
      point1: bCorr,
      point2: cCorr,
      color: 'blue',
      isDashed: true,
    })
    figureCorr.create('PerpendicularBisectorByPoints', {
      point1: cCorr,
      point2: aCorr,
      color: 'green',
      isDashed: true,
    })
    const centreCorr = figureCorr.create('PointIntersectionLL', {
      line1: medABCorr,
      line2: medBCCorr,
      label: 'O',
      labelDxInPixels: 8,
      labelDyInPixels: -10,
    })
    figureCorr.create('CircleCenterPoint', {
      center: centreCorr,
      point: aCorr,
      isDashed: true,
      color: '#888888',
    })

    let figureCorrHtml = ''
    if (context.isHtml) {
      figureCorrHtml = figureApigeom({
        exercice: this,
        i: 0,
        figure: figureCorr,
        idAddendum: 'Corr',
        hasFeedback: false,
        isDynamic: false,
      })
      figureCorr.divButtons.style.display = 'none'
      figureCorr.divUserMessage.style.display = 'none'
    } else {
      figureCorrHtml = figureCorr.tikz()
    }

    const correction0 =
      `Les trois médiatrices d'un triangle sont concourantes${sp()}: elles se coupent en un même point, qui est le centre du cercle circonscrit au triangle (le cercle passant par les trois sommets), et qui est équidistant des trois sommets.<br>` +
      figureCorrHtml

    // --- Question 0 : construction interactive des médiatrices, ou consigne statique ---
    let texte0: string
    if (this.interactif && context.isHtml) {
      const figure = new Figure({
        xMin: -5,
        yMin: -5,
        width: 300,
        height: 300,
        border: true,
      })
      this.figuresApiGeom[0] = figure
      const pointA = figure.create('Point', {
        x: -3,
        y: -2,
        label: 'A',
        labelDxInPixels: -16,
        labelDyInPixels: 14,
        shape: 'x',
      })
      pointA.isDeletable = false
      const pointB = figure.create('Point', {
        x: 3,
        y: -1,
        label: 'B',
        labelDxInPixels: 10,
        labelDyInPixels: 14,
        shape: 'x',
      })
      pointB.isDeletable = false
      const pointC = figure.create('Point', {
        x: -1,
        y: 3,
        label: 'C',
        labelDxInPixels: -8,
        labelDyInPixels: -12,
        shape: 'x',
      })
      pointC.isDeletable = false
      figure.create('Segment', { point1: pointA, point2: pointB })
      figure.create('Segment', { point1: pointB, point2: pointC })
      figure.create('Segment', { point1: pointC, point2: pointA })
      figure.setToolbar({
        tools: [
          'POINT',
          'MIDDLE',
          'POINT_ON',
          'POINT_INTERSECTION',
          'SEGMENT',
          'LINE',
          'LINE_PERPENDICULAR',
          'DRAG',
          'SHAKE',
          'REMOVE',
          'SET_OPTIONS',
        ],
      })
      figure.options.changeColorChangeActionToSetOptions = true

      texte0 =
        '1. Le triangle $ABC$ ci-dessous est déjà tracé (tu peux déplacer les points $A$, $B$ et $C$).<br>' +
        `2. Construis, à la perpendiculaire, les trois médiatrices (rappel${sp()}: une médiatrice est une droite qui coupe un segment en son milieu et qui lui est perpendiculaire)${sp()}:<br>` +
        'a) en <span style="color:red">rouge</span>, la médiatrice du segment $[AB]$ ;<br>' +
        'b) en <span style="color:blue">bleu</span>, la médiatrice du segment $[BC]$ ;<br>' +
        'c) en <span style="color:green">vert</span>, la médiatrice du segment $[AC]$.<br>' +
        figureApigeom({ exercice: this, i: 0, figure, defaultAction: 'DRAG' }) +
        `3. Que peux-tu dire des trois médiatrices${sp()}?`
    } else {
      texte0 =
        '1. Trace un triangle $ABC$ quelconque.<br>' +
        `2. Trace les médiatrices des segments $[AB]$, $[BC]$ et $[AC]$ (rappel${sp()}: une médiatrice est une droite qui coupe un segment en son milieu et qui lui est perpendiculaire).<br>` +
        `3. Que peux-tu dire sur les médiatrices${sp()}?`
    }

    let texte1 =
      partie2Intro +
      "<br>À l'aide de ses connaissances en mathématiques, Hypatie d'Alexandrie a pu calculer la hauteur du phare d'Alexandrie. Retrouver sa méthode pour calculer la hauteur $PA$ du phare, en mètres."
    if (this.interactif) texte1 += ajouteChampTexteMathLive(this, 1, '', { texteApres: 'm' }) + '<br>'
    const correction1 =
      `Les droites $(OP)$ et $(OA)$ sont sécantes en $O$ et $(BT)\\,${symboleParallele()}\\,(PA)$, donc d'après le théorème de Thalès${sp()}:<br>$\\dfrac{OT}{OP}=\\dfrac{OB}{OA}=\\dfrac{BT}{PA}$<br>Avec les valeurs connues${sp()}: $\\dfrac{60}{180}=\\dfrac{45}{PA}$.<br>Les produits en croix sont égaux, donc $60\\times PA=45\\times 180$.<br>$PA=\\dfrac{45\\times 180}{60}=${miseEnEvidence('135\\text{ m}')}$.`

    let texte2 =
      "Calculer la mesure de l'angle $\\widehat{BOT}$, en degrés (arrondie au dixième)."
    if (this.interactif) texte2 += ajouteChampTexteMathLive(this, 2, '', { texteApres: '°' }) + '<br>'
    const correction2 =
      `Le triangle $OTB$ est rectangle en $T$ (car $(BT)\\perp(OP)$, la tige d'Hypatie étant verticale comme le phare).<br>La tangente de l'angle $\\widehat{BOT}$ est définie par${sp()}: $\\tan\\left(\\widehat{BOT}\\right)=\\dfrac{BT}{OT}$.<br>Avec les données numériques${sp()}: $\\tan\\left(\\widehat{BOT}\\right)=\\dfrac{45}{60}=0{,}75$, donc $\\widehat{BOT}=\\arctan(0{,}75)\\approx ${miseEnEvidence('36{,}9\\text{°}')}$.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2

    this.listeReponsesCourtes[0] = null

    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number): string | string[] => {
    if (this.answers == null) this.answers = {}

    if (i === 0) {
      const figure = this.figuresApiGeom?.[0]
      if (figure == null) return ['KO', 'KO', 'KO']
      this.answers[figure.id] = figureAnswerJson(figure)
      const paires: Array<{ p1: string; p2: string; color: string; nom: string }> = [
        { p1: 'A', p2: 'B', color: 'red', nom: 'rouge' },
        { p1: 'B', p2: 'C', color: 'blue', nom: 'bleu' },
        { p1: 'C', p2: 'A', color: 'green', nom: 'vert' },
      ]
      const resultat: Array<'OK' | 'KO'> = []
      let feedback = ''
      for (const { p1, p2, color, nom } of paires) {
        const elementsCouleur = [...figure.elements.values()].filter(
          (e) => e instanceof Element2D && e.color === color,
        )
        const elementsLigneCouleur = elementsCouleur.filter(
          (e) => e instanceof Element2D && e.type.includes('Line'),
        )
        if (elementsCouleur.length === 0) {
          resultat.push('KO')
          feedback += `☹️ Aucun élément n'est en ${nom}.<br>`
        } else if (elementsLigneCouleur.length !== 1) {
          resultat.push('KO')
          feedback += `☹️ L'élément en ${nom} n'est pas une droite unique.<br>`
        } else {
          const verif = figure.checkPerpendicularBisector({
            label1: p1,
            label2: p2,
            color,
          })
          resultat.push(verif.isValid ? 'OK' : 'KO')
          feedback += verif.isValid
            ? `😎 La droite en ${nom} est bien la médiatrice de $[${p1}${p2}]$.<br>`
            : `☹️ La droite en ${nom} n'est pas la médiatrice de $[${p1}${p2}]$.<br>`
        }
      }
      const divFeedback = document.querySelector(
        `#feedbackEx${this.numeroExercice}Q${i}`,
      ) as HTMLDivElement
      if (divFeedback) divFeedback.innerHTML = feedback
      figure.isDynamic = false
      figure.divButtons.style.display = 'none'
      figure.divUserMessage.style.display = 'none'
      return resultat
    }

    const attendu = i === 1 ? '135' : '36.9'
    const mf = document.querySelector(
      `math-field#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement
    if (mf == null) return 'KO'
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()
    return fonctionComparaison(mf.value, attendu).isOk ? 'OK' : 'KO'
  }
}
