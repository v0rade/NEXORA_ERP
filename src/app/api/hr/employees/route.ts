import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  return NextResponse.json({
    employees: dataStore.employees,
    departments: dataStore.departments,
  })
}
