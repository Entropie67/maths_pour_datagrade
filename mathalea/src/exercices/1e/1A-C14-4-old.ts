// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d7ba2 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '02/08/2025'
export const uuid = 'd7ba2'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une inéquation avec un tableau de signes'
/**
 * @author Gilles Mora
 */
export default class Auto1AC16Old extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    // Version fixe pour les tests ou exemple
    const ligneMPP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      'z',
      20,
      '+',
      20,
      't',
      5,
      '+',
      20,
    ]
    const ligneMMP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      't',
      5,
      '-',
      20,
      'z',
      20,
      '+',
      20,
    ]
    const lignePMP = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      'z',
      20,
      '-',
      20,
      'z',
      5,
      '+',
      20,
    ]
    const lignePPP = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      't',
      5,
      '+',
      20,
      't',
      20,
      '+',
      20,
    ]

    this.enonce = `L'ensemble des solutions, dans $\\mathbb{R}$, de l'inéquation
    $2(x-3)(x+1) > 0$ est :`

    this.correction =
      `$(x-3)(x+1)$ est un produit de deux fonctions affines.<br>
    L'équation $x+3=0$ a pour solution $x=-3$.<br>
        L'équation $x+1=0$ a pour solution $x=-1$.<br>
        Le tableau de signe du produit $2(x-3)(x+1)$ est : <br>` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            ['$2$', 2, 50],
            ['$x-3$', 2, 50],
            ['$x+1$', 2, 50],
            ['$2(x-3)(x+1)$', 2, 100],
          ],
          ['$-\\infty$', 30, '$-1$', 20, '$3$', 20, '$+\\infty$', 30],
        ],
        tabLines: [lignePPP, ligneMMP, ligneMPP, lignePMP],
        espcl: 4,
        deltacl: 1.5, // valeur par défaut, à ajuster si besoin
        lgt: 6.5,
      }) +
      `
    On en déduit que l'ensemble des solutions est $${miseEnEvidence(']-\\infty \\,;\\,-1[\\cup]3\\,;\\,+\\infty[')}$.`

    this.reponses = [
      '$]-\\infty\\,;\\,-1[\\cup]3\\,;\\,+\\infty[$',
      '$]-1\\,;\\,3[$',
      '$[-1\\,;\\,3]$',
      '$]-\\infty\\,;\\,-1]\\cup[3\\,;\\,+\\infty[$',
    ]
  }

  versionAleatoire = () => {
    const a = randint(2, 10) * choice([-1, 1]) // coefficient a
    const b = randint(0, 10) * choice([-1, 1]) // racine1
    const c = randint(1, 10, [b, -b]) * choice([-1, 1]) // racine2
    const typeInegalite = choice([1, 2]) // 1 pour ≥0, 2 pour ≤0
    const inegalite =
      typeInegalite === 1
        ? choice(['>', '\\geqslant'])
        : choice(['<', '\\leqslant'])

    this.enonce = `L'ensemble des solutions, dans $\\mathbb{R}$, de l'inéquation
   ${b === 0 ? `$${rienSi1(a)}x(x${ecritureAlgebrique(-c)}) ${inegalite} 0$` : `$${rienSi1(a)}(x${ecritureAlgebrique(-b)})(x${ecritureAlgebrique(-c)}) ${inegalite} 0$`}  est :`

    // Construction de la correction avec tableau de variation
    const r1 = Math.min(b, c) // première racine (la plus petite)
    const r2 = Math.max(b, c) // deuxième racine (la plus grande)

    // Construction des lignes du tableau selon le signe de a
    let ligneA: (string | number)[],
      ligneFacteur1: (string | number)[],
      ligneFacteur2: (string | number)[],
      ligneProduit: (string | number)[]

    if (a > 0) {
      ligneA = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20, 't', 20, '+', 20]
      ligneFacteur1 = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        'z',
        5,
        '+',
        20,
        't',
        20,
        '+',
        20,
      ]
      ligneFacteur2 = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        't',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
      ]
      ligneProduit = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        'z',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
      ]
    } else {
      ligneA = ['Line', 30, '', 0, '-', 20, 't', 5, '-', 20, 't', 20, '-', 20]
      ligneFacteur1 = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        'z',
        5,
        '+',
        20,
        't',
        20,
        '+',
        20,
      ]
      ligneFacteur2 = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        't',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
      ]
      ligneProduit = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        'z',
        5,
        '+',
        20,
        'z',
        20,
        '-',
        20,
      ]
    }

    let correction =
      `${b === 0 ? `$${rienSi1(a)}x(x${ecritureAlgebrique(-c)})$` : `$(x${ecritureAlgebrique(-b)})(x${ecritureAlgebrique(-c)})$`} est un produit de deux fonctions affines.<br>
      L'équation ${b === 0 ? `$${a}x=0$` : `$x${ecritureAlgebrique(-b)}=0$`} a pour solution $x=${b}$.<br>
        L'équation $x${ecritureAlgebrique(-c)}=0$ a pour solution $x=${c}$.<br>
        Le tableau de signe du produit  ${b === 0 ? `$${rienSi1(a)}x(x${ecritureAlgebrique(-c)})$` : `$${rienSi1(a)}(x${ecritureAlgebrique(-b)})(x${ecritureAlgebrique(-c)})$`} est : <br>` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            [`$${a}$`, 2, 50],
            [`$x${ecritureAlgebrique(-b)}$`, 2, 50],
            [`$x${ecritureAlgebrique(-c)}$`, 2, 50],
            [
              `${b === 0 ? `$${rienSi1(a)}x(x${ecritureAlgebrique(-c)})$` : `$${rienSi1(a)}(x${ecritureAlgebrique(-b)})(x${ecritureAlgebrique(-c)})$`}`,
              2,
              100,
            ],
          ],
          ['$-\\infty$', 30, `$${r1}$`, 20, `$${r2}$`, 20, '$+\\infty$', 30],
        ],
        tabLines: [ligneA, ligneFacteur1, ligneFacteur2, ligneProduit],
        espcl: 4,
        deltacl: 1.5,
        lgt: 6.5,
      })

    // Détermination des solutions selon le signe de a et le type d'inégalité
    let solution1: string,
      solution2: string,
      solution3: string,
      solution4: string

    if (typeInegalite === 1) {
      // cas ≥ 0 ou > 0
      if (a > 0) {
        // Expression positive sauf entre les racines
        if (inegalite === '>') {
          solution1 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution2 = `$]${r1}\\,;\\,${r2}[$`
          solution3 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          solution4 = `$[${r1}\\,;\\,${r2}]$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]-\\infty \\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[`)}.$`
        } else {
          // inegalite === '\\geqslant'
          solution1 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          solution2 = `$]${r1}\\,;\\,${r2}[$`
          solution3 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution4 = `$[${r1}\\,;\\,${r2}]$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]-\\infty \\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[`)}.$`
        }
      } else {
        // a < 0
        // Expression négative sauf entre les racines
        if (inegalite === '>') {
          solution1 = `$]${r1}\\,;\\,${r2}[$`
          solution2 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution3 = `$[${r1}\\,;\\,${r2}]$`
          solution4 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]${r1}\\,;\\,${r2}[`)}.$`
        } else {
          // inegalite === '\\geqslant'
          solution1 = `$[${r1}\\,;\\,${r2}]$`
          solution2 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution3 = `$]${r1}\\,;\\,${r2}[$`
          solution4 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`[${r1}\\,;\\,${r2}]`)}.$`
        }
      }
    } else {
      // cas ≤ 0 ou < 0
      if (a > 0) {
        // Expression positive sauf entre les racines, on cherche où elle est négative
        if (inegalite === '<') {
          solution1 = `$]${r1}\\,;\\,${r2}[$`
          solution2 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution3 = `$[${r1}\\,;\\,${r2}]$`
          solution4 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]${r1}\\,;\\,${r2}[`)}.$`
        } else {
          // inegalite === '\\leqslant'
          solution1 = `$[${r1}\\,;\\,${r2}]$`
          solution2 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution3 = `$]${r1}\\,;\\,${r2}[$`
          solution4 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`[${r1}\\,;\\,${r2}]`)}.$`
        }
      } else {
        // a < 0
        // Expression négative sauf entre les racines
        if (inegalite === '<') {
          solution1 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution2 = `$]${r1}\\,;\\,${r2}[$`
          solution3 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          solution4 = `$[${r1}\\,;\\,${r2}]$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]-\\infty \\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[`)}.$`
        } else {
          // inegalite === '\\leqslant'
          solution1 = `$]-\\infty\\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[$`
          solution2 = `$]${r1}\\,;\\,${r2}[$`
          solution3 = `$]-\\infty\\,;\\,${r1}[\\cup]${r2}\\,;\\,+\\infty[$`
          solution4 = `$[${r1}\\,;\\,${r2}]$`
          correction += `<br>On en déduit que l'ensemble des solutions est $${miseEnEvidence(`]-\\infty \\,;\\,${r1}]\\cup[${r2}\\,;\\,+\\infty[`)}.$`
        }
      }
    }

    this.correction = correction
    this.reponses = [solution1, solution2, solution3, solution4]
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
