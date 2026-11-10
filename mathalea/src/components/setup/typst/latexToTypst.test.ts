import { afterEach, describe, expect, it } from 'vitest'
import {
  applyDocumentFontsToFigure,
  escapeTypstText,
  htmlToTypst,
  latexMathToTypst,
  sanitizeSvg,
  setStaticImagePaths,
  svgToTypstImage,
} from './latexToTypst'
import { formuleEnTex } from '../../../lib/outils/tableurFormules'
import { deuxColonnesResp } from '../../../lib/format/miseEnPage'
import { sp } from '../../../lib/outils/outilString'

describe('latexMathToTypst', () => {
  it.each(['=$A$2+C6', '=B$5*$E1', '=A$1+$B2'])(
    'conserve les dollars littéraux de la formule de tableur %s',
    (formula) => {
      expect(latexMathToTypst(formuleEnTex(formula))).toBe(`#txt("${formula}")`)
      expect(htmlToTypst(`$${formuleEnTex(formula)}$`)).toBe(
        `$#txt("${formula}")$`,
      )
    },
  )

  it('convertit les fractions et opérations usuelles', () => {
    expect(latexMathToTypst('\\dfrac{3}{4}+2\\times x')).toBe(
      'frac(3, 4) + 2 times x',
    )
  })

  it('convertit les racines et symboles', () => {
    expect(latexMathToTypst('\\sqrt{25}')).toBe('sqrt(25)')
    expect(latexMathToTypst('x\\in\\mathbb{R}')).toBe('x in RR')
  })

  it('convertit \\phantom même avec un contenu imbriqué sur plusieurs niveaux', () => {
    expect(latexMathToTypst('\\phantom{x}=6')).toBe(
      latexMathToTypst('\\phantom{\\sqrt{\\dfrac{36}{4}}}=6'),
    )
    expect(
      latexMathToTypst('\\phantom{\\sqrt{\\dfrac{36}{4}}}=6'),
    ).not.toContain('phantom')
  })

  it('rend la virgule décimale française sans espace', () => {
    expect(latexMathToTypst('3,5')).toBe('3","5')
    expect(latexMathToTypst('3{,}5')).toBe('3","5')
    expect(latexMathToTypst('\\dfrac{3,5}{2}')).toBe('frac(3","5, 2)')
  })

  it('convertit \\limits et \\nolimits en fonctions Typst', () => {
    expect(latexMathToTypst('\\lim\\limits_{h \\to 0} 5+h')).toBe(
      'limits(lim)_(h -> 0) 5 + h',
    )
    expect(latexMathToTypst('\\sum\\nolimits_{i=1}^{n} i')).toBe(
      'scripts(sum)_(i = 1)^n i',
    )
  })

  it('convertit \\xrightarrow/\\xleftarrow en parenthésant les étiquettes', () => {
    // programmes de calcul (ex. 6N0B-4) : sans parenthèses, seul le premier
    // jeton irait en exposant et le reste de la formule serait absorbé à côté
    // (le `\ldots` initial est un espace-réponse élève, élargi ×3)
    expect(latexMathToTypst('\\ldots \\xrightarrow{\\div 2} 15')).toBe(
      '#box(width: 5em, repeat(gap: 2pt)[.]) limits(->)^(div 2) 15',
    )
    // l'étiquette peut être dans l'argument optionnel (rendue sous la flèche)
    expect(latexMathToTypst('14 \\xleftarrow[\\times 2]{} 7')).toBe(
      '14 limits(<-)_(times 2) 7',
    )
    // sans étiquette : flèche nue, pas d'exposant vide qui gobe la suite
    expect(latexMathToTypst('a \\xrightarrow{} b')).toBe('a -> b')
  })

  it('élargit ×3 un espace-réponse `\\ldots` isolé mais épargne les ellipses de suites', () => {
    // blanc à compléter seul : trop court pour écrire une réponse → boîte pointillée
    expect(latexMathToTypst('\\ldots')).toBe(
      '#box(width: 5em, repeat(gap: 2pt)[.])',
    )
    expect(latexMathToTypst('3 \\times \\ldots = 12')).toBe(
      '3 times #box(width: 5em, repeat(gap: 2pt)[.]) = 12',
    )
    // vraie ellipse de suite (bordée de virgules) : inchangée
    expect(latexMathToTypst('x_1, \\ldots, x_n')).not.toContain('... ...')
    expect(latexMathToTypst('x_1, \\ldots, x_n')).toContain('...')
    expect(latexMathToTypst('x_1 , \\ldots , x_n')).not.toContain('... ...')
  })

  it('élargit aussi les `....` produits par mathaleaFormatExercice à partir de `\\ldots`', () => {
    expect(latexMathToTypst('....<....<....')).toBe(
      '#box(width: 5em, repeat(gap: 2pt)[.]) < #box(width: 5em, repeat(gap: 2pt)[.]) < #box(width: 5em, repeat(gap: 2pt)[.])',
    )
    expect(latexMathToTypst('x_1, ...., x_n')).not.toContain('... ...')
  })

  it('parenthèse les étiquettes multi-jetons de \\overset/\\underset', () => {
    expect(latexMathToTypst('x \\overset{a+b}{=} y')).toBe(
      'x limits(=)^(a + b) y',
    )
    // le filet \overset{\rule{...}{...}}{A} reste converti en overline
    expect(latexMathToTypst('\\overset{\\rule{0.8em}{0.08em}}{A}')).toBe(
      'overline(A)',
    )
  })

  it('convertit \\num et \\numprint en gardant les espaces fines', () => {
    expect(latexMathToTypst('\\num{12\\,345,6}')).toBe('12 thin 345","6')
  })

  it('convertit les couleurs nommées inconnues de Typst en hexadécimal', () => {
    // DarkOrange (ex. 6G10 « nommer les angles ») n'existe pas en Typst :
    // sans conversion, la compilation échoue avec « unknown variable: DarkOrange »
    const result = latexMathToTypst('\\textcolor{DarkOrange}{\\hat{FNG}}')
    expect(result).toContain('rgb("#ff8c00")')
    expect(result).not.toContain('DarkOrange')
    // les couleurs natives Typst restent nommées
    expect(latexMathToTypst('\\textcolor{red}{x}')).toContain('red')
  })

  it('convertit la mise en évidence colorée de MathALÉA', () => {
    const result = latexMathToTypst('{\\color{#f15929}\\boldsymbol{x=2}}')
    expect(result).toContain('rgb("#f15929")')
    expect(result).toContain('bold(x = 2)')
  })

  it('ignore un groupe de mise en évidence vide sans corrompre le text(…) englobant (4L15-0)', () => {
    // miseEnEvidence('') — le signe/opérateur à colorer est absent — produit
    // `{\color{#F15929}\boldsymbol{}}`. tex2typst en faisait `bold()`, pris
    // ensuite pour une parenthèse orpheline : le rattrapage consommait la
    // parenthèse fermante du `text(fill: …)` et cassait toute la formule
    // (`text paren.l fill: …`).
    const result = latexMathToTypst(
      '-2u {\\color{#F15929}\\boldsymbol{}}\\,{\\color{#F15929}\\boldsymbol{-3}}',
    )
    expect(result).not.toContain('text paren.l')
    expect(result).not.toContain('bold()')
    expect(result).toContain(
      'text(fill: #rgb("#F15929"), stroke: #stroke(paint: rgb("#F15929"), thickness: 0.025em), bold(-3))',
    )
    expect((result.match(/\(/g) ?? []).length).toBe(
      (result.match(/\)/g) ?? []).length,
    )
  })

  it("convertit une union d'intervalles en notation française mise en évidence sans casser les crochets", () => {
    // notation française "à crochets inversés" ([-4;-2[∪]3;4]) mêlée à
    // \color{} : le "[union]" produit par tex2typst pour \cup coïncide
    // textuellement avec une paire de crochets imbriquée dans les crochets
    // d'intervalle — un bug antérieur y voyait une paire [...] mal formée,
    // laissant un crochet orphelin qui désynchronisait tout le parenthésage.
    const result = latexMathToTypst(
      '{\\color{#f15929}\\boldsymbol{[-4\\,;\\,-2[\\cup ]3\\,;\\,4]}}',
    )
    expect(result).not.toMatch(/[[\]]/)
    const opens = (result.match(/\(/g) ?? []).length
    const closes = (result.match(/\)/g) ?? []).length
    expect(opens).toBe(closes)
    expect(result).toContain('bracket.l')
    expect(result).toContain('bracket.r')
    expect(result).toContain('union')
    expect(result.match(/bracket\.l/g)?.length).toBe(2)
    expect(result.match(/bracket\.r/g)?.length).toBe(2)
  })

  it('conserve les bornes des deux intervalles quelle que soit leur orientation', () => {
    for (const expression of [
      '[1\\,;\\,2[\\cup]3\\,;\\,4]',
      ']1\\,;\\,2]\\cup[3\\,;\\,4[',
      ']1\\,;\\,2[\\cup]3\\,;\\,4]',
    ]) {
      const result = latexMathToTypst(expression)
      expect((result.match(/bracket\.[lr]/g) ?? []).length, expression).toBe(4)
      expect(result).toContain('union')
    }
  })

  it('ne casse pas une parenthèse isolée dans un groupe gras coloré (3L11-3b)', () => {
    // 3L11-3b colore en bleu gras le signe et les grandes parenthèses d'un
    // produit ajouté : miseEnEvidence('\\,+\\Big(') et miseEnEvidence('\\Big)').
    // tex2typst produit alors bold(+() (délimiteur ouvrant jamais fermé) et
    // bold()) (bold() sans corps → "missing argument: body" à la compilation).
    const open = latexMathToTypst('{\\color{#216d9a}\\boldsymbol{\\,+\\Big(}}')
    const close = latexMathToTypst('{\\color{#216d9a}\\boldsymbol{\\Big)}}')
    expect(open).toContain('paren.l')
    expect(open).not.toMatch(/bold\([^)]*\(\)/)
    expect(close).toContain('paren.r')
    expect(close).not.toContain('bold()')
    // parenthésage équilibré des deux côtés
    for (const r of [open, close]) {
      expect((r.match(/\(/g) ?? []).length).toBe((r.match(/\)/g) ?? []).length)
    }
  })

  it('sépare une parenthèse fermante orpheline du symbole qui la précède', () => {
    // Régression : la parenthèse orpheline devenait `betaparen.r` (un seul
    // identifiant pour Typst, donc « variable inconnue betaparen ») au lieu de
    // `beta paren.r` — 2I20-1, 2I21-1... selon la graine.
    // (les espaces en bordure de formule sont sans effet en Typst)
    expect(latexMathToTypst('\\beta)').trim()).toBe('beta paren.r')
    expect(latexMathToTypst('x)').trim()).toBe('x paren.r')
    // la parenthèse ouvrante orpheline était déjà correctement détachée
    expect(latexMathToTypst('(\\beta').trim()).toBe('paren.l beta')
  })

  it("conserve les crochets d'une notation de segment comme [YS]", () => {
    // Régression : la règle qui enlève les crochets autour de "union"/"inter"
    // (issus de \cup/\cap) matchait aussi tout contenu purement alphabétique,
    // donc [YS] (segment) perdait ses crochets à tort.
    const result = latexMathToTypst('[YS]')
    expect(result).toContain('bracket.l')
    expect(result).toContain('bracket.r')
  })

  it('conserve les crochets dont le contenu est uniquement en minuscules', () => {
    // Régression : pour nettoyer le `[union]` ambigu produit par tex2typst
    // entre deux intervalles, une ancienne règle supprimait toute paire de
    // crochets autour de minuscules, notamment [x], [abc] et K[x].
    for (const expression of ['[x]', '[abc]', 'K[x]', '[a][b]']) {
      const result = latexMathToTypst(expression)
      const expectedPairs = expression.split('[').length - 1
      expect(result.match(/bracket\.l/g)?.length, expression).toBe(
        expectedPairs,
      )
      expect(result.match(/bracket\.r/g)?.length, expression).toBe(
        expectedPairs,
      )
    }
  })

  it("conserve les crochets littéraux autour d'un opérateur d'ensemble", () => {
    const result = latexMathToTypst('[\\cup]')
    expect(result).toContain('lr(bracket.l union bracket.r)')
  })

  it('ne réinterprète pas les crochets du texte inclus', () => {
    expect(latexMathToTypst('\\text{[x]}')).toBe('#txt("[x]")')
    expect(latexMathToTypst('\\text{[12]}')).toBe('"[12]"')
    expect(latexMathToTypst('\\text{mot [AB] mot}')).toBe(
      '#txt("mot [AB] mot")',
    )
    expect(
      latexMathToTypst(
        '{\\color{#f15929}\\boldsymbol{\\text{la médiatrice du segment [AB]}}}',
      ),
    ).toContain('#txt("la médiatrice du segment [AB]")')
  })

  it('convertit les crochets isolés en gras ou mis en évidence', () => {
    expect(latexMathToTypst('\\boldsymbol{[}')).toBe('bold(bracket.l)')
    expect(latexMathToTypst('\\boldsymbol{]}')).toBe('bold(bracket.r)')

    const highlightedOpen = latexMathToTypst(
      '{\\color{#f15929}\\boldsymbol{[}}',
    )
    const highlightedClose = latexMathToTypst(
      '{\\color{#f15929}\\boldsymbol{]}}',
    )
    expect(highlightedOpen).toBe(
      'text(fill: #rgb("#f15929"), stroke: #stroke(paint: rgb("#f15929"), thickness: 0.025em), bold(bracket.l))',
    )
    expect(highlightedClose).toBe(
      'text(fill: #rgb("#f15929"), stroke: #stroke(paint: rgb("#f15929"), thickness: 0.025em), bold(bracket.r))',
    )
    for (const result of [highlightedOpen, highlightedClose]) {
      expect(result).not.toContain('text paren.l')
      expect((result.match(/\(/g) ?? []).length).toBe(
        (result.match(/\)/g) ?? []).length,
      )
    }
  })

  it('ignore les parenthèses qui appartiennent au texte inclus', () => {
    expect(latexMathToTypst('\\text{(x}')).toBe('#txt("(x")')
    expect(latexMathToTypst('\\text{x)}')).toBe('#txt("x)")')
    expect(latexMathToTypst('\\text{(x)}')).toBe('#txt("(x)")')
  })

  it('convertit le texte inclus dans les formules via #txt (police du texte)', () => {
    expect(latexMathToTypst('5\\,\\text{cm}')).toBe('5 thin#txt("cm")')
  })

  it('rend les espaces LaTeX du mode texte par de vrais espaces', () => {
    // tex2typst recopie le corps d'un \\text{} tel quel dans la chaîne Typst
    // qu'il produit : `\\ ` (espace insécable LaTeX) y devient une séquence
    // d'échappement invalide et la barre oblique se voit dans le PDF.
    // Séparateur employé par 6N0A-10/6N1J (« Ranger des nombres décimaux ») :
    expect(latexMathToTypst('12\\text{  ; \\ \\  }34')).not.toContain('\\\\')
    expect(latexMathToTypst('12\\text{  ; \\ \\  }34')).toBe('12 "  ;    " 34')
    // les autres commandes d'espacement du mode texte
    expect(latexMathToTypst('\\text{a\\,b}')).toBe('#txt("a b")')
    // (l'espace qui suit la commande dans la source s'ajoute au sien)
    expect(latexMathToTypst('\\text{a\\quad b}')).toBe('#txt("a  b")')
    expect(latexMathToTypst('\\text{a\\qquad b}')).toBe('#txt("a   b")')
    // la ponctuation échappée reste rendue sans barre oblique (déjà le cas)
    expect(latexMathToTypst('\\text{50 \\% et \\_}')).toBe('#txt("50 % et _")')
  })

  it('convertit \\textbackslash (séparateur diagonal des tableaux à double entrée) en symbole « \\ »', () => {
    // en-têtes du type `\text{Tirage1\textbackslash Tirage2}` (2S30-4, 3S20-1,
    // 3S20-3, CM2P1A…) : tex2typst laissait fuir l'identifiant nu
    // `textbackslash` ou échouait sur `\textbackslash{}`.
    expect(latexMathToTypst('\\text{Tirage1\\textbackslash Tirage2}')).toBe(
      '#txt("Tirage1")backslash#txt("Tirage2")',
    )
    expect(latexMathToTypst('\\text{Amis\\textbackslash{}Fruits}')).toBe(
      '#txt("Amis")backslash#txt("Fruits")',
    )
    // `latexTableCell` retire le `\text{}` externe et repasse l'en-tête en
    // mode math : le texte adjacent doit rester groupé (pas égrené).
    expect(latexMathToTypst('Dé rouge\\textbackslash Dé bleu')).toBe(
      '#txt("Dé rouge")backslash#txt("Dé bleu")',
    )
  })

  it('conserve les espaces insécables HTML dans les formules', () => {
    // 5G3B-2 : sp() émet &nbsp; même lors de la génération Typst.
    for (const space of ['&nbsp;', '&#160;', '&#xA0;', '\u00a0']) {
      expect(latexMathToTypst(`AB=4${space}\\text{cm}`)).toBe(
        'A B = 4 space.nobreak#txt("cm")',
      )
      expect(htmlToTypst(`$AB=4${space}\\text{cm}$`)).toBe(
        '$A B = 4 space.nobreak#txt("cm")$',
      )
      expect(latexMathToTypst(`1${space}200`)).toBe('1 space.nobreak 200')
      expect(latexMathToTypst(`\\text{Donc${space}: }x=2`)).toBe(
        '#txt("Donc\u00a0: ")x = 2',
      )
    }
  })

  it('ne double pas les espaces autour du texte inclus', () => {
    // Typst rend les espaces sources qui bordent une chaîne en mode maths :
    // celles que tex2typst ajoute comme séparateurs de jetons s'ajouteraient
    // à l'espace du \text{…} (ou à l'espace insécable de `~`) et afficheraient
    // une double espace (ex. 4G22-3).
    expect(latexMathToTypst('5\\text{ cm}')).toBe('5#txt(" cm")')
    expect(latexMathToTypst('5~\\text{cm}')).toBe('5 space.nobreak#txt("cm")')
    expect(latexMathToTypst('\\text{aire} = 5\\text{ cm}^2')).toBe(
      '#txt("aire")= 5#txt(" cm")^2',
    )
    // espace insécable entre deux nombres : pas de chaîne en jeu, l'espace
    // source n'est pas rendue et l'insécable reste seule
    expect(latexMathToTypst('1~200')).toBe('1 space.nobreak 200')
  })

  it('gère les unités avec exposant et $ imbriqués dans \\text{}', () => {
    // unités MathALÉA écrites `m$^2$` / `$\\text{cm}^2$` : le $ intérieur
    // rebascule en mode math dans \text{} — ne doit pas casser la conversion
    expect(latexMathToTypst('387\\text{ m$^2$/h}')).toBe(
      '387#txt(" m")^2#txt("/h")',
    )
    expect(latexMathToTypst('\\text{ dam$^2$}')).toBe('#txt(" dam")^2')
    expect(latexMathToTypst('648\\text{ $\\text{cm}^2$/h}')).toBe(
      '648" "#txt("cm")^2#txt("/h")',
    )
  })

  it('ne coupe pas un bloc $…$ sur un $ imbriqué dans une accolade', () => {
    // le $ de `m$^2$` est dans les accolades de \text{} : il fait partie du
    // bloc et ne le referme pas prématurément
    expect(
      htmlToTypst('$387\\text{ m$^2$/h} = \\dfrac{387\\text{ m$^2$}}{1}$'),
    ).toBe('$387#txt(" m")^2#txt("/h")= frac(387#txt(" m")^2, 1)$')
  })

  it('supprime le saut de ligne final qui échapperait le $ fermant', () => {
    expect(latexMathToTypst('2x=4\\\\')).toBe('2 x = 4')
    expect(
      latexMathToTypst('\\begin{aligned}2x&=4\\\\x&=2\\\\\\end{aligned}'),
    ).toBe('2 x &= 4 \\ x &= 2')
  })

  it("sépare les équations d'un système par des virgules (cases + aligned)", () => {
    // 2G34-5 : Typst ignore `\\` dans les branches d'un `cases`, les équations
    // s'affichaient collées sur une seule ligne.
    expect(
      latexMathToTypst(
        '\\begin{cases}\\begin{aligned}3x+2y &=5\\\\ x-y &=1\\end{aligned}\\end{cases}',
      ),
    ).toBe('cases(3 x + 2 y &= 5, x - y &= 1)')
  })

  it('sépare le saut de ligne et le #txt qui le suit (évite l’échappement `\\#`)', () => {
    // 4G20 (Pythagore) : `\\text{Donc :}` en tout début de ligne d'un
    // `aligned` collait le `\` de saut de ligne au `#txt(` généré pour le
    // texte, formant `\#txt(...)`. En Typst, `\#` est l'échappement du
    // caractère `#` : le saut de ligne disparaissait et un `#` littéral
    // s'affichait dans le PDF juste avant « Donc ».
    const result = latexMathToTypst(
      '\\begin{aligned}NO^2&=16\\\\\\text{Donc :}\\\\NO&=4\\end{aligned}',
    )
    expect(result).not.toContain('\\#')
    expect(result).toContain('\\ #txt("Donc :")')
  })

  it("tolère les tabulations d'indentation dans un environnement aligned", () => {
    // 1AN31-7 : l'indentation du template literal laissait passer des \t dans
    // la formule, tex2typst levait et la correction affichait `\begin{aligned}`
    // verbatim.
    const result = latexMathToTypst(
      '\\begin{aligned}\n\t\\phantom{\\iff}&-4x+8>0\\\\\n\t\\iff&x<2\n\t\\end{aligned}',
    )
    expect(result.startsWith('"')).toBe(false)
    expect(result).not.toContain('\\begin{aligned}')
    expect(result).toContain('&')
  })

  it('normalise displaystyle dans un environnement aligned', () => {
    const result = latexMathToTypst(
      String.raw`\begin{aligned}\displaystyle\int_0^1 x\,\mathrm{d}x &= \displaystyle\int_0^1 x\,\mathrm{d}x\\ &= 1\end{aligned}`,
    )
    expect(result.startsWith('"')).toBe(false)
    expect(result).not.toContain('\\begin{aligned}')
    expect(result).toContain('integral_0^1')
    expect(result).toContain('&=')
  })

  it('décode les entités HTML présentes dans la formule', () => {
    expect(latexMathToTypst('\\text{Donc&nbsp;: }x=2')).toBe(
      '#txt("Donc\u00a0: ")x = 2',
    )
  })

  it('convertit \\textbf en mode mathématique', () => {
    expect(latexMathToTypst('\\textbf{cm}')).toBe('upright(bold(c m))')
  })

  it("sépare un #txt suivi d'une parenthèse pour éviter l'enchaînement d'appel Typst", () => {
    // \text{…}(…) : sans séparation, Typst lit `#txt("…")(x + y)` comme un
    // appel de la valeur retournée et échoue sur « expected comma » (3L12-3).
    expect(latexMathToTypst('\\text{le groupement }(x+y)')).toBe(
      '#txt("le groupement ") (x + y)',
    )
  })

  it('renvoie la formule en chaîne littérale quand la conversion échoue', () => {
    // environnement non pris en charge par tex2typst
    expect(latexMathToTypst('\\begin{tabular}{cc}a&b\\end{tabular}')).toBe(
      '"\\\\begin{tabular}{cc}a&b\\\\end{tabular}"',
    )
  })
})

describe('latexMathToTypst — accents nus en mode maths', () => {
  // Un mot accentué oublié hors de \text{} (erreur d'auteur d'exercice, ex.
  // ordinaux « ième », « ère ») est décomposé lettre par lettre par
  // tex2typst (`n^{ième}` → `n^(i è m e)`) : chaque lettre accentuée devient
  // alors un caractère isolé en mode maths, que certaines polices maths
  // (ex. Noto Sans Math, dépourvue des lettres latines accentuées dans sa
  // table cmap) ne peuvent pas afficher (« shaping ... yielded more than
  // one glyph »). `preprocessTex` protège ces mots en les enveloppant dans
  // \text{}, rendus ensuite via #txt (police du texte, jamais celle des
  // maths — sûr même quand la police maths ne couvre pas les accents).
  it('protège un mot accentué en exposant oublié hors de \\text{}', () => {
    expect(latexMathToTypst('n^{ième}')).toBe('n^(#txt("ième"))')
  })

  it('protège un mot accentué en indice oublié hors de \\text{}', () => {
    expect(latexMathToTypst('a_{à}')).toBe('a_(#txt("à"))')
  })

  it('protège un mot entièrement accentué (aucune lettre ASCII)', () => {
    // "à" seul : aucune lettre a-z, cas particulier qui échappait à
    // l'ancien marquage (qui exigeait une lettre ASCII avant #txt)
    expect(latexMathToTypst('à')).toBe('#txt("à")')
  })

  it("protège un caractère accentué isolé au milieu d'une formule", () => {
    expect(latexMathToTypst('x = é')).toBe('x =#txt("é")')
  })

  it('laisse les mots déjà protégés par \\text{} inchangés', () => {
    expect(latexMathToTypst('3 \\text{ à } 5')).toBe('3#txt(" à ")5')
  })
})

describe('latexMathToTypst — espace large `\\;`', () => {
  it('rend `\\;` par une espace large et non par un point-virgule', () => {
    expect(latexMathToTypst('\\;\\widehat{ABC}')).toBe('thick hat(A B C)')
    expect(latexMathToTypst('a\\;b')).toBe('a thick b')
  })

  it('conserve le point-virgule ordinaire', () => {
    expect(latexMathToTypst('a;b')).toBe('a ";" b')
  })
})

describe('escapeTypstText', () => {
  it('échappe les caractères spéciaux du balisage Typst', () => {
    expect(escapeTypstText('50 % de #tag *gras* [a]')).toBe(
      '50 % de \\#tag \\*gras\\* \\[a\\]',
    )
    expect(escapeTypstText('2 $ et _souligné_')).toBe('2 \\$ et \\_souligné\\_')
  })
})

describe('latexMathToTypst — commandes de taille', () => {
  it('supprime \\large même collé à un chiffre', () => {
    // miseEnEvidence(`\\large${n}`) produit `\large5` sans espace
    expect(latexMathToTypst('\\large5')).toBe('5')
    expect(
      latexMathToTypst('{\\color{#216D9A}\\boldsymbol{\\large5}}'),
    ).not.toContain('large')
    expect(latexMathToTypst('\\Large 12 + \\small3')).toBe('12 + 3')
  })
})

describe('htmlToTypst — deux colonnes responsives (deuxColonnesResp)', () => {
  it('convertit les deux colonnes en #grid (et retire le style CSS)', () => {
    const html = deuxColonnesResp('Colonne gauche', 'Colonne droite', {
      eleId: '1_1',
      largeur1: 50,
      widthmincol1: '400px',
      widthmincol2: '200px',
    })
    const typst = htmlToTypst(html)
    expect(typst).toContain('#grid(')
    expect(typst).toContain('columns: (50fr, 50fr)')
    expect(typst).toContain('[Colonne gauche]')
    expect(typst).toContain('[Colonne droite]')
    // le <style> de la grille CSS n'apparaît pas comme texte
    expect(typst).not.toContain('grid-template-columns')
  })

  it('reprend le partage `largeur1` de la sortie LaTeX', () => {
    const typst = htmlToTypst(
      deuxColonnesResp('Énoncé', 'Figure', {
        largeur1: 70,
        widthmincol1: '0px',
        widthmincol2: '0px',
      }),
    )
    expect(typst).toContain('columns: (70fr, 30fr)')
  })

  it('convertit le contenu des colonnes (formules comprises)', () => {
    const typst = htmlToTypst(
      deuxColonnesResp('$\\dfrac{3}{4}$', 'texte', {
        largeur1: 50,
        widthmincol1: '0px',
        widthmincol2: '0px',
      }),
    )
    expect(typst).toContain('frac(3, 4)')
  })

  it('n’ouvre pas de grille quand une seule colonne a du contenu', () => {
    const typst = htmlToTypst(
      deuxColonnesResp('Seule colonne', '', {
        largeur1: 50,
        widthmincol1: '0px',
        widthmincol2: '0px',
      }),
    )
    expect(typst).not.toContain('#grid(')
    expect(typst).toContain('Seule colonne')
  })
})

describe('htmlToTypst — schémas en barres (SchemaEnBoite)', () => {
  const schemaHtml =
    '<div class="SchemaContainer">' +
    '<div class="SchemaTop" style="grid-row: 1; grid-column-start: 1; grid-column-end: 10; text-align:center; border: none"; --brace-color: black">' +
    '<div class="latexAccoladeTop" style="text-align: center; color: black; font-size: 1em; font-weight: normal; line-height: 1.2em">42</div>' +
    '<div class="braceTop"><div class="braceTopLeft"></div></div>' +
    '</div>' +
    '<div class="SchemaItem" style="grid-row: 2; grid-column-start: 1; grid-column-end: 4; background-color:lightgray; justify-content:center; color:black; font-size:1em; font-weight:normal; border: solid 1px black;">9</div>' +
    '<div class="SchemaItem" style="grid-row: 2; grid-column-start: 4; grid-column-end: 7; background-color:lightgray; justify-content:center; color:black; border-left: none;">12</div>' +
    '<div class="SchemaItem" style="grid-row: 2; grid-column-start: 7; grid-column-end: 10; background-color:lightgray; justify-content:center; color:black; border-left: none;">....</div>' +
    '<div class="SchemaTop" style="grid-row: 3; grid-column-start: 1; grid-column-end: 7; text-align:center; border: none; --arrow-color: #f15929">' +
    '<div class="latexAccoladeTop" style="text-align: center; color: #f15929; font-size: 1em; font-weight: bold; line-height: 1.2em">29</div>' +
    '</div>' +
    '</div>'

  it('convertit le schéma en grille Typst avec accolades et flèches', () => {
    const typst = htmlToTypst(schemaHtml)
    expect(typst).toContain('#grid(')
    expect(typst).toContain('columns: (1fr,) * 9,')
    // accolade supérieure sur toute la largeur
    expect(typst).toContain(
      'grid.cell(x: 0, y: 0, colspan: 9, mathalea-schema-span([42]))',
    )
    // boîtes grises : fond, bordure (côtés partagés omis), texte centré
    expect(typst).toContain(
      'grid.cell(x: 0, y: 1, colspan: 3, fill: rgb("#d3d3d3"), stroke: 0.6pt + black, inset: 4pt, align: center + horizon)[9]',
    )
    expect(typst).toContain(
      'stroke: (left: none, rest: 0.6pt + black), inset: 4pt, align: center + horizon)[12]',
    )
    // flèche colorée
    expect(typst).toContain(
      'mathalea-schema-span([29], kind: "arrow", color: rgb("#f15929"))',
    )
  })

  it('redessine les empilements de cubes canvas-3d en SVG isométrique', () => {
    const content = encodeURIComponent(
      JSON.stringify({
        objects: [
          { type: 'cube', pos: [0, 0, 0], size: 1, color: '#ffffff' },
          { type: 'cube', pos: [1, 0, 0], size: 1, color: '#ffffff' },
          { type: 'ambientLight', color: 0xffffff, intensity: 1.2 },
        ],
      }),
    )
    const figures: string[] = []
    const typst = htmlToTypst(
      `<canvas-3d id="m1" content='${content}' width="250" height="250"></canvas-3d>`,
      figures,
    )
    expect(typst).toContain('#mathalea-fit(fig-1)')
    expect(figures).toHaveLength(1)
    // 2 cubes × 3 faces visibles
    expect(figures[0].match(/<polygon /g)).toHaveLength(6)
    expect(typst).not.toContain('canvas-3d')
  })

  it('remplace les figures 3D sans cubes par un encart', () => {
    const typst = htmlToTypst(
      '<canvas-3d id="m1" content=\'%7B%7D\' width="250"></canvas-3d>',
    )
    expect(typst).toContain('figure 3D non convertie')
    expect(typst).not.toContain('canvas-3d')
  })
})

describe('htmlToTypst', () => {
  it("conserve une espace insécable littérale dans le texte (guillemets « »)", () => {
    for (const nbsp of ['\u00a0', '\u202f', '&nbsp;']) {
      const typst = htmlToTypst(`Un «${nbsp}mot${nbsp}» ici.`)
      expect(typst).toMatch(/«[\u00a0\u202f]mot[\u00a0\u202f]»/)
    }
  })

  it("retire les boutons et les déclencheurs d'animation (inutiles à l'impression)", () => {
    const typst = htmlToTypst(
      'Correction.<br><button id="b1" class="x">Relancer l\'animation</button><mathalea-dom-ready action="a" payload="{}"></mathalea-dom-ready>',
    )
    expect(typst).toContain('Correction.')
    expect(typst).not.toMatch(/Relancer|mathalea-dom-ready|button/)
  })

  describe('parenthèse collée à la fin d’un bloc `#fonction[…]`', () => {
    // sans séparation, Typst lit « (suite) » comme les arguments d'un nouvel
    // appel : « expected comma » / « expected function »
    it('sépare un texte mis en forme de la parenthèse qui le suit', () => {
      expect(htmlToTypst('<b>gras</b>(suite)')).toBe(
        '#strong[gras]\u200B(suite)',
      )
      expect(htmlToTypst('1<sup>re</sup>(x)')).toBe('1#super[re]\u200B(x)')
    })

    it('sépare un tableau protégé de la parenthèse qui le suit', () => {
      const typst = htmlToTypst(
        '<table><tr><td>a</td></tr></table>(chaque effectif est divisé par $450$.)',
      )
      expect(typst).toContain('\n]\u200B(chaque effectif')
    })

    it('ne touche pas un crochet littéral ni une formule', () => {
      expect(htmlToTypst('[a](b)')).toBe('\\[a\\](b)')
      expect(htmlToTypst('$[a](b)$')).not.toContain('\u200B')
    })
  })

  it('convertit du texte avec formules', () => {
    expect(htmlToTypst('Calculer $\\dfrac{1}{2}+\\dfrac{1}{3}$.')).toBe(
      'Calculer $frac(1, 2) + frac(1, 3)$.',
    )
  })

  it('ferme un `$…$` contenant `\\left\\{` (accolade affichée, sans `\\}` correspondant)', () => {
    const typst = htmlToTypst(
      '$\\left(d_1\\right)\\left\\{\\begin{array}{l}x=r\\\\y=s\\end{array}\\right.\\qquad$ $\\left(d_2\\right)$ sont :',
    )
    expect(typst).not.toContain('\\left')
    expect(typst).not.toContain('\\$')
    expect(typst).toContain('$(d_2)$')
  })

  it('ne fusionne pas des formules `$…$` juxtaposées sans espace en un faux bloc affiché `$$…$$`', () => {
    // ex. 4C32 avant sa réécriture (d0dd21a08) : `texteAMC + `$${sp()}=$`` puis
    // `+ `$${sp()}\dots$`` produisait `$500$$ = $$\dots$`. Les deux `$$`
    // accidentels (jonction de `$500$`+`$ = $`, puis `$ = $`+`$\dots$`) ne
    // doivent pas être pris pour les délimiteurs d'un unique bloc affiché de
    // contenu ` = ` : chaque formule doit rester convertie séparément.
    expect(htmlToTypst('$500$$ = $$\\dots$')).toBe('$500$$=$$...$')
  })

  it('reconnaît toujours un vrai bloc affiché `$$…$$` isolé', () => {
    expect(htmlToTypst('Formule : $$x^2+y^2=z^2$$')).toBe(
      'Formule : $ x^2 + y^2 = z^2 $',
    )
  })

  it('convertit \\medskip en texte brut (exercices CAN écrits en LaTeX texte)', () => {
    expect(htmlToTypst('Viens-tu à vélo ?\\medskip')).toBe(
      'Viens-tu à vélo ?#v(0.5em)',
    )
    // can6a-2026 : le \\ de saut de ligne LaTeX précédant \medskip ne doit
    // pas fuir en texte littéral (backslashes échappés affichés tels quels)
    expect(htmlToTypst('Viens-tu à vélo ? \\\\\\medskip Suite')).toBe(
      'Viens-tu à vélo ? #v(0.5em)\nSuite',
    )
  })

  it('convertit les pointillés LaTeX hors mode maths des réponses CAN', () => {
    expect(htmlToTypst('\\dots{} min')).toBe(
      '#box(width: 5em, repeat(gap: 2pt)[.]) min',
    )
    expect(htmlToTypst('\\ldots min')).toBe(
      '#box(width: 5em, repeat(gap: 2pt)[.]) min',
    )
  })

  it('convertit les cases à cocher \\faSquare / \\faCheckSquare (réponses CAN)', () => {
    const carreVide =
      '#box(baseline: 0.15em, width: 0.85em, height: 0.85em, radius: 1pt, stroke: 0.6pt)'
    const carrePlein =
      '#box(baseline: 0.15em, width: 0.85em, height: 0.85em, radius: 1pt, fill: luma(60))'
    // can6a-2025 Q10 : cases à cocher devant des unités, écrites en LaTeX texte
    expect(
      htmlToTypst('\\faSquare[regular] Vrai<br>\\faSquare[regular] Faux'),
    ).toBe(`${carreVide} Vrai\\ ${carreVide} Faux`)
    // can6a-2025 Q25 : \raggedright de tête retiré, pas de fuite littérale
    const q25 = htmlToTypst('\\raggedright \\faSquare[regular] $120$')
    expect(q25).toBe(`${carreVide} $120$`)
    expect(q25).not.toContain('faSquare')
    expect(q25).not.toContain('raggedright')
    // variante cochée : carré plein ; l'argument optionnel est facultatif
    expect(htmlToTypst('\\faCheckSquare Vrai')).toBe(`${carrePlein} Vrai`)
  })

  it('convertit les macros ProfCollege \\Lg, \\Capa et \\Prix (énoncés CAN)', () => {
    // canc3a-2023 Q18 : en mode mathématique, `\Lg` deviendrait la variable
    // Typst inconnue `Lg` (erreur de compilation)
    const enonce = htmlToTypst(
      'Si une pile de $12$ pièces a une hauteur de $\\Lg[mm]{24}$,',
    )
    expect(enonce).toContain('24')
    expect(enonce).toContain('mm')
    expect(enonce).not.toContain('Lg')
    // et en mode texte, derrière les pointillés à compléter : seule l'unité
    // (l'espace-réponse `\ldots` isolé est élargi ×3)
    expect(
      htmlToTypst(
        'alors une pile de $18$ pièces a une hauteur de $\\ldots$ \\Lg[mm]{}.',
      ),
    ).toBe(
      'alors une pile de $18$ pièces a une hauteur de $#box(width: 5em, repeat(gap: 2pt)[.])$ mm.',
    )
    // `\Prix` : l'argument optionnel est le nombre de décimales, l'unité est €
    expect(htmlToTypst('$\\ldots$ \\Prix[0]{}.')).toBe(
      '$#box(width: 5em, repeat(gap: 2pt)[.])$ €.',
    )
    expect(htmlToTypst('$\\ldots\\Capa{}$')).toBe(
      '$#box(width: 5em, repeat(gap: 2pt)[.])#txt("L")$',
    )
    expect(htmlToTypst('$\\ldots\\Capa[cL]{}$')).toBe(
      '$#box(width: 5em, repeat(gap: 2pt)[.])#txt("cL")$',
    )
    expect(htmlToTypst('coûte $\\Prix[0]{12}$')).toContain('12')
    expect(htmlToTypst('coûte $\\Prix[0]{12}$')).not.toContain('Prix')
    expect(htmlToTypst('coûte \\Prix{12.5}')).toBe('coûte 12,50~€')
  })

  it('convertit les boîtes LaTeX en mode texte (énoncés CAN)', () => {
    // can2a-2026 Q12 : un algorithme encadré, écrit en LaTeX texte
    const code = htmlToTypst(
      '\\hspace*{10mm}\\fbox{\\parbox{0.5\\linewidth}{\\setlength{\\parskip}{.5cm}' +
        ' \\texttt{def mystere(a) :}\\newline \\hspace*{7mm}\\texttt{return 2*b}}}',
    )
    // la largeur de \parbox n'est pas reprise : la boîte prend celle de son
    // contenu, sans quoi les lignes de l'algorithme se couperaient dans une
    // cellule étroite du tableau « Course aux nombres »
    expect(code).toBe(
      '#h(10mm)#box(stroke: 0.6pt + luma(60), inset: (x: 6pt, y: 5pt))' +
        '[#box[#raw("def mystere(a) :")\\ #h(7mm)#raw("return 2*b")]]',
    )
    // un réglage de longueur n'a pas d'équivalent : il disparaît
    expect(code).not.toContain('parskip')
  })

  it('garde l’italique des mathématiques dans une réponse mise en évidence', () => {
    // miseEnEvidence() produit {\color{…}\boldsymbol{…}} : \boldsymbol est du
    // gras *italique*, contrairement à \mathbf
    expect(htmlToTypst('$={\\color{#F15929}\\boldsymbol{x(3x+1)}}$')).toBe(
      '$= text(fill: #rgb("#F15929"), stroke: #stroke(paint: rgb("#F15929"), thickness: 0.025em), bold(x(3 x + 1)))$',
    )
  })

  it('convertit les array LaTeX bordés en tableaux natifs', () => {
    const result = htmlToTypst(
      '$\\def\\arraystretch{1.5}\\begin{array}{|l|c|c|}\\hline x & 1 & 2 \\\\ \\hline f(x) & 3 & 4 \\\\ \\hline\\end{array}$',
    )
    expect(result).toContain('#table(')
    expect(result).toContain(
      'align: (left + horizon, center + horizon, center + horizon,)',
    )
    expect(result).toContain('inset: (x: 5pt, y: 4.5pt)')
    expect(result).toContain('stroke: 0.5pt')
    expect(result).toContain('[$x$]')
    expect(result).not.toContain('arraystretch')
  })

  it('reporte arraystretch (renewcommand) et la couleur de fond des cellules', () => {
    const result = htmlToTypst(
      '$\\renewcommand{\\arraystretch}{1.2}\\begin{array}{|c|c|c|}\\hline \\cellcolor{lightgray} x & 1 & 2 \\\\ \\hline f(x) & 3 & 4 \\\\ \\hline\\end{array}\\renewcommand{\\arraystretch}{1}$',
    )
    expect(result).toContain('#table(')
    expect(result).toContain('inset: (x: 5pt, y: 3.6pt)')
    expect(result).toContain('stroke: 0.5pt')
    expect(result).toContain('table.cell(fill: rgb("#d3d3d3"))[$x$]')
    expect(result).not.toContain('arraystretch')
    expect(result).not.toContain('cellcolor')
  })

  it('réserve des cases à remplir et centre verticalement les intitulés de 6N1E', () => {
    const result = htmlToTypst(
      '$\\renewcommand{\\arraystretch}{2.5}\\begin{array}{|c|c|c|}\\hline ' +
        '\\cellcolor{lightgray} \\text{Fraction décimale} & \\phantom{rrrrr} & \\dfrac{30}{100} \\\\ \\hline ' +
        '\\cellcolor{lightgray} \\text{Pourcentage} & \\phantom{rrrrr}\\% & 30\\% \\\\ \\hline' +
        '\\end{array}\\renewcommand{\\arraystretch}{1}$',
    )
    expect(result).toContain('align: center + horizon')
    expect(result).toContain('#box(width: 45pt, height: 14pt)[]')
    expect(result).toContain('#box(width: 45pt, height: 14pt)[]$%$')
    expect(result).toContain('Fraction décimale')
  })

  it("ne coupe pas une cellule sur le `&` d'une entité HTML (`10&nbsp;\\%`, BP2AutoB3)", () => {
    const result = htmlToTypst(
      '$\\begin{array}{|c|c|c|}\\hline \\text{Remise} & 10&nbsp;\\% & 20&nbsp;\\% \\\\ \\hline\\end{array}$',
    )
    expect(result).toContain('columns: 3')
    expect(result).toContain('[$10 space.nobreak %$]')
    expect(result).toContain('[$20 space.nobreak %$]')
    expect(result).not.toContain('nbsp')
  })

  it('déséchappe le pourcentage dans une cellule texte de tableur (PET14)', () => {
    const result = htmlToTypst(
      '$\\begin{tabular}{c}\\text{Remise (\\%)}\\\\\\end{tabular}$',
    )
    expect(result).toContain('[Remise (%)]')
    expect(result).not.toContain('\\\\%')
  })

  it('neutralise \\hspace* (évite le `#h(*)` invalide en Typst)', () => {
    const result = latexMathToTypst('\\hspace*{0.4cm}')
    expect(result).not.toContain('*')
  })

  it('convertit \\text{\\textbf{X}} en en-tête de tableau au lieu de le laisser fuir (5D1B-2)', () => {
    const result = htmlToTypst(
      '$\\begin{array}{|c|c|}\\hline \\text{\\textbf{Sports}} & \\text{\\textbf{TOTAL}} \\\\ \\hline 12 & 100 \\\\ \\hline\\end{array}$',
    )
    expect(result).toContain('#strong[Sports]')
    expect(result).toContain('#strong[TOTAL]')
    expect(result).not.toContain('textbf')
  })

  it("retire \\large d'une cellule de tableau \\text{\\large \\textbf{X}} au lieu de le laisser fuir (P020)", () => {
    const result = htmlToTypst(
      '$\\begin{array}{|c|c|}\\hline \\text{\\large \\textbf{Sports}} & \\text{\\large \\textbf{TOTAL}} \\\\ \\hline 12 & 100 \\\\ \\hline\\end{array}$',
    )
    expect(result).toContain('#strong[Sports]')
    expect(result).toContain('#strong[TOTAL]')
    expect(result).not.toContain('large')
    expect(result).not.toContain('textbf')
  })

  it('ne fragmente pas un array imbriqué dans une cellule', () => {
    const result = htmlToTypst(
      '$\\begin{array}{|c|c|}\\hline a & \\begin{array}{c|c} x & y\\end{array} \\\\ \\hline b & c \\\\ \\hline\\end{array}$',
    )
    expect(result).toContain('#table(')
    expect(result).toContain('columns: 2')
    // le `\begin{array}` imbriqué ne doit pas être recraché en littéral éclaté
    expect(result).not.toContain('\\\\begin{array}')
  })

  it('convertit les tableaux LaTeX délimités par \\[...\\]', () => {
    const result = htmlToTypst(
      '\\[\\def\\arraystretch{1.5}\\begin{array}{|l|c|}\\hline x & 1 \\\\ \\hline f(x) & 2 \\\\ \\hline\\end{array}\\]',
    )
    expect(result).toContain('#table(')
    expect(result).not.toContain('\\[')
    expect(result).not.toContain('\\]')
  })

  it('laisse les array mathématiques non bordés à tex2typst', () => {
    const result = htmlToTypst(
      '$\\begin{array}{lcl}u&=&1\\\\v&=&2\\end{array}$',
    )
    expect(result).toContain('$mat(')
    expect(result).not.toContain('#context tblr(')
  })

  it('convertit les balises de mise en forme', () => {
    expect(htmlToTypst('Un mot <b>important</b> et <em>discret</em>')).toBe(
      'Un mot #strong[important] et #emph[discret]',
    )
  })

  it('convertit les sauts de ligne', () => {
    expect(htmlToTypst('ligne 1<br>ligne 2')).toBe('ligne 1\\ ligne 2')
  })

  it('convertit les listes', () => {
    expect(htmlToTypst('<ul><li>un</li><li>deux</li></ul>')).toBe(
      '- un\n- deux',
    )
    expect(htmlToTypst('<ol><li>un</li><li>deux</li></ol>')).toBe(
      '+ un\n+ deux',
    )
    expect(htmlToTypst("<ol class='alpha'><li>un</li><li>deux</li></ol>")).toBe(
      '#tasks(columns: 1, label: "a)")[\n+ un\n+ deux]',
    )
  })

  it('met en gras les repères alpha quand les numéros des questions sont en gras', () => {
    expect(
      htmlToTypst(
        "<ol class='alpha alpha-parenthesis'><li>un</li><li>deux</li></ol>",
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      ),
    ).toBe('#tasks(columns: 1, label: "a)", label-weight: "bold")[\n+ un\n+ deux]')
  })

  it('numérote chaque sous-question en continu à travers un saut de ligne', () => {
    // reproduit 1AL24-3 : un <br> au milieu d'une sous-question ne doit ni
    // faire perdre le motif "a)" ni redémarrer le compteur pour les
    // sous-questions suivantes (voir le commentaire du cas 'br' pour le
    // mécanisme Typst en cause)
    const result = htmlToTypst(
      "<ol class='alpha'><li>un</li><li>deux<br>suite</li><li>trois</li></ol>",
    )
    expect(result).toBe('#tasks(columns: 1, label: "a)")[\n+ un\n+ deux\\ suite\n+ trois]')
  })

  it('garde dans la sous-question le texte de ses blocs <div> et <p>', () => {
    // reproduit TSA3-32 : le lampeMessage en tête d'un item faisait sortir son
    // texte de l'item, et `#tasks` le perdait
    expect(
      htmlToTypst(
        "<ol class='alpha'><li><div><div>Rappel :</div>cours</div>suite</li><li><p>un</p><p>deux</p></li></ol>",
      ),
    ).toBe(
      '#tasks(columns: 1, label: "a)")[\n+ Rappel :\\ cours\\ suite\n+ un\\ deux\\ ]',
    )
  })

  it('garde la numérotation après une figure suivie de texte dans une sous-question', () => {
    // la ligne vide qui suit la figure interromprait l'item en cours : la
    // sous-question suivante repartirait à « a) »
    const figures: string[] = []
    const result = htmlToTypst(
      '<ol class=\'alpha\'><li>un<br><div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg></div></div><br>suite</li><li>deux</li></ol>',
      figures,
    )
    expect(result).toBe(
      '#tasks(columns: 1, label: "a)")[\n+ un\\ #mathalea-figure-block(1, fig-1-align, fig-1-zoom,\nfig-1\n)\\ suite\n+ deux]',
    )
  })

  it('conserve l’espace avant une formule mise en évidence', () => {
    expect(htmlToTypst('Ainsi, ${\\color{#f15929}\\boldsymbol{x=2}}$')).toBe(
      'Ainsi, $text(fill: #rgb("#f15929"), stroke: #stroke(paint: rgb("#f15929"), thickness: 0.025em), bold(x = 2))$',
    )
  })

  it('décode les entités HTML', () => {
    expect(htmlToTypst('5&nbsp;: un score &lt; 10')).toBe('5 : un score \\< 10')
  })

  it('échappe le texte qui ressemble à du balisage Typst', () => {
    expect(htmlToTypst('code #include *fort*')).toBe(
      'code \\#include \\*fort\\*',
    )
  })

  it('convertit un rendu KaTeX en utilisant uniquement son annotation TeX', () => {
    const result = htmlToTypst(
      'Angle : <span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">78^\\circ</annotation></semantics></math></span><span class="katex-html">78∘{\\color{black} \\scriptsize{78^\\circ}}78∘</span></span>',
    )
    expect(result).toBe('Angle : $78^circle.small$')
    expect(result).not.toContain('78∘')
    expect(result).not.toContain('\\scriptsize')
  })

  it('remplace les figures SVG par un encart sans collecteur', () => {
    const result = htmlToTypst('Voir la figure : <svg><rect/></svg>')
    expect(result).toContain('figure non convertie')
    expect(result).not.toContain('<svg')
  })

  it('collecte les figures SVG et les référence par #fig-N', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      'Figure 1 : <svg width="96" height="48"><rect/></svg> et figure 2 : <svg><circle/></svg>',
      figures,
    )
    // #mathalea-figure-block adapte la figure à la largeur et lui donne les
    // contrôles de zoom/alignement de la palette de l'aperçu ; ligne vide
    // après chaque figure : le texte suivant reprend dans un nouveau paragraphe
    expect(result).toBe(
      'Figure 1 : #mathalea-figure-block(1, fig-1-align, fig-1-zoom, fig-1)\n\n' +
        ' et figure 2 : #mathalea-figure-block(2, fig-2-align, fig-2-zoom, fig-2)',
    )
    expect(figures).toHaveLength(2)
    expect(figures[0]).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"96\\" height=\\"48\\"><rect/></svg>"), format: "svg", width: 72.0pt)',
    )
    expect(figures[1]).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\"><circle/></svg>"), format: "svg")',
    )
  })

  it('garde les labels mathalea2d en Typst au-dessus du SVG de figure', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg><div class="divLatex" style="position: absolute; top: 10px; left: 20px; transform: translate(-50%,-50%) rotate(0deg);" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">{\\color{black} \\scriptsize{78^\\circ}}</annotation></semantics></math></span><span class="katex-html">78∘</span></span></div></div></div>',
      figures,
    )
    expect(result).toContain(
      '#mathalea-figure-block(1, fig-1-align, fig-1-zoom,',
    )
    expect(result).toContain('mathalea-figure(72.0pt, 36.0pt, fig-1, labels: (')
    expect(result).toContain(
      'mathalea-label(15.0pt, 7.5pt, [$78^circle.small$], size: 0.7em)',
    )
    expect(result).not.toContain('#place(')
    expect(result).not.toContain('78∘')
    expect(figures).toHaveLength(1)
    expect(figures[0]).toContain('image(bytes("<svg')
  })

  it('rend en pointillés le blanc `$\\ldots$` non rendu par KaTeX posé sur une figure (MetaInteractif2d)', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg><div class="divLatex" style="position: absolute; top: 10px; left: 20px; transform: translate(-50%,-50%); opacity: 1;" data-top=10 data-left=20>$\\ldots ^\\circ$</div></div></div>',
      figures,
    )
    expect(result).toContain(
      'mathalea-label(15.0pt, 7.5pt, [$#box(width: 2.5em, repeat(gap: 2pt)[.])^circle.small$])',
    )
  })

  it('passe la largeur naturelle à mathalea-figure-block pour une figure à labels, sans la mesurer', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg><div class="divLatex" style="position: absolute; top: 10px; left: 20px; transform: translate(-50%,-50%) rotate(0deg);" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">{\\color{black} \\scriptsize{78^\\circ}}</annotation></semantics></math></span><span class="katex-html">78∘</span></span></div></div></div>',
      figures,
    )
    expect(result).toContain('mathalea-figure(72.0pt, 36.0pt, fig-1, labels: (')
    expect(result).toContain('))\n, natural-width: 72.0pt)')
  })

  it('passe force-true-size: true à mathalea-figure-block pour une figure `vraieGrandeur` (construction/mesure), sans plafonner sa taille', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" data-width-cm="20" data-height-cm="10" data-vraie-grandeur="1" width="600" height="300"><line x1="0" y1="0" x2="10" y2="10"/></svg></div></div>',
      figures,
    )
    expect(result).toContain(
      '#mathalea-figure-block(1, fig-1-align, fig-1-zoom,\nfig-1\n, force-true-size: true)',
    )
    expect(figures[0]).toContain('width: 566.9pt')
  })

  it("n'ajoute pas force-true-size à mathalea-figure-block pour une figure illustrative ordinaire", () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" data-width-cm="20" data-height-cm="10" width="600" height="300"><line x1="0" y1="0" x2="10" y2="10"/></svg></div></div>',
      figures,
    )
    expect(result).toContain(
      '#mathalea-figure-block(1, fig-1-align, fig-1-zoom,\nfig-1\n)',
    )
    expect(result).not.toContain('force-true-size')
    expect(figures[0]).toContain('width: 380.0pt')
  })

  it('reprend le fond blanc des labels mathalea2d (arbres pondérés) en Typst', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg><div class="divLatex" style="background-color: white; position: absolute; top: 10px; left: 20px; transform: translate(-50%,-50%) rotate(0deg); opacity: 0.7;" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">{\\color{black} \\scriptsize{0.7}}</annotation></semantics></math></span><span class="katex-html">0.7</span></span></div></div></div>',
      figures,
    )
    expect(result).toContain(
      'mathalea-label(15.0pt, 7.5pt, [$0.7$], size: 0.7em, background: white)',
    )
  })

  it('reprend la marge (padding) du fond des labels mathalea2d en Typst', () => {
    const figures: string[] = []
    const result = htmlToTypst(
      '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg><div class="divLatex" style="background-color: white; padding: 3px; position: absolute; top: 10px; left: 20px; transform: translate(-50%,-50%) rotate(0deg); opacity: 1;" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">{\\color{black} \\scriptsize{0.7}}</annotation></semantics></math></span><span class="katex-html">0.7</span></span></div></div></div>',
      figures,
    )
    expect(result).toContain(
      'mathalea-label(15.0pt, 7.5pt, [$0.7$], size: 0.7em, background: white, outset: 2.3pt)',
    )
  })

  it('convertit les spans colorés (texteEnCouleur, texteEnCouleurEtGras)', () => {
    expect(
      htmlToTypst(
        'Un losange est <span style="color:#f15929;">un quadrilatère</span>.',
      ),
    ).toBe('Un losange est #text(fill: rgb("#f15929"))[un quadrilatère].')
    expect(
      htmlToTypst(
        '<span style="color:#f15929;font-weight: bold;">réponse B</span>',
      ),
    ).toBe('#text(fill: rgb("#f15929"))[#strong[réponse B]]')
    // span sans style : contenu conservé tel quel
    expect(htmlToTypst('<span class="katex-html">x</span>')).toBe('x')
    // couleur noire par défaut : pas de mise en couleur
    expect(htmlToTypst('<span style="color:black;">x</span>')).toBe('x')
  })

  it('remplace les images par un encart', () => {
    expect(htmlToTypst('<img src="a.png">')).toContain('image non convertie')
  })

  describe('images d’exercices statiques (registre `setStaticImagePaths`)', () => {
    afterEach(() => setStaticImagePaths(new Map()))

    it('affiche une image enregistrée à la place de l’encart', () => {
      setStaticImagePaths(new Map([['a.png', '/static-img-0.png']]))
      const figures: string[] = []
      const result = htmlToTypst('<img src="a.png" alt="énoncé" />', figures)
      expect(result).not.toContain('image non convertie')
      expect(figures).toHaveLength(1)
      expect(figures[0]).toContain('"/static-img-0.png"')
      expect(result).toContain('#mathalea-fit(fig-1)')
    })

    it("affiche l'encart si l'image n'est pas dans le registre", () => {
      setStaticImagePaths(new Map([['a.png', '/static-img-0.png']]))
      const figures: string[] = []
      expect(htmlToTypst('<img src="b.png">', figures)).toContain(
        'image non convertie',
      )
    })

    it('affiche l’encart si aucun collecteur de figures n’est fourni', () => {
      setStaticImagePaths(new Map([['a.png', '/static-img-0.png']]))
      expect(htmlToTypst('<img src="a.png">')).toContain('image non convertie')
    })
  })

  it('convertit les propositions de QCM (format case) en colonnes taskize', () => {
    const result = htmlToTypst(
      '<div class="my-3">' +
        '<div class="ex1 inline-block my-2 align-center"><input type="checkbox" disabled><label id="labelEx1Q0R0" class="ml-2">$1$&emsp;</label></div>' +
        '<div class="ex1 inline-block my-2 align-center"><input type="checkbox" disabled><label id="labelEx1Q0R1" class="ml-2">$2$&emsp;</label></div>' +
        '</div><div class="m-2" id="resultatCheckEx1Q0"></div>',
    )
    expect(result).toContain('#tasks(columns: qcm-colonnes, label: none')
    expect(result).toContain('+ #qcm-case(false) $1$')
    expect(result).toContain('+ #qcm-case(false) $2$')
    expect(result).not.toContain('#qcm-bonne')
  })

  it('convertit le QCM statique d’un multi-mathfield (propositions en span)', () => {
    // régression : `staticQcm` pose chaque proposition dans un
    // `<span class="ex0">` (et non un `<div>`) ; elles n'étaient pas reconnues
    // et leurs libellés sortaient collés (« BufflesServalsGirafes »)
    const proposition = (index: number, texte: string) =>
      '<span class="ex0" style="display:inline-flex;align-items:center;gap:0.5rem">' +
      '<input type="radio" disabled style="appearance:none">' +
      `<label id="labelEx0Q0R${index}">${texte}</label></span>`
    const result = htmlToTypst(
      'Quelle est l’espèce la plus nombreuse ?<br> ' +
        '<span class="mx-2" style="display:inline-flex;align-items:center;gap:1.5rem">' +
        proposition(0, 'Buffles') +
        proposition(1, 'Servals') +
        '</span>',
    )
    expect(result).toContain('#tasks(columns: qcm-colonnes, label: none')
    expect(result).toContain('+ #qcm-case(false) Buffles')
    expect(result).toContain('+ #qcm-case(false) Servals')
    expect(result).not.toContain('BufflesServals')
  })

  it('retire les sauts de ligne entre l’énoncé et les propositions de QCM', () => {
    // `buildQcmForExercise` sépare l'énoncé des propositions par `<br><br>` :
    // convertis, ils laissaient deux lignes vides au-dessus du bloc `#tasks`
    const result = htmlToTypst(
      'Le nouveau prix est :<br><br>\n<div class="my-3">' +
        '<div class="inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R0" class="ml-2">$1$</label></div>' +
        '<div class="inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R1" class="ml-2">$2$</label></div>' +
        '</div>',
    )
    expect(result).toMatch(/^Le nouveau prix est :\s*#tasks\(/)
    expect(result).toContain('equilibre: true')
  })

  it('coche la bonne réponse (format case) d’un QCU (bouton radio) dans le corrigé', () => {
    // régression : `qcmChoiceIsCorrect` ne détectait que les
    // `input[type="checkbox"]`, jamais les boutons radio des QCU
    // (`propositionsQcm(..., { radio: true })`) — la bonne réponse n'était
    // donc jamais mise en évidence dans le corrigé Typst d'un QCU.
    const result = htmlToTypst(
      '<div class="my-3">' +
        '<div class="inline-block"><input type="radio" checked><label id="labelEx1Q0R0" class="ml-2">$1$&emsp;</label></div>' +
        '<div class="inline-block"><input type="radio"><label id="labelEx1Q0R1" class="ml-2">$2$&emsp;</label></div>' +
        '</div>',
    )
    expect(result).toContain('+ #qcm-case(true) #qcm-bonne[$1$]')
    expect(result).toContain('+ #qcm-case(false) $2$')
  })

  it('détecte le format lettre et met en évidence la bonne réponse du corrigé', () => {
    const result = htmlToTypst(
      '<div class="my-3">' +
        '<div class="inline-block"><label class="ml-2"><span style="color:#f15929;font-weight: bold;">A</span>.</label><label id="labelEx1Q0R0" class="ml-2">$8$</label></div>' +
        '<div class="inline-block"><label class="ml-2"><b><span class="oblique-strike">B</span></b>.</label><label id="labelEx1Q0R1" class="ml-2">$4$</label></div>' +
        '</div>',
    )
    expect(result).toContain('#tasks(columns: qcm-colonnes, label: none')
    expect(result).toContain('+ #qcm-lettre("A", true) #qcm-bonne[$8$]')
    expect(result).toContain('+ #qcm-lettre("B", false) $4$')
  })

  it('conserve le QCM quand une figure mathalea2d suit dans le même contenu', () => {
    // régression : les étapes suivantes (figures, tableaux, katex) re-parsent
    // le HTML via template.innerHTML — le jeton de protection du QCM doit
    // survivre à ce round-trip (les caractères U+0000 étaient supprimés)
    const figures: string[] = []
    const result = htmlToTypst(
      'Question ?<br>' +
        '<div class="svgContainer" style="display: inline;"><div style="position: relative; display: inline-block">' +
        '<svg class="mathalea2d" width="96" height="48"><line x1="0" y1="0" x2="10" y2="10"/></svg>' +
        '</div></div><br><br>' +
        '<div class="my-3">' +
        '<div class="ex0 inline-block my-2 align-center"><label class="ml-2"><b>A</b>.</label><label id="labelEx0Q0R0" class="ml-2">$1$&emsp;</label></div>' +
        '<div class="ex0 inline-block my-2 align-center"><label class="ml-2"><b>B</b>.</label><label id="labelEx0Q0R1" class="ml-2">$2$&emsp;</label></div>' +
        '</div><div class="m-2" id="resultatCheckEx0Q0"></div>',
      figures,
    )
    expect(result).toContain('#tasks(columns: qcm-colonnes, label: none')
    expect(result).toContain('+ #qcm-lettre("A", false) $1$')
    expect(result).toContain('+ #qcm-lettre("B", false) $2$')
    expect(result).toContain(
      '#mathalea-figure-block(1, fig-1-align, fig-1-zoom,',
    )
    expect(result).not.toMatch(/(^|[^-\w])0($|[^.\w])/m)
    expect(figures).toHaveLength(1)
  })

  it('convertit un tableau HTML MathALÉA en tableau natif', () => {
    const result = htmlToTypst(
      '<table class="tableauMathlive">' +
        '<tr><th style="background-color: lightgray; color: black"><span>$x$</span></th><td><span>$1$</span></td></tr>' +
        '<tr><th><span>$f(x)$</span></th><td><span>$2$</span></td></tr>' +
        '</table>',
    )
    expect(result).toContain('#table(')
    expect(result).toContain('columns: 2')
    expect(result).toContain('stroke: 0.5pt')
    expect(result).toContain('table.cell(fill: rgb("#d3d3d3"))[$x$]')
    expect(result).toContain('[$1$]')
    expect(result).toContain('[$f(x)$]')
  })

  it('reporte la hauteur de ligne commune (data-hauteur-ligne) dans le tableau natif', () => {
    const result = htmlToTypst(
      '<table class="tableauMathlive" data-hauteur-ligne="3.6">' +
        '<tr><th><span>$x$</span></th><td><span>$1$</span></td></tr>' +
        '</table>',
    )
    expect(result).toContain('rows: (3.6em,)')
  })

  describe('protection des `&` bruts (tableau LaTeX) contre le round-trip DOM', () => {
    // régression : protectQcm/protectSchemaContainers/protectHtmlTables font
    // `template.innerHTML = html` puis renvoient `template.innerHTML` dès
    // qu'ils trouvent une correspondance — cette sérialisation ré-échappe
    // tout `&` littéral présent ailleurs dans le texte (ex. séparateur de
    // colonnes d'un tableau LaTeX brut `$\begin{array}...&...&...\end{array}$`
    // pas encore extrait) en `&amp;`. `latexSegmentToTypst` décode ce `&amp;`
    // avant conversion (voir son premier `.replace`), ce qui neutralise le
    // problème quelle que soit la fonction qui l'a provoqué.
    const rawTable =
      '$\\begin{array}{|c|c|}\\hline a & b \\\\ \\hline c & d \\\\ \\hline\\end{array}$'

    it('un QCM suivi d’un tableau LaTeX brut ne corrompt pas les `&` du tableau', () => {
      const result = htmlToTypst(
        '<div class="my-3">' +
          '<div class="ex1 inline-block my-2 align-center"><input type="checkbox" disabled><label id="labelEx1Q0R0" class="ml-2">$1$&emsp;</label></div>' +
          '</div><div class="m-2" id="resultatCheckEx1Q0"></div>' +
          rawTable,
      )
      expect(result).toContain('#tasks(columns: qcm-colonnes, label: none')
      expect(result).toContain('#table(')
      expect(result).not.toContain('&amp;')
      expect(result).not.toContain('amp;')
      expect(result).toContain('[$a$]')
      expect(result).toContain('[$b$]')
    })

    it('un SchemaContainer suivi d’un tableau LaTeX brut ne corrompt pas les `&` du tableau', () => {
      const result = htmlToTypst(
        '<div class="SchemaContainer">' +
          '<div class="SchemaItem" style="grid-row: 1; grid-column-start: 1; grid-column-end: 2;">9</div>' +
          '</div>' +
          rawTable,
      )
      expect(result).toContain('#grid(')
      expect(result).toContain('#table(')
      expect(result).not.toContain('&amp;')
      expect(result).not.toContain('amp;')
      expect(result).toContain('[$a$]')
      expect(result).toContain('[$b$]')
    })

    it('un tableau HTML suivi d’un tableau LaTeX brut ne corrompt pas les `&` du second', () => {
      const result = htmlToTypst(
        '<table class="tableauMathlive"><tr><th><span>$x$</span></th><td><span>$1$</span></td></tr></table>' +
          rawTable,
      )
      // les deux tableaux (HTML converti, puis LaTeX brut) doivent apparaître
      expect(result.match(/#table\(/g)).toHaveLength(2)
      expect(result).not.toContain('&amp;')
      expect(result).not.toContain('amp;')
      expect(result).toContain('[$a$]')
      expect(result).toContain('[$b$]')
    })

    it('un tabularx dont les `>` de la spécification sont ré-échappés garde ses traits verticaux', () => {
      const result = htmlToTypst(
        '<br>$\\begin{tabularx}{0.9\\linewidth}{|&gt;{\\cellcolor{lightgray}}c|&gt;{\\centering \\arraybackslash}X|}\\hline a &amp; b \\\\ \\hline\\end{tabularx}$',
      )
      expect(result).toContain('stroke: 0.5pt')
      expect(result).toContain('align: center + horizon')
      expect(result).not.toContain('gt;')
    })

    it('un span KaTeX suivi d’un tableau LaTeX brut ne corrompt pas les `&` du tableau', () => {
      const result = htmlToTypst(
        '<span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">78^\\circ</annotation></semantics></math></span><span class="katex-html">78∘</span></span>' +
          rawTable,
      )
      expect(result).toContain('$78^circle.small$')
      expect(result).toContain('#table(')
      expect(result).not.toContain('&amp;')
      expect(result).not.toContain('amp;')
      expect(result).toContain('[$a$]')
      expect(result).toContain('[$b$]')
    })
  })

  it('ignore les balises inconnues en gardant leur contenu', () => {
    expect(htmlToTypst('<span class="katex">du texte</span>')).toBe('du texte')
  })

  it('protège les lignes commençant par un caractère de bloc Typst', () => {
    expect(htmlToTypst('4 + 4<p>- 2</p>')).toBe('4 + 4\n\n\\- 2')
  })

  it("ne coupe pas la ligne pour un <br>, même suivi d'un caractère de bloc Typst", () => {
    // un <br> ne doit pas produire de ligne de continuation non indentée
    // (voir le commentaire du cas 'br') : ici, sans le saut de ligne réel,
    // le "-" n'est plus en tête de ligne et n'a pas besoin d'échappement
    expect(htmlToTypst('4 + 4<br>- 2')).toBe('4 + 4\\ - 2')
  })

  it('referme les blocs de mise en forme non refermés', () => {
    expect(htmlToTypst('<b>gras')).toBe('#strong[gras]')
  })

  it('convertit un `miseEnEvidence` autour de \\mathbb{R} dans un bloc `$…$` correctement refermé', () => {
    // 1AL24-3 (uuid 57692) : un `$` ouvert avant `{\color{#HEX}\boldsymbol{…}}`
    // (sortie HTML de `miseEnEvidence`) sans son `$` fermant correspondant
    // (déséquilibre introduit par du texte qui l'entoure, pas par la
    // conversion elle-même) n'est jamais reconnu comme un bloc math par
    // `replaceBalancedInlineMath` : il fuit tel quel, `$` et accolades
    // compris, dans le texte affiché. Une fois le `$` fermant restitué, la
    // formule (texte coloré et en gras) se convertit normalement.
    const html =
      "Donc l'ensemble de définition de $h$ est " +
      '${\\color{#F15929}\\boldsymbol{\\mathbb{R}}}$.'
    const result = htmlToTypst(html)
    expect(result).not.toContain('\\color')
    expect(result).not.toContain('boldsymbol')
    expect(result).toBe(
      'Donc l\'ensemble de définition de $h$ est $text(fill: #rgb("#F15929"), stroke: #stroke(paint: rgb("#F15929"), thickness: 0.025em), bold(RR))$.',
    )
  })
})

describe('applyDocumentFontsToFigure', () => {
  const fonts = { font: 'Libertinus Serif', mathFont: 'Libertinus Math' }
  const svgText = (attrs: string, content: string) =>
    `image(bytes("<svg><text ${attrs} x=\\"1\\">${content}</text></svg>"), format: "svg")`

  it('passe les noms de points en lettres italiques mathématiques dans la police maths', () => {
    const figure = svgText(
      'font-family=\\"Book Antiqua\\" font-style=\\"italic\\"',
      'J',
    )
    const result = applyDocumentFontsToFigure(figure, fonts)
    expect(result).toContain('font-family=\\"Libertinus Math\\"')
    expect(result).toContain('>\u{1D43D}</text>')
    expect(result).not.toContain('Book Antiqua')
    expect(result).not.toContain('font-style')
  })

  it('laisse inchangés les textes qui ne sont pas en police maths', () => {
    const figure = svgText('font-family=\\"Arial\\"', 'J')
    expect(applyDocumentFontsToFigure(figure, fonts)).toBe(figure)
  })

  it('met dans la police du texte les textes sans police propre', () => {
    const figure = svgText('style=\\"font-size:14px\\"', 'cm')
    const result = applyDocumentFontsToFigure(figure, fonts)
    expect(result).toContain('font-family=\\"Libertinus Serif\\"')
    expect(result).toContain('>cm</text>')
  })

  it("ne touche pas un texte dont la police vient du style ou d'une classe", () => {
    const inStyle = svgText('style=\\"font-family:serif\\"', 'x')
    const inClass = svgText('class=\\"trigo\\"', 'x')
    expect(applyDocumentFontsToFigure(inStyle, fonts)).toBe(inStyle)
    expect(applyDocumentFontsToFigure(inClass, fonts)).toBe(inClass)
  })

  it('convertit le h en ℎ (U+210E)', () => {
    const figure = svgText('font-family=\\"Book Antiqua\\"', 'h')
    expect(applyDocumentFontsToFigure(figure, fonts)).toContain('>\u210E<')
  })
})

describe('sanitizeSvg', () => {
  it('supprime le point-virgule parasite des textes mathalea2d', () => {
    // forme brute générée par lib/2d/textes.ts
    expect(
      sanitizeSvg(
        '<text font-family= "Book Antiqua"; font-style= "italic" >F</text>',
      ),
    ).toBe('<text font-family="Book Antiqua" font-style= "italic">F</text>')
    // forme sérialisée par le DOM
    expect(
      sanitizeSvg(
        '<text font-family="Book Antiqua" ;="" font-style="italic">F</text>',
      ),
    ).toBe('<text font-family="Book Antiqua" font-style="italic">F</text>')
  })

  it('supprime les attributs SVG dupliqués produits par certains objets 2d', () => {
    expect(
      sanitizeSvg('<path stroke-opacity="0.5" stroke-opacity="0.5" d="M0 0"/>'),
    ).toBe('<path stroke-opacity="0.5" d="M0 0"/>')
  })

  it('remplace dominant-baseline="central" par un dy indépendant de la police', () => {
    // forme brute générée par lib/2d/textes.ts, puis forme sérialisée par le DOM
    expect(
      sanitizeSvg(
        '<text x="0" y="-10" text-anchor = "middle" dominant-baseline = "central">G</text>',
      ),
    ).toBe('<text x="0" y="-10" text-anchor = "middle" dy="0.325em">G</text>')
    expect(
      sanitizeSvg('<text x="0" y="-10" dominant-baseline="central">G</text>'),
    ).toBe('<text x="0" y="-10" dy="0.325em">G</text>')
    // un dy déjà posé et les autres alignements restent tels quels
    expect(
      sanitizeSvg('<text dy="2" dominant-baseline="central">G</text>'),
    ).toBe('<text dy="2" dominant-baseline="central">G</text>')
    expect(sanitizeSvg('<text dominant-baseline="hanging">G</text>')).toBe(
      '<text dominant-baseline="hanging">G</text>',
    )
  })

  it('retire les animations SMIL et les compteurs de tours des engrenages', () => {
    const svg =
      '<svg><g><path d="M0 0"/><animateTransform attributeName="transform" type="rotate" dur="5" repeatCount="indefinite"\n/></g>' +
      '<circle cx="1" cy="1" r="2"/><text class="compteurDeTours" id="c1" x="1" y="1">0</text></svg>'
    const result = sanitizeSvg(svg)
    expect(result).not.toMatch(/animate/i)
    expect(result).not.toContain('compteurDeTours')
    expect(result).toContain('<path d="M0 0"/>')
    expect(result).toContain('<circle')
  })

  it('rend les entités compatibles XML', () => {
    expect(sanitizeSvg('<text>a&nbsp;b &amp; c & d</text>')).toBe(
      '<text>a&#160;b &amp; c &amp; d</text>',
    )
  })
})

describe('svgToTypstImage', () => {
  it('reprend la largeur de la figure en points (96 px = 72 pt)', () => {
    expect(svgToTypstImage('<svg width="170.4" height="105.8"></svg>')).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"170.4\\" height=\\"105.8\\"></svg>"), format: "svg", width: 127.8pt)',
    )
  })

  it('omet la largeur quand la figure ne la précise pas', () => {
    expect(svgToTypstImage('<svg viewBox="0 0 10 10"></svg>')).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 10 10\\"></svg>"), format: "svg")',
    )
  })

  it("reprend la taille physique réelle (data-width-cm/data-height-cm) d'une figure mathalea2d, plutôt que la conversion 96 px = 72 pt, pour un rendu en vraie grandeur", () => {
    expect(
      svgToTypstImage(
        '<svg width="300" height="120" data-width-cm="10" data-height-cm="4"></svg>',
      ),
    ).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"300\\" height=\\"120\\" data-width-cm=\\"10\\" data-height-cm=\\"4\\"></svg>"), format: "svg", width: 283.5pt)',
    )
  })

  it('réduit malgré tout une figure mathalea2d en vraie grandeur si elle dépasse la largeur maximale, en conservant ses proportions', () => {
    expect(
      svgToTypstImage(
        '<svg width="600" height="300" data-width-cm="20" data-height-cm="10"></svg>',
      ),
    ).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"600\\" height=\\"300\\" data-width-cm=\\"20\\" data-height-cm=\\"10\\"></svg>"), format: "svg", width: 380.0pt)',
    )
  })

  it('ne plafonne pas une figure `vraieGrandeur` (data-vraie-grandeur) même au-delà de la largeur maximale habituelle', () => {
    expect(
      svgToTypstImage(
        '<svg width="600" height="300" data-width-cm="20" data-height-cm="10" data-vraie-grandeur="1"></svg>',
      ),
    ).toBe(
      'image(bytes("<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"600\\" height=\\"300\\" data-width-cm=\\"20\\" data-height-cm=\\"10\\" data-vraie-grandeur=\\"1\\"></svg>"), format: "svg", width: 566.9pt)',
    )
  })
})
