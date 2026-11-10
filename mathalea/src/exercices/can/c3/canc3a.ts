import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteSurSegment } from '../../../lib/2d/texteSurSegment'
import { homothetie } from '../../../lib/2d/transformations'
import { texPrix } from '../../../lib/format/style'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { personne, prenom } from '../../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { afficheCoteSegment } from '../../../lib/2d/AfficheCoteSegment'
import { polygoneRegulier } from '../../../lib/2d/polygonesParticuliers'
import { bleuMathalea } from '../../../lib/colors'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { arrondi } from '../../../lib/outils/nombres'
import { mathalea2d } from '../../../modules/mathalea2d'
import { deDevant } from '../../../lib/outils/outilString'

export const titre = 'Course aux nombres CM1'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Ensemble de questions pour course aux nombres
 * @author Jean-claude Lhote

 */
export const dateDeModifImportante = '31/10/2026'
export const uuid = '32a0f'

export const refs = {
  'fr-fr': ['canc3a'],
  'fr-ch': [],
}
export default class CourseAuxNombresCM extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      ` Nombres séparés par des tirets :\n1 : Somme d'entiers\n
2 : Différence d'entiers\n
3 : Somme d'entiers avec retenue\n
4 : Différence d'entiers avec retenue\n
5 : Décomposition\n
6 : Division d'entiers\n
7 : Somme décimal et entier\n
8 : Somme de décimaux\n
9 : Différence de décimaux\n
10 : Différence décimaux\n
11 : Division d'entiers\n
12 : Addition d'entiers\n
13 : Différence d'entiers\n
14 : Produit d'entiers\n
15 : Produit décimal entier\n
16 : Ajout d'un décimal à un entier\n
17 : Fait numérique table de x\n
18 : Multiplication par 4\n
19 : Différence de décimaux\n
20 : Somme de décimaux\n
21 : Multiple de 8\n
22 : Multiplication entier et décimal\n
23 : Multiplier par 20\n
24 : Proportionnalité\n
25 : Quotient par 4\n
26 : Triple d'entier\n
27 : Soustraction entiers mesures\n
28 : Durée\n
29 : Proportionnalité\n
30 : Addition d'entiers mesures\n
31 : Mélange`,
    ]
    this.nbQuestions = 30
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
  }

  nouvelleVersion() {
    let a = 0
    let b = 0
    let c, d, resultat, objets, A, B, C

    const listeIndex = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      max: 30,
      defaut: 31,
      melange: 31,
      shuffle: false,
    }).map((index) => Number(index) - 1)

    const fruits2: Array<[string, number, number, number]> = [
      ['pêches', 4.5, 10, 30],
      ['noix', 5.2, 4, 13],
      ['cerises', 6.4, 11, 20],
      ['pommes', 2.7, 20, 40],
      ['framboises', 10.5, 1, 5],
      ['fraises', 7.5, 5, 10],
      ['citrons', 1.8, 15, 30],
      ['bananes', 1.7, 15, 25],
    ]
    const typeQuestionsDisponibles = [
      // Les dix premières sont identiques dans le fichier betaCaNCM2
      'q1', // Somme d'entiers
      'q2', // Différence d'entiers
      'q3', // Somme d'entiers avec retenue
      'q4', // Différence d'entiers avec retenue
      'q5', // Décomposition
      'q6', // Division d'entiers
      'q7', // Somme décimal et entier
      'q8', // Somme de décimaux
      'q9', // Différence de décimaux
      'q10', // Différence décimaux
      'q11', // Division d'entiers
      'q12', // Addition d'entiers
      'q13', // Différence d'entiers
      'q14', // Produit d'entiers
      'q15', // Produit décimal entier
      'q16', // Ajout d'un décimal à un entier
      'q17', // Fait numérique table de x
      'q18', // Multiplication par 4
      'q19', // Différence de décimaux
      'q20', // Somme de décimaux
      'q21', // Multiple de 8
      'q22', // Multiplication entier et décimal
      'q23', // Multiplier par 20
      'q24', // Proportionnalité
      'q25', // Quotient par 4
      'q26', // Triple d'entier
      'q27', // Soustraction entiers mesures
      'q28', // Durée
      'q29', // Proportionnalité
      'q30', // Addition d'entiers mesures
    ]
    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      // texNombre(n) permet d'écrire un nombre avec le bon séparateur décimal !! à utiliser entre $  $
      // calcul(expression) permet d'éviter les erreurs de javascript avec les approximations décimales
      // texNombre(expression) fait les deux choses ci-dessus.
      switch (
        typeQuestionsDisponibles[listeIndex[i]] // Suivant le type de question, le contenu sera différent
      ) {
        case 'q1': // somme d'entiers à deux chiffres sans retenue
          a = randint(1, 3) * 10 + randint(1, 5)
          b = randint(1, 5) * 10 + randint(1, 4)
          texte = `$${a}+${b}$`
          texteCorr = `$${a}+${b}=${miseEnEvidence(a + b)}$`
          handleAnswers(this, i, { reponse: { value: a + b } })
          break
        case 'q2': // différence d'entiers sans retenue
          a = randint(1, 3) * 10 + randint(1, 5)
          b = randint(1, 5) * 10 + randint(1, 4)
          texte = `$${a + b}-${a}$`
          texteCorr = `$${a + b}-${a}=${miseEnEvidence(b)}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q3': // somme d'entiers à deux chiffres avec retenue
          a = randint(1, 3) * 10 + randint(5, 9)
          b = randint(1, 5) * 10 + randint(11 - (a % 10), 9)
          texte = `$${a}+${b}$`
          texteCorr = `$${a}+${b}=${miseEnEvidence(a + b)}$`
          handleAnswers(this, i, { reponse: { value: a + b } })
          break
        case 'q4': // difference avec retenue
          a = randint(1, 3) * 10 + randint(5, 9)
          b = randint(1, 5) * 10 + randint(11 - (a % 10), 9)
          texte = `$${a + b}-${a}$`
          texteCorr = `$${a + b}-${a}=${miseEnEvidence(b)}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q5': // Décomposition
          a = randint(1, 3)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])
          resultat = arrondi(a * 1000 + b * 10 + c * 100)
          texte = `$${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 10 + ${texNombre(c)}\\times 100$`
          texteCorr = `$${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 10 + ${texNombre(c)}\\times 100 =${miseEnEvidence(texNombre(resultat))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q6': // Division d'entiers
          a = randint(2, 9)
          b = randint(3, 9)
          texte = `$${a * b}\\div${a}$`
          texteCorr = `$${a * b}\\div${a}=${miseEnEvidence(b)}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q7': // Somme entier et décimal
          a = arrondi(randint(1, 5) + randint(1, 5) / 10)
          b = randint(1, 4)
          texte = `$${texNombre(a)}+${b}$`
          texteCorr = `$${texNombre(a)}+${b}=${miseEnEvidence(texNombre(a + b))}$`
          handleAnswers(this, i, { reponse: { value: arrondi(a + b) } })
          break
        case 'q8': // Somme décimaux
          a = arrondi(randint(1, 5) + randint(1, 5) / 10)
          b = arrondi(randint(1, 4) + randint(1, 4) / 10 + randint(1, 9) / 100)
          texte = `$${texNombre(a)}+${texNombre(b)}$`
          texteCorr = `$${texNombre(a)}+${texNombre(b)}=${miseEnEvidence(texNombre(a + b))}$`
          handleAnswers(this, i, { reponse: { value: arrondi(a + b) } })
          break
        case 'q9': // Différence décimaux
          a = arrondi(randint(1, 5) + randint(1, 5) / 10)
          b = arrondi(randint(1, 4) + randint(1, 4) / 10 + randint(1, 9) / 100)
          texte = `$${texNombre(a + b)}-${texNombre(a)}$`
          texteCorr = `$${texNombre(a + b)}-${texNombre(a)}=${miseEnEvidence(texNombre(b))}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q10': // Différence décimaux avec retenue
          a = arrondi(randint(1, 5) + randint(5, 9) / 10)
          b = arrondi(randint(1, 4) + randint(5, 9) / 10)
          texte = `$${texNombre(a + b)}-${texNombre(a)}$`
          texteCorr = `$${texNombre(a + b)}-${texNombre(a)}=${miseEnEvidence(texNombre(b))}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q11': // Divisions d'entiers
          a = choice([2, 3, 4, 5])
          b = randint(3, 9)
          c = prenom()
          texte = `J'ai $${arrondi(a * b)}$ ans. Je suis $${a}$ fois plus âgé que ${c}.<br>Quel âge a ${c} ?`
          texteCorr = `L'âge de ${c} est : $${arrondi(a * b)} \\div ${a}=${miseEnEvidence(b)}$ ans.`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q12': // Addition d'entiers
          a = randint(1, 2) * 10 + randint(1, 9)
          b = randint(1, 2) * 10 + randint(1, 5)
          c = randint(1, 2) * 10 + randint(1, 9)
          d = personne()
          texte = `${d.prenom} participe à une course par étapes. La première étape fait $${a}\\text{ km}$, la deuxième fait $${b}\\text{ km}$ et la dernière fait $${c}\\text{ km}$.<br>Combien de kilomètres ${d.prenom} a-t-${d.pronom} parcourus ?`
          texteCorr = `${d.prenom} a parcouru : $${a} + ${b} + ${c} = ${miseEnEvidence(a + b + c)}\\text{ km}$.`
          handleAnswers(this, i, { reponse: { value: arrondi(a + b + c) } })
          break
        case 'q13': // Différence d'entiers
          a = randint(11, 19)
          b = randint(3, 8)
          c = arrondi(a - b)
          d = personne()
          switch (randint(1, 2)) {
            case 1:
              texte = `${d.prenom} a $${a}$ ans. ${d.pronom} a $${b}$ ans de plus que son frère.<br>Quel âge a son frère ?`
              texteCorr = `Le frère ${deDevant(d.prenom)} a : $${a} - ${b} = ${miseEnEvidence(a - b)}$ ans.`
              break
            case 2:
              texte = `${d.prenom} a $${a}$ ans. Sa sœur a $${b}$ ans.<br>Quelle est leur différence d'âge ?`
              texteCorr = `La différence d'âge entre ${d.prenom} et sa sœur est : $${a}-${b}=${miseEnEvidence(a - b)}$ ans.`
              break
          }
          handleAnswers(this, i, { reponse: { value: arrondi(a - b) } })
          break
        case 'q14': // Produit d'entiers
          a = randint(2, 6)
          b = randint(7, 12)
          d = personne()
          switch (randint(1, 2)) {
            case 1:
              texte = `${d.prenom} possède $${a}$ lots de $${b}$ ${choice(['crayons', 'cartes', 'stylos', 'livres'])}. Combien en a-t-${d.pronom} ?`
              texteCorr = `${d.prenom} en possède : $${a} \\times ${b}=${miseEnEvidence(arrondi(a * b))}$.`
              break
            case 2:
              texte = `${d.prenom} a couru $${a}$ séquences de $${b}$ minutes. Combien de minutes a-t-${d.pronom} couru en tout ?`
              texteCorr = `${d.prenom} a couru : $${a} \\times ${b}=${miseEnEvidence(arrondi(a * b))}$ minutes.`
              break
          }
          handleAnswers(this, i, { reponse: { value: arrondi(a * b) } })
          break
        case 'q15': {
          // Produit décimal entier
          a = arrondi(randint(1, 5) + randint(1, 5) / 10)
          b = randint(2, 5)
          const fruit = choice(fruits2)
          d = personne()
          texte = `Le kilogramme de ${fruit[0]} est vendu $${texPrix(fruit[1])}$ €. ${d.prenom} en achète $${b}$ kg. Combien va-t-${d.pronom} payer ?`
          texteCorr = `${d.prenom} devra payer $${b}\\times${texPrix(fruit[1])}=${miseEnEvidence(texPrix(fruit[1] * b))}$ €.`
          handleAnswers(this, i, { reponse: { value: arrondi(b * fruit[1]) } })
          break
        }
        case 'q16': // ajout d'un décimal à un entier
          a = arrondi(randint(1, 5) + randint(1, 5) / 10)
          b = randint(1, 15)
          switch (randint(1, 3)) {
            case 1:
              texte = `Combien font $${b}$ de plus que $${texNombre(a)}$ ?`
              texteCorr = `$${texNombre(a)}+${b}=${miseEnEvidence(texNombre(a + b))}$`
              break
            case 2:
              texte = `$\\ldots - ${texNombre(a)}=${b}$`
              texteCorr = `$${miseEnEvidence(texNombre(a + b))} - ${texNombre(a)}=${b}$`
              break
            case 3:
              texte = `$\\ldots - ${b}=${texNombre(a)}$`
              texteCorr = `$${miseEnEvidence(texNombre(a + b))} - ${b}=${texNombre(a)}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: arrondi(a + b) } })
          break
        case 'q17': // fait numérique table de multiplication
          a = randint(2, 9)
          b = randint(5, 9)
          switch (randint(1, 3)) {
            case 1:
              texte = `$${a} \\times ${b}$`
              texteCorr = `$${a} \\times ${b}=${miseEnEvidence(arrondi(a * b))}$`
              handleAnswers(this, i, { reponse: { value: arrondi(a * b) } })
              break
            case 2:
              texte = `$${a} \\times \\ldots = ${arrondi(a * b)}$`
              texteCorr = `$${a} \\times ${miseEnEvidence(b)}=${arrondi(a * b)}$`
              handleAnswers(this, i, { reponse: { value: b } })
              break
            case 3:
              texte = `$\\ldots \\times ${b}= ${arrondi(a * b)}$`
              texteCorr = `$${miseEnEvidence(a)} \\times ${b}=${arrondi(a * b)}$`
              handleAnswers(this, i, { reponse: { value: a } })
              break
          }
          break
        case 'q18': // fait numérique multiplication par 4
          a = randint(6, 19)
          switch (randint(1, 3)) {
            case 1:
              texte = choice([`$${a} \\times 4$`, `$4 \\times ${a}$`])
              break
            case 2:
              texte = `Quel est le périmètre d'un carré de côté $${a}$ ?`
              texteCorr = `$${a} \\times 4=${miseEnEvidence(arrondi(a * 4))}$`
              break
            case 3:
              texte = `Le double du double de $${a}$`
              break
          }
          texteCorr = `$${a} \\times 4=${miseEnEvidence(arrondi(a * 4))}$`
          handleAnswers(this, i, { reponse: { value: arrondi(a * 4) } })
          break
        case 'q19': // différences de décimaux
          a = arrondi(randint(2, 5) + randint(1, 5) / 10)
          b = arrondi(randint(2, 5) + randint(1, 5) / 10)
          c = arrondi(a + b)
          switch (randint(1, 3)) {
            case 1:
              texte = `On a coupé $${texNombre(a)}\\text{ cm}$ d'une ficelle qui en faisait $${texNombre(c)}$.<br>Combien de centimètres en reste-t-il ?`
              texteCorr = `$${texNombre(c)}-${texNombre(a)}=${miseEnEvidence(texNombre(b))}$`
              break
            case 2:
              texte = `$\\ldots + ${texNombre(a)}=${texNombre(c)}$`
              texteCorr = `$${miseEnEvidence(texNombre(b))} + ${texNombre(a)}=${texNombre(c)}$`
              break
            case 3:
              A = pointAbstrait(0, 0)
              B = pointAbstrait(5, 0)
              C = homothetie(B, A, a / c)
              objets = []
              objets[0] = segment(A, B)
              objets[0].styleExtremites = '|-|'
              objets[1] = texteSurSegment(
                `${stringNombre(c)}`,
                B,
                A,
                'black',
                -0.5,
              )
              objets[2] = segment(A, C)
              objets[2].styleExtremites = '|-|'
              objets[3] = afficheCoteSegment(
                segment(A, C),
                `${stringNombre(a)}`,
                -1,
                bleuMathalea,
              )
              objets[4] = afficheCoteSegment(segment(C, B), '?', -1, 'red')
              texte = mathalea2d(
                {
                  xmin: -0.1,
                  xmax: 5.1,
                  ymin: -1.5,
                  ymax: 1.5,
                  pixelsParCm: 20,
                  scale: 1,
                },
                objets,
              )
              texteCorr = `$${texNombre(c)} - ${texNombre(a)}=${miseEnEvidence(texNombre(b))}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q20': // somme de décimaux
          a = arrondi(randint(2, 5) + randint(1, 5) / 10)
          b = arrondi(randint(2, 5) + randint(1, 5) / 10)
          c = arrondi(a + b)
          switch (randint(1, 3)) {
            case 1:
              texte = `On a soudé ensemble une barre de $${texNombre(a)}\\text{ m}$ et une autre de $${texNombre(b)}\\text{ m}$.<br>Combien de mètres fait l'assemblage ?`
              texteCorr = `$${texNombre(a)}+${texNombre(b)}=${miseEnEvidence(texNombre(c))}$`
              break
            case 2:
              texte = `$\\ldots - ${texNombre(a)}=${texNombre(b)}$`
              texteCorr = `$${miseEnEvidence(texNombre(c))} - ${texNombre(a)}=${texNombre(b)}$`
              break
            case 3:
              A = pointAbstrait(0, 0)
              B = pointAbstrait(5, 0)
              C = homothetie(B, A, a / c)
              objets = []
              objets[0] = segment(A, B)
              objets[0].styleExtremites = '|-|'
              objets[1] = afficheCoteSegment(objets[0], '?', 0.5, 'red')
              objets[2] = segment(A, C)
              objets[2].styleExtremites = '|-|'
              objets[3] = afficheCoteSegment(
                objets[2],
                `${stringNombre(a)}`,
                -1,
                bleuMathalea,
              )
              objets[4] = afficheCoteSegment(
                segment(C, B),
                `${stringNombre(b)}`,
                -1,
                'green',
              )
              texte = mathalea2d(
                {
                  xmin: -0.1,
                  xmax: 5.1,
                  ymin: -1.5,
                  ymax: 1.5,
                  pixelsParCm: 20,
                  scale: 1,
                },
                objets,
              )
              texteCorr = `$${texNombre(a)} + ${texNombre(b)}=${miseEnEvidence(texNombre(c))}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: c } })
          break
        case 'q21': // fait numérique multiplication par 8
          a = randint(4, 15)
          switch (randint(1, 3)) {
            case 1:
              texte = choice([`$${a} \\times 8$`, `$8 \\times ${a}$`])
              texteCorr = `$${a} \\times 8=${miseEnEvidence(arrondi(a * 8))}$`

              handleAnswers(this, i, { reponse: { value: arrondi(a * 8) } })
              break
            case 2:
              texte = `$\\ldots \\times 8=${arrondi(a * 8)}$`
              texteCorr = `$${miseEnEvidence(a)} \\times 8=${arrondi(a * 8)}$`
              handleAnswers(this, i, { reponse: { value: a } })
              break
            case 3:
              texte = `Le quadruple du double de $${a}$`
              texteCorr = `$${a} \\times 2 \\times 4=${miseEnEvidence(arrondi(a * 8))}$`
              handleAnswers(this, i, { reponse: { value: arrondi(a * 8) } })
              break
          }
          break
        case 'q22': // Produit décimal entier
          switch (randint(1, 3)) {
            case 1:
              a = arrondi(randint(1, 5) + randint(1, 5) / 10)
              b = randint(3, 6)
              objets = []
              if (b < 5) {
                A = pointAbstrait(-2, 0)
              } else {
                A = pointAbstrait(0, 0)
              }
              B = pointAbstrait(2, 0)
              C = polygoneRegulier(A, B, b)
              objets[0] = C
              objets[1] = texteSurSegment(`${stringNombre(a)} cm`, B, A)
              objets[2] = codageSegments('//', 'red', C.listePoints)
              texte = 'Quel est le périmètre de ce polygone ?<br>'
              texte += mathalea2d(
                {
                  xmin: -2.5,
                  xmax: 3,
                  ymin: -1,
                  ymax: 5,
                  pixelsParCm: 20,
                  scale: 0.8,
                },
                objets,
              )
              texteCorr = `Le périmètre mesure : $${b} \\times ${texNombre(a)}\\text{ cm}$ $=${miseEnEvidence(texNombre(a * b))}\\text{ cm}$.`
              break
            case 2:
              a = arrondi(randint(4, 5) + choice([0.1, 0.25, 0.5]))
              b = choice([2, 4, 8])
              d = personne()
              texte = `${d.prenom} a acheté $${b}$ ${choice(['livres', 'gâteaux', 'jouets'])} à $${texPrix(a)}$ € pièce.<br>Combien a-t-${d.pronom} dépensé ?`
              texteCorr = `${d.prenom} a dépensé : $${b} \\times ${texPrix(a)} = ${miseEnEvidence(texPrix(arrondi(a * b)))} $ €.`
              break
            case 3:
              a = arrondi(randint(1, 9) + randint(1, 5) / 10)
              b = randint(2, 9)
              d = personne()
              texte = `${d.prenom} a vendu $${b}$ ${choice(['tableaux', 'photos', 'poteries'])} à $${texPrix(a)}$ € pièce.<br>Quelle somme d'argent a-t-${d.pronom} obtenu ?`
              texteCorr = `${d.prenom} a obtenu : $${b} \\times ${texPrix(a)} = ${miseEnEvidence(texPrix(arrondi(a * b)))} $ €.`
              break
          }
          handleAnswers(this, i, { reponse: { value: arrondi(a * b) } })
          break
        case 'q23': // multiplication par 20
          a = arrondi(randint(1, 9) + randint(1, 5) / 10)
          switch (randint(1, 2)) {
            case 1:
              texte = choice([
                `$${texNombre(a)} \\times 20$`,
                `$20 \\times ${texNombre(a)}$`,
              ])
              texteCorr = `$${texNombre(a)} \\times 20=${miseEnEvidence(texNombre(a * 20))}$`
              handleAnswers(this, i, { reponse: { value: arrondi(a * 20) } })
              break
            case 2:
              texte = `$\\ldots \\times 20=${texNombre(a * 20)}$`
              texteCorr = `$${miseEnEvidence(texNombre(a))} \\times 20=${texNombre(a * 20)}$`
              handleAnswers(this, i, { reponse: { value: a } })
              break
          }
          break
        case 'q24': {
          // proportionnalité
          a = randint(0, 7)
          b = fruits2[a][1]
          const quantite = randint(2, 5)
          d = randint(2, 5)
          texte = `$${quantite}$ kg de ${fruits2[a][0]} coûtent $${texPrix(quantite * b)}$ €, combien coûtent $${quantite * d}$ kg de ${fruits2[a][0]} ?`
          texteCorr = `$${quantite * d}$ kg de ${fruits2[a][0]} coûtent : $${texPrix(quantite * b)} \\times ${d} = ${miseEnEvidence(texPrix(quantite * b * d))}$ €.`
          handleAnswers(this, i, {
            reponse: { value: arrondi(quantite * d * b) },
          })
          break
        }
        case 'q25': // quotient par 4
          a = randint(4, 15)
          switch (randint(1, 3)) {
            case 1:
              texte = `$${4 * a} \\div 4$`
              texteCorr = `$${4 * a} \\div 4=${miseEnEvidence(a)}$`
              break
            case 2:
              texte = `$\\ldots \\times 4=${4 * a}$`
              texteCorr = `$${miseEnEvidence(a)} \\times 4=${arrondi(a * 4)}$`
              break
            case 3:
              texte = `La moitié de la moitié de $${4 * a}$`
              texteCorr = `$${4 * a} \\div 4=${miseEnEvidence(a)}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: a } })
          break
        case 'q26': // double d'entiers
          a = randint(11, 99)
          switch (randint(1, 3)) {
            case 1:
              texte = `Le double de $${a}$`
              texteCorr = `$2 \\times ${a} = ${miseEnEvidence(2 * a)}$`
              break
            case 2:
              texte = `Le diamètre d'un cercle de $${a}$ unités de rayon.`
              texteCorr = `Le diamètre est le double du rayon : $2 \\times ${a} = ${miseEnEvidence(2 * a)}$`
              break
            case 3:
              texte = choice([`$2 \\times ${a}$`, `$${a} \\times 2$`])
              texteCorr = `$2 \\times ${a} = ${miseEnEvidence(2 * a)}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: 2 * a } })
          break
        case 'q27': // différences d'entiers mesure
          a = randint(20, 50)
          b = randint(20, 50)
          c = arrondi(a + b)
          A = pointAbstrait(0, 0)
          B = pointAbstrait(5, 0)
          C = homothetie(B, A, a / c)
          objets = []
          objets[0] = segment(A, B)
          objets[0].styleExtremites = '|-|'
          objets[1] = afficheCoteSegment(
            objets[0],
            stringNombre(c, 0),
            0.5,
            'green',
          )
          objets[2] = segment(A, C)
          objets[2].styleExtremites = '|-|'
          objets[3] = afficheCoteSegment(
            objets[2],
            stringNombre(a, 0),
            -1,
            bleuMathalea,
          )
          objets[4] = afficheCoteSegment(segment(C, B), '?', -1, 'red')
          texte = mathalea2d(
            {
              xmin: -0.1,
              xmax: 5.1,
              ymin: -1.5,
              ymax: 1.5,
              pixelsParCm: 20,
              scale: 1,
            },
            objets,
          )
          texteCorr = `$${c} - ${a}=${miseEnEvidence(b)}$`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q28':
          a = randint(17, 21) // heure pleine de début
          b = randint(5, 6) * 5 // minutes de début
          c = randint(17, 23) * 5 // durée en minutes
          d = a + (((b + c) / 60) >> 0) // heure pleine de fin
          resultat = arrondi((b + c) % 60) // minutes de fin
          if (resultat !== 0) {
            if (resultat !== 5) {
              texte = `Le film a commencé à $${a}$ h $${b}$. Il s'est terminé à $${d}$ h $${resultat}$.<br> Combien de minutes a-t-il duré ?`
            } else {
              texte = `Le film a commencé à $${a}$ h $${b}$. Il s'est terminé à $${d}$ h $0${resultat}$.<br> Combien de minutes a-t-il duré ?`
            }
          } else {
            texte = `Le film a commencé à $${a}$ h $${b}$. Il s'est terminé à $${d}$ h.<br> Combien de minutes a-t-il duré ?`
          }
          texteCorr = `Le film a duré $${arrondi((c / 60) >> 0)}$ h $${c % 60}$ min soit $${miseEnEvidence(c)}$ minutes.`
          handleAnswers(this, i, { reponse: { value: c } })
          break
        case 'q29': // proportionnalité
          a = choice([2, 3, 4, 5]) // choix du coefficient
          b = randint(3, 10) // donnée 1
          c = randint(2, 10, b) // donnée 2
          d = choice([
            ['un train électrique', 'il', 'ce train électrique'],
            ['une voiture électrique', 'elle', 'cette voiture électrique'],
            ['un manège', 'il', 'ce manège'],
          ])
          texte = `En $${a * b}$ minutes, ${d[0]} fait $${a * c}$ tours.<br>En $${b}$ minutes ${d[1]} fait \\ldots tours.`
          texteCorr = `En $${a}$ fois moins de temps, ${d[2]} fait $${a}$ fois moins de tours, soit : $${a * c}$ tours $\\div ${a}=${miseEnEvidence(c)}$ tours.`
          handleAnswers(this, i, { reponse: { value: c } })
          break
        case 'q30': // additions d'entiers mesure
          a = randint(20, 50)
          b = randint(20, 50)
          c = arrondi(a + b)
          A = pointAbstrait(0, 0)
          B = pointAbstrait(5, 0)
          C = homothetie(B, A, a / c)
          objets = []
          objets[0] = segment(A, B)
          objets[0].styleExtremites = '|-|'
          objets[1] = afficheCoteSegment(objets[0], '?', 0.5, 'red')
          objets[2] = segment(A, C)
          objets[2].styleExtremites = '|-|'
          objets[3] = afficheCoteSegment(
            objets[2],
            stringNombre(a, 0),
            -1,
            bleuMathalea,
          )
          objets[4] = afficheCoteSegment(
            segment(C, B),
            stringNombre(b, 0),
            -1,
            'green',
          )
          texte = mathalea2d(
            {
              xmin: -0.1,
              xmax: 5.1,
              ymin: -1.5,
              ymax: 1.5,
              pixelsParCm: 20,
              scale: 1,
            },
            objets,
          )
          texteCorr = `$${a} + ${b}=${miseEnEvidence(c)}$`
          handleAnswers(this, i, { reponse: { value: c } })
          break
      }

      texte += ajouteChampTexteMathLive(this, i)
      if (
        this.questionJamaisPosee(
          i,
          typeQuestionsDisponibles[listeIndex[i]],
          a,
          b,
          String(c ?? ''),
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
