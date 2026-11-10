import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'

export const uuid = 'fb6e0'
export const refs = {
  'fr-fr': ['3F14DNB-1', '3Z1DNB-05'],
  'fr-ch': ['1mF3-11'],
}
export const titre =
  'Préparation DNB : Fonctions, tableur et équation produit nul'
export const dateDePublication = '06/12/2024'
/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3F14DNB1 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.introduction = texteItalique(
      "D'après l'exercice $2$ du brevet Amérique du Sud 2024.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    x0: number,
    y1: number,
    listeX: number[],
  ): void {
    const bb = a + b
    const cc = a * b
    const f = (x: number) => (x + a) * (x + b)
    const g = (x: number) => c * x
    const y0 = f(x0)
    const tabEntetesColonnes = ['']
    for (let i = 0; i <= listeX.length; i++) {
      tabEntetesColonnes.push(lettreDepuisChiffre(i + 1))
    }
    const tabEntetesLignes = ['1', '2', '3']
    const tabLignes = ['x']
    for (const x of listeX) {
      tabLignes.push(String(x))
    }
    tabLignes.push(
      `f(x) = x^2${ecritureAlgebriqueSauf1(bb)}x${ecritureAlgebriqueSauf1(cc)}`,
    )
    for (const x of listeX) {
      tabLignes.push(String(f(x)))
    }
    tabLignes.push(`g(x) = ${rienSi1(c)}x`)
    for (const x of listeX) {
      tabLignes.push(String(c * x))
    }

    const tableauValeurs = tableauColonneLigne(
      tabEntetesColonnes,
      tabEntetesLignes,
      tabLignes,
    )
    const sousListe1 = createList({
      items: [
        `Montrer que l'image de $${x0}$ par la fonction $f$ est $${y0}$.`,
        `Déterminer l'antécédent de $${y1}$ par la fonction $g$.`,
        `Pour calculer des images de nombres par les fonctions $f$ et $g$, on utilise un tableur et on obtient la copie d'écran suivante${sp()}:<br> ${tableauValeurs}
 À l'aide des informations précédentes, citer deux antécédents de $${f(x0)}$ par la fonction $f$.`,
        `Quelle formule a-t-on pu saisir dans la cellule B2 avant de l'étirer vers la droite jusqu'à la cellule ${lettreDepuisChiffre(1 + listeX.length)}2${sp()}?`,
        `Existe-t-il un nombre qui a la même image par la fonction $f$ et par la fonction $g$${sp()}?`,
      ],
      style: 'alpha',
    })
    const sousListe2 = createList({
      items: [
        `Montrer que pour tout nombre $x$, $f(x)$ est égal à $(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})$.`,
        "Résoudre l'équation $f(x) = 0$.",
      ],
      style: 'alpha',
    })
    const listePrincipale = createList({
      items: [sousListe1, sousListe2],
      style: 'nombres',
    })
    this.enonce = ` On considère deux fonctions $f$ et $g$ définies par${sp()}:
    $\\begin{cases}
    f(x) = x^2${ecritureAlgebriqueSauf1(bb)}x${ecritureAlgebriqueSauf1(cc)}\\\\
    g(x) = ${rienSi1(c)}x
    \\end{cases}$
    ${listePrincipale}`
    const listeAntGEgalG = listeX.filter((x) => f(x) === g(x))
    const sousListe1Correction = createList({
      items: [
        `${this.correctionDetaillee ? `Calculons $f(x) = x^2${ecritureAlgebriqueSauf1(bb)}x${ecritureAlgebriqueSauf1(cc)}$ pour $x=${x0}$.<br>` : ''}
       $f(${x0}) = ${ecritureParentheseSiNegatif(x0)}^2 ${ecritureAlgebriqueSauf1(bb)}${Math.abs(bb) === 1 ? '' : '\\times'}${ecritureParentheseSiNegatif(x0)} ${ecritureAlgebrique(cc)} = ${String(x0 * x0)}${ecritureAlgebrique(bb * x0)} ${ecritureAlgebrique(cc)}=${miseEnEvidence(f(x0))}$`,
        `${this.correctionDetaillee ? `Calculons l'antécédent de $${y1}$ par la fonction $g$.<br>` : ''}
        On cherche $x$ tel que $g(x)= ${y1}$, soit $${rienSi1(c)}x = ${y1}$, soit $x = \\dfrac{${y1}}{${rienSi1(c)}}=${y1 / c}$.<br>
        L'antécédent de $${y1}$ par la fonction $g$ est $${miseEnEvidence(y1 / c)}$.`,
        `D'après la réponse $1$.a., $${x0}$ est un antécédent de $${f(x0)}$ par la fonction $f$.<br>
        Et d'après le tableau, $${miseEnEvidence(String(listeX.find((e) => f(e) === f(x0))))}$ est un autre antécédent de $${f(x0)}$ par la fonction $f$.`,
        `On peut saisir la formule ${texteEnCouleurEtGras(`= B1 * B1 ${bb === -1 ? '- B1' : bb === 1 ? '+ B1' : `${bb < 0 ? '- ' : '+ '} ${Math.abs(bb)} * B1`} ${cc < 0 ? '- ' : '+ '} ${Math.abs(cc)}`)} dans la cellule B2 avant de l'étirer vers la droite jusqu'à la cellule ${lettreDepuisChiffre(1 + listeX.length)}2.<br>
        ${this.correctionDetaillee ? 'Cette formule calcule $f(x)$ pour la valeur de $x$ située en ligne $1$ et colonne B.' : ''}`,
        `${
          listeAntGEgalG.length > 1
            ? `D'après le tableau, il existe ${nombreEnLettres(listeAntGEgalG.length)} nombres qui sont${sp()}:<br>
        ${listeAntGEgalG.map((e) => `$${miseEnEvidence(e)}$ qui a pour image $${f(e)}$ par les fonctions $f$ et $g$.`).join('<br>')}`
            : listeAntGEgalG.length === 1
              ? `D'après le tableau, il existe un nombre qui a pour image $${f(listeAntGEgalG[0])}$ par les fonctions $f$ et $g$, c'est le nombre $${miseEnEvidence(listeAntGEgalG[0])}$.`
              : `D'après le tableau, il ${texteEnCouleurEtGras("n'existe pas")} de nombre qui a la même image par les fonctions $f$ et $g$.`
        }`,
      ],
      style: 'alpha',
    })
    const sousListe2Correction = createList({
      items: [
        `Posons pour tout $x$, $E=(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})$ et développons${sp()}:<br>
        $\\begin{aligned}E &= x^2${ecritureAlgebrique(a)}x${ecritureAlgebrique(b)}x${ecritureAlgebrique(cc)}\\\\
        &= x^2${ecritureAlgebriqueSauf1(a + b)}x${ecritureAlgebrique(cc)}\\end{aligned}$<br>
        Ce qui est la définition de $f(x)$.`,
        `Pour résoudre l'équation $f(x) = 0$, on cherche les solutions de l'équation $(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)}) = 0$.<br>
          ${this.correctionDetaillee ? `Un produit est nul si l'un des facteurs est nul, soit${sp()}: $x${ecritureAlgebrique(a)}=0$ ou $x${ecritureAlgebrique(b)}=0$.<br>` : ''}
        On en déduit que les solutions de l'équation $f(x) = 0$ sont $x=${miseEnEvidence(-a)}$ et $x=${miseEnEvidence(-b)}$.<br>`,
      ],
      style: 'alpha',
    })
    const listePrincipaleCorrection = createList({
      items: [sousListe1Correction, sousListe2Correction],
      style: 'nombres',
    })
    this.correction = listePrincipaleCorrection
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, -3, -2, 5, 4, rangeMinMax(-4, 2))
  }

  versionAleatoire: () => void = () => {
    const valeurs = [
      { a: -4, b: -6 },
      { a: -4, b: 6 },
      { a: -3, b: -8 },
      { a: -3, b: 8 },
      { a: -2, b: -3 },
      { a: -2, b: 3 },
      { a: 2, b: -3 },
      { a: 2, b: 3 },
      { a: 3, b: -8 },
      { a: 3, b: 8 },
      { a: 4, b: -6 },
      { a: 4, b: 6 },
    ]
    const { a, b } = choice(valeurs)
    const c = -a
    const g = (x: number) => c * x

    const x0 = choice([-a, -b])
    const listeX = [-8, -6, -4, -3, -2, 2, 3, 4, 6, 8]
    const y1 = g(randint(-8, 8, listeX))
    this.appliquerLesValeurs(
      a,
      b,
      c,
      x0,
      y1,
      listeX.filter((x) => x !== x0),
    )
  }
}
