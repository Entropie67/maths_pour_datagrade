import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Question $24$'
export const interactifReady = true

export const uuid = 'gk9zv'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ24 extends ExerciceCan {
  enonce(x1?: number, y1?: number, x2?: number, y2?: number): void {
    if (x1 == null || y1 == null || x2 == null || y2 == null) {
      const donnees = [
        // 5 cas colinéaires (déterminant = 0)
        [2, 5, -4, -10],
        [-3, 4, 6, -8],
        [4, 3, 8, 6],
        [-5, -2, 10, 4],
        [7, -3, -14, 6],
        // 5 cas non colinéaires (déterminant = 1 ou -1)
        [2, 3, 5, 7], // 14 - 15 = -1
        [3, 5, 4, 7], // 21 - 20 = 1
        [-4, 3, -5, 4], // -16 - (-15) = -1
        [5, 2, 7, 3], // 15 - 14 = 1
        [-3, -2, -5, -3], // 9 - 10 = -1
      ]

      const valeurs = choice(donnees)
      x1 = valeurs[0]
      y1 = valeurs[1]
      x2 = valeurs[2]
      y2 = valeurs[3]
    }

    const det = x1 * y2 - y1 * x2
    const sontColineaires = det === 0

    const enonce = `Les vecteurs $\\vec{u}\\begin{pmatrix} ${x1} \\\\ ${y1} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix} ${x2} \\\\ ${y2} \\end{pmatrix}$ sont-ils colinéaires ?`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: false },
      enonce,
      propositions: [
        { texte: 'OUI', statut: sontColineaires },
        { texte: 'NON', statut: !sontColineaires },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + '<br>' + qcm.texte

    // Petite subtilité ajoutée pour y1 : on met des parenthèses s'il est négatif pour un plus beau rendu LaTeX
    const y1Str = y1 < 0 ? `(${y1})` : `${y1}`

    this.correction = `On calcule le déterminant : <br>
    $\\det(\\vec{u}\\,,\\,\\vec{v})=${x1} \\times ${ecritureParentheseSiNegatif(y2)}- ${y1Str} \\times ${ecritureParentheseSiNegatif(x2)}= ${x1 * y2} - ${ecritureParentheseSiNegatif(y1 * x2)} = ${det}$. <br>`

    if (sontColineaires) {
      this.correction += `Le déterminant est nul, donc les vecteurs sont colinéaires : ${texteEnCouleurEtGras('OUI')}.`
    } else {
      this.correction += `Le déterminant est égal à $${det}$ (proche de $0$ mais non nul), donc les vecteurs ne sont pas colinéaires : ${texteEnCouleurEtGras('NON')}.`
    }

    this.canEnonce = enonce
    this.canReponseACompleter = 'Entourer la réponse : OUI / NON'
  }

  nouvelleVersion(): void {
    // Cas de l'image officielle
    if (this.canOfficielle) this.enonce(-5, 3, 7, -4)
    else this.enonce()
  }
}
