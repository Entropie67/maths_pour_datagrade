import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import {
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { bleuMathalea } from '../../lib/colors'
import { sp } from '../../lib/outils/outilString'

export const uuid = '972f5'
export const refs = {
  'fr-fr': ['3L14DNB-1', '3Z1DNB-13'],
  'fr-ch': ['11LSFA3J-4'],
}
export const titre =
  'Se préparer au DNB : programme de calcul, scratch et calcul littéral'
export const dateDePublication = '25/11/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * codé à partir des sources de l'APMEP Antilles-Guyane 06/2024 retravaillées par L'équipe CoopMaths
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3L14DNB1 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.introduction =
      texteItalique("D'après l'exercice $2$ du brevet Métropole 2024.") +
      '<br><br>'

    this.versionAleatoire(0)
  }

  private appliquerLesValeurs(
    x1: number,
    x2: number,
    departA: number,
    departB: number,
  ) {
    // enonce
    const b = x1 - x2
    const c = x1 * x2
    const programmeA = createList({
      items: [
        'Choisir un nombre.',
        'Prendre le carré du nombre choisi.',
        'Multiplier le résultat par $2$.',
        `Ajouter ${
          this.sup ? 'le double du' : `$${2 * b}$ fois le`
        } nombre de départ.`,
        `Soustraire $${2 * c}$ au résultat.`,
      ],
      style: 'fleches',
    })
    let texteScratch = `\\begin{scratch}[${context.isHtml ? 'print,' : ''}fill,blocks,scale=0.8]\n`
    texteScratch += `\\blockinit{quand \\greenflag est cliqué}
\\blocksensing{demander \\ovalnum{Choisir un nombre} et attendre}
\\blockvariable{mettre \\selectmenu{nombre choisi} à \\ovalsensing{réponse}}
\\blockvariable{mettre \\selectmenu{Résultat 1} à \\ovaloperator{\\ovalvariable{nombre choisi} + \\ovalnum{${x1}} }}
\\blockvariable{mettre \\selectmenu{Résultat 2} à \\ovaloperator{\\ovalvariable{nombre choisi} - \\ovalnum{${x2}} }}
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{Le résultat est } et \\ovaloperator{\\ovalvariable{Résultat 1} * \\ovalvariable{Résultat 2} }}}`
    texteScratch += '\\end{scratch}\n'
    const programmeB = scratchblock(texteScratch)
    const fA = (x: number) => 2 * x ** 2 + 2 * b * x - 2 * c // a(x^2 + x - 2)
    const fB = (x: number) => (x + x1) * (x - x2) // x^2 + (b - c) * x -  b * c
    const question1 = createList({
      items: [
        `Vérifier que, si on choisit $${departA}$ comme nombre de départ, le résultat du programme A est $${fA(departA)}$.`,
        `Quel résultat obtient-on avec le programme B si on choisit $${departB}$ comme nombre de départ${sp()}?`,
      ],
      style: 'alpha',
    })
    const correction1 = createList({
      items: [
        `On obtient successivement${sp()}: $${departA} \\to ${departA}^2 = ${departA ** 2}  \\to ${departA ** 2}\\times 2 = ${2 * departA ** 2} \\to ${2 * departA ** 2} + ${2 * b} \\times ${departA} = ${2 * departA ** 2 + 2 * b * departA}  \\to ${2 * departA ** 2 + 2 * b * departA} - ${2 * c} \\to ${fA(departA)}$.`,
        `Avec $${departB}$ au départ on obtient${sp()}:<br>
        ${createList({
          items: [
            `En résultat $1$${sp()}: $${departB} + ${x1} = ${departB + x1}$`,
            `En résultat $2$${sp()}: $${departB} - ${x2} = ${departB - x2}$`,
            `En résultat final${sp()}: $${departB + x1} \\times  ${ecritureParentheseSiNegatif(departB - x2)} = ${miseEnEvidence(String(fB(departB)))}$`,
          ],
          style: 'fleches',
        })}
        ${
          context.isHtml
            ? createScratchSimulatorElement(
                texteScratch.replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
                1000,
                false,
              )
            : ''
        }`,
      ],
      style: 'alpha',
    })
    const choix1 = `(x + ${x1}) - ${x2}`
    const choix2 = `(x + ${x1}) \\times (x - ${x2})`
    const choix3 = `x + ${x1} \\times x - ${x2}`
    const choix = this.sup
      ? [choix1, choix2, choix3].map((el, index) => `E_${index + 1}=${el}`)
      : shuffle([choix1, choix2, choix3]).map(
          (el, index) => `E_${index + 1}=${el}`,
        )
    const question2 = createList({
      items: [
        `Parmi les trois propositions ci-dessous, recopier l'expression qui donne le résultat obtenu par le programme B${sp()}?<br>
        $${choix.join('\\qquad ')}$`,
        'Exprimer en fonction de $x$ le résultat obtenu avec le programme A.',
      ],
      style: 'alpha',
    })
    const indexB = choix.findIndex((el) => el.endsWith(')')) + 1
    const correction2 = createList({
      items: [
        `${createList({
          items: [
            `Résultat 1 =  $x + ${x1}$`,
            `Résultat $2$${sp()}: $x - ${x2}$`,
            `Résultat final = $${miseEnEvidence(`(x + ${x1})(x - ${x2})`)}$ soit $${miseEnEvidence(`E_${indexB}`)}$`,
          ],
          style: 'fleches',
        })}`,
        `On obtient successivement${sp()}: $x  \\to x^2  \\to 2 \\times x^2 = 2x^2  \\to 2x^2 + ${2 * b}x  \\to ${miseEnEvidence(`2x^2 + ${2 * b}x - ${2 * c}`)}$`,
      ],
      style: 'alpha',
    })

    const question3 =
      'Démontrer que, quel que soit le nombre choisi au départ, le résultat du programme A est toujours le double du résultat du programme B.'
    const correction3 = `Le résultat avec le programme A est${sp()}:<br>
    $\\begin{aligned}2x^2 + ${2 * b}x -  ${2 * c} &=2x^2 + 2\\times ${rienSi1(b)}x - 2\\times ${c}\\\\
     &= 2\\left(${miseEnEvidence(`x^2 + ${rienSi1(b)}x - ${c}`, bleuMathalea)}\\right)
     \\end{aligned}$<br>
    Or en développant $E_${indexB}$ (le résultat du programme B)${sp()}:<br>
    $\\begin{aligned}E_${indexB} = (x + ${x1})(x - ${x2}) &= x^2 + ${x1}x - ${rienSi1(x2)}x -  ${x1}\\times ${x2}\\\\
     &= ${miseEnEvidence(`x^2 + ${rienSi1(b)}x - ${c}`, bleuMathalea)}\\end{aligned}$<br>
    ${texteEnCouleurEtGras('Le résultat du programme A est le double du résultat du programme B')}.`

    const enonce = `${deuxColonnesResp('Programme A', 'Programme B', { largeur1: 50, widthmincol1: '100px', widthmincol2: '100px', stylecol1: `border: solid; `, stylecol2: `border: solid; `, eleId: '' })}
    ${deuxColonnesResp(programmeA, String(programmeB), { largeur1: 50, widthmincol1: '100px', widthmincol2: '100px', stylecol1: `border: solid; `, stylecol2: `border: solid; `, eleId: '' })}
    ${createList({
      items: [question1, question2, question3],
      style: 'nombres',
    })}`

    // correction

    const listeCorrections = createList({
      items: [correction1, correction2, correction3],
      style: 'nombres',
    })

    this.enonce = enonce
    this.correction = listeCorrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 1, 5, -9)
  }

  versionAleatoire: (i: number) => void = (i: number) => {
    const index = combinaisonListesSansChangerOrdre(
      [2, 1, 3, 4],
      this.nbQuestions,
    )
    const x2 = randint(1, 4)
    const x1 = x2 + index[i]
    const departA = randint(1, 10)
    const departB = -randint(1, 10, [departA])
    this.appliquerLesValeurs(x1, x2, departA, departB)
  }
}
