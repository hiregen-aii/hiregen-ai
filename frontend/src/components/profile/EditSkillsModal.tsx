import { useEffect, useState } from "react";

import {
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/context/ProfileContext";

interface EditSkillsModalProps {
  open: boolean;
  onClose: () => void;
}

const EditSkillsModal = ({
  open,
  onClose,
}: EditSkillsModalProps) => {

  const {
    skills,
    setSkills,
    addActivity,
  } = useProfile();

  const {
    addNotification,
  } = useNotifications();

  const [localSkills, setLocalSkills] =
    useState(skills);

  const [newSkill, setNewSkill] =
    useState("");

  useEffect(() => {

    if (open) {

      setLocalSkills(skills);

      setNewSkill("");

    }

  }, [open, skills]);

  const addNewSkill = () => {

    const value = newSkill.trim();

    if (!value) return;

    const exists = localSkills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        value.toLowerCase()
    );

    if (exists) {

      addNotification({
        title: "Skill Already Exists",
        message:
          `"${value}" is already in your skills.`,
        type: "edit",
      });

      return;

    }

    setLocalSkills([
      ...localSkills,
      {
        id: Date.now(),
        name: value,
      },
    ]);

    setNewSkill("");

  };

  const removeSkill = (
    id: number
  ) => {

    setLocalSkills((previous) =>
      previous.filter(
        (skill) => skill.id !== id
      )
    );

  };

  const handleSave = () => {

    setSkills(localSkills);

    addActivity({
      id: Date.now(),
      title: "Skills Updated",
      description:
        "Updated professional skills.",
      time: "Just now",
      type: "skill",
    });

    addNotification({
      title: "Skills Updated",
      message:
        "Your skills have been updated successfully.",
      type: "success",
    });

    onClose();

  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

              <Sparkles
                size={24}
                className="text-violet-600 dark:text-violet-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">

                Edit Skills

              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                Add or remove your professional skills.

              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >

            <X
              size={22}
              className="text-slate-600 dark:text-slate-300"
            />

          </button>

        </div>

        {/* Content */}

        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          <div className="flex flex-wrap gap-3">

            {localSkills.map((skill) => (

              <div
                key={skill.id}
                className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 dark:border-violet-700 dark:bg-violet-900/20"
              >

                <Sparkles
                  size={16}
                  className="text-violet-600 dark:text-violet-400"
                />

                <span className="font-medium text-slate-800 dark:text-slate-200">

                  {skill.name}

                </span>

                <button
                  onClick={() =>
                    removeSkill(skill.id)
                  }
                  className="rounded-full p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
                >

                  <Trash2
                    size={14}
                    className="text-red-500"
                  />

                </button>

              </div>

            ))}

                      </div>

          {/* Add New Skill */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">

              Add New Skill

            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={newSkill}
                onChange={(e) =>
                  setNewSkill(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewSkill();
                  }
                }}
                placeholder="Enter a skill (e.g. React, TypeScript)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-300 focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />

              <button
                type="button"
                onClick={addNewSkill}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
              >

                <Plus size={18} />

                Add

              </button>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 dark:border-slate-700 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >

            Cancel

          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
          >

            <Save size={18} />

            Save Changes

          </button>

        </div>

      </div>

    </div>

  );

};

export default EditSkillsModal;