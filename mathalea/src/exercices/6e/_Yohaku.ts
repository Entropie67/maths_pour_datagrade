import type { MathfieldElement } from 'mathlive'
import { generateCleaner } from '../../lib/interactif/cleaners'
import ce from '../../lib/interactif/comparisonFunctions'
import { Yohaku } from '../../lib/outils/Yohaku'
import { saveAnswersFromTable } from '../../lib/saveAnswers'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { amcConvert } from '../../lib/amc/amcBuilders'


export const titre = 'Générer un Yohaku'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

export const uuid = '3a377'

export const refs = {
  'fr-fr': ['Yohaku'],
  'fr-ch': [],
}
export const dateDeModifImportante = '16/12/2023'
/**
 * @author Jean-claude Lhote
 * @constructor
 */
export default class FabriqueAYohaku extends Exercice {
  type:
    | 'entiers'
    | 'littéraux'
    | 'expressions'
    | 'fractions'
    | 'entiers relatifs'
    | 'fractions dénominateurs multiples'
    | 'fractions positives dénominateurs premiers'

  yohaku: Yohaku[]
  constructor() {
    super()
    this.exoCustomResultat = true
    this.nbQuestions = 3
    this.sup = 30
    this.sup2 = 1
    this.sup3 = 3
    this.sup4 = false
    this.type = 'entiers'
    this.yohaku = []
    this.besoinFormulaireNumerique = ['Valeur maximale des données', 999]
    this.besoinFormulaire2Numerique = [
      'Opération',
      2,
      '1 : Addition\n2 : Multiplication',
    ]
    this.besoinFormulaire3Numerique = [
      'Taille de la grille (nombre de cases horizontales)',
      5,
    ]
    this.besoinFormulaire4CaseACocher = ['Avec aide', false]
  }

  nouvelleVersion() {
    const type = this.type
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      const donnees: string[] = []
      const taille = contraindreValeur(2, 5, this.sup3, 3)
      const valeurMax = contraindreValeur(taille ** 2 + 1, 999, this.sup, 30)
      const operateur = this.sup2 === 1 ? 'addition' : 'multiplication'
      const Case = this.sup4 ? randint(0, taille ** 2 - 1) : undefined
      const largeur =
        this.type === 'littéraux' ? (operateur === 'addition' ? 4 : 5) : 2
      const yohaku = new Yohaku({
        type,
        taille,
        largeur,
        operation: operateur,
        cellules: donnees,
        Case,
        valeurMax,
      })
      yohaku.calculeResultats()
      const mot =
        type === 'littéraux'
          ? 'expressions'
          : type.includes('frac')
            ? 'fractions'
            : 'nombres'
      this.introduction =
        operateur === 'addition'
          ? `Trouver les ${mot} à mettre dans les cases vides pour que les sommes de chaque ligne et chaque colonne soient exactes  (plusieurs solutions possibles).`
          : `Trouver les ${mot} à mettre dans les cases vides pour que les produits de chaque ligne et chaque colonne soient exacts (plusieurs solutions possibles).`
      texte = yohaku.representation({
        numeroExercice: this.numeroExercice ?? 0,
        question: i,
        isInteractif: this.interactif,
        classes: '',
      })
      texteCorr =
        Case == null
          ? "La grille ci-dessous n'est donnée qu'à titre d'exemple, il y a d'autres solutions.<br><br>"
          : ''
      yohaku.solution = true
      texteCorr += yohaku.representation({
        numeroExercice: this.numeroExercice ?? 0,
        question: i,
        isInteractif: false,
      })

      this.yohaku[i] = yohaku
      if (this.questionJamaisPosee(i, ...yohaku.cellules)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: this.introduction + texte,
            propositions: [
              {
                texte: '',
                statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
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
    const taille = parseInt(this.sup3)
    let cell
    const spanResultat: HTMLSpanElement[][] = []
    const saisies = []
    const spanFeedback = document.querySelector(
      `span#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLSpanElement
    saveAnswersFromTable(this, i, 2, this.sup3)
    for (let l = 0; l < taille; l++) {
      spanResultat[l] = []
      for (let c = 0; c < taille; c++) {
        cell = document.getElementById(
          `champTexteEx${this.numeroExercice}Q${i}L${l + 1}C${c + 1}`,
        ) as MathfieldElement
        if (cell != null) {
          spanResultat[l][c] = document.querySelector(
            `span#resultatCheckEx${this.numeroExercice}Q${i}L${l + 1}C${c + 1}`,
          ) as HTMLSpanElement
          if (this.yohaku[i].type === 'littéraux') {
            // on ne parse pas si c'est du littéral. On blinde pour les champs vide.
            if (cell.value != null)
              saisies[l * taille + c] = cleaner(cell.value) ?? '0'
          } else {
            if (cell.value != null)
              saisies[l * taille + c] = cleaner(cell.value) ?? '0'
            // on peut taper des entiers dans les Yohaku fraction, mais ils doivent être modifiés en fraction pour le calcul
            if (
              !isNaN(Number(saisies[l * taille + c])) &&
              this.yohaku[i].type.includes('frac')
            ) {
              saisies[l * taille + c] =
                `\\frac{${cleaner(saisies[l * taille + c])}}{1}`
            }
          }
        } else if (cell == null && l * taille + c !== this.yohaku[i].Case) {
          window.notify(
            `Pas de cellule L${l + 1}C${c + 1} dans le document`,
            {},
          )
        } else {
          if (this.yohaku[i].Case != null) {
            saisies[l * taille + c] = cleaner(
              this.yohaku[i].cellules[this.yohaku[i].Case],
            )
          }
        }
      }
    }
    const resultats = this.saisieCoherente(saisies, taille, i)
    let resultat = 'OK'
    let feedback = ''
    for (const [data, value] of Object.entries(resultats)) {
      feedback += `${data.replace('Colonne', 'Colonne ').replace('Ligne', 'Ligne ')} ${value ? 'correcte' : 'incorrecte'}.<br>`
      resultat = value ? resultat : 'KO'
    }

    if (resultat === 'OK' && !saisies.includes('')) {
      for (let l = 0; l < taille; l++) {
        for (let c = 0; c < taille; c++) {
          if (spanResultat[l][c] != null) {
            spanResultat[l][c].innerHTML = '😎'
          }
        }
      }
    } else {
      for (let l = 0; l < taille; l++) {
        for (let c = 0; c < taille; c++) {
          if (spanResultat[l][c] != null) {
            spanResultat[l][c].innerHTML = '☹️'
          }
        }
      }
      resultat = 'KO'
    }
    if (spanFeedback != null) {
      spanFeedback.innerHTML = feedback
      spanFeedback.style.display = 'block'
    }

    return [
      resultats.Ligne1 ? 'OK' : 'KO',
      resultats.Ligne2 ? 'OK' : 'KO',
      resultats.Colonne1 ? 'OK' : 'KO',
      resultats.Colonne2 ? 'OK' : 'KO',
    ]
  }

  saisieCoherente(
    saisies: string[],
    taille: number,
    question: number,
  ): Record<string, string> {
    const test = function (yohaku: Yohaku[], i: number, valeurs: string[]) {
      let resultatOK
      const resultVal = ce.parse(String(yohaku[question].operate(valeurs)))
      const resultatAttendu = ce.parse(yohaku[question].resultats[i])
      if (yohaku[question].type === 'littéraux') {
        resultatOK = resultVal.isSame(resultatAttendu)
      } else {
        resultatOK = resultVal.isEqual(resultatAttendu)
      }
      return resultatOK
    }
    let result = {}
    for (let i = 0; i < taille; i++) {
      const valeurs = []
      for (let j = 0; j < taille; j++) {
        valeurs.push(saisies[i + j * taille] ?? '0')
      }
      result = Object.assign(
        result,
        Object.fromEntries([
          [`Colonne${i + 1}`, test(this.yohaku, i, valeurs)],
        ]),
      )
    }
    for (let i = taille; i < taille * 2; i++) {
      const valeurs = []
      for (let j = 0; j < taille; j++) {
        valeurs.push(saisies[(i - taille) * taille + j] ?? '0')
      }
      result = Object.assign(
        result,
        Object.fromEntries([
          [`Ligne${i - taille + 1}`, test(this.yohaku, i, valeurs)],
        ]),
      )
    }
    return result
  }
}
