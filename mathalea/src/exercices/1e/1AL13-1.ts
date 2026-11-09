import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { tracePoint } from '../../lib/2d/TracePoint'
import { createList } from '../../lib/format/lists'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { prenom } from '../../lib/outils/Personne'
import { scriptPython } from '../../lib/outils/scriptPython'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { deDevant, sp } from '../../lib/outils/outilString'
export const titre =
  'Résoudre plusieurs questions sur une même suite (bilan type E3C)'
export const dateDePublication = '05/01/2025'

/**
 * Description didactique de l'exercice
 * @author Gilles Mora
 */
export const uuid = '33e54'
export const refs = {
  'fr-fr': ['1AL13-1'],
  'fr-ch': ['NR'],
}
export default class ProblemesAvecSuitesE3C extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '11'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        "1 : Création d'entreprises",
        "2 : Prix d'un téléphone",
        "3 : Population d'une commune",
        "4 : Nombre d'abonnés à un réseau social",
        "5 : Nombre de visionnage d'une série",
        '6 : Prolifération des chardons',
        '7 : Course cycliste',
        "8 : Hauteur d'une balle",
        '9 : Comparaison de salaires',
        "10 : Population d'abeilles",
        '11 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 10,
      melange: 11,
      defaut: 11,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const ListeNomS = ['u', 'w', 'v']
      const ListeNomSA = ['v', 't']
      const NomS = choice(ListeNomS)
      const NomSA = choice(ListeNomSA)
      let point1,
        point2,
        point3,
        point4,
        point5,
        point6,
        limite,
        nbre,
        a,
        c,
        p,
        b,
        cm,
        num,
        den,
        r,
        n,
        Rannee,
        b1,
        a1,
        a2,
        n1,
        n2,
        v,
        k,
        u0,
        u1,
        u2,
        v0,
        v1,
        graphique,
        somme,
        nbreS,
        quidam,
        annee,
        choix,
        r1
      switch (listeTypeDeQuestions[i]) {
        case 1: // création d'entreprises
          u0 = randint(10, 70)
          p = new Decimal(randint(6, 19)).div(10)
          cm = new Decimal(p).div(100).add(1)
          num = new Decimal(cm).pow(12).mul(-1).add(1)
          den = new Decimal(1).sub(cm)
          b = new Decimal(u0).mul(num).div(den).round()
          texte = `Dans un pays, le nombre de créations d'entreprise augmente de $${texNombre(p, 1)}\\,\\%$ par mois.<br>
En janvier $2024$ on compte $${texNombre(u0 * 1000, 0)}$ créations d'entreprise.<br>
On modélise le nombre de créations d'entreprise au $n$-ième mois par une suite $(${NomS}_n)$ telle que${sp()}: 
$${NomS}_0 = ${u0}$ et $${NomS}_{n+1} = ${NomS}_n \\times ${texNombre(cm, 3)}$<br>
où $${NomS}_n$ est exprimé en milliers d'entreprises. `
          texte += createList({
            items: [
              `Calculer $${NomS}_1$ puis interpréter ce résultat dans le contexte de l'exercice.`,
              createList({
                items: [
                  `Quelle est la nature de la suite $(${NomS}_n)$${sp()}? Justifier.`,
                  `Exprimer $${NomS}_n$ en fonction de $n$.`,
                  `Un journaliste annonce qu'au total dans l'année $2024$, environ $${texNombre(new Decimal(b).mul(1000), 0)}$ entreprises se sont
créées.<br>
Donner un calcul permettant de justifier les propos du journaliste.`,
                ],
                style: 'alpha',
              }),
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `On calcule $${NomS}_1$ en utilisant la formule de récurrence${sp()}: <br>
                      $\\begin{aligned}
                       ${NomS}_1&=${NomS}_0 \\times ${texNombre(cm, 3)}\\\\
&=${u0}\\times ${texNombre(cm, 3)}\\\\
&=${texNombre(new Decimal(u0).mul(cm), 3)}                                    
                       \\end{aligned}$ 
                       <br>
                       En février $2024$, on compte donc $${miseEnEvidence(texNombre(new Decimal(u0).mul(cm).mul(1000), 0))}$ créations d'entreprise.`,
              createList({
                items: [
                  `Pour tout entier naturel $n$, on a $ ${NomS}_{n+1} = ${NomS}_n \\times ${texNombre(cm, 3)}$.<br>
                            On reconnaît la définition par récurrence d'une suite géométrique de raison $q=${texNombre(cm, 3)}$.<br>
La suite $(${NomS}_{n})$ est donc une suite géométrique de raison $q=${texNombre(cm, 3)}$ et de premier terme $${NomS}_0 = ${u0}$.`,
                  `Pour tout entier naturel $n$, on a $${NomS}_n=${NomS}_0 \\times q^n$, soit $${NomS}_n=${u0} \\times ${texNombre(cm, 3)}^n$.`,
                  `Le nombre d'entreprises crées en $2024$ est donné par la somme${sp()}: $S = ${NomS}_0 + ${NomS}_1 + \\dots + ${NomS}_{11}$.<br>
$\\begin{aligned}
S &= ${NomS}_0 + ${NomS}_1 + \\dots + ${NomS}_{11} \\\\
&= ${u0} \\times \\dfrac{1 - ${texNombre(cm, 3)}^{12}}{1 - ${texNombre(cm, 3)}} \\\\
&\\approx ${texNombre(b, 3)}
\\end{aligned}$<br>

Il y a donc bien eu environ $${texNombre(new Decimal(b).mul(1000), 0)}$ créations d'entreprise en $2024$.`,
                ],
                style: 'alpha',
              }),
            ],
            style: 'nombres',
          })

          break

        case 2: // Prix d'un téléphone
          u0 = randint(5, 9) * 100
          p = randint(4, 9)
          r = new Decimal(u0)
          cm = new Decimal(p).div(100).add(1)
          num = new Decimal(cm).pow(12).mul(-1).add(1)
          den = new Decimal(1).sub(cm)
          n = 0
          b = randint(100, 110) * 10
          for (let indice = 0; r.lessThan(b); indice++) {
            r = new Decimal(cm).mul(r)
            n = indice + 1
          }

          texte = `Un téléphone coûte $${u0}$ euros lors de son lancement. Tous les ans, le fabricant sort une nouvelle version de ce téléphone.<br>
         Le prix de ce téléphone augmente de $${p}\\,\\%$ chaque année.<br>
On note $${NomS}_n$ le prix du téléphone en euros $n$ années après son lancement. <br>
On a donc $${NomS}_0 = ${u0}$. `
          texte += createList({
            items: [
              `Calculer $${NomS}_1$ et $${NomS}_2$. Interpréter les résultats.`,
              `Exprimer $${NomS}_{n+1}$ en fonction de $${NomS}_n$, pour tout entier naturel $n$ et en déduire la nature de
la suite $(${NomS}_n)$. <br>
Préciser sa raison et son premier terme.`,
              `Exprimer, pour tout entier $n$, $${NomS}_n$ en fonction de $n$.`,
              `Compléter la fonction Python ci-dessous pour qu'elle détermine le nombre minimum d'années nécessaires afin que le prix du téléphone dépasse $${texNombre(b, 0)}$
euros.<br>
${scriptPython(
  `def nombreAnnees():
 n = 0
 u = ${u0}
 while u < ${b}:
  n = \\ldots
  u = \\ldots
 return n`,
  6,
)}<br>
       `,
              `Quelle est la valeur de $n$ renvoyée par cette fonction Python${sp()}?`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Augmenter de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                    Ainsi, $${NomS}_{1}=${texNombre(cm, 2)}\\times ${u0}=${texNombre(new Decimal(cm).mul(u0), 2)}$ et $${NomS}_{2}=${texNombre(cm, 2)}\\times ${texNombre(new Decimal(cm).mul(u0), 2)}=${texNombre(new Decimal(cm).mul(u0).mul(cm), 2)}$.<br>
                    Un an après son lancement, le téléphone coûte $${miseEnEvidence(texNombre(new Decimal(cm).mul(u0), 2))}$ € et deux ans après, il coûte $${miseEnEvidence(texNombre(new Decimal(cm).mul(u0).mul(cm), 2))}$ €.`,
              `Pour tout entier naturel $n$, $${NomS}_{n+1}=${texNombre(cm, 2)}\\times ${NomS}_n$.<br>
                On reconnaît la définition par récurrence d'une suite géométrique de raison $${texNombre(cm, 2)}$.<br>
                Son premier terme est $${NomS}_{0}=${u0}$.`,
              `Pour tout entier naturel $n$, $${NomS}_n=${u0}\\times ${texNombre(cm, 2)}^n$.`,
              `On complète la fonction Python ci-dessous pour qu'elle détermine le nombre minimum d'années nécessaires afin que le prix du téléphone dépasse $${texNombre(b, 0)}$
euros.<br><br>
${scriptPython(
  `def nombreAnnees():
 n = 0
 ${NomS} = ${u0}
 while ${NomS} < ${b}:
  n = n + 1
  ${NomS} = ${cm} * ${NomS}
 return n`,
  6,
)}<br>
     `,
              ` On obtient à l'aide de la calcultarice le tableau suivant${sp()}: <br>
   $\\begin{array}{|c|c|c|}\n \\hline\n
            \n n&${NomS}_n \\\\\n \\hline\n
            \n ${n - 1}&${texNombre(new Decimal(r).div(cm), 2)} < ${b} \\\\\n \\hline\n
            \n ${n}&${texNombre(r, 2)} > ${b} \\\\\n \\hline\n
            \\end{array}\n$
            <br>On en déduit que l'algorithme retourne la valeur $${n}$.<br>
            C'est donc $${miseEnEvidence(n)}$ ans après le lancement que le prix du téléphone dépassera $${b}$ €.`,
            ],
            style: 'nombres',
          })

          break
        case 3: // population d'une commune
          u0 = randint(8, 18) * 100
          p = new Decimal(randint(2, 8))
          r = new Decimal(u0)
          Rannee = randint(5, 10)
          cm = new Decimal(1).sub(p.div(100))
          n = 0
          b = randint(100, 110) * 10
          texte = `Une commune compte $${texNombre(u0, 0)}$ habitants au début de l'année $2024$. <br>
          Le maire prévoit une baisse de $${p}\\,\\%$ par an du nombre d'habitants à partir de $2024$.<br>
Pour tout entier naturel $n$, on note $${NomS}_n$ le nombre d'habitants $n$ années après $2024$. <br>
Ainsi, $${NomS}_0 = ${texNombre(u0, 0)}$.`
          texte += createList({
            items: [
              `Calculer $${NomS}_1$ et préciser ce que cette valeur représente dans le contexte de l'exercice.`,
              `Exprimer $${NomS}_{n+1}$ en fonction de $${NomS}_n$, pour tout entier naturel $n$ et en déduire la nature de
la suite $(${NomS}_n)$. <br>
Préciser sa raison et son premier terme.`,
              `Exprimer, pour tout entier $n$, $${NomS}_n$ en fonction de $n$.`,
              `Calculer une valeur approchée, à l'entier près, du nombre d'habitants dans cette commune en $${2024 + Rannee}$.`,
              `Compléter la fonction écrite en langage Python ci-dessous, afin qu'elle permette de calculer, pour tout entier naturel $n$, le terme $${NomS}_n$.<br>
              ${scriptPython(
                `def ${NomS}(n):
 ${NomS} = \\ldots
 for i in range(1, \\ldots):
  ${NomS} = \\ldots
 return \\ldots`,
                6,
              )}`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Diminuer de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                  Ainsi, $${NomS}_{1}=${texNombre(cm, 2)}\\times ${u0}=${texNombre(new Decimal(cm).mul(u0), 2)}$.<br>
                   Ce modèle prévoit $${miseEnEvidence(texNombre(new Decimal(cm).mul(u0), 2))}$ habitants en $${2025}$.`,
              `On obtient le nombre d'habitants d'une année en multipliant le nombre d'habitants l'année précédente par $${texNombre(cm, 2)}$.<br>
              Ainsi, pour tout entier naturel $n$, $${NomS}_{n+1}=${texNombre(cm, 2)}\\times ${NomS}_n$.<br>
              On reconnaît la définition par récurrence d'une suite géométrique de raison $${texNombre(cm, 2)}$.<br>
              Son premier terme est $${NomS}_{0}=${u0}$.`,
              `Pour tout entier naturel $n$, $${NomS}_n=${u0}\\times ${texNombre(cm, 2)}^n$.`,
              `$${2024 + Rannee}$ correspond à $n=${Rannee}$, d'où${sp()}:<br>
$${NomS}_{${Rannee}}=${u0}\\times (${texNombre(cm, 2)})^{${Rannee}}\\approx ${texNombre(new Decimal(cm).pow(Rannee).mul(u0), 0)}$.<br>
Ce modèle prévoit $${miseEnEvidence(texNombre(new Decimal(cm).pow(Rannee).mul(u0), 0))}$ habitants en $${2024 + Rannee}$.`,
              `On complète la fonction Python ci-dessous afin qu'elle permette de calculer, pour tout entier naturel $n$, le terme $${NomS}_n$.<br><br>
              ${scriptPython(
                `def ${NomS}(n):
 ${NomS} = ${u0}
 for i in range(1, n+1):
  ${NomS} = ${cm} * ${NomS}
 return ${NomS}`,
                6,
              )}<br>
   `,
            ],
            style: 'nombres',
          })
          break
        case 4: // nombre d'abonnés à un réseau
          p = new Decimal(randint(4, 9))
          r = randint(80, 140) * 10
          u0 = 2 * r * randint(4, 8)
          choix = choice([true, false])
          n = 0
          b = randint(100, 110) * 10
          texte = `En $2024$, le nombre d'abonnés à une page de réseau social d'un musicien était de $${texNombre(u0, 0)}$.<br>
On suppose que chaque année, il obtient $${r}$ abonnés supplémentaires.<br>
On désigne par $${NomS}_n$ le nombre d'abonnés en $2024 + n$ pour tout entier naturel $n$.<br>
`
          texte += createList({
            items: [
              "Calculer le nombre d'abonnés en $2025$ et $2026$.",
              `Exprimer $${NomS}_{n+1}$ en fonction de $${NomS}_n$, pour tout entier naturel $n$ et en déduire la nature de
la suite $(${NomS}_n)$. <br>
Préciser sa raison et son premier terme.`,
              `Exprimer, pour tout entier $n$, $${NomS}_n$ en fonction de $n$.`,
              `En quelle année le nombre d'abonnés aura ${choix ? 'doublé' : 'triplé'} par rapport à l'année $2024$${sp()}?`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `$${NomS}_1=${texNombre(u0, 0)}+${r}=${texNombre(u0 + r, 0)}$<br>
              $${NomS}_2=${texNombre(u0 + r, 0)}+${r}=${texNombre(u0 + 2 * r, 0)}$<br>
                  En $2025$, ce modèle prévoit $${miseEnEvidence(texNombre(u0 + r, 0))}$ abonnés.<br>
                   En $2026$, ce modèle prévoit $${miseEnEvidence(texNombre(u0 + 2 * r, 0))}$ abonnés.`,
              `On obtient le nombre d'abonnés d'une année sur l'autre en ajoutant $${r}$ abonnés.<br>
              Ainsi, pour tout entier naturel $n$, $${NomS}_{n+1}= ${NomS}_n+${r}$.<br>
              On reconnaît la définition par récurrence d'une suite arithmétique de raison $${r}$.<br>
              Son premier terme est $${NomS}_{0}=${texNombre(u0, 0)}$.`,
              `Pour tout entier naturel $n$, $${NomS}_n=${u0}+ n\\times ${r}$, soit plus simplement $${NomS}_n=${texNombre(u0, 0)}+ ${r}n$.`,
              `On cherche $n$ tel que${sp()}: $${texNombre(u0, 0)}+ ${r}n = ${choix === true ? `2\\times ${texNombre(u0, 0)}` : `3\\times ${texNombre(u0, 0)}`}$.<br>
$\\begin{aligned}
${texNombre(u0, 0)}+ ${r}n&= ${choix === true ? `${texNombre(2 * u0, 0)}` : `${texNombre(3 * u0, 0)}`}\\\\
${r}n&= ${choix === true ? `${texNombre(2 * u0, 0)}-${texNombre(u0, 0)}` : `${texNombre(3 * u0, 0)}-${texNombre(u0, 0)}`}\\\\
${r}n&= ${choix === true ? `${texNombre(u0, 0)}` : `${texNombre(2 * u0, 0)}`}\\\\
n&= ${choix === true ? `\\dfrac{${texNombre(u0, 0)}}{${r}}` : `\\dfrac{${texNombre(2 * u0, 0)}}{${r}}`}\\\\
n&= ${choix === true ? `${texNombre(u0 / r, 1)}` : `${texNombre((2 * u0) / r, 1)}`}
\\end{aligned}$<br>
On en déduit que c'est à partir de 
$${choix === true ? `${texNombre(2024, 0)}+${texNombre(u0 / r, 1)}` : `${texNombre(2024, 0)}+${texNombre((2 * u0) / r, 1)}`}$
soit en $${miseEnEvidence(choix === true ? `${texNombre(2024 + u0 / r, 1)}` : `${texNombre(2024 + (2 * u0) / r, 1)}`)}$ que le nombre d'abonnés aura ${choix ? 'doublé' : 'triplé'} par rapport à l'année $2024$.
`,
            ],
            style: 'nombres',
          })
          break

        case 5: // nombre de visionnage d'une série
          u0 = new Decimal(randint(8, 20) * 10000)
          p = new Decimal(choice([2, 4, 5]))
          n1 = 0
          n2 = 0
          a1 = u0
          a2 = u0
          cm = new Decimal(1).add(p.div(100))
          b = randint(4, 8) * 100000
          b1 = new Decimal(u0).add(randint(1, 9) * 10000)
          v = randint(35, 60)
          for (let indice = 0; a1.lessThan(b1); indice++) {
            a1 = new Decimal(a1).mul(cm)
            n1 = indice + 1
          }
          for (let indice1 = 0; a2.lessThan(b); indice1++) {
            a2 = new Decimal(a2).mul(cm)
            n2 = indice1 + 1
          }
          texte = `Un service de vidéos à la demande réfléchit au lancement d'une nouvelle série mise en ligne chaque semaine.<br>
        Le nombre de visionnages estimé la première semaine est de $${texNombre(u0, 0)}$.<br>
         Ce nombre augmenterait ensuite de $${texNombre(p, 0)}\\,\\%$ chaque semaine.<br>
Les dirigeants souhaiteraient obtenir au moins $${texNombre(b, 0)}$ visionnages par semaine.

On modélise cette situation par une suite $(${NomS}_n)$ où $${NomS}_n$ représente le nombre de visionnages $n$ semaines après le début de la diffusion. <br>
On a donc $${NomS}_0 = ${texNombre(u0, 0)}$.`
          texte += createList({
            items: [
              ` Calculer le nombre $${NomS}_1$ de visionnages une semaine après le début de la diffusion. `,
              `Justifier que pour tout entier naturel $n$${sp()}: $${NomS}_n = ${texNombre(u0, 0)} \\times ${texNombre(cm, 2)}^n$.`,
              `À partir de combien de semaines le nombre de visionnages hebdomadaire sera-t-il supérieur à $${texNombre(b1, 0)}$${sp()}?`,
              `Voici un algorithme écrit en langage Python${sp()}:<br>
              ${scriptPython(
                `def seuil():
 ${NomS} = ${u0}
 n = 0
 while ${NomS} < ${b}:
  ${NomS} = ${cm}*${NomS}
  n = n+1
 return n`,
                6,
              )}<br>
    Déterminer la valeur affichée par cet algorithme et interpréter le résultat précédent
dans le contexte de l'exercice.`,
              `On pose pour tout entier naturel $n$${sp()}: $S_n = ${NomS}_0 + \\ldots + ${NomS}_n$.<br>
 Montrer que l'on a${sp()}: $S_n = ${texNombre(new Decimal(u0).div(cm.sub(1)))} \\times \\left(${texNombre(cm, 2)}^{n+1} - 1\\right)$.<br>
En déduire le nombre total de visionnages au bout de $${v}$ semaines (arrondir à
l'unité).`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Augmenter de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                Ainsi, $${NomS}_{1}=${texNombre(cm, 2)}\\times ${texNombre(u0, 0)}=${texNombre(new Decimal(cm).mul(u0), 2)}$.<br>
                 Ce modèle prévoit $${texNombre(new Decimal(cm).mul(u0), 2)}$ visionnages une semaine après le début de la diffusion.`,
              `Toutes les semaines, le nombre de visionnages prévu est multiplié par $${texNombre(cm, 2)}$.<br>
On en déduit que $(${NomS}_{n})$ est une suite géométrique de raison $${miseEnEvidence(texNombre(cm, 2))}$.<br>
Ainsi, pour tout entier naturel $n$, $${NomS}_n=${texNombre(u0, 0)}\\times ${texNombre(cm, 2)}^n$.`,
              `On cherche $n$ tel que $${NomS}_n > ${texNombre(b1, 0)}$, c'est-à-dire $${texNombre(u0, 0)}\\times ${texNombre(cm, 2)}^n>${texNombre(b1, 0)}$.<br>
En utilisant la calculatrice, on trouve $n=${n1}$.`,
              `On obtient à l'aide de la calcultarice le tableau suivant${sp()}: <br>
   $\\begin{array}{|c|c|c|}\n \\hline\n
            \n n&${NomS}_n \\\\\n \\hline\n
            \n ${n2 - 1}&${texNombre(new Decimal(a2).div(cm), 2)} <${texNombre(b, 0)}\\\\\n \\hline\n
            \n ${n2}&${texNombre(a2, 2)} > ${texNombre(b, 0)} \\\\\n \\hline\n
            \\end{array}\n$
            <br>On en déduit que l'algorithme retourne la valeur $${n2}$.<br>
            C'est donc à partir de la $${miseEnEvidence(n2)}$ ième semaine que le nombre de visionnages dépassera $${texNombre(b, 0)}$.
 `,
              `$S_n$ est la somme des $(n+1)$ premiers termes d'une suite géométrique de premier terme $${texNombre(u0, 0)}$ et de raison $${texNombre(cm, 2)}$.<br>
 Ainsi${sp()}: <br>
 $\\begin{aligned}
 S_n&=${texNombre(u0, 2)}\\times \\dfrac{1-${texNombre(cm, 2)}^{n+1}}{1-${texNombre(cm, 2)}}\\\\
 &=\\dfrac{${texNombre(u0, 2)}}{1-${texNombre(cm, 2)}}\\times (1-${texNombre(cm, 2)}^{n+1})\\\\
&=${texNombre(new Decimal(u0).div(cm.sub(1)).mul(-1))}\\times (1-${texNombre(cm, 2)}^{n+1})\\\\
&=${texNombre(new Decimal(u0).div(cm.sub(1)))}\\times (${texNombre(cm, 2)}^{n+1}-1)
 \\end{aligned}$<br>
 
 Pour $n=${v}$, on obtient $S_{${v}}=${texNombre(new Decimal(u0).div(cm.sub(1)))}\\times (${texNombre(cm, 2)}^{${v}+1}-1)\\approx ${texNombre(new Decimal(u0).div(cm.sub(1)).mul(cm.pow(v + 1)), 0)}$.<br>
 Au bout de $${v}$ semaines, le nombre total de visionnages est $${texNombre(new Decimal(u0).div(cm.sub(1)).mul(cm.pow(v + 1)), 0)}$.`,
            ],
            style: 'nombres',
          })
          break

        case 6: // prolifération de chardons
          p = new Decimal(choice([2, 4, 5]))
          cm = new Decimal(1).add(p.div(100))
          u0 = new Decimal(randint(2, 6) * 100)
          k = new Decimal(randint(2, 8) * 10)
          b = new Decimal(k).div(cm.mul(-1).add(1))
          u1 = new Decimal(cm).mul(u0).add(k)
          u2 = new Decimal(cm).mul(cm.mul(u0).add(k)).add(k)
          nbreS = randint(8, 20)
          choix = choice([true, false])

          texte = `Aujourd'hui les chardons (une plante vivace) ont envahi $${u0}\\text{ m}^2$ des champs d'une région.<br>
 Chaque semaine, la surface envahie augmente de $${texNombre(p, 0)}\\,\\%$ par le développement des racines, auquel s'ajoutent $${texNombre(k, 2)}\\text{ m}^2$ suite à la dissémination des graines.<br>
Pour tout entier naturel $n$, on note $${NomS}_n$ la surface envahie par les chardons, en $\\text{ m}$$^2$, après $n$ semaines ; on a donc $${NomS}_0 = ${u0}\\text{ m}^2$.`
          texte += createList({
            items: [
              `Calculer $${NomS}_1$ et $${NomS}_2$.`,
              `Montrer que la suite $(${NomS}_n)$ ainsi définie, n'est ni arithmétique ni géométrique.`,
              `On admet dans la suite de l'exercice que, pour tout entier naturel $n$${sp()}: $${NomS}_{n+1} = ${texNombre(cm, 2)}${NomS}_n+ ${k}$.` +
                createList({
                  items: [
                    `On considère la suite $(t_n)$, définie pour tout entier naturel $n$, par${sp()}: $t_n = ${NomS}_n${ecritureAlgebrique(-b)}$.<br>
Calculer $t_0$, puis montrer que la suite $(t_n)$ est géométrique de raison $q = ${texNombre(cm, 2)}$.`,
                    `Pour tout entier naturel $n$, exprimer $t_n$ en fonction de $n$, puis montrer que $${NomS}_n = ${texNombre(new Decimal(u0).sub(b), 1)} \\times ${texNombre(cm, 2)}^n ${ecritureAlgebrique(b)}$`,
                    `Est-il correct d'affirmer que la surface envahie par les chardons aura doublé au bout de $${nbreS}$ semaines${sp()}? Justifier la réponse.`,
                  ],
                  style: 'alpha',
                }),
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Augmenter de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                Ainsi, $${NomS}_{1}=${texNombre(cm, 2)}\\times ${texNombre(u0, 0)}+${k}=${texNombre(u1, 2)}$ et 
                $${NomS}_{2}=${texNombre(cm, 2)}\\times ${texNombre(u1, 2)}+${k}=${texNombre(u2, 2)}$.`,
              `$${NomS}_{1}-${NomS}_{0}=${texNombre(u1, 2)}-${u0}=${texNombre(new Decimal(u1).sub(u0), 2)}$ <br>
                $${NomS}_{2}-${NomS}_{1}=${texNombre(u2, 2)}-${texNombre(u1, 2)}=${texNombre(new Decimal(u2).sub(u1), 2)}$ <br> 
                $${NomS}_{1}-${NomS}_{0}\\neq ${NomS}_{2}-${NomS}_{1}$ donc la suite n'est pas arithmétique.<br><br>
                $\\dfrac{${NomS}_{1}}{${NomS}_{0}}=\\dfrac{${texNombre(u1, 2)}}{${u0}}\\approx${texNombre(new Decimal(u1).div(u0), 3)}$ <br>
                $\\dfrac{${NomS}_{2}}{${NomS}_{1}}=\\dfrac{${texNombre(u2, 2)}}{${texNombre(u1, 2)}}\\approx${texNombre(new Decimal(u2).div(u1), 3)}$ <br> 
                $\\dfrac{${NomS}_{1}}{${NomS}_{0}}\\neq \\dfrac{${NomS}_{2}}{${NomS}_{1}}$ donc la suite n'est pas géométrique.<br><br>
                `,

              createList({
                items: [
                  `Pour tout entier naturel $n$, <br>
            $\\begin{aligned}
           t_{n+1}&=${NomS}_{n+1} ${ecritureAlgebrique(-b)}\\\\
           &=${texNombre(cm, 2)}${NomS}_n+ ${k} ${ecritureAlgebrique(-b)}\\\\
           &=${texNombre(cm, 2)}${NomS}_n ${ecritureAlgebrique(new Decimal(k).sub(b))}\\\\
           &=${texNombre(cm, 2)}(${NomS}_n${ecritureAlgebrique(-b)})\\\\
           &=${texNombre(cm, 2)}t_n
           \\end{aligned}$<br>
           On a donc $t_{n+1}=${texNombre(cm, 2)}t_n$.<br>
           $(t_n)$ est donc une suite géométrique de raison $${miseEnEvidence(texNombre(cm, 2))}$.<br>
           On calcule son premier terme $t_0$${sp()}: <br>
           $\\begin{aligned}
          t_0&=${NomS}_0${ecritureAlgebrique(-b)}\\\\
          &=${texNombre(u0, 1)}${ecritureAlgebrique(-b)}\\\\
          &=${texNombre(new Decimal(u0).sub(b), 1)}
          \\end{aligned}$`,
                  ` On en déduit l'expression de $t_n$ en fonction de $n$ pour tout entier naturel $n$${sp()}: $t_n=${texNombre(new Decimal(u0).sub(b), 1)}\\times ${texNombre(cm, 2)}^n$.<br>
Or $t_n = ${NomS}_n${ecritureAlgebrique(-b)}$ donc $${NomS}_n = ${miseEnEvidence(`${texNombre(new Decimal(u0).sub(b), 1)}\\times ${texNombre(cm, 2)}^n${ecritureAlgebrique(b)}`)}$
`,
                  `On a $${NomS}_{${nbreS}}=${texNombre(new Decimal(u0).sub(b), 1)}\\times ${texNombre(cm, 2)}^{${nbreS}}${ecritureAlgebrique(b)}
\\approx ${texNombre(new Decimal(b.sub(u0).mul(-1).mul(cm.pow(nbreS)).add(b)), 0)}$.<br>
Au bout de $${nbreS}$ semaines, la surface envahie par les chardons est d'environ $${texNombre(new Decimal(b.sub(u0).mul(-1).mul(cm.pow(nbreS)).add(b)), 0)}\\text{ m}^2$.<br>
Comme $${texNombre(new Decimal(b.sub(u0).mul(-1).mul(cm.pow(nbreS)).add(b)), 0)} ${b.sub(u0).mul(-1).mul(cm.pow(nbreS)).add(b).lessThan(u0.mul(2)) ? '<' : '>'} 2\\times ${texNombre(u0, 0)}$, la surface envahie par les chardons 
${b.sub(u0).mul(-1).mul(cm.pow(nbreS)).add(b).lessThan(u0.mul(2)) ? "n'aura pas" : 'aura'} doublé au bout de $${nbreS}$ semaines. `,
                ],
                style: 'alpha',
              }),
            ],
            style: 'nombres',
          })
          break

        case 7: // course cycliste
          u0 = new Decimal(randint(25, 35))
          u1 = u0
          p = new Decimal(randint(7, 15))
          n1 = 0
          cm = new Decimal(1).add(p.div(100))
          b = randint(11, 19) * 10

          for (let indice = 0; u1.lessThan(b); indice++) {
            u1 = new Decimal(u1).mul(cm)
            n1 = indice + 1
          }
          num = new Decimal(cm)
            .pow(n1 + 1)
            .mul(-1)
            .add(1)
          den = new Decimal(1).sub(cm)
          somme = new Decimal(u0).mul(num).div(den).round()
          texte = `Désirant participer à une course de $${b}\\text{ km}$, un cycliste prévoit l'entraînement suivant${sp()}:<br>
$\\bullet$ parcourir $${u0}\\text{ km}$ en première semaine ;<br>
$\\bullet$ chaque semaine qui suit, augmenter la distance parcourue de $${p}\\,\\%$ par rapport à celle parcourue la semaine précédente.<br>
On modélise la distance parcourue chaque semaine à l'entraînement par la suite $(d_n)$ où $d_n$ représente la distance en $\\text{km}$ parcourue pendant la $n$-ième semaine d'entraînement.
<br>
On a ainsi $d_1 = ${u0}$.
`
          texte += createList({
            items: [
              'Calculer $d_3$. Arrondir le résultat au $\\text{km}$ près.',
              `Exprimer $d_{n+1}$ en fonction de $d_n$. <br>
                 En déduire la nature de la suite $(d_n)$. Justifier.`,
              'Exprimer, pour tout entier $n$ non nul, $d_n$ en fonction de $n$.',
              `On considère la fonction définie de la façon suivante en langage Python.<br>
              ${scriptPython(
                `def distance(k):
 d = ${u0}
 n = 1
 while d<=k :
  d = d*${cm}
  n = n+1
 return n`,
                6,
              )}<br>
      Donner l'information obtenue par le calcul de $\\texttt{distance(${b})}$${sp()}?
      `,
              `Calculer la distance totale parcourue par le cycliste pendant les $${n1 + 1}$ premières semaines d'entraînement.`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Augmenter de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                  Ainsi, $d_{2}=${texNombre(cm, 2)}\\times ${u0}=${texNombre(new Decimal(cm).mul(u0), 2)}$ et $d_{3}=${texNombre(cm, 2)}\\times ${texNombre(new Decimal(cm).mul(u0), 2)}\\approx ${texNombre(new Decimal(cm).pow(2).mul(u0), 0)}$
                  `,
              `Chaque semaine, la distance parcourue augmente de $${p}\\,\\%$ par rapport à celle parcourue la semaine précédente. <br>
              Ainsi, quel que soit $n \\geqslant 1$, $d_{n+1} = ${texNombre(cm, 2)} \\times d_n$.<br>
              On reconnaît la définition par récurrence d'une suite géométrique de raison $${miseEnEvidence(texNombre(cm, 2))}$ et de premier terme $d_1=${u0}$.`,
              `Pour tout entier naturel $n \\geqslant 1$, $d_n=${u0}\\times ${texNombre(cm, 2)}^{n-1}$.`,
              `La fonction $\\texttt{distance(${b})}$ renverra le nombre de semaines nécessaires pour atteindre une distance de $${b}\\text{ km}$.<br>
On obtient à l'aide de la calcultarice le tableau suivant${sp()}: <br>
   $\\begin{array}{|c|c|c|}\n \\hline\n
            \n n&d_n \\\\\n \\hline\n
            \n ${n1}&${texNombre(new Decimal(u1).div(cm), 2)} <${texNombre(b, 0)}\\\\\n \\hline\n
            \n ${n1 + 1}&${texNombre(u1, 2)} > ${texNombre(b, 0)} \\\\\n \\hline\n
            \\end{array}\n$
            <br>On en déduit que l'algorithme retourne la valeur $${n1 + 1}$.<br>
            C'est donc la $${miseEnEvidence(n1 + 1)}$ ième semaine que la distance parcourue lors de l'entraînement dépasse pour la première fois $${b}\\text{ km}$.`,
              `La distance totale parcourue par le cycliste pendant les $${n1 + 1}$ premières semaines d'entraînement est donnée par${sp()}: $S_{${n1 + 1}}=d_1+d_2+\\ldots +d_{${n1 + 1}}$.<br>
            $S_{${n1 + 1}}$ est la somme des $${n1 + 1}$ premiers termes d'une suite géométrique de raison $${texNombre(cm, 2)}$ et de premier terme $d_1=${u0}$.<br>
             $\\begin{aligned}
S_{${n1 + 1}} &= d_1 + d_2 + \\dots + ${NomS}_{${n1 + 1}} \\\\
&= ${u0} \\times \\dfrac{1 - ${texNombre(cm, 2)}^{${n1 + 1}}}{1 - ${texNombre(cm, 2)}} \\\\
&\\approx ${texNombre(somme, 0)}
\\end{aligned}$<br>

Au cours des $${n1 + 1}$ séances d'entraînement, le cycliste a parcouru au total $${texNombre(somme, 0)}\\text{ km}$. `,
            ],
            style: 'nombres',
          })
          break

        case 8: // hauteur d'une balle
          p = new Decimal(randint(15, 30))
          r = randint(80, 140) * 10
          u0 = new Decimal(randint(2, 5))
          u1 = u0
          choix = choice([true, false])
          n = randint(4, 8)
          n1 = 0
          b = randint(8, 15)
          b1 = new Decimal(b).div(100)
          cm = new Decimal(1).sub(p.div(100))
          for (let indice = 0; b1.lessThan(u1); indice++) {
            u1 = new Decimal(u1).mul(cm)
            n1 = indice + 1
          }
          texte = `Une balle est lâchée d'une hauteur de $${u0}$ mètres au-dessus du sol. Elle touche le sol et rebondit. <br>
          À chaque rebond, la balle perd $${p}\\,\\%$ de sa hauteur précédente.<br>
On modélise la hauteur de la balle par une suite $(h_n)$ où $h_n$ désigne la hauteur maximale de la balle, en mètres, après le $n$-ième rebond.<br>
`
          texte += createList({
            items: [
              'Calculer $h_1$ et $h_2$. Arrondir au cm près si besoin.',
              `Exprimer $h_{n+1}$ en fonction de $h_n$, pour tout entier naturel $n$ et en déduire la nature de
la suite $(h_n)$. <br>
Préciser sa raison et son premier terme.`,
              'Exprimer, pour tout entier $n$, $h_n$ en fonction de $n$.',
              `Déterminer la hauteur, arrondie au cm, de la balle après $${n}$ rebonds.`,
              `La fonction «${sp()}seuil${sp()}» est définie ci-dessous en langage Python.<br>
              ${scriptPython(
                `def seuil():
 h = ${u0}
 n = 0
 while h >= ${b1} :
  h = h*${cm}
  n = n+1
 return n`,
                6,
              )}<br>
      Compléter les pointillés pour que cette fonction renvoie le nombre de rebonds à partir duquel la hauteur maximale de la balle sera inférieure ou égale à $${b}$ centimètres.<br>
      Déterminer ce nombre.
      `,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Diminuer de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
                Ainsi, $h_{1}=${texNombre(cm, 2)}\\times ${texNombre(u0, 0)}=${texNombre(new Decimal(cm).mul(u0), 2)}$ et $h_{2}=${texNombre(cm, 2)}\\times ${texNombre(new Decimal(cm).mul(u0), 2)}\\approx${texNombre(new Decimal(cm).pow(2).mul(u0), 2)}$.<br>`,
              `À chaque rebond, la balle perd $${p}\\,\\%$ de sa hauteur précédente, donc pour tout entier naturel $n$, $h_{n+1}=${texNombre(cm, 2)}\\times h_n$.<br>
On reconnaît la définition par récurrence d'une suite géométrique de raison $${texNombre(cm, 2)}$.<br>
Son premier terme est $h_0=${u0}$.`,
              `Pour tout entier naturel $n$, $h_n=${texNombre(u0, 0)}\\times ${texNombre(cm, 2)}^n$.`,
              `$h_{${n}}=${texNombre(u0, 0)}\\times (${texNombre(cm, 2)})^{${n}}\\approx ${texNombre(cm.pow(n).mul(u0), 2)}$.<br>
La balle rebondit à une hauteur de $${texNombre(cm.pow(n).mul(u0), 2)}\\text{ m}$ après $${n}$ rebonds.`,
              `On compléte les pointillés pour que cette fonction renvoie le nombre de rebonds à partir duquel la hauteur maximale de la balle sera inférieure ou égale à $${b}$ centimètres${sp()}: <br>
              ${scriptPython(
                `def seuil():
 h = ${u0}
 n = 0
 while h >= ${b1} :
  h = h*${cm}
  n = n+1
 return n`,
                6,
              )}<br>
            
            En utilisant une calcultarice, on obtient le tableau suivant${sp()}: <br>
            $\\begin{array}{|c|c|c|}\n \\hline\n
            \n n&d_n \\\\\n \\hline\n
            \n ${n1 - 1}&${texNombre(new Decimal(u1).div(cm), 3)} >${texNombre(b1, 2)}\\\\\n \\hline\n
            \n ${n1}&${texNombre(u1, 3)} < ${texNombre(b1, 2)} \\\\\n \\hline\n
            \\end{array}\n$<br>
            C'est donc à partir du $${miseEnEvidence(n1)}$ ième rebond que la hauteur maximale de la balle sera inférieure ou égale à $${b}$ centimètres.
 `,
            ],
            style: 'nombres',
          })
          break

        case 9: // salaires
          quidam = prenom(2)
          p = new Decimal(randint(3, 5))
          cm = new Decimal(1).add(p.div(100))
          r = randint(55, 75) * 10
          k = randint(5, 8)
          u0 = randint(180, 220) * 100
          v0 = u0 - randint(15, 20) * 100
          u1 = new Decimal(u0)
          v1 = new Decimal(v0)
          annee = 2020 + randint(5, 9)
          n = randint(4, 8)
          n1 = 0
          b = randint(8, 15)
          b1 = new Decimal(b).div(100)
          for (let indice = 0; v1.lessThan(u1); indice++) {
            u1 = new Decimal(u1).add(r)
            v1 = new Decimal(v1).mul(cm)
            n1 = indice + 1
          }
          texte = `${quidam[0]} et ${quidam[1]} ont été embauchés au même moment dans une entreprise et ont négocié leur contrat à des conditions différentes${sp()}:<br>
$\\bullet$ ${quidam[0]} a commencé en $2020$ avec un salaire annuel de $${texNombre(u0, 0)}$ € alors que le salaire ${deDevant(quidam[1])} était, cette même année, de $${texNombre(v0, 0)}$ €.<br>
$\\bullet$ Le salaire ${deDevant(quidam[0])} augmente de $${r}$ € par an alors que celui ${deDevant(quidam[1])} augmente de $${p}\\,\\%$ par an.

`
          texte += createList({
            items: [
              `Quels étaient les salaires annuels ${deDevant(quidam[0])} et ${deDevant(quidam[1])} en $2022$${sp()}? `,
              `On modélise les salaires ${deDevant(quidam[0])} et ${deDevant(quidam[1])} à l'aide de suites.` +
                createList({
                  items: [
                    `On note $u_n$ le salaire ${deDevant(quidam[0])} en l'année $2020 +n$. On a donc $u_0 = ${texNombre(u0, 0)}$.<br>
     Quelle est la nature de la suite $(u_n)$${sp()}?`,
                    `Déterminer en quelle année le salaire ${deDevant(quidam[0])} dépassera $${texNombre(u0 + k * r + 10, 0)}$.`,
                    `On note $v_n$ le salaire ${deDevant(quidam[1])} en l'année $2020 +n$.<br>
Exprimer $v_{n+1}$ en fonction de $v_n$, puis $v_n$ en fonction de $n$.`,
                    `Calculer le salaire ${deDevant(quidam[1])} en $${annee}$. On arrondira le résultat à l'euro.`,
                  ],
                  style: 'alpha',
                }),
              `On veut déterminer à partir de quelle année le salaire ${deDevant(quidam[1])} dépassera celui ${deDevant(quidam[0])}. <br>
Pour cela, on dispose du programme incomplet ci-dessous écrit en langage Python.<br>
Compléter les quatre parties en pointillé du programme ci-dessous, puis déterminer l'année cherchée${sp()}:<br>
${scriptPython(
  `def algo():
 A = ${u0}
 B = ${v0}
 n = 0
 while \\ldots :
  A = \\ldots
  B = \\ldots
  n = \\ldots
 return n`,
  6,
)}`,
            ],
            style: 'nombres',
          })

          texteCorr = createList({
            items: [
              `Tous les ans le salaire ${deDevant(quidam[0])} augmente de $${r}$ €.<br>
             $${texNombre(u0, 0)}+2\\times ${r}=${texNombre(u0 + 2 * r, 0)}$.<br>
             Le salaire ${deDevant(quidam[0])} en $2022$ est $${texNombre(u0 + 2 * r, 0)}$ €.<br>
           Tous les ans le salaire ${deDevant(quidam[1])} augmente de $${p}\\,\\%$.<br>
           Augmenter de $${p}\\,\\%$ revient à multiplier par $${texNombre(cm, 2)}$.<br>
              $${texNombre(v0, 0)}\\times ${texNombre(cm, 2)}^2=
              ${texNombre(new Decimal(cm.pow(2).mul(v0)), 2)}$.<br>
              Le salaire ${deDevant(quidam[1])} en $2022$ est $${texNombre(new Decimal(cm.pow(2).mul(v0)), 2)}$ €.`,
              createList({
                items: [
                  `Comme le salaire ${deDevant(quidam[0])} augmente de $${r}$ € tous les ans, on a pour tout entier naturel $n$, $u_{n+1}=u_n+${r}$.<br>
 On reconnaît la définition par récurrence d'une suite arithmétique de raison $${r}$.`,
                  `On cherche $n$ tel que $u_n > ${texNombre(u0 + k * r + 10, 0)}$.<br>   
Comme $(u_n)$ est une suite arithmétique de raison $${r}$ et de premier terme $${u0}$, alors pour tout entier naturel $n$, $u_n=${texNombre(u0, 0)}+${r}n$.
<br>
$\\begin{aligned}
u_n &> ${texNombre(u0 + k * r + 10, 0)} \\\\
${texNombre(u0, 0)}+${r}n&> ${texNombre(u0 + k * r + 10, 0)} \\\\
${r}n&>${texNombre(k * r + 10, 0)}\\\\
n&>\\dfrac{${texNombre(k * r + 10, 0)}}{${r}}
\\end{aligned}$<br>
$\\dfrac{${texNombre(k * r + 10, 0)}}{${r}}\\approx ${texNombre((k * r + 10) / r, 2)}$, c'est donc $${miseEnEvidence(Math.ceil((k * r + 10) / r))}$ ans après $2020$ que le salaire ${deDevant(quidam[0])} dépassera $${texNombre(u0 + k * r + 10, 0)}$, 
c'est-à-dire en $${texNombre(2020 + Math.ceil((k * r + 10) / r), 0)}$.`,
                  `Le salaire ${deDevant(quidam[1])} augmente tous les ans de $${p}\\,\\%$.<br>
On a donc pour tout entier naturel $n$, $v_{n+1}=${texNombre(cm, 2)}\\times v_n$.<br>
On reconnaît la définition par récurrence d'une suite géométrique de raison $${texNombre(cm, 2)}$.<br>
Comme son premier terme est $v_0=${texNombre(v0, 0)}$, alors pour tout entier naturel $n$, $v_n=${texNombre(v0, 0)}\\times ${texNombre(cm, 2)}^n$.
`,
                  `Le salaire ${deDevant(quidam[1])} en $${annee}$ est donné par $v_{${texNombre(annee - 2020, 0)}}$. <br>
$v_{${texNombre(annee - 2020, 0)}}=${texNombre(v0, 0)}\\times ${texNombre(cm, 2)}^{${texNombre(annee - 2020, 0)}}\\approx
 ${texNombre(new Decimal(cm).pow(annee - 2020).mul(v0), 2)}$<br>
 En $${annee}$, ${quidam[1]} gagne $${texNombre(new Decimal(cm).pow(annee - 2020).mul(v0), 2)}$ € par an.
 `,
                ],
                style: 'alpha',
              }),
              `Le programme ci-dessous permet de déterminer à partir de quelle année le salaire ${deDevant(quidam[1])} dépassera celui ${deDevant(quidam[0])}${sp()}:<br>
              ${scriptPython(
                `def algo():
  A = ${u0}
  B = ${v0}
  n = 0
  while A >= B :
   A = A+${r}
   B = B*${cm}
   n = n+1
  return n`,
                6,
              )}<br>
  En utilisant une calcultarice, on obtient le tableau suivant${sp()}: <br>
            $\\begin{array}{|c|c|c|}\n \\hline\n
            \n n&u_n &v_n \\\\\n \\hline\n
            \n ${n1}&${texNombre(new Decimal(u1).sub(r), 0)} &${texNombre(new Decimal(v1).div(cm), 1)}\\\\\n \\hline\n
            \n ${n1 + 1}&${texNombre(new Decimal(u1), 0)} &${texNombre(new Decimal(v1), 1)}\\\\\n \\hline\n
            \\end{array}\n$<br>
            C'est donc $${miseEnEvidence(n1 + 1)}$ ans après $2020$ que le salaire ${deDevant(quidam[1])} dépassera celui ${deDevant(quidam[0])}, soit en $${miseEnEvidence(texNombre(2020 + n1 + 1, 0))}$.`,
            ],
            style: 'nombres',
          })

          break

        default:
          {
            // population d'abeilles
            r = randint(28, 39) * 10
            a = randint(1, 3) // nombre d'années après annee pour lecture d'image
            annee = randint(2021, 2024)
            u0 = randint(71, 75) * 100
            b = randint(3, 4) // valeur pour le seuil
            c = choice([4, 5, 8]) // indice de la valeur du terme donné pour calculer la raison
            limite = arrondi((u0 + b * r) / 100, 0) * 100 + 100
            nbre = randint(9, 11) * 1000 // nbre d'abeilles pour produire du miel
            point1 = pointAbstrait(0, u0 / 100)
            point2 = pointAbstrait(4, u0 / 100 + 0.01 * r)
            point3 = pointAbstrait(8, u0 / 100 + 0.02 * r)
            point4 = pointAbstrait(12, u0 / 100 + 0.03 * r)
            point5 = pointAbstrait(16, u0 / 100 + 0.04 * r)
            point6 = pointAbstrait(20, u0 / 100 + 0.05 * r)
            /* r1 = repere({
              xMin: 0,
              xMax: 6,
              yMin: 7000,
              yMax: u0 + 6 * r,
              xUnite: 4,
              yUnite: 0.01,
              xThickDistance: 1,
              yThickDistance: 200,
              xLabelMin: 0,
              yLabelMin: 6500,
              yLabelEcart: 1.3,
              grilleXDistance: 4,
              grilleYDistance: 1
            })
              */
            r1 = new RepereBuilder({
              xMin: 0,
              xMax: 6,
              yMin: 7000,
              yMax: u0 + 6 * r,
            })
              .setGrille({
                grilleX: { dx: 4, xMin: 0, xMax: 6 },
                grilleY: { dy: 2, yMin: 7000, yMax: u0 + 6 * r },
              })
              .setUniteX(4)
              .setUniteY(0.01)
              .setThickY({ yMin: 7000, yMax: u0 + 6 * r, dy: 200 })
              .setThickX({ xMin: 0, xMax: 6, dx: 1 })
              .setLabelY({ yMin: 7000, yMax: u0 + 6 * r, dy: 200 })
            r1.yLabelEcart = 1.5

            const monRepere = r1.buildCustom()
            const objets = [
              monRepere,
              tracePoint(point1, point2, point3, point4, point5, point6),
            ]
            graphique = mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 15,
                  scale: 0.4,
                  display: 'inline-block',
                } as const,
                fixeBordures(objets),
              ),
              objets,
            )
            u1 = u0
            n1 = 0
            for (let indice = 0; u1 < nbre; indice++) {
              u1 = u1 + r
              n1 = indice + 1
            }
            if (context.isHtml) {
              texte = `En $${annee}$, une ruche est composée de $${texNombre(u0, 0)}$ abeilles dont une reine.<br>
          On modélise, à partir de cette année, le nombre d'abeilles dans la ruche par une suite $(u_n)$.<br>
          Le graphique ci-dessous représente les premières valeurs de $u_n$ donnant le nombre d'abeilles de cette ruche prévues en $${annee}+n$.<br>
          ${graphique}`
            } else {
              texte = `En $${annee}$, une ruche est composée de $${texNombre(u0, 0)}$ abeilles dont une reine.<br>
          On modélise, à partir de cette année, le nombre d'abeilles dans la ruche par une suite $(u_n)$.<br>
          Le graphique ci-dessous représente les premières valeurs de $u_n$ donnant le nombre d'abeilles de cette ruche prévues en $${annee}+n$.<br>
          \\begin{tikzpicture}
  \\begin{axis}[%
      /pgf/number format/.cd, % trois lignes pour un format de nombre à la française pour les grand nombres
      use comma,
      1000 sep={\\,},
      axis y line=center,axis x line=middle,% pour avoir les axes cenré sur l'origine
      x=1.5cm,y=0.003cm,% unités sur les axes
      xmin=0,xmax=6,ymin=7200,ymax=${u0 + 6 * r},% bornes du repère
      xtick distance=1,ytick distance =200,% nombre d'unités entre deux laabels
      minor y tick num = 1, % sous grille supplémentaire (indiquer le nombre de trait entre deux graduations)
      minor grid style = {thin, black!10}, % style des traits pour la sous-grille
      grid=both,%
      tick label style={font=\\scriptsize,black!50}, % description des styles des labels sur les axes
    ]
    \\addplot+[only marks,mark=+,mark size=3pt,red,thick,domain=0:5,samples={6}] {${r}*x+${u0}};
  \\end{axis}
\\end{tikzpicture}`
            }
            texte += createList({
              items: [
                'Avec la précision permise par ce graphique, répondre aux questions suivantes.' +
                  createList({
                    items: [
                      `Quel est le nombre d'abeilles prévues en $${annee + a}$${sp()}?`,
                      `En quelle année le nombre d'abeilles dans la ruche dépassera $${texNombre(limite, 0)}$ abeilles${sp()}?`,
                      `Pourquoi peut-on conjecturer que le suite $(u_n)$ est une suite arithmétique${sp()}?`,
                    ],
                    style: 'alpha',
                  }),
                `En admettant que la suite $(u_n)$ est une suite arithmétique et que $u_{${c}}=${texNombre(u0 + c * r, 0)}$, déterminer la raison de la suite $(u_n)$.<br>
                  Justifier en écrivant le(s) calcul(s).`,
                `Une ruche produit du miel si au moins $${texNombre(nbre, 0)}$ abeilles l'habitent.<br>
                  À partir de combien d'années cette ruche produira-t-elle du miel${sp()}? Justifier.`,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                createList({
                  items: [
                    `On lit l'ordonnée du point d'abscisse $${a}$.<br>
 Ainsi, d'après le graphique, le nombre d'abeilles prévues en $${annee + a}$ est $${texNombre(arrondi((u0 + a * r) / 10, 0) * 10, 0)}$.`,
                    `Les ordonnées des points dépassent $${texNombre(limite, 0)}$ à partir de $n=${b + 1}$.<br>
C'est donc en $${miseEnEvidence(annee + b + 1)}$ que le nombre d'abeilles dépassera $${texNombre(limite, 0)}$.`,
                    'Les points sur le graphique sont alignés, on conjecture que la suite est arithmétique.',
                  ],
                  style: 'alpha',
                }),
                `La raison $r$ de la suite est donnée par${sp()}: $r=\\dfrac{u_{${c}}-u_0}{${c}}$.<br>
              $r=\\dfrac{${texNombre(u0 + c * r, 0)}-${texNombre(u0, 0)}}{${c}}=${texNombre(r, 0)}$.
              `,
                `L'expression du terme général de la suite $(u_n)$ est $u_n=${miseEnEvidence(`${texNombre(u0, 0)}+n\\times ${r}`)}$.<br>
              On cherche $n$ tel que $${texNombre(u0, 0)}+n\\times ${r}>${texNombre(nbre, 0)}$.<br>
              $\\begin{aligned}
              ${texNombre(u0, 0)}+n\\times ${r}&>${texNombre(nbre, 0)}\\\\
              n&>\\dfrac{${texNombre(nbre, 0)}-${texNombre(u0, 0)}}{${r}}\\\\
              n&>\\dfrac{${texNombre(nbre - u0, 0)}}{${r}}
              \\end{aligned}$<br>
              Comme $\\dfrac{${texNombre(nbre - u0, 0)}}{${r}}
              ${(nbre - u0) % r === 0 ? '=' : '\\approx'} ${texNombre(arrondi((nbre - u0) / r, 1), 1)}$, c'est à partir de la 
              
              ${(nbre - u0) % r === 0 ? `$${n1 + 1}$` : `$${n1}$`}e année après $${annee}$ que la ruche produira du miel, soit en ${(nbre - u0) % r === 0 ? `$${annee + n1 + 1}$` : `$${annee + n1}$`}.`,
              ],
              style: 'nombres',
            })
          }
          break
      }

      if (this.questionJamaisPosee(i, b, u0)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
