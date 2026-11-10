import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduireAxPlusByPlusC,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '31/03/2026'
export const titre =
  'Déterminer une fonction affine par la donnée des images de deux nombres'
export const interactifReady = true

/**
 * Déterminer la forme algébrique à partir de la donnée de 2 nombres et de leurs images
 * cas 0 : fonction constante
 * cas 1 : f(0) et f(x2) donnés
 * cas 2 : f(x1) et f(x1+1) donnés
 * cas 3 : f(x1) et f(x2) donnés a et b entiers
 * cas 4 : f(x1) et f(x2) donnés a et b rationnels
 * x1, x2, f(x1) et f(x2) sont toujours entiers relatifs
 * @author Jean-claude Lhote
 * Refactorisé par Éric Elter la 31/03/2026
 */
export const uuid = 'b8b3e'

export const refs = {
  'fr-fr': ['3F21-2'],
  'fr-ch': ['11LCFA2E-3', '11LSFA2E-3', 'PRQPF01C-7', 'PRQPF02C-3'],
}
export default class DeterminerFonctionAffine3e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Fonction constante',
        "2 : Un des antécédents de l'énoncé est O",
        "3 : Un antécédent de l'énoncé est l'entier consécutif de l'autre antécédent",
        '4 : Sans particularité, avec des coefficients entiers',
        '5 : Sans particularité, avec des coefficients fractionnaires',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Graphique dans la correction']

    this.sup = '1-2'
    this.sup2 = false
    this.nbQuestions = 2
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.comment =
      'Dans cet exercice, on donne $f(x_1)=y_1$ et $f(x_2)=y_2$ pour obtenir $f(x)=ax+b$.<br>'
    this.comment += 'Le paramétrage permet les choix suivants :<br>'
    this.comment += 'cas 1 : $y_1=y_2$<br>'
    this.comment += 'cas 2 : $x_1=0$<br>'
    this.comment += 'cas 3 : $x_2=x_1+1$<br>'
    this.comment += 'cas 4 : $a$ et $b$ entiers<br>'
    this.comment += 'cas 5 : $a$ et $b$ rationnels<br>'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, tA, tB, r, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      let a = 0
      let b = 0
      let x1 = 0
      let x2 = 0
      let y1 = 0
      let y2 = 0
      let aFrac, bFrac: FractionEtendue
      let configRepere
      switch (listeTypeDeQuestions[i]) {
        case 1: // fonction constante
          a = 0
          b = randint(-10, 10, 0)
          x1 = randint(-5, -1)
          x2 = randint(1, 5)
          y1 = b
          y2 = b
          texteCorr = `On remarque que $f(${x1})=f(${x2})=${b}$ donc la droite représentant la fonction $f$ passe par deux points distincts ayant la même ordonnée.<br>`
          texteCorr += `Elle est donc parallèle à l'axe des abscisses. La fonction $f$ est une fonction constante et $f(x)=${miseEnEvidence(b)}$.`
          break

        case 2: // f(0)=y1 f(x2)= y2 a et b entiers relatifs.
          a = randint(-2, 2, 0)
          b = randint(-5, 5, 0)
          x1 = 0
          y1 = b
          x2 = randint(-5, 5, 0)
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$. Nous savons que $f(0)=${y1}$.<br>On en déduit que $a\\times 0 +b= ${y1}$ et donc que $b= ${y1}$. `
          texteCorr += `<br>Donc, $f(x)=ax${ecritureAlgebrique(y1)}$.<br>En utilisant la donnée $f(${x2})=${y2}$, on obtient : $a \\times ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${y2}$, d'où $${rienSi1(x2)}a  =${y2}${ecritureAlgebrique(-b)}=${y2 - b}$`
          if (x2 !== 1)
            texteCorr += ` et finalement, $a=\\dfrac{${y2 - b}}{${x2}}=${a}$.`
          texteCorr += `<br>Donc, $f(x)=${miseEnEvidence(reduireAxPlusB(a, b))}$.`
          break

        case 3: // f(x1)=y1 et f(x1+1)=y2
          a = randint(-5, 5, 0)
          b = randint(-5, 5, 0)
          x1 = randint(-5, 5, [-1, 0])
          y1 = a * x1 + b
          x2 = x1 + 1
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$. On passe de $${x1}$ à $${x2}$ en ajoutant $1$, donc la pente $a$ de la droite correspond à $f(${x2})-f(${x1})=${y2}-${ecritureParentheseSiNegatif(y1)}=`
          if (y1 < 0) texteCorr += `${y2}${ecritureAlgebrique(-y1)}=${a}$.<br>`
          else texteCorr += `${a}$.<br>`
          texteCorr += `Donc, $f(x)=${a}x+b`
          if (a === 1) texteCorr += `=x+b`
          else if (a === -1) texteCorr += `=-x+b`
          texteCorr += `$.<br>En utilisant la donnée $f(${x2})=${y2}$, on obtient : ${Math.abs(a) === 1 ? '' : `$${a} \\times ${ecritureParentheseSiNegatif(x2)}+b=${y2}$, d'où`} $${a * x2}+b=${y2}$ donc $b=${y2}${ecritureAlgebrique(-a * x2)}=${b}$.<br>`
          texteCorr += `Donc, $f(x)=${miseEnEvidence(reduireAxPlusB(a, b))}$.`
          break

        case 4: // f(x1)=y1 f(x2)=y2 a et b entiers
          a = randint(-5, 5, 0)
          b = randint(-5, 5, 0)
          x1 = randint(-5, 5, 0)
          y1 = a * x1 + b
          x2 = randint(-5, 5, [0, x1])
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$.<br>En utilisant les données de l'énoncé, on obtient :<br>$f(${x1})=${y1}=a \\times ${ecritureParentheseSiNegatif(x1)}+b=${reduireAxPlusByPlusC(x1, 1, 0, 'a', 'b')}$${sp(10)} et ${sp(10)}$f(${x2})=${y2}=a \\times ${ecritureParentheseSiNegatif(x2)}+b=${reduireAxPlusByPlusC(x2, 1, 0, 'a', 'b')}$.<br>`
          texteCorr += `Donc, d'une part : $b=${reduireAxPlusB(-x1, y1, 'a')}$ et d'autre part : $b=${reduireAxPlusB(-x2, y2, 'a')}$.<br>`
          texteCorr += `Par identification, on obtient : $${reduireAxPlusB(-x1, y1, 'a')}=${reduireAxPlusB(-x2, y2, 'a')}$.<br>`
          texteCorr += `On en déduit que $${reduireAxPlusByPlusC(-x1, x2, 0, 'a', 'a')}=${y2}${y1 === 0 ? '' : ecritureAlgebrique(-y1)}$, soit $${rienSi1(x2 - x1)}a=${y2 - y1}$.<br>`
          texteCorr +=
            x1 - x2 === 1
              ? `Donc, $a=${a}$.<br>`
              : x1 - x2 === -1
                ? `Donc, $a=${y2 - y1}$.<br>`
                : `Donc, $a=\\dfrac{${y2 - y1}}{${x2 - x1}}=${a}$.<br>`
          texteCorr += `Donc, $b=${y1}${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(-x1)}=${y1}${ecritureAlgebrique(-a * x1)}=${b}$.<br>`
          texteCorr += `Donc, $f(x)=${miseEnEvidence(reduireAxPlusB(a, b))}$.`
          break

        case 5:
        default: {
          x1 = randint(-5, 5, 0)
          x2 = randint(-5, 5, [0, x1])
          y1 = randint(-5, 5)
          y2 = randint(-5, 5)
          aFrac = new FractionEtendue(y2 - y1, x2 - x1)
          a = aFrac.toNumber()
          bFrac = new FractionEtendue(y2 - y1, x2 - x1)
          bFrac = aFrac.multiplieEntier(-x1).ajouteEntier(y1)
          b = bFrac.toNumber()
          texteCorr = `Soit $f(x)=ax+b$.<br>En utilisant les données de l'énoncé, on obtient :<br>$f(${x1})=${y1}=a \\times ${ecritureParentheseSiNegatif(x1)}+b=${reduireAxPlusByPlusC(x1, 1, 0, 'a', 'b')}$${sp(10)} et ${sp(10)}$f(${x2})=${y2}=a \\times ${ecritureParentheseSiNegatif(x2)}+b=${reduireAxPlusByPlusC(x2, 1, 0, 'a', 'b')}$.<br>`
          texteCorr += `Donc, d'une part : $b=${reduireAxPlusB(-x1, y1, 'a')}$ et d'autre part : $b=${reduireAxPlusB(-x2, y2, 'a')}$.<br>`
          texteCorr += `Par identification, on obtient : $${reduireAxPlusB(-x1, y1, 'a')}=${reduireAxPlusB(-x2, y2, 'a')}$.<br>`
          texteCorr += `On en déduit que $${reduireAxPlusByPlusC(-x1, x2, 0, 'a', 'a')}=${y2}${y1 === 0 ? '' : ecritureAlgebrique(-y1)}$, soit $${rienSi1(x2 - x1)}a=${y2 - y1}$.<br>`
          texteCorr +=
            x1 - x2 === 1
              ? `Donc, $a=${y1 - y2}$.<br>`
              : x1 - x2 === -1
                ? `Donc, $a=${y2 - y1}$.<br>`
                : `Donc, $a=\\dfrac{${y2 - y1}}{${x2 - x1}}=${aFrac.texFractionSimplifiee}$.<br>`
          texteCorr += `Donc, $b=${y1}+${aFrac.simplifie().texFSP}\\times ${ecritureParentheseSiNegatif(-x1)}=${fraction(y1 * aFrac.denIrred, aFrac.denIrred).texFSD}+${aFrac.multiplieEntier(-x1).simplifie().texFSP}=${bFrac.texFractionSimplifiee}$.<br>`
          texteCorr += `Donc, $f(x)=${miseEnEvidence(reduireAxPlusB(aFrac.simplifie(), bFrac.simplifie()))}$.`
          handleAnswers(this, i, {
            reponse: {
              value: `${reduireAxPlusB(aFrac.simplifie(), bFrac.simplifie())}`,
              options: { calculFormel: true },
            },
          })
          break
        }
      }
      if (this.sup2) {
        configRepere = {
          xmin: Math.round(Math.min(-1, x1, x2) - 2),
          ymin: Math.round(Math.min(-1, y1, y2, b) - 2),
          xmax: Math.round(Math.max(1, x1, x2) + 2),
          ymax: Math.round(Math.max(1, y1, y2, b) + 2),
        }

        tA = tracePoint(pointAbstrait(x1, y1), bleuMathalea)
        tA.taille = 4
        tA.epaisseur = 2
        tB = tracePoint(pointAbstrait(x2, y2), bleuMathalea)
        tB.taille = 4
        tB.epaisseur = 2

        r = repere({
          xMin: configRepere?.xmin,
          yMin: configRepere?.ymin,
          xMax: configRepere?.xmax,
          yMax: configRepere?.ymax,
        })
        texteCorr += `<br><br>${mathalea2d(
          {
            ...configRepere,
            pixelsParCm: 20,
            scale: 0.7,
          },
          r,
          courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
          tA,
          tB,
        )}`
      }

      handleAnswers(this, i, {
        reponse: {
          value: `${reduireAxPlusB(listeTypeDeQuestions[i] < 5 ? a : aFrac!.simplifie(), listeTypeDeQuestions[i] < 5 ? b : bFrac!.simplifie())}`,
          options: { calculFormel: true },
        },
      })

      texte = `La fonction $f$ est une fonction affine et on sait que $f(${x1})=${y1}$ et $f(${x2})=${y2}$.<br>`
      texte += 'Déterminer la forme algébrique de la fonction $f$.'
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecX,
        { texteAvant: `<br>$f(x)=$ ` },
      )
      if (
        this.questionJamaisPosee(
          i,
          x1,
          x2,
          y1,
          y2,
          a,
          b,
          listeTypeDeQuestions[i],
        )
      ) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
