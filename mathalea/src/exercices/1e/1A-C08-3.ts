import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '151f4'
export const refs = {
  'fr-fr': ['1A-C08-3', '2A-C1-1'],
  'fr-ch': ['10LCQCMFA4-2', '10LSQCMFA4-2', '11CTQCMFA4-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul littéral élémentaire'
export const dateDePublication = '15/02/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC8c extends ExerciceQcmA {
  private genererExercice(numCas: number): void {
    switch (numCas) {
      case 1:
        {
          //  Simplification de -1 × a (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $-1 \\times ${p}$ est :`
          this.correction = `$-1 \\times ${p} = ${miseEnEvidence(`-${p}`)}$`
          this.reponses = [`$-${p}$`, `$${p}$`, '$1$', '$-1$']
        }
        break

      case 2:
        {
          //  Simplification de -(x - y) (2 lettres)
          const [p, q] = choice([
            ['a', 'b'],
            ['x', 'y'],
            ['u', 'v'],
          ])

          this.enonce = ` $-(${p}-${q})$ est égal à :`
          this.correction = `En distribuant le signe $-$ (c'est-à-dire $-1$) devant la parenthèse, on change le signe de chaque terme.<br>
$-(${p}-${q}) = -${p} + ${q} = ${miseEnEvidence(`${q}-${p}`)}$`
          this.reponses = [
            `$${q}-${p}$`,
            `$-${q}+${p}$`,
            `$${p}-${q}$`,
            `$${p}-(-${q})$`,
          ]
        }
        break

      case 3:
        {
          //  Simplification de x/1 (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $\\dfrac{${p}}{1}$ est :`
          this.correction = `Tout nombre divisé par $1$ est égal à lui-même.<br>
$\\dfrac{${p}}{1} = ${miseEnEvidence(`${p}`)}$`
          this.reponses = [`$${p}$`, '$1$', `$\\dfrac{1}{${p}}$`, `$-${p}$`]
        }
        break

      case 4:
        {
          //  Que vaut 0 × a ? (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Que vaut $0 \\times ${p}$ ?`
          this.correction = `Tout nombre multiplié par $0$ est égal à $0$.<br>
$0 \\times ${p} = ${miseEnEvidence('0')}$`
          this.reponses = ['$0$', `$${p}$`, '$1$', `$-${p}$`]
        }
        break

      case 5:
        {
          //  Développer et simplifier -(ax - by) (2 lettres, coefficients aléatoires)
          const [p, q] = choice([
            ['a', 'b'],
            ['x', 'y'],
            ['u', 'v'],
          ])
          const c1 = randint(2, 9)
          const c2 = randint(2, 9, [c1])

          this.enonce = `Une forme développée et simplifiée de $-(${c1}${p}-${c2}${q})$ est :`
          this.correction = `En distribuant $-1$, on obtient :<br>
$-(${c1}${p}-${c2}${q}) = ${miseEnEvidence(`-${c1}${p}+${c2}${q}`)}$`
          this.reponses = [
            `$-${c1}${p}+${c2}${q}$`,
            `$-${c1}${p}-${c2}${q}$`,
            `$${c1}${p}-${c2}${q}$`,
            `$${c1}${p}+${c2}${q}$`,
          ]
        }
        break

      case 6:
        {
          // Simplification de 1/(1/a) (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $\\dfrac{1}{\\dfrac{1}{${p}}}$ avec $${p}\\neq 0$ est :`
          this.correction = `Diviser par une fraction, c'est multiplier par son inverse.<br>
$\\dfrac{1}{\\dfrac{1}{${p}}} = 1 \\times \\dfrac{${p}}{1} = ${miseEnEvidence(`${p}`)}$`
          this.reponses = [
            `$${p}$`,
            `$\\dfrac{1}{${p}^2}$`,
            `$\\dfrac{1}{${p}}$`,
            `$-${p}$`,
          ]
        }
        break

      case 7:
        {
          // Que vaut (a/b) × (b/c) ? (3 lettres)
          const [p, q, r] = choice([
            ['a', 'b', 'c'],
            ['x', 'y', 'z'],
            ['m', 'n', 'p'],
          ])

          this.enonce = `Que vaut $\\dfrac{${p}}{${q}} \\times \\dfrac{${q}}{${r}}$ avec $${q}\\neq 0$, $${r}\\neq 0$ et $${p}\\neq 0$ ?`
          this.correction = `$\\dfrac{${p}}{${q}} \\times \\dfrac{${q}}{${r}} = \\dfrac{${p} \\times ${q}}{${q} \\times ${r}}$<br>
On simplifie par $${q}$ au numérateur et au dénominateur : $${miseEnEvidence(`\\dfrac{${p}}{${r}}`)}$`
          this.reponses = [
            `$\\dfrac{${p}}{${r}}$`,
            `$\\dfrac{${q}}{${p}}$`,
            `$\\dfrac{${r}}{${p}}$`,
            `$\\dfrac{${r}}{${q}}$`,
          ]
        }
        break

      case 8:
        {
          //  Quelle expression est équivalente à (a×b)/c ? (3 lettres)
          const [p, q, r] = choice([
            ['a', 'b', 'c'],
            ['x', 'y', 'z'],
            ['m', 'n', 'p'],
          ])
          const choix = choice([true, false])
          this.enonce = `Quelle expression est équivalente à $\\dfrac{${p}\\times ${q}}{${r}}$ avec $${r}\\neq 0$ ?`
          this.correction = `$\\dfrac{${p} \\times ${q}}{${r}} = ${miseEnEvidence(choix ? `\\dfrac{${p}}{${r}} \\times ${q}` : `\\dfrac{${q}}{${r}} \\times ${p}`)}$`
          this.reponses = [
            choix
              ? `$\\dfrac{${p}}{${r}} \\times ${q}$`
              : `$\\dfrac{${q}}{${r}} \\times ${p}$`,
            `$\\dfrac{${p}}{${q}} \\times ${r}$`,
            `$${r} \\times \\dfrac{${q}}{${p}}$`,
            `$${r} \\times \\dfrac{${p}}{${q}}$`,
          ]
        }
        break

      case 9:
        {
          //  Que vaut (a/b) ÷ (c/d) ? (4 lettres)
          const [p, q, r, s] = choice([
            ['a', 'b', 'c', 'd'],
            ['x', 'y', 'z', 't'],
            ['e', 'f', 'g', 'h'],
          ])

          this.enonce = `Que vaut $\\dfrac{${p}}{${q}} \\div \\dfrac{${r}}{${s}}$ avec $${q}\\neq 0$ et $${s}\\neq 0$ ?`
          this.correction = `Diviser par une fraction, c'est multiplier par son inverse.<br>
$\\dfrac{${p}}{${q}} \\div \\dfrac{${r}}{${s}} = \\dfrac{${p}}{${q}} \\times \\dfrac{${s}}{${r}} = ${miseEnEvidence(`\\dfrac{${p}${s}}{${q}${r}}`)}$`
          this.reponses = [
            `$\\dfrac{${p}${s}}{${q}${r}}$`,
            `$\\dfrac{${p}${r}}{${q}${s}}$`,
            `$\\dfrac{${q}${r}}{${p}${s}}$`,
            `$\\dfrac{${p}${q}}{${r}${s}}$`,
          ]
        }
        break
      case 10:
        {
          const p = choice(['x', 'y', 'z'])
          const positif = choice([true, false])
          const signe = positif ? 'positif' : 'négatif'

          this.enonce = `On considère un nombre relatif $${p}$ tel que $-${p}$ est strictement ${signe}.`
          this.correction = positif
            ? `Si $-${p}$ est strictement positif, alors $-${p} > 0$.<br>
En multipliant les deux membres par $-1$ (ce qui change le sens de l'inégalité), on obtient $${p} < 0$.<br>
Donc ${texteEnCouleurEtGras(`${p} est négatif`)}.`
            : `Si $-${p}$ est strictement négatif, alors $-${p} < 0$.<br>
En multipliant les deux membres par $-1$ (ce qui change le sens de l'inégalité), on obtient $${p} > 0$.<br>
Donc ${texteEnCouleurEtGras(`${p} est positif`)}.`
          this.reponses = positif
            ? [
                `$${p}$ est négatif`,
                `$${p}$ est positif`,
                `$${p}$ est égal à $0$`,
                `on ne peut rien dire sur le signe de $${p}$`,
              ]
            : [
                `$${p}$ est positif`,
                `$${p}$ est négatif`,
                `$${p}$ est égal à $0$`,
                `on ne peut rien dire sur le signe de $${p}$`,
              ]
        }
        break

      case 11:
        {
          // a et b sont deux nombres opposés, donc ...
          const [p, q] = choice([
            ['a', 'b'],
            ['x', 'y'],
            ['u', 'v'],
          ])

          this.enonce = `$${p}$ et $${q}$ sont deux nombres opposés. Quelle égalité est vraie ?`
          this.correction = `Deux nombres opposés ont pour somme $0$.<br>
Deux nombres sont opposés lorsque leur somme est nulle.<br>
La bonne réponse est : $${miseEnEvidence(`${p}+${q}=0`)}$.`
          this.reponses = [
            `$${p}+${q}=0$`,
            `$${p}-${q}=0$`,
            `$${p}=${q}$`,
            `$${p}\\times ${q}=1$`,
          ]
        }
        break

      case 12:
        {
          // Simplification de a × 1 (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $${p} \\times 1$ est :`
          this.correction = `Tout nombre multiplié par $1$ est égal à lui-même.<br>
$${p} \\times 1 = ${miseEnEvidence(`${p}`)}$`
          this.reponses = [`$${p}$`, '$1$', `$-${p}$`, '$0$']
        }
        break

      case 13:
        {
          // Simplification de a × a (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $${p} \\times ${p}$ (avec $${p}\\neq 0$) est :`
          this.correction = `Le produit d'un nombre par lui-même est son carré.<br>
$${p} \\times ${p} = ${miseEnEvidence(`${p}^2`)}$`
          this.reponses = [`$${p}^2$`, `$2${p}$`, `$2${p}^2$`, `$${p}$`]
        }
        break

      case 14:
        {
          // Simplification de a/a (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $\\dfrac{${p}}{${p}}$ (avec $${p}\\neq 0$) est :`
          this.correction = `Tout nombre non nul divisé par lui-même est égal à $1$.<br>
$\\dfrac{${p}}{${p}} = ${miseEnEvidence('1')}$`
          this.reponses = ['$1$', `$${p}$`, '$0$', `$${p}^2$`]
        }
        break

      case 15:
        {
          // Simplification de 0/a (1 lettre)
          const [p] = choice([['a'], ['b'], ['x'], ['y']])

          this.enonce = `Une simplification de $\\dfrac{0}{${p}}$ (avec $${p}\\neq 0$) est :`
          this.correction = `$0$ divisé par n'importe quel nombre non nul est égal à $0$.<br>
$\\dfrac{0}{${p}} = ${miseEnEvidence('0')}$`
          this.reponses = ['$0$', `$${p}$`, '$1$', `$\\dfrac{1}{${p}}$`]
        }
        break

      case 16:
      default:
        {
          // Que vaut (a+b)/c ? (3 lettres)
          const [p, q, r] = choice([
            ['a', 'b', 'c'],
            ['x', 'y', 'z'],
            ['m', 'n', 'p'],
          ])

          this.enonce = `Quelle est l'écriture correcte de $\\dfrac{${p}+${q}}{${r}}$ avec $${r}\\neq 0$ ?`
          this.correction = `On peut séparer le numérateur d'une somme sur un même dénominateur :<br>
$\\dfrac{${p}+${q}}{${r}} = ${miseEnEvidence(`\\dfrac{${p}}{${r}}+\\dfrac{${q}}{${r}}`)}$`
          this.reponses = [
            `$\\dfrac{${p}}{${r}}+\\dfrac{${q}}{${r}}$`,
            `$\\dfrac{${p}}{${r}}+${q}$`,
            `$${p}+\\dfrac{${q}}{${r}}$`,
            `$\\dfrac{${p}+${q}}{${r}^2}$`,
          ]
        }
        break
    }
  }

  versionOriginale: () => void = () => {
    this.genererExercice(2)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      this.genererExercice(randint(1, 16))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
