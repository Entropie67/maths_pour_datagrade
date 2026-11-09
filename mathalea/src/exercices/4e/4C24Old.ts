import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Simplifier des fractions à l'aide des nombres premiers"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '17/03/2022'
export const dateDeModifImportante = '03/10/2023'

/**
 * @author Guillaume Valmont (amendée par Éric Elter pour this.sup2 et une version 3e)

 */
export const uuid = '612b9'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class SimplifierFractionsOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire3Numerique = [
      'Type de réponses AMC',
      2,
      '1 : Question ouverte\n2 : Réponse numérique',
    ]

    this.consigne = 'Simplifier le plus possible les fractions suivantes.'
    this.nbQuestions = 5

    // this.besoinFormulaireNumerique = ['Nombre de facteurs communs', 3, '1, 2 ou 3']
    this.besoinFormulaireTexte = [
      'Nombre maximum de facteurs communs',
      'Nombres séparés par des tirets.\n1 : 1 facteur\n2 : 2 facteurs\n3 : 3 facteurs\n4 : 4 facteurs\n 5 : Mélange',
    ]

    // this.besoinFormulaire2Numerique = ['Facteurs premiers utilisés', 2, '1 : De 2 à 7\n2 : De 2 à 23']
    this.besoinFormulaire2Texte = [
      'Choix des facteurs premiers utilisés',
      'Nombres séparés par des tirets.\nChoisir valeur(s) entre 2 et 23.',
    ]
    this.sup = 2
    this.sup2 = '2-3-5-7'
    this.sup3 = 2
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne = 'Simplifier le plus possible la fraction suivante.'
    }
    const listeFacteursPremiers = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 2,
      max: 23,
      defaut: 11,
      melange: 24,
      nbQuestions: this.nbQuestions,
      exclus: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22],
    }).map(Number)
    const nbFacteursCommuns = gestionnaireFormulaireTexte({
      melange: 5,
      saisie: this.sup,
      max: 4,
      defaut: 4,
      nbQuestions: 1,
    }).map(Number)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      /* let facteurCommun1 = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19]) : choice([2, 3, 5])
      let facteurCommun2 = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19]) : choice([2, 3, 5])
      let facteurCommun3 = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19]) : choice([2, 3, 5])
      let facteurSurprise = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19, 23]) : choice([2, 3, 5, 7])
      let facteurNumerateur = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19, 23]) : choice([2, 3, 5, 7])
      let facteurDenominateur = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19, 23]) : choice([2, 3, 5, 7]) */
      let facteurCommun1 = choice(listeFacteursPremiers)
      let facteurCommun2 = choice(listeFacteursPremiers)
      let facteurCommun3 = choice(listeFacteursPremiers)
      const facteurSurprise = choice(listeFacteursPremiers)
      const facteurDenominateur = choice(listeFacteursPremiers)
      const facteurNumerateur = choice(listeFacteursPremiers)
      let numerateur, denominateur
      if (nbFacteursCommuns[0] - 1 < 3) facteurCommun3 = 1
      if (nbFacteursCommuns[0] - 1 < 2) facteurCommun2 = 1
      if (nbFacteursCommuns[0] - 1 < 1) facteurCommun1 = 1
      numerateur =
        facteurNumerateur * facteurCommun1 * facteurCommun2 * facteurCommun3
      denominateur =
        facteurDenominateur * facteurCommun1 * facteurCommun2 * facteurCommun3
      if (numerateur === denominateur) numerateur = numerateur * facteurCommun1
      /* while (numerateur === denominateur) {
        facteurNumerateur = this.sup2 !== 1 ? choice([2, 3, 5, 11, 13, 17, 19, 23]) : choice([2, 3, 5, 7])
        numerateur = facteurNumerateur * facteurCommun1 * facteurCommun2 * facteurCommun3
      } */
      const surprise = choice(['numerateur', 'denominateur', 'aucun'])
      switch (surprise) {
        case 'numerateur':
          if (numerateur * facteurSurprise !== denominateur)
            numerateur = numerateur * facteurSurprise
          break
        case 'denominateur':
          if (denominateur * facteurSurprise !== numerateur)
            denominateur = denominateur * facteurSurprise
          break
      }
      const f = new FractionEtendue(numerateur, denominateur)
      texte = `$${f.texFraction}$${ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        { texteAvant: ' =' },
      )}`
      texteCorr = `$${f.texFraction}${f.texSimplificationAvecEtapes(true, orangeMathalea)}$`
      handleAnswers(this, i, {
        reponse: {
          value: f.simplifie().toLatex(),
          options: { fractionIrreductible: true },
        },
      })

      if (context.isAmc) {
        if (this.sup3 === 1) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce:
                      'Rendre irréductible la fraction ' +
                      texte +
                      '.<br>La rédaction sera évaluée plus que le résultat en lui-même.',
                    texte: texteCorr,
                    statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                    pointilles: false, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: 'Rendre irréductible la fraction ' + texte + '.',
                      valeur: f.simplifie(),
                      param: {
                        digits: 4,
                        decimals: 2,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      }
      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
