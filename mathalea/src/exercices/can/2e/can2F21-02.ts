import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { tableauDeVariation } from '../../../lib/mathFonctions/etudeFonction'
import { choice } from '../../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dresser le tableau de signes d’une fonction affine'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '15/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = '73ab4'

export const refs = {
  'fr-fr': ['can2F21-02', '2F33-flash1'],
  'fr-ch': [],
}
export default class TableauSignes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr, a, b, ligne1, props, debutEnonce
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      a = randint(1, 6) * choice([-1, 1]) // coefficient a de la fonction affine
      b = randint(1, 6) * choice([-1, 1]) // coefficient b de la fonction affine
      texteCorr = `$f$ est une fonction affine. Elle s’annule en $x_0=${texFractionReduite(-b, a)}$. `

      if (this.interactif) {
        debutEnonce = 'Quel est '
      } else {
        debutEnonce = 'Dresser '
      }
      if (a > 0) {
        this.autoCorrection[i] = {
          enonce: texte,
          options: { vertical: true },
          propositions: [
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(-b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '-', 20, 'z', 20, '+']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5,
                scale: 1,
              }),
              statut: true,
            },
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '-', 20, 'z', 20, '+']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5,
                scale: 1,
              }),
              statut: false,
            },
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(-b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '+', 20, 'z', 20, '-']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                scale: 1,
              }),
              statut: false,
            },
          ],
        }
        texteCorr += `<br>Comme $${a}>0~$, $~f(x)$ est ${texteEnCouleurEtGras(`positif pour $x>${texFractionReduite(-b, a)}$ et négatif pour $x<${texFractionReduite(-b, a)}$`)}.<br>`
        ligne1 = ['Line', 30, '', 0, '-', 20, 'z', 20, '+']
      } else {
        this.autoCorrection[i] = {
          enonce: texte,
          options: { vertical: true },
          propositions: [
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(-b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '+', 20, 'z', 20, '-']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                scale: 1,
              }),
              statut: true,
            },
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '+', 20, 'z', 20, '-']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                scale: 1,
              }),
              statut: false,
            },
            {
              texte: tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 2, 30],
                    ['$f(x)$', 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    30,
                    `$${texFractionReduite(-b, a)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [['Line', 30, '', 0, '-', 20, 'z', 20, '+']],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                scale: 1,
              }),
              statut: false,
            },
          ],
        }
        texteCorr += `<br>Comme $${a}<0$,  $f(x)~$ est ${texteEnCouleurEtGras(`négatif pour $x>${texFractionReduite(-b, a)}$ et positif pour $x<${texFractionReduite(-b, a)}$`)}.<br>`
        ligne1 = ['Line', 30, '', 0, '+', 20, 'z', 20, '-']
      }
      props = propositionsQcm(this, i)
      texte = `${debutEnonce}le tableau de signes de la fonction $f$ définie sur  $\\mathbb R$ par $f(x)=${reduireAxPlusB(a, b)}$${this.interactif ? ' ?' : '.'} `
      if (this.interactif) texte += props.texte
      texteCorr += tableauDeVariation({
        tabInit: [
          [
            // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
            ['$x$', 2, 30],
            ['$f(x)$', 2, 50],
          ],
          // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
          [
            '$-\\infty$',
            30,
            `$${texFractionReduite(-b, a)}$`,
            20,
            '$+\\infty$',
            30,
          ],
        ],
        // tabLines ci-dessous contient les autres lignes du tableau.
        tabLines: [ligne1],
        espcl: 3.5, // taille en cm entre deux antécédents
        deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
        lgt: 5, // taille de la première colonne en cm
      })
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.canEnonce = `Dresser le tableau de signes de la fonction $f$ définie sur  $\\mathbb R$ par $f(x)=${reduireAxPlusB(a, b)}$. `

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
