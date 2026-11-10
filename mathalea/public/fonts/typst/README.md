# Polices Typst (vue Typst)

Polices libres chargées par le compilateur Typst (aperçu navigateur et export
PDF) et par la compilation CLI des tests (`--font-path`). Le compilateur WASM
n'embarque que Libertinus Serif et New Computer Modern ; ces fichiers ajoutent
des polices de texte et de mathématiques supplémentaires.

Toutes sont sous licence libre (100 % redistribuables), texte de licence
fourni à côté de chaque police (`OFL-*.txt`/`UFL-*.txt`). Verdana et Tahoma
(polices propriétaires Microsoft) ne peuvent pas être ajoutées : elles ne
sont pas redistribuables et le compilateur WASM ne peut pas s'appuyer sur des
polices « système ».

**Toutes les polices ici sont des instances statiques (une seule graisse).**
Le compilateur WASM ne supporte pas les polices variables (`fvar`) : les
utiliser produit l'avertissement *« variable fonts are not currently
supported »* et peut casser le shaping de certains caractères (ex : lettres
accentuées composites comme « é », qui donnaient l'erreur *« shaping the text
"é" yielded more than one glyph »*). `NotoSans.ttf`, `NotoSerif.ttf`,
`Lora.ttf` et `SourceSans3.ttf` sont distribuées par Google Fonts uniquement
sous forme variable ; elles sont donc instanciées en statique (`wght=400`,
`wdth=100` le cas échéant) avec `fonttools varLib.instancer
--update-name-table` avant d'être ajoutées ici. En cas d'ajout d'une nouvelle
police, vérifier l'absence de table `fvar` (`fontTools.ttLib.TTFont` puis
`'fvar' in tt`) avant de l'embarquer.

| Fichier | Famille | Type | Licence | Source |
| --- | --- | --- | --- | --- |
| `NotoSans.ttf` | Noto Sans | texte sans | OFL | Google Fonts (ofl/notosans) |
| `NotoSerif.ttf` | Noto Serif | texte serif | OFL | Google Fonts (ofl/notoserif) |
| `Lora.ttf` | Lora | texte serif | OFL | Google Fonts (ofl/lora) |
| `SourceSans3.ttf` | Source Sans 3 | texte sans | OFL | Google Fonts (ofl/sourcesans3) |
| `Luciole.ttf` | Luciole | texte sans (dyslexie/malvoyance) | OFL | github.com/EstebanMunoz/luciole-font |
| `Ubuntu.ttf` | Ubuntu | texte sans | UFL (Ubuntu Font License) | Google Fonts (ufl/ubuntu) |
| `OpenDyslexic.otf` | OpenDyslexic | texte sans (dyslexie) | OFL | github.com/antijingoist/opendyslexic |
| `NotoSansMath.ttf` | Noto Sans Math | maths sans | OFL | Google Fonts (ofl/notosansmath) |
| `STIXTwoMath.ttf` | STIX Two Math | maths serif | OFL | Google Fonts (ofl/stixtwomath) |
| `LibertinusMath.otf` | Libertinus Math | maths serif | OFL | github.com/alerque/libertinus (release v7.051, static/OTF) |

Les familles proposées dans les réglages sont listées dans
`src/components/setup/typst/buildTypstDocument.ts` (`TEXT_FONTS`, `MATH_FONTS`)
et préchargées dans `src/components/setup/typst/typstCompiler.ts`.

`TEXT_FONTS` et `MATH_FONTS` sont deux listes distinctes : une police de texte
(Libertinus Serif, Ubuntu, Luciole…) n'a en général pas de table OpenType
`MATH` et ne peut donc pas composer des formules. Les familles de `MATH_FONTS`
sont les seules à posséder cette table. `Libertinus Math` est le pendant
mathématique de `Libertinus Serif` (fichier distinct, même projet).

**Noto Sans Math n'a pas de lettres latines accentuées** dans sa table
`cmap` (é, à, ê, î, ô, ù, É, À… absents, vérifié sur les 5 sous-tables de
`cmap`). Un caractère isolé en mode maths doit se dessiner en un seul glyphe ;
Noto Sans Math décompose « é » en base + accent (2 glyphes), ce que Typst
refuse (« shaping ... yielded more than one glyph »). Une police de repli
(`font: (maths, texte)`) ne règle pas le problème : la résolution se fait par
composant Unicode déjà trouvé dans la première police, pas par caractère
composé entier.

Plutôt que d'exclure la police, `latexToTypst.ts` (`preprocessTex`) protège
systématiquement tout mot comportant une lettre accentuée qui se retrouverait
nu en mode maths (ex. `n^{ième}` ou `à` oubliés hors de `\text{}` — tex2typst
décompose sinon un tel mot lettre par lettre, `n^{ième}` → `n^(i è m e)`) en
l'enveloppant dans `\text{}`. Le contenu obtenu est ensuite rendu via `#txt()`
(police de texte explicite, voir plus haut), jamais laissé en chaîne Typst nue
sous la police maths ambiante : même sans erreur de compilation, un repli
automatique de glyphe peut mal composer un accent en position d'exposant ou
d'indice (accent flottant au lieu du caractère composé). Voir le commentaire
« Mot comportant une lettre latine accentuée » dans `preprocessTex`.
