import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import {
  labelPoint,
  latexParCoordonnees,
  texteParPosition,
} from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { sameInterval, seq } from '../../../lib/interactif/checks'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { abs, arrondi, range } from '../../../lib/outils/nombres'
import { creerNomDePolygone, sp } from '../../../lib/outils/outilString'
import { prenomF } from '../../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import Exercice from '../../Exercice'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'CAN Spéciale année 2024'
export const interactifReady = true

export const uuid = '6ca15'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'
/**
 * @author Éric Elter
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale2024 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Niveau attendu de la CAN',
      '7 : CM2\n6 : 6ème\n5 : 5ème\n4 : 4ème\n3 : 3ème\n2 : Seconde\n1 : Première\n0 : Terminale\nx : Au Hasard',
    ]

    this.sup = 'x'
    this.nbQuestions = 30
  }

  nouvelleVersion() {
    let niveauAttendu = this.sup === 0 ? 0 : !this.sup ? 8 : parseInt(this.sup) // Ce parseInt est nécessaire car le formulaire est un texte
    if (isNaN(niveauAttendu) || niveauAttendu > 7) {
      niveauAttendu = choice(range(7)) // Niveau au Hasard
    }

    const listeCAN = [
      // Pour chaque question de la CAN, on établit un tableau  :
      // Chaque élément correspond à la difficulté pour un niveau.
      // L'élément 0 est pour la terminale, ..., l'élément 2 pour la 2nde, ..., l'élément 6 pour la 6ème,
      // l'élement 7 pour le CM
      // Les niveaux de difficulté sont les suivants 0 : facile, 1 : moyen, 2 : difficile, 3 : pas du niveau
      // Exemple 1 : La question 1 n'est pas du niveau de la terminale à la 2nde et est facile de la 3ème au CM.
      [3, 3, 3, 0, 0, 0, 0, 0], // Q1
      // Exemple 2 : La question 2 est facile de la terminale à la 2nde et n'est pas du niveau de la 3ème au CM.
      [0, 0, 0, 3, 3, 3, 3, 3], // Q2
      // Exemple 3 : La question 3 possède trois niveaux de difficulté différents selon la classe.
      [0, 0, 0, 1, 1, 2, 2, 2], // Q3
      // Exemple 4 : Bon, c'est bon, on a compris. ;-)
      [0, 0, 0, 1, 2, 3, 3, 3], // Q4
      [0, 0, 0, 1, 2, 2, 3, 3], // Q5
      [0, 0, 0, 0, 1, 1, 2, 2], // Q6
      [0, 0, 0, 1, 2, 3, 3, 3], // Q7
      [0, 1, 1, 2, 3, 3, 3, 3], // Q8
      [0, 0, 0, 0, 0, 0, 0, 0], // Q9
      [0, 0, 0, 0, 1, 1, 1, 1], // Q10
      [0, 0, 0, 1, 1, 2, 2, 3], // Q11
      [0, 0, 0, 0, 0, 1, 1, 1], // Q12
      [1, 1, 2, 2, 2, 2, 2, 2], // Q13
      [0, 0, 0, 0, 0, 0, 1, 1], // Q14
      [2, 2, 1, 2, 2, 3, 3, 3], // Q15
      [0, 0, 0, 0, 0, 1, 2, 3], // Q16
      [0, 0, 0, 0, 0, 0, 0, 0], // Q17
      [0, 0, 0, 0, 0, 0, 1, 2], // Q18
      [0, 0, 0, 0, 1, 2, 3, 3], // Q19
      [0, 0, 0, 0, 0, 0, 0, 3], // Q20
      [0, 1, 1, 2, 3, 3, 3, 3], // Q21
      [0, 0, 3, 3, 3, 3, 3, 3], // Q22
      [1, 1, 2, 3, 3, 3, 3, 3], // Q23
      [1, 1, 1, 1, 3, 3, 3, 3], // Q24
      [1, 2, 2, 3, 3, 3, 3, 3], // Q25
      [2, 2, 3, 3, 3, 3, 3, 3], // Q26
      [0, 0, 0, 0, 1, 1, 2, 2], // Q27
      [0, 0, 0, 0, 1, 1, 1, 1], // Q28
      [0, 0, 0, 0, 0, 0, 1, 1], // Q29
      [0, 0, 0, 0, 1, 2, 3, 3], // Q30
      [0, 0, 0, 1, 1, 1, 2, 2], // Q31
      [0, 0, 0, 1, 1, 3, 3, 3], // Q32
      [2, 2, 2, 3, 3, 3, 3, 3], // Q33
      [0, 0, 2, 3, 3, 3, 3, 3], // Q34
      [0, 0, 0, 3, 3, 3, 3, 3], // Q35
      [2, 2, 2, 3, 3, 3, 3, 3], // Q36
      [0, 0, 0, 0, 1, 3, 3, 3], // Q37
      [0, 0, 0, 0, 1, 3, 3, 3], // Q38
      [0, 0, 0, 0, 1, 3, 3, 3], // Q39
      [1, 1, 2, 3, 3, 3, 3, 3], // Q40
      [0, 0, 1, 3, 3, 3, 3, 3], // Q41
      [2, 2, 3, 3, 3, 3, 3, 3], // Q42
      [0, 0, 0, 0, 1, 1, 2, 2], // Q43
      [0, 1, 1, 2, 2, 3, 3, 3], // Q44
      [0, 0, 0, 1, 1, 2, 2, 3], // Q45
      [0, 0, 1, 2, 2, 3, 3, 3], // Q46
      [0, 0, 1, 2, 3, 3, 3, 3], // Q47
      [1, 2, 2, 3, 3, 3, 3, 3], // Q48
      [0, 0, 0, 1, 1, 1, 1, 1], // Q49
      [0, 0, 0, 0, 0, 0, 1, 1], // Q50
      [0, 0, 1, 2, 3, 3, 3, 3], // Q51
      [0, 0, 0, 0, 0, 0, 0, 0], // Q52
      [2, 3, 3, 3, 3, 3, 3, 3], // Q53
      [0, 3, 3, 3, 3, 3, 3, 3], // Q54
      [2, 3, 3, 3, 3, 3, 3, 3], // Q55
      [1, 2, 2, 3, 3, 3, 3, 3], // Q56
      [0, 1, 1, 2, 3, 3, 3, 3], // Q57
      [0, 0, 0, 0, 0, 0, 0, 0], // Q58
      [0, 0, 0, 0, 1, 1, 2, 2], // Q59
      [2, 3, 3, 3, 3, 3, 3, 3], // Q60
      [2, 3, 3, 3, 3, 3, 3, 3], // Q61
      [1, 1, 2, 3, 3, 3, 3, 3], // Q62
      [0, 0, 1, 1, 1, 2, 2, 3], // Q63
      [0, 0, 1, 2, 3, 3, 3, 3], // Q64
      [0, 0, 1, 2, 2, 3, 3, 3], // Q65
      [0, 0, 1, 2, 3, 3, 3, 3], // Q66
      [0, 0, 1, 1, 1, 2, 2, 2], // Q67
      [0, 0, 1, 2, 2, 3, 3, 3], // Q68
      [0, 0, 1, 2, 3, 3, 3, 3], // Q69
      [0, 0, 0, 0, 0, 0, 0, 0], // Q70
      [0, 0, 1, 1, 1, 1, 2, 2], // Q71
      [0, 0, 1, 1, 1, 2, 2, 3], // Q72
      [1, 1, 2, 2, 3, 3, 3, 3], // Q73
      [2, 2, 2, 3, 3, 3, 3, 3], // Q74
      [0, 0, 1, 1, 2, 2, 3, 3], // Q75
      [3, 3, 3, 0, 0, 0, 0, 0], // Q76 Complémentaire à Q5
      [0, 0, 0, 0, 1, 1, 1, 1], // Q77
      [0, 0, 0, 1, 2, 2, 2, 2], // Q78
      [0, 0, 0, 1, 2, 2, 2, 3], // Q79
      [0, 0, 0, 0, 0, 0, 0, 0], // Q80
      [0, 0, 0, 0, 0, 0, 1, 1], // Q81
      [0, 0, 0, 0, 0, 0, 0, 0], // Q82
      [0, 0, 0, 0, 0, 0, 0, 0], // Q83
      [0, 0, 0, 0, 0, 0, 0, 1], // Q84
      [1, 2, 2, 2, 3, 3, 3, 3], // Q85
      [0, 0, 0, 0, 1, 1, 3, 3], // Q86
      [0, 0, 0, 0, 1, 1, 2, 3], // Q87
      [0, 0, 1, 3, 3, 3, 3, 3], // Q88
      [3, 3, 3, 0, 0, 0, 0, 0], // Q89
      [3, 3, 3, 3, 3, 0, 0, 0], // Q90
      [3, 3, 0, 0, 0, 0, 0, 1], // Q91
      [3, 3, 3, 0, 0, 0, 0, 1], // Q92
      [0, 0, 0, 1, 1, 2, 2, 2], // Q93
    ]

    // Pour test, si on ne veut que les question 73, 72 et 43 soient les premières questions, les mettre dans le tableau ci-dessous.
    // const typeQuestionsDisponibles = [73,72,43] autrement rien []
    // const typeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93]
    const typeQuestionsDisponibles = []

    /// ///// Cette partie ci-dessous est destinée à afficher le tableau de répartition des différents niveaux de difficulté
    /// ///// Cette partie sera à commenter lors de la mise en production
    /* const bilanParClasse = []
    for (let gm = 0; gm < listeCAN[0].length; gm++) {
      bilanParClasse.push([0, 0, 0, 0])
    }
    for (let ee = 0; ee < listeCAN.length; ee++) {
      for (let gm = 0; gm < bilanParClasse.length; gm++) {
        bilanParClasse[gm][listeCAN[ee][gm]]++
      }
    }
    this.consigne += '<br><br> Bilan des questions par classe et par niveau de difficulté.<br><br>'
    this.consigne += sp(40) + 'Faciles' + sp(10) + 'Moyennes' + sp(10) + 'Difficiles' + sp(10) + 'Pas du niveau<br>'
    for (let gm = 0; gm < bilanParClasse.length; gm++) {
      this.consigne += 'Pour la classe ' + gm + ' : ' + sp(10)
      for (let ee = 0; ee < 4; ee++) {
        this.consigne += bilanParClasse[gm][ee] + sp(25)
      }
      this.consigne += '<br>'
    } */
    /// ///// Fin de la partie à commenter

    // Faut se poser la question de comment avoir un tiers de questions faciles, un tiers de questions moyennes
    // et au autre tiers de questions plus difficiles
    // La question est posée et résolue ci-dessous.
    // On crée trois tableaux de questions de difficultés différentes et on les concatène ensuite pour former le tableau de questions.
    // Si un des tableaux n'est pas assez rempli, on le remplit avec des questions

    let questionsFaciles: number[] = []
    let questionsMoyennes: number[] = []
    let questionsDifficiles: number[] = []

    for (let i = 0; i < listeCAN.length; i++) {
      // Ici, selon le niveau attendu, on ne sélectionne que les questions qu'il faut
      switch (listeCAN[i][niveauAttendu]) {
        case 0:
          questionsFaciles.push(i + 1)
          break
        case 1:
          questionsMoyennes.push(i + 1)
          break
        case 2:
          questionsDifficiles.push(i + 1)
          break
      }
    }

    const nbQuestionsDifficiles = Math.trunc(this.nbQuestions / 3)
    const nbQuestiionsFaciles = this.nbQuestions - 2 * nbQuestionsDifficiles

    questionsFaciles = combinaisonListes(questionsFaciles, nbQuestiionsFaciles)
    questionsMoyennes =
      questionsMoyennes.length === 0
        ? combinaisonListes(questionsFaciles, nbQuestiionsFaciles)
        : combinaisonListes(questionsMoyennes, nbQuestionsDifficiles)
    questionsDifficiles =
      questionsDifficiles.length === 0
        ? combinaisonListes(questionsMoyennes, nbQuestionsDifficiles)
        : combinaisonListes(questionsDifficiles, nbQuestionsDifficiles)

    for (let ee = 0; ee < nbQuestiionsFaciles; ee++)
      typeQuestionsDisponibles.push(questionsFaciles[ee])
    for (let ee = 0; ee < nbQuestionsDifficiles; ee++)
      typeQuestionsDisponibles.push(questionsMoyennes[ee])
    for (let ee = 0; ee < nbQuestionsDifficiles; ee++)
      typeQuestionsDisponibles.push(questionsDifficiles[ee])

    let choixQ1 = 0
    let choixQ2 = 0 // EE :Pour éviter qu'on ait la même question en Q1 et Q2

    for (
      let i = 0, index = 0, reponse, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 100;
    ) {
      //
      // Boucle principale où i+1 correspond au numéro de la question
      // texNombre(n) permet d'écrire un nombre avec le bon séparateur décimal !! à utiliser entre $  $
      // calcul(expression) permet d'éviter les erreurs de javascript avec les approximations décimales
      // texNombre(expression) fait les deux choses ci-dessus.
      // switch (typeQuestionsDisponibles[listeIndex[i]]) { // Suivant le type de question, le contenu sera différent
      switch (
        typeQuestionsDisponibles[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: // De CM à 3ème - Facile pour tous
          choixQ1 = randint(1, 3, choixQ2)
          if (choixQ1 === 1) {
            texte = `$${texNombre(2024)}\\times 2$`
            texteCorr = `$${texNombre(2024)}\\times 2=${miseEnEvidence(texNombre(4048))}$`
            reponse = 4048
          } else if (choixQ1 === 2) {
            texte = `$${texNombre(2024)}\\div 2$`
            texteCorr = `$${texNombre(2024)}\\div 2=${miseEnEvidence(texNombre(1012))}$`
            reponse = 1012
          } else {
            texte = `$${texNombre(2024)}\\times 3$`
            texteCorr = `$${texNombre(2024)}\\times 3=${miseEnEvidence(texNombre(6072))}$`
            reponse = 6072
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierNumbers,
            {
              texteAvant: ' =',
            },
          )
          this.listeCanEnonces.push(texte)

          break

        case 2: // De 2nde à Terminale - Facile pour tous
          choixQ2 = randint(1, 4, choixQ1)
          if (choixQ2 === 2) {
            texte = `La moitié de $${texNombre(2024)}$`
            texteCorr = `La moitié de $${texNombre(2024)}$ est${sp()}: $${texNombre(2024)}\\div 2=${miseEnEvidence(texNombre(1012))}$.`
            reponse = 1012
          } else if (choixQ2 === 4) {
            texte = `Le quart de $${texNombre(2024)}$`
            texteCorr = `Le quart de $${texNombre(2024)}$ est${sp()}: $${texNombre(2024)}\\div 4=${miseEnEvidence(texNombre(506))}$.`
            reponse = 506
          } else if (choixQ2 === 1) {
            texte = `Le double de $${texNombre(2024)}$`
            texteCorr = `$${texNombre(2024)}\\times 2=${miseEnEvidence(texNombre(4048))}$`
            reponse = 4048
          } else {
            texte = `Le triple de $${texNombre(2024)}$`
            texteCorr = `$${texNombre(2024)}\\times 3=${miseEnEvidence(texNombre(6072))}$`
            reponse = 6072
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += !this.interactif
            ? '.'
            : ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteAvant: `${sp()}:` },
              )
          this.listeCanEnonces.push(texte)

          break
        case 3:
          {
            // De CM à Terminale - Degré de difficulté variant
            const a = randint(1, 29, [10, 20]) / choice([10, 100])
            reponse = 20224 - a
            texte = `$${texNombre(2024)}-${texNombre(a, 2)}$`
            texteCorr = `$${texNombre(2024)}-${texNombre(a, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 4: // De 5ème à Terminale : Difficulté ?
          {
            // const b = choice([2, 3, 4, 5, 10, 20, 100, 1000])
            // EE : J'enlève 3 et 4 car en calcul mental, ce n'est pas simple, je trouve !

            const b = choice([2, 5, 10, 20, 100, 1000])
            if (choice([true, false])) {
              texte = `Quel est le plus grand entier multiple de $${texNombre(b)}$ strictement inférieur à $${texNombre(2024)}$${sp()}?`
              if (2024 % b === 0) {
                reponse = 2024 - b
                texteCorr = `Comme $${texNombre(2024)}$ est lui-même divisible par $${texNombre(b)}$, le plus grand multiple cherché est $${texNombre(2024)}-${texNombre(b)}=${miseEnEvidence(texNombre(reponse))}$.`
              } else {
                reponse = Math.floor(2024 / b) * b
                texteCorr = `Comme $${texNombre(b)}\\times ${texNombre(Math.floor(2024 / b))} =${texNombre(Math.floor(2024 / b) * b)} < ${texNombre(2024)}$ et
          $ ${texNombre(b)}\\times${texNombre(Math.floor(2024 / b) + 1)}=${texNombre(Math.floor(2024 / b + 1) * b)} > ${texNombre(2024)}$,
          alors le plus grand multiple cherché est $${miseEnEvidence(texNombre(reponse))}$.`

                // EE : Elle est chaude cette correction ci-dessus.... On pourrait la simplifier.
              }
            } else {
              texte = `Quel est le plus petit entier multiple de $${texNombre(b)}$ strictement supérieur à $${texNombre(2024)}$${sp()}?`
              if (2024 % b === 0) {
                reponse = 2024 + b
                texteCorr = `Comme $${texNombre(2024)}$ est lui-même divisible par $${b}$, le plus petit multiple cherché est $${texNombre(2024)}+${b}= ${texNombre(2024)}+${b}=${miseEnEvidence(reponse)}$.`
              } else {
                reponse = Math.ceil(2024 / b) * b
                texteCorr = ` Comme $${b}\\times ${texNombre(Math.ceil(2024 / b) - 1)} =${texNombre(Math.ceil(2024 / b) * b - b)} < ${texNombre(2024)}$ et
                $ ${b}\\times${texNombre(Math.ceil(2024 / b))}=${texNombre(Math.ceil(2024 / b) * b)} > ${texNombre(2024)}$,
                alors le plus petit multiple cherché est $${miseEnEvidence(texNombre(reponse))}$.`
              }
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('')
          }
          break

        case 5:
          {
            // De 5ème à Terminale : Pas toujours évident pour les petites classes
            // Je crée une nouvelle question 76 avec une somme plus simple pour les collégiens.
            // const a = randint(78, 299, [100, 200])
            const a = randint(7, 29, [10, 20]) * 10 + randint(1, 9)
            texte = `$${texNombre(2024)}+${a}$`
            reponse = 2024 + a
            texteCorr = `$${texNombre(2024)}+${a}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 6:
          {
            // De CM à Terminale
            const a = randint(25, 60)
            texte = `$${texNombre(2024)}-${a}$`
            reponse = 2024 - a
            texteCorr = `$${texNombre(2024)}-${a}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 7:
          {
            // De 4ème à Terminale : Difficile pour 4e, moyenne pour 3ème, Facile ensuite
            const a = randint(25, 60)
            texte = `$${a}-${texNombre(2024)}$`
            reponse = a - 2024
            texteCorr = `$${a}-${texNombre(2024)}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 8:
          {
            // De 3ème à Terminale
            // EE : ai modifié cette question pour la rendre aléatoire et ne pas avoir que 2024
            const exposant = randint(0, 2)
            const a = 2024 / 10 ** exposant
            texte = `Écriture scientifique de $${texNombre(a)}$`
            reponse = `2,024\\times 10^{${3 - exposant}}`
            texteCorr = `L'écriture scientifique de $${texNombre(a)}$ est $${miseEnEvidence(`${reponse}`)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 9:
          {
            // De CM à Terminale : Facile
            const calc = [10, 100, 1000]
            const calc1 = choice(calc)
            texte = ` $${texNombre(2024)}\\times ${texNombre(calc1)}$`
            texteCorr = `$${texNombre(2024)}\\times ${texNombre(calc1)}=${miseEnEvidence(texNombre(2024 * calc1, 0))}$`
            reponse = arrondi(calc1 * 2024, 0)
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 10:
          {
            const a = 1 / choice([10, 100, 1000])
            texte = ` $${texNombre(2024)}\\times ${texNombre(a, 3)}$`
            texteCorr = `$${texNombre(2024)}\\times ${texNombre(a, 3)}=${miseEnEvidence(texNombre(2024 * Number(a), 3))}$`
            reponse = (a * 2024).toFixed(3)
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 11:
          {
            const a = 2024 / choice([10, 100, 1000])
            const calc = [10, 100, 1000]
            const calc1 = choice(calc)
            const choix = choice([true, false])
            const calc2 = 1 / calc1
            reponse = (a * (choix ? calc1 : calc2)).toFixed(6)
            // arrondi(a * (choix ? calc1 : calc2), 3)
            texte = `$${texNombre(a, 3)}\\times ${texNombre(choix ? calc1 : calc2)}$`
            texteCorr = ` $${texNombre(a, 3)}\\times ${texNombre(choix ? calc1 : calc2)}=${miseEnEvidence(texNombre(a * (choix ? calc1 : calc2), 6))}$ `
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 12:
          {
            const choix = choice([true, false])
            if (choix) {
              reponse = 20.24
              texte = `$${texNombre(2024)}\\text{ cm}$ $=$`

              texteCorr = `
          Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $1\\text{ cm}$ $=0,01\\text{ m}$.<br>
          Ainsi $${texNombre(2024)}\\text{ cm}=${miseEnEvidence(texNombre(2024 / 100, 2))}\\text{ m}$.  `
              handleAnswers(this, index, { reponse: { value: reponse } })
              if (this.interactif) {
                texte +=
                  ajouteChampTexteMathLive(
                    this,
                    index,
                    KeyboardType.clavierNumbers,
                  ) + '$\\text{ m}$'
              } else {
                texte += ' $\\ldots\\text{ m}$'
              }
              this.listeCanEnonces.push('Compléter.')
              this.listeCanReponsesACompleter.push(
                `$${texNombre(2024)}\\text{ cm}$ $=$ $~~\\ldots~~\\text{ m}$`,
              )
            } else {
              reponse = 202400
              texte = `$${texNombre(2024)}\\text{ m}$ $=$ `
              texteCorr = ` Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $${texNombre(2024)}\\text{ m}=${miseEnEvidence(texNombre(202400))}\\text{ cm}$.`
              handleAnswers(this, index, { reponse: { value: reponse } })
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  { texteApres: '$\\text{ cm}$' },
                )
              } else {
                texte += ' $\\ldots\\text{ cm}$'
              }
              this.listeCanEnonces.push('Compléter.')
              this.listeCanReponsesACompleter.push(
                `$${texNombre(2024)}\\text{ m}$ $=$ $~~\\ldots~~\\text{ cm}$`,
              )
            }
          }
          break
        case 13:
          {
            // J'ai mis des cas différents selon les niveaux
            let a
            switch (niveauAttendu) {
              case 7:
              case 6:
                a = choice([2, 10, 100, 1000, 2000])
                break
              case 5:
              case 4:
                a = choice([2, 4, 10, 20, 100, 1000, 2000])
                break
              case 3:
                a = choice([2, 3, 4, 10, 20, 100, 1000, 2000])
                break
              default:
                a = choice([2, 3, 4, 5, 10, 20, 50, 100, 1000, 2000])
                break
            }

            reponse = 2024 % a
            texte = `Quel est le reste de la division euclidienne de $${texNombre(2024)}$ par $${texNombre(a)}$${sp()}?`
            if (reponse === 0) {
              texteCorr = `$${texNombre(2024)}$ est divisible par $${a}$, donc le reste est $${miseEnEvidence(0)}$.`
            } else {
              texteCorr = `$${texNombre(2024)}=${texNombre(a)}\\times ${texNombre((2024 - reponse) / a, 0)}+${reponse}$<br>
            Donc le reste est $${miseEnEvidence(reponse)}$.`
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 14:
          {
            const a = 2024 / choice([10, 100])
            const b = randint(1, 20)
            texte = ` $${texNombre(a, 2)}-${b}$`
            reponse = a - b
            texteCorr = `$${texNombre(a, 2)}-${b}=${miseEnEvidence(texNombre(reponse, 2))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 15:
          {
            const a = 2024 / choice([10000, 1000])
            const b = randint(3, 10)
            texte = ` $${texNombre(a, 4)}-${b}$`
            reponse = a - b
            texteCorr = `$${texNombre(a, 4)}-${b}=${miseEnEvidence(texNombre(reponse, 4))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(4) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: ' =',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 16:
          {
            const a = 2024
            const b = randint(11, 59, [20, 30, 40, 50])
            const c = a / 10
            const d = b / 100
            const e = a / 100
            const f = b / 10
            if (choice([true, false])) {
              reponse = c + d
              texte = `Écrire sous forme décimale $\\dfrac{${texNombre(a)}}{10}+\\dfrac{${b}}{100}$. `
              texteCorr = `$\\dfrac{${texNombre(a)}}{10}+\\dfrac{${b}}{100}=${texNombre(a / 10, 1)}+${texNombre(b / 100, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$<br>`
            } else {
              reponse = e + f
              texte = `Écrire sous forme décimale $\\dfrac{${b}}{10}+\\dfrac{${texNombre(a)}}{100}$. `
              texteCorr = `$\\dfrac{${b}}{10}+\\dfrac{${texNombre(a)}}{100}=${texNombre(b / 10, 1)}+${texNombre(a / 100, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$<br>`
            }
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 17:
          {
            const a = randint(2040, 2080)
            const prenom = prenomF(1)
            texte =
              'Si ' +
              prenom +
              ` naît en $2024$, quel âge aura-t-elle en $${a}$${sp()}?`
            reponse = a - 2024
            texteCorr =
              prenom +
              ` aura $(${a}-${2024})$ ans, soit $${miseEnEvidence(texNombre(reponse))}$ ans.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' ans',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 18:
          {
            let d, abs0, abs1, abs2, x1, nbIntervalles
            if (choice([true, false])) {
              abs0 = 2000
              abs1 = abs0 + 24
              abs2 = abs0 + 48
              x1 = choice([0.25, 0.5, 0.75, 1.25, 1.5, 1.75])
              d = droiteGraduee({
                Unite: 4,
                Min: 0,
                Max: 2.1,
                thickSecDist: 0.25,
                axeStyle: '->',
                pointTaille: 4,
                pointStyle: 'x',
                labelsPrincipaux: false,
                thickSec: true,
                labelListe: [
                  [0, `${stringNombre(abs0)}`],
                  [1, `${stringNombre(abs1)}`],
                  [2, `${stringNombre(abs2)}`],
                ],
                pointListe: [[x1, '']],
              })
              nbIntervalles = 4
            } else {
              abs0 = 2000
              abs1 = 2024
              abs2 = 2048
              x1 = choice([1 / 3, 2 / 3, 4 / 3, 5 / 3])
              d = droiteGraduee({
                Unite: 4,
                Min: 0,
                Max: 2.1,
                thickSecDist: 0.3333,
                axeStyle: '->',
                pointTaille: 4,
                pointStyle: 'x',
                labelsPrincipaux: false,
                thickSec: true,
                labelListe: [
                  [0, `${stringNombre(abs0)}`],
                  [1, `${stringNombre(abs1)}`],
                  [2, `${stringNombre(abs2)}`],
                ],
                pointListe: [[x1, '']],
              })
              nbIntervalles = 3
            }
            reponse = 24 * x1 + abs0
            texteCorr = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a $${nbIntervalles}$ intervalles.<br>
                     Une graduation correspond donc à $8$ unités. Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(reponse))}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(0) },
            })
            texte = "Déterminer l'abscisse du point $A$ ci-dessous"
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  { texteAvant: `${sp()}:` },
                )
            texte +=
              '<br>' +
              mathalea2d(
                {
                  xmin: -0.9,
                  ymin: -1.5,
                  xmax: 10,
                  ymax: 1.5,
                  pixelsParCm: 30,
                  scale: 0.6,
                },
                texteParPosition(
                  'A',
                  4 * Number(x1),
                  0.8,
                  0,
                  bleuMathalea,
                  1.5,
                ),
                d,
              )
            this.listeCanEnonces.push(texte)
          }
          break
        case 19:
          {
            let d, abs0, abs1, abs2, x1
            if (choice([true, false])) {
              abs0 = 2023
              abs1 = 2024
              abs2 = 2025
              x1 = choice([0.25, 0.5, 0.75, 1.25, 1.5, 1.75])
              d = droiteGraduee({
                Unite: 4,
                Min: 0,
                Max: 2.1,
                thickSecDist: 0.25,
                axeStyle: '->',
                pointTaille: 4,
                pointStyle: 'x',
                labelsPrincipaux: false,
                thickSec: true,
                labelListe: [
                  [0, `${stringNombre(abs0)}`],
                  [1, `${stringNombre(abs1)}`],
                  [2, `${stringNombre(abs2)}`],
                ],
                pointListe: [[x1, '']],
              })
              reponse = x1 + abs0
              texteCorr = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a $4$ intervalles.<br>
             Une graduation correspond donc à $0,25$ unité. Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(reponse, 2))}$.`
            } else {
              abs0 = 2023
              abs1 = 2024
              abs2 = 2025
              x1 = choice([0.2, 0.4, 0.6, 0.8, 1.2, 1.4, 1.6, 1.8])
              d = droiteGraduee({
                Unite: 4,
                Min: 0,
                Max: 2.1,
                thickSecDist: 0.2,
                axeStyle: '->',
                pointTaille: 4,
                pointStyle: 'x',
                labelsPrincipaux: false,
                thickSec: true,
                labelListe: [
                  [0, `${stringNombre(abs0)}`],
                  [1, `${stringNombre(abs1)}`],
                  [2, `${stringNombre(abs2)}`],
                ],
                pointListe: [[x1, '']],
              })
              reponse = abs0 + x1
              texteCorr = `Entre $${texNombre(abs0)}$ et $${texNombre(abs1)}$, il y a $5$ intervalles.<br>
             Une graduation correspond donc à $0,2$ unité. Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(reponse, 2))}$.`
            }
            texte = "Déterminer l'abscisse du point $A$ ci-dessous"
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  { texteAvant: `${sp()}:` },
                )
            texte +=
              '<br>' +
              mathalea2d(
                {
                  xmin: -0.7,
                  ymin: -1.5,
                  xmax: 10,
                  ymax: 1.5,
                  pixelsParCm: 35,
                  scale: 0.75,
                },
                texteParPosition('A', 4 * Number(x1), 0.8, 0, bleuMathalea, 2),
                d,
              )
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(2) },
            })
            this.listeCanEnonces.push(texte)
          }
          break
        case 20:
          {
            // EE : Changement selon le niveau attendu
            const n = 2024
            let d
            switch (niveauAttendu) {
              case 6:
                d = choice([2, 2024])
                break
              case 5:
              case 4:
                d = choice([2, 2, 2024])
                break
              default:
                d = choice([-1, 1, 2024, 2, -2024, -2])
                break
            }
            reponse = new FractionEtendue(2024, d).simplifie()
            texte = `Écrire le plus simplement possible${sp()}: $\\dfrac{${texNombre(n)}}{${texNombre(d)}}$`
            texteCorr = `$\\dfrac{${texNombre(n)}}{${texNombre(d)}}=${miseEnEvidence(reponse)}$`
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionIrreductible: true },
              },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteAvant: ' =' },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 21:
          {
            const a = randint(-5, 5, [0, -1, 1])
            reponse = randint(-9, 9, [-1, 0, 1])
            const b = -a * reponse + 2024
            texte = `Donner la solution de l'équation${sp()}: $${a}x+${texNombre(b)}=${texNombre(2024)}$.`
            texteCorr = `On procède par étapes successives.<br>
              On commence par isoler $${a}x$ dans le membre de gauche en ajoutant
              $${ecritureAlgebrique(-b)}$ dans chacun des membres, puis on divise
              par $${a}$ pour obtenir la solution${sp()}: <br>
              $\\begin{aligned}
              ${a}x${ecritureAlgebrique(b)}&=${texNombre(2024)}\\\\
             ${a}x&=${texNombre(2024)}${ecritureAlgebrique(-b)}\\\\
             ${a}x&=${texNombre(2024 - b)}\\\\
             x&=\\dfrac{${texNombre(2024 - b)}}{${a}}\\\\
             x&=${reponse}
             \\end{aligned}$<br>
             La solution de l'équation est${sp()}: $${miseEnEvidence(reponse)}$.
             `
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += this.interactif ? '<br>' : ''
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: sp(10) + '$x=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 22:
          {
            // niveau premiere facile
            const nom = creerNomDePolygone(2, ['PQDO'])
            const b = randint(-5, 5) * 2
            const c = randint(-5, 5) * 2
            texte = `Dans un repère du plan, on donne $${nom[0]}(${texNombre(2024)}\\,;\\,${c})$ et $${nom[1]}(${b}\\,;\\,${texNombre(2024)})$.<br>
        Déterminer les coordonnées du milieu de $[${nom[0] + nom[1]}]$`
            texteCorr = `Les coordonnées du milieu sont données par${sp()}:
        $\\left(\\dfrac{${texNombre(2024)}${ecritureAlgebrique(b)}}{2};\\dfrac{${c}+${texNombre(2024)}}{2}\\right)=
        \\left(\\dfrac{${texNombre(2024 + b, 0)}}{2};\\dfrac{${texNombre(c + 2024, 0)}}{2}\\right)=
        ${miseEnEvidence(`(${texNombre((2024 + b) / 2, 1)};${texNombre((c + 2024) / 2, 1)})`)}$.<br>`
            reponse = `(${arrondi((2024 + b) / 2, 1)};${arrondi((c + 2024) / 2, 1)})`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierFullOperations,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 23:
          {
            const a = randint(-9, -4)
            const c = randint(2, 5)
            texte = `$f(x)=${a}x+${texNombre(2024)}$<br>
         Calculer $f(${c})$.`
            reponse = a * c + 2024
            texteCorr = `$f(${c})=${a}\\times ${c}+${texNombre(2024)}$<br>`
            texteCorr += `$f(${c})=${a * c}+${texNombre(2024)}$<br>`
            texteCorr += `$f(${c})=${miseEnEvidence(texNombre(reponse))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: sp(10) + `$f(${c})=$`,
              },
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push(`$f(${c})=\\ldots$`)
          }
          break
        case 24:
          {
            // EE : J'enlève le cas 2024 car sinon, on peut se retrouver avec une question identique à la 20
            // const n1 = choice([-2024, 2024])
            const n1 = -2024
            const d1 = choice([-1, 1])
            // const n2 = choice([-2024, 2024])
            const d2 = n1 * choice([-1, 1])
            if (choice([true, false])) {
              reponse = new FractionEtendue(n1, d1).simplifie()
              texte = `Écrire le plus simplement possible${sp()}: $\\dfrac{${texNombre(n1)}}{${texNombre(d1)}}$`
              texteCorr = `$\\dfrac{${texNombre(n1)}}{${texNombre(d1)}}=${miseEnEvidence(reponse)}$`
            } else {
              reponse = new FractionEtendue(n1, d2).simplifie()
              texte = `Écrire le plus simplement possible${sp()}: $\\dfrac{${texNombre(n1)}}{${texNombre(d2)}}$`
              texteCorr = `$\\dfrac{${texNombre(n1)}}{${texNombre(d2)}}=${miseEnEvidence(reponse)}$`
            }
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionIrreductible: true },
              },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteAvant: ' =' },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 25:
          {
            const a = randint(-10, 10, 0)
            const ant = randint(2020, 2030)
            texte = `Déterminer l'antécédent de $${texNombre(ant)}$ par la fonction $f$ définie par${sp()}: $f(x)=${rienSi1(a)}x+${texNombre(2024)}$.`
            reponse = new FractionEtendue(ant - 2024, a).simplifie()
            texteCorr = `L'antécédent est la solution de l'équation $${rienSi1(a)}x+${texNombre(2024)}=${texNombre(ant)}$.<br>
          Il s'agit de $${miseEnEvidence(reponse.texFSD)}$.`
            // EE : On n'a pas une fonction qui rédige tout seule la rédaction d'une solution d'une équation.
            // texteCorr += '<br>' + resoudre('2*x+4=4*x-5').texteCorr
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionEgale: true },
              },
            })
            texte += !this.interactif
              ? ''
              : '<br>' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: `L'antécédent de $${texNombre(ant)}$ par la fonction $f$ est${sp()}: `,
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 26:
          {
            const a = 2024
            const b = randint(2015, 2033)
            texte = ` Combien de solutions réelles possède l'équation ${choice([true, false]) ? `$-x^2+${texNombre(a)}=${texNombre(b)}$` : `$${texNombre(a)}-x^2=${texNombre(b)}$`}${sp()}?`
            if (a - b > 0) {
              texteCorr = `L'équation est équivalente à $-x^2=${texNombre(b)}-${texNombre(a)}$, soit $x^2=${texNombre(a - b)}$.<br>
            $${a - b}$ étant strictement positif, cette équation a $${miseEnEvidence('2')}$ solutions.`
              reponse = 2
            } else if (a - b === 0) {
              texteCorr = `L'équation est équivalente à $-x^2=${texNombre(b)}-${texNombre(a)}$, soit $x^2=${texNombre(a - b)}$.<br>
            Cette équation a $${miseEnEvidence('1')}$ seule solution réelle${sp()}: $0$.`
              reponse = 1
            } else {
              texteCorr = `L'équation est équivalente à $-x^2=${texNombre(b)}-${texNombre(a)}$, soit $x^2=${texNombre(a - b)}$.<br>
           Cette équation n'a pas de solution réelle ($${miseEnEvidence('0')}$ solution) car $${texNombre(a - b)}<0$.`
              reponse = 0
            }
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierNumbers,
          )
          this.listeCanEnonces.push(texte)
          break
        case 27:
          {
            const prefixes = [
              [10, 'd'],
              [100, 'c'],
              [1000, 'm'],
              [10, 'da'],
              [100, 'h'],
              [1000, 'k'],
            ]
            const unite = choice(['g', 'm'])
            const typeDeQuestion = randint(0, 5)
            const a = 2024
            if (typeDeQuestion < 3) {
              texte = `Compléter avec l'unité qui convient${sp()}: $${texNombre(a, 0)}$ ${unite} $= ${texNombre(a * (prefixes[typeDeQuestion][0] as number))}$ ${this.interactif ? '' : '$\\ldots$'}`
              texteCorr = `$${texNombre(a, 0)}$ ${unite} $= ${texNombre(a * (prefixes[typeDeQuestion][0] as number))}$ `
              this.listeCanReponsesACompleter.push(
                `$${a}$ ${unite} $= ${texNombre(a * (prefixes[typeDeQuestion][0] as number))}$ $\\ldots$`,
              )
            } else {
              texte = `Compléter avec l'unité qui convient${sp()}: $${texNombre(a, 0)}$ ${unite} $= ${texNombre(a / (prefixes[typeDeQuestion][0] as number))}$ ${this.interactif ? '' : '$\\ldots$'}`
              texteCorr = `$${texNombre(a, 0)}$ ${unite} $= ${texNombre(a / (prefixes[typeDeQuestion][0] as number))}$ `
              this.listeCanReponsesACompleter.push(
                `$${a}$ ${unite} $= ${texNombre(a / (prefixes[typeDeQuestion][0] as number))}$ $\\ldots$`,
              )
            }
            texteCorr += `${texteEnCouleurEtGras(prefixes[typeDeQuestion][1] + unite)}`
            this.listeCanEnonces.push("Compléter avec l'unité qui convient. ")
            reponse = [
              `${prefixes[typeDeQuestion][1]}${unite}`,
              `\\operatorname{${prefixes[typeDeQuestion][1]}${unite}}`,
            ]
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (unite === 'm')
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.longueur,
              )
            else
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.masse)
          }
          break
        case 28:
          {
            // EE : J'ai changé la consigne pour que la réponse soit donnée sous forme décimale
            const choix = randint(1, 5)
            if (choix === 1) {
              texte = `À quel nombre décimal est égal $${texNombre(2024)}$ dixièmes${sp()}? `
              reponse = 2024 / 10
              texteCorr = `$${texNombre(2024)}$ dixièmes est égal $${texNombre(2024)}\\div 10=${miseEnEvidence(texNombre(reponse, 1))}$.`
            } else if (choix === 2) {
              texte = `À quel nombre décimal est égal $${texNombre(2024)}$ centièmes${sp()}? `
              reponse = 2024 / 100
              texteCorr = `$${texNombre(2024)}$ centièmes est égal à $${texNombre(2024)}\\div 100=${miseEnEvidence(texNombre(reponse, 2))}$.`
            } else if (choix === 3) {
              texte = `À quel nombre décimal est égal $${texNombre(2024)}$ millièmes${sp()}? `
              reponse = 2024 / 1000
              texteCorr = `$${texNombre(2024)}$ millièmes est égal à $${texNombre(2024)}\\div ${texNombre(1000)}=${miseEnEvidence(texNombre(reponse, 3))}$.`
            } else if (choix === 4) {
              texte = `À quel nombre entier est égal $${texNombre(2024)}$ dizaines${sp()}? `
              reponse = 2024 * 10
              texteCorr = `$${texNombre(2024)}$ dizaines est égal à $${texNombre(2024)}\\times 10=${miseEnEvidence(texNombre(reponse, 0))}$.`
            } else {
              texte = `À quel nombre entier est égal $${texNombre(2024)}$ centaines${sp()}? `
              reponse = 2024 * 100
              texteCorr = `$${texNombre(2024)}$ centaines est égal à $${texNombre(2024)}\\times 100=${miseEnEvidence(texNombre(reponse, 0))}$.`
            }
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('$\\ldots$')
          }
          break
        case 29:
          {
            const a = 2
            const b = 0
            const c = 2
            const d = 4
            const m = choice(['centaines', 'dizaines'])
            const n = a * 1000 + b * 100 + c * 10 + d
            texte = `Quel est le nombre entier de ${m} dans $${texNombre(n)}$${sp()}? `
            if (m === 'centaines') {
              texteCorr = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 10 + b}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(a * 10 + b)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
              reponse = a * 10 + b
            } else {
              texteCorr = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 100 + b * 10 + c}\\times 10+${d}$, il y a $${miseEnEvidence(a * 100 + b * 10 + c)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
              reponse = a * 100 + b * 10 + c
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 30:
          {
            const objets: NestedObjetMathalea2dArray = []
            const a = randint(11, 15) * 100
            const b = 2024
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(5, 0, 'B', 'below')
            const C = pointAbstrait(2.5, 2, 'C', 'below')
            const s1 = segment(A, B)
            const s2 = segment(B, C)
            const s3 = segment(A, C)
            if (choice([true, false])) {
              objets.push(
                codageSegments('||', bleuMathalea, B, C),
                codageSegments('||', bleuMathalea, C, A),
                texteParPosition(
                  '2024 cm',
                  milieu(A, B).x,
                  milieu(A, B).y - 0.7,
                ),
                texteParPosition(
                  `${texNombre(a)} cm`,
                  milieu(B, C).x + 1,
                  milieu(B, C).y + 0.5,
                ),
                s1,
                s2,
                s3,
              )
              texte = `Quel est le périmètre de ce triangle${sp()}?`
              reponse = 2 * a + b
              texteCorr = `Le triangle est isocèle.<br>
            Son périmètre est${sp()}: $2\\times ${texNombre(a)}\\text{ cm}$ $+${texNombre(b)}\\text{ cm}$ $=${miseEnEvidence(texNombre(2 * a + b))}\\text{ cm}$.`
            } else {
              objets.push(
                codageSegments('||', bleuMathalea, B, C),
                codageSegments('||', bleuMathalea, C, A),
                texteParPosition(
                  `${b} cm`,
                  milieu(A, B).x,
                  milieu(A, B).y - 0.7,
                ),
                texteParPosition('?', milieu(B, C).x + 1, milieu(B, C).y + 0.5),
                s1,
                s2,
                s3,
              )
              texte = `Le périmètre de ce triangle est $${texNombre(2 * a + b)}\\text{ cm}$. <br>
            Que vaut la longueur indiquée par le point d'interrogation${sp()}?`
              reponse = a
              texteCorr = `Le triangle est isocèle, il possède donc deux longueurs égales.<br>
                Puisque le périmètre est $${texNombre(2 * a + b)}\\text{ cm}$, on obtient la somme des deux longueurs égales du triangle en effectuant la différence $${texNombre(2 * a + b)}-${texNombre(b)}=${texNombre(2 * a)}\\text{ cm}$.<br>
                On obtient la longueur cherchée en divisant par $2$, soit $${texNombre(2 * a)}\\div 2=${miseEnEvidence(texNombre(a))}\\text{ cm}$.`
            }
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' $\\text{cm}$',
              },
            )
            texte +=
              '<br>' +
              mathalea2d(
                {
                  xmin: -0.5,
                  ymin: -1.5,
                  xmax: 6,
                  ymax: 2.5,
                  scale: 0.7,
                  center: !context.isHtml,
                },
                objets,
              ) +
              "<br>La figure n'est pas à l'échelle."
            handleAnswers(this, index, { reponse: { value: reponse } })
            this.listeCanEnonces.push(texte)
          }
          break
        case 31:
          {
            const choix = choice([true, false])
            const a = randint(1, 4)
            const val = 2024 / choice([10, 100, 1000])
            if (a === 1) {
              texte = `Calculer $${choix ? `4 \\times ${texNombre(val, 3)}\\times 25` : `25 \\times ${texNombre(val, 3)}\\times 4`}$`
              reponse = val * 100
              texteCorr = `$${choix ? `4 \\times ${texNombre(val, 3)}\\times 25` : `25 \\times ${texNombre(val, 3)}\\times 4`}=100 \\times ${texNombre(val, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            } else if (a === 2) {
              texte = `Calculer $${choix ? `2 \\times ${texNombre(val, 3)}\\times 50` : `50 \\times ${texNombre(val, 3)}\\times 2`}$`
              reponse = val * 100
              texteCorr = ` $${choix ? `2 \\times ${texNombre(val, 3)}\\times 50` : `50 \\times ${texNombre(val, 3)}\\times 2`}=100 \\times ${texNombre(val, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            } else if (a === 3) {
              texte = `Calculer $${choix ? `0,25 \\times ${texNombre(val, 3)}\\times 4` : `4 \\times ${texNombre(val, 3)}\\times 0,25`}$`
              reponse = val
              texteCorr = ` $${choix ? `0,25 \\times ${texNombre(val, 3)}\\times 4` : `4 \\times ${texNombre(val, 3)}\\times 0,25`}=1 \\times ${texNombre(val, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            } else {
              texte = `Calculer $${choix ? `4 \\times ${texNombre(val, 3)}\\times 2,5` : `2,5 \\times ${texNombre(val, 3)}\\times 4`}$`
              reponse = val * 10
              texteCorr = ` $${choix ? `4 \\times ${texNombre(val, 3)}\\times 2,5` : `2,5 \\times ${texNombre(val, 3)}\\times 4`}=10 \\times ${texNombre(val, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            }
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 32:
          {
            const val = 2024 / choice([100, 1000])
            const coeff = randint(15, 59, [20, 30, 40, 50])
            const b = 100 - coeff
            const coeff2 = randint(2, 8)
            const b2 = 10 - coeff2
            if (choice([true, false])) {
              texte = `Calculer $ ${coeff}\\times ${texNombre(val, 3)}+ ${b}\\times ${texNombre(val, 3)}$`
              reponse = val * 100
              texteCorr = `$ ${coeff}\\times ${texNombre(val, 3)}+ ${b}\\times ${texNombre(val, 3)}=${texNombre(val, 3)}\\times\\underbrace{(${texNombre(coeff)}+${texNombre(b)})}_{100}=${miseEnEvidence(texNombre(reponse, 3))}$`
            } else {
              texte = `Calculer $ ${coeff2}\\times ${texNombre(val, 3)}+ ${b2}\\times ${texNombre(val, 3)}$`
              reponse = val * 10
              texteCorr = `$ ${coeff2}\\times ${texNombre(val, 3)}+ ${b2}\\times ${texNombre(val, 3)}=${texNombre(val, 3)}\\times\\underbrace{(${texNombre(coeff2)}+${texNombre(b2)})}_{10}=${miseEnEvidence(texNombre(reponse, 3))}$`
            }
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 33:
          {
            const choix = randint(1, 4)
            if (choix === 1) {
              texte = `What is the value of $2^{${texNombre(2024)}}-2^{${texNombre(2023)}}$${sp()}? `
              texteCorr = `$2^{${texNombre(2024)}}-2^{${texNombre(2023)}}=2^{${texNombre(2023)}}(2-1)=${miseEnEvidence(`2^{${texNombre(2023)}}`)}$`
              reponse = '2^{2023}'
            } else if (choix === 2) {
              texte = `What is the value of $2^{${texNombre(2025)}}-2^{${texNombre(2024)}}$${sp()}? `
              texteCorr = `$2^{${texNombre(2025)}}-2^{${texNombre(2024)}}=2^{${texNombre(2024)}}(2-1)=${miseEnEvidence(`2^{${texNombre(2024)}}`)}$`
              reponse = '2^{2024}'
            } else if (choix === 3) {
              texte = `What is the value of $-1^{${texNombre(2024)}}-(-1^{${texNombre(2024)}})$${sp()}? `
              texteCorr = `$-1^{${texNombre(2024)}}-(-1^{${texNombre(2024)}})=-1-(-1)=${miseEnEvidence('0')}$`
              reponse = 0
            } else {
              texte = `What is the value of $\\dfrac{\\left(${texNombre(2024)}^0\\right)^{${texNombre(2024)}}}{\\left(${texNombre(2024)}^{${texNombre(2024)}}\\right)^{0}}$${sp()}? `
              texteCorr = `$\\dfrac{\\left(${texNombre(2024)}^0\\right)^{${texNombre(2024)}}}{\\left(${texNombre(2024)}^{${texNombre(2024)}}\\right)^{0}}
              =\\dfrac{1^{${texNombre(2024)}}}{1}=${miseEnEvidence('1')}$`
              reponse = 1
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 34: //  [a;b] inter [c;d] avec c<b resultat [c;b]
          {
            const a = -2024
            const b = randint(-10, 5)
            const c = a + randint(1, 9)
            const d = 2024
            const choix = choice([true, false])
            const crochet1 = choice([']', '['])
            const crochet2 = choice([']', '['])
            const crochet3 = choice([']', '['])
            const crochet4 = choice([']', '['])
            reponse = `${crochet3}${c};${b}${crochet2}`
            texte = `Donner une écriture simplifiée de
          ${choix ? `$${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}\\,\\cap \\,${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}$` : `$${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}\\,\\cap \\,${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}$`}`
            texteCorr =
              'L’intersection de deux intervalles $I$ et $J$ (notée $I\\cap J$) est l’ensemble qui contient les nombres appartenant à $I$ et à $J$.<br>' +
              `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cap \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cap \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$`} $= ${miseEnEvidence(`${crochet3}${c}\\,;\\,${b}${crochet2}`)}$.<br>
          Les nombres de l'intervalle $${crochet3}${texNombre(c)}\\,;\\,${texNombre(b)}${crochet2}$ appartiennent à l'intervalle $${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}$ et à l'intervalle $${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse, compare: seq([sameInterval()]) },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierEnsemble,
                  {
                    texteAvant: `${sp()}:`,
                  },
                )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('')
          }
          break
        case 35:
          {
            const crochet1 = choice([']', '['])
            const crochet2 = choice([']', '['])
            if (choice([true, false])) {
              texte = `Quel est le plus grand entier relatif appartenant à l'intervalle $${crochet1} ${texNombre(-2024)}\\,;\\,${texNombre(2024)}${crochet2}$${sp()}? `
              texteCorr = `${crochet2 === ']' ? `C'est $${miseEnEvidence(`${texNombre(2024)}`)}$` : `C'est $${miseEnEvidence(`${texNombre(2023)}`)}$`}.`
              reponse = `${crochet2 === ']' ? '2024' : '2023'}`
            } else {
              texte = `Quel est le plus petit entier relatif appartenant à l'intervalle $${crochet1} ${texNombre(-2024)}\\,;\\,${texNombre(2024)}${crochet2}$${sp()}? `
              texteCorr = `${crochet1 === '[' ? `C'est $${miseEnEvidence(`${texNombre(-2024)}`)}$` : `C'est $${miseEnEvidence(`${texNombre(-2023)}`)}$`}.`
              reponse = `${crochet1 === '[' ? '-2024' : '-2023'}`
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          }
          break
        case 36: //
          {
            let solution1
            const a = choice([-2024, 2024])
            const b = choice([-2024, 2024])
            const inégalité = choice(['>', '\\geqslant', '<', '\\leqslant'])
            texte = `Donner l'ensemble $S$ des solutions dans $\\mathbb R$ de l'inéquation
          $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2 ${inégalité} 0$.`
            if (this.interactif) {
              texte +=
                '<br>$S=$' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierEnsemble,
                )
            }
            if (a > 0) {
              texteCorr = `Pour tout réel $x$, $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2$ est positif et s'annule en $${texNombre(b)}$.<br>
            Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
            } else {
              texteCorr = `Pour tout réel $x$, $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2$ est négatif et s'annule en $${texNombre(b)}$.<br>
            Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
            }
            if ((inégalité === '>' && a > 0) || (inégalité === '<' && a < 0)) {
              solution1 = [
                `\\mathbb{R}\\\\{${b}\\}`,
                `\\mathbb{R}\\backslash\\{${b}\\}`,
                `\\mathbb{R}\\setminus\\{${b}\\}`,
                `\\mathbb{R}\\smallsetminus\\{${b}\\}`,
                `]-\\infty;${b}[\\cup]${b};+\\infty[`,
              ]
              texteCorr += `$${miseEnEvidence(`\\mathbb{R}\\smallsetminus\\{${texNombre(b)}\\}`)}$.`
            } else if (
              (inégalité === '\\geqslant' && a > 0) ||
              (inégalité === '\\leqslant' && a < 0)
            ) {
              solution1 = '\\mathbb{R}'
              texteCorr += ` $${miseEnEvidence('\\mathbb{R}')}$.`
            } else if (
              (inégalité === '<' && a > 0) ||
              (inégalité === '>' && a < 0)
            ) {
              solution1 = '\\emptyset'
              texteCorr += ` $${miseEnEvidence('\\emptyset')}$.`
            } else {
              solution1 = [`\\{${b}\\}`, `\\left\\lbrace${b}\\right\\rbrace`]
              texteCorr += ` $${miseEnEvidence(`\\{${texNombre(b)}\\}`)}$.`
            }
            reponse = solution1
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { texteSansCasse: true } },
            })
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('')
          }
          break
        case 37:
          {
            const nbre = choice([-2024, 2024])
            if (choice([true, false])) {
              texte = `Quel est l'opposé de $${texNombre(nbre)}$${sp()}? `
              texteCorr = `L'opposé de $${texNombre(nbre)}$ est $${miseEnEvidence(`${texNombre(-nbre)}`)}$.`
              reponse = -nbre
            } else {
              texte = `Quel est l'inverse de $${texNombre(nbre)}$${sp()}? `
              texteCorr = `L'inverse de $${texNombre(nbre)}$ est $${miseEnEvidence(`\\dfrac{1}{${texNombre(nbre)}}`)}$.`
              if (nbre === 2024) {
                reponse = `\\dfrac{1}{${nbre}}`
              } else {
                reponse = [`-\\dfrac{1}{${-nbre}}`, `\\dfrac{1}{${nbre}}`]
              }
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 38:
          {
            const a = -2024
            let b = randint(6, 15)
            const k = choice([-1, 1]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
            b = b * k
            texte = `$${texNombre(a)}${ecritureAlgebrique(b)}$`
            texteCorr = `$${texNombre(a)}${ecritureAlgebrique(b)} = ${miseEnEvidence(texNombre(a + b))} $`
            reponse = a + b
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 39:
          {
            const choix = randint(1, 4)
            const nbre = choice([-2024, 2024])
            if (choix === 1) {
              texte = `En ajoutant un nombre à $${texNombre(nbre)}$, on trouve $0$. <br>
              Quel est ce nombre${sp()}? `
              texteCorr = ` $${texNombre(nbre)}+${ecritureParentheseSiNegatif(-nbre)}=0$.<br>
              Le nombre est donc $${miseEnEvidence(`${texNombre(-nbre)}`)}$.`
              reponse = -nbre
            } else if (choix === 2) {
              texte = `En multipliant un nombre par $${texNombre(nbre)}$, on trouve $1$. <br>
              Quel est ce nombre${sp()}? `
              texteCorr = ` $${texNombre(nbre)}\\times\\dfrac{1}{${nbre}}=1$.<br>
              Le nombre est donc $${miseEnEvidence(`\\dfrac{1}{${nbre}}`)}$.`
              if (nbre === 2024) {
                reponse = `\\dfrac{1}{${nbre}}`
              } else {
                reponse = [`-\\dfrac{1}{${-nbre}}`, `\\dfrac{1}{${nbre}}`]
              }
            } else if (choix === 3) {
              texte = `En ajoutant un nombre à $${texNombre(nbre)}$, on trouve $-1$. <br>
            Quel est ce nombre${sp()}? `
              texteCorr = ` $${texNombre(nbre)}+${ecritureParentheseSiNegatif(-nbre - 1)}=-1$.<br>
            Le nombre est donc $${miseEnEvidence(`${texNombre(-nbre - 1)}`)}$.`
              reponse = -nbre - 1
            } else {
              texte = `En ajoutant un nombre à $${texNombre(nbre)}$, on trouve $1$. <br>
            Quel est ce nombre${sp()}? `
              texteCorr = ` $${texNombre(nbre)}+${ecritureParentheseSiNegatif(-nbre + 1)}=1$.<br>
            Le nombre est donc $${miseEnEvidence(`${texNombre(-nbre + 1)}`)}$.`
              reponse = -nbre + 1
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 40:
          if (choice([true, false])) {
            texte = `En multipliant un nombre positif par lui-même, on trouve $${texNombre(2024)}$. <br>
                Quel est ce nombre${sp()}? `
            texteCorr = ` $\\sqrt{${texNombre(2024)}}\\times \\sqrt{${texNombre(2024)}}=${texNombre(2024)}$.<br>
                Le nombre est donc $${miseEnEvidence(`\\sqrt{${texNombre(2024)}}`)}$.`
            reponse = '\\sqrt{2024}'
          } else {
            texte = `En multipliant un nombre négatif par lui-même, on trouve $${texNombre(2024)}$. <br>
                Quel est ce nombre${sp()}? `
            texteCorr = ` $-\\sqrt{${texNombre(2024)}}\\times (-\\sqrt{${texNombre(2024)}})=${texNombre(2024)}$.<br>
                Le nombre est donc $${miseEnEvidence(`-\\sqrt{${texNombre(2024)}}`)}$.`
            reponse = '-\\sqrt{2024}'
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierFullOperations,
          )
          this.listeCanEnonces.push(texte)
          break
        case 41:
          {
            const choix = randint(1, 3)
            const nbre = choice([-2024, 2024])
            if (choix === 1) {
              texte = `Écrire $\\sqrt{${ecritureParentheseSiNegatif(nbre)}^2}$ le plus simplement possible`
              texteCorr = ` $\\sqrt{${ecritureParentheseSiNegatif(nbre)}^2}=${miseEnEvidence(`${texNombre(abs(nbre))}`)}$.`
              reponse = abs(nbre)
            } else if (choix === 2) {
              texte = `Écrire $(\\sqrt{${ecritureParentheseSiNegatif(2024)}})^2$ le plus simplement possible`
              texteCorr = ` $(\\sqrt{${ecritureParentheseSiNegatif(2024)}})^2=${miseEnEvidence(`${texNombre(2024)}`)}$.`
              reponse = 2024
            } else {
              texte = `Écrire $\\sqrt{${ecritureParentheseSiNegatif(2024)}}+\\sqrt{${ecritureParentheseSiNegatif(2024)}}$ le plus simplement possible`
              texteCorr = ` $\\sqrt{${ecritureParentheseSiNegatif(2024)}}+\\sqrt{${ecritureParentheseSiNegatif(2024)}}=${miseEnEvidence(`2\\sqrt{${texNombre(2024)}}`)}$.`
              reponse = '2\\sqrt{2024}'
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierFullOperations,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 42:
          {
            const a = choice([-2024, 2024])
            const b = choice([-2024, 2024])
            const c = choice([-2024, 2024])
            texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${texNombre(a)}(x${ecritureAlgebrique(b)})^2${ecritureAlgebrique(c)}$.<br>
          Donner le plus grand intervalle sur lequel la fonction $f$ est croissante`
            if (a > 0) {
              if (b > 0) {
                texteCorr = `On reconnaît la forme canonique d'une fonction polynôme du second degré${sp()}:
                  <br> $f(x)=a(x-\\alpha)^2+\\beta$
              <br> Le changement de variation de la fonction $f$ se fait en $\\alpha$.
              <br> Ici, $f(x)=${reduireAxPlusB(0, a)}(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}$
              <br> Donc, $f(x)=${reduireAxPlusB(0, a)}(x-(\\underbrace{-${texNombre(b)}}_{\\alpha}))^2${ecritureAlgebrique(c)}$, d'où $\\alpha=-${texNombre(b)}$.
             <br> Le coefficient $${a}$ devant la parenthèse est strictement positif, la fonction est donc
             d'abord décroissante puis croissante (la parabole est «${sp()}tournée vers le haut${sp()}»).
             <br> Ainsi, $f$ est croissante sur $${miseEnEvidence(`[${texNombre(-b)} \\, ;\\, +\\infty[`)}$.    `
                reponse = [`]-${b};+\\infty[`, `[-${b};+\\infty[`]
              } else {
                texteCorr = `On reconnaît la forme canonique d'une fonction polynôme du second degré${sp()}:
                  <br>$f(x)=a(x-\\alpha)^2+\\beta$
               <br> Le changement de variation de la fonction $f$ se fait en $\\alpha$.
               <br>
               Ici, $f(x)=${reduireAxPlusB(0, a)}(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}$, d'où $\\alpha=${texNombre(-b)}$.
               <br> Le coefficient $${texNombre(a)}$ devant la parenthèse est strictement positif, la fonction est donc
              d'abord décroissante puis croissante (la parabole est «${sp()}tournée vers le haut${sp()}»).
              <br> Ainsi, $f$ est croissante sur $${miseEnEvidence(`[${texNombre(-b)} \\, ;\\, +\\infty[`)}$. `
                reponse = [`]${-b};+\\infty[`, `[${-b};+\\infty[`]
              }
            } else {
              // a < 0
              if (b > 0) {
                texteCorr = `On reconnaît la forme canonique d'une fonction polynôme du second degré${sp()}:
                  <br>$f(x)=a(x-\\alpha)^2+\\beta$<br>
              Le changement de variation de la fonction $f$ se fait en $\\alpha$.
              <br> Ici, $f(x)=${reduireAxPlusB(0, a)}(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}$
              <br> Donc, $f(x)=${reduireAxPlusB(0, a)}(x-(\\underbrace{-${texNombre(b)}}_{\\alpha}))^2${ecritureAlgebrique(c)}$, d'où $\\alpha=-${texNombre(b)}$.
             <br> Comme le coefficient $${texNombre(a)}$ devant la parenthèse est strictement négatif, la fonction est d'abord croissante puis décroissante (la parabole est «${sp()}tournée vers le bas${sp()}»).
             <br> Ainsi, $f$ est croissante sur $${miseEnEvidence(`]-\\infty \\, ;\\, ${texNombre(-b)}]`)}$.    `
                reponse = [`]-\\infty;-${b}[`, `]-\\infty;-${b}]`]
              } else {
                texteCorr = `On reconnaît la forme canonique d'une fonction polynôme du second degré${sp()}:
                  <br> $f(x)=a(x-\\alpha)^2+\\beta$
                  <br> Le changement de variation de la fonction $f$ se fait en $\\alpha$.
               <br> Ici, $f(x)=${reduireAxPlusB(0, a)}(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}$, d'où $\\alpha=${texNombre(-b)}$.
               <br> Comme le coefficient $${texNombre(a)}$ devant la parenthèse est strictement négatif, la fonction est d'abord croissante puis décroissante (la parabole est «${sp()}tournée vers le bas${sp()}»).
               Ainsi, $f$ est croissante sur $${miseEnEvidence(`]-\\infty \\, ;\\, ${texNombre(-b)}]`)}$. `
                reponse = [`]-\\infty;${-b}[`, `]-\\infty;${-b}]`]
              }
            }
            handleAnswers(this, index, {
              reponse: { value: reponse, compare: seq([sameInterval()]) },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierEnsemble,
                  {
                    texteAvant: `${sp()}:`,
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 43:
          {
            const date = randint(27, 30)
            const nbre = randint(1, 23)
            texte = `Nous étions le $${date}$ décembre $2023$. Il était $${nbre}$ h${nbre < 12 ? ' du matin' : ''}.<br>
                  Combien d'heures fallait-il attendre avant de pouvoir se souhaiter la nouvelle année $2024$ (à minuit le $31$ décembre $2023$)${sp()}? <br>`
            texteCorr = ` Jusqu'au $${date}$ décembre minuit, il y a $${24 - nbre}$ heures. <br>
              Du $${date + 1}$ ($0$ h) au $31$ décembre (minuit), il y a $${31 - date}$ jour${31 - date > 1 ? 's' : ''}, soit $${24 * (31 - date)}$ heures. <br>
              Il faudra donc attendre $${24 * (31 - date)}+${24 - nbre}$ heures, soit $${miseEnEvidence(24 * (31 - date) + 24 - nbre)}$ heures avant de se souhaiter la bonne année.
             `
            reponse = 24 * (31 - date) + 24 - nbre
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' heures',
              },
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('$\\ldots$ heures')
          }
          break
        case 44: // EE : Pas très aléatoire cette question mais je vois pas comment la modifier
          if (choice([true, false])) {
            reponse = '20,4'
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = `Compléter avec un nombre décimal${sp()}:<br>
              $20$ h $24$ min $=$`
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: ' h',
                },
              )
            } else {
              texte = `Compléter avec un nombre décimal${sp()}:<br>
            $20$ h $24$ min $=\\ldots$ h`
            }
            texteCorr = `Un dixième d'heure est égal à $6$ minutes. <br>
            $24$ minutes correspondent donc à $4$ dixièmes d'heure, soit $0{,}4$ h.<br>
            $20$ h $24$ min $= ${miseEnEvidence('20,4')}$ h`
            this.listeCanEnonces.push('Compléter avec un nombre décimal.')
            this.listeCanReponsesACompleter.push(
              ' $20$ h $24$ min $=\\ldots$ heures',
            )
          } else {
            if (!this.interactif) {
              texte = `Compléter${sp()}:<br>
            $20,4$ h $=\\ldots$ h $\\ldots$ min`
            } else {
              texte = `Compléter (en heures/minutes)${sp()}:<br>
            $20,4$ h $=$`
            }
            texteCorr = ` Comme $0,4$ h $=0,4\\times 60$ min $= 24$ min, on en déduit $20,4$ h $=${miseEnEvidence('20\\text{ h }24\\text{ min}')}$.`
            reponse = new Hms({ hour: 20, minute: 24 })
            handleAnswers(this, index, {
              reponse: { value: reponse.toString(), options: { HMS: true } },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )
            this.listeCanEnonces.push('Compléter.')
            this.listeCanReponsesACompleter.push(
              '$20,4$ h $=\\ldots$ h $\\ldots$ min',
            )
          }
          break
        case 45:
          {
            const b = choice([8, 11, 23])
            const c = choice([13, 17, 19, 31])
            if (choice([true, false])) {
              reponse = '0'
              handleAnswers(this, index, { reponse: { value: reponse } })

              texte = `Utiliser l'égalité $${texNombre(2024)} = ${b} \\times ${texNombre(2024 / b, 0)}$ pour donner le reste de la division euclidienne de $ ${texNombre(2024)} $ par $ ${b} $<br>`
              texteCorr = `L'égalité $ ${texNombre(2024)} = ${b} \\times ${texNombre(2024 / b, 0)} $ correspond bien à l'expression de la division euclidienne de $ ${texNombre(2024)} $ par $ ${b} $. <br> Le reste est $${miseEnEvidence(0)}$.`
            } else {
              texte = `Utiliser l'égalité $${texNombre(2024)} = ${c} \\times ${Math.floor(2024 / c)} + ${2024 - c * Math.floor(2024 / c)}$ pour donner le reste de la division euclidienne de $ ${texNombre(2024)} $ par $ ${c} $<br>`
              texteCorr = ` $${2024 - c * Math.floor(2024 / c)}$ est inférieur à $${c}$, l'égalité $ ${texNombre(2024)} = ${c} \\times ${Math.floor(2024 / c)} + ${2024 - c * Math.floor(2024 / c)} $ correspond bien à l'expression de la division euclidienne de $ ${texNombre(2024)} $ par $${c}$. <br>Le reste est donc donné par $${miseEnEvidence(2024 - c * Math.floor(2024 / c))}$.`
              reponse = `${2024 - c * Math.floor(2024 / c)}`
              handleAnswers(this, index, { reponse: { value: reponse } })
            }
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 46:
          {
            const b = choice([8, 11, 23])
            const c = choice([13, 17, 19, 31])
            if (choice([true, false])) {
              reponse = 0
              texte = `Utiliser l'égalité $ ${texNombre(2024)} = ${b} \\times ${texNombre(2024 / b - 1, 0)} + ${b} $ pour donner le reste de la division euclidienne de $ ${texNombre(2024)} $ par $ ${b}$.`
              texteCorr = ` Comme $${b}$ n'est pas inférieur à $${b}$, l'égalité 
              $ ${texNombre(2024)} = ${b} \\times ${texNombre(2024 / b - 1, 0)} + ${b} $ ne traduit pas directement la division euclidienne de $ ${texNombre(2024)} $ par $${b}$. <br>
              Transformons cette égalité en${sp()}: $${texNombre(2024)}= ${texNombre(2024)} = ${b} \\times ${texNombre(2024 / b - 1, 0)} + 1\\times ${b}=${b} \\times ${texNombre(2024 / b, 0)} $ qui montre que le reste de la division euclidienne de $ ${texNombre(2024)} $ par $ ${b} $ est $${miseEnEvidence(0)}$.`
            } else {
              texte = `Utiliser l'égalité $ ${texNombre(2024)} = ${c} \\times ${Math.floor(2024 / c) - 1} + ${2024 - c * Math.floor(2024 / c) + c} $ pour donner le reste de la division euclidienne de $ ${texNombre(2024)} $ par $ ${c}$.`
              texteCorr = ` Comme $${2024 - c * Math.floor(2024 / c) + c}$ n'est pas inférieur à $${c}$, l'égalité 
              $ ${texNombre(2024)} = ${c} \\times ${Math.floor(2024 / c) - 1} + ${2024 - c * Math.floor(2024 / c) + c} $ ne traduit pas directement l'expression de la division euclidienne de $ ${texNombre(2024)} $ par $${c}$. <br>
              Transformons cette égalité en${sp()}:
              $${texNombre(2024)}= ${c} \\times ${Math.floor(2024 / c) - 1}+ ${c} + ${2024 - c * Math.floor(2024 / c)}=${c} \\times ${Math.floor(2024 / c)} + ${2024 - c * Math.floor(2024 / c)}$.<br>
              Le reste est donc $${miseEnEvidence(2024 - c * Math.floor(2024 / c))}$.`
              reponse = `${2024 - c * Math.floor(2024 / c)}`
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 47:
          {
            const b = randint(1, 9) / 10
            const r1 = 2024 - b
            const r2 = b - 2024
            if (choice([true, false])) {
              reponse = `${r1.toFixed(1)}x`
              texte = `Réduire l'écriture de $${texNombre(2024)}x -${texNombre(b, 1)}x$`
              texteCorr = `$${texNombre(2024)}x -${texNombre(b, 1)}x= (${texNombre(2024)} -${texNombre(b, 1)})x=${miseEnEvidence(texNombre(r1, 1) + 'x')}$ `
            } else {
              reponse = `${r2.toFixed(1)}x`
              texte = `Réduire l'écriture de $${texNombre(b, 1)}x-${texNombre(2024)}x$`
              texteCorr = `$${texNombre(b, 1)}x-${texNombre(2024)}x=(${texNombre(b, 1)}-${texNombre(2024)})x=${miseEnEvidence(texNombre(r2, 1) + 'x')}$ `
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecX,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 48:
          {
            const puissance = randint(1, 5)
            const puissance10 = 10 ** puissance
            const a = choice([2024, -2024])
            const dec = a / puissance10
            reponse = `\\dfrac{${a}}{10^{${puissance}}}`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte = `Écrire $${texNombre(dec, 5)}$ sous la forme $\\dfrac{a}{10^n}$ avec $a\\in \\mathbb{Z}$ et $n\\in \\mathbb{N}$, $n$ le plus petit possible`
            texteCorr = `$${texNombre(dec, 5)}=${miseEnEvidence(`\\dfrac{${texNombre(a, 0)}}{10^{${puissance}}}`)}$`
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break

        case 49:
          {
            const choix = randint(1, 6)
            switch (choix) {
              case 1:
                texte = `Quel est le chiffre des unités dans $${texNombre(20.24)}$${sp()}?`
                texteCorr = `Le chiffre des unités dans $${texNombre(20.24)}$`
                reponse = '0'
                break
              case 2:
                texte = `Quel est le chiffre des centièmes dans $${texNombre(20.24)}$${sp()}?`
                texteCorr = `Le chiffre des centièmes dans $${texNombre(20.24)}$`
                reponse = '4'
                break
              case 3:
                texte = `Quel est le chiffre des centaines dans $${texNombre(2024)}$${sp()}?`
                texteCorr = `Le chiffre des centaines dans $${texNombre(2024)}$`
                reponse = '0'
                break
              case 4:
                texte = `Quel est le chiffre des dixièmes dans $${texNombre(202.4)}$${sp()}?`
                texteCorr = 'Le chiffre des dixièmes'
                reponse = '4'
                break
              case 5:
                texte = `Quel est le chiffre des dizaines dans $${texNombre(202.4)}$${sp()}?`
                texteCorr = `Le chiffre des dizaines dans $${texNombre(202.4)}$`
                reponse = '0'
                break
              case 6:
              default:
                texte = `Quel est le chiffre des millièmes dans $${texNombre(2.024)}$${sp()}?`
                texteCorr = `Le chiffre des millièmes dans $${texNombre(2.024)}$`
                reponse = '4'
                break
            }
            texteCorr += ` est $${miseEnEvidence(reponse)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 50:
          {
            const choixPG = [
              [0, 2030],
              [1, 2031],
              [2, 2032],
              [3, 2033],
              [4, 2034],
              [5, 2025],
              [6, 2026],
              [7, 2027],
              [8, 2028],
              [9, 2029],
            ]
            // const choixPP = [[0, 2020], [9, 2019], [8, 2018], [7, 2017]]
            const choixPP = [
              [0, 2020],
              [1, 2021],
              [2, 2022],
              [3, 2023],
              [4, 2014],
              [5, 2015],
              [6, 2016],
              [7, 2017],
              [8, 2018],
              [9, 2019],
            ]
            const PlusGrand = choice(choixPG)
            const PlusPetit = choice(choixPP)
            const PGouPP = choice([PlusGrand, PlusPetit])
            texte = `Quel est le plus ${PGouPP === PlusGrand ? 'petit nombre entier strictement supérieur' : 'grand nombre entier strictement inférieur'} à $${texNombre(2024, 0)}$ dont le chiffre des unités est $${PGouPP[0]}$${sp()}?`
            texteCorr = `Le plus ${PGouPP === PlusGrand ? 'petit nombre entier strictement supérieur' : 'grand nombre entier strictement inférieur'} à $${texNombre(2024, 0)}$ dont le chiffre des unités est $${PGouPP[0]}$ est $${miseEnEvidence(texNombre(PGouPP[1]))}$.`
            reponse = PGouPP[1]
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 51:
          {
            const Diviseurs = choice([8, 23, 46, 11, 22, 44])
            const NonDiviseurs = choice([6, 13, 17, 20, 7, 19, 16])
            const choix = choice([Diviseurs, NonDiviseurs])
            const correctionOui = `${texteEnCouleurEtGras('Oui')}, $${choix}$ est un diviseur de $${texNombre(2024, 0)}$ car `
            texte = `$${choix}$ est-il un diviseur de $${texNombre(2024, 0)}$${sp()}?`
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
              texte += '(Répondre par oui (O) ou par non (N).)'
            }
            texte += ` <br>On pourra s'aider de la décomposition en produits de facteurs premiers${sp()}: $${texNombre(2024, 0)}=2^3\\times 11 \\times 23$. `
            if (choix === 13 || choix === 17 || choix === 19 || choix === 7) {
              texteCorr = `$${choix}$ est un nombre premier, il n'apparaît pas dans la décomposition, donc ${texteEnCouleurEtGras('Non')}, $${choix}$ n'est pas un diviseur de $${texNombre(2024, 0)}$.`
            } else if (choix === 16) {
              texteCorr = `${texteEnCouleurEtGras('Non')}, $${choix}$ n'est pas un diviseur de $${texNombre(2024, 0)}$ car $2^4=16$ n'apparaît pas dans la décomposition. `
            } else if (choix === 20) {
              texteCorr = `${texteEnCouleurEtGras('Non')}, $${choix}$ n'est pas un diviseur de $${texNombre(2024, 0)}$ car $10$ n'est pas un diviseur de $${texNombre(2024, 0)}$. `
            } else if (choix === 6) {
              texteCorr = `${texteEnCouleurEtGras('Non')}, $${choix}$ n'est pas un diviseur de $${texNombre(2024, 0)}$ car $3$ n'est pas un diviseur de $${texNombre(2024, 0)}$. `
            } else if (choix === 8) {
              texteCorr = `${correctionOui} $2^3=8$ est un diviseur de $${texNombre(2024, 0)}$ (on le sait grâce à la décomposition).`
            } else if (choix === 23 || choix === 11) {
              texteCorr = `${correctionOui} $${choix}$ apparaît dans la décomposition.`
            } else if (choix === 46) {
              texteCorr = `${correctionOui} $2$ et $23$ sont des diviseurs de $${texNombre(2024, 0)}$ (on le sait grâce à la décomposition).`
            } else if (choix === 22) {
              texteCorr = `${correctionOui} $2$ et $11$ sont des diviseurs de $${texNombre(2024, 0)}$ (on le sait grâce à la décomposition).`
            } else {
              texteCorr = `${correctionOui} $2^2$ et $11$ sont des diviseurs de $${texNombre(2024, 0)}$ (on le sait grâce à la décomposition).`
            }
            reponse = choix === Diviseurs ? ['oui', 'O'] : ['non', 'N']
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { texteSansCasse: true } },
            })
            this.listeCanEnonces.push(texte)
          }
          break

        case 52:
          {
            const choixDiv = choice([
              [10, 'dix'],
              [100, 'cent'],
              [1000, 'mille'],
            ])
            const nbre = choice([2024, 20240, 202.4, 20.24])
            const resultat1 = nbre / (choixDiv[0] as number)
            const resultat2 = nbre * (choixDiv[0] as number)
            const resultat = choice([resultat1, resultat2])
            texte = `Quel est le nombre ${choixDiv[1]} fois plus ${resultat === resultat1 ? 'petit' : 'grand'} que $${texNombre(nbre, 2)}$${sp()}?`
            texteCorr = `Il s'agit de${sp()}: $${resultat === resultat1 ? `${texNombre(nbre, 3)}\\div ${choixDiv[0]}` : `${texNombre(nbre, 3)}\\times ${texNombre(Number(choixDiv[0]))}`}=${miseEnEvidence(texNombre(resultat, 5))}$.`
            reponse = resultat
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(5) },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            this.listeCanEnonces.push(texte)
          }
          break
        case 53:
          {
            const a = choice([2024, -2024])
            const b = choice([2024, -2024])
            const c = choice([-1, 1])
            if (choice([true, false])) {
              texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par${sp()}: $f(x)=\\mathrm{e}^{${reduireAxPlusB(a, b)}}$.<br>
            Donner sa fonction dérivée. `
              texteCorr = `$f$ est de la forme $\\mathrm{e}^{u}$ avec $u(x)=${reduireAxPlusB(a, b)}$. On a donc $u'(x)=${a}$.<br>
            Comme $f'=u'\\mathrm{e}^u$, $f'(x)=${miseEnEvidence(`${texNombre(a)}\\mathrm{e}^{${reduireAxPlusB(a, b)}}`)}$
             `
              reponse = `${a}e^{${reduireAxPlusB(a, b)}}`
            } else {
              texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par${sp()}: $f(x)=${texNombre(a)}\\mathrm{e}^{${rienSi1(c)}x}$.<br>
          Donner sa fonction dérivée. `
              texteCorr = `$f$ est de la forme $\\mathrm{e}^{u}$ avec $u(x)=${rienSi1(c)}x$. On a donc $u'(x)=${c}$.<br>
          Comme $f'=u'\\mathrm{e}^u$, $f'(x)=${miseEnEvidence(`${texNombre(a * c)}\\mathrm{e}^{${rienSi1(c)}x}`)}$
           `
              reponse = `${a * c}e^{${rienSi1(c)}x}`
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                "<br>$f'(x)=$" +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierFonctionsTerminales,
                )
            }
            this.listeCanEnonces.push(texte)
          }
          break
        case 54:
          {
            // EE : Devrait être plus aléatoire en introduisant des -. Je te laisse faire, Gilles. Bon finalement, j'ai fait.
            let a,
              b,
              c,
              aTxt,
              bTxt,
              cTxt,
              choixA,
              choixB,
              choixC,
              signe1,
              signe2
            if (choice([true, false])) {
              texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par${sp()}: `
              texteCorr = "$f'(x)="
              switch (choice([1, 2, 3])) {
                case 1:
                  texte += `$f(x)=x^{${texNombre(2024)}}$`
                  texteCorr = `$f'(x)=${miseEnEvidence(`${texNombre(2024)}x^{${texNombre(2024 - 1)}}`)}$`
                  reponse = '2024x^{2023}'
                  break
                case 2:
                  texte += `$f(x)=x^{${texNombre(2024)}- 1}$`
                  texteCorr = `$f(x)=x^{${texNombre(2024)}- 1}=x^{${texNombre(2024 - 1)}}$<br>`
                  texteCorr += `$f'(x)=${miseEnEvidence(`${texNombre(2024 - 1)}x^{${texNombre(2024 - 2)}}`)}$`
                  reponse = '2023x^{2022}'
                  break
                case 3:
                default:
                  texte += `$f(x)=x^{${texNombre(2024)}+ 1}$`
                  texteCorr = `$f(x)=x^{${texNombre(2024)}+ 1}=x^{${texNombre(2024 + 1)}}$<br>`
                  texteCorr += `$f'(x)=${miseEnEvidence(`${texNombre(2024 + 1)}x^{${texNombre(2024)}}`)}$`
                  reponse = '2025x^{2024}'
                  break
              }
              texte += '.<br>Donner sa fonction dérivée.'
            } else {
              choixA = choice([1, 2, 3])
              a = choixA === 1 ? 2024 : choixA === 2 ? 2024 - 1 : 2024 + 1
              aTxt =
                choixA === 1
                  ? texNombre(2024)
                  : choixA === 2
                    ? `(${texNombre(2024)} - ${texNombre(1)})`
                    : `(${texNombre(2024)} + ${texNombre(1)})`
              choixB = choice([1, 2, 3])
              b = choixB === 1 ? 2024 : choixB === 2 ? 2024 - 1 : 2024 + 1
              bTxt =
                choixB === 1
                  ? texNombre(2024)
                  : choixB === 2
                    ? `(${texNombre(2024)} - ${texNombre(1)})`
                    : `(${texNombre(2024)} + ${texNombre(1)})`
              choixC = choice([1, 2, 3], [choixA, choixB])
              c = choixC === 1 ? 2024 : choixC === 2 ? 2024 - 1 : 2024 + 1
              cTxt =
                choixC === 1
                  ? texNombre(2024)
                  : choixC === 2
                    ? `(${texNombre(2024)} - ${texNombre(1)})`
                    : `(${texNombre(2024)} + ${texNombre(1)})`

              signe1 = choice(['+', '-'])
              signe2 = choice(['+', '-'])
              texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par${sp()}: $f(x)=${aTxt}x^2${signe1}${bTxt}x${signe2}${cTxt}$.<br>
            Donner sa fonction dérivée. `
              texteCorr = `$f(x)=${aTxt}x^2${signe1}${bTxt}x${signe2}${cTxt}`
              texteCorr += `=${a}x^2${signe1}${texNombre(b)}x${signe2}${texNombre(c)}`
              texteCorr += "$<br>$f'(x)="

              texteCorr += `2\\times ${a}x${signe1}${texNombre(b)}=${miseEnEvidence(`${texNombre(2 * a)}x${signe1}${texNombre(b)}`)}$
             `
              reponse = '4048*x+2024'
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                "<br>$f'(x)=$" +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecX,
                )
            }
            this.listeCanEnonces.push(texte)
          }
          break

        case 55:
          {
            const a = choice([-1, 1])
            const c = choice([-1, 1])
            const b = randint(1, 4) * c
            texte = `Quel est le coefficient directeur de la tangente au point d'abscisse $${texNombre(2024)}$ de la courbe d'équation $y=${reduirePolynomeDegre3(0, a, b, 2024)}$${sp()}?`
            texteCorr = `Si $f$ est la fonction définie par $f(x)=${reduirePolynomeDegre3(0, a, b, 2024)}$, le coefficient directeur de la tangente au point d'abscisse $${texNombre(2024)}$ est donné par le nombre dérivé $f'(${texNombre(2024)})$.<br>
              Comme $f'(x)=${reduireAxPlusB(2 * a, b)}$, $f'(${texNombre(2024)})=${texNombre(2 * a)}\\times ${texNombre(2024)}${ecritureAlgebrique(b)}= ${miseEnEvidence(`${texNombre(2 * a * 2024 + b)}`)}$.
               `
            reponse = `${4048 * a + b}`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              )
            }
            this.listeCanEnonces.push(texte)
          }
          break
        case 56:
          {
            const choix = randint(1, 3)
            if (choix === 1) {
              texte = `Calculer $${texNombre(2024)}^2-${texNombre(2023)}^2$`
              texteCorr = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(2024)}$ et $b=${texNombre(2023)}$.<br>
            $${texNombre(2024)}^2-${texNombre(2023)}^2=(${texNombre(2024)}-${texNombre(2023)})(${texNombre(2024)}+${texNombre(2023)})=1\\times ${texNombre(4047)}=${miseEnEvidence(`${texNombre(4047)}`)}$.
                 `
              reponse = '4047'
            } else if (choix === 2) {
              texte = `Calculer $${texNombre(2025)}^2-${texNombre(2024)}^2$`
              texteCorr = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(2025)}$ et $b=${texNombre(2024)}$.<br>
              $${texNombre(2025)}^2-${texNombre(2024)}^2=(${texNombre(2025)}-${texNombre(2024)})(${texNombre(2025)}+${texNombre(2024)})=1\\times ${texNombre(4049)}=${miseEnEvidence(`${texNombre(4049)}`)}$.
                   `
              reponse = '4049'
            } else {
              texte = `Développer $(x-\\sqrt{${texNombre(2024)}})(x+\\sqrt{${texNombre(2024)}})$`
              texteCorr = `On utilise l'égalité remarquable $(a-b)(a+b)=a^2-b^2$ avec $a=x$ et $b=\\sqrt{${texNombre(2024)}}$.<br>
                $(x-\\sqrt{${texNombre(2024)}})(x+\\sqrt{${texNombre(2024)}})=${miseEnEvidence(`x^2-${texNombre(2024)}`)}$.
                     `
              reponse = 'x^2-2024'
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.lyceeClassique,
                  { texteAvant: `${sp()}:` },
                )
            this.listeCanEnonces.push(texte)
          }
          break

        case 57:
          {
            // EE : Ce n'est pas trop aléatoire car le valeur du milieu est toujours la moyenne. Changer mais comment ?
            const choix = randint(1, 2)
            const a = randint(5, 15)
            const c = 2024 - a
            const b = 2024 + a
            const listeNombre1 = [2024, b, c]
            const Nombre1 = shuffle(listeNombre1)
            const listeNombre2 = [2024, 2024 - a, 2024 - 2 * a]
            const Nombre2 = shuffle(listeNombre2)
            if (choix === 1) {
              texte = `On donne la série de nombres${sp()}: $${texNombre(Nombre1[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre1[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre1[2])}$.<br>
              Quelle est la moyenne de cette série${sp()}?`
              texteCorr = `On remarque que $${texNombre(c)}=${texNombre(2024)}-${a}$ et $${texNombre(b)}=${texNombre(2024)}+${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(2024)}`)}$.`
              reponse = '2024'
            } else {
              texte = `On donne la série de nombres${sp()}: $${texNombre(Nombre2[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre2[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre2[2])}$.<br>
            Quelle est la moyenne de cette série${sp()}?`
              texteCorr = `On remarque que $${texNombre(2024)}=${texNombre(2024 - a)}+${a}$ et $${texNombre(2024 - 2 * a)}=${texNombre(2024 - a)}-${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(2024 - a)}`)}$.`
              reponse = `${2024 - a}`
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 58:
          {
            const d = randint(3, 6)
            const u = randint(1, 9)
            const a = d * 10 + u
            const listeResultat = [2024 * a, 2024 * a + 1, 2024 * a - 1]
            const Resultat = shuffle(listeResultat)
            texte = `Recopier le résultat du calcul $${texNombre(2024)}\\times ${a}$ parmi les trois propositions suivantes${sp()}: <br>
            $${texNombre(Resultat[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Resultat[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Resultat[2])}$  `
            texteCorr = `Le chiffre des unités de ce produit est donné par le chiffre des unités de $4\\times ${u}$, soit $${(4 * u) % 10}$.<br>
            Ainsi, $${texNombre(2024)}\\times ${a}=${miseEnEvidence(`${texNombre(2024 * a)}`)}$.
                 `
            reponse = 2024 * a

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `<br>$${texNombre(2024)}\\times ${a}=$`,
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 59:
          {
            const P = prenomF()
            const a = randint(11, 19) * 100
            texte = `${P} a acheté un scooter électrique coûtant $${texNombre(2024)}$ €. 
            Elle règle $${texNombre(a)}$ € à la livraison du scooter puis règlera la moitié du montant restant le mois suivant. <br>
            Quelle somme lui restera-t-il à payer ensuite pour le dernier versement${sp()}?  `
            texteCorr = `Après le premier versement de $${texNombre(a)}$ €, ${P} doit encore payer $${texNombre(2024 - a)}$ €. <br>
            La moitié de $${texNombre(2024 - a)}$ € est $${texNombre((2024 - a) / 2, 0)}$ €. <br>
              Ainsi, son dernier versement sera de $${miseEnEvidence(`${texNombre((2024 - a) / 2, 0)}`)}$ €.
                   `
            reponse = (2024 - a) / 2

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('$\\ldots$ €')
          }
          break

        case 60:
          if (choice([true, false])) {
            texte = `$\\cos(${texNombre(2024)}\\pi)=$ `
            texteCorr = `$\\cos(${texNombre(2024)}\\pi)=\\cos(0)=${miseEnEvidence(1)}$`
            reponse = 1
            this.listeCanReponsesACompleter.push(
              `$\\cos(${texNombre(2024)}\\pi)=\\ldots$`,
            )
          } else {
            texte = `$\\sin(${texNombre(2024)}\\pi)=$ `
            texteCorr = `$\\sin(${texNombre(2024)}\\pi)=\\sin(0)=${miseEnEvidence(0)}$`
            reponse = 0
            this.listeCanReponsesACompleter.push(
              `$\\sin(${texNombre(2024)}\\pi)=\\ldots$`,
            )
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          this.listeCanEnonces.push('Compléter.')

          break

        case 61:
          texte = `En utilisant l'égalité $\\dfrac{${texNombre(2022)}}{3}=674$, compléter${sp()}: `
          if (choice([true, false])) {
            texte += `$\\cos \\dfrac{${texNombre(2024)}\\pi}{3}=$ `
            texteCorr = `$\\cos \\dfrac{${texNombre(2024)}\\pi}{3}=\\cos\\dfrac{${texNombre(2022)}\\pi+2\\pi}{3}=\\cos\\left(674\\pi+\\dfrac{2\\pi}{3}\\right)=
              \\cos\\dfrac{2\\pi}{3}=${miseEnEvidence('-\\dfrac{1}{2}')}$`
            reponse = ['-\\dfrac{1}{2}', '\\dfrac{-1}{2}', '-0,5']
            this.listeCanReponsesACompleter.push(
              `$\\cos \\dfrac{${texNombre(2024)}\\pi}{3}=\\ldots$`,
            )
          } else {
            texte += `$\\sin \\dfrac{${texNombre(2024)}\\pi}{3}=$ `
            texteCorr = `$\\sin \\dfrac{${texNombre(2024)}\\pi}{3}=\\sin\\dfrac{${texNombre(2022)}\\pi+2\\pi}{3}=\\sin\\left(674\\pi+\\dfrac{2\\pi}{3}\\right)=
                \\sin\\dfrac{2\\pi}{3}=${miseEnEvidence('\\dfrac{\\sqrt{3}}{2}')}$`
            reponse = '\\dfrac{\\sqrt{3}}{2}'
            this.listeCanReponsesACompleter.push(
              `$\\sin \\dfrac{${texNombre(2024)}\\pi}{3}=\\ldots$`,
            )
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.lyceeClassique,
            )
          } else {
            texte += '$\\ldots$'
          }
          this.listeCanEnonces.push('Compléter.')
          break

        case 62:
          {
            const choix = randint(1, 3)
            const a = randint(2000, 2023)
            if (choix === 1) {
              texte = `Simplifier l'écriture de $\\dfrac{${texNombre(2024)}}{\\sqrt{${texNombre(2024)}}}$`
              texteCorr = `$\\dfrac{${texNombre(2024)}}{\\sqrt{${texNombre(2024)}}}=\\dfrac{\\sqrt{${texNombre(2024)}}\\times \\sqrt{${texNombre(2024)}}}{\\sqrt{${texNombre(2024)}}}=${miseEnEvidence(`\\sqrt{${texNombre(2024)}}`)}$`
              reponse = '\\sqrt{2024}'
            } else if (choix === 2) {
              texte = `Simplifier l'écriture de $\\sqrt{${texNombre(2024)}}\\times \\sqrt{${texNombre(2024)}}$`
              texteCorr = `$\\sqrt{${texNombre(2024)}}\\times {\\sqrt{${texNombre(2024)}}}=${miseEnEvidence(`${texNombre(2024)}`)}$`
              reponse = 2024
            } else {
              texte = `Simplifier l'écriture de $${texNombre(2024)}\\times \\dfrac{${texNombre(a)}}{${texNombre(2024)}}$`
              texteCorr = `$${texNombre(2024)}\\times \\dfrac{${texNombre(a)}}{${texNombre(2024)}}=\\dfrac{${texNombre(2024)}\\times ${texNombre(a)}}{${texNombre(2024)}}=${miseEnEvidence(`${texNombre(a)}`)}$`
              reponse = a
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('')
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.lyceeClassique,
                  { texteAvant: `${sp()}:` },
                )
          }

          break

        case 63:
          {
            const a = randint(2020, 2028, 2024)
            if (!this.interactif) {
              texte = `On donne l'égalité de la division euclidienne de $${texNombre(2024)}$ par $60$ : $${texNombre(2024)}=33\\times 60+44$.<br>
              Compléter${sp()}: $${texNombre(a, 0)}$ min $=\\ldots$ h $\\ldots$ min.
             `
            } else {
              texte = `On donne l'égalité de la division euclidienne de $${texNombre(2024)}$ par $60$ : $${texNombre(2024)}=33\\times 60+44$.<br>
              Compléter (en heures/minutes)${sp()}: 
                $${texNombre(a, 0)}$ min $=$`
              reponse = new Hms({ hour: 33, minute: (2024 % 60) - (2024 - a) })
              handleAnswers(this, index, {
                reponse: { value: reponse.toString(), options: { HMS: true } },
              })
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierHms,
              )
            }
            texteCorr = ` Le résultat indique qu'il y a $33$ heures pleines dans $${texNombre(2024)}$ min. <br>
              Le reste de la division euclidienne de $${texNombre(2024)}$ par $60$ est $44$.<br>
              Ainsi, `
            if (a > 2024) {
              texteCorr += `$${texNombre(a, 0)}$ min $=33$ h $(44+${texNombre(a - 2024, 0)})$ min.<br>`
            } else {
              texteCorr += `$${texNombre(a, 0)}$ min $=33$ h $(44-${texNombre(2024 - a, 0)})$ min.<br>`
            }
            texteCorr += `Donc, 
              $${texNombre(a, 0)}$ min $=${miseEnEvidence(`33\\text{ h }${(2024 % 60) - (2024 - a)}\\text{ min}`)}$.`
            this.listeCanEnonces
              .push(`On donne l'égalité de la division euclidienne de $${texNombre(2024)}$ par $60$ : $${texNombre(2024)}=33 \\times 60+44$.<br>
            Compléter.`)
            this.listeCanReponsesACompleter.push(
              `$${texNombre(a, 0)}$ min $=\\ldots$ h $\\ldots$ min`,
            )
          }
          break

        case 64:
          {
            const a = randint(1, 3) * choice([-1, 1])
            const b = randint(1, 3) * choice([-1, 1])
            const inconnue = choice(['x', 'y', 'z', 't', 'u'])
            reponse = a * 2024 + b
            texte = `Pour $${inconnue}=${texNombre(2024)}$, calculer $${reduireAxPlusB(a, b, inconnue)}$`
            if (a === 1 || a === -1) {
              texteCorr = `Lorsque $${inconnue}=${texNombre(2024)}$, on a $${reduireAxPlusB(a, b, inconnue)}=${a * 2024}${ecritureAlgebrique(b)}=${miseEnEvidence(`${texNombre(reponse)}`)}$.`
            } else {
              texteCorr = `Lorsque $${inconnue}=${texNombre(2024)}$, on a $${reduireAxPlusB(a, b, inconnue)}=${a}\\times 2024${ecritureAlgebrique(b)}=${miseEnEvidence(texNombre(reponse))}$.`
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break

        case 65:
          {
            const a = randint(-5, 5, 0)
            const fraction = new FractionEtendue(1 + 2 * a, 2024)
            reponse = fraction
            texte = `Calculer sous la forme d'une fraction${sp()}:<br>${context.isHtml ? '' : '\\\\[0.7em]'}
          ${a > 0 ? `$\\dfrac{1}{${texNombre(2024)}} +\\dfrac{${a}}{${texNombre(1012)}}$` : `$\\dfrac{1}{${texNombre(2024)}} -\\dfrac{${-a}}{${texNombre(1012)}}$`}`
            texteCorr = ` $${a > 0 ? `\\dfrac{1}{${texNombre(2024)}} +\\dfrac{${a}}{${texNombre(1012)}}` : `\\dfrac{1}{${texNombre(2024)}} -\\dfrac{${-a}}{${texNombre(1012)}}`}
            =${miseEnEvidence(`\\dfrac{${1 + 2 * a}}{${texNombre(2024)}}`)}$`
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionEgale: true },
              },
            })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break

        case 66:
          {
            const choix = randint(1, 3)
            if (choix === 1) {
              texte = `Calculer $(-1)^{${texNombre(2023)}}+(-1)^{${texNombre(2024)}}+(-1)^{${texNombre(2025)}}$`
              texteCorr = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(2023)}}+(-1)^{${texNombre(2024)}}+(-1)^{${texNombre(2025)}}=-1+1-1=${miseEnEvidence(-1)}$.`
            } else if (choix === 2) {
              texte = `Calculer $\\dfrac{(-1)^{${texNombre(2023)}}}{(-1)^{${texNombre(2024)}}}$`
              texteCorr = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
                Ainsi, $\\dfrac{(-1)^{${texNombre(2023)}}}{(-1)^{${texNombre(2024)}}}=\\dfrac{-1}{1}=${miseEnEvidence(-1)}$.`
            } else {
              texte = `Calculer $(-1)^{${texNombre(2023)}}\\times(-1)^{${texNombre(2024)}}$`
              texteCorr = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
                    Ainsi, $(-1)^{${texNombre(2023)}}\\times(-1)^{${texNombre(2024)}}=-1\\times 1=${miseEnEvidence(-1)}$.`
            }
            reponse = -1
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBase,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break

        case 67:
          {
            const objets: NestedObjetMathalea2dArray = []
            const diviseur = choice([1, 10, 100, 1000])
            const a = 506 / diviseur
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(6, 0, 'B', 'below')
            const C = pointAbstrait(6, 6, 'C', 'below')
            const D = pointAbstrait(0, 6, 'D', 'below')
            const s1 = segment(A, B)
            const s2 = segment(B, C)
            const s3 = segment(C, D)
            const s4 = segment(A, D)

            objets.push(
              latexParCoordonnees(
                `${texNombre(a, 3)} \\text{ cm}`,
                8,
                milieu(B, C).y + 0.7,
                'black',
                0,
                0,
                '',
                9,
              ),
              codageSegments('||', bleuMathalea, A, B),
              codageSegments('||', bleuMathalea, B, C),
              codageSegments('||', bleuMathalea, C, D),
              codageSegments('||', bleuMathalea, A, D),
              codageAngleDroit(D, A, B),
              codageAngleDroit(A, B, C),
              codageAngleDroit(B, C, D),
              codageAngleDroit(C, D, A),
              s1,
              s2,
              s3,
              s4,
            )
            texte = `Quel est le périmètre de ce carré${sp()}? `
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' $\\text{cm}$',
              },
            )
            texte +=
              '<br>' +
              mathalea2d(
                Object.assign(
                  { scale: 0.4, center: !context.isHtml },
                  fixeBordures(objets),
                ),
                objets,
              )
            reponse = a * 4
            texteCorr = `Il s'agit d'un carré. <br>
          Son périmètre est donc
         $4$ fois la longueur de son côté, soit $4\\times ${texNombre(a)}=${miseEnEvidence(`${texNombre(reponse, 3)}`)}\\text{ cm}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })

            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('$\\ldots\\text{ cm}$')
          }
          break

        case 68:
          {
            const nom = creerNomDePolygone(5, ['QD'])
            const a = 2024
            const A = pointAbstrait(0, 0, nom[0], 'below')
            const B = pointAbstrait(6, 0, nom[1], 'below')
            const C = pointAbstrait(5, 4, nom[2], 'above')
            const D = pointAbstrait(2.5, 2, nom[3], 'above')
            const E = pointAbstrait(3, 0, nom[4], 'below')
            const objets: NestedObjetMathalea2dArray = []
            objets.push(
              segment(A, B),
              segment(D, E),
              segment(A, C),
              segment(B, C),
              codageSegments('||', bleuMathalea, A, D, D, C),
              labelPoint(A, B, C, D, E),
            )
            if (choice([true, false])) {
              texte = `$(${nom[3]}${nom[4]})${symboleParallele()}(${nom[1]}${nom[2]})$ et
      $${nom[3]}${nom[4]}=${texNombre(a)}$.<br>
      Calculer $${nom[1]}${nom[2]}$`
              texteCorr = ` Les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$ sont deux fois plus grandes que les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$.<br>
      Le triangle $${nom[0]}${nom[1]}${nom[2]}$ est un agrandissement du triangle $${nom[0]}${nom[3]}${nom[4]}$.<br>
      Ainsi${sp()}: $${nom[1]}${nom[2]}=2\\times ${nom[3]}${nom[4]}=2\\times ${texNombre(a)}=${miseEnEvidence(`${texNombre(2 * a)}`)}$.
  `
              reponse = 2 * a
            } else {
              texte = `$(${nom[3]}${nom[4]})${symboleParallele()}(${nom[1]}${nom[2]})$ et
       $${nom[1]}${nom[2]}=${texNombre(a)}$. <br>
         Calculer $${nom[3]}${nom[4]}$`
              texteCorr = ` Les longueurs du triangle $${nom[0]}${nom[3]}${nom[4]}$ sont deux fois plus petites que les longueurs du triangle $${nom[0]}${nom[1]}${nom[2]}$.<br>
      Le triangle $${nom[0]}${nom[3]}${nom[4]}$ est une réduction du triangle $${nom[0]}${nom[1]}${nom[2]}$. <br>
            Ainsi${sp()}: $${nom[3]}${nom[4]}= ${nom[1]}${nom[2]} \\div 2 = ${texNombre(a)}\\div 2 =${miseEnEvidence(`${texNombre(a / 2, 0)}`)}$.
     `
              reponse = a / 2
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  {
                    texteAvant: ' $=$',
                  },
                )
            texte +=
              '<br>' +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -1,
                  xmax: 8,
                  ymax: 5,
                  scale: 0.7,
                  pixelsParCm: 18,
                  mainlevee: false,
                  center: !context.isHtml,
                },
                objets,
              )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push(`$${nom[1]}${nom[2]}=\\ldots$`)
          }
          break

        case 69:
          {
            const nom = creerNomDePolygone(3, ['QD'])
            const a = randint(1, 6)
            const A = pointAbstrait(0, 0, nom[0], 'below')
            const B = pointAbstrait(6, 0, nom[1], 'below')
            const C = pointAbstrait(6, 2, nom[2], 'above')

            const objets: NestedObjetMathalea2dArray = []

            if (choice([true, false])) {
              objets.push(
                segment(A, B),
                segment(A, C),
                segment(B, C),
                labelPoint(A, B, C),
                codageAngleDroit(A, B, C),
                texteParPosition('$\\sqrt{2024}$', 2.6, 2),
                texteParPosition(`$${a}$`, 6.8, 1),
              )
              texte = `Calculer $${nom[0]}${nom[1]}$`
              texteCorr = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[1]}$.<br>
              On obtient${sp()}:<br>
              $\\begin{aligned}
                ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
                ${nom[0]}${nom[1]}^2&=${nom[0]}${nom[2]}^2-${nom[1]}${nom[2]}^2\\\\
                ${nom[0]}${nom[1]}^2&=(\\sqrt{${texNombre(2024)}})^2-${a}^2\\\\
                ${nom[0]}${nom[1]}^2&=${texNombre(2024)}-${a * a}\\\\
                ${nom[0]}${nom[1]}^2&=${texNombre(2024 - a * a)}\\\\
                ${nom[0]}${nom[1]}&= ${miseEnEvidence(`\\sqrt{${texNombre(2024 - a * a)}}`)}\\\\
                \\end{aligned}$ `
              reponse = `\\sqrt{${2024 - a * a}}`
              this.listeCanReponsesACompleter.push(
                `$${nom[0]}${nom[1]}=\\ldots$`,
              )
            } else {
              objets.push(
                segment(A, B),
                segment(A, C),
                segment(B, C),
                labelPoint(A, B, C),
                codageAngleDroit(A, B, C),
                texteParPosition('$\\sqrt{2024}$', 2.6, -1),
                texteParPosition(`$${a}$`, 6.8, 1),
              )
              texte = `
            Calculer $${nom[0]}${nom[2]}$`
              texteCorr = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$, rectangle en $${nom[1]}$.<br>
                    On obtient${sp()}:<br>
                    $\\begin{aligned}
                      ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
                      ${nom[0]}${nom[2]}^2&=(\\sqrt{${texNombre(2024)}})^2+${a}^2\\\\
                      ${nom[0]}${nom[2]}^2&=${texNombre(2024)}+${a * a}\\\\
                      ${nom[0]}${nom[2]}^2&=${texNombre(2024 + a * a)}\\\\
                      ${nom[0]}${nom[2]}&= ${miseEnEvidence(`\\sqrt{${texNombre(2024 + a * a)}}`)}\\\\
                      \\end{aligned}$ `
              reponse = `\\sqrt{${2024 + a * a}}`
              this.listeCanReponsesACompleter.push(
                `$${nom[0]}${nom[2]}=\\ldots$`,
              )
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.lyceeClassique,
                  {
                    texteAvant: ' $=$',
                  },
                )
            texte +=
              '<br>' +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -2,
                  xmax: 8,
                  ymax: 3,
                  scale: 0.7,
                  pixelsParCm: 18,
                  mainlevee: false,
                  center: !context.isHtml,
                },
                objets,
              )
            this.listeCanEnonces.push(texte)
          }
          break

        case 70:
          {
            let reponse
            const choix = randint(1, 5)
            if (choix === 1) {
              texte =
                `Quel est le plus grand nombre entier de quatre chiffres que l'on peut écrire en utilisant, une seule fois, les quatre chiffres${sp()}: $2$, $0$, $2$ et $4$${sp()}?`
              reponse = 4220
            } else {
              texte = 'Quel est le plus grand nombre entier de '
              switch (choix) {
                case 2:
                  texte += 'cinq'
                  reponse = 44222
                  break
                case 3:
                  texte += 'six'
                  reponse = 442222
                  break
                case 4:
                  texte += 'sept'
                  reponse = 4422220
                  break
                case 5:
                default:
                  texte += 'huit'
                  reponse = 44222200
                  break
              }
              texte +=
                ` chiffres que l'on peut écrire en utilisant, deux fois maximum, les quatre chiffres${sp()}: $2$, $0$, $2$ et $4$${sp()}?`
            }
            texteCorr = ` Le plus grand nombre entier est $${miseEnEvidence(`${texNombre(reponse)}`)}$.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break

        case 71: // Pas d'aléatoire mais question qui demande de réfléchir
          // Attention, les questions sans aléatoires sont problèmatiques car elles font planter la CAN si on la demande deux fois (ce qui est possible en 6ème et CM)
          // Je corrige ici. Faut corriger les autres.
          if (randint(1, 3) === 1) {
            reponse = 'MMXXIV'
            texte =
              `Comment s'écrit l'année actuelle ($2024$) en chiffres romains${sp()}? `
            texteCorr = `$2024=${miseEnEvidence(reponse)}$`
          } else if (choice([true, false])) {
            reponse = 'MMXXV'
            texte =
              `Comment s'écrit l'année prochaine ($2025$) en chiffres romains${sp()}? `
            texteCorr = `$2025=${miseEnEvidence(reponse)}$`
          } else {
            reponse = 'MMXXIII'
            texte =
              `Comment s'écrit l'année dernière ($2023$) en chiffres romains${sp()}? `
            texteCorr = `$2023=${miseEnEvidence(reponse)}$`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.alphanumeric,
          )
          this.listeCanEnonces.push(texte)

          break

        case 72:
          if (randint(1, 3) === 1) {
            reponse = ['oui', 'O']
            texte = `$${texNombre(2024)}$ est-il un multiple de la somme de ses chiffres${sp()}? `
            texteCorr = `La somme des chiffres de $${texNombre(2024)}$ est $8$. <br>
            On a $${texNombre(2024)}\\div 2=${texNombre(1012)}$, <br>
            $${texNombre(1012)}\\div 2=${texNombre(506)}$,<br>
             $${texNombre(506)}\\div 2=${texNombre(253)}$.<br>
            Donc ${texteEnCouleurEtGras('oui')}, $${texNombre(2024)}$ est un multiple de $8$.`
          } else if (choice([true, false])) {
            reponse = ['non', 'N']
            texte = `$${texNombre(2024)}$ est-il un diviseur de la somme de ses chiffres${sp()}?`

            texteCorr = `La somme des chiffres de $${texNombre(2024)}$ est $8$. <br>
            Comme $${texNombre(2024)} >8$, ${texteEnCouleurEtGras('non')}, $${texNombre(2024)}$ n'est pas un diviseur de $8$.`
          } else {
            reponse = ['oui', 'O']
            texte = `La somme des chiffres de $${texNombre(2024)}$ est-elle un diviseur de $${texNombre(2024)}$${sp()}? `

            texteCorr = `La somme des chiffres de $${texNombre(2024)}$ est $8$. <br>
            On a $${texNombre(2024)}\\div 2=${texNombre(1012)}$, <br>
            $${texNombre(1012)}\\div 2=${texNombre(506)}$,<br>
             $${texNombre(506)}\\div 2=${texNombre(253)}$.<br>
            Donc ${texteEnCouleurEtGras('oui')}, $${texNombre(2024)}$ est un multiple de $8$.`
          }
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { texteSansCasse: true } },
          })

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            texte += '(Répondre par oui (O) ou par non (N).)'
          }
          this.listeCanEnonces.push(texte)

          break

        case 73:
          {
            const a = randint(-2, 2, 0)
            if (a === 1) {
              reponse = [`${a}\\times x`, 'x', '1\\times x', '1x']
            } else if (a === -1) {
              reponse = [`${a}\\times x`, '-x', '-1\\times x', '-1x']
            } else {
              reponse = [`${a}\\times x`, `${a}x`]
            }
            texte = `Soit $f$ la fonction linéaire vérifiant $f(${texNombre(2024)})=${texNombre(a * 2024, 0)}$.<br>
          Compléter${sp()}: $f(x)=$ `
            texteCorr = `Une fonction linéaire est une fonction de la forme $f(x)=ax$.<br>
          Comme $f(${texNombre(2024)})=${texNombre(a * 2024)}$, on a $${texNombre(a * 2024, 0)}=a\\times ${texNombre(2024)}$, soit $a=${a}$.<br>
          On obtient donc${sp()}: $f(x)=${miseEnEvidence(`${rienSi1(a)}x`)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecX,
              )
            } else {
              texte += '$\\ldots$'
            }
            this.listeCanEnonces
              .push(`Soit $f$ la fonction linéaire vérifiant $f(${texNombre(2024)})=${texNombre(a * 2024, 0)}$.<br>
          Compléter.`)
            this.listeCanReponsesACompleter.push('$f(x)=\\ldots$')
          }
          break
        case 74:
          {
            const a = choice([-2024, 2024])
            reponse = [`-x+${a}`, `${a}-x`]
            texte = `Soit $f$ la fonction affine vérifiant $f(${texNombre(a, 0)})=0$ et $f(0)=${texNombre(a, 0)}$.<br>
            Compléter${sp()}: $f(x)=$ `
            texteCorr = `Une fonction affine est une fonction de la forme $f(x)=mx+p$.<br>
            Comme $f(0)=${texNombre(a, 0)}$, on a $p=${texNombre(a, 0)}$. Ainsi, $f(x)=mx+${ecritureParentheseSiNegatif(a)}$.<br>
            De plus, $f(${texNombre(a, 0)})=0$, donc $m\\times ${ecritureParentheseSiNegatif(a)}+${ecritureParentheseSiNegatif(a)}=0$, soit $m=-1$.<br>
            On obtient donc${sp()}: $f(x)=${miseEnEvidence(`-x${ecritureAlgebrique(a)}`)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecX,
              )
            } else {
              texte += '$\\ldots$'
            }
            this.listeCanEnonces
              .push(`Soit $f$ la fonction affine vérifiant $f(${texNombre(2024)})=0$ et $f(0)=${texNombre(2024)}$.<br>
            Compléter.`)
            this.listeCanReponsesACompleter.push('$f(x)=\\ldots$')
          }

          break

        case 75:
          {
            const b = randint(2, 10) * 100 + 24
            reponse = (2024 - b) / 100
            texte = `Je pense à un nombre. Je le multiplie par $100$, puis j'ajoute au résultat $${texNombre(b)}$ et j'obtiens $${texNombre(2024)}$. <br>
          Quel est ce nombre${sp()}?`

            texteCorr = `Pour obtenir $${texNombre(2024)}$, on a ajouté $${texNombre(2024 - b)}$ à $${texNombre(b)}$ et le nombre qui, multiplié par $100$ donne $${texNombre(2024 - b)}$ est $${texNombre(reponse)}$.<br>
            Le nombre choisi au départ est donc $${miseEnEvidence(`${reponse}`)}$.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('')
          }
          break

        case 76:
          {
            // De CM à 3eme : Facile
            // En complément à Q5
            const a = randint(1, 9) * 100 + randint(1, 9) * choice([2, 20])
            texte = `$${texNombre(2024)}+${texNombre(a)}$`
            reponse = 2024 + a
            texteCorr = `$${texNombre(2024)}+${texNombre(a)}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 77:
          {
            // De CM à 3eme : Moins Facile
            // En complément à Q5 (avec soustraction)
            const a = randint(1, 9) * 100 + randint(1, 9) * choice([2, 20])
            texte = `$${texNombre(2024)}-${a}$`
            reponse = 2024 - a
            texteCorr = `$${texNombre(2024)}-${a}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 78:
          {
            const exposantB = randint(0, 3)
            const exposantA = randint(0, 3, exposantB)
            const a = 2024 / 10 ** exposantA
            const b = 2024 / 10 ** exposantB
            texte = ` $${texNombre(a, 3)}+${texNombre(b, 3)}$`
            reponse = a + b
            texteCorr = `$${texNombre(a, 3)}+${texNombre(b, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 79:
          {
            const exposantB = randint(1, 3)
            const exposantA = randint(0, exposantB - 1)
            const a = 2024 / 10 ** exposantA
            const b = 2024 / 10 ** exposantB
            texte = ` $${texNombre(a, 3)}-${texNombre(b, 3)}$`
            reponse = a - b
            texteCorr = `$${texNombre(a, 3)}-${texNombre(b, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(3) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 80:
          {
            let tabChiffres: number[] = []
            let a
            do {
              // Pour éviter d'avoir 2024 + 2024, qui aurait été demandé avec le double de 2024
              tabChiffres = shuffle([2, 0, 2, 4])
              a =
                tabChiffres[0] * 1000 +
                tabChiffres[1] * 100 +
                tabChiffres[2] * 10 +
                tabChiffres[3]
              if (tabChiffres[0] === 0) a = a * 10
            } while (a === 2024)
            texte = ` $${texNombre(2024, 0)}+${texNombre(a, 0)}$`
            reponse = 2024 + a
            texteCorr = `$${texNombre(2024, 0)}+${texNombre(a, 0)}=${miseEnEvidence(texNombre(reponse, 4))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 81:
          {
            let tabChiffres = shuffle([2, 0, 2, 4])
            let a =
              tabChiffres[0] * 1000 +
              tabChiffres[1] * 100 +
              tabChiffres[2] * 10 +
              tabChiffres[3]
            if (tabChiffres[0] === 0) a = a * 10
            let b
            do {
              tabChiffres = shuffle([2, 0, 2, 4])
              b =
                tabChiffres[0] * 1000 +
                tabChiffres[1] * 100 +
                tabChiffres[2] * 10 +
                tabChiffres[3]
              if (tabChiffres[0] === 0) b = b * 10
            } while (a === b)
            const tampon = Math.max(a, b)
            b = Math.min(a, b)
            a = tampon
            texte = ` $${texNombre(a, 0)}-${texNombre(b, 0)}$`
            reponse = a - b
            texteCorr = `$${texNombre(a, 0)}-${texNombre(b, 0)}=${miseEnEvidence(texNombre(reponse, 4))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
              {
                texteAvant: ' $=$',
              },
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 82:
          {
            const a = randint(7, 29) * 10 + randint(1, 9, 5)
            const exposant2024 = randint(1, 3)
            const exposantA = a < 100 ? randint(1, 2) : randint(1, 3)
            let aDiv = a / 10 ** exposantA
            let Nb2024Div = 2024 / 10 ** exposant2024
            if (niveauAttendu === 7) {
              if (choice([true, false])) aDiv = a
              else Nb2024Div = 2024
            }
            texte = `Sachant que $${texNombre(a, 0)} \\times ${texNombre(2024, 0)} = ${texNombre(a * 2024, 0)} $, `
            texte += `quelle est la valeur décimale de $${texNombre(aDiv, 3)} \\times ${texNombre(Nb2024Div, 3)}$${sp()}?`
            reponse = aDiv * Nb2024Div
            texteCorr = `$${texNombre(aDiv, 3)} \\times ${texNombre(Nb2024Div, 3)}=${miseEnEvidence(texNombre(reponse, 6))}$`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(6) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
          }
          break
        case 83:
          switch (randint(1, 7)) {
            case 1:
              texte = `Combien vaut $2+0+2+4$${sp()}?`
              reponse = 8
              texteCorr = `$2+0+2+4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 2:
              texte = `Combien vaut $2+0-2+4$${sp()}?`
              reponse = 4
              texteCorr = `$2+0-2+4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 3:
              texte = `Combien vaut $2-0+2-4$${sp()}?`
              reponse = 0
              texteCorr = `$2-0+2-4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 4:
              texte = `Combien vaut $(2 \\times 0)+2+4$${sp()}?`
              reponse = 6
              texteCorr = `$(2 \\times 0)+2+4=0+2+4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 5:
              texte = `Combien vaut $(2 \\times 0) \\times (2+4)$${sp()}?`
              reponse = 0
              texteCorr = `$(2 \\times 0) \\times (2+4)=0 \\times 6=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 6:
              texte = `Combien vaut $(2 + 0) \\times (2+4)$${sp()}?`
              reponse = 12
              texteCorr = `$(2 + 0) \\times (2+4)=2 \\times 6 = ${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 7:
            default:
              texte = `Combien vaut $(2 + 0) \\times (2 \\times 4)$${sp()}?`
              reponse = 16
              texteCorr = `$(2 + 0) \\times (2 \\times 4)=2 \\times 8 = ${miseEnEvidence(texNombre(reponse, 4))}$`
              break
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierNumbers,
          )
          this.listeCanEnonces.push(texte)

          break
        case 84:
          switch (randint(1, 7)) {
            case 1:
              texte = `Combien vaut $${texNombre(2024)} + 20 + 4$${sp()}?`
              reponse = 2048
              texteCorr = `$${texNombre(2024)} + 20 + 4=${texNombre(2044)} + 4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 2:
              texte = `Combien vaut $${texNombre(2024)} + 20 - 4$${sp()}?`
              reponse = 2040
              texteCorr = `$${texNombre(2024)} + 20 - 4=${texNombre(2044)} - 4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 3:
              texte = `Combien vaut $${texNombre(2024)} - 20 - 4$${sp()}?`
              reponse = 2000
              texteCorr = `$${texNombre(2024)} - 20 - 4=${texNombre(2004)} -4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 4:
              texte = `Combien vaut $${texNombre(2024)} - 20 + 4$${sp()}?`
              reponse = 2008
              texteCorr = `$${texNombre(2024)} - 20 + 4=${texNombre(2004)} + 4=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 5:
              texte = `Combien vaut $${texNombre(2024)} - (20 + 4)$${sp()}?`
              reponse = 2000
              texteCorr = `$${texNombre(2024)} - (20 + 4)=${texNombre(2024)} - 24=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 6:
              texte = `Combien vaut $${texNombre(2024)} - (20 \\times 4)$${sp()}?`
              reponse = 1944
              texteCorr = `$${texNombre(2024)} - (20 \\times 4)=${texNombre(2024)} - 80=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
            case 7:
            default:
              texte = `Combien vaut $${texNombre(2024)} + (20 \\times 4)$${sp()}?`
              reponse = 2104
              texteCorr = `$${texNombre(2024)} + (20 \\times 4)=${texNombre(2024)} +80=${miseEnEvidence(texNombre(reponse, 4))}$`
              break
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierNumbers,
          )
          this.listeCanEnonces.push(texte)

          break

        case 85:
          {
            const a = randint(2023, 2025)
            texte = `Calculer $\\dfrac{1}{${texNombre(2024, 0)}}\\div \\dfrac{1}{${texNombre(2024, 0)}}\\div\\dfrac{1}{${texNombre(a, 0)}}$.`
            reponse = a
            texteCorr = `$\\dfrac{1}{${texNombre(2024, 0)}}\\div \\dfrac{1}{${texNombre(2024, 0)}}\\div\\dfrac{1}{${texNombre(a, 0)}}=1\\div \\dfrac{1}{${texNombre(a, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += !this.interactif
              ? '.'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                  {
                    texteAvant: ' $=$',
                  },
                )
            this.listeCanEnonces.push(texte)
          }
          break
        case 86:
          switch (randint(1, 3)) {
            case 1:
              texte = `Exprimer la somme de $a$ et $${texNombre(2024, 0)}$ en fonction de $a$.`
              reponse = '2024+a'
              texteCorr = `La somme de $a$ et $${texNombre(2024, 0)}$ en fonction de $a$ est donnée par $${miseEnEvidence(`${texNombre(2024)}+a`)}$`
              break
            case 2:
              reponse = 'a\\times 2024'
              texte = `Comment peut se noter le produit de $a$ par $${texNombre(2024, 0)}$${sp()}?`

              texteCorr = `Le produit de $a$ par $${texNombre(2024, 0)}$ se note $${miseEnEvidence(`a\\times ${texNombre(2024)}`)}$.`
              break
            case 3:
            default:
              reponse = ['a\\div 2024', '\\dfrac{a}{2024}']
              texte = `Exprimer le quotient de $a$ par $${texNombre(2024, 0)}$.`

              texteCorr = `Le quotient de $a$ par $${texNombre(2024, 0)}$ se note $${miseEnEvidence(`\\dfrac{a}{${texNombre(2024)}}`)}$.`
              break
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierDeBaseAvecVariable,
          )
          this.listeCanEnonces.push(texte)
          break

        case 87:
          {
            const a = randint(1, 6) * 2
            const k = choice([1.5, 2, 0.5])
            const b = a * k
            const c = 2024
            const reponse = c * k

            texte = `Compléter le tableau de proportionnalité${sp()}:<br><br>`
            texte += `$
            \\begin{array}{|c|c|}
            \\hline
            ${texNombre(a, 0)}&${texNombre(b, 0)}${context.isHtml ? '\\\\' : '\\tabularnewline'}
            \\hline
            ${texNombre(c, 0)}&${context.isHtml ? '\\\\' : '\\tabularnewline'}
            \\hline
            \\end{array}
            $`
            texteCorr = `On constate que $${texNombre(b, 0)}=${texNombre(a, 0)}\\times ${texNombre(k, 1)}$.<br>
            Donc, la valeur cherchée est${sp()}: $${texNombre(2024)}\\times ${texNombre(k, 1)} =${miseEnEvidence(texNombre(reponse, 0))}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse.toFixed(0) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(
              'Compléter le tableau de proportionnalité.',
            )
            this.listeCanReponsesACompleter.push(`<br>$
            \\begin{array}{|c|c|}
            \\hline
            ~~~${a}~~~&~~~${b}~~~\\tabularnewline
            \\hline
            ${c}&\\tabularnewline
            \\hline
            \\end{array}
            $<br>`)
          }
          break

        case 88:
          {
            const b = randint(10, 15)

            texte = `Soit le script python${sp()}: <br>`
            if (context.isHtml) {
              texte += '$\\begin{array}{|l|}\n'
              texte += '\\hline\n'
              texte += '\\\n \\texttt{def calcul(a) :} \\\n '
              texte += `\\\\\n${sp(9)} \\texttt{return 2024-a} \\\\\n`
              texte += '\\hline\n'
              texte += '\\end{array}\n$'
            } else {
              texte += '\\medskip'
              texte += '\\fbox{'
              texte += '\\parbox{0.5\\linewidth}{'
              texte += '\\setlength{\\parskip}{.5cm}'
              texte += ' \\texttt{def calcul(a) :}\\newline'
              texte += ' \\hspace*{7mm}\\texttt{return 2024-a}'
              texte += '}'
              texte += '}\\newline'
              texte += '\\medskip'
            }
            if (context.isHtml) {
              texte += `<br> Que renvoie $\\texttt{calcul(${b})}$${sp()}?`
            }
            const reponse = 2024 - b
            texteCorr = ` L'algorithme retourne $2024-${b}=${miseEnEvidence(texNombre(reponse, 0))}$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push(
              `Que renvoie $\\texttt{calcul(${b})}$${sp()}?<br> $\\ldots$`,
            )
          }
          break

        case 89:
          {
            const u = randint(4, 9)
            const d = randint(1, 9)
            const nbre = d * 10 + u
            texte = `Le chiffre des unités de $${texNombre(2024)}+${nbre}$ est${sp()}: `
            if (u < 6) {
              reponse = 4 + u
            } else {
              reponse = 4 + u - 10
            }
            texteCorr = `En additionnant les deux chiffres des unités, on trouve $4+${u}=${4 + u}$. <br>
            Le chiffre des unités est donc $${miseEnEvidence(texNombre(reponse, 0))}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            } else {
              texte += '$\\ldots$'
            }
            this.listeCanEnonces.push('Compléter.')
            this.listeCanReponsesACompleter.push(
              `Le chiffre des unités de $${texNombre(2024)}+${nbre}$ est${sp()}: $\\ldots$`,
            )
          }
          break

        case 90:
          {
            const k = randint(6, 9)
            const nbre2 = 2024 + k
            const nbre3 = nbre2 + k

            texte = `Compléter la suite${sp()}: <br>
             $${texNombre(2024)}$${sp(3)}; ${sp(3)}$${texNombre(nbre2)}$ ${sp(3)}; ${sp(3)}$${texNombre(nbre3)}$ ${sp(3)}; ${sp(3)}`
            reponse = nbre3 + k
            texteCorr = `$${texNombre(2024)}+${k}=${texNombre(nbre2)}$ et $${texNombre(nbre2)}+${k}=${texNombre(nbre3)}$, donc le nombre suivant est $${texNombre(nbre3)}+${k}=${miseEnEvidence(texNombre(reponse, 0))}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })

            texte += !this.interactif
              ? '?'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                )

            this.listeCanEnonces.push('Compléter la suite.')
            this.listeCanReponsesACompleter.push(
              `$${texNombre(2024)}$ ; $${texNombre(nbre2)}$ ; $${texNombre(nbre3)}$ ; $\\ldots$`,
            )
          }
          break

        case 91:
          {
            const h = 20
            const k = randint(13, 16)

            texte = `Compléter la suite${sp()}: <br>
               $${h}$ h $24$ min ${sp(3)}; ${sp(3)}$${h}$ h $${24 + k}$ min ${sp(3)}; ${sp(3)}$${h}$ h $${24 + 2 * k}$ min ${sp(3)}; ${sp(3)} `

            texteCorr = `On ajoute $${k}$ minutes à chaque fois, donc l'heure qui suit est $${miseEnEvidence(`${h + 1}\\text{ h }${24 + 3 * k - 60}\\text{ min}`)}$.`

            reponse = new Hms({ hour: h + 1, minute: 24 + 3 * k - 60 })
            handleAnswers(this, index, {
              reponse: { value: reponse.toString(), options: { HMS: true } },
            })
            texte += !this.interactif
              ? '$\\ldots$ h $\\ldots$ min'
              : ajouteChampTexteMathLive(this, index, KeyboardType.clavierHms)
            this.listeCanEnonces.push('Compléter la suite.')
            this.listeCanReponsesACompleter.push(
              `$${h}$ h $24$ min <br> $${h}$ h $${24 + k}$ min <br> $${h}$ h $${24 + 2 * k}$ min <br> $\\ldots$ h $\\ldots$ min`,
            )
          }
          break

        case 92:
          {
            const a = randint(2025, 2028)
            const f1 = new FractionEtendue(a, 2024)
            const f2 = new FractionEtendue(2024, a)
            const listeNombre1 = [f1.texFraction, f2.texFraction, 1]
            const choix = choice([true, false])
            const Nombre1 = shuffle(listeNombre1)
            reponse = choix
              ? new FractionEtendue(a, 2024)
              : new FractionEtendue(2024, a)
            texte = `Parmi les nombres ci-dessous, quel est le plus ${choix ? 'grand' : 'petit'} nombre${sp()}?`
            texte += !this.interactif
              ? '<br>'
              : ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
            texte += `<br>$${Nombre1[0]}$${sp(4)};${sp(4)} $${Nombre1[1]}$${sp(4)};${sp(4)} $${Nombre1[2]}$`
            texteCorr = `$${f1.texFraction} > 1$ et $${f2.texFraction}<1$, donc le plus ${choix ? 'grand' : 'petit'} nombre est${sp()}: $${miseEnEvidence(reponse)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionEgale: true },
              },
            })
            this.listeCanEnonces
              .push(`Quel est le plus ${choix ? 'grand' : 'petit'} nombre${sp()}?<br>
          Entourer ce nombre.`)
            this.listeCanReponsesACompleter.push(
              `$${Nombre1[0]}$${sp(4)};${sp(4)} $${Nombre1[1]}$${sp(4)};${sp(4)} $${Nombre1[2]}$`,
            )
          }
          break

        case 93:
        default:
          {
            const oliveK = choice([100, 200])
            const nbreBouteilles = choice([20, 25, 10])
            const oliveParBouteille = oliveK / nbreBouteilles
            reponse = (2024 / oliveParBouteille).toFixed(0)
            texte = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br>
            Combien va-t-il remplir de bouteilles pleines avec ses $${texNombre(2024)}$ kg d'olives cueillies${sp()}?`
            texteCorr = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br> Cela signifie que pour remplir $1$ bouteille d'huile, il utilise $${oliveParBouteille}$ kg d'olives car $${oliveK} \\div ${nbreBouteilles} = ${oliveParBouteille}$.<br>`
            if (2024 % oliveParBouteille === 0) {
              texteCorr += `Comme $${texNombre(2024)}=${texNombre(2000)}+${texNombre(24)}=${texNombre(2000 / oliveParBouteille, 2)}\\times ${oliveParBouteille}+${texNombre(Math.floor(24 / oliveParBouteille), 0)}\\times ${oliveParBouteille}=${reponse}\\times ${oliveParBouteille}$, il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
            } else {
              texteCorr += `Comme $${texNombre(2024)}=${texNombre(2000)}+${texNombre(24)}=${texNombre(2000 / oliveParBouteille, 2)}\\times ${oliveParBouteille}+${texNombre(Math.floor(24 / oliveParBouteille))}\\times ${oliveParBouteille}+${texNombre(24 % oliveParBouteille)}=${reponse}\\times ${oliveParBouteille}+${texNombre(2024 % oliveParBouteille, 0)}$, il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
            }
            handleAnswers(this, index, { reponse: { value: reponse } })

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: ' bouteilles',
                },
              )
            } else {
              texte += ''
            }
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push('$\\ldots$ bouteilles')
          }
          break
      }

      if (this.questionJamaisPosee(i, String(texteCorr))) {
        // A supprimer lors de la mise en production
        // Pour savoir de quelle question il s'agit
        // texte += ' <--- Question n°' + typeQuestionsDisponibles[i]
        // texte += '<br>Réponse attendue : ' + reponse // Pour avoir les réponses quand on débuggue.
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
