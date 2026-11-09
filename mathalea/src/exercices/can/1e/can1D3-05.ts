import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { choixDeroulant } from '../../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { tableauSignesFonction } from '../../../lib/mathFonctions/etudeFonction'
import { spline, type NoeudSpline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const interactifReady = true

export const titre =
  "Dresser le tableau de signes d'une fonction dérivée à partir d'un graphique"
export const dateDePublication = '18/11/2023'
export const dateDeModifImportante = '08/10/2025'
export const uuid = 'ad915'

export const refs = {
  'fr-fr': ['can1D3-05', '1Tec-D23'],
  'fr-ch': [],
}
// une liste de nœuds pour définir une fonction Spline
/**
 * @author Gilles Mora
 */
export default class SignesTabGSpline extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une figure ou un tableau.
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const noeuds1: NoeudSpline[] = [
      { x: -4, y: -1, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
      { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: 1, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
    ]
    const noeuds2: NoeudSpline[] = [
      { x: -6, y: -2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
      { x: -5, y: 0, deriveeGauche: 2, deriveeDroit: 3, isVisible: true },
      { x: -4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: -1, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 0, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 1, y: 3, deriveeGauche: 3, deriveeDroit: 3, isVisible: true },
      { x: 2, y: 5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: 4, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
      { x: 4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 5, y: 4, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 6, y: 5, deriveeGauche: 0.2, deriveeDroit: 0.2, isVisible: true },
    ]

    const noeuds3: NoeudSpline[] = [
      { x: -6, y: -4, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
      { x: 6, y: -3, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
    ]

    const noeuds4: NoeudSpline[] = [
      { x: -6, y: 3, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -5, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -4, y: 2, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
      { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1.5, isVisible: true },
      { x: 0, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 1, y: -1, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
      { x: 2, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: -3, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
    ]

    // une liste des listes
    const mesFonctions = [noeuds1, noeuds2, noeuds3, noeuds4]
    function aleatoiriseCourbe(listeFonctions: NoeudSpline[][]) {
      const coeffX = choice([-1, 1]) // symétries ou pas
      const coeffY = choice([-1, 1])
      const deltaX = randint(-2, +2) // translations
      const deltaY = 0
      const choix = choice(listeFonctions)
      return choix.map((noeud) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
    }

    for (
      let i = 0, cpt = 0, texte = '', texteCorr = '';
      i < this.nbQuestions && cpt < 50;
    ) {
      let bornes: { xMin: number; xMax: number; yMin: number; yMax: number } = {
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 0,
      }

      const o = texteParPosition('O', -0.3, -0.3)
      const nuage = aleatoiriseCourbe(mesFonctions)
      const maSpline = spline(nuage)
      bornes = maSpline.trouveMaxes()

      const fonctionD = maSpline.derivee
      const { xMin, xMax, yMin, yMax } = bornes
      const tableau = tableauSignesFonction(maSpline.fonction, xMin, xMax, {
        step: 1,
        tolerance: 0.1,
        nomVariable: 'x',
        nomFonction: 'f^\\prime(x)',
      })
      const tableauD = tableauSignesFonction(fonctionD, xMin, xMax, {
        step: 1,
        tolerance: 0.1,
        nomVariable: 'x',
        nomFonction: 'f^\\prime(x)',
      })
      const choixInteractif = choice([tableau, tableauD])
      const repere1 = repere({
        xMin: bornes.xMin - 1,
        xMax: bornes.xMax + 1,
        yMin: bornes.yMin - 1,
        yMax: bornes.yMax + 1,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: bornes.yMin - 1,
        grilleSecondaireYMax: bornes.yMax + 1,
        grilleSecondaireXMin: bornes.xMin - 1,
        grilleSecondaireXMax: bornes.xMax + 1,
      })
      const courbe1 = maSpline.courbe({
        epaisseur: 1.5,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 2,
          style: 'x',
          epaisseur: 2,
        },
        color: bleuMathalea,
      })
      const objetsEnonce = [repere1, courbe1]

      texte =
        `On donne la représentation graphique d'une fonction $f$. <br>
    Dresser le tableau de signes de sa fonction dérivée $f^\\prime$.<br>` +
        mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.55, center: !context.isHtml },
            { xmin: xMin - 1, ymin: yMin - 1, xmax: xMax + 1, ymax: yMax + 1 },
          ),
          objetsEnonce,
          o,
        )
      if (this.interactif) {
        texte = "Voici la représentation graphique d'une fonction $f$ :<br>"
        texte += mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.55, center: !context.isHtml },
            { xmin: xMin - 1, ymin: yMin - 1, xmax: xMax + 1, ymax: yMax + 1 },
          ),
          objetsEnonce,
          o,
        )
        texte +=
          '<br>Le tableau de signes de la fonction $f^\\prime$ est : <br>'
        texte += choixInteractif
        texte +=
          '<br> Réponse : ' +
          choixDeroulant(this, i, {
            choices: [
              { label: 'Choisir la réponse', value: '' },
              { label: 'Vrai', value: 'Vrai' },
              { label: 'Faux', value: 'Faux' },
            ],
          })
        handleAnswers(this, i, {
          reponse: {
            value: choixInteractif === tableauD ? 'Vrai' : 'Faux',
          },
        })
        texteCorr = `L'ensemble de définition de $f$ est $[${maSpline.x[0]}\\,;\\,${maSpline.x[maSpline.n - 1]}]$.<br>
    Lorsque la fonction $f$ est croissante, $f^\\prime$ est positive et lorsque $f$ est décroissante, $f^\\prime$ est négative.<br>`
        if (choixInteractif === tableau) {
          texteCorr +=
            'Voici le tableau de signes de $f^\\prime(x)$ sur son ensemble de définition :<br> '
          texteCorr += tableauD
        } else {
          texteCorr +=
            'Ce tableau de signe est bien celui de la dérivée de $f$. A ne pas confondre avec le tableau de signe de $f$ : <br>'
          texteCorr += tableauSignesFonction(maSpline.fonction, xMin, xMax, {
            step: 1,
            tolerance: 0.1,
            nomVariable: 'x',
            nomFonction: 'f(x)',
          })
        }
      } else {
        texteCorr = `L'ensemble de définition de $f$ est $[${maSpline.x[0]}\\,;\\,${maSpline.x[maSpline.n - 1]}]$.<br>
    Lorsque la fonction $f$ est croissante, $f^\\prime$ est positive et lorsque $f$ est décroissante, $f^\\prime$ est négative. Le tableau de signe de $f^\\prime$ est donc<br>`
        texteCorr += tableauD
      }
      if ((this.questionJamaisPosee(i), tableau)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
