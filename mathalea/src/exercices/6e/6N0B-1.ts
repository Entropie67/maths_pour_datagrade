import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { numAlpha } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import choisirExpressionNumerique from '../5e/_choisirExpressionNumerique'
import Exercice from '../Exercice'

export const titre = 'Traduire des phrases en calculs et réciproquement'
export const dateDeModifImportante = '31/10/2026' // Ajout de l'interactivité par Jean-claude Lhote
export const interactifReady = true

/**
 * Mettre en relation un calcul, une traduction en français, une expression, un résultat, pour les décliner dans différents exercices.
 * Exercice sur le vocabulaire : somme,différence, produit, quotient...
 * @author Jean-claude Lhote
 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'ed0ea'

export const refs = {
  'fr-fr': ['6N0B-1'],
  'fr-2016': ['6C13'],
  'fr-ch': ['9R1NO8A-2', '9R2NO8A-2', '9R3NO8A-2', 'PRQST02A-3'],
}
export default class VocabulaireEtOperations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Phrase -> Calcul\n2 : Calcul -> Phrase\n3 : Phrase -> Calcul + résultat\n4 : Mélange',
    ]
    this.besoinFormulaire3Texte = [
      'Opérations',
      '1 : Somme\n2 : Différence\n3 : Produit\n4 : Quotient\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Décimaux', false]
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 4
    this.sup2 = false
    this.sup3 = '5'
    this.spacing = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    let decimal
    let expf, expn, expc, resultats
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    const sousCas = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
    }).map((el) => Number(el) - 1)
    const unSeulTypeDeQuestion = new Set(listeTypeDeQuestions).size === 1
    this.consigne = ''
    if (unSeulTypeDeQuestion) {
      switch (listeTypeDeQuestions[0]) {
        case 1:
          this.consigne = this.interactif
            ? 'Choisir le bon calcul correspondant à chaque phrase.'
            : "Traduire chaque phrase par un calcul sans l'effectuer."
          break
        case 2:
          this.consigne = this.interactif
            ? 'Choisir la bonne phrase correspondant à chaque calcul.'
            : 'Traduire chaque calcul par une phrase en français.'
          break
        case 3:
          this.consigne = 'Donner le résultat de chaque expression.'
          break
      }
    }
    if (this.sup2) decimal = 10 ** randint(1, 2)
    else decimal = 1

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte: string = ''
      let texteCorr: string = ''
      resultats = choisirExpressionNumerique(1, decimal, true, true, sousCas[i])
      expf = resultats[0]
      expn = resultats[1]
      expc = resultats[2]
      const lesNombres = String(expn).match(/(\d+{*,*}*\d*)/g)
      const [nb1, nb2] = lesNombres != null ? lesNombres : [NaN, NaN] // parce qu'il faut bien mettre quelque chose
      const operationPresente = String(expn).match(/(\+|-|\\div|\\times)/g)
      const operation =
        operationPresente != null ? operationPresente[0] : 'undefined'
      const resultString = String(expc).split('= ')[1]
      const resultat = resultString.replace('$', '') // pour enlever le $
      const laBonneParole = String(expf).match(/([a-zA-Zéè]+)/g)
      const motCle =
        laBonneParole != null && laBonneParole[1] != null
          ? laBonneParole[1]
          : 'undefined' // Pour traquer les erreurs
      const phrases = [
        'La somme de § et de £',
        'La différence entre § et £',
        'Le produit de § par £',
        'Le quotient de § par £',
      ].map((el) => el.replace('§', `$${nb1}$`).replace('£', `$${nb2}$`))
      const calculs = ['$§+£$', '$§-£$', '$§\\times £$', '$§\\div £$'].map(
        (el) => el.replace('§', String(nb1)).replace('£', String(nb2)),
      )
      texte = ''
      texteCorr = ''
      let propsQcm
      let monQcm
      switch (listeTypeDeQuestions[i]) {
        case 1: // proposer le calcul
          texte +=
            numAlpha(i) +
            (unSeulTypeDeQuestion
              ? ''
              : this.interactif
                ? 'Choisir le bon calcul pour calculer '
                : "Traduire la phrase par un calcul (il n'est pas demandé d'effectuer ce calcul) : ")
          expf = 'l' + String(expf).substring(1)
          texte += `${expf}.`
          expf = 'L' + String(expf).substring(1)
          texteCorr +=
            numAlpha(i) + `${expf} s'écrit ${texteEnCouleurEtGras(expn)}.`
          propsQcm = {
            enonce: texte,
            propositions: [
              {
                texte: calculs[0],
                statut: calculs[0].includes(operation),
              },
              {
                texte: calculs[1],
                statut: calculs[1].includes(operation),
              },
              {
                texte: calculs[2],
                statut: calculs[2].includes(operation),
              },
              {
                texte: calculs[3],
                statut: calculs[3].includes(operation),
              },
            ],
            options: {
              ordered: false,
            },
          }
          this.autoCorrection[i] = propsQcm
          monQcm = propositionsQcm(this, i)
          texte += this.interactif ? monQcm.texte : ''
          break
        case 2: // proposer une expression en français
          if (String(expn).indexOf('ou') > 0) {
            expn = String(expn).substring(0, String(expn).indexOf('ou'))
          } // on supprime la deuxième expression fractionnaire
          texte +=
            numAlpha(i) +
            (unSeulTypeDeQuestion
              ? ''
              : this.interactif
                ? 'Choisir la bonne expression pour traduire '
                : 'Traduire le calcul par une phrase en français : ')
          texte += `${expn}.`
          expf = 'l' + String(expf).substring(1)
          texteCorr +=
            numAlpha(i) + `${expn} est ${texteEnCouleurEtGras(expf)}.`
          propsQcm = {
            enonce: texte,
            propositions: [
              {
                texte: phrases[0],
                statut: phrases[0].includes(motCle),
              },
              {
                texte: phrases[1],
                statut: phrases[1].includes(motCle),
              },
              {
                texte: phrases[2],
                statut: phrases[2].includes(motCle),
              },
              {
                texte: phrases[3],
                statut: phrases[3].includes(motCle),
              },
            ],
            options: {
              ordered: false,
            },
          }
          this.autoCorrection[i] = propsQcm
          monQcm = propositionsQcm(this, i)
          texte += this.interactif ? monQcm.texte : ''
          break
        case 3: // proposer un résultat
          texte +=
            numAlpha(i) +
            (unSeulTypeDeQuestion
              ? ''
              : this.interactif
                ? 'Donner le résultat de : '
                : 'Traduire la phrase par un calcul et effectuer ce calcul : ')
          expf = 'l' + String(expf).substring(1)
          texte += `${expf}.`
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: resultat } })
          }
          expf = 'L' + String(expf).substring(1)
          // Le champ attend le résultat : seul le résultat est mis en évidence
          texteCorr += numAlpha(i) + `${expf} s'écrit ${expn}.<br>`
          texteCorr += `${String(expc).split('= ')[0]}= ${miseEnEvidence(resultat)}$`
          break
      }
      // texte += this.nbQuestions - 1 === i ? '<br>' : ''
      if (this.questionJamaisPosee(i, expn)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
