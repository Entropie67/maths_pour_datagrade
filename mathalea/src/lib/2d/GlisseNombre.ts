import { apparitionAnimee, translationAnimee } from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { TexteParPoint, texteParPosition } from './textes'
import { vecteur } from './Vecteur'
export class GlisseNombre extends ObjetMathalea2D {
  constructor(nombre = 0, decalage = 0) {
    super()
    this.objets = []
    this.bordures = [3, -5, 28, 5]
    const chiffresADecaler = []
    const largeurColonne = 2
    const hauteurLigne = 1.5
    const hauteurPremiereLigne = 7.5
    const nbLignes = 3
    const nbColonnes = 12
    const A = pointAbstrait(3, 5.5)
    for (let i = 0; i < nbColonnes + 1; i++) {
      const trait = segment(
        pointAbstrait(A.x + i * largeurColonne, A.y),
        pointAbstrait(
          A.x + i * largeurColonne,
          A.y - (nbLignes - 1) * hauteurLigne - hauteurPremiereLigne,
        ),
      )
      this.objets.push(trait)
    }
    const traitDuHaut = segment(
      A,
      pointAbstrait(A.x + nbColonnes * largeurColonne, A.y),
    )
    this.objets.push(traitDuHaut)
    for (let i = 1; i < nbLignes + 1; i++) {
      const trait = segment(
        pointAbstrait(A.x, A.y - (i - 1) * hauteurLigne - hauteurPremiereLigne),
        pointAbstrait(
          A.x + nbColonnes * largeurColonne,
          A.y - (i - 1) * hauteurLigne - hauteurPremiereLigne,
        ),
      )
      this.objets.push(trait)
    }
    const placeDansTableau: (
      texte: string,
      colonne: number,
      ligne: number,
      vertical?: boolean,
      couleur?: string,
    ) => TexteParPoint = (
      texte,
      colonne,
      ligne,
      vertical = false,
      couleur = 'black',
    ) => {
      let textePlaceDansTableau
      if (vertical) {
        textePlaceDansTableau = texteParPosition(
          texte,
          A.x + (colonne + 0.5) * largeurColonne,
          A.y - 0.9 * hauteurPremiereLigne,
          -90,
          couleur,
          1,
          'gauche',
        ) as TexteParPoint
      } else {
        textePlaceDansTableau = texteParPosition(
          texte,
          A.x + (colonne + 0.5) * largeurColonne,
          A.y - (ligne - 0.5) * hauteurLigne - hauteurPremiereLigne,
          0,
          couleur,
        ) as TexteParPoint
      }
      return textePlaceDansTableau
    }
    const labels = [
      'Millions',
      'Centaines de milliers',
      'Dizaines de milliers',
      'Milliers',
      'Centaines',
      'Dizaines',
      'Unités',
      'Dixièmes',
      'Centièmes',
      'Millièmes',
      'Dix-millièmes',
      'Cent-Millièmes',
    ]
    for (let i = 0; i < nbColonnes; i++) {
      const couleur = i === 6 || i === 6 - decalage ? '#f15929' : 'black'
      const textePlaceDansTableau = placeDansTableau(
        labels[i],
        i,
        0,
        true,
        couleur,
      )
      if (i === 6 || i === 6 - decalage) textePlaceDansTableau.gras = true
      this.objets.push(textePlaceDansTableau)
    }
    const nombreString = nombre.toString()
    const partieEntiere = nombreString.split('.')[0]
    const partieDecimale = nombreString.split('.')[1]
    const chiffreDesUnites = placeDansTableau(
      partieEntiere[partieEntiere.length - 1],
      6,
      1,
      false,
      '#f15929',
    )
    const chiffreDesUnites2 = placeDansTableau(
      partieEntiere[partieEntiere.length - 1],
      6,
      2,
      false,
      '#f15929',
    )
    chiffreDesUnites.gras = true
    chiffreDesUnites2.gras = true
    this.objets.push(chiffreDesUnites)
    chiffresADecaler.push(chiffreDesUnites2)
    for (let i = 1; i < partieEntiere.length; i++) {
      const chiffre = placeDansTableau(
        partieEntiere[partieEntiere.length - 1 - i],
        6 - i,
        1,
      )
      const chiffre2 = placeDansTableau(
        partieEntiere[partieEntiere.length - 1 - i],
        6 - i,
        2,
      )
      this.objets.push(chiffre)
      chiffresADecaler.push(chiffre2)
    }
    if (partieDecimale) {
      for (let i = 0; i < partieDecimale.length; i++) {
        const chiffre = placeDansTableau(partieDecimale[i], 7 + i, 1)
        const chiffre2 = placeDansTableau(partieDecimale[i], 7 + i, 2)
        this.objets.push(chiffre)
        chiffresADecaler.push(chiffre2)
      }
      const texte1 = texteParPosition(
        ',',
        A.x + 6.9 * largeurColonne,
        A.y - 0.3 * hauteurLigne - hauteurPremiereLigne,
        0,
        '#f15929',
        3,
      ) as TexteParPoint
      const texte2 = texteParPosition(
        ',',
        A.x + 6.9 * largeurColonne,
        A.y - 1.3 * hauteurLigne - hauteurPremiereLigne,
        0,
        '#f15929',
        3,
      ) as TexteParPoint
      texte1.gras = true
      texte2.gras = true
      this.objets.push(texte1)
      this.objets.push(texte2)
    } else if (decalage < 0) {
      // pas de partie décimale mais une division alors virgule pour le 2e nombre
      if (context.isHtml) {
        const texte2 = texteParPosition(
          ',',
          A.x + 6.9 * largeurColonne,
          A.y - 1.3 * hauteurLigne - hauteurPremiereLigne,
          0,
          '#f15929',
          3,
        ) as TexteParPoint
        texte2.gras = true
        this.objets.push(apparitionAnimee([texte2], 6, 0.2))
      }
    }
    if (context.isHtml) {
      const chiffresQuiGlissent = translationAnimee(
        chiffresADecaler,
        vecteur(-decalage * largeurColonne, 0),
        'id="op" dur="1s" begin="0s;op.end+5s" fill="freeze"',
      )
      this.objets.push(chiffresQuiGlissent as ObjetMathalea2D)
    }
    const nombreDeZeroPartieEntiere = partieDecimale
      ? decalage - partieDecimale.length
      : decalage
    const nombreDeZeroPartieDecimale = -partieEntiere.length - decalage + 1
    const zerosAAjouter = []
    for (let i = 0; i < nombreDeZeroPartieEntiere; i++) {
      const zero = placeDansTableau('0', 6 - i, 2, false, '#32CD32') // Lime Green
      zero.gras = true
      zerosAAjouter.push(zero)
    }
    for (let i = 0; i < nombreDeZeroPartieDecimale; i++) {
      const zero = placeDansTableau('0', 6 + i, 2, false, '#32CD32')
      zero.gras = true
      zerosAAjouter.push(zero)
    }
    if (context.isHtml)
      this.objets.push(apparitionAnimee(zerosAAjouter, 6, 0.2))
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    code = `<g id="${this.id}">${code}</g>`
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikz === 'function') code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

export function glisseNombre(nombre = 0, decalage = 0) {
  return new GlisseNombre(nombre, decalage)
}
