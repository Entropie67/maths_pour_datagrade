#import "@preview/ctz-euclide:0.3.0": *

Des élèves participent à un cross dans un parc. Le parcours est décrit sur le schéma ci-contre :

#grid(
  columns: (1fr, 6.8cm),
  column-gutter: 0.4cm,
  [
    Les points $A$, $B$ et $E$ sont alignés. \
    Les points $A$, $C$ et $D$ sont alignés. \
    $A B C$ est un triangle rectangle en $B$. \
    Les longueurs suivantes sont exprimées en mètre : \
    $A E = 15$ ; $A C = 65$ ; $A B = 25$ ; $A D = 39$.
  ],
  align(horizon)[#image("crpe_m2_2026_g1_ex3-plan.png", width: 6.8cm)],
)

#pad(left: 1.2em)[
  *1.* Montrer que la longueur $B C$ est égale à 60 mètres.

  *2.* Montrer que les droites $(B C)$ et $(D E)$ sont parallèles.

  *3.* Calculer la longueur totale du parcours $E B C D E$.

  *4.* Pour baliser le parcours, l'enseignant utilise des plots de hauteur totale 450 millimètres. On modélise chaque plot de la manière suivante :
  - le socle est assimilé à un pavé droit à base carrée dont les dimensions sont données sur la figure ci-dessous ;
  - la partie supérieure, surmontant ce socle, est assimilée à un cône de révolution de hauteur 415 millimètres, et dont le diamètre de la base est de 20 centimètres.
]

#align(center)[#image("crpe_m2_2026_g1_ex3-plots.png", width: 11cm)]

Afin que ces plots ne s'envolent pas, il est nécessaire au préalable de les remplir de sable (socle et partie supérieure).

#align(center)[
  #box(stroke: 0.6pt, inset: 6pt)[On rappelle la formule du volume d'un cône : $V = 1 / 3 times "aire de la base" times "hauteur"$]
]

#pad(left: 1.2em)[
  *a.* Vérifier que le volume de sable permettant de remplir en totalité un plot est de $"6,45"$ dm³, arrondi au centième.

  *b.* Sachant que la densité du sable est d'environ $"1,6"$ tonne par mètre cube, déterminer la masse de sable nécessaire pour remplir un plot. On donnera le résultat en kilogramme, arrondi au dixième.
]
