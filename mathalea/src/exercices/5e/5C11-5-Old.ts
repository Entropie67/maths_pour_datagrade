import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { formatPrenoms } from '../6e/6N5-13'
import Exercice from '../Exercice'

export const titre = "Écrire un enchaînement de calculs à partir d'un problème"
export const interactifReady = true

export const dateDePublication = '10/09/2025'

/**
 * @author Éric Elter (sur la base de 6N5-13)
 */
export const uuid = '0a113'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [''],
}
export default class ProblemesAvecOperationsEnUneLigneOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = '12'
    this.besoinFormulaireTexte = [
      'Type de problèmes',
      `Nombres séparés par des tirets :
  1 : Pains et tartelettes
  2 : Cahiers et stylos
  3 : Arbres
  4 : Tortues
  5 : Papier et cartons
  6 : Cinéma
  7 : Sandwichs
  8 : Bouteilles
  9 : Pommes
  10 : Œufs
  11 : Carburant
  12 : Mélange`,
    ]
    this.besoinFormulaire2CaseACocher = ['Avec résolution de problèmes', true]
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.consigne =
      "Donner l'enchaînement de calculs sur une ligne qui permet de résoudre "
    this.consigne +=
      this.nbQuestions > 1 ? 'les problèmes suivants.' : 'le problème suivant.'
    if (this.sup2) {
      this.consigne +=
        '<br>Calculer cet enchaînement et donner la réponse numérique de ce problème.'
    }
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 11,
      defaut: 12,
      melange: 12,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    const nbQ = this.sup2 ? 2 : 1
    for (
      let i = 0,
        texte = '',
        texteCorr = '',
        reponse = '',
        reponseNumerique = '',
        correctionDetaillee = '',
        texteAvant = '',
        texteApres = '',
        prixTartelettes = 0,
        prixPains = 0,
        prixCahiers = 0,
        prixStylos = 0,
        arbresFinaux = 0,
        tortuesRelachees = 0,
        arbresTotal = 0,
        coutParAmi = 0,
        bouteillesUtilisees = 0,
        gainParPersonne = 0,
        oeufsRestants = 0,
        carburantParReservoir = 0,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const n = randint(1, 2)
      switch (
        typesDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: {
          prixPains =
            randint(0, 1) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5]) * 0.01 : 0)
          const quantitéPains = randint(2, 5)
          prixTartelettes =
            randint(1, 2) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5, 9]) * 0.01 : 0)
          const quantitéTartelettes = randint(2, 9, [quantitéPains])
          const prix =
            prixPains * quantitéPains + prixTartelettes * quantitéTartelettes
          texte = `${prenomF()} achète à la boulangerie $${quantitéPains}$ pains à $${texPrix(prixPains)}$€ et $${quantitéTartelettes}$ tartelettes. Elle paie $${texPrix(prix)}$€. Quel est le prix d'une tartelette ?<br>`

          reponse = `(${texPrix(prix)} - ${quantitéPains} \\times ${texPrix(prixPains)}) \\div ${quantitéTartelettes}`
          reponseNumerique = texPrix(prixTartelettes)
          texteAvant = "<br> Prix d'une tartelette : "
          texteApres = ' €'

          if (this.correctionDetaillee) {
            correctionDetaillee = `Les pains coûtent $${quantitéPains} \\times ${texPrix(prixPains)} = ${texPrix(quantitéPains * prixPains)}$ €<br>`
            correctionDetaillee += `On soustrait au prix total $${texNombre(prix)} - ${texPrix(prixPains * quantitéPains)} = ${texPrix(prix - quantitéPains * prixPains)}$ €<br>`
            correctionDetaillee += `On divise par le nombre de tartelettes $${texPrix(prix - quantitéPains * prixPains)} \\div ${quantitéTartelettes} = ${texPrix((prix - quantitéPains * prixPains) / quantitéTartelettes)}$ €<br>`
          } else correctionDetaillee = ''

          correctionDetaillee += this.sup2
            ? "Donc le prix d'une tartelette est " +
              `$${miseEnEvidence(reponseNumerique)}$ €.`
            : ''
          break
        }
        case 2: {
          prixCahiers =
            1 +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 4, 5, 9]) * 0.01 : 0)
          const quantitéCahiers = randint(2, 5)
          prixStylos =
            randint(1, 2) +
            (n > 0 ? randint(1, 9) * 0.1 : 0) +
            (n > 1 ? choice([0, 5, 9]) * 0.01 : 0)
          const quantitéStylos = randint(2, 9, [quantitéCahiers])
          const prix =
            prixCahiers * quantitéCahiers + prixStylos * quantitéStylos
          texte = `${prenomF()} achète $${quantitéCahiers}$ cahiers à $${texPrix(prixCahiers)}$€ et $${quantitéStylos}$ stylos au même prix chacun. Elle paie $${texPrix(prix)}$€. Quel est le prix d'un stylo ?<br>`

          reponse = `(${texPrix(prix)} - ${quantitéCahiers} \\times ${texPrix(prixCahiers)}) \\div ${quantitéStylos}`
          reponseNumerique = texPrix(prixStylos)
          texteApres = ' €'
          texteAvant = "<br> Prix d'un stylo : "

          if (this.correctionDetaillee) {
            correctionDetaillee = `Les cahiers coûtent $${quantitéCahiers} \\times ${texPrix(prixCahiers)} = ${texPrix(quantitéCahiers * prixCahiers)}$ €<br>`
            correctionDetaillee += `On soustrait au prix total $${texPrix(prix)} - ${texPrix(prixCahiers * quantitéCahiers)} = ${texPrix(prix - quantitéCahiers * prixCahiers)}$ €<br>`
            correctionDetaillee += `On divise par le nombre de stylos $${texPrix(prix - quantitéCahiers * prixCahiers)} \\div ${quantitéStylos} = ${texPrix((prix - quantitéCahiers * prixCahiers) / quantitéStylos)}$ €<br>`
          } else correctionDetaillee = ''

          correctionDetaillee += this.sup2
            ? "Donc le prix d'un stylo est " +
              `$${miseEnEvidence(reponseNumerique)}$ €.`
            : ''

          break
        }
        case 3: {
          const rangees = randint(3, 6)
          const arbresParRangee = randint(8, 15)
          const arbresInitiaux = rangees * arbresParRangee
          const arbresArraches = randint(10, Math.min(25, arbresInitiaux - 5))
          const nouveauxArbres = randint(15, 35, [arbresArraches])
          arbresFinaux = arbresInitiaux - arbresArraches + nouveauxArbres

          texte = `Des élèves plantent $${rangees}$ rangées de $${arbresParRangee}$ arbres dans un parc sans arbres, initialement.<br>
          Le lendemain, $${arbresArraches}$ arbres sont arrachés par le vent.<br>
          On décide d'évacuer les arbres arrachés et de replanter $${nouveauxArbres}$ nouveaux arbres.<br>
          Combien d'arbres y a-t-il alors dans le parc ?<br>`

          reponse = `${rangees} \\times ${arbresParRangee} - ${arbresArraches} + ${nouveauxArbres}`
          reponseNumerique = texNombre(arbresFinaux)
          texteApres = ' arbres'
          texteAvant = "<br> Nombre d'arbres dans le parc : "

          if (this.correctionDetaillee) {
            correctionDetaillee = `Au départ, on plante $${rangees} \\times ${arbresParRangee} = ${texNombre(arbresInitiaux)}$ arbres.<br>`
            correctionDetaillee += `Après la tempête, il reste $${texNombre(arbresInitiaux)} - ${texNombre(arbresArraches)} = ${texNombre(arbresInitiaux - arbresArraches)}$ arbres.<br>`
            correctionDetaillee += `Après avoir replanté, il y a $${texNombre(arbresInitiaux - arbresArraches)} + ${texNombre(nouveauxArbres)} = ${texNombre(arbresFinaux)}$ arbres.<br>`
          } else correctionDetaillee = ''

          correctionDetaillee += this.sup2
            ? 'Donc il y a ' +
              `$${miseEnEvidence(reponseNumerique)}$ arbres dans le parc.`
            : ''

          break
        }
        case 4: {
          let nbGroupes,
            tortuesInitiales,
            tortuesParGroupe,
            tortuesSupplementaires,
            tortuesParGroupeApres,
            groupesRelaches
          do {
            nbGroupes = choice([6, 8, 9, 10, 12])
            tortuesInitiales = randint(5, 12) * nbGroupes
            tortuesParGroupe = tortuesInitiales / nbGroupes
            tortuesSupplementaires = randint(2, 5)
            tortuesParGroupeApres = tortuesParGroupe + tortuesSupplementaires
            groupesRelaches = randint(3, nbGroupes - 1, [nbGroupes])
            tortuesRelachees = groupesRelaches * tortuesParGroupeApres
          } while (tortuesInitiales === tortuesRelachees)

          texte = `Une association possède $${tortuesInitiales}$ bébés tortues marines.<br>
          Elles sont réparties équitablement dans $${nbGroupes}$ groupes.<br>
          Chaque groupe est ensuite rejoint par $${tortuesSupplementaires}$ tortues supplémentaires élevées en réserve.<br>
          L'association décide de relâcher $${groupesRelaches}$ groupes de tortues dans la mer.<br>
          Combien de tortues ont été relâchées en mer ?<br>`

          reponse = `(${tortuesInitiales} \\div ${nbGroupes} + ${tortuesSupplementaires}) \\times ${groupesRelaches}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Chaque groupe contient au départ $${tortuesInitiales} \\div ${nbGroupes} = ${texNombre(tortuesParGroupe)}$ tortues.<br>`
            correctionDetaillee += `Après ajout des tortues supplémentaires, chaque groupe contient $${texNombre(tortuesParGroupe)} + ${tortuesSupplementaires} = ${texNombre(tortuesParGroupeApres)}$ tortues.<br>`
            correctionDetaillee += `On relâche $${groupesRelaches} \\times ${texNombre(tortuesParGroupeApres)} = ${texNombre(tortuesRelachees)}$ tortues.<br>`
          } else correctionDetaillee = ''

          texteApres = ' tortues'
          texteAvant = '<br> Nombre de tortues relâchées : '
          reponseNumerique = texNombre(tortuesRelachees)

          correctionDetaillee += this.sup2
            ? 'Donc ' +
              `$${miseEnEvidence(reponseNumerique)}$ tortues ont été relâchées en mer.`
            : ''

          break
        }
        case 5: {
          const papierParCarton = choice([20, 24, 30, 40])
          const prixParArbre = choice([12, 15, 18, 20])
          const papierTotal = randint(3, 7) * papierParCarton * prixParArbre
          const nbCartons = papierTotal / papierParCarton
          const argentParCarton = randint(4, 8, [5])
          const argentTotal = nbCartons * argentParCarton
          const arbresAchetes = Math.floor(argentTotal / prixParArbre)
          const arbresCadeaux = randint(2, 5, [3])
          arbresTotal = arbresAchetes + arbresCadeaux

          texte = `Une école collecte $${texNombre(papierTotal)}$ kg de papier.<br>
          On met ce papier dans des cartons de $${papierParCarton}$ kg.<br>
          Chaque carton rapporte $${argentParCarton}$ €.<br>
          Avec cet argent, l'école achète des arbres à $${prixParArbre}$ € l'arbre, puis l'école reçoit $${arbresCadeaux}$ arbres en cadeau.<br>
          Combien d'arbres a pu se procurer l'école au total ?<br>`

          reponse = `${papierTotal} \\div ${papierParCarton} \\times ${argentParCarton} \\div ${prixParArbre} + ${arbresCadeaux}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `On peut remplir $${texNombre(papierTotal)} \\div ${papierParCarton} = ${texNombre(nbCartons)}$ cartons.<br>`
            correctionDetaillee += `Ces cartons rapportent $${texNombre(nbCartons)} \\times ${argentParCarton} = ${texNombre(argentTotal)}$ €.<br>`
            correctionDetaillee += `Avec cet argent, on peut acheter $${texNombre(argentTotal)} \\div ${prixParArbre} = ${texNombre(arbresAchetes)}$ arbres.<br>`
            correctionDetaillee += `Au total, l'école se procure $${texNombre(arbresAchetes)} + ${arbresCadeaux} = ${texNombre(arbresTotal)}$ arbres.<br>`
          } else correctionDetaillee = ''

          texteApres = ' arbres'
          texteAvant = "<br> Nombre total d'arbres : "
          reponseNumerique = texNombre(arbresTotal)

          correctionDetaillee += this.sup2
            ? "Donc l'école a pu se procurer " +
              `$${miseEnEvidence(reponseNumerique)}$ arbres au total.`
            : ''

          break
        }
        case 6: {
          const prixBillet = choice([8, 9, 10, 12])
          const nbAmis = choice([2, 4, 5])
          const nbPaquets = randint(2, 4)
          const prixParPaquet = choice([5, 6, 7, 8])
          const coutBillets = nbAmis * prixBillet
          const coutPopCorn = nbPaquets * prixParPaquet
          const coutTotal = coutBillets + coutPopCorn
          coutParAmi = coutTotal / nbAmis

          texte = `Un billet de cinéma coûte $${prixBillet}$ €.<br>
          ${nbAmis === 2 ? 'Deux' : nbAmis === 4 ? 'Quatre' : 'Cinq'} amis paient chacun un billet.<br>
          Ensuite, ils achètent $${nbPaquets}$ grands paquets de pop-corn à $${prixParPaquet}$ € chacun, qu'ils se partagent équitablement.<br>
          Combien chaque ami dépense-t-il au total ?<br>`

          reponse = `(${nbAmis} \\times ${prixBillet} + ${nbPaquets} \\times ${prixParPaquet}) \\div ${nbAmis}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Les billets coûtent au total $${nbAmis} \\times ${prixBillet} = ${texNombre(coutBillets)}$ €.<br>`
            correctionDetaillee += `Le pop-corn coûte au total $${nbPaquets} \\times ${prixParPaquet} = ${texNombre(coutPopCorn)}$ €.<br>`
            correctionDetaillee += `Le coût total est $${texNombre(coutBillets)} + ${texNombre(coutPopCorn)} = ${texNombre(coutTotal)}$ €.<br>`
            correctionDetaillee += `Chaque ami dépense $${texNombre(coutTotal)} \\div ${nbAmis} = ${texPrix(coutParAmi)}$ €.<br>`
          } else correctionDetaillee = ''

          texteApres = ' €'
          texteAvant = '<br> Dépense par ami : '
          reponseNumerique = texPrix(coutParAmi)

          correctionDetaillee += this.sup2
            ? 'Donc chaque ami dépense ' +
              `$${miseEnEvidence(reponseNumerique)}$ € au total.`
            : ''
          break
        }
        case 7: {
          const nbAmis = choice([2, 4, 5])
          const garcons = randint(1, nbAmis - 1)

          let prenoms = ([] as string[]).concat(
            ...prenomM(garcons, true),
            ...prenomF(nbAmis - garcons, true),
          )
          prenoms = shuffle(prenoms)

          const nbSandwichs = randint(2, 5)
          const prixSandwich = choice([4, 5, 6, 7])
          const prixBouteille = choice([3, 4, 5, 6])
          const coutSandwichs = nbSandwichs * prixSandwich
          const coutTotal = coutSandwichs + prixBouteille
          coutParAmi = coutTotal / nbAmis

          texte = `${formatPrenoms(prenoms)} achètent ensemble $${nbSandwichs}$ sandwichs à $${prixSandwich}$ € chacun et une grande bouteille de jus à $${prixBouteille}$ €.<br>
          Ils partagent ensuite la note équitablement.<br>
          Combien chacun paie-t-il ?<br>`

          reponse = `(${nbSandwichs} \\times ${prixSandwich} + ${prixBouteille}) \\div ${nbAmis}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Les sandwichs coûtent au total $${nbSandwichs} \\times ${prixSandwich} = ${texNombre(coutSandwichs)}$ €.<br>`
            correctionDetaillee += `Le coût total est $${texNombre(coutSandwichs)} + ${prixBouteille} = ${texNombre(coutTotal)}$ €.<br>`
            correctionDetaillee += `Chaque personne paie $${texNombre(coutTotal)} \\div ${nbAmis} = ${texPrix(coutParAmi)}$ €.<br>`
          } else correctionDetaillee = ''

          texteApres = ' €'
          texteAvant = '<br> Montant payé par ami : '
          reponseNumerique = texPrix(coutParAmi)

          correctionDetaillee += this.sup2
            ? 'Donc chaque ami paie ' +
              `$${miseEnEvidence(reponseNumerique)}$ € au total.`
            : ''
          break
        }
        case 8: {
          const nbEquipes = choice([4, 5, 6, 8])
          const joueursParEquipe = choice([10, 12, 15, 16])
          const bouteillesParJoueur = randint(2, 4)
          const bouteillesInutilisees = randint(10, 25, [15])
          const nbJoueurs = nbEquipes * joueursParEquipe
          const bouteillesDistribuees = nbJoueurs * bouteillesParJoueur
          bouteillesUtilisees = bouteillesDistribuees - bouteillesInutilisees

          texte = `Il y a $${nbEquipes}$ équipes avec $${joueursParEquipe}$ joueurs chacune.<br>
          Chaque joueur reçoit $${bouteillesParJoueur}$ bouteilles d'eau.<br>
          On découvre ensuite que $${bouteillesInutilisees}$ bouteilles sont restées inutilisées.<br>
          Combien de bouteilles ont été utilisées ?<br>`

          reponse = `${nbEquipes} \\times ${joueursParEquipe} \\times ${bouteillesParJoueur} - ${bouteillesInutilisees}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Il y a au total $${nbEquipes} \\times ${joueursParEquipe} = ${texNombre(nbJoueurs)}$ joueurs.<br>`
            correctionDetaillee += `On distribue $${texNombre(nbJoueurs)} \\times ${bouteillesParJoueur} = ${texNombre(bouteillesDistribuees)}$ bouteilles.<br>`
            correctionDetaillee += `Le nombre de bouteilles utilisées est $${texNombre(bouteillesDistribuees)} - ${bouteillesInutilisees} = ${texNombre(bouteillesUtilisees)}$ bouteilles.<br>`
          } else correctionDetaillee = ''

          texteApres = ' bouteilles'
          texteAvant = '<br> Nombre de bouteilles utilisées : '
          reponseNumerique = texNombre(bouteillesUtilisees)

          correctionDetaillee += this.sup2
            ? 'Donc ' +
              `$${miseEnEvidence(reponseNumerique)}$ bouteilles ont été utilisées.`
            : ''
          break
        }
        case 9: {
          const nbCaisses = randint(15, 25)
          const kgParCaisse = choice([20, 25, 30])
          const prixParKg = choice([2, 3, 4])
          const frais = randint(120, 200)
          const nbPersonnes = choice([2, 4, 5], prixParKg)
          const kgTotal = nbCaisses * kgParCaisse
          const recetteTotal = kgTotal * prixParKg
          const resteAPartager = recetteTotal - frais
          gainParPersonne = resteAPartager / nbPersonnes

          texte = `Un verger produit $${nbCaisses}$ caisses de $${kgParCaisse}$ kg de pommes.<br>
          On vend chaque kilo à $${prixParKg}$ €.<br>
          Avec la recette, on rembourse $${frais}$ € pour les frais de location d'échelles.<br>
          On partage le reste également entre les $${nbPersonnes}$ personnes qui ont cueilli les pommes.<br>
          Combien reçoit chaque personne ?<br>`

          reponse = `(${nbCaisses} \\times ${kgParCaisse} \\times ${prixParKg} - ${frais}) \\div ${nbPersonnes}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Le verger produit au total $${nbCaisses} \\times ${kgParCaisse} = ${texNombre(kgTotal)}$ kg de pommes.<br>`
            correctionDetaillee += `La recette totale est $${texNombre(kgTotal)} \\times ${prixParKg} = ${texNombre(recetteTotal)}$ €.<br>`
            correctionDetaillee += `Après remboursement des frais, il reste $${texNombre(recetteTotal)} - ${frais} = ${texPrix(resteAPartager)}$ €.<br>`
            correctionDetaillee += `Chaque personne reçoit $${texNombre(resteAPartager)} \\div ${nbPersonnes} = ${texPrix(gainParPersonne)}$ €.<br>`
          } else correctionDetaillee = ''

          texteApres = ' €'
          texteAvant = '<br> Gain par personne : '
          reponseNumerique = texPrix(gainParPersonne)

          correctionDetaillee += this.sup2
            ? 'Donc chaque personne reçoit ' +
              `$${miseEnEvidence(reponseNumerique)}$ €.`
            : ''
          break
        }
        case 10: {
          const nbGateaux = randint(4, 8)
          const oeufsParGateau = randint(2, 4, [nbGateaux])
          const nbPoules = randint(9, 13)
          const oeufsParPoule = randint(3, 6, [
            nbGateaux,
            oeufsParGateau,
            nbPoules,
          ])
          const oeufsUtilises = nbGateaux * oeufsParGateau
          const oeufsPondus = nbPoules * oeufsParPoule
          const oeufsRestants = oeufsPondus - oeufsUtilises
          arbresTotal = oeufsRestants

          texte = `Pour une fête, je prépare $${nbGateaux}$ gâteaux identiques.<br>
          Chaque gâteau utilise $${oeufsParGateau}$ œufs et $200$ g de farine.<br>
          J'ai $${nbPoules}$ poules et dans la semaine, chacune a pondu $${oeufsParPoule}$ œufs.<br>
          Combien me reste-t-il d'œufs de mes poules à la fin de la semaine ?<br>`

          reponse = `${nbPoules} \\times ${oeufsParPoule} - ${nbGateaux} \\times ${oeufsParGateau}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `Les gâteaux utilisent au total $${nbGateaux} \\times ${oeufsParGateau} = ${texNombre(oeufsUtilises)}$ œufs.<br>`
            correctionDetaillee += `Les poules ont pondu au total $${nbPoules} \\times ${oeufsParPoule} = ${texNombre(oeufsPondus)}$ œufs.<br>`
            correctionDetaillee += `Il me reste $${texNombre(oeufsPondus)} - ${texNombre(oeufsUtilises)} = ${texNombre(oeufsRestants)}$ œufs.<br>`
          } else correctionDetaillee = ''

          texteApres = ' œufs'
          texteAvant = "<br> Nombre d'œufs restants à la fin de la semaine : "
          reponseNumerique = texNombre(oeufsRestants)

          correctionDetaillee += this.sup2
            ? 'Donc il me reste ' +
              `$${miseEnEvidence(reponseNumerique)}$ œufs de mes poules à la fin de la semaine .`
            : ''
          break
        }
        case 11: {
          const carburantInitial = randint(300, 400)
          const consommationParMinute = choice([12, 15, 18, 20])
          const dureeDecollage = choice([8, 10, 12, 15])
          const nbReservoirs = choice([2, 4, 5])
          const carburantConsomme = consommationParMinute * dureeDecollage
          const carburantRestant = carburantInitial - carburantConsomme
          carburantParReservoir = carburantRestant / nbReservoirs

          texte = `Une fusée emporte $${carburantInitial}$ litres de carburant.<br>
          Elle consomme $${consommationParMinute}$ litres par minute pendant le décollage.<br>
          Après $${dureeDecollage}$ minutes, il reste une certaine quantité.<br>
          Cette quantité est ensuite divisée également dans $${nbReservoirs}$ réservoirs.<br>
          Combien y a-t-il de litres dans chaque réservoir ?<br>`

          reponse = `(${carburantInitial} - ${consommationParMinute} \\times ${dureeDecollage}) \\div ${nbReservoirs}`

          if (this.correctionDetaillee) {
            correctionDetaillee = `La fusée consomme au total $${consommationParMinute} \\times ${dureeDecollage} = ${texNombre(carburantConsomme)}$ litres.<br>`
            correctionDetaillee += `Il reste $${carburantInitial} - ${texNombre(carburantConsomme)} = ${texNombre(carburantRestant)}$ litres.<br>`
            correctionDetaillee += `Chaque réservoir contient $${texNombre(carburantRestant)} \\div ${nbReservoirs} = ${texNombre(carburantParReservoir)}$ litres.<br>`
          } else correctionDetaillee = ''

          texteApres = ' litres'
          texteAvant = '<br> Carburant par réservoir : '
          reponseNumerique = texNombre(carburantParReservoir)

          correctionDetaillee += this.sup2
            ? 'Donc il y a ' +
              `$${miseEnEvidence(reponseNumerique)}$ litres dans chaque réservoir.`
            : ''
          break
        }
      }
      texte += ajouteChampTexteMathLive(
        this,
        i * nbQ,
        KeyboardType.clavierDeBaseAvecEgal,
        {
          texteAvant: '<br> Enchaînement de calculs (en une seule ligne) : ',
        },
      )
      texteCorr =
        `Un enchaînement possible de calculs est : $${miseEnEvidence(reponse)}$.<br>` +
        correctionDetaillee
      handleAnswers(this, i * nbQ, {
        reponse: {
          value: reponse,
          options: { expressionNumerique: true },
        },
      })

      if (this.sup2) {
        texte += ajouteChampTexteMathLive(
          this,
          i * 2 + 1,
          KeyboardType.clavierNumbers,
          {
            texteApres,
            texteAvant,
          },
        )
        handleAnswers(this, i * 2 + 1, {
          reponse: {
            value: reponseNumerique,
            options: { nombreDecimalSeulement: true },
          },
        })
      }
      if (
        this.questionJamaisPosee(
          i,
          prixPains,
          prixTartelettes,
          prixStylos,
          prixCahiers,
          arbresFinaux,
          tortuesRelachees,
          arbresTotal,
          coutParAmi,
          bouteillesUtilisees,
          gainParPersonne,
          oeufsRestants,
          carburantParReservoir,
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
