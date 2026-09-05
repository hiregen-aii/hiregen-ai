import { Lead } from '../contracts/lead';
import { Campaign } from '../contracts/campaign';
import { CompanyResearch } from '../contracts/research';
import { CompanyMemory } from '../contracts/company-memory';
import { FollowUpHistory } from '../services/followup-sequencer.service';

// TODO: INTEGRATION CONTRACT
// This interface defines the expected contract for reading data required by the FollowUpAgent.
// It should be implemented by an actual repository that connects to the database (e.g. Prisma).

export interface FollowUpReadRepository {
  /**
   * Retrieve a Lead by ID.
   */
  getLead(leadId: string): Promise<Lead | null>;

  /**
   * Retrieve a Campaign by ID.
   */
  getCampaign(campaignId: string): Promise<Campaign | null>;

  /**
   * Retrieve the FollowUpHistory for a specific Lead.
   * This includes total emails sent, replies, and dates.
   */
  getFollowUpHistory(leadId: string): Promise<FollowUpHistory>;

  /**
   * Retrieve the CompanyResearch for a specific company.
   */
  getCompanyResearch(companyId: string): Promise<CompanyResearch | null>;

  /**
   * Retrieve the CompanyMemory for a specific company.
   */
  getCompanyMemory(companyId: string): Promise<CompanyMemory | null>;
}
