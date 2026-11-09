import type {
  AMCExportType,
  AmcNumericChoice,
  AMCReponseValue,
  AutoCorrectionAMC,
  AutoCorrectionForAMCHybride,
  AutoCorrectionForAMCNum,
  AutoCorrectionForAMCOpen,
  AutoCorrectionForQcm,
  OptionsForAMCHybride,
  OptionsForAMCNum,
  OptionsForAMCOpen,
  OptionsForQcmAmc,
  propositionForQcmAMC,
  QuestionAMC,
  ReponseParams,
} from './amcTypes'

export function buildAMCHybride(
  blocs: (
    | AutoCorrectionForQcm
    | AutoCorrectionForAMCNum
    | AutoCorrectionForAMCOpen
  )[],
  enonceCommun: string,
  correctionCommune: string,
  options: OptionsForAMCHybride,
): AutoCorrectionForAMCHybride {
  return {
    type: 'AMCHybride',
    enonceCommun: enonceCommun ?? '',
    blocs,
    options: options ?? {},
    correctionCommune: correctionCommune ?? '',
  }
}

export function buildAMCNum(
  enonce: string,
  reponseAttendue: AmcNumericChoice,
  correction?: string,
  options?: OptionsForAMCNum,
): AutoCorrectionForAMCNum {
  return {
    type: 'AMCNum',
    enonce,
    reponseAttendue,
    correction: correction ?? '',
    options: options ?? {},
  }
}

export function buildAMCOpen(
  enonce: string,
  correction?: string,
  options: OptionsForAMCOpen = {},
): AutoCorrectionForAMCOpen {
  return {
    type: 'AMCOpen',
    enonce,
    correction: correction ?? '',
    options,
  }
}

export function buildAMCQcm(
  enonce: string,
  propositions: propositionForQcmAMC[],
  correction?: string,
  options?: OptionsForQcmAmc,
): AutoCorrectionForQcm {
  return {
    type:
      propositions.filter((p) => p.isCorrect).length > 1
        ? 'qcmMult'
        : 'qcmMono',
    enonce,
    propositions,
    correction: correction ?? '',
    options: options ?? {},
  }
}

// ---------------------------------------------------------------------------
// Helpers internes de conversion
// ---------------------------------------------------------------------------

function amcReponseValueToString(
  valeur: AMCReponseValue | AMCReponseValue[] | undefined,
): string {
  if (valeur === undefined) return ''
  const v = Array.isArray(valeur) ? valeur[0] : valeur
  if (typeof v === 'number') return String(v)
  if (typeof v === 'object' && v !== null) {
    if (
      'num' in v &&
      'den' in v &&
      v.num !== undefined &&
      v.den !== undefined
    ) {
      return `\\frac{${v.num}}{${v.den}}`
    }
    if ('valeurDecimale' in v && v.valeurDecimale !== undefined) {
      return String(v.valeurDecimale)
    }
  }
  return ''
}

function legacyParamToAmcNumericChoice(
  valeur: AMCReponseValue | AMCReponseValue[] | undefined,
  param: ReponseParams | undefined,
): AmcNumericChoice {
  const aussiCorrect = param?.aussiCorrect
  return {
    valeur: amcReponseValueToString(valeur),
    ...(param?.digits !== undefined && { digits: param.digits }),
    ...(param?.decimals !== undefined && { decimals: param.decimals }),
    ...(param?.signe !== undefined && { signe: param.signe }),
    ...(param?.exposantNbChiffres !== undefined && {
      exposantNbChiffres: param.exposantNbChiffres,
    }),
    ...(param?.exposantSigne !== undefined && {
      exposantSigne: param.exposantSigne,
    }),
    ...(typeof param?.approx === 'number' && { approx: param.approx }),
    ...(typeof aussiCorrect === 'number' && {
      aussiCorrect: String(aussiCorrect),
    }),
    ...(param?.vertical !== undefined && { vertical: param.vertical }),
    ...(param?.tpoint !== undefined && { tpoint: param.tpoint }),
    ...(param?.digitsNum !== undefined && { digitsNum: param.digitsNum }),
    ...(param?.digitsDen !== undefined && { digitsDen: param.digitsDen }),
    ...(param?.basePuissance !== undefined && {
      basePuissance: param.basePuissance,
    }),
    ...(param?.exposantPuissance !== undefined && {
      exposantPuissance: param.exposantPuissance,
    }),
  }
}

function isHybrideLayout(item: AutoCorrectionAMC): boolean {
  const props = item.propositions ?? []
  return props.some(
    (p) =>
      p.type === 'AMCNum' ||
      p.type === 'AMCOpen' ||
      p.type === 'qcmMono' ||
      p.type === 'qcmMult' ||
      (Array.isArray(p.propositions) &&
        p.propositions.length > 0 &&
        p.type == null),
  )
}

function detectAmcType(item: AutoCorrectionAMC): AMCExportType {
  if (isHybrideLayout(item)) return 'AMCHybride'
  if (item.reponse?.valeur !== undefined) return 'AMCNum'

  const props = item.propositions ?? []
  if (props.length > 0) {
    const hasBooleanStatut = props.some((p) => typeof p.statut === 'boolean')
    const hasPositiveNumericStatut = props.some(
      (p) => typeof p.statut === 'number' && p.statut > 0,
    )
    const hasSanscadre = props.some((p) => p.sanscadre !== undefined)
    if (hasBooleanStatut && !hasPositiveNumericStatut && !hasSanscadre)
      return 'qcmMono'
    if (hasPositiveNumericStatut || hasSanscadre) return 'AMCOpen'
  }

  return 'AMCOpen'
}

function convertHybrideBloc(
  bloc: AutoCorrectionAMC['propositions'] extends (infer U)[] | undefined
    ? NonNullable<U>
    : never,
): AutoCorrectionForAMCNum | AutoCorrectionForAMCOpen | AutoCorrectionForQcm {
  if (bloc.type === 'AMCNum') {
    const choice = bloc.propositions?.[0]
    const enonce = choice?.reponse?.texte ?? choice?.enonce ?? ''
    return buildAMCNum(
      enonce,
      legacyParamToAmcNumericChoice(
        choice?.reponse?.valeur,
        choice?.reponse?.param,
      ),
      '',
    )
  }

  if (bloc.type === 'AMCOpen') {
    const enonce = bloc.enonce ?? ''
    const firstProp = bloc.propositions?.[0]
    const statut = firstProp?.statut
    return buildAMCOpen(enonce, '', {
      ...(firstProp?.sanscadre === true && { sansCadre: true }),
      ...(typeof statut === 'number' && statut > 0 && { cadreNbLines: statut }),
      ...(firstProp?.pointilles === true && { lignesEnPointillés: true }),
    })
  }

  // QCM bloc dans un hybride
  const enonce = bloc.enonce ?? ''
  const qcmProps = bloc.propositions ?? []
  const propositions: propositionForQcmAMC[] = qcmProps.map((p) => ({
    affirmation: p.texte ?? '',
    isCorrect: Boolean(p.statut),
    ...(p.feedback !== undefined && { baremeForThisQuestion: undefined }),
  }))
  return buildAMCQcm(enonce, propositions)
}

function extractHybrideParentCorrection(item: AutoCorrectionAMC): string {
  const blocs = item.propositions ?? []
  const firstNonQcmBloc = blocs.find(
    (bloc) => bloc.type === 'AMCNum' || bloc.type === 'AMCOpen',
  )

  if (firstNonQcmBloc == null) return ''

  return firstNonQcmBloc.propositions?.[0]?.texte ?? ''
}

// ---------------------------------------------------------------------------
// Fonction principale de conversion
// ---------------------------------------------------------------------------

/**
 * Convertit un item de l'ancienne structure `AutoCorrectionAMC` vers la
 * nouvelle structure typée `QuestionAMC`.
 *
 * Un indicateur `amcType` peut être fourni pour lever l'ambiguïté lorsque
 * la structure de l'item ne suffit pas à le déterminer (ex. : AMCNum dont
 * la valeur n'est pas encore dans `reponse.valeur`).
 * // Migration d'un ancien exercice (AMCOpen) :
this.questionAMC[i] = amcConvert({
  enonce: texte,
  propositions: [{ texte: '', statut: 3, sanscadre: true }],
})

// Migration explicite avec type hint (AMCNum sans valeur dans la structure) :
this.questionAMC[i] = amcConvert(this.autoCorrectionAMC[i], 'AMCNum')

// Nouvel exercice directement avec les builders :
this.questionAMC[i] = buildAMCNum(enonce, { valeur: String(result), digits: 3, decimals: 1 }, correction)
 * 
 */
export function amcConvert(
  item: AutoCorrectionAMC,
  amcType?: AMCExportType | string,
): QuestionAMC {
  const resolvedType =
    (amcType as AMCExportType | undefined) ?? detectAmcType(item)

  if (resolvedType === 'AMCHybride') {
    const blocs = (item.propositions ?? []).map(convertHybrideBloc)
    const correctionCommune = extractHybrideParentCorrection(item)
    const options: OptionsForAMCHybride = {
      ...(item.enonceAvant !== undefined && { enonceAvant: item.enonceAvant }),
      ...(item.enonceAvantUneFois !== undefined && {
        enonceAvantUneFois: item.enonceAvantUneFois,
      }),
      ...(item.enonceCentre !== undefined && {
        enonceCentre: item.enonceCentre,
      }),
      ...(item.options?.multicols !== undefined && {
        multicols: item.options.multicols,
      }),
    }
    return buildAMCHybride(blocs, item.enonce ?? '', correctionCommune, options)
  }

  if (resolvedType === 'AMCNum') {
    const enonce = item.enonce ?? ''
    const reponse = item.reponse
    const correction = item.propositions?.[0]?.texte ?? ''
    return buildAMCNum(
      enonce,
      legacyParamToAmcNumericChoice(reponse?.valeur, reponse?.param),
      correction,
    )
  }

  if (resolvedType === 'AMCOpen') {
    const enonce = item.enonce ?? ''
    const firstProp = item.propositions?.[0]
    const correction = firstProp?.texte ?? ''
    const statut = firstProp?.statut
    const options: OptionsForAMCOpen = {
      ...(firstProp?.sanscadre === true && { sansCadre: true }),
      ...(typeof statut === 'number' && statut > 0 && { cadreNbLines: statut }),
      ...(firstProp?.pointilles === true && { lignesEnPointillés: true }),
    }
    return buildAMCOpen(enonce, correction, options)
  }

  // qcmMono ou qcmMult
  const enonce = item.enonce ?? ''
  const qcmProps = item.propositions ?? []
  const propositions: propositionForQcmAMC[] = qcmProps.map((p) => ({
    affirmation: p.texte ?? '',
    isCorrect: Boolean(p.statut),
  }))
  const legacyOptions = item.options
  const qcmOptions: OptionsForQcmAmc | undefined = legacyOptions
    ? {
        ...(legacyOptions.ordered !== undefined && {
          ordered: legacyOptions.ordered,
        }),
        ...(legacyOptions.vertical !== undefined && {
          vertical: legacyOptions.vertical,
        }),
        ...(legacyOptions.lastChoice !== undefined && {
          lastchoice: legacyOptions.lastChoice,
        }),
        ...(legacyOptions.multicols !== undefined && {
          multicols: legacyOptions.multicols,
        }),
      }
    : undefined
  // si amcType indique explicitement qcmMult, on force le type
  const forcedType = resolvedType === 'qcmMult' ? 'qcmMult' : undefined
  const result = buildAMCQcm(enonce, propositions, '', qcmOptions)
  return forcedType ? { ...result, type: forcedType } : result
}
