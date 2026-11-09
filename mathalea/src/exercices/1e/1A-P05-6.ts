import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '30/01/2026'
export const uuid = '8f0e3'

export const refs = {
  'fr-fr': ['1A-P05-6'],
  'fr-ch': [''],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Identifier une probabilité dans un tableau'

export default class ProbabiliteTableauIdentifier extends ExerciceQcmA {
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

    // Version originale : 7/17 correspond à P_{A_3}(S)
    this.enonce += '$\\dfrac{7}{17}$ est :'
    this.correction =
      `On cherche quelle probabilité vaut $\\dfrac{7}{17}$.<br>` +
      `La probabilité conditionnelle $P_{A_3}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Plus de $45$ ans${sp()}».<br>` +
      `Il y a $70$ personnes répondant aux deux critères sur $170$ personnes dans cette catégorie.<br>` +
      `Donc : $P_{A_3}(S)=\\dfrac{70}{170}=\\dfrac{7}{17}$<br>` +
      `La bonne réponse est donc ${miseEnEvidence('P_{A_3}(S)')}.`
    this.reponses = [
      '$P_{A_3}(S)$',
      '$P(A_3)$',
      '$P(S \\cap A_3)$',
      '$P_S(A_3)$',
    ]
  }

  versionAleatoire = () => {
    const cas = choice([1, 2])

    if (cas === 1) {
      // Tableau 1 : total 400 (valeurs différentes partout)
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

      this.enonce = this.genererEnonce(valeurs, 400)

      switch (typeQuestion) {
        case 1:
          // 7/17 correspond à P_{A_3}(S)
          this.enonce += '$\\dfrac{7}{17}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{7}{17}$.<br>` +
            `La probabilité conditionnelle $P_{A_3}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Plus de $45$ ans${sp()}».<br>` +
            `Il y a $70$ personnes répondant aux deux critères sur $170$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_3}(S)')}=\\dfrac{70}{170}=\\dfrac{7}{17}$.`
          this.reponses = [
            '$P_{A_3}(S)$',
            '$P(A_3)$',
            '$P(S \\cap A_3)$',
            '$P_S(A_3)$',
          ]
          break

        case 2:
          // 3/8 correspond à P(A_2)
          this.enonce += '$\\dfrac{3}{8}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{3}{8}$.<br>` +
            `L'événement $A_2$ correspond à la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $150$ personnes dans cette catégorie sur un total de $400$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(A_2)')}=\\dfrac{150}{400}=\\dfrac{3}{8}$.`

          this.reponses = [
            '$P(A_2)$',
            '$P(S \\cap A_2)$',
            '$P_{A_2}(S)$',
            '$P_S(A_2)$',
          ]
          break

        case 3:
          // 17/40 correspond à P(A_3)
          this.enonce += '$\\dfrac{17}{40}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{17}{40}$.<br>` +
            `L'événement $A_3$ correspond à la ligne «${sp()}Plus de $45$ ans${sp()}».<br>` +
            `Il y a $170$ personnes dans cette catégorie sur un total de $400$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(A_3)')}=\\dfrac{170}{400}=\\dfrac{17}{40}$.`

          this.reponses = [
            '$P(A_3)$',
            '$P(S \\cap A_3)$',
            '$P_{A_3}(S)$',
            '$P_S(A_3)$',
          ]
          break

        case 4:
          // 1/8 correspond à P(S ∩ A_1)
          this.enonce += '$\\dfrac{1}{8}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{1}{8}$.<br>` +
            `L'événement $S \\cap A_1$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
            `Il y a $50$ personnes dans cette catégorie sur un total de $400$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(S \\cap A_1)')}=\\dfrac{50}{400}=\\dfrac{1}{8}$.`
          this.reponses = [
            '$P(S \\cap A_1)$',
            '$P(A_1)$',
            '$P_{A_1}(S)$',
            '$P_S(A_1)$',
          ]
          break

        case 5:
          // 9/40 correspond à P(S ∩ A_2)
          this.enonce += '$\\dfrac{9}{40}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{9}{40}$.<br>` +
            `L'événement $S \\cap A_2$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $90$ personnes dans cette catégorie sur un total de $400$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(S \\cap A_2)')}=\\dfrac{90}{400}=\\dfrac{9}{40}$.`
          this.reponses = [
            '$P(S \\cap A_2)$',
            '$P(A_2)$',
            '$P_{A_2}(S)$',
            '$P_S(A_2)$',
          ]
          break

        case 6:
          // 5/8 correspond à P_{A_1}(S)
          this.enonce += '$\\dfrac{5}{8}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{5}{8}$.<br>` +
            `La probabilité conditionnelle $P_{A_1}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Moins de $25$ ans${sp()}».<br>` +
            `Il y a $50$ personnes répondant aux deux critères sur $80$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_1}(S)')}=\\dfrac{50}{80}=\\dfrac{5}{8}$.`
          this.reponses = [
            '$P_{A_1}(S)$',
            '$P(A_1)$',
            '$P(S \\cap A_1)$',
            '$P_S(A_1)$',
          ]
          break

        case 7:
          // 3/5 correspond à P_{A_2}(S)
          this.enonce += '$\\dfrac{3}{5}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{3}{5}$.<br>` +
            `La probabilité conditionnelle $P_{A_2}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $90$ personnes répondant aux deux critères sur $150$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_2}(S)')}=\\dfrac{90}{150}=\\dfrac{3}{5}$.`
          this.reponses = [
            '$P_{A_2}(S)$',
            '$P(A_2)$',
            '$P(S \\cap A_2)$',
            '$P_S(A_2)$',
          ]
          break

        case 8:
          // 2/5 correspond à P_{A_2}(\bar{S})
          this.enonce += '$\\dfrac{2}{5}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{2}{5}$.<br>` +
            `La probabilité conditionnelle $P_{A_2}(\\overline{S})$ se calcule parmi les personnes de la catégorie «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $60$ personnes ne pratiquant pas de sport sur $150$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_2}(\\overline{S})')}=\\dfrac{60}{150}=\\dfrac{2}{5}$.`
          this.reponses = [
            '$P_{A_2}(\\overline{S})$',
            '$P(\\overline{S} \\cap A_2)$',
            '$P_{\\overline{S}}(A_2)$',
            '$P(A_2)$',
          ]
          break
      }
    } else {
      // Tableau 2 : total 500 (valeurs différentes partout)
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
          // 5/11 correspond à P_{A_3}(S)
          this.enonce += '$\\dfrac{5}{11}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{5}{11}$.<br>` +
            `La probabilité conditionnelle $P_{A_3}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Plus de $45$ ans${sp()}».<br>` +
            `Il y a $100$ personnes répondant aux deux critères sur $220$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_3}(S)')}=\\dfrac{100}{220}=\\dfrac{5}{11}$.`
          this.reponses = [
            '$P_{A_3}(S)$',
            '$P(A_3)$',
            '$P(S \\cap A_3)$',
            '$P_S(A_3)$',
          ]
          break

        case 2:
          // 6/25 correspond à P(A_1)
          this.enonce += '$\\dfrac{6}{25}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{6}{25}$.<br>` +
            `L'événement $A_1$ correspond à la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
            `Il y a $120$ personnes dans cette catégorie sur un total de $500$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(A_1)')}=\\dfrac{120}{500}=\\dfrac{6}{25}$.`

          this.reponses = [
            '$P(A_1)$',
            '$P(S \\cap A_1)$',
            '$P_{A_1}(S)$',
            '$P_S(A_1)$',
          ]
          break

        case 3:
          // 11/25 correspond à P(A_3)
          this.enonce += '$\\dfrac{11}{25}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{11}{25}$.<br>` +
            `L'événement $A_3$ correspond à la ligne «${sp()}Plus de $45$ ans${sp()}».<br>` +
            `Il y a $220$ personnes dans cette catégorie sur un total de $500$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(A_3)')}=\\dfrac{220}{500}=\\dfrac{11}{25}$.`

          this.reponses = [
            '$P(A_3)$',
            '$P(S \\cap A_3)$',
            '$P_{A_3}(S)$',
            '$P_S(A_3)$',
          ]
          break

        case 4:
          // 4/25 correspond à P(S ∩ A_1)
          this.enonce += '$\\dfrac{4}{25}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{4}{25}$.<br>` +
            `L'événement $S \\cap A_1$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Moins de $25$ ans${sp()}».<br>` +
            `Il y a $80$ personnes dans cette catégorie sur un total de $500$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(S \\cap A_1)')}=\\dfrac{80}{500}=\\dfrac{4}{25}$.`

          this.reponses = [
            '$P(S \\cap A_1)$',
            '$P(A_1)$',
            '$P_{A_1}(S)$',
            '$P_S(A_1)$',
          ]
          break

        case 5:
          // 9/50 correspond à P(S ∩ A_2)
          this.enonce += '$\\dfrac{9}{50}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{9}{50}$.<br>` +
            `L'événement $S \\cap A_2$ correspond à l'intersection de la colonne «${sp()}Pratique un sport${sp()}» et de la ligne «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $90$ personnes dans cette catégorie sur un total de $500$ personnes.<br>` +
            `Donc : $${miseEnEvidence('P(S \\cap A_2)')}=\\dfrac{90}{500}=\\dfrac{9}{50}$.`
          this.reponses = [
            '$P(S \\cap A_2)$',
            '$P(A_2)$',
            '$P_{A_2}(S)$',
            '$P_S(A_2)$',
          ]
          break

        case 6:
          // 2/3 correspond à P_{A_1}(S)
          this.enonce += '$\\dfrac{2}{3}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{2}{3}$.<br>` +
            `La probabilité conditionnelle $P_{A_1}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Moins de $25$ ans${sp()}».<br>` +
            `Il y a $80$ personnes répondant aux deux critères sur $120$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_1}(S)')}=\\dfrac{80}{120}=\\dfrac{2}{3}$.`

          this.reponses = [
            '$P_{A_1}(S)$',
            '$P(A_1)$',
            '$P(S \\cap A_1)$',
            '$P_S(A_1)$',
          ]
          break

        case 7:
          // 9/16 correspond à P_{A_2}(S)
          this.enonce += '$\\dfrac{9}{16}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{9}{16}$.<br>` +
            `La probabilité conditionnelle $P_{A_2}(S)$ se calcule parmi les personnes de la catégorie «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $90$ personnes répondant aux deux critères sur $160$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_2}(S)')}=\\dfrac{90}{160}=\\dfrac{9}{16}$.`

          this.reponses = [
            '$P_{A_2}(S)$',
            '$P(A_2)$',
            '$P(S \\cap A_2)$',
            '$P_S(A_2)$',
          ]
          break

        case 8:
          // 7/16 correspond à P_{A_2}(\bar{S})
          this.enonce += '$\\dfrac{7}{16}$ est :'
          this.correction =
            `On cherche quelle probabilité vaut $\\dfrac{7}{16}$.<br>` +
            `La probabilité conditionnelle $P_{A_2}(\\overline{S})$ se calcule parmi les personnes de la catégorie «${sp()}Entre $25$ et $45$ ans${sp()}».<br>` +
            `Il y a $70$ personnes ne pratiquant pas de sport sur $160$ personnes dans cette catégorie.<br>` +
            `Donc : $${miseEnEvidence('P_{A_2}(\\overline{S})')}=\\dfrac{70}{160}=\\dfrac{7}{16}$.`

          this.reponses = [
            '$P_{A_2}(\\overline{S})$',
            '$P(\\overline{S} \\cap A_2)$',
            '$P_{\\overline{S}}(A_2)$',
            '$P(A_2)$',
          ]
          break
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
