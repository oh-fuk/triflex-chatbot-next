"use client";
import { useEffect } from "react";

export default function WidgetPreview() {
    useEffect(() => {
        (window as any).ChatbotConfig = { apiUrl: window.location.origin };
        const existing = document.getElementById("cb-widget");
        if (existing) existing.remove();
        const script = document.createElement("script");
        script.src = "/widget.js?v=" + Date.now();
        script.async = true;
        document.body.appendChild(script);
        return () => {
            try { document.body.removeChild(script); } catch { }
            const w = document.getElementById("cb-widget");
            if (w) w.remove();
        };
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "sans-serif" }}>
            <div style={{ textAlign: "center", padding: "2rem", color: "#666", fontSize: "14px" }}>
                Widget Preview — <a href="/admin" style={{ color: "#0ea5e9", textDecoration: "none" }}>← Back to Admin</a>
            </div>
        </div>
    );
}
