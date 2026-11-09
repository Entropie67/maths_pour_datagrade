import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { glisseNombreInteractif } from '../../lib/apps/glisse_nombre_interactif'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  coloreUnSeulChiffre,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import {
  analyserNombre,
  chiffreAPositionDecimale,
  donneNomClasse,
} from './6N2autoD'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre = 'Multiplier un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDePublication = '20/08/2025'

/**
 * Multiplication d'un nombre décimal dans différentes écritures par 10, 100, 1000
 * @author Éric Elter (sur la base de 6C30-1 mais avec nx programmes)
 *
 */
export const uuid = 'cc3a9'

export const refs = {
  'fr-fr': ['6N2autoC'],
  'fr-2016': ['6C30-1b'],
  'fr-ch': ['9R1NO6E-6', '9R2NO6E-6', '9R3NO6E-6'],
}

/**
 * Trouve le premier chiffre non nul d’un entier en partant de la droite,
 * et retourne sa position sous forme de rang (1 = unités, 2 = dizaines, etc.).
 *
 * @param n - Un entier (positif ou négatif) contenant au moins un chiffre non nul.
 * @param limite - (Optionnel) Limite maximale de chiffres à examiner depuis la droite.
 * Si non précisée, la recherche continue indéfiniment jusqu’à trouver un chiffre non nul.
 *
 * @returns Un objet contenant :
 *  - `chiffre` : le premier chiffre non nul depuis la droite (dans la limite donnée),
 *  - `rang` : la position du chiffre (1 = unités, 2 = dizaines, etc.).
 *
 * @throws Si `n` vaut 0 et aucune limite n'est fournie, la fonction entre dans une boucle infinie.
 *
 * @author Éric Elter
 *
 * @example
 * ```ts
 * trouverChiffreEtRangDepuisDroite(1200);         // { chiffre: 2, rang: 3 }
 * trouverChiffreEtRangDepuisDroite(-10500);       // { chiffre: 5, rang: 4 }
 * trouverChiffreEtRangDepuisDroite(1000, 2);      // { chiffre: 0, rang: 2 } (car 2 chiffres max examinés)
 * trouverChiffreEtRangDepuisDroite(0, 5);         // { chiffre: 0, rang: 5 } (aucun chiffre non nul trouvé)
 * ```
 */

function trouverChiffreEtRangDepuisDroite(
  n: number,
  limite?: number,
): { chiffre: number; rang: number } {
  n = Math.abs(n)
  let rang = 0

  while (true) {
    const chiffre = n % 10
    if (chiffre !== 0) {
      return { chiffre, rang }
    }

    n = Math.floor(n / 10)
    rang++

    if (limite !== undefined && rang >= limite) {
      break
    }
  }

  const chiffre = n % 10
  return { chiffre, rang }
}

export default class MultiplierDecimauxPar101001000V2 extends Exercice {
  version: string
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Produit',
        '2 : Facteur autre que la puissance de 10',
        '3 : La puissance de 10',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire2Texte = [
      'Type du produit',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entier',
        '2 : Décimal',
        '3 : Fractionnaire',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire3Texte = [
      'Type du facteur autre que la puissance de 10',
      [
        'Nombres séparés par des tirets  :',
        '1 : Décimal, plus petit que 1',
        '2 : Décimal, plus grand que 1',
        '3 : Fractionnaire, plus petit que 1',
        '4 : Fractionnaire, plus grand que 1',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire4CaseACocher = ['Avec glisse-nombre']
    this.sup = '4'
    this.sup2 = '1-2'
    this.sup3 = '1-2'
    this.sup4 = true
    this.version = '6eme'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.comment =
      'Le premier paramètre permet de choisir si le résultat de chaque produit est un nombre entier, un nombre décimal, une fraction ou un mélange des trois.<br><br>'
    this.comment +=
      "Le deuxième paramètre permet de trouver soit le produit, soit l'un des deux facteurs.<br><br>"
    this.comment +=
      "Le troisième paramètre permet de choisir si le facteur (qui n'est pas une puissance de 10) est décimal ou fractionnaire, inférieur ou supérieur à 1.<br><br>"
    this.comment +=
      "Le quatrième paramètre permet de choisir si cet exercice dispose d'un glisse-nombre."
    this.comment +=
      'Le cinquième paramètre permet de choisir si cet exercice propose une correction sèche ou une correction détaillée.'
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const typesDeNombresCherchesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const typesDeNombreCherche = combinaisonListes(
      typesDeNombresCherchesDisponibles,
      this.nbQuestions,
    )

    let typesDeResultatsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    if (this.version === 'CM1') {
      enleveElement(typesDeResultatsDisponibles, 3)
      if (typesDeResultatsDisponibles.length === 0)
        typesDeResultatsDisponibles = [1, 2]
    }
    const typesDeResultats = combinaisonListes(
      typesDeResultatsDisponibles,
      this.nbQuestions,
    )

    let typesDeFacteursDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    if (this.version === 'CM1') {
      enleveElement(typesDeFacteursDisponibles, 3)
      enleveElement(typesDeFacteursDisponibles, 4)
      if (typesDeFacteursDisponibles.length === 0)
        typesDeFacteursDisponibles = [1, 2]
    }
    const typesDeFacteurs = combinaisonListes(
      typesDeFacteursDisponibles,
      this.nbQuestions,
    )

    if (context.isHtml && this.sup4) {
      this.consigne = 'Compléter.'
      this.consigne += '<br>Un glisse-nombre est à disposition pour répondre '
      this.consigne +=
        this.nbQuestions === 1 ? 'à la question.' : 'aux questions.'
      this.consigne += `<glisse-nombre number="${texNombre(20.25)}"/>`
    } else {
      this.consigne = 'Compléter.'
    }

    let reponse: number

    const puissances =
      this.version === '6eme'
        ? combinaisonListes([1, 2, 3], this.nbQuestions)
        : combinaisonListes([1], this.nbQuestions)

    const multiplesDe10: number[] = []
    for (let i = 10; i <= 90; i += 10) {
      multiplesDe10.push(i)
    }

    const multiplesDe100: number[] = []
    for (let i = 100; i < 1000; i += 100) {
      multiplesDe100.push(i)
    }
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b;
      i < this.nbQuestions && cpt < 50;
    ) {
      texteCorr = ''

      b = puissances[i]
      let choixPossibleFacteur
      if (typesDeResultats[i] === 1) {
        // Produit entier
        a = choice([
          randint(1, 99, multiplesDe10),
          randint(101, 999, multiplesDe100),
        ]) // S'arranger pour éviter 70 et 150
        const choixFacteur = randint(0, b - 1)
        choixPossibleFacteur = randint(1, Math.pow(10, b) - 1)
        if (typesDeFacteurs[i] % 2 === 0) {
          // Facteur > 1
          a = arrondi(
            a /
              Math.pow(
                10,
                randint(0, Math.min(4 - b, Math.floor(Math.log10(a)))),
              ),
          )
        } else {
          // Facteur < 1
          a = arrondi(
            choixPossibleFacteur / Math.pow(10, randint(choixFacteur + 1, b)),
          )
        }
      } else {
        // Produit décimal
        if (typesDeFacteurs[i] % 2 === 0) {
          // Facteur > 1
          choixPossibleFacteur = randint(1, 999)
          a = arrondi(
            choixPossibleFacteur /
              Math.pow(
                10,
                randint(0, Math.floor(Math.log10(choixPossibleFacteur))),
              ),
          )
        } else {
          // Facteur < 1
          choixPossibleFacteur = choice([
            randint(1, 9),
            randint(11, 99),
            randint(101, 999),
          ])
          a = arrondi(
            choixPossibleFacteur /
              Math.pow(
                10,
                randint(Math.ceil(Math.log10(choixPossibleFacteur)), 3),
              ),
          )
        }
      }

      if (this.questionJamaisPosee(i, a, b)) {
        const choixClasseEntiere = donneNomClasse(Math.pow(10, b))[0]
        const choixClasseDecimale = donneNomClasse(Math.pow(10, b))[1]
        const chiffreDesUnites = Math.abs(Math.floor(a)) % 10
        const chiffrePartieDecimale = chiffreAPositionDecimale(
          a,
          Math.pow(10, b),
        )
        const f = new FractionEtendue(a, 1).fractionDecimale()
        const aSousFraction = f.texFraction
        const numaSousFraction = f.num
        const classeDeaSousFraction = donneNomClasse(f.den)[1]
        const classeDeaSousFractionMultiplie =
          typesDeNombreCherche[i] < 4
            ? -Math.log10(f.den) + b >= 0
              ? donneNomClasse(Math.pow(10, -Math.log10(f.den) + b))[0]
              : donneNomClasse(Math.pow(10, Math.log10(f.den) - b))[1]
            : ''
        const chiffreDesUnitesNumaSousFraction =
          Math.abs(Math.floor(f.num)) % 10

        const produitFinal = arrondi(a * Math.pow(10, b))
        const choixOrdreMultiplication = choice([true, false])
        const fractionFinale = new FractionEtendue(
          produitFinal,
          1,
        ).fractionDecimale().texFraction
        const showComma1 = typesDeFacteurs[i] < 3 // Si facteur fractionnaire ou entier, pas de virgule sur ligne 1
        const showComma2 = typesDeResultats[i] !== 3 // Si produit fractionnaire, pas de virgule sur ligne 1
        const initialPower =
          typesDeFacteurs[i] >= 3 || typesDeResultats[i] === 3
            ? -Math.log10(f.den)
            : 0

        switch (typesDeNombreCherche[i]) {
          case 1: // On cherche le produit final
            reponse = produitFinal
            if (choixOrdreMultiplication) {
              texte = `$${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}\\times${texNombre(Math.pow(10, b))}=$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteAvant: texte },
                )
              else texte += sp() + '$ \\ldots$'
            } else {
              texte = `$${texNombre(Math.pow(10, b))}\\times${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}=$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteAvant: texte },
                )
              else texte += sp() + '$ \\ldots$'
            }

            if (this.correctionDetaillee) {
              texteCorr = `Quand on multiplie par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
              texteCorr += `En particulier, quand on multiplie $${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}$ par $${texNombre(Math.pow(10, b))}$, alors :<br>`
              const item1 =
                `le chiffre des ${classeDeaSousFraction} de $${aSousFraction}$ (${analyserNombre(numaSousFraction).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnitesNumaSousFraction, bleuMathalea)}$ dans $${f.den === 1 || typesDeFacteurs[i] < 3 ? coloreUnSeulChiffre(texNombre(a, 1), bleuMathalea) : texFractionFromString(coloreUnSeulChiffre(texNombre(f.num), bleuMathalea, 1), miseEnEvidence(texNombre(f.den), 'black'))}$` +
                `) devient le chiffre des ${classeDeaSousFractionMultiplie} ;`
              const item2 =
                `le chiffre des unités de $${texNombre(a)}$ (${analyserNombre(a).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$` +
                `) devient le chiffre des ${choixClasseEntiere} ;`
              const item3 =
                `le chiffre des ${choixClasseDecimale} de $${texNombre(a)}$ (${analyserNombre(reponse).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a, Math.max(b, nombreDeChiffresDansLaPartieDecimale(a)), true, true), bleuMathalea, Math.pow(10, -b))}$` +
                ') devient le chiffre des unités.<br>'
              const items = [
                ...(typesDeFacteurs[i] > 2 && classeDeaSousFraction !== 'unités'
                  ? [item1]
                  : []),
                item2,
                item3,
              ]
              texteCorr += createList({
                items,
                style: 'puces',
              })
            }
            if (choixOrdreMultiplication) {
              texteCorr += `$${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}\\times${texNombre(Math.pow(10, b))} = ${typesDeResultats[i] !== 3 ? '' : `${fractionFinale} = `}${miseEnEvidence(texNombre(reponse))}$`
            } else {
              texteCorr += `$${texNombre(
                Math.pow(10, b),
              )} \\times ${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction} = ${typesDeResultats[i] !== 3 ? '' : `${fractionFinale} = `}${miseEnEvidence(texNombre(reponse))}$`
            }

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            break
          case 2: {
            // On cherche le facteur autre que la puissance de 10
            reponse = a

            if (choixOrdreMultiplication) {
              texte = `$\\times${texNombre(Math.pow(10, b))}=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteApres: texte },
                )
              else texte = '$ \\ldots$' + texte
            } else {
              texte = `$${texNombre(Math.pow(10, b))}\\times$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: texte,
                    texteApres: `$=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`,
                  },
                )
              else
                texte =
                  texte +
                  sp() +
                  '$ \\ldots$' +
                  sp() +
                  `$=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`
            }

            if (this.correctionDetaillee) {
              let positionChiffre = 0
              let produitEntier = false
              texteCorr = `Quand on multiplie par $${texNombre(Math.pow(10, b))}$, tous les chiffres prennent une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
              if (typesDeFacteurs[i] < 3) {
                // entier ou décimal
                if (typesDeResultats[i] === 3) {
                  texteCorr += `Notamment, le chiffre des ${classeDeaSousFraction} devient le chiffre des ${classeDeaSousFractionMultiplie}.<br>`
                  texteCorr += `Dans $${fractionFinale}$ (le résultat du calcul), le chiffre des ${classeDeaSousFractionMultiplie} est $${miseEnEvidence(chiffreDesUnitesNumaSousFraction, bleuMathalea)}$`
                  texteCorr += ` donc le chiffre des ${classeDeaSousFraction} du nombre recherché est $${miseEnEvidence(chiffreDesUnitesNumaSousFraction, bleuMathalea)}$.<br>`
                } else if (chiffreAPositionDecimale(produitFinal, 1) === 0) {
                  texteCorr += `Notamment, le chiffre des unités devient le chiffre des ${choixClasseEntiere}.<br>`
                  texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, Math.pow(10, b))}$ (le résultat du calcul), le chiffre des ${choixClasseEntiere} est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$`
                  texteCorr += ` donc le chiffre des unités du nombre recherché est $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$.<br>`
                } else {
                  texteCorr += `Notamment, le chiffre des ${choixClasseDecimale} devient le chiffre des unités.<br>`
                  texteCorr += `Dans $${coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, 1)}$ (le résultat du calcul), le chiffre des unités est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$`
                  texteCorr += ` donc le chiffre des ${choixClasseDecimale} du nombre recherché est $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$.<br>`
                }
              } else {
                // fractionnaire
                let partieDecimalePlusPetite = donneNomClasse(
                  new FractionEtendue(produitFinal, 1).den,
                )[1]
                let partieDecimalePlusGrande = donneNomClasse(f.den)[1]
                let chiffreADeplacer = chiffreAPositionDecimale(
                  new FractionEtendue(produitFinal, 1).num,
                  1,
                )
                produitEntier = partieDecimalePlusPetite === 'unités'
                if (produitEntier) {
                  // Traitement du chiffre significatif (donc autre que 0 dans la limite des 4 premiers chiffres) à droite
                  positionChiffre = trouverChiffreEtRangDepuisDroite(
                    produitFinal,
                    3,
                  )?.rang
                  chiffreADeplacer = trouverChiffreEtRangDepuisDroite(
                    produitFinal,
                    3,
                  )?.chiffre
                  partieDecimalePlusPetite = donneNomClasse(
                    new FractionEtendue(
                      produitFinal,
                      Math.pow(10, positionChiffre),
                    ).den,
                  )[0]
                  partieDecimalePlusGrande = donneNomClasse(
                    new FractionEtendue(
                      produitFinal,
                      arrondi(Math.pow(10, b) / Math.pow(10, positionChiffre)),
                    ).den,
                  )[1]
                }
                texteCorr += `Notamment, le chiffre des ${partieDecimalePlusGrande} devient le chiffre  des ${partieDecimalePlusPetite}.<br>`
                texteCorr += `Dans $${produitEntier ? coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, Math.pow(10, positionChiffre)) : texFractionFromString(coloreUnSeulChiffre(texNombre(new FractionEtendue(produitFinal, 1).num), bleuMathalea, 1), miseEnEvidence(texNombre(new FractionEtendue(produitFinal, 1).den), 'black'))}$ `
                texteCorr += `(le résultat du calcul), le chiffre des ${partieDecimalePlusPetite} est $${miseEnEvidence(chiffreADeplacer, bleuMathalea)}$`
                texteCorr += ` donc le chiffre des ${partieDecimalePlusGrande} du nombre recherché est $${miseEnEvidence(chiffreADeplacer, bleuMathalea)}$.<br>`
              }
            }

            if (choixOrdreMultiplication) {
              texteCorr += `$${typesDeFacteurs[i] < 3 ? '' : `${aSousFraction} = `}${miseEnEvidence(texNombre(reponse))}\\times${texNombre(Math.pow(10, b))} = ${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`
            } else {
              texteCorr += `$${texNombre(
                Math.pow(10, b),
              )} \\times ${typesDeFacteurs[i] < 3 ? '' : `${aSousFraction} = `}${miseEnEvidence(texNombre(reponse))} = ${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`
            }

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            break
          }
          case 3: // On cherche la puissance de 10
          default:
            reponse = Math.pow(10, b)

            if (choixOrdreMultiplication) {
              texte = `$${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}\\times$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteAvant: texte,
                    texteApres: `$=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`,
                  },
                )
              else
                texte =
                  texte +
                  sp() +
                  '$ \\ldots$' +
                  sp() +
                  `$=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`
            } else {
              texte = `$\\times${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}=${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`

              if (this.interactif)
                texte = ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  { texteApres: texte },
                )
              else texte = '$ \\ldots$' + sp() + texte
            }

            if (this.correctionDetaillee) {
              if (typesDeResultats[i] < 3) {
                // entier ou décimal
                texteCorr =
                  typesDeFacteurs[i] === 1
                    ? `Le chiffre des ${choixClasseDecimale} de $${texNombre(a)}$ (${analyserNombre(arrondi(a)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffrePartieDecimale, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, Math.pow(10, -b))}$` +
                      `) devient le chiffre des unités (dans $${coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, 1)}$).<br>`
                    : typesDeFacteurs[i] === 2
                      ? `Le chiffre des unités de $${texNombre(a)}$ (${analyserNombre(arrondi(a)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${coloreUnSeulChiffre(texNombre(a), bleuMathalea, 1)}$` +
                        `) devient le chiffre des ${choixClasseEntiere} (dans $${coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, Math.pow(10, b))}$).<br>`
                      : `Le chiffre des ${classeDeaSousFraction} de $${aSousFraction}$ (${analyserNombre(numaSousFraction).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDesUnitesNumaSousFraction, bleuMathalea)}$ dans $${f.den === 1 ? coloreUnSeulChiffre(texNombre(a, 1), bleuMathalea) : texFractionFromString(coloreUnSeulChiffre(texNombre(f.num), bleuMathalea, 1), miseEnEvidence(texNombre(f.den), 'black'))}$` +
                        `) devient le chiffre des ${classeDeaSousFractionMultiplie} (dans $${coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, Math.pow(10, -Math.log10(f.den) + b))}$).<br>`
              } else {
                // fractionnaire
                let positionChiffre = 0
                let produitEntier = false
                let partieDecimalePlusPetite = donneNomClasse(
                  new FractionEtendue(produitFinal, 1).den,
                )[1]
                let partieDecimalePlusGrande = donneNomClasse(f.den)[1]
                const chiffreDeplace = chiffreAPositionDecimale(f.num, 1)
                produitEntier = partieDecimalePlusPetite === 'unités'
                if (produitEntier) {
                  // Traitement du chiffre significatif (donc autre que 0 dans la limite des 4 premiers chiffres) à droite
                  positionChiffre = trouverChiffreEtRangDepuisDroite(
                    produitFinal,
                    3,
                  )?.rang
                  partieDecimalePlusPetite = donneNomClasse(
                    new FractionEtendue(
                      produitFinal,
                      Math.pow(10, positionChiffre),
                    ).den,
                  )[0]
                  partieDecimalePlusGrande = donneNomClasse(
                    new FractionEtendue(
                      produitFinal,
                      arrondi(Math.pow(10, b) / Math.pow(10, positionChiffre)),
                    ).den,
                  )[1]
                }
                texteCorr += `Le chiffre des ${partieDecimalePlusGrande} de $${typesDeFacteurs[i] < 3 ? texNombre(a) : aSousFraction}$ (${analyserNombre(arrondi(a)).doublonUnites ? 'ce ' : ''}chiffre $${miseEnEvidence(chiffreDeplace, bleuMathalea)}$ dans $${f.den === 1 || typesDeFacteurs[i] < 3 ? coloreUnSeulChiffre(texNombre(a, 1), bleuMathalea) : texFractionFromString(coloreUnSeulChiffre(texNombre(f.num), bleuMathalea, 1), miseEnEvidence(texNombre(f.den), 'black'))}$)
               devient le chiffre des ${partieDecimalePlusPetite} ($${miseEnEvidence(chiffreDeplace, bleuMathalea)}$ dans $${produitEntier ? coloreUnSeulChiffre(texNombre(produitFinal), bleuMathalea, Math.pow(10, positionChiffre)) : texFractionFromString(coloreUnSeulChiffre(texNombre(new FractionEtendue(produitFinal, 1).num), bleuMathalea, 1), miseEnEvidence(texNombre(new FractionEtendue(produitFinal, 1).den), 'black'))}$).<br>`
              }

              texteCorr += `Tous les chiffres prennent donc une position $${texNombre(Math.pow(10, b))}$ fois plus grande.<br>`
            }
            if (choixOrdreMultiplication) {
              texteCorr += `$${typesDeFacteurs[i] < 3 ? texNombre(a) : f.texFraction} \\times${miseEnEvidence(texNombre(reponse))} = `
              texteCorr += `${typesDeResultats[i] !== 3 ? texNombre(produitFinal) : fractionFinale}$`
            } else {
              texteCorr += `$${miseEnEvidence(texNombre(reponse))} \\times ${typesDeFacteurs[i] < 3 ? texNombre(a) : f.texFraction} = `
              texteCorr += `${typesDeFacteurs[i] < 3 ? texNombre(produitFinal) : fractionFinale}$`
            }

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            break
        }
        if (this.sup4)
          texteCorr += glisseNombreInteractif({
            number: a,
            animation: b,
            addZeros: true,
            showComma2,
            showComma1,
            initialPower,
          })

        if (context.isAmc) {
          this.autoCorrectionAMC[i].enonce = texte
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          this.autoCorrectionAMC[i].propositions = [{ texte: texteCorr }]
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          const amcParam = ensureAmcParam(this, i)
          amcParam.digits =
            nombreDeChiffresDansLaPartieEntiere(reponse) +
            nombreDeChiffresDansLaPartieDecimale(reponse) +
            2
          amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(reponse) + 1
          amcParam.signe = false
          amcParam.exposantNbChiffres = 0
        }
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
