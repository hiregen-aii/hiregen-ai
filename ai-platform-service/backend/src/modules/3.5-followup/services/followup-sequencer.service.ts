import { FollowUpDecisionReason, FollowUpJob } from '../schemas/followup-agent.schema';
import { Lead, LeadStage } from '../contracts/lead';
import { DEFAULT_MIN_DAYS_BETWEEN_FOLLOWUPS, DEFAULT_MAX_FOLLOWUP_STEPS } from '../config/followup.config';

export interface FollowUpHistory {
  total_sent: number;
  last_sent_at?: Date;
  has_replied: boolean;
  last_reply_at?: Date;
  steps_sent: number[];
}

export class FollowUpSequencerService {
  /**
   * Check if the lead is eligible for a follow-up.
   */
  isLeadEligible(lead: Lead | null, history: FollowUpHistory): { eligible: boolean; reason?: FollowUpDecisionReason } {
    if (!lead) {
      return { eligible: false, reason: 'LEAD_NOT_FOUND' };
    }

    if (history.has_replied || lead.stage === LeadStage.REPLIED) {
      return { eligible: false, reason: 'LEAD_REPLIED' };
    }

    const convertedStages = [LeadStage.WON, LeadStage.LOST, LeadStage.MEETING_BOOKED];
    if (convertedStages.includes(lead.stage)) {
      return { eligible: false, reason: 'LEAD_CONVERTED' };
    }

    return { eligible: true };
  }

  /**
   * Calculate the number of days since the last email was sent.
   */
  calculateDaysSinceSent(lastSentAt: Date | undefined, currentDate: Date = new Date()): number {
    if (!lastSentAt) {
      // If we never sent an email, technically it's been infinitely long.
      // But typically a follow-up is only for after the 1st email.
      // We return a high number to bypass timing restrictions if this is somehow called.
      return 999;
    }

    const diffTime = Math.abs(currentDate.getTime() - lastSentAt.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if enough time has passed since the last email.
   */
  isTimingSatisfied(
    daysSinceSent: number, 
    minDays: number = DEFAULT_MIN_DAYS_BETWEEN_FOLLOWUPS,
    forceGeneration: boolean = false
  ): { satisfied: boolean; reason?: FollowUpDecisionReason } {
    if (forceGeneration) {
      return { satisfied: true };
    }

    if (daysSinceSent < minDays) {
      return { satisfied: false, reason: 'TOO_SOON_SINCE_LAST_EMAIL' };
    }

    return { satisfied: true };
  }

  /**
   * Determine the next follow-up step.
   * Step 1 = initial outreach, Step 2 = first follow-up, Step 3 = second follow-up.
   */
  determineNextStep(
    currentStep: number, 
    maxSteps: number = DEFAULT_MAX_FOLLOWUP_STEPS
  ): { nextStep?: number; reason?: FollowUpDecisionReason } {
    const next = currentStep + 1;
    
    if (next > maxSteps) {
      return { reason: 'MAX_STEPS_EXCEEDED' };
    }

    return { nextStep: next };
  }

  /**
   * Main orchestration method to decide if a follow-up should be generated.
   */
  shouldGenerateFollowUp(
    job: FollowUpJob,
    lead: Lead | null,
    history: FollowUpHistory,
    currentDate: Date = new Date()
  ): {
    shouldGenerate: boolean;
    reason: FollowUpDecisionReason;
    nextStep?: number;
    daysSinceSent?: number;
  } {
    // 1 & 2 & 3 & 4: Check lead eligibility (exists, stage, replies)
    const eligibility = this.isLeadEligible(lead, history);
    if (!eligibility.eligible) {
      return {
        shouldGenerate: false,
        reason: eligibility.reason as FollowUpDecisionReason
      };
    }

    // 5 & 6: Calculate timing
    const daysSinceSent = this.calculateDaysSinceSent(history.last_sent_at, currentDate);

    // 7: Check timing
    const timing = this.isTimingSatisfied(
      daysSinceSent, 
      job.days_between_followups,
      job.force_generation
    );

    if (!timing.satisfied) {
      return {
        shouldGenerate: false,
        reason: timing.reason as FollowUpDecisionReason,
        daysSinceSent
      };
    }

    // 8 & 9: Determine next step
    const stepCalc = this.determineNextStep(job.current_step, job.max_steps);
    if (!stepCalc.nextStep) {
      return {
        shouldGenerate: false,
        reason: stepCalc.reason as FollowUpDecisionReason,
        daysSinceSent
      };
    }

    // 10: All conditions pass
    return {
      shouldGenerate: true,
      reason: 'READY_FOR_FOLLOWUP',
      nextStep: stepCalc.nextStep,
      daysSinceSent
    };
  }
}
