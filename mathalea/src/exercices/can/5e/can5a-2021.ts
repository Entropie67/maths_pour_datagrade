import { codageAngle } from '../../../lib/2d/angles'
import { codageSegment } from '../../../lib/2d/CodageSegment'
import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
} from '../../../modules/fractions'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import {
  besoinFormulaireChoixQuestionsCan,
  numerosQuestionsCan,
} from '../../../lib/outils/choixQuestionsCan'

export const titre = 'CAN 5e sujet 2021'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '30/03/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = '339a1'

export const refs = {
  'fr-fr': ['can5a-2021'],
  'fr-ch': [],
}
export default class SujetCAN20215ieme extends Exercice {
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
    const nbQ1 = Math.min(Math.round((this.nbQuestions * 8) / 30), 8) // Choisir d'un nb de questions de niveau 1 parmi les 7 possibles.
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
    const listeFractions13 = [
      [12, 5],
      [11, 5],
      [13, 5],
      [17, 5],
      [19, 5],
      [27, 5],
      [18, 5],
      [29, 5],
      [10, 3],
      [19, 3],
      [17, 3],
      [16, 3],
      [23, 3],
      [29, 3],
      [29, 7],
      [17, 7],
      [15, 7],
      [13, 7],
      [17, 7],
    ]
    const listeFractions22 = [
      [1, 4],
      [3, 4],
      [1, 25],
      [2, 25],
      [3, 25],
      [4, 25],
      [1, 20],
      [3, 20],
      [7, 20],
      [5, 4],
    ]

    const listeFractions25 = [
      [8, 5, 2, 3],
      [3, 4, 4, 3],
      [7, 3, 5, 6],
      [7, 9, 11, 8],
      [11, 9, 7, 8],
      [1, 3, 7, 6],
      [11, 7, 12, 13],
    ]
    const listeFractions25B = [
      [2, 7, 3, 8],
      [8, 3, 13, 6],
      [9, 7, 5, 4],
      [4, 7, 5, 8],
      [11, 9, 4, 3],
      [1, 3, 6, 7],
      [11, 7, 9, 5],
    ]

    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse: number | string | ReturnType<typeof fraction> = 0,
        nombre,
        a1,
        b1,
        f,
        fraction1 = [],
        fraction2 = [],
        propositions,
        prix,
        choix,
        s1,
        s2,
        s3,
        s4,
        s5,
        s6,
        s7,
        s8,
        s9,
        s10,
        s11,
        s12,
        code1,
        code2,
        code3,
        code4,
        code5,
        code6,
        code7,
        code8,
        code9,
        code10,
        code11,
        code12,
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
        H,
        I,
        J,
        K,
        L,
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
          a = arrondi(randint(6, 12) * 4)
          b = arrondi(randint(6, 15) * 3)
          m = choice(['quart', 'tiers'])

          if (m === 'quart') {
            texte = `Le quart de $${a}$ est : `
            texteCorr = `Prendre le quart d'un nombre revient à le diviser par $4$.<br>
                Ainsi le quart de $${a}$ est : $${a}\\div 4 = ${miseEnEvidence(texNombre(a / 4))}$.`
            reponse = a / 4
          }
          if (m === 'tiers') {
            texte = `Le tiers de $${b}$ est : `
            texteCorr = `Prendre le tiers d'un nombre revient à le diviser par $3$.<br>
                Ainsi le tiers de $${b}$ est : $${b}\\div 3 =${miseEnEvidence(texNombre(b / 3))}$.`
            reponse = b / 3
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

        case 3:
          a = randint(101, 121)
          b = randint(21, 45)

          reponse = a - b
          texte = `$${a} - ${b}=$ `
          texteCorr = `$${a}-${b}=${miseEnEvidence(a - b)}$`
          reponse = arrondi(a - b)
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

        case 4:
          a = arrondi(randint(3, 9) + randint(1, 4) / 10)
          b = arrondi(randint(1, 5) / 10 + randint(2, 9) / 100)
          texte = `$${texNombre(a)}+${texNombre(b)}=$ `
          texteCorr = `$${texNombre(a)}+${texNombre(b)}=${miseEnEvidence(texNombre(a + b))}$ `
          reponse = arrondi(a + b)

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
          reponse = b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
          }
          nbChamps = 1
          break

        case 6:
          a = arrondi(
            randint(1, 9) * 10 + randint(1, 9) + 0.9 + randint(1, 9) / 100,
          )
          b = arrondi(
            randint(1, 9) * 10 +
              randint(1, 9) / 10 +
              0.09 +
              randint(1, 9) / 1000,
          )

          if (choice([true, false])) {
            texte = `Quel nombre obtient-on si on ajoute un dixième à $${texNombre(a)}$ ?`
            texteCorr = `$1$ dixième $=0,1$, d'où $${texNombre(a)}+0,1 =${miseEnEvidence(texNombre(a + 0.1))}$.`
            reponse = arrondi(a + 0.1, 2)
          } else {
            texte = `Quel nombre obtient-on si on ajoute un centième à $${texNombre(b)}$ ?`
            texteCorr = `$1$ centième $=0,01$, d'où $${texNombre(b)}+0,01 =${miseEnEvidence(texNombre(b + 0.01))}$.`
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
          nbChamps = 1
          break

        case 7:
          a = randint(1, 9)
          b = randint(1, 9, a)

          k = arrondi(a * 100 + b * 10)
          d = choice([0.1, 0.01, 0.001])
          reponse = arrondi(k * d)

          if (d === 0.1) {
            texte = `$${k}\\times ${texNombre(d)}=$`
            texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(reponse))}$`
            texteCorr += `<br>
        Multiplier par $0,1$ revient à diviser par $10$. <br>
               $${k}\\times ${texNombre(d)}=${k}\\div 10=${a}${b},\\underline{0}$.<br>
                  `
          }
          if (d === 0.01) {
            texte = `$${k}\\times ${texNombre(d)}=$`
            texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(reponse))}$`
            texteCorr += ` <br> Multiplier par $0,01$ revient à diviser par $100$. <br>
                $${k}\\times ${texNombre(d)}=${k}\\div 100=${a},${b}\\underline{0}$.<br>
                  `
          }
          if (d === 0.001) {
            texte = `$${k}\\times ${texNombre(d)}=$`
            texteCorr = `$${k}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(reponse))}$`
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
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 8:
          a = randint(2, 5)
          b = randint(2, 9)
          c = randint(2, 9)

          if (choice([true, false])) {
            reponse = arrondi(a * 10000 + b * 100 + c * 10)
            texte = `$${texNombre(a)}\\times ${texNombre(10000)} + ${texNombre(b)}\\times 100 + ${texNombre(c)}\\times 10=$`
            texteCorr = `$${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 100 + ${texNombre(c)}\\times 10 =
     ${texNombre(a * 10000)} + ${texNombre(b * 100)} + ${texNombre(c * 10)}=${miseEnEvidence(texNombre(reponse))}$`
          } else {
            reponse = arrondi(c * 10000 + b * 1000 + a * 10)
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
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 9:
          a = randint(2, 6)
          prix = arrondi(2 + randint(1, 3) / 10 + 0.05)
          k = randint(2, 4)
          reponse = arrondi(prix * k, 2)
          texte = `$${a}$ stylos identiques coûtent $${texNombre(prix)}$ €. <br>
            Combien coûtent $${k * a}$ de ces mêmes stylos ?
             `

          texteCorr = `$${a}$ stylos identiques coûtent $${texNombre(prix)}$ €, donc $${k * a}$
           de ces mêmes stylos coûtent $${k}$ fois plus, soit $${k}\\times ${texNombre(prix)}=${miseEnEvidence(texNombre(k * prix))}$ €.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: ' €' },
              )
          }
          nbChamps = 1
          break

        case 10:
          a = randint(11, 24, 20)
          reponse = arrondi(101 * a)
          texte = `$${a}\\times 101=$`
          texteCorr = `$${a}\\times 101 = ${miseEnEvidence(texNombre(101 * a))}$<br>`

          texteCorr += `$${a}\\times 101 = ${a}\\times (100+1)=${a}\\times 100+${a}\\times 1=${texNombre(a * 100)}+${a}=${miseEnEvidence(texNombre(101 * a))}$`

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
          choix = choice(['a', 'a', 'a', 'b'])
          if (choix === 'a') {
            a = randint(1, 5) * 10
            p = randint(2, 9, 5) * 10
            reponse = arrondi((a * p) / 100)
            texte = `$${p}\\,\\%$ de $${a}= $`

            texteCorr = ` Prendre $${p}\\,\\%$ de $${a}$ revient à prendre $${p / 10}\\times 10\\,\\%$ de $${a}$.<br>
            Comme $10\\,\\%$ de $${a}$ vaut $${a / 10}$ (pour prendre $10\\,\\%$ d'une quantité, on la divise par $10$), alors
            $${p}\\,\\%$ de $${a}=${p / 10}\\times ${a / 10}=${miseEnEvidence(reponse)}$.
           `
          } else {
            a = choice([10, 20, 40, 60, 120])
            p = 25
            reponse = arrondi((a * p) / 100)
            texte = `$${p}\\,\\%$ de $${a}= $`

            texteCorr = ` Prendre $${p}\\,\\%$ de $${a}$ revient à prendre le quart de $${a}$.<br>
          $\\dfrac{1}{4}$ de $${a}=\\dfrac{${a}}{4}=${miseEnEvidence(texNombre(reponse))}$.
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

        case 12:
          a = randint(3, 12)
          b = randint(1, 6)
          c = randint(1, 6, b)
          reponse = a * b + a * c
          texte = `Le produit de $${a}$ par la somme de $${b}$ et de $${c}$ est égal à : `
          texteCorr = `Le produit de $${a}$ par la somme de $${b}$ et de $${c}$ est égal à : $${a}\\times \\underbrace{(${b}+${c})}_{\\text{Somme de } ${b} \\text{ et } ${c}}=${a}\\times ${b + c}=${miseEnEvidence(a * b + a * c)}$.`
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
          fraction1 = choice(listeFractions13)
          a = fraction(fraction1[0], fraction1[1])

          texte = `$${a.texFraction} =${Math.floor(fraction1[0] / fraction1[1])}+\\dfrac{?}{${fraction1[1]}}$<br><br>
                   ? $ = $
            `
          texteCorr = ` $${a.texFraction} =
          \\dfrac{${Math.floor(fraction1[0] / fraction1[1])}\\times ${fraction1[1]}}{${fraction1[1]}}+\\dfrac{${fraction1[0] - Math.floor(fraction1[0] / fraction1[1]) * fraction1[1]}}{${fraction1[1]}}
          =\\dfrac{${Math.floor(fraction1[0] / fraction1[1]) * fraction1[1]}}{${fraction1[1]}}+\\dfrac{${fraction1[0] - Math.floor(fraction1[0] / fraction1[1]) * fraction1[1]}}{${fraction1[1]}}$ donc ?$=${miseEnEvidence(fraction1[0] - Math.floor(fraction1[0] / fraction1[1]) * fraction1[1])}$.
            `
          reponse =
            fraction1[0] -
            Math.floor(fraction1[0] / fraction1[1]) * fraction1[1]
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

        case 14:
          choix = choice(['a', 'b', 'c'])
          if (choix === 'a') {
            a = randint(2, 6)
            A = pointAbstrait(0, 0)
            B = pointAbstrait(-1, 0)
            C = pointAbstrait(-1, -1)
            D = pointAbstrait(0, -1)
            E = pointAbstrait(0, -2)
            F = pointAbstrait(1, -2)
            G = pointAbstrait(1, -1)
            H = pointAbstrait(2, -1)
            I = pointAbstrait(2, 0)
            J = pointAbstrait(1, 0)
            K = pointAbstrait(1, 1)
            L = pointAbstrait(0, 1)
            s1 = segment(A, B)
            code1 = codageSegment(A, B, '|')
            s2 = segment(B, C)
            code2 = codageSegment(B, C, '|')
            s3 = segment(C, D)
            code3 = codageSegment(C, D, '|')
            s4 = segment(D, E)
            code4 = codageSegment(D, E, '|')
            s5 = segment(E, F)
            code5 = codageSegment(E, F, '|')
            s6 = segment(F, G)
            code6 = codageSegment(F, G, '|')
            s7 = segment(G, H)
            code7 = codageSegment(G, H, '|')
            s8 = segment(H, I)
            code8 = codageSegment(H, I, '|')
            s9 = segment(I, J)
            code9 = codageSegment(I, J, '|')
            s10 = segment(J, K)
            code10 = codageSegment(J, K, '|')
            s11 = segment(K, L)
            code11 = codageSegment(K, L, '|')
            s12 = segment(L, A)
            code12 = codageSegment(L, A, '|')
            xmin = -2
            ymin = -2.1
            xmax = 3
            ymax = 1.2
            objets = []
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(B, C).x - 0.5,
                milieu(B, C).y,
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
              s7,
              s8,
              s9,
              s10,
              s11,
              s12,
              code7,
              code8,
              code9,
              code10,
              code11,
              code12,
            )
            reponse = 12 * a
            texte = 'Quel est le périmètre de cette figure ?<br>'
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 40,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1.4,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `La figure est composée de $12$ segments de longueur $${a}\\text{ cm}$.<br>
              Le périmètre de cette figure est donc : $12\\times\\times ${a}=${miseEnEvidence(12 * a)}\\text{ cm}$. `
          }
          if (choix === 'b') {
            b = randint(6, 10)
            a = randint(1, 3)
            c = randint(4, 5)
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
                `${stringNombre(a)} cm`,
                milieu(B, C).x,
                milieu(B, C).y + 0.3,
              ),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(D, E).x + 0.5,
                milieu(D, E).y,
              ),
              texteParPosition(
                `${stringNombre(c)} cm`,
                milieu(D, C).x - 0.3,
                milieu(D, C).y + 0.2,
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
            reponse = 4 * a + 2 * c + b
            texte = 'Quel est le périmètre de cette figure ?<br>'
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 40,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1.4,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `La figure est composée de $4$ segments de longueur $${a}$, de $2$ segments de longueur $${c}$ et d'un segment de longueur $${b}$.<br>
            Le périmètre de cette figure est donc : $4\\times ${a}+2\\times ${c}+${b}=${miseEnEvidence(4 * a + 2 * c + b)}\\text{ cm}$. `
          }

          if (choix === 'c') {
            b = randint(7, 10)
            a = randint(4, 5)
            c = randint(1, 3)
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
                `${stringNombre(c)} cm`,
                milieu(B, C).x,
                milieu(B, C).y + 0.3,
              ),
              texteParPosition(
                `${stringNombre(b)} cm`,
                milieu(D, E).x + 0.4,
                milieu(D, E).y,
              ),
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(D, C).x - 0.2,
                milieu(D, C).y + 0.2,
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
            reponse = 3 * c + 2 * a + b
            texte = 'Quel est le périmètre de cette figure ?<br>'
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 40,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1.4,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `La figure est composée de $3$ segments de longueur $${c}$, de $2$ segments de longueur $${a}$ et d'un segment de longueur $${b}$.<br>
                    Le périmètre de cette figure est donc : $3\\times ${c}+2\\times ${a}+${b}=${miseEnEvidence(3 * c + 2 * a + b)}\\text{ cm}$. `
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '$\\mathscr{P}=$'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          }
          nbChamps = 1
          break

        case 15:
          a = randint(2, 9)
          choix = choice(['a', 'b', 'c', 'd']) //
          if (choix === 'a') {
            reponse = a * 100
            texte = `$${a}\\text{ dm}^2=$`
            texteCorr = `$1\\text{ dm}^2= 100\\text{ cm}^2$, donc $${a}\\text{ dm}^2=${a}\\times 100\\text{ cm}^2=${miseEnEvidence(a * 100)}\\text{ cm}^2$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{cm}^2$' },
              )
            } else {
              texte += ' $\\ldots\\text{ cm}^2$'
            }
          }
          if (choix === 'b') {
            reponse = a / 100
            texte = `$${a}\\text{ cm}^2=$`
            texteCorr = `$1\\text{ cm}^2= 0,01\\text{ dm}^2$, donc $${a}\\text{ cm}^2=${a}\\times 0,01\\text{ dm}^2=${miseEnEvidence(texNombre(a / 100))}\\text{ dm}^2$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ dm}^2$' },
              )
            } else {
              texte += ' $\\ldots\\text{ dm}^2$'
            }
          }
          if (choix === 'c') {
            reponse = a * 100
            texte = `$${a}\\text{ m}^2=$`
            texteCorr = `$1\\text{ m}^2= 100\\text{ dm}^2$, donc $${a}\\text{ m}^2=${a}\\times 100\\text{ dm}^2=${miseEnEvidence(a * 100)}\\text{ dm}^2$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ dm}^2$' },
              )
            } else {
              texte += '$\\ldots\\text{ dm}^2$'
            }
          }
          if (choix === 'd') {
            reponse = a / 100
            texte = `$${a}\\text{ dm}^2=$`
            texteCorr = `$1\\text{ dm}^2= 0,01\\text{ m}^2$, donc $${a}\\text{ dm}^2=${a}\\times 0,01\\text{ m}^2=${miseEnEvidence(texNombre(a / 100))}\\text{ m}^2$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ m}^2$' },
              )
            } else {
              texte += '$\\ldots\\text{ m}^2$'
            }
          }

          nbChamps = 1
          break

        case 16:
          if (choice([true, false])) {
            a = randint(1, 4) // AB
            b = randint(5, 10) // AC
            c = randint(b - a, b - 1) + randint(1, 5) / 10 // BC possible
            d = randint(1, b - a) - randint(1, 5) / 10 // BC impossible
            e = randint(a + b + 1, 16) // BC impossible
            reponse = c
            propositions = shuffle([
              `$${texNombre(c)}$`,
              `$${texNombre(d)}$`,
              `$${texNombre(e)}$`,
            ])
            texte = `Dans le triangle $ABC$, on a $AB=${a}$ et $AC=${b}$. <br>
          Recopie la longueur possible de $[BC]$.<br>`

            texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`
          } else {
            a = randint(2, 4) // AB
            b = randint(5, 8) // AC
            c = randint(b + 1, a + b - 1) // BC possible
            d = randint(1, b - a) - randint(1, 5) / 10 // BC impossible
            e = randint(a + b + 1, 16) // BC impossible
            reponse = c
            propositions = shuffle([
              `$${texNombre(c)}$`,
              `$${texNombre(d)}$`,
              `$${texNombre(e)}$`,
            ])
            texte = `Dans le triangle $ABC$, on a $AB=${a}$ et $AC=${b}$. <br>
          Recopie la longueur possible de $[BC]$.<br>`

            texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`
          }
          texteCorr = `Pour qu'un triangle soit constructible, il faut que la longueur du plus grand côté soit inférieure à la somme des deux autres.<br>
          Seule la longueur $${miseEnEvidence(texNombre(c))}$ est possible pour $BC$. `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
          }
          nbChamps = 1
          break

        case 17:
          a = randint(3, 6)
          b = choice([-1, -a + 1])
          reponse = fraction(b, a)
          texte =
            'Quelle est la fraction repérée par le point d’interrogation ?<br>' +
            mathalea2d(
              {
                xmin: -2,
                ymin: -1,
                xmax: 8,
                ymax: 1.5,
                scale: 0.8,
                center: !context.isHtml,
              },
              droiteGraduee({
                Unite: 3,
                Min: -1,
                Max: 1,
                x: 0,
                y: 0,
                thickSecDist: 1 / a,
                thickSec: true,
                thickOffset: 0,
                axeStyle: '|->',
                pointListe: [[b / a, '?']],
                labelPointTaille: 15,
                pointCouleur: bleuMathalea,
                pointStyle: 'x',
                labelsPrincipaux: true,
                step1: 1,
                step2: 1,
              }),
            )
          texteCorr = `L'unité est divisée en $${a}$. Ainsi, le point d'interrogation est $${miseEnEvidence(`\\dfrac{${b}}{${a}}`)}$.`
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

        case 18:
          if (choice([true, false])) {
            a = randint(-15, -7)
            b = randint(-9, -1) / 10
            c = randint(-9, -1) / 100
            nombre = a + b + c
            reponse = `${texNombre(a + b - 0.1, 3)};${texNombre(a + b, 3)}`
            texte = `Donne un encadrement au dixième près du nombre $${texNombre(nombre)}$ :<br>`
            texte += `$\\ldots \\leqslant ${texNombre(nombre)} \\leqslant \\ldots$`
            texteCorr = `Le chiffre des dixièmes est le premier chiffre après la virgule. <br>Ainsi : $${miseEnEvidence(texNombre(a + b - 0.1))} \\leqslant ${texNombre(nombre)} \\leqslant ${miseEnEvidence(texNombre(a + b))}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { suiteDeNombres: true } },
            })
            if (this.interactif) {
              texte += '<br>Écrire les entiers séparés par un point-virgule.'
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          } else {
            a = randint(-15, -7)
            b = randint(-9, -1) / 10
            c = randint(-9, -1) / 100
            d = randint(-9, -1) / 1000
            nombre = a + b + c + d
            reponse = `${texNombre(a + b + c - 0.01, 3)};${texNombre(a + b + c, 3)}`
            texte = `Donne un encadrement au centième près du nombre $${texNombre(nombre)}$ :<br>`
            texte += `$\\ldots \\leqslant ${texNombre(nombre)} \\leqslant \\ldots$`

            texteCorr = `Le chiffre des centièmes est le deuxième chiffre après la virgule. <br>Ainsi : $${miseEnEvidence(texNombre(a + b + c - 0.01))} \\leqslant ${texNombre(nombre)} \\leqslant ${miseEnEvidence(texNombre(a + b + c))}$.`
            handleAnswers(this, index, {
              reponse: { value: reponse, options: { suiteDeNombres: true } },
            })
            if (this.interactif) {
              texte += '<br>Écrire les entiers séparés par un point-virgule.'
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          }
          nbChamps = 1
          break

        case 19:
          a = randint(3, 12)
          texte = `Une brioche est vendue $${a}$ €.<br>
          Quel est son prix si on bénéficie d'une remise de $10\\,\\%$ ? `
          reponse = 0.9 * a
          texteCorr = `$10\\,\\%$ de $${a}$ $=0,1\\times ${a}=${texNombre(0.1 * a)}$. <br>
          Le montant de la remise est $${texNombre(0.1 * a)}$ €. La brioche coûtera donc après remise : $${a}-${texNombre(0.1 * a)}=${miseEnEvidence(texNombre(0.9 * a))}$ €.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: ' €' },
            )
          }
          nbChamps = 1
          break

        case 20:
          a = randint(7, 21)
          b = choice([45, 50, 55])
          c = choice([20, 30, 40, 50])

          texte = `Une montre affiche $${a}$ h $${b}$ min.<br>
          Quelle heure affichera-t-elle $1$ h $${c}$ plus tard ?`

          texteCorr = ` $${a}$ h $${b}$ min + $1$ h $${c}$ min est égal à $${miseEnEvidence(`${a + 2}\\text{ h }${formatMinute(b + c - 60)}\\text{ min}`)}$.`
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )
          }
          handleAnswers(this, index, {
            reponse: {
              value: new Hms({ hour: a + 2, minute: b + c - 60 }).toString(),
              options: { HMS: true },
            },
          })

          nbChamps = 1
          break

        case 21:
          if (choice([true, false])) {
            a = randint(2, 6)
            b = randint(2, 6)
            truc = randint(2, 5)
            c = a + b + truc
            texte = `Vrai/Faux<br>
          L'égalité $${a}x+${b}=${c}$ est vérifiée pour $x=${truc}$.<br>`
            texteCorr = `Pour $x=${truc}$, $${a}x+${b}=${a}\\times ${truc}+${b}=${a * truc + b}$.<br>
          Donc l'égalité n'est pas vérifiée (${texteEnCouleurEtGras('F')}).`
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })

            if (this.interactif) {
              texte += 'Pour Vrai, écrire V et pour Faux : F'
              texte += ajouteChampTexteMathLive(this, index, ' ')
            }
          } else {
            a = randint(2, 6)
            b = randint(2, 6)
            truc = randint(2, 5)
            c = b + a * truc
            texte = `Vrai/Faux<br>
          L'égalité $${a}x+${b}=${c}$ est vérifiée pour $x=${truc}$.<br>`
            handleAnswers(this, index, {
              reponse: { value: ['V', 'v'], options: { texteAvecCasse: true } },
            })
            texteCorr = `Pour $x=${truc}$, $${a}x+${b}=${a}\\times ${truc}+${b}=${a * truc + b}$.<br>
          Donc l'égalité est vérifiée (${texteEnCouleurEtGras('V')}).`
            if (this.interactif) {
              texte += 'Pour Vrai, écrire V et pour Faux : F'
              texte += ajouteChampTexteMathLive(this, index, ' ')
            }
          }
          nbChamps = 1
          break

        case 22:
          fraction2 = choice(listeFractions22)
          a = fraction(fraction2[0], fraction2[1])

          texte = `Complète $${a.texFraction} =\\dfrac{\\ldots}{100}$`

          texteCorr = ` Le dénominateur de $${a.texFraction}$ est multiplié par $${100 / fraction2[1]}$.<br>
          Il faut donc multiplier le numérateur par $${100 / fraction2[1]}$. On obtient : $${fraction2[0]}\\times ${100 / fraction2[1]}=${miseEnEvidence((fraction2[0] * 100) / fraction2[1])}$.`
          reponse = (fraction2[0] * 100) / fraction2[1]
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>$ \\ldots=$'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 23:
          a = randint(-99, -81, -90)
          b = choice([-80, -70, -60, -50, -40, -30])

          if (choice([true, false])) {
            texte = `
            $${a}-(${b})=$ `
            reponse = a - b
            texteCorr = ` $${a}-(${b})=${a}+${-b}=${miseEnEvidence(a - b)}$`
          } else {
            texte = `
          $${b}-(${a})=$ `
            reponse = b - a
            texteCorr = ` $${b}-(${a})=${b}+${-a}=${miseEnEvidence(b - a)}$`
          }

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

        case 24:
          if (choice([true, false])) {
            a = choice([100, 110, 120])
            b = choice([10, 15, 20])
            A = pointAbstrait(0, 0)
            B = pointAbstrait(6, 0)
            C = pointAbstrait(4, 2)
            s1 = segment(A, B)
            s2 = segment(A, C)
            s3 = segment(B, C)

            xmin = -1
            ymin = -1
            xmax = 6.5
            ymax = 2.5
            objets = []
            objets.push(
              texteParPosition(`${stringNombre(a)}°`, 3.8, 0.8),
              texteParPosition(`${stringNombre(b)}°`, 1.2, 0.25),
              texteParPosition('?', 5.3, 0.3),
              s1,
              s2,
              s3,
              codageAngle(B, C, A, 0.8, '|'),
              codageAngle(C, A, B, 0.8, '||'),
            )
          } else {
            a = choice([100, 110, 120])
            b = choice([45, 50, 55])
            A = pointAbstrait(0, 0)
            B = pointAbstrait(6, 0)
            C = pointAbstrait(2, 2)
            s1 = segment(A, B)
            s2 = segment(A, C)
            s3 = segment(B, C)

            xmin = -1
            ymin = -1
            xmax = 6.5
            ymax = 2.5
            objets = []
            objets.push(
              texteParPosition(`${stringNombre(a)}°`, 2.1, 0.8),
              texteParPosition(`${stringNombre(b)}°`, 1.2, 0.25),
              texteParPosition('?', 5, 0.3),
              s1,
              s2,
              s3,
              codageAngle(B, C, A, 0.8, '|'),
              codageAngle(C, A, B, 0.8, '||'),
            )
          }
          reponse = 180 - a - b
          texte = 'On donne la figure suivante :<br>'
          texte += mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 40,
              mainlevee: false,
              amplitude: 0.5,
              scale: 1.3,
              center: !context.isHtml,
            },
            objets,
          )
          texte += ' <br>? $=$'
          texteCorr = `Dans un triangle, la somme des angles vaut $180°$.<br>
         ?$=180-${a}-${b}=${miseEnEvidence(180 - a - b)}^\\circ$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '°' },
            )
          } else {
            texte += ' $\\ldots ^\\circ$'
          }

          nbChamps = 1
          break

        case 25:
          fraction1 = choice(listeFractions25)
          fraction2 = choice(listeFractions25B)
          if (choice([true, false])) {
            a = fraction(fraction1[0], fraction1[1])
            b = fraction(fraction1[2], fraction1[3])
            if (this.interactif) {
              texte = ''
            } else {
              texte = ' Complète avec $<$, $>$ ou $=$ :<br>'
            }
            texte += `$${a.texFraction} \\ldots\\ldots ${b.texFraction}$`
            texteCorr =
              "Une des deux fractions est un nombre supérieur à $1$ (numérateur plus grand que dénominateur) et l'autre un nombre inférieur à $1$. <br> La plus grande est donc celle qui a le numérateur plus grand que le dénominateur."
          } else {
            a = fraction(fraction2[0], fraction2[1])
            a1 = fraction(
              fraction2[0] * fraction2[3],
              fraction2[1] * fraction2[3],
            )
            b = fraction(fraction2[2], fraction2[3])
            b1 = fraction(
              fraction2[2] * fraction2[1],
              fraction2[3] * fraction2[1],
            )
            if (this.interactif) {
              texte = ''
            } else {
              texte = ' Complète avec $<$, $>$ ou $=$ :<br>'
            }
            texte += `$${a.texFraction} \\ldots\\ldots ${b.texFraction}$`
            texteCorr = `En écrivant les deux fractions avec le même dénominateur, on obtient : <br>
            $${a.texFraction}=${a1.texFraction}$ et $${b.texFraction}=${b1.texFraction}$. <br>
            On en déduit que la plus grande est celle qui a le plus grand numérateur. <br>`
          }
          if (a > b) {
            handleAnswers(this, index, {
              reponse: { value: '>', options: { texteAvecCasse: true } },
            })
            texteCorr += `<br> Ainsi, $${a.texFraction} ${miseEnEvidence('>')} ${b.texFraction}$.`
          } else {
            handleAnswers(this, index, {
              reponse: { value: '<', options: { texteAvecCasse: true } },
            })
            texteCorr += `<br> Ainsi, $${a.texFraction} ${miseEnEvidence('<')} ${b.texFraction}$.`
          }
          if (this.interactif) {
            texte += '<br>Indique le symbole qui convient : $<$, $>$ ou $=$'
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierCompare,
            )
          }
          nbChamps = 1
          break

        case 26:
          choix = choice(['a', 'b']) //, 'b', 'c', 'd'
          if (choix === 'a') {
            a = randint(1, 5)
            b = randint(5, 9)
            c = randint(1, 5)
            d = randint(1, 5)
            e = randint(3, 8)
            f = randint(1, 5)
            texte =
              "Quelle est la proportion d'élèves ayant obtenu une note supérieure ou égale à $14$ ?<br>"
            texte += tableauColonneLigne(
              ['\\text{Note}', '7', '8', '10', '12', '14', '16'],
              ['\\text{Effectif}'],
              [a, b, c, d, e, f],
            )
            texteCorr = `$${e}+${f}=${e + f}$ élèves ont une note supérieure ou égale à $14$.<br>
          Le nombre total d'élèves est : $${a}+${b}+${c}+${d}+${e}+${f}=${a + b + c + d + e + f}$.<br>
           La proportion d'élèves ayant obtenu une note supérieure ou égale à $14$ est donc : $${miseEnEvidence(`\\dfrac{${e + f}}{${a + b + c + d + e + f}}`)}$<br>
           La fraction simplifiée (ou la valeur décimale exacte) sont d'autres réponses correctes.`
            reponse = fraction(e + f, a + b + c + d + e + f)
          }
          if (choix === 'b') {
            a = randint(1, 5)
            b = randint(5, 9)
            c = randint(1, 5)
            d = randint(1, 5)
            e = randint(3, 8)
            f = randint(1, 5)
            texte =
              "Quelle est la proportion d'élèves ayant obtenu une note inférieure ou égale à $10$ ?<br>"
            texte += tableauColonneLigne(
              ['\\text{Note}', '7', '8', '10', '12', '14', '16'],
              ['\\text{Effectif}'],
              [a, b, c, d, e, f],
            )
            texteCorr = `$${a}+${b}+${c}=${a + b + c}$ élèves ont une note inférieure ou égale à $10$.<br>
            Le nombre total d'élèves est : $${a}+${b}+${c}+${d}+${e}+${f}=${a + b + c + d + e + f}$.<br>
             La proportion d'élèves ayant obtenu une note inférieure ou égale à $10$ est donc : $${miseEnEvidence(`\\dfrac{${a + b + c}}{${a + b + c + d + e + f}}`)}$<br>
             La fraction simplifiée (ou la valeur décimale exacte) sont d'autres réponses correctes.`
            reponse = fraction(a + b + c, a + b + c + d + e + f)
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

        case 27:
          a = randint(1, 4) * 3
          b = randint(9, 15) * 3
          A = pointAbstrait(0, 0, 'A', 'left')
          E = pointAbstrait(3, -1, 'E', 'below')
          D = pointAbstrait(4.73, 0, 'D', 'right')
          C = pointAbstrait(3, 1, 'C', 'above')
          reponse = (b - 2 * a) / 2
          s1 = segment(A, E)
          code1 = codageSegment(A, E, '||')
          s2 = segment(A, C)
          code2 = codageSegment(A, C, '||')
          s3 = segment(C, E)
          code3 = codageSegment(C, E, '|')
          s4 = segment(C, D)
          code4 = codageSegment(C, D, '|')
          s5 = segment(E, D)
          code5 = codageSegment(E, D, '|')
          xmin = -1
          ymin = -2
          xmax = 5.5
          ymax = 2
          objets = []
          if (a > (b - 2 * a) / 2) {
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(A, C).x,
                milieu(A, C).y + 0.5,
              ),
              s1,
              s2,
              s3,
              s4,
              s5,
              code1,
              code2,
              code3,
              code4,
              code5,
              labelPoint(A, C, D, E),
            )
            texte = `Le périmètre du quadrilatère $AEDC$ est égal à $${b}\\text{ cm}$.<br>
          `
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 40,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1.3,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = ` Le quadrilatère est composé de $2$ segments de $${a}\\text{ cm}$ et de deux autres segments de même longueur.<br>
          Ainsi, $CD=(${b}-2\\times ${a})\\div 2=${miseEnEvidence(texNombre((b - 2 * a) / 2))}$ `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$CD=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += '<br>$CD=\\ldots\\text{ cm}$'
            }
          } else {
            objets.push(
              texteParPosition(
                `${stringNombre(a)} cm`,
                milieu(D, C).x,
                milieu(D, C).y + 0.4,
              ),
              s1,
              s2,
              s3,
              s4,
              s5,
              code1,
              code2,
              code3,
              code4,
              code5,
              labelPoint(A, C, D, E),
            )
            texte = `Le périmètre du quadrilatère $AEDC$ est égal à $${b}\\text{ cm}$.<br>
          `
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
            texteCorr = ` Le quadrilatère est composé de $2$ segments de $${a}\\text{ cm}$ et de deux autres segments de même longueur.<br>
          Ainsi, $AE=(${b}-2\\times ${a})\\div 2=${miseEnEvidence(texNombre((b - 2 * a) / 2))}$ `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>$AE=$'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += '<br>$AE=\\ldots\\text{ cm}$'
            }
          }

          nbChamps = 1
          break

        case 28:
          a = choice(obtenirListeFractionsIrreductibles())
          c = choice([2, 4])
          b = fraction(1, a.d * c)
          if (choice([true, false])) {
            texte = `Complète : <br>$${a.texFraction} + ${b.texFraction}=$`
            texteCorr = ` $${a.texFraction} + ${b.texFraction}
           =\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}+ ${b.texFraction}
          =${a.reduire(c).texFraction} + ${b.texFraction}
          =\\dfrac{${a.n * c}+${b.n}}{${b.d}}
          =${miseEnEvidence(`\\dfrac{${a.n * c + b.n}}{${b.d}}`)}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d)}$`
          } else {
            texte = `Complète : <br>$ ${b.texFraction}+${a.texFraction}=$`
            texteCorr = ` $ ${b.texFraction}+${a.texFraction}
           = ${b.texFraction}+\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}
          =${b.texFraction}+${a.reduire(c).texFraction}
          =\\dfrac{${b.n}+${a.n * c}}{${b.d}}
          =${miseEnEvidence(`\\dfrac{${b.n + a.n * c}}{${b.d}}`)}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d)}$`
          }

          reponse = a.sommeFraction(b)
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          } else {
            texte += '$\\ldots$ '
          }
          nbChamps = 1
          break

        case 29:
          a = randint(2, 9)
          b = randint(2, 9)
          c = randint(2, 9)
          d = randint(2, 9)
          texte = `Simplifie l'expression : <br>
          $${a}a+${b}+${c}a+${d}$`
          texteCorr = ` $${a}a+${b}+${c}a+${d}=${a}a+${c}a+${b}+${d}=${miseEnEvidence(`${a + c}a+${b + d}`)}$`
          reponse = `${rienSi1(a + c)}a${ecritureAlgebrique(b + d)}`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecVariable,
              )
          }
          nbChamps = 1
          break

        case 30:
          if (choice([true, false])) {
            a = randint(1, 4) * 4

            texte = `Chaque face d'un cube a pour périmètre $${a}\\text{ cm}$.<br>
                    Quel est le volume de ce cube ?`
            texteCorr = `La longueur de l'arête du cube est $${a}\\div 4=${a / 4}$.<br>
                    Le volume du cube est donc $${a / 4}^3=${miseEnEvidence(a ** 3 / 64)}\\text{ cm}^3$.`
            reponse = (a / 4) ** 3
          } else {
            a = randint(1, 4)

            texte = `Chaque face d'un cube a pour aire $${a ** 2}\\text{ cm}^2$.<br>
                      Quel est le volume de ce cube ?`
            texteCorr = `La longueur de l'arête du cube est $${a}$.<br>
                      Le volume du cube est donc $${a}^3=${miseEnEvidence(a ** 3)}\\text{ cm}^3$.`
            reponse = a ** 3
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}^3$' },
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
