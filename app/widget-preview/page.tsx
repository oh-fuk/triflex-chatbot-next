"use client";
import { useEffect } from "react";

export default function WidgetPreview() {
    useEffect(() => {
        (window as any).ChatbotConfig = { apiUrl: "" };
        const script = document.createElement("script");
        script.src = "/widget.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#f0f0f0", fontFamily: "sans-serif" }}>
            <div style={{ textAlign: "center", padding: "2rem", color: "#666", fontSize: "14px" }}>
                Widget Preview —{" "}
                <a href="/admin" style={{ color: "#7c3aed", textDecoration: "none" }}>
                    ← Back to Admin
                </a>
            </div>
        </div>
    );
}
