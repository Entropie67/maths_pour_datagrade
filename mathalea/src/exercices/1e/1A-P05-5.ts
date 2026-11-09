import { tableauColonneLigne } from '../../lib/2d/tableau'
import { sp } from '../../lib/outils/outilString'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
export const dateDePublication = '30/01/2026'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '4b968'

export const refs = {
  'fr-fr': ['1A-P05-5'],
  'fr-ch': [''],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Calculer une probabilité dans un tableau'

export default class ProbabiliteTableau extends ExerciceQcmACourt {
  private genererEnonce(valeurs: string[], totalPersonnes: number): string {
    const enonceCommunDebut = `On interroge un groupe de $${totalPersonnes}$ personnes sur leurs habitudes sportives. Les réponses sont consignées dans le tableau ci-dessous :<br><br>`

    const tableau = tableauColonneLigne(
      [
        '',
        '\\text{Pratique un sport}',
        '\\text{Ne pratique pas de sport}',
        '\\text{Total}',
      ],
      [
        '\\text{Moins de }25\\text{ ans}',
        '\\text{Entre }25\\text{ et }45\\text{ ans}',
        '\\text{Plus de }45\\text{ ans}',
        '\\text{Total}',
      ],
      valeurs,
    )

    const enonceCommunFin =
      '<br><br>On choisit une personne de ce groupe au hasard et on définit les événements suivants : ' +
      `$S$ «${sp()}la personne pratique un sport${sp()}», ` +
      `$A_1$ «${sp()}la personne a moins de $25$ ans${sp()}», ` +
      `$A_2$ «${sp()}la personne a entre $25$ et $45$ ans${sp()}» et ` +
      `$A_3$ «${sp()}la personne a plus de $45$ ans${sp()}».<br><br>`

    return enonceCommunDebut + tableau + enonceCommunFin
  }

  private appliquerLesValeurs(
    valeurs: string[],
    typeQuestion: number,
    totalPersonnes: number,
  ): void {
    this.enonce = this.genererEnonce(valeurs, totalPersonnes)

    switch (typeQuestion) {
      case 1:
        // P(A_2)
        this.enonce += '$P(A_2)$ est égal à :'
        this.correction =
          `L'événement $A_2$ correspond à la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
          `Il y a $150$ personnes dans cette catégorie sur un total de $${totalPersonnes}$ personnes.<br>` +
          `Donc : $P(A_2)=\\dfrac{150}{${totalPersonnes}}=${miseEnEvidence('\\dfrac{3}{8}')}$.`
        this.reponses = [
          '$\\dfrac{3}{8}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{17}{40}$',
          '$\\dfrac{21}{40}$',
        ]
        break

      case 2:
        // P(A_3)
        this.enonce += '$P(A_3)$ est égal à :'
        this.correction =
          `L'événement $A_3$ correspond à la ligne «${sp()}Plus de $45$ ans${sp()}».<br>` +
          `Il y a $170$ personnes dans cette catégorie sur un total de $${totalPersonnes}$ personnes.<br>` +
          `Donc : $P(A_3)=\\dfrac{170}{${totalPersonnes}}=${miseEnEvidence('\\dfrac{17}{40}')}$.`
        this.reponses = [
          '$\\dfrac{17}{40}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{3}{8}$',
          '$\\dfrac{21}{40}$',
        ]
        break

      case 3:
        // P(S ∩ A_1)
        this.enonce += '$P(S \\cap A_1)$ est égal à :'
        this.correction =
          `L'événement $S \\cap A_1$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
          `Il y a $50$ personnes dans cette catégorie sur un total de $${totalPersonnes}$ personnes.<br>` +
          `Donc : $P(S \\cap A_1)=\\dfrac{50}{${totalPersonnes}}=${miseEnEvidence('\\dfrac{1}{8}')}$.`
        this.reponses = [
          '$\\dfrac{1}{8}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{3}{20}$',
          '$\\dfrac{7}{40}$',
        ]
        break

      case 4:
        // P(S ∩ A_2)
        this.enonce += '$P(S \\cap A_2)$ est égal à :'
        this.correction =
          `L'événement $S \\cap A_2$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
          `Il y a $90$ personnes dans cette catégorie sur un total de $${totalPersonnes}$ personnes.<br>` +
          `Donc : $P(S \\cap A_2)=\\dfrac{90}{${totalPersonnes}}=${miseEnEvidence('\\dfrac{9}{40}')}$.`
        this.reponses = [
          '$\\dfrac{9}{40}$',
          '$\\dfrac{1}{8}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{3}{20}$',
        ]
        break

      case 5:
        // P_{A_1}(S)
        this.enonce += '$P_{A_1}(S)$ est égal à :'
        this.correction =
          "$P_{A_1}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a moins de $25$ ans.<br>" +
          'Il y a $80$ personnes de moins de $25$ ans et parmi elles, $50$  sont sportives.<br>' +
          `Donc : $P_{A_1}(S)=\\dfrac{50}{80}=${miseEnEvidence('\\dfrac{5}{8}')}$.`
        this.reponses = [
          '$\\dfrac{5}{8}$',
          '$\\dfrac{3}{8}$',
          '$\\dfrac{1}{8}$',
          '$\\dfrac{7}{8}$',
        ]
        break

      case 6:
        // P_{A_2}(S)
        this.enonce += '$P_{A_2}(S)$ est égal à :'
        this.correction =
          "$P_{A_2}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a entre $25$ et $45$ ans.<br>" +
          'Il y a $150$ personnes entre $25$ et $45$ ans et parmi elles, $90$ sont sportives.<br>' +
          `Donc : $P_{A_2}(S)=\\dfrac{90}{150}=${miseEnEvidence('\\dfrac{3}{5}')}$.`
        this.reponses = [
          '$\\dfrac{3}{5}$',
          '$\\dfrac{2}{5}$',
          '$\\dfrac{9}{40}$',
          '$\\dfrac{7}{10}$',
        ]
        break

      case 7:
        // P_{A_3}(S)
        this.enonce += '$P_{A_3}(S)$ est égal à :'
        this.correction =
          "$P_{A_3}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a plus de $45$ ans.<br>" +
          'Il y a $170$ personnes de plus de $45$ ans et parmi elles, $70$ sont sportives.<br>' +
          `Donc : $P_{A_3}(S)=\\dfrac{70}{170}=${miseEnEvidence('\\dfrac{7}{17}')}$.`
        this.reponses = [
          '$\\dfrac{7}{17}$',
          '$\\dfrac{7}{20}$',
          '$\\dfrac{10}{17}$',
          '$\\dfrac{7}{40}$',
        ]
        break

      case 8:
        // P_{A_2}(non S)
        this.enonce += '$P_{A_2}(\\overline{S})$ est égal à :'
        this.correction =
          "$P_{A_2}(\\overline{S})$ est la probabilité qu'une personne ne pratique pas de sport sachant qu'elle a entre $25$ et $45$ ans.<br>" +
          'Il y a $150$ personnes entre $25$ et $45$ ans et parmi elles, $60$ ne pratiquent pas de sport.<br>' +
          `Donc : $P_{A_2}(\\overline{S})=\\dfrac{60}{150}=${miseEnEvidence('\\dfrac{2}{5}')}$.`
        this.reponses = [
          '$\\dfrac{2}{5}$',
          '$\\dfrac{3}{5}$',
          '$\\dfrac{3}{20}$',
          '$\\dfrac{3}{10}$',
        ]
        break
    }
  }

  versionOriginale: () => void = () => {
    const valeurs = [
      '50',
      '30',
      '80',
      '90',
      '60',
      '150',
      '70',
      '100',
      '170',
      '210',
      '190',
      '400',
    ]

    this.enonce = this.genererEnonce(valeurs, 400)

    // Version originale : P_{A_3}(S)
    this.enonce += '$P_{A_3}(S)$ est égal à :'
    this.correction =
      "$P_{A_3}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a plus de $45$ ans.<br>" +
      'Il y a $170$ personnes de plus de $45$ ans et parmi elles, $70$ sont sportives.<br>' +
      `Donc : $P_{A_3}(S)=\\dfrac{70}{170}=${miseEnEvidence('\\dfrac{7}{17}')}$.`
    this.reponses = [
      '$\\dfrac{7}{17}$',
      '$\\dfrac{7}{20}$',
      '$\\dfrac{10}{17}$',
      '$\\dfrac{7}{40}$',
    ]
  }

  versionAleatoire = () => {
    const cas = choice([1, 2])

    if (cas === 1) {
      const valeurs = [
        '50',
        '30',
        '80',
        '90',
        '60',
        '150',
        '70',
        '100',
        '170',
        '210',
        '190',
        '400',
      ]
      const typeQuestion = choice([1, 2, 3, 4, 5, 6, 7, 8])
      this.appliquerLesValeurs(valeurs, typeQuestion, 400)
    } else {
      const valeurs = [
        '80',
        '40',
        '120',
        '90',
        '70',
        '160',
        '100',
        '120',
        '220',
        '270',
        '230',
        '500',
      ]
      const typeQuestion = choice([1, 2, 3, 4, 5, 6, 7, 8])

      this.enonce = this.genererEnonce(valeurs, 500)

      switch (typeQuestion) {
        case 1:
          // P(A_1)
          this.enonce += '$P(A_1)$ est égal à :'
          this.correction =
            `L'événement $A_1$ correspond à la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
            'Il y a $120$ personnes dans cette catégorie sur un total de $500$ personnes.<br>' +
            `Donc : $P(A_1)=\\dfrac{120}{500}=${miseEnEvidence('\\dfrac{6}{25}')}$.`
          this.reponses = [
            '$\\dfrac{6}{25}$',
            '$\\dfrac{3}{20}$',
            '$\\dfrac{3}{10}$',
            '$\\dfrac{11}{20}$',
          ]
          break

        case 2:
          // P(A_3)
          this.enonce += '$P(A_3)$ est égal à :'
          this.correction =
            `L'événement $A_3$ correspond à la ligne «${sp()}Plus de $45$ ans${sp()}».<br>` +
            'Il y a $220$ personnes dans cette catégorie sur un total de $500$ personnes.<br>' +
            `Donc : $P(A_3)=\\dfrac{220}{500}=${miseEnEvidence('\\dfrac{11}{25}')}$.`
          this.reponses = [
            '$\\dfrac{11}{25}$',
            '$\\dfrac{1}{4}$',
            '$\\dfrac{3}{10}$',
            '$\\dfrac{11}{20}$',
          ]
          break

        case 3:
          // P(S ∩ A_1)
          this.enonce += '$P(S \\cap A_1)$ est égal à :'
          this.correction =
            `L'événement $S \\cap A_1$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
            'Il y a $80$ personnes dans cette catégorie sur un total de $500$ personnes.<br>' +
            `Donc : $P(S \\cap A_1)=\\dfrac{80}{500}=${miseEnEvidence('\\dfrac{4}{25}')}$.`
          this.reponses = [
            '$\\dfrac{4}{25}$',
            '$\\dfrac{1}{4}$',
            '$\\dfrac{7}{40}$',
            '$\\dfrac{3}{10}$',
          ]
          break

        case 4:
          // P(S ∩ A_2)
          this.enonce += '$P(S \\cap A_2)$ est égal à :'
          this.correction =
            `L'événement $S \\cap A_2$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            'Il y a $90$ personnes dans cette catégorie sur un total de $500$ personnes.<br>' +
            `Donc : $P(S \\cap A_2)=\\dfrac{90}{500}=${miseEnEvidence('\\dfrac{9}{50}')}$.`
          this.reponses = [
            '$\\dfrac{9}{50}$',
            '$\\dfrac{1}{4}$',
            '$\\dfrac{3}{20}$',
            '$\\dfrac{3}{10}$',
          ]
          break

        case 5:
          // P_{A_1}(S)
          this.enonce += '$P_{A_1}(S)$ est égal à :'
          this.correction =
            "$P_{A_1}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a moins de $25$ ans.<br>" +
            'Il y a $120$ personnes de moins de $25$ ans et parmi elles, $80$ sont sportives.<br>' +
            `Donc : $P_{A_1}(S)=\\dfrac{80}{120}=${miseEnEvidence('\\dfrac{2}{3}')}$.`
          this.reponses = [
            '$\\dfrac{2}{3}$',
            '$\\dfrac{2}{5}$',
            '$\\dfrac{3}{20}$',
            '$\\dfrac{3}{10}$',
          ]
          break

        case 6:
          // P_{A_2}(S)
          this.enonce += '$P_{A_2}(S)$ est égal à :'
          this.correction =
            "$P_{A_2}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a entre $25$ et $45$ ans.<br>" +
            'Il y a $160$ personnes entre $25$ et $45$ ans et parmi elles, $90$ sont sportives.<br>' +
            `Donc : $P_{A_2}(S)=\\dfrac{90}{160}=${miseEnEvidence('\\dfrac{9}{16}')}$`
          this.reponses = [
            '$\\dfrac{9}{16}$',
            '$\\dfrac{7}{40}$',
            '$\\dfrac{5}{12}$',
            '$\\dfrac{3}{10}$',
          ]
          break

        case 7:
          // P_{A_3}(S)
          this.enonce += '$P_{A_3}(S)$ est égal à :'
          this.correction =
            "$P_{A_3}(S)$ est la probabilité qu'une personne pratique un sport sachant qu'elle a plus de $45$ ans.<br>" +
            'Il y a $220$ personnes de plus de $45$ ans et parmi elles, $100$ sont sportives.<br>' +
            `Donc : $P_{A_3}(S)=\\dfrac{100}{220}=${miseEnEvidence('\\dfrac{5}{11}')}$.`
          this.reponses = [
            '$\\dfrac{5}{11}$',
            '$\\dfrac{9}{40}$',
            '$\\dfrac{9}{20}$',
            '$\\dfrac{11}{40}$',
          ]
          break

        case 8:
          // P_{A_2}(non S)
          this.enonce += '$P_{A_2}(\\overline{S})$ est égal à :'
          this.correction =
            "$P_{A_2}(\\overline{S})$ est la probabilité qu'une personne ne pratique pas de sport sachant qu'elle a entre $25$ et $45$ ans.<br>" +
            'Il y a $160$ personnes entre $25$ et $45$ ans et parmi elles, $70$ ne pratiquent pas de sport.<br>' +
            `Donc : $P_{A_2}(\\overline{S})=\\dfrac{70}{160}=${miseEnEvidence('\\dfrac{7}{16}')}$.`
          this.reponses = [
            '$\\dfrac{7}{16}$',
            '$\\dfrac{3}{5}$',
            '$\\dfrac{1}{10}$',
            '$\\dfrac{9}{20}$',
          ]
          break
      }
    }
  }

  constructor() {
    super()
    // Saisie libre (version QCM désactivée) : la dernière phrase devient une question
    this.enonceCourt = () =>
      this.enonce.replace(/\$([^$]+)\$ est égal à :\s*$/, (_, p: string) =>
        this.interactif ? `$${p}=$` : `Calculer $${p}$.`,
      )

    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { fractionEgale: true })

    this.versionAleatoire()
  }
}
