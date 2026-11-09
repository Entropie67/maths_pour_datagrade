import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  numAlpha,
  premiereLettreEnMajuscule,
  sp,
} from '../../lib/outils/outilString'
import { Arbre, texProba } from '../../modules/arbres'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre =
  'Calculer des probabilités dans une expérience aléatoire à deux épreuves'
export const dateDePublication = '28/12/2021'
export const dateDeModifImportante = '30/08/2022' // Passage en intégralité interactif

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * On doit calculer la probabilité qu'un événement se réalise après une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote (et EE pour passage en interactif intégral)

 */
export const uuid = 'cee5d'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

function unePieceDeuxUrnes(
  exercice: Exercice,
  i: number,
  sup: boolean,
  sup2: boolean,
  sup3: boolean,
  numQuestionInteractif: number,
) {
  i += numQuestionInteractif
  const p = []
  const choix = randint(0, 2)
  let nombres1, nombres2, urne1, urne2, texte, texteCorr
  if (!sup3) {
    nombres1 = choice([
      [1, 2, 3],
      [1, 1, 2],
      [1, 2, 2],
      [1, 1, 3],
    ])
    nombres2 = choice([
      [1, 2, 3],
      [1, 1, 2],
      [1, 2, 2],
      [1, 1, 3],
    ])
  } else {
    const n = randint(1, 3)
    nombres1 = [n, n, n]
    nombres2 = [n, n, n]
  }
  const B = ['B', 'R', 'V']
  const boules = ['bleue', 'rouge', 'verte']
  // do {
  const n1 = shuffle(nombres1)
  const n2 = shuffle(nombres2)
  // } while (n1[0] === n2[0] && n1[1] === n2[1])
  const card1 = n1[0] + n1[1] + n1[2]
  const card2 = n2[0] + n2[1] + n2[2]
  if (sup2) {
    urne1 = new Arbre({
      racine: false,
      rationnel: true,
      nom: 'Pile',
      proba: fraction(1, 2),
      visible: true,
      alter: '',
      enfants: [],
    })
    urne2 = new Arbre({
      racine: false,
      rationnel: true,
      nom: 'Face',
      proba: fraction(1, 2),
      visible: true,
      alter: '',
      enfants: [],
    })
    for (let j = 0; j < 3; j++) {
      urne1.enfants.push(
        new Arbre({
          nom: B[j],
          proba: fraction(n1[j], card1),
          rationnel: true,
          visible: true,
        }),
      )
    }
    for (let j = 0; j < 3; j++) {
      urne2.enfants.push(
        new Arbre({
          nom: B[j],
          proba: fraction(n2[j], card2),
          rationnel: true,
          visible: true,
        }),
      )
    }
  } else {
    urne1 = new Arbre({
      racine: false,
      rationnel: true,
      nom: 'Pile',
      proba: fraction(1, 2),
      visible: false,
      alter: '',
      enfants: [],
    })
    urne2 = new Arbre({
      racine: false,
      rationnel: true,
      nom: 'Face',
      proba: fraction(1, 2),
      visible: false,
      alter: '',
      enfants: [],
    })
    for (let j = 0; j < 3; j++) {
      for (let b = 0; b < n1[j]; b++) {
        urne1.enfants.push(
          new Arbre({
            nom: B[j],
            proba: fraction(1, card1),
            rationnel: true,
            visible: false,
          }),
        )
      }
    }
    for (let j = 0; j < 3; j++) {
      for (let b = 0; b < n2[j]; b++) {
        urne2.enfants.push(
          new Arbre({
            nom: B[j],
            proba: fraction(1, card2),
            rationnel: true,
            visible: false,
          }),
        )
      }
    }
  }

  // On définit l'arbre complet
  const omega = new Arbre({
    racine: true,
    rationnel: true,
    nom: '',
    proba: 1,
    visible: false,
    alter: '',
    enfants: [urne1, urne2],
  })

  omega.setTailles() // On calcule les tailles des arbres.
  const objets = omega.represente(0, 11, 0, sup2 ? 2.5 : 1.2, false, -1, 8) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
  for (let j = 0; j < 3; j++) {
    p[j] = omega.getProba(B[j]) // on calcule P(C) décimale.
  }
  texte = 'On lance une pièce équilibrée.<br>'
  texte +=
    'Si la pièce tombe sur «\u00a0Pile\u00a0», on tire une boule dans une urne contenant '
  for (let j = 0; j < 2; j++) {
    texte += `$${n1[j]}$ boule${n1[j] > 1 ? 's' : ''} ${boules[j]}${n1[j] > 1 ? 's' : ''}, `
  }
  texte += ` et $${n1[2]}$ boule${n1[2] > 1 ? 's' : ''} ${boules[2]}${n1[2] > 1 ? 's' : ''}.<br>`
  texte +=
    'Si la pièce tombe sur «\u00a0Face\u00a0», on tire une boule dans une urne contenant '
  for (let j = 0; j < 2; j++) {
    texte += `$${n2[j]}$ boule${n2[j] > 1 ? 's' : ''} ${boules[j]}${n2[j] > 1 ? 's' : ''}, `
  }
  texte += ` et $${n2[2]}$ boule${n2[2] > 1 ? 's' : ''} ${boules[2]}${n2[2] > 1 ? 's' : ''}.<br>`
  texte += sup ? "On a représenté l'expérience par l'arbre ci-dessous<br>" : ''
  texte += sup
    ? mathalea2d(
        Object.assign(
          { scale: 0.6, display: 'block' } as const,
          fixeBordures(objets),
        ),
        objets,
      )
    : ''
  texte +=
    `Donner la probabilité d'obtenir une boule ${boules[choix]}.` +
    ajouteChampTexteMathLive(
      exercice,
      i,
      KeyboardType.clavierDeBaseAvecFraction,
    )
  handleAnswers(
    exercice,
    i,
    { reponse: { value: new FractionEtendue(p[choix].n, p[choix].d) } },
    { formatInteractif: 'mathlive' },
  )
  texteCorr =
    'La probabilité que la pièce tombe sur «\u00a0Pile\u00a0» est de $\\dfrac{1}{2}$ et '
  texteCorr += `la probabilité de tirer une boule ${boules[choix]} dans la première urne est de $${texProba(urne1.getProba(B[choix]))}$.<br>`
  texteCorr += `La probabilité de l'issue (Pile ; ${boules[choix]}) est donc : $\\dfrac{1}{2}\\times ${texProba(urne1.getProba(B[choix]))}=${texProba(fraction(n1[choix], 2 * card1))}$.<br>`
  texteCorr +=
    'La probabilité que la pièce tombe sur «\u00a0Face\u00a0» est de $\\dfrac{1}{2}$ et '
  texteCorr += `la probabilité de tirer une boule ${boules[choix]} dans la deuxième urne est de $${texProba(urne2.getProba(B[choix]))}$.<br>`
  texteCorr += `La probabilité de l'issue (Face ; ${boules[choix]}) est donc : $\\dfrac{1}{2}\\times ${texProba(urne2.getProba(B[choix]))}=${texProba(fraction(n2[choix], 2 * card2))}$.<br>`
  texteCorr += `L'événement «${sp()}obtenir une boule ${boules[choix]}${sp()}» est réalisé par les issues (Pile ; ${boules[choix]}) et (Face ; ${boules[choix]}), donc sa probabilité est la somme des probabilités calculées ci-dessus.<br>`
  texteCorr += `La probabilité d'obtenir une boule ${boules[choix]} est donc de $${texProba(fraction(n1[choix], 2 * card1))}+${texProba(fraction(n2[choix], 2 * card2))}=${texProba(p[choix])}$.`

  return { texte, texteCorr, alea: [...n1, ...n2] }
}

function urneDeuxTiragesAvecRemise(
  exercice: Exercice,
  i: number,
  sup: boolean,
  sup2: boolean,
  niveau: string,
  numQuestionInteractif: number,
) {
  // tirage dans une urne avec remise
  i += numQuestionInteractif
  const [b1Color, b2Color] = shuffle([
    'bleue',
    'rouge',
    'verte',
    'orange',
    'noire',
    'jaune',
  ]).splice(0, 2)

  const b1Char = premiereLettreEnMajuscule(b1Color.charAt(0))
  const b2Char = premiereLettreEnMajuscule(b2Color.charAt(0))
  const nbBoule1 = randint(1, 3)
  const nbBoule2 = randint(1, 3) //, nbBoule1)
  const ligneEnt = ['\\text{Tirage1\\textbackslash Tirage2}']
  const colonneEnt = []
  const contenu = []
  const card = nbBoule1 + nbBoule2
  const tirage1 = []
  if (!sup2) {
    for (let i = 0; i < nbBoule1; i++) {
      tirage1.push(
        new Arbre({
          nom: `${b1Char}`,
          rationnel: true,
          proba: fraction(1, card),
          visible: false,
          alter: '',
          enfants: [],
          racine: false,
        }),
      )
      for (let j = 0; j < nbBoule1; j++) {
        tirage1[i].enfants.push(
          new Arbre({
            nom: `${b1Char} `,
            rationnel: true,
            proba: fraction(1, card),
            visible: false,
            alter: '',
            enfants: [],
            racine: false,
          }),
        )
      }
      for (let j = 0; j < nbBoule2; j++) {
        tirage1[i].enfants.push(
          new Arbre({
            nom: `${b2Char}`,
            rationnel: true,
            proba: fraction(1, card),
            visible: false,
            alter: '',
            enfants: [],
            racine: false,
          }),
        )
      }
    }

    for (let i = 0; i < nbBoule2; i++) {
      tirage1.push(
        new Arbre({
          nom: `${b2Char}`,
          rationnel: true,
          proba: fraction(1, card),
          visible: false,
          alter: '',
          enfants: [],
          racine: false,
        }),
      )
      for (let j = 0; j < nbBoule1; j++) {
        tirage1[i + nbBoule1].enfants.push(
          new Arbre({
            nom: `${b1Char} `,
            rationnel: true,
            proba: fraction(1, card),
            visible: false,
            alter: '',
            enfants: [],
            racine: false,
          }),
        )
      }
      for (let j = 0; j < nbBoule2; j++) {
        tirage1[i + nbBoule1].enfants.push(
          new Arbre({
            nom: `${b2Char} `,
            rationnel: true,
            proba: fraction(1, card),
            visible: false,
            alter: '',
            enfants: [],
            racine: false,
          }),
        )
      }
    }
  } else {
    tirage1.push(
      new Arbre({
        nom: `${b1Char}`,
        rationnel: true,
        proba: fraction(nbBoule1, card),
        visible: true,
        alter: '',
        enfants: [],
        racine: false,
      }),
    )
    tirage1.push(
      new Arbre({
        nom: `${b2Char}`,
        rationnel: true,
        proba: fraction(nbBoule2, card),
        visible: true,
        alter: '',
        enfants: [],
        racine: false,
      }),
    )
    for (let j = 0; j < 2; j++) {
      tirage1[j].enfants.push(
        new Arbre({
          nom: `${b1Char} `,
          rationnel: true,
          proba: fraction(nbBoule1, card),
          visible: true,
          alter: '',
          enfants: [],
          racine: false,
        }),
      )
      tirage1[j].enfants.push(
        new Arbre({
          nom: `${b2Char} `,
          rationnel: true,
          proba: fraction(nbBoule2, card),
          visible: true,
          alter: '',
          enfants: [],
          racine: false,
        }),
      )
    }
  }
  const omega = new Arbre({
    nom: '',
    rationnel: true,
    proba: 1,
    visible: false,
    alter: '',
    enfants: tirage1,
    racine: true,
  })

  for (let i = 0; i < card; i++) {
    if (i < nbBoule1) {
      ligneEnt.push(`\\text{${b1Char}}`)
      colonneEnt.push(`\\text{${b1Char}}`)
    } else {
      ligneEnt.push(`\\text{${b2Char}}`)
      colonneEnt.push(`\\text{${b2Char}}`)
    }
    for (let j = 0; j < card; j++) {
      contenu.push(
        `\\text{${i < nbBoule1 ? b1Char : b2Char}${j < nbBoule1 ? b1Char : b2Char}}`,
      )
    }
  }

  const tableau = tableauColonneLigne(
    ligneEnt,
    colonneEnt,
    contenu,
    1,
    true,
    exercice.numeroExercice,
    numQuestionInteractif,
  )

  omega.setTailles() // On calcule les tailles des arbres.
  const objets = omega.represente(0, 12, 0, sup2 ? 2.5 : 1.4, false, -1, 8) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
  const choix = choice([
    [nbBoule1, b1Color, b1Char],
    [nbBoule2, b2Color, b2Char],
  ])
  const probaChoix = fraction(Number(choix[0]) ** 2, card ** 2)
  const proba1 = fraction(nbBoule1 ** 2, card ** 2)
  const proba2 = fraction(nbBoule2 ** 2, card ** 2)
  const proba1et2 = proba1.sommeFraction(proba2)
  const proba3 = fraction(nbBoule1 * nbBoule2, card ** 2)
  const proba4 = proba3.multiplieEntier(2)
  let texte = `Dans une urne, il y a $${nbBoule1}$ boule${nbBoule1 > 1 ? 's' : ''} ${b1Color}${nbBoule1 > 1 && b1Char !== 'O' ? 's' : ''} et $${nbBoule2}$ boule${nbBoule2 > 1 ? 's' : ''} ${b2Color}${nbBoule2 > 1 && b2Char !== 'O' ? 's' : ''} indiscernables au toucher.<br>`
  texte += 'On tire successivement et avec remise deux boules.<br>'
  if (sup)
    texte +=
      mathalea2d(
        Object.assign(
          {
            zoom: 0.8,
            scale: 1 / card,
          },
          fixeBordures(objets),
        ),
        objets,
      ) + '<br><br>'
  texte += `${numAlpha(0)} Déterminer la probabilité d'obtenir deux boules ${choix[1]}${choix[2] !== 'O' ? 's' : ''}.`
  texte +=
    ajouteChampTexteMathLive(
      exercice,
      i,
      KeyboardType.clavierDeBaseAvecFraction,
    ) + '<br>'
  handleAnswers(
    exercice,
    i,
    { reponse: { value: probaChoix } },
    { formatInteractif: 'mathlive' },
  )
  texte += `${numAlpha(1)} Déterminer la probabilité d'obtenir deux boules de la même couleur.`
  texte +=
    ajouteChampTexteMathLive(
      exercice,
      i + 1,
      KeyboardType.clavierDeBaseAvecFraction,
    ) + '<br>'
  handleAnswers(
    exercice,
    i + 1,
    { reponse: { value: proba1et2 } },
    { formatInteractif: 'mathlive' },
  )
  texte += `${numAlpha(2)} Déterminer la probabilité d'obtenir deux boules de couleurs différentes.`
  texte +=
    ajouteChampTexteMathLive(
      exercice,
      i + 2,
      KeyboardType.clavierDeBaseAvecFraction,
    ) + '<br>'
  handleAnswers(
    exercice,
    i + 2,
    { reponse: { value: proba4 } },
    { formatInteractif: 'mathlive' },
  )
  let texteCorr = ''
  texteCorr += "On a représenté l'expérience par le tableau ci-dessous :<br>"
  texteCorr += tableau + '<br>'
  texteCorr += `${b1Char} = ${b1Color} et ${b2Char} = ${b2Color}.<br>`
  texteCorr +=
    "On peut aussi présenter les deux épreuves sous la forme d'un arbre de dénombrement :<br>"
  texteCorr += mathalea2d(
    Object.assign(
      {
        zoom: 0.8,
        scale: 1 / card,
      },
      fixeBordures(objets),
    ),
    objets,
  )
  texteCorr += `<br>${numAlpha(0)} L'événement «${sp()}obtenir deux boules ${choix[1]}${choix[2] !== 'O' ? 's' : ''}${sp()}» est réalisé par l'issue {${choix[2]} ${choix[2]}}.`
  texteCorr += ` On comptabilise $${Number(choix[0]) ** 2}$ issues {${choix[2]}${choix[2]}} sur $${card ** 2}$ issues en tout.<br>`
  texteCorr += `La probabilité de cet événement est donc de $${probaChoix.texFraction}${!probaChoix.estIrreductible ? '=' + probaChoix.texFractionSimplifiee : ''}$.<br>`
  texteCorr += `${numAlpha(1)} L'événement «${sp()}obtenir deux boules de la même couleur${sp()}» est réalisé par les issues {${b1Char + b1Char}, ${b2Char + b2Char}}.`
  texteCorr += ` On comptabilise $${nbBoule1 ** 2}$ issues {${b1Char + b1Char}} et $${nbBoule2 ** 2}$ issues {${b2Char + b2Char}} sur $${card ** 2}$ issues en tout.<br>`
  texteCorr += `La probabilité de cet événement est donc de $${proba1.texFraction}+${proba2.texFraction}`
  texteCorr += `=${proba1et2.texFraction}${!proba1et2.estIrreductible ? '=' + proba1et2.texFractionSimplifiee : ''}$.<br>`

  texteCorr += `${numAlpha(2)} L'événement «${sp()}obtenir deux boules de couleurs différentes${sp()}» est réalisé par les issues {${b1Char + b2Char}, ${b2Char + b1Char}}.`
  texteCorr += ` On comptabilise $${nbBoule1 * nbBoule2}$ issues {${b1Char + b2Char}} et autant d'issues {${b2Char + b1Char}} sur $${card ** 2}$ issues en tout.<br>`
  texteCorr += `La probabilité de cet événement est donc de $2\\times ${proba3.texFraction}=${proba4.texFraction}${!proba4.estIrreductible ? '=' + proba4.texFractionSimplifiee : ''}$.<br>`
  texteCorr += `Une autre façon de faire est de considéré que c'est l'événement contraire de «${sp()}obtenir deux boules de la même couleur${sp()}» dont on a calculé la probabilité à la question ${numAlpha(1)}.<br>`
  texteCorr += `On peut donc calculer la probabilité de cet événement en calculant : $1 -${proba1et2.texFractionSimplifiee} = ${proba1et2.entierMoinsFraction(1).texFractionSimplifiee}$.`

  return { texte, texteCorr, alea: [nbBoule1, nbBoule2, b1Char, b2Char] }
}
export default class CalculProbaExperience2Epreuves2e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Avec arbre', false]
    this.besoinFormulaire2CaseACocher = [
      'Arbre pondéré (si «\u00a0Avec arbre\u00a0» coché)',
      false,
    ]
    this.besoinFormulaire3CaseACocher = ['Équiprobabilité', false]
    this.sup = true
    this.sup2 = false

    this.sup3 = false
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    for (
      let i = 0, cpt = 0, question, numQuestionInteractif = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (i % 2) {
        case 0:
          question = unePieceDeuxUrnes(
            this,
            i,
            this.sup,
            this.sup2,
            this.sup3,
            numQuestionInteractif,
          )
          break
        case 1:
        default:
          question = urneDeuxTiragesAvecRemise(
            this,
            i,
            this.sup,
            this.sup2,
            this.sup3,
            numQuestionInteractif,
          )
          numQuestionInteractif = +2
          break
      }
      if (this.questionJamaisPosee(i, ...question.alea)) {
        this.listeQuestions[i] = question.texte
        this.listeCorrections[i] = question.texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
