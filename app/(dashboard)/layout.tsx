import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const rows = await prisma.$queryRaw<
    Array<{
      userId: string;
      userName: string;
      expiresAt: Date;
    }>
  >`
    SELECT
      u."id" AS "userId",
      u."name" AS "userName",
      s."expiresAt" AS "expiresAt"
    FROM "Session" s
    INNER JOIN "User" u ON u."id" = s."userId"
    WHERE s."token" = ${sessionToken}
    LIMIT 1
  `;

  const session = rows[0];

  if (!session || session.expiresAt <= new Date()) {
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect("/login");
  }

  async function logout() {
    "use server";

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (sessionToken) {
      await prisma.$executeRaw`
        DELETE FROM "Session"
        WHERE "token" = ${sessionToken}
      `;
    }

    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        {/* Sidebar: shared navigation for the dashboard pages. */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Vector Labs POS
            </p>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              Dashboard
            </h1>
          </div>

          {/* Navigation links for shared app sections. */}
          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Overview
            </Link>

            <Link
              href="/products"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Products
            </Link>

            <Link
              href="/sales"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sales
            </Link>
          </nav>
        </aside>

        {/* Main content area: header + current page content. */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Vector Labs POS
                </p>
                <p className="text-base font-semibold text-slate-900">
                  Signed in as {session.userName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Home
                </Link>

                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Overview
                </Link>

                <Link
                  href="/products"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Products
                </Link>

                <Link
                  href="/sales"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sales
                </Link>

                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>

          {/* The active page is rendered here. */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
