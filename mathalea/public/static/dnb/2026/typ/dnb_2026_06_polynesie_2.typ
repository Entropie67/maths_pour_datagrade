#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    On donne la figure ci-contre.

    $B G F$ est un triangle rectangle en $G$.

    Voici les informations dont on dispose :

    $A C = 5$ cm #h(0.5em) $B C = 4$ cm

    $A B = 3$ cm #h(0.5em) $B G = 2$ cm

    $hat(B C F) = 74$°

    _La figure n'est pas en vraie grandeur._
  ],
  [
    #ctz-canvas( {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(A: (0, 0), B: (3, 0), C: (3, 4))
      ctz-def-rotation("F", "C", "B", -32)
      ctz-draw-mark-right-angle("A", "B", "C")
      ctz-def-circle("C1", "B", radius: 2)
      ctz-def-midpoint("M", "B", "F")
      ctz-def-circle("C2", "M", through: "B")
      ctz-def-cc(("G1", "G"), "C1", "C2")
      ctz-draw-line("A", "B", "C", "A")
      ctz-draw-line("C", "F", "B")
      ctz-draw-line("F", "G", "B")
      ctz-draw-mark-right-angle("B", "G", "F")
      ctz-draw-mark-segment("B", "C", mark: 2)
      ctz-draw-mark-segment("B", "F", mark: 2)
      ctz-draw-angle("C", "B", "F", label: "74°")
      ctz-draw-measure-segment("A", "B", label: "3 cm", side: "right", offset:0.7)
      ctz-draw-text(0.9, 2, "5 cm")
      ctz-draw-text(2.4, 2, "4 cm")
      ctz-draw-text(4.1, -0.4, "2 cm")
      ctz-draw-labels("A", "B", "C", "F", "G",
        A: (pos: "below left", dist: 0.25),
        B: (pos: "below right"),
        C: (pos: "above"),
        F: (pos: "above"),
        G: (pos: "below")
      )
    })
  ],
)

Le but de cet exercice est de déterminer si les points $A$, $B$ et $G$ sont alignés ou non.

+ On se place dans le triangle $C B F$.
  #enum(
    numbering: "a.",
    [Justifier que l'angle $hat(C F B)$ mesure $74$°.],
    [Calculer la mesure de l'angle $hat(C B F)$.],
  )
+ Démontrer que le triangle $A B C$ est un triangle rectangle.
+ Dans le triangle rectangle $B G F$, calculer la mesure de l'angle $hat(F B G)$.
+ Les points $A$, $B$ et $G$ sont-ils alignés ? Justifier la réponse. *Argumenter la réponse en précisant la démarche.*
