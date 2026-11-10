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

export const titre = 'Zoé et Paul'
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = '71cc1'
export const refs = {
  'fr-fr': ['EgaliteFG4-3e-13'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Calcul littéral']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG13 extends Exercice {
  commentaireDebat = ''

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
        ? '<div class="not-prose" style="text-align:center; margin: 0.75rem 0;"><img src="/alea/images/egalite/rectangle-x4-x3.jpg" alt="Rectangle ABCD partagé en AEFD (largeur x+4) et EBCF (largeur x-3)" style="max-width:280px; width:100%; height:auto;"></div>'
        : '') +
      '<br>$x$ désigne un nombre supérieur ou égal à $3$. $ABCD$ est un carré et $AEFD$ est un rectangle, avec $E$ sur $[AB]$ tel que $AE=x+4$ et $EB=x-3$.'
    this.nbQuestions = 8
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      ".<br>Les préférences de méthode sont-elles liées au genre ou à l'expérience personnelle ?<br>Peut-on parler de styles cognitifs genrés ?"
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    let texte0 = 'Exprime en fonction de $x$ la longueur $AB$.'
    if (this.interactif)
      texte0 += '<br>' + ajouteChampTexteMathLive(this, 0) + '<br>'
    handleAnswers(this, 0, {
      reponse: { value: '2x+1', options: { developpementEgal: true } },
    })
    const correction0 = `$AB=AE+EB=(x+4)+(x-3)=${miseEnEvidence('2x+1')}$.`

    let texte1 = "Exprime en fonction de $x$ l'aire $A$ du carré $ABCD$."
    if (this.interactif)
      texte1 += '<br>' + ajouteChampTexteMathLive(this, 1) + '<br>'
    handleAnswers(this, 1, {
      reponse: { value: '(2x+1)^2', options: { factorisation: true } },
    })
    const correction1 = `Le carré $ABCD$ a pour côté $AB=2x+1$, donc $A=${miseEnEvidence('(2x+1)^2')}$.`

    let texte2 = "Exprime en fonction de $x$ l'aire $B$ du rectangle $AEFD$."
    if (this.interactif)
      texte2 += '<br>' + ajouteChampTexteMathLive(this, 2) + '<br>'
    handleAnswers(this, 2, {
      reponse: { value: '(x+4)(2x+1)', options: { factorisation: true } },
    })
    const correction2 = `Le rectangle $AEFD$ a pour largeur $AE=x+4$ et pour longueur $AD=AB=2x+1$, donc $B=${miseEnEvidence('(x+4)(2x+1)')}$.`

    let texte3 = "Exprime en fonction de $x$ l'aire $C$ du rectangle $EBCF$."
    if (this.interactif)
      texte3 += '<br>' + ajouteChampTexteMathLive(this, 3) + '<br>'
    handleAnswers(this, 3, {
      reponse: { value: '(x-3)(2x+1)', options: { factorisation: true } },
    })
    const correction3 = `Le rectangle $EBCF$ a pour largeur $EB=x-3$ et pour longueur $BC=AB=2x+1$, donc $C=${miseEnEvidence('(x-3)(2x+1)')}$.`

    let texte4 =
      "Zoé affirme que l'aire $A$ du carré est égale à $(2x+1)^2$.<br>Paul affirme : «\u00a0$A=B+C$, donc $A=(x+4)(2x+1)+(x-3)(2x+1)$\u00a0».<br>Développe et réduis l'expression de Zoé : $(2x+1)^2$."
    if (this.interactif)
      texte4 += '<br>' + ajouteChampTexteMathLive(this, 4) + '<br>'
    handleAnswers(this, 4, {
      reponse: { value: '4x^2+4x+1', options: { developpementEgal: true } },
    })
    const correction4 = `$(2x+1)^2=${miseEnEvidence('4x^2+4x+1')}$.`

    let texte5 =
      "Développe et réduis l'expression de Paul : $(x+4)(2x+1)+(x-3)(2x+1)$."
    if (this.interactif)
      texte5 += '<br>' + ajouteChampTexteMathLive(this, 5) + '<br>'
    handleAnswers(this, 5, {
      reponse: { value: '4x^2+4x+1', options: { developpementEgal: true } },
    })
    const correction5 = `En factorisant par $(2x+1)$ : $(x+4)(2x+1)+(x-3)(2x+1)=(2x+1)\\big[(x+4)+(x-3)\\big]=(2x+1)(2x+1)=(2x+1)^2=${miseEnEvidence('4x^2+4x+1')}$.`

    const texte6 = 'Compare les résultats obtenus.'
    const correction6 =
      'Les deux expressions développées et réduites sont égales : $4x^2+4x+1$. Zoé et Paul obtiennent donc le même résultat.'

    const texte7 =
      'Le professeur valide les réponses données par Zoé et par Paul. Comment expliques-tu que les deux raisonnements soient validés ?'
    const correction7 =
      "Zoé calcule directement l'aire du carré à partir de son côté $AB=2x+1$, tandis que Paul le découpe en deux rectangles ($B$ et $C$) dont il additionne les aires. Les deux méthodes, bien que différentes, sont toutes les deux valables et donnent le même résultat : c'est pour cela que le professeur valide les deux raisonnements."

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
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    this.listeReponsesCourtes[6] =
      'Zoé et Paul obtiennent le même résultat : $4x^2+4x+1$.'
    this.listeReponsesCourtes[7] = null

    listeQuestionsToContenu(this)
  }
}
