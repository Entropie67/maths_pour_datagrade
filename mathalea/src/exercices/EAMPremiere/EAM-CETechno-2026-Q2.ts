import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '9902b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Utiliser les propriétés des puissances'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2ANt2026 extends ExerciceQcmACourt {
  private base = 2

  private appliquerLesValeurs(
    a: number,
    n: number,
    m: number,
    d1?: string,
    d2?: string,
    d3?: string,
  ): void {
    this.base = a
    this.enonce = `$( ${a}^{${n}} )^{${m}}$ est égal à :`

    const produit = n * m
    const correct = `${a}^{${produit}}`

    const formatM = m < 0 ? `(${m})` : `${m}`

    this.correction = `Pour calculer la puissance d'une puissance, on utilise la propriété : $(a^n)^m = a^{n \\times m}$.<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `( ${a}^{${n}} )^{${m}} &= ${a}^{${n} \\times ${formatM}}\\\\[0.5em]`
    this.correction += `&= ${miseEnEvidence(correct)}`
    this.correction += `\\end{aligned}$`

    if (d1 !== undefined && d2 !== undefined && d3 !== undefined) {
      this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
    } else {
      // Génération des distracteurs calqués sur les erreurs du sujet
      const dist1 = `${a}^{${n + m}}` // Erreur : addition des exposants
      const dist2 = `${a * n}^{${m}}` // Erreur : multiplication de la base par l'exposant
      const dist3 = `${a}^{${n - m}}` // Erreur : soustraction des exposants

      this.reponses = [`$${correct}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]
    }
  }

  versionOriginale: () => void = () => {
    // Valeurs du sujet original : (2^3)^-5
    this.appliquerLesValeurs(2, 3, -5, '2^{-2}', '6^{-5}', '2^{8}')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const a = randint(2, 9)
      const n = choice([-5, -4, -3, -2, 2, 3, 4, 5])
      const m = choice([-5, -4, -3, -2, 2, 3, 4, 5])

      this.appliquerLesValeurs(a, n, m)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^\$(.+)\$ est égal à :\s*$/,
        (_, expression: string) =>
          `Écrire $${expression}$ sous la forme $${this.base}^{k}$, où $k$ est un entier relatif.`,
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        seulementCertainesPuissances: true,
      })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
