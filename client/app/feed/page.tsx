"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FeedVideo {
  id: string;
  youtubeId: string;
  playerName: string;
  playerRole: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
}

// ─────────────────────────────────────────────
// TODO (backend integration)
//
// Everything inside this block is temporary mock data.
// Once the database is connected, do the following:
//
// 1. DELETE the entire VIDEOS array below.
//
// 2. DELETE this FeedVideo interface — the real type should come
//    from the API response (e.g. a shared types file or generated types).
//    The backend endpoint to use is: GET /api/v1/videos
//    Each video object already has: id, youtubeId (stored as the YouTube
//    video ID), playerName, playerRole, description, tags, likes, comments.
//
// 3. In the FeedPage component (bottom of this file), replace the hardcoded
//    VIDEOS constant with a fetch call, for example:
//
//      const [videos, setVideos] = useState<FeedVideo[]>([]);
//      useEffect(() => {
//        apiFetch<{ data: FeedVideo[] }>("/api/v1/videos")
//          .then((res) => setVideos(res.data))
//          .catch(console.error);
//      }, []);
//
//    Then replace {VIDEOS.map(...)} with {videos.map(...)} in the JSX.
//
// 4. The like / save / comment buttons currently only update local state.
//    Wire them up to the real endpoints:
//      POST /api/v1/social/like        — body: { targetId, targetType: "video" }
//      POST /api/v1/social/save-video  — body: { videoId }
// ─────────────────────────────────────────────

const VIDEOS: FeedVideo[] = [
  {
    id: "1",
    youtubeId: "jKwpuQHXfQI",
    playerName: "Carlos Méndez",
    playerRole: "ST · Real Madrid CF",
    description: "Hat-trick in the Champions League semifinal 🔥 Unstoppable form this season",
    tags: ["hatrick", "championsleague", "goals"],
    likes: 12400,
    comments: 843,
  },
  {
    id: "2",
    youtubeId: "aIMVPMxURQc",
    playerName: "Ahmed Al-Rashid",
    playerRole: "CAM · Al-Nassr FC",
    description: "Best assist compilation of the season — vision like no other",
    tags: ["assists", "skills", "football"],
    likes: 8700,
    comments: 412,
  },
  {
    id: "3",
    youtubeId: "c-djMIii9jQ",
    playerName: "Luca Bianchi",
    playerRole: "CB · Juventus",
    description: "No one gets past me. Top defensive performance of the month 💪",
    tags: ["defense", "cleansheet", "seriea"],
    likes: 5100,
    comments: 230,
  },
  {
    id: "4",
    youtubeId: "jKwpuQHXfQI",
    playerName: "Diego Herrera",
    playerRole: "GK · Atlético Madrid",
    description: "5 saves in one match. Some of the best reflexes you will ever see 🧤",
    tags: ["goalkeeper", "saves", "laliga"],
    likes: 9300,
    comments: 620,
  },
];

// ─────────────────────────────────────────────
// VideoCard — individual full-height card
// ─────────────────────────────────────────────

function VideoCard({
  video,
  isActive,
  ytReady,
}: {
  video: FeedVideo;
  isActive: boolean;
  ytReady: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const isActiveRef = useRef(isActive);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Initialize player once YouTube API is ready
  useEffect(() => {
    if (!ytReady) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerRef.current = new (window as any).YT.Player(`yt-${video.id}`, {
      videoId: video.youtubeId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
        loop: 1,
        playlist: video.youtubeId,
      },
      events: {
        onReady(e: { target: { playVideo: () => void } }) {
          if (isActiveRef.current) e.target.playVideo();
        },
      },
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [ytReady, video.id, video.youtubeId]);

  // Play / pause when active card changes
  useEffect(() => {
    const p = playerRef.current;
    if (!p?.playVideo) return;
    if (isActive) {
      p.playVideo();
    } else {
      p.pauseVideo();
    }
  }, [isActive]);

  function handleLike() {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="relative flex h-screen w-full snap-start items-end overflow-hidden bg-black">
      {/* YouTube player — fills the background */}
      <div
        id={`yt-${video.id}`}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Bottom gradient for text readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
        }}
      />

      {/* ── Right action buttons ── */}
      <div className="absolute right-4 bottom-24 z-10 flex flex-col items-center gap-5">
        <button
          onClick={handleLike}
          aria-label="Like"
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              liked ? "bg-red-500/30" : "bg-white/10"
            }`}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                liked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </div>
          <span className="text-xs font-semibold text-white">{fmt(likeCount)}</span>
        </button>

        <button aria-label="Comments" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">{fmt(video.comments)}</span>
        </button>

        <button
          onClick={() => setSaved((v) => !v)}
          aria-label="Save"
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              saved ? "bg-[#1db954]/30" : "bg-white/10"
            }`}
          >
            <Bookmark
              className={`h-6 w-6 transition-colors ${
                saved ? "fill-[#1db954] text-[#1db954]" : "text-white"
              }`}
            />
          </div>
        </button>

        <button aria-label="Share" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Share2 className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>

      {/* ── Bottom player info ── */}
      <div className="relative z-10 w-[calc(100%-80px)] p-5 pb-10">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1db954] text-sm font-black text-black">
            {video.playerName[0]}
          </div>
          <span className="font-bold text-white">{video.playerName}</span>
          <span className="text-sm text-white/50">· {video.playerRole}</span>
        </div>
        <p className="mb-2 text-sm leading-snug text-white/90">{video.description}</p>
        <div className="flex flex-wrap gap-1">
          {video.tags.map((tag) => (
            <span key={tag} className="text-xs font-semibold text-[#1db954]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FeedPage — entry point
// ─────────────────────────────────────────────

export default function FeedPage() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ytReady, setYtReady] = useState(false);

  // Load YouTube IFrame API once
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      const id = setTimeout(() => setYtReady(true), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // IntersectionObserver — activates the card that is ≥60% visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 },
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <DashboardShell>
      <div
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`#feed-scroll::-webkit-scrollbar { display: none; }`}</style>
        {VIDEOS.map((video, i) => (
          <div
            key={video.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          >
            <VideoCard
              video={video}
              isActive={activeIndex === i}
              ytReady={ytReady}
            />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}