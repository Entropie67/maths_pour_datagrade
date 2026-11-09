import { orangeMathalea } from '../../../lib/colors'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { pgcd } from '../../../lib/outils/primalite'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { codageSegment } from '../../../lib/2d/CodageSegment'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionReduite,
} from '../../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { sp } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import {
  besoinFormulaireChoixQuestionsCan,
  numerosQuestionsCan,
} from '../../../lib/outils/choixQuestionsCan'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import FractionEtendue from '../../../modules/FractionEtendue'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'

export const titre = 'S’entraîner avec le sujet CAN Seconde 2021'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '05/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora
 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = '1f0cd'

export const refs = {
  'fr-fr': ['can2a-2021'],
  'fr-ch': ['NR'],
}
export default class SujetCAN2021Seconde extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 30
    this.besoinFormulaireTexte = besoinFormulaireChoixQuestionsCan
    this.sup = ''

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante :<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.<br>
  Le paramètre « Choix des questions » permet de ne retenir que certaines questions du sujet officiel, dans l’ordre souhaité (par exemple 1-5-12).`
  }

  nouvelleVersion() {
    const nbQ1 = Math.min(Math.round((this.nbQuestions * 8) / 30), 8) // Choisir d'un nb de questions de niveau 1 parmi les 8 possibles.
    const nbQ2 = Math.min(this.nbQuestions - nbQ1, 22)
    const typeQuestionsDisponiblesNiv1 = shuffle([1, 2, 3, 4, 5, 6, 8, 9])
      .slice(-nbQ1)
      .sort(compareNombres)
    const typeQuestionsDisponiblesNiv2 = shuffle([
      7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30,
    ])
      .slice(-nbQ2)
      .sort(compareNombres)
    const typeQuestionsDisponibles = numerosQuestionsCan(
      this,
      typeQuestionsDisponiblesNiv1.concat(typeQuestionsDisponiblesNiv2),
    )

    const listeFractions3 = [
      [1, 3, 1, 5],
      [1, 7, 1, 2],
      [1, 4, 1, 3],
      [1, 2, 1, 5],
      [1, 9, 1, 2],
      [1, 7, 1, 4],
      [1, 11, 1, 2],
      [1, 5, 1, 6],
      [1, 10, 1, 3],
      [1, 3, 1, 8],
      [1, 9, 1, 4],
      [1, 5, 1, 9],
      [1, 7, 1, 10],
      [1, 6, 1, 7],
    ]
    const listeFractions7 = [
      [1, 5, 3, 2],
      [2, 5, 1, 3],
      [1, 5, 2, 3],
      [1, 3, 5, 2],
      [1, 3, 5, 4],
    ]

    const listeFractions15 = [
      [5, 3],
      [7, 9],
      [3, 7],
      [5, 7],
      [9, 7],
      [2, 9],
      [4, 7],
      [11, 5],
      [11, 3],
    ]

    for (let i = 0, index = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let p = 0
      let c = 0
      let d = 0
      let k = 0
      let nbChamps = 1
      let texte = ''
      let texteCorr = ''
      let reponse: number | string | string[] | number[] | FractionEtendue = 0
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(2, 9)

          texte = `$${a} \\times 99=$ `
          texteCorr = `$${a} \\times 99=${a}\\times 100-${a}=${miseEnEvidence(a * 99)}$`
          reponse = a * 99
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1

          break

        case 2:
          a = randint(1, 9) * 10
          p = randint(2, 9, 5) * 10
          reponse = (a * p) / 100
          texte = `$${p}\\,\\%$ de $${a}= $`

          texteCorr = ` Prendre $${p}\\,\\%$ de $${a}$ revient à prendre $${p / 10}\\times 10\\,\\%$ de $${a}$.<br>
            Comme $10\\,\\%$ de $${a}$ vaut $${a / 10}$ (pour prendre $10\\,\\%$ d'une quantité, on la divise par $10$), alors
            $${p}\\,\\%$ de $${a}=${p / 10}\\times ${a / 10}=${miseEnEvidence(reponse)}$.
           `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 3:
          {
            const a = choice(listeFractions3)
            const b = fraction(a[0], a[1])
            const c = fraction(a[2], a[3])

            texte = `$${b.texFraction} + ${c.texFraction}=$
             `
            texteCorr = `Pour additionner des fractions, on les met au même dénominateur.<br>
  
             Ainsi, $${b.texFraction} + ${c.texFraction}
             =\\dfrac{${b.n}\\times${c.d}}{${b.d}\\times${c.d}}+ \\dfrac{${c.n}\\times${b.d}}{${b.d}\\times${c.d}}
             =\\dfrac{${b.n * c.d}+${c.n * b.d}}{${c.d * b.d}}=${miseEnEvidence(`\\dfrac{${b.n * c.d + c.n * b.d}}{${b.d * c.d}}`)}$.`

            reponse = fraction(b.n * c.d + c.n * b.d, b.d * c.d)
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true },
              },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            } else {
              texte += '$\\ldots$'
            }
            nbChamps = 1
          }

          break
        case 4:
          a = randint(1, 10)
          b = a * a

          texte = `$\\sqrt{${b}}=$
               `
          texteCorr = `$\\sqrt{${b}}$ est le nombre positif dont le carré vaut $${b}$. Comme $${a}^2=${b}$, alors $\\sqrt{${b}}=${miseEnEvidence(a)}$.`

          reponse = a
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break
        case 5:
          a = randint(3, 15)
          b = choice([15, 30])

          texte = `Si l'on parcourt $${a}\\text{ km}$ en $${b}$ min, la vitesse moyenne est de
             `
          if (b === 15) {
            texteCorr = `$15$ min est le quart d'une heure. Donc la vitesse moyenne est $${a}\\times 4=${miseEnEvidence(4 * a)}\\text{ km/h}$.`

            reponse = a * 4
          } else {
            texteCorr = `$30$ min est la moitié d'une heure. Donc la vitesse moyenne est $${a}\\times 2=${miseEnEvidence(2 * a)}\\text{ km/h}$.`

            reponse = a * 2
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              ) + 'km/h'
          } else {
            texte += '$\\ldots\\text{ km/h}$'
          }
          nbChamps = 1
          break

        case 6:
          a = randint(-9, -1)
          b = randint(2, 9)
          reponse = a ** 2 + b

          texte = `Calculer $x^2+${b}$ pour $x=${a}$.
               `
          texteCorr = `Pour $x=${a}$, $x^2+${b}=(${a})^2+${b}=${a ** 2}+${b}=${miseEnEvidence(reponse)}$.`

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

        case 7:
          {
            const a = choice(listeFractions7)
            const b = fraction(a[0], a[1])
            const c = fraction(a[2], a[3])
            const k1 = 3
            const k2 = 7
            texte = `$\\dfrac{${b.n * k2}}{${b.d * k1}}\\times \\dfrac{${c.n * k1}}{${c.d * k2}}=$
             `
            reponse = fraction(b.n * c.n, b.d * c.d)
            texteCorr = `$\\dfrac{${b.n * k2}}{${b.d * k1}}\\times \\dfrac{${c.n * k1}}{${c.d * k2}}=
          \\dfrac{${b.n}\\times ${k2}}{${b.d}\\times${k1}}\\times \\dfrac{${c.n}\\times ${k1}}{${c.d}\\times ${k2}}=\\dfrac{${b.n}\\times ${k2}\\times ${c.n}\\times ${k1}}{${b.d}\\times${k1}\\times ${c.d}\\times ${k2}}=${miseEnEvidence(texFractionReduite(b.n * c.n, b.d * c.d))}$`

            reponse = fraction(b.n * c.n, b.d * c.d)
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true },
              },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            } else {
              texte += '$\\ldots$'
            }
            nbChamps = 1
          }

          break

        case 8:
          a = randint(2, 5)
          reponse = randint(2, 9)
          c = randint(1, 9)
          b = c - a * reponse
          texte = `Résoudre : <br>$${a}x${ecritureAlgebrique(b)}=${c}$`
          texteCorr = `
             $\\begin{aligned}
             ${a}x${ecritureAlgebrique(b)}&=${c}\\\\
            ${a}x&=${c}${ecritureAlgebrique(-b)}\\\\
                                 x&=${miseEnEvidence(reponse)}
            \\end{aligned}$<br>
                      `
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

        case 9:
          if (choice([true, false])) {
            a = randint(2, 9)
            b = choice([-1, -2])
            texte = `Écriture décimale de : <br>
                        $10^3+${a}\\times 10^2+10^{${b}}$`
            texteCorr = `$10^3+${a}\\times 10^2+10^{${b}}=${texNombre(1000)}+${a * 100}+${texNombre(10 ** b, 2)}=${miseEnEvidence(texNombre(1000 + a * 100 + 10 ** b, 2))}$`
            reponse = 1000 + a * 100 + 10 ** b
          } else {
            a = randint(2, 9)
            b = choice([-1, -2])
            texte = `Écriture décimale de : <br>
                         $${a}\\times 10^3+ 10^2+10^{${b}}$`
            texteCorr = `$${a}\\times10^3+ 10^2+10^{${b}}=${texNombre(a * 1000)}+100+${texNombre(10 ** b, 2)}=${miseEnEvidence(texNombre(a * 1000 + 100 + 10 ** b, 2))}$`
            reponse = a * 1000 + 100 + 10 ** b
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

        case 10:
          a = randint(3, 11)
          b = randint(5, 12, a)

          reponse = 30 - a - b
          texte = `La moyenne de $${a}$ ; $${b}$ et $n$ vaut $10$.<br>
         $n=$`
          texteCorr = `
        Pour avoir une moyenne de $10$, la somme des $3$ nombres doit être égale à $30$. <br>Par conséquent $n=30-${a}-${b}=${miseEnEvidence(30 - a - b)}$.
                   `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 11:
          {
            const choix = choice(['a', 'b', 'c']) //
            if (choix === 'a') {
              a = randint(11, 39, [10, 20, 30]) / 1000
              const truc = a * 100
              reponse = `${stringNombre(truc)}\\times 10^{-2}`
              texte = `Écriture scientifique de $${texNombre(a, 3)}$`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(a, 3)}=\\underbrace{${texNombre(truc, 3)}}_{1\\leqslant ${texNombre(truc, 3)} <10}\\times 10^{-2}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 3)}\\times 10^{-2}`)}$. `
            } else if (choix === 'b') {
              a = randint(111, 399, [200, 300]) / 100000
              const truc = a * 1000
              reponse = `${stringNombre(truc)}\\times 10^{-3}`
              texte = `Écriture scientifique de $${texNombre(a, 5)}$`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici : $${texNombre(a, 5)}=\\underbrace{${texNombre(truc, 5)}}_{1\\leqslant ${texNombre(truc, 5)} <10}\\times 10^{-3}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 5)}\\times 10^{-3}`)}$. `
            } else {
              a = randint(111, 399, [200, 300]) / 1000000
              const truc = a * 10000
              reponse = `${stringNombre(truc)}\\times 10^{-4}`
              texte = `Écriture scientifique de $${texNombre(a, 6)}$`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
                Ici : $${texNombre(a, 6)}=\\underbrace{${texNombre(truc, 6)}}_{1\\leqslant ${texNombre(truc, 6)} <10}\\times 10^{-4}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 6)}\\times 10^{-4}`)}$. `
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
          }

          break

        case 12:
          a = randint(3, 99, [4, 9, 16, 25, 36, 49, 64, 81])
          reponse = Math.floor(Math.sqrt(a))
          texte = `Encadrer $\\sqrt{${a}}$ par deux entiers consécutifs :<br>
      `
          reponse = `${Math.floor(Math.sqrt(a))};${Math.floor(Math.sqrt(a)) + 1}`
          texte += `$\\ldots < \\sqrt{${a}} < \\ldots$`
          texteCorr = ` On cherche le carré parfait le plus proche de $${a}$ inférieur à $${a}$.<br>
       Comme $${Math.floor(Math.sqrt(a)) ** 2}=${Math.floor(Math.sqrt(a))}^2$, alors :
     $${miseEnEvidence(Math.floor(Math.sqrt(a)))}< \\sqrt{${a}} < ${miseEnEvidence(Math.floor(Math.sqrt(a)) + 1)}$.`

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { suiteDeNombres: true } },
          })
          if (this.interactif) {
            texte += '<br>Écrire les entiers séparés par un point-virgule.'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierFullOperations,
            )
          }

          nbChamps = 1
          break

        case 13:
          a = randint(1, 5)
          b = randint(2, 5)
          if (choice([true, false])) {
            texte = `Développer $(${b}x+${a})^2$`
            texteCorr = `On utilise l'égalité remarquable $(a+b)^2=a^2+2ab+b^2$ avec $a=${b}x$ et $b=${a}$.<br>
              $(${b}x+${a})^2=(${b}x)^2+2 \\times ${b}x \\times ${a} + ${a}^2=${miseEnEvidence(`${b * b}x^2+${2 * b * a}x+${a * a}`)}$`
            reponse = [`${b * b}x^2+${2 * b * a}x+${a * a}`]
          } else {
            texte = `Développer $(${b}x-${a})^2$`
            texteCorr = `On utilise l'égalité remarquable $(a+b)^2=a^2-2ab+b^2$ avec $a=${b}x$ et $b=${a}$.<br>
              $(${b}x-${a})^2=(${b}x)^2-2 \\times ${b}x \\times ${a} + ${a}^2=${miseEnEvidence(`${b * b}x^2-${2 * b * a}x+${a * a}`)}$`
            reponse = [`${b * b}x^2-${2 * b * a}x+${a * a}`]
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

        case 14:
          {
            const choix = choice(['a', 'b']) //, 'b', 'c'
            if (choix === 'a') {
              a = randint(11, 39, [10, 20, 30]) + randint(1, 9) / 10

              reponse = a * 1000
              texte = `$${texNombre(a, 1)}\\text{ m}^3=$`

              texteCorr = `$1\\text{ m}^3 = ${texNombre(1000)}$ L, donc $${texNombre(a, 1)}\\text{ m}^3=${texNombre(a, 1)}\\times ${texNombre(1000)}$ L$=${miseEnEvidence(texNombre(a * 1000, 1))}$ L`
            } else {
              a =
                randint(11, 39, [10, 20, 30]) +
                randint(11, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]) / 100

              reponse = a * 1000
              texte = `$${texNombre(a, 2)}\\text{ m}^3=$`

              texteCorr = `$1\\text{ m}^3 = ${texNombre(1000)}$ L, donc $${texNombre(a, 2)}\\text{ m}^3=${texNombre(a, 2)}\\times ${texNombre(1000)}$ L$=${miseEnEvidence(texNombre(a * 1000, 2))}$ L`
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + 'L'
            } else {
              texte += '$\\ldots$ L'
            }
            nbChamps = 1
          }

          break

        case 15:
          {
            const a = choice(listeFractions15)
            const b = fraction(a[0], a[1])
            const k1 = choice([3, 5, 7, 9])

            texte = `Écrire $\\dfrac{${b.n * k1}}{${b.d * k1}}$ sous forme d'une fraction irréductible.
             `

            texteCorr = `$\\dfrac{${b.n * k1}}{${b.d * k1}}=\\dfrac{${b.n}\\times ${k1}}{${b.d}\\times ${k1}}=${miseEnEvidence(`\\dfrac{${b.n}}{${b.d}}`)}$.`

            reponse = fraction(b.n, b.d).simplifie()
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionIrreductible: true },
              },
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

        case 16:
          {
            const choix = choice(['a', 'b'])
            if (choix === 'a') {
              let listeFacteurs16 = [2, 3, 5, 7]
              listeFacteurs16 = shuffle(listeFacteurs16)

              reponse = [
                `${listeFacteurs16[0]}\\times${listeFacteurs16[1]}\\times ${listeFacteurs16[2]}`,
              ]
              texte = `Décomposer $${listeFacteurs16[0] * listeFacteurs16[1] * listeFacteurs16[2]}$ en produits de facteurs premiers.`

              texteCorr = `$${listeFacteurs16[0] * listeFacteurs16[1] * listeFacteurs16[2]}=${miseEnEvidence(`${listeFacteurs16[0]}\\times ${listeFacteurs16[1]}\\times ${listeFacteurs16[2]}`)}$`
            } else {
              let listeFacteurs16 = [2, 3, 5]
              listeFacteurs16 = shuffle(listeFacteurs16)

              reponse = [
                `${listeFacteurs16[0]}\\times${listeFacteurs16[0]}\\times ${listeFacteurs16[1]}`,
                `${listeFacteurs16[0]}^2\\times ${listeFacteurs16[1]}`,
              ]
              texte = `Décomposer $${listeFacteurs16[0] * listeFacteurs16[0] * listeFacteurs16[1]}$ en produits de facteurs premiers.`

              texteCorr = `$${listeFacteurs16[0] * listeFacteurs16[0] * listeFacteurs16[1]}=${listeFacteurs16[0]}\\times ${listeFacteurs16[0]}\\times ${listeFacteurs16[1]}=${miseEnEvidence(`${listeFacteurs16[0]}^2\\times ${listeFacteurs16[1]}`)}$`
            }

            handleAnswers(this, index, {
              reponse: {
                value: reponse,
                options: { expressionNumerique: true },
              },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              )
            }
            nbChamps = 1
          }

          break

        case 17:
          a = randint(5, 99, 10) / 10
          b = randint(2, 9) * 5
          c = 100 - b
          texte = `$${b}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${c}=$
      `
          texteCorr = ` On factorise : <br> $\\begin{aligned}
      ${b}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${c}&=${texNombre(a, 1)}\\times \\underbrace{(${b}+${c})}_{=100}\\\\
      &=${texNombre(a, 1)}\\times 100\\\\
      &=${miseEnEvidence(100 * a)}
      \\end{aligned}$`
          reponse = 100 * a
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 18:
          a = randint(1, 6)
          b = randint(3, 5)
          c = randint(2, 9)
          d = randint(1, 10)
          reponse = `${texNombre((a + b) / 2, 1)};${texNombre((c + d) / 2, 1)}`
          texte = `Dans un repère du plan, on donne $A(${a};${c})$ et $B(${b};${d})$.<br>
        Déterminer les coordonnées du milieu du segment $[AB]$ (sans utiliser de fraction).`
          texteCorr = `Les coordonnées du milieu sont données par :
        $\\left(\\dfrac{${a}+${b}}{2};\\dfrac{${c}+${d}}{2}\\right)=
        \\left(\\dfrac{${a + b}}{2};\\dfrac{${c + d}}{2}\\right)=
        ${miseEnEvidence(`(${texNombre((a + b) / 2, 1)};${texNombre((c + d) / 2, 1)})`)}$.`
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { texteAvecCasse: true } },
          })
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: '$($',
                texteApres: '$)$',
              },
            )

          nbChamps = 1

          break

        case 19:
          {
            a = randint(3, 9) // CB
            const k = randint(2, 5) // coeff
            b = k * a // AC
            c = randint(1, a - 1) // EB
            d = k * c // AD
            const A = pointAbstrait(0, 4, 'A', 'above')
            const D = pointAbstrait(3.75, 4, 'D', 'above')
            const E = pointAbstrait(4, -1, 'E', 'below')
            const B = pointAbstrait(6, -1, 'B', 'below')
            const C = pointAbstrait(3.91, 0.74, 'C', 'left')
            const xmin = -1
            const ymin = -2.5
            const xmax = 7
            const ymax = 5
            const objets: NestedObjetMathalea2dArray = []
            objets.push(
              texteParPosition(
                `${stringNombre(d)} cm`,
                milieu(A, D).x,
                milieu(A, D).y + 0.3,
              ),
              texteParPosition(' ?', milieu(B, E).x, milieu(B, E).y - 0.3),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(A, C).x - 0.6,
                milieu(A, C).y,
              ),
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(C, B).x + 0.5,
                milieu(C, B).y + 0.2,
              ),
              labelPoint(A, B, C, D, E),
              segment(B, E),
              segment(D, E),
              segment(A, D),
              segment(A, B),
            )
            reponse = c
            texte = `$A$, $C$ et $B$ sont alignés, et $D$, $C$ et $E$ sont alignés. De plus, $(AD)${symboleParallele()}(EB)$.
           <br>`
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 30,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.8,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Le triangle $ACD$ est un agrandissement du triangle $EBC$. Le coefficient d'agrandissement est donné par : $\\dfrac{${b}}{${a}}=${k}$.<br>
          On obtient donc la longueur $EB$ en divisant par $${k}$ la longueur $AD$.<br>
          $EB=\\dfrac{${d}}{${k}}=${miseEnEvidence(c)}\\text{ cm}$.<br>`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$EB=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += ' $EB=\\ldots\\text{ cm}$'
            }

            nbChamps = 1
          }

          break

        case 20:
          {
            const choix = choice(['a', 'b'])
            if (choix === 'a') {
              a = randint(18, 25) * 10
              b = choice([20, 25])
              reponse = (a * 100) / b
              texte = `$${b}\\,\\%$ des élèves d'un lycée sont externes. <br>
          Il y a $${a}$ externes. Combien y a-t-il d'élèves dans ce lycée ?
      `
              texteCorr = ` Comme $100\\,\\%$ est égal à $${100 / b}$ fois $${b}\\,\\%$, alors le nombre d'élèves dans ce lycée est : $${a}\\times ${100 / b}=${miseEnEvidence(reponse)}$.`
            } else {
              a = randint(8, 15) * 10
              b = 10
              reponse = a * 10
              texte = `$${b}\\,\\%$ des élèves d'un lycée sont externes. <br>
            Il y a $${a}$ externes. Combien y a-t-il d'élèves dans ce lycée ?
        `
              texteCorr = ` Comme $100\\,\\%$ est égal à $${100 / b}$ fois $${b}\\,\\%$, alors le nombre d'élèves dans ce lycée est : $${a}\\times ${100 / b}=${miseEnEvidence(reponse)}$.`
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
          }

          break

        case 21:
          {
            const choix = choice(['a', 'b'])
            if (choix === 'a') {
              a = randint(2, 10)
              b = randint(2, 10)
              reponse = [
                `(${rienSi1(a)}x${ecritureAlgebrique(-b)})(${rienSi1(a)}x${ecritureAlgebrique(b)})`,
                `(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(a)}x${ecritureAlgebrique(-b)})`,
              ]

              texte = `Factoriser $${a ** 2}x^2-${b ** 2}$.
      `
              texteCorr = ` On reconnaît une différence de deux carrés : $a^2-b^2$ avec $a=${a}x$ et $b=${b}$.<br>
            Comme $a^2-b^2=(a-b)(a+b)$, alors $${a ** 2}x^2-${b ** 2}=${miseEnEvidence(`(${a}x-${b})(${a}x+${b})`)}$.`
            } else {
              a = randint(2, 10)
              b = randint(2, 10)
              reponse = [
                `(${b}${ecritureAlgebriqueSauf1(-a)}x)(${b}${ecritureAlgebriqueSauf1(a)}x)`,
                `(${b}${ecritureAlgebriqueSauf1(a)}x)(${b}${ecritureAlgebriqueSauf1(-a)}x)`,
              ]

              texte = `Factoriser $${b ** 2}-${a ** 2}x^2$.
      `
              texteCorr = ` On reconnaît une différence de deux carrés : $a^2-b^2$ avec $a=${b}$ et $b=${a}x$.<br>
            Comme $a^2-b^2=(a-b)(a+b)$, alors $${b ** 2}-${a ** 2}x^2=${miseEnEvidence(`(${b}-${a}x)(${b}+${a}x)`)}$.`
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
          }

          break

        case 22:
          a = randint(5, 6)
          b = randint(6, 10)
          if (choice([true, false])) {
            texte = 'Soit le script Python suivant :<br>'
            if (context.isHtml) {
              texte += '$\\begin{array}{|l|}\n'
              texte += '\\hline\n'
              texte += '\\\n \\texttt{def calcul(a,b) :} \\\n '
              texte += `\\\\\n ${sp(6)} \\texttt{if a!=6 or b>8 :}\\\n `
              texte += `\\\\\n ${sp(12)} \\texttt{b = a+b}\\\n `
              texte += `\\\\\n ${sp(6)} \\texttt{else :}\\\n `
              texte += `\\\\\n ${sp(12)} \\texttt{b = a-b}\\\n `
              texte += `\\\\\n ${sp(6)} \\texttt{return b}\\\\\n `
              texte += '\\hline\n'
              texte += '\\end{array}\n$'
            } else {
              texte += '\\medskip'
              texte += '\\fbox{'
              texte += '\\parbox{0.7\\linewidth}{'
              texte += '\\setlength{\\parskip}{.5cm}'
              texte += ' \\texttt{def calcul(a,b) :}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{if a!=6 or b>8 :}\\newline'
              texte += ' \\hspace*{8mm}\\texttt{b = a+b}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{else :}\\newline'
              texte += ' \\hspace*{8mm}\\texttt{b = a-b}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{return b}'
              texte += '}'
              texte += '}\\newline'
              texte += '\\medskip'
            }
            texte += `<br> Que renvoie l'instruction $\\texttt{calcul(${a},${b})}$ ?`
            if (a !== 6 || b > 8) {
              texteCorr = `Si $a$ est différent de $6$ ou $b>8$, le script renvoie la somme de $a$ et de $b$, sinon il renvoie la différence.<br>
          Dans ce cas, il renvoie la somme : $${a}+${b}=${miseEnEvidence(a + b)}$.`
              reponse = a + b
            } else {
              texteCorr = `Si $a$ est différent de $6$ ou $b>8$, le script renvoie la somme de $a$ et de $b$, sinon il renvoie la différence.<br>
              Dans ce cas, il renvoie la différence : $${a}-${b}=${miseEnEvidence(a - b)}$.`
              reponse = a - b
            }
          } else {
            texte = 'Soit le script Python suivant :<br>'
            if (context.isHtml) {
              texte += '$\\begin{array}{|l|}\n'
              texte += '\\hline\n'
              texte += '\\\n \\texttt{def calcul(a,b) :} \\\n '
              texte += `\\\\\n ${sp(6)} \\texttt{if a!=6 or b<8 :}\\\n `
              texte += `\\\\\n ${sp(12)} \\texttt{b = a+b}\\\n `
              texte += `\\\\\n ${sp(6)} \\texttt{else :}\\\n `
              texte += `\\\\\n ${sp(12)} \\texttt{b = a-b}\\\n `
              texte += `\\\\\n ${sp(6)} \\texttt{return b}\\\\\n `
              texte += '\\hline\n'
              texte += '\\end{array}\n$'
            } else {
              texte += '\\medskip'
              texte += '\\fbox{'
              texte += '\\parbox{0.7\\linewidth}{'
              texte += '\\setlength{\\parskip}{.5cm}'
              texte += ' \\texttt{def calcul(a,b) :}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{if a!=6 or b<8 :}\\newline'
              texte += ' \\hspace*{8mm}\\texttt{b = a+b}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{else :}\\newline'
              texte += ' \\hspace*{8mm}\\texttt{b = a-b}\\newline'
              texte += ' \\hspace*{3mm}\\texttt{return b}'
              texte += '}'
              texte += '}\\newline'
              texte += '\\medskip'
            }
            texte += `<br> Que renvoie l'instruction $\\texttt{calcul(${a},${b})}$ ?`
            if (a !== 6 || b < 8) {
              texteCorr = `Si $a$ est différent de $6$ ou $b<8$, le script renvoie la somme de $a$ et de $b$, sinon il renvoie la différence.<br>
              Dans ce cas, il renvoie la somme : $${a}+${b}=${miseEnEvidence(a + b)}$.`
              reponse = a + b
            } else {
              texteCorr = `Si $a$ est différent de $6$ ou $b<8$, le script renvoie la somme de $a$ et de $b$, sinon il renvoie la différence.<br>
                  Dans ce cas, il renvoie la différence : $${a}-${b}=${miseEnEvidence(a - b)}$.`
              reponse = a - b
            }
          }
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

        case 23:
          a = randint(1, 9)
          b = randint(1, 9)
          k = randint(1, 4)
          c = a + k
          d = b + randint(2, 4) * k
          texte = `Dans un repère du plan, on considère les points $A(${a};${b})$ et $B(${c};${d})$.<br>
          Calculer le coefficient directeur de $(AB)$.
      `
          texteCorr = ` Le coefficient directeur de la droite $(AB)$ est donné par :<br>
           $\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${d}-${b}}{${c}-${a}}=${miseEnEvidence((d - b) / (c - a))}$.
          `
          reponse = fraction(d - b, c - a)
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true },
            },
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

        case 24:
          a = randint(2, 10)

          reponse = 4 * a
          texte = `Déterminer le périmètre d'un carré d'aire $${a ** 2}\\text{ cm}^2$.
      `
          texteCorr = `Si l'aire du carré est $${a ** 2}\\text{ cm}^2$, la longueur de son côté est $\\sqrt{${a ** 2}}=${a}\\text{ cm}$. <br>
          On en déduit que le périmètre du carré est $4\\times ${a}=${miseEnEvidence(4 * a)}\\text{ cm}$. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          }
          nbChamps = 1
          break

        case 25:
          a = randint(2, 10)
          b = randint(2, 10)
          reponse = fraction(a, a + b)
          texte = `On tire une boule dans une urne contenant $${a}$ boules rouges et $${b}$ boules vertes.<br>
          Quelle est la probabilité de tirer une boule rouge ?
      `
          texteCorr = `Il y a $${b}$ boules rouges sur un total de $${a + b}$ boules. <br>
          La probabilité de tirer une boule rouge est donc : $${pgcd(a, a + b) === 1 ? miseEnEvidence(`\\dfrac{${a}}{${a + b}}`) : `\\dfrac{${a}}{${a + b}}${simplificationDeFractionAvecEtapes(a, a + b, { couleur2: orangeMathalea })}`}$`

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true },
            },
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

        case 26:
          {
            const choix = choice(['a', 'b', 'c'])
            if (choix === 'a') {
              a = choice([40, 60, 80, 100, 120])
              reponse = a / 4
              texte = `Une voiture roule à la vitesse moyenne de $${a}\\text{ km/h}$.<br>
            Combien de kilomètres a-t-elle parcourus en $15$ minutes ?
        `
              texteCorr = `Dans une heure, il y a $4\\times 15$ minutes. <br>Ainsi en $15$ minutes, la voiture aura parcouru $${a}\\div 4=${miseEnEvidence(a / 4)}\\text{ km}$.<br>
            `
            } else if (choix === 'b') {
              a = choice([60, 90, 120])
              reponse = a / 6
              texte = `Une voiture roule à la vitesse moyenne de $${a}\\text{ km/h}$.<br>
                          Combien de kilomètres a-t-elle parcourus en $10$ minutes ?
                      `
              texteCorr = `Dans une heure, il y a $6\\times 10$ minutes. <br>Ainsi en $10$ minutes, la voiture aura parcouru $${a}\\div 6=${miseEnEvidence(a / 6)}\\text{ km}$.
                          `
            } else {
              a = choice([30, 60, 90, 120])
              reponse = a / 3
              texte = `Une voiture roule à la vitesse moyenne de $${a}\\text{ km/h}$.<br>
                                        Combien de kilomètres a-t-elle parcourus en $20$ minutes ?
                                    `
              texteCorr = `Dans une heure, il y a $3\\times 20$ minutes. <br>Ainsi en $20$ minutes, la voiture aura parcouru $${a}\\div 3=${miseEnEvidence(a / 3)}\\text{ km}$.
                                        `
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
          }

          break
        case 27:
          {
            a = randint(1, 10)

            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(4, 0, 'B', 'below')
            const C = pointAbstrait(4, 4, 'C', 'above')
            const D = pointAbstrait(0, 4, 'D', 'above')
            const code1 = codageSegment(A, B, '|')
            const code2 = codageSegment(B, C, '|')
            const code3 = codageSegment(C, D, '|')
            const code4 = codageSegment(A, D, '|')
            const xmin = -1
            const ymin = -1
            const xmax = 5
            const ymax = 5
            const objets: NestedObjetMathalea2dArray = []
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(A, B).x,
                milieu(A, B).y - 0.4,
              ),
              texteParPosition('?', milieu(D, B).x + 0.2, milieu(D, B).y + 0.1),
              labelPoint(A, B, C, D),
              segment(A, B),
              segment(B, C),
              segment(C, D),
              segment(D, A),
              segment(B, D),
              code1,
              code2,
              code3,
              code4,
            )
            reponse = [
              `\\sqrt{${2 * a ** 2}}`,
              `${Math.sqrt(2 * a ** 2)}`,
              `${a}\\sqrt{2}`,
            ]
            texte = `Compléter : <br>
            `
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 30,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.8,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Le théorème de Pythagore dans le triangle rectangle $ADB$ donne : <br>
            $DB^2=AD^2+AB^2$ soit $DB^2=${a}^2+${a}^2=2\\times ${a}^2=${2 * a ** 2}$.<br>
            Ainsi, $DB=\\sqrt{${2 * a ** 2}}$ ou encore $DB=${miseEnEvidence(`${a}\\sqrt{2}`)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$DB=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierFullOperations,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += ' $DB=\\ldots\\text{ cm}$'
            }

            nbChamps = 1
          }

          break

        case 28:
          a = choice([1, 2, 3, 4, 10])
          reponse = a ** 3 / 100
          texte = `La masse volumique d'un solide est de $10\\text{ g/cm}^3$.<br>
          Combien pèse (en $\\text{kg}$) ce solide qui a la forme d'un cube d'arête $${a}\\text{ cm}$ ?
      `
          texteCorr = `Le volume du cube est $${a}^3=${a ** 3}\\text{ cm}^3$.<br>
          Sa masse est donc donnée par $${a ** 3}\\times 10=${10 * a ** 3}$ g soit $${miseEnEvidence(texNombre(a ** 3 / 100, 2))}\\text{ kg}$.

          `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ kg}$' },
            )
          }
          nbChamps = 1
          break

        case 29:
          {
            a = randint(-1, 6)
            b = randint(1, 4) + randint(1, 9) / 10

            const r = repere({
              xMin: -4,
              xMax: 4,
              yMin: -3,
              yMax: 8,
              xUnite: 2,
              yUnite: 1,
            })
            // courbe(x => a * x + b, { repere: r, color: bleuMathalea })
            const f = (x: number) => 0.5 * x ** 3 + b
            const C = courbe(f, { repere: r, color: 'red' })

            reponse = [
              Math.cbrt(2 * (a - b)) - 0.1,
              Math.cbrt(2 * (a - b)) + 0.1,
            ]
            texte = `Voici la courbe d'une fonction $f$. <br>
Donner une valeur approchée de l'antécédent de $${a}$ par $f$ ?<br>`
            texte += mathalea2d(
              { xmin: -8, xmax: 8.2, ymin: -3, ymax: 8, scale: 0.5 },
              r,
              C,
            )
            texteCorr = `L'antécédent de $${a}$ par $f$ est l'abscisse du point de la courbe d'ordonnée $${a}$ : $${miseEnEvidence(texNombre(Math.cbrt(2 * (a - b)), 1))}$ en est une valeur approchée. `

            handleAnswers(this, index, {
              reponse: {
                value: `[${reponse[0]};${reponse[1]}]`,
                options: { estDansIntervalle: true },
              },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              )
            }
            nbChamps = 1
          }

          break

        case 30:
          {
            c = choice([2, 3, 11, 12])
            const p = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
            const choix = choice(['a', 'b', 'b'])
            if (choix === 'a') {
              texte =
                "On lance deux fois de suite un dé cubique équilibré.<br>Quelle est la probabilité d’obtenir deux fois le même nombre ?<br>Donner le résultat sous la forme d'une fraction irréductible."
              texteCorr = `Sur $36$ cas possibles équiprobables, il y en a $6$ qui sont des doubles. Donc la probabilité d'obtenir deux fois le même nombre est $\\dfrac{6}{36}=${miseEnEvidence('\\dfrac{1}{6}')}$.`
              reponse = fraction(1, 6)
            } else {
              texte = `On lance deux dés cubiques équilibrés.<br>Quelle est la probabilité d’obtenir un total de $${c}$ ?<br>Donner le résultat sous la forme d'une fraction irréductible.`
              texteCorr = `Sur $36$ cas possibles équiprobables, il y en a $${p[c - 2]}$ qui donnent une somme de $${c}$. Donc la probabilité d'obtenir un total de $${c}$ est $${pgcd(p[c - 2], 36) === 1 ? miseEnEvidence(`\\dfrac{${p[c - 2]}}{36}`) : `\\dfrac{${p[c - 2]}}{36}${simplificationDeFractionAvecEtapes(p[c - 2], 36, { couleur2: orangeMathalea })}`}$.`
              reponse = fraction(p[c - 2], 36).simplifie()
            }
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: { fractionIrreductible: true },
              },
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
      }

      if (
        this.questionJamaisPosee(
          i,
          a,
          b,
          c,
          d,
          p,
          k,
          nbChamps,
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
