import { context } from '../../modules/context'
import { Plot } from './Plot'
import { pointAbstrait } from './PointAbstrait'
import { texteParPoint } from './textes'
/**
 * @author Jean-claude Lhote
 */
export class PieceBuilder {
  constructor(public valeur: number) {
    this.valeur = valeur
  }

  make(x: number, y: number, scale = 1) {
    switch (this.valeur) {
      case 2: {
        const disqueExt = new Plot(x, y, {
          rayon: 0.5 * scale,
          couleur: context.isHtml ? '#E8E8E8' : 'gray!10',
          couleurDeRemplissage: context.isHtml ? '#E8E8E8' : 'gray!10',
          opaciteDeRemplissage: 1,
        })
        const disqueInt = new Plot(x, y, {
          rayon: 0.35 * scale,
          couleur: context.isHtml ? '#DAA520' : 'yellow!50',
          couleurDeRemplissage: context.isHtml ? '#DAA520' : 'yellow!50',
          opaciteDeRemplissage: 1,
        })
        const tex = texteParPoint(
          '2',
          pointAbstrait((x - 0.22) * scale, y * scale),
          0,
          'black',
          (context.isHtml ? 1.1 : 0.5) * scale,
          'milieu',
          true,
        )
        const texEuro = texteParPoint(
          'Euro',
          pointAbstrait((x + 0.1) * scale, y * scale),
          0,
          'black',
          (context.isHtml ? 0.4 : 0.3) * scale,
          'milieu',
          true,
        )
        tex.contour = true
        tex.couleurDeRemplissage = ['none', 'yellow!50']
        texEuro.contour = true
        texEuro.couleurDeRemplissage = ['none', 'yellow!50']
        return [[disqueExt], disqueInt, tex, texEuro]
      }
      case 0.5: {
        const disqueExt = new Plot(x, y, {
          rayon: 0.42 * scale,
          couleur: context.isHtml ? '#E8E8E8' : 'gray!10',
          couleurDeRemplissage: context.isHtml ? '#E8E8E8' : 'gray!10',
          opaciteDeRemplissage: 1,
        })
        const disqueInt = new Plot(x, y, {
          rayon: 0.4 * scale,
          couleur: context.isHtml ? '#DAA520' : 'yellow!50',
          couleurDeRemplissage: context.isHtml ? '#DAA520' : 'yellow!50',
          opaciteDeRemplissage: 1,
        })
        const tex = texteParPoint(
          '50',
          pointAbstrait((x + 0.1) * scale, (y + 0.05) * scale),
          0,
          'black',
          (context.isHtml ? 1 : 0.7) * scale,
          'milieu',
          true,
        )
        const texC = texteParPoint(
          'C',
          pointAbstrait((x - 0.12) * scale, (y - 0.26) * scale),
          0,
          'black',
          (context.isHtml ? 0.45 : 0.32) * scale,
          'milieu',
          true,
        )
        const texEnt = texteParPoint(
          'ENT',
          pointAbstrait((x + 0.1) * scale, (y - 0.27) * scale),
          0,
          'black',
          (context.isHtml ? 0.35 : 0.25) * scale,
          'milieu',
          true,
        )
        texC.contour = true
        texC.couleurDeRemplissage = ['none', 'yellow!50']
        tex.contour = true
        tex.couleurDeRemplissage = ['none', 'yellow!50']
        texEnt.contour = true
        texEnt.couleurDeRemplissage = ['none', 'yellow!50']
        return [[disqueExt], disqueInt, tex, texC, texEnt]
      }
      case 1:
      default: {
        const disqueExt = new Plot(x, y, {
          rayon: 0.42 * scale,
          couleur: context.isHtml ? '#DAA520' : 'yellow!60',
          couleurDeRemplissage: context.isHtml ? '#DAA520' : 'yellow!60',
          opaciteDeRemplissage: 1,
        })
        const disqueInt = new Plot(x, y, {
          rayon: 0.3 * scale,
          couleur: context.isHtml ? '#E8E8E8' : 'gray!10',
          couleurDeRemplissage: context.isHtml ? '#E8E8E8' : 'gray!10',
          opaciteDeRemplissage: 1,
        })
        const tex = texteParPoint(
          '1',
          pointAbstrait((x - 0.17) * scale, y * scale),
          0,
          'black',
          (context.isHtml ? 1.1 : 0.5) * scale,
          'milieu',
          true,
        )
        const texEuro = texteParPoint(
          'Euro',
          pointAbstrait((x + 0.1) * scale, y * scale),
          0,
          'black',
          (context.isHtml ? 0.4 : 0.3) * scale,
          'milieu',
          true,
        )
        tex.contour = true
        tex.couleurDeRemplissage = ['none', 'gray!10']
        texEuro.contour = true
        texEuro.couleurDeRemplissage = ['none', 'gray!10']
        return [[disqueExt], disqueInt, tex, texEuro]
      }
    }
  }
}
