"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [config, setConfig] = useState({
        bot_name: "", welcome_message: "", color: "#4f46e5",
        system_prompt: "", model: "gemini-2.5-flash"
    });

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`);
        if (res.ok) { setConfig(await res.json()); setLoggedIn(true); }
        else setError("Wrong password");
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...config, password }),
        });
        if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    };

    const embedCode = `<!-- Triflex Media Chatbot -->
<script>
  window.ChatbotConfig = { apiUrl: "${typeof window !== "undefined" ? window.location.origin : ""}" };
</script>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"></script>`;

    if (!loggedIn) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0ea5e9,#7c3aed)" }}>
            <div style={{ background: "white", padding: "2.5rem", borderRadius: "16px", width: "360px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Chatbot Admin</h1>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Sign in to manage your chatbot</p>
                {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}
                <form onSubmit={login}>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Enter admin password" required autoFocus
                        style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "1rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" }} />
                    <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(135deg,#0ea5e9,#7c3aed)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
            <aside style={{ width: "220px", background: "#1e293b", color: "white", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem", position: "fixed", top: 0, left: 0, bottom: 0 }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, padding: "0.5rem", color: "#a5b4fc", marginBottom: "1rem" }}>🤖 ChatAdmin</div>
                <a href="#settings" style={{ display: "block", padding: "0.65rem 0.75rem", borderRadius: "8px", color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>⚙️ Settings</a>
                <a href="#embed" style={{ display: "block", padding: "0.65rem 0.75rem", borderRadius: "8px", color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>🔗 Embed Code</a>
                <a href="/widget-preview" target="_blank" style={{ display: "block", padding: "0.65rem 0.75rem", borderRadius: "8px", color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>👁️ Preview</a>
                <a href="#" onClick={() => setLoggedIn(false)} style={{ display: "block", padding: "0.65rem 0.75rem", borderRadius: "8px", color: "#f87171", textDecoration: "none", fontSize: "0.9rem", marginTop: "auto" }}>🚪 Logout</a>
            </aside>
            <main style={{ marginLeft: "220px", padding: "2rem 2.5rem", flex: 1, maxWidth: "800px" }}>
                {saved && <div style={{ background: "#dcfce7", color: "#166534", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>✅ Settings saved!</div>}
                <section id="settings">
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Chatbot Settings</h2>
                    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {[["Bot Name", "bot_name", "text"], ["Welcome Message", "welcome_message", "text"]].map(([label, key, type]) => (
                            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                                <input type={type} value={(config as Record<string, string>)[key]} onChange={e => setConfig({ ...config, [key]: e.target.value })}
                                    style={{ padding: "0.7rem 0.9rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
                            </div>
                        ))}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Theme Color</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <input type="color" value={config.color} onChange={e => setConfig({ ...config, color: e.target.value })} style={{ width: "48px", height: "40px", padding: "2px", cursor: "pointer", borderRadius: "6px", border: "2px solid #e2e8f0" }} />
                                <span style={{ fontFamily: "monospace", color: "#64748b" }}>{config.color}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gemini Model</label>
                            <select value={config.model} onChange={e => setConfig({ ...config, model: e.target.value })}
                                style={{ padding: "0.7rem 0.9rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }}>
                                <option value="gemini-2.5-flash">gemini-2.5-flash (Latest)</option>
                                <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Fast)</option>
                                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Prompt</label>
                            <textarea value={config.system_prompt} onChange={e => setConfig({ ...config, system_prompt: e.target.value })} rows={8}
                                style={{ padding: "0.7rem 0.9rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
                        </div>
                        <button type="submit" style={{ padding: "0.8rem 2rem", background: "linear-gradient(135deg,#0ea5e9,#7c3aed)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", alignSelf: "flex-start" }}>
                            💾 Save Settings
                        </button>
                    </form>
                </section>
                <section id="embed" style={{ marginTop: "3rem" }}>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>Embed on WordPress</h2>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>Paste in <strong>Appearance → Theme Editor → footer.php</strong> before <code>&lt;/body&gt;</code></p>
                    <div style={{ position: "relative", background: "#0f172a", borderRadius: "10px", padding: "1.25rem" }}>
                        <button onClick={() => navigator.clipboard.writeText(embedCode)}
                            style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "#334155", color: "white", border: "none", borderRadius: "6px", padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}>
                            📋 Copy
                        </button>
                        <pre style={{ color: "#a5f3fc", fontSize: "0.85rem", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{embedCode}</pre>
                    </div>
                </section>
            </main>
        </div>
    );
}
