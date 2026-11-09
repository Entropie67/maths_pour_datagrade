import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { sameIntervalCondition, seq } from '../../lib/interactif/checks'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Écrire un intervalle réel sous forme d'ensemble et vice-versa"
export const dateDePublication = '30/08/2024'
export const dateDeModifImportante = '06/10/2026'
export const interactifReady = true

/**
 * Écrire un intervalle réel sous forme d\'ensemble et vice-versa
 * @author Nathan Scheinmann
 */

export const uuid = '67469'
export const refs = {
  'fr-fr': ['2N12-3'],
  'fr-ch': ['1mEI-1'],
}

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'types',
      label: 'Types de questions',
      items: [
        {
          nom: 'ensembleVersIntervalle',
          label: 'Ensemble {x ∈ ℝ | …} → intervalle',
          poids: 1,
        },
        {
          nom: 'intervalleVersEnsemble',
          label: 'Intervalle → ensemble {x ∈ ℝ | …}',
          poids: 1,
        },
        {
          nom: 'inegaliteVersIntervalle',
          label: 'Inégalité → intervalle',
          poids: 0,
        },
        {
          nom: 'intervalleVersInegalite',
          label: 'Intervalle → inégalité',
          poids: 0,
        },
      ],
    },
  ],
}

type TypeQuestion =
  | 'ensembleVersIntervalle'
  | 'intervalleVersEnsemble'
  | 'inegaliteVersIntervalle'
  | 'intervalleVersInegalite'

export default class nomExercice extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    // Anciens liens : s=1 (ensemble → intervalle), s=2 (intervalle → ensemble) ou s=3 (mélange)
    const ancienFormat = /^[123]$/.test(String(this.sup))
    if (ancienFormat) {
      const poids = { 1: '1-0-0-0', 2: '0-1-0-0', 3: '1-1-0-0' }[
        Number(this.sup) as 1 | 2 | 3
      ]
      this.sup = poids
    }
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const poids = Object.fromEntries(
      params.liste('types').map((item) => [item.nom, item.poids]),
    ) as Record<TypeQuestion, number>

    let listeTypeDeQuestions: TypeQuestion[]
    // Sans inégalités et à poids égaux, on garde l'ancien tirage pour que les
    // liens déjà partagés donnent toujours les mêmes questions.
    const tirageHistorique =
      poids.inegaliteVersIntervalle === 0 &&
      poids.intervalleVersInegalite === 0 &&
      (poids.ensembleVersIntervalle === 0 ||
        poids.intervalleVersEnsemble === 0 ||
        poids.ensembleVersIntervalle === poids.intervalleVersEnsemble)
    if (tirageHistorique) {
      let typeQuestionsDisponibles: TypeQuestion[]
      if (poids.intervalleVersEnsemble === 0) {
        typeQuestionsDisponibles = ['ensembleVersIntervalle']
      } else if (poids.ensembleVersIntervalle === 0) {
        typeQuestionsDisponibles = ['intervalleVersEnsemble']
      } else {
        typeQuestionsDisponibles = shuffle([
          'ensembleVersIntervalle',
          'intervalleVersEnsemble',
          'ensembleVersIntervalle',
          'intervalleVersEnsemble',
        ])
      }
      listeTypeDeQuestions = combinaisonListes(
        typeQuestionsDisponibles,
        this.nbQuestions,
      )
    } else {
      listeTypeDeQuestions = params.repartition(
        'types',
        this.nbQuestions,
      ) as TypeQuestion[]
    }
    const clavier = `${KeyboardType.clavierEnsemble} ${KeyboardType.clavierCompare}`
    // Assez de place pour écrire une inégalité ou un encadrement
    const pointilles = '\\ldots'.repeat(6)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let champ = ''
      let texteCorr = ''
      let borneInf: number | string
      let borneSup: number | string
      borneInf = randint(-100, 90)
      borneSup = randint(borneInf + 1, 100)
      let semiOuvertGauche = false
      let semiOuvertDroite = false
      const r1 = randint(0, 3)
      const r2 = randint(0, 3)
      if (r1 === 0) {
        semiOuvertGauche = true
        borneInf = '-\\infty'
      } else if (r1 === 1) {
        semiOuvertGauche = true
      }
      if (r2 === 0) {
        semiOuvertDroite = true
        borneSup = '+\\infty'
      } else if (r2 === 1) {
        semiOuvertDroite = true
      }
      const estR = borneInf === '-\\infty' && borneSup === '+\\infty'
      const typeQuestion = listeTypeDeQuestions[i]
      const forme =
        typeQuestion === 'inegaliteVersIntervalle' ||
        typeQuestion === 'intervalleVersInegalite'
          ? 'inegalite'
          : 'ensemble'
      // ℝ ne s'écrit pas avec des inégalités
      if (forme === 'inegalite' && estR) {
        cpt++
        continue
      }
      let intervalle: string
      if (context.isHtml) {
        intervalle = `${semiOuvertGauche ? ']' : '['}${borneInf}; ${borneSup}${semiOuvertDroite ? '[' : ']'}`
      } else {
        intervalle = '\\interval'
        if (semiOuvertDroite && semiOuvertGauche) {
          intervalle += '[open]'
        } else if (semiOuvertDroite) {
          intervalle += '[open right]'
        } else if (semiOuvertGauche) {
          intervalle += '[open left]'
        }
        intervalle += `{${borneInf}}{${borneSup}} `
      }
      const symboleGauche = semiOuvertGauche ? '<' : '\\leqslant'
      const symboleDroite = semiOuvertDroite ? '<' : '\\leqslant'
      let condition = `${borneInf} ${symboleGauche} x ${symboleDroite} ${borneSup}`
      if (borneInf === '-\\infty') {
        condition = `x ${symboleDroite} ${borneSup}`
      } else if (borneSup === '+\\infty') {
        condition = `${borneInf} ${symboleGauche} x`
      }
      const ensemble = estR
        ? '\\mathbb{R}'
        : `\\{ x \\in \\mathbb{R} \\mid ${condition} \\}`
      const lettre = lettreDepuisChiffre(i + 1)
      switch (typeQuestion) {
        case 'intervalleVersEnsemble':
        case 'intervalleVersInegalite': {
          if (forme === 'inegalite') {
            texte = `Soit $${lettre}=${intervalle}$. Déterminer l'inégalité correspondant à $x \\in ${lettre}$.`
            texteCorr = `$x \\in ${lettre} \\iff ${miseEnEvidence(condition)}$`
            champ = remplisLesBlancs(
              this,
              i,
              `x \\in ${lettre} \\iff %{champ1}`,
              clavier,
              pointilles,
            )
            handleAnswers(
              this,
              i,
              {
                champ1: {
                  value: condition,
                  compare: seq([sameIntervalCondition()]),
                },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          } else if (estR) {
            texte = `Écrire l'intervalle $${lettre}=${intervalle}$ sous forme d'un ensemble.`
            texteCorr = `$${lettre}=${miseEnEvidence(ensemble)}$`
            champ = remplisLesBlancs(this, i, `${lettre}=%{champ1}`, clavier)
            handleAnswers(
              this,
              i,
              { champ1: { value: ensemble, options: { intervalle: true } } },
              { formatInteractif: 'fillInTheBlank' },
            )
          } else {
            texte = `Écrire l'intervalle $${lettre}=${intervalle}$ sous forme d'un ensemble.`
            texteCorr = `$${lettre}=\\{ x \\in \\mathbb{R} \\mid ${miseEnEvidence(condition)} \\}$`
            champ = remplisLesBlancs(
              this,
              i,
              `${lettre}=\\{ x \\in \\mathbb{R} \\mid %{champ1} \\}`,
              clavier,
              pointilles,
            )
            handleAnswers(
              this,
              i,
              {
                champ1: {
                  value: condition,
                  compare: seq([sameIntervalCondition()]),
                },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
        }
        default: {
          texte =
            forme === 'inegalite'
              ? `Déterminer l'intervalle $${lettre}$ de $\\mathbb{R}$ correspondant à l'inégalité $${condition}$.`
              : `Écrire l'ensemble $${lettre}=${ensemble}$ sous forme d'un intervalle.`
          texteCorr = `$${lettre}=${miseEnEvidence(intervalle)}$`
          champ = remplisLesBlancs(this, i, `${lettre}=%{champ1}`, clavier)
          handleAnswers(
            this,
            i,
            { champ1: { value: intervalle, options: { intervalle: true } } },
            { formatInteractif: 'fillInTheBlank' },
          )
          break
        }
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = champ === '' ? texte : `${texte}<br>${champ}`
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
