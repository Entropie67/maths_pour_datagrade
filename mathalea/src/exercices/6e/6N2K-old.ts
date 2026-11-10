import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes utilisant la division euclidienne'

// Gestion de la date de publication initiale
export const dateDePublication = '11/12/2023'
export const dateDeModifImportante = '16/04/2024'
export const interactifReady = true

/**
 * Résolution de problèmes utilisant la division Euclidienne
 * @author Mickael Guironnet
 * EE : Cet exercice est déréférencé car toutes les questions n'ont pas le même nb de champs-réponses et cela pose pb avec Capytale.
 * Cet exercice est maintenant découpé en 6N2K, 6N2K-1 et 6N2K-2.
 */

export const uuid = '88021'

export const refs = {
  'fr-fr': [''],
  'fr-2016': [''],
  'fr-ch': [''],
}
export default class QuestionsDivisionsEuclidiennesOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      "Nombres séparés par des tirets :\n1 : Bouquets de fleurs\n2 : Boîtes d'œufs\n3 : Trésor de pirates\n4 : Jour de semaine\n5 : Séjour au ski\n6 : Places de cinéma\n7 : Collier de perles\n8 : Timbres dans un album\n9 : Pirates et capitaine\n10 : Places assises\n11 : Mélange",
    ]

    this.nbQuestions = 4
    this.sup = 11
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre les problèmes suivants.'
        : 'Résoudre le problème suivant.'

    const questionsDisponibles = gestionnaireFormulaireTexte({
      min: 1,
      max: 10,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      melange: 11,
      saisie: this.sup,
    })
    let indiceInteractif = 0
    let indiceInteractifAvant = 0
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      indiceInteractifAvant = indiceInteractif
      let diviseur, quotient, reste, dividende
      switch (questionsDisponibles[i]) {
        case 1:
          // problème sur les bouquets
          diviseur = choice([7, 8, 9])
          quotient = randint(25, 36)
          reste = randint(2, 6)
          dividende = diviseur * quotient + reste
          texte = `Un paysagiste dispose de $${dividende}$ fleurs et souhaite réaliser des bouquets avec $${diviseur}$.`
          texte += `<br> ${numAlpha(0)} Combien de bouquets peut-il confectionner ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien manque-t-il de fleurs pour en réaliser un de plus ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Le paysagiste peut faire $${miseEnEvidence(quotient)}$ bouquets et il lui reste ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} fleurs.`
          texteCorr += `<br>${numAlpha(1)} Il reste $${reste}$ fleurs et il en faut $${diviseur}$ pour un bouquet.`
          texteCorr += `<br>$${diviseur} - ${reste} = ${diviseur - reste}$`
          texteCorr += `<br> Il manque donc $${miseEnEvidence(diviseur - reste)}$ fleurs pour faire un bouquet de plus.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: String(quotient) },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: String(diviseur - reste) },
          })
          indiceInteractif += 2
          break
        case 2:
          // problème sur les œufs
          diviseur = choice([6, 12])
          quotient = randint(25, 36)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          texte = `Un fermier ramasse $${dividende}$ œufs et souhaite les ranger dans des boîtes de $${diviseur}$.`
          texte += `<br> ${numAlpha(0)} Combien de boîtes remplies entièrement faudra-t-il ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien manque-t-il d'œufs pour en remplir une de plus ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Il lui faudra $${miseEnEvidence(quotient)}$ boîtes et il restera ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} œufs.`
          texteCorr += `<br>${numAlpha(1)} Il reste $${reste}$ œufs et il en faut $${diviseur}$ pour une boîte.`
          texteCorr += `<br>$${diviseur} - ${reste} = ${diviseur - reste}$`
          texteCorr += `<br>Il lui manquera $${miseEnEvidence(diviseur - reste)}$ œufs pour en remplir une de plus.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: String(quotient) },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: String(diviseur - reste) },
          })
          indiceInteractif += 2
          break
        case 3:
          // problème sur le partage d'un trésor
          diviseur = choice([7, 12], [10])
          quotient = randint(101, 500)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          texte = `$${diviseur}$ pirates veulent se partager équitablement le trésor comprenant $${texNombre(dividende)}$ pièces d'or.`
          texte += ` <br>${numAlpha(0)} Combien de pièces chaque pirate aura-t-il ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += ` <br>${numAlpha(1)} Combien restera-t-il de pièces ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque pirate aura $${miseEnEvidence(quotient)}$ pièces.`
          texteCorr += `<br>${numAlpha(1)} Il restera $${miseEnEvidence(reste)}$ pièces d'or.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: quotient },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: reste },
          })
          indiceInteractif += 2
          break
        case 4: {
          // problème sur le jour de semaine
          diviseur = 7
          quotient = randint(11, 19)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          const table = [
            'lundi',
            'mardi',
            'mercredi',
            'jeudi',
            'vendredi',
            'samedi',
            'dimanche',
          ]
          const jour = randint(0, 6)
          texte = `Aujourd'hui, nous sommes ${table[jour]}. Dans ${dividende} jours, quel jour de la semaine serons-nous ?`
          this.autoCorrection[indiceInteractif] = {}
          const autoCorr = this.autoCorrection[indiceInteractif]
          autoCorr.propositions = []
          for (let ee = 0; ee < 7; ee++) {
            autoCorr.propositions[ee] = {
              texte: table[ee],
              statut: (jour + reste) % diviseur === ee,
            }
          }
          this.autoCorrection[indiceInteractif].options = {
            ordered: true,
          }
          texte += '<br>' + propositionsQcm(this, indiceInteractif).texte

          texteCorr = `Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Il se sera écoulé ${texteEnCouleurEtGras(`$\\mathbf{${quotient}}$`, bleuMathalea)} semaines complètes et ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} jours.`
          texteCorr += `<br>Donc nous serons ${reste} jours de plus que ${table[jour]}, soit ${texteEnCouleurEtGras(table[(jour + reste) % diviseur])}.`
          indiceInteractif++
          break
        }
        case 5: {
          // problème sur le séjour au ski
          const prixForfait = randint(35, 39)
          const prixHotel = randint(25, 30)
          const nbJour = randint(5, 12)
          const nbAmis = randint(3, 5)
          const prixHotelTotal = prixHotel * nbJour * nbAmis
          const prixForfaitTotal = prixForfait * nbJour * nbAmis
          diviseur = nbAmis
          dividende = prixHotelTotal + prixForfaitTotal
          texte = `$${nbAmis}$ amis partent $${nbJour}$ jours au ski. Ils dépensent $${texNombre(prixHotelTotal)}$ € d'hôtels et $${texNombre(prixForfaitTotal)}$ € pour les remontées mécaniques.`
          texte += `<br>${numAlpha(0)} Quel est le prix total depensé ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Quel est le prix dépensé par personne ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `Effectuons l'addition de $${prixForfait}$ et $${prixHotel}$. <br>`
          texteCorr += operation({
            operande1: prixHotelTotal,
            operande2: prixForfaitTotal,
            type: 'addition',
          })
          texteCorr += `<br>Ces $${nbAmis}$ amis ont dépensé au total $${miseEnEvidence(texNombre(prixHotelTotal + prixForfaitTotal))}$ €.<br>`
          texteCorr += `<br>${numAlpha(1)} Posons la division euclidienne de $${texNombre(prixHotelTotal + prixForfaitTotal)}$ par $${nbAmis}$. <br>`
          texteCorr +=
            operation({
              operande1: prixHotelTotal + prixForfaitTotal,
              operande2: nbAmis,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(prixHotelTotal + prixForfaitTotal)}=${nbAmis}\\times${texNombre((prixHotel + prixForfait) * nbJour)}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque personne a dépensé $${miseEnEvidence(texNombre((prixHotel + prixForfait) * nbJour))}$ €.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: prixHotelTotal + prixForfaitTotal },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: (prixHotel + prixForfait) * nbJour },
          })
          indiceInteractif += 2
          break
        }
        case 6: {
          // problème sur le cinéma
          const nbPlacesPetiteSalles = randint(50, 80)
          const nbPetiteSalles = randint(2, 3)
          const nbGrandeSalles = randint(3, 4)
          const nb = randint(3, 4) // nombre de fois plus grand que la petite salle.
          diviseur = nbGrandeSalles * nb + nbPetiteSalles
          dividende =
            nbPlacesPetiteSalles * nbPetiteSalles +
            nbGrandeSalles * nb * nbPlacesPetiteSalles
          texte = `Dans un cinéma, il y a $${nbPetiteSalles + nbGrandeSalles}$ salles dont $${nbGrandeSalles}$ grandes salles et $${nbPetiteSalles}$ petites salles. Il y a $${nb}$ fois moins de places assises dans les petites salles que les grandes salles. Au total, dans ce cinéma, il y a $${texNombre(nbPlacesPetiteSalles * nbPetiteSalles + nbGrandeSalles * nb * nbPlacesPetiteSalles)}$ places`
          texte += `<br>${numAlpha(0)} Quel est le nombre de places dans une petite salle ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Quel est le nombre de places dans une grande salle ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Puisqu'il y a $${nb}$ fois moins de places assises dans les petites salles que les grandes salles, alors $1$ grande salle correspond à $${nb}$ petites salles. <br>`
          texteCorr += `Et ainsi, $${nbGrandeSalles}$ grandes salles correspondent à $${nbGrandeSalles * nb}$ petites salles car $${nbGrandeSalles} \\times ${nb} = ${nbGrandeSalles * nb}$.<br>`
          texteCorr += `Donc, c'est comme si le cinéma contenait $${nbGrandeSalles * nb}$ petites salles + $${nbPetiteSalles}$ petites salles, soit $${nbGrandeSalles * nb + nbPetiteSalles}$ petites salles.<br>`
          texteCorr += `Posons la division euclidienne de $${texNombre(nbPlacesPetiteSalles * nbPetiteSalles + nbGrandeSalles * nb * nbPlacesPetiteSalles)}$ par $${nbGrandeSalles * nb + nbPetiteSalles}$. <br>`
          texteCorr +=
            operation({
              operande1:
                nbPlacesPetiteSalles * nbPetiteSalles +
                nbGrandeSalles * nb * nbPlacesPetiteSalles,
              operande2: nbGrandeSalles * nb + nbPetiteSalles,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPlacesPetiteSalles * nbPetiteSalles + nbGrandeSalles * nb * nbPlacesPetiteSalles)}=${nbGrandeSalles * nb + nbPetiteSalles}\\times${texNombre(nbPlacesPetiteSalles)}`, bleuMathalea)}$`
          texteCorr += `<br>Il y a $${miseEnEvidence(nbPlacesPetiteSalles)}$ places dans une petite salle.`
          texteCorr += `<br>${numAlpha(1)} $${nbPlacesPetiteSalles} \\times ${nb} = ${nbPlacesPetiteSalles * nb}$ places`
          texteCorr += `<br>Il y a $${miseEnEvidence(nbPlacesPetiteSalles * nb)}$ places dans une grande salle.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: nbPlacesPetiteSalles },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: nbPlacesPetiteSalles * nb },
          })
          indiceInteractif += 2
          break
        }
        case 7: {
          // problème sur perle d'un colis
          const nbPerlesJaune = randint(4, 9)
          const nbPerlesRouge = randint(4, 9, [nbPerlesJaune])
          const nbColliers = randint(22, 38)
          const plus = choice([false, true])
            ? [0, randint(10, 25)]
            : [randint(10, 25), 0]
          const nbPerlesJauneTotal = nbPerlesJaune * nbColliers + plus[0]
          const nbPerlesRougeTotal = nbPerlesRouge * nbColliers + plus[1]
          const nbColliersRouge = Math.floor(nbPerlesRougeTotal / nbPerlesRouge)
          const nbColliersJaune = Math.floor(nbPerlesJauneTotal / nbPerlesJaune)
          diviseur = nbColliers
          dividende = nbPerlesJauneTotal
          texte = `Un bijoutier fabrique des colliers avec des perles. Il décide de mettre $${nbPerlesJaune}$ perles jaunes et $${nbPerlesRouge}$ perles rouges par collier. Il possède $${nbPerlesRougeTotal}$ perles rouges et $${nbPerlesJauneTotal}$ perles jaunes.`
          texte += `<br>${numAlpha(0)} Combien pourra-t-il fabriquer de colliers ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien lui restera-t-il de perles jaunes ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(2)} Combien lui restera-t-il de perles rouges ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 2,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${texNombre(nbPerlesJauneTotal)}$ par $${nbPerlesJaune}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPerlesJauneTotal,
              operande2: nbPerlesJaune,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPerlesJauneTotal)}=${nbPerlesJauneTotal - nbPerlesJaune * nbColliersJaune === 0 ? `${nbPerlesJaune}\\times${texNombre(nbColliersJaune)}` : `(${nbPerlesJaune}\\times${texNombre(nbColliersJaune)})+ ${nbPerlesJauneTotal - nbPerlesJaune * nbColliersJaune}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il peut faire $${miseEnEvidence(texNombre(nbColliersJaune), bleuMathalea)}$ colliers avec les perles jaunes.`
          texteCorr += `<br>Posons la division euclidienne de $${texNombre(nbPerlesRougeTotal)}$ par $${nbPerlesRouge}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPerlesRougeTotal,
              operande2: nbPerlesRouge,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPerlesRougeTotal)}=${nbPerlesRougeTotal - nbPerlesRouge * nbColliersRouge === 0 ? `${nbPerlesRouge}\\times${texNombre(nbColliersRouge)}` : `(${nbPerlesRouge}\\times${texNombre(nbColliersRouge)})+ ${nbPerlesRougeTotal - nbPerlesRouge * nbColliersRouge}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il peut faire $${miseEnEvidence(texNombre(nbColliersRouge), bleuMathalea)}$ colliers avec les perles rouges.`
          texteCorr += `<br>Finalement, en prenant en compte les deux couleurs, et puisque $${texNombre(Math.min(nbColliersRouge, nbColliersJaune))}$ < $${texNombre(Math.max(nbColliersRouge, nbColliersJaune))}$, le bijoutier ne pourra faire que $${miseEnEvidence(texNombre(Math.min(nbColliersRouge, nbColliersJaune)))}$ colliers.`
          texteCorr += `<br>${numAlpha(1)} $${nbPerlesJauneTotal} - (${nbPerlesJaune} \\times ${Math.min(nbColliersRouge, nbColliersJaune)})=${miseEnEvidence(String(nbPerlesJauneTotal - nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune)))}$`
          texteCorr +=
            nbPerlesJauneTotal -
              nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune) ===
            0
              ? '<br>Il ne restera aucune perle jaune.'
              : `<br>Il restera $${miseEnEvidence(String(nbPerlesJauneTotal - nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune)))}$ perles jaunes.`
          texteCorr += `<br>${numAlpha(2)} $${nbPerlesRougeTotal} - (${nbPerlesRouge} \\times ${Math.min(nbColliersRouge, nbColliersJaune)})=${miseEnEvidence(String(nbPerlesRougeTotal - nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune)))}$`
          texteCorr +=
            nbPerlesRougeTotal -
              nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune) ===
            0
              ? '<br>Il ne restera aucune perle rouge.'
              : `<br>Il restera $${miseEnEvidence(String(nbPerlesRougeTotal - nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune)))}$ perles rouges.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: Math.min(nbColliersRouge, nbColliersJaune) },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: {
              value:
                nbPerlesJauneTotal -
                nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune),
            },
          })
          handleAnswers(this, indiceInteractif + 2, {
            reponse: {
              value:
                nbPerlesRougeTotal -
                nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune),
            },
          })
          indiceInteractif += 3
          break
        }
        case 8: {
          // problème sur les timbres
          const nbTimbresParPage = randint(8, 15)
          const nbPages = randint(22, 38)
          reste = randint(2, nbTimbresParPage - 1)
          const nbTimbres = nbTimbresParPage * nbPages + reste
          diviseur = nbTimbresParPage
          dividende = nbTimbres
          texte = `Dans sa collection, ${prenomM()} possède $${nbTimbres}$ timbres et souhaite les ranger dans un album qui peut contenir $${nbTimbresParPage}$ timbres par page.`
          texte += `<br>${numAlpha(0)} De combien de pages aura-t-il besoin pour ranger tous ses timbres ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien de timbres y aura-t-il sur la dernière page ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${texNombre(nbTimbres)}$ par $${nbTimbresParPage}$. <br>`
          texteCorr +=
            operation({
              operande1: nbTimbres,
              operande2: nbTimbresParPage,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbTimbres)}=(${nbTimbresParPage}\\times${texNombre(nbPages)})${nbTimbres - nbTimbresParPage * nbPages === 0 ? '' : `+ ${nbTimbres - nbTimbresParPage * nbPages}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il y aura $${miseEnEvidence(texNombre(nbPages), bleuMathalea)}$ pages remplies et une page avec $${miseEnEvidence(texNombre(reste), bleuMathalea)}$ timbres. Donc au total, il faudra $${miseEnEvidence(texNombre(nbPages + 1))}$ pages.`
          texteCorr += `<br>${numAlpha(1)} Comme l'indique la division euclidienne ci-dessus, il y aura $${miseEnEvidence(texNombre(reste))}$ timbres sur la dernière page.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: nbPages + 1 },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: reste },
          })
          indiceInteractif += 2
          break
        }
        case 9: {
          // problème sur les pirates et le capitaine
          const nbPirates = randint(12, 18)
          const nbPiecesParPirate = randint(5, nbPirates - 5)
          reste = randint(nbPirates - 4, nbPirates - 1)
          diviseur = nbPirates
          dividende = nbPirates * nbPiecesParPirate + reste
          texte = `Une bande de ${nbPirates} pirates et leur capitaine doivent se partager un trésor de ${dividende} pièces d'or. Le capitaine dit à ses hommes : «${sp()}Vous avez bien travaillé, partagez-vous le trésor, je me contenterai
          du reste.${sp()}» <br> Le capitaine est-il vraiment généreux ?`
          texte += `<br>${numAlpha(0)} Combien de pièces aura chaque pirate ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien de pièces aura le capitaine ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(nbPiecesParPirate)}) + ${reste}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque pirate aura $${miseEnEvidence(texNombre(nbPiecesParPirate))}$ pièces.`
          texteCorr += `<br>${numAlpha(1)} Comme l'indique la division euclidienne ci-dessus, le capitaine aura $${miseEnEvidence(texNombre(reste))}$ pièces et il aura le plus de pièces.`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: nbPiecesParPirate },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: reste },
          })
          indiceInteractif += 2
          break
        }
        case 10:
        default: {
          // problème sur les places assises
          let nbPlaces1ParRangée,
            nbPlaces2ParRangée,
            nbPersonnes,
            nbRangée1,
            nbRangée2,
            reste1,
            reste2
          do {
            nbPlaces1ParRangée = choice([8, 9, 12, 15])
            nbPlaces2ParRangée = choice([8, 9, 12, 15], [nbPlaces1ParRangée])
            nbPersonnes = randint(100, 200)
            nbRangée1 = Math.floor(nbPersonnes / nbPlaces1ParRangée)
            nbRangée2 = Math.floor(nbPersonnes / nbPlaces2ParRangée)
            reste1 = nbPersonnes - nbRangée1 * nbPlaces1ParRangée
            reste2 = nbPersonnes - nbRangée2 * nbPlaces2ParRangée
          } while (
            reste1 < 2 ||
            reste2 < 2 ||
            reste1 === nbPlaces1ParRangée - 1 ||
            reste2 === nbPlaces2ParRangée - 1 ||
            nbPlaces2ParRangée - reste2 === nbPlaces1ParRangée - reste1
          )
          diviseur = nbRangée1
          dividende = nbPersonnes
          texte = `Pour un spectacle, les organisateurs doivent accueillir $${nbPersonnes}$ personnes. Ils hésitent sur la disposition de la salle : soit mettre $${nbPlaces1ParRangée}$ places par rangée, soit $${nbPlaces2ParRangée}$ places par rangée. Ils décident de choisir la configuration où il y aura le moins de places vides.`
          texte += `<br>${numAlpha(0)} Combien de places vont-ils choisir par rangée ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
          )
          texte += `<br> ${numAlpha(1)} Combien de rangées vont-ils prévoir ?`
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
          )
          texteCorr = `${numAlpha(0)} Posons la division euclidienne de $${texNombre(nbPersonnes)}$ par $${nbPlaces1ParRangée}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPersonnes,
              operande2: nbPlaces1ParRangée,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPersonnes)}=(${nbPlaces1ParRangée}\\times${texNombre(nbRangée1)}) + ${reste1}`, bleuMathalea)}$`
          texteCorr += `<br> Avec $${nbPlaces1ParRangée}$ places par rangée, il y aura $${nbRangée1}$ rangées remplies et une dernière avec $${reste1}$ places occupées et ${texteEnCouleurEtGras(`$\\mathbf{${nbPlaces1ParRangée - reste1}}$`, bleuMathalea)} places libres.`
          texteCorr += `<br> <br> Posons la division euclidienne de $${texNombre(nbPersonnes)}$ par $${nbPlaces2ParRangée}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPersonnes,
              operande2: nbPlaces2ParRangée,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPersonnes)}=(${nbPlaces2ParRangée}\\times${texNombre(nbRangée2)}) + ${reste2}`, bleuMathalea)}$`
          texteCorr += `<br> Avec $${nbPlaces2ParRangée}$ places par rangée, il y aura $${nbRangée2}$ rangées remplies et une dernière avec $${reste2}$ places occupées et ${texteEnCouleurEtGras(`$\\mathbf{${nbPlaces2ParRangée - reste2}}$`, bleuMathalea)} places libres.`
          texteCorr += `<br> <br> Comme $${Math.min(nbPlaces2ParRangée - reste2, nbPlaces1ParRangée - reste1)} < ${Math.max(nbPlaces2ParRangée - reste2, nbPlaces1ParRangée - reste1)}$,
           alors pour avoir le moins de places libres, les organisateurs vont préférer $${miseEnEvidence(String(nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbPlaces2ParRangée : nbPlaces1ParRangée))}$ places par rangée.`
          texteCorr += `<br>${numAlpha(1)} Comme l'indique la division euclidienne ci-dessus, il y aura $${nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbRangée2 : nbRangée1}$ rangées remplies et $1$ rangée avec $${nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? reste2 : reste1}$ places occupées, soit $${miseEnEvidence(String(nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbRangée2 + 1 : nbRangée1 + 1))}$ rangées au total.`
          handleAnswers(this, indiceInteractif, {
            reponse: {
              value:
                nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1
                  ? nbPlaces2ParRangée
                  : nbPlaces1ParRangée,
            },
          })
          handleAnswers(this, indiceInteractif + 1, {
            reponse: {
              value:
                nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1
                  ? nbRangée2 + 1
                  : nbRangée1 + 1,
            },
          })
          indiceInteractif += 2
          break
        }
      }
      if (this.questionJamaisPosee(i, dividende, diviseur)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      } else indiceInteractif = indiceInteractifAvant
      cpt++
    } // fin du for

    listeQuestionsToContenu(this)
  }
}
