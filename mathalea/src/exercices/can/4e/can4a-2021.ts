import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
  texFractionReduite,
} from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi, range1 } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
} from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'CAN 4e sujet 2021'
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

export const uuid = '60563'

export const refs = {
  'fr-fr': ['can4a-2021'],
  'fr-ch': ['NR'],
}
export default class SujetCAN20214ieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30
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
      const nbQ1 = Math.min(Math.round((this.nbQuestions * 8) / 30), 8) // Choisir d'un nb de questions de niveau 1 parmi les 7 possibles.
      const nbQ2 = Math.min(this.nbQuestions - nbQ1, 22)
      const typeQuestionsDisponiblesNiv1 = shuffle([1, 2, 3, 4, 5, 6, 7, 8])
        .slice(-nbQ1)
        .sort(compareNombres)
      const typeQuestionsDisponiblesNiv2 = shuffle([
        9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 29, 30,
      ])
        .slice(-nbQ2)
        .sort(compareNombres)
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    }
    const listeFractions1 = [
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [6, 5],
      [7, 5],
      [8, 5],
      [9, 5],
    ]
    const listeFractions2 = [
      [2, 3],
      [4, 3],
      [5, 3],
      [7, 3],
      [8, 3],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
    ]

    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse: number | ReturnType<typeof fraction> = 0,
        fraction1 = [],
        fraction2 = [],
        triplet,
        propositions,
        r,
        prix,
        choix,
        truc,
        a,
        b,
        c,
        d,
        e,
        m,
        n,
        p,
        k,
        A,
        B,
        C,
        D,
        pol,
        L,
        l2,
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
          a = arrondi(randint(6, 12) * 4)
          b = arrondi(randint(6, 15) * 3)
          m = choice(['quart', 'tiers'])

          if (m === 'quart') {
            texte = `Le quart de $${a}$ est : `
            texteCorr = `Prendre le quart d'un nombre revient à le diviser par $4$.<br>
                Ainsi le quart de $${a}$ est : $${a}\\div 4 =${miseEnEvidence(texNombre(a / 4))}$.`
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texteCorr = `$1$ dixième $=0,1$, d'où $${texNombre(a)}+0,1 =${miseEnEvidence(texNombre(a + 0.1))}$`
            reponse = arrondi(a + 0.1, 2)
          } else {
            texte = `Quel nombre obtient-on si on ajoute un centième à $${texNombre(b)}$ ?`
            texteCorr = `$1$ centième $=0,01$, d'où $${texNombre(b)}+0,01 =${miseEnEvidence(texNombre(b + 0.01))}$`
            reponse = arrondi(b + 0.01, 3)
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
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
        Multiplier par $0,001$ revient à diviser par $${texNombre(1000)}$. <br>
                $${k}\\times ${texNombre(d)}=${k}\\div ${texNombre(1000)}=0,${a}${b}\\underline{0}$.<br>
                  `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texteCorr = `$${texNombre(a)}\\times ${texNombre(10000)} + ${texNombre(b)}\\times 100 + ${texNombre(c)}\\times 10 =
     ${texNombre(a * 10000)} + ${texNombre(b * 100)} + ${texNombre(c * 10)}=${miseEnEvidence(texNombre(reponse))}$`
          } else {
            reponse = arrondi(c * 10000 + b * 1000 + a * 10)
            texte = `$ ${texNombre(c)}\\times ${texNombre(10000)}+ ${texNombre(b)}\\times ${texNombre(1000)} + ${texNombre(a)}\\times 10 =$`
            texteCorr = `$ ${texNombre(c)}\\times ${texNombre(10000)}+ ${texNombre(b)}\\times ${texNombre(1000)} + ${texNombre(a)}\\times 10 =
      ${texNombre(c * 10000)}+ ${texNombre(b * 1000)} + ${texNombre(a * 10)} =${miseEnEvidence(texNombre(reponse))}$`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
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
            texte += ajouteChampTexteMathLive(this, index, '') + ' €'
          }
          nbChamps = 1
          break

        case 10:
          a = randint(11, 24, 20)
          reponse = arrondi(101 * a)
          texte = `$${a}\\times 101=$`
          texteCorr = `$${a}\\times 101 = ${texNombre(101 * a)}$<br>`

          texteCorr += `$${a}\\times 101 = ${a}\\times (100+1)=${a}\\times 100+${a}\\times 1=${texNombre(a * 100)}+${a}=${miseEnEvidence(texNombre(101 * a))}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 11:
          a = randint(-22, -11)
          b = randint(-9, -2)
          texte = `$${a}-(${b})=$`
          texteCorr = `$${a}-(${b})=${a}+${texNombre(-b)}=${miseEnEvidence(a - b)}$.`
          reponse = a - b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break
        case 12: {
          a = choice([2, 2, 2, 3, 3, 4, 5])
          if (a === 2) {
            b = randint(3, 6)
            reponse = arrondi(a ** b)
            texte = `Recopie la bonne réponse.<br>
          $${a}^{${b}}$ est égal à :<br>`
          }
          if (a === 3) {
            b = randint(2, 4)
            reponse = arrondi(a ** b)
            texte = `Recopie la bonne réponse.<br>
           $${a}^{${b}}$ est égal à :<br>`
          }
          if (a === 4) {
            b = randint(2, 3)
            reponse = arrondi(a ** b)
            texte = `Recopie la bonne réponse.<br>
             $${a}^{${b}}$ est égal à :<br>`
          }
          if (a === 5) {
            b = 2
            reponse = arrondi(a ** b)
            texte = `Recopie la bonne réponse.<br>
               $${a}^{${b}}$ est égal à :<br>`
          }
          const exposant = Number(b)
          propositions = shuffle([
            `$${texNombre(reponse)}$`,
            `$${texNombre(a * exposant)}$`,
            `$${texNombre(a + exposant)}$`,
          ])
          texte += `$\\square$ ${propositions[0]} ${sp(6)} $\\square$ ${propositions[1]} ${sp(6)} $\\square$ ${propositions[2]}`
          texteCorr = `$${a}^{${exposant}}$ est le produit de $${exposant}$ facteurs tous égaux à $${a}$. Ainsi, $${a}^{${exposant}}=${miseEnEvidence(a ** exposant)}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break
        }
        case 13:
          L = randint(8, 12)
          a = arrondi(L * randint(2, 7))
          texte = `Un rectangle a une aire de $${a}\\text{ m}^2$ et sa longueur mesure $${L}\\text{ m}$.<br>
            Détermine sa largeur.`
          texteCorr = `L'aire d'un rectangle est obtenue par le produit de sa longueur par sa largeur. <br>
          On obtient donc sa largeur
            en divisant l'aire par sa longueur : $\\ell=${a}\\div ${L}=${miseEnEvidence(texNombre(a / L))}$. `
          reponse = arrondi(a / L)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'm'
          }
          nbChamps = 1
          break

        case 14:
          a = choice(obtenirListeFractionsIrreductibles())
          c = choice([2, 4])
          b = fraction(1, a.d * c)
          if (choice([true, false])) {
            texte = `$${a.texFraction} + ${b.texFraction}=$
           `
            texteCorr = `Pour additionner des fractions, on les met au même dénominateur.<br>

           Ainsi, $${a.texFraction} + ${b.texFraction}
           =\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}+ ${b.texFraction}
          =${a.reduire(c).texFraction} + ${b.texFraction}
          =\\dfrac{${a.n * c}+${b.n}}{${b.d}}
          =\\dfrac{${a.n * c + b.n}}{${b.d}}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d)}$.<br>
          Par conséquent, $ ${a.texFraction}+${b.texFraction}= ${miseEnEvidence(texFractionReduite(a.n * c + b.n, b.d))}$.`
          } else {
            texte = `$ ${b.texFraction}+${a.texFraction}=$`
            texteCorr = `Pour additionner des fractions, on les met au même dénominateur.<br>
           <br>
           Ainsi, $ ${b.texFraction}+${a.texFraction}
           = ${b.texFraction}+\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}
          =${b.texFraction}+${a.reduire(c).texFraction}
          =\\dfrac{${b.n}+${a.n * c}}{${b.d}}
          =\\dfrac{${b.n + a.n * c}}{${b.d}}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d)}$.<br>
          Par conséquent, $ ${b.texFraction}+${a.texFraction}= ${miseEnEvidence(texFractionReduite(a.n * c + b.n, b.d))}$.`
          }

          reponse = fraction(a.n * c + b.n, b.d)
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 15:
          a = choice([2, 3, 6]) // diviseur de l'heure
          b = arrondi(60 / a) // nombre de minutes de l'énoncé
          c = choice([30, 60, 90, 120])
          reponse = arrondi(c / a)
          texte = `Une voiture roule à $${c}\\text{ km/h}$. Combien de kilomètres parcourt-elle en $${b}$ minutes ?`
          texteCorr = `La voiture parcourt $${arrondi(c / a)}\\text{ km}$.<br>
         En $${b}$ minutes, elle parcourt $${a}$ fois moins de $\\text{km}$ qu'en $1$ heure, soit $\\dfrac{${c}}{${a}}=
          ${miseEnEvidence(arrondi(c / a))}\\text{ km}$.`
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

        case 16:
          a = randint(-19, -11)
          b = randint(3, 8)
          c = randint(4, 10)
          reponse = arrondi(a + b * c)
          texte = `$${a}+${b}\\times ${c}= $`
          texteCorr = `La multiplication est prioritaire. On obtient : <br>
          $${a}+${b}\\times ${c}=${a}+${b * c}=${miseEnEvidence(a + b * c)}$. `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 17:
          a = choice(obtenirListeFractionsIrreductibles())
          c = choice([2, 3, 4, 5, 6])
          b = a.d * c
          reponse = arrondi(a.n * c, 0)
          texte = `Écris sous la forme d'un entier : $${a.texFraction}\\times ${b}$`
          texteCorr = `$${a.texFraction}\\times ${b}= ${a.n}\\times\\dfrac{${b}}{${a.d}}=${a.n}\\times ${c}=${miseEnEvidence(reponse)}$`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 18:
          a = choice(obtenirListeFractionsIrreductibles())
          c = a.d

          reponse = arrondi(a.valeurDecimale * 2)

          if (choice([true, false])) {
            b = a.n
            d = fraction(b, c)
            texte = `L'opposé de $\\dfrac{${b}}{${c}}$ est : `
            texteCorr = `Deux nombres sont opposés lorsque leur somme est nulle.<br>
              Ainsi, l'opposé de $\\dfrac{${b}}{${c}}$ est $${miseEnEvidence('-')}${miseEnEvidence(d.texFraction)}$ car $\\dfrac{${b}}{${c}}+\\left(-${d.texFraction}\\right)=0$.`
            reponse = d.oppose()
          } else {
            b = a.n
            d = fraction(b, c)
            e = fraction(c, b)
            texte = `L'inverse de $\\dfrac{${b}}{${c}}$ est :`
            texteCorr = `Deux nombres sont inverses l'un de l'autre lorsque leur produit vaut $1$.<br>
                Ainsi, l'inverse de $\\dfrac{${b}}{${c}}$ est $${miseEnEvidence(texFractionReduite(c, b))}$ car $\\dfrac{${b}}{${c}}\\times ${texFractionReduite(c, b)}=1$.`
            reponse = e
          }

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 19:
          a = combinaisonListes([0, 1, 2, 3], 3)
          texte = `$10^${a[0]}+10^${a[1]}+10^${a[2]}= $`
          texteCorr = `$10^${a[0]}+10^${a[1]}+10^${a[2]}=
    ${texNombre(10 ** a[0])}+${texNombre(10 ** a[1])}+${texNombre(10 ** a[2])}
    =${miseEnEvidence(texNombre(10 ** a[0] + 10 ** a[1] + 10 ** a[2]))}$`
          reponse = arrondi(10 ** a[0] + 10 ** a[1] + 10 ** a[2])
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 20:
          a = randint(1, 5) * 10
          p = randint(2, 9, 5) * 10
          reponse = arrondi((a * p) / 100)
          texte = `$${p}\\,\\%$ de $${a}= $`

          texteCorr = ` Prendre $${p}\\,\\%$ de $${a}$ revient à prendre $${p / 10}\\times 10\\,\\%$ de $${a}$.<br>
          Comme $10\\,\\%$ de $${a}$ vaut $${texNombre(a / 10, 1)}$ (pour prendre $10\\,\\%$ d'une quantité, on la divise par $10$), alors
          $${p}\\,\\%$ de $${a}=${p / 10}\\times ${a / 10}=${miseEnEvidence(reponse)}$.
         `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 21:
          if (choice([true, false])) {
            L = randint(3, 9)
            B = pointAbstrait(0, 0, 'B', 'below')
            C = pointAbstrait(3, 0, 'C', 'below')
            D = pointAbstrait(3, 3, 'D', 'above')
            A = pointAbstrait(0, 3, 'A', 'above')
            xmin = -1
            ymin = -0.5
            xmax = 4.5
            ymax = 3.5
            pol = polygoneAvecNom(A, B, C, D)
            objets = []
            objets.push(pol[0])
            objets.push(
              texteParPosition(
                `${stringNombre(L)} cm`,
                milieu(C, D).x + 0.5,
                milieu(C, D).y,
              ),
              segment(B, D),
              labelPoint(A, B, C, D),
            )
            reponse = arrondi((L * L) / 2)
            texte = `$ABCD$ est un carré. <br>
            Calcule l'aire du triangle $ABD$.<br>
            
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
                scale: 0.9,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `$ABD$ est un triangle rectangle isocèle. Son aire est donc la moitié de celle du carré :<br>
            $\\dfrac{${L}\\times ${L}}{2}=${miseEnEvidence(texNombre((L * L) / 2, 1))}\\text{ cm}^2$
                           `
          } else {
            L = randint(2, 5)
            l2 = randint(7, 9)
            B = pointAbstrait(0, 0, 'B', 'below')
            C = pointAbstrait(4, 0, 'C', 'below')
            D = pointAbstrait(4, 2.5, 'D', 'above')
            A = pointAbstrait(0, 2.5, 'A', 'above')
            xmin = -1
            ymin = -0.8
            xmax = 6
            ymax = 3
            pol = polygoneAvecNom(A, B, C, D)
            objets = []
            objets.push(pol[0])
            objets.push(
              texteParPosition(
                `${stringNombre(L)} cm`,
                milieu(C, D).x + 0.5,
                milieu(C, D).y,
              ),
              texteParPosition(
                `${stringNombre(l2)} cm`,
                milieu(B, C).x,
                milieu(B, C).y - 0.4,
              ),
              segment(B, D),
              labelPoint(A, B, C, D),
            )
            reponse = arrondi((L * l2) / 2)
            texte = `$ABCD$ est un rectangle. <br>
            Calcule l'aire du triangle $ABD$.<br>
            
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
                scale: 0.9,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `$ABD$ est un triangle rectangle. Son aire est donc la moitié de celle du rectangle : <br>
            $\\dfrac{${L}\\times ${l2}}{2}=${miseEnEvidence(texNombre((L * l2) / 2, 2))}\\text{ cm}^2$
            `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              ajouteChampTexteMathLive(this, index, '') + '$\\text{cm}^2$'
          }
          nbChamps = 1
          break

        case 22:
          fraction2 = choice(listeFractions2)
          a = fraction(fraction2[0], fraction2[1])

          b = fraction(4 * fraction2[0], 2 * fraction2[1])
          r = new FractionEtendue(-fraction2[0], fraction2[1]).simplifie()
          texte = `$A=${a.texFraction} -${b.texFraction}$<br>
           Donne la valeur de $A$ sous la forme d'une fraction simplifiée au maximum ou d'un nombre entier.`
          texteCorr = ` $A=${a.texFraction} -${b.texFraction}=${texFractionFromString(2 * fraction2[0], 2 * fraction2[1])}-${b.texFraction}=${texFractionFromString(-2 * fraction2[0], 2 * fraction2[1])}=${miseEnEvidence(texFractionReduite(-2 * fraction2[0], 2 * fraction2[1]))}$.
           <br>
          `

          handleAnswers(this, i, {
            reponse: {
              value: r.toLatex(),
              options: { fractionIrreductible: true },
            },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 23:
          a = randint(-5, -2)
          b = randint(2, 4)
          truc = randint(-5, -2)
          c = arrondi(a * b * truc)
          texte = `Complète l'égalité : <br>
            $${a}\\times ${b}\\times \\ldots =${c}$ `
          reponse = truc
          texteCorr = `On cherche le nombre qui multiplié par $${a}\\times ${b}=${a * b}$ donne $${c}$, il s'agit de $\\dfrac{${c}}{${a * b}}=${miseEnEvidence(truc)}$. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          nbChamps = 1
          break

        case 24:
          a = randint(1, 6) * 2
          b = arrondi(a + a / 2)
          c = randint(7, 12) * 2
          reponse = arrondi(c + c / 2)

          texte = 'Complète le tableau de proportionnalité :<br>'
          // texte += tableauColonneLigne([a, b], [c], [''])
          texte += `$
          \\begin{array}{|c|c|}
          \\hline
          ${a}&${b}${context.isHtml ? '\\\\' : '\\tabularnewline'}
          \\hline
          ${c}&${context.isHtml ? '\\\\' : '\\tabularnewline'}
          \\hline
          \\end{array}
          $
          
          `
          texteCorr = `On constate que $${b}$ s'obtient en augmentant $${a}$ de la moitié de $${a}$.
              Ainsi, on obtient la quatrième proportionnelle en augmentant $${c}$ de la moitié de $${c}$.<br>
              La valeur cherchée est donc $${texNombre(c)}+${texNombre(c / 2)}=${miseEnEvidence(texNombre(c + c / 2))}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          nbChamps = 1
          break

        case 25:
          a = arrondi(randint(1, 12) + randint(1, 9) / 10)
          reponse = arrondi(a * 1000)
          texte = ` $${texNombre(a)}\\text{ m}^3=$`
          texteCorr = `Comme $1\\text{ m}^3$= $${texNombre(1000)}$ L, $${texNombre(a)}\\text{ m}^3=${miseEnEvidence(texNombre(a * 1000))}$ L.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'L'
          } else {
            texte += '$\\ldots$ L'
          }
          nbChamps = 1
          break

        case 26:
          a = randint(10, 29)
          b = randint(3, 8)
          truc = randint(-8, -2)
          texte = `Calcule $${a}+${b}x$ pour $x=${truc}$. `
          texteCorr = `Pour $x=${truc}$, on obtient : $${a}+${b}x=${a}+${b}\\times(${truc})=${miseEnEvidence(a + b * truc)}$.`
          reponse = arrondi(a + b * truc)

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 27:
          a = choice([2, 3, 4, 5, 6, 10]) // nombre de secondes pour remplir un litre
          b = arrondi(60 / a) // nombres de litres/min
          c = randint(2, b - 1) % 10 // volume du seau à remplir
          while (c === 0) {
            a = choice([2, 3, 4, 5, 6, 10]) // nombre de secondes pour remplir un litre
            b = arrondi(60 / a) // nombres de litres/min
            c = randint(2, b - 1) % 10 // volume du seau à remplir
          }
          reponse = arrondi(c * a)
          texte = `Le débit d'eau d'un robinet est de $${b}$ L/min. <br>Combien de secondes faut-il pour remplir un seau de $${c}$ L ?`
          texteCorr = `
          On commence par déterminer le temps en secondes (puisque dans la question,
             il est demandé un temps en secondes) qu'il faut pour remplir $1$ L.<br>
          Comme le débit est de $${b}$ L
          pour une minute soit $60$ secondes, on divise $60$ par $${b}$ pour obtenir
          ce temps : $\\dfrac{60}{${b}}=${a}$ s.<br>
          Puisqu'il faut $${a}$ s pour remplir un litre, il en faut $${c}$ fois plus pour remplir un seau de
          $${c}$ L, soit $${a}\\times ${c}=${miseEnEvidence(a * c)}$ s.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'secondes'
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
          ymax = 3.5
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
          fraction1 = choice(listeFractions1)
          a = fraction(fraction1[0], fraction1[1])
          texte = `Donne l'écriture décimale de $${a.texFraction}$. <br>`
          texteCorr = `$\\dfrac{1}{5}=0,2$, ainsi $${a.texFraction}=${fraction1[0]}\\times\\dfrac{1}{5}=${miseEnEvidence(texNombre(fraction1[0] / fraction1[1]))}$`
          reponse = arrondi(fraction1[0] / fraction1[1])
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 30:
          a = arrondi(randint(2, 6) * 10)
          n = choice([
            'pull',
            'pantalon',
            'tee-shirt',
            'vêtement',
            'blouson',
            'sweat',
          ])
          b = choice([5, 15])
          texte = `Le prix d'un ${n} est $${a}$ €. Il baisse de $${b}\\,\\%$. <br>
          Quel est son nouveau prix ? `

          if (b === 5) {
            texteCorr = `

       $10\\,\\%$ de $${a}$ est égal à $0,1\\times ${a}=${texNombre(a / 10, 1)}$.<br>
      Puisque $5\\,\\%$ est deux fois plus petit que $10\\,\\%$, $5\\,\\%$ de $${a}$ est égal à $ ${texNombre(a / 10, 1)}\\div 2=${texNombre(a / 20, 2)}$.<br>
                   La réduction est donc de : $${texNombre((b * a) / 100)}$ €.<br>
           Le nouveau prix est : $${a}-${texNombre((b * a) / 100)}= ${miseEnEvidence(texNombre(a - (b * a) / 100))}$ €.

    `
          } else {
            texteCorr = `
                      $10\\,\\%$ de $${a}$ est égal à $0,1\\times ${a}=${texNombre(a / 10, 1)}$.<br>
       $5\\,\\%$ de $${a}$ est égal à la moitié de $10\\,\\%$ de $${a}$, soit
      $${texNombre(a / 10, 1)}\\div 2=${texNombre(a / 20, 2)}$.<br>
      Puisque $15\\,\\%$ est égal à $10\\,\\%$ $+5\\,\\%$, $15\\,\\%$ de $${a}$ est égal à $${texNombre(a / 10, 1)}+${texNombre(a / 20, 2)}=${texNombre((3 * a) / 20, 2)}$.<br>
                      La réduction est donc de : $${texNombre((3 * a) / 20)}$ €.<br>
           Le nouveau prix est : $${a}-${texNombre((b * a) / 100)}= ${miseEnEvidence(texNombre(a - (b * a) / 100))}$ €.

  `
          }
          reponse = arrondi(a - (b * a) / 100)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + '€'
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
