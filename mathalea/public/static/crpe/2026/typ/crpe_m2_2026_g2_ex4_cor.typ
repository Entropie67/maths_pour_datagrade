*1.* On étudie d'abord le bloc « Motif » : le stylo avance de 30 pas puis tourne de $120°$, et cela 3 fois. C'est un *triangle équilatéral de côté 30 pas* (ses angles extérieurs valent $120°$ et $3 times 120° = 360°$). À la fin du bloc, le stylo est revenu à son point de départ, avec la même orientation (vers la droite).

Dans le script, le stylo est en position d'écriture et il répète 6 fois : « Motif » puis « avancer de 30 pas ». Il trace donc, à chaque tour :

- un triangle équilatéral de côté 30 pas, dont la base est sur la ligne horizontale ;
- puis un segment horizontal de 30 pas (le stylo écrit encore), qui prolonge la ligne vers la droite.

Les triangles sont donc espacés d'un segment de 30 pas, et les segments sont tracés : la base de chaque triangle et le segment qui suit forment une ligne continue. Cette description correspond à la *figure 1*. (Figure 2 : il n'y aurait aucun espace entre les triangles, sans « avancer » ; figure 3 : les segments ne seraient pas tracés, le stylo serait relevé.)

*2.* Pour obtenir un hexagone formé de six triangles équilatéraux autour d'un même point (le point de départ), il faut que le stylo, après chaque triangle, ne se déplace pas mais pivote autour du point de départ. Les six triangles remplissent un tour complet autour de ce point, donc chaque rotation vaut
$ 360° div 6 = 60°. $

À la ligne 8, on remplace « avancer de 30 pas » par « *tourner de 60 degrés* ».
