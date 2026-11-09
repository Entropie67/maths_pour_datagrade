export function latexCalculator(brokenKeys: string[] = []): string {
  const brokenSet = new Set(brokenKeys.map((key) => key.trim()))
  const buttons = [
    { label: '$\\leftarrow$', value: 'left' },
    { label: '$\\rightarrow$', value: 'right' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '$x^2$', value: '^2' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '$\\div$', value: '/' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '$\\times$', value: '*' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '$-$', value: '-' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '$+/-$', value: 'negate' },
    { label: '+', value: '+' },
    { label: 'EXE', value: '=' },
  ]

  const cols = 4
  const btnW = 1.6
  const btnH = 1.1
  const gap = 0.15
  const gridW = cols * btnW + (cols - 1) * gap

  const lines: string[] = []
  lines.push('\\begin{tikzpicture}[font=\\small]')
  lines.push(
    '  \\tikzset{calcbtn/.style={draw, rounded corners=2pt, minimum width=' +
      btnW +
      'cm, minimum height=' +
      btnH +
      'cm, align=center}}',
  )
  lines.push(
    '  \\tikzset{calcbtnbroken/.style={calcbtn, fill=gray!20, text=gray}}',
  )
  lines.push(
    '  \\node[draw, rounded corners=2pt, minimum width=' +
      gridW +
      `cm, minimum height=1.1cm, fill=black!10, align=right, text width=` +
      (gridW - 0.2) +
      'cm] (display) at (0,' +
      (btnH * 4 + gap * 4 + 0.2) +
      ') {0};',
  )
  /*
  lines.push(
    '  \\node[calcbtn, minimum width=' +
      gridW +
      'cm, fill=red!20] (btnC) at (0,' +
      (btnH * 5 + gap * 4) +
      ') {C};',
  ) */

  buttons.forEach((btn, index) => {
    const isBroken = brokenSet.has(btn.value)
    const row = Math.floor(index / cols)
    const col = index % cols
    const x = -gridW / 2 + col * (btnW + gap) + btnW / 2
    const y = btnH * 3 + gap * 3 - row * (btnH + gap)
    lines.push(
      '  \\node[' +
        (isBroken ? 'calcbtnbroken' : 'calcbtn') +
        '] at (' +
        x.toFixed(2) +
        ',' +
        y.toFixed(2) +
        ') {' +
        btn.label +
        '};',
    )
  })

  lines.push('\\end{tikzpicture}')

  return lines.join('\n')
}
