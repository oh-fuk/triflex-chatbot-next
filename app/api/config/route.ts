import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";

export async function GET() {
    const config = loadConfig();
    return NextResponse.json({
        bot_name: config.bot_name,
        welcome_message: config.welcome_message,
        color: config.color,
    });
}
