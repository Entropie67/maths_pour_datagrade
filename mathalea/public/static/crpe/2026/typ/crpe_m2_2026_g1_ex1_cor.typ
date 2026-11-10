*Partie A*

*1.* Le montant pour une catégorie de visiteurs est « nombre de visiteurs × prix d'une entrée ». Pour la ligne 2 (adultes), c'est le nombre en B2 multiplié par le prix en C2. On saisit en D2 la formule

#align(center)[#raw("=B2*C2")]

puis on l'étire vers le bas jusqu'en D7 : en D3 elle devient #raw("=B3*C3"), etc.

*2.* Le total avant réduction est la somme des montants des lignes 2 à 7. On saisit en D8 :

#align(center)[#raw("=SOMME(D2:D7)")]

*3.* Une réduction de 15~% signifie qu'on paie $100 - 15 = 85$~% du prix, c'est-à-dire qu'on multiplie par $1 - "0,15" = "0,85"$. On saisit en D9 :

#align(center)[#raw("=D8*0,85")]

(On peut aussi écrire #raw("=D8-D8*15/100") ou #raw("=D8*(1-0,15)").)

*Partie B*

*1.* Le groupe est composé de 4 adultes et de $n$ élèves. Le groupe compte donc $4 + n$ personnes. Comme $n$ est au plus 41, il y a au plus $4 + 41 = 45$ personnes : c'est moins de 50, donc il n'y a *pas de réduction*.

- Coût des 4 adultes : $4 times 16 = 64$ €.
- Coût des $n$ élèves : $n times "8,50"$ €.

Le coût total est $64 + "8,5" n$ euros.

*2.* On cherche $n$ tel que $64 + "8,5" n = "378,5"$.

- On retranche 64 aux deux membres : $"8,5" n = "378,5" - 64 = "314,5"$.
- On divise par 8,5 : $n = "314,5" div "8,5" = 37$.

Vérification : $64 + "8,5" times 37 = 64 + "314,5" = "378,5"$ ✓.

*37 élèves* ont donc participé à la sortie.

*Partie C*

*1.* La vitesse moyenne est la distance divisée par la durée. Il faut exprimer la durée en heures : 1 h 10 min $= 1 + display(frac(10, 60)) = display(frac(7, 6))$ h.
$ v = 85 div frac(7, 6) = 85 times frac(6, 7) = frac(510, 7) approx "72,86" "km/h". $

La vitesse moyenne est d'environ *73 km/h*.

*2.* Le voyage est un aller-retour : la distance totale est $2 times 85 = 170$ km.

- *Carburant :* le bus consomme 30 L pour 100 km, donc pour 170 km : $30 times "1,7" = 51$ L (car $170 = "1,7" times 100$). À 1,60 € le litre : $51 times "1,6" = "81,60"$ €.
- *Péage :* 13,90 € par trajet, donc $2 times "13,90" = "27,80"$ € pour l'aller-retour.
- *Forfait journalier* (bus et chauffeur) : 150,00 €.

Total : $"81,60" + "27,80" + 150 = "259,40"$ €.

Le coût total du transport est de *259,40 €*.
