import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import Decimal from 'decimal.js'
import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { grille } from '../../../lib/2d/Grille'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import Grandeur from '../../../modules/Grandeur'

export const titre = 'CAN 6e sujet 2022'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '13/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Aléatoirisation du sujet 2022 de CAN 6e
 * @author Gilles Mora
 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = 'b9634'

export const refs = {
  'fr-fr': ['can6a-2022'],
  'fr-ch': [],
}
export default class SujetCAN2022Sixieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30
    this.sup = Array.from({ length: 30 }, (_, i) => i + 1).join('-')
    this.sup2 = false

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante :<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus «${sp()}coûteuses${sp()}» cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur «${sp()}Nouvelles données${sp()}», on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En décochant «${sp()}Choix du nombre de questions${sp()}», on peut saisir les numéros des questions à afficher, dans l'ordre voulu.
  En choisissant un nombre de questions inférieur à 30, on fabrique une «${sp()}mini${sp()}» Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`
  }

  nouvelleVersion() {
    this.nbQuestionsModifiable = Boolean(this.sup2)
    this.besoinFormulaireTexte = this.sup2
      ? false
      : [
          'Choix des questions',
          'Numéros des questions (de 1 à 30) séparés par des tirets. Par exemple : 1-3-3-12-30',
        ]
    this.besoinFormulaire2CaseACocher = ['Choix du nombre de questions']

    let typeQuestionsDisponibles: number[]
    if (this.sup2) {
      const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 8 possibles.
      const nbQ2 = Math.min(this.nbQuestions - nbQ1, 20)
      const typeQuestionsDisponiblesNiv1 = shuffle([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
        .slice(-nbQ1)
        .sort(compareNombres)
      const typeQuestionsDisponiblesNiv2 = shuffle([
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30,
      ])
        .slice(-nbQ2)
        .sort(compareNombres)
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    } else {
      typeQuestionsDisponibles = gestionnaireFormulaireTexte({
        saisie: String(this.sup ?? ''),
        min: 1,
        max: 30,
        defaut: 31,
        melange: 31,
        shuffle: false,
        nbQuestions: 0,
      }).map(Number)
      this.nbQuestions = typeQuestionsDisponibles.length
    }

    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        texte = '',
        texteCorr = '',
        reponse: number | string | ReturnType<typeof fraction> = 0,
        taille1: Array<[string, number, number, string]>,
        chiffre: Array<[string, number]>,
        chiffre2: Array<[string, number]>,
        propositions,
        code1,
        code2,
        code3,
        code4,
        choix,
        a,
        b,
        c,
        d,
        k,
        s1,
        s2,
        A,
        B,
        C,
        D,
        xmin,
        xmax,
        ymin,
        ymax,
        objets,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(4, 9)
          b = randint(4, 9)
          texte = `$${a} \\times ${b}=$ `
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          reponse = a * b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1

          break

        case 2:
          a = randint(11, 25, 20) * 2
          reponse = a / 2
          texte = `La moitié de $${a}$ est : `
          texteCorr = `La moitié de $${a}$ est $${a}\\div 2=${miseEnEvidence(a / 2)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '\\ldots'
          }
          nbChamps = 1
          break

        case 3:
          a = randint(12, 39, [20, 30])

          reponse = 100 - a
          texte = `Complète : <br>$${a}+\\ldots =100$ `

          texteCorr = `$100-${a}=${miseEnEvidence(100 - a)}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>' + ajouteChampTexteMathLive(this, index, ' ')
          }
          nbChamps = 1
          break

        case 4:
          a = randint(2, 6)
          k = randint(2, 4)
          b = k * a
          reponse = k * b
          texte = `$${a}$ cahiers coûtent $${b}$ €.<br>
             $${b}$ cahiers coûtent `

          texteCorr = `$${a}$ cahiers coûtent $${b}$ €.<br>
            $${k}\\times${a}=${k * a}$ cahiers coûtent $${k}\\times${b}=${miseEnEvidence(k * b)}$ €.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '    ', {
              texteApres: '€.',
            })
          } else {
            texte += '$\\ldots$ €'
          }
          nbChamps = 1
          break
        case 5:
          a = randint(1, 11) * 5
          b = choice([1, 2])
          texte = `$${b}$ h $${a}$ min $=$
             `

          texteCorr = `$${b}$ h $${a}$ min $=${b}\\times 60+ ${a}$ min $=${miseEnEvidence(b * 60 + a)}$ min`

          reponse = b * 60 + a

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '   ', {
              texteApres: 'min',
            })
          } else {
            texte += '$\\ldots$ min'
          }
          nbChamps = 1
          break

        case 6:
          a = randint(84, 100) // choix de la table = écart entre deux graduations

          d = droiteGraduee({
            Unite: 0.5,
            Min: 81,
            Max: 105,
            x: 0,
            y: 0,
            thickDistance: 10,
            thickSec: true,
            thickSecDist: 1,
            thickOffset: 0,
            axeStyle: '->',
            pointListe: [[a, '?']],
            pointCouleur: bleuMathalea,
            pointStyle: 'x',
            labelsPrincipaux: true,
          })
          reponse = a
          texte =
            "Quel est le nombre écrit sous le point d'interrogation ?<br>" +
            mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 15,
                ymax: 2,
                scale: 0.6,
                center: !context.isHtml,
              },
              d,
            )
          texteCorr = `Le nombre écrit sous le point d'interrogation est : $${miseEnEvidence(a)}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 7:
          a = randint(21, 38, [30, 29])
          b = choice([19, 29, 39])

          texte = `$${a}+${b}=$`
          reponse = a + b
          if (b === 19) {
            texteCorr = `$${a}+${b}=${a}+20-1=${a + 20}-1=${miseEnEvidence(reponse)}$`
          }
          if (b === 29) {
            texteCorr = `$${a}+${b}=${a}+30-1=${a + 30}-1=${miseEnEvidence(reponse)}$`
          }
          if (b === 39) {
            texteCorr = `$${a}+${b}=${a}+40-1=${a + 40}-1=${miseEnEvidence(reponse)}$`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1

          break

        case 8:
          choix = choice(['a', 'b', 'c'])
          if (choix === 'a') {
            a = randint(4, 9) * 3

            reponse = Math.round(a / 3)
            texte = `$${a}$ élèves se mettent par groupe de $3$. <br>
          Il y a `
            texteCorr = `Le nombre de groupes est donné par $${a}\\div 3=${miseEnEvidence(a / 3)}$.`
          }
          if (choix === 'b') {
            reponse = randint(4, 9)
            a = reponse * 4
            texte = `$${a}$ élèves se mettent par groupe de $4$. <br>
            Il y a `
            texteCorr = `Le nombre de groupes est donné par $${a}\\div 4=${miseEnEvidence(a / 4)}$.`
          }
          if (choix === 'c') {
            reponse = randint(4, 7)
            a = reponse * 5
            texte = `$${a}$ élèves se mettent par groupe de $5$. <br>
                Il y a `
            texteCorr = `Le nombre de groupes est donné par $${a}\\div 5=${miseEnEvidence(reponse)}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: 'groupes.',
            })
          } else {
            texte += '$\\ldots$ groupes.'
          }
          nbChamps = 1
          break

        case 9:
          choix = choice(['a', 'b', 'c']) //, 'b', 'c'
          if (choix === 'a') {
            reponse = randint(4, 9)
            a = reponse * 4
            texte = `Le quart de $${a}$ est : `
            texteCorr = `Le quart de $${a}$ est : $${a}\\div 4=${miseEnEvidence(reponse)}$.`
          }
          if (choix === 'b') {
            reponse = choice([25, 50, 10, 20, 30, 40])
            a = reponse * 4
            texte = `Le quart de $${a}$ est : `
            texteCorr = `Le quart de $${a}$ est : $${a}\\div 4=${miseEnEvidence(reponse)}$.`
          }
          if (choix === 'c') {
            reponse = randint(4, 10)
            a = reponse * 3
            texte = `Le tiers de $${a}$ est : `
            texteCorr = `Le tiers de $${a}$ est : $${a}\\div 3=${miseEnEvidence(reponse)}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$ '
          }
          nbChamps = 1
          break

        case 10:
          a = randint(4, 9)
          b = randint(2, 9)
          c = randint(2, 5, [a, b])
          texte = `Complète :<br>
            $${a}+${b}=\\ldots+${c}$`
          reponse = a + b - c
          texteCorr = `Le nombre cherché est : $${a}+${b}-${c}=${miseEnEvidence(reponse)}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 11:
          a = randint(1, 9) + randint(3, 7) / 10
          k = choice([10, 100, 1000])
          reponse = a * k
          texte = `$${texNombre(a)}\\times ${texNombre(k)}=$`

          texteCorr = `$${texNombre(a)}\\times ${texNombre(k)}=${miseEnEvidence(texNombre(a * k))}$ `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 12:
          a = randint(14, 19)
          b = choice([35, 40, 45, 50, 55])
          c = a + 2
          d = b - choice([5, 10, 15, 20, 25, 30])

          texte = `Un film commence à $${a}$ h $${b}$ et se termine à $${c}$ h $${d}$.<br>
          Combien de temps a duré le film ?`

          texteCorr = `Pour aller à $${a + 1}$ h, il faut $${60 - b}$ min, et il faut ajouter $1$ heure et $${d}$ min pour arriver à $${c}$ h $${d}$, soit au total $${miseEnEvidence(1)}\\text{ h }${miseEnEvidence(formatMinute(60 - b + d))}\\text{ min}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierHms)
          }

          handleAnswers(this, index, {
            reponse: {
              value: new Hms({ hour: 1, minute: 60 - b + d }).toString(),
              options: { HMS: true },
            },
          })

          nbChamps = 1
          break

        case 13:
          if (choice([true, false])) {
            a = randint(2, 7)
            reponse = 4 * a
            texte = `Complète :<br>$${a}=$`

            texteCorr = `$${a}=\\dfrac{${4 * a}}{4}=${4 * a}\\times \\dfrac{1}{4}$, donc $${miseEnEvidence(4 * a)}$ quarts $=${a}$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, ' ', {
                texteApres: 'quarts',
              })
            } else {
              texte += '$\\ldots$ quarts'
            }
          } else {
            a = randint(2, 7)
            reponse = 3 * a
            texte = `Complète :<br>$${a}=$`

            texteCorr = `$${a}=\\dfrac{${3 * a}}{3}=${3 * a}\\times \\dfrac{1}{3}$, donc $${miseEnEvidence(3 * a)}$ tiers $=${a}$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, ' ', {
                texteApres: 'tiers',
              })
            } else {
              texte += '$\\ldots$ tiers'
            }
          }

          nbChamps = 1

          break

        case 14:
          if (choice([true, false])) {
            a = randint(6, 10)
            b = choice([35, 40, 45, 50, 55])
            c = choice([30, 35, 40, 45])
            texte = `Ajoute $${b}$ min à $${a}$ h $${c}$ min.`
            reponse = b + c - 60
            texteCorr = `Pour aller à $${a + 1}$ h, il faut $${60 - c}$ min, et il reste $${b - 60 + c}$ min à ajouter, ce qui donne
            $${miseEnEvidence(a + 1)}\\text{ h }${miseEnEvidence(reponse)}\\text{ min}$.`
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, KeyboardType.clavierHms)
            }

            handleAnswers(this, index, {
              reponse: {
                value: new Hms({ hour: a + 1, minute: reponse }).toString(),
                options: { HMS: true },
              },
            })
          } else {
            a = randint(6, 10)
            b = choice([20, 25, 30, 35])
            c = choice([45, 50, 55])
            texte = `Ajoute $${b}$ min à $${a}$ h $${c}$ min.`
            reponse = b + c - 60
            texteCorr = `Pour aller à $${a + 1}$ h, il faut $${60 - c}$ min, et il reste $${b - 60 + c}$ min à ajouter, ce qui donne
$${miseEnEvidence(a + 1)}\\text{ h }${miseEnEvidence(reponse)}\\text{ min}$.`
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, KeyboardType.clavierHms)
            }

            handleAnswers(this, index, {
              reponse: {
                value: new Hms({ hour: a + 1, minute: reponse }).toString(),
                options: { HMS: true },
              },
            })
          }

          nbChamps = 1
          break

        case 15:
          a = arrondi(randint(1, 9) + 0.9 + randint(1, 9) / 100, 2)
          b = arrondi(
            randint(1, 9) + randint(1, 9) / 10 + 0.09 + randint(1, 9) / 1000,
            3,
          )

          if (choice([true, false])) {
            texte = `Ajoute un dixième à $${texNombre(a)}$.`
            texteCorr = `$1$ dixième $=0,1$, d'où $${texNombre(a, 2)}+0,1 =${miseEnEvidence(texNombre(a + 0.1, 2))}$`
            reponse = arrondi(a + 0.1, 2)
          } else {
            texte = `Ajoute un centième à $${texNombre(b)}$.`
            texteCorr = `$1$ centième $=0,01$, d'où $${texNombre(b, 3)}+0,01 =${miseEnEvidence(texNombre(b + 0.01, 3))}$`
            reponse = arrondi(b + 0.01, 3)
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 16:
          if (choice([true, false])) {
            a = choice([20, 25, 30, 35, 40, 45, 50])
            b = randint(3, 9)

            reponse = a - b
            texte = `Yann a $${a}$ billes. Il a $${b}$ billes de plus que Lou.<br>
            Lou a `

            texteCorr = `Yann a $${b}$ billes de plus que Lou, donc Lou en a $${b}$ de moins, soit $${a}-${b}=${miseEnEvidence(a - b)}$ billes.`
          } else {
            a = choice([20, 25, 30, 35, 40, 45, 50])
            b = randint(3, 9)

            reponse = a + b
            texte = `Yann a $${a}$ billes. Il a $${b}$ billes de moins que Lou.<br>
               Lou a `
            texteCorr = `Yann a $${b}$ billes de moins que Lou, donc Lou en a $${b}$ de plus, soit $${a}+${b}=${miseEnEvidence(a + b)}$ billes.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: 'billes.',
            })
          } else {
            texte += '$\\ldots$ billes.'
          }
          nbChamps = 1
          break

        case 17:
          a = randint(7, 12) * 2 + 1
          b = randint(3, 6) * 2 + 1
          c = new Decimal(a).div(2)
          A = pointAbstrait(0, 0, 'A', 'below')
          B = pointAbstrait(4, 0, 'B', 'below')
          C = pointAbstrait(4, 3, 'C', 'above')
          D = pointAbstrait(0, 3, 'D', 'above')
          code1 = codageAngleDroit(A, B, C)
          code2 = codageAngleDroit(B, C, D)
          code3 = codageAngleDroit(C, D, A)
          code4 = codageAngleDroit(D, A, B)
          xmin = -1.5
          ymin = -1
          xmax = 5
          ymax = 4
          objets = []
          objets.push(
            texteParPosition(
              `${stringNombre(c)} cm`,
              milieu(A, B).x,
              milieu(A, B).y - 0.5,
            ),
            texteParPosition(
              `${stringNombre(c)} cm`,
              milieu(D, C).x,
              milieu(D, C).y + 0.5,
            ),
            texteParPosition('?', milieu(B, C).x + 0.5, milieu(B, C).y),
            segment(A, B),
            segment(B, C),
            segment(C, D),
            segment(D, A),
            code1,
            code2,
            code3,
            code4,
          )
          reponse = b / 2
          texte = `Le périmètre de cette figure est $${a + b}\\text{ cm}$. <br>
            `
          texte += mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 30,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.8,
              center: !context.isHtml,
            },
            objets,
          )
          texteCorr = `Puisque le périmètre du rectangle est $${a + b}\\text{ cm}$, alors $\\text{?}=(${a + b}-2\\times ${texNombre(a / 2)})\\div 2=${miseEnEvidence(texNombre(b / 2))}\\text{ cm}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>$\\text{?}=$'
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: '$\\text{ cm}$',
            })
          } else {
            texte += ' $\\text{?}=\\ldots\\text{ cm}$'
          }

          nbChamps = 1
          break
        case 18:
          if (choice([true, false])) {
            a = randint(1, 13) * 50
            reponse = arrondi(a / 1000, 2)
            texte = `$${texNombre(a)}$ g $=$`

            texteCorr = `
    Comme $1$ kg $=${texNombre(1000)}$ g, alors $1$ g $=0,001$ kg.<br>
    Ainsi pour passer des $\\text{g}$ aux $\\text{kg}$, on divise par $${texNombre(1000)}$.<br>
      Comme : $${texNombre(a)}\\div ${texNombre(1000)} =${texNombre(a / 1000, 2)}$, alors $${texNombre(a)}$ g$=${miseEnEvidence(texNombre(reponse, 2))}$ kg. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, ' ', {
                texteApres: 'kg',
              })
            } else {
              texte += ' $\\ldots$ kg'
            }
          } else {
            a = randint(1, 5) / 10
            reponse = Math.round(a * 1000)
            texte = `$${texNombre(a, 1)}$ kg $=$ `
            texteCorr = ` Comme $1$ kg $=${texNombre(1000)}$ g, pour passer des $\\text{kg}$ aux $\\text{g}$, on multiplie par $${texNombre(1000)}$.<br>
            Comme : $${texNombre(a, 1)}\\times ${texNombre(1000)} =${texNombre(a * 1000)}$, alors $${texNombre(a, 1)}$ kg$=${miseEnEvidence(reponse)}$ g.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, ' ', {
                texteApres: 'g',
              })
            } else {
              texte += ' $\\ldots$ g'
            }
          }
          nbChamps = 1
          break

        case 19:
          chiffre = [
            ['deux', 2],
            ['trois', 3],
            ['cinq', 5],
          ]
          chiffre2 = [
            ['vingt', 20],
            ['trente', 30],
            ['cinquante', 50],
          ]
          a = randint(0, 2)
          choix = choice(['a', 'b', 'c', 'd'])
          if (choix === 'a') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-cent-${chiffre[a][0]}-mille `
            reponse =
              2 * 1000000 + chiffre[a][1] * 100000 + chiffre[a][1] * 1000
            texteCorr = `Deux-millions-${chiffre[a][0]}-cent-${chiffre[a][0]}-mille$=
            ${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 100000)} + ${texNombre(chiffre[a][1] * 1000)}
                        =${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 100000 + chiffre[a][1] * 1000))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'b') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-mille `
            reponse = 2 * 1000000 + chiffre[a][1] * 1000
            texteCorr = `Deux-millions-${chiffre[a][0]}-mille-${chiffre[a][0]} $=${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 1000)} + ${texNombre(chiffre[a][1])}=${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 1000))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'c') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre2[a][0]}-mille `
            reponse = 2 * 1000000 + chiffre2[a][1] * 1000
            texteCorr = `Deux-millions-${chiffre2[a][0]}-mille $=${texNombre(2 * 1000000)} + ${texNombre(chiffre2[a][1] * 1000)} =${miseEnEvidence(texNombre(2 * 1000000 + chiffre2[a][1] * 1000))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
            }
          }

          if (choix === 'd') {
            texte = `Écris en chiffres : <br>
              Deux-millions-${chiffre[a][0]}-mille `
            reponse = 2 * 1000000 + chiffre[a][1] * 1000
            texteCorr = `Deux-millions-${chiffre[a][0]}-mille-${chiffre2[a][0]} $=${texNombre(2 * 1000000)} + ${texNombre(chiffre[a][1] * 1000)} =${miseEnEvidence(texNombre(2 * 1000000 + chiffre[a][1] * 1000))}$. `

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
            }
          }
          nbChamps = 1
          break
        case 20:
          if (choice([true, false])) {
            a = grille(-2, -2, 9, 4, 'gray', 1, 1)

            b = randint(1, 6, 4)

            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(b, 0, 'B', 'below')
            C = pointAbstrait(0, 2, 'C', 'above')
            D = pointAbstrait(4, 2, 'D', 'above')
            s1 = segment(C, D)
            s1.epaisseur = 4
            s2 = segment(A, B)
            s2.epaisseur = 4
            xmin = -1
            ymin = -2
            xmax = 9
            ymax = 4
            objets = []
            objets.push(
              texteParPosition('1 unité', milieu(C, D).x, milieu(C, D).y + 0.5),
              a,
              s1,
              s2,
              labelPoint(A, B),
              // A, B
            )
            reponse = fraction(b, 4)
            texte = `Quelle est la longueur du segment $[AB]$ ? <br>
            `
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 20,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Une unité correspond à $4$ carreaux, le segment $[AB]$ mesure $${b}$ carreaux, soit $\\dfrac{${b}}{4}=${miseEnEvidence(texNombre(b / 4))}$ unité. `
          } else {
            a = grille(-2, -2, 10, 4, 'gray', 1, 1)

            b = randint(1, 9, 5)

            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(b, 0, 'B', 'below')
            C = pointAbstrait(0, 2, 'C', 'above')
            D = pointAbstrait(5, 2, 'D', 'above')
            s1 = segment(C, D)
            s1.epaisseur = 4
            s2 = segment(A, B)
            s2.epaisseur = 4
            xmin = -1
            ymin = -2
            xmax = 10
            ymax = 4
            objets = []
            objets.push(
              texteParPosition('1 unité', milieu(C, D).x, milieu(C, D).y + 0.5),
              a,
              s1,
              s2,
              labelPoint(A, B),
              // A, B
            )
            reponse = fraction(b, 5)
            texte = `Quelle est la longueur du segment $[AB]$ ? <br>
            `
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 25,
                mainlevee: false,
                amplitude: 0.5,
                scale: 1,
                center: !context.isHtml,
              },
              objets,
            )
            texteCorr = `Une unité correspond à $5$ carreaux, le segment $[AB]$ mesure $${b}$ carreaux, soit $\\dfrac{${b}}{5}=${miseEnEvidence(texNombre(b / 5))}$ unité. `
          }
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '', {
              texteApres: 'unité',
            })
          } else {
            texte += ' <br>$\\ldots$ unité'
          }

          nbChamps = 1

          break

        case 21:
          a = choice([2, 3, 5, 10, 100])
          texte = `Complète : <br>
            $${a}$ jours $=$`
          reponse = 24 * a
          texteCorr = `Dans une journée, il y a $24$ heures, donc dans $${a}$ jours, il y a $${a}\\times 24=${miseEnEvidence(texNombre(a * 24))}$ heures.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: 'h',
            })
          } else {
            texte += '$\\ldots$ h'
          }

          nbChamps = 1

          break

        case 22:
          a = randint(2, 10)
          texte = `Complète : <br>
          $${a}$ heures $=$`
          reponse = 60 * a
          texteCorr = `Dans une heure, il y a $60$ minutes, donc dans $${a}$ heures, il y a $${a}\\times 60=${miseEnEvidence(a * 60)}$ minutes.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: 'min',
            })
          } else {
            texte += '$\\ldots$ min'
          }

          nbChamps = 1

          break
        case 23:
          choix = choice(['a', 'b', 'c'])
          if (choix === 'a') {
            a = randint(2, 5) + randint(1, 9) / 10

            reponse = Math.round(a * 10)
            texte = `Combien faut-il de pièces de $10$ centimes pour avoir $${texNombre(a, 2, true)}$ € ? <br>
                    `
            texteCorr = `Il faut : $${texNombre(a)}\\div 0,1=${texNombre(a)}\\times 10=${miseEnEvidence(a * 10)}$ pièces.`
          }
          if (choix === 'b') {
            a = randint(2, 5) + (randint(1, 4) * 2) / 10

            reponse = Math.round(a * 5)
            texte = `Combien faut-il de pièces de $20$ centimes pour avoir $${texNombre(a, 2, true)}$ € ? <br>
                     `
            texteCorr = `Pour un euro, il faut $5$ pièces de $20$ centimes, donc pour $${Math.trunc(a)}$ €, il en faut $${Math.trunc(a)}\\times 5=${Math.trunc(a) * 5}$. <br>
           Pour $${texNombre(a - Math.trunc(a))}$ €, il en faut $${texNombre((a - Math.trunc(a)) * 5)}$, donc en tout $${miseEnEvidence(reponse)}$.`
          }
          if (choix === 'c') {
            a = randint(2, 9) + 5 / 10

            reponse = Math.round(a * 2)
            texte = `Combien faut-il de pièces de $50$ centimes pour avoir $${texNombre(a, 2, true)}$ € ? <br>
                   `
            texteCorr = `Pour un euro, il faut $2$ pièces de $50$ centimes,
          donc pour $${Math.trunc(a)}$,
          il en faut $${Math.trunc(a)}\\times 2=${Math.trunc(a) * 2}$. <br>
          Donc pour $${texNombre(a, 2, true)}$ €, il en faut $${miseEnEvidence(reponse)}$.`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          nbChamps = 1

          break

        case 24:
          if (choice([true, false])) {
            a = choice([1, 2, 3, 4, 6, 7, 8, 9]) // numérateur
            reponse = arrondi(a / 5, 1)
            texte =
              "Détermine l'abscisse du point A :<br> On donnera le résultat sous forme décimale.<br>" +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -1,
                  xmax: 14,
                  ymax: 1.5,
                  scale: 0.8,
                  center: !context.isHtml,
                },
                droiteGraduee({
                  Unite: 3,
                  Min: 0,
                  Max: 3.2,
                  x: 0,
                  y: 0,
                  thickSecDist: 1 / 5,
                  thickSec: true,
                  thickOffset: 0,
                  axeStyle: '|->',
                  pointListe: [[a / 5, 'A']],
                  pointCouleur: bleuMathalea,
                  pointStyle: 'x',
                  labelsPrincipaux: true,
                  step1: 1,
                  step2: 1,
                }),
              )
            texteCorr = `L'unité est divisée en $5$. Ainsi, l'abscisse du point A est $\\dfrac{${a}}{5}=${miseEnEvidence(texNombre(reponse))}$.`
          } else {
            a = choice([1, 3, 5, 7, 9]) // numérateur
            reponse = arrondi(a / 4, 2)
            texte =
              "Détermine l'abscisse du point A :<br> On donnera le résultat sous forme décimale.<br>" +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -1,
                  xmax: 14,
                  ymax: 1.5,
                  scale: 0.8,
                  center: !context.isHtml,
                },
                droiteGraduee({
                  Unite: 3,
                  Min: 0,
                  Max: 3.2,
                  x: 0,
                  y: 0,
                  thickSecDist: 1 / 4,
                  thickSec: true,
                  thickOffset: 0,
                  axeStyle: '|->',
                  pointListe: [[a / 4, 'A']],
                  pointCouleur: bleuMathalea,
                  pointStyle: 'x',
                  labelsPrincipaux: true,
                  step1: 1,
                  step2: 1,
                }),
              )
            texteCorr = `L'unité est divisée en $4$. Ainsi, l'abscisse du point A est $\\dfrac{${a}}{4}=${miseEnEvidence(texNombre(reponse))}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 25:
          a = randint(1, 9) / 10 + randint(1, 9) / 100
          b = randint(1, 9) / 10
          reponse = arrondi(a + b, 2)
          texte = `$${texNombre(a)}+${texNombre(b)}=$`
          texteCorr = ` $${texNombre(a)}+${texNombre(b)}=${miseEnEvidence(texNombre(a + b))}$`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ')
          } else {
            texte += '$\\ldots$ '
          }

          nbChamps = 1
          break

        case 26:
          taille1 = [
            ['fourmi', 2, 5, 'mm'],
            ['girafe', 40, 50, 'dm'],
            ['crevette', 5, 10, 'cm'],
            ['baleine', 15, 25, 'm'],
            ['souris', 40, 60, 'mm'],
          ]

          a = randint(0, 1)
          b = randint(taille1[a][1], taille1[a][2])
          propositions = shuffle([
            `$${b}\\text{ m}$`,
            `$${b}\\text{ dm}$`,
            `$${b}\\text{ cm}$`,
            `$${b}\\text{ mm}$`,
          ])

          texte = `Choisis parmi les propositions suivantes la taille d'une ${taille1[a][0]} (nombre et unité à recopier).<br>`
          texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}${sp(4)} ${propositions[3]}`
          texteCorr = `La taille d'une ${taille1[a][0]} est $${miseEnEvidence(b)}$ ${texteEnCouleurEtGras(taille1[a][3])}.`
          {
            const grandeur = new Grandeur(b, taille1[a][3])
            handleAnswers(this, index, {
              reponse: {
                value: grandeur,
                options: {
                  unite: true,
                  precisionUnite:
                    10 ** (grandeur.puissanceUnite * grandeur.puissancePrefixe),
                },
              },
            })
          }
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, ' unites[Longueur]')
          }
          nbChamps = 1
          break

        case 27:
          a = randint(1, 5) + randint(5, 9) / 10

          reponse = arrondi(2 * a, 1)
          texte = `Le double de $${texNombre(a, 1)}$ est `
          texteCorr = `Le double de $${texNombre(a, 1)}$ est $2\\times ${texNombre(a, 1)}=${miseEnEvidence(texNombre(reponse, 1))}$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: '.',
            })
          } else {
            texte += '$\\ldots$'
          }
          nbChamps = 1
          break

        case 28:
          a = randint(6, 9)
          b = randint(4, 9)
          c = a * b
          reponse = b
          if (choice([true, false])) {
            texte = `Compléter : <br>$${a}\\times \\ldots =${c}$`
            texteCorr = `$${a}\\times ${miseEnEvidence(b)} =${c}$`
          } else {
            texte = `Compléter :<br> $ \\ldots \\times ${a}=${c}$`
            texteCorr = `$ ${miseEnEvidence(b)} \\times ${a}=${c}$`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '<br>' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          break

        case 29:
          a = randint(2, 5) * 2
          b = randint(3, 6) * a

          reponse = Math.round(1.5 * b)
          texte = `$${a}$ cubes identiques empilés ont une hauteur de $${b}\\text{ cm}$.<br>
          $${texNombre(1.5 * a)}$ cubes empilés ont une hauteur de `
          texteCorr = `$${a}$ cubes identiques empilés ont une hauteur de $${b}\\text{ cm}$, donc $${texNombre(a / 2, 0)}$ cubes identiques empilés ont une hauteur de $${texNombre(b / 2, 0)}\\text{ cm}$, donc les
          $${texNombre(1.5 * a, 0)}$ cubes empilés ont une hauteur de $${texNombre(b)}+${texNombre(b / 2, 0)}=${miseEnEvidence(reponse)}\\text{ cm}$ `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, ' ', {
              texteApres: '$\\text{ cm}$',
            })
          } else {
            texte += '$\\ldots\\text{ cm}$'
          }
          nbChamps = 1
          break

        case 30:
          choix = choice(['a', 'b', 'c', 'd'])

          if (choix === 'a') {
            a = randint(2, 5)
            b = randint(5, 9)
            texte = `Un bus met $${a}$ heures pour emmener $${b}$ passagers.<br>
          Combien d'heures, ce même bus mettra-t-il pour emmener $${2 * b}$ passagers ?`
            texteCorr = `Il mettra autant de temps : $${miseEnEvidence(a)}$ heures.`
            reponse = a
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, '', { texteApres: 'h' })
            }
          }
          if (choix === 'b') {
            a = randint(2, 5)
            b = randint(2, 3) * 10
            c = randint(2, 3)
            texte = `Pour faire sécher $${a}$ tee-shirts sur une corde à linge dehors, il faut $${b}$ minutes.<br>
            Dans les mêmes conditions d'ensoleillement, combien de temps faudra-t-il pour faire sécher $${b * c}$ tee-shirts ?`
            texteCorr = `Il faudra autant de temps : $${miseEnEvidence(b)}$ minutes.`
            reponse = b
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, '', { texteApres: 'min' })
            }
          }
          if (choix === 'c') {
            a = randint(2, 5)
            b = randint(4, 6)
            c = randint(2, 3)
            texte = `$${a}$ L de lait coûtent $${b}$ €. Combien coûtent $${a * c}$ L de ce même lait ?`
            texteCorr = `$${a * c}$ L coûtent $${c}$ fois plus cher que $${a}$ L, donc $${miseEnEvidence(b * c)}$ €.`
            reponse = c * b
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, '', { texteApres: '€' })
            }
          }

          if (choix === 'd') {
            a = randint(2, 3)
            b = randint(9, 15) * 10
            c = randint(2, 4)
            texte = `Un bus met $${a}$ heures pour faire $${b}\\text{ km}$. <br>
              Combien d'heures mettra-t-il pour faire $${b * c}\\text{ km}$ ?`
            texteCorr = `Il mettra $${c}$ fois plus de temps, soit $${c}\\times ${a}=${miseEnEvidence(c * a)}$ heures. `
            reponse = c * a
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, index, '', { texteApres: 'h' })
            }
          }
          nbChamps = 1
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index += nbChamps
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
