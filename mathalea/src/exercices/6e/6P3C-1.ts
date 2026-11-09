import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tableau } from '../../lib/2d/tableau'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle2tableaux,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
  rangeMinMax,
} from '../../lib/outils/nombres'
import { numAlpha, queDevant, sp } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  checkSum,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre un problème relevant de la proportionnalité avec les propriétés de linéarité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '06/04/2024'

/**
 * Résoudre un problème relevant de la proportionnalité avec les propriétés de linéarité
 * @author Sébastien Lozano (et Éric Elter pour divers enrichissements)
 */

export const uuid = 'd511f'

export const refs = {
  'fr-fr': ['6P3C-1', 'BP2AutoL6'],
  'fr-2016': ['6P11-1', 'BP2AutoL6'],
  'fr-ch': ['9R1FA1C-2', '9R2FA1C-2', '9R3FA1C-2', 'PRQPF03A-12'],
}

type Situation = {
  lieu: string
  achat_sing: string
  achat_plur: string
  pu: number
}
export default class ProportionnaliteParLineariteBis extends Exercice {
  constructor() {
    super()
    this.spacing = context.isHtml ? 2 : 1
    this.besoinFormulaireCaseACocher = [
      'Résolution avec tableau récapitulatif dans la correction',
    ]
    this.sup = false
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const tabHash = []
    const sousChoix = combinaisonListes(rangeMinMax(0, 4), this.nbQuestions)
    const prenomliste = prenom(6)
    const situations: Situation[] = [
      {
        lieu: 'À la boulangerie',
        achat_sing: 'pain au chocolat',
        achat_plur: 'pains au chocolat',
        pu: choice([0.7, 0.75, 0.8, 0.85]),
      },
      {
        lieu: 'À la boulangerie',
        achat_sing: 'croissant',
        achat_plur: 'croissants',
        pu: choice([1.05, 1.15, 0.95, 1.25]),
      },
      {
        lieu: 'À la boulangerie',
        achat_sing: 'baguette',
        achat_plur: 'baguettes',
        pu: choice([0.9, 1.3, 1.1, 1.2]),
      },
      {
        lieu: 'Au supermarché',
        achat_sing: 'bouteille de jus de fruits',
        achat_plur: 'bouteilles de jus de fruits',
        pu: choice([1.8, 1.9, 2.1, 2.3]),
      },
      {
        lieu: 'À la charcuterie',
        achat_sing: 'tranche de jambon',
        achat_plur: 'tranches de jambon',
        pu: choice([1.6, 1.7, 2.2, 2.4]),
      },
    ]

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // une fonction pour gérer le pluriel
      const pluriel = function (n: number, obj: Situation) {
        if (n > 1) {
          return obj.achat_plur
        } else {
          return obj.achat_sing
        }
      }

      // un compteur pour les sous-questions
      let k = 0
      let kCorr = 0
      // on crée un tableau d'objets pour les situations possibles
      let n1, n2, n3, n4, n5, nMax, choixN, choixMult
      do {
        n2 = randint(2, 8)
        n1 = randint(n2 + 1, 9, [n2, 2 * n2, 3 * n2, 4 * n2]) // n1 est plus grand que n2 et non mulitple de n2
        n3 = n1 + n2
        n4 = n1 - n2
        do {
          choixN = choice([n1, n2])
          choixMult = randint(2, 5)
          n5 = choixMult * choixN // n5 est un multiple de n1 ou n2, différent de n3 et n4.
        } while (n5 === n4 || n5 === n3)
        nMax = randint(10, 19, [n3, n5])
      } while (n4 === 1)
      const situation = situations[sousChoix[i]]
      // const consigneQuestions = shuffle([n3, n4, n5])
      const consigneQuestions = [n3, n4, n5]
      const prenomlisteEE = [prenomliste[2], prenomliste[3], prenomliste[4]]
      shuffle2tableaux(consigneQuestions, prenomlisteEE)

      texte = `${situation.lieu}, ${prenomliste[0]} achète $${n1}$ ${pluriel(n1, situation)} et paie $${texPrix(n1 * situation.pu)}$${sp()}€.<br>
      ${prenomliste[1]} achète $${n2}$ ${pluriel(n2, situation)} et paie $${texPrix(n2 * situation.pu)}$${sp()}€.<br>`
      const q1 = `${String.fromCharCode(97 + k)}) Combien paiera ${prenomlisteEE[0]} pour $${consigneQuestions[k]}$ ${pluriel(consigneQuestions[k], situation)} ?`
      const enonceQ1 = q1 + ` %{champ${k + 1}}\n`
      k++
      let enonceAMC = texte + q1
      const propositionsAMC = [
        {
          type: 'AMCNum',
          propositions: [
            {
              texte: texteCorr,
              statut: '',
              reponse: {
                texte: enonceAMC,
                valeur: arrondi(consigneQuestions[0] * situation.pu, 2),
                param: {
                  digits: nombreDeChiffresDe(
                    arrondi(consigneQuestions[0] * situation.pu, 2),
                  ),
                  decimals: nombreDeChiffresDansLaPartieDecimale(
                    arrondi(consigneQuestions[0] * situation.pu, 2),
                  ),
                  signe: false,
                  approx: 0,
                },
              },
            },
          ],
        },
      ]
      enonceAMC = `${numAlpha(k)} Combien paiera ${prenomlisteEE[1]} pour $${consigneQuestions[k]}$ ${pluriel(consigneQuestions[k], situation)} ?`
      const enonceQ2 = `${String.fromCharCode(97 + k)}) Combien paiera ${prenomlisteEE[1]} pour $${consigneQuestions[k]}$ ${pluriel(consigneQuestions[k], situation)} ? %{champ${k + 1}}\n`
      k++
      propositionsAMC.push({
        type: 'AMCNum',
        propositions: [
          {
            texte: '',
            statut: '',
            reponse: {
              texte: enonceAMC,
              valeur: arrondi(consigneQuestions[1] * situation.pu, 2),
              param: {
                digits: nombreDeChiffresDe(
                  arrondi(consigneQuestions[1] * situation.pu, 2),
                ),
                decimals: nombreDeChiffresDansLaPartieDecimale(
                  arrondi(consigneQuestions[1] * situation.pu, 2),
                ),
                signe: false,
                approx: 0,
              },
            },
          },
        ],
      })
      enonceAMC = `${numAlpha(k)} Combien paiera ${prenomlisteEE[2]} pour $${consigneQuestions[k]}$ ${pluriel(consigneQuestions[k], situation)} ? `
      const enonceQ3 = `${String.fromCharCode(97 + k)}) Combien paiera ${prenomlisteEE[2]} pour $${consigneQuestions[k]}$ ${pluriel(consigneQuestions[k], situation)} ? %{champ${k + 1}}\n`
      k++
      propositionsAMC.push({
        type: 'AMCNum',
        propositions: [
          {
            texte: '',
            statut: '',
            reponse: {
              texte: enonceAMC,
              valeur: arrondi(consigneQuestions[2] * situation.pu, 2),
              param: {
                digits: nombreDeChiffresDe(
                  arrondi(consigneQuestions[2] * situation.pu, 2),
                ),
                decimals: nombreDeChiffresDansLaPartieDecimale(
                  arrondi(consigneQuestions[2] * situation.pu, 2),
                ),
                signe: false,
                approx: 0,
              },
            },
          },
        ],
      })
      enonceAMC = `${numAlpha(k)} Quel est le nombre maximum de ${situation.achat_plur} ${queDevant(prenomliste[5])} peut acheter avec $${texPrix(nMax * situation.pu)}$${sp()}€ ? `

      const enonceQ4 = `${String.fromCharCode(97 + k)}) Quel est le nombre maximum de ${situation.achat_plur} ${queDevant(prenomliste[5])} peut acheter avec $${texPrix(nMax * situation.pu)}$${sp()}€ ? %{champ${k + 1}}\n`
      k++
      propositionsAMC.push({
        type: 'AMCNum',
        propositions: [
          {
            texte: '',
            statut: '',
            reponse: {
              texte: enonceAMC,
              valeur: nMax,
              param: {
                digits: 2,
                decimals: 0,
                signe: false,
                approx: 0,
              },
            },
          },
        ],
      })
      if (!this.sup) {
        texteCorr = `
        C'est une situation de proportionnalité. Nous pouvons donc utiliser les propriétés de linéarité de la proportionnalité.<br>
        C'est ce que nous allons faire pour les trois premières questions.<br>`
        const listeCorr: string[] = []
        texteCorr += createList({
          items: [
            ` Pour $${n1}$ ${pluriel(n1, situation)}, on paie $${texPrix(n1 * situation.pu)}$${sp()}€.`,
            `Pour $${n2}$ ${pluriel(n2, situation)}, on paie $${texPrix(n2 * situation.pu)}$${sp()}€.`,
          ],
          style: 'fleches',
        })
        const texteCorrn3 = `
        Donc pour $${n1}$ ${pluriel(n3, situation)} $+$ $${n2}$ ${pluriel(n3, situation)}, on paie $${texPrix(n1 * situation.pu)}$${sp()}€ + $${texPrix(n2 * situation.pu)}$${sp()}€.<br>
        $${texPrix(n1 * situation.pu)}$${sp()}€ + $${texPrix(n2 * situation.pu)}$${sp()}€ = $${texPrix(n3 * situation.pu)}$${sp()}€<br>
        ${prenomliste[2]} paiera donc $${miseEnEvidence(texPrix(n3 * situation.pu))}$${sp()}€ pour $${n3}$ ${pluriel(n3, situation)}.
        `
        const texteCorrn4 = `
        Donc pour $${n1}$ ${pluriel(n3, situation)} $-$ $${n2}$ ${pluriel(n4, situation)}, on paie $${texPrix(n1 * situation.pu)}$${sp()}€ - $${texPrix(n2 * situation.pu)}$${sp()}€.<br>
        $${texPrix(n1 * situation.pu)}$${sp()}€ - $${texPrix(n2 * situation.pu)}$${sp()}€ = $${texPrix(n4 * situation.pu)}$${sp()}€<br>
        ${prenomliste[3]} paiera donc $${miseEnEvidence(texPrix(n4 * situation.pu))}$${sp()}€ pour $${n4}$ ${pluriel(n4, situation)}.
        `
        const texteCorrn5 = `
        Donc pour $${choixMult}\\times${choixN}$ ${pluriel(n5, situation)}, on paie $${choixMult}\\times${texPrix(choixN * situation.pu)}$${sp()}€.<br>
        $${choixMult}\\times${texPrix(choixN * situation.pu)}$${sp()}€ = $${texPrix(n5 * situation.pu)}$${sp()}€<br>
        ${prenomliste[4]} paiera donc $${miseEnEvidence(texPrix(n5 * situation.pu))}$${sp()}€ pour $${n5}$ ${pluriel(n5, situation)}.
        `
        for (let kk = 0; kk < 3; kk++) {
          switch (consigneQuestions[kk]) {
            case n3:
              listeCorr.push(texteCorrn3)
              break
            case n4:
              listeCorr.push(texteCorrn4)
              break
            case n5:
              listeCorr.push(texteCorrn5)
              break
          }
        }
        listeCorr.push(
          `Avec $${texPrix(nMax * situation.pu)}$${sp()}€, ${prenomliste[5]} peut donc acheter $${miseEnEvidence(nMax)}$ ${pluriel(nMax, situation)}.`,
        )
        texteCorr += createList({
          items: listeCorr,
          style: 'alpha',
        })
        texteCorr += `
        On peut utiliser l'une ou l'autre des informations de l'énoncé pour répondre en revenant à l'unité.<br>
        Par exemple, pour $${n1}$ ${pluriel(n1, situation)}, on paie $${texPrix(n1 * situation.pu)}$${sp()}€.<br>
        Donc $1$ ${situation.achat_sing} coûte $${texPrix(n1 * situation.pu)} \\div ${n1} = ${texPrix(situation.pu)}$${sp()}€.<br>
        Pour $${texPrix(nMax * situation.pu)}$${sp()}€, nous aurons donc $${texPrix(nMax * situation.pu)}$ ${sp()}€ $\\div ${texPrix(situation.pu)}$${sp()}€ $= ${nMax}$.<br>
        Avec $${texPrix(nMax * situation.pu)}$${sp()}€, ${prenomliste[5]} peut donc acheter $${miseEnEvidence(nMax)}$ ${pluriel(nMax, situation)}.`
      } else {
        texteCorr = `
      C'est une situation de proportionnalité. Nous pouvons donc utiliser les propriétés de linéarité de la proportionnalité.<br>`
        const texteCorrInit = ``
        const texteCorrn3 = `
      $${texPrix(n1 * situation.pu)}$${sp()}€ + $${texPrix(n2 * situation.pu)}$${sp()}€ = $${miseEnEvidence(texPrix(n3 * situation.pu))}$${sp()}€.<br>`
        const texteCorrn4 = `
      $${texPrix(n1 * situation.pu)}$${sp()}€ - $${texPrix(n2 * situation.pu)}$${sp()}€ = $${miseEnEvidence(texPrix(n4 * situation.pu))}$${sp()}€.<br>`
        const texteCorrn5 = `
     $${choixMult}\\times${texPrix(choixN * situation.pu)}$${sp()}€ = $${miseEnEvidence(texPrix(n5 * situation.pu))}$${sp()}€.<br>`
        for (let kk = 0; kk < 3; kk++) {
          texteCorr += `<br>${numAlpha(kCorr++)} ` + texteCorrInit
          switch (consigneQuestions[kk]) {
            case n3:
              texteCorr += texteCorrn3
              break
            case n4:
              texteCorr += texteCorrn4
              break
            case n5:
              texteCorr += texteCorrn5
              break
          }
        }

        texteCorr += `<br>
      ${numAlpha(kCorr++)}$${texPrix(n1 * situation.pu)}$${sp()}€ $\\div ${n1} = ${texPrix(situation.pu)}$${sp()}€.<br>
       $${texPrix(nMax * situation.pu)}$ ${sp()}€ $\\div ${texPrix(situation.pu)}$${sp()}€ $= ${miseEnEvidence(nMax)}$ ${pluriel(nMax, situation)}.`
        const ligne1 = [
          {
            texte: 'Nombre de ' + situation.achat_plur,
            latex: undefined,
            gras: true,
          },
          { latex: true, texte: n1.toString() },
          { latex: true, texte: n2.toString() },
          { latex: true, texte: consigneQuestions[0].toString() },
          { latex: true, texte: consigneQuestions[1].toString() },
          { latex: true, texte: consigneQuestions[2].toString() },
          {
            latex: true,
            color: orangeMathalea,
            gras: true,
            texte: nMax.toString(),
          },
        ]
        const ligne2 = [
          { texte: 'Prix (en €)', latex: undefined, gras: true },
          { latex: true, texte: texPrix(n1 * situation.pu) },
          { latex: true, texte: texPrix(n2 * situation.pu) },
          {
            latex: true,
            color: orangeMathalea,
            gras: true,
            texte: texPrix(consigneQuestions[0] * situation.pu),
          },
          {
            latex: true,
            color: orangeMathalea,
            gras: true,
            texte: texPrix(consigneQuestions[1] * situation.pu),
          },
          {
            latex: true,
            color: orangeMathalea,
            gras: true,
            texte: texPrix(consigneQuestions[2] * situation.pu),
          },
          { latex: true, texte: texPrix(nMax * situation.pu) },
        ]
        const tableauCorr = tableau({
          largeurTitre: 14,
          largeur: 2.8,
          hauteur: 2,
          nbColonnes: 7,
          origine: pointAbstrait(0, 0),
          ligne1,
          ligne2,
        })
        const tableauRécap = `
        <table style="margin-top:1em; border-collapse:collapse;">
          <tr>
            <th style="border:1px solid #777; padding:4px; text-align:center;">Nombre de ${situation.achat_plur}</th>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${n1}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${n2}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${consigneQuestions[0]}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${consigneQuestions[1]}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${consigneQuestions[2]}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${miseEnEvidence(nMax)}$</td>
          </tr>
          <tr>
            <th style="border:1px solid #777; padding:4px; text-align:center;">Prix (en €)</th>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${texPrix(n1 * situation.pu)}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${texPrix(n2 * situation.pu)}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${miseEnEvidence(texPrix(consigneQuestions[0] * situation.pu))}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${miseEnEvidence(texPrix(consigneQuestions[1] * situation.pu))}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${miseEnEvidence(texPrix(consigneQuestions[2] * situation.pu))}$</td>
            <td style="border:1px solid #777; padding:4px; text-align:center;">$${texPrix(nMax * situation.pu)}$</td>
          </tr>
        </table>`
        if (context.isHtml) {
          texteCorr += `<br> Voici un tableau récapitulatif des informations de l'énoncé : ${tableauRécap}`
        } else {
          texteCorr += `<br> Voici un tableau récapitulatif des informations de l'énoncé :<br>
         ${mathalea2d(
           Object.assign({ scale: 0.4 }, fixeBordures([tableauCorr]), {
             xmin: -0.2,
           }),
           tableauCorr,
         )}`
        }
      }

      if (tabHash.indexOf(checkSum(prenomliste[3], n3, n2, nMax)) === -1) {
        texte += addMultiMathfield(this, i, {
          dataTemplate: enonceQ1 + enonceQ2 + enonceQ3 + enonceQ4,
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierNumbers, texteApres: ' €' },
            champ2: { keyboard: KeyboardType.clavierNumbers, texteApres: ' €' },
            champ3: { keyboard: KeyboardType.clavierNumbers, texteApres: ' €' },
            champ4: { keyboard: KeyboardType.clavierNumbers },
          },
        })
        // Si la question n'a jamais été posée, on en crée une autre
        tabHash.push(checkSum(prenomliste[3], n3, n2, nMax))
        if (!context.isAmc) {
          handleAnswers(
            this,
            i,
            {
              bareme: toutAUnPoint,
              champ1: {
                value: arrondi(consigneQuestions[0] * situation.pu, 2),
              },
              champ2: {
                value: arrondi(consigneQuestions[1] * situation.pu, 2),
              },
              champ3: {
                value: arrondi(consigneQuestions[2] * situation.pu, 2),
              },
              champ4: { value: nMax },
            },
            {
              formatInteractif: 'multi-mathfield',
            },
          )
        } else {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            options: { barreseparation: true, multicolsAll: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
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
