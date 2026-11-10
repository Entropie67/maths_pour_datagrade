import { polygoneAvecNom } from '../../../lib/2d/polygones'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { texPrix } from '../../../lib/format/style'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { prenomF } from '../../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { fraction } from '../../../modules/fractions'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

export const titre = 'CAN 6e sujet 2018'
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

export const uuid = '5c46d'

export const refs = {
  'fr-fr': ['can6a-2018'],
  'fr-ch': [],
}
export default class SujetCAN20186ieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30 // 10,20,30
    this.sup = Array.from({ length: 30 }, (_, i) => i + 1).join('-')
    // Les liens antérieurs n'ont pas de paramètre s2 : ils gardent le tirage
    // historique par nombre de questions.
    this.sup2 = true
    this.besoinFormulaire2CaseACocher = ['Choix du nombre de questions']
    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
Il est composé de 30 questions réparties de la façon suivante :<br>
Sept questions font appel à des connaissances élémentaires et les 23 autres sont un peu plus « coûteuses » cognitivement.<br>
Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 5 questions élémentaires choisies aléatoirement parmi les 7 possibles, puis de 15 autres questions choisies aléatoirement parmi les 23 restantes.<br>
Pour choisir des numéros précis, décocher « Choix du nombre de questions », puis saisir les numéros séparés par des tirets.`
  }

  nouvelleVersion() {
    const selectByCount = this.sup2 !== false
    this.nbQuestionsModifiable = selectByCount
    this.besoinFormulaireTexte = selectByCount
      ? false
      : [
          'Choix des questions',
          'Numéros des questions (de 1 à 30) séparés par des tirets. Par exemple : 1-3-12-30',
        ]
    let typeQuestionsDisponibles: number[]
    if (selectByCount) {
      const nbQ1 = Math.min(Math.round((this.nbQuestions * 7) / 30), 7) // Choisir d'un nb de questions de niveau 1 parmi les 7 possibles.
      const nbQ2 = Math.min(this.nbQuestions - nbQ1, 23)
      const typeQuestionsDisponiblesNiv1 = shuffle([1, 2, 4, 5, 6, 7, 10])
        .slice(-nbQ1)
        .sort(compareNombres)
      const typeQuestionsDisponiblesNiv2 = shuffle([
        3, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 29, 30,
      ])
        .slice(-nbQ2)
        .sort(compareNombres)
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    } else {
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
    }
    const listeFractions1 = [
      [5, 3],
      [7, 3],
      [10, 3],
      [11, 3],
      [17, 3],
      [13, 6],
      [17, 6],
      [23, 6],
      [8, 7],
      [15, 7],
      [20, 7],
      [14, 3],
      [22, 3],
      [25, 3],
    ]
    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse: number | string | FractionEtendue = 0,
        fraction1 = [],
        propositions,
        choix,
        truc,
        chiffre: Array<[string, number]>,
        chiffre2: Array<[string, number]>,
        a,
        b,
        c,
        d,
        m,
        n,
        k,
        j,
        A,
        B,
        C,
        D,
        E,
        F,
        G,
        H,
        pol,
        n1,
        d1,
        pol2,
        l,
        L,
        l2,
        prenom1,
        xmin,
        xmax,
        ymin,
        ymax,
        objets,
        fleurs,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.canReponseACompleter = ''
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(4, 8)
          b = randint(4, 9)
          texte = `$${a} \\times ${b}=$ `
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          reponse = a * b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `$${a} \\times ${b}$`

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1

          break

        case 2:
          a = randint(21, 29)
          b = randint(11, 19)

          reponse = a + b
          texte = `$${a} + ${b}=$ `
          texteCorr = `$${a}+${b}=${miseEnEvidence(a + b)}$`
          reponse = a + b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }

          this.canEnonce = `$${a} + ${b}$`

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 3:
          a = randint(0, 3)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])
          d = randint(1, 9, [a, b, c])
          m = choice(['centaines', 'dizaines'])
          n = a * 1000 + b * 100 + c * 10 + d
          texte = `Quel est le nombre entier de ${m} dans $${texNombre(n)}$ ? `
          if (a !== 0) {
            if (m === 'centaines') {
              texteCorr = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 10 + b}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(a * 10 + b)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
              reponse = a * 10 + b
            }
            if (m === 'dizaines') {
              texteCorr = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${a * 100 + b * 10 + c}\\times 10+${d}$, il y a $${miseEnEvidence(a * 100 + b * 10 + c)}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
              reponse = a * 100 + b * 10 + c
            }
          } else {
            if (m === 'centaines') {
              texteCorr = `Comme $${b * 100 + c * 10 + d}=${b}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(b)}$ ${m} dans $${a * 1000 + b * 100 + c * 10 + d}$.`
              reponse = b
            }
            if (m === 'dizaines') {
              texteCorr = `Comme $${b * 100 + c * 10 + d}=${b * 10 + c}\\times 10+${d}$, il y a $${miseEnEvidence(b * 10 + c)}$ ${m} dans $${a * 1000 + b * 100 + c * 10 + d}$.`
              reponse = b * 10 + c
            }
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 4:
          a = randint(1, 3) * 100 + randint(1, 10)
          b = choice([11, 12, 13])
          texte = `$${a}-${b}=$ `
          texteCorr = `$${a}-${b}=${miseEnEvidence(a - b)}$ `
          reponse = a - b

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `$${a}-${b}$ `

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 5:
          a = randint(2, 9)
          b = randint(4, 10)
          c = a * b
          if (choice([true, false])) {
            texte = `Complète : $${a}\\times \\ldots =${c}$`
            texteCorr = `$${a}\\times ${miseEnEvidence(b)} =${c}$`
            this.canEnonce = 'Complète. '
            this.canReponseACompleter = `$${a}\\times \\ldots =${c}$`
          } else {
            texte = `Complète : $ \\ldots \\times ${a}=${c}$`
            texteCorr = `$ ${miseEnEvidence(b)} \\times ${a}=${c}$`
            this.canEnonce = 'Complète. '
            this.canReponseACompleter = ` $ \\ldots \\times ${a}=${c}$`
          }
          reponse = b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break
        case 6:
          a = randint(2, 5)
          b = choice([10, 15, 20, 25, 30, 35, 40])
          reponse = b + 15
          texte = `Ajoute un quart d'heure à $${a}$ h $${b}$ min.`

          texteCorr = `Un quart d'heure est égal à $15$ minutes. Ainsi $${a}$ h $${b}$ min + $15$ min est égal à $${miseEnEvidence(`${a}\\text{ h }${b + 15}\\text{ min}`)}$.`

          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierHms,
          )
          handleAnswers(this, index, {
            reponse: {
              value: new Hms({ hour: a, minute: reponse }).toString(),
              options: { HMS: true },
            },
          })
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1

          break

        case 7:
          a = randint(13, 35) * 2

          reponse = Math.round(a / 2)
          texte = `La moitié de $${a}$ est égale à : `

          texteCorr = `La moitié de $${a}$ est égale à $${a}\\div 2=${miseEnEvidence(texNombre(a / 2))}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = 'Complète.'
          this.canReponseACompleter = `La moitié de $${a}$ est égale à : $\\ldots$ `
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 8:
          a = randint(3, 6)
          b = choice([1, a - 1])
          reponse = fraction(b, a) // .simplifie()
          texte =
            'Quelle est la fraction repérée par le point d’interrogation ?<br>' +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1,
                xmax: 10,
                ymax: 1.5,
                scale: 0.8,
                center: !context.isHtml,
              },
              texteParPosition('?', (8 * b) / a, 0.7, 0, bleuMathalea, 2),
              droiteGraduee({
                Unite: 8,
                Min: 0,
                Max: 1,
                x: 0,
                y: 0,
                thickSecDist: 1 / a,
                thickSec: true,
                thickOffset: 0,
                axeStyle: '|->',
                // pointListe: [[b / a, '?']],
                labelPointTaille: 15,
                pointCouleur: bleuMathalea,
                pointStyle: 'x',
                labelsPrincipaux: true,
                step1: 1,
                step2: 1,
              }),
            )
          texteCorr = `L'unité est divisée en $${a}$. Ainsi, le point d'interrogation est $${miseEnEvidence(`\\dfrac{${b}}{${a}}`)}$.`
          handleAnswers(this, i, {
            reponse: {
              value: reponse.toLatex(),
              options: { fractionEgale: true },
            },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 9:
          a = randint(11, 15)
          b = randint(2, 5) * 10
          k = randint(2, 3)
          truc = choice(['vis', 'boulons'])
          reponse = k * b
          texte = `$${a}$ ${truc} pèsent $${b}$ g.<br>
           `

          texteCorr = `Si $${a}$ ${truc} pèsent $${b}$ g, alors $${k}\\times ${a}\\text{ ${truc} }=${k * a}$ ${truc} pèsent $${miseEnEvidence(k * b)}$ g. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              `$${a * k}$ ${truc} pèsent ` +
              ajouteChampTexteMathLive(this, index, ' ') +
              ' g'
          } else {
            texte += `$${a * k}$ ${truc} pèsent $\\ldots\\ldots$ g.`
          }

          this.canEnonce = `$${a}$ ${truc} pèsent $${b}$ g.`
          this.canReponseACompleter = `$${a * k}$ ${truc} pèsent $\\ldots$ g`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 10:
          a = randint(2, 4) * 12
          k = choice([3, 4, 6])
          reponse = Math.round(a / k)
          texte = `$${a}\\div ${k}=$`

          texteCorr = `$${a}\\div ${k}=${miseEnEvidence(a / k)}$ car $${k}\\times ${a / k}=${a}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }

          this.canEnonce = `$${a}\\div ${k}$`

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break
        case 11:
          a = randint(2, 9)
          b = randint(2, 9)
          texte = `Donne l'écriture décimale de $(${a}\\times 10)+\\left(${b}\\times \\dfrac{1}{100}\\right)$.`
          texteCorr = `$(${a}\\times 10)+\\left(${b}\\times \\dfrac{1}{100}\\right)=${10 * a}+${b}\\times 0,01=${10 * a}+${texNombre(b / 100)}=${miseEnEvidence(texNombre(10 * a + b / 100))}$`
          reponse = arrondi(10 * a + b / 100, 2)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break
        case 12:
          a = randint(3, 9)
          b = randint(11, 29, 20)
          reponse = a * 10 + b
          texte = `$${a}$ dizaines $${b}$ unités $=$ `

          texteCorr = `$${a}$ dizaines $${b}$ unités $=${texNombre(a * 10)}+${b}=${miseEnEvidence(texNombre(a * 10 + b))}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }

          this.canEnonce = `$${a}$ dizaines $${b}$ unités`

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 13:
          a = choice([1, 2, 3, 4, 6, 7, 8, 9]) // numérateur
          reponse = arrondi(a / 5, 1)
          texte =
            "Détermine l'abscisse du point A :<br> On donnera le résultat sous forme décimale.<br>" +
            mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 14,
                ymax: 1.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              texteParPosition(
                'A',
                (3 * a) / 5,
                0.7,
                0,
                bleuMathalea,
                context.isHtml ? 2 : 1,
                'milieu',
              ),
              droiteGraduee({
                Unite: 3,
                Min: 0,
                Max: 3.2,
                x: 0,
                y: 0,
                thickSecDist: 1 / 5,
                thickSec: true,
                thickOffset: 0,
                axeStyle: '|->',
                pointListe: [[a / 5, '']],
                pointCouleur: bleuMathalea,
                pointTaille: 4,
                pointStyle: 'x',
                labelsPrincipaux: true,
                step1: 1,
                step2: 1,
              }),
            )
          texteCorr = `L'unité est divisée en $5$. Ainsi, l'abscisse du point $A$ est $\\dfrac{${a}}{5}=${miseEnEvidence(texNombre(reponse))}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 14:
          a = choice([4, 8, 12, 16])
          b = choice([0.5, 0.25])
          reponse = Math.round(a * b)
          texte = `$${a}\\times ${texNombre(b)}=$ `
          if (b === 0.5) {
            texteCorr = `Multiplier par $0,5$ revient à multiplier par $\\dfrac{1}{2}$, c'est-à-dire diviser par $2$. <br>
                                Ainsi : $${a}\\times ${texNombre(b)}=${a}\\div 2=${miseEnEvidence(texNombre(reponse))}$.`
          }
          if (b === 0.25) {
            texteCorr = `Multiplier par $0,25$ revient à multiplier par $\\dfrac{1}{4}$, c'est-à-dire diviser par $4$. <br>
                                Ainsi : $${a}\\times ${texNombre(b)}=${a}\\div 4=${miseEnEvidence(texNombre(reponse))}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `$${a}\\times ${texNombre(b)}$ `

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 15:
          fleurs = choice(['roses', 'tulipes', 'pâquerettes', 'mufliers'])
          k = randint(3, 7)

          b = randint(2, 5) * 10
          a = b * k

          reponse = k
          texte = `Avec $${a}$ ${fleurs}, un fleuriste compose $${b}$ bouquets identiques.<br>
          Combien y a-t-il de ${fleurs} dans chaque bouquet ?`
          texteCorr = `Le nombre de bouquets est donné par la division de $${a}$ par $${b}$.<br>
          On a $${a}\\div ${b}=${k}$. Ainsi, le fleuriste pourra composer $${miseEnEvidence(k)}$ bouquets identiques.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 16:
          a = choice([
            'du quart',
            'du cinquième',
            'des trois quarts',
            'de la moitié',
          ])
          texte = `L'écriture décimale ${a} de $1$ est : `
          if (a === 'du quart') {
            reponse = '0.25' // ça c'est un mon moyen d'éviter d'avoir des chiffres qui viennent s'ajouter à la fin du nombre.
            texteCorr = `Le quart de $1$ est égal à $${1}\\div 4=${miseEnEvidence(texNombre(0.25, 2))}$.`
          }
          if (a === 'du cinquième') {
            reponse = '0.2'
            texteCorr = `Le cinquième de $1$ est égal à $${1}\\div 5=${miseEnEvidence(texNombre(0.2, 1))}$.`
          }
          if (a === 'des trois quarts') {
            reponse = '0.75'
            texteCorr = `Les trois quarts de $1$ valent : $${1}\\times\\dfrac{3}{4}=3\\times \\dfrac{1}{4}=3\\times 0,25=${miseEnEvidence(texNombre(0.75, 2))}$.`
          }
          if (a === 'de la moitié') {
            reponse = '0.5'
            texteCorr = `La moitié de $1$ est égale à $${1}\\div 2=${miseEnEvidence(texNombre(0.5, 1))}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `Écriture décimale ${a} de $1$ `

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break
        case 17: {
          const unites: Array<[string, number]> = [
            ['dixièmes', 0.1],
            ['centièmes', 0.01],
            ['millièmes', 0.001],
          ]
          a = choice([10, 100, 1000])
          b = randint(2, 9)
          c = choice([0, 2])

          reponse = new FractionEtendue(a * b * unites[c][1], 1)
          texte = `Quel est le nombre $${texNombre(a, 0)}$ fois plus grand que $${b}$ ${unites[c][0]} ?`
          texteCorr = `Le nombre $${texNombre(a, 0)}$ fois plus grand que $${b}$ ${unites[c][0]} est $${texNombre(a, 0)}\\times ${b}\\times ${texNombre(unites[c][1])}=${miseEnEvidence(texNombre(a * b * unites[c][1]))}$.`

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce ?? '')
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break
        }
        case 18:
          j = randint(3, 8)
          A = pointAbstrait(0, 0)
          B = pointAbstrait(j, 0)
          C = pointAbstrait(j, 1.5)
          D = pointAbstrait(0, 1.5)
          xmin = -2
          ymin = -0.5
          xmax = j + 1
          ymax = 2.7
          pol = polygoneAvecNom(A, B, C, D)

          // segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1)
          objets = []
          objets.push(pol[0]) //, pol[1]
          for (let indice = 0; indice < j; indice++) {
            objets.push(segment(indice, 0, indice, 1.5))
          }
          objets.push(
            segmentAvecExtremites(-0.3, 0, -0.3, 1.5),
            segmentAvecExtremites(0, 1.8, j, 1.8),
          )

          objets.push(
            texteParPosition(
              `${stringNombre(j)} cm`,
              milieu(D, C).x,
              milieu(D, C).y + 0.5,
            ),
            texteParPosition(
              `${stringNombre(1.5)} cm`,
              milieu(D, A).x - 1.1,
              milieu(D, A).y,
            ),
            segment(0, 0.5, j, 0.5),
          )
          reponse = arrondi(j * 1.5, 1)
          texte = "Quelle est l'aire du rectangle ?<br>"
          texte += mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 30,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.7,
              center: !context.isHtml,
            },
            objets,
          )

          texteCorr = `Le rectangle est constitué de $${j}$ carrés d'aire $1\\text{ cm}^2$ et de $${j}$ rectangles d'aire $0,5\\text{ cm}^2$.<br>
            Son aire totale est donc : $ ${j} \\times 1 \\text{ cm}^2+ ${j} \\times 0,5\\text{ cm}^2=${miseEnEvidence(texNombre(reponse, 2))}\\text{ cm}^2$.
            `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + ' cm$^2$'
          }
          this.canEnonce = texte
          this.canReponseACompleter =
            '$\\mathscr{A}=\\ldots\\ldots\\text{ cm}^2$'
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 19:
          reponse = 2 * randint(3, 12) + 1
          a = arrondi(reponse / 2, 1)
          texte = `Le double de $${texNombre(a)}$ est égal à : `
          texteCorr = `Le double de $${texNombre(a)}$ est égal à : $${texNombre(a)}\\times 2=${miseEnEvidence(reponse)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `Le double de $${texNombre(a)}$ `

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 20:
          fraction1 = choice(listeFractions1)
          n1 = fraction1[0]
          d1 = fraction1[1]
          a = Math.floor(n1 / d1)
          reponse = `${a};${a + 1}`
          texte = 'Encadre la fraction par deux entiers consécutifs : '
          texte += ` $\\ldots < \\dfrac{${n1}}{${d1}} < \\ldots$`
          texteCorr = `$${miseEnEvidence(a)} < \\dfrac{${n1}}{${d1}} < ${miseEnEvidence(a + 1)}$`
          texteCorr += `$\\quad$ car $\\quad ${a}=\\dfrac{${a * d1}}{${d1}}\\quad$ et $\\quad${a + 1}=\\dfrac{${(a + 1) * d1}}{${d1}}$ `

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { suiteDeNombres: true } },
          })
          if (this.interactif) {
            texte += '<br>Écrire les entiers séparés par un point-virgule.'
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = 'Encadre la fraction par deux entiers consécutifs.'
          this.canReponseACompleter = `$\\ldots < \\dfrac{${n1}}{${d1}} < \\ldots$`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 21:
          a = randint(1, 4) * 12
          if (choice([true, false])) {
            texte = `Le tiers de $${a}$ œufs est `
            reponse = Math.round(a / 3)
            texteCorr = `Le tiers de $${a}$ œufs est $${a}\\div 3=${miseEnEvidence(a / 3)}$ œufs. `
          } else {
            texte = `Le quart de $${a}$ œufs est `
            reponse = Math.round(a / 4)
            texteCorr = `Le quart de $${a}$ œufs est $${a}\\div 4=${miseEnEvidence(a / 4)}$ œufs. `
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ') + ' œufs.'
          } else {
            texte += ' $\\ldots$ œufs.'
          }
          this.canEnonce = `Le tiers de $${a}$ œufs est`
          this.canReponseACompleter = '$\\ldots$ œufs'
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 22:
          a = randint(1, 4) * 120
          if (choice([true, false])) {
            texte = `Le tiers de $${a}$ g est `
            reponse = Math.round(a / 3)
            texteCorr = `Le tiers de $${a}$ g est $${a} \\text{ g }\\div 3=${miseEnEvidence(a / 3)}$ g. `
          } else {
            texte = `Le quart de $${a}$ g est `
            reponse = Math.round(a / 4)
            texteCorr = `Le quart de $${a}$ g est $${a} \\text{ g } \\div 4=${miseEnEvidence(a / 4)}$ g. `
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ') + ' g.'
          } else {
            texte += ' $\\ldots$ g.'
          }

          this.canEnonce = `Le tiers de $${a}$ g`
          this.canReponseACompleter = '$\\ldots$ g'
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 23:
          chiffre = [
            ['deux', 2],
            ['trois', 3],
            ['cinq', 5],
          ]
          chiffre2 = [
            ['vingt', 20],
            ['trente', 30],
            ['cinquante', 50],
          ]
          a = randint(0, 2)
          choix = choice(['a', 'b', 'c', 'd'])
          if (choix === 'a') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-cent-${chiffre[a][0]}-mille-${chiffre[a][0]} `
            reponse =
              2 * 1000000 +
              chiffre[a][1] * 100000 +
              chiffre[a][1] * 1000 +
              chiffre[a][1]
            texteCorr = `Deux-millions-${chiffre[a][0]}-cent-${chiffre[a][0]}-mille-${chiffre[a][0]} $=
            ${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 100000 + chiffre[a][1] * 1000)} + ${texNombre(chiffre[a][1])}
                        =${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 100000 + chiffre[a][1] * 1000 + chiffre[a][1]))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'b') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-mille-${chiffre[a][0]} `
            reponse = 2 * 1000000 + chiffre[a][1] * 1000 + chiffre[a][1]
            texteCorr = `Deux-millions-${chiffre[a][0]}-mille-${chiffre[a][0]} $=${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 1000)} + ${texNombre(chiffre[a][1])}=${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 1000 + chiffre[a][1]))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'c') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre2[a][0]}-mille-${chiffre[a][0]} `
            reponse = 2 * 1000000 + chiffre2[a][1] * 1000 + chiffre[a][1]
            texteCorr = `Deux-millions-${chiffre2[a][0]}-mille-${chiffre[a][0]} $=${texNombre(2 * 1000000)} + ${texNombre(chiffre2[a][1] * 1000)} + ${texNombre(chiffre[a][1])}=${miseEnEvidence(texNombre(2 * 1000000 + chiffre2[a][1] * 1000 + chiffre[a][1]))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'd') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-mille-${chiffre2[a][0]} `
            reponse = 2 * 1000000 + chiffre[a][1] * 1000 + chiffre2[a][1]
            texteCorr = `Deux-millions-${chiffre[a][0]}-mille-${chiffre2[a][0]} $=${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 1000)} + ${texNombre(chiffre2[a][1])}=${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 1000 + chiffre2[a][1]))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '')
            }
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 24:
          a = arrondi(randint(4, 9) / 10, 1)
          k = randint(2, 5)
          reponse = a
          texte = `$${k}$ sucettes coûtent $${texPrix(k * a)}$ €. <br>
            Combien coûte $1$ sucette ?
             `

          texteCorr = `$${k}$ sucettes coûtent $${texPrix(k * a)}$ €, donc $1$ sucette coûte $${k}$ fois moins, c'est-à-dire :
            $${texPrix(k * a)} \\text{ € }\\div ${k}=${miseEnEvidence(texPrix(a))}$ €. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + ' €'
          }

          this.canEnonce = texte
          this.canReponseACompleter = '$\\ldots$ €'
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 25:
          l = randint(2, 8)
          k = randint(2, 5)
          L = k * l
          l2 = l + randint(1, 3)
          A = pointAbstrait(0, 0)
          B = pointAbstrait(4, 0)
          C = pointAbstrait(4, 1.5)
          D = pointAbstrait(0, 1.5)
          E = pointAbstrait(0, 2.5)
          F = pointAbstrait(2.5, 2.5)
          G = pointAbstrait(2.5, 3.5)
          H = pointAbstrait(0, 3.5)
          xmin = -1
          ymin = -0.5
          xmax = 5.5
          ymax = 4
          pol = polygoneAvecNom(A, B, C, D)
          pol2 = polygoneAvecNom(E, F, G, H)

          // segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1)
          objets = []
          objets.push(pol[0]) //, pol[1]
          objets.push(pol2[0])
          objets.push(
            texteParPosition(
              `${stringNombre(l)} cm`,
              milieu(F, G).x + 0.5,
              milieu(F, G).y,
            ),
            texteParPosition(
              `${stringNombre(L)} cm`,
              milieu(E, F).x,
              milieu(E, F).y - 0.3,
            ),
            texteParPosition(
              `${stringNombre(l2)} cm`,
              milieu(B, C).x + 0.5,
              milieu(B, C).y,
            ),
            texteParPosition('A ', milieu(F, G).x - 1.2, milieu(F, G).y),
            texteParPosition('B ', milieu(B, C).x - 2, milieu(B, C).y),
          )
          reponse = l2 * k
          texte = 'Le rectangle B est un agrandissement du rectangle A.<br>'
          texte += 'Quelle est la longueur du rectangle B ?<br>'
          texte += mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 50,
              mainlevee: false,
              scale: 1,
              center: !context.isHtml,
            },
            objets,
          )

          texteCorr = `La longueur du rectangle A est $${k}$ fois plus grande que sa largeur. On en déduit que la longueur du rectangle B est aussi $${k}$ fois plus grande que sa largeur.<br>
          Elle est donc égale à $${l2}\\times ${k}=${miseEnEvidence(k * l2)}\\text{ cm}$.
                  `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          }
          this.canEnonce = texte
          this.canReponseACompleter = '$\\ldots\\text{ cm}$'
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 26:
          a = randint(2, 9)
          b = randint(1, 9) / 10
          reponse = Math.round((a + b) * 1000)
          texte = `$${texNombre(a + b, 1)}$ milliers $=$ `
          texteCorr = `$${texNombre(a + b, 1)}$ milliers $=${texNombre(a + b, 1)}\\times ${texNombre(1000)}=${miseEnEvidence(texNombre(reponse))}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          this.canEnonce = `$${texNombre(a + b, 1)}$ milliers`

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 27:
          prenom1 = prenomF()

          b = randint(3, 5)
          reponse = randint(4, 9)
          a = reponse * b
          texte = `${prenom1} a $${a}$ billes. Elle en a $${b}$ fois plus que sa sœur.<br>
            Combien de billes sa sœur a-t-elle ? `
          texteCorr = `Puisque ${prenom1} en a $${b}$ fois plus, sa sœur en a $${b}$ fois moins, soit : $${a}\\div ${b}=${miseEnEvidence(a / b)}$. `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 28:
          a = randint(2, 9)
          texte = `Complète : $${a}\\text{ m}^3=$ `
          texteCorr = `$1\\text{ m}^3$ est égal à $${texNombre(1000)}$ litres. Ainsi, $${a}\\text{ m}^3=${a}\\times ${texNombre(1000)} \\text{ L }=${miseEnEvidence(texNombre(1000 * a))}$ L.`
          reponse = a * 1000

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'L'
          } else {
            texte += '$\\ldots$ L'
          }
          this.canEnonce = 'Complète. '
          this.canReponseACompleter = `$${a}\\text{ m}^3=\\ldots$ L`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 29:
          a = 2 + randint(6, 9) / 10
          b = arrondi(2 + randint(1, 7) / 10 + randint(1, 9) / 100, 2)
          c = arrondi(
            2 + randint(0, 7) / 10 + randint(7, 9) / 100 + randint(1, 9) / 1000,
            3,
          )
          propositions = shuffle([
            `$${texNombre(a)}$`,
            `$${texNombre(b)}$`,
            `$${texNombre(c)}$`,
          ])
          reponse = arrondi(Math.max(a, b, c), 3)
          texte = 'Recopie le plus grand nombre : <br>'

          texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`
          texteCorr = `Les trois nombres ont les mêmes unités, le plus grand est celui qui a le plus grand chiffre des dixièmes. S'ils ont le même chiffre des dixièmes, le plus grand est celui qui a le plus grand chiffre des centièmes, etc $\\ldots$<br>
          Le plus grand nombre est donc : $${miseEnEvidence(texNombre(Math.max(a, b, c), 3))}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
          nbChamps = 1
          break

        case 30:
          a = randint(2, 3)
          b = randint(2, 3)
          c = randint(2, 3)
          texte = `À la cantine, il y a toujours $${a}$ entrées différentes, $${b}$ plats différents et $${c}$ desserts différents.<br>
            Combien de menus (composés d'une entrée, d'un plat et d'un dessert) différents peut-on avoir dans cette cantine ?`
          texteCorr = `On peut avoir : $${a}\\times ${b}\\times ${c} =${miseEnEvidence(a * b * c)}$ menus différents.`
          reponse = a * b * c
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.canEnonce = texte

          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
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
