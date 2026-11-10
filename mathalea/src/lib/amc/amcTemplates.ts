/**
 * @author Jean-claude Lhote
 */
import nunjucks from 'nunjucks'

nunjucks.configure('templates', { autoescape: false })

export const AMCOpenTemplate = `\\element{ {{- ref -}} }{
{% if multicols %}\\begin{multicols}{2}
{% endif %}
  \\begin{question}{ {{- id -}} }\\AMClabel{ {{- id -}} }
    {{ enonce }}
    \\explain{ {{- correction -}} }
    \\notation{ {{- notation -}} }[{{ sanscadre }}][{{ pointilles }}]
  \\end{question}
{% if multicols %}\\end{multicols}
{% endif %}
}`

export const AMCNumTemplate = `\\element{ {{- ref -}} }{
{% if multicols %}\\begin{multicols}{2}
{% endif %}
  \\begin{questionmultx}{ {{- id -}} }\\AMClabel{ {{- id -}} }
    {{ enonce }}
{%- if display and display.align %}
  \\begin{ {{- display.align -}} }
{%- endif %}
{%- if display and display.label and display.labelPosition == "left" %}
  {{ display.label | safe }}
{%- endif %}
{%- for b in blocks %}
{%- if b.label %}
    {{ b.label }}
{%- endif %}
  \\AMCnumericChoices{ {{- b.value -}} }{
      digits={{ b.digits }},
      decimals={{ b.decimals }},
      sign={{ b.sign }},
{%- if b.options.approx %}
      approx={{ b.options.approx }},
{%- endif %}
{%- if b.options.exponent %}
      exponent={{ b.options.exponent }},
{%- endif %}
{%- if b.options.exposign %}
      exposign={{ b.options.exposign }},
{%- endif %}
{%- if b.options.alsocorrect %}
      alsocorrect={{ b.options.alsocorrect }},
{%- endif %}
{%- if b.options.strict %}
      strict={{ b.options.strict }},
{%- endif %}
{%- if b.options.vertical %}
      vertical={{ b.options.vertical }},
{%- endif %}
      Tpoint={{ "{" }}{{ b.options.Tpoint or "," }}{{ "}" }},
      borderwidth=0pt,backgroundcol=lightgray,scoreexact=1
    }
{%- endfor %}
{%- if display and display.label and display.labelPosition == "right" %}
    {{ display.label | safe }}
{%- endif %}
{%- if display and display.align %}
    \\end{ {{- display.align -}} }
{%- endif %}
  \\end{questionmultx}
{% if multicols %}\\end{multicols}
{% endif %}
}`

export const qcmTemplate = `\\element{ {{- ref -}} }{
{% if multicols %}\\begin{multicols}{2}
{% endif %}
  \\begin{ {{- "questionmult" if mode == "mult" else "question" -}} }{ {{- id -}} }\\AMClabel{ {{- id -}} }
    {{ enonce | safe }}
    {% if correction %}\\explain{ {{- correction | safe -}} }{% endif %}
    \\begin{ {{- layout -}} }{% if ordered %}[o]{% endif %}
{%- for p in propositions %}
      {% if lastChoice is defined and lastChoice is not none and loop.index0 == lastChoice %}\\lastchoices{% endif %}{% if p.correct %}\\bonne{ {{- p.texte | safe -}} }{% else %}\\mauvaise{ {{- p.texte | safe -}} }{% endif %}
{%- endfor %}
    \\end{ {{- layout -}} }
  \\end{ {{- "questionmult" if mode == "mult" else "question" -}} }
{% if multicols %}\\end{multicols}
{% endif %}
}`

export const AMCIntervalsTemplate = `\\element{ {{- ref -}} }{
  \\begin{question}{ {{- id -}} }\\AMClabel{ {{- id -}} }
    {{ enonce }}
    {% if correction %}\\explain{ {{- correction | safe -}} }{% endif %}
    \\begin{reponseshoriz}[o]
      \\AMCIntervals{ {{- interval.correct -}} }{ {{- interval.left -}} }{ {{- interval.right -}} }{ {{- interval.step -}} }
    \\end{reponseshoriz}
  \\end{question}
}`

export const AMCHybrideContainerTemplate = `\\element{ {{- ref -}} }{
{%- if multicolsAll %}
  \\setlength{\\columnseprule}{ {{ "0.5" if barreseparation else "0" }}pt}\\begin{multicols}{2}
{%- endif %}
{%- if numerotationEnonce %}
  \\begin{question}{ {{- enonceId -}} } \\QuestionIndicative
{%- endif %}
{%- if enonceAGauche %}
  \\noindent\\fbox{\\begin{minipage}{ {{ enonceAGaucheLeft }}\\linewidth}
  {{ enonce | safe }}
{%- endif %}
{%- if enonceCentre %}\\begin{center}{{ enonce | safe }}\\end{center}{%- endif %}
{%- if enonceAGauche %}
  \\end{minipage}}\\noindent\\begin{minipage}[t]{ {{ enonceAGaucheRight }}\\linewidth }
{%- endif %}
{%- if not enonceAGauche and not enonceCentre %}{{ enonce | safe }}{%- endif %}
{%- if numerotationEnonce %}\\end{question}{%- endif %}
{%- if multicols %}
  \\setlength{\\columnseprule}{ {{ "0.5" if barreseparation else "0" }}pt}\\begin{multicols}{2}
{%- endif %}
{{ content | safe }}
{%- if closeMulticols %}
  \\end{multicols}
{%- endif %}
{%- if enonceAGauche %}
  \\end{minipage}
{%- endif %}
}`

export const AMCHybrideQcmTemplate = `{% if disableNumber %}\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse{% endif %}
\\begin{ {{- "question" if mode == "mono" else "questionmult" -}} }{ {{- id -}} }\\AMClabel{ {{- id -}} }
{%- if enonceCentre %}\\begin{center}{%- endif %}{{ enonce | safe }}{%- if enonceCentre %}\\end{center}{%- endif %}
{% endif %}
\\begin{ {{- layout -}} }{% if ordered %}[o]{% endif %}
{% for p in propositions %}
{% if lastChoice is not none and loop.index0 == lastChoice %}\\lastchoices
{% endif %}{% if p.statut %}\\bonne{ {{- p.texte | safe -}} }
{% else %}\\mauvaise{ {{- p.texte | safe -}} }
{% endif %}
{% endfor %}
\\end{ {{- layout -}} }
\\end{ {{- "question" if mode == "mono" else "questionmult" -}} }
`

export const AMCHybrideOpenTemplate = `{% if multicolsBegin %}\\setlength{\\columnseprule}{ {{ "0.5" if barreseparation else "0" }}0pt}\\begin{multicols}{2}
{% endif %}
{% if disableNumber %}\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse {% endif %}\\begin{question}{ {{- id -}} }{% if not disableNumber %}\\AMClabel{ {{- id -}} }{% endif %}{% if questionIndicative %}\\QuestionIndicative{% endif %}
{% if enonce %}{{ enonce | safe }}
{% endif %}\\explain{ {{- correction | safe -}} }
\\notation{ {{- notation -}} }[{{ sanscadre }}][{{ pointilles }}]
\\end{question}
{% if multicolsEnd %}\\end{multicols}
{% endif %}`

export const AMCHybrideNumPowerTemplate = `{% if enonceApresNumQuestion %}\\begin{questionmultx}{ {{- enonceId -}} }\\AMClabel{ {{- enonceId -}} }
{{ enonce | safe }}
\\end{questionmultx}{% endif %}
\\begin{multicols}{2}
{% if disableNumber %}\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse{% endif %}\\begin{questionmultx}{ {{- id -}} }\\AMClabel{ {{- id -}} }
{% if explain %}\\explain{ {{- explain | safe -}} }{% endif %}
{{ texte | safe }}
\\vspace{0.25cm}
Base
\\AMCnumericChoices{ {{ baseValue }} }{digits={{ digitsBase }},decimals=0,sign={{ baseSign }},approx=0,borderwidth=0pt,backgroundcol=lightgray,scoreapprox={{ scoreapprox }},scoreexact=1,Tpoint=,}
\\end{questionmultx}
\\AMCquestionNumberfalse\\def\\AMCbeginQuestion#1#2{}
\\begin{questionmultx}{ {{- exponentId -}} }\\AMClabel{ {{- exponentId -}} }
\\vspace{18pt}
Exposant
\\AMCnumericChoices{ {{ exponentValue }} }{digits={{ digitsExponent }},decimals=0,sign=true,approx=0,borderwidth=0pt,backgroundcol=lightgray,scoreapprox={{ scoreapprox }},scoreexact=1,Tpoint=,}
\\end{questionmultx}
\\end{multicols}
`

export const AMCHybrideNumFractionTemplate = `{% if enonceApresNumQuestion %}\\begin{questionmultx}{ {{- enonceId -}} }\\AMClabel{ {{- enonceId -}} }
{{ enonce | safe }}
\\end{questionmultx}{% endif %}
{% if disableNumber %}\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse{% endif %}\\begin{questionmultx}{ {{- id -}} }\\AMClabel{ {{- id -}} }
{% if alignement %}\\begin{ {{- alignement -}} }{% endif %}
{% if showEnonce %}{{ enonce | safe }}
{% endif %}
{% if explain %}\\explain{ {{- explain | safe -}} }{% endif %}
{{ texte | safe }}
\\AMCnumericChoices{ {{ value }} }{digits={{ digits }},decimals={{ decimals }},sign={{ sign }},approx=0,borderwidth=0pt,backgroundcol=lightgray,scoreexact=1,Tpoint={\\vspace{0.5cm} \\vrule height 0.4pt width 5.5cm },alsocorrect={{ alsoCorrect }}}
{% if alignement %}\\end{ {{- alignement -}} }{% endif %}
\\end{questionmultx}
`

export const AMCHybrideNumDecimalTemplate = `{% if enonceApresNumQuestion %}\\begin{questionmultx}{ {{- enonceId -}} }\\AMClabel{ {{- enonceId -}} }
{{ enonce | safe }}
\\end{questionmultx}{% endif %}
{% if multicolsBegin %}\\setlength{\\columnseprule}{ {{ "0.5" if barreseparation else "0" }}pt}\\begin{multicols}{2}
{% endif %}
{% if disableNumber %}\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse{% endif %}
\\begin{questionmultx}{ {{- id -}} }\\AMClabel{ {{- id -}} }
{% if explain %}\\explain{ {{- explain | safe -}} }{% endif %}
{{ texte | safe }}
{% if alignement %}\\begin{ {{- alignement -}} }{% endif %}
\\AMCnumericChoices{ {{ value }} }{digits={{ digits }},decimals={{ decimals }},sign={{ sign }},{% if exponent is not none %}exponent={{ exponent }},exposign={{ exposign }},{% endif %}{% if approx %}approx={{ approx }},{% endif %}{% if vertical %}vertical={{ vertical }},{% endif %}{% if strict %}strict={{ strict }},{% endif %}{% if vhead %}vhead={{ vhead }},{% endif %}{% if alsoCorrect %}alsocorrect={{ alsoCorrect }},{% endif %}Tpoint={{ "{" }}{{ tpoint }}{{ "}" }},borderwidth=0pt,backgroundcol=lightgray,scoreexact=1}
{% if alignement %}\\end{ {{- alignement -}} }{% endif %}
\\end{questionmultx}
{% if multicolsEnd %}\\end{multicols}
{% endif %}
`

export function renderTemplate(
  template: string,
  data: Record<string, unknown>,
) {
  return nunjucks
    .renderString(template, data)
    .replace(
      /\\(explain|notation|bonne|mauvaise|AMCnumericChoices)\{\s*([^{}]*?)\s*\}/g,
      '\\$1{$2}',
    )
    .replace(/\\element\{\s*([^}]+?)\s*\}\s*\{/g, '\\element{$1}{')
    .replace(
      /\\begin\{\s*([^}]+?)\s*\}\s*\{\s*([^}]+?)\s*\}/g,
      '\\begin{$1}{$2}',
    )
    .replace(/\\begin\{\s*([^}]+?)\s*\}/g, '\\begin{$1}')
    .replace(/\\end\{\s*([^}]+?)\s*\}/g, '\\end{$1}')
}
