import {
  createContext,
  useContext,
  useState,
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

interface ProfileContextType {
  profile: Profile;

  skills: Skill[];

  activities: Activity[];

  setProfile: React.Dispatch<
    React.SetStateAction<Profile>
  >;

  updateProfile: (
    data: Partial<Profile>
  ) => void;

  updatePhoto: (
    photo: string
  ) => void;

  setSkills: React.Dispatch<
    React.SetStateAction<Skill[]>
  >;

  addSkill: (
    skill: Skill
  ) => void;

  removeSkill: (
    id: number
  ) => void;

  addActivity: (
    activity: Activity
  ) => void;
}

const ProfileContext =
  createContext<ProfileContextType | undefined>(
    undefined
  );

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({
  children,
}: ProfileProviderProps) => {

  const [profile, setProfile] =
    useState<Profile>(initialProfile);

  const [skills, setSkills] =
    useState<Skill[]>(initialSkills);

  const [activities, setActivities] =
    useState<Activity[]>(initialActivities);

  const updateProfile = (
    data: Partial<Profile>
  ) => {

    setProfile((previous) => ({
      ...previous,
      ...data,
    }));

  };

  const updatePhoto = (
    photo: string
  ) => {

    setProfile((previous) => ({
      ...previous,
      profileImage: photo,
    }));

  };

  const addSkill = (
    skill: Skill
  ) => {

    setSkills((previous) => [
      ...previous,
      skill,
    ]);

  };

  const removeSkill = (
    id: number
  ) => {

    setSkills((previous) =>
      previous.filter(
        (skill) => skill.id !== id
      )
    );

  };

  const addActivity = (
    activity: Activity
  ) => {

    setActivities((previous) => [
      activity,
      ...previous,
    ]);

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

  const context =
    useContext(ProfileContext);

  if (!context) {

    throw new Error(
      "useProfile must be used inside ProfileProvider."
    );

  }

  return context;

};

export default ProfileContext;