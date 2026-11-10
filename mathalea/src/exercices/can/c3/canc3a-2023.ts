import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import Hms from '../../../modules/Hms'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import Grandeur from '../../../modules/Grandeur'
import ClasseCan2023 from './_Canc3a'

export const titre = 'CAN CM2 sujet 2023'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '03/04/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '30/10/2026'

export const uuid = '57239'

export const refs = {
  'fr-fr': ['canc3a-2023'],
  'fr-ch': ['NR'],
}

/**
 * Aléatoirisation du sujet 2023 de CAN CM2
 * @author Sébastien LOZANO

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export default class SujetCAN2023CM2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30
    this.sup =
      '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30'
    this.sup2 = false
    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante :<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`
  }

  nouvelleVersion() {
    // Case « Choix du nombre de questions » cochée : on reproduit le tirage
    // proportionnel historique (« mini » CAN respectant la proportion de
    // questions élémentaires). Décochée : l'utilisateur choisit les numéros des
    // questions à afficher, comme pour les CAN depuis 2024.
    this.nbQuestionsModifiable = Boolean(this.sup2)
    // Le champ « Choix des questions » n'a de sens que si l'on ne délègue pas le
    // choix au nombre de questions : on le masque quand la case est cochée.
    this.besoinFormulaireTexte = this.sup2
      ? false
      : [
          'Choix des questions',
          'Numéros des questions (de 1 à 30) séparés par des tirets. Par exemple : 1-3-3-12-30',
        ]
    this.besoinFormulaire2CaseACocher = ['Choix du nombre de questions']
    let typeQuestionsDisponibles: number[]
    if (this.sup2) {
      const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 8 possibles.
      const nbQ2 = Math.min(this.nbQuestions - nbQ1, 20)
      const typeQuestionsDisponiblesNiv1 = shuffle([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
        .slice(-nbQ1)
        .sort(compareNombres) //
      const typeQuestionsDisponiblesNiv2 = shuffle([
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30,
      ])
        .slice(-nbQ2)
        .sort(compareNombres) //
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    } else {
      typeQuestionsDisponibles = gestionnaireFormulaireTexte({
        saisie: String(this.sup ?? ''),
        min: 1,
        max: 30,
        defaut: 31,
        melange: 31,
        shuffle: false,
        nbQuestions: 0,
      }).map(Number)
      this.nbQuestions = typeQuestionsDisponibles.length
    }
    // const typeQuestionsDisponibles = [30] // Pour n'avoir que la question en cours de dev
    // On crée un objet avec lesméthodes can2023
    const myCan = new ClasseCan2023()
    // On crée un objet nécessaire à liaison des deux questions sur la vitesse
    const vitesseCommunePourQ21Q22 = myCan.vitesseCommune()

    for (
      let i = 0, index = 0, nbChamps, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          {
            const produit = myCan.produitDeDeuxFacteurs(4, 9, 4, 9)
            texte = produit.texte
            texteCorr = produit.texteCorr
            handleAnswers(this, index, { reponse: { value: produit.reponse } })
            if (this.interactif && !context.isAmc) {
              texte +=
                ' $=$' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                )
            }
            nbChamps = 1
            this.listeCanEnonces.push(produit.canEnonce)
            this.listeCanReponsesACompleter.push(produit.canReponseACompleter)
          }
          break

        case 2:
          {
            const somme = myCan.ajouterDizaineMoinsUn()
            texte = somme.texte
            texteCorr = somme.texteCorr
            handleAnswers(this, index, { reponse: { value: somme.reponse } })
            if (this.interactif && !context.isAmc) {
              texte +=
                ' $=$' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                )
            }
            nbChamps = 1
            this.listeCanEnonces.push(somme.canEnonce)
            this.listeCanReponsesACompleter.push(somme.canReponseACompleter)
          }
          break

        case 3:
          {
            const figureProduit = myCan.denombrementProduit()
            texte = figureProduit.texte
            texteCorr = figureProduit.texteCorr
            handleAnswers(this, index, {
              reponse: { value: figureProduit.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(figureProduit.canEnonce)
            this.listeCanReponsesACompleter.push(
              figureProduit.canReponseACompleter,
            )
          }
          break

        case 4:
          {
            const moitieDouble = myCan.moitieDouble()
            texte = moitieDouble.texte
            texteCorr = moitieDouble.texteCorr
            handleAnswers(this, index, {
              reponse: { value: moitieDouble.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte +=
                ' est ' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierNumbers,
                )
            }
            nbChamps = 1
            this.listeCanEnonces.push(moitieDouble.canEnonce)
            this.listeCanReponsesACompleter.push(
              moitieDouble.canReponseACompleter,
            )
          }
          break

        case 5:
          {
            const axe = myCan.lectureAbscisseEntiere()
            texte = axe.texte
            texteCorr = axe.texteCorr
            handleAnswers(this, index, { reponse: { value: axe.reponse } })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(axe.canEnonce)
            this.listeCanReponsesACompleter.push(axe.canReponseACompleter)
          }
          break

        case 6:
          {
            const facteursDUnProduit = myCan.trouverLesFacteursDUnProduit()
            texte = facteursDUnProduit.texte
            texteCorr = facteursDUnProduit.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: facteursDUnProduit.reponse,
                options: { texteAvecCasse: true },
              },
            })
            if (this.interactif && !context.isAmc) {
              texte +=
                '<br>Écris les deux nombres séparés par un point-virgule.'
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbersAvecPointVirgule,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(facteursDUnProduit.canEnonce)
            this.listeCanReponsesACompleter.push(
              facteursDUnProduit.canReponseACompleter,
            )
          }
          break

        case 7:
          {
            const sommeDeDurees = myCan.sommeDeDurees()
            texte = sommeDeDurees.texte
            texteCorr = sommeDeDurees.texteCorr
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )
            handleAnswers(this, index, {
              reponse: {
                value: new Hms({
                  hour: 1,
                  minute: Number(sommeDeDurees.reponse),
                }).toString(),
                options: { HMS: true },
              },
            })
            nbChamps = 1
            this.listeCanEnonces.push(sommeDeDurees.canEnonce)
            this.listeCanReponsesACompleter.push(
              sommeDeDurees.canReponseACompleter,
            )
          }
          break

        case 8:
          {
            const partages = myCan.partages()
            texte = partages.texte
            texteCorr = partages.texteCorr
            handleAnswers(this, index, { reponse: { value: partages.reponse } })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(partages.canEnonce)
            this.listeCanReponsesACompleter.push(partages.canReponseACompleter)
          }
          break

        case 9:
          {
            const ordreDeGrandeur = myCan.ordreDeGrandeur()
            texte = ordreDeGrandeur.texte
            texteCorr = ordreDeGrandeur.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: new Grandeur(
                  Number(ordreDeGrandeur.reponse),
                  ordreDeGrandeur.reponseUnite,
                ),
                options: { unite: true },
              },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.longueur,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(ordreDeGrandeur.canEnonce)
            this.listeCanReponsesACompleter.push(
              ordreDeGrandeur.canReponseACompleter,
            )
          }
          break

        case 10:
          {
            const ecrireUnNombreEnChiffre = myCan.ecrireUnNombreEnChiffres()
            texte = ecrireUnNombreEnChiffre.texte
            texteCorr = ecrireUnNombreEnChiffre.texteCorr
            handleAnswers(this, index, {
              reponse: { value: ecrireUnNombreEnChiffre.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(ecrireUnNombreEnChiffre.canEnonce)
            this.listeCanReponsesACompleter.push(
              ecrireUnNombreEnChiffre.canReponseACompleter,
            )
          }
          break

        case 11:
          {
            let dePlusDeMoins
            if (choice([true, false])) {
              dePlusDeMoins = myCan.dePlusDeMoins('billes')
            } else {
              dePlusDeMoins = myCan.dePlusDeMoins('ages')
            }
            texte = dePlusDeMoins.texte
            texteCorr = dePlusDeMoins.texteCorr
            handleAnswers(this, index, {
              reponse: { value: dePlusDeMoins.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                dePlusDeMoins.champTexteApres,
              )
            } else {
              texte +=
                'texteApres' in dePlusDeMoins.champTexteApres
                  ? dePlusDeMoins.champTexteApres.texteApres
                  : ''
            }
            nbChamps = 1
            this.listeCanEnonces.push(dePlusDeMoins.canEnonce)
            this.listeCanReponsesACompleter.push(
              dePlusDeMoins.canReponseACompleter,
            )
          }
          break

        case 12:
          {
            const ecritureDecimaleProduitEntierParDixiemesOuCentiemes =
              myCan.ecritureDecimaleProduitEntierParDixiemesOuCentiemes()
            texte = ecritureDecimaleProduitEntierParDixiemesOuCentiemes.texte
            texteCorr =
              ecritureDecimaleProduitEntierParDixiemesOuCentiemes.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value:
                  ecritureDecimaleProduitEntierParDixiemesOuCentiemes.reponse,
              },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              ecritureDecimaleProduitEntierParDixiemesOuCentiemes.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              ecritureDecimaleProduitEntierParDixiemesOuCentiemes.canReponseACompleter,
            )
          }
          break

        case 13:
          {
            const lectureAbscisseEntiereOrigineZero =
              myCan.lectureAbscisseEntiereOrigineZero()
            texte = lectureAbscisseEntiereOrigineZero.texte
            texteCorr = lectureAbscisseEntiereOrigineZero.texteCorr
            handleAnswers(this, index, {
              reponse: { value: lectureAbscisseEntiereOrigineZero.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              lectureAbscisseEntiereOrigineZero.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              lectureAbscisseEntiereOrigineZero.canReponseACompleter,
            )
          }
          break

        case 14:
          {
            const trouverUnTermeDecimalInconnu =
              myCan.trouverUnTermeDecimalInconnu()
            texte = trouverUnTermeDecimalInconnu.texte
            texteCorr = trouverUnTermeDecimalInconnu.texteCorr
            handleAnswers(this, index, {
              reponse: { value: trouverUnTermeDecimalInconnu.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(trouverUnTermeDecimalInconnu.canEnonce)
            this.listeCanReponsesACompleter.push(
              trouverUnTermeDecimalInconnu.canReponseACompleter,
            )
          }
          break

        case 15:
          {
            const decomposerUnNombreATroisChiffresEnDizainesUnites =
              myCan.decomposerUnNombreATroisChiffresEnDizainesUnites()
            texte = decomposerUnNombreATroisChiffresEnDizainesUnites.texte
            texteCorr =
              decomposerUnNombreATroisChiffresEnDizainesUnites.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: decomposerUnNombreATroisChiffresEnDizainesUnites.reponse,
                options: { texteAvecCasse: true },
              },
            })
            if (this.interactif && !context.isAmc) {
              texte +=
                "<br>Écris le nombre de dizaines puis d'unités dans cet ordre séparés par un point-virgule. "
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierFullOperations,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              decomposerUnNombreATroisChiffresEnDizainesUnites.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              decomposerUnNombreATroisChiffresEnDizainesUnites.canReponseACompleter,
            )
          }
          break

        case 16:
          {
            const determinerUneFractionAPartirDUneFigure =
              myCan.determinerUneFractionAPartirDUneFigure()
            texte = determinerUneFractionAPartirDUneFigure.texte
            texteCorr = determinerUneFractionAPartirDUneFigure.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: determinerUneFractionAPartirDUneFigure.reponse,
                options: { fractionEgale: true },
              },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              determinerUneFractionAPartirDUneFigure.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              determinerUneFractionAPartirDUneFigure.canReponseACompleter,
            )
          }
          break

        case 17:
          {
            const determinerUnQuotient = myCan.determinerUnQuotient()
            texte = determinerUnQuotient.texte
            texteCorr = determinerUnQuotient.texteCorr
            handleAnswers(this, index, {
              reponse: { value: determinerUnQuotient.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(determinerUnQuotient.canEnonce)
            this.listeCanReponsesACompleter.push(
              determinerUnQuotient.canReponseACompleter,
            )
          }
          break

        case 18:
          {
            let proportionnaliteParAddition
            if (choice([true, false])) {
              proportionnaliteParAddition =
                myCan.proportionnaliteParAddition('pieces')
            } else {
              proportionnaliteParAddition =
                myCan.proportionnaliteParAddition('cahiers')
            }
            texte = proportionnaliteParAddition.texte
            texteCorr = proportionnaliteParAddition.texteCorr
            handleAnswers(this, index, {
              reponse: { value: proportionnaliteParAddition.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += `${ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)} ${proportionnaliteParAddition.uniteInteractif} .`
            } else {
              texte += ` $\\ldots$ ${proportionnaliteParAddition.uniteInteractif}.`
            }
            nbChamps = 1
            this.listeCanEnonces.push(proportionnaliteParAddition.canEnonce)
            this.listeCanReponsesACompleter.push(
              proportionnaliteParAddition.canReponseACompleter,
            )
          }
          break

        case 19:
          {
            const determinerUnNombreDUnitesDeLongueur =
              myCan.determinerUnNombreDUnitesDeLongueur()
            texte = determinerUnNombreDUnitesDeLongueur.texte
            texteCorr = determinerUnNombreDUnitesDeLongueur.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: determinerUnNombreDUnitesDeLongueur.reponse,
                options: { fractionEgale: true },
              },
            })
            if (this.interactif && !context.isAmc) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(
                  this,
                  index,
                  KeyboardType.clavierDeBaseAvecFraction,
                ) +
                'ul'
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              determinerUnNombreDUnitesDeLongueur.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              determinerUnNombreDUnitesDeLongueur.canReponseACompleter,
            )
          }
          break

        case 20:
          {
            const multiplierParCinq = myCan.multiplierParCinq()
            texte = multiplierParCinq.texte
            texteCorr = multiplierParCinq.texteCorr
            handleAnswers(this, index, {
              reponse: { value: multiplierParCinq.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(multiplierParCinq.canEnonce)
            this.listeCanReponsesACompleter.push(
              multiplierParCinq.canReponseACompleter,
            )
          }
          break

        case 21:
          {
            const proportionnaliteEtVitesse = myCan.proportionnaliteEtVitesse(
              'premiere',
              vitesseCommunePourQ21Q22,
            )
            texte = proportionnaliteEtVitesse.texte
            texteCorr = proportionnaliteEtVitesse.texteCorr
            handleAnswers(this, index, {
              reponse: { value: proportionnaliteEtVitesse.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: ' $\\text{km}$' },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(proportionnaliteEtVitesse.canEnonce)
            this.listeCanReponsesACompleter.push(
              proportionnaliteEtVitesse.canReponseACompleter,
            )
          }
          break

        case 22:
          {
            const proportionnaliteEtVitesse = myCan.proportionnaliteEtVitesse(
              'seconde',
              vitesseCommunePourQ21Q22,
            )
            texte = proportionnaliteEtVitesse.texte
            texteCorr = proportionnaliteEtVitesse.texteCorr
            handleAnswers(this, index, {
              reponse: { value: proportionnaliteEtVitesse.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: ' $\\text{km}$' },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(proportionnaliteEtVitesse.canEnonce)
            this.listeCanReponsesACompleter.push(
              proportionnaliteEtVitesse.canReponseACompleter,
            )
          }
          break

        case 23:
          {
            const dansNCombienDeFoisP = myCan.dansNCombienDeFoisP()
            texte = dansNCombienDeFoisP.texte
            texteCorr = dansNCombienDeFoisP.texteCorr
            handleAnswers(this, index, {
              reponse: { value: dansNCombienDeFoisP.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(dansNCombienDeFoisP.canEnonce)
            this.listeCanReponsesACompleter.push(
              dansNCombienDeFoisP.canReponseACompleter,
            )
          }
          break

        case 24:
          {
            const determinerUnNombreDeDizainesDansUnEntierATroisChiffres =
              myCan.determinerUnNombreDeDizainesDansUnEntierATroisChiffres()
            texte = determinerUnNombreDeDizainesDansUnEntierATroisChiffres.texte
            texteCorr =
              determinerUnNombreDeDizainesDansUnEntierATroisChiffres.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value:
                  determinerUnNombreDeDizainesDansUnEntierATroisChiffres.reponse,
              },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              determinerUnNombreDeDizainesDansUnEntierATroisChiffres.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              determinerUnNombreDeDizainesDansUnEntierATroisChiffres.canReponseACompleter,
            )
          }
          break

        case 25:
          {
            const tracerUneFigureAireDonneeEnFonctionUniteAire =
              myCan.tracerUneFigureAireDonneeEnFonctionUniteAire('cm2')
            texte = tracerUneFigureAireDonneeEnFonctionUniteAire.texte
            texteCorr = tracerUneFigureAireDonneeEnFonctionUniteAire.texteCorr
            handleAnswers(this, index, {
              reponse: {
                value: tracerUneFigureAireDonneeEnFonctionUniteAire.reponse,
              },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: sp(5) + 'petits carreaux',
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              tracerUneFigureAireDonneeEnFonctionUniteAire.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              tracerUneFigureAireDonneeEnFonctionUniteAire.canReponseACompleter,
            )
          }
          break

        case 26:
          {
            const nombreDeDixiemesDansUnDecimal =
              myCan.nombreDeDixiemesDansUnDecimal()
            texte = nombreDeDixiemesDansUnDecimal.texte
            texteCorr = nombreDeDixiemesDansUnDecimal.texteCorr
            handleAnswers(this, index, {
              reponse: { value: nombreDeDixiemesDansUnDecimal.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += `${ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `<br>Dans $${texNombre(nombreDeDixiemesDansUnDecimal.nombre, 2)}$ il y a`,
                  texteApres: sp(5) + 'dixièmes en tout.',
                },
              )}`
            }
            nbChamps = 1
            this.listeCanEnonces.push(nombreDeDixiemesDansUnDecimal.canEnonce)
            this.listeCanReponsesACompleter.push(
              nombreDeDixiemesDansUnDecimal.canReponseACompleter,
            )
          }
          break

        case 27:
          {
            const proportionnaliteEtDiviseur =
              choice([true, false]) === true
                ? myCan.proportionnaliteEtDiviseur('stylos')
                : myCan.proportionnaliteEtDiviseur('cahiers')
            texte = proportionnaliteEtDiviseur.texte
            texteCorr = proportionnaliteEtDiviseur.texteCorr
            handleAnswers(this, index, {
              reponse: { value: proportionnaliteEtDiviseur.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: ' centimes',
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(proportionnaliteEtDiviseur.canEnonce)
            this.listeCanReponsesACompleter.push(
              proportionnaliteEtDiviseur.canReponseACompleter,
            )
          }
          break

        case 28:
          {
            const trouverUneDimensionAgrandieOuReduite =
              choice([true, false]) === true
                ? myCan.trouverUneDimensionAgrandieOuReduite('agrandissement')
                : myCan.trouverUneDimensionAgrandieOuReduite('reduction')
            texte = trouverUneDimensionAgrandieOuReduite.texte
            texteCorr = trouverUneDimensionAgrandieOuReduite.texteCorr
            handleAnswers(this, index, {
              reponse: { value: trouverUneDimensionAgrandieOuReduite.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: ' $\\text{cm}$',
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(
              trouverUneDimensionAgrandieOuReduite.canEnonce,
            )
            this.listeCanReponsesACompleter.push(
              trouverUneDimensionAgrandieOuReduite.canReponseACompleter,
            )
          }
          break

        case 29:
          {
            const ajouterDeuxDecimaux = myCan.ajouterDeuxDecimaux()
            texte = ajouterDeuxDecimaux.texte
            texteCorr = ajouterDeuxDecimaux.texteCorr
            handleAnswers(this, index, {
              reponse: { value: ajouterDeuxDecimaux.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `${sp(2)} $=$`,
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(ajouterDeuxDecimaux.canEnonce)
            this.listeCanReponsesACompleter.push(
              ajouterDeuxDecimaux.canReponseACompleter,
            )
          }
          break

        case 30:
        default:
          {
            const nombreDeCombinaisons =
              choice([true, false]) === true
                ? myCan.nombreDeCombinaisons('entreePlatDessert')
                : myCan.nombreDeCombinaisons('platDessert')
            texte = nombreDeCombinaisons.texte
            texteCorr = nombreDeCombinaisons.texteCorr
            handleAnswers(this, index, {
              reponse: { value: nombreDeCombinaisons.reponse },
            })
            if (this.interactif && !context.isAmc) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: `${sp(2)} repas`,
                },
              )
            }
            nbChamps = 1
            this.listeCanEnonces.push(nombreDeCombinaisons.canEnonce)
            this.listeCanReponsesACompleter.push(
              nombreDeCombinaisons.canReponseACompleter,
            )
          }
          break
      }

      if (this.questionJamaisPosee(i, texteCorr)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index += nbChamps
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
