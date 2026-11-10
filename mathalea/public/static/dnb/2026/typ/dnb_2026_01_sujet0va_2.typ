On donne un programme de calcul :

#align(center)[
  #let step(txt) = box(stroke: 0.6pt, inset: 6pt)[#txt]
  #let down = align(center)[#sym.arrow.b]
  #stack(
    dir: ttb,
    spacing: 4pt,
    step[choisir un nombre],
    down,
    step[le multiplier par 2],
    down,
    step[élever le résultat au carré],
    down,
    step[retrancher 9],
    down,
    step[afficher le résultat],
  )
]

+ Lorsque le nombre choisi est 4, vérifier le programme affiche 55, en précisant chacune des étapes de calcul.
+ On appelle $x$ le nombre choisi au départ.
  #enum(
    numbering: "a.",
    [Écrire, en fonction de $x$, le résultat obtenu par le programme.],
    [Parmi les quatre expressions suivantes, laquelle correspond au résultat obtenu par le programme ?],
  )

  #table(
    columns: 4,
    align: center,
    stroke: 0.6pt,
    [$A = 55$], [$B = (2x+3)^2$], [$C = (2x-3)(2x+3)$], [$D = (2x-3)^2$],
  )
