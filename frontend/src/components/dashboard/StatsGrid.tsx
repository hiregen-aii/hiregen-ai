import StatCard from "./StatCard";
import { stats } from "./dashboardData";

const StatsGrid = () => {
  return (
    <div className="grid gap-5 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">

      {stats.map((item) => (
        <StatCard
          key={item.title}
          {...item}
        />
      ))}

    </div>
  );
};

export default StatsGrid;