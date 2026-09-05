import { FollowUpReadRepository } from "../../modules/3.5-followup/repositories/followup-read.repo";
import { Lead, LeadStage } from "../../modules/3.5-followup/contracts/lead";
import { Campaign } from "../../modules/3.5-followup/contracts/campaign";
import { CompanyResearch } from "../../modules/3.5-followup/contracts/research";
import { CompanyMemory } from "../../modules/3.5-followup/contracts/company-memory";
import { FollowUpHistory } from "../../modules/3.5-followup/services/followup-sequencer.service";

export class InMemoryFollowUpRepository implements FollowUpReadRepository {
  lead?: Lead;
  campaign?: Campaign;
  research?: CompanyResearch;
  memory?: CompanyMemory;
  history: FollowUpHistory = { total_sent: 1, has_replied: false, steps_sent: [1], last_sent_at: new Date(Date.now() - 8 * 86400000) };

  async getLead(): Promise<Lead | null> { return this.lead ?? null; }
  async getCampaign(): Promise<Campaign | null> { return this.campaign ?? null; }
  async getFollowUpHistory(): Promise<FollowUpHistory> { return this.history; }
  async getCompanyResearch(): Promise<CompanyResearch | null> { return this.research ?? null; }
  async getCompanyMemory(): Promise<CompanyMemory | null> { return this.memory ?? null; }
}

export function seedEligibleLead(repo: InMemoryFollowUpRepository, leadId: string, campaignId: string, companyId: string) {
  repo.lead = { id: leadId, stage: LeadStage.CONTACTED, company_id: companyId, hiring_type: "FULL_TIME", urgency: "HIGH", fit_score: 85 };
  repo.campaign = { id: campaignId, name: "Demo Campaign", status: "ACTIVE" };
  repo.research = { summary: "Company is hiring backend engineers.", source_urls: ["https://example.com/research"] };
  repo.memory = { lastResearchSummary: "Previous research stored.", lastResearchAt: new Date().toISOString() };
}
