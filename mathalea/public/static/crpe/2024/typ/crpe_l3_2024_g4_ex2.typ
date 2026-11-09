// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

_Dans cet exercice, tous les résultats seront donnés sous la forme d'une fraction irréductible._

Une élève joue avec deux dés cubiques (dés à 6 faces numérotées de 1 à 6) non truqués.

Elle lance deux dés. On appelle _paire_ un tirage constitué de deux nombres identiques.

À chaque lancer de deux dés, elle marque des points :
- si elle obtient une paire de 1, elle gagne 1 000 points ;
- si elle obtient une autre paire, elle gagne 100 fois la valeur d'un dé, soit 200 points pour une paire de 2, 300 points pour une paire de 3, etc. ;
- si elle obtient un résultat autre qu'une paire (par exemple 2 sur un des dés et 5 sur l'autre), elle gagne 50 points.

Le jeu se termine lorsque l'on obtient au moins 1 000 points.

*1.* Quelle est la probabilité de terminer le jeu avec un seul lancer ?

*2.* L'élève a réalisé deux lancers et a obtenu exactement 650 points.

#sub("a", [Expliquer l'ensemble des résultats qu'elle a pu obtenir lors de ces deux lancers.])
#sub("b", [Quelle est la probabilité de terminer le jeu avec un troisième lancer ?])
