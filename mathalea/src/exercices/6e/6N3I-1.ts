import { fixeBordures } from '../../lib/2d/fixeBordures'
import { choice } from '../../lib/outils/arrayOutils'
import { rangeMinMax } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Figure from 'apigeom/src/Figure'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { createApigeomFigureHtml } from '../../lib/apigeom/apigeom-figure'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleEntiersConsecutifs } from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ajouterAide } from '../../lib/outils/enrichissements'
import { fraction } from '../../modules/fractions'
import { representationFraction } from '../../modules/representationsFractions'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Encadrer une fraction entre deux nombres entiers consécutifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '21/07/2025'

/**
 * Une fraction avec pour dénominateur 2, 3, 4, 5, 10 à encadrer entre 2 entiers
 * @author Rémi Angot (AMC par Éric Elter)
 * Rajout d'une correction (propre au programme 2025 de 6ème) par Éric Elter
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '1f5de'

export const refs = {
  'fr-fr': ['6N3I-1', '5N3autoF-1'],
  'fr-2016': ['6N20-1'],
  'fr-ch': ['9R1NO4H-5', '9R2NO4H-5', '9R3NO4H-5', 'PRQNO05B-8'],
}
export default class EncadrerFractionEntre2Entiers extends Exercice {
  lycee: boolean
  listeDeDenominateurs?: number[]
  constructor() {
    super()
    this.consigne = `Compléter avec deux nombres entiers ${ajouterAide(`Nombres entiers consécutifs${sp()}: Ce sont deux nombres entiers qui se suivent comme $4$ et $5$.`, { texteAvant: 'consécutifs' })}.`
    this.introduction =
      `Exemple${sp()}: $2 < \\dfrac{9}{4} < 3$ car  $2=\\dfrac{8}{4}$ et $3=\\dfrac{12}{4}$`
    this.nbQuestions = 6
    this.nbCols = 2
    this.lycee = false
    this.correctionDetaillee = false
    this.sup2 = '11'
    this.sup3 = true
    this.sup4 = true
    this.besoinFormulaire2Texte = this.lycee
      ? [
          'Dénominateurs à choisir',
          'Nombres séparés par des tirets :\nDe 2 à 9\n10: Mélange',
        ]
      : [
          'Dénominateurs à choisir',
          'Nombres séparés par des tirets :\n2: Demis\n3: Tiers\n4: Quarts\n5: Cinquièmes\n10: Dixièmes\n11: Mélange',
        ]
    this.besoinFormulaire3CaseACocher = ['Brouillon interactif']
    this.besoinFormulaire4CaseACocher = ['Correction avec nombre mixte']
    this.spacingCorr = 2.5
  }

  nouvelleVersion() {
    this.correctionDetailleeDisponible = !this.lycee
    const listeDenominateurs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 2,
      max: this.lycee ? 9 : 10,
      defaut: this.lycee ? 10 : 11,
      melange: this.lycee ? 10 : 11,
      nbQuestions: this.nbQuestions,
      exclus: this.lycee ? [] : [6, 7, 8, 9],
    }).map(Number)
    if (this.sup3 && context.isHtml) {
      const figure = new Figure({
        xMin: -0.5,
        yMin: -2,
        width: 800,
        height: 120,
      })
      figure.options.automaticUserMessage = false
      figure.options.color = bleuMathalea
      figure.create('RectangleFractionDiagram', {
        denominator: 2,
        numberOfRectangles: 5,
      })
      this.introduction = createApigeomFigureHtml(figure, {
        numeroExercice: this.numeroExercice,
      })
    } else {
      this.introduction = ''
    }
    this.listeDeDenominateurs = listeDenominateurs
    const denominateursDifferents = new Set(this.listeDeDenominateurs)
    const nbDenominateursDifferents = denominateursDifferents.size
    const aleaMax = Math.ceil(this.nbQuestions / nbDenominateursDifferents) + 1

    for (
      let i = 0, texte, texteCorr, n, d, k, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      d = this.listeDeDenominateurs[i]
      k = this.lycee
        ? choice(rangeMinMax(-5, 5))
        : choice(rangeMinMax(0, aleaMax))
      n = k * d + randint(1, d - 1)
      texte = addMultiMathfield(this, i, {
        dataTemplate: `%{champ1}$ < \\dfrac{${n}}{${d}} < $%{champ2}`,
        dataOptions: {
          champ1: {
            keyboard: this.lycee
              ? KeyboardType.clavierDeBase
              : KeyboardType.clavierNumbers,
            ldots: true,
          },
          champ2: {
            keyboard: this.lycee
              ? KeyboardType.clavierDeBase
              : KeyboardType.clavierNumbers,
            ldots: true,
          },
        },
      })

      texteCorr = this.sup4
        ? ` $\\quad \\dfrac{${n}}{${d}}=${k}+\\dfrac{${n - k * d}}{${d}}\\quad$ et $\\quad${k}<${k}+\\dfrac{${n - k * d}}{${d}}<${k + 1}$ `
        : ` $\\quad ${k}=\\dfrac{${k * d}}{${d}}\\quad$ et $\\quad${k + 1}=\\dfrac{${(k + 1) * d}}{${d}}$ `
      texteCorr += `<br>donc $\\quad ${miseEnEvidence(k)} < \\dfrac{${n}}{${d}} < ${miseEnEvidence(k + 1)}$.`
      if (this.correctionDetaillee && !this.lycee && context.isHtml) {
        const representation = representationFraction(
          fraction(n, d),
          0,
          0,
          3,
          0,
          'barre',
          bleuMathalea,
        )
        texteCorr +=
          '<br>' +
          mathalea2d(
            Object.assign({}, fixeBordures(representation)),
            representation,
          )
      }

      if (this.questionJamaisPosee(i, d, n)) {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte,
            options: { multicols: true, numerotationEnonce: true },
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: texteCorr,
                    statut: '',
                    reponse: {
                      texte: 'Entier inférieur',
                      valeur: k,
                      param: {
                        digits: 1,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: 'Entier supérieur',
                      valeur: k + 1,
                      param: {
                        digits: 1,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              feedback: (saisies /** {champ1: string, champ2:string} */) => {
                const rep1 = saisies.champ1
                const rep2 = saisies.champ2
                // on teste handleEntiersConsecutifs pour le feedback seulement, comme c'est un fillInTheBlank, la comparaison se fait sur les valeurs exactes des bornes entières.
                // handleEntiersConsecutifs peut être utilisée pour évaluer des saisies complètes d'encadrements avec les signes < ou >
                const { feedback } = handleEntiersConsecutifs(
                  `${rep1}<${(n / d).toFixed(4)}<${rep2}`,
                  `${k}<${(2 * k + 1) / 2}<${k + 1}`,
                )
                return feedback ?? ''
              },
              champ1: { value: String(k) },
              champ2: { value: String(k + 1) },
            },
            { formatInteractif: 'multi-mathfield' },
          )
        }
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      } else {
        cpt++
      }
    }
    listeQuestionsToContenu(this)
  }
}
