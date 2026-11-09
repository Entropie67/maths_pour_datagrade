import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire des abscisses fractionnaires de points (niv 2)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '25/01/2024'

/**
 *  :
 * Lire des abscisses sous forme de fractions avec possibilté d'avoir des fractions simplifiées
 * @author Jean-claude Lhote à partir de 6N21-1 de Mickaël Guironnet
 */
export const uuid = '442f4'

export const refs = {
  'fr-fr': ['CM2N2F-2'],
  'fr-2016': ['6N21-2'],
  'fr-ch': ['9R1NO4B-2', '9R2NO4B-2', '9R3NO4B-2', 'PRQNO04B-4'],
}
export default class LireAbscissesFractionnairesComplexes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté :',
      3,
      '1 : Graduation en 1/4, 1/6, 1/8, 1/9, 1/10\n2 : Graduation en 1/12, 1/14, 1/16, 1/18 et 1/20\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des fractions simplifiées', true]
    this.besoinFormulaire3CaseACocher = ['Avec des valeurs négatives', false]
    this.nbQuestions = 5

    this.sup = 1 // Niveau de difficulté
    this.sup2 = true // avec des fractions simplifiées
    this.sup3 = false // valeurs positives si false sinon valeurs positives et négatives
  }

  nouvelleVersion() {
    let typeDeQuestions: number[]
    if (this.sup > 2) {
      typeDeQuestions = combinaisonListes([0, 1], this.nbQuestions)
    } else {
      typeDeQuestions = combinaisonListes(
        [parseInt(this.sup) - 1],
        this.nbQuestions,
      )
    }
    const data: Record<
      number,
      { id: number; den: number[]; max: number; min: number }
    > = {
      4: {
        id: 4,
        den: [2, 4],
        max: !this.sup3 ? 8 : 4,
        min: !this.sup3 ? 0 : -4,
      },
      6: {
        id: 6,
        den: [2, 3, 6],
        max: !this.sup3 ? 6 : 3,
        min: !this.sup3 ? 0 : -3,
      },
      8: {
        id: 8,
        den: [2, 4, 8],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      9: {
        id: 9,
        den: [3, 9],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      10: {
        id: 10,
        den: [2, 5, 10],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      12: {
        id: 12,
        den: [2, 3, 4, 6, 12],
        max: !this.sup3 ? 3 : 2,
        min: !this.sup3 ? 0 : -1,
      },
      14: {
        id: 14,
        den: [2, 7, 14],
        max: !this.sup3 ? 2 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      15: {
        id: 15,
        den: [3, 5, 15],
        max: !this.sup3 ? 2 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      16: {
        id: 16,
        den: [2, 4, 8, 16],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      18: {
        id: 18,
        den: [2, 3, 6, 9, 18],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      20: {
        id: 20,
        den: [2, 4, 5, 10, 20],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
    }
    const tableDisponibles = [
      [4, 6, 8, 9, 10],
      [12, 14, 15, 16, 18, 20],
    ]

    const tableUtilisees: number[][] = [[], []]
    for (let i = 0, texte, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      if (
        tableDisponibles[typeDeQuestions[i]].length ===
        tableUtilisees[typeDeQuestions[i]].length
      ) {
        tableUtilisees[typeDeQuestions[i]] = []
      }
      const tab = choice(
        tableDisponibles[typeDeQuestions[i]],
        tableUtilisees[typeDeQuestions[i]],
      )
      tableUtilisees[typeDeQuestions[i]].push(tab)
      const origine = data[tab].min

      const den1 = !this.sup2 ? data[tab].id : choice(data[tab].den)
      const tab1 = tab / den1
      const num1 = trouveNumerateur(den1, origine, data[tab].max)
      const den2 = !this.sup2 ? data[tab].id : choice(data[tab].den, den1)
      const tab2 = tab / den2
      const num2 = trouveNumerateur(den2, origine, data[tab].max, [
        { num: num1, den: den1 },
      ])
      const den3 = !this.sup2
        ? data[tab].id
        : choice(
            data[tab].den,
            data[tab].den.length > 2 ? [den1, den2] : [den1],
          )
      const tab3 = tab / den3
      const num3 = trouveNumerateur(den3, origine, data[tab].max, [
        { num: num1, den: den1 },
        { num: num2, den: den2 },
      ])
      texte =
        'Donner les abscisses respectives des points ' +
        remplisLesBlancs(
          this,
          i,
          `\\quad ${lettreIndiceeDepuisChiffre(i * 3 + 1)}\\; %{champ1} \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 2)} \\; %{champ2} \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 3)} \\;  %{champ3}`,
          'clavierDeBaseAvecFraction',
          '\\ldots',
        )
      handleAnswers(
        this,
        i,
        {
          bareme: (listePoints) => [
            listePoints[0] + listePoints[1] + listePoints[2],
            3,
          ],
          champ1: { value: fraction(num1, den1).reduire(tab1 * 2).texFraction },
          champ2: { value: fraction(num2, den2).reduire(tab2 * 2).texFraction },
          champ3: { value: fraction(num3, den3).reduire(tab3 * 2).texFraction },
        },
        { formatInteractif: 'fillInTheBlank' },
      )

      const tailleUnite = 20 / (data[tab].max - origine)
      const d = droiteGraduee({
        Min: origine,
        Max: data[tab].max,
        Unite: tailleUnite,
        thickSec: true,
        thickSecDist: 1 / data[tab].id,
        thickEpaisseur: 3,
        pointListe: [
          [num1 / den1, lettreIndiceeDepuisChiffre(i * 3 + 1)],
          [num2 / den2, lettreIndiceeDepuisChiffre(i * 3 + 2)],
          [num3 / den3, lettreIndiceeDepuisChiffre(i * 3 + 3)],
        ],
      })

      texte +=
        '<br>' +
        mathalea2d(
          {
            xmin: -0.2,
            xmax: (data[tab].max - origine) * tailleUnite + 1,
            ymin: -1,
            ymax: 1.5,
            scale: 0.6,
          },
          d,
        )
      const dCorr = droiteGraduee({
        Min: origine,
        Max: data[tab].max,
        Unite: tailleUnite,
        thickSec: true,
        thickSecDist: 1 / data[tab].id,
        thickEpaisseur: 3,
        pointListe: [
          [num1 / den1, lettreIndiceeDepuisChiffre(i * 3 + 1)],
          [num2 / den2, lettreIndiceeDepuisChiffre(i * 3 + 2)],
          [num3 / den3, lettreIndiceeDepuisChiffre(i * 3 + 3)],
        ],
        labelListe: [
          [num1 / den1, fraction(num1, den1).texFraction],
          [num2 / den2, fraction(num2, den2).texFraction],
          [num3 / den3, fraction(num3, den3).texFraction],
        ],
        labelDistance: 0.8,
        labelCustomDistance: 1.7,
      })

      const texteCorr = mathalea2d(
        {
          xmin: -0.2,
          xmax: (data[tab].max - origine) * tailleUnite + 1,
          ymin: -2.5,
          ymax: 1.5,
          scale: 0.6,
        },
        dCorr,
      )

      if (this.questionJamaisPosee(i, num1, num2, num3)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '\n',
            propositions: [
              {
                texte: texteCorr,
                statut: 5,
                sanscadre: true,
                pointilles: true,
                feedback: '',
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}

function trouveNumerateur(
  den: number,
  min: number,
  max: number,
  fractionsAEviter: { num: number; den: number }[] = [],
) {
  const isNombreEntier = function (nu: number, de: number) {
    if (nu % de === 0) return true
    return false
  }

  let trouve = false
  let num = 0
  let i = 0
  while (!trouve && i < 10) {
    num = randint(min * den, den * max)

    // on veut éviter l'entier
    let k = 0
    while (isNombreEntier(num, den) && k < 5) {
      num = randint(min * den, den * max)
      k++
    }

    // on veut éviter d'être trop proche d'un autre point
    trouve = true
    for (const fraction of fractionsAEviter) {
      if (Math.abs(fraction.num / fraction.den - num / den) < 2 / den) {
        trouve = false
        break
      }
    }
    i++
  }
  return num
}
