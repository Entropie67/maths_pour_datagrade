/**
 * Lecture et traduction en français des diagnostics du compilateur Typst.
 *
 * Le compilateur renvoie des lignes brutes au format « unix » :
 * `main.typ:2:9-3:15: error: unknown variable: foo`
 * (le fichier peut être préfixé par un paquet : `tblr:0.5.0@lib.typ:…`).
 *
 * Ce module les transforme en objets exploitables par l'interface :
 * position dans l'éditeur, sévérité, message en français et piste de
 * résolution. Le message d'origine reste disponible (`original`) : les
 * traductions ne couvrent pas tout, et un message anglais exact reste
 * utile pour chercher dans la documentation Typst.
 */

export type TypstSeverity = 'error' | 'warning'

export interface TypstDiagnostic {
  /** Ligne brute renvoyée par le compilateur */
  raw: string
  severity: TypstSeverity
  /** Fichier concerné (`main.typ` pour le code de la fiche) */
  file?: string
  /** Paquet `@preview` d'où vient le diagnostic, le cas échéant */
  packageName?: string
  /** Le diagnostic ne concerne pas le code affiché dans l'éditeur */
  external: boolean
  /** Ligne (1-based) dans le code de la fiche */
  line?: number
  /** Colonne (1-based) */
  column?: number
  endLine?: number
  endColumn?: number
  /** Message d'origine, en anglais */
  original: string
  /** Message traduit en français (retombe sur l'original si non couvert) */
  message: string
  /** Piste de résolution, en français */
  hint?: string
}

/**
 * Le fichier virtuel du code de la fiche (voir `MAIN_FILE` dans
 * `typstCompiler.ts`, dont le compilateur retire le `/` initial).
 */
const MAIN_FILE_NAMES = new Set(['main.typ', '/main.typ'])

/**
 * `fichier:ligne:col[-ligne:col]: sévérité: message`. Le nom de fichier est
 * capturé de façon paresseuse pour supporter les préfixes de paquet, qui
 * contiennent eux-mêmes des `:` (`tblr:0.5.0@lib.typ`).
 */
const UNIX_DIAGNOSTIC =
  /^(.*?):(\d+):(\d+)(?:-(\d+):(\d+))?:\s*(error|warning|info)\s*:\s*([\s\S]*)$/

/** `nom:version@fichier` quand le diagnostic vient d'un paquet importé */
const PACKAGE_PREFIX = /^([^:@]+):[^@]*@(.*)$/

/**
 * Les lignes et colonnes du format « unix » sont comptées à partir de 1,
 * comme dans l'éditeur : vérifié sur `/main.typ:3:2: error: unknown
 * variable: …` pour un `#nom` en début de 3ᵉ ligne.
 */
const LINE_OFFSET = 0
const COLUMN_OFFSET = 0

/** Découpe une ligne brute de diagnostic, sans traduire le message */
function parseOne(raw: string): TypstDiagnostic {
  const match = UNIX_DIAGNOSTIC.exec(raw.trim())
  if (match == null) {
    // format inattendu (message d'erreur de l'hôte, panique WASM…) :
    // on garde la ligne telle quelle plutôt que de la perdre
    const bare = raw.replace(/^\s*(error|warning)\s*:\s*/i, '').trim()
    const translated = translateTypstMessage(bare)
    return {
      raw,
      severity: /^\s*warning/i.test(raw) ? 'warning' : 'error',
      external: false,
      original: bare,
      message: translated.message,
      hint: translated.hint,
    }
  }
  const [, rawFile, line, column, endLine, endColumn, severity, message] = match
  const packageMatch = PACKAGE_PREFIX.exec(rawFile)
  const file = packageMatch != null ? packageMatch[2] : rawFile
  const external = !MAIN_FILE_NAMES.has(file.replace(/^\.?\//, ''))
  const translated = translateTypstMessage(message, { external })
  return {
    raw,
    severity: severity === 'warning' ? 'warning' : 'error',
    file,
    packageName: packageMatch?.[1],
    external,
    // une position dans un fichier importé ne désigne pas une ligne de l'éditeur
    line: external ? undefined : Number(line) + LINE_OFFSET,
    column: external ? undefined : Number(column) + COLUMN_OFFSET,
    endLine:
      external || endLine === undefined
        ? undefined
        : Number(endLine) + LINE_OFFSET,
    endColumn:
      external || endColumn === undefined
        ? undefined
        : Number(endColumn) + COLUMN_OFFSET,
    original: message,
    message: translated.message,
    hint: translated.hint,
  }
}

/**
 * Convertit les diagnostics bruts en objets traduits, erreurs d'abord
 * (ce sont elles qui bloquent le rendu), puis dans l'ordre du document.
 */
export function parseTypstDiagnostics(raw: string[]): TypstDiagnostic[] {
  const seen = new Set<string>()
  const parsed = raw
    .filter((line) => line.trim() !== '')
    .map(parseOne)
    // le même message répété sur une même ligne (colonnes voisines, ou
    // exercice répété d'une version à l'autre) n'apporte rien de plus :
    // le panneau ne navigue de toute façon qu'à la ligne
    .filter((diagnostic) => {
      const key =
        diagnostic.line != null
          ? `${diagnostic.severity}|${diagnostic.line}|${diagnostic.original}`
          : diagnostic.raw
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  return parsed.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1
    return (
      (a.line ?? Number.MAX_SAFE_INTEGER) - (b.line ?? Number.MAX_SAFE_INTEGER)
    )
  })
}

/** Noms de types Typst, tels qu'ils apparaissent dans les messages */
const TYPE_NAMES: Record<string, string> = {
  content: 'contenu',
  string: 'chaîne de caractères',
  str: 'chaîne de caractères',
  integer: 'entier',
  int: 'entier',
  float: 'nombre décimal',
  boolean: 'booléen',
  bool: 'booléen',
  array: 'tableau',
  dictionary: 'dictionnaire',
  function: 'fonction',
  arguments: 'arguments',
  length: 'longueur',
  ratio: 'pourcentage',
  'relative length': 'longueur relative',
  relative: 'longueur relative',
  fraction: 'fraction',
  angle: 'angle',
  color: 'couleur',
  gradient: 'dégradé',
  alignment: 'alignement',
  label: 'étiquette',
  symbol: 'symbole',
  none: 'none',
  auto: 'auto',
  module: 'module',
  bytes: 'octets',
  datetime: 'date',
  duration: 'durée',
  stroke: 'trait',
  selector: 'sélecteur',
  location: 'position',
  counter: 'compteur',
  version: 'version',
  regex: 'expression régulière',
  decimal: 'nombre décimal',
}

/** Traduit un nom de type Typst, ou le laisse tel quel s'il est inconnu */
function type(name: string): string {
  return TYPE_NAMES[name.trim()] ?? name.trim()
}

/**
 * Éléments de syntaxe cités dans les messages « expected … » : ils désignent
 * un caractère ou un mot-clé précis, pas un type de valeur.
 */
const SYNTAX_NAMES: Record<string, string> = {
  'closing brace': 'une accolade fermante « } »',
  'closing bracket': 'un crochet fermant « ] »',
  'closing paren': 'une parenthèse fermante « ) »',
  'closing quote': 'un guillemet fermant',
  'closing delimiter': 'un délimiteur fermant',
  'opening brace': 'une accolade ouvrante « { »',
  'opening bracket': 'un crochet ouvrant « [ »',
  'opening paren': 'une parenthèse ouvrante « ( »',
  comma: 'une virgule',
  colon: 'deux-points « : »',
  semicolon: 'un point-virgule',
  'semicolon or line break': 'un point-virgule ou un retour à la ligne',
  identifier: 'un identifiant',
  expression: 'une expression',
  pattern: 'un motif',
  keyword: 'un mot-clé',
  'end of file': 'la fin du fichier',
  'hash or opening brace': 'un « # » ou une accolade ouvrante',
}

/** Traduit soit un élément de syntaxe, soit un type */
function expected(name: string): string {
  const key = name.trim().replace(/^`|`$/g, '')
  return SYNTAX_NAMES[key] ?? type(key)
}

interface Translation {
  message: string
  hint?: string
}

interface Rule {
  match: RegExp
  /** Message français ; `m` est le résultat de `match` */
  fr: (m: RegExpExecArray) => string
  hint?: string | ((m: RegExpExecArray) => string | undefined)
}

/**
 * Traductions des messages Typst, du plus spécifique au plus général : la
 * première règle qui correspond gagne. Les conseils visent un professeur qui
 * retouche le code généré, pas un développeur Typst.
 */
const RULES: Rule[] = [
  // --- Structure du document généré par MathALÉA ---
  {
    match:
      /pagebreak.* not allowed inside of a container|page break.*container/i,
    fr: () =>
      'Un saut de page est interdit à l’intérieur d’un bloc (colonnes, encadré…).',
    hint: 'Fermez le bloc « en-colonnes » avant le #pagebreak() puis rouvrez-le après — c’est ce que fait le bouton « saut de page » de la palette de mise en page.',
  },
  {
    match: /unknown variable:\s*`?(fig-\d+)`?/i,
    fr: (m) => `La figure « ${m[1]} » est utilisée mais n’est jamais définie.`,
    hint: 'Les figures sont déclarées en tête de fichier (#let fig-N = image(…)). Si vous avez supprimé cette ligne, régénérez le code ou remettez la déclaration.',
  },
  {
    match: /unknown variable:\s*`?([\w-]+)`?/i,
    fr: (m) => `Variable ou fonction inconnue : « ${m[1]} ».`,
    hint: (m) =>
      `Vérifiez l’orthographe de « ${m[1]} », ou ajoutez sa définition (#let ${m[1]} = …) avant son utilisation.`,
  },
  {
    match:
      /variable\s+`?([\w-]+)`?\s+is not initialized yet|(?:variable|binding).*used before/i,
    fr: (m) =>
      `La variable « ${m[1] ?? ''} » est utilisée avant d’être définie.`.replace(
        ' «  »',
        '',
      ),
    hint: 'Déplacez la ligne #let correspondante au-dessus de son utilisation.',
  },

  // --- Paquets et fichiers ---
  {
    match:
      /package not found|failed to (?:download|load) package|package .* not found/i,
    fr: () => 'Un paquet Typst importé est introuvable.',
    hint: 'Les paquets @preview sont téléchargés depuis packages.typst.org : vérifiez votre connexion, puis relancez la compilation (une modification du code suffit).',
  },
  {
    match: /file not found\s*\(searched at (.+?)\)/i,
    fr: (m) => `Fichier introuvable : « ${m[1]} ».`,
    hint: 'Dans l’aperçu du navigateur, seuls les fichiers embarqués par MathALÉA (images des exercices) sont accessibles.',
  },
  { match: /file not found/i, fr: () => 'Fichier introuvable.' },
  {
    match: /unknown font family:?\s*"?([^"]*)"?/i,
    fr: (m) => `Police inconnue : « ${m[1]?.trim()} ».`,
    hint: 'Choisissez une police dans la liste des Réglages : seules celles-là sont chargées dans le compilateur.',
  },
  {
    match:
      /failed to (?:decode|parse|load) image|unknown image format|invalid .* signature/i,
    fr: () => 'Une image n’a pas pu être décodée.',
    hint: 'Le fichier n’a pas été téléchargé correctement ou son format n’est pas reconnu (formats acceptés : PNG, JPEG, GIF, SVG).',
  },

  // --- Syntaxe ---
  {
    match:
      /unclosed delimiter|expected (closing brace|closing bracket|closing paren|closing quote|closing delimiter)/i,
    fr: (m) =>
      m[1] != null
        ? `Il manque ${expected(m[1])}.`
        : 'Un délimiteur ouvert n’est jamais refermé.',
    hint: 'Vérifiez l’équilibre des accolades { }, crochets [ ] et parenthèses ( ) autour de cette position.',
  },
  {
    match: /unexpected end of block comment/i,
    fr: () => 'Fin de commentaire « */ » sans commentaire ouvert.',
  },
  {
    match: /the character `?#`? is not valid in code/i,
    fr: () => 'Le caractère « # » n’est pas valide à cet endroit.',
    hint: 'Vous êtes déjà dans du code (après un premier « # », ou dans un bloc { }) : les fonctions s’y appellent sans « # ».',
  },
  {
    match: /the character `?(.+?)`? is not valid in code/i,
    fr: (m) => `Le caractère « ${m[1]} » n’est pas valide dans du code Typst.`,
  },
  {
    match: /unterminated (?:string|raw text|block comment)/i,
    fr: () =>
      'Une chaîne, un bloc de code ou un commentaire n’est jamais refermé.',
  },
  {
    match: /expected (.+?), found (.+)$/i,
    fr: (m) => `Attendu : ${expected(m[1])} ; trouvé : ${expected(m[2])}.`,
  },
  { match: /expected (.+)$/i, fr: (m) => `Il manque ${expected(m[1])}.` },
  {
    match: /unexpected (?:token|character|symbol)\s*:?\s*`?(.*?)`?$/i,
    fr: (m) =>
      m[1] !== ''
        ? `Caractère inattendu : « ${m[1]} ».`
        : 'Caractère inattendu.',
  },
  {
    match: /the character `?(.+?)`? is not valid in an identifier/i,
    fr: (m) => `Le caractère « ${m[1]} » est interdit dans un nom de variable.`,
    hint: 'Les noms Typst n’acceptent que lettres, chiffres, « - » et « _ ».',
  },
  {
    match: /unexpected (?:closing )?(brace|bracket|paren|parenthesis)/i,
    fr: () => 'Délimiteur fermant en trop.',
  },
  {
    match:
      /this (?:function|expression) is only allowed directly in (?:code|markup|math) mode/i,
    fr: () => 'Cette instruction n’est pas autorisée à cet endroit.',
    hint: 'Une instruction de code doit être précédée d’un « # » dans le texte, ou placée dans un bloc { }.',
  },

  // --- Appels de fonctions ---
  {
    match: /missing argument:?\s*(.*)$/i,
    fr: (m) =>
      m[1].trim() !== ''
        ? `Il manque l’argument « ${m[1].trim()} » dans cet appel.`
        : 'Il manque un argument dans cet appel.',
  },
  {
    match: /unexpected argument:?\s*(.*)$/i,
    fr: (m) =>
      m[1].trim() !== ''
        ? `Argument inattendu : « ${m[1].trim()} ».`
        : 'Argument inattendu dans cet appel.',
    hint: 'Vérifiez le nom de l’argument dans la documentation de la fonction (typst.app/docs).',
  },
  {
    match: /duplicate argument:?\s*(.*)$/i,
    fr: (m) => `L’argument « ${m[1].trim()} » est donné deux fois.`,
  },
  {
    match: /type (\S+) has no method `?([\w-]+)`?/i,
    fr: (m) => `Le type ${type(m[1])} n’a pas de méthode « ${m[2]} ».`,
  },
  {
    match: /(?:dictionary|type \S+) does not contain key\s*"?([^"]*)"?/i,
    fr: (m) => `La clé « ${m[1]} » n’existe pas dans ce dictionnaire.`,
  },
  {
    match: /maximum (?:function call|show rule|grid|layout) depth exceeded/i,
    fr: () =>
      'Profondeur maximale atteinte : une définition s’appelle elle-même.',
    hint: 'Cherchez une fonction (#let) qui se rappelle indirectement, ou une règle #show qui se réapplique à son propre résultat.',
  },

  // --- Valeurs ---
  {
    match: /cannot (?:add|join|apply) (.+?) (?:and|with|to) (.+?)$/i,
    fr: (m) =>
      `Opération impossible entre ${type(m[1])} et ${type(m[2])}.`.replace(
        /\.$/,
        '.',
      ),
    hint: 'Les deux valeurs doivent être de types compatibles (par exemple deux nombres, ou deux contenus).',
  },
  {
    match:
      /(?:array|string) index out of bounds\s*\(index:\s*(-?\d+),\s*len:\s*(\d+)\)/i,
    fr: (m) =>
      `Indice hors limites : l’élément ${m[1]} est demandé alors qu’il n’y en a que ${m[2]}.`,
  },
  { match: /index out of bounds/i, fr: () => 'Indice hors limites.' },
  { match: /cannot divide by zero/i, fr: () => 'Division par zéro.' },
  {
    match: /assertion failed:?\s*(.*)$/i,
    fr: (m) =>
      m[1].trim() !== ''
        ? `Condition non vérifiée : ${m[1].trim()}`
        : 'Une condition (#assert) n’est pas vérifiée.',
  },
  {
    match: /panicked with:?\s*(.*)$/i,
    fr: (m) => `Interruption demandée par le code : ${m[1].trim()}`,
  },

  // --- Mise en page ---
  {
    match: /layout did not converge within (\d+) attempts?/i,
    fr: () => 'La mise en page ne se stabilise pas.',
    hint: 'Un élément dépend de sa propre position (souvent un contenu plus haut que la page). Réduisez la taille de la figure ou du tableau signalé.',
  },
  {
    match: /content .* too large|does not fit|too large to fit/i,
    fr: () => 'Un élément est trop grand pour l’espace disponible.',
    hint: 'Réduisez le zoom de la figure, le nombre de colonnes, ou la taille du texte.',
  },

  // --- Avertissements fréquents ---
  {
    match: /unused import|imported .* is never used/i,
    fr: () => 'Import inutilisé.',
  },
  {
    match: /no text within (\*|_)/,
    fr: () => 'Marqueur de mise en forme vide (rien entre les deux symboles).',
  },
]

/**
 * Traduit un message du compilateur Typst. Un message non couvert est
 * renvoyé tel quel : mieux vaut de l'anglais exact qu'une approximation.
 */
export function translateTypstMessage(
  message: string,
  options: { external?: boolean } = {},
): Translation {
  const trimmed = message.trim()
  for (const rule of RULES) {
    const match = rule.match.exec(trimmed)
    if (match == null) continue
    const hint = typeof rule.hint === 'function' ? rule.hint(match) : rule.hint
    return { message: rule.fr(match), hint }
  }
  if (options.external === true) {
    return {
      message: trimmed,
      hint: 'Ce message vient d’un paquet importé, pas du code de la fiche.',
    }
  }
  return { message: trimmed }
}

/** Nombre d'erreurs (les avertissements n'empêchent pas le rendu) */
export function countErrors(diagnostics: TypstDiagnostic[]): number {
  return diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
    .length
}

/** Résumé « 2 erreurs, 1 avertissement » pour l'en-tête du panneau */
export function summarizeDiagnostics(diagnostics: TypstDiagnostic[]): string {
  const errors = countErrors(diagnostics)
  const warnings = diagnostics.length - errors
  const parts: string[] = []
  if (errors > 0) parts.push(`${errors} erreur${errors > 1 ? 's' : ''}`)
  if (warnings > 0)
    parts.push(`${warnings} avertissement${warnings > 1 ? 's' : ''}`)
  return parts.join(', ')
}
