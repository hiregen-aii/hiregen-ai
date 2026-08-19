import type {
  Activity,
  Profile,
  ProfileStat,
  Skill,
} from "@/types/profile";

export const profile: Profile = {
  id: 1,

  name: "Dilip",

  designation: "Senior HR Manager",

  department: "Administration",

  employeeId: "HR-1005",

  email: "dilip@hiregen.ai",

  phone: "+91 9876543210",

  dob: "1998-06-15",

  gender: "Male",

  address: "JP Nagar",

  city: "Bengaluru",

  state: "Karnataka",

  country: "India",

  manager: "Ananya Rao",

  joiningDate: "2022-04-12",

  workLocation: "Bengaluru Office",

  employmentType: "Full Time",

  profileImage: "",

  online: true,
};

export const profileStats: ProfileStat[] = [

  {
    id: 1,
    title: "Recruitments",
    value: 286,
    icon: "briefcase",
    color: "purple",
  },

  {
    id: 2,
    title: "Interviews",
    value: 142,
    icon: "users",
    color: "green",
  },

  {
    id: 3,
    title: "Campaigns",
    value: 18,
    icon: "calendar",
    color: "blue",
  },

  {
    id: 4,
    title: "Experience",
    value: 4,
    icon: "award",
    color: "orange",
  },

];

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

export const activities: Activity[] = [

  {
    id: 1,
    title: "Profile Updated",
    description: "Updated personal information.",
    time: "10 mins ago",
    type: "profile",
  },

  {
    id: 2,
    title: "Photo Uploaded",
    description: "Changed profile picture.",
    time: "Yesterday",
    type: "photo",
  },

  {
    id: 3,
    title: "Professional Details Updated",
    description: "Updated department and work location.",
    time: "2 days ago",
    type: "professional",
  },

  {
    id: 4,
    title: "Skills Updated",
    description: "Added HR Analytics skill.",
    time: "5 days ago",
    type: "skill",
  },

  {
    id: 5,
    title: "Profile Updated",
    description: "Changed contact information.",
    time: "1 week ago",
    type: "profile",
  },

];