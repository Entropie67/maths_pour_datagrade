# Annales des exercices de mathématiques du concours de recrutement des professeurs des écoles

## Sujets après 2022

Le format de l'épreuve de mathématiques a changé en 2022 (avec la disparition de la partie didactique). Tous les exercices, depuis 2022, ont été retranscrits en LaTeX, corrigés et transformés en image par la communauté (Nathalie Daval, Audrey Miconi, Rémi Angot...) pour être utilisables sur coopmaths.fr/alea sous licence libre CC-BY-SA.

## Période 2015-2019

La COPIRELEM met à disposition sur http://www.arpeme.fr/index.php?id_page=27 des exercices d'annales du concours de recrutement de professeurs des écoles ainsi que des sujets de Master avec les corrections détaillées.

Ces documents sont sous licence CC-BY-ND. La modification notamment des corrections n'est pas autorisée.

Nous avons réalisé le découpage de ces pdf pour avoir une image par exercice utilisable sur coopmaths.fr/alea par contre nous n'avons pas de sortie LaTeX des exercices de cette période.

Avec `gs -dBATCH -dNOPAUSE -r600 -sDEVICE=png16m -sOutputFile=2017-%03d.png 2017.pdf` le pdf est transformé en un png par page.

Avec `for file in *.png; do convert $file -crop  +500+500 +repage -crop -200-400 +repage crop/$file ; don`, chaque png est recadré pour enlever l'entête, le pied de page et les marges latérales.

Ensuite, à la main, on recadre en hauteur les fichiers exercice par exercice et on les nomme `annee-lieu-exN-n.png` ou `annee-lieu-exN-cor-n.png`

Par la suite, ces images sont intégrées (avec une watermark pour les sujets d'INSPE et pour les corrections) dans MathALEA.
