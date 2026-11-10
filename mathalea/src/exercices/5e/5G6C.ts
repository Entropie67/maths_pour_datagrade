import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Compléter une phrase par la définition ou une propriété d'un parallélogramme"
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '05/04/2021'
export const dateDeModifImportante = '28/04/2025'

/**
 * On doit compléter des propriétés des parallélogrammes
 * @author Rémi Angot
 * Ajout de la possibilité de choisir le nombre de questions par Guillaume Valmont le 08/05/2022
 * Amélioration du QCM et de la sortie LaTex par Éric Elter le 28/04/2025
 */
export const uuid = 'af2c2'

export const refs = {
  'fr-fr': ['5G6C', '2G10-4'],
  'fr-2016': ['5G40-1'],
  'fr-ch': ['9R1ES2H-4', '9R2ES2H-4', '9R3ES2H-4', 'PRQES02B-7'],
}
export default class ProprietesDesParallelogrammes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de propriétés',
      3,
      "1 : Propriétés du parallélogramme (max. 4 questions)\n2 : Propriétés pour montrer qu'un quadrilatère est un parallélogramme (max. 5 questions)\n3 : Mélange (max. 9 questions)",
    ]
    this.sup = 3
    this.nbQuestions = 3
    this.besoinFormulaire2CaseACocher = [
      'Inclure les propriétés sur les angles',
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    this.consigne =
      "À l'aide de la définition ou d'une propriété d'un parallélogramme, "
    this.consigne +=
      this.nbQuestions === 1
        ? 'compléter la phrase suivante'
        : 'compléter les phrases suivantes'
    this.consigne +=
      this.interactif || context.isAmc
        ? ' en choisissant ce qui convient.'
        : '.'

    const typeQuestionsDisponibles =
      this.sup === 1
        ? [1, 2, 3, 4]
        : this.sup === 2
          ? [5, 6, 7, 8, 9]
          : range1(9)
    if (!this.sup2) {
      // on retire les propriétés sur les angles
      for (let j = typeQuestionsDisponibles.length - 1; j >= 0; j--) {
        if (
          typeQuestionsDisponibles[j] === 3 ||
          typeQuestionsDisponibles[j] === 9
        ) {
          typeQuestionsDisponibles.splice(j, 1)
        }
      }
    }
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.introduction = 'Dans cet exercice, on supposera que'
      this.introduction +=
        this.nbQuestions === 1
          ? ' le quadrilatère est non croisé.'
          : ' tous les quadrilatères sont non croisés.'

      switch (listeTypeQuestions[i]) {
        case 1:
          texte =
            this.interactif || context.isAmc
              ? 'Si un quadrilatère est un parallélogramme, alors ses côtés …'
              : 'Si un quadrilatère est un parallélogramme, alors ses côtés opposés … et …'
          texteCorr = `Si un quadrilatère est un parallélogramme, alors ses côtés ${texteEnCouleurEtGras('opposés sont parallèles et de même longueur')}.`
          break
        case 2:
          texte =
            'Si un quadrilatère est un parallélogramme, alors ses diagonales …'
          texteCorr = `Si un quadrilatère est un parallélogramme, alors ses diagonales ${texteEnCouleurEtGras('se coupent en leur milieu')}.`
          break
        case 3:
          texte =
            'Si un quadrilatère est un parallélogramme, alors ses angles …'
          texteCorr = `Si un quadrilatère est un parallélogramme, alors ses angles ${texteEnCouleurEtGras('opposés sont égaux')} et la somme de deux angles consécutifs est égale à $180^\\circ$.`
          break
        case 4:
          texte =
            this.interactif || context.isAmc
              ? 'Si un quadrilatère est un parallélogramme, alors …'
              : 'Si un quadrilatère est un parallélogramme, alors … symétrie …'
          texteCorr = `Si un quadrilatère est un parallélogramme, alors ${texteEnCouleurEtGras("il a un centre de symétrie qui est le point d'intersection de ses diagonales")} et donc ${texteEnCouleurEtGras('ses diagonales se coupent en leur milieu')}.`
          break
        case 5:
          texte =
            "Si un quadrilatère a ses diagonales …, alors c'est un parallélogramme."
          texteCorr = `Si un quadrilatère a ses diagonales ${texteEnCouleurEtGras('qui se coupent en leur milieu')}, alors c'est un parallélogramme.`
          break
        case 6:
          texte =
            this.interactif || context.isAmc
              ? "Si un quadrilatère a ses … parallèles, alors c'est un parallélogramme."
              : "Si un quadrilatère a ses côtés … parallèles, alors c'est un parallélogramme."
          texteCorr = `Si un quadrilatère a ${texteEnCouleurEtGras('ses côtés opposés')} parallèles, alors c'est un parallélogramme.`
          break
        case 7:
          texte =
            this.interactif || context.isAmc
              ? "Si un quadrilatère a ses … longueur, alors c'est un parallélogramme."
              : "Si un quadrilatère a ses côtés … longueur, alors c'est un parallélogramme."
          texteCorr = `Si un quadrilatère a ${texteEnCouleurEtGras('ses côtés opposés de même')} longueur, alors c'est un parallélogramme.`
          break
        case 8:
          texte =
            this.interactif || context.isAmc
              ? "Si un quadrilatère a deux côtés …, alors c'est un parallélogramme."
              : "Si un quadrilatère a deux côtés … et …, alors c'est un parallélogramme."
          texteCorr = `Si un quadrilatère a deux côtés ${texteEnCouleurEtGras('parallèles et de même longueur')}, alors c'est un parallélogramme.`
          break
        case 9:
        default:
          texte =
            this.interactif || context.isAmc
              ? "Si un quadrilatère a …, alors c'est un parallélogramme."
              : "Si un quadrilatère a … angles …, alors c'est un parallélogramme."
          texteCorr = `Si un quadrilatère a ${texteEnCouleurEtGras('ses angles opposés égaux')}, alors c'est un parallélogramme.`
          break
      }
      if (context.isHtml) texte = texte.replaceAll('…', '$\\ldots$')
      if (context.isAmc) texte = texte.replaceAll('…', '..............')
      if (!context.isHtml) {
        // Pour gérer les … et mettre l'espace qu'il faut pour remplir.
        texte = texte
          .replaceAll(/…,/g, '\\dotfill, \\\\') // Cas avec virgule
          .replaceAll(/…/g, '\\dotfill \\\\') // Cas général
      }

      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = context.isAmc
        ? { ordered: false }
        : { ordered: false, vertical: true }
      this.autoCorrection[i].enonce = `${texte}\n`
      if (listeTypeQuestions[i] < 4) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'opposés sont parallèles',
            statut: listeTypeQuestions[i] === 1,
          },
          {
            texte: 'opposés sont de même longueur',
            statut: listeTypeQuestions[i] === 1,
          },
          {
            texte: 'se coupent en leur milieu',
            statut: listeTypeQuestions[i] === 2,
          },
          // « opposés sont égaux » n'est valide que pour les angles et prête à
          // confusion avec « opposés sont de même longueur » pour les côtés.
          listeTypeQuestions[i] === 3
            ? { texte: 'opposés sont égaux', statut: true }
            : { texte: 'consécutifs sont de même longueur', statut: false },
          {
            texte: " sont le point d'intersection de ses diagonales",
            statut: false,
          },
        ]
      } else if (listeTypeQuestions[i] === 4) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'ses diagonales sont parallèles',
            statut: false,
          },
          {
            texte: 'ses diagonales sont de même longueur',
            statut: false,
          },
          {
            texte: 'ses diagonales se coupent en leur milieu',
            statut: true,
          },
          {
            texte: 'ses diagonales sont égales',
            statut: false,
          },
          {
            texte:
              "il a un centre de symétrie qui est le point d'intersection de ses diagonales",
            statut: true,
          },
        ]
      } else if (listeTypeQuestions[i] === 5) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'qui se coupent en leur milieu',
            statut: true,
          },
          {
            texte: 'qui sont de même longueur',
            statut: false,
          },
          {
            texte: 'qui sont parallèles',
            statut: false,
          },
          {
            texte: 'qui sont égales',
            statut: false,
          },
          {
            texte: 'qui ne se coupent pas',
            statut: false,
          },
        ]
      } else if (listeTypeQuestions[i] === 6) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'ses côtés opposés',
            statut: true,
          },
          {
            texte: 'ses côtés consécutifs',
            statut: false,
          },
          {
            texte: 'ses angles',
            statut: false,
          },
          {
            texte: 'ses diagonales',
            statut: false,
          },
          {
            texte: 'ses sommets',
            statut: false,
          },
        ]
      } else if (listeTypeQuestions[i] === 7) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'ses côtés opposés de même',
            statut: true,
          },
          {
            texte: 'ses côtés consécutifs de même',
            statut: false,
          },
          {
            texte: 'la distance entre ses angles de même',
            statut: false,
          },
          {
            texte: 'ses diagonales de quelconque',
            statut: false,
          },
          {
            texte: 'la distance entre ses sommets de même',
            statut: false,
          },
        ]
      } else if (listeTypeQuestions[i] === 8) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'parallèles et de même longueur',
            statut: true,
          },
          {
            texte: 'opposés parallèles',
            statut: false,
          },
          {
            texte: 'opposés de même longueur',
            statut: false,
          },
          {
            texte: 'diagonales de longueur quelconque',
            statut: false,
          },
          {
            texte: 'deux angles opposés de même mesure',
            statut: false,
          },
        ]
      } else if (listeTypeQuestions[i] === 9) {
        this.autoCorrection[i].propositions = [
          {
            texte: 'ses angles opposés de même mesure',
            statut: true,
          },
          {
            texte: 'ses angles opposés',
            statut: false,
          },
          {
            texte: 'ses sommets opposés',
            statut: false,
          },
          {
            texte: 'deux angles opposés de même mesure',
            statut: false,
          },
          {
            texte: 'ses côtés opposés',
            statut: false,
          },
        ]
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }

      if (this.questionJamaisPosee(i, texteCorr)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.nbQuestions = this.listeQuestions.length // MGu ici car parfois pas assez de questions différentes...
    this.autoCorrection = this.autoCorrection.slice(0, this.nbQuestions)
  }
}
