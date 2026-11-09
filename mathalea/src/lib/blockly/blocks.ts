import * as Blockly from 'blockly/core'

let isBlocklyBlocksInitialized = false

// Define the block styles: https://developers.google.com/blockly/guides/configure/web/themes#block_style
/* const blockStyles = {
  hat_blocks: {
    colourPrimary: '#4C97FF',
    colourSecondary: '#4280D7',
    colourTertiary: '#3373CC',
    hat: 'cap',
  },
}

// Create the theme: https://developers.google.com/blockly/guides/configure/web/themes#create_a_theme
 const theme = Blockly.Theme.defineTheme('themeName', {
  blockStyles,
})
*/

export function ensureBlocklyBlocksInitialized() {
  if (isBlocklyBlocksInitialized) return ''

  Blockly.Blocks['start'] = {
    init: function () {
      this.appendDummyInput().appendField('Démonstration')
      this.setInputsInline(true)
      this.setNextStatement(true, null)
      this.setStyle('hat_blocks') // Set the style to match the style *name*.
      this.setColour(50)
      this.setTooltip('Démonstration')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['demarrer'] = {
    init: function () {
      this.appendDummyInput().appendField('Démarrer')
      this.setInputsInline(true)
      this.setNextStatement(true, null)
      this.setStyle('hat_blocks')
      this.setColour(50)
      this.setTooltip('Point de depart du script')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['dire_2s'] = {
    init: function () {
      this.appendValueInput('MESSAGE').setCheck(null).appendField('dire')
      this.appendDummyInput().appendField('pendant 2 s')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(160)
      this.setTooltip('Affiche une valeur pendant 2 secondes')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['reciproque'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldLabelSerializable('Réciproque'),
        'reciproque',
      )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(30)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['thales'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldLabelSerializable('Théorème de Thalès'),
        'trigo',
      )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(30)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['demonstration'] = {
    init: function () {
      this.appendStatementInput('Condition')
        .setCheck(null)
        .appendField(new Blockly.FieldLabelSerializable('Condition'), 'Cond')
      this.appendStatementInput('Propriété')
        .setCheck(null)
        .appendField(new Blockly.FieldLabelSerializable('Propriété'), 'Prop')
      this.appendStatementInput('Conclusion')
        .setCheck(null)
        .appendField(new Blockly.FieldLabelSerializable('Conclusion'), 'Concl')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(150)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['triangle_rect_iso'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Le triangle ')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'prepoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'deuxpoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'troispoint',
        )
      this.appendDummyInput()
        .appendField('est ')
        .appendField(
          new Blockly.FieldDropdown([
            ['rectangle', 'rect'],
            ['isocèle', 'iso'],
          ]),
          'tritype',
        )
      this.appendDummyInput()
        .appendField('en')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'trisommet',
        )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.getField('prepoint').setValue('A')
      this.getField('deuxpoint').setValue('B')
      this.getField('troispoint').setValue('C')
      this.getField('trisommet').setValue('A')
      this.setColour(80)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['pythagore'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldLabelSerializable('Théorème de Pythagore'),
        'pytha',
      )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(30)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['trigonometrie'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldLabelSerializable('Trigonométrie'),
        'trigo',
      )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(30)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['egale_comp'] = {
    init: function () {
      this.appendValueInput('op1').setCheck(null)
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'equal'],
          ['≠', 'different'],
          ['≃', 'approx'],
          ['<', 'pluspetit'],
          ['>', 'plusgrand'],
        ]),
        'op',
      )
      this.appendValueInput('op2').setCheck(null)
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(180)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['egale_2_comp'] = {
    init: function () {
      this.appendValueInput('op1').setCheck(null)
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'equal'],
          ['≠', 'different'],
          ['≃', 'approx'],
          ['<', 'pluspetit'],
          ['>', 'plusgrand'],
        ]),
        'ope1',
      )
      this.appendValueInput('op2').setCheck(null)
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'equal'],
          ['≠', 'different'],
          ['≃', 'approx'],
          ['<', 'pluspetit'],
          ['>', 'plusgrand'],
        ]),
        'ope2',
      )
      this.appendValueInput('op3').setCheck(null)
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(180)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['longueur'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['AB', 'AB'],
          ['BC', 'BC'],
          ['CA', 'CA'],
          ['DE', 'DE'],
          ['EF', 'EF'],
          ['FD', 'FD'],
        ]),
        'Longueur_triangle',
      )
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(190)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['carre'] = {
    init: function () {
      this.appendValueInput('value').setCheck(null)
      this.appendDummyInput().appendField('²')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(210)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['operation'] = {
    init: function () {
      this.appendValueInput('op1').setCheck(null)
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['+', 'plus'],
          ['-', 'moins'],
          ['x', 'multi'],
          ['÷', 'divise'],
          ['/', 'fraction'],
        ]),
        'op',
      )
      this.appendValueInput('op2').setCheck(null)
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(210)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['operation_square_trigo'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['√', 'racine'],
          ['cos', 'cos'],
          ['sin', 'sin'],
          ['tan', 'tan'],
          ['arccos', 'arccos'],
          ['arcsin', 'arcsin'],
          ['arctan', 'arctan'],
        ]),
        'op',
      )
      this.appendValueInput('value').setCheck(null)
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['unite'] = {
    init: function () {
      this.appendValueInput('value').setCheck(null)
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['cm', 'cm'],
          ['m', 'm'],
          ['km', 'km'],
          ['°', 'deg'],
        ]),
        'unite',
      )
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['textinput'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldTextInput('123'),
        'NUM',
      )
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['angle'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Angle:')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
          ]),
          'premlettre',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['B', 'B'],
            ['C', 'C'],
            ['A', 'A'],
          ]),
          'deuxlettre',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['C', 'C'],
            ['A', 'A'],
            ['B', 'B'],
          ]),
          'troislettre',
        )
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(190)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['secantes'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Les droites (')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd1prepoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd1deuxpoint',
        )
        .appendField(')')
      this.appendDummyInput()
        .appendField('et (')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd2prepoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd2deuxpoint',
        )
        .appendField(')')
      this.appendDummyInput()
        .appendField('sont sécantes en')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'sommet',
        )
      this.getField('d1prepoint').setValue('A')
      this.getField('d1deuxpoint').setValue('B')
      this.getField('d2prepoint').setValue('C')
      this.getField('d2deuxpoint').setValue('D')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(80)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  Blockly.Blocks['paralleles'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Les droites (')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd1prepoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd1deuxpoint',
        )
        .appendField(')')
      this.appendDummyInput()
        .appendField('et (')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd2prepoint',
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D'],
            ['E', 'E'],
            ['F', 'F'],
          ]),
          'd2deuxpoint',
        )
        .appendField(')')
      this.appendDummyInput().appendField('sont parallèles')
      this.getField('d1prepoint').setValue('A')
      this.getField('d1deuxpoint').setValue('B')
      this.getField('d2prepoint').setValue('C')
      this.getField('d2deuxpoint').setValue('D')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(80)
      this.setTooltip('')
      this.setHelpUrl('')
    },
  }

  isBlocklyBlocksInitialized = true
  return ''
}

// Compatibilite descendante pour les imports existants.
export function init() {
  return ensureBlocklyBlocksInitialized()
}
