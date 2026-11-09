*1.* Dans un parallélogramme, deux angles consécutifs (qui se suivent sur un côté) sont *supplémentaires* : leur somme vaut $180°$. L'angle de $30°$ et l'angle $alpha$ sont consécutifs, donc
$ alpha = 180° - 30° = 150°. $

L'angle $alpha$ mesure donc $150°$.

*2.* Le stylo part vers la droite. On trace le motif côté par côté : le script « Motif » est répété 2 fois (un parallélogramme a deux paires de côtés égaux). Dans chaque répétition, le stylo :

+ avance de 50 pas (le côté du bas) : étiquette *B* ;
+ tourne vers la gauche de $30°$ pour se diriger vers le côté oblique (en haut à droite) : étiquette *D* ;
+ avance de 40 pas (le côté oblique) : étiquette *A* ;
+ tourne vers la gauche de $150°$ pour partir en sens inverse du premier côté (vers la gauche) : étiquette *C*.

En répétant deux fois cette séquence, le stylo est revenu au point de départ avec la direction de départ : il a tourné de $2 times (30° + 150°) = 360°$, un tour complet.

L'ordre est *B, D, A, C*, et la valeur manquante de l'étiquette C est *150*.

*3.* *Programme 1 → Figure A.* Dans ce programme, à chaque tour de boucle, le stylo dessine le parallélogramme (« Motif »), qui le ramène à son point de départ (le centre, de coordonnées $(0 ; 0)$), puis il tourne de $30°$ ; cela se répète 12 fois ($12 times 30° = 360°$). On obtient 12 parallélogrammes, tous issus du centre : c'est la figure A.

*Programme 2 → Figure C.* À chaque tour de boucle, le stylo avance d'abord de 40 pas, trace le motif à ce nouveau point, puis tourne de $30°$ : les points de départ des parallélogrammes décrivent un polygone régulier à 12 côtés (de côté 40 pas), et les parallélogrammes sont dessinés à l'extérieur de ce polygone. Le stylo part du point O : c'est la figure C.
