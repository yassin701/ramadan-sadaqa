import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/");
    }

    return <LoginClient />;
}
