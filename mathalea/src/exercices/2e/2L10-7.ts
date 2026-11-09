import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '26/08/2026'

export const titre = "Effectuer une application numérique d'une formule"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Effectuer une application numérique d'une formule.
 *
 * Deux familles de formules, au choix de l'utilisateur :
 *
 * * 1 : Formules issues de la physique (et autres sciences)
 *     - énergie cinétique      Ec = ½·m·v²
 *     - température d'un mélange Tf = (m₁T₁ + m₂T₂) / (m₁ + m₂)
 *     - loi d'Ohm              U  = R × I
 *     - vitesse moyenne        v  = d / t
 *     - énergie potentielle    Ep = m × g × h
 *     - résistances en parallèle Req = (R₁ × R₂) / (R₁ + R₂)
 *     - loi de Boyle-Mariotte  P₂ = (P₁ × V₁) / V₂
 *     - rendement énergétique  η  = (Wu / Wa) × 100
 * * 2 : Formules imposées à 1 ou 2 variables (fractions possibles)
 *     - A = b(a² + 1/a)              (a entier, b fraction)
 *     - E = (3x + 2y) / (x − y)      (x fraction, y entier)
 *     - T = M(k + a)                 (k entier variable 2 à 5, M entier signé, a fraction positive)
 *     - B = c(1/a + 1/b)             (a, b, c entiers)
 *     - N = n − k/a                  (n, k entiers signés, a fraction positive)
 *
 * La saisie accepte plusieurs nombres séparés par des tirets (ex : 1-1-2)
 * @author Gilles Mora
 */

export const uuid = 'a0c25'

export const refs = {
  'fr-fr': ['2L10-7'],
  'fr-ch': ['11CTFA3B-11', '11LCFA3B-11', '11LSFA3B-11'],
}

export default class ApplicationNumeriqueFormule extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.besoinFormulaireTexte = [
      'Types de formules',
      [
        'Nombres séparés par des tirets. Répéter un nombre en augmente la fréquence :',
        '1 : Formules de sciences',
        '2 : Expressions diverses',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    const formulesPhysique = [
      'Ec',
      'Tf',
      'ohm',
      'vitesse',
      'Ep',
      'req',
      'gaz',
      'rendement',
    ]
    const formulesImposee = ['ba2', 'Exy', 'Mka', 'cab', 'nka']

    const listeCategories = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['physique', 'imposee'],
    })
    const listeSituations = listeCategories.map((categorie) =>
      choice(categorie === 'physique' ? formulesPhysique : formulesImposee),
    )
    // true si la fraction brute (avant simplifie()) est déjà sous forme irréductible,
    // qu'elle soit entière ou non (contrairement à estIrreductible qui exclut les entiers)
    const dejaReduite = (f: FractionEtendue) =>
      Math.abs(f.num) === f.n && Math.abs(f.den) === f.d

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let unite = ''

      switch (listeSituations[i]) {
        // ----------------------------- PHYSIQUE -----------------------------
        case 'Ec': {
          const m = 100 * randint(5, 30) // masse en kg (pair : Ec entier)
          const v = randint(5, 40) // vitesse en m/s
          const ec = (m * v * v) / 2
          texte = `On considère la relation $E_c=\\dfrac{1}{2}\\,m\\,v^2$ (avec $m$ en kg et $v$ en m/s).<br>
           Calculer l'énergie cinétique $E_c$, en joules, d'un objet de masse $m=${texNombre(m)}\\text{ kg}$ se déplaçant à la vitesse $v=${v}\\text{ m/s}$.`
          texteCorr = `On remplace $m$ par $${texNombre(m)}$ et $v$ par $${v}$ dans l'expression.<br>
$\\begin{aligned}
E_c&=\\dfrac{1}{2}\\times ${texNombre(m)}\\times ${v}^2\\\\
&=\\dfrac{1}{2}\\times ${texNombre(m)}\\times ${texNombre(v * v)}\\\\
&=\\dfrac{1}{2}\\times ${texNombre(m * v * v)}\\\\
&=${miseEnEvidence(texNombre(ec))}\\text{ J}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: ec } })
          unite = 'J'
          break
        }
        case 'Tf': {
          const m1 = randint(1, 5)
          const m2 = randint(1, 5)
          const s = m1 + m2
          const tfCible = randint(35, 55)
          const k = randint(2, 6)
          const t1 = tfCible + m2 * k // température chaude
          const t2 = tfCible - m1 * k // température froide
          const num = m1 * t1 + m2 * t2
          const tf = num / s // = tfCible (entier)
          texte = `La température finale $T_f$ du mélange de deux masses d'eau est donnée par $T_f=\\dfrac{m_1T_1+m_2T_2}{m_1+m_2}$.<br>
           Calculer $T_f$, en $\\text{°C}$, pour $m_1=${m1}\\text{ kg}$, $T_1=${t1}\\text{ °C}$, $m_2=${m2}\\text{ kg}$ et $T_2=${t2}\\text{ °C}$.`
          texteCorr = `On remplace $m_1$ par $${m1}$, $T_1$ par $${t1}$, $m_2$ par $${m2}$ et $T_2$ par $${t2}$ dans l'expression.<br>
$\\begin{aligned}
T_f&=\\dfrac{${m1}\\times ${t1}+${m2}\\times ${t2}}{${m1}+${m2}}\\\\
&=\\dfrac{${m1 * t1}+${m2 * t2}}{${s}}\\\\
&=\\dfrac{${num}}{${s}}\\\\
&=${miseEnEvidence(texNombre(tf))}\\text{ °C}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: tf } })
          unite = '°C'
          break
        }
        case 'ohm': {
          const r = randint(2, 30)
          const intensite = randint(2, 12)
          const u = r * intensite
          texte = `La loi d'Ohm s'écrit $U=R\\times I$ (avec $U$ en volts, $R$ en ohms et $I$ en ampères). <br>
          Calculer la tension $U$, en volts, pour $R=${r}$ $\\Omega$ et $I=${intensite}\\text{ A}$.`
          texteCorr = `On remplace $R$ par $${r}$ et $I$ par $${intensite}$ dans l'expression.<br>
$\\begin{aligned}
U&=R\\times I\\\\
&=${r}\\times ${intensite}\\\\
&=${miseEnEvidence(texNombre(u))}\\text{ V}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: u } })
          unite = 'V'
          break
        }
        case 'vitesse': {
          const t = randint(2, 9)
          const v0 = randint(3, 30)
          const d = v0 * t
          texte = `La vitesse moyenne est donnée par $v=\\dfrac{d}{t}$ (avec $d$ en mètres et $t$ en secondes). <br>
          Calculer la vitesse moyenne $v$, en m/s, d'un objet parcourant $d=${texNombre(d)}\\text{ m}$ en $t=${t}\\text{ s}$.`
          texteCorr = `On remplace $d$ par $${texNombre(d)}$ et $t$ par $${t}$ dans l'expression.<br>
$\\begin{aligned}
v&=\\dfrac{d}{t}\\\\
&=\\dfrac{${texNombre(d)}}{${t}}\\\\
&=${miseEnEvidence(texNombre(v0))}\\text{ m/s}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: v0 } })
          unite = 'm/s'
          break
        }
        case 'Ep': {
          const m = randint(1, 60)
          const h = randint(2, 40)
          const ep = m * 10 * h
          texte = `L'énergie potentielle de pesanteur est donnée par $E_p=m\\times g\\times h$ (avec $g=10\\text{ N/kg}$, $m$ en kg et $h$ en m). <br>
          Calculer $E_p$, en joules, pour $m=${m}\\text{ kg}$ et $h=${h}\\text{ m}$.`
          texteCorr = `On remplace $m$ par $${m}$ et $h$ par $${h}$ dans l'expression.<br>
$\\begin{aligned}
E_p&=m\\times g\\times h\\\\
&=${m}\\times 10\\times ${h}\\\\
&=${miseEnEvidence(texNombre(ep))}\\text{ J}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: ep } })
          unite = 'J'
          break
        }
        case 'req': {
          const s = choice([20, 50])
          let r1 = randint(2, s - 2)
          let r2 = s - r1
          let req = (r1 * r2) / s
          while (Number.isInteger(req)) {
            r1 = randint(2, s - 2)
            r2 = s - r1
            req = (r1 * r2) / s
          }
          texte = `Deux résistances $R_1$ et $R_2$ sont montées en dérivation (en parallèle). <br>La résistance équivalente $R$ vérifie  $R=\\dfrac{R_1\\times R_2}{R_1+R_2}$ (en ohms). <br>
          Calculer $R$, en ohms, pour $R_1=${r1}$ $\\Omega$ et $R_2=${r2}$ $\\Omega$.`
          texteCorr = `On remplace $R_1$ par $${r1}$ et $R_2$ par $${r2}$ dans l'expression.<br>
$\\begin{aligned}
R&=\\dfrac{R_1\\times R_2}{R_1+R_2}\\\\
&=\\dfrac{${r1}\\times ${r2}}{${r1}+${r2}}\\\\
&=\\dfrac{${r1 * r2}}{${s}}\\\\
&=${miseEnEvidence(texNombre(req))}\\ \\Omega
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: req } })
          unite = 'Ω'
          break
        }
        case 'gaz': {
          const v2 = choice([2, 4, 5])
          let p1 = randint(2, 12)
          let v1 = randint(3, 15)
          let produit = p1 * v1
          while (produit % v2 === 0) {
            p1 = randint(2, 12)
            v1 = randint(3, 15)
            produit = p1 * v1
          }
          const p2 = produit / v2
          texte = `Lors d'une transformation isotherme d'un gaz, la loi de Boyle-Mariotte s'écrit $P_2=\\dfrac{P_1\\times V_1}{V_2}$ (avec $P$ en bar et $V$ en L). <br>
          Calculer la pression $P_2$, en bar, pour $P_1=${p1}\\text{ bar}$, $V_1=${v1}\\text{ L}$ et $V_2=${v2}\\text{ L}$.`
          texteCorr = `On remplace $P_1$ par $${p1}$, $V_1$ par $${v1}$ et $V_2$ par $${v2}$ dans l'expression.<br>
$\\begin{aligned}
P_2&=\\dfrac{P_1\\times V_1}{V_2}\\\\
&=\\dfrac{${p1}\\times ${v1}}{${v2}}\\\\
&=\\dfrac{${produit}}{${v2}}\\\\
&=${miseEnEvidence(texNombre(p2))}\\text{ bar}
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: p2 } })
          unite = 'bar'
          break
        }
        case 'rendement': {
          const pa = choice([40, 80])
          let wu = randint(2, pa - 2)
          let eta = (wu * 100) / pa
          while (Number.isInteger(eta)) {
            wu = randint(2, pa - 2)
            eta = (wu * 100) / pa
          }
          texte = `Le rendement d'un moteur est donné par $\\eta=\\dfrac{W_u}{W_a}\\times 100$ (en${sp()}%), où $W_u$ est l'énergie utile et $W_a$ l'énergie absorbée (en kJ). <br>
          Calculer $\\eta$, en${sp()}%, pour $W_u=${wu}\\text{ kJ}$ et $W_a=${pa}\\text{ kJ}$.`
          texteCorr = `On remplace $W_u$ par $${wu}$ et $W_a$ par $${pa}$ dans l'expression.<br>
$\\begin{aligned}
\\eta&=\\dfrac{W_u}{W_a}\\times 100\\\\
&=\\dfrac{${wu}}{${pa}}\\times 100\\\\
&=${miseEnEvidence(texNombre(eta))}\\,\\%
\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: eta } })
          unite = '%'
          break
        }
        // ---------------------------- IMPOSÉES ------------------------------
        case 'ba2': {
          const a = randint(2, 5) * choice([1, -1]) // entier non nul, ≠ ±1
          const bd = randint(2, 6)
          const bn = randint(1, bd - 1)
          const b = new FractionEtendue(bn, bd)
          const invADisplay = new FractionEtendue(1, a) // uniquement pour l'affichage
          const interieur = new FractionEtendue(a * a * a + 1, a) // a² + 1/a
          const resultat = b.produitFraction(interieur)
          const pa = ecritureParentheseSiNegatif(a) // parenthèses nécessaires pour a²
          texte = `On considère l'expression $A=b\\left(a^2+\\dfrac{1}{a}\\right)$.<br> Calculer la valeur de $A$ pour $a=${a}$ et $b=${b.texFractionSimplifiee}$.`
          texteCorr = `On remplace $a$ par $${a}$ et $b$ par $${b.texFractionSimplifiee}$ dans l'expression.<br>
$\\begin{aligned}
A&=${b.texFractionSimplifiee}\\times\\left(${pa}^2+\\dfrac{1}{${a}}\\right)\\\\
&=${b.texFractionSimplifiee}\\times\\left(${a * a}${invADisplay.texFractionSignee}\\right)\\\\
&=${b.texFractionSimplifiee}\\times ${interieur.simplifie().ecritureParentheseSiNegatif}\\\\
&=${miseEnEvidence(resultat.texFractionSimplifiee)}
\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: {
              value: fraction(resultat.signe * resultat.n, resultat.d),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        }
        case 'Exy': {
          let x = new FractionEtendue(randint(3, 9), randint(2, 5))
          while (x.d === 1) {
            x = new FractionEtendue(randint(3, 9), randint(2, 5))
          }
          const y = randint(1, 5)
          const numerateur = x
            .multiplieEntier(3)
            .sommeFraction(new FractionEtendue(2 * y, 1))
            .simplifie()
          const denominateur = x.differenceFraction(y).simplifie()
          const invDenominateur = denominateur.inverse()
          const produitBrut = numerateur.produitFraction(invDenominateur)
          const resultat = produitBrut.simplifie()
          texte = `On considère la formule $E=\\dfrac{3x+2y}{x-y}$.<br>  Calculer la valeur de $E$ pour $x=${x.texFractionSimplifiee}$ et $y=${y}$.`
          texteCorr = `On remplace $x$ par $${x.texFractionSimplifiee}$ et $y$ par $${y}$ dans l'expression.<br>
$\\begin{aligned}
E&=\\dfrac{3\\times ${x.simplifie().ecritureParentheseSiNegatif}+2\\times ${y}}{${x.texFractionSimplifiee}-${y}}\\\\
&=\\dfrac{${numerateur.texFractionSimplifiee}}{${denominateur.texFractionSimplifiee}}\\\\
&=${numerateur.texFractionSimplifiee}\\times ${invDenominateur.simplifie().ecritureParentheseSiNegatif}\\\\${
            dejaReduite(produitBrut) ? '' : `\n&=${produitBrut.texFraction}\\\\`
          }
&=${miseEnEvidence(resultat.texFractionSimplifiee)}
\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: {
              value: fraction(resultat.signe * resultat.n, resultat.d),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        }
        case 'Mka': {
          const k = randint(2, 5)
          const m = randint(2, 9) * choice([1, -1]) // entier non nul
          const ad = randint(2, 6)
          const an = randint(1, ad - 1)
          const a = new FractionEtendue(an, ad).simplifie() // fraction positive
          const interieur = a.ajouteEntier(k) // k + a
          const resultat = interieur.multiplieEntier(m)
          const pm = ecritureParentheseSiNegatif(m)
          texte = `On considère l'expression $T=M\\left(${k}+a\\right)$.<br> Calculer la valeur de $T$ pour $M=${m}$ et $a=${a.texFractionSimplifiee}$.`
          texteCorr = `On remplace $M$ par $${m}$ et $a$ par $${a.texFractionSimplifiee}$ dans l'expression.<br>
$\\begin{aligned}
T&=${pm}\\times\\left(${k}+${a.texFractionSimplifiee}\\right)\\\\
&=${pm}\\times ${interieur.simplifie().ecritureParentheseSiNegatif}\\\\
&=${miseEnEvidence(resultat.texFractionSimplifiee)}
\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: {
              value: fraction(resultat.signe * resultat.n, resultat.d),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        }
        case 'cab': {
          const a = randint(2, 8) * choice([1, -1])
          let b = randint(2, 8) * choice([1, -1])
          while (b === a) {
            b = randint(2, 8) * choice([1, -1])
          }
          const c = randint(2, 9) * choice([1, -1])
          const sommeInv = new FractionEtendue(1, a).sommeFraction(
            new FractionEtendue(1, b),
          )
          const resultat = sommeInv.multiplieEntier(c)
          const pc = ecritureParentheseSiNegatif(c)
          texte = `On considère l'expression $B=c\\left(\\dfrac{1}{a}+\\dfrac{1}{b}\\right)$.<br> Calculer la valeur de $B$ pour $a=${a}$, $b=${b}$ et $c=${c}$.`
          texteCorr = `On remplace $a$ par $${a}$, $b$ par $${b}$ et $c$ par $${c}$ dans l'expression.<br>
$\\begin{aligned}
B&=${pc}\\times\\left(\\dfrac{1}{${a}}+\\dfrac{1}{${b}}\\right)\\\\
&=${pc}\\times\\left(${sommeInv.texFractionSimplifiee}\\right)\\\\
&=${miseEnEvidence(resultat.texFractionSimplifiee)}
\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: {
              value: fraction(resultat.signe * resultat.n, resultat.d),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        }
        case 'nka': {
          const n = randint(2, 9) * choice([1, -1])
          const k = randint(2, 9) * choice([1, -1])
          const ad = randint(2, 6)
          const an = randint(1, ad - 1)
          const a = new FractionEtendue(an, ad).simplifie() // fraction positive
          const invA = a.inverse()
          const produitBrut = invA.multiplieEntier(k) // k × 1/a, avant simplification éventuelle
          const kSurA = produitBrut.simplifie() // k/a
          const resultat = kSurA.entierMoinsFraction(n) // n - k/a
          const pk = ecritureParentheseSiNegatif(k)
          const pProduitBrut =
            produitBrut.signe === -1
              ? `\\left(${produitBrut.texFraction}\\right)`
              : produitBrut.texFraction
          const pkSurA =
            kSurA.signe === -1
              ? `\\left(${kSurA.texFractionSimplifiee}\\right)`
              : kSurA.texFractionSimplifiee
          texte = `On considère l'expression $N=n-\\dfrac{k}{a}$.<br> Calculer la valeur de $N$ pour $n=${n}$, $k=${k}$ et $a=${a.texFractionSimplifiee}$.`
          texteCorr = `On remplace $n$ par $${n}$, $k$ par $${k}$ et $a$ par $${a.texFractionSimplifiee}$ dans l'expression.<br>
$\\begin{aligned}
N&=${n}-\\dfrac{${k}}{${a.texFractionSimplifiee}}\\\\
&=${n}-${pk}\\times ${invA.simplifie().ecritureParentheseSiNegatif}\\\\${
            dejaReduite(produitBrut) ? '' : `\n&=${n}-${pProduitBrut}\\\\`
          }
&=${n}-${pkSurA}\\\\
&=${miseEnEvidence(resultat.texFractionSimplifiee)}
\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: {
              value: fraction(resultat.signe * resultat.n, resultat.d),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        }
      }

      const clavier =
        listeCategories[i] === 'physique'
          ? KeyboardType.clavierDeBase
          : KeyboardType.clavierDeBaseAvecFraction
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, clavier, {
          texteApres: unite,
        })

      if (this.listeQuestions.indexOf(texte) === -1) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
