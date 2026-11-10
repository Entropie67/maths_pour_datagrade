#grid(
  columns: (0.5fr, 0.46fr),
  gutter: 12pt,
  [
    Sur la figure ci-contre, les points $B$, $A$ et $D$ sont alignés.

    Les droites $(B A)$ et $(E C)$ sont parallèles.

    + Rappeler la propriété de la somme des angles d'un triangle, puis calculer la mesure de l'angle $hat(A C B)$ repéré par la lettre $x$.
    + #enum(
        numbering: "a.",
        [Que peut-on dire des droites $(A B)$ et $(E B)$ ?

        *Justifier la réponse.*],
        [En déduire la mesure de l'angle $hat(C B E)$ repéré par la lettre $y$.],
      )
    + On s'intéresse à l'angle $hat(A D C)$ repéré par la lettre $z$.

      *Déterminer la mesure de cet angle en expliquant chaque étape de la démarche.*
  ],
  [
    #ctz-canvas( length: 0.4cm, {
  import cetz.draw: *
  ctz-init()
  ctz-def-points(A: (-3.908724, 3.185026), B: (-11.660547, 1.720573), C: (-0.120501, -3.734855), D: (8.633989, 5.554561), E: (-9.753552, -6.087555))
  ctz-draw-line("B", "D", "C", "E", "B")
  ctz-draw-segment("B", "C")
  ctz-draw-segment("A", "C")
  ctz-draw-angle("A", "B", "C", radius: 1)
  ctz-draw-text(-9.6, 1.5, $36°$)
  ctz-draw-text(-4.5, 1.6, $108°$)
  ctz-draw-angle("B", "A", "C", radius: 1)
  ctz-draw-angle("C", "A", "B", label: $x$, radius: 1)
  ctz-draw-angle("B", "E", "C", label: $y$, radius: 1.4)
  ctz-draw-angle("D", "A", "C", label: $z$, radius: 1.4)
  ctz-draw-mark-right-angle("B", "E", "C", size:0.7)
  ctz-draw-mark-segment("A", "D", mark:2)
  ctz-draw-mark-segment("C", "D", mark:2)
  
  ctz-draw-labels("A", "B", "C", "D",
    A: (pos: "above", dist: 0.25),
    B: (pos: "above left"),
    C: (pos: "below right"),
    D: (pos: "above right"),
    E: (pos: "below left"),
  )
})
  ],
)
