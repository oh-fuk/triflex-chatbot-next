import { NextRequest } from "next/server";
import { loadConfig } from "@/lib/config";

export const runtime = "nodejs";

async function* streamGemini(message: string, history: { role: string, content: string }[], config: ReturnType<typeof loadConfig>) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = config.model || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = [
        ...history.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        { role: "user", parts: [{ text: message }] }
    ];

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: config.system_prompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (raw === "[DONE]") return;
            try {
                const chunk = JSON.parse(raw);
                const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
            } catch { }
        }
    }
}

export async function POST(req: NextRequest) {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) return new Response("Empty message", { status: 400 });

    const config = loadConfig();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of streamGemini(message, history, config)) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                let clean = msg;
                if (msg.includes("429")) clean = "Rate limit reached. Please wait a moment.";
                else if (msg.includes("400")) clean = "API key issue. Please check settings.";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: clean })}\n\n`));
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

export async function OPTIONS() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
