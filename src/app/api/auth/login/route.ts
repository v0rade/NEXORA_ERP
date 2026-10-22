import { NextRequest, NextResponse } from "next/server"
import { setSessionCookie } from "@/lib/auth"
import { DEMO_COMPANY, DEMO_USERS } from "@/lib/demo-data"
import { Role } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role } = body

    // Support both direct demo role selection and email/password
    let matchedUser = DEMO_USERS.find((u) => u.email.toLowerCase() === (email || "").toLowerCase())

    if (!matchedUser && role) {
      matchedUser = DEMO_USERS.find((u) => u.role === role)
    }

    if (!matchedUser) {
      // Default to Company Admin if test login
      matchedUser = DEMO_USERS[1]
    }

    const payload = {
      userId: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      companyId: DEMO_COMPANY.id,
      companyName: DEMO_COMPANY.name,
      companySlug: DEMO_COMPANY.slug,
      role: matchedUser.role as Role,
    }

    await setSessionCookie(payload)

    return NextResponse.json({
      success: true,
      user: payload,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed" },
      { status: 400 }
    )
  }
}
