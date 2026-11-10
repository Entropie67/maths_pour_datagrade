import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone } from '../../lib/2d/polygones'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffleLettres,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Calculer un produit scalaire avec les normes'
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = 'e9e66'

export const refs = {
  'fr-fr': ['1G10-6'],
  'fr-ch': ['3G95-6'],
}

export default class ProduitScalaireNormes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 4
    this.spacing = 1.5
    this.besoinFormulaire2CaseACocher = ['Rappel de la formule de cours', false]
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Application ditrecte de la formule',
        '2 : Avec un triangle (vecteurs avec la même origine)',
        "3 : Avec un triangle (vecteurs qui n'ont pas la même origine) ",
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, reponse, objets, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const cours = `Dans un repère orthonormé, 
     $\\vec{u}\\cdot\\vec{v}=\\dfrac{1}{2}\\left[\\Vert \\vec{u}+\\vec{v}\\Vert^2-\\Vert\\vec{u}\\Vert^2-\\Vert\\vec{v}\\Vert^2\\right]$
     ou encore $\\vec{u}\\cdot\\vec{v}=\\dfrac{1}{2}\\left[\\Vert\\vec{u}\\Vert^2+\\Vert\\vec{v}\\Vert^2-\\Vert \\vec{u}-\\vec{v}\\Vert^2\\right]$.<br>
      Si $\\vec{u}=\\overrightarrow{AB}$ et $\\vec{u}=\\overrightarrow{AC}$, on obtient :
      $\\overrightarrow{AB}\\cdot \\overrightarrow{AC}=\\dfrac{1}{2}\\left[ AB^2+AC^2-CB^2\\right]$<br><br>`
      objets = []
      const choix = choice([true, false])
      const listeDeNomsDePolygones = ['QD']
      const nomDesPoints = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nomDesPoints)
      const longueurAB = randint(3, 8)
      const longueurAC = randint(4, 7, longueurAB)
      const longueurBC = randint(5, Math.min(longueurAB + longueurAC - 2, 11), [
        longueurAB,
        longueurAC,
      ])
      const A = pointAbstrait(0, 0)
      const B = pointAdistance(A, longueurAB, randint(-170, 170))
      const ABC = triangle2points2longueurs(A, B, longueurAC, longueurBC)
      const C = ABC.listePoints[2]
      const codeAB =
        angleOriente(C, A, B) > 0
          ? texteSurSegment(
              `$${texNombre(longueurAB, 1)}$`,
              A,
              B,
              'black',
              0.5,
              true,
            )
          : texteSurSegment(
              `$${texNombre(longueurAB, 1)}$`,
              B,
              A,
              'black',
              0.5,
              true,
            )
      const codeAC =
        angleOriente(B, C, A) > 0
          ? texteSurSegment(
              `$${texNombre(longueurAC, 1)}$`,
              C,
              A,
              'black',
              0.5,
              true,
            )
          : texteSurSegment(
              `$${texNombre(longueurAC, 1)}$`,
              A,
              C,
              'black',
              0.5,
              true,
            )
      const codeBC =
        angleOriente(A, B, C) > 0
          ? texteSurSegment(
              `$${texNombre(longueurBC, 1)}$`,
              B,
              C,
              'black',
              0.5,
              true,
            )
          : texteSurSegment(
              `$${texNombre(longueurBC, 1)}$`,
              C,
              B,
              'black',
              0.5,
              true,
            )
      const nom = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom)
      const nommeABC = nommePolygone(ABC, nom)
      const normeu = randint(5, 12)
      const normev = randint(1, 10)
      const normeuPMv = randint(abs(normeu - normev), normeu + normev)
      objets.push(ABC, nommeABC, codeAB, codeAC, codeBC)
      const figure = mathalea2d(
        Object.assign(
          { scale: 0.7, pixelsParCm: 20, display: 'inline' } as const,
          fixeBordures(objets),
        ),
        objets,
      )
      const intro =
        "On écrit le produit scalaire de l'énoncé avec des vecteurs de même origine : <br>"
      const corrMemeOrigine = ` On applique la formule du cours avec les points $${nom[0]}$, $${nom[1]}$ et $${nom[2]}$ : <br>
                $\\begin{aligned}
                \\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}&=\\dfrac{1}{2}\\left[ ${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2-${nom[2]}${nom[1]}^2\\right]\\\\
                &=\\dfrac{1}{2}\\left[ ${longueurAB}^2+${longueurAC}^2-${longueurBC}^2\\right]\\\\
                &=${miseEnEvidence(texNombre((longueurAB ** 2 + longueurAC ** 2 - longueurBC ** 2) / 2, 1))}
                \\end{aligned}$`
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: //
          switch (randint(1, 2)) {
            case 1:
              texte = `Dans un repère orthonormé, on a $\\Vert\\vec{u}\\Vert=${normeu}$, $\\Vert\\vec{v}\\Vert=${normev}$ et $\\Vert\\vec{u}-\\vec{v}\\Vert=${normeuPMv}$.<br>
        Calculer $\\vec{u}\\cdot \\vec{v}$.<br>`
              if (this.sup2) {
                texteCorr = `${cours}`
              } else {
                texteCorr = ''
              }
              texteCorr += `On utilise la formule du cours : <br>
            $\\begin{aligned}
           \\vec{u}\\cdot\\vec{v}&=\\dfrac{1}{2}\\left[\\Vert\\vec{u}\\Vert^2+\\Vert\\vec{v}\\Vert^2-\\Vert \\vec{u}-\\vec{v}\\Vert^2\\right]\\\\
&=\\dfrac{1}{2}\\left[${normeu}^2+${normev}^2-${normeuPMv}^2\\right]\\\\
             &=${miseEnEvidence(texNombre((normeu ** 2 + normev ** 2 - normeuPMv ** 2) / 2, 1))}
             \\end{aligned}$`
              reponse = texNombre(
                (normeu ** 2 + normev ** 2 - normeuPMv ** 2) / 2,
                1,
              )
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte +=
                ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteAvant: '<br>$\\vec{u}\\cdot\\vec{v}=$',
                }) + '<br>'
              break
            case 2:
            default:
              texte = `Dans un repère orthonormé, on a $\\Vert\\vec{u}\\Vert=${normeu}$, $\\Vert\\vec{v}\\Vert=${normev}$ et $\\Vert\\vec{u}+\\vec{v}\\Vert=${normeuPMv}$.<br>
            Calculer $\\vec{u}\\cdot \\vec{v}$.<br>`
              if (this.sup2) {
                texteCorr = `${cours}`
              } else {
                texteCorr = ''
              }
              texteCorr += `On utilise la formule du cours : <br>
                $\\begin{aligned}
               \\vec{u}\\cdot\\vec{v}&=\\dfrac{1}{2}\\left[\\Vert \\vec{u}+\\vec{v}\\Vert^2-\\Vert\\vec{u}\\Vert^2-\\Vert\\vec{v}\\Vert^2\\right]\\\\
    &=\\dfrac{1}{2}\\left[${normeuPMv}^2-${normeu}^2-${normev}^2\\right]\\\\
                 &=${miseEnEvidence(texNombre((normeuPMv ** 2 - normeu ** 2 - normev ** 2) / 2, 1))}
                 \\end{aligned}$`
              reponse = texNombre(
                (normeuPMv ** 2 - normeu ** 2 - normev ** 2) / 2,
                1,
              )
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte +=
                ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                  texteAvant: '<br>$\\vec{u}\\cdot\\vec{v}=$',
                }) + '<br>'
              break
          }
          break
        case 2: //
          texte = `En utilisant la figure ci-dessous, calculer $\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}$.<br>`
          texte += figure
          if (this.sup2) {
            texteCorr = `${cours}`
          } else {
            texteCorr = ''
          }
          texteCorr += corrMemeOrigine
          reponse = texNombre(
            (longueurAB ** 2 + longueurAC ** 2 - longueurBC ** 2) / 2,
            1,
          )
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte +=
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
              texteAvant: `<br>$\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}=$`,
            }) + '<br>'
          break

        case 3: //
        default:
          if (this.sup2) {
            texteCorr = `${cours}`
          } else {
            texteCorr = ''
          }
          switch (randint(1, 2)) {
            case 1:
              reponse = texNombre(
                -(longueurAB ** 2 + longueurAC ** 2 - longueurBC ** 2) / 2,
                1,
              )
              texte = `En utilisant la figure ci-dessous, calculer ${choix ? `$\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}$` : `$\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}$`}.<br>`
              texte += figure
              texteCorr +=
                intro +
                `$${choix ? `\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}` : `\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}`}=-\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}$.<br>
                On applique la formule du cours avec les points $${nom[0]}$, $${nom[1]}$ et $${nom[2]}$ : <br>
                $\\begin{aligned}
                -\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}&=-\\dfrac{1}{2}\\left[ ${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2-${nom[2]}${nom[1]}^2\\right]\\\\
                &=-\\dfrac{1}{2}\\left[ ${longueurAB}^2+${longueurAC}^2-${longueurBC}^2\\right]\\\\
                &=${miseEnEvidence(texNombre(-(longueurAB ** 2 + longueurAC ** 2 - longueurBC ** 2) / 2, 1))}
                \\end{aligned}$`

              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choix ? `\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}` : `\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}`}=$`,
                },
              )
              break
            case 2:
            default:
              reponse = texNombre(
                (longueurAB ** 2 + longueurAC ** 2 - longueurBC ** 2) / 2,
                1,
              )
              texte = `Calculer $\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}$.`
              texte += figure
              texteCorr +=
                intro +
                `$\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}=(-\\overrightarrow{${nom[0]}${nom[1]}})\\cdot (-\\overrightarrow{${nom[0]}${nom[2]}})=\\overrightarrow{${nom[0]}${nom[1]}}\\cdot \\overrightarrow{${nom[0]}${nom[2]}}$<br>
                ` +
                corrMemeOrigine

              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$\\overrightarrow{${nom[1]}${nom[0]}}\\cdot \\overrightarrow{${nom[2]}${nom[0]}}=$`,
                },
              )
              break
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
