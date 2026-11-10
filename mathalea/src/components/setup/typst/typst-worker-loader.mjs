/**
 * Custom Node.js loader for typst-batch-worker.ts worker threads.
 *
 * Handles the full TypeScript import chain from the MathALÉA codebase:
 *   1. TypeScript files (.ts) — compiled via typescript.transpileModule
 *   2. CSS / SCSS files — return empty module
 *   3. JSON files — add required `type: json` attribute
 *   4. .svelte files — return empty module (not used in worker context)
 *   5. Extension-less relative imports — try .ts then .js
 *
 * Used via Worker execArgv:
 *   ['--loader', pathToFileURL(loaderPath).href]
 */

import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const EMPTY_MODULE = 'export default {}'
const EMPTY_SOURCE = ''

const TS_COMPILE_OPTIONS = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  useDefineForClassFields: true,
  esModuleInterop: true,
  experimentalDecorators: true,
  jsx: ts.JsxEmit.Preserve,
  verbatimModuleSyntax: false,
}

// Vite/vitest globals stub injected at the top of every compiled module
const VITE_ENV_PREAMBLE = `
const __vite_import_meta_env = { VITEST: true, DEV: true, PROD: false, MODE: 'test', BASE_URL: '/' };
`

function compileTs(source, filename) {
  // Replace import.meta.env with our stub before TS stripping
  const patched = source
    .replace(/\bimport\.meta\.env\b/g, '__vite_import_meta_env')
    .replace(/\bimport\.meta\.hot\b/g, 'undefined')
    .replace(/\bimport\.meta\.glob\b/g, '((_p,_o) => ({}))')
  const result = ts.transpileModule(patched, {
    compilerOptions: TS_COMPILE_OPTIONS,
    fileName: filename,
  })
  return VITE_ENV_PREAMBLE + result.outputText
}

export async function resolve(specifier, context, nextResolve) {
  // CSS / SCSS / fonts / images / svelte → empty module (including ?inline and other query params)
  if (/\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|ico|svelte)(\?.*)?$/.test(specifier)) {
    return { url: 'data:text/javascript,export default {}', shortCircuit: true }
  }

  // data: URLs → pass through
  if (specifier.startsWith('data:')) {
    return { url: specifier, shortCircuit: true }
  }

  // mathlive: SSR version lacks browser-only exports (MathfieldElement, renderMathInElement)
  // Return a stub so mathalea.ts can import without errors
  if (specifier === 'mathlive') {
    return {
      url: 'data:text/javascript,export function renderMathInElement(){}; export class MathfieldElement {}; export function renderMath(){}; export default {}',
      shortCircuit: true,
    }
  }

  // blockly: browser-only visual programming library, not compatible with Node.js/jsdom
  if (specifier === 'blockly/core' || specifier.startsWith('blockly/')) {
    return {
      url: 'data:text/javascript,export const setLocale = () => {}; export default { setLocale: () => {}, Blocks: {}, JavaScript: { ORDER_NONE: 0, ORDER_ATOMIC: 0, valueToCode: () => \'\', statementToCode: () => \'\', addReservedWords: () => {} } }',
      shortCircuit: true,
    }
  }

  // scratchblocks : Node suit le champ "main" (build UMD, sans export une fois
  // lu comme ESM, donc loadLanguages est absent) alors que Vite suit "module".
  // On pointe directement vers le build ES, comme en production.
  if (specifier === 'scratchblocks') {
    return nextResolve('scratchblocks/build/scratchblocks.min.es.js', context)
  }

  // JSON files: add required type: json attribute
  if (specifier.endsWith('.json')) {
    const resolved = await nextResolve(specifier, context)
    return { ...resolved, importAttributes: { type: 'json' } }
  }

  // Try to resolve specifier, with .ts / .js / /index.ts / /index.js fallbacks.
  // We always try the fallbacks even when the specifier already has an extension,
  // because some filenames have numeric segments (e.g. CourbeInterpolee.1 → CourbeInterpolee.1.ts).
  const knownExtensions = new Set(['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json'])
  try {
    const result = await nextResolve(specifier, context)
    return result
  } catch (originalErr) {
    const ext = extname(specifier)
    // TypeScript sources imported with their emitted extension (`./x.js` for
    // x.ts, as TS asks under moduleResolution NodeNext) : retry on the .ts
    const tsEquivalents = { '.js': '.ts', '.mjs': '.mts', '.cjs': '.cts' }
    if (tsEquivalents[ext]) {
      try {
        return await nextResolve(specifier.slice(0, -ext.length) + tsEquivalents[ext], context)
      } catch {
        throw originalErr
      }
    }
    // If it already has a recognised JS/TS/JSON extension, don't try further fallbacks
    if (knownExtensions.has(ext)) throw originalErr
    // Try .ts
    try {
      return await nextResolve(specifier + '.ts', context)
    } catch {
      // Try .js
      try {
        return await nextResolve(specifier + '.js', context)
      } catch {
        // Try /index.ts (directory import)
        try {
          return await nextResolve(specifier + '/index.ts', context)
        } catch {
          // Try /index.js
          try {
            return await nextResolve(specifier + '/index.js', context)
          } catch {
            throw originalErr
          }
        }
      }
    }
  }
}

export async function load(url, context, nextLoad) {
  // CSS/style files that slipped through resolve (e.g. with ?inline suffix) — treat as empty
  if (/\.(css|scss|sass|less)(\?.*)?$/.test(url)) {
    return { format: 'module', source: 'export default {}', shortCircuit: true }
  }

  // data: URLs → Node.js handles them natively (no need for load hook)
  if (url.startsWith('data:text/javascript,')) {
    return { format: 'module', source: url.slice('data:text/javascript,'.length), shortCircuit: true }
  }

  // JSON files: read raw and return
  if (url.startsWith('file://') && url.endsWith('.json')) {
    try {
      const source = readFileSync(fileURLToPath(url), 'utf8')
      return { format: 'json', source, shortCircuit: true }
    } catch {
      return nextLoad(url, context)
    }
  }

  // TypeScript files: compile then return as module
  if (url.startsWith('file://') && /\.(ts|mts|cts)$/.test(url)) {
    const filePath = fileURLToPath(url)
    try {
      const rawSource = readFileSync(filePath, 'utf8')
      const compiled = compileTs(rawSource, filePath)
      return { format: 'module', source: compiled, shortCircuit: true }
    } catch (err) {
      throw new Error(`TypeScript compile error in ${filePath}: ${err.message}`)
    }
  }

  // Safety: never let style files reach the default loader
  if (/\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|ico|svelte)/.test(url)) {
    process.stderr.write(`[loader:load] safety catch for: ${url}\n`)
    return { format: 'module', source: 'export default {}', shortCircuit: true }
  }

  return nextLoad(url, context)
}
