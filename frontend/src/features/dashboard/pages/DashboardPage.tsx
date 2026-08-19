import StatsGrid from "@/components/dashboard/StatsGrid";
import HiringSignalsChart from "@/components/dashboard/HiringSignalsChart";
import HiringFunnel from "@/components/dashboard/HiringFunnel";
import HiringType from "@/components/dashboard/HiringType";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TeamPerformance from "@/components/dashboard/TeamPerformance";
import AIInsights from "@/components/dashboard/AIInsights";

const DashboardPage = () => {
  return (
    <div className="space-y-6">

      <div>

  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">

    Dashboard

  </h1>

  <p className="mt-1 text-slate-500 dark:text-slate-400">

    Track your recruitment performance, recent activities, and key hiring metrics.

  </p>

</div>

      {/* KPI Cards */}
      <StatsGrid />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Row 1 */}

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <HiringSignalsChart />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <HiringFunnel />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <HiringType />
        </div>

        {/* Row 2 */}

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <RecentActivity />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <TeamPerformance />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <AIInsights />
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;