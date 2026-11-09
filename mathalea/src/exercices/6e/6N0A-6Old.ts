import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.capytale.review.1.test.ts ⚠️
 */

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexte,
  ajouteChampTexteMathLive,
} from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import { amcConvert } from '../../lib/amc/amcBuilders'
import DragAndDrop from '../../lib/interactif/DragAndDrop'
import Exercice from '../Exercice'

export const titre = 'Écrire un nombre entier en chiffres ou en lettres'
export const amcReady = true
export const amcType = 'AMCOpen'

export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '19/09/2021'
export const dateDeModifImportante = '14/09/2022'
export const classeUnites = [
  { id: '1', contenu: 'unité' },
  { id: '2', contenu: 'unités' },
  { id: '3', contenu: 'dizaine' },
  { id: '4', contenu: 'dizaines' },
  { id: '5', contenu: 'centaine' },
  { id: '6', contenu: 'centaines' },
]
export const classeGrandes = [
  { id: '7', contenu: 'mille' },
  { id: '8', contenu: 'million' },
  { id: '9', contenu: 'millions' },
  { id: '10', contenu: 'milliard' },
  { id: '11', contenu: 'milliards' },
]
export const classeDecimales = [
  { id: '13', contenu: 'dixième' },
  { id: '14', contenu: 'dixièmes' },
  { id: '15', contenu: 'centième' },
  { id: '16', contenu: 'centièmes' },
  { id: '17', contenu: 'millième' },
  { id: '18', contenu: 'millièmes' },
]
export const nombres1A9 = [
  { id: '19', contenu: 'un' },
  { id: '20', contenu: 'deux' },
  { id: '21', contenu: 'trois' },
  { id: '22', contenu: 'quatre' },
  { id: '23', contenu: 'cinq' },
  { id: '24', contenu: 'six' },
  { id: '25', contenu: 'sept' },
  { id: '26', contenu: 'huit' },
  { id: '27', contenu: 'neuf' },
]
export const nombres10A20 = [
  { id: '28', contenu: 'dix' },
  { id: '29', contenu: 'onze' },
  { id: '30', contenu: 'douze' },
  { id: '31', contenu: 'treize' },
  { id: '32', contenu: 'quatorze' },
  { id: '33', contenu: 'quinze' },
  { id: '34', contenu: 'seize' },
  { id: '35', contenu: 'vingt' },
  { id: '36', contenu: 'vingts' },
]
export const nombres30A100 = [
  { id: '37', contenu: 'trente' },
  { id: '38', contenu: 'quarante' },
  { id: '39', contenu: 'cinquante' },
  { id: '40', contenu: 'soixante' },
  { id: '41', contenu: 'cent' },
  { id: '42', contenu: 'cents' },
]
export const nombresLiaisions = [
  { id: '12', contenu: '-' },
  { id: '43', contenu: 'et' },
  { id: '44', contenu: 'de' },
]
export const etiquettesNumeration = [
  classeUnites,
  classeGrandes,
  nombres1A9,
  nombres10A20,
  nombres30A100,
  nombresLiaisions,
]

/**
 * Écrire en chiffres ou en lettres un nombre entier inférieur à 1 000 000.
 * Avec des paramètres sur le nombre de chiffres des nombres voulus
 * Avec des paramètres sur la présence obligatoire de nombres avec 80 (et ses copains qui n'aiment pas mettre de S dans leur vin) et avec 100 (et ses copains comme ceux de 80)
 * @author Éric Elter
 * Relecture : Novembre 2021 par EE
 * Ajout d'une version drag & drop pour la version 'en lettres' par Jean-claude Lhote
 */
export const uuid = '0688e'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6N10'],
  'fr-ch': [''], // Primaire anciennement :['9NO1-1'],
}
export default class EcrirePetitsNombresEntiersOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Type de nombres',
      'Nombres séparés par des tirets :\n2 : À deux chiffres\n3 : À trois chiffres\n4 : À quatre chiffres\n5 : À cinq chiffres\n6 : À six chiffres\n7 : À neuf chiffres\n8 : À douze chiffres',
    ]
    this.sup = 4 // Valeur du paramètre par défaut
    this.besoinFormulaire2Texte = [
      'Demande particulière',
      'Nombres séparés par des tirets :\n0 : Aucune demande particulière.\n1 : Les nombres se terminent par 80.\n2 : Les nombres contiennent un nombre entre 81 et 99.\n3 : Les nombres se terminent par un multiple de 100.\n4 : Les nombres commencent par mille.\n5 : Les nombres ne possèdent ni centaines ou ni centaines de mille.',
    ]
    this.sup2 = 0 // Valeur du paramètre par défaut
    this.besoinFormulaire3Numerique = [
      'Type de questions',
      3,
      "1 : Écrire en lettres un nombre donné en chiffres\n2 : Écrire en chiffres un nombre donné en lettres\n3 : Passer d'une écriture à l'autre",
    ]
    this.sup3 = 1 // Valeur du paramètre par défaut
    this.besoinFormulaire4CaseACocher = [
      "Activer le drag and drop pour l'écriture en lettres (paramètre d'interactivité)",
      true,
    ]
    this.sup4 = true

    this.dragAndDrops = []
  }

  nouvelleVersion() {
    let typeDeConsigne = []
    this.dragAndDrops = []
    if (this.sup3 === 1) {
      this.consigne = 'Écrire le nombre en lettres.'
      typeDeConsigne = combinaisonListes([1], this.nbQuestions)
    } else if (this.sup3 === 2) {
      this.consigne = 'Écrire le nombre en chiffres.'
      typeDeConsigne = combinaisonListes([2], this.nbQuestions)
      if (this.interactif)
        this.consigne = 'Écrire le nombre en chiffres sans oublier les espaces.'
    } else {
      this.consigne =
        "Passer de l'écriture en chiffres à celle en lettres et inversement."
      typeDeConsigne = combinaisonListes([1, 2], this.nbQuestions)
    }

    const listeQuestions = gestionnaireFormulaireTexte({
      min: 2,
      max: 8,
      defaut: 8,
      melange: 0,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)

    const OptionsDisponibles = gestionnaireFormulaireTexte({
      min: 0,
      max: 5,
      defaut: 0,
      melange: 42,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      shuffle: false,
    }).map(Number)

    for (let i = OptionsDisponibles.length; i < this.nbQuestions; i++) {
      // On finit de remplir le tableau par des zéros (aucune demande particulière)
      OptionsDisponibles[i] = 0
    }
    const listeOptions = shuffle(OptionsDisponibles)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let NombreAEcrire // Comme la valeur sera modifiée, on la déclare avec let
      switch (listeOptions[i]) {
        case 0:
          if (listeQuestions[i] < 7) {
            NombreAEcrire = randint(
              1 + Math.pow(10, listeQuestions[i] - 1),
              Math.pow(10, listeQuestions[i]) - 1,
            )
          } else if (listeQuestions[i] === 7) {
            NombreAEcrire = randint(1 + Math.pow(10, 8), Math.pow(10, 9) - 1)
          } else {
            NombreAEcrire = randint(1 + Math.pow(10, 11), Math.pow(10, 12) - 1)
          }
          break
        case 1: // Se termine par 80
          if (listeQuestions[i] === 2) {
            NombreAEcrire = 80
          } else if (listeQuestions[i] < 7) {
            NombreAEcrire =
              80 +
              100 *
                Math.trunc(
                  randint(
                    1 + Math.pow(10, listeQuestions[i] - 3),
                    Math.pow(10, listeQuestions[i] - 2) - 1,
                  ),
                ) // Se termine par 80
          } else if (listeQuestions[i] === 7) {
            NombreAEcrire =
              80 +
              100 *
                Math.trunc(randint(1 + Math.pow(10, 6), Math.pow(10, 7) - 1))
          } else {
            NombreAEcrire =
              80 +
              100 *
                Math.trunc(randint(1 + Math.pow(10, 9), Math.pow(10, 10) - 1))
          }
          break
        case 2: // Contient 80 et quelques
          if (listeQuestions[i] === 2) {
            NombreAEcrire = 80 + randint(1, 19)
          } else if (listeQuestions[i] < 5) {
            NombreAEcrire =
              80 +
              randint(1, 19) +
              100 *
                Math.trunc(
                  randint(
                    1 + Math.pow(10, listeQuestions[i] - 3),
                    Math.pow(10, listeQuestions[i] - 2) - 1,
                  ),
                ) // Se termine par 80
          } else if (listeQuestions[i] < 7) {
            // Pour mettre aussi 80 et quelques dans la classe des milliers
            if (choice([true, false])) {
              NombreAEcrire =
                Math.pow(10, 3) *
                  (80 +
                    randint(1, 19) +
                    100 * (listeQuestions[i] - 5) * randint(1, 9)) +
                randint(0, 999)
            } else {
              NombreAEcrire =
                80 +
                randint(1, 19) +
                100 *
                  Math.trunc(
                    randint(
                      1 + Math.pow(10, listeQuestions[i] - 3),
                      Math.pow(10, listeQuestions[i] - 2) - 1,
                    ),
                  ) // Se termine par 80
            }
          } else if (listeQuestions[i] === 7) {
            // Pour mettre aussi 80 et quelques dans la classe des millions
            switch (choice([1, 2, 3])) {
              case 1:
                NombreAEcrire =
                  Math.pow(10, 6) *
                    (80 + randint(1, 19) + 100 * randint(1, 9)) +
                  randint(0, 999999)
                break
              case 2:
                NombreAEcrire =
                  Math.pow(10, 6) * randint(101, 999) +
                  Math.pow(10, 3) *
                    (80 + randint(1, 19) + 100 * Math.trunc(randint(11, 99))) +
                  randint(0, 999)
                break
              case 3:
              default:
                NombreAEcrire =
                  Math.pow(10, 3) * randint(100001, 999999) +
                  (80 + randint(1, 19) + 100 * randint(1, 9))
                break
            }
          } else {
            // Pour mettre aussi 80 et quelques dans la classe des milliards
            switch (choice([1, 2, 3, 4])) {
              case 1:
                NombreAEcrire =
                  Math.pow(10, 9) *
                    (80 + randint(1, 19) + 100 * randint(1, 9)) +
                  randint(0, 999999999)
                break
              case 2:
                NombreAEcrire =
                  Math.pow(10, 9) * randint(101, 999) +
                  Math.pow(10, 6) *
                    (80 + randint(1, 19) + 100 * randint(1, 9)) +
                  randint(0, 999999)
                break
              case 3:
                NombreAEcrire =
                  Math.pow(10, 6) * randint(100001, 999999) +
                  Math.pow(10, 3) *
                    (80 + randint(1, 19) + 100 * randint(1, 9)) +
                  randint(0, 999)
                break
              case 4:
              default:
                NombreAEcrire =
                  Math.pow(10, 3) * randint(100000001, 999999999) +
                  80 +
                  randint(1, 19) +
                  100 * randint(1, 9)
                break
            }
          }
          break
        case 3: // Se termine par 100
          if (listeQuestions[i] < 7) {
            NombreAEcrire =
              100 *
              Math.trunc(
                10 *
                  randint(
                    1 +
                      Math.round(
                        Math.pow(10, Math.max(listeQuestions[i] - 4, -1)),
                      ),
                    Math.pow(10, Math.max(listeQuestions[i] - 3, 0)) - 1,
                  ) +
                  randint(2, 8),
              ) // Ne pas mettre 9 à la place de 8, sinon on pourrait obtenir 10 pour des nombres à 3 chiffres
          } else if (listeQuestions[i] === 7) {
            NombreAEcrire =
              100 *
              (randint(Math.pow(10, 5), Math.pow(10, 6)) * 10 + randint(2, 9))
          } else {
            NombreAEcrire =
              100 *
              (randint(Math.pow(10, 8), Math.pow(10, 9)) * 10 + randint(2, 9))
          }
          break
        case 4: // Commence par mille.... (et non un-mille...)
          NombreAEcrire = 1000 + randint(1, 999)
          break
        case 5: // Pas de centaines ou pas de centaines de mille
        default:
          if (listeQuestions[i] === 7) {
            NombreAEcrire =
              Math.trunc(Math.pow(10, 7) * randint(1, 9)) + randint(1, 99999)
          } else if (listeQuestions[i] > 3) {
            NombreAEcrire =
              1000 *
                randint(
                  Math.pow(10, listeQuestions[i] - 4),
                  Math.pow(10, listeQuestions[i] - 3) - 1,
                ) +
              randint(1, 99)
          } else {
            NombreAEcrire = randint(1 + Math.pow(10, 1), Math.pow(10, 2) - 1)
          }
          break
      }
      // On factorise ceci : si context latex, l'énoncé can est d'écrire en chiffres
      if (!context.isHtml) {
        this.canEnonce = `Écrire le nombre en chiffres.
  
  
              ${nombreEnLettres(NombreAEcrire)}`
        this.correction = this.listeCorrections[0]
      }
      // Fin canEnonce
      if (typeDeConsigne[i] === 1) {
        let leDragAndDrop
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '<br>',
            propositions: [
              {
                texte: '',
                statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                sanscadre: true,
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          // Mise en place du drag & drop si case à cocher correspondante
          if (this.sup4) {
            const nombreEnEtiquettes = []
            const idTiret = etiquettesNumeration
              .flat()
              .find((el) => el.contenu === '-')?.id
            const reponses = nombreEnLettres(NombreAEcrire).split('-') // cette opération retire les tirets, il faut les remettre
            for (let index = 0; index < reponses.length; index++) {
              const id = etiquettesNumeration
                .flat()
                .find((el) => el.contenu === reponses[index])?.id
              if (!id)
                window.notify("Je ne trouve pas l'étiquette correspondante", {
                  terme: reponses[index],
                })
              nombreEnEtiquettes.push(id, idTiret) // ajout du tiret
            }
            nombreEnEtiquettes.pop() // on retire le dernier tiret
            const enonceATrous = `$${texNombre(NombreAEcrire)}$ s'écrit %{rectangle1}.`
            leDragAndDrop = new DragAndDrop({
              exercice: this,
              question: i,
              consigne:
                'Déplace les étiquettes pour former le nombre en lettres.',
              etiquettes: etiquettesNumeration,
              enonceATrous,
            })
            this.dragAndDrops[i] = leDragAndDrop
            handleAnswers(
              this,
              i,
              {
                rectangle1: {
                  value: [
                    nombreEnEtiquettes.filter((el) => el !== idTiret).join('|'),
                    nombreEnEtiquettes.join('|'),
                  ],
                  options: { ordered: true, multi: true },
                },
              },
              { formatInteractif: 'dnd' },
            )
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: nombreEnLettres(NombreAEcrire),
                options: { texteSansCasse: true },
              },
            })
          }
        }
        if (context.vue !== 'diap') {
          if (this.sup4 && this.interactif) {
            texte = leDragAndDrop!.ajouteDragAndDrop({
              melange: false,
              duplicable: true,
            })
          } else {
            texte = `$${texNombre(NombreAEcrire)} ${!context.isHtml ? ': \\pointilles[5cm]$' : !this.interactif ? ' :~\\dotfill $' : '$ <br>' + ajouteChampTexte(this, i, 'alphanumeric')}`
          }
        } else texte = `$${texNombre(NombreAEcrire)}$`
        if (context.vue !== 'diap')
          texteCorr = `$${texNombre(NombreAEcrire)}$ : ${texteEnCouleurEtGras(nombreEnLettres(NombreAEcrire))}`
        else
          texteCorr = `${texteEnCouleurEtGras(nombreEnLettres(NombreAEcrire))}`
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: texNombre(NombreAEcrire),
            options: { nombreAvecEspace: true },
          },
        })
        if (context.vue !== 'diap')
          texte = `${nombreEnLettres(NombreAEcrire)} ${!context.isHtml ? ': $\\pointilles[5cm]$' : !this.interactif ? ' :~$\\dotfill$' : ' <br>' + ajouteChampTexteMathLive(this, i, KeyboardType.numbersSpace, { espace: true })}`
        else texte = `${nombreEnLettres(NombreAEcrire)}`
        if (context.vue !== 'diap')
          texteCorr = `${nombreEnLettres(NombreAEcrire)} : $${miseEnEvidence(texNombre(NombreAEcrire))}$`
        else texteCorr = `$${miseEnEvidence(texNombre(NombreAEcrire))}$`
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, NombreAEcrire)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce ?? '')
        this.listeCanReponsesACompleter.push(this.canReponseACompleter ?? '')
        i++
      } else {
        if (context.isAmc) this.autoCorrectionAMC.pop()
        else this.autoCorrection.pop()
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
