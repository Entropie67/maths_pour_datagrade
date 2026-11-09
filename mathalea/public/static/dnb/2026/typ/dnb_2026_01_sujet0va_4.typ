#let dblv(x, y) = place(dx: x * 1cm - 0.06cm, dy: y * 1cm - 0.09cm, line(length: 0.18cm, angle: 90deg, stroke: 0.5pt)) + place(dx: x * 1cm + 0.06cm, dy: y * 1cm - 0.09cm, line(length: 0.18cm, angle: 90deg, stroke: 0.5pt))
#let dblh(x, y) = place(dx: x * 1cm - 0.09cm, dy: y * 1cm - 0.06cm, line(length: 0.18cm, angle: 0deg, stroke: 0.5pt)) + place(dx: x * 1cm - 0.09cm, dy: y * 1cm + 0.06cm, line(length: 0.18cm, angle: 0deg, stroke: 0.5pt))

#grid(
  columns: (0.58fr, 0.38fr),
  gutter: 12pt,
  [
    Sur la figure ci-contre :
    - $A B C D$ est un carré de côté 9 cm ;
    - les segments de même longueur sont codés.

    + #enum(
        numbering: (..n) => strong(numbering("a.", ..n)),
        [Le polygone $I J K L M N O P$ est-il régulier, c'est-à-dire a-t-il tous ses côtés de même longueur ?

        *Justifier la réponse.*],
        [Justifier que l'aire de la surface $I J K L M N O P$ grisée sur la figure ci-contre est égale à 63 cm#super[2].],
      )
  ],
  [
    #box(width: 6cm, height: 6cm)[
      #place(dx: 0.53cm, dy: 0.53cm,
        rect(width: 4.86cm, height: 4.86cm, fill: none, stroke: 0.6pt))
      #place(dx: 0cm, dy: 0cm,
        polygon(
          fill: rgb("#d3d3d3"), stroke: 0.6pt,
          (2.15cm, 0.53cm), (3.77cm, 0.53cm), (5.39cm, 2.15cm), (5.39cm, 3.77cm),
          (3.77cm, 5.39cm), (2.15cm, 5.39cm), (0.53cm, 3.77cm), (0.53cm, 2.15cm),
        ))
      #dblv(1.25, 0.53) #dblv(2.96, 0.53) #dblv(4.58, 0.53)
      #dblv(1.25, 5.39) #dblv(2.96, 5.39) #dblv(4.58, 5.39)
      #dblh(0.53, 1.34) #dblh(0.53, 2.96) #dblh(0.53, 4.58)
      #dblh(5.39, 1.34) #dblh(5.39, 2.96) #dblh(5.39, 4.58)
      #place(dx: 0.33cm, dy: 0.23cm)[$A$]
      #place(dx: 5.49cm, dy: 0.23cm)[$B$]
      #place(dx: 5.49cm, dy: 5.29cm)[$C$]
      #place(dx: 0.33cm, dy: 5.55cm)[$D$]
      #place(dx: 2.1cm, dy: 0.23cm)[$I$]
      #place(dx: 3.72cm, dy: 0.23cm)[$J$]
      #place(dx: 5.49cm, dy: 2.0cm)[$K$]
      #place(dx: 5.49cm, dy: 3.62cm)[$L$]
      #place(dx: 3.72cm, dy: 5.55cm)[$M$]
      #place(dx: 2.1cm, dy: 5.55cm)[$N$]
      #place(dx: 0.2cm, dy: 3.62cm)[$O$]
      #place(dx: 0.2cm, dy: 2.0cm)[$P$]
    ]
  ],
)


#grid(
  columns: (0.58fr, 0.38fr),
  gutter: 12pt,
  [
    #enum(
      start: 2,
      [Les diagonales du carré $A B C D$ se coupent en $S$.

      On a tracé le cercle de centre $S$ et de diamètre 9 cm.

      #enum(
        numbering: (..n) => strong(numbering("a.", ..n)),
        [Déterminer l'aire du disque de centre $S$ et de diamètre 9 cm.],
        [Montrer que la différence entre l'aire du polygone $I J K L M N O P$ et l'aire du disque représente moins de 1 % de l'aire du disque.],
      )],
    )
  ],
  [
    #box(width: 6cm, height: 6cm)[
      #place(dx: 0.53cm, dy: 0.53cm,
        rect(width: 4.86cm, height: 4.86cm, fill: none, stroke: 0.6pt))
      #place(dx: 0.55cm, dy: 0.5cm,
        circle(radius: 2.43cm, fill: rgb("#d3d3d3"), stroke: none))
      #place(dx: 0cm, dy: 0cm,
        line(start: (0.53cm, 0.53cm), end: (5.39cm, 5.39cm), stroke: (paint: black, thickness: 0.6pt, dash: "dashed")))
      #place(dx: 0cm, dy: 0cm,
        line(start: (5.39cm, 0.53cm), end: (0.53cm, 5.39cm), stroke: (paint: black, thickness: 0.6pt, dash: "dashed")))
      #place(dx: 0cm, dy: 0cm,
        polygon(
          fill: none, stroke: 0.6pt,
          (2.15cm, 0.53cm), (3.77cm, 0.53cm), (5.39cm, 2.15cm), (5.39cm, 3.77cm),
          (3.77cm, 5.39cm), (2.15cm, 5.39cm), (0.53cm, 3.77cm), (0.53cm, 2.15cm),
        ))
      #dblv(1.25, 0.53) #dblv(2.96, 0.53) #dblv(4.58, 0.53)
      #dblv(1.25, 5.39) #dblv(2.96, 5.39) #dblv(4.58, 5.39)
      #dblh(0.53, 1.34) #dblh(0.53, 2.96) #dblh(0.53, 4.58)
      #dblh(5.39, 1.34) #dblh(5.39, 2.96) #dblh(5.39, 4.58)
      #place(dx: 0.33cm, dy: 0.23cm)[$A$]
      #place(dx: 5.49cm, dy: 0.23cm)[$B$]
      #place(dx: 5.49cm, dy: 5.29cm)[$C$]
      #place(dx: 0.33cm, dy: 5.29cm)[$D$]
      #place(dx: 2.1cm, dy: 0.23cm)[$I$]
      #place(dx: 3.72cm, dy: 0.23cm)[$J$]
      #place(dx: 5.49cm, dy: 2.0cm)[$K$]
      #place(dx: 5.49cm, dy: 3.62cm)[$L$]
      #place(dx: 3.72cm, dy: 5.55cm)[$M$]
      #place(dx: 2.1cm, dy: 5.55cm)[$N$]
      #place(dx: 0.2cm, dy: 3.62cm)[$O$]
      #place(dx: 0.2cm, dy: 2.0cm)[$P$]
      #place(dx: 2.66cm, dy: 2.96cm)[$S$]
    ]
  ],
)