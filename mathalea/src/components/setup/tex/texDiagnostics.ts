/**
 * Lecture du journal de compilation LaTeX.
 *
 * Le service de compilation renvoie le journal complet de LuaLaTeX (plusieurs
 * centaines de lignes, dont l'immense majorité est du bruit : chargement des
 * paquets, métriques de polices…). On en extrait les erreurs et les
 * avertissements utiles, avec leur ligne dans le source, et on traduit en
 * français les messages les plus courants.
 *
 * Même parti pris que `typst/typstDiagnostics.ts` : un message non couvert
 * par la table reste en anglais, jugé plus utile qu'une approximation, et le
 * texte d'origine reste consultable dans le panneau.
 */

export interface TexDiagnostic {
  /** Ligne du source (1-based), absente quand le journal ne la donne pas */
  line?: number
  severity: 'error' | 'warning'
  /** Message affiché, traduit quand une règle le couvre */
  message: string
  /** Message d'origine, tel que TeX l'a écrit */
  raw: string
  /** Piste de résolution, quand la règle en propose une */
  hint?: string
}

interface Rule {
  /** Reconnaît le message brut */
  match: RegExp
  /** Message français ; `$1`… reprennent les groupes de `match` */
  message: string
  hint?: string
}

/**
 * De la règle la plus précise à la plus générale : la première qui reconnaît
 * le message l'emporte.
 */
const RULES: Rule[] = [
  {
    match: /^Undefined control sequence/,
    message: 'Commande inconnue.',
    hint: "La commande est mal orthographiée, ou le paquet qui la définit n'est pas chargé.",
  },
  {
    match: /^LaTeX Error: File [`'"]?([^'"`]+)['"`]? not found/,
    message: 'Fichier « $1 » introuvable.',
    hint: "S'il s'agit d'une image, elle n'a pas été jointe à la compilation ; s'il s'agit d'un .sty, le paquet manque sur le serveur.",
  },
  {
    match: /^LaTeX Error: Environment ([^ ]+) undefined/,
    message: 'Environnement « $1 » inconnu.',
    hint: "Vérifiez l'orthographe, ou chargez le paquet qui le définit.",
  },
  {
    match:
      /^LaTeX Error: \\begin\{([^}]+)\} on input line (\d+) ended by \\end\{([^}]+)\}/,
    message:
      '\\begin{$1} (ligne $2) est fermé par \\end{$3} : les environnements ne correspondent pas.',
    hint: 'Un environnement a été fermé avec le mauvais nom, ou une fermeture manque.',
  },
  {
    match: /^LaTeX Error: \\begin\{([^}]+)\} ended by \\end\{([^}]+)\}/,
    message:
      '\\begin{$1} est fermé par \\end{$2} : les environnements ne correspondent pas.',
  },
  {
    match: /^LaTeX Error: Something's wrong--perhaps a missing \\item/,
    message: "Une liste ne contient aucun \\item.",
    hint: 'Un environnement enumerate ou itemize est vide, ou du texte le précède avant le premier \\item.',
  },
  {
    match: /^LaTeX Error: There's no line here to end/,
    message: "Un \\\\ n'a aucune ligne à terminer.",
    hint: 'Retirez le \\\\ en trop, ou remplacez-le par un saut de paragraphe.',
  },
  {
    match: /^LaTeX Error: Option clash for package ([^ .]+)/,
    message: 'Le paquet $1 est chargé deux fois avec des options différentes.',
  },
  {
    match: /^LaTeX Error: (.+)$/,
    message: '$1',
  },
  {
    match: /^Missing \$ inserted/,
    message: "Une formule mathématique n'a pas été ouverte.",
    hint: "Un caractère réservé aux formules (_, ^, \\frac...) est employé hors des $. Il manque sans doute un $, ou un $ fermant plus haut.",
  },
  {
    match: /^Missing \} inserted/,
    message: 'Il manque une accolade fermante.',
  },
  {
    match: /^Missing \{ inserted/,
    message: 'Il manque une accolade ouvrante.',
  },
  {
    match: /^Too many \}'s/,
    message: 'Une accolade fermante est en trop.',
  },
  {
    match: /^Extra alignment tab has been changed to \\cr/,
    message: 'Une ligne de tableau contient plus de cases que prévu.',
    hint: 'Un & est en trop, ou la définition des colonnes en compte trop peu.',
  },
  {
    match: /^Misplaced alignment tab character &/,
    message: '& employé hors d\'un tableau.',
    hint: 'Pour afficher le caractère lui-même, écrivez \\&.',
  },
  {
    match: /^Paragraph ended before (\\\S+) was complete/,
    message: 'Un saut de paragraphe interrompt $1.',
    hint: 'Une accolade fermante manque probablement avant la ligne vide.',
  },
  {
    match: /^Emergency stop/,
    message: 'Compilation interrompue.',
    hint: "La véritable cause est l'erreur signalée juste avant.",
  },
  {
    match: /^\s*==> Fatal error occurred, no output PDF file produced/,
    message: 'Aucun PDF produit : la compilation a échoué.',
  },
  {
    match: /^Package ([^ ]+) Error: (.+)$/,
    message: 'Paquet $1 : $2',
  },
]

/** Applique la première règle qui reconnaît le message */
function translate(raw: string): { message: string; hint?: string } {
  for (const rule of RULES) {
    const found = rule.match.exec(raw)
    if (found == null) continue
    const substitute = (text: string) =>
      text.replace(/\$(\d)/g, (_, index: string) => found[Number(index)] ?? '')
    return { message: substitute(rule.message), hint: rule.hint }
  }
  return { message: raw }
}

/**
 * TeX coupe ses lignes à 79 caractères : un message peut donc se poursuivre
 * sur les lignes suivantes. On les recolle tant qu'elles ne commencent pas
 * un nouveau bloc.
 */
function joinContinuation(lines: string[], start: number): [string, number] {
  let message = lines[start].trim()
  let index = start + 1
  while (index < lines.length) {
    const next = lines[index]
    if (
      next.trim() === '' ||
      next.startsWith('!') ||
      /^l\.\d+/.test(next) ||
      next.startsWith('See the LaTeX manual') ||
      next.startsWith('Type  H <return>')
    ) {
      break
    }
    message += ' ' + next.trim()
    index += 1
  }
  return [message.trim(), index]
}

/** Numéro de ligne du source, donné par TeX sous la forme `l.42 ...` */
function sourceLineAt(lines: string[], from: number): number | undefined {
  // la ligne `l.N` suit l'erreur de près, éventuellement après le rappel
  // « See the LaTeX manual… »
  for (let index = from; index < Math.min(from + 6, lines.length); index++) {
    const found = /^l\.(\d+)/.exec(lines[index])
    if (found != null) return Number(found[1])
  }
  return undefined
}

/**
 * Extrait du journal les erreurs et avertissements portant sur le document.
 *
 * Les avertissements typographiques (`Overfull \hbox`…) sont écartés : une
 * fiche en produit des dizaines et ils n'appellent aucune correction.
 */
export function parseTexLog(log: string): TexDiagnostic[] {
  const lines = log.split(/\r?\n/)
  const diagnostics: TexDiagnostic[] = []
  const seen = new Set<string>()

  const add = (diagnostic: TexDiagnostic) => {
    const key = `${diagnostic.severity}|${diagnostic.line ?? ''}|${diagnostic.raw}`
    if (seen.has(key)) return
    seen.add(key)
    diagnostics.push(diagnostic)
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (line.startsWith('!')) {
      const [raw, next] = joinContinuation(lines, index)
      const message = raw.replace(/^!\s*/, '')
      const translated = translate(message)
      add({
        line: sourceLineAt(lines, next),
        severity: 'error',
        message: translated.message,
        raw: message,
        hint: translated.hint,
      })
      index = next - 1
      continue
    }

    const warning =
      /^(LaTeX|Package [^ ]+|Class [^ ]+) Warning: (.*)$/.exec(line)
    if (warning != null) {
      const [raw, next] = joinContinuation(lines, index)
      const message = raw.replace(/^(LaTeX|Package [^ ]+|Class [^ ]+) Warning: /, '')
      const onLine = /on input line (\d+)/.exec(raw)
      const translated = translate(message)
      add({
        line: onLine != null ? Number(onLine[1]) : undefined,
        severity: 'warning',
        message: translated.message,
        raw: message,
        hint: translated.hint,
      })
      index = next - 1
    }
  }

  // « Emergency stop » et « Fatal error » ne disent rien de plus que l'erreur
  // qui les précède : on ne les garde que faute de mieux
  const substantial = diagnostics.filter(
    (diagnostic) =>
      !/^(Emergency stop|\s*==> Fatal error)/.test(diagnostic.raw),
  )
  return substantial.length > 0 ? substantial : diagnostics
}

export function countErrors(diagnostics: TexDiagnostic[]): number {
  return diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
    .length
}

/** Résumé affiché en tête du panneau, par exemple « 2 erreurs, 1 avertissement » */
export function summarizeDiagnostics(diagnostics: TexDiagnostic[]): string {
  const errors = countErrors(diagnostics)
  const warnings = diagnostics.length - errors
  const parts: string[] = []
  if (errors > 0) parts.push(errors > 1 ? `${errors} erreurs` : '1 erreur')
  if (warnings > 0) {
    parts.push(warnings > 1 ? `${warnings} avertissements` : '1 avertissement')
  }
  return parts.join(', ')
}
