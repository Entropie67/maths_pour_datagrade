import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Estimer un ordre de grandeur dans une situation concrète'
export const dateDePublication = '29/08/2026'
export const uuid = '2a0d8'
export const refs = {
  'fr-fr': ['2N14-6'],
  'fr-ch': [],
}
export const interactifReady = true

type Situation = {
  enonce: string
  affirmation: string
  calculExact: string
  calculApproche: string
  cle: string
}

/**
 * @author Stéphane Guyon
 */
export default class OrdresDeGrandeurSituationsConcretes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      "Dans chaque situation, estimer un ordre de grandeur de la quantité demandée, puis dire si l'affirmation est vraisemblable. Justifier."
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeSituations = combinaisonListes(
      [1, 2, 3, 4, 5, 6],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const affirmationVraie = choice([true, false])
      const situation = this.genereSituation(
        typesDeSituations[i],
        affirmationVraie,
      )
      const texteAffirmation = `${situation.enonce}<br>${situation.affirmation}<br><b>Cette affirmation est-elle vraisemblable ? Justifier.</b>`
      const propositions = [
        { texte: 'Oui', statut: affirmationVraie },
        { texte: 'Non', statut: !affirmationVraie },
      ]
      const qcmOptions = { radio: true, vertical: false }

      let texteCorr = `Nous allons travailler avec des ordres de grandeur afin d'avoir une idée de la crédibilité de l'affirmation.<br>${situation.calculApproche}.<br>`
      texteCorr += affirmationVraie
        ? `Ainsi, l'affirmation est vraisemblable. La réponse est ${texteEnCouleurEtGras('Oui')}.`
        : `Ainsi, l'affirmation n'est pas vraisemblable. La réponse est ${texteEnCouleurEtGras('Non')}.`
      texteCorr += `<br>À titre de vérification, le calcul avec les données de l'énoncé donne : ${situation.calculExact}.`

      if (this.questionJamaisPosee(i, situation.cle)) {
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texteAffirmation,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )

        let texte = texteAffirmation
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  private genereSituation(type: number, affirmationVraie: boolean): Situation {
    switch (type) {
      case 1: {
        const vehicules = 50000 + randint(-20, 20) * 500
        const estimation = 350000
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Une autoroute est empruntée par environ $${texNombre(vehicules)}$ véhicules par jour.`,
          affirmation: `Un article affirme qu'environ $${texNombre(annonce)}$ véhicules l'empruntent en une semaine.`,
          calculApproche: `$${texNombre(vehicules)}\\approx 50\\,000$.<br>Comme $50\\,000\\times 7=${texNombre(estimation)}$, alors le nombre de véhicules est de l'ordre de $${texNombre(estimation)}$ par semaine`,
          calculExact: `$${texNombre(vehicules)}\\times 7=${texNombre(vehicules * 7)}$ véhicules`,
          cle: `${type}-${vehicules}-${annonce}`,
        }
      }
      case 2: {
        const objets = 100000 + randint(-20, 20) * 500
        const estimation = 5000
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Une entreprise, ouverte $5$ jours par semaine, fabrique environ $${texNombre(objets)}$ objets en quatre semaines.`,
          affirmation: `Sa directrice affirme que l'entreprise produit environ $${texNombre(annonce)}$ objets par jour d'ouverture.`,
          calculApproche: `$${texNombre(objets)}\\approx 100\\,000$ et $4\\times 5=20$.<br>Comme $100\\,000\\div 20=${texNombre(estimation)}$, alors la production est de l'ordre de $${texNombre(estimation)}$ objets par jour d'ouverture`,
          calculExact: `$${texNombre(objets)}\\div 20=${texNombre(objets / 20)}$ objets par jour`,
          cle: `${type}-${objets}-${annonce}`,
        }
      }
      case 3: {
        const personnes = 2000 + randint(-10, 10) * 20
        const litres = choice([9, 11])
        const estimationLitres = 20000
        const estimation = 20
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Lors d'une traversée, un paquebot accueille $${texNombre(personnes)}$ personnes. Chacune utilise environ $${litres}$ litres d'eau douce par jour.`,
          affirmation: `Le commandant estime que le navire utilise environ $${texNombre(annonce)}\\ \\text{m}^3$ d'eau douce par jour.`,
          calculApproche: `$${texNombre(personnes)}\\approx 2\\,000$ et $${litres}\\approx 10$.<br>Comme $2\\,000\\times 10=${texNombre(estimationLitres)}$, alors la consommation est de l'ordre de $${texNombre(estimationLitres)}$ L, soit $${estimation}\\ \\text{m}^3$`,
          calculExact: `$${texNombre(personnes)}\\times ${litres}=${texNombre(personnes * litres)}$ L, soit $${texNombre((personnes * litres) / 1000)}\\ \\text{m}^3$`,
          cle: `${type}-${personnes}-${litres}-${annonce}`,
        }
      }
      case 4: {
        const exemplaires = 2000 + randint(-20, 20) * 10
        const pages = 500 + randint(-10, 10) * 5
        const estimation = 1000000
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Une maison d'édition imprime $${texNombre(exemplaires)}$ exemplaires d'un roman de $${texNombre(pages)}$ pages.`,
          affirmation: `L'imprimeur annonce qu'il faudra environ $${texNombre(annonce)}$ pages de papier.`,
          calculApproche: `$${texNombre(exemplaires)}\\approx 2\\,000$ et $${texNombre(pages)}\\approx 500$.<br>Comme $2\\,000\\times 500=${texNombre(estimation)}$, alors il faut de l'ordre de $${texNombre(estimation)}$ pages`,
          calculExact: `$${texNombre(exemplaires)}\\times ${texNombre(pages)}=${texNombre(exemplaires * pages)}$ pages`,
          cle: `${type}-${exemplaires}-${pages}-${annonce}`,
        }
      }
      case 5: {
        const spectateurs = 20000 + randint(-20, 20) * 100
        const boissons = choice([2, 3])
        const estimation = boissons * 20000
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Un festival attend $${texNombre(spectateurs)}$ spectateurs. Les organisateurs prévoient en moyenne $${boissons}$ boissons par personne.`,
          affirmation: `Ils commandent environ $${texNombre(annonce)}$ boissons pour le festival.`,
          calculApproche: `$${texNombre(spectateurs)}\\approx 20\\,000$.<br>Comme $20\\,000\\times ${boissons}=${texNombre(estimation)}$, alors il faut de l'ordre de $${texNombre(estimation)}$ boissons`,
          calculExact: `$${texNombre(spectateurs)}\\times ${boissons}=${texNombre(spectateurs * boissons)}$ boissons`,
          cle: `${type}-${spectateurs}-${boissons}-${annonce}`,
        }
      }
      case 6:
      default: {
        const colis = 10000 + randint(-20, 20) * 50
        const masse = 20 + randint(-4, 4)
        const masseApprochee = Math.round(masse / 5) * 5
        const estimationKg = 10000 * masseApprochee
        const estimation = estimationKg / 1000
        const annonce = affirmationVraie ? estimation : estimation * 10
        return {
          enonce: `Une plateforme logistique doit expédier $${texNombre(colis)}$ colis dont la masse moyenne est de $${masse}$ kg.`,
          affirmation: `Le responsable affirme que la masse totale à transporter est d'environ $${texNombre(annonce)}$ tonnes.`,
          calculApproche: `$${texNombre(colis)}\\approx 10\\,000$ et $${masse}\\approx ${masseApprochee}$.<br>Comme $10\\,000\\times ${masseApprochee}=${texNombre(estimationKg)}$, alors la masse est de l'ordre de $${texNombre(estimationKg)}$ kg, soit $${estimation}$ tonnes`,
          calculExact: `$${texNombre(colis)}\\times ${masse}=${texNombre(colis * masse)}$ kg, soit $${texNombre((colis * masse) / 1000)}$ tonnes`,
          cle: `${type}-${colis}-${masse}-${annonce}`,
        }
      }
    }
  }
}
