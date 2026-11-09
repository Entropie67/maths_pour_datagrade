import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { all, isEqual, isPrimeFactorization } from '../../lib/interactif/checks'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  cribleEratostheneN,
  obtenirListeFacteursPremiers,
  premiersEntreBornes,
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const titre = 'Décomposer un entier en produit de facteurs premiers'
export const dateDeModifImportante = '23/10/2026'
/**
 * Décomposer un nombre en facteurs premiers et compter son nombre de diviseurs à partir d'un tableau
 * plusieurs type de nombres à décomposer
 * type 1 : 3 à 5 facteurs premiers max, multiplicités 0,1,2 ou 3 max à préciser
 * type 2 : un produit de deux premiers entre 30 et 100, multiplicité 1 ... suffisamment de possibilités?
 * type 3 : un grand nombre premier au delà de 1000 et inférieur à 2 000
 * @author Sébastien Lozano (Rajout par EE du this.sup2 et de l'AMC)
 */
export const uuid = '32f33'

export const refs = {
  'fr-fr': ['3A10-3'],
  'fr-ch': ['1mCN-2', '10CTNO1A-15', '9R2NO1G-5', '9R3NO1G-5', 'PRQNO09B-1', 'PRQNO09C-1'],
}
export default class DecompositionFacteursPremiers extends Exercice {
  constructor() {
    super()

    // pas de différence entre la version html et la version latex pour la consigne
    // mais une différence selon que l'exo est affiché en interactif ou non

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 3
    // this.correctionDetailleeDisponible = true;

    this.besoinFormulaire2Texte = [
      'Choix des décompositions',
      'Nombres séparés par des tirets :\n1 : 3 à 5 petits facteurs premiers max\n2 : 2 facteurs premiers entre 30 et 100\n3 : Un seul grand nombre premier\n4 : Mélange',
    ]
    this.sup2 = 4
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.sup3 = 2
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    let typesDeQuestions

    // Rajout EE modifié par JCL
    const listeDesProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    // Fin du rajout EE

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      typesDeQuestions = listeDesProblemes[i]
      let nombre = 0
      let reponse = ''
      let texte = ''
      let texteCorr = ''
      let correctionDejaMiseEnEvidence = false

      switch (typesDeQuestions) {
        case 1: // 3 à 5 facteurs premiers max compris entre 0 et 30, de multiplicité 1,2 ou 3 max
          {
            // on fixe le nombre de facteurs premier entre 3 et 5
            const nbDePremiers = randint(3, 5)
            // on fixe la limite pour le choix des premiers
            const maxPremier = 11
            // on fixe le rang max pour le choix des premiers
            const rgMax = cribleEratostheneN(maxPremier).length - 1
            // on choisit les rangs pour les nombres premiers
            const tabRangs: number[] = []
            const tabRangsExclus = []
            for (let k = 0; k < nbDePremiers; k++) {
              for (let m = 0; m < k; m++) {
                if (tabRangs.length > 0) {
                  tabRangsExclus.push(tabRangs[m])
                }
              }
              tabRangs[k] = randint(0, rgMax, tabRangsExclus)
            }

            // on choisit les premiers
            const tabPremiers = []
            for (let k = 0; k < tabRangs.length; k++) {
              tabPremiers[k] = cribleEratostheneN(maxPremier)[tabRangs[k]]
            }

            // on range les facteurs premiers dans l'ordre croissant
            tabPremiers.sort(function (a, b) {
              return a - b
            })
            // on choisit les multiplicités
            const tabMultiplicites = []
            for (let k = 0; k < tabRangs.length; k++) {
              tabMultiplicites[k] = randint(1, 2)
            }

            texte = 'Décomposer '
            let nombreTodecompose = 1
            for (let k = 0; k < tabRangs.length; k++) {
              for (let m = 0; m < tabMultiplicites[k]; m++) {
                nombreTodecompose = nombreTodecompose * tabPremiers[k]
              }
            }

            texte += `$${texNombre(nombreTodecompose)}$ en produit de facteurs premiers.`
            // correction : calcul par étapes, seule la dernière ligne est un produit de facteurs premiers
            texteCorr = texCalculDecomposition(nombreTodecompose)
            correctionDejaMiseEnEvidence = true
            reponse = texFactorisation(nombreTodecompose)
            texteCorr += '.'
            nombre = nombreTodecompose
          }
          break
        case 2: // deux premiers compris entre 30 et 100 de multiplicité 1
          {
            // on choisit un rang différent pour chaque premier entre 30 et 100
            const r1 = randint(0, premiersEntreBornes(30, 100).length - 1)
            const r2 = randint(0, premiersEntreBornes(30, 100).length - 1, r1)
            let premier1 = premiersEntreBornes(30, 100)[r1]
            let premier2 = premiersEntreBornes(30, 100)[r2]
            if (premier1 > premier2) {
              // on inverse p1 et p2 si p1 est supérieur à p2
              const p = premier1
              premier1 = premier2
              premier2 = p
            }

            texte = `Décomposer $${texNombre(premier1 * premier2)}$ en produit de facteurs premiers.`
            const racinePrem = Math.trunc(Math.sqrt(premier1 * premier2))
            texteCorr = `Il est suffisant de tester la divisibilité de $${texNombre(premier1 * premier2)}$ par tous les nombres premiers inférieurs ou égaux à $\\sqrt{${texNombre(premier1 * premier2)}}$, c'est-à-dire inférieurs à $${texNombre(racinePrem)}$.<br>`
            texteCorr += 'Ce sont les nombres de la liste suivante : <br>$'
            texteCorr += cribleEratostheneN(racinePrem)[0]
            for (let k = 1; k < cribleEratostheneN(racinePrem).length; k++) {
              texteCorr += '; ' + cribleEratostheneN(racinePrem)[k]
            }

            texteCorr += '.$<br>'
            const listeFacteursPremiers = obtenirListeFacteursPremiers(
              premier1 * premier2,
            )
            let quotientIntermediaire = premier1 * premier2
            for (let k = 0; k < listeFacteursPremiers.length; k++) {
              texteCorr += `$${texNombre(quotientIntermediaire)}\\div${miseEnEvidence(listeFacteursPremiers[k])} = ${texNombre(quotientIntermediaire / listeFacteursPremiers[k])}$<br>`
              quotientIntermediaire =
                quotientIntermediaire / listeFacteursPremiers[k]
            }

            texteCorr += ` D'où $${texNombre(premier1 * premier2)} = ${texNombre(premier1)}\\times${texNombre(premier2)}$.`
            reponse = `${premier1}\\times${premier2}`
            nombre = premier1 * premier2
          }
          break
        case 3: // un gros premier entre 1000 et 2000
          {
            // on choisit un rang pour le nombre premier entre 1000 et 2000
            const r = randint(0, premiersEntreBornes(1000, 2000).length - 1)
            const premier = premiersEntreBornes(1000, 2000)[r]
            const racinePremier = Math.trunc(Math.sqrt(premier))
            texte = `Décomposer $${texNombre(premier)}$ en produit de facteurs premiers.`
            texteCorr = `Il est suffisant de tester la divisibilité de $${texNombre(premier)}$ par tous les nombres premiers inférieurs ou égaux à $\\sqrt{${texNombre(premier)}}$, c'est-à-dire inférieurs à $${racinePremier}$.<br>`
            texteCorr += 'Ce sont les nombres de la liste $'
            texteCorr += cribleEratostheneN(racinePremier)[0]
            for (let k = 1; k < cribleEratostheneN(racinePremier).length; k++) {
              texteCorr += '; ' + cribleEratostheneN(racinePremier)[k]
            }

            texteCorr += '$, '
            texteCorr += `on se rend compte que $${texNombre(premier)}$ n'est divisible par aucun de ces nombres et donc est un nombre premier.<br>Aucune décomposition en produit de nombres premiers n'est possible et donc `
            texteCorr += `$${texNombre(premier)} = ${texNombre(premier)}$.`

            reponse = `${premier}`
            nombre = premier
          }
          break
      }
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: all([isEqual(), isPrimeFactorization()]),
        },
      })
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: `${texNombre(nombre)} =`,
        style: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
        bareme: baremeMultiLignes(this.sup3),
        produitSeulement: true,
        valeurDeDepart: texNombre(nombre),
      })
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          propositions: [{ statut: 3, sanscadre: false, pointilles: false }],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, reponse)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        if (!correctionDejaMiseEnEvidence) {
          const textCorrSplit = texteCorr.split('=')
          let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
          aRemplacer = aRemplacer.replace('$', '')
          aRemplacer = aRemplacer.replace('.', '')

          texteCorr = ''
          for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
            texteCorr += textCorrSplit[ee] + '='
          }
          texteCorr += `$ $${miseEnEvidence(aRemplacer)}$` + '.' // Gestion du point final
          // Fin de cette uniformisation
        }

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireCaseACocher = ['Afficher la liste des nombres premiers inférieurs à 100']
  // this.besoinFormulaire2Texte = ['Choix des problèmes', 'Nombres séparés par des tirets :\n1 : Trouver une échelle\n2 : Trouver une distance réelle\n3 : Trouver une longueur sur le plan\n4 : Mélange']
}
