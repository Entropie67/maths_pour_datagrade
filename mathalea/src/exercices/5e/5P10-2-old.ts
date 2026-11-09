import Decimal from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { Tableau } from '../../lib/2d/tableau'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer le coefficient de proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '18/03/2023'

export const uuid = '2d5eb'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
/**
 * @author jean-claude Lhote
 */

type Cell = { nombre: number; visible: boolean }
export default class CalculerCoeffPropo extends Exercice {
  constructor() {
    super()

    this.sup = 1
    this.sup2 = false
    this.spacing = 2
    this.spacingCorr = 3
    this.nbQuestions = 5
    this.besoinFormulaireNumerique = [
      'Type de coefficient',
      4,
      '1 : Entier\n2 : Decimal\n3 : Fraction\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Calcul mental (entier)', false] // MGU : à généraliser pour les autres catégories
  }

  nouvelleVersion() {
    const isBetterWithLinearity = function (nombres: [number, number, number]) {
      const [a, b, c] = nombres
      if (
        a % b === 0 ||
        a % c === 0 ||
        b % c === 0 ||
        b % a === 0 ||
        c % a === 0 ||
        c % b === 0
      )
        return true
      if (a + b === c || a + c === b || b + c === a) return true
      if (
        a - b === c ||
        a - c === b ||
        b - c === a ||
        b - a === c ||
        c - a === c ||
        c - b === a
      )
        return true
      if (
        2 * a - 3 * b === 0 ||
        2 * a - 3 * c === 0 ||
        2 * b - 3 * c === 0 ||
        3 * a - 2 * b === 0 ||
        3 * a - 2 * c === 0 ||
        3 * b - 2 * c === 0
      )
        return true
      return false
    }

    const typeDeCoefficient = ['Entier', 'Decimal', 'Fraction']
    let listeTypesDeCoefficient = []
    const tableauxEntiers = [
      [2, 3, 4, 5, 6, 7, 8, 9],
      [10, 12, 15, 16],
      [20, 24, 25, 30, 35, 40],
      [50, 60, 70, 80, 90],
    ]
    const tableauxCoefficientsEntiers = [
      [2, 4, 6, 8, 10],
      [3, 5, 7, 9, 80, 90],
      [11, 5, 19, 15, 25, 50, 75],
      [12, 15, 20, 25, 30, 40],
    ]
    const tableauxCoefficientsFractions = [
      [
        [2, 5],
        [3, 4],
        [2, 3],
        [2, 7],
      ],
      [
        [3, 7],
        [4, 7],
        [4, 9],
        [5, 9],
      ],
      [
        [7, 3],
        [8, 3],
        [3, 2],
        [7, 2],
      ],
      [
        [9, 4],
        [7, 8],
        [8, 7],
        [9, 5],
      ],
    ]
    // @todo prévoir un tableau de choix des fractions plutôt que d'aléatoiriser leur construction

    if (this.sup === 4)
      listeTypesDeCoefficient = combinaisonListes(
        typeDeCoefficient,
        this.nbQuestions,
      )
    else
      listeTypesDeCoefficient = combinaisonListes(
        [typeDeCoefficient[this.sup - 1]],
        this.nbQuestions,
      )

    const listCoefficientUsed: (number | FractionEtendue)[] = []
    for (let i = 0, texte, texteCorr; i < this.nbQuestions; i++) {
      if (context.isAmc) this.autoCorrection[i] = {}
      // Je suis en js, je fais du typage inline JsDoc pratique pour récupérer l'autocomplétion
      /** @type number | Decimal | FractionEtendue */
      let coefficient
      /** @type Array<{ nombre: number, visible: boolean }> */
      const premiereLigne: Cell[] = []
      /** @type Array<{ nombre: number, visible: boolean }> */
      const deuxiemeLigne: Cell[] = []
      const colonneReference = randint(0, 2) // La colonne qui contiendra deux valeurs visibles pour faire le calcul
      if (listCoefficientUsed.length >= 9)
        listCoefficientUsed.splice(0, listCoefficientUsed.length)
      do {
        switch (listeTypesDeCoefficient[i]) {
          case 'Entier': // On choisit un coefficient dans les listes => tout est entier
            coefficient = this.sup2
              ? choice([2, 3, 4, 5, 6, 7, 8, 9, 10], listCoefficientUsed)
              : choice(tableauxCoefficientsEntiers[i % 4])
            for (let colonne = 0; colonne < 3; colonne++) {
              const contenuVisible = choice([true, false])
              premiereLigne[colonne] = {
                nombre: this.sup2
                  ? choice(
                      [2, 4, 6, 8, 10, 3, 5, 7, 9, 11, 12],
                      premiereLigne.map((elt) => elt.nombre),
                    )
                  : choice(
                      choice(tableauxEntiers),
                      premiereLigne.map((elt) => elt.nombre),
                    ),
                visible: colonne === colonneReference ? true : contenuVisible,
              }
              deuxiemeLigne[colonne] = {
                nombre: arrondi(
                  premiereLigne[colonne].nombre * Number(coefficient),
                  4,
                ),
                visible: colonne === colonneReference ? true : !contenuVisible,
              }
            }
            break
          case 'Decimal': // On construit un coefficient... on pourrait le choisir dans une liste
            coefficient = (randint(1, 9) + randint(0, 2) * 10) / 10
            for (let colonne = 0; colonne < 3; colonne++) {
              const contenuVisible = choice([true, false])
              premiereLigne[colonne] = {
                nombre: choice(
                  choice(tableauxEntiers),
                  premiereLigne.map((elt) => elt.nombre),
                ),
                visible: colonne === colonneReference ? true : contenuVisible,
              }
              deuxiemeLigne[colonne] = {
                nombre: arrondi(coefficient * premiereLigne[colonne].nombre, 4),
                visible: colonne === colonneReference ? true : !contenuVisible,
              }
            }
            break
          case 'Fraction':
          default: {
            // construction de la fraction => prévoir une liste simplifiera le code
            let allNumberAreGood
            do {
              allNumberAreGood = true
              const [numerateur, denominateur] = choice(
                choice(tableauxCoefficientsFractions),
              )
              coefficient = new FractionEtendue(numerateur, denominateur)
              for (let colonne = 0; colonne < 3; colonne++) {
                const contenuVisible = choice([true, false])
                let unNombre
                let antiBoucleInfinie = 0
                do {
                  // On choisit un nombre à multiplier par une fraction => on veut un résultat entier obligatoirement !
                  unNombre = choice(
                    choice(tableauxEntiers),
                    premiereLigne.map((elt) => elt.nombre),
                  )
                  antiBoucleInfinie++
                } while (
                  !coefficient.multiplieEntier(unNombre).estEntiere &&
                  antiBoucleInfinie < 20
                )
                if (antiBoucleInfinie === 20) allNumberAreGood = false
                premiereLigne[colonne] = {
                  nombre: unNombre,
                  visible: colonne === colonneReference ? true : contenuVisible,
                }
                deuxiemeLigne[colonne] = {
                  nombre: arrondi(
                    premiereLigne[colonne].nombre * coefficient.valeurDecimale,
                    4,
                  ),
                  visible:
                    colonne === colonneReference ? true : !contenuVisible,
                }
              }
            } while (!allNumberAreGood)
            break
          }
        }
      } while (
        isBetterWithLinearity(
          premiereLigne.map((elt) => elt.nombre) as [number, number, number],
        )
      )
      listCoefficientUsed[i] = coefficient
      const coefficientRationnel = coefficient instanceof FractionEtendue
      const coefficientDecimal = coefficient instanceof Decimal
      const coefficientTex = coefficientRationnel
        ? (coefficient as FractionEtendue).texFraction
        : texNombre(coefficient)
      // remplissage du tableau énoncé et correction.
      const ligne1 = [{ texte: 'Grandeur A' }].concat(
        premiereLigne.map((elt) => {
          return elt.visible
            ? { texte: `$${texNombre(elt.nombre)}$`, math: true }
            : { texte: '...' }
        }),
      )
      const ligne2 = [{ texte: 'Grandeur B' }].concat(
        deuxiemeLigne.map((elt) => {
          return elt.visible
            ? { texte: `$${texNombre(elt.nombre)}$`, math: true }
            : { texte: '...' }
        }),
      )
      const monTableau = context.isAmc // EE : En AMC, les flèches ne passent pas. Je les supprime en attendant de trouver une solution.
        ? listeTypesDeCoefficient[i] === 'Fraction'
          ? new Tableau({
              largeurTitre: 6,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1,
              ligne2,
            })
          : new Tableau({
              largeurTitre: 6,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1,
              ligne2,
            })
        : listeTypesDeCoefficient[i] === 'Fraction'
          ? new Tableau({
              largeurTitre: 6,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1,
              ligne2,
              flecheDroite: {
                texte: '\\times \\ldots',
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
              flecheDroiteSens: 'bas',
              flecheGauche: { texte: '\\times \\ldots', latex: true },
              flecheGaucheSens: 'haut',
            })
          : new Tableau({
              largeurTitre: 6,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1,
              ligne2,
              flecheDroite: {
                texte: '\\times \\ldots',
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
              flecheDroiteSens: 'bas',
            })
      const ligne1Corr = [{ texte: 'Grandeur A' }].concat(
        premiereLigne.map((elt) => {
          return { texte: texNombre(elt.nombre), math: true }
        }),
      )
      const ligne2Corr = [{ texte: 'Grandeur B' }].concat(
        deuxiemeLigne.map((elt) => {
          return { texte: texNombre(elt.nombre), math: true }
        }),
      )
      const monTableauCorr =
        listeTypesDeCoefficient[i] === 'Fraction'
          ? new Tableau({
              largeurTitre: 7,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1: ligne1Corr,
              ligne2: ligne2Corr,
              flecheDroite: { texte: `\\times ${coefficientTex}`, latex: true },
              flecheDroiteSens: 'bas',
              flecheGauche: {
                texte: `\\times ${(coefficient as FractionEtendue).inverse().texFraction}`,
                latex: true,
              },
              flecheGaucheSens: 'haut',
            })
          : new Tableau({
              largeurTitre: 7,
              largeur: 3,
              hauteur: 2,
              nbColonnes: 4,
              ligne1: ligne1Corr,
              ligne2: ligne2Corr,
              flecheDroite: { texte: `\\times ${coefficientTex}`, latex: true },
              flecheDroiteSens: 'bas',
            })
      texte =
        'Le tableau ci-dessous représente une situation de proportionnalité.<br>'
      texte += numAlpha(0) + 'Calculer le coefficient de proportionnalité.<br>'
      texte += numAlpha(1) + 'Compléter le tableau de proportionnalité.<br>'
      // dessin du tableau selon le contexte
      // définition d'un objet pour les réponses attendues
      const reponsesAttendue: {
        reponse1: {
          lettre: 'A' | 'B'
          colonne: number
          reponse: { valeur: number; digits: number }
        }
        reponse2: {
          lettre: 'A' | 'B'
          colonne: number
          reponse: { valeur: number; digits: number }
        }
      } = {
        reponse1: {
          lettre: 'A',
          colonne: 0,
          reponse: { valeur: 0, digits: 0 },
        },
        reponse2: {
          lettre: 'B',
          colonne: 0,
          reponse: { valeur: 0, digits: 0 },
        },
      }
      for (let colonne = 1, rep = 1; colonne < 4; colonne++) {
        if (colonne !== colonneReference + 1) {
          reponsesAttendue[rep === 1 ? 'reponse1' : 'reponse2'] = {
            lettre: premiereLigne[colonne - 1].visible ? 'B' : 'A',
            colonne,
            reponse: premiereLigne[colonne - 1].visible
              ? {
                  valeur: deuxiemeLigne[colonne - 1].nombre,
                  digits: 4,
                }
              : { valeur: premiereLigne[colonne - 1].nombre, digits: 2 },
          }
          rep++
        }
      }
      if (context.isHtml) {
        // Pour HTML on utilise mathalea2d
        texte += mathalea2d(
          Object.assign({}, fixeBordures([monTableau])),
          monTableau,
        )
        if (this.interactif) {
          texte +=
            'Coefficient de proportionnalité de A à B : ' +
            ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          handleAnswers(
            this,
            3 * i,
            { reponse: { value: coefficient } },
            { formatInteractif: 'mathlive' },
          )
          texte += `<br>Valeur de la grandeur ${reponsesAttendue.reponse1.lettre} pour la colonne ${reponsesAttendue.reponse1.colonne} :`
          texte += ajouteChampTexteMathLive(
            this,
            3 * i + 1,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(
            this,
            3 * i + 1,
            { reponse: { value: reponsesAttendue.reponse1.reponse.valeur } },
            { formatInteractif: 'mathlive' },
          )
          texte += `<br>Valeur de la grandeur ${reponsesAttendue.reponse2.lettre} pour la colonne ${reponsesAttendue.reponse2.colonne} :`
          texte += ajouteChampTexteMathLive(
            this,
            3 * i + 2,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(
            this,
            3 * i + 2,
            { reponse: { value: reponsesAttendue.reponse2.reponse.valeur } },
            { formatInteractif: 'mathlive' },
          )
        }
      } else {
        // pour LAtex, c'est profCollege dans le texte
        texte += '\n\\Propor[Math,Stretch=2,largeur=15]{'
        for (let colonne = 0; colonne < 3; colonne++) {
          texte += `${ligne1[colonne + 1].texte.replace('...', '\\ldots')}/`
          texte += `${ligne2[colonne + 1].texte.replace('...', '\\ldots')}`
          if (colonne < 2) texte += ','
          else texte += '}\n'
        }
        texte += '\n\\FlechesPD{1}{2}{$\\times$\\ldots}\n'
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            options: { multicols: true, barreseparation: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      // coefficient
                      texte: texte + 'valeur du coefficient',
                      valeur: coefficient,
                      param: coefficientDecimal
                        ? {
                            digits: 3,
                            decimals: 2,
                            signe: false,
                            approx: 0,
                          }
                        : coefficientRationnel
                          ? {
                              digitsNum: nombreDeChiffresDansLaPartieEntiere(
                                deuxiemeLigne[colonneReference].nombre,
                              ),
                              digitsDen: nombreDeChiffresDansLaPartieEntiere(
                                premiereLigne[colonneReference].nombre,
                              ),
                              digits:
                                nombreDeChiffresDansLaPartieEntiere(
                                  deuxiemeLigne[colonneReference].nombre,
                                ) +
                                nombreDeChiffresDansLaPartieEntiere(
                                  premiereLigne[colonneReference].nombre,
                                ),
                              approx: 0, //,
                              // aussiCorrect: new FractionEtendue(deuxiemeLigne[colonneReference].nombre, premiereLigne[colonneReference].nombre)
                            }
                          : {
                              digits: 2,
                              decimals: 0,
                              signe: false,
                              approx: 0,
                            },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: `Réponse de la ligne ${reponsesAttendue.reponse1.lettre} colonne ${reponsesAttendue.reponse1.colonne} :`,
                      valeur: [reponsesAttendue.reponse1.reponse.valeur],
                      param: {
                        digits: reponsesAttendue.reponse1.reponse.digits,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: `Réponse de la ligne ${reponsesAttendue.reponse2.lettre} colonne ${reponsesAttendue.reponse2.colonne} :`,
                      valeur: [reponsesAttendue.reponse2.reponse.valeur],
                      param: {
                        digits: reponsesAttendue.reponse2.reponse.digits,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      }
      texteCorr =
        numAlpha(0) +
        `Le coefficient de proportionnalité est donné par le quotient de $${texNombre(deuxiemeLigne[colonneReference].nombre)}$
 par $${texNombre(premiereLigne[colonneReference].nombre)}$, soit $`
      if (coefficientRationnel) {
        const quotient = new FractionEtendue(
          deuxiemeLigne[colonneReference].nombre,
          premiereLigne[colonneReference].nombre,
        )
        if (!quotient.estIrreductible) {
          texteCorr += `${miseEnEvidence(`\\dfrac{${texNombre(deuxiemeLigne[colonneReference].nombre)}}{${texNombre(premiereLigne[colonneReference].nombre)}}`, bleuMathalea)}`
          texteCorr += `= ${miseEnEvidence((coefficient as FractionEtendue).texFraction)}$.<br>`
        } else {
          texteCorr += `${miseEnEvidence(`\\dfrac{${texNombre(deuxiemeLigne[colonneReference].nombre)}}{${texNombre(premiereLigne[colonneReference].nombre)}}`)}`
          texteCorr += '$.<br>'
        }
      } else {
        texteCorr += `${miseEnEvidence(`\\dfrac{${texNombre(deuxiemeLigne[colonneReference].nombre)}}{${texNombre(premiereLigne[colonneReference].nombre)}}`, bleuMathalea)}`
        texteCorr += `= ${miseEnEvidence(texNombre(coefficient))}$.<br>`
      }
      texteCorr +=
        numAlpha(1) + 'On complète le tableau de proportionnalité.<br>'
      for (let colonne = 1; colonne < 4; colonne++) {
        // La première colonne ici c'est la colonne des entêtes
        if (
          premiereLigne[colonne - 1].visible &&
          colonne !== colonneReference + 1
        ) {
          // on a la première valeur, on calcule donc la deuxième
          texteCorr += `Pour la colonne ${colonne}, on calcule : $${ligne1Corr[colonne].texte}\\times ${coefficientTex}=`
          if (coefficientRationnel) {
            texteCorr += `\\dfrac{${ligne1Corr[colonne].texte}\\times ${(coefficient as FractionEtendue).num}}{${(coefficient as FractionEtendue).den}}=`
          }
          texteCorr += `${miseEnEvidence(ligne2Corr[colonne].texte)}$.`
        } else {
          if (colonne !== colonneReference + 1) {
            texteCorr += `Pour la colonne ${colonne}, on calcule : $${ligne2Corr[colonne].texte}${coefficientRationnel ? '\\times' + (coefficient as FractionEtendue).inverse().texFraction : '\\div' + coefficientTex}=`
            if (coefficientRationnel) {
              texteCorr += `\\dfrac{${ligne2Corr[colonne].texte}\\times ${(coefficient as FractionEtendue).den}}{${(coefficient as FractionEtendue).num}}=`
            }
            texteCorr += `${miseEnEvidence(ligne1Corr[colonne].texte)}$.`
          }
        }
        if (colonne < 4 && colonne !== colonneReference + 1) texteCorr += '<br>'
      }
      // dessin du tableau selon le contexte
      if (context.isHtml) {
        // Pour HTML on utilise mathalea2d
        texteCorr += mathalea2d(
          Object.assign({}, fixeBordures([monTableauCorr])),
          monTableauCorr,
        )
      } else {
        // pour LAtex, c'est profCollege dans le texte
        texteCorr += '\\Propor[Math,\nStretch=2,\nlargeur=1.5]{'
        for (let colonne = 0; colonne < 3; colonne++) {
          texteCorr += `$${ligne1Corr[colonne + 1].texte}$/`
          texteCorr += `$${ligne2Corr[colonne + 1].texte}$`
          if (colonne < 2) texteCorr += ','
          else texteCorr += '}\n'
        }
        if (coefficientRationnel) {
          texteCorr += `\\FlechesPG{2}{1}{$\\times ${(coefficient as FractionEtendue).inverse().texFraction}$}\n`
        }
        texteCorr += `\\FlechesPD{1}{2}{$\\times ${coefficientTex}$}`
        if (context.isAmc) {
          this.autoCorrectionAMC[i].propositions![0].propositions![0].texte =
            texteCorr
        }
      }
      if (
        this.questionJamaisPosee(
          i,
          ...premiereLigne.map((elt) => elt.nombre),
          ...deuxiemeLigne.map((elt) => elt.nombre),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
      }
    }
    listeQuestionsToContenu(this)
  }
}
