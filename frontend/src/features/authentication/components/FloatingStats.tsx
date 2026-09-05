import { motion } from "framer-motion";
import { Building2, TrendingUp, Users } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "1,284",
    subtitle: "Hiring Signals",
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    icon: Building2,
    title: "526",
    subtitle: "Companies",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "94%",
    subtitle: "Lead Score",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const FloatingStats = () => {
  return (
    <div className="absolute right-10 top-8 z-30 flex flex-col gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.2,
              duration: 0.6,
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
            }}
            className="w-[250px] rounded-[28px] border border-white/20 bg-white/10 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,.25)]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient}`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {card.title}
                </h2>

                <p className="text-violet-100">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingStats;