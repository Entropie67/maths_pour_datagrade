import Figure from 'apigeom'
import { checkLineFromLabels } from 'apigeom/src/check/checkLine'
import { checkRayFromLabels } from 'apigeom/src/check/checkRay'
import { checkSegmentFromLabels } from 'apigeom/src/check/checkSegment'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { grille, seyes } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { lettreDepuisChiffre, numAlpha } from '../../lib/outils/outilString'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Tracer des droites, segments, ...'
export const dateDePublication = '05/10/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '20/09/2024'
export const interactifReady = true

/**
 * Fonction générale pour construire des segments, droites et demi-droites
 * @author Mickael Guironnet // rendu interactif par EE
 */

export const uuid = '3dbda'

export const refs = {
  'fr-fr': ['6G1autoA', '6AutoG1-7'],
  'fr-2016': ['6G10-5'],
  'fr-ch': ['9R1ES1B-1', '9R2ES1B-1', '9R3ES1B-1', 'PRQES01A-5', 'PRQES04A-4'],
}
export default class constructionElementaire extends Exercice {
  Anom?: string
  Bnom?: string
  Cnom?: string
  Dnom?: string
  Enom?: string
  Fnom?: string
  figures: Figure[] = []
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 1
    this.exoCustomResultat = true
    this.besoinFormulaireNumerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const anim = new Alea2iep()
      anim.equerreZoom(150)
      const objetsEnonce = []
      const objetsCorrection = []
      const indLettre = randint(1, 15)
      const A = pointAbstrait(
        randint(0, 3),
        randint(-8, -3),
        lettreDepuisChiffre(indLettre),
        'above left',
      )
      const B = pointAbstrait(
        randint(10, 11),
        randint(-4, 4, [-1, 0, 1]),
        lettreDepuisChiffre(indLettre + 1),
        'above right',
      )
      const d = droite(A, B, '', 'blue') // Ne pas mettre bleuMathalea quand il s'agit d'apigeom
      const C = pointAbstrait(
        randint(2, 4, [A.x]),
        randint(3, 6, [A.y]),
        lettreDepuisChiffre(indLettre + 2),
        'above left',
      )
      const D = pointAbstrait(
        randint(6, 8),
        randint(-7, -6, [A.y]),
        lettreDepuisChiffre(indLettre + 3),
      )
      const e = demiDroite(C, D, 'green', true)
      const f = segment(A, C, 'red')
      const E = pointIntersectionDD(
        droite(C, D),
        d,
        lettreDepuisChiffre(indLettre + 4),
        'below right',
      )
      if (!E || (E.x === 50 && E.y === 50)) {
        // pointIntersectionDD renvoie (50,50) lorsqu'il n'y a pas d'intersection
        window.notify("pointIntersectionDD n'a pas renvoyé de point", {})
        continue
      }
      const F = pointSurSegment(
        B,
        A,
        -1,
        lettreDepuisChiffre(indLettre + 5),
        'below',
      )
      const T = tracePoint(A, B, C, D)
      const Tc = tracePoint(E, F, 'red')
      T.tailleTikz = 0.3
      Tc.tailleTikz = 0.3
      objetsCorrection.push(
        T,
        Tc,
        labelPoint(A, B, C, D),
        labelPoint(E, F, 'red'),
        d,
        e,
        f,
      )
      objetsEnonce.push(T, labelPoint(A, B, C, D))
      let correction = ''
      let questind = 0
      let enonce = ''
      if (context.isHtml && !this.interactif)
        enonce += numAlpha(questind++) + ' Reproduire la figure ci-dessous.<br>'
      enonce +=
        numAlpha(questind++) +
        `Tracer la droite $(${A.nom}${B.nom})$ en bleu.<br>`
      enonce +=
        numAlpha(questind++) +
        `Tracer le segment $[${A.nom}${C.nom}]$ en rouge.<br>`
      enonce +=
        numAlpha(questind++) +
        `Tracer la demi-droite $[${C.nom}${D.nom})$ en vert.<br>`
      enonce +=
        numAlpha(questind++) +
        `Placer $${E.nom}$ le point d'intersection de la droite $(${A.nom}${B.nom})$ et de la demi-droite $[${C.nom}${D.nom})$.<br>`
      enonce +=
        numAlpha(questind++) +
        `Placer un point $${F.nom}$ tel que $${F.nom} \\notin [${A.nom}${B.nom}]$ et $${F.nom} \\in (${A.nom}${B.nom})$.<br>`
      const Xmin = Math.floor(Math.min(A.x, B.x, C.x, D.x, E.x, F.x) - 1)
      const Xmax = Math.ceil(Math.max(A.x, B.x, C.x, D.x, E.x, F.x) + 1)
      const Ymin = Math.floor(Math.min(A.y, B.y, C.y, D.y, E.y, F.y) - 1)
      const Ymax = Math.ceil(Math.max(A.y, B.y, C.y, D.y, E.y, F.y) + 1)
      anim.recadre(Xmin - 3, Ymax)
      anim.pointsCreer(A, B, C, D)
      anim.regleDroite(A, B, { couleur: 'blue' }) // Ne pas mettre bleuMathalea quand il s'agit d'apigeom
      anim.regleSegment(A, C, { couleur: 'red' })
      anim.regleDemiDroiteOriginePoint(C, D, { couleur: 'green' })
      anim.regleMasquer({})
      anim.crayonMontrer(E)
      anim.pointCreer(E, { couleur: 'red' })
      anim.crayonMontrer(F)
      anim.pointCreer(F, { couleur: 'red' })
      if (this.interactif) {
        const figure = new Figure({
          xMin: -0.9,
          yMin: -8.9,
          width: 408,
          height: 468,
        })
        figure.options.labelAutomaticBeginsWith = E.nom
        figure.options.labelAutomaticForPoints = true
        figure.options.thickness = 2
        this.figuresApiGeom[i] = figure
        const pA = figure.create('Point', {
          x: A.x,
          y: A.y,
          label: A.nom,
          isFree: true,
        })
        const pB = figure.create('Point', {
          x: B.x,
          y: B.y,
          label: B.nom,
          isFree: true,
        })
        const pC = figure.create('Point', {
          x: C.x,
          y: C.y,
          label: C.nom,
          isFree: true,
        })
        const pD = figure.create('Point', {
          x: D.x,
          y: D.y,
          label: D.nom,
          isFree: true,
        })
        pA.isDeletable = false
        pB.isDeletable = false
        pC.isDeletable = false
        pD.isDeletable = false
        this.Anom = A.nom
        this.Bnom = B.nom
        this.Cnom = C.nom
        this.Dnom = D.nom
        this.Enom = E.nom
        this.Fnom = F.nom

        figure.setToolbar({
          tools: [
            'POINT',
            'LINE',
            'SEGMENT',
            'RAY',
            'POINT_INTERSECTION',
            'POINT_ON',
            'NAME_POINT',
            'MOVE_LABEL',
            'DRAG',
            'REMOVE',
            'SHAKE',
            'SET_OPTIONS',
          ],
        })
        const emplacementPourFigure = figureApigeom({
          exercice: this,
          i,
          figure,
        })
        enonce += emplacementPourFigure
      } else {
        let g, sc, carreaux
        if (this.sup < 3) g = grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7)
        else g = vide2d()
        if (this.sup === 2) {
          sc = 0.8
          carreaux = seyes(Xmin, Ymin, Xmax, Ymax)
        } else {
          sc = 0.5
          carreaux = vide2d()
        }
        if (this.interactif) {
          g = vide2d()
          carreaux = vide2d()
        }
        objetsEnonce.push(g, carreaux)
        objetsCorrection.push(g, carreaux)
        enonce +=
          '<br>' +
          mathalea2d(
            {
              xmin: Xmin,
              ymin: Ymin,
              xmax: Xmax,
              ymax: Ymax,
              pixelsParCm: 20,
              scale: sc,
            },
            objetsEnonce,
          )
      }
      correction += mathalea2d(
        {
          xmin: Xmin,
          ymin: Ymin,
          xmax: Xmax,
          ymax: Ymax,
          pixelsParCm: 20,
          scale: this.sup === 2 ? 0.8 : 0.5,
        },
        objetsCorrection,
      )

      correction += anim.htmlBouton(this.numeroExercice ?? 0, i)

      if (context.isAmc) {
        /** ********************** AMC Hybride *****************************/
        this.autoCorrectionAMC[i] = {
          enonce: enonce + '<br>',
          enonceAvant: false,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])

        this.autoCorrectionAMC[i].propositions = [
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correction,
                statut: 3,
                enonce: enonce + '<br>Question \\textbf{a}',
                sanscadre: true,
              },
            ],
          },
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correction,
                statut: 3,
                enonce: 'Question \\textbf{b}',
                sanscadre: true,
              },
            ],
          },
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correction,
                statut: 3,
                enonce: 'Question \\textbf{c}',
                sanscadre: true,
              },
            ],
          },
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correction,
                statut: 3,
                enonce: 'Question \\textbf{d}',
                sanscadre: true,
              },
            ],
          },
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correction,
                statut: 3,
                enonce: 'Question \\textbf{e}',
                sanscadre: true,
              },
            ],
          },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, Xmin, Xmax, Ymin, Ymax) && F != null) {
        // si pas d'intersection, alors la boucle continue et on ne pose pas la question
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    if (
      this.Anom == null ||
      this.Bnom == null ||
      this.Cnom == null ||
      this.Dnom == null ||
      this.Enom == null ||
      this.Fnom == null
    )
      return 'KO'
    const figure = this.figuresApiGeom[i]
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    // figure.buttons.get('SHAKE')?.click()

    // Sauvegarde de la réponse pour Capytale
    if (this.answers == null) this.answers = {}
    this.answers[figure.id] = figureAnswerJson(figure)

    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) // Ne pas changer le nom du FeedBack, il est écrit en dur, ailleurs.
    const resultat = []
    let feedback = ''
    let questind = 0

    const { isValid, message } = checkLineFromLabels({
      figure,
      nameLine: [`(${this.Anom}${this.Bnom})`, `(${this.Bnom}${this.Anom})`],
      color: 'blue', // Ne pas mettre bleuMathalea quand il s'agit d'apigeom
    })
    resultat.push(isValid ? 'OK' : 'KO')
    if (message !== '') {
      feedback += numAlpha(questind++) + message + '<br>'
    }

    const { isValid: isValid2, message: message2 } = checkSegmentFromLabels({
      figure,
      nameSegment: [`${this.Anom}${this.Cnom}`, `${this.Cnom}${this.Anom}`],
      color: 'red',
    })

    resultat.push(isValid2 ? 'OK' : 'KO')
    if (message2 !== '') {
      feedback += numAlpha(questind++) + message2 + '<br>'
    }

    const { isValid: isValid3, message: message3 } = checkRayFromLabels({
      figure,
      nameRay: [`[${this.Cnom}${this.Dnom})`],
      color: 'green',
    })
    resultat.push(isValid3 ? 'OK' : 'KO')
    if (message3 !== '') {
      feedback += numAlpha(questind++) + message3 + '<br>'
    }

    const { isValid: isValid4, message: message4 } =
      figure.checkPointOnIntersectionLL({
        figure,
        labelPt: this.Enom,
        nameLine1: [`(${this.Anom}${this.Bnom})`, `(${this.Bnom}${this.Anom})`],
        nameLine2: `[${this.Cnom}${this.Dnom})`,
      })
    resultat.push(isValid4 ? 'OK' : 'KO')
    if (message4 !== '') {
      feedback += numAlpha(questind++) + message4 + '<br>'
    }

    const { isValid: isValid5, message: message5 } = figure.checkPointOnLine({
      labelPt: this.Fnom,
      nameLine: [`(${this.Anom}${this.Bnom})`, `(${this.Bnom}${this.Anom})`],
    })
    if (!isValid5 && message5 !== '') {
      feedback += numAlpha(questind++) + message5
    }
    if (isValid5) {
      const { isValid: isValid6 } = figure.checkPointBetween2Points({
        labelPt: this.Fnom,
        labelPt1: `${this.Anom}`,
        labelPt2: `${this.Bnom}`,
      })
      if (!isValid6)
        feedback +=
          numAlpha(questind++) + `Le point ${this.Fnom} est bien placé.`
      else
        feedback +=
          numAlpha(questind++) + `Le point ${this.Fnom} n'est pas bien placé.`
      resultat.push(!isValid6 ? 'OK' : 'KO')
    } else resultat.push('KO')

    if (divFeedback) divFeedback.innerHTML = feedback

    return resultat
  }
}
