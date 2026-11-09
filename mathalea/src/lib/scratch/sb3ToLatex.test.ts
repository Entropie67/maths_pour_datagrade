import { describe, expect, it } from 'vitest'

import { sb3ToLatex } from './sb3ToLatex'

describe('sb3ToLatex', () => {
  it('rend les arguments de procedures_definition et procedures_call', () => {
    const project = {
      targets: [
        {
          name: 'Sprite1',
          blocks: {
            def: {
              opcode: 'procedures_definition',
              topLevel: true,
              shadow: false,
              next: null,
              inputs: {
                custom_block: [1, 'proto'],
              },
            },
            proto: {
              opcode: 'procedures_prototype',
              mutation: {
                proccode: 'tester %n et %b',
                argumentnames: '["distance", "condition"]',
              },
            },
            call: {
              opcode: 'procedures_call',
              topLevel: true,
              shadow: false,
              next: null,
              mutation: {
                proccode: 'tester %n et %b',
                argumentids: '["argNum", "argBool"]',
              },
              inputs: {
                argNum: [1, [4, '10']],
                argBool: [1, 'isGreater'],
              },
            },
            isGreater: {
              opcode: 'operator_gt',
              shadow: false,
              inputs: {
                OPERAND1: [1, [4, '7']],
                OPERAND2: [1, [4, '2']],
              },
            },
          },
        },
      ],
    }

    const latex = sb3ToLatex(JSON.stringify(project))

    expect(latex).toContain(
      '\\initmoreblocks{définir \\namemoreblocks{tester \\ovalmoreblocks{distance} et \\boolmoreblocks{condition}}}',
    )
    expect(latex).toContain(
      '\\blockmoreblocks{tester \\ovalnum{10} et \\booloperator{\\ovalnum{7} > \\ovalnum{2}}}',
    )
  })

  it('remplace aussi les placeholders échappés dans procedures_definition', () => {
    const project = {
      targets: [
        {
          name: 'Sprite1',
          blocks: {
            def: {
              opcode: 'procedures_definition',
              topLevel: true,
              shadow: false,
              next: null,
              inputs: {
                custom_block: [1, 'proto'],
              },
            },
            proto: {
              opcode: 'procedures_prototype',
              mutation: {
                proccode: 'polygone_regulier \\%n \\%n',
                argumentnames: '["number1", "number2"]',
              },
            },
          },
        },
      ],
    }

    const latex = sb3ToLatex(JSON.stringify(project))

    expect(latex).toContain(
      '\\initmoreblocks{définir \\namemoreblocks{polygone\\_regulier \\ovalmoreblocks{number1} \\ovalmoreblocks{number2}}}',
    )
  })

  it('remplace les placeholders même avec plusieurs antislashs avant %n', () => {
    const project = {
      targets: [
        {
          name: 'Sprite1',
          blocks: {
            def: {
              opcode: 'procedures_definition',
              topLevel: true,
              shadow: false,
              next: null,
              inputs: {
                custom_block: [1, 'proto'],
              },
            },
            proto: {
              opcode: 'procedures_prototype',
              mutation: {
                proccode: 'polygone_regulier \\\\%n \\\\%n',
                argumentnames: '["number1", "number2"]',
              },
            },
          },
        },
      ],
    }

    const latex = sb3ToLatex(JSON.stringify(project))

    expect(latex).toContain(
      '\\initmoreblocks{définir \\namemoreblocks{polygone\\_regulier \\ovalmoreblocks{number1} \\ovalmoreblocks{number2}}}',
    )
  })

  it('rend les argument_reporter dans le corps de la procédure', () => {
    const project = {
      targets: [
        {
          name: 'Sprite1',
          blocks: {
            def: {
              opcode: 'procedures_definition',
              topLevel: true,
              shadow: false,
              next: 'repeat1',
              inputs: {
                custom_block: [1, 'proto'],
              },
            },
            proto: {
              opcode: 'procedures_prototype',
              mutation: {
                proccode: 'polygone_regulier %n %n',
                argumentnames: '["number1", "number2"]',
              },
            },
            repeat1: {
              opcode: 'control_repeat',
              shadow: false,
              next: null,
              inputs: {
                TIMES: [1, 'argNumber1ForTimes'],
                SUBSTACK: [1, 'move1'],
              },
            },
            argNumber1ForTimes: {
              opcode: 'argument_reporter_string_number',
              shadow: false,
              fields: {
                VALUE: ['number1', null],
              },
            },
            move1: {
              opcode: 'motion_movesteps',
              shadow: false,
              next: 'turn1',
              inputs: {
                STEPS: [1, 'argNumber2ForSteps'],
              },
            },
            argNumber2ForSteps: {
              opcode: 'argument_reporter_string_number',
              shadow: false,
              fields: {
                VALUE: ['number2', null],
              },
            },
            turn1: {
              opcode: 'motion_turnright',
              shadow: false,
              next: null,
              inputs: {
                DEGREES: [1, 'divide1'],
              },
            },
            divide1: {
              opcode: 'operator_divide',
              shadow: false,
              inputs: {
                NUM1: [1, [4, '360']],
                NUM2: [1, 'argNumber1ForDivide'],
              },
            },
            argNumber1ForDivide: {
              opcode: 'argument_reporter_string_number',
              shadow: false,
              fields: {
                VALUE: ['number1', null],
              },
            },
          },
        },
      ],
    }

    const latex = sb3ToLatex(JSON.stringify(project))

    expect(latex).toContain(
      '\\blockrepeat{répéter \\ovalmoreblocks{number1} fois}',
    )
    expect(latex).toContain(
      '\\blockmove{avancer de \\ovalmoreblocks{number2} pas}',
    )
    expect(latex).toContain(
      '\\blockmove{tourner \\turnright{} de \\ovaloperator{\\ovalnum{360} / \\ovalmoreblocks{number1}} degrés}',
    )
  })

  it("traduit la touche 'space' en 'espace'", () => {
    const project = {
      targets: [
        {
          name: 'Sprite1',
          blocks: {
            root: {
              opcode: 'event_whenkeypressed',
              topLevel: true,
              shadow: false,
              next: null,
              fields: {
                KEY_OPTION: ['space', null],
              },
            },
          },
        },
      ],
    }

    const latex = sb3ToLatex(JSON.stringify(project))

    expect(latex).toContain(
      '\\blockinit{quand la touche \\selectmenu{espace} est pressée}',
    )
  })
})
