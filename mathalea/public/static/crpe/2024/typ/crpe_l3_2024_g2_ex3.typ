// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#grid(
  columns: (3.4cm, 1fr),
  column-gutter: 0.6cm,
  align: (left + horizon, left + horizon),
  [Voici un programme de calcul :],
  box(stroke: 0.6pt, inset: 8pt, width: 8.2cm)[
    Choisir un nombre de départ.\
    Prendre le carré du nombre de départ.\
    Ajouter le triple du nombre de départ.\
    Soustraire 4 au résultat.
  ],
)

#v(0.2cm)

*1.* Montrer que le résultat du programme de calcul est 36 lorsque le nombre de départ choisi est 5.

*2.* Quel résultat obtient-on avec ce programme de calcul en choisissant $display(frac(5, 3))$ pour nombre de départ ?

*3.* On considère le script ci-dessous rédigé avec le logiciel Scratch.

#align(center)[#image("crpe_l3_2024_g2_ex3-scratch.png", width: 14.5cm)]

Recopier et compléter les lignes 4 et 5 du script pour qu'il exécute le programme de calcul. Aucune justification n'est attendue.

*4.*
#sub("a", [On appelle $x$ le nombre de départ. Exprimer en fonction de $x$ le résultat final.])
#sub("b", [Vérifier que ce résultat peut aussi s'écrire sous la forme $(x - 1)(x + 4)$.])
#sub("c", [Écrire et résoudre l'équation qui permet de trouver le(s) nombre(s) à choisir au départ pour obtenir zéro comme résultat.])
