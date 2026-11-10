import { droiteParPointEtPente } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

export const titre = 'Résoudre graphiquement une équation du type $f(x)=k$'
export const interactifReady = true

export const dateDePublication = '06/07/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '08/09/2024'
export const uuid = 'a2ac2'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
// une liste de nœuds pour définir une fonction Spline
const noeuds1 = [
  { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -3, y: 1, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
  { x: -2, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -1, y: 1, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
  { x: 0, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 3, y: -2, deriveeGauche: -2.5, deriveeDroit: -2.5, isVisible: false },
  { x: 4, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]
// une autre liste de nœuds...
const noeuds2 = [
  { x: -5, y: 1, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
  { x: -4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -3, y: 1, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
  { x: -2, y: 0, deriveeGauche: -1.5, deriveeDroit: -1, isVisible: false },
  { x: -1, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 0, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
  { x: 1, y: 3, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
  { x: 2, y: 5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 3, y: 4, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
  { x: 4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 5, y: 4, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
  { x: 6, y: 5, deriveeGauche: 0.2, deriveeDroit: 0.2, isVisible: true },
]
// une troisième utilisée pour fonctions2
const noeuds3 = [
  { x: -6, y: -4, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
  { x: -5, y: -3, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
  { x: -4, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
  { x: -3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -2, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: -1, y: -3, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: 0, y: -5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 1, y: -3, deriveeGauche: 2.5, deriveeDroit: 2.5, isVisible: true },
  { x: 2, y: 0, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
  { x: 3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 4, y: 0, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
  { x: 5, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]

// une liste des listes
const mesFonctions1 = [noeuds1, noeuds2, noeuds3] //, noeuds2
// const mesFonctions2 = [noeuds3]//, noeuds4

/**
 * choisit les caractèristique de la transformation de la courbe
 * @returns {Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}>}
 */
function aleatoiriseCourbe(listeFonctions: NoeudSpline[][]): NoeudSpline[] {
  const coeffX = choice([-1, 1]) // symétries ou pas
  const coeffY = choice([-1, 1])
  const deltaX = randint(-2, +2) // translations
  const deltaY = randint(-2, +2)
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

/**
 * Aléatoirise une courbe et demande les antécédents d'une valeur entière (eux aussi entiers)
 * @author Jean-claude Lhote (Gilles Mora)
 */
export default class LecturesGraphiquesSurSplines extends Exercice {
  spline: Spline | undefined
  constructor() {
    super()

    this.nbQuestions = 1 // Nombre de questions par défaut
    this.nbQuestionsModifiable = false
    this.exoCustomResultat = true
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const objetsEnonce = []
      const objetsCorrection1 = []
      const objetsCorrection2 = []
      // la liste des noeuds de notre fonction
      const nuage = aleatoiriseCourbe(mesFonctions1)
      const theSpline = spline(nuage)
      // On a besoin de la spline pour la correction interactive
      this.spline = theSpline
      const bornes = theSpline.trouveMaxes()
      const nbAntecedentsEntiersMaximum = theSpline.nombreAntecedentsMaximum(
        bornes.yMin,
        bornes.yMax,
        true,
        true,
      )
      const nbAntecedentsMaximum = theSpline.nombreAntecedentsMaximum(
        bornes.yMin - 1,
        bornes.yMax + 1,
        false,
        false,
      )
      let nombreAntecedentCherches0,
        y0,
        nombreAntecedentCherches1,
        y1,
        nombreAntecedentsCherches2,
        y2
      do {
        nombreAntecedentCherches0 = randint(1, nbAntecedentsEntiersMaximum)
        y0 = theSpline.trouveYPourNAntecedents(
          nombreAntecedentCherches0,
          bornes.yMin - 1,
          bornes.yMax + 1,
          true,
          true,
        )
        nombreAntecedentCherches1 = randint(
          0,
          nbAntecedentsEntiersMaximum,
          nombreAntecedentCherches0,
        )
        y1 = theSpline.trouveYPourNAntecedents(
          nombreAntecedentCherches1,
          bornes.yMin - 1,
          bornes.yMax + 1,
          true,
          true,
        )
        nombreAntecedentsCherches2 = randint(0, nbAntecedentsMaximum, [
          nombreAntecedentCherches1,
          nombreAntecedentCherches0,
          0,
        ])
        const candidatY2 = theSpline.trouveYPourNAntecedents(
          nombreAntecedentsCherches2,
          bornes.yMin - 1,
          bornes.yMax + 1,
          true,
          false,
        )
        y2 = candidatY2 ? arrondi(candidatY2, 1) : NaN
      } while (
        Number.isNaN(y0) ||
        Number.isNaN(y1) ||
        isNaN(y2) ||
        y0 === 0 ||
        y2 === 0
      )

      const reponseQ3 = []
      for (let ee = bornes.yMin; ee <= bornes.yMax; ee++) {
        if (theSpline.nombreAntecedents(ee) === nombreAntecedentsCherches2)
          reponseQ3.push(ee)
      }
      y2 = choice(reponseQ3)

      const solutions0 = theSpline.solve(Number(y0), 2) ?? []
      const solutions1 = theSpline.solve(Number(y1), 2) ?? []
      const reponse1 =
        !solutions1 || solutions1.length === 0
          ? '\\emptyset'
          : `\\{${solutions1.join(';')}\\}`
      const horizontale1 = droiteParPointEtPente(
        pointAbstrait(0, Number(y1)),
        0,
        '',
        '#009900',
      )
      const horizontale2 = droiteParPointEtPente(
        pointAbstrait(0, y2),
        0,
        '',
        '#009900',
      )
      const nomD1 = latex2d(`y=${y1}`, bornes.xMin - 0.5, Number(y1) + 0.4, {
        color: '#009900',
        letterSize: 'small',
      })
      const nomD2 = latex2d(
        `y=${texNombre(y2, 1)}`,
        bornes.xMin - 0.5,
        y2 + 0.4,
        {
          color: '#009900',
          letterSize: 'small',
        },
      )
      horizontale1.epaisseur = 2
      horizontale1.pointilles = 2
      horizontale2.pointilles = 2
      horizontale2.epaisseur = 2
      objetsCorrection1.push(horizontale1, nomD1)
      objetsCorrection2.push(horizontale2, nomD2)

      for (let j = 0; j < nombreAntecedentCherches0; j++) {
        objetsCorrection1.push(
          lectureAntecedent(solutions0![j], Number(y0), 1, 1, 'red', '', ''),
        )
      }
      const listeAntecedents = theSpline.solve(y2, 0) ?? []
      for (const antecedentY2 of listeAntecedents) {
        objetsCorrection2.push(
          lectureAntecedent(antecedentY2, y2, 1, 1, 'red', '', ''),
        )
      }

      let enonceSousRepere =
        'Répondre aux questions en utilisant le graphique.<br>'
      enonceSousRepere +=
        `<br>${numAlpha(0)}Quel est le nombre de solutions de l'équation $f(x)=${y0}$ ?` +
        ajouteChampTexteMathLive(this, 3 * i, KeyboardType.clavierNumbers)
      enonceSousRepere +=
        `<br><br>${numAlpha(1)}Résoudre l'équation $f(x)=${y1}$. Donner l'ensemble solution` +
        (this.interactif ? ' : ' : '.')
      enonceSousRepere +=
        ajouteChampTexteMathLive(
          this,
          3 * i + 1,
          KeyboardType.clavierEnsemble,
          { texteAvant: '$S=$' },
        ) + '<br>'
      enonceSousRepere +=
        `<br>${numAlpha(2)}Déterminer une valeur entière de $k$ telle que $f(x)=k$ admette exactement $${nombreAntecedentsCherches2}$ solution${nombreAntecedentsCherches2 > 1 ? 's' : ''}` +
        (this.interactif ? ' : ' : '.') +
        ajouteChampTexteMathLive(this, 3 * i + 2, KeyboardType.clavierDeBase)

      handleAnswers(this, 3 * i, {
        reponse: { value: nombreAntecedentCherches0 },
      })
      handleAnswers(this, 3 * i + 1, {
        reponse: { value: reponse1, options: { ensembleDeNombres: true } },
      })
      handleAnswers(this, 3 * i + 2, { reponse: { value: reponseQ3 } })
      const correctionPartA = `${numAlpha(0)} Le nombre de solutions de l'équation $f(x)=${y0}$ est donné par le nombre d'antécédents de $${y0}$ par $f$. <br>
          ${solutions0.length === 0 ? "Il n'y en a pas, donc l'équation n'a pas de solution." : 'Il y en a $' + solutions0.length + '$ (tracé rouge en pointillés).'}<br>`
      const correctionPartB = `${numAlpha(1)} Résoudre l'équation $f(x)=${y1}$ graphiquement revient à lire les abscisses respectives des points d'intersection entre $\\mathscr{C}_f$ et ${y1 === 0 ? "l'axe des abscisses." : `la droite (parallèle à l'axe des abscisses tracée en pointillés verts) d'équation $y = ${y1}$.`}<br>
          On en déduit : ${solutions1.length === 0 ? '$S=\\emptyset$.' : `$S=\\{${solutions1.join('\\,;\\,')}\\}$.`}<br>`
      const correctionPartC = `${numAlpha(2)}  Par exemple, l'équation $f(x)=${texNombre(y2, 1)}$ possède exactement $${nombreAntecedentsCherches2}$ solution${nombreAntecedentsCherches2 > 1 ? 's' : ''}.<br>`
      const repere1 = repere({
        xMin: bornes.xMin - 1,
        xMax: bornes.xMax + 1,
        yMin: bornes.yMin - 1,
        yMax: bornes.yMax + 1,
        axesEpaisseur: 1.5,
        thickEpaisseur: 1.2,
        yLabelEcart: 0.6,
        thickHauteur: 0.1,
        // grille: true,
        // grilleCouleur: 'gray',
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
      const courbeATracer = theSpline.courbe({
        epaisseur: 1.2,
        color: bleuMathalea,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 1,
          style: '.',
          epaisseur: 1.5,
        },
      })
      for (let j = 0; j < nombreAntecedentCherches1; j++) {
        for (let k = 0; k < theSpline.visibles.length; k++) {
          theSpline.visibles[k] = theSpline.y[k] === y1
        }
      }
      const courbeCorrection = theSpline.courbe({
        epaisseur: 1.2,
        color: bleuMathalea,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 1,
          style: '.',
          epaisseur: 1.5,
        },
      })

      objetsEnonce.push(repere1, courbeATracer)
      objetsCorrection1.push(repere1, courbeCorrection)
      objetsCorrection2.push(repere1, courbeATracer)

      const origine = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      texte = `Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$ définie sur $[${theSpline.x[0]}\\,;\\,${theSpline.x[theSpline.n - 1]}]$.<br>`
      texte +=
        mathalea2d(
          Object.assign(
            {
              scale: 0.6,
              display: 'block',
            } as const,
            fixeBordures(objetsEnonce),
          ),
          objetsEnonce,
          origine,
        ) + enonceSousRepere
      texteCorr =
        correctionPartA +
        correctionPartB +
        mathalea2d(
          Object.assign({ scale: 0.6 }, fixeBordures(objetsCorrection1)),
          objetsCorrection1,
          origine,
        ) +
        correctionPartC +
        mathalea2d(
          Object.assign({ scale: 0.6 }, fixeBordures(objetsCorrection2)),
          objetsCorrection2,
          origine,
        )
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
