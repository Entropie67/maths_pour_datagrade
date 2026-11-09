import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { runAStar } from '../../modules/findPath'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { LabyrintheBlocklyElement } from '../../lib/customElements/LabyrintheBlockly'

export const titre = "Programmer le déplacement d'un bus"
export const dateDePublication = '15/07/2025'

export const interactifReady = true

/**
 * Programmer la construction d’un chemin simple : New programme de 6eme 2025
 * @author Mickael Guironnet
 */

export const uuid = 'f320c'

export const refs = {
  'fr-fr': ['6I1D'],
  'fr-2016': ['6I15'],
  'fr-ch': [],
}
export default class ExerciceLabyrintheChemin extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireNumerique = [
      'Nombre de lignes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de colonnes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.sup = 5
    this.sup2 = 4
  }

  nouvelleVersion(): void {
    for (
      let q = 0, cpt = 0, texte, texteCorr: string;
      q < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      const nbL =
        this.sup === 1 ? randint(2, 5) : Math.min(Math.max(2, this.sup), 5)
      const nbC =
        this.sup === 1 ? randint(3, 5) : Math.min(Math.max(3, this.sup2), 5)
      const startCol = randint(0, nbC - 1)
      const endCol = randint(0, nbC - 1, [startCol])
      const parcours = this.generatePath(nbC, nbL, 0, startCol, nbL - 1, endCol)
      const villeDepart =
        parcours.villeParCoord[startCol][0] || 'Ville de départ'
      const villeArrivee =
        parcours.villeParCoord[endCol][nbL - 1] || "Ville d'arrivée"
      texte = `Retrouver les instructions pour représenter le parcours d'un bus entre ${villeDepart} et ${villeArrivee}.<br>`

      if (context.isHtml) {
        texte += this.generateGrapheSVG(
          `${this.numeroExercice}_${q}`,
          nbC,
          nbL,
          0,
          startCol,
          nbL - 1,
          endCol,
          parcours,
        )
      } else {
        texte += this.generateGrapheTikz(
          `${this.numeroExercice}_${q}`,
          nbC,
          nbL,
          0,
          startCol,
          nbL - 1,
          endCol,
          parcours,
        )
      }
      texteCorr =
        'Le bus part du lieu : ' +
        parcours.villeParCoord[startCol][0] +
        ' et arrive au lieu : ' +
        parcours.villeParCoord[endCol][nbL - 1] +
        '.<br>'
      texteCorr += 'Le bus suit le chemin suivant :<br>'
      texteCorr +=
        parcours.path
          .map((p) => `${parcours.villeParCoord[p[0]][p[1]]}`)
          .join(' → ') + '<br>'
      texteCorr +=
        'Voici une solution possible des instructions pour le trajet du bus :<br>'
      createSolutionStr(parcours.edges).forEach((instruction, index) => {
        const parts = instruction.split('-')
        const lieu = parts.length > 1 ? parts[1].trim() : instruction.trim()
        texteCorr += `${index + 1} - ${texteEnCouleurEtGras(lieu)}<br>`
      })
      if (this.interactif) {
        texte += `<div class="ml-2 py-2" id="resultatCheckEx${this.numeroExercice}Q${q}"></div>`
      }

      /****************************************************/
      if (this.questionJamaisPosee(q, texte)) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        q++
      }
      listeQuestionsToContenu(this)
    }
  }

  generatePath(
    cols: number,
    rows: number,
    rowsStart: number,
    colsStart: number,
    rowsEnd: number,
    colsEnd: number,
  ): {
    path: number[][]
    edges: { from: number[]; to: number[] }[]
    villeParCoord: string[][]
  } {
    const start: [number, number] = [colsStart, rowsStart]
    const end: [number, number] = [colsEnd, rowsEnd]

    const cityList = [
      'le stade',
      'la boulangerie',
      'la patisserie',
      "l'école",
      'la poste',
      'la mairie',
      'le fleuriste',
      'le garagiste',
      'la gare',
      'la piscine',
      'la pharmacie',
      "l'hôpital",
      'la banque',
      'la librairie',
      'le cinéma',
      'le musée',
      'les pompiers',
      'le marché',
      'le restaurant',
      "l'hôtel",
      'la laverie',
      'le parking',
      'la caserne',
      'la station-service',
      'le Bar',
    ]

    const getCityName = (() => {
      const used = new Set()
      return () => {
        let name
        do {
          name = cityList[randint(0, cityList.length - 1)]
        } while (used.has(name))
        used.add(name)
        return name
      }
    })()

    function generateSimplePath(
      start: [number, number],
      end: [number, number],
    ) {
      let [x, y] = start
      const [targetX, targetY] = end
      const result = [[x, y]]

      // Calcule les déplacements nécessaires
      const dx = targetX - x
      const dy = targetY - y

      // Liste de mouvements à effectuer (pas à pas)
      const steps: Array<[number, number]> = []

      for (let i = 0; i < Math.abs(dx); i++) {
        steps.push([Math.sign(dx), 0])
      }
      for (let i = 0; i < Math.abs(dy); i++) {
        steps.push([0, Math.sign(dy)])
      }

      // Mélange aléatoire de l'ordre des pas
      for (let i = steps.length - 1; i > 0; i--) {
        const j = randint(0, i)
        const temp = steps[i]
        steps[i] = steps[j]
        steps[j] = temp
      }

      // Applique les mouvements
      for (const [dx, dy] of steps) {
        x += dx
        y += dy
        result.push([x, y])
      }

      return result
    }

    let path: number[][]
    const paths2 = runAStar(rows, cols, rowsStart, colsStart, rowsEnd, colsEnd)
    if (paths2) {
      paths2.sort((a, b) => b.length - a.length) // On trie les chemins du plus court au plus long...
      path = paths2[randint(0, paths2.length - 1)].map((node) => [
        node.x,
        node.y,
      ])
    } else {
      path = generateSimplePath(start, end)
    }

    const edges: { from: number[]; to: number[] }[] = []
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i]
      const to = path[i + 1]
      edges.push({ from, to })
    }

    const villeParCoord: string[][] = []
    for (let x = 0; x < cols; x++) {
      villeParCoord[x] = []
      for (let y = 0; y < rows; y++) {
        villeParCoord[x][y] = getCityName()
      }
    }

    return {
      path,
      edges,
      villeParCoord,
    }
  }

  generateGrapheTikz(
    id: string,
    cols: number,
    rows: number,
    rowsStart: number,
    colsStart: number,
    rowsEnd: number,
    colsEnd: number,
    parcours: {
      path: number[][]
      edges: { from: number[]; to: number[] }[]
      villeParCoord: string[][]
    },
  ): string {
    const flattenByRows = function (): string[] {
      const result: string[] = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          result.push(removeFirstWord(parcours.villeParCoord[x][y]))
        }
      }
      return result
    }

    const pathsString = parcours.path.map((p) => `${p[0]}/${p[1]}`).join(', ')

    return `
    \\begingroup
\\begin{tikzpicture}[
    >=Stealth,
    every node/.style={
        draw, ellipse, minimum height=10mm, text width=14mm, align=center, font=\\sffamily\\footnotesize
    }
]

  % Définir variables locales pour les dimensions
  \\pgfmathsetmacro{\\rows}{${rows}}
  \\pgfmathsetmacro{\\cols}{${cols}}

  % Liste des villes (au moins rows × cols)
  \\def\\citylist{{${flattenByRows()
    .map((v) => `"${v}"`)
    .join(', ')}}}

  % Chemin donné par une suite de coordonnées (x,y)
  \\def\\pathcoords{${pathsString}}

  % Extraction du premier et dernier élément
  \\def\\firstcoord{}
  \\def\\lastcoord{}
  \\foreach \\x/\\y [count=\\i] in \\pathcoords {
    \\edef\\coord{\\x/\\y}
    \\ifnum\\i=1
      \\xdef\\firstcoord{\\coord}
    \\fi
    \\xdef\\lastcoord{\\coord}
  }

  % Placement des nœuds
  \\foreach \\j in {0,...,\\numexpr\\rows-1} {
    \\foreach \\i in {0,...,\\numexpr\\cols-1} {
      \\pgfmathtruncatemacro{\\index}{\\j * \\cols + \\i}
      \\pgfmathsetmacro{\\x}{\\i * 3} % horizontal spacing
      \\pgfmathsetmacro{\\y}{(\\rows - 1 - \\j) * 2} % vertical spacing
      \\edef\\coord{\\i/\\j}
      \\ifx\\coord\\firstcoord
        \\node[fill=gray!20] (C\\i\\j) at (\\x,\\y) {\\pgfmathparse{\\citylist[\\index]}\\pgfmathresult};
      \\else\\ifx\\coord\\lastcoord
        \\node[fill=gray!20] (C\\i\\j) at (\\x,\\y) {\\pgfmathparse{\\citylist[\\index]}\\pgfmathresult};
      \\else
        \\node (C\\i\\j) at (\\x,\\y) {\\pgfmathparse{\\citylist[\\index]}\\pgfmathresult};
      \\fi\\fi
    }
  }

  % Arêtes par défaut (grises)
  \\foreach \\j in {0,...,\\numexpr\\rows-1} {
    \\foreach \\i in {0,...,\\numexpr\\cols-2} {
      \\draw[->,gray] (C\\i\\j) -- (C\\the\\numexpr\\i+1\\relax\\j);
    }
  }

  \\foreach \\j in {0,...,\\numexpr\\rows-2} {
    \\foreach \\i in {0,...,\\numexpr\\cols-1} {
      \\draw[->,gray] (C\\i\\j) -- (C\\i\\the\\numexpr\\j+1\\relax);
    }
  }

  % Chemin rouge
   \\foreach \\xA/\\yA [count=\\i] in \\pathcoords {
    \\ifnum\\i>1
      \\pgfmathsetmacro{\\xprev}{\\xA}
      \\pgfmathsetmacro{\\yprev}{\\yA}
      \\draw[->, red] (C\\prevx\\prevy) -- (C\\xA\\yA);
    \\fi
    \\xdef\\prevx{\\xA}
    \\xdef\\prevy{\\yA}
  }

  % Macros d'extraction
  \\def\\getx#1/#2\\relax{#1} % Prend la partie avant le /
  \\def\\gety#1/#2\\relax{#2} % Prend la partie après le /

  % Extraction effective
  \\edef\\fx{\\expandafter\\getx\\firstcoord\\relax}
  \\edef\\fy{\\expandafter\\gety\\firstcoord\\relax}

  % Convertir en coordonnées TikZ
  \\pgfmathsetmacro\\xstart{\\fx * 3}
  \\pgfmathsetmacro\\ystart{(\\rows - 1 - \\fy) * 2}

  % Robot : une flèche en triangle
  \\begin{scope}[shift={(\\xstart,\\ystart)}, rotate=0, scale=1,opacity=0.3]
    \\filldraw[fill=gray, draw=black]
      (-0.8,-0.3) -- (0.2,-0.3) -- (0.2,-0.5) -- (1,0) -- (0.2,0.5) -- (0.2,0.3) -- (-0.8,0.3) -- cycle;
  \\end{scope}

\\end{tikzpicture}
\\endgroup\\\\

Les instructions à utiliser sont les suivantes :

\\setscratch{scale=0.8,line width=1pt}
\\begin{scratch}
\\blockmove{Avancer}
\\end{scratch}
ou
\\begin{scratch}
\\blockmove{Tourner à gauche}
\\end{scratch}
ou
\\begin{scratch}
\\blockmove{Tourner à droite}
\\end{scratch}.
 `
  }

  generateGrapheSVG(
    id: string,
    cols: number,
    rows: number,
    rowsStart: number,
    colsStart: number,
    rowsEnd: number,
    colsEnd: number,
    parcours: {
      path: number[][]
      edges: { from: number[]; to: number[] }[]
      villeParCoord: string[][]
    },
  ): string {
    return LabyrintheBlocklyElement.create({
      graphId: id,
      cols,
      rows,
      start: [colsStart, rowsStart],
      end: [colsEnd, rowsEnd],
      path: parcours.path,
      edges: parcours.edges,
      villeParCoord: parcours.villeParCoord,
      interactif: this.interactif,
    })
  }

  correctionInteractive = (i: number) => {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    let result = 'KO'
    const id: string = `${this.numeroExercice}_${i}`
    const labyrinthe = document.querySelector<LabyrintheBlocklyElement>(
      `#${LabyrintheBlocklyElement.elementTag}${id}`,
    )
    if (labyrinthe) this.answers[`blocklyDiv${id}`] = labyrinthe.value

    const spanResultat = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )
    const divFeedback = document.querySelector<HTMLElement>(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (spanResultat) spanResultat.innerHTML = ''

    if (labyrinthe) {
      if (labyrinthe.check()) {
        result = 'OK'
        if (spanResultat) spanResultat.innerHTML = '😎'
      } else {
        if (spanResultat) spanResultat.innerHTML = '☹️'
        if (divFeedback) {
          divFeedback.innerHTML = "Le bus n'est pas arrivé à destination"
          divFeedback.style.display = 'block'
        }
      }
    }
    return result
  }
}

function removeFirstWord(city: string) {
  const town = city.replace(/^(les|la|le|l’|l')\s*/i, '').trim()
  return town.charAt(0).toUpperCase() + town.slice(1).toLowerCase()
}

function createSolutionStr(
  edges: { from: number[]; to: number[] }[],
): string[] {
  const orientation = { angle: 0 }
  const result: string[] = []
  for (const edge of edges) {
    const from = edge.from
    const to = edge.to
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    if (dx === 1 && dy === 0) {
      // à droite
      if (orientation.angle === 0) {
        result.push('move_forward-Avancer') // Avancer
      } else if (orientation.angle === 270) {
        result.push('turn_right-Tourner à droite') // Tourner à droite
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 0
      } else if (orientation.angle === 180) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 0
      } else if (orientation.angle === 90) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 0
      }
    } else if (dx === -1 && dy === 0) {
      // à gauche
      if (orientation.angle === 180) {
        result.push('move_forward-Avancer') // Avancer
      } else if (orientation.angle === 0) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 180
      } else if (orientation.angle === 90) {
        result.push('turn_right-Tourner à droite') // Tourner à droite
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 180
      } else if (orientation.angle === 270) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 180
      }
    } else if (dx === 0 && dy === 1) {
      // en bas
      if (orientation.angle === 90) {
        result.push('move_forward-Avancer') // Avancer
      } else if (orientation.angle === 0) {
        result.push('turn_right-Tourner à droite') // Tourner à droite
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 90
      } else if (orientation.angle === 180) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 90
      } else if (orientation.angle === 270) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
      }
    } else if (dx === 0 && dy === -1) {
      // en haut
      if (orientation.angle === 270) {
        result.push('move_forward-Avancer') // Avancer
      } else if (orientation.angle === 0) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 270
      } else if (orientation.angle === 90) {
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('turn_left-Tourner à gauche') // Tourner à gauche
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 270
      } else if (orientation.angle === 180) {
        result.push('turn_right-Tourner à droite') // Tourner à droite
        result.push('move_forward-Avancer') // Avancer
        orientation.angle = 270
      }
    }
  }
  orientation.angle = 0
  return result
}
