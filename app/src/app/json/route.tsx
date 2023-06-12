import type { ServerRuntime } from "next";
import { NextRequest, NextResponse } from "next/server"

export const runtime: ServerRuntime = "nodejs"

export async function PATCH(request: NextRequest) {
    const url = request.nextUrl;
    return NextResponse.json({ message: 'Noice!' })
}
// GET
// POST
// PUT
// PATCH
// DELETE
// HEAD
// OPTIONS
export async function GET() {
    return new Response('Hi mom!')
}

export async function POST(request: Request) {
    const data = await request.json()
    return new Response('We did it!')
}
