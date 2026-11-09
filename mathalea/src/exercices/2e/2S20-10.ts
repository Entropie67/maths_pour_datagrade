import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer à la main la moyenne et l'écart-type d'une série"
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '81e37'

export const refs = {
  'fr-fr': ['2S20-10'],
  'fr-ch': [],
}

/**
 * Calculer à la main la moyenne et l'écart-type d'une série statistique.
 * @author Stéphane Guyon
 */
export default class CalculerEcartTypeMain extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = true
    this.besoinFormulaireCaseACocher = [
      'Ajouter les lignes de calcul à compléter en version non interactive',
      true,
    ]
  }

  nouvelleVersion(): void {
    this.besoinFormulaireCaseACocher = this.interactif
      ? false
      : [
          'Ajouter les lignes de calcul à compléter en version non interactive',
          true,
        ]
    const pas = choice([1, 2])
    const centre = randint(5, 10)
    const effectifIntermediaire = randint(1, 4)
    const valeurs = [-2, -1, 0, 1, 2].map((decalage) => centre + decalage * pas)
    const effectifs = [1, effectifIntermediaire, 6, effectifIntermediaire, 1]
    const produits = valeurs.map((valeur, indice) => valeur * effectifs[indice])
    const effectifTotal = effectifs.reduce(
      (somme, effectif) => somme + effectif,
      0,
    )
    const sommeProduits = produits.reduce(
      (somme, produit) => somme + produit,
      0,
    )
    const moyenne = sommeProduits / effectifTotal
    const ecarts = valeurs.map((valeur) => valeur - moyenne)
    const carresEcarts = ecarts.map((ecart) => ecart ** 2)
    const produitsCarresEcarts = carresEcarts.map(
      (carre, indice) => carre * effectifs[indice],
    )
    const sommeProduitsCarresEcarts = produitsCarresEcarts.reduce(
      (somme, produit) => somme + produit,
      0,
    )
    const variance = sommeProduitsCarresEcarts / effectifTotal
    const ecartType = Math.sqrt(variance)
    const casesVides = Array.from(
      { length: valeurs.length + 1 },
      () => '\\ldots',
    )

    const lignesTableau = [
      'n_i',
      'n_i x_i',
      'x_i-\\overline{x}',
      '(x_i-\\overline{x})^2',
      'n_i(x_i-\\overline{x})^2',
    ]
    const tableauEnonce = tableauColonneLigne(
      ['x_i', ...valeurs.map(String), '\\text{Total}'],
      lignesTableau,
      [
        ...effectifs,
        effectifTotal,
        ...casesVides,
        ...casesVides,
        ...casesVides,
        ...casesVides,
      ],
      1.5,
    )
    const tableauDonnees = tableauColonneLigne(
      ['x_i', ...valeurs.map(String), '\\text{Total}'],
      ['n_i'],
      [...effectifs, effectifTotal],
      1.5,
    )
    const tableauCorrection = tableauColonneLigne(
      ['x_i', ...valeurs.map(String), '\\text{Total}'],
      lignesTableau,
      [
        ...effectifs,
        effectifTotal,
        ...produits,
        sommeProduits,
        ...ecarts,
        '',
        ...carresEcarts,
        '',
        ...produitsCarresEcarts,
        sommeProduitsCarresEcarts,
      ],
      1.5,
    )
    const questions = createList({
      items: this.sup
        ? [
            'Recopier et compléter le tableau.',
            'Calculer la moyenne de cette série.',
            'Calculer la variance de cette série.',
            "Calculer l'écart-type de cette série.",
          ]
        : [
            'Calculer la moyenne de cette série.',
            'Calculer la variance de cette série.',
            "Calculer l'écart-type de cette série.",
          ],
      style: 'nombres',
    })

    if (this.interactif) {
      const entetesColonnes = ['x_i', ...valeurs.map(String), '\\text{Total}']
      const entetesLignes = [
        'n_i',
        'n_i x_i',
        'x_i-\\overline{x}',
        '(x_i-\\overline{x})^2',
        'n_i(x_i-\\overline{x})^2',
      ]
      const cellules = [
        ...effectifs,
        effectifTotal,
        ...Array.from({ length: 6 }, () => ''),
        ...Array.from({ length: 5 }, () => ''),
        '\\text{--}',
        ...Array.from({ length: 5 }, () => ''),
        '\\text{--}',
        ...Array.from({ length: 6 }, () => ''),
      ]
      const tableauInteractif =
        AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          entetesColonnes,
          entetesLignes,
          cellules,
        )
      const renduTableauBase = AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        0,
        tableauInteractif,
        KeyboardType.clavierDeBase ?? '',
        true,
        {},
      ).output
      const prefixeChamp = `champTexteEx${this.numeroExercice ?? 0}Q0`
      const champResultat = (coordonnees: string) =>
        `<math-field id="${prefixeChamp}${coordonnees}" class="tableauMathlive" virtual-keyboard-mode="manual" style="display:inline-block; min-width:4rem; min-height:2.2rem; margin-left:0.35rem; border:1px solid #b8b8b8; border-radius:0.35rem; vertical-align:middle"></math-field>`
      const resultatsHorsTableau = `<caption style="caption-side:bottom; padding-top:1rem; text-align:left"><div style="display:flex; gap:1.5rem; align-items:center; white-space:nowrap"><span>Moyenne : ${champResultat('L6C1')}</span><span>Variance : ${champResultat('L7C1')}</span><span>Écart-type : ${champResultat('L8C1')}</span></div></caption>`
      const renduTableauInteractif = renduTableauBase.replace(
        '</table>',
        `${resultatsHorsTableau}</table>`,
      )
      const reponses: Record<string, unknown> = {}
      const ajouteLigne = (ligne: number, resultats: number[]) => {
        resultats.forEach((resultat, indice) => {
          reponses[`L${ligne}C${indice + 1}`] = { value: String(resultat) }
        })
      }
      ajouteLigne(2, [...produits, sommeProduits])
      ajouteLigne(3, ecarts)
      ajouteLigne(4, carresEcarts)
      ajouteLigne(5, [...produitsCarresEcarts, sommeProduitsCarresEcarts])
      reponses.L6C1 = { value: String(moyenne) }
      reponses.L7C1 = { value: String(variance) }
      reponses.L8C1 = { value: String(ecartType) }
      reponses.bareme = (listePoints: number[]): [number, number] => {
        const pointDeuxiemeLigne = Math.min(...listePoints.slice(0, 5))
        const pointTroisiemeLigne = Math.min(...listePoints.slice(5, 10))
        const pointQuatriemeLigne = Math.min(...listePoints.slice(10, 15))
        const pointCinquiemeLigne = Math.min(...listePoints.slice(15, 20))
        const pointMoyenne = listePoints[20]
        const pointVariance = listePoints[21]
        const pointEcartType = listePoints[22]
        const totalPoints =
          pointDeuxiemeLigne +
          pointTroisiemeLigne +
          pointQuatriemeLigne +
          pointCinquiemeLigne +
          pointMoyenne +
          pointVariance +
          pointEcartType
        return [totalPoints, 7]
      }
      handleAnswers(this, 0, reponses, {
        formatInteractif: 'tableauMathlive',
      })
      this.listeQuestions[0] = `On considère la série statistique suivante.<br>Compléter toutes les cases, puis donner la moyenne, la variance et l'écart-type de la série.<br><br>
${renduTableauInteractif}`
    } else {
      this.listeQuestions[0] = `On considère la série statistique suivante :<br><br>
${this.sup ? tableauEnonce : tableauDonnees}<br>
${questions}`
    }

    this.listeCorrections[0] = `On complète le tableau. La dernière colonne contient les sommes utiles aux calculs.<br><br>
${tableauCorrection}<br>
L'effectif total est $N=${effectifTotal}$.<br><br>
La moyenne est :<br>
$\\begin{aligned}
\\overline{x}&=\\dfrac{\\sum n_i x_i}{N}\\\\
&=\\dfrac{${sommeProduits}}{${effectifTotal}}\\\\
&=${miseEnEvidence(moyenne)}.
\\end{aligned}$<br>
La variance est la moyenne pondérée des carrés des écarts à la moyenne :<br>
$\\begin{aligned}
V&=\\dfrac{\\sum n_i(x_i-\\overline{x})^2}{N}\\\\
&=\\dfrac{${produitsCarresEcarts.join('+')}}{${effectifTotal}}\\\\
&=\\dfrac{${sommeProduitsCarresEcarts}}{${effectifTotal}}\\\\
&=${miseEnEvidence(variance)}.
\\end{aligned}$<br>
L'écart-type est la racine carrée de la variance :<br>
$\\begin{aligned}
\\sigma&=\\sqrt{V}\\\\
&=\\sqrt{${variance}}\\\\
&=${miseEnEvidence(ecartType)}.
\\end{aligned}$`

    listeQuestionsToContenu(this)
  }
}
