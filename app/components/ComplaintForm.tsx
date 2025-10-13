'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Send, AlertCircle, FileEdit, Plus, X, User, ChevronDown, ChevronUp } from 'lucide-react'

interface ComplaintFormProps {
  onComplaintGenerated: (complaint: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

interface CauseOfAction {
  id: string
  name: string
  description: string
  caciSeries: string
  elements: string[]
}

interface CACISeries {
  id: string
  seriesNumber: number
  title: string
  causes: CauseOfAction[]
}

interface Attorney {
  id: string
  name: string
  email: string
  barNumber: string
  lawFirmName: string
  lawFirmAddress: string
  lawFirmPhone: string
}

interface Plaintiff {
  id: string
  name: string
}

interface Defendant {
  id: string
  name: string
}

export default function ComplaintForm({ 
  onComplaintGenerated, 
  isGenerating, 
  setIsGenerating 
}: ComplaintFormProps) {
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [showManualTemplate, setShowManualTemplate] = useState(false)
  const [selectedCausesOfAction, setSelectedCausesOfAction] = useState<string[]>([])
  const [showCauseSelection, setShowCauseSelection] = useState(true)
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())
  const [attorneys, setAttorneys] = useState<Attorney[]>([
    { 
      id: '1', 
      name: 'John Smith', 
      email: 'jsmith@lawfirm.com', 
      barNumber: '123456', 
      lawFirmName: 'Smith & Associates', 
      lawFirmAddress: '123 Main Street\nLos Angeles, CA 90001', 
      lawFirmPhone: '(310) 555-1234' 
    }
  ])
  const [selectedCounty, setSelectedCounty] = useState('Los Angeles')
  const [plaintiffs, setPlaintiffs] = useState<Plaintiff[]>([
    { id: '1', name: 'Plaintiff' }
  ])
  const [defendants, setDefendants] = useState<Defendant[]>([
    { id: '1', name: 'Defendant' }
  ])
  const [caseNumber, setCaseNumber] = useState('24STCV00000')

  // California counties list
  const californiaCounties = [
    'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa', 
    'Del Norte', 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo', 
    'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa', 
    'Mendocino', 'Merced', 'Modoc', 'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange', 
    'Placer', 'Plumas', 'Riverside', 'Sacramento', 'San Benito', 'San Bernardino', 
    'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo', 'San Mateo', 
    'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra', 'Siskiyou', 
    'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare', 
    'Tuolumne', 'Ventura', 'Yolo', 'Yuba'
  ]

  // Available causes of action organized by CACI series
  const caciSeries: CACISeries[] = [
    {
      id: 'series_300',
      seriesNumber: 300,
      title: 'CONTRACT',
      causes: [
        {
          id: 'contract_300',
          name: 'Breach of Contract—Introduction',
          description: 'General introduction to breach of contract claims',
          caciSeries: 'CACI 300',
          elements: ['Contract exists', 'Breach occurred', 'Damages resulted']
        },
        {
          id: 'third_party_beneficiary_301',
          name: 'Third-Party Beneficiary',
          description: 'Claim by intended beneficiary of contract between others',
          caciSeries: 'CACI 301',
          elements: ['Contract between other parties', 'Plaintiff was intended beneficiary', 'Plaintiff\'s rights vested', 'Breach of contract', 'Damages to plaintiff']
        },
        {
          id: 'contract_formation_302',
          name: 'Contract Formation—Essential Factual Elements',
          description: 'Elements required to form a valid contract',
          caciSeries: 'CACI 302',
          elements: ['Offer', 'Acceptance', 'Consideration', 'Mutual consent', 'Legal capacity']
        },
        {
          id: 'breach_of_contract_303',
          name: 'Breach of Contract—Essential Factual Elements',
          description: 'Breach of contractual obligations (written, oral, or implied)',
          caciSeries: 'CACI 303',
          elements: ['Valid contract existed', 'Plaintiff performed or excused', 'Defendant breached contract', 'Plaintiff suffered damages']
        },
        {
          id: 'contract_terms_304',
          name: 'Oral or Written Contract Terms',
          description: 'Establishing the terms of oral or written contracts',
          caciSeries: 'CACI 304',
          elements: ['Contract terms', 'Agreement on terms', 'Terms are enforceable']
        },
        {
          id: 'implied_in_fact_305',
          name: 'Implied-in-Fact Contract',
          description: 'Contract implied from conduct and circumstances',
          caciSeries: 'CACI 305',
          elements: ['Services/goods provided', 'Recipient knew or should have known', 'Recipient indicated would pay', 'Reasonable value']
        },
        {
          id: 'unformalized_agreement_306',
          name: 'Unformalized Agreement',
          description: 'Enforceable agreement without formal documentation',
          caciSeries: 'CACI 306',
          elements: ['Agreement on essential terms', 'Intent to be bound', 'Sufficiently definite terms']
        },
        {
          id: 'contract_offer_307',
          name: 'Contract Formation—Offer',
          description: 'Valid offer as part of contract formation',
          caciSeries: 'CACI 307',
          elements: ['Definite proposal', 'Intent to be bound', 'Communicated to offeree']
        },
        {
          id: 'revocation_308',
          name: 'Contract Formation—Revocation of Offer',
          description: 'Withdrawal of offer before acceptance',
          caciSeries: 'CACI 308',
          elements: ['Valid offer existed', 'Revocation before acceptance', 'Revocation communicated']
        },
        {
          id: 'acceptance_309',
          name: 'Contract Formation—Acceptance',
          description: 'Valid acceptance forming binding contract',
          caciSeries: 'CACI 309',
          elements: ['Valid offer', 'Unqualified acceptance', 'Acceptance communicated', 'Before revocation']
        },
        {
          id: 'acceptance_silence_310',
          name: 'Contract Formation—Acceptance by Silence',
          description: 'Acceptance implied through silence in special circumstances',
          caciSeries: 'CACI 310',
          elements: ['Silence or inaction', 'Reasonable expectation of response', 'Intent to accept']
        },
        {
          id: 'rejection_311',
          name: 'Contract Formation—Rejection of Offer',
          description: 'Rejection terminating offer',
          caciSeries: 'CACI 311',
          elements: ['Valid offer', 'Rejection communicated', 'Offer terminated']
        },
        {
          id: 'substantial_performance_312',
          name: 'Substantial Performance',
          description: 'Performance sufficient despite minor deviations',
          caciSeries: 'CACI 312',
          elements: ['Contract existed', 'Substantial performance', 'Good faith effort', 'Minor deviations only']
        },
        {
          id: 'modification_313',
          name: 'Modification',
          description: 'Modification of existing contract terms',
          caciSeries: 'CACI 313',
          elements: ['Original contract', 'Agreement to modify', 'New consideration or waiver', 'Modified terms']
        },
        {
          id: 'interpretation_disputed_314',
          name: 'Interpretation—Disputed Words',
          description: 'Resolving disputes over contract language',
          caciSeries: 'CACI 314',
          elements: ['Contract terms in dispute', 'Ambiguous language', 'Intent of parties']
        },
        {
          id: 'interpretation_ordinary_315',
          name: 'Interpretation—Meaning of Ordinary Words',
          description: 'Ordinary meaning of contract terms',
          caciSeries: 'CACI 315',
          elements: ['Contract language', 'Ordinary meaning', 'Common understanding']
        },
        {
          id: 'interpretation_technical_316',
          name: 'Interpretation—Meaning of Technical Words',
          description: 'Technical or specialized terms in contracts',
          caciSeries: 'CACI 316',
          elements: ['Technical terms', 'Industry meaning', 'Specialized understanding']
        },
        {
          id: 'interpretation_whole_317',
          name: 'Interpretation—Construction of Contract as a Whole',
          description: 'Interpreting contract provisions together',
          caciSeries: 'CACI 317',
          elements: ['All contract provisions', 'Harmonious interpretation', 'Context and purpose']
        },
        {
          id: 'interpretation_conduct_318',
          name: 'Interpretation—Construction by Conduct',
          description: 'Contract interpretation based on parties\' conduct',
          caciSeries: 'CACI 318',
          elements: ['Parties\' conduct', 'Course of performance', 'Practical interpretation']
        },
        {
          id: 'interpretation_time_319',
          name: 'Interpretation—Reasonable Time',
          description: 'Determining reasonable time for performance',
          caciSeries: 'CACI 319',
          elements: ['No specified time', 'Reasonable time standard', 'Circumstances of case']
        },
        {
          id: 'interpretation_drafter_320',
          name: 'Interpretation—Construction Against Drafter',
          description: 'Ambiguities construed against party who drafted',
          caciSeries: 'CACI 320',
          elements: ['Ambiguous terms', 'Drafted by one party', 'Construction against drafter']
        },
        {
          id: 'condition_precedent_disputed_321',
          name: 'Existence of Condition Precedent Disputed',
          description: 'Dispute over whether condition precedent exists',
          caciSeries: 'CACI 321',
          elements: ['Contract provision', 'Alleged condition precedent', 'Dispute over existence']
        },
        {
          id: 'condition_precedent_occurrence_322',
          name: 'Occurrence of Agreed Condition Precedent',
          description: 'Whether agreed condition precedent occurred',
          caciSeries: 'CACI 322',
          elements: ['Condition precedent agreed', 'Occurrence or non-occurrence', 'Effect on obligations']
        },
        {
          id: 'condition_precedent_waiver_323',
          name: 'Waiver of Condition Precedent',
          description: 'Party waived requirement of condition precedent',
          caciSeries: 'CACI 323',
          elements: ['Condition precedent existed', 'Waiver by conduct or agreement', 'Obligation triggered']
        },
        {
          id: 'anticipatory_breach_324',
          name: 'Anticipatory Breach',
          description: 'Breach by repudiation before performance due',
          caciSeries: 'CACI 324',
          elements: ['Contract existed', 'Unequivocal repudiation', 'Before performance due', 'Damages']
        },
        {
          id: 'breach_implied_covenant_325',
          name: 'Breach of Implied Covenant of Good Faith and Fair Dealing',
          description: 'Breach of duty to act in good faith in performance of contract',
          caciSeries: 'CACI 325',
          elements: ['Contract between parties', 'Plaintiff performed or excused', 'Defendant unfairly interfered with plaintiff\'s rights', 'Plaintiff harmed by breach']
        },
        {
          id: 'assignment_contested_326',
          name: 'Assignment Contested',
          description: 'Dispute over validity of contract assignment',
          caciSeries: 'CACI 326',
          elements: ['Contract existed', 'Attempted assignment', 'Validity disputed', 'Rights affected']
        },
        {
          id: 'assignment_not_contested_327',
          name: 'Assignment Not Contested',
          description: 'Valid assignment of contract rights',
          caciSeries: 'CACI 327',
          elements: ['Contract existed', 'Valid assignment', 'Notice given', 'Assignee\'s rights']
        },
        {
          id: 'breach_implied_duty_care_328',
          name: 'Breach of Implied Duty to Perform With Reasonable Care',
          description: 'Failure to perform contractual obligations with reasonable care',
          caciSeries: 'CACI 328',
          elements: ['Contract existed', 'Contract required performance involving risk of harm', 'Defendant failed to use reasonable care', 'Plaintiff harmed by failure']
        }
      ]
    },
    {
      id: 'series_400',
      seriesNumber: 400,
      title: 'NEGLIGENCE',
      causes: [
        {
          id: 'negligence_400',
          name: 'Negligence—Essential Factual Elements',
      description: 'General negligence claim requiring duty, breach, causation, and damages',
          caciSeries: 'CACI 400',
      elements: ['Duty of care', 'Breach of duty', 'Causation', 'Damages']
    },
    {
          id: 'standard_of_care_401',
          name: 'Basic Standard of Care',
          description: 'Ordinary prudence standard for reasonable person',
          caciSeries: 'CACI 401',
          elements: ['Reasonable person standard', 'Ordinary prudence', 'Circumstances of case']
        },
        {
          id: 'minors_standard_402',
          name: 'Standard of Care for Minors',
          description: 'Modified standard of care for children',
          caciSeries: 'CACI 402',
          elements: ['Child of similar age', 'Intelligence and experience', 'Reasonable care for child']
        },
        {
          id: 'disability_standard_403',
          name: 'Standard of Care for Person with a Physical Disability',
          description: 'Standard adjusted for physical disabilities',
          caciSeries: 'CACI 403',
          elements: ['Physical disability', 'Reasonable care considering disability', 'Prudence expected']
        },
        {
          id: 'intoxication_404',
          name: 'Intoxication',
          description: 'Effect of voluntary intoxication on standard of care',
          caciSeries: 'CACI 404',
          elements: ['Voluntary intoxication', 'No excuse for breach', 'Same standard applies']
        },
        {
          id: 'comparative_fault_405',
          name: 'Comparative Fault of Plaintiff',
          description: 'Plaintiff\'s own negligence reducing recovery',
          caciSeries: 'CACI 405',
          elements: ['Plaintiff\'s negligence', 'Percentage of fault', 'Reduced damages']
        },
        {
          id: 'apportionment_406',
          name: 'Apportionment of Responsibility',
          description: 'Allocation of fault among multiple parties',
          caciSeries: 'CACI 406',
          elements: ['Multiple parties', 'Percentage of fault for each', 'Allocation of damages']
        },
        {
          id: 'comparative_fault_decedent_407',
          name: 'Comparative Fault of Decedent',
          description: 'Decedent\'s negligence in wrongful death case',
          caciSeries: 'CACI 407',
          elements: ['Decedent\'s negligence', 'Percentage of fault', 'Effect on recovery']
        },
        {
          id: 'reliance_good_conduct_411',
          name: 'Reliance on Good Conduct of Others',
          description: 'Right to rely on others to obey law',
          caciSeries: 'CACI 411',
          elements: ['Entitled to rely', 'Others will use care', 'Reasonable reliance']
        },
        {
          id: 'duty_children_412',
          name: 'Duty of Care Owed Children',
          description: 'Heightened duty owed to children',
          caciSeries: 'CACI 412',
          elements: ['Presence of children', 'Heightened standard', 'Reasonable care for children']
        },
        {
          id: 'custom_practice_413',
          name: 'Custom or Practice',
          description: 'Industry custom as evidence of standard of care',
          caciSeries: 'CACI 413',
          elements: ['Industry custom', 'Evidence of standard', 'Not conclusive']
        },
        {
          id: 'dangerous_situations_414',
          name: 'Amount of Caution Required in Dangerous Situations',
          description: 'Heightened care in dangerous circumstances',
          caciSeries: 'CACI 414',
          elements: ['Dangerous situation', 'Greater caution required', 'Circumstances warrant']
        },
        {
          id: 'employee_danger_415',
          name: 'Employee Required to Work in Dangerous Situations',
          description: 'Employer duty to employees in dangerous work',
          caciSeries: 'CACI 415',
          elements: ['Dangerous work conditions', 'Employer duty', 'Reasonable safety measures']
        },
        {
          id: 'electric_power_416',
          name: 'Amount of Caution Required in Transmitting Electric Power',
          description: 'Heightened duty for electrical transmission',
          caciSeries: 'CACI 416',
          elements: ['Electric power transmission', 'High degree of care', 'Dangerous instrumentality']
        },
        {
          id: 'res_ipsa_loquitur_417',
          name: 'Res Ipsa Loquitur',
          description: 'Inference of negligence from the circumstances',
          caciSeries: 'CACI 417',
          elements: ['Harm ordinarily does not occur without negligence', 'Defendant had exclusive control', 'Plaintiff did not contribute to harm', 'Evidence of actual cause unavailable']
        },
        {
          id: 'negligence_per_se_418',
          name: 'Presumption of Negligence Per Se',
      description: 'Negligence based on violation of statute or regulation',
      caciSeries: 'CACI 418',
      elements: ['Statutory violation', 'Plaintiff in protected class', 'Harm type statute intended to prevent', 'Causation', 'Damages']
    },
    {
          id: 'negligence_per_se_causation_419',
          name: 'Presumption of Negligence Per Se (Causation Only at Issue)',
          description: 'Negligence per se when only causation disputed',
          caciSeries: 'CACI 419',
          elements: ['Violation established', 'Causation in dispute', 'Presumption applies']
        },
        {
          id: 'negligence_per_se_rebuttal_420',
          name: 'Negligence Per Se: Rebuttal—Violation Excused',
          description: 'Defense to negligence per se claim',
          caciSeries: 'CACI 420',
          elements: ['Violation excused', 'Emergency or other justification', 'Rebuttal of presumption']
        },
        {
          id: 'negligence_per_se_minor_421',
          name: 'Negligence Per Se: Rebuttal (Violation of Minor Excused)',
          description: 'Minor\'s violation may be excused',
          caciSeries: 'CACI 421',
          elements: ['Minor violated statute', 'Conduct excused', 'Standard of care for minors']
        },
        {
          id: 'dram_shop_422',
          name: 'Providing Alcoholic Beverages to Obviously Intoxicated Minors',
          description: 'Furnishing alcohol to obviously intoxicated minor',
          caciSeries: 'CACI 422',
          elements: ['Defendant furnished alcoholic beverages', 'To obviously intoxicated minor', 'Minor caused injury to plaintiff', 'Substantial factor in causing harm']
        },
        {
          id: 'public_entity_423',
          name: 'Public Entity Liability for Failure to Perform Mandatory Duty',
          description: 'Public entity liability for mandatory duty breach',
          caciSeries: 'CACI 423',
          elements: ['Mandatory duty', 'Failure to perform', 'Causation', 'Damages']
        },
        {
          id: 'negligence_not_contested_424',
          name: 'Negligence Not Contested—Essential Factual Elements',
          description: 'Negligence admitted, only causation/damages at issue',
          caciSeries: 'CACI 424',
          elements: ['Negligence admitted', 'Causation', 'Damages']
        },
        {
          id: 'gross_negligence_425',
      name: 'Gross Negligence',
      description: 'Extreme departure from ordinary standard of care',
      caciSeries: 'CACI 425',
      elements: ['Duty of care', 'Extreme breach', 'Want of even scant care', 'Causation', 'Damages']
    },
        {
          id: 'negligent_hiring_426',
          name: 'Negligent Hiring, Supervision, or Retention of Employee',
          description: 'Employer liability for negligently hiring or supervising employee',
          caciSeries: 'CACI 426',
          elements: ['Employee was unfit/incompetent', 'Employer knew or should have known', 'Unfitness created particular risk of harm', 'Employee\'s unfitness harmed plaintiff']
        },
        {
          id: 'dram_shop_minors_427',
          name: 'Furnishing Alcoholic Beverages to Minors',
          description: 'Civil liability for providing alcohol to minors',
          caciSeries: 'CACI 427',
          elements: ['Furnished alcohol to minor', 'Minor caused injury', 'Substantial factor', 'Damages']
        },
        {
          id: 'parental_liability_428',
          name: 'Parental Liability (Nonstatutory)',
          description: 'Common law parental liability for child\'s conduct',
          caciSeries: 'CACI 428',
          elements: ['Parent-child relationship', 'Parent\'s negligence', 'Causation', 'Damages']
        },
        {
          id: 'sexual_transmission_429',
          name: 'Negligent Sexual Transmission of Disease',
          description: 'Negligent transmission of sexually transmitted disease',
          caciSeries: 'CACI 429',
          elements: ['Defendant had disease', 'Knew or should have known', 'Failed to warn', 'Transmission', 'Damages']
        },
        {
          id: 'substantial_factor_430',
          name: 'Causation: Substantial Factor',
          description: 'Substantial factor test for causation',
          caciSeries: 'CACI 430',
          elements: ['Conduct was substantial factor', 'In causing harm', 'But for test']
        },
        {
          id: 'multiple_causes_431',
          name: 'Causation: Multiple Causes',
          description: 'Multiple causes contributing to harm',
          caciSeries: 'CACI 431',
          elements: ['Multiple causes', 'Each a substantial factor', 'Combined effect']
        },
        {
          id: 'superseding_cause_432',
          name: 'Affirmative Defense—Causation: Third-Party Conduct as Superseding Cause',
          description: 'Third party conduct breaks chain of causation',
          caciSeries: 'CACI 432',
          elements: ['Third party conduct', 'Unforeseeable', 'Superseding cause', 'Breaks causal chain']
        },
        {
          id: 'intentional_superseding_433',
          name: 'Affirmative Defense—Causation: Intentional Tort/Criminal Act as Superseding Cause',
          description: 'Intentional or criminal act as superseding cause',
          caciSeries: 'CACI 433',
          elements: ['Intentional or criminal act', 'Unforeseeable', 'Superseding cause']
        },
        {
          id: 'alternative_causation_434',
          name: 'Alternative Causation',
          description: 'Burden shift when multiple defendants and uncertain which caused harm',
          caciSeries: 'CACI 434',
          elements: ['Multiple defendants', 'One caused harm', 'Uncertain which one', 'Burden shifts']
        },
        {
          id: 'asbestos_causation_435',
          name: 'Causation for Asbestos-Related Cancer Claims',
          description: 'Special causation standard for asbestos cases',
          caciSeries: 'CACI 435',
          elements: ['Asbestos exposure', 'Substantial factor', 'Cancer diagnosis', 'Causation']
        },
        {
          id: 'law_enforcement_nondeadly_440',
          name: 'Negligent Use of Nondeadly Force by Law Enforcement',
          description: 'Excessive force by police (non-deadly)',
          caciSeries: 'CACI 440',
          elements: ['Law enforcement officer', 'Use of nondeadly force', 'Unreasonable', 'Injury', 'Damages']
        },
        {
          id: 'law_enforcement_deadly_441',
          name: 'Negligent Use of Deadly Force by Peace Officer',
          description: 'Excessive deadly force by police',
          caciSeries: 'CACI 441',
          elements: ['Peace officer', 'Use of deadly force', 'Unreasonable', 'Injury/death', 'Damages']
        },
        {
          id: 'good_samaritan_nonemergency_450a',
          name: 'Good Samaritan—Nonemergency',
          description: 'Limited liability for gratuitous assistance',
          caciSeries: 'CACI 450A',
          elements: ['Gratuitous aid', 'No emergency', 'Gross negligence required', 'Causation']
        },
        {
          id: 'good_samaritan_emergency_450b',
          name: 'Good Samaritan—Scene of Emergency',
          description: 'Protection for emergency assistance',
          caciSeries: 'CACI 450B',
          elements: ['Emergency scene', 'Gratuitous aid', 'Gross negligence required', 'Good faith']
        },
        {
          id: 'negligent_undertaking_450c',
          name: 'Negligent Undertaking',
          description: 'Assumption of duty to perform service and failure to exercise reasonable care',
          caciSeries: 'CACI 450C',
          elements: ['Defendant undertook to perform service', 'Performance created risk of harm', 'Failed to exercise reasonable care', 'Failure was substantial factor in causing harm']
        },
        {
          id: 'contractual_assumption_risk_451',
          name: 'Affirmative Defense—Contractual Assumption of Risk',
          description: 'Waiver or release of liability by contract',
          caciSeries: 'CACI 451',
          elements: ['Valid contract', 'Assumption of risk', 'Express agreement', 'Bars recovery']
        },
        {
          id: 'sudden_emergency_452',
          name: 'Sudden Emergency',
          description: 'Sudden emergency doctrine',
          caciSeries: 'CACI 452',
          elements: ['Sudden emergency', 'Not caused by defendant', 'Reasonable response', 'No negligence']
        },
        {
          id: 'rescue_453',
          name: 'Injury Incurred in Course of Rescue',
          description: 'Rescue doctrine',
          caciSeries: 'CACI 453',
          elements: ['Emergency created by defendant', 'Reasonable rescue attempt', 'Foreseeable', 'Defendant liable']
        },
        {
          id: 'statute_limitations_454',
          name: 'Affirmative Defense—Statute of Limitations',
          description: 'Time bar to bringing claims',
          caciSeries: 'CACI 454',
          elements: ['Claim accrued', 'Time period expired', 'Action barred']
        },
        {
          id: 'delayed_discovery_455',
          name: 'Statute of Limitations—Delayed Discovery',
          description: 'Discovery rule for statute of limitations',
          caciSeries: 'CACI 455',
          elements: ['Plaintiff did not discover', 'Should not have discovered', 'Delayed accrual']
        },
        {
          id: 'estoppel_sol_456',
          name: 'Defendant Estopped From Asserting Statute of Limitations Defense',
          description: 'Equitable estoppel against SOL defense',
          caciSeries: 'CACI 456',
          elements: ['Defendant\'s conduct', 'Prevented timely filing', 'Estoppel applies']
        },
        {
          id: 'equitable_tolling_457',
          name: 'Statute of Limitations—Equitable Tolling',
          description: 'Tolling based on prior proceeding',
          caciSeries: 'CACI 457',
          elements: ['Prior proceeding', 'Tolling period', 'Extended time']
        },
        {
          id: 'ultrahazardous_460',
          name: 'Strict Liability for Ultrahazardous Activities',
          description: 'Strict liability for abnormally dangerous activities',
          caciSeries: 'CACI 460',
          elements: ['Ultrahazardous activity', 'Harm resulted', 'Causation', 'Damages']
        },
        {
          id: 'wild_animal_461',
          name: 'Strict Liability for Injury Caused by Wild Animal',
          description: 'Strict liability for wild animal injuries',
          caciSeries: 'CACI 461',
          elements: ['Wild animal', 'Defendant owned/possessed', 'Caused injury', 'Damages']
        },
        {
          id: 'dangerous_animal_462',
          name: 'Strict Liability for Injury Caused by Domestic Animal With Dangerous Propensities',
          description: 'Strict liability for injury caused by animal with known dangerous propensities',
          caciSeries: 'CACI 462',
          elements: ['Defendant owned/possessed animal', 'Animal had dangerous propensities', 'Defendant knew or should have known', 'Animal\'s propensity caused harm to plaintiff']
        },
        {
          id: 'dog_bite_463',
          name: 'Dog Bite Statute',
          description: 'Strict liability for dog bite regardless of prior viciousness',
          caciSeries: 'CACI 463',
          elements: ['Defendant owned the dog', 'Dog bit plaintiff', 'Plaintiff was in public place or lawfully on private property', 'Plaintiff was injured by the bite']
        }
      ]
    },
    {
      id: 'series_500',
      seriesNumber: 500,
      title: 'MEDICAL NEGLIGENCE',
      causes: [
        {
          id: 'medical_negligence_500',
          name: 'Medical Negligence—Essential Factual Elements',
          description: 'Professional negligence by healthcare providers',
          caciSeries: 'CACI 500',
          elements: ['Doctor-patient relationship', 'Standard of care', 'Breach of standard', 'Causation', 'Damages']
        },
        {
          id: 'standard_care_health_501',
          name: 'Standard of Care for Health Care Professionals',
          description: 'General standard of care for healthcare providers',
          caciSeries: 'CACI 501',
          elements: ['Degree of knowledge and skill', 'Ordinary care and skill', 'Reasonably careful health care professional', 'Same or similar circumstances']
        },
        {
          id: 'standard_care_specialist_502',
          name: 'Standard of Care for Medical Specialists',
          description: 'Heightened standard for medical specialists',
          caciSeries: 'CACI 502',
          elements: ['Specialist designation', 'Degree of learning and skill', 'Ordinarily possessed by specialists', 'Same or similar circumstances']
        },
        {
          id: 'psychotherapist_duty_503a',
          name: 'Psychotherapist\'s Duty to Protect Intended Victim From Patient\'s Threat',
          description: 'Tarasoff duty to warn/protect',
          caciSeries: 'CACI 503A',
          elements: ['Patient made serious threat', 'Against reasonably identifiable victim', 'Psychotherapist failed to take reasonable steps', 'To protect victim', 'Harm resulted']
        },
        {
          id: 'psychotherapist_defense_503b',
          name: 'Affirmative Defense—Psychotherapist\'s Communication of Threat to Victim and Law Enforcement',
          description: 'Defense to Tarasoff liability',
          caciSeries: 'CACI 503B',
          elements: ['Communicated threat to victim', 'Notified law enforcement', 'Reasonable steps taken', 'Defense established']
        },
        {
          id: 'standard_care_nurses_504',
          name: 'Standard of Care for Nurses',
          description: 'Standard of care applicable to nursing professionals',
          caciSeries: 'CACI 504',
          elements: ['Nursing professional', 'Degree of learning and skill', 'Ordinarily possessed by nurses', 'Same or similar circumstances']
        },
        {
          id: 'success_not_required_505',
          name: 'Success Not Required',
          description: 'Physician not liable for unsuccessful treatment if proper care used',
          caciSeries: 'CACI 505',
          elements: ['Treatment unsuccessful', 'Not evidence of negligence', 'Proper care used', 'No guarantee of success']
        },
        {
          id: 'alternative_methods_506',
          name: 'Alternative Methods of Care',
          description: 'Multiple acceptable methods of treatment',
          caciSeries: 'CACI 506',
          elements: ['Alternative methods available', 'Each method acceptable', 'Choice of method reasonable', 'No negligence']
        },
        {
          id: 'duty_warn_patient_507',
          name: 'Duty to Warn Patient',
          description: 'Physician duty to warn patient of risks',
          caciSeries: 'CACI 507',
          elements: ['Material risks existed', 'Duty to warn patient', 'Failed to warn', 'Causation', 'Harm']
        },
        {
          id: 'duty_refer_specialist_508',
          name: 'Duty to Refer to a Specialist',
          description: 'Physician duty to refer when appropriate',
          caciSeries: 'CACI 508',
          elements: ['Condition required specialist', 'Duty to refer', 'Failed to refer', 'Causation', 'Harm']
        },
        {
          id: 'abandonment_patient_509',
          name: 'Abandonment of Patient',
          description: 'Physician abandonment of doctor-patient relationship',
          caciSeries: 'CACI 509',
          elements: ['Doctor-patient relationship existed', 'Need for continued care', 'Physician terminated relationship without notice', 'Plaintiff unable to obtain alternative care', 'Harm resulted']
        },
        {
          id: 'derivative_liability_surgeon_510',
          name: 'Derivative Liability of Surgeon',
          description: 'Surgeon liability for acts of assistants',
          caciSeries: 'CACI 510',
          elements: ['Surgeon in charge', 'Assistant\'s negligence', 'During surgery', 'Surgeon\'s responsibility', 'Harm resulted']
        },
        {
          id: 'wrongful_birth_sterilization_511',
          name: 'Wrongful Birth—Sterilization/Abortion',
          description: 'Failed sterilization or abortion resulting in birth',
          caciSeries: 'CACI 511',
          elements: ['Sterilization or abortion performed', 'Procedure failed', 'Child born', 'Damages from birth']
        },
        {
          id: 'wrongful_birth_512',
          name: 'Wrongful Birth—Essential Factual Elements',
          description: 'Negligent failure to diagnose or inform of birth defects',
          caciSeries: 'CACI 512',
          elements: ['Healthcare provider\'s duty', 'Failed to diagnose/inform of condition', 'Parents would have avoided conception/birth', 'Damages from raising disabled child']
        },
        {
          id: 'wrongful_life_513',
          name: 'Wrongful Life—Essential Factual Elements',
          description: 'Child\'s claim for being born with defects',
          caciSeries: 'CACI 513',
          elements: ['Healthcare provider\'s negligence', 'Failed to inform parents', 'Child born with condition', 'Special damages only']
        },
        {
          id: 'duty_hospital_514',
          name: 'Duty of Hospital',
          description: 'General duty of hospitals to patients',
          caciSeries: 'CACI 514',
          elements: ['Hospital-patient relationship', 'Duty to use ordinary care', 'Breach of duty', 'Causation', 'Damages']
        },
        {
          id: 'hospital_safe_environment_515',
          name: 'Duty of Hospital to Provide Safe Environment',
          description: 'Hospital duty to maintain safe premises',
          caciSeries: 'CACI 515',
          elements: ['Hospital duty', 'Maintain safe environment', 'Failed to do so', 'Causation', 'Harm']
        },
        {
          id: 'hospital_screen_staff_516',
          name: 'Duty of Hospital to Screen Medical Staff',
          description: 'Hospital duty to properly credential physicians',
          caciSeries: 'CACI 516',
          elements: ['Hospital duty to screen', 'Failed to properly screen', 'Physician was incompetent', 'Causation', 'Harm']
        },
        {
          id: 'patient_duty_wellbeing_517',
          name: 'Affirmative Defense—Patient\'s Duty to Provide for the Patient\'s Own Well-Being',
          description: 'Patient\'s duty to follow medical advice',
          caciSeries: 'CACI 517',
          elements: ['Patient failed to follow advice', 'Reasonable instructions given', 'Failure contributed to harm', 'Comparative fault']
        },
        {
          id: 'medical_res_ipsa_518',
          name: 'Medical Malpractice: Res Ipsa Loquitur',
          description: 'Res ipsa loquitur in medical malpractice cases',
          caciSeries: 'CACI 518',
          elements: ['Harm ordinarily does not occur without negligence', 'Defendant had exclusive control', 'Plaintiff did not contribute', 'More likely than not due to negligence']
        },
        {
          id: 'medical_battery_530a',
          name: 'Medical Battery',
          description: 'Unauthorized medical treatment or procedure',
          caciSeries: 'CACI 530A',
          elements: ['Defendant performed medical procedure', 'Without plaintiff\'s consent', 'Harmful or offensive contact', 'Plaintiff harmed']
        },
        {
          id: 'medical_battery_conditional_530b',
          name: 'Medical Battery—Conditional Consent',
          description: 'Treatment exceeding scope of consent',
          caciSeries: 'CACI 530B',
          elements: ['Consent with conditions', 'Defendant exceeded conditions', 'Without emergency justification', 'Harmful or offensive contact', 'Harm']
        },
        {
          id: 'consent_behalf_another_531',
          name: 'Consent on Behalf of Another',
          description: 'Authority to consent for another person',
          caciSeries: 'CACI 531',
          elements: ['Third party gave consent', 'Authority to consent', 'Consent was valid', 'Treatment authorized']
        },
        {
          id: 'informed_consent_definition_532',
          name: 'Informed Consent—Definition',
          description: 'Definition of informed consent',
          caciSeries: 'CACI 532',
          elements: ['Material risks disclosed', 'Reasonable alternatives explained', 'Patient understood', 'Voluntary consent']
        },
        {
          id: 'lack_informed_consent_533',
          name: 'Failure to Obtain Informed Consent—Essential Factual Elements',
          description: 'Failure to obtain informed consent for medical procedure',
          caciSeries: 'CACI 533',
          elements: ['Defendant performed procedure', 'Failed to disclose material risks', 'Reasonable person would not have consented', 'Undisclosed risk materialized', 'Plaintiff harmed']
        },
        {
          id: 'informed_refusal_534',
          name: 'Informed Refusal—Definition',
          description: 'Definition of informed refusal',
          caciSeries: 'CACI 534',
          elements: ['Patient refused treatment', 'Risks of refusal disclosed', 'Patient understood', 'Voluntary refusal']
        },
        {
          id: 'risks_nontreatment_535',
          name: 'Risks of Nontreatment—Essential Factual Elements',
          description: 'Physician duty to warn of risks of not treating',
          caciSeries: 'CACI 535',
          elements: ['Patient declined treatment', 'Physician failed to warn of risks', 'Reasonable person would have accepted treatment', 'Risk materialized', 'Harm']
        }
      ]
    },
    {
      id: 'series_600',
      seriesNumber: 600,
      title: 'PROFESSIONAL NEGLIGENCE',
      causes: [
        {
          id: 'professional_standard_care_600',
          name: 'Standard of Care',
          description: 'Standard of care for professionals',
          caciSeries: 'CACI 600',
          elements: ['Professional relationship', 'Standard of care in profession', 'Breach of standard', 'Causation', 'Damages']
        },
        {
          id: 'legal_malpractice_causation_601',
          name: 'Legal Malpractice—Causation',
          description: 'Causation in legal malpractice cases (case within a case)',
          caciSeries: 'CACI 601',
          elements: ['Attorney-client relationship', 'Negligence', 'But for negligence would have obtained better result', 'Damages']
        },
        {
          id: 'success_not_required_602',
          name: 'Success Not Required',
          description: 'Attorney not liable for unsuccessful outcome if proper care used',
          caciSeries: 'CACI 602',
          elements: ['Unsuccessful outcome', 'Not evidence of negligence', 'Proper care used', 'No guarantee of success']
        },
        {
          id: 'alternative_legal_strategies_603',
          name: 'Alternative Legal Decisions or Strategies',
          description: 'Multiple acceptable legal strategies',
          caciSeries: 'CACI 603',
          elements: ['Alternative strategies available', 'Each strategy acceptable', 'Choice of strategy reasonable', 'No negligence']
        },
        {
          id: 'referral_legal_specialist_604',
          name: 'Referral to Legal Specialist',
          description: 'Attorney duty to refer when appropriate',
          caciSeries: 'CACI 604',
          elements: ['Matter required specialist', 'Duty to refer', 'Failed to refer', 'Causation', 'Harm']
        },
        {
          id: 'legal_malpractice_criminal_606',
          name: 'Legal Malpractice Causing Criminal Conviction—Actual Innocence',
          description: 'Legal malpractice resulting in criminal conviction',
          caciSeries: 'CACI 606',
          elements: ['Attorney-client relationship', 'Attorney negligence', 'Actual innocence', 'Conviction resulted', 'Damages']
        }
      ]
    },
    {
      id: 'series_700',
      seriesNumber: 700,
      title: 'MOTOR VEHICLES AND HIGHWAY SAFETY',
      causes: [
        {
          id: 'motor_vehicle_basic_700',
          name: 'Basic Standard of Care',
          description: 'Basic standard of care for motor vehicle operation',
          caciSeries: 'CACI 700',
          elements: ['Operation of motor vehicle', 'Reasonable care', 'Breach', 'Causation', 'Damages']
        },
        {
          id: 'right_of_way_definition_701',
          name: 'Definition of Right-of-Way',
          description: 'Definition and rules of right-of-way',
          caciSeries: 'CACI 701',
          elements: ['Right-of-way defined', 'Priority rules', 'Duty to yield']
        },
        {
          id: 'waiver_right_of_way_702',
          name: 'Waiver of Right-of-Way',
          description: 'Driver may waive right-of-way',
          caciSeries: 'CACI 702',
          elements: ['Right-of-way waived', 'Clear indication', 'Other driver entitled to rely']
        },
        {
          id: 'immediate_hazard_703',
          name: 'Definition of "Immediate Hazard"',
          description: 'Definition of immediate hazard in traffic context',
          caciSeries: 'CACI 703',
          elements: ['Immediate hazard defined', 'Collision imminent', 'Reasonable person standard']
        },
        {
          id: 'left_turns_704',
          name: 'Left Turns',
          description: 'Duties when making left turns (Veh. Code § 21801)',
          caciSeries: 'CACI 704',
          elements: ['Making left turn', 'Yield to oncoming traffic', 'Violation of statute', 'Causation']
        },
        {
          id: 'turning_705',
          name: 'Turning',
          description: 'Duties when turning (Veh. Code § 22107)',
          caciSeries: 'CACI 705',
          elements: ['Making turn', 'Signal required', 'Safe to turn', 'Violation', 'Causation']
        },
        {
          id: 'basic_speed_law_706',
          name: 'Basic Speed Law',
          description: 'Speed must be reasonable and prudent (Veh. Code § 22350)',
          caciSeries: 'CACI 706',
          elements: ['Speed greater than reasonable', 'Under conditions present', 'Violation of basic speed law', 'Causation']
        },
        {
          id: 'speed_limit_707',
          name: 'Speed Limit',
          description: 'Posted speed limit violations (Veh. Code § 22352)',
          caciSeries: 'CACI 707',
          elements: ['Exceeded posted speed limit', 'Violation of statute', 'Causation', 'Damages']
        },
        {
          id: 'maximum_speed_708',
          name: 'Maximum Speed Limit',
          description: 'Maximum speed limit violations (Veh. Code §§ 22349, 22356)',
          caciSeries: 'CACI 708',
          elements: ['Exceeded maximum speed', 'Violation of statute', 'Causation', 'Damages']
        },
        {
          id: 'dui_709',
          name: 'Driving Under the Influence',
          description: 'DUI violations (Veh. Code §§ 23152, 23153)',
          caciSeries: 'CACI 709',
          elements: ['Drove under influence', 'Impaired ability to drive', 'Violation of statute', 'Causation', 'Damages']
        },
        {
          id: 'crosswalk_duties_710',
          name: 'Duties of Care for Pedestrians and Drivers in Crosswalk',
          description: 'Crosswalk duties (Veh. Code § 21950)',
          caciSeries: 'CACI 710',
          elements: ['Pedestrian in crosswalk', 'Driver duty to yield', 'Pedestrian duty of care', 'Violation', 'Causation']
        },
        {
          id: 'passenger_duty_711',
          name: 'The Passenger\'s Duty of Care for Own Safety',
          description: 'Passenger\'s duty to exercise care for own safety',
          caciSeries: 'CACI 711',
          elements: ['Passenger status', 'Duty to exercise care', 'Failed to do so', 'Comparative fault']
        },
        {
          id: 'seat_belt_defense_712',
          name: 'Affirmative Defense—Failure to Wear a Seat Belt',
          description: 'Defense based on failure to wear seat belt',
          caciSeries: 'CACI 712',
          elements: ['Failed to wear seat belt', 'Injuries enhanced', 'Comparative fault', 'Reduced damages']
        },
        {
          id: 'owner_liability_720',
          name: 'Motor Vehicle Owner Liability—Permissive Use of Vehicle',
          description: 'Owner liability for permissive driver',
          caciSeries: 'CACI 720',
          elements: ['Owner of vehicle', 'Permission to drive', 'Driver negligent', 'Causation', 'Owner liable']
        },
        {
          id: 'owner_liability_defense_721',
          name: 'Motor Vehicle Owner Liability—Affirmative Defense—Use Beyond Scope of Permission',
          description: 'Defense when driver exceeds scope of permission',
          caciSeries: 'CACI 721',
          elements: ['Use beyond scope', 'Substantial deviation', 'Owner not liable']
        },
        {
          id: 'adult_liability_minor_722',
          name: 'Adult\'s Liability for Minor\'s Permissive Use of Motor Vehicle',
          description: 'Adult liability for giving permission to minor driver',
          caciSeries: 'CACI 722',
          elements: ['Adult gave permission', 'Minor driver', 'Minor negligent', 'Causation', 'Adult liable']
        },
        {
          id: 'cosigner_liability_723',
          name: 'Liability of Cosigner of Minor\'s Application for Driver\'s License',
          description: 'Cosigner liability for minor driver',
          caciSeries: 'CACI 723',
          elements: ['Cosigned license application', 'Minor driver', 'Minor negligent', 'Causation', 'Cosigner liable']
        },
        {
          id: 'negligent_entrustment_724',
          name: 'Negligent Entrustment of Motor Vehicle',
          description: 'Liability for entrusting vehicle to incompetent driver',
          caciSeries: 'CACI 724',
          elements: ['Entrusted vehicle', 'Driver incompetent', 'Owner knew or should have known', 'Driver negligent', 'Causation']
        },
        {
          id: 'emergency_vehicle_730',
          name: 'Emergency Vehicle Exemption',
          description: 'Exemptions for emergency vehicles (Veh. Code § 21055)',
          caciSeries: 'CACI 730',
          elements: ['Emergency vehicle', 'Responding to emergency', 'Exemption from rules', 'Reasonable care still required']
        },
        {
          id: 'emergency_definition_731',
          name: 'Definition of "Emergency"',
          description: 'Definition of emergency for vehicle code purposes (Veh. Code § 21055)',
          caciSeries: 'CACI 731',
          elements: ['Emergency defined', 'Circumstances requiring immediate action', 'Public safety']
        }
      ]
    },
    {
      id: 'series_800',
      seriesNumber: 800,
      title: 'RAILROAD CROSSINGS',
      causes: [
        {
          id: 'railroad_basic_care_800',
          name: 'Basic Standard of Care for Railroads',
          description: 'General standard of care for railroad operations',
          caciSeries: 'CACI 800',
          elements: ['Railroad operation', 'Duty of care', 'Breach', 'Causation', 'Damages']
        },
        {
          id: 'railroad_safety_regulations_801',
          name: 'Duty to Comply With Safety Regulations',
          description: 'Railroad duty to comply with safety regulations',
          caciSeries: 'CACI 801',
          elements: ['Safety regulation exists', 'Duty to comply', 'Violation', 'Causation', 'Damages']
        },
        {
          id: 'railroad_speed_803',
          name: 'Regulating Speed',
          description: 'Railroad duty to regulate speed at crossings',
          caciSeries: 'CACI 803',
          elements: ['Crossing location', 'Duty to regulate speed', 'Excessive speed', 'Causation', 'Harm']
        },
        {
          id: 'railroad_lookout_804',
          name: 'Lookout for Crossing Traffic',
          description: 'Railroad duty to maintain lookout at crossings',
          caciSeries: 'CACI 804',
          elements: ['Approaching crossing', 'Duty to maintain lookout', 'Failed to maintain lookout', 'Causation', 'Collision']
        },
        {
          id: 'railroad_warning_systems_805',
          name: 'Installing Warning Systems',
          description: 'Railroad duty to install and maintain warning systems',
          caciSeries: 'CACI 805',
          elements: ['Crossing location', 'Duty to install warnings', 'Failed to install or maintain', 'Causation', 'Harm']
        },
        {
          id: 'railroad_comparative_fault_806',
          name: 'Comparative Fault—Duty to Approach Crossing With Care',
          description: 'Driver\'s duty approaching railroad crossing',
          caciSeries: 'CACI 806',
          elements: ['Approaching crossing', 'Duty to exercise care', 'Failed to do so', 'Comparative fault']
        }
      ]
    },
    {
      id: 'series_900',
      seriesNumber: 900,
      title: 'COMMON CARRIERS',
      causes: [
        {
          id: 'common_carrier_intro_900',
          name: 'Introductory Instruction',
          description: 'Introduction to common carrier liability',
          caciSeries: 'CACI 900',
          elements: ['Common carrier status', 'Higher duty of care', 'Passenger relationship']
        },
        {
          id: 'common_carrier_status_disputed_901',
          name: 'Status of Common Carrier Disputed',
          description: 'When common carrier status is disputed',
          caciSeries: 'CACI 901',
          elements: ['Carrier status disputed', 'Held out to public', 'For hire', 'Transportation services']
        },
        {
          id: 'common_carrier_duty_902',
          name: 'Duty of Common Carrier',
          description: 'General duty of common carriers',
          caciSeries: 'CACI 902',
          elements: ['Common carrier', 'Utmost care and diligence', 'Human care and foresight', 'For safety of passengers']
        },
        {
          id: 'common_carrier_safe_equipment_903',
          name: 'Duty to Provide and Maintain Safe Equipment',
          description: 'Carrier duty regarding equipment safety',
          caciSeries: 'CACI 903',
          elements: ['Duty to provide safe equipment', 'Failed to maintain', 'Unsafe condition', 'Causation', 'Harm']
        },
        {
          id: 'common_carrier_illness_disability_904',
          name: 'Duty of Common Carrier Toward Passengers With Illness or Disability',
          description: 'Heightened duty toward passengers with special needs',
          caciSeries: 'CACI 904',
          elements: ['Passenger with illness/disability', 'Carrier knew or should have known', 'Duty to exercise greater care', 'Breach', 'Harm']
        },
        {
          id: 'common_carrier_minors_905',
          name: 'Duty of Common Carrier Toward Minor Passengers',
          description: 'Heightened duty toward minor passengers',
          caciSeries: 'CACI 905',
          elements: ['Minor passenger', 'Higher degree of care', 'Breach of duty', 'Causation', 'Harm']
        },
        {
          id: 'passenger_duty_906',
          name: 'Duty of Passenger for Own Safety',
          description: 'Passenger\'s duty to exercise ordinary care',
          caciSeries: 'CACI 906',
          elements: ['Passenger status', 'Duty of ordinary care', 'Failed to exercise care', 'Comparative fault']
        },
        {
          id: 'passenger_status_disputed_907',
          name: 'Status of Passenger Disputed',
          description: 'When passenger status is disputed',
          caciSeries: 'CACI 907',
          elements: ['Passenger status disputed', 'Accepted for carriage', 'Fare paid or expected', 'Passenger relationship']
        },
        {
          id: 'common_carrier_assault_908',
          name: 'Duty to Protect Passengers From Assault',
          description: 'Carrier duty to protect from third-party assault',
          caciSeries: 'CACI 908',
          elements: ['Common carrier duty', 'Risk of assault foreseeable', 'Failed to protect', 'Assault occurred', 'Harm']
        }
      ]
    },
    {
      id: 'series_1000',
      seriesNumber: 1000,
      title: 'PREMISES LIABILITY',
      causes: [
        {
          id: 'premises_liability_1000',
          name: 'Premises Liability—Essential Factual Elements',
          description: 'Essential elements for premises liability claims',
          caciSeries: 'CACI 1000',
          elements: ['Defendant owned/controlled property', 'Defendant negligent', 'Plaintiff harmed', 'Causation']
        },
        {
          id: 'basic_duty_care_1001',
          name: 'Basic Duty of Care',
          description: 'General duty of care for property owners',
          caciSeries: 'CACI 1001',
          elements: ['Duty to use reasonable care', 'Eliminate dangerous conditions', 'Warn of dangers', 'Breach', 'Harm']
        },
        {
          id: 'extent_control_1002',
          name: 'Extent of Control Over Premises Area',
          description: 'Determining extent of control over property',
          caciSeries: 'CACI 1002',
          elements: ['Control over premises', 'Extent of control', 'Right to control', 'Actual control', 'Responsibility']
        },
        {
          id: 'unsafe_conditions_1003',
          name: 'Unsafe Conditions',
          description: 'Definition and evaluation of unsafe conditions',
          caciSeries: 'CACI 1003',
          elements: ['Condition created unreasonable risk', 'Reasonable person would have recognized', 'Foreseeable harm', 'Unsafe condition']
        },
        {
          id: 'obviously_unsafe_1004',
          name: 'Obviously Unsafe Conditions',
          description: 'When conditions are obviously unsafe',
          caciSeries: 'CACI 1004',
          elements: ['Condition obvious', 'Reasonable person would observe', 'Open and apparent', 'No duty to warn']
        },
        {
          id: 'criminal_conduct_1005',
          name: 'Business Proprietor\'s or Property Owner\'s Liability for the Criminal Conduct of Others',
          description: 'Liability for third-party criminal acts on property',
          caciSeries: 'CACI 1005',
          elements: ['Criminal conduct by third party', 'Foreseeability', 'Failed to take reasonable precautions', 'Causation', 'Harm']
        },
        {
          id: 'landlord_duty_1006',
          name: 'Landlord\'s Duty',
          description: 'Specific duties of landlords',
          caciSeries: 'CACI 1006',
          elements: ['Landlord-tenant relationship', 'Control over property', 'Knowledge of dangerous condition', 'Failed to repair', 'Harm']
        },
        {
          id: 'sidewalk_abutting_1007',
          name: 'Sidewalk Abutting Property',
          description: 'Liability for sidewalks adjacent to property',
          caciSeries: 'CACI 1007',
          elements: ['Sidewalk abutting property', 'Dangerous condition', 'Duty to maintain', 'Breach', 'Causation']
        },
        {
          id: 'altered_sidewalk_1008',
          name: 'Liability for Adjacent Altered Sidewalk—Essential Factual Elements',
          description: 'Liability when sidewalk has been altered',
          caciSeries: 'CACI 1008',
          elements: ['Altered sidewalk', 'Alteration created danger', 'Defendant altered', 'Causation', 'Harm']
        },
        {
          id: 'independent_contractor_concealed_1009a',
          name: 'Liability to Employees of Independent Contractors for Unsafe Concealed Conditions',
          description: 'Liability for concealed dangers to contractor employees',
          caciSeries: 'CACI 1009A',
          elements: ['Independent contractor employee', 'Concealed dangerous condition', 'Owner knew or should have known', 'Failed to warn', 'Harm']
        },
        {
          id: 'independent_contractor_retained_1009b',
          name: 'Liability to Employees of Independent Contractors for Unsafe Conditions—Retained Control',
          description: 'Liability when retaining control over contractor work',
          caciSeries: 'CACI 1009B',
          elements: ['Retained control', 'Dangerous condition', 'Failed to take precautions', 'Contractor employee harmed', 'Causation']
        },
        {
          id: 'independent_contractor_equipment_1009d',
          name: 'Liability to Employees of Independent Contractors for Unsafe Conditions—Defective Equipment',
          description: 'Liability for defective equipment provided to contractors',
          caciSeries: 'CACI 1009D',
          elements: ['Provided equipment', 'Defective equipment', 'Knew or should have known', 'Contractor employee harmed', 'Causation']
        },
        {
          id: 'recreation_immunity_1010',
          name: 'Affirmative Defense—Recreation Immunity—Exceptions',
          description: 'Recreational use immunity defense',
          caciSeries: 'CACI 1010',
          elements: ['Property opened for recreation', 'No charge', 'Immunity applies', 'Exceptions', 'Willful/malicious failure']
        },
        {
          id: 'constructive_notice_1011',
          name: 'Constructive Notice Regarding Dangerous Conditions on Property',
          description: 'When owner deemed to have notice of dangerous conditions',
          caciSeries: 'CACI 1011',
          elements: ['Dangerous condition existed', 'Condition present long enough', 'Reasonable inspection would have discovered', 'Constructive notice']
        },
        {
          id: 'employee_knowledge_1012',
          name: 'Knowledge of Employee Imputed to Owner',
          description: 'When employee knowledge is attributed to owner',
          caciSeries: 'CACI 1012',
          elements: ['Employee knowledge', 'Scope of employment', 'Knowledge imputed to owner', 'Duty to act']
        }
      ]
    },
    {
      id: 'series_1100',
      seriesNumber: 1100,
      title: 'DANGEROUS CONDITION OF PUBLIC PROPERTY',
      causes: [
        {
          id: 'dangerous_public_property_1100',
          name: 'Dangerous Condition on Public Property—Essential Factual Elements',
          description: 'Essential elements for public property dangerous condition claims',
          caciSeries: 'CACI 1100',
          elements: ['Public property', 'Dangerous condition', 'Employee negligent', 'Actual or constructive notice', 'Causation', 'Damages']
        },
        {
          id: 'control_1101',
          name: 'Control',
          description: 'Determining control over public property',
          caciSeries: 'CACI 1101',
          elements: ['Public entity control', 'Right to control', 'Actual control', 'Duty to maintain']
        },
        {
          id: 'dangerous_condition_definition_1102',
          name: 'Definition of "Dangerous Condition"',
          description: 'Legal definition of dangerous condition for public property',
          caciSeries: 'CACI 1102',
          elements: ['Condition of property', 'Substantial risk of injury', 'Foreseeable manner', 'Reasonable care']
        },
        {
          id: 'notice_1103',
          name: 'Notice',
          description: 'Actual or constructive notice of dangerous condition',
          caciSeries: 'CACI 1103',
          elements: ['Actual notice', 'Or constructive notice', 'Sufficient time to correct', 'Failed to correct']
        },
        {
          id: 'inspection_system_1104',
          name: 'Inspection System',
          description: 'Adequacy of public entity inspection systems',
          caciSeries: 'CACI 1104',
          elements: ['Duty to inspect', 'Reasonable inspection system', 'Failed to implement', 'Would have discovered', 'Causation']
        },
        {
          id: 'natural_conditions_defense_1110',
          name: 'Affirmative Defense—Natural Conditions',
          description: 'Immunity for natural conditions of unimproved property',
          caciSeries: 'CACI 1110',
          elements: ['Natural condition', 'Unimproved public property', 'No immunity exception', 'Defense established']
        },
        {
          id: 'reasonable_act_omission_1111',
          name: 'Affirmative Defense—Condition Created by Reasonable Act or Omission',
          description: 'Defense when condition created by reasonable conduct',
          caciSeries: 'CACI 1111',
          elements: ['Condition created by act/omission', 'Act was reasonable', 'Reasonably approved plan', 'Defense established']
        },
        {
          id: 'reasonable_correction_1112',
          name: 'Affirmative Defense—Reasonable Act or Omission to Correct',
          description: 'Defense for reasonable efforts to correct condition',
          caciSeries: 'CACI 1112',
          elements: ['Reasonable action to correct', 'Or reasonable decision not to act', 'Reasonableness of decision', 'Defense established']
        },
        {
          id: 'traffic_control_signals_1120',
          name: 'Failure to Provide Traffic Control Signals',
          description: 'Liability for failure to provide traffic control signals',
          caciSeries: 'CACI 1120',
          elements: ['Duty to provide signals', 'Dangerous condition', 'Failed to provide', 'Causation', 'Harm']
        },
        {
          id: 'traffic_warning_1121',
          name: 'Failure to Provide Traffic Warning Signals, Signs, or Markings',
          description: 'Liability for inadequate traffic warnings',
          caciSeries: 'CACI 1121',
          elements: ['Duty to warn', 'Dangerous condition', 'Failed to provide warnings', 'Causation', 'Harm']
        },
        {
          id: 'weather_conditions_defense_1122',
          name: 'Affirmative Defense—Weather Conditions Affecting Streets and Highways',
          description: 'Immunity for weather-related road conditions',
          caciSeries: 'CACI 1122',
          elements: ['Weather condition', 'Streets/highways', 'Immunity applies', 'No exception']
        },
        {
          id: 'design_immunity_1123',
          name: 'Affirmative Defense—Design Immunity',
          description: 'Immunity for approved design of public improvements',
          caciSeries: 'CACI 1123',
          elements: ['Approved design', 'Discretionary approval', 'Substantial evidence', 'Design immunity applies']
        },
        {
          id: 'loss_design_immunity_1124',
          name: 'Loss of Design Immunity (Cornette)',
          description: 'When design immunity is lost due to changed conditions',
          caciSeries: 'CACI 1124',
          elements: ['Initial design immunity', 'Substantially changed conditions', 'New plan required', 'Immunity lost']
        },
        {
          id: 'adjacent_property_1125',
          name: 'Conditions on Adjacent Property',
          description: 'Liability for dangerous conditions on adjacent property',
          caciSeries: 'CACI 1125',
          elements: ['Adjacent property condition', 'Affects public property', 'Public entity control/notice', 'Causation', 'Harm']
        },
        {
          id: 'failure_warn_approved_design_1126',
          name: 'Failure to Warn of a Dangerous Roadway Condition Resulting From an Approved Design—Essential Factual Elements',
          description: 'Duty to warn of dangers from approved design',
          caciSeries: 'CACI 1126',
          elements: ['Approved design', 'Created dangerous condition', 'Duty to warn', 'Failed to warn', 'Causation', 'Harm']
        }
      ]
    },
    {
      id: 'series_1200',
      seriesNumber: 1200,
      title: 'PRODUCTS LIABILITY',
      causes: [
        {
          id: 'strict_liability_1200',
          name: 'Strict Liability—Essential Factual Elements',
          description: 'Essential elements for strict products liability',
          caciSeries: 'CACI 1200',
          elements: ['Defendant manufactured/sold/distributed', 'Product defective', 'Defect substantial factor in harm', 'Damages']
        },
        {
          id: 'manufacturing_defect_1201',
          name: 'Strict Liability—Manufacturing Defect—Essential Factual Elements',
          description: 'Product differs from manufacturer\'s intended design',
          caciSeries: 'CACI 1201',
          elements: ['Product differed from design', 'Defect existed at time of sale', 'Defect substantial factor', 'Harm']
        },
        {
          id: 'manufacturing_defect_explained_1202',
          name: 'Strict Liability—"Manufacturing Defect" Explained',
          description: 'Definition and explanation of manufacturing defect',
          caciSeries: 'CACI 1202',
          elements: ['Differs from intended design', 'Not manufactured as intended', 'Does not perform as safely', 'Unreasonably dangerous']
        },
        {
          id: 'design_defect_consumer_1203',
          name: 'Strict Liability—Design Defect—Consumer Expectation Test—Essential Factual Elements',
          description: 'Product failed to perform as safely as expected',
          caciSeries: 'CACI 1203',
          elements: ['Failed to perform safely', 'Ordinary consumer expectations', 'Defect substantial factor', 'Harm']
        },
        {
          id: 'design_defect_risk_benefit_1204',
          name: 'Strict Liability—Design Defect—Risk-Benefit Test—Essential Factual Elements—Shifting Burden of Proof',
          description: 'Product design risks outweigh benefits',
          caciSeries: 'CACI 1204',
          elements: ['Risk of danger in design', 'Outweighs benefits', 'Safer alternative design', 'Omission substantial factor', 'Harm']
        },
        {
          id: 'failure_to_warn_1205',
          name: 'Strict Liability—Failure to Warn—Essential Factual Elements',
          description: 'Failed to adequately warn of product dangers',
          caciSeries: 'CACI 1205',
          elements: ['Failed to warn', 'Known or reasonably knowable risk', 'Lack of warning substantial factor', 'Harm']
        },
        {
          id: 'allergen_warning_1206',
          name: 'Strict Liability—Failure to Warn—Products Containing Allergens (Not Prescription Drugs)—Essential Factual Elements',
          description: 'Failed to warn of allergens in product',
          caciSeries: 'CACI 1206',
          elements: ['Product contains allergen', 'Failed to warn', 'Risk known or knowable', 'Allergic reaction', 'Harm']
        },
        {
          id: 'comparative_fault_plaintiff_1207a',
          name: 'Strict Liability—Comparative Fault of Plaintiff',
          description: 'Plaintiff\'s comparative fault in products liability',
          caciSeries: 'CACI 1207A',
          elements: ['Product defect', 'Plaintiff fault', 'Percentage of fault', 'Damages reduced']
        },
        {
          id: 'comparative_fault_third_1207b',
          name: 'Strict Liability—Comparative Fault of Third Person',
          description: 'Third party\'s comparative fault in products liability',
          caciSeries: 'CACI 1207B',
          elements: ['Product defect', 'Third party fault', 'Apportionment', 'Reduced liability']
        },
        {
          id: 'component_parts_1208',
          name: 'Component Parts Rule',
          description: 'Liability for component parts of products',
          caciSeries: 'CACI 1208',
          elements: ['Component part', 'Incorporated into product', 'Component not defective', 'Component caused harm']
        },
        {
          id: 'products_negligence_1220',
          name: 'Negligence—Essential Factual Elements',
          description: 'Negligence theory in products liability',
          caciSeries: 'CACI 1220',
          elements: ['Defendant manufactured/designed/sold', 'Defendant negligent', 'Negligence substantial factor', 'Harm']
        },
        {
          id: 'products_standard_care_1221',
          name: 'Negligence—Basic Standard of Care',
          description: 'Standard of care for product manufacturers',
          caciSeries: 'CACI 1221',
          elements: ['Duty of reasonable care', 'Ordinary prudence', 'Design, manufacture, distribute', 'Reasonably safe product']
        },
        {
          id: 'duty_to_warn_1222',
          name: 'Negligence—Manufacturer or Supplier—Duty to Warn—Essential Factual Elements',
          description: 'Negligence for failure to warn of product dangers',
          caciSeries: 'CACI 1222',
          elements: ['Known or should have known of risk', 'Duty to warn', 'Failed to warn', 'Ordinary care to warn', 'Causation', 'Harm']
        },
        {
          id: 'recall_retrofit_1223',
          name: 'Negligence—Recall/Retrofit',
          description: 'Liability for failure to recall or retrofit products',
          caciSeries: 'CACI 1223',
          elements: ['Discovered product danger', 'Duty to recall or retrofit', 'Failed to do so', 'Causation', 'Harm']
        },
        {
          id: 'product_rental_1224',
          name: 'Negligence—Negligence for Product Rental/Standard of Care',
          description: 'Standard of care for product rental companies',
          caciSeries: 'CACI 1224',
          elements: ['Rented product', 'Duty of reasonable care', 'Inspection and maintenance', 'Breach', 'Causation', 'Harm']
        },
        {
          id: 'express_warranty_1230',
          name: 'Express Warranty—Essential Factual Elements',
          description: 'Breach of express warranty claims',
          caciSeries: 'CACI 1230',
          elements: ['Express warranty made', 'Product failed to conform', 'Breach substantial factor', 'Harm']
        },
        {
          id: 'implied_warranty_merchantability_1231',
          name: 'Implied Warranty of Merchantability—Essential Factual Elements',
          description: 'Breach of implied warranty of merchantability',
          caciSeries: 'CACI 1231',
          elements: ['Product sold', 'Not merchantable', 'Not fit for ordinary purposes', 'Breach substantial factor', 'Harm']
        },
        {
          id: 'implied_warranty_fitness_1232',
          name: 'Implied Warranty of Fitness for a Particular Purpose—Essential Factual Elements',
          description: 'Breach of implied warranty of fitness',
          caciSeries: 'CACI 1232',
          elements: ['Particular purpose', 'Reliance on seller expertise', 'Product not fit', 'Breach substantial factor', 'Harm']
        },
        {
          id: 'implied_warranty_food_1233',
          name: 'Implied Warranty of Merchantability for Food—Essential Factual Elements',
          description: 'Breach of implied warranty for food products',
          caciSeries: 'CACI 1233',
          elements: ['Food product sold', 'Not wholesome/fit for consumption', 'Breach substantial factor', 'Harm']
        }
      ]
    },
    {
      id: 'series_1300',
      seriesNumber: 1300,
      title: 'ASSAULT AND BATTERY',
      causes: [
    {
      id: 'battery',
      name: 'Battery',
      description: 'Intentional harmful or offensive contact',
      caciSeries: 'CACI 1300',
      elements: ['Intent to contact', 'Harmful or offensive contact', 'Lack of consent', 'Damages']
    },
        {
          id: 'intentional_tort',
          name: 'Assault',
          description: 'Intentional act causing apprehension of harmful contact',
          caciSeries: 'CACI 1300-series',
          elements: ['Intent', 'Act causing apprehension', 'Reasonable apprehension', 'Damages']
        }
      ]
    },
    {
      id: 'series_1400',
      seriesNumber: 1400,
      title: 'FALSE IMPRISONMENT',
      causes: []
    },
    {
      id: 'series_1500',
      seriesNumber: 1500,
      title: 'MALICIOUS PROSECUTION',
      causes: []
    },
    {
      id: 'series_1600',
      seriesNumber: 1600,
      title: 'EMOTIONAL DISTRESS',
      causes: [
    {
      id: 'iied',
      name: 'Intentional Infliction of Emotional Distress',
      description: 'Extreme and outrageous conduct causing severe emotional distress',
      caciSeries: 'CACI 1600',
      elements: ['Extreme/outrageous conduct', 'Intent or recklessness', 'Severe emotional distress', 'Causation']
        }
      ]
    },
    {
      id: 'series_1700',
      seriesNumber: 1700,
      title: 'DEFAMATION',
      causes: []
    },
    {
      id: 'series_1800',
      seriesNumber: 1800,
      title: 'RIGHT OF PRIVACY',
      causes: []
    },
    {
      id: 'series_1900',
      seriesNumber: 1900,
      title: 'FRAUD OR DECEIT',
      causes: [
        {
          id: 'fraud',
          name: 'Fraud/Misrepresentation',
          description: 'Intentional misrepresentation or fraud',
          caciSeries: 'CACI 1900-series',
          elements: ['False representation', 'Knowledge of falsity', 'Intent to induce reliance', 'Justifiable reliance', 'Damages']
    },
    {
      id: 'negligent_misrepresentation',
      name: 'Negligent Misrepresentation',
      description: 'Careless provision of false information',
      caciSeries: 'CACI 1903',
      elements: ['False representation', 'No reasonable grounds', 'Intent to induce reliance', 'Justifiable reliance', 'Damages']
        }
      ]
    },
    {
      id: 'series_2000',
      seriesNumber: 2000,
      title: 'TRESPASS',
      causes: []
    },
    {
      id: 'series_2100',
      seriesNumber: 2100,
      title: 'CONVERSION',
      causes: []
    },
    {
      id: 'series_2200',
      seriesNumber: 2200,
      title: 'ECONOMIC INTERFERENCE',
      causes: []
    },
    {
      id: 'series_2300',
      seriesNumber: 2300,
      title: 'INSURANCE LITIGATION',
      causes: []
    },
    {
      id: 'series_2400',
      seriesNumber: 2400,
      title: 'WRONGFUL TERMINATION',
      causes: []
    },
    {
      id: 'series_2500',
      seriesNumber: 2500,
      title: 'FAIR EMPLOYMENT AND HOUSING ACT',
      causes: []
    },
    {
      id: 'series_other',
      seriesNumber: 0,
      title: 'OTHER',
      causes: [
    {
      id: 'unfair_business_practices',
      name: 'Unfair Business Practices',
      description: 'Violations of Business & Professions Code §17200',
      caciSeries: 'Bus. & Prof. Code §17200',
      elements: ['Unlawful/unfair/fraudulent business act', 'Injury in fact', 'Lost money or property', 'Causation']
    },
    {
      id: 'punitive_damages',
      name: 'Punitive Damages',
      description: 'Enhanced damages for malicious, oppressive, or fraudulent conduct',
      caciSeries: 'CACI 3940-3949',
      elements: ['Malicious, oppressive, or fraudulent conduct', 'Clear and convincing evidence', 'Reprehensibility of conduct', 'Relationship to compensatory damages']
        }
      ]
    }
  ]
  
  // Flatten for backward compatibility with existing code
  const availableCausesOfAction: CauseOfAction[] = caciSeries.flatMap(series => series.causes)

  // Handle cooldown timer
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCooldown(rateLimitCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [rateLimitCooldown])

  // Attorney management functions
  const addAttorney = () => {
    if (attorneys.length < 5) {
      const newAttorney: Attorney = {
        id: Date.now().toString(),
        name: '',
        email: '',
        barNumber: '',
        lawFirmName: '',
        lawFirmAddress: '',
        lawFirmPhone: ''
      }
      setAttorneys([...attorneys, newAttorney])
    }
  }

  const removeAttorney = (id: string) => {
    if (attorneys.length > 1) {
      setAttorneys(attorneys.filter(attorney => attorney.id !== id))
    }
  }

  const updateAttorney = (id: string, field: keyof Omit<Attorney, 'id'>, value: string) => {
    setAttorneys(attorneys.map(attorney => 
      attorney.id === id ? { ...attorney, [field]: value } : attorney
    ))
  }

  // Plaintiff management functions
  const addPlaintiff = () => {
    if (plaintiffs.length < 10) {
      const newPlaintiff: Plaintiff = {
        id: Date.now().toString(),
        name: ''
      }
      setPlaintiffs([...plaintiffs, newPlaintiff])
    }
  }

  const removePlaintiff = (id: string) => {
    if (plaintiffs.length > 1) {
      setPlaintiffs(plaintiffs.filter(plaintiff => plaintiff.id !== id))
    }
  }

  const updatePlaintiff = (id: string, name: string) => {
    setPlaintiffs(plaintiffs.map(plaintiff => 
      plaintiff.id === id ? { ...plaintiff, name } : plaintiff
    ))
  }

  // Defendant management functions
  const addDefendant = () => {
    if (defendants.length < 10) {
      const newDefendant: Defendant = {
        id: Date.now().toString(),
        name: ''
      }
      setDefendants([...defendants, newDefendant])
    }
  }

  const removeDefendant = (id: string) => {
    if (defendants.length > 1) {
      setDefendants(defendants.filter(defendant => defendant.id !== id))
    }
  }

  const updateDefendant = (id: string, name: string) => {
    setDefendants(defendants.map(defendant => 
      defendant.id === id ? { ...defendant, name } : defendant
    ))
  }

  const generateManualTemplate = () => {
    // Generate attorney header section
    const attorneyHeader = attorneys
      .filter(att => att.name.trim() || att.email.trim() || att.barNumber.trim() || att.lawFirmName.trim())
      .map((attorney, index) => {
        const name = attorney.name.trim() || '[ATTORNEY NAME]'
        const barNumber = attorney.barNumber.trim() || '[BAR NUMBER]'
        const email = attorney.email.trim() || '[EMAIL]'
        const lawFirmName = attorney.lawFirmName.trim() || '[LAW FIRM NAME]'
        const lawFirmAddress = attorney.lawFirmAddress.trim() || '[ADDRESS]\n[CITY, STATE ZIP]'
        const lawFirmPhone = attorney.lawFirmPhone.trim() || '[PHONE]'
        
        return `${name} (California State Bar No. ${barNumber})
${email}
${lawFirmName}
${lawFirmAddress}
Telephone: ${lawFirmPhone}${index === 0 ? '\n\nAttorney for [PARTY]' : ''}`
      }).join('\n\n') || `[ATTORNEY NAME] (California State Bar No. [BAR NUMBER])
[EMAIL]
[LAW FIRM NAME]
[ADDRESS]
[CITY, STATE ZIP]
Telephone: [PHONE]

Attorney for [PARTY]`

    // Generate plaintiff names for case caption
    const plaintiffNames = plaintiffs
      .filter(p => p.name.trim())
      .map(p => p.name.trim())
      .join(', ') || '[PLAINTIFF NAME]'

    // Generate defendant names for case caption
    const defendantNames = defendants
      .filter(d => d.name.trim())
      .map(d => d.name.trim())
      .join(', ') || '[DEFENDANT NAME]'

    const template = `${attorneyHeader}

SUPERIOR COURT OF CALIFORNIA
COUNTY OF ${selectedCounty.toUpperCase() || '[COUNTY NAME]'}

${plaintiffNames},
    Plaintiff${plaintiffs.filter(p => p.name.trim()).length > 1 ? 's' : ''},
v.
${defendantNames},
    Defendant${defendants.filter(d => d.name.trim()).length > 1 ? 's' : ''}.

No. ${caseNumber.trim() || '[CASE NUMBER]'}

COMPLAINT

PARTIES

I. Jurisdiction

1. This Court has jurisdiction over this action because [jurisdiction basis].

2. Venue is proper in this County because [venue basis].

FIRST CAUSE OF ACTION
(Negligence)

3. ${summary.trim() ? `Based on the following facts: ${summary.trim()}` : '[State your factual allegations here]'}

4. Defendant owed Plaintiff a duty of care.

5. Defendant breached that duty by [specific actions that caused the incident].

6. As a proximate result of Defendant's negligence, Plaintiff suffered damages including [describe injuries/damages].

SECOND CAUSE OF ACTION
(Negligence Per Se)
[If applicable based on violation of statute/regulation]

PRAYER FOR RELIEF

WHEREFORE, Plaintiff prays for judgment against Defendant as follows:

1. General damages according to proof;
2. Special damages according to proof;
3. Medical expenses according to proof;
4. Lost wages and earning capacity according to proof;
5. Costs of suit;
6. Such other relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands trial by jury on all issues so triable.

Dated: ${new Date().toLocaleDateString()}

                    _________________________
                    [ATTORNEY SIGNATURE]
                    [ATTORNEY NAME]
                    Attorney for Plaintiff`
    
    onComplaintGenerated(template)
    setShowManualTemplate(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!summary.trim()) {
      setError('Please enter a case summary')
      return
    }

    if (summary.trim().length < 50) {
      setError('Please provide a more detailed case summary (at least 50 characters)')
      return
    }

    if (!selectedCounty) {
      setError('Please select a California county')
      return
    }

    const validPlaintiffs = plaintiffs.filter(p => p.name.trim())
    if (validPlaintiffs.length === 0) {
      setError('Please enter at least one plaintiff name')
      return
    }

    const validDefendants = defendants.filter(d => d.name.trim())
    if (validDefendants.length === 0) {
      setError('Please enter at least one defendant name')
      return
    }

    // Check local storage cache first
    const cacheKey = `complaint_${encodeURIComponent(summary.trim().toLowerCase()).replace(/%/g, '_')}`
    const cachedResult = localStorage.getItem(cacheKey)
    
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult)
        const cacheAge = Date.now() - parsed.timestamp
        const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
        
        if (cacheAge < CACHE_DURATION) {
          console.log('Using cached complaint from localStorage')
          onComplaintGenerated(parsed.complaint)
          return
        }
      } catch (e) {
        // Invalid cache, continue with API call
        localStorage.removeItem(cacheKey)
      }
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary.trim(),
          causesOfAction: selectedCausesOfAction.length > 0 ? selectedCausesOfAction : null,
          attorneys: attorneys.filter(att => 
            att.name.trim() || att.email.trim() || att.barNumber.trim() || 
            att.lawFirmName.trim() || att.lawFirmAddress.trim() || att.lawFirmPhone.trim()
          ),
          county: selectedCounty,
          plaintiffs: plaintiffs.filter(p => p.name.trim()),
          defendants: defendants.filter(d => d.name.trim()),
          caseNumber: caseNumber.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle quota exceeded specifically
        if (errorData.type === 'quota_exceeded') {
          setError(errorData.userMessage || errorData.error)
          return
        }
        
        // Handle rate limiting
        if (errorData.type === 'rate_limit_exceeded') {
          setError(errorData.error)
          setRateLimitCooldown(errorData.retryAfter || 120)
          return
        }
        
        throw new Error(errorData.error || 'Failed to generate complaint')
      }

      const data = await response.json()
      
      // Cache the result in localStorage
      const cacheKey = `complaint_${encodeURIComponent(summary.trim().toLowerCase()).replace(/%/g, '_')}`
      const cacheData = {
        complaint: data.complaint,
        timestamp: Date.now(),
        summary: summary.trim()
      }
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        
        // Clean up old cache entries (keep only 10 most recent)
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('complaint_'))
        if (allKeys.length > 10) {
          const entries = allKeys.map(key => {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}')
              return { key, timestamp: data.timestamp || 0 }
            } catch {
              return { key, timestamp: 0 }
            }
          })
          
          entries.sort((a, b) => a.timestamp - b.timestamp)
          // Remove oldest entries
          for (let i = 0; i < allKeys.length - 10; i++) {
            localStorage.removeItem(entries[i].key)
          }
        }
      } catch (e) {
        console.warn('Failed to cache complaint in localStorage:', e)
      }
      
      onComplaintGenerated(data.complaint)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      // If it's a rate limit error, start longer cooldown
      if (errorMessage.includes('Rate limit exceeded')) {
        setRateLimitCooldown(120) // 2 minute cooldown to match server delays
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const exampleSummaries = [
    "On July 15, 2024, in Los Angeles County, plaintiff John Smith was rear-ended by defendant Jane Doe while stopped at a red light on Sunset Boulevard. The impact caused significant damage to plaintiff's vehicle and resulted in neck and back injuries requiring medical treatment.",
    "On March 3, 2024, plaintiff's property was damaged due to defendant's negligent maintenance of water pipes, causing flooding in plaintiff's basement and destroying personal belongings worth approximately $15,000.",
    "On September 12, 2024, defendant's delivery truck collided with plaintiff's parked vehicle outside plaintiff's residence in San Francisco, causing substantial property damage and forcing plaintiff to seek alternative transportation."
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">Generate Legal Complaint</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attorney Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Attorney Information
              </label>
              <span className="text-xs text-gray-500">
                {attorneys.length}/5 attorneys
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Enter attorney details for the complaint header. At least one attorney is required.
            </p>
            
            <div className="space-y-4">
              {attorneys.map((attorney, index) => (
                <div key={attorney.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Attorney {index + 1}
                      </span>
                    </div>
                    {attorneys.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttorney(attorney.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        disabled={isGenerating}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Attorney Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Attorney Name
                        </label>
                        <input
                          type="text"
                          value={attorney.name}
                          onChange={(e) => updateAttorney(attorney.id, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="input-field text-sm"
                          disabled={isGenerating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={attorney.email}
                          onChange={(e) => updateAttorney(attorney.id, 'email', e.target.value)}
                          placeholder="attorney@lawfirm.com"
                          className="input-field text-sm"
                          disabled={isGenerating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          California State Bar Number
                        </label>
                        <input
                          type="text"
                          value={attorney.barNumber}
                          onChange={(e) => updateAttorney(attorney.id, 'barNumber', e.target.value)}
                          placeholder="123456"
                          className="input-field text-sm"
                          disabled={isGenerating}
                        />
                      </div>
                    </div>

                    {/* Law Firm Information */}
                    <div className="border-t border-gray-200 pt-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Law Firm Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Law Firm Name
                          </label>
                          <input
                            type="text"
                            value={attorney.lawFirmName}
                            onChange={(e) => updateAttorney(attorney.id, 'lawFirmName', e.target.value)}
                            placeholder="Law Firm Name"
                            className="input-field text-sm"
                            disabled={isGenerating}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Law Firm Address
                          </label>
                          <input
                            type="text"
                            value={attorney.lawFirmAddress}
                            onChange={(e) => updateAttorney(attorney.id, 'lawFirmAddress', e.target.value)}
                            placeholder="123 Main St, City, State ZIP"
                            className="input-field text-sm"
                            disabled={isGenerating}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Telephone Number
                          </label>
                          <input
                            type="tel"
                            value={attorney.lawFirmPhone}
                            onChange={(e) => updateAttorney(attorney.id, 'lawFirmPhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="input-field text-sm"
                            disabled={isGenerating}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {attorneys.length < 5 && (
                <button
                  type="button"
                  onClick={addAttorney}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors"
                  disabled={isGenerating}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Attorney</span>
                </button>
              )}
            </div>
          </div>

          {/* County Selection */}
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
              California County *
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Select the county where the complaint will be filed.
            </p>
            <select
              id="county"
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="input-field"
              disabled={isGenerating}
              required
            >
              <option value="">Select a County</option>
              {californiaCounties.map((county) => (
                <option key={county} value={county}>
                  {county} County
                </option>
              ))}
            </select>
            {selectedCounty && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-700 text-sm font-medium">
                  ✓ Filing in {selectedCounty} County Superior Court
                </span>
              </div>
            )}
          </div>

          {/* Plaintiff Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Plaintiff Information *
              </label>
              <span className="text-xs text-gray-500">
                {plaintiffs.length}/10 plaintiffs
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Enter the name(s) of the plaintiff(s) in this case. At least one plaintiff is required.
            </p>
            
            <div className="space-y-3">
              {plaintiffs.map((plaintiff, index) => (
                <div key={plaintiff.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Plaintiff {index + 1}
                      </span>
                    </div>
                    {plaintiffs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlaintiff(plaintiff.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        disabled={isGenerating}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Plaintiff Name
                    </label>
                    <input
                      type="text"
                      value={plaintiff.name}
                      onChange={(e) => updatePlaintiff(plaintiff.id, e.target.value)}
                      placeholder="Full Legal Name"
                      className="input-field text-sm"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              ))}
              
              {plaintiffs.length < 10 && (
                <button
                  type="button"
                  onClick={addPlaintiff}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors"
                  disabled={isGenerating}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Plaintiff</span>
                </button>
              )}
            </div>
          </div>

          {/* Defendant Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Defendant Information *
              </label>
              <span className="text-xs text-gray-500">
                {defendants.length}/10 defendants
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Enter the name(s) of the defendant(s) in this case. At least one defendant is required.
            </p>
            
            <div className="space-y-3">
              {defendants.map((defendant, index) => (
                <div key={defendant.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Defendant {index + 1}
                      </span>
                    </div>
                    {defendants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDefendant(defendant.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        disabled={isGenerating}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Defendant Name
                    </label>
                    <input
                      type="text"
                      value={defendant.name}
                      onChange={(e) => updateDefendant(defendant.id, e.target.value)}
                      placeholder="Full Legal Name"
                      className="input-field text-sm"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              ))}
              
              {defendants.length < 10 && (
                <button
                  type="button"
                  onClick={addDefendant}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors"
                  disabled={isGenerating}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Defendant</span>
                </button>
              )}
            </div>
          </div>

          {/* Case Number Section */}
          <div>
            <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Case Number
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Enter the case number if already assigned by the court (optional).
            </p>
            <input
              id="caseNumber"
              type="text"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g., 24STCV12345"
              className="input-field"
              disabled={isGenerating}
            />
            {caseNumber.trim() && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-700 text-sm font-medium">
                  ℹ️ Case Number: {caseNumber.trim()}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Case Summary *
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Provide a detailed factual summary of the incident, including dates, locations, parties involved, 
              and the nature of damages or injuries.
            </p>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value)
                setError('')
              }}
              placeholder="Enter your case summary here..."
              className="textarea-field"
              disabled={isGenerating}
              rows={8}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {summary.length} characters (minimum 50)
              </span>
              {summary.length >= 50 && (
                <span className="text-green-600 text-sm font-medium">✓ Ready to generate</span>
              )}
            </div>
          </div>

          {/* Causes of Action Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Causes of Action (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCauseSelection(!showCauseSelection)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showCauseSelection ? 'Hide' : 'Select Specific'} Causes
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              {showCauseSelection 
                ? 'Select specific causes of action to include in your complaint. If none selected, the AI will automatically determine appropriate causes based on your case summary.'
                : 'The AI will automatically determine appropriate causes of action based on your case summary, or you can select specific ones.'
              }
            </p>
            
            {showCauseSelection && (
              <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                {caciSeries.map((series) => series.causes.length > 0 && (
                  <div key={series.id} className="border border-gray-300 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        const newExpanded = new Set(expandedSeries)
                        if (newExpanded.has(series.id)) {
                          newExpanded.delete(series.id)
                        } else {
                          newExpanded.add(series.id)
                        }
                        setExpandedSeries(newExpanded)
                      }}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-md font-bold text-gray-900">
                        SERIES {series.seriesNumber !== 0 ? series.seriesNumber : ''} {series.title}
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({series.causes.length} causes)
                        </span>
                      </h3>
                      {expandedSeries.has(series.id) ? (
                        <ChevronUp className="w-5 h-5 text-primary-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                    
                    {expandedSeries.has(series.id) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t border-gray-200">
                        {series.causes.map((cause) => (
                  <div key={cause.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={cause.id}
                      checked={selectedCausesOfAction.includes(cause.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCausesOfAction([...selectedCausesOfAction, cause.id])
                        } else {
                          setSelectedCausesOfAction(selectedCausesOfAction.filter(id => id !== cause.id))
                        }
                      }}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isGenerating}
                    />
                    <div className="flex-1">
                      <label htmlFor={cause.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {cause.name}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">{cause.description}</p>
                      <p className="text-xs text-primary-600 font-medium mt-1">{cause.caciSeries}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Elements: {cause.elements.join(', ')}
                      </div>
                    </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedCausesOfAction.length > 0 && (
                  <div className="col-span-full mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <h4 className="text-sm font-medium text-primary-900 mb-2">
                      Selected Causes ({selectedCausesOfAction.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCausesOfAction.map((id) => {
                        const cause = availableCausesOfAction.find(c => c.id === id)
                        return cause ? (
                          <span key={id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {cause.name}
                            <button
                              type="button"
                              onClick={() => setSelectedCausesOfAction(selectedCausesOfAction.filter(cId => cId !== id))}
                              className="ml-1 text-primary-600 hover:text-primary-800"
                              disabled={isGenerating}
                            >
                              ×
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rate Limit Helper */}
          {rateLimitCooldown === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips to Avoid Rate Limits</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Wait 2+ minutes between requests</li>
                <li>• Use the example summaries to test (they're cached)</li>
                <li>• Similar case summaries will return cached results instantly</li>
                <li>• Consider upgrading your OpenAI API plan for higher limits</li>
              </ul>
            </div>
          )}

          {error && (
            <div className={`border rounded-lg p-4 ${
              error.includes('quota') || error.includes('billing')
                ? 'bg-red-50 border-red-200'
                : error.includes('Rate limit exceeded') 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className={`w-5 h-5 ${
                  error.includes('quota') || error.includes('billing')
                    ? 'text-red-600'
                    : error.includes('Rate limit exceeded') 
                      ? 'text-amber-600' 
                      : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  error.includes('quota') || error.includes('billing')
                    ? 'text-red-800'
                    : error.includes('Rate limit exceeded') 
                      ? 'text-amber-800' 
                      : 'text-red-800'
                }`}>
                  {error.includes('quota') || error.includes('billing') 
                    ? 'OpenAI Quota Exceeded' 
                    : error.includes('Rate limit exceeded') 
                      ? 'Rate Limit Reached' 
                      : 'Error'}
                </span>
              </div>
              
              {/* Quota exceeded - show structured message */}
              {(error.includes('quota') || error.includes('billing')) && (
                <div className="mt-3 space-y-3">
                  <p className="text-red-700 text-sm">
                    Your OpenAI API usage has exceeded the current billing limits.
                  </p>
                  
                  <div className="bg-red-100 rounded-lg p-3">
                    <h4 className="font-medium text-red-900 mb-2">Solutions:</h4>                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Check your usage limits</a></li>
                      <li>• <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Add payment method or increase limits</a></li>
                      <li>• Wait for your quota to reset (if on free tier)</li>
                      <li>• <button 
                           onClick={generateManualTemplate}
                           className="underline hover:text-red-900 text-left"
                         >
                           Generate manual template instead
                         </button></li>
                    </ul>
                    <p className="text-red-700 text-xs mt-2">
                      📖 For detailed setup instructions, see <code className="bg-red-200 px-1 rounded">OPENAI_SETUP.md</code> in your project folder.
                    </p>
                  </div>
                  
                  <details className="text-sm">
                    <summary className="text-red-700 cursor-pointer hover:text-red-800">Show manual complaint template</summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                      <pre>{`[Attorney Name] (California State Bar No. [Number])
[Email]
[Law Firm Name]
[Address]
[City, State ZIP]
Telephone: [Phone]

Attorney for [Party]

SUPERIOR COURT OF CALIFORNIA
COUNTY OF [COUNTY NAME]

[Plaintiff Name],
    Plaintiff,
v.
[Defendant Name],
    Defendant.

No. [Case Number]

COMPLAINT

PARTIES

I. Jurisdiction
[Your allegations here...]`}</pre>
                    </div>
                  </details>
                </div>
              )}
              
              {/* Rate limit error */}
              {!error.includes('quota') && !error.includes('billing') && (
                <>
                  <p className={`mt-1 ${
                    error.includes('Rate limit exceeded') 
                      ? 'text-amber-700' 
                      : 'text-red-700'
                  }`}>
                    {error}
                  </p>
                  {error.includes('Rate limit exceeded') && rateLimitCooldown > 0 && (
                    <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                      <p className="text-amber-800 text-sm font-medium">
                        ⏱️ Automatic retry in {rateLimitCooldown} seconds
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        To avoid rate limits in the future, consider upgrading your OpenAI API plan or wait longer between requests.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isGenerating || !summary.trim() || summary.length < 50 || !selectedCounty || plaintiffs.filter(p => p.name.trim()).length === 0 || defendants.filter(d => d.name.trim()).length === 0 || rateLimitCooldown > 0}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Complaint...</span>
                </>
              ) : rateLimitCooldown > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Please wait {rateLimitCooldown}s (Rate Limited)</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generate AI-Powered Complaint</span>
                </>
              )}
            </button>
            
            <div className="text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>
            
            <button
              type="button"
              onClick={generateManualTemplate}
              disabled={isGenerating}
              className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileEdit className="w-5 h-5" />
              <span>Use Manual Template</span>
            </button>
          </div>
        </form>

        {/* Example Summaries */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Example Case Summaries</h3>
          <div className="space-y-4">
            {exampleSummaries.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm mb-3">{example}</p>
                <button
                  type="button"
                  onClick={() => setSummary(example)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  disabled={isGenerating}
                >
                  Use this example
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
