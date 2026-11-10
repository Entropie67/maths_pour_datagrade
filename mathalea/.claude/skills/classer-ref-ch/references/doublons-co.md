# Déduplication des exercices du CO suisse

Décision validée et appliquée le 03/11/2026.

## Règle retenue

Garder dans chaque feuille le représentant le plus paramétrable qui couvre
les cas utiles des variantes. Le nombre d’options activées par défaut ne
suffit pas : vérifier les types de questions, les réglages exposés, les
champs imposés et les méthodes redéfinies. Garder les tâches et modes utiles
qui ne peuvent pas être sélectionnés dans un même exercice.

Reporter sur le représentant les classements utiles au CO, au Collège et
au Préqualifiant. Dans une feuille où il est déjà présent, garder sa
référence ; ailleurs, reprendre la référence de la variante. Une variante
entièrement couverte, sans autre usage suisse, reçoit exclusivement
`'fr-ch': ['NR']` pour ne pas réapparaître dans « Non classés ».

Les paramètres restent choisis manuellement par l’enseignant. Cette passe
ne crée aucun préréglage, ne supprime aucun fichier et ne change aucun uuid,
énoncé, tirage, correction ou paramètre par défaut.

## Résultat de la passe

L’examen des imports et de l’héritage porte sur 5 132 fichiers sources :
244 familles ont au moins un représentant au CO, dont 105 présentaient
plusieurs membres dans une même feuille. Les délégations à une méthode
parente et la copie 6P14-NoCapytale ont également été examinées.

- 136 regroupements appliqués.
- 178 variantes passent à `NR` : 120 étaient classées et 58 étaient dans « Non classés ».
- 309 entrées redondantes retirées du CO (4053 → 3744, toutes sections cumulées).
- « Non classés » : 2229 → 2171 entrées.
- Aucune catégorie précédemment alimentée n’est vidée.

## Représentants et variantes entièrement couvertes

Les liens pointent vers les fichiers sources dont seuls les alias suisses
changent. Les remarques précisent les restrictions à sélectionner selon la
feuille ; elles ne remplacent pas la vérification du niveau de la section.

| Représentant conservé | Variantes passées à NR | Réglages et justification |
|---|---|---|
| [6N1F-3](../../../../src/exercices/6e/6N1F-3.ts) | [1Tec-A1-1](../../../../src/exercices/1eTec/1Tec-A1-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N3Q](../../../../src/exercices/6e/6N3Q.ts) | [1Tec-A1-2](../../../../src/exercices/1eTec/1Tec-A1-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [2G11-5](../../../../src/exercices/2e/2G11-5.ts) | [4G22-0](../../../../src/exercices/4e/4G22-0.ts) | Types 1 et 2 pour hauteur et aire ; le type 3 ajoute le calcul du côté. |
| [3L11-0](../../../../src/exercices/3e/3L11-0.ts) | [4L10b](../../../../src/exercices/4e/4L10b.ts) | Types 1-2, signe de a et c positif pour la variante simple. |
| [3L11-1b](../../../../src/exercices/3e/3L11-1b.ts) | [2L11-2](../../../../src/exercices/2e/2L11-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3L11-3](../../../../src/exercices/3e/3L11-3.ts) | [2L11-3](../../../../src/exercices/2e/2L11-3.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3L11-4](../../../../src/exercices/3e/3L11-4.ts) | [4L11](../../../../src/exercices/4e/4L11.ts) | Le signe de multiplication est sélectionnable dans le formulaire. |
| [3L11-15](../../../../src/exercices/3e/3L11-15.ts) | [2L12-4](../../../../src/exercices/2e/2L12-4.ts) | Types 1-2-3-5-6-7, coefficients entiers, degré maximum 1 et une variable pour les formes simples ; la lettre peut varier. |
| [4L14-0](../../../../src/exercices/4e/4L14-0.ts) | [4L14-1](../../../../src/exercices/4e/4L14-1.ts), [4L14-2](../../../../src/exercices/4e/4L14-2.ts) | Types 1-2-3-4-5 pour le premier degré ; types 6-7-9 pour tester les solutions des formes avec un carré. |
| [6N1H-2](../../../../src/exercices/6e/6N1H-2.ts) | [2N11-1](../../../../src/exercices/2e/2N11-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [CM2N2E-2](../../../../src/exercices/CM2/CM2N2E-2.ts) | [2N11-2](../../../../src/exercices/2e/2N11-2.ts) | Le type 5 et les cases de notation et de correction sont présents dans le formulaire du générateur. |
| [5A10](../../../../src/exercices/5e/5A10.ts) | [2N20-1](../../../../src/exercices/2e/2N20-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N1J-3](../../../../src/exercices/5e/5N1J-3.ts) | [5A11-4](../../../../src/exercices/5e/5A11-4.ts), [2N20-2](../../../../src/exercices/2e/2N20-2.ts) | Cocher « Gros nombres » pour les variantes avancées. |
| [3A10-1](../../../../src/exercices/3e/3A10-1.ts) | [2N20-4](../../../../src/exercices/2e/2N20-4.ts), [3A10-0](../../../../src/exercices/3e/3A10-0.ts) | Difficulté 1 et option des nombres premiers inférieurs à 100 pour les cas simples ; la variante limitée à 50 reste distincte. |
| [4A11-0](../../../../src/exercices/4e/4A11-0.ts) | [5N1L-4](../../../../src/exercices/5e/5N1L-4.ts) | Nombre de facteurs, grands nombres et décomposition avec puissances sont sélectionnables ; 2N20-5 conserve son mode de seconde imposé. |
| [4A12](../../../../src/exercices/4e/4A12.ts) | [2N20-7](../../../../src/exercices/2e/2N20-7.ts), [3A11-1](../../../../src/exercices/3e/3A11-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3A11](../../../../src/exercices/3e/3A11.ts) | [4A11-2](../../../../src/exercices/4e/4A11-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4C23](../../../../src/exercices/4e/4C23.ts) | [2N32-1](../../../../src/exercices/2e/2N32-1.ts) | Type 4 pour les priorités opératoires. |
| [4C33-0](../../../../src/exercices/4e/4C33-0.ts) | [5N4A](../../../../src/exercices/5e/5N4A.ts) | Bases positives, signe positif et carrés/cubes pour la variante de 5e. |
| [2N41-4](../../../../src/exercices/2e/2N41-4.ts) | [4C30-1](../../../../src/exercices/4e/4C30-1.ts) | Décocher les nombres négatifs pour les cas simples ; les exposants nuls sont possibles dans cette version. |
| [4C34](../../../../src/exercices/4e/4C34.ts) | [5N4E](../../../../src/exercices/5e/5N4E.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [2P10-1](../../../../src/exercices/2e/2P10-1.ts) | [3S20-1](../../../../src/exercices/3e/3S20-1.ts) | L’arbre est facultatif ; le formulaire des types d’épreuves est conservé. |
| [3A10-6](../../../../src/exercices/3e/3A10-6.ts) | [5N1J-5](../../../../src/exercices/5e/5N1J-5.ts), [5N1autoA-5](../../../../src/exercices/5e/5N1autoA-5.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3A10-7](../../../../src/exercices/3e/3A10-7.ts) | [5N1L-2](../../../../src/exercices/5e/5N1L-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4C24](../../../../src/exercices/4e/4C24.ts) | [3A11-0](../../../../src/exercices/3e/3A11-0.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N2J-1](../../../../src/exercices/6e/6N2J-1.ts) | [3A13-1](../../../../src/exercices/3e/3A13-1.ts), [6N2J-2](../../../../src/exercices/6e/6N2J-2.ts) | La classe change seulement les parenthèses de la correction ; la difficulté est sélectionnable. |
| [3A13-3](../../../../src/exercices/3e/3A13-3.ts) | [6N2J-4](../../../../src/exercices/6e/6N2J-4.ts) | La version conservée permet aussi de choisir la présence de parenthèses. |
| [6N2K-4](../../../../src/exercices/6e/6N2K-4.ts) | [3A13-4](../../../../src/exercices/3e/3A13-4.ts) | Le réglage 3 couvre le mode avancé ; la classe ne change que les parenthèses de la correction. |
| [3C10-1](../../../../src/exercices/3e/3C10-1.ts) | [4C30-3](../../../../src/exercices/4e/4C30-3.ts) | Exposants positifs en 9e ; positifs, négatifs ou mélange selon la feuille de 10e. |
| [3C10-2](../../../../src/exercices/3e/3C10-2.ts) | [4C33-1](../../../../src/exercices/4e/4C33-1.ts) | Décocher les exposants négatifs pour les cas correspondants à la variante de 4e. |
| [3F10-2](../../../../src/exercices/3e/3F10-2.ts) | [3F10-5](../../../../src/exercices/3e/3F10-5.ts), [3F10-6](../../../../src/exercices/3e/3F10-6.ts) | Types 1-2 pour les fonctions linéaires et affines ; types 3-4 pour polynômes et fonctions rationnelles au Collège. Choisir image ou antécédent selon la feuille. |
| [3G10-1](../../../../src/exercices/3e/3G10-1.ts) | [4G10-1](../../../../src/exercices/4e/4G10-1.ts), [5G1B-6](../../../../src/exercices/5e/5G1B-6.ts), [5G3A-7](../../../../src/exercices/5e/5G3A-7.ts) | Types 1-2 en 9e, types 1 à 4 en 10e, homothéties en 11LC/LS. |
| [4G10](../../../../src/exercices/4e/4G10.ts) | [3G10-2](../../../../src/exercices/3e/3G10-2.ts), [5G3A](../../../../src/exercices/5e/5G3A.ts), [5G3autoA](../../../../src/exercices/5e/5G3autoA.ts), [6G7B](../../../../src/exercices/6e/6G7B.ts) | Types 1 à 4 pour symétrie axiale, 7 pour centrale, 5-6-8 pour rotations et translation, 9-10 pour homothéties. |
| [3L10](../../../../src/exercices/3e/3L10.ts) | [3L10-2](../../../../src/exercices/3e/3L10-2.ts) | Les types 5 à 10 sont sélectionnables dans la version générale ; exclure le degré 2 dans les feuilles concernées. |
| [3L11](../../../../src/exercices/3e/3L11.ts) | [4L10](../../../../src/exercices/4e/4L10.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4P12-2](../../../../src/exercices/4e/4P12-2.ts) | [3L16](../../../../src/exercices/3e/3L16.ts) | La différence de niveau ajoute seulement une figure dans une correction ; tous les ratios et motifs sont sélectionnables. |
| [4G12-1](../../../../src/exercices/4e/4G12-1.ts) | [5G3A-12](../../../../src/exercices/5e/5G3A-12.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N5D-1](../../../../src/exercices/5e/5N5D-1.ts) | [4L16](../../../../src/exercices/4e/4L16.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5D1D](../../../../src/exercices/5e/5D1D.ts) | [4S10](../../../../src/exercices/4e/4S10.ts) | Valeurs numériques 2 pour les grands effectifs ; en 9e, diagramme en bâtons ou cartésien. |
| [CM2P1A](../../../../src/exercices/CM2/CM2P1A.ts) | [5D1A](../../../../src/exercices/5e/5D1A.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6P1autoA](../../../../src/exercices/6e/6P1autoA.ts) | [5D1C](../../../../src/exercices/5e/5D1C.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5G2D-3](../../../../src/exercices/5e/5G2D-3.ts) | [6M1autoC](../../../../src/exercices/6e/6M1autoC.ts), [bp2autoQ1](../../../../src/exercices/bp2/bp2autoQ1.ts), [c3N30](../../../../src/exercices/CM/c3N30.ts) | Cocher « Qu’avec des unités de longueurs » dans les feuilles de conversion de longueurs ; les autres unités restent disponibles pour les préfixes. |
| [5G2E-1](../../../../src/exercices/5e/5G2E-1.ts) | [6M1C](../../../../src/exercices/6e/6M1C.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5G2E-2](../../../../src/exercices/5e/5G2E-2.ts) | [6M1C-1](../../../../src/exercices/6e/6M1C-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [ConnaitreFormulesDePerimetreEtAires](../../../../src/exercices/5e/ConnaitreFormulesDePerimetreEtAires.ts) | [5G2E](../../../../src/exercices/5e/5G2E.ts), [6M1B](../../../../src/exercices/6e/6M1B.ts), [5G5D](../../../../src/exercices/5e/5G5D.ts) | Types 1-2-9 pour cercle et disque ; types 7-8 pour les formules du triangle en 9e. |
| [6G8autoA](../../../../src/exercices/6e/6G8autoA.ts) | [5G2autoC](../../../../src/exercices/5e/5G2autoC.ts), [BP1GEO07](../../../../src/exercices/bp1/BP1GEO07.ts) | Choisir les solides adaptés à la feuille : notamment 5-6 pour pavé/cube, 1-4 pour prisme/cylindre, 3-7 pour cône/boule ; QCM sélectionnable. |
| [6G0-3](../../../../src/exercices/6e/6G0-3.ts) | [5G30](../../../../src/exercices/5e/5G30.ts) | Même valeur de classe, seules les présentations diffèrent. |
| [5G3autoB-1](../../../../src/exercices/5e/5G3autoB-1.ts) | [6G7B-2](../../../../src/exercices/6e/6G7B-2.ts) | La figure est imposée dans cette famille ; les orientations de l’axe sont sélectionnables. |
| [5G3autoB](../../../../src/exercices/5e/5G3autoB.ts) | [6G7B-1](../../../../src/exercices/6e/6G7B-1.ts) | La construction de points est distincte de celle d’une figure ; les orientations de l’axe sont sélectionnables. |
| [5G3B-2](../../../../src/exercices/5e/5G3B-2.ts) | [6G7B-9](../../../../src/exercices/6e/6G7B-9.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5G6F-3](../../../../src/exercices/5e/5G6F-3.ts) | [CM2G3D-1](../../../../src/exercices/CM2/CM2G3D-1.ts), [CM2G3D-2](../../../../src/exercices/CM2/CM2G3D-2.ts), [5G41-1](../../../../src/exercices/5e/5G41-1.ts), [5G6B-1](../../../../src/exercices/5e/5G6B-1.ts) | Types 1-2-3-4 pour carrés et rectangles, 5-6 pour losanges, 7 pour parallélogrammes. |
| [6G4B-2](../../../../src/exercices/6e/6G4B-2.ts) | [5G4autoB](../../../../src/exercices/5e/5G4autoB.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6G6A-6](../../../../src/exercices/6e/6G6A-6.ts) | [5G5B-1](../../../../src/exercices/5e/5G5B-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6G6A-4](../../../../src/exercices/6e/6G6A-4.ts) | [6G6A-1](../../../../src/exercices/6e/6G6A-1.ts), [6G6A-3](../../../../src/exercices/6e/6G6A-3.ts), [5G5B-2](../../../../src/exercices/5e/5G5B-2.ts) | Le formulaire texte accepte tous les types 1 à 11, avec la même correspondance vers les sept constructions et des mélanges personnalisés. |
| [DefinitionProprietesTriangles](../../../../src/exercices/5e/DefinitionProprietesTriangles.ts) | [5G5E-1](../../../../src/exercices/5e/5G5E-1.ts), [5G5B-4](../../../../src/exercices/5e/5G5B-4.ts), [6G3B-2](../../../../src/exercices/6e/6G3B-2.ts), [6G6C](../../../../src/exercices/6e/6G6C.ts) | Type 1 pour hauteur, 2-3-4 pour médiatrice, 5-6 pour sommes d’angles, 7 pour inégalité triangulaire. |
| [5G5B](../../../../src/exercices/5e/5G5B.ts) | [6G6A-2](../../../../src/exercices/6e/6G6A-2.ts) | Les types 1 à 6 de la version de 6e sont disponibles dans le formulaire des types 1 à 9. |
| [5G5E](../../../../src/exercices/5e/5G5E.ts) | [5G5G](../../../../src/exercices/5e/5G5G.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [VocabulaireDesTriangles](../../../../src/exercices/5e/VocabulaireDesTriangles.ts) | [5G5autoA](../../../../src/exercices/5e/5G5autoA.ts) | La figure à main levée est une option ; la variante de classe 6 conserve son mode propre. |
| [ConstructionsParallelogrammesParticuliers](../../../../src/exercices/5e/ConstructionsParallelogrammesParticuliers.ts) | [5G6D](../../../../src/exercices/5e/5G6D.ts), [5G6F-2](../../../../src/exercices/5e/5G6F-2.ts) | La version générale expose les sept constructions ; rectangle et losange correspondent aux types 3-4, les cibles et points sont optionnels. |
| [5N1F-1](../../../../src/exercices/5e/5N1F-1.ts) | [6N0B-3](../../../../src/exercices/6e/6N0B-3.ts) | Même tâche de traduction d’un calcul ; le nombre d’opérations est sélectionnable. |
| [5N1I-4](../../../../src/exercices/5e/5N1I-4.ts) | [5N1J](../../../../src/exercices/5e/5N1J.ts), [5N1autoA-1](../../../../src/exercices/5e/5N1autoA-1.ts) | Choisir 3-9 ou 2-5-10 dans les feuilles de critères correspondantes. |
| [5N1J-2](../../../../src/exercices/5e/5N1J-2.ts) | [5N1autoA-2](../../../../src/exercices/5e/5N1autoA-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N1autoC-1](../../../../src/exercices/5e/5N1autoC-1.ts) | [CM2N4A-1](../../../../src/exercices/CM2/CM2N4A-1.ts), [CM2N4A-8](../../../../src/exercices/CM2/CM2N4A-8.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N1autoE-4](../../../../src/exercices/5e/5N1autoE-4.ts) | [6N2autoD-4](../../../../src/exercices/6e/6N2autoD-4.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N2G-2](../../../../src/exercices/5e/5N2G-2.ts) | [5N2K](../../../../src/exercices/5e/5N2K.ts), [5N2I-3](../../../../src/exercices/5e/5N2I-3.ts) | Types 1, 2 ou mélange pour addition et soustraction ; valeur maximale et décimaux sélectionnables. |
| [5N2autoA](../../../../src/exercices/5e/5N2autoA.ts) | [6N2A-4](../../../../src/exercices/6e/6N2A-4.ts), [6N2E-6](../../../../src/exercices/6e/6N2E-6.ts) | Types 1-2 pour addition/soustraction, type 3 pour multiplication ; régler les décimales et retenues selon la feuille. |
| [5N3B](../../../../src/exercices/5e/5N3B.ts) | [5N3B-1](../../../../src/exercices/5e/5N3B-1.ts) | Le formulaire complexe général contient les réglages de la variante. |
| [CM2N2F-1](../../../../src/exercices/CM2/CM2N2F-1.ts) | [5N3autoD](../../../../src/exercices/5e/5N3autoD.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N4autoB](../../../../src/exercices/5e/5N4autoB.ts) | [6M3A](../../../../src/exercices/6e/6M3A.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N5autoC](../../../../src/exercices/5e/5N5autoC.ts) | [5N5autoA](../../../../src/exercices/5e/5N5autoA.ts), [5N5autoB](../../../../src/exercices/5e/5N5autoB.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N3C](../../../../src/exercices/6e/6N3C.ts) | [5N3autoC](../../../../src/exercices/6e/5N3autoC.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6AutoN4-2](../../../../src/exercices/6e/6AutoN4-2.ts) | [6N2C-1](../../../../src/exercices/6e/6N2C-1.ts) | Choisir division dans la feuille de divisions mentales. |
| [6AutoN4](../../../../src/exercices/6e/6AutoN4.ts) | [6N2B-3](../../../../src/exercices/6e/6N2B-3.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [10GM3B-6](../../../../src/exercices/ch/10e/10GM3B-6.ts) | [6M4C-3](../../../../src/exercices/6e/6M4C-3.ts), [6M4C-4](../../../../src/exercices/6e/6M4C-4.ts) | Les six conversions sont disponibles ; cocher quarts et demi-heures pour les variantes simples. |
| [6N0A-5](../../../../src/exercices/6e/6N0A-5.ts) | [CM2N4A-6](../../../../src/exercices/CM2/CM2N4A-6.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N1A-7](../../../../src/exercices/6e/6N1A-7.ts) | [CM1N1E](../../../../src/exercices/CM1/CM1N1E.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N1C-1](../../../../src/exercices/6e/6N1C-1.ts) | [CM2N1G-1](../../../../src/exercices/CM2/CM2N1G-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N2E](../../../../src/exercices/6e/6N2E.ts) | [CM2N5C](../../../../src/exercices/CM2/CM2N5C.ts) | Deux chiffres significatifs et aucun chiffre décimal dans le deuxième facteur pour la variante CM2 ; le diviseur/facteur imposé de CM1 reste distinct. |
| [6N5-2](../../../../src/exercices/6e/6N5-2.ts) | [6N2I-2](../../../../src/exercices/6e/6N2I-2.ts), [CM2N6C-2](../../../../src/exercices/CM2/CM2N6C-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N5-1](../../../../src/exercices/6e/6N5-1.ts) | [6N2G](../../../../src/exercices/6e/6N2G.ts), [CM2N6C-1](../../../../src/exercices/CM2/CM2N6C-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N2J](../../../../src/exercices/6e/6N2J.ts) | [CM1N5F](../../../../src/exercices/CM1/CM1N5F.ts), [CM2N5G](../../../../src/exercices/CM2/CM2N5G.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N5-9](../../../../src/exercices/6e/6N5-9.ts) | [CM2N6C-3](../../../../src/exercices/CM2/CM2N6C-3.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [CM2N4G-2](../../../../src/exercices/CM2/CM2N4G-2.ts) | [CM2N4G-1](../../../../src/exercices/CM2/CM2N4G-1.ts) | Le formulaire permet de choisir entiers, décimaux et fractions, avec ou sans décimaux particuliers. |
| [CM2N5E](../../../../src/exercices/CM2/CM2N5E.ts) | [CM2N5D](../../../../src/exercices/CM2/CM2N5D.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [1A-C02-2](../../../../src/exercices/1e/1A-C02-2.ts) | [can3C1-06](../../../../src/exercices/can/3e/can3C1-06.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C02-4](../../../../src/exercices/1e/1A-C02-4.ts) | [can2N3-03](../../../../src/exercices/can/2e/can2N3-03.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C03-16](../../../../src/exercices/1e/1A-C03-16.ts) | [can2N4-05](../../../../src/exercices/can/2e/can2N4-05.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C03-2](../../../../src/exercices/1e/1A-C03-2.ts) | [can2N4-03](../../../../src/exercices/can/2e/can2N4-03.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C04-1](../../../../src/exercices/1e/1A-C04-1.ts) | [can5C4-10](../../../../src/exercices/can/5e/can5C4-10.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C04-11](../../../../src/exercices/1e/1A-C04-11.ts) | [can5P2-04](../../../../src/exercices/can/5e/can5P2-04.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C04-6](../../../../src/exercices/1e/1A-C04-6.ts) | [can5P2-02](../../../../src/exercices/can/5e/can5P2-02.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C08-4](../../../../src/exercices/1e/1A-C08-4.ts) | [can3L2-01](../../../../src/exercices/can/3e/can3L2-01.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C08-5](../../../../src/exercices/1e/1A-C08-5.ts) | [can4L2-06](../../../../src/exercices/can/4e/can4L2-06.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C09-2](../../../../src/exercices/1e/1A-C09-2.ts) | [can2L11-05](../../../../src/exercices/can/2e/can2L11-05.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C09-3](../../../../src/exercices/1e/1A-C09-3.ts) | [can2L10-04](../../../../src/exercices/can/2e/can2L10-04.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-C09-8](../../../../src/exercices/1e/1A-C09-8.ts) | [can2L11-01](../../../../src/exercices/can/2e/can2L11-01.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-E02-1](../../../../src/exercices/1e/1A-E02-1.ts) | [can4P2-03](../../../../src/exercices/can/4e/can4P2-03.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-F08-2](../../../../src/exercices/1e/1A-F08-2.ts) | [can2G30-05](../../../../src/exercices/can/2e/can2G30-05.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-P02-1](../../../../src/exercices/1e/1A-P02-1.ts) | [can3S2-02](../../../../src/exercices/can/3e/can3S2-02.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-R01-6](../../../../src/exercices/1e/1A-R01-6.ts) | [can5P1-07](../../../../src/exercices/can/5e/can5P1-07.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-R01-7](../../../../src/exercices/1e/1A-R01-7.ts) | [can2I1-03](../../../../src/exercices/can/2e/can2I1-03.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-R02-3](../../../../src/exercices/1e/1A-R02-3.ts) | [can2I1-02](../../../../src/exercices/can/2e/can2I1-02.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [1A-R02-4](../../../../src/exercices/1e/1A-R02-4.ts) | [can4P2-04](../../../../src/exercices/can/4e/can4P2-04.ts) | Même générateur, mêmes paramètres disponibles et mode QCM activable ; conserver la référence hors CAN. |
| [2F22-1](../../../../src/exercices/2e/2F22-1.ts) | [BP2FONC30](../../../../src/exercices/bp2/BP2FONC30.ts), [can2F22-01](../../../../src/exercices/can/2e/can2F22-01.ts), [can2F22-05](../../../../src/exercices/can/2e/can2F22-05.ts) | Cases carré et cube ; les variantes inverse en calcul mental, valeur absolue et racine carrée restent distinctes ou à examiner pour d’autres feuilles. |
| [2F30-2](../../../../src/exercices/2e/2F30-2.ts) | [BP1AUTO061](../../../../src/exercices/bp1/BP1AUTO061.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5G6F](../../../../src/exercices/5e/5G6F.ts) | [2G10-2](../../../../src/exercices/2e/2G10-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3G20-1](../../../../src/exercices/3e/3G20-1.ts) | [2G11-2](../../../../src/exercices/2e/2G11-2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [2I20-2](../../../../src/exercices/2e/2I20-2.ts) | [BP2CCF11](../../../../src/exercices/bp2/BP2CCF11.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N5A](../../../../src/exercices/5e/5N5A.ts) | [3AutoN10-1](../../../../src/exercices/3e/3AutoN10-1.ts), [can5L-02](../../../../src/exercices/can/5e/can5L-02.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3L13-2](../../../../src/exercices/3e/3L13-2.ts) | [4C20-3](../../../../src/exercices/4e/4C20-3.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4L20](../../../../src/exercices/4e/4L20.ts) | [bp2autoK1](../../../../src/exercices/bp2/bp2autoK1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N1H-1](../../../../src/exercices/6e/6N1H-1.ts) | [2N11-3](../../../../src/exercices/2e/2N11-3.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4C32](../../../../src/exercices/4e/4C32.ts) | [can3C2-05](../../../../src/exercices/can/3e/can3C2-05.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3S20](../../../../src/exercices/3e/3S20.ts) | [2P10-5](../../../../src/exercices/2e/2P10-5.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3S12](../../../../src/exercices/3e/3S12.ts) | [2S20-1](../../../../src/exercices/2e/2S20-1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3AutoG03](../../../../src/exercices/3e/3AutoG03.ts) | [can4G3-02](../../../../src/exercices/can/4e/can4G3-02.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3F20](../../../../src/exercices/3e/3F20.ts) | [BP1AUTO055](../../../../src/exercices/bp1/BP1AUTO055.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3F21-3](../../../../src/exercices/3e/3F21-3.ts) | [BP1AUTO056](../../../../src/exercices/bp1/BP1AUTO056.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3L13-0](../../../../src/exercices/3e/3L13-0.ts) | [bp2autoK2](../../../../src/exercices/bp2/bp2autoK2.ts), [can4L1-02](../../../../src/exercices/can/4e/can4L1-02.ts), [can4L1-03](../../../../src/exercices/can/4e/can4L1-03.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [3P10](../../../../src/exercices/3e/3P10.ts) | [BP2CCF10](../../../../src/exercices/bp2/BP2CCF10.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [4C37](../../../../src/exercices/4e/4C37.ts) | [can4C3-03](../../../../src/exercices/can/4e/can4C3-03.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [5N1I-6](../../../../src/exercices/5e/5N1I-6.ts) | [can5C6-06](../../../../src/exercices/can/5e/can5C6-06.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6G6A](../../../../src/exercices/6e/6G6A.ts) | [geoTriangle1](../../../../src/exercices/geodyn/geoTriangle1.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N0A-6](../../../../src/exercices/6e/6N0A-6.ts) | [c3N10](../../../../src/exercices/CM/c3N10.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N1F-5](../../../../src/exercices/6e/6N1F-5.ts) | [can6N21-02](../../../../src/exercices/can/6e/can6N21-02.ts), [can6N21-03](../../../../src/exercices/can/6e/can6N21-03.ts), [can6N21-04](../../../../src/exercices/can/6e/can6N21-04.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N3F-1](../../../../src/exercices/6e/6N3F-1.ts) | [can6N21-05](../../../../src/exercices/can/6e/can6N21-05.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [6N3Q-2](../../../../src/exercices/6e/6N3Q-2.ts) | [BP2CCF14](../../../../src/exercices/bp2/BP2CCF14.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [CM1N4J](../../../../src/exercices/CM1/CM1N4J.ts) | [can6C1-09](../../../../src/exercices/can/6e/can6C1-09.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [bp2autoF5](../../../../src/exercices/bp2/bp2autoF5.ts) | [NCD20E1Q2](../../../../src/exercices/QCMBrevet/A2020/NCD20E1Q2.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [bp2autoD3](../../../../src/exercices/bp2/bp2autoD3.ts) | [NCD20E1Q4](../../../../src/exercices/QCMBrevet/A2020/NCD20E1Q4.ts) | Les formulaires conservés permettent de sélectionner les types et réglages des variantes. |
| [1A-C04-7](../../../../src/exercices/1e/1A-C04-7.ts) | [can5C3-01](../../../../src/exercices/can/5e/can5C3-01.ts) | La méthode délègue au parent puis reformule la consigne ; les cas et le mode QCM activable sont identiques. |
| [1A-C11-1](../../../../src/exercices/1e/1A-C11-1.ts) | [can2L12-01](../../../../src/exercices/can/2e/can2L12-01.ts) | La méthode délègue au parent puis adapte le clavier ; les cas et le mode QCM activable sont identiques. Le classement au Collège est reporté. |
| [1A-C12-1](../../../../src/exercices/1e/1A-C12-1.ts) | [can2L10-01](../../../../src/exercices/can/2e/can2L10-01.ts) | La méthode délègue au parent puis adapte le texte avant le champ ; les cas et le mode QCM activable sont identiques. |
| [1A-F07-4](../../../../src/exercices/1e/1A-F07-4.ts) | [can2G30-03](../../../../src/exercices/can/2e/can2G30-03.ts) | La méthode délègue au parent puis adapte le texte avant le champ ; les cas et le mode QCM activable sont identiques. Le classement QCM du Collège est reporté. |
| [6N1J](../../../../src/exercices/6e/6N1J.ts) | [6N0A-10](../../../../src/exercices/6e/6N0A-10.ts) | La méthode délègue au même générateur en exposant les types de nombres : type 1 pour les entiers ; types 2-3-4 pour les précisions décimales, avec même partie entière optionnelle. |
| [5P1C](../../../../src/exercices/5e/5P1C.ts) | [6P14-NoCapytale](../../../../src/exercices/6e/6P14-NoCapytale.ts) | Copie du même générateur : mêmes six familles de figures et mêmes deux paramètres. Conserver la version compatible Capytale. |

## Familles avec des modes distincts conservés

Ces familles ne sont pas des doublons entièrement substituables dans les
formulaires actuels. Une évolution des paramètres peut permettre de les
regrouper ultérieurement.

| Famille | Exercices encore présents dans une même feuille du CO | Motif de maintien |
|---|---|---|
| [6N1H-2](../../../../src/exercices/6e/6N1H-2.ts) | [6N1H-2](../../../../src/exercices/6e/6N1H-2.ts), [CM2N3J-1](../../../../src/exercices/CM2/CM2N3J-1.ts) | Le mode CM affiche un axe partant de zéro ; la version de sixième utilise un axe décalé. Ce choix n’est pas exposé dans le formulaire. |
| [6N1K](../../../../src/exercices/6e/6N1K.ts) | [2N14-1](../../../../src/exercices/2e/2N14-1.ts), [4G20-5](../../../../src/exercices/4e/4G20-5.ts) | Les versions imposent des objets différents : décimaux, racines carrées ou autres racines. Le champ version ne se sélectionne pas dans le formulaire. |
| [3A10-1](../../../../src/exercices/3e/3A10-1.ts) | [3A10-1](../../../../src/exercices/3e/3A10-1.ts), [4A10](../../../../src/exercices/4e/4A10.ts) | 4A10 impose une liste de nombres premiers limitée à 50 ; le représentant général ne propose que la restriction à 100. |
| [5N1L-4](../../../../src/exercices/5e/5N1L-4.ts) | [2N20-5](../../../../src/exercices/2e/2N20-5.ts), [4A11-0](../../../../src/exercices/4e/4A11-0.ts) | 2N20-5 impose un mode de seconde qui change les facteurs et l’écriture de la décomposition ; ce mode n’est pas une option du représentant conservé. |
| [4C30](../../../../src/exercices/4e/4C30.ts) | [2N41-1](../../../../src/exercices/2e/2N41-1.ts), [4C30](../../../../src/exercices/4e/4C30.ts) | Une version expose le choix des règles de calcul et les exposants négatifs ; l’autre expose le niveau des calculs complexes. Aucun formulaire ne reproduit tous les choix de l’autre. |
| [6P2B-1](../../../../src/exercices/6e/6P2B-1.ts) | [4S20](../../../../src/exercices/4e/4S20.ts), [5D2C](../../../../src/exercices/5e/5D2C.ts) | Le niveau impose le type d’expérience aléatoire et de question ; ce choix n’est pas un paramètre utilisateur. |
| [ExerciceEngrenages](../../../../src/exercices/ExerciceEngrenages.ts) | [3A12-1](../../../../src/exercices/3e/3A12-1.ts), [3A12-2](../../../../src/exercices/3e/3A12-2.ts), [3A12](../../../../src/exercices/3e/3A12.ts) | Les classes redéfinissent nouveauCas et la préparation : le partage du socle d’animation ne signifie pas que les problèmes soient identiques. |
| [3F21-1](../../../../src/exercices/3e/3F21-1.ts) | [3F21-1](../../../../src/exercices/3e/3F21-1.ts), [3F21](../../../../src/exercices/3e/3F21.ts) | Fonctions linéaires et fonctions affines sont imposées par le champ lineaire, absent du formulaire. |
| [_Yohaku](../../../../src/exercices/6e/_Yohaku.ts) | [6N0A-3](../../../../src/exercices/6e/6N0A-3.ts), [6N3autoD-4](../../../../src/exercices/6e/6N3autoD-4.ts) | L’addition ou la multiplication, ainsi que la nature des données, sont fixées dans les variantes ; les formulaires des exercices publiés n’exposent pas ces choix. |
| [_Roses](../../../../src/exercices/6e/_Roses.ts) | [6N0A-2](../../../../src/exercices/6e/6N0A-2.ts), [6N3autoD-3](../../../../src/exercices/6e/6N3autoD-3.ts) | L’opération et la nature des données sont fixées dans chaque variante ; addition et multiplication restent des tâches distinctes. |
| [4L13-3](../../../../src/exercices/4e/4L13-3.ts) | [3L13-7](../../../../src/exercices/3e/3L13-7.ts), [4L13-3](../../../../src/exercices/4e/4L13-3.ts) | Le niveau de troisième impose une résolution par équation et ajoute le choix d’un rang ; la version de quatrième permet une résolution intuitive. Les deux formulaires ne se couvrent pas entièrement. |
| [4C10-0](../../../../src/exercices/4e/4C10-0.ts) | [4C10-0](../../../../src/exercices/4e/4C10-0.ts), [4C10-1](../../../../src/exercices/4e/4C10-1.ts), [4C10-2](../../../../src/exercices/4e/4C10-2.ts) | Les produits, les quotients et les calculs de signes sont sélectionnés par le champ exo, non exposé dans le formulaire. |
| [4G20](../../../../src/exercices/4e/4G20.ts) | [4G20-1](../../../../src/exercices/4e/4G20-1.ts), [4G20](../../../../src/exercices/4e/4G20.ts) | Écrire ou compléter l’égalité de Pythagore est une tâche différente du calcul d’une longueur ; le champ typeDeQuestion n’est pas sélectionnable. |
| [5G1B-2](../../../../src/exercices/5e/5G1B-2.ts) | [5G1B-2](../../../../src/exercices/5e/5G1B-2.ts), [5G1B](../../../../src/exercices/5e/5G1B.ts) | Le premier quadrant ou les quatre quadrants sont imposés par quartDePlan, sans option pour basculer entre les deux. |
| [5G2A-1](../../../../src/exercices/5e/5G2A-1.ts) | [5G2A-1](../../../../src/exercices/5e/5G2A-1.ts), [BP1GEO06](../../../../src/exercices/bp1/BP1GEO06.ts) | BP1GEO06 impose le cylindre sans prisme ; l’autre version mélange les solides sans sélecteur correspondant. |
| [_Exercice_conversions](../../../../src/exercices/6e/_Exercice_conversions.ts) | [5G2D-3](../../../../src/exercices/5e/5G2D-3.ts), [6M1autoA](../../../../src/exercices/6e/6M1autoA.ts) | 6M1autoA impose la conversion d’une unité exactement ; 5G2D-3 convertit des quantités variables. Le choix valUnitaire n’est pas exposé. |
| [_Exercice_perimetres_et_aires](../../../../src/exercices/6e/_Exercice_perimetres_et_aires.ts) | [5G2E-3](../../../../src/exercices/5e/5G2E-3.ts), [5M11-2b](../../../../src/exercices/5e/5M11-2b.ts) | Les réponses en valeurs approchées par encadrement et les réponses arrondies sont imposées par valeurArrondie, sans option équivalente. |
| [5G2E-5](../../../../src/exercices/5e/5G2E-5.ts) | [5G2E-5](../../../../src/exercices/5e/5G2E-5.ts), [6M1D-1](../../../../src/exercices/6e/6M1D-1.ts) | 6M1D-1 demande un découpage de figure (mode 4), absent des trois choix périmètre/aire du formulaire général. |
| [_Construire_par_symetrie](../../../../src/exercices/6e/_Construire_par_symetrie.ts) | [5G3autoB-1](../../../../src/exercices/5e/5G3autoB-1.ts), [5G3autoB](../../../../src/exercices/5e/5G3autoB.ts) | La construction de points et celle d’une figure sont imposées par figure. Les orientations d’axes sont dédupliquées au sein de chacun de ces deux modes. |
| [VocabulaireDesTriangles](../../../../src/exercices/5e/VocabulaireDesTriangles.ts) | [VocabulaireDesTriangles](../../../../src/exercices/5e/VocabulaireDesTriangles.ts), [6G1autoB](../../../../src/exercices/6e/6G1autoB.ts) | Le champ classe impose un mode de vocabulaire distinct pour la sixième ; ce choix n’est pas exposé. |
| [_Ecrire_une_expression_numerique](../../../../src/exercices/5e/_Ecrire_une_expression_numerique.ts) | [5N1F-1](../../../../src/exercices/5e/5N1F-1.ts), [5N1F](../../../../src/exercices/5e/5N1F.ts), [5N5A-1](../../../../src/exercices/5e/5N5A-1.ts), [5N5B-4](../../../../src/exercices/5e/5N5B-4.ts), [5N5D](../../../../src/exercices/5e/5N5D.ts), [5N5B-3](../../../../src/exercices/5e/5N5B-3.ts) | Les champs version et litteral imposent des directions de traduction et des tâches numériques ou littérales différentes ; ces choix ne figurent pas dans les formulaires. |
| [5N5B-1](../../../../src/exercices/5e/5N5B-1.ts) | [5N5B-1](../../../../src/exercices/5e/5N5B-1.ts), [ex5L14-5](../../../../src/exercices/5e/ex5L14-5.ts) | La version simple impose les formes ax+b et a(x+b) ; la version générale peut tirer dix formes sans sélecteur permettant de limiter aux deux premières. |
| [6N1G-1](../../../../src/exercices/6e/6N1G-1.ts) | [6N0A-8](../../../../src/exercices/6e/6N0A-8.ts), [6N1G-1](../../../../src/exercices/6e/6N1G-1.ts), [CM2N1G-2](../../../../src/exercices/CM2/CM2N1G-2.ts) | Les modes entiers, décimaux et CM ont des graduations et des pas distincts, imposés par version. |
| [6N1H-3](../../../../src/exercices/6e/6N1H-3.ts) | [6N1H-3](../../../../src/exercices/6e/6N1H-3.ts), [CM2N3J-2](../../../../src/exercices/CM2/CM2N3J-2.ts) | Le mode CM et le mode sixième ne construisent pas le même axe ; la restriction n’est pas sélectionnable. |
| [6N1K-1](../../../../src/exercices/6e/6N1K-1.ts) | [6N1K-1](../../../../src/exercices/6e/6N1K-1.ts), [CM1N3K](../../../../src/exercices/CM1/CM1N3K.ts) | La version CM1 permet de travailler la partie entière et de fixer un encadrement ; la version sixième expose d’autres choix d’arrondis et de valeurs approchées. |
| [6N2E](../../../../src/exercices/6e/6N2E.ts) | [6N2E](../../../../src/exercices/6e/6N2E.ts), [CM1N5E](../../../../src/exercices/CM1/CM1N5E.ts) | La variante CM1 permet d’imposer un facteur précis (ou une table). Le formulaire général choisit le nombre de chiffres du facteur, pas sa valeur. |
| [6N2autoC](../../../../src/exercices/6e/6N2autoC.ts) | [6N2autoC](../../../../src/exercices/6e/6N2autoC.ts), [CM1N4F](../../../../src/exercices/CM1/CM1N4F.ts) | La version CM1 impose une puissance de 10 particulière et un domaine restreint de nombres ; ce mode n’est pas sélectionnable dans la version de sixième. |
| [6N2autoD](../../../../src/exercices/6e/6N2autoD.ts) | [6N2autoD](../../../../src/exercices/6e/6N2autoD.ts), [CM1N4G](../../../../src/exercices/CM1/CM1N4G.ts) | La version CM1 limite les puissances utilisées à 10 ; le formulaire de sixième ne permet pas d’exclure 100 et 1 000. |
| [6N3autoD-2](../../../../src/exercices/6e/6N3autoD-2.ts) | [6N3autoD-2](../../../../src/exercices/6e/6N3autoD-2.ts), [CM2N1H](../../../../src/exercices/CM2/CM2N1H.ts) | Le mode CM limite la borne des nombres utilisés ; la version de sixième ne permet pas de sélectionner cette borne. |
| [CM2G2B-2](../../../../src/exercices/CM2/CM2G2B-2.ts) | [CM2G2A-1](../../../../src/exercices/CM2/CM2G2A-1.ts), [CM2G2B-1](../../../../src/exercices/CM2/CM2G2B-1.ts), [CM2G2B-2](../../../../src/exercices/CM2/CM2G2B-2.ts) | Les droites parallèles, perpendiculaires et leur mélange sont imposés par type, non sélectionnable dans le formulaire. |

## Variantes non classées qui ne sont pas exclues automatiquement

Ces cas ont été contrôlés et restent à examiner pour leur propre usage :

- 1A-G03-8 permet la recherche d’un côté différent de l’hypoténuse imposée par 1A-G03-9.
- EAM-AGTechno-2026-Q11 conserve le sujet original et ses effectifs ; la variante classée propose des données générées.
- can2F22-02 impose un domaine de calcul mental pour la fonction inverse, absent des réglages de 2F22-1. Les variantes valeur absolue et racine carrée ne sont pas couvertes par les feuilles actuelles réservées à inverse/carré/cube.
- can2L11-03 et can2L2-06 utilisent un mode CAN spécifique qui modifie les cas ou la tâche ; le champ can n’est pas une option du formulaire général.
- BP1AUTO087 impose exclusivement une différence de deux carrés ; ce choix n’est pas proposé dans le formulaire de 2L12-9.
- 4G40-1 impose un autre type de racine dans le générateur de placement/encadrement.
- LabyrintheColineaires redéfinit les questions et les réponses : le socle du labyrinthe ne suffit pas à le considérer comme un doublon.
- P020 reste un outil à mots personnalisables ; la variante classée est consacrée aux tables de multiplication.
- can6C2-01 demande de compléter pour obtenir un nombre pair ; CM1N4K ajoute le choix pair ou impair sans sélecteur de ce mode.

Les modèles techniques préfixés par un soulignement ne sont pas des variantes
à classer : ne pas leur attribuer NR seulement parce qu’ils servent de base.

## Vérifications

Pour chaque variante écartée, le représentant et les catégories reprises
sont vérifiés. Aucun NR ne coexiste avec une référence active. Aucun même
uuid n’apparaît deux fois dans une feuille du CO, du Collège ou du
Préqualifiant. Les seules modifications des fichiers d’exercices sont les
tableaux fr-ch ; les références des autres pays restent identiques.
