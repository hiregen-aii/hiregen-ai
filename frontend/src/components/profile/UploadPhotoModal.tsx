import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  ImagePlus,
  Save,
  Upload,
  X,
} from "lucide-react";

import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/context/ProfileContext";

interface UploadPhotoModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadPhotoModal = ({
  open,
  onClose,
}: UploadPhotoModalProps) => {

  const {
    profile,
    updatePhoto,
    addActivity,
  } = useProfile();

  const {
    addNotification,
  } = useNotifications();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  useEffect(() => {

    if (!open) return;

    setSelectedFile(null);

    setPreview(profile.profileImage);

  }, [open, profile.profileImage]);

  const handleChooseFile = () => {

    inputRef.current?.click();

  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      addNotification({
        title: "Invalid Image",
        message:
          "Please select a JPG, PNG or WEBP image.",
        type: "edit",
      });

      return;

    }

    setSelectedFile(file);

    setPreview(
      URL.createObjectURL(file)
    );

  };

  const handleSave = () => {

    if (!preview) {

      addNotification({
        title: "No Photo Selected",
        message:
          "Please choose a profile photo.",
        type: "edit",
      });

      return;

    }

    updatePhoto(preview);

    addActivity({
      id: Date.now(),
      title: "Profile Photo Updated",
      description:
        "Updated profile picture successfully.",
      time: "Just now",
      type: "photo",
    });

    addNotification({
      title: "Profile Photo Updated",
      message:
        "Your profile photo has been updated successfully.",
      type: "edit",
    });

    onClose();

  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111827]">

                {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">

              <Camera
                size={24}
                className="text-violet-600 dark:text-violet-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">

                Upload Profile Photo

              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                Choose a new profile picture from your device.

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

        <div className="flex-1 space-y-5 overflow-y-auto p-6">

          {/* Preview */}

          <div className="flex justify-center">

            <div className="relative">

              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-slate-200 bg-slate-100 shadow-lg dark:border-slate-700 dark:bg-slate-800">

                {preview ? (

                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <Camera
                    size={56}
                    className="text-slate-400"
                  />

                )}

              </div>

              <div className="absolute bottom-2 right-2 rounded-full bg-violet-600 p-2 shadow-lg">

                <Camera
                  size={18}
                  className="text-white"
                />

              </div>

            </div>

          </div>

          {/* Upload Area */}

          <div
            onClick={handleChooseFile}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-5 text-center transition-all duration-300 hover:border-violet-500 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
          >

            <ImagePlus
              size={48}
              className="mx-auto mb-4 text-violet-600 dark:text-violet-400"
            />

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">

              Click to Choose a Photo

            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

              Supported formats: JPG, JPEG, PNG and WEBP

            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleChooseFile();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
            >

              <Upload size={18} />

              Choose Photo

            </button>

          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

                    {/* Selected File */}

          {selectedFile ? (

            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">

  <p className="text-sm font-medium text-green-700 dark:text-green-300">

    ✓ Selected: {selectedFile.name}

  </p>

</div>

          ) : (

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">

                No photo selected. Choose an image from your device.

              </p>

            </div>

          )}

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
            disabled={!preview}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Save size={18} />

            Save Photo

          </button>

        </div>

      </div>

    </div>

  );

};

export default UploadPhotoModal;