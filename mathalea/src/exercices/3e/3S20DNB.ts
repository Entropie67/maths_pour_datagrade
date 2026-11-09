import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import {
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'

export const uuid = 'd11ae'
export const refs = {
  'fr-fr': ['3S20DNB', '3Z1DNB-15', 'BP2FLUC9', 'BP1AUTO009'],
  'fr-ch': [],
}
export const titre = 'Calculer des probabilités (exercice de brevet)'
export const dateDePublication = '27/11/2024'

const listeNumeros = [
  26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8,
  30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32, 0,
]
function latexRoulette(listeNumeros: number[]) {
  return `
  \\tikzset{%
    number/.code={%
        \\tikzset{every number/.try=#1}%
        \\ifodd#1\\relax
          \\tikzset{every odd number/.try=#1}%
        \\else
          \\tikzset{every even number/.try=#1}%
        \\fi%
        \\tikzset{execute for this number/.try=#1, number #1/.try=#1}%
      },
    execute for this number/.code={}
  }
  \\begin{tikzpicture}[rotate=90]
    \\pgfmathsetmacro{\\Ra}{2.3}
    \\pgfmathsetmacro{\\Rb}{\\Ra+0.6}
    \\pgfmathsetmacro{\\Rc}{\\Rb+0.6}
    \\pgfmathsetmacro{\\Rd}{\\Rc+0.3}
    \\draw[black!70,line width=3mm] (0,0) circle (\\Rd);
    \\draw[thick] (0,0) circle (\\Rc);
    \\draw[thick] (0,0) circle (\\Rb);
    \\draw[thick] (0,0) circle (\\Ra);
    \\pgfmathsetmacro{\\angle}{360/37}
    
    \\begin{scope}[%
      every odd number/.style={opacity=1},
      every even number/.style={opacity=0}]
      \\foreach \\i in {0,...,36} {
          \\fill[black!70,number=\\i] (\\i*\\angle:\\Ra) -- (\\i*\\angle:\\Rc) arc[start angle={\\i*\\angle},delta angle=\\angle,radius=\\Rc]-- ({(\\i+1)*\\angle}:\\Ra) arc[start angle={(\\i+1)*\\angle},delta angle=-\\angle,radius=\\Ra];
          \\draw[thick] (\\i*\\angle:\\Ra) -- (\\i*\\angle:\\Rc);
        }
    \\end{scope}
    
    \\begin{scope}[%
      every odd number/.style={text=white},
      every even number/.style={text=black!70}]
      \\foreach \\number [count=\\i] in {${listeNumeros.join(',')}} {
        \\ifnum\\i=37
    \\node[rotate={\\i*\\angle+\\angle/2},text=black!70] at ({\\i*\\angle+\\angle/2}:{(\\Rb+\\Rc)/2}) {\\sffamily\\bfseries\\number};
  \\else
    \\node[number=\\i, rotate={\\i*\\angle+\\angle/2}] at ({\\i*\\angle+\\angle/2}:{(\\Rb+\\Rc)/2}) {\\sffamily\\bfseries\\number};
  \\fi
  }
    \\end{scope}
    \\fill[black!70] ({\\angle/2}:{(\\Rb+\\Ra)/2}) circle (1.5mm);
  \\end{tikzpicture}`
}
function rouletteSVG(numeros: number[]): string {
  const svgNamespace = 'http://www.w3.org/2000/svg'
  const svg = window.document.createElementNS(svgNamespace, 'svg')
  svg.setAttribute('xmlns', svgNamespace)
  svg.setAttribute('width', '480')
  svg.setAttribute('height', '480')
  svg.setAttribute('viewBox', '0 0 480 480')

  const addCircle = ({
    radius,
    fill,
    stroke = 'black',
    strokeWidth = 1,
  }: {
    radius: number
    fill: string
    stroke?: string
    strokeWidth?: number
  }) => {
    const circle = window.document.createElementNS(svgNamespace, 'circle')
    circle.setAttribute('cx', '240')
    circle.setAttribute('cy', '240')
    circle.setAttribute('r', String(radius))
    circle.setAttribute('fill', fill)
    circle.setAttribute('stroke', stroke)
    circle.setAttribute('stroke-width', String(strokeWidth))
    svg.append(circle)
  }

  const addPath = (pathData: string, fill: string) => {
    const path = window.document.createElementNS(svgNamespace, 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', fill)
    svg.append(path)
  }

  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    const line = window.document.createElementNS(svgNamespace, 'line')
    line.setAttribute('x1', String(x1))
    line.setAttribute('y1', String(y1))
    line.setAttribute('x2', String(x2))
    line.setAttribute('y2', String(y2))
    line.setAttribute('stroke', 'black')
    line.setAttribute('stroke-width', '1')
    svg.append(line)
  }

  const addText = ({
    text,
    x,
    y,
    fill,
    rotation,
  }: {
    text: string
    x: number
    y: number
    fill: string
    rotation: number
  }) => {
    const textElement = window.document.createElementNS(svgNamespace, 'text')
    textElement.textContent = text
    textElement.setAttribute('x', String(x))
    textElement.setAttribute('y', String(y))
    textElement.setAttribute('fill', fill)
    textElement.setAttribute('font-size', '20')
    textElement.setAttribute('text-anchor', 'middle')
    textElement.setAttribute('dominant-baseline', 'middle')
    textElement.setAttribute('transform', `rotate(${rotation} ${x} ${y})`)
    svg.append(textElement)
  }

  const outerRadius = 240
  const innerRadius = outerRadius / 2
  const secondRadius = (17 / 24) * outerRadius
  const thirdRadius = (22 / 24) * outerRadius
  const fourthRadius = (23 / 24) * outerRadius

  addCircle({ radius: outerRadius, fill: 'black' })
  addCircle({ radius: fourthRadius, fill: 'white' })
  addCircle({ radius: thirdRadius, fill: 'white' })
  addCircle({ radius: innerRadius, fill: 'white' })

  // Créer les secteurs
  const numSectors = 37
  const angleStep = 360 / numSectors

  for (let i = 0; i < numSectors; i++) {
    const startAngle = i * angleStep
    const endAngle = startAngle + angleStep
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    const x1 = 240 + innerRadius * Math.cos((startAngle - 90) * (Math.PI / 180))
    const y1 = 240 + innerRadius * Math.sin((startAngle - 90) * (Math.PI / 180))
    const x2 = 240 + innerRadius * Math.cos((endAngle - 90) * (Math.PI / 180))
    const y2 = 240 + innerRadius * Math.sin((endAngle - 90) * (Math.PI / 180))

    const x3 = 240 + thirdRadius * Math.cos((startAngle - 90) * (Math.PI / 180))
    const y3 = 240 + thirdRadius * Math.sin((startAngle - 90) * (Math.PI / 180))
    const x4 = 240 + thirdRadius * Math.cos((endAngle - 90) * (Math.PI / 180))
    const y4 = 240 + thirdRadius * Math.sin((endAngle - 90) * (Math.PI / 180))

    const pathData = [
      'M 240 240',
      `L ${x1} ${y1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x4} ${y4}`,
      `A ${thirdRadius} ${thirdRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
      'Z',
    ].join(' ')

    addPath(pathData, i % 2 === 1 ? 'black' : 'white')
    addLine(x1, y1, x3, y3)

    const angle = i * angleStep + angleStep / 2
    const rotation = angle
    const x =
      240 +
      (secondRadius + (thirdRadius - secondRadius) / 2) *
        Math.cos((angle - 90) * (Math.PI / 180))
    const y =
      240 +
      (secondRadius + (thirdRadius - secondRadius) / 2) *
        Math.sin((angle - 90) * (Math.PI / 180))
    addText({
      text: `${numeros[i]}`,
      x,
      y,
      fill: i % 2 === 1 ? 'white' : 'black',
      rotation,
    })
  }

  addCircle({ radius: secondRadius, fill: 'none' })
  return svg.outerHTML
}

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé (à partir des sources Latex de l'APMEP)
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3S2DNB0 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.versionAleatoire(0)
    this.introduction = texteItalique(
      "D'après l'exercice $1$ du brevet Métropole 2024.",
    )
  }

  private appliquerLesValeurs(
    num1: number,
    parite: boolean,
    couleur: string,
    num2: number,
    listeNumeros: number[],
  ): void {
    const codeFigure = context.isHtml
      ? rouletteSVG(listeNumeros)
      : latexRoulette(listeNumeros)
    const compteLesCases = (parite: boolean, couleur: string) => {
      let compte = 0
      for (let i = 0; i < 37; i++) {
        const numero = listeNumeros[i]
        if (numero % 2 === 0 && parite) {
          if (
            (i % 2 === 0 && couleur === 'blanche') ||
            (i % 2 === 1 && couleur === 'noire')
          ) {
            compte++
          }
        } else if (numero % 2 === 1 && !parite) {
          if (
            (i % 2 === 0 && couleur === 'blanche') ||
            (i % 2 === 1 && couleur === 'noire')
          ) {
            compte++
          }
        }
      }
      return compte
    }

    const enonce = `Au casino, la roulette est un jeu de hasard pour lequel chaque joueur mise au choix sur un ou plusieurs numéros.<br> On lance une bille sur une roue qui tourne, numérotée de $0$ à $36$.<br>
La bille a la même probabilité de s'arrêter sur chaque numéro.<br><br>
${codeFigure}
${createList({
  items: [
    `Expliquer pourquoi la probabilité que la bille s'arrête sur le numéro $${num1}$ est $\\dfrac{1}{37}$.`,
    `Déterminer la probabilité que la bille s'arrête sur une case à la fois ${couleur} et ${parite ? 'paire' : 'impaire'}.`,
    `${sp(1)}${createList({
      items: [
        `Déterminer la probabilité que la bille s'arrête sur un numéro inférieur ou égal à $${num2}$.`,
        `En déduire la probabilité que la bille s'arrête sur un numéro supérieur ou égal à $${num2 + 1}$.`,
        `Un joueur affirme qu'on a plus de $3$ chances sur $4$ d'obtenir un numéro supérieur ou égal à $${num2 + 1}$. A-t-il raison${sp()}?`,
      ],
      style: 'alpha',
    })}`,
  ],
  style: 'nombres',
})}`
    const correction = createList({
      items: [
        `La probabilité que la bille s'arrête sur le numéro $${num1}$ est $\\dfrac{1}{37}$ car il y a $37$ numéros.`,
        `La probabilité que la bille s'arrête sur une case à la fois ${couleur} et ${parite ? 'paire' : 'impaire'} est $\\dfrac{${compteLesCases(parite, couleur)}}{37}$.`,
        createList({
          items: [
            `La probabilité que la bille s'arrête sur un numéro inférieur ou égal à $${num2}$ est $\\dfrac{${num2 + 1}}{37}$.`,
            `La probabilité que la bille s'arrête sur un numéro supérieur ou égal à $${num2 + 1}$ est $\\dfrac{37 - ${num2 + 1}}{37} = \\dfrac{${37 - (num2 + 1)}}{37}$.`,
            `Comparons cette probabilité avec $\\dfrac{3}{4}$${sp()}:<br>
        $\\dfrac{${37 - (num2 + 1)}}{37} ${egalOuApprox((37 - (num2 + 1)) / 37, 3)} ${texNombre((37 - (num2 + 1)) / 37, 3)}$ et $\\dfrac{3}{4} = ${texNombre(0.75, 2)}$<br>
        Comme $${texNombre((37 - (num2 + 1)) / 37, 3)} ${(37 - (num2 + 1)) / 37 > 0.75 ? '>' : '<'} ${texNombre(0.75, 2)}$, ${texteEnCouleurEtGras(`le joueur ${(37 - (num2 + 1)) / 37 > 0.75 ? 'a' : "n'a pas"} raison`)}.`,
          ],
          style: 'alpha',
        }),
      ],
      style: 'nombres',
    })
    this.enonce = `${enonce}`
    this.correction = `${correction}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7, true, 'noire', 6, listeNumeros)
  }

  versionAleatoire: (i: number) => void = () => {
    const listeNum = listeNumeros.slice()
    let k = 0
    for (; k < 34;) {
      if (k % 2 === 0) {
        const zap = listeNum[k]
        const k2 = randint(k / 2, 18) * 2
        listeNum[k] = listeNum[k2]
        listeNum[k2] = zap
      } else {
        const zap = listeNum[k]
        const k2 = randint((k + 1) / 2, 18) * 2 - 1
        listeNum[k] = listeNum[k2]
        listeNum[k2] = zap
      }
      k += randint(1, 4)
    }
    const num1 = randint(0, 36)
    const num2 = randint(5, 30)
    const parite = choice([true, false])
    const couleur = choice(['noire', 'blanche'])
    this.appliquerLesValeurs(num1, parite, couleur, num2, listeNum)
  }
}
