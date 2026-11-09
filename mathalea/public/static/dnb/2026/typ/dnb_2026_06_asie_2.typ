
_La figure ci-dessous n'est pas à l'échelle._

#let tx1(x) = (x + 1.15) * 1cm
#let ty1(y) = (5.15 - y) * 1cm

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    - $O$, $A$ et $B$ sont alignés.
    - $O$, $D$ et $C$ sont alignés.
    - $O D$ #h(0.3em)=#h(0.3em) $8,2$ cm
    - $A D$ #h(0.3em)=#h(0.3em) $1,8$ cm
    - $B C$ #h(0.3em)=#h(0.3em) $4,5$ cm
  ],
  [
    #ctz-canvas(length: 1cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(
        O: (0, 0),
        B: (0, 4),
        C: (2.5, 4),
        A: (0, 2),
        D: (1.25, 2),
      )
      // Axe vertical O-B
      ctz-draw(segment: ("O", "B"), stroke: black + 1.2pt)
      // Côté oblique O -> C (passe par D)
      ctz-draw(segment: ("O", "C"), stroke: black + 1.2pt)
      // Haut du trapèze B-C
      ctz-draw(segment: ("B", "C"), stroke: black + 1.2pt)
      // Parallèle A-D
      ctz-draw(segment: ("A", "D"), stroke: black + 1.2pt)
      // Angles droits en B et en A
      ctz-draw-mark-right-angle("C", "B", "O", size: 0.25)
      ctz-draw-mark-right-angle("D", "A", "O", size: 0.25)
      // Labels sans croix
      ctz-draw-labels("O", "A", "B", "C", "D",
        O: (pos: "below"),
        A: (pos: "left"),
        B: (pos: "left"),
        C: (pos: "right"),
        D: (pos: "right"),
      )
    })
  ],
)

#v(0.3em)

+ Montrer que la longueur du segment $[O A]$ est égale à 8 cm.
+ Justifier que les droites $(B C)$ et $(A D)$ sont parallèles.
+ Calculer la longueur du segment $[O B]$.
+ Une entreprise souhaite fabriquer des gobelets. Un gobelet (grisé sur le schéma ci-dessous) a la forme d'un tronc de cône (cône coupé par un plan parallèle à sa base).

  #let tx2(x) = (x + 2.75) * 1cm
  #let ty2(y) = (5.15 - y) * 1cm
  #let ellpts(cx, cy, rx, ry, a1, a2, n: 24) = range(n + 1).map(i => {
    let a = a1 + (a2 - a1) * i / n
    (tx2(cx + rx * calc.cos(a * 1deg)), ty2(cy + ry * calc.sin(a * 1deg)))
  })

  #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      On reprend les données précédentes :
      - $O$, $A$, $B$ sont alignés
      - $O$, $D$, $C$ sont alignés
      - $O D$ #h(0.3em)=#h(0.3em) $8,2$ cm
      - $A D$ #h(0.3em)=#h(0.3em) $1,8$ cm
      - $B C$ #h(0.3em)=#h(0.3em) $4,5$ cm
    ],
    [
     #ctz-canvas(length: 0.8cm, {
        import cetz.draw: *
        ctz-init()
        ctz-def-points(
          O: (0, 0),
          A: (0, 3),
          D: (1.3, 3),
          B: (0, 7),
          C: (3.033, 7),
          Dg: (-1.3, 3),
          Cg: (-3.033, 7),
        )
        // Génératrice droite du cône complet : O -> D (partie cachée, pointillés)
        // puis D -> C (arête visible du gobelet, trait plein)
        ctz-draw(segment: ("O", "D"), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        ctz-draw(segment: ("D", "C"), stroke: black + 1.2pt)
        // Génératrice gauche : O -> Dg (partie cachée, pointillés)
        // puis Dg -> Cg (arête visible du gobelet, trait plein, comme à droite)
        ctz-draw(segment: ("O", "Dg"), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        ctz-draw(segment: ("Dg", "Cg"), stroke: black + 1.2pt)
        // Axe du cône (pointillés)
        ctz-draw(segment: ("O", "B"), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        // Rayons horizontaux (pointillés)
        ctz-draw(segment: ("A", "D"), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        ctz-draw(segment: ("B", "C"), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        // Ellipse du haut : le bord du gobelet (trait plein)
        ctz-draw(ellipse: ("B", 3.033, 0.6, 0deg), stroke: black + 1.2pt)
        // Ellipse du bas : le fond du gobelet (pointillés)
        ctz-draw(ellipse: ("A", 1.3, 0.32, 0deg), stroke: (paint: black, dash: "dashed", thickness: 0.8pt))
        // Angles droits en A et en B (rayon perpendiculaire à l'axe)
        ctz-draw-mark-right-angle("D", "A", "B", size: 0.25)
        ctz-draw-mark-right-angle("C", "B", "A", size: 0.25)
        // Texte au centre du gobelet
        content((-0, 5), [Le gobelet])
        // Labels des points, sans tracer de croix
        ctz-draw-labels("O", "A", "B", "C", "D",
          O: (pos: "below"),
          A: (pos: "left"),
          D: (pos: "right"),
          B: (pos: "above"),
          C: (pos: "right"),
        )
      })
    ],
  )

  #v(0.5em)

  #align(center)[
    #box(stroke: 0.6pt, inset: 8pt)[
      *Rappel :* \
      Volume d'un cône de révolution : #h(0.5em) $V = pi times R^2 times H div 3$, \
      où $R$ est le rayon de la base et $H$ est la hauteur du cône.
    ]
  ]

  #v(0.3em)

  #enum(
    numbering: "a.",
    [Calculer le volume du grand cône de hauteur $[O B]$ en cm#super[3], arrondi à l'unité.],
    [Calculer le volume du gobelet, en cm#super[3], arrondi à l'unité.],
  )
