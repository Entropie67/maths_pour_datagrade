import { Shape2D } from '../Figures2D'
import { ObjetMathalea2D } from '../ObjetMathalea2D'
import { emojisSvgData } from './emojisSvgData'
// import { emojisSvgData } from './emojisSvgData'

export class Emoji extends Shape2D {
  static readonly type = 'emojis'
  constructor({
    codeSvg,
    codeTikz,
    shapeDef,
    name,
    unicode,
    width = 1,
    height = 1,
  }: {
    codeSvg: string
    codeTikz: string
    shapeDef: ObjetMathalea2D
    name: string
    unicode: string
    width?: number
    height?: number
  }) {
    super({ codeSvg, codeTikz, width, height })
    this.name = name
    this.unicode = unicode
    this.width = width
    this.height = height
    this.shapeDef = shapeDef
  }

  get unicodeValue(): string {
    return this.unicode
  }
}

export function emoji(
  name: string,
  unicode: string,
  width: number = 1,
  height: number = 1,
): Emoji {
  if (!name || !unicode) {
    throw new Error('Emoji name and unicode must be provided')
  }
  const codeTikz = `\\pic at (0,0) {${name}};`
  const codeSvg = `<use href="#${name}"></use>`
  const shapeDef = new ObjetMathalea2D()
  shapeDef.bordures = [-0.5, -0.5, 0.5, 0.5]
  shapeDef.svg = function (coeff: number): string {
    return `<defs>
    <g id=${name} transform="translate(-9,-9) scale(0.5)">${emojisSvgData[unicode] || `<text x="0" y="0" font-size="${coeff}" text-anchor="middle" dominant-baseline="central">${name}</text>`}</g>
    </defs>`
  }
  shapeDef.tikz = function (): string {
    return `
  \\tikzset{
   ${name}/.pic = {
    \\node[anchor=center, inner sep=0pt, scale=3] {\\twemoji{${unicode}}};
   }
  }`.trim()
  }

  return new Emoji({
    codeSvg,
    codeTikz,
    shapeDef,
    name,
    unicode,
    width,
    height,
  })
}
