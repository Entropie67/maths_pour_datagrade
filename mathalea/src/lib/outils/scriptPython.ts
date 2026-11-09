export function scriptPython(code: string, n: number): string {
  const indentedLines = formatPythonForLatex(code, n)
  return `$\\begin{array}{|l|}
        \\hline
        ${indentedLines}\\\\\n
        \\hline
        \\end{array}$`
}

function formatPythonForLatex(pythonCode: string, indentSize: number): string {
  // Diviser le code en lignes
  const lines = pythonCode.split('\n')
  const formattedLines = lines.map((line) => {
    // Compter les espaces en début de ligne
    const leadingSpaces = line.match(/^(\s*)/)
    const indent = leadingSpaces ? leadingSpaces[1] : ''
    // Remplacer les espaces en tête par \, (autant de fois qu'il y en a)
    return (
      indent.replace(/\s/g, '\\,'.repeat(indentSize)) +
      `\\texttt{${line.slice(indent.length)}}`
    )
  })
  return formattedLines.join('\\\\\n')
}
