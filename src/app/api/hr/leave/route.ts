import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({
    leaveRequests: dataStore.leaveRequests,
    employees: dataStore.employees,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { employeeId, leaveType, startDate, endDate, daysCount, reason } = body

    if (!employeeId || !startDate || !endDate || !daysCount || !reason) {
      return NextResponse.json({ error: "Missing required leave request fields" }, { status: 400 })
    }

    const leave = dataStore.submitLeaveRequest({
      employeeId,
      leaveType: leaveType || "ANNUAL",
      startDate,
      endDate,
      daysCount: Number(daysCount),
      reason,
      userName: session?.name,
    })

    return NextResponse.json({ success: true, leave }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit leave request" }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { leaveId } = body

    if (!leaveId) {
      return NextResponse.json({ error: "Leave ID is required" }, { status: 400 })
    }

    const leave = dataStore.approveLeaveRequest(leaveId, session?.name || "HR Manager")
    return NextResponse.json({ success: true, leave })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to approve leave request" }, { status: 400 })
  }
}
