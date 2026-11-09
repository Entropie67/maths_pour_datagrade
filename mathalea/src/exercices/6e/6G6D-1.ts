import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, miseEnCouleur } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import Exercice from '../Exercice'

export const titre = 'Déterminer un angle dans un triangle et sa nature'
export const dateDePublication = '11/01/2023'
export const dateDeModifImportante = '13/09/2026' // Rémi Angot ajout de l'interactivité (liste déroulante + champ numérique)
export const interactifReady = true

const choixNatureTriangle = [
  { label: 'Choisir…', value: '' },
  { label: 'Quelconque', value: 'quelconque' },
  { label: 'Rectangle', value: 'rectangle' },
  { label: 'Isocèle', value: 'isocèle' },
  { label: 'Isocèle rectangle', value: 'isocèle rectangle' },
  { label: 'Équilatéral', value: 'équilatéral' },
]

/**
 * Déterminer la valeur d'un angle dans un triangle et sa nature.
 *
 * Correction avec ou sans détails.
 * * Triangle quelconque.
 * * Triangle rectangle.
 * * Triangle isocèle.
 * * Triangle isocèle rectangle.
 * * Triangle équilatéral
 * @author Sébastien LOZANO
 */

export const uuid = 'c2f77'

export const refs = {
  'fr-fr': ['6G6D-1'],
  'fr-2016': ['5G31-2'],
  'fr-ch': ['1mG1-1', '9R1ES2A-7', '9R2ES2A-7', '9R3ES2A-7', 'PRQES01C-4'],
}

// Les en-têtes du tableau ne doivent pas contenir de `$` imbriqué dans
// `\text{}` : la conversion LaTeX → Typst ne sait pas les traiter.
// `nom` est une chaîne en mode maths (`$\;\widehat{AGE}$`).
const enteteAngle = (nom: string): string => nom.replaceAll('$', '')
const enteteNature = (nomTriangle: string): string =>
  `\\text{Nature du triangle }${nomTriangle}`

interface SortieAffichageFactorise {
  enonce: {
    valeurs: (string | number)[]
    noms: string[]
    tableau: string
  }
  correction: {
    valeurs: number[]
    noms: string[]
    tableau: string
    details: string
  }
}

interface SortieTypeTriangle {
  texte: string
  texteCorr: string
  natureTriangleCorr: string
}

export default class AnglesTrianglesTableau extends Exercice {
  sup: number
  nbQuestions: number
  spacingCorr: number
  spacing: number
  consigneModifiable: boolean
  correctionDetailleeDisponible: boolean
  correctionDetaillee: boolean
  besoinFormulaireNumerique: [string, number, string]

  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 1
    this.spacingCorr = context.isHtml ? 2 : 1.5
    this.spacing = context.isHtml ? 2 : 2
    this.consigneModifiable = false
    this.correctionDetailleeDisponible = true
    // Correction détaillée par défaut
    this.correctionDetaillee = true
    this.besoinFormulaireNumerique = [
      'Type de triangle',
      4,
      ' 1 : Quelconque \n 2 : Rectangle \n 3 : Isocèle ou équilatéral \n 4 : Mélange',
    ]
  }

  // Une fonction pour calculer le troisième angle d'un triangle
  troisiemeAngle(a1: number, a2: number): number {
    let sortie = -1
    if (a1 + a2 < 180) {
      sortie = 180 - (a1 + a2)
    }
    return sortie
  }

  // Une fonction pour factoriser
  affichageFactorise(
    triangle: Triangle,
    type: string,
    choix: number,
  ): SortieAffichageFactorise {
    const sortie: SortieAffichageFactorise = {
      enonce: { valeurs: [], noms: [], tableau: '' },
      correction: { valeurs: [], noms: [], tableau: '', details: '' },
    }
    sortie.enonce.noms = [
      triangle.getAngles()[0],
      triangle.getAngles()[1],
      triangle.getAngles()[2],
    ]
    sortie.correction.valeurs = [triangle.a1, triangle.a2, triangle.a3]
    sortie.correction.noms = [
      triangle.getAngles()[0],
      triangle.getAngles()[1],
      triangle.getAngles()[2],
    ]
    let sommeAnglesConnus = 0
    switch (choix) {
      case 0:
        sommeAnglesConnus =
          sortie.correction.valeurs[1] + sortie.correction.valeurs[2]
        sortie.enonce.valeurs = ['\\ldots', triangle.a2, triangle.a3]
        sortie.correction.details = `Donc ${sortie.enonce.noms[0]} $=180^\\circ-($ ${sortie.enonce.noms[1]} $+$ ${sortie.enonce.noms[2]} $)$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[0]} $=180^\\circ-( ${sortie.enonce.valeurs[1]}^\\circ + ${sortie.enonce.valeurs[2]}^\\circ )$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[0]} $=180^\\circ-${sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[0]} $=${180 - sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.tableau = `${tableauColonneLigne(
          [
            enteteAngle(sortie.enonce.noms[0]),
            enteteAngle(sortie.enonce.noms[1]),
            enteteAngle(sortie.enonce.noms[2]),
            enteteNature(triangle.nom),
          ],
          [miseEnEvidence(`${sortie.correction.valeurs[0]}^\\circ`)],
          [
            `${sortie.correction.valeurs[1]}^\\circ`,
            `${sortie.correction.valeurs[2]}^\\circ`,
            miseEnCouleur(`\\textbf{${type}}`),
          ],
          1.5,
        )}`
        break
      case 1:
        sommeAnglesConnus =
          sortie.correction.valeurs[0] + sortie.correction.valeurs[2]
        sortie.enonce.valeurs = [triangle.a1, '\\ldots', triangle.a3]
        sortie.correction.details = `Donc ${sortie.enonce.noms[1]} $=180^\\circ-($ ${sortie.enonce.noms[0]} $+$ ${sortie.enonce.noms[2]} $)$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[1]} $=180^\\circ-( ${sortie.enonce.valeurs[0]}^\\circ + ${sortie.enonce.valeurs[2]}^\\circ )$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[1]} $=180^\\circ-${sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[1]} $=${180 - sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.tableau = `${tableauColonneLigne(
          [
            enteteAngle(sortie.enonce.noms[0]),
            enteteAngle(sortie.enonce.noms[1]),
            enteteAngle(sortie.enonce.noms[2]),
            enteteNature(triangle.nom),
          ],
          [`${sortie.correction.valeurs[0]}^\\circ`],
          [
            miseEnEvidence(`${sortie.correction.valeurs[1]}^\\circ`),
            `${sortie.correction.valeurs[2]}^\\circ`,
            miseEnCouleur(`\\textbf{${type}}`),
          ],
          1.5,
        )}`
        break
      case 2:
        sommeAnglesConnus =
          sortie.correction.valeurs[1] + sortie.correction.valeurs[0]
        sortie.enonce.valeurs = [triangle.a1, triangle.a2, '\\ldots']
        sortie.correction.details = `Donc ${sortie.enonce.noms[2]} $=180^\\circ-($ ${sortie.enonce.noms[1]} $+$ ${sortie.enonce.noms[0]} $)$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[2]} $=180^\\circ-( ${sortie.enonce.valeurs[1]}^\\circ + ${sortie.enonce.valeurs[0]}^\\circ )$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[2]} $=180^\\circ-${sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.details += `Donc ${sortie.enonce.noms[2]} $=${180 - sommeAnglesConnus}^\\circ$.<br>`
        sortie.correction.tableau = `${tableauColonneLigne(
          [
            enteteAngle(sortie.enonce.noms[0]),
            enteteAngle(sortie.enonce.noms[1]),
            enteteAngle(sortie.enonce.noms[2]),
            enteteNature(triangle.nom),
          ],
          [`${sortie.correction.valeurs[0]}^\\circ`],
          [
            `${sortie.correction.valeurs[1]}^\\circ`,
            miseEnEvidence(`${sortie.correction.valeurs[2]}^\\circ`),
            miseEnCouleur(`\\textbf{${type}}`),
          ],
          1.5,
        )}`
        break
    }
    sortie.enonce.tableau = `${tableauColonneLigne(
      [
        enteteAngle(sortie.enonce.noms[0]),
        enteteAngle(sortie.enonce.noms[1]),
        enteteAngle(sortie.enonce.noms[2]),
        enteteNature(triangle.nom),
      ],
      [`${sortie.enonce.valeurs[0]}^\\circ`],
      [
        `${sortie.enonce.valeurs[1]}^\\circ`,
        `${sortie.enonce.valeurs[2]}^\\circ`,
        '',
      ],
      1.5,
    )}`

    return sortie
  }

  // Une fonction pour le controle de tous les cas
  typeTriangle(type: string, questionIndex: number): SortieTypeTriangle {
    const sortie: SortieTypeTriangle = {
      texte: '',
      texteCorr: '',
      natureTriangleCorr: '',
    }
    // On crée le triangle
    const triangle = new Triangle()
    switch (type) {
      case 'quelconque':
        do {
          triangle.a1 = randint(10, 40, [90])
          triangle.a2 = randint(20, 100, [triangle.a1, 90, 90 - triangle.a1])
          triangle.a3 = this.troisiemeAngle(triangle.a1, triangle.a2)
        } while (
          triangle.a3 === -1 ||
          triangle.a3 === triangle.a1 ||
          triangle.a3 === triangle.a2
        )
        sortie.natureTriangleCorr = `Le triangle ${triangle.getNom()} ne présente aucune particularité donc c'est un triangle ${type}.`
        break
      case 'rectangle':
        triangle.a1 = 90
        triangle.a2 = randint(20, 100, [triangle.a1])
        triangle.a3 = this.troisiemeAngle(triangle.a1, triangle.a2)
        while (triangle.a3 === -1) {
          triangle.a1 = 90
          triangle.a2 = randint(20, 100, [triangle.a1])
          triangle.a3 = this.troisiemeAngle(triangle.a1, triangle.a2)
        }
        sortie.natureTriangleCorr = `Le triangle ${triangle.getNom()} a un angle droit en ${triangle.getSommets()[0]} donc c'est un triangle rectangle en ${triangle.getSommets()[0]}.`
        break
      case 'isocèle':
        triangle.a1 = randint(20, 100, [90])
        triangle.a2 = triangle.a1
        triangle.a3 = this.troisiemeAngle(triangle.a1, triangle.a2)
        while (triangle.a3 === -1) {
          triangle.a1 = randint(20, 100, [90])
          triangle.a2 = triangle.a1
          triangle.a3 = this.troisiemeAngle(triangle.a1, triangle.a2)
        }
        sortie.natureTriangleCorr = `Le triangle ${triangle.getNom()} a deux angles égaux en ${triangle.getSommets()[1]} et en ${triangle.getSommets()[2]} donc c'est un triangle isocèle en ${triangle.getSommets()[0]}.`
        break
      case 'isocèle rectangle':
        triangle.a1 = 90
        triangle.a2 = 45
        triangle.a3 = triangle.a2
        sortie.natureTriangleCorr = `Le triangle ${triangle.getNom()} a un angle droit en ${triangle.getSommets()[0]} et deux angles égaux donc c'est un triangle rectangle isocèle en ${triangle.getSommets()[0]}.`
        break
      case 'équilatéral':
        triangle.a1 = 60
        triangle.a2 = 60
        triangle.a3 = triangle.a2
        sortie.natureTriangleCorr = `Le triangle ${triangle.getNom()} a trois angles égaux donc c'est un triangle équilatéral.`
        break
    }
    // On choisit l'angle çà calculer aléatoirement
    const choix = randint(0, 2)
    // On mélange pour l'affichage
    const anglesEnonce = this.affichageFactorise(triangle, type, choix).enonce
    const anglesCorrection = this.affichageFactorise(
      triangle,
      type,
      choix,
    ).correction
    if (this.interactif) {
      // Tableau interactif : l'angle manquant devient un champ numérique et
      // la nature du triangle une liste déroulante, directement dans les
      // cellules du tableau.
      const tableauInteractif =
        AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          [
            enteteAngle(anglesEnonce.noms[0]),
            enteteAngle(anglesEnonce.noms[1]),
            enteteAngle(anglesEnonce.noms[2]),
            enteteNature(triangle.nom),
          ],
          [choix === 0 ? '' : `${anglesCorrection.valeurs[0]}^\\circ`],
          [
            choix === 1 ? '' : `${anglesCorrection.valeurs[1]}^\\circ`,
            choix === 2 ? '' : `${anglesCorrection.valeurs[2]}^\\circ`,
            '',
          ],
        )
      const celluleAngle =
        choix === 0
          ? tableauInteractif.headingLines[0]
          : tableauInteractif.raws[0][choix - 1]
      celluleAngle.options = { texteApres: '$^\\circ$' }
      tableauInteractif.raws[0][2].options = { choices: choixNatureTriangle }
      sortie.texte = AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        questionIndex,
        tableauInteractif,
        KeyboardType.nombresEtDegre ?? '',
        true,
        {},
      ).output
      handleAnswers(
        this,
        questionIndex,
        {
          [`L1C${choix}`]: { value: anglesCorrection.valeurs[choix] },
          L1C3: { value: type },
        },
        { formatInteractif: 'tableau-mathlive' },
      )
    } else {
      sortie.texte = anglesEnonce.tableau
    }
    if (this.correctionDetaillee) {
      sortie.texteCorr = `Dans le triangle ${triangle.getNom()}, `
      sortie.texteCorr += `${anglesEnonce.noms[0]} + ${anglesEnonce.noms[1]} + ${anglesEnonce.noms[2]} $=180^\\circ$.<br>`
      sortie.texteCorr += `${anglesCorrection.details}<br>`
    }
    sortie.texteCorr += context.isHtml ? '' : '\\medskip '
    sortie.texteCorr += `${anglesCorrection.tableau} <br>`
    sortie.texteCorr += context.isHtml ? '' : '<br>\\medskip '
    if (this.correctionDetaillee) {
      sortie.texteCorr += sortie.natureTriangleCorr
    }
    return sortie
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[]
    switch (this.sup) {
      case 1: // quelconque
        typesDeQuestionsDisponibles = [1]
        break
      case 2: // rectangle
        typesDeQuestionsDisponibles = [2, 4]
        break
      case 3: // isocele - equilatéral
        typesDeQuestionsDisponibles = [3, 4, 5]
        break
      default:
        typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]
        break
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    if (this.nbQuestions === 1) this.consigne =
          "Compléter le tableau suivant avec la mesure de l'angle manquant et la nature du triangle."
    else this.consigne =
          "Compléter les tableaux suivants avec la mesure de l'angle manquant et la nature du triangle."

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (this.correctionDetaillee) {
        texteCorr =
          'Dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
      } else {
        texteCorr = ''
      }
      switch (listeTypeDeQuestions[i]) {
        case 1:
          {
            // triangle quelconque
            const currentTriangle = this.typeTriangle('quelconque', i)
            texte = currentTriangle.texte
            texteCorr = currentTriangle.texteCorr
          }
          break
        case 2:
          {
            // triangle rectangle
            const currentTriangle = this.typeTriangle('rectangle', i)
            texte = currentTriangle.texte
            texteCorr = currentTriangle.texteCorr
          }
          break
        case 3:
          {
            // triangle isocèle
            const currentTriangle = this.typeTriangle('isocèle', i)
            texte = currentTriangle.texte
            texteCorr = currentTriangle.texteCorr
          }
          break
        case 4:
          {
            // triangle isocèle rectangle
            const currentTriangle = this.typeTriangle('isocèle rectangle', i)
            texte = currentTriangle.texte
            texteCorr = currentTriangle.texteCorr
          }
          break
        case 5:
        default:
          {
            // triangle équilatéral
            const currentTriangle = this.typeTriangle('équilatéral', i)
            texte = currentTriangle.texte
            texteCorr = currentTriangle.texteCorr
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
