import { arcPointPointAngle } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { crochetD, crochetG } from '../../lib/2d/intervalles'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { AnswerType } from '../../lib/types'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  'Relier un intervalle, une inégalité et une valeur absolue dans un tableau'
export const dateDePublication = '06/10/2026'
export const uuid = '8bc9a'
export const refs = {
  'fr-fr': ['2N13-5'],
  'fr-ch': [],
}
export const interactifReady = true

/** Droite proportionnelle : intervalle solution et distances aux deux bornes. */
function droiteIntervalle(a: number, b: number, ouvert: boolean): string {
  const min = a - 2
  const max = b + 2
  const unite = 10 / (max - min)
  const centre = (a + b) / 2
  const rayon = (b - a) / 2
  const xG = (a - min) * unite
  const xD = (b - min) * unite
  const xC = (centre - min) * unite
  const axe = droiteGraduee({
    Min: min,
    Max: max,
    Unite: unite,
    thickDistance: 1,
    thickSec: !Number.isInteger(centre),
    thickSecDist: 0.5,
    labelsPrincipaux: false,
    axeEpaisseur: 1,
    thickEpaisseur: 1,
  })
  const zone = polygone(
    pointAbstrait(xG, 0),
    pointAbstrait(xD, 0),
    pointAbstrait(xD, 0.3),
    pointAbstrait(xG, 0.3),
  )
  zone.color = colorToLatexOrHTML(bleuMathalea)
  zone.hachures = 'north east lines'
  zone.couleurDesHachures = colorToLatexOrHTML(bleuMathalea)
  zone.distanceDesHachures = 6
  const G = pointAbstrait(xG, 0)
  const D = pointAbstrait(xD, 0)
  const marqueCentre = segment(
    pointAbstrait(xC, -0.15),
    pointAbstrait(xC, 0.35),
    'red',
  )
  marqueCentre.epaisseur = 2
  const objets: NestedObjetMathalea2dArray = [
    axe,
    zone,
    ouvert ? crochetG(G) : crochetD(G),
    ouvert ? crochetD(D) : crochetG(D),
    marqueCentre,
    latex2d(`${a}`, xG, -0.7, { color: 'black' }),
    latex2d(`${b}`, xD, -0.7, { color: 'black' }),
    latex2d(`a=${texNombre(centre, 1)}`, xC, -0.9, { color: 'red' }),
  ]
  for (const [xFin, signe] of [
    [xG, '-'],
    [xD, '+'],
  ] as const) {
    const sens = xFin > xC ? 1 : -1
    const yFleche = 0.6
    const depart = pointAbstrait(xC + 0.15 * sens, yFleche)
    const fin = pointAbstrait(xFin, yFleche)
    objets.push(
      arcPointPointAngle(depart, fin, -90 * sens, false, 'none', bleuMathalea),
    )
    // Même flèche arrondie que dans 2N13-2, avec une pointe tangente à l'arc.
    const angleTangente = sens === 1 ? -Math.PI / 4 : (-3 * Math.PI) / 4
    for (const ecart of [-0.45, 0.45]) {
      const angle = angleTangente + Math.PI + ecart
      objets.push(
        segment(
          fin,
          pointAbstrait(
            xFin + 0.3 * Math.cos(angle),
            yFleche + 0.3 * Math.sin(angle),
          ),
          bleuMathalea,
        ),
      )
    }
    objets.push(
      latex2d(`${signe}${texNombre(rayon, 1)}`, (xC + xFin) / 2, yFleche + 1, {
        color: bleuMathalea,
      }),
    )
  }
  return mathalea2d(
    { xmin: -0.3, xmax: 11, ymin: -1.7, ymax: 2, pixelsParCm: 40, scale: 0.7 },
    objets,
  )
}

/**
 * Retrouver les différentes écritures d'un intervalle borné symétrique.
 * @author Stéphane Guyon
 */
export default class TableauIntervallesValeurAbsolue extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter le tableau suivant.'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 3
    this.sup2 = '1-2-3'
    this.sup3 = false
    this.besoinFormulaireNumerique = ['Nombre de lignes', 5]
    this.besoinFormulaire2Texte = [
      'Données fournies',
      'Nombres séparés par des tirets :\n1 : Intervalle\n2 : Inégalité\n3 : Valeur absolue\n4 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Inclure des intervalles ouverts']
  }

  nouvelleVersion() {
    const nbLignes = Math.max(1, Math.min(5, Math.trunc(Number(this.sup)) || 3))
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: nbLignes,
    })
    const entetes = [
      '\\text{Ligne}',
      '\\text{Intervalle}',
      '\\text{Inégalité}',
      '\\text{Valeur absolue}',
      "\\text{Centre de l'intervalle}",
    ]
    const lignes: string[] = []
    const contenu: string[] = []
    const contenuCorr: string[] = []
    const details: string[] = []
    const reponses: Record<string, AnswerType> = {}
    const intervallesDejaTires = new Set<string>()

    for (
      let ligne = 0, tentatives = 0;
      ligne < nbLignes && tentatives < 50;
      tentatives++
    ) {
      const a = randint(-10, 5)
      const b = a + randint(2, 12)
      const ouvert = this.sup3 ? choice([true, false]) : false
      const cle = `${a};${b};${ouvert}`
      if (intervallesDejaTires.has(cle)) continue
      intervallesDejaTires.add(cle)
      const centre = (a + b) / 2
      const rayon = (b - a) / 2
      const symbole = ouvert ? '<' : '\\leqslant'
      const intervalle = `${ouvert ? ']' : '['}${a}\\,;\\,${b}${ouvert ? '[' : ']'}`
      const inegalite = `${a}${symbole} x${symbole}${b}`
      const valeurAbsolue = `\\lvert x${centre === 0 ? '' : ecritureAlgebrique(-centre)}\\rvert${symbole}${texNombre(rayon, 1)}`
      const valeurs = [
        `x\\in${intervalle}`,
        inegalite,
        valeurAbsolue,
        texNombre(centre, 1),
      ]
      const type = types[ligne]
      const colonneDonnee = Number(type) - 1
      lignes.push(`${ligne + 1}`)
      for (let colonne = 0; colonne < valeurs.length; colonne++) {
        const donnee = colonne === colonneDonnee
        contenu.push(donnee ? valeurs[colonne] : '')
        contenuCorr.push(
          donnee ? valeurs[colonne] : miseEnEvidence(valeurs[colonne]),
        )
        if (!donnee) {
          reponses[`L${ligne + 1}C${colonne + 1}`] = {
            value: colonne === 0 ? intervalle : valeurs[colonne],
            ...(colonne === 0 ? { options: { intervalle: true } } : {}),
          }
        }
      }
      const calculCentre =
        colonneDonnee === 2
          ? `Pour déterminer $a$, écrire la valeur absolue sous la forme $\\lvert x-a\\rvert$ : $\\lvert x${centre === 0 ? '' : ecritureAlgebrique(-centre)}\\rvert=\\lvert x-(${texNombre(centre, 1)})\\rvert$. Ainsi, $a=${miseEnEvidence(texNombre(centre, 1))}$.`
          : `Le centre est le milieu des extrémités de l'intervalle. Donc $a=\\dfrac{${a}+(${b})}{2}=${miseEnEvidence(texNombre(centre, 1))}$.`
      details.push(
        `Ligne $${ligne + 1}$ :<br>` +
          calculCentre +
          '<br>' +
          `La distance à $a$ s'écrit $\\lvert x-a\\rvert$. Avec $a=${texNombre(centre, 1)}$, on obtient $\\lvert x-a\\rvert=\\lvert x-(${texNombre(centre, 1)})\\rvert=\\lvert x${centre === 0 ? '' : ecritureAlgebrique(-centre)}\\rvert$.<br>` +
          `$x\\in${intervalle}\\iff ${inegalite}\\iff ${valeurAbsolue}$<br>` +
          droiteIntervalle(a, b, ouvert),
      )
      ligne++
    }

    if (this.interactif) {
      const cellules = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        entetes,
        lignes,
        contenu,
      )
      for (const ligne of cellules.raws) {
        if (ligne[0].texte === '') {
          ligne[0].options = { texteAvant: '$x\\in$' }
        }
      }
      const tableauInteractif = AddTabDbleEntryMathlive.create(
        this.numeroExercice ?? 0,
        0,
        cellules,
        'clavierEnsemble clavierCompare clavierPersonnalisable',
        true,
        {},
      ).output
      // Le tableau ne transmet pas encore dataKeys dans les options des cellules.
      this.listeQuestions[0] = tableauInteractif.replaceAll(
        '<math-field ',
        `<math-field data-keys='${JSON.stringify(['\\lvert#0\\rvert'])}' `,
      )
    } else {
      this.listeQuestions[0] = tableauColonneLigne(entetes, lignes, contenu, 2)
    }
    handleAnswers(
      this,
      0,
      { ...reponses, bareme: troisPointsProportionnels },
      { formatInteractif: 'tableau-mathlive' },
    )
    this.listeCorrections[0] =
      tableauColonneLigne(entetes, lignes, contenuCorr, 2) +
      '<br>' +
      details.join('<br><br>')
    listeQuestionsToContenu(this)
  }
}
