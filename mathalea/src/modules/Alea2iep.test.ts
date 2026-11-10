import { describe, expect, it, vi } from 'vitest'
import { pointAbstrait } from '../lib/2d/PointAbstrait'
import Alea2iep from './Alea2iep'

describe('Alea2iep.pointNomDeplacer', () => {
  it('moves the existing point name without creating another text or moving the point', () => {
    const iep = new Alea2iep()
    const A = pointAbstrait(2, 3, 'A')

    iep.pointCreer(A)
    iep.pointNomDeplacer(A, { dx: -0.5, dy: 0.75, tempo: 0 })

    const xml = iep.script()
    expect(xml.match(/mouvement="creer" objet="texte"/g)).toHaveLength(1)
    expect(xml).toContain(
      '<action objet="texte" id="2" mouvement="translation" abscisse="45" ordonnee="188" tempo="0" vitesse="10" />',
    )
    expect(xml).not.toContain('mouvement="translation" objet="point"')
  })
})

describe('Alea2iep.triangleEquilateral', () => {
  it('places the names outside the triangle when requested', () => {
    const iep = new Alea2iep()
    const [A, , C] = iep.triangleEquilateral('ABC', 4, {
      placerNomsSommets: true,
    })
    const noms = [
      ...iep
        .script()
        .matchAll(
          /<action abscisse="(-?\d+)" ordonnee="(-?\d+)" id="\d+" mouvement="creer" objet="texte" \/>/g,
        ),
    ]

    expect(noms).toHaveLength(3)
    expect(Number(noms[0][1])).toBeLessThan(iep.x(A))
    expect(Number(noms[2][2])).toBeLessThan(iep.y(C))
  })
})

describe('Alea2iep.triangle1longueur2angles', () => {
  it('keeps the name of an acute vertex clear of both construction rays', () => {
    const random = vi.spyOn(Math, 'random')
    try {
      for (const tirage of [0, 0.5, 0.999]) {
        random.mockReturnValue(tirage)
        const iep = new Alea2iep()
        const [A, B, C] = iep.triangle1longueur2angles('ABC', 3, 30, 120, {
          description: false,
          placerNomsSommets: true,
        })
        const nomC = iep.liste_script.find((action) =>
          action.includes('texte="$C$"'),
        )
        const position = nomC?.match(
          /abscisse="(-?\d+)" ordonnee="(-?\d+)" id="\d+" mouvement="creer" objet="texte"/,
        )
        expect(position).toBeDefined()
        const x = Number(position?.[1]) / 30 - iep.translationX + 0.25
        const y = iep.translationY - Number(position?.[2]) / 30 - 0.25
        const distanceDroite = (origine: typeof A) =>
          Math.abs(
            (C.y - origine.y) * (x - origine.x) -
              (C.x - origine.x) * (y - origine.y),
          ) / Math.hypot(C.x - origine.x, C.y - origine.y)

        expect(Math.min(distanceDroite(A), distanceDroite(B))).toBeGreaterThan(
          0.6,
        )
      }
    } finally {
      random.mockRestore()
    }
  })
})

describe('Alea2iep.regleSegment', () => {
  it('centers the ruler around a horizontal segment before drawing it', () => {
    const iep = new Alea2iep()

    iep.regleSegment(pointAbstrait(0, 0), pointAbstrait(4, 0))

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="0" abscisse="-165" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).toContain(
      '<action objet="regle" mouvement="montrer" abscisse="0" ordonnee="300" tempo="5" />',
    )
    expect(xml).toContain(
      '<action abscisse="120" ordonnee="300" epaisseur="2" couleur="#216D9A" mouvement="tracer" objet="crayon" tempo="5" vitesse="10"    id="1" />',
    )
  })

  it('keeps the centered ruler orientation independent from the point order', () => {
    const iep = new Alea2iep()

    iep.regleSegment(pointAbstrait(4, 0), pointAbstrait(0, 0))

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="0" abscisse="-165" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).not.toContain(
      '<action objet="regle" mouvement="rotation" angle="-180" tempo="5" sens="5" />',
    )
  })

  it('rotates the ruler before translating it to the next centered segment', () => {
    const iep = new Alea2iep()

    iep.regleSegment(pointAbstrait(0, 0), pointAbstrait(4, 0))
    iep.regleSegment(pointAbstrait(0, 0), pointAbstrait(0, 4))

    expect(iep.script()).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="-90" abscisse="0" ordonnee="465" tempo="5" sens="5" vitesse="10" />',
    )
  })

  it('can place the ruler zero on the first point for measured segments', () => {
    const iep = new Alea2iep()

    iep.regleSegment(pointAbstrait(0, 0), pointAbstrait(4, 0), {
      zeroSurPremierPoint: true,
    })

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="0" abscisse="0" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).not.toContain(
      '<action objet="regle" mouvement="montrer" abscisse="-165" ordonnee="300" tempo="5" />',
    )
  })

  it('keeps the ruler visible between polygon sides', () => {
    const iep = new Alea2iep()

    iep.polygoneTracer(
      pointAbstrait(0, 0),
      pointAbstrait(4, 0),
      pointAbstrait(4, 3),
      pointAbstrait(0, 3),
    )

    const xml = iep.script()
    expect(xml.match(/objet="regle" mouvement="montrer"/g)).toHaveLength(1)
    expect(xml.match(/objet="regle" mouvement="masquer"/g)).toHaveLength(1)
    expect(
      xml.match(/objet="regle" mouvement="rotation_translation"/g),
    ).toHaveLength(4)
  })
})

describe('Alea2iep.regleDemiDroite', () => {
  it('can draw a ray from a point and an angle', () => {
    const iep = new Alea2iep()

    iep.regleDemiDroite(pointAbstrait(0, 0), 0)

    expect(iep.script()).toContain(
      '<action abscisse="450" ordonnee="300" epaisseur="2" couleur="#216D9A" mouvement="tracer" objet="crayon" tempo="5" vitesse="10"    id="1" />',
    )
  })
})

describe('Alea2iep.regleDroite', () => {
  it('can draw a line from a point and a slope', () => {
    const iep = new Alea2iep()

    iep.regleDroite(pointAbstrait(0, 0), 1)

    expect(iep.script()).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="-45" abscisse="-148" ordonnee="448" tempo="5" sens="5" vitesse="10" />',
    )
  })

  it('can draw a vertical line from a point and an infinite slope', () => {
    const iep = new Alea2iep()

    iep.regleDroite(pointAbstrait(0, 0), Number.POSITIVE_INFINITY)

    expect(iep.script()).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="-90" abscisse="0" ordonnee="510" tempo="5" sens="5" vitesse="10" />',
    )
  })
})

describe('Alea2iep.regleProlongerSegment', () => {
  it('uses a combined ruler rotation-translation before drawing', () => {
    const iep = new Alea2iep()

    iep.regleProlongerSegment(pointAbstrait(0, 0), pointAbstrait(4, 0), {
      longueur: 4,
    })

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="0" abscisse="30" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).not.toMatch(
      /mouvement="translation"[\s\S]*mouvement="rotation"/,
    )
  })
})

describe('Alea2iep.milieuALaRegle', () => {
  it('orients the ruler from its zero point toward the other endpoint', () => {
    const iep = new Alea2iep()

    iep.milieuALaRegle(pointAbstrait(4, 0), pointAbstrait(0, 0), 'I')

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="0" abscisse="0" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).not.toContain(
      '<action objet="regle" mouvement="rotation_translation" angle="-180" abscisse="0" ordonnee="300" tempo="5" sens="5" vitesse="10" />',
    )
    expect(xml).toContain(
      '<action abscisse="60" ordonnee="300" couleur="black" id="1" mouvement="creer" objet="point" tempo="5"/>',
    )
  })
})

describe('Alea2iep.perpendiculaireRegleEquerre2points3epoint', () => {
  it('codes the right angle at the orthogonal projection of the external point', () => {
    const iep = new Alea2iep()
    const A = pointAbstrait(0, 0, 'A')
    const B = pointAbstrait(4, 0, 'B')
    const C = pointAbstrait(2, 3, 'C')

    iep.perpendiculaireRegleEquerre2points3epoint(A, B, C, { tempo: 0 })

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="equerre" mouvement="rotation_translation" angle="0" abscisse="60" ordonnee="300" tempo="0" sens="5" vitesse="10" />',
    )
    expect(xml).not.toContain(
      '<action objet="equerre" mouvement="rotation_translation" angle="0" abscisse="120" ordonnee="300" tempo="0" sens="5" vitesse="10" />',
    )
  })

  it('uses the orthogonal projection instead of the second reference point on an oblique line', () => {
    const iep = new Alea2iep()
    const A = pointAbstrait(0, 0, 'A')
    const B = pointAbstrait(4, 2, 'B')
    const C = pointAbstrait(2, 4, 'C')

    iep.perpendiculaireRegleEquerre2points3epoint(A, B, C, { tempo: 0 })

    const xml = iep.script()
    expect(xml).toContain(
      '<action objet="equerre" mouvement="rotation_translation" angle="-26.57" abscisse="96" ordonnee="252" tempo="0" sens="5" vitesse="10" />',
    )
    expect(xml).not.toContain(
      '<action objet="equerre" mouvement="rotation_translation" angle="-26.57" abscisse="120" ordonnee="240" tempo="0" sens="5" vitesse="10" />',
    )
  })
})
