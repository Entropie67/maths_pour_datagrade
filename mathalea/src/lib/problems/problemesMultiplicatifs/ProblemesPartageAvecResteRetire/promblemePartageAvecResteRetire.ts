import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemePartageAvecResteRetire extends Probleme {
  constructor(
    name: string = '',
    data?: { nbFois: number; quotité: number; reste?: number },
  ) {
    const nbFois = data?.nbFois ?? randint(2, 5)
    const reste = data?.reste ?? 0
    const quotité = data?.quotité ?? randint(10, 20)
    const total = nbFois * quotité + reste
    data = data == null ? { nbFois, quotité: randint(5, 10) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      bottomBraces: [
        {
          start: 3,
          end: 13,
          text: String(nbFois),
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(nbFois * quotité + reste, 2)}$`,
              length: 12,
              color: 'lightgray',
            },
          ],
        },
        {
          barres: [
            {
              content: `$${texNombre(reste, 2)}$`,
              length: 2,
              color: 'lightgray',
            },
            {
              content: `$${texNombre(quotité, 2)}$`,
              length: 2,
              color: 'lightgray',
            },
            {
              content: '',
              length: 6,
              color: 'lightgray',
              type: 'flèche',
            },
            {
              content: `$${texNombre(quotité, 2)}$`,
              length: 2,
              color: 'lightgray',
            },
          ],
        },
      ],
    })
    this.enonce = `Nous avons $${total}$ objets. Après en avoir mis $${reste}$ de côté, nous formons $${nbFois}$ paquets. Combien y a-t-il d'objets par paquets ?`
    this.correction = `Nous avons $${total}$ objets. Après en avoir mis $${reste}$ de côté, il en reste $${total - reste}$. Donc, il y a $${miseEnEvidence(texNombre((total - reste) / nbFois, 2))}$ objets par paquet.`
    this.reponse = texNombre((total - reste) / nbFois, 2)
  }
}
