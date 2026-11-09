import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Katherine Johnson et la hauteur de la fusée'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '3e8ec'
export const refs = {
  'fr-fr': ['EgaliteFG3-4e-10', 'EgaliteFG4-3e-10'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Triangles semblables','Théorème de Pythagore']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription et programmation par Lydie El-Halougi
 */
export default class EgaliteFG10 extends Exercice {
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
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/johnson.jpg" alt="Portrait de Katherine Johnson" style="width:140px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Katherine Johnson (1918-2020) — Source${sp()}: NASA, domaine public</p></div>`
        : '') +
      "<br>En 1961, Katherine Johnson a joué un rôle crucial dans le calcul de la trajectoire du vol spatial de la mission Mercury-Redstone 3. Avant cet exploit, elle avait tenté de mesurer la hauteur d'une fusée en se basant sur sa propre taille.<br>" +
      "Katherine Johnson mesure $1{,}64\\text{ m}$. Elle se place à l'extrémité de l'ombre de la fusée, de sorte que l'extrémité de son ombre et celle de la fusée coïncident. Cela se produit lorsque la fusée est à $50\\text{ m}$ devant elle, avec $2{,}50\\text{ m}$ d'ombre derrière elle." +
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">
  <svg viewBox="0 0 250 165" style="max-width:320px; width:100%; height:auto;">
    <g stroke="#4a4a4a" stroke-width="1">
      <rect x="16" y="72" width="6" height="46" fill="#e8e8e8" />
      <rect x="38" y="72" width="6" height="46" fill="#e8e8e8" />
      <path d="M16,118 l-3,9 h9 l-2,-9 z" fill="#c0392b" stroke-width="0.6" />
      <path d="M44,118 l3,9 h-9 l2,-9 z" fill="#c0392b" stroke-width="0.6" />
      <path d="M22,110 l-9,12 v7 l9,-5 z" fill="#c0392b" stroke-width="0.6" />
      <path d="M38,110 l9,12 v7 l-9,-5 z" fill="#c0392b" stroke-width="0.6" />
      <rect x="22" y="30" width="16" height="88" fill="#fdfdfd" />
      <rect x="22" y="60" width="16" height="9" fill="#3b6fd4" stroke-width="0.7" />
      <rect x="22" y="100" width="16" height="18" fill="#c0392b" stroke-width="0.7" />
      <path d="M30,8 L22,30 L38,30 Z" fill="#c0392b" />
      <circle cx="30" cy="45" r="4" fill="#8ecae6" stroke-width="0.6" />
    </g>
    <line x1="20" y1="120" x2="232" y2="120" stroke="#333" />
    <line x1="30" y1="8" x2="222" y2="120" stroke="#333" stroke-dasharray="4,3" />
    <line x1="198" y1="106" x2="198" y2="120" stroke="#333" />
    <line x1="222" y1="73" x2="222" y2="120" stroke="#333" />
    <circle cx="30" cy="8" r="2.2" fill="#333" />
    <circle cx="30" cy="120" r="2.2" fill="#333" />
    <circle cx="198" cy="106" r="2.2" fill="#333" />
    <circle cx="198" cy="120" r="2.2" fill="#333" />
    <circle cx="222" cy="120" r="2.2" fill="#333" />
    <circle cx="222" cy="73" r="2.2" fill="#333" />
    <text x="18" y="8" font-size="11">F</text>
    <text x="22" y="134" font-size="11">F₁</text>
    <text x="182" y="103" font-size="11">K</text>
    <text x="192" y="134" font-size="11">P</text>
    <text x="227" y="124" font-size="11">T</text>
    <text x="227" y="71" font-size="11">T₁</text>
    <text x="126" y="145" text-anchor="middle" font-size="10">52,5 m</text>
  </svg>
  <p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Schéma (non à l'échelle) de la configuration de Thalès formée par les ombres</p>
</div>`
        : '')
    this.nbQuestions = 2
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      `.<br>Pourquoi les femmes sont-elles moins nombreuses que les hommes dans des domaines comme l'astronautique et les sciences spatiales${sp()}?<br>Cela est-il dû à des préjugés sociaux, à un manque de modèles féminins, ou à des barrières dans l'éducation${sp()}?`
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
    this.commentaireApprofondir =
      texteGras('Pour aller plus loin') +
      ".<br>Pour en savoir plus sur les métiers liés à l'aéronautique, un secteur innovant et captivant, et découvrir qu'ils sont accessibles à toutes et à tous, vous pouvez consulter " +
      ajouterLien(
        'https://www.onisep.fr/ressources/univers-metier/metiers/ingenieur-ingenieure-en-aeronautique',
        'cette fiche métier',
      ) +
      ' ou ' +
      ajouterLien(
        'https://oniseptv.onisep.fr/video/chloe-consultante-plm-aeronautique',
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
      `En utilisant la méthode de Katherine Johnson (triangles semblables formés par les ombres), quelle est la hauteur de la fusée, en mètres (arrondie au centième)${sp()}?`
    if (this.interactif)
      texte0 +=
        ajouteChampTexteMathLive(this, 0, '', { texteApres: 'm' }) + '<br>'
    handleAnswers(this, 0, { reponse: { value: 34.44 } })
    const correction0 =
      `Le point où coïncident les deux ombres est à $2{,}5\\text{ m}$ de Katherine et à $50+2{,}5=52{,}5\\text{ m}$ du pied de la fusée${sp()}: c'est le point $T$.<br>` +
      `$\\widehat{TPK}=\\widehat{TF_1F}=90^\\circ$${sp()}: les triangles $TPK$ et $TF_1F$ sont rectangles en $P$ et $F_1$.<br>` +
      '$\\widehat{PTK}=\\widehat{F_1TF}$ (angle commun, formé par le même rayon de soleil).<br>' +
      `Les deux triangles ont deux paires d'angles égaux deux à deux${sp()}: ils sont donc semblables.<br>` +
      'Les longueurs $TF_1$, $TF$ et $F_1F$ sont donc proportionnelles à $TP$, $TK$ et $PK$ respectivement.<br>' +
      "Le coefficient est égal à $TF_1\\div TP=52{,}5\\div 2{,}5=21$.<br>" +
      `donc $F_1F=21\\times PK=21\\times 1{,}64=${miseEnEvidence('34{,}44')}\\text{ m}$.`

    let texte1 =
      'Sachant que la fusée mesure en réalité $43$ mètres, calculer la longueur $FP$ (la Tyrolienne de secours reliant le sommet de la fusée à Katherine), en utilisant le théorème de Pythagore dans le triangle $FF_1P$, rectangle en $F_1$ (arrondie au centième).'
    if (this.interactif)
      texte1 +=
        ajouteChampTexteMathLive(this, 1, '', { texteApres: 'm' }) + '<br>'
    handleAnswers(this, 1, { reponse: { value: 65.95 } })
    const correction1 =
      'Le triangle $FF_1P$ est rectangle en $F_1$.<br>' +
      `D'après le théorème de Pythagore, on a${sp()}:<br>` +
      '$\\begin{aligned} FP^2&=FF_1^2+F_1P^2\\\\' +
      'FP^2&=43^2+50^2\\\\' +
      'FP^2&=1\\,849+2\\,500\\\\' +
      'FP^2&=4\\,349\\\\' +
      '\\text{Donc :}\\\\' +
      `FP&=\\sqrt{4\\,349}\\\\ FP&\\approx ${miseEnEvidence('65{,}95')}\\text{ m}\\end{aligned}$`

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat
    if (this.sup2)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    listeQuestionsToContenu(this)
  }
}
