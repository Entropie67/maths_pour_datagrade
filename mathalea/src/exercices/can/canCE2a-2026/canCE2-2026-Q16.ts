import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { PieceBuilder } from '../../../lib/2d/pieces'
import { addSvgSelection } from '../../../lib/customElements/SvgSelectionElement'
import { choice } from '../../../lib/outils/arrayOutils'
import { texPrix } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Compter avec des pièces de monnaie'
export const interactifReady = true
export const uuid = '1474f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 * Calcule les pièces qui font la somme cible et retourne le résultat encodé en base n
 */
export default class Can2026CE2Q16 extends ExerciceCan {
  /**
   * Trouve une solution pour la somme cible en utilisant les pièces disponibles
   * @param pieces - Liste des valeurs des pièces disponibles
   * @param targetSum - Somme cible à atteindre
   * @returns Liste d'indices des pièces sélectionnées pour atteindre la somme cible
   */
  private findSolution(pieces: number[], targetSum: number): number[] {
    const n = pieces.length
    const results: number[][] = []

    // Générer toutes les combinaisons possibles de pièces
    for (let i = 0; i < 1 << n; i++) {
      const combination: number[] = []
      let sum = 0

      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          combination.push(j)
          sum += pieces[j]
        }
      }

      if (sum === targetSum) {
        results.push(combination)
      }
    }

    // Retourner la première combinaison trouvée ou une liste vide si aucune solution n'est trouvée
    return results.length > 0 ? results[0] : []
  }

  enonce(pieces: number[], somme: number) {
    const objets: NestedObjetMathalea2dArray = []

    this.question = `Tu dois $${texPrix(somme)}${sp()}\\text{€}$ à ton frère.<br>${context.isHtml ? 'Sélectionne ce que tu lui donnes' : 'Entoure ce que tu lui donnes'}.<br>`
    for (let i = 0; i < pieces.length; i++) {
      const piece = new PieceBuilder(pieces[i]).make(i * 1.2, 0)
      objets.push(piece)
    }

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.7 },
        fixeBordures(
          (
            objets
              .map((obj) => {
                if (Array.isArray(obj)) {
                  return obj[0]
                } else return null
              })
              .filter((o) => o !== null) as NestedObjetMathalea2dArray
          ).flat(),
          {
            rxmin: 0,
            rxmax: 0,
            rymin: 0,
            rymax: 0,
          },
        ),
      ),
      objets,
    )
    this.canReponseACompleter = figure

    if (context.isHtml) {
      const svgItems = pieces.map((valeur) => {
        const piece = new PieceBuilder(valeur).make(0, 0, 2)
        return Object.assign(
          {},
          {
            svg: mathalea2d(
              Object.assign(
                { pixelsParCm: 30, scale: 1, display: 'inline-block' } as const,
                fixeBordures(
                  (
                    piece
                      .map((obj) => {
                        if (Array.isArray(obj)) {
                          return obj[0]
                        } else return null
                      })
                      .filter((o) => o !== null) as NestedObjetMathalea2dArray
                  ).flat(),
                  {
                    rxmin: 0,
                    rxmax: 0,
                    rymin: 0,
                    rymax: 0,
                  },
                ),
              ),
              piece,
            ),
            value: valeur,
          },
        )
      })
      /*  On peut passer les SVG dans un format 2D (array de array) pour faire plusieurs lignes, ou dans un format 1D (array simple) pour faire une ligne. Ici on fait 2 lignes pour l'exemple, mais on va garder une ligne pour les 5 pièces.
     const svgItemsGrid = [
        [svgItems[0], svgItems[1], svgItems[2]],
        [svgItems[3], svgItems[4]],
      ]
        */

      this.question += addSvgSelection(this, 0, { svgs: svgItems })
    } else {
      this.question = this.question + figure
    }
    this.reponse = String(somme)
    const solutionIndices = this.findSolution(pieces, somme)
    this.correction = `Voici les pièces qu'il faut donner : ${solutionIndices
      .slice(0, -1)
      .map((index) => `$${miseEnEvidence(texPrix(pieces[index]))}${sp()}\\text{€}$`)
      .join(
        ' ; ',
      )} et $${miseEnEvidence(texPrix(pieces[solutionIndices[solutionIndices.length - 1]]))}${sp()}\\text{€}$.<br>
      ${addSvgSelection(this, 0, {
        id: `svgSelection-correctionEx${this.numeroExercice}Q0`,
        svgs: solutionIndices.map((index) => {
          const piece = new PieceBuilder(pieces[index]).make(0, 0, 2)
          return Object.assign(
            {},
            {
              svg: mathalea2d(
                Object.assign(
                  {
                    pixelsParCm: 30,
                    scale: 1,
                    display: 'inline-block',
                  } as const,
                  fixeBordures(
                    (
                      piece
                        .map((obj) => {
                          if (Array.isArray(obj)) {
                            return obj[0]
                          } else return null
                        })
                        .filter((o) => o !== null) as NestedObjetMathalea2dArray
                    ).flat(),
                    {
                      rxmin: 0,
                      rxmax: 0,
                      rymin: 0,
                      rymax: 0,
                    },
                  ),
                ),
                piece,
              ),
              value: pieces[index],
            },
          )
        }),
      })}`
  }

  nouvelleVersion() {
    const pieces =
      this.canOfficielle || this.sup
        ? [2, 2, 0.5, 0.5, 0.5]
        : [2, 2, 1, 0.5, 0.5]
    this.formatInteractif = 'svg-selection'
    if (this.canOfficielle || this.sup) this.enonce(pieces, 3)
    else this.enonce(pieces, choice([2.5, 3, 3.5, 4, 5]))
  }
}
