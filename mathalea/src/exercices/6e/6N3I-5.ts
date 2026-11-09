import DragAndDrop from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Classer des fractions par rapport à un demi et à un'
export const dateDePublication = '26/10/2026'
export const interactifReady = true
export const uuid = 'c0f9a'
export const refs = { 'fr-fr': ['6N3I-5'], 'fr-ch': ['9R1NO4H-3', '9R2NO4H-3', '9R3NO4H-3', 'PRQNO05B-6'] }

const entetes = [
  'Inférieure à $\\dfrac12$',
  'Égale à $\\dfrac12$',
  'Supérieure à $\\dfrac12$<br>et inférieure à $1$',
  'Égale à $1$',
  'Supérieure à $1$',
]

/** Tableau statique commun à l’énoncé imprimable et à la correction. */
function tableau(cellules: string[], fractions?: FractionEtendue[][]) {
  if (context.isTypst) {
    const titres = [
      'Inférieure à $frac(1, 2)$',
      'Égale à $frac(1, 2)$',
      'Supérieure à $frac(1, 2)$ #linebreak() et inférieure à $1$',
      'Égale à $1$',
      'Supérieure à $1$',
    ]
    const valeurs = titres.map((_, colonne) =>
      (fractions?.[colonne] ?? [])
        .map(
          (fraction) =>
            `#text(fill: rgb("${orangeMathalea}"))[$bold(frac(${fraction.num}, ${fraction.den}))$]`,
        )
        .join(' #h(1em) '),
    )
    // Mesurer l’en-tête à la largeur disponible, puis réserver la même hauteur pour les réponses.
    return `<mathalea-typst>#layout(size => {
      let colonnes = (size.width / 5,) * 5
      let entetes = (${titres.map((titre) => `[${titre}]`).join(', ')},)
      let hauteur = measure(table(columns: colonnes, inset: 6pt, align: center + horizon, ..entetes)).height
      table(columns: colonnes, rows: (hauteur, hauteur), inset: 6pt,
        align: center + horizon, stroke: 0.5pt, ..entetes,
        ${valeurs.map((valeur) => `[${valeur}]`).join(', ')},
      )
    })</mathalea-typst>`
  }
  if (context.isHtml && !context.isTypst) {
    return `<table class="tableauMathlive" style="table-layout:fixed;width:100%;text-align:center"><tbody><tr>${entetes.map((entete) => `<th style="padding:8px;font-weight:normal">${entete}</th>`).join('')}</tr><tr>${cellules.map((cellule) => `<td style="height:100px;padding:8px;vertical-align:top">${cellule}</td>`).join('')}</tr></tbody></table>`
  }
  const titres = [
    '\\text{Inférieure à }\\dfrac12',
    '\\text{Égale à }\\dfrac12',
    '\\begin{array}{c}\\text{Supérieure à }\\dfrac12\\\\\\text{et inférieure à }1\\end{array}',
    '\\text{Égale à }1',
    '\\text{Supérieure à }1',
  ]
  return `$\\renewcommand{\\arraystretch}{2.5}\\begin{array}{|c|c|c|c|c|}\\hline ${titres.join('&')}\\\\\\hline ${cellules.map((cellule) => (cellule ? cellule.replaceAll('$', '').replaceAll('<br>', '\\quad ') : '\\phantom{\\dfrac{11}{12}\\quad\\dfrac{11}{12}}')).join('&')}\\\\\\hline\\end{array}$`
}

export default class ClasserFractionsDemiUn extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.consigne = 'Placer chaque fraction dans la bonne colonne du tableau.'
    this.dragAndDrops = []
  }

  nouvelleVersion() {
    this.dragAndDrops = []
    for (let i = 0; i < this.nbQuestions; i++) {
      const fractions: {
        fraction: FractionEtendue
        colonne: number
        id: string
      }[] = []
      const dejaTirees = new Set<string>()
      for (let colonne = 0; colonne < 5; colonne++) {
        for (let compte = 0; compte < 2;) {
          const den = randint(3, 16)
          let num: number
          let denominateur = den
          switch (colonne) {
            case 0:
              num = randint(1, Math.floor((den - 1) / 2))
              break
            case 1:
              num = den
              denominateur = 2 * den
              break
            case 2:
              num = randint(Math.floor(den / 2) + 1, den - 1)
              break
            case 3:
              num = den
              break
            default:
              num = randint(den + 1, 2 * den)
          }
          const cle = `${num}/${denominateur}`
          if (dejaTirees.has(cle)) continue
          dejaTirees.add(cle)
          fractions.push({
            fraction: new FractionEtendue(num, denominateur),
            colonne,
            id: String(fractions.length + 1),
          })
          compte++
        }
      }
      // Mélanger avant les branches de rendu pour conserver le même tirage à l’impression.
      const etiquettes = shuffle(fractions).map(({ fraction, id }) => ({
        id,
        contenu: `$${fraction.texFraction}$`,
      }))
      const reponses = Object.fromEntries(
        entetes.map((_, colonne) => [
          `rectangle${colonne + 1}`,
          {
            value: fractions
              .filter((f) => f.colonne === colonne)
              .map((f) => f.id)
              .join('|'),
            options: { multi: true, ordered: false, feedbackOnLabels: true },
          },
        ]),
      )
      const indiceQuestion = i
      handleAnswers(
        this,
        i,
        {
          bareme: (): [number, number] => {
            const bonnesEtiquettes = new Set<string>()
            for (let colonne = 0; colonne < entetes.length; colonne++) {
              const saisie =
                this.answers?.[
                  `rectangleDNDEx${this.numeroExercice}Q${indiceQuestion}R${colonne + 1}`
                ] ?? ''
              for (const identifiant of saisie.split(';')) {
                const id = identifiant.split('I').pop()?.split('-')[0]
                if (fractions.some((f) => f.id === id && f.colonne === colonne))
                  bonnesEtiquettes.add(id!)
              }
            }
            return [
              Math.floor((5 * bonnesEtiquettes.size) / fractions.length),
              5,
            ]
          },
          ...reponses,
        },
        { formatInteractif: 'dnd' },
      )
      if (context.isHtml && !context.isTypst && this.interactif) {
        const dnd = new DragAndDrop({
          exercice: this,
          question: i,
          consigne: '',
          etiquettes: [etiquettes],
          enonceATrous: tableau(
            entetes.map((_, colonne) => `%{rectangle${colonne + 1}}`),
          ),
          nomsZones: [
            'Colonne des fractions inférieures à un demi',
            'Colonne des fractions égales à un demi',
            'Colonne des fractions supérieures à un demi et inférieures à 1',
            'Colonne des fractions égales à 1',
            'Colonne des fractions supérieures à 1',
          ],
        })
        this.dragAndDrops[i] = dnd
        // Les spans ajoutés autour des fragments par DragAndDrop ne doivent pas couper les balises du tableau.
        this.listeQuestions[i] = dnd
          .ajouteDragAndDrop({ melange: false, duplicable: false })
          .replace(/<span>(.*?)<\/span>/gs, '$1')
      } else {
        this.listeQuestions[i] =
          `${etiquettes.map((e) => e.contenu).join(' ; ')}.<br>${tableau(entetes.map(() => ''))}`
      }
      const groupes = entetes.map((_, colonne) =>
        fractions.filter((f) => f.colonne === colonne),
      )
      const colonnes = groupes.map((groupe) => {
        const valeurs = groupe.map(
          (f) => `$${miseEnEvidence(f.fraction.texFraction)}$`,
        )
        return context.isHtml && !context.isTypst
          ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1.5rem 1rem">${valeurs.map((valeur) => `<span style="white-space:nowrap">${valeur}</span>`).join('')}</div>`
          : valeurs.join(' $\\quad$ ')
      })
      this.listeCorrections[i] = tableau(
        colonnes,
        groupes.map((groupe) => groupe.map((f) => f.fraction)),
      )
      this.listeReponsesCourtes[i] = this.listeCorrections[i]
      if (this.correctionDetaillee) {
        const raisons = [
          'sont inférieures à $\\dfrac12$ car leur numérateur est inférieur à la moitié de leur dénominateur.',
          'sont égales à $\\dfrac12$ car leur numérateur est égal à la moitié de leur dénominateur.',
          'sont supérieures à $\\dfrac12$ et inférieures à $1$ car leur numérateur est supérieur à la moitié de leur dénominateur et inférieur à leur dénominateur.',
          'sont égales à $1$ car leur numérateur est égal à leur dénominateur.',
          'sont supérieures à $1$ car leur numérateur est supérieur à leur dénominateur.',
        ]
        const explications = groupes.map(
          (groupe, colonne) =>
            `${groupe.map((f) => `$${f.fraction.texFraction}$`).join(' et ')} ${raisons[colonne]}`,
        )
        this.listeCorrections[i] +=
          `<br>${texteEnCouleur(explications.join('<br><br>'), bleuMathalea)}`
      }
    }
    listeQuestionsToContenu(this)
  }
}
