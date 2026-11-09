import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des chemins sur un quadrillage'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'b1223'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-6'],
}

/**
 * Combinaisons - Chemins sur quadrillage
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class CheminsQuadrillage extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Chemin simple (combinaison)',
        '2 : Chemin passant par un point (combinaison)',
        '3 : Chemin évitant un point (combinaison)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['simple', 'passant', 'evitant'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const contextes = [
      'Sur un quadrillage, on se déplace uniquement vers la droite ou vers le haut.',
      'Une fourmi se déplace sur un grillage, ne pouvant aller que vers la droite ou vers le haut.',
      'Un robot parcourt une grille en ne pouvant se déplacer que vers la droite ou vers le haut.',
      "Dans un plan quadrillé, on trace des chemins en n'allant que vers la droite ou vers le haut.",
      'Un piéton traverse un quartier en damier en ne marchant que vers la droite ou vers le haut.',
      "Dans un échiquier, une pièce spéciale ne peut se déplacer que d'une case vers la droite ou d'une case vers le haut.",
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]
      const intro = choice(contextes)

      if (typeQuestion === 'simple') {
        const droite = randint(2, 10)
        const haut = randint(2, 10)
        const total = droite + haut

        reponse = combinaison(total, droite)

        const g = grille(0, 0, droite, haut, 'gray', 1, 1)
        const A = pointAbstrait(0, 0, 'A', 'below')
        const B = pointAbstrait(droite, haut, 'B', 'above')
        const objets = [g, tracePoint(A, B), labelPoint(A, B)]
        const grilleSVG = mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: droite + 1,
            ymax: haut + 1,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        )

        texte = `${intro} Pour aller de $A$ à $B$, il faut effectuer $${droite}$ pas vers la droite et $${haut}$ pas vers le haut. `
        texte += `Combien de chemins différents peut-on emprunter ?<br>${grilleSVG}`

        texteCorr = `On doit faire exactement $${droite}$ pas vers la droite ($\\rightarrow$) et $${haut}$ pas vers le haut ($\\uparrow$), dans un ordre quelconque.<br>`
        texteCorr += `Un chemin est donc une suite de $${total}$ pas au total. À chaque étape, on fait soit un pas vers la droite, soit un pas vers le haut.<br>`
        texteCorr += `La seule liberté est de choisir à quels moments (parmi les $${total}$ pas) on va vers la droite : on choisit $${droite}$ positions parmi $${total}$. L'ordre de ces positions n'a pas d'importance (choisir «${sp()}le pas $2$ puis le pas $5$${sp()}» ou «${sp()}le pas $5$ puis le pas $2$${sp()}» donne le même chemin) : il s'agit d'une combinaison.<br>`
        texteCorr += `$C_{${droite}}^{${total}} = \\dfrac{${total}!}{${droite}! \\times ${haut}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'passant') {
        const droite1 = randint(2, 5)
        const haut1 = randint(2, 5)
        const droite2 = randint(2, 5)
        const haut2 = randint(2, 5)

        const total1 = droite1 + haut1
        const total2 = droite2 + haut2
        const chemins1 = combinaison(total1, droite1)
        const chemins2 = combinaison(total2, droite2)
        reponse = chemins1 * chemins2

        const pointIntermediaire = choice(['M', 'P', 'I', 'C', 'K', 'Q'])

        const totalDroite = droite1 + droite2
        const totalHaut = haut1 + haut2
        const g = grille(0, 0, totalDroite, totalHaut, 'gray', 1, 1)
        const A = pointAbstrait(0, 0, 'A', 'below')
        const M = pointAbstrait(droite1, haut1, pointIntermediaire, 'above')
        const B = pointAbstrait(totalDroite, totalHaut, 'B', 'above')
        const objets = [g, tracePoint(A, M, B), labelPoint(A, M, B)]
        const grilleSVG = mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: totalDroite + 1,
            ymax: totalHaut + 1,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        )

        texte = `${intro} On va de $A$ à $B$ en passant obligatoirement par le point $${pointIntermediaire}$. `
        texte += `De $A$ à $${pointIntermediaire}$, il faut $${droite1}$ pas vers la droite et $${haut1}$ pas vers le haut. `
        texte += `De $${pointIntermediaire}$ à $B$, il faut $${droite2}$ pas vers la droite et $${haut2}$ pas vers le haut. `
        texte += `Combien de chemins différents relient $A$ à $B$ en passant par $${pointIntermediaire}$ ?<br>${grilleSVG}`

        texteCorr = `Le chemin passe obligatoirement par $${pointIntermediaire}$ : on décompose en deux parties indépendantes.<br><br>`
        texteCorr += `$\\bullet$ De $A$ à $${pointIntermediaire}$ : on fait $${droite1}$ pas vers la droite et $${haut1}$ pas vers le haut, soit $${total1}$ pas au total. On choisit à quels moments on va vers la droite (combinaison) : $C_{${droite1}}^{${total1}} = ${chemins1}$ chemins.<br>`
        texteCorr += `$\\bullet$ De $${pointIntermediaire}$ à $B$ : on fait $${droite2}$ pas vers la droite et $${haut2}$ pas vers le haut, soit $${total2}$ pas au total. De même : $C_{${droite2}}^{${total2}} = ${chemins2}$ chemins.<br><br>`
        texteCorr += `Les deux parties sont indépendantes (le choix du chemin $A \\to ${pointIntermediaire}$ n'influence pas le choix $${pointIntermediaire} \\to B$). Par le principe multiplicatif :<br>`
        texteCorr += `$${chemins1} \\times ${chemins2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else {
        // Évitant un point
        const droite = randint(4, 10)
        const haut = randint(4, 10)
        const total = droite + haut

        const xInterdit = randint(1, droite - 1)
        const yInterdit = randint(1, haut - 1)

        const totalChemins = combinaison(total, droite)

        const total1 = xInterdit + yInterdit
        const cheminsVersInterdit = combinaison(total1, xInterdit)
        const total2 = droite - xInterdit + (haut - yInterdit)
        const cheminsDepuisInterdit = combinaison(total2, droite - xInterdit)
        const cheminsInterdits = cheminsVersInterdit * cheminsDepuisInterdit

        reponse = totalChemins - cheminsInterdits

        const g = grille(0, 0, droite, haut, 'gray', 1, 1)
        const A = pointAbstrait(0, 0, 'A', 'below')
        const B = pointAbstrait(droite, haut, 'B', 'above')
        const F = pointAbstrait(xInterdit, yInterdit, '✕', 'above')
        const objets = [g, tracePoint(A, B, F), labelPoint(A, B, F)]
        const grilleSVG = mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: droite + 1,
            ymax: haut + 1,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        )

        texte = `${intro} On va de $A(0;0)$ à $B(${droite};${haut})$ en évitant le point interdit $(${xInterdit};${yInterdit})$ (marqué ✕ sur la grille). `
        texte += `Combien de chemins différents sont possibles ?<br>${grilleSVG}`

        texteCorr = `On utilise la méthode du complémentaire : nombre total de chemins moins les chemins qui passent par le point interdit.<br><br>`
        texteCorr += `$\\bullet$ Total de chemins de $A$ à $B$ : on fait $${droite}$ pas vers la droite et $${haut}$ pas vers le haut, soit $${total}$ pas. On choisit à quels moments on va vers la droite (combinaison) : $C_{${droite}}^{${total}} = ${texNombre(totalChemins)}$<br><br>`
        texteCorr += `$\\bullet$ Chemins interdits (passant par $(${xInterdit};${yInterdit})$). On décompose en deux parties :<br>`
        texteCorr += `$\\quad$ De $A$ à $(${xInterdit};${yInterdit})$ : $${xInterdit}$ pas à droite et $${yInterdit}$ vers le haut → $C_{${xInterdit}}^{${total1}} = ${texNombre(cheminsVersInterdit)}$<br>`
        texteCorr += `$\\quad$ De $(${xInterdit};${yInterdit})$ à $B$ : $${droite - xInterdit}$ pas à droite et $${haut - yInterdit}$ vers le haut → $C_{${droite - xInterdit}}^{${total2}} = ${texNombre(cheminsDepuisInterdit)}$<br>`
        texteCorr += `$\\quad$ Par le principe multiplicatif : $${texNombre(cheminsVersInterdit)} \\times ${texNombre(cheminsDepuisInterdit)} = ${texNombre(cheminsInterdits)}$ chemins interdits.<br><br>`
        texteCorr += `$\\bullet$ Chemins valides : $${texNombre(totalChemins)} - ${texNombre(cheminsInterdits)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
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
