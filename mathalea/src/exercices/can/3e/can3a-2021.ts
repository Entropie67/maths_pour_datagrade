import { orangeMathalea } from '../../../lib/colors'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { pgcd } from '../../../lib/outils/primalite'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegment } from '../../../lib/2d/CodageSegment'
import { demiDroite } from '../../../lib/2d/DemiDroite'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { ellipse } from '../../../lib/2d/projections3d'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import {
  besoinFormulaireChoixQuestionsCan,
  numerosQuestionsCan,
} from '../../../lib/outils/choixQuestionsCan'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import type FractionEtendue from '../../../modules/FractionEtendue'

export const titre = 'CAN 3e sujet 2021'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '30/03/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */
function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = 'afd9f'

export const refs = {
  'fr-fr': ['can3a-2021'],
  'fr-ch': [],
}
export default class SujetCAN20213ieme extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 30 // 10,20,30
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
    const typeQuestionsDisponiblesNiv1 = shuffle([1, 2, 3, 4, 5, 6, 7, 8])
      .slice(-nbQ1)
      .sort(compareNombres)
    const typeQuestionsDisponiblesNiv2 = shuffle([
      9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30,
    ])
      .slice(-nbQ2)
      .sort(compareNombres)
    const typeQuestionsDisponibles = numerosQuestionsCan(
      this,
      typeQuestionsDisponiblesNiv1.concat(typeQuestionsDisponiblesNiv2),
    )
    const listeFractions18 = [
      [3, 2],
      [1, 2],
      [3, 4],
      [1, 4],
      [2, 5],
      [3, 5],
      [4, 5],
    ]
    const listeFractions22 = [
      [4, 15],
      [3, 11],
      [2, 9],
      [5, 11],
      [3, 13],
      [10, 9],
      [4, 11],
      [7, 15],
      [2, 15],
      [5, 12],
    ]

    for (
      let i = 0,
        index = 0,
        texte,
        texteCorr,
        resultat,
        fraction18 = [],
        fraction22 = [],
        triplet,
        sCote1,
        sCote2,
        s1,
        s2,
        s3,
        s4,
        s5,
        s6,
        prix,
        choix,
        truc,
        a,
        b,
        c,
        d,
        e,
        m,
        p,
        k,
        A,
        B,
        C,
        D,
        E,
        F,
        G,
        pol,
        code1,
        code2,
        code3,
        code4,
        code5,
        code6,
        xmin,
        xmax,
        ymin,
        ymax,
        objets;
      i < this.nbQuestions;
    ) {
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(4, 9)
          b = randint(4, 9)
          texte = `$${a} \\times ${b}=$ `
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          handleAnswers(this, index, { reponse: { value: a * b } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          break

        case 2:
          {
            a = randint(6, 12) * 4
            b = randint(6, 15) * 3
            m = choice(['quart', 'tiers'])
            let reponse: number
            if (m === 'quart') {
              reponse = Math.round(a / 4)
              texte = `Le quart de $${a}$ est : `
              texteCorr = `Prendre le quart d'un nombre revient à le diviser par $4$.<br>
                Ainsi le quart de $${a}$ est : $${a}\\div 4 =${miseEnEvidence(reponse)}$.`
            } else {
              reponse = Math.round(b / 3)
              texte = `Le tiers de $${b}$ est : `
              texteCorr = `Prendre le tiers d'un nombre revient à le diviser par $3$.<br>
                Ainsi le tiers de $${b}$ est : $${b}\\div 3 =${miseEnEvidence(reponse)}$.`
            }
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
          }
          break

        case 3:
          {
            a = randint(101, 121)
            b = randint(21, 45)

            const reponse = a - b
            texte = `$${a} - ${b}=$ `
            texteCorr = `$${a}-${b}=${miseEnEvidence(reponse)}$`
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
          }
          break

        case 4:
          {
            a = randint(3, 9) + randint(1, 4) / 10
            b = randint(1, 5) / 10 + randint(2, 9) / 100
            const reponse = arrondi(a + b, 2)

            texte = `$${texNombre(a, 1)}+${texNombre(b, 2)}=$ `
            texteCorr = `$${texNombre(a, 1)}+${texNombre(b, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$ `

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
          }
          break

        case 5:
          {
            a = randint(11, 18)
            b = randint(3, 5)
            c = a * b
            if (choice([true, false])) {
              texte = `Complète : <br>$${a}\\times \\ldots =${c}$`
              texteCorr = `$${a}\\times ${miseEnEvidence(b)} =${c}$`
            } else {
              texte = `Complète :<br> $ \\ldots \\times ${a}=${c}$`
              texteCorr = `$ ${miseEnEvidence(b)} \\times ${a}=${c}$`
            }
            const reponse = b
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          break

        case 6:
          {
            let reponse
            a = arrondi(
              randint(1, 9) * 10 + randint(1, 9) + 0.9 + randint(1, 9) / 100,
              2,
            )
            b = arrondi(
              randint(1, 9) * 10 +
                randint(1, 9) / 10 +
                0.09 +
                randint(1, 9) / 1000,
              3,
            )

            if (choice([true, false])) {
              texte = `Quel nombre obtient-on si on ajoute un dixième à $${texNombre(a)}$ ?`
              texteCorr = `$1$ dixième $=0,1$, d'où $${texNombre(a)}+0,1 =${miseEnEvidence(texNombre(a + 0.1))}$`
              reponse = arrondi(a + 0.1, 2)
            } else {
              texte = `Quel nombre obtient-on si on ajoute un centième à $${texNombre(b)}$ ?`
              texteCorr = `$1$ centième $=0,01$, d'où $${texNombre(b)}+0,01 =${miseEnEvidence(texNombre(b + 0.01))}$`
              reponse = arrondi(b + 0.01, 3)
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          break

        case 7:
          {
            a = randint(1, 9)
            b = randint(1, 9, a)

            k = a * 100 + b * 10
            d = choice([0.1, 0.01, 0.001])
            const reponse = arrondi(k * d, 2)

            if (d === 0.1) {
              texte = `$${k}\\times ${texNombre(d)}=$`
              texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(reponse)}$`
              texteCorr += `<br>
        Multiplier par $0,1$ revient à diviser par $10$. <br>
               $${k}\\times ${texNombre(d)}=${k}\\div 10=${a}${b},\\underline{0}$.<br>
                  `
            } else if (d === 0.01) {
              texte = `$${k}\\times ${texNombre(d)}=$`
              texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(reponse, 1))}$`
              texteCorr += ` <br> Multiplier par $0,01$ revient à diviser par $100$. <br>
                $${k}\\times ${texNombre(d)}=${k}\\div 100=${a},${b}\\underline{0}$.<br>
                  `
            } else {
              texte = `$${k}\\times ${texNombre(d, 3)}=$`
              texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(reponse, 2))}$`
              texteCorr += `<br>
        Multiplier par $0,001$ revient à diviser par $1000$. <br>
                $${k}\\times ${texNombre(d)}=${k}\\div 1000=0,${a}${b}\\underline{0}$.<br>
                  `
            }
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
          }
          break

        case 8:
          {
            let reponse
            a = randint(2, 5)
            b = randint(2, 9)
            c = randint(2, 9)

            if (choice([true, false])) {
              reponse = a * 10000 + b * 100 + c * 10
              texte = `$${texNombre(a)}\\times ${texNombre(10000)} + ${texNombre(b)}\\times 100 + ${texNombre(c)}\\times 10=$`
              texteCorr = `$${texNombre(a)}\\times ${texNombre(10000)} + ${texNombre(b)}\\times 100 + ${texNombre(c)}\\times 10 =
     ${texNombre(a * 10000)} + ${texNombre(b * 100)} + ${texNombre(c * 10)}=${miseEnEvidence(texNombre(reponse))}$`
            } else {
              reponse = c * 10000 + b * 1000 + a * 10
              texte = `$ ${texNombre(c)}\\times ${texNombre(10000)}+ ${texNombre(b)}\\times ${texNombre(1000)} + ${texNombre(a)}\\times 10 =$`
              texteCorr = `$ ${texNombre(c)}\\times ${texNombre(10000)}+ ${texNombre(b)}\\times ${texNombre(1000)} + ${texNombre(a)}\\times 10 =
      ${texNombre(c * 10000)}+ ${texNombre(b * 1000)} + ${texNombre(a * 10)} =${miseEnEvidence(texNombre(reponse))}$`
            }
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
          }
          break

        case 9:
          {
            a = randint(2, 6)
            prix = 2 + randint(1, 3) / 10 + 0.05
            k = randint(2, 4)
            const reponse = arrondi(prix * k, 2)
            texte = `$${a}$ stylos identiques coûtent $${texNombre(prix, 2, true)}$ €. <br>
            Combien coûtent $${k * a}$ de ces mêmes stylos ?
             `

            texteCorr = `$${a}$ stylos identiques coûtent $${texNombre(prix, 2, true)}$ €, donc $${k * a}$
           de ces mêmes stylos coûtent $${k}$ fois plus, soit $${k}\\times ${texNombre(prix, 2, true)}=${miseEnEvidence(texNombre(k * prix, 2, true))}$ €.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + ' €'
            }
          }
          break

        case 10:
          {
            a = randint(11, 24, 20)
            const reponse = 101 * a
            texte = `$${a}\\times 101=$`
            texteCorr = `$${a}\\times 101 = ${miseEnEvidence(texNombre(101 * a))}$<br>`

            texteCorr += `$${a}\\times 101 = ${a}\\times (100+1)=${a}\\times 100+${a}\\times 1=${texNombre(a * 100, 0)}+${a}=${texNombre(101 * a, 0)}$`

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
          }
          break

        case 11:
          {
            let reponse
            a = choice([15, 35, 42, 10, 14, 21, 22, 26, 29, 33, 20, 27])
            texte = `Donne la liste des diviseurs de $${a}$.<br>`
            if (a === 27) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(3)}$, $${miseEnEvidence(9)}$ et $${miseEnEvidence(27)}$. `
              reponse = '1;3;9;27'
            } else if (a === 20) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(4)}$ $${miseEnEvidence(5)}$, $${miseEnEvidence(10)}$ et $${miseEnEvidence(20)}$. `
              reponse = '1;2;4;5;10;20'
            } else if (a === 15) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(3)}$, $${miseEnEvidence(5)}$ et $${miseEnEvidence(15)}$. `
              reponse = '1;3;5;15'
            } else if (a === 35) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(5)}$, $${miseEnEvidence(7)}$ et $${miseEnEvidence(35)}$. `
              reponse = '1;5;7;35'
            } else if (a === 42) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(3)}$, $${miseEnEvidence(6)}$, $${miseEnEvidence(7)}$, $${miseEnEvidence(14)}$, $${miseEnEvidence(21)}$ et $${miseEnEvidence(42)}$. `
              reponse = '1;2;3;6;7;14;21;42'
            } else if (a === 10) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(5)}$ et $${miseEnEvidence(10)}$. `
              reponse = '1;2;5;10'
            } else if (a === 14) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(7)}$, et $${miseEnEvidence(14)}$. `
              reponse = '1;2;7;14'
            } else if (a === 21) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(3)}$, $${miseEnEvidence(7)}$ et $${miseEnEvidence(21)}$. `
              reponse = '1;3;7;21'
            } else if (a === 22) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(11)}$ et $${miseEnEvidence(22)}$. `
              reponse = '1;2;11;22'
            } else if (a === 26) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(2)}$, $${miseEnEvidence(13)}$ et $${miseEnEvidence(26)}$. `
              reponse = '1;2;13;26'
            } else if (a === 29) {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$ et $${miseEnEvidence(29)}$. `
              reponse = '1;29'
            } else {
              texteCorr = `Les diviseurs de $${a}$ sont : $${miseEnEvidence(1)}$, $${miseEnEvidence(3)}$, $${miseEnEvidence(11)}$ et $${miseEnEvidence(33)}$. `
              reponse = '1;3;11;33'
            }
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { suiteDeNombres: true } },
            })
            if (this.interactif) {
              texte += 'Écrire les diviseurs séparés par un point-virgule'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
              )
            }
          }
          break
        case 12:
          {
            a = randint(1, 9) // longueur BE
            k = randint(2, 4)
            b = k * a // longueur DC
            c = a + 1 // longueur AE
            d = k * c // longueur AD
            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(2, -0.4, 'B', 'below')
            C = pointAbstrait(5, -1, 'C', 'below')
            D = pointAbstrait(4, 2, 'D', 'above')
            E = pointAbstrait(1.6, 0.8, 'E', 'above')
            xmin = -1
            ymin = -2
            xmax = 6
            ymax = 4.5
            sCote1 = segment(
              pointAbstrait(A.x - 0.3, A.y + 0.5),
              pointAbstrait(E.x - 0.2, E.y + 0.5),
            )
            sCote2 = segment(
              pointAbstrait(A.x - 0.8, A.y + 1.3),
              pointAbstrait(D.x - 0.8, D.y + 1.3),
            )
            sCote1.styleExtremites = '<->'
            sCote2.styleExtremites = '<->'
            objets = []
            objets.push(
              texteParPosition(
                `${stringNombre(a)} `,
                milieu(B, E).x + 0.4,
                milieu(B, E).y,
              ),
              texteParPosition(
                '?',
                milieu(A, E).x - 0.4,
                milieu(A, E).y + 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${stringNombre(b)} `,
                milieu(D, C).x + 0.5,
                milieu(D, C).y,
              ),
              texteParPosition(
                `${stringNombre(d)} `,
                milieu(A, D).x - 1,
                milieu(A, D).y + 1.5,
              ),
              demiDroite(A, C),
              demiDroite(A, D),
              labelPoint(A, B, C, D, E),
              segment(A, D),
              segment(A, C),
              segment(B, E),
              segment(D, C),
              sCote1,
              sCote2,
            )
            const reponse = c
            texte =
              '$(BE)' +
              symboleParallele() +
              '(DC)$. Détermine la longueur $AE$.<br>'
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
            texteCorr = `Le triangle $ADC$ est un agrandissement du triangle $ABE$. Le coefficient d'agrandissement est donné par : $\\dfrac{${b}}{${a}}=${texNombre(b / a)}$.<br>
          On obtient donc la longueur $AE$ en divisant par $${k}$ la longueur $AD$.<br>
          $AE=\\dfrac{${d}}{${k}}=${miseEnEvidence(c)}$.<br>`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$AE=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          break

        case 13:
          {
            a = randint(-9, -4)
            b = randint(2, 8)
            c = randint(2, 5)
            texte = `$f(x)=${a}x+${b}$<br>
          $f(${c})= $ `
            const reponse = a * c + b
            texteCorr = `$f(${c})=${a}\\times ${c}+${b}=${a * c}+${b}=${miseEnEvidence(reponse)}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              )
            } else {
              texte += ' $\\ldots$'
            }
          }
          break

        case 14:
          a = randint(1, 5)
          b = choice([0.25, 0.5, 0.75])
          d = Math.round(b * 60)
          if (!this.interactif) {
            texte = `$${texNombre(a + b)}$ h $=$ $\\ldots\\ldots$ h $\\ldots\\ldots$ min`
            texteCorr = `$${texNombre(a + b)}$h$ = ${a}$ h $ + ${texNombre(b)} \\times 60 = ${miseEnEvidence(`${a}\\text{ h }${d}\\text{ min}`)}$`
          } else {
            texte = `$${texNombre(a + b, 2)}$ h $=$`

            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )

            handleAnswers(this, index, {
              reponse: {
                value: new Hms({ hour: a, minute: d }).toString(),
                options: { HMS: true },
              },
            })

            texteCorr = `$${texNombre(a + b)}$h$ = ${a}$ h $ + ${texNombre(b)} \\times 60$ min $ = ${miseEnEvidence(`${a}\\text{ h }${d}\\text{ min}`)}$`
          }
          break

        case 15:
          {
            a = randint(1, 5) * 10
            p = randint(2, 9, 5) * 10
            const reponse = Math.round((a * p) / 100)
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
              texte += ' $\\ldots$'
            }
          }
          break

        case 16:
          {
            b = randint(8, 15) // longueur hauteur

            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(-2, 0, 'B', 'below')
            C = pointAbstrait(2, 0, 'C', 'below')
            D = pointAbstrait(0, -4, 'D', 'above')
            c = ellipse(A, 2, 0.5)
            s1 = segment(D, A)
            s1.pointilles = 5
            s2 = segment(A, C)
            s2.pointilles = 5

            xmin = -3
            ymin = -5
            xmax = 3
            ymax = 1.5
            objets = []
            objets.push(
              texteParPosition(
                `${stringNombre(3)} cm`,
                milieu(A, C).x,
                milieu(A, C).y + 0.2,
              ),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(A, D).x + 0.5,
                milieu(A, D).y,
              ),
              segment(B, D),
              segment(D, C),
              s1,
              s2,
              c,
            )
            const reponse = 3 * b
            texte = 'Donne le volume exact de ce cône.<br>'
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 30,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Le volume du cône est : $\\dfrac{1}{3}\\times \\text{(Aire de la base)}\\times \\text{Hauteur}$.<br>
          Soit : $\\dfrac{1}{3}\\times \\pi \\times 3^2\\times ${b}=${miseEnEvidence(reponse)}\\pi\\text{ cm}^3$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + '$\\pi$cm$^3$'
            }
          }
          break

        case 17:
          {
            a = randint(21, 39)
            b = randint(121, 149, [130, 140])
            c = randint(61, 98, [70, 80, 90])
            d = randint(2, 5)
            e = choice([
              [b, 200 - b],
              [c, 100 - c],
              [d, 10 - d],
            ])
            const reponse = a * e[0] + a * e[1]
            texte = `$${a}\\times ${e[0]}+${a}\\times ${e[1]}= $ `

            texteCorr = `$${a}\\times ${e[0]}+${a}\\times ${e[1]}=${a}\\times( ${e[0]}+ ${e[1]})=${a}\\times ${e[0] + e[1]}=${miseEnEvidence(texNombre(reponse, 0))}$.`

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
          }
          break

        case 18:
          {
            fraction18 = choice(listeFractions18)
            a = fraction(fraction18[0], fraction18[1])
            k = randint(3, 9)
            const reponse = arrondi(fraction18[0] / fraction18[1], 2)
            texte = `Écriture décimale de $\\dfrac{${fraction18[0] * k}}{${fraction18[1] * k}}$.`
            texteCorr = `En simplifiant, on obtient : $\\dfrac{${fraction18[0] * k}}{${fraction18[1] * k}}=\\dfrac{${fraction18[0]}}{${fraction18[1]}}=${miseEnEvidence(texNombre(reponse, 2))}$`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          break

        case 19:
          {
            let reponse
            triplet = [
              [3, 4, 5],
              [6, 8, 10],
            ]
            a = choice(triplet)

            C = pointAbstrait(0, 0, 'C', 'below')
            A = pointAbstrait(2, 0, 'A', 'below')
            B = pointAbstrait(2, 3, 'B', 'above')

            xmin = -1
            ymin = -1
            xmax = 3.5
            ymax = 4
            pol = polygoneAvecNom(A, B, C)
            objets = []
            choix = choice(['a', 'b', 'c'])
            if (choix === 'a') {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[0])} dm`,
                  milieu(A, C).x,
                  milieu(A, C).y - 0.3,
                ),
                texteParPosition(
                  `${stringNombre(a[2])} dm`,
                  milieu(B, C).x - 0.6,
                  milieu(B, C).y,
                ),

                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[1]
              texte = 'Calcule la longueur $AB$. <br>'

              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1.2,
                  center: !context.isHtml,
                },
                objets,
              )
              texte += '<br>$AB=$'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$ :<br>
              On a $AB^2=BC^2-AC^2$, soit $AB^2=${a[2]}^2-${a[0]}^2=${a[2] ** 2 - a[0] ** 2}$.<br>
              Par conséquent, $AB=${miseEnEvidence(a[1])}$.`
            } else if (choix === 'b') {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[1])} dm`,
                  milieu(A, B).x + 0.5,
                  milieu(A, B).y,
                ),
                texteParPosition(
                  `${stringNombre(a[2])} dm`,
                  milieu(B, C).x - 0.6,
                  milieu(B, C).y,
                ),
                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[0]
              texte = 'Calcule la longueur $AC$. <br>'

              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texte += '<br>$AC=$'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$ :<br>
                On a $AC^2=BC^2-AB^2$, soit $AC^2=${a[2]}^2-${a[1]}^2=${a[2] ** 2 - a[1] ** 2}$.<br>
                Par conséquent, $AC=${miseEnEvidence(a[0])}$.`
            } else {
              objets.push(pol[0])
              objets.push(
                texteParPosition(
                  `${stringNombre(a[1])} dm`,
                  milieu(A, B).x + 0.5,
                  milieu(A, B).y,
                ),
                texteParPosition(
                  `${stringNombre(a[0])} dm`,
                  milieu(A, C).x,
                  milieu(A, C).y - 0.3,
                ),
                labelPoint(A, B, C),
                codageAngleDroit(B, A, C),
              )
              reponse = a[2]
              texte = 'Calcule la longueur $BC$. <br>'

              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texte += '<br>$BC=$'

              texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$ :<br>
                  On a $BC^2=AB^2+AC^2$, soit $BC^2=${a[0]}^2+${a[1]}^2=${a[0] ** 2 + a[1] ** 2}$.<br>
                  Par conséquent, $BC=${miseEnEvidence(a[2])}$.`
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + 'dm'
            } else {
              texte += ' $\\ldots\\text{ dm}$ '
            }
          }
          break

        case 20:
          {
            a = choice([5, 10, 20, 30, 40])
            b = randint(1, 3)
            const reponse = a * 60 * b + 30 * a
            texte = `Un véhicule se déplace à une vitesse de $${a}\\text{ m/s}$.<br>
          Quelle distance parcourt-il en $${b}$ min $30$ s ? `
            texteCorr = `En $1$ minute, il parcourt $60\\times ${a}=${texNombre(60 * a)}\\text{ m}$ et en $30$ s, $${texNombre(60 * a)}\\div 2=${30 * a}$.<br>
          En $${b}$ min $30$ s, il aura parcouru : $${b}\\times ${texNombre(60 * a)}+${30 * a}=${miseEnEvidence(texNombre(a * (60 * b + 30), 0))}\\text{ m}$.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + '$\\text{ m}$'
            } else {
              texte += '(en $\\text{m}$)'
            }
          }
          break

        case 21:
          {
            a = choice([
              randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9),
              randint(1, 9) * 10 + randint(1, 9),
            ])
            const reponse = arrondi(a / 1000, 3)
            texte = `Complète.<br>
         $${a}\\text{ cm}^3 = $ `
            texteCorr = `$1\\text{ cm}^3 = 0,001 \\text{ dm}^3$ et $1\\text{ dm}^3 = 1$ L.<br>
          $${a}\\text{ cm}^3 = ${a}\\times 0,001=${miseEnEvidence(texNombre(reponse, 3))}$ L.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + 'L'
            } else {
              texte += ' $\\ldots$ L '
            }
          }
          break

        case 22:
          {
            k = randint(2, 5) * 10
            fraction22 = choice(listeFractions22)
            a = fraction(fraction22[0] * k, fraction22[1] * k)

            b = fraction(fraction22[0], fraction22[1])
            texte = `Donne la fraction irréductible égale à : $${a.texFraction}$.<br>
          `
            texteCorr = ` $${a.texFraction}=\\dfrac{${fraction22[0]}\\times 10\\times ${k / 10}}{${fraction22[1]}\\times 10\\times ${k / 10}}=${miseEnEvidence(b.texFraction)}$.
           <br>
          `

            const reponse = b.simplifie()

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
          }
          break

        case 23:
          {
            let reponse
            choix = choice(['a', 'b', 'c', 'd'])
            if (choix === 'a') {
              b = randint(7, 12)
              a = randint(2, 5)
              A = pointAbstrait(0.13, 0.5)
              B = pointAbstrait(1, 1)
              C = pointAbstrait(2, 1)
              D = pointAbstrait(3, 2)
              E = pointAbstrait(3, -1)
              F = pointAbstrait(2, 0)
              G = pointAbstrait(1, 0)
              s1 = segment(A, B)
              code1 = codageSegment(A, B, '||')
              s2 = segment(B, C)
              code2 = codageSegment(B, C, '||')
              s3 = segment(A, G)
              code3 = codageSegment(A, G, '||')
              s4 = segment(G, F)
              code4 = codageSegment(G, F, '||')
              s5 = segment(C, D)
              code5 = codageSegment(C, D, '|')
              s6 = segment(E, F)
              code6 = codageSegment(E, F, '|')
              xmin = -1
              ymin = -2
              xmax = 4
              ymax = 2.5
              objets = []
              objets.push(
                texteParPosition(
                  'x',
                  milieu(B, C).x,
                  milieu(B, C).y + 0.3,
                  0,
                  'black',
                  1,
                  'milieu',
                  true,
                ),
                texteParPosition(
                  `${stringNombre(b)} `,
                  milieu(D, E).x + 0.3,
                  milieu(D, E).y,
                ),
                texteParPosition(
                  `${stringNombre(a)} `,
                  milieu(D, C).x,
                  milieu(D, C).y + 0.3,
                ),
                s1,
                s2,
                s3,
                s4,
                s5,
                s6,
                code1,
                code2,
                code3,
                code4,
                code5,
                code6,
                segment(D, E),
              )
              reponse = `4x${ecritureAlgebrique(2 * a + b)}`
              texte =
                'Exprime en fonction de $x$, le périmètre de cette figure.<br>'
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `La figure est composée de $4$ segments de longueur $x$, de $2$ segments de longueur $${a}$ et d'un segment de longueur $${b}$.<br>
          Le périmètre de cette figure est donc : $4\\times x+2\\times ${a}+${b}=${miseEnEvidence(`4x+${2 * a + b}`)}$.   `
            } else if (choix === 'b') {
              b = randint(7, 12)
              a = randint(2, 5)
              A = pointAbstrait(0.13, 0.5)
              B = pointAbstrait(1, 1)
              C = pointAbstrait(2, 1)
              D = pointAbstrait(3, 2)
              E = pointAbstrait(3, -1)
              F = pointAbstrait(2, 0)
              G = pointAbstrait(1, 0)
              s1 = segment(A, B)
              code1 = codageSegment(A, B, '||')
              s2 = segment(B, C)
              code2 = codageSegment(B, C, '||')
              s3 = segment(A, G)
              code3 = codageSegment(A, G, '||')
              s4 = segment(G, F)
              code4 = codageSegment(G, F, '||')
              s5 = segment(C, D)
              code5 = codageSegment(C, D, '|')
              s6 = segment(E, F)
              code6 = codageSegment(E, F, '|')
              xmin = -1
              ymin = -2
              xmax = 4
              ymax = 2.5
              objets = []
              objets.push(
                texteParPosition(
                  `${stringNombre(a)}`,
                  milieu(B, C).x,
                  milieu(B, C).y + 0.3,
                ),
                texteParPosition(
                  `${stringNombre(b)}`,
                  milieu(D, E).x + 0.3,
                  milieu(D, E).y,
                ),
                texteParPosition(
                  'x',
                  milieu(D, C).x,
                  milieu(D, C).y + 0.3,
                  0,
                  'black',
                  1,
                  'milieu',
                  true,
                ),
                s1,
                s2,
                s3,
                s4,
                s5,
                s6,
                code1,
                code2,
                code3,
                code4,
                code5,
                code6,
                segment(D, E),
              )
              reponse = `2x${ecritureAlgebrique(4 * a + b)}`
              texte =
                'Exprime en fonction de $x$, le périmètre de cette figure.<br>'
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `La figure est composée de $2$ segments de longueur $x$, de $4$ segments de longueur $${a}$ et d'un segment de longueur $${b}$.<br>
            Le périmètre de cette figure est donc : $2\\times x+4\\times ${a}+${b}=${miseEnEvidence(`2x+${4 * a + b}`)}$. `
            } else if (choix === 'c') {
              b = randint(7, 12)
              a = randint(2, 5)
              B = pointAbstrait(1, 1)
              C = pointAbstrait(2, 1)
              D = pointAbstrait(3, 2)
              E = pointAbstrait(3, -1)
              F = pointAbstrait(2, 0)
              G = pointAbstrait(1, 0)
              s1 = segment(B, G)
              code1 = codageSegment(B, G, '||')
              s2 = segment(B, C)
              code2 = codageSegment(B, C, '||')
              s4 = segment(G, F)
              code4 = codageSegment(G, F, '||')
              s5 = segment(C, D)
              code5 = codageSegment(C, D, '|')
              s6 = segment(E, F)
              code6 = codageSegment(E, F, '|')
              xmin = -1
              ymin = -2
              xmax = 4
              ymax = 2.5
              objets = []
              objets.push(
                texteParPosition(
                  `${stringNombre(a)}`,
                  milieu(B, C).x,
                  milieu(B, C).y + 0.3,
                ),
                texteParPosition(
                  `${stringNombre(b)}`,
                  milieu(D, E).x + 0.3,
                  milieu(D, E).y,
                ),
                texteParPosition(
                  'x',
                  milieu(D, C).x,
                  milieu(D, C).y + 0.3,
                  0,
                  'black',
                  1,
                  'milieu',
                  true,
                ),
                s1,
                s2,
                s4,
                s5,
                s6,
                code1,
                code2,
                code4,
                code5,
                code6,
                segment(D, E),
              )
              reponse = `2x${ecritureAlgebrique(3 * a + b)}`
              texte =
                'Exprime en fonction de $x$, le périmètre de cette figure.<br>'
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `La figure est composée de $2$ segments de longueur $x$, de $3$ segments de longueur $${a}$ et d'un segment de longueur $${b}$.<br>
              Le périmètre de cette figure est donc : $2\\times x+3\\times ${a}+${b}=${miseEnEvidence(`2x+${3 * a + b}`)}$.   `
            } else {
              b = randint(7, 12)
              a = randint(2, 5)
              B = pointAbstrait(1, 1)
              C = pointAbstrait(2, 1)
              D = pointAbstrait(3, 2)
              E = pointAbstrait(3, -1)
              F = pointAbstrait(2, 0)
              G = pointAbstrait(1, 0)
              s1 = segment(B, G)
              code1 = codageSegment(B, G, '||')
              s2 = segment(B, C)
              code2 = codageSegment(B, C, '||')
              s4 = segment(G, F)
              code4 = codageSegment(G, F, '||')
              s5 = segment(C, D)
              code5 = codageSegment(C, D, '|')
              s6 = segment(E, F)
              code6 = codageSegment(E, F, '|')
              xmin = -1
              ymin = -2
              xmax = 4
              ymax = 2.5
              objets = []
              objets.push(
                texteParPosition(
                  'x',
                  milieu(B, C).x,
                  milieu(B, C).y + 0.3,
                  0,
                  'black',
                  1,
                  'milieu',
                  true,
                ),
                texteParPosition(
                  `${stringNombre(b)}`,
                  milieu(D, E).x + 0.3,
                  milieu(D, E).y,
                ),
                texteParPosition(
                  `${stringNombre(a)}`,
                  milieu(D, C).x,
                  milieu(D, C).y + 0.3,
                ),
                s1,
                s2,
                s4,
                s5,
                s6,
                code1,
                code2,
                code4,
                code5,
                code6,
                segment(D, E),
              )
              reponse = `3x${ecritureAlgebrique(2 * a + b)}`
              texte =
                'Exprime en fonction de $x$, le périmètre de cette figure.<br>'
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `La figure est composée de $3$ segments de longueur $x$, de $2$ segments de longueur $${a}$ et d'un segment de longueur $${b}$.<br>
                Le périmètre de cette figure est donc : $3\\times x+2\\times ${a}+${b}=${miseEnEvidence(`3x+${2 * a + b}`)}$. `
            }

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecX,
              )
            }
          }
          break

        case 24:
          {
            a = randint(-30, -11)
            b = randint(25, 49)

            const reponse = a - b

            texte = `Donne la solution de l'équation :<br>
          $${a}-x=${b}$`

            texteCorr = `En ajoutant $${-a}$ dans chacun des deux membres, on obtient, $-x=${b - a}$, d'où $x=${miseEnEvidence(a - b)}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              )
            }
          }
          break

        case 25:
          {
            a = randint(2, 10) * 1000
            b = randint(2, 5)
            const reponse = Math.round(a * (1 + b / 100))
            texte = ` Un capital de $${texNombre(a)}$ € rapporte $${texNombre(b)}\\,\\%$ par an.<br>
           Quelle est la valeur du capital au bout d'un an ?`
            texteCorr = `Le capital est augmenté de $${b}\\,\\%$ de $${texNombre(a)}$, soit de $${texNombre(b / 100)}\\times ${texNombre(a)}=${texNombre((a * b) / 100)}$.<br>
          Le capital au bout d'un an sera donc de : $${texNombre(a, 0)}+ ${texNombre((a * b) / 100, 0)}=${miseEnEvidence(texNombre(a + (a * b) / 100, 0))}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + '€'
            }
          }
          break

        case 26:
          {
            let reponse: FractionEtendue[]
            a = randint(8, 22)
            b = 4
            texte = `Une urne contient $${a}$ boules numérotées de $1$ à $${a}$. <br>
          On choisit une boule au hasard. Quelle est la probabilité d'obtenir un nombre premier ? `
            if (a < 11) {
              texteCorr = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$.<br>
          Il y a donc $4$ nombres premiers inférieurs à $${a}$. <br>
          On en déduit que la probabilité d'obtenir un nombre premier est : $${pgcd(b, a) === 1 ? miseEnEvidence(texFractionFromString(b, a)) : texFractionFromString(b, a) + simplificationDeFractionAvecEtapes(b, a, { couleur2: orangeMathalea })}$.`
              reponse = [fraction(b, a), fraction(b, a).simplifie()]
            } else if (a > 10 && a < 13) {
              texteCorr = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$.<br>
  Il y a donc $5$ nombres premiers inférieurs à $${a}$. <br>
  On en déduit que la probabilité d'obtenir un nombre premier est : $${pgcd(b + 1, a) === 1 ? miseEnEvidence(texFractionFromString(b + 1, a)) : texFractionFromString(b + 1, a) + simplificationDeFractionAvecEtapes(b + 1, a, { couleur2: orangeMathalea })}$.`
              reponse = [fraction(b + 1, a), fraction(b + 1, a).simplifie()]
            } else if (a > 12 && a < 17) {
              texteCorr = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$.<br>
  Il y a donc $6$ nombres premiers inférieurs à $${a}$. <br>
  On en déduit que la probabilité d'obtenir un nombre premier est : $${pgcd(b + 2, a) === 1 ? miseEnEvidence(texFractionFromString(b + 2, a)) : texFractionFromString(b + 2, a) + simplificationDeFractionAvecEtapes(b + 2, a, { couleur2: orangeMathalea })}$.`
              reponse = [fraction(b + 2, a), fraction(b + 2, a).simplifie()]
            } else if (a > 16 && a < 19) {
              texteCorr = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$, $17$.<br>
  Il y a donc $7$ nombres premiers inférieurs à $${a}$. <br>
  On en déduit que la probabilité d'obtenir un nombre premier est : $${pgcd(b + 3, a) === 1 ? miseEnEvidence(texFractionFromString(b + 3, a)) : texFractionFromString(b + 3, a) + simplificationDeFractionAvecEtapes(b + 3, a, { couleur2: orangeMathalea })}$.`
              reponse = [fraction(b + 3, a), fraction(b + 3, a).simplifie()]
            } else {
              texteCorr = `Les nombres premiers inférieurs à $${a}$ sont : $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$.<br>
  Il y a donc $8$ nombres premiers inférieurs à $${a}$. <br>
  On en déduit que la probabilité d'obtenir un nombre premier est : $${pgcd(b + 4, a) === 1 ? miseEnEvidence(texFractionFromString(b + 4, a)) : texFractionFromString(b + 4, a) + simplificationDeFractionAvecEtapes(b + 4, a, { couleur2: orangeMathalea })}$.`
              reponse = [fraction(b + 4, a), fraction(b + 4, a).simplifie()]
            }
            handleAnswers(this, i, {
              reponse: {
                value: reponse.map((f) => f.toLatex()),
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
          }
          break

        case 27:
          {
            a = randint(2, 6) * 3
            b = randint(4, 9) * 3
            c = arrondi(a + b / 100, 2)
            const reponse = arrondi(c / 3, 2)
            texte = `$${texNombre(c, 2)}\\div 3= $`
            texteCorr = `$${texNombre(c, 2)}\\div 3=(${texNombre(a)}+${texNombre(b / 100, 2)})\\div 3=${texNombre(a)}\\div 3+${texNombre(b / 100, 2)}\\div 3=${texNombre(a / 3, 0)}+${texNombre(b / 300, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$
          `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            } else {
              texte += ' $\\ldots$ '
            }
          }
          break

        case 28:
          {
            let reponse
            choix = choice(['a', 'b', 'c']) //
            if (choix === 'a') {
              a = arrondi(randint(11, 39, [10, 20, 30]) / 1000, 3)
              truc = arrondi(a * 100, 1)
              reponse = `${stringNombre(truc, 1)}\\times 10^{-2}`
              texte = `Écriture scientifique de $${texNombre(a, 3)}$.`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
          Ici : $${texNombre(a, 3)}=\\underbrace{${texNombre(truc, 1)}}_{1\\leqslant ${texNombre(truc, 1)} <10}\\times 10^{-2}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 1)}\\times 10^{-2}`)}$. `
            } else if (choix === 'b') {
              a = arrondi(randint(111, 399, [200, 300]) / 100000, 5)
              truc = arrondi(a * 1000, 2)
              reponse = `${stringNombre(truc, 2)}\\times 10^{-3}`
              texte = `Écriture scientifique de $${texNombre(a, 5)}$.`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(a, 5)}=\\underbrace{${texNombre(truc, 2)}}_{1\\leqslant ${texNombre(truc, 2)} <10}\\times 10^{-3}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 2)}\\times 10^{-3}`)}$. `
            } else {
              a = arrondi(randint(111, 399, [200, 300]) / 1000000, 6)
              truc = arrondi(a * 10000, 2)
              reponse = `${stringNombre(truc, 2)}\\times 10^{-4}`
              texte = `Écriture scientifique de $${texNombre(a, 6)}$.`

              texteCorr = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici : $${texNombre(a, 6)}=\\underbrace{${texNombre(truc, 2)}}_{1\\leqslant ${texNombre(truc, 2)} <10}\\times 10^{-4}$.<br>L'écriture scientifique est donc $${miseEnEvidence(`${texNombre(truc, 2)}\\times 10^{-4}`)}$. `
            }
            handleAnswers(this, index, {
              reponse: {
                value: reponse,
                options: { ecritureScientifique: true },
              },
            })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
              )
            }
          }
          break

        case 29:
          {
            a = randint(4, 9)
            b = randint(2, 6)
            truc = randint(4, 8)
            resultat = (truc + a) * b
            const reponse = truc
            texte = `Je pense à un nombre, je lui ajoute $${a}$ et je multiplie le résultat par $${b}$.<br>
          J'obtiens $${resultat}$. Quel est ce nombre ?`
            texteCorr = `On remonte le programme de calcul en commençant par diviser le nombre obtenu par $${b}$.<br>
          On obtient $${resultat}\\div ${b}=${resultat / b}$<br>
          On retranche ensuite $${a}$.<br>
          On obtient $${resultat / b} -${a}=${miseEnEvidence(truc)}$.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
          }
          break
        case 30:
        default:
          {
            let reponse
            choix = choice(['a', 'b'])
            if (choix === 'a') {
              a = randint(2, 9) * 4
              texte = `Un article à $${a}$ € est soldé à $${texNombre(a * 0.75, 2, true)}$ €.<br>
          Quel est le pourcentage de réduction ?`
              texteCorr = `La réduction est de $${a}-${texNombre(a * 0.75, 2, true)}=${texNombre(0.25 * a, 2, true)}$.<br>
          Le prix de départ était de $${a}$ €. Le pourcentage de réduction est donné par : $\\dfrac{${texNombre(0.25 * a, 2, true)}}{${a}}=0,25=${miseEnEvidence(25)}\\,\\%$. `
              reponse = 25
            } else {
              a = randint(2, 7) * 10
              b = randint(1, 4) * 10
              c = arrondi(1 - b / 100, 2)
              texte = `Un article à $${a}$ € est soldé à $${texNombre(a * c, 2, true)}$ €.<br>
            Quel est le pourcentage de réduction ?`
              texteCorr = `La réduction est de $${a}-${texNombre(a * c, 2, true)}=${texNombre(a - a * c, 2, true)}$.<br>
            Le prix de départ était de $${a}$ €. Le pourcentage de réduction est donné par : $\\dfrac{${texNombre(a - a * c, 2, true)}}{${a}}=${texNombre(b / 100, 2)}=${miseEnEvidence(b)}\\,\\%$. `
              reponse = b
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + '%'
            }
          }
          break
      }

      // Si la question n'a jamais été posée, on en créé une autre
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
      index++
    }
  }
}
