*Partie A*

*1.* On exprime les dimensions du rectangle $A B C D$ en fonction de $x$. Le potager est formé de deux carrés identiques de côté $x$ (avec $E I = x$) : $D G = x$ et $D I = 2 x$.

- Largeur du rectangle : $A B = D C = D G + G C = x + 10$.
- Hauteur du rectangle : $A D = A I + I D = 4 + 2 x$.

L'espace de jeux est le rectangle $A B C D$ privé du potager (rectangle de côtés $x$ et $2 x$) :
$ cal(A)_"jeux" = (x + 10)(2 x + 4) - x times 2 x. $
On développe : $(x + 10)(2 x + 4) = 2 x^2 + 4 x + 20 x + 40 = 2 x^2 + 24 x + 40$. Donc
$ cal(A)_"jeux" = 2 x^2 + 24 x + 40 - 2 x^2 = 24 x + 40. $

*2.* *a.* On résout l'équation $24 x + 40 = 94$ :

- on retranche 40 aux deux membres : $24 x = 54$ ;
- on divise par 24 : $x = 54 div 24 = "2,25"$.

On trouve donc $x = "2,25"$ m.

*b.* L'aire du rectangle $A B C D$ est celle de l'espace de jeux plus celle du potager. Le potager est un rectangle de côtés $x = "2,25"$ m et $2 x = "4,5"$ m :
$ cal(A)_"potager" = "2,25" times "4,5" = "10,125" "m"^2. $
$ cal(A)_(A B C D) = 94 + "10,125" = "104,125" "m"^2. $

(Vérification : $(x + 10)(2 x + 4) = "12,25" times "8,5" = "104,125"$ ✓.)

*3.* *a.* Les fraisiers sont plantés en maillage carré à intervalles égaux, et il y en a un à chaque sommet du rectangle $L M N P$. La distance entre deux fraisiers voisins est donc un nombre entier de centimètres qui divise exactement $L M = 185$ cm et $L P = 444$ cm : c'est un *diviseur commun* de 185 et de 444.

On cherche le plus grand diviseur commun avec l'algorithme d'Euclide :

- $444 = 2 times 185 + 74$ ;
- $185 = 2 times 74 + 37$ ;
- $74 = 2 times 37 + 0$.

Le dernier reste non nul est 37 : $"PGCD"(444 ; 185) = 37$. Les diviseurs communs de 185 et 444 sont donc les diviseurs de 37. Comme 37 est un nombre premier, ses seuls diviseurs sont 1 et 37. La règle doit mesurer plus de 10 cm : c'est *37 cm*.

*b.* Sur le côté $[L M]$ : $185 div 37 = 5$ intervalles, donc $5 + 1 = 6$ fraisiers. Sur le côté $[L P]$ : $444 div 37 = 12$ intervalles, donc $12 + 1 = 13$ fraisiers. Le maillage compte 13 lignes de 6 fraisiers :
$ 6 times 13 = 78. $

Les élèves pourront planter *78 fraisiers*.

*Partie B*

*1.* *a.* Une augmentation de 2~% multiplie par $1 + "0,02" = "1,02"$, une augmentation de 3~% multiplie par $"1,03"$. Après les deux augmentations, le prix est multiplié par
$ "1,02" times "1,03" = "1,0506". $
$ "1,0506" = 1 + "0,0506" = 1 + frac("5,06", 100). $

L'augmentation globale est exactement de $p = "5,06"$~% (et non de 5~%).

*b.* Prix après les deux augmentations : $"1,20" times "1,0506" = "1,26072"$ €. Arrondi au centime : *1,26 €*.

*2.* *a.* On compare à la masse totale $M$ de la récolte. Un neuvième est inutilisable : il reste $1 - display(frac(1, 9)) = display(frac(8, 9))$ de la masse. Un quart de ces fraises restantes sert à la confiture :
$ frac(1, 4) times frac(8, 9) = frac(8, 36) = frac(2, 9). $

La proportion consacrée à la confiture est $display(frac(2, 9))$ de la récolte.

*b.* Si 3 kg de fraises servent à la confiture, ils représentent $display(frac(2, 9))$ de la récolte initiale $M$ :
$ frac(2, 9) times M = 3, quad "donc" quad M = 3 div frac(2, 9) = 3 times frac(9, 2) = frac(27, 2) = "13,5". $

La récolte initiale pèse *13,5 kg*.

*Partie C*

*1.* Les droites $(A C)$ et $(O B)$ sont parallèles, et $C$ est sur $[S O]$, $A$ sur $[S B]$. Le diamètre du grand cône est 84 cm, donc son rayon est $O B = 42$ cm. D'après le théorème de Thalès dans le triangle $S O B$ :
$ frac(S C, S O) = frac(C A, O B) = frac("18,9", 42) = "0,45". $
On note $S O = h$. Comme $S C = S O - O C = h - 22$ :
$ frac(h - 22, h) = "0,45", quad "donc" quad h - 22 = "0,45" h. $
On regroupe : $h - "0,45" h = 22$, donc $"0,55" h = 22$ et $h = 22 div "0,55" = 40$.

On a bien montré que $O S = 40$ cm.

*2.* Le grand cône a pour base un disque de rayon 42 cm et pour hauteur 40 cm :
$ V_"grand" = frac(pi times 42^2 times 40, 3) = frac(pi times 1 764 times 40, 3) = 23 520 pi " cm"^3. $

*3.* Le petit cône a pour base un disque de rayon $C A = "18,9"$ cm et pour hauteur $S C = 40 - 22 = 18$ cm :
$ V_"petit" = frac(pi times "18,9"^2 times 18, 3) = pi times "357,21" times 6 = "2 143,26" pi " cm"^3. $
Le volume de la bassine est la différence :
$ V_"bassine" = 23 520 pi - "2 143,26" pi = "21 376,74" pi approx "67 157" " cm"^3. $
Comme $1 " L" = 1 000 " cm"^3$ : $"67 157" " cm"^3 = "67,157" " L"$.

Le volume de la bassine est d'environ *67 157 cm³*, soit *67,16 L* au centilitre près.
