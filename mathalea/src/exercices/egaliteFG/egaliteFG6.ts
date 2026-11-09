import {
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'La place des femmes parmi les enseignants'
export const dateDePublication = '15/07/2026'
export const uuid = 'e5d3e'
export const refs = {
  'fr-fr': [ 'EgaliteFG2-5e-6'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Organisation et gestion de données','Fractions']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG6 extends Exercice {
  constructor() {
    super()
    this.pasDeVersionAleatoire = true
    this.consigne = texteItalique(
      "D'après " + ajouterLien('https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true', '«\u00a0Sur le chemin de l\'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles'),
    )
    this.consigne +=
      "<br><br>L'égalité entre les femmes et les hommes est un principe fondamental de notre société. Pourtant, ce droit n'a pas toujours été inscrit dans la loi. Ce n'est qu'en $1946$, après la Seconde Guerre mondiale, que l'égalité entre les sexes a été affirmée pour la première fois dans la Constitution française, à travers le préambule de la Constitution de la IV<sup>e</sup> République. Cette reconnaissance a été réaffirmée dans la Constitution actuelle de $1958$, qui sert encore de base à notre République."
    this.nbQuestions = 5
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    this.listeQuestions[0] =
      "Partie 1 - À égalité dans notre formation ?<br>Commence par compter parmi tes enseignants le nombre de femmes et le nombre d'hommes, puis calcule le nombre total d'enseignants. Calcule la part de femmes et la part d'hommes sous forme de fractions irréductibles, puis exprime ces fractions en pourcentage (arrondi à l'unité). Complète un tableau avec ces trois informations (nombre, fraction irréductible, pourcentage) pour les femmes, les hommes et le total."
    this.listeCorrections[0] =
      "Réponse personnelle, qui dépend de la composition réelle de ta classe.<br>Méthode : si $f$ est le nombre d'enseignantes et $h$ le nombre d'enseignants, le total est $f+h$ ; la part des femmes est la fraction $\\dfrac{f}{f+h}$ (à simplifier), exprimée en pourcentage et arrondie à l'unité (et de même pour les hommes)."

    const barres: [string, number][] = [
      ['École\nmaternelle', 97],
      ['École\nélémentaire', 83],
      ['Collège', 58],
      ['Lycée général\net technologique', 54],
      ['Lycée\nprofessionnel', 45],
    ]
    const largeurBarre = 70
    const espaceBarre = 30
    const hauteurGraphique = 220
    const largeurGraphique = barres.length * (largeurBarre + espaceBarre) + espaceBarre + 40
    const echelle = 180 / 100
    let barresSvg = ''
    barres.forEach(([label, valeur], i) => {
      const x = 40 + espaceBarre + i * (largeurBarre + espaceBarre)
      const hauteurBarre = valeur * echelle
      const y = hauteurGraphique - 30 - hauteurBarre
      barresSvg += `
      <rect x="${x}" y="${y}" width="${largeurBarre}" height="${hauteurBarre}" fill="#f5a623" stroke="#c9781a" />
      <text x="${x + largeurBarre / 2}" y="${y - 6}" text-anchor="middle" font-size="13" fill="#333">${valeur}</text>
      ${label
        .split('\n')
        .map(
          (ligne, j) =>
            `<text x="${x + largeurBarre / 2}" y="${hauteurGraphique - 12 + j * 12}" text-anchor="middle" font-size="10" fill="#333">${ligne}</text>`,
        )
        .join('')}`
    })
    const grapheHtml = !context.isHtml ? '' : `
<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">
  <p style="font-weight:600; margin-bottom:0.25rem;">Proportion de femmes parmi les enseignants selon le niveau d'enseignement en France</p>
  <svg viewBox="0 0 ${largeurGraphique} ${hauteurGraphique + 20}" style="max-width:520px; width:100%; height:auto;">
    <line x1="35" y1="10" x2="35" y2="${hauteurGraphique - 30}" stroke="#333" />
    <line x1="35" y1="${hauteurGraphique - 30}" x2="${largeurGraphique - 5}" y2="${hauteurGraphique - 30}" stroke="#333" />
    ${[0, 20, 40, 60, 80, 100]
      .map((v) => {
        const y = hauteurGraphique - 30 - v * echelle
        return `<text x="28" y="${y + 4}" text-anchor="end" font-size="11" fill="#333">${v}</text><line x1="33" y1="${y}" x2="35" y2="${y}" stroke="#333" />`
      })
      .join('')}
    <text x="12" y="${(hauteurGraphique - 30) / 2}" text-anchor="middle" font-size="11" fill="#333" transform="rotate(-90 12 ${(hauteurGraphique - 30) / 2})">Proportion de femmes (%)</text>
    ${barresSvg}
  </svg>
</div>`

    this.listeQuestions[1] =
      grapheHtml +
      "Partie 2 - D'après le graphique ci-dessus «\u00a0Proportion de femmes parmi les enseignants selon le niveau d'enseignement en France\u00a0», donne une estimation du pourcentage de femmes pour chaque niveau : école maternelle, école élémentaire, collège, lycée général et technologique, lycée professionnel."
    this.listeCorrections[1] =
      "Estimations à partir du graphique (les valeurs peuvent varier légèrement selon la lecture) : école maternelle $\\approx 97\\,\\%$, école élémentaire $\\approx 83\\,\\%$, collège $\\approx 58\\,\\%$, lycée général et technologique $\\approx 54\\,\\%$, lycée professionnel $\\approx 45\\,\\%$."

    this.listeQuestions[2] =
      'Le pourcentage que tu obtiens pour ta classe est-il conforme au pourcentage lu sur le graphique pour le collège ? Si non, comment peux-tu l\'expliquer ?'
    this.listeCorrections[2] =
      "Réponse personnelle. Un écart peut s'expliquer par le faible effectif d'une seule classe (l'échantillon des enseignants d'une classe est petit et peu représentatif), contrairement à la statistique nationale qui porte sur l'ensemble des enseignants de collège."

    this.listeQuestions[3] =
      'Selon le graphique, quel niveau est le plus paritaire (le plus égalitaire) en termes de nombre d\'enseignantes et d\'enseignants ? Justifie ta réponse.'
    this.listeCorrections[3] = `Sa proportion de femmes ($54\\,\\%$) est à $4$ points de $50\\,\\%$, alors que le lycée professionnel ($45\\,\\%$) en est à $5$ points : c'est donc ${texteEnCouleurEtGras('le lycée général et technologique')} qui semble le plus paritaire.`

    this.listeQuestions[4] =
      'Entre quelles catégories consécutives l\'écart est-il le plus élevé ? Pourquoi, à ton avis ?'
    this.listeCorrections[4] =
      "L'écart le plus important se situe entre l'école élémentaire (très féminisée) et le collège, où la proportion de femmes chute nettement. Une explication possible : au collège, l'enseignement devient disciplinaire (mathématiques, sciences $\\ldots$), des matières encore perçues comme davantage masculines, ce qui peut influencer les choix d'orientation vers le métier d'enseignant."

    this.listeReponsesCourtes[0] = null
    this.listeReponsesCourtes[1] =
      'Maternelle : $97\\,\\%$ ; élémentaire : $83\\,\\%$ ; collège : $58\\,\\%$ ; lycée général et technologique : $54\\,\\%$ ; lycée professionnel : $45\\,\\%$.'
    this.listeReponsesCourtes[2] = null
    this.listeReponsesCourtes[4] = 'Entre l’école élémentaire et le collège.'

    listeQuestionsToContenu(this)
  }
}
