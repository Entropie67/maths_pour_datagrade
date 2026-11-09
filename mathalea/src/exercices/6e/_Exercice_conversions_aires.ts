import Decimal from 'decimal.js'
import { texTexte } from '../../lib/format/texTexte'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { getDigitFromNumber } from './_ExerciceConversionsLongueurs'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = "Effectuer des conversions d'aires"

/**
 * Conversions d'aires en utilisant le préfixe pour déterminer la multiplication ou division à faire.
 *
 * Dans la correction, on montre que l'on multiplie ou divisie à 2 reprises par le coefficient donné par le préfixe
 *
 * * 1 : De dam², hm², km² vers m²
 * * 2 : De dm², cm², mm² vers m²
 * * 3 : Conversions en mètres-carrés
 * * 4 : Conversions avec des multiplications ou des divisions
 * * 5 : Conversions avec des ares, des centiares et des hectares
 * * 6 : Un mélange de toutes les conversions
 * * Paramètre supplémentaire : utiliser des nombres décimaux (par défaut tous les nombres sont entiers)
 * @author Rémi Angot

 */
export default class ExerciceConversionsAires extends Exercice {
  constructor() {
    super()
    this.sup = 1 // Niveau de difficulté de l'exercice
    this.sup2 = false // Avec des nombres décimaux ou pas
    this.sup3 = false // Version QCM
    this.sup4 = false // tableau
    this.spacing = 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true

    this.amcReady = amcReady
    this.amcType = amcType

    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      6,
      "1 : Conversions en m² avec des multiplications\n2 : Conversions en m² avec des divisions\n3 : Conversions en m² avec des multiplications ou divisions\n4 : Conversions avec des multiplications ou divisions\n5 : Conversions d'hectares et ares en m² \n6 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.besoinFormulaire3CaseACocher = ['Version QCM']
    this.besoinFormulaire4CaseACocher = ["Avec tableau dans l'énoncé"]
    this.besoinFormulaire5Texte = [
      'Type de correction',
      'Nombres séparés par des tirets\n1:  avec tableau\n2: Par décomposition des unités\n3: Par multiplication ou divisions successives',
    ]
    this.sup5 = '1-2-3' // Type de correction
  }

  nouvelleVersion() {
    const withTableauCorr = String(this.sup5).includes('1')
    const withDecompositionCorr = String(this.sup5).includes('2')
    const withMultiplicationCorr = String(this.sup5).includes('3')

    this.consigne = this.sup3 ? 'Cocher la bonne réponse.' : 'Compléter.'
    Decimal.set({ toExpNeg: -15 })

    let prefixeMulti = [
      [' da', '\\times100', 100, '\\times10'],
      [' h', '\\times100\\times100', 10000, '\\times100'],
      [' k', '\\times100\\times100\\times100', 1000000, '\\times1000'],
    ] // On réinitialise cette liste qui a pu être modifiée dans le cas des ares
    let prefixeDiv = [
      [' d', '\\div100', 100, '\\times0,1'],
      [' c', '\\div100\\div100', 10000, '\\times0,01'],
      [' m', '\\div100\\div100\\div100', 1000000, '\\times0,001'],
    ]
    const unite = 'm'
    const listeUnite = ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km']
    const listeDeK = combinaisonListes([0, 1, 2], this.nbQuestions)
    let hectare = false
    for (
      let i = 0,
        a,
        k: number,
        div,
        prefixe,
        resultat,
        resultat2,
        resultat3,
        resultat4,
        resultat5,
        typesDeQuestions,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrection[i] = {}
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      if (this.sup < 6) {
        typesDeQuestions = this.sup
      } else {
        typesDeQuestions = randint(1, 5)
      }
      hectare = hectare || typesDeQuestions === 5
      // k = randint(0,2); // Choix du préfixe
      k = listeDeK[i]
      if (typesDeQuestions === 1) {
        // niveau 1
        div = false // Il n'y aura pas de division
      } else if (typesDeQuestions === 2) {
        // niveau 2
        div = true // Avec des divisions
      } else if (typesDeQuestions === 3) {
        div = choice([true, false]) // Avec des multiplications ou des divisions
      } else if (typesDeQuestions === 4) {
        div = choice([true, false]) // Avec des multiplications ou des divisions sans toujours revenir au m^2
      }

      if (this.sup2) {
        // Si la case pour les nombres décimaux est cochée
        a = choice([
          new Decimal(randint(1, 9)).div(10).plus(randint(1, 99)),
          new Decimal(randint(1, 9)).div(10),
          new Decimal(randint(1, 9)).div(100),
          new Decimal(
            randint(1, 9) + randint(1, 9) * 10 + randint(1, 9) * 1000,
          ).div(100),
        ])
        // XX,X 0,X 0,0X X,XX
      } else {
        a = choice([
          randint(1, 9),
          randint(1, 9) * 10,
          randint(1, 9) * 100,
          randint(1, 9) * 10 + randint(1, 9),
        ])
        a = new Decimal(a)
        // X, X0, X00, XX
      }

      if (!div && typesDeQuestions < 4) {
        const prefixeMulti = [
          [' da', '\\times100', 100, '\\times10'],
          [' h', '\\times100\\times100', 10000, '\\times100'],
          [' k', '\\times100\\times100\\times100', 1000000, '\\times1000'],
        ] // On réinitialise cette liste qui a pu être modifiée dans le cas des ares
        resultat = a.mul(prefixeMulti[k][2]) // Utilise Decimal pour avoir le résultat exact même avec des décimaux
        texte = `$${texNombre(a, 2)} ${texTexte(prefixeMulti[k][0] + unite)}^2 = \\dotfills ${texTexte(unite)}^2$`
        texteCorr = withTableauCorr
          ? buildTab(
              String(a),
              prefixeMulti[k][0] + 'm',
              String(resultat),
              unite,
              2,
              true,
            ) + '<br>'
          : ''

        texteCorr += withDecompositionCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(prefixeMulti[k][0] + unite)}^2 
          &=${texNombre(a, 2)}\\times1 ${texTexte(prefixeMulti[k][0] + unite)}\\times1 ${texTexte(prefixeMulti[k][0] + unite)}\\\\
          &=${texNombre(a, 2)} ${prefixeMulti[k][3]} ${texTexte(unite)} ${prefixeMulti[k][3]} ${texTexte(unite)}\\\\
          &=${texNombre(a, 2)} \\times${texNombre(Number(prefixeMulti[k][2]), 0)} ${texTexte(unite)}^2\\\\
          &=${miseEnEvidence(texNombre(resultat, 0))} ${texTexte(unite)}^2
          \\end{aligned}$<br>`
          : ''
        texteCorr += withMultiplicationCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(prefixeMulti[k][0] + unite)}^2 &=
          ${range(k)
            .reverse()
            .map((i) =>
              i === 0
                ? `${texNombre(a, 2)} ${'\\times100'.repeat(k - i + 1)} ${texTexte(unite)}^2`
                : `${texNombre(a, 2)} ${'\\times100'.repeat(k - i + 1)} ${texTexte(prefixeMulti[i - 1][0] + unite)}^2`,
            )
            .join('\\\\\n&= ')}\\\\
            &=${texNombre(a, 2)} \\times ${texNombre(Number(prefixeMulti[k][2]), 0)} ${texTexte(unite)}^2\\\\
            &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(unite)}^2\\end{aligned}$`
          : ''
        prefixe = prefixeMulti[k][2]
      } else if (div && typesDeQuestions < 4) {
        prefixeDiv = [
          [' d', '\\div100', 100, '\\times0,1'],
          [' c', '\\div100\\div100', 10000, '\\times0,01'],
          [' m', '\\div100\\div100\\div100', 1000000, '\\times0,001'],
        ]
        k = randint(0, 1) // Pas de conversions de mm^2 en m^2 avec des nombres décimaux car résultat inférieur à 10e-8
        resultat = a.div(prefixeDiv[k][2]) // Attention aux notations scientifiques pour 10e-8
        texte = `$${texNombre(a, 2)} ${texTexte(prefixeDiv[k][0] + unite)}^2 = \\dotfills ${texTexte(unite)}^2$`
        texteCorr = withTableauCorr
          ? buildTab(
              String(a),
              prefixeDiv[k][0] + 'm',
              String(resultat),
              unite,
              2,
              true,
            ) + '<br>'
          : ''
        texteCorr += withDecompositionCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(prefixeDiv[k][0] + unite)}^2
          &=${texNombre(a, 2)}\\times1 ${texTexte(prefixeDiv[k][0] + unite)}\\times1 ${texTexte(prefixeDiv[k][0] + unite)}\\\\
          &=${texNombre(a, 2)} ${prefixeDiv[k][3]} ${texTexte(unite)} ${prefixeDiv[k][3]} ${texTexte(unite)}\\\\
          &=${texNombre(a, 2)} \\times${texNombre(1 / Number(prefixeDiv[k][2]), 6)} ${texTexte(unite)}^2\\\\
          &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(unite)}^2
          \\end{aligned}$<br>`
          : ''
        texteCorr += withMultiplicationCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(prefixeDiv[k][0] + unite)}^2 &=
          ${range(k)
            .reverse()
            .map((i) =>
              i === 0
                ? `${texNombre(a, 2)} ${'\\div100'.repeat(k - i + 1)} ${texTexte(unite)}^2`
                : `${texNombre(a, 2)} ${'\\div100'.repeat(k - i + 1)} ${texTexte(prefixeDiv[i - 1][0] + unite)}^2`,
            )
            .join('\\\\\n&= ')}\\\\
            &=${texNombre(a, 2)} \\div ${texNombre(Number(prefixeDiv[k][2]), 0)} ${texTexte(unite)}^2\\\\
            &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(unite)}^2\\end{aligned}$`
          : ''
        prefixe = prefixeDiv[k][2]
      } else if (typesDeQuestions === 4) {
        const unite1 = randint(0, 3)
        let ecart = randint(1, 2) // nombre de multiplication par 10 pour passer de l'un à l'autre
        if (ecart > 4 - unite1) {
          ecart = 4 - unite1
        }
        const unite2 = unite1 + ecart
        if (randint(0, 1) > 0) {
          // On multiplie pour passer de l'unité 2 à l'unité 1
          resultat = a.mul(Math.pow(10, 2 * ecart))
          texte = `$${texNombre(a, 2)} ${texTexte(listeUnite[unite2])}^2 = \\dotfills ${texTexte(listeUnite[unite1])}^2$`

          texteCorr = withTableauCorr
            ? buildTab(
                String(a),
                listeUnite[unite2],
                String(resultat),
                listeUnite[unite1],
                2,
                true,
              ) + '<br>'
            : ''
          texteCorr += withDecompositionCorr
            ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(listeUnite[unite2])}^2
          &=${texNombre(a, 2)}\\times1 ${texTexte(listeUnite[unite2])}\\times1 ${texTexte(listeUnite[unite2])}\\\\
          &=${texNombre(a, 2)} ${prefixeMulti[ecart - 1][3]}${texTexte(listeUnite[unite1])}   ${prefixeMulti[ecart - 1][3]}${texTexte(listeUnite[unite1])} \\\\
          &=${texNombre(a, 2)} \\times${texNombre(Math.pow(10, 2 * ecart))} ${texTexte(listeUnite[unite1])}^2\\\\
          &=${miseEnEvidence(texNombre(resultat, 0))} ${texTexte(listeUnite[unite1])}^2
          \\end{aligned}$<br>`
            : ''

          texteCorr += withMultiplicationCorr
            ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(listeUnite[unite2])}^2 &=
          ${range(Math.abs(ecart - 1))
            .reverse()
            .map(
              (i) =>
                `${texNombre(a, 2)} ${'\\times100'.repeat(Math.abs(ecart - i))} ${texTexte(listeUnite[unite1 + i])}^2`,
            )
            .join('\\\\\n&= ')}\\\\
            &=${texNombre(a, 2)} \\times ${texNombre(Math.pow(10, 2 * ecart))} ${texTexte(listeUnite[unite1])}^2\\\\
            &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(listeUnite[unite1])}^2\\end{aligned}$`
            : ''

          prefixe = Math.pow(10, 2 * ecart)
        } else {
          // On divise pour passer de l'unité 1 à l'unité 2
          resultat = a.div(Math.pow(10, 2 * ecart))
          texte = `$${texNombre(a, 2)} ${texTexte(listeUnite[unite1])}^2 = \\dotfills ${texTexte(listeUnite[unite2])}^2$`
          prefixe = Math.pow(10, 2 * ecart)
          texteCorr = withTableauCorr
            ? buildTab(
                String(a),
                listeUnite[unite1],
                String(resultat),
                listeUnite[unite2],
                2,
                true,
              ) + '<br>'
            : ''
          texteCorr += withDecompositionCorr
            ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(listeUnite[unite1])}^2
          &=${texNombre(a, 2)}\\times1 ${texTexte(listeUnite[unite1])}\\times1 ${texTexte(listeUnite[unite1])}\\\\
          &=${texNombre(a, 2)}  ${prefixeDiv[ecart - 1][3]} ${texTexte(listeUnite[unite2])}  ${prefixeDiv[ecart - 1][3]} ${texTexte(listeUnite[unite2])}\\\\
          &=${texNombre(a, 2)} \\times${texNombre(Math.pow(10, -2 * ecart))} ${texTexte(listeUnite[unite2])}^2\\\\
          &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(listeUnite[unite2])}^2
          \\end{aligned}$<br>`
            : ''
          texteCorr += withMultiplicationCorr
            ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(listeUnite[unite1])}^2 &= 
${range(Math.abs(ecart - 1))
  .reverse()
  .map(
    (i) =>
      `${texNombre(a, 2)} ${'\\times0,01'.repeat(Math.abs(ecart - i))} ${texTexte(listeUnite[unite1 + i])}^2`,
  )
  .join('\\\\\n&= ')}\\\\
            &=${texNombre(a, 2)} \\times ${texNombre(Math.pow(10, -2 * ecart))} ${texTexte(listeUnite[unite2])}^2\\\\
            &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(listeUnite[unite2])}^2\\end{aligned}$`
            : ''
        }
      } else {
        prefixeMulti = [
          ['ha', '\\times100\\times100', 10000, '\\times100'],
          ['a', '\\times100', 100, '\\times10'],
        ]
        k = randint(0, 1)
        resultat = a.mul(prefixeMulti[k][2]) // Utilise Decimal pour avoir le résultat exact même avec des décimaux
        texte = `$${texNombre(a, 2)} ${texTexte(String(prefixeMulti[k][0]))} = \\dotfills ${texTexte(unite)}^2$`

        texteCorr = withTableauCorr
          ? buildTab(
              String(a),
              String(prefixeMulti[k][0]),
              String(resultat),
              unite,
              2,
              true,
            ) + '<br>'
          : ''
        texteCorr += withDecompositionCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(String(prefixeMulti[k][0]))} 
          &=${texNombre(a, 2)} ${prefixeMulti[k][3]} ${texTexte(unite)} ${prefixeMulti[k][3]} ${texTexte(unite)}\\\\
          &=${texNombre(a, 2)} \\times${texNombre(Number(prefixeMulti[k][2]), 0)} ${texTexte(unite)}^2\\\\
          &=${miseEnEvidence(texNombre(resultat, 0))} ${texTexte(unite)}^2
          \\end{aligned}$<br>`
          : ''
        texteCorr += withMultiplicationCorr
          ? `$\\begin{aligned}
          ${texNombre(a, 2)} ${texTexte(String(prefixeMulti[k][0]))} &=
          ${range(1 - k)
            .reverse()
            .map((i) =>
              i === 0
                ? `${texNombre(a, 2)} ${'\\times100'.repeat(2 - k - i)} ${texTexte(unite)}^2`
                : `${texNombre(a, 2)} ${'\\times100'.repeat(2 - k - i)} ${texTexte(String(prefixeMulti[i][0]))}`,
            )
            .join('\\\\\n&= ')}\\\\
            &=${miseEnEvidence(texNombre(resultat, 10))} ${texTexte(unite)}^2\\end{aligned}$`
          : ''

        prefixe = prefixeMulti[k][2]
      }

      this.autoCorrection[i].enonce = `${texte}\n`
      resultat2 = resultat.div(10)
      resultat3 = resultat.mul(10)
      resultat4 = resultat.mul(100)
      resultat5 = resultat.div(100)
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(resultat, 10)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(resultat2, 10)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultat3, 10)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultat4, 10)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultat5, 10)}$`,
          statut: false,
        },
      ]
      const props = propositionsQcm(this, i)

      if (this.sup3) {
        texte += props.texte
      }

      if (this.questionJamaisPosee(i, a, prefixe, String(div))) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.vue === 'diap') {
          texte = texte.replace('= \\dotfills', '\\text{ en }')
        }
        if (this.interactif && !this.sup3) {
          texte = texte.replace(
            '\\dotfills',
            '$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers) +
              '$',
          )
          handleAnswers(
            this,
            i,
            {
              reponse: { value: parseFloat(resultat.toString()) },
            },
            { formatInteractif: 'mathlive' },
          )
        }
        if (context.isHtml) {
          texte = texte.replace(
            '\\dotfills',
            '\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots',
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.introduction = ''
    if (this.sup4) {
      this.introduction =
        buildTab(
          '0',
          '',
          '0',
          '',
          Math.min(10, this.nbQuestions),
          true,
          true,
          hectare,
        ) + '<br>'
    }
  }
}

function buildTab(
  nombre1: string,
  uniteNombre1: string,
  nombre2: string,
  uniteNombre2: string,
  ligne = 2,
  force = false,
  correction = false,
  hectare = false,
) {
  const tabRep = function (nbre: string, uniteNbre: string): string[] {
    const res = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]
    switch (uniteNbre.replaceAll(' ', '')) {
      case 'km':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (5 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 5 - i).toNumber()) +
            (5 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'hm':
      case 'ha':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (7 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 7 - i).toNumber()) +
            (7 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'dam':
      case 'a':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (9 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 9 - i).toNumber()) +
            (9 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'm':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (11 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 11 - i).toNumber()) +
            (11 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'dm':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (13 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 13 - i).toNumber()) +
            (13 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'cm':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (15 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 15 - i).toNumber()) +
            (15 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
      case 'mm':
        for (let i = 0; i <= 21; i++) {
          res[i] =
            (17 - i === 0 ? '\\color{red}{' : '') +
            getDigitFromNumber(nbre, Decimal.pow(10, 17 - i).toNumber()) +
            (17 - i === 0
              ? new Decimal(nbre).decimalPlaces() === 0
                ? '}'
                : ',}'
              : '')
        }
        break
    }
    return res
  }

  const createTab = function (
    aT: string[],
    rT: string[],
    first: number,
    end: number,
    ligne: number,
    correction = false,
    hectare = false,
  ) {
    let texte = '$\\def\\arraystretch{1.5}\\begin{array}{|'
    for (let i = first; i <= end; i++) {
      texte += 'c|'
    }
    texte += '}'
    const headers2 = [
      '\\hspace*{0.4cm}',
      '\\hspace*{0.4cm}',
      '\\text{km}^2',
      '\\text{hm}^2',
      '\\text{dam}^2',
      '\\text{m}^2',
      '\\text{dm}^2',
      '\\text{cm}^2',
      '\\text{mm}^2',
      '\\hspace*{0.4cm}',
      '\\hspace*{0.4cm}',
    ]
    texte += '\\hline '
    for (let i = first; i < end; i++) {
      texte += `${headers2[i]} ${i < end - 1 ? ' &' : ' \\\\'}`
    }

    /*
        if (hectare) {
          const headers3 = ['\\hspace*{0.4cm}', '\\hspace*{0.4cm}', '\\hspace*{0.4cm}', '\\textha}', '\\texta}', '\\textca}', '\\hspace*{0.4cm}', '\\hspace*{0.4cm}', '\\hspace*{0.4cm}', '\\hspace*{0.4cm}', '\\hspace*{0.4cm}']
          for (let i = first; i < end; i++) {
            texte += `${headers3[i]} ${i < end - 1 ? ' &' : ' \\\\'}`
          }
        }
        texte += ' \\hline '

        */
    // texte += '\\\\'
    if (hectare) {
      for (let i = first; i < first + 2; i++) {
        texte += '\\begin{array}{cc}'
        texte += '\\hspace*{0.4cm} & \\hspace*{0.4cm} \\\\'
        texte += '\\end{array}&'
      }
      texte += '\\begin{array}{c|c}'
      texte += '\\hspace*{0.4cm} & ha\\\\'
      texte += '\\end{array}&'
      texte += '\\begin{array}{c|c}'
      texte += '\\hspace*{0.2cm} & a\\\\'
      texte += '\\end{array}&'
      texte += '\\begin{array}{c|c}'
      texte += '\\hspace*{0.4cm} & ca\\\\'
      texte += '\\end{array}&'

      for (let i = first + 4; i < end; i++) {
        texte += '\\begin{array}{cc}'
        texte += '\\hspace*{0.4cm} & \\hspace*{0.4cm} \\\\'
        texte += '\\end{array}'
        texte += i !== end - 1 ? ' & ' : ''
      }
      texte += '\\\\'
    }
    texte += '\\hline'
    for (let i = first; i < end; i++) {
      texte += '\\begin{array}{c|c}'
      texte += `${aT[2 * i]} & ${aT[2 * i + 1]}  \\\\`
      texte += !correction ? ` ${rT[2 * i]} & ${rT[2 * i + 1]}  \\\\` : ''
      texte += '\\end{array}'
      texte += i !== end - 1 ? ' & ' : ''
    }
    for (let k = 3; k <= ligne; k++) {
      texte += '\\\\ \\hline '
      for (let i = first; i < end; i++) {
        texte += '\\begin{array}{c|c}'
        texte += ' & \\\\'
        texte += '\\end{array}'
        texte += i !== end - 1 ? ' & ' : ''
      }
    }
    texte += '\\\\ \\hline '

    texte += ' \\end{array}$'
    return texte
  }
  const aTab = tabRep(nombre1, uniteNombre1)
  const rTab = tabRep(nombre2, uniteNombre2)
  const minTab1 =
    aTab[0] !== '' || aTab[1] !== ''
      ? 0
      : aTab[2] !== '' || aTab[3] !== '' || force
        ? 2
        : 4
  const minTab2 =
    rTab[0] !== '' || rTab[1] !== ''
      ? 0
      : rTab[2] !== '' || rTab[3] !== '' || force
        ? 2
        : 4
  const maxTab1 =
    aTab[21] !== '' || aTab[20] !== ''
      ? 21
      : aTab[19] !== '' || aTab[18] !== '' || force
        ? 19
        : 17
  const maxTab2 =
    rTab[21] !== '' || rTab[20] !== ''
      ? 21
      : rTab[19] !== '' || rTab[18] !== '' || force
        ? 19
        : 17
  return createTab(
    aTab,
    rTab,
    Math.min(minTab1, minTab2) / 2,
    (1 + Math.max(maxTab1, maxTab2)) / 2,
    ligne,
    correction,
    hectare,
  )
}
