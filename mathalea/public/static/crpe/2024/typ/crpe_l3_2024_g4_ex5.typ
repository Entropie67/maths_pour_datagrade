// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#grid(
  columns: (1fr, 4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [Dans le cadre d'un travail en géométrie dans une classe de CM2, une enseignante présente le pavage ci-contre que l'on trouve dans quelques rues de la ville du Caire.],
  [#image("crpe_l3_2024_g4_ex5-pavage.png", width: 100%)],
)

*1.* *Étude du pavage*

#grid(
  columns: (1fr, 6.6cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    L'hexagone de la _figure 1_ représente le motif de base du pavage. Il est construit à partir du pentagone $A B C D E$ noté $M$. Les pentagones notés $M$, $M_1$, $M_2$ et $M_3$ sont superposables.

    #sub("a", [Par quelle transformation peut-on obtenir le motif $M_3$ à partir du motif élémentaire $M$ ? En préciser les caractéristiques.])
    #sub("b", [Par quelle transformation peut-on obtenir le motif $M_1$ à partir du motif élémentaire $M$ ? En préciser les caractéristiques.])
  ],
  [#image("crpe_l3_2024_g4_ex5-figure1.png", width: 100%)],
)

*2.* *Calcul des angles du pentagone*

Les cinq côtés du pentagone $A B C D E$ (_figure 2_) ont la même longueur. Les angles $hat(A B C)$ et $hat(A E D)$ sont droits.

On donne $A B = 5$~cm.

#align(center)[#image("crpe_l3_2024_g4_ex5-figure2.png", width: 9cm)]

#sub("a", [Déterminer la mesure de l'angle $hat(C A B)$ en justifiant.])
#sub("b", [On admet que $hat(C A D) = 41°$. Déterminer la mesure des cinq angles du pentagone $A B C D E$.])
#sub("c", [Quelle est la somme des angles du pentagone $A B C D E$ ?])
#sub("d", [Démontrer que la somme des angles d'un pentagone simple est égale à $540°$.

_On appelle pentagone simple un pentagone qui n'est pas un polygone croisé._])
