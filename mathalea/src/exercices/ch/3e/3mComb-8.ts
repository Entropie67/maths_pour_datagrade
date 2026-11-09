import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer dans les polygones (diagonales, triangles)'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'bghtz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-8'],
}

/**
 * Combinaisons - Diagonales et triangles dans les polygones
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class PolygonesDenombrement extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Nombre de diagonales (combinaison)',
        '2 : Nombre de triangles (combinaison)',
        '3 : Segments reliant des points (combinaison)',
        "4 : Diagonales issues d'un sommet",
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['diagonales', 'triangles', 'segments', 'diagonalesSommet'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const nomsPolygones: { [key: number]: string } = {
      5: 'pentagone',
      6: 'hexagone',
      7: 'heptagone',
      8: 'octogone',
      9: 'ennéagone',
      10: 'décagone',
      11: 'hendécagone',
      12: 'dodécagone',
      14: 'tétradécagone',
      15: 'pentadécagone',
      16: 'hexadécagone',
      18: 'octadécagone',
      20: 'icosagone',
      24: 'icositétragone',
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'diagonales') {
        const n = choice([5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 24])
        const nomPolygone = nomsPolygones[n] || `polygone à $${n}$ côtés`
        const variante = choice(['direct', 'formule', 'intersections'])

        if (variante === 'direct') {
          reponse = (n * (n - 3)) / 2

          texte = `Combien de diagonales possède un ${nomPolygone} ($${n}$ sommets)${sp()}?`

          texteCorr = `Un ${nomPolygone} a $${n}$ sommets.<br>`
          texteCorr += `Le nombre total de segments reliant deux sommets est une combinaison (le segment $AB$ est le même que $BA$)${sp()}:<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n}!}{2! \\times ${n - 2}!} = \\dfrac{${n} \\times ${n - 1}}{2} = ${combinaison(n, 2)}$<br>`
          texteCorr += `On retire les $${n}$ côtés du polygone.<br><br>`
          texteCorr += `Nombre de diagonales${sp()}: $${combinaison(n, 2)} - ${n} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'formule') {
          reponse = (n * (n - 3)) / 2

          const ctx = choice([
            `Un polygone convexe possède $${n}$ sommets. Combien a-t-il de diagonales${sp()}?`,
            `Déterminer le nombre de diagonales d'un polygone régulier à $${n}$ côtés.`,
          ])
          texte = ctx

          texteCorr = `Nombre de segments entre sommets (l'ordre n'importe pas, si on relie $A$ avec $B$ ou $B$ avec $A$ cela revient au même${sp()}: combinaison)${sp()}: $C_2^{${n}} = ${combinaison(n, 2)}$.<br>`
          texteCorr += `On retire les $${n}$ côtés${sp()}:<br>`
          texteCorr += `$C_2^{${n}} - ${n} = \\dfrac{${n}(${n}-1)}{2} - ${n} = \\dfrac{${n}(${n}-3)}{2} = \\dfrac{${n} \\times ${n - 3}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          reponse = combinaison(n, 4)

          texte = `Combien de points d'intersection des diagonales se trouvent strictement à l'intérieur d'un ${nomPolygone} ($${n}$ sommets) convexe (en supposant qu'aucune trois diagonales ne sont concourantes)${sp()}?`

          texteCorr = `Chaque intersection intérieure est déterminée par exactement $4$ sommets du polygone (les extrémités des $2$ diagonales qui se coupent).<br>`
          texteCorr += `On choisit $4$ sommets parmi $${n}$ (l'ordre n'importe pas${sp()}: le même groupe de $4$ sommets donne la même intersection). Il s'agit d'une combinaison${sp()}:<br>`
          texteCorr += `$C_4^{${n}} = \\dfrac{${n}!}{4! \\times ${n - 4}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'triangles') {
        const variante = choice([
          'sommets',
          'nonAlignes',
          'quadrilateres',
          'droites',
        ])

        if (variante === 'sommets') {
          const n = choice([6, 7, 8, 9, 10, 12, 14, 15, 20])
          const nomPolygone = nomsPolygones[n] || `polygone à $${n}$ côtés`

          reponse = combinaison(n, 3)

          const ctx = choice([
            `Combien de triangles peut-on former en reliant 3 sommets d'un ${nomPolygone} ($${n}$ sommets)${sp()}?`,
            `En choisissant $3$ sommets d'un ${nomPolygone} ($${n}$ sommets), combien de triangles différents obtient-on${sp()}?`,
            `Un ${nomPolygone} ($${n}$ sommets) régulier a ses sommets numérotés. Combien de triangles peut-on tracer en joignant 3 de ces sommets${sp()}?`,
          ])
          texte = ctx

          texteCorr = `On choisit $3$ sommets parmi $${n}$, l'ordre n'important pas (les triangles $ABC, ACB$, etc. sont tous identiques). Il s'agit d'une combinaison${sp()}:<br>`
          texteCorr += `$C_3^{${n}} = \\dfrac{${n}!}{3! \\times ${n - 3}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'nonAlignes') {
          const n = randint(7, 15)

          reponse = combinaison(n, 3)

          const ctx = choice([
            `$${n}$ points sont placés dans le plan, aucun triplet n'étant aligné.`,
            `On dispose de $${n}$ points du plan en position générale (pas de $3$ points alignés).`,
            `$${n}$ villes sont disposées de telle sorte qu'aucun groupe de $3$ ne soit aligné.`,
            `$${n}$ étoiles d'une constellation sont telles qu'aucune trois ne sont alignées.`,
          ])

          texte = `${ctx} Combien de triangles peut-on former${sp()}?`

          texteCorr = `On choisit $3$ points parmi $${n}$ pour former un triangle (l'ordre n'important pas, les triangles $ABC, ACB$, etc. sont tous identiques${sp()}: combinaison).<br>`
          texteCorr += `Comme aucun triplet n'est aligné, chaque choix de $3$ points donne un triangle.<br>`
          texteCorr += `$C_3^{${n}} = \\dfrac{${n}!}{3! \\times ${n - 3}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'quadrilateres') {
          const n = choice([7, 8, 9, 10, 12, 15, 20])
          const nomPolygone = nomsPolygones[n] || `polygone à $${n}$ côtés`

          reponse = combinaison(n, 4)

          texte = `Combien de quadrilatères convexes peut-on former en reliant 4 sommets d'un ${nomPolygone} ($${n}$ sommets) convexe${sp()}?`

          texteCorr = `On choisit $4$ sommets parmi $${n}$, l'ordre n'important pas. Dans un polygone convexe, tout choix de $4$ sommets donne un quadrilatère convexe (combinaison)${sp()}:<br>`
          texteCorr += `$C_4^{${n}} = \\dfrac{${n}!}{4! \\times ${n - 4}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(5, 8)

          reponse = combinaison(n, 3)

          texte = `$${n}$ droites sont tracées dans le plan, deux quelconques étant sécantes et trois quelconques non concourantes. Combien de triangles forment-elles${sp()}?`

          texteCorr = `Chaque triangle est déterminé par le choix de $3$ droites parmi $${n}$, l'ordre n'important pas (les triangles $ABC, ACB$, etc. sont tous identiques${sp()}: combinaison).<br>`
          texteCorr += `Comme deux droites quelconques se coupent et trois quelconques ne sont pas concourantes, chaque triplet de droites forme un triangle.<br>`
          texteCorr += `$C_3^{${n}} = \\dfrac{${n}!}{3! \\times ${n - 3}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'diagonalesSommet') {
        const n = choice([5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 18, 20])
        const nomPolygone = nomsPolygones[n] || `polygone à $${n}$ côtés`

        reponse = n - 3

        const ctx = choice([
          `Combien de diagonales peut-on tracer depuis un sommet d'un ${nomPolygone} ($${n}$ sommets)${sp()}?`,
          `Depuis un sommet donné d'un ${nomPolygone} ($${n}$ sommets), combien de diagonales partent${sp()}?`,
          `Un ${nomPolygone} ($${n}$ sommets) a ses sommets numérotés de $1$ à $${n}$. Combien de diagonales partent du sommet $1$${sp()}?`,
        ])
        texte = ctx

        texteCorr = `Depuis un sommet, on ne peut pas tracer de diagonale vers${sp()}:<br>`
        texteCorr += `$\\bullet$ lui-même<br>`
        texteCorr += `$\\bullet$ les $2$ sommets adjacents (ce seraient des côtés)<br><br>`
        texteCorr += `Il reste donc $${n} - 3 = ${miseEnEvidence(texNombre(reponse, 0))}$ sommets vers lesquels tracer une diagonale.`
      } else {
        // Segments reliant des points
        const variante = choice(['cercle', 'droite', 'deuxGroupes', 'reseau'])

        if (variante === 'cercle') {
          const n = randint(6, 15)

          reponse = combinaison(n, 2)

          const ctx = choice([
            `$${n}$ points sont placés sur un cercle.`,
            `$${n}$ villes sont situées sur une route circulaire.`,
            `$${n}$ antennes sont disposées en cercle.`,
            `$${n}$ bornes sont installées le long d'un rond-point.`,
          ])

          texte = `${ctx} Combien de segments (cordes) peut-on tracer en reliant deux de ces points${sp()}?`

          texteCorr = `On choisit $2$ points parmi $${n}$ pour former un segment${sp()}: le segment $AB$ est le même que $BA$ (combinaison)${sp()}:<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n}!}{2! \\times ${n - 2}!} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'droite') {
          const n = randint(5, 12)

          reponse = combinaison(n, 2)

          texte = `$${n}$ points distincts sont alignés sur une droite. Combien de segments différents ont leurs extrémités parmi ces points${sp()}?`

          texteCorr = `On choisit $2$ points parmi $${n}$ pour former un segment${sp()}: le segment $AB$ est le même que $BA$ (combinaison).<br>`
          texteCorr += `Même alignés, chaque paire de points définit un segment distinct.<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'deuxGroupes') {
          const nA = randint(3, 8)
          const nB = randint(3, 8)

          reponse = nA * nB

          const ctx = choice([
            {
              groupeA: 'rouges',
              groupeB: 'bleus',
              singA: 'rouge',
              singB: 'bleu',
            },
            {
              groupeA: 'du groupe A',
              groupeB: 'du groupe B',
              singA: 'du groupe A',
              singB: 'du groupe B',
            },
            {
              groupeA: 'sur la rive gauche',
              groupeB: 'sur la rive droite',
              singA: 'de la rive gauche',
              singB: 'de la rive droite',
            },
          ])

          texte = `$${nA}$ points ${ctx.groupeA} et $${nB}$ points ${ctx.groupeB} sont placés dans le plan. On ne trace de segments qu'entre un point ${ctx.singA} et un point ${ctx.singB}. Combien de segments peut-on tracer${sp()}?`

          texteCorr = `Chaque segment relie un point parmi $${nA}$ à un point parmi $${nB}$.<br>`
          texteCorr += `Par le principe multiplicatif${sp()}: $${nA} \\times ${nB} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(8, 20)

          reponse = combinaison(n, 2)

          const ctx = choice([
            `Dans un réseau informatique de $${n}$ ordinateurs, chaque paire d'ordinateurs est reliée par un câble.`,
            `$${n}$ îles doivent toutes être reliées deux à deux par des ponts.`,
            `Dans un groupe de $${n}$ personnes, chaque paire échange une carte de visite.`,
            `$${n}$ stations de métro sont toutes reliées directement entre elles par des lignes.`,
          ])

          texte = `${ctx} Combien de liaisons sont nécessaires${sp()}?`

          texteCorr = `On choisit $2$ éléments parmi $${n}$, l'ordre n'important pas (si on a $A$ et $B$ ou $B$ et $A$ cela revient au même${sp()}: combinaison)${sp()}:<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, typeQuestion, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
