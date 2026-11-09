import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des mains de cartes'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'b3t2e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-3'],
}

/**
 * Combinaisons - Mains de cartes (poker, etc.)
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class MainsCartes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Nombre total de mains (combinaison)',
        '2 : Mains avec contrainte de couleur (combinaison)',
        '3 : Mains avec contrainte de valeur (combinaison)',
        '4 : Mains spéciales (combinaison)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const jeux = [
      {
        nom: 'jeu de $52$ cartes',
        total: 52,
        couleurs: 4,
        valeurs: 13,
        nbRouges: 26,
        nbNoires: 26,
        figures: 12,
        nonFigures: 40,
        as: 4,
        nonAs: 48,
        isJass: false,
      },
      {
        nom: 'jeu de $36$ cartes (jeu de Jass)',
        total: 36,
        couleurs: 4,
        valeurs: 9,
        nbRouges: 18,
        nbNoires: 18,
        figures: 12,
        nonFigures: 24,
        as: 4,
        nonAs: 32,
        isJass: true,
      },
    ]

    const tailleMains = [3, 4, 5, 6, 7, 8]

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['total', 'couleur', 'valeur', 'speciale'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const jeu = choice(jeux)
    this.consigne = `On considère un ${jeu.nom} ($${jeu.couleurs}$ couleurs de $${jeu.valeurs}$ cartes chacune).`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0
      let questionId: (string | number)[] = []

      const typeQuestion = listeTypeDeQuestions[i]
      const nbCartes = choice(tailleMains)

      if (typeQuestion === 'total') {
        questionId = ['total', nbCartes]
        reponse = combinaison(jeu.total, nbCartes)

        texte = `Combien de mains différentes de $${nbCartes}$ cartes peut-on recevoir ?`

        texteCorr = `On choisit $${nbCartes}$ cartes parmi $${jeu.total}$, l'ordre n'important pas.<br>`
        texteCorr += `Il s'agit d'une combinaison :<br>`
        texteCorr += `$C_{${nbCartes}}^{${jeu.total}} = \\dfrac{${jeu.total}!}{${nbCartes}! \\times ${jeu.total - nbCartes}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'couleur') {
        const variante = choice([
          'flush',
          'auMoinsUneRouge',
          'exactementRouges',
        ])

        if (variante === 'flush') {
          questionId = ['couleur', 'flush', nbCartes]
          const combValeurs = combinaison(jeu.valeurs, nbCartes)
          reponse = jeu.couleurs * combValeurs

          texte = `Combien de mains de $${nbCartes}$ cartes sont composées uniquement de cartes de la même couleur ?`

          texteCorr = `On choisit d'abord une couleur parmi $${jeu.couleurs}$, puis $${nbCartes}$ cartes parmi les $${jeu.valeurs}$ de cette couleur (l'ordre n'important pas dans une main) :<br>`
          texteCorr += `$C_1^{${jeu.couleurs}} \\times C_{${nbCartes}}^{${jeu.valeurs}} = ${jeu.couleurs} \\times ${texNombre(combValeurs, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'auMoinsUneRouge') {
          questionId = ['couleur', 'auMoinsUneRouge', nbCartes]
          const total = combinaison(jeu.total, nbCartes)
          const aucuneRouge = combinaison(jeu.nbNoires, nbCartes)
          reponse = total - aucuneRouge

          texte = `Combien de mains de $${nbCartes}$ cartes contiennent au moins une carte rouge ?`

          texteCorr = `Une main est un sous-ensemble : l'ordre des cartes ne compte pas. On calcule le complémentaire : mains sans aucune carte rouge.<br>`
          texteCorr += `Il y a $${jeu.nbNoires}$ cartes noires, donc les mains sans rouge : $C_{${nbCartes}}^{${jeu.nbNoires}} = ${texNombre(aucuneRouge, 0)}$.<br>`
          texteCorr += `Mains avec au moins une rouge : $C_{${nbCartes}}^{${jeu.total}} - C_{${nbCartes}}^{${jeu.nbNoires}} = ${texNombre(total, 0)} - ${texNombre(aucuneRouge, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const k = randint(2, Math.min(nbCartes - 1, 4))
          questionId = ['couleur', 'exactementRouges', nbCartes, k]
          const combRouges = combinaison(jeu.nbRouges, k)
          const combNoires = combinaison(jeu.nbNoires, nbCartes - k)
          reponse = combRouges * combNoires

          texte = `Combien de mains de $${nbCartes}$ cartes contiennent exactement $${k}$ cartes rouges ?`

          texteCorr = `On choisit $${k}$ cartes rouges parmi $${jeu.nbRouges}$ et $${nbCartes - k}$ cartes noires parmi $${jeu.nbNoires}$ (l'ordre ne compte pas dans une main) :<br>`
          texteCorr += `$C_{${k}}^{${jeu.nbRouges}} \\times C_{${nbCartes - k}}^{${jeu.nbNoires}} = ${texNombre(combRouges, 0)} \\times ${texNombre(combNoires, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'valeur') {
        const variante = choice([
          'avecAs',
          'sansRoi',
          'auMoinsUneFigure',
          'exactFigures',
        ])

        if (variante === 'avecAs') {
          questionId = ['valeur', 'avecAs', nbCartes]
          const total = combinaison(jeu.total, nbCartes)
          const sansAs = combinaison(jeu.nonAs, nbCartes)
          reponse = total - sansAs

          texte = `Combien de mains de $${nbCartes}$ cartes contiennent au moins un as ?`

          texteCorr = `Une main est un sous-ensemble : l'ordre des cartes ne compte pas. On calcule le complémentaire : mains sans aucun as.<br>`
          texteCorr += `Il y a $${jeu.nonAs}$ cartes non-as. Mains sans as : $C_{${nbCartes}}^{${jeu.nonAs}} = ${texNombre(sansAs, 0)}$<br>`
          texteCorr += `Mains avec au moins un as : $C_{${nbCartes}}^{${jeu.total}} - C_{${nbCartes}}^{${jeu.nonAs}} = ${texNombre(total, 0)} - ${texNombre(sansAs, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'sansRoi') {
          // Note: Il y a 4 rois dans le jeu
          const nonRoi = jeu.total - 4
          questionId = ['valeur', 'sansRoi', nbCartes]
          reponse = combinaison(nonRoi, nbCartes)

          texte = `Combien de mains de $${nbCartes}$ cartes ne contiennent aucun roi ?`

          texteCorr = `Il y a $${nonRoi}$ cartes qui ne sont pas des rois ($${jeu.total} - 4$).<br>`
          texteCorr += `On choisit $${nbCartes}$ cartes parmi ces cartes (l'ordre n'important pas) :<br>`
          texteCorr += `$C_{${nbCartes}}^{${nonRoi}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'auMoinsUneFigure') {
          questionId = ['valeur', 'auMoinsUneFigure', nbCartes]
          const total = combinaison(jeu.total, nbCartes)
          const sansFigure = combinaison(jeu.nonFigures, nbCartes)
          reponse = total - sansFigure

          texte = `Combien de mains de $${nbCartes}$ cartes contiennent au moins une figure (valet, dame ou roi) ?`

          texteCorr = `Une main est un sous-ensemble : l'ordre des cartes ne compte pas.<br>`
          texteCorr += `Il y a ${jeu.figures} figures et donc $${jeu.nonFigures}$ non-figures.<br>`
          texteCorr += `Mains sans figure : $C_{${nbCartes}}^{${jeu.nonFigures}} = ${texNombre(sansFigure, 0)}$<br>`
          texteCorr += `Mains avec au moins une figure : $C_{${nbCartes}}^{${jeu.total}} - C_{${nbCartes}}^{${jeu.nonFigures}} = ${texNombre(total, 0)} - ${texNombre(sansFigure, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const k = randint(1, Math.min(nbCartes - 1, 3))
          questionId = ['valeur', 'exactFigures', nbCartes, k]
          const combFigures = combinaison(jeu.figures, k)
          const combNonFigures = combinaison(jeu.nonFigures, nbCartes - k)
          reponse = combFigures * combNonFigures

          texte = `Combien de mains de $${nbCartes}$ cartes contiennent exactement $${k}$ figure${k > 1 ? 's' : ''} ?`

          texteCorr = `On choisit $${k}$ figures parmi $${jeu.figures}$ et $${nbCartes - k}$ non-figures parmi $${jeu.nonFigures}$ (l'ordre ne compte pas dans une main) :<br>`
          texteCorr += `$C_{${k}}^{${jeu.figures}} \\times C_{${nbCartes - k}}^{${jeu.nonFigures}} = ${texNombre(combFigures, 0)} \\times ${texNombre(combNonFigures, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (!jeu.isJass) {
        // Mains spéciales (poker uniquement)
        // Les questions "spéciales" ne sont disponibles que pour le poker (52 cartes)
        // car elles spécifient "exactement" une configuration, évitant le surcomptage.
        // Pour le Jass, les questions type "contient une suite" nécessiteraient
        // l'inclusion-exclusion (suites qui se chevauchent), trop complexe ici.
        const mainSpeciale = 5
        const variante = choice(['brelan', 'full', 'paire', 'doublePaire'])

        if (variante === 'brelan') {
          questionId = ['speciale', 'brelan']
          const v = jeu.valeurs
          const c = jeu.couleurs
          const combC3 = combinaison(c, 3)
          const combV2 = combinaison(v - 1, 2)
          reponse = v * combC3 * combV2 * c * c

          texte = `Combien de mains de $${mainSpeciale}$ cartes forment un brelan (exactement $3$ cartes de même valeur et $2$ autres de valeurs différentes entre elles) ?`

          texteCorr = `Dans une main, l'ordre des cartes ne compte pas : chaque sélection est une combinaison.<br>`
          texteCorr += `Pour former un brelan :<br>`
          texteCorr += `$\\bullet$ Valeur du brelan : $C_1^{${v}} = ${v}$<br>`
          texteCorr += `$\\bullet$ $3$ couleurs parmi $${c}$ pour le brelan : $C_3^{${c}} = ${texNombre(combC3, 0)}$<br>`
          texteCorr += `$\\bullet$ $2$ valeurs parmi les $${v - 1}$ restantes : $C_2^{${v - 1}} = ${texNombre(combV2, 0)}$<br>`
          texteCorr += `$\\bullet$ $1$ couleur pour chacune des $2$ cartes : $${c} \\times ${c} = ${c * c}$<br><br>`
          texteCorr += `Total : $${v} \\times ${texNombre(combC3, 0)} \\times ${texNombre(combV2, 0)} \\times ${c * c} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'full') {
          questionId = ['speciale', 'full']
          const v = jeu.valeurs
          const c = jeu.couleurs
          const combC3 = combinaison(c, 3)
          const combC2 = combinaison(c, 2)
          reponse = v * combC3 * (v - 1) * combC2

          texte = `Combien de mains de $${mainSpeciale}$ cartes forment un full ($3$ cartes de même valeur et $2$ d'une autre même valeur) ?`

          texteCorr = `Dans une main, l'ordre des cartes ne compte pas : chaque sélection est une combinaison.<br>`
          texteCorr += `Pour former un full :<br>`
          texteCorr += `$\\bullet$ Valeur du brelan : $C_1^{${v}} = ${v}$<br>`
          texteCorr += `$\\bullet$ $3$ couleurs parmi $${c}$ : $C_3^{${c}} = ${texNombre(combC3, 0)}$<br>`
          texteCorr += `$\\bullet$ Valeur de la paire parmi les $${v - 1}$ restantes : $${v - 1}$<br>`
          texteCorr += `$\\bullet$ $2$ couleurs parmi $${c}$ : $C_2^{${c}} = ${texNombre(combC2, 0)}$<br><br>`
          texteCorr += `Total : $${v} \\times ${texNombre(combC3, 0)} \\times ${v - 1} \\times ${texNombre(combC2, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'paire') {
          questionId = ['speciale', 'paire']
          const v = jeu.valeurs
          const c = jeu.couleurs
          const combC2 = combinaison(c, 2)
          const combV3 = combinaison(v - 1, 3)
          reponse = v * combC2 * combV3 * c * c * c

          texte = `Combien de mains de $${mainSpeciale}$ cartes contiennent exactement une paire et $3$ cartes de valeurs toutes différentes entre elles et différentes de la paire ?`

          texteCorr = `Dans une main, l'ordre des cartes ne compte pas : chaque sélection est une combinaison.<br>`
          texteCorr += `Pour former exactement une paire :<br>`
          texteCorr += `$\\bullet$ Valeur de la paire : $C_1^{${v}} = ${v}$<br>`
          texteCorr += `$\\bullet$ $2$ couleurs parmi $${c}$ : $C_2^{${c}} = ${texNombre(combC2, 0)}$<br>`
          texteCorr += `$\\bullet$ $3$ valeurs parmi les $${v - 1}$ restantes : $C_3^{${v - 1}} = ${texNombre(combV3, 0)}$<br>`
          texteCorr += `$\\bullet$ $1$ couleur pour chacune des $3$ cartes : $${c}^3 = ${c * c * c}$<br><br>`
          texteCorr += `Total : $${v} \\times ${texNombre(combC2, 0)} \\times ${texNombre(combV3, 0)} \\times ${c * c * c} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'doublePaire') {
          questionId = ['speciale', 'doublePaire']
          const v = jeu.valeurs
          const c = jeu.couleurs
          const combV2 = combinaison(v, 2)
          const combC2 = combinaison(c, 2)
          reponse = combV2 * combC2 * combC2 * (v - 2) * c

          texte = `Combien de mains de $${mainSpeciale}$ cartes contiennent exactement deux paires et une carte isolée de valeur différente ?`

          texteCorr = `Dans une main, l'ordre des cartes ne compte pas : chaque sélection est une combinaison.<br>`
          texteCorr += `Pour former exactement deux paires :<br>`
          texteCorr += `$\\bullet$ $2$ valeurs parmi $${v}$ pour les paires : $C_2^{${v}} = ${texNombre(combV2, 0)}$<br>`
          texteCorr += `$\\bullet$ $2$ couleurs parmi $${c}$ pour chaque paire : $C_2^{${c}} \\times C_2^{${c}} = ${texNombre(combC2, 0)} \\times ${texNombre(combC2, 0)} = ${texNombre(combC2 * combC2, 0)}$<br>`
          texteCorr += `$\\bullet$ $1$ valeur parmi les $${v - 2}$ restantes : $${v - 2}$<br>`
          texteCorr += `$\\bullet$ $1$ couleur parmi $${c}$ : $${c}$<br><br>`
          texteCorr += `Total : $${texNombre(combV2, 0)} \\times ${texNombre(combC2 * combC2, 0)} \\times ${v - 2} \\times ${c} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else {
        // Fallback pour Jass quand 'speciale' est sélectionné : question 'total'
        questionId = ['total', nbCartes]
        reponse = combinaison(jeu.total, nbCartes)

        texte = `Combien de mains différentes de $${nbCartes}$ cartes peut-on recevoir ?`

        texteCorr = `On choisit $${nbCartes}$ cartes parmi $${jeu.total}$, l'ordre n'important pas.<br>`
        texteCorr += `Il s'agit d'une combinaison :<br>`
        texteCorr += `$C_{${nbCartes}}^{${jeu.total}} = \\dfrac{${jeu.total}!}{${nbCartes}! \\times ${jeu.total - nbCartes}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, ...questionId)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
