import { texPrix } from '../../lib/format/style'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  jourAuHasard,
  minToHeuresMinutes,
  minToHoraire,
  minToHour,
  nomDuMois,
} from '../../lib/outils/dateEtHoraires'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { deDevant, queDevant, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const titre = 'Résoudre des problèmes avec des informations inutiles'

export const dateDePublication = '01/03/2022'
export const dateDeModifImportante = '04/04/2024'

/**
 * Résoudre des problèmes dont certaines informations sont inutiles.
 * @author Éric Elter

 */
export const uuid = '529ad'

export const refs = {
  'fr-fr': ['6N5-4'],
  'fr-2016': ['6C12-4'],
  'fr-ch': ['9R1NO7F-2', '9R2NO7F-2', '9R3NO7F-2', 'PRQST01A-2'], // Primaire anciennement :['9NO16-3'],
}
export default class ExerciceInformationsProblemes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Livres\n2 : Haricots\n3 : Villages de montagne\n4 : Manga\n5 : Film\n6 : Vélo\n7 : Taille\n8 : Gare\n9 : Livreur\n10 : Cargo\n11 : Tous les problèmes\n',
    ]
    this.nbQuestions = 4
    // Multiplier deux nombres
    this.sup = 11

    this.spacing = 2
  }

  nouvelleVersion() {
    // Ebauche de la consigne en fonction des possibilités
    const chaqueCe = ['chaque', 'ce']
    this.consigne = 'Résoudre '
    this.consigne += this.nbQuestions === 1 ? chaqueCe[1] : chaqueCe[0]
    this.consigne += ' problème.'
    const listeDesProblemes = gestionnaireFormulaireTexte({
      max: 10,
      defaut: 11,
      nbQuestions: this.nbQuestions,
      melange: 11,
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

    let choixVersion = 0
    for (
      let i = 0,
        nb,
        nb1,
        nb2,
        nb3,
        nb4,
        nb5,
        quidam,
        quidam2,
        personnage1,
        texte,
        texteCorr,
        reponse,
        reponse1,
        reponse2;
      i < this.nbQuestions;
      i++
    ) {
      reponse = 0 // Initialisation de la réponse pour éviter le type undefined mais mis à jour dans les case
      choixVersion = choice([1, 2])
      texte = ''
      texteCorr = ''
      switch (listeDesProblemes[i]) {
        case 1:
          nb1 = randint(17, 35)
          nb2 = randint(7, 15)
          nb4 = randint(3, 10)
          nb5 = 10 * randint(20, 60)
          texte += `Dans une classe de $${nb1}$ élèves âgés de $${nb2}$ à $${nb2 + 2}$ ans,`
          texte += ` un professeur distribue à chaque enfant $${nb4}$ livres pesant $${nb5}$ g chacun.<br>`
          switch (choixVersion) {
            case 1:
              texte += 'Quel est le nombre total de livres distribués ?'
              reponse = nb1 * nb4
              texteCorr +=
                `$${miseEnEvidence(nb1, bleuMathalea)} \\times ${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' livres', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(reponse, bleuMathalea)}$` +
                texteEnCouleurEtGras(' livres', bleuMathalea) +
                '<br>'
              texteCorr += `$${miseEnEvidence(reponse)}$ livres sont distribués par le professeur.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'livres',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
            case 2:
            default:
              texte +=
                'Quelle est la masse totale des livres distribués à chaque enfant ?'
              reponse = nb5 * nb4
              texteCorr +=
                `$${miseEnEvidence(nb5, bleuMathalea)}$` +
                texteEnCouleurEtGras(' g', bleuMathalea) +
                `$${sp()}\\times${sp()}${miseEnEvidence(nb4, bleuMathalea)}=${miseEnEvidence(texNombre(reponse), bleuMathalea)}$` +
                texteEnCouleurEtGras(' g', bleuMathalea) +
                '<br>'
              texteCorr += `La masse totale des livres distribués à chaque enfant est de $${miseEnEvidence(texNombre(reponse))}$ g.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'g',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
          }
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      enonce:
                        texte +
                        '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                      sanscadre: true,
                      texte: texteCorr,
                      statut: 3,
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
                        texte: '',
                        valeur: [reponse],
                        alignement: 'flushright',
                        param: {
                          digits: nombreDeChiffresDe(reponse),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse),
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
          break
        case 2:
          quidam = prenomM()
          nb1 = randint(2, 5)
          nb2 = choice([250, 500, 600, 750])
          nb3 = arrondi(randint(10, 50) / 10 + randint(1, 9) / 100)
          reponse2 = arrondi(nb1 * nb3)
          nb3 = stringNombre(nb3)
          nb4 = randint(2, 5, nb1)
          nb5 = arrondi(randint(20, 40) / 10 + randint(1, 9) / 100)
          reponse1 = arrondi(nb4 * nb5)
          nb5 = stringNombre(nb5)
          texte += `Au marché, ${quidam} achète $${nb1}$ barquettes de haricots verts de $${nb2}$${sp(1)}g chacune à $${nb3}$${sp(1)}€ pièce `
          texte += ` et $${nb4}$${sp(1)}ananas coûtant $${nb5}$${sp(1)}€ l'unité.<br>`

          switch (choixVersion) {
            case 1:
              texte += 'Quel est le prix total des fruits achetés ?'
              texteCorr +=
                `$${miseEnEvidence(nb4, bleuMathalea)} \\times ${miseEnEvidence(nb5, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texPrix(reponse1), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `Le prix total des fruits achetés est de $${miseEnEvidence(texPrix(reponse1))}$ €.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte += 'Quel est le prix total des légumes achetés ?'
              texteCorr +=
                `$${miseEnEvidence(nb1, bleuMathalea)} \\times ${miseEnEvidence(nb3, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texPrix(reponse2), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `Le prix total des légumes achetés est de $${miseEnEvidence(texPrix(reponse2))}$ €.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse2 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse2),
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
              break
          }
          break
        case 3:
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(501, 978)
          nb2 = randint(230, 450)
          nb3 = randint(5, 11)
          nb4 = randint(110, 230)
          nb5 = randint(128, Math.round(nb1 / 2))
          texte += `Le village de Sainte-${quidam2}-Les-Trois-Vallées compte $${nb1}$ habitants et se situe à une altitude de $${nb2}\\text{ m}$.`
          texte += ` À $${nb3}\\text{ km}$ de là, le village de Saint-${quidam}-Le-Bouquetin, situé $${nb4}\\text{ m}$ plus haut, compte $${nb5}$ habitants de moins.<br>`
          switch (choixVersion) {
            case 1:
              texte += `Combien d'habitants compte le village de Saint-${quidam}-Le-Bouquetin ?`
              reponse = nb1 - nb5
              texteCorr +=
                `$${miseEnEvidence(nb1, bleuMathalea)}$` +
                texteEnCouleurEtGras(' habitants', bleuMathalea) +
                `$${sp()}-${sp()} ${miseEnEvidence(nb5, bleuMathalea)}$` +
                texteEnCouleurEtGras(' habitants', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texNombre(reponse), bleuMathalea)}$` +
                texteEnCouleurEtGras(' habitants', bleuMathalea) +
                '<br>'
              texteCorr += `Le village de Saint-${quidam}-Le-Bouquetin compte $${miseEnEvidence(texNombre(reponse))}$ habitants.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'habitants',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
            case 2:
            default:
              texte += `À quelle altitude se situe le village de Saint-${quidam}-Le-Bouquetin ?`
              reponse = nb2 + nb4
              texteCorr +=
                `$${miseEnEvidence(nb2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                `$${sp()}+${sp()} ${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texNombre(reponse), bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                '<br>'
              texteCorr += `Le village de Saint-${quidam}-Le-Bouquetin se situe à $${miseEnEvidence(texNombre(reponse))}\\text{ m}$ d'altitude.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'm',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
          }
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      enonce:
                        texte +
                        '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                      sanscadre: true,
                      texte: texteCorr,
                      statut: 3,
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
                        texte: '',
                        valeur: [reponse],
                        alignement: 'flushright',
                        param: {
                          digits: nombreDeChiffresDe(reponse),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse),
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
          break
        case 4:
          personnage1 = choice(FamilleH)
          quidam2 = prenomF()
          nb1 = '$1$ h $' + 5 * randint(2, 10) + '$ min'
          nb2 = arrondi(randint(50, 90) / 10 + randint(1, 9) / 100)
          nb3 = randint(5, 9)
          nb4 = choice([10, 20, 50])
          nb5 = 4 * randint(12, 24)
          reponse2 = arrondi(nb4 - nb2)
          nb2 = texPrix(nb2)
          texte += `${quidam2} vient de lire en ${nb1} un manga qu'elle avait payé $${nb2}$ €. `
          texte += `Elle a remarqué que sur chaque page, il y avait exactement $${nb3}$ cases. `
          texte += `C'est grâce au billet de $${nb4}$ € que lui a donné son ${personnage1}, ${queDevant(quidam2)} a pu s'acheter ce livre de $${nb5}$ pages.<br>`
          switch (choixVersion) {
            case 1:
              texte += `Combien y a-t-il de cases dans le manga ${deDevant(quidam2)} ?`
              reponse1 = nb3 * nb5
              texteCorr +=
                `$${miseEnEvidence(nb3, bleuMathalea)}$` +
                texteEnCouleurEtGras(' cases', bleuMathalea) +
                `$${sp()}\\times${sp()} ${miseEnEvidence(nb5, bleuMathalea)}${sp()}=${miseEnEvidence(texNombre(reponse1), bleuMathalea)}$` +
                texteEnCouleurEtGras(' cases', bleuMathalea) +
                '<br>'
              texteCorr += `Il y a $${miseEnEvidence(texNombre(reponse1))}$ cases dans le manga ${deDevant(quidam2)}.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'cases',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte += `Lorsqu'elle a acheté son manga, quelle somme d'argent a-t-on rendu à ${quidam2} ?`
              texteCorr +=
                `$${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}-${sp()} ${miseEnEvidence(nb2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texPrix(reponse2), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `On a rendu à ${quidam2} $${miseEnEvidence(texPrix(reponse2))}$ €.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse2 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse2],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse2),
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
              break
          }
          break
        case 5:
          personnage1 =
            randint(1, 2) === 1
              ? 'sa ' + choice(FamilleF)
              : 'son ' + choice(FamilleH)
          if (randint(1, 2) === 1) {
            quidam = prenomM()
            quidam2 = 'il'
          } else {
            quidam = prenomF()
            quidam2 = 'elle'
          }
          nb = randint(13, 21)
          nb1 =
            jourAuHasard() +
            ' ' +
            randint(2, 29) +
            ' ' +
            nomDuMois(randint(1, 12))
          nb2 = nb * 60 + 5 * randint(2, 11)
          nb3 = (nb + 2) * 60 + 5 * randint(2, 11)
          reponse1 = minToHeuresMinutes(nb3 - nb2)
          nb2 = minToHour(nb2, true)
          nb3 = minToHour(nb3, true)
          nb4 = (nb + 1) * 60 + 5 * randint(2, 11)
          nb5 = randint(37, 58)
          reponse2 = minToHeuresMinutes(nb4 + nb5)
          nb4 = minToHour(nb4, true)
          texte += `${quidam} décide de programmer la box ${deDevant(personnage1)} pour enregistrer un film prévu le ${nb1} et une émission prévue le lendemain. `
          texte += `Le film doit commencer à $${nb2}$ et se terminer à $${nb3}$. L'émission commence à $${nb4}$ et dure $${nb5}$ minutes.<br>`
          switch (choixVersion) {
            case 1:
              texte += 'Quelle est la durée prévue du film ?'
              texteCorr +=
                `$${miseEnEvidence(nb3, bleuMathalea)}` +
                `${sp()}-${sp()}` +
                miseEnEvidence(nb2, bleuMathalea) +
                `${sp()}=${sp()}` +
                miseEnEvidence(
                  minToHour(reponse1[0] * 60 + reponse1[1], true),
                  bleuMathalea,
                ) +
                '$<br>'
              texteCorr += `La durée prévue du film est de $${miseEnEvidence(minToHour(reponse1[0] * 60 + reponse1[1], true))}$.`
              if (this.interactif) {
                texte += remplisLesBlancs(
                  this,
                  i,
                  '%{champ1} ~\\text{h}~%{champ2}~\\text{min}',
                  KeyboardType.clavierDeBase,
                )
                handleAnswers(this, i, {
                  bareme: (listePoints: number[]) => [
                    Math.min(listePoints[0], listePoints[1]),
                    1,
                  ],
                  champ1: { value: reponse1[0] },
                  champ2: { value: reponse1[1] },
                })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: `\\begin{flushright}heures ${sp(65)} \\end{flushright}`,
                            valeur: [reponse1[0]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1[0]),
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
                            texte: `\\begin{flushright}minutes ${sp(65)} \\end{flushright}`,
                            valeur: [reponse1[1]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1[1]),
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
              break
            case 2:
            default:
              texte += "À quelle heure se termine l'émission ?"
              texteCorr +=
                `$${miseEnEvidence(nb4, bleuMathalea)}` +
                `${sp()}+${sp()}` +
                miseEnEvidence(`${nb5}\\text{ minutes}`, bleuMathalea) +
                `${sp()}=${sp()}` +
                miseEnEvidence(
                  minToHour(reponse2[0] * 60 + reponse2[1], true),
                  bleuMathalea,
                ) +
                '$<br>'
              texteCorr += `L'émission se termine à $${miseEnEvidence(minToHoraire(reponse2[0] * 60 + reponse2[1], true))}$.`
              if (this.interactif) {
                texte += remplisLesBlancs(
                  this,
                  i,
                  '%{champ1} ~\\text{h}~%{champ2}~\\text{min}',
                  KeyboardType.clavierDeBase,
                )
                handleAnswers(this, i, {
                  bareme: (listePoints: number[]) => [
                    Math.min(listePoints[0], listePoints[1]),
                    1,
                  ],
                  champ1: { value: reponse2[0] },
                  champ2: { value: reponse2[1] },
                })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: `\\begin{flushright}heures ${sp(65)} \\end{flushright}`,
                            valeur: [reponse2[0]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2[0]),
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
                            texte: `\\begin{flushright}minutes ${sp(65)} \\end{flushright}`,
                            valeur: [reponse2[1]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2[1]),
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
              break
          }
          break
        case 6:
          personnage1 = choice(FamilleF)
          quidam = choice(FamilleH)
          quidam2 = prenomF()
          nb1 = choice([15, 18, 21])
          nb2 = randint(214, 625)
          nb3 = randint(15, 18)
          nb4 = arrondi(randint(2054, 3298) / 100)
          nb5 = choice([2, 3, 4, 6, 12])
          while ((100 * nb2) % nb5 !== 0) {
            nb2 = randint(214, 625)
          }
          reponse2 = nb4 + nb2
          nb4 = texPrix(nb4)
          texte += `La ${personnage1} ${deDevant(quidam2)} lui a acheté un superbe vélo de $${nb1}$ vitesses, coûtant $${nb2}$ €, avec des roues de $${nb3}$ pouces. `
          texte += `Pour la protéger, son ${quidam} lui a offert un casque et du matériel d'éclairage valant $${nb4}$ €. `
          texte += `La ${personnage1} ${deDevant(quidam2)} a décidé de payer le vélo en $${nb5}$ fois.<br>`
          switch (choixVersion) {
            case 1:
              texte += `Quel est le montant de chaque versement que payera la ${personnage1} ${deDevant(quidam2)} ?`
              reponse1 = arrondi(nb2 / nb5)
              texteCorr +=
                `$${miseEnEvidence(nb2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}\\div${sp()}${miseEnEvidence(nb5, bleuMathalea)}=${miseEnEvidence(texPrix(reponse1), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `La ${personnage1} ${deDevant(quidam2)} payera $${nb5}$ fois, la somme de $${miseEnEvidence(texPrix(reponse1))}$ €.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte += `Quel est le montant total des cadeaux offerts à ${quidam2} ?`
              texteCorr +=
                `$${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}+${sp()}${miseEnEvidence(nb2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}=${sp()}${miseEnEvidence(texPrix(reponse2), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `Le montant total des cadeaux offerts à ${quidam2} est de $${miseEnEvidence(texPrix(reponse2))}$ €.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse2 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse2],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse2),
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
              break
          }
          break
        case 7:
          personnage1 = choice(FamilleF)
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(0, 3)
          nb2 = ['3ème', '4ème', '5ème', '6ème'][nb1]
          nb3 = [14, 13, 12, 11][nb1]
          nb4 = arrondi(randint(132, 151) / 100)
          nb5 = randint(21, 42)
          reponse2 = arrondi(nb4 + nb5 / 100)
          nb4 = texNombre(nb4)
          texte += `${quidam}, un élève de ${nb2}, de $${nb3}$ ans, mesure $${nb4}\\text{ m}$. `
          texte += `${quidam2} a $${nb1 + 2}$ ans de plus ${queDevant(quidam)} et mesure $${nb5}\\text{ cm}$ de plus.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Quel est l'âge ${deDevant(quidam2)} ?`
              reponse1 = nb1 + 2 + nb3
              texteCorr +=
                `$${miseEnEvidence(nb3, bleuMathalea)}$` +
                texteEnCouleurEtGras(' ans', bleuMathalea) +
                `$${sp()}+${sp()}${miseEnEvidence(nb1 + 2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' ans', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(reponse1, bleuMathalea)}$` +
                texteEnCouleurEtGras(' ans', bleuMathalea) +
                '<br>'
              texteCorr += `${quidam2} a $${miseEnEvidence(reponse1)}$ ans.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'ans',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte += `Combien mesure ${quidam2} ?`
              texteCorr +=
                `$${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                `$${sp()}+${sp()}${miseEnEvidence(nb5, bleuMathalea)}$` +
                texteEnCouleurEtGras(' cm', bleuMathalea) +
                `$${sp()}=${sp()}${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                `$${sp()}+${sp()}${miseEnEvidence(texNombre(arrondi(nb5 / 100)), bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                `$${sp()}=${sp()}${miseEnEvidence(texNombre(reponse2), bleuMathalea)}$` +
                texteEnCouleurEtGras(' m', bleuMathalea) +
                '<br>'
              texteCorr += `${quidam2} mesure $${miseEnEvidence(texNombre(reponse2))}\\text{ m}$.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'm',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse2 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse2],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse2),
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
              break
          }
          break
        case 8:
          personnage1 = choice(FamilleH)
          quidam = prenomM()
          nb1 = randint(45, 58)
          nb2 = randint(3, 5)
          nb3 = randint(7, 9) * 60 + 5 * randint(2, 11)
          nb4 = arrondi(randint(9, 15, 10) / 10, 1)
          reponse1 = arrondi(nb4 * nb2)
          nb4 = texPrix(nb4)
          nb5 = 5 * randint(4, 11)
          reponse2 = minToHeuresMinutes(nb3 + nb5)
          nb3 = minToHour(nb3, true)
          texte += `Le ${personnage1} ${deDevant(quidam)}, âgé de $${nb1}$ ans, se rend $${nb2}$ fois par semaine à ${choice(['Paris', 'Toulouse', 'Bordeaux', 'Rouen'])} en train. `
          texte += `Une fois arrivé, il prend le métro à $${nb3}$, après avoir acheté systématiquement le même journal, dans un kiosque de la gare, qui coûte $${nb4}$ €. Son trajet en métro dure $${nb5}$ minutes pour se rendre au travail.<br>`

          switch (choixVersion) {
            case 1:
              texte += `Combien le ${personnage1} ${deDevant(quidam)} dépense-t-il chaque semaine pour son journal ?`
              texteCorr +=
                `$${miseEnEvidence(nb2, bleuMathalea)} \\times ${miseEnEvidence(nb4, bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texPrix(reponse1), bleuMathalea)}$` +
                texteEnCouleurEtGras(' €', bleuMathalea) +
                '<br>'
              texteCorr += `Le ${personnage1} ${deDevant(quidam)} dépense chaque semaine $${miseEnEvidence(texPrix(reponse1))}$ € pour son journal.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + '€',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte += `À quelle heure le ${personnage1} ${deDevant(quidam)} arrive-t-il à son travail ?`
              texteCorr +=
                `$${miseEnEvidence(nb3, bleuMathalea)}` +
                `${sp()}+${sp()}` +
                miseEnEvidence(`${nb5}\\text{ min}`, bleuMathalea) +
                `${sp()}=${sp()}` +
                miseEnEvidence(
                  minToHour(reponse2[0] * 60 + reponse2[1], true),
                  bleuMathalea,
                ) +
                '$<br>'
              texteCorr += `Le ${personnage1} ${deDevant(quidam)} arrive à son travail à $${miseEnEvidence(minToHoraire(reponse2[0] * 60 + reponse2[1], true))}$.`
              if (this.interactif) {
                texte += remplisLesBlancs(
                  this,
                  i,
                  '%{champ1} ~\\text{h}~%{champ2}~\\text{min}',
                  KeyboardType.clavierDeBase,
                )
                handleAnswers(this, i, {
                  bareme: (listePoints: number[]) => [
                    Math.min(listePoints[0], listePoints[1]),
                    1,
                  ],
                  champ1: { value: reponse2[0] },
                  champ2: { value: reponse2[1] },
                })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: `\\begin{flushright}heures ${sp(65)} \\end{flushright}`,
                            valeur: [reponse2[0]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2[0]),
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
                            texte: `\\begin{flushright}minutes ${sp(65)} \\end{flushright}`,
                            valeur: [reponse2[1]],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse2[1]),
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
              break
          }
          break
        case 9:
          personnage1 = choice(FamilleF)
          quidam = prenomM()
          quidam2 = prenomF()
          nb1 = randint(21, 39)
          nb2 = randint(7, 18)
          nb3 = randint(7, 15)
          nb4 =
            '$' +
            randint(10, 12) +
            '\\text{ h }' +
            5 * randint(2, 11) +
            '\\text{ min}$'
          nb5 = randint(16, 29)
          texte += `Un livreur part de son entrepôt avec $${nb1}$ colis. Au premier arrêt, le plus près, il dépose $${nb2}$ colis. $${nb3}\\text{ km}$ plus loin, il livre le reste de ses colis. `
          texte += `Ensuite, à ${nb4}, le livreur reprend la même route et retourne à l'entrepôt, à $${nb5}\\text{ km}$ de là.<br>`

          switch (choixVersion) {
            case 1:
              texte += "Quelle distance sépare l'entrepôt du premier arrêt ?"
              reponse = nb5 - nb3
              texteCorr +=
                `$${miseEnEvidence(nb5, bleuMathalea)}${miseEnEvidence('\\text{ km}', bleuMathalea)}${sp()}-${sp()} ${miseEnEvidence(nb3, bleuMathalea)}${miseEnEvidence('\\text{ km}', bleuMathalea)}${sp()}=${miseEnEvidence(reponse, bleuMathalea)}${miseEnEvidence('\\text{ km}', bleuMathalea)}$` +
                '<br>'
              texteCorr += `La distance séparant l'entrepôt du premier arrêt est de $${miseEnEvidence(reponse)}\\text{ km}$.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'km',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
            case 2:
            default:
              texte +=
                'Combien de colis le livreur a-t-il déposé à son deuxième arrêt ?'
              reponse = nb1 - nb2
              texteCorr +=
                `$${miseEnEvidence(nb1, bleuMathalea)}$` +
                texteEnCouleurEtGras(' colis', bleuMathalea) +
                `$${sp()}-${sp()} ${miseEnEvidence(nb2, bleuMathalea)}$` +
                texteEnCouleurEtGras(' colis', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(reponse, bleuMathalea)}$` +
                texteEnCouleurEtGras(' colis', bleuMathalea) +
                '<br>'
              texteCorr += `Le livreur a déposé $${miseEnEvidence(reponse)}$ colis à son deuxième arrêt.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'colis',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              break
          }
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonceAvant: false,
              propositions: [
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      enonce:
                        texte +
                        '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                      sanscadre: true,
                      texte: texteCorr,
                      statut: 3,
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
                        texte: '',
                        valeur: [reponse],
                        alignement: 'flushright',
                        param: {
                          digits: nombreDeChiffresDe(reponse),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse),
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
          break
        case 10:
        default:
          quidam = choice([
            'du Havre',
            'de Rotterdam',
            'de Hambourg',
            'de Marseille',
            'de Lisbonne',
          ])
          quidam2 = choice([
            'Hong-Kong',
            'Rio de Janeiro',
            'Auckland',
            'Sidney',
            'Kuala Lumpur',
          ])
          nb1 = randint(85, 153)
          nb2 = randint(67, 86)
          nb3 = randint(23, 30) // Masse d'un gros conteneur
          nb4 = randint(7, 26)
          nb = arrondi(randint(140, 210) / 10, 1) // Masse d'un petit conteneur
          nb5 = arrondi(nb * nb4, 1)
          reponse2 = nb
          nb5 = texNombre(nb5)

          texte += `Un cargo mesurant $${nb1}\\text{ m}$ transporte $${nb2}$ gros conteneurs de $${nb3}$ tonnes chacun ${quidam} à ${quidam2}. `
          texte += `Ce bateau transporte aussi $${nb4}$ petits conteneurs pour une masse totale de $${nb5}$ tonnes.<br>`

          switch (choixVersion) {
            case 1:
              texte +=
                "Quelle est la masse, en kg, de chacun des petits conteneurs, sachant qu'ils ont tous la même masse ?"
              reponse1 = arrondi(reponse2 * 1000, 0)
              texteCorr +=
                `$${miseEnEvidence(nb5, bleuMathalea)}$` +
                texteEnCouleurEtGras(' tonnes', bleuMathalea) +
                `$${sp()}\\div${sp()}${miseEnEvidence(nb4, bleuMathalea)}=${miseEnEvidence(texNombre(reponse2), bleuMathalea)}$` +
                texteEnCouleurEtGras(' tonnes', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texNombre(reponse1), bleuMathalea)}$` +
                texteEnCouleurEtGras(' kg', bleuMathalea) +
                '<br>'
              texteCorr += `La masse de chacun des petits conteneurs est de $${miseEnEvidence(texNombre(reponse1))}$ kg.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'kg',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse1],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse1),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse1),
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
              break
            case 2:
            default:
              texte +=
                'Quelle est la masse totale, en tonnes, des gros conteneurs ?'
              reponse = nb2 * nb3
              texteCorr +=
                `$${miseEnEvidence(nb2, bleuMathalea)} \\times ${miseEnEvidence(nb3, bleuMathalea)}$` +
                texteEnCouleurEtGras(' tonnes', bleuMathalea) +
                `$${sp()}=${miseEnEvidence(texNombre(reponse), bleuMathalea)}$` +
                texteEnCouleurEtGras(' tonnes', bleuMathalea) +
                '<br>'
              texteCorr += `La masse totale des gros conteneurs est de $${miseEnEvidence(texNombre(reponse))}$ tonnes.`
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBase,
                  {
                    texteApres: sp(3) + 'tonnes',
                  },
                )
                handleAnswers(this, i, { reponse: { value: reponse } })
              }
              if (context.isAmc) {
                this.autoCorrectionAMC[i] = {
                  enonceAvant: false,
                  propositions: [
                    {
                      type: 'AMCOpen',
                      propositions: [
                        {
                          enonce:
                            texte +
                            '<br><br>Indique, ci-dessous, le(s) calcul(s) effectué(s) et code ensuite le résultat.',
                          sanscadre: true,
                          texte: texteCorr,
                          statut: 3,
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
                            texte: '',
                            valeur: [reponse],
                            alignement: 'flushright',
                            param: {
                              digits: nombreDeChiffresDe(reponse),
                              decimals:
                                nombreDeChiffresDansLaPartieDecimale(reponse),
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
              break
          }
          break
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
