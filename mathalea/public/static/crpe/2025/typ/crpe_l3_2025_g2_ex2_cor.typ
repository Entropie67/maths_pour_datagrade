#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Pour fabriquer 1 L de crème, on utilise 8 L de lait : le volume passe de 8 L à 1 L. La diminution est de $8 - 1 = 7$ L. La réduction en pourcentage est
$ frac(7, 8) = "0,875" = "87,5" % . $
La réduction du volume est bien de 87,5~%.

*2.* Chaque jour, les 248 vaches fournissent $248 times 30 = "7 440"$ L de lait.

Avec 8 L de lait, on fabrique 1 L de crème : on obtient $"7 440" div 8 = 930$ L de crème.

Avec 3 L de crème, on produit 1 kg de beurre : on obtient $930 div 3 = 310$ kg de beurre.

Claire peut espérer fabriquer *310 kg* de beurre par jour.

*3.* #h(0em)

#sub[a][Le volume d'un pavé droit est « longueur $times$ largeur $times$ hauteur » :
$ V = 10 times "6,5" times "3,5" = "227,5 cm"^3. $
Le volume d'une plaquette est de 227,5 cm#super[3].]

#sub[b][La masse d'une plaquette est $m = 250$ g et son volume est $V = "227,5"$ cm#super[3]. Donc
$ rho = frac(250, "227,5") approx "1,099 g/cm"^3. $
Or $1$ g/cm#super[3] est égal à $1$ kg/L (car $1 "L" = "1 000" "cm"^3$ et $1 "kg" = "1 000" "g"$). La masse volumique du beurre est donc d'environ 1,10 kg/L.

Comme $"1,10" > "1,03"$, la masse volumique du beurre est supérieure à celle du lait.]

*4.* #h(0em)

#sub[a][On imagine la plaquette « dépliée » : la surface latérale est un grand rectangle de longueur 10 cm (la longueur de la plaquette) et de hauteur $"6,5" + "3,5" + "6,5" + "3,5" = 20$ cm (le tour de la plaquette), auquel on ajoute les deux extrémités de 6,5 cm sur 3,5 cm. Tout ce « patron » tient dans la feuille de 23 cm sur 20 cm :

#align(center)[
  #ctz-canvas(length: 0.26cm, {
    let s = black + 0.7pt
    // Feuille de papier alimentaire : 23 cm sur 20 cm
    cetz.draw.rect((0, 0), (23, 20), stroke: black + 1pt)
    // Surface latérale : 10 cm sur 20 cm, découpée en quatre bandes
    cetz.draw.rect((6.5, 0), (16.5, 20), stroke: s, fill: luma(235))
    for y in (3.5, 10, 13.5) {
      cetz.draw.line((6.5, y), (16.5, y), stroke: s)
    }
    // Extrémités de la plaquette : 6,5 cm sur 3,5 cm
    cetz.draw.rect((3, 3.5), (6.5, 10), stroke: s, fill: luma(235))
    cetz.draw.rect((16.5, 13.5), (20, 20), stroke: s, fill: luma(235))
    ctz-draw-text(11.5, 1.75, [3,5])
    ctz-draw-text(11.5, 6.75, [6,5])
    ctz-draw-text(11.5, 11.75, [3,5])
    ctz-draw-text(11.5, 16.75, [6,5])
    ctz-draw-text(11.5, 21.3, [10 cm])
    ctz-draw-text(27, 10, [20 cm])
    ctz-draw-text(11.5, -1.3, [23 cm])
  })
]

La feuille permet donc d'emballer la plaquette.]

#sub[b][L'aire totale du pavé droit est la somme de l'aire de ses six faces, qui sont trois paires de rectangles identiques :
$ A = 2 times (10 times "6,5") + 2 times (10 times "3,5") + 2 times ("6,5" times "3,5") = 130 + 70 + "45,5" = "245,5 cm"^2. $
L'aire totale de la plaquette est de 245,5 cm#super[2].]

#sub[c][L'aire de la feuille est $23 times 20 = 460$ cm#super[2]. Calculons le pourcentage que représente $A$ :
$ frac("245,5", 460) approx "0,534" = "53,4" % . $
(Autre méthode : 60~% de 460 cm#super[2] font $"0,6" times 460 = 276$ cm#super[2], et $"245,5" < 276$.)

Comme $"53,4 %" < "60 %"$, Claire n'a pas raison : l'aire $A$ représente environ 53,4~% de l'aire de la feuille, soit moins de 60~%.]

*5.* #h(0em)

#sub[a][Le total des plaquettes vendues est la somme des cellules B3 à B8. On saisit en B9 la formule
#align(center)[#raw("=SOMME(B3:B8)")]
(on obtient 36~365 plaquettes).]

#sub[b][Le prix total pour la ligne 3 est le nombre de plaquettes vendues (cellule B3) multiplié par le prix d'une plaquette, 2,5 €. On saisit en C3 la formule
#align(center)[#raw("=B3*2,5")]
puis on la recopie vers le bas : en C4, elle devient #raw("=B4*2,5"), etc.]
