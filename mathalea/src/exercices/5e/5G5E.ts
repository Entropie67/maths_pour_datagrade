import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { bissectrice } from '../../lib/2d/Bissectrice'
import { codageBissectrice } from '../../lib/2d/CodageBissectrice'
import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { rotation, similitude } from '../../lib/2d/transformations'
import {
  codageHauteurTriangle,
  codageMedianeTriangle,
} from '../../lib/2d/triangles'
import {
  centreGraviteTriangle,
  hauteurTriangle,
  medianeTriangle,
} from '../../lib/2d/utilitairesTriangle'
import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import Exercice from '../Exercice'

export const titre = "Déterminer la nature d'une droite remarquable - $1$"
export const interactifReady = true

export const dateDeModifImportante = '25/04/2026' // Rémi Angot ajout interactivité

/**
 * 5G22
 * @author Jean-claude Lhote
 * Les droites remarquables du triangle : hauteurs médiatrices....médianes et bissectrices
 */
export const uuid = '796f3'

export const refs = {
  'fr-fr': ['5G5E'],
  'fr-2016': ['5G22'],
  'fr-ch': ['9R1ES2E-1', '9R2ES2E-1', '9R3ES2E-1', 'PRQES02A-5'],
}
export default class DroiteRemarquableDuTriangle extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de droites',
      3,
      '1 : Hauteurs et Médiatrices\n2 : Médianes et Bissectrices\n3 : Mélange',
    ]

    this.spacing = 2
    this.nbQuestions = 1

    this.sup = 1
  }

  nouvelleVersion() {
    const triangles = []
    const sommets: string[][] = []
    const A = []
    const B = []
    const C = []
    const t = []
    const d = []
    const n = []
    const c = []
    const objets = []
    let A0, B0, C0, G
    let typesDeQuestionsDisponibles
    if (this.sup === 1) typesDeQuestionsDisponibles = [1, 2]
    else if (this.sup === 2) typesDeQuestionsDisponibles = [3, 4]
    else typesDeQuestionsDisponibles = [1, 2, 3, 4]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, a, angle, rapport, texte, texteCorr;
      i < this.nbQuestions;
    ) {
      // this.nbQuestions && cpt<50;) { // On limite le nombre d'essais pour chercher des valeurs nouvelles
      triangles[i] = new Triangle()
      sommets[i] = triangles[i].getSommets(false)

      A0 = pointAbstrait(3, randint(1, 2))
      B0 = pointAbstrait(6, randint(1, 2))
      angle = choice([50, 60, 70, 75, 80, 100, 110, 120])
      rapport = randint(7, 13) / 10
      C0 = similitude(B0, A0, angle, rapport)
      G = centreGraviteTriangle(A0, B0, C0)
      a = randint(0, 30) * 12 - 180
      A[i] = rotation(A0, G, a, sommets[i][0], 'below left')
      B[i] = rotation(B0, G, a, sommets[i][1], 'below right')
      C[i] = rotation(C0, G, a, sommets[i][2], 'above')
      t[i] = polygone(A[i], B[i], C[i])
      n[i] = nommePolygone(
        t[i],
        `${sommets[i][0]}${sommets[i][1]}${sommets[i][2]}`,
      )
      const choix = [
        { label: 'Choisir une réponse :', value: '' },
        { label: 'une hauteur', value: 'hauteur' },
        { label: 'une médiatrice', value: 'mediatrice' },
        { label: 'une médiane', value: 'mediane' },
        { label: 'une bissectrice', value: 'bissectrice' },
      ]
      let rep: string
      switch (listeTypeDeQuestions[i]) {
        case 1:
          d[i] = hauteurTriangle(C[i], B[i], A[i], bleuMathalea)
          d[i].epaisseur = 1
          c[i] = codageHauteurTriangle(C[i], B[i], A[i])
          objets[i] = [t[i], d[i], n[i], c[i]]
          texteCorr = `La droite tracée est la ${texteEnCouleurEtGras('hauteur')} issue de $${sommets[i][2]}$ dans le triangle ${triangles[i].getNom()}.<br>`
          rep = 'hauteur'
          break
        case 2:
          d[i] = mediatrice(A[i], B[i], '', bleuMathalea)
          d[i].epaisseur = 1
          c[i] = codageMediatrice(A[i], B[i])
          objets[i] = [t[i], d[i], n[i], c[i]]
          texteCorr = `La droite tracée est la ${texteEnCouleurEtGras('médiatrice')} du segment [$${sommets[i][0]}${sommets[i][1]}]$.<br>`
          rep = 'mediatrice'
          break
        case 3:
          d[i] = medianeTriangle(C[i], B[i], A[i], bleuMathalea)
          d[i].epaisseur = 1
          c[i] = codageMedianeTriangle(B[i], A[i], 'black', '//')
          objets[i] = [t[i], d[i], n[i], c[i]]
          texteCorr = `La droite tracée est la ${texteEnCouleurEtGras('médiane')} issue de $${sommets[i][2]}$ dans le triangle ${triangles[i].getNom()}.<br>`
          rep = 'mediane'
          break
        case 4:
        default:
          d[i] = bissectrice(A[i], B[i], C[i], bleuMathalea)
          d[i].epaisseur = 1
          c[i] = codageBissectrice(A[i], B[i], C[i])
          objets[i] = [t[i], d[i], n[i], c[i]]
          texteCorr = `La droite tracée est la ${texteEnCouleurEtGras('bissectrice')} de l'angle $\\widehat{${sommets[i][0]}${sommets[i][1]}${sommets[i][2]}}$.<br>`
          rep = 'bissectrice'
          break
      }

      texte =
        `Quelle est la nature de la droite tracée en bleu dans le triangle ${triangles[i].getNom()} ?<br>` +
        mathalea2d(
          {
            xmin: -3,
            ymin: -3,
            xmax: 8,
            ymax: 8,
            scale: 0.5,
            pixelsParCm: 20,
          },
          ...objets[i],
        )
      if (this.interactif) {
        texte +=
          '<br>La droite tracée en bleu est ' +
          choixDeroulant(this, i, { choices: choix }) +
          '.'
        handleAnswers(
          this,
          i,
          { reponse: { value: rep, options: { texteSansCasse: true } } },
          { formatInteractif: 'liste-deroulante' },
        )
      }

      if (this.questionJamaisPosee(i, angle, rapport, a)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
