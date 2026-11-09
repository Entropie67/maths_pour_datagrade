import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '65782'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Retrouver l'égalité correcte avec des puissances"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '08/11/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ8AGs2026 extends ExerciceQcmACourt {
  /** Les deux membres de l'égalité vraie, bonne réponse du QCM. */
  private egaliteCorrecte(): { gauche: string; droite: string } {
    const [, gauche = '', droite = ''] =
      /^\$(.*) = (a\^\{[^}]*\})\$$/.exec(this.reponses[0]) ?? []
    return { gauche, droite }
  }

  private appliquerLesValeurs(
    n1: number,
    n2: number,
    n3: number,
    n4: number,
    n5: number,
    n6: number,
    n7: number,
    n8: number,
    n9: number,
    typeCorrect: number,
  ): void {
    this.enonce = `On considère un réel $a$ quelconque, différent de $0$.<br>`
    this.enonce += `Une seule de ces égalités est vraie. Laquelle ?`

    // Définition des 3 distracteurs (les erreurs classiques, fixes dans leur structure)
    const dist1Str = `\\dfrac{a^{${n1}}}{a^{-${n2}}} = a^{${n1 - n2}}`
    const dist2Str = `\\dfrac{a^{${n3}}}{a^{${n4}}} = a^{${n3 / n4}}`
    const dist3Str = `(a^{${n5}})^{${n6}} = a^{${n5 + n6}}`

    // Construction de la bonne réponse selon le type tiré au sort
    let correctStr = ''
    let explicationCorrecte = ''

    switch (typeCorrect) {
      case 1: // Produit et quotient (Type original)
        correctStr = `\\dfrac{a \\times a^{${n7}}}{a^{${n8}}} = a^{${1 + n7 - n8}}`
        explicationCorrecte = `$\\dfrac{a \\times a^{${n7}}}{a^{${n8}}} = \\dfrac{a^1 \\times a^{${n7}}}{a^{${n8}}} = \\dfrac{a^{1 + ${n7}}}{a^{${n8}}} = a^{${1 + n7} - ${n8}} = a^{${1 + n7 - n8}}$.`
        break
      case 2: // Produit classique
        correctStr = `a^{${n7}} \\times a^{${n8}} = a^{${n7 + n8}}`
        explicationCorrecte = `$a^{${n7}} \\times a^{${n8}} = a^{${n7} + ${n8}} = a^{${n7 + n8}}$.`
        break
      case 3: // Puissance de puissance
        correctStr = `(a^{${n7}})^{${n8}} = a^{${n7 * n8}}`
        explicationCorrecte = `$(a^{${n7}})^{${n8}} = a^{${n7} \\times ${n8}} = a^{${n7 * n8}}$.`
        break
      case 4: // Quotient classique
        correctStr = `\\dfrac{a^{${n7}}}{a^{${n8}}} = a^{${n7 - n8}}`
        explicationCorrecte = `$\\dfrac{a^{${n7}}}{a^{${n8}}} = a^{${n7} - ${n8}} = a^{${n7 - n8}}$.`
        break
      case 5: // Quotient avec produit au dénominateur
        correctStr = `\\dfrac{a^{${n7}}}{a^{${n8}} \\times a^{${n9}}} = a^{${n7 - (n8 + n9)}}`
        explicationCorrecte = `$\\dfrac{a^{${n7}}}{a^{${n8}} \\times a^{${n9}}} = \\dfrac{a^{${n7}}}{a^{${n8} + ${n9}}} = \\dfrac{a^{${n7}}}{a^{${n8 + n9}}} = a^{${n7} - ${n8 + n9}} = a^{${n7 - (n8 + n9)}}$.`
        break
    }

    this.reponses = [
      `$${correctStr}$`,
      `$${dist1Str}$`,
      `$${dist2Str}$`,
      `$${dist3Str}$`,
    ]

    // Rédaction de la correction détaillée
    this.correction = `Vérifions chaque égalité en utilisant les propriétés des puissances :<br><br>`

    this.correction += `$\\bullet$ $\\dfrac{a^{${n1}}}{a^{-${n2}}} = a^{${n1} - (-${n2})} = a^{${n1} + ${n2}} = a^{${n1 + n2}}$.<br>`
    this.correction += `L'égalité $${dist1Str}$ est donc fausse.<br><br>`

    this.correction += `$\\bullet$ $\\dfrac{a^{${n3}}}{a^{${n4}}} = a^{${n3} - ${n4}} = a^{${n3 - n4}}$.<br>`
    this.correction += `L'égalité $${dist2Str}$ est donc fausse.<br><br>`

    this.correction += `$\\bullet$ $(a^{${n5}})^{${n6}} = a^{${n5} \\times ${n6}} = a^{${n5 * n6}}$.<br>`
    this.correction += `L'égalité $${dist3Str}$ est donc fausse.<br><br>`

    this.correction += `$\\bullet$ ${explicationCorrecte}<br>`
    this.correction += `L'égalité $${miseEnEvidence(correctStr)}$ est donc vraie.<br>`
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image
    // Correct : (a * a^5) / a^2 = a^4 (Type 1)
    // On passe un n9 "inutile" valant 1 pour satisfaire la signature de la fonction
    this.appliquerLesValeurs(8, 5, 30, 2, 10, 3, 5, 2, 1, 1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Sans tirage valide à cette itération, le test ci-dessous ne doit pas juger les réponses d'un tirage précédent.
      this.reponses = []
      // Pour le premier distracteur
      const n1 = randint(4, 9)
      const n2 = randint(3, 8)

      // Pour le deuxième distracteur
      const n4 = randint(2, 5)
      const n3 = n4 * randint(4, 8)

      // Pour le troisième distracteur
      const n5 = randint(4, 10)
      const n6 = randint(3, 5)

      // Pour la bonne réponse : valeurs générales
      const n7 = randint(4, 12)
      const n8 = randint(2, 6)
      const n9 = randint(2, 6) // Utile spécifiquement pour le type 5

      // On choisit aléatoirement la structure de la bonne réponse parmi 5 types
      const typeCorrect = choice([1, 2, 3, 4, 5])

      // Sécurité : on évite que le hasard crée une égalité accidentellement vraie pour les distracteurs
      const isDist2False = n3 - n4 !== n3 / n4
      const isDist3False = n5 * n6 !== n5 + n6

      if (isDist2False && isDist3False) {
        this.appliquerLesValeurs(
          n1,
          n2,
          n3,
          n4,
          n5,
          n6,
          n7,
          n8,
          n9,
          typeCorrect,
        )
        compteur++
      }
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Une seule de ces égalités est vraie\. Laquelle \?\s*$/,
        `Écrire $${this.egaliteCorrecte().gauche}$ sous la forme $a^{k}$, où $k$ est un entier relatif.`,
      )
    // La bonne réponse du QCM est de la forme « $\dfrac{a \times a^{5}}{a^{2}} = a^{4}$ » : on ne garde que $a^{k}$
    this.reponseCourte = () => this.egaliteCorrecte().droite
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        seulementCertainesPuissances: true,
      })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
