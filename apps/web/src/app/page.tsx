import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { UserMenu } from "@/components/user-menu";
import { TendenciasLogo } from "@/components/tendencias-logo";
import { fetchGithubData } from "@/lib/github";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const githubData = await fetchGithubData();

  return (
    <div className="min-h-[calc(100dvh)] bg-[#f6f6f6]">
      <header
        className="border-b border-[#249d8c]/20 bg-cover bg-center px-6 py-4"
        style={{
          backgroundImage: "url('/assets/svg/background-pattern.svg')",
          backgroundColor: "#1f7c6f",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="w-[180px] sm:w-[220px]">
            <TendenciasLogo />
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-right text-sm font-medium text-white sm:block">
              Olá, <span className="font-bold">{user.name}</span>
            </p>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1f7c6f]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#6c6c6a]">
            Visão geral do perfil GitHub de{" "}
            <span className="font-semibold text-[#54772c]">
              @{user.github_user}
            </span>
          </p>
        </div>

        {githubData ? (
          <Dashboard data={githubData} />
        ) : (
          <div className="rounded-xl border-2 border-neutral-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-[#6c6c6a]">
              Não foi possível carregar os dados do GitHub no momento.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Verifique se o usuário do GitHub cadastrado está correto e tente
              novamente mais tarde.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
