import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const OnboardingPage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Max size validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-base-200">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-100 rounded-xl p-6 sm:p-10 shadow-sm border border-base-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-base-content/60">Update your profile picture and information</p>
          </div>

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center gap-6 mb-10 border-b border-base-300 pb-10">
            <div className="relative group">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-200 bg-base-300"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${authUser?.fullName}`;
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary hover:bg-primary-focus
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm text-base-content/60">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>
          </div>

          {/* Read-only User Info */}
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                   type="text"
                   className="input input-bordered w-full !pl-12 bg-base-200 text-base-content/80"
                   value={authUser?.fullName}
                   readOnly
                 />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                   type="email"
                   className="input input-bordered w-full !pl-12 bg-base-200 text-base-content/80"
                   value={authUser?.email}
                   readOnly
                 />
              </div>
            </div>
          </div>
          
          {/* Account info section */}
          <div className="mt-10 pt-6 border-t border-base-300">
             <h2 className="text-lg font-medium mb-4">Account Information</h2>
             <div className="space-y-3 text-sm text-base-content/70">
                <div className="flex items-center justify-between py-2 border-b border-base-200">
                  <span>Member Since</span>
                  <span>{new Date(authUser?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-success font-medium">Active</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;