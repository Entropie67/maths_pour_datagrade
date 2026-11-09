Les trois événements « toucher la planche », « dépasser la planche » et « réussir le saut » sont équiprobables. Ils sont incompatibles et un saut est forcément dans l'un de ces trois cas : chacun a donc pour probabilité $frac(1, 3)$.

Jean-Baptiste « mord » lorsqu'il touche ou dépasse la planche, c'est-à-dire quand le saut n'est pas réussi :
$ P("mordre") = frac(1, 3) + frac(1, 3) = frac(2, 3) quad "et" quad P("réussir") = frac(1, 3). $

Les deux sauts sont indépendants : la probabilité d'enchaîner deux résultats est le produit des probabilités.

*1.* $ P("réussir les deux sauts") = frac(1, 3) times frac(1, 3) = frac(1, 9). $

*2.* $ P("mordre au premier saut et réussir le second") = frac(2, 3) times frac(1, 3) = frac(2, 9). $

*3.* Il « mord » exactement une fois dans deux cas, qui s'excluent :

#pad(left: 1.2em)[
  Il mord au premier saut et réussit le second : $display(frac(2, 3)) times display(frac(1, 3)) = display(frac(2, 9))$. \
  Il réussit le premier saut et mord au second : $display(frac(1, 3)) times display(frac(2, 3)) = display(frac(2, 9))$.
]

$ P("mordre exactement une fois") = frac(2, 9) + frac(2, 9) = frac(4, 9). $

*4.* L'événement contraire de « mordre au moins une fois » est « ne jamais mordre », c'est-à-dire réussir les deux sauts, dont la probabilité est $frac(1, 9)$ (question 1). Donc
$ P("mordre au moins une fois") = 1 - frac(1, 9) = frac(8, 9). $
(On retrouve ce résultat en additionnant la probabilité de mordre deux fois et celle de mordre exactement une fois :)
$ frac(2, 3) times frac(2, 3) + frac(4, 9) = frac(4, 9) + frac(4, 9) = frac(8, 9). $
