import type * as BlocklyType from 'blockly/core'
import type { javascriptGenerator as JsGen } from 'blockly/javascript'

// Cache des modules - assignés une seule fois au premier appel
let Blockly!: typeof BlocklyType
let javascriptGenerator!: typeof JsGen

export async function loadBlockly(): Promise<{
  Blockly: typeof BlocklyType
  javascriptGenerator: typeof JsGen
}> {
  if (!Blockly) {
    await import('blockly/blocks')
    Blockly = (await import('blockly/core')) as unknown as typeof BlocklyType
    const jsModule = await import('blockly/javascript')
    javascriptGenerator = jsModule.javascriptGenerator
    const En = await import('blockly/msg/en')
    Blockly.setLocale(En as unknown as { [key: string]: string })
  }
  return { Blockly, javascriptGenerator }
}
