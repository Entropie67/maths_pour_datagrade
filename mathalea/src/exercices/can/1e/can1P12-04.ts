import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'

export const titre =
  'Calculer une probabilité conditionnelle (tirage sans remise dans une urne)'
export const interactifReady = true

export const dateDePublication = '15/02/2026'
export const uuid = '0ae4c'
export const refs = {
  'fr-fr': ['can1P12-04', 'can2P2-07'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ProbaCond extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 10) // nombre de jetons rouges
    const b = this.quotaRandint('b', 2, 10) // nombre de jetons noirs
    const total = a + b

    /**
     * Retourne "n jeton" ou "n jetons" selon la valeur de n
     */
    function jetons(n: number): string {
      return `$${n}$ jeton${n === 1 ? '' : 's'}`
    }

    /**
     * Construit la liste de distracteurs en éliminant ceux qui sont égaux à la bonne réponse.
     * Chaque candidat est une FractionEtendue. On compare avec isEqual.
     * On retourne les chaînes LaTeX des distracteurs valides.
     */
    function distracteursValides(
      reponse: FractionEtendue,
      candidats: FractionEtendue[],
    ): string[] {
      return candidats
        .filter((d) => !d.isEqual(reponse))
        .map((d) => `$${d.texFractionSimplifiee}$`)
    }

    if (context.isAmc) this.versionQcm = false
    let reponse = new FractionEtendue(1, 1)
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        {
          // Formulation en langage courant
          const choixCouleur = choice([true, false])
          if (choixCouleur) {
            // Premier tiré : rouge → on veut noir en deuxième
            // Reste : (a-1) rouges, b noirs, total-1 jetons
            reponse = new FractionEtendue(b, total - 1)

            this.question = `Une urne contient $${a}$ jetons rouges et $${b}$ jetons noirs.<br>`
            this.question += `On choisit au hasard un jeton, puis un deuxième ${texteGras('sans remettre')} le premier dans l'urne.<br>`
            this.question += this.versionQcm
              ? `La probabilité que le deuxième jeton soit noir sachant que le premier jeton tiré est rouge est égale à :`
              : `Quelle est la probabilité que le deuxième jeton soit noir sachant que le premier jeton tiré est rouge ?`

            this.optionsChampTexte = { texteAvant: '<br> ' }

            this.correction = `Après avoir tiré un jeton rouge, il reste ${jetons(a - 1)} rouge${a - 1 === 1 ? '' : 's'} et ${jetons(b)} noir${b === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
            this.correction += `La probabilité que le deuxième jeton soit noir sachant que le premier est rouge est : `
            this.correction += reponse.estIrreductible
              ? `$${miseEnEvidence(reponse.texFractionSimplifiee)}$.`
              : `$${reponse.texFraction}=${miseEnEvidence(reponse.texFractionSimplifiee)}$.`

            if (this.versionQcm) {
              this.distracteurs = distracteursValides(reponse, [
                new FractionEtendue(b, total),
                new FractionEtendue(b - 1, total - 1),
                new FractionEtendue(a, total - 1),
                new FractionEtendue(a - 1, total),
                new FractionEtendue(a, total),
                new FractionEtendue(b + 1, total),
              ])
            }
          } else {
            // Premier tiré : noir → on veut rouge en deuxième
            // Reste : a rouges, (b-1) noirs, total-1 jetons
            reponse = new FractionEtendue(a, total - 1)

            this.question = `Une urne contient $${a}$ jetons rouges et $${b}$ jetons noirs.<br>`
            this.question += `On choisit au hasard un jeton, puis un deuxième ${texteGras('sans remettre')} le premier dans l'urne.<br>`
            this.question += this.versionQcm
              ? `La probabilité que le deuxième jeton soit rouge sachant que le premier jeton tiré est noir est égale à :`
              : `Quelle est la probabilité que le deuxième jeton soit rouge sachant que le premier jeton tiré est noir ?`

            this.optionsChampTexte = { texteAvant: '<br> ' }

            this.correction = `Après avoir tiré un jeton noir, il reste ${jetons(a)} rouge${a === 1 ? '' : 's'} et ${jetons(b - 1)} noir${b - 1 === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
            this.correction += `La probabilité que le deuxième jeton soit rouge sachant que le premier est noir est : `
            this.correction += reponse.estIrreductible
              ? `$${miseEnEvidence(reponse.texFractionSimplifiee)}$.`
              : `$${reponse.texFraction}=${miseEnEvidence(reponse.texFractionSimplifiee)}$.`

            if (this.versionQcm) {
              this.distracteurs = distracteursValides(reponse, [
                new FractionEtendue(a, total),
                new FractionEtendue(a - 1, total - 1),
                new FractionEtendue(b, total - 1),
                new FractionEtendue(b - 1, total),
                new FractionEtendue(b, total),
                new FractionEtendue(a + 1, total),
              ])
            }
          }
        }
        break

      case 2:
      default:
        {
          // Formulation avec notation P_{R1}(R2), P_{R1}(\overline{R2}), etc.
          const choixNotation = choice([1, 2, 3, 4])

          this.question = `Une urne contient $${a}$ jetons rouges et $${b}$ jetons noirs.<br>`
          this.question += `On choisit au hasard un jeton, puis un deuxième ${texteGras('sans remettre')} le premier dans l'urne.<br>`
          this.question += `On note $R_1$ : «${sp()}le premier jeton tiré est rouge${sp()}» et $R_2$ : «${sp()}le deuxième jeton tiré est rouge${sp()}».<br>`

          // canEnonce AVANT d'ajouter "Calculer..." pour que cette ligne n'apparaisse pas dans canEnonce

          switch (choixNotation) {
            case 1:
              // P_{R1}(R2) : premier rouge, deuxième rouge
              reponse = new FractionEtendue(a - 1, total - 1)
              this.question += this.versionQcm
                ? ` $P_{R_1}(R_2)$ est égal à :`
                : this.interactif
                  ? ''
                  : `Calculer $P_{R_1}(R_2)$.`

              this.canReponseACompleter = '$P_{R_1}(R_2)=\\ldots$'

              this.correction = `$P_{R_1}(R_2)$ est la probabilité que le deuxième jeton soit rouge sachant que le premier est rouge.<br>`
              this.correction += `Après avoir tiré un jeton rouge, il reste ${jetons(a - 1)} rouge${a - 1 === 1 ? '' : 's'} et ${jetons(b)} noir${b === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
              this.correction += reponse.estIrreductible
                ? `$P_{R_1}(R_2) = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
                : `$P_{R_1}(R_2) = ${reponse.texFraction} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
              this.optionsChampTexte = { texteAvant: '<br>$P_{R_1}(R_2)=$' }

              if (this.versionQcm) {
                this.distracteurs = distracteursValides(reponse, [
                  new FractionEtendue(a, total),
                  new FractionEtendue(a, total - 1),
                  new FractionEtendue(b, total - 1),
                  new FractionEtendue(b, total),
                  new FractionEtendue(b - 1, total - 1),
                  new FractionEtendue(a - 1, total),
                ])
              }

              break
            case 2:
              // P_{R1}(\overline{R2}) : premier rouge, deuxième noir
              reponse = new FractionEtendue(b, total - 1)
              this.question += this.versionQcm
                ? ` $P_{R_1}(\\overline{R_2})$ est égal à :`
                : this.interactif
                  ? ''
                  : `Calculer $P_{R_1}(\\overline{R_2})$.`

              this.canReponseACompleter = '$P_{R_1}(\\overline{R_2})=\\ldots$'

              this.correction = `$P_{R_1}(\\overline{R_2})$ est la probabilité que le deuxième jeton soit noir sachant que le premier est rouge.<br>`
              this.correction += `Après avoir tiré un jeton rouge, il reste ${jetons(a - 1)} rouge${a - 1 === 1 ? '' : 's'} et ${jetons(b)} noir${b === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
              this.correction += reponse.estIrreductible
                ? `$P_{R_1}(\\overline{R_2}) = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
                : `$P_{R_1}(\\overline{R_2}) = ${reponse.texFraction} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
              this.optionsChampTexte = {
                texteAvant: '<br>$P_{R_1}(\\overline{R_2})=$',
              }

              if (this.versionQcm) {
                this.distracteurs = distracteursValides(reponse, [
                  new FractionEtendue(b, total),
                  new FractionEtendue(b - 1, total - 1),
                  new FractionEtendue(a, total - 1),
                  new FractionEtendue(a - 1, total),
                  new FractionEtendue(a, total),
                  new FractionEtendue(b + 1, total),
                ])
              }

              break
            case 3:
              // P_{\overline{R1}}(R2) : premier noir, deuxième rouge
              reponse = new FractionEtendue(a, total - 1)
              this.question += this.versionQcm
                ? ` $P_{\\overline{R_1}}(R_2)$ est égal à :`
                : this.interactif
                  ? ''
                  : `Calculer $P_{\\overline{R_1}}(R_2)$.`

              this.canReponseACompleter = '$P_{\\overline{R_1}}(R_2)=\\ldots$'

              this.correction = `$P_{\\overline{R_1}}(R_2)$ est la probabilité que le deuxième jeton soit rouge sachant que le premier est noir.<br>`
              this.correction += `Après avoir tiré un jeton noir, il reste ${jetons(a)} rouge${a === 1 ? '' : 's'} et ${jetons(b - 1)} noir${b - 1 === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
              this.correction += reponse.estIrreductible
                ? `$P_{\\overline{R_1}}(R_2) = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
                : `$P_{\\overline{R_1}}(R_2) = ${reponse.texFraction} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
              this.optionsChampTexte = {
                texteAvant: '<br>$P_{\\overline{R_1}}(R_2)=$',
              }

              if (this.versionQcm) {
                this.distracteurs = distracteursValides(reponse, [
                  new FractionEtendue(a, total),
                  new FractionEtendue(a - 1, total - 1),
                  new FractionEtendue(b, total - 1),
                  new FractionEtendue(b - 1, total),
                  new FractionEtendue(b, total),
                  new FractionEtendue(a + 1, total),
                ])
              }

              break
            case 4:
            default:
              // P_{\overline{R1}}(\overline{R2}) : premier noir, deuxième noir
              reponse = new FractionEtendue(b - 1, total - 1)
              this.question += this.versionQcm
                ? ` $P_{\\overline{R_1}}(\\overline{R_2})$ est égal à :`
                : this.interactif
                  ? ''
                  : `Calculer $P_{\\overline{R_1}}(\\overline{R_2})$.`

              this.canReponseACompleter =
                '$P_{\\overline{R_1}}(\\overline{R_2})=\\ldots$'

              this.correction = `$P_{\\overline{R_1}}(\\overline{R_2})$ est la probabilité que le deuxième jeton soit noir sachant que le premier est noir.<br>`
              this.correction += `Après avoir tiré un jeton noir, il reste ${jetons(a)} rouge${a === 1 ? '' : 's'} et ${jetons(b - 1)} noir${b - 1 === 1 ? '' : 's'}, soit $${total - 1}$ jetons au total.<br>`
              this.correction += reponse.estIrreductible
                ? `$P_{\\overline{R_1}}(\\overline{R_2}) = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
                : `$P_{\\overline{R_1}}(\\overline{R_2}) = ${reponse.texFraction} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$`
              this.optionsChampTexte = {
                texteAvant: '<br>$P_{\\overline{R_1}}(\\overline{R_2})=$',
              }

              if (this.versionQcm) {
                this.distracteurs = distracteursValides(reponse, [
                  new FractionEtendue(b, total),
                  new FractionEtendue(b, total - 1),
                  new FractionEtendue(a, total - 1),
                  new FractionEtendue(a - 1, total),
                  new FractionEtendue(a, total),
                  new FractionEtendue(b + 1, total),
                ])
              }

              break
          }
        }
        break
    }
    this.reponse = reponse.texFractionSimplifiee
    if (this.versionQcm) this.reponse = '$' + this.reponse + '$'
  }
}
