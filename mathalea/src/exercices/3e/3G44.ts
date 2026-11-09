import {
  assombrirOuEclaircir,
  colorToLatexOrHTML,
} from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { cone3d } from '../../lib/3d/3dProjectionMathalea2d/Cone3dPerspectiveCavaliere'
import { cube3d } from '../../lib/3d/3dProjectionMathalea2d/Cube3dPerspectiveCavaliere'
import { cylindre3d } from '../../lib/3d/3dProjectionMathalea2d/Cylindre3dPerspectiveCavaliere'
import {
  CodageAngleDroit3D,
  droite3d,
  point3d,
  polygone3d,
  rotation3d,
  translation3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { pyramide3d } from '../../lib/3d/3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import { sphere3d } from '../../lib/3d/3dProjectionMathalea2d/Sphere3dPerspectiveCavaliere'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import type { AMCUneProposition } from '../../lib/amc/amcTypes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDe,
  rangeMinMax,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { RedactionPythagore } from '../4e/_pythagore'
import Exercice from '../Exercice'

export const titre = "Déterminer des longueurs dans la géométrie dans l'espace"
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '19/12/2022'
export const dateDeModifImportante = '19/03/2025'

/**
 * Calcul de longueurs avec Pythagore dans la géométrie dans l'espace
 * @author Éric Elter
 */

export const uuid = '57c70'

export const refs = {
  'fr-fr': ['3G44'],
  'fr-ch': ['10LSGM3B-3', 'PRQMG03B-6'],
}
type ChoixSegment = [
  string,
  string,
  (string | number)?,
  (string | number)?,
  ...number[],
]

export default class CalculPythagoreEspace extends Exercice {
  declare sup: number
  declare sup2: number

  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de longueur à trouver',
      "Nombres séparés par des tirets :\n1 : Diagonale d'une face d'un cube\n2 : Diagonale d'un cube\n3 : Diagonale d'une face d'un pavé droit\n4 : Diagonale d'un pavé droit\n5 : Dans un cylindre\n6 : Dans une pyramide\n7 : Dans un cône\n8 : Rayon d'une sphère\n9 : Rayon d'une section d'une sphère\n10 : Mélange",
    ]

    this.nbQuestions = 4
    this.sup2 = 1
    this.sup = 10
  }

  nouvelleVersion() {
    if (context.isAmc)
      this.besoinFormulaire2Numerique = [
        'Exercice AMC',
        2,
        '1 : Question ouverte\n2 : Réponse numérique',
      ]

    const sup2Numerique = Number.parseInt(String(this.sup2), 10)
    // 1 = AMCOpen, 2 = AMCNum. Toute autre valeur retombe sur AMCOpen.
    this.sup2 = sup2Numerique === 2 ? 2 : 1

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 9,
      defaut: 10,
      melange: 10,
      nbQuestions: this.nbQuestions,
    }) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const listeUnites = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        objetsEnonce,
        A,
        B,
        C,
        D,
        E,
        BC,
        segmentATrouver,
        segmentAnnexe,
        solideDessine,
        longueurATrouver,
        nomSolide,
        segmentChoisi,
        choixSegments: ChoixSegment[] = [],
        L,
        p,
        J,
        K,
        M,
        JK,
        I,
        choixProfondeur,
        h,
        c,
        j,
        anglesPossibles,
        indiceAngleChoisi,
        ptBase,
        ptBase2,
        ptsBase,
        nbSommets,
        numeroSommet,
        r,
        r2,
        v,
        sph,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrectionAMC[i] = {}
      texte = ''
      texteCorr = ''
      reponse = 0
      nomSolide = ''
      r = 0
      h = 0
      objetsEnonce = []
      context.anglePerspective = choice([-30, -60, 30, 60])
      j = randint(0, 6) // Permet de choisir l'unité utilisée dans chaque question
      switch (listeTypeDeQuestions[i]) {
        case 1: // Diagonale de la face d'un cube
          A = point3d(0, 0, 0)
          c = randint(5, 10)
          B = point3d(c, 0, 0)
          D = point3d(0, 0, c)
          choixProfondeur = choice([c, -c])
          E = point3d(0, choixProfondeur, 0)

          nomSolide = choisitLettresDifferentes(8, 'OQWX').join('')
          solideDessine = pave3d(A, B, D, E, bleuMathalea, true, nomSolide)

          choixSegments.push(['02', '1'], ['13', '2'])
          if (choixProfondeur > 0) {
            choixSegments.push(['16', '5'], ['25', '6']) // Ce sont les diagonales des faces visibles et le sommet qui forme un triangle rectangle
            if (context.anglePerspective > 0)
              choixSegments.push(['27', '3'], ['36', '2'])
            else choixSegments.push(['14', '5'], ['05', '1'])
          } else {
            choixSegments.push(['07', '3'], ['34', '0']) // Ce sont les diagonales des faces visibles et le sommet qui forme un triangle rectangle
            if (context.anglePerspective < 0)
              choixSegments.push(['27', '3'], ['36', '2'])
            else choixSegments.push(['14', '5'], ['05', '1'])
          }
          segmentChoisi = choice(choixSegments)
          J = nomSolide[Number(segmentChoisi[0][0])]
          K = nomSolide[Number(segmentChoisi[0][1])]
          I = nomSolide[Number(segmentChoisi[1])] // IJK est rectangle en I
          longueurATrouver = J + K
          texte += `Sachant que le cube $${nomSolide}$ possède des arêtes de $${c}\\text{ ${listeUnites[j]}}$, calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          segmentATrouver = segment(
            solideDessine.sommets[Number(segmentChoisi[0][0])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            orangeMathalea,
          )
          segmentATrouver.epaisseur = 2
          objetsEnonce.push(...solideDessine.c2d, segmentATrouver)
          texte +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: 0.7,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[0][0])],
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              orangeMathalea,
              2,
            ),
          )
          texteCorr +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: 0.7,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          reponse = arrondi(Math.sqrt(c ** 2 + c ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(I, J, K, 1, c, c, reponse, listeUnites[j], orangeMathalea, false, 2, true)[0]

          break
        case 2: // Diagonale d'un cube
          // c = new Decimal(randint(2, 10)).plus(partieDecimale1)
          c = randint(5, 10)
          nomSolide = choisitLettresDifferentes(8, 'OQWX')
          nomSolide = nomSolide.join('')
          choixSegments = [
            ['60', '5', '05', '1'],
            ['71', '4', '14', '0'],
            ['24', '1', '41', '0'],
            ['35', '0', '50', '1'],
          ] // Ce sont les diagonales du cubes, le sommet qui forme un triangle rectangle, la diagonale d'une face et le sommet qui forme un triangle rectangle avec cette dernière diagonale
          segmentChoisi = choice(choixSegments)
          B = nomSolide[Number(segmentChoisi[0][0])]
          C = nomSolide[Number(segmentChoisi[0][1])]
          A = nomSolide[Number(segmentChoisi[1])] // ABC est rectangle en A
          D = nomSolide[Number(segmentChoisi[3])] // ACD est rectangle en D

          longueurATrouver = B + C
          texte += `Sachant que le cube $${nomSolide}$ possède des arêtes de $${c}\\text{ ${listeUnites[j]}}$, calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          solideDessine = cube3d(
            1,
            1,
            1,
            c,
            bleuMathalea,
            '',
            '',
            '',
            false,
            true,
            nomSolide.split(''),
          )
          segmentATrouver = segment(
            solideDessine.sommets[Number(segmentChoisi[0][0])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            orangeMathalea,
          )
          segmentATrouver.epaisseur = 2
          segmentATrouver.pointilles = 2
          objetsEnonce.push(...solideDessine.c2d, segmentATrouver)
          texte +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: 0.7,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[0][0])],
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              orangeMathalea,
              2,
            ),
          )
          segmentAnnexe = segment(
            solideDessine.sommets[Number(segmentChoisi[1])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            'green',
          )
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.pointilles = 1
          objetsEnonce.push(segmentAnnexe)
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[3])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              'green',
              2,
            ),
          )
          texteCorr +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: 0.7,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          texteCorr += `Le triangle $${longueurATrouver + A}$ est rectangle en $${A}$  donc d'après le théorème de Pythagore, on a : `
          texteCorr += `$${longueurATrouver}^2=${A + B}^2+${A + C}^2$.`
          texteCorr += `<br> On ne peut pas continuer si on ne connaît pas la valeur de $${A + C}^2$. Trouvons-la.`
          texteCorr += `<br> ${sp(10)}Le triangle $${C + A + D}$ est rectangle en $${D}$  donc d'après le théorème de Pythagore, on a : `
          texteCorr += `$${A + C}^2=${A + D}^2+${D + C}^2$.`

          BC = texNombre(arrondi(Math.sqrt(c ** 2 + c ** 2 + c ** 2), 1))
          reponse = arrondi(Math.sqrt(c ** 2 + c ** 2 + c ** 2), 1)
          texteCorr += `<br> ${sp(10)}$${A + C}^2=${texNombre(c)}^2+${texNombre(c)}^2$`
          texteCorr += `<br> ${sp(10)}$${miseEnEvidence(A + C, 'green')}^2=${miseEnEvidence(texNombre(c ** 2 + c ** 2), 'green')}$`
          texteCorr += `<br> ${sp(10)} Inutile de trouver la valeur de $${A + C}$ car seul son carré nous intéresse ici.`
          texteCorr += `<br> Revenons à $${longueurATrouver}^2=${A + B}^2+${A + C}^2$.`
          texteCorr += `<br> $${longueurATrouver}^2=${texNombre(c)}^2+${miseEnEvidence(texNombre(c ** 2 + c ** 2), 'green')}=${texNombre(c ** 2 + c ** 2 + c ** 2)}$`
          texteCorr += `<br> $${longueurATrouver}=\\sqrt{${texNombre(c ** 2 + c ** 2 + c ** 2)}}$`
          texteCorr += `<br> $${longueurATrouver}\\approx${miseEnEvidence(BC)}$ ${texteEnCouleurEtGras(listeUnites[j])}`
          break
        case 3: // Diagonale de la face d'un pavé droit
          L = randint(5, 20)
          h = randint(5, 20, [L])
          p = randint(5, 20, [L, h])
          A = point3d(0, 0, 0)
          B = point3d(L, 0, 0)
          D = point3d(0, 0, h)
          choixProfondeur = choice([p, -p])
          E = point3d(0, choixProfondeur, 0)

          nomSolide = choisitLettresDifferentes(8, 'OQWX').join('')
          solideDessine = pave3d(A, B, D, E, bleuMathalea, true, nomSolide)
          choixSegments = []
          choixSegments.push(['02', '1', L, h], ['13', '2', h, L])
          if (choixProfondeur > 0) {
            choixSegments.push(['16', '5', p, h], ['25', '6', p, h]) // Ce sont les diagonales des faces visibles et le sommet qui forme un triangle rectangle
            if (context.anglePerspective > 0)
              choixSegments.push(['27', '3', L, p], ['36', '2', L, p])
            else choixSegments.push(['14', '5', p, L], ['05', '1', L, p])
          } else {
            choixSegments.push(['07', '3', h, p], ['34', '0', p, h]) // Ce sont les diagonales des faces visibles et le sommet qui forme un triangle rectangle
            if (context.anglePerspective < 0)
              choixSegments.push(['27', '3', L, p], ['36', '2', L, p])
            else choixSegments.push(['14', '5', p, L], ['05', '1', L, p])
          }

          segmentChoisi = choice(choixSegments)
          J = nomSolide[Number(segmentChoisi[0][0])]
          K = nomSolide[Number(segmentChoisi[0][1])]
          I = nomSolide[Number(segmentChoisi[1])] // IJK est rectangle en I

          longueurATrouver = J + K
          texte += `Sachant que dans le pavé droit $${nomSolide}$, $${nomSolide[0]}${nomSolide[1]}=${L}\\text{ ${listeUnites[j]}}$, $${nomSolide[0]}${nomSolide[3]}=${h}\\text{ ${listeUnites[j]}}$ et $${nomSolide[0]}${nomSolide[4]}=${p}\\text{ ${listeUnites[j]}}$, calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          segmentATrouver = segment(
            solideDessine.sommets[Number(segmentChoisi[0][0])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            orangeMathalea,
          )
          segmentATrouver.epaisseur = 2
          objetsEnonce.push(...solideDessine.c2d, segmentATrouver)
          texte +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: context.isHtml ? 0.7 : 0.3,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[0][0])],
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              orangeMathalea,
              2,
            ),
          )
          texteCorr +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: context.isHtml ? 0.7 : 0.3,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          reponse = arrondi(
            Math.sqrt(
              Number(segmentChoisi[2]) ** 2 + Number(segmentChoisi[3]) ** 2,
            ),
            1,
          )
          texteCorr +=
            '<br>' +
            RedactionPythagore(
              I,
              J,
              K,
              1,
              Number(segmentChoisi[2]),
              Number(segmentChoisi[3]),
              reponse,
              listeUnites[j], orangeMathalea, false, 2, true)[0]

          break
        case 4: // Diagonale d'un pavé droit
          L = randint(5, 20)
          h = randint(5, 20, [L])
          p = randint(5, 20, [L, h])
          A = point3d(0, 0, 0)
          B = point3d(L, 0, 0)
          D = point3d(0, 0, h)
          choixProfondeur = choice([p, -p])
          E = point3d(0, choixProfondeur, 0)

          nomSolide = choisitLettresDifferentes(8, 'OQWX').join('')
          solideDessine = pave3d(A, B, D, E, bleuMathalea, true, nomSolide)
          choixSegments = [
            ['60', '5', '05', '1', p, L, h],
            ['71', '4', '14', '0', p, L, h],
            ['24', '1', '41', '0', L, p, h],
            ['35', '0', '50', '1', L, p, h],
          ] // Ce sont les diagonales du cubes, le sommet qui forme un triangle rectangle, la diagonale d'une face et le sommet qui forme un triangle rectangle avec cette dernière diagonale
          segmentChoisi = choice(choixSegments)
          J = nomSolide[Number(segmentChoisi[0][0])]
          K = nomSolide[Number(segmentChoisi[0][1])]
          I = nomSolide[Number(segmentChoisi[1])] // IJK est rectangle en I
          M = nomSolide[Number(segmentChoisi[3])] // ACD est rectangle en
          longueurATrouver = J + K
          texte += `Sachant que dans le pavé droit $${nomSolide}$, $${nomSolide[0]}${nomSolide[1]}=${L}\\text{ ${listeUnites[j]}}$, $${nomSolide[0]}${nomSolide[3]}=${h}\\text{ ${listeUnites[j]}}$ et $${nomSolide[0]}${nomSolide[4]}=${p}\\text{ ${listeUnites[j]}}$, calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          segmentATrouver = segment(
            solideDessine.sommets[Number(segmentChoisi[0][0])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            orangeMathalea,
          )
          segmentATrouver.epaisseur = 2
          segmentATrouver.pointilles = 2
          objetsEnonce.push(...solideDessine.c2d, segmentATrouver)
          texte +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: context.isHtml ? 0.7 : 0.3,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          segmentAnnexe = segment(
            solideDessine.sommets[Number(segmentChoisi[1])].c2d,
            solideDessine.sommets[Number(segmentChoisi[0][1])].c2d,
            'green',
          )
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.pointilles = 1
          objetsEnonce.push(segmentAnnexe)
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[0][0])],
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              orangeMathalea,
              2,
            ),
          )
          objetsEnonce.push(
            new CodageAngleDroit3D(
              solideDessine.sommets[Number(segmentChoisi[1])],
              solideDessine.sommets[Number(segmentChoisi[3])],
              solideDessine.sommets[Number(segmentChoisi[0][1])],
              'green',
              2,
            ),
          )
          texteCorr +=
            mathalea2d(
              Object.assign(
                { optionsTikz: 'baseline=(current bounding box.north)' },
                fixeBordures(objetsEnonce),
                {
                  scale: 0.7,
                  display: 'block' as const,
                },
              ),
              objetsEnonce,
            ) + '<br>'
          texteCorr += `Le triangle $${longueurATrouver + I}$ est rectangle en $${I}$  donc d'après le théorème de Pythagore, on a : `
          texteCorr += `$${longueurATrouver}^2=${I + J}^2+${I + K}^2$.`
          texteCorr += `<br> On ne peut pas continuer si on ne connaît pas la valeur de $${I + K}^2$. Trouvons-la.`
          texteCorr += `<br> ${sp(10)}Le triangle $${K + I + M}$ est rectangle en $${M}$  donc d'après le théorème de Pythagore, on a : `
          texteCorr += `$${I + K}^2=${I + M}^2+${M + K}^2$.`

          JK = texNombre(
            arrondi(
              Math.sqrt(
                Number(segmentChoisi[4]) ** 2 +
                  Number(segmentChoisi[5]) ** 2 +
                  Number(segmentChoisi[6]) ** 2,
              ),
              1,
            ),
          )
          reponse = arrondi(
            Math.sqrt(
              Number(segmentChoisi[4]) ** 2 +
                Number(segmentChoisi[5]) ** 2 +
                Number(segmentChoisi[6]) ** 2,
            ),
            1,
          )
          texteCorr += `<br> ${sp(10)}$${I + K}^2=${texNombre(segmentChoisi[4])}^2+${texNombre(segmentChoisi[5])}^2$`
          texteCorr += `<br> ${sp(10)}$${miseEnEvidence(I + K, 'green')}^2=${miseEnEvidence(texNombre(Number(segmentChoisi[4]) ** 2 + Number(segmentChoisi[5]) ** 2), 'green')}$`
          texteCorr += `<br> ${sp(10)} Inutile de trouver la valeur de $${I + K}$ car seul son carré nous intéresse ici.`
          texteCorr += `<br> Revenons à $${longueurATrouver}^2=${I + J}^2+${I + K}^2$.`
          texteCorr += `<br> $${longueurATrouver}^2=${texNombre(segmentChoisi[6])}^2+${miseEnEvidence(texNombre(Number(segmentChoisi[4]) ** 2 + Number(segmentChoisi[5]) ** 2), 'green')}=${texNombre(Number(segmentChoisi[6]) ** 2 + Number(segmentChoisi[4]) ** 2 + Number(segmentChoisi[5]) ** 2)}$`
          texteCorr += `<br> $${longueurATrouver}=\\sqrt{${texNombre(Number(segmentChoisi[6]) ** 2 + Number(segmentChoisi[4]) ** 2 + Number(segmentChoisi[5]) ** 2)}}$`
          texteCorr += `<br> $${longueurATrouver}\\approx${miseEnEvidence(JK)}$ ${texteEnCouleurEtGras(listeUnites[j])}`
          break
        case 5: // Dans un cylindre
          r = randint(4, 10)
          h = randint(5, 15, [r])
          A = point3d(
            0,
            0,
            0,
            true,
            choisitLettresDifferentes(1, 'OQWX')[0],
            'left',
          )
          if (choice([0, 1, 2]) === 0) {
            B = point3d(r, 0, 0)
            D = point3d(
              0,
              0,
              h,
              true,
              choisitLettresDifferentes(1, 'OQWX' + A.label)[0],
              'left',
            )
          } else if (choice([0, 1]) === 0) {
            B = point3d(0, r, 0)
            D = point3d(
              h,
              0,
              0,
              true,
              choisitLettresDifferentes(1, 'OQWX' + A.label)[0],
              'left',
            )
          } else {
            B = point3d(0, 0, r)
            D = point3d(
              0,
              h,
              0,
              true,
              choisitLettresDifferentes(1, 'OQWX' + A.label)[0],
              'left',
            )
          }
          v = vecteur3d(A, B)
          solideDessine = cylindre3d(
            A,
            D,
            v,
            v,
            bleuMathalea,
            false,
            true,
            true,
            'black',
          )

          // Pour placer un point sur la base visible mais qui ne soit pas trop près de l'axe et des deux génératrices.
          anglesPossibles = shuffle(
            rangeMinMax(
              2,
              solideDessine.pointsBase2.length - 3,
              [16, 17, 18, 19, 20],
            ),
          )
          indiceAngleChoisi = 0
          while (
            longueur(
              D.c2d,
              solideDessine.pointsBase2[anglesPossibles[indiceAngleChoisi]],
            ) <
            longueur(D.c2d, solideDessine.pointsBase2[0]) / 2
          ) {
            indiceAngleChoisi++
          }

          ptBase2 = rotation3d(
            translation3d(D, v),
            droite3d(A, vecteur3d(A, D)),
            solideDessine.angleDepart + 10 * anglesPossibles[indiceAngleChoisi],
          )
          ptBase2.c2d.nom = choisitLettresDifferentes(
            1,
            'OQWX' + A.label + D.label,
          )[0]
          longueurATrouver = A.label + ptBase2.c2d.nom
          segmentATrouver = segment(A.c2d, ptBase2.c2d, orangeMathalea)
          segmentATrouver.epaisseur = 2
          segmentATrouver.pointilles = 2
          objetsEnonce.push(
            ...solideDessine.c2d,
            segmentATrouver,
            tracePoint(ptBase2),
            labelPoint(A.c2d, D.c2d, ptBase2.c2d),
          )
          texte += `Dans ce cylindre de révolution, le rayon de ses bases (de centre respectif $${A.label}$ et $${D.label}$) est de $${r}\\text{ ${listeUnites[j]}}$ et sa hauteur est de $${h}\\text{ ${listeUnites[j]}}$. Sachant que le point $${ptBase2.c2d.nom}$ est sur la base de centre $${D.label}$, calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          texte += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures([...solideDessine.c2d]),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )

          objetsEnonce.push(new CodageAngleDroit3D(A, D, ptBase2, 'green', 2))
          segmentAnnexe = segment(D.c2d, ptBase2.c2d, 'green')
          objetsEnonce.push(segmentAnnexe)
          segmentAnnexe = segment(D.c2d, A.c2d, 'green')
          objetsEnonce.push(segmentAnnexe)
          texteCorr += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          reponse = arrondi(Math.sqrt(h ** 2 + r ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(D.label, A.label, ptBase2.c2d.nom, 1, h, r, reponse, listeUnites[j], orangeMathalea, false, 2, true)[0]
          break
        case 6: // Dans une pyramide à base régulière
          r = randint(4, 10)
          h = randint(5, 15, [r])
          A = point3d(
            0,
            0,
            0,
            true,
            choisitLettresDifferentes(1, 'OQWX')[0],
            'left',
          )
          B = point3d(r, 0, 0)
          D = point3d(
            0,
            0,
            h * 1,
            true,
            choisitLettresDifferentes(1, 'OQWX' + A.label)[0],
            'left',
          )
          v = vecteur3d(A, B)
          ptsBase = [B]
          nbSommets = choice([3, 5, 6, 7])
          for (let ee = 1; ee < nbSommets; ee++) {
            // pyramide à base non régulière : ptsBase.push(rotation3d(B, droite3d(A, vecteur3d(D, A)), ee * 360 / (nbSommets) + choice([-10, 10]) * randint(0, 2)))
            ptsBase.push(
              rotation3d(
                B,
                droite3d(A, vecteur3d(D, A)),
                (ee * 360) / nbSommets,
              ),
            )
          }
          p = polygone3d(ptsBase, bleuMathalea)
          solideDessine = pyramide3d(p, D, bleuMathalea, A, true, 'black', true)
          numeroSommet = randint(0, nbSommets - 1)
          segmentATrouver = solideDessine.aretesSommet[numeroSommet].c2d
          segmentATrouver.epaisseur = 2
          segmentATrouver.color = colorToLatexOrHTML(orangeMathalea)
          longueurATrouver = D.label + p.listePoints2d[numeroSommet].nom
          texte += `$${solideDessine.nom}$ est une pyramide régulière. La distance entre $${A.label}$, le centre de la base, et l'un des sommets de la base est de $${r}\\text{ ${listeUnites[j]}}$ et la hauteur de cette pyramide est de $${h}\\text{ ${listeUnites[j]}}$. Calculer la longueur $${longueurATrouver}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          texte += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures([...solideDessine.c2d]),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            [...solideDessine.c2d, segmentATrouver],
          )

          objetsEnonce.push(
            ...solideDessine.c2d,
            segmentATrouver,
            new CodageAngleDroit3D(
              D,
              A,
              p.listePoints[numeroSommet],
              'green',
              2,
            ),
          )
          segmentAnnexe = segment(A.c2d, p.listePoints2d[numeroSommet], 'green')
          objetsEnonce.push(segmentAnnexe)
          segmentAnnexe = segment(D.c2d, A.c2d, 'green')
          objetsEnonce.push(segmentAnnexe)
          texteCorr += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          reponse = arrondi(Math.sqrt(h ** 2 + r ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(A.label, D.label, p.listePoints2d[numeroSommet].nom, 1, h, r, reponse, listeUnites[j], orangeMathalea, false, 2, true)[0]
          break
        case 7: // Dans un cône
          r = randint(4, 10)
          h = randint(5, 15, [r])
          A = point3d(
            0,
            0,
            0,
            true,
            choisitLettresDifferentes(1, 'OQWX')[0],
            'left',
          )
          B = point3d(r, 0, 0)
          D = point3d(
            0,
            0,
            h,
            true,
            choisitLettresDifferentes(1, 'OQWX' + A.label)[0],
            'left',
          )
          v = vecteur3d(A, B)
          ptsBase = [B]
          nbSommets = 36
          for (let ee = 1; ee < nbSommets; ee++) {
            ptsBase.push(
              rotation3d(
                B,
                droite3d(A, vecteur3d(D, A)),
                (ee * 360) / nbSommets,
              ),
            )
          }
          p = polygone3d(ptsBase, bleuMathalea)
          solideDessine = cone3d(
            A,
            D,
            v,
            bleuMathalea,
            true,
            'black',
            assombrirOuEclaircir('gray', 100),
          )
          numeroSommet = randint(1, Math.floor(nbSommets / 2) - 1)
          if (context.anglePerspective < 0)
            numeroSommet = (nbSommets - numeroSommet) % nbSommets
          segmentATrouver = segment(
            D.c2d,
            p.listePoints2d[numeroSommet],
            orangeMathalea,
          )
          segmentATrouver.epaisseur = 2
          ptBase = p.listePoints2d[numeroSommet]
          ptBase.nom = choisitLettresDifferentes(
            1,
            'OQWX' + A.label + D.label,
          )[0]
          ptBase.positionLabel = 'below'
          texte += `Dans ce cône de révolution, le rayon de sa base est de $${r}\\text{ ${listeUnites[j]}}$ et sa hauteur est de $${h}\\text{ ${listeUnites[j]}}$. Calculer la longueur d'une génératrice de ce cône, arrondie au dixième de ${listeUnites[j]}.<br>`
          texte += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures([...solideDessine.c2d]),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            [...solideDessine.c2d, segmentATrouver, labelPoint(ptBase, D.c2d)],
          )

          longueurATrouver = D.label + ptBase.nom
          objetsEnonce.push(
            ...solideDessine.c2d,
            segmentATrouver,
            new CodageAngleDroit3D(
              D,
              A,
              p.listePoints[numeroSommet],
              'green',
              2,
            ),
          )
          segmentAnnexe = segment(A.c2d, p.listePoints2d[numeroSommet], 'green')
          objetsEnonce.push(segmentAnnexe)
          segmentAnnexe = segment(D.c2d, A.c2d, 'green')
          objetsEnonce.push(segmentAnnexe)
          objetsEnonce.push(labelPoint(ptBase, D.c2d))
          texteCorr += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          reponse = arrondi(Math.sqrt(h ** 2 + r ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(A.label, D.label, ptBase.nom, 1, h, r, reponse, listeUnites[j], orangeMathalea, false, 2, true)[0]
          break
        case 8: // Rayon dans une sphère
          context.anglePerspective = randint(2, 6) * choice([10, -10])
          r = randint(4, 10)
          choixProfondeur = choice([1, 2, 4])
          r2 = r * Math.cos(((choixProfondeur / 6) * Math.PI) / 2)
          A = point3d(
            0,
            0,
            0,
            true,
            choisitLettresDifferentes(1, 'OQWX')[0],
            'left',
          )
          h = A.z + r * Math.sin(((choixProfondeur / 6) * Math.PI) / 2)
          B = point3d(r2, A.y, h, true)
          B = rotation3d(
            B,
            droite3d(A, vecteur3d(0, 0, 1)),
            context.anglePerspective < 0 ? 30 : -30,
          )
          B.label = choisitLettresDifferentes(1, 'OQWX' + A.label)[0]
          B.c2d.nom = B.label
          B.c2d.positionLabel = 'below'
          D = point3d(
            0,
            A.y,
            h,
            true,
            choisitLettresDifferentes(1, 'OQWX' + A.label + B.label)[0],
          )
          longueurATrouver = B.label + A.label
          segmentATrouver = segment(A.c2d, B.c2d, orangeMathalea)
          segmentATrouver.epaisseur = 2
          segmentATrouver.pointilles = 2
          segmentAnnexe = segment(D.c2d, B.c2d, 'black')
          segmentAnnexe.pointilles = 2
          h = arrondi(h, 1)
          r2 = arrondi(r2, 1)
          sph = sphere3d(
            A,
            r,
            'green',
            bleuMathalea,
            12,
            'lightgray',
            0,
            'black',
            true,
          )
          objetsEnonce = sph.c2d
          objetsEnonce.push(
            segmentATrouver,
            segmentAnnexe,
            tracePoint(B, D, A),
            labelPoint(A.c2d, D.c2d, B.c2d),
            new CodageAngleDroit3D(A, D, B, 'black', 1),
          )
          texte += `$${B.label}$ appartient à cette sphère de centre $${A.label}$. $${D.label}$ est un point à l'intérieur de la sphère, à $${texNombre(h)}\\text{ ${listeUnites[j]}}$ de $${A.label}$ et la distance entre $${B.label}$ et $${D.label}$ est de $${texNombre(r2)}\\text{ ${listeUnites[j]}}$. Calculer le rayon de la sphère, arrondi au dixième de ${listeUnites[j]}.<br>`
          texte += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          objetsEnonce = sph.c2d
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.color = colorToLatexOrHTML('green')
          objetsEnonce.push(
            segmentATrouver,
            segmentAnnexe,
            tracePoint(B, D, A),
            labelPoint(A.c2d, D.c2d, B.c2d),
            new CodageAngleDroit3D(A, D, B, 'green', 1),
          )
          segmentAnnexe = segment(D.c2d, A.c2d, 'green')
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.pointilles = 2
          objetsEnonce.push(segmentAnnexe)
          texteCorr += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          reponse = arrondi(Math.sqrt(h ** 2 + r2 ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(D.label, A.label, B.label, 1, h, r2, reponse, listeUnites[j], orangeMathalea, false, 2, true)[0]
          break
        case 9: // Hauteur dans une sphère
          context.anglePerspective = randint(2, 6) * choice([10, -10])
          r = randint(4, 10)
          choixProfondeur = choice([1, 2, 4])
          r2 = r * Math.cos(((choixProfondeur / 6) * Math.PI) / 2)
          A = point3d(
            0,
            0,
            0,
            true,
            choisitLettresDifferentes(1, 'OQWX')[0],
            'left',
          )
          h = A.z + r * Math.sin(((choixProfondeur / 6) * Math.PI) / 2)
          B = point3d(r2, A.y, h, true)
          B = rotation3d(
            B,
            droite3d(A, vecteur3d(0, 0, 1)),
            context.anglePerspective < 0 ? 30 : -30,
          )
          B.label = choisitLettresDifferentes(1, 'OQWX' + A.label)[0]
          B.c2d.nom = B.label
          B.c2d.positionLabel = 'below'
          D = point3d(
            0,
            A.y,
            h,
            true,
            choisitLettresDifferentes(1, 'OQWX' + A.label + B.label)[0],
          )
          longueurATrouver = B.label + D.label
          segmentATrouver = segment(D.c2d, B.c2d, orangeMathalea)
          segmentATrouver.epaisseur = 2
          segmentATrouver.pointilles = 2
          h = arrondi(h, 1)
          sph = sphere3d(
            A,
            r,
            'green',
            bleuMathalea,
            12,
            'lightgray',
            0,
            'black',
            true,
          )
          objetsEnonce = sph.c2d
          objetsEnonce.push(
            segmentATrouver,
            tracePoint(B, D, A),
            labelPoint(A.c2d, D.c2d, B.c2d),
            new CodageAngleDroit3D(A, D, B, 'black', 1),
          )
          texte += `$${B.label}$ appartient à cette sphère de centre $${A.label}$ de rayon $${texNombre(r)}\\text{ ${listeUnites[j]}}$. $${D.label}$ est un point à l'intérieur de la sphère, à $${texNombre(h)}\\text{ ${listeUnites[j]}}$ de $${A.label}$. Calculer la distance entre $${B.label}$ et $${D.label}$, arrondie au dixième de ${listeUnites[j]}.<br>`
          texte += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )

          objetsEnonce = sph.c2d
          segmentAnnexe = segment(D.c2d, A.c2d, 'green')
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.pointilles = 2
          objetsEnonce.push(
            segmentATrouver,
            segmentAnnexe,
            tracePoint(B, D, A),
            labelPoint(A.c2d, D.c2d, B.c2d),
            new CodageAngleDroit3D(A, D, B, 'green', 1),
          )
          segmentAnnexe = segment(B.c2d, A.c2d, 'green')
          segmentAnnexe.epaisseur = 2
          segmentAnnexe.pointilles = 2
          objetsEnonce.push(segmentAnnexe)
          texteCorr += mathalea2d(
            Object.assign(
              { optionsTikz: 'baseline=(current bounding box.north)' },
              fixeBordures(objetsEnonce),
              {
                scale: context.isHtml ? 0.7 : 0.3,
                display: 'block' as const,
              },
            ),
            objetsEnonce,
          )
          reponse = arrondi(Math.sqrt(r ** 2 - h ** 2), 1)
          texteCorr +=
            '<br>' +
            RedactionPythagore(D.label, B.label, A.label, 2, reponse, h, r, listeUnites[j], orangeMathalea, false, 2, true)[0]
          break
      }
      const reponseGrandeur = new Grandeur(reponse, listeUnites[j])
      handleAnswers(this, i, {
        reponse: {
          value: reponseGrandeur,
          options: {
            unite: true,
            precisionUnite:
              10 **
              (reponseGrandeur.puissanceUnite *
                reponseGrandeur.puissancePrefixe),
          },
        },
      })
      if (this.interactif && context.isHtml)
        texte +=
          `<br>$${longueurATrouver}\\approx$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
            texteApres: ' (Il faut penser à indiquer une unité.)',
          })

      if (context.isAmc) {
        const isAmcNum = this.sup2 === 2
        const propositionsAmc: AMCUneProposition[] = []
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: !isAmcNum,
          options: {
            ordered: false,
          },
          propositions: propositionsAmc,
        }
        if (isAmcNum) {
          propositionsAmc.push({
            type: 'AMCNum',
            propositions: [
              {
                reponse: {
                  // utilisé si type = 'AMCNum'
                  texte: '[[AMC_HIDDEN]]',
                  valeur: [reponse], // obligatoire (la réponse numérique à comparer à celle de l'élève). EE : Si une fraction est la réponse, mettre un tableau sous la forme [num,den]
                  alignement: 'center', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
                  param: {
                    digits: nombreDeChiffresDe(reponse), // obligatoire pour AMC (le nombre de chiffres dans le nombre, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                    decimals: 1, // obligatoire pour AMC (le nombre de chiffres dans la partie décimale du nombre, si decimals est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                    signe: false, // obligatoire pour AMC (présence d'une case + ou -)
                  },
                },
              },
            ],
          })
        } else {
          propositionsAmc.push({
            type: 'AMCOpen',
            propositions: [
              {
                texte: texteCorr,
                statut: 4, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                enonce: '[[AMC_HIDDEN]]',
                sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                pointilles: false, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
              },
            ],
          })
        }
      }

      if (this.questionJamaisPosee(i, nomSolide, r, h)) {
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
