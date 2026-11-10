# Structure du référentiel suisse

État : **référentiel en cours de révision** (novembre 2026). L'ordre de
navigation du Cycle d'orientation, les regroupements de 9e, l'organisation
des QCM et le tri numérique des références sont validés et appliqués le
03/11/2026.

## Niveaux

```
Cycle d'orientation
  9R3, 9R2, 9R1        (9e : regroupements)
  10LS, 10LC, 10CT     (10e : sections)
  11LS, 11LC, 11CT     (11e : sections)
Collège
  1re année … 4e année (organisation actuelle, simplement regroupée)
Préqualifiant
  PRQST … PRQPF        (domaines du plan d'études, feuilles par niveau N1 à N3)
Non classés, Primaire  (inchangés)
```

Ordre des niveaux validé et appliqué le 04/11/2026 : années croissantes,
avec R3 → R2 → R1 en 9e et LS → LC → CT en 10e et 11e. Cet ordre est
commun aux vues bureau, mobile et Typst.

## Codes (validé le 03/11/2026)

`<année><section><axe><notion><sous-thème>`, alias `<code>-<n°>` :
`9R2NO4F` est la feuille de conversion des écritures de fractions de 9R2,
et `9R2NO4F-4` un exercice de cette feuille.

- Axes, dans l'ordre d'affichage cible : `NO` Nombres et opérations (MSN 32),
  `FA` Fonctions et algèbre (MSN 33), `ES` Espace (MSN 31),
  `GM` Grandeurs et mesures (MSN 34).
- Une notion garde le même numéro dans les trois sections d'une année
  (`9R1NO3`, `9R2NO3`, `9R3NO3`), même si une section n'en a qu'une partie.
- Le numéro d'exercice suit l'ordre de difficulté dans la feuille.

## Ordre de navigation du CO (validé le 03/11/2026)

L'ordre des axes et des catégories suit les moyens d'enseignement. Il est
commun aux neuf niveaux du CO (`9R3`, `9R2`, `9R1`, `10LS`, `10LC`, `10CT`,
`11LS`, `11LC`, `11CT`). Chaque niveau affiche les catégories correspondant
aux apprentissages de son année et de son regroupement ou de sa section.

| Ordre | Axe | Catégories, dans l'ordre |
|---|---|---|
| 1 | NO — Nombres et opérations | Nombres décimaux et calcul → Multiples, diviseurs et nombres premiers → Nombres relatifs → Fractions → Puissances et racines → Probabilités. |
| 2 | FA — Fonctions et algèbre | Proportionnalité → Fonctions → Diagrammes → Calcul littéral → Équations. |
| 3 | ES — Espace | Géométrie du plan → Solides → Transformations → Repérage. |
| 4 | GM — Grandeurs et mesures | Périmètres et aires → Pythagore → Thalès → Volumes et aires → Unités et mesures. |

Cet ordre doit être respecté dans les différentes vues du menu. L'ordre
alphabétique des codes ne définit pas la progression de navigation.
Les tableaux de classement antérieur ci-dessous conservent les codes et les
inventaires issus des passes précédentes. Les organisations cibles et la
correspondance des groupes décrivent désormais le menu appliqué.

L'ordre d'insertion dans `tasks/emptyRefCH.json` fixe l'ordre des catégories,
y compris lorsque les codes conservés suivent un autre ordre. Les vues
bureau, mobile et Typst conservent cette progression. Les feuilles déplacées
peuvent garder un code différent du préfixe de leur nouveau groupe parent.

### QCM du CO (organisation validée le 03/11/2026)

Chaque niveau conserve un accès QCM distinct, placé après les quatre axes
principaux. Cet accès est subdivisé par axe, dans le même ordre que le menu :

```text
9R2
├── Nombres et opérations.
├── Fonctions et algèbre.
├── Espace.
├── Grandeurs et mesures.
└── QCM
    ├── Nombres et opérations.
    ├── Fonctions et algèbre.
    ├── Espace.
    └── Grandeurs et mesures.
```

- Les axes sans exercice ne sont pas affichés.
- Avant la répartition par axe, vérifier pour chaque exercice sa compatibilité
  avec l'année et le regroupement ou la section, ainsi que la disponibilité
  d'une version QCM. La subdivision du menu ne règle pas les dépassements de
  programme.
- Si un axe reste volumineux après cette vérification, le subdiviser par
  notion (fractions, puissances, probabilités…). Ne créer ces subdivisions
  que lorsque le nombre d'exercices le justifie.
- L'accès QCM complète la recherche par notion dans les axes principaux.
  Il remplace l'ancienne feuille QCM unique de chaque niveau.

Les feuilles utilisent `<niveau>QCM<axe>-<n°>` ; une subdivision par notion
ajoute un numéro, puis une lettre si nécessaire (`11LSQCMFA2D-1`). Les anciens
alias `<niveau>QCM-<n°>` ont été remplacés. Les uuid et les tirages sont
conservés. Chaque feuille contient au plus quinze exercices lors de cette
passe.

La vérification a notamment déplacé les sommes de fractions vers 9R3 et
10CT/LC, les nombres premiers de 9R1 vers 10CT, les moyennes vers les
diagrammes de 10e, et les programmes de calcul mêlant relatifs et fractions
vers 10LS et la 11e. Les évolutions de pourcentages ne sont plus proposées en
9e et les fonctions sont retirées des QCM de 10CT. Les équations générales du
second degré et la factorisation par identités remarquables sont réservées à
11LS ; les cas se ramenant à $ax^2=b$ sont aussi proposés en 10LC, 10LS,
11CT et 11LC, selon la décision complémentaire ci-dessous. Les
fonctions quadratiques de 11LS ont une feuille « sensibilisation » dédiée.

Cinq exercices sont sortis des QCM du CO parce que leur contenu dépasse les
apprentissages prévus :

| Exercice | Motif | Classement suisse après la passe |
|---|---|---|
| 1A-C07-4 | Conversion kWh/J. | Non classés. |
| 1A-C03-14 | Puissances négatives de fractions. | Non classés. |
| 1A-C01-5 | Comparaisons fondées sur les variations des fonctions de référence. | Non classés. |
| 1A-C03-11 | Expressions rationnelles avec puissances littérales de degré jusqu'à 10. | Non classés. |
| 1A-F03-1 | Reconnaissance de fonctions affines avec des coefficients irrationnels. | Collège, 1mQCM. |

Ces corrections concernent les classements QCM de la première passe. La
décision complémentaire ci-dessous rétablit uniquement les QCM se ramenant à
$ax^2=b$ dans les niveaux concernés ; les autres retraits sont maintenus.

### Tri numérique des références (validé le 03/11/2026)

Appliquer un tri naturel des références, en comparant leurs nombres
numériquement : `-1`, `-2`, …, `-9`, `-10`, plutôt que `-1`, `-10`, `-2`.
Par exemple, `9R2NO4F-2` doit apparaître avant `9R2NO4F-10`.

Ce changement concerne le tri d'affichage et conserve les références. Il doit
être identique dans le menu de bureau, la navigation mobile et la sélection
d'exercices Typst. La progression de difficulté reste à organiser lors du
classement : le tri numérique ne la détermine pas à lui seul.

## Ajustements pédagogiques validés et appliqués le 03/11/2026

### Déduplication des variantes (complément validé le 03/11/2026)

Dans chaque catégorie, retenir le représentant le plus paramétrable capable
de couvrir les cas utiles des variantes, plutôt que compter les options
activées par défaut. Les tâches ou modes non sélectionnables restent
distincts. Reporter les classements utiles sur le représentant, en conservant
sa référence si elle existe déjà dans la feuille ; les variantes entièrement
couvertes sans autre usage suisse reçoivent `['NR']` pour ne plus apparaître
dans « Non classés ». Vérifier le CO, le Collège et le Préqualifiant avant
d'appliquer `NR`.

Les regroupements, exceptions et réglages sont détaillés dans
[doublons-co.md](doublons-co.md). Le menu régénéré donne les effectifs après
déduplication ; les comptages datés des premières passes ci-dessous décrivent
les inventaires de ces passes.

### Autres ajustements pédagogiques

Les exercices présents dans les moyens d'enseignement peuvent rester classés
lorsque leurs paramètres permettent de sélectionner les cas adaptés. Les
réglages sont choisis par l'enseignant dans le formulaire de l'exercice et
consignés dans [lacunes.md](lacunes.md#réglages-par-section). Le classement
n'impose pas automatiquement ces réglages et ne modifie pas les valeurs par
défaut communes aux autres référentiels.

- **Sensibilisation** : conserver la mention dans le titre du chapitre ou de
  la feuille portant cet apprentissage. Les titres existants sont maintenus ;
  les mentions manquantes sont ajoutées en 10CT (notation scientifique,
  construction de diagrammes, conventions d'écriture), 11LC (géométrie du
  plan) et 11CT (patron du cylindre, élaboration et équivalence d'expressions
  littérales). Les équations en CT, y compris la mise en équation, ne portent
  pas la mention « sensibilisation ».
- **Multiples, diviseurs et nombres premiers** : cet intitulé remplace
  « Arithmétique » en 9R1, 9R2, 9R3 et 10CT. Les sous-rubriques conservent
  leurs références.
- **Notation scientifique en CT** : conserver 4C32 avec la difficulté
  « Facile », et les questions DNB Asie et Centres étrangers 2026 portant
  sur des grands nombres. Retirer de 10CT et 11CT les classements de
  2N41-2, 3AutoN07-1, 1A-C03-10 et des questions DNB Métropole et Polynésie
  2026, qui ne permettent pas d'exclure les exposants négatifs. Retirer
  également 4C32-4 de 11CT. Les opérations avec la notation scientifique
  relèvent de la 11e LS, y compris lorsque les exposants sont positifs :
  11NO3A-2 quitte 10LC, 10LS et 11CT pour `11LSNO3A-1` ; 4C32-4 quitte
  10LC et 10LS pour `11LSNO3A-2`. Cette feuille « Opérations avec la notation
  scientifique » se situe après Propriétés des puissances et avant
  Propriétés des racines. Les feuilles NO5B de 10LC/LS deviennent
  « Conversions, comparaison et problèmes » ; pour 4C32-3, ne sélectionner
  que le type 1, sans opération en notation scientifique.
- **Équations de la forme $ax^2=b$** : créer 10LC/10LS FA5E et 11CT/11LC
  FA4H, avec 3L15 (type 4), 1A-C10-1 et 1A-C10-7. Dans ces quatre niveaux,
  3L15 quitte la feuille de résolution du premier degré. Sa correction
  actuelle utilise la factorisation. Ses classements de 11LS sont conservés,
  avec les types 6 et 7 pour le premier degré. Les deux automatismes
  1A-C10-1 et 1A-C10-7 sont également ajoutés ou rétablis dans les QCM de
  ces quatre niveaux. Les formes $(x+a)^2=k$ et $ax^2+bx=0$ ne sont pas
  réintroduites en CT ou LC.
- **Calcul littéral** : conserver les exercices réglables en coefficients
  entiers, degré et nombre de variables adaptés à la section. 1A-C08-4 et
  1A-C08-5, qui imposent respectivement fractions et décimaux sans option
  pour les écarter, quittent 10LC, 10LS, 11CT et 11LC ; ils restent en 11LS.
- **Fonctions en 11e** : conserver 2F21-10 avec les cas adaptés parmi 1 à 4,
  en excluant le cas 5 et le mélange ; conserver 2F21-6 pour les cas de sens
  de variation sans construction de tableau. Retirer 2F21-7 des trois
  sections du CO, car tous ses réglages demandent un tableau de signes ; il
  passe dans « Non classés ».
- **Diagrammes en 9e** : conserver 5D1D et 4S10 avec les diagrammes en
  bâtons ou cartésiens, et 5D1D-1 avec le diagramme en barres.
- **Patron du cylindre** : conserver 5G2B en 10CT, 10LC et 10LS, où ces
  exercices figurent dans les moyens, ainsi que ses classements en 11e.

### Catégories à ouvrir lorsque les exercices adaptés seront disponibles

Les emplacements ci-dessous sont réservés dans la documentation ; aucune
rubrique vide n'est créée dans le menu. Les codes et les constats détaillés
figurent dans [lacunes.md](lacunes.md#catégories-en-attente-dexercices).

| Année et niveaux | Emplacement | Feuilles à créer ou à compléter |
|---|---|---|
| 9e R2 R3 ; tous pour les cas adaptés de conversion inverse | NO > Fractions | Fraction vers nombre périodique ; nombre périodique vers fraction (tiers, puis neuvièmes en R3). |
| 10e CT LC LS | FA > Proportionnalité | Pente d'une route ou d'une rampe. |
| 10e CT LC LS | ES > Géométrie du plan | Polygones réguliers (sensibilisation en CT). |
| 10e CT LC LS | NO > Puissances et racines > Racines | Racine cubique. |
| 11e LC LS ; LS pour le cercle de Thalès | ES > Géométrie du plan | Angles au centre et inscrits, tangente, cercle de Thalès. |
| 11e LC LS | ES > Solides | Patrons et perspective de la pyramide ; perspective du cylindre. |
| 11e LS | ES > Transformations | Similitude (sensibilisation). |
| 11e CT LC LS | FA > Proportionnalité | Masse volumique (sensibilisation en CT). |
| 11e LS | FA > Fonctions | Tracé de fonctions quadratiques et racine carrée à partir de tableaux de valeurs (sensibilisation). |
| 11e LS | FA > Équations | Mise en équation de problèmes du second degré ; mise en système. |

4G52 « Se repérer sur un pavé droit » n'est pas retenu pour le CO : il porte
sur la lecture et le placement de points à trois coordonnées dans un repère
de l'espace. La proposition de classement futur est retirée ; aucune feuille
de repérage en 3D n'est prévue au titre de cet exercice.

## 9e (validée le 03/11/2026)

Sections : R1 = Niv. 1, R2 = Niv. 2, R3 = Niv. 3. « tous » = R1, R2 et R3.
Entre parenthèses : feuilles actuelles reprises et leur nombre d'exercices.

### NO Nombres et opérations : organisation cible validée le 03/11/2026

Regrouper les rubriques actuelles NO2 Nombres décimaux, NO6 Calcul réfléchi
et calcul mental, NO7 Opérations sur les nombres décimaux et problèmes et
NO8 Priorité des opérations dans « Nombres décimaux et calcul » :

```text
Nombres décimaux et calcul
├── Numération, écritures et comparaison
│   ├── Valeur des chiffres, décomposer et recomposer.
│   ├── Écrire et reconnaître les nombres décimaux.
│   ├── Se repérer sur une droite graduée.
│   └── Comparer, encadrer, arrondir et approcher.
├── Calcul mental et réfléchi
│   ├── Livrets.
│   ├── Addition et soustraction.
│   ├── Multiplication et division.
│   ├── Utiliser la distributivité.
│   ├── Multiplier et diviser par 10, 100, 1 000…
│   └── Jeux de calcul.
├── Opérations et priorités
│   ├── Algorithmes des quatre opérations.
│   ├── Vocabulaire des opérations.
│   ├── Priorités et parenthèses.
│   ├── Traduire un enchaînement par une expression.
│   └── Estimer et vérifier un résultat.
└── Résolution de problèmes
    ├── Problèmes numériques.
    ├── Démarches de résolution.
    └── Problèmes de prix, de masses et de quantités.
```

Ces intitulés décrivent les regroupements. Les feuilles précises peuvent
être conservées : distinguer notamment les algorithmes d'addition et de
soustraction, de multiplication et de division, ainsi que les calculs avec
10, 100, 1 000 et avec 0,1 ; 0,01 ; 0,001.

Cette organisation est commune à R1, R2 et R3. Elle ajoute un étage de
navigation : présenter les quatre sous-groupes de façon compacte, sans
déplier tous leurs exercices dès l'ouverture de NO. Les autres rubriques
suivent dans l'ordre validé : Multiples, diviseurs et nombres premiers,
Nombres relatifs, Fractions, Puissances et racines, puis Probabilités lorsque
la notion est au programme.

Correspondance appliquée : NO0 est le groupe « Nombres décimaux et calcul » ;
NO2 et NO6 conservent leurs feuilles ; NO7 reçoit les algorithmes NO7A-C,
les feuilles de priorités NO8A-C et la vérification d'un résultat NO7D ;
NO9 regroupe les problèmes NO7E-G. Les références de ces exercices n'ont pas
changé. Le groupe intermédiaire NO8 a été supprimé.

### ES Espace : validé le 03/11/2026 (161 exercices)

#### Organisation cible validée le 03/11/2026

Dans « Géométrie du plan », remplacer la rubrique commune « Triangles,
quadrilatères et cercles » par trois rubriques sœurs. Les éléments de base
et les constructions transversales ont leur propre rubrique :

```text
Géométrie du plan
├── Vocabulaire et constructions de base
│   ├── Segments, droites et demi-droites.
│   ├── Parallèles et perpendiculaires.
│   ├── Angles.
│   ├── Médiatrice et bissectrice.
│   └── Vocabulaire et codage des polygones.
├── Triangles
│   ├── Reconnaissance, propriétés et somme des angles.
│   ├── Constructibilité et inégalité triangulaire.
│   ├── Construction de triangles.
│   ├── Hauteurs et droites remarquables.
│   └── Médianes et centre de gravité — R2 et R3.
├── Quadrilatères
│   ├── Reconnaissance et propriétés.
│   └── Construction de quadrilatères.
└── Cercles
    ├── Vocabulaire, cercle et disque.
    ├── Distances et constructions au compas.
    └── Cercles inscrit et circonscrit.
```

| Contenu à répartir | Emplacement cible |
|---|---|
| Construire une médiatrice ou une bissectrice. | Vocabulaire et constructions de base. |
| Tracer une hauteur ou une médiane d'un triangle. | Triangles. |
| Construire le cercle circonscrit d'un triangle. | Cercles. |
| Nommer et coder des polygones quelconques. | Vocabulaire et constructions de base. |

En R1, la mention « sensibilisation » concerne les cercles inscrit et
circonscrit, et non toute la rubrique « Cercles ».

Correspondance appliquée : ES0 Géométrie du plan contient ES1 Vocabulaire et
constructions de base, ES2 Triangles, ES6 Quadrilatères et ES7 Cercles.
ES2D (médiatrice et bissectrice) est déplacée sous ES1 ; les exercices de
vocabulaire des polygones quittent ES2H pour ES1D. ES2G est remplacée par
ES7A (vocabulaire), ES7B (distances et compas) et ES7C (cercles inscrit et
circonscrit). Les autres feuilles conservent leurs références.

#### Classement antérieur à réorganiser

Notions : ES1 Droites et angles, ES2 Triangles, cercles et quadrilatères
(Figures planes coupées en deux, trop de feuilles), ES3 Solides, ES4 Transformations,
ES5 Repérage dans le plan.

| Feuille | Titre | Sections |
|---|---|---|
| ES1A | Vocabulaire, notations et codage | tous |
| ES1B | Droites parallèles et perpendiculaires | tous |
| ES1C | Angles : nommer, mesurer, construire | tous |
| ES2A | Triangles : vocabulaire et somme des angles | tous |
| ES2B | Construire des triangles | tous |
| ES2C | Triangles constructibles et inégalité triangulaire | tous |
| ES2D | Médiatrice et bissectrice | tous |
| ES2E | Hauteurs et droites remarquables | tous |
| ES2F | Médianes et centre de gravité | R2-R3 |
| ES2G | Cercle, disque et cercle circonscrit | tous |
| ES2H | Polygones et quadrilatères : reconnaître et propriétés | tous |
| ES2I | Construire des quadrilatères | tous |
| ES3A | Reconnaître et décrire des solides | tous |
| ES3B | Perspective cavalière et patrons | tous |
| ES3C | Voir dans l'espace | tous |
| ES4A | Translation | tous |
| ES4B | Symétrie axiale : construire | tous |
| ES4C | Symétrie axiale : pavages, propriétés, coordonnées | tous |
| ES4D | Symétrie centrale : construire | tous |
| ES4E | Symétrie centrale : pavages, coordonnées, reconnaître | tous |
| ES4F | Identifier et enchaîner des transformations | tous |
| ES5A | Coordonnées d'un point dans un repère | tous |

Rotations (9ES3D, 4G10-1, 3G10-1) gardées pour la 10e ; 5P1C (agrandissement)
pour FA. ES2E reste pour toutes les sections, même si trois exercices
touchent aussi les médianes.

### FA Fonctions et algèbre : validé le 03/11/2026

| Feuille | Titre | Sections |
|---|---|---|
| FA1A | Reconnaître une situation de proportionnalité | tous |
| FA1B | Tableaux de proportionnalité | tous |
| FA1C | Résoudre des problèmes de proportionnalité | tous |
| FA1D | Proportionnalité en calcul mental | tous |
| FA1E | Agrandissement et réduction | tous |
| FA2A | Lire des tableaux et organiser des données | tous |
| FA2B | Lire et interpréter un diagramme | tous |
| FA2C | Représenter des données | tous |
| FA3A | Calculer la valeur d'une expression littérale | R2-R3 |

Aussi : NO7G Problèmes de prix, de masses et de courses (8 exercices de 9FA2B
qui ne sont pas de la proportionnalité), ES5A-6/7 (DNB 2026), feuille QCM par
section avec les numéros de 9QCM. Pourcentages et échelle : 10e. FA1E n'a qu'un
exercice (lacune MathALÉA).

### GM Grandeurs et mesures : validé le 03/11/2026 (59 exercices)

Mêmes feuilles dans les trois sections (le PER ne différencie pas la 9e).

| Notion | Sous-thèmes | Nb |
|---|---|---|
| GM1 Longueurs | A Calculer et comparer des périmètres | 9 |
| GM2 Aires | A Unités d'aire, comptage et comparaison · B Aire du carré, du rectangle et du triangle · C Parallélogramme, losange et quadrilatères · D Périmètre et aire : problèmes · E Figures composées | 6 · 11 · 3 · 4 · 3 |
| GM3 Aires totales et volumes | A Unité de volume et dénombrement · B Volume et aire totale du cube et du pavé | 5 · 4 |
| GM4 Mesure et conversions | A Préfixes et choix de l'unité · B Convertir des longueurs et des masses · C Convertir des aires · D Unités de temps (sensibilisation) · E Unités de volume (sensibilisation) | 4 · 5 · 5 · 10 · 1 |

GM1 reste une notion à une feuille (découpage de l'annexe cantonale).
Unités de temps et de volume : sensibilisation en 9e (« s » des indications
pédagogiques), évaluées en 10e ; elles iront aussi en 10e. 5G2D-2 (unités de
volume et litres) n'est pas en 9e : le PER demande d'éviter ces conversions
au degré 9. Réservés à la 10e : disques (5M11-2b), volume en litres (DNB 2026
Polynésie). 4G22-3
(Pythagore) : 10e LC-LS. Laissés en NR : 6M2C, 6M2C-1, 6M1D, 6M1autoE-4
(doublons apparents de versions classées).

### QCM

Le classement antérieur comporte une feuille unique par regroupement
(`9R1QCM`…), reprise de 9QCM. L'organisation cible est l'accès QCM subdivisé
par axe décrit dans la section « QCM du CO ».

### Compléments du 03/11/2026 (indications pédagogiques du CO)

- FA3 renommée « Calcul littéral » : FA3B Conventions d'écriture
  (sensibilisation, 3) et FA3C Écrire une expression littérale
  (sensibilisation, 6), en R2-R3 (« 9e N2 s N3 s »).
- NO4F-10 : 1mCN4 (nombre périodique en fraction), tous ; réglage à adapter
  (période de 1 chiffre, sans décimale hors période). Ces réglages ne limitent
  pas aux tiers : conserver ce classement provisoire en attendant l'exercice
  ciblé documenté dans `lacunes.md`. Rien ne permet encore de passer d'une
  fraction à un nombre périodique (9e N2 N3).
- Une feuille de sensibilisation porte « (sensibilisation) » dans son titre.

Restent seulement dans l'ancienne 9e (24, pour la 10e ou la 11e) : rotations
(9ES3D, 4G10-1, 3G10-1), multiplication et division des relatifs (9NO2C),
calcul de pourcentages (6N3Q, can2I2-01).

## 10e

Sections : CT = N1, LC = N2, LS = N3 (indications pédagogiques du CO).
CT Communication et technologie, LC Langues vivantes et communication,
LS Littéraire-scientifique (le menu n'affiche que le code).

### ES Espace : validé le 03/11/2026 (26 exercices, mêmes feuilles CT, LC, LS)

| Notion | Sous-thèmes | Nb |
|---|---|---|
| ES1 Solides | A Reconnaître et décrire des solides · B Perspective et patrons | 6 · 3 |
| ES2 Transformations | A Rotation · B Identifier et enchaîner des isométries · C Propriétés de conservation | 5 · 8 · 4 |

Polygones réguliers (10e N1 s N2 N3) : aucun exercice dans MathALÉA
(lacune) ; la notion prendra le code ES3 quand il y en aura. 3G10-1 : types 1
à 4 (sans homothétie). 5G2B (patron de cylindre, 11e) gardé en 10e où il
était. Agrandissement et réduction : en FA (Proportionnalité), comme en 9e.

### FA Équations : complément validé le 03/11/2026

| Feuille | Sections | Nb |
|---|---|---|
| FA5E Équations de la forme $ax^2=b$ | LC LS | 3 |

3L15 est proposé avec le type 4 ; les deux autres exercices figurent aussi
dans QCM > Fonctions et algèbre > Équations.

## 11e (classée et validée le 03/11/2026)

Mêmes sections et titres qu'en 10e. Une feuille n'existe que dans les
sections où sa notion est au programme (indications pédagogiques) ; une
même feuille peut avoir un contenu différent selon la section (FA2H, FA3E).

| Feuille | Sections | Nb |
|---|---|---|
| ES1A Angles alternes-internes, adjacents, opposés par le sommet | LC LS | 7 |
| ES2A Propriétés des solides (cône, sphère) | CT LC LS | 2 |
| ES2B Développements (patrons) et représentation du cylindre | CT LC LS | 1 |
| ES3A Homothétie | LC LS | 7 |
| NO1A-C 4 opérations dans ℤ (règle des signes, × et :, priorité) | CT | 4 · 9 · 7 |
| NO2A Multiplication et division de fractions · NO2B 4 opérations dans ℚ : priorité | CT LC | 8 · 10 |
| NO2C Calcul réfléchi ou mental : 4 opérations dans ℚ+ (CAN seulement) | LC | 10 |
| NO3A Écriture scientifique avec exposants entiers positifs | CT | 3 |
| NO3A Opérations avec la notation scientifique | LS | 2 |
| NO3B Propriétés des puissances | LC LS | 11 |
| NO3C Propriétés des racines | LS | 6 |
| NO4A Exploration d'ensembles de possibilités et organisation de dénombrement | CT LC LS | 9 |
| NO4B Traitement de situations aléatoires à l'aide de notions de probabilités | LC LS | 10 |
| NO4C Raisonnement probabiliste : cas favorables et cas possibles | LS | 15 |
| NO5A Ensembles de nombres | LC LS | 3 |
| FA1A Vitesse moyenne | CT LC LS | 10 |
| FA1C Débit | LS | 1 |
| FA2A Lecture de tableaux de valeurs et de représentations graphiques · FA2B Vocabulaire et calcul d'images | CT | 11 · 10 |
| FA2C Tracé de droites et de courbes à l'aide de points et de tableaux de valeurs | CT LC LS | 4 |
| FA2D Fonctions linéaires et affines | CT LC LS | 9 |
| FA2E Passage de la représentation graphique à l'expression fonctionnelle | LC LS | 11 |
| FA2F Fonctions inverses, carrés, cubiques | LC LS | 6 |
| FA2G Fonctions quadratiques (sensibilisation) | LS | 3 |
| FA2H Reconnaissance et modélisation de situations par des fonctions | CT (16) · LC LS (6) | |
| FA3A Règles et conventions d'écriture | CT | 5 |
| FA3B Substitution · FA3C Élaboration · FA3D Expressions équivalentes | CT LC LS | 12 · 8 · 3 |
| FA3E Polynômes du premier degré (CT, 8) · Écriture réduite et ordonnée de polynômes (LC, 11 ; LS, 13) | | |
| FA3F Multiplication de polynômes (distributivité double) | LC LS | 15 |
| FA3G Identités remarquables · FA3H-I Décomposition en facteurs (mise en évidence, identités) · FA3J Preuve | LS | 13 · 7 · 8 · 5 |
| FA4A Mise en équation (1er degré) | CT LC LS | 11 |
| FA4C Résolution (1er degré) | CT LC (12) · LS (13) | |
| FA4B Tester si un nombre est solution | CT | 4 |
| FA4D Transformations de formules | LC LS | 11 |
| FA4E-F Second degré (factorisation, formule de Viète) · FA4G Systèmes | LS | 10 · 5 · 11 |
| FA4H Équations de la forme $ax^2=b$ | CT LC | 3 |
| GM1A Volume du cylindre | CT | 3 |
| GM1B Pyramide · GM1C Cône | LC LS | 2 · 4 |
| GM1D Sphère | LS | 3 |
| GM1E Volume par décomposition · GM1F Grandeur manquante | CT LC LS | 7 · 3 |
| GM2A Pythagore dans le plan | CT | 9 |
| GM2B Pythagore (réciproque et contraposée) | LC LS | 1 |
| GM3A Figures semblables · GM3B Thalès direct · GM3C Thalès réciproque | LC LS | 6 · 9 · 1 |
| GM4A Conversion d'unités composées (vitesse) | CT LC LS | 3 |
| QCM (ancien 11QCM sans CAN ; CT sans puissances, factorisation, second degré ; LC sans factorisation) | CT · LC · LS | 32 · 40 · 43 |

- Les feuilles CT de 11e qui reprennent une notion vue en 10e par LC et LS
  (relatifs, fractions, fonctions, Pythagore, cylindre) reprennent les listes
  de 10e LS.
- Hors programme de 11e, donc reclassé ailleurs : 5D1F (moyennes) en 10e
  FA2A. 4C32-4 et 11NO3A-2 relèvent de la 11e LS pour les opérations en
  notation scientifique. Les exercices de l'ancienne 11e déjà classés en 9e
  (5G4A-2 à 4, 6G6D, 6G6F-1) n'y sont pas repris.
- Les applications externes (`src/exercices/apps/`, mathix : repérage dans
  l'espace, perspective, réciproque de Pythagore) sont exclues du menu
  international par `updateMenuInternational.js`.

## Préqualifiant (classé le 03/11/2026, à valider)

Sources : plan d'études cadre de mathématiques du Préqualifiant (2026-2029)
et son annexe (un exercice type par compétence, numérotées 1 à 104), plus une
correspondance compétence ↔ exercices MathALÉA tenue hors dépôt. Les trois niveaux
visent les débouchés : Niv. 1 AFP, Niv. 2 CFC à exigences moyennes, Niv. 3
CFC à exigences élevées, ECG et CFP Com.

- Arborescence : domaine > notion (une ligne du plan) > feuille (une cellule
  du plan, un niveau). Codes `PRQ<domaine><notion><lettre>`, alias
  `PRQNO06B-3`. Domaines dans l'ordre du plan : `PRQST` Structurer son
  raisonnement, `PRQNO` Nombres et opérations, `PRQAL` Algèbre, `PRQES`
  Espace et formes, `PRQMG` Mesures et grandeurs, `PRQPF` Proportionnalité,
  fonctions et analyse de données. Le menu garde l'ordre d'insertion des
  domaines et des notions (pas de préfixe numérique) et trie les feuilles par
  code.
- Titre d'une feuille : intitulé du plan précédé du niveau, `N2 · Calculer
  avec des nombres entiers relatifs (+, −, ×, ÷)`. Une cellule qui couvre
  plusieurs savoir-faire est découpée en feuilles du même niveau (ES01 A à C,
  ES02 A à C, ES07 A et B…).
- `regexpPRQ` dans `ReferentielNode.svelte` masque le code des feuilles ;
  vue mobile : section « Préqualifiant », une entrée par domaine.
- 108 feuilles, 673 exercices, 827 alias. La feuille « Représenter une
  figure plane par un croquis » (N1) n'est pas créée : aucun exercice.

Règles propres au Préqualifiant :

- Aucun exercice de lycée (`2e`, `1e`, `1eTec`, `EAMPremiere`, automatismes
  1A et 2A), même quand le titre correspond : vocabulaire et exigences trop
  lourds pour ce public. Les exercices de bac pro (`bp1`, `bp2`) restent.
  Pas de sujet de brevet qui mêle plusieurs notions (3Z1DNB, 3G20DNB0…).
- Pas de CAN (aucune n'est nécessaire à ce jour).
- Les exercices viennent de la correspondance (ligne du plan) puis des
  feuilles du Cycle d'orientation de même contenu ; chaque feuille est
  ensuite relue. Un exercice apporté par une ligne de la correspondance mais
  hors sujet dans une autre cellule est restreint aux feuilles où il est
  pertinent (par ex. bp2AutoV4 seulement en MG01B, 2I11-1 retiré).
- Les cellules voisines ne partagent pas leurs exercices quand le plan les
  distingue : ST01A (organiser) et PF01A (lire), ES01C (somme des angles) et
  ES02A (propriétés des triangles), AL03A (+, −) et AL03B (×, ÷), AL05B
  (coefficients entiers) et AL05C (rationnels), MG04D (temps simples) et
  MG04E (unités composées).
- Niv. 3 « double distributivité » et « mise en évidence » : seulement le
  développement de deux binômes et la mise en évidence d'un facteur commun
  (annexe : `(2x − 3)(x + 5)`, `4x + 6 = 2(2x + 3)`), sans identités
  remarquables, groupements ni facteur `ax + b`.
- Au plus 15 exercices par feuille ; les feuilles maigres sont dans
  `lacunes.md`.

## Décisions

- 03/11/2026 : codes `<année><section><axe><notion><sous-thème>` validés.
- 03/11/2026 : déduplication par couverture des cas et des paramètres, avec
  maintien des modes distincts et des usages dans les autres sections.
  Les variantes entièrement couvertes reçoivent `NR`, sans passage par
  « Non classés ». Voir `doublons-co.md` pour les regroupements appliqués.
- 03/11/2026 : opérations avec la notation scientifique réservées à la 11e
  LS. Retrait de 11NO3A-2 (ancien `10LCNO5B-7`) de 10LC, 10LS et 11CT,
  et de 4C32-4 de 10LC/LS ; classement dans la nouvelle feuille `11LSNO3A`.
  Les conversions et comparaisons restent en 10e ; 4C32-3 nécessite le type 1.
- 03/11/2026 : équations en CT sans mention « sensibilisation », y compris
  la mise en équation. 4G52 reste sans alias suisse et quitte les propositions
  de classement futur du CO (coordonnées dans l'espace).
- 03/11/2026 : ajustements pédagogiques validés et appliqués : maintien de
  « sensibilisation » dans les titres concernés ; intitulé « Multiples,
  diviseurs et nombres premiers » ; cas $ax^2=b$ en 10LC/LS et 11CT/LC, y
  compris en QCM ; maintien des exercices paramétrables avec documentation
  des réglages ; retrait ciblé des cas non paramétrables ; patron du cylindre
  maintenu en 10e. Les autres retraits de QCM restent acquis.
- 03/11/2026 : ordre de navigation du CO validé selon les moyens
  d'enseignement : NO → FA → ES → GM, avec l'ordre des catégories détaillé
  dans la section « Ordre de navigation du CO ». Cet ordre est commun aux
  neuf niveaux ; appliqué au menu le même jour.
- 03/11/2026 : regroupements de 9e validés : réunir NO2, NO6, NO7 et NO8
  dans « Nombres décimaux et calcul » ; distinguer les rubriques sœurs
  Triangles, Quadrilatères et Cercles dans « Géométrie du plan », avec une
  rubrique pour le vocabulaire et les constructions de base. Détail dans
  les organisations cibles de 9e ; appliqués au menu le même jour.
- 03/11/2026 : conserver un accès QCM à part des notions, en dernier dans
  chaque niveau, subdivisé par axe NO → FA → ES → GM après vérification du
  contenu. Cette décision remplace celle d'une feuille QCM unique par niveau.
  Appliqué au menu le même jour, avec vérification des classements QCM.
- 03/11/2026 : tri numérique des références validé, commun au menu de
  bureau, à la navigation mobile et à la sélection Typst, sans renumérotation
  des références conservées. Appliqué au menu le même jour.
- 03/11/2026 : les exercices de course aux nombres (`src/exercices/can/`)
  n'entrent pas dans les feuilles du Cycle d'orientation (9R1 à 11LS) : ne
  pas les proposer, et remplacer une CAN par un exercice équivalent qui n'en
  est pas une. Les 46 CAN reprises de l'ancien classement ont été retirées
  des nouvelles feuilles (renumérotées) ; elles gardent leurs anciens alias
  jusqu'au retrait des anciennes entrées 9e, 10e, 11e, puis passent à `[]`.
- 03/11/2026 : exception à la règle précédente : une CAN entre dans une
  feuille si aucun autre exercice n'existe et qu'elle correspond exactement
  au programme (27 CAN, 9e à 11e, dont la nouvelle feuille 11LCNO2C). Chaque
  feuille concernée est notée dans `lacunes.md` pour écrire de vrais
  exercices.
- 03/11/2026 : un exercice dont le réglage par défaut dépasse le programme
  d'une section y reste si son réglage le permet (5G2E-5 types 1 à 3,
  11GM2-4 types 1 et 2, 6M1autoE-2 avec le cercle en 9e) ; l'enseignant
  règle les paramètres. Un moyen de fixer ces paramètres depuis le menu
  pourra être ajouté plus tard.
- 03/11/2026 : confirmé par les indications pédagogiques du CO (éd. 2023) :
  multiplication et division des relatifs en 10e N2 N3 (9e : addition et
  soustraction, N2 N3) ; pourcentage en 9e seulement comme écriture d'un
  nombre (NO4G), calcul et problèmes de pourcentages en 10e.

- 03/11/2026 : entrée Préqualifiant (voir la section dédiée).
- 03/11/2026 : doublons retirés des feuilles (même exercice sous deux codes,
  classe fille vide ou qui ne change que le nombre de questions ou le style
  de correction) : 5N3autoE (gardé 6N3H), 4A11-1 (3A10-3), 2G10-1 (5G4A-1),
  2L11-4 (3L11-3b), 3L12-1 (2L12-1), CM2N5F (6N2A-1), 3A13-2 (6N2K-3),
  2P10-2 (6P2B-1). La passe de déduplication complémentaire ci-dessus étend
  cette première règle aux variantes dont les réglages peuvent être reproduits.

## Transition (terminée le 03/11/2026)

Les anciennes entrées 9e, 10e et 11e et tous leurs alias (9NO…, 10…, 11…)
sont retirés, ainsi que leurs titres.

- 44 CAN qui n'avaient que d'anciens alias passent à `['NR']` : chacune a un
  équivalent dans les nouvelles feuilles.
- Archives `-old` : anciens alias retirés (`['NR']` s'il ne reste rien). Pour
  30 d'entre elles, la version courante n'était pas classée : elle reprend
  la place de l'archive dans la feuille QCM du CO de la même année (et
  1A-C10-16 aussi en 10LC, 10LS FA5B).
- Archives `-old` du Collège (1mQCM, 2mQCM, 2mIneq, 1mF3) : les alias de 30
  archives passent sur la version courante, l'archive reçoit `['NR']`.
  Pour 1A-F07-4, conserver la référence existante `1mQCM-11` : `1mQCM-64`
  désigne le même exercice dans la même feuille et n'est pas réintroduite.
  1Tec-P12-old (`4mProbStat-11`) et sujetzero2024Ex4Q1-old (`autres-3`)
  n'ont pas de version courante : alias gardés jusqu'à décision.
- Alias vers des feuilles inexistantes retirés : `3mP-3` à `3mP-7` (les CAN
  passent à `['NR']`), `QCM9-1` (archive, `['NR']`).
- Les sections (9R1 à 11LS) n'ont pas de titre : le menu affiche le code
  seul.
- Les années du Collège sont rangées sous l'entrée « Collège » : `1re année`
  à `4e année` (une clé `2e`, `3e` ou `4e` seule serait affichée « Seconde »,
  « Troisième », « Quatrième » par `codeToLevelList.json`).

## Questions ouvertes

- Le détail des feuilles non encore fixé sera précisé après avoir vu les
  exercices candidats de chaque notion (classés et non classés).

## Passes

- 03/11/2026 : déduplication des familles de générateurs du CO, avec report
  des classements utiles, examen des usages dans tout le référentiel suisse
  et attribution de `NR` aux variantes entièrement couvertes. Les paramètres
  et les générateurs restent inchangés ; détail dans `doublons-co.md`.
- 03/11/2026 : correction des opérations en notation scientifique : seuls
  les alias suisses de 11NO3A-2 et 4C32-4 changent ; aucun paramètre par
  défaut ni tirage n'est modifié. Création de la feuille de 11LS et mise à
  jour des titres de 10e et des réglages documentés.
- 03/11/2026 : application des ajustements pédagogiques ci-dessus. Seuls les
  alias suisses de 12 exercices changent ; leurs uuid, paramètres par défaut,
  énoncés, corrections et tirages sont conservés. Les chapitres futurs et les
  réglages manuels nécessaires sont documentés dans `lacunes.md`.
- 03/11/2026 : application de l'ordre des moyens d'enseignement, des
  regroupements de 9e et des QCM par axe. Mise à jour des seuls alias
  `'fr-ch'` de 111 fichiers d'exercices ; uuid, paramètres et génération
  inchangés. Les catégories restent repliées par défaut et les références
  des exercices suivent un tri numérique dans les trois vues.
