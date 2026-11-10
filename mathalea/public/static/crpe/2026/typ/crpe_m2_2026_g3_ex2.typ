#grid(
  columns: (1fr, 8.4cm),
  column-gutter: 0.4cm,
  align: horizon,
  [
    Une régate est organisée au large des îles Chausey dans la Manche et est modélisée par la figure ci-contre.

    Les points $C$, $G$ et $R$ représentent respectivement les phares des îles Chausey, de Granville et de Regnéville.

    Les deux bouées représentées par les points $B_1$ et $B_2$ sont placées de sorte que :
    - le triangle $C B_1 B_2$ soit rectangle en $B_1$ ;
    - les points $G$, $C$, $B_1$ soient alignés ;
    - les points $R$, $C$, $B_2$ soient alignés.

    À vol d'oiseau, il y a 20 km entre les phares de Granville et de Regnéville, 15 km entre les phares des îles Chausey et de Granville, 25 km entre les phares des îles Chausey et de Regnéville. Les deux bouées sont distantes de 12 km.
  ],
  [#image("crpe_m2_2026_g3_ex2-carte.png", width: 8.4cm)],
)

*Partie A*

#pad(left: 1.2em)[
  *1.* Montrer que le triangle $R G C$ est un triangle rectangle.
]

La régate débute et se termine au phare de Granville. Elle suit la ligne brisée $G C B_1 B_2 C R G$ dans le sens des flèches indiquées sur la figure.

#pad(left: 1.2em)[
  *2.* Démontrer que la longueur du parcours de la régate est égale à 96 km.

  *3.* Calculer la distance en cm, arrondie au mm, entre les points $R$ et $G$ sur un plan à l'échelle $1 / "150 000"$.
]

*Partie B*

Trois bateaux débutent la régate en même temps à 8h30. On considère que les bateaux suivent des trajectoires rectilignes entre chaque bouée. Voici les informations recueillies pour les trois bateaux :

#align(center)[
  #table(
    columns: (1fr, 1fr, 1fr),
    align: center + horizon,
    inset: 6pt,
    [*Bateau A*], [*Bateau B*], [*Bateau C*],
    [Heure d'arrivée : 14h54], [Vitesse moyenne de 3,9 m/s], [Vitesse moyenne de 14,5 km/h],
  )
]

#pad(left: 1.2em)[
  *1.* Calculer la vitesse moyenne du bateau A en km/h.

  *2.* Déterminer le classement final.

  *3.* Quelle est l'heure d'arrivée du bateau B, en heures et en minutes ? On arrondira le résultat à la minute.
]

*Partie C*

La durée écoulée entre deux signaux consécutifs est de 12 secondes pour le phare de Granville et de 18 secondes pour le phare des îles Chausey. À 8h30, les phares de Granville et des îles Chausey ont émis au même instant un signal lumineux. Quelle est la durée minimale nécessaire pour que les deux signaux lumineux soient de nouveau émis simultanément ?
