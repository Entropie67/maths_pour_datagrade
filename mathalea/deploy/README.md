# Héberger le site sur Scaleway

Ce dossier contient ce qu'il faut pour construire l'image du site, la déployer
sur Scaleway, et reprendre le service sans avoir monté l'installation. Aucun
identifiant de ressource n'est recopié ici, ils changeraient le jour où une
ressource est recréée. À la place, les commandes qui les retrouvent.

## Comment c'est organisé

`coopmaths.fr` sert trois choses : l'application (`/alea`), les scans
d'annales (`/alea/static`, 1,9 Go et 11 000 fichiers) et la vitrine de
l'association (projet
[coopmaths/www](https://forge.apps.education.fr/coopmaths/www)). Aujourd'hui
la vitrine est à `coopmaths.fr/www/`. Ici elle est à la racine : `/6e/`
affiche la page que le bucket range sous `www/6e/`, et une ancienne adresse en
`/www/...` (favoris, liens) est renvoyée en 301 vers la même page sans le
`/www`. Côté projet www, il reste à passer `base: '/'` dans `astro.config.mjs`
pour que ses liens internes soient à la racine eux aussi (en attendant, chaque
clic du menu passe par ce renvoi). La vitrine est construite avec le lien
complet `https://coopmaths.fr/alea` vers MathALÉA : nginx le réécrit au passage
vers le nom mathalea jumeau du nom demandé (sur `staging.coopmaths.fr` le lien
mène à `https://staging.mathalea.fr`, sur `coopmaths.fr` à `https://mathalea.fr`).

Le conteneur répond sur plusieurs noms et choisit sur le nom demandé (`map $host`
dans la configuration nginx). `staging.coopmaths.fr` se comporte comme
`coopmaths.fr` demain : la vitrine à la racine, MathALÉA en `/alea/` (adresse
historique, les liens partagés continuent de marcher). `staging.mathalea.fr` se
comporte comme `mathalea.fr` demain : l'application à la racine, sans `/alea/`
dans l'adresse, et `/alea/` y renvoie en gardant les paramètres. Ce que
l'application demande depuis la racine par un chemin relatif (`assets/svg/...`,
`styles/...`) est lu dans `/alea/` ; la vitrine n'est pas sur ce nom (`/6e/`
répond 404, comme `mathalea.fr` aujourd'hui). La règle vaut
déjà pour `mathalea.fr` et `www.mathalea.fr` le jour où ils arrivent. Les
premiers noms, `staging.*.education-nationale.eu`, répondent toujours. Les
adresses de test et l'adresse technique du conteneur portent l'en-tête
`X-Robots-Tag: noindex` : les moteurs de recherche ne les gardent pas.

L'application est dans une image Docker : nginx sert les fichiers construits
par `pnpm build`, compressés une fois pour toutes à la construction. Les scans
et la vitrine sont dans un bucket Object Storage nommé `mathalea-static`, et
nginx les relaie au même chemin en gardant une copie locale (10 min pour la
vitrine, un jour pour les scans) : un fichier demandé une fois ne refait pas
l'aller-retour vers le bucket. L'image reste petite (environ 250 Mo, elle
démarre en quelques secondes) et la vitrine se met à jour sans toucher à
MathALÉA.

```text
navigateur ──► conteneur nginx ──┬── /alea            fichiers de l'image
                                 ├── /alea/static/*   bucket mathalea-static
                                 ├── /*               la vitrine, bucket mathalea-static (dossier www/)
                                 ├── /www/*           301 vers /* (anciennes adresses)
                                 ├── /                la vitrine, ou l'application sur un nom mathalea
                                 └── /health          version déployée
```

Tout vit dans le projet Scaleway `incubateur-mathalea`, région `fr-par` :

| Ressource                     | Nom                         |
| ----------------------------- | --------------------------- |
| Conteneur Serverless staging  | `mathalea-staging`          |
| Conteneur Serverless prod     | `mathalea`                  |
| Bucket des scans et vitrine   | `mathalea-static`           |
| Registry des images           | `rg.fr-par.scw.cloud/mathalea` |

Un conteneur Serverless ajoute des instances tout seul quand le trafic monte
(jusqu'à 20 pour la production, le plafond Scaleway est à 200), et Scaleway
pose le certificat sur le nom de domaine. Le conteneur de production garde
toujours une instance allumée, celui de staging s'éteint quand personne ne
l'utilise.

| Environnement | Adresse                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- |
| staging       | `https://staging.coopmaths.fr` (la vitrine) et `https://staging.mathalea.fr` (l'application à la racine) |
| production    | `https://coopmaths.fr` une fois le DNS basculé. Avant, l'adresse donnée par Scaleway au conteneur (variable `PRODUCTION_URL` de la CI). |

Pour retrouver les ressources, avec le [CLI Scaleway](https://www.scaleway.com/en/cli/) :

```bash
scw config get default-project-id      # doit être le projet incubateur-mathalea
scw container container list           # les deux conteneurs, avec leur adresse
```

## Comment ça se déploie

Le staging se met à jour une fois par nuit, pas à chaque merge (`main` en
reçoit plus de 25 par jour) : le scheduled pipeline "Déploiement staging" porte
la variable `DEPLOY_STAGING=true`. Avec elle, le pipeline ne lance que les jobs
de ce dossier, les jobs de test de la racine s'effacent (`.hors_deploiement`
dans le `.gitlab-ci.yml` de la racine) : il construit le site et l'image,
recopie l'image sur le registry Scaleway et bascule le staging. Pour l'avoir
tout de suite : Build > Pipelines > Run pipeline, branche `main`, variable
`DEPLOY_STAGING` à `true`.

Les jobs sont dans `deploy/gitlab-ci.yml`, inclus par le `.gitlab-ci.yml` de la
racine, et rangés dans les stages de la boucle DevSecOps :

| stage | jobs |
| --- | --- |
| build | `build:site` : construit le site et son image nginx (docker, Dockerfile multi-stage), la pousse sur le registry de la forge |
| release | `release:site` : l'image recopiée sur le registry Scaleway, c'est la version livrée |
| deploy | `deploy:staging`, `deploy:production` : bascule du conteneur |
| monitor | `monitor:staging`, `monitor:production` : le site vérifié de l'extérieur avec `deploy/smoke.sh` |

Les jobs de la CI tournent sur le runner `mathalea` de la forge, porté par les
serveurs de l'incubateur, sans limite mémoire par job : la construction du site
(5 Go au pic) y tient, elle n'y tenait pas sur les runners de la forge.
`build:site` se relance tout seul si le runner lâche et n'est pas
interruptible : une fois lancé, le pipeline n'est plus annulé par le pipeline
suivant sur `main`, ce qui arrivait presque chaque nuit. La version déployée
est le SHA court du commit, on la lit sur `/health` :

```bash
curl https://staging.coopmaths.fr/health
{"status":"ok","version":"c292c069"}
```

Pour la production, on pose le tag `production` sur un commit déjà passé par
`main`. Le script le fait par l'API de la forge, parce qu'un tag protégé ne se
déplace pas avec `git push` :

```bash
deploy/promote.sh c292c069        # un SHA, ou une référence comme origin/main
```

Le job `monitor:production` vérifie ensuite que le site répond avec cette
version (`deploy/smoke.sh`). Revenir en arrière, c'est promouvoir le commit
d'avant, de la même façon.

## Tester l'image chez soi

```bash
docker build -f deploy/Dockerfile -t mathalea:dev .
docker run --rm -p 8080:8080 -e BUCKET_HOST=coopmaths.fr mathalea:dev
deploy/smoke.sh http://localhost:8080
curl -s localhost:8080/ | grep -c _astro           # la vitrine à la racine
curl -sI localhost:8080/www/6e/ | grep -i location # renvoi vers /6e/
curl -s -H 'Host: staging.mathalea.fr' localhost:8080/ | grep -c MathALÉA    # l'application à la racine
curl -sI -H 'Host: staging.mathalea.fr' 'localhost:8080/alea/?uuid=1' | grep -i location  # renvoi vers /?uuid=1
curl -sI -H 'Host: staging.mathalea.fr' localhost:8080/assets/svg/flags/fr.svg | head -1  # fichier de l'application lu dans /alea/
curl -sI -H 'Host: staging.coopmaths.fr' localhost:8080/ | grep -i x-robots  # noindex sur les adresses de test
curl -sI -H 'Host: staging.coopmaths.fr' -H 'Origin: https://staging.mathalea.fr' localhost:8080/vitrine/fragment/ | grep -i access-control  # le bloc d'accueil lisible depuis le nom mathalea jumeau
```

Avec `BUCKET_HOST=coopmaths.fr`, les scans et la vitrine viennent du site
actuel, ce qui permet de tester sans bucket. Ce site limite les requêtes
répétées (429 au bout de quelques passages) : pour un test répété, prendre le
bucket lui-même, `BUCKET_HOST=mathalea-static.s3-website.fr-par.scw.cloud`
(le point d'entrée "site web" du bucket, qui sert `dossier/` comme
`dossier/index.html`).

## Mettre à jour les scans ou la vitrine

La vitrine du staging part toute seule : la CI du projet www la construit et
l'envoie dans `www/` à chaque changement de sa branche `main` (job
`deploy:staging` de son `.gitlab-ci.yml`, qui n'envoie que les fichiers
modifiés). Les commandes ci-dessous servent aux scans, et à la vitrine en
secours.

Il faut la clé de l'application IAM `mathalea-static` (elle est rangée dans
Secret Manager, projet `incubateur-mathalea`, chemin `/mathalea`) et un client
S3. Avec `s3cmd`, le fichier de configuration tient en quelques lignes :

```ini
[default]
access_key = ...
secret_key = ...
host_base = s3.fr-par.scw.cloud
host_bucket = %(bucket)s.s3.fr-par.scw.cloud
bucket_location = fr-par
use_https = True
```

Les fichiers doivent être lisibles par tout le monde (`--acl-public`), sinon le
conteneur reçoit un refus à leur place :

```bash
# Les scans : le dossier local reproduit l'arborescence de /alea/static
s3cmd -c mathalea.s3cfg sync --acl-public ./static/ s3://mathalea-static/alea/static/

# La vitrine, depuis le projet www après astro build (sortie dans dist/,
# installer avec npm install --legacy-peer-deps, pnpm bloque sur les peer
# dependencies de typescript 7). Sans --no-mime-magic,
# s3cmd envoie les .css et .js en text/plain et le navigateur les refuse.
# Les .webp passent à part, s3cmd ne connaît pas leur type.
s3cmd -c mathalea.s3cfg sync --acl-public --no-mime-magic --delete-removed dist/ s3://mathalea-static/www/
s3cmd -c mathalea.s3cfg put --recursive --acl-public -m image/webp --exclude '*' --include '*.webp' dist/ s3://mathalea-static/www/
```

Le `deploy.sh` du projet www remplace son `rsync` par ces deux dernières
lignes.

## Basculer coopmaths.fr

Le domaine est enregistré chez OVH, la zone DNS et le courriel sont chez
o2switch. Un domaine racine ne peut pas être un CNAME, il lui faut un ALIAS.
Si le Zone Editor du cPanel d'o2switch en propose un, la zone peut rester
là-bas et seules les étapes 5 et 6 restent à faire. Sinon la zone passe chez
Scaleway, qui sait faire un ALIAS vers le conteneur. Le courriel reste chez
o2switch dans les deux cas, ses enregistrements sont recopiés.
Pendant les quelques minutes entre le changement de serveurs de noms et la
pose du certificat, le navigateur affiche une erreur de certificat : faire la
bascule à une heure creuse.

1. Exporter la zone actuelle depuis cPanel (Zone Editor) pour ne rien oublier :
   MX, SPF, DKIM, `mail`, `www`, `ftp`, les TXT de vérification.
2. Dans la console Scaleway, projet `incubateur-mathalea`, Domains and DNS,
   ajouter `coopmaths.fr` comme domaine externe et prouver qu'il est à nous
   avec l'enregistrement TXT demandé, posé chez o2switch.
3. Recopier les enregistrements de l'étape 1 dans la zone Scaleway, puis
   ajouter ce qui pointe sur le conteneur de production :

   ```bash
   endpoint=$(scw container container get <id du conteneur mathalea> -o json | grep -o '"domain_name":"[^"]*"' | cut -d'"' -f4)
   scw dns record add coopmaths.fr name=@   type=ALIAS data="$endpoint." ttl=300
   scw dns record add coopmaths.fr name=www type=CNAME data="$endpoint." ttl=300
   ```

4. Chez OVH, remplacer les serveurs de noms par ceux de Scaleway
   (`ns0.dom.scw.cloud` et `ns1.dom.scw.cloud`).
5. Quand `dig coopmaths.fr` répond l'adresse Scaleway, déclarer les deux noms
   sur le conteneur, Scaleway pose le certificat :

   ```bash
   scw container domain create container-id=<id> hostname=coopmaths.fr
   scw container domain create container-id=<id> hostname=www.coopmaths.fr
   ```

6. Mettre `PRODUCTION_URL` à `https://coopmaths.fr` dans les variables de la CI,
   lancer `deploy/smoke.sh https://coopmaths.fr`, et envoyer un courriel à
   `contact@coopmaths.fr` pour vérifier que le courrier arrive toujours.

`mathalea.fr` (application mobile, `/releases`) reste chez o2switch. S'il
vient ici un jour, nginx sait déjà quoi en faire : l'application à la racine.

`coopmaths.fr/apigeom/` est aussi servi aujourd'hui (projet
[coopmaths/apigeom](https://forge.apps.education.fr/coopmaths/apigeom)), et le
menu de la vitrine y mène. Avant la bascule, il lui faut une place : le plus
simple est le bucket, comme la vitrine, avec un relais `/apigeom/` de plus dans
la configuration nginx.

## Ce dont la CI a besoin

Toutes ces variables sont protégées : elles ne sont exposées qu'à `main` et au
tag `production`, lui aussi protégé.

| Variable                                             | À quoi ça sert                                             |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`                   | clé de l'application IAM `mathalea-ci`, limitée au projet (copie dans Secret Manager, chemin `/mathalea`) |
| `SCW_DEFAULT_PROJECT_ID`, `SCW_DEFAULT_ORGANIZATION_ID` | le CLI Scaleway les exige                               |
| `SCW_REGISTRY`                                       | `rg.fr-par.scw.cloud/mathalea`, où l'image est recopiée    |
| `SCW_STAGING_CONTAINER_ID`, `SCW_PRODUCTION_CONTAINER_ID` | le conteneur à basculer                               |
| `PRODUCTION_URL`                                     | adresse vérifiée après un déploiement en production        |

Sans ces variables, les jobs de déploiement affichent `DRY-RUN` et passent.

## Si tout est à recréer

Les ressources ont été créées une fois avec ces commandes, dans cet ordre.
`<projet>` est l'identifiant du projet `incubateur-mathalea`.

```bash
# Le projet, puis deux applications IAM : la CI (conteneurs et registry) et
# l'envoi dans le bucket. Une application vit au niveau de l'organisation,
# c'est sa politique qui la limite au projet.
scw account project create name=incubateur-mathalea
scw iam application create name=mathalea-ci
scw iam policy create name=mathalea-ci application-id=<app> \
  rules.0.project-ids.0=<projet> \
  rules.0.permission-set-names.0=ContainersFullAccess \
  rules.0.permission-set-names.1=ContainerRegistryFullAccess
scw iam api-key create application-id=<app> default-project-id=<projet> description="CI de la forge"

scw iam application create name=mathalea-static
scw iam policy create name=mathalea-static application-id=<app> \
  rules.0.project-ids.0=<projet> \
  rules.0.permission-set-names.0=ObjectStorageFullAccess
scw iam api-key create application-id=<app> default-project-id=<projet> description="bucket mathalea-static"

# Chaque clé est rangée dans Secret Manager, chemin /mathalea, sous la forme
# d'un fichier de deux lignes SCW_ACCESS_KEY=... et SCW_SECRET_KEY=...
scw secret secret create project-id=<projet> name=mathalea-ci path=/mathalea
scw secret version create <secret> data=@mathalea-ci.env

# Registry privé et namespace de conteneurs
scw registry namespace create name=mathalea is-public=false project-id=<projet>
scw container namespace create name=mathalea project-id=<projet> description="Site MathALÉA (coopmaths.fr)"

# Une première image, poussée à la main (ensuite la CI s'en charge)
docker build -f deploy/Dockerfile -t rg.fr-par.scw.cloud/mathalea/mathalea:<sha> .
docker login rg.fr-par.scw.cloud -u nologin --password-stdin   # la clé secrète de mathalea-ci
docker push rg.fr-par.scw.cloud/mathalea/mathalea:<sha>

# Les deux conteneurs. http-option=redirected : le HTTP est renvoyé vers le HTTPS.
scw container container create namespace-id=<ns> name=mathalea-staging \
  registry-image=rg.fr-par.scw.cloud/mathalea/mathalea:<sha> port=8080 \
  min-scale=0 max-scale=5 memory-limit=512 cpu-limit=500 \
  environment-variables.APP_VERSION=<sha> http-option=redirected deploy=true
scw container container create namespace-id=<ns> name=mathalea \
  registry-image=rg.fr-par.scw.cloud/mathalea/mathalea:<sha> port=8080 \
  min-scale=1 max-scale=20 memory-limit=512 cpu-limit=500 \
  environment-variables.APP_VERSION=<sha> http-option=redirected deploy=true

# Les deux noms du staging, dans la zone de l'incubateur (projet incubateur)
scw dns record add education-nationale.eu name=staging.coopmaths type=CNAME data="<endpoint du staging>." ttl=300
scw dns record add education-nationale.eu name=staging.mathalea  type=CNAME data="<endpoint du staging>." ttl=300
scw container domain create container-id=<staging> hostname=staging.coopmaths.education-nationale.eu
scw container domain create container-id=<staging> hostname=staging.mathalea.education-nationale.eu

# Les noms staging.coopmaths.fr et staging.mathalea.fr : un CNAME "staging" vers
# l'endpoint du staging dans chaque zone (Éditeur de zone de cPanel chez
# o2switch, TTL 300), puis la même déclaration sur le conteneur.
scw container domain create container-id=<staging> hostname=staging.coopmaths.fr
scw container domain create container-id=<staging> hostname=staging.mathalea.fr

# Le bucket, avec la clé de mathalea-static (il naît dans le projet par défaut
# de la clé). Le mode site web fait servir index.html dans chaque dossier.
s3cmd -c mathalea.s3cfg mb s3://mathalea-static
s3cmd -c mathalea.s3cfg ws-create --ws-index=index.html --ws-error=404.html s3://mathalea-static
s3cmd -c mathalea.s3cfg put --acl-public -m 'text/html; charset=utf-8' 404.html s3://mathalea-static/404.html
```

Sur la forge, il reste à protéger le tag `production` (Maintainers), à
renseigner les variables du tableau précédent et à créer le scheduled pipeline
"Déploiement staging" (Build > Pipeline schedules : branche `main`, chaque nuit
après les tests, variable `DEPLOY_STAGING=true`).

## Quand ça ne marche pas

Le site ne répond pas. `curl https://<adresse>/health` donne la version
déployée. Si rien ne vient, les journaux du conteneur sont dans la console
Scaleway, onglet Logs.

Un scan ou la vitrine manque. Le conteneur relaie vers le bucket : vérifier
que le fichier existe à ce chemin dans `mathalea-static`, et que l'objet est
lisible publiquement (`--acl-public` à l'envoi). Un chemin qui n'existe pas
dans le bucket répond 403 (le bucket n'a pas le droit de lister) : le conteneur
le transforme en 404 et affiche la page `www/404.html` du bucket, qui est celle
de la vitrine. Si cette page manque aussi, nginx affiche sa page 403 à lui.

Un scan ou la vitrine vient d'être mis à jour dans le bucket et l'ancien
s'affiche encore. Chaque instance du conteneur garde une copie locale 10 min
(vitrine) ou un jour (scans). Attendre, ou redéployer le conteneur, qui
repart avec un cache vide.

Le lien MathALÉA du menu de la vitrine mène sur `coopmaths.fr` au lieu de
rester sur le nom du site. Le navigateur a gardé une copie du script du menu
d'avant la réécriture : un rechargement forcé (Ctrl+Maj+R) suffit. Le conteneur
ne transmet pas au bucket les questions "a-t-il changé ?" des navigateurs pour
la vitrine, justement pour que cette vieille copie ne soit pas confirmée.

Le déploiement échoue. Le job dit à quelle étape : recopie de l'image (droits
sur le registry Scaleway, ou image absente parce que le commit n'est pas passé
par `main`), bascule du conteneur (droits sur les conteneurs), ou vérification
(`smoke.sh` dit quelle adresse ne répond pas comme attendu).
