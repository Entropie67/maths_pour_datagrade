import { amcConvert } from '../../lib/amc/amcBuilders'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import {
  all,
  isEqual,
  sameTopLevelOperation,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import ChoisirExpressionLitterale from './_Choisir_expression_litterale'
import choisirExpressionNumerique from './_choisirExpressionNumerique'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '21/09/2023'
/**
 * Fonction noyau pour 6 fonctions qui utilisent les mêmes variables et la fonction choisirExpressionNumerique
 * @author Jean-claude Lhote
 */
export default class EcrireUneExpressionNumerique extends Exercice {
  version: number
  litteral: boolean = false
  /** Sous-cas tirés au niveau 5 (voir _choisirExpressionNumerique). Par défaut
   * 0 à 3, dont trois formes n'ont que 2 ou 3 opérations : conservé pour les
   * versions archivées. */
  sousCasCinqOperations?: number[]
  constructor() {
    super()
    this.nbQuestions = 4

    this.sup2 = false // si false alors utilisation de nombres entiers, si true alors utilisation de nombres à un chiffre après la virgule.
    this.sup3 = true // Si présence ou pas du signe "fois"
    this.sup4 = 6
    this.version = 1 // 1 pour ecrire une expression, 2 pour écrire la phrase, 3 pour écrire l'expression et la calculer, 4 pour calculer une expression numérique
    this.besoinFormulaire4Texte = [
      "Nombre d'opérations par expression",
      'Nombres séparés par des tirets :\n1 : Expressions à 1 opération\n2 : Expressions à 2 opérations\n3 : Expressions à 3 opérations\n4 : Expressions à 4 opérations\n5 : Expressions à 5 opérations\n6 : Mélange',
    ] // Texte, tooltip - il faut au moins deux opérations
    this.besoinFormulaire2CaseACocher = [
      'Utilisation de décimaux (pas de calcul mental)',
      false,
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    let expf
    let expn
    let expc
    let decimal
    let nbval
    let nbOperations
    let resultats
    const calculMental = this.sup2
    if (!calculMental) {
      decimal = 10
    } else {
      decimal = 1
    }
    // pour 5C12-1
    if (this.sup2) {
      decimal = 10
    } else {
      decimal = 1
    }
    // pour 6C13-2
    const listeSousCasParNbOperation = [
      combinaisonListes(range(3), this.nbQuestions),
      combinaisonListes(range(9), this.nbQuestions),
      combinaisonListes(range(13), this.nbQuestions),
      combinaisonListes(range(2), this.nbQuestions),
      combinaisonListes(
        this.sousCasCinqOperations ?? range(4),
        this.nbQuestions,
      ),
    ]
    const enoncesLitteraux = new Set<string>()
    const operationsFinalesParType = new Map<number, Set<string>>()
    for (
      let i = 0, val1, val2, cpt = 0;
      i < this.nbQuestions &&
      cpt < (this.litteral ? 50 + 10 * this.nbQuestions : 50);
    ) {
      let texte: string
      let texteCorr: string
      let reponse
      nbOperations = listeTypeDeQuestions[i]
      val1 = randint(2, 5)
      val2 = randint(6, 9)
      if (!this.litteral) {
        const sousCas = listeSousCasParNbOperation[nbOperations - 1][i]
        resultats = choisirExpressionNumerique(
          nbOperations,
          decimal,
          this.sup3,
          calculMental,
          sousCas,
        )
      } else {
        resultats = ChoisirExpressionLitterale(
          nbOperations,
          decimal,
          val1,
          val2,
          this.sup3,
        )
      }
      expf = resultats[0]
      expn = String(resultats[1]).split('=')[0]
      expn += expn[expn.length - 1] !== '$' ? '$' : ''
      expc = resultats[2]
      nbval = resultats[3]
      const expNom = this.litteral ? String(resultats[6]) : resultats[5] // Le split, c'est pour virer le déterminant.
      // Les anciens tirages distinguent les expressions littérales par leur dernière
      // opération. Une fois ces opérations épuisées, l'énoncé distingue les suivantes.
      const operationsFinales = operationsFinalesParType.get(nbOperations)
      const operationsEpuisees =
        this.litteral &&
        (operationsFinales?.size ?? 0) >= (nbOperations === 4 ? 3 : 4)
      if (
        (!this.litteral &&
          this.questionJamaisPosee(
            i,
            nbOperations,
            String(nbval),
            this.version,
            String(expf),
          )) ||
        (this.litteral &&
          !enoncesLitteraux.has(String(expf)) &&
          this.questionJamaisPosee(
            i,
            nbOperations,
            String(nbval),
            this.version,
            operationsEpuisees ? String(expf) : String(resultats[4]),
          ))
      ) {
        if (this.litteral) {
          enoncesLitteraux.add(String(expf))
          if (!operationsFinales) {
            operationsFinalesParType.set(
              nbOperations,
              new Set([String(resultats[4])]),
            )
          } else {
            operationsFinales.add(String(resultats[4]))
          }
        }
        this.autoCorrectionAMC[i] = {}
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        switch (this.version) {
          case 1:
            this.consigne =
              "Traduire la phrase par un calcul (il n'est pas demandé d'effectuer ce calcul)."
            texte = `${expf}.`
            expn = expn.split(' ou ') // Pour traiter le cas du 'ou'.
            texteCorr = `${expf} s'écrit : $${miseEnEvidence(expn[0].substring(1, expn[0].length - 1))}$`
            texteCorr +=
              expn.length > 1
                ? ` ou $${miseEnEvidence(expn[1].substring(1, expn[1].length - 1))}$.`
                : '.'
            reponse =
              expn.length > 1
                ? [
                    expn[0].substring(1, expn[0].length - 1),
                    expn[1].substring(1, expn[1].length - 1),
                  ]
                : expn[0].substring(1, expn[0].length - 1)
            break
          case 2:
            if (expn.indexOf('ou') > 0) {
              expn = expn.substring(0, expn.indexOf('ou') - 1)
            } // on supprime la deuxième expression fractionnaire
            this.consigne = this.interactif
              ? 'De quel type est chaque calcul ?'
              : 'Traduire le calcul par une phrase en français.'
            texte = `${expn}`
            expf = 'l' + String(expf).substring(1)
            texteCorr = this.interactif
              ? `${expn} est ${texteEnCouleurEtGras(String(expNom))} : ${expf}.`
              : `${expn} s'écrit : ${texteEnCouleurEtGras(String(expf))}.`
            break
          case 3: {
            if (this.interactif) {
              this.consigne =
                'Traduire la phrase par un calcul et effectuer le calcul demandé au brouillon.<br> Saisir uniquement le résultat.'
            } else {
              this.consigne =
                'Traduire la phrase par un calcul et effectuer le calcul demandé.'
            }
            if (!this.litteral) texte = `${expf}.`
            else if (nbval === 2) {
              texte = `${expf} puis calculer pour $x=${val1}$ et $y=${val2}$.`
            } // nbval contient le nombre de valeurs en cas de calcul littéral
            else texte = `${expf} puis calculer pour $x=${val1}$.`
            texteCorr = `${expf} s'écrit : ${resultats[1]}.<br>`

            if (!this.litteral) {
              texteCorr = ''
              if (!this.sup4) {
                // EE : Ce test ne semble plus servir.
                const expc2 = String(expc)
                  .substring(1, String(expc).length - 1)
                  .split('=')
                texteCorr += `$${miseEnEvidence(expc2[0])} =$` + sp()
                for (let ee = 1; ee < expc2.length - 1; ee++) {
                  texteCorr += `$${expc2[ee]}  = $` + sp()
                }
                texteCorr += `$${miseEnEvidence(expc2[expc2.length - 1])}$`
              } else {
                // On découpe
                const etapes = String(expc).split('=')
                let nbEtapes = 0
                etapes.forEach(function (etape) {
                  nbEtapes++
                  etape = etape.replace('$', '')
                  if (context.isHtml) {
                    texteCorr += '<br>'
                  }
                  texteCorr +=
                    nbEtapes === etapes.length || nbEtapes === 1
                      ? `${texteEnCouleurEtGras(lettreDepuisChiffre(i + 1) + ' = ')} $${miseEnEvidence(etape)}$ <br>`
                      : `${lettreDepuisChiffre(i + 1)} = $${etape}$ <br>`
                })
              }
            } else if (nbval === 2) {
              texteCorr += `Pour $x=${val1}$ et $y=${val2}$ :<br> ${expc}`
            } else texteCorr += `Pour $x=${val1}$ :<br>${expc}`
            reponse = String(expc)
              .split('=')
              [String(expc).split('=').length - 1].replace('$', '')
            if (this.litteral) {
              // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
              const textCorrSplit = texteCorr.split('=')
              let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
              aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

              texteCorr = ''
              for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
                texteCorr += textCorrSplit[ee] + '='
              }
              texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
              // Fin de cette uniformisation
            }
            break
          }
          case 4:
          default:
            {
              if (expn.indexOf('ou') > 0) {
                expn = expn.substring(0, expn.indexOf('ou') - 1)
              } // on supprime la deuxième expression fractionnaire
              this.consigne = ''
              if (!this.litteral) texte = `${expn}`
              else if (nbval === 2) {
                texte = `Pour $x=${val1}$ et $y=${val2}$, calculer ${expn}.`
              } else texte = `Pour $x=${val1}$, calculer ${expn}.`
              if (!this.litteral) texteCorr = `${expc}`
              else if (nbval === 2) {
                texteCorr = `Pour $x=${val1}$ et $y=${val2}$ :<br>${expc}`
              } else texteCorr = `Pour $x=${val1}$ :<br>${expc}`
              reponse = String(expc)
                .split('=')
                [String(expc).split('=').length - 1].replace('$', '')
              // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
              const textCorrSplit = texteCorr.split('=')
              let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
              aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

              texteCorr = ''
              for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
                texteCorr += textCorrSplit[ee] + '='
              }
              texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
              // Fin de cette uniformisation
            }
            break
        }

        // Si la question n'a jamais été posée, on en créé une autre
        // On doit effectuer un calcul numérique et donner une réponse numérique
        if (this.version > 2) {
          /// vérifier qu'il n'y a plus d'OpenNUM
          if (context.isAmc) {
            texte +=
              '<br>Détailler les calculs dans le cadre et coder le résultat ci-dessous.'
            this.autoCorrectionAMC[i] = {
              enonce: '',
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      enonce: texte,
                      texte: texteCorr,
                      statut: 3,
                      pointilles: false,
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
                        texte: 'Résultat de cet enchaînement de calculs : ',
                        valeur: [Number(reponse)],
                        param: {
                          digits: 2,
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
          } else {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                i,
                this.litteral
                  ? KeyboardType.clavierDeBaseAvecVariable
                  : KeyboardType.clavierDeBaseAvecEgal,
                {
                  texteAvant: ' Résultat : ',
                },
              )

            if (reponse === undefined) {
              throw new Error('Réponse absente')
            }

            handleAnswers(this, i, {
              reponse: { value: reponse },
            })
          }
        }
        // on doit donner la traduction en français de l'expression (liste déroulante pour l'interactif et AMCOpen)
        if (this.version === 2) {
          if (context.isAmc) {
            // AMCOpen pour 5C11, 5C11-1, 5L10-1, 5L10-3
            this.autoCorrectionAMC[i] = {
              enonce: this.consigne + '<br>' + texte,
              propositions: [
                {
                  texte: texteCorr,
                  statut: this.version, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                  pointilles: this.version === 2, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            texte +=
              sp(10) +
              choixDeroulant(this, i, {
                choices: [
                  { label: '?', value: '' },
                  ...shuffle([
                    { label: 'une somme', value: 'somme' },
                    { label: 'une différence', value: 'différence' },
                    { label: 'un produit', value: 'produit' },
                    { label: 'un quotient', value: 'quotient' },
                  ]),
                ],
              })
            const val =
              typeof expNom === 'string'
                ? expNom.replace('une ', '').replace('un ', '')
                : expNom

            handleAnswers(
              this,
              i,
              { reponse: { value: String(val) } },
              { formatInteractif: 'liste-deroulante' },
            )
          }
        }

        if (this.version === 1) {
          if (context.isAmc) {
            // AMCOpen pour 5C11, 5C11-1, 5L10-1, 5L10-3
            this.autoCorrectionAMC[i] = {
              enonce: this.consigne + '<br>' + texte,
              propositions: [
                {
                  texte: texteCorr,
                  statut: this.version, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                  pointilles: false, // this.version === 2 toujours false ici // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                i,
                this.litteral
                  ? KeyboardType.clavierDeBaseAvecVariable
                  : KeyboardType.clavierDeBaseAvecEgal,
                {
                  texteAvant: ' Calcul : ',
                },
              )

            if (reponse === undefined) {
              throw new Error('Réponse absente')
            }

            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                compare: all([isEqual(), sameTopLevelOperation()]),
              },
            })
          }
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
