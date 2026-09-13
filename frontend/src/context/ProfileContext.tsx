import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import {
  profile as initialProfile,
  skills as initialSkills,
} from "@/data/profile";

import type {
  Activity,
  Profile,
  Skill,
} from "@/types/profile";

import { useAuthStore } from "@/store/auth-store";
import { getOwnProfileRequest, updateOwnProfileRequest } from "@/services/auth.service";
import { api } from "@/services/api";

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs)) return "Recently";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

interface ProfileContextType {
  profile: Profile;
  skills: Skill[];
  activities: Activity[];
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  updateProfile: (data: Partial<Profile>) => void;
  updatePhoto: (photo: string) => void;
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  addSkill: (skill: Skill) => void;
  removeSkill: (id: number) => void;
  addActivity: (activity: Activity) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const authUser = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("hiregen_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return authUser
      ? {
          ...initialProfile,
          name: authUser.fullName,
          email: authUser.email,
          designation: authUser.role.replace("_", " "),
        }
      : initialProfile;
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem("hiregen_skills");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialSkills;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("hiregen_activities");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(
            (a) =>
              !["Profile Updated", "Photo Uploaded", "Skills Updated"].includes(a.title) ||
              !["10 mins ago", "Yesterday", "2 days ago", "5 days ago", "1 week ago"].includes(a.time)
          );
          if (clean.length > 0) return clean;
        }
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Fetch real profile from PostgreSQL database on load
  useEffect(() => {
    if (authUser) {
      setProfile((prev) => ({
        ...prev,
        name: authUser.fullName || prev.name,
        email: authUser.email || prev.email,
        designation: authUser.role ? authUser.role.replace("_", " ") : prev.designation,
      }));
      getOwnProfileRequest()
        .then((dbProfile) => {
          if (dbProfile) {
            setProfile((prev) => ({
              ...prev,
              name: dbProfile.full_name || prev.name,
              email: dbProfile.email || prev.email,
              designation: dbProfile.designation || prev.designation,
              department: dbProfile.department || prev.department,
              employeeId: dbProfile.employee_id || prev.employeeId,
              phone: dbProfile.phone || prev.phone,
              dob: dbProfile.dob || prev.dob,
              gender: (dbProfile.gender as "Male" | "Female" | "Other") || prev.gender,
              address: dbProfile.address || prev.address,
              city: dbProfile.city || prev.city,
              state: dbProfile.state || prev.state,
              country: dbProfile.country || prev.country,
              manager: dbProfile.manager || prev.manager,
              joiningDate: dbProfile.joining_date || prev.joiningDate,
              workLocation: dbProfile.work_location || prev.workLocation,
              employmentType: (dbProfile.employment_type as any) || prev.employmentType,
              profileImage: dbProfile.profile_image || prev.profileImage,
            }));
            if (Array.isArray(dbProfile.skills) && dbProfile.skills.length > 0) {
              setSkills(dbProfile.skills);
            }
            if (Array.isArray(dbProfile.activities) && dbProfile.activities.length > 0) {
              setActivities(dbProfile.activities);
            }
          }
        })
        .catch(() => {});

      // Fetch live user activities from real PostgreSQL analytics stream
      api
        .get<{ success: boolean; data: Array<{ id: string; type: string; description: string; company: string; timestamp: string }> }>("/analytics/activity")
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const liveActivities: Activity[] = res.data.data.map((item, idx) => ({
              id: idx + 1,
              title:
                item.type === "lead"
                  ? "New Lead Detected"
                  : item.type === "email"
                  ? "Outreach Email Sent"
                  : item.type === "meeting"
                  ? "Meeting Scheduled"
                  : "Pipeline Activity",
              description: item.description,
              time: formatRelativeTime(item.timestamp),
              type:
                item.type === "lead"
                  ? "professional"
                  : item.type === "email"
                  ? "profile"
                  : item.type === "meeting"
                  ? "skill"
                  : "professional",
            }));
            setActivities((prev) => (prev.length > 0 ? prev : liveActivities));
          }
        })
        .catch(() => {});
    } else {
      setProfile(initialProfile);
      setSkills(initialSkills);
      setActivities([]);
      localStorage.removeItem("hiregen_profile");
      localStorage.removeItem("hiregen_skills");
      localStorage.removeItem("hiregen_activities");
    }
  }, [authUser]);

  // Persist to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem("hiregen_profile", JSON.stringify(profile));
    } catch (e) {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem("hiregen_skills", JSON.stringify(skills));
    } catch (e) {
      // ignore
    }
  }, [skills]);

  useEffect(() => {
    try {
      localStorage.setItem("hiregen_activities", JSON.stringify(activities));
    } catch (e) {
      // ignore
    }
  }, [activities]);

  const updateProfile = (data: Partial<Profile>) => {
    setProfile((previous) => {
      const updated = { ...previous, ...data };
      try {
        localStorage.setItem("hiregen_profile", JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    if (data.name && data.name.trim()) {
      useAuthStore.getState().updateUser({ fullName: data.name.trim() });
    }

    // Persist all updated fields to PostgreSQL backend
    updateOwnProfileRequest({
      fullName: data.name,
      phone: data.phone,
      designation: data.designation,
      department: data.department,
      employeeId: data.employeeId,
      dob: data.dob,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      manager: data.manager,
      joiningDate: data.joiningDate,
      workLocation: data.workLocation,
      employmentType: data.employmentType,
      profileImage: data.profileImage,
    }).catch(() => {});

    addActivity({
      id: Date.now(),
      title: "Profile Updated",
      description: "Updated personal and professional information.",
      time: "Just now",
      type: "profile",
    });
  };

  const updatePhoto = (photo: string) => {
    setProfile((previous) => {
      const updated = { ...previous, profileImage: photo };
      try {
        localStorage.setItem("hiregen_profile", JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    updateOwnProfileRequest({ profileImage: photo }).catch(() => {});

    addActivity({
      id: Date.now(),
      title: "Photo Uploaded",
      description: "Changed profile picture.",
      time: "Just now",
      type: "photo",
    });
  };

  const addSkill = (skill: Skill) => {
    setSkills((previous) => {
      const updated = [...previous, skill];
      updateOwnProfileRequest({ skills: updated }).catch(() => {});
      return updated;
    });

    addActivity({
      id: Date.now(),
      title: "Skills Updated",
      description: `Added skill: ${skill.name}`,
      time: "Just now",
      type: "skill",
    });
  };

  const removeSkill = (id: number) => {
    const targetSkill = skills.find((s) => s.id === id);
    setSkills((previous) => {
      const updated = previous.filter((skill) => skill.id !== id);
      updateOwnProfileRequest({ skills: updated }).catch(() => {});
      return updated;
    });

    addActivity({
      id: Date.now(),
      title: "Skills Updated",
      description: `Removed skill: ${targetSkill?.name || "Skill"}`,
      time: "Just now",
      type: "skill",
    });
  };

  const addActivity = (activity: Activity) => {
    setActivities((previous) => {
      const updated = [activity, ...previous];
      updateOwnProfileRequest({ activities: updated }).catch(() => {});
      return updated;
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        skills,
        activities,
        setProfile,
        updateProfile,
        updatePhoto,
        setSkills,
        addSkill,
        removeSkill,
        addActivity,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider.");
  }
  return context;
};

export default ProfileContext;