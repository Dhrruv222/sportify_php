/* ──────────────────────────────────────────────────
   Sportify – centralized API utility
   All functions normalize backend response shapes to
   the typed interfaces defined in @/types.
   ────────────────────────────────────────────────── */

import type {
  Conversation,
  FeedPost,
  FitpassQr,
  PaginatedResponse,
  Profile,
  CareerHistory,
  Achievement,
} from "@/types";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local before building."
  );
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message ?? body?.error ?? `API error ${res.status}: ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

/* ── getProfile ────────────────────────────────────
   Backend: { status, data: { user: {...}, profile: {...} } }
   Returns: flat Profile object
   ────────────────────────────────────────────────── */
interface ProfileRaw {
  status: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      profilePhoto: string | null;
      coverPhoto: string | null;
    };
    profile: Partial<Profile> | null;
  };
}

export async function getProfile(): Promise<Profile> {
  const raw = await apiFetch<ProfileRaw>("/api/v1/profile");
  const { user, profile } = raw.data;
  return {
    id: user.id,
    userId: user.id,
    role: user.role,
    avatarUrl: user.profilePhoto ?? null,
    coverPhotoUrl: user.coverPhoto ?? null,
    firstName: "",
    lastName: "",
    position: null,
    location: null,
    dominantFoot: null,
    height: null,
    weight: null,
    playingStyle: null,
    skills: null,
    bio: null,
    createdAt: "",
    updatedAt: "",
    careerHistories: [],
    achievements: [],
    // profile fields overwrite defaults (firstName, lastName, etc.)
    ...profile,
  } as Profile;
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

export async function registerUser(payload: {
  email: string;
  password: string;
  gdprConsent: boolean;
  role?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ── getSocialFeed ─────────────────────────────────
   Backend: { status, data: { videos: FeedPost[], pagination: {...} } }
   Returns: PaginatedResponse<FeedPost> with guaranteed array
   ────────────────────────────────────────────────── */
interface FeedRaw {
  status: string;
  data: {
    videos: FeedPost[];
    pagination: { page: number; limit: number; total: number };
  };
}

export async function getSocialFeed(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<FeedPost>> {
  const raw = await apiFetch<FeedRaw>(
    `/api/v1/social/feed?page=${page}&limit=${limit}`
  );
  const videos: FeedPost[] = Array.isArray(raw.data?.videos)
    ? raw.data.videos
    : [];
  const pg = raw.data?.pagination;
  return {
    success: raw.status === "success",
    data: videos,
    pagination: {
      page: pg?.page ?? page,
      limit: pg?.limit ?? limit,
      total: pg?.total ?? videos.length,
      totalPages: pg ? Math.ceil(pg.total / (pg.limit || limit)) : 1,
    },
  };
}

/* ── getConversations ──────────────────────────────
   Backend: { status, data: [{ partnerId, partnerEmail, partnerPhoto,
              lastMessage, lastMessageAt, isRead }] }
   Returns: Conversation[] with normalized fields
   ────────────────────────────────────────────────── */
interface ConversationRaw {
  status: string;
  data: Array<{
    partnerId: string;
    partnerEmail: string | null;
    partnerRole: string | null;
    partnerPhoto: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    isRead: boolean;
  }>;
}

export async function getConversations(): Promise<Conversation[]> {
  const raw = await apiFetch<ConversationRaw>("/api/v1/messages/conversations");
  const items = Array.isArray(raw.data) ? raw.data : [];
  return items.map((c) => ({
    id: c.partnerId,
    recipientId: c.partnerId,
    recipientName: c.partnerEmail ?? c.partnerId,
    recipientAvatar: c.partnerPhoto ?? null,
    lastMessage: c.lastMessage ?? null,
    lastMessageAt: c.lastMessageAt ?? null,
    unreadCount: c.isRead ? 0 : 1,
  }));
}

/* ── getFitpassQr ──────────────────────────────────
   Backend: { success, data: { planName, qrImageUrl,
              validTo, subscriptionId, ... } }
   Returns: FitpassQr with normalized fields
   ────────────────────────────────────────────────── */
interface FitpassQrRaw {
  success: boolean;
  data: {
    subscriptionId: string;
    planName: string;
    qrValue: string;
    qrImageUrl: string;
    validFrom: string;
    validTo: string;
  };
}

export async function getFitpassQr(): Promise<FitpassQr> {
  const raw = await apiFetch<FitpassQrRaw>("/api/v1/fitpass/me/qr");
  return {
    qrCodeUrl: raw.data.qrImageUrl,
    planName: raw.data.planName,
    expiresAt: raw.data.validTo,
    status: "active",
  };
}

/* ── updateProfile ─────────────────────────────────
   Updates profile information (firstName, lastName, position, bio, etc)
   ────────────────────────────────────────────────── */
export async function updateProfile(
  profileData: Partial<Profile>
): Promise<Profile> {
  const raw = await apiFetch<ProfileRaw>("/api/v1/profile/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  const { user, profile } = raw.data;
  return {
    id: user.id,
    userId: user.id,
    role: user.role,
    avatarUrl: user.profilePhoto ?? null,
    coverPhotoUrl: user.coverPhoto ?? null,
    firstName: "",
    lastName: "",
    position: null,
    location: null,
    dominantFoot: null,
    height: null,
    weight: null,
    playingStyle: null,
    skills: null,
    bio: null,
    createdAt: "",
    updatedAt: "",
    careerHistories: [],
    achievements: [],
    ...profile,
  } as Profile;
}

/* ── updatePhotos ──────────────────────────────────
   Update profile and cover photos
   ────────────────────────────────────────────────── */
interface PhotoUpdate {
  profilePhoto?: string | null;
  coverPhoto?: string | null;
}

export async function updatePhotos(
  photos: PhotoUpdate
): Promise<{ message: string }> {
  return apiFetch("/api/v1/users/photos", {
    method: "PUT",
    body: JSON.stringify(photos),
  });
}

/* ── addCareerHistory ──────────────────────────────
   Add a career entry (club, position, dates)
   ────────────────────────────────────────────────── */
export async function addCareerHistory(
  careerData: Omit<CareerHistory, "id">
): Promise<CareerHistory> {
  const response = await apiFetch<{ status: string; data: CareerHistory }>(
    "/api/v1/profile/me/career",
    {
      method: "POST",
      body: JSON.stringify(careerData),
    }
  );
  return response.data;
}

/* ── updateCareerHistory ───────────────────────────
   Update an existing career entry
   ────────────────────────────────────────────────── */
export async function updateCareerHistory(
  id: string,
  careerData: Partial<CareerHistory>
): Promise<CareerHistory> {
  const response = await apiFetch<{ status: string; data: CareerHistory }>(
    `/api/v1/profile/me/career/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(careerData),
    }
  );
  return response.data;
}

/* ── getAvatarUploadUrl ────────────────────────────
   Get signed upload URL for profile avatar
   ────────────────────────────────────────────────── */
export async function getAvatarUploadUrl(): Promise<{
  uploadUrl: string;
  photoUrl: string;
}> {
  const response = await apiFetch<{
    status: string;
    data: { uploadUrl: string; photoUrl: string };
  }>("/api/v1/profile/me/avatar", {
    method: "POST",
  });
  return response.data;
}

export type { CareerHistory, Achievement, Profile };
export { apiFetch };

