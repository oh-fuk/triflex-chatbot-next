import { NextRequest, NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/config";

export async function GET(req: NextRequest) {
    const pass = req.nextUrl.searchParams.get("password");
    if (pass !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(loadConfig());
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    if (body.password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { password: _, ...config } = body;
    saveConfig(config);
    return NextResponse.json({ success: true });
}
