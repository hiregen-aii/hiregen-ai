import {
  Edit,
  Sparkles,
} from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

interface SkillsCardProps {
  onEdit: () => void;
}

const SkillsCard = ({
  onEdit,
}: SkillsCardProps) => {
const { skills } = useProfile();
  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">

            Skills & Expertise

          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            Professional skills and areas of expertise.

          </p>

        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
        >

          <Edit size={18} />

          Edit Skills

        </button>

      </div>

      {/* Skills */}

      <div className="p-6">

                <div className="flex flex-wrap gap-3">

          {skills.map((skill) => (

            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-100 hover:shadow-md dark:border-violet-700 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
            >

              <Sparkles
                size={16}
                className="text-violet-600 dark:text-violet-400"
              />

              <span className="font-medium text-slate-800 dark:text-slate-200">

                {skill.name}

              </span>

            </div>

          ))}

        </div>

                {/* Summary */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Skills
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">

                {skills.length}

              </h3>

            </div>

            <div className="max-w-xl">

              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">

                These skills represent your current professional expertise
                within the HireGen AI platform. Keep your skills updated to
                accurately reflect your experience and areas of specialization.

              </p>

            </div>

          </div>

        </div>

              </div>

    </div>

  );

};

export default SkillsCard;