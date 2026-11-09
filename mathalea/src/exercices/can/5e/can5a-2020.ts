import Decimal from 'decimal.js'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegment } from '../../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { traceBarre } from '../../../lib/2d/diagrammes'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../../lib/2d/polygones'
import { pave } from '../../../lib/2d/projections3d'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { texPrix } from '../../../lib/format/style'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { prenomM } from '../../../lib/outils/Personne'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { fraction } from '../../../modules/fractions'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import {
  besoinFormulaireChoixQuestionsCan,
  numerosQuestionsCan,
} from '../../../lib/outils/choixQuestionsCan'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { grille } from '../../../lib/2d/Grille'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { arrondi } from '../../../lib/outils/nombres'

export const titre = 'CAN 5e sujet 2020'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '04/09/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '28/11/2025' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */

function compareNombres(a: number, b: number) {
  return a - b
}

export const uuid = '7292b'

export const refs = {
  'fr-fr': ['can5a-2020'],
  'fr-ch': [],
}
export default class SujetCAN20205ieme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 30
    this.besoinFormulaireTexte = besoinFormulaireChoixQuestionsCan
    this.sup = ''

    this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres.<br>
Il est composé de 30 questions réparties de la façon suivante :<br>
Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.
En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.<br>
  Le paramètre « Choix des questions » permet de ne retenir que certaines questions du sujet officiel, dans l’ordre souhaité (par exemple 1-5-12).`
  }

  nouvelleVersion() {
    const nbQ1 = Math.min(Math.round((this.nbQuestions * 10) / 30), 10) // Choisir d'un nb de questions de niveau 1 parmi les 7 possibles.
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
    const typeQuestionsDisponibles = numerosQuestionsCan(
      this,
      typeQuestionsDisponiblesNiv1.concat(typeQuestionsDisponiblesNiv2),
    )

    for (
      let i = 0,
        index = 0,
        nbChamps,
        texte,
        texteCorr,
        reponse,
        partieDec1,
        partieDec2,
        somme,
        u,
        abs0,
        abs1,
        pav,
        pol,
        pol2,
        r,
        l,
        segmentED,
        segmentEA,
        prenom,
        x1,
        a1,
        poly,
        f,
        propositions,
        prix,
        choix,
        code1,
        code2,
        a,
        b,
        c,
        d,
        e,
        h,
        k,
        A,
        B,
        C,
        D,
        E,
        F,
        G,
        H,
        I,
        J,
        K,
        L,
        xmin,
        xmax,
        ymin,
        ymax,
        objets,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = 'cas non traité'
      texteCorr = 'cas non traité'
      nbChamps = 0
      switch (typeQuestionsDisponibles[i]) {
        case 1:
          a = randint(5, 9)
          b = randint(3, 9)
          c = a * b
          if (choice([true, false])) {
            texte = `Complète : <br>$${a}\\times \\ldots =${c}$`
            texteCorr = `$${a}\\times ${miseEnEvidence(b)} =${c}$`
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(`$${a}\\times \\ldots =${c}$`)
          } else {
            texte = `Complète :<br> $ \\ldots \\times ${a}=${c}$`
            texteCorr = `$ ${miseEnEvidence(b)} \\times ${a}=${c}$`
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(`$ \\ldots \\times ${a}=${c}$`)
          }
          reponse = b
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
          }

          nbChamps = 1

          break

        case 2:
          u = randint(21, 99)
          a = randint(1, 9)
          c = randint(1, 9)
          partieDec1 = new Decimal(a).div(10)
          partieDec2 = new Decimal(c).div(1000)

          reponse = new Decimal(u).add(partieDec1).add(partieDec2)
          if (choice([true, false])) {
            texte = `Écris sous forme décimale : $${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}$. `
            texteCorr = `$${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000)}}=${u}+${texNombre(a / 10, 1)}+${texNombre(c / 1000, 3)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$`
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push(``)
          } else {
            texte = `Écris sous forme décimale : $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}$. `
            texteCorr = `$${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{10}=${u}+${texNombre(c / 1000, 3)}+${texNombre(a / 10, 1)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$
             `
            this.listeCanEnonces.push(texte)
            this.listeCanReponsesACompleter.push(``)
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
          }
          nbChamps = 1
          break

        case 3:
          a = new Decimal(randint(12, 49, [20, 30, 40])).div(100)
          b = new Decimal(randint(31, 69, [40, 50, 60])).div(10)
          reponse = new Decimal(a).add(b)
          texte = `$${texNombre(a, 2)}+${texNombre(b, 2)}=$`
          texteCorr = ` $${texNombre(a, 2)}+${texNombre(b, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$`
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `$${texNombre(a, 2)}+${texNombre(b, 2)}=\\ldots$`,
          )
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$ '
          }

          nbChamps = 1
          break

        case 4:
          a = choice([10, 100])
          b = new Decimal(randint(31, 69, [40, 50, 60])).div(10)
          reponse = new Decimal(a).sub(b)
          texte = `$${texNombre(a, 0)}-${texNombre(b, 2)}=$`
          texteCorr = ` $${texNombre(a, 2)}-${texNombre(b, 2)}=${miseEnEvidence(texNombre(reponse, 2))}$`
          handleAnswers(this, index, { reponse: { value: reponse } })
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `$${texNombre(a, 0)}-${texNombre(b, 2)}=\\ldots$`,
          )
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$ '
          }

          nbChamps = 1
          break

        case 5:
          a = choice([1, 10])
          b = randint(2, 199)
          texte = `$${a}$ $\\%$ de $${b} =$
         `

          texteCorr = `$${a}$ $\\%$ de $${b} =${texNombre(a / 100, 2)}\\times ${b}=${miseEnEvidence(texNombre((b * a) / 100, 2))}$
          `
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `$${a}$ $\\%$ de $${b} =\\ldots$`,
          )
          reponse = new Decimal(a).div(100).mul(b)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 6:
          a = randint(3, 9)
          b = randint(5, 9)
          c = a * b
          texte = `$${c} \\div ${a} = $
          `
          reponse = b

          texteCorr = `$${c} \\div ${a} = ${miseEnEvidence(b)}$
           `
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(`$${c} \\div ${a}  =\\ldots$`)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 7:
          a = randint(14, 19)
          b = choice([25, 30, 40, 50])
          c = randint(1, 3)
          d = choice([40, 50])
          prenom = prenomM()
          texte = `${prenom} part à  $${a}$ h $${b}$ min et son trajet dure  $${c}$ h $${d}$ min.<br>
          À quelle heure arrive-t-il ?`
          texteCorr = `Pour atteindre $${a + 1}$ h, il faut $${60 - b}$ min, puis il faut ajouter encore $${c}$  ${c > 1 ? ' heures' : ' heure '}
          et $${d - 60 + b}$ min, soit une arrivée à  $${miseEnEvidence(`${a + c + 1}\\text{ h }${formatMinute(b + d - 60)}\\text{ min}`)}$.`
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push(``)
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierHms)
          }

          handleAnswers(this, index, {
            reponse: {
              value: new Hms({
                hour: a + c + 1,
                minute: b + d - 60,
              }).toString(),
              options: { HMS: true },
            },
          })

          nbChamps = 1
          break

        case 8:
          a = randint(11, 25, 20)
          b = randint(16, 39, [20, 30])

          if (choice([true, false])) {
            reponse = a
            texte = `La moitié de $${2 * a}$ est égale à :`
            texteCorr = `La moitié de $${2 * a}$ est égale à $${2 * a}\\div 2=${miseEnEvidence(a)}$.`
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `La moitié de $${2 * a}$ est égale à : $\\ldots$`,
            )
          } else {
            reponse = 2 * b
            texte = `Le double de $${b}$ est égal à :`
            texteCorr = `Le double de $${b}$ est égal à $2\\times ${b}=${miseEnEvidence(2 * b)}$.`
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `Le double de $${b}$ est égal à : $\\ldots$`,
            )
          }
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 9:
          a = randint(1, 4)
          prix = choice([7, 9, 11, 13])
          b = new Decimal(prix).div(2)
          reponse = new Decimal(prix).add(b)
          texte = `$${2 * a}$ gâteaux coûtent  $${texPrix(prix)}$ €. <br>
            Combien coûtent $${3 * a}$ de ces mêmes gâteaux ?
             `

          texteCorr = `$${2 * a}$ gâteaux coûtent  $${texPrix(prix)}$ €, donc $${a}$ ${a > 1 ? 'gâteaux coûtent' : 'gâteau coûte'} $${texPrix(prix)} \\text{ €} \\div 2=${texPrix(prix / 2)}$ €.<br>
          Ainsi, $${3 * a}$ gâteaux coûtent $${texPrix(prix)}\\text{ €}+${texPrix(prix / 2)}\\text{ €}=${miseEnEvidence(texPrix(reponse))}$ €.`
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push(`$\\ldots$ €`)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: '€' },
              )
          }
          nbChamps = 1
          break

        case 10:
          a = randint(3, 9)
          b = randint(1, a - 1)
          c = randint(3, 9)
          d = c * a + b
          texte = `Le reste de la division euclidienne de $${d}$ par $${a}$ est : `
          texteCorr = `$${d}=${a} \\times ${c} + ${b}$ avec $${b}<${a}$ donc le reste de la division de $${d}$ par $${a}$ est $${miseEnEvidence(b)}$.`
          reponse = b
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `Le reste de la division euclidienne de $${d}$ par $${a}$ est : $\\ldots$`,
          )
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 11:
          a = randint(1, 2)
          k = randint(2, 5)
          abs0 = randint(26, 55, [30, 40, 50])
          abs1 = new Decimal(abs0).add(3 * k)
          x1 = new Decimal(abs0).add(a * k)
          d = droiteGraduee({
            Unite: 2,
            Min: 0,
            Max: 4.1,
            axeStyle: '->',
            pointTaille: 5,
            pointStyle: 'x',
            labelsPrincipaux: false,
            thickSec: false,
            labelListe: [
              [0, `${stringNombre(abs0)}`],
              [3, `${stringNombre(abs1)}`],
            ],
            pointListe: [[a, 'A']],
          })
          reponse = x1
          texte =
            "Détermine l'abscisse du point $A$. <br>" +
            mathalea2d(
              {
                xmin: -2,
                ymin: -1,
                xmax: 15,
                ymax: 1.5,
                pixelsParCm: 30,
                scale: 0.8,
              },
              d,
            )
          texteCorr = `Entre $${texNombre(abs0, 0)}$ et $${texNombre(abs1, 0)}$, il y a $3$ intervalles.<br>
       Une graduation correspond donc à $\\dfrac{${texNombre(abs1, 0)}-${texNombre(abs0, 0)}}{3}=${k}$.<br>
        Ainsi, l'abscisse du point $A$ est $${miseEnEvidence(texNombre(reponse, 0))}$.`
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push(``)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 12:
          a = randint(1, 9)
          b = randint(3, 9)
          c = randint(3, 9)
          reponse = a + b * c
          texte = `$${a}+${b}\\times ${c}=$`
          texteCorr = `La multiplication est prioritaire : $${a}+${b}\\times ${c}=${a}+${b * c}=${miseEnEvidence(reponse)}$.
                                   `
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `$${a}+${b}\\times ${c}=\\ldots$`,
          )
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1

          break
        case 13:
          a = new Decimal(randint(11, 39, [20, 30])).div(10)
          b = randint(2, 5)
          choix = choice(['a', 'b']) //
          if (choix === 'a') {
            reponse = new Decimal(a).mul(4)
            texte = `Complète la suite logique :<br>
            $${texNombre(a, 1)}$ $${sp(8)}${texNombre(new Decimal(a).mul(2), 1)}$${sp(8)}?$${sp(8)}${texNombre(new Decimal(a).mul(8), 1)}$
           `
            texte += '<br>? $=$'

            texteCorr = `L'hypothèse que l'on peut faire est que l'on passe d'un terme au suivant en multipliant par $2$. <br>
            Ainsi, ? $=2\\times ${texNombre(new Decimal(a).mul(2), 1)}= ${miseEnEvidence(texNombre(reponse, 1))}$.<br>
            On vérifie avec la dernière valeur : $2\\times ${texNombre(reponse, 1)}=${texNombre(new Decimal(a).mul(8), 1)}$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            this.listeCanEnonces.push('Complète la suite logique.')
            this.listeCanReponsesACompleter.push(
              `$${texNombre(a, 1)}$ $${sp(8)}${texNombre(new Decimal(a).mul(2), 1)}$${sp(8)}$\\ldots$$${sp(8)}${texNombre(new Decimal(a).mul(8), 1)}$`,
            )
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            } else {
              texte += ' $\\ldots$'
            }
          } else if (choix === 'b') {
            reponse = new Decimal(a).add(2 * b)
            texte = `Complète la suite logique :<br>
            $${texNombre(a, 1)}$ $${sp(8)}${texNombre(new Decimal(a).add(b), 1)}$${sp(8)}?$${sp(8)}${texNombre(new Decimal(a).add(3 * b), 1)}$
           `
            texte += '<br>? $=$'
            texteCorr = `L'hypothèse que l'on peut faire est que l'on passe d'un terme au suivant en ajoutant  $${b}$. <br>
            Ainsi, ? $= ${texNombre(new Decimal(a).add(b), 1)}+${b}= ${miseEnEvidence(texNombre(reponse, 1))}$.<br>
            On vérifie avec la dernière valeur : $${texNombre(reponse, 1)}+${b}=${texNombre(new Decimal(a).add(3 * b), 1)}$.`
            this.listeCanEnonces.push('Complète la suite logique.')
            this.listeCanReponsesACompleter.push(
              `$${texNombre(a, 1)}$ $${sp(8)}${texNombre(new Decimal(a).add(b), 1)}$ ${sp(8)}$\\ldots$${sp(8)}$${texNombre(new Decimal(a).add(3 * b), 1)}$`,
            )

            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
              )
            } else {
              texte += ' $\\ldots$'
            }
          }

          nbChamps = 1
          break
        case 14:
          b = randint(2, 4)
          a = randint(b + 1, 6)
          c = randint(1, a - 1)
          d = randint(1, b)
          e = randint(0, c - 1)
          f = randint(d, b)
          A = polygone(
            [
              pointAbstrait(0, 0),
              pointAbstrait(c, 0),
              pointAbstrait(c, d),
              pointAbstrait(e, d),
              pointAbstrait(e, f),
              pointAbstrait(0, f),
            ],
            'black',
          )
          A.couleurDeRemplissage = colorToLatexOrHTML('gray')

          C = grille(0, 0, a, b, 'black', 1, 1)
          D = pointAbstrait(1 + a, 4 - b)

          texte =
            'Quelle fraction de la surface totale représente la surface grisée ?<br>'
          texte += mathalea2d(
            { xmin: -1, ymin: -0.1, xmax: 12.1, ymax: b + 1, scale: 0.4 },
            A,
            C,
          )
          texteCorr = `Il y a $${c * d + e * f - e * d}$ ${c * d + e * f - e * d > 1 ? 'carrés' : 'carré'} gris sur un total de $${a * b}$ carrés, la surface grisée représente donc $${miseEnEvidence(`\\dfrac{${c * d + e * f - e * d}}{${a * b}}`)}$ de la surface totale.`
          reponse = new FractionEtendue(c * d + e * f - e * d, a * b)
          this.listeCanEnonces.push(
            mathalea2d(
              { xmin: -1, ymin: -0.1, xmax: 12.1, ymax: b + 1, scale: 0.4 },
              A,
              C,
            ),
          )
          this.listeCanReponsesACompleter.push(
            'Quelle fraction de la surface totale représente la surface grisée ?',
          )
          handleAnswers(this, index, {
            reponse: {
              value: reponse.texFraction,
              options: { fractionEgale: true },
            },
          })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierDeBaseAvecFraction,
            )
          }
          nbChamps = 1
          break

        case 15:
          partieDec1 = new Decimal(randint(1, 9)).div(10)
          a = new Decimal(2).add(partieDec1)
          b = new Decimal(1).add(partieDec1)
          c = new Decimal(b).mul(2)

          A = pointAbstrait(0, 0)
          B = pointAbstrait(1.7, 0)
          C = pointAbstrait(1.7, 0.5)
          D = pointAbstrait(1.2, 0.5)
          E = pointAbstrait(1.2, 1)
          F = pointAbstrait(0, 1)
          G = pointAbstrait(2.7, 0)
          H = pointAbstrait(6.1, 0)
          I = pointAbstrait(6.1, 1)
          J = pointAbstrait(5.1, 1)
          K = pointAbstrait(5.1, 2)
          L = pointAbstrait(2.7, 2)
          xmin = -1
          ymin = -0.5
          xmax = 6.5
          ymax = 2.5
          pol = polygoneAvecNom(A, B, C, D, E, F)
          pol2 = polygoneAvecNom(G, H, I, J, K, L)

          // segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1)
          objets = []
          objets.push(pol[0]) //, pol[1]
          objets.push(pol2[0])

          objets.push(
            texteParPosition(
              `${stringNombre(a)} cm`,
              milieu(A, B).x,
              milieu(A, B).y - 0.2,
            ),
            texteParPosition(
              `${stringNombre(b)} cm`,
              milieu(A, F).x - 0.5,
              milieu(A, F).y,
            ),
            texteParPosition(
              `${stringNombre(c)} cm`,
              milieu(G, L).x - 0.6,
              milieu(G, L).y,
            ),
            texteParPosition('?', milieu(G, H).x, milieu(G, H).y - 0.4),
            texteParPosition('A', 0.7, 0.3, 0, 'black', 1, 'milieu', true),
            texteParPosition('B', 4, 1, 0, 'black', 1, 'milieu', true),
          )
          reponse = new Decimal(a).mul(2)
          texte = 'La figure $B$ est un agrandissement de la figure $A$. <br>'

          texte += mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 40,
              mainlevee: false,
              amplitude: 0.5,
              scale: 1.2,
              center: !context.isHtml,
            },
            objets,
          )
          texte += '? $=$'
          this.listeCanEnonces.push(
            `La figure $B$ est un agrandissement de la figure $A$. <br>` +
              mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 40,
                  mainlevee: false,
                  amplitude: 0.5,
                  scale: 1.2,
                  center: !context.isHtml,
                },
                objets,
              ),
          )
          this.listeCanReponsesACompleter.push('? $=\\ldots$ cm')
          texteCorr = `Les longueurs de la figure $B$ sont le double de celles de la figure $A$.<br>
          Ainsi, ?$=2\\times ${texNombre(a, 1)}\\text{ cm}= ${miseEnEvidence(texNombre(reponse, 1))}\\text{ cm}$.
                  `

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: '$\\text{ cm}$',
              },
            )
          } else {
            texte += ' $\\ldots\\text{ cm}$'
          }
          nbChamps = 1
          break

        case 16:
          objets = []
          a = randint(1, 8)
          b = randint(1, 8)
          c = randint(1, 8, a)
          r = repere({
            grilleX: false,
            grilleY: true,
            xThickListe: false,
            xLabelListe: false,
            yUnite: 0.02,
            yThickDistance: 50,
            yMax: 460,
            xMin: 0,
            xMax: 10,
            yMin: 0,
            axeXStyle: '',
            yLegende: 'Effectifs',
          })

          reponse = 50 * a + 50 * b + 50 * c

          objets.push(r)
          objets.push(
            traceBarre(2, a, 'Chien', {
              epaisseur: 2,
              couleurDeRemplissage: 'red',
              hachures: true,
            }),
          )
          objets.push(
            traceBarre(5, b, 'Chat', {
              epaisseur: 2,
              couleurDeRemplissage: 'red',
              hachures: true,
            }),
          )
          objets.push(
            traceBarre(8, c, 'Autre', {
              epaisseur: 2,
              couleurDeRemplissage: 'red',
              hachures: true,
            }),
          )
          texte =
            "À partir du diagramme ci-dessous, détermine le nombre total d'animaux comptabilisés. <br>"
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 11,
              ymin: -3,
              ymax: 10.5,
              pixelsParCm: 25,
              scale: 0.5,
            },
            objets,
          )
          texteCorr = `Le nombre total d'animaux est : $${50 * a}+${50 * b}+${50 * c}=${miseEnEvidence(texNombre(reponse))}$.`
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push('')

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          }
          nbChamps = 1
          break

        case 17:
          a = choice([25, 10, 50, 20])
          reponse = 999
          if (a === 10) {
            b = randint(2, 8)
            reponse = 10 * b
            texteCorr = `Sur $${a}$ chiots, $${b}$ sont de couleurs marron, donc sur $${a}\\times 10=100$ chiots, $10\\times ${b}$ soit $${10 * b}$ sont de couleur marron.<br>
            Il y a donc $${miseEnEvidence(reponse)}$ $\\%$ de chiots marron.`
          }
          if (a === 20) {
            b = randint(8, 15)
            reponse = 5 * b
            texteCorr = `Sur $${a}$ chiots, $${b}$ sont de couleurs marron, donc sur $${a}\\times 5=100$ chiots, $10\\times ${b}$ soit $${5 * b}$ sont de couleur marron.<br>
            Il y a donc $${miseEnEvidence(reponse)}$ $\\%$ de chiots marron.`
          }
          if (a === 25) {
            b = randint(8, 15)
            reponse = 4 * b
            texteCorr = `Sur $${a}$ chiots, $${b}$ sont de couleurs marron, donc sur $${a}\\times 4=100$ chiots, $4\\times ${b}$ soit $${4 * b}$ sont de couleur marron.<br>
            Il y a donc $${miseEnEvidence(reponse)}$ $\\%$ de chiots marron.`
          }
          if (a === 50) {
            b = randint(15, 50, [20, 25, 30, 40, 50])
            reponse = 2 * b
            texteCorr = `Sur $${a}$ chiots, $${b}$ sont de couleurs marron, donc sur $${a}\\times 2=100$ chiots, $2\\times ${b}$ soit $${2 * b}$ sont de couleur marron.<br>
            Il y a donc $${miseEnEvidence(reponse)}$ $\\%$ de chiots marron.`
          }

          texte = `Sur $${a}$ chiots, $${b}$ sont de couleur marron.<br>
          Quel est le pourcentage de chiots marron ?`
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push(`$\\ldots\\%$`)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$\\%$',
                },
              )
          }
          nbChamps = 1

          break

        case 18:
          a = randint(1, 5)
          b = new Decimal(choice([25, 50, 75])).div(100)
          d = new Decimal(b).mul(60)
          if (!this.interactif) {
            texte = `Convertis en heures/minutes : <br>$${texNombre(new Decimal(a).add(b), 2)}\\text{ h}=\\ldots  \\text{ h } \\ldots \\text{ min}$`
            texteCorr = `$${texNombre(new Decimal(a).add(b), 2)}\\text{ h}= ${a}\\text{ h} + ${texNombre(b, 2)} \\times 60 \\text{ min} = ${miseEnEvidence(`${a}\\text{ h }${d.toNumber()}\\text{ min}`)}$`
          } else {
            texte = `Convertis en heures/minutes : <br>$${texNombre(new Decimal(a).add(b), 2)}\\text{ h}=$`
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierHms,
            )
            handleAnswers(this, index, {
              reponse: {
                value: new Hms({ hour: a, minute: d.toNumber() }).toString(),
                options: { HMS: true },
              },
            })
          }
          this.listeCanEnonces.push('Convertis en heures/minutes.')
          this.listeCanReponsesACompleter.push(
            `$${texNombre(new Decimal(a).add(b), 2)}\\text{ h}= \\ldots$ h $\\ldots$ min`,
          )
          nbChamps = 1

          break

        case 19:
          choix = choice(['a', 'b'])
          reponse = 999
          if (choix === 'a') {
            a = randint(8, 15, 10)
            b = randint(2, 6, 4)
            reponse = a * b * 100
            if (choice([true, false])) {
              texte = ` $25\\times ${a}\\times 4\\times ${b}=$`
              texteCorr = `$25\\times ${a}\\times 4\\times ${b}=\\underbrace{25\\times 4}_{=100}\\times \\underbrace{${a}\\times ${b}}_{=${a * b}}=${miseEnEvidence(texNombre(reponse))}$`
              this.listeCanEnonces.push('Complète.')
              this.listeCanReponsesACompleter.push(
                `$25\\times ${a}\\times 4\\times ${b}=\\ldots$`,
              )
            } else {
              texte = ` $${b}\\times 4\\times ${a}\\times 25= $`
              texteCorr = `$${b}\\times 4\\times ${a}\\times 25=\\underbrace{25\\times 4}_{=100}\\times \\underbrace{${a}\\times ${b}}_{=${a * b}}=${miseEnEvidence(texNombre(reponse))}$`
              this.listeCanEnonces.push('Complète.')
              this.listeCanReponsesACompleter.push(
                `$${b}\\times 4\\times ${a}\\times 25= \\ldots$`,
              )
            }
          }
          if (choix === 'b') {
            a = randint(8, 15, 10)
            b = randint(3, 6)
            reponse = a * b * 100
            if (choice([true, false])) {
              texte = ` $50\\times ${b}\\times 2\\times ${a}=$`
              texteCorr = `$50\\times ${b}\\times 2\\times ${a}=\\underbrace{50\\times 2}_{=100}\\times \\underbrace{${b}\\times ${a}}_{=${a * b}}=${miseEnEvidence(texNombre(reponse))}$`
              this.listeCanEnonces.push('Complète.')
              this.listeCanReponsesACompleter.push(
                `$50\\times ${b}\\times 2\\times ${a}= \\ldots$`,
              )
            } else {
              texte = ` $${b}\\times 2\\times ${a}\\times 50= $`
              texteCorr = `$${b}\\times 2\\times ${a}\\times 50=\\underbrace{50\\times 2}_{=100}\\times \\underbrace{${b}\\times ${a}}_{=${a * b}}=${miseEnEvidence(texNombre(reponse))}$`
              this.listeCanEnonces.push('Complète.')
              this.listeCanReponsesACompleter.push(
                ` $${b}\\times 2\\times ${a}\\times 50=\\ldots$`,
              )
            }
          }

          if (this.interactif) {
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break
        case 20:
          a = randint(11, 49, [20, 30, 40])
          a1 = new Decimal(a).div(10)
          b = new Decimal(randint(11, 49, [20, 30, 40])).div(10)
          reponse = new Decimal(a1.times(2)).add(b.times(2))

          texte = ` Quel est le périmètre d'un rectangle $ABCD$ tel que :
                $AB=${a}\\text{ mm}$ et $BC=${texNombre(b, 1)}\\text{ cm}$ ?<br>`
          texteCorr = `$${a}\\text{ mm}$ $= ${texNombre(a1, 1)}\\text{ cm}$.<br>
                Le périmètre de $ABCD$ est donc : $2\\times ${texNombre(a1, 1)} \\text{ cm}+ 2\\times ${texNombre(b, 1)} \\text{ cm}=${miseEnEvidence(texNombre(reponse, 1))}\\text{ cm}$.`
          this.listeCanEnonces
            .push(`Quel est le périmètre d'un rectangle $ABCD$ tel que :
                $AB=${a}\\text{ mm}$ et $BC=${texNombre(b, 1)}\\text{ cm}$ ?`)
          this.listeCanReponsesACompleter.push(
            ` Périmètre $=\\ldots\\text{ cm}$`,
          )
          if (this.interactif) {
            handleAnswers(this, index, { reponse: { value: reponse } })
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: ' $\\text{cm}$',
                },
              )
          } else {
            texte += 'Périmètre $=\\ldots\\text{ cm}$'
          }
          nbChamps = 1
          break

        case 21:
          a = new Decimal(choice([15, 25, 35, 45, 55, 65, 75, 85, 95])).div(10)
          b = new Decimal(choice([15, 25, 35, 45, 55, 65, 75, 85, 95])).div(10)
          somme = new Decimal(a).add(b)
          c = randint(10, 15)
          propositions = shuffle([
            `$${texNombre(a)}$`,
            `$${texNombre(b)}$`,
            `$${texNombre(c)}$`,
          ])
          texte = `Vrai/Faux<br>
          On peut construire un triangle (non aplati) dont les trois côtés ont pour longueur :<br>`
          texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`
          if (somme.greaterThan(c)) {
            handleAnswers(this, index, {
              reponse: { value: ['V', 'v'], options: { texteAvecCasse: true } },
            })
            texteCorr = `Pour qu'un triangle soit constructible (non aplati), il faut que la longueur du plus grand côté soit strictement inférieure à la somme des deux autres.<br>
          On a $${texNombre(a, 1)}+${texNombre(b, 1)}=${texNombre(somme, 0)} > ${c}$.<br>
          L'affirmation est donc vraie (${texteEnCouleurEtGras('V')}).`
          } else {
            handleAnswers(this, index, {
              reponse: { value: ['F', 'f'], options: { texteAvecCasse: true } },
            })
            texteCorr = `Pour qu'un triangle soit constructible (non aplati), il faut que la longueur du plus grand côté soit strictement inférieure à la somme des deux autres.<br>
          On a $${texNombre(a, 1)}+${texNombre(b, 1)}=${texNombre(new Decimal(a).add(b), 0)} < ${c}$.<br>
          L'affirmation est donc fausse (${texteEnCouleurEtGras('F')}).`
          }
          this.listeCanEnonces
            .push(`On peut construire un triangle (non aplati) dont les trois côtés ont pour longueur :<br>
          ${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}`)
          this.listeCanReponsesACompleter.push(` Vrai ${sp(8)} Faux`)
          if (this.interactif) {
            texte += '<br>Pour Vrai, écrire V et pour Faux : F'
            texte +=
              '<br>' + ajouteChampTexteMathLive(this, index, KeyboardType.vFON)
          }

          nbChamps = 1
          break

        case 22:
          l = randint(2, 5)
          L = randint(2, 4)
          h = randint(2, 6, [l, L])
          pav = pave(L, l, h)
          texte = `Quel est le volume du pavé droit ci-dessous ?<br>
        ${mathalea2d({ xmin: -2, ymin: -2, xmax: 10, ymax: 0.5 * h + l, scale: 0.5 }, pav)}`
          reponse = L * l * h
          texteCorr = `Le volume de ce pavé droit est : $${L}\\text{ cm}\\times ${l} \\text{ cm}\\times ${h}\\text{ cm}=${miseEnEvidence(reponse)}\\text{ cm}^3$.`
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierNumbers,
            {
              texteApres: '$\\text{ cm}^3$',
            },
          )
          handleAnswers(this, index, { reponse: { value: reponse } })
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push('$\\ldots\\text{ cm}^3$')
          nbChamps = 1
          break

        case 23:
          a = randint(11, 24, 20)
          reponse = arrondi(101 * a)
          texte = `$${a}\\times 101=$`
          texteCorr = `$${a}\\times 101 = ${texNombre(101 * a)}$<br>`

          texteCorr += `$${a}\\times 101 = ${a}\\times (100+1)=${a}\\times 100+${a}\\times 1=${texNombre(a * 100)}+${a}=${miseEnEvidence(texNombre(101 * a))}$`
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(`$${a}\\times 101=\\ldots$`)
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          nbChamps = 1
          break

        case 24:
          a = randint(2, 6)
          b = randint(2, 7)

          reponse = b * b + b * a

          texte = `Calcule $n\\times (n+${a})$ pour $n=${b}$. `
          texteCorr = `$${b}\\times (${b}+${a})=${b}\\times ${b + a}=${miseEnEvidence(reponse)}$`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
          }
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push('')
          nbChamps = 1
          break

        case 25:
          choix = choice(['a', 'b'])
          reponse = 999
          if (choix === 'a') {
            a = randint(11, 15)
            prenom = prenomM()
            if (choice([true, false])) {
              texte = `${prenom} mange les deux tiers d'un fromage de $${3 * a}$ g.<br>
            Quelle masse de fromage a-t-il mangée ?`

              texteCorr = `$\\dfrac{2}{3}\\times ${3 * a}=2\\times ${a}=${miseEnEvidence(2 * a)}$<br>
            ${prenom} a mangé $${2 * a}$ g de fromage.`
              reponse = 2 * a
            } else {
              texte = `${prenom} mange le  tiers d'un fromage de $${3 * a}$ g.<br>
            Quelle masse de fromage a-t-il mangée ?`

              texteCorr = `$\\dfrac{1}{3}\\times ${3 * a}=${miseEnEvidence(a)}$<br>
            ${prenom} a mangé $${a}$ g de fromage.`
              reponse = a
            }
          }
          if (choix === 'b') {
            a = randint(11, 15)
            prenom = prenomM()
            if (choice([true, false])) {
              texte = `${prenom} mange les trois quarts d'un fromage de $${4 * a}$ g.<br>
            Quelle masse de fromage a-t-il mangée ?`

              texteCorr = `$\\dfrac{3}{4}\\times ${4 * a}=3\\times ${a}=${miseEnEvidence(3 * a)}$.<br>
            ${prenom} a mangé $${3 * a}$ g de fromage.`
              reponse = 3 * a
            } else {
              texte = `${prenom} mange le quart d'un fromage de $${4 * a}$ g.<br>
            Quelle masse de fromage a-t-il mangée ?`

              texteCorr = `$\\dfrac{1}{4}\\times ${4 * a}=${miseEnEvidence(a)}$.<br>
            ${prenom} a mangé $${a}$ g de fromage.`
              reponse = a
            }
          }
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push('$\\ldots$ g')
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                { texteApres: 'g' },
              )
          }
          nbChamps = 1
          break

        case 26:
          a = randint(1, 6)
          b = choice([1.5, 2.5, 3.5, 4.5])
          texte = `Complète : <br>
          $${texNombre(a * 2, 0)}\\times \\ldots =${texNombre(b * 2 * a, 1)}$
           `

          texteCorr = `Le nombre cherché est $${texNombre(b * 2 * a, 1)}\\div ${texNombre(a * 2, 0)}=${miseEnEvidence(texNombre(b, 1))}$.
            `
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `$${texNombre(a * 2, 0)}\\times \\ldots =${texNombre(b * 2 * a, 1)}$`,
          )
          reponse = fraction(b, 1)

          handleAnswers(this, index, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierDeBaseAvecFraction,
              )
          }
          nbChamps = 1
          break

        case 27:
          a = randint(2, 9)
          choix = choice(['a', 'b', 'c', 'd']) //
          if (choix === 'a') {
            reponse = a * 1000
            texte = `$${a}\\text{ dm}^3=$`
            texteCorr = `$1\\text{ dm}^3= ${texNombre(1000)}\\text{ cm}^3$, donc $${a}\\text{ dm}^3=${a}\\times ${texNombre(1000)}\\text{ cm}^3=${miseEnEvidence(texNombre(a * 1000))}\\text{ cm}^3$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$\\text{ cm}^3$',
                },
              )
            } else {
              texte += ' $\\ldots\\text{ cm}^3$'
            }
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `$${a}\\text{ dm}^3=\\ldots\\text{ cm}^3$`,
            )
          }
          if (choix === 'b') {
            reponse = a / 1000
            texte = `$${a}\\text{ cm}^3=$`
            texteCorr = `$1\\text{ cm}^3= 0,001\\text{ dm}^3$, donc $${a}\\text{ cm}^3=${a}\\times 0,001\\text{ dm}^3=${miseEnEvidence(texNombre(a / 1000))}\\text{ dm}^3$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: 'dm$^3$',
                },
              )
            } else {
              texte += ' $\\ldots\\text{ dm}^3$'
            }
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `$${a}\\text{ cm}^3=\\ldots\\text{ dm}^3$`,
            )
          }
          if (choix === 'c') {
            reponse = a * 1000
            texte = `$${a}\\text{ m}^3=$`
            texteCorr = `$1\\text{ m}^3= ${texNombre(1000)}\\text{ dm}^3$, donc $${a}\\text{ m}^3=${a}\\times ${texNombre(1000)}\\text{ dm}^3=${miseEnEvidence(texNombre(a * 1000))}\\text{ dm}^3$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: 'dm$^3$',
                },
              )
            } else {
              texte += ' $\\ldots\\text{ dm}^3$'
            }
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `$${a}\\text{ m}^3=\\ldots\\text{ dm}^3$`,
            )
          }
          if (choix === 'd') {
            reponse = a / 1000
            texte = `$${a}\\text{ dm}^3=$`
            texteCorr = `$1\\text{ dm}^3= 0,001\\text{ m}^3$, donc $${a}\\text{ dm}^3=${a}\\times 0,001\\text{ m}^3=${miseEnEvidence(texNombre(a / 1000))}\\text{ m}^3$.`
            handleAnswers(this, index, { reponse: { value: reponse } })
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                index,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$\\text{ m}^3$',
                },
              )
            } else {
              texte += ' $\\ldots\\text{ m}^3$'
            }
            this.listeCanEnonces.push('Complète.')
            this.listeCanReponsesACompleter.push(
              `$${a}\\text{ dm}^3=\\ldots\\text{ m}^3$`,
            )
          }

          nbChamps = 1
          break

        case 28:
          a = randint(1, 3)
          b = randint(2, 5)
          c = a + b
          f = new Decimal(a * b).div(2)
          A = pointAbstrait(0, 0, 'A', 'below')
          B = pointAbstrait(5, 0, 'B', 'below')
          C = pointAbstrait(5, 3, 'C', 'above')
          D = pointAbstrait(2, 3, 'D', 'above')
          E = pointAbstrait(0, 3, 'E', 'above')
          poly = polygone([A, B, C, D], 'black')

          code1 = codageSegment(B, C, '||')
          segmentED = segment(E, D)
          segmentED.pointilles = 2
          segmentEA = segment(E, A)
          segmentEA.pointilles = 2
          code2 = codageSegment(D, C, '||')
          poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
          d = texteParPosition(
            `${c} cm`,
            milieu(A, B).x,
            milieu(A, B).y - 0.5,
            0,
            'black',
            1,
            'milieu',
            false,
          )
          e = texteParPosition(
            `${b} cm`,
            milieu(B, C).x + 1,
            milieu(B, C).y,
            0,
            'black',
            1,
            'milieu',
            false,
          )
          poly.epaisseur = 1
          reponse = new Decimal(b * c).sub(f)
          texte = "Quelle est l'aire du polygone grisé ?<br>"

          texte += mathalea2d(
            {
              xmin: -1.5,
              ymin: -1,
              xmax: 7.1,
              ymax: 4,
              pixelsParCm: 30,
              scale: 0.5,
            },
            poly,
            labelPoint(A, B, C, D, E),
            codageAngleDroit(E, A, B),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, E),
            codageAngleDroit(C, E, A),
            code1,
            code2,
            d,
            e,
            segmentED,
            segmentEA,
          )
          texteCorr = `L'aire du rectangle $ABCD$ est : $${b}\\text{ cm}\\times ${c}\\text{ cm}=${b * c}\\text{ cm}^2$.<br>
          L'aire du triangle $AED$ est : $\\dfrac{${a}\\text{ cm}\\times ${b}\\text{ cm}}{2}=${texNombre(f, 1)}\\text{ cm}^2$.<br>
          On en déduit que l'aire du polygone grisé est : $${b * c}\\text{ cm}^2-${texNombre(f, 1)}\\text{ cm}^2=${miseEnEvidence(texNombre(reponse, 1))}\\text{ cm}^2$.`
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
              {
                texteApres: '$\\text{ cm}^2$',
              },
            )
          }
          this.listeCanEnonces.push(texte)
          this.listeCanReponsesACompleter.push(' $\\ldots \\text{ cm}^2$')
          nbChamps = 1
          break

        case 29:
          a = randint(2, 6)
          b = randint(2, 9)
          d = randint(2, 9)
          k = randint(2, 6)
          c = d + k
          reponse = (a + b) * (c - d)
          texte = `Le produit de la somme de $${a}$ et $${b}$ par la différence de $${c}$ et $${d}$ est égal à :`
          texteCorr = `Le produit de la somme de $${a}$ et $${b}$ par la différence de $${c}$ et $${d}$ est : <br>
          $(${a}+${b})\\times (${c}-${d})=${a + b}\\times ${k}=${miseEnEvidence(reponse)}$.`

          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$'
          }
          this.listeCanEnonces.push('Complète.')
          this.listeCanReponsesACompleter.push(
            `Le produit de la somme de $${a}$ et $${b}$ par la différence de $${c}$ et $${d}$ est égal à : $\\ldots$`,
          )
          nbChamps = 1
          break

        case 30:
          if (choice([true, false])) {
            a = randint(2, 9)

            texte = `$${a}-${a}\\div ${a}\\times ${a}+${a}\\times ${a}=$`
            texteCorr = `$${a}-${a}\\div ${a}\\times ${a}+${a}\\times ${a}=${a}-1\\times ${a}+${a * a}=${a}-${a}+${a * a}=${miseEnEvidence(a * a)}$.`
            this.listeCanReponsesACompleter.push(
              `$${a}-${a}\\div ${a}\\times ${a}+${a}\\times ${a}=\\ldots$`,
            )
          } else {
            a = randint(2, 9)

            texte = `$${a}\\div ${a}\\times ${a}-${a}+${a}\\times ${a}=$`
            texteCorr = `$${a}\\div ${a}\\times ${a}-${a}+${a}\\times ${a}=1\\times ${a}-${a}+${a * a}=${a}-${a}+${a * a}=${miseEnEvidence(a * a)}$`
            this.listeCanReponsesACompleter.push(
              `$${a}\\div ${a}\\times ${a}-${a}+${a}\\times ${a}=\\ldots$`,
            )
          }
          reponse = a * a
          this.listeCanEnonces.push('Complète.')
          handleAnswers(this, index, { reponse: { value: reponse } })
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              index,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += ' $\\ldots$ '
          }
          nbChamps = 1
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
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
