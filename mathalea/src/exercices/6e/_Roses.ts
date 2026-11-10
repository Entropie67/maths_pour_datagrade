import type { Expression } from '@cortex-js/compute-engine'
import type { MathfieldElement } from 'mathlive'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { generateCleaner } from '../../lib/interactif/cleaners'
import ce from '../../lib/interactif/comparisonFunctions'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { lettreMinusculeDepuisChiffre, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { Rose } from './_Rose'
import { amcConvert } from '../../lib/amc/amcBuilders'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
/**
 * @author Jean-claude Lhote
 */
export default class ExoRose extends Exercice {
  operation: string
  type: string
  typeDonnees: string
  nombreDeValeurs: number
  valeurMax: number
  roses: Rose[]
  clavier?: string
  indexInconnue: number[]

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Valeur maximale (entre 10 et 30) des facteurs',
      30,
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de facteur entre 3 et 9 (limité à 5 pour les valeurs fractionnaires ou littérales)',
      9,
    ]
    this.besoinFormulaire3Numerique = [
      'Type de questions',
      4,
      '1 : Calculer les produits\n2 : Calculer les facteurs\n3 : Course aux nombres 1\n4 : Course aux nombres 2',
    ]

    this.spacing = 2

    this.nbQuestions = 1
    this.sup = 10
    this.sup2 = 4
    this.sup3 = 1
    this.operation = 'multiplication'
    this.type = 'résultats'
    this.typeDonnees = 'entiers'
    this.nombreDeValeurs = 4
    this.valeurMax = 10
    this.roses = []
    this.clavier = KeyboardType.clavierDeBase

    this.indexInconnue = []
  }

  nouvelleVersion() {
    this.valeurMax = contraindreValeur(10, 30, this.sup, 10)
    this.nombreDeValeurs = contraindreValeur(3, 9, this.sup2, 5)
    this.sup3 = contraindreValeur(1, 4, this.sup3, 1)
    switch (this.sup3) {
      case 1:
        this.type = 'résultats'
        if (
          this.typeDonnees.substring(0, 4) === 'frac' ||
          this.typeDonnees === 'litteraux'
        ) {
          if (this.nombreDeValeurs > 5) this.nombreDeValeurs = 5
        }
        break
      case 2:
        this.type = 'valeurs'
        break
      case 3:
        if (
          this.typeDonnees.substring(0, 4) === 'frac' ||
          this.typeDonnees === 'litteraux'
        ) {
          if (this.nombreDeValeurs > 5) this.nombreDeValeurs = 5
        }
        this.type = 'can1'
        break
      case 4:
        this.type = 'can2'
        if (
          this.typeDonnees.substring(0, 4) === 'frac' ||
          this.typeDonnees === 'litteraux'
        ) {
          if (this.nombreDeValeurs > 5) this.nombreDeValeurs = 5
        }
        break
    }

    if (this.typeDonnees === 'litteraux') {
      this.clavier = KeyboardType.clavierDeBaseAvecVariable
    } else if (this.typeDonnees.includes('frac')) {
      this.clavier = KeyboardType.clavierDeBaseAvecFraction
    } else {
      this.clavier = KeyboardType.clavierDeBase
    }

    for (
      let i = 0, objets, objetsCorr, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.indexInconnue[i] = randint(0, this.nombreDeValeurs - 1)
      if (this.operation === 'multiplication') {
        this.introduction =
          "Les nombres situés à l'extrémité des flèches sont les produits des nombres dont les flèches sont issues."
      } else {
        this.introduction =
          "Les nombres situés à l'extrémité des flèches sont les sommes des nombres dont les flèches sont issues."
      }
      switch (this.type) {
        case 'résultats':
          if (this.operation === 'multiplication') {
            texte = "Calculer les produits à l'extrémité des flèches.<br>"
          } else {
            texte = "Calculer les sommes à l'extrémité des flèches.<br>"
          }
          break
        case 'valeurs':
          if (this.operation === 'multiplication') {
            texte = "Retrouver les facteurs à l'origine des flèches.<br>"
          } else {
            texte = "Retrouver les termes à l'origine des flèches.<br>"
          }
          break
        case 'can1':
          if (this.typeDonnees.includes('entiers')) {
            texte = `Trouver le nombre de la case ${lettreMinusculeDepuisChiffre(this.indexInconnue[i] + 1)}.<br>`
          } else {
            texte = `Trouver l'expression de la case ${lettreMinusculeDepuisChiffre(this.indexInconnue[i] + 1)}.<br>`
          }
          break
        case 'can2':
        default:
          if (this.typeDonnees.includes('entiers')) {
            texte = `Trouver le nombre de la case ${lettreMinusculeDepuisChiffre(this.indexInconnue[i] + 1)}.<br>`
          } else {
            texte = `Trouver l'expression de la case ${lettreMinusculeDepuisChiffre(this.indexInconnue[i] + 1)}.<br>`
          }
          break
      }

      this.roses[i] = new Rose({
        nombreDeValeurs: this.nombreDeValeurs,
        type: this.type,
        operation: this.operation,
        valeurMax: this.valeurMax,
        typeDonnees: this.typeDonnees,
        indexInconnue: this.indexInconnue[i],
      })
      objets = this.roses[i].representation()
      this.roses[i].type = 'solutions'
      objetsCorr = this.roses[i].representation()
      texte += mathalea2d(
        Object.assign({ scale: 0.6 }, fixeBordures(objets)),
        objets,
      )
      if (this.interactif) {
        if (this.type.substring(0, 3) === 'can') {
          texte += ajouteChampTexteMathLive(this, i, this.clavier, {
            texteAvant: `${lettreMinusculeDepuisChiffre(this.indexInconnue[i] + 1)}=`,
          })
        } else {
          let question = ''
          for (let k = 0; k < this.nombreDeValeurs; k++) {
            question += `${lettreMinusculeDepuisChiffre(k + 1)}=%{champ${k + 1}}${sp(3)}`
          }
          texte += remplisLesBlancs(this, i, question, this.clavier, '\\ldots')
        }
      }
      texteCorr = mathalea2d(
        Object.assign({ scale: 0.6 }, fixeBordures(objetsCorr)),
        objetsCorr,
      )
      if (this.questionJamaisPosee(i, ...this.roses[i].values)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: this.introduction + '<br>' + texte,
            propositions: [
              {
                texte: '',
                statut:
                  this.type === 'can1' || this.type === 'can2'
                    ? 1
                    : Math.ceil(this.sup2 / 4), // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                // pointilles: false // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    const cleaner = generateCleaner(['virgules', 'fractions', 'espaces'])
    if (this.answers === undefined) {
      this.answers = {}
    }
    const taille = this.nombreDeValeurs
    const champsTexte = []
    const spanResultat = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLSpanElement
    const saisies = []
    if (this.type.substring(0, 3) === 'can') {
      champsTexte[0] = document.getElementById(
        `champTexteEx${this.numeroExercice}Q${i}`,
      ) as MathfieldElement
      if (champsTexte[0]) {
        this.answers[champsTexte[0].id] = champsTexte[0].value
      }
      if (champsTexte[0] != null) {
        saisies[0] = cleaner(champsTexte[0].value)
      }
    } else {
      const mfe = document.querySelector(
        `math-field#champTexteEx${this.numeroExercice}Q${i}`,
      ) as MathfieldElement
      if (mfe) {
        this.answers[mfe.id] = mfe.value
      }
      for (let k = 0; k < taille; k++) {
        champsTexte[k] = mfe.getPromptValue(`champ${k + 1}`)
        saisies[k] = cleaner(champsTexte[k])
      }
    }
    let resultat
    if (
      saisies.some((s) => s === '') ||
      !this.saisieCoherente(saisies, taille, i)
    ) {
      spanResultat.innerHTML = '☹️'
      resultat = 'KO'
    } else {
      spanResultat.innerHTML = '😎'
      resultat = 'OK'
    }
    return resultat
  }

  saisieCoherente(saisies: string[], taille: number, question: number) {
    let resultatOK = true
    let stringSaisie = saisies[0]
    let stringResultat
    if (this.type === 'can2') {
      stringResultat =
        this.roses[question].typeDonnees.substring(0, 4) === 'frac'
          ? this.roses[question].resultats[
              this.indexInconnue[question]
            ].replace('dfrac', 'frac')
          : this.roses[question].resultats[
              this.indexInconnue[question]
            ].toString()
      const resultParsed = ce.parse(stringResultat)
      return resultParsed === null
        ? false
        : (resultParsed as Expression).isSame(ce.parse(stringSaisie))
    } else if (this.type === 'can1') {
      stringSaisie = saisies[0]
      stringResultat =
        this.roses[question].typeDonnees.substring(0, 4) === 'frac'
          ? (
              this.roses[question].values[
                this.indexInconnue[question]
              ] as FractionEtendue
            )
              .toLatex()
              .replace('dfrac', 'frac')
          : this.roses[question].values[this.indexInconnue[question]].toString()
      return ce.parse(stringSaisie).isSame(ce.parse(stringResultat))
    } else {
      for (let i = 0; i < taille; i++) {
        stringSaisie = saisies[i]
        if (this.type === 'résultats') {
          stringResultat =
            this.roses[question].typeDonnees.substring(0, 4) === 'frac'
              ? this.roses[question].resultats[i].replace('dfrac', 'frac')
              : String(this.roses[question].resultats[i])
        } else {
          stringResultat =
            this.roses[question].typeDonnees.substring(0, 4) === 'frac'
              ? this.roses[question].resultats[i].replace('dfrac', 'frac')
              : String(this.roses[question].resultats[i])
          stringSaisie =
            this.roses[question].typeDonnees.substring(0, 4) === 'frac'
              ? `${saisies[i]}${this.roses[question].operation === 'addition' ? '+' : '\\times '}${saisies[(i + 1) % this.nombreDeValeurs]}`
              : this.roses[question].operate(
                  saisies[i],
                  saisies[(i + 1) % this.nombreDeValeurs],
                )
        }
        const saisieParsed = ce.parse(stringSaisie.replace('dfrac', 'frac'))

        resultatOK = Boolean(
          resultatOK &&
          (saisieParsed == null
            ? false
            : saisieParsed.isEqual(
                ce.parse(stringResultat) ?? ce.parse('NaN'),
              )),
        )
      }
      return resultatOK
    }
  }
}
