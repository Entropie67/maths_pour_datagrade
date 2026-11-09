// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.*
#sub("a", [On modélise la situation par un arbre dans lequel la première carte tirée correspond au chiffre des centaines, la deuxième au chiffre des dizaines et la troisième au chiffre des unités. Les résultats possibles sont 345 ; 354 ; 435 ; 453 ; 534 et 543.])

#sub("b", [Le sac est opaque et les cartes sont indiscernables au toucher : on est dans une situation d'équiprobabilité. On a 2 nombres pairs (354 et 534) sur les 6 issues possibles.

$ P("obtenir un nombre pair") = "nombre d'issues favorables" / "nombre d'issues possibles" = 2 / 6 = 1 / 3 $

La probabilité d'obtenir un nombre pair est de $display(frac(1, 3))$.])

#sub("c", [On a 2 nombres multiples de 5 (345 et 435), et donc 4 nombres qui ne sont pas multiples de 5 sur les 6 issues possibles.

$ P("ne pas obtenir un multiple de 5") = 4 / 6 = 2 / 3 $

La probabilité de ne pas obtenir un multiple de 5 est de $display(frac(2, 3))$.])

#sub("d", [À l'issue de l'expérience, les trois cartes sont tirées, seul l'ordre change. Tous les nombres obtenus sont donc formés d'un 3, d'un 4 et d'un 5. Or, $3 + 4 + 5 = 12$ est un multiple de 3 : tous les nombres obtenus sont donc divisibles par 3.

$ P("obtenir un nombre divisible par 3") = 6 / 6 = 1 $

La probabilité d'obtenir un nombre divisible par 3 est de 1.])

*2.*
#sub("a", [On modélise la situation par un tableau à double entrée. La première colonne correspond à la première carte tirée (chiffre des dizaines) et la première ligne à la seconde carte tirée (chiffre des unités). La situation est équiprobable.

#align(center)[
  #table(
    columns: 4,
    align: center + horizon,
    inset: 5pt,
    stroke: 0.5pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [], [3], [4], [5],
    [3], [33], [34], [35],
    [4], [43], [44], [45],
    [5], [53], [54], [55],
  )
]

Il y a 3 nombres dont les deux chiffres sont identiques (33 ; 44 et 55) sur un total de 9 issues possibles.

$ P("les deux chiffres sont identiques") = 3 / 9 = 1 / 3 $

La probabilité d'obtenir un nombre dont les deux chiffres sont identiques est de $display(frac(1, 3))$.])

#sub("b", [Parmi les 9 issues possibles, seuls 45 et 54 sont des multiples de 9.

$ P("obtenir un multiple de 9") = 2 / 9 $

La probabilité d'obtenir un multiple de 9 est de $display(frac(2, 9))$.])

#sub("c", [On a 3 issues inférieures ou égales à 40 : 33 ; 34 et 35.

$ P("obtenir un nombre inférieur ou égal à 40") = 3 / 9 = 1 / 3 $

La probabilité d'obtenir un nombre inférieur ou égal à 40 est de $display(frac(1, 3))$.])

*Partie B*

*1.* La proportion de boules rouges est de $1 / 4$ et il y a deux fois moins de boules jaunes que de boules rouges. La proportion de boules jaunes est donc de :

$ 1 / 2 times 1 / 4 = 1 / 8 $

La probabilité que la boule tirée soit de couleur jaune est de $display(frac(1, 8))$.

*2.* Soit $b$, $j$ et $r$ les probabilités que la boule tirée soit respectivement bleue, jaune et rouge. La somme des probabilités de toutes les éventualités est égale à 1 :

$ b + r + j = 1 $

$ b + 1 / 4 + 1 / 8 = 1 $

$ b + 3 / 8 = 1 $

$ b = 1 - 3 / 8 = 5 / 8 $

La probabilité que la boule tirée soit de couleur bleue est de $display(frac(5, 8))$.

*3.* Les boules rouges sont deux fois plus nombreuses que les boules jaunes : il y a donc $2 times 7 = 14$ boules rouges.

La proportion de boules jaunes est de $1 / 8$ et celle des boules bleues de $5 / 8$ : il y a donc 5 fois plus de boules bleues que de boules jaunes, soit $5 times 7 = 35$ boules bleues.

Dans le sac, il y a 35 boules bleues, 14 boules rouges et 7 boules jaunes.
