
Dans cet exercice, $x$ représente un nombre supérieur ou égal à 5.

Voici, ci-dessous, deux figures géométriques : un rectangle $A B C D$ et un triangle isocèle $I J K$.

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    #ctz-canvas(length: 0.8cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(A: (0, 0), B: (5, 0), C: (5, -2), D: (0, -2))
      ctz-def-polygon("ABCD", "A", "B", "C", "D")
      ctz-draw-polygon("ABCD")
      ctz-draw-segment("A", "B", stroke: black + 1pt)
      ctz-draw-segment((rel: (-1, 0), to: "A"), (rel: (-1, 0), to: "D"), arrows: "<->")
      ctz-draw-text(-1.2, -1, $x-2$, anchor:"east")
      ctz-draw-segment((rel: (0, 1), to: "A"), (rel: (0, 1), to: "B"), arrows: "<->")
      ctz-draw-text(2.5, 1.2, $3x + 1$, anchor:"south")
      ctz-draw-mark-right-angle("A", "B", "C")
      ctz-draw-mark-right-angle("B", "C", "D")
      ctz-draw-mark-right-angle("C", "D", "A")
      ctz-draw-mark-right-angle("D", "A", "B")
      ctz-draw-labels("A", "B", "C", "D",
        A: (pos: "above left", dist: 0.25),
        B: (pos: "above right"),
        C: (pos: "below right"),
        D: (pos: "below left")
      )
})
  ],
  [
    #ctz-canvas(length: 0.8cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(I: (0, 0), J: (5, 0), K: (2.5, 3))
      ctz-def-polygon("IJK", "I", "J", "K")
      ctz-draw-polygon("IJK")
      ctz-draw-segment((rel: (0, -0.5), to: "I"), (rel: (0, -0.5), to: "J"), arrows: "<->")
      ctz-draw-text(2.5, -0.6, $2x$, anchor: "north")
      ctz-draw-segment((rel: (-0.5, 0.5), to: "I"), (rel: (-0.5, 0.5), to: "K"), arrows: "<->")
      ctz-def-midpoint("M", (rel: (0, -0.5), to: "I"), (rel: (0, -0.5), to: "J"))
      ctz-draw-text(0.5, 2.1, $3x + 1$, anchor:"east")
      ctz-draw-labels("I", "J", "K",
        I: (pos: "above left", dist: 0.25),
        J: (pos: "above right"),
        K: (pos: "above"),
      )
    })
  ],
)

=== Partie A

+ Calculer la longueur $A B$ pour $x = 10$.

  Justifier que le périmètre du rectangle $A B C D$ vaut $78$ pour $x = 10$.
+ Montrer que le périmètre du rectangle $A B C D$, en fonction de $x$, est $8 x - 2$.

=== Partie B

Nour a exprimé, en fonction de $x$, le périmètre du triangle isocèle $I J K$ et a obtenu $6 x + 9$.

Nour souhaite trouver pour quelle valeur de $x$ le périmètre du rectangle $A B C D$ et le périmètre du triangle $I J K$ sont égaux.

Pour cela, Nour a créé le programme Scratch ci-contre qui permet de tester, pour une valeur donnée de $x$, si les périmètres sont égaux :

#align(center)[
  #scratch(language: "fr", "quand le drapeau vert est cliqué
demander [Combien vaut x ?] et attendre ::sensing
mettre [Périmètre ABCD v] à ((8) * (x) - (2)) ::variables
mettre [Périmètre IJK v] à ((6) * (x) + (9)) ::variables
si <(Périmètre ABCD) = (Périmètre IJK)> alors ::control
  dire (Les deux périmètres sont égaux) pendant (2) secondes ::looks
sinon
  dire (Les deux périmètres ne sont pas égaux) pendant (2) secondes ::looks
fin")
]

+ *Question algorithmique*

  Que renvoie le programme si Nour saisit $7$ ?
+ Avec le programme précédent, Nour n'a pas réussi à trouver une valeur exacte de $x$ pour laquelle le périmètre du rectangle et le périmètre du triangle sont égaux.

  - $8 x - 2$ pour le périmètre du rectangle $A B C D$ ;
  - $6 x + 9$ pour le périmètre du triangle isocèle $I J K$.

Voici ci-dessous un extrait de la feuille de calcul dans laquelle Nour a fait afficher le périmètre du rectangle et le périmètre du triangle pour différentes valeurs de $x$.

#align(center)[
    #table(
      columns: 4,
      align: center,
      stroke: 0.6pt,
      [], [*A*], [*B*], [*C*],
      [*1*], [$x$], [Périmètre de $A B C D$], [Périmètre de $I J K$],
      [*2*], [5], [38], [39],
      [*3*], [6], [46], [45],
      [*4*], [7], [54], [51],
      [*5*], [8], [62], [57],
      [*6*], [9], [70], [63],
      [*7*], [10], [78], [69],
      [*8*], [11], [86], [75],
      [*9*], [12], [94], [81],
      [*10*], [13], [102], [87],
    )
  ]

  #enum(
    numbering: "a.",
    [Recopier sur la copie la formule que Nour a saisie dans la cellule *B2* avant de l'étirer vers le bas pour obtenir les résultats affichés.

    #align(center)[
      #table(
        columns: 4,
        align: center,
        stroke: 0.6pt,
        [= 8 #sym.ast.op 5 - 2], [= 8 #sym.ast.op A2 - 2], [= 8 #sym.ast.op B2 - 2], [= 8 #sym.ast.op A1 - 2],
      )
    ]],
    [En observant sa feuille de calcul, Nour affirme : «~S'il existe une valeur de $x$ pour laquelle le périmètre du rectangle $A B C D$ et le périmètre du triangle $I J K$ sont égaux, elle est comprise entre $5$ et $6$.~»

    Expliquer le raisonnement de Nour.

    *Argumenter la réponse en précisant la démarche.*],
  )
+ Comme elle n'a pas obtenu la solution exacte avec les méthodes précédentes, Nour propose de résoudre algébriquement l'équation $8 x - 2 = 6 x + 9$.

  Résoudre cette équation afin de déterminer la valeur exacte de $x$ pour laquelle le périmètre du rectangle et le périmètre du triangle sont égaux.
