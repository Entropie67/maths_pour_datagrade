import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Manipuler les conversions'
export const dateDePublication = '11/10/2023'
export const interactifReady = true

export const amcReady = true

/**
 * @author Gilles Mora
 * Créé le 05/10/2023

 */
export const uuid = '59144'

export const refs = {
  'fr-fr': ['can6M4-04', '6M1autoA-2'],
  'fr-ch': ['NR'],
}
export default class CombienDeFois extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const unite = this.quotaChoice('unite', ['g', 'm', 'L'])
    const choix = this.quotaChoice('choix', [true, false])
    this.optionsChampTexte = { texteApres: 'fois.' }
    this.canReponseACompleter =
      'La réponse correcte à cette question est : <br>$\\ldots$'
    let Choixprefixes: [number, string][]
    let prefixes: [number, string] = [10, 'h']
    switch (this.quotaChoice('typePrefixe', [0, 1, 1, 2, 2, 3, 3, 4])) {
      case 0:
        Choixprefixes = [
          [10, 'h'],
          [100, 'da'],
          [1000, ''],
          [10000, 'd'],
        ]
        prefixes = choice(Choixprefixes)

        this.question = `Le professeur demande à un élève : <br>
        ${choix ? `«${sp()}$1\\text{ k${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}»` : `«${sp()}$1\\text{ ${prefixes[1]}${unite}}$, c'est combien de fois plus petit que $1\\text{ k${unite}}$ ?${sp()}»`}<br>
          La réponse correcte à cette question est : ${this.interactif ? '' : '$\\ldots$'}`

        this.correction = ` $1\\text{ k${unite}}$  $= ${miseEnEvidence(texNombre(prefixes[0]))}\\text{ ${prefixes[1]}${unite}}$`
        this.canEnonce = `Le professeur demande à un élève :<br> 
          «${sp()}$1\\text{ k${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}» `
        break

      case 1:
        Choixprefixes = [
          [10, 'da'],
          [100, ''],
          [1000, 'd'],
          [10000, 'c'],
        ]
        prefixes = choice(Choixprefixes)

        this.question = `Le professeur demande à un élève : <br>
            ${choix ? `«${sp()}$1\\text{ h${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}»` : `«${sp()}$1\\text{ ${prefixes[1]}${unite}}$, c'est combien de fois plus petit que $1\\text{ h${unite}}$ ?${sp()}»`}<br>
              La réponse correcte à cette question est : ${this.interactif ? '' : '$\\ldots$'}`

        this.correction = ` $1\\text{ h${unite}}$  $= ${miseEnEvidence(texNombre(prefixes[0]))}\\text{ ${prefixes[1]}${unite}}$`
        this.canEnonce = `Le professeur demande à un élève :<br> 
              «${sp()}$1\\text{ h${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}» `

        break
      case 2:
        Choixprefixes = [
          [10, ''],
          [100, 'd'],
          [1000, 'c'],
          [10000, 'm'],
        ]
        prefixes = choice(Choixprefixes)

        this.question = `Le professeur demande à un élève : <br>
                ${choix ? `«${sp()}$1\\text{ da${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}»` : `«${sp()}$1\\text{ ${prefixes[1]}${unite}}$, c'est combien de fois plus petit que $1\\text{ da${unite}}$ ?${sp()}»`}<br>
                  La réponse correcte à cette question est : ${this.interactif ? '' : '$\\ldots$'}`

        this.correction = ` $1\\text{ da${unite}}$  $= ${miseEnEvidence(texNombre(prefixes[0]))}\\text{ ${prefixes[1]}${unite}}$`
        this.canEnonce = `Le professeur demande à un élève : <br>
                  «${sp()}$1\\text{ da${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}» `

        break

      case 3:
        Choixprefixes = [
          [10, 'd'],
          [100, 'c'],
          [1000, 'm'],
        ]
        prefixes = choice(Choixprefixes)

        this.question = `Le professeur demande à un élève : <br>
                    ${choix ? `«${sp()}$1\\text{ ${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}»` : `«${sp()}$1\\text{ ${prefixes[1]}${unite}}$, c'est combien de fois plus petit que $1\\text{ ${unite}}$ ?${sp()}»`}<br>
                      La réponse correcte à cette question est : ${this.interactif ? '' : '$\\ldots$'}`

        this.correction = ` $1\\text{ ${unite}}$  $= ${miseEnEvidence(texNombre(prefixes[0]))}\\text{ ${prefixes[1]}${unite}}$`
        this.canEnonce = `Le professeur demande à un élève : <br>
                      «${sp()}$1\\text{ ${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}» `

        break

      case 4:
        Choixprefixes = [
          [10, 'c'],
          [100, 'm'],
        ]
        prefixes = choice(Choixprefixes)

        this.question = `Le professeur demande à un élève :<br> 
                        ${choix ? `«${sp()}$1\\text{ d${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}»` : `«${sp()}$1\\text{ ${prefixes[1]}${unite}}$, c'est combien de fois plus petit que $1\\text{ d${unite}}$ ?${sp()}»`}<br>
                          La réponse correcte à cette question est : ${this.interactif ? '' : '$\\ldots$'}`

        this.correction = ` $1\\text{ d${unite}}$  $= ${miseEnEvidence(texNombre(prefixes[0]))}\\text{ ${prefixes[1]}${unite}}$`
        this.canEnonce = `Le professeur demande à un élève : <br>
                          «${sp()}$1\\text{ d${unite}}$, c'est combien de fois plus grand que $1\\text{ ${prefixes[1]}${unite}}$ ?${sp()}» `

        break
    }
    this.reponse = prefixes[0]
  }
}
