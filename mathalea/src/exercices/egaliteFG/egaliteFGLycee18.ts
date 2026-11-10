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
import { sp } from '../../lib/outils/outilString'

export const titre = "La sorcière d'Agnesi"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '8d8d5'
export const refs = {
  'fr-fr': ['EgaliteFG7-Tle-18'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons', 'Fonctions', 'Dérivation', 'Limites de fonctions']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFGLycee18 extends Exercice {
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
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/agnesi.jpg" alt="Portrait de Maria Gaetana Agnesi" style="width:120px; height:auto; border-radius:9999px; border:3px solid #f15929;"><p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Maria Gaetana Agnesi (1718-1799) — Source${sp()}: Wikimedia Commons, domaine public</p></div>`
        : '') +
      `<br>Maria Gaetana Agnesi (1718-1799), mathématicienne italienne, a étudié une courbe appelée «${sp()}sorcière d'Agnesi${sp()}».<br>` +
      `Soit $a>0$. Dans un repère orthonormé d'origine $O$, on considère le point $M(0${sp()};${sp()}a)$ et $\\mathcal{C}$ le cercle de diamètre $[OM]$.<br>` +
      '$A$ est un point mobile sur le cercle.<br>' +
      '$N$ est le point de la tangente au cercle passant par $M$ tel que les points $O$, $A$ et $N$ sont alignés.<br>' +
      '$Q$ est sur le diamètre $[OM]$ tel que $(QA)$ et $(MN)$ sont parallèles.<br>' +
      '$P$ est sur la perpendiculaire à $(MN)$ passant par $N$ tel que les points $Q$, $A$ et $P$ sont alignés.<br><br>' +
      "La sorcière d'Agnesi est le lieu géométrique des points $P$ lorsque $A$ parcourt le cercle.<br>" +
      `Dans la suite, on considère que $a=2$. On note $(x${sp()};${sp()}y)$ les coordonnées de $P$ et $(u${sp()};${sp()}y)$ celles de $A$.<br>` +
      `On en déduit les coordonnées de l'ensemble des points de la figure${sp()}:<br>` +
      `$O(0${sp()};${sp()}0)$${sp()}: donnée initiale.<br>` +
      `$M(0${sp()};${sp()}2)$${sp()}: donnée initiale.<br>` +
      `$P(x${sp()};${sp()}y)$${sp()}: par définition.<br>` +
      `$N(x${sp()};${sp()}2)$${sp()}: même ordonnée que $M$, même abscisse que $P$ par construction.<br>` +
      `$Q(0${sp()};${sp()}y)$${sp()}: même ordonnée que $A$ et abscisse nulle.<br>` +
      `$A(u${sp()};${sp()}y)$${sp()}: même ordonnée que $P$.<br>` +
      (context.isHtml
        ? `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">
  <svg viewBox="0 0 270 220" style="max-width:300px; width:100%; height:auto;">
    <line x1="20" y1="190" x2="255" y2="190" stroke="#333" />
    <line x1="60" y1="205" x2="60" y2="65" stroke="#333" />
    <circle cx="60" cy="140" r="50" fill="none" stroke="#333" />
    <line x1="60" y1="190" x2="233" y2="90" stroke="#3b6fd4" />
    <line x1="60" y1="90" x2="233" y2="90" stroke="#333" />
    <line x1="60" y1="165" x2="233" y2="165" stroke="#3b6fd4" />
    <line x1="233" y1="90" x2="233" y2="165" stroke="#3b6fd4" stroke-dasharray="3,2" />
    <circle cx="60" cy="190" r="2.5" fill="#333" />
    <circle cx="60" cy="90" r="2.5" fill="#333" />
    <circle cx="233" cy="90" r="2.5" fill="#333" />
    <circle cx="60" cy="165" r="2.5" fill="#3b6fd4" />
    <circle cx="103" cy="165" r="2.5" fill="#3b6fd4" />
    <circle cx="233" cy="165" r="2.5" fill="#3b6fd4" />
    <text x="44" y="203" font-size="11">O</text>
    <text x="44" y="86" font-size="11">M</text>
    <text x="238" y="86" font-size="11">N</text>
    <text x="42" y="160" font-size="11">Q</text>
    <text x="103" y="180" font-size="11" text-anchor="middle">A</text>
    <text x="238" y="178" font-size="11">P</text>
    <text x="52" y="72" font-size="11">y</text>
    <text x="245" y="205" font-size="11">x</text>
  </svg>
  <p style="font-size:0.7rem; font-style:italic; opacity:0.7;">Construction géométrique de la sorcière d'Agnesi (d'après le livret)</p>
</div>`
        : `
\\begin{center}
\\begin{tikzpicture}[scale=0.9, point/.style={circle, fill=black, inner sep=1pt}]
    \\coordinate (O) at (0,0);
    \\coordinate (M) at (0,2);
    \\coordinate (N) at (3.46,2);
    \\coordinate (Q) at (0,0.5);
    \\coordinate (A) at (0.87,0.5);
    \\coordinate (P) at (3.46,0.5);
    \\draw[->] (-0.5,0) -- (4,0) node[right] {$x$};
    \\draw[->] (0,-0.5) -- (0,2.6) node[above] {$y$};
    \\draw (0,1) circle (1);
    \\draw[blue] (O) -- (N);
    \\draw (M) -- (N);
    \\draw[blue] (Q) -- (P);
    \\draw[blue, dashed] (N) -- (P);
    \\node[point, label=below left:$O$] at (O) {};
    \\node[point, label=left:$M$] at (M) {};
    \\node[point, label=right:$N$] at (N) {};
    \\node[point, blue, label=left:$Q$] at (Q) {};
    \\node[point, blue, label=below:$A$] at (A) {};
    \\node[point, blue, label=right:$P$] at (P) {};
\\end{tikzpicture}
\\end{center}
`) +
      'Dans toute la Partie A, $x$, $y$ et $u$ sont des réels.'
    this.nbQuestions = 10
    this.nbQuestionsModifiable = false
    this.commentaireApprofondir =
      texteGras('Pour approfondir') +
      '.<br>' +
      '$\\bullet$ Le livre <i>Matheuses, Les filles, avenir des mathématiques</i> de Clémence Perronnet, Claire Marc et Olga Paris-Romaskevich.<br>' +
      "$\\bullet$ Dans le cadre de la préparation au Grand Oral, on peut proposer aux élèves de préparer un exposé de $5$ minutes sur d'autres grandes mathématiciennes (Ada Lovelace, Hypatie d'Alexandrie, Wang Zhenyi, Maryam Mirzakhani, etc. Cf. le site «\u00a0L'histoire par les femmes\u00a0»)<br>" +
      '$\\bullet$ Dans le cadre de la préparation au Grand Oral, on peut proposer aux élèves de préparer une présentation autour du thème «\u00a0Où sont les femmes en maths ?\u00a0» qui abordera la part des filles en spécialité maths en terminale, la proportion de femmes en études scientifiques et la présence des femmes parmi les chercheurs/chercheuses en mathématiques (médaille Fields notamment).<br>' +
      `$\\bullet$ On peut également proposer aux élèves un échange autour des questions suivantes${sp()}:<br>` +
      '$\\quad$§ «\u00a0Les filles sont-elles “naturellement” moins douées en maths ?\u00a0»<br>' +
      "$\\quad$§ «\u00a0Le fait que peu de femmes soient reconnues dans l'histoire des maths veut-il dire qu'elles n'y ont pas contribué ?\u00a0»<br><br>" +
      ajouterLien(
        'https://fr.wikipedia.org/wiki/Maria_Gaetana_Agnesi',
        'Pour mieux connaître Maria Gaetana Agnesi',
      )
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour approfondir\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const texte0 =
      texteGras(`Partie A${sp()}: expression de $x$ en fonction de $y$`) +
      "<br>Le point $A$ appartient au cercle $\\mathcal{C}$ de diamètre $[OM]$. Démontrer que les coordonnées de $A$ vérifient l'égalité $u^2+y^2-2y=0$."
    const correction0 = `Le triangle $OAM$ est inscrit dans le cercle $\\mathcal{C}$ de diamètre $[OM]$${sp()}: d'après la propriété de l'angle inscrit dans un demi-cercle, il est rectangle en $A$, donc $\\vec{AO}\\cdot\\vec{AM}=0$. Avec $O(0${sp()};${sp()}0)$, $M(0${sp()};${sp()}2)$ et $A(u${sp()};${sp()}y)$, on a $\\vec{AO}(-u${sp()};${sp()}-y)$ et $\\vec{AM}(-u${sp()};${sp()}2-y)$, d'où $(-u)\\times(-u)+(-y)\\times(2-y)=0$, soit $u^2-2y+y^2=0$, c'est-à-dire $${miseEnEvidence('u^2+y^2-2y=0')}$.`

    const texte1 =
      `Démontrer que l'égalité suivante est vraie${sp()}: $\\dfrac{QA}{QO}=\\dfrac{MN}{MO}$.`
    const correction1 =
      "Comme $(QA)$ et $(MN)$ sont parallèles, avec $Q\\in[OM]$ et $A\\in(ON)$ (puisque $O$, $A$, $N$ sont alignés), le théorème de Thalès dans le triangle $OMN$ donne $\\dfrac{OQ}{OM}=\\dfrac{OA}{ON}=\\dfrac{QA}{MN}$, d'où l'on tire $\\dfrac{QA}{QO}=\\dfrac{MN}{MO}$."

    const texte2 = `En déduire que${sp()}: $u=\\dfrac{xy}{2}$.`
    const correction2 = `$Q(0${sp()};${sp()}y)$ et $A(u${sp()};${sp()}y)$ ont la même ordonnée, donc $QA=u$ ; $Q(0${sp()};${sp()}y)$ et $O(0${sp()};${sp()}0)$ ont la même abscisse, donc $QO=y$ ; $M(0${sp()};${sp()}2)$ et $N(x${sp()};${sp()}2)$ ont la même ordonnée, donc $MN=x$ ; et $MO=2$. L'égalité $\\dfrac{QA}{QO}=\\dfrac{MN}{MO}$ devient donc $\\dfrac{u}{y}=\\dfrac{x}{2}$, soit $${miseEnEvidence('u=\\dfrac{xy}{2}')}$.`

    const texte3 =
      `Déduire des questions précédentes que${sp()}: $A\\in\\mathcal{C}\\iff y=\\dfrac{8}{x^2+4}$.`
    const correction3 = `En remplaçant $u=\\dfrac{xy}{2}$ dans $u^2+y^2-2y=0$, on obtient $\\dfrac{x^2y^2}{4}+y^2-2y=0$, soit $y\\left(\\dfrac{x^2y}{4}+y-2\\right)=0$. Comme $y\\neq 0$ (sinon $A=O$), on a $\\dfrac{x^2y}{4}+y-2=0$, soit $y\\left(\\dfrac{x^2}{4}+1\\right)=2$, soit $y\\left(\\dfrac{x^2+4}{4}\\right)=2$, d'où $${miseEnEvidence('y=\\dfrac{8}{x^2+4}')}$. La sorcière d'Agnesi est donc la courbe représentative de la fonction $A$ définie sur $\\mathbb{R}$ par $A(x)=\\dfrac{8}{x^2+4}$.`

    const texte4 =
      texteGras(`Partie B${sp()}: Étude de la sorcière d'Agnesi`) +
      "<br>$A$ est la fonction définie pour tout $x\\in\\mathbb{R}$ par $A(x)=\\dfrac{8}{x^2+4}$. En dérivant $A$, montrer que $A'(x)=\\dfrac{-16x}{(x^2+4)^2}$, en déduire les variations de $A$, puis calculer son maximum."
    const correction4 = `En écrivant $A(x)=8(x^2+4)^{-1}$, la dérivée d'une composée donne $A'(x)=8\\times(-1)\\times 2x\\times(x^2+4)^{-2}=\\dfrac{-16x}{(x^2+4)^2}$. Comme $(x^2+4)^2>0$ pour tout $x$, le signe de $A'(x)$ est celui de $-16x$${sp()}: $A$ est ${texteEnCouleurEtGras('croissante')} sur $]-\\infty${sp()};${sp()}0]$ et ${texteEnCouleurEtGras('décroissante')} sur $[0${sp()};${sp()}+\\infty[$.`

    let texte5 = `Quel est le maximum de la fonction $A$, atteint en $x=0$${sp()}?`
    if (this.interactif) texte5 += ajouteChampTexteMathLive(this, 5) + '<br>'
    handleAnswers(this, 5, { reponse: { value: 2 } })
    const correction5 = `$A(0)=\\dfrac{8}{0^2+4}=\\dfrac{8}{4}=2$${sp()}: le maximum de $A$ est $${miseEnEvidence('2')}$.`

    const texteQ6 = `La courbe $C_A$ possède-t-elle une asymptote horizontale${sp()}?`
    this.autoCorrection[6] = {
      enonce: texteQ6,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Oui, la droite $y=0$', statut: true },
        { texte: 'Non', statut: false },
        { texte: 'Oui, la droite $y=2$', statut: false },
      ],
    }
    const monQcm6 = propositionsQcm(this, 6)
    let texte6 = texteQ6
    if (!context.isAmc) texte6 += monQcm6.texte
    const correction6 = `Quand $x\\to\\pm\\infty$, $x^2+4\\to +\\infty$ donc $A(x)=\\dfrac{8}{x^2+4}\\to 0$${sp()}: la courbe admet la droite d'équation $${miseEnEvidence('y=0')}$ (l'axe des abscisses) comme asymptote horizontale en $+\\infty$ et en $-\\infty$.`

    const texteQ7 = `La courbe $C_A$ possède-t-elle une asymptote verticale${sp()}?`
    this.autoCorrection[7] = {
      enonce: texteQ7,
      options: { ordered: true, radio: true },
      propositions: [
        { texte: 'Non', statut: true },
        { texte: 'Oui', statut: false },
      ],
    }
    const monQcm7 = propositionsQcm(this, 7)
    let texte7 = texteQ7
    if (!context.isAmc) texte7 += monQcm7.texte
    const correction7 = `${texteEnCouleurEtGras('Non')}${sp()}: le dénominateur $x^2+4$ ne s'annule jamais (il vaut toujours au moins $4$), donc $A$ est définie et continue sur $\\mathbb{R}$ tout entier, sans aucune asymptote verticale.`

    let texte8 =
      "En étudiant le signe de $A''(x)$, on trouve deux points d'inflexion, d'abscisses opposées. Donner la valeur positive de cette abscisse (arrondie au millième)."
    if (this.interactif) texte8 += ajouteChampTexteMathLive(this, 8) + '<br>'
    handleAnswers(this, 8, { reponse: { value: 1.155 } })
    const correction8 = `On calcule $A''(x)=\\dfrac{48x^2-64}{(x^2+4)^3}$, qui s'annule et change de signe pour $x^2=\\dfrac{4}{3}$, soit $x=\\pm\\dfrac{2}{\\sqrt{3}}=\\pm\\dfrac{2\\sqrt{3}}{3}\\approx \\pm ${miseEnEvidence('1{,}155')}$. La fonction $A$ est concave sur $\\left]-\\dfrac{2\\sqrt3}{3}${sp()};${sp()}\\dfrac{2\\sqrt3}{3}\\right[$ et convexe à l'extérieur de cet intervalle.`

    let texte9 =
      "Calculer l'ordonnée de ces points d'inflexion, c'est-à-dire $A\\left(\\dfrac{2}{\\sqrt 3}\\right)$."
    if (this.interactif) texte9 += ajouteChampTexteMathLive(this, 9) + '<br>'
    handleAnswers(this, 9, { reponse: { value: 1.5 } })
    const correction9 = `$A\\left(\\dfrac{2}{\\sqrt3}\\right)=\\dfrac{8}{\\frac{4}{3}+4}=\\dfrac{8}{\\frac{16}{3}}=\\dfrac{24}{16}=${miseEnEvidence('1{,}5')}$.`

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
    this.listeQuestions[5] = texte5
    this.listeCorrections[5] = correction5
    this.listeQuestions[6] = texte6
    this.listeCorrections[6] = correction6
    this.listeQuestions[7] = texte7
    this.listeCorrections[7] = correction7
    this.listeQuestions[8] = texte8
    this.listeCorrections[8] = correction8
    this.listeQuestions[9] = texte9
    this.listeCorrections[9] = correction9
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireApprofondir

    this.listeReponsesCourtes[1] = null

    listeQuestionsToContenu(this)
  }
}
