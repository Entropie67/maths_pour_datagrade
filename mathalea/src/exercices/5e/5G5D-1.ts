import { afficheCoteSegment } from '../../lib/2d/AfficheCoteSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { rotation } from '../../lib/2d/transformations'
import { triangle2points1hauteur } from '../../lib/2d/triangles'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer l'aire de triangles"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDeModifImportante = '21/10/2026'

/**
 * Calculer l'aire de 3 triangles dont une hauteur est tracée.
 *
 * Une figure dynamique est disponible sur laquelle on peut déplacer le pied de la hauteur.
 *
 * @author Rémi Angot conversion mathalea2d Jean-claude Lhote
 * Ajout de la possibilité de choisir le nombre de questions par Guillaume Valmont le 08/05/2022
 */
export const uuid = '06b1a'

export const refs = {
  'fr-fr': ['5G5D-1', 'BP1AUTO099'],
  'fr-2016': ['6M20', '5M10-1'],
  'fr-ch': ['9R1GM2B-2', '9R2GM2B-2', '9R3GM2B-2', 'PRQMG01A-2', 'PRQMG01B-3'],
}
export default class AireDeTriangles extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de triangles',
      4,
      '1 : Que des triangles sans angle obtus\n2 : Que des triangles avec un angle obtus\n3 : Mélange',
    ]

    this.spacing = 2

    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 3

    this.sup = 3

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const tableauDesCotes = shuffle([5, 6, 7, 8, 9]) // pour s'assurer que les 3 côtés sont différents
    const tableauDesHauteurs = shuffle([3, 4, 5, 6]) // pour s'assurer que les 3 hauteurs sont différents
    const cotes = combinaisonListesSansChangerOrdre(
      tableauDesCotes,
      this.nbQuestions,
    )
    const hauteurs = combinaisonListesSansChangerOrdre(
      tableauDesHauteurs,
      this.nbQuestions,
    )
    let triH
    const A = pointAbstrait(0, 0)
    let B
    let C
    let H
    let triangle
    let polynom
    let hauteurpoly
    let d
    const objetsEnonce = []
    const objetsCorrection = []
    let xmin
    let xmax
    let ymin
    let ymax

    const NB_LETTRES = 20
    const nom = creerNomDePolygone(NB_LETTRES, 'QD')

    const typeQuestionsDisponibles =
      this.sup === 3
        ? ['intérieur', 'extérieur']
        : this.sup === 1
          ? ['intérieur']
          : ['extérieur']

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objetsEnonce.length = 0
      objetsCorrection.length = 0
      A.nom = nom[(i * 4) % NB_LETTRES]
      do {
        B = rotation(
          pointAbstrait(cotes[i], 0),
          A,
          randint(-60, 60),
          nom[(i * 4 + 1) % NB_LETTRES],
        )
        if (listeTypeQuestions[i] === 'extérieur') {
          d = longueur(A, B) + randint(6, 9) / 3
        } else {
          d = randint(6, Math.round(longueur(A, B) * 10 - 6)) / 10
        }
        triH = triangle2points1hauteur(A, B, hauteurs[i], d, 2)
        H = triH.pied
        triangle = triH.triangle
        C = triangle.listePoints[2]
      } while (
        Math.abs(longueur(H, C) - longueur(B, C)) < 0.2 ||
        Math.abs(longueur(H, C) - longueur(A, C)) < 0.2
      ) // EE : Pour éviter que la hauteur ait la même longueur arrondie que les segments issus du même sommet que celui de la hauteur.
      // Alterner les orientations sans ajouter de tirage aléatoire : les mesures
      // et les questions suivantes restent identiques pour les liens partagés.
      if (i % 3 !== 0) {
        const baseAngle = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI
        const targetAngle = (i % 3 === 1 ? 180 : 90) + baseAngle / 6
        const angle = targetAngle - baseAngle
        B = rotation(B, A, angle, B.nom)
        C = rotation(C, A, angle, C.nom)
        H = rotation(H, A, angle, H.nom)
      }
      H.nom = nom[(i * 4 + 3) % NB_LETTRES]
      C.nom = nom[(i * 4 + 2) % NB_LETTRES]
      polynom = polygoneAvecNom(A, H, B, C)
      hauteurpoly = segment(C, H)
      hauteurpoly.pointilles = 2
      xmin = Math.min(A.x, B.x, C.x, H.x) - 1.5
      xmax = Math.max(A.x, B.x, C.x, H.x) + 1.5
      ymin = Math.min(A.y, B.y, C.y, H.y) - 2
      ymax = Math.max(A.y, B.y, C.y, H.y) + 1.5
      objetsEnonce.push(
        polynom[0],
        polynom[1],
        hauteurpoly,
        afficheCoteSegment(
          segment(B, A),
          `${texNombre(longueur(B, A), 0)}\\,\\text{cm}`,
          1,
        ),
        placeLatexSurSegment(
          `${texNombre(segment(A, C).longueur, 1)}\\,\\text{cm}`,
          A,
          C,
        ),
        placeLatexSurSegment(
          `${texNombre(segment(C, B).longueur, 1)}\\,\\text{cm}`,
          C,
          B,
        ),
        placeLatexSurSegment(
          `${texNombre(segment(C, H).longueur, 1)}\\,\\text{cm}`,
          C,
          H,
          {
            distance: 0.3,
          },
        ),
        codageAngleDroit(A, H, C),
      )
      objetsCorrection.push(
        polynom[0],
        polynom[1],
        hauteurpoly,
        afficheCoteSegment(
          segment(B, A),
          `${texNombre(longueur(B, A), 0)}\\,\\text{cm}`,
          1,
        ),
        placeLatexSurSegment(
          `${texNombre(segment(C, H).longueur, 1)}\\,\\text{cm}`,
          C,
          H,
          {
            distance: 0.3,
          },
        ),
        codageAngleDroit(A, H, C),
      )
      texte = `Calculer l'aire du triangle ${A.nom}${B.nom}${C.nom}.<br>`
      texte += mathalea2d(
        {
          xmin,
          xmax,
          ymin,
          ymax,
          pixelsParCm: 20,
          scale: 0.5,
          mainlevee: false,
        },
        objetsEnonce,
      )
      if (this.correctionDetaillee) {
        texteCorr = mathalea2d(
          {
            xmin,
            xmax,
            ymin,
            ymax,
            pixelsParCm: 20,
            scale: 0.5,
            mainlevee: false,
          },
          objetsCorrection,
        )
      } else texteCorr = ''
      texteCorr += `$\\mathcal{A}_{${A.nom}${B.nom}${C.nom}}=\\dfrac{1}{2}\\times ${A.nom}${B.nom}\\times ${H.nom}${C.nom}=\\dfrac{1}{2}\\times${cotes[i]}\\text{ cm}\\times ${hauteurs[i]}\\text{ cm}=${miseEnEvidence(
        texNombre((cotes[i] * hauteurs[i]) / 2) + '\\text{ cm}^2',
      )}$`
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: new Grandeur(
              arrondi((cotes[i] * hauteurs[i]) / 2, 3),
              'cm^2',
            ),
            options: { unite: true, precisionUnite: 3 },
          },
        },
        { formatInteractif: 'mathlive' },
      )
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.aire, {
        texteAvant: `Aire du triangle ${A.nom}${B.nom}${C.nom} :`,
        texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
      })
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            texte + `<br>Aire de ${A.nom}${B.nom}${C.nom} en $\\text{cm}^2$ :`, // Si vide, l'énoncé est celui de l'exercice.
          propositions: [
            {
              texte: texteCorr,
            },
          ],
          reponse: {
            valeur: arrondi((cotes[i] * hauteurs[i]) / 2), // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
            param: {
              signe: false,
              decimals: 1,
              approx: 0,
            },
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Supprime b, c et d dans la ligne ci-dessus et remplace les par NombreAAjouter !
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
