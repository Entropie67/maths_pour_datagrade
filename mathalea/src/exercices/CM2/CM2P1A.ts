import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import {
  deDevant,
  numAlpha,
  premiereLettreEnMajuscule,
} from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  MathaleaCouteauSuisseElement,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
export const titre = 'Organiser des données dans un tableau'
export const dateDeModifImportante = '27/08/2024'

/**
 * Organiser donnees depuis texte
 * @author Erwan Duplessy
 * Mis en interactif par Jean-claude Lhote
 */

// source : http://www.ac-grenoble.fr/savoie/pedagogie/docs_pedas/ogd_c2_c3/ogd_c2_c3.pdf

export const interactifReady = true

export const uuid = '99d95'

export const refs = {
  'fr-fr': ['CM2P1A'],
  'fr-2016': ['6S11'],
  'fr-ch': ['9R1FA2A-5', '9R2FA2A-5', '9R3FA2A-5', 'PRQST01A-7'], // Primaire anciennement : ['9FA1-3'],
}
export default class OrganiserDonneesDepuisTexte extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = ['Nombre de fruits différents', 4]
    this.besoinFormulaire3Numerique = ["Nombre d'amis", 4]
    this.besoinFormulaireCaseACocher = [
      'Pour utiliser des nombres décimaux et des masses',
      false,
    ]
    this.besoinFormulaire4CaseACocher = [
      'Avec au moins un fruit de chaque',
      false,
    ]

    this.consigne = "Répondre aux questions à l'aide du texte."
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = false // false -> effectif ; true -> masse
    this.sup2 = 4 // paramètre nombre de fruit
    this.sup3 = 3 // paramètre nombre d'amis
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    const nbAmis = contraindreValeur(2, 4, this.sup3, 4) // min = 2;
    let texte
    let texteCorr
    let m
    let S
    const nbFruits = contraindreValeur(2, 4, this.sup2, 4) // min = 2
    const lstPrenomExo: string[] = []
    while (lstPrenomExo.length < nbAmis) {
      const p = prenom() as string
      if (!lstPrenomExo.includes(p)) {
        lstPrenomExo.push(p)
      }
    }

    const lstFruit = [
      'pomme',
      'poire',
      'kiwi',
      'pêche',
      'coing',
      'melon',
      'citron',
      'banane',
      'mangue',
    ]
    const lstFruitExo: string[] = []
    // Choisir les fruits :
    for (let i = 0; i < nbFruits; i++) {
      lstFruitExo.push(choice(lstFruit, lstFruitExo))
    }
    // Choisir les quantités de fruits pour chaque prénoms :
    const lstTabVal = [] // tableau i : amis et j : fruits
    let L = [] // tab temporaire
    for (let i = 0; i < nbAmis; i++) {
      for (let j = 0; j < nbFruits; j++) {
        if (this.sup) {
          if (randint(this.sup4 ? 1 : 0, 8) > 0) {
            L.push(randint(0, 100) / 10)
          } else {
            L.push(0)
          }
        } else {
          L.push(randint(this.sup4 ? 1 : 0, 10))
        }
      }
      lstTabVal.push(L)
      L = []
    }
    // Affiche l'énoncé :
    texte = "Plusieurs amis reviennent du marché. Il s'agit "
    for (let i = 0; i < nbAmis - 2; i++) {
      texte +=
        i === 0 ? `${deDevant(lstPrenomExo[i])}, ` : `${lstPrenomExo[i]}, `
    }
    texte += `${nbAmis === 2 ? deDevant(lstPrenomExo[0]) : lstPrenomExo[nbAmis - 2]} et ${lstPrenomExo[nbAmis - 1]}.<br>`
    let N
    // boucle sur les phrases. 1 phrase par personne.
    for (let i = 0; i < nbAmis; i++) {
      texte += `${lstPrenomExo[i]} rapporte `
      let L: [number, string][] = [] // ne contient que les fruits d'effectifs strictement positifs
      for (let j = 0; j < nbFruits; j++) {
        N = lstTabVal[i][j]
        if (N > 0) {
          L.push([N, lstFruitExo[j]])
        }
      }
      m = L.length
      L = shuffle(L) // mélange l'ordre des fruits
      for (let k = 0; k < m; k++) {
        if (this.sup) {
          texte += `$${texNombre(L[k][0])}$ kg de ${L[k][1]}s`
        } else {
          texte += `$${texNombre(L[k][0])}$ ${L[k][1]}`
          if (L[k][0] > 1) {
            texte += 's'
          }
        }
        if (k < m - 2) {
          texte += ', '
        }
        if (k === m - 2) {
          texte += ' et '
        }
      }
      texte += '. <br>'
    }
    texte += '<br>'
    texte += `${numAlpha(0)} Remplir le tableau suivant. <br>`
    const tabEntetesColonnes = ['Amis\\textbackslash Fruits']
      .concat(lstFruitExo.map((el) => premiereLettreEnMajuscule(el)))
      .concat(['TOTAL'])
      .map((el) => `\\text{${el}}`)
    const tabEntetesLignes = lstPrenomExo
      .concat(['TOTAL'])
      .map((el) => `\\text{${el}}`)
    const tabLines = new Array((nbAmis + 1) * (nbFruits + 1)).fill('')

    // CORRECTION (je la mets là, parce qu'on a besoin de nmax ef fmax pour les qcm)
    // Question 1 :
    const tabLines2 = []
    for (const arr of lstTabVal) {
      const total = arr.reduce((a, b) => a + b)
      tabLines2.push(...arr, total)
    }
    let sommeTotale = 0
    for (let numFruit = 0; numFruit < nbFruits; numFruit++) {
      let sommeUnFruit = 0
      for (let numAmi = 0; numAmi < nbAmis; numAmi++) {
        sommeUnFruit += lstTabVal[numAmi][numFruit]
      }
      sommeTotale += sommeUnFruit
      tabLines2.push(sommeUnFruit)
    }
    tabLines2.push(sommeTotale)
    const tabLinesCorr = tabLines2.map((el) => miseEnEvidence(texNombre(el, 2)))
    let objetReponse = {}
    for (let i = 0; i < tabLinesCorr.length; i++) {
      const ligne = Math.floor(i / (nbFruits + 1))
      const colonne = i % (nbFruits + 1)
      const ref = `L${ligne + 1}C${colonne + 1}`
      const valeur = Object.assign({}, { value: `${tabLines2[i]}` })
      const cellule = Object.fromEntries([[ref, valeur]])
      objetReponse = Object.assign(objetReponse, cellule)
    }
    texteCorr = `${numAlpha(0)} Voici le tableau complet. <br>`
    texteCorr += tableauColonneLigne(
      tabEntetesColonnes,
      tabEntetesLignes,
      tabLinesCorr,
    )
    texteCorr += '<br>'

    // Question 2 :
    texteCorr += `${numAlpha(1)} ${this.sup ? 'La masse totale' : 'Le nombre total'} de fruits est : $${miseEnEvidence(texNombre(sommeTotale, 2))}$${this.sup ? ' kg' : ''}.<br>`

    // Question 3 :
    texteCorr += `${numAlpha(2)} On regarde la dernière colonne du tableau. `
    let lstmax: string[] = [] // liste des prénoms solutions
    let nmax = 0 // nombre max de fruit pour une personne
    for (let i = 0; i < nbAmis; i++) {
      S = 0
      for (let j = 0; j < nbFruits; j++) {
        S += lstTabVal[i][j] // somme d'une ligne
      }
      if (S === nmax) {
        lstmax.push(lstPrenomExo[i])
      }
      if (S > nmax) {
        nmax = S
        lstmax = [lstPrenomExo[i]]
      }
    }
    const nmaxTex = texNombre(nmax, 1)
    if (lstmax.length > 1) {
      texteCorr += 'Les personnes qui ont rapporté le plus de fruits sont : '
      texteCorr += texteEnCouleurEtGras(String(lstmax[0]))
      for (let k = 1; k < lstmax.length; k++) {
        texteCorr += ` et ${texteEnCouleurEtGras(String(lstmax[k]))}`
      }
      if (this.sup) {
        texteCorr += `. La masse maximale rapportée est de $${nmaxTex}$ kg.<br>`
      } else {
        texteCorr += `. Le nombre maximal de fruits rapporté par une personne est de $${nmaxTex}$.<br>`
      }
    } else {
      texteCorr += `La personne qui a rapporté le plus de fruits est ${texteEnCouleurEtGras(String(lstmax))}. `
      if (this.sup) {
        texteCorr += `Cette masse maximale est de $${nmaxTex}$ kg.<br>`
      } else {
        texteCorr += `Ce nombre maximal de fruits est de $${nmaxTex}$.<br>`
      }
    }

    // Question 4 :
    texteCorr += `${numAlpha(3)} On regarde la dernière ligne du tableau. `
    let fmax: string[] = [] // liste des fruits apporté en quantité max
    nmax = 0 // nombre max par type de fruit
    for (let j = 0; j < nbFruits; j++) {
      S = 0
      for (let i = 0; i < nbAmis; i++) {
        S += lstTabVal[i][j] // somme d'une colonne
      }
      if (S === nmax) {
        fmax.push(lstFruitExo[j])
      }
      if (S > nmax) {
        nmax = S
        fmax = [lstFruitExo[j]]
      }
    }
    const nmaxTex2 = texNombre(nmax, 1)
    if (fmax.length > 1) {
      if (this.sup) {
        texteCorr += 'Les fruits présents en la plus grosse quantité sont : '
      } else {
        texteCorr += 'Les fruits les plus nombreux sont : '
      }
      texteCorr += 'Les fruits les plus nombreux sont : '
      texteCorr += `les ${fmax[0]}s`
      for (let k = 1; k < fmax.length; k++) {
        texteCorr += ` et les ${fmax[k]}s`
      }
      texteCorr += `. Il y en a $${nmax}$ de chaque sorte.<br>`
    } else {
      if (this.sup) {
        texteCorr += `Il y a plus de ${fmax[0]}s que d'autres fruits. Il y en a $${miseEnEvidence(nmaxTex2)}$ kg.`
      } else {
        texteCorr += `Il y a plus de ${fmax[0]}s que d'autres fruits. Il y en a $${miseEnEvidence(nmaxTex2)}$.`
      }
    }
    // fin correction

    if (this.sup) {
      texte += `${numAlpha(1)} Quelle est la masse totale de fruits achetés par les amis ?${ajouteChampTexteMathLive(this, 1, KeyboardType.masse, { texteApres: '<em class="ml-2">(Une unité est attendue.)</em>' })}<br>`
    } else {
      texte += `${numAlpha(1)} Quel est le nombre total de fruits achetés par les amis ?${ajouteChampTexteMathLive(this, 1, KeyboardType.clavierNumbers)}<br>`
    }
    texte += `${numAlpha(2)} Qui a rapporté le plus de fruits ?<br>`
    // qcm pour cette question
    this.autoCorrection[2] = {
      propositions: [],
    }
    this.autoCorrection[2].propositions = []
    for (const p of lstPrenomExo) {
      this.autoCorrection[2].propositions.push({
        texte: p,
        statut: lstmax.includes(p),
      })
    }
    const qcm1 = propositionsQcm(this, 2)
    if (this.interactif) {
      texte += qcm1.texte
    }

    texte += `${numAlpha(3)} Quel fruit a été rapporté en la plus grosse quantité ?<br>`
    this.autoCorrection[3] = {
      propositions: [],
    }
    this.autoCorrection[3].propositions = []
    for (const f of lstFruitExo) {
      this.autoCorrection[3].propositions.push({
        texte: f,
        statut: fmax.includes(f),
      })
    }
    const qcm2 = propositionsQcm(this, 3)
    if (this.interactif) {
      texte += qcm2.texte
    }
    // qcm pour cette quesstion
    if (this.interactif) {
      const tableau = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        tabEntetesColonnes,
        tabEntetesLignes,
        tabLines,
      )
      const leTableau = AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        0,
        tableau,
        'tableauMathlive',
        true,
        {},
      )
      texte += leTableau.output
    } else {
      texte += tableauColonneLigne(
        tabEntetesColonnes,
        tabEntetesLignes,
        tabLines,
        1,
        true,
        0,
        0,
        false,
      )
    }
    handleAnswers(this, 0, objetReponse)
    handleAnswers(this, 1, {
      reponse: {
        value: `${arrondi(sommeTotale, 2)}${this.sup ? ' kg' : ''}`,
        options: this.sup ? { unite: true } : { nombreDecimalSeulement: true },
      },
    })
    const elements: MathaleaCouteauSuisseChild[] = [
      {
        formatInteractif: 'tableau-mathlive',
        questionIndex: 0,
        autoCorrection: this.autoCorrection[0],
      },
      {
        formatInteractif: 'mathalea-mathfield',
        questionIndex: 1,
        autoCorrection: this.autoCorrection[1],
      },
      {
        formatInteractif: 'mathalea-qcm',
        questionIndex: 2,
        autoCorrection: this.autoCorrection[2],
      },
      {
        formatInteractif: 'mathalea-qcm',
        questionIndex: 3,
        autoCorrection: this.autoCorrection[3],
      },
    ]
    this.autoCorrection = [
      {
        formatInteractif: MathaleaCouteauSuisseElement.elementTag,
        elements,
      },
    ]
    // `propositionsQcm()` synchronise provisoirement les deux QCM comme des
    // questions AMC de premier niveau. Ils sont désormais des enfants du
    // couteau suisse et seront inférés depuis `elements`.
    this.autoCorrectionAMC = []
    this.listeQuestions.push(
      MathaleaCouteauSuisseElement.create({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: 0,
        elements,
        contenu: texte,
        interactivityOn: this.interactif,
      }),
    )
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
  }
}
