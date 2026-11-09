import type { FormulaireComplexe } from '../formulaireComplexe'
import { texPuissanceEnRacine } from './integralesComposees'
import { Polynome } from './Polynome'
import { choice } from '../outils/arrayOutils'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'

export const formulaireSansComposition: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'polynome', label: 'Polynômes de degré 1 à 4' },
        { nom: 'negatifs', label: 'Puissances entières négatives (hors 1/x)' },
        { nom: 'racine', label: 'Racines carrées et cubiques' },
        {
          nom: 'inverseRacine',
          label: 'Inverses de racines carrées et cubiques',
        },
        { nom: 'sin', label: 'Sinus' },
        { nom: 'cos', label: 'Cosinus' },
      ],
    },
  ],
}

/** Écrit nπ/2 sous la forme 0, \pi, -\frac{\pi}{2}, \frac{3\pi}{2}… */
function texMultipleDePiSurDeux(n: number) {
  if (n === 0) return '0'
  const q = new FractionEtendue(n, 2).simplifie()
  const signe = q.valeurDecimale < 0 ? '-' : ''
  const num = Math.abs(q.num)
  const den = Math.abs(q.den)
  const numerateur = `${num === 1 ? '' : num}\\pi`
  return den === 1
    ? `${signe}${numerateur}`
    : `${signe}\\frac{${numerateur}}{${den}}`
}

/**
 * Tire une fonction sans composition et une primitive avec des valeurs exactes aux bornes.
 * `sur` désigne l'intervalle nommé dans l'explication (par défaut [a;b]).
 */
export function tirerFonctionSansComposition(famille: string, sur?: string) {
  const k = randint(-5, 5, 0)
  const kTex = new FractionEtendue(k, 1).texFractionSaufUn
  let a: number | string
  let b: number | string
  let integrande: string
  let primitive: string
  let fa: FractionEtendue
  let fb: FractionEtendue
  let explication = ''
  // Intervalle de définition annoncé pour les primitives et fenêtre finie pour valider les saisies.
  let domaineTex: string
  let echantillonnage: [number, number]
  if (famille === 'polynome') {
    const degre = randint(1, 4)
    const coeffs = Array.from({ length: degre + 1 }, (_, j) =>
      j === degre ? k : randint(-4, 4),
    )
    // Intervalle de longueur au moins 2.
    a = randint(-3, 1)
    b = randint(a + 2, 3)
    integrande = new Polynome({ coeffs }).toLatex()
    const coeffsPrimitive = [
      new FractionEtendue(0, 1),
      ...coeffs.map((c, j) => new FractionEtendue(c, j + 1).simplifie()),
    ]
    primitive = new Polynome({
      coeffs: coeffsPrimitive,
      useFraction: true,
    }).toLatex()
    const valeur = (x: number) =>
      coeffsPrimitive
        .reduce(
          (somme, c, j) => somme.sommeFraction(c.multiplieEntier(x ** j)),
          new FractionEtendue(0, 1),
        )
        .simplifie()
    fa = valeur(a)
    fb = valeur(b)
    domaineTex = '\\mathbb{R}'
    echantillonnage = [-3, 3]
    explication =
      `On commence par chercher une primitive du polynôme, terme à terme. Pour chaque terme $cx^n$, avec $n$ entier positif ou nul, on utilise la formule :<br>` +
      `$\\int cx^n\\,\\mathrm{d}x=c\\dfrac{x^{n+1}}{n+1}+C$.<br>` +
      `On conserve donc le coefficient de chaque terme, on augmente son exposant de $1$, puis on divise par ce nouvel exposant. Pour le terme constant, on obtient une primitive de la forme $cx$.<br>`
  } else if (famille === 'sin' || famille === 'cos') {
    // Les bornes sont des multiples de π/2, avec des valeurs trigonométriques entières.
    const coefficient = famille === 'sin' ? -k : k
    const valeurs = famille === 'sin' ? [1, 0, -1, 0] : [0, 1, 0, -1]
    const valeurEn = (n: number) => valeurs[((n % 4) + 4) % 4]
    let debut: number
    let fin: number
    // Écarter les bornes pour lesquelles l'intégrale est nulle.
    do {
      debut = randint(-2, 1)
      fin = debut + randint(1, 3)
    } while (valeurEn(fin) === valeurEn(debut))
    a = texMultipleDePiSurDeux(debut)
    b = texMultipleDePiSurDeux(fin)
    integrande = `${kTex}\\${famille}(x)`
    primitive = `${new FractionEtendue(coefficient, 1).texFractionSaufUn}\\${famille === 'sin' ? 'cos' : 'sin'}(x)`
    fa = new FractionEtendue(coefficient * valeurEn(debut), 1)
    fb = new FractionEtendue(coefficient * valeurEn(fin), 1)
    domaineTex = '\\mathbb{R}'
    echantillonnage = [-2 * Math.PI, 2 * Math.PI]
    explication =
      `On commence par rappeler la formule :<br>` +
      `$${famille === 'sin' ? "\\cos'(x)=-\\sin(x)" : "\\sin'(x)=\\cos(x)"}$.<br>` +
      `Une primitive de $\\${famille}(x)$ est donc $${famille === 'sin' ? '-\\cos(x)' : '\\sin(x)'}$. Pour obtenir une primitive de $${integrande}$, on multiplie $${famille === 'sin' ? '-\\cos(x)' : '\\sin(x)'}$ par $${k}$.<br>`
  } else {
    const den = famille === 'negatifs' ? 1 : choice([2, 3])
    const num =
      famille === 'negatifs' ? -randint(2, 3) : famille === 'racine' ? 1 : -1
    const gauche = randint(1, 2)
    // Pour les puissances entières, l'intervalle [gauche ; droite] est de longueur 2.
    const droite = gauche + (den === 1 ? 2 : randint(1, 2))
    a = gauche ** den
    b = droite ** den
    const racine = den === 2 ? '\\sqrt{x}' : '\\sqrt[3]{x}'
    integrande =
      num > 0
        ? `${kTex}${racine}`
        : `${k < 0 ? '-' : ''}\\dfrac{${Math.abs(k)}}{${den === 1 ? `x^{${-num}}` : racine}}`
    const suivant = new FractionEtendue(num + den, den).simplifie()
    const alpha = new FractionEtendue(k, 1).diviseFraction(suivant).simplifie()
    primitive = texPuissanceEnRacine(alpha, 'x', suivant)
    const valeur = (v: number) =>
      alpha
        .produitFraction(
          num + den < 0
            ? new FractionEtendue(1, v ** -(num + den))
            : new FractionEtendue(v ** (num + den), 1),
        )
        .simplifie()
    fa = valeur(gauche)
    fb = valeur(droite)
    domaineTex = '\\left]0;+\\infty\\right['
    echantillonnage = [0.05, 10]
    const exposant = new FractionEtendue(num, den).toLatex('frac')
    explication =
      `On commence par écrire la fonction à intégrer à l'aide d'une puissance de $x$. Comme $x>0$ sur $${sur ?? `[${a};${b}]`}$, on a :<br>` +
      `$${integrande}=${kTex}x^{${exposant}}$.<br>` +
      `On utilise ensuite la formule suivante, valable pour $r\\ne -1$ :<br>` +
      `$\\int x^r\\,\\mathrm{d}x=\\dfrac{x^{r+1}}{r+1}+C$.<br>` +
      `Ici, $r=${exposant}$, donc une primitive est donnée par :<br>` +
      `$${kTex}\\dfrac{x^{${exposant}+1}}{${exposant}+1}=${kTex}\\dfrac{x^{${suivant.toLatex('frac')}}}{${suivant.toLatex('frac')}}=${primitive}$.<br>`
  }
  return {
    a,
    b,
    integrande,
    primitive,
    fa,
    fb,
    explication,
    domaineTex,
    echantillonnage,
  }
}
