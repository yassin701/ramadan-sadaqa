import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

interface DashboardLayoutProps {
    chat: React.ReactNode;
    explorer: React.ReactNode;
}

export default async function DashboardLayout({ chat, explorer }: DashboardLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return <DashboardClient chat={chat} explorer={explorer} />;
}
