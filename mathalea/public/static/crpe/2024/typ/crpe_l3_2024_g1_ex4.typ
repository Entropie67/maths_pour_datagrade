// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#align(center)[#image("crpe_l3_2024_g1_ex4-piste.png", width: 9cm)]

Une enseignante entraîne les élèves de sa classe de CM1 à la course longue sur une piste d'une longueur totale de 200~m ayant la forme ci-dessus.

*Partie A*

Afin d'aider les élèves dans le relevé de leur performance, l'enseignante dispose huit plots équidistants tout au long de la piste. Les élèves forment des binômes et se répartissent les rôles : l'un d'entre eux court, l'autre l'observe et note la distance parcourue puis ils inversent leurs rôles.

L'enseignante demande aux élèves de courir pendant 5 minutes et de compléter la fiche suivante. La distance retenue est la distance entre le point de départ et le dernier plot franchi. Voici les résultats d'un binôme :

#align(center)[
  #table(
    columns: (3cm, 4.2cm, 4.8cm, 3.8cm),
    align: (left + horizon, center + horizon, center + horizon, center + horizon),
    inset: 5pt,
    fill: (x, y) => if y == 0 { luma(220) },
    [*Prénom*], [*Nombre de tours complets parcourus*], [*Nombre de plots franchis dans le tour incomplet*], [*Distance parcourue (en m)*],
    [Lola], [4], [1], [825],
    [Joris], [3], [4], [700],
  )
]

*1.*
#sub("a", [Justifier que Lola a bien parcouru la distance affichée dans le tableau.])
#sub("b", [Déterminer sa vitesse moyenne en m/min.])

*2.* Déterminer la vitesse moyenne de Joris en km/h.

*3.* Exprimer, en pourcentage arrondi à l'unité, la distance supplémentaire parcourue par Lola par rapport à celle parcourue par Joris.

*Partie B*

L'enseignante utilise un tableur pour calculer la distance parcourue et la vitesse moyenne de chaque élève de la classe.

#align(center)[#image("crpe_l3_2024_g1_ex4-tableur.png", width: 15.5cm)]

*1.* Donner une formule qui peut être saisie dans la cellule D2 puis recopiée vers le bas pour obtenir le tableau complété.

*2.* Donner une formule qui peut être saisie dans la cellule E2 puis recopiée vers le bas pour obtenir le tableau complété.

*3.* L'enseignante rassemble les résultats des distances parcourues par les élèves dans le tableau ci-dessous.

#align(center)[
  #table(
    columns: (3.4cm, ..range(10).map(_ => 1fr)),
    align: center + horizon,
    inset: 4pt,
    fill: (x, y) => if x == 0 { luma(220) },
    [Distance parcourue (m)], [550], [575], [625], [650], [675], [700], [750], [775], [825], [850],
    [Effectif], [2], [1], [4], [2], [3], [6], [1], [3], [2], [1],
  )
]

Déterminer la distance moyenne parcourue par les élèves de cette classe.

*Partie C*

#grid(
  columns: (1fr, 6.6cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    La piste est représentée par le trait continu sur le schéma ci-contre.

    Elle a été obtenue à partir d'un rectangle et de deux demi-cercles dont les diamètres sont égaux à la largeur du rectangle.

    Le format du rectangle, c'est-à-dire le quotient $display(frac("longueur du rectangle", "largeur du rectangle"))$, est égal à $display(frac(5, 3))$.

    *1.* Dans cette question, on suppose que la longueur du rectangle est de 20~m.
    #sub("a", [Montrer que la largeur du rectangle est alors de 12~m.])
    #sub("b", [Déterminer un arrondi au mètre de la longueur de la piste.])

    *2.* Déterminer la longueur et la largeur du rectangle afin que la piste ait une longueur totale de 200~m. Arrondir au centimètre chaque dimension.
  ],
  [#image("crpe_l3_2024_g1_ex4-piste2.png", width: 100%)],
)
