import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { createList } from '../../lib/format/lists'
import { combinaisonListesSansChangerOrdre } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../lib/outils/ecritures'
import { texteEnBoite, texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '6c592'
export const refs = {
  'fr-fr': ['3L14DNB-0', '3Z1DNB-01'],
  'fr-ch': ['11LSFA3J-3'],
}
export const titre =
  'Préparation DNB : Calcul littéral, scratch et équation produit nul'
export const dateDePublication = '15/11/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * codé à partir des sources de l'APMEP Antilles-Guyane 06/2024 retravaillées par L'équipe CoopMaths
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3L14DNB0 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.introduction = texteItalique(
      "D'après l'exercice $4$ du brevet Antilles-Guyane 2024.",
    )
    this.versionAleatoire(0)
  }

  private appliquerLesValeurs(
    facteur: 1 | 2 | 3 | 4,
    retrait: number,
    depart: number,
    a: number,
    b: number,
  ) {
    const facteurs = {
      1: 'nombre de départ',
      2: 'double du nombre de départ',
      3: 'triple du nombre de départ',
      4: 'quadruple du nombre de départ',
    }
    const nbFois = facteurs[facteur]
    const f = (x: number) => (x + a) * (x - b)
    // enonce
    let enonce = `On considère le programme de calcul ci-dessous${sp()}:<br>`
    enonce += texteEnBoite(
      createList({
        items: [
          'Choisir un nombre',
          'Mettre ce nombre au carré',
          `Soustraire le ${nbFois}`,
          `Soustraire $${retrait}$`,
        ],
        style: 'fleches',
      }),
    )
    let correction = enonce
    const texteScratch = `\\begin{scratch}[${context.isHtml ? 'print,' : ''}fill,blocks,scale=0.8]
  \\blockinit{quand \\greenflag est cliqué}
  \\blocksensing{demander \\ovalnum{Choisir un nombre} et attendre}
  \\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
  \\blockvariable{mettre \\selectmenu{y} à \\ovaloperator{\\ovalvariable{...}*\\ovalvariable{...}}}
  \\blockvariable{mettre \\selectmenu{z} à \\ovaloperator{\\ovalnum{${facteur}}*\\ovalvariable{x}}}
  \\blockvariable{mettre \\selectmenu{Résultat} à \\ovaloperator{\\ovaloperator{\\ovalvariable{...}-\\ovalvariable{...}} -\\ovalnum{${retrait}} }}
  \\blocklook{dire \\ovalvariable{Résultat} pendant \\ovalnum{5}secondes}
  \\end{scratch}`

    const listeQuestions = createList({
      items: [
        `Montrer que si on choisit $${depart}$ comme nombre de départ, le résultat du programme est $${f(depart)}$.`,
        'On choisit $x$ comme nombre de départ. Exprimer le résultat du programme en fonction de $x$.',
        `Vérifier que l'on peut écrire ce résultat sous la forme $(x+${a})(x-${b})$.`,
        'Déterminer les nombres à choisir au départ pour que le résultat du programme soit $0$.',
        `Juliette a écrit le programme ci-dessous${sp()}:<br>
            ${scratchblock(texteScratch)}<br>
            Recopier et compléter sur la copie les lignes $4$ et $6$ du programme afin que celui-ci corresponde au programme de calcul encadré.`,
      ],
      style: 'nombres',
    })
    enonce += listeQuestions
    // correction

    let texteScratch2 = `\\begin{scratch}[${context.isHtml ? 'print,' : ''}fill,blocks,scale=0.8]\n`
    texteScratch2 +=
      '\\blockvariable{mettre \\selectmenu{y} à \\ovaloperator{\\ovalnum{x}*\\ovalnum{x}}}\n'
    texteScratch2 += `\\blockvariable{mettre \\selectmenu{Résultat} à \\ovaloperator{\\ovaloperator{\\ovalnum{y}-\\ovalnum{z}} -\\ovalnum{${retrait}} }}\n`
    texteScratch2 += '\\end{scratch}\n'

    const listeCorrections = createList({
      items: [
        `On a successivement${sp()}: $${depart} \\to ${depart}^2 = ${depart * depart} \\to ${depart * depart} - ${facteur} \\times ${depart} = ${depart * depart - facteur * depart}  \\to, ${depart * depart - facteur * depart} - ${retrait} = ${miseEnEvidence(f(depart))}$.`,
        `De même avec $x$ au départ${sp()}: <br>
              $x \\to x^2 \\to x^2 - ${facteur}x \\to ${miseEnEvidence(`x^2 - ${facteur}x - ${retrait}`)}$.`,
        `On développe $(x+${a})(x-${b}) = x^2 ${ecritureAlgebriqueSauf1(-b)}x${ecritureAlgebriqueSauf1(a)}x${ecritureAlgebrique(-b * a)}=x^2-${facteur}x-${retrait}$.<br>On retrouve l'expression de la question $2$.<br>
              On a donc $x^2 - ${facteur}x - ${retrait} = (x+${a})(x-${b})$.`,
        `Il faut trouver un ou des nombres $x$ tels que $x^2-${facteur}x-${retrait}=0$ ou d'après la question précédente tels que${sp()}:<br>
              $(x+${a})(x-${b})=0$.<br>
              Un produit de facteurs est nul si l'un des facteurs est nul, soit <br>
              $\\left\\{\\begin{array}{l c l}
              x+${a}&=&0\\\\
              &\\text{ou}&\\\\
              x-${b}&=&0
              \\end{array}\\right.$ d'où $\\left\\{\\begin{array}{l c l}
              x&=&${miseEnEvidence(-a)}\\\\
              &\\text{ou}&\\\\
              x&=& ${miseEnEvidence(b)}
              \\end{array}\\right.$.`,
        `Juliette doit compléter en ligne $4$ et $6$${sp()}:<br>
              ${scratchblock(texteScratch2)}
              ${
                context.isHtml
                  ? createScratchSimulatorElement(
                      texteScratch
                        .replace(
                          '\\selectmenu{y} à \\ovaloperator{\\ovalvariable{...}*\\ovalvariable{...}',
                          '\\selectmenu{y} à \\ovaloperator{\\ovalvariable{x}*\\ovalvariable{x}',
                        )
                        .replace(
                          '\\ovaloperator{\\ovaloperator{\\ovalvariable{...}-\\ovalvariable{...}}',
                          '\\ovaloperator{\\ovaloperator{\\ovalvariable{y}-\\ovalvariable{z}}',
                        )
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;'),
                      500,
                      false,
                    ) + '<br>'
                  : ''
              }`,
      ],
      style: 'nombres',
    })
    correction += `<br><br>${listeCorrections}`

    this.enonce = enonce
    this.correction = correction
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 4, 5, 1, 4)
  }

  versionAleatoire: (i: number) => void = (i: number) => {
    const a = randint(1, 3)
    const b =
      a + combinaisonListesSansChangerOrdre([2, 3, 4], this.nbQuestions)[i]
    const facteur = b - a
    const retrait = a * b
    const depart = randint(1, 10, [a, b])
    this.appliquerLesValeurs(facteur as 1 | 2 | 3 | 4, retrait, depart, a, b)
  }
}
