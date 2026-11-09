*1.* On compare deux étapes qui se suivent.

- À l'étape 1 : 1 carreau. À l'étape 2 : 4 carreaux. À l'étape 3 : 7 carreaux. À l'étape 4 : 10 carreaux.
- En observant les dessins, pour passer d'une étape à la suivante, on ajoute *1 carreau à droite de la ligne du haut*, puis *1 carreau au bout de chacune des deux lignes du dessous* (les deux lignes du bas sont aussi allongées d'un carreau).

Au total, on ajoute donc $1 + 1 + 1 = 3$ carreaux à chaque étape.

On passe d'une étape à la suivante en ajoutant 3 carreaux (1 sur la ligne du haut et 1 sur chacune des deux lignes du bas).

*2.* *Étape 5 :* on ajoute 3 carreaux à l'étape 4, qui en compte 10 : $10 + 3 = 13$ carreaux.

*Étape 20 :* depuis l'étape 1 (1 carreau), on a ajouté 3 carreaux à chacun des $20 - 1 = 19$ passages d'étape :

$ 1 + 19 times 3 = 1 + 57 = 58. $

Le motif de l'étape 5 compte 13 carreaux et celui de l'étape 20 en compte 58.

*3.* Le nombre de carreaux de chaque étape est égal à celui de l'étape précédente augmenté de 3. En B3, le nombre de carreaux de l'étape 2 est donc celui de la cellule du dessus (B2) plus 3.

On saisit en B3 la formule #raw("=B2+3") puis on l'étire vers le bas.

(Autre possibilité, avec la formule trouvée à la question suivante : #raw("=3*A3-2").)

*4.* Le nombre de carreaux de l'étape $n$ s'obtient aussi directement avec le dessin : une ligne de $n$ carreaux, puis deux lignes de $n - 1$ carreaux.

$ n + 2 times (n - 1) = n + 2 n - 2 = 3 n - 2. $

Le motif de l'étape $n$ est composé de $3 n - 2$ carreaux.

(Vérification : $n = 4$ donne $3 times 4 - 2 = 10$ ✓.)

*5.* On cherche si l'équation $3 n - 2 = "nombre donné"$ a une solution entière.

- Pour 100 carreaux : $3 n - 2 = 100$, donc $3 n = 102$, donc $n = 102 div 3 = 34$. C'est un nombre entier : le motif de l'étape 34 est composé d'exactement 100 carreaux.
- Pour 2000 carreaux : $3 n - 2 = 2000$, donc $3 n = 2002$, donc $n = 2002 div 3 = "667,33..."$ Ce n'est pas un nombre entier (on peut aussi dire que 2002 n'est pas divisible par 3, car la somme de ses chiffres, $2 + 0 + 0 + 2 = 4$, n'est pas dans la table de 3). Aucune étape n'est donc composée de 2000 carreaux.

Oui pour 100 carreaux (étape 34), non pour 2000 carreaux.
