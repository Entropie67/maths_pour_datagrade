import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeMultiplicatifs extends Probleme {
  constructor(name: string = '', data?: { nbFois: number; facteur: number }) {
    data =
      data == null
        ? { nbFois: randint(2, 5), facteur: randint(2, 5) * 5 }
        : data
    if (data.nbFois < 2) {
      throw new Error('La valeur de nbFois doit être supérieure ou égale à 2.')
    }
    if (data.nbFois % 1 !== 0) {
      throw new Error('La valeur  de nbFois doit être un entier.')
    }
    super(name, data)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: data.nbFois < 8 ? 2 * data.nbFois + 1 : 15,
          text: `$${data.nbFois}$ fois`,
        },
      ],
      bottomBraces: [],
      rightBraces: [],
      lignes: [
        {
          barres:
            data.nbFois < 8
              ? [
                  {
                    content: `$${texNombre(data.facteur, 2)}$`,
                    length: 2,
                    color: 'lightgray',
                  },
                  ...Array.from({ length: data.nbFois - 1 }, () => ({
                    content: `$${texNombre(data.facteur, 2)}$`,
                    length: 2,
                    color: 'lightgray',
                  })),
                ]
              : [
                  {
                    content: `$${texNombre(data.facteur, 2)}$`,
                    length: 2,
                    color: 'lightgray',
                  },
                  {
                    content: '$\\ldots$',
                    length: 12,
                    color: 'lightgray',
                  },
                ],
        },
        {
          barres: [
            {
              content: '?',
              length: data.nbFois < 8 ? 2 * data.nbFois : 14,
              color: 'lightgray',
            },
          ],
        },
      ],
    })
    this.enonce = `Combien coûte ${data.nbFois} fois un produit à $${data.facteur}$ € ?`
    this.correction = `Le coût de ${data.nbFois} fois un produit à $${data.facteur}$ € est de $${miseEnEvidence(data.nbFois * data.facteur)}$ €`
    this.reponse = texNombre(data.nbFois * data.facteur, 4)
  }
}
