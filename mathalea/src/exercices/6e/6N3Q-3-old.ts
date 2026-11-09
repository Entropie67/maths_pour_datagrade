import { lampeMessage } from '../../lib/format/message'
import { texPrix } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = "Augmenter ou diminuer d'un pourcentage"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '23/07/2021'
export const dateDeModifImportante = '16/04/2023'

/**
 *
 * augmenter ou diminuer un prix d'un pourcentage,
 * le calcul intermédiaire du montant de l'augmentation ou de la baisse est demandé
 * Quatre niveaux :
 * - 1 valeurs entières et 10%, 20%...;
 * - 2 Comme le 1 mais avec 25% et 75% en plus ;
 * - 3 valeurs entières et 13%, 28%...;
 * - 4 valeurs décimale comme 13,5%...;
 * @author Laurence CANDILLE (Rajout de 25% et 50% par Éric Elter)
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '064ce'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

function nombreDecimales(prMin: number, prMax: number, n: number) {
  let pourcent = 0
  let cpt = 0
  if (n === 0) {
    do {
      cpt++
      pourcent = randint(0, Math.floor(prMax / 10)) * 10
    } while (cpt < 1000 && (pourcent < prMin || pourcent > prMax))
  } else if (n === 1) {
    do {
      cpt++
      pourcent = choice([10, 20, 25, 30, 50, 60, 70, 75])
    } while (cpt < 1000 && (pourcent < prMin || pourcent > prMax))
  } else if (n === 2) {
    do {
      cpt++
      pourcent = randint(1, 9) + randint(0, Math.floor(prMax / 10)) * 10
    } while (cpt < 1000 && (pourcent < prMin || pourcent > prMax))
  } else {
    do {
      cpt++
      pourcent =
        (randint(1, 9) * 10 + randint(1, 9)) / 10 +
        randint(0, Math.floor(prMax / 10)) * 10
    } while (cpt < 1000 && (pourcent < prMin || pourcent > prMax))
  }
  return pourcent
}
const situationsAugmentations = [
  {
    quoi: "Le loyer de l'appartement de",
    quoiReponse: 'son loyer',
    verbe: 'il augmente',
    moitieMin: 250,
    moitieMax: 500,
    prMin: 2,
    prMax: 15,
  },
  {
    quoi: "L'abonnement à la salle de sport de",
    quoiReponse: 'son abonnement',
    verbe: 'il augmente',
    moitieMin: 15,
    moitieMax: 40,
    prMin: 2,
    prMax: 10,
  },
  {
    quoi: 'Les frais de scolarité de',
    quoiReponse: 'ses frais de scolarité',
    verbe: 'ils augmentent',
    moitieMin: 200,
    moitieMax: 400,
    prMin: 5,
    prMax: 20,
  },
  {
    quoi: 'Les frais de transport annuels de',
    quoiReponse: 'ses frais de transport',
    verbe: 'ils augmentent',
    moitieMin: 500,
    moitieMax: 800,
    prMin: 5,
    prMax: 15,
  },
]
const situationsReductions = [
  {
    quoi: "Un billet d'avion",
    quoiReponse: "son billet d'avion",
    moitieMin: 50,
    moitieMax: 100,
    prMin: 10,
    prMax: 60,
  },
  {
    quoi: 'Un pantalon',
    quoiReponse: 'son pantalon',
    moitieMin: 25,
    moitieMax: 40,
    prMin: 10,
    prMax: 70,
  },
  {
    quoi: 'Un billet de cinéma',
    quoiReponse: 'son billet de cinéma',
    moitieMin: 3,
    moitieMax: 6,
    prMin: 20,
    prMax: 50,
  },
  {
    quoi: 'Un gâteau au chocolat',
    quoiReponse: 'son gâteau au chocolat',
    moitieMin: 15,
    moitieMax: 25,
    prMin: 10,
    prMax: 40,
  },
]
export default class AugmenterEtReduireDunPourcentage extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Valeurs entières et 10%, 20%...\n2 : Valeurs entières et 10%, 20%... mais aussi 25% et 50%\n3 : Valeurs entières et 4%, 23%...\n4 : Une décimale comme 34,5%',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec indication de la calculatrice (en interactif)',
    ]

    this.nbQuestions = 2

    this.sup = 1 // Niveau de difficulté
    this.sup2 = 2
  }

  nouvelleVersion() {
    this.introduction =
      this.sup2 && this.interactif && context.isHtml
        ? lampeMessage({
            titre: 'Calculatrice autorisée.',
            texte:
              'Écrire les réponses dans les cases sans arrondir, ne pas préciser "€" ni "euros" ...',
            couleur: 'nombres',
          })
        : ''
    const typeQuestionsDisponibles = ['augmentation', 'réduction'] // On créé 2 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Boucle principale où i+1 correspond au numéro de la question
      const prenom1 = prenomM()
      const prenom2 = prenomF()
      let prixIntial, prixFinal
      let propositionsAMC: unknown[] = []
      let texte = ''
      let enonceInit = ''
      let enonceAMC = ''
      let texteCorr = ''
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'réduction':
          {
            const situation = choice(situationsReductions)
            const pourcent = nombreDecimales(
              situation.prMin,
              situation.prMax,
              this.sup - 1,
            )
            prixIntial = 2 * randint(situation.moitieMin, situation.moitieMax)
            const montantReduction = (pourcent * prixIntial) / 100
            prixFinal = prixIntial - montantReduction
            texte = `${situation.quoi} coûte $${prixIntial}$${sp(1)}€. ${prenom1} bénéficie d'une réduction de $${texNombre(pourcent, 1)}${sp(1)}\\%$.`
            enonceInit = texte
            enonceAMC =
              this.interactif && context.isHtml
                ? `${numAlpha(0)} Le montant de la réduction est :`
                : `${numAlpha(0)} Calculer le montant de la réduction.`
            texte = enonceInit + '<br>' + enonceAMC
            texte += ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €.',
              },
            )
            texte += '<br>'
            if (!context.isAmc && this.interactif) {
              handleAnswers(this, 2 * i, {
                reponse: { value: texPrix(montantReduction) },
              })
            } else {
              propositionsAMC = [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte: enonceInit + '<br>' + enonceAMC,
                        valeur: [arrondi(montantReduction)],
                        param: {
                          digits: 5,
                          decimals: 2,
                          signe: false,
                          approx: 0,
                          exposantNbChiffres: 0,
                        },
                      },
                    },
                  ],
                },
              ]
            }
            enonceAMC =
              this.interactif && context.isHtml
                ? `${numAlpha(1)} Finalement, ${prenom1} paiera ${situation.quoiReponse} :`
                : `${numAlpha(1)} Calculer le prix de ${situation.quoiReponse}.`
            texte += enonceAMC
            texte +=
              this.interactif && context.isHtml
                ? ajouteChampTexteMathLive(
                    this,
                    2 * i + 1,
                    KeyboardType.clavierNumbers,
                    {
                      texteApres: ' €.',
                    },
                  )
                : ''
            if (!context.isAmc) {
              handleAnswers(this, 2 * i + 1, {
                reponse: { value: texPrix(prixFinal) },
              })
            } else {
              propositionsAMC.push({
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    reponse: {
                      texte: enonceAMC,
                      valeur: [arrondi(prixFinal)],
                      param: {
                        digits: 5,
                        decimals: 2,
                        signe: false,
                        approx: 0,
                        exposantNbChiffres: 0,
                      },
                    },
                  },
                ],
              })
            }
            texteCorr = `${numAlpha(0)} Le montant de la réduction est : $${prixIntial}${sp()}€ \\times ${texNombre(pourcent, 1)} \\div 100${egalOuApprox(montantReduction, 2)}`
            texteCorr +=
              miseEnEvidence(`${texPrix(montantReduction)}${sp()}`) + '€$. <br>'
            texteCorr += `${numAlpha(1)} Finalement, ${prenom1} paiera ${situation.quoiReponse} : $${prixIntial}${sp()}€-${texPrix(montantReduction)}${sp()}€=`
            texteCorr += miseEnEvidence(`${texPrix(prixFinal)}${sp()}`) + '€$.'
          }
          break
        case 'augmentation':
        default:
          {
            const situation = choice(situationsAugmentations)
            const pourcent = nombreDecimales(
              situation.prMin,
              situation.prMax,
              this.sup - 1,
            )
            prixIntial = 2 * randint(situation.moitieMin, situation.moitieMax)
            const montantAugmentation = (pourcent * prixIntial) / 100
            prixFinal = prixIntial + montantAugmentation

            enonceInit = `${situation.quoi} ${prenom2} coûte $${prixIntial}$${sp()}€. Au 1er janvier, ${situation.verbe} de $${texNombre(pourcent, 1)}${sp()}\\%$.`
            enonceAMC =
              this.interactif && context.isHtml
                ? `${numAlpha(0)} Le montant de l'augmentation est :`
                : `${numAlpha(0)} Calculer le montant de l'augmentation.`
            texte = enonceInit + '<br>' + enonceAMC
            texte += ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €.',
              },
            )
            texte += '<br>'
            if (!context.isAmc) {
              handleAnswers(this, 2 * i, {
                reponse: { value: texPrix(montantAugmentation) },
              })
            } else {
              propositionsAMC = [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte: enonceInit + '<br>' + enonceAMC,
                        valeur: [montantAugmentation],
                        param: {
                          digits: 5,
                          decimals: 2,
                          signe: false,
                          approx: 0,
                          exposantNbChiffres: 0,
                        },
                      },
                    },
                  ],
                },
              ]
            }
            enonceAMC =
              this.interactif && context.isHtml
                ? `${numAlpha(1)} Au 1er janvier, ${prenom2} paiera ${situation.quoiReponse} :`
                : `${numAlpha(1)} Calculer le montant au 1er janvier de ${situation.quoiReponse}.`
            texte += enonceAMC
            texte +=
              this.interactif && context.isHtml
                ? ajouteChampTexteMathLive(
                    this,
                    2 * i + 1,
                    KeyboardType.clavierNumbers,
                    {
                      texteApres: ' €.',
                    },
                  )
                : ''
            if (!context.isAmc) {
              handleAnswers(this, 2 * i + 1, {
                reponse: { value: texPrix(prixFinal) },
              })
            } else {
              propositionsAMC.push({
                type: 'AMCNum',
                propositions: [
                  {
                    texte: texteCorr,
                    reponse: {
                      texte: enonceAMC,
                      valeur: [arrondi(prixFinal)],
                      param: {
                        digits: 5,
                        decimals: 2,
                        signe: false,
                        approx: 0,
                        exposantNbChiffres: 0,
                      },
                    },
                  },
                ],
              })
            }
            texteCorr = `${numAlpha(0)} Le montant de l'augmentation est :     $${prixIntial}${sp()}€ \\times ${texNombre(pourcent, 1)} \\div 100${egalOuApprox(montantAugmentation, 2)}`
            texteCorr +=
              miseEnEvidence(`${texPrix(montantAugmentation)}${sp()}`) +
              '€$.<br>'
            texteCorr += `${numAlpha(1)} Finalement, ${prenom2} paiera ${situation.quoiReponse} : $${prixIntial}${sp()}€+${texPrix(montantAugmentation)}${sp()}€ =`
            texteCorr += miseEnEvidence(`${texPrix(prixFinal)}${sp()}`) + '€$.'
          }
          break
      }

      if (this.questionJamaisPosee(i, prixIntial, prixFinal)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            options: { multicols: true, barreseparation: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
            // @ts-expect-error this.autoCorrection[i] est bien défini
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
