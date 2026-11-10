import SchemaEnBoite from '../outils/SchemaEnBoite'
import type { OptionsComparaisonType } from '../types'

type Donnees = Record<string, string | number | boolean>
/**
 * @author Jean-claude Lhote
 */
export default class Probleme {
  name: string
  private schemaModele: SchemaEnBoite
  reponse: string
  optionsComparaison?: OptionsComparaisonType
  styleChampTexteMathlive?: string
  optionsChampTexteMathlive?: {
    texteAvant?: string
    texteApres?: string
    espace?: boolean
  }

  data: Donnees
  private _enonce: string = ''
  private _correction: string = ''
  constructor(name: string, data: Donnees) {
    this.data = data
    this.name = name
    this.reponse = ''
    this.schemaModele = new SchemaEnBoite({
      topBraces: [],
      bottomBraces: [],
      rightBraces: [],
      lignes: [],
    })
  }
  // Constructeur avec un schéma modèle

  get enonce(): string {
    return this._enonce
  }

  set enonce(enonce: string) {
    this._enonce = enonce
  }

  get correction(): string {
    return this._correction
  }

  set correction(correction: string) {
    this._correction = correction
  }

  get schema(): SchemaEnBoite {
    return this.schemaModele
  }

  set schema(schema: SchemaEnBoite) {
    this.schemaModele = schema
  }
}
