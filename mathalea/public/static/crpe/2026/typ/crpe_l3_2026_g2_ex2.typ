#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Voici deux programmes de calcul.

#table(
  columns: (1fr, 1fr),
  align: left + top,
  inset: 7pt,
  [#underline[Programme A]
    - Choisir un nombre
    - Ajouter 4 à ce nombre
    - Multiplier le résultat par 3
    - Retrancher 11 au résultat],
  [#underline[Programme B]
    - Choisir un nombre
    - Multiplier ce nombre par $-4$
    - Ajouter 5 au résultat],
)

*1.* Déterminer le nombre obtenu avec le programme A en choisissant $-5$ comme nombre de départ.

*2.* Déterminer le nombre choisi au départ pour obtenir $-25$ avec le programme B.

*3.* On désigne par $x$ le nombre de départ. Montrer que le résultat du programme A est égal à $3x + 1$.

*4.* On considère les fonctions $f$ et $g$ définies par $f(x) = 3x + 1$ et $g(x) = -4x + 5$.

#sub("a", [Construire, dans un repère, les représentations graphiques des fonctions $f$ et $g$. On prendra comme unité graphique 1 centimètre en abscisse et en ordonnée.])

#sub("b", [Déterminer graphiquement, en laissant les traits de construction, l'antécédent de $-3$ par la fonction $g$.])

#sub("c", [Déterminer algébriquement l'abscisse du point d'intersection des deux représentations graphiques des fonctions $f$ et $g$. Que représente cette valeur pour les programmes A et B ?])
