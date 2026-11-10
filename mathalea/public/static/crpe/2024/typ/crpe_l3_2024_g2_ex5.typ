// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

Pour chacune des affirmations suivantes, dire si elle est vraie ou fausse en justifiant la réponse.

_Une réponse sans justification ne sera pas prise en considération lors de la correction._

*1.* Le nombre 1,63 est un nombre rationnel.

*2.* Tout nombre réel $x$ vérifiant $x < -4$ appartient à l'intervalle #box($] -infinity ; -6 ]$).

#grid(
  columns: (1fr, 4.4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [*3.* Le croquis ci-contre représente un carré.],
  [#image("crpe_l3_2024_g2_ex5-carre.png", width: 3.6cm)],
)

*Partie B*

Pour chacune des questions ci-dessous, plusieurs réponses sont proposées, une seule est exacte. Pour chaque question, écrire sur la copie la lettre correspondant à la bonne réponse.

_Aucune justification n'est attendue._

#align(center)[
  #table(
    columns: (0.6cm, 1fr, 2.5cm, 2.5cm, 2.5cm, 2.5cm),
    align: (center + horizon, left + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
    inset: 6pt,
    stroke: 0.5pt,
    [], [], [*A*], [*B*], [*C*], [*D*],
    [1.], [L'équation $7 x - 9 = 0$ a pour solution], [$"1,29"$], [$-"1,29"$], [$display(frac(9, 7))$], [$display(frac(7, 9))$],
    [2.], [L'inéquation $5 - 4 x >= 0$ a pour solutions les nombres $x$ tels que], [$x >= -"1,25"$], [$x >= "1,25"$], [$x <= "0,8"$], [$x <= "1,25"$],
    [3.], [On considère ce problème : _Zoé a 7 crayons de plus que Léa. À elles deux, elles en ont 31._ Soit $x$ le nombre de crayons de Zoé. Une équation qui permet de calculer le nombre de crayons de Zoé est :], [$2 x - 7 = 31$], [$2 x + 7 = 31$], [$31 - 2 x = 7$], [$x + 7 = 31$],
    [4.], [On considère le problème suivant : _Si on me retranche 5, puis on multiplie le résultat par 2, le résultat est strictement supérieur à mon quadruple. Qui suis-je ?_ Soit $x$ le nombre cherché. Une inéquation qui permet de traduire ce problème est :], [$x - 5 times 2 > 4 x$], [$2 x - 5 > 4 x$], [$x - 5 > 2 x$], [$2 x - 10 > 4$],
  )
]
