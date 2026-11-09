/**
 * Versions des paquets Typst (registre `@preview`) utilisés par les exports.
 *
 * Source unique : c'est le seul endroit où une version de paquet est écrite.
 * Les lignes `#import` émises dans les préambules (fiches, diaporamas,
 * flashcards) sont construites à partir de cette table, tout comme les tests
 * qui les vérifient — mettre à jour un paquet se fait donc ici et nulle part
 * ailleurs.
 */
export const TYPST_PACKAGE_VERSIONS = {
  'exercise-bank': '0.8.0',
  taskize: '0.2.10',
  vartable: '0.2.4',
  cetz: '0.5.2',
  'cetz-plot': '0.1.4',
  'ctz-euclide': '0.3.0',
  breather: '0.1.0',
  tiaoma: '0.3.0',
} as const

/** Nom d'un paquet Typst connu de MathALÉA */
export type TypstPackageName = keyof typeof TYPST_PACKAGE_VERSIONS

/**
 * Spécificateur d'un paquet, `@preview/nom:version`, tel qu'attendu par
 * Typst dans un `#import`.
 */
export function typstPackageSpec(name: TypstPackageName): string {
  return `@preview/${name}:${TYPST_PACKAGE_VERSIONS[name]}`
}

/**
 * Ligne `#import` d'un paquet. `imported` est ce qui suit les deux-points
 * (`*`, `tabvar`, `tasks as taskize-tasks, …`) ; omis, l'import se fait sous
 * le nom du module (`#import "@preview/cetz:0.3.4"` → `cetz.canvas`).
 */
export function typstImport(name: TypstPackageName, imported?: string): string {
  const base = `#import "${typstPackageSpec(name)}"`
  return imported == null ? base : `${base}: ${imported}`
}
