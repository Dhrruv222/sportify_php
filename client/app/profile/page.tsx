"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  Image as ImageIcon, 
  Camera, 
  User, 
  Activity, 
  Video, 
  Save, 
  ChevronDown,
  AlertCircle,
  Loader
} from "lucide-react";
import { getProfile, updateProfile, updatePhotos, getAvatarUploadUrl } from "@/lib/api";
import type { Profile, CareerHistory } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for athletic profile
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    location: "",
    height: "",
    weight: "",
    dominantFoot: "",
    bio: "",
  });

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          position: data.position || "",
          location: data.location || "",
          height: data.height ? String(data.height) : "",
          weight: data.weight ? String(data.weight) : "",
          dominantFoot: data.dominantFoot || "",
          bio: data.bio || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      
      const updateData: Partial<Profile> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        location: formData.location,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        dominantFoot: formData.dominantFoot,
        bio: formData.bio,
      };

      await updateProfile(updateData);
      setProfile((prev) => prev ? { ...prev, ...updateData } : null);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setSaving(true);
      setError(null);

      // Get upload URL from backend
      const { uploadUrl, photoUrl } = await getAvatarUploadUrl();

      // Upload file to the provided URL
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Update profile with new photo URL
      const updated = await updatePhotos({ profilePhoto: photoUrl });
      const refreshed = await getProfile();
      setProfile(refreshed);
      setSuccessMessage("Avatar updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <main className="max-w-4xl mx-auto p-6 md:p-10 flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-[#1db954] animate-spin" />
            <p className="text-white">Loading profile...</p>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        
        {/* Alert Messages */}
        {error && (
          <div className="bg-red-950 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-950 border border-green-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {/* SECTION: Cover Photo */}
        <section className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#1db954]" /> Cover Photo
            </h2>
            <button className="text-sm font-medium text-[var(--text-subdued)] hover:text-white transition">
              Change Cover
            </button>
          </div>
          <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden bg-gradient-to-r from-[#1db954] to-black mb-2 relative group cursor-pointer">
            {profile?.coverPhotoUrl ? (
              <img 
                src={profile.coverPhotoUrl} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#1db954] to-black" />
            )}
          </div>
          <p className="text-xs text-[var(--text-subdued)]">Recommended size: 1200x400px. Max 10MB.</p>
        </section>

        {/* SECTION: Profile Photo */}
        <section className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-bold flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-[var(--text-subdued)]" /> Profile Photo
          </h2>
          <div className="flex items-center gap-6">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-[#2a2a2a] object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-[#2a2a2a] bg-[#333] flex items-center justify-center">
                <Camera className="w-8 h-8 text-[var(--text-subdued)]" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-white hover:text-[#1db954] transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                  className="hidden"
                />
                {saving ? "Uploading..." : "Select New Photo"}
              </label>
              <p className="text-xs text-[var(--text-subdued)]">JPG, JPEG, PNG up to 5MB.</p>
            </div>
          </div>
        </section>

        {/* SECTION: Account Information */}
        <section className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-bold flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[#8b5cf6]" /> Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full bg-transparent border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full bg-transparent border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Email Address</label>
              <input 
                type="email" 
                value={profile?.id || ""}
                disabled
                className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-[var(--text-subdued)] opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-[var(--text-subdued)]">Email cannot be changed</p>
            </div>
          </div>
        </section>

        {/* SECTION: Athletic Profile */}
        <section className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-bold flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[#3b82f6]" /> Athletic Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Position</label>
              <input 
                type="text" 
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={saving}
                placeholder="e.g., Attacking Midfielder"
                className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Location (City, Country)</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={saving}
                placeholder="e.g., Manchester, England"
                className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Height (cm)</label>
              <input 
                type="number" 
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Weight (kg)</label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-subdued)] font-medium">Dominant Foot</label>
              <div className="relative">
                <select 
                  name="dominantFoot"
                  value={formData.dominantFoot}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white appearance-none focus:outline-none focus:border-[#1db954] disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-[var(--text-subdued)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm text-[var(--text-subdued)] font-medium">Bio</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={saving}
              rows={4}
              placeholder="Tell about yourself..."
              className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1db954] disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Info
                </>
              )}
            </button>
          </div>
        </section>

        {/* SECTION: Career History */}
        <section className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-bold flex items-center gap-2 mb-6">
            <Video className="w-5 h-5 text-[#a855f7]" /> Career History
          </h2>
          
          <div className="space-y-4">
            {profile?.careerHistories && profile.careerHistories.length > 0 ? (
              profile.careerHistories.map((career: CareerHistory) => (
                <div key={career.id} className="p-4 bg-[#222] border border-[#333] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white text-sm font-medium">{career.clubName}</h4>
                    <span className="text-xs text-[var(--text-subdued)] bg-[#333] px-2 py-1 rounded">{career.position}</span>
                  </div>
                  <p className="text-xs text-[var(--text-subdued)]">
                    {new Date(career.startDate).toLocaleDateString()} - {career.endDate ? new Date(career.endDate).toLocaleDateString() : "Present"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-subdued)]">No career history added yet</p>
            )}
          </div>
        </section>

      </main>
    </DashboardShell>
  );
}