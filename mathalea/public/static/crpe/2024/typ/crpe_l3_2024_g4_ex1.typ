// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Pour chacune des affirmations suivantes, dire si elle est vraie ou fausse en justifiant la réponse.

_Une réponse sans justification ne sera pas prise en considération lors de la correction._

#grid(
  columns: (1fr, 8.4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    *1.* La répartition des salaires mensuels des employés d'une entreprise est présentée dans le diagramme en barres ci-contre.

    *Affirmation 1 :* le salaire médian dans cette entreprise est de 1~800~€.
  ],
  [#image("crpe_l3_2024_g4_ex1-diagramme.png", width: 100%)],
)

*2.* *Affirmation 2 :* le quotient d'un nombre décimal par un nombre décimal non nul est un nombre décimal.

*3.* Paul mange les deux cinquièmes d'un paquet de 40 gâteaux. Il donne les trois huitièmes de ce qu'il reste à sa sœur.

*Affirmation 3 :* Paul a donné 15 gâteaux à sa sœur.

*4.* Soient $a$ et $b$ deux nombres entiers. On effectue la division euclidienne du nombre $a$ par 13 : le reste obtenu est 9. On effectue la division euclidienne du nombre $b$ par 13 : le reste obtenu est 4.

*Affirmation 4 :* le nombre $a + b$ est divisible par 13.

*5.* *Affirmation 5 :* l'image par une fonction linéaire de la somme de deux nombres est égale à la somme des images de ces deux nombres.
