import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un prix après une évolution en pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '7487c'

export const refs = {
  'fr-fr': ['can4P2-03'],
  'fr-ch': ['NR'],
}
export default class PoucentageE extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.spacing = 1.5
    this.optionsChampTexte = { texteApres: ' €', texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    let a, b, n
    switch (
      this.quotaChoice('cas', ['a', 'b', 'c', 'd', 'e']) //
    ) {
      //'a'
      case 'a':
        a = randint(4, 13) * 5
        n = choice([
          'pull',
          'pantalon',
          'tee-shirt',
          'vêtement',
          'blouson',
          'sweat',
        ])
        b = choice([10, 20])
        this.question = `Le prix d'un ${n} est $${a}$ €.<br>
       Il baisse de $${b}\\,\\%$. `
        if (!this.versionQcm) {
          this.question += ' Quel est son nouveau prix ? '
        } else {
          this.question += 'Son nouveau prix est : '
        }
        this.distracteurs = [
          `$${texPrix(a + (b * a) / 100)} $ €`,
          `$${texPrix(a - (b * a) / 1000)} $ €`,
          `$${texPrix(a - b / 100)} $ €`,
        ]
        this.correction = `Le nouveau prix est de `
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texPrix(a - (b * a) / 100) + '~ €')}$.`
          : `$${miseEnEvidence(texPrix(a - (b * a) / 100))}$ €.`
        if (b === 10) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de la réduction. <br>
    Prendre $10\\,\\,\\%$ d'une quantité revient à la diviser par $10$. <br>
    Ainsi, $${b}\\,\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
                 La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}-${texPrix((b * a) / 100)}=~$ 
    
  `,
              bleuMathalea,
            )
        } else {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de la réduction. <br>
    Pour calculer $20\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
    par $10$ :<br> $10\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
    Puisque $20\\,\\%$ est deux fois plus grand que $10\\,\\%$, $20\\,\\%$ de $${a}$ est égal à $2\\times ${texNombre(a / 10, 2)}=${texNombre((2 * a) / 10, 2)}$.<br>
                    La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)} ~€`)}$${texteEnCouleur('.', bleuMathalea)}`
          : `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)}`)}$${texteEnCouleur(' €.', bleuMathalea)}`

        this.reponse = this.versionQcm
          ? `$${texPrix(a - (b * a) / 100)}$ €`
          : a - (b * a) / 100

        break
      case 'b':
        a = randint(2, 6) * 10
        n = choice([
          'pull',
          'pantalon',
          'tee-shirt',
          'vêtement',
          'blouson',
          'sweat',
        ])
        b = choice([5, 15])
        this.question = `Le prix d'un ${n} est $${a}$ €.<br>
        Il baisse de $${b}\\,\\%$. `
        if (!this.versionQcm) {
          this.question += '  Quel est son nouveau prix ? '
        } else {
          this.question += 'Son nouveau prix est : '
        }
        this.distracteurs = [
          `$${texPrix(a + (b * a) / 100)} $ €`,
          `$${texPrix(a - (b * a) / 1000)} $ €`,
          `$${texPrix(a - b / 100)} $ €`,
        ]
        this.correction = `Le nouveau prix est de `
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texPrix(a - (b * a) / 100) + '~ €')}$.`
          : `$${miseEnEvidence(texPrix(a - (b * a) / 100))}$ €.`
        if (b === 5) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de la réduction. <br>
    Pour calculer $5\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
    par $10$ :<br> $10\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
    Puisque $5\\,\\%$ est deux fois plus petit que $10\\,\\%$, $5\\,\\%$ de $${a}$ est égal à $ ${texNombre(a / 10, 2)}\\div 2=${texNombre(a / 20, 2)}$.<br>
                 La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        } else {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de la réduction. <br>
    Pour calculer $15\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
    par $10$ :<br> $10\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
    Puis on calcule $5\\,\\%$ de $${a}$ qui est égal à la moitié de $10\\,\\%$ de $${a}$, soit
    $${texNombre(a / 10, 2)}\\div 2=${texNombre(a / 20, 2)}$.<br>
    Puisque $15\\,\\%$ est égal à $10\\,\\%$ $+5\\,\\%$, $15\\,\\%$ de $${a}$ est égal à $${texNombre(a / 10, 2)}+${texNombre(a / 20, 2)}=${texNombre((3 * a) / 20, 2)}$.<br>
                    La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)} ~€`)}$${texteEnCouleur('.', bleuMathalea)}`
          : `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)}`)}$${texteEnCouleur(' €.', bleuMathalea)}`

        this.reponse = this.versionQcm
          ? `$${texPrix(a - (b * a) / 100)}$ €`
          : a - (b * a) / 100

        break
      case 'c':
        a = randint(4, 13) * 5
        n = choice(['pull', 'pantalon', 'tee-shirt', 'vêtement', 'blouson'])
        b = choice([10, 20])
        this.question = `Le prix d'un ${n} est $${a}$ €.<br>
        Il augmente de $${b}\\,\\%$. `
        if (!this.versionQcm) {
          this.question += ' Quel est son nouveau prix ? '
        } else {
          this.question += 'Son nouveau prix est : '
        }
        this.distracteurs = [
          `$${texPrix(a - (b * a) / 100)} $ €`,
          `$${texPrix(a + (b * a) / 1000)} $ €`,
          `$${texPrix(a + b / 100)} $ €`,
        ]
        this.correction = `Le nouveau prix est de `
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texPrix(a + (b * a) / 100) + '~ €')}$.`
          : `$${miseEnEvidence(texPrix(a + (b * a) / 100))}$ €.`
        if (b === 10) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de l'augmentation. <br>
    Prendre $10\\,\\%$ d'une quantité revient à la diviser par $10$. <br>
    Ainsi, $${b}\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
                 L'augmentation est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}+${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        } else {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
    Mentalement : <br>
    On calcule d'abord le montant de l'augmentation. <br>
    Pour calculer $20\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
    par $10$ :<br> $10\\,\\%$ de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 2)}$.<br>
    Puisque $20\\,\\%$ est deux fois plus grand que $10\\,\\%$, $20\\,\\%$ de $${a}$ est égal à $2\\times ${texNombre(a / 10, 2)}=${texNombre((2 * a) / 10, 2)}$.<br>
                    L'augmentation est donc de : $${texPrix((b * a) / 100)}$ €.<br>
         Le nouveau prix est : $${a}+${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(`${texPrix(a + (b * a) / 100)} ~€`)}$${texteEnCouleur('.', bleuMathalea)}`
          : `$${miseEnEvidence(`${texPrix(a + (b * a) / 100)}`)}$${texteEnCouleur(' €.', bleuMathalea)}`

        this.reponse = this.versionQcm
          ? `$${texPrix(a + (b * a) / 100)}$ €`
          : a + (b * a) / 100

        break
      case 'd':
        a = randint(10, 20) * 1000
        b = randint(1, 5)
        this.question = `Le prix d'une voiture est $${texPrix(a)}$ €.<br>
        Il augmente de $${b}\\,\\%$. `
        if (!this.versionQcm) {
          this.question += 'Quel est son nouveau prix ? '
        } else {
          this.question += 'Son nouveau prix est : '
        }
        this.distracteurs = [
          `$${texPrix(a - (b * a) / 100)} $ €`,
          `$${texPrix(a + (b * a) / 1000)} $ €`,
          `$${texPrix(a + b / 100)} $ €`,
        ]
        this.correction = `Le nouveau prix est de `
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texPrix(a + (b * a) / 100) + '~ €')}$.`
          : `$${miseEnEvidence(texPrix(a + (b * a) / 100))}$ €.`
        if (b === 1) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de l'augmentation. <br>
        Prendre $1\\,\\%$ d'une quantité revient à la diviser par $100$. <br>
        Ainsi, $${texNombre(b, 2)}\\,\\%$ de $${texNombre(a, 2)}$ est égal à $${texNombre(a, 2)}\\div 100=${texNombre(a / 100, 2)}$.<br>
                     L'augmentation est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}+${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        if (b === 5) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de l'augmentation. <br>
        Pour calculer $5\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
        par $10$ :<br> $10\\,\\%$ de $${texNombre(a)}$ est égal à $${texNombre(a)}\\div 10=${texNombre(a / 10)}$.<br>
        Puisque $5\\,\\%$ est deux fois plus petit que $10\\,\\%$, $5\\,\\%$ de $${texNombre(a)}$ est égal à $ ${texNombre(a / 10)}\\div 2=${texNombre(a / 20)}$.<br>
                     L'augmentation est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}+${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        if (b === 2 || b === 3 || b === 4) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de l'augmentation. <br>
        Pour calculer $${texNombre(b)}\\,\\%$ d'une quantité, on commence par calculer $1\\,\\%$ en divisant
        par $100$ :<br> $1\\,\\%$ de $${texNombre(a)}$ est égal à $${texNombre(a)}\\div 100=${texNombre(a / 100)}$.<br>
        Puisque $${texNombre(b)}\\,\\%$ est $${b}$ fois plus grand que $1\\,\\%$, $${texNombre(b)}\\,\\%$ de $${texNombre(a)}$ est égal à $${texNombre(b)}\\times ${texNombre(a / 100)}=${texNombre((b * a) / 100)}$.<br>
                        L'augmentation est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}+${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(`${texPrix(a + (b * a) / 100)} ~€`)}$${texteEnCouleur('.', bleuMathalea)}`
          : `$${miseEnEvidence(`${texPrix(a + (b * a) / 100)}`)}$${texteEnCouleur(' €.', bleuMathalea)}`

        this.reponse = this.versionQcm
          ? `$${texPrix(a + (b * a) / 100)}$ €`
          : a + (b * a) / 100

        break
      case 'e':
        a = randint(10, 20) * 1000
        b = randint(1, 5)
        this.question = `Le prix d'une voiture est $${texPrix(a)}$ €.<br>
        Il baisse de $${b}\\,\\%$. `
        if (!this.versionQcm) {
          this.question += ' Quel est son nouveau prix ? '
        } else {
          this.question += 'Son nouveau prix est : '
        }
        this.optionsChampTexte = { texteApres: '€' }
        this.distracteurs = [
          `$${texPrix(a + (b * a) / 100)} $ €`,
          `$${texPrix(a - (b * a) / 1000)} $ €`,
          `$${texPrix(a - b / 100)} $ €`,
        ]
        this.correction = `Le nouveau prix est de `
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texPrix(a - (b * a) / 100) + '~ €')}$.`
          : `$${miseEnEvidence(texPrix(a - (b * a) / 100))}$ €.`
        if (b === 1) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de la réduction. <br>
        Prendre $1\\,\\%$ d'une quantité revient à la diviser par $100$. <br>
        Ainsi, $${b}\\,\\%$ de $${texNombre(a, 2)}$ est égal à $${texNombre(a, 2)}\\div 100=${texNombre(a / 100, 2)}$.<br>
        La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        if (b === 5) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de la réduction. <br>
        Pour calculer $5\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant
        par $10$ :<br> $10\\,\\%$ de $${texNombre(a, 2)}$ est égal à $${texNombre(a, 2)}\\div 10=${texNombre(a / 10, 2)}$.<br>
        Puisque $5\\,\\%$ est deux fois plus petit que $10\\,\\%$, $5\\,\\%$ de $${texNombre(a)}$ est égal à $ ${texNombre(a / 10, 2)}\\div 2=${texNombre(a / 20, 2)}$.<br>
        La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        if (b === 2 || b === 3 || b === 4) {
          this.correction +=
            '<br><br>' +
            texteEnCouleur(
              `
        Mentalement : <br>
        On calcule d'abord le montant de la réduction. <br>
        Pour calculer $${b}\\,\\%$ d'une quantité, on commence par calculer $1\\,\\%$ en divisant
        par $100$ :<br> $1\\,\\%$ de $${texNombre(a)}$ est égal à $${texNombre(a)}\\div 100=${texNombre(a / 100)}$.<br>
        Puisque $${b}\\,\\%$ est $${b}$ fois plus grand que $1\\,\\%$, $${b}\\,\\%$ de $${texNombre(a)}$ est égal à $${b}\\times ${texNombre(a / 100)}=${texNombre((b * a) / 100)}$.<br>
        La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est : $${texPrix(a)}-${texPrix((b * a) / 100)}=~$`,
              bleuMathalea,
            )
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)} ~€`)}$${texteEnCouleur('.', bleuMathalea)}`
          : `$${miseEnEvidence(`${texPrix(a - (b * a) / 100)}`)}$${texteEnCouleur(' €.', bleuMathalea)}`

        this.reponse = this.versionQcm
          ? `$${texPrix(a - (b * a) / 100)}$ €`
          : a - (b * a) / 100

        break
    }
    this.correction += '<br>'

    this.canReponseACompleter = '$\\ldots$ €'
  }
}
