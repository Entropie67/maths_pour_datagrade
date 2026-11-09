import { Decimal } from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableau } from '../../lib/2d/tableau'
import { orangeMathalea } from '../../lib/colors'
import { texMasse, texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { sp } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes de proportionnalité avec la linéarité (avec ou sans un tableau)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDeModifImportante = '23/06/2024' // Nouveau clavier
export const dateDePublication = '30/05/2021'

/**
 * Résoudre un problème de proportionnalité avec linéarité via tableau
 * @author MireilleGain
 */
export const uuid = '65288'

export const refs = {
  'fr-fr': ['6P3D', 'BP2AutoL7'],
  'fr-2016': ['6P11-2', 'BP2AutoL7'],
  'fr-ch': ['9R1FA1C-4', '9R2FA1C-4', '9R3FA1C-4', 'PRQPF03A-14'],
}

type Item = [string, Decimal]
export default class ProportionnaliteParLineariteTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.sup = 4 // Niveau de difficulté
    this.sup2 = false
    this.sup3 = false

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      "1 : Multiplication\n2 : Division\n3 : Passage par l'unité\n4 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec tableau dans la correction']
    this.besoinFormulaire3CaseACocher = [
      'Avec des situations de non-proportionnalité',
    ]
  }

  nouvelleVersion() {
    this.consigne = `On considère que ${this.nbQuestions > 1 ? 'les' : 'la'} situation${this.nbQuestions > 1 ? 's' : ''} suivante${this.nbQuestions > 1 ? 's' : ''}`
    this.consigne += this.sup3 ? ', sauf cas flagrant,' : ''
    this.consigne += ` ${this.nbQuestions > 1 ? 'sont des' : 'est une'} situation${this.nbQuestions > 1 ? 's' : ''} de proportionnalité.`
    this.consigne += this.sup2
      ? ` ${context.isHtml ? '<br>' : '\\\\\n'}On demande de ${this.nbQuestions > 1 ? 'les' : 'la'} résoudre à l'aide d'un tableau.`
      : ''
    if (context.isHtml && this.interactif && this.sup3) {
      this.consigne +=
        `<br><br><div style="font-style: italic; margin-bottom: 2em;">Si ce n'est pas une situation de proportionnalité, écrire${sp()}: N.</div>`
    }

    let typeDeQuestionsDisponibles
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = this.sup3 ? [1, 1, 1, 1, 4] : [1]
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = this.sup3 ? [2, 2, 2, 2, 4] : [2]
    } else if (this.sup === 3) {
      typeDeQuestionsDisponibles = this.sup3 ? [3, 3, 3, 3, 4] : [3]
    } else {
      typeDeQuestionsDisponibles = this.sup3 ? [1, 2, 3, 2, 4] : [1, 2, 3]
    }

    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"

    let np, cm, ng, o, pp, pg, pu, tp, index, a
    const fruits: Item[] = [
      ['pêches', new Decimal('0.24')],
      ['noix', new Decimal('0.29')],
      ['cerises', new Decimal('0.31')],
      ['pommes', new Decimal('0.12')],
      ['framboises', new Decimal('0.75')],
      ['fraises', new Decimal('0.37')],
      ['citrons', new Decimal('0.08')],
      ['bananes', new Decimal('0.09')],
    ]

    const objets: Item[] = [
      ['billes', new Decimal('0.1')],
      ['bonbons', new Decimal('0.1')],
      ['bougies', new Decimal('1.2')],
      ['crayons', new Decimal('0.5')],
      ['gâteaux', new Decimal('1.3')],
      ['gommes', new Decimal('0.4')],
      ['stickers', new Decimal('0.2')],
      ['cahiers', new Decimal('1.4')],
    ]

    for (
      let i = 0, texte, texteCorr, texteApres, monTableau, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = choice([1, 2, 3])
      // Boucle principale où i+1 correspond au numéro de la question
      texteCorr = ''
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: // multiplication
          if (a === 1) {
            index = randint(0, 7)
            np = randint(1, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = objets[index][1].mul(np * randint(8, 9)).div(10)
            pg = pp.mul(cm)
            o = objets[index][0]
            texte = `${prenom()} achète $${np}$ ${np === 1 ? o.slice(0, -1) : o} pour $${texPrix(pp)}\\text{ €}$. Combien faudrait-il payer pour en acheter $${ng}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Nombre de ${o}}`, latex: true },
                { texte: stringNombre(np, 0), math: true, latex: true },
                {
                  texte: stringNombre(ng, 0),
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                { texte: '\\text{Prix (en euros)}', latex: true },
                {
                  texte: `${stringNombre(pp, 2, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pg, 2, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\times' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = '€'
          } else if (a === 2) {
            index = randint(0, 7)
            np = randint(1, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = fruits[index][1].mul(np)
            pg = pp.mul(cm)
            o = choice([fruits[index][0]])
            texte = `${prenom()} achète $${texMasse(pp)}\\text{ kg}$ de ${o} pour $${texPrix(np)}\\text{ €}$. Quelle masse de ${o} pourrait être achetée avec $${ng}\\text{ €}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Prix des ${o} (en euros)}`, latex: true },
                {
                  texte: stringNombre(np, 0),
                  math: true,
                  latex: true,
                },
                { texte: stringNombre(ng, 0), math: true, latex: true },
              ],
              ligne2: [
                {
                  texte: `\\text{Masse des ${o} (en kg)}`,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 3, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pg, 3, true, false)}`,
                  math: true,
                  latex: true,
                  color: orangeMathalea,
                  gras: true,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\times' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'kg'
          } else {
            index = randint(0, 7)
            np = randint(2, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = new Decimal(randint(11, 48)).mul(np).div(10)
            pg = pp.mul(cm)
            texte = `$${np}$ objets occupent un volume de $${texNombre(pp, 1, false)}\\text{ cm}^3$. Quel volume serait occupé par $${ng}$ de ces objets${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: "\\text{Nombre d'objets}", latex: true },
                { texte: stringNombre(np, 0), math: true, latex: true },
                {
                  texte: stringNombre(ng, 0),
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: '\\text{Volume des objets (en cm}^2\\text{)}',
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 1)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pg, 1)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\times' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'cm$^3$'
          }
          break

        case 2: // division
          if (a === 1) {
            index = randint(0, 7)
            np = randint(1, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = new Decimal(randint(8, 9)).mul(np).div(10)
            pg = pp.mul(cm)
            o = objets[index][0]
            texte = `${prenom()} achète $${ng}$ ${ng === 1 ? o.slice(0, -1) : o} pour $${texPrix(pg)}\\text{ €}$. Combien faudrait-il payer pour en acheter $${np}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Nombre de ${o}}`, latex: true },
                { texte: stringNombre(ng, 0) },
                { texte: stringNombre(np, 0) },
              ],
              ligne2: [
                { texte: '\\text{Prix (en euros)}', latex: true },
                {
                  texte: `${stringNombre(pg, 2, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 2, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pp },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = '€'
          } else if (a === 2) {
            np = randint(1, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = np * randint(40, 60)
            pg = cm * pp
            texte = `${prenom()} peint une surface de $${stringNombre(pg, 0)}\\text{ m}^2$ en $${ng}$ jours. Quelle surface serait peinte en $${np}$ ${np === 1 ? 'jour' : 'jours'}${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: '\\text{Durée (en jours)}', latex: true },
                { texte: stringNombre(ng, 0), math: true, latex: true },
                {
                  texte: stringNombre(np, 0),
                  math: true,
                  latex: true,
                },
              ],
              ligne2: [
                {
                  texte: '\\text{Surface peinte (en m}^2\\text{)}',
                  latex: true,
                },
                {
                  texte: `${stringNombre(pg, 0)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 0)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pp },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'm$^2$'
          } else {
            index = randint(0, 7)
            np = randint(1, 10)
            cm = randint(2, 7)
            ng = np * cm
            pp = fruits[index][1].mul(np)
            pg = pp.mul(cm)
            o = fruits[index][0]
            texte = `${prenom()} achète $${texMasse(pg)}\\text{ kg}$ de ${o} pour $${texPrix(ng)}\\text{ €}$. Quelle masse pourrait être achetée avec $${np}\\text{ €}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Prix des ${o} (en euros)}`, latex: true },
                {
                  texte: stringNombre(ng, 0),
                  math: true,
                  latex: true,
                },
                { texte: stringNombre(np, 0), math: true, latex: true },
              ],
              ligne2: [
                {
                  texte: `\\text{Masse des ${o} (en kg)}`,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pg, 3, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 3, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(cm, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pp },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'kg'
          }
          break

        case 3: // passage par l'unité
          if (a === 1) {
            index = randint(0, 7)
            pu = objets[index][1].mul(randint(1, 19)).div(10)
            np = randint(2, 10)
            pp = pu.mul(np)
            ng = randint(2, 10, [
              np,
              2 * np,
              3 * np,
              4 * np,
              5 * np,
              np / 2,
              np / 3,
              np / 4,
              np / 5,
            ])
            pg = pu.mul(ng)
            o = objets[index][0]
            texte = `${prenom()} achète $${np}$ ${np === 1 ? o.slice(0, -1) : o} pour $${texPrix(pp)}\\text{ €}$. Combien faudrait-il payer pour en acheter $${ng}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Nombre de ${o}}`, latex: true },
                { texte: stringNombre(np, 0), math: true, latex: true },
                {
                  texte: '1',
                  math: true,
                  latex: true,
                },
                { texte: stringNombre(ng, 0), math: true, latex: true },
              ],
              ligne2: [
                { texte: '\\text{Prix (en euros)}', latex: true },
                {
                  texte: `${stringNombre(pp, 2, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pu, 2, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
                {
                  texte: `${stringNombre(pg, 2, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(np, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
                [
                  2,
                  3,
                  {
                    texte: '\\times' + stringNombre(ng, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = '€'
          } else if (a === 2) {
            pu = randint(40, 60)
            np = randint(2, 10)
            pp = pu * np
            ng = randint(2, 10, [
              np,
              2 * np,
              3 * np,
              4 * np,
              5 * np,
              np / 2,
              np / 3,
              np / 4,
              np / 5,
            ])
            pg = pu * ng
            texte = `${prenom()} peint une surface de $${stringNombre(pp, 0)}\\text{ m}^2$ en $${np}$ jours. Quelle surface serait peinte en $${ng}$ jours${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: '\\text{Durée (en jours)}', latex: true },
                { texte: stringNombre(np, 0), math: true, latex: true },
                {
                  texte: '1',
                  math: true,
                  latex: true,
                },
                { texte: stringNombre(ng, 0), math: true, latex: true },
              ],
              ligne2: [
                {
                  texte: '\\text{Surface peinte (en m}^2\\text{)}',
                  latex: true,
                },
                {
                  texte: stringNombre(pp, 0),
                  math: true,
                  latex: true,
                },
                {
                  texte: stringNombre(pu, 0),
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
                {
                  texte: stringNombre(pg, 0),
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(np, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
                [
                  2,
                  3,
                  {
                    texte: '\\times' + stringNombre(ng, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'm$^2$'
          } else {
            index = randint(0, 7)
            pu = objets[index][1].mul(randint(8, 12)).div(10)
            np = randint(2, 10)
            pp = pu.mul(np)
            ng = randint(2, 10, [
              np,
              2 * np,
              3 * np,
              4 * np,
              5 * np,
              np / 2,
              np / 3,
              np / 4,
              np / 5,
            ])
            pg = pu.mul(ng)
            o = fruits[index][0]
            texte = `${prenom()} achète $${texMasse(pp)}\\text{ kg}$ de ${o} pour $${texPrix(np)}\\text{ €}$. Quelle masse de ${o} pourrait être achetée avec $${ng}\\text{ €}$${sp()}? `
            monTableau = tableau({
              largeurTitre: 10,
              ligne1: [
                { texte: `\\text{Prix des ${o} (en euros)}`, latex: true },
                { texte: stringNombre(np, 0), math: true, latex: true },
                {
                  texte: '1',
                  math: true,
                  latex: true,
                },
                { texte: stringNombre(ng, 0), math: true, latex: true },
              ],
              ligne2: [
                {
                  texte: `\\text{Masse des ${o} (en kg)}`,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pp, 3, true, false)}`,
                  math: true,
                  latex: true,
                },
                {
                  texte: `${stringNombre(pu, 3, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
                {
                  texte: `${stringNombre(pg, 3, true, false)}`,
                  math: true,
                  latex: true,
                  gras: true,
                  color: orangeMathalea,
                },
              ],
              flecheHaut: [
                [
                  1,
                  2,
                  {
                    texte: '\\div' + stringNombre(np, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
                [
                  2,
                  3,
                  {
                    texte: '\\times' + stringNombre(ng, 0),
                    math: true,
                    latex: true,
                    gras: true,
                    color: orangeMathalea,
                  },
                ],
              ],
            })

            handleAnswers(
              this,
              i,
              {
                reponse: { value: pg },
              },
              { formatInteractif: 'mathalea-mathfield' },
            )
            texteApres = 'kg'
          }
          break

        case 4: // Non proportionnalité
        default:
          if (a === 1) {
            tp = new Decimal(randint(120, 165)).div(100)
            np = randint(10, 14)
            cm = randint(2, 4)
            ng = np * cm
            texte = `${prenom()} mesure $${texNombre(tp, 2, true, false)}\\text{ m}$ à $${np}$ ans. Quelle sera sa taille à $${ng}$ ans${sp()}?`
            texteCorr =
              "On ne peut pas savoir car la taille n'est pas proportionnelle à l'âge."
            texteApres = 'm'
          } else if (a === 2) {
            tp = randint(30, 45)
            np = randint(10, 13)
            cm = randint(2, 5)
            ng = np * cm
            texte = `${prenom()} pèse $${texMasse(tp)}\\text{ kg}$ à $${np}$ ans. Quelle sera son poids à $${ng}$ ans${sp()}?`
            texteCorr =
              "On ne peut pas savoir car le poids (plus précisément la masse) n'est pas proportionnel à l'âge."
            texteApres = 'kg'
          } else {
            tp = randint(35, 39)
            np = randint(10, 13)
            cm = randint(2, 5)
            ng = np * cm
            texte = `${prenom()} chausse du $${tp}$ à $${np}$ ans. Quelle sera sa pointure à $${ng}$ ans${sp()}?`
            texteCorr =
              "On ne peut pas savoir car la pointure n'est pas proportionnelle à l'âge."
            texteApres = ''
          }

          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: ['\\text{N}', 'N'],
                options: { texteSansCasse: true },
              },
            },
            { formatInteractif: 'mathalea-mathfield' },
          )
          break
      }
      if (listeTypeQuestions[i] !== 4 && monTableau != null) {
        const { xmin, xmax, ymin, ymax } = fixeBordures([monTableau])
        texteCorr = mathalea2d(
          Object.assign(
            { xmin, xmax, ymin, ymax },
            {
              scale: 0.7,
              display: 'block' as const,
            },
          ),
          monTableau,
        )
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.vFON, {
        texteApres: sp(2) + texteApres,
      })
      if (this.questionJamaisPosee(i, np, ng)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        // La correction est un tableau dessiné : la réponse courte est donnée explicitement.
        this.listeReponsesCourtes[i] =
          listeTypeQuestions[i] === 4
            ? 'Situation non proportionnelle'
            : `$${texNombre(pg ?? 0)}$`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
