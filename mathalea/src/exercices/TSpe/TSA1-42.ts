import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { scriptPython } from '../../lib/outils/scriptPython'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Étudier une prise régulière de médicament à l’aide de suites'
export const dateDePublication = '05/08/2026'

export const uuid = 'd9a42'
export const refs = {
  'fr-fr': ['TSA1-42', 'TCA1-32'],
  'fr-ch': [],
}

type Configuration = {
  dose: number
  q: number
}

const configurations: Configuration[] = [
  { dose: 2, q: 0.5 },
  { dose: 3, q: 0.5 },
  { dose: 4, q: 0.5 },
  { dose: 5, q: 0.5 },
  { dose: 4, q: 0.6 },
  { dose: 8, q: 0.6 },
  { dose: 1, q: 0.75 },
  { dose: 2, q: 0.75 },
  { dose: 3, q: 0.75 },
  { dose: 4, q: 0.75 },
  { dose: 5, q: 0.75 },
  { dose: 1, q: 0.8 },
  { dose: 2, q: 0.8 },
  { dose: 3, q: 0.8 },
  { dose: 4, q: 0.8 },
  { dose: 1, q: 0.9 },
]

function termeSuite(
  equilibre: number,
  ecartInitial: number,
  q: number,
  n: number,
) {
  return equilibre - ecartInitial * q ** (n - 1)
}

function moyenneSuite(
  equilibre: number,
  constanteSomme: number,
  q: number,
  n: number,
) {
  return equilibre - constanteSomme / n + (constanteSomme * q ** n) / n
}

/**
 * Adaptation aléatoire du sujet 3 du baccalauréat 2025, sujet 1, Asie.
 * @author Stéphane Guyon
 */
export default class MedicamentEtSuites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.spacing = 1
    this.spacingCorr = 1
  }

  nouvelleVersion() {
    const { dose, q } = choice(configurations)
    const equilibre = Math.round(dose / (1 - q))
    const ecartInitial = equilibre - dose
    const constanteSomme = Math.round(ecartInitial / (1 - q))
    const seuil = equilibre - 1
    const u2 = dose + q * dose
    const s2 = (dose + u2) / 2
    const qTex = texNombre(q, 2)
    const doseTex = texNombre(dose, 2)
    const equilibreTex = texNombre(equilibre, 2)
    const ecartTex = texNombre(ecartInitial, 2)
    const constanteTex = texNombre(constanteSomme, 2)
    const seuilTex = texNombre(seuil, 2)

    let rangSeuil = 1
    while (
      termeSuite(equilibre, ecartInitial, q, rangSeuil) <= seuil &&
      rangSeuil < 1000
    ) {
      rangSeuil++
    }

    let rangMoyenne = 1
    while (
      moyenneSuite(equilibre, constanteSomme, q, rangMoyenne) < seuil &&
      rangMoyenne < 1000
    ) {
      rangMoyenne++
    }

    const valeurAvantSeuil = termeSuite(
      equilibre,
      ecartInitial,
      q,
      rangSeuil - 1,
    )
    const valeurAuSeuil = termeSuite(equilibre, ecartInitial, q, rangSeuil)
    const moyenneAvantSeuil = moyenneSuite(
      equilibre,
      constanteSomme,
      q,
      rangMoyenne - 1,
    )
    const moyenneAuSeuil = moyenneSuite(
      equilibre,
      constanteSomme,
      q,
      rangMoyenne,
    )

    const programme = scriptPython(
      `def mystere(k):
 n = 1
 s = ${dose}
 while s < k:
  n = n + 1
  s = ${equilibre} - ${constanteSomme}/n + (${constanteSomme}*${q}**n)/n
 return n`,
      7,
    )

    let texte = `Un patient doit prendre toutes les heures une dose de $${doseTex}$ mL d’un médicament.<br><br>`
    texte += `On introduit la suite $(u_n)$ telle que $u_n$ représente la quantité de médicament, exprimée en mL, présente dans l’organisme immédiatement après $n$ prises de médicament.<br><br>`
    texte += `On a $u_1=${doseTex}$ et, pour tout entier naturel $n$ strictement positif${sp()}:<br>`
    texte += `$u_{n+1}=${doseTex}+${qTex}u_n$.<br><br>`
    texte += `${texteEnCouleurEtGras('Partie A', 'black')}<br><br>`
    texte += `En utilisant ce modèle, un médecin cherche à savoir à partir de combien de prises la quantité de médicament présente dans l’organisme est strictement supérieure à $${seuilTex}$ mL.<br><br>`
    texte += `1. Calculer $u_2$.<br><br>`
    texte += `2. Montrer par récurrence que, pour tout entier naturel $n$ strictement positif${sp()}:<br>`
    texte += `$u_n=${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}$.<br><br>`
    texte += `3. Déterminer $\\displaystyle\\lim_{n\\to+\\infty}u_n$ et interpréter ce résultat dans le contexte de l’exercice.<br><br>`
    texte += `4. Soit $N$ un entier naturel strictement positif. L’inéquation $u_N\\geqslant ${equilibreTex}$ admet-elle des solutions${sp()}? Interpréter le résultat.<br><br>`
    texte += `5. Déterminer à partir de combien de prises la quantité de médicament présente dans l’organisme est strictement supérieure à $${seuilTex}$ mL. Justifier.<br><br>`
    texte += `${texteEnCouleurEtGras('Partie B', 'black')}<br><br>`
    texte += `On définit, pour tout entier naturel $n$ strictement positif${sp()}:<br>`
    texte += `$S_n=\\dfrac{u_1+u_2+\\dots+u_n}{n}$.<br>`
    texte += `On admet que la suite $(S_n)$ est croissante.<br><br>`
    texte += `1. Calculer $S_2$.<br><br>`
    texte += `2. Montrer que, pour tout entier naturel $n$ strictement positif${sp()}:<br>`
    texte += `$u_1+u_2+\\dots+u_n=${equilibreTex}n-${constanteTex}+${constanteTex}\\times ${qTex}^n$.<br><br>`
    texte += `3. Calculer $\\displaystyle\\lim_{n\\to+\\infty}S_n$.<br><br>`
    texte += `4. On donne la fonction suivante, écrite en langage Python${sp()}:<br>${programme}<br>`
    texte += `Dans le contexte de l’énoncé, que représente la valeur renvoyée par la saisie $\\texttt{mystere(${seuil})}$${sp()}?<br><br>`
    texte += `5. Justifier que cette valeur est strictement supérieure à $${rangSeuil - 1}$.`

    let correction = `${texteEnCouleurEtGras('Partie A', 'black')}<br><br>`
    correction += `1. $u_2=${doseTex}+${qTex}\\times ${doseTex}=${texNombre(u2, 3)}$.<br><br>`
    correction += `2. Pour tout entier naturel $n$ strictement positif, on note $\\mathcal P_n$ la propriété${sp()}:<br>`
    correction += `$u_n=${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}$.<br><br>`
    correction += `${texteEnCouleurEtGras(`Initialisation${sp()}:`, 'black')}<br>`
    correction += `$${equilibreTex}-${ecartTex}\\times ${qTex}^{1-1}=${equilibreTex}-${ecartTex}=${doseTex}=u_1$.<br>`
    correction += `La propriété $\\mathcal P_1$ est donc vérifiée.<br><br>`
    correction += `${texteEnCouleurEtGras(`Hérédité${sp()}:`, 'black')}<br>`
    correction += `Soit $n\\in\\mathbb N^*$. Supposons $\\mathcal P_n$ vraie, c’est-à-dire $u_n=${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}$. On veut montrer que $\\mathcal P_{n+1}$ est vraie.<br>`
    correction += `On a${sp()}:<br>`
    correction += `$\\begin{aligned}
u_{n+1}&=${doseTex}+${qTex}u_n\\\\
&=${doseTex}+${qTex}\\left(${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}\\right)\\\\
&=${doseTex}+${texNombre(q * equilibre, 3)}-${ecartTex}\\times ${qTex}^{n}\\\\
&=${equilibreTex}-${ecartTex}\\times ${qTex}^{n}.
\\end{aligned}$<br>`
    correction += `La propriété $\\mathcal P_{n+1}$ est donc vraie.<br><br>`
    correction += `${texteEnCouleurEtGras(`Conclusion${sp()}:`, 'black')}<br>`
    correction += `La propriété $\\mathcal P_n$ est initialisée au rang $1$ et héréditaire. Par récurrence, elle est vraie pour tout entier naturel $n$ strictement positif.<br><br>`
    correction += `3. Comme $0<${qTex}<1$, on sait que $\\displaystyle\\lim_{n\\to+\\infty}${qTex}^{n-1}=0$. Ainsi${sp()}:<br>`
    correction += `$\\displaystyle\\lim_{n\\to+\\infty}u_n=${miseEnEvidence(equilibreTex)}$.<br>`
    correction += `À long terme, la quantité de médicament présente dans l’organisme se rapproche de $${equilibreTex}$ mL.<br><br>`
    correction += `4. Soit $N\\in\\mathbb N^*$.<br>`
    correction += `$\\begin{aligned}
u_N\\geqslant ${equilibreTex}
&\\iff ${equilibreTex}-${ecartTex}\\times ${qTex}^{N-1}\\geqslant ${equilibreTex}\\\\
&\\iff -${ecartTex}\\times ${qTex}^{N-1}\\geqslant 0.
\\end{aligned}$<br>`
    correction += `Or, $-${ecartTex}<0$ et $${qTex}^{N-1}>0$. Ainsi, $-${ecartTex}\\times ${qTex}^{N-1}<0$${sp()}: cette expression ne peut pas être supérieure ou égale à $0$. L’inéquation n’a donc aucune solution. Quel que soit le nombre de prises, la quantité de médicament reste strictement inférieure à $${equilibreTex}$ mL.<br><br>`
    correction += `5. Pour $n\\in\\mathbb N^*$${sp()}:<br>`
    correction += `$\\begin{aligned}
u_n>${seuilTex}
&\\iff ${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}>${seuilTex}\\\\
&\\iff -${ecartTex}\\times ${qTex}^{n-1}>-1\\\\
&\\iff ${ecartTex}\\times ${qTex}^{n-1}<1\\quad\\text{on multiplie par }-1\\text{, donc l’ordre est inversé}\\\\
&\\iff ${qTex}^{n-1}<\\dfrac{1}{${ecartTex}}\\quad\\text{car }${ecartTex}>0\\\\
&\\iff \\ln\\left(${qTex}^{n-1}\\right)<\\ln\\left(\\dfrac{1}{${ecartTex}}\\right)
\\quad\\text{car, pour }a>0\\text{ et }b>0,\\ a\\text{ strictement inférieur à }b\\iff\\ln(a)\\text{ strictement inférieur à }\\ln(b)\\\\
&\\iff (n-1)\\ln(${qTex})<-\\ln(${ecartTex})\\quad\\text{car, pour }a>0\\text{ et }p\\in\\mathbb R,\\ \\ln(a^p)=p\\ln(a)\\text{ et }\\ln\\left(\\dfrac1a\\right)=-\\ln(a)\\\\
&\\iff n-1>-\\dfrac{\\ln(${ecartTex})}{\\ln(${qTex})}\\quad\\text{car }\\ln(${qTex})<0\\text{, donc l’ordre est inversé}\\\\
&\\iff n>1-\\dfrac{\\ln(${ecartTex})}{\\ln(${qTex})}.
\\end{aligned}$<br>`
    correction += `La calculatrice donne $1-\\dfrac{\\ln(${ecartTex})}{\\ln(${qTex})}\\approx ${texNombre(1 - Math.log(ecartInitial) / Math.log(q), 3)}$.<br>`
    correction += `De plus, $u_{${rangSeuil - 1}}\\approx ${texNombre(valeurAvantSeuil, 4)}$ et $u_{${rangSeuil}}\\approx ${texNombre(valeurAuSeuil, 4)}$. La quantité devient donc strictement supérieure à $${seuilTex}$ mL à partir de la ${rangSeuil}${rangSeuil === 1 ? 're' : 'e'} prise.<br><br>`

    correction += `${texteEnCouleurEtGras('Partie B', 'black')}<br><br>`
    correction += `1. $S_2=\\dfrac{u_1+u_2}{2}=\\dfrac{${doseTex}+${texNombre(u2, 3)}}{2}=${texNombre(s2, 3)}$.<br><br>`
    correction += `2. Pour tout entier naturel $n$ strictement positif${sp()}:<br>`
    correction += `$\\begin{aligned}
u_1+u_2+\\dots+u_n
&=\\left(${equilibreTex}-${ecartTex}\\times ${qTex}^{0}\\right)
+\\left(${equilibreTex}-${ecartTex}\\times ${qTex}^{1}\\right)
+\\dots
+\\left(${equilibreTex}-${ecartTex}\\times ${qTex}^{n-1}\\right)\\\\
&=\\underbrace{${equilibreTex}+${equilibreTex}+\\dots+${equilibreTex}}_{n\\text{ termes}}
-${ecartTex}\\left(1+${qTex}+\\dots+${qTex}^{n-1}\\right)\\\\
&=${equilibreTex}n-${ecartTex}\\left(1+${qTex}+\\dots+${qTex}^{n-1}\\right).
\\end{aligned}$<br>`
    correction += `D’après le cours, pour tout réel $q\\neq 1$${sp()}:<br>
$1+q+q^2+\\dots+q^{n-1}=\\dfrac{1-q^n}{1-q}$.<br>
Ici, $q=${qTex}\\neq 1$. On obtient donc${sp()}:<br>`
    correction += `$\\begin{aligned}
u_1+u_2+\\dots+u_n
&=${equilibreTex}n-${ecartTex}\\times\\dfrac{1-${qTex}^{n}}{1-${qTex}}\\\\
&=${equilibreTex}n-${constanteTex}\\left(1-${qTex}^{n}\\right)\\\\
&=${equilibreTex}n-${constanteTex}+${constanteTex}\\times ${qTex}^{n}.
\\end{aligned}$<br><br>`
    correction += `3. On en déduit${sp()}:<br>`
    correction += `$\\begin{aligned}
S_n
&=\\dfrac{u_1+u_2+\\dots+u_n}{n}\\\\
&=\\dfrac{${equilibreTex}n-${constanteTex}+${constanteTex}\\times ${qTex}^n}{n}&&\\text{d’après la question précédente}\\\\
&=${equilibreTex}-\\dfrac{${constanteTex}}{n}+\\dfrac{${constanteTex}\\times ${qTex}^n}{n}.
\\end{aligned}$<br>`
    correction += `Comme $-1<${qTex}<1$, on sait, d’après le cours sur les suites géométriques, que${sp()}:<br>
$\\displaystyle\\lim_{n\\to+\\infty}${qTex}^n=0$.<br>`
    correction += `De plus, on sait que${sp()}:<br>
$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{1}{n}=0$.<br>`
    correction += `On en déduit directement que${sp()}:<br>
$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${constanteTex}}{n}=0$.<br>`
    correction += `Comme $\\displaystyle\\lim_{n\\to+\\infty}${qTex}^n=0$, le numérateur $${constanteTex}\\times ${qTex}^n$ tend vers $0$. Le dénominateur $n$ tend vers $+\\infty$. On a donc${sp()}:<br>
$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${constanteTex}\\times ${qTex}^n}{n}=0$.<br>`
    correction += `Finalement, par somme${sp()}:<br>
$\\displaystyle\\lim_{n\\to+\\infty}S_n=${miseEnEvidence(equilibreTex)}$.<br><br>`
    correction += `4. La fonction renvoie le plus petit entier naturel $n$ strictement positif pour lequel la quantité moyenne $S_n$ de médicament présente dans l’organisme est supérieure ou égale à $${seuilTex}$ mL.<br>`
    correction += `Ici, $S_{${rangMoyenne - 1}}\\approx ${texNombre(moyenneAvantSeuil, 4)}$ et $S_{${rangMoyenne}}\\approx ${texNombre(moyenneAuSeuil, 4)}$. La fonction renvoie donc $${rangMoyenne}$.<br><br>`
    correction += `5. Pour tout entier $n\\leqslant ${rangSeuil - 1}$, on a $u_n\\leqslant ${seuilTex}$. La moyenne de ces termes est donc elle aussi inférieure ou égale à $${seuilTex}$. La fonction ne peut donc pas renvoyer un entier inférieur ou égal à $${rangSeuil - 1}$${sp()}: la valeur renvoyée est strictement supérieure à $${rangSeuil - 1}$.`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = correction
    listeQuestionsToContenu(this)
  }
}
