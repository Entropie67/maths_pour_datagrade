import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'
export const dateDePublication = '10/08/2025'
export const dateDeModifImportante = '31/10/2026'
export const uuid = '3bd46'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Reconnaître une suite arithmétique/géométrique donnée sous forme explicite (QCM)'
export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const a = -2
    const b = 3
    this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${reduireAxPlusB(a, b, 'n', { ordreInverse: true })}$.`
    this.correction = `Soit $n\\in \\mathbb{N}$. On sait que la forme explicite d'une suite arithmétique $(u_n)$, de premier terme $u_0\\in \\mathbb{R}$ et de raison $r\\in \\mathbb{R}$<br>
     est sous la forme${sp()}: $u_n=u_0+n\\times r$.<br>
Avec $u_0=${b}$ et $r=${a}$, on a bien $u_n=${reduireAxPlusB(a, b, 'n')}$.<br>
$${miseEnEvidence(`(u_n)`)}$ ${texteEnCouleur(`est donc une suite arithmétique de raison $${a}$`)}. `
    this.reponses = [
      `$(u_n)$ est une suite arithmétique de raison $${a}$.`,
      `$(u_n)$ est une suite arithmétique de raison $${b}$.`,
      `$(u_n)$ est une suite géométrique de raison $${a}$.`,
      `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
    ]
  }

  versionAleatoire = () => {
    const cas = randint(1, 6)
    if (cas === 1) {
      const a = randint(-5, 5, [0, 1])
      const b = randint(-5, 5, [-1, 0, 1, a])

      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${reduireAxPlusB(a, b, 'n')}$.`
      this.correction = `Soit $n\\in \\mathbb{N}$. On sait que la forme explicite d'une suite arithmétique $(u_n)$, de premier terme $u_0\\in \\mathbb{R}$ et de raison $r\\in \\mathbb{R}$<br>
       est sous la forme${sp()}: $u_n=u_0+n\\times r$.<br>
Avec $u_0=${b}$ et $r=${a}$, on a bien $u_n=${reduireAxPlusB(a, b, 'n')}$.<br>
$${miseEnEvidence(`(u_n)`)}$ ${texteEnCouleur(`est donc une suite arithmétique de raison $${a}$`)}. `

      this.reponses = [
        `$(u_n)$ est une suite arithmétique de raison $${a}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${b}$.`,
        `$(u_n)$ est une suite géométrique de raison $${a}$.`,
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
      ]
    } else if (cas === 2) {
      const a = randint(-5, 5, [0, 1])
      const b = randint(-5, 5, [-1, 0, 1, a])

      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${a}\\times ${ecritureParentheseSiNegatif(b)}^n$.`
      this.correction = `Soit $n\\in \\mathbb{N}$. On sait que la forme explicite d'une suite géométrique $(u_n)$, de premier terme $u_0\\in \\mathbb{R}$ et de raison $q\\in \\mathbb{R}$<br>
       est sous la forme${sp()}: $u_n=u_0\\times q^n$.<br>
Avec $u_0=${a}$ et $q=${b}$, on a bien $u_n=${a}\\times ${ecritureParentheseSiNegatif(b)}^n$.<br>
$${miseEnEvidence(`(u_n)`)}$ ${texteEnCouleur(`est donc une suite géométrique de raison ${b}`)}. `

      this.reponses = [
        `$(u_n)$ est une suite géométrique de raison $${b}$`,
        `$(u_n)$ est une suite arithmétique de raison $${b}$`,
        `$(u_n)$ est une suite géométrique de raison $${a}$`,
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique`,
      ]
    } else if (cas === 3) {
      const a = randint(-5, 5, [0, 1, -1])
      const b = randint(-5, 5, [-1, 0, 1, a, -a])
      const fraction1 = new FractionEtendue(a + b, a + 1)
      const fraction2 = new FractionEtendue(a + b * b, a + b)
      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${a}+ ${ecritureParentheseSiNegatif(b)}^n$.`
      this.correction = `Soit $n\\in \\mathbb{N}$.<br>
    On calcule les premiers termes pour savoir si la suite peut être arithmétique ou géométrique${sp()}: <br>
    $u_0=${a}+ ${ecritureParentheseSiNegatif(b)}^0=${a}+1=${a + 1}.$<br>
    $u_1=${a}+ ${ecritureParentheseSiNegatif(b)}^1=${a}+${ecritureParentheseSiNegatif(b)}=${a + b}.$<br>
    $u_2=${a}+ ${ecritureParentheseSiNegatif(b)}^2=${a}+${ecritureParentheseSiNegatif(b)}^2=${a + b * b}.$<br>
    On observe que $u_2-u_1=${a + b * b}${ecritureAlgebrique(-a - b)}=${b * b - b}$.<br>
    et $u_1-u_0=${a + b}${ecritureAlgebrique(-a - 1)}=${b - 1}$. <br>
   Comme $u_2-u_1\\neq u_1-u_0$, on en déduit que la suite n'est pas arithmétique.<br>
   De même, on compare les quotients des termes consécutifs${sp()}: <br>
   $\\dfrac{u_1}{u_0} = \\dfrac{${a + b}}{${a + 1}}$`
      if (!fraction1.estIrreductible) {
        this.correction += ` =$${fraction1.texFractionSimplifiee}$`
      }
      this.correction += ` et $\\dfrac{u_2}{u_1} = \\dfrac{${a + b * b}}{${a + b}}$`
      if (!fraction2.estIrreductible) {
        this.correction += ` =$${fraction2.texFractionSimplifiee}$`
      }
      this.correction += `<br>On observe que la suite n'est pas géométrique. <br>
    $${miseEnEvidence('(u_n)')}$ ${texteEnCouleur('est donc une suite ni arithmétique, ni géométrique')}. `
      this.reponses = [
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
        `$(u_n)$ est une suite géométrique de raison $${b}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${b}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${a}$.`,
      ]
    }
    if (cas === 4) {
      const a = randint(-5, 5, [0, 1])
      const b = randint(-5, 5, [-1, 0, 1, a])
      const c = randint(-5, 5, [-1, 0, 1, a, -a, -a * b])
      const fraction1 = new FractionEtendue(a * b + c, a + c)
      const fraction2 = new FractionEtendue(a * b * b + c, a * b + c)
      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${a}\\times ${ecritureParentheseSiNegatif(b)}^n${ecritureAlgebrique(c)}$.`
      this.correction = `Soit $n\\in \\mathbb{N}$.<br>
    On calcule les premiers termes pour savoir si la suite peut être arithmétique ou géométrique${sp()}: <br>
    $u_0=${a}\\times ${ecritureParentheseSiNegatif(b)}^0${ecritureAlgebrique(c)}=${a}\\times 1${ecritureAlgebrique(c)}=${a + c}.$<br>
    $u_1=${a}\\times ${ecritureParentheseSiNegatif(b)}^1${ecritureAlgebrique(c)}=${a}\\times ${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(c)}=${a * b + c}.$<br>
    $u_2=${a}\\times ${ecritureParentheseSiNegatif(b)}^2${ecritureAlgebrique(c)}=${a}\\times ${ecritureParentheseSiNegatif(b * b)}${ecritureAlgebrique(c)}=${a * b * b + c}.$<br>
    On observe que $u_2-u_1=${a * b * b + c}${ecritureAlgebrique(-a * b - c)}=${a * b * b - a * b}$.<br>
    et $u_1-u_0=${a * b + c}${ecritureAlgebrique(-a - c)}=${a * b - a}$. <br>
   Comme $u_2-u_1\\neq u_1-u_0$, on en déduit que la suite n'est pas arithmétique.<br>
   De même, on compare les quotients des termes consécutifs${sp()}: <br>
   $\\dfrac{u_1}{u_0} = \\dfrac{${a * b + c}}{${a + c}}$`
      if (!fraction1.estIrreductible) {
        this.correction += ` =$${fraction1.texFractionSimplifiee}$`
      }
      this.correction += ` et $\\dfrac{u_2}{u_1} = \\dfrac{${a * b * b + c}}{${a * b + c}}$`
      if (!fraction2.estIrreductible) {
        this.correction += ` =$${fraction2.texFractionSimplifiee}$`
      }
      this.correction += `<br>On observe que la suite n'est pas géométrique. <br>
    $${miseEnEvidence('(u_n)')}$ ${texteEnCouleur('est donc une suite ni arithmétique, ni géométrique')}. `

      this.reponses = [
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
        `$(u_n)$ est une suite géométrique de raison $${a}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${c}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${c}$ et géométrique de raison $${b}$.`,
      ]
    } else if (cas === 5) {
      const a = randint(-5, 5, [-1, 0, 1])
      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${a}n$.`
      this.correction = `Soit $n\\in \\mathbb{N}$. On sait que la forme explicite d'une suite arithmétique $(u_n)$, de premier terme $u_0\\in \\mathbb{R}$ et de raison $r\\in \\mathbb{R}$<br>
       est sous la forme${sp()}: $u_n=u_0+n\\times r$.<br>
Avec $u_0=0$ et $r=${a}$, on a bien $u_n=${reduireAxPlusB(a, 0, 'n')}$.<br>
$${miseEnEvidence(`(u_n)`)}$ ${texteEnCouleur(`est donc une suite arithmétique de raison $${a}$`)}. `

      this.reponses = [
        `$(u_n)$ est une suite arithmétique de raison $${a}$.`,
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
        `$(u_n)$ est une suite géométrique de raison $${a}$.`,
        `$(u_n)$ est une suite arithmétique et géométrique de raison $${a}$.`,
      ]
    } else if (cas === 6) {
      const a = randint(-5, 5, [0, 1])
      const b = randint(-5, 5, [-1, 0, 1, a, -2, -a])
      const fraction1 = new FractionEtendue(a + b, b)
      const fraction2 = new FractionEtendue(4 * a + b, a + b)
      this.enonce = `Soit $(u_n)$ la suite définie pour tout entier $n$ par $u_n=${rienSi1(a)}n^2${ecritureAlgebrique(b)}$.`
      this.correction = `Soit $n\\in \\mathbb{N}$.<br>
    On calcule les premiers termes pour savoir si la suite peut être arithmétique ou géométrique${sp()}: <br>
    $u_0=${a}\\times 0^2${ecritureAlgebrique(b)}=${b}$<br>
    $u_1=${a}\\times 1^2${ecritureAlgebrique(b)}=${a}${ecritureAlgebrique(b)}=${a + b}$<br>
    $u_2=${a}\\times 2^2${ecritureAlgebrique(b)}=${a}\\times 4${ecritureAlgebrique(b)}=${4 * a + b}.$<br>
    On observe que $u_2-u_1=${4 * a + b}${ecritureAlgebrique(-a - b)}=${3 * a}.$<br>
    et $u_1-u_0=${a + b}${ecritureAlgebrique(-b)}=${a}$. <br>
   Comme $u_2-u_1\\neq u_1-u_0$, on en déduit que la suite n'est pas arithmétique.<br>
   De même, on compare les quotients des termes consécutifs${sp()}: <br>
   $\\dfrac{u_1}{u_0} = \\dfrac{${a + b}}{${b}}$`
      if (!fraction1.estIrreductible) {
        this.correction += `$ =${fraction1.texFractionSimplifiee}$`
      }
      this.correction += ` et $\\dfrac{u_2}{u_1} = \\dfrac{${4 * a + b}}{${a + b}}$`
      if (!fraction2.estIrreductible) {
        this.correction += ` $=${fraction2.texFractionSimplifiee}$`
      }
      this.correction += `<br>On observe que la suite n'est pas géométrique. <br>
    $${miseEnEvidence('(u_n)')}$ ${texteEnCouleur('est donc une suite ni arithmétique, ni géométrique')}. `

      this.reponses = [
        `$(u_n)$ n'est ni une suite arithmétique, ni une suite géométrique.`,
        `$(u_n)$ est une suite arithmétique de raison $${a}$.`,
        `$(u_n)$ est une suite géométrique de raison $${a}$.`,
        `$(u_n)$ est une suite arithmétique de raison $${b}$.`,
      ]
    }
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
