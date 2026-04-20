import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-constants";
import {
  generateSessionId,
  generateSessionToken,
  getSessionExpiryDate,
  verifyPassword,
} from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage =
    params.error === "invalid"
      ? "Invalid email or password."
      : params.error === "missing"
        ? "Please enter both email and password."
        : null;

  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const nextPath = formData.get("next")?.toString() || "/dashboard";

    if (!email || !password) {
      redirect(`/login?error=missing&next=${encodeURIComponent(nextPath)}`);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.password)) {
      redirect(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
    }

    const sessionToken = generateSessionToken();
    const sessionId = generateSessionId();
    const expiresAt = getSessionExpiryDate();

    await prisma.$executeRaw`
      INSERT INTO "Session" ("id", "token", "userId", "expiresAt", "createdAt")
      VALUES (${sessionId}, ${sessionToken}, ${user.id}, ${expiresAt}, ${new Date()})
    `;

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      expires: expiresAt,
    });

    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-950">
      <section className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
              Vector Labs POS
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight">
              Sign in to manage products, sales, and invoices.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
              This login page is now connected to real credential checking and
              session creation using an httpOnly cookie.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-300">Current status</p>
            <p className="mt-2 text-xl font-semibold text-white">
              Auth flow is wired
            </p>
          </div>
        </div>

        <div className="w-full p-8 sm:p-10 lg:w-1/2">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Login
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Enter your account details to continue to the dashboard.
            </p>

            <form action={login} className="mt-8 space-y-5">
              <input type="hidden" name="next" value={params.next ?? "/dashboard"} />

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                  placeholder="admin@vectorlabspos.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400"
                  placeholder="Enter your password"
                />
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
