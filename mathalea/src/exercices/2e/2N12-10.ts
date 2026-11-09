import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { crochetD, crochetG, intervalle } from '../../lib/2d/intervalles'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { orangeMathalea } from '../../lib/colors'
import {
  IntervalleDroiteElement,
  type IntervalleDroiteValue,
} from '../../lib/customElements/IntervalleDroiteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { TableauMathliveElement } from '../../lib/customElements/TableauMathlive'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import type { AnswerType } from '../../lib/types'
import { gestionnaireFormulaireTexte } from '../../modules/outils'

export const titre =
  'Relier un intervalle, une inégalité et une droite graduée dans un tableau'
export const dateDePublication = '10/10/2026'

export const uuid = '66159'
export const interactifReady = true
export const refs = { 'fr-fr': ['2N12-10'], 'fr-ch': [] }

type TypeBornes = 1 | 2 | 3 | 4
type InfiniteSide = 'left' | 'right' | undefined

const axisMargin = 3

const bornesIncluses = (type: TypeBornes) => ({
  gauche: type === 2 || type === 4,
  droite: type === 3 || type === 4,
})

const intervalleTex = (
  type: TypeBornes,
  a: number,
  b: number,
  infiniteSide?: InfiniteSide,
) => {
  const { gauche, droite } = bornesIncluses(type)
  const left =
    infiniteSide === 'left' ? ']-\\infty' : `${gauche ? '[' : ']'}${a}`
  const right =
    infiniteSide === 'right' ? '+\\infty[' : `${b}${droite ? ']' : '['}`
  return `${left}\\,;\\,${right}`
}

const intervalleInteractif = (
  type: TypeBornes,
  a: number,
  b: number,
  infiniteSide?: InfiniteSide,
): IntervalleDroiteValue => {
  const { gauche, droite } = bornesIncluses(type)
  return {
    start: infiniteSide === 'left' ? a - axisMargin : a,
    end: infiniteSide === 'right' ? b + axisMargin : b,
    leftBracket: infiniteSide === 'left' ? null : gauche ? '[' : ']',
    rightBracket: infiniteSide === 'right' ? null : droite ? ']' : '[',
  }
}

function construitDroite(
  a: number,
  b: number,
  type?: TypeBornes,
  infiniteSide?: InfiniteSide,
) {
  const min = a - axisMargin
  const max = b + axisMargin
  const unite = Math.min(1.6, 9.6 / (max - min))
  const xA = (a - min) * unite
  const xB = (b - min) * unite
  const xMax = (max - min) * unite + 0.5
  const axe = droiteGraduee({
    Min: min,
    Max: max,
    Unite: unite,
    x: 0,
    y: 0,
    axeEpaisseur: 1.5,
    thickDistance: 1,
    thickEpaisseur: 0,
    labelsPrincipaux: false,
    labelListe:
      type === undefined
        ? [
            ...(infiniteSide === 'left'
              ? []
              : [[a, String(a)] as [number, string]]),
            ...(infiniteSide === 'right'
              ? []
              : [[b, String(b)] as [number, string]]),
          ]
        : [],
  })
  const graduationA = segment(xA, -0.15, xA, 0.15)
  const graduationB = segment(xB, -0.15, xB, 0.15)
  const objets: ObjetMathalea2D[] = [axe]
  if (infiniteSide !== 'left') objets.push(graduationA)
  if (infiniteSide !== 'right') objets.push(graduationB)

  if (type !== undefined) {
    const { gauche, droite } = bornesIncluses(type)
    const A = pointAbstrait(xA, 0, String(a))
    const B = pointAbstrait(xB, 0, String(b))
    const partieColoriee = intervalle(
      infiniteSide === 'left' ? pointAbstrait(-0.2, 0) : A,
      infiniteSide === 'right' ? pointAbstrait(xMax + 0.2, 0) : B,
      orangeMathalea,
      0,
    )
    partieColoriee.epaisseur = 6

    const crochetGauche = gauche
      ? crochetD(A, orangeMathalea)
      : crochetG(A, orangeMathalea)
    const crochetDroite = droite
      ? crochetG(B, orangeMathalea)
      : crochetD(B, orangeMathalea)
    crochetGauche.taille = context.isHtml ? 0.2 : 0.35
    crochetDroite.taille = context.isHtml ? 0.2 : 0.35
    objets.push(partieColoriee)
    if (infiniteSide === 'right') {
      const fleche = segment(xMax - 0.1, 0, xMax + 0.2, 0, orangeMathalea)
      fleche.styleExtremites = '->'
      fleche.epaisseur = 1.5
      objets.push(fleche)
    }
    if (infiniteSide !== 'left') objets.push(crochetGauche)
    if (infiniteSide !== 'right') objets.push(crochetDroite)
  }

  return mathalea2d(
    {
      xmin: -0.7,
      xmax: xMax + 0.7,
      ymin: -1.8,
      ymax: 1.2,
      scale: 0.75,
      pixelsParCm: 50,
      // Dans une cellule LaTeX, seul le tableau termine la ligne.
      display: context.isHtml ? 'block' : 'inline',
    },
    objets,
  )
}

/**
 * Passer entre trois représentations d'un intervalle borné ou non borné.
 * @author Stéphane Guyon
 */
export default class TableauIntervallesInegalites extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter le tableau suivant.'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 3
    this.sup2 = '1-2-3'
    this.sup3 = 3
    this.besoinFormulaire3Numerique = [
      'Type d’intervalles',
      3,
      '1 : Intervalles bornés\n2 : Intervalles non bornés\n3 : Mélange',
    ]
    this.besoinFormulaireNumerique = ['Nombre de lignes', 5]
    this.besoinFormulaire2Texte = [
      'Colonnes affichées',
      'Nombres séparés par des tirets :\n1 : Intervalle\n2 : Inégalité\n3 : Droite graduée\n4 : Mélange',
    ]
    this.textFormOptions = { 2: { minSelections: 2, weighted: false } }
  }

  nouvelleVersion() {
    const rowCount = Math.max(1, Math.min(5, Math.trunc(Number(this.sup)) || 3))
    const selected = String(this.sup2).split('-').map(Number)
    const visibleColumns = selected.includes(4)
      ? [0, 1, 2]
      : [0, 1, 2].filter((column) => selected.includes(column + 1))
    // Protéger également les paramètres provenant d'une URL saisie à la main.
    for (const column of [0, 1, 2]) {
      if (visibleColumns.length >= 2) break
      if (!visibleColumns.includes(column)) visibleColumns.push(column)
    }
    visibleColumns.sort((a, b) => a - b)
    this.sup2 = visibleColumns.map((column) => column + 1).join('-')
    const columnCount = visibleColumns.length
    const givenColumns = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: rowCount,
    })
    // Répéter un cycle mélangé garantit des catégories équilibrées sans
    // répétition consécutive. Alterner aussi le côté ouvert des semi-ouverts.
    const categories = shuffle([1, 2, 4] as TypeBornes[])
    const halfOpenTypes = combinaisonListes([2, 3] as TypeBornes[], rowCount)
    let halfOpenIndex = 0
    const boundaryTypes = Array.from({ length: rowCount }, (_, row) => {
      const category = categories[row % categories.length]
      return category === 2 ? halfOpenTypes[halfOpenIndex++] : category
    })
    const intervalMode = Number(this.sup3)
    const infiniteSides: InfiniteSide[] = Array(rowCount).fill(undefined)
    const directions = shuffle(['left', 'right'] as const)
    if (intervalMode === 2) {
      // Une demi-droite est ouverte ou semi-ouverte : l'infini est toujours exclu.
      const inclusion = shuffle([false, true])
      for (let row = 0; row < rowCount; row++) {
        const side = directions[row % directions.length]
        infiniteSides[row] = side
        boundaryTypes[row] = inclusion[row % inclusion.length]
          ? side === 'right'
            ? 2
            : 3
          : 1
      }
    } else if (intervalMode === 3) {
      const candidates = shuffle(
        boundaryTypes
          .map((type, row) => ({ type, row }))
          .filter(({ type }) => type !== 4),
      )
      if (candidates.length === 0) {
        boundaryTypes[0] = randint(2, 3) as TypeBornes
        candidates.push({ type: boundaryTypes[0], row: 0 })
      }
      for (const [index, { type, row }] of candidates
        .slice(0, Math.max(1, Math.floor(rowCount / 2)))
        .entries()) {
        infiniteSides[row] =
          type === 2
            ? 'right'
            : type === 3
              ? 'left'
              : directions[index % directions.length]
      }
    }
    const columnHeaders = [
      '\\text{Intervalle}',
      '\\text{Inégalité}',
      '\\text{Droite graduée}',
    ]
    const headers = [
      '\\text{Ligne}',
      ...visibleColumns.map((column) => columnHeaders[column]),
    ]
    const rows: string[] = []
    const content: string[] = []
    const correction: string[] = []
    const answers: Record<string, AnswerType> = {}
    const details: string[] = []
    const drawn = new Set<string>()

    for (
      let row = 0, attempts = 0;
      row < rowCount && attempts < 50;
      attempts++
    ) {
      const a = randint(-10, 5)
      const b = a + randint(2, 12)
      const type = boundaryTypes[row]
      const side = infiniteSides[row]
      const key = `${a};${b};${type}`
      if (drawn.has(key)) continue
      drawn.add(key)
      const included = bornesIncluses(type)
      const interval = intervalleTex(type, a, b, side)
      const inequality =
        side === 'left'
          ? `x${included.droite ? '\\leqslant' : '<'}${b}`
          : side === 'right'
            ? `x${included.gauche ? '\\geqslant' : '>'}${a}`
            : `${a}${included.gauche ? '\\leqslant' : '<'} x${included.droite ? '\\leqslant' : '<'}${b}`
      const given = Number(givenColumns[row]) - 1
      const id = `champTexteEx${this.numeroExercice ?? 0}Q0L${row + 1}C${visibleColumns.indexOf(2) + 1}`
      const line = construitDroite(a, b, type, side)
      const interactiveLine = IntervalleDroiteElement.create({
        id,
        min: a - axisMargin,
        max: b + axisMargin,
        labelValues: side === 'left' ? [b] : side === 'right' ? [a] : [a, b],
        showGraduations: false,
        intervalColor: orangeMathalea,
      })
      const values = [`x\\in${interval}`, inequality, line]
      rows.push(String(row + 1))
      for (const [visibleIndex, column] of visibleColumns.entries()) {
        const isGiven = column === given
        content.push(
          isGiven
            ? values[column]
            : column === 2
              ? this.interactif && context.isHtml && !context.isTypst
                ? interactiveLine
                : construitDroite(a, b, undefined, side)
              : '',
        )
        correction.push(
          column === 2 || isGiven
            ? values[column]
            : column === 0
              ? `x\\in${miseEnEvidence(interval)}`
              : miseEnEvidence(inequality),
        )
        if (!isGiven)
          answers[`L${row + 1}C${visibleIndex + 1}`] = {
            value:
              column === 0
                ? interval
                : column === 1
                  ? inequality
                  : JSON.stringify(intervalleInteractif(type, a, b, side)),
            ...(column === 0 ? { options: { intervalle: true } } : {}),
          }
      }
      details.push(
        side !== undefined
          ? `Ligne $${row + 1}$ : colorier la demi-droite située à ${side === 'left' ? 'gauche' : 'droite'} de $${side === 'left' ? b : a}$. La borne finie est ${(side === 'left' ? included.droite : included.gauche) ? 'incluse' : 'exclue'}. Du côté de l’infini, ne pas placer de crochet sur la droite ; dans l’écriture de l’intervalle, le crochet est toujours ouvert.`
          : `Ligne $${row + 1}$ : les nombres sont compris entre $${a}$ et $${b}$. La borne $${a}$ est ${included.gauche ? 'incluse' : 'exclue'} et la borne $${b}$ est ${included.droite ? 'incluse' : 'exclue'}.`,
      )
      row++
    }

    const renderTable = (cells: string[], interactive: boolean) => {
      if (!context.isHtml) {
        // Les figures TikZ doivent rester hors du mode mathématique du tableau.
        const body = rows
          .map((row, index) =>
            [
              row,
              ...cells
                .slice(index * columnCount, (index + 1) * columnCount)
                .map((cell, column) =>
                  visibleColumns[column] === 2 || cell === ''
                    ? cell
                    : `$${cell}$`,
                ),
            ].join(' & '),
          )
          .join('\\\\ \\hline\n')
        return `\\renewcommand{\\arraystretch}{2}\n\\begin{tabular}{|${'c|'.repeat(columnCount + 1)}}\\hline\n${['Ligne', ...visibleColumns.map((column) => ['Intervalle', 'Inégalité', 'Droite graduée'][column])].join(' & ')}\\\\ \\hline\n${body}\\\\ \\hline\n\\end{tabular}`
      }
      const table = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        headers,
        rows,
        cells,
      )
      for (const row of table.raws) {
        for (const [index, column] of visibleColumns.entries()) {
          if (column === 2) row[index].latex = false
          if (column === 0 && row[index].texte === '')
            row[index].options = { texteAvant: '$x\\in\\;\\;$' }
        }
      }
      return AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        0,
        table,
        'clavierEnsemble clavierCompare',
        interactive,
        {},
      ).output
    }
    const callbackName = `intervalles-${this.numeroExercice ?? 0}-verification`
    TableauMathliveElement.registerVerificationCallback(
      callbackName,
      (exercise, questionIndex, table) => {
        const points: number[] = []
        exercise.answers ??= {}
        for (const [key, expected] of Object.entries(answers)) {
          const id = `champTexteEx${exercise.numeroExercice}Q${questionIndex}${key}`
          const field = table.querySelector<
            HTMLElement & { value: string; readOnly: boolean }
          >(`#${id}`)
          const actual = field?.value ?? ''
          const isLine = field instanceof IntervalleDroiteElement
          const isOk =
            actual !== '' &&
            (isLine
              ? actual === expected.value
              : fonctionComparaison(
                  actual,
                  String(expected.value),
                  expected.options,
                ).isOk)
          points.push(isOk ? 1 : 0)
          exercise.answers[
            isLine ? id : `Ex${exercise.numeroExercice}Q${questionIndex}${key}`
          ] = actual
          if (field != null) {
            if (isLine) field.interactivityOn = false
            else field.readOnly = true
            const result =
              document.getElementById(
                `resultatCheckEx${exercise.numeroExercice}Q${questionIndex}${key}`,
              ) ?? document.createElement('span')
            result.id = `resultatCheckEx${exercise.numeroExercice}Q${questionIndex}${key}`
            result.textContent = isOk ? '😎' : '☹️'
            field.after(result)
          }
        }
        const [nbBonnesReponses, nbReponses] = troisPointsProportionnels(points)
        return {
          isOk: points.every((point) => point === 1),
          feedback: '',
          score: { nbBonnesReponses, nbReponses },
        }
      },
    )
    // Sur smartphone, le tableau est plus large que l'écran : on le rend
    // défilable horizontalement au lieu de le laisser déborder de la page.
    this.listeQuestions[0] = renderTable(content, this.interactif).replace(
      '<tableau-mathlive ',
      `<tableau-mathlive verify-callback-name="${callbackName}" style="display:block;max-width:100%;overflow-x:auto" `,
    )
    handleAnswers(
      this,
      0,
      { ...answers, bareme: troisPointsProportionnels },
      { formatInteractif: 'tableau-mathlive' },
    )
    this.listeCorrections[0] =
      renderTable(correction, false) + '<br>' + details.join('<br>')
    listeQuestionsToContenu(this)
  }
}
