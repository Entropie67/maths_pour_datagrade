import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Résoudre des problèmes avec enchaînement d'opérations"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '10/09/2025'
export const dateDeModifImportante = '15/10/2025'

/**
 *
 * @author Éric Elter (sur la base de 6N5-7)
 */
export const uuid = '716c5'

export const refs = {
  'fr-fr': ['6N5-13', '5N1D-2'],
  'fr-ch': ['9R1NO7E-8', '9R2NO7E-8', '9R3NO7E-8', 'PRQST02B-14', 'PRQNO15A-8'],
}

export function formatPrenoms(prenoms: string[]): string {
  if (prenoms.length === 2) return prenoms.join(' et ')
  return prenoms.slice(0, -1).join(', ') + ' et ' + prenoms[prenoms.length - 1]
}

export default class ProblemesAvecOperations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 3
    this.besoinFormulaireTexte = [
      'Type de problèmes',
      `Nombres séparés par des tirets :
  1 : Pains et tartelettes
  2 : Cahiers et stylos
  3 : Arbres
  4 : Tortues
  5 : Papier et carton
  6 : Cinéma
  7 : Sandwichs
  8 : Bouteilles
  9 : Pommes
  10 : Œufs
  11 : Carburant
  12 : Mélange`,
    ]
  }

  nouvelleVersion() {
    this.consigne = 'Résoudre '
    this.consigne +=
      this.nbQuestions > 1 ? 'les problèmes suivants.' : 'le problème suivant.'
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 11,
      defaut: 1,
      melange: 12,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })
    for (
      let i = 0,
        texte,
        texteCorr,
        prixTartelettes,
        prixPains,
        prixCahiers,
        prixStylos,
        arbresFinaux,
        tortuesRelachees,
        arbresTotal,
        coutParAmi,
        bouteillesUtilisees,
        gainParPersonne,
        oeufsRestants,
        carburantParReservoir,
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' €',
                }) + '<br>'
              : ''
          texteCorr = `Les pains coûtent $${quantitéPains} \\times ${texPrix(prixPains)} = ${texPrix(quantitéPains * prixPains)}$ €<br>`
          texteCorr += `On soustrait au prix total $${texNombre(prix)} - ${texPrix(prixPains * quantitéPains)} = ${texPrix(prix - quantitéPains * prixPains)}$ €<br>`
          texteCorr += `On divise par le nombre de tartelettes $${texPrix(prix - quantitéPains * prixPains)} \\div ${quantitéTartelettes} = ${texPrix((prix - quantitéPains * prixPains) / quantitéTartelettes)}$ €<br>`
          texteCorr +=
            "Donc le prix d'une tartelette est " +
            `$${miseEnEvidence(texPrix(prixTartelettes))}$ €.`
          handleAnswers(this, i, {
            reponse: { value: texPrix(prixTartelettes) },
          })
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' €',
                }) + '<br>'
              : ''
          texteCorr = `Les cahiers coûtent $${quantitéCahiers} \\times ${texPrix(prixCahiers)} = ${texPrix(quantitéCahiers * prixCahiers)}$ €<br>`
          texteCorr += `On soustrait au prix total $${texPrix(prix)} - ${texPrix(prixCahiers * quantitéCahiers)} = ${texPrix(prix - quantitéCahiers * prixCahiers)}$ €<br>`
          texteCorr += `On divise par le nombre de stylos $${texPrix(prix - quantitéCahiers * prixCahiers)} \\div ${quantitéStylos} = ${texPrix((prix - quantitéCahiers * prixCahiers) / quantitéStylos)}$ €<br>`
          texteCorr +=
            "Donc le prix d'un stylo est " +
            `$${miseEnEvidence(texPrix(prixStylos))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(prixStylos) } })
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' arbres',
                }) + '<br>'
              : ''

          texteCorr = `Au départ, on plante $${rangees} \\times ${arbresParRangee} = ${texNombre(arbresInitiaux)}$ arbres.<br>`
          texteCorr += `Après la tempête, il reste $${texNombre(arbresInitiaux)} - ${texNombre(arbresArraches)} = ${texNombre(arbresInitiaux - arbresArraches)}$ arbres.<br>`
          texteCorr += `Après avoir replanté, il y a $${texNombre(arbresInitiaux - arbresArraches)} + ${texNombre(nouveauxArbres)} = ${texNombre(arbresFinaux)}$ arbres.<br>`
          texteCorr += `Donc il y a $${miseEnEvidence(texNombre(arbresFinaux))}$ arbres dans le parc.`

          handleAnswers(this, i, {
            reponse: { value: texNombre(arbresFinaux) },
          })
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' tortues',
                }) + '<br>'
              : ''

          texteCorr = `Chaque groupe contient au départ $${tortuesInitiales} \\div ${nbGroupes} = ${texNombre(tortuesParGroupe)}$ tortues.<br>`
          texteCorr += `Après ajout des tortues supplémentaires, chaque groupe contient $${texNombre(tortuesParGroupe)} + ${tortuesSupplementaires} = ${texNombre(tortuesParGroupeApres)}$ tortues.<br>`
          texteCorr += `On relâche $${groupesRelaches} \\times ${texNombre(tortuesParGroupeApres)} = ${texNombre(tortuesRelachees)}$ tortues.<br>`
          texteCorr += `Donc $${miseEnEvidence(texNombre(tortuesRelachees))}$ tortues ont été relâchées en mer.`

          handleAnswers(this, i, {
            reponse: { value: texNombre(tortuesRelachees) },
          })
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' arbres',
                }) + '<br>'
              : ''

          texteCorr = `On peut remplir $${texNombre(papierTotal)} \\div ${papierParCarton} = ${texNombre(nbCartons)}$ cartons.<br>`
          texteCorr += `Ces cartons rapportent $${texNombre(nbCartons)} \\times ${argentParCarton} = ${texNombre(argentTotal)}$ €.<br>`
          texteCorr += `Avec cet argent, on peut acheter $${texNombre(argentTotal)} \\div ${prixParArbre} = ${texNombre(arbresAchetes)}$ arbres.<br>`
          texteCorr += `Au total, l'école se procure $${texNombre(arbresAchetes)} + ${arbresCadeaux} = ${texNombre(arbresTotal)}$ arbres.<br>`
          texteCorr += `Donc l'école a pu se procurer $${miseEnEvidence(texNombre(arbresTotal))}$ arbres au total.`

          handleAnswers(this, i, {
            reponse: { value: texNombre(arbresTotal) },
          })
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
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' €',
                }) + '<br>'
              : ''

          texteCorr = `Les billets coûtent au total $${nbAmis} \\times ${prixBillet} = ${texNombre(coutBillets)}$ €.<br>`
          texteCorr += `Le pop-corn coûte au total $${nbPaquets} \\times ${prixParPaquet} = ${texNombre(coutPopCorn)}$ €.<br>`
          texteCorr += `Le coût total est $${texNombre(coutBillets)} + ${texNombre(coutPopCorn)} = ${texNombre(coutTotal)}$ €.<br>`
          texteCorr += `Chaque ami dépense $${texNombre(coutTotal)} \\div ${nbAmis} = ${miseEnEvidence(texPrix(coutParAmi))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(coutParAmi) } })

          break
        }
        case 7: {
          const nbAmis = choice([2, 4, 5])
          const garcons = randint(1, nbAmis - 1)
          // const prenomsGars = prenomM(garcons, true)
          // const prenomsFilles = prenomF(nbAmis - garcons, true)

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

          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' €',
                }) + '<br>'
              : ''

          texteCorr = `Les sandwichs coûtent au total $${nbSandwichs} \\times ${prixSandwich} = ${texNombre(coutSandwichs)}$ €.<br>`
          texteCorr += `Le coût total est $${texNombre(coutSandwichs)} + ${prixBouteille} = ${texNombre(coutTotal)}$ €.<br>`
          texteCorr += `Chaque personne paie $${texNombre(coutTotal)} \\div ${nbAmis} = ${texPrix(coutParAmi)}$ €.<br>`
          texteCorr +=
            'Donc chaque ami paie ' +
            `$${miseEnEvidence(texPrix(coutParAmi))}$ € au total.`

          handleAnswers(this, i, { reponse: { value: texPrix(coutParAmi) } })

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

          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' bouteilles',
                }) + '<br>'
              : ''

          texteCorr = `<br>Il y a au total $${nbEquipes} \\times ${joueursParEquipe} = ${texNombre(nbJoueurs)}$ joueurs.<br>`
          texteCorr += `On distribue $${texNombre(nbJoueurs)} \\times ${bouteillesParJoueur} = ${texNombre(bouteillesDistribuees)}$ bouteilles.<br>`
          texteCorr += `Le nombre de bouteilles utilisées est $${texNombre(bouteillesDistribuees)} - ${bouteillesInutilisees} = ${texNombre(bouteillesUtilisees)}$ bouteilles.<br>`

          texteCorr +=
            'Donc ' +
            `$${miseEnEvidence(texNombre(bouteillesUtilisees))}$ bouteilles ont été utilisées.`
          handleAnswers(this, i, {
            reponse: { value: texPrix(bouteillesUtilisees) },
          })

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

          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' €',
                }) + '<br>'
              : ''

          texteCorr = `Le verger produit au total $${nbCaisses} \\times ${kgParCaisse} = ${texNombre(kgTotal)}$ kg de pommes.<br>`
          texteCorr += `La recette totale est $${texNombre(kgTotal)} \\times ${prixParKg} = ${texNombre(recetteTotal)}$ €.<br>`
          texteCorr += `Après remboursement des frais, il reste $${texNombre(recetteTotal)} - ${frais} = ${texPrix(resteAPartager)}$ €.<br>`
          texteCorr += `Chaque personne reçoit $${texNombre(resteAPartager)} \\div ${nbPersonnes} = ${texPrix(gainParPersonne)}$ €.<br>`

          texteCorr +=
            'Donc chaque personne reçoit ' +
            `$${miseEnEvidence(texPrix(gainParPersonne))}$ €.`

          handleAnswers(this, i, {
            reponse: { value: texPrix(gainParPersonne) },
          })
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
          oeufsRestants = oeufsPondus - oeufsUtilises

          texte = `Pour une fête, je prépare $${nbGateaux}$ gâteaux identiques.<br>
          Chaque gâteau nécessite $${oeufsParGateau}$ œufs et $200$ g de farine.<br>
          J'ai $${nbPoules}$ poules et, dans la semaine, chacune a pondu $${oeufsParPoule}$ œufs.<br>
          Combien me reste-t-il d'œufs de mes poules à la fin de la semaine ?<br>`

          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' œufs',
                }) + '<br>'
              : ''

          texteCorr = `Les gâteaux nécessitent au total $${nbGateaux} \\times ${oeufsParGateau} = ${texNombre(oeufsUtilises)}$ œufs.<br>`
          texteCorr += `Les poules ont pondu au total $${nbPoules} \\times ${oeufsParPoule} = ${texNombre(oeufsPondus)}$ œufs.<br>`
          texteCorr +=
            'Donc il me reste ' +
            `$${texNombre(oeufsPondus)} - ${texNombre(oeufsUtilises)} = ${miseEnEvidence(texNombre(oeufsRestants))}$ œufs de mes poules à la fin de la semaine.`
          handleAnswers(this, i, {
            reponse: { value: texPrix(oeufsRestants) },
          })
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

          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteApres: ' litres',
                }) + '<br>'
              : ''

          texteCorr = `La fusée consomme au total $${consommationParMinute} \\times ${dureeDecollage} = ${texNombre(carburantConsomme)}$ litres.<br>`
          texteCorr += `Il reste $${carburantInitial} - ${texNombre(carburantConsomme)} = ${texNombre(carburantRestant)}$ litres.<br>`
          texteCorr += `Chaque réservoir contient $${texNombre(carburantRestant)} \\div ${nbReservoirs} = ${texNombre(carburantParReservoir)}$ litres.<br>`

          texteCorr +=
            'Donc il y a ' +
            `$${miseEnEvidence(texNombre(carburantParReservoir))}$ litres dans chaque réservoir.`
          handleAnswers(this, i, {
            reponse: { value: texPrix(carburantParReservoir) },
          })
          break
        }
      }
      if (
        this.questionJamaisPosee(
          i,
          prixPains ?? '',
          prixTartelettes ?? '',
          prixStylos ?? '',
          prixCahiers ?? '',
          arbresFinaux ?? '',
          tortuesRelachees ?? '',
          arbresTotal ?? '',
          coutParAmi ?? '',
          bouteillesUtilisees ?? '',
          gainParPersonne ?? '',
          oeufsRestants ?? '',
          carburantParReservoir ?? '',
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
