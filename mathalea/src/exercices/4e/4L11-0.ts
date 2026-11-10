import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Factoriser une expression littérale (Niveau $1$)'
export const dateDePublication = '20/04/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Factoriser des expressions
 * Trois types d'expressions:
 * - Niveau 1: facteur commun visible (3x+3*11)
 * - Niveau 2: facteur commun à mettre en évidence (4x+8)
 * - Niveau 3: avec des expressions de type ax²+b
 * @author Éric Elter
 */
export const uuid = '0ee90'
export const refs = {
  'fr-fr': ['4L11-0'],
  'fr-ch': ['1mCL2-0', '11LSFA3H-2', 'PRQAL03E-1'],
}

export default class FactoriserExpressionsNiv1 extends Exercice {
  constructor() {
    super()
    this.sup = 4
    this.nbQuestions = 8
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = context.isHtml ? 2 : 1
    this.listeAvecNumerotation = false
    this.besoinFormulaireTexte = [
      "Type d'expressions",
      [
        'Nombres séparés par des tirets  :',
        '1 : Expressions de type ax+ab',
        '2 : Expressions de type ax+b',
        '3 : Expressions de type ax²+b',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Nombre de facteurs négatifs',
      [
        'Nombres séparés par des tirets  :',
        '1 : Aucun',
        '2 : Un seul',
        '3 : Deux',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = [
      'Signe $\\times$ dans la reponse finale',
      true,
    ]
    this.besoinFormulaire4CaseACocher = ['Avec uniquement la lettre $x$', true]
    this.sup2 = 4
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser les expressions suivantes.'
        : "Factoriser l'expression suivante."
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'facteurVisible',
        'facteurInvisible',
        'facteurInvisibleAvecX2',
      ],
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(String)
    const nombreDeSignesNegatifs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(String)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      const k = choice([2, 3, 5, 7, 11])
      const a = choice([2, 3, 4, 5, 6, 7, 8, 9, 10])
      const b = choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [a])

      const lettre = lettreDepuisChiffre(i + 1)

      // Initialisation des variables pour les signes
      let var1 = a
      let var2 = a

      // Variation des signes des facteurs selon sup2
      switch (parseInt(nombreDeSignesNegatifs[i]) - 1) {
        case 1:
          if (choice([true, false])) var1 = -a
          else var2 = -a
          break
        case 2:
          var1 = -a
          var2 = -a
          break
      }

      const inconnue = this.sup4
        ? 'x'
        : choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c'])

      // Variation dans l'ordre des termes
      const premierTermesX = choice([true, false]) // ordre aléatoire des termes
      const terme =
        inconnue +
        (listeTypeDeQuestions[i] === 'facteurInvisibleAvecX2' ? '^2' : '')
      const expr1 =
        listeTypeDeQuestions[i] === 'facteurVisible'
          ? premierTermesX
            ? `${var1}${terme}${ecritureAlgebrique(var2)}\\times${b}` // Expressions de type var1*x + var2*b où il faut mettre en évidence le facteur
            : `${var1}\\times${b}${ecritureAlgebrique(var2)}${terme}` // Expressions de type var1*b + var2*x où il faut mettre en évidence le facteur
          : premierTermesX
            ? `${var1}${terme}${ecritureAlgebrique(var2 * b)}` // Expressions de type var1*x + var2*b où il faut mettre en évidence le facteur
            : `${var1 * b}${ecritureAlgebrique(var2)}${terme}` // Expressions de type var1*b + var2*x où il faut mettre en évidence le facteur
      texte = `$${lettre}=${expr1}$`
      texteCorr = texte

      if (premierTermesX) {
        // Étape 1: Réécrivons avec les facteurs explicites
        texteCorr +=
          var1 > 0
            ? var1 === var2
              ? `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times ${terme}+${miseEnEvidence(var2, bleuMathalea)}\\times${b}$`
              : `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times ${terme}-${miseEnEvidence(-var2, bleuMathalea)}\\times${b}$`
            : `<br>$${lettre}=${var1}\\times ${terme}${ecritureAlgebrique(var2)}\\times${b}$`

        // Si var2 est négatif ou var1 est négatif (mais pas les deux)
        if (var1 * var2 < 0) {
          // Étape 2: Factorisation finale
          if (var1 > 0) {
            reponse = `${var1}\\times(${terme}-${b})`
          } else {
            texteCorr += `<br>$${lettre}=${miseEnEvidence(-var1, bleuMathalea)}\\times(-${terme})+${miseEnEvidence(var2, bleuMathalea)}\\times${b}$`
            reponse = `${-var1}\\times(-${terme}+${b})`
          }
        } else {
          // Les deux termes ont le même signe
          reponse = `${var1}\\times(${terme}+${b})`
          if (var1 < 0) {
            texteCorr += `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times ${terme}+${miseEnEvidence(ecritureParentheseSiNegatif(var2), bleuMathalea)}\\times${b}$`
          }
        }
      } else {
        // Étape 1: Réécrivons avec les facteurs explicites
        texteCorr +=
          var1 > 0
            ? var1 === var2
              ? `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times${b}+${miseEnEvidence(var2, bleuMathalea)}\\times ${terme}$`
              : `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times${b}-${miseEnEvidence(-var2, bleuMathalea)}\\times ${terme}$`
            : `<br>$${lettre}=${var1}\\times${b}${ecritureAlgebrique(var2)}\\times ${terme}$`

        // Si var1 est négatif ou var2 est négatif (mais pas les deux)
        if (var1 * var2 < 0) {
          // Étape 2: Factorisation finale
          if (var1 > 0) {
            reponse = `${var1}\\times(${b}-${terme})`
          } else {
            texteCorr += `<br>$${lettre}=${miseEnEvidence(-var1, bleuMathalea)}\\times(-${b})+${miseEnEvidence(var2, bleuMathalea)}\\times ${terme}$`
            reponse = `${-var1}\\times(-${b}+${terme})`
          }
        } else {
          // Les deux termes ont le même signe
          reponse = `${var1}\\times(${b}+${terme})`
          if (var1 < 0) {
            texteCorr += `<br>$${lettre}=${miseEnEvidence(var1, bleuMathalea)}\\times${b}+${miseEnEvidence(ecritureParentheseSiNegatif(var2), bleuMathalea)}\\times ${terme}$`
          }
        }
      }

      // Suppression du signe \times si sup3 est faux
      if (!this.sup3) reponse = reponse.replace('\\times', '')

      // Affichage de la réponse finale
      texteCorr += `<br>$${lettre}=${reponse}$`

      if (!context.isAmc) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecVariable,
          { texteAvant: ' $=$' },
        )
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { factorisation: true } },
        })
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          propositions: [{ texte: texteCorr, statut: 3, feedback: '' }],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')
      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      // texte += `<br>$${lettre}=${reponse}$` // Pour débuggage

      if (this.questionJamaisPosee(i, a, b, k)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
