import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { DEMO_USERS, DEMO_COMPANY } from "@/lib/demo-data"
import { Role } from "@prisma/client"

export async function GET() {
  const session = await getSessionUser()
  if (session) {
    return NextResponse.json({ authenticated: true, user: session })
  }

  // Fallback default demo user for seamless evaluation
  const fallback = {
    userId: DEMO_USERS[1].id,
    email: DEMO_USERS[1].email,
    name: DEMO_USERS[1].name,
    companyId: DEMO_COMPANY.id,
    companyName: DEMO_COMPANY.name,
    companySlug: DEMO_COMPANY.slug,
    role: DEMO_USERS[1].role as Role,
  }

  return NextResponse.json({ authenticated: true, user: fallback, isDemoDefault: true })
}
