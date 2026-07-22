import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const STUDENT_SESSION_COOKIE = "mazaya_student_session";
const SESSION_DURATION = "30d";

function getSecret() {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) throw new Error("STUDENT_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface StudentSessionPayload {
  studentId: number;
  tenantId: string;
}

export async function createStudentSession(payload: StudentSessionPayload) {
  const token = await new SignJWT({ studentId: payload.studentId, tenantId: payload.tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.studentId !== "number" || typeof payload.tenantId !== "string") return null;
    return { studentId: payload.studentId, tenantId: payload.tenantId };
  } catch {
    return null;
  }
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}
