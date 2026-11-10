import { bleuMathalea } from '../../lib/colors'
import { texSymbole } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const dateDeModifImportante = '31/05/2026'
export const dateDePublication = '17/07/2021'
export const titre = 'Résoudre une inéquation quotient'

/**
 * Résoudre une inéquation quotient
 * * Type 1 : (x+a)/(x+b)<0
 * * Type 2 : (ax+b)/(cx+d)<0
 * * Type 3 : (ax+b)/[(cx+d)(ex+f)]<0
 * * Type 4 : (ax+b)/(cx+d)²<0
 * * Type 5 : (ax+b)/(cx+d)+e<0
 * * Tous les types
 * @author Guillaume Valmont
 * Éric Elter : Rajout d'un paramètre pour ne pas écrire les expressions forcément sous forme canonique (31/05/2026)
 */
export const uuid = '0c09b'

export const refs = {
  'fr-fr': ['2L31-2'],
  'fr-ch': ['2mIneq-4'],
}
export default class ExerciceInequationQuotient extends Exercice {
  constructor() {
    super()
    this.spacing = 2 // Espace entre deux lignes
    this.spacingCorr = 2 // Espace entre deux lignes pour la correction
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false // Désactive la correction détaillée par défaut
    this.nbQuestions = 4 // Choix du nombre de questions

    // Choisit le type de question à l'aide d'un formulaire numérique (la réponse sera stockée dans this.sup)
    this.besoinFormulaireNumerique = [
      "Type d'inéquation",
      5,
      '1: (x+a)/(x+b)<0\n2: (ax+b)/(cx+d)<0\n3: (ax+b)/[(cx+d)(ex+f)]<0\n4: (ax+b)/(cx+d)²<0\n5: (ax+b)/(cx+d)+e<0\n6: Tous les types précédents',
    ]
    this.sup = 1 // Choix du type d'inéquation
    this.besoinFormulaire2CaseACocher = [
      'Ordre forcément canonique des expressions',
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    let listeTypeDeQuestions // Stockera la liste des types de questions
    let correctionInteractif: string | string[] = '' // Pour récupérer l'intervalle solution à saisir
    let correctionInteractifInterieur = '' // Pour récupérer l'intervalle solution à saisir dans certains cas
    let correctionInteractifExterieur = '' // Pour récupérer l'intervalle solution à saisir dans certains cas
    let correctionInteractif1et3 = '' // Pour récupérer l'intervalle solution à saisir dans certains cas
    let correctionInteractif2et4 = '' // Pour récupérer l'intervalle solution à saisir dans certains cas
    let correctionInteractifDroite: string[] = [] // Pour récupérer l'intervalle solution à saisir dans certains cas
    let correctionInteractifGauche: string[] = [] // Pour récupérer l'intervalle solution à saisir dans certains cas
    let debutConsigne
    if (this.nbQuestions.toString() === '1') {
      debutConsigne = `Résoudre l'inéquation suivante${sp()}:`
    } else {
      debutConsigne = `Résoudre les inéquations suivantes${sp()}:`
    }
    if (this.interactif && !context.isAmc) {
      this.consigne = `${debutConsigne}<br> Saisir uniquement l'intervalle dans le champ de réponse<br>Taper 'union' pour faire apparaître $\\cup$, 'inf' pour $\\infty$ et 'sauf' pour $\\backslash\\{\\}$`
    } else {
      this.consigne = debutConsigne
    }
    const separateur = ';'
    // Convertit le paramètre this.sup en type de question
    switch (this.sup.toString()) {
      case '1':
        listeTypeDeQuestions = ['(x+a)/(x+b)<0']
        break
      case '2':
        listeTypeDeQuestions = ['(ax+b)/(cx+d)<0']
        break
      case '3':
        listeTypeDeQuestions = ['(ax+b)/[(cx+d)(ex+f)]<0']
        break
      case '4':
        listeTypeDeQuestions = ['(ax+b)/(cx+d)²<0']
        break
      case '5':
        listeTypeDeQuestions = ['(ax+b)/(cx+d)+e<0']
        break
      default:
        listeTypeDeQuestions = [
          '(x+a)/(x+b)<0',
          '(ax+b)/(cx+d)<0',
          '(ax+b)/[(cx+d)(ex+f)]<0',
          '(ax+b)/(cx+d)²<0',
          '(ax+b)/(cx+d)+e<0',
        ]
        break
    }
    // Crée une liste randomisée de types de questions respectant le nombre (this.nbQuestions) et le type (this.sup) de questions passés en paramètre
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    // Crée une liste d'autant de signes que de questions
    const signes: ('<' | '>' | '≤' | '≥')[] = combinaisonListes(
      ['<', '>', '≤', '≥'],
      this.nbQuestions,
    )
    // Boucle principale qui servira à créer toutes les questions // On limite le nombre d'essais à 50 pour chercher des valeurs nouvelles
    for (
      let i = 0,
        a,
        b,
        c,
        d,
        e,
        f,
        pGauche,
        pDroite,
        texte = '',
        ligne1,
        ligne2,
        ligne3,
        ligne4,
        ecart,
        texteCorr = '',
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Génère 4 nombres relatifs a, b, c et d tous différents avec a et c qui ne peuvent pas être 1 car ce sont ceux qui peuvent multiplier x pour éviter à la fois d'avoir '1x' et de diviser par 1
      a = randint(-13, 13, [0, 1, -1])
      b = randint(-13, 13, [0, a])
      c = randint(-13, 13, [0, 1, -1, a, b])
      d = randint(-13, 13, [0, a, b, c, (b * c) / a]) // Pour éviter que ax + b et cx + d n'aient la même racine
      e = randint(-13, 13, [0, 1, -1, a, b, c, d])
      f = randint(-13, 13, [0, a, b, c, d, e, (b * e) / a, (d * e) / c]) // Pour éviter que (ax + b et ex + f) ou (cx + d et ex + f) n'aient la même racine
      // Dans le type 5, (a + e*c) est le coefficient directeur du numérateur mis au même dénominateur.
      // S'il est nul, la réduction produit une "racine" de la forme n/0.
      if (listeTypeDeQuestions[i] === '(ax+b)/(cx+d)+e<0' && a + e * c === 0) {
        cpt++
        continue
      }
      // Augmente la hauteur des lignes sur la sortie pdf
      if (context.isHtml) {
        ecart = 2
      } else {
        ecart = 4
      }
      // Pioche un signe d'inégalité parmi <, ≤, ≥, > et définit en fonction si les crochets seront ouverts ou fermés dans l'ensemble de solutions
      switch (signes[i]) {
        case '<':
          pGauche = ']'
          pDroite = '['
          break
        case '≤':
          pGauche = '['
          pDroite = ']'
          break
        case '>':
          pGauche = ']'
          pDroite = '['
          break
        case '≥':
          pGauche = '['
          pDroite = ']'
          break
      }
      // Fonction détaillant la résolution d'une équation de type x + val
      const resolutionDetailleeEquation = function (
        val: number,
        withEqualSign: boolean = false,
      ) {
        let symbole = texSymbole('>')
        if (withEqualSign) {
          symbole = '='
        }
        texteCorr += `$x ${ecritureAlgebrique(val)} ${symbole} 0$ <br>`
        texteCorr += `$x ${ecritureAlgebrique(val)} ${miseEnEvidence(ecritureAlgebrique(-1 * val), bleuMathalea)} ${symbole} ${miseEnEvidence(ecritureAlgebrique(-1 * val), bleuMathalea)}$<br>`
        texteCorr += `$x ${symbole} ${-val}$<br>`
      }
      // Fonction écrivant la correction détaillée d'une inéquation du type var1*x + var2 > 0
      const ecrireCorrectionDetaillee = function (
        var1: number,
        var2: number,
        withEqualSign: boolean = false,
      ) {
        let symbolePlusGrand = texSymbole('>')
        let symbolePlusPetit = texSymbole('<')
        if (withEqualSign) {
          symbolePlusGrand = '='
          symbolePlusPetit = '='
        }
        // Détaille les étapes de la résolution en mettant en évidence les calculs réalisés.
        texteCorr += `<br>$${var1}x ${ecritureAlgebrique(var2)} ${symbolePlusGrand} 0$ <br>`
        texteCorr += `$${var1}x ${ecritureAlgebrique(var2)} ${miseEnEvidence(ecritureAlgebrique(-1 * var2), bleuMathalea)} ${symbolePlusGrand} ${miseEnEvidence(ecritureAlgebrique(-1 * var2), bleuMathalea)}$<br>`
        texteCorr += `$${var1}x ${symbolePlusGrand} ${-var2}$<br>`
        // Si var1 < 0, l'inégalité change de sens
        if (var1 < 0) {
          texteCorr += `$${var1}x ${miseEnEvidence('\\div ' + ecritureParentheseSiNegatif(var1), bleuMathalea)} `
          if (withEqualSign) {
            // On met en évidence un > qui se change en <, pas un = qui ne change pas
            texteCorr += symbolePlusPetit
          } else {
            texteCorr += miseEnEvidence(symbolePlusPetit)
          }
          texteCorr += ` ${-var2 + miseEnEvidence('\\div ' + ecritureParentheseSiNegatif(var1), bleuMathalea)}$<br>`
          texteCorr += `$x ${symbolePlusPetit} ${new FractionEtendue(-var2, var1).texFSD}$`

          texteCorr += new FractionEtendue(-var2, var1).estIrreductible
            ? '<br>'
            : ` et, par simplification, $x ${symbolePlusPetit} ${new FractionEtendue(-var2, var1).texFractionSimplifiee}$.<br>`
          texteCorr += `Donc $${var1}x ${ecritureAlgebrique(var2)} ${symbolePlusGrand} 0$ si et seulement si $x ${symbolePlusPetit} ${new FractionEtendue(-var2, var1).texFractionSimplifiee}$.`
        } else {
          // sinon elle ne change pas de sens
          texteCorr += `$${var1}x ${miseEnEvidence('\\div ' + ecritureParentheseSiNegatif(var1), bleuMathalea)} ${symbolePlusGrand} ${-var2} ${miseEnEvidence('\\div ' + ecritureParentheseSiNegatif(var1), bleuMathalea)}$<br>`
          texteCorr += `$x ${symbolePlusGrand} ${new FractionEtendue(-var2, var1).texFSD}$`
          texteCorr += new FractionEtendue(-var2, var1).estIrreductible
            ? '<br>'
            : ` et, par simplification, $x ${symbolePlusGrand} ${new FractionEtendue(-var2, var1).texFractionSimplifiee}$.<br>`
          texteCorr += `Donc $${var1}x ${ecritureAlgebrique(var2)} ${symbolePlusGrand} 0$ si et seulement si $x ${symbolePlusGrand} ${new FractionEtendue(-var2, var1).texFractionSimplifiee}$.`
        }
      }
      // Prépare les quatre types de lignes possibles pour les tableaux avec 2 antécédents : + + -, + - -, - + + et - - +
      // Les lignes sont des tableaux qui alternent chaîne de caractère et 'nombre de pixels de largeur estimée du texte pour le centrage'
      // La première chaîne 'Line' indique que c'est pour un tableau de signes et valeurs ('Var' pour un tableau de variations)
      // '' indique qu'il n'y a rien à afficher (pour laisser un espace sous la borne par exemple)
      // ",'z', 20" pour avoir un zéro sur des pointillés et ",'t', 5" pour juste avoir les pointillés
      const lignePPM = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        't',
        5,
        '+',
        20,
        'z',
        20,
        '-',
        20,
      ]
      const lignePMM = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        'z',
        20,
        '-',
        20,
        't',
        5,
        '-',
        20,
      ]
      const ligneMPP = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        'z',
        20,
        '+',
        20,
        't',
        5,
        '+',
        20,
      ]
      const ligneMMP = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        't',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
      ]
      // Prépare les six types de lignes possibles pour les tableaux avec 3 antécédents : +++-, ++--, +---, ---+, --++, -+++
      const lignePPPM = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        't',
        5,
        '+',
        20,
        't',
        5,
        '+',
        20,
        'z',
        20,
        '-',
        20,
      ]
      const lignePPMM = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        't',
        5,
        '+',
        20,
        'z',
        20,
        '-',
        20,
        't',
        5,
        '-',
        20,
      ]
      const lignePMMM = [
        'Line',
        30,
        '',
        0,
        '+',
        20,
        'z',
        20,
        '-',
        20,
        't',
        5,
        '-',
        20,
        't',
        5,
        '-',
        20,
      ]
      const ligneMPPP = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        'z',
        20,
        '+',
        20,
        't',
        5,
        '+',
        20,
        't',
        5,
        '+',
        20,
      ]
      const ligneMMPP = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        't',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
        't',
        5,
        '+',
        20,
      ]
      const ligneMMMP = [
        'Line',
        30,
        '',
        0,
        '-',
        20,
        't',
        5,
        '-',
        20,
        't',
        5,
        '-',
        20,
        'z',
        20,
        '+',
        20,
      ]
      if (listeTypeDeQuestions[i] === '(x+a)/(x+b)<0') {
        const formeFacteur1 = randint(0, 1) // 0 → (x+a), 1 → (a+x)
        const formeFacteur2 = randint(0, 1) // 0 → (x+b), 1 → (b+x)
        const texFacteur1 =
          formeFacteur1 === 0 || this.sup2
            ? `x${ecritureAlgebrique(a)}`
            : `${a}+x`

        const texFacteur2 =
          formeFacteur2 === 0 || this.sup2
            ? `x${ecritureAlgebrique(b)}`
            : `${b}+x`

        texte = `$\\dfrac{${texFacteur1}}{${texFacteur2}} ${texSymbole(signes[i])} 0$`
        texteCorr = texte + '<br>'
        texteCorr +=
          `$\\bullet$ On commence par chercher les éventuelles valeurs interdites${sp()}:<br>`
        resolutionDetailleeEquation(b, true)
        texteCorr += `Le quotient est défini sur $\\R ${texSymbole('\\')} \\{${-b}\\}$.<br>`
        texteCorr += `$\\bullet$ On résout l'inéquation sur $\\R ${texSymbole('\\')} \\{${-b}\\}$.<br>`
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(a)
        }
        texteCorr += `$x ${ecritureAlgebrique(a)} ${texSymbole('>')} 0$ si et seulement si $x ${texSymbole('>')} ${-a}$.<br>`
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(b)
        }
        texteCorr += `$${texFacteur2} ${texSymbole('>')} 0$ si et seulement si $x ${texSymbole('>')} ${-b}$.<br>`
        // Prépare l'affichage du tableau
        texteCorr +=
          `On peut donc en déduire le tableau de signes suivant${sp()}:<br>`
        if (Math.min(-a, -b) === -a) {
          // Si la plus petite solution est celle de la première équation (au numérateur), la première ligne change de signe en premier
          ligne1 = ligneMPP
          ligne2 = ligneMMP
          ligne3 = [
            'Line',
            50,
            '',
            0,
            '+',
            20,
            'z',
            20,
            '-',
            20,
            'd',
            20,
            '+',
            20,
          ] // Le dénominateur change de signe en deuxième donc la double barre (, 'd', 20) intervient en deuxième
        } else {
          // Sinon, la deuxième ligne change de signe en premier
          ligne1 = ligneMMP
          ligne2 = ligneMPP
          ligne3 = [
            'Line',
            50,
            '',
            0,
            '+',
            20,
            'd',
            20,
            '-',
            20,
            'z',
            20,
            '+',
            20,
          ] // Le dénominateur change de signe en premier donc la double barre (, 'd', 20) intervient en premier
        }
        // Affichage du tableau de signes
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 30],
              [`$${texFacteur1}$`, 2, 50],
              [`$${texFacteur2}$`, 2, 50],
              [`$\\dfrac{${texFacteur1}}{${texFacteur2}}$`, ecart, 50],
            ],
            [
              '$-\\infty$',
              30,
              `$${Math.min(-a, -b)}$`,
              20,
              `$${Math.max(-a, -b)}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligne1, ligne2, ligne3],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 8,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité et selon l'ordre des racines (l'intervalle sera toujours ouvert pour la racine du dénominateur)
        if (Math.min(-a, -b) === -a) {
          if (signes[i] === '<' || signes[i] === '≤') {
            texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${-a} ${separateur} ${-b} \\right[ $.`
            correctionInteractif = `${pGauche}${-a}${separateur}${-b}[`
          } else if (signes[i] === '>' || signes[i] === '≥') {
            texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty ${separateur} ${-a} \\right${pDroite} \\cup \\left] ${-b}${separateur} +\\infty \\right[ $.`
            correctionInteractif = `]-\\infty${separateur}${-a}${pDroite}\\cup]${-b}${separateur}+\\infty[`
          }
        } else {
          if (signes[i] === '<' || signes[i] === '≤') {
            texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left] ${-b} ${separateur} ${-a} \\right${pDroite} $.`
            correctionInteractif = `]${-b}${separateur}${-a}${pDroite}`
          } else if (signes[i] === '>' || signes[i] === '≥') {
            texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty ${separateur} ${-b} \\right[ \\cup \\left${pGauche} ${-a}${separateur} +\\infty \\right[ $.`
            correctionInteractif = `]-\\infty${separateur}${-b}[\\cup${pGauche}${-a}${separateur}+\\infty[`
          }
        }
      } else if (listeTypeDeQuestions[i] === '(ax+b)/(cx+d)<0') {
        const formeFacteur1 = randint(0, 1) // 0 → (ax+b), 1 → (b+ax)
        const formeFacteur2 = randint(0, 1) // 0 → (cx+d), 1 → (d+cx)

        const texFacteur1 =
          formeFacteur1 === 0 || this.sup2
            ? `${a}x${ecritureAlgebrique(b)}`
            : `${b}${ecritureAlgebrique(a)}x`

        const texFacteur2 =
          formeFacteur2 === 0 || this.sup2
            ? `${c}x${ecritureAlgebrique(d)}`
            : `${d}${ecritureAlgebrique(c)}x`

        let valPetit, valGrand
        texte = `$\\dfrac{${texFacteur1}}{${texFacteur2}} ${texSymbole(signes[i])} 0$`
        texteCorr = texte + '<br>'
        texteCorr +=
          `$\\bullet$ On commence par chercher les éventuelles valeurs interdites${sp()}:`
        ecrireCorrectionDetaillee(c, d, true)
        const fractionMdc = new FractionEtendue(-d, c).texFractionSimplifiee
        const fractionMba = new FractionEtendue(-b, a).texFractionSimplifiee
        /*texteCorr += new FractionEtendue(-d, c).estIrreductible
          ? ''
          : `$=${fractionMdc}$`*/
        texteCorr += `<br>Le quotient est défini sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$.`
        texteCorr += `<br>$\\bullet$ On résout l'inéquation sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$${sp()}:`
        if (this.correctionDetaillee) {
          ecrireCorrectionDetaillee(a, b)
          ecrireCorrectionDetaillee(c, d)
        } else {
          if (a < 0) {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMba}$.`
          } else {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMba}$.`
          }
          if (c < 0) {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMdc}$.`
          } else {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMdc}$.`
          }
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          `<br>On peut donc en déduire le tableau de signes suivant${sp()}:<br>`
        if (-b / a < -d / c) {
          // Si la plus petite solution est celle de la première équation
          if (a > 0) {
            // La ligne1 change de signe en premier donc ligne1 = PMM ou MPP selon le signe de a
            ligne1 = ligneMPP
          } else {
            ligne1 = lignePMM
          }
          if (c > 0) {
            // La ligne 2 change de signe en deuxième donc ligne2 = PPM ou MMP selon le signe de c
            ligne2 = ligneMMP
          } else {
            ligne2 = lignePPM
          }
          valPetit = fractionMba // la plus petite valeur est la solution de la première équation
          valGrand = fractionMdc // la plus grande valeur est la solution de la deuxième équation
        } else {
          // Si la plus petite solution est celle de la deuxième équation
          if (a > 0) {
            // La ligne1 change de signe en deuxième donc ligne1 = PPM ou MMP selon le signe de a
            ligne1 = ligneMMP
          } else {
            ligne1 = lignePPM
          }
          if (c > 0) {
            // La ligne 2 change de signe en premier donc ligne2 = PMM ou MPP selon le signe de c
            ligne2 = ligneMPP
          } else {
            ligne2 = lignePMM
          }
          valPetit = fractionMdc // la plus petite valeur est la solution de la deuxième équation
          valGrand = fractionMba // la plus grande valeur est la solution de la première équation
        }
        // Détermine la dernière ligne selon le signe du coefficient dominant
        if (-b / a < -d / c) {
          // Si la valeur interdite est la deuxième (z au lieu de d)
          if (a * c > 0) {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'z',
              20,
              '-',
              20,
              'd',
              20,
              '+',
              20,
            ]
          } else {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'z',
              20,
              '+',
              20,
              'd',
              20,
              '-',
              20,
            ]
          }
        } else {
          // Sinon, la valeur interdite est la première
          if (a * c > 0) {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'd',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ]
          } else {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'd',
              20,
              '+',
              20,
              'z',
              20,
              '-',
              20,
            ]
          }
        }
        // Affiche enfin le tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2.5, 30],
              [`$${texFacteur1}$`, 2, 75],
              [`$${texFacteur2}$`, 2, 75],
              [`$\\dfrac{${texFacteur1}}{${texFacteur2}}$`, ecart, 200],
            ],
            [
              '$-\\infty$',
              30,
              `$${valPetit}$`,
              20,
              `$${valGrand}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligne1, ligne2, ligne3],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 10,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        let interieur, exterieur
        if (-b / a < -d / c) {
          // Si la valeur interdite est la deuxième (intervale forcément ouvert avec valGrand)
          interieur = `<br>L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${valPetit} ${separateur} ${valGrand} \\right[ $.`
          correctionInteractifInterieur = `${pGauche}${valPetit}${separateur}${valGrand}[`
          exterieur = `<br>L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg${pDroite} \\cup \\bigg] ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractifExterieur = `]-\\infty${separateur}${valPetit}${pDroite}\\cup]${valGrand}${separateur}+\\infty[`
        } else {
          // Si la valeur interdite est la première (invervalle forcément ouvert avec valPetit)
          interieur = `<br>L'ensemble de solutions de l'inéquation est $S = \\left] ${valPetit} ${separateur} ${valGrand} \\right${pDroite} $.`
          correctionInteractifInterieur = `]${valPetit}${separateur}${valGrand}${pDroite}`
          exterieur = `<br>L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg[ \\cup \\bigg${pGauche} ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractifExterieur = `]-\\infty${separateur}${valPetit}[\\cup${pGauche}${valGrand}${separateur}+\\infty[`
        }
        if (signes[i] === '<' || signes[i] === '≤') {
          if (a * c > 0) {
            texteCorr += interieur
            correctionInteractif = correctionInteractifInterieur
          } else {
            texteCorr += exterieur
            correctionInteractif = correctionInteractifExterieur
          }
        } else if (signes[i] === '>' || signes[i] === '≥') {
          if (a * c > 0) {
            texteCorr += exterieur
            correctionInteractif = correctionInteractifExterieur
          } else {
            texteCorr += interieur
            correctionInteractif = correctionInteractifInterieur
          }
        }
      } else if (listeTypeDeQuestions[i] === '(ax+b)/[(cx+d)(ex+f)]<0') {
        const formeFacteur1 = randint(0, 1) // 0 → (ax+b), 1 → (b+ax)
        const formeFacteur2 = randint(0, 1) // 0 → (cx+d), 1 → (d+cx)
        const formeFacteur3 = randint(0, 1) // 0 → (ex+f), 1 → (f+ex)

        const texFacteur1 =
          formeFacteur1 === 0 || this.sup2
            ? `${a}x${ecritureAlgebrique(b)}`
            : `${b}${ecritureAlgebrique(a)}x`
        const texFacteur2 =
          formeFacteur2 === 0 || this.sup2
            ? `${c}x${ecritureAlgebrique(d)}`
            : `${d}${ecritureAlgebrique(c)}x`
        const texFacteur3 =
          formeFacteur3 === 0 || this.sup2
            ? `${e}x${ecritureAlgebrique(f)}`
            : `${f}${ecritureAlgebrique(e)}x`

        let valPetit, valMoyen, valGrand
        texte = `$\\dfrac{${texFacteur1}}{(${texFacteur2})(${texFacteur3})} ${texSymbole(signes[i])} 0$`
        texteCorr = `${texte} <br>
$\\bullet$ On commence par chercher les éventuelles valeurs interdites${sp()}:<br>
$(${texFacteur2})(${texFacteur3}) = 0$ si et seulement si $${texFacteur2} = 0$ ou $${texFacteur3} = 0$.`
        ecrireCorrectionDetaillee(c, d, true)
        ecrireCorrectionDetaillee(e, f, true)
        const fractionMdc = new FractionEtendue(-d, c).texFractionSimplifiee
        const fractionMfe = new FractionEtendue(-f, e).texFractionSimplifiee
        const fractionMba = new FractionEtendue(-b, a).texFractionSimplifiee
        texteCorr += `<br>Le quotient est défini sur $\\R ${texSymbole('\\')} \\{${fractionMdc}; ${fractionMfe}\\}$.<br>
$\\bullet$ On résout l'inéquation sur $\\R ${texSymbole('\\')} \\{${fractionMdc}; ${fractionMfe}\\}$${sp()}:`
        if (this.correctionDetaillee) {
          ecrireCorrectionDetaillee(a, b)
          ecrireCorrectionDetaillee(c, d)
          ecrireCorrectionDetaillee(e, f)
        } else {
          if (a < 0) {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMba}$.`
          } else {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMba}$.`
          }
          if (c < 0) {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMdc}$.`
          } else {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMdc}$.`
          }
          if (e < 0) {
            texteCorr += `<br>$${texFacteur3}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMfe}$.`
          } else {
            texteCorr += `<br>$${texFacteur3}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMfe}$.`
          }
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          `<br>On peut donc en déduire le tableau de signes suivant${sp()}: <br>`
        // zero1 correspond au 0 (z) ou à la double barres (d) correspondant au premier antécédent de la dernière ligne
        let zero1 = 'z'
        let zero2 = 'z'
        let zero3 = 'z'
        if (-b / a < -d / c && -b / a < -f / e) {
          // Si la plus petite solution est celle de la première équation
          if (a > 0) {
            // La ligne1 change de signe en premier donc ligne1 = PMMM ou MPPP selon le signe de a
            ligne1 = ligneMPPP
          } else {
            ligne1 = lignePMMM
          }
          valPetit = fractionMba // la plus petite valeur est la solution de la première équation
          zero2 = 'd' // les valeurs interdites sont donc les antécédents 2 et 3
          zero3 = 'd'
          if (-d / c < -f / e) {
            // Si la deuxième plus petite solution est celle de la deuxième équation
            if (c > 0) {
              // La ligne 2 change de signe en deuxième donc ligne2 = PPMM ou MMPP selon le signe de c
              ligne2 = ligneMMPP
            } else {
              ligne2 = lignePPMM
            }
            if (e > 0) {
              // La ligne 3 change de signe en troisième donc ligne3 = PPPM ou MMMP selon le signe de e
              ligne3 = ligneMMMP
            } else {
              ligne3 = lignePPPM
            }
            valMoyen = fractionMdc // la moyenne valeur est la solution de la deuxième équation
            valGrand = fractionMfe // la plus grande valeur est la solution de la troisième équation
          } else {
            // Si la deuxième plus petite solution est celle de la troisième équation
            if (c > 0) {
              // La ligne 2 change de signe en troisième donc ligne2 = PPPM ou MMMP selon le signe de c
              ligne2 = ligneMMMP
            } else {
              ligne2 = lignePPPM
            }
            if (e > 0) {
              // La ligne 3 change de signe en deuxième donc ligne3 = PPMM ou MMPP selon le signe de e
              ligne3 = ligneMMPP
            } else {
              ligne3 = lignePPMM
            }
            valMoyen = fractionMfe // la moyenne valeur est la solution de la troisième équation
            valGrand = fractionMdc // la plus grande valeur est la solution de la deuxième équation
          }
        } else if (-d / c < -b / a && -d / c < -f / e) {
          // Si la plus petite solution est celle de la deuxième équation
          if (c > 0) {
            // La ligne2 change de signe en premier donc ligne2 = PMMM ou MPPP selon le signe de c
            ligne2 = ligneMPPP
          } else {
            ligne2 = lignePMMM
          }
          valPetit = fractionMdc // la plus petite valeur est la solution de la deuxième équation
          zero1 = 'd' // le premier antécédent est une valeur interdite
          if (-b / a < -f / e) {
            // Si la deuxième plus petite solution est celle de la première équation
            if (a > 0) {
              // La ligne 1 change de signe en deuxième donc ligne1 = PPMM ou MMPP selon le signe de a
              ligne1 = ligneMMPP
            } else {
              ligne1 = lignePPMM
            }
            if (e > 0) {
              // La ligne 3 change de signe en troisième donc ligne3 = PPPM ou MMMP selon le signe de e
              ligne3 = ligneMMMP
            } else {
              ligne3 = lignePPPM
            }
            valMoyen = fractionMba // la moyenne valeur est la solution de la première équation
            valGrand = fractionMfe // la plus grande valeur est la solution de la troisième équation
            zero3 = 'd' // le troisième antécédent est une valeur interdite
          } else {
            // Si la deuxième plus petite solution est celle de la troisième équation
            if (a > 0) {
              // La ligne 1 change de signe en troisième donc ligne1 = PPPM ou MMMP selon le signe de a
              ligne1 = ligneMMMP
            } else {
              ligne1 = lignePPPM
            }
            if (e > 0) {
              // La ligne 3 change de signe en deuxième donc ligne3 = PPMM ou MMPP selon le signe de e
              ligne3 = ligneMMPP
            } else {
              ligne3 = lignePPMM
            }
            valMoyen = fractionMfe // la moyenne valeur est la solution de la troisième équation
            zero2 = 'd' // le deuxième antécédent est une valeur interdite
            valGrand = fractionMba // la plus grande valeur est la solution de la première équation
          }
        } else {
          // Si la plus petite solution est celle de la troisième équation
          if (e > 0) {
            // La ligne 3 change de signe en premier donc ligne3 = PMMM ou MPPP selon le signe de e
            ligne3 = ligneMPPP
          } else {
            ligne3 = lignePMMM
          }
          valPetit = fractionMfe // la plus petite valeur est la solution de la troisième équation
          zero1 = 'd' // le premier antécédent est une valeur interdite
          if (-b / a < -d / c) {
            // Si la deuxième plus petite solution est celle de la première équation
            if (a > 0) {
              // La ligne 1 change de signe en deuxième donc ligne1 = PPMM ou MMPP selon le signe de a
              ligne1 = ligneMMPP
            } else {
              ligne1 = lignePPMM
            }
            if (c > 0) {
              // La ligne 2 change de signe en troisième donc ligne2 = PPPM ou MMMP selon le signe de c
              ligne2 = ligneMMMP
            } else {
              ligne2 = lignePPPM
            }
            valMoyen = fractionMba // la moyenne valeur est la solution de la première équation
            valGrand = fractionMdc // la plus grande valeur est la solution de la deuxième équation
            zero3 = 'd' // le troisième antécédent est une valeur interdite
          } else {
            // Si la deuxième plus petite solution est celle de la première équation
            if (a > 0) {
              // La ligne 1 change de signe en troisième donc ligne1 = PPPM ou MMMP selon le signe de a
              ligne1 = ligneMMMP
            } else {
              ligne1 = lignePPPM
            }
            if (c > 0) {
              // La ligne 2 change de signe en deuxième donc ligne2 = PPMM ou MMPP selon le signe de c
              ligne2 = ligneMMPP
            } else {
              ligne2 = lignePPMM
            }
            valMoyen = fractionMdc // la moyenne valeur est la solution de la deuxième équation
            zero2 = 'd' // le deuxième antécédent est une valeur interdite
            valGrand = fractionMba // la plus grande valeur est la solution de la première équation
          }
        }
        // Détermine la dernière ligne selon le signe du coefficient dominant
        if (a * c * e > 0) {
          ligne4 = [
            'Line',
            30,
            '',
            0,
            '-',
            20,
            zero1,
            20,
            '+',
            20,
            zero2,
            20,
            '-',
            20,
            zero3,
            20,
            '+',
            20,
          ]
        } else {
          ligne4 = [
            'Line',
            30,
            '',
            0,
            '+',
            20,
            zero1,
            20,
            '-',
            20,
            zero2,
            20,
            '+',
            20,
            zero3,
            20,
            '-',
            20,
          ]
        }
        // Affiche enfin le tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2.5, 30],
              [`$${texFacteur1}$`, 2, 75],
              [`$${texFacteur2}$`, 2, 75],
              [`$${texFacteur3}$`, 2, 75],
              [
                `$\\dfrac{${texFacteur1}}{(${texFacteur2})(${texFacteur3})}$`,
                ecart,
                200,
              ],
            ],
            [
              '$-\\infty$',
              30,
              `$${valPetit}$`,
              20,
              `$${valMoyen}$`,
              20,
              `$${valGrand}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligne1, ligne2, ligne3, ligne4],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 9,
        })
        let solutions1et3
        let solutions2et4
        if (zero1 === 'z') {
          // Si le "vrai zéro" est en première position (les double barres en position 2 et 3), les crochets seront ouverts en valMoyen et valGrand
          solutions1et3 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg${pDroite} \\cup \\bigg] ${valMoyen}${separateur} ${valGrand} \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif1et3 = `]-\\infty${separateur}${valPetit}${pDroite}\\cup]${valMoyen}${separateur}${valGrand}[`
          solutions2et4 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg${pGauche} ${valPetit} ${separateur} ${valMoyen} \\bigg[ \\cup \\bigg] ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif2et4 = `${pGauche}${valPetit}${separateur}${valMoyen}[\\cup]${valGrand}${separateur}+\\infty[`
        } else if (zero2 === 'z') {
          // Si le "vrai zéro" est en deuxième position, les crochets seront ouverts en valPetit et valGrand
          solutions1et3 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg[ \\cup \\bigg${pGauche} ${valMoyen}${separateur} ${valGrand} \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif1et3 = `]-\\infty${separateur}${valPetit}[\\cup${pGauche}${valMoyen}${separateur}${valGrand}[`
          solutions2et4 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] ${valPetit} ${separateur} ${valMoyen} \\bigg${pDroite} \\cup \\bigg] ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif2et4 = `]${valPetit}${separateur}${valMoyen}${pDroite}\\cup]${valGrand}${separateur}+\\infty[`
        } else if (zero3 === 'z') {
          // Si le "vrai zéro" est en troisième position, les crochets seront ouverts en valPetit et valMoyen
          solutions1et3 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg[ \\cup \\bigg] ${valMoyen}${separateur} ${valGrand} \\bigg${pDroite} $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif1et3 = `]-\\infty${separateur}${valPetit}[\\cup]${valMoyen}${separateur}${valGrand}${pDroite}`
          solutions2et4 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] ${valPetit} ${separateur} ${valMoyen} \\bigg[ \\cup \\bigg${pGauche} ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractif2et4 = `]${valPetit}${separateur}${valMoyen}[\\cup${pGauche}${valGrand}${separateur}+\\infty[`
        }
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        if (signes[i] === '<' || signes[i] === '≤') {
          if (a * c * e > 0) {
            texteCorr += solutions1et3
            correctionInteractif = correctionInteractif1et3
          } else {
            texteCorr += solutions2et4
            correctionInteractif = correctionInteractif2et4
          }
        } else if (signes[i] === '>' || signes[i] === '≥') {
          if (a * c * e > 0) {
            texteCorr += solutions2et4
            correctionInteractif = correctionInteractif2et4
          } else {
            texteCorr += solutions1et3
            correctionInteractif = correctionInteractif1et3
          }
        }
      } else if (listeTypeDeQuestions[i] === '(ax+b)/(cx+d)²<0') {
        const formeFacteur1 = randint(0, 1) // 0 → (ax+b), 1 → (b+ax)
        const formeFacteur2 = randint(0, 1) // 0 → (cx+d), 1 → (d+cx)

        const texFacteur1 =
          formeFacteur1 === 0 || this.sup2
            ? `${a}x${ecritureAlgebrique(b)}`
            : `${b}${ecritureAlgebrique(a)}x`

        const texFacteur2 =
          formeFacteur2 === 0 || this.sup2
            ? `${c}x${ecritureAlgebrique(d)}`
            : `${d}${ecritureAlgebrique(c)}x`

        let valPetit, valGrand
        texte = `$\\dfrac{${texFacteur1}}{(${texFacteur2})^2} ${texSymbole(signes[i])} 0$`
        texteCorr = `${texte} <br>
$\\bullet$ On commence par chercher les éventuelles valeurs interdites${sp()}:<br>
$(${texFacteur2})^2 = 0$ si et seulement si $${c}x${ecritureAlgebrique(d)} = 0$.`
        ecrireCorrectionDetaillee(c, d, true)
        const fractionMdc = new FractionEtendue(-d, c).texFractionSimplifiee
        const fractionMba = new FractionEtendue(-b, a).texFractionSimplifiee
        texteCorr += `<br>Le quotient est défini sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$.<br>
$\\bullet$ On résout l'inéquation sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$${sp()}:`
        if (this.correctionDetaillee) {
          ecrireCorrectionDetaillee(a, b)
          texteCorr += `<br>Un carré étant toujours positif, $(${texFacteur2})^2 > 0$ pour tout $x$ différent de $${fractionMdc}$.`
        } else {
          if (c < 0) {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMba}$.`
          } else {
            texteCorr += `<br>$${texFacteur1}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMba}$.`
          }
          texteCorr += `<br>Un carré étant toujours positif, $(${texFacteur2})^2 > 0$ pour tout $x$ différent de $${fractionMdc}$.`
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          `<br>On peut donc en déduire le tableau de signes suivant${sp()}:<br>`
        if (-d / c < -b / a) {
          // Si la première racine est la racine double
          ligne2 = [
            'Line',
            30,
            '',
            0,
            '+',
            20,
            'z',
            20,
            '+',
            20,
            't',
            20,
            '+',
            20,
          ]
          valPetit = fractionMdc // la plus petite valeur est la solution de la première équation
          valGrand = fractionMba // la plus grande valeur est la solution de la deuxième équation
          if (a > 0) {
            ligne1 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              't',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ]
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'd',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ]
          } else {
            ligne1 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              't',
              20,
              '+',
              20,
              'z',
              20,
              '-',
              20,
            ]
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'd',
              20,
              '+',
              20,
              'z',
              20,
              '-',
              20,
            ]
          }
        } else {
          // Si la racine double est la deuxième
          ligne2 = [
            'Line',
            30,
            '',
            0,
            '+',
            20,
            't',
            20,
            '+',
            20,
            'z',
            20,
            '+',
            20,
          ]
          valPetit = fractionMba // la plus petite valeur est la solution de la deuxième équation
          valGrand = fractionMdc // la plus grande valeur est la solution de la première équation
          if (a > 0) {
            ligne1 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'z',
              20,
              '+',
              20,
              't',
              20,
              '+',
              20,
            ]
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'z',
              20,
              '+',
              20,
              'd',
              20,
              '+',
              20,
            ]
          } else {
            ligne1 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'z',
              20,
              '-',
              20,
              't',
              20,
              '-',
              20,
            ]
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'z',
              20,
              '-',
              20,
              'd',
              20,
              '-',
              20,
            ]
          }
        }
        // Affiche le tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2.5, 30],
              [`$${texFacteur1}$`, 2, 75],
              [`$(${texFacteur2})^2$`, 2, 75],
              [`$\\dfrac{${texFacteur1}}{(${texFacteur2})^2}$`, ecart, 200],
            ],
            [
              '$-\\infty$',
              30,
              `$${valPetit}$`,
              20,
              `$${valGrand}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligne1, ligne2, ligne3],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 10,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        let gauche: string
        let droite: string
        if (-d / c < -b / a) {
          // Si la première racine est la valeur interdite, on la prive à gauche
          gauche = `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty${separateur} ${fractionMba} \\right${pDroite} \\backslash \\{${fractionMdc}\\} $.`
          correctionInteractifGauche = [
            `]-\\infty${separateur}${fractionMba}${pDroite}\\backslash\\{${fractionMdc}\\}`,
            `]-\\infty${separateur}${fractionMdc}[\\cup]${fractionMdc}${separateur}${fractionMba}${pDroite}`,
          ]
          droite = `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${fractionMba}${separateur} +\\infty \\right[ $.`
          correctionInteractifDroite = [
            `${pGauche}${fractionMba}${separateur}+\\infty[`,
          ]
        } else {
          // Sinon, on la prive à droite
          gauche = `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty${separateur} ${fractionMba} \\right${pDroite} $.`
          correctionInteractifGauche = [
            `]-\\infty${separateur}${fractionMba}${pDroite}`,
          ]
          droite = `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${fractionMba}${separateur} +\\infty \\right[ \\backslash \\{${fractionMdc}\\} $.`
          correctionInteractifDroite = [
            `${pGauche}${fractionMba}${separateur}+\\infty[\\backslash\\{${fractionMdc}\\}`,
            `${pGauche}${fractionMba}${separateur}${fractionMdc}[\\cup]${fractionMdc}${separateur}+\\infty[`,
          ]
        }
        if (signes[i] === '<' || signes[i] === '≤') {
          if (a > 0) {
            texteCorr += gauche
            correctionInteractif = correctionInteractifGauche
          } else {
            texteCorr += droite
            correctionInteractif = correctionInteractifDroite
          }
        } else if (signes[i] === '>' || signes[i] === '≥') {
          if (a > 0) {
            texteCorr += droite
            correctionInteractif = correctionInteractifDroite
          } else {
            texteCorr += gauche
            correctionInteractif = correctionInteractifGauche
          }
        }
      } else if (listeTypeDeQuestions[i] === '(ax+b)/(cx+d)+e<0') {
        const formeFacteur1 = randint(0, 1) // 0 → (ax+b), 1 → (b+ax)
        const formeFacteur2 = randint(0, 1) // 0 → (cx+d), 1 → (d+cx)

        const texFacteur1 =
          formeFacteur1 === 0 || this.sup2
            ? `${a}x${ecritureAlgebrique(b)}`
            : `${b}${ecritureAlgebrique(a)}x`

        const texFacteur2 =
          formeFacteur2 === 0 || this.sup2
            ? `${c}x${ecritureAlgebrique(d)}`
            : `${d}${ecritureAlgebrique(c)}x`

        let valPetit, valGrand
        texte = `$\\dfrac{${texFacteur1}}{${texFacteur2}}${ecritureAlgebrique(e)} ${texSymbole(signes[i])} 0$`
        texteCorr = `${texte} <br>
$\\bullet$ On commence par chercher les éventuelles valeurs interdites${sp()}:`
        ecrireCorrectionDetaillee(c, d, true)
        const fractionMdc = new FractionEtendue(-d, c).texFractionSimplifiee
        const fractionSimplifiee = new FractionEtendue(-(b + e * d), a + e * c)
          .texFractionSimplifiee
        texteCorr += `<br>Le quotient est défini sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$.<br>
$\\bullet$ On résout l'inéquation sur $\\R ${texSymbole('\\')} \\{${fractionMdc}\\}$${sp()}:`
        if (this.correctionDetaillee) {
          texteCorr += `<br> $\\begin{aligned}
          \\dfrac{${texFacteur1}}{${texFacteur2}} ${ecritureAlgebrique(e)} &= \\dfrac{${texFacteur1}}{${texFacteur2}} ${ecritureAlgebrique(e)} \\times \\dfrac{${texFacteur2}}{${texFacteur2}} \\\\
          &= \\dfrac{${texFacteur1}}{${texFacteur2}} + \\dfrac{${e * c}x${ecritureAlgebrique(e * d)}}{${texFacteur2}} \\\\
          &= \\dfrac{${texFacteur1} ${ecritureAlgebrique(e * c)}x${ecritureAlgebrique(e * d)}}{${texFacteur2}} \\\\
          &= \\dfrac{${a + e * c}x${ecritureAlgebrique(b + e * d)}}{${texFacteur2}}
          \\end{aligned}$`
          ecrireCorrectionDetaillee(a + e * c, b + e * d)
          ecrireCorrectionDetaillee(c, d)
        } else {
          texteCorr += `<br> $\\dfrac{${texFacteur1}}{${texFacteur2}} ${ecritureAlgebrique(e)} = \\dfrac{${a + e * c}x${ecritureAlgebrique(b + e * d)}}{${texFacteur2}}$`
          if (a + e * c < 0) {
            texteCorr += `<br>$${a + e * c}x${ecritureAlgebrique(b + e * d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionSimplifiee}$.`
          } else {
            texteCorr += `<br>$${a + e * c}x${ecritureAlgebrique(b + e * d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionSimplifiee}$.`
          }
          if (c < 0) {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${fractionMdc}$.`
          } else {
            texteCorr += `<br>$${texFacteur2}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${fractionMdc}$.`
          }
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          `<br>On peut donc en déduire le tableau de signes suivant${sp()}:<br>`
        if (-(b + e * d) / (a + e * c) < -d / c) {
          // Si la plus petite solution est celle de la première équation
          if (a + e * c > 0) {
            // La ligne1 change de signe en premier donc ligne1 = PMM ou MPP selon le signe de a
            ligne1 = ligneMPP
          } else {
            ligne1 = lignePMM
          }
          if (c > 0) {
            // La ligne 2 change de signe en deuxième donc ligne2 = PPM ou MMP selon le signe de c
            ligne2 = ligneMMP
          } else {
            ligne2 = lignePPM
          }
          valPetit = fractionSimplifiee // la plus petite valeur est la solution de la première équation
          valGrand = fractionMdc // la plus grande valeur est la solution de la deuxième équation
        } else {
          // Si la plus petite solution est celle de la deuxième équation
          if (a + e * c > 0) {
            // La ligne1 change de signe en deuxième donc ligne1 = PPM ou MMP selon le signe de a
            ligne1 = ligneMMP
          } else {
            ligne1 = lignePPM
          }
          if (c > 0) {
            // La ligne 2 change de signe en premier donc ligne2 = PMM ou MPP selon le signe de c
            ligne2 = ligneMPP
          } else {
            ligne2 = lignePMM
          }
          valPetit = fractionMdc // la plus petite valeur est la solution de la deuxième équation
          valGrand = fractionSimplifiee // la plus grande valeur est la solution de la première équation
        }
        // Détermine la dernière ligne selon le signe du coefficient dominant
        if (-(b + e * d) / (a + e * c) < -d / c) {
          // Si la valeur interdite est la deuxième (z au lieu de d)
          if ((a + e * c) * c > 0) {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'z',
              20,
              '-',
              20,
              'd',
              20,
              '+',
              20,
            ]
          } else {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'z',
              20,
              '+',
              20,
              'd',
              20,
              '-',
              20,
            ]
          }
        } else {
          // Sinon, la valeur interdite est la première
          if ((a + e * c) * c > 0) {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '+',
              20,
              'd',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ]
          } else {
            ligne3 = [
              'Line',
              30,
              '',
              0,
              '-',
              20,
              'd',
              20,
              '+',
              20,
              'z',
              20,
              '-',
              20,
            ]
          }
        }
        // Affiche enfin le tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2.5, 30],
              [`$${a + e * c}x${ecritureAlgebrique(b + e * d)}$`, 2, 75],
              [`$${texFacteur2}$`, 2, 75],
              [
                `$\\dfrac{${a + e * c}x${ecritureAlgebrique(b + e * d)}}{${texFacteur2}}$`,
                ecart,
                200,
              ],
            ],
            [
              '$-\\infty$',
              30,
              `$${valPetit}$`,
              20,
              `$${valGrand}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligne1, ligne2, ligne3],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 10,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        let interieur, exterieur
        if (-(b + e * d) / (a + e * c) < -d / c) {
          // Si la valeur interdite est la deuxième (intervale forcément ouvert avec valGrand)
          interieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${valPetit} ${separateur} ${valGrand} \\right[ $.`
          correctionInteractifInterieur = `${pGauche}${valPetit}${separateur}${valGrand}[`
          exterieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg${pDroite} \\cup \\bigg] ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractifExterieur = `]-\\infty${separateur}${valPetit}${pDroite}\\cup]${valGrand}${separateur}+\\infty[`
        } else {
          // Si la valeur interdite est la première (invervalle forcément ouvert avec valPetit)
          interieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\left] ${valPetit} ${separateur} ${valGrand} \\right${pDroite} $.`
          correctionInteractifInterieur = `]${valPetit}${separateur}${valGrand}${pDroite}`
          exterieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg[ \\cup \\bigg${pGauche} ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
          correctionInteractifExterieur = `]-\\infty${separateur}${valPetit}[\\cup${pGauche}${valGrand}${separateur}+\\infty[`
        }
        if (signes[i] === '<' || signes[i] === '≤') {
          if ((a + e * c) * c > 0) {
            texteCorr += interieur
            correctionInteractif = correctionInteractifInterieur
          } else {
            texteCorr += exterieur
            correctionInteractif = correctionInteractifExterieur
          }
        } else if (signes[i] === '>' || signes[i] === '≥') {
          if ((a + e * c) * c > 0) {
            texteCorr += exterieur
            correctionInteractif = correctionInteractifExterieur
          } else {
            texteCorr += interieur
            correctionInteractif = correctionInteractifInterieur
          }
        }
      }
      if (Array.isArray(correctionInteractif)) {
        correctionInteractif.map((c) =>
          c.replaceAll('dfrac', 'frac').replace('bigcup', 'cup'),
        )
      } else {
        correctionInteractif = correctionInteractif
          .replaceAll('dfrac', 'frac')
          .replace('bigcup', 'cup')
      }
      if (this.interactif && !context.isAmc) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierEnsemble,
          { texteAvant: '<br>S = ' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: correctionInteractif,
            options: { intervalle: true },
          },
        })
      }
      if (this.questionJamaisPosee(i, a, b, c, e, d)) {
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer.slice(0, -1).replaceAll(sp(1), '').replaceAll('\\bigg', ''))}$` + '.' // Gestion du point final
        // Fin de cette uniformisation

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
