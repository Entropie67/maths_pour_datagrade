// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bc8ae continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'bc8ae'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : équation'
export const dateDePublication = '23/02/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class MetropoleJuin24Exo4Q1Old extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(a: number, b: number, k: number): void {
    const delta = -4 * (b - Math.exp(k)) * a

    if (delta > 0) {
      this.reponses = [
        'admet exactement deux solutions.',
        "n'admet aucune solution.",
        'admet une unique solution.',
        'admet une infinité de solutions.',
      ]
    }
    if (delta === 0) {
      this.reponses = [
        'admet une unique solution.',
        "n'admet aucune solution.",
        'admet exactement deux solutions.',
        'admet une infinité de solutions.',
      ]
    }
    if (delta < 0) {
      this.reponses = [
        "n'admet aucune solution.",
        'admet une unique solution.',
        'admet exactement deux solutions.',
        'admet une infinité de solutions.',
      ]
    }
    this.enonce = `On considère la fonction $f$ définie pour tout réel $x$ par $f(x) = \\ln \\left(${rienSi1(a)}x^2${ecritureAlgebrique(b)}\\right)$. `
    this.enonce += `<br>Sur $\\mathbb{R}$, l'équation $f(x) = ${k}$<br>`
    this.correction =
      'Si $a$ et $b$ sont deux réels strictement positifs, on a $\\ln(a) = \\ln(b) \\iff a = b$.<br>'
    this.correction += `Soit $x\\in \\mathbb{R}$. On a${sp()}:<br>
$\\begin{aligned}
f(x) &= ${k}\\\\
\\iff \\ln\\left(${rienSi1(a)}x^2${ecritureAlgebrique(b)}\\right) &= \\ln\\left(\\mathrm{e}^{${k}}\\right)\\\\
\\iff ${rienSi1(a)}x^2${ecritureAlgebrique(b)} &= \\mathrm{e}^{${k}}\\\\`
    this.correction +=
      a === 1
        ? `\\iff x^2 &= \\mathrm{e}^{${k}}${ecritureAlgebrique(-b)}`
        : `\\iff x^2 &= \\dfrac{\\mathrm{e}^{${k}}${ecritureAlgebrique(-b)}}{${a}}`
    this.correction += '\\end{aligned}$'
    if (delta > 0) {
      this.correction += `<br> $\\mathrm{e}^{${k}}${ecritureAlgebrique(-b)}$ est un réel strictement positif, donc on a $x^2 > 0.$`
      this.reponse = 'exactement deux solutions'
    }
    if (delta === 0) {
      this.correction += `<br>$\\mathrm{e}^{${k}}${ecritureAlgebrique(-b)}=0.$`
      this.reponse = 'une unique solution'
    }
    if (delta < 0) {
      this.correction += `<br>$\\mathrm{e}^{${k}}${ecritureAlgebrique(-b)}<0.$`
      this.reponse = 'aucune solution'
    }
    this.correction += `<br>L'équation $f(x) = ${k}$`
    if (delta < 0) this.correction += " n'"
    this.correction += ` admet donc ${texteEnCouleurEtGras(String(this.reponse))}.`
  }
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, 1, 2022) // valeurs originales
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const a = randint(1, 6)
      const b = randint(1, 30) // On génère un polynôme de degré 2 ax^2+c
      const k = randint(-10, 10, 0) // On résout f(x)=k

      this.appliquerLesValeurs(a, b, k)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
