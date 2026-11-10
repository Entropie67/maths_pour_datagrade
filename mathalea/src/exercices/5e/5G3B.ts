import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../lib/2d/polygones'
import { representant } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  rotation,
  symetrieAxiale,
  translation,
  translation2Points,
} from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { orangeMathalea } from '../../lib/colors'
import ListeDeroulanteElement from '../../lib/customElements/ListeDeroulanteElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Utiliser les propriétés de conservation des longueurs et des angles'
export const interactifReady = true

export const dateDePublication = '12/01/2026'

/**
 * Annoter une figure en utilisant les propriétés de conservation de la symétrie et de la translation
 * @author Jean-claude Lhote
 */
export const uuid = '07d1b'

export const refs = {
  'fr-fr': ['5G3B'],
  'fr-2016': ['5G13-1'],
  'fr-ch': ['10CTES2C-2', '10LCES2C-2', '10LSES2C-2'],
}
export default class ConservationTransformation extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 2

    this.besoinFormulaireTexte = [
      'Transformations',
      'Nombres séparés par des tirets\n1 : Symétrie axiale\n2 : Symétrie centrale\n3 : Translation\n4 : Rotation\n5 : Mélange',
    ]
    this.sup = '2'
    this.besoinFormulaire2CaseACocher = ['Sans les labels', false]
    this.sup2 = false
  }

  nouvelleVersion() {
    context.fenetreMathalea2d = [-6, -6, 6, 6]
    function pointStrictementDansTriangle(
      P: PointAbstrait,
      A: PointAbstrait,
      B: PointAbstrait,
      C: PointAbstrait,
    ): boolean {
      const s1 = (P.x - B.x) * (A.y - B.y) - (A.x - B.x) * (P.y - B.y)
      const s2 = (P.x - C.x) * (B.y - C.y) - (B.x - C.x) * (P.y - C.y)
      const s3 = (P.x - A.x) * (C.y - A.y) - (C.x - A.x) * (P.y - A.y)
      return (s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0)
    }
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 2,
      listeOfCase: [
        'symetrieAxiale',
        'symetrieCentrale',
        'translation',
        'rotation',
      ],
    })

    // Figure illustrative (pas de mesure à reporter) : réduite en sortie PDF
    const echelleFigure = 0.6
    let objetsEnonceEtCorr, objetsEnonceOnly, objetsCorrectionOnly
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeTransfo = listeTypeDeQuestions[i]
      objetsEnonceOnly = []
      objetsCorrectionOnly = []
      objetsEnonceEtCorr = []
      let transformation = ''
      let enonceTransformation = ''
      let figure = ''
      let imageA, imageB, imageC
      let texte = ''
      let texteCorr = ''

      const lettres = choisitLettresDifferentes(5, 'O')
      const A = pointAbstrait(0, 0, lettres[0], 'below')
      const B = pointAdistance(
        A,
        randint(50, 70) / 10,
        randint(0, 45),
        lettres[1],
      )
      const C = triangle2points2longueurs(
        A,
        B,
        randint(40, 60) / 10,
        randint(40, 60) / 10,
      ).listePoints[2]
      C.nom = lettres[2]
      // const D = pointAbstrait(0, 0)
      //  const E = pointAbstrait(0, 0)
      const poly = polygoneAvecNom(A, B, C) // pour bien placer les labels

      // On prépare la transformation
      switch (typeDeTransfo) {
        case 'symetrieAxiale':
          {
            transformation = 'symétrie axiale'
            enonceTransformation = "par la symétrie d'axe $(d)$"
            const d = droite(
              translation(A, vecteur(-randint(30, 40) / 10, 0)),
              translation(C, vecteur(-randint(30, 40) / 10, 0)),
            )
            d.angleAvecHorizontale = d.angleAvecHorizontale + randint(-10, 10)
            objetsEnonceEtCorr.push(d)
            imageA = symetrieAxiale(A, d, `${A.nom}'`)
            imageB = symetrieAxiale(B, d, `${B.nom}'`)
            imageC = symetrieAxiale(C, d, `${C.nom}'`)
          }
          break
        case 'symetrieCentrale':
          {
            transformation = 'symétrie centrale'
            enonceTransformation = 'par la symétrie de centre $O$'
            let O: PointAbstrait
            let compteur = 0
            do {
              O = pointAbstrait(randint(25, 60) / 10, randint(25, 65) / 10, 'O')
              imageA = rotation(A, O, 180, `${A.nom}'`)
              imageB = rotation(B, O, 180, `${B.nom}'`)
              imageC = rotation(C, O, 180, `${C.nom}'`)
              compteur++
            } while (
              compteur < 50 &&
              (pointStrictementDansTriangle(O, A, B, C) ||
                longueur(O, B) < 2 ||
                longueur(O, C) < 2 ||
                longueur(O, A) < 2 ||
                longueur(imageC, B) < 2 ||
                Math.abs(Math.round(angle(B, A, imageC)) - 90) > 85)
            )
            objetsEnonceEtCorr.push(tracePoint(O), labelPoint(O))
          }
          break
        case 'translation':
          {
            transformation = 'translation'
            const D = pointAbstrait(
              B.x + 1,
              B.y + 8 + randint(-10, 10) / 10,
              lettres[3],
            )
            const E = pointAbstrait(
              B.x + 8,
              B.y + 8 + randint(-20, 20) / 10,
              lettres[4],
            )
            enonceTransformation = `par la translation qui transforme $${D.nom}$ en $${E.nom}$`
            imageA = translation2Points(A, D, E, `${A.nom}'`)
            imageB = translation2Points(B, D, E, `${B.nom}'`)
            imageC = translation2Points(C, D, E, `${C.nom}'`)
            objetsEnonceEtCorr.push(
              representant(vecteur(D, E), D),
              tracePoint(D, E),
              labelPoint(D, E),
            )
          }
          break
        case 'rotation':
        default: {
          transformation = 'rotation'
          let O: PointAbstrait
          const sensDeRotation = choice([-1, 1])
          let angleRotation = randint(8, 17) * 10 * sensDeRotation

          enonceTransformation = `par la rotation de centre $O$ et d'angle $${Math.abs(angleRotation)}^\\circ$ dans le sens ${
            sensDeRotation === 1 ? 'direct' : 'indirect'
          }`
          let compteur = 0
          do {
            O = pointAbstrait(randint(25, 65) / 10, randint(25, 65) / 10, 'O')
            angleRotation = randint(8, 17) * 10 * sensDeRotation
            imageA = rotation(A, O, angleRotation, `${A.nom}'`)
            imageB = rotation(B, O, angleRotation, `${B.nom}'`)
            imageC = rotation(C, O, angleRotation, `${C.nom}'`)
            compteur++
          } while (
            compteur < 100 &&
            (pointStrictementDansTriangle(O, A, B, C) ||
              longueur(O, B) < 3 ||
              longueur(O, A) < 3 ||
              longueur(O, C) < 3 ||
              longueur(B, imageC) < 2)
          )
          objetsEnonceEtCorr.push(tracePoint(O), labelPoint(O))
        }
      }

      objetsEnonceEtCorr.push(segment(A, C), segment(B, C))
      objetsEnonceEtCorr.push()
      // Longueurs en LaTeX, de même taille que les mesures d'angles (scriptsize)
      const longueurSurCote = (P: PointAbstrait, Q: PointAbstrait) =>
        placeLatexSurSegment(
          `${texNombre(longueur(P, Q, 1), 1)}\\text{ cm}`,
          P,
          Q,
          {
            letterSize: 'scriptsize',
          },
        )
      objetsEnonceEtCorr.push(
        segment(A, B),
        longueurSurCote(B, A),
        longueurSurCote(C, B),
        longueurSurCote(A, C),
        poly[1],
      )
      objetsEnonceEtCorr.push(
        afficheMesureAngle(
          A,
          B,
          C,
          'black',
          1,
          Math.round(angle(A, B, C)).toString() + '^\\circ',
        ),
        afficheMesureAngle(
          B,
          A,
          C,
          'black',
          1,
          Math.round(angle(B, A, C)).toString() + '^\\circ',
        ),
        afficheMesureAngle(
          A,
          C,
          B,
          'black',
          1,
          (
            180 -
            Math.round(angle(A, B, C)) -
            Math.round(angle(B, A, C))
          ).toString() + '^\\circ',
        ),
      )
      texte = this.sup2
        ? ''
        : `Les points $${A.nom}'$, $${B.nom}'$, $${C.nom}'$ sont les images respectives de $${A.nom}$, $${B.nom}$, $${C.nom}$ ${enonceTransformation}.<br>`
      figure = `du triangle $${A.nom + B.nom + C.nom}$`
      texteCorr = texte
      const mesureAngleC =
        180 - Math.round(angle(A, B, C)) - Math.round(angle(B, A, C))
      texteCorr += `L'angle $\\widehat{${A.nom}${C.nom}${B.nom}}$ mesure $${texNombre(mesureAngleC)}$ °.<br>`
      texteCorr += `Or, la ${transformation} conserve les angles.<br>`
      texteCorr += `Donc l'angle $\\widehat{${A.nom}'${C.nom}'${B.nom}'}$ mesure lui aussi $${miseEnEvidence(texNombre(mesureAngleC))}$ °.<br><br>`
      texteCorr += `Le segment [$${A.nom + B.nom}$] mesure $${texNombre(longueur(A, B, 1))}\\text{ cm}$.<br>`
      texteCorr += `Or, la ${transformation} conserve les longueurs.<br>`
      texteCorr += `Donc le segment [$${A.nom}'${B.nom}'$] mesure lui aussi $${miseEnEvidence(texNombre(longueur(A, B, 1)))}\\text{ cm}$.<br>`
      texte += `Compléter l'image ${figure} ${enonceTransformation} en utilisant les propriétés de conservation de la ${transformation}`
      texte += ' et en justifiant ses démarches.<br>'
      if (this.interactif) {
        const choixPropriete = [
          { label: 'Choisir', value: '' },
          { label: 'conserve les angles', value: 'conserve les angles' },
          { label: 'conserve les longueurs', value: 'conserve les longueurs' },
        ]
        const listeDeroulante = (champ: number) =>
          ListeDeroulanteElement.create({
            id: `liste-deroulanteEx${this.numeroExercice}Q${i}field${champ}`,
            choices: choixPropriete,
            className: 'mx-2 listeDeroulante',
          })
        texte += `Pour justifier la mesure de l'angle : la ${transformation} ${listeDeroulante(2)}.<br>`
        texte += `Pour justifier la longueur du segment : la ${transformation} ${listeDeroulante(3)}.<br>`
      }
      // On applique la transformation
      const imPoly = this.sup2
        ? polygone(imageA, imageB, imageC)
        : polygoneAvecNom(imageA, imageB, imageC)
      objetsEnonceEtCorr.push(imPoly)
      const placeAngle = afficheMesureAngle(
        imageA,
        imageC,
        imageB,
        'white',
        1,
        '',
      )
      const objets = placeAngle.objets ? placeAngle.objets : []
      const latex = objets[0]
      const marque = objets[1]
      const placeLongueur = placeLatexSurSegment(
        `${texNombre(longueur(B, A, 1), 1)}\\text{ cm}`,
        imageB,
        imageA,
        { color: orangeMathalea, letterSize: 'scriptsize', opacity: 1 },
      )
      objetsEnonceOnly.push(
        new MetaInteractif2d(
          [
            {
              content: '%{champ1}^\\circ',
              x: latex.x,
              y: latex.y,
              classe: KeyboardType.clavierNumbers,
              blanc: '\\ldots ',
              opacity: 1,
              index: 0,
            },
            {
              content: '%{champ1}\\text{ cm}',
              x: placeLongueur.x,
              y: placeLongueur.y,
              classe: KeyboardType.clavierNumbers,
              blanc: '\\ldots ',
              opacity: 1,
              index: 1,
            },
          ],
          {
            exercice: this,
            question: i,
          },
        ),
        marque,
      )

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          field0: {
            value: (
              180 -
              Math.round(angle(A, B, C)) -
              Math.round(angle(B, A, C))
            ).toString(),
            options: {
              noFeedback: true,
            },
          },
          field1: {
            value: longueur(B, A, 1).toString(),
            options: {
              noFeedback: true,
            },
          },
          field2: { value: 'conserve les angles' },
          field3: { value: 'conserve les longueurs' },
        },
        {
          formatInteractif: 'MetaInteractif2d',
        },
      )

      objetsCorrectionOnly.push(
        afficheMesureAngle(
          imageA,
          imageC,
          imageB,
          orangeMathalea,
          1,
          (
            180 -
            Math.round(angle(A, B, C)) -
            Math.round(angle(B, A, C))
          ).toString() + '^\\circ',
          { colorArc: orangeMathalea },
        ),
        placeLongueur,
      )

      // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
      texte +=
        mathalea2d(
          Object.assign(
            { scale: echelleFigure },
            fixeBordures([objetsEnonceOnly, objetsEnonceEtCorr]),
          ),
          objetsEnonceOnly,
          objetsEnonceEtCorr,
        ) +
        `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
        ajouteFeedback(this, i)

      // On ajoute au texte de la correction, la figure de la correction
      texteCorr += mathalea2d(
        Object.assign(
          { scale: echelleFigure },
          fixeBordures([objetsCorrectionOnly, objetsEnonceEtCorr]),
        ),
        objetsCorrectionOnly,
        objetsEnonceEtCorr,
      )
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
