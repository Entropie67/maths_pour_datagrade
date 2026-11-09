// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Pour chacune des affirmations suivantes, dire si elle est vraie ou fausse en justifiant la réponse.

_Une réponse sans justification ne sera pas prise en considération lors de la correction._

*1.* Affirmation 1 : le nombre $"0,28"$ est un nombre rationnel.

*2.* On considère deux nombres réels strictement positifs $a$ et $b$.\
Affirmation 2 : le quotient de $a$ par $b$ est strictement inférieur au nombre $a$.

*3.* Affirmation 3 : le produit de deux entiers naturels impairs est un entier naturel impair.

#grid(
  columns: (1fr, 6.2cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    *4.* Dans le repère ci-contre, la droite $(d)$ est la représentation graphique d'une fonction affine $f$. La droite $(d)$ passe par les points de coordonnées $(1 ; "0,5")$ et $(0 ; 2)$.

    Affirmation 4 : pour tout nombre réel $x$, $f(x) = 2 x - "1,5"$.
  ],
  [#image("crpe_l3_2024_g1_ex2-repere.png", width: 100%)],
)

#grid(
  columns: (1fr, 5.6cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    *5.* La figure ci-contre n'est pas en vraie grandeur. On a tracé deux cercles de centre $A$ :
    - le cercle $(C_1)$ de rayon 7,8~cm ;
    - le cercle $(C_2)$ de rayon 2,4~cm.

    Le segment $[D E]$ mesure 2,9~cm. Les points $A$, $D$ et $B$ sont alignés. Les points $A$, $E$ et $C$ sont alignés.

    Affirmation 5 : la longueur $B C$ arrondie au millimètre est égale à 9,4~cm.
  ],
  [#image("crpe_l3_2024_g1_ex2-cercles.png", width: 100%)],
)
