import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '1a751'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation produit nul'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ9CEns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    a: number,
    c: number,
    s1: number,
    s2: number,
  ): void {
    const b = -a * s1 // ax+b=0 ⟺ x=s1 donc b=-a·s1
    const d = -c * s2
    const f1 = `${rienSi1(a)}x${ecritureAlgebrique(b)}`
    const f2 = `${rienSi1(c)}x${ecritureAlgebrique(d)}`

    const sol = [s1, s2].sort((x, y) => x - y).join('\\,;\\,')
    const errOpp = [-b, -d].sort((x, y) => x - y).join('\\,;\\,') // opposé du terme constant
    const errSigne = [s1, -s2].sort((x, y) => x - y).join('\\,;\\,') // erreur de signe
    const errSomme = `${s1 + s2}` // l’élève additionne les solutions

    this.enonce = `L’ensemble $S$ des solutions de l’équation $(${f1})(${f2})=0$ est : `
    this.correction = `On reconnaît une équation produit nul.<br>
Un produit de facteurs est nul si, et seulement si, l’un au moins de ses facteurs est nul.<br>
$(${f1})(${f2})=0$ équivaut à $${f1}=0$ ou $${f2}=0$.<br>
$\\bullet$ $${f1}=0$ a pour solution $x=${s1}$ ;<br>
$\\bullet$ $${f2}=0$ a pour solution $x=${s2}$.<br>
L’ensemble des solutions est $${miseEnEvidence(`S=\\left\\{${sol}\\right\\}`)}$.`
    this.reponses = [
      `$S=\\left\\{${sol}\\right\\}$`,
      `$S=\\left\\{${errOpp}\\right\\}$`,
      `$S=\\left\\{${errSigne}\\right\\}$`,
      `$S=\\left\\{${errSomme}\\right\\}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // (2x+4)(-3x-9)=0, S={-3 ; -2}
    this.appliquerLesValeurs(2, -3, -2, -3)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      // |a|,|c| ≠ 1 pour que le distracteur « opposé du terme constant » reste faux
      const a = choice([2, 3, -2, -3])
      const c = choice([2, 3, -2, -3])
      const s1 = randint(-9, 9, 0) // solution du 1er facteur
      const s2 = randint(-9, 9, [0, s1, -s1]) // solution du 2e facteur
      this.appliquerLesValeurs(a, c, s1, s2)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^L’ensemble \$S\$ des solutions de (l’équation \$.*\$) est :\s*$/,
        (_, equation: string) => `Résoudre ${equation}.`,
      )
    // La bonne réponse du QCM est de la forme « $S=\left\{-3\,;\,-2\right\}$ » : on ne garde que l'ensemble
    this.reponseCourte = () =>
      `\\{${this.reponses[0]
        .replace(/^\$S=\\left\\\{/, '')
        .replace(/\\right\\\}\$$/, '')
        .replace(/\\,/g, '')}\\}`
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { ensembleDeNombres: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
    this.spacing = 1.5
  }
}
