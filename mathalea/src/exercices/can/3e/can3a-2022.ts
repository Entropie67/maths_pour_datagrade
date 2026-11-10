import { orangeMathalea } from '../../../lib/colors'
import { pgcd } from '../../../lib/outils/primalite'
import Decimal from 'decimal.js'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { polygone, polygoneAvecNom } from '../../../lib/2d/polygones'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import { sp } from '../../../lib/outils/outilString'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import Hms from '../../../modules/Hms'
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
import { prenomM } from '../../../lib/outils/Personne'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'

export const titre = 'CAN 3e sujet 2022'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '19/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = '6a087'

export const refs = {
  'fr-fr': ['can3a-2022'],
  'fr-ch': [],
}
export default class SujetCAN2022troisieme extends Exercice {
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
    const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 7 possibles.
    const nbQ2 = Math.min(this.nbQuestions - nbQ1, 20)
    const typeQuestionsDisponiblesNiv1 = shuffle([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
      .slice(-nbQ1)
      .sort(compareNombres)
    const typeQuestionsDisponiblesNiv2 = shuffle([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
      29, 30,
    ])
      .slice(-nbQ2)
      .sort(compareNombres)
    const typeQuestionsDisponibles = numerosQuestionsCan(
      this,
      typeQuestionsDisponiblesNiv1.concat(typeQuestionsDisponiblesNiv2),
    )
    const listeFractions23 = [
      [3, 2],
      [1, 2],
      [3, 4],
      [1, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [11, 2],
      [7, 2],
      [9, 2],
    ]
    const listeFractions11 = [
      [2, 3],
      [5, 8],
      [3, 5],
      [5, 6],
      [5, 7],
      [5, 9],
      [3, 7],
      [6, 7],
      [5, 4],
      [4, 5],
    ]
    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse:
          number | string | string[] | Decimal | ReturnType<typeof fraction> =
          0,
        fraction23,
        poly,
        propositions,
        partieDec1,
        partieDec2,
        chiffre: Array<[string, number]>,
        chiffre2: Array<[string, number]>,
        u,
        moy,
        a3,
        k1,
        k2,
        e,
        f,
        g,
        choix,
        a,
        b,
        c,
        d,
        p,
        k,
        A,
        B,
        C,
        D,
        I,
        J,
        K,
        xmin,
        xmax,
        ymin,
        ymax,
        objets,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(4, 9)
          b = randint(4, 9)
          texte = `$${a} \\times ${b}=$ `
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          reponse = a * b
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
          chiffre = [
            ['un', 1],
            ['deux', 2],
            ['trois', 3],
            ['cinq', 5],
            ['quatre', 4],
            ['six', 6],
            ['sept', 7],
            ['huit', 8],
            ['neuf', 9],
          ]
          chiffre2 = [
            ['vingt', 20],
            ['trente', 30],
            ['quarante', 40],
            ['cinquante', 50],
            ['soixante', 60],
          ]
          a = randint(0, 8)
          b = randint(0, 4)
          c = randint(0, 8)
          d = randint(0, 4)
          if (choice([true, false])) {
            chiffre = [
              ['un', 1],
              ['deux', 2],
              ['trois', 3],
              ['cinq', 5],
              ['quatre', 4],
              ['six', 6],
              ['sept', 7],
              ['huit', 8],
              ['neuf', 9],
            ]
            chiffre2 = [
              ['vingt', 20],
              ['trente', 30],
              ['quarante', 40],
              ['cinquante', 50],
              ['soixante', 60],
            ]
            a = randint(0, 8)
            b = randint(0, 4)
            c = randint(0, 8)
            d = randint(0, 4)
            if (a === 0) {
              texte = `Écris en chiffres le nombre : <br>
              ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre[c][0]} `
              reponse = (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1]
              texteCorr = ` ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre[c][0]}$=
              ${(chiffre2[b][1] + chiffre[a][1]) * 1000} + ${chiffre[c][1]}=${miseEnEvidence((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1])}$ `
            } else {
              texte = `Écris en chiffres le nombre : <br>
                          ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre[c][0]} `
              reponse = (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1]
              texteCorr = ` ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre[c][0]}$=
                          ${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)} + ${chiffre[c][1]}=${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1]))}$ `
            }
          } else {
            if (a === 0) {
              texte = `Écris en chiffres le nombre : <br>
              ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre2[d][0]} `
              reponse = (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1]
              texteCorr = ` ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre2[d][0]}$=
              ${(chiffre2[b][1] + chiffre[a][1]) * 1000} + ${chiffre2[d][1]}=${miseEnEvidence((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1])}$ `
            } else {
              texte = `Écris en chiffres le nombre : <br>
                          ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre2[d][0]} `
              reponse = (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1]
              texteCorr = ` ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre2[d][0]}$=
                          ${(chiffre2[b][1] + chiffre[a][1]) * 1000} + ${chiffre2[d][1]}=${miseEnEvidence((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1])}$ `
            }
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

        case 3:
          a = randint(51, 98, [49, 59, 69, 79, 89])
          b = choice([19, 29])
          reponse = a - b
          texte = `$${a}-${b}=$ `
          texteCorr = `$${a}-${b}=${a}-${b + 1}+1=${miseEnEvidence(a - b)}$ `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 4:
          if (choice([true, false])) {
            a = randint(1, 13) * 50
            reponse = new Decimal(a).div(100)
            texte = `$${a}\\text{ cm}$ $=$`

            texteCorr = `
        Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $1\\text{ cm}$ $=0,01\\text{ m}$.<br>
        Ainsi pour passer des $\\text{m}$ aux $\\text{cm}$, on divise par $100$.<br>
          Comme : $${a}\\div 100 =${texNombre(reponse, 2)}$<br> alors $${a}\\text{ cm}=${miseEnEvidence(texNombre(reponse, 2))}\\text{ m}$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                ) + '$\\text{ m}$'
            } else {
              texte += ' $\\ldots\\text{ m}$'
            }
          } else {
            a = new Decimal(randint(1, 9)).div(10).plus(randint(1, 9))
            reponse = a.mul(100)
            texte = `$${texNombre(a, 1)}\\text{ m}$ $=$ `
            texteCorr = ` Comme $1\\text{ m}$ $=100\\text{ cm}$, pour passer des $\\text{m}$ aux $\\text{cm}$, on multiplie par $100$.<br>
                Comme : $${texNombre(a, 1)}\\times 100 =${texNombre(reponse, 0)}$, alors $${texNombre(a, 2)}\\text{ m}=${miseEnEvidence(texNombre(reponse, 0))}\\text{ cm}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += ' $\\ldots\\text{ cm}$'
            }
          }
          nbChamps = 1

          break
        case 5:
          a = randint(31, 89, [40, 50, 60, 70, 80])
          choix = choice(['a', 'b'])
          if (choix === 'a') {
            if (choice([true, false])) {
              texte = `$2\\times${a}\\times 5=$
             `
              texteCorr = `$2\\times${a}\\times 5=10\\times ${a}=${miseEnEvidence(10 * a)}$`
            } else {
              texte = `$5\\times${a}\\times 2=$
             `
              texteCorr = `$5\\times${a}\\times 2=10\\times ${a}=${miseEnEvidence(10 * a)}$`
            }

            reponse = 10 * a
          }
          if (choix === 'b') {
            if (choice([true, false])) {
              texte = `$4\\times${a}\\times 25=$
             `
              texteCorr = `$4\\times${a}\\times 25=100\\times ${a}=${miseEnEvidence(100 * a)}$`
            } else {
              texte = `$50\\times${a}\\times 2=$
             `
              texteCorr = `$50\\times${a}\\times 2=100\\times ${a}=${miseEnEvidence(100 * a)}$`
            }

            reponse = 100 * a
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

        case 6:
          u = randint(21, 99)
          a = randint(1, 9)
          c = randint(1, 9)
          partieDec1 = new Decimal(a).div(10)
          partieDec2 = new Decimal(c).div(1000)
          a3 = partieDec1.plus(partieDec2)
          reponse = a3.plus(u)

          if (choice([true, false])) {
            texte = `Écris sous forme décimale : $${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$ `
            texteCorr = `$${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(a / 10, 1)}+${texNombre(c / 1000, 3)}=
            ${miseEnEvidence(texNombre(reponse, 3))}$`
          } else {
            texte = `Écris sous forme décimale : $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}$ `
            texteCorr = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}=${u}+${texNombre(c / 1000, 3)}+${texNombre(a / 10, 1)}=
            ${miseEnEvidence(texNombre(reponse, 3))}$
             `
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

        case 7:
          a = randint(1, 9)
          b = randint(3, 9)
          c = randint(3, 9)
          reponse = a + b * c
          texte = `$${a}+${b}\\times ${c}=$`
          texteCorr = `La multiplication est prioritaire : $${a}+${b}\\times ${c}=${a}+${b * c}=${miseEnEvidence(a + b * c)}$
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

        case 8:
          a = randint(42, 98, [49, 51, 59, 61, 69, 71, 79, 81, 89])
          b = choice([19, 29])
          reponse = a + b
          texte = `$${a}+${b}=$ `
          texteCorr = `$${a}+${b}=${a}+${b + 1}-1=${miseEnEvidence(a + b)}$ `

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

        case 9:
          choix = choice(['a', 'b', 'c']) //, 'b'
          if (choix === 'a') {
            a = new Decimal(randint(1, 9)).div(10).plus(randint(45, 49))
            b = new Decimal(randint(1, 9)).div(10).plus(randint(2, 5))
            texteCorr = `En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $50\\times ${b.round()}=${b.round().mul(50)}$.`
          }
          if (choix === 'b') {
            a = new Decimal(randint(1, 9)).div(10).plus(randint(3, 9))
            b = new Decimal(randint(1, 9)).div(10).plus(randint(2, 5))
            texteCorr = `En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $${a.round()}\\times ${b.round()}=${a.round().mul(b.round())}$.`
          }
          if (choix === 'c') {
            a = new Decimal(randint(1, 9)).div(10).plus(randint(45, 49))
            b = new Decimal(randint(1, 9)).div(10).plus(randint(25, 29))
            texteCorr =
              'En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $30\\times 50=1500$.'
          }
          if (!(a instanceof Decimal) || !(b instanceof Decimal))
            throw new Error('Facteurs décimaux non initialisés')
          propositions = shuffle([
            `$${texNombre(a.mul(b).div(10), 3)}$`,
            `$${texNombre(a.mul(b).mul(10), 1)}$`,
            `$${texNombre(a.mul(b), 2)}$`,
          ])
          reponse = a.mul(b)
          handleAnswers(this, index, { reponse: { value: reponse } })
          texte = `Recopie le résultat de :
            $${texNombre(a, 1)}\\times ${texNombre(b, 1)}$<br>`
          texte += `${propositions[0]} ${sp(6)} ${propositions[1]} ${sp(6)} ${propositions[2]}`
          texteCorr += `<br>On en déduit que la bonne réponse est $${miseEnEvidence(texNombre(reponse, 2))}$.`
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
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(1, 9, b)
          f = a * 100 + b * 10 + c
          d = choice([
            new Decimal('0.1'),
            new Decimal('0.01'),
            new Decimal('0.001'),
          ])
          reponse = d.mul(f)
          texte = `$${f}\\times ${texNombre(d, 3)}=$`
          texteCorr = `$${f}\\times ${texNombre(d, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$<br>`
          texteCorr += `
          $${f}\\times ${texNombre(d, 3)}=${f}\\div ${texNombre(Decimal.pow(d, -1), 0)}=${texNombre(reponse, 3).slice(0, -1)}\\underline{${texNombre(reponse, 3).slice(-1)}}$ `

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

        case 11:
          a = choice(listeFractions11)
          b = fraction(a[0], a[1])
          k = randint(4, 9)
          texte = `Complète :<br>
          $\\dfrac{${a[0]}}{${a[1]}}=\\dfrac{\\ldots}{${a[1] * k}}$`

          texteCorr = `Le dénominateur a été multiplié par $${k}$, donc le numérateur est $${a[0]}\\times ${k}=${miseEnEvidence(a[0] * k)}$.<br>
          Ainsi, $\\dfrac{${a[0]}}{${a[1]}}=\\dfrac{${a[0] * k}}{${a[1] * k}}$.`

          reponse = a[0] * k
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

        case 12:
          a = randint(1, 9)
          b = randint(1, 5, a)

          reponse = a ** 2 + 2 * b ** 2
          texte = `$a=${a}$ et $b=${b}$<br>
          Calcule $a^2+2\\times b^2$`
          reponse = a ** 2 + 2 * b ** 2
          texteCorr = `$a^2+2\\times b^2=${a}^2+2\\times ${b}^2=${a ** 2}+2\\times ${b ** 2}=${a ** 2}+${2 * b ** 2}=${miseEnEvidence(reponse)}$ `

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

        case 13:
          reponse = randint(1, 25)
          a = new Decimal(reponse).div(100)
          texte = `Complète :<br>
          $${texNombre(a, 2)}=$`

          texteCorr = `$${texNombre(a, 2)}=\\dfrac{${texNombre(reponse, 0)}}{100}=${miseEnEvidence(texNombre(reponse, 0))}\\,\\%$ `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              ) + '$\\%$'
          } else {
            texte += '$\\ldots \\%$'
          }
          nbChamps = 1

          break

        case 14:
          if (choice([true, false])) {
            a = new Decimal(randint(1, 9)).div(10).plus(randint(2, 9))
            b = randint(2, 9, 5)
            c = 10 - b
            texte = `$${b}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${c}=$
    `
            texteCorr = ` On factorise : <br> $\\begin{aligned}
    ${b}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${c}&=${texNombre(a, 1)}\\times \\underbrace{(${b}+${c})}_{=10}\\\\
    &=${texNombre(a, 1)}\\times 10\\\\
    &=${miseEnEvidence(texNombre(a.mul(10), 0))}
    \\end{aligned}$`
            reponse = a.mul(10)
          } else {
            a = new Decimal(randint(5, 99)).div(10)
            b = new Decimal(randint(2, 9)).mul(5)
            c = new Decimal(b.sub(100)).mul(-1)
            texte = `$${texNombre(b, 0)}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${texNombre(c, 0)}=$
      `
            texteCorr = ` On factorise : <br> $\\begin{aligned}
      ${b}\\times${texNombre(a, 1)} + ${texNombre(a, 1)}\\times${texNombre(c, 0)}&=${texNombre(a, 1)}\\times \\underbrace{(${b}+${c})}_{=100}\\\\
      &=${texNombre(a, 1)}\\times 100\\\\
      &=${miseEnEvidence(texNombre(a.mul(100), 0))}
      \\end{aligned}$`
            reponse = a.mul(100)
          }

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

        case 15:
          moy = randint(10, 15)
          k1 = choice([1.5, 2.5, 3.5])
          k2 = choice([4.5, 5.5, 6.5])
          a = moy - k2
          b = moy - k1
          c = moy + k1
          d = moy + k2
          texte = `Calcule la moyenne de :<br>
         $${texNombre(a, 1)}$ ${sp(4)} $${texNombre(b, 1)}$${sp(4)}$${texNombre(c, 1)}$${sp(4)}$${texNombre(d, 1)}$`

          texteCorr = `$\\underbrace{${texNombre(a, 1)}}_{${texNombre(moy)}-${texNombre(k2)}}$ ${sp(4)} $\\underbrace{${texNombre(b, 1)}}_{${texNombre(moy)}-${texNombre(k1)}}$ ${sp(4)}$${texNombre(moy)}$${sp(4)}
          $\\underbrace{${texNombre(c, 1)}}_{${texNombre(moy)}+${texNombre(k1)}}$${sp(4)}$\\underbrace{${texNombre(d, 1)}}_{${texNombre(moy)}+${texNombre(k2)}}$<br>
          La moyenne est donc $${miseEnEvidence(moy)}$.`

          reponse = moy
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
          a = randint(3, 6)
          b = randint(4, 5)
          c = a * b
          b = b * 2
          A = pointAbstrait(0, 0, 'A', 'below')
          B = pointAbstrait(0, 4, 'B', 'above')
          C = pointAbstrait(6, 0, 'C', 'below')
          poly = polygone([A, B, C], 'black')
          poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
          d = texteParPosition(`${stringNombre(c)} cm²`, 1.5, 1.5)
          e = texteParPosition(`${stringNombre(a)} cm`, -0.7, 2)
          poly.epaisseur = 1
          reponse = b
          texte = 'On donne la figure suivante :<br>'

          texte += mathalea2d(
            {
              xmin: -1.5,
              ymin: -1,
              xmax: 7.1,
              ymax: 5,
              scale: 1,
            },
            poly,
            labelPoint(A, B, C),
            codageAngleDroit(B, A, C),
            d,
            e,
          )
          texteCorr = `L'aire du triangle est $\\dfrac{\\text{AB}\\times \\text{AC}}{2}=\\dfrac{${a}\\times \\text{AC}}{2}$.<br>
          On obtient ainsi, $\\dfrac{${a}\\times \\text{AC}}{2}=${c}$ soit $${a}\\times AC=2\\times ${c}$, soit $AC=\\dfrac{${c * 2}}{${a}}=${miseEnEvidence(reponse)}\\text{ cm}$.`
          texte += ' $AC= $'
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          } else {
            texte += ' $\\ldots\\text{ cm}$'
          }
          nbChamps = 1
          break

        case 17:
          a = randint(1, 5)
          b = choice([
            new Decimal('0.25'),
            new Decimal('0.5'),
            new Decimal('0.75'),
          ])
          d = arrondi(b.mul(60).toNumber())
          if (!this.interactif) {
            texte = `Convertir en heures/minutes : <br>$${texNombre(b.plus(a), 2)}$ h $=$ $\\ldots\\ldots$ h $\\ldots\\ldots$ min`
            texteCorr = `$${texNombre(b.plus(a), 2)}$h$ = ${a}$ h $ + ${texNombre(b, 2)} \\times 60 = ${miseEnEvidence(`${a}\\text{ h }${texNombre(d, 0)}\\text{ min}`)}$`
          } else {
            texte = `Convertir en heures/minutes : <br>$${texNombre(b.plus(a), 2)}$ h $=$`
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
            texteCorr = `$${texNombre(b.plus(a), 2)}\\text{ h } = ${a}\\text{ h }+${texNombre(b, 2)} \\times 60\\text{ min } = ${miseEnEvidence(`${a}\\text{ h }${texNombre(d, 0)}\\text{ min}`)}$`

            nbChamps = 1
          }
          break

        case 18:
          a = randint(1, 9)
          p = randint(2, 9, 5)
          reponse = a * p
          a = a * 10
          p = p * 10
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
        case 19:
          a = randint(1, 9) * 10 + 5
          b = 100 - a
          c = randint(6, 39, [a, 10, 20, 30])
          d = 100 - c
          e = randint(4, 9)
          reponse = 200 + e
          if (choice([true, false])) {
            texte = `$${a}+${c}+${b}+${d}+${e}=$
      `
            texteCorr = `$${a}+${c}+${b}+${d}+${e}=\\underbrace{${a}+${b}}_{=100}+\\underbrace{${c}+${d}}_{=100}+${e}=${miseEnEvidence(reponse)}$
          `
          } else {
            texte = `$${a}+${e}+${c}+${b}+${d}=$
          `
            texteCorr = `$${a}+${e}+${c}+${b}+${d}=\\underbrace{${a}+${b}}_{=100}+\\underbrace{${c}+${d}}_{=100}+${e}=${miseEnEvidence(reponse)}$
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
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 20:
          partieDec1 = new Decimal(randint(1, 9)).div(10)
          partieDec2 = new Decimal(randint(1, 9)).div(100)
          a = new Decimal(randint(1, 9)).add(partieDec1).add(partieDec2)
          b = choice([new Decimal('0.1'), new Decimal('0.01')])

          reponse = a.div(b)

          texte = `$${texNombre(a, 2)}\\div ${texNombre(b, 2)}=$
      `
          texteCorr = `$${texNombre(a, 2)}\\div ${texNombre(b, 2)}=${texNombre(a, 2)}\\times ${texNombre(Decimal.pow(b, -1), 0)}=${miseEnEvidence(texNombre(reponse, 2))}$.
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

        case 21:
          a = new Decimal(randint(1, 9)).div(10).plus(randint(3, 5))
          b = a.mul(-1).plus(randint(6, 10))
          c = b.mul(10)
          A = pointAbstrait(0, 0, 'A', 'below')
          B = pointAbstrait(5, 1, 'B', 'below')
          C = pointAbstrait(6, 4, 'C', 'above')
          D = pointAbstrait(1, 3, 'D', 'above')
          poly = polygone([A, B, C, D], 'black')
          reponse = a.plus(b).mul(2)
          d = texteParPosition(`${stringNombre(a)} cm`, 6.3, 2)
          e = texteParPosition(`${stringNombre(c)} mm`, 3, 4)
          poly.epaisseur = 1

          texte = 'Périmètre du parallélogramme $ABCD$ :<br> '
          texte += mathalea2d(
            {
              xmin: -1.5,
              ymin: -1,
              xmax: 7.6,
              ymax: 6,
              scale: 0.7,
            },
            poly,
            labelPoint(A, B, C, D),
            d,
            e,
          )
          texteCorr = `Le périmètre en cm est donné par :
          $2\\times ${texNombre(a, 1)}+2\\times ${texNombre(b, 1)} =2\\times(${texNombre(a, 1)}+${texNombre(b, 1)})=${miseEnEvidence(texNombre(reponse, 0))}\\text{ cm}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ' <br>$\\mathscr{P}= $'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          } else {
            texte += ' $\\mathscr{P}=\\ldots \\text{ cm}$'
          }
          nbChamps = 1
          break

        case 22:
          a = randint(2, 9) * choice([-1, 1])
          b = randint(2, 9) * choice([-1, 1])
          c = randint(2, 9) * choice([-1, 1])
          d = randint(2, 9) * choice([-1, 1])
          e = randint(2, 9) * choice([-1, 1])
          f = randint(2, 9) * choice([-1, 1])
          g = randint(2, 9) * choice([-1, 1])
          choix = choice(['a', 'b', 'c'])
          if (choix === 'a') {
            texte = `Calcule : <br>
            $\\dfrac{${a}}{${b}}\\times\\dfrac{${c}}{${d}}\\times\\dfrac{0}{${e}}\\times\\dfrac{${f}}{${g}}$ `
            reponse = fraction(0, 1)
            texteCorr = `Il s'agit d'un produit avec un facteur nul, donc le résultat est $${miseEnEvidence(0)}$.`
          }
          if (choix === 'b') {
            if (choice([true, false])) {
              texte = `Calcule : <br>
            $\\dfrac{${a}}{${b}}\\times\\dfrac{${c}}{${d}}\\times\\dfrac{${d}}{${a}}\\times\\dfrac{${b}}{${c}}$ `
              reponse = fraction(3, 3)
              texteCorr = `En simplifiant, on obtient : <br>
            $\\dfrac{${a}}{${a}}\\times\\dfrac{${b}}{${b}}\\times\\dfrac{${c}}{${c}}\\times\\dfrac{${d}}{${d}}=${miseEnEvidence(1)}$.`
            } else {
              texte = `Calcule : <br>
    $\\dfrac{${a}}{${b}}\\times\\dfrac{${-c}}{${d}}\\times\\dfrac{${d}}{${a}}\\times\\dfrac{${b}}{${c}}$ `
              reponse = fraction(-3, 3)
              texteCorr = `En simplifiant, on obtient : <br>
    $\\dfrac{${a}}{${a}}\\times\\dfrac{${b}}{${b}}\\times\\dfrac{${d}}{${d}}\\times\\dfrac{${-c}}{${c}}=${miseEnEvidence(-1)}$.`
            }
          }
          if (choix === 'c') {
            if (choice([true, false])) {
              texte = `Calcule : <br>
            $\\dfrac{${a}}{${f}}\\times\\dfrac{${c}}{${d}}\\times\\dfrac{${d}}{${a}}\\times\\dfrac{${e}}{${c}}$ `
              reponse = fraction(e, f)
              texteCorr = `En simplifiant, on obtient : <br>
            $\\dfrac{${a}}{${a}}\\times\\dfrac{${c}}{${c}}\\times\\dfrac{${d}}{${d}}\\times\\dfrac{${e}}{${f}}=${pgcd(e, f) === 1 && e * f > 0 ? miseEnEvidence(`\\dfrac{${e}}{${f}}`) : `\\dfrac{${e}}{${f}}${simplificationDeFractionAvecEtapes(e, f, { couleur2: orangeMathalea })}`}$.`
            } else {
              texte = `Calcule : <br>
    $\\dfrac{${a}}{${b}}\\times\\dfrac{${e}}{${d}}\\times\\dfrac{${d}}{${a}}\\times\\dfrac{${b}}{${f}}$ `
              reponse = fraction(e, f)
              texteCorr = `En simplifiant, on obtient : <br>
    $\\dfrac{${a}}{${a}}\\times\\dfrac{${b}}{${b}}\\times\\dfrac{${d}}{${d}}\\times\\dfrac{${e}}{${f}}=${pgcd(e, f) === 1 && e * f > 0 ? miseEnEvidence(`\\dfrac{${e}}{${f}}`) : `\\dfrac{${e}}{${f}}${simplificationDeFractionAvecEtapes(e, f, { couleur2: orangeMathalea })}`}$.`
            }
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
        case 23:
          fraction23 = choice(listeFractions23)
          a = fraction(fraction23[0], fraction23[1])
          k = randint(3, 9)
          reponse = fraction23[0] / fraction23[1]
          texte = `Écriture décimale de $\\dfrac{${fraction23[0] * k}}{${fraction23[1] * k}}$.`
          texteCorr = `En simplifiant, on obtient : $\\dfrac{${fraction23[0] * k}}{${fraction23[1] * k}}=\\dfrac{${fraction23[0]}}{${fraction23[1]}}=${miseEnEvidence(texNombre(reponse, 2))}$`

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

        case 24:
          a = randint(1, 9) * 10
          b = randint(-9, -2) * 10
          reponse = b - a
          texte = `Complète :<br>
          $${a}+$ `

          texteCorr = `Le nombre cherché est $${b}-${a}=${miseEnEvidence(b - a)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '$($'
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBase,
              ) + `$)=${b}$`
          } else {
            texte += `$\\ldots=${b}$`
          }
          nbChamps = 1

          break

        case 25:
          a = choice([2, 3, 6]) // diviseur de l'heure
          b = new Decimal(60).div(a) // nombre de minutes de l'énoncé
          c = new Decimal(choice([30, 60, 90, 120]))
          reponse = c.div(a)
          texte = `Un véhicule se déplace à vitesse constante de $${c}\\text{ km/h}$. Combien de $\\text{km}$ parcourt-il en $${b}$ minutes ?`
          texteCorr = `Le véhicule parcourt $${texNombre(reponse, 0)}\\text{ km}$.<br>
         En $${texNombre(b, 0)}$ minutes, il parcourt $${texNombre(a, 0)}$ fois moins de $\\text{km}$ qu'en $1$ heure, soit $\\dfrac{${texNombre(c, 0)}}{${texNombre(a, 0)}}=
          ${miseEnEvidence(texNombre(reponse, 0))}\\text{ km}$.`
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

        case 26:
          if (choice([true, false])) {
            a = randint(2, 6)
            b = randint(7, 10, a + 1)
            I = pointAbstrait(0, 0, 'I', 'below')
            K = pointAbstrait(4, 0, 'K', 'below')
            J = pointAbstrait(0, 6, 'J', 'above')

            xmin = -1.6
            ymin = -1
            xmax = 4.5
            ymax = 6.8
            poly = polygoneAvecNom(I, J, K)
            objets = []
            objets.push(poly[0])
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(I, K).x,
                milieu(I, K).y - 0.3,
              ),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(J, K).x + 0.7,
                milieu(J, K).y,
              ),
              labelPoint(I, J, K),
              codageAngleDroit(J, I, K),
            )
            propositions = shuffle([
              `$IJ=\\sqrt{${a ** 2 + b ** 2}}$`,
              `$IJ=\\sqrt{${b ** 2 - a ** 2}}$`,
              `$IJ=\\sqrt{${a + b}}$`,
              `$IJ=${b - a}$`,
            ])

            reponse = [`\\sqrt{${b ** 2 - a ** 2}}`]
            texte = 'Recopie la bonne réponse. <br>'
            texte += `${propositions[0]} ${sp(7)} ${propositions[1]} ${sp(7)} ${propositions[2]}${sp(7)} ${propositions[3]}<br>`
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 25,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )

            texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $IJK$ :<br>
              On a $IJ^2=JK^2-IK^2$, soit $IJ^2=${b}^2-${a}^2=${b ** 2 - a ** 2}$.<br>
              Par conséquent, $IJ=${miseEnEvidence(`\\sqrt{${b ** 2 - a ** 2}}`)}$.`
          } else {
            a = randint(2, 6)
            b = randint(7, 10, a + 1)
            I = pointAbstrait(0, 0, 'K', 'below')
            K = pointAbstrait(4, 0, 'I', 'below')
            J = pointAbstrait(0, 6, 'J', 'above')

            xmin = -1.6
            ymin = -1
            xmax = 4.5
            ymax = 6.8
            poly = polygoneAvecNom(I, J, K)
            objets = []
            objets.push(poly[0])
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(I, K).x,
                milieu(I, K).y - 0.3,
              ),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(J, I).x - 0.8,
                milieu(J, I).y,
              ),
              labelPoint(I, J, K),
              codageAngleDroit(J, I, K),
            )
            propositions = shuffle([
              `$IJ=\\sqrt{${a ** 2 + b ** 2}}$`,
              `$IJ=\\sqrt{${b ** 2 - a ** 2}}$`,
              `$IJ=\\sqrt{${a + b}}$`,
              `$IJ=${b - a}$`,
            ])

            reponse = [`\\sqrt{${b ** 2 + a ** 2}}`]
            texte = 'Recopie la bonne réponse. <br>'
            texte += `${propositions[0]} ${sp(7)} ${propositions[1]} ${sp(7)} ${propositions[2]}${sp(7)} ${propositions[3]}<br>`
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 25,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )

            texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $IJK$ :<br>
                    On a $IJ^2=JK^2+IK^2$, soit $IJ^2=${b}^2+${a}^2=${b ** 2 + a ** 2}$.<br>
                    Par conséquent, $IJ=${miseEnEvidence(`\\sqrt{${b ** 2 + a ** 2}}`)}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>$IJ=$'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierFullOperations,
            )
          }
          nbChamps = 1
          break
        case 27: {
          a = randint(7, 10)
          b = choice([25, 30, 35, 40, 45])
          c = randint(36, 58)
          const Benoît = prenomM()
          if (!this.interactif) {
            texte = `${Benoît} prend le départ d'un marathon à $${a}$h $${b}$. <br>
            Il parcourt la distance en $3$ h $${c}$ min. <br>
            À quelle heure arrive-t-il ?<br>
             $\\ldots\\ldots$ h $\\ldots\\ldots$ min`
          } else {
            texte = `${Benoît} prend le départ d'un marathon à $${a}$h $${b}$. <br>
            Il parcourt la distance en $3$ h $${c}$ min. <br>
            À quelle heure arrive-t-il ?<br>`
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )

            handleAnswers(this, index, {
              reponse: {
                value: new Hms({ hour: a + 4, minute: c - 60 + b }).toString(),
                options: { HMS: true },
              },
            })

            nbChamps = 1
          }
          texteCorr = `On ajoute $3$ h à $${a}$h $${b}$. Cela fait $${a + 3}$h $${b}$.<br>
          On complète l'heure avec $60-${b}$ min soit $${60 - b}$. Il reste $${c}-${60 - b}$ soit $${c - 60 + b}$ min qu'il faut encore ajouter.<br>
          ${Benoît} arrive à $${miseEnEvidence(`${a + 4}\\text{ h }${formatMinute(c - 60 + b)}\\text{ min}`)}$.`

          break
        }
        case 28:
          a = choice([10, 20, 25, 50])
          if (a === 10) {
            b = randint(4, 9)
          } else {
            b = randint(11, 19)
          }
          reponse = (100 / a) * b
          texte = `Sur $${a}$ élèves, $${b}$ ont voté pour Sylvie.<br>
          Quel est le pourcentage de voix de Sylvie ?
      `
          texteCorr = `$${a}\\times ${100 / a}=100$, donc s'il y avait $100$ élèves, le nombre de voix de Sylvie serait $${100 / a}\\times ${b}=${reponse}$.<br>
          Ainsi, le pourcentage de voix de Sylvie est $${miseEnEvidence(reponse)}\\,\\%$.

          `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              ) + '$\\%$'
          }
          nbChamps = 1
          break

        case 29: {
          a = choice([-3, -2, -1, 2, 3])
          const multiplicateurs: Array<[string, number]> = [
            ['double', 2],
            ['triple', 3],
          ]
          const multiplicateur = choice(multiplicateurs)

          reponse = multiplicateur[1] * 10 ** a
          texte = `Le ${multiplicateur[0]} de $10^{${a}}$ est : `
          texteCorr = `Le ${multiplicateur[0]} de $10^{${a}}$ est : $${multiplicateur[1]}\\times 10^{${a}} =${multiplicateur[1]}\\times${texNombre(10 ** a)}=${miseEnEvidence(texNombre(multiplicateur[1] * 10 ** a, 3))}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBase,
            )
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break
        }
        case 30:
          if (choice([true, false])) {
            b = randint(1, 9)
            c = randint(0, 9)
            d = randint(0, 9, [b, c])
            a = arrondi(b * 100 + c * 10 + d)
            reponse = a % 3
            texte = `Quel est le reste de la division euclidienne de $${a}$ par $3$ ?`
            if (a % 3 === 0) {
              reponse = 0
              texteCorr = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
              texteCorr += ` Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
            La somme des chiffres qui composent $${a}$ est : $${b}+${c}+${d}=${b + c + d}$.<br>
         $${b + c + d}$ est un mutiple de $3$, donc le reste de la division de $${a}$ par $3$ est $0$.
            `
            }
            if (a % 3 === 2) {
              texteCorr = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
              texteCorr += `Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
            La somme des chiffres qui composent $${a}$ est : $${b}+${c}+${d}=${b + c + d}$.<br>
            $${b + c + d}$ n'est pas un mutiple de $3$. <br>
            En enlevant 2 unités à $${b + c + d}$, on obtient $${b + c + d - 2}$ qui est un multiple de $3$.<br>
            Cela signifie que $${a}-2=${a - 2}$ est un multiple de $3$.<br>
           Ainsi, le reste de la division de $${a}$ par $3$ est donc $2$.`
            }
            if (a % 3 === 1) {
              texteCorr = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
              texteCorr += `Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
           La somme des chiffres qui composent $${a}$ est : $${b}+${c}+${d}=${b + c + d}$.<br>
           $${b + c + d}$ n'est pas un mutiple de $3$. <br>
           En enlevant $1$ unité à $${b + c + d}$, on obtient $${b + c + d - 1}$ qui est un multiple de $3$.<br>
           Cela signifie que $${a}-1=${a - 1}$ est un multiple de $3$.<br>
          Ainsi, le reste de la division de $${a}$ par $3$ est donc $1$.`
            }
          } else {
            b = randint(1, 9)
            c = randint(0, 9)
            d = randint(0, 9, [b, c])
            a = arrondi(b * 100 + c * 10 + d)
            reponse = a % 2
            texte = `Quel est le reste de la division euclidienne de $${a}$ par $2$ ?`
            if (a % 2 === 0) {
              texteCorr = `
            Le nombre est pair, le reste de la division de $${a}$ par $2$ est donc $${miseEnEvidence(0)}$.
             `
            }
            if (a % 2 === 1) {
              texteCorr = `
             Le nombre est impair, le reste de la division de $${a}$ par $2$ est donc $${miseEnEvidence(1)}$.
              `
            }
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
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
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
