# Annales livrées avec MathALÉA

Les fichiers récupérés sont réellement versionnés dans `mathalea/public/static/` (et, lorsqu'ils existent, `mathalea/public/assets/`). Aucun téléchargement au démarrage n'est nécessaire pour ces fichiers. L'inventaire couvre les dictionnaires du code importé, y compris les anciens dictionnaires inactifs, ainsi que les figures `includegraphics` détectées dans les sources LaTeX récupérées.

## Couverture vérifiable

Au 9 novembre 2026 : **9 206 fichiers livrés**, soit **1 504 983 785 octets** (1,50 Go ; 1 435,3 Mio), sur 9 693 chemins inventoriés. Les 487 chemins non récupérés comprennent 130 références du catalogue actif et 357 références anciennes ou inactives. Ces nombres comptent des fichiers, pas des exercices.

| Famille | Fichiers disponibles | Chemins non récupérés |
| --- | ---: | ---: |
| BAC | 1 700 | 17 |
| DNB | 3 358 | 7 |
| DNB professionnel | 209 | 0 |
| E3C | 1 120 | 0 |
| EAM | 480 | 0 |
| STI2D | 612 | 12 |
| STL | 456 | 32 |
| CRPE, y compris anciens dictionnaires | 1 141 | 210 |
| EVACOM | 33 | 16 |
| FlashBac | 19 | 153 |
| Mathadata | 78 | 40 |

Le [rapport de téléchargement](annales-download-report.json) donne pour chaque fichier son URL d'origine, sa taille et son empreinte SHA-256, ou les erreurs rencontrées. Le [rapport de couverture](annales-coverage.json) liste les manques, leur appartenance au catalogue actif et les références d'images anormales dans les dictionnaires amont. Un fichier manquant reste signalé ; aucun sujet ni corrigé n'est remplacé par un autre.

Les [révisions des dépôts de ressources](annales-sources.json) sont figées pour les téléchargements de secours depuis la forge officielle. Les notices d'origine disponibles sont conservées dans `origins/`. Les URL du serveur de médias ne sont pas versionnées par son hébergeur : leurs empreintes identifient les octets effectivement récupérés.

## Utilisation locale

Depuis `mathalea/`, après installation des dépendances :

```sh
corepack pnpm exec vite --config ../vite.annales-locales.config.mjs --port 5180 --strictPort
```

Ouvrir <http://localhost:5180/alea/>. Le profil retire le proxy `/alea/static` du serveur de développement amont. Redémarrer le serveur après avoir téléchargé de nouveaux médias. Les builds Vite copient normalement `public/` dans le dossier livré ; il faut donc conserver ces fichiers lors du déploiement et prévoir leur volume.

Depuis la racine du dépôt :

```sh
python scripts/verify-annales.py
node scripts/test-annales-locales.mjs
```

Le contrôle des fichiers relit tous les octets livrés et compare leurs empreintes. Le contrôle navigateur ouvre huit annales (DNB, BAC, CRPE, DNB professionnel, E3C, EAM, STI2D, STL), affiche leur correction et vérifie le chargement des images locales en bloquant les requêtes HTTP externes. Le [résultat observé](../validation/annales-browser.json) ne vaut pas validation de chaque sujet, des exports LaTeX/Typst/PDF ou des services externes.

## Reprendre la récupération

```sh
python scripts/download-annales.py --workers 6
python scripts/inventory-annales-dependencies.py
python scripts/download-annales.py --workers 6
python scripts/verify-annales.py
```

Le téléchargement reprend depuis le rapport livré et un journal local ignoré par Git ; les fichiers déjà présents sont contrôlés avant réutilisation. Il retourne un code non nul si des liens restent manquants. Les réponses définitives 403/404 déjà enregistrées ne sont pas réessayées automatiquement. Le script d'inventaire initial `node scripts/inventory-annales.mjs` sert à reconstruire la liste depuis les dictionnaires ; il faut ensuite relancer l'inventaire des figures.

## Limites connues

- Des corrigés BAC, Mathadata et EVACOM et d'anciennes références FlashBac/CRPE sont absents aux URL attendues. Le rapport est la liste de référence ; une indisponibilité constatée ne prouve pas que le document n'existe nulle part ailleurs.
- Certaines entrées CRPE 2022 groupe 4 utilisent une adresse `.tex` dans un champ d'image : conserver la source ne corrige pas ce défaut amont.
- L'extraction des figures porte sur les commandes `includegraphics` explicites et les conventions de chemins du moteur. Elle ne garantit pas la résolution de toutes les macros LaTeX, dépendances Typst ou services de compilation.
- Des médias partenaires restent appelés directement par du code amont, notamment Mathadata. Ce profil ne transforme pas tous les services externes en services locaux.

Le moteur et les catalogues n'ont pas été réduits. L'autonomie complète et l'absence de perte fonctionnelle restent à valider sur la cible DataGrade.
