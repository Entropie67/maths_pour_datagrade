import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Résoudre des problèmes utilisant la division euclidienne ($2$)'

// Gestion de la date de publication initiale
export const dateDePublication = '11/12/2023'
export const dateDeModifImportante = '09/01/2025'
export const interactifReady = true

/**
 * Résolution de problèmes utilisant la division Euclidienne
 * @author Mickael Guironnet
 */

export const uuid = '6d183'

export const refs = {
  'fr-fr': ['6N2K-1'],
  'fr-2016': ['6C12-2'],
  'fr-ch': ['9R1NO1E-13', '9R2NO1E-13', '9R3NO1E-13'], // Primaire anciennement :['9NO16-1'],
}
export default class QuestionsDivisionsEuclidiennes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      "Nombres séparés par des tirets :\n1 : Bouquets de fleurs\n2 : Boîtes d'œufs\n3 : Trésor de pirates\n4 : Séjour au ski\n5 : Places de cinéma\n6 : Timbres dans un album\n7 : Pirates et capitaine\n8 : Places assises\n9 : Mélange",
    ]

    this.nbQuestions = 4
    this.sup = 9
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
      max: 8,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      melange: 9,
      saisie: this.sup,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let diviseur, quotient, reste, dividende
      let chainePourQuestions = ''
      let reponse1 = ''
      let reponse2 = ''
      switch (questionsDisponibles[i]) {
        case 1:
          // problème sur les bouquets
          diviseur = choice([7, 8, 9])
          quotient = randint(25, 36)
          reste = randint(2, 6)
          dividende = diviseur * quotient + reste
          texte = `Un paysagiste dispose de $${dividende}$ fleurs et souhaite réaliser des bouquets avec $${diviseur}$ fleurs.`
          chainePourQuestions += `a) Combien de bouquets peut-il confectionner ? %{champ1} \n`
          chainePourQuestions += `b) Combien manque-t-il de fleurs pour en réaliser un de plus ? %{champ2} \n`
          texteCorr = `a) Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Le paysagiste peut faire $${miseEnEvidence(quotient)}$ bouquets et il lui reste ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} fleurs.`
          texteCorr += `<br>b) Il reste $${reste}$ fleurs et il en faut $${diviseur}$ pour un bouquet.`
          texteCorr += `<br>$${diviseur} - ${reste} = ${diviseur - reste}$`
          texteCorr += `<br> Il manque donc $${miseEnEvidence(diviseur - reste)}$ fleurs pour faire un bouquet de plus.`

          reponse1 = texNombre(quotient, 0) // String(quotient)
          reponse2 = texNombre(diviseur - reste, 0)
          break
        case 2:
          // problème sur les œufs
          diviseur = choice([6, 12])
          quotient = randint(25, 36)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          texte = `Un fermier ramasse $${dividende}$ œufs et souhaite les ranger dans des boîtes de $${diviseur}$.`
          chainePourQuestions += `a) Combien de boîtes remplies entièrement faudra-t-il ? %{champ1} \n`
          chainePourQuestions += `b) Combien manque-t-il d'œufs pour en remplir une de plus ? %{champ2} \n`
          texteCorr = `a) Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Il lui faudra $${miseEnEvidence(quotient)}$ boîtes et il restera ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} œufs.`
          texteCorr += `<br>b) Il reste $${reste}$ œufs et il en faut $${diviseur}$ pour une boîte.`
          texteCorr += `<br>$${diviseur} - ${reste} = ${diviseur - reste}$`
          texteCorr += `<br>Il lui manquera $${miseEnEvidence(diviseur - reste)}$ œufs pour en remplir une de plus.`
          reponse1 = texNombre(quotient, 0) // String(quotient)
          reponse2 = texNombre(diviseur - reste, 0)
          break
        case 3:
          // problème sur le partage d'un trésor
          diviseur = choice([7, 12], [10])
          quotient = randint(101, 500)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          texte = `$${diviseur}$ pirates veulent se partager équitablement le trésor comprenant $${texNombre(dividende)}$ pièces d'or.`
          chainePourQuestions += `a) Combien de pièces chaque pirate aura-t-il ? %{champ1} \n`
          chainePourQuestions += `b) Combien restera-t-il de pièces ? %{champ2} \n`
          texteCorr = `a) Posons la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque pirate aura $${miseEnEvidence(quotient)}$ pièces.`
          texteCorr += `<br>b) Il restera $${miseEnEvidence(reste)}$ pièces d'or.`
          reponse1 = texNombre(quotient, 0)
          reponse2 = texNombre(reste, 0)
          break
        case 4: {
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
          chainePourQuestions += `a) Quel est le prix total dépensé ? %{champ1} \n`
          chainePourQuestions += `b) Quel est le prix dépensé par personne ? %{champ2} \n`
          texteCorr = `Effectuons l'addition de $${prixForfait}$ et $${prixHotel}$. <br>`
          texteCorr += operation({
            operande1: prixHotelTotal,
            operande2: prixForfaitTotal,
            type: 'addition',
            options: { solution: true, colore: bleuMathalea },
          })
          texteCorr += `<br>Ces $${nbAmis}$ amis ont dépensé au total $${miseEnEvidence(texNombre(prixHotelTotal + prixForfaitTotal))}$ €.<br>`
          texteCorr += `<br>b) Posons la division euclidienne de $${texNombre(prixHotelTotal + prixForfaitTotal)}$ par $${nbAmis}$. <br>`
          texteCorr +=
            operation({
              operande1: prixHotelTotal + prixForfaitTotal,
              operande2: nbAmis,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(prixHotelTotal + prixForfaitTotal)}=${nbAmis}\\times${texNombre((prixHotel + prixForfait) * nbJour)}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque personne a dépensé $${miseEnEvidence(texNombre((prixHotel + prixForfait) * nbJour))}$ €.`
          reponse1 = texNombre(prixHotelTotal + prixForfaitTotal, 0)
          reponse2 = texNombre((prixHotel + prixForfait) * nbJour, 0)
          break
        }
        case 5: {
          // problème sur le cinéma
          const nbPlacesPetiteSalles = randint(50, 80)
          const nbPetiteSalles = randint(2, 3)
          const nbGrandeSalles = randint(3, 4)
          const nb = randint(3, 4) // nombre de fois plus grand que la petite salle.
          diviseur = nbGrandeSalles * nb + nbPetiteSalles
          dividende =
            nbPlacesPetiteSalles * nbPetiteSalles +
            nbGrandeSalles * nb * nbPlacesPetiteSalles
          texte = `Dans un cinéma, il y a ${nbPetiteSalles + nbGrandeSalles} salles dont ${nbGrandeSalles} grandes salles et ${nbPetiteSalles} petites salles. Il y a ${nb} fois moins de places assises dans les petites salles que les grandes salles. Au total, dans ce cinéma, il y a $${texNombre(nbPlacesPetiteSalles * nbPetiteSalles + nbGrandeSalles * nb * nbPlacesPetiteSalles)}$ places`
          chainePourQuestions += `a) Quel est le nombre de places dans une petite salle ? %{champ1} \n`
          chainePourQuestions += `b) Quel est le nombre de places dans une grande salle ? %{champ2} \n`
          texteCorr = `a) Puisqu'il y a ${nb} fois moins de places assises dans les petites salles que les grandes salles, alors $1$ grande salle correspond à $${nb}$ petites salles. <br>`
          texteCorr += `Et ainsi, ${nbGrandeSalles} grandes salles correspondent à ${nbGrandeSalles * nb} petites salles car $${nbGrandeSalles} \\times ${nb} = ${nbGrandeSalles * nb}$.<br>`
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
          texteCorr += `<br>b) $${nbPlacesPetiteSalles} \\times ${nb} = ${nbPlacesPetiteSalles * nb}$ places`
          texteCorr += `<br>Il y a $${miseEnEvidence(nbPlacesPetiteSalles * nb)}$ places dans une grande salle.`
          reponse1 = texNombre(nbPlacesPetiteSalles, 0)
          reponse2 = texNombre(nbPlacesPetiteSalles * nb, 0)
          break
        }
        case 6: {
          // problème sur les timbres
          const nbTimbresParPage = randint(8, 15)
          const nbPages = randint(22, 38)
          reste = randint(2, nbTimbresParPage - 1)
          const nbTimbres = nbTimbresParPage * nbPages + reste
          diviseur = nbTimbresParPage
          dividende = nbTimbres
          texte = `Dans sa collection, ${prenomM()} possède $${nbTimbres}$ timbres et souhaite les ranger dans un album qui peut contenir $${nbTimbresParPage}$ timbres par page.`
          chainePourQuestions += `a) De combien de pages aura-t-il besoin pour ranger tous ses timbres ? %{champ1} \n`
          chainePourQuestions += `b) Combien de timbres y aura-t-il sur la dernière page ? %{champ2} \n`
          texteCorr = `a) Posons la division euclidienne de $${texNombre(nbTimbres)}$ par $${nbTimbresParPage}$. <br>`
          texteCorr +=
            operation({
              operande1: nbTimbres,
              operande2: nbTimbresParPage,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbTimbres)}=(${nbTimbresParPage}\\times${texNombre(nbPages)})${nbTimbres - nbTimbresParPage * nbPages === 0 ? '' : `+ ${nbTimbres - nbTimbresParPage * nbPages}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il y aura $${miseEnEvidence(texNombre(nbPages), bleuMathalea)}$ pages remplies et une page avec $${miseEnEvidence(texNombre(reste), bleuMathalea)}$ timbres. Donc au total, il faudra $${miseEnEvidence(texNombre(nbPages + 1))}$ pages.`
          texteCorr += `<br>b) Comme l'indique la division euclidienne ci-dessus, il y aura $${miseEnEvidence(texNombre(reste))}$ timbres sur la dernière page.`
          reponse1 = texNombre(nbPages + 1, 0)
          reponse2 = texNombre(reste, 0)

          break
        }
        case 7: {
          // problème sur les pirates et le capitaine
          const nbPirates = randint(12, 18)
          const nbPiecesParPirate = randint(5, nbPirates - 5)
          reste = randint(nbPirates - 4, nbPirates - 1)
          diviseur = nbPirates
          dividende = nbPirates * nbPiecesParPirate + reste
          texte = `Une bande de $${nbPirates}$ pirates et leur capitaine doivent se partager un trésor de $${dividende}$ pièces d'or. Le capitaine dit à ses hommes : «${sp()}Vous avez bien travaillé, partagez-vous le trésor, je me contenterai
          du reste.${sp()}» ${this.interactif ? '' : '<br> Le capitaine est-il vraiment généreux ?'}`
          chainePourQuestions += `a) Combien de pièces aura chaque pirate ? %{champ1} \n`
          chainePourQuestions += `b) Combien de pièces aura le capitaine ? %{champ2} \n`
          texteCorr = `a) Posons la division euclidienne de $${texNombre(dividende)}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(nbPiecesParPirate)}) + ${reste}`, bleuMathalea)}$`
          texteCorr += `<br>Chaque pirate aura $${miseEnEvidence(texNombre(nbPiecesParPirate))}$ pièces.`
          texteCorr += `<br>b) Comme l'indique la division euclidienne ci-dessus, le capitaine aura $${miseEnEvidence(texNombre(reste))}$ pièces et il aura le plus de pièces.`

          reponse1 = texNombre(nbPiecesParPirate, 0)
          reponse2 = texNombre(reste, 0)

          break
        }
        case 8:
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
          texte = `Pour un spectacle, les organisateurs doivent accueillir ${nbPersonnes} personnes. Ils hésitent sur la disposition de la salle : soit mettre ${nbPlaces1ParRangée} places par rangée, soit ${nbPlaces2ParRangée} places par rangée. Ils décident de choisir la configuration où il y aura le moins de places vides.`
          chainePourQuestions = `a) Combien de places vont-ils choisir par rangée ? %{champ1} \n`
          chainePourQuestions += `b) Combien de rangées vont-ils prévoir ? %{champ2}`
          texteCorr = `a) Posons la division euclidienne de $${texNombre(nbPersonnes)}$ par $${nbPlaces1ParRangée}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPersonnes,
              operande2: nbPlaces1ParRangée,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPersonnes)}=(${nbPlaces1ParRangée}\\times${texNombre(nbRangée1)}) + ${reste1}`, bleuMathalea)}$`
          texteCorr += `<br> Avec ${nbPlaces1ParRangée} places par rangée, il y aura ${nbRangée1} rangées remplies et une dernière avec ${reste1} places occupées et ${texteEnCouleurEtGras(`$\\mathbf{${nbPlaces1ParRangée - reste1}}$`, bleuMathalea)} places libres.`
          texteCorr += `<br> <br> Posons la division euclidienne de $${texNombre(nbPersonnes)}$ par $${nbPlaces2ParRangée}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPersonnes,
              operande2: nbPlaces2ParRangée,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPersonnes)}=(${nbPlaces2ParRangée}\\times${texNombre(nbRangée2)}) + ${reste2}`, bleuMathalea)}$`
          texteCorr += `<br> Avec ${nbPlaces2ParRangée} places par rangée, il y aura ${nbRangée2} rangées remplies et une dernière avec ${reste2} places occupées et ${texteEnCouleurEtGras(`$\\mathbf{${nbPlaces2ParRangée - reste2}}$`, bleuMathalea)} places libres.`
          texteCorr += `<br> <br> Comme $${Math.min(nbPlaces2ParRangée - reste2, nbPlaces1ParRangée - reste1)} < ${Math.max(nbPlaces2ParRangée - reste2, nbPlaces1ParRangée - reste1)}$,
           alors pour avoir le moins de places libres, les organisateurs vont préférer $${miseEnEvidence(String(nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbPlaces2ParRangée : nbPlaces1ParRangée))}$ places par rangée.`
          texteCorr += `<br>b) Comme l'indique la division euclidienne ci-dessus, il y aura ${nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbRangée2 : nbRangée1} rangées remplies et $1$ rangée avec ${nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? reste2 : reste1} places occupées, soit $${miseEnEvidence(String(nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1 ? nbRangée2 + 1 : nbRangée1 + 1))}$ rangées au total.`
          reponse1 = texNombre(
            nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1
              ? nbPlaces2ParRangée
              : nbPlaces1ParRangée,
            0,
          )
          reponse2 = texNombre(
            nbPlaces2ParRangée - reste2 < nbPlaces1ParRangée - reste1
              ? nbRangée2 + 1
              : nbRangée1 + 1,
            0,
          )
          break
        }
      }

      const tailleClavier = 75
      texte +=
        '<br>' +
        addMultiMathfield(this, i, {
          dataTemplate: chainePourQuestions,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
              minWidth: tailleClavier,
            },
            champ2: {
              keyboard: KeyboardType.clavierNumbers,
              minWidth: tailleClavier,
            },
          },
        })
      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: reponse1 },
          champ2: { value: reponse2 },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      if (this.questionJamaisPosee(i, dividende, diviseur)) {
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
