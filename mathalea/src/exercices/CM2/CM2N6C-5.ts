import { orangeMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import operation from '../../modules/operations'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '4f77c'
export const refs = {
  'fr-fr': ['CM2N6C-5'],
  'fr-2016': ['c3C32-04'],
  'fr-ch': ['9R1NO7G-5', '9R2NO7G-5', '9R3NO7G-5', 'PRQST02C-2', 'PRQNO15A-15', 'PRQPF04A-7'],
}
export const titre = 'Résoudre le problème complexe du spectacle'
export const dateDePublication = '21/11/2024'

export const interactifReady = true
/**
 * @Author Jean-claude Lhote
 * Sources (eduscol) : https://eduscol.education.fr/ressources/numerique/2020/2020-exercices-mathematiques-6e
 * Ces exercices seront proposés systématiquement pour 3 niveaux de difficulté afin de différentier autour d'un même problème
 */
export default class ExerciceProbleme004 extends Exercice {
  constructor() {
    super()
    this.spacing = 1.2
    this.spacingCorr = 1.2
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'niveau de difficulté',
      3,
      '1 : Élèves à besoin\n2 : Moyens\n3 : Avancés',
    ]
    this.sup = 2
    this.besoinFormulaire3CaseACocher = [
      'Opération posée dans la correction',
      false,
    ]

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    let nbArtistes = 5
    let payeArtiste = 50
    let fraisDeplacement = 200
    let nbEleves = 50
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const show = choice([
        'musical.artistes',
        'théatral.acteurs',
        'des arts du cirque.acrobates',
      ])
      const [showType, artiste] = show.split('.')
      switch (this.sup) {
        case 1:
          nbArtistes = choice([4, 5, 10])
          payeArtiste = (400 + randint(2, 10) * 20) / nbArtistes
          fraisDeplacement = choice([100, 200, 300])
          nbEleves = choice([50, 100, 100])
          break
        case 3:
          nbArtistes = choice([5, 8, 10])
          payeArtiste = (400 + randint(2, 10) * 40) / nbArtistes
          fraisDeplacement = choice([150, 200, 250, 300, 350])
          nbEleves = choice([40, 50, 60, 80, 120])
          break
        default:
          nbArtistes = choice([5, 8, 10])
          payeArtiste = (400 + randint(2, 10) * 40) / nbArtistes
          fraisDeplacement = choice([150, 200, 250, 300, 350])
          nbEleves = choice([40, 50, 60, 80, 120])
          break
      }
      const cachets = nbArtistes * payeArtiste
      const sommeTotale = cachets + fraisDeplacement
      const double = randint(3, Math.floor((sommeTotale - 50) / nbEleves))
      const doubleImpair = double % 2 === 0 ? double + 1 : double
      const doublePair = double % 2 === 0 ? double : double + 1
      const participation = this.sup === 1 ? doublePair / 2 : doubleImpair / 2
      const priseEnCharge = nbEleves * participation
      const aides = sommeTotale - priseEnCharge
      const aideParents =
        this.sup === 1 ? 0 : Math.floor(aides / 100) * choice([10, 20, 30])
      const aideMairie = aides - aideParents
      const resteAPayer = sommeTotale - aides
      let listePrincipale: string
      let listeCorrections: string
      listePrincipale = `Un spectacle ${showType} avec ${nombreEnLettres(nbArtistes)} ${artiste} est proposé au directeur d'une école.<br>
      Il faut payer les ${artiste} $${payeArtiste}$ euros chacun.<br>
      Il faut aussi payer leur déplacement, soit $${fraisDeplacement}$ euros au total. Il n'y a pas d'autres frais.<br>
       La mairie accorde une aide de $${aideMairie}$ euros.`
      // dépense Totale
      const correction1 = `${this.correctionDetaillee ? 'La dépense totale est la somme des cachets des artistes et des frais de déplacement :<br>' : ''}
${this.sup3 ? `${deuxColonnesResp(operation({ operande1: payeArtiste, operande2: nbArtistes, type: 'multiplication', options: { solution: true, colore: orangeMathalea } }), operation({ operande2: fraisDeplacement, operande1: cachets, type: 'addition', options: { solution: true, colore: orangeMathalea } }), { eleId: '', largeur1: 50, widthmincol1: '100px', widthmincol2: '100px' })}` : ''}
 $\\begin{aligned}${nbArtistes}\\times ${payeArtiste}+${fraisDeplacement}&=${cachets}+${fraisDeplacement}\\\\&=${texNombre(sommeTotale)}\\end{aligned}$<br>
 La dépense totale est de $${this.sup !== 3 ? miseEnEvidence(texNombre(sommeTotale, 0)) : texNombre(sommeTotale, 0)}$ euros.<br>`
      // aides
      const correction3a =
        this.sup === 1
          ? ''
          : `${this.correctionDetaillee ? "Le montant total des aides est la somme des aides de la mairie et de l'association de parents d'élèves :<br>" : ''}
${this.sup3 ? `${operation({ operande1: aideMairie, operande2: aideParents, type: 'addition', options: { solution: true, colore: orangeMathalea } })}` : ''}
$${aideMairie}+${aideParents}=${texNombre(aides)}$<br>
Le montant total des aides est de $${this.sup !== 3 ? miseEnEvidence(texNombre(aides, 0)) : texNombre(aides, 0)}$ euros.<br>`
      // participation
      const correction3b = `${this.correctionDetaillee ? "La participation par élève est le montant restant à charge pour les familles divisé par le nombre d'élèves :<br>" : ''}
${this.sup3 ? `${operation({ operande1: resteAPayer, operande2: nbEleves, type: 'division', options: { solution: true, colore: orangeMathalea } })}` : ''}
$${resteAPayer}\\div ${nbEleves}=${texNombre(participation, 2, true)}$<br>
La participation par élève se monte à $${miseEnEvidence(texNombre(participation, 2, true))}$ euros.<br>`
      // reste à payer
      const correction2 = `${
        this.sup === 1
          ? `${this.correctionDetaillee ? "Le montant restant à charge pour les familles est la somme totale moins l'aide de la mairie :<br>" : ''}
${this.sup3 ? `${operation({ operande1: sommeTotale, operande2: aideMairie, type: 'soustraction', options: { solution: true, colore: orangeMathalea } })}` : ''}
$${sommeTotale}-${aideMairie}=${resteAPayer}$<br>
Le montant restant à payer par les familles est de $${this.sup !== 3 ? miseEnEvidence(texNombre(resteAPayer, 0)) : texNombre(resteAPayer, 0)}$ euros.<br>`
          : `${this.correctionDetaillee ? "Le montant restant à charge pour les familles est la somme totale moins les aides de la mairie et de l'association de parents d'élèves :<br>" : ''}
${this.sup3 ? `${operation({ operande1: sommeTotale, operande2: aides, type: 'soustraction', options: { solution: true, colore: orangeMathalea } })}` : ''}
$${texNombre(sommeTotale)}-${texNombre(aides)}=${resteAPayer}$<br>
Le montant restant à payer par les familles est de $${this.sup !== 3 ? miseEnEvidence(texNombre(resteAPayer, 0)) : texNombre(resteAPayer, 0)}$ euros.<br>`
      }`

      if (this.sup === 1) {
        listePrincipale += createList({
          items: [
            'Quel est le montant total de la dépense ?' +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(sommeTotale) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
            'Quel montant total reste-t-il à charge pour les familles des enfants ?' +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i + 1,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(resteAPayer) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
            `Si les $${nbEleves}$ élèves de cette école assistent au spectacle, quelle participation financière doit être demandée à chaque élève pour payer la dépense restante ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i + 2,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(participation) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
          ],
          style: 'alpha',
        })
        listeCorrections = createList({
          items: [
            correction1,
            `${this.correctionDetaillee ? "Le montant restant à charge pour les familles est la somme totale moins l'aide de la mairie :<br>" : ''}
${this.sup3 ? `${operation({ operande1: sommeTotale, operande2: aideMairie, type: 'soustraction', options: { solution: true, colore: orangeMathalea } })}` : ''}
$${sommeTotale}-${aideMairie}=${resteAPayer}$<br>
La somme totale restant à payer par les familles est de $${this.sup !== 3 ? miseEnEvidence(texNombre(resteAPayer, 0)) : texNombre(resteAPayer, 0)}$ euros.<br>`,
            correction3b,
          ],
          style: 'alpha',
        })
      } else if (this.sup === 2) {
        listePrincipale = `  Un spectacle ${showType} avec $${nbArtistes}$ ${artiste} est proposé au directeur d'une école.<br>
        Il faut payer les ${artiste} $${payeArtiste}$ euros chacun.<br>
        Il faut aussi payer leur déplacement, soit $${fraisDeplacement}$ euros au total. Il n'y a pas d'autres frais.<br>
        La mairie accorde une aide de $${aideMairie}$ euros.<br>
        L'association de parents d'élèves donne une aide de $${aideParents}$ euros.<br>`
        listePrincipale += createList({
          items: [
            'Quel est le montant total de la dépense ?' +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(sommeTotale) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
            'Quel est le montant total des aides ?' +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i + 1,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(aides) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
            `Si les $${nbEleves}$ élèves de cette école assistent au spectacle, quelle participation financière doit être demandée à chaque élève pour payer la dépense restante ?` +
              ajouteQuestionMathlive({
                exercice: this,
                question: 3 * i + 2,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: String(participation) } },
                typeInteractivite: 'mathlive',
                texteApres: ' euros.',
              }),
          ],
          style: 'alpha',
        })
        listeCorrections = createList({
          items: [
            correction1,
            correction3a,
            createList({
              items: [correction2, correction3b],
              style: 'fleches',
            }),
          ],
          style: 'alpha',
        })
      } else {
        const age = randint(7, 11)
        const distance = randint(41, 49)
        listePrincipale =
          `  Un spectacle ${showType} avec cinq ${artiste} est proposé au directeur d'une école, pour une classe d'enfants de $${age}$ ans.<br>
        Il faut payer les ${artiste} $${payeArtiste}$ euros chacun.<br>
        Il faut aussi payer leur déplacement de $${distance}\\text{ km}$, soit $${fraisDeplacement}$ euros au total. Il n'y a pas d'autres frais.<br>
        L'association de parents d'élèves donne une aide de $${aideParents}$ euros et la mairie accorde une autre aide de $${aideMairie}$ euros.<br>
        Si les $${nbEleves}$ élèves de cette école assistent au spectacle, quelle participation financière doit être demandée à chaque élève pour payer la dépense restante ?<br>` +
          ajouteQuestionMathlive({
            exercice: this,
            question: i,
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: { reponse: { value: String(participation) } },
            typeInteractivite: 'mathlive',
            texteApres: ' euros.',
          })
        listeCorrections = createList({
          items: [
            `${this.correctionDetaillee ? 'Calculons la somme totale à payer pour les artistes et leur déplacement :<br>' : ''}
        ${correction1}`,
            `${this.correctionDetaillee ? 'Calculons le montant total des aides :<br>' : ''}
        ${correction3a}`,
            `${this.correctionDetaillee ? 'Calculons le montant restant à charge pour les familles :<br>' : ''}
        ${correction2}`,
            `${this.correctionDetaillee ? 'Calculons la participation par élève :<br>' : ''}
        ${correction3b}`,
          ],
          style: 'fleches',
        })
      }
      if (this.questionJamaisPosee(i, sommeTotale, aideMairie, nbEleves)) {
        this.listeQuestions[i] = listePrincipale
        this.listeCorrections[i] = listeCorrections
        i++
      }
      cpt++
    }
  }
}
