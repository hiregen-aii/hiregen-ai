import { useState } from "react";

import ProfileHero from "@/components/profile/ProfileHero";
import ProfileStats from "@/components/profile/ProfileStats";
import PersonalInfoCard from "@/components/profile/PersonalInfoCard";
import ProfessionalInfoCard from "@/components/profile/ProfessionalInfoCard";
import SkillsCard from "@/components/profile/SkillsCard";
import RecentActivity from "@/components/profile/RecentActivity";
import EditProfileModal from "@/components/profile/EditProfileModal";
import UploadPhotoModal from "@/components/profile/UploadPhotoModal";
import EditSkillsModal from "@/components/profile/EditSkillsModal";

const ProfilePage = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your personal information, professional details, profile
            picture and skills.
          </p>
        </div>
      </div>

      {/* Profile Hero */}
      <ProfileHero
        onEdit={() => setEditModalOpen(true)}
        onUploadPhoto={() => setPhotoModalOpen(true)}
      />

      {/* Statistics */}
      <ProfileStats />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PersonalInfoCard />
        <ProfessionalInfoCard />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SkillsCard onEdit={() => setSkillsModalOpen(true)} />
        <RecentActivity />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
      />

      <EditSkillsModal
        open={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;