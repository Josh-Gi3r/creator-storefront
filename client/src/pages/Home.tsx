import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// Local creator card images — replace with your own assets
const CARD_IMAGES = [
  "/images/featured-1.jpg",
  "/images/featured-2.jpg",
  "/images/featured-3.png",
  "/images/featured-4.jpg",
  "/images/featured-5.jpg",
  "/images/featured-6.jpg",
  "/images/creator-float-1.jpg",
  "/images/creator-float-2.jpg",
  "/images/how-it-works-1.jpg",
  "/images/how-it-works-2.jpg",
  "/images/how-it-works-3.jpg",
  "/images/featured-1.jpg",
];

const NETWORK_VIZ = "/images/hero-background.jpg";

const CATEGORIES = ["All", "Gaming", "Fitness", "Music", "Art", "Education", "Coaching", "Tech", "Business"];

const CATEGORY_ICONS: Record<string, string> = {
  All: "✦", Gaming: "🎮", Fitness: "💪", Music: "🎵",
  Art: "🎨", Education: "📚", Coaching: "🏆", Tech: "💻", Business: "💼",
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  Gaming: "/images/creators/gaming-creator-1.jpg",
  Fitness: "/images/creators/fitness-creator-1.jpg",
  Music: "/images/creators/music-creator-1.jpg",
  Art: "/images/creators/art-creator-1.jpg",
  Education: "/images/creators/education-creator-1.jpg",
  Coaching: "/images/creators/coaching-creator-1.jpg",
  Tech: "/images/creators/tech-creator-1.jpg",
  Business: "/images/creators/business-creator-1.jpg",
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeFeat, setActiveFeat] = useState(0);
  const featPanelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: allCreators } = trpc.fan.getCreators.useQuery({});
  const { data: featuredCreators } = trpc.fan.getFeaturedCreators.useQuery();

  const filteredCreators = allCreators?.filter(c =>
    activeCategory === "All" || c.profile?.category === activeCategory
  ) ?? [];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sticky panel active tracking — scroll-based for 300vh outer container
  useEffect(() => {
    const handleStickyScroll = () => {
      const trigger0 = featPanelRefs.current[0];
      if (!trigger0) return;
      // Each trigger div is 100vh tall. When its top is above viewport center, it's active.
      // trigger0: top 0, trigger1: top 100vh, trigger2: top 200vh
      const sectionTop = trigger0.getBoundingClientRect().top + window.scrollY;
      const scrolled = window.scrollY - sectionTop;
      const vh = window.innerHeight;
      if (scrolled < vh) setActiveFeat(0);
      else if (scrolled < vh * 2) setActiveFeat(1);
      else setActiveFeat(2);
    };
    window.addEventListener("scroll", handleStickyScroll, { passive: true });
    handleStickyScroll();
    return () => window.removeEventListener("scroll", handleStickyScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("rv-in"); }),
      { threshold: 0.07, rootMargin: "-40px" }
    );
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [allCreators]);

  const heroCreators = featuredCreators?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#0d0d0d] overflow-x-clip font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        body { background: #fafaf8; }

        /* ── Scroll reveal ── */
        .rv {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .rv.rv-in { opacity: 1; transform: none; }
        .rv-d1 { transition-delay: 0.1s; }
        .rv-d2 { transition-delay: 0.2s; }
        .rv-d3 { transition-delay: 0.3s; }
        .rv-d4 { transition-delay: 0.4s; }

        /* ── Hero entrance ── */
        @keyframes heroSlide {
          from { opacity: 0; transform: translateY(48px); }
          to   { opacity: 1; transform: none; }
        }
        .h1 { animation: heroSlide 1s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .h2 { animation: heroSlide 1s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .h3 { animation: heroSlide 1s cubic-bezier(0.16,1,0.3,1) 0.45s both; }
        .h4 { animation: heroSlide 1s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
        .h5 { animation: heroSlide 1s cubic-bezier(0.16,1,0.3,1) 0.75s both; }

        /* ── Float animations ── */
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(2deg); }
          50%      { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-18px) rotate(-1deg); }
        }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite 1s; }
        .float-c { animation: floatC 8s ease-in-out infinite 2s; }

        /* ── Gradient text ── */
        .grad {
          background: linear-gradient(135deg, #E91E8C 0%, #F5A623 55%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Buttons ── */
        .btn-pink {
          background: linear-gradient(135deg, #E91E8C, #F5A623);
          color: #fff;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .btn-pink:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(233,30,140,0.35);
        }
        .btn-outline {
          border: 1.5px solid #0d0d0d;
          color: #0d0d0d;
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .btn-outline:hover { background: #0d0d0d; color: #fff; }

        /* ── Creator card ── */
        .c-card {
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
          cursor: pointer;
        }
        .c-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 32px 64px rgba(0,0,0,0.18);
        }

        /* ── Category pill ── */
        .cat-pill {
          border: 1.5px solid #e0e0e0;
          color: #555;
          background: #fff;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cat-pill:hover { border-color: #E91E8C; color: #E91E8C; }
        .cat-pill.active {
          background: linear-gradient(135deg, #E91E8C, #F5A623);
          color: #fff;
          border-color: transparent;
        }

        /* ── Nav ── */
        .nav-light {
          background: rgba(250,250,248,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        /* ── Marquee ── */
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 28s linear infinite; }

        /* ── Token badge ── */
        .token-badge {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          font-weight: 600;
          font-size: 11px;
          color: #fff;
          padding: 3px 8px;
          border-radius: 20px;
        }

        /* ── Verified ── */
        .verified-pill {
          background: linear-gradient(135deg,#E91E8C,#8B5CF6);
          color:#fff;
          font-size:10px;
          font-weight:700;
          padding: 2px 8px;
          border-radius:20px;
        }

        /* ── Live dot ── */
        @keyframes pulseLive {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.6; transform:scale(1.3); }
        }
        .live-dot { animation: pulseLive 2s ease-in-out infinite; background:#E91E8C; }

        /* ── Stat card ── */
        .stat-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        /* ── Section label ── */
        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        /* ── Scroll indicator ── */
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        .scroll-arrow { animation: scrollBounce 1.8s ease-in-out infinite; }

        /* ── Network viz section ── */
        .network-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
        }

        /* ── Step number ── */
        .step-num {
          background: linear-gradient(135deg,#E91E8C,#F5A623);
          color:#fff;
          width:36px;height:36px;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:13px;
          flex-shrink:0;
        }

        /* ── Sticky scroll features ── */
        .sticky-features-outer {
          position: relative;
          background: #fafaf8;
        }
        .sticky-features-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
          max-width: 1400px;
          margin: 0 auto;
        }
        .sticky-left {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 5% 0 8%;
        }
        .sticky-right {
          display: flex;
          flex-direction: column;
        }
        .sticky-panel {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 6% 20px 2%;
        }
        .feat-pill {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 22px;
          border-radius: 16px;
          border: 1.5px solid #e8e8e8;
          background: #fff;
          font-size: 15px;
          font-weight: 600;
          color: #888;
          cursor: default;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          width: 100%;
          text-align: left;
        }
        .feat-pill.active {
          border-color: transparent;
          background: linear-gradient(135deg, #E91E8C, #F5A623);
          color: #fff;
          box-shadow: 0 12px 32px rgba(233,30,140,0.28);
          transform: scale(1.02);
        }
        .feat-pill .pill-num {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .feat-pill:not(.active) .pill-num {
          background: #f0f0f0;
          color: #555;
        }
        .feat-img {
          width: 100%;
          max-width: 380px;
          height: auto;
          filter: drop-shadow(0 32px 64px rgba(0,0,0,0.15));
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .feat-chart {
          width: 100%;
          max-width: 600px;
          height: auto;
          filter: drop-shadow(0 20px 48px rgba(0,0,0,0.10));
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "nav-light" : ""}`}>
        <Link href="/">
          <span className="text-[22px] font-bold tracking-tight text-[#1a1a1a] cursor-pointer select-none">CreatorHub</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[["Discover", "/discover"], ["Creators", "/discover"], ["Pricing", "/"]].map(([label, href]) => (
            <Link key={label} href={href}>
              <span className="text-[#333] font-medium text-[15px] hover:text-[#E91E8C] transition-colors cursor-pointer">{label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="btn-pink px-5 py-2.5 rounded-full font-semibold text-[14px]">Dashboard</button>
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <button className="btn-outline px-5 py-2.5 rounded-full font-medium text-[14px]">Sign In</button>
              </a>
              <a href={getLoginUrl()}>
                <button className="btn-pink px-5 py-2.5 rounded-full font-semibold text-[14px]">Join Free</button>
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#fafaf8] pt-20">
        {/* Ambient gradient blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(233,30,140,0.08) 0%, transparent 65%)" }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
          {/* Left: Text */}
          <div>
            <div className="h1 inline-flex items-center gap-2 bg-white border border-[#ebebeb] rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="live-dot w-2 h-2 rounded-full inline-block" />
              <span className="text-[#555] text-[12px] font-semibold tracking-widest uppercase">20 Creators Live Now</span>
            </div>

            <h1 className="font-['Playfair_Display'] leading-[1.05] mb-6">
              <span className="h2 block text-[#0d0d0d] text-[clamp(3.2rem,6vw,5.5rem)] font-black">Build Your</span>
              <span className="h3 block grad text-[clamp(3.2rem,6vw,5.5rem)] font-black">Creator Economy.</span>
            </h1>

            <p className="h4 text-[#555] text-[1.15rem] leading-[1.75] mb-10 max-w-[500px]">
              Every creator, brand, and business gets their own currency. Fans buy, spend, and earn — instantly. No friction. No hidden fees.
            </p>

            <div className="h5 flex flex-col sm:flex-row items-start gap-4">
              <Link href="/discover">
                <button className="btn-pink px-8 py-4 rounded-full font-bold text-[1rem] tracking-wide">
                  Explore Creators →
                </button>
              </Link>
              <a href={getLoginUrl()}>
                <button className="btn-outline px-8 py-4 rounded-full font-medium text-[1rem]">
                  Become a Creator
                </button>
              </a>
            </div>

            {/* Stats row */}
            <div className="h5 flex gap-8 mt-12 pt-10 border-t border-[#ebebeb]">
              {[
                { num: "20+", label: "Creators" },
                { num: "70+", label: "Currencies" },
                { num: "$0", label: "Swap Fees" },
                { num: "24/7", label: "Always On" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-['Playfair_Display'] text-[1.8rem] font-bold grad leading-none">{s.num}</div>
                  <div className="text-[#888] text-[12px] mt-1 tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating creator images */}
          <div className="relative h-[560px] hidden lg:block">
            {/* Large center card */}
            <div className="float-b absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[220px] rounded-[24px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] z-20"
              style={{ aspectRatio: "3/4" }}>
              <img src={CARD_IMAGES[0]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/featured-1.jpg"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="token-badge inline-block mb-1">$LUNA · $2.45</div>
                <div className="text-white font-bold text-[15px]">Luna Chen</div>
                <div className="text-white/60 text-[12px]">153K followers</div>
              </div>
            </div>

            {/* Top-left card */}
            <div className="float-a absolute top-[4%] left-[2%] w-[160px] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-10"
              style={{ aspectRatio: "3/4" }}>
              <img src={CARD_IMAGES[1]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/featured-2.jpg"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="token-badge inline-block mb-1">$SOFI · $3.20</div>
                <div className="text-white font-semibold text-[13px]">Sofia M.</div>
              </div>
            </div>

            {/* Top-right card */}
            <div className="float-c absolute top-[2%] right-[0%] w-[150px] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-10"
              style={{ aspectRatio: "3/4" }}>
              <img src={CARD_IMAGES[2]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/featured-3.png"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="token-badge inline-block mb-1">$JAY · $3.75</div>
                <div className="text-white font-semibold text-[13px]">Jamal W.</div>
              </div>
            </div>

            {/* Bottom-left card */}
            <div className="float-b absolute bottom-[4%] left-[0%] w-[155px] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-10"
              style={{ aspectRatio: "3/4" }}>
              <img src={CARD_IMAGES[3]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/featured-4.jpg"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="token-badge inline-block mb-1">$EMMA · $1.80</div>
                <div className="text-white font-semibold text-[13px]">Emma C.</div>
              </div>
            </div>

            {/* Bottom-right card */}
            <div className="float-a absolute bottom-[6%] right-[1%] w-[145px] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-10"
              style={{ aspectRatio: "3/4" }}>
              <img src={CARD_IMAGES[4]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/featured-5.jpg"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="token-badge inline-block mb-1">$MIKA · $2.10</div>
                <div className="text-white font-semibold text-[13px]">Mika T.</div>
              </div>
            </div>

            {/* Floating stat pill */}
            <div className="float-c absolute top-[38%] right-[-8%] stat-card px-4 py-3 z-30 min-w-[140px]">
              <div className="text-[11px] text-[#888] mb-0.5">Swap Fees</div>
              <div className="grad font-['Playfair_Display'] text-[1.6rem] font-bold leading-none">$0</div>
              <div className="text-[11px] text-[#aaa] mt-0.5">Always free</div>
            </div>

            {/* Floating live pill */}
            <div className="float-b absolute top-[60%] left-[-6%] stat-card px-4 py-3 z-30 flex items-center gap-2">
              <span className="live-dot w-2.5 h-2.5 rounded-full shrink-0" />
              <div>
                <div className="text-[11px] text-[#888]">Instant</div>
                <div className="text-[#0d0d0d] font-bold text-[14px]">Settlement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[11px] tracking-widest uppercase text-[#888]">Scroll</span>
          <div className="scroll-arrow text-[#888] text-lg">↓</div>
        </div>
      </section>

      {/* ─── NETWORK VIZ ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="rv section-label text-[#E91E8C] mb-3">The Network</p>
            <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d] leading-tight">
              One network. <span className="grad">Every currency.</span>
            </h2>
            <p className="rv rv-d2 text-[#666] text-[1.05rem] leading-[1.75] max-w-[560px] mx-auto mt-4">
              Your creator currency trades against every other currency. Every creator and their fans can swap, spend or earn instantly. No friction. No hidden fees.
            </p>
          </div>

          <div className="rv rv-d2 network-card">
            <img
              src={NETWORK_VIZ}
              alt="creator currency network"
              className="w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = "/images/featured-1.jpg"; }}
            />
          </div>

          {/* Stats below viz */}
          <div className="rv rv-d3 grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              { num: "70+", label: "Currencies Connected" },
              { num: "$0", label: "Swap Fees" },
              { num: "Instant", label: "Settlement" },
              { num: "24/7", label: "Always On" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-['Playfair_Display'] text-[2.2rem] font-bold grad leading-none mb-1">{s.num}</div>
                <div className="text-[#888] text-[12px] tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STICKY-SCROLL FEATURES ─── */}
      <section className="hidden lg:block" style={{ background: "#fafaf8" }}>
        {/* Outer container: sets the scroll height = 3 viewports */}
        <div style={{ position: "relative", height: "300vh" }}>
          {/* Inner: sticky, fills viewport, splits 50/50 */}
          <div style={{
            position: "sticky",
            top: 0,
            height: "100svh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
          }}>
            {/* LEFT: text + pills */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 5% 0 8%",
              height: "100%",
            }}>
              <p className="section-label text-[#E91E8C] mb-4">What You Can Do</p>
              <h2 className="font-['Playfair_Display'] text-[clamp(2rem,3.5vw,3rem)] font-black text-[#0d0d0d] leading-tight mb-10">
                Everything your
                <br /><span className="grad">currency can do.</span>
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { num: "01", label: "Swap Any Token", desc: "Instantly swap between any creator currencies with zero fees." },
                  { num: "02", label: "Spend with $CURRENCY", desc: "Pay for services, content, and bookings directly with your tokens." },
                  { num: "03", label: "High-Yield Earnings", desc: "Hold tokens and earn yield as the creator economy grows." },
                ].map((f, i) => (
                  <div key={i} className={`feat-pill${activeFeat === i ? " active" : ""}`}>
                    <span className="pill-num">{f.num}</span>
                    <div>
                      <div className="font-bold text-[15px] leading-tight">{f.label}</div>
                      <div className={`text-[13px] mt-1 leading-snug ${activeFeat === i ? "text-white/80" : "text-[#aaa]"}`}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: image that changes based on scroll progress */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "24px 5% 24px 2%",
              position: "relative",
            }}>
              {/* Panel 1: Swap */}
              <div ref={el => { featPanelRefs.current[0] = el; }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 5% 24px 2%",
                  opacity: activeFeat === 0 ? 1 : 0,
                  transform: activeFeat === 0 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: activeFeat === 0 ? "auto" : "none",
                }}>
                <img
                  src="/images/how-it-works-1.jpg"
                  alt="Token Swap Interface"
                  style={{ height: "82vh", maxHeight: 780, width: "auto", objectFit: "cover", borderRadius: 24, filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.15))" }}
                />
              </div>
              {/* Panel 2: Spend */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 5% 24px 2%",
                  opacity: activeFeat === 1 ? 1 : 0,
                  transform: activeFeat === 1 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: activeFeat === 1 ? "auto" : "none",
                }}>
                <img
                  src="/images/how-it-works-2.jpg"
                  alt="Spend Interface"
                  style={{ height: "82vh", maxHeight: 780, width: "auto", objectFit: "cover", borderRadius: 24, filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.15))" }}
                />
              </div>
              {/* Panel 3: Yield */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 5% 24px 2%",
                  opacity: activeFeat === 2 ? 1 : 0,
                  transform: activeFeat === 2 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: activeFeat === 2 ? "auto" : "none",
                }}>
                <img
                  src="/images/how-it-works-3.jpg"
                  alt="Earnings Growth"
                  style={{ width: "90%", maxWidth: 560, height: "auto", borderRadius: 24, filter: "drop-shadow(0 20px 48px rgba(0,0,0,0.10))" }}
                />
              </div>
            </div>
          </div>

          {/* Invisible scroll triggers: 3 divs stacked to 300vh, each 100vh */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100vh", pointerEvents: "none" }}
            ref={el => { featPanelRefs.current[0] = el; }} />
          <div style={{ position: "absolute", top: "100vh", left: 0, right: 0, height: "100vh", pointerEvents: "none" }}
            ref={el => { featPanelRefs.current[1] = el; }} />
          <div style={{ position: "absolute", top: "200vh", left: 0, right: 0, height: "100vh", pointerEvents: "none" }}
            ref={el => { featPanelRefs.current[2] = el; }} />
        </div>
      </section>

      {/* ─── FEATURED CREATORS ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="rv section-label text-[#E91E8C] mb-3">Featured</p>
              <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d] leading-tight">
                Featured <span className="grad">Creators</span>
              </h2>
              <p className="rv rv-d2 text-[#666] text-[1rem] mt-2">
                Join thousands of creators, brands, and businesses running their own currency economies.
              </p>
            </div>
            <Link href="/discover">
              <button className="rv rv-d2 btn-outline px-6 py-3 rounded-full text-[14px] font-semibold">
                View All Creators →
              </button>
            </Link>
          </div>

          {/* Bento grid — matches original: large left + 2 stacked right + 3 small bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card — col 1, row 1+2 */}
            {(featuredCreators ?? []).slice(0, 1).map((c, i) => {
              const photo = c.profile?.profilePhoto || CARD_IMAGES[0];
              return (
                <Link key={c.id} href={`/creator/${c.id}`}>
                  <div className="c-card rv relative rounded-[20px] overflow-hidden lg:row-span-2" style={{ aspectRatio: "2/3", minHeight: 400 }}>
                    <img src={photo} alt={c.name ?? "Creator"} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = CARD_IMAGES[0]; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#E91E8C]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">🔥 Trending</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-white/60 text-[12px] mb-1">{c.profile?.category} · {c.profile?.bio?.slice(0, 30)}...</div>
                      <h3 className="font-['Playfair_Display'] text-white text-[1.5rem] font-bold leading-tight">{c.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-white/50 text-[13px]">{formatFollowers(c.profile?.followerCount ?? 0)} followers</span>
                        {c.token && (
                          <span className="token-badge">${c.token.tokenSymbol}: ${Number(c.token.currentPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Two stacked cards — col 2 */}
            <div className="flex flex-col gap-4">
              {(featuredCreators ?? []).slice(1, 3).map((c, i) => {
                const photo = c.profile?.profilePhoto || CARD_IMAGES[i + 1];
                return (
                  <Link key={c.id} href={`/creator/${c.id}`}>
                    <div className="c-card rv relative rounded-[20px] overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <img src={photo} alt={c.name ?? "Creator"} className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = CARD_IMAGES[i + 1]; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="text-white/60 text-[11px] mb-0.5">{c.profile?.category}</div>
                        <h3 className="font-['Playfair_Display'] text-white text-[1.2rem] font-bold leading-tight">{c.name}</h3>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-white/50 text-[12px]">{formatFollowers(c.profile?.followerCount ?? 0)} followers</span>
                          {c.token && (
                            <span className="token-badge">${c.token.tokenSymbol}: ${Number(c.token.currentPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Three small cards — bottom row */}
            {(featuredCreators ?? []).slice(3, 6).map((c, i) => {
              const photo = c.profile?.profilePhoto || CARD_IMAGES[i + 3];
              return (
                <Link key={c.id} href={`/creator/${c.id}`}>
                  <div className="c-card rv relative rounded-[20px] overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <img src={photo} alt={c.name ?? "Creator"} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = CARD_IMAGES[i + 3]; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-white/60 text-[11px] mb-0.5">{c.profile?.category}</div>
                      <h3 className="text-white font-bold text-[1rem] leading-tight">{c.name}</h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/50 text-[12px]">{formatFollowers(c.profile?.followerCount ?? 0)} followers</span>
                        {c.token && (
                          <span className="token-badge">${c.token.tokenSymbol}: ${Number(c.token.currentPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BROWSE BY CATEGORY ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="rv section-label text-[#F5A623] mb-3">Browse</p>
            <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d]">
              Find Your <span className="grad">Type</span>
            </h2>
          </div>

          <div className="rv rv-d2 flex gap-3 overflow-x-auto pb-2 mb-10 justify-center flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cat-pill px-5 py-2.5 rounded-full text-[14px] font-medium ${activeCategory === cat ? "active" : ""}`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCreators.slice(0, 10).map((c, i) => {
              const photo = c.profile?.profilePhoto || CATEGORY_FALLBACKS[c.profile?.category ?? "Gaming"];
              return (
                <Link key={c.id} href={`/creator/${c.id}`}>
                  <div className="c-card rv relative rounded-[20px] overflow-hidden bg-white shadow-sm"
                    style={{ aspectRatio: "3/4", transitionDelay: `${i * 0.05}s` }}>
                    <img src={photo} alt={c.name ?? "Creator"} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = "/images/featured-1.jpg"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-[14px] leading-tight">{c.name}</h3>
                      <p className="text-white/50 text-[11px] mt-0.5">{c.profile?.category}</p>
                      {c.token && (
                        <span className="token-badge mt-1.5 inline-block">${c.token.tokenSymbol}: ${Number(c.token.currentPrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredCreators.length === 0 && (
            <div className="text-center py-16 text-[#aaa]">
              <p className="text-[1.1rem]">No creators in this category yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/discover">
              <button className="btn-pink px-8 py-4 rounded-full font-bold text-[1rem]">
                See All {filteredCreators.length > 0 ? filteredCreators.length : ""} Creators →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="rv section-label text-[#8B5CF6] mb-3">How It Works</p>
            <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d]">
              Start in <span className="grad">Minutes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { num: "01", title: "Create Your Account", desc: "Sign up free. Set up your profile in minutes. No technical skills needed.", img: "/images/how-it-works-1.jpg" },
              { num: "02", title: "Discover Creators", desc: "Browse 20+ creators across Gaming, Fitness, Music, Art, and more. Find your favourites.", img: "/images/how-it-works-2.jpg" },
              { num: "03", title: "Swap & Access", desc: "Buy creator currencies instantly. Swap, spend, and earn across the entire creator network.", img: "/images/how-it-works-3.jpg" },
            ].map((step, i) => (
              <div key={i} className={`rv rv-d${i + 1}`}>
                <div className="relative rounded-[20px] overflow-hidden mb-6" style={{ aspectRatio: "4/3" }}>
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "/images/featured-1.jpg"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 step-num">{step.num}</div>
                </div>
                <h3 className="font-['Playfair_Display'] text-[#0d0d0d] text-[1.3rem] font-bold mb-3">{step.title}</h3>
                <p className="text-[#666] text-[0.95rem] leading-[1.75]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR FANS ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#f5f3ef]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="rv section-label text-[#E91E8C] mb-4">For Fans</p>
              <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d] leading-tight mb-6">
                More Than Just<br /><span className="grad">Content</span>
              </h2>
              <p className="rv rv-d2 text-[#666] text-[1.05rem] leading-[1.75] mb-8">
                Get real access to the creators you love. Exclusive videos, private 1-on-1 sessions, custom content made just for you, and merch drops.
              </p>
              <div className="rv rv-d3 space-y-3">
                {[
                  { icon: "🎬", title: "Exclusive Videos", desc: "Content you can't find anywhere else" },
                  { icon: "📞", title: "Private Sessions", desc: "1-on-1 calls and custom content" },
                  { icon: "👕", title: "Creator Merch", desc: "Limited drops direct from creators" },
                  { icon: "💬", title: "Direct Access", desc: "Message and interact directly" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-[16px] bg-white border border-[#ebebeb] hover:shadow-md transition-shadow">
                    <span className="text-[1.5rem]">{item.icon}</span>
                    <div>
                      <h4 className="text-[#0d0d0d] font-semibold text-[15px]">{item.title}</h4>
                      <p className="text-[#888] text-[13px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating image grid */}
            <div className="rv rv-d2 relative h-[480px] hidden lg:block">
              <div className="float-a absolute top-0 left-[5%] w-[48%] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)]" style={{ aspectRatio: "3/4" }}>
                <img src={CARD_IMAGES[5]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/creators/gaming-creator-1.jpg"; }} />
              </div>
              <div className="float-c absolute top-[8%] right-[0%] w-[44%] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)]" style={{ aspectRatio: "3/4" }}>
                <img src={CARD_IMAGES[6]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/creators/fitness-creator-1.jpg"; }} />
              </div>
              <div className="float-b absolute bottom-[2%] left-[20%] w-[40%] rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)] z-10" style={{ aspectRatio: "1/1" }}>
                <img src={CARD_IMAGES[7]} alt="Creator" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/images/creators/music-creator-1.jpg"; }} />
              </div>
              {/* Floating stat */}
              <div className="float-c absolute bottom-[22%] left-[-4%] stat-card px-4 py-3 z-20">
                <div className="text-[11px] text-[#888] mb-0.5">New Subscribers Today</div>
                <div className="grad font-['Playfair_Display'] text-[1.8rem] font-bold leading-none">+1,247</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOR CREATORS ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Earnings mockup */}
            <div className="rv rv-d1 order-2 lg:order-1">
              <div className="stat-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[#aaa] text-[12px] uppercase tracking-wider mb-1">This Month</div>
                    <div className="grad font-['Playfair_Display'] text-[2.8rem] font-bold leading-none">$4,820</div>
                  </div>
                  <div className="w-12 h-12 btn-pink rounded-full flex items-center justify-center text-[1.3rem]">💰</div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Subscriptions", amount: "$2,400", pct: 50 },
                    { label: "Private Sessions", amount: "$1,600", pct: 33 },
                    { label: "Custom Content", amount: "$820", pct: 17 },
                  ].map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[14px] mb-1.5">
                        <span className="text-[#666]">{row.label}</span>
                        <span className="text-[#0d0d0d] font-semibold">{row.amount}</span>
                      </div>
                      <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: "linear-gradient(90deg,#E91E8C,#F5A623)" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-[#ebebeb] flex items-center gap-2 text-[#aaa] text-[12px]">
                  <span className="live-dot w-1.5 h-1.5 rounded-full inline-block" />
                  Instant payouts · No chargebacks · You keep 85%
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="rv section-label text-[#F5A623] mb-4">For Creators</p>
              <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d] leading-tight mb-6">
                Your Content.<br /><span className="grad">Your Income.</span>
              </h2>
              <p className="rv rv-d2 text-[#666] text-[1.05rem] leading-[1.75] mb-8">
                Launch your creator profile in minutes. Sell subscriptions, private sessions, custom content, and merch. Get paid instantly with no platform delays.
              </p>
              <div className="rv rv-d3 grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: "⚡", title: "Instant Payouts", desc: "No 7-day waits" },
                  { icon: "🛡️", title: "No Chargebacks", desc: "Payments are final" },
                  { icon: "💎", title: "Keep 85%", desc: "Low platform fee" },
                  { icon: "📊", title: "Analytics", desc: "Real-time insights" },
                ].map((f, i) => (
                  <div key={i} className="p-4 rounded-[16px] bg-white border border-[#ebebeb] hover:shadow-md transition-shadow">
                    <span className="text-[1.4rem] block mb-2">{f.icon}</span>
                    <div className="text-[#0d0d0d] font-semibold text-[14px]">{f.title}</div>
                    <div className="text-[#aaa] text-[12px] mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </div>
              <div className="rv rv-d4">
                <a href={getLoginUrl()}>
                  <button className="btn-pink px-8 py-4 rounded-full font-bold text-[1rem]">
                    Start Creating Today →
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <section className="py-5 overflow-hidden border-y border-[#ebebeb] bg-white">
        <div className="marquee-track flex gap-10 whitespace-nowrap">
          {[...Array(3)].map((_, si) => (
            <div key={si} className="flex gap-10 shrink-0">
              {["Creator Currencies", "Instant Swaps", "Private Sessions", "Custom Content", "Creator Merch", "1-on-1 Calls", "Fan Clubs", "Live Streams"].map((item, i) => (
                <span key={i} className="text-[#ccc] font-['Playfair_Display'] text-[1.1rem] font-medium">
                  {item} <span className="text-[#E91E8C] mx-3">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="rv section-label text-[#8B5CF6] mb-3">Creators Love Us</p>
            <h2 className="rv rv-d1 font-['Playfair_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-black text-[#0d0d0d]">
              Real Creators.<br /><span className="grad">Real Results.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Luna Chen", category: "Gaming Creator", photo: "/images/creators/gaming-creator-1.jpg", quote: "I went from zero to $3K/month in 60 days. The platform handles everything — I just create.", stat: "$3K/mo" },
              { name: "Sofia Martinez", category: "Music Creator", photo: "/images/creators/music-creator-1.jpg", quote: "My fans finally have a place to get exclusive content. The private session feature is a game changer.", stat: "198K followers" },
              { name: "Jamal Williams", category: "Art Creator", photo: "/images/creators/art-creator-1.jpg", quote: "Instant payouts changed everything. I used to wait weeks. Now it's same-day. No more chasing money.", stat: "234K followers" },
            ].map((t, i) => (
              <div key={i} className={`rv rv-d${i + 1} stat-card p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#ebebeb]">
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = "/images/featured-1.jpg"; }} />
                  </div>
                  <div>
                    <div className="text-[#0d0d0d] font-semibold text-[15px]">{t.name}</div>
                    <div className="text-[#aaa] text-[12px]">{t.category} · {t.stat}</div>
                  </div>
                </div>
                <p className="text-[#555] text-[14px] leading-[1.75] italic">"{t.quote}"</p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="text-[#F5A623] text-[14px]">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 px-6 text-center relative overflow-hidden bg-[#0d0d0d]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(233,30,140,0.15) 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="rv font-['Playfair_Display'] text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-tight mb-6">
            Ready to<br /><span className="grad">Get Started?</span>
          </h2>
          <p className="rv rv-d1 text-white/60 text-[1.05rem] leading-[1.75] mb-10 max-w-[500px] mx-auto">
            Join thousands of fans and creators. Sign up free. No credit card required.
          </p>
          <div className="rv rv-d2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/discover">
              <button className="btn-pink px-10 py-5 rounded-full font-bold text-[1.05rem]">
                Explore Creators →
              </button>
            </Link>
            <a href={getLoginUrl()}>
              <button className="border border-white/25 text-white/70 px-10 py-5 rounded-full font-medium text-[1.05rem] hover:border-white/50 hover:text-white transition-all">
                Become a Creator
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <span className="text-[22px] font-bold tracking-tight text-white block mb-4 select-none">CreatorHub</span>
              <p className="text-white/40 text-[14px] leading-[1.75] max-w-[320px]">
                The premium platform where creators launch their own currencies. Direct from creator to fan.
              </p>
              <div className="flex gap-5 mt-5">
                {["Twitter", "Instagram", "Discord"].map(s => (
                  <span key={s} className="text-white/30 text-[13px] hover:text-white/60 cursor-pointer transition-colors">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white/30 text-[11px] uppercase tracking-widest mb-5">Platform</h4>
              {["Discover Creators", "Become a Creator", "Pricing", "How It Works"].map(l => (
                <div key={l} className="text-white/50 text-[14px] py-1.5 hover:text-white cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
            <div>
              <h4 className="text-white/30 text-[11px] uppercase tracking-widest mb-5">Legal</h4>
              {["Terms of Service", "Privacy Policy", "Content Policy", "Cookie Settings"].map(l => (
                <div key={l} className="text-white/50 text-[14px] py-1.5 hover:text-white cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/25 text-[12px]">
            <p>© 2026 CreatorHub. All rights reserved.</p>
            <p>Made for creators, by creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
