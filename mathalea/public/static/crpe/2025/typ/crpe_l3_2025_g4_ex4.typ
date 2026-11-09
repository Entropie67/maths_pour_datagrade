// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

On considère un ensemble de deux dés équilibrés dont voici les patrons.

#align(center)[#image("crpe_l3_2025_g4_ex4-des.png", width: 8cm)]

Le jeu consiste à lancer ces deux dés. Le dé dont le nombre inscrit sur la face supérieure est le plus grand est déclaré gagnant.

*1.* On a simulé 100 lancers des dés A et B. On obtient 54 victoires du dé A. \
Peut-on affirmer que le dé A a une probabilité de 54\u{a0}% de gagner contre le dé B ? Justifier votre réponse.

*2.*
#sub[a][À l'aide d'un tableau à double entrée, décrire l'ensemble des issues de cette expérience aléatoire et identifier, pour chaque issue, le dé gagnant.]
#sub[b][Montrer que la probabilité que le dé B l'emporte sur le dé A est $frac(5, 9)$.]
