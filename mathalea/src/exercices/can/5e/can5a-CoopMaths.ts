import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/format/style'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { buildQcmForExercise } from '../../../lib/interactif/qcmBuilder'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { arrondi } from '../../../lib/outils/nombres'
import FractionEtendue from '../../../modules/FractionEtendue'
import Grandeur from '../../../modules/Grandeur'

export const titre = 'Course aux nombres début de 5e'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Course aux nombres avec 30 questions début de 5e
 * @author jeanclaude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '9e40d'
export const dateDeModifImportante = '03/11/2026'

export const refs = {
  'fr-fr': ['can5a-CoopMaths'],
  'fr-ch': [],
}
export default class CourseAuxNombres5e extends Exercice {
  declare sup: string

  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      `Nombres séparés par des tirets :\n1 : Multiplication (facteur 12 à 19)
 2 : Somme à abc + de
 3 : Différence abc - de
 4 : Somme de deux décimaux avec retenue
 5 : Somme astucieuse
 6 : Conversion en heures et minutes
 7 : Triple et moitié
 8 : Produit avec facteur 100
 9 : Division
 10 : Reste de division par diviseur à 2 chiffres
 11 : Priorité opératoire
 12 : Recomposer une nombre avec chevauchement
 13 : conversion heures et minutes vers minutes
 14 :  Reste de la division par 3
 15 :  Une division par 9 qui tombe juste
 16 :  ajouter un nombre de la forme 10n+9
 17 :  quart d'un nombre
 18 :  addition à trou
 19 :  Nombre impair de 2 chiffres multiplier par  5
 20 :  Prix de la moitié
 21 :  Ordre de grandeur
 22 :  Conversion cm ou mm -> m
 23 :  Fraction m/n d'une quantité de L
 24 :  Reste de la division euclidienne
 25 :  Ordre de grandeur : hauteurs
 26 :  Appliquer un pourcentage
 27 :  Calcul de distance à vitesse constante
 28 :  Comparaison de périmètre
 29 :  Repérage fraction
 30 : Proportionnalité par linéarité
 31 : Toutes les questions`,
    ]
    this.nbQuestions = 30
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = '31' // 31 = toutes les questions
  }

  nouvelleVersion() {
    let a = 0
    let b = 0
    let c: number | FractionEtendue = 0
    let d = 0
    let resultat = 0
    let propositions
    const fruits: Array<[string, number, number, number]> = [
      ['pêches', 4, 10, 30],
      ['noix', 5, 4, 13],
      ['cerises', 6, 11, 20],
      ['pommes', 2, 20, 40],
      ['framboises', 15, 1, 5],
      ['fraises', 6, 5, 10],
      ['citrons', 1.5, 15, 30],
      ['bananes', 1.5, 15, 25],
    ]
    const hauteurs: Array<[string, number, number, string]> = [
      ['chaise', 75, 115, 'cm'],
      ['grue', 120, 250, 'dm'],
      ['tour', 50, 180, 'm'],
      ['girafe', 40, 50, 'dm'],
      ['coline', 75, 150, 'm'],
    ]
    const typeQuestionsDisponibles = [
      'q1', // produit d'entiers
      'q2', // somme d'entiers
      'q3', // différence d'entiers
      'q4', // Somme de deux décimaux avec retenue
      'q5', // Somme stratégique d'entiers
      'q6', // conversions horaires
      'q7', // (double, moitié, triple, tiers ...)
      'q8', // produit stratégique
      'q9', // division
      'q10', // division euclidienne
      'q11', // priorités opératoires
      'q12', // différence ab - ce avec e>b
      'q13', // petit problème numérique
      'q14', // produit ab × c
      'q15', // somme des angles
      'q16', // critère de divisibilité
      'q17', // quart
      'q18', // Moitié (aboutir à un décimal)
      'q19', // a/b × c
      'q20', // Proportionnalité simple
      'q21', // pourcentage.
      'q22', // simplification de fraction
      'q23', // produit de décimaux.
      'q24', // quotient comme pourcentage
      'q25', // Grandeurs métriques
      'q26', // Durée
      'q27', // Soustraction/ordre de grandeur
      'q28', // Proportionnalité
      'q29', // quotient d'un entier par un décimal
      'q30', // produit stratégique
    ] // On créé 3 types de questions
    let listeTypeQuestions: string[]
    // Si la saisie contient des numéros spécifiques (pas 31 = toutes les questions),
    // chaque question ne doit apparaître qu'une seule fois.
    const saisie = (this.sup || '').toString()
    const valeurs = saisie
      .split('-')
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v))
    if (valeurs.length >= 1 && valeurs.every((v) => v >= 1 && v <= 30)) {
      // Sélection manuelle : chaque question une seule fois
      listeTypeQuestions = valeurs.map((v) => typeQuestionsDisponibles[v - 1])
      this.nbQuestions = listeTypeQuestions.length
    } else {
      // Toutes les questions (comportement par défaut)
      listeTypeQuestions = combinaisonListesSansChangerOrdre(
        typeQuestionsDisponibles,
        this.nbQuestions,
      )
    }
    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'q1':
          a = randint(12, 19)
          b = randint(2, 5)
          resultat = a * b
          texte = `$${a} \\times ${b}$`
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q2':
          a = randint(2, 50) + 100
          b = randint(50, 99)
          resultat = arrondi(a + b)
          texte = `$${b} + ${a}$`
          texteCorr = `$${b} + ${a}=${miseEnEvidence(a + b)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q3':
          a = randint(2, 50) + 100
          b = randint(50, 99)
          resultat = arrondi(a - b)
          texte = `$${a} - ${b}$`
          texteCorr = `$${a} - ${b}=${miseEnEvidence(a - b)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q4':
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])
          d = randint(1, 9, [a, b, c])
          resultat = arrondi(10 + (b + d) * 0.1 + c * 0.01)
          texte = `$${texNombre(a + b * 0.1 + c * 0.01)}+${texNombre(10 - a + d * 0.1)}$`
          texteCorr = `$${texNombre(a + b * 0.1 + c * 0.01)}+${texNombre(10 - a + d * 0.1)}=${miseEnEvidence(texNombre(10 + (b + d) * 0.1 + c * 0.01))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q5':
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(3, 7) * 10
          d = randint(10, 15) * 10 - c
          resultat = arrondi(2 * (c + d))
          texte = `$${c - a} + ${d + b} + ${c + a} + ${d - b}$`
          texteCorr = `$${c - a} + ${d + b} + ${c + a} + ${d - b} = ${2 * c} + ${2 * d} = ${miseEnEvidence(2 * (c + d))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })

          break
        case 'q6':
          a = randint(2, 4)
          b = randint(10, 59)
          d = arrondi(a * 60 + b)
          texte = `Convertir $${d}$ minutes en heures et minutes :`
          texteCorr = `$${d} = ${a} \\times 60 + ${b}$ donc $${d}$ minutes $=${miseEnEvidence(a)}\\text{ h }${miseEnEvidence(b)}\\text{ min}$.`
          handleAnswers(this, i, { reponse: { value: `${a}h${b}min` } })
          break
        case 'q7':
          a = randint(1, 10) * 2
          texte = `Le triple d'un nombre vaut $${3 * a}$, combien vaut sa moitié ?`
          texteCorr = `Le nombre est $${a}$, sa moitié est $${miseEnEvidence(texNombre(arrondi(a / 2)))}$.`
          handleAnswers(this, i, { reponse: { value: arrondi(a / 2) } })
          break
        case 'q8':
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])
          d = arrondi(a + b * 0.1 + c * 0.01)
          resultat = arrondi(100 * d)
          switch (choice([1, 2, 3, 4])) {
            case 1:
              texte = `$4 \\times ${texNombre(d)}\\times 25$`
              texteCorr = `$4 \\times ${texNombre(d)}\\times 25 = 100 \\times ${texNombre(d)} = ${miseEnEvidence(arrondi(100 * d))}$`
              break
            case 2:
              texte = `$2 \\times ${texNombre(d)}\\times 50$`
              texteCorr = `$2 \\times ${texNombre(d)}\\times 50 = 100 \\times ${texNombre(d)} = ${miseEnEvidence(arrondi(100 * d))}$`
              break
            case 3:
              texte = `$25 \\times ${texNombre(d)}\\times 4$`
              texteCorr = `$25 \\times ${texNombre(d)}\\times 4 = 100 \\times ${texNombre(d)} = ${miseEnEvidence(arrondi(100 * d))}$`
              break
            case 4:
              texte = `$50 \\times ${texNombre(d)}\\times 2$`
              texteCorr = `$50 \\times ${texNombre(d)}\\times 2 = 100 \\times ${texNombre(d)} = ${miseEnEvidence(arrondi(100 * d))}$`
              break
          }
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q9':
          a = randint(5, 15)
          b = randint(2, 8)
          c = a * b
          resultat = a
          texte = `$${c} \\div ${b}$`
          texteCorr = `$${c} \\div ${b}=${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q10':
          a = choice([25, 20, 50, 40])
          b = randint(5, a - 1)
          c = randint(3, 9)
          d = c * a + b
          texte = `Quel est le reste de la division euclidienne de $${d}$ par $${a}$ ?`
          texteCorr = `$${d}=${a} \\times ${c} + ${b}$ avec $${b}<${a}$ donc le reste de la division de $${d}$ par $${a}$ est $${miseEnEvidence(b)}$.`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q11':
          a = randint(5, 9)
          b = 20 - a
          c = randint(3, 9)
          resultat = b + a * c
          texte = `$${b} + ${a} \\times ${c}$`
          texteCorr = `$${b} + ${a} \\times ${c}= ${b} + ${a * c} = ${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q12':
          a = randint(20, 70)
          b = randint(20, 70, a)
          resultat = a * 100 + b * 10
          texte = `$${a}$ centaines et $${b}$ dizaines = ?`
          texteCorr = `$${a} \\times 100 + ${b} \\times 10 = ${miseEnEvidence(texNombre(a * 100 + b * 10))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q13':
          a = randint(2, 4)
          b = randint(10, 59)
          d = arrondi(a * 60 + b)
          texte = `$${a}$ heures et $${b}$ minutes font combien de minutes ?`
          texteCorr = `$${a}~\\text{h}~${b}~\\text{min}=${a} \\times 60 + ${b}= ${d}$ donc $${miseEnEvidence(d)}$ minutes.`
          handleAnswers(this, i, { reponse: { value: d } })
          break
        case 'q14':
          b = randint(1, 9)
          c = randint(0, 9)
          d = randint(0, 9, [b, c])
          a = arrondi(b * 100 + c * 10 + d)
          resultat = a % 3
          texte = `Quel est le reste de la division de $${a}$ par $3$ ?`
          texteCorr = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q15':
          b = randint(5, 9)
          a = b * 90 + 9
          resultat = b * 10 + 1
          texte = `$${a}\\div 9$`
          texteCorr = `$${a}\\div 9 = ${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q16':
          a = randint(5, 9)
          b = randint(2, 8)
          c = randint(1, 3)
          resultat = arrondi(a * 10 + b + c * 10 + 9)
          texte = `$${a * 10 + b} + ${c * 10 + 9}$`
          texteCorr = `$${a * 10 + b} + ${c * 10 + 9}=${a * 10 + b}+${(c + 1) * 10} - 1 = ${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q17':
          a = randint(5, 15)
          b = a * 8
          resultat = a * 2
          texte = `Quel est le quart de $${b}$ ?`
          texteCorr = `Le quart de $${b}$ est $${miseEnEvidence(a * 2)}$.`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q18':
          a = randint(5, 9)
          b = randint(6, 9)
          c = randint(1, 5)
          d = randint(1, 4)
          resultat = d * 10 + b
          texte = `$${c * 10 + a} + \\dots = ${arrondi((c + d) * 10 + b + a)}$`
          texteCorr = `$${arrondi((c + d) * 10 + b + a)} - ${c * 10 + a} = ${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q19':
          a = randint(11, 24) * 2 + 1
          resultat = arrondi(a * 5)
          texte = `$${a}\\times 5$`
          texteCorr = `$${a}\\times 5 = ${a} \\div 2 \\times 10 = ${arrondi(a / 2)}\\times 10 =${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q20':
          a = randint(0, 7)
          b = fruits[a][1]
          c = randint(fruits[a][2], fruits[a][3])
          resultat = arrondi((c / 50) * b)
          texte = `$${texNombre(c / 100)}$ kg de ${fruits[a][0]} coûtent $${texNombre((c / 100) * b)}$ €, combien coûtent $${texNombre(c / 50)}$ kg de ${fruits[a][0]} ?`
          texteCorr = `$${texNombre((c / 100) * b)} \\times 2 = ${miseEnEvidence(texNombre(resultat))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q21':
          a = randint(3, 7)
          b = randint(2, 9)
          c = randint(1, 9)
          d = randint(5, 9) * choice([10, 100])
          resultat = arrondi((a * 100 + b * 10 + c) * d)
          texte = `$${texNombre(a * 100 + b * 10 + c)}\\times ${d}$<br> Choisis la bonne réponse sans effectuer précisément le calcul<br>`
          propositions = shuffle([
            `$${texNombre(resultat)}$`,
            `$${texNombre(d * 1000 + a * 100 + b * 10 + c)}$`,
            `$${texNombre((a * 1000 + b * 100 + c) * d)}$`,
          ])
          texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`
          texteCorr = `$${texNombre(a * 100 + b * 10 + c)} \\times ${d} = ${miseEnEvidence(texNombre(resultat))}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q22':
          a = randint(11, 24) * 10 + randint(0, 9)
          if (choice([true, false])) {
            resultat = arrondi(a / 100)
            texte = `Convertir $${a}\\text{ cm}$ en m.`
            texteCorr = `$${a}\\text{ cm}=\\dfrac{${a}}{100}\\text{ m}=${miseEnEvidence(texNombre(resultat))}\\text{ m}$`
          } else {
            resultat = arrondi(a / 1000)
            texte = `Convertir $${a}\\text{ mm}$ en m.`
            texteCorr = `$${a}\\text{ mm}$ $= ${a} / 1000$m $=${miseEnEvidence(texNombre(resultat))}\\text{ m}$`
          }
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q23':
          a = randint(4, 5)
          c = randint(2, 3)
          resultat = arrondi(randint(2, 9) * 10)
          b = arrondi(resultat * a)

          texte = `$\\dfrac{${c}}{${a}} \\text{ de } ${b} \\text{ L} = \\dots \\text{ L}$`
          texteCorr = `$\\dfrac{${c}}{${a}}$ de $${b}$ L = $${c}\\times \\dfrac{${b}}{${a}}=${c}\\times ${resultat}=${miseEnEvidence(resultat * c)}$ L`
          handleAnswers(this, i, { reponse: { value: resultat * c } })
          break
        case 'q24':
          a = choice([12, 15, 20, 25])
          b = randint(1, a - 1)
          d = randint(5, 9)
          c = d * a + b
          resultat = c % a
          texte = `Je possède $${c}$ bonbons et je fabrique des sacs de $${a}$ bonbons. Une fois mes sacs complétés, combien me restera-t-il de bonbons ?`
          texteCorr = `$${c}=${d}\\times ${a} + ${b}$, donc il me restera $${miseEnEvidence(b)}$ bonbons.`
          handleAnswers(this, i, { reponse: { value: b } })
          break
        case 'q25':
          a = randint(0, 4)
          b = randint(hauteurs[a][1], hauteurs[a][2])
          propositions = shuffle([
            `$${b}\\text{ m}$`,
            `$${b}\\text{ dm}$`,
            `$${b}\\text{ cm}$`,
          ])
          // Conserver les tirages suivants en ajoutant ce choix après le mélange.
          propositions.push(`$${b}\\text{ mm}$`)
          texte = `Choisir parmi les propositions suivantes la hauteur d'une ${hauteurs[a][0]}.<br>`
          texteCorr = `La hauteur d'une ${hauteurs[a][0]} est $${miseEnEvidence(b)}$ ${texteEnCouleurEtGras(hauteurs[a][3])}.`
          {
            const qcm = buildQcmForExercise(this, i, {
              question: texte,
              correction: texteCorr,
              propositions: propositions.map((proposition) => ({
                texte: proposition,
                statut: proposition === `$${b}\\text{ ${hauteurs[a][3]}}$`,
              })),
              options: { ordered: true },
            })
            texte = qcm.question
            texteCorr = qcm.correction
          }
          break
        case 'q26':
          a = randint(2, 9) * 5
          b = randint(2, 9, a) * 10
          resultat = arrondi((a * b) / 100)
          texte = `$${a}\\,\\%$ de $${b}$`
          texteCorr = `$${a}\\,\\%$ de $${b} = ${miseEnEvidence(resultat)}$`
          handleAnswers(this, i, { reponse: { value: resultat } })
          break
        case 'q27':
          a = randint(3, 6) * 15
          b = randint(1, 3)
          resultat = a * b + a / 3
          texte = `Une voiture roule à une vitesse constante de $${a}\\text{ km/h}$. Quelle distance en $\\text{km}$ parcourt-elle en $${b}\\text{ h}$ et $20\\text{ min}$ ?`
          texteCorr = `$${a}\\times \\left(${b}+\\dfrac{20}{60}\\right) = ${a * b} + ${texNombre(a / 3)} = ${miseEnEvidence(texNombre(resultat))}$ ${texteEnCouleurEtGras('km')}`
          {
            const grandeur = new Grandeur(resultat, 'km')
            handleAnswers(this, i, {
              reponse: {
                value: grandeur,
                options: {
                  unite: true,
                  precisionUnite:
                    10 ** (grandeur.puissanceUnite * grandeur.puissancePrefixe),
                },
              },
            })
          }
          break
        case 'q28':
          a = randint(3, 9)
          b = randint(0, 1)
          texte = `Est-il vrai qu'un carré de côté $${a}$ cm a le même périmètre qu'un rectangle de largeur $${a - b}$ cm et de longueur $${a + 1}$ cm ? (V ou F)`
          if (b === 0) {
            texteCorr = `${texteEnCouleurEtGras('F')} (Faux) car $4\\times ${a}\\text{ cm}$ $ \\neq 2\\times ${a}\\text{ cm}$ $ + 2\\times ${a + 1}\\text{ cm}$.`
            handleAnswers(this, i, {
              reponse: {
                value: 'f',
                options: { texteSansCasse: true },
              },
            })
          } else {
            texteCorr = `${texteEnCouleurEtGras('V')} (Vrai) car $4\\times ${a}\\text{ cm}$ $ = 2\\times ${a - 1}\\text{ cm}$ $ + 2\\times ${a + 1}\\text{ cm}$ $ = ${4 * a}\\text{ cm}$.`
            handleAnswers(this, i, {
              reponse: {
                value: 'v',
                options: { texteSansCasse: true },
              },
            })
          }
          break
        case 'q29':
          a = randint(3, 5) // dénominateur
          b = randint(2, a * 4 - 1) // numérateur
          c = new FractionEtendue(b, a)
          resultat = arrondi(b / a)

          texte =
            "Déterminer l'abscisse du point A situé ci-dessous :<br>" +
            mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 14,
                ymax: 1.5,
                scale: 0.5,
              },
              droiteGraduee({
                Unite: 3,
                Min: 0,
                Max: 4.2,
                x: 0,
                y: 0,
                thickSecDist: 1 / a,
                thickSec: true,
                thickOffset: 0,
                axeStyle: '|->',
                pointListe: [[b / a, 'A']],
                pointCouleur: bleuMathalea,
                labelsPrincipaux: true,
                step1: 1,
                step2: 1,
              }),
            )
          texteCorr = `L'abscisse du point A est $${miseEnEvidence(`\\dfrac{${b}}{${a}}`)}$.`
          if (a === 3) {
            handleAnswers(this, i, {
              reponse: {
                value: [
                  c.texFraction,
                  `${Math.floor(a / b)}+\\dfrac{${a % b}}{${b}}`,
                ],
              },
            })
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: [
                  c.texFraction,
                  String(resultat),
                  `${Math.floor(a / b)}+\\dfrac{${a % b}}{${b}}`,
                ],
              },
            })
          }
          break
        case 'q30':
          a = randint(1, 7) // index du fruit
          b = arrondi(
            fruits[a][1] * (1 + choice([-1, 1]) * randint(1, 3) * 0.1),
          ) // prix au kg
          c = Math.round(randint(fruits[a][2], fruits[a][3]) / 10) // nombre de kg première valeur
          d = randint(2, 6) // nombre de kg supplémentaires
          resultat = arrondi(d * b)
          texte = `$${c}$ kg de ${fruits[a][0]} coûtent $${texPrix(c * b)}$ €.<br> $${c + d}$ kg de ces mêmes ${fruits[a][0]} coûtent $${texPrix((c + d) * b)}$ €.<br>Combien coûtent $${d}$ kg de ces ${fruits[a][0]} ?`
          texteCorr = `$${texPrix((c + d) * b)} € - ${texPrix(c * b)} € =${miseEnEvidence(texPrix(resultat))} €$`
          handleAnswers(this, i, {
            reponse: { value: resultat },
          })
          break
      }
      if (listeTypeQuestions[i] === 'q22') {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          {
            texteApres: '$\\text{ m}$',
          },
        )
      } else if (listeTypeQuestions[i] === 'q27') {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur)
      } else if (listeTypeQuestions[i] === 'q29') {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
      } else if (listeTypeQuestions[i] === 'q30') {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          { texteApres: ' €' },
        )
      } else if (listeTypeQuestions[i] !== 'q25') {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      if (this.questionJamaisPosee(i, a, b, c, d, resultat)) {
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
