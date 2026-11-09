import { tableauColonneLigne } from '../../lib/2d/tableau'
import { seq, valueInInterval } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  "Déterminer une médiane ou un quartile à partir d'un tableau d'effectifs"
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '640f6'

export const refs = {
  'fr-fr': ['2S20-5'],
  'fr-ch': ['NR'],
}

type Indicateur = 'mediane' | 'q1' | 'q3'

interface Situation {
  introduction: string
  intituleValeurs: string
  intituleEffectifs: string
  valeurs: number[]
  effectifs: number[]
}

function valeurDeRang(
  valeurs: number[],
  effectifsCumules: number[],
  rang: number,
): number {
  return valeurs[effectifsCumules.findIndex((effectif) => effectif >= rang)]
}

function ecritureDecimaleFrancaise(valeur: number): string {
  return String(valeur).replace('.', '{,}')
}

/**
 * @author Arnaud Meistermann
 */
export default class DeterminerMedianeQuartilesTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Indicateur à calculer',
      '1 : Médiane\n2 : Premier quartile Q1\n3 : Troisième quartile Q3\n4 : Mélange',
    ]
    this.sup = 4
  }

  nouvelleVersion() {
    const listeIndicateurs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      listeOfCase: ['mediane', 'q1', 'q3'] satisfies Indicateur[],
      nbQuestions: this.nbQuestions,
    }) as Indicateur[]
    const listeSituations = combinaisonListes([0, 1, 2, 3], this.nbQuestions)

    for (let i = 0; i < this.nbQuestions; i++) {
      const situations: Situation[] = [
        {
          introduction:
            "Une enquête a été réalisée sur le nombre d'occupants par véhicule lors du passage au péage d'une autoroute. Les résultats de cette enquête sont consignés dans le tableau ci-dessous.",
          intituleValeurs: "Nombre d'occupants",
          intituleEffectifs: 'Nombre de véhicules',
          valeurs: [1, 2, 3, 4, 5],
          effectifs: Array.from({ length: 5 }, () => 50 * randint(1, 8)),
        },
        {
          introduction:
            "On a relevé le nombre de livres empruntés au CDI par les élèves d'un groupe pendant un mois. Les résultats sont consignés dans le tableau ci-dessous.",
          intituleValeurs: 'Nombre de livres empruntés',
          intituleEffectifs: "Nombre d'élèves",
          valeurs: [0, 1, 2, 3, 4],
          effectifs: [
            randint(1, 10),
            ...Array.from({ length: 4 }, () => randint(0, 10)),
          ],
        },
        {
          introduction:
            "Une enquête a été menée auprès de familles sur leur nombre d'enfants. Les résultats sont consignés dans le tableau ci-dessous.",
          intituleValeurs: "Nombre d'enfants",
          intituleEffectifs: 'Nombre de familles',
          valeurs: [0, 1, 2, 3, 4],
          effectifs: Array.from({ length: 5 }, () => randint(5, 40)),
        },
        {
          introduction:
            "On a relevé le nombre de buts marqués par les équipes lors d'une journée de championnat. Les résultats sont consignés dans le tableau ci-dessous.",
          intituleValeurs: 'Nombre de buts marqués',
          intituleEffectifs: "Nombre d'équipes",
          valeurs: [0, 1, 2, 3, 4],
          effectifs: Array.from({ length: 5 }, () => randint(1, 10)),
        },
      ]
      const situation = situations[listeSituations[i]]
      const { effectifs, valeurs } = situation
      const effectifsCumules = effectifs.map((_, index) =>
        effectifs
          .slice(0, index + 1)
          .reduce((somme, valeur) => somme + valeur, 0),
      )
      const effectifTotal = effectifsCumules[4]
      const indicateur = listeIndicateurs[i]
      const tableau = tableauColonneLigne(
        [
          `\\text{${situation.intituleValeurs}}`,
          ...valeurs.map((x) => texNombre(x, 0)),
        ],
        [`\\text{${situation.intituleEffectifs}}`],
        effectifs.map((x) => texNombre(x, 0)),
      )
      const tableauCumule = tableauColonneLigne(
        [
          `\\text{${situation.intituleValeurs}}`,
          ...valeurs.map((x) => texNombre(x, 0)),
        ],
        ['\\text{Effectif}', '\\text{Effectif cumulé croissant}'],
        [...effectifs, ...effectifsCumules].map((x) => texNombre(x, 0)),
      )

      let demande: string
      let inviteReponse: string
      let correctionCalcul: string
      let resultat: string
      let bornesMedianes: [number, number] | undefined

      if (indicateur === 'q1') {
        const rang = Math.ceil(effectifTotal / 4)
        const q1 = valeurDeRang(valeurs, effectifsCumules, rang)
        demande = 'Déterminer le premier quartile $Q_1$ de cette série.'
        inviteReponse = 'Le premier quartile est égal à '
        resultat = String(q1)
        correctionCalcul =
          `Le premier quartile est la plus petite valeur pour laquelle au moins $25\\,\\%$ des données lui sont inférieures ou égales.<br>` +
          'Pour trouver son rang, on prend le plus petit entier supérieur ou égal à $\\dfrac{N}{4}$.<br>' +
          '$\\dfrac{' +
          texNombre(effectifTotal) +
          '}{4}=' +
          ecritureDecimaleFrancaise(effectifTotal / 4) +
          '$.<br>Son rang est donc $' +
          rang +
          '$.<br>' +
          "D'après les effectifs cumulés, la valeur de rang $" +
          rang +
          '$ est $' +
          q1 +
          '$.<br>Ainsi, $Q_1=' +
          miseEnEvidence(q1) +
          '$.'
      } else if (indicateur === 'q3') {
        const rang = Math.ceil((3 * effectifTotal) / 4)
        const q3 = valeurDeRang(valeurs, effectifsCumules, rang)
        demande = 'Déterminer le troisième quartile $Q_3$ de cette série.'
        inviteReponse = 'Le troisième quartile est égal à '
        resultat = String(q3)
        correctionCalcul =
          `Le troisième quartile est la plus petite valeur pour laquelle au moins $75\\,\\%$ des données lui sont inférieures ou égales.<br>` +
          'Pour trouver son rang, on prend le plus petit entier supérieur ou égal à $\\dfrac{3N}{4}$.<br>' +
          '$\\dfrac{3\\times' +
          texNombre(effectifTotal) +
          '}{4}=' +
          ecritureDecimaleFrancaise((3 * effectifTotal) / 4) +
          '$.<br>Son rang est donc $' +
          rang +
          '$.<br>' +
          "D'après les effectifs cumulés, la valeur de rang $" +
          rang +
          '$ est $' +
          q3 +
          '$.<br>Ainsi, $Q_3=' +
          miseEnEvidence(q3) +
          '$.'
      } else {
        demande = 'Déterminer une médiane de cette série.'
        inviteReponse = 'Une valeur possible de la médiane est '
        if (effectifTotal % 2 === 0) {
          const rang1 = effectifTotal / 2
          const rang2 = rang1 + 1
          const valeur1 = valeurDeRang(valeurs, effectifsCumules, rang1)
          const valeur2 = valeurDeRang(valeurs, effectifsCumules, rang2)
          bornesMedianes = [valeur1, valeur2]
          const mediane = new FractionEtendue(valeur1 + valeur2, 2).simplifie()
          resultat = mediane.texFractionSimplifiee
          correctionCalcul =
            "L'effectif de la série est pair.<br>" +
            '$\\dfrac{' +
            texNombre(effectifTotal) +
            '}{2}=' +
            rang1 +
            '$. La médiane est donc entre la $' +
            rang1 +
            '^{\\text{e}}$ et la $' +
            rang2 +
            '^{\\text{e}}$ valeur.<br>' +
            "D'après les effectifs cumulés, ces valeurs sont $" +
            valeur1 +
            '$ et $' +
            valeur2 +
            '$.<br>Une valeur possible de la médiane est :<br>' +
            '$\\dfrac{' +
            valeur1 +
            '+' +
            valeur2 +
            '}{2}=' +
            miseEnEvidence(resultat) +
            '$.'
        } else {
          const rang = (effectifTotal + 1) / 2
          const mediane = valeurDeRang(valeurs, effectifsCumules, rang)
          bornesMedianes = [mediane, mediane]
          resultat = String(mediane)
          correctionCalcul =
            "L'effectif de la série est impair.<br>" +
            '$\\dfrac{' +
            effectifTotal +
            '}{2}=' +
            ecritureDecimaleFrancaise(effectifTotal / 2) +
            '$. La médiane est donc la $' +
            rang +
            '^{\\text{e}}$ valeur.<br>' +
            "D'après les effectifs cumulés, cette valeur est $" +
            miseEnEvidence(mediane) +
            '$.'
        }
      }

      let question = situation.introduction + '<br>' + tableau
      if (this.interactif) {
        question += '<br>' + inviteReponse
        question += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBase,
        )
      } else {
        question += '<br>' + demande
      }

      const somme = effectifs.join('+') + '=' + texNombre(effectifTotal)
      const correction =
        "L'effectif total est $N=" +
        somme +
        '$.<br>' +
        'On complète le tableau avec les effectifs cumulés croissants :<br>' +
        tableauCumule +
        '<br>' +
        correctionCalcul

      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          ...(bornesMedianes == null
            ? {}
            : {
                compare: (saisie: string) =>
                  seq([valueInInterval()])(
                    saisie,
                    `[${bornesMedianes[0]};${bornesMedianes[1]}]`,
                  ),
              }),
        },
      })
      this.listeQuestions[i] = question
      this.listeCorrections[i] = correction
    }
    listeQuestionsToContenu(this)
  }
}
