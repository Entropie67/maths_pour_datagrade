import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import ExerciceVraiFaux from '../ExerciceVraiFaux'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Une étagère pour pompiers'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'a40d0'
export const refs = {
  'fr-fr': ['EgaliteFG3-4e-9', 'EgaliteFG4-3e-9'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Théorème de Pythagore','Trigonométrie']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG9 extends ExerciceVraiFaux {
  commentaireDebat = ''
  commentaireApprofondir = ''

  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.consigne = texteItalique(
      "D'après " +
        ajouterLien(
          'https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true',
          "«\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles",
        ),
    )
    this.consigne +=
      "<br><br>Pour s'entraîner au concours des pompiers de Paris, Sam et Camélia veulent se construire une étagère pour la fameuse épreuve de la planche. Ils ont fait le croquis ci-dessous, qui n'est pas à l'échelle. Le triangle $ABC$ représente l'étagère $[AB]$, le mur $[AC]$ et le support diagonal $[BC]$, avec $AB=72\\text{ cm}$, $AC=96\\text{ cm}$ et $BC=1{,}2\\text{ m}$.<br>" +
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/etagere-pompiers.jpg" alt="Étagère de pompiers${sp()}: triangle ABC avec AB=72 cm, AC=96 cm, BC=1,2 m" style="max-width:260px; width:100%; height:auto;"></div>`
        : '') +
      `Camélia affirme${sp()}: «\u00a0Pour calculer les mesures des angles $\\widehat{ABC}$ et $\\widehat{ACB}$, on doit utiliser la formule du sinus\u00a0». Sam affirme${sp()}: «\u00a0Tu as tort, on doit utiliser la formule du cosinus\u00a0».`
    this.nbQuestions = 2
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Comment percevez-vous la place des femmes et des hommes dans la profession de pompier${sp()}?<br>Est-ce que l'équité entre les sexes est réellement présente dans les équipes de pompiers, et quelles seraient les solutions pour rendre cette profession plus inclusive${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
    this.commentaireApprofondir =
      texteGras('Pour aller plus loin') +
      ".<br>Pour en savoir plus sur le métier de pompier et découvrir qu'il est accessible à toutes et à tous, vous pouvez consulter " +
      ajouterLien(
        'https://www.onisep.fr/ressources/univers-metier/metiers/sapeur-pompier',
        'cette fiche métier',
      ) +
      ' ou ' +
      ajouterLien(
        'https://oniseptv.onisep.fr/video/sapeur-pompier-1',
        'cette vidéo',
      ) +
      " proposées par l'Onisep."
    this.besoinFormulaire2CaseACocher = [
      'Afficher «\u00a0Pour aller plus loin\u00a0»',
      true,
    ]
    this.sup2 = true
    this.affirmations = [
      {
        texte: "L'étagère $[AB]$ est bien perpendiculaire au mur $[AC]$.",
        statut: true,
        correction: `Dans le triangle $ABC$, le plus grand côté est $[BC]$, avec $BC=120\\text{ cm}$.<br>$BC^2=120^2=14\\,400$<br>$AB^2+AC^2=72^2+96^2=5\\,184+9\\,216=14\\,400$<br>On constate que $BC^2=AB^2+AC^2$, l'égalité de Pythagore est vérifiée. D'après la réciproque du théorème de Pythagore, le triangle $ABC$ est rectangle en $A$, donc ${texteEnCouleurEtGras("l'étagère")} $${miseEnEvidence('[AB]')}$ ${texteEnCouleurEtGras('est bien perpendiculaire au mur')} $${miseEnEvidence('[AC]')}$.`,
      },
      {
        texte:
          `Sam a raison${sp()}: seule la formule du cosinus permet de calculer les angles $\\widehat{ABC}$ et $\\widehat{ACB}$.`,
        statut: false,
        correction: `Le triangle $ABC$ est rectangle en $A$, et ses trois côtés sont connus ($72\\text{ cm}$, $96\\text{ cm}$ et $120\\text{ cm}$)${sp()}: on peut donc calculer l'angle $\\widehat{ABC}$ aussi bien avec le sinus qu'avec le cosinus.<br>Avec le sinus${sp()}: $\\sin\\left(\\widehat{ABC}\\right)=\\dfrac{AC}{BC}=\\dfrac{96}{120}=0{,}8$, donc $\\widehat{ABC}=\\arcsin(0{,}8)\\approx 53{,}1°$.<br>Avec le cosinus${sp()}: $\\cos\\left(\\widehat{ABC}\\right)=\\dfrac{AB}{BC}=\\dfrac{72}{120}=0{,}6$, donc $\\widehat{ABC}=\\arccos(0{,}6)\\approx 53{,}1°$.<br>Les deux méthodes donnent bien le même résultat${sp()}: ${texteEnCouleurEtGras('Camélia et Sam ont donc chacun raison')}, ni l'une ni l'autre des deux méthodes n'est fausse.`,
      },
    ]
  }

  nouvelleVersion() {
    const introConsigne = this.consigne
    super.nouvelleVersion()
    this.consigne = introConsigne + '<br><br>' + this.consigne
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    imposerCorrectionsQcm(this)
    listeQuestionsToContenu(this)
  }
}
