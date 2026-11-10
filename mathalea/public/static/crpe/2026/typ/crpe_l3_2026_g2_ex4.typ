*Partie A*

Lors des Jeux Olympiques d'été de Paris en 2024, 63 pays ont reçu au moins une médaille d'or. Leur répartition est donnée dans le tableau ci-dessous.

#let valeurs = ("1", "2", "3", "4", "5", "6", "8", "9", "10", "12", "13", "14", "15", "16", "18", "20", "40")
#let effectifs = ("23", "12", "9", "4", "1", "1", "1", "1", "1", "2", "1", "1", "1", "1", "1", "1", "2")

#align(center)[
  #table(
    columns: (auto, ..range(17).map(_ => 1fr)),
    align: (left + horizon, ..range(17).map(_ => center + horizon)),
    inset: 5pt,
    [*Médailles d'or obtenues*], ..valeurs,
    [*Nombre de pays*], ..effectifs,
  )
]

*1.* Calculer pour ces 63 pays le nombre moyen, arrondi au dixième, de médailles d'or reçues par pays.

*2.* Le Canada a obtenu 9 médailles d'or. Ce nombre est-il supérieur à la médiane de la série statistique donnée par le tableau des médailles ?

*Partie B :* Les médailles d'or distribuées lors de ces Jeux Olympiques pèsent 529 grammes et sont faites en argent recouvert d'une fine pellicule d'or pur. La masse d'or pur représente 1,13 % de la masse totale de la médaille.

Calculer la masse d'or pur, en gramme, contenue dans une médaille. Le résultat sera donné à l'unité près.

*Partie C :* Les médailles distribuées à Paris contenaient un insert en fer de la Tour Eiffel. Cet insert avait la forme d'un hexagone régulier que l'on souhaite tracer à l'aide du logiciel Scratch en choisissant une longueur de chaque côté de 50 pas.

#grid(
  columns: (1fr, 1fr),
  column-gutter: 0.5cm,
  align: horizon,
  [#image("crpe_l3_2026_g2_ex4-medaille.png", width: 100%)],
  [#image("crpe_l3_2026_g2_ex4-hexagone.png", width: 70%)],
)

#v(0.4cm)

#grid(
  columns: (1fr, 5.5cm),
  column-gutter: 0.5cm,
  [
    Nina a créé le script ci-contre. Cependant, ce script ne construit pas l'hexagone demandé.

    Indiquer la correction à faire dans la boucle. Aucune justification n'est attendue.

    _On rappelle que l'instruction « s'orienter à 0 » permet d'orienter le stylo vers le haut._
  ],
  align(horizon)[#image("crpe_l3_2026_g2_ex4-scratch.png", width: 5.5cm)],
)
