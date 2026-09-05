import { FollowUpJob, FollowUpDecision, FollowUpContext } from '../schemas/followup-agent.schema';
import { FollowUpSequencerService } from '../services/followup-sequencer.service';
import { FollowUpReadRepository } from '../repositories/followup-read.repo';
import { PersonalizationJob } from '../contracts/personalization-job';

export class FollowUpAgent {
  constructor(
    private readonly readRepo: FollowUpReadRepository,
    private readonly sequencerService: FollowUpSequencerService = new FollowUpSequencerService()
  ) {}

  /**
   * Main entry point to run the Follow-up Agent logic.
   */
  async runFollowUpAgent(job: FollowUpJob): Promise<FollowUpDecision> {
    // 1. Check if lead exists
    const lead = await this.readRepo.getLead(job.lead_id);
    if (!lead) {
      return {
        lead_id: job.lead_id,
        should_generate: false,
        reason: 'LEAD_NOT_FOUND',
        explanation: `Lead with ID ${job.lead_id} not found.`
      };
    }

    // 2. Get campaign
    const campaign = await this.readRepo.getCampaign(job.campaign_id);
    if (!campaign) {
      return {
        lead_id: job.lead_id,
        should_generate: false,
        reason: 'CAMPAIGN_MISSING',
        explanation: `Campaign with ID ${job.campaign_id} not found.`
      };
    }

    // 3. Load history
    const history = await this.readRepo.getFollowUpHistory(job.lead_id);
    
    // 4. Optionally load research if needed for context building, though the core logic might just pass it on.
    const companyId = lead.company_id;
    let research = null;
    let companyMemory = null;
    if (companyId) {
      research = await this.readRepo.getCompanyResearch(companyId);
      companyMemory = await this.readRepo.getCompanyMemory(companyId);
    }
    
    // Check if research is explicitly required for follow-up (optional based on rules)
    // If we wanted to enforce it:
    // if (!research) return { should_generate: false, reason: 'RESEARCH_MISSING' };

    const decisionParams = this.sequencerService.shouldGenerateFollowUp(
      job,
      lead,
      history
    );

    // Build context payload if needed for downstream (e.g. PersonalizationAgent)
    const context: FollowUpContext = {
      lead: {
        id: lead.id,
        stage: lead.stage,
        hiring_type: lead.hiring_type,
        urgency: lead.urgency,
        fit_score: lead.fit_score,
        primary_contact_id: lead.primary_contact_id,
        company_id: lead.company_id
      },
      campaign: {
        id: campaign.id
      },
      followUpHistory: {
        ...history,
        days_since_last: decisionParams.daysSinceSent || 0
      },
      timing: {
        should_generate: decisionParams.shouldGenerate,
        next_step: decisionParams.nextStep || job.current_step,
        days_since_last: decisionParams.daysSinceSent || 0,
        min_days_between: job.days_between_followups || 7, // DEFAULT fallback could be applied here
        max_steps: job.max_steps || 3
      },
      research: research ? research : undefined,
      company_memory: companyMemory ? companyMemory : undefined
    };

    if (!decisionParams.shouldGenerate) {
      return {
        lead_id: job.lead_id,
        should_generate: false,
        reason: decisionParams.reason,
        explanation: `Follow-up skipped. Reason: ${decisionParams.reason}`,
        evaluated_at: new Date()
      };
    }

    // 10. Generate PersonalizationJob
    const personalizationJob: PersonalizationJob = {
      lead_id: job.lead_id,
      campaign_id: job.campaign_id,
      step_number: decisionParams.nextStep!,
      is_follow_up: true,
      previous_steps_sent: history.total_sent,
      days_since_last_email: decisionParams.daysSinceSent
    };

    return {
      lead_id: job.lead_id,
      should_generate: true,
      reason: 'READY_FOR_FOLLOWUP',
      next_step: decisionParams.nextStep,
      personalization_job: personalizationJob,
      explanation: `Successfully evaluated lead. Follow-up step ${decisionParams.nextStep} generated.`,
      evaluated_at: new Date()
    };
  }
}
