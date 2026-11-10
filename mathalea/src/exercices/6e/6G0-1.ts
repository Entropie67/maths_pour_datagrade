import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import type { AllChoicesType } from '../../lib/customElements/ListeDeroulanteElement'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la notation de droites, segments et demi-droites'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Utiliser les notations des segments, droites et demi-droites
 * @author Rémi Angot
 */
export const uuid = '8f5d3'

export const refs = {
  'fr-fr': ['6G0-1'],
  'fr-2016': ['6G10'],
  'fr-ch': ['9R1ES1A-1', '9R2ES1A-1', '9R3ES1A-1'],
}
type ReponseLigne = {
  /** Valeur de la liste « la droite / le segment / la demi-droite » */
  type: 'droite' | 'segment' | 'demi-droite'
  /** Valeur de la liste des notations : `()`, `[]`, `[)` ou `[)` avec les lettres inversées */
  notation: '()' | '[]' | '[)' | '[)inverse'
  extremites: [string, string]
}

const CHOISIR = { label: 'Choisir', value: '' }

const libellesType = {
  droite: 'la droite',
  segment: 'le segment',
  'demi-droite': 'la demi-droite',
}

export default class NotationSegmentDroiteDemiDroite extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est un programme de construction.
    this.nbQuestions = 3
    this.nbCols = 3
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1 || context.vue === 'diap' || context.isAmc
        ? "Compléter le programme de construction qui a permis d'obtenir cette figure."
        : "Compléter les programmes de construction qui ont permis d'obtenir ces figures."
    const listeDesTypesDeQuestions = combinaisonListes(
      [1, 1, 2, 3, 4, 4],
      this.nbQuestions * 3,
    )
    let listeDeNomsDePolygones: string[] = []
    const reponsesInteractives: ReponseLigne[][] = []
    for (
      let i = 0, texte, texteCorr, figure, enonceAMC, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (i % 5 === 0) listeDeNomsDePolygones = ['PQD']
      const p = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(p)
      const A = pointAbstrait(0, 0, p[0], 'above left')
      const B = pointAbstrait(2, 2.2, p[1], 'above')
      const C = pointAbstrait(4.2, -0.6, p[2], 'above right')
      const creerDroiteDemiSegment = (
        A: PointAbstrait,
        B: PointAbstrait,
        type: number,
      ) => {
        let trait: ObjetMathalea2D, notation, typeLigne
        let reponse: Omit<ReponseLigne, 'extremites'>
        switch (type) {
          case 1:
            trait = droite(A, B)
            notation = `$(${A.nom}${B.nom})$`
            typeLigne = 'la droite'
            reponse = { type: 'droite', notation: '()' }
            break
          case 2:
            trait = demiDroite(A, B)
            notation = `$[${A.nom}${B.nom})$`
            typeLigne = 'la demi-droite'
            reponse = { type: 'demi-droite', notation: '[)' }
            break
          case 3:
            trait = demiDroite(B, A)
            notation = `$[${B.nom}${A.nom})$`
            typeLigne = 'la demi-droite'
            reponse = { type: 'demi-droite', notation: '[)inverse' }
            break
          case 4:
          default:
            trait = segment(A, B)
            notation = `$[${A.nom}${B.nom}]$`
            typeLigne = 'le segment'
            reponse = { type: 'segment', notation: '[]' }
            break
        }
        return [
          trait,
          notation,
          typeLigne,
          { ...reponse, extremites: [A.nom, B.nom] },
        ] as [ObjetMathalea2D, string, string, ReponseLigne]
      }
      const [dAB, dABCorr, typeLigneAB, reponseAB] = creerDroiteDemiSegment(
        A,
        B,
        listeDesTypesDeQuestions[3 * i],
      )
      const [dAC, dACCorr, typeLigneAC, reponseAC] = creerDroiteDemiSegment(
        A,
        C,
        listeDesTypesDeQuestions[3 * i + 1],
      )
      const [dBC, dBCCorr, typeLigneBC, reponseBC] = creerDroiteDemiSegment(
        B,
        C,
        listeDesTypesDeQuestions[3 * i + 2],
      )
      context.pixelsParCm = 20
      const labels = labelPoint(A, B, C)

      texte = this.interactif
        ? `Placer $3$ points $${p[0]}$, $${p[1]}$ et $${p[2]}$ non alignés.<br><br>`
        : `Placer $3$ points $${p[0]}$, $${p[1]}$ et $${p[2]}$ non alignés puis tracer $\\ldots$ <br><br>`
      figure = mathalea2d(
        {
          xmin: -1,
          ymin: -1,
          xmax: 5,
          ymax: 4.5,
          pixelsParCm: 20,
          scale: 1,
          zoom: 1.5,
        },
        dAB,
        dBC,
        dAC,
        labels,
        tracePoint(A, B, C),
      )
      enonceAMC = figure + texte
      texte += figure
      texteCorr = `Placer $3$ points $${p[0]}$, $${p[1]}$ et $${p[2]}$ non alignés puis tracer ${typeLigneAB} $${miseEnEvidence(dABCorr.slice(1, -1))}$, ${typeLigneBC} $${miseEnEvidence(dBCCorr.slice(1, -1))}$ et ${typeLigneAC} $${miseEnEvidence(dACCorr.slice(1, -1))}$.`
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: this.consigne + '<br>' + enonceAMC,
          propositions: [
            {
              texte: texteCorr,
              statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              enonce: 'Texte écrit au-dessus ou avant les cases à cocher', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
              sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
              pointilles: true, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        reponsesInteractives[i] = [reponseAB, reponseBC, reponseAC]
        i++
      }
      cpt++
    }
    if (this.interactif && context.isHtml) {
      // Les mélanges des listes sont faits après tous les tirages de l'énoncé,
      // pour que les figures soient les mêmes qu'en mode non interactif.
      const typesPossibles = Object.entries(libellesType).map(
        ([value, label]) => ({ value, label }),
      )
      for (let i = 0; i < this.nbQuestions; i++) {
        const lignes = reponsesInteractives[i]
        const dataOptions: Record<string, { choices: AllChoicesType }> = {}
        const reponses: Record<string, { value: string }> = {}
        const template: string[] = []
        lignes.forEach((ligne, rang) => {
          const [X, Y] = ligne.extremites
          const notations = [
            { value: '()', label: `(${X}${Y})` },
            { value: '[]', label: `[${X}${Y}]` },
            { value: '[)', label: `[${X}${Y})` },
            { value: '[)inverse', label: `[${Y}${X})` },
          ]
          const champType = `field${2 * rang}`
          const champNotation = `field${2 * rang + 1}`
          template.push(`Tracer %{${champType}} %{${champNotation}}`)
          dataOptions[champType] = {
            choices: [CHOISIR, ...shuffle(typesPossibles)],
          }
          dataOptions[champNotation] = {
            choices: [CHOISIR, ...shuffle(notations)],
          }
          reponses[champType] = { value: ligne.type }
          reponses[champNotation] = { value: ligne.notation }
        })
        this.listeQuestions[i] += addMultiMathfield(this, i, {
          dataTemplate: template.join('\n'),
          dataOptions,
        })
        handleAnswers(this, i, reponses, {
          formatInteractif: 'multi-mathfield',
        })
      }
    }
    listeQuestionsToContenu(this)
  }
}
