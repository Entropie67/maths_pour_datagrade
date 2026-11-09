// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On applique les étapes du programme au nombre 5 :

- choisir un nombre : 5 ;
- prendre le carré du nombre de départ : $5^2 = 25$ ;
- ajouter le triple du nombre de départ : $25 + 3 times 5 = 25 + 15 = 40$ ;
- soustraire 4 au résultat : $40 - 4 = 36$.

Avec le nombre 5 choisi au départ, le programme de calcul donne bien 36.

*2.* On applique les étapes du programme au nombre $display(frac(5, 3))$ :

- choisir un nombre : $display(frac(5, 3))$ ;
- prendre le carré du nombre de départ : $(display(frac(5, 3)))^2 = display(frac(25, 9))$ ;
- ajouter le triple du nombre de départ : $display(frac(25, 9)) + 3 times display(frac(5, 3)) = display(frac(25, 9)) + display(frac(15, 3)) = display(frac(25, 9)) + display(frac(45, 9)) = display(frac(70, 9))$ ;
- soustraire 4 au résultat : $display(frac(70, 9)) - 4 = display(frac(70, 9)) - display(frac(36, 9)) = display(frac(34, 9))$.

Avec le nombre $display(frac(5, 3))$ choisi au départ, le programme de calcul donne $display(frac(34, 9))$.

*3.* Ligne 4 : on ajoute le triple du nombre, soit « mettre résultat à (résultat + (3 × réponse)) ».

Ligne 5 : on soustrait 4 au résultat, soit « mettre résultat à (résultat − 4) ».

*4.*
#sub("a", [On applique les étapes du programme au nombre $x$ :

- choisir un nombre : $x$ ;
- prendre le carré du nombre de départ : $x^2$ ;
- ajouter le triple du nombre de départ : $x^2 + 3 times x = x^2 + 3 x$ ;
- soustraire 4 au résultat : $x^2 + 3 x - 4$.

Avec le nombre $x$ choisi au départ, le programme de calcul donne $x^2 + 3 x - 4$.])

#sub("b", [On développe $(x - 1)(x + 4)$ :

$ (x - 1)(x + 4) &= x times x + x times 4 - 1 times x - 1 times 4 \
  &= x^2 + 4 x - x - 4 \
  &= x^2 + 3 x - 4 $

On a bien $x^2 + 3 x - 4 = (x - 1)(x + 4)$.])

#sub("c", [On résout l'équation $(x - 1)(x + 4) = 0$. Un produit de facteurs est nul si, et seulement si, l'un des facteurs est nul :

$ x - 1 = 0 quad "ou" quad x + 4 = 0 $

$ x = 1 quad "ou" quad x = -4 $

Les nombres $-4$ et $1$ donnent 0 comme résultat final.])
