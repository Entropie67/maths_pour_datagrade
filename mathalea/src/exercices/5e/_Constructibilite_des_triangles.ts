import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes, enleveElement } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Constructibilité des triangles via les longueurs ou les angles'
export const dateDeModifImportante = '12/06/2026' // Éric Elter : Rajout, notamment, d'une entrée (triangle plat) dans le QCM devenu QCU

/**
 * Constructibilité des triangles
 * @author Sébastien Lozano
 */
export default class ConstructibiliteDesTriangles extends Exercice {
  exo = ''

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : 3 angles\n2 : 2 angles et le 3ème en fonction du 1er ou du 2ème\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Accepter triangle plat', false]
    this.sup = 1
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles

    let consigneAMC
    if (this.exo === '5G21-1') {
      // via longueurs
      consigneAMC =
        !this.interactif || context.isAmc
          ? 'Justifier si les longueurs données permettent de construire le triangle'
          : 'Indiquer si, avec les informations fournies, le triangle est constructible'
    } else {
      // via angles
      consigneAMC =
        !this.interactif || context.isAmc
          ? 'Justifier si les angles donnés permettent de construire le triangle'
          : 'Indiquer si, avec les informations fournies, le triangle est constructible'
    }
    this.consigne = consigneAMC + '.'
    if (this.exo === '5G21-1') {
      // via longueurs
      if (this.sup === 1) {
        typesDeQuestionsDisponibles = [1, 2, 3]
      } else if (this.sup === 3) {
        const a = randint(1, 3)
        if (this.nbQuestions === 1) typesDeQuestionsDisponibles = [4]
        else if (this.nbQuestions === 2) typesDeQuestionsDisponibles = [4, a]
        else if (this.nbQuestions === 3)
          typesDeQuestionsDisponibles = [4, a, (a % 3) + 1]
        else typesDeQuestionsDisponibles = [4, 1, 2, 3]
      } else {
        typesDeQuestionsDisponibles = [4]
      }
    } else if (this.exo === '5G31-1') {
      // via angles
      if (this.sup === 1) {
        typesDeQuestionsDisponibles = [5, 6, 7]
      } else if (this.sup === 3) {
        const a = randint(5, 7)
        if (this.nbQuestions === 1) typesDeQuestionsDisponibles = [8]
        else if (this.nbQuestions === 2) typesDeQuestionsDisponibles = [8, a]
        else if (this.nbQuestions === 3)
          typesDeQuestionsDisponibles = [8, a, ((a - 4) % 3) + 5]
        else typesDeQuestionsDisponibles = [8, 5, 6, 7]
      } else {
        typesDeQuestionsDisponibles = [8]
      }
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
    }

    if (!this.sup2) {
      enleveElement(typesDeQuestionsDisponibles, 2)
      enleveElement(typesDeQuestionsDisponibles, 6)
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte = '',
        texteCorr = '',
        l1,
        l2,
        l3,
        a1 = 0,
        a2 = 0,
        a3 = 0,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on fixe longueur min et max en cm
      const lMin = 2
      const lMax = 20
      // on fixe angle min et max en degré
      const aMin = 0
      const aMax = 180

      // on crée un objet triangle
      const triangle = new Triangle()
      // on crée un tableau pour le triangle courant
      const currentTriangle: Array<{
        valeur: number
        longueur?: string
        cote?: string
        angle?: string
      }> = []
      switch (listeTypeDeQuestions[i]) {
        case 1: // 3 longueurs constructible
          while (!triangle.isTrueTriangleLongueurs()) {
            l1 = randint(lMin, lMax)
            l2 = randint(lMin, lMax)
            l3 = randint(lMin, lMax)
            triangle.l1 = l1
            triangle.l2 = l2
            triangle.l3 = l3
          }
          texte = `${triangle.getNom()} tel que ${triangle.getLongueurs()[0]} $= ${triangle.l1}\\text{ cm}$ ; `
          texte += `${triangle.getLongueurs()[1]} $= ${triangle.l2}\\text{ cm}$ et ${triangle.getLongueurs()[2]} $= ${triangle.l3}\\text{ cm}$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              longueur: triangle.getLongueurs()[i],
              cote: triangle.getCotes()[i],
              valeur: Number(triangle.getLongueursValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[2].cote}, qui mesure $${currentTriangle[2].valeur}\\text{ cm}$, est le plus grand côté.`
          texteCorr += `<br> De plus, ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur} = $${currentTriangle[0].valeur}\\text{ cm}$ + $${currentTriangle[1].valeur}\\text{ cm}$ = $${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur)}\\text{ cm}$.`
          texteCorr += `<br> On constate que  ${currentTriangle[2].longueur} < ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur}.`
          texteCorr += "<br> L'inégalité triangulaire est vérifiée."
          break
        case 2: // 3 longueurs plat
          do {
            l1 = randint(lMin, lMax)
            l2 = randint(lMin, lMax)
            l3 = arrondi(l1 + l2)
            triangle.l1 = l1
            triangle.l2 = l2
            triangle.l3 = l3
          } while (!triangle.isPlatTriangleLongueurs())

          texte = `${triangle.getNom()} tel que ${triangle.getLongueurs()[0]} $ = ${triangle.l1}\\text{ cm}$ ; `
          texte += `${triangle.getLongueurs()[1]} $= ${triangle.l2}\\text{ cm}$ et ${triangle.getLongueurs()[2]} $= ${triangle.l3}\\text{ cm}$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              longueur: triangle.getLongueurs()[i],
              cote: triangle.getCotes()[i],
              valeur: Number(triangle.getLongueursValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[2].cote}, qui mesure $${currentTriangle[2].valeur}\\text{ cm}$, est le plus grand côté.`
          texteCorr += `<br> De plus, ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur} = $${currentTriangle[0].valeur}\\text{ cm}$ + $${currentTriangle[1].valeur}\\text{ cm}$ = $${currentTriangle[2].valeur}\\text{ cm}$ aussi.`
          texteCorr += `<br> Les points ${triangle.stringSommets} sont donc alignés.`

          break
        case 3: // 3 longueurs non constructible
          // on initialise les longueurs sinon la méthode isTrueTriangleLongueurs() renvoie false!
          l1 = randint(lMin, lMax)
          l2 = randint(lMin, lMax)
          l3 = randint(lMin, lMax)
          triangle.l1 = l1
          triangle.l2 = l2
          triangle.l3 = l3

          while (
            triangle.isTrueTriangleLongueurs() ||
            triangle.isPlatTriangleLongueurs()
          ) {
            l1 = randint(lMin, lMax)
            l2 = randint(lMin, lMax)
            l3 = randint(lMin, lMax)
            triangle.l1 = l1
            triangle.l2 = l2
            triangle.l3 = l3
          }
          texte = `${triangle.getNom()} tel que ${triangle.getLongueurs()[0]} $= ${triangle.l1}\\text{ cm}$ ; `
          texte += `${triangle.getLongueurs()[1]} $= ${triangle.l2}\\text{ cm}$ et ${triangle.getLongueurs()[2]} $= ${triangle.l3}\\text{ cm}$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              longueur: triangle.getLongueurs()[i],
              cote: triangle.getCotes()[i],
              valeur: Number(triangle.getLongueursValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[2].cote}, qui mesure $${currentTriangle[2].valeur}\\text{ cm}$, est le plus grand côté.`
          texteCorr += `<br> De plus, ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur} = $${currentTriangle[0].valeur}\\text{ cm}$ + $${currentTriangle[1].valeur}\\text{ cm}$ = $${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur)}\\text{ cm}$.`
          texteCorr += `<br> On constate que  ${currentTriangle[2].longueur} > ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur}.`
          texteCorr += "<br> L'inégalité triangulaire n'est pas vérifiée."

          break
        case 4: // 2 longueurs et le périmètre
          // on utilise la méthode isTrueTriangleLongueurs(), le triangle ne sera pas plat.
          while (!triangle.isTrueTriangleLongueurs()) {
            l1 = randint(lMin, lMax)
            l2 = randint(lMin, lMax)
            l3 = randint(lMin, lMax)
            triangle.l1 = l1
            triangle.l2 = l2
            triangle.l3 = l3
          }
          texte = `${triangle.getNom()} tel que ${triangle.getLongueurs()[0]} $= ${triangle.l1}\\text{ cm}$ ; `
          texte += `${triangle.getLongueurs()[1]} $= ${triangle.l2}\\text{ cm}$ et dont le périmètre vaut $${triangle.getPerimetre()}\\text{ cm}$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              longueur: triangle.getLongueurs()[i],
              cote: triangle.getCotes()[i],
              valeur: Number(triangle.getLongueursValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `Puisque le périmètre vaut $${triangle.getPerimetre()}\\text{ cm}$ alors la troisième longueur vaut ${triangle.getLongueurs()[2]} = $${triangle.getPerimetre()}\\text{ cm}$ - $${triangle.l1}\\text{ cm}$ - $${triangle.l2}\\text{ cm}$ = $${triangle.l3}\\text{ cm}$.`
          texteCorr += `<br> Donc, ${currentTriangle[2].cote}, qui mesure $${currentTriangle[2].valeur}\\text{ cm}$, est le plus grand côté.`
          texteCorr += `<br> De plus, ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur} = $${currentTriangle[0].valeur}\\text{ cm}$ + $${currentTriangle[1].valeur}\\text{ cm}$ = $${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur)}\\text{ cm}$.`
          texteCorr += `<br> On constate que ${currentTriangle[0].longueur} + ${currentTriangle[1].longueur} > ${currentTriangle[2].longueur}`
          texteCorr += "<br> L'inégalité triangulaire est vérifiée."
          break
        case 5: // 3 angles constructible
          while (!triangle.isTrueTriangleAngles()) {
            a1 = randint(aMin, aMax, [0, 180])
            a2 = randint(aMin, aMax, [0, 180])
            a3 = arrondi(180 - a1 - a2)
            triangle.a1 = a1
            triangle.a2 = a2
            triangle.a3 = a3
          }
          texte = ''
          texteCorr = ''
          texte = `${triangle.getNom()} tel que ${triangle.getAngles()[0]} $= ${triangle.a1}^\\circ$ ; `
          texte += `${triangle.getAngles()[1]} $= ${triangle.a2}^\\circ$ et ${triangle.getAngles()[2]} $= ${triangle.a3}^\\circ$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              angle: triangle.getAngles()[i],
              valeur: Number(triangle.getAnglesValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[0].angle} + ${currentTriangle[1].angle} + ${currentTriangle[2].angle} = $${currentTriangle[0].valeur}^\\circ + ${currentTriangle[1].valeur}^\\circ + ${currentTriangle[2].valeur}^\\circ = ${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur + currentTriangle[2].valeur)}^\\circ$.`
          texteCorr +=
            '<br> On constate que la somme des trois angles vaut bien $180^\\circ$.'
          break
        case 6: // 3 angles plat
          while (!triangle.isPlatTriangleAngles()) {
            a1 = randint(aMin, aMax)
            a2 = randint(aMin, aMax)
            a3 = arrondi(180 - a1 - a2)
            triangle.a1 = a1
            triangle.a2 = a2
            triangle.a3 = a3
          }
          texte = ''
          texteCorr = ''
          texte = `${triangle.getNom()} tel que ${triangle.getAngles()[0]} $= ${triangle.a1}^\\circ$ ; `
          texte += `${triangle.getAngles()[1]} $= ${triangle.a2}^\\circ$ et ${triangle.getAngles()[2]} $= ${triangle.a3}^\\circ$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              angle: triangle.getAngles()[i],
              valeur: Number(triangle.getAnglesValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[0].angle} + ${currentTriangle[1].angle} + ${currentTriangle[2].angle} = $${currentTriangle[0].valeur}^\\circ + ${currentTriangle[1].valeur}^\\circ + ${currentTriangle[2].valeur}^\\circ = ${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur + currentTriangle[2].valeur)}^\\circ$.`
          texteCorr +=
            '<br> On constate que la somme des trois angles du triangle vaut bien $180^\\circ$.'
          texteCorr += '<br> Deux des trois angles du triangle valent $0^\\circ$.'
          break
        case 7: // 3 angles non constructible
          // on initialise les angles sinon la méthode isTrueTriangleAngles() renvoie false!
          a1 = randint(aMin, aMax)
          a2 = randint(aMin, aMax)
          a3 = randint(aMin, aMax)
          triangle.a1 = a1
          triangle.a2 = a2
          triangle.a3 = a3
          while (triangle.isTrueTriangleAngles()) {
            a1 = randint(aMin, aMax)
            a2 = randint(aMin, aMax)
            a3 = randint(aMin, aMax)
            triangle.a1 = a1
            triangle.a2 = a2
            triangle.a3 = a3
          }
          texte = `${triangle.getNom()} tel que ${triangle.getAngles()[0]} $= ${triangle.a1}^\\circ$ ; `
          texte += `${triangle.getAngles()[1]} $= ${triangle.a2}^\\circ$ et ${triangle.getAngles()[2]} $= ${triangle.a3}^\\circ$.`
          // on crée l'objet longueurs + valeurs des côtés du triangle
          for (let i = 0; i < 3; i++) {
            currentTriangle.push({
              angle: triangle.getAngles()[i],
              valeur: Number(triangle.getAnglesValeurs()[i]),
            })
          }
          // on trie les couples longueurs/valeurs du triangle selon les valeurs croissantes.
          currentTriangle.sort(function (a, b) {
            return a.valeur - b.valeur
          })
          texteCorr = `${currentTriangle[0].angle} + ${currentTriangle[1].angle} + ${currentTriangle[2].angle} = $${currentTriangle[0].valeur}^\\circ + ${currentTriangle[1].valeur}^\\circ + ${currentTriangle[2].valeur}^\\circ = ${arrondi(currentTriangle[0].valeur + currentTriangle[1].valeur + currentTriangle[2].valeur)}^\\circ$.`
          texteCorr +=
            '<br> Si le triangle était constructible, la somme des trois angles vaudrait $180^\\circ$,'
          texteCorr += " or ce n'est pas le cas."
          break
        case 8: {
          // 2 angles et le 3e fonction du 1er ou du 2eme
          const angleRg = randint(0, 1)
          const operationsPossibles = ['triple', 'quadruple', 'quart']
          let operation = ''
          texte = ''
          texteCorr = ''
          texteCorr = ''
          switch (angleRg) {
            case 0:
              // 0° ou 180° ne donne pas un vrai triangle. On ramène ces valeurs à 1° et 179°
              // sans nouveau tirage, pour ne pas décaler les questions suivantes.
              a1 = Math.min(Math.max(randint(aMin, aMax), 1), 179)
              triangle.a1 = a1
              operation = operationsPossibles[randint(0, 2)]
              texte += `${triangle.getNom()} tel que ${triangle.getAngles()[0]} $= ${texNombre(triangle.a1)}^\\circ$ ; `
              switch (operation) {
                case 'triple':
                  a2 = (180 - a1) / 4
                  a3 = 3 * a2
                  break
                case 'quadruple':
                  a2 = (180 - a1) / 5
                  a3 = 4 * a2
                  break
                case 'quart':
                  a2 = (4 * (180 - a1)) / 5
                  a3 = a2 / 4
                  break
              }
              triangle.a2 = a2
              triangle.a3 = a3
              texte += `${triangle.getAngles()[1]} $= ${texNombre(triangle.a2)}^\\circ$ et ${triangle.getAngles()[2]} est le ${operation} de ${triangle.getAngles()[1]}.`
              // on crée l'objet longueurs + valeurs des côtés du triangle
              for (let i = 0; i < 3; i++) {
                currentTriangle.push({
                  angle: triangle.getAngles()[i],
                  valeur: Number(triangle.getAnglesValeurs()[i]),
                })
              }
              texteCorr += `${currentTriangle[2].angle} est le ${operation} de ${currentTriangle[1].angle} = $${texNombre(currentTriangle[1].valeur)}^\\circ$  d'où ${currentTriangle[2].angle} = $${texNombre(currentTriangle[2].valeur)}^\\circ$.`
              break
            case 1:
              // 0° ou 180° ne donne pas un vrai triangle. On ramène ces valeurs à 1° et 179°
              // sans nouveau tirage, pour ne pas décaler les questions suivantes.
              a2 = Math.min(Math.max(randint(aMin, aMax), 1), 179)
              triangle.a2 = a2
              operation = operationsPossibles[randint(0, 2)]
              texte += `${triangle.getNom()} tel que ${triangle.getAngles()[1]} $= ${texNombre(triangle.a2)}^\\circ$ ; `
              switch (operation) {
                case 'triple':
                  a1 = (180 - a2) / 4
                  a3 = 3 * a1
                  break
                case 'quadruple':
                  a1 = (180 - a2) / 5
                  a3 = 4 * a1
                  break
                case 'quart':
                  a1 = (4 * (180 - a2)) / 5
                  a3 = a1 / 4
                  break
              }
              triangle.a1 = a1
              triangle.a3 = a3
              texte += `${triangle.getAngles()[0]} $= ${texNombre(triangle.a1)}^\\circ$ et ${triangle.getAngles()[2]} est le ${operation} de ${triangle.getAngles()[0]}.`
              // on crée l'objet longueurs + valeurs des côtés du triangle
              for (let i = 0; i < 3; i++) {
                currentTriangle.push({
                  angle: triangle.getAngles()[i],
                  valeur: Number(triangle.getAnglesValeurs()[i]),
                })
              }
              texteCorr += `${currentTriangle[2].angle} est le ${operation} de ${currentTriangle[0].angle} = $${texNombre(currentTriangle[0].valeur)}^\\circ$  d'où ${currentTriangle[2].angle} = $${texNombre(currentTriangle[2].valeur)}^\\circ$.`
              break
          }
          texteCorr += `<br>Donc ${currentTriangle[0].angle} + ${currentTriangle[1].angle} + ${currentTriangle[2].angle} = $${texNombre(currentTriangle[0].valeur)}^\\circ + ${texNombre(currentTriangle[1].valeur)}^\\circ + ${texNombre(currentTriangle[2].valeur)}^\\circ = ${texNombre(currentTriangle[0].valeur + currentTriangle[1].valeur + currentTriangle[2].valeur)}^\\circ$.`
          texteCorr +=
            '<br> On constate que la somme des trois angles vaut bien $180^\\circ$.'
          break
        }
      }
      if (this.questionJamaisPosee(i, triangle.getNom())) {
        // Si la question n'a jamais été posée, on en créé une autre
        const propositionsDuQcm = [
          {
            texte: `Le triangle ${triangle.getNom()} est constructible mais n'est pas plat.`,
            statut:
              listeTypeDeQuestions[i] === 1 ||
              listeTypeDeQuestions[i] === 4 ||
              listeTypeDeQuestions[i] === 5 ||
              listeTypeDeQuestions[i] === 8,
            feedback:
              this.exo === '5G21-1'
                ? 'Effectue la somme des longueurs les plus petites et compare-la à la plus grande longueur.'
                : 'Effectue la somme des angles du triangle.',
          },
          {
            texte: `Le triangle ${triangle.getNom()} est plat.`,
            statut:
              listeTypeDeQuestions[i] === 2 || listeTypeDeQuestions[i] === 6,
            feedback:
              this.exo === '5G21-1'
                ? 'Effectue la somme des longueurs les plus petites et compare-la à la plus grande longueur.'
                : 'Effectue la somme des angles du triangle.',
          },
          {
            texte: `Le triangle ${triangle.getNom()} n'est pas constructible.`,
            statut:
              listeTypeDeQuestions[i] === 3 || listeTypeDeQuestions[i] === 7,
            feedback:
              this.exo === '5G21-1'
                ? 'Effectue la somme des longueurs les plus petites et compare-la à la plus grande longueur.'
                : 'Effectue la somme des angles du triangle.',
          },
          {
            texte: `On ne peut pas savoir si le triangle ${triangle.getNom()} est constructible ou pas.`,
            statut: false,
            feedback:
              this.exo === '5G21-1'
                ? 'Effectue la somme des longueurs les plus petites et compare-la à la plus grande longueur.'
                : 'Effectue la somme des angles du triangle.',
          },
        ]

        this.autoCorrection[i] = {
          enonce: texte,
          propositions: propositionsDuQcm,
          options: {
            vertical: true,
            ordered: false, // (si les réponses doivent rester dans l'ordre ci-dessus, false s'il faut les mélanger),
            radio: true,
            lastChoice: 2, // (en cas de mélange, l'index à partir duquel les propositions restent à leur place, souvent le dernier choix par défaut)
          },
        }
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: consigneAMC + ' :<br>' + texte,
            options: { numerotationEnonce: true }, // facultatif.
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    numQuestionVisible: false,
                    statut: 2, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    //   enonce: ' Justifier la réponse.' // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  },
                ],
              },
              {
                type: 'qcmMono',
                enonce:
                  'Suite à votre justification, noircir la case adéquate parmi les suivantes :',
                propositions: propositionsDuQcm,
                options: {
                  ordered: false, // (si les réponses doivent rester dans l'ordre ci-dessus, false s'il faut les mélanger),
                  lastChoice: 2, // (en cas de mélange, l'index à partir duquel les propositions restent à leur place, souvent le dernier choix par défaut)
                },
              },
            ],
          }
        }
        const props = propositionsQcm(this, i)
        if (this.interactif) {
          texte += props.texte
        }
        this.listeQuestions[i] = texte
        // La bonne proposition, en orange, ouvre la correction
        const bonneProposition = propositionsDuQcm
          .find((proposition) => proposition.statut)!
          .texte.split('$')
          .map((morceau, index) =>
            index % 2 === 1
              ? `$${miseEnEvidence(morceau)}$`
              : texteEnCouleurEtGras(morceau),
          )
          .join('')
        this.listeCorrections[i] =
          `${bonneProposition}<br>Explications :<br>${texteCorr}`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
