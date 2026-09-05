import {
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  WorkflowSignal,
} from "@/types/analytics";

interface WorkflowHealthProps {
  workflows: WorkflowSignal[];
}

const WorkflowHealth = ({
  workflows,
}: WorkflowHealthProps) => {

  const [liveSignals, setLiveSignals] =
    useState(workflows);

  const companies = [
    "Stripe",
    "Databricks",
    "Snowflake",
    "Figma",
    "Notion",
    "Canva",
    "Atlassian",
    "HubSpot",
    "OpenAI",
    "Microsoft",
  ];

  const roles = [
    "HRBP",
    "Senior Recruiter",
    "VP Engineering",
    "Talent Acquisition",
    "Recruitment Lead",
    "Hiring Manager",
    "Tech Recruiter",
  ];

  const failures = [
    "HR Contact Enrichment",
    "SMTP Rate Limit",
    "Email Verification",
    "Apollo Sync",
    "CRM Integration",
    "LinkedIn Scraper",
    "Outreach Queue",
  ];

  const failureReasons = [
    "Timeout calling enrichment provider",
    "SMTP rate limit exceeded",
    "API quota exceeded",
    "Webhook unavailable",
    "Connection refused",
    "Authentication expired",
  ];

  const random = (
    min: number,
    max: number
  ) =>
    Math.floor(
      Math.random() *
        (max - min + 1)
    ) + min;

      useEffect(() => {

    const interval = setInterval(() => {

      setLiveSignals((previous) => {

        const updated = [...previous];

        /* Update existing workflows */

        for (let i = 0; i < updated.length; i++) {

          const item = updated[i];

          item.health = random(88, 99);

          item.time =
            random(0, 1) === 0
              ? "Just now"
              : `${random(1, 5)} min ago`;

          if (item.status === "failed") {

            if (Math.random() > 0.6) {
              item.status = "retrying";
            }

          } else if (item.status === "retrying") {

            if (Math.random() > 0.5) {
              item.status = "healthy";
            }

          }

        }

        /* Occasionally add a new live signal */

        if (Math.random() > 0.45) {

          updated.unshift({

            id: Date.now().toString(),

            company:
              companies[
                random(
                  0,
                  companies.length - 1
                )
              ],

            role:
              roles[
                random(
                  0,
                  roles.length - 1
                )
              ],

            health: random(90, 99),

            status: "healthy",

            time: "Just now",

          });

        }

        /* Occasionally create a workflow failure */

        if (Math.random() > 0.75) {

          updated.push({

            id: `${Date.now()}-failure`,

            company:
              failures[
                random(
                  0,
                  failures.length - 1
                )
              ],

            role:
              failureReasons[
                random(
                  0,
                  failureReasons.length - 1
                )
              ],

            health: random(35, 60),

            status:
              Math.random() > 0.5
                ? "failed"
                : "retrying",

            time: `${random(1, 8)} min ago`,

          });

        }

        /* Keep list manageable */

        return updated.slice(0, 8);

      });

    }, 5000);

    return () => clearInterval(interval);

  }, []);

    const hotSignals = liveSignals.filter(
    (item) => item.status === "healthy"
  );

  const workflowFailures = liveSignals.filter(
    (item) =>
      item.status === "failed" ||
      item.status === "retrying"
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2">

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Workflow Health
            </h2>

            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              LIVE
            </span>

          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Live monitoring of recruitment workflows
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">

          <Activity
            size={22}
            className="animate-pulse text-emerald-600"
          />

        </div>

      </div>

      <div className="space-y-8">

        {/* Hot Signals */}

        <div>

          <div className="mb-4 flex items-center gap-2">

            <Zap
              size={18}
              className="text-yellow-500"
            />

            <h3 className="font-semibold text-slate-900 dark:text-white">
              Hot Signals
            </h3>

          </div>

          <div className="space-y-3">

                        {hotSignals.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No live signals detected.
              </div>

            ) : (

              hotSignals.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {item.company}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.role}
                      </p>

                      <div className="mt-3 flex items-center gap-2">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.time}
                        </span>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-900/30">

                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                          {item.health}%
                        </span>

                      </div>

                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Healthy
                      </p>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        {/* Workflow Failures */}

        <div>

          <div className="mb-4 flex items-center gap-2">

            <AlertTriangle
              size={18}
              className="text-red-500"
            />

            <h3 className="font-semibold text-slate-900 dark:text-white">
              Workflow Failures
            </h3>

          </div>

          <div className="space-y-3">

                        {workflowFailures.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No workflow failures detected.
              </div>

            ) : (

              workflowFailures.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {item.company}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.role}
                      </p>

                      <div className="mt-3 flex items-center gap-2">

                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.status === "failed"
                              ? "bg-red-500"
                              : "bg-orange-500 animate-pulse"
                          }`}
                        />

                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.time}
                        </span>

                      </div>

                    </div>

                    <div className="text-right">

                      <div
                        className={`rounded-full px-3 py-1 ${
                          item.status === "failed"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >

                        <span
                          className={`text-sm font-bold ${
                            item.status === "failed"
                              ? "text-red-600 dark:text-red-300"
                              : "text-orange-600 dark:text-orange-300"
                          }`}
                        >
                          {item.status === "failed"
                            ? "FAILED"
                            : "RETRYING"}
                        </span>

                      </div>

                      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.health}%
                      </p>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkflowHealth;