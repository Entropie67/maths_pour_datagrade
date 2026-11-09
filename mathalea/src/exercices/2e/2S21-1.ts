import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Comparer la moyenne et l'écart type de deux séries statistiques"
export const dateDePublication = '19/08/2026'
export const uuid = 'c123f'

export const refs = {
  'fr-fr': ['2S21-1'],
  'fr-ch': [],
}

/**
 * Comparer deux séries de même moyenne et d'écarts types différents.
 * @author Stéphane Guyon
 */
export default class ComparerMoyenneEcartType extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const profils = [
      {
        effectifsConcentres: [0, 4, 16, 4, 0],
        effectifsDisperses: [3, 5, 8, 5, 3],
      },
      {
        effectifsConcentres: [1, 4, 18, 4, 1],
        effectifsDisperses: [4, 5, 10, 5, 4],
      },
      {
        effectifsConcentres: [1, 5, 18, 5, 1],
        effectifsDisperses: [5, 4, 12, 4, 5],
      },
      {
        effectifsConcentres: [0, 6, 20, 6, 0],
        effectifsDisperses: [4, 6, 12, 6, 4],
      },
    ]
    const distances = choice([
      { interieure: 1, exterieure: 2 },
      { interieure: 1, exterieure: 3 },
      { interieure: 2, exterieure: 3 },
      { interieure: 2, exterieure: 4 },
    ])
    const moyenne = randint(distances.exterieure + 1, 10 - distances.exterieure)
    const profil = choice(profils)
    const effectifsConcentres = profil.effectifsConcentres
    const effectifsDisperses = profil.effectifsDisperses
    const effectifTotal = effectifsConcentres.reduce(
      (somme, effectif) => somme + effectif,
      0,
    )
    const notes = [
      moyenne - distances.exterieure,
      moyenne - distances.interieure,
      moyenne,
      moyenne + distances.interieure,
      moyenne + distances.exterieure,
    ]
    const premiereClassePlusHomogene = choice([true, false])
    const effectifsPremiereClasse = premiereClassePlusHomogene
      ? effectifsConcentres
      : effectifsDisperses
    const effectifsSecondeClasse = premiereClassePlusHomogene
      ? effectifsDisperses
      : effectifsConcentres
    const nomClasseHomogene = premiereClassePlusHomogene
      ? '$2^{\\text{de}}$ A'
      : '$2^{\\text{de}}$ B'
    const nomClasseDispersee = premiereClassePlusHomogene
      ? '$2^{\\text{de}}$ B'
      : '$2^{\\text{de}}$ A'
    const variance = (effectifs: number[]) =>
      effectifs.reduce(
        (somme, effectif, indice) =>
          somme + effectif * (notes[indice] - moyenne) ** 2,
        0,
      ) / effectifTotal
    const varianceHomogene = variance(effectifsConcentres)
    const varianceDispersee = variance(effectifsDisperses)
    const ecartTypeHomogene = Math.sqrt(varianceHomogene)
    const ecartTypeDisperse = Math.sqrt(varianceDispersee)

    const tableau = tableauColonneLigne(
      ['\\text{Note}', ...notes.map(String), '\\text{Total}'],
      [
        '\\text{Classe }2^{\\text{de}}\\text{ A}',
        '\\text{Classe }2^{\\text{de}}\\text{ B}',
      ],
      [
        ...effectifsPremiereClasse,
        effectifTotal,
        ...effectifsSecondeClasse,
        effectifTotal,
      ],
      1.5,
    )

    const questions = createList({
      items: [
        "Calculer la moyenne et l'écart type des notes de chaque classe. Arrondir les écarts types au centième si nécessaire.",
        'Comparer les résultats des deux classes en utilisant ces deux indicateurs.',
      ],
      style: 'nombres',
    })

    const calculMoyenne = (effectifs: number[]) =>
      effectifs
        .map((effectif, indice) =>
          effectif === 0 ? '' : `${effectif}\\times${notes[indice]}`,
        )
        .filter((terme) => terme !== '')
        .join('+')
    const calculVariance = (effectifs: number[]) =>
      effectifs
        .map((effectif, indice) =>
          effectif === 0
            ? ''
            : `${effectif}\\times(${notes[indice]}-${moyenne})^2`,
        )
        .filter((terme) => terme !== '')
        .join('+')

    this.listeQuestions[0] = `Dans deux classes de seconde de même effectif, on relève les notes sur $10$ obtenues à un même devoir. Les résultats sont présentés dans le tableau suivant.<br><br>
${tableau}<br>
${questions}`

    this.listeCorrections[0] = `Chaque classe compte $N=${effectifTotal}$ élèves.<br><br>
Pour la classe ${nomClasseHomogene}, on obtient :<br>
$\\begin{aligned}
\\overline{x}_{${premiereClassePlusHomogene ? 'A' : 'B'}}
&=\\dfrac{${calculMoyenne(effectifsConcentres)}}{${effectifTotal}}\\\\
&=${miseEnEvidence(moyenne)}.
\\end{aligned}$<br>
La variance est la moyenne des carrés des écarts à la moyenne :<br>
$\\begin{aligned}
V_{${premiereClassePlusHomogene ? 'A' : 'B'}}
&=\\dfrac{${calculVariance(effectifsConcentres)}}{${effectifTotal}}\\\\
&\\approx${texNombre(varianceHomogene, 2)}.
\\end{aligned}$<br>
Ainsi, $\\sigma_{${premiereClassePlusHomogene ? 'A' : 'B'}}=\\sqrt{V_{${premiereClassePlusHomogene ? 'A' : 'B'}}}\\approx${miseEnEvidence(texNombre(ecartTypeHomogene, 2))}$.<br><br>
Pour la classe ${nomClasseDispersee}, on obtient :<br>
$\\begin{aligned}
\\overline{x}_{${premiereClassePlusHomogene ? 'B' : 'A'}}
&=\\dfrac{${calculMoyenne(effectifsDisperses)}}{${effectifTotal}}\\\\
&=${miseEnEvidence(moyenne)}.
\\end{aligned}$<br>
$\\begin{aligned}
V_{${premiereClassePlusHomogene ? 'B' : 'A'}}
&=\\dfrac{${calculVariance(effectifsDisperses)}}{${effectifTotal}}\\\\
&\\approx${texNombre(varianceDispersee, 2)}.
\\end{aligned}$<br>
Ainsi, $\\sigma_{${premiereClassePlusHomogene ? 'B' : 'A'}}=\\sqrt{V_{${premiereClassePlusHomogene ? 'B' : 'A'}}}\\approx${miseEnEvidence(texNombre(ecartTypeDisperse, 2))}$.<br><br>
Les deux classes ont la même moyenne, égale à $${miseEnEvidence(moyenne)}$.<br>
On a $\\sigma_{${premiereClassePlusHomogene ? 'A' : 'B'}}<\\sigma_{${premiereClassePlusHomogene ? 'B' : 'A'}}$. La dispersion des résultats de la classe ${nomClasseHomogene} est donc plus petite que celle de la classe ${nomClasseDispersee}.<br>
${texteEnCouleurEtGras(`Les résultats de la classe ${nomClasseHomogene} sont plus homogènes.`)}`

    listeQuestionsToContenu(this)
  }
}
