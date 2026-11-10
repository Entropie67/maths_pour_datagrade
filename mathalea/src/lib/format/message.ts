import { context } from '../../modules/context'

/**
 * @returns un encart sur fond d'alert semantic ui en HTML ou dans un cadre bclogo en LaTeX avec le texte + icone info
 * @param {object}
 * @author Sébastien Lozano
 */

export function infoMessage({
  titre,
  texte,
  couleur = 'black',
}: {
  titre: string
  texte: string
  couleur?: string
}) {
  // ;
  const timeStamp = Date.now()
  if (context.isHtml) {
    return `
      <div id="infoMessage-${timeStamp}">
        <div id="title-infoMessage-${timeStamp}">
        ${titre}
        </div>
        ${texte}
      </div>
      `
  } else {
    return (
      `
    \\begin{bclogo}[couleurBarre=` +
      couleur +
      ',couleurBord=' +
      couleur +
      ',epBord=2,couleur=gray!10,logo=\\bcinfo,arrondi=0.1]{\\bf ' +
      titre +
      `}
      ` +
      texte +
      `
    \\end{bclogo}
    `
    )
  }
}

/**
 * @returns un encart sur fond d'alert semantic ui en HTML ou dans un cadre bclogo en LaTeX avec le texte + icone lampe
 * @param {object}
 * @author Sébastien Lozano
 */

export function lampeMessage({
  titre,
  texte,
  couleur = 'black',
}: {
  titre: string
  texte: string
  couleur?: string
}) {
  const timeStamp = Date.now()
  if (context.isHtml) {
    return `
      <div id="lampeMessage-${timeStamp}">
        <div id="title-lampeMessage-${timeStamp}">
        ${titre}
        </div>
        ${texte}
      </div>
      `
  } else if (context.isAmc) {
    return `
    {\\bf ${titre}} : ${texte}
    `
  } else {
    return (
      `
    \\begin{bclogo}[couleurBarre=` +
      couleur +
      ',couleurBord=' +
      couleur +
      ',epBord=2,couleur=gray!10,logo=\\bclampe,arrondi=0.1]{\\bf ' +
      titre +
      `}
      ` +
      texte +
      `
    \\end{bclogo}
    `
    )
  }
}
