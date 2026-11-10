// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Soit $x$ le nombre de vidéos téléchargées. Le coût étant de 0,70~€ par vidéo téléchargée, la fonction $f$ donnant le coût total en euros est donnée par $f(x) = "0,70" x$.

*2.*
#sub("a", [Si on soustrait le montant de l'abonnement forfaitaire de 13~€ au prix total payé, on obtient le montant payé pour les 142 téléchargements. Il suffit ensuite de diviser ce montant par 142 :

$ "98,20" - 13 = "85,20" $

$ "85,20" / 142 = "0,60" $

Le montant fixe d'un téléchargement est de 0,60~€.])

#sub("b", [Calcul de $g(4)$ :

$ g(4) = 3 / 5 times 4 + 13 = 12 / 5 + 65 / 5 = 77 / 5 $

L'image de 4 par la fonction $g$ vaut $display(frac(77, 5))$, soit 15,4.])

#sub("c", [L'image de 10 par la fonction $g$ représente le prix payé avec l'offre G pour 10 vidéos téléchargées.])

#sub("d", [Trouver le nombre de vidéos pour un prix de 95,20~€ revient à déterminer l'antécédent de 95,20 par $g$ :

$ g(x) = "95,2" $

$ 3 / 5 x + 13 = "95,2" $

$ 3 / 5 x = "95,2" - 13 = "82,2" $

$ x = 5 / 3 times "82,2" = 137 $

L'équipe enseignante de la troisième école a téléchargé 137 vidéos pour un prix de 95,20~€.])

*3.* L'offre G est plus intéressante que l'offre F lorsque son coût est inférieur à celui de l'offre F, c'est-à-dire lorsque $g(x) < f(x)$ :

$ 3 / 5 x + 13 < "0,7" x $

$ "0,6" x + 13 < "0,7" x $

$ 13 < "0,7" x - "0,6" x $

$ 13 < "0,1" x $

$ 13 / "0,1" < x $

$ 130 < x $

L'offre G devient plus intéressante que l'offre F à partir de 131 vidéos téléchargées.

*4.*
#sub("a", [Dans la cellule B2, on peut entrer la formule `=0,7*B1`, puis l'étirer sur la ligne.

Remarque : les valeurs de la ligne 2 de l'énoncé (43 ; 73 ; 103…) correspondent en fait à l'offre G ($"0,6" times 50 + 13 = 43$, par exemple). Pour l'offre F, le tableau aurait dû afficher 35 ; 70 ; 105 ; 140 ; 175.])

#sub("b", [Une réduction de 20~% correspond à un coefficient multiplicateur de $1 - 20 / 100 = "0,8"$. Pour calculer la dépense avec le tarif promotionnel, il faut donc multiplier le prix normal, donné par la fonction $g$, par 0,8 :

$ "0,8" times g(x) = "0,8" times ("0,6" x + 13) = "0,48" x + "10,4" $

Dans la cellule B3, on peut saisir la formule `=0,48*B1+10,4`.])
