
Dans cet exercice, on considère la figure ci-contre.

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    Les points $A$, $B$ et $M$ sont alignés.\
    Les points $A$, $C$ et $N$ sont alignés.\
    Le triangle $A B C$ est rectangle en $B$.\
    Le triangle $A M N$ est rectangle en $M$.
  ],
  [
    #ctz-canvas(length: 0.75cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(
        A: (0, 0),
        B: (6.4, 0),
        M: (9.6, 0),
        C: (6.4, 4.8),
        N: (9.6, 7.2),
      )
      // droite (AN), prolongée au-delà de A et de N, avec flèches aux deux bouts
      ctz-draw(segment: ((-0.64, -0.48), (10.64, 7.98)),
        stroke: black + 1.3pt, mark: (start: ">", end: ">"))
      // droite de base (AM)
      ctz-draw(segment: ("A", "M"), stroke: black + 1pt)
      // segment [MN]
      ctz-draw(segment: ("M", "N"), stroke: black + 1pt)
      // segment vertical (CB)
      ctz-draw(segment: ("C", "B"), stroke: black + 1pt)
      // angle droit en B
      ctz-draw-mark-right-angle("C", "B", "A", size: 0.4)
      // mesure de 8 cm le long de (AC), légèrement décalée
      ctz-draw-measure-segment("A", "C", label: [8 cm], offset: 0.6, side: "left")
      // mesures de 6,4 cm et 3,2 cm sous la base
      ctz-draw-measure-segment("A", "B", label: [6,4 cm], offset: 1.0, side: "below")
      ctz-draw-measure-segment("B", "M", label: [3,2 cm], offset: 1.0, side: "below")
      // labels sans croix
      ctz-draw-labels("A", "B", "C", "M", "N",
        A: (pos: "below left"),
        B: (pos: "above right"),
        C: (pos: "above"),
        M: (pos: "right"),
        N: (pos: "right"),
      )
   })
  ],
)

On donne :

$A B = 6,4$ cm ; $B M = 3,2$ cm et $A C = 8$ cm.

_La figure n'est pas en vraie grandeur._

+ Tracer sur la copie le triangle $A B C$ en vraie grandeur et en laissant les traits de construction.
+ Démontrer que $B C$ #h(0.3em)=#h(0.3em) $4,8$ cm.
+ Justifier que les droites $(B C)$ et $(M N)$ sont parallèles.
+ Démontrer que $M N$ #h(0.3em)=#h(0.3em) $7,2$ cm et $A N$ #h(0.3em)=#h(0.3em) $12$ cm.
+ Le périmètre du triangle $A B C$ et le périmètre du quadrilatère $B M N C$ sont-ils égaux ? 

*Argumenter la réponse en précisant la démarche.*