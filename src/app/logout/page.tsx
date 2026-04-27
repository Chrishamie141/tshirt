import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userCookieName } from "@/lib/auth";

export default async function LogoutPage() {
  const cookieStore = await cookies();
  cookieStore.set(userCookieName(), "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  redirect("/");
}
