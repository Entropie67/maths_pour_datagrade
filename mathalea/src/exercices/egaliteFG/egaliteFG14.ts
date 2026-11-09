import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '07/11/2026'
export const titre = 'Au pressing et à la table à repasser'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'bca94'
export const refs = {
  'fr-fr': ['3P11-1', 'EgaliteFG4-3e-14'],
  'fr-ch': [],
}

export const tags = [
  'égalité filles-garçons',
  'Grandeurs composées',
  'Théorème de Thalès',
]

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG14 extends Exercice {
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
      "<br><br>Lisa et Matthieu, deux élèves de troisième, souhaitent intégrer une seconde professionnelle pour se former aux métiers de l'entretien des textiles.<br><br>" +
      texteGras('Problème $\\mathbf{1}$') +
      "<br>Dans un pressing, Pauline et Lucas doivent gérer plusieurs machines de lavage. Chaque machine consomme $3{,}5$ kWh d'énergie par cycle. Le tarif de l'électricité est de $0{,}15$ € par kWh."
    this.nbQuestions = 5
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      ".<br>Pourquoi associe-t-on encore certains métiers (entretien, soin, propreté) à un genre ?<br>Les garçons sont-ils dissuadés d'entrer dans certaines filières ? Pourquoi ?"
    this.besoinFormulaireCaseACocher = [
      'Afficher «\u00a0Pour débattre\u00a0»',
      true,
    ]
    this.sup = true
    this.commentaireApprofondir =
      texteGras('Pour aller plus loin') +
      ".<br>Pour en savoir plus sur le métier du pressing et découvrir qu'il est accessible à toutes et à tous, vous pouvez consulter " +
      ajouterLien(
        'https://www.onisep.fr/ressources/univers-metier/metiers/teinturier-teinturiere-blanchisseur-blanchisseuse',
        'cette fiche métier',
      ) +
      ' ou ' +
      ajouterLien(
        'https://oniseptv.onisep.fr/video/cap-metiers-du-pressing',
        'cette vidéo',
      ) +
      " proposées par l'Onisep."
    this.besoinFormulaire2CaseACocher = [
      'Afficher «\u00a0Pour aller plus loin\u00a0»',
      true,
    ]
    this.sup2 = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 =
      "Quelle est la consommation totale d'énergie pour $15$ cycles de lavage dans une machine ?"
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: 'kWh' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 52.5 } })
    const correction0 = `$3{,}5\\times 15=${miseEnEvidence('52{,}5')}$ kWh.`

    let texte1 = 'Combien cela coûterait-il pour $15$ cycles dans une machine ?'
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 7.875 } })
    const correction1 = `$52{,}5\\times 0{,}15=${miseEnEvidence('7{,}875')}$ €.`

    let texte2 =
      "Si le pressing utilise $6$ machines effectuant chacune $15$ cycles, quelle sera la dépense totale pour l'énergie consommée ?"
    if (this.interactif)
      texte2 +=
        ajouteChampTexteMathLive(this, 2, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 2, { reponse: { value: 47.25 } })
    const correction2 = `$6\\times 7{,}875=${miseEnEvidence('47{,}25')}$ €.`

    let texte3 =
      "L'an prochain, le tarif de l'électricité augmentera de $10\\,\\%$. Combien cela coûtera-t-il pour $15$ cycles dans une machine après cette augmentation ?"
    if (this.interactif)
      texte3 +=
        ajouteChampTexteMathLive(this, 3, '', { texteApres: '€' }) + '<br>'
    handleAnswers(this, 3, { reponse: { value: 8.6625 } })
    const correction3 = `Nouveau tarif : $0{,}15\\times 1{,}1=0{,}165$ €/kWh. Coût pour $15$ cycles : $52{,}5\\times 0{,}165=${miseEnEvidence('8{,}6625')}$ €.`

    // Problème 2 : les tables à repasser (QCM)
    const texteQ4 =
      (context.isHtml
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/tables-repasser.jpg" alt="Deux tables à repasser avec les distances 21,6 cm, 25 cm, 52 cm, 60 cm (table A) et 18 cm, 24 cm, 48 cm, 64 cm (table B)" style="max-width:420px; width:100%; height:auto;"></div>'
        : '') +
      texteGras('Problème $\\mathbf{2}$') +
      "<br>Deux tables à repasser, posées sur un sol horizontal, ont chacune deux pieds qui se croisent en formant un «\u00a0X\u00a0». Pour la table A, les distances entre le point de croisement et les quatre extrémités valent $21{,}6\\text{ cm}$ et $25\\text{ cm}$ (côté plateau), $52\\text{ cm}$ et $60\\text{ cm}$ (côté sol). Pour la table B, ces distances valent $18\\text{ cm}$ et $24\\text{ cm}$ (côté plateau), $48\\text{ cm}$ et $64\\text{ cm}$ (côté sol).<br>Lisa affirme que seul le plateau de la table A est parallèle au sol. Matthieu soutient que c'est le plateau de la table B qui est parfaitement horizontal. Qui a raison ?"
    this.autoCorrection[4] = {
      enonce: texteQ4,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Lisa', statut: false },
        { texte: 'Matthieu', statut: true },
      ],
    }
    const monQcm4 = propositionsQcm(this, 4)
    let texte4 = texteQ4
    if (!context.isAmc) texte4 += monQcm4.texte
    const correction4 =
      "Notons $O$ le point de croisement des deux pieds d'une table, $P$ et $P'$ les deux points où les pieds touchent le plateau, et $S$ et $S'$ les deux points où ils touchent le sol. Sur chaque pied, le point de croisement est situé entre l'extrémité côté plateau et l'extrémité côté sol (les pieds se croisent en formant un «\u00a0X\u00a0») : les droites $(PS)$ et $(P'S')$ [les deux pieds] sont donc sécantes en $O$, avec $P$, $O$, $S$ et $P'$, $O$, $S'$ alignés dans le même ordre.<br><br>" +
      "Pour la table A ($OP=21{,}6\\text{ cm}$, $OP'=25\\text{ cm}$, $OS=52\\text{ cm}$, $OS'=60\\text{ cm}$) : d'une part, $\\dfrac{OP}{OS}=\\dfrac{21{,}6}{52}\\approx 0{,}4154$ ; d'autre part, $\\dfrac{OP'}{OS'}=\\dfrac{25}{60}\\approx 0{,}4167$.<br>" +
      "D'où : $\\dfrac{OP}{OS}\\neq \\dfrac{OP'}{OS'}$ : donc, d'après la contraposée du théorème de Thalès, le plateau de la table A (la droite $(PP')$) n'est pas parallèle au sol (la droite $(SS')$).<br><br>" +
      "Pour la table B ($OP=18\\text{ cm}$, $OP'=24\\text{ cm}$, $OS=48\\text{ cm}$, $OS'=64\\text{ cm}$) : d'une part, $\\dfrac{OP}{OS}=\\dfrac{18}{48}=0{,}375$ ; d'autre part, $\\dfrac{OP'}{OS'}=\\dfrac{24}{64}=0{,}375$.<br>" +
      "D'où : $\\dfrac{OP}{OS}=\\dfrac{OP'}{OS'}$ : donc, d'après la réciproque du théorème de Thalès, le plateau de la table B (la droite $(PP')$) est bien parallèle au sol (donc horizontal).<br><br>" +
      `${texteEnCouleurEtGras("C'est donc Matthieu qui a raison")}.`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    this.listeQuestions[2] = texte2
    this.listeCorrections[2] = correction2
    this.listeQuestions[3] = texte3
    this.listeCorrections[3] = correction3
    this.listeQuestions[4] = texte4
    this.listeCorrections[4] = correction4
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    listeQuestionsToContenu(this)
  }
}
