import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '40ce0'
export const refs = {
  'fr-fr': ['3G4QCM-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Coordonnées sur la Terre (12/2020 Nouvelle Calédonie)'
export const dateDePublication = '3/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Matthieu DEVILLERS
 * matthieu.devillers@ac-rennes.fr
 */
export default class NouvelleCaledonieDec20Exo1Q6 extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    ligne: string,
    lat: string,
    long: string,
    hemi: string,
    ew: string,
  ): void {
    this.reponses =
      ligne === "l'équateur"
        ? [
            `($ 0 \\degree \\text{N} ; ${long} \\degree \\text{${ew}}$)`,
            `$(${lat} \\degree \\text{${hemi}} ; ${long} \\degree \\text{${ew}})$`,
            `($${lat} \\degree \\text{${hemi}} ; 0 \\degree \\text{${ew}})$`,
          ]
        : [
            `($${lat} \\degree \\text{${hemi}} ; 0 \\degree \\text{${ew}})$`,
            `$(${lat} \\degree \\text{${hemi}} ; ${long} \\degree \\text{${ew}})$`,
            `($ 0 \\degree \\text{N} ; ${long} \\degree \\text{${ew}}$)`,
          ]
    this.enonce = `Une ville située sur ${ligne} peut avoir pour coordonnées : `

    this.correction = `Une ville située sur ${ligne} a nécessairement`
    this.correction +=
      ligne === "l'équateur"
        ? ' pour latitude $0 \\degree \\text{N}$ (ou $0 \\degree \\text{S}$) <br>'
        : ' pour longitude $0 \\degree \\text{E}$ (ou $0 \\degree \\text{O}$)<br>'
    this.correction += ' donc ses coordonnées sont : '
    this.correction +=
      ligne === "l'équateur"
        ? `$ ${miseEnEvidence(`(0 \\degree \\mathbf{N} ; ${long} \\degree \\mathbf{${ew}})`)}$`
        : `$${miseEnEvidence(`(${lat} \\degree \\mathbf{${hemi}} ; 0 \\degree \\mathbf{${ew}})`)}$`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs("l'équateur", '78', '78', 'N', 'E') // valeurs du sujet original
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 3 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const ligne = choice(["l'équateur", 'le méridien de Greenwich'])
      const lat = String(5 * randint(4, 17))
      const long = String(10 * randint(4, 17))
      const hemi = choice(['N', 'S'])
      const ew = choice(['E', 'O'])
      this.appliquerLesValeurs(ligne, lat, long, hemi, ew)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.versionAleatoire()
  }
}
