import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { eclatePuissance, simpExp } from '../../lib/outils/puissance'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  'Effectuer des calculs avec des puissances de $10$ uniquement'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '24/09/2023'

/**
 * 4C30 -- Puissances de 10
 * * Travailler des résultats automatisés
 * @author Sébastien Lozano
 */
export const uuid = 'f5dcf'

export const refs = {
  'fr-fr': ['4C30', 'BP2AutoE5'],
  'fr-ch': ['10LCNO4C-1', '10LSNO4C-1', 'PRQNO07A-9'],
}
export default class PuissancesDeDix extends Exercice {
  constructor() {
    super()

    if (context.isHtml) this.consigne = 'Écrire sous la forme $\\mathbf{10^n}$.'
    else this.consigne = 'Écrire sous la forme $10^n$.'
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 5

    this.sup = 1
    this.sup2 = 4
    this.sup3 = false
    this.besoinFormulaireNumerique = false // Voir 2N32-1 pour voir besoinFormulaireNumerique à true
    this.besoinFormulaire2Texte = [
      'Type de calculs',
      'Nombres séparés par des tirets :\n1 : Produit de puissances\n2 : Quotient de puissances\n3 : Puissance de puissances\n4 : Mélange',
    ] // le paramètre sera numérique de valeur max 2 (le 2 en vert)
  }

  nouvelleVersion() {
    this.besoinFormulaire3CaseACocher =
      this.sup !== 2 ? ['Avec des puissances négatives'] : false
    this.correctionDetailleeDisponible = this.sup !== 2
    let typesDeQuestions

    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2, 3] // produit, quotient et exponentiation de puissances de 10
      if (this.nbQuestions > 30) {
        typesDeQuestionsDisponibles = [1, 2, 3, 1, 2]
      }
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [4, 5, 6, 7, 8, 9, 10, 11] // calculs première série
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // calculs deuxième série
    }
    const listeTypeDeQuestions = this.besoinFormulaireNumerique
      ? combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
      : gestionnaireFormulaireTexte({
          nbQuestions: this.nbQuestions,
          saisie: this.sup2,
          max: 3,
          melange: 4,
          defaut: 4,
        }).map(Number)

    // pour pouvoir adapter les couleurs en cas de besoin
    const coul0 = 'red'
    const coul1 = bleuMathalea
    const coul1Cmd = context.isHtml
      ? `\\color{${coul1}}`
      : `\\color[HTML]{${coul1.replace('#', '')}}`

    for (
      let i = 0,
        exp0,
        exp1,
        exp,
        couleurExp0,
        couleurExp1,
        lettre,
        texte,
        texteCorr,
        reponseInteractive,
        exposantAMC,
        cpt = 0;
      i < this.nbQuestions && cpt < 100;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]

      const nbrNegSign = (
        i === 0 ? [] : this.listeArguments[i - 1].match(/-/g) || []
      ).length
      exp0 =
        (this.sup3 && nbrNegSign === 0
          ? -1
          : nbrNegSign === 1 || !this.sup3
            ? 1
            : -1) * randint(2, 9)
      exp1 =
        (this.sup3 && nbrNegSign === 0 ? -1 : 1) *
        randint(2, 9, [exp0, -1 * exp0])
      exp = randint(0, 1) === 0 ? [exp0, exp1] : [exp1, exp0]
      // on choisit deux exposants différents c'est mieux
      lettre = lettreDepuisChiffre(i + 1)
      // on utilise des lettres pour les calculs
      let nbSimplifications

      switch (typesDeQuestions) {
        case 1: {
          // produit de puissances de même base
          texte = `$${lettre}=10^{${exp[0]}}\\times 10^{${exp[1]}}$`
          texteCorr = `$${lettre}=10^{${exp[0]}}\\times 10^{${exp[1]}}$<br>`
          reponseInteractive = `10^{${exp[0] + exp[1]}}`
          if (this.correctionDetaillee) {
            texteCorr += `$${lettre}=${exp[0] > 0 ? eclatePuissance(10, exp[0], coul0) : `\\dfrac{1}{${eclatePuissance(10, -1 * exp[0], coul0)}}`} \\times ${exp[1] > 0 ? eclatePuissance(10, exp[1], coul1) : `\\dfrac{1}{${eclatePuissance(10, -1 * exp[1], coul1)}}`}$<br>`
          }
          if (exp[0] > 0 && exp[1] > 0) {
            texteCorr += `Il y a donc $${miseEnEvidence(exp[0], coul0)}~${miseEnEvidence('+', 'black')}~${miseEnEvidence(exp[1], coul1)}$ facteurs tous égaux à $10$.<br>`
            texteCorr += `$${lettre}=10^{${exp[0]} +  ${exp[1]}} = ${miseEnEvidence(reponseInteractive)}$`
          } else if (exp[0] < 0 && exp[1] > 0) {
            texteCorr += `Il y a donc $${miseEnEvidence(-1 * exp[0], coul0)}$ facteurs tous égaux à $10$ au dénominateur et $${coul1Cmd}{${exp[1]}}$ facteurs tous égaux à $10$ au numérateur.<br>`
            if (-1 * exp[0] < exp[1]) {
              // plus grand au numérateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', -1 * exp[0], coul0)}\\times${eclatePuissance(10, exp[0] + exp[1], coul1)}}{${eclatePuissance('\\cancel{10}', -1 * exp[0], coul1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{10^{${exp[1]}}}{10^{${-1 * exp[0]}}} = 10^{${exp[1]} - ${-1 * exp[0]}} = ${miseEnEvidence(reponseInteractive)}$`
            } else {
              // plus grand au dénominateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', exp[1], coul0)}}{${eclatePuissance('\\cancel{10}', exp[1], coul1)}\\times${eclatePuissance(10, -1 * exp[0] - exp[1], coul1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{10^{${exp[1]}}}{10^{${-1 * exp[0]}}} = \\dfrac{1}{10^{${-1 * exp[0]} - ${exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[0] - exp[1]}}}= ${miseEnEvidence(reponseInteractive)}$`
            }
          } else if (exp[0] > 0 && exp[1] < 0) {
            texteCorr += `Il y a donc $${miseEnEvidence(exp[0], coul0)}$ facteurs tous égaux à $10$ au numérateur et $${coul1Cmd}{${-1 * exp[1]}}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            if (exp[0] > -1 * exp[1]) {
              // plus grand au numérateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', -1 * exp[1], coul0)}\\times${eclatePuissance(10, exp[0] + exp[1], coul1)}}{${eclatePuissance('\\cancel{10}', -1 * exp[1], coul1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{10^{${exp[0]}}}{10^{${-1 * exp[1]}}} = 10^{${exp[0]} - ${-1 * exp[1]}} = ${miseEnEvidence(reponseInteractive)}$`
            } else {
              // plus grand au dénominateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', exp[0], coul0)}}{${eclatePuissance('\\cancel{10}', exp[0], coul1)}\\times${eclatePuissance(10, -1 * exp[1] - exp[0], coul1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{10^{${exp[0]}}}{10^{${-1 * exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[1]} - ${exp[0]}}} = \\dfrac{1}{10^{${-1 * exp[1] - exp[0]}}}= ${miseEnEvidence(reponseInteractive)}$`
            }
          } else if (exp[0] < 0 && exp[1] < 0) {
            texteCorr += `Il y a donc $${miseEnEvidence(-1 * exp[0], coul0)}$ facteurs tous égaux à $10$ au dénominateur et $${coul1Cmd}{${-1 * exp[1]}}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            texteCorr += `$${lettre}=\\dfrac{1}{10^{${-1 * exp[0]}+${-1 * exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[0] - 1 * exp[1]}}} = ${miseEnEvidence(reponseInteractive)}$`
          }
          exposantAMC = [
            exp[0] + exp[1],
            exp[0] * exp[1],
            Math.max(...exp) - Math.min(...exp),
            -1 * (exp[0] + exp[1]),
          ]
          break
        }
        case 2: {
          // quotient de puissances de même base
          reponseInteractive = `10^{${exp[0] - exp[1]}}`
          texte = `$${lettre}=\\dfrac{10^{${exp[0]}}}{10^{${exp[1]}}}$`
          texteCorr = `$${lettre}=\\dfrac{10^{${exp[0]}}}{10^{${exp[1]}}}$<br>`
          if (Math.max(exp[0], exp[1]) === exp[0]) {
            couleurExp0 = coul0
            couleurExp1 = coul1
          } else {
            couleurExp0 = coul1
            couleurExp1 = coul0
          }
          if (exp[0] > 0 && exp[1] > 0) {
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\dfrac{${eclatePuissance(10, exp[0], couleurExp0)}}{${eclatePuissance(10, exp[1], couleurExp1)}}$<br>`
            }
            nbSimplifications = Math.min(exp[0], exp[1])
            texteCorr += `Il y a donc $${miseEnEvidence(nbSimplifications, coul1)}$ simplification${nbSimplifications === 1 ? '' : 's'} par $10$ possible${nbSimplifications === 1 ? '' : 's'}.<br>`
            if (exp[0] - exp[1] < 0) {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', exp[0], couleurExp0)}}{${eclatePuissance('\\cancel{10}', exp[0], couleurExp1)}\\times${eclatePuissance(10, exp[1] - exp[0], couleurExp1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{1}{10^{${exp[1]}-${exp[0]}}}=\\dfrac{1}{10^{${exp[1] - exp[0]}}}`
              texteCorr += `=${miseEnEvidence(reponseInteractive)}$`
            } else {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', exp[1], couleurExp0)}\\times${eclatePuissance(10, exp[0] - exp[1], couleurExp0)}}{${eclatePuissance('\\cancel{10}', exp[1], couleurExp1)}}$<br>`
              }
              texteCorr += `$${lettre}=10^{${exp[0]}-${exp[1]}}=${miseEnEvidence(reponseInteractive)}$`
            }
          } else if (exp[0] < 0 && exp[1] < 0) {
            texteCorr += `$${lettre}=\\dfrac{10^{${-1 * exp[1]}}}{10^{${-1 * exp[0]}}}$<br>`
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\dfrac{${eclatePuissance(10, -1 * exp[1], couleurExp0)}}{${eclatePuissance(10, -1 * exp[0], couleurExp1)}}$<br>`
            }
            nbSimplifications = Math.min(-1 * exp[0], -1 * exp[1])
            texteCorr += `Il y a donc $${miseEnEvidence(nbSimplifications, coul1)}$ simplification${nbSimplifications === 1 ? '' : 's'} par $10$ possible${nbSimplifications === 1 ? '' : 's'}.<br>`
            if (-1 * exp[0] < -1 * exp[1]) {
              // plus grand au numérateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', -1 * exp[0], couleurExp0)}\\times${eclatePuissance(10, exp[0] - exp[1], couleurExp0)}}{${eclatePuissance('\\cancel{10}', -1 * exp[0], couleurExp1)}}$<br>`
              }
              texteCorr += `$${lettre}=10^{${-1 * exp[1]}-${-1 * exp[0]}}=${miseEnEvidence(reponseInteractive)}$`
            } else {
              // plus grand au dénominateur
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre}=\\dfrac{${eclatePuissance('\\cancel{10}', -1 * exp[1], couleurExp0)}}{${eclatePuissance('\\cancel{10}', -1 * exp[1], couleurExp1)}\\times${eclatePuissance(10, -1 * exp[0] + exp[1], couleurExp1)}}$<br>`
              }
              texteCorr += `$${lettre}=\\dfrac{1}{10^{${-1 * exp[0]}-${-1 * exp[1]}}}=\\dfrac{1}{10^{${exp[1] - exp[0]}}}`
              texteCorr += `=${miseEnEvidence(reponseInteractive)}$`
            }
          } else if (exp[0] > 0 && exp[1] < 0) {
            texteCorr += `$${lettre}={10^{${exp[0]}}}\\times {10^{${-1 * exp[1]}}}$<br>`
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=${eclatePuissance(10, exp[0], couleurExp0)} \\times ${eclatePuissance(10, -1 * exp[1], couleurExp1)}$<br>`
            }
            texteCorr += `Il y a donc $${miseEnEvidence(exp[0], couleurExp0)}~${miseEnEvidence('+', 'black')}~${miseEnEvidence(-1 * exp[1], couleurExp1)}$ facteurs tous égaux à $10$.<br>`
            texteCorr += `$${lettre}=10^{${exp[0]} +  ${-1 * exp[1]}} = ${miseEnEvidence(reponseInteractive)}$`
          } else if (exp[0] < 0 && exp[1] > 0) {
            texteCorr += `$${lettre}=\\dfrac{1}{10^{${-1 * exp[0]}}\\times {10^{${exp[1]}}}}$<br>`
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\dfrac{1}{${eclatePuissance(10, -1 * exp[0], couleurExp0)} \\times ${eclatePuissance(10, exp[1], couleurExp1)}}$<br>`
            }
            texteCorr += `Il y a donc $$${miseEnEvidence(-1 * exp[0], couleurExp0)}$ facteurs tous égaux à $10$ au dénominateur et $\\color{${couleurExp1}}{${exp[1]}}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            texteCorr += `$${lettre}=\\dfrac{1}{10^{${-1 * exp[0]}+${exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[0] + exp[1]}}} = ${miseEnEvidence(reponseInteractive)}$`
          }
          exposantAMC = [
            exp[0] - exp[1],
            exp[0] * exp[1],
            -exp[0] + exp[1],
            exp[0] + exp[1],
          ]
          break
        }
        case 3: {
          // exponentiation
          const nbrNegSign = (
            i === 0 ? [] : this.listeArguments[i - 1].match(/-/g) || []
          ).length
          exp0 =
            (this.sup3 && nbrNegSign === 0
              ? -1
              : nbrNegSign === 1 || !this.sup3
                ? 1
                : -1) * randint(2, 4)
          exp1 =
            (this.sup3 && nbrNegSign === 0 ? -1 : 1) *
            randint(2, 4, [exp0, -1 * exp0])
          exp = randint(0, 1) === 0 ? [exp0, exp1] : [exp1, exp0]
          // on choisit deux exposants différents c'est mieux
          texte = `$${lettre}=(10^{${exp[0]}})^{${exp[1]}}$`
          texteCorr = `$${lettre}=(10^{${exp[0]}})^{${exp[1]}}$<br>`
          if (exp[0] > 0 && exp[1] > 0) {
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(10^${exp[0]})`, exp[1], coul0)}}_{${exp[1]}\\thickspace\\text{facteurs}}}$<br>`
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(${coul1Cmd}{\\underbrace{${eclatePuissance(10, exp[0], coul1)}}_{${exp[0]}\\thickspace\\text{facteurs}}}\\color{${coul0}})`, exp[1], coul0)}}_{${exp[1]}\\times${coul1Cmd}{${exp[0]}}\\thickspace\\color{black}{\\text{facteurs}}}}$<br>`
            }
            texteCorr += `Il y a donc $${miseEnEvidence(exp[1], coul0)}~${miseEnEvidence('\\times', 'black')}~${miseEnEvidence(exp[0], coul1)}$ facteurs tous égaux à $10$.<br>`
            reponseInteractive = `10^{${exp[0] * exp[1]}}`
            texteCorr += `$${lettre}=10^{${exp[0]}\\times${exp[1]}} = ${miseEnEvidence(reponseInteractive)}$`
          } else if (exp[0] < 0 && exp[1] > 0) {
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(10^{${exp[0]}})`, exp[1], coul0)}}_{${exp[1]}\\thickspace\\text{facteurs}}}$<br>`
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(${coul1Cmd}{\\underbrace{\\dfrac{1}{${eclatePuissance(10, -1 * exp[0], coul1)}}}_{${-1 * exp[0]}\\thickspace\\text{facteurs}}}\\color{${coul0}})`, exp[1], coul0)}}_{${exp[1]}\\times${coul1Cmd}{${-1 * exp[0]}}\\thickspace\\color{black}{\\text{facteurs}}}}$<br>`
            }
            texteCorr += `Il y a donc $${miseEnEvidence(exp[1], coul0)}~${miseEnEvidence('\\times', 'black')}~${miseEnEvidence(-1 * exp[0], coul1)}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            reponseInteractive = `10^{${exp[0] * exp[1]}}`
            texteCorr += `$${lettre}=\\dfrac{1}{10^{${-1 * exp[0]}\\times${exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[0] * exp[1]}}} = ${miseEnEvidence(reponseInteractive)}$`
          } else if (exp[0] > 0 && exp[1] < 0) {
            texteCorr += `$${lettre}=\\dfrac{1}{(10^{${exp[0]}})^{${-1 * exp[1]}}}$<br>`
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{\\dfrac{1}{${eclatePuissance(`(10^{${exp[0]}})`, -1 * exp[1], coul0)}}}_{${-1 * exp[1]}\\thickspace\\text{facteurs}}}$<br>`
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(${coul1Cmd}{\\underbrace{\\dfrac{1}{${eclatePuissance(10, exp[0], coul1)}}}_{${exp[0]}\\thickspace\\text{facteurs}}}\\color{${coul0}})`, -1 * exp[1], coul0)}}_{${-1 * exp[1]}\\times${coul1Cmd}{${exp[0]}}\\thickspace\\color{black}{\\text{facteurs}}}}$<br>`
            }
            texteCorr += `Il y a donc $${miseEnEvidence(-1 * exp[1], coul0)}~${miseEnEvidence('\\times', 'black')}~${miseEnEvidence(exp[0], coul1)}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            reponseInteractive = `10^{${exp[0] * exp[1]}}`
            texteCorr += `$${lettre}=\\dfrac{1}{10^{${exp[0]}\\times${-1 * exp[1]}}} = \\dfrac{1}{10^{${-1 * exp[0] * exp[1]}}} = ${miseEnEvidence(reponseInteractive)}$`
          } else {
            texteCorr += `$${lettre}=\\dfrac{1}{(10^{${exp[0]}})^{${-1 * exp[1]}}}$<br>`
            if (this.correctionDetaillee) {
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{\\dfrac{1}{${eclatePuissance(`(10^{${exp[0]}})`, -1 * exp[1], coul0)}}}_{${-1 * exp[1]}\\thickspace\\text{facteurs}}}$<br>`
              texteCorr += `$${lettre}=\\color{${coul0}}{\\underbrace{${eclatePuissance(`(${coul1Cmd}{\\underbrace{${eclatePuissance(10, -1 * exp[0], coul1)}}_{${-1 * exp[0]}\\thickspace\\text{facteurs}}}\\color{${coul0}})`, -1 * exp[1], coul0)}}_{${-1 * exp[1]}\\times${coul1Cmd}{${-1 * exp[0]}}\\thickspace\\color{black}{\\text{facteurs}}}}$<br>`
            }
            texteCorr += `Il y a donc $${miseEnEvidence(-1 * exp[1], coul0)}~${miseEnEvidence('\\times', 'black')}~${miseEnEvidence(-1 * exp[0], coul1)}$ facteurs tous égaux à $10$ au dénominateur.<br>`
            reponseInteractive = `10^{${exp[0] * exp[1]}}`
            texteCorr += `$${lettre}={10^{${-1 * exp[0]}\\times${-1 * exp[1]}}} = ${miseEnEvidence(reponseInteractive)}$`
          }
          exposantAMC = [
            exp[0] * exp[1],
            exp[0] - exp[1],
            exp[0] + exp[1],
            -1 * (exp[0] + exp[1]),
          ]
          break
        }
        case 4:
          exp = [randint(1, 7, [1]), randint(1, 7, [1]), randint(1, 7, [1])] // on a besoin de 3 exposants distincts
          texte = `$${lettre}=\\dfrac{10^${exp[0]}\\times 100}{10^${exp[1]} \\times 10^${exp[2]}}$`
          texteCorr = `$${lettre}=\\dfrac{10^${exp[0]}\\times 100}{10^${exp[1]} \\times 10^${exp[2]}}`
          texteCorr += ` = \\dfrac{10^${exp[0]}\\times 10^{2}}{10^${exp[1]} \\times 10^${exp[2]}}`
          texteCorr += ` = \\dfrac{10^{${exp[0]}+2}}{10^{${exp[1]}+${exp[2]}}}`
          texteCorr += ` = \\dfrac{10^{${exp[0] + 2}}}{10^{${exp[1] + exp[2]}}}`
          texteCorr += ` = 10^{${exp[0] + 2}-${exp[1] + exp[2]}}`
          reponseInteractive = `10^{${exp[0] + 2 - exp[1] - exp[2]}}`
          texteCorr += ` = ${miseEnEvidence(reponseInteractive)}`
          if (
            exp[0] + 2 - exp[1] - exp[2] === 0 ||
            exp[0] + 2 - exp[1] - exp[2] === 1
          ) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            texteCorr +=
              sp(2) + '(=' + simpExp(10, exp[0] + 2 - exp[1] - exp[2]) + ')'
          }
          texteCorr += '$'
          exposantAMC = [
            exp[0] + 2 - exp[1] - exp[2],
            exp[0] + 2 - exp[1] + exp[2],
            exp[0] + 2 + exp[1] - exp[2],
            exp[0] + 1 - exp[1] - exp[2],
          ]
          break
        case 5:
          exp = [randint(1, 7, [1]), randint(1, 7, [1])] // on a besoin de 2 exposants distincts
          texte = `$${lettre}=\\dfrac{10^${exp[0]}\\times ${texNombre(1000)}}{10^${exp[1]}}$`
          texteCorr = `$${lettre}=\\dfrac{10^${exp[0]}\\times ${texNombre(1000)}}{10^${exp[1]}}`
          texteCorr += ` = \\dfrac{10^${exp[0]}\\times 10^3}{10^${exp[1]}}`
          texteCorr += ` = \\dfrac{10^{${exp[0]}+3}}{10^${exp[1]}}`
          texteCorr += ` = \\dfrac{10^{${exp[0] + 3}}}{10^${exp[1]}}`
          texteCorr += ` = 10^{${exp[0] + 3}-${exp[1]}}`
          reponseInteractive = `10^{${exp[0] + 3 - exp[1]}}`
          texteCorr += ` = ${miseEnEvidence(reponseInteractive)}`
          if (exp[0] + 3 - exp[1] === 0 || exp[0] + 3 - exp[1] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            texteCorr += sp(2) + '(=' + simpExp(10, exp[0] + 3 - exp[1]) + ')'
          }
          texteCorr += '$'
          exposantAMC = [
            exp[0] + 3 - exp[1],
            exp[0] + 3 + exp[1],
            -exp[0] + 3 + exp[1],
            -exp[0] + 3 - exp[1],
          ]
          break
        case 6:
          exp = [randint(1, 7, [1]), randint(1, 2)] // on a besoin de 2 exposants distincts
          // le second exposant ne peut valoir que 1 ou 2 la fonction testExp ne convient pas à l'affichage ici
          if (exp[1] === 2) {
            texte = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100^${exp[1]}}$`
            texteCorr = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100^${exp[1]}}`
            texteCorr += `=\\dfrac{10^{1+${exp[0]}}}{(10^2)^${exp[1]}}`
            texteCorr += `=\\dfrac{10^{1+${exp[0]}}}{10^{2 \\times ${exp[1]}}}`
            texteCorr += `=\\dfrac{10^{${1 + exp[0]}}}{10^{${2 * exp[1]}}}`
          } else {
            texte = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100}$`
            texteCorr = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100}`
            texteCorr += `=\\dfrac{10^{1+${exp[0]}}}{10^2}`
          }
          texteCorr += `=10^{${1 + exp[0]}-${2 * exp[1]}}`
          reponseInteractive = `10^{${1 + exp[0] - 2 * exp[1]}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}`
          if (1 + exp[0] - 2 * exp[1] === 0 || 1 + exp[0] - 2 * exp[1] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            texteCorr +=
              sp(2) + '(=' + simpExp(10, 1 + exp[0] - 2 * exp[1]) + ')'
          }
          texteCorr += '$'
          exposantAMC = [
            1 + exp[0] + 2 * exp[1],
            1 - exp[0] + 2 * exp[1],
            1 + exp[0] - 2 * exp[1],
            1 + exp[0] + exp[1],
          ]
          break
        case 7:
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100\\times 100}$`
          texteCorr = `$${lettre}=\\dfrac{10\\times 10^${exp[0]}}{100\\times 100}`
          texteCorr += `=\\dfrac{10^{1+${exp[0]}}}{10^2\\times 10^2}`
          texteCorr += `=\\dfrac{10^{${1 + exp[0]}}}{10^{2+2}}`
          texteCorr += `=\\dfrac{10^{${1 + exp[0]}}}{10^{${2 + 2}}}`
          texteCorr += `=10^{${1 + exp[0]}-${2 + 2}}`
          reponseInteractive = `10^{${exp[0] - 3}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}`
          if (1 + exp[0] - 2 - 2 === 0 || 1 + exp[0] - 2 - 2 === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            texteCorr += sp(2) + '(=' + simpExp(10, exp[0] - 3) + ')'
          }
          texteCorr += '$'
          exposantAMC = [exp[0] - 3, exp[0] + 3, exp[0] - 2, exp[0] - 1]
          break
        case 8:
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$${lettre}=\\dfrac{100^${exp[0]}}{10}$`
          texteCorr = `$${lettre}=\\dfrac{100^${exp[0]}}{10}`
          texteCorr += `=\\dfrac{(10^2)^${exp[0]}}{10}`
          texteCorr += `=\\dfrac{10^{2\\times ${exp[0]}}}{10}`
          texteCorr += `=\\dfrac{10^{${2 * exp[0]}}}{10}`
          texteCorr += `=10^{${2 * exp[0]}-1}`
          reponseInteractive = `10^{${2 * exp[0] - 1}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}$`
          // Inutile de tester l'exposant final car il vaut au minimum 3
          exposantAMC = [2 * exp[0] - 1, 2 * exp[0] + 1, 2 * exp[0], exp[0] - 1]
          break
        case 9:
          exp = [randint(1, 3, [1])] // on a besoin de 1 exposant
          texte = `$${lettre}=\\dfrac{${texNombre(1000)}^${exp[0]}}{10}$`
          texteCorr = `$${lettre}=\\dfrac{${texNombre(1000)}^${exp[0]}}{10}`
          texteCorr += `=\\dfrac{(10^3)^${exp[0]}}{10}`
          texteCorr += `=\\dfrac{10^{3\\times ${exp[0]}}}{10}`
          texteCorr += `=\\dfrac{10^{${3 * exp[0]}}}{10}`
          texteCorr += `=10^{${3 * exp[0]}-1}`
          reponseInteractive = `10^{${3 * exp[0] - 1}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}$`
          // inutile de tester l'exposant final car il vaut au minimum 5
          exposantAMC = [
            3 * exp[0] - 1,
            3 * exp[0] + 1,
            3 * exp[0],
            3 * exp[0] - 2,
          ]
          break
        case 10:
          exp = [randint(1, 7, [1]), randint(1, 7, [1]), randint(1, 4, [1])] // on a besoin de 3 exposants distincts
          texte = `$${lettre}=\\dfrac{10^${exp[0]}\\times 10^${exp[1]}}{100^${exp[2]}}\\times 10$`
          texteCorr = `$${lettre}=\\dfrac{10^${exp[0]}\\times 10^${exp[1]}}{100^${exp[2]}}\\times 10`
          texteCorr += `=\\dfrac{10^{${exp[0]}+${exp[1]}}}{(10^2)^${exp[2]}}\\times 10`
          texteCorr += `=\\dfrac{10^{${exp[0] + exp[1]}}}{10^{2\\times ${
            exp[2]
          }}}\\times 10`
          texteCorr += `=\\dfrac{10^{${exp[0] + exp[1]}}}{10^{${
            2 * exp[2]
          }}}\\times 10`
          texteCorr += `=\\dfrac{10^{${exp[0] + exp[1]}}\\times 10}{10^{${
            2 * exp[2]
          }}}`
          texteCorr += `=\\dfrac{10^{${exp[0] + exp[1]}+1}}{10^{${2 * exp[2]}}}`
          texteCorr += `=\\dfrac{10^{${exp[0] + exp[1] + 1}}}{10^{${
            2 * exp[2]
          }}}`
          texteCorr += `=10^{${exp[0] + exp[1] + 1}-${2 * exp[2]}}`
          reponseInteractive = `10^{${exp[0] + exp[1] + 1 - 2 * exp[2]}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}`
          if (
            exp[0] + exp[1] + 1 - 2 * exp[2] === 0 ||
            exp[0] + exp[1] + 1 - 2 * exp[2] === 1
          ) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant est évincé
            texteCorr +=
              sp(2) + '(=' + simpExp(10, exp[0] + exp[1] + 1 - 2 * exp[2]) + ')'
          }
          texteCorr += '$'
          exposantAMC = [
            exp[0] + exp[1] + 1 - 2 * exp[2],
            exp[0] + exp[1] - 2 * exp[2],
            exp[0] + exp[1] + 1 - exp[2],
            exp[0] + exp[1] - exp[2],
          ]
          break
        case 11:
        default:
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$${lettre}=\\dfrac{${texNombre(1000)}\\times 10}{100^${exp[0]}}$`
          texteCorr = `$${lettre}=\\dfrac{${texNombre(1000)}\\times 10}{100^${exp[0]}}`
          texteCorr += `=\\dfrac{10^3\\times 10}{(10^2)^${exp[0]}}`
          texteCorr += `=\\dfrac{10^{3+1}}{10^{2\\times${exp[0]}}}`
          texteCorr += `=\\dfrac{10^{4}}{10^{${2 * exp[0]}}}`
          texteCorr += `=10^{4-${2 * exp[0]}}`
          reponseInteractive = `10^{${4 - 2 * exp[0]}}`
          texteCorr += `=${miseEnEvidence(reponseInteractive)}`
          if (3 + 1 - 2 * exp[0] === 0 || 3 + 1 - 2 * exp[0] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant est évincé
            texteCorr += sp(2) + '(=' + simpExp(10, 3 + 1 - 2 * exp[0]) + ')'
          }
          texteCorr += '$'
          exposantAMC = [
            4 - 2 * exp[0],
            4 - exp[0],
            3 - 2 * exp[0],
            5 - 2 * exp[0],
          ]
          break
      }
      if (this.interactif && !context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: reponseInteractive,
            options: { puissance: true },
          },
        })
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          { texteAvant: `${sp(2)}$=$${sp(2)}` },
        )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {}
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].enonce = `${texte}\n`
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].options = {
          ordered: false,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [
          {
            texte: `$10^{${exposantAMC[0]}}$`,
            statut: true,
          },
          {
            texte: `$10^{${exposantAMC[1]}}$`,
            statut: false,
          },
          {
            texte: `$10^{${exposantAMC[2]}}$`,
            statut: false,
          },
          {
            texte: `$10^{${exposantAMC[3]}}$`,
            statut: false,
          },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (
        this.questionJamaisPosee(i, exp.map(String).join(), typesDeQuestions)
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
}
