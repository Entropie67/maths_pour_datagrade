import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Compléter les égalités entre fractions simples'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDeModifImportante = '27/08/2025'
// Enoncés plus explicites avec la multiplication écrite pour le calcul intermédiaire (donc suppression de la correction personnalisée avec un callback)

/**
 * Écrire une fraction avec un nouveau dénominateur qui est un multiple de son dénominateur (ce multiple est inférieur à une valeur maximale de 11 par défaut)
 * @author Rémi Angot
 * @author Jean-claude Lhote (Version QCM et alternance numérateur / dénominateur)
 */
export const uuid = '06633'

export const refs = {
  'fr-fr': ['6N3H'],
  'fr-2016': ['6N41'],
  'fr-ch': ['9R1NO4D-1', '9R2NO4D-1', '9R3NO4D-1', 'PRQNO10B-3'],
}
export default class EgalitesEntreFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = ['Valeur maximale du facteur commun', 99]
    this.besoinFormulaire2Numerique = [
      'Type de questions',
      3,
      '1 : Numérateur imposé\n2 : Dénominateur imposé\n3 : Mélange',
    ]
    this.sup = 11 // Correspond au facteur commun
    this.sup2 = 2 // alternance numérateur ou dénominateur imposé.
    this.consigne = 'Compléter les égalités.'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    let listeFractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ] // Couples de nombres premiers entre eux
    listeFractions = shuffle(listeFractions)
    const listeTypeDeQuestions = combinaisonListes(
      [1, 1, 1, 1, 2],
      this.nbQuestions,
    )
    for (
      let i = 0,
        cpt = 0,
        fraction,
        a: number,
        b: number,
        c: number,
        d: number,
        k: number,
        choix,
        texte,
        texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (this.sup2 === 3) {
        choix = i % 2
      } else {
        choix = this.sup2 % 2
      }

      if (listeTypeDeQuestions[i] === 1) {
        // égalité entre 2 fractions
        fraction = listeFractions[i % listeFractions.length] //
        a = fraction[0]
        b = fraction[1]

        k = randint(2, Math.max(3, this.sup))
        c = k * a
        d = k * b

        switch (choix) {
          case 0:
            texte = `$${stringTexFraction(a, b)} ${context.isDiaporama ? '' : `=${stringTexFraction('\\ldots\\ldots\\ldots', '\\ldots\\ldots\\ldots')}`} = ${stringTexFraction('\\ldots', d)}$`
            if (this.interactif && context.isHtml) {
              texte = remplisLesBlancs(
                this,
                i,
                `\\dfrac{${a}}{${b}} = \\dfrac{${a} \\times %{champ1}}{${b} \\times %{champ2}} = \\dfrac{%{champ3}}{${d}}`,
                'fillInTheBlank',
                '\\ldots',
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  listePoints[0] * listePoints[1] + listePoints[2],
                  2,
                ],
                champ1: { value: `${k}` },
                champ2: { value: `${k}` },
                champ3: { value: String(c) },
              })
            }
            texteCorr = `$${stringTexFraction(a, b)} = ${stringTexFraction(a + miseEnEvidence('\\times' + k), b + miseEnEvidence('\\times' + k))} = ${stringTexFraction(c, d)}$`
            if (context.isAmc) {
              this.autoCorrection[i] = {}
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${stringTexFraction(c, d)}$`,
                  statut: true,
                },
                {
                  texte: `$${stringTexFraction(a, d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction((k - 1) * a, d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction((k + 1) * a, d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(Math.abs(d - a), d)}$`,
                  statut: false,
                },
              ]
            }
            break
          case 1:
          default:
            texte = `$${stringTexFraction(a, b)} ${context.isDiaporama ? '' : `=${stringTexFraction('\\ldots\\ldots\\ldots', '\\ldots\\ldots\\ldots')}`} = ${stringTexFraction(c, '\\ldots')}$`
            if (this.interactif && context.isHtml) {
              const content = `\\dfrac{${a}}{${b}} = \\dfrac{${a} \\times %{champ1}}{${b} \\times %{champ2}} = \\dfrac{${c}}{%{champ3}}`
              texte = remplisLesBlancs(
                this,
                i,
                content,
                'fillInTheBlank',
                '\\ldots',
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  listePoints[0] * listePoints[1] + listePoints[2],
                  2,
                ],
                champ1: { value: `${k}` },
                champ2: { value: `${k}` },
                champ3: { value: String(d) },
              })
            }
            texteCorr = `$${stringTexFraction(a, b)} = ${stringTexFraction(a + miseEnEvidence('\\times' + k), b + miseEnEvidence('\\times' + k))} = ${stringTexFraction(c, d)}$`
            if (context.isAmc) {
              this.autoCorrection[i] = {}
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${stringTexFraction(c, d)}$`,
                  statut: true,
                },
                {
                  texte: `$${stringTexFraction(c, b)}$`,
                  statut: false,
                },
                {
                  texte: `$\\dfrac{${c}}{${(k - 1) * b}}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(c, (k + 1) * b)}$`,
                  statut: false,
                },
                {
                  texte: `$\\dfrac{${c}}{${Math.abs(c - b)}}$`,
                  statut: false,
                },
              ]
            }
            break
        }
      } else {
        // écrire un entier sous la forme d'une fraction
        a = randint(1, 9)
        b = 0 // Pour éviter un warning
        if (this.interactif && !context.isAmc) {
          d = randint(3, 9, [a, 2 * a])
        } else {
          d = randint(2, 9)
        }
        c = a * d

        switch (choix) {
          case 0: // Recherche du numérateur
            if (this.interactif && context.isHtml) {
              const content = `${a} = \\dfrac{${a} \\times %{champ1}}{1 \\times %{champ2}} = \\dfrac{%{champ3}}{${d}}`
              texte = remplisLesBlancs(
                this,
                i,
                content,
                'fillInTheBlank',
                '\\ldots',
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  listePoints[0] * listePoints[1] + listePoints[2],
                  2,
                ],
                champ1: { value: String(d) },
                champ2: { value: String(d) },
                champ3: { value: String(a * d) },
              })
            } else {
              texte = `$${a} ${context.isDiaporama ? '' : `=${stringTexFraction('\\ldots\\ldots\\ldots', '\\ldots\\ldots\\ldots')}`} =${stringTexFraction('\\ldots', d)}$`
            }
            texteCorr = `$${a} = \\dfrac{${a}}{1} =${stringTexFraction(a + miseEnEvidence('\\times' + d), '1' + miseEnEvidence('\\times' + d))} = ${stringTexFraction(c, d)}$`
            if (context.isAmc) {
              this.autoCorrection[i] = {}
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${stringTexFraction(c, d)}$`,
                  statut: true,
                },
                {
                  texte: `$${stringTexFraction(a, d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(d + a, d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(Math.abs(d - a), d)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction((a + 1) * d, d)}$`,
                  statut: false,
                },
              ]
            }
            break
          case 1:
          default:
            texte = `$${a} ${context.isDiaporama ? '' : `=${stringTexFraction('\\ldots\\ldots\\ldots', '\\ldots\\ldots\\ldots')}`} = ${stringTexFraction(c, '\\ldots')}$`
            if (this.interactif && context.isHtml) {
              const content = `${a} = \\dfrac{${a} \\times %{champ1}}{1 \\times %{champ2}} = \\dfrac{${c}}{%{champ3}}`
              texte = remplisLesBlancs(
                this,
                i,
                content,
                'fillInTheBlank',
                '\\ldots',
              )
              handleAnswers(this, i, {
                bareme: (listePoints) => [
                  listePoints[0] * listePoints[1] + listePoints[2],
                  2,
                ],
                champ1: { value: String(d) },
                champ2: { value: String(d) },
                champ3: { value: String(d) },
              })
            }
            texteCorr = `$${a} = \\dfrac{${a}}{1} =${stringTexFraction(a + miseEnEvidence('\\times' + d), '1' + miseEnEvidence('\\times' + d))} = ${stringTexFraction(c, d)}$`
            if (context.isAmc) {
              this.autoCorrection[i] = {}
              this.autoCorrection[i].propositions = [
                {
                  texte: `$${stringTexFraction(c, d)}$`,
                  statut: true,
                },
                {
                  texte: `$${stringTexFraction(c, c - a)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(c, a)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(c, c + a)}$`,
                  statut: false,
                },
                {
                  texte: `$${stringTexFraction(c, c * a)}$`,
                  statut: false,
                },
              ]
            }
            break
        }
      }
      if (context.isAmc) {
        this.autoCorrection[i].enonce =
          `Parmi les fractions suivantes, laquelle est égale à ${texte.split('=')[0]}$ ?`
      }
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function stringTexFraction(a: number | string, b: number | string) {
  return `\\dfrac{${a}}{${b}}`
}
