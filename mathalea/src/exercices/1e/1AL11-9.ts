import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer une somme de termes'
export const interactifReady = true

export const dateDePublication = '28/12/2022'

/**
 * Calculer une somme du type S = 3 + 5 + 7 + ... + 29 (suite arithmétique)
 * ou S = 3 + 6 + 12 + ... + 192 (suite géométrique, sans calculatrice)
 * @author Rémi Angot
 * @author Stéphane Guyon (cas géométrique sans calculatrice, paramètre « Type de suite », corrections détaillées avec démonstration puis formule du cours)
 */
export const uuid = '8ed19'

export const refs = {
  'fr-fr': ['1AL11-9'],
  'fr-ch': [],
}
export default class SommeSuite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>$S=$' }
    // Par défaut : suite arithmétique (comportement historique, tirages inchangés)
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de suite',
      3,
      '1 : Arithmétique\n2 : Géométrique\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    const typeDeSuite = this.sup === 3 ? choice([1, 2]) : this.sup
    if (typeDeSuite === 2) {
      this.nouvelleVersionGeometrique()
    } else {
      this.nouvelleVersionArithmetique()
    }
  }

  /**
   * Somme de termes d'une suite géométrique de raison 2, 3, -2 ou 1/2,
   * avec peu de termes pour rester faisable sans calculatrice.
   */
  nouvelleVersionGeometrique() {
    const cas = choice(['2', '3', '-2', '1/2'])
    const nbTermes = cas === '3' ? randint(6, 7) : randint(6, 9)
    const n = nbTermes - 1
    const u0 =
      cas === '3'
        ? randint(1, 2)
        : cas === '1/2'
          ? randint(1, 3) * 2 ** n // tous les termes restent entiers
          : randint(1, 3)
    const q = cas === '1/2' ? 0.5 : Number(cas)
    const termes: number[] = []
    for (let k = 0; k < nbTermes; k++) termes.push(u0 * q ** k)
    const somme = termes.reduce((a, b) => a + b, 0)
    const debut = termes
      .slice(0, 4)
      .map((t, k) => (k === 0 ? texNombre(t) : ecritureAlgebrique(t)))
      .join('')
    this.question = `Calculer $S = ${debut}+\\ldots${ecritureAlgebrique(termes[n])}$.`
    this.reponse = somme
    const qTex = cas === '1/2' ? '\\dfrac{1}{2}' : cas
    const qPar = q < 0 ? `(${cas})` : cas
    const calcul =
      cas === '1/2'
        ? `\\begin{aligned}S&=${texNombre(u0)}\\times\\dfrac{1-\\left(\\dfrac{1}{2}\\right)^{${nbTermes}}}{1-\\dfrac{1}{2}}\\\\&=${texNombre(2 * u0)}\\times\\left(1-\\dfrac{1}{${2 ** nbTermes}}\\right)\\\\&=${texNombre(2 * u0)}-\\dfrac{${texNombre(2 * u0)}}{${2 ** nbTermes}}\\\\&=${texNombre(2 * u0)}-${u0 / 2 ** n}\\\\&=${miseEnEvidence(texNombre(somme))}\\end{aligned}`
        : `\\begin{aligned}S&=${u0 === 1 ? '' : `${u0}\\times`}\\dfrac{1-${qPar}^{${nbTermes}}}{1-${qPar}}\\\\&=${u0 === 1 ? '' : `${u0}\\times`}\\dfrac{${texNombre(1 - q ** nbTermes)}}{${1 - q}}${u0 === 1 ? '' : `\\\\&=${u0}\\times ${texNombre((1 - q ** nbTermes) / (1 - q))}`}\\\\&=${miseEnEvidence(texNombre(somme))}\\end{aligned}`
    this.correction = `On reconnaît la somme $u_0+u_1+\\ldots+u_{${n}}$ des $${nbTermes}$ premiers termes d'une suite géométrique de premier terme $u_0=${texNombre(u0)}$ et de raison $q=${qTex}$.`
    this.correction += `<br><br>${texteGras('Méthode 1 : on refait la démonstration')}`
    const qAff = cas === '1/2' ? '\\left(\\dfrac{1}{2}\\right)' : qPar
    const puissances = [
      `1`,
      qAff,
      ...Array.from({ length: n - 1 }, (_, k) => `${qAff}^{${k + 2}}`),
    ]
    const debutPuissances = `${puissances[0]}+${puissances[1]}+${puissances[2]}+\\ldots+${puissances[n]}`
    if (u0 === 1) {
      // Premier terme égal à 1 : pas de factorisation, la somme est directe
      this.correction += `<br>Le premier terme vaut $1$ et chaque terme se déduit du précédent en multipliant par $${qTex}$ :`
      this.correction += `<br>$S=${debutPuissances}$`
      this.correction += `<br>On reconnaît directement la somme $1+q+q^2+\\ldots+q^{${n}}$ avec $q=${qTex}$, pour laquelle on sait que, pour $q\\neq 1$ :`
    } else {
      this.correction += `<br>Chaque terme se déduit du précédent en multipliant par $${qTex}$ : on peut donc factoriser par le premier terme $${texNombre(u0)}$.`
      this.correction += `<br>$\\begin{aligned}S&=${texNombre(u0)}+${texNombre(u0)}\\times ${qAff}+${texNombre(u0)}\\times ${qAff}^{2}+\\ldots+${texNombre(u0)}\\times ${qAff}^{${n}}\\\\&=${texNombre(u0)}\\times\\left(${debutPuissances}\\right)\\end{aligned}$`
      this.correction += `<br>On fait ainsi apparaître la somme $1+q+q^2+\\ldots+q^{${n}}$ avec $q=${qTex}$, pour laquelle on sait que, pour $q\\neq 1$ :`
    }
    this.correction += `<br>$1+q+q^2+\\ldots+q^{n}=\\dfrac{1-q^{n+1}}{1-q}$.`
    this.correction += `<br>Ici $n=${n}$, donc $n+1=${nbTermes}$, et on conclut :`
    this.correction += `<br>$${calcul}$`
    this.correction += `<br><br>${texteGras('Méthode 2 : on applique la formule du cours')}`
    this.correction += `<br>La somme de termes consécutifs d'une suite géométrique de raison $q\\neq 1$ est égale au premier terme multiplié par $\\dfrac{1-q^{\\text{nombre de termes}}}{1-q}$.`
    this.correction += `<br>Avec des lettres : $u_0+u_1+\\ldots+u_n=u_0\\times\\dfrac{1-q^{n+1}}{1-q}$.`
    this.correction += `<br>Ici, $u_0=${texNombre(u0)}$, $q=${qTex}$ et $n+1=${nbTermes}$ :`
    this.correction += `<br>$${calcul}$`
  }

  nouvelleVersionArithmetique() {
    const u0 = randint(2, 10)
    const r = randint(2, 8)
    const n = randint(12, 30)
    this.question = `Calculer $S = ${u0} + ${u0 + r} + ${u0 + 2 * r} + ${u0 + 3 * r} + \\ldots + ${u0 + n * r}$.`
    this.reponse = ((n + 1) * (u0 + u0 + n * r)) / 2
    this.correction = `$\\begin{aligned}S&=${u0} + (${u0} + ${r}) + (${u0} + 2 \\times ${r}) + (${u0} + 3 \\times ${r}) + \\ldots + (${u0} + ${n} \\times ${r})\\\\&=(\\underbrace{${u0} + ${u0} + ${u0} + \\ldots + ${u0}}_{${n + 1}\\times${u0}}) + ${r} \\times (1 + 2 + 3 + \\ldots + ${n})\\end{aligned}$`
    this.correction +=
      "<br> Or, on sait d'après le cours que : $1 + 2 + 3 + \\ldots + n = \\dfrac{n(n+1)}{2}$."
    this.correction += `<br>$\\begin{aligned}S&=${n + 1} \\times ${u0} + ${r} \\times \\dfrac{${n} \\times ${n + 1}}{2}\\\\&=${texNombre(this.reponse)}\\end{aligned}$`
    this.correction += `<br><br>${texteGras('Autre méthode')} : on reconnait la somme des $${n + 1}$ premiers termes d'une suite arithmétique de premier terme $${u0}$ et de raison $${r}$.`
    this.correction +=
      "<br>Donc d'après le cours, la somme de termes consécutifs d'une suite arithmétique est égale au nombre de termes multiplié par la moyenne du premier et du dernier terme."
    this.correction +=
      '<br>Avec des lettres : $u_0+u_1+\\ldots+u_n=(n+1)\\times\\dfrac{u_0+u_n}{2}$.'
    this.correction += `<br>$\\begin{aligned}S&=(\\text{nombre de termes})\\times\\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}\\\\&=${n + 1}\\times\\dfrac{${u0} + ${u0 + n * r}}{2}\\\\&=${miseEnEvidence(texNombre(this.reponse))}\\end{aligned}$`
  }
}
