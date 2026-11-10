import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { IPolygone } from '../../lib/2d/Interfaces'
import {
  addSvgSelection,
  type SvgWithValue,
} from '../../lib/customElements/SvgSelectionElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Représenter une fraction avec une plaque de chocolat'
export const interactifReady = true
export const dateDePublication = '10/02/2026'
export const uuid = '1574a'
export const refs = {
  'fr-fr': ['CM2N2A-4'],
  'fr-ch': ['9R1NO4A-1', '9R2NO4A-1', '9R3NO4A-1', 'PRQNO10A-4'],
}
/**
 *
 * @author Jean-claude Lhote
 */
const carre = function (
  x: number,
  y: number,
  color: string,
  colorBackground: string,
) {
  const tile = new BoiteBuilder({
    xMin: x,
    yMin: y,
    xMax: x + 1.5,
    yMax: y + 1.5,
  })
    .addColor({
      color,
      colorBackground,
      opacity: 1,
      backgroudOpacity: 1,
    })
    .render() as IPolygone
  tile.epaisseur = 2
  return tile
}
const plaque12 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 3; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque16 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque20 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 4; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque24 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 4; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque30 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 5; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque36 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 6; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const plaque60 = function (
  color: string,
  colorBackground: string,
): NestedObjetMathalea2dArray {
  const result: NestedObjetMathalea2dArray = []
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 6; y++) {
      result.push(carre(x * 1.55, y * 1.55, color, colorBackground))
    }
  }
  return result
}

const fractionsPourPlaque12 = [
  fraction(1, 2),
  fraction(1, 3),
  fraction(2, 3),
  fraction(1, 4),
  fraction(2, 4),
  fraction(3, 4),
  fraction(1, 6),
  fraction(2, 6),
  fraction(3, 6),
  fraction(4, 6),
  fraction(5, 6),
  fraction(1, 12),
  fraction(2, 12),
  fraction(3, 12),
  fraction(4, 12),
  fraction(5, 12),
  fraction(6, 12),
  fraction(7, 12),
]
const fractionsPourPlaque20 = fractionsPourPlaque12.filter(
  (f) => f.den !== 12 && f.den !== 6 && f.den !== 3,
)
for (let i = 1; i < 3; i++) {
  fractionsPourPlaque20.push(fraction(i, 5))
}
for (let i = 1; i < 5; i++) {
  fractionsPourPlaque20.push(fraction(i, 10))
}
for (let i = 1; i < 8; i++) {
  fractionsPourPlaque20.push(fraction(i, 20))
}

const fractionsPourPlaque16 = fractionsPourPlaque20.filter(
  (f) => f.den !== 20 && f.den !== 10 && f.den !== 5,
)
for (let i = 1; i < 5; i++) {
  fractionsPourPlaque16.push(fraction(i, 8))
}
for (let i = 1; i < 8; i++) {
  fractionsPourPlaque16.push(fraction(i, 16))
}

const fractionsPourPlaque25: FractionEtendue[] = []
for (let i = 1; i < 10; i++) {
  fractionsPourPlaque25.push(fraction(i, 25))
}
for (let i = 1; i < 4; i++) {
  fractionsPourPlaque25.push(fraction(i, 5))
}
const fractionsPourPlaque24 = fractionsPourPlaque12.map((f: FractionEtendue) =>
  fraction(f.num, f.den),
)
for (let i = 1; i < 4; i++) {
  fractionsPourPlaque24.push(fraction(i, 8))
}
for (let i = 1; i < 10; i++) {
  fractionsPourPlaque24.push(fraction(i, 24))
}
const fractionsPourPlaque30 = fractionsPourPlaque12.filter((f) => f.den !== 12)
for (let i = 1; i < 3; i++) {
  fractionsPourPlaque30.push(fraction(i, 5))
}
for (let i = 1; i < 5; i++) {
  fractionsPourPlaque30.push(fraction(i, 10))
}
for (let i = 1; i < 6; i++) {
  fractionsPourPlaque30.push(fraction(i, 15))
}
for (let i = 1; i < 13; i++) {
  fractionsPourPlaque30.push(fraction(i, 30))
}

const fractionsPourPlaque36 = fractionsPourPlaque12.map((f: FractionEtendue) =>
  fraction(f.num, f.den),
)
for (let i = 1; i < 4; i++) {
  fractionsPourPlaque36.push(fraction(i, 9))
}
for (let i = 1; i < 7; i++) {
  fractionsPourPlaque36.push(fraction(i, 18))
}
for (let i = 1; i < 14; i++) {
  fractionsPourPlaque36.push(fraction(i, 36))
}
const fractionsPourPlaque60 = fractionsPourPlaque30.map((f: FractionEtendue) =>
  fraction(f.num, f.den),
)
fractionsPourPlaque60.push(fraction(1, 4))
for (let i = 1; i < 15; i++) {
  fractionsPourPlaque60.push(fraction(i, 60))
}

const total = (n: number) => {
  switch (n) {
    case 1:
      return 12
    case 2:
      return 16
    case 3:
      return 20
    case 4:
      return 24
    case 5:
      return 25
    case 6:
      return 30
    case 7:
      return 36
    case 8:
      return 60
    default:
      return 12
  }
}

const gridFormat = (n: number) => {
  switch (n) {
    case 12:
      return [4, 3]
    case 16:
      return [4, 4]
    case 20:
      return [5, 4]
    case 24:
      return [6, 4]
    case 25:
      return [5, 5]
    case 30:
      return [6, 5]
    case 36:
      return [6, 6]
    case 60:
      return [10, 6]
    default:
      return [4, 3]
  }
}

export default class RepresenterUneFractionAvecUnePlaqueDeChocolat extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Divisibilité de l’unité',
      `Nombres séparés par des tirets\n1 : 12 carrés \n2 : 16 carrés\n 3 : 20 carrés\n4 : 24 carrés\n5 : 25 carrés\n6 : 30 carrés\n7 : 36 carrés\n8 : 60 carrés\n0 : Mélange`,
    ]
    this.besoinFormulaire3Numerique = [
      'Type de chocolat',
      2,
      '1 : chocolat au lait\n2 : chocolat blanc',
    ]
    this.sup = '1'
    this.sup3 = 2
    this.besoinFormulaire2CaseACocher = [
      'Uniquement le dénominateur maximum',
      true,
    ]
    this.sup2 = true
  }

  nouvelleVersion(): void {
    const color = this.sup3 === 1 ? '#8b6441' : '#d4B080'
    const colorBackground = this.sup3 === 1 ? '#a67c52' : '#e6c07b'

    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 0,
      nbQuestions: this.nbQuestions,
      defaut: 1,
    })
      .map(Number)
      .map((n: number) => total(n))

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let frac: FractionEtendue
      let factor: number
      let laPlaque: NestedObjetMathalea2dArray = []
      switch (typeDeQuestion[i]) {
        case 16:
          frac = choice(
            fractionsPourPlaque16.filter((f) =>
              this.sup2 ? f.den === 16 : true,
            ),
          )
          factor = 16 / frac.den
          laPlaque = [...plaque16(color, colorBackground)]
          break
        case 20:
          frac = choice(
            fractionsPourPlaque20.filter((f) =>
              this.sup2 ? f.den === 20 : true,
            ),
          )
          factor = 20 / frac.den
          laPlaque = [...plaque20(color, colorBackground)]
          break
        case 24:
          frac = choice(
            fractionsPourPlaque24.filter((f) =>
              this.sup2 ? f.den === 24 : true,
            ),
          )
          factor = 24 / frac.den
          laPlaque = [...plaque24(color, colorBackground)]
          break
        case 25:
          frac = choice(
            fractionsPourPlaque25.filter((f) =>
              this.sup2 ? f.den === 25 : true,
            ),
          )
          factor = 25 / frac.den
          laPlaque = [...plaque24(color, colorBackground)]
          break
        case 30:
          frac = choice(
            fractionsPourPlaque30.filter((f) =>
              this.sup2 ? f.den === 30 : true,
            ),
          )
          factor = 30 / frac.den
          laPlaque = [...plaque30(color, colorBackground)]
          break
        case 36:
          frac = choice(
            fractionsPourPlaque36.filter((f) =>
              this.sup2 ? f.den === 36 : true,
            ),
          )
          factor = 36 / frac.den
          laPlaque = [...plaque36(color, colorBackground)]
          break
        case 60:
          frac = choice(
            fractionsPourPlaque60.filter((f) =>
              this.sup2 ? f.den === 60 : true,
            ),
          )
          factor = 60 / frac.den
          laPlaque = [...plaque60(color, colorBackground)]
          break
        case 12:
        default:
          frac = choice(fractionsPourPlaque12)
          factor = 12 / frac.den
          laPlaque = [...plaque12(color, colorBackground)]
          break
      }
      texte += `${context.isHtml && this.interactif ? 'Sélectionner' : 'Hachurer'}$${frac.texFraction}$ de la plaque de chocolat :<br><br>`
      handleAnswers(this, i, { reponse: { value: frac.num * factor } })
      const [nbCol, nbRow] = gridFormat(typeDeQuestion[i])
      const plaqueForSelection: SvgWithValue[][] = []
      for (let y = 0; y < nbRow; y++) {
        const rawFigures: SvgWithValue[] = []
        for (let x = 0; x < nbCol; x++) {
          const tile = carre(0, 0, color, colorBackground)
          const image = mathalea2d(
            Object.assign(
              { pixelsParCm: 30 },
              fixeBordures([tile], { rxmin: 0, rxmax: 0, rymin: 0, rymax: 0 }),
            ),
            tile,
          )
          rawFigures.push({ svg: image, value: 1 })
        }
        plaqueForSelection.push(rawFigures)
      }
      if (context.isHtml && this.interactif) {
        texte += addSvgSelection(this, i, {
          svgs: plaqueForSelection,
          options: {
            gapX: '0px',
            gapY: '0px',
            itemPadding: '0px',
          },
        })
      } else {
        texte += mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.5 },
            fixeBordures(laPlaque, { rxmin: 0, rxmax: 0, rymin: 0, rymax: 0 }),
          ),
          ...laPlaque,
        )
      }

      if (this.questionJamaisPosee(i, frac.texFraction, factor)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(
          `Pour avoir $${frac.texFraction}$ de la plaque de chocolat, il faut prendre $${miseEnEvidence(String(frac.num * factor))}$ carrés sur les $${typeDeQuestion[i]}$ de la plaque.`,
        )
        i++
      }
      cpt++
    }
  }
}
