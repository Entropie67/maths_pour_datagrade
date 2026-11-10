// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 5f5a6 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenuSansNumero } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Factoriser une expression'
export const dateDeModifImportante = '19/03/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Utiliser la simple ou la double distributivité et réduire l'expression
 * @author Rémi Angot
 * Ajout du paramétrage : Guillaume Valmont 13/08/2021
 * Ajout d'un nouveau paramètre sur le choix des lettres : Éric Elter 20/04/2025
 * Ajout d'un nouveau paramètre sur le choix du signe x final : Éric Elter 20/04/2025
 * Meilleure gestion des lettres identiques : Éric Elter 19/03/2026
 */
export const uuid = '5f5a6'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class FactoriserParNombreOuxOld extends Exercice {
  constructor() {
    super()

    this.sup = 4
    this.nbQuestions = 3
    this.nbCols = 2
    this.nbColsCorr = 2

    this.spacingCorr = context.isHtml ? 2 : 1
    this.listeAvecNumerotation = false
    this.besoinFormulaireNumerique = [
      "Type d'expressions",
      4,
      '1 : Expressions de type 7a+21b\n2 : Expressions de type 14a+21b\n3 : Expressions de type 14x+21x²\n4 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = [
      'Signe $\\times$ dans la reponse finale',
      false,
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec uniquement les mêmes lettres',
      true,
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser les expressions suivantes.'
        : "Factoriser l'expression suivante."

    let typesDeQuestionsDisponibles
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = ['ka+nkb', '-ka+nkb']
        break
      case 2:
        typesDeQuestionsDisponibles = ['nka+mkb', 'nka-mkb']
        break
      case 3:
        typesDeQuestionsDisponibles = [
          'nkx+mkx2',
          'nkx-mkx2',
          'nx2+x',
          'nx2+mx',
        ]
        break
      default:
        typesDeQuestionsDisponibles = [
          'ka+nkb',
          '-ka+nkb',
          'nka+mkb',
          'nka-mkb',
          'nkx+mkx2',
          'nkx-mkx2',
          'nx2+x',
          'nx2+mx',
        ]
        break
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    let a = choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c'])
    let b = choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c'], a)
    let x =
      this.sup === 4 && this.sup2
        ? choice([a, b])
        : choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c'])
    for (
      let i = 0, texte, texteCorr, reponse, n, m, couplenm, k, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      reponse = ''
      k = choice([2, 3, 5, 7, 11])
      couplenm = choice([
        [2, 3],
        [3, 4],
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 6],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [3, 8],
        [5, 8],
        [7, 8],
        [2, 9],
        [4, 9],
        [5, 9],
        [7, 9],
        [8, 9],
        [3, 10],
        [7, 10],
        [9, 10],
      ]) // n et m sont premiers entre eux
      n = couplenm[0]
      m = couplenm[1]
      n = choice([n, n, -n])
      a = !this.sup2 ? choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c']) : a
      b = !this.sup2 ? choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c'], a) : b
      x = !this.sup2 ? choice(['x', 'y', 'z', 'k', 'n', 'a', 'b', 'c']) : x

      switch (listeTypeDeQuestions[i]) {
        case 'ka+nkb':
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}${a}${ecritureAlgebriqueSauf1(n * k)}${b}$`
          texteCorr = texte
          if (n > 0) {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}${a}+${k}\\times${n}${b}$`
          } else {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}${a}-${k}\\times${abs(n)}${b}$`
          }
          reponse = `${k}\\times(${a}${ecritureAlgebriqueSauf1(n)}${b})`
          break
        case '-ka+nkb':
          texte = `$${lettreDepuisChiffre(i + 1)}=${-k}${a}${ecritureAlgebriqueSauf1(n * k)}${b}$`
          texteCorr = texte
          if (n > 0) {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${-k}${a}+${k}\\times${n}${b}$`
            reponse = `${k}\\times(-${a}${ecritureAlgebriqueSauf1(n)}${b})`
          } else {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${-k}${a}+(-${k})\\times${-n}${b}$`
            reponse = `${-k}\\times(${a}${ecritureAlgebriqueSauf1(-n)}${b})`
          }
          break
        case 'nka+mkb':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(n * k)}${a}${ecritureAlgebriqueSauf1(m * k)}${b}$`
          texteCorr = texte
          if (n < 0) {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}\\times(${n}${a})+${k}\\times${m}${b}$`
          } else {
            texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}\\times${n}${a}+${k}\\times${m}${b}$`
          }
          reponse = `${k}\\times(${n}${a}+${m}${b})`
          break
        case 'nka-mkb':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(n * k)}${a}-${rienSi1(m * k)}${b}$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}\\times${ecritureParentheseSiNegatif(n)}${a}-${k}\\times${m}${b}$`
          reponse = `${k}\\times(${n}${a}-${m}${b})`
          break
        case 'nkx+mkx2':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(n * k)}${x}+${rienSi1(m * k)}${x}^2$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}${x}\\times${ecritureParentheseSiNegatif(n)}+${k}${x}\\times${m}${x}$`
          reponse = `${k}${x}\\times(${n}+${m}${x})`
          break
        case 'nkx-mkx2':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(n * k)}${x}-${rienSi1(m * k)}${x}^2$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${k}${x}\\times${ecritureParentheseSiNegatif(n)}-${k}${x}\\times${m}${x}$`
          reponse = `${k}${x}\\times(${n}-${m}${x})`
          break
        case 'nx2+x':
          texte = `$${lettreDepuisChiffre(i + 1)}=${n}${x}^2+${x}$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${x}\\times ${ecritureParentheseSiNegatif(n)}${x}+${x}\\times 1$`
          reponse = `${x}\\times(${n}${x}+1)`
          break
        case 'nx2+mx':
          texte = `$${lettreDepuisChiffre(i + 1)}=${n}${x}^2+${m}${x}$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${x}\\times ${ecritureParentheseSiNegatif(n)}${x}+${x}\\times ${m}$`
          reponse = `${x}\\times(${n}${x}+${m})`
          break
      }
      // Suppression du signe \times si sup3 est faux
      if (!this.sup3) reponse = reponse.replace('\\times', '')

      // Affichage de la réponse finale
      texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${reponse}$`

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

      if (this.questionJamaisPosee(i, k, n, m)) {
        // Si la question n'${a} jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
