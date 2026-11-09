// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7ba8b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction, listeFractions } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

type DonneesProbleme3 = [
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  number,
  string,
  string,
  string,
]
type DonneesProbleme4 = [
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  FractionEtendue,
  string,
  number,
  string,
  string,
  string,
]
type ProblemeFractions<TFractions extends DonneesProbleme3 | DonneesProbleme4> =
  {
    prenoms: string | string[]
    fractions: TFractions
    enonce: string
    question: [string, string]
    correction: string
  }

export const titre =
  'Résoudre des problèmes additifs et multiplicatifs utilisant des fractions'
export const interactifReady = true

/**
 * Résoudre des problèmes additifs et multiplicatifs utilisant des fractions
 * @author Mickael Guironnet
 */

export const uuid = '7ba8b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ProblemesMultiplicatifsFractionsOld extends Exercice {
  declare sup: string

  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de problèmes',
      'Nombres séparés par des tirets :\n1: Bouteille (3 fractions)\n2 : Examen (3 fractions)\n3 : Élections (3 fractions)\n4 : Argent (3 fractions)\n5 : Jeu TV (4 fractions)\n6 : Timbres (4 fractions)\n7 : Fleurs (4 fractions)\n8 : Mélange',
    ]

    this.sup = '8'

    this.nbQuestions = 4

    this.consigne = 'Justifier vos réponses aux problèmes suivants.'

    this.spacing = context.isHtml ? 2 : 1.5
    this.spacingCorr = context.isHtml ? 3 : 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })

    const denomsAmis = [
      [40, 20, 4, 10, 5, 8],
      [60, 30, 3, 20, 4, 15, 5, 12, 6, 10],
      [80, 40, 4, 20, 5, 16, 8, 10],
      [100, 50, 25, 20, 10, 5],
      [64, 8, 32, 16, 4],
      [54, 9, 6, 27, 18],
    ]
    let denomsAmisToSelect = shuffle(
      Array.from({ length: denomsAmis.length }, (_, i) => i),
    )

    let listefrac: ReturnType<typeof listeFractions>
    let listefrac2: ReturnType<typeof listeFractions>
    let denominateurCommun = 1
    // le tableau d'objets contenant tout le necesssaire, fractions, énoncé, question ... pour les problèmes avec 3 ou 4 fractions
    let pb4f: ProblemeFractions<DonneesProbleme4>[] = []
    let pb3f: ProblemeFractions<DonneesProbleme3>[] = []
    // les numérateurs et dénominateurs des fractions
    let n1 = 0
    let n2 = 0
    let n3 = 0
    let n4 = 0
    let d1 = 1
    let d2 = 1
    let d3 = 1
    let d4 = 1
    let F1 = fraction(1, 2)
    let F2 = fraction(1, 2)
    let F3 = fraction(1, 2)
    let F4 = fraction(1, 2)

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on choisit un tableau de dénominateurs qui va bien
      if (denomsAmisToSelect.length === 0)
        denomsAmisToSelect = shuffle(
          Array.from({ length: denomsAmis.length }, (_, i) => i),
        )

      if (Number(listeTypeDeQuestions[i]) < 5) {
        //= =====================================================
        //= ================AVEC 3 FRACTIONS========
        //= =====================================================

        // le tableau d'objets contenant tout le necesssaire, fractions, énoncé, question ... pour les problème avec 3 fractions
        pb3f = []

        const denomsCool3 = denomsAmis[denomsAmisToSelect.pop() ?? 0]
        F1 = fraction(1, 2)
        F2 = fraction(1, 2)
        F3 = fraction(1, 2)
        let b = 0
        while (
          b < 50 &&
          (F1.num === F2.num ||
            F1.num === F3.num ||
            F2.num === F3.num ||
            F1.den === F2.den ||
            F1.superieurLarge(fraction(1, 2)) ||
            F2.superieurLarge(fraction(1, 2)))
        ) {
          // pour éviter la boucle infinie
          b++

          // sélectionne 2 dénominateurs différents et trie par ordre croissant
          ;[d1, d2] = shuffle(denomsCool3)
            .slice(0, 3)
            .sort(function (a, b) {
              return a - b
            })

          n1 = randint(Math.ceil(d1 / 4), Math.floor(d1 / 2)) // fraction comprise entre 1 quart et 1 demi
          n2 = randint(Math.ceil(d2 / 4), Math.floor(d2 / 2)) // fraction comprise entre 1 quart et 1 demi

          n3 = d1 * d2 - n1 * d2 - n2 * d1 // la somme des trois vaut 1 !
          d3 = d1 * d2
          F1 = fraction(n1, d1).simplifie()
          F2 = fraction(n2, d2).simplifie()
          F3 = fraction(n3, d3).simplifie()
        }
        // on mélange
        ;[F1, F2] = shuffle([F1, F2])

        //= =====================================================
        //= ======== indice 0 la bouteille d'eau  ==========
        //= =====================================================

        // F2' = F2/(1-F1)
        const F2p = F2.diviseFraction(
          F1.oppose().sommeFraction(fraction(1, 1)),
        ).simplifie()
        let quantite = denomsCool3[0]
        pb3f.push({
          prenoms: [String(prenomF())],
          fractions: [
            F1,
            "d'eau bue le matin",
            F2,
            "d'eau bue à midi",
            F3,
            "d'eau restant dans la bouteille",
            F1.oppose().sommeFraction(fraction(1, 1)),
            "d'eau restant le matin",
            F2p,
            "de la quantité d'eau bue à midi sur la quantité restante",
            quantite,
            'cL',
            "d'eau",
            'reste dans la bouteille',
          ],
          enonce: '',
          question: [
            `Quelle fraction d'eau reste-t-il dans la bouteille${sp()}?`,
            `Sachant que c'est une bouteille de $${texNombre(quantite)}$ cL, quelle quantité reste-t-il${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========indice 1 Examen ===========
        //= =====================================================
        quantite = choice([20, 40, 60]) * denomsCool3[0]
        pb3f.push({
          prenoms: [],
          fractions: [
            F1,
            "des candidats ont échoué à l'écrit",
            F2,
            "des candidats ont échoué à l'oral",
            F3,
            "des candidats ont réussi l'examen",
            F1.oppose().sommeFraction(fraction(1, 1)),
            "des candidats ont réussi l'écrit",
            F2p,
            "des candidats qui ont échoué à l'oral après avoir réussi l'écrit",
            quantite,
            'candidats',
            'des candidats',
            "ont réussi l'examen", // conclusion
          ],
          enonce: '',
          question: [
            `Quelle fraction représente les candidats qui ont réussi l'examen${sp()}?`,
            `Sachant qu'il y avait $${texNombre(quantite)}$ candidats qui se sont présentés à l'examen, combien ont réussi${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========indice 2 Election  ===========
        //= =====================================================
        quantite = choice([20, 40, 60]) * denomsCool3[0]
        pb3f.push({
          prenoms: [],
          fractions: [
            F1,
            'des électeurs se sont abstenus',
            F2,
            'des électeurs ont voté pour le candidat non élu',
            F3,
            'des électeurs ont voté pour le candidat élu',
            F1.oppose().sommeFraction(fraction(1, 1)),
            "des électeurs ont participé à l'élection",
            F2p,
            'des électeurs ont voté pour le candidat non élu parmi les votants',
            quantite,
            'électeurs',
            'des électeurs',
            'ont voté pour le candidat élu',
          ],
          enonce: '',
          question: [
            `Quelle fraction a obtenu le candidat élu en considérant l'ensemble des électeurs${sp()}?`,
            `Sachant qu'il y avait au total $${texNombre(quantite)}$ électeurs, combien le candidat élu a-t-il obtenu de voix${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========indice 3 Argent de poche  ===========
        //= =====================================================
        quantite = denomsCool3[0]
        pb3f.push({
          prenoms: [String(prenomF())],
          fractions: [
            F1,
            'de son argent de poche dépensé lors du premier jour',
            F2,
            'de son argent de poche dépensé lors du deuxième jour',
            F3,
            'de son argent de poche qui lui reste après les soldes',
            F1.oppose().sommeFraction(fraction(1, 1)),
            'de son argent qui reste après le premier jour',
            F2p,
            "de dépenses sur l'argent restant",
            quantite,
            '€',
            "d'argent",
            'lui reste',
          ],
          enonce: '',
          question: [
            `Quelle fraction de son argent de poche lui reste-t-il${sp()}?`,
            `Sachant qu'elle avait $${texNombre(quantite)}$ €, combien lui reste-t-il${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ===== énoncé indice 0 la bouteille d'eau  ======
        //= =====================================================

        pb3f[0].enonce += `Ce matin, ${pb3f[0].prenoms[0]} a ouvert une bouteille d'eau. Elle a bu $${pb3f[0].fractions[0].texFraction}$ de la bouteille.`
        pb3f[0].enonce += `<br>Puis à midi, elle a bu $${pb3f[0].fractions[8].texFraction}$ du reste. `

        //= =====================================================
        //= ========== énoncé indice 1 examen ===========
        //= =====================================================

        pb3f[1].enonce =
          `Des candidats se présentent à un examen comportant une épreuve écrite puis une épreuve orale. Les résultats sont les suivants${sp()}: `
        pb3f[1].enonce += `$${pb3f[1].fractions[0].texFraction}$ des candidats ont échoué à l'épreuve écrite alors que les autres candidats ont pu participer à l'oral. `
        pb3f[1].enonce += `$${pb3f[1].fractions[8].texFraction}$ des candidats qui ont passé l'épreuve orale l'ont échouée.`

        //= =====================================================
        //= ========== énoncé indice 2 élection ===========
        //= =====================================================

        pb3f[2].enonce =
          `Des candidats se présentent à une élection. Les résultats sont les suivants${sp()}: `
        pb3f[2].enonce += `<br>$${pb3f[2].fractions[0].texFraction}$ des électeurs se sont abstenus. `
        pb3f[2].enonce += `Parmi les votants, $${pb3f[2].fractions[8].texFraction}$ des électeurs ont voté pour le candidat non élu.`

        //= =====================================================
        //= ========== énoncé indice 3 gateau ===========
        //= =====================================================

        pb3f[3].enonce = `${pb3f[3].prenoms[0]} dépense $${pb3f[3].fractions[0].texFraction}$ de son argent de poche lors du premier jour des soldes.`
        pb3f[3].enonce += `<br>Le lendemain, elle dépense $${pb3f[3].fractions[8].texFraction}$ de ce qui lui reste. `

        //= =====================================================
        //= ==========Correction Commune===========
        //= =====================================================
        listefrac = listeFractions(F1, F2, F3)
        denominateurCommun = listefrac.listeMemeDenominateur[0].den
        for (let i = 0; i < 4; i++) {
          pb3f[i].correction =
            "Il s'agit d'un problème multiplicatif. Prendre une fraction d'une fraction revient à multiplier les deux fractions entre elles."
          pb3f[i].correction +=
            `<br>$1 - ${F1.texFraction} = ${F1.oppose().sommeFraction(fraction(1, 1)).texFraction}$ ` +
            pb3f[i].fractions[7] +
            '.'
          pb3f[i].correction +=
            `<br>$${F2p.texFraction}\\times ${F1.oppose().sommeFraction(fraction(1, 1)).texFraction} = ${F2.texFraction} $ ` +
            pb3f[i].fractions[3] +
            '.'
          pb3f[i].correction +=
            `<br>Finalement, $${F1.texFraction}$ ` +
            pb3f[i].fractions[1] +
            ' et ' +
            `$${F2.texFraction}$ ` +
            pb3f[i].fractions[3] +
            '.'
          if (listefrac.liste[0].den === listefrac.liste[1].den) {
            pb3f[i].correction +=
              "<br>Les fractions de l'énoncé ont déjà le même dénominateur.<br>"
          } else {
            pb3f[i].correction +=
              `<br>Réduisons les fractions au même dénominateur${sp()}:  `

            pb3f[i].correction += `$${listefrac.liste[0].texFraction}$ `
            if (listefrac.liste[0].den !== denominateurCommun)
              pb3f[i].correction +=
                `$= ${listefrac.listeMemeDenominateur[0].texFraction}$ et `
            else pb3f[i].correction += ' et '
            pb3f[i].correction += `$${listefrac.liste[1].texFraction}$ `
            if (listefrac.liste[1].den !== denominateurCommun)
              pb3f[i].correction +=
                `$= ${listefrac.listeMemeDenominateur[1].texFraction}$.<br>`
            else pb3f[i].correction += '.<br>'
          }
          pb3f[i].correction +=
            `Calculons la fraction ${pb3f[i].fractions[12]} qui ${pb3f[i].fractions[13]}${sp()}:`

          pb3f[i].correction +=
            `<br>$1-${pb3f[i].fractions[0].texFraction}-${pb3f[i].fractions[2].texFraction} = `
          pb3f[i].correction +=
            `${fraction(denominateurCommun, denominateurCommun).texFraction}-${listefrac.listeMemeDenominateur[0].texFraction}-${listefrac.listeMemeDenominateur[1].texFraction} = `
          pb3f[i].correction +=
            `\\dfrac{${denominateurCommun}-${listefrac.listeMemeDenominateur[0].num}-${listefrac.listeMemeDenominateur[1].num}}{${denominateurCommun}} = `
          pb3f[i].correction +=
            `${fraction(denominateurCommun - listefrac.listeMemeDenominateur[0].num - listefrac.listeMemeDenominateur[1].num, denominateurCommun).texFraction}`
          if (!(denominateurCommun === F3.den)) {
            pb3f[i].correction += ` = ${pb3f[i].fractions[4].texFraction}$`
          } else {
            pb3f[i].correction += '$'
          }

          pb3f[i].correction += `<br>Conclusion${sp()}: $${miseEnEvidence(
            pb3f[i].fractions[4].texFraction,
          )}$ ${pb3f[i].fractions[5]}.`

          pb3f[i].correction +=
            `<br>Sachant qu'il y avait $${texNombre(pb3f[i].fractions[10])}$ ${pb3f[i].fractions[11]}, on peut calculer${sp()}:`

          pb3f[i].correction +=
            `<br>$${F3.texFraction}\\times ${texNombre(pb3f[i].fractions[10])} = ${F3.produitFraction(fraction(pb3f[i].fractions[10], 1)).simplifie().texFraction} $ ${pb3f[i].fractions[11]} ${pb3f[i].fractions[13]}.`

          pb3f[i].correction += `<br>Conclusion${sp()}: $${miseEnEvidence(
            F3.produitFraction(fraction(pb3f[i].fractions[10], 1)).simplifie()
              .texFraction,
          )}$ ${pb3f[i].fractions[11]} ${pb3f[i].fractions[13]}.`
        }
      } else {
        //= =====================================================
        //= ======= AVEC 4 FRACTIONS=======
        //= =====================================================
        pb4f = []
        const denomsCool4 = denomsAmis[denomsAmisToSelect.pop() ?? 0]

        F1 = fraction(1, 3)
        F2 = fraction(1, 3)
        F3 = fraction(1, 3)
        F4 = fraction(1, 3)
        let b = 0
        while (
          b < 50 &&
          (F1.num === F2.num ||
            F1.num === F3.num ||
            F1.num === F4.num ||
            F2.num === F3.num ||
            F2.num === F4.num ||
            F3.num === F4.num ||
            F1.den === F2.den ||
            F1.den === F3.den ||
            F2.den === F3.den ||
            F1.superieurLarge(fraction(1, 3)) ||
            F2.superieurLarge(fraction(1, 3)) ||
            F3.superieurLarge(fraction(1, 3)))
        ) {
          // pour éviter la boucle infinie
          b++

          // sélectionne 3 dénominateurs différents et trie par ordre croissant
          ;[d1, d2, d3] = shuffle(denomsCool4)
            .slice(0, 3)
            .sort(function (a, b) {
              return a - b
            })

          n1 = d1 === 2 ? 1 : randint(Math.ceil(d1 / 6), Math.floor(d1 / 3)) // fraction entre 1/6 et 1/3
          n2 = randint(Math.ceil(d2 / 6), Math.floor(d2 / 3)) // fraction entre 1/6 et 1/3
          n3 = randint(Math.ceil(d3 / 6), Math.floor(d3 / 3)) // fraction entre 1/6 et 1/3

          n4 = d1 * d2 * d3 - n1 * d2 * d3 - n2 * d1 * d3 - n3 * d1 * d2 // la somme des quatre vaut 1 !
          d4 = d1 * d2 * d3

          F1 = fraction(n1, d1).simplifie()
          F2 = fraction(n2, d2).simplifie()
          F3 = fraction(n3, d3).simplifie()
          F4 = fraction(n4, d4).simplifie()
        }
        // on mélange
        ;[F1, F2, F3] = shuffle([F1, F2, F3])

        const F2p = F2.diviseFraction(
          F1.oppose().sommeFraction(fraction(1, 1)),
        ).simplifie()
        const F3p = F3.diviseFraction(
          F1.oppose().sommeFraction(fraction(1, 1)).sommeFraction(F2.oppose()),
        ).simplifie()

        //= =====================================================
        //= ========== indice 0 le jeu tv===========
        //= =====================================================
        let quantite = choice([5, 2]) * denomsCool4[0]
        pb4f.push({
          prenoms: [],
          fractions: [
            F1,
            'des candidats sont éliminés après la première semaine',
            F2,
            'des candidats sont éliminés après la deuxième semaine',
            F3,
            'des candidats sont éliminés après la troisième semaine',
            F4,
            'des candidats qui ont gagné le jeu',
            F1.oppose().sommeFraction(fraction(1, 1)),
            'des candidats restants après la première semaine',
            F1.oppose().sommeFraction(
              fraction(1, 1).sommeFraction(F2.oppose()),
            ),
            'des candidats restants après la deuxième semaine',
            F2p,
            'des candidats restants sont éliminés après la deuxième semaine',
            F3p,
            'des candidats restants sont éliminés après la troisième semaine',
            quantite,
            'candidats',
            'des candidats',
            'ont gagné le jeu télévisé',
          ],
          enonce: '',
          question: [
            `Quelle fraction de candidats reste-t-il à la fin du jeu${sp()}?`,
            `Sachant qu'il y avait $${texNombre(quantite)}$ candidats au départ du jeu, quel est le nombre de candidats gagnants${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========indice 1 les timbres ===========
        //= =====================================================
        const pre = String(prenomF())
        quantite = choice([20, 40]) * denomsCool4[0]
        pb4f.push({
          prenoms: pre,
          fractions: [
            F1,
            'des timbres sont des timbres Français',
            F2,
            'des timbres sont des timbres Japonais',
            F3,
            'des timbres sont des timbres Mexicains',
            F4,
            'des timbres sont des timbres Brésiliens',
            F1.oppose().sommeFraction(fraction(1, 1)),
            'des timbres sont des timbres étrangers',
            F1.oppose().sommeFraction(
              fraction(1, 1).sommeFraction(F2.oppose()),
            ),
            'des timbres sont des timbres Américains',
            F2p,
            'des timbres sont des timbres Asiatiques parmi les timbres étrangers',
            F3p,
            'des timbres sont des timbres Mexicains parmi les timbres Américains',
            quantite,
            'timbres',
            'des timbres',
            ' sont des timbres Brésiliens',
          ],
          enonce: '',
          question: [
            `Quelle fraction de timbres représente les timbres Brésiliens${sp()}?`,
            `Sachant qu'il y avait $${texNombre(quantite)}$ timbres au total, quel est le nombre de timbres Brésiliens${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========indice 2 bouquets ===========
        //= =====================================================
        quantite = choice([20, 40]) * denomsCool4[0]
        pb4f.push({
          prenoms: [],
          fractions: [
            F1,
            'de ses bouquets vendus le matin',
            F2,
            "de ses bouquets vendus l'après-midi",
            F3,
            'de ses bouquets vendus le soir',
            F4,
            'de ses bouquets invendus',
            F1.oppose().sommeFraction(fraction(1, 1)),
            "des bouquets restant à vendre l'après-midi",
            F1.oppose().sommeFraction(
              fraction(1, 1).sommeFraction(F2.oppose()),
            ),
            'des bouquets restant à vendre le soir',
            F2p,
            "des bouquets restants vendus l'après-midi",
            F3p,
            'des bouquets restants vendus le soir',
            quantite,
            'bouquets',
            'des bouquets',
            ' sont invendus',
          ],
          enonce: '',
          question: [
            `Quelle fraction représente les bouquets invendus${sp()}?`,
            `Sachant qu'il y avait $${texNombre(quantite)}$ bouquets au total, quel est le nombre de bouquets invendus${sp()}?`,
          ],
          correction: '',
        })

        //= =====================================================
        //= ==========énoncé indice 0 jeu tv  ===========
        //= =====================================================

        pb4f[0].enonce =
          `Un nouveau jeu télévisé fait sensation. Pour gagner, il ne faut pas se faire éliminer. La règle est la suivante${sp()}: `
        pb4f[0].enonce += `$${pb4f[0].fractions[0].texFraction}$ ${pb4f[0].fractions[1]}. Puis, `
        pb4f[0].enonce += `$${pb4f[0].fractions[12].texFraction}$ ${pb4f[0].fractions[13]}. Enfin, `
        pb4f[0].enonce += `$${pb4f[0].fractions[14].texFraction}$ ${pb4f[0].fractions[15]}. `

        //= =====================================================
        //= ==========énoncé indice 1 les timbres ===========
        //= =====================================================
        pb4f[1].enonce = `${pb4f[1].prenoms} fait la collection des timbres. Elle possède des timbres Français, Japonais, Mexicains et Brésiliens. Voici la répartion des timbres${sp()}:`
        pb4f[1].enonce += `$${pb4f[1].fractions[0].texFraction}$ ${pb4f[1].fractions[1]}.  `
        pb4f[1].enonce += `$${pb4f[1].fractions[12].texFraction}$ ${pb4f[1].fractions[13]}. `
        pb4f[1].enonce += `$${pb4f[1].fractions[14].texFraction}$ ${pb4f[1].fractions[15]}. `

        //= =====================================================
        //= ==========énoncé indice 3 les bouquets ===========
        //= =====================================================
        pb4f[2].enonce = `Un marchand vend des bouquets de muguets le 1er mai. Il vend $${pb4f[2].fractions[0].texFraction}$ de ses bouquets le matin, `
        pb4f[2].enonce += `l'après-midi il vend $${pb4f[2].fractions[12].texFraction}$ de ce qui lui reste `
        pb4f[2].enonce += `et le soir il vend $${pb4f[2].fractions[14].texFraction}$ de ce qui lui reste.`

        //= =====================================================
        //= ========== Correction Commune  ===========
        //= =====================================================
        listefrac2 = listeFractions(F1, F2, F3, F4)
        denominateurCommun = listefrac2.listeMemeDenominateur[0].den
        for (let i = 0; i < 3; i++) {
          pb4f[i].correction =
            "Il s'agit d'un problème multiplicatif. Une fraction d'une fraction revient à multiplier les deux fractions entre elles."
          pb4f[i].correction +=
            `<br>$1 - ${F1.texFraction} = ${F1.oppose().sommeFraction(fraction(1, 1)).texFraction}$ ` +
            pb4f[i].fractions[9] +
            '.'
          pb4f[i].correction +=
            `<br>$${F2p.texFraction}\\times ${F1.oppose().sommeFraction(fraction(1, 1)).texFraction} = ${F2.texFraction} $ ` +
            pb4f[i].fractions[3] +
            '.'
          pb4f[i].correction +=
            `<br>$1 - ${F1.texFraction} - ${F2.texFraction}= ${F1.oppose().sommeFraction(fraction(1, 1).sommeFraction(F2.oppose())).texFraction}$ ` +
            pb4f[i].fractions[11] +
            '.'
          pb4f[i].correction +=
            `<br>$${F3p.texFraction}\\times ${F1.oppose().sommeFraction(fraction(1, 1)).sommeFraction(F2.oppose()).texFraction} = ${F3.texFraction} $ ` +
            pb4f[i].fractions[5] +
            '.'
          pb4f[i].correction +=
            `<br>Finalement, $${F1.texFraction}$ ` +
            pb4f[i].fractions[1] +
            ', ' +
            `$${F2.texFraction}$ ` +
            pb4f[i].fractions[3] +
            ' et ' +
            `$${F3.texFraction}$ ` +
            pb4f[i].fractions[5] +
            '.'

          if (
            listefrac2.liste[0].den === denominateurCommun &&
            listefrac2.liste[1].den === denominateurCommun &&
            listefrac2.liste[2].den === denominateurCommun
          ) {
            pb4f[i].correction +=
              '<br>Les fractions ont déjà le même dénominateur.'
          } else {
            pb4f[i].correction +=
              `<br>Réduisons les fractions au même dénominateur${sp()}:  `
            pb4f[i].correction += `$${listefrac2.liste[0].texFraction}$ `
            if (listefrac2.liste[0].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${listefrac2.listeMemeDenominateur[0].texFraction}$ ; `
            else pb4f[i].correction += ' ; '
            pb4f[i].correction += `$${listefrac2.liste[1].texFraction}$ `
            if (listefrac2.liste[1].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${listefrac2.listeMemeDenominateur[1].texFraction}$ et `
            else pb4f[i].correction += ' et '
            pb4f[i].correction += `$${listefrac2.liste[2].texFraction}$ `
            if (listefrac2.liste[2].den !== denominateurCommun)
              pb4f[i].correction +=
                `$= ${listefrac2.listeMemeDenominateur[2].texFraction}$.<br>`
            else pb4f[i].correction += '.<br>'
          }

          pb4f[i].correction +=
            `Calculons la fraction ${pb4f[i].fractions[18]} qui ${pb4f[i].fractions[19]}${sp()}:`

          pb4f[i].correction +=
            `<br>$1-${pb4f[i].fractions[0].texFraction}-${pb4f[i].fractions[2].texFraction} -${pb4f[i].fractions[4].texFraction} = `
          pb4f[i].correction +=
            `${fraction(denominateurCommun, denominateurCommun).texFraction}-${listefrac2.listeMemeDenominateur[0].texFraction}-${listefrac2.listeMemeDenominateur[1].texFraction} -${listefrac2.listeMemeDenominateur[2].texFraction} = `
          pb4f[i].correction +=
            `\\dfrac{${denominateurCommun}-${listefrac2.listeMemeDenominateur[0].num}-${listefrac2.listeMemeDenominateur[1].num}-${listefrac2.listeMemeDenominateur[2].num}}{${denominateurCommun}} = `
          pb4f[i].correction +=
            `${fraction(denominateurCommun - listefrac2.listeMemeDenominateur[0].num - listefrac2.listeMemeDenominateur[1].num - listefrac2.listeMemeDenominateur[2].num, denominateurCommun).texFraction}`
          if (!(denominateurCommun === F4.den)) {
            pb4f[i].correction += ` = ${pb4f[i].fractions[6].texFraction}$`
          } else {
            pb4f[i].correction += '$'
          }

          pb4f[i].correction += `<br>Conclusion${sp()}: $${miseEnEvidence(
            pb4f[i].fractions[6].texFraction,
          )}$ ${pb4f[i].fractions[18]} ${pb4f[i].fractions[19]}.`
          pb4f[i].correction +=
            `<br>Sachant qu'il y avait $${texNombre(pb4f[i].fractions[16])}$ ${pb4f[i].fractions[17]}, on peut calculer${sp()}:`
          pb4f[i].correction +=
            `<br>$${F4.texFraction}\\times ${texNombre(pb4f[i].fractions[16])} = ${F4.produitFraction(fraction(pb4f[i].fractions[16], 1)).simplifie().texFraction} $ ${pb4f[i].fractions[17]} ${pb4f[i].fractions[19]}.`
          pb4f[i].correction += `<br>Conclusion${sp()}: $${miseEnEvidence(
            F4.produitFraction(fraction(pb4f[i].fractions[16], 1)).simplifie()
              .texFraction,
          )}$ ${pb4f[i].fractions[17]} ${pb4f[i].fractions[19]}.`
        }
      }

      let reponseFraction = F1
      let reponseNombre = ''
      let unite = ''
      switch (listeTypeDeQuestions[i]) {
        case 1: // bouteille d'eau
          texte = `${pb3f[0].enonce} <br> ${numAlpha(0)} ${pb3f[0].question[0]} <br> ${numAlpha(1)} ${pb3f[0].question[1]}`
          texteCorr = `${pb3f[0].correction}`
          reponseFraction = F3
          reponseNombre = F3.produitFraction(
            fraction(pb3f[0].fractions[10], 1),
          ).simplifie().texFraction
          unite = 'cL'
          break
        case 2: // examen
          texte = `${pb3f[1].enonce} <br> ${numAlpha(0)} ${pb3f[1].question[0]} <br> ${numAlpha(1)} ${pb3f[1].question[1]}`
          texteCorr = `${pb3f[1].correction}`
          reponseFraction = F3
          reponseNombre = F3.produitFraction(
            fraction(pb3f[1].fractions[10], 1),
          ).simplifie().texFraction
          unite = 'candidats'
          break
        case 3: // élection
          texte = `${pb3f[2].enonce} <br> ${numAlpha(0)} ${pb3f[2].question[0]} <br> ${numAlpha(1)} ${pb3f[2].question[1]}`
          texteCorr = `${pb3f[2].correction}`
          reponseFraction = F3
          reponseNombre = F3.produitFraction(
            fraction(pb3f[2].fractions[10], 1),
          ).simplifie().texFraction
          unite = 'électeurs'
          break
        case 4: // argent de poche
          texte = `${pb3f[3].enonce} <br> ${numAlpha(0)} ${pb3f[3].question[0]} <br> ${numAlpha(1)} ${pb3f[3].question[1]}`
          texteCorr = `${pb3f[3].correction}`
          reponseFraction = F3
          reponseNombre = F3.produitFraction(
            fraction(pb3f[3].fractions[10], 1),
          ).simplifie().texFraction
          unite = '€'
          break
        case 5: // jeu tv
          texte = `${pb4f[0].enonce} <br> ${numAlpha(0)} ${pb4f[0].question[0]} <br> ${numAlpha(1)} ${pb4f[0].question[1]}`
          texteCorr = `${pb4f[0].correction}`
          reponseFraction = F4
          reponseNombre = F4.produitFraction(
            fraction(pb4f[0].fractions[16], 1),
          ).simplifie().texFraction
          unite = 'candidats'
          break
        case 6: // les timbres
          texte = `${pb4f[1].enonce} <br> ${numAlpha(0)} ${pb4f[1].question[0]} <br> ${numAlpha(1)} ${pb4f[1].question[1]}`
          texteCorr = `${pb4f[1].correction}`
          reponseFraction = F4
          reponseNombre = F4.produitFraction(
            fraction(pb4f[1].fractions[16], 1),
          ).simplifie().texFraction
          unite = 'timbres'
          break
        case 7: // les bouquets
          texte = `${pb4f[2].enonce} <br> ${numAlpha(0)} ${pb4f[2].question[0]} <br> ${numAlpha(1)} ${pb4f[2].question[1]}`
          texteCorr = `${pb4f[2].correction}`
          reponseFraction = F4
          reponseNombre = F4.produitFraction(
            fraction(pb4f[2].fractions[16], 1),
          ).simplifie().texFraction
          unite = 'bouquets'
          break
      }
      const champFraction = ajouteChampTexteMathLive(
        this,
        2 * i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      const champNombre = ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        KeyboardType.clavierDeBase,
        { texteApres: ` ${unite}` },
      )
      texte = texte.replace(
        ` <br> ${numAlpha(1)}`,
        ` ${champFraction}<br> ${numAlpha(1)}`,
      )
      texte += ` ${champNombre}`
      handleAnswers(this, 2 * i, {
        reponse: {
          value: reponseFraction.texFraction,
          options: { fractionEgale: true },
        },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: { value: reponseNombre },
      })
      if (this.listeQuestions.indexOf(texte) === -1) {
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
