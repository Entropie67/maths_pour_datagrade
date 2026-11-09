import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { pgcd } from '../../lib/outils/primalite'
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
export const dateDeModifImportante = '08/09/2026'

/**
 * @author Guillaume Valmont (amendée par Éric Elter pour this.sup2 et une version 3e)

 */
export const uuid = '554bf'

export const refs = {
  'fr-fr': ['4C24', '3AutoN03-1'],
  'fr-ch': ['9R1NO4D-8', '9R2NO4D-8', '9R3NO4D-8', 'PRQNO10B-8'],
}

// Compte le nombre total de facteurs premiers d'un entier, AVEC multiplicité
// (ex: 12 = 2 x 2 x 3 -> 3 facteurs, pas 2). C'est ce nombre qui correspond
// au nombre de facteurs réellement barrés lors de la simplification.
const nombreDeFacteursPremiersAvecMultiplicite = (n: number): number => {
  let reste = Math.abs(n)
  let compteur = 0
  for (let p = 2; p * p <= reste; p++) {
    while (reste % p === 0) {
      compteur++
      reste = reste / p
    }
  }
  if (reste > 1) compteur++
  return compteur
}

export default class SimplifierFractions extends Exercice {
  constructor() {
    super()

    this.consigne = 'Simplifier le plus possible les fractions suivantes.'
    this.nbQuestions = 5

    this.besoinFormulaireTexte = [
      'Nombre maximum de facteurs communs',
      'Nombres séparés par des tirets.\n1 : 1 facteur\n2 : 2 facteurs\n3 : 3 facteurs\n4 : 4 facteurs\n 5 : Mélange',
    ]
    this.sup = '1-2'

    this.besoinFormulaire2Texte = [
      'Choix des facteurs premiers utilisés',
      'Nombres séparés par des tirets.\nChoisir valeur(s) entre 2 et 23.',
    ]
    this.sup2 = '2-3-5-7'

    this.besoinFormulaire3Numerique = [
      'Type de réponses AMC',
      2,
      '1 : Question ouverte\n2 : Réponse numérique',
    ]
    this.sup3 = 2
    // this.nbCols = 2
    // this.nbColsCorr = 2
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
      nbQuestions: Math.max(this.nbQuestions, 10),
      exclus: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22],
    }).map(Number)
    const nbFacteursCommuns = gestionnaireFormulaireTexte({
      melange: 5,
      saisie: this.sup,
      max: 4,
      defaut: 4,
      nbQuestions: Math.max(this.nbQuestions, 10),
    }).map(Number)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let facteurCommun1 = choice(listeFacteursPremiers)
      let facteurCommun2 = choice(listeFacteursPremiers)
      let facteurCommun3 = choice(listeFacteursPremiers)
      let facteurCommun4 = choice(listeFacteursPremiers)
      const facteurSurprise = choice(listeFacteursPremiers)
      const facteurDenominateur = choice(listeFacteursPremiers)
      const facteurNumerateur = choice(listeFacteursPremiers)
      let numerateur, denominateur
      if (nbFacteursCommuns[i] < 4) facteurCommun4 = 1
      if (nbFacteursCommuns[i] < 3) facteurCommun3 = 1
      if (nbFacteursCommuns[i] < 2) facteurCommun2 = 1
      if (nbFacteursCommuns[i] < 1) facteurCommun1 = 1
      numerateur =
        facteurNumerateur *
        facteurCommun1 *
        facteurCommun2 *
        facteurCommun3 *
        facteurCommun4
      denominateur =
        facteurDenominateur *
        facteurCommun1 *
        facteurCommun2 *
        facteurCommun3 *
        facteurCommun4
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
      // Avec un seul facteur premier disponible (saisie « 2 », par exemple), la
      // construction ci-dessus donne toujours un facteur commun de trop et la
      // fraction serait rejetée à chaque essai. On écrit donc directement une
      // puissance de ce facteur sur une autre.
      if (new Set(listeFacteursPremiers).size === 1) {
        const facteurUnique = listeFacteursPremiers[0]
        const partieCommune = facteurUnique ** nbFacteursCommuns[i]
        const partieAvecSurplus =
          partieCommune * facteurUnique ** choice([1, 2])
        const numerateurPlusGrand = choice([true, false])
        numerateur = numerateurPlusGrand ? partieAvecSurplus : partieCommune
        denominateur = numerateurPlusGrand ? partieCommune : partieAvecSurplus
      }
      // Sécurité : facteurNumerateur, facteurDenominateur et facteurSurprise sont tirés
      // indépendamment des facteurCommun et peuvent coïncider par hasard, ce qui crée des
      // facteurs communs non prévus. On vérifie donc le nombre RÉEL de facteurs premiers
      // communs entre numérateur et dénominateur, et on rejette la fraction si ça ne
      // correspond pas exactement à ce qui a été demandé.
      if (
        nombreDeFacteursPremiersAvecMultiplicite(
          pgcd(numerateur, denominateur),
        ) !== nbFacteursCommuns[i]
      ) {
        cpt++
        continue
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
