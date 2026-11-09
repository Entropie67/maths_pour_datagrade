import type { PointAbstrait } from '../lib/2d/PointAbstrait'

export type OptionsIep = {
  id?: string
  label?: string
  dx?: number
  dy?: number
  tempo?: number
  vitesse?: number
  sens?: number
  couleur?: string
  epaisseur?: number
  pointilles?: boolean
  couleurLabel?: string
  couleurPoint?: string
  description?: boolean
  placerNomsSommets?: boolean
  positionsRangementInstruments?: PositionsInstrumentsIep
}

export type OptionsOutil = OptionsIep & {}

export type OptionsCrayon = OptionsOutil & { vecteur?: boolean }

export type OptionsOutilMesure = OptionsCrayon & {
  longueur?: number
  codage?: string
  couleurCodage?: string
  sens?: number
  zeroSurPremierPoint?: boolean
}

export type OptionsRegle = OptionsOutilMesure & {}
export type OptionsEquerre = OptionsRegle & {}
export type OptionsRequerre = OptionsEquerre & {}

export type OptionsRapporteur = OptionsOutilMesure & {
  rayon?: number
}
export type OptionsCompas = OptionsRapporteur & {
  delta?: number
  couleurCompas?: string
}

// Aligne avec Alea2iep.ts
export type OptionsTexte = OptionsIep & {
  police?: string
  taille?: number
  couleur?: string
  couleurFond?: string
  opaciteFond?: string
  couleurCadre?: string
  epaisseurCadre?: number
  marge?: number
  margeGauche?: number
  margeDroite?: number
  margeHaut?: number
  margeBas?: number
}

export type OptionsLabel = OptionsIep & {
  // décalage du label par rapport au point
  dx?: number
  dy?: number
  // rotation éventuelle du label
  angle?: number
  // positionnement "cardinal" (libre si autre convention)
  position?:
    'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO' | 'center' | string
  // options de style éventuelles
  police?: string
  taille?: number
  couleur?: string
  couleurFond?: string
}

// États des outils (objets internes d'Alea2iep)
export type RegleState = {
  visibilite: boolean
  longueur: number
  zoom?: number
  // autres propriétés selon ton implémentation
}

export type EquerreState = {
  visibilite: boolean
  zoom: number
  // autres propriétés selon ton implémentation
}

export type RequerreState = {
  visibilite: boolean
  zoom: number
  position: PointAbstrait
  angle: number
  abscisse: number
  // autres propriétés selon ton implémentation
}

export type CompasState = {
  visibilite: boolean
  // autres propriétés selon ton implémentation
}

export type OutilIep =
  'regle' | 'equerre' | 'requerre' | 'rapporteur' | 'compas' | 'crayon'

export type VisibiliteInstrumentsIep = Record<OutilIep, boolean>
export type PositionsInstrumentsIep = Partial<Record<OutilIep, PointAbstrait>>

export interface IAlea2iep {
  // Styles/état
  couleur: string
  couleurCompas: string
  couleurTexte: string
  couleurPoint: string
  couleurCodage: string
  couleurTraitsDeConstruction: string
  epaisseur: number
  epaisseurTraitsDeConstruction: number
  tempo: number
  pointilles: boolean

  // États des outils
  regle: RegleState
  equerre: EquerreState
  requerre: RequerreState
  compas: CompasState
  crayon: EquerreState
  rapporteur: EquerreState

  // Coordonnées
  x(A: PointAbstrait): number
  y(A: PointAbstrait): number

  sauvegarderVisibiliteInstruments(): VisibiliteInstrumentsIep
  restaurerVisibiliteInstruments(
    etat: VisibiliteInstrumentsIep,
    options?: OptionsIep,
  ): void
  preserverVisibiliteInstruments<T>(callback: () => T, options?: OptionsIep): T
  rangerInstruments(
    positions: PositionsInstrumentsIep,
    outils?: OutilIep[],
    options?: OptionsIep,
  ): void

  // Règle
  regleMontrer(A?: PointAbstrait, options?: OptionsRegle): void
  regleMasquer(options?: OptionsRegle): void
  regleDeplacer(A: PointAbstrait, options?: OptionsRegle): void
  regleRotation(angle: number | PointAbstrait, options?: OptionsRegle): void
  regleRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsRegle,
  ): void
  regleDroite(
    A: PointAbstrait,
    direction: number | PointAbstrait,
    options?: OptionsRegle,
  ): void
  regleSegment(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsRegle,
  ): number
  regleDemiDroite(
    O: PointAbstrait,
    direction: number | PointAbstrait,
    options?: OptionsRegle,
  ): void
  regleDemiDroiteOriginePoint(
    O: PointAbstrait,
    A: PointAbstrait,
    options?: OptionsRegle,
  ): void
  regleProlongerSegment(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsRegle,
  ): void
  regleMasquerGraduations(options?: OptionsIep): void
  regleMontrerGraduations(options?: OptionsIep): void
  regleZoom(echelle: number, options?: OptionsIep): void
  regleModifierLongueur(longueur: number, options?: OptionsIep): void

  // Équerre
  equerreMontrer(A?: PointAbstrait, options?: OptionsEquerre): void
  equerreMasquer(options?: OptionsEquerre): void
  equerreDeplacer(A: PointAbstrait, options?: OptionsEquerre): void
  equerreRotation(angle: number | PointAbstrait, options?: OptionsEquerre): void
  equerreRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsEquerre,
  ): void
  equerreZoom(echelle: number, options?: OptionsIep): void

  // Requerre (outil combiné)
  requerreMontrer(A?: PointAbstrait, options?: OptionsEquerre): void
  requerreMasquer(options?: OptionsEquerre): void
  requerreDeplacer(A: PointAbstrait, options?: OptionsEquerre): void
  requerreRotation(
    angle: number | PointAbstrait,
    options?: OptionsEquerre,
  ): void
  requerreZoom(echelle: number, options?: OptionsIep): void
  requerreRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsRequerre,
  ): void
  requerreGlisserEquerre(deplacement: number, options: OptionsRequerre): void

  // Compas
  compasMontrer(A?: PointAbstrait, options?: OptionsCompas): void
  compasMasquer(options?: OptionsCompas): void
  compasDeplacer(A: PointAbstrait, options?: OptionsCompas): void
  compasRotation(angle: number | PointAbstrait, options?: OptionsCompas): void
  compasRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasEcarter(l: number, options?: OptionsCompas): void
  compasEcarterAvecRegle(longueur: number, options?: OptionsCompas): void
  compasEcarter2Points(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasTracerArcCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options?: OptionsCompas,
  ): number
  compasTracerArcCentre2extremites(
    centre: PointAbstrait,
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasCercleCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options?: OptionsCompas,
  ): void
  reporterAuCompas2pointsCentreDirection(
    A: PointAbstrait,
    B: PointAbstrait,
    centre: PointAbstrait,
    angle: number,
    options?: OptionsCompas,
  ): void

  // Points et polygones
  pointCreer(A: PointAbstrait, options?: OptionsOutil): void
  pointNomDeplacer(A: PointAbstrait, options?: OptionsIep): void
  milieuALaRegle(A: PointAbstrait, B: PointAbstrait, nom?: string): void
  pointMasquer(...points: (PointAbstrait | OptionsOutil)[]): void
  polygoneRapide(...args: (PointAbstrait | OptionsCrayon)[]): void

  // Textes
  textePoint(
    texte: string,
    position: PointAbstrait,
    options?: OptionsTexte,
  ): number
  textePosition(
    texte: string,
    x: number,
    y: number,
    options?: OptionsTexte,
  ): number
  texteMasquer(id: number, options: OptionsIep): void
  texteChangeCouleur(texte: string, id: number, couleur: string): void

  // Rapporteur
  rapporteurMontrer(A?: PointAbstrait, options?: OptionsRapporteur): void
  rapporteurMasquer(options?: OptionsRapporteur): void
  rapporteurDeplacer(A: PointAbstrait, options?: OptionsRapporteur): void
  rapporteurRotation(
    angle: number | PointAbstrait,
    options?: OptionsRapporteur,
  ): void
  rapporteurRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsRapporteur,
  ): void
  rapporteurTracerDemiDroiteAngle(
    centre: PointAbstrait,
    depart: PointAbstrait,
    angle: number,
    options?: OptionsRapporteur,
  ): void

  // Perpendiculaires
  perpendiculaireRegleEquerre2points3epoint(
    A: PointAbstrait,
    B: PointAbstrait,
    P: PointAbstrait,
    options?: OptionsRegle,
  ): void
  perpendiculaireRegleEquerreDroitePoint(
    d: any, // Droite
    P: PointAbstrait,
    options?: OptionsCompas,
  ): void

  // Parallèles
  paralleleRegleEquerre2points3epoint(
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
    options?: OptionsEquerre,
  ): void
  paralleleAuCompas(
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
    options?: OptionsCompas,
  ): PointAbstrait

  // Crayon / tracés
  crayonMontrer(A?: PointAbstrait, options?: OptionsCrayon): void
  crayonMasquer(options?: OptionsCrayon): void
  crayonDeplacer(A: PointAbstrait, options?: OptionsCrayon): void
  trait(A: PointAbstrait, B: PointAbstrait, options?: OptionsCrayon): number
  traitRapide(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsCrayon,
  ): number
  traitMasquer(id: number, options?: OptionsCrayon): void
  tracer(P: PointAbstrait, options?: OptionsCrayon): number

  // Compas
  compasMontrer(A?: PointAbstrait, options?: OptionsCompas): void
  compasMasquer(options?: OptionsCompas): void
  compasDeplacer(A: PointAbstrait, options?: OptionsCompas): void
  compasRotation(angle: number | PointAbstrait, options?: OptionsCompas): void
  compasRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasEcarter(l: number, options?: OptionsCompas): void
  compasEcarterAvecRegle(longueur: number, options?: OptionsCompas): void
  compasEcarter2Points(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasTracerArcCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options?: OptionsCompas,
  ): number
  compasTracerArcCentre2extremites(
    centre: PointAbstrait,
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsCompas,
  ): void
  compasCercleCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options?: OptionsCompas,
  ): void

  // Points et polygones
  pointCreer(A: PointAbstrait, options?: OptionsOutil): void
  pointNomDeplacer(A: PointAbstrait, options?: OptionsIep): void
  pointMasquer(...points: (PointAbstrait | OptionsOutil)[]): void
  polygoneRapide(...args: (PointAbstrait | OptionsCrayon)[]): void

  // Textes
  textePoint(
    texte: string,
    position: PointAbstrait,
    options?: OptionsTexte,
  ): number
  textePosition(
    texte: string,
    x: number,
    y: number,
    options?: OptionsTexte,
  ): number
  texteMasquer(id: number, options: OptionsIep): void
  texteChangeCouleur(texte: string, id: number, couleur: string): void

  // Codages
  segmentCodage(
    A: PointAbstrait,
    B: PointAbstrait,
    options?: OptionsRegle,
  ): number
  codageAngleDroit(
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
    options?: OptionsRegle,
  ): number[]
  angleCodage(
    B: PointAbstrait,
    A: PointAbstrait,
    C: PointAbstrait,
    options?: OptionsCompas,
  ): string

  // Divers
  pause(): void

  // Libellés de points
  pointNommer(A: PointAbstrait, nom?: string, options?: OptionsLabel): void

  // Mesure/affichage de longueur de segment
  longueurSegment(
    A: PointAbstrait,
    B: PointAbstrait,
    decimales?: number,
    options?: OptionsRegle,
  ): number
}
