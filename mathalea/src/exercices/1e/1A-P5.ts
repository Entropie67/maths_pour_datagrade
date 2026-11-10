import { fixeBordures } from '../../lib/2d/fixeBordures'
import { distracteursDistincts } from '../../lib/interactif/qcmDistractors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre, texProba } from '../../modules/arbres'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre =
  "Calculer une probabilité à l'aide d'un arbre de probabilités"
export const interactifReady = true

export const dateDePublication = '4/5/2024'

export const uuid = '51599'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mQCM-1'],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Rémi Angot clone de can1P11-04 de Jean-claude Lhote, Stéphane Guyon pour le QCM

*/
export default class can1P04 extends ExerciceSimple {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.nbQuestions = 1
    this.versionQcm = true
  }

  nouvelleVersion() {
    const rationnel = true
    let objets = []
    // On choisit les probas de l'arbre
    const pA = Number(randint(2, 8) / 10)
    const pB = Number(1 - pA)
    const pAC = Number(randint(2, 8) / 10)
    const pBC = Number(randint(2, 8) / 10)
    // On définit l'arbre complet
    const omega = new Arbre({
      racine: true,
      rationnel,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [
        new Arbre({
          rationnel,
          nom: 'A',
          proba: pA,
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: pAC,
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: Number(1 - pAC),
            }),
          ],
        }),
        new Arbre({
          rationnel,
          nom: '\\bar A',
          proba: Number(1 - pA),
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: pBC,
              visible: false,
              alter: 'x',
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: Number(1 - pBC),
              visible: false,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, rationnel ? 2 : 1.5, true, 1, 8) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
    const pC = omega.getProba('C') // on calcule P(C) décimale.
    let texte = `On donne l'arbre de probabilités ci-dessous et $P(C)=${texProba(pC)}$.<br><br> 
          `
    texte += mathalea2d(
      Object.assign({ display: 'inline' } as const, fixeBordures(objets)),
      objets,
    )
    if (this.versionQcm) {
      texte += '<br> Quelle est la valeur de $x$ ?'
    } else {
      texte += `
          
          $x=$`
    }
    let texteCorr =
      "Comme $A$ et $\\bar A$ forment une partition de l'univers, d'après la loi des probabilités totales :<br>"
    texteCorr += '$P(C)=P(A \\cap C)+P(\\bar{A} \\cap C)$.<br>'
    texteCorr += `Or $P(\\bar{A} \\cap C)=P(\\bar{A}) \\times P_{\\bar{A}}(C)=${texProba(pB)}x$.<br>`
    texteCorr += `Donc $${texProba(pB)}x=P(C)-P(A \\cap C)=${texProba(pC)}-${texProba(pA)}\\times ${texProba(pAC)}=${texProba(pC)}-${texProba(pA * pAC)}=${texProba(pC.differenceFraction(fraction(pA * pAC * 100, 100)))}$.<br>`
    texteCorr += `Donc $x=\\dfrac{${texProba(pC.differenceFraction(fraction(pA * pAC * 100, 100)))}}{${texProba(pB)}}=${miseEnEvidence(this.versionQcm ? texNombre(pBC) : texProba(pBC))}$`
    this.reponse = pBC
    // Des propositions de même forme que la bonne réponse, sans étiquette ni doublon
    this.distracteurs = distracteursDistincts(
      texNombre(pBC),
      [
        `$${texNombre(pBC + 0.1)}$`,
        `$${texNombre(pBC - 0.1)}$`,
        `$${texNombre(10 * pBC)}$`,
      ],
      [`$${texNombre(1 - pBC)}$`, `$${texNombre(pBC / 10)}$`],
      4,
    )
    this.canEnonce = `On donne l'arbre de probabilités ci-dessous et $P(C)=${texProba(pC)}$.<br>
          
          `
    this.question = texte
    this.correction = texteCorr
    this.canEnonce += mathalea2d(
      {
        xmin: -0.1,
        xmax: 14,
        ymin: 0,
        ymax: 6,
        display: 'inline',
        scale: 0.5,
      },
      objets,
    )
    this.canReponseACompleter = `   
          $x=\\ldots$ `
  }
}
