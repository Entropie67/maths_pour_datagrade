=== Partie A

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    + On lit sur le graphique que l'image de 3,6 cm par cette fonction est environ 200 cm#super[3].
    + On lit sur le graphique que l'antécédent de 660 cm#super[3] par cette fonction est environ 5,4 cm.
  ],
  [
    #box(width: 10cm, height: 8.6cm)[
      #for r in range(1, 9) {
        place(line(start: (1.6cm + r * 1cm, 0.5cm), end: (1.6cm + r * 1cm, 7.5cm), stroke: 0.3pt + gray))
      }
      #for v in range(100, 801, step: 100) {
        place(line(start: (1.6cm, 7.5cm - 0.008139535 * v * 1cm), end: (9.6cm, 7.5cm - 0.008139535 * v * 1cm), stroke: 0.3pt + gray))
      }

      #place(line(start: (1.6cm, 7.5cm), end: (9.8cm, 7.5cm), stroke: 1pt))
      #place(line(start: (1.6cm, 7.5cm), end: (1.6cm, 0.3cm), stroke: 1pt))

      #let pts = ((0, 0), (0.5, 0.524), (1.0, 4.189), (1.5, 14.137), (2.0, 33.510), (2.5, 65.450), (3.0, 113.097), (3.5, 179.594), (4.0, 268.083), (4.5, 381.704), (5.0, 523.599), (5.5, 696.910), (5.9, 860))
      #for i in range(pts.len() - 1) {
        let p1 = pts.at(i)
        let p2 = pts.at(i + 1)
        place(line(
          start: (1.6cm + p1.at(0) * 1cm, 7.5cm - 0.008139535 * p1.at(1) * 1cm),
          end: (1.6cm + p2.at(0) * 1cm, 7.5cm - 0.008139535 * p2.at(1) * 1cm),
          stroke: 1.2pt + red,
        ))
      }

      #place(line(start: (5.2cm, 7.5cm), end: (5.2cm, 5.872cm), stroke: 1pt + teal))
      #place(line(start: (5.2cm, 5.872cm), end: (1.6cm, 5.872cm), stroke: 1pt + teal))
      #place(dx: 4.95cm, dy: 7.85cm)[#box(stroke: 0.5pt, fill: white, inset: 2pt, radius: 50%)[#text(size: 6.5pt)[3,6]]]
      #place(dx: 0.05cm, dy: 5.68cm)[#box(stroke: 0.5pt, fill: white, inset: 2pt, radius: 50%)[#text(size: 6.5pt)[200]]]

      #place(line(start: (7.0cm, 7.5cm), end: (7.0cm, 2.128cm), stroke: 1pt + blue))
      #place(line(start: (7.0cm, 2.128cm), end: (1.6cm, 2.128cm), stroke: 1pt + blue))
      #place(dx: 6.75cm, dy: 7.85cm)[#box(stroke: 0.5pt, fill: white, inset: 2pt, radius: 50%)[#text(size: 6.5pt)[5,4]]]
      #place(dx: 0.05cm, dy: 1.94cm)[#box(stroke: 0.5pt, fill: white, inset: 2pt, radius: 50%)[#text(size: 6.5pt)[660]]]

      #for r in range(1, 9) {
        place(dx: 1.6cm + r * 1cm - 0.1cm, dy: 7.6cm)[#text(size: 7pt)[#r]]
      }
      #for v in range(100, 801, step: 100) {
        place(dx: 0.7cm, dy: 7.5cm - 0.008139535 * v * 1cm - 0.12cm)[#text(size: 6.5pt)[#v]]
      }
      #place(dx: 1.3cm, dy: 7.55cm)[#text(size: 7pt)[0]]
      #place(dx: 7.1cm, dy: 8.15cm)[#text(size: 7.5pt)[Rayon en cm]]
      #place(dx: 1.8cm, dy: 0.25cm)[#text(size: 7.5pt)[Volume en cm#super[3]]]
    ]
  ],
)

=== Partie B

+ $cal(V) = 4/3 times pi times 2,5^3 ≈ 65,45$ : le volume d'une boule, arrondi à l'unité, est d'environ $65$ cm#super[3].
+ $1000 / 65 ≈ 15,4$

  Donc on peut fabriquer au maximum 15 boules avec $1000$ cm#super[3] de plastique.
+ On construit un tableau de proportionnalité :

  #table(
    columns: 3,
    align: center,
    stroke: 0.6pt,
    [masse en g], [$0,9$], [$x$],
    [volume en cm#super[3]], [1], [65],
  )

  $0,9 times 65 = 58,5$ g.

  Donc la masse d'une boule est d'environ $59$ g.
