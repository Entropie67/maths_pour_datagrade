import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParCoordonnees } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { texteGras } from '../../lib/format/style'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des probabilités conditionnelles'

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '25/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '01/06/2024' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Stephane Guyon
 */
export const uuid = '9ccfd'

export const refs = {
  'fr-fr': ['1P10'],
  'fr-ch': [],
}

/**
 *
 * @param {Number} proba La probabilité à afficher
 * @param {Boolean} rationnel Si true alors // \\dfrac sinon 0,..
 * @returns la chaine latex pour écrire la proba.
 * version arrondie au millième
 */
function texProba(proba: number, rationnel: boolean, precision = 3) {
  return rationnel
    ? fraction(arrondi(proba, precision)).toLatex().replace('\\frac', '\\dfrac')
    : Number(arrondi(proba, precision)).toString().replace('.', ',')
}
export default class ProbabilitesConditionnelles extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : sujet en plusieurs parties (arbre, démonstrations) : pas de réponse courte unique.
    this.reponseCourteDisponible = false
    this.besoinFormulaireCaseACocher = ['Probabilités fractionnaires', false]
    this.besoinFormulaire2Numerique = [
      "Choix d'exercices : ",
      3,
      '1 : Sujet 1 issu E3C\n2 : Sujet 2 issu E3C\n3 : Mélange',
    ]
    this.nbQuestions = 1 // Nombre de questions par défaut

    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 3 : 1

    this.sup = false
    this.sup2 = 3
  }

  nouvelleVersion() {
    let objets
    let listeTypeDeQuestions
    this.sup2 = contraindreValeur(1, 3, this.sup2, 3)
    if (this.sup2 === 3) {
      listeTypeDeQuestions = combinaisonListes(
        ['sujetE3C1', 'sujetE3C2'],
        this.nbQuestions,
      )
    } else {
      listeTypeDeQuestions = combinaisonListes(
        [`sujetE3C${this.sup2}`],
        this.nbQuestions,
      )
    }

    // const listeTypeQuestions = combinaisonListes(typeQuestionsDisponibles, this.nbQuestions) // Tous les types de questions sont posés mais l'ordre diffère à chaque  «${sp(1)}cycle${sp(1)}»
    for (
      let i = 0,
        a,
        c,
        ec,
        ce,
        v,
        av,
        A,
        B,
        A1,
        A2,
        A3,
        A4,
        O,
        k1,
        k2,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      objets = []
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'sujetE3C1':
          a = randint(30, 70) // p(A)
          v = randint(30, 70, [a]) // P_T(V)

          av = randint(20, a - 5, [a, v]) // P(A \cap V)
          // ici on économise des variables qui ne servent qu'une fois en les stockant dans un tableau. (Jean-claude Lhote)
          O = pointAbstrait(0.6, 2.3)
          A = pointAbstrait(5, 5)
          B = pointAbstrait(5, 1)
          A1 = pointAbstrait(9, 7.5)
          A2 = pointAbstrait(9, 4)
          A3 = pointAbstrait(9, 3)
          A4 = pointAbstrait(9, 0)
          // On met les segments d'abord pour ne pas qu'ils passent par dessus le texte.(Jean-claude Lhote)
          objets.push(segment(O, A, bleuMathalea))
          objets.push(segment(O, B, bleuMathalea))
          objets.push(segment(A, A1, bleuMathalea))
          objets.push(segment(A, A2, bleuMathalea))
          objets.push(segment(B, A3, bleuMathalea))
          objets.push(segment(B, A4, bleuMathalea))
          objets.push(
            latexParCoordonnees('A', 5, 5.2, 'black', 20, 12, 'white', 10),
          ) // 1er noeud Avion) = A
          objets.push(
            latexParCoordonnees(
              '\\bar A',
              5,
              1.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 1er noeud événement contraire \bar A
          objets.push(
            latexParCoordonnees(
              '\\Omega',
              0,
              2.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // Univers, point de départ de l'arbre Omega
          objets.push(
            latexParCoordonnees(
              texProba(a / 100, this.sup),
              2.5,
              4.1,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de A, ici ${a}
          objets.push(
            latexParCoordonnees(
              texProba(1 - a / 100, this.sup),
              2.5,
              2.1,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de \\bar A 1-${a}
          objets.push(
            latexParCoordonnees(
              texProba(1 - v / 100, this.sup),
              6.8,
              0.9,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de \\bar B sachant \\bar A
          objets.push(
            latexParCoordonnees(
              texProba(v / 100, this.sup),
              6.8,
              2.7,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de B sachant \\bar A
          objets.push(
            latexParCoordonnees(
              `P(A\\cap V)=${texProba(av / 100, this.sup)}`,
              13.5,
              7.8,
              'red',
              20,
              20,
              'white',
              10,
            ),
          ) // proba de B \\cap A

          objets.push(
            latexParCoordonnees('V', 9, 7.7, 'black', 20, 12, 'white', 10),
          ) // 2ème noeud issu de A
          objets.push(
            latexParCoordonnees(
              '\\bar V',
              9,
              4.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 2ème noeud issu de A
          objets.push(
            latexParCoordonnees('V', 9, 3.1, 'black', 20, 12, 'white', 10),
          ) // 2ème noeud issu de \bar A
          objets.push(
            latexParCoordonnees(
              '\\bar V',
              9,
              0.2,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 2ème noeud issu de \bar A

          texte =
            'Une agence de voyage propose deux formules week-end pour se rendre à Londres depuis Paris.'
          texte +=
            `<br> Les clients choisissent leur moyen de transport${sp()}: train ou avion.`
          texte += `<br> De plus, s'ils le souhaitent, ils peuvent compléter leur formule par l'option «${sp(1)}visites guidées${sp(1)}».`
          texte += `<br> Une étude a produit les données suivantes${sp(1)}:`
          texte += `<br> $\\bullet ${sp(3)} ${a}${sp()}\\%$ des clients optent pour l'avion;`
          texte += `<br> $\\bullet ${sp(3)}$Parmi les clients ayant choisi le train, $${v}${sp()}\\%$ choisissent aussi l'option «${sp(1)}visites guidées${sp(1)}».`
          texte += `<br> $\\bullet ${sp(3)} ${av}${sp()}\\%$ des clients ont choisi à la fois l'avion et l'option «${sp(1)}visites guidées${sp(1)}».<br>`
          texte +=
            "<br> On interroge au hasard un client de l'agence ayant souscrit à une formule week-end à Londres."
          texte += `<br> On considère les événements suivants${sp(1)}:`
          texte += `<br> $\\bullet~~$ $A$${sp()}: le client a choisi l'avion.`
          texte += `<br> $\\bullet~~$ $V$${sp()}: le client a choisi l'option «${sp(1)}visites guidées${sp(1)}».<br>`
          texte += `<br> ${texteGras('1.')} Déterminer $P_A(V)$.`
          texte += `<br> ${texteGras('2.')} Démontrer que la probabilité pour que le client interrogé ait choisi l'option «${sp(1)}visites guidées${sp(1)}» est environ égale à $${texProba(av / 100 + ((1 - a / 100) * v) / 100, false)}$.`
          texte += `<br> ${texteGras('3.')} Calculer la probabilité pour que le client interrogé ait pris l'avion sachant qu'il n'a pas choisi l'option «${sp(1)}visites guidées${sp(1)}». Arrondir le résultat au centième.`
          texte += `<br> ${texteGras('4.')} On interroge au hasard deux clients de manière aléatoire et indépendante.`
          texte += `<br> Quelle est la probabilité qu'aucun des deux ne prennent l'option «${sp(1)}visites guidées${sp(1)}»${sp(1)}? `
          texte +=
            'On donnera les résultats sous forme de valeurs approchées à $10^{-3}$ près.'
          texteCorr = `${texteGras('1.')} De l'énoncé, on déduit que${sp()}:`
          texteCorr += `<br> $P(A)=${texProba(a / 100, this.sup)}$`
          texteCorr += `<br> $P_{\\bar{A}}(V)=${texProba(v / 100, this.sup)}$`
          texteCorr += `<br> $P(A \\cap V)=${texProba(av / 100, this.sup)}$`
          texteCorr += `<br>On peut alors construire cet arbre de probabilités${sp(1)}: <br>`
          texteCorr += mathalea2d(
            { xmin: -5, ymin: -2, xmax: 18, ymax: 10 },
            objets,
          )
          texteCorr += `On a donc $P_{A}(V)=\\dfrac{P(A \\cap V)}{P(A)}=\\dfrac{${texProba(av / 100, this.sup)}}{${texProba(a / 100, this.sup)}}=${texFractionFromString(av, a)} $.`
          texteCorr += `<br><br>${texteGras('2.')} Comme $A$ et $\\bar A$ forment une partition de l'univers, on peut appliquer la loi des probabilités totales${sp()}:`
          texteCorr += ' <br>$P(V)=P(A \\cap V)+P(\\bar{A} \\cap V). $'

          texteCorr += `<br>Or $P(\\bar{A} \\cap V)=P(\\bar{A}) \\times P_{\\bar{A}}(V)=(1-${texProba(a / 100, this.sup)}) \\times ${texProba(v / 100, this.sup)}=${texProba(((1 - a / 100) * v) / 100, this.sup)}$.`
          texteCorr += `<br>Donc $P(V)=${texProba(av / 100, this.sup)}+${texProba(((1 - a / 100) * v) / 100, this.sup)}=${texProba(av / 100 + ((1 - a / 100) * v) / 100, this.sup)}$.`
          texteCorr += `<br><br>${texteGras('3.')} On a $P_{\\bar{V}}(A)=\\dfrac{P(\\bar{V} \\cap A)}{P(\\bar{V})}=\\dfrac{P(A \\cap \\bar{V})}{P(\\bar{V})}=\\dfrac{P(A) \\times P_A(\\bar{V})}{P(\\bar{V})}$.`
          texteCorr += `<br>Or, d'après la question précédente${sp(1)}:${sp(1)}$P(\\bar{V})=1-P(V)=1-${texProba(av / 100 + ((1 - a / 100) * v) / 100, this.sup)}=${texProba(1 - (av / 100 + ((1 - a / 100) * v) / 100), this.sup)}$`
          texteCorr += `<br>et d'après la question $1: P_{A}(\\bar{V})=1-P_{A}(V)=1-${texFractionFromString(av, a)}=${texFractionFromString(a - av, a)}$.`
          k1 = (a - av) / a
          k2 = 1 - (av / 100 + ((1 - a / 100) * v) / 100)
          texteCorr += `<br>Donc $P_{\\bar{V}}(A)=\\dfrac{${texProba(a / 100, this.sup)} \\times ${texFractionFromString(a - av, a)}}{${texProba(k2, this.sup)}} ${egalOuApprox(((a / 100) * k1) / k2, 2)}${texProba(((a / 100) * k1) / k2, false, 2)}$.`
          texteCorr += `<br><br>${texteGras('4.')} On a vu que $P(\\bar{V})=1-${texProba(1 - k2, this.sup)}=${texProba(k2, this.sup)}$.`
          texteCorr +=
            `<br>Comme les deux événements sont indépendants, en les appelant $\\bar {V_1}$ et $\\bar{V_2}$, on a${sp()}: $P(\\bar{V_1}\\cap\\bar{V_2})=P(\\bar{V_1})\\times P(\\bar{V_2})$`
          texteCorr += `<br>La probabilité cherchée est donc égale à $P(\\bar{V_1}\\cap\\bar{V_2})=${texProba(k2, this.sup)} \\times ${texProba(k2, this.sup)}\\approx${texProba(k2 ** 2, false)}$.`
          break
        case 'sujetE3C2':
        default:
          c = randint(30, 70) // p(C)
          ec = randint(20, 95 - c) // P_\bar C(E)
          // ce = randint(20, 95 - c)// P(E \cap C)
          ce = randint(15, c - 10) // P(E \cap C) // Modif EE
          O = pointAbstrait(0.6, 2.3)
          A = pointAbstrait(5, 5)
          B = pointAbstrait(5, 1)
          A1 = pointAbstrait(9, 7.5)
          A2 = pointAbstrait(9, 4)
          A3 = pointAbstrait(9, 3)
          A4 = pointAbstrait(9, 0)
          // On met les segments d'abord pour ne pas qu'ils passent par dessus le texte.(Jean-claude Lhote)
          objets.push(segment(O, A, bleuMathalea))
          objets.push(segment(O, B, bleuMathalea))
          objets.push(segment(A, A1, bleuMathalea))
          objets.push(segment(A, A2, bleuMathalea))
          objets.push(segment(B, A3, bleuMathalea))
          objets.push(segment(B, A4, bleuMathalea))
          objets.push(
            latexParCoordonnees('C', 5, 5.2, 'black', 20, 12, 'white', 10),
          ) // 1er noeud  = C
          objets.push(
            latexParCoordonnees(
              '\\bar C',
              5,
              1.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 1er noeud événement contraire \bar C
          objets.push(
            latexParCoordonnees(
              '\\Omega',
              0,
              2.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // Univers, point de départ de l'arbre Omega
          objets.push(
            latexParCoordonnees(
              texProba(c / 100, this.sup),
              2.5,
              4.1,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de C, ici ${c}
          objets.push(
            latexParCoordonnees(
              texProba(1 - c / 100, this.sup),
              2.5,
              2.1,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de \\bar C 1-${c}
          objets.push(
            latexParCoordonnees(
              texProba(1 - ec / 100, this.sup),
              6.8,
              0.9,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de \\bar E sachant \\bar C
          objets.push(
            latexParCoordonnees(
              texProba(ec / 100, this.sup),
              6.8,
              2.7,
              'black',
              20,
              20,
              'white',
              6,
            ),
          ) // proba de E sachant \\bar C
          objets.push(
            latexParCoordonnees(
              `P(C\\cap E)=${texProba(ce / 100, this.sup)}`,
              13.5,
              7.8,
              'red',
              20,
              20,
              '',
              10,
            ),
          ) // proba de C \\cap E
          objets.push(
            latexParCoordonnees('E', 9, 7.7, 'black', 20, 12, 'white', 10),
          ) // 2ème noeud issu de A
          objets.push(
            latexParCoordonnees(
              '\\bar E',
              9,
              4.3,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 2ème noeud issu de A
          objets.push(
            latexParCoordonnees('E', 9, 3.1, 'black', 20, 12, 'white', 10),
          ) // 2ème noeud issu de \bar A
          objets.push(
            latexParCoordonnees(
              '\\bar E',
              9,
              0.2,
              'black',
              20,
              12,
              'white',
              10,
            ),
          ) // 2ème noeud issu de \bar A
          texte = `Une chaîne de salons de coiffure propose à ses clients qui viennent pour une coupe, deux prestations supplémentaires cumulables${sp()}:`
          texte += `<br>$\\bullet$ Une coloration naturelle à base de plantes appelée «${sp(1)}couleur-soin${sp(1)}»,`
          texte += `<br>$\\bullet$ Des mèches blondes pour donner du relief à la chevelure, appelées «${sp(1)}effet coup de soleil${sp(1)}».`
          texte += `<br><br> Il apparaît que${sp()}: <br>$\\diamond ${sp(3)} ${c}${sp()}\\%$ des clients demandent une «${sp(1)}couleur-soin${sp(1)}».`
          texte += `<br>$\\diamond ${sp(3)}$ Parmi ceux qui ne veulent pas de «${sp(1)}couleur-soin${sp(1)}», $${ec}${sp()}\\%$ des clients demandent un «${sp(1)}effet coup de soleil${sp(1)}».`
          texte += `<br>$\\diamond ${sp(3)}$ Par ailleurs, $${ce}${sp()}\\%$ des clients demandent une «${sp(1)}couleur-soin${sp(1)}» et un «${sp(1)}effet coup de soleil${sp(1)}».`
          texte += '<br>On interroge un client au hasard.'
          texte += `<br>On notera $C$ l'événement${sp()}: «${sp(1)}Le client souhaite une «${sp(1)}couleur-soin${sp(1)}».`
          texte += `<br>On notera $E$ l'événement${sp()}: «${sp(1)}Le client souhaite un «${sp(1)}effet coup de soleil${sp(1)}».<br>`

          texte +=
            texteGras('1.') +
            ' Donner les valeurs de $P(C)$, $P( C \\cap E)$ et $P_{\\bar{C}}(E)$.<br>'
          texte +=
            texteGras('2.') +
            ` Calculer la probabilité que le client ne souhaite ni une «${sp(1)}couleur-soin${sp(1)}», ni un «${sp(1)}effet coup de soleil${sp(1)}».<br>`
          texte +=
            texteGras('3.') +
            ` Calculer la probabilité qu'un client choisisse l'«${sp(1)}effet coup de soleil${sp(1)}» sachant qu'il a pris une «${sp(1)}couleur-soin${sp(1)}».<br>`
          texte +=
            texteGras('4.') +
            ` Montrer que la probabilité de l'événement $E$ est égale à $${texProba(ce / 100 + ((1 - c / 100) * ec) / 100, false)}$ (à $10^{-3}$ près).<br>`
          texte +=
            texteGras('5.') +
            ` Les événements $C$ et $E$ sont-ils indépendants${sp()}?<br>`
          texte +=
            'On donnera les résultats sous forme de valeurs approchées à $10^{-3}$ près.'
          texteCorr = `${texteGras('1.')} D'après l'énoncé, on a${sp()}:<br>$\\bullet~~P(C)=${texProba(c / 100, this.sup)}$`
          texteCorr += `<br>$\\bullet~~P(C \\cap E)=${texProba(ce / 100, this.sup)}$`
          texteCorr += `<br>$\\bullet~~P_{\\bar C}(E)=${texProba(ec / 100, this.sup)}$`
          texteCorr += `<br>Ce qui permet de construire cet arbre de probabilités${sp()}:${sp()}`
          texteCorr += mathalea2d(
            { xmin: -5, ymin: -2, xmax: 18, ymax: 10 },
            objets,
          )
          texteCorr += `${texteGras('2.')} L'événement : le client ne souhaite ni une «${sp(1)}couleur-soin${sp(1)}», ni un «${sp(1)}effet coup de soleil${sp(1)}» correspond à $\\bar{C} \\cap \\bar{E}$.`
          texteCorr += `<br>On a $P(\\bar{C} \\cap \\bar{E})=P(\\bar{C}) \\times P_{\\bar{C}}(\\bar{E})=P(\\bar{C}) \\times (1-P_{\\bar{C}}(E))=${texProba(1 - c / 100, false)} \\times ${texProba(1 - ec / 100, false)}\\approx ${texProba((1 - c / 100) * (1 - ec / 100), false)}$.`
          texteCorr += `<br>${texteGras('3.')} La probabilité qu'un client choisisse l'«${sp(1)}effet coup de soleil${sp(1)}» sachant qu'il a pris une «${sp(1)}couleur-soin${sp(1)}» est $P_{C}(E)$.`
          texteCorr += `<br>On a alors d'après l'arbre pondéré${sp()}:`
          texteCorr += `<br>$P(C) \\times P_{C}(E)=${texProba(c / 100, false)} \\times P_{C}(E)=${texProba(ce / 100, false)}$.`
          texteCorr += `<br>On en déduit que $P_{C}(E)=\\dfrac{${texProba(ce / 100, false)}}{${texProba(c / 100, false)}}\\approx${texProba(ce / c, false)}$.`
          texteCorr += `<br>${texteGras('4.')} On cherche $P(E)$ qui est une probabilité totale.`
          texteCorr += `<br>Comme $C$ et $\\bar C$ forment une partition de l'univers, on peut appliquer la loi des probabilités totales${sp()}:`
          texteCorr += '<br>$P(E)=P(E \\cap C)+P(E \\cap \\bar{C} )$'
          texteCorr += `<br>$P(E)=${texProba(ce / 100, false)}+${texProba(1 - c / 100, false)}\\times ${texProba(ec / 100, false)}$`
          texteCorr += `<br>$P(E)\\approx${texProba(ce / 100 + ((1 - c / 100) * ec) / 100, false)}$`
          texteCorr += `<br>${texteGras('5.')} Pour savoir si les événements $C$ et $E$ sont indépendants, on calcule séparément `
          texteCorr +=
            '$P(C \\cap E)$ et $P(C) \\times P(E)$, pour tester si elles sont égales.'
          texteCorr += `<br>On a $P(C \\cap E)=${texProba(ce / 100, false)}$ `
          texteCorr += `et $P(C) \\times P(E)\\approx${texProba((c / 100) * (ce / 100 + ((1 - c / 100) * ec) / 100), false)}$.`
          texteCorr +=
            '<br>On en déduit que les événements $C$ et $E$ ne sont pas indépendants.'
          break
      }
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
