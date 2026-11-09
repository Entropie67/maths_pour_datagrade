import { describe, expect, it } from 'vitest'
import {
  blocklyWorkspaceJsonToScratchXml,
  normalizedScratchWorkspaceXml,
  ScratchEditorElement,
  scratchWorkspaceXmlToArithmeticAst,
  scratchWorkspaceXmlToScratchblockCode,
  scratchWorkspaceXmlToVariableValues,
} from '../../src/lib/customElements/ScratchEditor'
import { areArithmeticAstsEquivalent } from '../../src/lib/mathFonctions/expression'

describe('ScratchEditor conversions', () => {
  it('convertit la solution Blockly de 5I1C en XML Scratch puis en AST', () => {
    const blocklySolution = {
      blocks: {
        blocks: [
          {
            type: 'demarrer',
            next: {
              block: {
                type: 'dire_2s',
                inputs: {
                  MESSAGE: {
                    block: {
                      type: 'operation',
                      fields: { op: 'plus' },
                      inputs: {
                        op1: {
                          block: { type: 'textinput', fields: { NUM: '7' } },
                        },
                        op2: {
                          block: {
                            type: 'operation',
                            fields: { op: 'multi' },
                            inputs: {
                              op1: {
                                block: {
                                  type: 'textinput',
                                  fields: { NUM: '3' },
                                },
                              },
                              op2: {
                                block: {
                                  type: 'textinput',
                                  fields: { NUM: '4' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }

    const scratchXml = blocklyWorkspaceJsonToScratchXml(blocklySolution)
    const ast = scratchWorkspaceXmlToArithmeticAst(scratchXml)

    expect(scratchXml).toContain('event_whenflagclicked')
    expect(scratchXml).toContain('looks_sayforsecs')
    expect(scratchXml).toContain('operator_add')
    expect(scratchXml).toContain('looks_sayforsecs')
    expect(ast).not.toBeNull()
    expect(
      areArithmeticAstsEquivalent(ast!, {
        type: 'operation',
        op: 'plus',
        left: { type: 'number', value: 7 },
        right: {
          type: 'operation',
          op: 'multi',
          left: { type: 'number', value: 3 },
          right: { type: 'number', value: 4 },
        },
      }),
    ).toBe(true)
  })

  it('monte le custom element sans afficher le message d erreur', () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    document.body.append(element)

    try {
      expect(element.textContent).not.toContain(
        'Impossible de charger les blocs Scratch',
      )
      expect(element.querySelector('svg.blocklySvg')).not.toBeNull()
      expect(element.querySelector('.injectionDiv')).not.toBeNull()
    } finally {
      element.remove()
    }
  })

  it("n'affiche pas le bandeau d execution par defaut", () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    document.body.append(element)

    try {
      expect(element.querySelector('.scratch-editor-toolbar')).toBeNull()
      expect(element.querySelector('.scratch-editor-area')).not.toBeNull()
    } finally {
      element.remove()
    }
  })

  it("affiche le bandeau d execution lorsqu'il est active", () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    element.setAttribute('show-toolbar', 'true')
    element.setAttribute('enable-run', 'true')
    element.setAttribute('enable-stop', 'true')
    document.body.append(element)

    try {
      expect(element.querySelector('.scratch-editor-toolbar')).not.toBeNull()
      expect(element.querySelector('[data-action="run"]')).not.toBeNull()
      expect(element.querySelector('[data-action="stop"]')).not.toBeNull()
    } finally {
      element.remove()
    }
  })

  it('masque le menu des categories par defaut', () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    document.body.append(element)

    try {
      expect(element.querySelector('.blocklyToolboxCategory')).toBeNull()
      expect(element.querySelector('.blocklyFlyout')).not.toBeNull()
    } finally {
      element.remove()
    }
  })

  it("n'affiche pas la poubelle du workspace", () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    document.body.append(element)

    try {
      expect(element.querySelector('.blocklyTrash')).toBeNull()
    } finally {
      element.remove()
    }
  })

  it("affiche le menu des categories lorsqu'il est active", () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    element.setAttribute('show-categories', 'true')
    document.body.append(element)

    try {
      expect(element.querySelector('.blocklyToolboxCategory')).not.toBeNull()
    } finally {
      element.remove()
    }
  })

  it('charge une toolbox Scratch avec des blocs variables', () => {
    const element = document.createElement(
      ScratchEditorElement.elementTag,
    ) as ScratchEditorElement
    element.setAttribute('height', '260px')
    element.setAttribute(
      'toolbox',
      JSON.stringify({
        categories: [
          {
            id: 'variables',
            blocks: [
              {
                opcode: 'data_setvariableto',
                fields: { VARIABLE: 'AB' },
                inputs: { VALUE: 0 },
              },
              { opcode: 'data_variable', fields: { VARIABLE: 'AB' } },
            ],
          },
        ],
      }),
    )
    element.setAttribute(
      'initial-value',
      JSON.stringify({
        workspaceXml:
          '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_whenflagclicked" x="24" y="24"><next><block type="data_setvariableto"><field name="VARIABLE">AB</field><value name="VALUE"><shadow type="math_number"><field name="NUM">5</field></shadow></value></block></next></block></xml>',
      }),
    )
    document.body.append(element)

    try {
      expect(element.textContent).not.toContain(
        'Impossible de charger les blocs Scratch',
      )
      expect(element.value).toContain('data_setvariableto')
      expect(element.value).toContain('AB')
    } finally {
      element.remove()
    }
  })

  it('normalise les differences non semantiques du XML Scratch', () => {
    const expectedXml =
      '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_whenflagclicked" x="24" y="24"><next><block type="data_setvariableto"><field name="VARIABLE">GH</field><value name="VALUE"><shadow type="math_number"><field name="NUM">3</field></shadow></value><next><block type="data_setvariableto"><field name="VARIABLE">aire</field><value name="VALUE"><block type="operator_multiply"><value name="NUM1"><block type="data_variable"><field name="VARIABLE">GH</field></block></value><value name="NUM2"><block type="data_variable"><field name="VARIABLE">GH</field></block></value></block></value><next><block type="looks_sayforsecs"><value name="MESSAGE"><block type="data_variable"><field name="VARIABLE">aire</field></block></value><value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value></block></next></block></next></block></next></block></xml>'
    const scratchExportedXml =
      '<xml><variables><variable id="id-gh" type="">GH</variable><variable id="id-aire" type="">aire</variable></variables><block type="event_whenflagclicked" id="start" x="24" y="24"><next><block type="data_setvariableto" id="set-gh"><field name="VARIABLE" id="id-gh" variabletype="">GH</field><value name="VALUE"><block type="math_number" id="num-gh"><field name="NUM">3</field></block></value><next><block type="data_setvariableto" id="set-aire"><field name="VARIABLE" id="id-aire" variabletype="">aire</field><value name="VALUE"><block type="operator_multiply" id="mul"><value name="NUM1"><block type="data_variable" id="var-gh-1"><field name="VARIABLE" id="id-gh" variabletype="">GH</field></block></value><value name="NUM2"><block type="data_variable" id="var-gh-2"><field name="VARIABLE" id="id-gh" variabletype="">GH</field></block></value></block></value><next><block type="looks_sayforsecs" id="say"><value name="MESSAGE"><block type="data_variable" id="var-aire"><field name="VARIABLE" id="id-aire" variabletype="">aire</field></block></value><value name="SECS"><block type="math_number" id="secs"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></xml>'

    expect(normalizedScratchWorkspaceXml(scratchExportedXml)).toBe(
      normalizedScratchWorkspaceXml(expectedXml),
    )
  })

  it('convertit le XML Scratch en code scratchblock canonique sans ids', () => {
    const scratchExportedXml =
      '<xml><variables><variable id="id-gh" type="">GH</variable><variable id="id-aire" type="">aire</variable></variables><block type="event_whenflagclicked" id="start" x="24" y="24"><next><block type="data_setvariableto" id="set-gh"><field name="VARIABLE" id="id-gh" variabletype="">GH</field><value name="VALUE"><block type="math_number" id="num-gh"><field name="NUM">3</field></block></value><next><block type="data_setvariableto" id="set-aire"><field name="VARIABLE" id="id-aire" variabletype="">aire</field><value name="VALUE"><block type="operator_multiply" id="mul"><value name="NUM1"><block type="data_variable" id="var-gh-1"><field name="VARIABLE" id="id-gh" variabletype="">GH</field></block></value><value name="NUM2"><block type="data_variable" id="var-gh-2"><field name="VARIABLE" id="id-gh" variabletype="">GH</field></block></value></block></value><next><block type="looks_sayforsecs" id="say"><value name="MESSAGE"><block type="data_variable" id="var-aire"><field name="VARIABLE" id="id-aire" variabletype="">aire</field></block></value><value name="SECS"><block type="math_number" id="secs"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></xml>'

    expect(scratchWorkspaceXmlToScratchblockCode(scratchExportedXml)).toBe(
      [
        'quand drapeau vert est clique',
        'mettre GH a 3',
        'mettre aire a (GH * GH)',
        'dire aire pendant 2 secondes',
      ].join('\n'),
    )
  })

  it('execute les affectations Scratch et compare une formule commutative', () => {
    const solutionXml =
      '<xml><block type="event_whenflagclicked"><next><block type="data_setvariableto"><field name="VARIABLE">nombreFilles</field><value name="VALUE"><block type="math_number"><field name="NUM">12</field></block></value><next><block type="data_setvariableto"><field name="VARIABLE">nombreGarcons</field><value name="VALUE"><block type="math_number"><field name="NUM">15</field></block></value><next><block type="data_setvariableto"><field name="VARIABLE">frequence</field><value name="VALUE"><block type="operator_divide"><value name="NUM1"><block type="data_variable"><field name="VARIABLE">nombreGarcons</field></block></value><value name="NUM2"><block type="operator_add"><value name="NUM1"><block type="data_variable"><field name="VARIABLE">nombreFilles</field></block></value><value name="NUM2"><block type="data_variable"><field name="VARIABLE">nombreGarcons</field></block></value></block></value></block></value></block></next></block></next></block></next></block></xml>'
    const equivalentXml =
      '<xml><block type="event_whenflagclicked"><next><block type="data_setvariableto"><field name="VARIABLE">nombreFilles</field><value name="VALUE"><block type="math_number"><field name="NUM">12</field></block></value><next><block type="data_setvariableto"><field name="VARIABLE">nombreGarcons</field><value name="VALUE"><block type="math_number"><field name="NUM">15</field></block></value><next><block type="data_setvariableto"><field name="VARIABLE">frequence</field><value name="VALUE"><block type="operator_divide"><value name="NUM1"><block type="data_variable"><field name="VARIABLE">nombreGarcons</field></block></value><value name="NUM2"><block type="operator_add"><value name="NUM1"><block type="data_variable"><field name="VARIABLE">nombreGarcons</field></block></value><value name="NUM2"><block type="data_variable"><field name="VARIABLE">nombreFilles</field></block></value></block></value></block></value></block></next></block></next></block></next></block></xml>'

    expect(scratchWorkspaceXmlToVariableValues(equivalentXml)?.frequence).toBe(
      scratchWorkspaceXmlToVariableValues(solutionXml)?.frequence,
    )
  })
})
