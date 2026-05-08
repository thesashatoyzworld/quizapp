import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

async function supabaseQuery(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options?.headers,
    },
  });
  return res;
}

// POST — save a new SYNC waitlist entry
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-api-secret");
    if (secret !== process.env.BOT_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { telegramId, username, firstName, tier } = await req.json();
    if (!telegramId || !tier) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const res = await supabaseQuery("sync_waitlist", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        telegram_id: telegramId,
        username: username || null,
        first_name: firstName || null,
        tier,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET — fetch all SYNC waitlist entries
export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-api-secret");
    let isAuthed = secret === process.env.BOT_TOKEN;
    if (!isAuthed) {
      try {
        const session = await getAdminSession();
        isAuthed = !!session;
      } catch {
        // cookies() can throw
      }
    }
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await supabaseQuery("sync_waitlist?select=*&order=created_at.desc");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
