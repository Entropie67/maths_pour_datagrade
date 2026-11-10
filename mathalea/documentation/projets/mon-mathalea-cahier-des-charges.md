# Cahier des charges — « Mon MathALÉA »

> Projet abandonné : le service mon.mathalea.fr et son intégration ne sont plus utilisés. Ce document est conservé comme archive.

> Statut : proposition de travail (octobre 2026), à discuter. Premières
> briques réalisées : la vue « Mes sauvegardes », avec « Mes feuilles » (fiches
> Typst en dossiers) et « Mes sélections » (liens d'exercices annotés, notés de
> 0 à 3 étoiles, réglages modifiables), et le fichier `.mathalea`, qui reprend
> aussi les modèles de document de la vue Impression (P3, en partie), les
> réglages du lien pour les élèves et l'historique des diaporamas, voir
> [la documentation](../developpement/maintenance-moteur/exports/mes-sauvegardes.md).
> Côté client, la synchronisation (D3) est écrite pour la version bêta :
> pierres tombales et fusion (`src/lib/mesFeuilles/sync.ts`), client de l'API
> et moteur (`monMathaleaApi.ts`, `syncEngine.ts`), volet « Mon MathALÉA ».
> Le serveur est dans le dépôt `coopmaths/mon-mathalea` (contrat d'API dans
> son `README.md`).

## 1. Contexte et objectifs

MathALÉA est aujourd'hui une application **statique et sans compte** : tout
l'état d'une feuille (exercices, graines, paramètres `s`, `s2`…, vue, options,
réglages Typst `typstParam`) tient dans l'URL. C'est une force (partage par
lien, aucune donnée stockée côté serveur) mais l'enseignant n'a aucun endroit
pour **retrouver son travail** : il colle des liens dans des documents, des
marque-pages ou l'ENT.

Plusieurs fonctions gardent déjà des données dans le navigateur, chacune dans
son coin :

| Donnée existante                         | Stockage                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| Bibliothèque de parcours, classes        | `localStorage` `mathalea-parcours-bibliotheque`      |
| Banques d'exercices externes (`.zip`)    | IndexedDB (`banquesExternesDb.ts`)                   |
| Historique des diaporamas                | `localStorage` `mathalea:slideshow-history`          |
| Feuille « à la carte »                   | `localStorage` `mathalea_alacarte`                   |
| Réglages TBI, vues Tex/Typst/OMR/Slides… | `localStorage` (une clé par vue)                     |
| États de relecture                       | `localStorage` `relectureEtats`                      |
| Jeton edurl.fr                           | `localStorage` `mathalea-edurl-token`                |
| Fiche Typst trop longue pour l'URL       | `sessionStorage` (perdue à la fermeture de l'onglet) |

**Objectifs de « Mon MathALÉA »**

1. Offrir un **espace personnel** où l'enseignant enregistre, range, retrouve
   et réutilise tout ce qu'il produit avec MathALÉA.
2. Fonctionner **sans compte** (stockage local + fichier à sauvegarder et
   recharger), le compte n'apportant que la synchronisation entre appareils et
   le partage.
3. **Aucune donnée d'élève** : ni identité, ni score, ni réponse, ni suivi.
4. Unifier les stockages locaux existants dans un seul modèle de données.

**Hors périmètre (explicitement)** : comptes élèves, résultats, statistiques
par élève, carnet de notes, messagerie, devoirs à rendre. Ces usages restent
assurés par Capytale, Moodle/ÉLÉA, l'ENT, etc.

## 2. Principes directeurs

- **Local d'abord** (_local-first_) : toutes les fonctions marchent hors ligne
  et sans compte ; le serveur n'est qu'un miroir optionnel.
- **Un élément = un état MathALÉA rejouable**. On stocke l'état structuré
  (paramètres, graines, options), jamais un PDF ou un HTML figé : la politique
  de stabilité des graines (`pnpm stability:check`, `pnpm archive`,
  `uuidsRemplaces.json`) garantit qu'une feuille enregistrée il y a deux ans se
  régénère à l'identique. C'est l'atout majeur du projet : le stockage est
  léger et le corrigé d'un sujet distribué reste retrouvable.
- **Portabilité** : export complet en un fichier ouvert et documenté, import
  sans perte, à tout moment, avec ou sans compte.
- **Minimisation** : le serveur ne connaît qu'un identifiant choisi par
  l'enseignant, une adresse électronique facultative et ses contenus
  pédagogiques.
- **Le site reste statique** : l'application continue d'être servie telle
  quelle ; « Mon MathALÉA » ajoute une API à côté, sur un autre domaine
  (mon.mathalea.fr), que l'on peut couper sans casser le site.

## 3. Profils et usages

| Profil                                                   | Besoin principal                                           |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| Enseignant occasionnel                                   | Retrouver « la feuille de la semaine dernière », favoris   |
| Enseignant régulier, plusieurs appareils (salle, maison) | Synchronisation, fiches Typst retouchées                   |
| Enseignant qui prépare des évaluations                   | Archive des sujets distribués (graines figées) et corrigés |
| Équipe disciplinaire                                     | Partager une progression, des fiches, un modèle d'en-tête  |
| Formateur, IREM, auteur de banque                        | Publier des collections pour d'autres collègues            |
| Utilisateur hors France (CH…)                            | Fonctionner sans identité Éducation nationale              |

## 4. Catalogue des services

Priorité : **P1** indispensable au lancement, **P2** souhaitable, **P3** plus
tard / à valider.

### 4.1 Bibliothèque de contenus

| #   | Service                            | Description                                                                                                                                                                                                        | Prio  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| B1  | Exercices favoris                  | Étoile sur chaque exercice (menu latéral, carte d'exercice, recherche). Section « Mes favoris » dans le menu. Option : favori avec ses paramètres (« 6N1E en 5 questions, niveau 2 »).                             | P1    |
| B2  | Notes personnelles sur un exercice | Courte note privée (« marche bien en début de séquence », « question 3 trop dure ») visible sur la carte de l'exercice.                                                                                            | P2    |
| B3  | Feuilles enregistrées              | Bouton « Enregistrer » dans toutes les vues : sélection d'exercices paramétrés + vue + options globales. Titre, niveau, chapitre, étiquettes, dossier.                                                             | P1    |
| B4  | Graine figée ou aléatoire          | À l'enregistrement : « garder ces énoncés » (graines figées) ou « nouveaux énoncés à chaque ouverture ».                                                                                                           | P1    |
| B5  | Historique automatique             | Les N dernières feuilles ouvertes/générées, sans action de l'utilisateur (local uniquement par défaut). Remplace l'historique propre au diaporama.                                                                 | P1    |
| B6  | Fiches Typst / LaTeX éditées       | Enregistrement de `typstParam` complet (réglages, `carryOver`, retouches de code, textes insérés, page de garde) et du code LaTeX modifié. Règle aussi le cas `typstParam=local` perdu à la fermeture de l'onglet. | P1    |
| B7  | Images et fichiers joints          | Figures découpées, logos, documents liés aux pauses de parcours. Stockés en blobs avec quota.                                                                                                                      | P2    |
| B8  | Exercices à énoncé libre           | Les exercices « énoncé libre » de Typst deviennent réutilisables d'une fiche à l'autre (« Mes exercices »).                                                                                                        | P2    |
| B9  | Autres productions                 | Diaporamas, courses aux nombres, flashcards, « J'ai… qui a… ? », sujets OMR/AMC, quiz en direct (configuration seulement), feuilles Moodle/Anki : même mécanisme que B3, avec le type de vue.                      | P1/P2 |
| B10 | Parcours de l'application          | La bibliothèque de parcours (`classes-mathalea/1`) migre dans Mon MathALÉA ; « Publier » reste un fichier, ou devient un lien (cf. P4).                                                                            | P2    |
| B11 | Banques externes                   | La liste des banques installées (forge et `.zip`) fait partie du profil et se synchronise.                                                                                                                         | P2    |
| B12 | Recherche et tri                   | Recherche plein texte dans titres, étiquettes, notes, codes d'exercices ; filtres par niveau, type, date.                                                                                                          | P1    |
| B13 | Corbeille                          | Suppression réversible pendant 30 jours.                                                                                                                                                                           | P1    |
| B14 | Doublons et variantes              | « Dupliquer », « Nouvelle version (autres données) », « Version B pour un contrôle de rattrapage ».                                                                                                                | P1    |

### 4.2 Organisation pédagogique

| #   | Service                        | Description                                                                                                                                                                                                                                                              | Prio |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| O1  | Référentiel personnalisé       | Arborescence libre (progression annuelle → séquences → séances) dont les feuilles sont des exercices MathALÉA, des favoris, des feuilles enregistrées, des exercices de banques ou des liens externes. Affiché dans le menu latéral comme un référentiel à part entière. | P1   |
| O2  | Import / export du référentiel | Tableur (ODS/XLSX, via `src/lib/spreadsheet.ts`) et CSV `code;titre;séquence`, pour partir de la progression de l'équipe ou d'un référentiel existant.                                                                                                                   | P2   |
| O3  | Modèles de référentiel         | Partir du référentiel officiel d'un niveau et le réorganiser (copie modifiable).                                                                                                                                                                                         | P2   |
| O4  | Classes (étiquettes)           | « 5e B », « 2nde 3 » : simples étiquettes pour ranger feuilles et parcours. **Pas de liste d'élèves.**                                                                                                                                                                   | P2   |
| O5  | Planification                  | Associer une feuille à une date/séance (« utilisée le 12/10 avec 5e B »). Vue calendrier simple. Permet de retrouver le corrigé exact d'un sujet distribué.                                                                                                              | P2   |
| O6  | Objectifs / compétences        | Réutilise les objectifs des parcours (`parcoursObjectives`) : étiqueter une feuille par objectif, voir les exercices qui travaillent un objectif.                                                                                                                        | P3   |
| O7  | Couverture du programme        | Pour une classe : quels chapitres du référentiel ont déjà fait l'objet de feuilles (à partir de O5). Indicateur sur le travail de l'enseignant, pas sur les élèves.                                                                                                      | P3   |

### 4.3 Préférences et personnalisation

| #   | Service                           | Description                                                                                                                                                                          | Prio |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| P1  | Préférences d'interface           | Vue par défaut, papier/numérique, interactivité, clavier réduit, référentiel FR/CH, langue, visites guidées vues, réglages TBI, thème. Rassemble les clés `localStorage` existantes. | P1   |
| P2  | Réglages par défaut des exercices | Nombre de questions, correction détaillée, QCM ou saisie libre par défaut, barème…                                                                                                   | P2   |
| P3  | « Mon style » de document         | Modèles Typst/LaTeX : en-tête d'établissement, logo, polices, page de garde, barème, pied de page. Choix du modèle à la création d'une fiche.                                        | P1   |
| P4  | Liens courts intégrés             | Lien court `coopmaths.fr/m/xxxx` vers une feuille enregistrée (lecture seule). Supprime la dépendance au jeton edurl.fr et le problème des URL trop longues. Réservé au compte.      | P2   |
| P5  | Secrets locaux                    | Jetons tiers (edurl…) : jamais synchronisés en clair ; restent locaux ou sont chiffrés.                                                                                              | P1   |

### 4.4 Partage et collaboration (entre enseignants)

| #   | Service                        | Description                                                                                                                                                                | Prio |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| C1  | Partage par lien               | Un élément ou un dossier partagé en lecture seule ; le destinataire l'ouvre dans MathALÉA et peut « l'ajouter à ma bibliothèque » (copie).                                 | P2   |
| C2  | Espaces d'équipe               | Un dossier commun à plusieurs comptes (équipe de maths d'un établissement, groupe de formation), avec droits lecture / édition.                                            | P3   |
| C3  | Collections publiques          | Publication volontaire d'une collection (fiche de révision, progression) dans un annuaire, avec auteur affiché et licence (CC-BY-SA par défaut). Nécessite une modération. | P3   |
| C4  | Pont vers les banques externes | Exporter une collection au format banque externe (`manifest.json`) pour la publier sur la forge.                                                                           | P3   |
| C5  | Retours sur les exercices      | Signalement de bug rattaché au compte (suivi de ses signalements), suggestion de variante.                                                                                 | P3   |

### 4.5 Données et portabilité

| #   | Service                           | Description                                                                                                                                                                                                                                                                     | Prio             |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| D1  | Fichier « Mon MathALÉA »          | Export de toute la bibliothèque (ou d'un dossier) dans un fichier `.mathalea` (JSON, ou ZIP si pièces jointes). Import avec fusion sans écraser.                                                                                                                                | P1               |
| D2  | Fichier de travail lié            | Sur Chromium (File System Access API) : choisir un fichier sur le disque (ou dans un dossier synchronisé : Nextcloud apps.education, OneDrive…) que MathALÉA réécrit à chaque modification. Ailleurs : téléchargement manuel et rappel périodique. Synchronisation sans compte. | P2               |
| D3  | Synchronisation par compte        | Miroir serveur, plusieurs appareils, hors ligne puis rattrapage.                                                                                                                                                                                                                | P2               |
| D4  | Migration des stockages existants | Au premier lancement, reprise des clés `localStorage` listées en §1.                                                                                                                                                                                                            | P1               |
| D5  | Persistance du stockage           | Demande `navigator.storage.persist()` ; alerte si le navigateur peut effacer les données (Safari efface le stockage d'un site après 7 jours sans visite) ; invitation à exporter ou à se connecter.                                                                             | P1               |
| D6  | Droits RGPD                       | Export, suppression du compte et de toutes ses données en un clic.                                                                                                                                                                                                              | P1 (avec compte) |

## 5. Exigences « aucune donnée d'élève »

- Aucun champ du modèle ne désigne un élève ; les classes sont des étiquettes.
- Les résultats de la vue élève, des quiz en direct et des parcours ne sont
  **jamais** envoyés à l'API Mon MathALÉA (`bestScore` et équivalents sont
  retirés à l'enregistrement).
- Les notes libres pourraient contenir des noms : avertissement dans
  l'interface et dans les CGU (« n'indiquez pas de données d'élèves »).
- Les liens partagés (P4, C1) donnent accès à du contenu, jamais à une
  activité d'élève.
- Revue de conformité à chaque nouveau type d'élément.

## 6. Spécifications techniques

### 6.1 Architecture d'ensemble

```
Navigateur (coopmaths.fr/alea, site statique actuel)
 ├─ « Mes sauvegardes » ──► IndexedDB + localStorage (source de vérité locale)
 │                        ├─► Adaptateur « fichier » (export/import, fichier lié)
 │                        └─► Adaptateur « serveur » (sync, optionnel)
 └─ Vues existantes : bouton Enregistrer, étoile, référentiel perso

API Mon MathALÉA (autre domaine : https://mon.mathalea.fr/api/…)
 ├─ PHP 8 sans framework, hébergement mutualisé (O2Switch)
 ├─ Comptes locaux (identifiant + mot de passe, adresse facultative)
 ├─ Un document `.mathalea` par compte ── MariaDB
 └─ Courriels (confirmation d'adresse, mot de passe oublié) ── SMTP
```

L'application ne dépend jamais de l'API pour fonctionner : si l'API est
indisponible, on reste en mode local.

### 6.2 Modèle de données (côté client et serveur)

Format versionné `mon-mathalea/1`. Le prototype « Mes sauvegardes »
utilise des clés en anglais (`folders`, `sheets`, `selectionFolders`,
`selections`), comme les types du code ;
le modèle générique ci-dessous reste une piste pour les autres éléments.

```ts
interface LibraryItem {
  id: string // UUID v7 (triable par date, généré côté client)
  type:
    | 'favori'
    | 'feuille'
    | 'fiche-typst'
    | 'fiche-latex'
    | 'diaporama'
    | 'can'
    | 'flashcards'
    | 'jai-qui-a'
    | 'omr'
    | 'parcours'
    | 'modele-document'
    | 'exercice-libre'
    | 'referentiel'
    | 'banque'
  titre: string
  etiquettes: string[]
  dossierId?: string
  note?: string
  contenu: ItemContent // dépend du type, cf. ci-dessous
  versionApp: string // version de MathALÉA à l'enregistrement
  creeLe: string
  modifieLe: string
  supprimeLe?: string // pierre tombale (corbeille + sync)
  rev: number // compteur de révision pour la sync
}

// Contenu d'une feuille : l'état déjà sérialisé dans l'URL, en structuré
interface SheetContent {
  exercices: InterfaceParams[] // uuid, id, alea, sup…, nbQuestions
  options: InterfaceGlobalOptions // v, title, presMode, setInteractive…
  grainesFigees: boolean
  typstParam?: TypstParam // options + carryOver
  latex?: { modele: string; sourceModifiee?: string }
  piecesJointes?: string[] // ids de blobs
}
```

Points d'attention :

- **Réutiliser la sérialisation existante** (`exercicesParams`,
  `globalOptions`, `typstParam`, `buildShareUrl`) plutôt qu'en inventer une ;
  une feuille doit pouvoir s'ouvrir par une URL reconstruite.
- **uuid remplacés** : à l'ouverture, passer chaque `uuid` par
  `src/json/uuidsRemplaces.json` ; un exercice supprimé est signalé, pas
  silencieusement retiré.
- Retirer à l'enregistrement tout champ lié à un résultat (`bestScore`).
- Migrations de schéma explicites et testées (`mon-mathalea/1` → `/2`).

### 6.3 Stockage local

- IndexedDB, sur le modèle de `src/lib/stores/banquesExternesDb.ts` (pas de
  nouvelle dépendance lourde ; à la rigueur `idb`, ~1 ko).
- Magasins : `items`, `blobs`, `meta` (préférences, état de sync, curseur).
- Store Svelte 5 (`$state`/runes) exposant la bibliothèque, alimenté par
  IndexedDB, avec synchronisation entre onglets (`BroadcastChannel`).
- Les préférences (P1) remplacent progressivement les clés `localStorage`
  dispersées, avec une couche de compatibilité le temps de la migration.

### 6.4 Fichier « Mon MathALÉA »

- `.mathalea` = JSON (`{ format: 'mon-mathalea/1', exporteLe, items: [...] }`),
  ou ZIP (JSZip, déjà présent) quand il y a des pièces jointes.
- Import : fusion par `id` et `modifieLe` ; en cas de conflit, conserver les
  deux versions (« copie du … »). Jamais d'effacement à l'import.
- Fichier lié (D2) : `showSaveFilePicker` + handle conservé en IndexedDB,
  écriture débouncée ; détection d'une modification externe (date du fichier)
  avant réécriture.

### 6.5 Synchronisation avec compte

Réalisé côté client : `src/lib/mesFeuilles/sync.ts` et `tombstones.ts` (voir
[la documentation](../developpement/maintenance-moteur/exports/mes-sauvegardes.md#synchronisation-entre-appareils)).

- **Le serveur ne fusionne rien.** Il garde un seul document par compte : le
  fichier `.mathalea` de toute la bibliothèque, réglages, corbeille et pierres
  tombales compris, sans les aperçus (trop lourds, recalculés à l'ouverture).
  Toute la logique de fusion est dans le client, testée avec Vitest.
- **Concurrence optimiste** par numéro de révision :
  - `GET /api/data` → `{ account, epoch, rev, data }` ;
  - `PUT /api/data` avec la révision de base : le serveur exécute
    `UPDATE … SET data = ?, rev = rev + 1 WHERE user_id = ? AND rev = ?` ;
    si aucune ligne n'est modifiée, il répond `409` avec sa version, que le
    client fusionne (`mergeSyncDocuments`) avant de renvoyer.
- **Pierres tombales** : un élément supprimé définitivement (feuille,
  sélection, dossier, modèle de document, diaporama de l'historique) laisse
  une trace datée, gardée un an. Sans elles, un élément supprimé sur un
  appareil reviendrait depuis la copie d'un autre. À la fusion, pour chaque
  élément, la modification, la mise à la corbeille ou la suppression la plus
  récente l'emporte. L'import d'un fichier, lui, ne supprime jamais rien et
  fait revenir un élément supprimé : il sert à récupérer.
- **`epoch`** : tiré au hasard par le serveur à la création du compte et à
  chaque « Effacer mes données en ligne ». Un appareil qui découvre un autre
  `epoch` que le sien ne renvoie rien sans demander : « Les données en ligne
  ont été effacées depuis un autre appareil : effacer aussi ici, ou renvoyer
  les données de cet appareil ? » (`nextSyncStep`).
- Déclencheurs : envoi quelques secondes après une modification (comme la
  sauvegarde automatique dans un fichier), lecture au chargement et au retour
  sur l'onglet (`visibilitychange`) ; hors ligne, un simple indicateur « à
  envoyer », traité à la reconnexion.
- Premier envoi d'un appareil qui a déjà une bibliothèque locale : fusion
  proposée explicitement.
- Le serveur garde les 5 à 10 dernières versions du document, pour annuler
  une synchronisation malheureuse.

### 6.6 Comptes et authentification

Pas de fournisseur d'identité externe : tout le monde doit pouvoir créer un
compte (enseignants du privé, de l'étranger, formateurs…). Le compte reste
**facultatif**.

- **Identifiant libre** (unique) et **mot de passe** d'au moins 10 caractères,
  haché par `password_hash()` (Argon2id, ou bcrypt à défaut).
- **Adresse électronique facultative**, confirmée par un lien avant de
  servir. Sans adresse confirmée, un mot de passe oublié ne se récupère pas :
  l'interface le dit à la création du compte (les données locales et le
  fichier `.mathalea` restent).
- **Session par jeton**, pas par cookie : l'API est sur un autre site que
  coopmaths.fr, et les navigateurs bloquent les cookies tiers (Safari,
  Firefox). À la connexion, le serveur renvoie un jeton aléatoire de
  32 octets, gardé par le client et envoyé dans `Authorization: Bearer …`. Le
  serveur n'en garde que l'empreinte SHA-256 ; le jeton dure un an, prolongé à
  l'usage, et se révoque (déconnexion, « déconnecter tous les appareils »,
  changement de mot de passe). Sans cookie, pas d'attaque CSRF.
- **CORS** limité aux origines connues (`https://coopmaths.fr`, et
  `http://localhost:5173` en développement).
- **Mot de passe oublié** : même réponse que le compte existe ou non ; lien à
  usage unique valable une heure (empreinte en base) ; la réinitialisation
  révoque toutes les sessions.
- **Anti-robots**, sans service tiers : champ piège invisible, limitation de
  débit (connexion : une dizaine d'essais par quart d'heure, par adresse IP et
  par identifiant ; création de compte ; mot de passe oublié) et preuve de
  travail ALTCHA (auto-hébergée).

| Fonction                      | Route                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| Créer un compte               | `POST /api/register`                                                |
| Confirmer l'adresse           | `GET /api/email/confirm?t=…`                                        |
| Se connecter, se déconnecter  | `POST /api/login`, `POST /api/logout`                               |
| Synchroniser, récupérer       | `GET /api/data`, `PUT /api/data`                                    |
| Effacer ses données en ligne  | `DELETE /api/data` (garde le compte, nouvel `epoch`)                |
| Mot de passe oublié           | `POST /api/password/forgot`, `POST /api/password/reset`             |
| Changer mot de passe, adresse | `PUT /api/password`, `PUT /api/email` (mot de passe actuel demandé) |
| Supprimer le compte           | `DELETE /api/account` (mot de passe demandé)                        |

Après la suppression du compte ou l'effacement des données, les autres
appareils reçoivent `401` (ou un autre `epoch`) et repassent en mode local
**sans rien effacer** de leur côté.

### 6.7 Backend

Choisi pour durer sans entretien sur un hébergement mutualisé de type
O2Switch :

- **PHP 8** sans framework (une dizaine de fichiers) : natif sur l'hébergement,
  aucun processus à surveiller, pas de montée de version de framework.
  Seule dépendance Composer : **PHPMailer** (SMTP d'une boîte
  `no-reply@mathalea.fr`, avec SPF, DKIM et DMARC réglés dans cPanel).
- **MariaDB** par PDO et requêtes préparées : tables `users`, `tokens`,
  `documents` (`user_id`, `epoch`, `rev`, `data`, `updated_at`),
  `document_history`, `rate_limits`.
- Quota d'environ 5 Mo par document.
- **Cron** cPanel : purge des jetons expirés, des liens de réinitialisation,
  des comptes jamais confirmés ni utilisés, et des comptes inactifs (§6.9).
- Écartés : Node (Hono, Fastify) ou PocketBase, qui demandent un processus
  permanent, fragile sur un hébergement mutualisé ; Laravel ou Symfony,
  surdimensionnés pour une dizaine de routes ; Supabase, impossible à
  installer ; PostgreSQL et stockage S3, inutiles tant que les pièces
  jointes (B7) et les liens courts (P4) ne sont pas faits.
- Code du serveur dans le dépôt (dossier à part) ; déploiement par copie des
  fichiers (SFTP ou Git de cPanel). Sauvegardes de l'hébergeur, plus un
  export quotidien de la base.

### 6.8 Sécurité

- Validation stricte des documents reçus : JSON valide, format
  `mon-mathalea/1`, taille maximale. Le client revérifie tout à la lecture
  (`parseLibraryFile`), comme pour un fichier importé.
- Notes en texte brut ou Markdown assaini ; aucun HTML utilisateur rendu tel
  quel.
- Le jeton est lisible par tout script de l'origine `coopmaths.fr` : CSP du
  site à compléter (dont `connect-src` vers l'API), jeton révocable.
- Limitation de débit (connexion, création de compte, mot de passe oublié,
  envois).
- Contenus partagés : signalement et retrait (C3).

### 6.9 RGPD et cadre

- Données personnelles traitées : identifiant de compte, adresse
  électronique si elle est donnée, journaux techniques. Contenus pédagogiques
  de l'enseignant.
- À désigner : responsable de traitement (association Coopmaths), registre
  des traitements, mentions d'information, CGU.
- Suppression automatique des comptes inactifs depuis 6 mois (avec
  avertissement 30 jours avant si une adresse est confirmée), récupération et
  suppression à la demande (D6).
- Pas de nouveau traceur : Matomo inchangé, sans cookie ; aucune donnée Mon
  MathALÉA dans les statistiques.

### 6.10 Interface

- **Entrée « Mon MathALÉA »** dans l'en-tête (icône + indicateur : local seul /
  synchronisé / conflit).
- **Vue dédiée** (`v=mon-mathalea`) : dossiers, recherche, filtres, cartes
  d'éléments avec aperçu, actions (ouvrir, dupliquer, nouvelle version,
  partager, exporter, supprimer).
- **Points d'entrée contextuels** : étoile sur les exercices ; bouton
  « Enregistrer » / « Enregistrer sous » dans chaque vue (accueil, Typst,
  LaTeX, diaporama, CAN…) ; indicateur « modifié depuis l'enregistrement ».
- **Menu latéral** : sections « Mes favoris », « Mon référentiel » (O1),
  « Récents ».
- Accessibilité (RGAA), clavier, mobile (vue mobile existante).
- Textes en français, consignes à l'infinitif, comme le reste du site.

## 7. Tests

- **Vitest** : modèle et migrations de schéma, fusion import/sync et
  conflits, migration des clés `localStorage`, résolution des uuid remplacés,
  reconstruction d'URL à partir d'une feuille enregistrée (aller-retour
  URL → élément → URL).
- **Stabilité** : une feuille enregistrée avec graines figées doit produire
  le même énoncé ; s'appuie sur `pnpm stability:check`.
- **Playwright** (vrais clics) : enregistrer une feuille, la rouvrir, exporter
  puis importer le fichier, favoris, référentiel perso dans le menu.
- **Backend** : tests d'API (création de compte, connexion, conflit de
  révision `409`, `epoch`, quotas, mot de passe oublié, suppression).

## 8. Découpage en phases

| Phase                       | Contenu                                                                                                                             | Serveur |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **0 — Fondations**          | Modèle `mon-mathalea/1`, IndexedDB, store, export/import fichier (D1), persistance (D5), migration (D4)                             | Non     |
| **1 — Bibliothèque locale** | Favoris (B1), feuilles (B3–B5, B9), fiches Typst/LaTeX (B6), « Mon style » (P3), préférences (P1), recherche, corbeille, vue dédiée | Non     |
| **2 — Organisation**        | Référentiel personnalisé (O1–O3), classes-étiquettes et planification (O4–O5), parcours et banques (B10–B11), fichier lié (D2)      | Non     |
| **3 — Compte**              | Authentification, synchronisation (D3), pièces jointes (B7), liens courts (P4), partage par lien (C1), RGPD (D6)                    | Oui     |
| **4 — Collectif**           | Espaces d'équipe (C2), collections publiques et modération (C3), pont banques (C4), retours (C5)                                    | Oui     |

Les phases 0 à 2 apportent l'essentiel de la valeur **sans aucun serveur ni
donnée personnelle** ; elles valident l'usage avant d'engager l'hébergement et
le cadre juridique.

## 9. Questions ouvertes

1. Responsable de traitement : l'association Coopmaths, avec un hébergement
   O2Switch (§6.7) ? À confirmer, ainsi que les CGU.
2. Faut-il, plus tard, proposer aussi ProConnect ou le SSO apps.education en
   plus des comptes locaux ?
3. Collections publiques : qui modère, avec quels moyens ?
4. Quotas et pérennité : quel volume par compte est soutenable ?
5. Le référentiel personnalisé doit-il pouvoir être partagé à l'échelle d'une
   académie (progressions communes) ?
6. Faut-il garder une compatibilité avec l'application mobile (parcours) au
   point de partager le même compte plus tard ?
