# Ajouter des exercices d'une autre banque dans MathALÉA

MathALÉA permet d'utiliser des exercices qui ne font pas partie du site : les
vôtres, ceux d'un collègue, ceux d'une association... Ce sont des **banques
d'exercices externes**. Une fois ajoutée, une banque apparaît dans
« Ressources partenaires » et ses exercices se sélectionnent comme n'importe
quel autre exercice de MathALÉA.

Ce guide va du plus simple (utiliser une banque déjà publiée) au plus
technique (créer et publier la vôtre).

## Utiliser une banque déjà publiée

1. Dans le menu de gauche, ouvrez « Ressources partenaires ».
2. Tout en bas de cette rubrique, cliquez sur **« Ajouter une banque
   d'exercices »**.
3. Deux façons d'ajouter une banque :
   - **Coller l'adresse d'un dépôt de la forge** — le plus pratique : la
     banque se met à jour automatiquement à chaque visite ;
   - **Importer un fichier `.zip`** — reçu par mail ou une clé USB, par
     exemple. Il est enregistré uniquement sur cet ordinateur.
4. La banque apparaît aussitôt dans « Ressources partenaires ». Ses exercices
   se choisissent comme les autres, avec leurs étiquettes et leur nombre
   d'étoiles de difficulté.
5. Pour la retirer, rouvrez la même fenêtre : chaque banque installée a une
   icône de corbeille.

### Essayer tout de suite

Pour voir tout de suite comment ça fonctionne, collez cette adresse dans le
champ « Ajouter un dépôt de la forge » :

```
https://forge.apps.education.fr/coopmaths/modele-banque-exercices
```

C'est la banque d'exemple : elle sert aussi de modèle si vous voulez créer la
vôtre (voir plus bas).

### Partager un lien avec vos élèves

Un lien MathALÉA vers des exercices d'une banque publiée sur la forge
fonctionne normalement : la personne qui l'ouvre récupère automatiquement les
exercices concernés, sans rien installer elle-même. Une banque déposée en
`.zip`, elle, reste propre à votre ordinateur : ses exercices ne peuvent pas
être partagés par lien.

## Créer sa propre banque d'exercices

Pour aller plus loin et publier vos propres exercices, il faut :

- un compte sur [forge.apps.education.fr](https://forge.apps.education.fr)
  (utilisable avec votre compte académique) ;
- `git` installé sur votre ordinateur ;
- selon le format de vos exercices : la commande `typst`
  ([typst.app](https://typst.app)), et/ou une distribution LaTeX (avec
  `pdflatex` et `pdftoppm`).

### 1. Récupérer le modèle

Rendez-vous sur la page du modèle :
[forge.apps.education.fr/coopmaths/modele-banque-exercices](https://forge.apps.education.fr/coopmaths/modele-banque-exercices),
puis cliquez sur **Fork** (en haut de la page) pour obtenir votre propre
copie du projet.

Vérifiez ensuite que votre copie est publique : **Paramètres > Général >
Visibilité**, sur la forge — c'est indispensable pour que MathALÉA puisse la
lire.

Clonez-la ensuite sur votre ordinateur (remplacez l'adresse par celle de
_votre_ copie, affichée par le bouton **Cloner** de la forge) :

```bash
git clone https://forge.apps.education.fr/<mon-groupe>/modele-banque-exercices.git ma-banque
cd ma-banque
```

### 2. Personnaliser l'identité de la banque

Ouvrez `banque.json` et modifiez :

```json
{
  "id": "ma-banque",
  "titre": "Ma banque d'exercices",
  "auteur": "Prénom Nom",
  "licence": "CC BY-SA 4.0"
}
```

`id` doit être court, sans espace ni accent : il sert à fabriquer les liens
de partage de vos exercices.

### 3. Ajouter vos exercices

Dans le dossier `sources/`, chaque sous-dossier devient une catégorie (et un
sous-sous-dossier, une sous-catégorie) dans le menu de MathALÉA. Un exercice
est un fichier `.typ` (Typst) ou `.tex` (LaTeX), avec un petit en-tête en
commentaire :

```typst
// titre: Somme de deux fractions
// tags: fractions, addition
// etoiles: 2

Calculer et donner le résultat sous forme de fraction irréductible.

+ $3/4 + 5/6$
+ $7/10 + 2/15$
```

Une correction est facultative : ajoutez-la dans un fichier `_cor` à côté
(`somme-de-fractions_cor.typ`).

### Personnaliser le document généré (optionnel)

Si vos exercices ont besoin de leurs propres commandes — un paquet LaTeX
particulier, une fonction Typst maison — ajoutez un fichier `preambule.tex`
et/ou `preambule.typ` à la racine de votre dossier, puis déclarez-les dans
`manifest.json` (généré par `build.sh`, voir étape suivante) :

```json
{
  "preambule": {
    "tex": "preambule.tex",
    "typ": "preambule.typ"
  }
}
```

- `preambule.tex` est inséré dans le préambule du document LaTeX (avant
  `\begin{document}`) ;
- `preambule.typ` est inséré en tête du document Typst généré.

Le modèle de banque ne génère pas encore ce champ automatiquement à partir de
`banque.json` : ajoutez-le à la main dans `manifest.json` après avoir lancé
`build.sh` (étape suivante), ou adaptez le script si vous voulez que la
génération le fasse pour vous. Détails et exemple complet dans la
documentation de référence :
[banques-externes.md](https://forge.apps.education.fr/coopmaths/mathalea/-/blob/main/documentation/utilisation/banques-externes.md).

### 4. Générer et tester la banque

```bash
chmod +x build.sh   # une seule fois : rend le script exécutable
./build.sh --zip
```

Le script compile vos exercices en images et produit un fichier `.zip`.
Importez-le dans MathALÉA (« Ajouter une archive ») pour vérifier que tout
s'affiche bien, corrigez si besoin, et relancez `./build.sh --zip` jusqu'à ce
que vous soyez satisfait·e.

### 5. Publier sur la forge

Le dossier `dist/` (celui que génère `build.sh`) n'est pas suivi par git au
départ : il faut retirer sa ligne du fichier `.gitignore` pour que MathALÉA
puisse le lire depuis le dépôt, une fois pour toutes.

Ouvrez `.gitignore` et supprimez la ligne `dist/` (gardez `*.zip`, qui ne
sert que pour tester en local). Puis :

```bash
git add .
git commit -m "Ma banque d'exercices"
git push
```

Votre banque est prête à être partagée : donnez l'adresse de votre dépôt
(`https://forge.apps.education.fr/<mon-groupe>/ma-banque`, sans rien de plus)
à qui vous voulez — MathALÉA trouve le fichier `manifest.json` tout seul,
qu'il soit à la racine du dépôt ou dans `dist/`.

### 6. Mettre à jour la banque

À chaque modification de vos exercices :

```bash
./build.sh
git add .
git commit -m "Mise à jour de la banque"
git push
```

Les mises à jour sont automatiquement visibles par tout le monde : MathALÉA
relit le dépôt à chaque démarrage, sans que personne n'ait besoin de
réinstaller quoi que ce soit.

---

Pour le détail complet du format (`manifest.json`, champs optionnels...) et
les aspects plus techniques, voir la documentation de référence :
[banques-externes.md](https://forge.apps.education.fr/coopmaths/mathalea/-/blob/main/documentation/utilisation/banques-externes.md).
