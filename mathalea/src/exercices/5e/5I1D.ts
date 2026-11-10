import * as Blockly from 'blockly/core'
import * as En from 'blockly/msg/en'
import { ensureBlocklyBlocksInitialized } from '../../lib/blockly/blocks'
import {
  addBloklyEditor,
  BlocklyEditor,
  type BlocklyEditorOptions,
} from '../../lib/customElements/BlocklyEditor'
import {
  addScratchEditor,
  ScratchEditorElement,
  scratchWorkspaceXmlToVariableValues,
  type ScratchEditorOptions,
  type ScratchToolboxDefinition,
} from '../../lib/customElements/ScratchEditor'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer la valeur de formules à l'aide d'un programme en blocs"
export const interactifReady = true
export const dateDePublication = '17/07/2026'

/**
 * Exercice pour manipuler les langages mathématiques et algorithmiques et réviser certaines notions du programme de 5e.
 * @author Jean-Claude Lhote
 */
export const uuid = 'c3f91'

export const refs = {
  'fr-fr': ['5I1D'],
  'fr-ch': [],
}

Blockly.setLocale(En as unknown as { [key: string]: string })

const scenariosByLevel: Record<number, string[]> = {
  1: [
    'Aire du carré',
    'Périmètre du triangle équilatéral',
    'Aire du rectangle',
    'Convertir des heures en minutes',
  ],
  2: [
    'Périmètre du rectangle',
    'Prix après remise',
    'Fréquence filles ou garçons',
    'Aire du triangle rectangle',
  ],
  3: ['Réduction et prix final', 'Prix HT et Prix TTC'],
}

const VERIFY_CALLBACK_NAME = '5I1D_AST_EQUIVALENCE'
const SCRATCH_VERIFY_CALLBACK_NAME = '5I1D_SCRATCH_RESULT_VALUE_EQUIVALENCE'

type OperationType = 'plus' | 'moins' | 'multi' | 'divise'
type ValueExpr =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | {
      type: 'operation'
      op: OperationType
      left: ValueExpr
      right: ValueExpr
    }

type ScenarioPayload = {
  scenarioType: string
  data: Record<string, number | string>
  variableHints: string[]
  distractors: string[]
  initialBlocks?: Record<string, unknown>
}

type ScenarioBlockTypes = {
  assignType: string
  variableType: string
}

const n = (value: number): ValueExpr => ({ type: 'number', value })
const v = (name: string): ValueExpr => ({ type: 'variable', name })
const calc = (
  op: OperationType,
  left: ValueExpr,
  right: ValueExpr,
): ValueExpr => ({
  type: 'operation',
  op,
  left,
  right,
})

const registered5I1DScenarioBlocks = new Set<string>()

function collectVariableNames(expr: ValueExpr): string[] {
  if (expr.type === 'variable') return [expr.name]
  if (expr.type === 'number') return []
  return [
    ...collectVariableNames(expr.left),
    ...collectVariableNames(expr.right),
  ]
}

function buildScenarioVariableChoices(
  assignments: Array<{ variable: string; value: number }>,
  resultExpr: ValueExpr,
  payload: ScenarioPayload,
): string[] {
  return Array.from(
    new Set([
      ...assignments.map((x) => x.variable),
      ...collectVariableNames(resultExpr),
      ...payload.variableHints,
      ...payload.distractors,
    ]),
  )
}

function ensure5I1DScenarioBlocks(
  blockTypes: ScenarioBlockTypes,
  variableChoices: string[],
): void {
  if (registered5I1DScenarioBlocks.has(blockTypes.assignType)) return

  const dropdownOptions = variableChoices.map(
    (name) => [name, name] as [string, string],
  )

  Blockly.Blocks[blockTypes.assignType] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(dropdownOptions), 'VAR')
        .appendField('=')
      this.appendValueInput('VALUE').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setInputsInline(true)
      this.setColour(220)
      this.setTooltip('Affecter une valeur à une variable')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks[blockTypes.variableType] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown(dropdownOptions),
        'VAR',
      )
      this.setOutput(true, null)
      this.setColour(260)
      this.setTooltip('Utiliser une variable')
      this.setHelpUrl('')
    },
  }

  registered5I1DScenarioBlocks.add(blockTypes.assignType)
}

function valueExprToBlocklyValue(
  expr: ValueExpr,
  blockTypes: ScenarioBlockTypes,
): Record<string, unknown> {
  if (expr.type === 'number') {
    return {
      type: 'textinput',
      fields: {
        NUM: String(expr.value),
      },
    }
  }

  if (expr.type === 'variable') {
    return {
      type: blockTypes.variableType,
      fields: {
        VAR: expr.name,
      },
    }
  }

  return {
    type: 'operation',
    fields: {
      op: expr.op,
    },
    inputs: {
      op1: {
        block: valueExprToBlocklyValue(expr.left, blockTypes),
      },
      op2: {
        block: valueExprToBlocklyValue(expr.right, blockTypes),
      },
    },
  }
}

function buildProgramSolutionBlocks(
  assignments: Array<{ variable: string; value: number }>,
  resultExpr: ValueExpr,
  resultVariableName: string,
  blockTypes: ScenarioBlockTypes,
): Record<string, unknown> {
  const startBlock: Record<string, unknown> = {
    type: 'demarrer',
  }

  let current = startBlock
  for (const assignment of assignments) {
    const nextBlock = {
      type: blockTypes.assignType,
      fields: {
        VAR: assignment.variable,
      },
      inputs: {
        VALUE: {
          block: {
            type: 'textinput',
            fields: {
              NUM: String(assignment.value),
            },
          },
        },
      },
    }

    current.next = { block: nextBlock }
    current = nextBlock
  }

  const resultAssignmentBlock = {
    type: blockTypes.assignType,
    fields: {
      VAR: resultVariableName,
    },
    inputs: {
      VALUE: {
        block: valueExprToBlocklyValue(resultExpr, blockTypes),
      },
    },
  }

  current.next = { block: resultAssignmentBlock }
  current = resultAssignmentBlock

  current.next = {
    block: {
      type: 'dire_2s',
      inputs: {
        MESSAGE: {
          block: valueExprToBlocklyValue(
            { type: 'variable', name: resultVariableName },
            blockTypes,
          ),
        },
      },
    },
  }

  return {
    blocks: {
      blocks: [startBlock],
    },
  }
}

function buildProgramInitialBlocks(
  assignments: Array<{ variable: string; value: number }>,
  resultVariableName: string,
  blockTypes: ScenarioBlockTypes,
): Record<string, unknown> {
  const startBlock: Record<string, unknown> = {
    type: 'demarrer',
  }
  const zeroBlock = () => ({
    type: 'textinput',
    fields: {
      NUM: '0',
    },
  })

  let current = startBlock
  for (const assignment of assignments) {
    const nextBlock = {
      type: blockTypes.assignType,
      fields: {
        VAR: assignment.variable,
      },
      inputs: {
        VALUE: {
          block: zeroBlock(),
        },
      },
    }

    current.next = { block: nextBlock }
    current = nextBlock
  }

  const resultAssignmentBlock = {
    type: blockTypes.assignType,
    fields: {
      VAR: resultVariableName,
    },
    inputs: {
      VALUE: {
        block: zeroBlock(),
      },
    },
  }

  current.next = { block: resultAssignmentBlock }
  current = resultAssignmentBlock

  current.next = {
    block: {
      type: 'dire_2s',
      inputs: {
        MESSAGE: {
          block: zeroBlock(),
        },
      },
    },
  }

  return {
    blocks: {
      blocks: [startBlock],
    },
  }
}

function normalizedWorkspaceJson(workspaceJson: unknown): string {
  const keysToRemove = new Set([
    'id',
    'x',
    'y',
    'languageVersion',
    'collapsed',
    'deletable',
    'movable',
    'editable',
    'enabled',
    'inline',
    'inputsInline',
    'data',
    'extraState',
    'isShadow',
    'disabled',
  ])

  const clean = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clean)
    if (value && typeof value === 'object') {
      const output: Record<string, unknown> = {}
      const entries = Object.entries(value as Record<string, unknown>).sort(
        ([a], [b]) => a.localeCompare(b),
      )
      for (const [key, child] of entries) {
        if (!keysToRemove.has(key)) {
          output[key] = clean(child)
        }
      }
      return output
    }
    return value
  }

  return JSON.stringify(clean(workspaceJson))
}

function buildToolboxForScenario(
  blockTypes: ScenarioBlockTypes,
): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'flyoutToolbox',
    contents: [
      {
        kind: 'block',
        type: 'demarrer',
      },
      {
        kind: 'block',
        type: blockTypes.assignType,
      },
      {
        kind: 'block',
        type: blockTypes.variableType,
      },
      {
        kind: 'block',
        type: 'operation',
      },
      {
        kind: 'block',
        type: 'textinput',
      },
      {
        kind: 'block',
        type: 'dire_2s',
      },
    ],
  }
}

function buildScratchToolboxForScenario(
  variableChoices: string[],
): ScratchToolboxDefinition {
  return {
    categories: [
      {
        id: 'events',
        name: 'Événements',
        colour: '#FFBF00',
        blocks: ['event_whenflagclicked'],
      },
      {
        id: 'variables',
        name: 'Variables',
        colour: '#FF8C1A',
        blocks: variableChoices.flatMap((name) => [
          {
            opcode: 'data_setvariableto',
            fields: { VARIABLE: name },
            inputs: { VALUE: 0 },
          },
          {
            opcode: 'data_variable',
            fields: { VARIABLE: name },
          },
        ]),
      },
      {
        id: 'operators',
        name: 'Opérateurs',
        colour: '#59C059',
        blocks: [
          'operator_add',
          'operator_subtract',
          'operator_multiply',
          'operator_divide',
          'math_number',
        ],
      },
      {
        id: 'looks',
        name: 'Apparence',
        colour: '#9966FF',
        blocks: ['looks_sayforsecs'],
      },
    ],
  }
}

function blocklyValueExprToScratchValueXml(
  expr: Record<string, unknown>,
): string {
  const type = expr.type
  if (type === 'textinput') {
    const num = (expr.fields as Record<string, unknown> | undefined)?.NUM ?? 0
    return `<shadow type="math_number"><field name="NUM">${escapeXmlText(String(num))}</field></shadow>`
  }

  if (typeof type === 'string' && type.startsWith('variable_5i1d_')) {
    const name = (expr.fields as Record<string, unknown> | undefined)?.VAR ?? ''
    return `<block type="data_variable"><field name="VARIABLE">${escapeXmlText(String(name))}</field></block>`
  }

  if (type === 'operation') {
    const op = (expr.fields as Record<string, unknown> | undefined)?.op
    const opcodeByOp: Record<string, string> = {
      plus: 'operator_add',
      moins: 'operator_subtract',
      multi: 'operator_multiply',
      divise: 'operator_divide',
    }
    const opcode = typeof op === 'string' ? opcodeByOp[op] : undefined
    const inputs = expr.inputs as Record<
      string,
      { block?: Record<string, unknown> }
    >
    if (
      opcode == null ||
      inputs?.op1?.block == null ||
      inputs?.op2?.block == null
    ) {
      return '<shadow type="math_number"><field name="NUM">0</field></shadow>'
    }
    return [
      `<block type="${opcode}">`,
      '<value name="NUM1">',
      blocklyValueExprToScratchValueXml(inputs.op1.block),
      '</value>',
      '<value name="NUM2">',
      blocklyValueExprToScratchValueXml(inputs.op2.block),
      '</value>',
      '</block>',
    ].join('')
  }

  return '<shadow type="math_number"><field name="NUM">0</field></shadow>'
}

function blocklyProgramToScratchXml(
  solutionBlocks: Record<string, unknown>,
): string {
  const firstBlock = (
    (solutionBlocks.blocks as Record<string, unknown> | undefined)?.blocks as
      Record<string, unknown>[] | undefined
  )?.[0]
  if (firstBlock == null) {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
  }

  const statementToXml = (current: Record<string, unknown>): string => {
    const xml: string[] = []
    if (
      typeof current.type === 'string' &&
      current.type.startsWith('affecter_variable_5i1d_')
    ) {
      const name =
        (current.fields as Record<string, unknown> | undefined)?.VAR ?? ''
      const value = (
        current.inputs as
          Record<string, { block?: Record<string, unknown> }> | undefined
      )?.VALUE?.block
      xml.push(
        '<block type="data_setvariableto">',
        `<field name="VARIABLE">${escapeXmlText(String(name))}</field>`,
        '<value name="VALUE">',
        value == null
          ? '<shadow type="math_number"><field name="NUM">0</field></shadow>'
          : blocklyValueExprToScratchValueXml(value),
        '</value>',
      )
    } else if (current.type === 'dire_2s') {
      const message = (
        current.inputs as
          Record<string, { block?: Record<string, unknown> }> | undefined
      )?.MESSAGE?.block
      xml.push(
        '<block type="looks_sayforsecs">',
        '<value name="MESSAGE">',
        message == null
          ? '<shadow type="math_number"><field name="NUM">0</field></shadow>'
          : blocklyValueExprToScratchValueXml(message),
        '</value>',
        '<value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value>',
      )
    } else {
      xml.push('<block type="looks_sayforsecs">')
    }

    const next = (
      current.next as { block?: Record<string, unknown> } | undefined
    )?.block
    if (next != null) xml.push('<next>', statementToXml(next), '</next>')
    xml.push('</block>')
    return xml.join('')
  }

  const firstStatement = (
    firstBlock.next as { block?: Record<string, unknown> } | undefined
  )?.block
  return [
    '<xml xmlns="https://developers.google.com/blockly/xml">',
    '<block type="event_whenflagclicked" x="24" y="24">',
    firstStatement == null
      ? ''
      : `<next>${statementToXml(firstStatement)}</next>`,
    '</block>',
    '</xml>',
  ].join('')
}

function escapeXmlText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function materialByScenario(
  scenario: string,
  blockTypeSuffix: string,
): {
  enonce: string
  initialBlocks: Record<string, unknown>
  solutionBlocks: Record<string, unknown>
  toolbox: Blockly.utils.toolbox.ToolboxDefinition
  initialScratchXml: string
  scratchToolbox: ScratchToolboxDefinition
  solutionScratchXml: string
  payload: ScenarioPayload
  variableChoices: string[]
} {
  let assignments: Array<{ variable: string; value: number }>
  let resultExpr: ValueExpr
  let enonce: string
  let payload: ScenarioPayload

  switch (scenario) {
    case 'Aire du carré': {
      const nom = creerNomDePolygone(4)
      const a = nom[0]
      const b = nom[1]
      const c = nom[2]
      const d = nom[3]
      const abName = `${a}${b}`
      const cote = randint(3, 12)
      assignments = [{ variable: abName, value: cote }]
      resultExpr = calc('multi', v(abName), v(abName))
      enonce = `On veut réaliser un programme qui calcule l'aire du carré ${a}${b}${c}${d}.<br>
       Écrire le programme permettant de calculer l'aire sachant que $${abName} = ${cote}$.<br><br>`
      payload = {
        scenarioType: 'aire_carre',
        data: { nom: `${a}${b}${c}${d}`, [abName]: cote },
        variableHints: [abName, 'aire'],
        distractors: [`${a}${c}`, `${b}${d}`],
      }
      break
    }
    case 'Périmètre du triangle équilatéral': {
      const nom = creerNomDePolygone(3)
      const a = nom[0]
      const b = nom[1]
      const c = nom[2]
      const coteName = `${a}${b}`
      const cote = randint(3, 12)
      assignments = [{ variable: coteName, value: cote }]
      resultExpr = calc('multi', n(3), v(coteName))
      enonce = `On veut réaliser un programme qui calcule le périmètre du triangle équilatéral ${a}${b}${c}.<br>
       Écrire le programme permettant de calculer ce périmètre sachant que $${coteName} = ${cote}$.<br><br>`
      payload = {
        scenarioType: 'perimetre_triangle_equilateral',
        data: { nom: `${a}${b}${c}`, [coteName]: cote },
        variableHints: [coteName, 'perimetre'],
        distractors: [`${a}${c}`, `${b}${c}`],
      }
      break
    }
    case 'Aire du rectangle': {
      const nom = creerNomDePolygone(4)
      const a = nom[0]
      const b = nom[1]
      const c = nom[2]
      const d = nom[3]
      const abName = `${a}${b}`
      const adName = `${a}${d}`
      const acName = `${a}${c}`
      const bdName = `${b}${d}`
      const ab = randint(4, 14)
      const ad = randint(3, 10)
      assignments = [
        { variable: abName, value: ab },
        { variable: adName, value: ad },
      ]
      resultExpr = calc('multi', v(abName), v(adName))
      enonce = `On veut réaliser un programme qui calcule l'aire du rectangle ${a}${b}${c}${d}.<br>
       Écrire le programme permettant de calculer l'aire du rectangle ${a}${b}${c}${d} tel que $${abName} = ${ab}$ et $${adName} = ${ad}$.<br><br>`
      payload = {
        scenarioType: 'aire_rectangle',
        data: { nom: `${a}${b}${c}${d}`, [abName]: ab, [adName]: ad },
        variableHints: [abName, adName, 'aire'],
        distractors: [acName, bdName],
      }
      break
    }
    case 'Convertir des heures en minutes': {
      const heures = randint(1, 12)
      assignments = [{ variable: 'heures', value: heures }]
      resultExpr = calc('multi', v('heures'), n(60))
      enonce = `On veut convertir ${heures} h en minutes.<br>
       Écrire un programme qui calcule le nombre de minutes.<br><br>`
      payload = {
        scenarioType: 'conversion_heures_minutes',
        data: { heures },
        variableHints: ['heures', 'minutes'],
        distractors: ['prixInitial', 'base'],
      }
      break
    }
    case 'Périmètre du rectangle': {
      const nom = creerNomDePolygone(4)
      const a = nom[0]
      const b = nom[1]
      const c = nom[2]
      const d = nom[3]
      const abName = `${a}${b}`
      const adName = `${a}${d}`
      const ab = randint(3, 12)
      const ad = randint(4, 14)
      assignments = [
        { variable: abName, value: ab },
        { variable: adName, value: ad },
      ]
      resultExpr = calc('multi', n(2), calc('plus', v(abName), v(adName)))
      enonce = `On veut calculer le périmètre du rectangle ${a}${b}${c}${d}.<br>
       Écrire le programme qui calcule ce périmètre sachant que ${abName} = ${ab} et ${adName} = ${ad}.<br><br>`
      payload = {
        scenarioType: 'perimetre_rectangle',
        data: { nom: `${a}${b}${c}${d}`, [abName]: ab, [adName]: ad },
        variableHints: [abName, adName, 'perimetre'],
        distractors: [`${a}${c}`, `${b}${d}`],
      }
      break
    }
    case 'Prix après remise': {
      const prixInitial = randint(2, 12) * 10
      const remise = [10, 20, 30, 40][randint(0, 3)]
      assignments = [
        { variable: 'prixInitial', value: prixInitial },
        { variable: 'remise', value: remise },
      ]
      resultExpr = calc(
        'moins',
        v('prixInitial'),
        calc('divise', calc('multi', v('prixInitial'), v('remise')), n(100)),
      )
      enonce = `Un article coûte ${prixInitial} €. Il bénéficie d'une remise de ${remise}${sp()}%.<br>
       Écrire un programme qui calcule le prix final.<br><br>`
      payload = {
        scenarioType: 'prix_apres_remise',
        data: { prixInitial, remise },
        variableHints: ['prixInitial', 'remise', 'prixFinal'],
        distractors: ['prixHT', 'prixTTC'],
      }
      break
    }
    case 'Fréquence filles ou garçons': {
      const filles = randint(10, 18)
      const garcons = randint(10, 18)
      const cible = randint(0, 1) === 0 ? 'filles' : 'garçons'
      assignments = [
        { variable: 'nombreFilles', value: filles },
        { variable: 'nombreGarcons', value: garcons },
      ]
      resultExpr =
        cible === 'filles'
          ? calc(
              'divise',
              v('nombreFilles'),
              calc('plus', v('nombreFilles'), v('nombreGarcons')),
            )
          : calc(
              'divise',
              v('nombreGarcons'),
              calc('plus', v('nombreFilles'), v('nombreGarcons')),
            )
      enonce = `Dans une classe, il y a $${filles}$ filles et $${garcons}$ garçons.<br>
       Écrire un programme qui calcule la fréquence des ${cible}.<br><br>`
      payload = {
        scenarioType: 'frequence_filles_garcons',
        data: { filles, garcons, cible },
        variableHints: ['nombreFilles', 'nombreGarcons', 'frequence'],
        distractors: ['AB', 'AD'],
      }
      break
    }
    case 'Aire du triangle rectangle': {
      const base = randint(4, 16)
      const hauteur = randint(4, 16)
      assignments = [
        { variable: 'base', value: base },
        { variable: 'hauteur', value: hauteur },
      ]
      resultExpr = calc('divise', calc('multi', v('base'), v('hauteur')), n(2))
      enonce = `On veut calculer l'aire d'un triangle rectangle de base $${base}$ et de hauteur $${hauteur}$.<br>
       Écrire un programme qui calcule cette aire.<br><br>`
      payload = {
        scenarioType: 'aire_triangle_rectangle',
        data: { base, hauteur },
        variableHints: ['base', 'hauteur', 'aire'],
        distractors: ['AB', 'BD'],
      }
      break
    }
    case 'Réduction et prix final': {
      const prixInitial = randint(2, 10) * 10
      const remise = [10, 20, 30][randint(0, 2)]
      assignments = [
        { variable: 'prixInitial', value: prixInitial },
        { variable: 'remise', value: remise },
      ]
      resultExpr = calc(
        'moins',
        v('prixInitial'),
        calc('divise', calc('multi', v('prixInitial'), v('remise')), n(100)),
      )
      enonce = `Un vêtement coûte ${prixInitial} €. La réduction est de ${remise}${sp()}%.<br>
       Écrire un programme qui calcule le montant à payer.<br><br>`
      payload = {
        scenarioType: 'reduction_prix_final',
        data: { prixInitial, remise },
        variableHints: ['prixInitial', 'remise', 'prixFinal'],
        distractors: ['nombreFilles', 'AB'],
      }
      break
    }
    case 'Prix HT et Prix TTC': {
      const prixHT = randint(3, 12) * 10
      const tva = [5, 10, 20][randint(0, 2)]
      assignments = [
        { variable: 'prixHT', value: prixHT },
        { variable: 'tva', value: tva },
      ]
      resultExpr = calc(
        'plus',
        v('prixHT'),
        calc('divise', calc('multi', v('prixHT'), v('tva')), n(100)),
      )
      enonce = `Le prix HT est ${prixHT} € et la TVA est de ${tva}${sp()}%.<br>
       Écrire un programme qui calcule le prix TTC.<br><br>`
      payload = {
        scenarioType: 'prix_ht_ttc',
        data: { prixHT, tva },
        variableHints: ['prixHT', 'tva', 'prixTTC'],
        distractors: ['AB', 'AD'],
      }
      break
    }
    default: {
      const a = randint(3, 12)
      const b = randint(3, 12)
      assignments = [
        { variable: 'AB', value: a },
        { variable: 'AD', value: b },
      ]
      resultExpr = calc('plus', v('AB'), v('AD'))
      enonce = `Écrire un programme qui calcule ${a} + ${b}.<br><br>`
      payload = {
        scenarioType: 'fallback',
        data: { a, b },
        variableHints: ['AB', 'AD', 'resultat'],
        distractors: ['AC', 'BD'],
      }
    }
  }
  const resultVariableName =
    payload.variableHints[payload.variableHints.length - 1] ?? 'resultat'
  const variableChoices = buildScenarioVariableChoices(
    assignments,
    resultExpr,
    payload,
  )
  const blockTypes: ScenarioBlockTypes = {
    assignType: `affecter_variable_5i1d_${blockTypeSuffix}`,
    variableType: `variable_5i1d_${blockTypeSuffix}`,
  }
  ensure5I1DScenarioBlocks(blockTypes, variableChoices)

  const solutionBlocks = buildProgramSolutionBlocks(
    assignments,
    resultExpr,
    resultVariableName,
    blockTypes,
  )
  const initialBlocks = buildProgramInitialBlocks(
    assignments,
    resultVariableName,
    blockTypes,
  )
  const solutionScratchXml = blocklyProgramToScratchXml(solutionBlocks)
  const initialScratchXml = blocklyProgramToScratchXml(initialBlocks)
  payload.initialBlocks = initialBlocks

  return {
    enonce,
    initialBlocks,
    solutionBlocks,
    toolbox: buildToolboxForScenario(blockTypes),
    initialScratchXml,
    scratchToolbox: buildScratchToolboxForScenario(variableChoices),
    solutionScratchXml,
    payload,
    variableChoices,
  }
}

BlocklyEditor.registerVerificationCallback(
  VERIFY_CALLBACK_NAME,
  ({ studentJson, expectedSolution }) => {
    if (expectedSolution == null) {
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
      }
    }

    const isOk =
      normalizedWorkspaceJson(studentJson) ===
      normalizedWorkspaceJson(expectedSolution)
    return {
      isOk,
      feedback: isOk
        ? ''
        : "Le programme ne correspond pas à la suite d'instructions attendue.",
    }
  },
)

ScratchEditorElement.registerVerificationCallback(
  SCRATCH_VERIFY_CALLBACK_NAME,
  ({ studentValue, expectedRaw }) => {
    if (typeof expectedRaw !== 'string') {
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
      }
    }
    try {
      const expected = JSON.parse(expectedRaw) as {
        payload?: ScenarioPayload
        solutionScratchXml?: unknown
      }
      if (typeof expected.solutionScratchXml !== 'string') {
        return {
          isOk: false,
          feedback: 'Réponse Scratch attendue invalide.',
        }
      }
      const resultVariableName =
        expected.payload?.variableHints[
          expected.payload.variableHints.length - 1
        ] ?? 'resultat'
      const studentValues = scratchWorkspaceXmlToVariableValues(
        studentValue.workspaceXml ?? '',
      )
      const expectedValues = scratchWorkspaceXmlToVariableValues(
        expected.solutionScratchXml,
      )
      const studentResult = studentValues?.[resultVariableName]
      const expectedResult = expectedValues?.[resultVariableName]
      const isOk =
        studentResult != null &&
        expectedResult != null &&
        Number.isFinite(studentResult) &&
        Number.isFinite(expectedResult) &&
        Math.abs(studentResult - expectedResult) < 1e-9
      return {
        isOk,
        feedback: isOk
          ? ''
          : 'La valeur calculée pour la variable résultat ne correspond pas à la valeur attendue.',
      }
    } catch {
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
      }
    }
  },
)

export default class CalculerFormuleParBlockly2 extends Exercice {
  constructor() {
    super()
    this.interactifObligatoire = true
    // La réponse est un programme en blocs, pas une valeur à afficher : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Type de question',
      'Nombres séparés par des tirets :\n0: Mélange\n1: Formule à une étape\n2: Formule à deux étapes\n3: Formule avec deux résultats à produire',
    ]
    this.sup = '0'
    this.besoinFormulaire2CaseACocher = [
      "Utiliser l'écriture fractionnaire pour les divisions",
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = [
      'Autoriser les nombres négatifs',
      false,
    ]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = [
      'Toutes les opérations tombent justes',
      true,
    ]
    this.sup4 = true
    this.besoinFormulaire5CaseACocher = ["Utiliser l'éditeur scratch", true]
    this.sup5 = true
  }

  nouvelleVersion(_numeroExercice: number) {
    const listeTypesDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 0,
      nbQuestions: this.nbQuestions,
      shuffle: false,
      defaut: 0,
    }).map(Number)
    this.consigne = `On répondra à la problématique des énoncés en codant un programme en blocs permettant de calculer la réponse au problème.<br>
    On commencera par fixer les valeurs des variables intermédiaires, puis du résultat final en utilisant les variables calculées.<br>
    Enfin, on utilisera l'instruction dire [] pendant 2s pour donner la réponse au problème.<br>`
    const typesUsed = Array.from(new Set<number>(listeTypesDeQuestion)).sort(
      (a, b) => a - b,
    )
    const listeScenariosByType: Record<number, string[]> = {}
    const scenarioIndexByType: Record<number, number> = {}
    for (const type of typesUsed) {
      const countForType = listeTypesDeQuestion.filter((x) => x === type).length
      listeScenariosByType[type] = combinaisonListes(
        scenariosByLevel[type],
        countForType,
      )
      scenarioIndexByType[type] = 0
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const requestedType = listeTypesDeQuestion[i]
      const scenario =
        listeScenariosByType[requestedType][
          scenarioIndexByType[requestedType]++
        ]

      const {
        enonce,
        initialBlocks,
        solutionBlocks,
        toolbox,
        initialScratchXml,
        scratchToolbox,
        solutionScratchXml,
        payload,
        variableChoices,
      } = materialByScenario(scenario, `${this.numeroExercice}_${i}`)

      let texte = enonce
      const correctionEditorId = `${this.sup5 ? 'scratch-editor' : 'blockly-editor'}CorrEx${this.numeroExercice}Q${i}`
      const texteCorr = context.isHtml
        ? [
            `La solution ${this.sup5 ? 'Scratch' : 'Blockly'} est :<br>`,
            this.sup5
              ? addScratchEditor(this, i, {
                  id: correctionEditorId,
                  toolbox: scratchToolbox,
                  initialValue: { workspaceXml: solutionScratchXml },
                  height: '220px',
                  width: '100%',
                  interactivityOn: false,
                  enableRun: false,
                  enableStop: false,
                })
              : BlocklyEditor.create({
                  id: correctionEditorId,
                  options: {
                    toolbox,
                    initialBlocks: solutionBlocks,
                    height: '150px',
                    interactivityOn: false,
                  },
                }),
          ].join('')
        : ''

      if (context.isHtml) {
        if (this.sup5) {
          const scratchOptions: ScratchEditorOptions = {
            toolbox: scratchToolbox,
            initialValue: { workspaceXml: initialScratchXml },
            verifyCallbackName: SCRATCH_VERIFY_CALLBACK_NAME,
            height: '300px',
            interactivityOn: true,
            width: '100%',
          }
          texte += addScratchEditor(this, i, scratchOptions)
        } else {
          const options: BlocklyEditorOptions = {
            toolbox,
            initialBlocks,
            solutionBlocks,
            verifyCallbackName: VERIFY_CALLBACK_NAME,
            height: '300px',
            interactivityOn: true,
            width: '100%',
          }
          texte += addBloklyEditor(this, i, options)
        }
        texte += `<div class="ml-2 py-2" id="resultatCheckEx${this.numeroExercice}Q${i}"></div>`
        texte += ajouteFeedback(this, i)

        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                solutionBlocks,
                initialBlocks,
                initialScratchXml,
                solutionScratchXml,
                payload,
                variableChoices,
              }),
            },
          },
          { formatInteractif: this.sup5 ? 'scratch-editor' : 'blockly-editor' },
        )
      }

      if (this.questionJamaisPosee(i, enonce)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
    ensureBlocklyBlocksInitialized()
  }
}
