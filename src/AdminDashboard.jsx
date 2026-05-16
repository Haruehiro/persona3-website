import { useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import AdminLogin from "./AdminLogin";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!auth) { setAuthChecked(true); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || !storage || !db) return;
    setUploading(true);
    setProgress(0);
    try {
      const storagePath = `photos/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve,
        );
      });
      const imageUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "photos"), {
        title: title.trim(),
        caption: caption.trim(),
        imageUrl,
        storagePath,
        createdAt: serverTimestamp(),
      });
      setFile(null); setPreview(null); setTitle(""); setCaption(""); setProgress(0);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "photos", photo.id));
      if (storage && photo.storagePath) {
        await deleteObject(ref(storage, photo.storagePath));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleLogout = () => { if (auth) signOut(auth); };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
  };

  if (!authChecked) return <div style={{ minHeight: "100vh", background: "#000" }} />;
  if (!user) return <AdminLogin onLogin={(u) => setUser(u)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Montserrat:wght@300&display=swap');

        .adm-header {
          background: #111;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 3px solid #c4001a;
          margin-bottom: 32px;
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 40px) 100%, 0 100%);
        }
        .adm-header-titles { flex: 1; }
        .adm-header-title {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 48px;
          letter-spacing: 3px;
          color: #3ce2ff;
          line-height: 1;
        }
        .adm-header-sub {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.35);
        }
        .adm-logout {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 4px;
          color: #ff2a2a;
          border: 1px solid #c4001a;
          background: none;
          padding: 8px 20px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 8px 100%);
          cursor: pointer;
          transition: background 0.15s;
        }
        .adm-logout:hover { background: rgba(196,0,26,0.15); }

        .adm-body { padding: 0 40px 60px; max-width: 860px; margin: 0 auto; }

        .adm-card {
          background: #111;
          clip-path: polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%);
          padding: 28px 32px;
          margin-bottom: 28px;
        }
        .adm-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 5px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 10px;
        }

        .adm-drop {
          border: 2px dashed rgba(60,226,255,0.35);
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 18px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
          box-sizing: border-box;
        }
        .adm-drop.over { border-color: #3ce2ff; background: rgba(60,226,255,0.05); }
        .adm-drop-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.28);
        }
        .adm-preview {
          max-width: 100%;
          max-height: 220px;
          object-fit: contain;
          margin-top: 14px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .adm-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom: 2px solid rgba(60,226,255,0.2);
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 3px;
          padding: 10px 14px;
          margin-bottom: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-bottom-color 0.2s;
        }
        .adm-input:focus { border-bottom-color: #3ce2ff; }
        .adm-input::placeholder { color: rgba(255,255,255,0.15); }
        .adm-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .adm-publish {
          background: #c4001a;
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 6px;
          border: none;
          padding: 12px 32px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 10px 100%);
          cursor: pointer;
          transition: background 0.15s;
        }
        .adm-publish:hover:not(:disabled) { background: #ff2a2a; }
        .adm-publish:disabled { opacity: 0.45; cursor: not-allowed; }

        .adm-progress {
          margin-top: 10px;
          height: 3px;
          background: rgba(255,255,255,0.08);
        }
        .adm-progress-bar {
          height: 100%;
          background: #3ce2ff;
          transition: width 0.2s;
        }

        .adm-photo-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .adm-photo-thumb {
          width: 58px;
          height: 58px;
          object-fit: cover;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          flex-shrink: 0;
        }
        .adm-photo-info { flex: 1; }
        .adm-photo-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 3px;
          color: #fff;
        }
        .adm-photo-date {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: #3ce2ff;
        }
        .adm-delete {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 12px;
          letter-spacing: 3px;
          color: #ff2a2a;
          border: 1px solid rgba(196,0,26,0.5);
          background: none;
          padding: 6px 16px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 100%, 6px 100%);
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .adm-delete:hover { background: rgba(196,0,26,0.15); }

        .adm-empty {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.2);
        }
      `}</style>

      <div className="adm-header">
        <div className="adm-header-titles">
          <div className="adm-header-title">DASHBOARD</div>
          <div className="adm-header-sub">PHOTO MANAGEMENT</div>
        </div>
        <button className="adm-logout" onClick={handleLogout}>LOGOUT</button>
      </div>

      <div className="adm-body">
        <div className="adm-card">
          <div className="adm-card-title">UPLOAD PHOTO</div>
          <form onSubmit={handlePublish}>
            <div
              className={`adm-drop${dragOver ? " over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="adm-drop-text">
                {file ? file.name : "DRAG & DROP IMAGE OR CLICK TO SELECT"}
              </div>
              {preview && <img className="adm-preview" src={preview} alt="preview" />}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
            <input
              className="adm-input"
              placeholder="TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="adm-input adm-textarea"
              placeholder="CAPTION (OPTIONAL)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <button
              className="adm-publish"
              type="submit"
              disabled={uploading || !file || !title.trim()}
            >
              {uploading ? `UPLOADING ${progress}%` : "PUBLISH"}
            </button>
            {uploading && (
              <div className="adm-progress">
                <div className="adm-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            )}
          </form>
        </div>

        <div className="adm-card">
          <div className="adm-card-title">ALL PHOTOS ({photos.length})</div>
          {photos.length === 0 && <div className="adm-empty">NO PHOTOS YET</div>}
          {photos.map((p) => (
            <div key={p.id} className="adm-photo-row">
              <img className="adm-photo-thumb" src={p.imageUrl} alt="" />
              <div className="adm-photo-info">
                <div className="adm-photo-title">{p.title}</div>
                <div className="adm-photo-date">{formatDate(p.createdAt)}</div>
              </div>
              <button className="adm-delete" onClick={() => handleDelete(p)}>DELETE</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
