import Figure from 'apigeom'
import {
  areCoincident,
  equationLine,
} from 'apigeom/src/elements/calculus/Coords'
import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import type Segment from 'apigeom/src/elements/lines/Segment'
import type Point from 'apigeom/src/elements/points/Point'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille, seyes } from '../../lib/2d/Grille'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { labelPoint, texteParPoint, TexteParPoint } from '../../lib/2d/textes'
import { projectionOrtho, rotation } from '../../lib/2d/transformations'
import {
  angle,
  angleOriente,
  longueur,
} from '../../lib/2d/utilitairesGeometriques'
import { milieu, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import {
  centreGraviteTriangle,
  hauteurTriangle,
  orthoCentre,
} from '../../lib/2d/utilitairesTriangle'
import { vide2d } from '../../lib/2d/Vide2d'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
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

export const titre = 'Tracer une hauteur dans un triangle'

export const dateDePublication = '13/01/2025'
export const interactifReady = true

export const uuid = 'c7c78'
export const refs = {
  'fr-fr': ['5G5E-2'],
  'fr-ch': ['9R1ES2E-3', '9R2ES2E-3', '9R3ES2E-3', 'PRQES01B-13'],
}
/**
 * Tracer une hauteur
 * deux cas intérieure, exterieure, deux vocabulaire  isssue du sommet, relative à la base
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
      'Type de hauteur',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Intérieure',
        '2 : Extérieure',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de vocabulaire',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Hauteur issue du sommet',
        '2 : Relative à la base',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = ['Point de concours', false]
    this.besoinFormulaire4Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.sup = '0'
    this.sup2 = '0'
    this.sup3 = false
    this.sup4 = 3
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    let anim = new Alea2iep()
    anim.equerreZoom(150)
    const typeHauteurDisponibles = ['interieure', 'exterieure']
    const typesDeHauteurDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeHauteurDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeHauteur = combinaisonListes(
      typesDeHauteurDisponibles,
      this.nbQuestions,
    )
    const typeVocabulaireDisponibles = ['sommet', 'base']
    const typesDeVocabulaireDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
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
      let P = pointAbstrait(0, 0)

      let k = 0
      let angA = 0
      let angB = 0
      let angC = 0
      do {
        k++
        S[0] = pointAbstrait(0, 0)
        angleDepart = randint(-17, 18) * 10
        const coordC = choice(seriecoordC)
        S[1] = rotation(pointAbstrait(AB, 0), S[0], angleDepart)
        S[2] = rotation(pointAbstrait(coordC.x, coordC.y), S[0], angleDepart)
        P = orthoCentre(S[0], S[1], S[2])
        if (listeTypeHauteur[i] === 'exterieure') {
          //const P = orthoCentre(S[0], S[1], S[2])

          S[2] = P
          const permut = choice([true, false])
          if (permut) {
            const ptemp = S[0]
            S[0] = S[1]
            S[1] = ptemp
          }
          //S = decale(S)
          const ptemp = S[0]
          S[0] = S[1]
          S[1] = S[2]
          S[2] = ptemp
        }
        S[0] = pointAbstrait(Math.round(S[0].x), Math.round(S[0].y))
        S[1] = pointAbstrait(Math.round(S[1].x), Math.round(S[1].y))
        S[2] = pointAbstrait(Math.round(S[2].x), Math.round(S[2].y))

        angA = angle(S[0], S[1], S[2])
        angB = angle(S[2], S[0], S[1])
        angC = angle(S[1], S[2], S[0])
      } while (
        listeTypeHauteur[i] === 'exterieure' &&
        !(angA > 100 || angB > 100 || angC > 100) &&
        k < 10
      )
      P = orthoCentre(S[0], S[1], S[2])
      const G = centreGraviteTriangle(S[0], S[1], S[2])
      P.color = colorToLatexOrHTML(bleuMathalea)
      const nomTriangle = new Triangle()
      let nomSommets = nomTriangle.getSommets(false)
      const nomDuTriangleEnonce = `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`
      P.nom = choice(
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
      const codage: { codage: ObjetMathalea2D[]; cote: PointAbstrait }[] = []
      let ptEnPlus = pointAbstrait(0, 0)
      let objetsDessinBordures: NestedObjetMathalea2dArray = []
      let objetsDessin: NestedObjetMathalea2dArray = []
      let objetsDessinCorrection: NestedObjetMathalea2dArray = []
      const nbDroite = this.sup3 ? 3 : 1
      let Sbis = [...S]
      for (let j = 0; j < nbDroite; j++) {
        droiteRem[j] = hauteurTriangle(
          Sbis[2],
          Sbis[0],
          Sbis[1],
          orangeMathalea,
        )
        droiteRem[j].epaisseur = 1
        codage[j] = codageHauteur(Sbis[2], Sbis[0], Sbis[1], orangeMathalea)
        Sbis = decale(Sbis)
      }
      ptEnPlus = projectionOrtho(S[2], droite(S[0], S[1]))
      ptEnPlus.nom = P.nom
      objetsDessin = [leTriangle, nom]
      objetsDessinCorrection = [leTriangle, nom, droiteRem[0], codage[0].codage]
      objetsDessinBordures = [leTriangle, droiteRem[0], nom, labelPoint(P)]

      if (this.sup3) {
        const etiquetteP = positionne(
          P.nom,
          P,
          centreGraviteTriangle(Sbis[2], Sbis[0], Sbis[1]), //centre de gravite par exemple
        )
        objetsDessinCorrection.push(
          droiteRem[1],
          droiteRem[2],
          codage[1].codage,
          codage[2].codage,
          etiquetteP,
        )
        objetsDessinBordures.push(etiquetteP)
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
      hauteur(anim, S[0], S[1], S[2])
      // anim.hauteur(S[0], S[1], S[2], true)
      if (this.sup3) {
        hauteur(anim, S[2], S[0], S[1])
        hauteur(anim, S[1], S[2], S[0])
        finiHauteur(anim, S[0], S[1], S[2])
        finiHauteur(anim, S[2], S[0], S[1])
        finiHauteur(anim, S[1], S[2], S[0])
        anim.pointCreer(P, { label: P.nom })
      }
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
        if (this.sup4 < 3)
          g = grille(
            bordfixes.xmin,
            bordfixes.ymin,
            bordfixes.xmax,
            bordfixes.ymax,
            'gray',
            0.7,
          )
        else g = vide2d()
        if (this.sup4 === 2) {
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
      if (this.sup3) {
        texte += `Dans le triangle $${nomDuTriangleEnonce}$, tracer les trois hauteurs ${listeTypeVocabulaire[i] === 'sommet' ? `issues de chacun des sommets` : `relative aux trois côtés`}.<br>Que peut-on remarquer ?<br>`
      } else {
        texte += `Dans le triangle $${nomDuTriangleEnonce}$, tracer la hauteur ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`}.<br>`
      }
      texte += enonce
      if (this.sup3) {
        texteCorr += `Dans le triangle $${nomDuTriangleEnonce}$, on trace les trois droites perpendiculaires à chacun des côtés et passant par le sommet opposé.<br>`
        texteCorr += `On remarque que les trois droites se coupent au même point $${P.nom}$. On dit que les droites sont concourantes et le point $${P.nom}$ est appelé l'orthocentre du triangle.<br>`
      } else {
        texteCorr += `Dans le triangle $${nomDuTriangleEnonce}$, la hauteur ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`} est la droite perpendiculaire à (${S[0].nom}${S[1].nom}) passant par ${S[2].nom}.<br>`
        texteCorr +=
          listeTypeHauteur[i] === 'exterieure'
            ? `Ici, il faut d'abord prolonger le côté $[${S[0].nom}${S[1].nom}]$ du côté de ${codage[0].cote.nom}.<br>`
            : ``
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
    figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    figure.buttons.get('SHAKE')?.click()
    const { isValid: isValid1, message: message1 } = checkHauteur({
      figure,
      point1: this.pA[i],
      point2: this.pB[i],
      point3: this.pC[i],
      relative: this.relative[i],
    })
    const { isValid: isValid2, message: message2 } = checkHauteur({
      figure,
      point1: this.pC[i],
      point2: this.pA[i],
      point3: this.pB[i],
      relative: this.relative[i],
    })
    const { isValid: isValid3, message: message3 } = checkHauteur({
      figure,
      point1: this.pB[i],
      point2: this.pC[i],
      point3: this.pA[i],
      relative: this.relative[i],
    })
    // const isValid = choice([true, false]) // Ce isValid n'est que pour l'exemple ici, ce n'est pas à reproduire.

    if (divFeedback != null) {
      if (this.sup3) {
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

/*
 * hauteur issue de A dans le triangle ABC
 * le dessin du codage montre la demi-droite du prologment si le pied de la hauteur est à l'extérieur
 * la fonction indique le côté du prologment
 */
function codageHauteur(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  color: string,
): { codage: ObjetMathalea2D[]; cote: PointAbstrait } {
  const precision = 0.01
  const code: ObjetMathalea2D[] = []
  let ptdep: PointAbstrait = B
  // let LaDemiDroite: DemiDroite = demiDroite(A, ptdep, color)
  const H = projectionOrtho(A, droite(B, C))
  const HB = longueur(H, B)
  const HC = longueur(H, C)
  const BC = longueur(B, C)
  if (HB + BC - HC < precision || HC + BC - HB < precision) {
    if (HC + BC - HB < precision) {
      ptdep = C
    }
    const LaDemiDroite = demiDroite(ptdep, H, color)
    LaDemiDroite.epaisseur = 1
    LaDemiDroite.pointilles = 5
    code.push(LaDemiDroite)
  }
  code.push(codageAngleDroit(A, H, ptdep, color))
  return { codage: code, cote: ptdep }
}

function positionne(
  nom: string,
  Pt: PointAbstrait,
  G: PointAbstrait, //centre de gravite par exemple
  dist: number = 0.5,
): TexteParPoint {
  const P = pointSurSegment(
    G,
    Pt,
    longueur(G, Pt) +
      (context.isHtml
        ? (dist * 20) / context.pixelsParCm
        : dist / context.scale),
  )
  return texteParPoint(nom, P, 0, 'black', 1 /* size */, 'milieu', true)
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

const seriecoordC: { x: number; y: number }[] = [
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 5 },
  { x: 3, y: 6 },
  { x: 3, y: 7 },
  { x: 4, y: 5 },
  { x: 4, y: 6 },
  { x: 5, y: 5 },
  { x: 5, y: 6 },
  { x: 5, y: 7 },
  { x: 6, y: 4 },
  { x: 7, y: 4 },
]

function hauteur(
  anim: Alea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  anim.equerreMontrer(A)
  const H = projectionOrtho(C, droite(A, B))
  let SrefA = pointAbstrait(0, 0)
  const M = milieu(A, B)
  if (angleOriente(B, M, C) > 0) {
    SrefA = B
  } else {
    SrefA = A
  }
  anim.equerreDeplacer(M)
  anim.equerreRotation(SrefA)
  if (Math.abs(longueur(H, A) + longueur(H, B) - longueur(A, B)) > 0.1) {
    const HExterieurCoteA =
      Math.abs(longueur(H, A) + longueur(A, B) - longueur(H, B)) < 0.1
    anim.equerreDeplacer(HExterieurCoteA ? A : B)
    anim.equerreMasquer()
    anim.regleMontrer(M)
    anim.regleRotation(HExterieurCoteA ? A : B)
    anim.pointilles = true
    //anim.regleDemiDroiteOriginePoint(M, H, { longueur: longueur(M, H) + 2 })
    anim.crayonMontrer(HExterieurCoteA ? A : B)

    anim.trait(
      HExterieurCoteA ? A : B,
      pointSurSegment(
        HExterieurCoteA ? A : B,
        H,
        longueur(HExterieurCoteA ? A : B, H) + 2,
      ),
      { couleur: 'red' },
    )
    anim.pointilles = false
    anim.regleMasquer()
    anim.crayonMasquer()
    anim.equerreMontrer()
  }
  anim.equerreDeplacer(H)
  anim.crayonMontrer(H)
  anim.trait(H, C, { couleur: 'red' })
  anim.equerreMasquer()
  anim.codageAngleDroit(SrefA, H, C, { couleur: 'red' })
  anim.crayonMasquer()
}

function finiHauteur(
  anim: Alea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  const H = projectionOrtho(C, droite(A, B))
  const O = orthoCentre(A, B, C)
  const HentreCetO =
    Math.abs(longueur(H, O) + longueur(H, C) - longueur(O, C)) < 0.1
  anim.regleMontrer(HentreCetO ? C : H)
  anim.regleRotation(O)
  anim.crayonMontrer(HentreCetO ? H : C)
  anim.trait(HentreCetO ? H : C, pointSurSegment(H, O, longueur(O, H) + 2), {
    couleur: 'red',
  })
  anim.crayonMasquer()
  anim.regleMasquer()
}

function checkHauteur({
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

  lines = [...figure.elements.values()].filter((e) =>
    e.type.includes('Line'),
  ) as Segment[]
  if (lines.length === 0)
    return { isValid: false, message: "Il n'y a pas de droite dans la figure." }

  const [a, b, c] = equationLine(point1, point2)
  const a0 = -b
  const b0 = a
  const c0 = b * point3.x - a * point3.y
  for (const line of lines) {
    const [a2, b2, c2] = line.equation
    if (areCoincident(a0, b0, c0, a2, b2, c2)) {
      return {
        isValid: true,
        message: `La hauteur ${relative ? `relative au côté [${point1.label}${point2.label}]` : `issue de ${point3.label}`} a été tracée`,
      }
    }
  }

  return {
    isValid: false,
    message: 'Aucune droite ne correspond à la réponse attendue.',
  }
}
