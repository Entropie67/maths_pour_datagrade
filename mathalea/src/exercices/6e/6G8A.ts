import {
  createCubesProjections,
  projectionCubesIso2d,
} from '../../lib/3d/3dProjectionMathalea2d/CubeIso'
import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  canvasEnonceCorrection,
  empilementCubes,
} from '../../lib/3d/3d_dynamique/empilementsCube'
import {
  choice,
  compteOccurences,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Dessiner différentes vues d'un empilement de cubes"
export const dateDePublication = '06/10/2022'
export const dateDeModifImportante = '08/11/2023' // Retour du formulaire numérique en supprimant le tooltip

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Dessiner différentes vues d'un empilement de cubes
 * @author Éric Elter
 *  (sur un début d'exercices d'Erwan Duplessy)
 * Source : http://cache.media.education.gouv.fr/file/Geometrie_et_espace/47/1/RA16_C4_MATH_geo_espace_flash_567471.pdf
 */

export const uuid = '136dd'

export const refs = {
  'fr-fr': ['6G8A'],
  'fr-2016': ['3G41'],
  'fr-ch': ['9R1ES3C-2', '9R2ES3C-2', '9R3ES3C-2', 'PRQES06C-2'],
}
export default class VuesEmpilementCubes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Longueur, largeur et hauteur sous la forme abc',
      'a étant la longueur du solide (a>1)\nb étant la largeur du solide (b>1)\nc étant sa hauteur du solide (c>1)\n Choisir 0 ou 1 si on souhaite laisser le hasard faire.',
    ]
    this.besoinFormulaire2Texte = [
      'Vues possibles dans les questions ',
      'Nombres séparés par des tirets :\n1 : Gauche\n2 : Droite\n3 : Dessus\n4 : Dessous \n5 : Face\n6 : Dos\n7 : 3 faces non parallèles',
    ]
    // 'De 1 à 6\nSi le nombre de vues demandé est supérieur au nombre de vues possible, alors des vues autres que celles choisies sont proposées.'
    this.besoinFormulaire3Numerique = ['Nombre de vues demandé', 6]

    this.besoinFormulaire4CaseACocher = ['3D dynamique', false]
    this.sup4 = false

    this.sup = 1
    this.sup2 = 7
    this.sup3 = 3
    this.nbQuestions = 2
    this.consigne = ''
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      if (this.sup4 && context.isHtml) {
        this.consigne = 'Voici un solide composé par un empilement de cubes.'
      } else {
        this.consigne =
          'Voici un solide composé par un empilement de cubes, présenté de deux façons différentes.'
      }
    } else {
      if (this.sup4 && context.isHtml) {
        this.consigne =
          'Dans chacun des cas ci-dessous, un solide composé par un empilement de cubes est proposé.'
      } else {
        this.consigne =
          'Dans chacun des cas ci-dessous, un solide composé par un empilement de cubes est présenté de deux façons différentes.'
      }
    }
    const dimensionsTab = gestionnaireFormulaireTexte({
      max: 999,
      defaut: 1,
      nbQuestions: 1,
      saisie: this.sup,
      shuffle: false,
      melange: 1,
    })
    let dimensions = Number(dimensionsTab[0])
    if ((dimensions > 1 && dimensions < 100) || dimensions > 999) dimensions = 1

    for (
      let q = 0,
        vuePossible = 0,
        alpha = 0,
        beta = 0,
        consigneAMC,
        texteAMC,
        texte,
        texteCorr,
        cpt = 0;
      q < this.nbQuestions && cpt < 50;
    ) {
      let listeVuesPossibles = gestionnaireFormulaireTexte({
        max: 7,
        defaut: 7,
        nbQuestions: this.nbQuestions,
        saisie: this.sup2,
        shuffle: false,
        melange: 7,
      }).map(Number)

      if (compteOccurences(listeVuesPossibles, 7) > 0) {
        listeVuesPossibles = shuffle([
          randint(1, 2),
          randint(3, 4),
          randint(5, 6),
        ])
      } else {
        listeVuesPossibles = enleveDoublonNum(listeVuesPossibles)
        listeVuesPossibles = shuffle(listeVuesPossibles)
      }
      for (let ee = 1; ee < 7; ee++) {
        if (!listeVuesPossibles.includes(ee)) listeVuesPossibles.push(ee)
      }
      listeVuesPossibles = listeVuesPossibles.map((x) => x - 1)

      texte = ''
      texteCorr = ''

      const vue: Array<[string, number, number]> = [
        ['gauche', 90, 0],
        ['droite', -90, 0],
        ['dessus', 0, -90],
        ['dessous', 0, 90],
        ['face', 0, 0],
        ['dos', 180, 0],
      ]
      const colorD = context.isAmc
        ? choice(['white', 'gray', 'darkgray'])
        : choice(['red', 'blue', 'green', 'gray'])
      const colorT = context.isAmc
        ? choice(['white', 'gray', 'darkgray'], [colorD])
        : choice(['white', 'yellow'])
      const colorG = context.isAmc
        ? choice(['white', 'gray', 'darkgray'], [colorD, colorT])
        : choice(['red', 'blue', 'green', 'gray'], [colorD])
      const longueur =
        Math.floor((dimensions % 100) / 10) < 2
          ? randint(2, 6)
          : Math.floor((dimensions % 100) / 10)
      const largeur =
        Math.floor(dimensions / 100) < 2
          ? randint(2, 6)
          : Math.floor(dimensions / 100)
      const hauteur = dimensions % 10 < 2 ? randint(2, 6) : dimensions % 10
      const L = empilementCubes(longueur, largeur, hauteur)
      if (!this.sup4 || !context.isHtml) {
        // 3d iso avec mathalea2d (2 vues)
        texte += ''
        const { figure } = createCubesProjections(L, largeur, longueur, hauteur)

        texte += figure + '<br>'
      } else {
        // 3d dynamique avec Canvas3DElement (1 vue qui tourne)
        texte += ''
        const { canvasEnonce } = canvasEnonceCorrection(
          L,
          `SceneEx${this.numeroExercice}Q${q}`,
        )
        texte += canvasEnonce + '<br>'
      }

      consigneAMC = texte
      if (context.isAmc) {
        const autoCorrection = {
          enonce: consigneAMC + '<br>',
          propositions: [],
        }
        this.autoCorrectionAMC[q] = autoCorrection
      }
      for (let ee = 0; ee < this.sup3; ee++) {
        vuePossible = listeVuesPossibles[ee] ?? 0 // pouvait être undefined.
        texteAMC = this.sup3 > 1 ? numAlpha(ee) + ' ' : ''
        texteAMC += `Dessiner la vue de ${vue[vuePossible][0]} de ce solide.`
        texte += texteAMC + '<br>'
        // correction :
        texteCorr += this.sup3 > 1 ? numAlpha(ee) + ' ' : ''
        texteCorr += `Voici la vue de ${vue[vuePossible][0]} de ce solide. <br>`
        alpha = vue[vuePossible][1]
        beta = vue[vuePossible][2]
        const { objets, params } = projectionCubesIso2d(L, alpha, beta, false, {
          colorD,
          colorT,
          colorG,
        })
        texteCorr += mathalea2d(params, objets) + '<br>'
        if (context.isAmc) {
          const autoCorrection = this.autoCorrectionAMC[q]
          if (autoCorrection?.propositions === undefined) continue
          autoCorrection.propositions.push({
            type: 'AMCOpen',
            propositions: [
              {
                texte: ' ',
                statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                enonce: texteAMC, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                pointilles: false,
              },
            ],
          })
        }
      }
      if (context.isAmc) {
        this.questionsAMC[q] = amcConvert(this.autoCorrectionAMC[q])
      }
      if (this.questionJamaisPosee(q, JSON.stringify(L))) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
