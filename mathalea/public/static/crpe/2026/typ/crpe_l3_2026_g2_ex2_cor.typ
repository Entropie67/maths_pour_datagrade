#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On applique le programme A en partant de $-5$ :

- Choisir un nombre : $-5$ ;
- Ajouter 4 : $-5 + 4 = -1$ ;
- Multiplier par 3 : $-1 times 3 = -3$ ;
- Retrancher 11 : $-3 - 11 = -14$.

On obtient $-14$.

*2.* On remonte le programme B « à l'envers », en partant du résultat $-25$ et en faisant les opérations inverses dans l'ordre inverse :

- le dernier calcul était « ajouter 5 » : on retranche 5, $-25 - 5 = -30$ ;
- l'avant-dernier calcul était « multiplier par $-4$ » : on divise par $-4$, $-30 div (-4) = "7,5"$.

Vérification : $"7,5" times (-4) = -30$, puis $-30 + 5 = -25$ ✓.

Le nombre choisi au départ est $"7,5"$.

*3.* On suit le programme A avec un nombre de départ $x$ :

- Choisir un nombre : $x$ ;
- Ajouter 4 : $x + 4$ ;
- Multiplier par 3 : $3 (x + 4) = 3 x + 12$ (on distribue le 3 : $3 times x + 3 times 4$) ;
- Retrancher 11 : $3 x + 12 - 11 = 3 x + 1$.

Le résultat du programme A est bien égal à $3 x + 1$.

*4.*

#sub("a", [Les représentations graphiques de $f$ et de $g$ sont des droites (ce sont des fonctions affines). Pour tracer une droite, il suffit de calculer les coordonnées de deux points (on en calcule un troisième pour vérifier).

#align(center)[
  #table(
    columns: 4,
    align: center + horizon,
    inset: 6pt,
    [$x$], [$0$], [$1$], [$2$],
    [$f(x) = 3 x + 1$], [$1$], [$4$], [$7$],
    [$g(x) = -4 x + 5$], [$5$], [$1$], [$-3$],
  )
]

On place donc les points $(0 ; 1)$, $(1 ; 4)$, $(2 ; 7)$ pour la droite représentant $f$, et les points $(0 ; 5)$, $(1 ; 1)$, $(2 ; -3)$ pour celle représentant $g$, puis on trace les deux droites.

#align(center)[
  #ctz-canvas(length: 0.6cm, {
    ctz-init()
    cetz.draw.grid((-2, -5), (3, 8), step: 1, stroke: gray.lighten(60%) + 0.4pt)
    cetz.draw.line((-2, 0), (3.2, 0), stroke: black + 0.8pt)
    cetz.draw.line((0, -5), (0, 8.2), stroke: black + 0.8pt)
    for x in range(-2, 4) {
      if x != 0 { ctz-draw-text(x, -0.8, $#x$) }
    }
    for y in range(-5, 9) {
      if y != 0 { ctz-draw-text(-0.65, y, $#y$) }
    }
    ctz-draw-text(-0.5, -0.5, $0$)
    // f(x) = 3x + 1
    cetz.draw.line((-2, -5), (2, 7), stroke: blue + 1pt)
    ctz-draw-text(2.5, 7, $C_f$)
    // g(x) = -4x + 5
    cetz.draw.line((-0.75, 8), (2.5, -5), stroke: red + 1pt)
    ctz-draw-text(-1.3, 8, $C_g$)
    // traits de construction pour la question b
    cetz.draw.line((0, -3), (2, -3), stroke: (paint: black, dash: "dashed", thickness: 0.6pt))
    cetz.draw.line((2, -3), (2, 0), stroke: (paint: black, dash: "dashed", thickness: 0.6pt))
  })
]

#text(size: 9pt, style: "italic")[(Figure réduite : l'unité est 1 cm en vraie grandeur.)]])

#sub("b", [On cherche l'antécédent de $-3$ par $g$, c'est-à-dire le nombre $x$ tel que $g(x) = -3$. Sur le graphique, on part de l'ordonnée $-3$ sur l'axe vertical, on trace vers la droite une ligne horizontale jusqu'à la droite $C_g$, puis on descend (ou on monte) verticalement jusqu'à l'axe horizontal : on lit $x = 2$ (traits en pointillés sur la figure).

On le vérifie par le calcul : $g(2) = -4 times 2 + 5 = -8 + 5 = -3$ ✓.

L'antécédent de $-3$ par $g$ est $2$.])

#sub("c", [Le point d'intersection des deux droites est le point dont l'abscisse $x$ donne la même image par $f$ et par $g$, donc
$ 3 x + 1 = -4 x + 5. $
On regroupe les $x$ d'un côté en ajoutant $4 x$ aux deux membres : $3 x + 4 x + 1 = 5$, soit $7 x + 1 = 5$. On retranche 1 aux deux membres : $7 x = 4$. On divise par 7 :
$ x = display(frac(4, 7)). $

*Interprétation :* $f(x)$ est le résultat du programme A et $g(x)$ celui du programme B. L'abscisse $display(frac(4, 7))$ est donc le nombre à choisir au départ pour que les deux programmes donnent le *même résultat*. Ce résultat commun est $f(display(frac(4, 7))) = 3 times display(frac(4, 7)) + 1 = display(frac(19, 7))$.])
