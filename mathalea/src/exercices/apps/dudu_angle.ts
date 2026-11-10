import ExternalApp from './_ExternalApp'

export const uuid = 'duduAngleAI'
export const titre =
  'Identifier des angles correspondants et alternes-internes'
/**
 * @author Arnaud Durand
 */
class DuduAngleAI extends ExternalApp {
  constructor() {
    super('https://mathix.org/angle_ai_co/index.html?suivi=1&mathalea=1')
  }
}

export default DuduAngleAI
