*1.* *Affirmation 1 : FAUSSE.*

Contre-exemple : $4$ est divisible par 4 (c'est $4 times 1$), mais $4$ n'est pas divisible par 12. De même $8 = 4 times 2$ n'est pas divisible par 12. (Pour être divisible par 12, un nombre doit être divisible par 3 *et* par 4.)

*2.* *Affirmation 2 : VRAIE.*

On développe le membre de droite. D'abord le produit :
$ (3 x + 1)(8 x - 5) = 3 x times 8 x + 3 x times (-5) + 1 times 8 x + 1 times (-5) = 24 x^2 - 15 x + 8 x - 5 = 24 x^2 - 7 x - 5. $
Ensuite on retranche $(-7 x + 4)$ : le signe moins devant la parenthèse change tous les signes à l'intérieur,
$ 24 x^2 - 7 x - 5 - (-7 x + 4) = 24 x^2 - 7 x - 5 + 7 x - 4 = 24 x^2 - 9. $
On retrouve le membre de gauche : l'égalité est vraie pour tout nombre $x$.

*3.* *Affirmation 3 : VRAIE.*

« $a$ est un multiple de $b$ » signifie qu'il existe un entier $k$ tel que $a = k times b$. De même, « $b$ est un multiple de $c$ » signifie qu'il existe un entier $m$ tel que $b = m times c$. On remplace $b$ :
$ a = k times m times c, quad "donc" quad frac(a, c) = k times m. $
Comme $k$ et $m$ sont des entiers, leur produit $k times m$ est un entier : $display(frac(a, c))$ est un nombre entier.

(Exemple : $24$ est un multiple de $6$, $6$ est un multiple de $3$, et $24 div 3 = 8$.)

*4.* *Affirmation 4 : VRAIE.*

On simplifie d'abord $display(frac(3 500, 56))$ : $56 times "62,5" = 3 500$, donc $3 500 div 56 = "62,5"$. Ainsi
$ frac(3 500, 56 times 10^19) = frac("62,5", 10^19) = "62,5" times 10^(-19). $
Diviser par $10^19$ revient à décaler la virgule de 19 rangs vers la gauche : le résultat s'écrit avec un nombre fini de chiffres après la virgule. C'est donc un nombre décimal (il vaut $"0,00000000000000000625"$).

*5.* *Affirmation 5 : VRAIE.*

Une augmentation de 20~% revient à multiplier par $1 + "0,2" = "1,2"$. Trois augmentations successives multiplient donc le prix par
$ "1,2" times "1,2" times "1,2" = "1,2"^3 = "1,728". $
Multiplier par 1,728, c'est ajouter $"0,728" = "72,8"$~% du prix de départ : l'augmentation globale est bien de 72,8~%.

(Exemple : $100$ € devient $120$ €, puis $144$ €, puis $"172,80"$ €.)
