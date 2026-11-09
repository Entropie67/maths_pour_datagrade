import { miseEnEvidence } from '../../lib/outils/embellissements'
import Figure from 'apigeom/src/Figure'
import { createApigeomFigureHtml } from '../../lib/apigeom/apigeom-figure'
import { bleuMathalea } from '../../lib/colors'
import type { MathfieldElement } from 'mathlive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import type { IExercice } from '../../lib/types'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Décomposer une fraction (partie entière + fraction inférieure à $1$)'
export const interactifReady = true

export const dateDeModifImportante = '16/10/2026' // Vérification personnalisée : toute décomposition égale est acceptée (2 + 2/8, 2 + 25/100…)

/**
 * Amélioration d'un exercice de Rémi Angot
 * @author Guillaume Valmont
 */
export const uuid = '6c8a1'
export const refs = {
  'fr-fr': ['6AutoF1-5', '5N3autoG', 'CM1N2B', 'CM2N2B'],
  'fr-2016': ['6N20'],
  'fr-ch': ['NR'],
}
export default class ExerciceFractionsDecomposer extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.consigne =
      "Écrire sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$."
    this.spacing = 2
    this.spacingCorr = 2
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = '2-3-4-5-6-7-8-9-10-11'
    this.sup2 = '1-2-3'
    this.sup3 = true
    this.besoinFormulaireTexte = [
      'Dénominateurs',
      'Nombres séparés par des tirets :\n(de 2 à 11 par défaut)',
    ]
    this.besoinFormulaire2Texte = [
      'Parties entières',
      'Nombres séparés par des tirets :\n(de 1 à 3 par défaut)',
    ]
    this.besoinFormulaire3CaseACocher = ['Brouillon interactif']
  }

  nouvelleVersion() {
    if (this.sup3 && context.isHtml) {
      const figure = new Figure({
        xMin: -0.5,
        yMin: -2,
        width: 800,
        height: 120,
      })
      figure.options.automaticUserMessage = false
      figure.options.color = bleuMathalea
      figure.create('RectangleFractionDiagram', {
        denominator: 2,
        numberOfRectangles: 5,
      })
      this.introduction = createApigeomFigureHtml(figure, {
        numeroExercice: this.numeroExercice,
      })
    } else {
      this.introduction = ''
    }
    const listeDenominateurs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 2,
      max: 1000,
      defaut: 1000,
      melange: 0,
      shuffle: true,
      nbQuestions: this.nbQuestions,
    }).map((element) => Number(element))
    // `melange: 0` abaisse la borne min à 0 : un dénominateur 1 (ex. `sup=1` dans
    // l'URL) donnerait un entier à décomposer. On le remplace par un tirage libre.
    const listeDenominateursValides = listeDenominateurs.map((element) =>
      element < 2 ? 1000 : element,
    )
    const listePartiesEntieres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 1000,
      defaut: 1000,
      melange: 0,
      shuffle: true,
      nbQuestions: this.nbQuestions,
    }).map((element) => (Number(element) < 1 ? 1000 : Number(element)))
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const denominateur =
        listeDenominateursValides[cpt % this.nbQuestions] === 1000
          ? randint(2, 11)
          : listeDenominateursValides[cpt % this.nbQuestions]
      const partieFractionnaire = randint(1, denominateur - 1)
      const partieEntiere =
        listePartiesEntieres[cpt % this.nbQuestions] === 1000
          ? randint(1, 3)
          : listePartiesEntieres[cpt % this.nbQuestions]
      const total = partieEntiere * denominateur + partieFractionnaire

      const fraction = new FractionEtendue(total, denominateur).toLatex()
      const fractionReste = new FractionEtendue(
        partieFractionnaire,
        denominateur,
      ).toLatex()

      const texte = remplisLesBlancs(
        this,
        i,
        `\\dfrac{${total}}{${denominateur}}~=~%{champ1} + \\dfrac{%{champ2}}{%{champ3}}`,
      )
      const texteCorr = `$${fraction} = ${miseEnEvidence(`${partieEntiere} + ${fractionReste}`)} $`
      this.enregistreReponses(i, {
        partieEntiere,
        partieFractionnaire,
        denominateur,
      })
      if (this.questionJamaisPosee(i, total, denominateur)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  /**
   * Enregistre les réponses attendues pour la question `i`.
   * Les trois champs séparés sont conservés, mais la vérification est
   * personnalisée : on relit les nombres saisis, on reconstitue
   * `partieEntiere + numérateur / dénominateur` et on l'accepte dès qu'elle
   * est égale à la fraction de départ, y compris avec une fraction non
   * simplifiée (`2 + \dfrac{2}{8}`, `2 + \dfrac{25}{100}`…). La fraction doit
   * rester strictement inférieure à 1.
   */
  enregistreReponses(
    i: number,
    {
      partieEntiere,
      partieFractionnaire,
      denominateur,
    }: {
      partieEntiere: number
      partieFractionnaire: number
      denominateur: number
    },
  ): void {
    handleAnswers(
      this,
      i,
      {
        // Valeurs de référence : état par défaut des champs et corrigé non interactif.
        champ1: { value: String(partieEntiere) },
        champ2: { value: String(partieFractionnaire) },
        champ3: { value: String(denominateur) },
        callback: (exercice: IExercice, question: number) => {
          const scoreVide = { nbBonnesReponses: 0, nbReponses: 0 }
          const mfe = document.querySelector(
            `#champTexteEx${exercice.numeroExercice}Q${question}`,
          ) as MathfieldElement | null
          if (mfe == null) {
            return { isOk: false, feedback: '', score: scoreVide }
          }

          // Lit un champ et renvoie l'entier saisi, `null` si vide, `NaN` si
          // la saisie n'est pas un entier.
          const lireEntier = (nom: string): number | null => {
            const brut = (mfe.getPromptValue(nom) ?? '')
              .replaceAll('\\,', '')
              .replaceAll(' ', '')
            if (brut === '') return null
            return /^-?\d+$/.test(brut) ? Number(brut) : Number.NaN
          }

          const entier = lireEntier('champ1')
          const num = lireEntier('champ2')
          const den = lireEntier('champ3')
          const champManquant = entier == null || num == null || den == null

          const e = entier ?? Number.NaN
          const n = num ?? Number.NaN
          const d = den ?? Number.NaN

          const entierOk = Number.isInteger(e) && e === partieEntiere
          const fractionInferieureA1 =
            Number.isInteger(n) &&
            Number.isInteger(d) &&
            d > 0 &&
            n > 0 &&
            n < d
          // Comparaison exacte par produit en croix (fractions égales acceptées).
          const fractionOk =
            fractionInferieureA1 && n * denominateur === partieFractionnaire * d
          const isOk = !champManquant && entierOk && fractionOk

          mfe.setPromptState('champ1', entierOk ? 'correct' : 'incorrect', true)
          mfe.setPromptState(
            'champ2',
            fractionOk ? 'correct' : 'incorrect',
            true,
          )
          mfe.setPromptState(
            'champ3',
            fractionOk ? 'correct' : 'incorrect',
            true,
          )

          let feedback = ''
          if (champManquant) {
            feedback = 'Il faut compléter les trois zones de saisie.'
          } else if (!isOk) {
            if (
              Number.isInteger(n) &&
              Number.isInteger(d) &&
              d > 0 &&
              n > 0 &&
              n >= d
            ) {
              feedback = 'La fraction doit être inférieure à 1.'
            } else {
              feedback =
                "Cette décomposition n'est pas égale à la fraction proposée."
            }
          }

          const spanReponseLigne = document.querySelector(
            `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
          )
          if (spanReponseLigne != null) {
            spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
          }

          return {
            isOk,
            feedback,
            score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
          }
        },
      },
      { formatInteractif: 'fillInTheBlank' },
    )
  }
}
