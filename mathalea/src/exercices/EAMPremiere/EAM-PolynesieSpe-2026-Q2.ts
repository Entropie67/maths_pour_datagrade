import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'ps262'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation produit nul'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ2PolynesieSpe2026 extends ExerciceQcmACourt {
  /** Les deux solutions, d'après la bonne réponse du QCM (« $-\dfrac{4}{3}\text{ et }-1,5$ »). */
  private solutions(): string[] {
    return this.reponses[0].replace(/^\$|\$$/g, '').split('\\text{ et }')
  }

  private facteur(a: number, b: number): string {
    return `${rienSi1(a)}x${ecritureAlgebrique(b)}`
  }

  private quotientTex(numerateur: number, denominateur: number): string {
    return new FractionEtendue(numerateur, denominateur).simplifie()
      .texFractionSimplifiee
  }

  private appliquerLesValeurs(
    a1: number,
    b1: number,
    a2: number,
    b2: number,
  ): void {
    const r2 = -b2 / a2
    const racine1 = this.quotientTex(-b1, a1)
    const racine2 = texNombre(r2, 2)
    const sol = `${racine1}\\text{ et }${racine2}`
    const dist1 = `${racine1}\\text{ et }${texNombre(-r2, 2)}`
    const dist2 = `${this.quotientTex(a1, -b1)}\\text{ et }${this.quotientTex(a2, -b2)}`
    const dist3 = `${this.quotientTex(b1, a1)}\\text{ et }${texNombre(-r2, 2)}`

    this.enonce = `On considère l'équation $(${this.facteur(a1, b1)})(${this.facteur(a2, b2)})=0$.<br>
    Les solutions de cette équation sont :`

    this.reponses = [`$${sol}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]

    this.correction = `Un produit est nul si et seulement si au moins un de ses facteurs est nul.<br>
    $\\begin{aligned}
   & \\phantom{\\iff}${this.facteur(a1, b1)}=0 &&&&\\phantom{\\iff}${this.facteur(a2, b2)}=0 \\\\
    &\\iff ${rienSi1(a1)}x=${texNombre(-b1, 2)}&&&&\\iff ${rienSi1(a2)}x=${texNombre(-b2, 2)}\\\\
    &\\iff x=${racine1}&&&&\\iff x=${racine2}
    \\end{aligned}$<br>
    
    Les solutions sont donc $${miseEnEvidence(racine1)}\\text{ et }${miseEnEvidence(racine2)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-0.5, 3, -5, -4)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const premierFacteur = choice([
        { a: -0.5, b: 3 },
        { a: 0.5, b: 2 },
        { a: 1.5, b: -1 },
        { a: -1.5, b: -2 },
        { a: 2.5, b: -1 },
      ])
      const secondFacteur = choice([
        { a: -5, b: -4 },
        { a: 4, b: -6 },
        { a: -4, b: 3 },
        { a: 2, b: 3 },
        { a: 5, b: -6 },
      ])
      this.appliquerLesValeurs(
        premierFacteur.a,
        premierFacteur.b,
        secondFacteur.a,
        secondFacteur.b,
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Les solutions de cette équation sont :\s*$/,
        "Résoudre cette équation : donner l'ensemble $S$ des solutions.",
      )
    // La bonne réponse du QCM est de la forme « $-\dfrac{4}{3}\text{ et }-1,5$ » : on attend l'ensemble des solutions
    this.reponseCourte = () =>
      `\\{${this.solutions()
        .map((solution) => solution.replace(/(\d),(\d)/g, '$1.$2'))
        .join(';')}\\}`
    this.correctionCourte = () => {
      const correction = this.correction ?? ''
      return `${correction.slice(0, correction.lastIndexOf('Les solutions sont donc'))}L'ensemble des solutions est $S=${miseEnEvidence(`\\{${this.solutions().join('\\,;\\,')}\\}`)}$.`
    }
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { ensembleDeNombres: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
