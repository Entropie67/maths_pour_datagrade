# Rapport périodique d'accessibilité

Ce rapport suit l'évolution des défauts détectés automatiquement par
[axe-core](https://github.com/dequelabs/axe-core) sur 20 vues du site : combien de
défauts par règle et par vue, et ce qui a changé depuis le passage précédent.

Il informe et ne bloque rien : il ne fait échouer ni une livraison ni un job CI.

Index parent : [documentation/tests/README.md](README.md). Rapport généré :
[reports/a11y-report.md](../../reports/a11y-report.md).

## Ce que ce rapport ne dit pas

**Il ne donne aucun taux de conformité RGAA et ne permet pas d'en déduire un.**

- axe-core ne détecte qu'une partie des défauts. Il ne dit rien de la pertinence
  d'un texte (un `alt` présent mais inutile passe), ni du vécu avec un lecteur
  d'écran, ni du parcours au clavier.
- « 0 défaut » signifie seulement qu'axe-core n'en a pas trouvé.
- Chaque vue est mesurée dans son état initial, sur un seul exercice. Les questions
  de la course aux nombres ou du diaporama après « Démarrer », les menus et les
  fenêtres qu'il faut ouvrir ne sont pas mesurés.
- La mesure se fait dans Chromium seul, en fenêtre de 1280×800 et en thème clair :
  ni mobile, ni thème sombre, ni autre navigateur.
- Les règles WCAG 2.2 ne sont pas demandées (`target-size`, par exemple), pour rester
  comparable à l'audit initial.
- Les champs `math-field` portent leur nom et leur focus dans un shadow DOM. axe-core
  le traverse et lit l'élément `role="textbox"` qui s'y trouve, mais ne dit rien de
  la lecture de la formule ni de la saisie. Le rapport les compte par vue pour
  rappeler ce contrôle manuel, décrit dans
  [la navigation au clavier](navigation-clavier.md).
- La vitrine de l'accueil est exclue de la mesure : ni ses défauts ni son contenu ne
  sont suivis ici.
- Les animations ne sont pas figées : un contraste animé est lu à un instant
  quelconque.
- Le serveur est celui de développement, où `beta` est actif d'office.

## Lancer le rapport

Le serveur doit servir la copie depuis laquelle on lance le rapport :

```bash
pnpm dev   # noter le port affiché par Vite
A11Y_BASE_URL=http://localhost:<port>/alea/ pnpm a11y:report
```

Sans `A11Y_BASE_URL`, le port est `PLAYWRIGHT_SERVER_PORT`, sinon `80` en CI, sinon
`5173`. En local, le script refuse de mesurer un serveur lancé depuis une autre copie
(contrôle par `lsof`) : la mesure serait attribuée au mauvais code. C'est son seul cas
de sortie en erreur, il ne se produit jamais en CI.

| Variable               | Rôle                                                | Défaut                                  |
| ---------------------- | --------------------------------------------------- | --------------------------------------- |
| `A11Y_BASE_URL`        | Adresse du serveur, base `/alea/` comprise          | voir ci-dessus                          |
| `A11Y_OUTPUT_DIR`      | Dossier des fichiers produits                       | `reports`                               |
| `A11Y_PREVIOUS`        | Passage de référence pour la comparaison            | `a11y-status.json` du dossier de sortie |
| `A11Y_VIEW_TIMEOUT_MS` | Délai par étape avant de déclarer une vue en erreur | `90000`                                 |

Un passage prend 1 à 2 minutes. Pour essayer sans toucher au suivi, donner un autre
`A11Y_OUTPUT_DIR`.

## Lire le rapport

Deux fichiers, écrasés à chaque passage et versionnés comme les autres rapports de
[`reports/`](../../reports/README.md) :

- `reports/a11y-report.md` : le résumé court en tête, puis l'évolution, les vues en
  erreur, les défauts par règle, par vue, et le détail avec un exemple d'élément ;
- `reports/a11y-status.json` : les mêmes données, pour comparer deux passages.

Un **défaut** est un élément signalé par une règle : une règle sur 12 éléments compte
pour 12.

Le rapport sépare trois familles, jamais additionnées :

- **WCAG** : règles liées à un critère WCAG 2.0 ou 2.1, niveaux A et AA ;
- **bonnes pratiques** : règles d'axe-core sans critère WCAG (`region`, par exemple) ;
- **à vérifier à la main** : axe n'a pas su trancher, souvent un contraste sur un fond
  complexe. Ce n'est ni un défaut ni une réussite.

Une vue peut être dans trois états :

| État             | Sens                                                                                                                 | Effet sur les totaux                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Mesurée          | La vue a affiché son contenu, axe a évalué ses règles                                                                | Comptée                                    |
| Sans son contenu | La vue affiche un message d'échec (aperçu Typst non compilé) : elle est mesurée, mais pas telle qu'elle devrait être | Comptée et signalée                        |
| En erreur        | Page inaccessible, état réel jamais atteint, paramètre perdu, échec d'axe                                            | **Non mesurée**, jamais comptée comme zéro |

### Comparer deux passages

Seules les vues mesurées dans les deux passages, à la même adresse, sont comparées. Une
vue qui tombe en erreur n'apparaît donc pas comme une amélioration : elle est listée
parmi les vues non comparables.

Le rapport prévient quand un écart peut venir d'autre chose que du site : changement de
version d'axe-core ou de Chromium, de règles, de zones exclues, de taille de fenêtre,
de graine, d'environnement (local ou CI), vitrine de l'accueil apparue ou disparue,
vue qui perd ou retrouve son contenu principal. `axe-core` est épinglé à une version exacte : la
monter est un choix, qui peut faire bouger les chiffres sans que le site ait changé.

Un passage sans aucune vue mesurée (serveur coupé, Chromium absent) n'écrase pas le
JSON : le passage suivant se compare encore au dernier passage utile.

## Conduite de la mesure

Les choix qui suivent garantissent que deux passages restent comparables. La liste
des vues, la graine et les règles sont centralisées dans
[`tasks/lib/a11yReport.ts`](../../tasks/lib/a11yReport.ts), le pilotage du navigateur
dans [`tasks/a11y-report.ts`](../../tasks/a11y-report.ts).

- **Réglage de l'audit initial** : `runOnly` sur `wcag2a`, `wcag2aa`, `wcag21a`,
  `wcag21aa`, `best-practice`, avec la graine `alea=rgaa`.
- **Contexte neuf** pour chaque vue : ni `localStorage` ni IndexedDB hérités.
- **État réel plutôt que délai** : chaque vue a un sélecteur qui lui est propre (voir
  `A11Y_VIEWS`). Comme une vue inconnue retombe sans erreur sur l'accueil, un
  paramètre devenu invalide se voit comme une erreur, pas comme une mesure de la
  mauvaise page. Le script attend ensuite que le cube de chargement ait disparu, que
  les `math-field` aient construit leur shadow DOM, que le DOM ne bouge plus pendant
  1 s et qu'aucune requête de données ne soit en cours.
- **Visite guidée** : sur l'accueil, le script attend que la visite s'ouvre et la ferme
  avec Échap. La mesurer ouverte donnerait des résultats faux, à cause de son voile.
- **Animations laissées en cours** : le bouton « Démarrer » de la course aux nombres et
  du diaporama pulse sans fin, et la mesure le lit comme le voit l'utilisateur, à un
  instant quelconque. Son contraste passe parfois sous le seuil : le défaut apparaît ou
  non d'un passage à l'autre. Le rapport signale les vues concernées. Sur ces vues, un
  écart sur `color-contrast` n'est donc pas forcément un changement du site.
- **Vue `tbi` au repos** : ses commandes se masquent seules après 4 s. La mesure attend
  ce masquage, signalé par « Tapoter pour afficher les commandes ».
- **Paramètres relus** : `uuid`, `alea` et `v` doivent figurer dans l'adresse finale,
  sinon la vue est en erreur.
- **Chromium seul** : Firefox n'a pas pu se lancer dans Playwright sur le poste de
  l'audit, et il n'est pas nécessaire à ce suivi.

### Vitrine de l'accueil

L'accueil intègre un fragment publié par le projet `www`, que Vite récupère sur
`coopmaths.fr` en local et que le serveur de CI ne sert pas. La vitrine change avec les
actualités publiées et ses défauts ne viennent pas de ce dépôt : sa racine
(`.vitrine-alea`) est exclue de la mesure. Ses défauts sont à suivre dans le projet `www`.

Quand le fragment manque, l'accueil affiche à sa place ses liens rapides et son carrousel,
qui sont mesurés. Un passage local n'est donc pas comparable à un passage CI sur cette
vue, et le rapport le signale.

## Lancement périodique

Le job `a11y-report` de [`.gitlab-ci.yml`](../../.gitlab-ci.yml) ne se lance que si la
variable `A11Y_REPORT` vaut `true`. Un pipeline lancé ainsi ne fait que ce rapport, sur le
modèle de `DEPLOY_STAGING`. Il faut pour cela un pipeline planifié dédié, à créer dans
l'interface de GitLab (**Build > Pipeline schedules**) :

| Réglage  | Valeur                                        |
| -------- | --------------------------------------------- |
| Cible    | `main`                                        |
| Rythme   | une fois par semaine, par exemple `0 5 * * 1` |
| Variable | `A11Y_REPORT` = `true`                        |

Sans cette variable, les pipelines planifiés existants ne lancent pas le rapport : ils
tournent plusieurs fois par jour, ce qui n'apporterait rien à un suivi.

Le job se compare au rapport de son dernier passage, récupéré par l'API de GitLab, et à
défaut à `reports/a11y-status.json` versionné. Le résultat est à lire dans les artefacts du
job, conservés un an : `reports/a11y-report.md` et `reports/a11y-status.json`. Le job ne
versionne rien : pour mettre à jour le fichier du dépôt, lancer le rapport en local et
committer.

Le job est `allow_failure: true` et le script sort avec le code 0 même si des vues sont en
erreur. Si le serveur ne démarre pas, le job affiche un avertissement et ne produit pas de
rapport : c'est l'absence de l'artefact qui le révèle, le journal est dans
`artifacts/ci-vite.log`.
