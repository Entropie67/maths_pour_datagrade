# Vue Quizz

La vue quizz transforme une sélection d'exercices QCM en quiz animé façon
Kahoot, jouable en solo (un élève, un appareil) ou en projection (classe
entière pilotée par l'enseignant). La logique de déroulement est adaptée de la
plateforme Razzia (licence MIT, voir `NOTICE` à la racine du dépôt).

## Routage et paramètres d'URL

| Paramètre     | Rôle                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `v=quizzconf` | Vue de configuration (`src/components/setup/quizz/QuizzConf.svelte`), entrée « Quizz » du menu « Autres exports ». |
| `v=quizz`     | Vue d'exécution plein écran (`src/components/display/quizz/Quizz.svelte`).                                         |
| `subject`     | Titre du quizz (champ de `InterfaceGlobalOptions`).                                                                |
| `quizzParam`  | Réglages du quizz en base64 (JSON).                                                                                |

`subject` et `quizzParam` sont déclarés dans `InterfaceGlobalOptions`
(`src/lib/types.ts`), parsés par `mathaleaUpdateExercicesParamsFromUrl` et
persistés par `updateGlobalOptionsInURL` uniquement quand `v` vaut
`quizzconf` ou `quizz` : l'URL étant reconstruite de zéro à chaque
synchronisation, tout nouveau paramètre doit être enregistré à ces trois
endroits pour survivre.

### Contenu de `quizzParam`

```json
{
  "v": 1,
  "mode": "solo | projection",
  "scoring": "full | simple | none",
  "seedMode": "fixed | random",
  "background": { "mode": "none | fixed | random", "image": "fichier.jpg" },
  "sound": true,
  "cooldown": 5,
  "times": [20, 30],
  "usernameMode": "free | safe"
}
```

- `mode` : `solo` (un élève sur son appareil) ou `projection` (classe
  entière). Dans les deux cas, l'avancement après le résultat est manuel
  (bouton « Suivant » / « Terminer ») pour laisser le temps de lire la
  correction. `multi` est réservé (multi-joueurs temps réel, à venir).
- `scoring` : `full` (points dégressifs selon la rapidité et séries, formules
  Razzia), `simple` (1 point par question entièrement réussie), `none`.
- `seedMode` : `fixed` fige les graines `alea` dans le lien (même quizz
  partout) ; `random` les retire du lien (un tirage différent par ouverture).
- `background` : fond blanc, image fixe ou image aléatoire à chaque question,
  parmi les fichiers de `public/images/quizz/backgrounds/` répertoriés dans
  `src/json/quizzBackgrounds.json` (généré par
  `tasks/updateQuizzBackgrounds.js`, chaîné à `pnpm makeJson`).
- `cooldown` : durée d'affichage de l'énoncé seul (3-15 s).
- `times` : temps de réponse par exercice de la sélection (5-120 s, défaut 20).
- `usernameMode` (multi-joueurs) : `free` (défaut — l'élève choisit son
  pseudo, unique dans la room) ou `safe` — le pseudo doit être un prénom de
  la liste autorisée du serveur de jeu (`src/data/safe_usernames.json` côté
  ws) : transmis à `manager:createGame`, annoncé au joueur par
  `game:successRoom`, vérifié à `player:login` (comparaison insensible à la
  casse et aux accents, forme canonique de la liste enregistrée, homonymes
  suffixés d'un numéro par le serveur ; erreur `username-not-allowed`).
- `sound` : habillage sonore activé (défaut) ou coupé. En solo/projection,
  règle locale de l'appareil. En multi-joueurs, le réglage devient une
  propriété de la room, comme `usernameMode` : transmis à
  `manager:createGame`, annoncé au joueur par `game:successRoom`, il
  initialise le bouton son de chaque appareil (qui reste libre d'être
  changé localement ensuite).

Le codec (`src/lib/quizz/quizzParams.ts`) est défensif : toute valeur absente
ou invalide est remplacée par sa valeur par défaut.

## Matériel du quizz

`buildQuizz` (`src/lib/quizz/buildQuizz.ts`) charge les exercices depuis les
paramètres d'URL, les génère (graine appliquée, pattern de la CAN :
`mathaleaHandleExerciceSimple` pour les exercices simples,
`nouvelleVersionWrapper` sinon) et extrait les questions :

- une question est retenue si `autoCorrection[i].propositions` contient
  **2 à 4 propositions** (limite des 4 boutons colorés) ;
- l'énoncé provient de `autoCorrection[i].enonce` (repli : `listeQuestions[i]`
  débarrassée du composant `<mathalea-qcm>`), précédé de la consigne et de
  l'introduction pour la première question de l'exercice ;
- les propositions sont prises dans l'ordre d'affichage (déjà mélangé par la
  graine) ; `statut` vrai marque les bonnes réponses ;
- `options.radio === true` (ou une seule solution) donne une question
  `single`, sinon `multi` ;
- la correction affichée à la révélation est `listeCorrections[i]`.

`analyseExerciceQuizz` produit le rapport de compatibilité utilisé par
`quizzconf` (pastilles ok / partiel / incompatible grisé). Les
`ExerciceSimple` avec `versionQcmDisponible` sont détectés comme
« convertibles » : un bouton active `qcm=1` dans les paramètres de l'exercice.

Le lien de partage est construit par `buildQuizzUrl`
(`src/lib/quizz/buildQuizzUrl.ts`) : sélection d'exercices + `v=quizz` +
`subject` + `quizzParam`, avec retrait des graines si `seedMode === 'random'`.

## Architecture du moteur

Le moteur (`src/modules/quizz/`) est du TypeScript pur, sans DOM ni Svelte,
exécutable tel quel côté serveur :

- `engine/QuizzEngine.ts` : machine à états portée du `RoundManager` de
  Razzia — `SHOW_START` → (`SHOW_PREPARED` → `SHOW_QUESTION` →
  `SELECT_ANSWER` → `SHOW_RESULT` + `SHOW_RESPONSES` → [`SHOW_LEADERBOARD`])
  → `FINISHED`. Les réponses ne sont acceptées qu'en phase `SELECT_ANSWER`,
  la première seule compte, et la phase se termine dès que tous les joueurs
  ont répondu.
- `engine/scoring.ts` : `timeToPoint` (décroissance linéaire), `orderToPoint`,
  ratios `single`/`multi` (`strict`/`balanced`/`lenient`), conversion selon
  `scoring` (`full`/`simple`/`none`).
- `transport/QuizzTransport.ts` : interface `broadcast`/`send`/`emit` — la
  surface exacte que Razzia injecte dans son moteur. `LocalTransport` la
  remplit en mémoire (V1) ; un `SocketTransport` la remplira avec socket.io
  en multi-joueurs (V2) sans changer le moteur ni les écrans.
- La vue `Quizz.svelte` alimente les stores de `src/lib/stores/quizzStore.ts`
  (équivalent Svelte de l'événement `game:status`) et filtre les statuts par
  rôle : le parcours « joueur » en solo (`SHOW_RESULT`), le parcours
  « manager » en projection (`SHOW_RESPONSES`, `SHOW_LEADERBOARD`).

Les écrans sont dans `src/components/display/quizz/layouts/` (un composant
par statut) et `presentationalComponents/` (boutons de réponse A-D aux
couleurs Okabe-Ito `--color-quizz-1..4` déclarées dans `src/app.css`, minuteur,
fond, contrôles, panneau de correction). La lisibilité en vidéoprojection est
assurée par une typographie fluide : le `<main>` de la vue est un conteneur
(`.quizz-container`, `container-type: inline-size`) et les classes
`.quizz-text-*` de `src/app.css` dimensionnent les textes en `cqw` bornées par
`clamp()`. Attention : `mathaleaRenderDiv` pose un `font-size` inline via
`resizeContent` (voir `src/lib/components/sizeTools.ts`) qui écraserait ces
classes — la vue utilise donc `quizzRenderDiv`
(`src/components/display/quizz/quizzRender.ts`), qui retire ce style inline
après le rendu KaTeX/figures. Le zoom des figures mathalea2d et l'ajustement
à la fenêtre sont orchestrés au niveau de la phase par `fitQuizzContent`
(même fichier, câblé sur le `<main>` de `Quizz.svelte` et des deux parcours
multi) : les figures sont zoomées comme le texte de leur conteneur (via
`updateFigures`, comme la vue CAN) et centrées
(`.quizz-container .svgContainer { margin-inline: auto }`) ; si l'ensemble
dépasse la hauteur de la fenêtre (mesurée via `main.scrollHeight` —
attention, `main` est en `min-h-screen`, le document vaut toujours ≥ la
fenêtre), texte et figures sont réduits d'un même facteur par paliers
mesurés (philosophie « shrink-to-fit » de la CAN), avec plancher — les
boutons de réponse restent ainsi accessibles sans défilement. Mutation et
ResizeObservers ré-appliquent l'ajustement (nouvelle question, fontes
KaTeX, redimensionnement) avec un garde anti-boucle pour ignorer les
écritures propres. Les sons (`public/assets/sounds/quizz/`, adaptés de
Razzia) suivent le mapping statut → son de Razzia et sont coupables à la
volée.

## Mode multi-joueurs temps réel (V2)

Le mode `multi` est actif dans l'écran de réglages. Il s'appuie sur le
service temps réel **quizz-ws** (dépôt séparé : Node.js + Socket.IO en
long-polling, moteur vendored exécuté côté serveur — autorité chronos et
scores). Son document de conception (protocole, cycle de vie des rooms,
déploiement o2switch) fait foi côté serveur ; ici on ne décrit que le client.

### Routage et paramètres d'URL supplémentaires

| Paramètre   | Rôle                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `quizzRole` | `manager` (création/pilotage) ou `player` (jointure). Absent avec `quizzParam.mode = 'multi'` : parcours manager (lien de réglages partagé). |
| `pin`       | PIN à 6 chiffres de la room (lien joueur : `?v=quizz&quizzRole=player&pin=XXXXXX`).                                                          |
| `gameId`    | Identifiant serveur de la room, écrit dans l'URL après création/jointure : permet la reconnexion au rechargement.                            |

Comme `subject`/`quizzParam`, ces paramètres sont déclarés dans
`InterfaceGlobalOptions`, parsés par `mathaleaUpdateExercicesParamsFromUrl`
et persistés par `updateGlobalOptionsInURL` (uniquement quand `v = 'quizz'`).
`App.svelte` aiguille `v=quizz` vers `QuizzMulti.svelte`
(`src/components/display/quizz/multi/`) si rôle explicite ou mode multi,
sinon vers la V1 (`Quizz.svelte`), inchangée.

### Architecture client

- `src/modules/quizz/transport/SocketTransport.ts` : encapsule la socket
  Socket.IO (`transports: ['polling']`, path `/ws`, `auth.clientId`) et
  expose la **même surface d'abonnement** que `LocalTransport`
  (`onStatus`/`onEvent`) — les layouts consomment les statuts sans changement.
  Le champ `target` de V1 n'existe pas sur le fil (le serveur n'adresse à
  chaque socket que ce qui la concerne) ; les statuts relus sont estampillés
  `'broadcast'`. Ajoute `send`/`onServerEvent` (protocole) et
  `onConnectionEvent` (reprises après coupure).
- `src/lib/quizz/multiManagerSession.ts` et `multiPlayerSession.ts` :
  machines à états du parcours (stores Svelte) — le protocole y est câblé,
  les composants ne font que le rendu. Les statuts de jeu sont versés dans
  les stores partagés de `quizzStore` (dont `quizzTotalPlayers`, ajouté).
- Parcours manager (`QuizzMultiManager.svelte`) : construction du quizz par
  `buildQuizz` (le même objet qu'en V1) + validation locale des bornes
  serveur (`validateQuizzMulti.ts`) → identification par code e-mail
  (`manager:requestEmailCode`/`verifyEmailCode`) → `createGame` → lobby
  (`QuizzLobby.svelte` : PIN, lien de jointure `buildQuizzJoinUrl`, QR-code,
  joueurs avec exclusion) → pilotage (`startGame`/`nextQuestion`/
  `showLeaderboard`/`abortQuiz`, mêmes commandes qu'en projection, clavier
  inclus) → podium + export CSV des résultats (`quizzResults.ts`, construit
  depuis `game:results`, reçu au seul manager à `FINISHED`). À la
  révélation, seule la bonne réponse ressort sur l'écran manager :
  `SHOW_RESPONSES.selected` est toujours `null` en multi (pas de joueur
  local ; en projection, ce champ rappelle le choix de la classe).
- Parcours joueur (`QuizzMultiPlayer.svelte`) : PIN (jointure automatique si
  présent dans l'URL) → pseudo → attente → jeu ; `SELECT_ANSWER` est
  interactif côté joueur, spectateur (avec compteur de réponses) côté
  manager.
- `clientId` : uuid v4 persisté en `localStorage` (`quizzClientId.ts`),
  transmis au handshake. Rechargements : joueur → `player:join` (PIN) puis
  `player:reconnect` (siège retrouvé via `clientId`, points conservés) ;
  manager → `manager:reconnect`. Après une coupure transport (pas de
  `connectionStateRecovery` côté serveur), la même séquence est rejouée sur
  l'événement `connect`.
- Erreurs : `game:errorMessage` transporte une clé kebab-case traduite par
  `quizzMultiErrors.ts` (une phrase française du moteur est affichée telle
  quelle) ; `game:reset` (`kicked`/`closed`/`expired`/`unknown-session`)
  ramène à l'écran de jointure.

### Test depuis un téléphone (réseau local)

`pnpm dev --host` permet de jouer depuis un téléphone sur le même réseau :
l'URL du serveur ws en dev est dérivée de `window.location.hostname`
(`config.ts` — « localhost » désignerait le téléphone lui-même) et le
serveur ws accepte en `debugMode` les origines d'IP privées en plus de
localhost (son CORS strict ne vaut que pour la production). Deux pièges du
contexte non sécurisé (`http://192.168.x.x`) sont couverts :
`crypto.randomUUID` y est absent (repli dans `quizzClientId.ts` via
`crypto.getRandomValues`, disponible partout) et le CORS du serveur ws
(détail côté dépôt quizz-ws, `resolveCorsOrigin`).

### Tests du multi-joueurs

`tests/unit/quizzSocketTransport.test.ts` (transport sur fausse socket),
`quizzMultiSessions.test.ts` (machines à états manager/joueur),
`quizzMultiErrors.test.ts`, `quizzMultiValidation.test.ts`,
`quizzResults.test.ts` (CSV). Le test **live**
`tests/live/quizzMultiLive.test.ts` joue une partie réelle à 1 manager + 2
joueurs (avec rechargements) contre le serveur local ; il est désactivé par
défaut et se lance explicitement, serveur démarré :
`QUIZZ_LIVE=1 pnpm exec vitest tests/live/quizzMultiLive.test.ts --run`.

## Tests

`tests/unit/quizzScoring.test.ts`, `quizzParams.test.ts`, `quizzEngine.test.ts`
(machine à états sous faux timers vitest, compatibilité QCM, gel des graines).
