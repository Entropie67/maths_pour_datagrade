import ExternalApp from './_ExternalApp'

export const uuid = 'duduLineaire'
export const titre = 'Étudier les fonctions linéaires'

/**
 * @author Arnaud Durand
 */
class DuduLineaire extends ExternalApp {
  constructor() {
    super(
      'https://mathix.org/exerciseur_fonction_lineaire_suivi/index.html?suivi=1&mathalea=1',
    )
  }
}

export default DuduLineaire
