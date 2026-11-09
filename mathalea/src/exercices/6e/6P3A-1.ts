import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Identifier des grandeurs'

export const dateDePublication = '27/09/2025'

export const uuid = 'ec781'
export const refs = {
  'fr-fr': ['6P3A-1'],
  'fr-2016': [],
  'fr-ch': ['9R1FA1A-1', '9R2FA1A-1', '9R3FA1A-1', 'PRQMG04A-6', 'PRQPF03A-3'],
}
/**
 *
 * @author Guillaume Valmont
 */
export default class IdentifierGrandeurs extends Exercice {
  constructor() {
    super()
    this.consigne = 'Identifier les grandeurs dans chaque situation.'
    this.besoinFormulaireNumerique = [
      'Type de question',
      2,
      '1: Identifier les grandeurs\n2: Reconnaître une situation de proportionnalité',
    ]
    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne =
      this.sup === 1
        ? 'Identifier les grandeurs dans chaque situation.'
        : 'Dans chaque situation, préciser si les grandeurs présentées sont dans une relation de proportionnalité.'
    const listeSituations = combinaisonListes(situations, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const situation = listeSituations[i]
      const variante = situation[Math.floor(situation.length * Math.random())]
      const unite1 = variante.unites[0]
      const unite2 = variante.unites[1]
      const grandeur1 = variante.grandeurs[0]
      const grandeur2 = variante.grandeurs[1]

      const correctionGrandeurs = `Attention, «${sp()}${unite1}${sp()}» et «${sp()}${unite2}${sp()}» sont des unités.<br>
      Les grandeurs sont «${sp()}${texteEnCouleurEtGras(grandeur1)}${sp()}» et «${sp()}${texteEnCouleurEtGras(grandeur2)}${sp()}».`

      let correctionProportionnalite = `Les grandeurs «${sp()}${grandeur1}${sp()}» et «${sp()}${grandeur2}${sp()}»`
      correctionProportionnalite += texteEnCouleurEtGras(
        variante.estProportionnel ? 'sont' : 'ne sont pas',
      )
      correctionProportionnalite += 'proportionnelles.'
      correctionProportionnalite +=
        variante.commentaireCorrection !== '' ? '<br>' : ''
      correctionProportionnalite += variante.commentaireCorrection

      const texte = variante.enonce
      const texteCorr =
        this.sup === 1 ? correctionGrandeurs : correctionProportionnalite

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

const situations = [
  [
    {
      enonce: 'Pour $3$ kg de pommes, on paie $5$ €.',
      grandeurs: ['masse', 'prix'],
      unites: ['kg', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
  ],
  [
    {
      enonce:
        'Une voiture parcourt $150\\text{ km}$ en $2$ heures et $300\\text{ km}$ en $4$ heures.',
      grandeurs: ['distance', 'temps'],
      unites: ['$\\text{km}$', 'heures'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Une voiture parcourt $150\\text{ km}$ en $2$ heures et $250\\text{ km}$ en $4$ heures.',
      grandeurs: ['distance', 'temps'],
      unites: ['$\\text{km}$', 'heures'],
      estProportionnel: false,
      commentaireCorrection:
        'Si la distance était proportionnelle au temps, elle serait de $300\\text{ km}$ en $4$ heures.',
    },
  ],
  [
    {
      enonce: 'Une visite de musée coûte $10$ € par élève.',
      grandeurs: ["nombre d'élèves", 'prix'],
      unites: ['élèves', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        "Une visite de musée coûte toujours $300$ € peu importe le nombre d'élèves.",
      grandeurs: ["nombre d'élèves", 'prix'],
      unites: ['élèves', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Le prix ne dépend pas du nombre d’élèves, donc les grandeurs ne sont pas proportionnelles.',
    },
  ],
  [
    {
      enonce: 'Pour fabriquer $4$ gâteaux, il faut $8$ œufs.',
      grandeurs: ['nombre de gâteaux', 'masse de beurre'],
      unites: ['gâteaux', 'g'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Pour fabriquer $4$ gâteaux, il faut $120$ g de beurre. Pour en fabriquer $8$ il faut $240$ g de beurre.',
      grandeurs: ['nombre de gâteaux', 'masse de beurre'],
      unites: ['gâteaux', 'g'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Pour fabriquer $4$ gâteaux, il faut $120$ g de beurre. Pour en fabriquer $8$ il faut $220$ g de beurre.',
      grandeurs: ['nombre de gâteaux', 'masse de beurre'],
      unites: ['gâteaux', 'g'],
      estProportionnel: false,
      commentaireCorrection:
        'Si la masse de beurre était proportionnelle au nombre de gâteaux, il faudrait $240$ g de beurre pour $8$ gâteaux.',
    },
  ],
  [
    {
      enonce:
        'Un robinet verse $10$ litres en $5$ minutes et $20$ litres en $10$ minutes.',
      grandeurs: ['volume', 'temps'],
      unites: ['L', 'minutes'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Un robinet verse $10$ litres en $5$ minutes et $15$ litres en $10$ minutes.',
      grandeurs: ['volume', 'temps'],
      unites: ['L', 'minutes'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le volume était proportionnel au temps, il serait de $20$ litres en $10$ minutes.',
    },
  ],
  [
    {
      enonce:
        'Un abonnement annuel au cinéma coûte $100$ €, quel que soit le nombre de séances.',
      grandeurs: ['nombre de séances', 'prix'],
      unites: ['séances', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Le prix ne dépend pas du nombre de séances, donc les grandeurs ne sont pas proportionnelles.',
    },
  ],
  [
    {
      enonce: 'Pour $6$ stylos, on paie $18$ €.',
      grandeurs: ['quantité', 'prix'],
      unites: ['stylos', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Pour $6$ stylos, on paie $18$ €. Pour $12$ stylos, on paie $36$ €.',
      grandeurs: ['quantité', 'prix'],
      unites: ['stylos', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Pour $6$ stylos, on paie $18$ €. Pour $12$ stylos, on paie $24$ €.',
      grandeurs: ['quantité', 'prix'],
      unites: ['stylos', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le prix était proportionnel à la quantité, on paierait $36$ € pour $12$ stylos.',
    },
  ],
  [
    {
      enonce: '$2$ kg de riz coûtent $6$ €.',
      grandeurs: ['masse', 'prix'],
      unites: ['kg', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce: '$2$ kg de riz coûtent $6$ €. $5$ kg coûtent $15$ €.',
      grandeurs: ['masse', 'prix'],
      unites: ['kg', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce: '$2$ kg de riz coûtent $6$ €. $5$ kg coûtent $10$ €.',
      grandeurs: ['masse', 'prix'],
      unites: ['kg', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le prix était proportionnel à la masse, $5$ kg coûteraient $15$ €.',
    },
  ],
  [
    {
      enonce:
        'Une trottinette électrique parcourt $20\\text{ km}$ en $1$ heure puis $40\\text{ km}$ en $2$ heures.',
      grandeurs: ['distance', 'temps'],
      unites: ['$\\text{km}$', 'heures'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Une trottinette électrique parcourt $20\\text{ km}$ en $1$ heure puis $50\\text{ km}$ en $2$ heures.',
      grandeurs: ['distance', 'temps'],
      unites: ['$\\text{km}$', 'heures'],
      estProportionnel: false,
      commentaireCorrection:
        'Si la distance était proportionnelle au temps, elle serait de $40\\text{ km}$ en $2$ heures.',
    },
  ],
  [
    {
      enonce:
        'Un bus transporte $40$ passagers en $2$ trajets et $60$ passagers en $3$ trajets.',
      grandeurs: ['nombre de trajets', 'nombre de passagers'],
      unites: ['trajets', 'passagers'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Un bus transporte $40$ passagers en $2$ trajets et $41$ passagers en $3$ trajets.',
      grandeurs: ['nombre de trajets', 'nombre de passagers'],
      unites: ['trajets', 'passagers'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le nombre de passagers était proportionnel au nombre de trajets, il y aurait $60$ passagers en $3$ trajets.',
    },
  ],
  [
    {
      enonce:
        'Un timbre coûte $1,40$ € pour une lettre qui pèse $20$ g et $2,80$ € pour une lettre qui pèse $40$ g.',
      grandeurs: ['poids', 'prix'],
      unites: ['g', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Un timbre coûte $1,40$ € pour une lettre qui pèse $20$ g et $2,80$ € pour une lettre qui pèse $100$ g.',
      grandeurs: ['poids', 'prix'],
      unites: ['g', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le prix était proportionnel au poids, une lettre de $100$ g coûterait $7,00$ €.',
    },
  ],
  [
    {
      enonce:
        'Un camion transporte $100$ kg en $2$ trajets et $300$ kg en $6$ trajets.',
      grandeurs: ['nombre de trajets', 'masse'],
      unites: ['trajets', 'kg'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Un camion transporte $100$ kg en $2$ trajets et $600$ kg en $6$ trajets.',
      grandeurs: ['nombre de trajets', 'masse'],
      unites: ['trajets', 'kg'],
      estProportionnel: false,
      commentaireCorrection:
        'Si la masse était proportionnelle au nombre de trajets, le camion transporterait $300$ kg en $6$ trajets.',
    },
  ],
  [
    {
      enonce: 'Pour $8$ crêpes, il faut $16$ cuillères de farine.',
      grandeurs: ['quantité', 'ingrédients'],
      unites: ['crêpes', 'cuillères'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
  ],
  [
    {
      enonce: 'Le cinéma offre $1$ place gratuite pour chaque billet acheté.',
      grandeurs: ['nombre de billets achetés', 'nombre de places gratuites'],
      unites: ['billets', 'places'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Le cinéma offre $1$ place gratuite tous les $10$ billets achetés.',
      grandeurs: ['nombre de billets achetés', 'nombre de places gratuites'],
      unites: ['billets', 'places'],
      estProportionnel: false,
      commentaireCorrection:
        "Le nombre de places gratuite n'est pas proportionnel au nombre de billets achetés car le cinéma offre $0$ place gratuite pour $9$ billets achetés, $1$ place gratuite pour $10$ billets achetés et toujours $1$ place gratuite pour $11$ billets achetés.",
    },
  ],
  [
    {
      enonce:
        'Une machine fabrique $40$ pièces en $2$ heures et $160$ pièces en $8$ heures.',
      grandeurs: ['temps de fabrication', 'nombre de pièces'],
      unites: ['heures', 'pièces'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Une machine fabrique $40$ pièces en $2$ heures et $400$ pièces en $8$ heures.',
      grandeurs: ['temps de fabrication', 'nombre de pièces'],
      unites: ['heures', 'pièces'],
      estProportionnel: false,
      commentaireCorrection:
        'Si le nombre de pièces était proportionnel au temps de fabrication, la machine fabriquerait $160$ pièces en $8$ heures.',
    },
  ],
  [
    {
      enonce:
        'Une location coûte $30$ € par jour plus $5$ € de charges par jour.',
      grandeurs: ['durée de la location', 'prix'],
      unites: ['jours', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce: 'Une location coûte $30$ € par jour plus $10$ € de caution fixe.',
      grandeurs: ['durée de la location', 'prix'],
      unites: ['jours', '€'],
      estProportionnel: false,
      commentaireCorrection:
        '$1$ jour de location coûte $40$ € mais $2$ jours de location coûtent $70$ €. Si le prix était proportionnel à la durée de la location, $2$ jours de location coûteraient $80$ €.',
    },
  ],
  [
    {
      enonce:
        'Une imprimante imprime $30$ pages en $3$ minutes et $50$ pages en $5$ minutes.',
      grandeurs: ['nombre de pages', 'temps'],
      unites: ['pages', 'minutes'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Une imprimante imprime $30$ pages en $3$ minutes et $60$ pages en $5$ minutes.',
      grandeurs: ['nombre de pages', 'temps'],
      unites: ['pages', 'minutes'],
      estProportionnel: false,
      commentaireCorrection:
        "Si le nombre de pages était proportionnel au temps, l'imprimante imprimerait $50$ pages en $5$ minutes.",
    },
  ],
  [
    {
      enonce:
        'Une maison garde une température de $20$ °C, quelle que soit la température extérieure.',
      grandeurs: ['température extérieure', 'température de la maison'],
      unites: ['°C', '°C'],
      estProportionnel: false,
      commentaireCorrection:
        'La température de la maison ne dépend pas de la température extérieure, donc les grandeurs ne sont pas proportionnelles.',
    },
  ],
  [
    {
      enonce:
        'Une fête coûte par invité $7$ € pour la nourriture plus $3$ € pour les boissons.',
      grandeurs: ['nombre d’invités', 'prix'],
      unites: ['invités', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce: 'Une fête coûte $50$ € plus $2$ € par invité.',
      grandeurs: ['nombre d’invités', 'prix'],
      unites: ['invités', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Une fête pour $1$ invité coûte $52$ € mais pour $2$ invités elle coûte $54$ €. Si le prix était proportionnel au nombre d’invités, une fête pour $2$ invités coûterait $104$ €.',
    },
  ],
  [
    {
      enonce: 'Avec $4$ litres de peinture, on couvre $20\\text{ m}^2$.',
      grandeurs: ['volume', 'surface'],
      unites: ['L', '$\\text{m}^2$'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Avec $4$ litres de peinture, on couvre $20\\text{ m}^2$. Avec $5$ litres, on couvre $25\\text{ m}^2$.',
      grandeurs: ['volume', 'surface'],
      unites: ['L', '$\\text{m}^2$'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Avec $4$ litres de peinture, on couvre $20\\text{ m}^2$. Avec $5$ litres, on couvre $30\\text{ m}^2$.',
      grandeurs: ['volume', 'surface'],
      unites: ['L', '$\\text{m}^2$'],
      estProportionnel: false,
      commentaireCorrection:
        'Si la surface était proportionnelle au volume, on couvrirait $25\\text{ m}^2$ avec $5$ litres de peinture.',
    },
  ],
  [
    {
      enonce: 'Une course avec $500$ participants commence à $8$ h.',
      grandeurs: ['nombre de participants', 'heure de début'],
      unites: ['participants', 'h'],
      estProportionnel: false,
      commentaireCorrection:
        "Le nombre de participants n'a pas d'influence sur l'heure de début, donc les grandeurs ne sont pas proportionnelles.",
    },
    {
      enonce: `Une course avec $500$ participants commence à $8$ h. Une course avec $${texNombre(1000)}$ participants commence à $10$ h.`,
      grandeurs: ['nombre de participants', 'heure de début'],
      unites: ['participants', 'h'],
      estProportionnel: false,
      commentaireCorrection:
        "Le nombre de participants n'a pas d'influence sur l'heure de début, donc les grandeurs ne sont pas proportionnelles.",
    },
  ],
  [
    {
      enonce: 'Une pizza coûte $3$ € par ingrédient.',
      grandeurs: ["nombre d'ingrédients", 'prix'],
      unites: ['ingrédients', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Une pizza coûte $12$ € plus $1$ € par ingrédient supplémentaire.',
      grandeurs: ["nombre d'ingrédients", 'prix'],
      unites: ['ingrédients', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Une pizza avec $1$ ingrédient coûte $13$ € mais avec $2$ ingrédients elle coûte $14$ €. Si le prix était proportionnel au nombre d’ingrédients, une pizza avec $2$ ingrédients coûterait $26$ €.',
    },
  ],
  [
    {
      enonce:
        'Un jeu-vidéo coûte $80$ € à sa sortie, puis $10$ € de moins chaque mois.',
      grandeurs: ['nombre de mois', 'prix'],
      unites: ['mois', '€'],
      estProportionnel: false,
      commentaireCorrection: '',
    },
    {
      enonce: 'Un jeu-vidéo coûte $50$ € plus $10$ € par extension.',
      grandeurs: ["nombre d'extensions", 'prix'],
      unites: ['extensions', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Un jeu-vidéo avec $1$ extension coûte $60$ € mais avec $2$ extensions il coûte $70$ €. Si le prix était proportionnel au nombre d’extensions, un jeu-vidéo avec $2$ extensions coûterait $120$ €.',
    },
  ],
  [
    {
      enonce: 'Un abonnement téléphonique coûte $15$ € par mois.',
      grandeurs: ["durée d'abonnement", 'prix'],
      unites: ['mois', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        "Un abonnement téléphonique coûte par mois $15$ € de base plus $5$ € pour l'option 5G.",
      grandeurs: ["durée d'abonnement", 'prix'],
      unites: ['mois', '€'],
      estProportionnel: true,
      commentaireCorrection: '',
    },
    {
      enonce:
        'Un abonnement téléphonique coûte $15$ € par mois plus $5$ € pour la carte SIM.',
      grandeurs: ["durée d'abonnement", 'prix'],
      unites: ['mois', '€'],
      estProportionnel: false,
      commentaireCorrection:
        'Un abonnement de $1$ mois coûte $20$ € mais un abonnement de $2$ mois coûte $35$ €. Si le prix était proportionnel à la durée d’abonnement, un abonnement de $2$ mois coûterait $40$ €.',
    },
  ],
]
