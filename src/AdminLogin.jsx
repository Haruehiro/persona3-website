import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth) { setError("FIREBASE NOT CONFIGURED"); return; }
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      onLogin(cred.user);
    } catch (err) {
      const msg = err.message
        .replace("Firebase: ", "")
        .replace(/\s*\(auth\/[^)]+\)\.?/, "")
        .toUpperCase();
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="menu-screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap');

        .al-card {
          background: #111;
          clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 24px 100%);
          padding: 48px 56px 52px;
          width: 420px;
          position: relative;
          box-sizing: border-box;
        }
        .al-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: #c4001a;
          clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 24px 100%);
        }
        .al-title {
          font-family: 'Anton', sans-serif;
          font-style: italic;
          font-size: 72px;
          letter-spacing: 3px;
          color: #3ce2ff;
          line-height: 1;
          margin-bottom: 4px;
        }
        .al-subtitle {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 36px;
        }
        .al-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom: 2px solid rgba(60,226,255,0.2);
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 3px;
          padding: 12px 16px;
          margin-bottom: 16px;
          outline: none;
          box-sizing: border-box;
          transition: border-bottom-color 0.2s ease;
        }
        .al-input:focus { border-bottom-color: #3ce2ff; }
        .al-input::placeholder { color: rgba(255,255,255,0.2); }
        .al-btn {
          width: 100%;
          margin-top: 8px;
          background: #c4001a;
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 6px;
          border: none;
          padding: 14px;
          clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%);
          cursor: pointer;
          transition: background 0.15s ease;
          box-sizing: border-box;
        }
        .al-btn:hover:not(:disabled) { background: #ff2a2a; }
        .al-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .al-error {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: #ff2a2a;
          margin-top: 12px;
          text-align: center;
          line-height: 1.4;
        }
      `}</style>

      <div className="al-card">
        <div className="al-title">ADMIN</div>
        <div className="al-subtitle">AUTHENTICATION REQUIRED</div>
        <form onSubmit={handleSubmit}>
          <input
            className="al-input"
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="al-input"
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button className="al-btn" type="submit" disabled={loading}>
            {loading ? "..." : "ENTER"}
          </button>
          {error && <div className="al-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
