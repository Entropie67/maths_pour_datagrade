import Decimal from 'decimal.js'
import { antecedentParDichotomie } from '../../lib/2d/antecedentParDichotomie'
import { courbe } from '../../lib/2d/Courbe'
import { courbeInterpolee } from '../../lib/2d/CourbeInterpolee.1'
import { droiteParPointEtPente } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusByPlusC,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { prenom, prenomM } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Modéliser une situation à l'aide d'une fonction"
export const dateDePublication = '14/02/2023'
export const dateDeModifImportante = '13/12/2024'
/**
 *
 * @author Gilles Mora

*/
export const uuid = '5621b'

export const refs = {
  'fr-fr': ['2F31-1'],
  'fr-ch': ['11CTFA2H-13', '11LCFA2H-2', '11LSFA2H-2'],
}
export default class EtudeFctPoly3 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '12'
    this.spacing = 1.5
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : La salle de sport',
        '2 : Location de voitures',
        '3 : Distance de freinage',
        '4 : Abonnement à une revue',
        '5 : Station service',
        '6 : La moto',
        '7 : Alcool dans le sang',
        '8 : Pression artérielle',
        '9 : Le silo à grains',
        '10 : Le hand-spinner',
        "11 : La facture d'eau",
        '12 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 11,
      melange: 12,
      defaut: 12,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const nomF = [['f'], ['g'], ['h'], ['u'], ['v'], ['w']]
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: // salle de sport deux formules
          {
            const a = randint(11, 13)
            const dec1 = randint(1, 9) / 10
            const b = new Decimal(randint(5, 6)).add(dec1)
            const c = randint(20, 25)
            const dec2 = randint(4, 7) / 10
            const d = new Decimal(randint(4, 4)).add(dec2)
            const P = prenomM()
            const T = randint(30, 70)
            const e = randint(35, 37)

            texte = ` Dans une salle de sport, deux formules sont proposées :<br>
            ${texteGras('Formule A :')} abonnement mensuel de $${a}$ € puis $${texPrix(b)}$ € par séance ;<br>
            ${texteGras('Formule B :')} abonnement mensuel de $${c}$ € puis $${texPrix(d)}$ € par séance.<br>
            Le nombre de séances mensuelles ne peut excéder $${e}$. <br>
            On note $x$ le nombre de séances mensuelles d'un abonné, $f(x)$ le prix payé avec la formule A et $g(x)$ le prix payé avec la formule B.<br>
            `
            texte += createList({
              items: [
                " Donner l'ensemble de définition des fonctions $f$ et $g$.",
                ' Exprimer en fonction de $x$, $f(x)$, puis $g(x)$.',
                `${P} choisit une formule mais ne veut pas dépenser plus de $${T}$ € pour un mois.<br>
                Quelle formule lui conseiller s'il veut faire le maximum de séances de sport dans le mois ?`,
                ' À partir de combien de séances mensuelles, la formule B est-elle plus avantageuse ?',
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                `Le nombre minimal de séances dans le mois est $0$ et le nombre maximal est $${e}$, donc l'ensemble de définition des fonctions $f$ et $g$ est l'ensemble des entiers de l'intervalle $[0\\,;\\,${e}]$.`,
                ` Les formules comprennent un abonnement fixe et un tarif particulier pour une séance. <br>
          Ainsi, le montant mensuel pour une formule est : Abonnement + Coût d'une séance $\\times$ Nombre de séances. <br>
          La fonction $f$ est définie par $f(x)=${a}+${texPrix(b)}x$ et la fonction $g$ est définie par $g(x)=${miseEnEvidence(`${c}+${texPrix(d)}x`)}$.`,
                ` On cherche le nombre de séances maximum que l'on peut faire avec $${T}$ € avec les formule A et B.<br>
          Pour la formule A, on cherche $x$ tel que $f(x)\\leqslant${T}$.<br>
          $\\begin{aligned}
${a}+${texPrix(b)}x&\\leqslant${T}\\\\
${texPrix(b)}x&\\leqslant ${T}-${a}${sp(8)} \\text{(On retranche ${a} à chaque membre)} \\\\
${texPrix(b)}x&\\leqslant ${T - a}\\\\
x&\\leqslant \\dfrac{${T - a}}{${texPrix(b)}}${sp(8)}\\text{(On divise par ${texPrix(b)} chaque membre)}
\\end{aligned}$
<br>
Le plus grand entier inférieur ou égal à $\\dfrac{${T - a}}{${texPrix(b)}}$ est $${new Decimal(T - a).div(b).floor()}$.<br>
Avec la formule A, ${P} pourra faire au maximum $${miseEnEvidence(new Decimal(T - a).div(b).floor().toString())}$ séances.<br><br>
Pour la formule B, on cherche $x$ tel que $g(x)\\leqslant${T}$.<br>
$\\begin{aligned}
${c}+${texPrix(d)}x&\\leqslant${T}\\\\
${texPrix(d)}x&\\leqslant ${T}-${c}${sp(8)} \\text{(On retranche ${c} à chaque membre)} \\\\
${texPrix(d)}x&\\leqslant ${T - c}\\\\
x&\\leqslant \\dfrac{${T - c}}{${texPrix(d)}}${sp(8)} \\text{(On divise par ${texPrix(d)} chaque membre)}
\\end{aligned}$
<br>
Le plus grand entier inférieur ou égal à $\\dfrac{${T - c}}{${texPrix(d)}}$ est $${new Decimal(T - c).div(d).floor()}$.<br>
Avec la formule B, ${P} pourra faire au maximum $${miseEnEvidence(new Decimal(T - c).div(d).floor().toString())}$ séances.<br><br>
               ${texteGras('Conclusion : ')} ${
                 new Decimal(T - c)
                   .div(d)
                   .floor()
                   .equals(new Decimal(T - a).div(b).floor())
                   ? `Les formules A et B permettent de faire autant de séances. Il n'y a donc pas de formule avantageuse dans ce cas.`
                   : new Decimal(T - c).div(d).floor() <
                       new Decimal(T - a).div(b).floor()
                     ? `La formule A permet de faire plus de séances, elle est plus avanatgeuse pour ${P}.`
                     : `La formule B permet de faire plus de séances, elle est plus avanatgeuse pour ${P}.`
               } 
          `,
                ` La formule B est plus avantageuse que la formule A lorsque $g(x)$ est strictement inférieure à $f(x)$.<br>
            ${sp(8)} $\\begin{aligned}
            ${c}+${texPrix(d)}x&<${a}+${texPrix(b)}x\\\\
            ${texPrix(d)}x&< ${a}+${texPrix(b)}x-${c}${sp(8)}\\text{(On retranche ${c} à chaque membre)} \\\\
            ${texPrix(d)}x-${texPrix(b)}x&< ${a - c}${sp(8)}\\text{(On retranche ${texPrix(b)} }x\\text{ à chaque membre)} \\\\
            ${texPrix(d.sub(b))}x&<${a - c}\\\\
            x&> \\dfrac{${a - c}}{${texPrix(d.sub(b))}}${sp(8)}\\text{(On divise par } ${texNombre(d.sub(b), 2)} < 0 \\text{ chaque membre)}\\\\
            x&> \\dfrac{${c - a}}{${texPrix(b.sub(d))}} \\end{aligned}$<br>
            Le plus grand entier supérieur à $\\dfrac{${c - a}}{${texPrix(b.sub(d))}}$ est 
            $${new Decimal(a - c).div(d.sub(b)).floor().add(1)}$.<br>
            La formule B est plus intéressante que la formule A à partir de $${new Decimal(a - c).div(d.sub(b)).floor().add(1)}$ séances.`,
              ],
              style: 'nombres',
            })
          }
          break

        case 2: // salle de sport deux formules
          {
            const a = randint(80, 120) // forfait
            const c = new Decimal(randint(41, 65, [50, 60])).div(100) // prix /km
            const km = randint(7, 10) * 100 // $\\text{km}$ max
            const d = randint(50, 400) // nbre km
            const prix = new Decimal(c).mul(d).add(a) // prix payé

            texte = ` Une société de location de véhicules particuliers propose le tarif suivant pour un week-end de location :<br>
          ${texteGras('TARIF WEEK-END :')} forfait de $${a}$ € puis $${texNombre(c, 2)}$ € par $\\text{km}$ parcouru (dans la limite de $${texNombre(km, 0)}\\text{ km}$).<br>
          On note $x$ le nombre de $\\text{km}$ parcourus par un client au cours d'un week-end et on considère la fonction $T$ qui à chaque valeur de $x$ associe le prix payé par le client.<br>`
            texte += createList({
              items: [
                "Donner l'ensemble de définition de la fonction $T$.",
                ' Exprimer $T(x)$ en fonction de $x$.',
                ` Résoudre l'équation $T(x)=${texNombre(prix, 2)}$.
          Interpréter ce résultat dans le contexte de l'exercice. `,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` On ne peut pas faire plus de $${texNombre(km)}\\text{ km}$ durant le week-end, ainsi l'ensemble de 
                  définition de la fonction $T$ est $[0\\,;\\,${texNombre(km)}]$.`,
                ` Le tarif comprend un forfait fixe et un tarif par $\\text{km}$ parcouru. <br>
          Ainsi, le montant de la location est : 
          Forfait + Coût d'un $\\text{km}$ $\\times$ Nombre de $\\text{km}$ parcourus, soit $T(x)=${miseEnEvidence(`${a}+${texNombre(c, 2)}x`)}$.`,
                ` On résout l'équation $T(x)=${texNombre(prix, 2)}$.<br>
          $\\begin{aligned}
          ${a}+${texNombre(c, 2)}x&=${texNombre(prix, 2)}\\\\
          ${texNombre(c, 2)}x&= ${texNombre(prix, 2)}-${a}${sp(8)} \\text{(On retranche ${a} à chaque membre)} \\\\
x&=\\dfrac{${texNombre(new Decimal(prix).sub(a), 2)}}{${texNombre(c, 2)}}${sp(8)}\\text{(On divise par ${texNombre(c, 2)} chaque membre)}\\\\
x&=${texNombre(d, 0)}
\\end{aligned}$<br>
L'équation a pour solution $${texNombre(d, 2)}$.<br>
On peut dire que lorsque le prix payé pour la location est $${texNombre(prix, 2)}$ €, le client a parcouru $${miseEnEvidence(texNombre(d, 0))}\\text{ km}$ durant le week-end.`,
              ],
              style: 'nombres',
            })
          }
          break

        case 3: // distance de freinage
          {
            const a = new Decimal(randint(2011, 2035)).div(10) //
            const b = randint(30, 80)
            const v = new Decimal(randint(70, 100)) //

            texte = `  Sur route sèche, la distance de freinage en mètres, d'une voiture est modélisée de la façon suivante : <br>
          en notant $v$ la vitesse du véhicule (en $\\text{km/h}$), sa distance de freinage $d(v)$ (en $\\text{m}$) est donnée par le carré de sa vitesse divisée par $${texNombre(a, 1)}$.`

            texte += createList({
              items: [
                " Donner l'expression de $d(v)$ en fonction de $v$. ",
                ` Calculer au mètre près, la distance de freinage de la voiture si elle roule à $${v}\\text{ km/h}$.`,
                ' La distance de freinage est-elle proportionnelle à la vitesse ?',
                ` La distance de freinage de cette voiture a été de $${b}\\text{ m}$. Quelle était sa vitesse en $\\text{km/h}$ arrondie à l'unité ? `,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` Le carré de la vitesse est $v^2$, donc la fonction $d$ est définie par : $d(v)=${miseEnEvidence(`\\dfrac{v^2}{${texNombre(a, 1)}}`)}$. `,
                ` $d(${v})=\\dfrac{${v}^2}{${texNombre(a, 1)}}\\approx ${texNombre(new Decimal(v.pow(2).div(a)), 0)}$. La distance de freinage est d'environ $${miseEnEvidence(texNombre(new Decimal(v.pow(2).div(a)), 0))}$.`,
                " La distance de freinage n'est pas proportionnelle à la vitesse car la fonction $d$ n'est pas une fonction linéaire. Elle ne traduit pas une situation de proportionnalité.",
                ` On cherche $v$ tel que $d(v)=${b}$.<br>
                    $\\begin{aligned}
\\dfrac{v^2}{${texNombre(a, 1)}}&=${b}\\\\
v^2&=${b} \\times ${texNombre(a, 2)} ${sp(8)} \\text{(On multiplie par }${texNombre(a, 1)}\\text{ chaque membre)} \\\\
v^2&= ${texNombre(new Decimal(b).mul(a), 2)}\\\\
v&= -\\sqrt{${texNombre(new Decimal(b).mul(a), 2)}} ${sp(8)} \\text{ou} ${sp(8)} v= \\sqrt{${texNombre(new Decimal(b).mul(a), 2)}}${sp(8)}\\text{(deux nombres ont pour carré } ${texNombre(new Decimal(b).mul(a), 2)} \\text{)}
\\end{aligned}$<br>
Puisque $v$ est un nombre positif, on en déduit $v= \\sqrt{${texNombre(new Decimal(b).mul(a), 2)}}\\approx ${new Decimal(b).mul(a).sqrt().round()}$.<br>
Lorsque la distance de freinage de la voiture est $${b}\\text{ m}$, sa vitesse est alors d'environ $${miseEnEvidence(new Decimal(b).mul(a).sqrt().round().toString())}\\text{ km/h}$.<br>
`,
              ],
              style: 'nombres',
            })
          }
          break
        case 4: // abonnement à une revue
          {
            const nom = choice(nomF)
            const a = randint(6, 10) * 1000 //
            const b = choice([40, 50, 80, 100])
            const c = randint(31, 49) * 100 //
            const d = randint(30, 39) * 10

            texte = ` Le nombre d'abonnés à une revue dépend du prix de l'abonnement à cette revue, prix exprimé en euros.<br>
          On considère que l'on a la relation : <br>
          nombre d'abonnés $= ${texNombre(a)} - ${b} \\times$ (prix de l'abonnement en euros).<br>
          Soit $${nom}$ la fonction qui donne le nombre d'abonnés en fonction du prix de l'abonnement annuel à cette revue.`

            texte += createList({
              items: [
                `Déterminer l'expression algébrique de $${nom}$. Préciser la variable.`,
                " Que peut-on dire du nombre d'abonnés lorsque le prix de l'abonnement augmente ?",
                ` Expliquer pourquoi le prix de l'abonnement ne doit pas être de $${d}$ €. Déterminer l'ensemble de définition de la fonction $${nom}$.`,
                ` La directrice des abonnements souhaite avoir $${texNombre(c)}$ abonnés à la revue. Quel doit être le prix de l'abonnement ?`,
                ` On obtient la recette de la vente de $x$ abonnements en multipliant le nombre d'abonnés par le prix d'un abonnement. <br>
               Exprimer la recette en fonction du prix de l'abonnement sous forme développée.`,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` En notant $x$ la variable, l'expression algébrique de $${nom}$ est : $${nom}(x)=${miseEnEvidence(`${texNombre(a)}-${b}x`)}$.`,
                ` La relation $${nom}(x)=${texNombre(a)}-${b}x$ montre que lorsque le prix de l'abonnement $x$ augmente, le nombre d'abonnés $${nom}(x)$ diminue. <br>
          Plus précisément, à chaque hausse de $1$ €, le nombre d'abonnés diminue de $${b}$ (coefficient devant $x$).`,

                ` Pour un montant de $${d}$ € de l'abonnement, on obtient $${nom}(${d})=${texNombre(a, 0)}-${b}\\times ${d}=${texNombre(a - b * d, 0)}$.<br>
          On obtiendrait alors un nombre d'abonnés négatif ce qui est impossible. On ne peut donc pas fixer le montant de l'abonnement à $${d}$ €.<br>
          On cherche la valeur de $x$ donnant un nombre d'abonnés nul en résolvant l'équation $${nom}(x)=0$ :<br>
          $\\begin{aligned}
          ${texNombre(a)}-${b}x&=0\\\\
         - ${b}x&= -${texNombre(a)}${sp(8)} \\text{(On retranche ${texNombre(a)} à chaque membre)} \\\\
x&=\\dfrac{${texNombre(-a)}}{${-b}}${sp(8)}\\text{(On divise par } ${-b} \\text{ chaque membre)}\\\\
x&=\\dfrac{${texNombre(a)}}{${b}}\\\\
x&=${texNombre(a / b, 2)}
\\end{aligned}$<br>
On en déduit que le montant de l'abonnement doit se situer entre $0$ € et $${texNombre(a / b, 2)}$ €. <br>
Par conséquent l'ensemble de définition de la fonction $${nom}$ est : $${miseEnEvidence(`[0\\,;\\,${texNombre(a / b, 2)}]`)}$.`,
                ` On cherche la valeur de $x$ afin que $${nom}(x)=${texNombre(c)}$.<br>
          $\\begin{aligned}
          ${texNombre(a)}-${b}x&=${texNombre(c)}\\\\
         - ${b}x&= ${texNombre(c)}-${texNombre(a)}${sp(8)} \\text{(On retranche ${texNombre(a)} à chaque membre)} \\\\
x&=\\dfrac{${texNombre(-a + c)}}{${-b}}${sp(8)}\\text{(On divise par } ${-b} \\text{ chaque membre)}\\\\
x&=\\dfrac{${texNombre(a - c)}}{${b}}\\\\
x&=${texNombre((a - c) / b, 2)}
\\end{aligned}$<br>
Pour avoir $${texNombre(c)}$ abonnés, la directrice des abonnements doit fixer le prix de l'abonnement à $${miseEnEvidence(texPrix((a - c) / b))}$ €.`,
                ` Comme $x$ désigne le montant de l'abonnement et $${nom}(x)$ le nombre d'abonnés, le produit du nombre d'abonnés par le prix d'un abonnement est $${nom}(x)\\times x$, soit $(${texNombre(a)}-${b}x)\\times x$.<br>
          Son expression développée est : $${miseEnEvidence(`${texNombre(a)}x-${b}x^2`)}$.`,
              ],
              style: 'nombres',
            })
          }
          break
        case 5: // station service
          {
            const a = new Decimal(randint(150, 200)).div(100) //
            const b = randint(3, 6)
            const c = choice([40, 45, 50, 55, 60, 65, 70])
            const d = randint(b, c)
            const prix = new Decimal(a).mul(d)
            const P = prenom()
            const nom = choice(nomF)

            texte = ` Dans une station service, le prix de l'essence sans plomb $95$ est de $${texNombre(a)}$ € le litre.<br>
Dans cette station, il n'est pas possible de prendre moins de $${b}$ litres d'essence.<br>
${P} fait le plein de sa voiture dans cette station service. Le réservoir de sa voiture est vide et peut contenir au maximum $${c}$ litres.<br>

On note $x$ le nombre de litres que met ${P} pour faire le plein du réservoir de sa voiture. <br>
On considère la fonction $${nom}$ qui associe à chaque valeur de $x$, le prix payé en euros par ${P}.`

            texte += createList({
              items: [
                `Donner l'ensemble de définition de la fonction $${nom}$. `,
                ` Déterminer l'expression algébrique de la fonction $${nom}$ (c'est-à-dire l'expression de $${nom}(x)$ en fonction de $x$).`,
                ' Le prix payé est-il proportionnel au nombre de litres mis dans le réservoir ? Justifier.',
                ` Résoudre l'équation $${nom}(x)=${texNombre(prix, 2)}$. Interpréter ce résultat dans le contexte de l'exercice. `,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` Le minimum de litres que ${P} peut mettre est $${b}$ et le maximum est $${c}$. <br>
            L'ensemble de définition de $${nom}$ est donc $[${b}\\,;\\,${c}]$.`,
                ` Pour obtenir le prix payé, on multiplie le nombre de litres par le prix d'un litre. <br>
            Ainsi, l'expression algébrique de $${nom}$ est : $${nom}(x)=${texNombre(a, 2)}\\times x$, soit $${nom}(x)=${miseEnEvidence(`${texNombre(a, 2)}x`)}$.`,
                ` Le prix payé est proportionnel au nombre de litres. La fonction $${nom}$ est une fonction linéaire traduisant une situation de proportionnalité.`,
                ` On cherche $x$ tel que $${nom}(x)=${texNombre(prix, 2)}$.<br>
            $\\begin{aligned}
                      ${texNombre(a, 2)}x&=${texNombre(prix, 2)}\\\\
  x&=\\dfrac{${texNombre(prix, 2)}}{${texNombre(a, 2)}} ${sp(8)} \\text{(On divise par ${texNombre(a, 2)} chaque membre)} \\\\
  x&= ${d}
    \\end{aligned}$<br>
  Pour $${d}$ litres mis dans le réservoir, le coût est de $${miseEnEvidence(texNombre(prix, 2))}$ €.`,
              ],
              style: 'nombres',
            })
          }
          break

        case 6: // la moto
          {
            const a = new Decimal(randint(-5, -2)) //
            const b = new Decimal(randint(-15, -10)).div(10)
            const c = new Decimal(randint(-39, -25)).div(10)
            const P = prenomM()
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const TexteX = latex2d('\\text{Temps (en s)}', 9, -0.7, {
              letterSize: 'scriptsize',
            })
            const TexteY = latex2d('\\text{Hauteur (en m)}', 1, 7, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: 0,
              yMin: 0,
              yMax: 3,
              xMax: 5,
              xUnite: 2,
              yUnite: 2,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickMax: 0,
              yThickMax: 0,
            })
            const f = (x: number) => -0.5 * (x + 1) * (x - 4)

            const graphique = mathalea2d(
              {
                xmin: -1,
                xmax: 13,
                ymin: -1.2,
                ymax: 7,
                pixelsParCm: 20,
                scale: 0.7,
                center: !context.isHtml,
              },
              courbe(f, {
                repere: r1,
                xMin: 0,
                xMax: 4,
                color: bleuMathalea,
                epaisseur: 2,
                step: 0.2,
              }),
              TexteX,
              TexteY,
              r1,
              o,
            )
            texte = ` Lors d'une course en moto-cross, après avoir franchi une rampe, ${P} a effectué un saut en moto.
          On note $t$ la durée (en secondes) de ce saut.<br>
          Le saut commence dès que ${P} quitte la rampe c'est-à-dire lorsque $t=0$.<br>
          La hauteur (en mètres) en fonction de la durée $t$ est donnée par la fonction $${nom}$ défine par : $${nom}(t)=(${texNombre(a, 3)}t${texNombre(b, 2)})(t${texNombre(c, 2)})$.<br>
          Voici la courbe représentative de cette fonction $${nom}$ :<br><br>
          `
            texte += `${graphique}`
            texte += createList({
              items: [
                ` Calculer $${nom}(4)$. Que peut-on en déduire ?`,
                ` À quelle hauteur ${P} se trouve-t-il lorsqu'il quitte la rampe ?`,
                ` Combien de temps dure le saut de ${P} ?`,
                ` Développer et réduire l'expression de $${nom}$.`,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` $${nom}(4)=(${texNombre(a, 3)}\\times 4${texNombre(b, 2)})(4 ${texNombre(c, 2)})=
                  ${texNombre(a.mul(4).plus(b), 2)}\\times ${texNombre(c.plus(4), 2)}
                  =${texNombre(new Decimal(a).mul(4).plus(b).mul(c.plus(4)), 2)}$<br>
                  
                  Comme le résultat est négatif, on en déduit que le saut dure moins de $4$ secondes.`,
                ` La hauteur du début du saut est donnée par : $${nom}(0)=(${texNombre(a, 3)}\\times 0${texNombre(b, 2)})(0 ${texNombre(c, 2)})
                    =${texNombre(b.mul(c), 2)}$.<br>
                     ${P} se trouve à $${miseEnEvidence(texNombre(b.mul(c), 2))}$ mètres au début du saut.`,
                ` Le saut commence à $t=0$ et se termine lorsque ${P} se retrouve au sol, c'est-à-dire lorsque la hauteur est nulle. <br>
                    Ainsi, le temps du saut est donnée par la solution positive de l'équation $(${texNombre(a, 3)}t${texNombre(b, 2)})(t${texNombre(c, 2)})=0$<br>
                    Il s'agit d'une équation produit nul qui a deux solutions : $t_1= -\\dfrac{${texNombre(-b, 2)}}{${texNombre(-a, 2)}}$ (valeur négative) et $t_2= ${texNombre(-c, 2)}$. <br>
                    Le saut dure $${texNombre(-c, 2)}$ secondes.`,
                `On développe en utilisant la double distributivité :<br>
                    $\\begin{aligned}
                    ${nom}(t)&=(${texNombre(a, 3)}t${texNombre(b, 2)})(t${texNombre(c, 2)})\\\\
                    &=${texNombre(a, 3)}t^2+${texNombre(a.mul(c), 3)}t${ecritureAlgebriqueSauf1(b)}t+${texNombre(b.mul(c), 2)}\\\\
                    &=${miseEnEvidence(reduireAxPlusByPlusC(a, a.mul(c).plus(b), b.mul(c), 't^2', 't'))}     
                  \\end{aligned}$`,
              ],
              style: 'nombres',
            })
          }
          break

        case 7: // alcool
          {
            const a = randint(17, 21) / 10 //
            const b = randint(-10, -5) / 10 //
            const h = choice([11, 12, 13, 17, 18]) //
            const nom = choice(nomF)
            const o = texteParPosition('O', -0.3, -0.3)
            const f = (x: number) => a * x * Math.exp(b * x)
            const fprime = (x: number) => (a + a * b * x) * Math.exp(b * x)
            const Cg = droiteParPointEtPente(pointAbstrait(0, 5), 0, '', 'red')
            Cg.epaisseur = 2
            const s0 = antecedentParDichotomie(0, 7, fprime, 0, 0.01)
            if (s0 === false) {
              window.notify(
                "antecedentParDichotomie n'a pas trouvé d'antécédent",
                { s0 },
              )
              continue
            }
            const s1 = antecedentParDichotomie(0, s0 * 1.5, f, 0.5, 0.01)
            if (s1 === false) {
              window.notify(
                "antecedentParDichotomie n'a pas trouvé d'antécédent",
                { s0, s1 },
              )
              continue
            }
            const s2 = antecedentParDichotomie(s0 * 1.5, 6 * 1.5, f, 0.5, 0.01)
            if (s2 === false) {
              window.notify(
                "antecedentParDichotomie n'a pas trouvé d'antécédent",
                { s0, s1, s2 },
              )
              continue
            }
            const r1 = repere({
              xMin: 0,
              yMin: 0,
              yMax: f(-1 / b) + 0.2,
              xMax: 10,
              xUnite: 1,
              yUnite: 10,
              axeXStyle: '->',
              axeYStyle: '->',
              xThickDistance: 1,
              yThickDistance: 0.1,
              xLabelMin: 0,
              yLabelMin: 0,
              yLabelEcart: 1,
              xLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: 0,
              grilleYMin: 0,
              grilleXMax: 10,
              grilleYMax: f(s0) + 0.2,
            })

            const A = pointAbstrait(s0, f(s0) * 10)
            const Ax = pointAbstrait(A.x, 0)
            const sAAx = segment(A, Ax)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            const Ay = pointAbstrait(0, A.y)
            const sAAy = segment(A, Ay)
            sAAy.epaisseur = 2
            sAAy.pointilles = 5
            const B = pointAbstrait(s1, f(s1) * 10)
            const Bx = pointAbstrait(B.x, 0)
            const sBBx = segment(B, Bx)
            sBBx.epaisseur = 2
            sBBx.pointilles = 5

            const C = pointAbstrait(s2, f(s2) * 10)
            const Cx = pointAbstrait(C.x, 0)
            const sCCx = segment(C, Cx)
            sCCx.epaisseur = 2
            sCCx.pointilles = 5
            const sBxCx = segment(Bx, Cx, 'red')
            sBxCx.epaisseur = 5
            const Texte1 = latex2d(
              `Max = ${Math.round(f(s0) * 100) / 100}`,
              -3,
              A.y,
              { letterSize: 'scriptsize' },
            )
            const Texte2 = latex2d(`${Math.round(s0 * 10) / 10}`, A.x, -1, {
              letterSize: 'scriptsize',
            })
            const Texte3 = latex2d(`${Math.round(s1 * 10) / 10}`, B.x, -1, {
              letterSize: 'scriptsize',
            })
            const Texte4 = latex2d(`${Math.round(s2 * 10) / 10}`, C.x, -1, {
              letterSize: 'scriptsize',
            })
            const graphique = mathalea2d(
              {
                xmin: -2,
                xmax: 16,
                ymin: -1,
                ymax: (f(s0) + 0.2) * 10,
                pixelsParCm: 30,
                scale: 0.7,
                center: !context.isHtml,
              },
              [
                courbe(f, {
                  repere: r1,
                  xMin: 0,
                  xMax: 10,
                  color: bleuMathalea,
                  epaisseur: 2,
                  step: 0.15,
                }),
                r1,
                o,
              ],
            )
            const graphiqueCorr = mathalea2d(
              {
                xmin: -5,
                xmax: 16,
                ymin: -2.5,
                ymax: (f(s0) + 0.2) * 10,
                pixelsParCm: 30,
                scale: 0.7,
                center: !context.isHtml,
              },
              [
                courbe(f, {
                  repere: r1,
                  xMin: 0,
                  xMax: 9,
                  color: bleuMathalea,
                  epaisseur: 2,
                  step: 0.2,
                }),
                r1,
                o,
                sAAx,
                sAAy,
                sCCx,
                sBBx,
                sBxCx,
                Texte1,
                Texte2,
                Texte3,
                Texte4,
                Cg,
                r1,
                o,
              ],
            )

            texte = `Le Code de la route interdit toute conduite d'un véhicule lorsque le taux d'alcoolémie est supérieur ou égal à $0,5$ g/L.<br>
            Le taux d'alcoolémie d'une personne pendant les $10$ heures suivant la consommation d'une certaine quantité d'alcool est modélisé par la fonction $${nom}$.<br>
          $\\bullet$ $t$ représente le temps (exprimé en heure) écoulé depuis la consommation d'alcool ;<br>
          $\\bullet$ $${nom} (t)$ représente le taux d'alcoolémie (exprimé en g/L) de cette personne.<br>
          On donne la représentation graphique de la fonction $${nom}$ dans un repère. <br>`
            texte += `${graphique}`

            texte += createList({
              items: [
                `
                  À quel instant le taux d'alcoolémie de cette personne est-il maximal ? <br>Quelle est alors sa valeur ? Arrondir
                au centième.`,
                `Résoudre graphiquement l'inéquation $${nom}(t)>0,5$.`,
                ` À l'instant $t=0$, il était $${h}$ h. <br>À quelle heure, à la minute près, l'automobiliste peut-il reprendre le volant sans être en infraction ?`,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` Le taux d'alcoolémie maximal est atteint lorsque $t=${texNombre(Math.round(s0 * 10) / 10, 1)}$. Sa valeur
            est environ $${miseEnEvidence(texNombre(Math.round(f(s0) * 100) / 100, 2))}$.`,
                ` Les solutions de l'inéquation $${nom}(t)>0,5$ sont les abscisses respectives des points de la courbe qui se situent strictement en dessous de la droite d'équation $y=0,5$. <br>
            Cette inéquation a pour ensemble de solution $${miseEnEvidence(`]${texNombre(Math.round(s1 * 10) / 10, 1)}\\,;\\,${texNombre(Math.round(s2 * 10) / 10, 1)}[`)}$. <br>
              `,
                `${
                  Math.round(s2 * 10) / 10 === 2 ||
                  Math.round(s2 * 10) / 10 === 3 ||
                  Math.round(s2 * 10) / 10 === 4 ||
                  Math.round(s2 * 10) / 10 === 5 ||
                  Math.round(s2 * 10) / 10 === 6
                    ? ` L'automobiliste peut reprendre la route (sans être en infraction) $${Math.round(s2 * 10) / 10} \\text{ h }$ après la consommation de l'alcool,
              soit à $${Math.round(s2 * 10) / 10 + h} \\text{ h}$.<br><br>`
                    : ` $${texNombre(Math.round(s2 * 10) / 10, 1)}\\text{ h } =${Math.floor(s2)} \\text{ h } +${texNombre(Math.round(s2 * 10) / 10 - Math.floor(s2))}\\text{ h }$.<br>
              Or, $${texNombre(Math.round(s2 * 10) / 10 - Math.floor(s2))}\\text{ h }=${texNombre(Math.round(s2 * 10) / 10 - Math.floor(s2))}\\times 60 \\text{ min }=${texNombre((Math.round(s2 * 10) / 10 - Math.floor(s2)) * 60)} \\text{ min }$.<br>
               L'automobiliste peut reprendre la route (sans être en infraction) $${Math.floor(s2)} \\text{ h }$ et $${texNombre((Math.round(s2 * 10) / 10 - Math.floor(s2)) * 60)} \\text{ min }$ après la consommation de l'alcool,
              soit à $${Math.floor(s2 + h)} \\text{ h }$ et $${texNombre((Math.round(s2 * 10) / 10 - Math.floor(s2)) * 60)} \\text{ min}$.`
                }<br>
              ${graphiqueCorr}`,
              ],
              style: 'nombres',
            })
          }
          break

        case 8: // tension
          {
            const a = randint(100, 120)
            const b0 = randint(90, 98)
            const a1 = randint(10, 14) * 10
            const b1 = randint(60, 75) * 2
            const a2 = randint(25, 27) * 10
            const b2 = randint(48, 53) * 2
            const a3 = randint(38, 42) * 10
            const b3 = randint(55, 60) * 2
            const a4 = randint(50, 52) * 10
            const b4 = randint(43, 47) * 2
            const a5 = randint(56, 65) * 10
            const b5 = b4 + 5
            const nom = choice(nomF)
            const o = texteParPosition('O', 0, 15.5)
            const TexteX = texteParPosition(
              'Pression artérielle en mmHg',
              -2.4,
              24,
              -90,
              'black',
              1,
              'milieu',
              false,
              1,
            )
            const TexteY = latex2d(
              '\\text{Temps (en ms)}',
              670 * 0.03,
              72 * 0.2,
              { orientation: 0 },
            )

            const r1 = repere({
              xMin: 0,
              xMax: 800,
              yMin: 80,
              yMax: 150,
              xUnite: 0.03,
              yUnite: 0.2,
              xThickDistance: 50,
              yThickDistance: 10,
              xLabelMin: 0,
              yLabelMin: 80,
              yLabelEcart: 1,
              grilleXDistance: 50 * 0.03,
              grilleYDistance: 10 * 0.2,
            })

            const gr = courbeInterpolee(
              [
                [0, b0],
                [a1, b1],
                [a2, b2],
                [a3, b3],
                [a4, b4],
                [a5, b5],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: 0,
                xMax: 650,
                step: 2,
              },
            )

            const graphique = mathalea2d(
              {
                xmin: -3,
                xmax: 24,
                ymin: 15,
                ymax: 31,
                pixelsParCm: 20,
                scale: 0.5,
                center: !context.isHtml,
              },
              TexteX,
              TexteY,
              r1,
              o,
              gr,
            )

            texte = `La tonométrie artérielle permet d'obtenir une mesure continue de la pression artérielle. L'examen renseigne sur
          l'état des artères du patient dans le cadre du développement de l'hypertension artérielle. <br>
          Un enregistrement des mesures permet d'apprécier la courbe de pression artérielle.<br>
          On note $${nom}$ la fonction qui au temps $t$ en millisecondes (ms) associe la pression artérielle radiale $${nom}(t)$ en millimètres
          de mercure (mmHg), mesurée au repos chez un patient suspecté d'insuffisance cardiaque. On donne la courbe représentative de $${nom}$ ci-dessous.<br>`
            texte += `${graphique}`

            texte += createList({
              items: [
                `Quel est l'ensemble de définition de $${nom}$.`,
                ` Quelle inéquation a pour ensemble de solution l'imtervalle de temps pendant lequel la pression artérielle est supérieure ou égale à $${a}$ mmHg ?`,
                " Déterminer la valeur systolique mesurée, c'est-à-dire la valeur maximale de la pression artérielle.",
                " Déterminer la valeur diastolique mesurée, c'est-à-dire la valeur minimale de la pression artérielle.",
                ` Un patient est en hypertension artérielle lorsque la pression systolique est supérieure ou égale à $140$ mmHg
                        ou que la pression diastolique est supérieure ou égale à $90$ mmHg.<br>
                        Ce patient est-il en hypertension ? Justifier.`,
                ` La fonction $${nom}$ a été représentée sur un intervalle de temps correspondant à celui
                        d'un battement de cœur du patient.<br>On parle de tachycardie lorsque, au repos, le nombre de battements du cœur est supérieur à $100$ par minute. <br>
                        D'après cet examen, peut-on estimer que le patient souffre de tachycardie ?`,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                `L'ensemble de définition de $${nom}$ est $[0\\,;\\, ${a5}]$. `,
                ` L'inéquation ayant pour ensemble de solution l'imtervalle de temps pendant lequel la pression artérielle est supérieure ou égale à $${a}$ mmHg est $${nom}(t)\\geqslant ${a}$.`,
                ` La valeur systolique mesurée est donnée par l'ordonnée du point le plus haut de la courbe : $${b1}$ mmHg.`,
                ` La valeur diastolique mesurée est donnée par l'ordonnée du point le plus bas de la courbe : $${b4}$ mmHg.`,
                ` La valeur systolique est $${b1}$ mmHg, la valeur diastolique est $${b4}$ mmHg. <br>
              ${
                b1 >= 140 || b4 >= 90
                  ? b4 >= 90
                    ? `Comme $${b4} \\geqslant 90$, le patient est en hypertension artérielle.<br>`
                    : `Comme $${b1} \\geqslant 140$, le patient est en hypertension artérielle.<br>`
                  : `Comme $${b4} < 90$ et $${b1} < 140$, le patient n'est pas en hypertension artérielle.<br>`
              }`,
                `L'intervalle de temps est $[0\\,;\\, ${a5}]$, le temps d'un battement de cœur est donc $${a5}$ ms.<br>
                              Comme $${a5}$ ms $=${texNombre(a5 / 1000, 3)}$ s, en notant $n$ le nombre de battements en $1$ minute, on obtient le tableau de proportionnalité suivant :<br>
                               $\\begin{array}{|c|c|c|}\n \\hline\n
            \n\\text{Nombre de battements} &1 &n \\\\\n \\hline\n
            \n \\text{Temps (en s)}&${texNombre(a5 / 1000, 3)}&60 \\\\\n \\hline\n
            \\end{array}\n$
            <br>
             $n=${miseEnEvidence(`\\dfrac{60\\times 1}{${texNombre(a5 / 1000, 3)}}\\approx ${texNombre((60 * 1000) / a5, 0)}`)}$.<br>
             ${
               (60 * 1000) / a5 > 100
                 ? `Comme $${texNombre((60 * 1000) / a5, 0)}>100$, ce patient souffre de tachycardie.`
                 : `Comme $${texNombre((60 * 1000) / a5, 0)}\\leqslant 100$, ce patient ne souffre pas de tachycardie.`
             }`,
              ],
              style: 'nombres',
            })
          }
          break

        case 9: // le silo à grains
          {
            const m = new Decimal(randint(27, 38, 30)).add(
              choice([0.2, 0.4, 0.6, 0.8]),
            ) // kg de grains mangés par jour
            const p = new Decimal(m).mul(5).mul(randint(6, 11)) // capacité du silo
            const j = randint(15, 25, 20) // nbre de jours pour l'image
            const ant = m.mul(-1).mul(randint(12, 17)).add(p) // p - m * randint(12, 17)
            const rest = randint(251, 299)

            texte = ` Un éleveur de poulets décide de remplir son silo à grains.<br>
             En notant $t$ le nombre de jours écoulés après avoir rempli son silo à grains et $f(t)$ la masse (en $\\text{kg}$) restante 
            au bout de $t$ jours, on a : $f(t)=${texNombre(p, 0)}-${texNombre(m, 1)}t$<br>`

            texte += createList({
              items: [
                `Calculer l'image de $${j}$ par $f$. Interpréter le résultat dans le contexte de l'exercice.`,
                `Calculer l'antécédent de $${texNombre(ant, 1)}$ par $f$.<br>`,
                "Sachant que l'éleveur avait rempli son silo au maximum de sa capacité, quelle est la contenance (en $\\text{kg}$) du silo ?<br> ",
                " Au bout de combien de jours, l'éleveur sera-t-il à court de grains ? Justifier.<br> ",
                ' Quelle quantité de grains en kg consomment les poulets en une journée ?<br> ',
                ` Un jour, des renards ont tué la moitié des poulets, divisant par deux la quantité de grains consommée par jour.<br>
                  Il reste à l'éleveur $${rest}$ kg de grains. <br>
                  Donner la fonction qui modélise la quantité de grains restante en fonction du nombre de jours écoulés. <br>
                  On notera $g$ cette fonction. `,
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` $f(${j})=${texNombre(p, 0)}-${texNombre(m, 1)}\\times ${j}=${texNombre(new Decimal(p).sub(m.mul(j)), 2)}$.<br>
            Au bout de $${j}$ jours, il reste $${miseEnEvidence(texNombre(new Decimal(p).sub(m.mul(j)), 2))}$ kg de grains dans le silo.`,
                ` L'antécédent de $${texNombre(ant, 1)}$ est la solution de l'équation $f(x)=${texNombre(ant, 1)}$. <br>
          $\\begin{aligned}
          ${texNombre(p, 0)}-${texNombre(m, 1)}t&=${texNombre(ant, 1)}\\\\
          -${texNombre(m, 1)}t&=${texNombre(ant, 1)}-${texNombre(p, 0)}\\\\
         t&=\\dfrac{${texNombre(new Decimal(ant).sub(p), 1)}}{-${texNombre(m, 1)}}\\\\
         t&=${texNombre(new Decimal(p.sub(ant)).div(m), 1)}
          \\end{aligned}$<br>
          L'antécédent de $${texNombre(ant, 1)}$ est $${miseEnEvidence(texNombre(new Decimal(p.sub(ant)).div(m), 1))}$.
`,
                ` La contenance du silo est donnée par $f(0)$. <br>
          Comme $f(0)=${texNombre(p, 0)}-${texNombre(m, 1)}\\times 0=${texNombre(p, 0)}$, la contenance du silo est $${miseEnEvidence(texNombre(p, 0))}$ kg.
          `,
                ` On cherche $t$ tel que $f(t)=0$.<br>
$\\begin{aligned}
${texNombre(p, 0)}-${texNombre(m, 1)}t&=0\\\\
-${texNombre(m, 1)}x&=-${texNombre(p, 0)}\\\\
t&=\\dfrac{${texNombre(-p, 0)}}{-${texNombre(m, 1)}}\\\\
t&=${texNombre(-p / -m, 0)}
\\end{aligned}$<br>

Au bout de $${miseEnEvidence(texNombre(new Decimal(p).div(m), 0))}$ jours, l'éleveur sera à court de grains.`,
                ` Chaque jour les poulets consomment $${texNombre(m, 1)}$ kg de grains. <br>
Par exemple, la masse de grains mangés le premier jour est donnée par $f(0)-f(1)$.<br>
$\\begin{aligned}
f(0)-f(1)&=(${texNombre(p, 0)}-${texNombre(m, 1)}\\times 0)-(${texNombre(p, 0)}-${texNombre(m, 1)}\\times 1)\\\\
&=${texNombre(p, 0)}-${texNombre(new Decimal(p).sub(m), 1)}\\\\
&=${miseEnEvidence(texNombre(m, 1))}
\\end{aligned}$
`,
                ` La fonction $g$ est donnée par : <br>
$g(t)=(\\text{masse dans le silo})-(\\text{masse consommée par les poulets en un jour})\\times t$.<br>
Ainsi, $g(t)=${rest}-${texNombre(new Decimal(m).div(2), 1)}t$.
`,
              ],
              style: 'nombres',
            })
          }
          break

        case 10: // le hand-spinner
          {
            const v = randint(20, 27) // vitesse initiale
            const a = new Decimal(randint(-300, -200)).div(1000) // coeff
            texte = ` Le hand-spinner est une sorte de toupie plate qui tourne sur elle-même.<br>
On donne au hand-spinner une vitesse de rotation initiale au temps $t = 0$, puis, au cours du temps, sa vitesse de rotation diminue jusqu'à l'arrêt complet du hand-spinner.<br>
Sa vitesse de rotation est alors égale à $0$.<br>
Pour calculer la vitesse de rotation du hand-spinner (en nombre de tours par seconde) en fonction du temps $t$ (en secondes), notée $V(t)$, on utilise la fonction suivante :
$V(t) = ${texNombre(a, 3)} \\times t + V_{\\text{initiale}}.$<br>
$\\bullet$ $t$ est le temps (en s) qui s'est écoulé depuis le début de rotation du hand-spinner ;<br>
$\\bullet$ $V_{\\text{initiale}}$ est la vitesse de rotation (en nombre de tours par seconde) à laquelle on a lancé le hand-spinner au départ.<br><br>
On lance le hand-spinner à une vitesse initiale de $${v}$ tours par seconde.`
            texte += createList({
              items: [
                `
Calculer sa vitesse de rotation au bout de $1$ minute.`,
                'Le temps et la vitesse de rotation du hand-spinner sont-ils proportionnels ? Justifier.',
                "Au bout de combien de temps le hand-spinner va-t-il s'arrêter ? Arrondir le résultat à la seconde.",
                "Est-il vrai que, d'une manière générale, si l'on fait tourner le hand-spinner deux fois plus vite au départ, il tournera deux fois plus longtemps ? Justifier. ",
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                ` Comme la vitesse initiale est $${v}$ tours par seconde, $V(t)$ est donné par : $V(t) = ${texNombre(a, 3)} \\times t + ${v}$.<br>
                  $1$ minute $=60$ secondes,<br>
                  $\\begin{aligned}
                  V(60)&=${texNombre(a, 3)} \\times 60 + ${v}\\\\
                  &=${texNombre(new Decimal(a.mul(60)), 3)}+ ${v}\\\\
                  &=${texNombre(new Decimal(a.mul(60).add(v)), 3)}
                  \\end{aligned}$
            <br>
            Au bout d'une minute, le hand-spinner a une vitesse de $${miseEnEvidence(texNombre(new Decimal(a.mul(60).add(v)), 3))}$ tours par seconde.`,
                "Le temps et la vitesse de rotation du hand-spinner ne sont pas proportionnels car la fonction $V$ n'est pas une fonction linéaire (elle n'est pas de la forme $V(t)=a\\times t$).",
                `Le hand-spinner s'arrête lorsque la vitesse de rotation est nulle. <br>
            On cherche donc la valeur de $t$ telle que : <br>
            $\\begin{aligned}
            V(t)&=0\\\\
            ${texNombre(a, 3)} \\times t + ${v}&= 0\\\\
           ${texNombre(a, 3)} \\times t&=-${v}\\\\
           t&=\\dfrac{${v}}{${texNombre(-a, 3)}}
           \\end{aligned}$<br>
           Comme $\\dfrac{${v}}{${texNombre(-a, 3)}}\\approx ${texNombre(new Decimal(-v).div(a), 0)}$, le hand-spinner s'arrte au bout de $${miseEnEvidence(texNombre(new Decimal(-v).div(a), 0))}$ secondes (valeur arrondie à la seconde).`,
                ` D'une manière générale, on a : <br>
           $\\begin{aligned}
            V(t)&=0\\\\
            ${texNombre(a, 3)} \\times t + V_{\\text{initiale}}&= 0\\\\
           ${texNombre(a, 3)} \\times t&=- V_{\\text{initiale}}\\\\
           t&=\\dfrac{ V_{\\text{initiale}}}{${texNombre(-a, 3)}}
           \\end{aligned}$<br>
          Le hand-spinner s'arrête au bout de $\\dfrac{ V_{\\text{initiale}}}{${texNombre(-a, 3)}}$ secondes.<br>
           Si on fait tourner le hand-spinner deux fois plus vite au départ, il s'arrête au bout de $2\\times \\dfrac{ V_{\\text{initiale}}}{${texNombre(-a, 3)}}$ secondes.<br>
          On en déduit si l'on fait tourner le hand-spinner deux fois plus vite au départ, il tournera bien deux fois plus longtemps.
           `,
              ],
              style: 'nombres',
            })
          }
          break

        default:
          {
            // la facture d'eau
            const abo = new Decimal(randint(451, 691)).div(10) // abonnement
            const p = new Decimal(randint(301, 399)).div(100) // prix du m3
            const n = randint(70, 99)
            const fac = new Decimal(p).mul(n).add(abo)
            const conso = randint(90, 110)
            const conso2 = randint(60, 80)
            const fac2 = new Decimal(p).mul(conso2).add(abo)
            texte = ` Dans une région de France, le tarif de l'eau est le suivant : <br>
            un abonnement annuel et $${texNombre(p, 2, true)}$ € par mètre cube consommé. 
            `

            texte += createList({
              items: [
                `Une famille a payé une facture de $${texNombre(fac, 2, true)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                  Calculer le prix de l'abonnement.`,
                "Soit $f$ la fonction qui, à tout réel $x$ de $[0\\,;\\,+\\infty[$ associe le prix payé annuellement pour une consommation d'eau de $x\\text{ m}^3$." +
                  createList({
                    items: [
                      'Exprimer $f(x)$ en fonction de $x$.',
                      `Déterminer le prix payé par un ménage consommant $${conso}\\text{ m}^3$ d'eau par an.`,
                      `À partir de quelle quantité d'eau consommée, la facture s'élève à plus de $${texNombre(fac2, 2, true)}$ € ? `,
                    ],
                    style: 'alpha',
                  }),
              ],
              style: 'nombres',
            })

            texteCorr = createList({
              items: [
                `La facture s'élève à $${texNombre(fac, 3)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                 En notant $a$ le montant de l'abonnement, on obtient : <br>
                 $\\begin{aligned}
                 a+${texNombre(p, 2, true)}\\times ${n} &=${texNombre(fac, 3)}\\\\
                 a+${texNombre(new Decimal(p).mul(n), 3)}&=${texNombre(fac, 3)}\\\\
                 a&=${texNombre(fac, 3)}-${texNombre(new Decimal(p).mul(n), 3)}\\\\
                 a&=${texNombre(abo, 2)}
                 \\end{aligned}$<br>
                 Le montant de l'abonnement est donc $${texNombre(abo, 2, true)}$ €.
                 `,

                createList({
                  items: [
                    `Le tarif est composé du montant de l'abonnement et $${texNombre(p, 2, true)}$ € par mètre cube consommé, on en déduit que : <br>
                      $f(x)=${miseEnEvidence(`${texNombre(abo, 2, true)}+${texNombre(p, 2, true)}x`)}$.`,
                    `Le prix payé par un ménage consommant $${conso}\\text{ m}^3$ d'eau par an est donné par $f(${conso})$.<br>
                     $f(${conso})=${texNombre(abo, 2, true)}+${texNombre(p, 2, true)}\\times ${conso}=${texNombre(new Decimal(p).mul(conso).add(abo), 2)}$.<br>
                     Le ménage devra payer $${miseEnEvidence(texNombre(new Decimal(p).mul(conso).add(abo), 2, true))}$ €.`,
                    `On cherche $x$ tel que : <br>
                      $\\begin{aligned}
                      f(x)&\\geqslant ${texNombre(fac2, 2, true)}\\\\
                       ${texNombre(abo, 2, true)}+${texNombre(p, 2, true)}x&\\geqslant ${texNombre(fac2, 2, true)}\\\\
                       ${texNombre(p, 2, true)}x&\\geqslant ${texNombre(fac2, 2, true)}-${texNombre(abo, 2, true)}\\\\
                       x&\\geqslant \\dfrac{${texNombre(new Decimal(fac2).sub(abo), 3)}}{${texNombre(p, 2, true)}}
                       \\end{aligned}$
                       <br>
                       Comme $\\dfrac{${texNombre(new Decimal(fac2).sub(abo), 3)}}{${texNombre(p, 2, true)}}= ${texNombre(new Decimal(fac2.sub(abo)).div(p), 3)}$, c'est à partir d'une consommation de $${texNombre(new Decimal(fac2.sub(abo)).div(p), 3)}\\text{ m}^3$ d'eau que la facture sera supérieure ou égale à $${miseEnEvidence(texNombre(fac2, 2, true))}$ €.

                       
                       `,
                  ],
                  style: 'alpha',
                }),
              ],
              style: 'nombres',
            })
          }
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
