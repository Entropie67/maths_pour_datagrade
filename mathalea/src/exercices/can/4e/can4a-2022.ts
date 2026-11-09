import { pgcd } from '../../../lib/outils/primalite'
import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../../lib/2d/polygones'
import { repere } from '../../../lib/2d/reperes'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { arrondi, range1 } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

export const titre = 'CAN 4e sujet 2022'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '01/05/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = 'cf47f'

export const refs = {
  'fr-fr': ['can4a-2022'],
  'fr-ch': [],
}
export default class SujetCAN2022quatrieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30 // 10,20,30
    this.sup = range1(30).join('-')
    this.sup2 = false
    this.besoinFormulaire2CaseACocher = ['Choix des questions']

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante :<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En cochant « Choix des questions », saisir les numéros des questions à afficher, séparés par des tirets.
  En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`
  }

  nouvelleVersion() {
    this.nbQuestionsModifiable = !this.sup2
    this.besoinFormulaireTexte = this.sup2
      ? [
          'Choix des questions',
          'Numéros des questions (de 1 à 30) séparés par des tirets. Par exemple : 1-3-12-30',
        ]
      : false

    let typeQuestionsDisponibles: number[]
    if (this.sup2) {
      typeQuestionsDisponibles = gestionnaireFormulaireTexte({
        saisie: String(this.sup ?? ''),
        min: 1,
        max: 30,
        defaut: 31,
        melange: 31,
        shuffle: false,
        nbQuestions: 0,
      }).map(Number)
      this.nbQuestions = typeQuestionsDisponibles.length
    } else {
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
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    }
    const listeFractions18 = [
      [8, 14],
      [6, 14],
      [4, 14],
      [6, 16],
      [10, 16],
      [8, 12],
      [8, 10],
      [10, 12],
      [6, 18],
      [4, 18],
      [12, 16],
      [14, 16],
      [14, 18],
      [2, 18],
      [2, 14],
    ]
    const listeFractions12 = [
      [1, 4],
      [3, 4],
      [3, 2],
      [5, 2],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [6, 5],
      [5, 4],
      [7, 4],
      [9, 4],
    ]
    const listeFractions24 = [
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
    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse: number | string | ReturnType<typeof fraction> = 0,
        fraction18,
        lA,
        traceA,
        indice,
        o,
        r,
        poly,
        propositions,
        chiffre: Array<[string, number]>,
        chiffre2: Array<[string, number]>,
        u,
        k1,
        k2,
        e,
        f,
        choix,
        a,
        b,
        c,
        k,
        A,
        B,
        C,
        D,
        d,
        triplet,
        pol,
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
                          ${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)} + ${chiffre2[d][1]}=${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1]))}$ `
            }
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 4:
          if (choice([true, false])) {
            a = randint(1, 13) * 50
            reponse = a / 100
            texte = `$${a}\\text{ cm}$ $=$`

            texteCorr = `
        Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $1\\text{ cm}$ $=0,01\\text{ m}$.<br>
        Ainsi pour passer des $\\text{m}$ aux $\\text{cm}$, on divise par $100$.<br>
          Comme : $${a}\\div 100 =${texNombre(a / 100, 2)}$, alors $${a}\\text{ cm}=${miseEnEvidence(texNombre(a / 100, 2))}\\text{ m}$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + 'm'
            } else {
              texte += ' $\\ldots\\text{ m}$'
            }
          } else {
            a = randint(1, 9) + randint(1, 9) / 10
            reponse = a * 100
            texte = `$${texNombre(a, 1)}\\text{ m}$ $=$ `
            texteCorr = ` Comme $1\\text{ m}$ $=100\\text{ cm}$, pour passer des $\\text{m}$ aux $\\text{cm}$, on multiplie par $100$.<br>
                Comme : $${texNombre(a, 1)}\\times 100 =${texNombre(a * 100, 0)}$, alors $${texNombre(a, 2)}\\text{ m}=${miseEnEvidence(texNombre(reponse, 0))}\\text{ cm}$.`
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
              texteCorr = `$4\\times${a}\\times 25=100\\times ${a}=${miseEnEvidence(texNombre(100 * a))}$`
            } else {
              texte = `$50\\times${a}\\times 2=$
             `
              texteCorr = `$50\\times${a}\\times 2=100\\times ${a}=${miseEnEvidence(texNombre(100 * a))}$`
            }

            reponse = 100 * a
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 6:
          u = randint(21, 99)
          a = randint(1, 9)
          c = randint(1, 9)
          reponse = u + a * 0.1 + c * 0.001
          if (choice([true, false])) {
            texte = `Écrire sous forme décimale : $${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$ `
            texteCorr = `$${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(a / 10, 1)}+${texNombre(c / 1000, 3)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$`
          } else {
            texte = `Écrire sous forme décimale : $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}$ `
            texteCorr = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}=${u}+${texNombre(c / 1000, 3)}+${texNombre(a / 10, 1)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$
             `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 9:
          choix = choice(['a', 'b', 'c']) //, 'b'
          if (choix === 'a') {
            a = randint(45, 49) + randint(1, 9) / 10
            b = randint(2, 5) + randint(1, 9) / 10

            propositions = shuffle([
              `$${texNombre((a * b) / 10, 3)}$`,
              `$${texNombre(a * b * 10, 1)}$`,
              `$${texNombre(a * b, 2)}$`,
            ])
            reponse = arrondi(a * b, 3)
            texte = `Recopie le résultat de :
            $${texNombre(a, 1)}\\times ${texNombre(b, 1)}$<br>`

            texte += `${propositions[0]} ${sp(6)} ${propositions[1]} ${sp(6)} ${propositions[2]}`
            texteCorr = `En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $50\\times ${Math.round(b)}=${50 * Math.round(b)}$.<br>
            Comme le résultat exact est proche de cet ordre de grandeur, on choisit $${miseEnEvidence(texNombre(reponse))}$ parmi les propositions.`
          }
          if (choix === 'b') {
            a = randint(3, 9) + randint(1, 9) / 10
            b = randint(2, 5) + randint(1, 9) / 10
            propositions = shuffle([
              `$${texNombre((a * b) / 10, 3)}$`,
              `$${texNombre(a * b * 10, 1)}$`,
              `$${texNombre(a * b, 2)}$`,
            ])
            reponse = arrondi(a * b, 3)
            texte = `Recopie le résultat de :
                $${texNombre(a, 1)}\\times ${texNombre(b, 1)}$<br>`

            texte += `${propositions[0]} ${sp(6)} ${propositions[1]} ${sp(6)} ${propositions[2]}`
            texteCorr = `En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $${Math.round(a)}\\times ${Math.round(b)}=${Math.round(a) * Math.round(b)}$.<br>
            Comme le résultat exact est proche de cet ordre de grandeur, on choisit $${miseEnEvidence(texNombre(reponse))}$ parmi les propositions.`
          }
          if (choix === 'c') {
            a = randint(45, 49) + randint(1, 9) / 10
            b = randint(25, 29) + randint(1, 9) / 10
            propositions = shuffle([
              `$${texNombre((a * b) / 10, 3)}$`,
              `$${texNombre(a * b * 10, 1)}$`,
              `$${texNombre(a * b, 2)}$`,
            ])
            reponse = arrondi(a * b, 3)
            texte = `Recopie le résultat de :
                    $${texNombre(a, 1)}\\times ${texNombre(b, 1)}$<br>`

            texte += `${propositions[0]} ${sp(6)} ${propositions[1]} ${sp(6)} ${propositions[2]}`
            texteCorr = `En prenant un ordre de grandeur pour chacun des deux nombres, on obtient $30\\times 50=${texNombre(1500)}$.<br>
            Comme le résultat exact est proche de cet ordre de grandeur, on choisit $${miseEnEvidence(texNombre(reponse))}$ parmi les propositions.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 10:
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(1, 9, b)
          f = a * 100 + b * 10 + c
          d = choice([0.1, 0.01, 0.001])
          reponse = arrondi(f * d, 3)

          if (d === 0.1) {
            texte = `$${f}\\times ${texNombre(d, 1)}=$`
            texteCorr = `$${f}\\times ${texNombre(d, 1)}=${miseEnEvidence(texNombre(reponse))}$`
            texteCorr += `
          $${f}\\times ${texNombre(d, 1)}=${f}\\div 10=${a}${b},\\underline{${c}}$ `
          }
          if (d === 0.01) {
            texte = `$${f}\\times ${texNombre(d, 2)}=$`
            texteCorr = `$${f}\\times ${texNombre(d, 2)}=${miseEnEvidence(texNombre(reponse))}$`
            texteCorr += `
          $${f}\\times ${texNombre(d, 2)}=${f}\\div 100=${a},${b}\\underline{${c}}$<br>
                      `
          }
          if (d === 0.001) {
            texte = `$${f}\\times ${texNombre(d, 3)}=$`
            texteCorr = `$${f}\\times ${texNombre(d, 3)}=${miseEnEvidence(texNombre(reponse))}$`
            texteCorr += `
          $${f}\\times ${texNombre(d, 3)}=${f}\\div ${texNombre(1000)}=0,${a}${b}\\underline{${c}}$<br>

             `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 11:
          a = choice([1, 10])
          b = randint(2, 199)
          texte = `$${a}\\,\\%$ de $${b} =$
         `

          texteCorr = `$${a}\\,\\%$ de $${b} =${texNombre(a / 100, 2)}\\times ${b}=${miseEnEvidence(texNombre((b * a) / 100, 2))}$.
          `

          reponse = arrondi((a / 100) * b, 2)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 12:
          a = choice(listeFractions12)
          b = fraction(a[0], a[1])

          texte = `Écris $\\dfrac{${a[0]}}{${a[1]}}$ sous forme décimale.`

          texteCorr = `$\\dfrac{${a[0]}}{${a[1]}}=${miseEnEvidence(texNombre(a[0] / a[1], 2))}$`

          reponse = arrondi(a[0] / a[1], 2)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break
        case 13:
          a = randint(7, 10)
          b = randint(4, 6)

          A = pointAbstrait(0, 0, 'A', 'below')
          B = pointAbstrait(5, 1, 'B', 'below')
          C = pointAbstrait(6, 4, 'C', 'above')
          D = pointAbstrait(1, 3, 'D', 'above')
          poly = polygone([A, B, C, D], 'black')
          reponse = 2 * (a + b)
          d = texteParPosition(`${stringNombre(b)} cm`, 6.3, 2.5)
          e = texteParPosition(`${stringNombre(a)} cm`, 3, 4.1)
          poly.epaisseur = 1

          texte = 'Calcule le périmètre du parallélogramme $ABCD$.<br> '
          texte += mathalea2d(
            {
              xmin: -1.5,
              ymin: -1,
              xmax: 8,
              ymax: 5,
              scale: 0.8,
            },
            poly,
            labelPoint(A, B, C, D),
            d,
            e,
          )
          texteCorr = `Le périmètre en cm est donné par :
            $2\\times ${a}+2\\times ${b} =2\\times(${a}+${b})=${miseEnEvidence(reponse)}\\text{ cm}$`

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

        case 14:
          a = randint(2, 9)

          texte = 'Complète :<br>'
          if (choice([true, false])) {
            reponse = -a
            if (!this.interactif) {
              texte += `$${a}+\\ldots=0$`
            } else {
              texte += `$${a}+(\\ldots)=0$`

              texte += ajouteChampTexteMathLive(this, index, '')
            }
            handleAnswers(this, index, { reponse: { value: reponse } })
            texteCorr = `$${a}+(${-a})=0$. Les nombres $${a}$ et $${miseEnEvidence(-a)}$ sont opposés.`
          } else {
            reponse = fraction(1, a)
            if (!this.interactif) {
              texte += `$${a}\\times\\ldots=1$`
            } else {
              texte += `$${a}\\times\\ldots=1$`
              texte += ajouteChampTexteMathLive(this, index, '')
            }
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })
            texteCorr = `$${a}\\times\\dfrac{1}{${a}}=1$. Les nombres $${a}$ et $${miseEnEvidence(`\\dfrac{1}{${a}}`)}$ sont inverses.`
          }

          nbChamps = 1
          break

        case 15:
          a = (randint(0, 12) * 2 + 1) / 10

          texte = `La moitié de $${texNombre(a, 2)}$ est égale à : `

          texteCorr = `La moitié de $${texNombre(a, 2)}$ est égale à $${texNombre(a, 2)}\\div 2=${miseEnEvidence(texNombre(a / 2, 2))}$.`

          reponse = arrondi(a / 2, 2)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 16:
          a = choice([1, 1.5, 2])
          b = choice([5, 10, 20, 30, 40, 25, 35, 45, 50, 55, 60])
          texte = `J'ouvre une bouteille de jus d'orange de $${texNombre(a, 1)}$ L. Je verse $${b}$ cL dans un verre.<br>
          Combien de cL reste-t-il dans la bouteille ?`

          texteCorr = `$${texNombre(a, 1)}$ L $=${texNombre(a * 100, 0)}$ cL.<br>
          Il reste donc dans la bouteille : $${texNombre(a * 100, 0)}-${b}=${miseEnEvidence(texNombre(a * 100 - b, 0))}$ cL`

          reponse = a * 100 - b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'cL'
          }
          nbChamps = 1
          break

        case 17:
          if (choice([true, false])) {
            a = randint(3, 6)
            reponse = 1
            for (indice = 1; indice < a; indice++) {
              reponse = reponse * indice
            }
            texte = `Calcule : <br>
           `
            for (indice = 1; indice < a; indice++) {
              texte += `$(${a}-${indice})$`
            }
            texteCorr = 'On a :<br>'
            for (indice = 1; indice < a; indice++) {
              texteCorr += `$(${a}-${indice})$`
            }
            texteCorr += '$=$'
            for (indice = 1; indice < a - 1; indice++) {
              texteCorr += `$${a - indice}\\times$`
            }
            for (indice = a - 1; indice < a; indice++) {
              texteCorr += `$${a - indice}$`
            }
            texteCorr += `$=${miseEnEvidence(reponse)}$`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            } else {
              texte += '$=\\ldots$'
            }
          } else {
            a = randint(3, 6)
            reponse = 0
            for (indice = 1; indice < a; indice++) {
              reponse = reponse * indice
            }
            texte = `Calcule : <br>
            `
            for (indice = 1; indice < a + 1; indice++) {
              texte += `$(${a}-${indice})$`
            }
            texteCorr = 'On a :<br>'
            for (indice = 1; indice < a + 1; indice++) {
              texteCorr += `$(${a}-${indice})$`
            }
            texteCorr += '$=$'
            for (indice = 1; indice < a; indice++) {
              texteCorr += `$${a - indice}\\times$`
            }

            texteCorr += '$0$'

            texteCorr += `$=${miseEnEvidence(reponse)}$`

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            } else {
              texte += '$=\\ldots$'
            }
          }
          nbChamps = 1
          break

        case 18:
          fraction18 = choice(listeFractions18)
          a = fraction(fraction18[0], fraction18[1])
          texte = `Complète : <br>
           $ ${a.texFraction}=\\dfrac{\\ldots}{${texNombre(1.5 * fraction18[1], 0)}}$`

          texteCorr = `$${a.texFraction}=\\dfrac{${texNombre(fraction18[0] / 2, 0)}}{${texNombre(fraction18[1] / 2, 0)}}=
          \\dfrac{3\\times ${texNombre(fraction18[0] / 2, 0)}}{3\\times${texNombre(fraction18[1] / 2, 0)}}=\\dfrac{${miseEnEvidence(texNombre((3 * fraction18[0]) / 2, 0))}}{${texNombre((3 * fraction18[1]) / 2, 0)}}$`

          reponse = arrondi(1.5 * fraction18[0], 0)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 19:
          k2 = choice([3, 4, 5])
          k1 = choice([3, 4, 5])
          b = randint(-k2 + 1, k2 - 1)
          a = randint(-k1 + 1, k1 - 1)
          r = repere({
            xUnite: k1,
            yUnite: k2,
            xMin: -k1 - 1,
            xMax: k1 + 1,
            yMin: -k2 - 1,
            yMax: k2 + 1,
            xLabelListe: [-1, 1],
            yLabelListe: [-1, 1],
            grilleSecondaire: true,
            grilleSecondaireXDistance: 1 / k1,
            grilleSecondaireYDistance: 1 / k2,
            axeXStyle: '->',
            axeYStyle: '->',
          })

          A = pointAbstrait(a, b)
          o = texteParPosition('O', -0.4, -0.6, 0, 'black') //, context.isHtml ? 1 : 0.7
          // o = latexParCoordonnees('\\text{O}', -0.3, -0.4, 'black', 15, 10, '', 7)
          lA = texteParPosition(
            'A',
            a - 0.4,
            b - 0.2,
            0,
            'red',
            context.isHtml ? 2 : 0.7,
            'milieu',
          ) //
          traceA = tracePoint(A, 'red') // Variable qui trace les points avec une croix
          traceA.taille = 4
          traceA.epaisseur = 2

          if (choice([true, false])) {
            texte = "L'abscisse du point $A$ est :<br>"
            texteCorr = `L'abscisse du point $A$ se lit sur l'axe horizontal. L'unité (sur l'axe des abscisses) est divisée en $${k1}$. <br>
            Le point $A$ a pour abscisse $${pgcd(a, k1) === 1 && a * k1 > 0 ? miseEnEvidence(`\\dfrac{${a}}{${k1}}`) : `\\dfrac{${a}}{${k1}}${simplificationDeFractionAvecEtapes(a, k1, { couleur2: orangeMathalea })}`}$.`
            reponse = fraction(a, k1)
          } else {
            texte = "L'ordonnée du point $A$ est :<br>"
            texteCorr = `L'ordonnée du point $A$ se lit sur l'axe vertical. L'unité (sur l'axe des ordonnées) est divisée en $${k2}$. <br>
            Le point $A$ a pour ordonnée $${pgcd(b, k2) === 1 && b * k2 > 0 ? miseEnEvidence(`\\dfrac{${b}}{${k2}}`) : `\\dfrac{${b}}{${k2}}${simplificationDeFractionAvecEtapes(b, k2, { couleur2: orangeMathalea })}`}$.`
            reponse = fraction(b, k2)
          }
          texte += mathalea2d(
            {
              xmin: -k1 - 1,
              xmax: k1 + 1,
              ymin: -k2 - 1,
              ymax: k2 + 1,
              scale: 0.7,
              pixelsParCm: 20,
            },
            r,
            o,
            lA,
            traceA,
          )
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 20:
          a = randint(1, 9)
          b = randint(4, 12)
          c = randint(1, 3)
          k = randint(1, 4)
          texte = `Calcule : <br>
             $${a}+\\dfrac{${k * b}}{${b - c}+${c}}=$`

          texteCorr = `$${a}+\\dfrac{${k * b}}{${b - c}+${c}}=${a}+\\dfrac{${k * b}}{${b}}=${a}+${k}=${miseEnEvidence(a + k)}$`

          reponse = a + k
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break
        case 21:
          a = choice([2, 3, 6]) // diviseur de l'heure
          b = arrondi(60 / a) // nombre de minutes de l'énoncé
          c = choice([30, 60, 90, 120])
          reponse = c / a
          texte = `Un véhicule roule à $${c}\\text{ km/h}$. Quelle distance parcourt-il en $${b}$ minutes ?`
          texteCorr = `Le véhicule parcourt $${c / a}\\text{ km}$.<br>
             En $${b}$ minutes, il parcourt $${a}$ fois moins de $\\text{km}$ qu'en $1$ heure, soit $\\dfrac{${c}}{${a}}=
              ${miseEnEvidence(c / a)}\\text{ km}$.`
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
        case 22:
          a = randint(2, 4)
          b = randint(-4, 4, [-1, 0, 1])
          c = randint(-6, -2)
          reponse = a * b * c
          texte = `Calcule : <br>
                $${a}\\times ${ecritureParentheseSiNegatif(b)}\\times (${c})=$`
          texteCorr = `$${a}\\times ${ecritureParentheseSiNegatif(b)}\\times (${c})=${a * b}\\times (${c})=${miseEnEvidence(reponse)}$`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 23:
          a = randint(-10, 10, 0)

          reponse = a ** 2
          texte = `Calcule : <br>
                  $ ${ecritureParentheseSiNegatif(a)}^2=$`
          texteCorr = `$ ${ecritureParentheseSiNegatif(a)}^2=${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(reponse)}$`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 24:
          a = choice(listeFractions24)
          b = fraction(a[0], a[1])
          k1 = choice([3, 5, 7, 9])

          texte = `Simplifie au maximum la fraction : <br>
               $\\dfrac{${b.n * k1}}{${b.d * k1}}$
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
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break
        case 25:
          a = randint(2, 6)
          b = randint(8, 15)
          d = choice([27, 30, 33, 36, 39, 42, 45, 48])

          c = d - a - b

          texte = `Quelle est la moyenne de cette série ? <br>
                $${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$
                `

          texteCorr = `La somme des $3$ valeurs est : $${a}+${b}+${c} =${d}$.<br>
                La moyenne est donc $\\dfrac{${d}}{3}=${miseEnEvidence(texNombre(d / 3, 0))}$.`

          reponse = arrondi(d / 3, 0)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 26:
          a = randint(2, 14, [5, 10]) * 2

          reponse = arrondi(1.5 * a, 0)

          if (choice([true, false])) {
            texte = `$1,5\\times ${a}=$
                  `
          } else {
            texte = `$ ${a}\\times 1,5=$
                  `
          }

          texteCorr = `$1,5\\times ${a}=${a}\\times 1,5=1\\times ${a}+\\underbrace{0,5\\times ${a}}_{=${a}\\div 2}=${a}+${texNombre(a * 0.5, 0)}=${miseEnEvidence(reponse)}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 27:
          a = randint(2, 30)
          if (choice([true, false])) {
            reponse = a * 1000
            texte = `Complète.<br>
                 $${a}$ L $=$ `
            texteCorr = `$1\\text{ dm}^3 = 1$ L et $1\\text{ dm}^3 = ${texNombre(1000)}\\text{ cm}^3$.<br>
                  $${a}\\text{ L}=${a}\\text{ dm}^3=${a} \\times ${texNombre(1000)}\\text{ cm}^3=${miseEnEvidence(texNombre(reponse, 3))}\\text{ cm}^3$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + ' cm$^3$'
            } else {
              texte += '$\\ldots\\text{ cm}^3$ '
            }
          } else {
            reponse = arrondi(a / 1000, 3)
            texte = `Complète.<br>
                   $${a}\\text{ cm}^3$ $=$ `
            texteCorr = `$1\\text{ dm}^3 = 1$ L et $1\\text{ cm}^3 = 0,001\\text{ dm}^3$.<br>
                   $${a}\\text{ cm}^3 = ${a} \\div ${texNombre(1000)}\\text{ dm}^3= ${texNombre(a / 1000, 3)}\\text{ dm}^3 =${miseEnEvidence(texNombre(reponse, 3))}$ L.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + ' L'
            } else {
              texte += '$\\ldots$ L '
            }
          }

          nbChamps = 1
          break

        case 28:
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
                scale: 1,
                center: !context.isHtml,
              },
              objets,
            )
            texte += '<br>$AB=$'

            texteCorr = `On utilise le théorème de Pythagore dans le triangle rectangle $ABC$ :<br>
              On a $AB^2=BC^2-AC^2$, soit $AB^2=${a[2]}^2-${a[0]}^2=${a[2] ** 2 - a[0] ** 2}$.<br>
              Par conséquent, $AB=${miseEnEvidence(a[1])}$.`
          }
          if (choix === 'b') {
            objets.push(pol[0])
            objets.push(
              texteParPosition(
                `${stringNombre(a[1])} cm`,
                milieu(A, B).x + 0.5,
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
          }
          if (choix === 'c') {
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

        case 29:
          a = randint(-6, -2, 0)
          b = randint(2, 6)
          c = randint(-6, 6, [0, 1])
          d = randint(-6, 6, [0, 1])
          reponse = a * c + b * d

          texte = `Calcule $${a}x+${b}y$ pour $x=${c}$ et $y=${d}$.
                `

          texteCorr = `$${a}x+${b}y=${a}\\times ${ecritureParentheseSiNegatif(c)}+${b}\\times ${ecritureParentheseSiNegatif(d)}=${a * c}+${ecritureParentheseSiNegatif(b * d)}=${miseEnEvidence(reponse)}$`
          if (a * c + b * d === 0) {
            handleAnswers(this, index, {
              reponse: { value: '0', options: { texteAvecCasse: true } },
            })
          } else {
            handleAnswers(this, index, { reponse: { value: a * c + b * d } })
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 30:
          a = choice([4, 6, 8, 10])
          b = a / 2
          c = randint(3, 12, a)
          reponse = arrondi(c / 2, 2)

          texte = `$${a}$ caramels coûtent $${b}$ €.<br>
          Combien coûtent $${c}$ caramels ?
                  `

          texteCorr = `Le nombre de caramels et le prix mayé sont deux grandeurs proportionnelles. <br>
            Le prix payé est la moitié du nombre de caramels. Autrement dit, le prix d'un caramels est $0,50$ €.<br>
            $${c}$ caramels coûtent donc $${c}\\times 0,5=${miseEnEvidence(texNombre(reponse, 2))}$ €.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + ' €'
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
