import { traceBarre } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  "Déterminer la médiane et la moyenne à partir d'un diagramme"
export const dateDePublication = '20/08/2026'
export const uuid = 'b83f2'
export const interactifReady = true

export const refs = {
  'fr-fr': ['2S20-12'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  premieresValeurs: number[]
  titreValeurs: string
  titreEffectifs: string
  descriptionTableau: string
  libelleMediane: string
  libelleMoyenne: string
  unite: string
}

const scenarios: Scenario[] = [
  {
    introduction: "Un club de sport s'intéresse à l'âge de ses adhérents.",
    premieresValeurs: [16, 17, 18, 19, 20],
    titreValeurs: 'Âge',
    titreEffectifs: "Nombre d'adhérents",
    descriptionTableau: "l'âge des adhérents",
    libelleMediane: 'Âge médian',
    libelleMoyenne: 'Âge moyen',
    unite: 'ans',
  },
  {
    introduction:
      "Une médiathèque étudie le nombre de livres empruntés durant l'été par ses abonnés.",
    premieresValeurs: [1, 2, 3],
    titreValeurs: 'Livres empruntés',
    titreEffectifs: "Nombre d'abonnés",
    descriptionTableau: 'le nombre de livres empruntés',
    libelleMediane: 'Nombre médian de livres',
    libelleMoyenne: 'Nombre moyen de livres',
    unite: 'livres',
  },
  {
    introduction:
      'Un établissement étudie le nombre de séances sportives pratiquées pendant une semaine par ses élèves.',
    premieresValeurs: [1, 2, 3],
    titreValeurs: 'Séances sportives',
    titreEffectifs: "Nombre d'élèves",
    descriptionTableau: 'le nombre de séances sportives',
    libelleMediane: 'Nombre médian de séances',
    libelleMoyenne: 'Nombre moyen de séances',
    unite: 'séances',
  },
]

function construitDiagramme(
  valeurs: number[],
  effectifs: number[],
  scenario: Scenario,
): string {
  const objets: NestedObjetMathalea2dArray = []
  const maximum = Math.max(...effectifs)
  const ordonneeMax = maximum + 10
  const axeHorizontal = segment(0, 0, 7.2, 0, 'black')
  const axeVertical = segment(0, 0, 0, ordonneeMax / 10 + 0.3, 'black')
  axeHorizontal.styleExtremites = '->'
  axeVertical.styleExtremites = '->'
  objets.push(axeHorizontal, axeVertical)

  for (let graduation = 0; graduation <= ordonneeMax; graduation += 10) {
    const y = graduation / 10
    const ligneGuide = segment(0, y, 6.7, y, 'gray')
    ligneGuide.opacite = graduation === 0 ? 0 : 0.2
    objets.push(
      ligneGuide,
      segment(-0.1, y, 0.1, y, 'black'),
      latex2d(String(graduation), -0.45, y, {
        letterSize: 'scriptsize',
      }),
    )
  }

  effectifs.forEach((effectif, indice) => {
    objets.push(
      traceBarre(indice + 1, effectif / 10, '', {
        epaisseur: 0.48,
        couleurDeRemplissage: bleuMathalea,
        opaciteDeRemplissage: 0.55,
        angle: 0,
      }),
      latex2d(String(valeurs[indice]), indice + 1, -0.25, {
        letterSize: 'scriptsize',
        justify: 'milieu',
      }),
    )
  })

  objets.push(
    texteParPosition(
      scenario.titreValeurs,
      6.9,
      -0.85,
      0,
      'black',
      1,
      'milieu',
    ),
    texteParPosition(
      scenario.titreEffectifs,
      -1.15,
      ordonneeMax / 20,
      90,
      'black',
      1,
      'milieu',
    ),
  )

  return mathalea2d(
    {
      ...fixeBordures(objets, {
        rxmin: -0.3,
        rxmax: 0.4,
        rymin: -0.4,
        rymax: 0.4,
      }),
      pixelsParCm: 25,
      scale: 0.75,
      center: !context.isHtml,
    },
    objets,
  )
}

function valeurAuRang(
  rang: number,
  valeurs: number[],
  effectifsCumules: number[],
): number {
  const indice = effectifsCumules.findIndex((effectif) => effectif >= rang)
  return valeurs[indice]
}

/**
 * Lire une série dans un diagramme en bâtons, puis calculer sa médiane et sa
 * moyenne.
 * @author Stéphane Guyon
 */
export default class MedianeMoyenneDiagrammeBatons extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      '1 : Âge des adhérents\n2 : Livres empruntés\n3 : Séances sportives\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario >= 1 && numeroScenario <= 3
        ? scenarios[numeroScenario - 1]
        : choice(scenarios)
    const premiereValeur = choice(scenario.premieresValeurs)
    const valeurs = Array.from(
      { length: 6 },
      (_, indice) => premiereValeur + indice,
    )
    const effectifs = choice([
      [30, 50, 10, 10, 20, 30],
      [10, 20, 30, 30, 20, 10],
      [10, 10, 20, 30, 20, 10],
      [20, 30, 20, 10, 10, 10],
      [20, 20, 25, 25, 20, 15],
      [15, 50, 15, 20, 15, 10],
    ])
    const effectifsCumules: number[] = []
    effectifs.reduce((somme, effectif) => {
      const cumul = somme + effectif
      effectifsCumules.push(cumul)
      return cumul
    }, 0)
    const effectifTotal = effectifsCumules.at(-1) ?? 0
    const sommeProduits = valeurs.reduce(
      (somme, valeur, indice) => somme + valeur * effectifs[indice],
      0,
    )
    const moyenne = sommeProduits / effectifTotal
    const effectifPair = effectifTotal % 2 === 0
    const rang1 = effectifPair ? effectifTotal / 2 : (effectifTotal + 1) / 2
    const rang2 = effectifPair ? rang1 + 1 : rang1
    const valeur1 = valeurAuRang(rang1, valeurs, effectifsCumules)
    const valeur2 = valeurAuRang(rang2, valeurs, effectifsCumules)
    const mediane = (valeur1 + valeur2) / 2
    const diagramme = construitDiagramme(valeurs, effectifs, scenario)
    const libelleMedianeAvecArticle = scenario.libelleMediane.startsWith('Âge')
      ? `l'${scenario.libelleMediane.toLowerCase()}`
      : `le ${scenario.libelleMediane.toLowerCase()}`
    const libelleMoyenneAvecArticle = scenario.libelleMoyenne.startsWith('Âge')
      ? `l'${scenario.libelleMoyenne.toLowerCase()}`
      : `le ${scenario.libelleMoyenne.toLowerCase()}`
    const entetesColonnes = [
      `\\text{${scenario.titreValeurs}}`,
      ...valeurs.map(String),
      '\\text{Total}',
    ]
    const entetesLignes = [`\\text{${scenario.titreEffectifs}}`]

    const introduction = `${scenario.introduction} Les résultats de cette étude sont représentés par le diagramme en bâtons ci-dessous.<br><br>
${diagramme}<br>`

    if (this.interactif) {
      const tableauMathlive =
        AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          entetesColonnes,
          entetesLignes,
          Array.from({ length: 7 }, () => ''),
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
      const champResultat = (coordonnees: string) =>
        `<math-field id="${prefixeChamp}${coordonnees}" class="tableauMathlive" virtual-keyboard-mode="manual" style="display:inline-block; min-width:4rem; min-height:2.2rem; margin:0 0.35rem; border:1px solid #b8b8b8; border-radius:0.35rem; vertical-align:middle"></math-field>`
      const resultats = `<caption style="caption-side:bottom; padding-top:1rem; text-align:left"><div style="display:flex; gap:1.5rem; align-items:center; white-space:nowrap"><span>${scenario.libelleMediane} : ${champResultat('L2C1')} ${scenario.unite}</span><span>${scenario.libelleMoyenne} : ${champResultat('L3C1')} ${scenario.unite}</span></div></caption>`
      const tableauInteractif = renduTableauBase.replace(
        '</table>',
        `${resultats}</table>`,
      )
      const reponses: Record<string, unknown> = {}
      effectifs.forEach((effectif, indice) => {
        reponses[`L1C${indice + 1}`] = { value: effectif }
      })
      reponses.L1C7 = { value: effectifTotal }
      reponses.L2C1 = { value: mediane }
      reponses.L3C1 = { value: moyenne }
      reponses.bareme = (listePoints: number[]): [number, number] => {
        const pointTableau = Math.min(...listePoints.slice(0, 7))
        const pointMediane = listePoints[7]
        const pointMoyenne = listePoints[8]
        return [pointTableau + pointMediane + pointMoyenne, 3]
      }
      handleAnswers(this, 0, reponses, {
        formatInteractif: 'tableauMathlive',
      })
      this.listeQuestions[0] = `${introduction}
1. Compléter le tableau présentant ${scenario.descriptionTableau} et les effectifs.<br><br>
${tableauInteractif}`
    } else {
      const tableauEnonce = tableauColonneLigne(
        entetesColonnes,
        entetesLignes,
        Array.from({ length: 7 }, () => '\\ldots'),
        1.5,
      )
      this.listeQuestions[0] = `${introduction}
1. Présenter dans un tableau ${scenario.descriptionTableau} et les effectifs correspondants.<br><br>
${tableauEnonce}<br>
2. Déterminer ${libelleMedianeAvecArticle} et ${libelleMoyenneAvecArticle}.`
    }

    const tableauCorrection = tableauColonneLigne(
      entetesColonnes,
      entetesLignes,
      [...effectifs, effectifTotal],
      1.5,
    )
    const calculMoyenne = valeurs
      .map((valeur, indice) => `${valeur}\\times ${effectifs[indice]}`)
      .join('+')
    let calculMediane: string
    if (!effectifPair) {
      calculMediane = `L'effectif total est impair : $N=${effectifTotal}$. La médiane est la valeur de rang $\\dfrac{${effectifTotal}+1}{2}=${rang1}$.<br>
La valeur de rang $${rang1}$ est $${valeur1}$.<br>
Ainsi, ${libelleMedianeAvecArticle} est $${miseEnEvidence(texNombre(mediane))}\\text{ ${scenario.unite}}$.`
    } else if (valeur1 === valeur2) {
      calculMediane = `L'effectif total est pair : $N=${effectifTotal}$. On considère les valeurs de rangs $${rang1}$ et $${rang2}$.<br>
Ces deux valeurs centrales sont égales à $${valeur1}$.<br>
Ainsi, ${libelleMedianeAvecArticle} est directement $${miseEnEvidence(texNombre(mediane))}\\text{ ${scenario.unite}}$.`
    } else {
      calculMediane = `L'effectif total est pair : $N=${effectifTotal}$. La médiane est donc une valeur comprise entre les valeurs de rangs $${rang1}$ et $${rang2}$.<br>
La valeur de rang $${rang1}$ est $${valeur1}$ et celle de rang $${rang2}$ est $${valeur2}$.<br>
Ainsi, ${libelleMedianeAvecArticle} est $\\dfrac{${valeur1}+${valeur2}}{2}=${miseEnEvidence(texNombre(mediane))}\\text{ ${scenario.unite}}$.`
    }
    this.listeCorrections[0] = `1. On lit la hauteur de chaque bâton :<br><br>
${tableauCorrection}<br>
2. ${calculMediane}<br><br>
On calcule la moyenne pondérée :<br>
$\\begin{aligned}
\\overline{x}&=\\dfrac{${calculMoyenne}}{${effectifTotal}}\\\\
&=\\dfrac{${texNombre(sommeProduits)}}{${effectifTotal}}\\\\
&=${miseEnEvidence(texNombre(moyenne, 1))}\\text{ ${scenario.unite}}.
\\end{aligned}$`

    listeQuestionsToContenu(this)
  }
}
