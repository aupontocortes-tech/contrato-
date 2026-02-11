import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "inline-2025-02-11",
    message: "Se você vê isto, o servidor está com o código novo.",
  });
}
