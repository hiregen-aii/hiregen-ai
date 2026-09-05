import {
  BarChart3,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import type {
  FunnelStage,
} from "@/types/analytics";

interface FunnelChartProps {
  data: FunnelStage[];
}

const FunnelChart = ({
  data,
}: FunnelChartProps) => {

  const totalSignals =
    data[0]?.value ?? 0;

  const totalWon =
    data[data.length - 1]?.value ?? 0;

  const overallConversion =
    totalSignals === 0
      ? 0
      : (
          (totalWon / totalSignals) *
          100
        ).toFixed(1);

  const stageColors = [
    "#8B5CF6",
    "#2563EB",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2">

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recruitment Funnel
            </h2>

            <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">

              AI

            </span>

          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

            Live recruitment conversion pipeline

          </p>

        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">

            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500"></span>

            <span className="text-xs font-bold text-green-600">
              LIVE
            </span>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">

            <BarChart3
              size={22}
              className="text-violet-600"
            />

          </div>

        </div>

      </div>

      {/* Funnel Area */}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr]">

        {/* SVG Funnel */}

        <div className="flex items-center justify-center">

          <svg
            width="430"
            height="430"
            viewBox="0 0 430 430"
          >

            <defs>

                            {/* Background Shadow */}

              <filter
                id="cardShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="14"
                  floodColor="#000000"
                  floodOpacity="0.18"
                />
              </filter>

              {/* Glow */}

              <filter
                id="glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="5"
                  result="blur"
                />

                <feMerge>

                  <feMergeNode in="blur" />

                  <feMergeNode in="SourceGraphic" />

                </feMerge>

              </filter>

              {/* Gradient 1 */}

              <linearGradient
                id="stage1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#A855F7"
                />

                <stop
                  offset="100%"
                  stopColor="#7C3AED"
                />
              </linearGradient>

              {/* Gradient 2 */}

              <linearGradient
                id="stage2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#3B82F6"
                />

                <stop
                  offset="100%"
                  stopColor="#2563EB"
                />
              </linearGradient>

              {/* Gradient 3 */}

              <linearGradient
                id="stage3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#22D3EE"
                />

                <stop
                  offset="100%"
                  stopColor="#0891B2"
                />
              </linearGradient>

              {/* Gradient 4 */}

              <linearGradient
                id="stage4"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#34D399"
                />

                <stop
                  offset="100%"
                  stopColor="#059669"
                />
              </linearGradient>

              {/* Gradient 5 */}

              <linearGradient
                id="stage5"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#FBBF24"
                />

                <stop
                  offset="100%"
                  stopColor="#D97706"
                />
              </linearGradient>

              {/* Gradient 6 */}

              <linearGradient
                id="stage6"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#F87171"
                />

                <stop
                  offset="100%"
                  stopColor="#DC2626"
                />
              </linearGradient>

            </defs>

            {/* Funnel Body */}

                        {/* Stage 1 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  55,25
                  375,25
                  345,78
                  85,78
                "
                fill="url(#stage1)"
              />

              <polygon
                points="
                  55,25
                  375,25
                  368,18
                  62,18
                "
                fill="#C084FC"
                opacity="0.85"
              />

            </g>

            {/* Stage 2 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  85,90
                  345,90
                  318,143
                  112,143
                "
                fill="url(#stage2)"
              />

              <polygon
                points="
                  85,90
                  345,90
                  338,83
                  92,83
                "
                fill="#60A5FA"
                opacity="0.85"
              />

            </g>

            {/* Stage 3 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  112,155
                  318,155
                  292,208
                  138,208
                "
                fill="url(#stage3)"
              />

              <polygon
                points="
                  112,155
                  318,155
                  312,148
                  118,148
                "
                fill="#67E8F9"
                opacity="0.85"
              />

            </g>

                        {/* Stage 4 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  138,220
                  292,220
                  270,273
                  160,273
                "
                fill="url(#stage4)"
              />

              <polygon
                points="
                  138,220
                  292,220
                  286,213
                  144,213
                "
                fill="#6EE7B7"
                opacity="0.85"
              />

            </g>

            {/* Stage 5 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  160,285
                  270,285
                  252,338
                  178,338
                "
                fill="url(#stage5)"
              />

              <polygon
                points="
                  160,285
                  270,285
                  264,278
                  166,278
                "
                fill="#FCD34D"
                opacity="0.85"
              />

            </g>

            {/* Stage 6 */}

            <g
              filter="url(#cardShadow)"
            >

              <polygon
                points="
                  178,350
                  252,350
                  236,402
                  194,402
                "
                fill="url(#stage6)"
              />

              <polygon
                points="
                  178,350
                  252,350
                  246,343
                  184,343
                "
                fill="#FCA5A5"
                opacity="0.85"
              />

            </g>

                        {/* Values */}

            {data.map((stage, index) => {

              const y = 55 + index * 65;

              return (
                <g key={stage.stage}>

                  {/* Stage Value */}

                  <text
                    x="215"
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFFFFF"
                    fontSize="22"
                    fontWeight="700"
                    filter="url(#glow)"
                  >
                    {stage.value.toLocaleString()}
                  </text>

                  {/* Stage Name */}

                  <text
                    x="215"
                    y={y + 18}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.92)"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {stage.stage}
                  </text>

                </g>
              );
            })}

          </svg>

        </div>

        {/* Right Panel */}

        <div className="flex flex-col justify-center gap-5">

                    {data.map((stage, index) => {

            const previous =
              index === 0
                ? stage.value
                : data[index - 1].value;

            const conversion =
              index === 0
                ? 100
                : Math.round(
                    (stage.value / previous) * 100
                  );

            return (

              <div
                key={stage.stage}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <span
                      className="h-4 w-4 rounded-full ring-4 ring-white dark:ring-slate-900"
                      style={{
                        backgroundColor:
                          stageColors[index],
                      }}
                    />

                    <div>

                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {stage.stage}
                      </h4>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {stage.value.toLocaleString()} candidates
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <div className="flex items-center justify-end gap-1 text-green-600">

                      <TrendingUp
                        size={15}
                      />

                      <span className="font-bold">
                        {conversion}%
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Conversion
                    </p>

                  </div>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

                  <div
                    className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                    style={{
                      width: `${conversion}%`,
                      backgroundColor:
                        stageColors[index],
                    }}
                  />

                </div>

              </div>

            );

          })}

        </div>

      </div>

            {/* Bottom KPI Cards */}

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-all duration-300 hover:shadow-lg dark:border-violet-800 dark:bg-violet-900/20">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Signals
              </p>

              <h3 className="mt-2 text-3xl font-bold text-violet-600">
                {totalSignals.toLocaleString()}
              </h3>

            </div>

            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/40">

              <Sparkles
                size={22}
                className="text-violet-600"
              />

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 transition-all duration-300 hover:shadow-lg dark:border-blue-800 dark:bg-blue-900/20">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Qualified Leads
          </p>

          <h3 className="mt-2 text-3xl font-bold text-blue-600">
            {data[1]?.value.toLocaleString()}
          </h3>

          <p className="mt-2 text-sm font-semibold text-green-600">
            +12.8%
          </p>

        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 transition-all duration-300 hover:shadow-lg dark:border-green-800 dark:bg-green-900/20">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Meetings
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {data[4]?.value.toLocaleString()}
          </h3>

          <p className="mt-2 text-sm font-semibold text-green-600">
            +7.5%
          </p>

        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 transition-all duration-300 hover:shadow-lg dark:border-orange-800 dark:bg-orange-900/20">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Overall Conversion
          </p>

          <h3 className="mt-2 text-3xl font-bold text-orange-600">
            {overallConversion}%
          </h3>

          <p className="mt-2 text-sm font-semibold text-green-600">
            End-to-end
          </p>

        </div>

      </div>

    </div>
  );
};

export default FunnelChart;