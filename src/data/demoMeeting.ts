import { MeetingAnalysis } from '../types/decisionBrief';

export const DEMO_TRANSCRIPT = `Marcus Vance: Right, thanks everyone for joining promptly. We have 20 minutes to align on Project Meridian before the executive steering committee on Thursday. On the call today we have Elena, Julian, Priya, Tom, Sophie, and myself. Let's get straight into it. Elena, where are we tracking against the 14th November client launch deadline?

Elena Rostova: Thanks Marcus. Core deliverables for Phase 1 are green, but we are entering a critical bottleneck for Phase 2. I have completed the preliminary audit, and I will personally finish the comprehensive Phase 2 deliverables audit by Friday at 5:00 PM so we have a clean ledger.

Marcus Vance: Good. Friday 5:00 PM for Elena's Phase 2 audit is confirmed. Tom, what is the situation with CloudCore?

Tom Gallagher: Marcus, unfortunately CloudCore dropped a bombshell yesterday afternoon. Their engineering team is reporting a 3-week delivery delay on the UK sovereign telemetry connector. Because of their internal restructuring, they cannot hand over the signed build until the first week of November.

Sophie Laurent: That is a severe operational risk, Tom. If CloudCore's gateway is delayed by three weeks, our automated data pipelines cannot pass penetration testing. Worse still, if they activate their standard US East failover servers in the interim, we have an unresolved European data sovereignty and GDPR compliance risk with the client's financial data. That is currently completely unresolved.

Priya Sharma: Sophie is right. If customer financial records route outside the UK/EU boundary even for diagnostic logging, Corvane faces regulatory penalties under Schedule 4 of the client agreement.

Marcus Vance: Sophie, what is our technical fallback?

Sophie Laurent: I can build an architectural contingency bypass using our internal on-prem mock service. It won't have live telemetrics, but it will isolate the pipeline safely. I will draft the architectural contingency bypass specification by Wednesday afternoon at 3:00 PM.

Marcus Vance: Agreed. Sophie to deliver the contingency spec by Wednesday 3:00 PM. Tom, what are we doing commercially with CloudCore?

Tom Gallagher: I have an urgent meeting scheduled with CloudCore's VP of Customer Success for Tuesday morning at 9:00 AM. I will push for priority deployment or enforce our contractual SLA penalty clause. Also, Marcus, we probably need to get their legal contract amendment signed sometime mid next month before the fiscal review.

Marcus Vance: Okay, Tuesday morning meeting with CloudCore's VP is confirmed for Tom. Make sure legal is in the loop. The contract amendment deadline of "mid next month" is too vague though, we need to firm that up once we see the outcome on Tuesday. Now Julian, marketing update.

Julian Blake: Thanks Marcus. Given the launch window, our current organic reach is insufficient. I am formally requesting a £12,000 marketing budget increase to run targeted LinkedIn campaigns and sponsor the London Financial Tech Summit showcase. We need this approved today so my team can book the media slots before Friday.

Priya Sharma: Julian, absolutely not. Our project margin is already compressed to 14.2% after the CloudCore delay. We simply do not have unallocated contingency to absorb an extra £12,000 discretionary spend right now without verified conversion data.

Julian Blake: But Priya, if we don't build market momentum, the Meridian adoption numbers will fall flat on day one! We can't let technical conservatism kill the commercial launch.

Sophie Laurent: Julian, launching a public campaign while our telemetry security architecture is unverified will backfire catastrophically if clients experience onboarding friction.

Marcus Vance: Let me step in here. I hear both sides, but we cannot approve the £12,000 marketing budget today. Julian, you must put together a 1-page business case demonstrating direct pipeline attribution and expected ROI by Thursday morning. We will review it then, but absolutely no spend is authorised right now.

Julian Blake: Understood, I will prepare the 1-pager, though I still believe delaying the media buy is a mistake.

Marcus Vance: Understood. Now, another urgent item: the client SLA documentation and compliance pack needs to be completely updated before the external audit next Tuesday. Who is owning that? Someone needs to take this and ensure the audit pack is fully refreshed.

Priya Sharma: Finance can't take it, we are closing quarterly books.

Tom Gallagher: My team is flat out managing the vendor dispute.

Marcus Vance: Look, we cannot leave it floating, but we've run out of time today. Can someone please pick that up offline? Let's ensure it doesn't fall through the cracks. Also, regarding the £8,000 proposal to hire an external QA contractor team that Elena floated earlier this week, let's keep that unresolved until we see Sophie's mock service bypass on Wednesday. Thanks all, let's execute.`;

export const PRECOMPUTED_DEMO_ANALYSIS: MeetingAnalysis = {
  id: 'mtg-corvane-meridian-001',
  title: 'Project Meridian — Operational Alignment & Risk Review',
  date: '2026-10-14',
  participants: [
    'Marcus Vance (Client Delivery Director)',
    'Elena Rostova (Senior Consultant)',
    'Julian Blake (Marketing Lead)',
    'Priya Sharma (Finance & Operations Director)',
    'Tom Gallagher (Senior Supplier Manager)',
    'Sophie Laurent (Lead Solutions Architect)',
  ],
  transcript: DEMO_TRANSCRIPT,
  executiveSummary:
    'Project Meridian remains targeted for 14 November launch, but faces a critical 3-week CloudCore supplier delay and unresolved European data residency risk. The proposed £12,000 marketing budget increase was explicitly rejected pending a business case on Thursday. Key technical contingency bypass is assigned to Sophie for Wednesday. Crucially, the external audit compliance pack remains unassigned, posing an immediate governance risk for next week.',
  decisions: [
    {
      id: 'dec-1',
      statement: 'Elena to deliver Phase 2 deliverables audit by Friday 5:00 PM.',
      status: 'CONFIRMED',
      peopleInvolved: ['Marcus Vance', 'Elena Rostova'],
      transcriptQuote: 'Marcus Vance: Good. Friday 5:00 PM for Elena\'s Phase 2 audit is confirmed.',
      uncertaintyExplanation: 'Unambiguous verbal agreement from Project Director with specific deadline.',
      managerApprovalRequired: false,
      managerReviewed: true,
      managerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'dec-2',
      statement: 'Sophie Laurent to draft architectural contingency bypass specification by Wednesday 3:00 PM.',
      status: 'CONFIRMED',
      peopleInvolved: ['Marcus Vance', 'Sophie Laurent'],
      transcriptQuote: 'Marcus Vance: Agreed. Sophie to deliver the contingency spec by Wednesday 3:00 PM.',
      uncertaintyExplanation: 'Clear confirmation and acceptance by meeting chair.',
      managerApprovalRequired: false,
      managerReviewed: true,
      managerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'dec-3',
      statement: 'Proposed £12,000 marketing budget increase for LinkedIn campaign and London Tech Summit.',
      status: 'PROPOSED',
      peopleInvolved: ['Julian Blake', 'Priya Sharma', 'Marcus Vance'],
      transcriptQuote: 'Marcus Vance: Let me step in here. I hear both sides, but we cannot approve the £12,000 marketing budget today... absolutely no spend is authorised right now.',
      uncertaintyExplanation: 'Explicitly denied by Marcus Vance. Julian must supply a 1-page ROI business case by Thursday. High risk of automation bias if a generic tool labels this as approved.',
      managerApprovalRequired: true,
      managerReviewed: false,
      managerConfirmed: false,
      evidenceVerified: true,
    },
    {
      id: 'dec-4',
      statement: 'Engaging external QA contractor team (£8,000) for penetration testing support.',
      status: 'UNRESOLVED',
      peopleInvolved: ['Elena Rostova', 'Marcus Vance', 'Sophie Laurent'],
      transcriptQuote: 'Marcus Vance: Also, regarding the £8,000 proposal to hire an external QA contractor team that Elena floated earlier this week, let\'s keep that unresolved until we see Sophie\'s mock service bypass on Wednesday.',
      uncertaintyExplanation: 'Tabled until Sophie\'s mock service spec is reviewed on Wednesday.',
      managerApprovalRequired: true,
      managerReviewed: false,
      managerConfirmed: false,
      evidenceVerified: true,
    },
  ],
  actions: [
    {
      id: 'act-1',
      task: 'Complete comprehensive Phase 2 deliverables audit for Project Meridian ledger.',
      owner: 'Elena Rostova',
      ownerStatus: 'CONFIRMED',
      deadline: 'Friday 17:00',
      deadlineStatus: 'CONFIRMED',
      priority: 'HIGH',
      status: 'PENDING',
      transcriptQuote: 'Elena Rostova: I have completed the preliminary audit, and I will personally finish the comprehensive Phase 2 deliverables audit by Friday at 5:00 PM so we have a clean ledger.',
      needsClarification: false,
      isManagerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'act-2',
      task: 'Deliver architectural contingency bypass specification for on-prem mock service.',
      owner: 'Sophie Laurent',
      ownerStatus: 'CONFIRMED',
      deadline: 'Wednesday 15:00',
      deadlineStatus: 'CONFIRMED',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      transcriptQuote: 'Sophie Laurent: I will draft the architectural contingency bypass specification by Wednesday afternoon at 3:00 PM.',
      needsClarification: false,
      isManagerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'act-3',
      task: 'Urgent supplier negotiation meeting with CloudCore VP of Customer Success to enforce SLA penalties or expedited delivery.',
      owner: 'Tom Gallagher',
      ownerStatus: 'CONFIRMED',
      deadline: 'Tuesday 09:00',
      deadlineStatus: 'CONFIRMED',
      priority: 'HIGH',
      status: 'PENDING',
      transcriptQuote: 'Tom Gallagher: I have an urgent meeting scheduled with CloudCore\'s VP of Customer Success for Tuesday morning at 9:00 AM.',
      needsClarification: false,
      isManagerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'act-4',
      task: 'Draft 1-page business case with pipeline attribution and ROI metrics for £12k marketing request.',
      owner: 'Julian Blake',
      ownerStatus: 'CONFIRMED',
      deadline: 'Thursday morning',
      deadlineStatus: 'CONFIRMED',
      priority: 'MEDIUM',
      status: 'PENDING',
      transcriptQuote: 'Marcus Vance: Julian, you must put together a 1-page business case demonstrating direct pipeline attribution and expected ROI by Thursday morning.',
      needsClarification: false,
      isManagerConfirmed: true,
      evidenceVerified: true,
    },
    {
      id: 'act-5',
      task: 'Update client SLA documentation and compliance pack before external audit.',
      owner: '',
      ownerStatus: 'MISSING',
      deadline: 'Before next Tuesday',
      deadlineStatus: 'CONFIRMED',
      priority: 'HIGH',
      status: 'PENDING',
      transcriptQuote: 'Marcus Vance: ...the client SLA documentation and compliance pack needs to be completely updated before the external audit next Tuesday. Who is owning that? Someone needs to take this and ensure the audit pack is fully refreshed.',
      needsClarification: true,
      clarificationReason: 'CRITICAL ACCOUNTABILITY GAP: Task was raised urgently by Marcus, but both Finance (Priya) and Supplier Ops (Tom) declined. Meeting ended with no owner assigned.',
      isManagerConfirmed: false,
      evidenceVerified: true,
    },
    {
      id: 'act-6',
      task: 'Execute CloudCore legal contract amendment revision.',
      owner: 'Tom Gallagher',
      ownerStatus: 'SUGGESTED',
      deadline: 'Sometime mid next month (ambiguous)',
      deadlineStatus: 'AMBIGUOUS',
      priority: 'LOW',
      status: 'PENDING',
      transcriptQuote: 'Tom Gallagher: Also, Marcus, we probably need to get their legal contract amendment signed sometime mid next month before the fiscal review.',
      needsClarification: true,
      clarificationReason: 'Marcus noted the deadline of "mid next month" is too vague and must be firmed up after Tuesday\'s negotiation.',
      isManagerConfirmed: false,
      evidenceVerified: true,
    },
  ],
  risks: [
    {
      id: 'risk-1',
      title: 'European Data Residency & GDPR Regulatory Violation',
      description: 'CloudCore supplier delay may trigger default failover routing of EU client financial telemetry to US East AWS servers, violating Schedule 4 client agreement terms.',
      riskType: 'OPERATIONAL',
      severity: 'HIGH',
      isAiInferred: false,
      transcriptQuote: 'Sophie Laurent: Worse still, if they activate their standard US East failover servers in the interim, we have an unresolved European data sovereignty and GDPR compliance risk with the client\'s financial data. That is currently completely unresolved.',
      mitigationSuggestion: 'Ensure Sophie\'s Wednesday mock service isolates outbound traffic and strictly prohibits US telemetry failover endpoints.',
      evidenceVerified: true,
    },
    {
      id: 'risk-2',
      title: '3-Week Supplier Delay for Telemetry Connector',
      description: 'CloudCore restructuring delays UK sovereign connector build handover until first week of November, compressing penetration testing ahead of 14 November launch.',
      riskType: 'DELAY',
      severity: 'HIGH',
      isAiInferred: false,
      transcriptQuote: 'Tom Gallagher: Their engineering team is reporting a 3-week delivery delay on the UK sovereign telemetry connector. Because of their internal restructuring, they cannot hand over the signed build until the first week of November.',
      mitigationSuggestion: 'Enforce contractual SLA delay penalties at Tuesday 9:00 AM meeting with CloudCore VP.',
      evidenceVerified: true,
    },
    {
      id: 'risk-3',
      title: 'Audit Pack Governance Vacuum (Unassigned Compliance Task)',
      description: 'External regulatory audit is scheduled for next Tuesday, but no participant accepted ownership of updating the SLA documentation and compliance pack.',
      riskType: 'MISSING_INFO',
      severity: 'HIGH',
      isAiInferred: false,
      transcriptQuote: 'Marcus Vance: Look, we cannot leave it floating, but we\'ve run out of time today. Can someone please pick that up offline? Let\'s ensure it doesn\'t fall through the cracks.',
      mitigationSuggestion: 'Manager must immediately mandate an owner (e.g. Elena Rostova or a junior consultant) before end of day.',
      evidenceVerified: true,
    },
    {
      id: 'risk-4',
      title: 'Commercial Premature Campaign Friction vs Technical Readiness',
      description: 'Marketing (Julian) advocated launching public promotion before penetration testing and architecture verification, creating risk of client onboarding failures and brand damage.',
      riskType: 'DISAGREEMENT',
      severity: 'MEDIUM',
      isAiInferred: false,
      transcriptQuote: 'Sophie Laurent: Julian, launching a public campaign while our telemetry security architecture is unverified will backfire catastrophically if clients experience onboarding friction.',
      mitigationSuggestion: 'Tie any future marketing spend strictly to Sophie\'s architectural sign-off milestone.',
      evidenceVerified: true,
    },
    {
      id: 'risk-5',
      title: 'Inferred Margin Compression Risk upon QA Contractor Engagement',
      description: 'With project margin already compressed to 14.2%, if both the £12k marketing request and £8k QA burst contractors are approved, margin will drop below Corvane\'s minimum threshold of 12%.',
      riskType: 'EVIDENCE_GAP',
      severity: 'MEDIUM',
      isAiInferred: true,
      transcriptQuote: 'Priya Sharma: Our project margin is already compressed to 14.2% after the CloudCore delay.',
      mitigationSuggestion: 'Financial impact model required before Wednesday QA review.',
      evidenceVerified: true,
    },
  ],
  openQuestions: [
    {
      id: 'q-1',
      question: 'Who will take formal ownership of refreshing the client SLA and compliance pack for next Tuesday\'s audit?',
      askedBy: 'Marcus Vance',
      whyItMatters: 'Audit failure could suspend Corvane\'s certified delivery status with the financial client.',
    },
    {
      id: 'q-2',
      question: 'Will CloudCore offer an expedited sovereign deployment or accept SLA penalty deductions during Tuesday\'s negotiation?',
      askedBy: 'Tom Gallagher',
      whyItMatters: 'Determines whether the 14 November launch date requires formal client notification and delay sign-off.',
    },
    {
      id: 'q-3',
      question: 'Can Julian demonstrate measurable pipeline conversion metrics to justify the requested £12,000 marketing allocation?',
      askedBy: 'Priya Sharma',
      whyItMatters: 'Protects the project\'s fragile 14.2% margin against speculative marketing outlay.',
    },
  ],
  analyzedAt: new Date().toISOString(),
  isPrecomputedFallback: false,
  metrics: {
    wordCount: 842,
    readingTimeOriginalMinutes: 3.5,
    readingTimeSummaryMinutes: 0.4,
    timeSavedMinutes: 3.1,
  },
};
