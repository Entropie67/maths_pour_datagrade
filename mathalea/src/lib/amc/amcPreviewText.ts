/**
 * Convertit les séparateurs de texte LaTeX en HTML sans toucher au contenu
 * mathématique. Les `\\` de `array`, `aligned`, matrices, etc. doivent parvenir
 * intacts à KaTeX.
 */
export function latexLineBreaksToHtmlOutsideMath(source: string): string {
  let result = ''
  let index = 0
  let mathDelimiter: '$' | '\\[' | null = null

  while (index < source.length) {
    if (mathDelimiter === '$') {
      const char = source[index]
      result += char
      index++
      if (char === '$' && source[index - 2] !== '\\') mathDelimiter = null
      continue
    }

    if (mathDelimiter === '\\[') {
      if (source.startsWith('\\]', index)) {
        result += '\\]'
        index += 2
        mathDelimiter = null
      } else {
        result += source[index]
        index++
      }
      continue
    }

    if (source[index] === '$' && source[index - 1] !== '\\') {
      mathDelimiter = '$'
      result += '$'
      index++
      continue
    }
    if (source.startsWith('\\[', index)) {
      mathDelimiter = '\\['
      result += '\\['
      index += 2
      continue
    }
    if (source.startsWith('\\\\', index)) {
      result += '<br>'
      index += 2
      continue
    }
    if (source.startsWith('\\medskip', index)) {
      result += '<br><br>'
      index += '\\medskip'.length
      continue
    }
    if (source.startsWith('\n\n', index)) {
      result += '<br>'
      index += 2
      continue
    }

    result += source[index]
    index++
  }

  return result
}

/**
 * Convertit les commandes LaTeX textuelles produites pendant la passe AMC en
 * HTML pour la prévisualisation. Les commandes situées dans les délimiteurs
 * mathématiques restent ensuite prises en charge par KaTeX.
 */
export function latexTextToHtmlForAMCPreview(source: string): string {
  let html = source

  // `numAlpha()` et `numAlphaNum()` produisent notamment `\textbf {a)}`.
  html = html.replace(/\\textbf\s*\{([^}]*)\}/g, '<strong>$1</strong>')
  // `texteEnCouleurEtGras()` produit l'une de ces deux formes.
  html = html.replace(
    /\{\\bfseries\s+\\color\[HTML\]\{([0-9a-fA-F]{6})\}([^{}]*)\}/g,
    (_, hex, text) =>
      hex === '000000'
        ? `<strong>${text}</strong>`
        : `<strong style="color:#${hex}">${text}</strong>`,
  )
  html = html.replace(
    /\{\\bfseries\s+\\color\{([^}]+)\}([^{}]*)\}/g,
    (_, color, text) =>
      color === 'black'
        ? `<strong>${text}</strong>`
        : `<strong style="color:${color}">${text}</strong>`,
  )

  return latexLineBreaksToHtmlOutsideMath(html)
}

/**
 * Retire de l'énoncé HTML le QCM déjà injecté par la passe de génération du
 * moteur. La preview AMC dessine elle-même les cases à partir des propositions
 * d'`autoCorrectionAMC` : conserver ce composant produirait deux QCM.
 *
 * Les deux formes sont acceptées afin de couvrir le custom element actuel et
 * l'ancien bloc HTML encore présent dans certains snapshots.
 */
export function stripEmbeddedQcmFromAMCPreview(source: string): string {
  if (source.trim().length === 0) return ''

  return source
    .replace(/<mathalea-qcm\b[^>]*>[\s\S]*?<\/mathalea-qcm>/gi, '')
    .replace(/<mathalea-qcm\b[^>]*\/\s*>/gi, '')
    .replace(
      /<div[^>]*class=(['"])[^'"]*my-3[^'"]*\1[^>]*>[\s\S]*?<\/div>\s*<div[^>]*id=(['"])resultatCheckEx[^'"]*\2[^>]*><\/div>/gi,
      '',
    )
    .replace(/<div[^>]*id=(['"])resultatCheckEx[^'"]*\1[^>]*><\/div>/gi, '')
    .replace(/(<br\s*\/?>\s*){2,}$/gi, '')
    .trim()
}

/**
 * Capture les énoncés HTML réellement produits pour la preview AMC.
 * `mathaleaHandleExerciceSimple()` rassemble ses variantes dans
 * `listeQuestions` ; la propriété `question` ne contient plus que le dernier
 * tirage et ne doit donc servir que de repli.
 */
export function getHtmlQuestionsForAMCPreview(exercice: {
  listeQuestions?: string[]
  question?: unknown
}): string[] {
  if (
    Array.isArray(exercice.listeQuestions) &&
    exercice.listeQuestions.length > 0
  ) {
    return [...exercice.listeQuestions]
  }
  return exercice.question == null ? [] : [String(exercice.question)]
}
