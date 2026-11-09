import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'étendue et l'écart interquartile d'une série statistique"
export const dateDePublication = '19/08/2026'
export const uuid = 'd7b82'
export const interactifReady = true

export const refs = {
  'fr-fr': ['2S20-11'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  entete: string
  unite: 'min' | 'cm' | 'livre'
  valeurs: number[]
}

function construitSchemaEcc(
  valeurs: number[],
  effectifs: number[],
  effectifsCumules: number[],
): string {
  const objets: NestedObjetMathalea2dArray = []
  const largeurEtiquette = 4.2
  const largeurColonne = 2.1
  const hauteurLigne = 1.2
  const largeur = largeurEtiquette + largeurColonne * valeurs.length
  const hauteur = 3 * hauteurLigne
  const couleurs = [
    bleuMathalea,
    '#C62828',
    vertMathalea,
    '#7B1FA2',
    '#E65100',
    '#00838F',
  ]
  for (let ligne = 0; ligne <= 3; ligne++)
    objets.push(segment(0, ligne * hauteurLigne, largeur, ligne * hauteurLigne))
  objets.push(
    segment(0, 0, 0, hauteur),
    segment(largeurEtiquette, 0, largeurEtiquette, hauteur),
  )
  for (let colonne = 1; colonne <= valeurs.length; colonne++) {
    const x = largeurEtiquette + colonne * largeurColonne
    objets.push(segment(x, 0, x, hauteur))
  }
  objets.push(
    latex2d('\\textbf{Valeur}', largeurEtiquette / 2, 3, {}),
    latex2d('\\textbf{Effectif}', largeurEtiquette / 2, 1.8, {}),
    latex2d('\\textbf{E.C.C.}', largeurEtiquette / 2, 0.6, {}),
  )
  for (let indice = 0; indice < valeurs.length; indice++) {
    const x = largeurEtiquette + (indice + 0.5) * largeurColonne
    const couleur = couleurs[Math.max(0, indice - 1) % couleurs.length]
    objets.push(
      latex2d(String(valeurs[indice]), x, 3, {}),
      latex2d(String(effectifs[indice]), x, 1.8, { color: couleur }),
      latex2d(String(effectifsCumules[indice]), x, 0.6, { color: couleur }),
    )
  }
  for (let indice = 1; indice < valeurs.length; indice++) {
    const xPrecedent = largeurEtiquette + (indice - 0.5) * largeurColonne
    const xCourant = largeurEtiquette + (indice + 0.5) * largeurColonne
    const couleur = couleurs[(indice - 1) % couleurs.length]
    const diagonale = segment(
      xPrecedent + 0.25,
      0.85,
      xCourant - 0.3,
      1.55,
      couleur,
    )
    const verticale = segment(xCourant, 1.5, xCourant, 0.9, couleur)
    diagonale.styleExtremites = '->'
    verticale.styleExtremites = '->'
    diagonale.epaisseur = 2
    verticale.epaisseur = 2
    objets.push(diagonale, verticale)
  }
  return mathalea2d(
    {
      xmin: -0.2,
      xmax: largeur + 0.2,
      ymin: -0.2,
      ymax: hauteur + 0.2,
      pixelsParCm: 25,
      scale: 0.65,
      center: !context.isHtml,
    },
    objets,
  )
}

/**
 * Déterminer l'étendue, les quartiles et l'écart interquartile d'une série.
 * @author Stéphane Guyon
 */
export default class EtendueEcartInterquartile extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      '1 : Durée des trajets domicile-lycée\n2 : Hauteur de jeunes plants\n3 : Nombre de livres empruntés\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const typeScenario =
      Number(this.sup) === 4 ? choice([1, 2, 3]) : Number(this.sup)
    let scenario: Scenario

    switch (typeScenario) {
      case 1: {
        const premiereValeur = choice([5, 10, 15])
        scenario = {
          introduction:
            "On relève la durée, en minutes, du trajet domicile-lycée de $40$ élèves d'un établissement.",
          entete: '\\text{Durée (en min)}',
          unite: 'min',
          valeurs: Array.from(
            { length: 7 },
            (_, indice) => premiereValeur + 5 * indice,
          ),
        }
        break
      }
      case 2: {
        const premiereValeur = randint(8, 12)
        scenario = {
          introduction:
            "Un horticulteur mesure la hauteur, en centimètres, de $40$ jeunes plants d'une même variété.",
          entete: '\\text{Hauteur (en cm)}',
          unite: 'cm',
          valeurs: Array.from(
            { length: 7 },
            (_, indice) => premiereValeur + 2 * indice,
          ),
        }
        break
      }
      case 3:
      default: {
        const premiereValeur = choice([0, 1])
        scenario = {
          introduction:
            'Une médiathèque relève le nombre de livres empruntés pendant un trimestre par chacun de $40$ adhérents.',
          entete: '\\text{Nombre de livres}',
          unite: 'livre',
          valeurs: Array.from(
            { length: 7 },
            (_, indice) => premiereValeur + indice,
          ),
        }
        break
      }
    }

    const effectifs = choice([
      [3, 5, 8, 9, 7, 5, 3],
      [6, 5, 4, 10, 4, 5, 6],
      [2, 3, 7, 16, 7, 3, 2],
      [4, 8, 5, 6, 5, 8, 4],
    ])
    const effectifsCumules: number[] = []
    effectifs.reduce((somme, effectif) => {
      const nouveauTotal = somme + effectif
      effectifsCumules.push(nouveauTotal)
      return nouveauTotal
    }, 0)

    const effectifTotal = effectifsCumules.at(-1) ?? 0
    const rangQ1 = Math.ceil(effectifTotal / 4)
    const rangQ3 = Math.ceil((3 * effectifTotal) / 4)
    const indiceQ1 = effectifsCumules.findIndex(
      (effectif) => effectif >= rangQ1,
    )
    const indiceQ3 = effectifsCumules.findIndex(
      (effectif) => effectif >= rangQ3,
    )
    const q1 = scenario.valeurs[indiceQ1]
    const q3 = scenario.valeurs[indiceQ3]
    const minimum = scenario.valeurs[0]
    const maximum = scenario.valeurs.at(-1) ?? minimum
    const etendue = maximum - minimum
    const ecartInterquartile = q3 - q1
    const uniteDe = (valeur: number) =>
      `\\,\\text{${scenario.unite === 'livre' && valeur !== 1 ? 'livres' : scenario.unite}}`
    const avecUnite = (valeur: number) => `${valeur}${uniteDe(valeur)}`
    // seule la valeur est mise en évidence : l'unité n'est pas saisie dans le champ
    const enEvidence = (valeur: number) =>
      `${miseEnEvidence(String(valeur))}${uniteDe(valeur)}`
    const uniteInteractive =
      scenario.unite === 'livre' ? 'livre(s)' : scenario.unite

    const tableauEnonce = tableauColonneLigne(
      [scenario.entete, ...scenario.valeurs.map(String)],
      ['\\text{Effectif}'],
      effectifs,
      1.5,
    )
    const schemaEcc = construitSchemaEcc(
      scenario.valeurs,
      effectifs,
      effectifsCumules,
    )
    const questions = createList({
      items: [
        "Déterminer l'étendue de cette série.",
        'Déterminer le premier quartile $Q_1$ et le troisième quartile $Q_3$.',
        "En déduire l'écart interquartile de cette série.",
      ],
      style: 'nombres',
    })

    let questionsAffichees = questions
    if (this.interactif) {
      questionsAffichees = addMultiMathfield(this, 0, {
        dataTemplate: `1. L'étendue de cette série est %{champ1}.<br>
2. $Q_1=$ %{champ2} et $Q_3=$ %{champ3}.<br>
3. L'écart interquartile de cette série est %{champ4}.`,
        dataOptions: {
          champ1: {
            keyboard: KeyboardType.clavierNumbers,
            texteApres: ` ${uniteInteractive}`,
          },
          champ2: {
            keyboard: KeyboardType.clavierNumbers,
            texteApres: ` ${uniteInteractive}`,
          },
          champ3: {
            keyboard: KeyboardType.clavierNumbers,
            texteApres: ` ${uniteInteractive}`,
          },
          champ4: {
            keyboard: KeyboardType.clavierNumbers,
            texteApres: ` ${uniteInteractive}`,
          },
        },
      })
      handleAnswers(
        this,
        0,
        {
          champ1: { value: etendue },
          champ2: { value: q1 },
          champ3: { value: q3 },
          champ4: { value: ecartInterquartile },
        },
        { formatInteractif: 'multi-mathfield' },
      )
    }

    this.listeQuestions[0] = `${scenario.introduction}<br><br>
${tableauEnonce}<br>
${questionsAffichees}`

    this.listeCorrections[0] = createList({
      items: [
        `L'étendue est la différence entre la plus grande valeur et la plus petite valeur :<br>
$${maximum}-${minimum}=${enEvidence(etendue)}$.`,
        `Pour déterminer les quartiles, on calcule les effectifs cumulés croissants :<br><br>
${schemaEcc}<br>
L'effectif total est $N=${effectifTotal}$.<br><br>
Pour le premier quartile :<br>
$\\dfrac{N}{4}=\\dfrac{${effectifTotal}}{4}=${rangQ1}$.<br>
Le premier quartile est donc la valeur de rang $${rangQ1}$.<br>
La première valeur dont l'effectif cumulé atteint ou dépasse $${rangQ1}$ est $${avecUnite(q1)}$.<br>
Ainsi, $Q_1=${enEvidence(q1)}$.<br><br>
Pour le troisième quartile :<br>
$\\dfrac{3N}{4}=\\dfrac{3\\times ${effectifTotal}}{4}=${rangQ3}$.<br>
Le troisième quartile est donc la valeur de rang $${rangQ3}$.<br>
La première valeur dont l'effectif cumulé atteint ou dépasse $${rangQ3}$ est $${avecUnite(q3)}$.<br>
Ainsi, $Q_3=${enEvidence(q3)}$.`,
        `L'écart interquartile est :<br>
$Q_3-Q_1=${q3}-${q1}=${enEvidence(ecartInterquartile)}$.<br>
Les $50\\,\\%$ de valeurs centrales sont réparties sur un intervalle d'amplitude $${avecUnite(ecartInterquartile)}$.`,
      ],
      style: 'nombres',
    })

    listeQuestionsToContenu(this)
  }
}
