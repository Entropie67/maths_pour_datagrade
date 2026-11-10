/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/unit/6N5-2.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, enleveElementNo } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  arrondi,
  range,
  rangeMinMax,
  troncature,
} from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  estentier,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes de prix avec des aliments mettant en jeu diverses opérations'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

// Gestion de la date de publication initiale
export const dateDePublication = '02/11/2021'

/**
 *
 * À partir d'une masse, proposer différentes questions qui permettent de répondre, selon les questions,
 * soit de tête (*10), soit après un calcul posé (multiplication, addition ou soustraction),
 * soit après un calcul avec calculatrice (division)
 * Chacune de ces questions indépendantes trouve de l'intérêt par le choix de l'opération à effectuer
 * et donc à donner du sens à chacune des opérations.
 * @author Éric Elter
 */

export const uuid = '4e2b2'

export const refs = {
  'fr-fr': ['6N5-2', 'BP2CCF4', '5N1D-5'],
  'fr-2016': ['6C12-1', 'BP2CCF4'],
  'fr-ch': ['9R1NO7G-7', '9R2NO7G-7', '9R3NO7G-7', 'PRQPF04A-9', '9R1NO7E-3', '9R2NO7E-3', '9R3NO7E-3', 'PRQST02B-9', 'PRQNO15A-3'],
}
export default class QuestionsMasses extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Multiplication du prix par 10 ou 100\n2 : Multiplication du prix par un entier entre 3 et 9\n3 : Somme du prix avec un autre prix\n4 : Différence du prix avec un autre prix\n5 : Prix de la somme de deux quantités différentes du même article\n6 : Prix de la différence de deux quantités différentes du même article\n7 : Division du prix par 10\n8 : Division du prix par un entier entre 3 et 9\n9 : Toutes les questions',
    ]
    this.besoinFormulaire2CaseACocher = ['Ordre aléatoire des questions']
    this.besoinFormulaire3CaseACocher = ['Prix unitaire entier']
    this.besoinFormulaire4Numerique = [
      'Choix AMC',
      3,
      '1 : Des cases à cocher pour noter chaque question\n2 : Un texte libre de réponses pour chaque question\n3 : Les deux en même temps',
    ]
    this.consigne = 'Répondre aux questions suivantes.' // Consigne modifiée, plus bas, à l'intérieur de la fonction
    this.nbQuestions = 1
    this.sup = 9
    this.sup2 = false
    this.sup3 = false
    this.sup4 = 3
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let donnees = []
      const typesQuestionsDisponibles = gestionnaireFormulaireTexte({
        max: 8,
        defaut: 9,
        nbQuestions: 0,
        melange: 9,
        saisie: this.sup,
        shuffle: this.sup2,
        enleveDoublons: true,
      }).map(Number)

      const nbCas = typesQuestionsDisponibles.length
      const Chiffres = range(9, [0])
      const TabPrixUnitaire: number[] = []
      const TabAutrePrix: number[] = []
      for (let kk = 0; kk < 3; kk++) {
        TabPrixUnitaire[kk] = choice(Chiffres, TabPrixUnitaire)
        TabAutrePrix[kk] = choice(Chiffres, TabAutrePrix)
      }

      this.consigne =
        typesQuestionsDisponibles.length === 1 && this.nbQuestions === 1
          ? 'Répondre à la question suivante.'
          : 'Répondre aux questions suivantes.'
      let PrixUnitaire
      let AutrePrix
      let PrixReduction
      if (this.sup3) {
        PrixUnitaire = choice(rangeMinMax(2, 9))
        AutrePrix = arrondi(10 * TabAutrePrix[0] + TabAutrePrix[1], 0)
        PrixReduction = arrondi(
          choice(rangeMinMax(1, arrondi(PrixUnitaire / 2, 0)), [0]),
        )
      } else {
        PrixUnitaire = arrondi(
          TabPrixUnitaire[0] +
            0.1 * TabPrixUnitaire[1] +
            0.01 * TabPrixUnitaire[2],
        )
        AutrePrix = arrondi(
          10 * choice([1, 2]) +
            TabAutrePrix[0] +
            0.1 * TabAutrePrix[1] +
            0.01 * TabAutrePrix[2],
        )
        PrixReduction = arrondi(
          choice(rangeMinMax(50, arrondi(50 * PrixUnitaire, 0))) / 100,
          2,
        )
      }
      donnees = [PrixUnitaire, AutrePrix, PrixReduction]

      const quidame = prenomF()
      const FamilleH = [
        'père',
        'frère',
        'cousin',
        'grand-père',
        'oncle',
        'voisin',
      ]
      const Personnage1 = choice(FamilleH)
      const FamilleF = [
        'mère',
        'sœur',
        'cousine',
        'grand-mère',
        'tante',
        'voisine',
      ]
      const Personnage2 = choice(FamilleF)
      const Objets = [
        'pommes',
        'cerises',
        'prunes',
        'fraises',
        'haricots',
        'pommes de terre',
        'tomates',
        'pêches',
        'nectarines',
        'mangues',
        'carottes',
        'cacahuètes fraîches',
      ]
      const NumArticle = choice(range(11))
      const ArticlePluriel = Objets[NumArticle]
      const NbArticles = choice(rangeMinMax(3, 9))
      const NbArticles2 = choice(rangeMinMax(3, 9), [NbArticles])
      const NbArticles3 =
        choice(rangeMinMax(11, 19), [
          NbArticles + NbArticles2,
          NbArticles2 + NbArticles2,
        ]) - NbArticles2
      const NbArticles4 = choice(rangeMinMax(3, 9), [
        NbArticles,
        NbArticles2,
        NbArticles3,
      ])
      const NbArticles5 =
        choice(rangeMinMax(2, 9), [
          NbArticles,
          NbArticles2,
          NbArticles3,
          NbArticles4,
          NbArticles + NbArticles4,
          NbArticles2 + NbArticles4,
          NbArticles3 + NbArticles4,
          NbArticles4 + NbArticles4,
        ]) + NbArticles4
      const DixOuCent = choice([10, 100])
      const Nbpartage = choice(rangeMinMax(2, 8))
      const propositionsAMC = [] // Ce tableau contiendra tous les propositions d'AMC hybride
      let enonceAMC
      let correctionAMC
      let reponseAMC
      let digitAMC
      let decimalesAMC
      let lignesAMC
      let alignementAMC
      let sanscadreAMC
      const enonceAMCInit = `${quidame} repère des ${ArticlePluriel} dans un magazine de publicité à $${texNombre(PrixUnitaire)}$${sp()}€ le kilogramme. <br>`
      texte = enonceAMCInit + '<br>'
      texteCorr = ''
      correctionAMC = ''
      for (let kk = 0; kk < typesQuestionsDisponibles.length; kk++) {
        if (typesQuestionsDisponibles.length > 1) {
          // Si une seule question, pas besoin de puces numerotees
          enonceAMC = numAlpha(kk)
          correctionAMC = numAlpha(kk)
        } else {
          enonceAMC = ''
          correctionAMC += ''
        }
        lignesAMC = 3
        digitAMC = this.sup3 ? 2 : 4
        switch (typesQuestionsDisponibles[kk]) {
          case 1:
            enonceAMC += `Quel serait le prix de $${DixOuCent}$ kilogrammes de ${ArticlePluriel}${sp()}?<br><br>`
            reponseAMC = arrondi(DixOuCent * PrixUnitaire)
            correctionAMC += ` $${DixOuCent} \\times ${texNombre(PrixUnitaire)} = ${texNombre(reponseAMC)}$<br>`
            correctionAMC +=
              `Le prix de $${DixOuCent}$ kilogrammes de ${ArticlePluriel} serait de ` +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            lignesAMC = 1
            if (DixOuCent === 100) digitAMC++
            break
          case 2:
            enonceAMC += `Quel serait le prix de $${NbArticles}$ kilogrammes de ${ArticlePluriel}${sp()}?<br><br>`
            reponseAMC = arrondi(NbArticles * PrixUnitaire)
            correctionAMC += ` $${NbArticles} \\times ${texNombre(PrixUnitaire)} = ${texNombre(arrondi(NbArticles * PrixUnitaire))}$<br>`
            correctionAMC +=
              `Le prix de $${NbArticles}$ kilogrammes de ${ArticlePluriel} serait de ` +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            break
          case 3:
            enonceAMC += `Si ${quidame} achetait un kilogramme de ${ArticlePluriel} à $${texNombre(PrixUnitaire)}$${sp()}€ le kilogramme puis d'autres articles pour $${texNombre(AutrePrix)}$${sp()}€, quel serait le prix final${sp()}?<br><br>`
            reponseAMC = arrondi(PrixUnitaire + AutrePrix)
            correctionAMC += ` $${texNombre(PrixUnitaire)} + ${texNombre(AutrePrix)} = ${texNombre(reponseAMC)}$<br>`
            correctionAMC += `Si ${quidame} achetait un kilogramme de ${ArticlePluriel} ainsi que d'autres articles pour $${texNombre(AutrePrix)}$${sp()}€, `
            correctionAMC +=
              'le prix final serait de ' +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            break
          case 4:
            enonceAMC += `${quidame} dispose d'un bon de réduction de $${texNombre(PrixReduction)}$${sp()}€. Si ${quidame} achetait un kilogramme de ${ArticlePluriel}, quelle somme d'argent paierait ${quidame} au final${sp()}?<br><br>`
            reponseAMC = arrondi(PrixUnitaire - PrixReduction)
            correctionAMC += ` $${texNombre(PrixUnitaire)} - ${texNombre(PrixReduction)} = ${texNombre(reponseAMC)}$<br>`
            correctionAMC +=
              `Grâce à son bon de réduction, ${quidame} ne paierait que ` +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            break
          case 5:
            enonceAMC += `Si ${quidame} achetait $${NbArticles2}$ kilogrammes de ${ArticlePluriel} et son ${Personnage1} en achetait également $${NbArticles3}$ kilogrammes, quelle somme d'argent paieraient-ils à eux deux${sp()}?<br><br>`
            reponseAMC = arrondi((NbArticles2 + NbArticles3) * PrixUnitaire)
            correctionAMC += ` $${NbArticles2} + ${NbArticles3} = ${NbArticles2 + NbArticles3}$<br>`
            correctionAMC += `${quidame} et son ${Personnage1} achèteraient $${NbArticles2 + NbArticles3}$ ${ArticlePluriel}.<br>`
            correctionAMC += `$${NbArticles2 + NbArticles3} \\times ${texNombre(PrixUnitaire)} = ${texNombre(reponseAMC)}$<br>`
            correctionAMC += `Si ${quidame} et son ${Personnage1} achetaient $${NbArticles2 + NbArticles3}$ kilogrammes de ${ArticlePluriel}, `
            correctionAMC +=
              'le prix final serait de ' +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            break
          case 6:
            enonceAMC += `Si ${quidame} achetait $${NbArticles5}$ kilogrammes de ${ArticlePluriel} mais que sa ${Personnage2} lui propose de lui en rembourser $${NbArticles4}$ kilogrammes, quelle somme d'argent ${quidame} dépenserait-elle${sp()}?<br><br>`
            reponseAMC = arrondi((NbArticles5 - NbArticles4) * PrixUnitaire)
            correctionAMC += `$${NbArticles5} - ${NbArticles4} = ${NbArticles5 - NbArticles4}$<br>`
            correctionAMC += `${quidame} ne payerait que $${NbArticles5 - NbArticles4}$ ${ArticlePluriel}.<br>`
            correctionAMC += `$${NbArticles5 - NbArticles4} \\times ${texNombre(PrixUnitaire)} = ${texNombre(reponseAMC)}$<br>`
            correctionAMC += `Si ${quidame} achetait $${NbArticles5}$ kilogrammes de ${ArticlePluriel} mais que sa ${Personnage2} lui propose de lui en rembourser $${NbArticles4}$ kilogrammes, `
            correctionAMC +=
              `${quidame} dépenserait ` +
              texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
              `${sp()}€.<br><br>`
            break
          case 7:
            enonceAMC += `Si ${quidame} décidait d'acheter un kilogramme de ${ArticlePluriel} avec $9$ amis, quelle somme équitable minimale devraient-ils, chacun, donner${sp()}?<br><br>`
            correctionAMC += '$1 + 9 = 10$<br>'
            correctionAMC += 'Le partage se ferait entre $10$ personnes.<br>'
            if (this.sup3) {
              reponseAMC = arrondi(PrixUnitaire / 10, 3)
              correctionAMC += `$${texNombre(PrixUnitaire)} \\div 10 = ${texNombre(reponseAMC)}$<br>`
              correctionAMC +=
                `Si ${quidame} partageait un kilogramme de ${ArticlePluriel} avec $9$ amis, chacun donnerait équitablement ` +
                texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
                `${sp()}€.<br><br>`
            } else {
              reponseAMC = troncature(arrondi(PrixUnitaire / 10, 3) + 0.01, 2)
              correctionAMC += `$${texNombre(PrixUnitaire)} \\div 10 = ${texNombre(arrondi(PrixUnitaire / 10, 3))}$ et $${texNombre(troncature(arrondi(PrixUnitaire / 10, 3), 2))} < ${texNombre(arrondi(PrixUnitaire / 10, 3))} < ${texNombre(reponseAMC)}$<br>`
              correctionAMC +=
                `Si ${quidame} partageait un kilogramme de ${ArticlePluriel} avec $9$ amis, chacun donnerait équitablement au moins ` +
                texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
                `${sp()}€.<br><br>`
            }
            break
          case 8:
          default:
            enonceAMC += `Si ${quidame} décidait d'acheter un kilogramme de ${ArticlePluriel} avec $${Nbpartage}$ camarades, quelle somme équitable minimale devraient-ils, chacun, donner${sp()}?<br><br>`
            correctionAMC += `$1 + ${Nbpartage} = ${Nbpartage + 1}$<br>`
            correctionAMC += `Le partage se ferait entre $${Nbpartage + 1}$ personnes.<br>`
            if (estentier(arrondi(PrixUnitaire * 100, 0) / (Nbpartage + 1))) {
              reponseAMC = arrondi(PrixUnitaire / (Nbpartage + 1), 3)
              correctionAMC += `$${texNombre(PrixUnitaire)} \\div ${Nbpartage + 1} = ${texNombre(reponseAMC)}$<br>`
              correctionAMC +=
                `Si ${quidame} partageait un kilogramme de ${ArticlePluriel} avec $${Nbpartage}$ camarades, chacun donnerait équitablement ` +
                texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
                `${sp()}€.<br><br>`
            } else {
              reponseAMC = troncature(
                arrondi(PrixUnitaire / (Nbpartage + 1), 3) + 0.01,
                2,
              )
              if (
                estentier(arrondi(PrixUnitaire * 1000, 0) / (Nbpartage + 1))
              ) {
                correctionAMC += `$${texNombre(PrixUnitaire)} \\div ${Nbpartage + 1} = ${texNombre(arrondi(PrixUnitaire / (Nbpartage + 1), 3))}$ et $${texNombre(troncature(arrondi(PrixUnitaire / (Nbpartage + 1), 3), 2))} < ${texNombre(arrondi(PrixUnitaire / (Nbpartage + 1), 3))} < ${texNombre(reponseAMC)}$<br>`
              } else {
                correctionAMC += `$${texNombre(PrixUnitaire)} \\div ${Nbpartage + 1} \\approx ${texNombre(arrondi(PrixUnitaire / (Nbpartage + 1), 3))}$ et $${texNombre(troncature(arrondi(PrixUnitaire / (Nbpartage + 1), 3), 2))} < ${texNombre(arrondi(PrixUnitaire / (Nbpartage + 1), 3))} < ${texNombre(reponseAMC)}$<br>`
              }
              correctionAMC +=
                `Si ${quidame} partageait un kilogramme de ${ArticlePluriel} avec $${Nbpartage}$ camarades, chacun donnerait équitablement au moins ` +
                texteEnCouleurEtGras(`$${texPrix(reponseAMC)}$`) +
                `${sp()}€.<br><br>`
            }
            break
        } // fin du switch
        if (!context.isAmc) {
          texte += enonceAMC
          texteCorr += correctionAMC
        }
        if (this.interactif && !context.isAmc) {
          texte +=
            ajouteChampTexteMathLive(
              this,
              nbCas * i + kk,
              KeyboardType.clavierDeBase,
              { texteApres: ' €' },
            ) + '<br><br>'
          handleAnswers(this, nbCas * i + kk, {
            reponse: { value: reponseAMC },
          })
        }
        if (context.isAmc) {
          if (kk === 0) enonceAMC = enonceAMCInit + enonceAMC
          enonceAMC +=
            this.sup4 === 1
              ? 'Code la réponse en noircissant les bonnes cases.'
              : this.sup4 === 2
                ? "Indique, tout d'abord, le calcul et effectue-le de tête ou bien posé dans le cadre ci-dessous."
                : "Indique tout d'abord, ci-dessous, le calcul et effectue-le de tête ou bien posé sur cette feuille. Puis code la réponse en noircissant les bonnes cases."
          decimalesAMC = this.sup3 ? 0 : 2
          alignementAMC = this.sup4 === 1 ? 'center' : 'flushright'
          sanscadreAMC = !(this.sup4 === 2)
          propositionsAMC[2 * kk] = {
            type: 'AMCOpen',
            propositions: [
              {
                texte: correctionAMC,
                statut: lignesAMC,
                enonce: enonceAMC,
                sanscadre: sanscadreAMC,
              },
            ],
          }
          propositionsAMC[2 * kk + 1] = {
            type: 'AMCNum',
            propositions: [
              {
                texte: this.sup4 === 1 ? correctionAMC : '',
                statut: '',
                reponse: {
                  texte: this.sup4 === 1 ? enonceAMC : '',
                  valeur: [reponseAMC],
                  alignement: alignementAMC,
                  param: {
                    digits: digitAMC,
                    decimals: decimalesAMC,
                    signe: false,
                  },
                },
              },
            ],
          }
        }
      }
      if (this.sup4 === 1) {
        for (let kk = arrondi(propositionsAMC.length / 2); kk >= 0; kk--) {
          enleveElementNo(propositionsAMC, 2 * kk)
        }
      } else if (this.sup4 === 2) {
        for (let kk = arrondi(propositionsAMC.length / 2); kk >= 0; kk--) {
          enleveElementNo(propositionsAMC, 2 * kk + 1)
        }
      }
      if (this.questionJamaisPosee(i, donnees.map(String).join('-'))) {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            propositions: propositionsAMC,
            enonceAvant: false,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    } // fin du for

    listeQuestionsToContenu(this)
  }
}
