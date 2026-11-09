import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import {
  droite,
  droiteParPointEtParallele,
  droiteParPointEtPente,
  droiteParPointEtPerpendiculaire,
  labelOnLine,
} from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  choice,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range, rangeMinMax } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '22/11/2020'
export const amcReady = true
export const amcType = 'AMCOpen'
export const titre =
  'Utiliser les propriétés des droites parallèles et perpendiculaires'

/**
 * @author Jean-claude Lhote (EE : pour l'ajout d'AMC et la possibilité de sélectionner différents mélanges)
 * @author Mickael Guironnet (refactoring avec ajout des 4 à 6 et des figures)
 */
export const dateDeModifImportante = '01/11/2026'
export const uuid = 'c46e8'

export const refs = {
  'fr-fr': ['5G4A-3'],
  'fr-2016': ['6G52-2', '5G33-2'],
  'fr-ch': ['9R1ES1B-7', '9R2ES1B-7', '9R3ES1B-7', 'PRQES01A-1', 'PRQES04A-7'],
}
export default class ProprietesParallelesPerpendiculaires extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de raisonnement',
      'Nombres séparés par des tirets :\n1 : Une étape\n2 : Une étape avec distracteur\n3 : Deux étapes\n4 : Trois étapes\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Que des perpendiculaires', false]
    this.besoinFormulaire3CaseACocher = ['Avec le dessin', true]
    this.comment =
      "Il se peut que l'exercice vous propose moins de questions que le nombre demandé par manque de possibiilités d'exercices différents. Pour augmenter cette possibilité, choisissez d'autres types de raisonnement."
    this.nbQuestions = 3

    this.sup = 4
    this.sup2 = false
    this.sup3 = true
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles: number[] = []
    let questionsParNiveau = []
    if (!this.sup2) {
      questionsParNiveau.push(range(3))
      questionsParNiveau.push(rangeMinMax(4, 6))
      questionsParNiveau.push(rangeMinMax(9, 15))
      questionsParNiveau.push(rangeMinMax(19, 31, 20))
      questionsParNiveau.push(
        questionsParNiveau[0].concat(
          questionsParNiveau[1]
            .concat(questionsParNiveau[2])
            .concat(questionsParNiveau[3]),
        ),
      )
    } else {
      questionsParNiveau = [[2], [5], [15], [31], [2, 5, 15, 31]]
    }
    const IndiceNew = [0, 0, 0, 0, 0]
    let NumQuestionsDisponibles
    const QuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }).map(Number)
    for (let i = 0; i < this.nbQuestions; i++) {
      // on a un tableau avec des strings : ['1', '1', '2']
      NumQuestionsDisponibles =
        contraindreValeur(
          1,
          5,
          QuestionsDisponibles[i % QuestionsDisponibles.length],
          4,
        ) - 1
      const liste1 = questionsParNiveau[NumQuestionsDisponibles]
      const listeAEviter = typesDeQuestionsDisponibles.slice(
        IndiceNew[NumQuestionsDisponibles],
      )
      if (listeAEviter.length === liste1.length) {
        this.nbQuestions = i
        break
      }
      typesDeQuestionsDisponibles[i] = choice(liste1, listeAEviter) // Ce slice permet de gérer, par exemple, le mélange 1-1-2 pour 10 questions car il n'y a pas assez de choix différents pour le mélange 1.
      if (typesDeQuestionsDisponibles[i] === undefined) {
        // Dans le cas, on a épuisé tous les choix différents d'un mélange
        IndiceNew[NumQuestionsDisponibles] = i
        typesDeQuestionsDisponibles[i] = choice(
          liste1,
          typesDeQuestionsDisponibles.slice(IndiceNew[NumQuestionsDisponibles]),
        )
      }
    }
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const droiteColor = context.isHtml
      ? ['red', bleuMathalea, 'green', 'black', 'magenta', orangeMathalea]
      : ['black', 'black', 'black', 'black', 'black', 'black']

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''

      const numDroites = shuffle([1, 2, 3, 4, 5])
      const d = []
      const dE = []
      const P = []
      const objets = []
      const objets2 = []
      let code: number[][] = []
      let code2: number[][] = []

      switch (listeTypeDeQuestions[i]) {
        // \n1 : Une étape (de 0 à 3)\n2 : Une étape avec distracteur (de 4 à 6)\n3 : Deux étapes (de 9 à 15)\n4 : Trois étapes (de 19 à 31)\n5 : Mélange']
        case 0: // si 1//2 et 2//3 alors 1//3
          code = [
            [1, 2, 1],
            [2, 3, 1],
          ]
          break
        case 1: // si 1//2 et 2T3 alors 1T3
          code = [
            [1, 2, 1],
            [2, 3, -1],
          ]
          break
        case 2: // si 1T2 et 2T3 alors 1//3
          code = [
            [1, 2, -1],
            [2, 3, -1],
          ]
          break
        case 3: // si 1T2 et 2//3 alors 1T3
          code = [
            [1, 2, -1],
            [2, 3, 1],
          ]
          break
        case 4: // si 1T2 et 2//3 alors 1T3 et 4 distracteur
          code = [
            [1, 2, -1],
            [2, 3, 1],
          ]
          code2 = [[1, 4, 1]]
          break
        case 5: // si 1T2 et 2T3 alors 1//3 et 4 distracteur
          code = [
            [1, 2, -1],
            [2, 3, -1],
          ]
          code2 = [[2, 4, 1]]
          break
        case 6: // si 1//2 et 2//3 alors 1//3 et 4 distracteur
          code = [
            [1, 2, 1],
            [2, 3, 1],
          ]
          code2 = [[1, 4, -1]]
          break
        case 8: // Si 1//2 et 2//3 et 3//4 alors 1//4
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 9: // Si 1//2 et 2//3 et 3T4 alors 1T4
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
          ]
          break
        case 10: // Si 1//2 et 2T3 et 3//4 alors 1T4
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 11: // Si 1//2 et 2T3 et 3T4 alors 1//4
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
          ]
          break
        case 12: // Si 1T2 et 2//3 et 3//4 alors 1T4
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 13: // Si 1T2 et 2//3 et 3T4 alors 1//4
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
          ]
          break
        case 14: // Si 1T2 et 2T3 et 3//4 alors 1//4
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
          ]
          break
        case 15: // Si 1T2 et 2T3 et 3T4 alors 1T4
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
          ]
          break
        case 16: // Si 1//2 et 2//3 et 3//4 et 4//5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 17: // Si 1//2 et 2//3 et 3T4 et 4//5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 18: // Si 1//2 et 2T3 et 3//4 et 4//5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 19: // Si 1//2 et 2T3 et 3T4 et 4//5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 20: // Si 1T2 et 2//3 et 3//4 et 4//5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 21: // Si 1T2 et 2//3 et 3T4 et 4//5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 22: // Si 1T2 et 2T3 et 3//4 et 4//5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 23: // Si 1T2 et 2T3 et 3T4 et 4//5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 24: // Si 1//2 et 2//3 et 3//4 et 4T5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 25: // Si 1//2 et 2//3 et 3T4 et 4T5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 26: // Si 1//2 et 2T3 et 3//4 et 4T5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 27: // Si 1//2 et 2T3 et 3T4 et 4T5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 28: // Si 1T2 et 2//3 et 3//4 et 4T5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 29: // Si 1T2 et 2//3 et 3T4 et 4T5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 30: // Si 1T2 et 2T3 et 3//4 et 4T5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 31: // Si 1T2 et 2T3 et 3T4 et 4T5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
      }

      // enoncé mélangé
      const couleurd = []
      const phrases = []
      texte += 'On sait que '
      couleurd.push(randint(0, 5))
      const codeAll = code.concat(code2)
      for (let j = 0; j < codeAll.length; j++) {
        let textetemp = `$(d_${numDroites[codeAll[j][0] - 1]})`
        if (codeAll[j][2] === 1) {
          textetemp += '\\parallel '
          couleurd.push(couleurd[j])
        } else {
          textetemp += '\\perp'
          couleurd.push((couleurd[j] + 1) % 6)
        }
        textetemp += `(d_${numDroites[codeAll[j][1] - 1]})$`
        phrases.push(textetemp)
      }
      for (let j = 0; j < codeAll.length - 1; j++) {
        texte += phrases[j]
        if (j !== codeAll.length - 2) texte += ', '
        else texte += ' et '
      }
      texte += phrases[codeAll.length - 1] + '.<br>'

      // construction de la figure
      context.fenetreMathalea2d = [-2, -2, 15, 10] // important avec la création des droites
      const labels = []
      P.push(pointAbstrait(0, 0))
      let droiteP = droiteParPointEtPente(
        P[0],
        randint(-1, 1, -2) / 10,
        '',
        droiteColor[couleurd[0]],
      )
      droiteP.epaisseur = 2
      droiteP.pointilles = 0
      d.push(droiteP)
      const droiteE = droite(
        pointAbstrait(droiteP.x1, droiteP.y1),
        pointAbstrait(droiteP.x2, droiteP.y2),
        '',
      )
      droiteE.epaisseur = 2
      dE.push(droiteE)
      labels.push(labelOnLine(droiteE, `(d_${numDroites[codeAll[0][0] - 1]})`))
      objets.push(d[0])
      objets2.push(dE[0])
      for (let x = 0; x < codeAll.length; x++) {
        if (codeAll[x][2] === 1) {
          P.push(pointAbstrait((x + 1) * 2, (x + 1) * 2))
          droiteP = droiteParPointEtParallele(
            P[x + 1],
            d[codeAll[x][0] - 1],
            '',
            droiteColor[couleurd[x + 1]],
          )
          droiteP.epaisseur = 2
          droiteP.pointilles = d[codeAll[x][0] - 1].pointilles
          d.push(droiteP)
          const droiteP2 = droite(
            pointAbstrait(droiteP.x1, droiteP.y1),
            pointAbstrait(droiteP.x2, droiteP.y2),
            '',
          )
          droiteP2.epaisseur = 2
          dE.push(droiteP2)
          labels.push(
            labelOnLine(droiteP2, `(d_${numDroites[codeAll[x][1] - 1]})`),
          )
        } else {
          P.push(pointAbstrait((x + 1) * 2, (x + 1) * 2))
          droiteP = droiteParPointEtPerpendiculaire(
            P[x + 1],
            d[codeAll[x][0] - 1],
            '',
            droiteColor[couleurd[x + 1]],
          )
          droiteP.epaisseur = 2
          droiteP.pointilles = (x % 3) + 1
          d.push(droiteP)
          const droiteP2 = droite(
            pointAbstrait(droiteP.x1, droiteP.y1),
            pointAbstrait(droiteP.x2, droiteP.y2),
            '',
          )
          labels.push(
            labelOnLine(droiteP2, `(d_${numDroites[codeAll[x][1] - 1]})`),
          )
          droiteP2.epaisseur = 2
          dE.push(droiteP2)
          const Inter = pointIntersectionDD(d[codeAll[x][0] - 1], droiteP)
          const PP = rotation(P[x + 1], Inter, 90)
          objets.push(codageAngleDroit(PP, Inter, P[x + 1], 'black', 0.6))
          objets2.push(codageAngleDroit(PP, Inter, P[x + 1], 'black', 0.6))
        }
        objets.push(d[x + 1])
        objets2.push(dE[x + 1])
      }
      objets2.push(...labels)
      objets.push(...labels)

      if (this.sup3) {
        texte +=
          (context.vue === 'diap' ? '<center>' : '') +
          mathalea2d(
            {
              xmin: -2,
              xmax: 15,
              ymin: -2,
              ymax: 10,
              pixelsParCm: 20,
              scale: context.vue !== 'latex' ? 0.3 : 0.6,
              mainlevee: false,
              amplitude: 0.3,
              display: 'block',
            },
            objets2,
          ) +
          (context.vue === 'diap' ? '</center>' : '')
      }
      texte += `Que peut-on dire de $(d_${numDroites[code[0][0] - 1]})$ et $(d_${numDroites[code[code.length - 1][1] - 1]})$ ?`
      if (context.isAmc && !this.sup3) {
        texte += " On pourra s'aider en traçant une figure."
      }

      // correction raisonnement ordonné
      texteCorr =
        "À partir de l'énoncé, on peut réaliser le schéma suivant (il en existe une infinité).<br>"
      if (
        [2, 5, 15, 31].indexOf(listeTypeDeQuestions[i]) === -1 &&
        !this.sup2
      ) {
        texteCorr +=
          " Les droites données parallèles dans l'énoncé sont de même "
        texteCorr += context.isHtml ? ' couleur/style.<br>' : 'style.<br>'
      }
      texteCorr += mathalea2d(
        {
          xmin: -2,
          xmax: 15,
          ymin: -2,
          ymax: 10,
          pixelsParCm: 20,
          scale: context.vue !== 'latex' ? 0.3 : 0.6,
          mainlevee: false,
          amplitude: 0.3,
          display: 'block',
        },
        objets,
      )
      for (let j = 0; j < code.length - 1; j++) {
        if (this.correctionDetaillee) texteCorr += 'On sait que : '
        else texteCorr += 'Comme '
        texteCorr += `$(d_${numDroites[code[j][0] - 1]})`
        if (code[j][2] === 1) texteCorr += '\\parallel '
        else texteCorr += '\\perp'
        texteCorr += `(d_${numDroites[code[j][1] - 1]})$ et `
        texteCorr += `$(d_${numDroites[code[j + 1][0] - 1]})`
        if (code[j + 1][2] === 1) texteCorr += '\\parallel '
        else texteCorr += '\\perp'
        texteCorr += `(d_${numDroites[code[j + 1][1] - 1]})$`
        // quelle propriété ?
        if (code[j][2] * code[j + 1][2] === -1) {
          // Une parallèle et une perpendiculaire
          if (this.correctionDetaillee)
            texteCorr +=
              ".<br> Or si deux droites sont parallèles alors toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre.<br>Donc"
          else texteCorr += ', on en déduit que '
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = -1
        } else if (code[j][2] > 0) {
          // deux parallèles
          if (this.correctionDetaillee)
            texteCorr +=
              '.<br> Or si deux droites sont parallèles à une même droite alors elles sont parallèles entre elles.<br>Donc'
          else texteCorr += ', on en déduit que '
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = 1
        } else {
          // deux perpendiculaires
          if (this.correctionDetaillee)
            texteCorr +=
              '.<br> Or si deux droites sont perpendiculaires à une même droite alors elles sont parallèles entre elles.<br>Donc'
          else texteCorr += ', on en déduit que '
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = 1
        }
        const conclusion = `(d_${numDroites[code[0][0] - 1]})${code[j + 1][2] === -1 ? '\\perp' : '\\parallel'}(d_${numDroites[code[j + 1][1] - 1]})`
        texteCorr += ` $${j === code.length - 2 ? miseEnEvidence(conclusion) : conclusion}$.<br>`
      }

      /** ********************** AMC Open *****************************/
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].options = { ordered: false }
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].enonce = texte + '<br>'
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].propositions = [
        {
          texte: texteCorr,
          statut: 3,
        },
      ]
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      /****************************************************/

      if (
        this.questionJamaisPosee(
          i,
          numDroites.join(''),
          JSON.stringify(code),
          JSON.stringify(code2),
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
