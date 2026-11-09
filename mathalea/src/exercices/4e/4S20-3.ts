import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const titre =
  'Différencier événements contraires, non contraires, compatibles, incompatibles (jeu de cartes)'
export const dateDePublication = '30/07/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModificationImportante = '27/10/2025'
export const uuid = '00bb0'
export const refs = {
  'fr-fr': ['4S20-3'],
  'fr-ch': ['11LCNO4B-3', '11LSNO4B-3'],
}

/**
 *  Différencier événements compatibles, incompatibles, contraires.
 * @author Mireille Gain

*/
export default class ExerciceProba extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Classer les événements selon qu'ils sont contraires ou non contraires.<br>On tire une carte dans un jeu de $32$ cartes."
    this.nbQuestions = 5
    this.besoinFormulaireNumerique = [
      'Notions testées',
      2,
      '1 : Contraires-Non contraires\n2 : Compatibles-Incompatibles-Contraires',
    ]
    this.sup = 1
    this.besoinFormulaire2CaseACocher = ['Afficher un jeu de 32 cartes']
    this.sup2 = false
    this.spacing = 1.2
    this.spacingCorr = 1.2
  }

  nouvelleVersion() {
    this.consigne =
      this.sup === 1
        ? "Classer les événements selon qu'ils sont contraires ou non contraires.<br>On tire une carte dans un jeu de $32$ cartes."
        : "Classer les événements selon qu'ils sont compatibles, incompatibles, ou contraires.<br>On tire une carte dans un jeu de $32$ cartes."
    if (context.isHtml && this.sup2) {
      const imageCartes =
        '<img src="/alea/images/jeu32cartes.png" alt="Jeu de 32 cartes" class="max-w-lg my-4">'
      this.consigne += imageCartes
    }
    // const typeDeQuestionsDisponibles = this.sup === 2 ? ['type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7'] : ['type6', 'type7', 'type8', 'type9', 'type10', 'type11', 'type12']
    const typeDeQuestionsDisponibles =
      this.sup === 2
        ? ['type1', 'type2', 'type3', 'type4', 'type5', 'type6']
        : ['type6', 'type8', 'type9', 'type10', 'type11', 'type12']
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, k, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let bonneReponse
      const figure = choice(['un Valet', 'une Dame', 'un Roi'])
      const famille = choice(['Carreau', 'Cœur', 'Pique', 'Trèfle'])
      const couleur = choice(['rouge', 'noire'])
      const nombre = choice(['As', 'Sept', 'Huit', 'Neuf', 'Dix'])
      const valeur = choice([
        'un As',
        'un Sept',
        'un Huit',
        'un Neuf',
        'un Dix',
        'un Valet',
        'une Dame',
        'un Roi',
      ])
      const trefleOuPique = choice(['Trèfle', 'Pique'])
      const carreauOuCoeur = choice(['Carreau', 'Cœur'])

      k = choice([1, 2])
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1':
          if (k === 1) {
            texte = `Les événements «${sp()}Obtenir ${figure}${sp()}» et «${sp()}Obtenir un ${nombre}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir ${figure}${sp()}» et «${sp()}Obtenir un ${nombre}${sp()}» sont ` +
              texteEnCouleurEtGras('incompatibles') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir un ${nombre}${sp()}» et «${sp()}Obtenir ${figure}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${nombre}${sp()}» et «${sp()}Obtenir ${figure}${sp()}» sont ` +
              texteEnCouleurEtGras('incompatibles') +
              '.<br>'
          }
          bonneReponse = 'incompatibles'
          break
        case 'type2':
          if (k === 1) {
            texte = `Les événements «${sp()}Obtenir un ${valeur}${sp()}» et «${sp()}Obtenir un ${famille}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${valeur}${sp()}» et «${sp()}Obtenir un ${famille}${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir un ${famille}${sp()}» et «${sp()}Obtenir un ${valeur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${famille}${sp()}» et «${sp()}Obtenir un ${valeur}${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          }
          bonneReponse = 'compatibles'
          break
        case 'type3':
          if (k === 1) {
            texte =
              'Les événements «\u00a0Obtenir une carte de couleur noire\u00a0» et «\u00a0Obtenir une carte de couleur rouge\u00a0» sont $\\ldots$<br>'
            texteCorr =
              'Les événements «\u00a0Obtenir une carte de couleur noire\u00a0» et «\u00a0Obtenir une carte de couleur rouge\u00a0» sont ' +
              texteEnCouleurEtGras('contraires') +
              '. (et donc ' +
              texteEnCouleurEtGras('incompatibles') +
              ')<br>'
          } else {
            texte =
              'Les événements «\u00a0Obtenir une carte de couleur rouge\u00a0» et «\u00a0Obtenir une carte de couleur noire\u00a0» sont $\\ldots$<br>'
            texteCorr =
              'Les événements «\u00a0Obtenir une carte de couleur rouge\u00a0» et «\u00a0Obtenir une carte de couleur noire\u00a0» sont ' +
              texteEnCouleurEtGras('contraires') +
              '. (et donc ' +
              texteEnCouleurEtGras('incompatibles') +
              ')<br>'
          }
          bonneReponse = 'contraires'
          break
        case 'type4':
          if (k === 2) {
            texte = `Les événements «${sp()}Obtenir ${figure}${sp()}» et «${sp()}Obtenir une carte de couleur ${couleur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir ${figure}${sp()}» et «${sp()}Obtenir une carte de couleur ${couleur}${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir ${figure}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir ${figure}${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          }
          bonneReponse = 'compatibles'
          break
        case 'type5':
          if (k === 2) {
            texte = `Les événements «${sp()}Obtenir un ${trefleOuPique}${sp()}» et «${sp()}Obtenir une carte de couleur noire${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${trefleOuPique}${sp()}» et «${sp()}Obtenir une carte de couleur noire${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» et «${sp()}Obtenir une carte de couleur rouge${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» et «${sp()}Obtenir une carte de couleur rouge${sp()}» sont ` +
              texteEnCouleurEtGras('compatibles') +
              '.<br>'
          }
          bonneReponse = 'compatibles'
          break
        case 'type6':
          if (k === 1) {
            texte =
              'Les événements «\u00a0Obtenir un Carreau ou un Cœur\u00a0» et «\u00a0Obtenir une carte de couleur noire\u00a0» sont $\\ldots$<br>'
            texteCorr =
              'Les événements «\u00a0Obtenir un Carreau ou un Cœur\u00a0» et «\u00a0Obtenir une carte de couleur noire\u00a0» sont ' +
              texteEnCouleurEtGras('contraires')
            if (this.sup === 2) {
              texteCorr +=
                ' (et donc ' + texteEnCouleurEtGras('incompatibles') + ')'
            }
            texteCorr += '.<br>'
          } else {
            texte =
              'Les événements «\u00a0Obtenir un Trèfle ou un Pique\u00a0» et «\u00a0Obtenir une carte de couleur rouge\u00a0» sont $\\ldots$<br>'
            texteCorr =
              'Les événements «\u00a0Obtenir un Trèfle ou un Pique\u00a0» et «\u00a0Obtenir une carte de couleur rouge\u00a0» sont ' +
              texteEnCouleurEtGras('contraires')
            if (this.sup === 2) {
              texteCorr +=
                ' (et donc ' + texteEnCouleurEtGras('incompatibles') + ')'
            }
            texteCorr += '.<br>'
          }
          bonneReponse = 'contraires'
          break
        // ToFix ces évènements ne sont pas contraires
        // case 'type7':
        //   if (k === 1) {
        //     texte = 'Les événements « Obtenir une figure autre qu\'un Roi » et « Obtenir une Dame ou un Valet » sont...<br>'
        //     texteCorr = 'Les événements « Obtenir une figure autre qu\'un Roi » et « Obtenir une Dame ou un Valet » sont ' + texteEnCouleurEtGras('contraires')
        //     if (this.sup === 2) { texteCorr += ' (et donc ' + texteEnCouleurEtGras('incompatibles') + ')' }
        //     texteCorr += '.<br>'
        //   } else {
        //     texte = 'Les événements « Obtenir une figure autre qu\'une Dame » et « Obtenir un Valet ou un Roi » sont...<br>'
        //     texteCorr = 'Les événements « Obtenir une figure autre qu\'une Dame » et « Obtenir un Valet ou un Roi » sont ' + texteEnCouleurEtGras('contraires') + '.<br>'
        //     if (this.sup === 2) { texteCorr += ' (et donc ' + texteEnCouleurEtGras('incompatibles') + ')' }
        //     texteCorr += '.<br>'
        //   }
        //   bonneReponse = 'contraires'
        //   break
        case 'type8':
          if (k === 2) {
            texte =
              "Les événements «\u00a0Obtenir une carte autre qu'un Roi\u00a0» et «\u00a0Obtenir une Dame ou un Valet\u00a0» sont $\\ldots$<br>"
            texteCorr =
              "Les événements «\u00a0Obtenir une carte autre qu'un Roi\u00a0» et «\u00a0Obtenir une Dame ou un Valet\u00a0» sont " +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          } else {
            texte =
              "Les événements «\u00a0Obtenir une carte autre qu'une Dame\u00a0» et «\u00a0Obtenir un Valet ou un Roi\u00a0» sont $\\ldots$<br>"
            texteCorr =
              "Les événements «\u00a0Obtenir une carte autre qu'une Dame\u00a0» et «\u00a0Obtenir un Valet ou un Roi\u00a0» sont " +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          }
          bonneReponse = 'non contraires'
          break
        case 'type9':
          if (k === 1) {
            texte = `Les événements «${sp()}Obtenir une carte autre qu' ${figure}${sp()}» et «${sp()}Obtenir ${figure}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir ${figure}${sp()}» et «${sp()}Obtenir une carte autre qu' ${figure}${sp()}» sont ` +
              texteEnCouleurEtGras('contraires') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir une carte autre qu'un ${nombre}${sp()}» et «${sp()}Obtenir un ${nombre}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir une carte autre qu'un ${nombre} ${sp()}» et «${sp()}Obtenir un ${nombre}${sp()}» sont ` +
              texteEnCouleurEtGras('contraires') +
              '.<br>'
          }
          bonneReponse = 'contraires'
          break
        case 'type10':
          if (k === 2) {
            texte = `Les événements «${sp()}Ne pas obtenir ${valeur}${sp()}» et «${sp()}Obtenir ${valeur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Ne pas obtenir ${valeur}${sp()}» et «${sp()}Obtenir ${valeur}${sp()}» sont ` +
              texteEnCouleurEtGras('contraires') +
              ' (et donc ' +
              texteEnCouleurEtGras('incompatibles') +
              ').<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir ${valeur}${sp()}» et «${sp()}Ne pas obtenir ${valeur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir ${valeur}${sp()}» et «${sp()}Ne pas obtenir ${valeur}${sp()}» sont ` +
              texteEnCouleurEtGras('contraires') +
              ' (et donc ' +
              texteEnCouleurEtGras('incompatibles') +
              ').<br>'
          }
          bonneReponse = 'contraires'
          break
        case 'type11':
          if (k === 2) {
            texte = `Les événements «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir un ${trefleOuPique}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir un ${trefleOuPique}${sp()}» sont ` +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir un ${trefleOuPique}${sp()}» et «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${trefleOuPique}${sp()}» et «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» sont ` +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          }
          bonneReponse = 'non contraires'
          break
        case 'type12':
        default:
          if (k === 1) {
            texte = `Les événements «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» et «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» sont ` +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          } else {
            texte = `Les événements «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» et «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» sont $\\ldots$<br>`
            texteCorr =
              `Les événements «${sp()}Obtenir un ${carreauOuCoeur}${sp()}» et «${sp()}Ne pas obtenir une carte de couleur ${couleur}${sp()}» sont ` +
              texteEnCouleurEtGras('non contraires') +
              '.<br>'
          }
          bonneReponse = 'non contraires'
          break
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: true }
      this.autoCorrection[i].enonce = `${texte}\n`
      if (this.sup === 2) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'compatibles',
            statut: bonneReponse === 'compatibles',
          },
          {
            texte: 'incompatibles',
            statut:
              bonneReponse === 'incompatibles' || bonneReponse === 'contraires',
          },
          {
            texte: 'contraires',
            statut: bonneReponse === 'contraires',
          },
        ]
      } else {
        this.autoCorrection[i].propositions = [
          {
            texte: 'contraires',
            statut: bonneReponse === 'contraires',
          },
          {
            texte: 'non contraires',
            statut: bonneReponse === 'non contraires',
          },
        ]
      }

      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
