export interface Profile {
  id: number;

  name: string;

  designation: string;

  department: string;

  employeeId: string;

  email: string;

  phone: string;

  dob: string;

  gender: "Male" | "Female" | "Other";

  address: string;

  city: string;

  state: string;

  country: string;

  manager: string;

  joiningDate: string;

  workLocation: string;

  employmentType:
    | "Full Time"
    | "Part Time"
    | "Contract"
    | "Intern";

  profileImage: string;

  online: boolean;
}

export interface ProfileStat {
  id: number;

  title: string;

  value: number;

  icon:
    | "briefcase"
    | "users"
    | "calendar"
    | "award";

  color:
    | "purple"
    | "green"
    | "blue"
    | "orange";
}

export interface Skill {
  id: number;

  name: string;
}

export interface Activity {
  id: number;

  title: string;

  description: string;

  time: string;

  type:
    | "profile"
    | "photo"
    | "skill"
    | "professional";
}

export interface EditProfileForm {
  name: string;

  designation: string;

  department: string;

  email: string;

  phone: string;

  dob: string;

  gender: "Male" | "Female" | "Other";

  address: string;

  city: string;

  state: string;

  country: string;

  manager: string;

  joiningDate: string;

  workLocation: string;

  employmentType:
    | "Full Time"
    | "Part Time"
    | "Contract"
    | "Intern";
}

export interface UploadPhotoForm {
  file: File | null;

  preview: string;
}