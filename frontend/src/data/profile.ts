import type {
  Activity,
  Profile,
  ProfileStat,
  Skill,
} from "@/types/profile";

export const profile: Profile = {
  id: 1,
  name: "Anuj Mishra",
  designation: "Administrator",
  department: "Management",
  employeeId: "EMP-001",
  email: "admin@hiregen.ai",
  phone: "",
  dob: "",
  gender: "Male",
  address: "",
  city: "Noida",
  state: "Uttar Pradesh",
  country: "India",
  manager: "",
  joiningDate: "2026-01-01",
  workLocation: "Remote / HQ",
  employmentType: "Full Time",
  profileImage: "",
  online: true,
};

export const profileStats: ProfileStat[] = [];

export const skills: Skill[] = [

  {
    id: 1,
    name: "Recruitment",
  },

  {
    id: 2,
    name: "Leadership",
  },

  {
    id: 3,
    name: "Interviewing",
  },

  {
    id: 4,
    name: "Communication",
  },

  {
    id: 5,
    name: "HR Analytics",
  },

  {
    id: 6,
    name: "AI Hiring",
  },

  {
    id: 7,
    name: "Gen AI",
  },

  {
    id: 8,
    name: "Team Management",
  },

];

export const activities: Activity[] = [];