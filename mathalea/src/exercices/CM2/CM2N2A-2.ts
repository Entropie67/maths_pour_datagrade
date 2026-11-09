import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Figure from 'apigeom'
import type CircleFractionDiagram from 'apigeom/src/elements/diagrams/CircleFractionDiagram'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { fraction } from '../../modules/fractions'
import { representationFraction } from '../../modules/representationsFractions'

export const titre = 'Représenter des fractions'
export const amcReady = true
export const interactifReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '15/01/2024'

/**
 * Représenter des fractions simples avec des disques partagés de façon adéquate.
 * @author Jean-claude Lhote (Modifié par EE : rajout d'un paramètre puis Rémi Angot pour apiGeom)
 * 6N14
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '87479'

export const refs = {
  'fr-fr': ['CM2N2A-2'],
  'fr-2016': ['6N14'],
  'fr-ch': ['9R1NO4A-2', '9R2NO4A-2', '9R3NO4A-2', 'PRQNO10A-2'],
}
export default class RepresenterUneFraction extends Exercice {
  figures: Figure[] = []
  numerators: number[] = []
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de fractions',
      6,
      '1 : Inférieures à 1\n2 : Supérieures à 1\n3 : Peu importe',
    ]
    this.besoinFormulaire2Texte = [
      'Type de question',
      'Nombres séparés par des tirets :\n0 : Mélange\n1 : Représenter la fraction\n2 : Donner la fraction représentée',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    let sc
    const ppc = 20
    if (context.isHtml) {
      sc = 0.5
    } else {
      sc = 0.4
    }

    const params = {
      xmin: -2.2,
      ymin: -2.2,
      xmax: 18,
      ymax: 3,
      pixelsParCm: ppc,
      scale: sc,
    }
    let den
    let num
    let f

    const liste = combinaisonListes([2, 3, 4, 5, 6], this.nbQuestions)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      den = liste[i]
      switch (this.sup) {
        case 1:
          num = randint(1, den - 1)
          break
        case 2:
          num = randint(den + 1, den * 3)
          break
        default:
          num = randint(1, den * 3)
          break
      }
      f = fraction(num, den)
      texte =
        listeTypeDeQuestion[i] === 1
          ? `Sachant qu'un disque représente une unité, représenter la fraction $${f.texFraction}$ en coloriant la part correspondante.<br>`
          : `Sachant qu'un disque représente une unité, Quelle est la fraction représentée ?<br>`
      this.numerators[i] = num
      if (this.interactif && listeTypeDeQuestion[i] === 1) {
        const figure = new Figure({
          xMin: -1.6,
          yMin: -1.6,
          width: 336,
          height: 95,
        })
        figure.options.color = bleuMathalea
        figure._scale = context.isHtml ? 1 : 0.6
        this.figuresApiGeom[i] = figure
        figure.create('CircleFractionDiagram', {
          denominator: den,
          numberOfCircle: 3,
          radius: 1.5,
        })
        figure.setToolbar({ tools: ['FILL'], position: 'top' })
        texte += figureApigeom({
          exercice: this,
          figure,
          isDynamic: true,
          i,
          defaultAction: 'FILL',
        })
        figure.divButtons.style.display = 'none' // Doit apparaitre après figureApigeom
        figure.divUserMessage.style.display = 'none'
      } else if (listeTypeDeQuestion[i] === 1) {
        const f2 = fraction(den * 3, den)
        texte += mathalea2d(
          params,
          representationFraction(
            f2,
            0,
            0,
            2,
            0,
            'gateau',
            listeTypeDeQuestion[i] === 1 ? 'white' : bleuMathalea,
          ),
        )
      } else {
        texte += mathalea2d(
          params,
          representationFraction(f, 0, 0, 2, 0, 'gateau', bleuMathalea),
        )
      }
      if (listeTypeDeQuestion[i] === 2 && this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
      }
      texteCorr = `Voici sur ces dessins, coloriés en bleu, la part correspondante à la fraction $${f.texFraction}$ :<br>`
      if (this.interactif && listeTypeDeQuestion[i] === 1) {
        const figureCorr = new Figure({
          xMin: -2,
          yMin: -2,
          width: 600,
          height: 95,
        })
        figureCorr.options.color = bleuMathalea
        const diagrammeCorr = figureCorr.create('CircleFractionDiagram', {
          denominator: den,
          numberOfCircle: 3,
          radius: 1,
        })
        diagrammeCorr.numerator = num
        texteCorr += context.isTypst
          ? apigeomFigureToSvg(figureCorr)
          : figureCorr.getStaticHtml()
        this.figuresApiGeomCorr[i] = figureCorr
      } else {
        texteCorr += mathalea2d(
          params,
          representationFraction(
            f,
            0,
            0,
            2,
            randint(0, den - 1),
            'gateau',
            bleuMathalea,
          ),
        )
        if (listeTypeDeQuestion[i] === 2) {
          texteCorr += `L'unité est partagée en $${den}$ parts et ${num} parts sont coloriées en bleu.<br>
          La fraction représentée est donc $${f.texFraction}$.`
        }
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: 'ici la (ou les) question(s) est(sont) posée(s)',
          enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvantUneFois: false, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
          propositions: [
            {
              type: 'AMCOpen', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: texte,
                  sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, num, den)) {
        if (listeTypeDeQuestion[i] === 2) {
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: f.texFraction,
                options: { fractionEgale: true },
              },
            },
            { formatInteractif: 'mathalea-mathfield' },
          )
        } else {
          handleAnswers(
            this,
            i,
            { reponse: { value: '' } },
            { formatInteractif: 'meta-custom' },
          )
        }
        // Si la question n'a jamais été posée, on en crée une autre
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
    let result = 'KO'
    const divCheck = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const diagramme = this.figuresApiGeom[i].elements.get(
      'element0',
    ) as CircleFractionDiagram
    if (diagramme.type !== 'CircleFractionDiagram')
      throw new Error('On attendait un diagramme circulaire de fractions')
    if (diagramme.numerator === this.numerators[i]) {
      if (divCheck) divCheck.innerHTML = '😎'
      result = 'OK'
    } else {
      if (divCheck) divCheck.innerHTML = '☹️'
      const p = document.createElement('p')
      p.innerText = `$\\dfrac{${diagramme.numerator}}{${diagramme.denominator}}$ a été colorié.`
      if (divFeedback) {
        divFeedback.innerHTML = ''
        divFeedback.appendChild(p)
      }
      result = 'KO'
    }
    this.figuresApiGeom[i].isDynamic = false
    this.figuresApiGeom[i].divUserMessage.style.display = 'none'
    return result
  }
}
