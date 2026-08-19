import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import FunnelChart from "@/components/analytics/FunnelChart";
import WorkflowHealth from "@/components/analytics/WorkflowHealth";
import HiringTypeChart from "@/components/analytics/HiringTypeChart";
import TeamLeaderboard from "@/components/analytics/TeamLeaderboard";

import {
  analyticsStats,
  funnelData,
  workflowSignals,
  hiringTypeMix,
  teamPerformance,
} from "@/data/analytics";

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Monitor hiring performance, workflow health and recruitment insights.
        </p>

      </div>

      {/* Statistics */}

      <AnalyticsStats
        stats={analyticsStats}
      />

      {/* Row 1 */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <FunnelChart
          data={funnelData}
        />

        <WorkflowHealth
          workflows={workflowSignals}
        />

      </div>

            {/* Row 2 */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <HiringTypeChart
          data={hiringTypeMix}
        />

        <TeamLeaderboard
          team={teamPerformance}
        />

      </div>

    </div>
  );
};

export default AnalyticsPage;