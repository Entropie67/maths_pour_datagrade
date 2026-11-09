import { orangeMathalea } from '../../../lib/colors'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { texPrix } from '../../../lib/format/style'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { sp } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import {
  besoinFormulaireChoixQuestionsCan,
  numerosQuestionsCan,
} from '../../../lib/outils/choixQuestionsCan'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'

export const titre = 'S’entraîner avec le sujet CAN Seconde 2022'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '13/07/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
/**
 *
 * @author Gilles Mora

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = '2a4b1'

export const refs = {
  'fr-fr': ['can2a-2022'],
  'fr-ch': ['NR'],
}
export default class SujetCAN2022Seconde extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 30
    this.besoinFormulaireTexte = besoinFormulaireChoixQuestionsCan
    this.sup = ''

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante${sp()}:<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus «${sp()}coûteuses${sp()}» cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur «${sp()}Nouvelles données${sp()}», on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En choisissant un nombre de questions inférieur à 30, on fabrique une «${sp()}mini${sp()}» Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.<br>
  Le paramètre «${sp()}Choix des questions${sp()}» permet de ne retenir que certaines questions du sujet officiel, dans l’ordre souhaité (par exemple 1-5-12).`
  }

  nouvelleVersion() {
    const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 8 possibles.
    const nbQ2 = Math.min(this.nbQuestions - nbQ1, 20)
    const typeQuestionsDisponiblesNiv1 = shuffle([
      1, 2, 4, 5, 6, 7, 8, 9, 10, 15,
    ])
      .slice(-nbQ1)
      .sort(compareNombres)
    const typeQuestionsDisponiblesNiv2 = shuffle([
      3, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      30,
    ])
      .slice(-nbQ2)
      .sort(compareNombres)
    const typeQuestionsDisponibles = numerosQuestionsCan(
      this,
      typeQuestionsDisponiblesNiv1.concat(typeQuestionsDisponiblesNiv2),
    )
    const listeFractions2 = [
      [1, 3],
      [2, 3],
      [3, 7],
      [2, 7],
      [4, 3],
      [3, 5],
      [4, 7],
      [1, 5],
      [3, 5],
      [3, 4],
      [2, 9],
      [1, 9],
      [7, 9],
      [1, 8],
      [5, 8],
    ]

    for (let i = 0, index = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let p = 0
      let f: number | FractionEtendue = 0
      let texte = ''
      let texteCorr = ''
      let reponse: number | string | string[] | FractionEtendue = 0
      let nbChamps = 1
      let choix = 'a'
      switch (typeQuestionsDisponibles[i]) {
        // switch (24) {
        case 1:
          a = randint(2, 9)
          b = randint(1, 9) / 10
          if (choice([true, false])) {
            texte = `$${a} \\times ${texNombre(b, 1)}=$ `
          } else {
            texte = `$${texNombre(b, 1)} \\times ${a}=$ `
          }
          texteCorr = `$${a} \\times ${texNombre(b, 1)}=${a}\\times ${texNombre(b * 10, 0)}\\times 0,1=${miseEnEvidence(texNombre(a * b, 1))}$`
          reponse = arrondi(a * b)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1

          break

        case 2:
          {
            a = randint(1, 9)
            const b = choice(listeFractions2)
            const f = new FractionEtendue(b[0], b[1])
            if (choice([true, false])) {
              reponse = new FractionEtendue(a * b[1] + b[0], b[1])
              texte = `$${a}+${f.texFraction}= $`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
              } else {
                texte += ' $\\ldots$'
              }
              texteCorr = `$${a}+${f.texFraction}= \\dfrac{${a * b[1]}}{${b[1]}}+${f.texFraction}=${reponse.estIrreductible ? miseEnEvidence(reponse.texFraction) : reponse.texFraction + reponse.texSimplificationAvecEtapes(false, orangeMathalea)}$`
            } else {
              reponse = new FractionEtendue(a * b[1] - b[0], b[1])
              texte = `$${a}-${f.texFraction}= $`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                )
              } else {
                texte += ' $\\ldots$'
              }
              texteCorr = `$${a}-${f.texFraction}= \\dfrac{${a * b[1]}}{${b[1]}}-${f.texFraction}=${reponse.estIrreductible ? miseEnEvidence(reponse.texFraction) : reponse.texFraction + reponse.texSimplificationAvecEtapes(false, orangeMathalea)}$`
            }
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })

            nbChamps = 1
          }

          break

        case 3:
          a = randint(1, 5)
          b = randint(-3, 3, 0)
          c = randint(1, 5)
          d = randint(-5, 5, [0, b])

          texte = `Développer et réduire l'expression $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$.`
          texteCorr = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}$`
          reponse = [`${a * c}x^2+${b * c + a * d}x+${b * d}`]

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.lyceeClassique,
            )
          }
          nbChamps = 1

          break
        case 4:
          if (choice([true, false])) {
            a = randint(2, 9)
            b = randint(2, 9)
            c = choice([-1, -2, -3])
            reponse = arrondi((a * 10 ** -c + b) / 10 ** -c)
            texte = `Donner l'écriture décimale de${sp()}: $${b}\\times10^{${c}}+${a}$.`
            texteCorr = `$${b}\\times10^{${c}}+${a}=${a}+${texNombre(b * 10 ** c, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
          } else {
            a = randint(2, 9)
            b = randint(2, 9)
            c = choice([-1, -2, -3])
            reponse = arrondi((a * 10 ** -c + b) / 10 ** -c)
            texte = `Donner l'écriture décimale de${sp()}: $${a}+${b}\\times10^{${c}}$`
            texteCorr = `$${a}+${b}\\times10^{${c}}=${a}+${texNombre(b * 10 ** c, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 5:
          a = randint(2, 10)
          b = randint(-10, 10, 0)
          f = new FractionEtendue(-b, a)

          texte = `Résoudre l'équation $${reduireAxPlusB(a, b)}=0$.`
          texteCorr = `On se ramène à une équation du type $a\\times x=b$${sp()}:<br>
            $\\begin{aligned}
            ${rienSi1(a)}x${ecritureAlgebrique(b)}&=0\\\\
           ${rienSi1(a)}x&=${-b}\\\\
                                x&=${f.estIrreductible ? miseEnEvidence(f.texFraction) : f.texFraction + f.texSimplificationAvecEtapes(false, orangeMathalea)}
           \\end{aligned}$<br>



            L'équation $${reduireAxPlusB(a, b)}=0$ a pour solution $x=${miseEnEvidence(f.texFractionSimplifiee)}$.`
          reponse = f

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: '<br>$x=$' },
            )
          }
          nbChamps = 1
          break
        case 6:
          choix = choice(['a', 'b', 'c']) //
          if (choix === 'a') {
            a = randint(2, 5) * 2
            const prix = randint(7, 15) / 10
            reponse = arrondi((prix * a) / 2)

            if (a === 2) {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûte $${texNombre(a / 2, 0)}$ croissant${sp()}?
                `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                         $${texNombre(a / 2, 0)}$ croissant coûte $2$ fois moins, soit${sp()}: <br>
                         $${texPrix(prix * a)}\\div 2=${miseEnEvidence(texPrix(reponse))}$ €.`
            } else {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûtent $${texNombre(a / 2, 0)}$ croissants${sp()}?
                          `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                         $${texNombre(a / 2, 0)}$ croissants coûtent $2$ fois moins, soit${sp()}: <br>
                         $${texPrix(prix * a)}\\div 2=${miseEnEvidence(texPrix(reponse))}$ €.`
            }
          } else if (choix === 'b') {
            a = randint(1, 3) * 3
            const prix = randint(7, 15) / 10
            reponse = arrondi((prix * a) / 3)

            if (a === 3) {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûte $${texNombre(a / 3, 0)}$ croissant${sp()}?
                              `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                                       $${texNombre(a / 3, 0)}$ croissant coûte $3$ fois moins, soit${sp()}: <br>
                                       $${texPrix(prix * a)}\\div 3=${miseEnEvidence(texPrix(reponse))}$ €.`
            } else {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûtent $${texNombre(a / 3, 0)}$ croissants${sp()}?
                                        `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                                       $${texNombre(a / 3, 0)}$ croissants coûtent $3$ fois moins, soit${sp()}: <br>
                                       $${texPrix(prix * a)}\\div 3=${miseEnEvidence(texPrix(reponse))}$ €.`
            }
          } else {
            a = randint(1, 3) * 4
            const prix = randint(7, 15) / 10
            reponse = arrondi((prix * a) / 4)

            if (a === 4) {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûte $${texNombre(a / 4, 0)}$ croissant${sp()}?
                                            `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                                                     $${texNombre(a / 4, 0)}$ croissant coûte $4$ fois moins, soit${sp()}: <br>
                                                     $${texPrix(prix * a)}\\div 4=${miseEnEvidence(texPrix(reponse))}$ €.`
            } else {
              texte = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €. Combien coûtent $${texNombre(a / 4, 0)}$ croissants${sp()}?
                                                      `
              texteCorr = `$${a}$ croissants coûtent $${texPrix(prix * a)}$ €, donc
                                                                                             $${texNombre(a / 4, 0)}$ croissants coûtent $4$ fois moins, soit${sp()}: <br>
                                                                                             $${texPrix(prix * a)}\\div 4=${miseEnEvidence(texPrix(reponse))}$ €.`
            }
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              ) + ' €'
          }
          nbChamps = 1

          break
        case 7:
          a = randint(2, 10)
          b = randint(2, 10, a)

          f = new FractionEtendue(a, a + b)
          texte = `Une urne contient $${a}$ boules noires et $${b}$ boules blanches.<br>
          On tire une boule au hasard.<br>
          Quelle est la probabilité de tirer une boule noire${sp()}?`
          reponse = f
          texteCorr = `Puisqu'il s'agit d'une situation d'équiprobabilité, la probabilité est donnée par le quotient${sp()}: $\\dfrac{\\text{Nombre de boules noires}}{\\text{Nombre total de boules}}=${f.estIrreductible ? miseEnEvidence(f.texFraction) : f.texFraction + f.texSimplificationAvecEtapes(false, orangeMathalea)}$.`

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          }
          nbChamps = 1
          break

        case 8:
          a = randint(-10, -1)
          c = randint(-10, 10, 0)
          reponse = a ** 2 + c
          texte = `Calculer l'expression $${reduirePolynomeDegre3(0, 1, 0, c)}$ pour $x=${a}$.`
          texteCorr = `
            Pour $x=${a}$, on obtient${sp()}: $${reduirePolynomeDegre3(0, 1, 0, c)}=(${a})^2${ecritureAlgebrique(c)}=${miseEnEvidence(reponse)}$.
                      `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          }
          nbChamps = 1
          break

        case 9:
          if (choice([true, false])) {
            a = randint(1, 9)
            const somme = choice([20, 40, 60])
            b = randint(1, 9)
            c = somme / 2 - a
            d = somme / 2 - b
            reponse = arrondi(somme / 4)
          } else {
            a = randint(1, 29)
            const somme = choice([60, 80, 90, 100, 120])
            b = randint(1, 29)
            c = somme / 2 - a
            d = somme / 2 - b
            reponse = arrondi(somme / 4)
          }

          texte = `Calculer la moyenne de${sp()}:
            $${a}${sp(3)}; ${sp(3)}${b}${sp(3)}; ${sp(3)}${c}${sp(3)}; ${sp(3)}${d}$.`
          texteCorr = `La moyenne est donnée par${sp()}: $\\dfrac{${a}+${b}+${c}+${d}}{4}=\\dfrac{${reponse * 4}}{4}=${miseEnEvidence(reponse)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 10:
          a = randint(1, 9) * 10
          p = randint(2, 9, 5) * 10
          reponse = arrondi((a * p) / 100)
          texte = `$${p}$ $\\%$ de $${a}= $`

          texteCorr = ` Prendre $${p}$ $\\%$ de $${a}$ revient à prendre $${texNombre(p / 10, 0)}\\times 10\\,\\%$ de $${a}$.<br>
            Comme $10$ $\\%$ de $${a}$ vaut $${a / 10}$ (pour prendre $10$ $\\%$ d'une quantité, on la divise par $10$), alors
            $${p}$ $\\%$ de $${a}=${texNombre(p / 10, 0)}\\times ${texNombre(a / 10, 0)}=${miseEnEvidence(texNombre(reponse, 0))}$.
           `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 11:
          choix = choice(['a', 'b', 'c', 'd'])
          if (choix === 'a') {
            a = randint(101, 500)
            b = arrondi(a / 100)
            const exp = randint(5, 30)

            reponse = `${b}\\times 10^{${exp + 2}}`
            texte = `Donner l'écriture scientifique de $${a}\\times 10^{${exp}}$.`

            texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici${sp()}: $${a}\\times 10^{${exp}}=\\underbrace{${texNombre(b, 2)}}_{1\\leqslant ${texNombre(b, 2)} <10}\\times10^2\\times 10^{${exp}}=${miseEnEvidence(`${texNombre(b, 2)}\\times 10^{${exp + 2}}`)}$.
 `
          } else if (choix === 'b') {
            a = randint(11, 99)
            b = arrondi(a / 10)
            const exp = randint(5, 30)

            reponse = `${b}\\times 10^{${exp + 1}}`
            texte = `Donner l'écriture scientifique de $${a}\\times 10^{${exp}}$.`

            texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici${sp()}: $${a}\\times 10^{${exp}}=\\underbrace{${texNombre(b, 2)}}_{1\\leqslant ${texNombre(b, 2)} <10}\\times10^1\\times 10^{${exp}}=${miseEnEvidence(`${texNombre(b, 2)}\\times 10^{${exp + 1}}`)}$.

 `
          } else if (choix === 'c') {
            a = (randint(1, 9) * 10 + randint(1, 9)) / 100
            b = arrondi(a * 10)
            const exp = randint(5, 30)

            reponse = `${b}\\times 10^{${exp - 1}}`
            texte = `Donner l'écriture scientifique de $${texNombre(a, 2)}\\times 10^{${exp}}$.`

            texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici${sp()}: $${texNombre(a, 2)}\\times 10^{${exp}}=\\underbrace{${texNombre(b, 2)}}_{1\\leqslant ${texNombre(b, 2)} <10}\\times10^{-1}\\times 10^{${exp}}=${miseEnEvidence(`${texNombre(b, 2)}\\times 10^{${exp - 1}}`)}$.
 `
          } else {
            a = (randint(1, 9) * 10 + randint(1, 9)) / 1000
            b = arrondi(a * 100)
            const exp = randint(5, 30)

            reponse = `${b}\\times 10^{${exp - 2}}`
            texte = `Donner l'écriture scientifique de $${texNombre(a, 3)}\\times 10^{${exp}}$.`

            texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
  Ici${sp()}: $${texNombre(a, 3)}\\times 10^{${exp}}=\\underbrace{${texNombre(b, 2)}}_{1\\leqslant ${texNombre(b, 2)} <10}\\times10^{-2}\\times 10^{${exp}}=${miseEnEvidence(`${texNombre(b, 2)}\\times 10^{${exp - 2}}`)}$.
`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            )
          }
          nbChamps = 1
          break

        case 12:
          choix = choice(['a', 'b', 'c', 'd', 'e'])
          if (choix === 'a') {
            reponse = randint(1, 9) * 10 + randint(1, 9)
            b = reponse / 10
            if (choice([true, false])) {
              texte = ` $0,25\\times ${texNombre(b, 1)}\\times 4\\times 10=$`
              texteCorr = `$0,25\\times ${texNombre(b, 1)}\\times 4\\times 10=\\underbrace{0,25\\times 4}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            } else {
              texte = ` $${texNombre(b, 1)}\\times 4\\times 10\\times 0,25= $`
              texteCorr = `$${texNombre(b, 1)}\\times 4\\times 10\\times 0,25=\\underbrace{0,25\\times 4}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            }
          } else if (choix === 'b') {
            reponse = randint(1, 9) * 10 + randint(1, 9)
            b = reponse / 10
            if (choice([true, false])) {
              texte = ` $0,5\\times ${texNombre(b, 1)}\\times 2\\times 10=$`
              texteCorr = `$0,5\\times ${texNombre(b, 1)}\\times 2\\times 10=\\underbrace{0,5\\times 2}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            } else {
              texte = ` $${texNombre(b, 1)}\\times 2\\times 10\\times 0,5= $`
              texteCorr = `$${texNombre(b, 1)}\\times 2\\times 10\\times 0,5=\\underbrace{0,5\\times 2}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            }
          } else if (choix === 'c') {
            reponse = (randint(1, 9) * 10 + randint(1, 9)) * 2
            b = reponse / 20
            if (choice([true, false])) {
              texte = ` $0,5\\times ${texNombre(b, 1)}\\times 4\\times 10=$`
              texteCorr = `$0,5\\times ${texNombre(b, 1)}\\times 4\\times 10=\\underbrace{0,5\\times 4}_{=2}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            } else {
              texte = ` $${texNombre(b, 1)}\\times 4\\times 10\\times 0,5= $`
              texteCorr = `$${texNombre(b, 1)}\\times 4\\times 10\\times 0,5=\\underbrace{0,5\\times 4}_{=2}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            }
          } else if (choix === 'd') {
            reponse = (randint(1, 9) * 10 + randint(1, 9)) * 2
            b = reponse / 20
            if (choice([true, false])) {
              texte = ` $0,25\\times ${texNombre(b, 1)}\\times 8\\times 10=$`
              texteCorr = `$0,25\\times ${texNombre(b, 1)}\\times 8\\times 10=\\underbrace{0,25\\times 8}_{=2}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            } else {
              texte = ` $${texNombre(b, 1)}\\times 8\\times 10\\times 0,25= $`
              texteCorr = `$${texNombre(b, 1)}\\times 8\\times 10\\times 0,25=\\underbrace{0,25\\times 8}_{=2}\\times \\underbrace{${texNombre(b, 1)}\\times 10}_{=${texNombre(b * 10, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            }
          } else {
            reponse = (randint(1, 9) * 10 + randint(1, 9)) * 10
            b = reponse / 100
            if (choice([true, false])) {
              texte = ` $0,25\\times ${texNombre(b, 1)}\\times 4\\times 100=$`
              texteCorr = `$0,25\\times ${texNombre(b, 1)}\\times 4\\times 100=\\underbrace{0,25\\times 4}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 100}_{=${texNombre(b * 100, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            } else {
              texte = ` $${texNombre(b, 1)}\\times 4\\times 100\\times 0,25= $`
              texteCorr = `$${texNombre(b, 1)}\\times 4\\times 100\\times 0,25=\\underbrace{0,25\\times 4}_{=1}\\times \\underbrace{${texNombre(b, 1)}\\times 100}_{=${texNombre(b * 100, 0)}}=${miseEnEvidence(texNombre(reponse, 0))}$`
            }
          }
          if (this.interactif) {
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 13:
          a = randint(14, 29, 20)
          b = choice([a - 10, a - 1, a - 2])
          reponse = a ** 2 - b ** 2
          texte = `$${a}^2-${b}^2=$`
          texteCorr = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${a}$ et $b=${b}$.<br>
            $${a}^2-${b}^2=(${a}-${b})(${a}+${b})=${a - b}\\times ${a + b}=${miseEnEvidence(reponse)}$ `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          nbChamps = 1

          break

        case 14:
          choix = choice(['a', 'b', 'c', 'd', 'e', 'f', 'g']) //, 'b', 'c', 'd','e'
          if (choix === 'a') {
            texte = `Vrai ou faux<br>
         Le volume d'un cube est proportionnel à la longueur de son arête.`
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `Le volume d'un cube d'arête $c$ est donné par $c^3$. <br>
              Si on double la longueur de l'arête, le volume du cube n'est pas multiplié par $2$. Il est multiplié par $2^3$, soit $8$. <br>
              Ces deux grandeurs ${texteEnCouleurEtGras('ne sont pas proportionnelles')}. `
          } else if (choix === 'b') {
            texte = `Vrai ou faux<br>
         L'aire d'un disque est proportionnelle à son rayon.`
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `L'aire d'un disque de rayon $r$ est donnée par${sp()}: $\\pi\\times r^2$. <br>
              Si on double la longueur du rayon, l'aire du disque n'est pas multiplée par $2$. Elle est multiplié par $2^2$, soit $4$. <br>
              Ces deux grandeurs ${texteEnCouleurEtGras('ne sont pas proportionnelles')}. `
          } else if (choix === 'c') {
            texte = `Vrai ou faux<br>
         L'aire d'un rectangle de largeur constante est proportionnelle à sa longueur.`
            handleAnswers(this, index, {
              reponse: { value: ['V', 'v'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `L'aire d'un rectangle de largeur constante $l$ et de longueur $L$ est donnée par${sp()}: $L\\times l$. <br>
              Si on multiplie la longueur par $k$, l'aire du nouveau rectangle est alors${sp()}: $l\\times k\\times L$. Elle est donc aussi multipliée par $k$. <br>
                        Ces deux grandeurs ${texteEnCouleurEtGras('sont donc proportionnelles')}. `
          } else if (choix === 'd') {
            const n = randint(13, 35)
            a = randint(4, 6)
            texte = `Vrai ou faux<br>
         Je suis allé $${n}$ fois à la piscine. Le prix de l'entrée est $${a}$ euros.<br>
         Pour obtenir le prix total payé, le calcul est${sp()}: $${n}\\times ${a}$.<br>
         Le prix et le nombre d'entrées à la piscine sont proportionnels.`
            handleAnswers(this, index, {
              reponse: { value: ['V', 'v'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `Si on va $k$ fois plus de fois à la piscine, le prix payé est $k$ fois plus important (il est égal à $${n}\\times ${a}\\times k$).<br>
                        Ces deux grandeurs ${texteEnCouleurEtGras('sont donc proportionnelles')}. `
          } else if (choix === 'e') {
            const n = randint(13, 35)
            a = randint(4, 6)
            b = randint(25, 40)
            texte = `Vrai ou faux<br>
         Je suis allé $${n}$ fois à la piscine. Le prix de l'entrée est $${a}$ euros et l'abonnement est $${b}$ euros.<br>
         Pour obtenir le prix total payé, le calcul est${sp()}: $${n}\\times ${a}+${b}$.<br>
         Le prix et le nombre d'entrées à la piscine sont proportionnels.`
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `Si on va $k$ fois plus de fois à la piscine, le prix payé n'est pas $k$ fois plus important (il est égal à $${n}\\times ${a}\\times k +${b}$).<br>
                        Ces deux grandeurs ${texteEnCouleurEtGras('sont donc proportionnelles')}. `
          } else if (choix === 'f') {
            texte = `Vrai ou faux<br>
         Le périmètre d'un rectangle est proportionnel à la longueur de ce rectangle.`
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `Le périmètre d'un rectangle de largeur $l$ et de longueur $L$ est donnée par${sp()}: $2\\times (L+ l)$. <br>
              Si on multiplie la longueur par $k$, l'aire du nouveau rectangle est alors${sp()}: $2\\times (L\\times k+ l)$. Elle n'est donc pas multipliée par $k$. <br>
                        Ces deux grandeurs ${texteEnCouleurEtGras('ne sont donc pas proportionnelles')}. `
          } else {
            texte = `Vrai ou faux<br>
         Le périmètre d'un carré est proportionnel à la longueur de son côté.`
            handleAnswers(this, index, {
              reponse: { value: ['V', 'v'], options: { texteAvecCasse: true } },
            })
            if (this.interactif) {
              texte += `<br>Pour Vrai, écrire V et pour Faux${sp()}: F`
              texte += ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
            }
            texteCorr = `Le périmètre d'un carré de côté $c$ est donné par${sp()}: $4\\times c$.<br>
              Si on multiplie la longueur de son côté par $k$, le périmètre du nouveau carré est alors${sp()}: $4\\times\\times k$. Le périmètre est donc aussi multiplié par $k$. <br>
              Ces deux grandeurs ${texteEnCouleurEtGras('sont donc proportionnelles')}. `
          }
          nbChamps = 1
          break

        case 15:
          a = randint(11, 49, [20, 30, 40])
          f = new FractionEtendue(a, 100)
          reponse = arrondi(1 - a / 100)

          texte = `Donner l'écriture décimale de $1-${f.texFraction}$.
             `
          texteCorr = `$1-${f.texFraction}=1-${texNombre(a / 100, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 16:
          choix = choice(['a', 'b']) //, 'b', 'c'
          if (choix === 'a') {
            a = randint(11, 39, [10, 20, 30]) + randint(1, 9) / 10

            reponse = arrondi(a * 1000)
            texte = `$${texNombre(a, 1)}\\text{ m}^3=$`

            texteCorr = `$1\\text{ m}^3 = ${texNombre(1000)}$ L, donc $${texNombre(a, 1)}\\text{ m}^3=${texNombre(a, 1)}\\times ${texNombre(1000)}$ L $ =$ $${miseEnEvidence(texNombre(a * 1000, 1))}$ L`
          } else {
            a =
              randint(11, 39, [10, 20, 30]) +
              randint(11, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]) / 100

            reponse = a * 1000
            texte = `$${texNombre(a, 2)}\\text{ m}^3=$`

            texteCorr = `$1\\text{ m}^3 = ${texNombre(1000)}$ L, donc $${texNombre(a, 2)}\\text{ m}^3=${texNombre(a, 2)}\\times ${texNombre(1000)}$ L $ =$ $${miseEnEvidence(texNombre(a * 1000, 2))}$ L`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: 'L',
              },
            )
          } else {
            texte += ' $\\ldots$ L'
          }
          nbChamps = 1
          break

        case 17:
          {
            const m = randint(-7, 7, 0)
            const x = randint(1, 7)
            p = randint(-7, 7, 0)
            reponse = x
            texte = `Déterminer l'antécédent de $${m * x + p}$ par la fonction $f$ définie par $f(x)=${reduireAxPlusB(m, p)}$.`
            texteCorr = `L'antécédent de $${m * x + p}$ par la fonction est la solution de l'équation $f(x)=${m * x + p}$.<br>
          $\\begin{aligned}
          ${reduireAxPlusB(m, p)}&=${m * x + p}\\\\
         ${rienSi1(m)}x&=${m * x}\\\\
                              x&=${x}
         \\end{aligned}$<br>
          $${reduireAxPlusB(m, p)}=${m * x + p}$ a pour solution $${x}$ donc l'antécédent de $${m * x + p}$ par $f$ est $${miseEnEvidence(x)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
          }

          break

        case 18:
          choix = choice(['a', 'b', 'c'])
          if (choix === 'a') {
            a = choice([40, 60, 80, 100, 120])
            const h = randint(1, 3)
            reponse = arrondi(a * h + a / 4)
            texte = `Quelle est la distance parcourue en $${h}$ h $15$ min à $${a}\\text{ km/h}$${sp()}?
        `
            texteCorr = `Dans une heure, il y a $4\\times 15$ minutes. <br>Ainsi en $15$ minutes, la distance parcourue est $${a}\\div 4=${a / 4}\\text{ km}$.<br>
            Donc en $${h}$ h $15$ min, la distance parcourue est $(${a * h}+${a / 4})\\text{ km}$, soit $${miseEnEvidence(a * h + a / 4)}\\text{ km}$.
            `
          } else if (choix === 'b') {
            a = choice([60, 90, 120])
            const h = randint(1, 3)
            reponse = arrondi(a * h + a / 6)
            texte = `Quelle est la distance parcourue en $${h}$ h $10$ min à $${a}\\text{ km/h}$${sp()}?
                      `
            texteCorr = `Dans une heure, il y a $6\\times 10$ minutes. <br>Ainsi en $10$ minutes, la distance parcourue est $${a}\\div 6=${a / 6}\\text{ km}$. <br>
            Donc en $${h}$ h $10$ min, la distance parcourue est $(${a * h}+${a / 6})\\text{ km}$, soit $${miseEnEvidence(a * h + a / 6)}\\text{ km}$. `
          } else {
            a = choice([30, 60, 90, 120])
            const h = randint(1, 3)
            reponse = arrondi(a * h + a / 3)
            texte = `Quelle est la distance parcourue en $${h}$ h $20$ min à $${a}\\text{ km/h}$${sp()}?
            `
            texteCorr = `Dans une heure, il y a $3\\times 20$ minutes. <br>Ainsi en $20$ minutes, la distance parcourue est $${a}\\div 3=${a / 3}\\text{ km}$.<br>
            Donc en $${h}$ h $20$ min, la distance parcourue est $(${a * h}+${a / 3})\\text{ km}$, soit $${miseEnEvidence(a * h + a / 3)}\\text{ km}$. `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ km}$' },
            )
          }
          nbChamps = 1
          break

        case 19:
          a = randint(3, 12) * 10
          b = choice([10, 20, 30, 40])
          d = b / 100
          reponse = arrondi(a - a * d)

          texte = `Le prix d'un manteau est $${a}$ €. Il baisse de $${b}$ $\\%$.<br>
          Quel est son nouveau prix${sp()}?
          `
          texteCorr = ` $${b}$ $\\%$ de $${a}=${texNombre(d, 1)}\\times ${a}= ${texNombre(a * d, 0)}$.<br>
          Le prix du manteau après la réduction est donc${sp()}: $${a}-${texNombre(a * d, 0)}=${miseEnEvidence(texNombre(reponse, 0))}$ €. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              ) + '€'
          }
          nbChamps = 1
          break

        case 20:
          {
            a = randint(1, 9)
            b = randint(1, 9)
            const k = randint(1, 4)
            c = a + k
            d = b + randint(2, 4) * k
            texte = `Dans un repère du plan, on considère les points $C(${a};${b})$ et $D(${c};${d})$.<br>
            Calculer le coefficient directeur de la droite $(CD)$.
        `
            texteCorr = ` Le coefficient directeur de la droite $(CD)$ est donné par${sp()}:<br>
             $\\dfrac{y_D-y_C}{x_D-x_C}=\\dfrac{${d}-${b}}{${c}-${a}}=${miseEnEvidence((d - b) / (c - a))}$.
            `
            reponse = new FractionEtendue(d - b, c - a)
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            }
            nbChamps = 1
          }

          break

        case 21:
          {
            const triplet = [
              [3, 4, 5],
              [6, 8, 10],
            ]
            const a = choice(triplet)
            const C = pointAbstrait(0, 0, 'C', 'below')
            const A = pointAbstrait(2, 0, 'A', 'below')
            const B = pointAbstrait(2, 3, 'B', 'above')
            const pol = polygoneAvecNom(A, B, C)
            const objets = []
            choix = choice(['a', 'b', 'c'])
            let longueurATrouver = ''
            if (choix === 'a') {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[0])} cm`,
                  milieu(A, C).x,
                  milieu(A, C).y - 0.3,
                ),
                texteParPosition(
                  `${stringNombre(a[2])} cm`,
                  milieu(B, C).x - 0.6,
                  milieu(B, C).y,
                ),
                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[1]
              texte = 'Calculer la longueur $AB$. <br>'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$${sp()}:<br>
              On a $AB^2=BC^2-AC^2$, soit $AB^2=${a[2]}^2-${a[0]}^2=${a[2] ** 2 - a[0] ** 2}$.<br>
              Par conséquent, $AB=${miseEnEvidence(a[1])}$.`
              longueurATrouver = 'AB'
            } else if (choix === 'b') {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[1])} cm`,
                  milieu(A, B).x + 0.6,
                  milieu(A, B).y,
                ),
                texteParPosition(
                  `${stringNombre(a[2])} cm`,
                  milieu(B, C).x - 0.6,
                  milieu(B, C).y,
                ),
                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[0]
              texte = 'Calculer la longueur $AC$. <br>'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$${sp()}:<br>
                On a $AC^2=BC^2-AB^2$, soit $AC^2=${a[2]}^2-${a[1]}^2=${a[2] ** 2 - a[1] ** 2}$.<br>
                Par conséquent, $AC=${miseEnEvidence(a[0])}$.`
              longueurATrouver = 'AC'
            } else {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[1])} cm`,
                  milieu(A, B).x + 0.5,
                  milieu(A, B).y,
                ),
                texteParPosition(
                  `${stringNombre(a[0])} cm`,
                  milieu(A, C).x,
                  milieu(A, C).y - 0.3,
                ),
                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[2]
              texte = 'Calculer la longueur $BC$. <br>'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$${sp()}:<br>
                  On a $BC^2=AB^2+AC^2$, soit $BC^2=${a[0]}^2+${a[1]}^2=${a[0] ** 2 + a[1] ** 2}$.<br>
                  Par conséquent, $BC=${miseEnEvidence(a[2])}$.`
              longueurATrouver = 'BC'
            }
            texte += mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                fixeBordures(objets),
              ),
              objets,
            )

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += `<br>$${longueurATrouver}=$`
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$\\text{ cm}$',
                },
              )
            }
            nbChamps = 1
          }
          break

        case 22:
          {
            const c = choice([true, false])
            choix = choice(['a', 'b', 'c', 'd'])
            if (choix === 'a') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l’évènement${sp()}: «${sp()}On obtient au moins une fois ${c ? 'pile' : 'face'}${sp()}»${sp()}?`
              texteCorr = `Il y a $4$ issues équiprobables${sp()}: $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
            Il y a $3$ issues qui comportent au moins une fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est${sp()}: $${miseEnEvidence(`\\dfrac{3}{4}`)}$.`
              reponse = new FractionEtendue(3, 4)
            } else if (choix === 'b') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l’évènement${sp()}: «${sp()}On obtient au plus une fois ${c ? 'pile' : 'face'}${sp()}»${sp()}?`
              texteCorr = `Il y a $4$ issues équiprobables${sp()}: $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
            Il y a $3$ issues qui comportent au plus une fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est${sp()}: $${miseEnEvidence(`\\dfrac{3}{4}`)}$.`
              reponse = new FractionEtendue(3, 4)
            } else if (choix === 'c') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l’évènement${sp()}: «${sp()}On obtient une seule fois ${c ? 'pile' : 'face'}${sp()}»${sp()}?`
              texteCorr = `Il y a $4$ issues équiprobables${sp()}: $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
            Il y a $2$ issues qui comportent une seule fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est${sp()}: $${miseEnEvidence(`\\dfrac{1}{2}`)}$.`
              reponse = new FractionEtendue(1, 2)
            } else {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l’évènement${sp()}: «${sp()}On obtient deux fois ${c ? 'piles' : 'faces'}${sp()}»${sp()}?`
              texteCorr = `Il y a $4$ issues équiprobables${sp()}: $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
            Il y a $1$ issue qui comporte deux fois ${c ? 'piles' : 'faces'}. Ainsi, la probabilité cherchée est${sp()}: $${miseEnEvidence(`\\dfrac{1}{4}`)}$.`
              reponse = new FractionEtendue(1, 4)
            }
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            }
            nbChamps = 1
          }

          break

        case 23:
          choix = choice(['a', 'b', 'c', 'd'])
          if (choix === 'a') {
            const g = choice([3, 5, 7])
            const k = choice([2, 3])
            const c = choice([true, false])
            reponse = c ? g * k : 4 * k
            texte = `Dans une classe de troisième, le ratio filles${sp()}: garçons est de $4$${sp()}: $${g}$. <br>
            Il y a dans cette classe ${c ? `$${4 * k}$ filles` : `$${g * k}$ garçons`}. Calculer le nombre de ${c ? 'garçons ' : 'filles'}.`
            texteCorr = `Le ratio $4$${sp()}: $${g}$ signifie qu'il y a dans cette classe $4$ filles pour $${g}$ garçons.<br>
            Comme il y a ${c ? `$4\\times ${k}$ filles` : `$${g}\\times ${k}$ garçons`}, le nombre de ${c ? 'garçons ' : 'filles'} est $${c ? `${g}\\times ${k} ` : `4\\times ${k} `} =${miseEnEvidence(reponse)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          } else if (choix === 'b') {
            const g = choice([3, 5, 7])
            const k = choice([2, 3, 4])
            const c = choice([true, false])
            reponse = c ? g * k : 2 * k
            texte = `Dans une classe de troisième, le ratio filles${sp()}: garçons est de $2$${sp()}: $${g}$. <br>
            Il y a dans cette classe ${c ? `$${2 * k}$ filles` : `$${g * k}$ garçons`}. Calculer le nombre de ${c ? 'garçons ' : 'filles'}.`
            texteCorr = `Le ratio $2$${sp()}: $${g}$ signifie qu'il y a dans cette classe $2$ filles pour $${g}$ garçons.<br>
            Comme il y a ${c ? `$2\\times ${k}$ filles` : `$${g}\\times ${k}$ garçons`}, le nombre de ${c ? 'garçons ' : 'filles'} est $${c ? `${g}\\times ${k} ` : `2\\times ${k} `} =${miseEnEvidence(reponse)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          } else if (choix === 'c') {
            const g = choice([3, 5, 7])
            const k = choice([2, 3, 4])
            const c = choice([true, false])
            const reponse1 = c ? g * k : 2 * k
            reponse = g * k + 2 * k
            texte = `Dans une classe de troisième, le ratio filles${sp()}: garçons est de $2$${sp()}: $${g}$. <br>
            Il y a dans cette classe ${c ? `$${2 * k}$ filles` : `$${g * k}$ garçons`}. Calculer le nombre total d'élèves dans cette classe.`
            texteCorr = `Le ratio $2$${sp()}: $${g}$ signifie qu'il y a dans cette classe $2$ filles pour $${g}$ garçons.<br>
            Comme il y a ${c ? `$2\\times ${k}$ filles` : `$${g}\\times ${k}$ garçons`}, le nombre de ${c ? 'garçons ' : 'filles'} est $${c ? `${g}\\times ${k} ` : `2\\times ${k} `} =${reponse1}$.<br>
            Il y a donc dans cette classe $${miseEnEvidence(reponse)}$ élèves au total.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          } else {
            const g = choice([3, 5, 7])
            const k = choice([2, 3])
            const c = choice([true, false])
            const reponse1 = c ? g * k : 4 * k
            reponse = g * k + 4 * k
            texte = `Dans une classe de troisième, le ratio filles${sp()}: garçons est de $4$${sp()}: $${g}$. <br>
            Il y a dans cette classe ${c ? `$${4 * k}$ filles` : `$${g * k}$ garçons`}. Calculer le nombre total d'élèves dans cette classe.`
            texteCorr = `Le ratio $4$${sp()}: $${g}$ signifie qu'il y a dans cette classe $4$ filles pour $${g}$ garçons.<br>
            Comme il y a ${c ? `$4\\times ${k}$ filles` : `$${g}\\times ${k}$ garçons`}, le nombre de ${c ? 'garçons ' : 'filles'} est $${c ? `${g}\\times ${k} ` : `4\\times ${k} `} =${reponse1}$.<br>
            Il y a donc dans cette classe $${miseEnEvidence(reponse)}$ élèves au total.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          nbChamps = 1
          break

        case 24:
          choix = choice(['a', 'b'])
          if (choix === 'a') {
            let listeFacteurs24 = [2, 3, 5, 7]
            listeFacteurs24 = shuffle(listeFacteurs24)

            reponse = `${listeFacteurs24[0]}\\times${listeFacteurs24[1]}\\times ${listeFacteurs24[2]}`

            texte = `Décomposer $${listeFacteurs24[0] * listeFacteurs24[1] * listeFacteurs24[2]}$ en produit de facteurs premiers.`

            texteCorr = `$${listeFacteurs24[0] * listeFacteurs24[1] * listeFacteurs24[2]}=${miseEnEvidence(`${listeFacteurs24[0]}\\times ${listeFacteurs24[1]}\\times ${listeFacteurs24[2]}`)}$`
          } else {
            let listeFacteurs24 = [2, 3, 5]
            listeFacteurs24 = shuffle(listeFacteurs24)
            while (listeFacteurs24[0] ** 2 * listeFacteurs24[1] ** 2 > 190) {
              // listeFacteurs24 = [2, 2, 3, 5] // Sinon, on peut avoir 2^4 et la correction ne fonctionne pas.
              listeFacteurs24 = shuffle(listeFacteurs24)
            }
            reponse = [
              `${listeFacteurs24[0]}\\times${listeFacteurs24[0]}\\times${listeFacteurs24[1]}\\times${listeFacteurs24[1]}`,
              `${listeFacteurs24[1]}^2\\times${listeFacteurs24[0]}^2`,
            ]
            texte = `Décomposer $${listeFacteurs24[0] * listeFacteurs24[0] * listeFacteurs24[1] * listeFacteurs24[1]}$ en produit de facteurs premiers.`

            texteCorr = `$${listeFacteurs24[0] * listeFacteurs24[0] * listeFacteurs24[1] * listeFacteurs24[1]}=${listeFacteurs24[0]}\\times ${listeFacteurs24[0]}\\times ${listeFacteurs24[1]}\\times ${listeFacteurs24[1]}=${miseEnEvidence(`${listeFacteurs24[0]}^2\\times ${listeFacteurs24[1]}^2`)}$`
          }

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { expressionNumerique: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          }
          nbChamps = 1

          break

        case 25:
          choix = choice(['a', 'b'])
          if (choix === 'a') {
            a = randint(2, 9)
            b = randint(3, 12)
            reponse = [`(${a}x)^2+${b}`, `${a ** 2}x^2+${b}`]
            texte = `Écrire sous la forme d'une expression littérale${sp()}: <br>
          La somme du carré de $${a}x$ et de $${b}$.
      `

            texteCorr = `Le carré de $${a}x$ est $(${a}x)^2=${a ** 2}x^2$. On en déduit que la somme du carré de $${a}x$ et de $${b}$ s'écrit $${miseEnEvidence(`${a ** 2}x^2+${b}`)}$. `
          } else {
            a = randint(2, 5)
            b = randint(2, 4)
            reponse = [`(${a}x)^2\\times${b}`, `${a ** 2 * b}x^2`]
            texte = `Écrire sous la forme d'une expression littérale${sp()}: <br>
            Le produit du carré de $${a}x$ et de $${b}$.
        `

            texteCorr = `Le carré de $${a}x$ est $(${a}x)^2=${a ** 2}x^2$. On en déduit que le produit du carré de $${a}x$ et de $${b}$ s'écrit $${a ** 2}x^2\\times ${b}=${miseEnEvidence(`${a ** 2 * b}x^2`)}$. `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.lyceeClassique,
            )
          }
          nbChamps = 1
          break

        case 26:
          a = choice([125, 225, 325, 425]) / 100
          b = randint(1, 5) * 4
          reponse = arrondi(a * b)
          texte = `$${texNombre(a, 2)}\\times ${b}=$`
          texteCorr = `
          $${texNombre(a, 2)}\\times ${b}=(${texNombre(a - 0.25, 0)}+0,25)\\times 4\\times ${texNombre(b / 4, 0)}=(${texNombre(4 * a - 1, 0)}+1)\\times ${texNombre(b / 4, 0)}=${miseEnEvidence(reponse)}$ `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          nbChamps = 1
          break

        case 27:
          a = randint(1, 100)
          c = randint(1, 10)
          while (c ** 2 - a < 0) {
            a = randint(1, 100)
            c = randint(1, 10)
          }
          reponse = -c
          texte = `Quelle est la solution négative de $x^2-${a}=${c ** 2 - a}$${sp()}?`
          texteCorr = `L'équation $x^2-${a}=${c ** 2 - a}$ est équivalente à $x^2=${c ** 2}$.<br>
          Cette équation a deux solutions $${-c}$ et $${c}$. La solution négative est donc $${miseEnEvidence(-c)}$.
          `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          nbChamps = 1
          break

        case 28:
          {
            a = randint(1, 5) * 2 + 1 // AE
            const k = choice([3, 5]) / 2
            b = a + 1 // BE
            c = k * b // CE
            d = k * a // DE
            const A = pointAbstrait(6, 0, 'A', 'above right')
            const D = pointAbstrait(0.46, 2.92, 'D', 'above left')
            const E = pointAbstrait(4, 1, 'E', 'below')
            const B = pointAbstrait(6.22, 2, 'B', 'above right')
            const C = pointAbstrait(0, -1, 'C', 'left')
            const xmin = -1
            const ymin = -1.5
            const xmax = 7.5
            const ymax = 4
            const objets: NestedObjetMathalea2dArray = []
            objets.push(
              texteParPosition(
                `${stringNombre(a)}`,
                milieu(A, E).x,
                milieu(A, E).y - 0.3,
              ),
              texteParPosition('?', milieu(E, D).x, milieu(E, D).y + 0.5),
              texteParPosition(
                `${stringNombre(b)}`,
                milieu(B, E).x,
                milieu(B, E).y + 0.2,
              ),
              texteParPosition(
                `${stringNombre(c)}`,
                milieu(E, C).x,
                milieu(C, E).y - 0.5,
              ),
              labelPoint(A, B, C, D, E),
              droite(B, C),
              droite(D, A),
              droite(C, D),
              droite(A, B),
            )
            reponse = d
            texte = `$(AB)${symboleParallele()}(CD)$<br><br>
          `
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 25,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.8,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Le triangle $ECD$ est un agrandissement du triangle $EAB$. La longueur $EC$ est $${texNombre(k, 1)}$ fois plus grande que la longueur $EB$.
          On en déduit que la longueur $DE$ est $${texNombre(k, 1)}$ fois plus grande que la longueur $AE$.<br>
          Ainsi, $DE=${texNombre(k, 1)}\\times ${a}=${miseEnEvidence(texNombre(reponse, 1))}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$DE=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            } else {
              texte += '$DE=$ $\\ldots$ '
            }

            nbChamps = 1
          }

          break

        case 29:
          choix = choice(['a', 'a', 'b', 'b', 'c'])
          if (choix === 'a') {
            a = randint(2, 10)
            b = a * 4
            reponse = new FractionEtendue(1, 2)
            texte = `Soit une figure d'aire $${b}\\text{ cm}^2$.<br>
            Après une réduction, on obtient une figure d'aire $${a}\\text{ cm}^2$.<br>
            Quel est le rapport de réduction${sp()}?`

            texteCorr = `Dans un agrandissement/réduction, quand les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$.<br>
            Ici, l'aire a été divisée par $4$, soit multipliée par $\\dfrac{1}{4}$. <br>
            On en déduit que le coefficient de réduction est $${miseEnEvidence(`\\dfrac{1}{2}`)}$. `
          } else if (choix === 'b') {
            a = randint(2, 10)
            b = a * 9
            reponse = new FractionEtendue(1, 3)
            texte = `Soit une figure d'aire $${b}\\text{ cm}^2$.<br>
            Après une réduction, on obtient une figure d'aire $${a}\\text{ cm}^2$.<br>
            Quel est le rapport de réduction${sp()}?`

            texteCorr = `Dans un agrandissement/réduction, quand les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$.<br>
            Ici, l'aire a été divisée par $9$, soit multipliée par $\\dfrac{1}{9}$. <br>
            On en déduit que le coefficient de réduction est $${miseEnEvidence(`\\dfrac{1}{3}`)}$. `
          } else {
            a = randint(1, 5)
            b = a * 16
            reponse = new FractionEtendue(1, 4)
            texte = `Soit une figure d'aire $${b}\\text{ cm}^2$.<br>
            Après une réduction, on obtient une figure d'aire $${a}\\text{ cm}^2$.<br>
            Quel est le rapport de réduction${sp()}?`

            texteCorr = `Dans un/une agrandissement/réduction, quand les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$.<br>
            Ici, l'aire a été divisée par $16$, soit multipliée par $\\dfrac{1}{16}$. <br>
            On en déduit que le coefficient de réduction est $${miseEnEvidence(`\\dfrac{1}{4}`)}$. `
          }
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          }

          nbChamps = 1
          break

        case 30:
          {
            a = 0
            b = randint(50, 300)
            const q = randint(2, 5)
            texte = `On considère le script python${sp()}: <br>
            $\\begin{array}{|l|}
\\hline\\\\
\\texttt{def fin(b):}\\\\
${sp(6)} \\texttt{a=0}\\\\
${sp(6)} \\texttt{while a < b:}\\\\
${sp(12)} \\texttt{a=a+${q}}\\\\
${sp(6)} \\texttt{return a}\\\\
\\hline
\\end{array}$
<br>`
            texte += `Que renvoie l'instruction $\\texttt{fin(${b})}$${sp()}?`
            texteCorr = ` L'instruction $\\texttt{while a < ${b}}$ signifie${sp()}: tant que $a<${b}$.<br>
          On a au départ $a=0$ et l'algorithme s'arrête lorsque $a$ dépasse $${b}$. La valeur retournée est donc le plus petit multiple de $${q}$ supérieur ou égal à $${b}$.`

            while (a < b) {
              a = q + a
            }
            texteCorr += ` Donc l'algorithme retourne $${miseEnEvidence(a)}$. `
            reponse = a
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
          }

          break
      }

      if (
        this.questionJamaisPosee(
          i,
          a,
          b,
          c,
          reponse instanceof FractionEtendue
            ? reponse.texFraction
            : Array.isArray(reponse)
              ? reponse.toString()
              : reponse,
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index += nbChamps
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
