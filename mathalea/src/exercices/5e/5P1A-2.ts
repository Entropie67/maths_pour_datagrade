import Decimal from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableau } from '../../lib/2d/tableau'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { deDevant, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  quotientier,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const titre = "Utiliser ou trouver l'échelle d'un plan"

// Gestion de la date de publication initiale
export const dateDePublication = '10/08/2022'
export const dateDeModifImportante = '05/07/2024'

/**
 * Utiliser ou trouver des échelles dans diverses situations
 * @author Éric Elter
 */
export const uuid = 'edb61'

export const refs = {
  'fr-fr': ['5P1A-2', 'BP2AutoM1'],
  'fr-2016': ['5P13', 'BP2AutoM1'],
  'fr-ch': ['10CTFA1F-1', '10LCFA1F-1', '10LSFA1F-1', 'PRQPF03B-1', 'PRQPF04B-1'],
}
export default class EchellesProblemes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Trouver une échelle\n2 : Trouver une distance réelle\n3 : Trouver une longueur sur le plan\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec un tableau dans la correction']
    this.sup = '4'
    this.sup2 = false
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    // Ebauche de la consigne en fonction des possibilités
    const chaqueCe = ['chaque', 'ce']
    this.consigne = 'Résoudre '
    this.consigne += this.nbQuestions === 1 ? chaqueCe[1] : chaqueCe[0]
    this.consigne += ' problème, lié à une échelle sur un plan.'
    // Fin de l'ébauche de la consigne en fonction des possibilités

    const listeDesProblemes = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    const FamilleH = ['père', 'frère', 'cousin', 'grand-père', 'voisin']
    const FamilleF = [
      'mère',
      'sœur',
      'cousine',
      'grand-mère',
      'tante',
      'voisine',
    ]
    const Famille: string[][] = []
    for (let ee = 0; ee < FamilleH.length; ee++) {
      Famille.push([FamilleH[ee], 'son', 'du'])
    }
    for (
      let ee = FamilleH.length;
      ee < FamilleH.length + FamilleF.length;
      ee++
    ) {
      Famille.push([FamilleF[ee - FamilleH.length], 'sa', 'de la'])
    }
    const Echelle: { echelle: number; lieu?: string }[] = [
      { echelle: 100 },
      { echelle: 200 },
      { echelle: 250 },
      { echelle: 1000 },
      { echelle: 1500 },
      { echelle: 5000 },
      { echelle: 100000 },
      { echelle: 200000 },
      { echelle: 250000 },
      { echelle: 2000000 },
      { echelle: 2500000 },
      { echelle: 5000000 },
    ]
    const Lieux = ['de la maison', 'du quartier', 'de la ville', 'du pays']
    for (let ee = 0; ee < Echelle.length; ee++) {
      Echelle[ee].lieu = Lieux[quotientier(ee, 3)]
    }
    const tableauUnites = ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km']
    for (
      let i = 0,
        unite1,
        unite2,
        echelleQ,
        echelleQUnite2,
        nb1,
        nb1Unite1,
        nb2,
        nb2Unite2,
        nb2Unite1,
        quidam,
        quidam2,
        texte,
        texteCorr,
        reponse;
      i < this.nbQuestions;
      i++
    ) {
      texte = ''
      let monTableau
      switch (listeDesProblemes[i]) {
        case 1:
          quidam = choice(Famille)
          quidam2 = choice([prenomF(), prenomM()])
          nb1 = choice(rangeMinMax(3, 17, [10])) // nb1 est le nombre de mm
          unite1 = tableauUnites[Math.floor(Math.log10(nb1))] // unite1 est l'unité d'usage de nb1 (mm ou cm)
          nb1Unite1 = nb1 / Math.pow(10, Math.min(Math.floor(Math.log10(nb1)))) // nb1Unite1 vaut nb1 dans l'unite1
          echelleQ = choice(Echelle) // echelle choisie pour cette question
          nb2 = nb1 * echelleQ.echelle // nb2 est la distance réelle en mm
          unite2 = tableauUnites[Math.floor(Math.min(Math.log10(nb2), 6))] // unite2 est l'unité d'usage de nb2 (m, dam, hm ou km)
          nb2Unite1 = arrondi(
            nb2 / Math.pow(10, Math.min(Math.floor(Math.log10(nb1)), 6)),
            3,
          ) // nb2Unite1 vaut nb2 dans l'unite1
          nb2Unite2 = arrondi(
            nb2 / Math.pow(10, Math.min(Math.floor(Math.log10(nb2)), 6)),
            3,
          ) // nb2Unite2 vaut nb2 dans l'unite2
          reponse = new FractionEtendue(nb1, nb2)
          texte += `Sur le plan ${echelleQ.lieu} de ${quidam[1]} ${quidam[0]}, ${quidam2} constate que $${texNombre(nb1Unite1)}$ ${unite1} sur le plan correspond à $${texNombre(nb2Unite2)}$ ${unite2} dans la réalité.<br>`
          texte += " Quelle est l'échelle du plan ? "
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
          )
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })

          if (this.sup2) {
            texteCorr =
              "Trouver l'échelle, cela peut se faire en calculant le coefficient de proportionnalité d'un tableau de proportionnalité, comme celui ci-dessous.<br>"
            monTableau = tableau({
              largeurTitre: 11,
              largeur: 4,
              nbColonnes: 2,
              ligne1: [
                {
                  texte: '\\text{Distance sur le plan (en \\ldots)}',
                  latex: true,
                },
                {
                  texte: '',
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: '',
                  math: true,
                  latex: true,
                },
              ],
              flecheDroite: {
                texte: '\\times \\ldots',
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr +=
              'Pour la distance sur le plan, par habitude, on indique $1$.<br>'
            texteCorr +=
              'Le remplissage de ce tableau de proportionnalité nécessite que la distance réelle et la distance sur le plan soit exprimée dans la même unité.<br>'
            texteCorr += `Choisissons le ${unite1} et convertissons alors la distance réelle en ${unite1} : $${texNombre(nb2Unite2)}$ ${unite2} = $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}$ ${unite1}.<br>`
            texteCorr +=
              'On remplit le tableau avec ces informations et on calcule le coefficient de proportionnalité.<br>'

            monTableau = tableau({
              largeurTitre: 11,
              largeur: 5, // Taille nécessaire pour des grands nombres parfois,
              ligne1: [
                {
                  texte: `\\text{Distance sur le plan (en ${unite1})}`,
                  latex: true,
                },
                { texte: texNombre(1, 0), math: true, latex: true },
                { texte: texNombre(nb1Unite1), math: true, latex: true },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: texNombre(reponse.simplifie().den, 0),
                  math: true,
                  latex: true,
                  gras: true,
                  color: bleuMathalea,
                },
                {
                  texte: texNombre(
                    new Decimal(nb1Unite1).mul(echelleQ.echelle),
                    0,
                  ),
                  math: true,
                  latex: true,
                  gras: true,
                },
              ],
              flecheDroite: {
                texte:
                  '\\times' +
                  texFractionFromString(
                    nb1Unite1 * echelleQ.echelle,
                    nb1Unite1,
                  ),
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
              flecheHaut: [
                [
                  2,
                  1,
                  {
                    texte: '\\div' + texNombre(nb1Unite1, 2),
                    math: true,
                    latex: true,
                    gras: true,
                    color: bleuMathalea,
                  },
                ],
              ],
              flecheBas: [
                [
                  2,
                  1,
                  {
                    texte: '\\div' + texNombre(nb1Unite1, 2),
                    math: true,
                    latex: true,
                    gras: true,
                    color: bleuMathalea,
                  },
                ],
              ],
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr += `En effet, $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)} \\div ${texNombre(nb1Unite1, 2)} = ${texNombre(Number(echelleQ.echelle), 0)}$.<br>`
          } else {
            texteCorr = `$${texNombre(nb1Unite1, 2)}$ ${unite1} sur le plan représente $${texNombre(nb2Unite2, 2)}$ ${unite2} dans la réalité. `
            texteCorr += `Pour trouver l'échelle, il faut, d'abord, mettre ces deux distances dans la même unité.<br>Choisissons la plus petite des deux, soit le ${unite1}, et ainsi $${texNombre(nb2Unite2, 2)}$ ${unite2} = $${texNombre(nb2Unite1)}$ ${unite1}.<br>`
            texteCorr += `$${texNombre(nb1Unite1, 2)}$ ${unite1} sur le plan représente alors $${texNombre(nb2Unite1, 2)}$ ${unite1} dans la réalité et l'échelle du plan est donc, de $${new FractionEtendue(nb1Unite1, nb2Unite1).texFSD}.$<br>`
            texteCorr +=
              "Cette réponse est acceptée mais on a l'habitude de trouver une fraction avec numérateur et dénominateur entiers et si possible, dont l'un des deux est égal à $1$.<br>"
            texteCorr += `Or, $${new FractionEtendue(nb1Unite1, nb2Unite1).texFSD}=${texFractionFromString(texNombre(nb1Unite1) + sp(2) + miseEnEvidence('\\div ' + sp(2) + texNombre(nb1Unite1), bleuMathalea), texNombre(nb2Unite1, 2) + sp(2) + miseEnEvidence('\\div ' + sp(2) + texNombre(nb1Unite1, 2), bleuMathalea))}=${reponse.simplifie().texFraction}$. `
          }
          texteCorr += `Donc, l'échelle du plan ${echelleQ.lieu} ${quidam[2]} ${quidam[0]} ${deDevant(quidam2)} est de : $${miseEnEvidence(reponse.simplifie().texFSP)}$.<br>`
          texteCorr += `Remarque : cela signifie que, sur le plan ${echelleQ.lieu} ${quidam[2]} ${quidam[0]} ${deDevant(quidam2)}, $1$ ${unite1} représente $${texNombre(reponse.simplifie().den)}$ ${unite1} en réalité, et donc, $1$ ${unite1} représente $${texNombre(reponse.simplifie().den / Math.pow(10, Math.min(Math.floor(Math.log10(reponse.simplifie().den)), 6)), 2)}$ ${unite2} en réalité.`
          break
        case 2:
          quidam = choice(Famille)
          quidam2 = choice([prenomF(), prenomM()])
          nb1 = choice(rangeMinMax(3, 47, [10, 20, 30, 40]))
          nb1Unite1 = new Decimal(nb1).div(
            Math.pow(10, Math.min(Math.floor(Math.log10(nb1)), 6)),
          )
          echelleQ = choice(Echelle)
          echelleQUnite2 = new Decimal(echelleQ.echelle).div(
            Math.pow(
              10,
              Math.min(
                Math.floor(Math.log10(echelleQ.echelle)),
                6 - Math.floor(Math.log10(nb1)),
              ),
            ),
          )
          unite1 = tableauUnites[Math.floor(Math.log10(nb1))]
          nb2 = nb1 * echelleQ.echelle
          unite2 =
            tableauUnites[
              Math.floor(
                Math.min(
                  Math.log10(echelleQ.echelle) + Math.floor(Math.log10(nb1)),
                  6,
                ),
              )
            ]
          nb2Unite2 = nb1Unite1.toNumber() * echelleQUnite2.toNumber()
          reponse = nb2Unite2
          texte += `Le plan ${echelleQ.lieu} ${quidam[2]} ${quidam[0]} ${deDevant(quidam2)} a une échelle de $${new FractionEtendue(1, echelleQ.echelle).texFSD}$.<br>
          ${quidam2} mesure, sur ce plan, un segment de $${texNombre(nb1Unite1, 2)}\\text{ ${unite1}}$.<br>
            À quelle distance réelle`
          texte += context.isAmc ? ' (en ' + unite2 + '),' : ''
          texte += ' ce segment correspond-il ?'
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
              texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
            })
          }
          handleAnswers(this, i, {
            reponse: {
              value: new Grandeur(reponse, unite2),
              options: { unite: true },
            },
          })

          if (this.sup2) {
            texteCorr =
              'En utilisant un tableau de proportionnalité, on pourrait obtenir un tableau comme celui ci-dessous.<br>'
            monTableau = tableau({
              largeurTitre: 11,
              largeur: 4,
              ligne1: [
                {
                  texte: `\\text{Distance sur le plan (en ${unite1})}`,
                  latex: true,
                },
                { texte: texNombre(1, 0), math: true, latex: true },
                {
                  texte: texNombre(nb1Unite1, 2),
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: texNombre(echelleQ.echelle, 0),
                  math: true,
                  latex: true,
                },
                {
                  texte: '?',
                  math: true,
                  latex: true,
                  gras: true,
                  color: bleuMathalea,
                },
              ],
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr +=
              'Ce tableau de proportionnalité peut être rempli par linéarité multiplicative ou par le coefficient de proportionnalité comme ci-dessous.<br>'
            monTableau = tableau({
              largeurTitre: 11,
              largeur: 5,
              ligne1: [
                {
                  texte: `\\text{Distance sur le plan (en ${unite1})}`,
                  latex: true,
                },
                { texte: texNombre(1, 0), math: true, latex: true },
                {
                  texte: texNombre(nb1Unite1, 2),
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: texNombre(echelleQ.echelle, 0),
                  math: true,
                  latex: true,
                },
                {
                  texte: texNombre(
                    new Decimal(nb1Unite1).mul(echelleQ.echelle),
                    0,
                  ),
                  color: bleuMathalea,
                  math: true,
                  latex: true,
                  gras: true,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\times' + texNombre(nb1Unite1, 2),
                    math: true,
                    latex: true,
                    gras: true,
                    color: bleuMathalea,
                  },
                ],
              ],
              flecheBas: [
                [
                  1,
                  2,
                  {
                    texte: '\\times' + texNombre(nb1Unite1, 2),
                    math: true,
                    latex: true,
                    gras: true,
                    color: bleuMathalea,
                  },
                ],
              ],
              flecheDroite: {
                texte: '\\times' + texNombre(echelleQ.echelle, 0),
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr += `En effet, $${texNombre(echelleQ.echelle, 0)} \\times ${texNombre(nb1Unite1, 2)} = ${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}$.<br>`
            texteCorr += `La distance réelle est donc, de $${miseEnEvidence(`${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}\\text{ ${unite1}}`)}$. Ce peut être une réponse acceptée mais ce n'est sans doute pas dans l'unité la plus adaptée pour la réalité.<br>`
            texteCorr += `Convertissons dans une unité plus adaptée : $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}$ ${unite1} = $${texNombre(reponse, 2)}$ ${unite2}.<br>`
          } else {
            texteCorr = `Une échelle de $${new FractionEtendue(1, echelleQ.echelle).texFSD}$ signifie que $1$ ${unite1} sur le plan représente $${texNombre(echelleQ.echelle)}$ ${unite1} en réalité, soit $${texNombre(echelleQUnite2, 2)}$ ${unite2}.<br>`
            texteCorr += `$${texNombre(nb1Unite1)}$ ${unite1} étant $${texNombre(nb1Unite1)}$ fois plus grand que $1$ ${unite1}, alors la distance réelle est $${texNombre(nb1Unite1)}$ fois plus grande que $${texNombre(echelleQUnite2, 2)}$ ${unite2}. ${sp(10)} `
            texteCorr += `$${texNombre(nb1Unite1)}\\times${texNombre(echelleQUnite2, 2)}$ ${unite2} $= ${texNombre(reponse, 2)}$ ${unite2}.<br>`
          }
          texteCorr += `Le segment de $${texNombre(nb1Unite1)}$ ${unite1} mesuré par ${quidam2} sur le plan ${echelleQ.lieu} ${deDevant(quidam[1])} ${quidam[0]} correspond donc, à une distance réelle de $${miseEnEvidence(`${texNombre(reponse)}\\text{ ${unite2}}`)}$.`
          break
        case 3:
        default:
          quidam = choice(Famille)
          quidam2 = choice([prenomF(), prenomM()])
          nb1 = choice(rangeMinMax(11, 47, [10, 20, 30, 40]))
          nb1Unite1 = nb1
          echelleQ = choice(Echelle)
          unite1 = tableauUnites[1]
          nb2 = nb1 * echelleQ.echelle
          unite2 = tableauUnites[Math.floor(Math.min(Math.log10(nb2), 6))]
          echelleQUnite2 =
            echelleQ.echelle /
            Math.pow(10, Math.min(Math.floor(Math.log10(echelleQ.echelle)), 5))
          nb2Unite2 = nb1 * echelleQUnite2
          nb2Unite1 = nb2
          reponse = arrondi(nb1Unite1, 0)
          texte += `Le plan ${echelleQ.lieu} ${quidam[2]} ${quidam[0]} ${deDevant(quidam2)} a une échelle de $${new FractionEtendue(1, echelleQ.echelle).texFSD}$.<br>
          ${quidam2} trace, sur ce plan, un segment qui représente $${texNombre(nb2Unite2)}$ ${unite2} dans la réalité.<br>
              Quelle est la longueur`
          texte += context.isAmc ? ' (en ' + unite1 + ')' : ''
          texte += ` du segment tracé sur le plan par ${quidam2} ?`
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
              texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
            })
          }
          handleAnswers(this, i, {
            reponse: {
              value: new Grandeur(reponse, unite1),
              options: { unite: true },
            },
          })

          if (this.sup2) {
            texteCorr =
              'En utilisant un tableau de proportionnalité, on pourrait utiliser un tableau comme celui ci-dessous, en faisant apparaître le coefficient de proportionnalité.<br>'
            monTableau = tableau({
              largeurTitre: 11,
              largeur: 4,
              ligne1: [
                {
                  texte: `\\text{Distance sur le plan (en ${unite1})}`,
                  latex: true,
                },
                { texte: stringNombre(1, 0), math: true, latex: true },
                {
                  texte: '',
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: texNombre(echelleQ.echelle, 0),
                  math: true,
                  latex: true,
                },
                {
                  texte: '',
                  math: true,
                  latex: true,
                  gras: true,
                },
              ],
              flecheDroite: {
                texte: '\\times' + texNombre(echelleQ.echelle, 0),
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr += `Ce tableau de proportionnalité nécessite que la distance réelle connue ($${texNombre(nb2Unite2)}$ ${unite2}) soit convertie en ${unite1}.<br>`
            texteCorr += `Convertissons : $${texNombre(nb2Unite2, 2)}$ ${unite2} = $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}$ ${unite1}.<br>`
            texteCorr += `Mettons $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)}$ ${unite1} dans ce tableau de proportionnalité, qui peut alors être rempli par l'inversion du coefficient de proportionnalité comme ci-dessous.<br>`

            monTableau = tableau({
              largeurTitre: 11,
              largeur: 5, // Taille nécessaire pour des grands nombres parfois
              ligne1: [
                {
                  texte: `\\text{Distance sur le plan (en ${unite1})}`,
                  latex: true,
                },
                { texte: texNombre(1, 0), math: true, latex: true },
                {
                  texte: texNombre(nb1Unite1, 2),
                  color: bleuMathalea,
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: `\\text{Distance réelle (en ${unite1})}`,
                  latex: true,
                },
                {
                  texte: texNombre(echelleQ.echelle, 0),
                  math: true,
                  latex: true,
                },
                {
                  texte: texNombre(
                    new Decimal(nb1Unite1).mul(echelleQ.echelle),
                    0,
                  ),
                  math: true,
                  latex: true,
                  gras: true,
                },
              ],
              flecheDroite: {
                texte: '\\div' + texNombre(echelleQ.echelle, 0),
                latex: true,
                color: bleuMathalea,
                gras: true,
              },
              flecheDroiteSens: 'haut',
            })

            texteCorr += mathalea2d(
              Object.assign(fixeBordures([monTableau]), {
                scale: 0.7,
                display: 'block' as const,
              }),
              monTableau,
            )
            texteCorr += `En effet, $${texNombre(new Decimal(nb1Unite1).mul(echelleQ.echelle), 0)} \\div ${texNombre(echelleQ.echelle, 0)} = ${texNombre(nb1Unite1, 2)}$.<br>`
          } else {
            texteCorr = `Une échelle de $${new FractionEtendue(1, echelleQ.echelle).texFSD}$ signifie que $1$ ${unite1} sur le plan représente $${texNombre(echelleQ.echelle)}$ ${unite1} en réalité, soit $${texNombre(echelleQUnite2, 2)}$ ${unite2}.<br>`
            texteCorr += `Cherchons par combien multiplier $${texNombre(echelleQUnite2, 2)}$ ${unite2} pour obtenir $${texNombre(nb2Unite2, 3)}$ ${unite2}. $${sp(10)} ${texNombre(nb2Unite2, 2)}\\div${texNombre(echelleQUnite2, 2)}=${texNombre(nb1Unite1)}$<br>`
            texteCorr += `$${new FractionEtendue(1, echelleQ.echelle).texFSD}=${texFractionFromString(1 + miseEnEvidence('\\times' + texNombre(nb1Unite1), bleuMathalea), texNombre(echelleQ.echelle) + miseEnEvidence('\\times' + texNombre(nb1Unite1), bleuMathalea))}=${new FractionEtendue(nb1Unite1, nb2Unite1).texFSD}$ et donc, une distance de $${texNombre(nb2Unite1)}$ ${unite1} ($${texNombre(nb2Unite2)}$ ${unite2}) est représentée par un segment de $${texNombre(nb1Unite1)}$ ${unite1}.<br>`
          }
          texteCorr += `Le segment représentant $${texNombre(nb2Unite2)}$ ${unite2} dans la réalité, tracé par ${quidam2}, sur le plan ${echelleQ.lieu} ${deDevant(quidam[1])} ${quidam[0]}, mesure $${miseEnEvidence(`${texNombre(reponse)}\\text{ ${unite1}}`)}$.`

          break
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
