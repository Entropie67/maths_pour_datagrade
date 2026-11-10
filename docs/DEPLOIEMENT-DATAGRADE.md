# Déploiement sur maths.datagrade.fr

Adresse cible fournie par l'utilisateur : **https://maths.datagrade.fr/alea/**.

La configuration Vite amont utilise déjà `base: '/alea/'`. Le contenu du dossier construit `mathalea/dist/` doit être servi sous `/alea/`, et non à la racine du sous-domaine. Par exemple, `dist/index.html` répond à `/alea/`, `dist/assets/` à `/alea/assets/` et `dist/static/` à `/alea/static/`. Conserver l'intégralité du dossier, notamment les 1,50 Go d'annales livrées.

L'adaptation de `siteOrigin` reconnaît exactement `maths.datagrade.fr` pour les ressources statiques. `refUtils` utilise cette origine lors de la construction des liens d'annales, y compris en production. La vitrine associative conserve son origine CoopMaths ; les autres hébergements et intégrations gardent leur comportement amont. Les tests couvrent le mode production et évitent de reconnaître un domaine qui aurait simplement le même préfixe.

Le code est préparé pour cette adresse ; ce document ne signifie pas que le DNS, le certificat HTTPS ou l'hébergement ont été configurés. Aucun accès au serveur DataGrade n'a été utilisé.

## Construction

Depuis `mathalea/`, utiliser les dépendances verrouillées puis `pnpm build` (voir les commandes PowerShell dans le README principal). Vite copie les ressources de `public/` dans `dist/`. Le seul moteur embarquable ne remplace pas l'application complète.

## Réglages de l'hébergement

- Faire pointer le sous-domaine vers l'hébergement choisi et lui associer un certificat HTTPS.
- Publier le contenu de `dist/` au chemin `/alea/`. Préserver les paramètres des liens partagés lors de toute redirection, notamment `/alea` vers `/alea/`.
- Servir les fichiers statiques réellement présents ; une annale absente doit répondre 404, pas recevoir la page HTML de l'application.
- Ne pas reprendre tel quel le conteneur de déploiement Scaleway amont : il configure les domaines CoopMaths/MathALÉA et un proxy vers leur bucket. Pour DataGrade, les annales livrées doivent être servies depuis le dossier local `static/`.
- Prévoir les ressources externes restant nécessaires, décrites dans le rapport des annales et le plan d'intégration.

## Vérification après publication

Contrôler l'ouverture de `/alea/`, les fichiers JavaScript/CSS et l'affichage des annales avec leurs corrections. La variable `MATHALEA_URL=https://maths.datagrade.fr/alea/` permet d'exécuter `node scripts/test-annales-locales.mjs` contre la cible avec les requêtes externes bloquées. Ce contrôle distant n'a pas encore été exécuté.

La validation complète doit aussi couvrir les exports, liens partagés et intégrations externes. Les références indisponibles sont conservées dans `resources/annales-coverage.json`.
