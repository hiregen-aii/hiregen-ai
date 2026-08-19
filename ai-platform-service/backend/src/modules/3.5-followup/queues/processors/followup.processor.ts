import { Job, FollowUpJobPayload, FollowUpJobResult } from '../types';
import { FollowUpAgent } from '../../agents/followup.agent';
import { FollowUpReadRepository } from '../../repositories/followup-read.repo';

// This function acts as a factory or wrapper. 
// It requires an initialized FollowUpAgent to be passed in or resolved from a DI container.
export function createFollowUpProcessor(agent: FollowUpAgent) {
  return async function processFollowUpJob(job: Job<FollowUpJobPayload>): Promise<FollowUpJobResult> {
    try {
      const result = await agent.runFollowUpAgent(job.data);
      
      // If ready for follow up, we would likely enqueue the PersonalizationJob here.
      if (result.should_generate && result.personalization_job) {
        // TODO: INTEGRATION CONTRACT
        // enqueuePersonalizationJob(result.personalization_job);
        console.log(`Enqueuing PersonalizationJob for Lead: ${result.lead_id}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to process FollowUpJob for lead ${job.data.lead_id}`, error);
      throw error;
    }
  };
}

// A generic placeholder that assumes DI will provide the agent.
export async function processFollowUpJob(job: Job<FollowUpJobPayload>): Promise<FollowUpJobResult> {
  // In a real nest/express app, you'd resolve the agent from context
  throw new Error('Not implemented: Use createFollowUpProcessor with an injected FollowUpAgent instance.');
}
