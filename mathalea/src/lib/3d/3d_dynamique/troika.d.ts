declare module 'troika-three-text' {
  import { Mesh } from 'three'
  export class Text extends Mesh {
    text: string
    color?: string | number
    fontSize?: number
    font?: string
    anchorX?: string | number
    anchorY?: string | number
    maxWidth?: number
    lineHeight?: number
    letterSpacing?: number
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    overflowWrap?: boolean
    clipRect?: [number, number, number, number]
    sdfGlyphSize?: number
    curveRadius?: number
    material?: any;
    [key: string]: any
  }
}
