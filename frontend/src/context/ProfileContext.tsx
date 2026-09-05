import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import {
  activities as initialActivities,
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
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialActivities;
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
    } else {
      setProfile(initialProfile);
      setSkills(initialSkills);
      setActivities(initialActivities);
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
  };

  const addSkill = (skill: Skill) => {
    setSkills((previous) => {
      const updated = [...previous, skill];
      updateOwnProfileRequest({ skills: updated }).catch(() => {});
      return updated;
    });
  };

  const removeSkill = (id: number) => {
    setSkills((previous) => {
      const updated = previous.filter((skill) => skill.id !== id);
      updateOwnProfileRequest({ skills: updated }).catch(() => {});
      return updated;
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