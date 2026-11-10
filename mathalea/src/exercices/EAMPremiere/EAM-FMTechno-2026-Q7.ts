import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '8e829'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Donner le nombre d'antécédents de $0$"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7FMt2026 extends ExerciceQcmACourt {
  // type 'deux' : f(x) = x(ax + b)        -> antécédents 0 et -b/a (produit nul)
  // type 'une'  : f(x) = ax ± (bx + c)    -> fonction affine, un seul antécédent
  // Distracteurs forçables (distA/B/C) pour reproduire la version officielle.
  private appliquerLesValeurs(
    type: 'deux' | 'une',
    a: number,
    b: number,
    c = 0,
    op: '+' | '-' = '+',
    distA?: string,
    distB?: string,
    distC?: string,
  ): void {
    let repCorrecte: string
    let dist1: string, dist2: string, dist3: string

    if (type === 'deux') {
      const r = -b / a // racine non nulle : ax + b = 0
      this.enonce = `On considère la fonction $f$ définie sur $\\R$ par $f(x) = x(${reduireAxPlusB(a, b)})$.<br>`
      this.enonce += `Le nombre $0$ admet :`

      this.correction = `Chercher les antécédents de $0$ revient à résoudre $f(x)=0$, soit $x(${reduireAxPlusB(a, b)})=0$.<br>`
      this.correction += `On reconnaît une équation produit nul : un produit est nul si et seulement si l'un de ses facteurs est nul. On a donc :<br>`
      this.correction += `$\\begin{aligned}
x = 0 \\quad &\\text{ou} \\quad ${reduireAxPlusB(a, b)} = 0\\\\
x = 0 \\quad &\\text{ou} \\quad ${a}x = ${-b}\\\\
x = 0 \\quad &\\text{ou} \\quad x = ${r}
\\end{aligned}$<br>`
      this.correction += `Le nombre $0$ admet donc deux antécédents : $${miseEnEvidence('0')}$ et $${miseEnEvidence(`${r}`)}$.`

      repCorrecte = `Deux antécédents : $0$ et $${r}$`
      dist1 = `Un seul antécédent : $0$`
      dist2 = `Un seul antécédent : $${r}$`
      dist3 = `Deux antécédents : $0$ et $${-r}$`
    } else {
      const signeTermeX = (coeff: number) =>
        coeff >= 0 ? `+ ${coeff}x` : `- ${Math.abs(coeff)}x`
      const signeConst = (val: number) =>
        val >= 0 ? `+ ${val}` : `- ${Math.abs(val)}`

      const A = op === '-' ? a - b : a + b
      const B = op === '-' ? -c : c
      const v = -B / A // unique antécédent
      const r = -c / b // racine de la parenthèse (piège produit nul)

      const expanded =
        op === '-'
          ? `${a}x ${signeTermeX(-b)} ${signeConst(-c)}`
          : `${a}x ${signeTermeX(b)} ${signeConst(c)}`
      const reduit = reduireAxPlusB(A, B)

      this.enonce = `On considère la fonction $f$ définie sur $\\R$ par $f(x) = ${a}x ${op} (${reduireAxPlusB(b, c)})$.<br>`
      this.enonce += `Le nombre $0$ admet :`

      this.correction = `Chercher les antécédents de $0$ revient à résoudre $f(x)=0$.<br>`
      this.correction += `Il s'agit d'une équation du premier degré (attention à ne pas confondre avec une équation produit nul).<br>`
      this.correction +=
        op === '-'
          ? `On supprime la parenthèse en distribuant le signe «&nbsp;$-$&nbsp;» : $f(x) = ${a}x ${op} (${reduireAxPlusB(b, c)}) = ${expanded} = ${reduit}$.<br>`
          : `On supprime la parenthèse : $f(x) = ${a}x ${op} (${reduireAxPlusB(b, c)}) = ${expanded} = ${reduit}$.<br>`
      this.correction += `On résout :<br>`
      this.correction += `$\\begin{aligned}
${reduit} &= 0\\\\
${A}x &= ${-B}\\\\
x &= ${v}
\\end{aligned}$<br>`
      this.correction += `Le nombre $0$ admet donc un seul antécédent : $${miseEnEvidence(`${v}`)}$.`

      repCorrecte = `Un seul antécédent : $${v}$`
      dist1 = `Deux antécédents : $0$ et $${r}$` // piège : annuler chaque terme comme un produit
      dist2 = `Un seul antécédent : $${-v}$` // oubli de distribuer le « − » / erreur de signe
      dist3 = `Deux antécédents : $0$ et $${v}$` // racine 0 parasite
    }

    if (distA && distB && distC) {
      dist1 = distA
      dist2 = distB
      dist3 = distC
    }

    this.reponses = [repCorrecte, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : f(x) = x(3x - 6) ; antécédents de 0 => 0 et 2
    this.appliquerLesValeurs(
      'deux',
      3,
      -6,
      0,
      '+',
      `Un seul antécédent : $0$`,
      `Un seul antécédent : $-18$`,
      `Deux antécédents : $0$ et $-2$`,
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Famille produit : [a, b] avec a | b, b ≠ 0
    const donneesDeux: [number, number][] = [
      [3, -6],
      [2, -6],
      [2, 4],
      [3, 6],
      [2, -8],
      [4, -8],
      [3, -9],
      [2, 6],
      [4, 8],
      [2, -4],
    ]

    // Famille affine : [a, b, c, op]  ->  f(x) = ax op (bx + c)
    const donneesUne: [number, number, number, '+' | '-'][] = [
      [4, 2, 4, '-'], // 4x-(2x+4)=2x-4  -> 2
      [4, 2, 6, '-'], // 2x-6 -> 3
      [4, 2, 8, '-'], // 2x-8 -> 4
      [6, 3, 3, '-'], // 3x-3 -> 1
      [6, 3, 6, '-'], // 3x-6 -> 2
      [5, 2, 6, '-'], // 3x-6 -> 2
      [2, 2, 4, '+'], // 4x+4 -> -1
      [2, 2, 8, '+'], // 4x+8 -> -2
      [3, 3, 6, '+'], // 6x+6 -> -1
      [3, 2, 10, '+'], // 5x+10 -> -2
    ]

    let compteur = 0
    do {
      if (choice([true, false])) {
        const [a, b] = choice(donneesDeux)
        this.appliquerLesValeurs('deux', a, b)
      } else {
        const [a, b, c, op] = choice(donneesUne)
        this.appliquerLesValeurs('une', a, b, c, op)
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le nombre \$0\$ admet :\s*$/,
        "Donner l'ensemble $S$ des antécédents de $0$ par $f$.",
      )
    // La bonne réponse du QCM est de la forme « Deux antécédents : $0$ et $-2$ » : on attend l'ensemble
    this.reponseCourte = () =>
      `\\{${[...this.reponses[0].matchAll(/\$([^$]*)\$/g)].map((valeur) => valeur[1]).join(';')}\\}`
    this.correctionCourte = () => {
      const correction = this.correction ?? ''
      const fin = correction.indexOf('Le nombre $0$ admet donc')
      return `${correction.slice(0, fin)}L'ensemble des antécédents de $0$ est $S=${miseEnEvidence(this.reponseCourte?.() ?? '')}$.`
    }
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { ensembleDeNombres: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
