# Plein écran dans Moodle

Dans Moodle, MathALÉA est toujours chargé dans une iframe (`recorder=moodle`) dont la hauteur suit celle de l'exercice : l'énoncé est à l'étroit, en particulier sur téléphone. Un bouton plein écran est donc affiché dans la vue élève (`Eleve.svelte`, à côté des boutons de zoom) et dans la vue CAN (`Can.svelte`, à côté du bouton de mode sombre), uniquement quand `recorder=moodle`.

## Deux mécanismes

`src/lib/fullscreen.ts` tente d'abord l'API Fullscreen native, puis se replie sur la page hôte.

| Contexte | Mécanisme | Pourquoi |
| --- | --- | --- |
| Gift | API Fullscreen native | [`moodle.js`](../../../../public/assets/externalJs/moodle.js) crée l'iframe avec `allow="fullscreen"` |
| Scorm | Repli sur la page hôte | Moodle pose l'iframe du SCO sans `allowfullscreen`, ce qui coupe la délégation à l'iframe MathALÉA imbriquée dedans : `document.fullscreenEnabled` y est faux |

Le repli consiste à poster au parent `{ action: 'mathalea:fullscreen', value, iframe }`, `value` valant `true` à l'entrée et `false` à la sortie, et `iframe` reprenant le paramètre d'URL qui identifie l'iframe dans la page (comme pour `mathalea:resize`).

Côté hôte :

- [`moodle.js`](../../../../public/assets/externalJs/moodle.js) agrandit l'élément `<mathalea-moodle>` concerné aux dimensions de la fenêtre (`position:fixed`) et force la hauteur de l'iframe à `100%`, prioritaire sur l'attribut `height` que continuent de poser les messages `mathalea:resize` ;
- [`moodle.scorm.js`](../../../../public/assets/externalJs/moodle.scorm.js) agrandit de la même façon `window.frameElement`, c'est-à-dire l'iframe du SCO dans la page du cours. Le SCO est servi depuis le domaine de Moodle, il y a donc accès. Son style d'origine est mémorisé puis restauré, car Moodle y écrit la hauteur du lecteur SCORM.

Le bouton reste utilisable si le repli n'aboutit pas (page hôte inconnue) : l'affichage est simplement inchangé.

## Sortie du plein écran

Le store `isFullscreen` est synchronisé avec l'évènement `fullscreenchange` pour le plein écran natif, que l'utilisateur peut quitter sans passer par le bouton. Pour le repli, le navigateur n'envoie pas cet évènement : `handleFullscreenEscape()`, branché sur `keydown` dans les deux vues, gère la touche <kbd>Échap</kbd>.

## Diffusion

Les scripts hôtes sont servis depuis `https://coopmaths.fr/alea/assets/externalJs/` : les paquets Scorm déjà déposés dans un cours et les questions Gift déjà importées bénéficient d'une évolution de ces fichiers sans être régénérés.
