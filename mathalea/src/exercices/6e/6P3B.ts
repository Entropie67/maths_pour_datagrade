import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { personnes } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from './../Exercice'
import { deDevant } from '../../lib/outils/outilString'

export const titre = 'Reconnaître une situation de proportionnalité'
export const dateDePublication = '12/08/2025'
export const interactifReady = true

/**
 * @author Éric Elter
 */

interface Affirmation {
  texte: string
  statut: boolean
  correction: string
}
export const uuid = '05763'

export const refs = {
  'fr-fr': ['6P3B', 'CM1P3A', 'CM2P3A'],
  'fr-2016': ['6P16'],
  'fr-ch': ['9R1FA1A-2', '9R2FA1A-2', '9R3FA1A-2', 'PRQPF03A-4'],
}
export default class VraiFauxProportionnalite extends Exercice {
  affirmations: Affirmation[]
  constructor() {
    super()
    this.nbQuestions = 1

    this.affirmations = []
  }

  nouvelleVersion() {
    const quidam = personnes(21)
    this.consigne =
      this.nbQuestions === 1
        ? 'Dire si cette affirmation est vraie ou fausse.'
        : 'Pour chaque affirmation, dire si elle est vraie ou fausse.'
    this.affirmations = [
      {
        texte: `Si un litre de jus coûte $${texNombre(choice([0.75, 1.25, 1.5, 1.75]))}$ euros, alors le prix payé est proportionnel au nombre de litres achetés.`,
        statut: true,
        correction:
          'Le prix payé est proportionnel au nombre de litres achetés de ce jus car, par exemple, si le nombre de litres triple, le prix payé triple aussi.',
      },
      {
        texte: `Si ${quidam[0].prenom} dort 8 heures chaque nuit, alors son temps total de sommeil est proportionnel au nombre de nuits.`,
        statut: true,
        correction: `Le temps de sommeil ${deDevant(quidam[0].prenom)} est proportionnel au nombre de nuits car, par exemple, si le nombre de nuits double, le temps de sommeil ${deDevant(quidam[0].prenom)} double aussi.`,
      },
      {
        texte: `Si ${quidam[1].prenom} lit chaque jour 10 pages de son roman, alors son nombre de pages lues est proportionnel au nombre de jours.`,
        statut: true,
        correction: `Le nombre de pages lues par ${quidam[1].prenom} est proportionnel au nombre de jours car, par exemple, si le nombre de jours triple, le nombre de pages lues par ${quidam[1].prenom} triple aussi.`,
      },
      {
        texte: `Si ${quidam[2].prenom} fait 100 pas chaque minute, alors son nombre de pas est proportionnel au temps de marche.`,
        statut: true,
        correction: `Le nombre de pas ${deDevant(quidam[2].prenom)} est proportionnel au temps de marche car, par exemple, si le temps de marche double, le nombre de pas double aussi.`,
      },
      {
        texte: `Si une portion de gâteau contient $${10 * randint(1, 15) + 70}$ calories, alors le nombre de calories est proportionnel au nombre de portions mangées.`,
        statut: true,
        correction:
          'Le nombre de calories est proportionnel au nombre de portions de ce gâteau car, par exemple, si le nombre de portions double, le nombre de calories double aussi.',
      },
      {
        texte: `Si ${quidam[3].prenom} boit $${texNombre(choice([0.75, 1.25, 1.5, 1.75]))}$ litre d’eau par jour, alors sa quantité d’eau bue est proportionnelle au nombre de jours.`,
        statut: true,
        correction: `La quantité d’eau bue par ${quidam[3].prenom} est proportionnelle au nombre de jours car, par exemple, si le nombre de jours triple, la quantité d’eau bue par ${quidam[3].prenom} triple aussi.`,
      },
      {
        texte: `Si ${quidam[4].prenom} passe $${texNombre(choice([2, 2.5, 3, 3.5, 4]))}$ heures par jour devant un écran, alors le temps total passé devant un écran par ${quidam[4].prenom} est proportionnel au nombre de jours.`,
        statut: true,
        correction: `Le temps total passé devant un écran par ${quidam[4].prenom} est proportionnel au nombre de jours car, par exemple, si le nombre de jours double, le temps total double aussi.`,
      },
      {
        texte: `Si ${quidam[5].prenom} dépense 20 euros chaque semaine, alors la somme par ${quidam[5].prenom} dépensée est proportionnelle au nombre de semaines.`,
        statut: true,
        correction: `La somme dépensée par ${quidam[5].prenom} est proportionnelle au nombre de semaines car, par exemple, si le nombre de semaines triple, la dépense totale triple aussi.`,
      },
      {
        texte: `Si une voiture met $${texNombre(choice([3, 4, 5, 6, 7]))}$ minutes par kilomètre, alors son temps de trajet est proportionnel à la distance parcourue.`,
        statut: true,
        correction:
          'Le temps de trajet est proportionnel à la distance car, par exemple, si la distance double, le temps de trajet double aussi.',
      },
      {
        texte: `Si ${quidam[6].prenom} envoie $${randint(15, 45)}$ messages chaque heure, alors son nombre de messages envoyés est proportionnel au temps passé.`,
        statut: true,
        correction: `Le nombre de messages envoyés pas ${quidam[6].prenom} est proportionnel au temps car, par exemple, si le temps passé triple, le nombre de messages envoyés triple aussi.`,
      },
      {
        texte: `Si un ordinateur consomme $${texNombre(choice([0.8, 1.2, 1.4, 1.7]))}$ kWh par jour, alors sa consommation est proportionnelle au nombre de jours.`,
        statut: true,
        correction:
          'La consommation de cet ordinateur est proportionnelle au nombre de jours car, par exemple, si le nombre de jours double, la consommation double aussi.',
      },
      {
        texte: `Si une voiture rejette $${choice([80, 90, 100, 110, 120, 130, 140, 150])}$ g de CO₂ par kilomètre, alors sa quantité rejetée de CO₂ est proportionnelle à la distance parcourue.`,
        statut: true,
        correction:
          'La quantité de CO₂ émise par cette voiture est proportionnelle à la distance parcourue car, par exemple, si la distance triple, la quantité de CO₂ triple aussi.',
      },
      {
        texte: `Si ${quidam[7].prenom} produit $${texNombre(choice([0.8, 0.9, 1, 1.2, 1.4]))}$ kg de déchets par jour, alors sa quantité de déchets est proportionnelle au nombre de personnes ou de jours.`,
        statut: true,
        correction: `La quantité de déchets ${deDevant(quidam[7].prenom)} est proportionnelle au nombre de personnes ou de jours car, par exemple, si le nombre de personnes double, la quantité de déchets double aussi.`,
      },
      {
        texte: `Si chaque douche ${deDevant(quidam[8].prenom)} permet d’économiser 20 litres d’eau, alors sa quantité d'eau économisée est proportionnelle au nombre de douches.`,
        statut: true,
        correction: `La quantité d’eau économisée par ${quidam[8].prenom} est proportionnelle au nombre de douches car, par exemple, si le nombre de douches triple, l’eau économisée triple aussi.`,
      },
      {
        texte: `Si $${choice([80, 90, 100, 110, 120, 130, 140, 150])}$ espèces disparaissent chaque année, alors le nombre total d’espèces disparues est proportionnel au nombre d’années.`,
        statut: true,
        correction:
          'Le nombre d’espèces disparues est proportionnel au nombre d’années car, par exemple, si le nombre d’années double, le nombre d’espèces disparues double aussi.',
      },
      {
        texte: `Si $${texNombre(choice([800, 900, 1000, 1100, 1200, 1300]))}$ hectares de forêt sont détruits chaque jour, alors la surface perdue est proportionnelle au nombre de jours.`,
        statut: true,
        correction:
          'La surface détruite est proportionnelle au nombre de jours car, par exemple, si le nombre de jours triple, la surface détruite triple aussi.',
      },
      {
        texte: `Si la température augmente de $${texNombre(choice([0.1, 0.2, 0.3, 0.4]))}$ °C tous les 10 ans, alors la hausse de température est proportionnelle au nombre de décennies.`,
        statut: true,
        correction:
          'La hausse de température est proportionnelle au nombre de décennies car, par exemple, si le nombre de décennies double, la hausse de température double aussi.',
      },
      {
        texte: `Si $${randint(5, 13)}$ millions de tonnes de plastique sont jetées chaque année, alors la quantité jetée de plastique est proportionnelle au nombre d’années.`,
        statut: true,
        correction:
          'La quantité jetée de plastique est proportionnelle au nombre d’années car, par exemple, si le nombre d’années triple, la quantité de plastique triple aussi.',
      },
      {
        texte: `Si ${quidam[8].prenom} court $${randint(10, 30)}$ kilomètres chaque semaine, alors la distance totale parcourue par ${quidam[8].prenom} est proportionnelle au nombre de semaines.`,
        statut: true,
        correction: `La distance parcourue par ${quidam[8].prenom} est proportionnelle au nombre de semaines car, par exemple, si le nombre de semaines double, la distance double aussi.`,
      },
      {
        texte: `Si une équipe marque $${randint(2, 5)}$ points à chaque match, alors le total des points de cette équipe est proportionnel au nombre de matchs.`,
        statut: true,
        correction:
          'Le total des points de cette équipe est proportionnel au nombre de matchs car, par exemple, si le nombre de matchs triple, le total des points triple aussi.',
      },
      {
        texte: `Si ${quidam[9].prenom} marque $${randint(2, 5)}$ buts chaque saison, alors son total de buts est proportionnel au nombre de saisons.`,
        statut: true,
        correction: `Le nombre de buts marqués par ${quidam[9].prenom} est proportionnel au nombre de saisons car, par exemple, si le nombre de saisons double, le total de buts double aussi.`,
      },
      {
        texte: `Si le cœur ${deDevant(quidam[10].prenom)} bat $${randint(72, 85)}$ fois par minute au repos, alors le nombre total de battements de son cœur est proportionnel au temps écoulé, au repos.`,
        statut: true,
        correction: `Le nombre de battements de cœur ${deDevant(quidam[10].prenom)}, au repos, est proportionnel au temps car, par exemple, si le temps triple, le nombre de battements triple aussi.`,
      },
      {
        texte: `Si ${quidam[11].prenom} fait $${randint(15, 30)}$ pompes par jour, alors son nombre total de pompes est proportionnel au nombre de jours.`,
        statut: true,
        correction: `Le nombre de pompes effectué par ${quidam[11].prenom} est proportionnel au nombre de jours car, par exemple, si le nombre de jours double, le total de pompes double aussi.`,
      },
      {
        texte: `Si un ${quidam[12].prenom} s'entraîne $${randint(2, 6)}$ heures par semaine, alors son temps total d'entraînement est proportionnel au nombre de semaines.`,
        statut: true,
        correction: `Le temps d'entraînement ${deDevant(quidam[12].prenom)} est proportionnel au nombre de semaines car, par exemple, si le nombre de semaines triple, le temps d'entraînement triple aussi.`,
      },
      {
        texte: `Si un billet coûte $${randint(5, 10)}$ € pour un enfant et $${randint(12, 20)}$ € pour un adulte, alors le prix total est proportionnel au nombre de personnes.`,
        statut: false,
        correction:
          'Le prix total n’est pas proportionnel au nombre de personnes car le tarif dépend de l’âge, donc il varie selon la composition du groupe.',
      },
      {
        texte: `Si un livre coûte $${randint(5, 10)}$ € et le deuxième est à moitié prix, alors le prix total est proportionnel au nombre de livres.`,
        statut: false,
        correction:
          'Le prix total n’est pas proportionnel au nombre de livres car les réductions font varier le prix par livre.',
      },
      {
        texte:
          'Si une voiture consomme, de façon irrégulière, plus en montée qu’en descente, alors la consommation est proportionnelle à la distance parcourue.',
        statut: false,
        correction:
          'La consommation n’est pas proportionnelle à la distance car elle dépend aussi du relief.',
      },
      {
        texte: `Si une course commence par un échauffement de $${5 * randint(1, 4)}$ minutes, alors la distance parcourue est proportionnelle au temps de course.`,
        statut: false,
        correction:
          'La distance n’est pas proportionnelle au temps car les premières minutes ne servent pas à avancer.',
      },
      {
        texte: `Si un tarif de transport inclut $${texPrix(choice([0.75, 0.9, 1.1, 1.25, 1.6]))}$ € de base plus $${texPrix(choice([0.25, 0.3, 0.4, 0.5]))}$ € par station, alors le prix est proportionnel au nombre de stations.`,
        statut: false,
        correction:
          'Le prix n’est pas proportionnel au nombre de stations car un coût fixe est ajouté au départ.',
      },
      {
        texte: `Si ${quidam[13].prenom} reçoit $${randint(1, 4)}$ € de plus que l'année précédénte pour son anniversaire et $${randint(5, 15)}$ € à Noël, alors l’argent reçu par ${quidam[13].prenom} est proportionnel au nombre de fêtes.`,
        statut: false,
        correction: `L’argent reçu par ${quidam[13].prenom} n’est pas proportionnel au nombre de fêtes car les montants varient selon l’occasion.`,
      },
      {
        texte: `Si ${quidam[14].prenom} marque 1 but au premier match, 2 au deuxième, 3 au troisième, alors le total est proportionnel au nombre de matchs.`,
        statut: false,
        correction: `Le total de buts ${deDevant(quidam[14].prenom)} n’est pas proportionnel au nombre de matchs car il augmente de façon non constante.`,
      },
      {
        texte: `Si la température commence à $${randint(1, 15)}$ °C et augmente de $${randint(1, 5)}$ °C par heure, alors cette température est proportionnelle au temps écoulé.`,
        statut: false,
        correction:
          'La température n’est pas proportionnelle au temps car elle ne commence pas par zéro au départ.',
      },
      {
        texte: `Si une plante pousse de $${randint(2, 3)}\\text{ cm}$ la première semaine, puis $${randint(5, 7, 6)}\\text{ cm}$ la deuxième, alors la hauteur de cette plante est proportionnelle au nombre de semaines.`,
        statut: false,
        correction:
          "La hauteur de cette plante n’est pas proportionnelle au nombre de semaines car la croissance n'est pas la même chaque semaine.",
      },
      {
        texte: `Si un forfait téléphonique coûte $${randint(8, 12)}$ € plus $${texPrix(choice([0.05, 0.1, 0.15, 0.2]))}$ € par minute, alors le prix de ce forfait est proportionnel au nombre de minutes utilisées.`,
        statut: false,
        correction:
          'Le prix de ce forfait n’est pas proportionnel au nombre de minutes car il y a un coût fixe qui fausse la proportion.',
      },
      {
        texte: `Si ${quidam[15].prenom} fait un puzzle de plus en plus vite, alors son temps pour le finir est proportionnel au nombre de pièces.`,
        statut: false,
        correction: `Le temps pris par ${quidam[15].prenom} pour faire ce puzzle n’est pas proportionnel au nombre de pièces car la vitesse augmente avec l'habitude.`,
      },
      {
        texte:
          'Si une lampe reste allumée plus ou moins longtemps selon l’usage, alors le temps d’éclairage est proportionnel au nombre d’allumages.',
        statut: false,
        correction:
          'Le temps d’éclairage n’est pas proportionnel au nombre d’allumages car chaque durée est variable.',
      },
      {
        texte: `Si le chien ${deDevant(quidam[16].prenom)} mange moins quand il fait chaud, alors sa quantité de nourriture est proportionnelle au nombre de jours.`,
        statut: false,
        correction: `La quantité mangée par le chien ${deDevant(quidam[16].prenom)} n’est pas proportionnelle au nombre de jours car elle dépend de la température.`,
      },
      {
        texte: `Si ${quidam[17].prenom} roule à vélo plus lentement contre le vent et avec la fatigue, alors sa distance parcourue est proportionnelle au temps écoulé.`,
        statut: false,
        correction: `La distance parcourue par ${quidam[17].prenom} à vélo n’est pas proportionnelle au temps car sa vitesse change selon les conditions et sa fatigue s'accroît avec le temps écoulé.`,
      },
      {
        texte: `Si ${quidam[18].prenom} grandit de plus en plus lentement, alors sa taille est proportionnelle à son âge.`,
        statut: false,
        correction: `La taille ${deDevant(quidam[18].prenom)} n’est pas proportionnelle à l’âge car la croissance ralentit avec le temps.`,
      },
      {
        texte:
          'Si un téléphone se décharge plus vite pendant les jeux, alors la batterie utilisée est proportionnelle au temps d’utilisation.',
        statut: false,
        correction:
          'La batterie utilisée n’est pas proportionnelle au temps car la consommation dépend de l’activité.',
      },
      {
        texte:
          'Si un train change de vitesse pendant le trajet, alors la distance parcourue est proportionnelle au temps.',
        statut: false,
        correction:
          'La distance n’est pas proportionnelle au temps car la vitesse n’est pas constante.',
      },
      {
        texte: `Si une remise de $${choice([5, 10, 15, 20, 30])}$ % s’applique après $${choice([100, 200, 250, 500])}$ € d’achat, alors le prix payé est proportionnel au montant des achats.`,
        statut: false,
        correction:
          'Le prix payé n’est pas proportionnel car la réduction ne s’applique qu’après un certain prix.',
      },
      {
        texte:
          'Si le score d’un jeu dépend du temps et de la difficulté, alors le score est proportionnel au temps de jeu.',
        statut: false,
        correction:
          'Le score n’est pas proportionnel au temps car il dépend aussi de la difficulté.',
      },
      {
        texte:
          'Si un réservoir fuit irrégulièrement pendant qu’on le remplit, alors le volume d’eau est proportionnel au temps de remplissage.',
        statut: false,
        correction:
          'Le volume d’eau n’est pas proportionnel au temps car une partie de l’eau est perdue de façon irrégulière.',
      },
      {
        texte:
          "Si le prix d’un fruit change selon la saison, alors le prix est proportionnel au poids tout au long de l'année.",
        statut: false,
        correction:
          "Le prix, au long de l'année, n’est pas proportionnel au poids car le prix au kilo n’est pas constant tout au long de l'année.",
      },
      {
        texte:
          "Si quelques élèves d'une classe paient moins cher grâce à une réduction, alors le prix payé par l'ensemble des élèves de cette classe est proportionnel au nombre de tickets.",
        statut: false,
        correction:
          "Le prix payé par l'ensemble des élèves n’est pas proportionnel au nombre de tickets car tous les tickets ne valent pas tous le même prix.",
      },
      {
        texte: `Si au cours d'un raid, ${quidam[19].prenom} court de moins en moins vite, alors la distance parcourue par ${quidam[19].prenom} est proportionnelle au temps.`,
        statut: false,
        correction: `La distance parcourue par ${quidam[19].prenom} n’est pas proportionnelle au temps car sa vitesse diminue avec le temps.`,
      },
      {
        texte: `Si ${quidam[20].prenom} apprend plus vite en travaillant avec un camarade, alors le nombre de notions apprises par ${quidam[20].prenom} est proportionnel au nombre de camarades.`,
        statut: false,
        correction: `Le nombre de notions apprises par ${quidam[20].prenom} n’est pas proportionnel au nombre de camarades car rien ne dit qu'avec deux camarades, il apprend deux fois plus vite qu'avec un seul camarade.`,
      },
    ]
    this.affirmations = shuffle(this.affirmations)
    this.nbQuestions = Math.min(this.affirmations.length, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = this.affirmations[i].texte
      const propositions = [
        {
          texte: 'Vrai',
          statut: this.affirmations[i].statut,
        },
        {
          texte: 'Faux',
          statut: !this.affirmations[i].statut,
        },
      ]
      this.autoCorrection[i] = {
        options: { ordered: true, vertical: false, radio: true },
        enonce: texte,
        propositions,
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc && this.interactif) {
        texte += monQcm.texte
      }
      let correction = `L'affirmation est ${texteEnCouleurEtGras(this.affirmations[i].statut ? 'vraie' : 'fausse')}.<br>`
      correction += this.affirmations[i].correction

      if (this.questionJamaisPosee(i, this.affirmations[i].texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
