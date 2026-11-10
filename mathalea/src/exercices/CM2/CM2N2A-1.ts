import Figure from 'apigeom'
import LineFractionDiagram from 'apigeom/src/elements/diagrams/LineFractionDiagram'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { representeFractionSurBarre } from '../../modules/representationsFractions'
import Exercice from '../Exercice'

export const titre = "Représenter une fraction de l'unité"
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true
export const dateDeModifImportante = '7/10/2024'
/**
 * Tracer un segment de longueur une fraction de l'unité.
 * @author Jean-claude Lhote (Rémi Angot pour l'interactivité)
 * 6N32
 */

export const uuid = 'c28e5'

export const refs = {
  'fr-fr': ['CM2N2A-1', '6AutoF1-1'],
  'fr-2016': ['6N32'],
  'fr-ch': ['9R1NO4A-3', '9R2NO4A-3', '9R3NO4A-3', 'PRQNO10A-3'],
}
export default class FractionsDunite extends Exercice {
  goodAnswers: number[] = []
  figuresApigeom: Figure[] = []
  constructor() {
    super()
    this.nbQuestions = 5
    this.consigne = 'Colorier en bleu un segment de longueur $\\ldots$'
    this.spacingCorr = context.isHtml ? 3.5 : 2
    this.spacing = 2
    this.reponseCourteDisponible = false // La réponse est un segment à colorier.
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      5,
      '1 : Fraction inférieure à 1\n2 : Demis, tiers et quarts\n3 : Quarts, cinquièmes, sixièmes et dixièmes\n4 : Toutes les fractions supérieures à 1\n5 : Fractions unitaires',
    ]
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles, unit
    let listeTypeDeQuestions = []
    if (this.sup < 6) {
      typesDeQuestionsDisponibles = [parseInt(this.sup)]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }
    listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let den = 1
      let num = 1
      let texte = ''
      let texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1:
          den = choice([4, 5, 6, 10])
          num = randint(1, den - 1)
          break
        case 2:
          den = choice([2, 3, 4])
          if (den === 3) num = randint(3, 2 * den - 1, den)
          else num = randint(3, 2 * den - 1, den)
          break
        case 3:
          den = choice([4, 5, 6, 10])
          if (den === 4) num = randint(5, 3 * den - 1, den)
          else num = randint(5, 2 * den - 1, den)
          break
        case 4:
          den = choice([2, 3, 4, 5, 6, 10])
          if (den === 2 || den === 4) num = randint(den + 1, 3 * den - 1, den)
          else num = randint(den + 1, 2 * den - 1, den)
          break
        case 5:
          den = choice([3, 4, 5, 6, 8, 10])
          num = 1
          break
      }
      if (den % 3 === 0) unit = 12
      else if (den % 5 === 0) unit = 10
      else unit = 8
      const frac = fraction(num, den)
      this.goodAnswers[i] = Math.round((num / den) * unit)
      texte = `$${frac.texFraction}$ unité.<br>`

      if (this.interactif) {
        const figure = new Figure({
          xMin: -0.5,
          yMin: -0.3,
          height: 60,
          width: 600,
        })
        this.figuresApigeom[i] = figure
        figure.setToolbar({ position: 'top', tools: ['FILL'] })
        figure.options.color = bleuMathalea
        figure.create('LineFractionDiagram', {
          denominator: unit,
          max: 3,
          width: 6,
        })
        texte += figureApigeom({
          exercice: this,
          figure,
          defaultAction: 'FILL',
          i,
        })
        figure.divButtons.style.display = 'none'
        figure.divUserMessage.style.display = 'none'
      } else {
        const schemaAColorier = representeFractionSurBarre(
          fraction(0, den),
          unit,
          3,
          6,
        )
        texte += mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.5 },
            fixeBordures([...schemaAColorier]),
          ),
          [...schemaAColorier],
        )
      }

      const representeFraction = representeFractionSurBarre(frac, unit, 3, 6)

      const objetsCorr = [...representeFraction]
      texteCorr = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.5 },
          fixeBordures(objetsCorr),
        ),
        objetsCorr,
      )
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
                  statut: 2, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: this.consigne.split('.')[0] + ' ' + texte,
                  pointilles: false,
                  sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, num, den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApigeom[i]
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const divFeedback = document.querySelector(
      `#feedback${`Ex${this.numeroExercice}Q${i}`}`,
    )
    let result = false
    figure.elements.forEach((ele) => {
      if (
        ele.type === 'LineFractionDiagram' &&
        ele instanceof LineFractionDiagram
      ) {
        // result = (ele.numerator === this.goodAnswers[i] && ele.numerator === ele.indiceLastInColor) // On n'impose plus que le segment soit colorié depuis le début
        const bonNombreDeCasesColoriees = ele.numerator === this.goodAnswers[i]
        const indicesArray = Array.from(ele.indicesRectanglesInColor).sort(
          (a, b) => a - b,
        )
        const firstElement = indicesArray[0]
        const lastElement = indicesArray[indicesArray.length - 1]
        const difference = lastElement - firstElement
        const segmentEnUnSeulBloc = difference === indicesArray.length - 1
        result = bonNombreDeCasesColoriees && segmentEnUnSeulBloc
      }
    })
    if (divFeedback != null) {
      if (result) {
        divFeedback.innerHTML = '😎'
      } else {
        const p = document.createElement('p')
        p.innerText = '☹️'
        divFeedback.insertBefore(p, divFeedback.firstChild)
      }
    }
    return result ? 'OK' : 'KO'
  }
}
