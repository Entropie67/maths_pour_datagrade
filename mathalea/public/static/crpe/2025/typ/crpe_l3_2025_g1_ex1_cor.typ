// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On calcule le prix pour 24 élèves avec chaque organisme.

- Organisme A : $"1 500" + 100 times 24 = "1 500" + "2 400" = "3 900"$ €.
- Organisme B : $"2 000" + 85 times 24 = "2 000" + "2 040" = "4 040"$ €.

Comme $"3 900" < "4 040"$, l'organisme A est le plus avantageux pour 24 élèves.

*2.* *a.* Avec l'organisme A, on paie 1~500 € de base forfaitaire, puis 100 € par élève : pour $x$ élèves, 100 € $times x$. Avec l'organisme B, c'est 2~000 € de base forfaitaire, puis 85 € par élève.
$ f(x) = "1 500" + 100 x quad "et" quad g(x) = "2 000" + 85 x. $

#sub[b][On résout $f(x) = "4 300"$ :
$ "1 500" + 100 x &= "4 300" \
100 x &= "4 300" - "1 500" = "2 800" \
x &= frac("2 800", 100) = 28. $
La solution est $x = 28$ : avec l'organisme A, le voyage coûte 4~300 € lorsque 28 élèves sont inscrits.]

#sub[c][L'organisme B est plus avantageux lorsque $g(x) < f(x)$ :
$ "2 000" + 85 x &< "1 500" + 100 x \
"2 000" - "1 500" &< 100 x - 85 x \
500 &< 15 x \
x &> frac(500, 15) = "33,33..." $
Comme $x$ est un nombre entier, il faut $x >= 34$. Vérifions avec les deux valeurs voisines :
- pour 33 élèves : $f(33) = "4 800"$ € et $g(33) = "4 805"$ €, l'organisme A est encore moins cher ;
- pour 34 élèves : $f(34) = "4 900"$ € et $g(34) = "4 890"$ €, l'organisme B devient moins cher.

À partir de *34 élèves*, il est plus avantageux de choisir l'organisme B.]

*3.* *a.* La mairie paie $frac(2, 5)$ du coût total, il reste donc $1 - frac(2, 5) = frac(3, 5)$ du coût total.

La coopérative prend à sa charge 50 %, c'est-à-dire la moitié, de ce reste : $frac(1, 2) times frac(3, 5) = frac(3, 10)$.

Les familles paient ce qui reste après la mairie et la coopérative :
$ frac(3, 5) - frac(3, 10) = frac(6, 10) - frac(3, 10) = frac(3, 10). $

Les familles prennent en charge $display(frac(3, 10))$ du coût total (fraction irréductible, car 3 et 10 n'ont pas de diviseur commun autre que 1).

#sub[b][Avec l'organisme B et 44 élèves, le coût total est $g(44) = "2 000" + 85 times 44 = "2 000" + "3 740" = "5 740"$ €.

La coopérative finance $frac(3, 10)$ de ce coût : $frac(3, 10) times "5 740" = "1 722"$ €.

Le montant par élève est $"1 722" div 44 = "39,13..."$ €.

La coopérative finance environ *39 €* par élève.]
