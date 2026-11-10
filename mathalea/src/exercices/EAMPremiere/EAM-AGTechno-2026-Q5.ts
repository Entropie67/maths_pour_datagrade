import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '7ebc5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver la réciproque d'une fonction affine"
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ5AGt2026 extends ExerciceQcmACourt {
  private debutPhrase = ''
  private variable = 'x'
  private resultat = 'y'

  private appliquerLesValeurs(
    debutPhrase: string,
    a: number,
    b: number,
    variable: string,
    resultat: string,
    finPhrase: string,
  ): void {
    this.debutPhrase = debutPhrase
    this.variable = variable
    this.resultat = resultat
    this.texteAvantReponseCourte = `$${variable}=$`
    const sol = `\\dfrac{${resultat} ${ecritureAlgebrique(-b)}}{${texNombre(a, 1)}}`
    const dist1 = `\\dfrac{${resultat}}{${texNombre(a, 1)}} ${ecritureAlgebrique(-b)}`
    const dist2 = `\\dfrac{${resultat}  ${ecritureAlgebrique(-a)}}{${texNombre(b, 1)}}`
    const dist3 = `\\dfrac{${resultat}}{${texNombre(b, 1)}} ${ecritureAlgebrique(-a)}`
    this.enonce = `${debutPhrase}<br>
    ${finPhrase} est donc :<br>`

    this.correction = `On part de $${resultat}=${texNombre(a, 1)}${variable} ${ecritureAlgebrique(b)}$ et on isole $${variable}$ :<br>
    $${resultat}=${texNombre(a, 1)}${variable} ${ecritureAlgebrique(b)} \\Leftrightarrow ${resultat} ${ecritureAlgebrique(-b)}=${texNombre(a, 1)}${variable} \\Leftrightarrow \\dfrac{${resultat} ${ecritureAlgebrique(-b)}}{${texNombre(a, 1)}}=${variable}$<br>
    Donc $${variable} = ${miseEnEvidence(`\\dfrac{${resultat} ${ecritureAlgebrique(-b)}}{${texNombre(a, 1)}}`)}$.`

    this.reponses = [sol, dist1, dist2, dist3].map((x) => `$${x}$`)
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(
      'On considère la formule suivante permettant de transformer des degrés Celsius ($^\\circ \\text{C}$) en degrés Fahrenheit ($^\\circ \\text{F}$) : $F =1,8C +32$',
      1.8,
      32,
      'C',
      'F',
      'La formule permettant de transformer des degrés Fahrenheit ($^\\circ \\text{F}$) en degrés Celsius ($^\\circ \\text{C}$)',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const a = randint(5, 15)
      const b = randint(10, 50) * choice([-1, 1])

      const debutPhrase = `On considère la relation $y = ${a}x ${ecritureAlgebrique(b)}$`
      const finPhrase =
        'La formule qui permet de trouver $x$ en fonction de $y$ '
      const resultat = 'y'
      const variable = 'x'
      this.appliquerLesValeurs(debutPhrase, a, b, variable, resultat, finPhrase)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      `${this.debutPhrase}.<br>Exprimer $${this.variable}$ en fonction de $${this.resultat}$.`
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
