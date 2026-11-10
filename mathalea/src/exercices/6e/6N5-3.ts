import { texteGras } from '../../lib/format/style'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { jourAuHasard, nomDuMois } from '../../lib/outils/dateEtHoraires'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { deDevant, queDevant } from '../../lib/outils/outilString'
export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

export const titre =
  'Trouver les informations utiles ou inutiles pour résoudre des problèmes'
export const dateDePublication = '01/12/2021'
export const dateDeModifImportante = '28/03/2024'

/**
 * Trouver les informations utiles ou inutiles pour résoudre des problèmes
 * On peut choisir des problèmes qui n'ont pas de solution.
 * @author Éric Elter
 */
export const uuid = '7fb24'

export const refs = {
  'fr-fr': ['6N5-3'],
  'fr-2016': ['6C12-3'],
  'fr-ch': ['9R1NO7F-1', '9R2NO7F-1', '9R3NO7F-1', 'PRQST01A-1'], // Primaire anciennement :['9NO16-2'],
}
export default class ExerciceInformationsProblemes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix de la formulation :',
      2,
      '1 : Coche les informations qui servent à sa résolution.\n2 : Coche les informations qui NE servent PAS à sa résolution.',
    ]
    this.besoinFormulaire2Texte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Livres\n2 : Haricots\n3 : Villages de montagne\n4 : Manga\n5 : Film\n6 : Vélo\n7 : Taille\n8 : Gare\n9 : Livreur\n10 : Cargo\n11 : Tous les problèmes\n',
    ]
    this.besoinFormulaire3CaseACocher = [
      'Certains problèmes peuvent être insolubles',
    ]
    this.sup = 1
    this.sup2 = 11
    this.sup3 = false

    this.spacing = 2
  }

  nouvelleVersion() {
    // Ebauche de la consigne en fonction des possibilités
    const cocheIndique = ['coche', 'indique']
    const chaqueCe = ['chaque', 'ce']
    const affirmatifNegatif = ['servent', 'ne servent pas']
    this.consigne = 'Dans '
    this.consigne +=
      this.nbQuestions === 1 || context.isAmc ? chaqueCe[1] : chaqueCe[0]
    this.consigne += ' problème, '
    this.consigne += context.vue === 'diap' ? cocheIndique[1] : cocheIndique[0]
    this.consigne += ' les informations qui '
    this.consigne += texteGras(
      this.sup !== 1 ? affirmatifNegatif[1] : affirmatifNegatif[0],
    )
    this.consigne += ' à sa résolution.'
    // Fin de l'ébauche de la consigne en fonction des possibilités
    const listeDesProblemes = gestionnaireFormulaireTexte({
      max: 10,
      defaut: 11,
      nbQuestions: this.nbQuestions,
      melange: 11,
      saisie: this.sup2,
    })

    const FamilleH = ['père', 'frère', 'cousin', 'grand-père', 'voisin']
    const FamilleF = [
      'mère',
      'sœur',
      'cousine',
      'grand-mère',
      'tante',
      'voisine',
    ]

    let choixVersion = 0

    for (
      let i = 0,
        nb,
        nb1,
        nb2,
        nb3,
        nb4,
        nb5,
        quidam,
        quidam2,
        personnage1,
        texte,
        texteCorr;
      i < this.nbQuestions;
      i++
    ) {
      this.autoCorrection[i] = {}
      choixVersion = this.sup3 ? choice([1, 2, 3]) : choice([1, 2])
      texte = ''
      texteCorr = ''
      switch (listeDesProblemes[i]) {
        case 1:
          nb1 = randint(17, 35)
          nb2 = randint(7, 15)
          nb4 = randint(3, 10)
          nb5 = 10 * randint(20, 60)
          texte += `Dans une classe de $${nb1}$ élèves âgés de $${nb2}$ à $${nb2 + 2}$ ans,`
          texte += ` un professeur distribue à chaque enfant $${nb4}$ livres pesant $${nb5}$ g chacun.<br>`

          switch (choixVersion) {
            case 1:
              texte += 'Quel est le nombre total de livres distribués ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` + texteEnCouleurEtGras(' élèves')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' livres') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `$${miseEnEvidence(nb2 + 2)}$` +
                  texteEnCouleurEtGras(' ans')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' g') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ élèves`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2 + 2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ livres`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ g`,
                  statut: this.sup !== 1,
                },
              ]
              break
            case 2:
              texte +=
                'Quelle est la masse totale des livres distribués à chaque enfant ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb5)}$` + texteEnCouleurEtGras(' g')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' livres') +
                  ' sont utiles pour la résolution du problème'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `$${miseEnEvidence(nb2 + 2)}$` +
                  texteEnCouleurEtGras(' ans')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' élèves') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ élèves`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2 + 2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ livres`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ g`,
                  statut: this.sup === 1,
                },
              ]

              break
            default:
              texte += `Quel est, dans cette classe, le nombre exact d'enfants de $${nb2 + 1}$ ans ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' élèves') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb2 + 2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' livres')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' g') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ élèves`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2 + 2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ livres`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ g`,
                  statut: this.sup !== 1,
                },
              ]

              break
          }
          break
        case 2:
          quidam = prenomM()
          nb1 = randint(2, 5)
          nb2 = choice([250, 500, 600, 750])
          nb3 = texPrix(arrondi(randint(10, 50) / 10 + randint(1, 9) / 100))
          nb4 = randint(2, 5, [nb1])
          nb5 = texPrix(arrondi(randint(20, 40) / 10 + randint(1, 9) / 100))
          texte += `Au marché, ${quidam} achète $${nb1}$ barquettes de haricots verts de $${nb2}$ g chacune à $${nb3}$ € pièce `
          texte += ` et $${nb4}$ ananas coûtant $${nb5}$ € l'unité.<br>`

          switch (choixVersion) {
            case 1:
              texte += 'Quel est le prix total des fruits achetés ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb4)}$` + texteEnCouleurEtGras(' ananas')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' barquettes') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' g')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ barquettes`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ g`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ ananas`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ €`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte += 'Quel est le prix total des légumes achetés ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' barquettes')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' ananas') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' g')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ barquettes`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb2}$ g`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb4}$ ananas`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ €`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += 'Quel est le prix total des boissons achetées ?'
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' barquettes') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' g') +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' €') +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' ananas')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ barquettes`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ g`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ ananas`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ €`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break

        case 3:
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(501, 978)
          nb2 = randint(230, 450)
          nb3 = randint(5, 11)
          nb4 = randint(110, 230)
          nb5 = randint(128, Math.round(nb1 / 2))
          texte += `Le village de Sainte-${quidam2}-Les-Trois-Vallées compte $${nb1}$ habitants et se situe à une altitude de $${nb2}\\text{ m}$.`
          texte += ` À $${nb3}\\text{ km}$ de là, le village de Saint-${quidam}-Le-Bouquetin, situé $${nb4}\\text{ m}$ plus haut, compte $${nb5}$ habitants de moins.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Combien d'habitants compte le village de Saint-${quidam}-Le-Bouquetin ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' habitants')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' habitants') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb2 + '\\text{ m}')}$` +
                  ', ' +
                  `$${miseEnEvidence(nb3 + '\\text{ km}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4 + '\\text{ m}')}$` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ habitants`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb2}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ habitants`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte += `À quelle altitude se situe le village de Saint-${quidam}-Le-Bouquetin ?`
              if (this.sup === 1) {
                texteCorr += `$${miseEnEvidence(nb2 + '\\text{ m}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4 + '\\text{ m}')}$` +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' habitants') +
                  ', ' +
                  `$${miseEnEvidence(nb3 + '\\text{ km}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' habitants') +
                  ' ne sont pas utiles pour la résolution du problème'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ habitants`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}\\text{ m}$`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ habitants`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += `Combien de garçons compte le village de Sainte-${quidam2}-Les-Trois-Vallées ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' habitants') +
                  ', ' +
                  `$${miseEnEvidence(nb2 + '\\text{ m}')}$` +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb3 + '\\text{ km}')}$` +
                  ', ' +
                  `$${miseEnEvidence(nb4 + '\\text{ m}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' habitants') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ habitants`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ habitants`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        case 4: {
          personnage1 = choice(FamilleH)
          quidam2 = prenomF()
          const minutes = 5 * randint(1, 10)
          nb1 = `$1$ h $${minutes}$`
          const nb1Ev = `$${miseEnEvidence(1)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes)}$`
          nb2 = texPrix(arrondi(randint(50, 90) / 10 + randint(1, 9) / 100))
          nb3 = randint(5, 9)
          nb4 = choice([10, 20, 50])
          nb5 = 4 * randint(12, 24)
          texte += `${quidam2} vient de lire en ${nb1} un manga qu'elle avait payé $${nb2}$ €. `
          texte += `Elle a remarqué que sur chaque page, il y avait exactement $${nb3}$ cases. `
          texte += `C'est grâce au billet de $${nb4}$ € que lui a donné son ${personnage1}, ${queDevant(quidam2)} a pu s'acheter ce livre de $${nb5}$ pages.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Combien y a-t-il de cases dans le manga ${deDevant(quidam2)} ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` + texteEnCouleurEtGras(' cases')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' pages') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `${nb1Ev}` +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ cases`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ pages`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte += `Lorsqu'elle a acheté son manga, quelle somme d'argent a-t-on rendu à ${quidam2} ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` + texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `${nb1Ev}` +
                  ', ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' cases')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' pages') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}$ cases`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ pages`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += `À quelle heure ${quidam2} a-t-elle commencé à lire son manga ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `${nb1Ev}` +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' €') +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' cases') +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' pages') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ cases`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ pages`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        }
        case 5: {
          personnage1 =
            randint(1, 2) === 1
              ? 'sa ' + choice(FamilleF)
              : 'son ' + choice(FamilleH)
          if (randint(1, 2) === 1) {
            quidam = prenomM()
            quidam2 = 'il'
          } else {
            quidam = prenomF()
            quidam2 = 'elle'
          }
          nb = randint(13, 21)
          const jour = jourAuHasard()
          const numeroJour = randint(2, 29)
          const mois = nomDuMois(randint(1, 12))
          nb1 = `${jour} $${numeroJour}$ ${mois}`
          const minutes2 = 5 * randint(2, 11)
          nb2 = `$${nb}$ h $${minutes2}$`
          const minutes3 = 5 * randint(2, 11)
          nb3 = `$${nb + 2}$ h $${minutes3}$`
          const minutes4 = 5 * randint(2, 11)
          nb4 = `$${nb + 1}$ h $${minutes4}$`
          const minutes5 = 5 * randint(37, 58)
          nb5 = `$${minutes5}$ minutes`
          const nb1Ev = `${texteEnCouleurEtGras(jour + ' ')}$${miseEnEvidence(numeroJour)}$${texteEnCouleurEtGras(' ' + mois)}`
          const nb2Ev = `$${miseEnEvidence(nb)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes2)}$`
          const nb3Ev = `$${miseEnEvidence(nb + 2)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes3)}$`
          const nb4Ev = `$${miseEnEvidence(nb + 1)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes4)}$`
          const nb5Ev = `$${miseEnEvidence(minutes5)}$${texteEnCouleurEtGras(' minutes')}`
          texte += `${quidam} décide de programmer la box ${deDevant(personnage1)} pour enregistrer un film prévu le ${nb1} et une émission prévue le lendemain. `
          texte += `Le film doit commencer à ${nb2} et se terminer à ${nb3}. L'émission commence à ${nb4} et dure ${nb5}.<br>`

          switch (choixVersion) {
            case 1:
              texte += 'Quelle est la durée prévue du film ?'
              if (this.sup === 1) {
                texteCorr += `${nb2Ev}`
                texteCorr +=
                  ' et ' +
                  `${nb3Ev}` +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr += `${nb4Ev}` + ', ' + `${nb1Ev}`
                texteCorr +=
                  ' et ' +
                  `${nb5Ev}` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb5}`,
                  statut: this.sup !== 1,
                },
              ]
              break
            case 2:
              texte += "À quelle heure se termine l'émission ?"
              if (this.sup === 1) {
                texteCorr += `${nb4Ev}`
                texteCorr +=
                  ' et ' +
                  `${nb5Ev}` +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr += `${nb2Ev}` + ', ' + `${nb3Ev}`
                texteCorr +=
                  ' et ' +
                  `${nb1Ev}` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb5}`,
                  statut: this.sup === 1,
                },
              ]
              break
            default:
              texte += `À quelle heure de sa journée, ${quidam} décide-t-${quidam2} de programmer la box ${deDevant(personnage1)} ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr += `${nb2Ev}` + ', ' + `${nb3Ev}` + ', '
                texteCorr += `${nb4Ev}` + ', ' + `${nb5Ev}`
                texteCorr +=
                  ' et ' +
                  `${nb1Ev}` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `${nb1}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb5}`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        }
        case 6:
          personnage1 = choice(FamilleF)
          quidam = choice(FamilleH)
          quidam2 = prenomF()
          nb1 = choice([15, 18, 21])
          nb2 = randint(214, 625)
          nb3 = randint(15, 18)
          nb4 = texPrix(arrondi(randint(2054, 3298) / 100))
          nb5 = choice([2, 3, 4, 6, 12])
          texte += `La ${personnage1} ${deDevant(quidam2)} lui a acheté un superbe vélo de $${nb1}$ vitesses, coûtant $${nb2}$ €, avec des roues de $${nb3}$ pouces. `
          texte += `Pour la protéger, son ${quidam} lui a offert un casque et du matériel d'éclairage valant $${nb4}$ €. `
          texte += `La ${personnage1} ${deDevant(quidam2)} a décidé de payer le vélo en $${nb5}$ fois.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Quel est le montant de chaque versement que payera la ${personnage1} ${deDevant(quidam2)} ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` + texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' fois') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' vitesses') +
                  ', ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' pouces')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ vitesses`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}$ pouces`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ fois`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte += `Quel est le montant total des cadeaux offerts à ${quidam2} ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` + texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' vitesses') +
                  ', ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' pouces')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' fois') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ vitesses`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}$ pouces`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ fois`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += `Pour quel âge, ${quidam2} a-t-elle reçu son vélo comme cadeau d'anniversaire ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' vitesses') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' €') +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' pouces') +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' fois') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ vitesses`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ pouces`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ fois`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        case 7:
          personnage1 = choice(FamilleF)
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(0, 3)
          nb2 = ['$3$ème', '$4$ème', '$5$ème', '$6$ème'][nb1]
          nb3 = [14, 13, 12, 11][nb1]
          nb4 = texNombre(arrondi(randint(132, 151) / 100))
          nb5 = randint(21, 42)
          texte += `${quidam}, un élève de ${nb2}, de $${nb3}$ ans, mesure $${nb4}\\text{ m}$. `
          texte += `${quidam2} a $${nb1 + 2}$ ans de plus ${queDevant(quidam)} et mesure $${nb5}\\text{ cm}$ de plus.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Quel est l'âge ${deDevant(quidam2)} ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` + texteEnCouleurEtGras(' ans')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb1 + 2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + 3)}$${texteEnCouleurEtGras('ème')}` +
                  ', ' +
                  `$${miseEnEvidence(nb4 + '\\text{ m}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ cm}')}$` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1 + 2}$ ans`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ ans`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}\\text{ cm}$`,
                  statut: this.sup !== 1,
                },
              ]
              break
            case 2:
              texte += `Combien mesure ${quidam2} ?`
              if (this.sup === 1) {
                texteCorr += `$${miseEnEvidence(nb4 + '\\text{ m}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ cm}')}$` +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + 2)}$` +
                  texteEnCouleurEtGras(' ans, ') +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' ans')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb1 + 3)}$${texteEnCouleurEtGras('ème')}` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1 + 2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}\\text{ cm}$`,
                  statut: this.sup === 1,
                },
              ]
              break
            default:
              texte += `En quelle classe est ${quidam2} ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + 2)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `$${miseEnEvidence(nb1 + 3)}$${texteEnCouleurEtGras('ème')}` +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `$${miseEnEvidence(nb4 + '\\text{ m}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ cm}')}$` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1 + 2}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb2}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}\\text{ cm}$`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        case 8: {
          personnage1 = choice(FamilleH)
          quidam = prenomM()
          nb1 = randint(45, 58)
          nb2 = randint(3, 5)
          const heure = randint(7, 9)
          const minutes = 5 * randint(2, 11)
          nb3 = `$${heure}$ h $${minutes}$`
          const nb3Ev = `$${miseEnEvidence(heure)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes)}$`
          nb4 = texPrix(arrondi(randint(9, 15, 10) / 10, 1))
          nb5 = 5 * randint(4, 11)
          texte += `Le ${personnage1} ${deDevant(quidam)}, âgé de $${nb1}$ ans, se rend $${nb2}$ fois par semaine à ${choice(['Paris', 'Toulouse', 'Bordeaux', 'Rouen'])} en train. `
          texte += `Une fois arrivé, il prend le métro à ${nb3}, après avoir acheté systématiquement le même journal, dans un kiosque de la gare, qui coûte $${nb4}$ €. Son trajet en métro dure $${nb5}$ minutes pour se rendre au travail.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Combien le ${personnage1} ${deDevant(quidam)} dépense-t-il chaque semaine pour son journal ?`
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` + texteEnCouleurEtGras(' fois')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `${nb3Ev}`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' min') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ fois`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ min`,
                  statut: this.sup !== 1,
                },
              ]
              break
            case 2:
              texte += `À quelle heure le ${personnage1} ${deDevant(quidam)} arrive-t-il à son travail ?`
              if (this.sup === 1) {
                texteCorr += `${nb3Ev}`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' min') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' ans, ') +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' fois')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ fois`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ min`,
                  statut: this.sup === 1,
                },
              ]
              break
            default:
              texte += `À quelle heure le ${personnage1} ${deDevant(quidam)} est-il parti de chez lui ?`
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' ans') +
                  ', ' +
                  `${nb3Ev}` +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' fois') +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' €')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' min') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ ans`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ fois`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb3}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ €`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ min`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        }
        case 9: {
          personnage1 = choice(FamilleF)
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(21, 39)
          nb2 = randint(7, 18)
          nb3 = randint(7, 15)
          const heure = randint(10, 12)
          const minutes = 5 * randint(2, 11)
          nb4 = `$${heure}$ h $${minutes}$`
          const nb4Ev = `$${miseEnEvidence(heure)}$${texteEnCouleurEtGras(' h ')}$${miseEnEvidence(minutes)}$`
          nb5 = randint(16, 29)
          texte += `Un livreur part de son entrepôt avec $${nb1}$ colis. Au premier arrêt, le plus près, il dépose $${nb2}$ colis. $${nb3}\\text{ km}$ plus loin, il livre le reste de ses colis. `
          texte += `Ensuite, à ${nb4}, le livreur reprend la même route et retourne à l'entrepôt, à $${nb5}\\text{ km}$ de là.<br>`

          switch (choixVersion) {
            case 1:
              texte += "Quelle distance sépare l'entrepôt du premier arrêt ?"
              if (this.sup === 1) {
                texteCorr += `$${miseEnEvidence(nb3 + '\\text{ km}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ km}')}$` +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' colis') +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' colis')
                texteCorr +=
                  ' et ' +
                  `${nb4Ev}` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ colis`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ colis`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup === 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}\\text{ km}$`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte +=
                'Combien de colis le livreur a-t-il déposé à son deuxième arrêt ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` + texteEnCouleurEtGras(' colis')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' colis') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb3 + '\\text{ km}')}$` + ', ' + `${nb4Ev}`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ km}')}$` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ colis`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb2}$ colis`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += "À quelle heure ce livreur est-il rentré à l'entrepôt ?"
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1)}$` +
                  texteEnCouleurEtGras(' colis') +
                  ', ' +
                  `${nb4Ev}` +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' colis') +
                  ', ' +
                  `$${miseEnEvidence(nb3 + '\\text{ km}')}$`
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5 + '\\text{ km}')}$` +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}$ colis`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ colis`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `${nb4}`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}\\text{ km}$`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
        }
        case 10:
          quidam = choice([
            'du Havre',
            'de Rotterdam',
            'de Hambourg',
            'de Marseille',
            'de Lisbonne',
          ])
          quidam2 = choice([
            'Hong-Kong',
            'Rio de Janeiro',
            'Auckland',
            'Sidney',
            'Kuala Lumpur',
          ])
          nb1 = randint(85, 153)
          nb2 = randint(67, 86)
          nb3 = randint(23, 30) // Masse d'un gros conteneur
          nb4 = randint(7, 26)
          nb = randint(14, 21) // Masse d'un petit conteneur
          nb5 = nb * nb4

          texte += `Un cargo mesurant $${nb1}\\text{ m}$ transporte $${nb2}$ gros conteneurs de $${nb3}$ tonnes chacun ${quidam} à ${quidam2}. `
          texte += `Ce bateau transporte aussi $${nb4}$ petits conteneurs pour une masse totale de $${nb5}$ tonnes.<br>`

          switch (choixVersion) {
            case 1:
              texte +=
                "Quelle est la masse de chacun des petits conteneurs, sachant qu'ils ont tous la même masse ?"
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' conteneurs')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' tonnes') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + '\\text{ m}')}$` +
                  ', ' +
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' conteneurs')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' tonnes') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ conteneurs`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ tonnes`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ conteneurs`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb5}$ tonnes`,
                  statut: this.sup === 1,
                },
              ]
              break
            case 2:
              texte += 'Quelle est la masse totale des gros conteneurs ?'
              if (this.sup === 1) {
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' conteneurs')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' tonnes') +
                  ' sont utiles pour la résolution du problème.'
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + '\\text{ m}')}$` +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' conteneurs')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' tonnes') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ conteneurs`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb3}$ tonnes`,
                  statut: this.sup === 1,
                },
                {
                  texte: `$${nb4}$ conteneurs`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ tonnes`,
                  statut: this.sup !== 1,
                },
              ]
              break
            default:
              texte += "Quelle est la longueur d'un gros conteneur ?"
              if (this.sup === 1) {
                texteCorr += texteEnCouleurEtGras(
                  "Aucune donnée n'est utile pour la résolution du problème.",
                )
              } else {
                texteCorr +=
                  `$${miseEnEvidence(nb1 + '\\text{ m}')}$` +
                  ', ' +
                  `$${miseEnEvidence(nb4)}$` +
                  texteEnCouleurEtGras(' conteneurs') +
                  ', '
                texteCorr +=
                  `$${miseEnEvidence(nb2)}$` +
                  texteEnCouleurEtGras(' conteneurs') +
                  ', ' +
                  `$${miseEnEvidence(nb3)}$` +
                  texteEnCouleurEtGras(' tonnes')
                texteCorr +=
                  ' et ' +
                  `$${miseEnEvidence(nb5)}$` +
                  texteEnCouleurEtGras(' tonnes') +
                  ' ne sont pas utiles pour la résolution du problème.'
              }
              texteCorr +=
                'On ne peut pas répondre à ce problème. Il manque des informations.'

              this.autoCorrection[i].propositions = [
                {
                  texte: `$${nb1}\\text{ m}$`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb2}$ conteneurs`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb3}$ tonnes`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb4}$ conteneurs`,
                  statut: this.sup !== 1,
                },
                {
                  texte: `$${nb5}$ tonnes`,
                  statut: this.sup !== 1,
                },
              ]
              break
          }
          break
      }
      this.autoCorrection[i].enonce = this.consigne + '<br>' + texte
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 5, // A creuser pour supprimer ou mettre nbquestions
      }
      const props = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += props.texte
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
