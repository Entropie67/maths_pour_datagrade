Pour chaque question, recopier sur la copie son numéro et la réponse correspondante.

Pour cette partie, aucune justification n'est demandée.

Pour les questions à choix multiple, une seule réponse est exacte.

=== Question 1

L'écriture scientifique du nombre $45310$ est :

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [*A.* #h(0.3em) $45,31 times 10^3$], [*B.* #h(0.3em) $4,531 times 10^4$], [*C.* #h(0.3em) $4,531 times 10^(-4)$], [*D.* #h(0.3em) $4531 times 10^1$],
)

=== Question 2

Une forme développée de l'expression $(4x-3)(4x+3)$ est :

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [*Réponse A*], [*Réponse B*], [*Réponse C*], [*Réponse D*],
  [$4x^2 - 9$], [$16x^2+9$], [$16x^2-9$], [$8x^2-6$],
)

=== Question 3

Un pavé droit a pour dimensions : 4,5 cm de long, 4 cm de large, 10 cm de haut. Le volume de ce pavé est de :

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [*Réponse A*], [*Réponse B*], [*Réponse C*], [*Réponse D*],
  [$180$ cm#super[3]], [$170$ cm#super[3]], [$160,5$ cm#super[3]], [$18,5$ cm#super[3]],
)

=== Question 4

On considère les nombres suivants et on s'intéresse à leur divisibilité par 9.

$ N = 2025 quad "et" quad P = 2026. $

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [*Réponse A*], [*Réponse B*], [*Réponse C*], [*Réponse D*],
  [#text(size: 9pt)[$N$ et $P$ sont tous les deux divisibles par 9]], [#text(size: 9pt)[$N$ est divisible par 9 mais $P$ ne l'est pas]], [#text(size: 9pt)[$P$ est divisible par 9 mais $N$ ne l'est pas]], [#text(size: 9pt)[Aucun des deux n'est divisible par 9]],
)

=== Question 5

Une personne a couru 9 km en 45 minutes.

Quelle est sa vitesse moyenne en km/h ?

=== Question 6

#let wc = 2.2cm
#let wr = 1.76cm

#grid(
  columns: (1.5fr, 1fr),
  gutter: 12pt,
  [
    Une roue de la fortune est utilisée pour faire gagner des cadeaux. La roue est divisée en 10 secteurs de tailles égales, avec les gains suivants : des stylos, des porte-clés, des casques audios ou un smartphone.

    Un joueur tourne la roue une seule fois.

    Quelle est la probabilité que le joueur gagne un casque audio ?
  ],
  [
    #box(width: 4.4cm, height: 4.4cm)[
      #place(dx: wc - wr, dy: wc - wr, circle(radius: wr, fill: none, stroke: 0.6pt))
      #for i in range(10) [
        #let a = 90 + 36 * i
        #place(dx: 0cm, dy: 0cm,
          line(start: (wc, wc), end: (wc + wr * calc.cos(a * 1deg), wc - wr * calc.sin(a * 1deg)), stroke: 0.6pt))
      ]
      #for (a, t) in ((108, "stylo"), (72, "casque"), (36, "porte-clé"), (0, "smartphone"), (-36, "porte-clé"), (-72, "stylo"), (-108, "stylo"), (-144, "casque"), (180, "porte-clé"), (144, "stylo")) [
        #place(dx: wc + 1.21cm * calc.cos(a * 1deg) - 0.35cm, dy: wc - 1.21cm * calc.sin(a * 1deg) - 0.1cm)[#text(size: 6pt)[#t]]
      ]
    ]
  ],
)

=== Question 7

Un article coûte 60 €. Calculer son nouveau prix après une baisse de 10 %.

=== Question 8

#let tx8(x) = (x + 0.5) * 1cm
#let ty8(y) = (3.3 - y) * 1cm

#grid(
  columns: (1.3fr, 1fr),
  gutter: 12pt,
  [
    Quelle est la mesure de l'angle $hat(B A C)$ ?
  ],
  [
    #box(width: 3.3cm, height: 3.5cm)[
      #place(dx: 0cm, dy: 0cm,
        polygon(fill: none, stroke: 0.6pt, (tx8(0), ty8(2.8)), (tx8(0), ty8(0)), (tx8(2.4), ty8(0))))
      #place(dx: tx8(0), dy: ty8(0.24),
        rect(width: 0.24cm, height: 0.24cm, fill: none, stroke: 0.6pt))
      #place(dx: 0cm, dy: 0cm, {
        let pts = range(21).map(i => {
          let a = -90 + (37) * i / 20
          (tx8(0 + 0.64 * calc.cos(a * 1deg)), ty8(2.8 + 0.64 * calc.sin(a * 1deg)))
        })
        curve(stroke: 0.6pt, curve.move(pts.at(0)), ..pts.slice(1).map(p => curve.line(p)))
      })
      #place(dx: tx8(0.35) - 0.15cm, dy: ty8(1.85))[#text(size: 8pt)[$40°$]]
      #place(dx: tx8(0) - 0.15cm, dy: ty8(2.8) - 0.45cm)[$B$]
      #place(dx: tx8(0) - 0.35cm, dy: ty8(0) - 0.05cm)[$C$]
      #place(dx: tx8(2.4) + 0.05cm, dy: ty8(0) - 0.05cm)[$A$]
    ]
  ],
)

=== Question 9

Le diagramme en barres ci-dessous donne les notes des élèves d'une classe au dernier contrôle de mathématiques.

#enum(
  numbering: "a.",
  [Combien d'élèves ont participé à ce contrôle ?],
  [Quelle est la note médiane ?],
)

#let tx9(x) = (x + 1) * 0.9cm
#let ty9(y) = (6.5 - y) * 0.9cm

#align(center)[
  #box(width: 12.2cm, height: 6.75cm)[
    #place(dx: 0cm, dy: 0cm, line(start: (tx9(0), ty9(0)), end: (tx9(0), ty9(6)), stroke: 1pt))
    #place(dx: 0cm, dy: 0cm, line(start: (tx9(0), ty9(0)), end: (tx9(12.5), ty9(0)), stroke: 1pt))
    #let bars = ((1,3),(2,4),(4,4),(5,5),(6,5),(9,3),(11,2),(12,1))
    #for (x, h) in bars [
      #place(dx: tx9(x) - 0.18cm, dy: ty9(h), rect(width: 0.36cm, height: h * 0.9cm, fill: none, stroke: 0.6pt))
    ]
    #for i in range(0, 13) [
      #place(dx: tx9(i) - 0.15cm, dy: ty9(0) + 0.1cm)[#text(size: 7pt)[#(i + 6)]]
    ]
    #for j in range(0, 7) [
      #place(dx: tx9(0) - 0.4cm, dy: ty9(j) - 0.15cm)[#text(size: 7pt)[#j]]
    ]
    #place(dx: tx9(6), dy: ty9(0) + 0.5cm)[#text(size: 8pt)[notes]]
    #place(dx: tx9(0) - 1cm, dy: ty9(3.25))[#rotate(-90deg, reflow: true)[#text(size: 8pt)[effectifs]]]
  ]
]
