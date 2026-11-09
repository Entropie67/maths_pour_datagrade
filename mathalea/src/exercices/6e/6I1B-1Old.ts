import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, numAlphaNum } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Calcule le cosinus d'un angle en degrés
 */
function degCos(deg: number): number {
  return Math.cos((deg * Math.PI) / 180)
}

/**
 * Calcule le sinus d'un angle en degrés
 */
function degSin(deg: number): number {
  return Math.sin((deg * Math.PI) / 180)
}

export const amcReady = true
export const amcType = 'AMCOpen'
export const titre = 'Programmer des déplacements relatifs (Scratch)'
export const dateDePublication = '05/02/2023'
export const dateDeModifImportante = '09/06/2025'
export const interactifReady = true

/**
 * * Colorier le déplacement d'un lutin
 * * 6I10-2
 * @author Guillaume Valmont
 * // d'après 6I10 de Erwan Duplessy
 * Ajout interactivité : Juin 2025 par Guillaume Valmont
 */
export const uuid = '594eb'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class ColorierDeplacementV2Old extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'instructions de déplacements",
      3,
      '1 : 3 instructions\n2 : 4 instructions\n3 : 5 instructions',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec une boucle']
    this.besoinFormulaire3CaseACocher = ['Inclure la possibilité de reculer']

    this.sup = 1 // nombre de commandes = this.sup + 2
    this.sup2 = false // 1 : sans boucle ; true : avec boucle
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.consigne = 'Dans le quadrillage, effectuer le programme.<br>'

    this.nbQuestionsModifiable = false
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    const lstObjet = [] // liste de tous les objets Mathalea2d
    let direction: 0 | 90 | 180 | 270 = 0 // Orientation du lutin en degrés
    let positionApresPremierDeplacement = 'A1'
    let positionApresDernierDeplacement = 'A1'
    function scratchblocksTikz(codeSvg: string, codeTikz: string) {
      // c'est une ancienne façon de faire. Maintenant il existe une fonction scratchblock() qui effectue la conversion scratch Latex -> scratchblock
      if (context.isHtml) {
        return codeSvg
      } else {
        return codeTikz
      }
    }

    function calculerDeplacementsLutin(
      rotation: 0 | 1,
      deplacement: 2 | 3,
    ): [number, number] {
      let ajoutX = 0
      let ajoutY = 0
      switch (rotation) {
        case 0:
          direction = (direction + 90 + 360) % 360
          break
        case 1:
          direction = (direction - 90 + 360) % 360
          break
      }
      switch (deplacement) {
        case 2:
          ajoutX = degCos(direction)
          ajoutY = degSin(direction)
          break
        case 3:
          ajoutX = -degCos(direction)
          ajoutY = -degSin(direction)
          break
      }
      return [ajoutX, ajoutY]
    }

    function fleche(x: number, y: number, direction: 0 | 90 | 180 | 270) {
      let depart, arrivee
      switch (direction) {
        case 0: // est
          depart = [x + 0.2, y - 0.5]
          arrivee = [x + 0.8, y - 0.5]
          break
        case 90: // nord
          depart = [x + 0.5, y - 0.8]
          arrivee = [x + 0.5, y - 0.2]
          break
        case 180: // ouest
          depart = [x + 0.8, y - 0.5]
          arrivee = [x + 0.2, y - 0.5]
          break
        case 270: // sud
          depart = [x + 0.5, y - 0.2]
          arrivee = [x + 0.5, y - 0.8]
          break
      }
      const fleche = segment(
        pointAbstrait(depart[0], depart[1]),
        pointAbstrait(arrivee[0], arrivee[1]),
      )
      fleche.styleExtremites = '->'
      fleche.color = colorToLatexOrHTML('white')
      return fleche
    }

    let texte = '' // texte de l'énoncé
    let texteCorr = '' // texte du corrigé
    let codeTikz = '' // code pour dessiner les blocs en tikz
    let codeSvg = '' // code pour dessiner les blocs en svg
    const nbCommandes = Number(parseInt(this.sup)) + 2 // nombre de commandes de déplacement dans un script
    let nbRepetition = 1 // Nombre de fois où la boucle est répétée.
    if (this.sup2) {
      nbRepetition = 3
    }
    const lstCommandesTikz = [
      '\\blockmove{Tourner à gauche}',
      '\\blockmove{Tourner à droite}',
      '\\blockmove{Avancer}',
      '\\blockmove{Reculer}',
      '\\blockmove{Colorier la case}',
    ]
    const lstCommandesSVG = [
      'Tourner à gauche',
      'Tourner à droite',
      'Avancer',
      'Reculer',
      'Colorier',
    ]
    codeTikz += '\\medskip \\begin{scratch} <br>'
    codeSvg += "<pre class='blocks'>"
    const lstNumCommande: (0 | 1 | 2 | 3 | 4)[] = [] // liste des commandes successives
    const lstDeplacements: [number, number][] = [] // Liste des [ajoutX, ajoutY] successifs
    const lstX = [0] // liste des abscisses successives
    const lstY = [0] // liste des ordonnées successives
    if (this.sup2) {
      codeSvg += `répéter (${nbRepetition}) fois <br>`
      codeTikz += `\\blockrepeat{répéter \\ovalnum{${nbRepetition}} fois} {`
    }
    for (let i = 0; i < nbCommandes; i++) {
      const rotation: 0 | 1 = choice([0, 1]) // choix d'une rotation
      const deplacement: 2 | 3 = this.sup3 ? choice([2, 3]) : 2 // choix d'un déplacement
      codeTikz += lstCommandesTikz[rotation] // ajout d'une rotation
      codeSvg += lstCommandesSVG[rotation] + '<br>' // ajout d'une rotation
      codeTikz += lstCommandesTikz[deplacement] // ajout d'un déplacement
      codeSvg += lstCommandesSVG[deplacement] + '<br>' // ajout d'un déplacement
      codeTikz += lstCommandesTikz[4] // ajout de l'instruction "Colorier"
      codeSvg += lstCommandesSVG[4] + '<br>' // ajout de l'instruction "Colorier"
      lstNumCommande.push(rotation, deplacement) // ajout d'une rotation et d'un déplacement
      lstNumCommande.push(4) // ajout de l'instruction "Colorier"
      const ajoutXY = calculerDeplacementsLutin(
        rotation as 0 | 1,
        deplacement as 2 | 3,
      )
      lstX.push(lstX[lstX.length - 1] + ajoutXY[0]) // calcul de la nouvelle abscisse
      lstY.push(lstY[lstY.length - 1] + ajoutXY[1]) // calcul de la nouvelle ordonnée
      lstDeplacements.push(ajoutXY)
    }
    for (let k = 0; k < nbRepetition - 1; k++) {
      for (
        let i = k * lstNumCommande.length;
        i < (k + 1) * lstNumCommande.length;
        i += 3
      ) {
        const ajoutXY = calculerDeplacementsLutin(
          (lstNumCommande[i % lstNumCommande.length] % 2) as 0 | 1,
          (2 + (lstNumCommande[(i + 1) % lstNumCommande.length] % 2)) as 2 | 3,
        )
        lstX.push(ajoutXY[0])
        lstY.push(ajoutXY[1])
      }
    }
    if (this.sup2) {
      codeSvg += 'fin <br>'
      codeTikz += '}'
    }
    codeSvg += '</pre>'
    codeTikz += '\\end{scratch}'

    const xLutinMin = Math.min(...lstX)
    const xLutinMax = Math.max(...lstX)
    const yLutinMin = Math.min(...lstY)
    const yLutinMax = Math.max(...lstY)

    if (context.isHtml) {
      texte += '<table style="width: 100%"><tr><td>'
    } else {
      texte += '\\begin{minipage}[t]{.25\\textwidth}'
    }

    texte += scratchblocksTikz(codeSvg, codeTikz)

    if (context.isHtml) {
      texte += '</td><td>'
      texte += '             '
      texte += '</td><td style="vertical-align: top; text-align: center">'
    } else {
      texte += '\\end{minipage} '
      texte += '\\hfill \\begin{minipage}[t]{.74\\textwidth}'
    }

    const xGrilleMin = xLutinMin - 2
    const xGrilleMax = xLutinMax + 3
    const yGrilleMin = yLutinMin - 3
    const yGrilleMax = yLutinMax + 2

    const r2 = grille(
      xGrilleMin,
      yGrilleMin,
      xGrilleMax,
      yGrilleMax,
      'black',
      0.8,
      1,
    )
    lstObjet.push(r2)

    let p // carré gris représentant le lutin en position de départ
    p = polygone(
      pointAbstrait(lstX[0], lstY[0]),
      pointAbstrait(lstX[0] + 1, lstY[0]),
      pointAbstrait(lstX[0] + 1, lstY[0] - 1),
      pointAbstrait(lstX[0], lstY[0] - 1),
    )
    p.opacite = 0.5
    p.couleurDeRemplissage = colorToLatexOrHTML('black')
    p.opaciteDeRemplissage = 0.5
    p.epaisseur = 0
    lstObjet.push(p, fleche(lstX[0], lstY[0], 0))
    let txt = '' // variable temporaire
    for (let j = 0; j < xGrilleMax - xGrilleMin; j++) {
      txt = String.fromCharCode(65 + j) // ascii 65 = A
      lstObjet.push(
        texteParPosition(
          txt,
          xGrilleMin + j + 0.5,
          yGrilleMax + 0.5,
          0,
          'black',
          1,
          'milieu',
        ),
      ) // affiche de A à J... en haut de la grille
    }
    for (let i = 0; i < yGrilleMax - yGrilleMin; i++) {
      lstObjet.push(
        texteParPosition(
          String(i + 1),
          xGrilleMin - 0.25,
          yGrilleMax - i - 0.5,
          0,
          'black',
          1,
          'milieu',
        ),
      ) // affiche de 0 à 9... à gauche de la grille
    }
    const mathalea2dEnonce = mathalea2d(
      {
        xmin: xGrilleMin - 3,
        xmax: xGrilleMax + 1,
        ymin: yGrilleMin - 1,
        ymax: yGrilleMax + 1,
        pixelsParCm: 20,
        scale: 0.5,
      },
      lstObjet,
    )

    // CORRECTION
    // 0 : gauche, 1 : droite, 2 : haut, 3 : bas, 4 : colorier.
    let xLutin = 0 // position initiale du carré
    let yLutin = 0 // position initiale du carré
    const couleur = 'red'

    // on fait un dessin par passage dans la boucle
    if (context.isHtml) {
      texteCorr +=
        '<table style="width:100%"><tr><td style="text-align:center">'
    } else {
      texteCorr += '\\begin{minipage}{.49\\textwidth}'
    }
    direction = 0
    for (let k = 0; k < nbRepetition; k++) {
      for (
        let i = k * lstNumCommande.length;
        i < (k + 1) * lstNumCommande.length;
        i += 3
      ) {
        const ajoutXY = calculerDeplacementsLutin(
          (lstNumCommande[i % lstNumCommande.length] % 2) as 0 | 1,
          (2 + (lstNumCommande[(i + 1) % lstNumCommande.length] % 2)) as 2 | 3,
        )
        xLutin += ajoutXY[0]
        yLutin += ajoutXY[1]
        p = polygone(
          pointAbstrait(xLutin, yLutin),
          pointAbstrait(xLutin + 1, yLutin),
          pointAbstrait(xLutin + 1, yLutin - 1),
          pointAbstrait(xLutin, yLutin - 1),
        )
        p.couleurDeRemplissage = colorToLatexOrHTML(couleur)
        p.opaciteDeRemplissage = 0.25
        p.epaisseur = 0
        lstObjet.push(p)
        if (i === 0) {
          positionApresPremierDeplacement =
            lettreDepuisChiffre(xLutin - xGrilleMin + 1) +
            (yGrilleMax - yLutin + 1) // position finale du lutin
        }
      }
      lstObjet.push(p, fleche(xLutin, yLutin, direction))
      if (this.sup2) {
        texteCorr += `Passage n° $${k + 1}$ dans la boucle : <br>`
      }
      texteCorr += mathalea2d(
        {
          xmin: xGrilleMin - 3,
          xmax: xGrilleMax + 1,
          ymin: yGrilleMin - 1,
          ymax: yGrilleMax + 1,
          pixelsParCm: 20,
          scale: 0.4,
        },
        lstObjet,
      )
      if (context.isHtml) {
        if (k % 3 === 2) {
          texteCorr += '</td></tr><tr><td style="text-align:center">' // retour à la ligne après 3 grilles dessinées en HTML
        } else {
          texteCorr += '</td><td></td><td style="text-align:center">'
        }
      } else {
        texteCorr += '\\end{minipage}'
        if (k % 2 === 1) {
          texteCorr += '\\\\ '
        } // retour à la ligne après 2 grilles dessinées en LaTeX
        texteCorr += '\\begin{minipage}{.49\\textwidth}'
      }
    }
    positionApresDernierDeplacement =
      lettreDepuisChiffre(xLutin - xGrilleMin + 1) + (yGrilleMax - yLutin + 1) // position finale du lutin
    if (context.isHtml) texteCorr += '</td></tr></table>'
    else texteCorr += '\\end{minipage}'

    if (context.isAmc) {
      this.autoCorrectionAMC = [
        { propositions: [{ texte: '', statut: 3, sanscadre: true }] },
      ]
      this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
        amcConvert(questionAMC),
      )
    }

    texte +=
      'Au départ, le lutin est situé dans la case grisée. Chaque déplacement se fait dans une case adjacente. Exécuter le programme.'

    texte += '<br><br>'
    if (!context.isHtml) {
      texte += '\\begin{center}'
    }
    texte += mathalea2dEnonce
    if (context.isHtml) {
      texte += '</td></tr></table>'
    } else {
      texte += '\\end{center}\\end{minipage} '
      texte += '\\hfill \\null'
    }

    if (this.interactif && context.isHtml) {
      texte += `<br>
      ${numAlphaNum(0)} Quelle est la première case coloriée par le lutin ? ${ajouteChampTexteMathLive(this, 0, KeyboardType.alphanumeric, { placeholder: 'A1' })}`
      handleAnswers(this, 0, {
        reponse: {
          value: positionApresPremierDeplacement,
          options: { texteSansCasse: true },
        },
      })
      texte += `<br>
      ${numAlphaNum(1)} Quelle est la dernière case coloriée par le lutin ? ${ajouteChampTexteMathLive(this, 1, KeyboardType.alphanumeric, { placeholder: 'A1' })}`
      handleAnswers(this, 1, {
        reponse: {
          value: positionApresDernierDeplacement,
          options: { texteSansCasse: true },
        },
      })
      texteCorr += `<br>
      La première case coloriée par le lutin est ${texteEnCouleurEtGras(positionApresPremierDeplacement)}.<br>
      La dernière case coloriée par le lutin est ${texteEnCouleurEtGras(positionApresDernierDeplacement)}.`
    }

    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
  }
}
