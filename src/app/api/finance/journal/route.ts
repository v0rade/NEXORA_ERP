import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({
    journalEntries: dataStore.journalEntries,
    accounts: dataStore.accounts,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { description, lines, referenceType, referenceId } = body

    if (!description || !lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json(
        { error: "Description and at least two balanced lines are required." },
        { status: 400 }
      )
    }

    const entry = dataStore.createJournalEntry({
      description,
      lines,
      referenceType,
      referenceId,
      userName: session?.name,
    })

    return NextResponse.json({ success: true, entry }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post journal entry" }, { status: 400 })
  }
}
