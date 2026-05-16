import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import bgVideo from "./assets/main1.mp4";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!viewing) {
        if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
        if (e.key === "ArrowDown") setActive((i) => Math.min(photos.length - 1, i + 1));
        if (e.key === "Enter" || e.key === "ArrowRight") {
          if (photos.length > 0) setViewing(true);
        }
        if (e.key === "ArrowLeft" || e.key === "Escape") navigate(-1);
      } else {
        if (e.key === "ArrowLeft" || e.key === "Escape") setViewing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing, photos.length, navigate]);

  const photo = photos[active];

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
  };

  return (
    <div id="menu-screen">
      <video src={bgVideo} autoPlay loop muted playsInline />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Montserrat:wght@300&display=swap');

        .gal-counter {
          position: absolute;
          top: 18px;
          left: 22px;
          z-index: 20;
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 90px;
          line-height: 0.88;
          letter-spacing: 2px;
          color: rgba(10, 10, 14, 0.64);
          transform: rotate(18deg);
          transform-origin: left top;
          user-select: none;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .gal-counter-sub {
          font-size: 40px;
          color: rgba(0, 0, 0, 0.4);
        }

        .gal-sidebar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 44vw;
          z-index: 6;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 6px;
          pointer-events: none;
          overflow-y: auto;
          padding: 24px 0;
        }

        .gal-bar-outer {
          position: relative;
          flex-shrink: 0;
          width: 44vw;
          transform: translateX(-100%);
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: all;
          cursor: pointer;
        }
        .gal-bar-outer.mounted { transform: translateX(0); }
        .gal-bar-outer:nth-child(1)  { transition-delay: 0ms; }
        .gal-bar-outer:nth-child(2)  { transition-delay: 60ms; }
        .gal-bar-outer:nth-child(3)  { transition-delay: 120ms; }
        .gal-bar-outer:nth-child(4)  { transition-delay: 180ms; }
        .gal-bar-outer:nth-child(5)  { transition-delay: 240ms; }
        .gal-bar-outer:nth-child(6)  { transition-delay: 300ms; }
        .gal-bar-outer:nth-child(7)  { transition-delay: 360ms; }
        .gal-bar-outer:nth-child(8)  { transition-delay: 420ms; }
        .gal-bar-outer:nth-child(9)  { transition-delay: 480ms; }
        .gal-bar-outer:nth-child(10) { transition-delay: 540ms; }

        .gal-bar-red {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 72px;
          background: #c4001a;
          clip-path: polygon(50% 0, 100% 0, 100% 100%, calc(50% - 10px) 100%);
          transform: translateY(-7px);
          opacity: 0;
          transition: opacity 0.2s ease, height 0.3s cubic-bezier(0.22,1,0.36,1);
          z-index: 0;
          pointer-events: none;
        }
        .gal-bar-outer.active .gal-bar-red { opacity: 1; height: 90px; }

        .gal-bar {
          position: relative;
          width: 100%;
          height: 72px;
          background: #111;
          clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%);
          box-shadow: 0 6px 24px rgba(0,0,0,0.65);
          z-index: 1;
          transition: height 0.3s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        .gal-bar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%);
          z-index: 10;
          pointer-events: none;
        }
        .gal-bar-outer.active .gal-bar { height: 90px; }

        .gal-bar-fill {
          position: absolute;
          inset: 0;
          background: #ffffff;
          clip-path: polygon(100% 0, 100% 0, calc(100% - 32px) 100%, calc(100% - 32px) 100%);
          transition: clip-path 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 0;
        }
        .gal-bar-outer.active .gal-bar-fill {
          clip-path: polygon(22% 0, 100% 0, calc(100% - 14px) 100%, calc(22% + 138px) 100%);
        }

        .gal-bar-shade {
          position: absolute;
          top: 0; bottom: 0;
          left: 73%;
          width: 6%;
          background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%);
          z-index: 1;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .gal-bar-outer.active .gal-bar-shade { opacity: 1; }

        .gal-bar-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 20px;
        }

        .gal-thumb {
          width: 54px;
          height: 54px;
          object-fit: cover;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          flex-shrink: 0;
        }
        .gal-thumb-ph {
          width: 54px;
          height: 54px;
          background: #222;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          flex-shrink: 0;
        }

        .gal-bar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.85);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
          user-select: none;
        }
        .gal-bar-outer.active .gal-bar-title { color: #111; }

        .gal-bar-date {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.38);
          flex-shrink: 0;
          transition: color 0.2s ease;
          user-select: none;
          padding-right: 8px;
        }
        .gal-bar-outer.active .gal-bar-date { color: #555; }

        .gal-viewer {
          position: absolute;
          right: 4vw;
          top: 50%;
          transform: translateY(-50%) skewX(-4deg);
          width: 46vw;
          z-index: 6;
          box-shadow: 8px 8px 0px 0px #c4001a, 16px 16px 0px 0px rgba(196,0,26,0.28);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gal-viewer.visible { opacity: 1; pointer-events: all; }

        .gal-viewer-img {
          width: 100%;
          height: 55vh;
          object-fit: cover;
          display: block;
        }

        .gal-viewer-info {
          background: #111;
          padding: 18px 24px 22px;
        }

        .gal-viewer-title {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 34px;
          letter-spacing: 2px;
          color: #fff;
          line-height: 1;
          margin-bottom: 8px;
        }

        .gal-viewer-caption {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .gal-viewer-date {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #3ce2ff;
        }

        .gal-empty {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 6;
          pointer-events: none;
        }

        .gal-empty-text {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 72px;
          letter-spacing: 4px;
          color: #3ce2ff;
          text-align: center;
          line-height: 1;
          opacity: 0.85;
        }

        .gal-footer {
          position: fixed;
          bottom: 20px; right: 28px;
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 5px;
          font-family: 'Bebas Neue', sans-serif;
          z-index: 20;
          opacity: 0;
          transition: opacity 0.4s ease 0.6s;
        }
        .gal-footer.mounted { opacity: 1; }
        .gal-footer-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; letter-spacing: 2px;
          color: rgba(255,255,255,0.22);
        }
        .gal-footer-key {
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 3px;
          padding: 1px 6px; font-size: 11px;
        }
      `}</style>

      {photos.length > 0 && (
        <div className="gal-counter">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className="gal-counter-sub">/{String(photos.length).padStart(2, "0")}</span>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="gal-empty">
          <div className="gal-empty-text">NO PHOTOS YET</div>
        </div>
      ) : (
        <div className="gal-sidebar">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className={`gal-bar-outer${active === i ? " active" : ""}${mounted ? " mounted" : ""}`}
              onClick={() => { setActive(i); setViewing(true); }}
              onMouseEnter={() => setActive(i)}
            >
              <div className="gal-bar-red" />
              <div className="gal-bar">
                <div className="gal-bar-fill" />
                <div className="gal-bar-shade" />
                <div className="gal-bar-content">
                  {p.imageUrl
                    ? <img className="gal-thumb" src={p.imageUrl} alt="" />
                    : <div className="gal-thumb-ph" />
                  }
                  <span className="gal-bar-title">{p.title}</span>
                  <span className="gal-bar-date">{formatDate(p.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {photo && (
        <div className={`gal-viewer${viewing ? " visible" : ""}`}>
          <img className="gal-viewer-img" src={photo.imageUrl} alt={photo.title} />
          <div className="gal-viewer-info">
            <div className="gal-viewer-title">{photo.title}</div>
            {photo.caption && <div className="gal-viewer-caption">{photo.caption}</div>}
            <div className="gal-viewer-date">{formatDate(photo.createdAt)}</div>
          </div>
        </div>
      )}

      <div className={`gal-footer${mounted ? " mounted" : ""}`}>
        {!viewing ? (
          <>
            <div className="gal-footer-row"><span className="gal-footer-key">↑↓</span><span>SELECT</span></div>
            <div className="gal-footer-row"><span className="gal-footer-key">↵ →</span><span>VIEW</span></div>
            <div className="gal-footer-row"><span className="gal-footer-key">ESC ←</span><span>BACK</span></div>
          </>
        ) : (
          <div className="gal-footer-row"><span className="gal-footer-key">← ESC</span><span>BACK</span></div>
        )}
      </div>
    </div>
  );
}
