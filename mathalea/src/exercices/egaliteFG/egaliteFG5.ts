import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { texteGras, texteItalique } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Les femmes à l'Assemblée nationale"
export const dateDePublication = '15/07/2026'
export const interactifReady = true

export const uuid = 'a108d'
export const refs = {
  'fr-fr': ['EgaliteFG1-6e-5'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons','Organisation et gestion de données']

const annees = [1986, 1988, 1993, 1997, 2002, 2007, 2012, 2017, 2022]
const nombres = [34, 33, 35, 63, 71, 107, 155, 224, 215]
const pourcentages = nombres.map((n) => Math.round((n / 577) * 100))

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class EgaliteFG5 extends Exercice {
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
      "<br><br>L'Assemblée nationale est un groupe de personnes élues qui font les lois en France. Elle est composée de $577$ députés, qui représentent les citoyens et débattent des décisions importantes pour le pays.<br>" +
      'Voici le nombre de femmes élues députées lors de chaque législature depuis 1986.'
    this.nbQuestions = 2
    this.nbQuestionsModifiable = false
    this.commentaireDebat =
      texteGras('Pour débattre') +
      ".<br>À ton avis, comment pourrait-on agir pour encourager l'accès des femmes à l'Assemblée nationale ?"
    this.besoinFormulaireCaseACocher = ['Afficher «\u00a0Pour débattre\u00a0»', true]
    this.sup = true
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const tabEntetesColonnes = ['\\text{Année}', ...annees.map(String)]
    const tabEntetesLignes = ['\\text{Nombre de femmes}', '\\text{En}~\\%']

    // Tableau à compléter : la ligne "En %" est laissée vide pour être remplie
    const tableauAComplet = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
      tabEntetesColonnes,
      tabEntetesLignes,
      [...nombres.map(String), ...annees.map(() => '')],
    )
    const tableauInteractif = AddTabDbleEntryMathlive.create(
      this.numeroExercice ?? 0,
      0,
      tableauAComplet,
      `tableauMathlive ${KeyboardType.clavierNumbers}`,
      this.interactif,
      {},
    )

    // Tableau complet (pour la correction)
    const tableauRempli = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
      tabEntetesColonnes,
      tabEntetesLignes,
      [...nombres.map(String), ...pourcentages.map((p) => `${p}~\\%`)],
    )
    const tableauCorrige = AddTabDbleEntryMathlive.create(
      this.numeroExercice ?? 0,
      0,
      tableauRempli,
      'tableauMathlive',
      false,
      {},
    )

    const echelle = 3
    const largeurBarre = 24
    const espaceBarre = 12
    const hauteurGraphique = 180
    const largeurGraphique =
      annees.length * (largeurBarre + espaceBarre) + espaceBarre + 40
    const construireGraphe = (indicesRemplis: number[], titre: string) => {
      if (!context.isHtml) return ''
      let barresSvg = ''
      annees.forEach((annee, i) => {
        const x = 40 + espaceBarre + i * (largeurBarre + espaceBarre)
        const estRempli = indicesRemplis.includes(i)
        const hauteurBarre = estRempli ? pourcentages[i] * echelle : 0
        const y = hauteurGraphique - 30 - hauteurBarre
        barresSvg += `${
          estRempli
            ? `<rect x="${x}" y="${y}" width="${largeurBarre}" height="${hauteurBarre}" fill="#4c72b0" stroke="#2f4a72" />
      <text x="${x + largeurBarre / 2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#333">${pourcentages[i]}</text>`
            : `<rect x="${x}" y="${hauteurGraphique - 31}" width="${largeurBarre}" height="1" fill="#ccc" />`
        }
      <text x="${x + largeurBarre / 2}" y="${hauteurGraphique - 12}" text-anchor="middle" font-size="9" fill="#333">${annee}</text>`
      })
      return `<div class="not-prose" style="text-align:center; margin: 0.75rem 0;">
  <p style="font-weight:600; margin-bottom:0.25rem;">${titre}</p>
  <svg viewBox="0 0 ${largeurGraphique} ${hauteurGraphique + 10}" style="max-width:480px; width:100%; height:auto;">
    <line x1="35" y1="10" x2="35" y2="${hauteurGraphique - 30}" stroke="#333" />
    <line x1="35" y1="${hauteurGraphique - 30}" x2="${largeurGraphique - 5}" y2="${hauteurGraphique - 30}" stroke="#333" />
    ${[0, 10, 20, 30, 40, 50]
      .map((v) => {
        const y = hauteurGraphique - 30 - v * echelle
        return `<text x="28" y="${y + 4}" text-anchor="end" font-size="10" fill="#333">${v}</text><line x1="33" y1="${y}" x2="35" y2="${y}" stroke="#333" />`
      })
      .join('')}
    ${barresSvg}
  </svg>
</div>`
    }
    // Dans le PDF, le diagramme fourni à l'élève n'a que 2 barres déjà tracées à titre d'exemple (1997 et 2007)
    const indicesExemples = [annees.indexOf(1997), annees.indexOf(2007)]

    const texte0 =
      "Complète le tableau et le diagramme en colonnes ci-dessous en calculant, pour chaque année, le pourcentage de femmes parmi les $577$ député(e)s (arrondi à l'unité) :<br>" +
      (context.isHtml
        ? tableauInteractif.output
        : tableauInteractif.latexOutput) +
      construireGraphe(
        indicesExemples,
        "Pourcentage de femmes élues à l'Assemblée nationale (1986-2022) — à compléter",
      )

    const objetReponse: Record<string, { value: number }> = {}
    pourcentages.forEach((p, i) => {
      objetReponse[`L2C${i + 1}`] = { value: p }
    })
    handleAnswers(this, 0, objetReponse, {
      formatInteractif: 'tableauMathlive',
    })

    const correction0 =
      "Pour chaque année, on calcule $\\dfrac{\\text{nombre de femmes}}{577}$, exprimé en pourcentage :<br>" +
      (context.isHtml ? tableauCorrige.output : tableauCorrige.latexOutput) +
      construireGraphe(
        [...annees.keys()],
        "Pourcentage de femmes élues à l'Assemblée nationale (1986-2022) — complet",
      )

    const texte1 =
      "Constates-tu une évolution dans la représentation des femmes à l'Assemblée nationale entre 1986 et 2022 ? Si oui, peux-tu la décrire et l'expliquer ?"
    const correction1 =
      "Le pourcentage de femmes élues progresse globalement entre 1986 ($6\\,\\%$) et 2022 ($37\\,\\%$), avec une légère baisse entre 2017 ($39\\,\\%$) et 2022. Cette progression n'est pas régulière (paliers, légères baisses), mais la tendance de fond est nette : elle s'explique notamment par la loi sur la parité de 2000 (obligeant les partis à présenter autant de femmes que d'hommes aux élections, sous peine de pénalités financières). Malgré cette forte progression, la parité (environ $50\\,\\%$) n'est toujours pas atteinte."

    this.listeQuestions[0] = texte0
    this.listeCorrections[0] = correction0
    this.listeQuestions[1] = texte1
    this.listeCorrections[1] = correction1
    // Un tableau à remplir et une question ouverte : pas de réponse courte.
    this.listeReponsesCourtes[0] = null
    this.listeReponsesCourtes[1] = null
    if (this.sup)
      this.listeQuestions[this.listeQuestions.length - 1] +=
        '<br><br>' + this.commentaireDebat

    listeQuestionsToContenu(this)
  }
}
