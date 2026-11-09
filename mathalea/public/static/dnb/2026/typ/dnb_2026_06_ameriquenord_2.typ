On considère les fonctions $f$ et $g$ définies par : $f(x) = (x-1)(x+3)$ et $g(x) = 2x+1$.

+ Calculer $f(-4)$.
+ Déterminer l'antécédent de 2 par la fonction $g$.
+ On utilise un tableur pour donner les images des nombres entiers de 0 à 8 par les fonctions $f$ et $g$.

  #align(center)[
    #table(
      align: center + horizon,
      columns: (1.2cm,) * 11,

      // Ligne d'en-tête (Lettres)
      [], [*A*], [*B*], [*C*], [*D*], [*E*], [*F*], [*G*], [*H*], [*I*], [*J*],

      // Ligne 1
      [*1*], [$x$], [$0$], [$1$], [$2$], [$3$], [$4$], [$5$], [$6$], [$7$], [$8$],

      // Ligne 2
      [*2*], [$f(x)$], [$-3$], [$0$], [$5$], [$12$], [$21$], [$32$], [$45$], [$60$], [$77$],

      // Ligne 3
      [*3*], [$g(x)$], [$1$], [$3$], [$5$], [$7$], [$9$], [$11$], [$13$], [$15$], [$17$]
    )
  ]

  #enum(
    numbering: "a.",
    [Quelle formule doit-on saisir en cellule B3 puis étirer vers la droite pour compléter la ligne 3 ?

    _Aucune justification n'est demandée._],
    [Par lecture du tableau ci-dessus, donner une solution de l'équation $f(x) = g(x)$.

    _Aucune justification n'est demandée._],
  )
+ On représente graphiquement chacune de ces fonctions.

  #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      #box(width: 8cm, height: 11cm, clip: true)[
        #let sx(x) = x + 4.5
        #let sy(y) = 5.5 - y
        #let f(x) = (x - 1) * (x + 3)
        #let g(x) = 2 * x + 1
        #let n = 48
        #let ptsf = range(0, n + 1).map(i => {
          let t = -4 + i * (6.5 / n)
          (sx(t) * 1cm, sy(f(t)) * 1cm)
        })
        #for xt in range(-4, 4) [
          #place(dx: sx(xt) * 1cm, dy: 0cm, line(start: (0cm, 0cm), end: (0cm, 11cm), stroke: 0.25pt + gray))
        ]
        #for yt in range(-5, 6) [
          #place(dx: 0cm, dy: sy(yt) * 1cm, line(start: (0cm, 0cm), end: (8cm, 0cm), stroke: 0.25pt + gray))
        ]
        #place(dx: 0cm, dy: 0cm, curve(stroke: 1pt + red, curve.move(ptsf.first()), ..ptsf.slice(1).map(p => curve.line(p))))
        #place(dx: 0cm, dy: 0cm, line(start: (sx(-4) * 1cm, sy(g(-4)) * 1cm), end: (sx(2.5) * 1cm, sy(g(2.5)) * 1cm), stroke: 1pt))
        #place(dx: sx(-4.5) * 1cm, dy: sy(0) * 1cm, line(start: (0cm, 0cm), end: (8cm, 0cm), stroke: 1.25pt))
        #place(dx: sx(0) * 1cm, dy: sy(5.5) * 1cm, line(start: (0cm, 0cm), end: (0cm, 11cm), stroke: 1.25pt))
        #for xt in range(-4, 4) [
          #if xt != 0 [
            #place(dx: sx(xt) * 1cm - 0.1cm, dy: sy(0) * 1cm + 0.05cm, line(start: (0cm, 0cm), end: (0cm, 0.2cm), stroke: 1.25pt))
            #place(dx: sx(xt) * 1cm - 0.12cm, dy: sy(0) * 1cm + 0.25cm)[#text(size: 6pt)[#xt]]
          ]
        ]
        #for yt in range(-5, 6) [
          #if yt != 0 [
            #place(dx: sx(0) * 1cm - 0.1cm, dy: sy(yt) * 1cm - 0.1cm, line(start: (0cm, 0cm), end: (0.2cm, 0cm), stroke: 1.25pt))
            #place(dx: sx(0) * 1cm - 0.55cm, dy: sy(yt) * 1cm - 0.12cm)[#text(size: 6pt)[#yt]]
          ]
        ]
        #place(dx: sx(-3.7) * 1cm, dy: sy(3.7) * 1cm)[#text(fill: red, size: 9pt)[$cal(C)_1$]]
        #place(dx: sx(1.9) * 1cm, dy: sy(-4.3) * 1cm)[#text(size: 9pt)[$cal(C)_2$]]
      ]
    ],
    [
      #v(20pt)
      #enum(
        numbering: "a.",
        [Associer à chacune des fonctions $f$ et $g$ sa représentation graphique.

        _Aucune justification n'est demandée._],
        [Par lecture graphique, déterminer les deux solutions de l'équation $f(x) = g(x)$.

        _Aucune justification n'est demandée._],
      )
    ],
  )
+ Lola affirme que les solutions de l'équation $f(x) = g(x)$ sont les mêmes que les solutions de l'équation $x^2 - 4 = 0$. A-t-elle raison ? Justifier.
