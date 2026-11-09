import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Compléter un tableau croisé et calculer une proportion'
export const dateDePublication = '19/08/2026'
export const uuid = 'db763'
export const interactifReady = true

export const refs = {
  'fr-fr': ['2S10-1'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  colonnes: [string, string]
  lignes: [string, string]
  intersection: string
  ligne: string
  colonne: string
}

const scenarios: Scenario[] = [
  {
    introduction:
      "Une école de musique répartit ses élèves selon leur âge et le type de cours qu'ils suivent.",
    colonnes: ['Mineurs', 'Majeurs'],
    lignes: ['Cours individuel', 'Cours collectif'],
    intersection: "d'élèves mineurs qui suivent un cours individuel",
    ligne: 'élèves qui suivent un cours individuel',
    colonne: 'élèves mineurs',
  },
  {
    introduction:
      "Une association de réparation classe les objets apportés selon leur nature et selon qu'ils ont pu être réparés ou non.",
    colonnes: ['Appareils électriques', 'Objets textiles'],
    lignes: ['Réparés', 'Non réparés'],
    intersection: "d'objets électriques réparés",
    ligne: 'objets réparés',
    colonne: 'objets électriques',
  },
  {
    introduction:
      "Lors d'un festival, les participants sont répartis selon leur lieu de résidence et l'atelier choisi.",
    colonnes: ['Habitants de la ville', 'Visiteurs'],
    lignes: ['Atelier théâtre', 'Atelier danse'],
    intersection:
      "de participants habitant la ville et inscrits à l'atelier théâtre",
    ligne: "participants inscrits à l'atelier théâtre",
    colonne: 'participants habitant la ville',
  },
]

type TypeQuestion = 'total' | 'ligne' | 'colonne'

/**
 * Compléter un tableau croisé d'effectifs puis calculer une proportion.
 * @author Stéphane Guyon
 */
export default class TableauCroiseProportion extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      '1 : École de musique\n2 : Association de réparation\n3 : Festival\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario >= 1 && numeroScenario <= 3
        ? scenarios[numeroScenario - 1]
        : choice(scenarios)
    const [a, b, c, d] = choice([
      [24, 16, 16, 24],
      [18, 12, 27, 43],
      [21, 9, 14, 36],
      [28, 12, 21, 39],
      [30, 20, 20, 30],
    ])
    const totalLigne1 = a + b
    const totalLigne2 = c + d
    const totalColonne1 = a + c
    const totalColonne2 = b + d
    const total = totalLigne1 + totalLigne2
    const valeurs = [
      a,
      b,
      totalLigne1,
      c,
      d,
      totalLigne2,
      totalColonne1,
      totalColonne2,
      total,
    ]
    const configuration = choice([1, 2, 3])
    const indicesDonnes =
      configuration === 1
        ? [0, 2, 7, 8]
        : configuration === 2
          ? [1, 2, 6, 8]
          : [3, 5, 7, 8]
    const donneesEnonce = valeurs.map((valeur, indice) =>
      indicesDonnes.includes(indice) ? String(valeur) : '',
    )
    const coordonnees = [
      'L1C1',
      'L1C2',
      'L1C3',
      'L2C1',
      'L2C2',
      'L2C3',
      'L3C1',
      'L3C2',
      'L3C3',
    ]
    const entetesColonnes = [
      '~',
      `\\text{${scenario.colonnes[0]}}`,
      `\\text{${scenario.colonnes[1]}}`,
      '\\text{Total}',
    ]
    const entetesLignes = [
      `\\text{${scenario.lignes[0]}}`,
      `\\text{${scenario.lignes[1]}}`,
      '\\text{Total}',
    ]
    const typesQuestionsPossibles = (
      ['total', 'ligne', 'colonne'] as TypeQuestion[]
    ).filter((type) => {
      const denominateurTeste =
        type === 'total'
          ? total
          : type === 'ligne'
            ? totalLigne1
            : totalColonne1
      return Number.isInteger(((100 * a) / denominateurTeste) * 10)
    })
    const typeQuestion = choice(typesQuestionsPossibles)
    const denominateur =
      typeQuestion === 'total'
        ? total
        : typeQuestion === 'ligne'
          ? totalLigne1
          : totalColonne1
    const pourcentage = (100 * a) / denominateur
    const complementQuestion =
      typeQuestion === 'total'
        ? "dans l'ensemble de la population"
        : typeQuestion === 'ligne'
          ? `parmi les ${scenario.ligne}`
          : `parmi les ${scenario.colonne}`
    const question = `Quelle est la proportion ${scenario.intersection} ${complementQuestion} ? Donner le résultat en pourcentage.`

    const tableauCorrection = tableauColonneLigne(
      entetesColonnes,
      entetesLignes,
      valeurs.map(String),
      1.5,
    )

    if (this.interactif) {
      const tableauMathlive =
        AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          entetesColonnes,
          entetesLignes,
          donneesEnonce,
        )
      const renduTableauBase = AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        0,
        tableauMathlive,
        KeyboardType.clavierNumbers ?? '',
        true,
        {},
      ).output
      const prefixeChamp = `champTexteEx${this.numeroExercice ?? 0}Q0`
      const champProportion = `<math-field id="${prefixeChamp}L4C1" class="tableauMathlive" virtual-keyboard-mode="manual" style="display:inline-block; min-width:4rem; min-height:2.2rem; margin:0 0.35rem; border:1px solid #b8b8b8; border-radius:0.35rem; vertical-align:middle"></math-field>`
      const questionInteractive = `<caption style="caption-side:bottom; padding-top:1rem; text-align:left">Réponse : ${champProportion} $\\%$</caption>`
      const renduTableau = renduTableauBase.replace(
        '</table>',
        `${questionInteractive}</table>`,
      )

      this.listeQuestions[0] = `${scenario.introduction}<br><br>
Compléter le tableau, puis répondre à la question suivante.<br><br>
${question}<br><br>
${renduTableau}`

      const reponses: Record<string, unknown> = {}
      valeurs.forEach((valeur, indice) => {
        if (!indicesDonnes.includes(indice)) {
          reponses[coordonnees[indice]] = { value: valeur }
        }
      })
      reponses.L4C1 = { value: pourcentage }
      handleAnswers(this, 0, reponses, {
        formatInteractif: 'tableauMathlive',
      })
    } else {
      const donneesPapier = donneesEnonce.map((valeur) =>
        valeur === '' ? '\\ldots' : valeur,
      )
      const tableauEnonce = tableauColonneLigne(
        entetesColonnes,
        entetesLignes,
        donneesPapier,
        1.5,
      )
      this.listeQuestions[0] = `${scenario.introduction}<br><br>
Compléter le tableau, puis répondre à la question.<br><br>
${tableauEnonce}<br>
${question}`
    }

    const etapesCompletion =
      configuration === 1
        ? `Dans la première ligne : $${totalLigne1}-${a}=${b}$.<br>
Dans la deuxième colonne : $${totalColonne2}-${b}=${d}$.<br>
Le total de la deuxième ligne vaut $${total}-${totalLigne1}=${totalLigne2}$.<br>
Dans la deuxième ligne : $${totalLigne2}-${d}=${c}$.<br>
Enfin, le total de la première colonne est $${a}+${c}=${totalColonne1}$.`
        : configuration === 2
          ? `Dans la première ligne : $${totalLigne1}-${b}=${a}$.<br>
Dans la première colonne : $${totalColonne1}-${a}=${c}$.<br>
Le total de la deuxième ligne vaut $${total}-${totalLigne1}=${totalLigne2}$.<br>
Dans la deuxième ligne : $${totalLigne2}-${c}=${d}$.<br>
Enfin, le total de la deuxième colonne est $${b}+${d}=${totalColonne2}$.`
          : `Dans la deuxième ligne : $${totalLigne2}-${c}=${d}$.<br>
Dans la deuxième colonne : $${totalColonne2}-${d}=${b}$.<br>
Le total de la première ligne vaut $${total}-${totalLigne2}=${totalLigne1}$.<br>
Dans la première ligne : $${totalLigne1}-${b}=${a}$.<br>
Enfin, le total de la première colonne est $${a}+${c}=${totalColonne1}$.`
    this.listeCorrections[0] = `On complète le tableau étape par étape.<br><br>
${etapesCompletion}<br><br>
${tableauCorrection}<br>
Pour calculer la proportion demandée, l'effectif de référence est $${denominateur}$.<br>
$\\dfrac{${a}}{${denominateur}}\\times 100=${texNombre(pourcentage, 1)}$.<br>
La proportion cherchée est donc $${miseEnEvidence(`${texNombre(pourcentage, 1)}\\,\\%`)}$.`

    listeQuestionsToContenu(this)
  }
}
