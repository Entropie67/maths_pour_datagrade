#import "@preview/blockst:0.2.1": scratch

+ On choisit $1$ comme nombre de départ : #h(1em)
  #box(width: 6cm, height: 3.6cm)[
    #place(dx: 2.3cm, dy: 0cm, rect(width: 1.4cm, height: 0.7cm, radius: 2pt, stroke: 0.6pt)[#align(center)[$1$]])
    #place(dx: 0.2cm, dy: 1.5cm, rect(width: 1.9cm, height: 0.7cm, radius: 2pt, stroke: 0.6pt)[#align(center)[$1+6=7$]])
    #place(dx: 3.8cm, dy: 1.5cm, rect(width: 1.9cm, height: 0.7cm, radius: 2pt, stroke: 0.6pt)[#align(center)[$1-4=-3$]])
    #place(dx: 1.9cm, dy: 2.9cm, rect(width: 2.5cm, height: 0.7cm, radius: 2pt, stroke: 0.6pt)[#align(center)[$7 times (-3) = -21$]])
    #place(dx: 0cm, dy: 0cm, line(start: (3.0cm, 0.7cm), end: (1.15cm, 1.5cm), stroke: 0.5pt))
    #place(dx: 0cm, dy: 0cm, line(start: (3.0cm, 0.7cm), end: (4.75cm, 1.5cm), stroke: 0.5pt))
    #place(dx: 0cm, dy: 0cm, line(start: (1.15cm, 2.2cm), end: (3.15cm, 2.9cm), stroke: 0.5pt))
    #place(dx: 0cm, dy: 0cm, line(start: (4.75cm, 2.2cm), end: (3.15cm, 2.9cm), stroke: 0.5pt))
  ]

  Si on choisit $1$, on obtient effectivement $-21$ avec le programme A.
+ $10 arrow.r^("élever au carré") 10^2 = 100$ #h(0.5em) puis #h(0.5em) $100 arrow.r^("soustraire 9") 100 - 9 = 91$

  Avec le programme B, on obtient $91$ lorsque le nombre de départ est $10$.
+ Si on choisit $x$ comme nombre de départ, le programme B calcule $x^2 - 9$.

  On cherche donc pour quelle(s) valeur(s) de $x$ on obtient $16$,

  autrement dit #h(0.5em) $x^2 - 9 = 16 <=> x^2 - 25 = 0$.

  On remarque que $25 = 5^2$, donc on peut factoriser une identité remarquable et l'équation à résoudre devient $(x-5)(x+5) = 0$.

  Un produit est nul si et seulement si un des facteurs est nul ; donc il y a deux solutions qui sont $-5$ et $5$.

  Si on choisit un de ces deux nombres, on obtiendra $16$ avec le programme B.
+ #grid(
    columns: (1fr, 1fr),
    gutter: 10pt,
    [
      Ligne 3, on ajoute 6, ligne 4, on soustrait 4 et enfin ligne 5 on fait le produit des 2 résultats intermédiaires.
    ],
    [
      #scratch(language: "fr", "
      mettre [Valeur 1 v] à ((réponse) + (6)) ::variables
      mettre [Valeur 2 v] à ((réponse) - (4)) ::variables
      mettre [Résultat v] à ((Valeur 1) * (Valeur 2)) ::variables
      ")
    ],
  )
+ On choisit $x$ comme nombre de départ dans le programme A :

  #align(center)[
    #box(width: 6cm, height: 3.6cm)[
      #place(dx: 2.5cm, dy: 0cm, rect(width: 1cm, height: 0.7cm, stroke: 0.6pt)[#align(center)[$x$]])
      #place(dx: 0.2cm, dy: 1.5cm, rect(width: 1.5cm, height: 0.7cm, stroke: 0.6pt)[#align(center)[$x+6$]])
      #place(dx: 4.3cm, dy: 1.5cm, rect(width: 1.5cm, height: 0.7cm, stroke: 0.6pt)[#align(center)[$x-4$]])
      #place(dx: 1.5cm, dy: 2.9cm, rect(width: 3cm, height: 0.7cm, stroke: 0.6pt)[#align(center)[$(x+6)(x-4)$]])
      #place(dx: 0cm, dy: 0cm, line(start: (3.0cm, 0.7cm), end: (0.95cm, 1.5cm), stroke: 0.5pt))
      #place(dx: 0cm, dy: 0cm, line(start: (3.0cm, 0.7cm), end: (5.05cm, 1.5cm), stroke: 0.5pt))
      #place(dx: 0cm, dy: 0cm, line(start: (0.95cm, 2.2cm), end: (3.0cm, 2.9cm), stroke: 0.5pt))
      #place(dx: 0cm, dy: 0cm, line(start: (5.05cm, 2.2cm), end: (3.0cm, 2.9cm), stroke: 0.5pt))
    ]
  ]

  On développe : #h(0.5em) $(x+6)(x-4) = x^2 - 4x + 6x - 24 = x^2 + 2x - 24$.

  Avec le programme A, on calcule $x^2 + 2x - 24$.
+ On sait que le programme A calcule #h(0.5em) $x^2 + 2x - 24$ #h(0.5em) et le programme B #h(0.5em) $x^2 - 9$.

  Les deux programmes donnent le même résultat si et seulement si #h(0.5em) $x^2 + 2x - 24 = x^2 - 9$.

  Cette équation peut se simplifier en soustrayant $x^2$ à chaque membre, et elle devient :

  $ 2x - 24 = -9 &<=> 2x = 15 \
    &<=> x = 15/2 $

  Les deux programmes donnent le même résultat si on choisit comme nombre de départ $15/2 = 7,5$ et ce résultat est $47,25$.
