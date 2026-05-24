import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface ContractantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

async function getNavbarUserInfo(): Promise<{ userName: string; userInitial: string; userCompany: string }> {
  const fallback = { userName: "Utilisateur", userInitial: "U", userCompany: "" };
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return fallback;

    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
    if (!meRes.ok) return fallback;
    const meData = await meRes.json();
    const userId = meData?.user?.userId;
    const email = meData?.user?.email || "";
    if (!userId) return { ...fallback, userName: email };

    let userName = email;
    let userCompany = "";

    const profileRes = await fetch(`${baseUrl}/api/v1/users/profiles/user/${userId}`, {
      method: "GET",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    }).catch(() => null);
    if (profileRes?.ok) {
      const profile = await profileRes.json();
      const fullName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim();
      if (fullName) userName = fullName;
    }

    const scRes = await fetch(`${baseUrl}/api/v1/users/services-contractants?page=1&limit=100`, {
      method: "GET",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    }).catch(() => null);
    if (scRes?.ok) {
      const scData = await scRes.json();
      const list = Array.isArray(scData) ? scData : scData?.data || [];
      const normalizedUserId = userId.trim().toLowerCase();
      const current = list.find((item: { userId?: string; user_id?: string }) =>
        (item.userId || item.user_id || "").trim().toLowerCase() === normalizedUserId
      );
      if (current?.organisation?.denomination) {
        userCompany = current.organisation.denomination;
      }
    }

    const userInitial = userName.charAt(0).toUpperCase();
    return { userName, userInitial, userCompany };
  } catch {
    return fallback;
  }
}

export default async function ContractantLayout({
  children,
  params,
}: ContractantLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;

  if (userType === "admin") {
    redirect(`/${locale}/dashboard/admin/id/tableau-de-bord`);
  }

  if (userType === "operateur") {
    redirect(`/${locale}/dashboard/operateur/tableau-de-bord`);
  }

  const [commonDict, navUser] = await Promise.all([
    getDictionary(locale as Locale),
    getNavbarUserInfo(),
  ]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f1f5f9" }}
    >
      <Navbar
        isLoggedIn={true}
        userInitial={navUser.userInitial}
        userName={navUser.userName}
        userCompany={navUser.userCompany}
        userRole="CONTRACTANT"
        dict={commonDict.navbar}
        locale={locale as Locale}
      />
      <div className="flex flex-1">
        <Sidebar
          locale={locale as Locale}
          role="contractant"
          dict={commonDict.sidebar}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
