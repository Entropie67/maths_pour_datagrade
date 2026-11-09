import { codageAngle } from '../../../lib/2d/angles'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { rotation } from '../../../lib/2d/transformations'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { texPrix } from '../../../lib/format/style'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionReduite,
} from '../../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { arrondi, range1 } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { prenomF } from '../../../lib/outils/Personne'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import { scratchblock } from '../../../modules/scratchblock'
import Exercice from '../../Exercice'

import Decimal from 'decimal.js'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import Hms from '../../../modules/Hms'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { representationFraction } from '../../../modules/representationsFractions'

export const titre = 'CAN 4e sujet 2023'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '03/04/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const uuid = 'cae4f'

export const refs = {
  'fr-fr': ['can4a-2023'],
  'fr-ch': [],
}

/**
 * Aléatoirisation du sujet 2023 de CAN 4e
 * @author Gilles Mora
 */

function compareNombres(a: number, b: number) {
  return a - b
}

export default class SujetCAN2023Quatrieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30
    this.sup = range1(30).join('-')
    this.sup2 = false
    this.besoinFormulaire2CaseACocher = ['Choix des questions']

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
  Il est composé de 30 questions réparties de la façon suivante :<br>
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
  En cochant « Choix des questions », saisir les numéros des questions à afficher, séparés par des tirets.
  En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`
  }

  nouvelleVersion() {
    this.nbQuestionsModifiable = !this.sup2
    this.besoinFormulaireTexte = this.sup2
      ? [
          'Choix des questions',
          'Numéros des questions (de 1 à 30) séparés par des tirets. Par exemple : 1-3-12-30',
        ]
      : false

    let typeQuestionsDisponibles: number[]
    if (this.sup2) {
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
    } else {
      const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 8 possibles.
      const nbQ2 = Math.min(this.nbQuestions - nbQ1, 20)
      const typeQuestionsDisponiblesNiv1 = shuffle([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
        .slice(-nbQ1)
        .sort(compareNombres) // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      const typeQuestionsDisponiblesNiv2 = shuffle([
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30,
      ])
        .slice(-nbQ2)
        .sort(compareNombres) // 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
      typeQuestionsDisponibles = typeQuestionsDisponiblesNiv1.concat(
        typeQuestionsDisponiblesNiv2,
      )
    }

    for (
      let i = 0,
        index = 0,
        nbChamps = 1,
        m,
        listeFraction,
        poly,
        poly1,
        poly2,
        poly3,
        v,
        maFraction,
        n,
        p,
        lettre,
        listeTriplet,
        triplet,
        choix1,
        num,
        den,
        params,
        origine,
        traceA,
        traceD,
        traceB,
        traceorigine,
        ang1,
        s3,
        K,
        I,
        J,
        texte = '',
        texteCorr = '',
        reponse: number | string | Decimal | FractionEtendue = 0,
        prenom1,
        L,
        E,
        choix,
        a,
        b,
        c,
        d,
        e,
        f,
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
          texte = `$${a} \\times ${b}$ `
          texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
          reponse = a * b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ' $=$' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 2:
          a = randint(1, 3)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])
          d = randint(1, 9, [a, b, c])
          e = randint(1, 9, [a, b, c, d])
          f = randint(1, 9, [a, b, c, d, e])
          n = new Decimal(a * 100 + b * 10 + c + d * 0.1 + e * 0.01 + f * 0.001)
          m = choice([
            'centaines',
            'dizaines',
            'dixièmes',
            'centièmes',
            'millièmes',
          ])
          texte = `Dans $${texNombre(n, 3)}$ le chiffre des ${m} est : `
          switch (m) {
            case 'centaines':
              reponse = a
              break
            case 'dizaines':
              reponse = b
              break
            case 'dixièmes':
              reponse = d
              break
            case 'centièmes':
              reponse = e
              break
            case 'millièmes':
              reponse = f
              break
          }

          texteCorr = `Le chiffre des ${m} est $${miseEnEvidence(String(reponse))}$.<br>
          Dans le tableau suivant : C : centaines<br>
          $D$ : dizaines et $U$ : unités. <br>
          $\\begin{array}{|c|c|c|c|c|c|c|}
              \\hline
              \\text{\\small{C}} & \\text{\\small{D}} & \\text{\\small{U}}& \\Large{\\textbf,}& \\text{\\small{Dixièmes}} & \\text{\\small{Centièmes}} & \\text{\\small{Millièmes}}${context.isHtml ? '\\\\' : '\\tabularnewline'}
              \\hline
              ${a}&${b}&${c} & \\Large{\\textbf,}& ${d}&${e}& ${f}${context.isHtml ? '\\\\' : '\\tabularnewline'}
              \\hline
              \\end{array}
              $
              `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
            handleAnswers(this, index, { reponse: { value: reponse } })
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 3:
          a = randint(14, 19)
          b = choice([20, 25, 35, 45, 55])

          d = choice([10, 30, 40, 50])
          reponse = 60 - b + d
          prenom1 = prenomF()
          texte = `${prenom1} part à $${a}$ h $${b}$ min et${context.isHtml ? '' : '<br>'} arrive à $${a + 1}$ h $${d}$ min.<br>
            Quelle est la durée de son trajet ?`
          texteCorr = `Pour atteindre $${a + 1}$ h, il faut $${60 - b}$ min, puis il faut ajouter encore $${d}$
             min pour atteindre $${a + 1}$ h $${d}$ min. Son trajet aura duré $${miseEnEvidence(formatMinute(60 - b + d))}$ min.`

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '', {
              texteApres: sp(5) + 'min',
            })
            handleAnswers(this, index, { reponse: { value: reponse } })
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '\\dots{} min'
          break

        case 4:
          if (choice([true, false])) {
            k = randint(12, 18)
            reponse = 3 * k
            texte = `Le triple de $${k}$ est :`
            texteCorr = `Le triple de $${k}$ est : $${k}\\times 3=${miseEnEvidence(reponse)}$.`

            reponse = 3 * k
          } else {
            k = randint(21, 29)
            reponse = 2 * k
            texte = `Le double de $${k}$ est :`
            texteCorr = `Le double de $${k}$ est : $${k}\\times 2=${miseEnEvidence(reponse)}$.`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 5:
          if (choice([true, false])) {
            ang1 = choice([
              20, 30, 40, 60, 70, 80, 100, 110, 120, 130, 140, 150, 160,
            ])
            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(6, 0, 'B', 'below')
            origine = pointAbstrait(3, 0, 'O', 'below')
            C = rotation(B, origine, ang1)
            s1 = segment(A, B)
            s2 = segment(origine, C)
            traceA = tracePoint(A)
            traceA.taille = context.isHtml ? 2 : 1
            traceB = tracePoint(B)
            traceB.taille = context.isHtml ? 2 : 1
            traceorigine = tracePoint(origine)
            traceorigine.taille = context.isHtml ? 2 : 1
            xmin = -1
            ymin = -0.8
            xmax = 6.5
            ymax = 2.5
            objets = []
            reponse = 180 - ang1
            objets.push(
              texteParPosition(
                '$A$',
                0,
                -0.55,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              texteParPosition(
                '$B$',
                6,
                -0.55,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              texteParPosition(
                '$O$',
                3,
                -0.55,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              s1,
              s2,
              traceA,
              traceorigine,
              traceB,
              codageAngle(C, origine, A, 0.6),
              codageAngle(B, origine, C, 0.5),
            )
            if (ang1 < 50) {
              objets.push(
                texteParPosition(
                  '?',
                  2.2,
                  0.6,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
                texteParPosition(
                  `${stringNombre(ang1)}°`,
                  3.8,
                  0.2,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
              )
            } else {
              objets.push(
                texteParPosition(
                  '?',
                  2.2,
                  0.2,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
                texteParPosition(
                  `${stringNombre(ang1)}°`,
                  3.8,
                  0.5,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
              )
            }
            reponse = 180 - ang1
            texte = '$A$, $O$ et $B$ sont alignés.<br>'
            texte += mathalea2d(
              {
                xmin,
                ymin,
                xmax,
                ymax,
                pixelsParCm: 40,
                mainlevee: false,
                amplitude: 0.5,
                scale: 0.6,
                center: !context.isHtml,
              },
              objets,
            )
            texte += context.isHtml ? '? $=$' : ''
            texteCorr = `Un angle plat a une mesure de $180^\\circ$.<br>
             Ainsi, ?$=180-${ang1}=${miseEnEvidence(180 - ang1)}^\\circ$.`
          } else {
            ang1 = choice([30, 40, 60, 70, 110, 120, 130, 140, 150, 160])
            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(2, 0, 'B', 'below')
            origine = pointAbstrait(0, 0, 'O', 'below')
            D = pointAbstrait(0, 2, 'D', 'right')
            C = rotation(B, origine, ang1)
            traceD = tracePoint(D)
            traceD.taille = context.isHtml ? 2 : 1
            traceB = tracePoint(B)
            traceB.taille = context.isHtml ? 2 : 1
            traceorigine = tracePoint(origine)
            traceorigine.taille = context.isHtml ? 2 : 1
            s1 = segment(origine, B)
            s2 = segment(origine, C)
            s3 = segment(origine, D)
            xmin = -2
            ymin = -0.8
            xmax = 4
            ymax = 2.5
            objets = []
            reponse = 180 - ang1
            objets.push(
              traceD,
              traceB,
              texteParPosition(
                '$D$',
                0.2,
                1.8,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              texteParPosition(
                '$B$',
                2,
                -0.55,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              texteParPosition(
                '$O$',
                0,
                -0.55,
                'milieu',
                'black',
                context.isHtml ? 1 : 0.7,
              ),
              s1,
              s2,
              s3,
              traceorigine,
              codageAngleDroit(B, origine, D, 'black', 0.3),
              codageAngle(B, origine, C, 0.8),
              codageAngle(D, origine, C, 0.4),
            )

            if (ang1 < 90) {
              objets.push(
                texteParPosition(
                  '?',
                  0.2,
                  0.8,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
                texteParPosition(
                  `${stringNombre(ang1)}°`,
                  1.2,
                  0.3,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.5,
                ),
              )

              reponse = 90 - ang1
              texte = "L'angle $\\widehat{BOD}$ est un angle droit.<br>"
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 0.8,
                  center: !context.isHtml,
                },
                objets,
              )
              texte += context.isHtml ? '? $=$' : ''
              texteCorr = `
               ?$=90-${ang1}=${miseEnEvidence(90 - ang1)}^\\circ$.`
            } else {
              objets.push(
                texteParPosition(
                  '?',
                  -0.15,
                  0.6,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
                texteParPosition(
                  `${stringNombre(ang1)}°`,
                  1,
                  0.8,
                  'milieu',
                  'black',
                  context.isHtml ? 1 : 0.7,
                ),
              )

              reponse = ang1 - 90
              texte = "L'angle $\\widehat{BOD}$ est un angle droit.<br>"
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 0.6,
                  center: !context.isHtml,
                },
                objets,
              )
              texte += context.isHtml ? '? $=$' : ''
              texteCorr = `?$=${ang1}-90=${miseEnEvidence(ang1 - 90)}^\\circ$. `
            }
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + '°'
          } else {
            texte += context.isHtml ? ' $\\ldots °$' : ''
          }

          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '? $=\\ldots ^\\circ$'
          break
        case 6:
          if (choice([true, false])) {
            a = new Decimal(randint(101, 199)).div(10)
            reponse = new Decimal(a).mul(100)
            texte = `$${texNombre(a, 1)}\\text{ m}^2$ $=$`

            texteCorr = `
        Comme $1\\text{ m}^2$ $=100\\text{ dm}^2$, alors $${texNombre(a, 1)}\\text{ m}^2$ $=${texNombre(a, 1)}\\times 100\\text{ dm}^2=${miseEnEvidence(texNombre(reponse, 0))}\\text{ dm}^2$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + 'dm$^2$'
            } else {
              texte += context.isHtml ? ' $\\ldots\\text{ dm}^2$' : ''
            }
            this.listeCanReponsesACompleter[this.listeCanEnonces.length] =
              '$\\ldots\\text{dm}^2$'
          } else {
            a = new Decimal(randint(101, 199)).div(10)
            reponse = new Decimal(a).div(100)
            texte = `$${texNombre(a, 1)}\\text{ dm}^2$ $=$`

            texteCorr = `
        Comme $1\\text{ dm}^2$ $=0,01\\text{ m}^2$, alors $${texNombre(a, 1)}\\text{ dm}^2$ $=${texNombre(a, 1)}\\times 0,01\\text{ m}^2=${miseEnEvidence(texNombre(reponse, 3))}\\text{ m}^2$. `
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + 'm$^2$'
            } else {
              texte += context.isHtml ? ' $\\ldots\\text{ m}^2$' : ''
              this.listeCanReponsesACompleter[this.listeCanEnonces.length] =
                '$\\ldots\text{m}^2$'
            }
          }
          this.listeCanEnonces.push(texte)
          break

        case 7:
          if (choice([true, false])) {
            a = randint(2, 6)
            k = randint(2, 4)
            b = k * a
            reponse = k * b
            texte = `$${a}$ classeurs identiques coûtent $${b}$ €. ${context.isHtml ? '' : '<br>'} Combien coûtent $${b}$ classeurs ? `

            texteCorr = `$${a}$ classeurs coûtent $${b}$ €.<br>
            $${k}\\times${a}=${k * a}$ classeurs coûtent $${k}\\times${b}=${miseEnEvidence(k * b)}$ €.`
          } else {
            a = randint(1, 4) * 2
            k = choice([new Decimal('1.5'), new Decimal('2.5')])
            b = k.mul(a).toNumber()
            reponse = new Decimal(b).mul(k)
            texte = `$${a}$ classeurs identiques coûtent $${b}$ €. ${context.isHtml ? '' : '<br>'} Combien coûtent $${b}$ classeurs ? `

            texteCorr = `$${a}$ classeurs coûtent $${b}$ €.<br>
              $${a / 2}$ ${a / 2 === 1 ? 'classeur coûte' : 'classeurs coûtent'} $${texPrix(b / 2)}$ €.<br>
              Ainsi, $${b}$ classeurs coûtent ${k.gt(2) ? `$2\\times ${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(reponse))}$ €.` : `$${b}+ ${texPrix(b / 2)} =${miseEnEvidence(texPrix(reponse))}$ €.`}`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + '€'
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '$\\ldots €$'
          break

        case 8:
          den = randint(5, 7)
          num = randint(1, 4)
          params = {
            xmin: -2.2,
            ymin: -2.2,
            xmax: 8,
            ymax: 3,
            pixelsParCm: 20,
            scale: 0.4,
            center: true,
          }
          f = new FractionEtendue(num, den)
          reponse = f
          texte = `Quelle fraction du disque représente ${context.isHtml ? '' : '<br>'}l'aire grisée ?<br>`
          texte += context.isHtml ? '' : '\\begin{center}'
          texte += context.isHtml
            ? mathalea2d(
                params,
                representationFraction(
                  f,
                  0,
                  0,
                  2,
                  randint(0, den - 1),
                  'gateau',
                  'gray',
                ),
              )
            : `\\Fraction[Reponse,Couleur=LightGray,Rayon=0.8cm]{${num}/${den}}`
          texte += context.isHtml ? '' : '\\end{center}'
          texteCorr = `L'aire grisée représente $${miseEnEvidence(f.texFraction)}$ de l'aire du disque.`

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          this.listeCanEnonces.push(texte)
          break

        case 9:
          a = new Decimal(randint(41, 61, [50, 60])).div(10)
          b = new Decimal(randint(111, 149, [120, 130, 140])).div(100)
          reponse = new Decimal(a).add(b)
          texte = `$${texNombre(a, 1)}+${texNombre(b, 2)}$ `
          texteCorr = `$${texNombre(a, 1)}+${texNombre(b, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ' $=$' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 10:
          a = randint(1, 20)
          b = randint(0, 9, 5)
          c = randint(1, 9, b)
          e = randint(1, 9)
          f = randint(1, 9)
          d = a + b * 0.1 + c * 0.01 + e * 0.001 + f * 0.0001
          if (choice([true, false])) {
            texte = `Quel est l'arrondi au dixième de $${texNombre(d, 4)}$ ?`
            if (c > 4) {
              texteCorr = `Pour arrondir au dixième, on regarde le chiffre des centièmes : $${c}$.<br>
             Comme $${c}\\geqslant 5$, alors l'arrondi au dixième de $${texNombre(d, 4)}$ est $${miseEnEvidence(texNombre(arrondi(d, 1)))}$.`
              reponse = arrondi(d, 1)
            } else {
              texteCorr = `Pour arrondir au dixième, on regarde le chiffre des centièmes : $${c}$.<br>
                Comme $${c}< 5$, alors l'arrondi au dixième de $${texNombre(d, 4)}$ est $${miseEnEvidence(texNombre(arrondi(d, 1)))}$.`
              reponse = arrondi(d, 1)
            }
          } else {
            texte = `Quel est l'arrondi au centième de $${texNombre(d, 4)}$ ?`
            if (e > 4) {
              texteCorr = `Pour arrondir au centième, on regarde le chiffre des millièmes : $${e}$.<br>
             Comme $${e}\\geqslant 5$, alors l'arrondi au centième de $${texNombre(d, 4)}$ est $${miseEnEvidence(texNombre(arrondi(d, 2)))}$.`
              reponse = arrondi(d, 2)
            } else {
              texteCorr = `Pour arrondir au centième, on regarde le chiffre des millièmes : $${e}$.<br>
                Comme $${e}< 5$, alors l'arrondi au centième de $${texNombre(d, 4)}$ est $${miseEnEvidence(texNombre(arrondi(d, 2)))}$.`
              reponse = arrondi(d, 2)
            }
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 11:
          listeFraction = [
            [1, 3],
            [2, 3],
            [1, 4],
            [3, 4],
            [1, 5],
            [2, 5],
            [3, 5],
            [4, 5],
          ]
          maFraction = choice(listeFraction)
          a = randint(1, 4)
          b = maFraction[0]
          c = maFraction[1]
          f = new FractionEtendue(b, c)
          d = new FractionEtendue(a * c + b, c).simplifie()
          e = new FractionEtendue(a * c - b, c).simplifie()

          if (choice([true, false])) {
            texte = `$${a}+${f.texFraction}$`
            texteCorr = `$${a}+${f.texFraction} = \\dfrac{${a} \\times ${c}}{${c}} + \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} + \\dfrac{${b}}{${c}} =${miseEnEvidence(d.texFraction)}$`
            reponse = d
          } else {
            texte = `$${a}-${f.texFraction}$`
            texteCorr = `$${a}-${f.texFraction} = \\dfrac{${a} \\times ${c}}{${c}} - \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} - \\dfrac{${b}}{${c}} =${miseEnEvidence(e.texFraction)}$`
            reponse = e
          }
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 12:
          if (choice([true, false])) {
            a = randint(2, 10)
            b = randint(2, 10)
            c = randint(2, 10, [a, b])
            reponse = a * c + b
            texte = `Que vaut $${a}x+${b}$ si $x=${c}$ ?`
            texteCorr = `Pour $x=${c}$, on a $${a}x+${b}=${a}\\times ${c}+${b}=${a * c}+${b}=${miseEnEvidence(a * c + b)}$.`
          } else {
            a = randint(4, 10)
            b = randint(2, 10)
            c = randint(3, 10, [a, b])
            reponse = a * c - b
            texte = `Que vaut $${a}x-${b}$ si $x=${c}$ ?`
            texteCorr = `Pour $x=${c}$, on a $${a}x-${b}=${a}\\times ${c}-${b}=${a * c}-${b}=${miseEnEvidence(a * c - b)}$.`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 13:
          a = new Decimal(randint(21, 69, [30, 40, 50, 60])).div(10)
          choix = choice(['a', 'b'])

          if (choix === 'a') {
            reponse = a
            texte = `$${texNombre(a, 1)}\\text{ dm}^3=$`
            texteCorr = `$1\\text{ dm}^3= 1$ L, donc $${texNombre(a, 1)}\\text{ dm}^3=${miseEnEvidence(texNombre(a, 1))}$ L.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + 'L'
            } else {
              texte += context.isHtml ? ' $\\ldots$ L' : ''
              this.listeCanReponsesACompleter[this.listeCanEnonces.length] =
                '$\\ldots\\Capa{}$'
            }
          } else {
            reponse = new Decimal(a).mul(1000)
            texte = `$${texNombre(a, 1)}\\text{ m}^3$ $=$`
            texteCorr = `$1\\text{ m}^3= ${texNombre(1000)}$ L, donc $${texNombre(a, 1)}\\text{ m}^3= ${miseEnEvidence(texNombre(new Decimal(a).mul(1000)))}$ L.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + 'L'
            } else {
              texte += context.isHtml ? ' $\\ldots$ L' : ''
              this.listeCanReponsesACompleter[this.listeCanEnonces.length] =
                '$\\ldots\\Capa{}$'
            }
          }

          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 14:
          a = randint(3, 10)
          b = a - randint(-1, 1, 0)
          choix1 = choice([true, false])
          reponse = choix1 ? `${a};${a + b}` : `${b};${a + b}`
          texte = `Une urne contient $${a}$ boules rouges et $${b}$ boules vertes.`
          texte += context.isHtml ? '<br>' : ''
          texte += 'On tire une boule au hasard.'
          texte += context.isHtml
            ? `<br>Complète : $\\text{\\textquotedblleft}$ On a $\\ldots$ chances sur $\\ldots$ de tirer une boule ${choix1 ? 'rouge' : 'verte'} $\\text{\\textquotedblright}$.`
            : ''
          texteCorr = `Dans l'urne, il y a $${a}$ boules rouges et $${b}$ boules vertes, soit un total de $${a + b}$ boules. <br>
            On a donc $${miseEnEvidence(choix1 ? `${a}` : `${b}`)}$ chances sur $${miseEnEvidence(a + b)}$ de tirer une boule ${choix1 ? 'rouge' : 'verte'}.`

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { texteAvecCasse: true } },
          })
          if (this.interactif) {
            texte +=
              '<br>Écrire les deux nombres séparés par un point-virgule.'
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            `On a $\\ldots$ chances <br> sur $\\ldots$ de tirer une boule ${choix1 ? 'rouge' : 'verte'}.`
          break

        case 15:
          if (choice([true, false])) {
            A = pointAbstrait(0, 0, 'A', 'above')
            B = pointAbstrait(1, -1, 'B', 'above')
            C = pointAbstrait(2, -0.5, 'C', 'above')
            D = pointAbstrait(2.3, 0.8, 'D', 'above')
            E = pointAbstrait(1, 4, 'E', 'above')
            s1 = segment(A, D)

            s1.pointilles = 2

            poly1 = polygone([A, B, E], 'black')
            poly2 = polygone([E, B, C], 'black')
            poly3 = polygone([C, D, E], 'black')

            reponse = 5
            texte = 'Le nombre de faces de ce solide est : <br>'

            texte += mathalea2d(
              {
                xmin: -1.5,
                ymin: -1.2,
                xmax: 7.1,
                ymax: 4.2,
                scale: 0.4,
              },
              poly1,
              s1,
              poly2,
              poly3,
            )
            texteCorr = `Ce solide a $${miseEnEvidence(5)}$ faces.`
          } else {
            A = pointAbstrait(0, 0, 'A', 'above')
            B = pointAbstrait(3, 0, 'B', 'above')
            C = pointAbstrait(1, 1, 'C', 'above')
            D = pointAbstrait(2, 4, 'D', 'above')

            s1 = segment(C, D)
            s2 = segment(A, C)
            s3 = segment(C, B)
            s1.pointilles = 2
            s2.pointilles = 2
            s3.pointilles = 2
            poly1 = polygone([A, B, D], 'black')

            reponse = 4
            texte = 'Le nombre de faces de ce solide est : <br>'

            texte += mathalea2d(
              {
                xmin: -1.5,
                ymin: -0.5,
                xmax: 7.1,
                ymax: 4.5,
                scale: 0.5,
              },
              poly1,
              s1,
              s2,
              s3,
            )
            texteCorr = `Ce solide a $${miseEnEvidence(4)}$ faces.`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }

          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 16:
          a = choice(obtenirListeFractionsIrreductibles())
          c = choice([2, 3])
          b = new FractionEtendue(1, a.d * c)
          if (choice([true, false])) {
            texte = `Calculer $${a.texFraction} - ${b.texFraction}$.`
            texteCorr = `$${a.texFraction} - ${b.texFraction}=
   \\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}- ${b.texFraction}
    =${a.reduire(c).texFraction} - ${b.texFraction}=\\dfrac{${a.n * c}-${b.n}}{${b.d}}=${miseEnEvidence(`\\dfrac{${a.n * c - b.n}}{${b.d}}`)}${simplificationDeFractionAvecEtapes(a.n * c - b.n, b.d)}$`
            reponse = a.differenceFraction(b).simplifie()
          } else {
            texte = `Calculer $${a.texFraction} + ${b.texFraction}$.`
            texteCorr = `$${a.texFraction} + ${b.texFraction}=
   \\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}+ ${b.texFraction}
    =${a.reduire(c).texFraction} + ${b.texFraction}=\\dfrac{${a.n * c}+${b.n}}{${b.d}}=${miseEnEvidence(`\\dfrac{${a.n * c + b.n}}{${b.d}}`)}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d)}$`
            reponse = a.sommeFraction(b).simplifie()
          }
          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 17:
          {
            a = randint(2, 10)
            b = randint(2, 10)
            reponse = a * b

            let prog = '\\begin{scratch}[print,fill,blocks,scale=0.8]\n'
            prog += '\\blockinit{quand \\greenflag est cliqué}\n'
            prog += "\\blockpen{stylo en position d'écriture} \n"
            prog += `\\blockrepeat{répéter \\ovalnum{${a}} fois}\n`
            prog += '{\n'
            prog += `\\blockmove{avancer de \\ovalnum{${b}} pas}\n`
            prog += '}\n'
            prog += '\\end{scratch}'

            texte = `De combien de pas avance le stylo ? <br>
          ${scratchblock(prog)}
          `
            texteCorr = `Le stylo avance de $${a}\\times ${b}=${miseEnEvidence(a * b)}$ pas.`

            handleAnswers(this, index, { reponse: { value: reponse } })
            // if (this.interactif) { texte += ajouteChampTexteMathLive(this, index, '') + ' pas' } else { texte += '$\\ldots$ pas' }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(this, index, '') + ' pas'
            }
            nbChamps = 1
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
              '$\\ldots$ pas.'
          }
          break

        case 18:
          if (choice([true, false])) {
            a = randint(3, 6)
            b = randint(4, 5)
            c = a * b
            b = b * 2
            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(0, 4, 'B', 'above')
            C = pointAbstrait(6, 0, 'C', 'below')
            poly = polygone([A, B, C], 'black')
            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            d = texteParPosition(
              `${stringNombre(c)} cm²`,
              1.5,
              1.5,
              'milieu',
              'black',
              context.isHtml ? 1 : 0.7,
            )
            e = texteParPosition(
              `${stringNombre(a)} cm`,
              -0.9,
              2,
              'milieu',
              'black',
              context.isHtml ? 1 : 0.7,
            )
            poly.epaisseur = 1
            reponse = b
            texte = 'On donne la figure suivante :<br>'
            texte += mathalea2d(
              {
                xmin: -1.8,
                ymin: -1.1,
                xmax: 7.1,
                ymax: 5.1,
                scale: 0.4,
              },
              poly,
              labelPoint(A, B, C),
              codageAngleDroit(B, A, C),
              d,
              e,
            )
            texteCorr = `L'aire du triangle est $\\dfrac{\\text{AB}\\times \\text{AC}}{2}=\\dfrac{${a}\\times \\text{AC}}{2}$.<br>
          On obtient ainsi, $\\dfrac{${a}\\times \\text{AC}}{2}=${c}$ soit $${a}\\times AC=2\\times ${c}$, soit $AC=\\dfrac{${c * 2}}{${a}}=${miseEnEvidence(reponse)}\\text{ cm}$.`
            texte += context.isHtml ? `${sp(4)}$AC= $` : ''
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '$\\text{ cm}$' },
              )
            } else {
              texte += context.isHtml ? ' $\\ldots\\text{ cm}$' : ''
              this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
                '$AC=\\ldots\\text{ cm}$.'
            }
          } else {
            listeTriplet = [
              [3, 4, 5],
              [6, 8, 10],
              [5, 12, 13],
            ]
            triplet = choice(listeTriplet)
            a = triplet[0]
            b = triplet[1]
            c = triplet[2]
            A = pointAbstrait(0, 0, 'A', 'below')
            B = pointAbstrait(4, 0.5, 'B', 'below')
            C = pointAbstrait(1, 2, 'C', 'above')
            poly = polygone([A, B, C], 'black')
            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            d = texteParPosition(
              `${stringNombre(a)} cm`,
              milieu(A, C).x - 0.5,
              milieu(A, C).y,
              'milieu',
              'black',
              context.isHtml ? 1 : 0.7,
            )
            e = texteParPosition(
              `${stringNombre(b)} cm`,
              milieu(B, C).x + 0.5,
              milieu(B, C).y + 0.2,
              'milieu',
              'black',
              context.isHtml ? 1 : 0.7,
            )
            f = texteParPosition(
              `${stringNombre(c)} cm`,
              milieu(B, A).x,
              milieu(B, A).y - 0.3,
              'milieu',
              'black',
              context.isHtml ? 1 : 0.7,
            )

            poly.epaisseur = 1
            reponse = arrondi((a * b) / 2, 0)
            texte = "L'aire du triangle $ABC$ est :<br>"

            texte += mathalea2d(
              Object.assign(
                { pixelsParCm: 40, scale: 0.8 },
                fixeBordures(labelPoint(A, B, C)),
              ),
              poly,
              labelPoint(A, B, C),
              codageAngleDroit(A, C, B),
              d,
              e,
              f,
            )
            texteCorr = `L'aire du triangle est $\\dfrac{\\text{AC}\\times \\text{CB}}{2}=\\dfrac{${a}\\times ${a}}{2}=${miseEnEvidence(reponse)}\\text{ cm}^2$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte +=
                ajouteChampTexteMathLive(this, index, '') + '$\\text{cm}^2$'
            }
            this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
              '$\\ldots\text{cm}^2$'
          }

          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 19:
          a = randint(2, 10)
          b = randint(2, 4)
          c = randint(2, 5)
          reponse = (a + b) * c

          if (context.isHtml) {
            texte = `Quel est le résultat de ce programme de calcul lorsque le nombre de départ est $${a}$ ?`
            texte += '<br> Nombre de départ <br>'
            texte += `${sp(8)}$\\downarrow$<br>`
            texte += '$\\begin{array}{|l|}\n'
            texte += '\\hline\n'
            texte += `\\\n \\text{Ajouter } ${b} \\\n`
            texte += `\\\\\n \\text{Multiplier par } ${c}\\\\\n `
            texte += '\\hline\n'
            texte += '\\end{array}\n$<br>'
            texte += `${sp(8)}$\\downarrow$<br>
         `
            texte += 'Résultat'
          } else {
            texte = `Quel est le résultat de ce programme de calcul lorsque le nombre de départ est $${a}$ ?<br>`
            texte += '\\medskip'
            texte += '\\fbox{'
            texte += '\\parbox{0.45\\linewidth}{'
            texte += '\\setlength{\\parskip}{.5cm}'
            texte += ' \\texttt{Nombre de départ}\\newline'
            texte += ` \\texttt{Ajouter $${b}$}\\newline`
            texte += ` \\texttt{Multiplier par $${c}$}\\newline`
            texte += '\\texttt{Résultat}'
            texte += '}'
            texte += '}'
            texte += '<br>'
          }

          texteCorr = `Le résultat est donné par : $(${a}+ ${b})\\times ${c}=${miseEnEvidence(reponse)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 20:
          a = choice(obtenirListeFractionsIrreductibles())
          c = a.d

          if (choice([true, false])) {
            b = a.n
            d = new FractionEtendue(b, c)
            texte = `L'opposé de $\\dfrac{${b}}{${c}}$ `
            texteCorr = `Deux nombres sont opposés lorsque leur somme est nulle.<br>
              Ainsi, l'opposé de $\\dfrac{${b}}{${c}}$ est $${miseEnEvidence('-')}${miseEnEvidence(d.texFraction)}$ car $\\dfrac{${b}}{${c}}+\\left(-${d.texFraction}\\right)=0$.`
            reponse = d.oppose()
          } else {
            b = a.n
            d = new FractionEtendue(b, c)
            e = new FractionEtendue(c, b)
            texte = `L'inverse de $\\dfrac{${b}}{${c}}$`
            texteCorr = `Deux nombres sont inverses l'un de l'autre lorsque leur produit vaut $1$.<br>
                Ainsi, l'inverse de $\\dfrac{${b}}{${c}}$ est $${miseEnEvidence(texFractionReduite(c, b))}$ car $\\dfrac{${b}}{${c}}\\times ${texFractionReduite(c, b)}=1$.`
            reponse = e
          }

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 21:
          if (choice([true, false])) {
            a = randint(2, 10)
            b = randint(2, 3)
            c = 2
          } else {
            a = randint(2, 3)
            b = randint(2, 3)
            c = 3
          }
          reponse = a * b ** c
          texte = `$${a}\\times ${b}^${c}$`

          texteCorr = `$${a}\\times ${b}^${c}=${a}\\times ${b ** c}=${miseEnEvidence(reponse)}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 22:
          a = randint(2, 6)
          b = randint(8, 15)
          d = choice([27, 30, 33, 36, 39, 42, 45, 48])

          c = d - a - b

          texte = `Quelle est la moyenne de ces $3$ nombres ?<br>

          $${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$`

          texteCorr = `La somme des $3$ nombres est : $${a}+${b}+${c} =${d}$.<br>

                La moyenne est donc $\\dfrac{${d}}{3}=${miseEnEvidence(texNombre(d / 3, 0))}$.`

          reponse = arrondi(d / 3, 0)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break
        case 23:
          lettre = choice(['a', 'b', 'x', 'y'])
          a = randint(2, 9)
          b = randint(2, 9)
          c = randint(2, 9)
          d = randint(2, 9)
          if (choice([true, false])) {
            texte = `Simplifie l'expression : <br>
          $${a}${lettre}+${b}+${c}${lettre}+${d}$`
            texteCorr = ` $${a}${lettre}+${b}+${c}${lettre}+${d}=${a}${lettre}+${c}${lettre}+${b}+${d}=${miseEnEvidence(`${a + c}${lettre}+${b + d}`)}$`
            reponse = `${rienSi1(a + c)}${lettre}${ecritureAlgebrique(b + d)}`
          } else {
            texte = `Simplifie l'expression : <br>
          $${a}${lettre}+${b}+${c}${lettre}$`
            texteCorr = ` $${a}${lettre}+${b}+${c}${lettre}=${a}${lettre}+${c}${lettre}+${b}=${miseEnEvidence(`${a + c}${lettre}+${b}`)}$`
            reponse = `${rienSi1(a + c)}${lettre}${ecritureAlgebrique(b)}`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 24:
          if (choice([true, false])) {
            a = choice([75, 33, 60, 45, 90])
            reponse = arrondi((2 * a) / 3, 0)
            texte = `Je bois le tiers d'une bouteille d'eau ${context.isHtml ? '' : '<br>'} de $${a}$ cL.<br>
              Quelle quantité d'eau reste-t-il ?`
            texteCorr = `J'ai bu $\\dfrac{${a}}{3}=${texNombre(a / 3, 0)}$ cL. Il reste donc
              $${a}$ cL $-${texNombre(a / 3, 0)}$ cL $=${miseEnEvidence(reponse)}$ cL.`
          } else {
            a = choice([75, 90, 100, 60, 50])
            reponse = arrondi((4 * a) / 5, 0)
            texte = `Je bois le cinquième d'une bouteille d'eau ${context.isHtml ? '' : '<br>'} de $${a}$ cL.<br>
              Quelle quantité d'eau reste-t-il ?`
            texteCorr = `J'ai bu $\\dfrac{${a}}{5}=${texNombre(a / 5, 0)}$ cL. Il reste donc
              $${a}$ cL $-${texNombre(a / 5, 0)}$ cL $=${miseEnEvidence(reponse)}$ cL.`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '') + 'cL'
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '$\\ldots\\Capa[cL]{}$'
          break

        case 25:
          a = randint(1, 9, 5)
          b = choice([1, 3, 5, 9, 11])
          if (choice([true, false])) {
            maFraction = new FractionEtendue(a, 5)
            reponse = arrondi(a / 5, 2)
            texte = `L'écriture décimale de $${maFraction.texFraction}$ est : `
            texteCorr = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(reponse))}$`
          } else {
            maFraction = new FractionEtendue(b, 4)
            reponse = arrondi(b / 4, 2)
            texte = `L'écriture décimale de $${maFraction.texFraction}$ est : `
            texteCorr = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(reponse))}$`
          }

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, index, '')
          } else {
            texte += context.isHtml ? '$\\ldots$' : ''
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 26:
          a = randint(1, 5)
          b = choice([0.25, 0.5, 0.75])
          d = b * 60
          if (!this.interactif) {
            texte = `$${texNombre(a + b)}$ h $=$ ${context.isHtml ? '$\\ldots\\ldots$ h $\\ldots\\ldots$ min' : ''}`
          } else {
            texte = `Convertir en heures/minutes : <br>$${texNombre(a + b)}$ h $=$`
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
            handleAnswers(this, i, {
              reponse: {
                value: new Hms({ hour: a, minute: d }).toString(),
                options: { HMS: true },
              },
            })
          }
          texteCorr = `$${texNombre(a + b)}$ h $ = ${a}$ h $ +$ $ ${texNombre(b)} \\times 60$ min $ = ${miseEnEvidence(`${a}\\text{ h }${d}\\text{ min}`)}$`
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '$\\ldots\\text{ h}\\ldots \\text{ min}$'
          break

        case 27:
          a = randint(6, 19, [10, 20, 30])
          b = choice([15, 25]) / 10

          texte = `$${a}\\times ${texNombre(b, 1)}$ `
          texteCorr = `$${a}\\times ${texNombre(b, 1)}=${miseEnEvidence(texNombre(a * b, 1))}$`
          reponse = arrondi(a * b, 1)
          texteCorr += `
             <br> Mentalement : <br>
             $${a}\\times ${texNombre(b, 1)}=${a}\\times ${Math.floor(b)}+\\underbrace{${a}\\times 0,5}_{\\text{La moitié de }${a}}
             =${a * Math.floor(b)}+${texNombre(a / 2, 1)}=${texNombre(reponse, 1)}$ `
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '$=$' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 28:
          a = randint(1, 9) * choice([10, 100])
          p = randint(1, 2) * 10
          reponse = (a * p) / 100
          texte = `$${p}${sp(1)}\\%$ de $${a}$ `
          texteCorr = `$${p}${sp(1)}\\%$ de $${a} = ${miseEnEvidence(reponse)}$`
          if (a === 10) {
            texteCorr += `<br>$10${sp(1)}\\%$ de $${a} = 0,1 \\times ${a}=${texNombre(reponse)}$.`
            /* this.correction += `<br> Mentalement : <br>
        Prendre $10${sp(1)}\\%$ d'une quantité revient à la diviser par $10$.<br>
        Ainsi, $10${sp(1)}\\%$ de $${a} = \\dfrac{${a}}{10}=${texNombre(this.reponse)}$.` */
          } else {
            texteCorr += `<br> Mentalement : <br>
             Prendre $${p}${sp(1)}\\%$ de $${a}$ revient à prendre $${p / 10}\\times 10${sp(1)}\\%$ de $${a}$.<br>
             Comme $10${sp(1)}\\%$ de $${a}$ vaut $${a / 10}$ (pour prendre $10${sp(1)}\\%$ d'une quantité, on la divise par $10$), alors
             $${p}${sp(1)}\\%$ de $${a}=${p / 10}\\times ${a / 10}=${reponse}$.
            `
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += '$=$' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
          break

        case 29:
          a = randint(6, 7)
          b = randint(2, 3)
          c = randint(4, 5)
          v = a * b * c
          A = pointAbstrait(0, 3, 'A', 'above')
          B = pointAbstrait(1, 4, 'B', 'above')
          C = pointAbstrait(6, 4, 'C', 'above')
          D = pointAbstrait(5, 3, 'D', 'above')
          I = pointAbstrait(0, 0, 'I', 'below')
          J = pointAbstrait(1, 1, 'J', 'above right')
          K = pointAbstrait(6, 1, 'K', 'above right')
          L = pointAbstrait(5, 0, 'L', 'below')
          s1 = segment(I, J)
          s2 = segment(J, K)
          s3 = segment(J, B)
          s1.pointilles = 2
          s2.pointilles = 2
          s3.pointilles = 2
          poly1 = polygone([A, B, C, D], 'black')
          poly2 = polygone([A, D, L, I], 'black')
          poly3 = polygone([L, K, C, D], 'black')
          d = texteParPosition(
            `${stringNombre(a)} cm`,
            milieu(I, L).x,
            milieu(I, L).y - 0.5,
            'milieu',
            'black',
            context.isHtml ? 1 : 0.7,
          )
          e = texteParPosition(
            `${stringNombre(b)} cm`,
            milieu(K, L).x + 0.8,
            milieu(K, L).y,
            'milieu',
            'black',
            context.isHtml ? 1 : 0.7,
          )
          f = texteParPosition(
            '?',
            milieu(A, I).x - 0.5,
            milieu(A, I).y,
            'milieu',
            'black',
            context.isHtml ? 1 : 0.7,
          )
          reponse = c
          texte = `Ce pavé droit a un volume de $${v}\\text{ cm}^3$.<br>
            Quelle est sa hauteur ? <br>`
          texte += mathalea2d(
            {
              xmin: -1.5,
              ymin: -1,
              xmax: 7.1,
              ymax: 5,
              scale: 0.5,
            },
            labelPoint(A, B, C, D, I, J, K, L),
            d,
            e,
            f,
            poly1,
            poly2,
            poly3,
            s1,
            s2,
            s3,
          )
          texteCorr = `Le volume d'un pavé droit est donné par le produit longueur $\\times$ largeur $\\times$ hauteur.<br>
            Ainsi, $AI=\\dfrac{${v}}{${a}\\times ${b}}=${miseEnEvidence(c)}$.`
          texte += context.isHtml ? `${sp(4)}$AI= $` : ''
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              { texteApres: '$\\text{ cm}$' },
            )
          } else {
            texte += context.isHtml ? ' $\\ldots\\text{ cm}$' : ''
          }

          nbChamps = 1
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter[this.listeCanEnonces.length - 1] =
            '$AI= \\ldots\\Lg[cm]{}$'
          break

        case 30:
          a = randint(1, 9)
          b = randint(1, 9, a)
          c = randint(1, 9, [a, b])

          m = choice([1, 2, 3, 4, 5]) //, 2, 3, 4
          if (m === 1) {
            d = a + b * 0.1 + c * 0.01
            reponse = arrondi(100 * d, 0)
            texte = ` $40 \\times ${texNombre(d)}\\times 2,5$`
            texteCorr = `$40 \\times ${texNombre(d)}\\times 2,5 = \\underbrace{40 \\times 2,5}_{=100}\\times ${texNombre(d)} =100 \\times ${texNombre(d)} = ${miseEnEvidence(texNombre(100 * d, 0))}$`
          }
          if (m === 2) {
            d = a + b * 0.1
            reponse = arrondi(100 * d, 1)
            texte = ` $40 \\times ${texNombre(d)}\\times 2,5$`
            texteCorr = `$40 \\times ${texNombre(d)}\\times 2,5 = \\underbrace{40 \\times 2,5}_{=100}\\times ${texNombre(d)} =100 \\times ${texNombre(d)} = ${miseEnEvidence(texNombre(100 * d, 0))}$`
          }
          if (m === 3) {
            d = a + b * 0.1 + c * 0.01
            reponse = arrondi(10 * d, 1)
            texte = ` $40 \\times ${texNombre(d)}\\times 0,25$`
            texteCorr = `$40 \\times ${texNombre(d)}\\times 0,25 = \\underbrace{40 \\times 0,25}_{=10}\\times ${texNombre(d)} =10 \\times ${texNombre(d)} = ${miseEnEvidence(texNombre(10 * d, 1))}$`
          }
          if (m === 4) {
            d = a + b * 0.1
            reponse = arrondi(10 * d, 0)
            texte = ` $40 \\times ${texNombre(d)}\\times 0,25$`
            texteCorr = `$40 \\times ${texNombre(d)}\\times 0,25 = \\underbrace{40 \\times 0,25}_{=10}\\times ${texNombre(d)} =10 \\times ${texNombre(d)} = ${miseEnEvidence(texNombre(10 * d, 0))}$`
          }

          if (m === 5) {
            d = a + b * 0.1
            reponse = arrondi(d, 1)
            texte = ` $4 \\times ${texNombre(d)}\\times 0,25$`
            texteCorr = `$4 \\times ${texNombre(d)}\\times 0,25 = \\underbrace{4 \\times 0,25}_{=1}\\times ${texNombre(d)} =1 \\times ${texNombre(d, 1)} = ${miseEnEvidence(texNombre(d, 1))}$`
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ' $=$' + ajouteChampTexteMathLive(this, index, '')
          }
          nbChamps = 1
          this.listeCanEnonces.push(texte)
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
