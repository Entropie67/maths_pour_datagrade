import Figure from 'apigeom'
import {
  areCoincident,
  equationLine,
} from 'apigeom/src/elements/calculus/Coords'
import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import type Segment from 'apigeom/src/elements/lines/Segment'
import type Point from 'apigeom/src/elements/points/Point'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille, seyes } from '../../lib/2d/Grille'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { codageMedianeTriangle } from '../../lib/2d/triangles'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import {
  centreGraviteTriangle,
  medianeTriangle,
} from '../../lib/2d/utilitairesTriangle'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { elementVivant } from '../../lib/apigeom/elementVivant'
import figureApigeom from '../../lib/figureApigeom'
import {
  choice,
  combinaisonListes,
  enleveElementBis,
} from '../../lib/outils/arrayOutils'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer une médiane dans un triangle'

export const dateDePublication = '17/01/2025'
export const interactifReady = true

export const uuid = '63d3a'
export const refs = {
  'fr-fr': ['5G5G-1'],
  'fr-ch': ['9R2ES2F-1', '9R3ES2F-1'],
}
/**
 * Tracer une médiane
 *  deux type de vocabulaire  issue du sommet, relative à la base
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  pA: Point[] = []
  pB: Point[] = []
  pC: Point[] = []
  relative: boolean[] = []

  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Type de vocabulaire',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Médiane issue du sommet',
        '2 : Médiane relative à la base',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Point de concours', false]
    this.besoinFormulaire3Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.sup = '0'
    this.sup2 = false
    this.sup3 = 3
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    let anim = new Alea2iep()
    anim.equerreZoom(150)

    const typeVocabulaireDisponibles = ['sommet', 'base']
    const typesDeVocabulaireDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeVocabulaireDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeVocabulaire = combinaisonListes(
      typesDeVocabulaireDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let enonce = ''
      this.relative[i] = listeTypeVocabulaire[i] === 'base'
      anim = new Alea2iep()
      let sc = 0
      let angleDepart = 0 // randint(-17, 18) * 10 //0
      const AB = 8
      const S: PointAbstrait[] = []

      S[0] = pointAbstrait(0, 0)
      angleDepart = randint(-17, 18) * 10

      const coordCy = randint(2, 5)
      const CoordCx = randint(coordCy === 5 ? 2 : 0, coordCy === 5 ? 6 : 8)
      S[1] = rotation(pointAbstrait(AB, 0), S[0], angleDepart)
      S[2] = rotation(pointAbstrait(CoordCx, coordCy), S[0], angleDepart)
      let G = centreGraviteTriangle(S[0], S[1], S[2])
      S[0] = pointAbstrait(Math.round(S[0].x), Math.round(S[0].y))
      S[1] = pointAbstrait(Math.round(S[1].x), Math.round(S[1].y))
      S[2] = pointAbstrait(Math.round(S[2].x), Math.round(S[2].y))
      G = centreGraviteTriangle(S[0], S[1], S[2])
      const angA = angle(S[0], S[1], S[2])
      const angB = angle(S[2], S[0], S[1])
      const angC = angle(S[1], S[2], S[0])
      G.color = colorToLatexOrHTML(bleuMathalea)
      const nomTriangle = new Triangle()
      let nomSommets = nomTriangle.getSommets(false)
      const nomDuTriangleEnonce = `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`
      G.nom = choice(
        ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
        [...nomSommets],
      )
      nomSommets = combinaisonListes(nomSommets, 3)
      for (let j = 0; j < 3; j++) {
        S[j].nom = nomSommets[j]
      }
      const leTriangle = polygone([S[0], S[1], S[2]])
      const nom = nommePolygone(
        leTriangle,
        `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`,
      )
      const droiteRem = []
      const codage: ObjetMathalea2D[] = []
      let objetsDessinBordures: NestedObjetMathalea2dArray = []
      let objetsDessin: NestedObjetMathalea2dArray = []
      let objetsDessinCorrection: NestedObjetMathalea2dArray = []
      const nbDroite = this.sup2 ? 3 : 1
      let Sbis = [...S]
      // Tirage conservé pour ne pas modifier les valeurs aléatoires suivantes.
      // Sbis ne doit pas être décalé : la première médiane tracée doit être
      // celle issue de S[2] (relative à [S[0]S[1]]) demandée dans l'énoncé.
      randint(1, 6)
      for (let j = 0; j < nbDroite; j++) {
        droiteRem[j] = medianeTriangle(
          Sbis[2],
          Sbis[0],
          Sbis[1],
          orangeMathalea,
        )
        droiteRem[j].epaisseur = 1
        codage[j] = codageMedianeTriangle(Sbis[0], Sbis[1], orangeMathalea)
        Sbis = decale(Sbis)
      }

      objetsDessin = [leTriangle, nom]
      objetsDessinCorrection = [leTriangle, nom, droiteRem[0], codage[0]]
      objetsDessinBordures = [leTriangle, droiteRem[0], nom]

      if (this.sup2) {
        objetsDessinCorrection.push(
          droiteRem[1],
          droiteRem[2],
          codage[1],
          codage[2],
          labelPoint(G),
        )
      }
      const bord = fixeBordures(objetsDessinBordures)
      const taille = 5.5
      const bordfixes = {
        xmin: Math.min(
          Math.floor((bord.xmin + bord.xmax) / 2 - taille),
          Math.floor(bord.xmin),
        ),
        xmax: Math.max(
          Math.ceil((bord.xmin + bord.xmax) / 2 + taille),
          Math.ceil(bord.xmax),
        ),
        ymin: Math.min(
          Math.floor((bord.ymin + bord.ymax) / 2 - taille),
          Math.floor(bord.ymin),
        ),
        ymax: Math.max(
          Math.ceil((bord.ymin + bord.ymax) / 2 + taille),
          Math.ceil(bord.ymax),
        ),
      }
      enleveElementBis(objetsDessin, undefined)
      anim.recadre(bordfixes.xmin - 3, bordfixes.ymax)
      anim.traitRapide(S[0], S[1])
      anim.traitRapide(S[1], S[2])
      anim.traitRapide(S[2], S[0])
      let A = positionneLabelIEP(S[0], G)
      anim.pointNommer(A, S[0].nom, { dx: 0, dy: 0, tempo: 0 })
      A = positionneLabelIEP(S[1], G)
      anim.pointNommer(A, S[1].nom, { dx: 0, dy: 0, tempo: 0 })
      A = positionneLabelIEP(S[2], G)
      anim.pointNommer(A, S[2].nom, { dx: 0, dy: 0, tempo: 0 })
      anim.couleur = 'red'
      anim.mediane(S[0], S[1], S[2], { couleur: 'red' })
      if (this.sup2) {
        anim.regleMontrer()
        anim.crayonMontrer()
        anim.mediane(S[2], S[0], S[1], { couleur: 'red' })
        anim.mediane(S[1], S[2], S[0], { couleur: 'red' })
        anim.pointCreer(G, { label: G.nom })
      }
      anim.regleMasquer()
      anim.crayonMasquer()
      if (this.interactif) {
        const figure = new Figure({
          xMin: bordfixes.xmin,
          yMin: bordfixes.ymin,
          width: (bordfixes.xmax - bordfixes.xmin) * 20,
          height: (bordfixes.ymax - bordfixes.ymin) * 20,
          pixelsPerUnit: 20,
        })
        figure.options.labelAutomaticBeginsWith = 'A'
        figure.options.labelAutomaticForPoints = true
        figure.options.thickness = 2

        this.pA[i] = figure.create('Point', {
          x: S[0].x,
          y: S[0].y,
          label: S[0].nom,
          isFree: false,
        })
        this.pB[i] = figure.create('Point', {
          x: S[1].x,
          y: S[1].y,
          label: S[1].nom,
          isFree: false,
        })
        this.pC[i] = figure.create('Point', {
          x: S[2].x,
          y: S[2].y,
          label: S[2].nom,
          isFree: false,
        })
        const triangle = figure.create('Polygon', {
          points: [this.pA[i], this.pB[i], this.pC[i]],
          color: 'black',
          isVisible: true,
        })
        this.pA[i].isDeletable = false
        this.pB[i].isDeletable = false
        this.pC[i].isDeletable = false
        triangle.isDeletable = false
        this.figuresApiGeom[i] = figure
        this.figuresApiGeom[i].setToolbar({
          tools: [
            'POINT',
            'MIDDLE',
            'POINT_INTERSECTION',
            'LINE',
            'SEGMENT',
            'POLYGON',
            'LINE_PERPENDICULAR',
            'DRAW_ANGLE',
            'BISECTOR_BY_POINTS',
            'DRAG',
            'REMOVE',
            'SHAKE',
          ],
          position: 'top',
        })
        this.figuresApiGeom[i].options.color = 'blue' // Ne pas mettre bleuMathalea quand il s'agit d'apigeom
        enonce += figureApigeom({
          exercice: this,
          i,
          figure: this.figuresApiGeom[i],
          idAddendum: `5G5E2Ex${this.numeroExercice}Q${i}`,
          defaultAction: 'POINT',
        })
      } else {
        let g, carreaux
        if (this.sup3 < 3)
          g = grille(
            bordfixes.xmin,
            bordfixes.ymin,
            bordfixes.xmax,
            bordfixes.ymax,
            'gray',
            0.7,
          )
        else g = vide2d()
        if (this.sup3 === 2) {
          sc = 0.8
          carreaux = seyes(
            bordfixes.xmin,
            bordfixes.ymin,
            bordfixes.xmax,
            bordfixes.ymax,
          )
        } else {
          sc = 0.5
          carreaux = vide2d()
        }
        if (this.interactif) {
          g = vide2d()
          carreaux = vide2d()
        }
        objetsDessin.push(g, carreaux)
        objetsDessinCorrection.push(g, carreaux)

        enonce += mathalea2d(
          Object.assign(
            {
              display: 'block', //'inline-block',
              scale: sc,
              pixelsParCm: 20,
            } as const,
            bordfixes,
          ),
          ...objetsDessin,
        )
      }
      if (context.isHtml && !this.interactif)
        texte += 'Reproduire la figure ci-dessous.<br>'
      if (this.sup2) {
        texte += `Dans le triangle $${nomDuTriangleEnonce}$, tracer les trois médianes ${listeTypeVocabulaire[i] === 'sommet' ? `issues de chacun des sommets` : `relatives aux trois côtés`}.<br>Que peut-on remarquer ?<br>`
      } else {
        texte += `Dans le triangle $${nomDuTriangleEnonce}$, tracer la médiane ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`}.<br>`
      }
      texte += enonce
      if (this.sup2) {
        texteCorr += `Dans le triangle $${nomDuTriangleEnonce}$, on place les milieux de chaque côté, puis on trace les trois droites passant par les sommets et les milieux des côtés opposés.<br>`
        texteCorr += `On remarque que les trois droites se coupent au même point $${G.nom}$. On dit que les droites sont concourantes et le point $${G.nom}$ est appelé le centre de gravité du triangle.<br>`
      } else {
        texteCorr += `Dans le triangle $${nomDuTriangleEnonce}$, on remarque que le côté $[${S[0].nom}${S[1].nom}]$ est opposé au sommet $${S[2].nom}$. Donc la médiane ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`} est la droite qui passe par le milieu du côté $[${S[0].nom}${S[1].nom}]$ et le sommet $${S[2].nom}$.<br>`
      }
      texteCorr += mathalea2d(
        Object.assign(
          {
            display: 'block', //'inline-block',
            scale: sc,
            pixelsParCm: 20,
          } as const,
          bordfixes,
        ),
        ...objetsDessinCorrection,
      )
      texteCorr += anim.htmlBouton(this.numeroExercice ?? 0, i)
      if (this.questionJamaisPosee(i, angA, angB, angC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom![i].id] = figureAnswerJson(
      this.figuresApiGeom![i],
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const figure = this.figuresApiGeom[i]
    // Toute la partie ci-dessous joue avec les tests propres à apiGeom (voir exercices pour exemple)
    // Il n'y a pas de méthode générique, chaque correction va dépendre de l'exercice....
    // Sommets lus dans la figure : elle a pu être rechargée (Annuler, copie Capytale)
    const pA = elementVivant(figure, this.pA[i])
    const pB = elementVivant(figure, this.pB[i])
    const pC = elementVivant(figure, this.pC[i])
    figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    figure.buttons.get('SHAKE')?.click()
    const { isValid: isValid1, message: message1 } = checkMediane({
      figure,
      point1: pA,
      point2: pB,
      point3: pC,
      relative: this.relative[i],
    })
    const { isValid: isValid2, message: message2 } = checkMediane({
      figure,
      point1: pC,
      point2: pA,
      point3: pB,
      relative: this.relative[i],
    })
    const { isValid: isValid3, message: message3 } = checkMediane({
      figure,
      point1: pB,
      point2: pC,
      point3: pA,
      relative: this.relative[i],
    })
    // const isValid = choice([true, false]) // Ce isValid n'est que pour l'exemple ici, ce n'est pas à reproduire.

    if (divFeedback != null) {
      if (this.sup2) {
        if (isValid1 && isValid2 && isValid3) {
          divFeedback.innerHTML =
            'Bravo ! ' + message1 + '<br>' + message2 + '<br>' + message3
          return ['OK']
        }
        divFeedback.innerHTML = message1
        return ['KO']
      } else {
        if (isValid1) {
          divFeedback.innerHTML = 'Bravo ! ' + message1
          return ['OK']
        }
      }
      divFeedback.innerHTML = message1
      return ['KO']
    }
    return [
      `Le divFeedback est null, merci de signale ce problème, n'oubliez de joindre l'url qui a générée le problème`,
    ]
  }
}

function decale(S: PointAbstrait[]): PointAbstrait[] {
  return [S[1], S[2], S[0]]
}

function positionneLabelIEP(
  Pt: PointAbstrait,
  G: PointAbstrait, //centre de gravite par exemple
  dist: number = 0.5,
): PointAbstrait {
  return pointSurSegment(
    G,
    Pt,
    longueur(G, Pt) +
      (context.isHtml
        ? (dist * 20) / context.pixelsParCm
        : dist / context.scale),
  )
}

function checkMediane({
  figure,
  point1,
  point2,
  point3,
  relative,
}: {
  figure: Figure
  point1: Point
  point2: Point
  point3: Point
  relative: boolean
}): {
  isValid: boolean
  message: string
} {
  let lines: Segment[] = []
  //let lines2: Segment[]

  lines = [...figure.elements.values()].filter(
    (e) => e.type.includes('Line') || e.type.includes('Segment'),
  ) as Segment[]
  if (lines.length === 0)
    return { isValid: false, message: "Il n'y a pas de droite dans la figure." }

  const M = figure.create('Point', {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    isFree: false,
    isVisible: false,
  })
  const [a, b, c] = equationLine(M, point3)

  for (const line of lines) {
    const [a2, b2, c2] = line.equation
    if (areCoincident(a, b, c, a2, b2, c2)) {
      return {
        isValid: true,
        message: `La médiane ${relative ? `relative au côté [${point1.label}${point2.label}]` : `issue de ${point3.label}`} a été tracée`,
      }
    }
  }

  return {
    isValid: false,
    message: 'Aucune droite ne correspond à la réponse attendue.',
  }
}
