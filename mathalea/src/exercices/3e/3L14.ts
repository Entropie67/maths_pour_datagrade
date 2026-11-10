import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une équation produit nul'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

export const dateDeModifImportante = '09/03/2023'

/**
 * Résolution d'équations de type (ax+b)(cx+d)=0
 * @author Jean-claude Lhote
 * Tout est dans le nom de la fonction.
 * Rendu interactif par Guillaume Valmont le 18/03/2022
 */
export const uuid = 'ecf62'

export const refs = {
  'fr-fr': ['3L14', 'BP2RES16'],
  'fr-ch': ['11LSFA4E-2'],
}
export default class ResoudreUneEquationProduitNul extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      8,
      "1 : Coefficients de x = 1\n2 : Un coefficient de x > 1 et l'autre = 1\n3 : Coefficient de x > 1 et solutions entières\n4 : Solutions rationnelles\n5 : Mélange 1 et 2\n6 : Mélange 2 et 3\n7 : Mélange 3 et 4\n8 : Mélange de tout",
    ]

    this.nbQuestions = 5

    this.sup = 2
    this.spacingCorr = context.isHtml ? 2 : 1.5
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'
    let listeTypeDeQuestions: number[] = []
    switch (contraindreValeur(1, 8, this.sup, 1)) {
      case 1:
        listeTypeDeQuestions = combinaisonListes([1, 2], this.nbQuestions) // coefficients à 1
        break
      case 2:
        listeTypeDeQuestions = combinaisonListes([13, 42], this.nbQuestions) // 1 coef 1 et pas l'autre
        break
      case 3:
        listeTypeDeQuestions = combinaisonListes([3, 4], this.nbQuestions) // coefficients > 1 solutions entières
        break
      case 4:
        listeTypeDeQuestions = combinaisonListes([5, 6], this.nbQuestions) // coefficients > 1 solutions rationnelles (simplifiables ou pas)
        break
      case 5:
        listeTypeDeQuestions = combinaisonListes(
          [1, 2, 13, 42],
          this.nbQuestions,
        ) // Mélange cas 1 et 2
        break
      case 6:
        listeTypeDeQuestions = combinaisonListes(
          [13, 42, 3, 4],
          this.nbQuestions,
        ) // Mélange cas 2 et 3
        break
      case 7:
        listeTypeDeQuestions = combinaisonListes([3, 4, 5, 6], this.nbQuestions) // Mélange cas 3 et 4
        break
      case 8:
        listeTypeDeQuestions = combinaisonListes(
          [1, 2, 3, 4, 5, 6, 13, 42],
          this.nbQuestions,
        )
        break
    }
    for (
      let i = 0, a, b, c, d, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let solution1: number | FractionEtendue
      let solution2: number | FractionEtendue
      // initialisation des variables pour this.questionJamaisPosee
      a = 0
      c = 0
      switch (listeTypeDeQuestions[i]) {
        case 1: // (x+a)(x+b)=0 avec a et b entiers
          b = randint(1, context.isAmc ? 9 : 20)
          d = randint(1, context.isAmc ? 9 : 20, [b])
          texte = `$(x+${b})(x+${d})=0$`
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + `$(x+${b})(x+${d})=0$`
          texteCorr +=
            '<br> ' +
            `$x+${b}=0$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$x+${d}=0$`
          texteCorr +=
            '<br> ' +
            `$x=${0 - b}$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$x=${0 - d}$`
          solution1 = Math.min(-b, -d)
          solution2 = Math.max(-b, -d)
          break
        case 2: {
          // (x-b)(x+d)=0  ou (x+d)(x-b)=0 avec b et d entiers
          b = randint(1, context.isAmc ? 9 : 20)
          d = randint(1, context.isAmc ? 9 : 20, [b])
          const choix = choice([0, 1])
          texte = [`$(x-${b})(x+${d})=0$`, `$(x+${d})(x-${b})=0$`][choix]
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + texte
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x-${b}=0$` : `$x+${d}=0$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x+${d}=0$` : `$x-${b}=0$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${b}$` : `$x=${-d}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=${-d}$` : `$x=${b}$`)
          solution1 = Math.min(b, -d)
          solution2 = Math.max(b, -d)
          break
        }
        case 13: {
          // (x+b)(cx+d)=0  avec b/a et d/c entiers.
          a = randint(2, 6)
          b = randint(1, 5) * a
          do {
            c = randint(2, 6, [a])
            d = randint(1, 5) * c
          } while (-b * c === -d)

          const choix = choice([0, 1])
          texte = [`$(x+${b})(${c}x+${d})=0$`, `$(${c}x+${d})(x+${b})=0$`][
            choix
          ]
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + texte
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x+${b}=0$` : `$${c}x+${d}=0$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x+${d}=0$` : `$x+${b}=0$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${-b}$` : `$${c}x=${-d}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x=${-d}$` : `$x=${-b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0
              ? `$x=${-b}$`
              : `$x=-${texFractionFromString(d, c)}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=-${texFractionFromString(d, c)}$` : `$x=${-b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${-b}$` : `$x=${-d / c}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=${-d / c}$` : `$x=${-b}$`)
          solution1 = Math.min(-b, -d / c)
          solution2 = Math.max(-b, -d / c)
          break
        }
        case 42: {
          // (x-b)(cx+d)=0  ou (cx+d)(x-b)=0 avec d/c entiers.
          b = randint(1, context.isAmc ? 9 : 20)
          c = randint(2, 8, [b])
          d = randint(1, 6) * c
          const choix = choice([0, 1])
          texte = [`$(x-${b})(${c}x+${d})=0$`, `$(${c}x+${d})(x-${b})=0$`][
            choix
          ]
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + texte
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x-${b}=0$` : `$${c}x+${d}=0$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x+${d}=0$` : `$x-${b}=0$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${b}$` : `$${c}x=${-d}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x=${-d}$` : `$x=${b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${b}$` : `$x=-${texFractionFromString(d, c)}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=-${texFractionFromString(d, c)}$` : `$x=${b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${b}$` : `$x=${-d / c}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=${-d / c}$` : `$x=${b}$`)
          // il ne peut y avoir de solution double, il y a un positif et un négatif
          solution1 = -d / c // la négative en premier
          solution2 = b
          break
        }
        case 3: // (ax+b)(cx+d)=0  avec b/a et d/c entiers.
          a = randint(2, 6)
          b = randint(1, 5) * a
          do {
            c = randint(2, 6, [a])
            d = randint(1, 5) * c
          } while (-b * c === -d || a * d === b * c)
          texte = `$(${a}x+${b})(${c}x+${d})=0$`
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + `$(${a}x+${b})(${c}x+${d})=0$`
          texteCorr +=
            '<br> ' +
            `$${a}x+${b}=0$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$${c}x+${d}=0$`
          texteCorr +=
            '<br> ' +
            `$${a}x=${-b}$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$${c}x=${-d}$`
          texteCorr +=
            '<br> ' +
            `$x=-${texFractionFromString(b, a)}$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$x=-${texFractionFromString(d, c)}$`
          texteCorr +=
            '<br> ' +
            `$x=${-b / a}$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$x=${-d / c}$`
          solution1 = Math.min(-b / a, -d / c)
          solution2 = Math.max(-b / a, -d / c)
          break
        case 4: {
          // (ax+b)(cx-d)=0  avec b/a et d/c entiers.
          a = randint(2, 6)
          b = Math.round(randint(1, 5) * a)
          do {
            c = randint(2, 6, [a])
            d = Math.round(randint(1, 5) * c)
          } while (-a * d === b * c)
          const choix = choice([0, 1])
          texte = [
            `$(${a}x+${b})(${c}x-${d})=0$`,
            `$(${c}x-${d})(${a}x+${b})=0$`,
          ][choix]
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + texte
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$${a}x+${b}=0$` : `$${c}x-${d}=0$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x-${d}=0$` : `$${a}x+${b}=0$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$${a}x=${-b}$` : `$${c}x=${d}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x=${d}$` : `$${a}x=${-b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0
              ? `$x=-${texFractionFromString(b, a)}$`
              : `$x=${texFractionFromString(d, c)}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0
              ? `$x=${texFractionFromString(d, c)}$`
              : `$x=-${texFractionFromString(b, a)}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$x=${-b / a}$` : `$x=${d / c}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$x=${d / c}$` : `$x=${-b / a}$`)
          // il ne peut y avoir de solution double, il y a un positif et un négatif
          solution1 = -b / a // la négative en premier
          solution2 = d / c
          break
        }
        case 5:
          a = randint(2, 9) // (ax+b)(cx+d)=0 avec b/a et d/c quelconques.
          b = randint(1, context.isAmc ? 9 : 20, [a])
          do {
            c = randint(2, 9, [a])
            d = randint(1, context.isAmc ? 9 : 20, [b, c])
          } while (b * c === d * a)
          texte = `$(${a}x+${b})(${c}x+${d})=0$`
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + `$(${a}x+${b})(${c}x+${d})=0$`
          texteCorr +=
            '<br> ' +
            `$${a}x+${b}=0$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$${c}x+${d}=0$`
          texteCorr +=
            '<br> ' +
            `$${a}x=${0 - b}$` +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$${c}x=${0 - d}$`
          texteCorr += '<br> ' + `$x=-${texFractionFromString(b, a)}$`
          if (texFractionFromString(b, a) !== texFractionReduite(b, a)) {
            texteCorr += `$=-${texFractionReduite(b, a)}$`
          }
          texteCorr +=
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            `$x=-${texFractionFromString(d, c)}$`
          if (texFractionFromString(d, c) !== texFractionReduite(d, c)) {
            texteCorr += `$=-${texFractionReduite(d, c)}$`
          }
          if (-b / a < -d / c) {
            solution1 = fraction(-b, a).simplifie()
            solution2 = fraction(-d, c).simplifie()
          } else {
            solution2 = fraction(-b, a).simplifie()
            solution1 = fraction(-d, c).simplifie()
          }
          // }
          break
        case 6:
        default: {
          a = randint(2, 9) // (ax+b)(cx-d)=0 avec b/a et d/c quelconques.
          b = randint(1, context.isAmc ? 9 : 20, [a])
          c = randint(2, 9, [a])
          d = randint(1, context.isAmc ? 9 : 20, [b, c])
          const choix = choice([0, 1])
          texte = [
            `$(${a}x+${b})(${c}x-${d})=0$`,
            `$(${c}x-${d})(${a}x+${b})=0$`,
          ][choix]
          texteCorr =
            "Un produit est nul si l'un au moins de ses facteurs est nul."
          texteCorr += '<br>' + texte
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$${a}x+${b}=0$` : `$${c}x-${d}=0$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x-${d}=0$` : `$${a}x+${b}=0$`)
          texteCorr +=
            '<br> ' +
            (choix === 0 ? `$${a}x=${0 - b}$` : `$${c}x=${d}$`) +
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0 ? `$${c}x=${d}$` : `$${a}x=${0 - b}$`)
          texteCorr +=
            '<br> ' +
            (choix === 0
              ? `$x=-${texFractionFromString(b, a)}$`
              : `$x=${texFractionFromString(d, c)}$`)
          if (choix === 0) {
            if (texFractionFromString(b, a) !== texFractionReduite(b, a)) {
              texteCorr += `$=-${texFractionReduite(b, a)}$`
            }
          } else {
            if (texFractionFromString(d, c) !== texFractionReduite(d, c)) {
              texteCorr += `$=${texFractionReduite(d, c)}$`
            }
          }
          texteCorr +=
            ` ${texteEnCouleurEtGras('ou', 'black')} ` +
            (choix === 0
              ? `$x=${texFractionFromString(d, c)}$`
              : `$x=-${texFractionFromString(b, a)}$`)
          if (choix === 1) {
            if (texFractionFromString(b, a) !== texFractionReduite(b, a)) {
              texteCorr += `$=-${texFractionReduite(b, a)}$`
            }
          } else {
            if (texFractionFromString(d, c) !== texFractionReduite(d, c)) {
              texteCorr += `$=${texFractionReduite(d, c)}$`
            }
          }
          solution1 = fraction(-b, a).simplifie() // la négative en premier
          solution2 = fraction(d, c).simplifie()
          break
        }
      }

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        const solution1Interactif =
          solution1 instanceof FractionEtendue ? solution1.texFSD : solution1
        const solution2Interactif =
          solution2 instanceof FractionEtendue ? solution2.texFSD : solution2
        texteCorr += `<br>Les solutions de l'équation sont : $${miseEnEvidence(`${solution1Interactif};${solution2Interactif}`)}$.`

        handleAnswers(this, i, {
          reponse: {
            value: `${solution1Interactif};${solution2Interactif}`,
            options: { suiteDeNombres: true },
          },
        })
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] =
          texte +
          `${ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            {
              texteAvant: `<br>Solutions de l'équation (séparer les solutions avec un point-virgule) : `,
            },
          )}`

        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce:
              "Résoudre l'équation : " +
              texte +
              "\\\\\nSi il n'y a qu'une solution double, il faut la coder dans solution1 et solution2.\\\\\nLes fractions doivent être simplifiées au maximum.",
            enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
            enonceAvantUneFois: true, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
            enonceCentre: false, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
            enonceApresNumQuestion: false, // New (12/2022) EE : ce champ est facultatif et permet (si true) de mettre le champ 'enonce' à côté du numéro de question (et non avant par défaut). Ne fonctionne (pour l'instant) que si la première question est AMCNum (pas de besoin autre pour l'instant).
            melange: false, // EE : ce champ est facultatif et permet (si false) de ne pas provoquer le mélange des questions.
            options: {
              multicols: true,
              barreseparation: false,
              multicolsAll: false,
              avecSymboleMult: false,
              numerotationEnonce: false,
            }, // facultatif.
            propositions: [
              {
                type: 'AMCOpen', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
                propositions: [
                  // une ou plusieurs (Qcms) 'propositions'
                  {
                    texte: texteCorr,
                    statut: 5,
                    feedback: '',
                    enonce: '',
                    sanscadre: false,
                    pointilles: false,
                  },
                ],
              },
              {
                type: 'AMCNum', // on donne le type de la deuxième question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
                propositions: [
                  // une ou plusieurs (Qcms) 'propositions'
                  {
                    texte: '',
                    reponse: {
                      // utilisé si type = 'AMCNum'
                      texte: 'solution 1',
                      valeur: solution1,
                      alignement: 'flushleft', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
                      param: {
                        digits: 0, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                        decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                        signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                        approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
                        aussiCorrect: Number(solution2),
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum', // on donne le type de la deuxième question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
                propositions: [
                  // une ou plusieurs (Qcms) 'propositions'
                  {
                    texte: '',
                    reponse: {
                      // utilisé si type = 'AMCNum'
                      texte: 'solution 2',
                      valeur: solution2,
                      alignement: 'flushleft', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
                      param: {
                        digits: 0, // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                        decimals: 0, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                        signe: true, // obligatoire pour AMC (présence d'une case + ou -)
                        approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance (voir explication détaillée dans type AMCNum))
                        aussiCorrect: Number(solution1),
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
