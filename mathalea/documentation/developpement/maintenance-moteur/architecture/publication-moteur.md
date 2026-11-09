# Publier le moteur pour l'app MathALÉA mobile

L'app MathALÉA mobile embarque le moteur de MathALÉA (`src/moteur/`,
`vite.moteur.config.ts`) et le met à jour sans passer par les stores : elle
lit `https://mathalea.fr/releases/mise-a-jour.json`. À chaque mise en ligne
du site, on publie le moteur du même commit : les élèves ont les mêmes
exercices que sur le site.

## Pourquoi une signature

Le moteur téléchargé s'exécute dans l'app avec ses droits (fichiers, base de
données locale, réseau). L'app n'installe une mise à jour que si
`mise-a-jour.json` est signé par la clé de Coopmaths. Quelqu'un qui
prendrait la main sur le serveur web ne pourrait donc pas envoyer de code
aux apps : il lui faudrait aussi la clé privée, qui n'est pas sur le serveur.

## Une seule fois : créer la clé

Sur la machine qui déploie le site :

```bash
node tasks/cles_moteur.mjs /home/<vous>/.config/mathalea/moteur-ed25519.pem
```

Le script affiche deux lignes :

- **Clé privée** : le fichier `.pem`. La sauvegarder dans le coffre de
  l'équipe ; ne jamais la versionner ni l'envoyer par messagerie. La perdre
  oblige à publier une nouvelle version de l'app.
- **Clé publique** : 44 caractères (par exemple `UaVlT+Qm…8sU=`). Elle n'a
  rien de secret : la transmettre aux mainteneurs de l'app, qui la mettent
  dans `CLE_PUBLIQUE` (`src-tauri/src/moteur.rs` de mathalea-mobile) et
  publient une version de l'app. Tant que ce n'est pas fait, l'app refuse les
  moteurs signés par cette clé (sans dommage : elle garde le sien).

Puis, dans `.env` (chemins absolus, `~` n'est pas compris) :

```bash
MOTEUR_CLE_PRIVEE="/home/<vous>/.config/mathalea/moteur-ed25519.pem"
REMOTE_RELEASES_PATH="/chemin/sur/le/serveur/releases"   # servi à https://mathalea.fr/releases/
```

`REMOTE_SERVER` est celui du site.

## À chaque mise en ligne

`pnpm build:deploy` construit et déploie le site, puis construit et publie
le moteur. Séparément :

```bash
pnpm build:moteur     # dist-moteur (après pnpm build ou pnpm makeJson)
pnpm deploy:moteur    # signe et dépose dans REMOTE_RELEASES_PATH
```

`deploy:moteur` dépose `moteur-<version>.tar.gz` puis `mise-a-jour.json` et
sa signature, et garde les trois dernières archives. Les apps le
téléchargent au lancement (puis toutes les 10 minutes) et l'activent au
lancement suivant, jamais pendant une activité. Vérifier :
`curl https://mathalea.fr/releases/mise-a-jour.json`.

Revenir en arrière n'a pas d'effet sur les apps qui ont déjà le moteur le
plus récent (elles n'installent qu'une date de publication plus récente) :
corriger, puis republier.
