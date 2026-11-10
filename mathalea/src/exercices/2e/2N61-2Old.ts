import { lampeMessage } from '../../lib/format/message'
import { texSymbole, texteGras } from '../../lib/format/style'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const dateDeModifImportante = '03/04/2022'

export const titre = 'Résoudre une inéquation-produit'

/**
 * Résoudre une inéquation produit
 * * Type 1 : (x+a)(x+b)<0
 * * Type 2 : (x+a)(x+b)(x+c)<0
 * * Type 3 : (ax+b)(cx+d)<0
 * * Type 4 : (ax+b)(cx+d)(ex+f)<0
 * * Type 5 : (ax+b)²(cx+d)<0
 * * Tous les types
 * @author Guillaume Valmont
 */
export const uuid = '014a4'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceInequationProduitOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Type d'inéquation",
      6,
      '1: (x+a)(x+b)<0\n2: (x+a)(x+b)(x+c)<0\n3: (ax+b)(cx+d)<0\n4: (ax+b)(cx+d)(ex+f)<0\n5: (ax+b)²(cx+d)<0\n6: Tous les types précédents',
    ]
    this.spacing = 2 // Espace entre deux lignes
    this.spacingCorr = 2 // Espace entre deux lignes pour la correction
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false // Désactive la correction détaillée par défaut
    this.sup = 1 // Choix du type d'inéquation
    this.nbQuestions = 4 // Choix du nombre de questions
  }

  nouvelleVersion() {
    let listeTypeDeQuestions // Stockera la liste des types de questions
    let correctionInteractif: string[] // Pour récupérer l'intervalle solution à saisir
    const separateur = ';'
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les inéquations suivantes'
        : "l'inéquation suivante") +
      '.'
    // Convertit le paramètre this.sup en type de question
    switch (this.sup.toString()) {
      case '1':
        listeTypeDeQuestions = ['(x+a)(x+b)<0']
        break
      case '2':
        listeTypeDeQuestions = ['(x+a)(x+b)(x+c)<0']
        break
      case '3':
        listeTypeDeQuestions = ['(ax+b)(cx+d)<0']
        break
      case '4':
        listeTypeDeQuestions = ['(ax+b)(cx+d)(ex+f)<0']
        break
      case '5':
        listeTypeDeQuestions = ['(ax+b)²(cx+d)<0']
        break
      default:
        listeTypeDeQuestions = [
          '(x+a)(x+b)<0',
          '(x+a)(x+b)(x+c)<0',
          '(ax+b)(cx+d)<0',
          '(ax+b)(cx+d)(ex+f)<0',
          '(ax+b)²(cx+d)<0',
        ]
        break
    }
    // Crée une liste randomisée de types de questions respectant le nombre (this.nbQuestions) et le type (this.sup) de questions passés en paramètre
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    // Crée une liste d'autant de signes que de questions
    const signes: ('≤' | '≥' | '<' | '>' | '\\')[] = combinaisonListes(
      ['<', '>', '≤', '≥'],
      this.nbQuestions,
    )
    // Boucle principale qui servira à créer toutes les questions // On limite le nombre d'essais à 50 pour chercher des valeurs nouvelles
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Génère 4 nombres relatifs a, b, c et d tous différents avec a et c qui ne peuvent pas être 1 car ce sont ceux qui peuvent multiplier x pour éviter à la fois d'avoir '1x' et de diviser par 1
      const a = randint(-13, 13, [0, 1, -1])
      const b = randint(-13, 13, [0, a])
      const c = randint(-13, 13, [0, 1, -1, a, b])
      const d = randint(-13, 13, [0, a, b, c, (b * c) / a]) // Pour éviter que ax + b et cx + d n'aient la même racine
      const e = randint(-13, 13, [0, 1, -1, a, b, c, d])
      const f = randint(-13, 13, [0, a, b, c, d, e, (b * e) / a, (d * e) / c]) // Pour éviter que (ax + b et ex + f) ou (cx + d et ex + f) n'aient la même racine
      // Pioche un signe d'inégalité parmi <, ≤, ≥, > et définit en fonction si les crochets seront ouverts ou fermés dans l'ensemble de solutions
      let pGauche: ']' | '['
      let pDroite: ']' | '['
      let texte = ''
      let texteCorr = ''
      let ligne1: (number | string)[]
      let ligne2: (number | string)[]
      let ligne3: (number | string)[]
      let ligne4: (number | string)[]
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
        default:
          pGauche = '['
          pDroite = ']'
          break
      }
      // Fonction détaillant la résolution d'une équation de type x + val
      const resolutionDetailleeEquation = function (val: number) {
        texteCorr += `$x${ecritureAlgebrique(val)}${texSymbole('>')}0$ <br>`
        texteCorr += `$x${ecritureAlgebrique(val)}${miseEnEvidence(ecritureAlgebrique(-1 * val), bleuMathalea)}
        ${texSymbole('>')}${miseEnEvidence(ecritureAlgebrique(-1 * val), bleuMathalea)}$<br>`
        texteCorr += `$x${texSymbole('>')}${-val}$<br>`
      }
      // Fonction écrivant la correction détaillée d'une inéquation du type var1*x + var2 > 0
      const ecrireCorrectionDetaillee = function (
        var1: number,
        var2: number,
        egal = false,
      ) {
        let symbolePlusGrand = texSymbole('>')
        let symbolePlusPetit = texSymbole('<')
        if (egal) {
          symbolePlusGrand = '='
          symbolePlusPetit = '='
        }
        // Détaille les étapes de la résolution en mettant en évidence les calculs réalisés.
        texteCorr += `<br>$${var1}x${ecritureAlgebrique(var2)}${symbolePlusGrand}0$ <br>`
        texteCorr += `$${var1}x${ecritureAlgebrique(var2)}${miseEnEvidence(ecritureAlgebrique(-1 * var2), bleuMathalea)}
        ${symbolePlusGrand}${miseEnEvidence(ecritureAlgebrique(-1 * var2), bleuMathalea)}$<br>`
        texteCorr += `$${var1}x${symbolePlusGrand}${-var2}$<br>`
        // Si var1 < 0, l'inégalité change de sens
        if (var1 < 0) {
          texteCorr += `$${var1}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(var1), bleuMathalea)}`
          if (egal) {
            // On met en évidence un > qui se change en <, pas un = qui ne change pas
            texteCorr += symbolePlusPetit
          } else {
            texteCorr += miseEnEvidence(symbolePlusPetit, bleuMathalea)
          }
          texteCorr += `${String(-var2) + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(var1), bleuMathalea)}$<br>`
          texteCorr += `$x${symbolePlusPetit}${texFractionFromString(-var2, var1)}$`
          texteCorr += `<br>Donc $${var1}x${ecritureAlgebrique(var2)}${symbolePlusGrand}0$ si et seulement si $x${symbolePlusPetit} ${texFractionReduite(-var2, var1)}$.`
        } else {
          // sinon elle ne change pas de sens
          texteCorr += `$${var1}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(var1), bleuMathalea)}
            ${symbolePlusGrand}${-var2 + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(var1), bleuMathalea)}$<br>`
          texteCorr += `$x${symbolePlusGrand} ${texFractionFromString(-var2, var1)}$`
          texteCorr += `<br>Donc $${var1}x${ecritureAlgebrique(var2)}${symbolePlusGrand}0$ si et seulement si $x${symbolePlusGrand}${texFractionReduite(-var2, var1)}$.`
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
      // Paramètre la largeur des colonnes
      const lgt = 10 // Première colonne
      const deltacl = 0.8 // Distance entre la bordure et les premiers et derniers antécédents
      const espcl = context.isHtml ? 3.5 : 2.5 // Espace entre les antécédents
      // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Génère la consigne (texte) et la correction (texteCorr) pour les questions de type '(x+a)(x+b)<0'                                      Type 1        //
      // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      if (listeTypeDeQuestions[i] === '(x+a)(x+b)<0') {
        // Consigne
        texte = `$(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})${texSymbole(signes[i])}0$`
        // Correction // Si une correction détaillée est demandée, détaille comment résoudre les équations
        texteCorr = texte + '<br>'
        // Première équation
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(a)
        }
        texteCorr += `$x${ecritureAlgebrique(a)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')}${-a}$.<br>`
        // Deuxième équation
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(b)
        }
        texteCorr += `$x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')}${-b}$.<br>`
        // Prépare l'affichage du tableau de signes : la ligne1 correspond à (x + a) et la ligne2 correspond à (x + b)
        texteCorr +=
          'On peut donc en déduire le tableau de signes suivant : <br>'
        // Si la racine de x + a est inférieure à la racine de x + b, la ligne1 (celle de x + a) aura d'abord un 0, puis un | et ce sera l'inverse pour la ligne2
        if (Math.min(-a, -b) === -a) {
          ligne1 = ligneMPP
          ligne2 = ligneMMP
        } else {
          // Si la racine de x + a est supérieure à la racine de x + b, ligne2 et ligne1 sont inversées (pas d'égalité possible car a ≠ b)
          ligne1 = ligneMMP
          ligne2 = ligneMPP
        }
        // Affiche le tableau de signes : xmin détermine la marge à gauche, ymin la hauteur réservée pour le tableau, xmax la largeur réservée pour le tableau et ymax la marge au-dessus du tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
              ['$x$', 2, 30],
              [`$x${ecritureAlgebrique(a)}$`, 2, 50],
              [`$x${ecritureAlgebrique(b)}$`, 2, 50],
              [
                `$(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})$`,
                2,
                100,
              ],
            ],
            // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
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
          // Les autres lignes du tableau dont le fonctionnement est expliqué plus haut
          tabLines: [
            ligne1,
            ligne2,
            ['Line', 30, '', 0, '+', 20, 'z', 20, '-', 20, 'z', 20, '+', 20],
          ],
          // colorBackground: '',
          espcl,
          deltacl,
          lgt,
        })
        // Affiche l'ensemble de solutions
        if (signes[i] === '<' || signes[i] === '≤') {
          texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${Math.min(-a, -b)} ${separateur} ${Math.max(-a, -b)} \\right${pDroite} $.`
          correctionInteractif = [
            `${pGauche}${Math.min(-a, -b)}${separateur}${Math.max(-a, -b)}${pDroite}`,
          ]
        } else {
          //  if ((signes[i] === '>' || signes[i] === '≥')) // condition inutile JCL le 05/02/2025
          texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty ${separateur} ${Math.min(-a, -b)} \\right${pDroite} \\cup \\left${pGauche} ${Math.max(-a, -b)}, +\\infty \\right[ $.`
          correctionInteractif = [
            `]-\\infty${separateur}${Math.min(-a, -b)}${pDroite}\\cup${pGauche}${Math.max(-a, -b)}${separateur}+\\infty[`,
          ]
        }
      } else if (listeTypeDeQuestions[i] === '(x+a)(x+b)(x+c)<0') {
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Génère la consigne (texte) et la correction (texteCorr) pour les questions de type '(x+a)(x+b)(x+c)<0'                                 Type 2        //
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Consigne
        texte = `$(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})(x${ecritureAlgebrique(c)})${texSymbole(signes[i])}0$`
        // Correction // Si une correction détaillée est demandée, détaille comment résoudre les équations
        texteCorr = texte + '<br>'
        // Première équation
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(a)
        }
        texteCorr += `$x${ecritureAlgebrique(a)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')}${-a}$.<br>`
        // Deuxième équation
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(b)
        }
        texteCorr += `$x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')}${-b}$.<br>`
        // Troisième équation
        if (this.correctionDetaillee) {
          resolutionDetailleeEquation(c)
        }
        texteCorr += `$x${ecritureAlgebrique(c)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')}${-c}$.<br>`
        // On range les racines dans l'ordre croissant pour pouvoir les mettre dans l'ordre dans le tableau
        const racines = [-a, -b, -c].sort(function (a, b) {
          return a - b
        })
        const lignesNombre = [-a, -b, -c]
        const lignes: (number | string)[][] = []
        // Pour chaque ligne, on cherche la racine correspondante
        for (let j = 0; j < 3; j++) {
          for (let n = 0; n < 3; n++) {
            if (racines[n] === lignesNombre[j]) {
              if (n === 0) {
                // La racine d'indice 0 est la plus petite des trois, et donc celle la plus à gauche dans le tableau donc le 0 (, 'z', 20) est en première position et les autres sont des | (, 't', 5)
                lignes[j] = [
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
              } else if (n === 1) {
                // La racine d'indice 1 est la deuxième racine, donc le 0 (, 'z', 20) en deuxième position et les autres sont des | (, 't', 5)
                lignes[j] = [
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
              } else if (n === 2) {
                // La racine d'indice 2 est la plus grande des racines, donc le 0 (, 'z', 20) est en troisième position et les autres sont des | (, 't', 5)
                lignes[j] = [
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
              }
            }
          }
        }
        // Affiche le tableau de signes (voir les commentaires du premier type d'exercice)
        texteCorr +=
          'On peut donc en déduire le tableau de signes suivant : <br>'
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 30],
              [`$x${ecritureAlgebrique(a)}$`, 2, 50],
              [`$x${ecritureAlgebrique(b)}$`, 2, 50],
              [`$x${ecritureAlgebrique(c)}$`, 2, 50],
              [
                `$(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})(x${ecritureAlgebrique(c)})$`,
                2,
                150,
              ],
            ],

            [
              '$-\\infty$',
              30,
              `$${racines[0]}$`,
              20,
              `$${racines[1]}$`,
              20,
              `$${racines[2]}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [
            lignes[0],
            lignes[1],
            lignes[2],
            [
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
              'z',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ],
          ],
          // colorBackground: '',
          espcl,
          deltacl,
          lgt,
        })
        // Affiche l'ensemble de solutions
        if (signes[i] === '<' || signes[i] === '≤') {
          texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left] -\\infty ${separateur} ${racines[0]} \\right${pDroite} \\cup \\left${pGauche} ${racines[1]}, ${racines[2]} \\right${pDroite} $.`
          correctionInteractif = [
            `]-\\infty,${racines[0]}${pDroite}\\cup${pGauche}${racines[1]},${racines[2]}${pDroite}`,
          ]
        } else {
          // if ((signes[i] === '>' || signes[i] === '≥')) // condition inutile JCL le 05/02/2025
          texteCorr += `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${racines[0]} ${separateur} ${racines[1]} \\right${pDroite} \\cup \\left${pGauche} ${racines[2]}, +\\infty \\right[ $.`
          correctionInteractif = [
            `${pGauche}${racines[0]}${separateur}${racines[1]}${pDroite}\\cup${pGauche}${racines[2]}${separateur}+\\infty[`,
          ]
        }
      } else if (listeTypeDeQuestions[i] === '(ax+b)(cx+d)<0') {
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Génère la consigne (texte) et la correction (texteCorr) pour les questions de type '(ax+b)(cx+d)<0'                                    Type 3        //
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let valPetit, valGrand
        texte = `$(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})${texSymbole(signes[i])}0$`
        // Correction
        texteCorr = texte
        // Si une correction détaillée est demandée, détaille comment résoudre les équations
        if (this.correctionDetaillee) {
          // Utilise la fonction décrite plus haut pour éviter d'écrire deux fois la même chose pour les deux inéquations ax + b > 0 et cx + d > 0
          ecrireCorrectionDetaillee(a, b)
          ecrireCorrectionDetaillee(c, d)
        } else {
          // Si pas de correction détaillée, écrit simplement les conclusions, en changeant le sens des inégalités si a < 0 ou si c < 0
          if (a < 0) {
            texteCorr += `<br>$${a}x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-b, a)}$.`
          } else {
            texteCorr += `<br>$${a}x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-b, a)}$.`
          }
          if (c < 0) {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-d, c)}$.`
          } else {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-d, c)}$.`
          }
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          '<br>On peut donc en déduire le tableau de signes suivant : <br>'
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
          valPetit = texFractionReduite(-b, a) // la plus petite valeur est la solution de la première équation
          valGrand = texFractionReduite(-d, c) // la plus grande valeur est la solution de la deuxième équation
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
          valPetit = texFractionReduite(-d, c) // la plus petite valeur est la solution de la deuxième équation
          valGrand = texFractionReduite(-b, a) // la plus grande valeur est la solution de la première équation
        }
        // Détermine la dernière ligne selon le signe du coefficient dominant
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
            'z',
            20,
            '+',
            20,
            'z',
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
              [`$${a}x${ecritureAlgebrique(b)}$`, 2, 75],
              [`$${c}x${ecritureAlgebrique(d)}$`, 2, 75],
              [
                `$(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})$`,
                2,
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
          // colorBackground: '',
          espcl,
          deltacl,
          lgt,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        const interieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\left${pGauche} ${valPetit} ${separateur} ${valGrand} \\right${pDroite} $.`
        const exterieur = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg${pDroite} \\cup \\bigg${pGauche} ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
        if (signes[i] === '<' || signes[i] === '≤') {
          if (a * c > 0) {
            texteCorr += interieur
            correctionInteractif = [
              `${pGauche}${valPetit}${separateur}${valGrand}${pDroite}`,
            ]
          } else {
            texteCorr += exterieur
            correctionInteractif = [
              `]-\\infty${separateur}${valPetit}${pDroite}\\cup${pGauche}${valGrand}${separateur}+\\infty[`,
            ]
          }
        } else {
          //  if ((signes[i] === '>' || signes[i] === '≥'))  // condition inutile JCL le 05/02/2025
          if (a * c > 0) {
            texteCorr += exterieur
            correctionInteractif = [
              `]-\\infty${separateur}${valPetit}${pDroite}\\cup${pGauche}${valGrand}${separateur}+\\infty[`,
            ]
          } else {
            texteCorr += interieur
            correctionInteractif = [
              `${pGauche}${valPetit}${separateur}${valGrand}${pDroite}`,
            ]
          }
        }
        correctionInteractif[0] = correctionInteractif[0].replaceAll(
          'dfrac',
          'frac',
        )
      } else if (listeTypeDeQuestions[i] === '(ax+b)(cx+d)(ex+f)<0') {
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Génère la consigne (texte) et la correction (texteCorr) pour les questions de type '(ax+b)(cx+d)(ex+f)<0'                                    Type 4  //
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let valPetit, valMoyen, valGrand
        texte = `$(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})(${e}x${ecritureAlgebrique(f)})${texSymbole(signes[i])}0$`
        // Correction
        texteCorr = texte
        // Si une correction détaillée est demandée, détaille comment résoudre les équations
        if (this.correctionDetaillee) {
          // Utilise la fonction décrite plus haut pour éviter d'écrire deux fois la même chose pour les deux inéquations ax + b > 0 et cx + d > 0
          ecrireCorrectionDetaillee(a, b)
          ecrireCorrectionDetaillee(c, d)
          ecrireCorrectionDetaillee(e, f)
        } else {
          // Si pas de correction détaillée, écrit simplement les conclusions, en changeant le sens des inégalités si a < 0 ou si c < 0
          if (a < 0) {
            texteCorr += `<br>$${a}x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-b, a)}$.`
          } else {
            texteCorr += `<br>$${a}x${ecritureAlgebrique(b)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-b, a)}$.`
          }
          if (c < 0) {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-d, c)}$.`
          } else {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-d, c)}$.`
          }
          if (e < 0) {
            texteCorr += `<br>$${e}x${ecritureAlgebrique(f)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-f, e)}$.`
          } else {
            texteCorr += `<br>$${e}x${ecritureAlgebrique(f)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-f, e)}$.`
          }
        }
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          '<br>On peut donc en déduire le tableau de signes suivant : <br>'
        if (-b / a < -d / c && -b / a < -f / e) {
          // Si la plus petite solution est celle de la première équation
          if (a > 0) {
            // La ligne1 change de signe en premier donc ligne1 = PMMM ou MPPP selon le signe de a
            ligne1 = ligneMPPP
          } else {
            ligne1 = lignePMMM
          }
          valPetit = texFractionReduite(-b, a) // la plus petite valeur est la solution de la première équation
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
            valMoyen = texFractionReduite(-d, c) // la moyenne valeur est la solution de la deuxième équation
            valGrand = texFractionReduite(-f, e) // la plus grande valeur est la solution de la troisième équation
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
            valMoyen = texFractionReduite(-f, e) // la moyenne valeur est la solution de la troisième équation
            valGrand = texFractionReduite(-d, c) // la plus grande valeur est la solution de la deuxième équation
          }
        } else if (-d / c < -b / a && -d / c < -f / e) {
          // Si la plus petite solution est celle de la deuxième équation
          if (c > 0) {
            // La ligne2 change de signe en premier donc ligne2 = PMMM ou MPPP selon le signe de c
            ligne2 = ligneMPPP
          } else {
            ligne2 = lignePMMM
          }
          valPetit = texFractionReduite(-d, c) // la plus petite valeur est la solution de la deuxième équation
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
            valMoyen = texFractionReduite(-b, a) // la moyenne valeur est la solution de la première équation
            valGrand = texFractionReduite(-f, e) // la plus grande valeur est la solution de la troisième équation
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
            valMoyen = texFractionReduite(-f, e) // la moyenne valeur est la solution de la troisième équation
            valGrand = texFractionReduite(-b, a) // la plus grande valeur est la solution de la première équation
          }
        } else {
          // Si la plus petite solution est celle de la troisième équation
          if (e > 0) {
            // La ligne 3 change de signe en premier donc ligne3 = PMMM ou MPPP selon le signe de e
            ligne3 = ligneMPPP
          } else {
            ligne3 = lignePMMM
          }
          valPetit = texFractionReduite(-f, e) // la plus petite valeur est la solution de la troisième équation
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
            valMoyen = texFractionReduite(-b, a) // la moyenne valeur est la solution de la première équation
            valGrand = texFractionReduite(-d, c) // la plus grande valeur est la solution de la deuxième équation
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
            valMoyen = texFractionReduite(-d, c) // la moyenne valeur est la solution de la deuxième équation
            valGrand = texFractionReduite(-b, a) // la plus grande valeur est la solution de la première équation
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
            'z',
            20,
            '+',
            20,
            'z',
            20,
            '-',
            20,
            'z',
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
            'z',
            20,
            '-',
            20,
            'z',
            20,
            '+',
            20,
            'z',
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
              [`$${a}x${ecritureAlgebrique(b)}$`, 2, 75],
              [`$${c}x${ecritureAlgebrique(d)}$`, 2, 75],
              [`$${e}x${ecritureAlgebrique(f)}$`, 2, 75],
              [
                `$(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})(${e}x${ecritureAlgebrique(f)})$`,
                2,
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
          // colorBackground: '',
          espcl,
          deltacl,
          lgt,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        const solutions1et3 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg] -\\infty ${separateur} ${valPetit} \\bigg${pDroite} \\cup \\bigg${pGauche} ${valMoyen}${separateur} ${valGrand} \\bigg${pDroite} $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
        const solutions2et4 = `<br> L'ensemble de solutions de l'inéquation est $S = \\bigg${pGauche} ${valPetit} ${separateur} ${valMoyen} \\bigg${pDroite} \\cup \\bigg${pGauche} ${valGrand}${separateur} +\\infty \\bigg[ $.` // \\bigg au lieu de \\left et \\right pour que les parenthèses soient les mêmes des deux côtés s'il y a une fraction d'un côté et pas de l'autre
        if (signes[i] === '<' || signes[i] === '≤') {
          if (a * c * e > 0) {
            texteCorr += solutions1et3
            correctionInteractif = [
              `]-\\infty${separateur}${valPetit}${pDroite}\\cup${pGauche}${valMoyen}${separateur}${valGrand}${pDroite}`,
            ]
          } else {
            texteCorr += solutions2et4
            correctionInteractif = [
              `${pGauche}${valPetit}${separateur}${valMoyen}${pDroite}\\cup${pGauche}${valGrand},+\\infty[`,
            ]
          }
        } else {
          //  if ((signes[i] === '>' || signes[i] === '≥')) // pas de condition pour le dernier else ! JCL le 05/02/2025
          if (a * c * e > 0) {
            texteCorr += solutions2et4
            correctionInteractif = [
              `${pGauche}${valPetit}${separateur}${valMoyen}${pDroite}\\cup${pGauche}${valGrand}${separateur}+\\infty[`,
            ]
          } else {
            texteCorr += solutions1et3
            correctionInteractif = [
              `]-\\infty${separateur}${valPetit}${pDroite}\\cup${pGauche}${valMoyen}${separateur}${valGrand}${pDroite}`,
            ]
          }
        }
        correctionInteractif[0] = correctionInteractif[0]
          .replaceAll('dfrac', 'frac')
          .replace('bigcup', 'cup')
      } else {
        // if (listeTypeDeQuestions[i] === '(ax+b)²(cx+d)<0') Pas de if pour la dernière condition ! JCL le 5/02/2025
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Génère la consigne (texte) et la correction (texteCorr) pour les questions de type '(ax+b)²(cx+d)<0'                                   Type 5        //
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let valPetit, valGrand
        texte = `$(${a}x${ecritureAlgebrique(b)})^2(${c}x${ecritureAlgebrique(d)})${texSymbole(signes[i])}0$`
        // Correction
        texteCorr = texte
        // Si une correction détaillée est demandée, détaille comment résoudre les équations
        if (this.correctionDetaillee) {
          // Utilise la fonction décrite plus haut pour écrire la résolution détaillée de ax + b = 0 cx + d > 0
          ecrireCorrectionDetaillee(a, b, true)
          texteCorr += `<br>Un carré étant toujours positif, $(${a}x${ecritureAlgebrique(b)})^2 > 0$ pour tout $x$ différent de $${texFractionReduite(-b, a)}$.`
          ecrireCorrectionDetaillee(c, d)
        } else {
          // Si pas de correction détaillée, écrit simplement les conclusions, en changeant le sens des inégalités si a < 0 ou si c < 0
          texteCorr += `<br>$${a}x${ecritureAlgebrique(b)}=0$ si et seulement si $x=${texFractionReduite(-b, a)}$.`
          texteCorr += `<br>Un carré étant toujours positif, $(${a}x${ecritureAlgebrique(b)})^2 > 0$ pour tout $x$ différent de $${texFractionReduite(-b, a)}$.`
          if (c < 0) {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('<')} ${texFractionReduite(-d, c)}$.`
          } else {
            texteCorr += `<br>$${c}x${ecritureAlgebrique(d)}${texSymbole('>')}0$ si et seulement si $x${texSymbole('>')} ${texFractionReduite(-d, c)}$.`
          }
        }
        // On se prépare au cas où il y aurait aussi un singleton dans l'ensemble de solution
        let singletonGauche = ''
        let singletonDroite = ''
        let valeurExclue = ''
        // Prépare l'affichage du tableau de signes
        texteCorr +=
          '<br>On peut donc en déduire le tableau de signes suivant : <br>'
        if (-b / a < -d / c) {
          // Si la première racine est la racine double
          ligne1 = [
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
          valPetit = texFractionReduite(-b, a) // la plus petite valeur est la solution de la première équation
          valGrand = texFractionReduite(-d, c) // la plus grande valeur est la solution de la deuxième équation
          if (c > 0) {
            ligne2 = [
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
              'z',
              20,
              '-',
              20,
              'z',
              20,
              '+',
              20,
            ]
            if (signes[i] === '≥')
              singletonGauche = `\\left\\{ ${valPetit} \\right\\} \\cup `
            if (signes[i] === '<')
              valeurExclue = `\\setminus \\left\\{ ${valPetit} \\right\\}`
          } else {
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
              '+',
              20,
              'z',
              20,
              '-',
              20,
            ]
            if (signes[i] === '≤')
              singletonGauche = `\\left\\{ ${valPetit} \\right\\} \\cup `
            if (signes[i] === '>')
              valeurExclue = `\\setminus \\left\\{ ${valPetit} \\right\\}`
          }
        } else {
          // Si la racine double est la deuxième
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
            '+',
            20,
          ]
          valPetit = texFractionReduite(-d, c) // la plus petite valeur est la solution de la deuxième équation
          valGrand = texFractionReduite(-b, a) // la plus grande valeur est la solution de la première équation
          if (c > 0) {
            ligne2 = [
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
              'z',
              20,
              '+',
              20,
            ]
            if (signes[i] === '≤')
              singletonDroite = ` \\cup \\left\\{ ${valGrand} \\right\\}`
            if (signes[i] === '>')
              valeurExclue = `\\setminus \\left\\{ ${valGrand} \\right\\}`
          } else {
            ligne2 = [
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
              'z',
              20,
              '-',
              20,
            ]
            if (signes[i] === '≥')
              singletonDroite = ` \\cup \\left\\{ ${valGrand} \\right\\}`
            if (signes[i] === '<')
              valeurExclue = `\\setminus \\left\\{ ${valGrand} \\right\\}`
          }
        }
        // Affiche le tableau
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2.5, 30],
              [`$(${a}x${ecritureAlgebrique(b)})^2$`, 2, 75],
              [`$${c}x${ecritureAlgebrique(d)}$`, 2, 75],
              [
                `$(${a}x${ecritureAlgebrique(b)})^2(${c}x${ecritureAlgebrique(d)})$`,
                2,
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
          // colorBackground: '',
          espcl,
          deltacl,
          lgt,
        })
        // Affiche l'ensemble de solutions selon le sens de l'inégalité
        const gauche = `<br> L'ensemble de solutions de l'inéquation est $S = ${singletonGauche} \\left] -\\infty${separateur} ${texFractionReduite(-d, c)} \\right${pDroite} ${singletonDroite} ${valeurExclue} $.`
        const droite = `<br> L'ensemble de solutions de l'inéquation est $S = ${singletonGauche} \\left${pGauche} ${texFractionReduite(-d, c)}${separateur} +\\infty \\right[ ${singletonDroite} ${valeurExclue} $.`
        if (signes[i] === '<' || signes[i] === '≤') {
          if (c > 0) {
            texteCorr += gauche
            correctionInteractif = [
              `${singletonGauche.replaceAll(' ', '')}]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}${singletonDroite.replaceAll(' ', '')}`,
              `${singletonDroite.replaceAll(' ', '').replaceAll('\\cup', '')}\\cup]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}`,
              `]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}\\cup${singletonGauche.replaceAll(' ', '').replaceAll('\\cup', '')}`,
            ]
          } else {
            texteCorr += droite
            correctionInteractif = [
              `${singletonGauche.replaceAll(' ', '')}${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[${singletonDroite.replaceAll(' ', '')}`,
              `${singletonDroite.replaceAll(' ', '').replaceAll('\\cup', '')}\\cup${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[`,
              `${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[\\cup${singletonGauche.replaceAll(' ', '').replaceAll('\\cup', '')}`,
            ]
          }
        } else {
          // if ((signes[i] === '>' || signes[i] === '≥')) // condition inutile JCL le 05/02/2025
          if (c > 0) {
            texteCorr += droite
            correctionInteractif = [
              `${singletonGauche.replaceAll(' ', '')}${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[${singletonDroite.replaceAll(' ', '')}`,
              `${singletonDroite.replaceAll(' ', '').replaceAll('\\cup', '')}\\cup${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[`,
              `${pGauche}${texFractionReduite(-d, c)}${separateur}+\\infty[\\cup${singletonGauche.replaceAll(' ', '').replaceAll('\\cup', '')}`,
            ]
          } else {
            texteCorr += gauche
            correctionInteractif = [
              `${singletonGauche.replaceAll(' ', '')}]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}${singletonDroite.replaceAll(' ', '')}`,
              `${singletonDroite.replaceAll(' ', '').replaceAll('\\cup', '')}\\cup]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}`,
              `]-\\infty${separateur}${texFractionReduite(-d, c)}${pDroite}\\cup${singletonGauche.replaceAll(' ', '').replaceAll('\\cup', '')}`,
            ]
          }
        }
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer.slice(0, -1))}$` + '.' // Gestion du point final
      // Fin de cette uniformisation

      for (let kk = 0; kk < correctionInteractif.length; kk++) {
        correctionInteractif[kk] = correctionInteractif[kk].replaceAll(
          'dfrac',
          'frac',
        )
      }
      if (this.interactif && !context.isAmc) {
        texte += `<br> ${texteGras("Saisir S, l'ensemble des solutions de cette inéquation.")}${sp(10)}`
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
        if (i === 0) {
          texte += lampeMessage({
            titre: 'Quelques commandes pratiques pour le clavier : ',
            texte: `Taper '${texteGras('union')}' pour faire apparaître $\\cup$, '${texteGras('inf')}' pour $\\infty$ et '${texteGras('singleton')}' pour $\\left\\{\\right\\}$.`,
            couleur: 'nombres',
          })
        }
      }
      if (this.questionJamaisPosee(i, a, b, c, d, e, f)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // Choisit le type de question à l'aide d'un formulaire numérique (la réponse sera stockée dans this.sup)
}
