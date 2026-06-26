import type { GitHubData } from "@/lib/github";

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateString));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function DashboardCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border-2 border-neutral-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-5 text-sm font-bold tracking-tight text-[#1f7c6f]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-bold tracking-tight text-[#6c6c6a]">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[#4a4a49] break-words text-left sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-start gap-0 text-left leading-none">
      <span className="text-[8px] font-medium tracking-tight text-[#6c6c6a] sm:text-[10px]">
        {label}
      </span>
      <span className="text-sm font-bold text-[#1f7c6f] sm:text-base">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function ProfileCard({ data }: { data: GitHubData }) {
  const displayName = data.name ?? data.login;

  return (
    <DashboardCard title="Principais informações" className="h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={data.avatar_url}
            alt={`Avatar de ${displayName}`}
            className="h-14 w-14 shrink-0 rounded-full border-2 border-[#249d8c] object-cover sm:h-20 sm:w-20"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm font-bold leading-tight text-[#1f7c6f] sm:text-lg">
              {displayName}
            </p>
            <div className="flex gap-4 sm:gap-6">
              <ProfileStat label="Repositórios" value={data.public_repos} />
              <ProfileStat label="Seguidores" value={data.followers} />
              <ProfileStat label="Seguindo" value={data.following} />
            </div>
          </div>
        </div>

        <p className="rounded-lg bg-[#eafbf8] px-4 py-3 text-xs leading-relaxed text-[#4a4a49] sm:text-sm">
          {data.bio ?? "Nenhuma bio encontrada"}
        </p>

        <dl className="flex flex-col gap-3">
          <InfoRow label="E-mail" value={data.email ?? "Não informado"} />
          <InfoRow label="Empresa" value={data.company ?? "Não informada"} />
          <InfoRow
            label="Localização"
            value={data.location ?? "Não informada"}
          />
          <InfoRow
            label="Conta criada em"
            value={formatDate(data.created_at)}
          />
        </dl>
      </div>
    </DashboardCard>
  );
}

function formatActivityType(type: string): string {
  const labels: Record<string, string> = {
    PushEvent: "Push",
    CreateEvent: "Criações",
    IssuesEvent: "Issues",
    WatchEvent: "Stars",
    ForkEvent: "Forks",
    PullRequestEvent: "Pull requests",
    PullRequestReviewEvent: "Revisões de PR",
    IssueCommentEvent: "Comentários em issues",
    CommitCommentEvent: "Comentários em commits",
    DeleteEvent: "Exclusões",
    MemberEvent: "Colaboradores",
    PublicEvent: "Repositório público",
    ReleaseEvent: "Releases",
    GollumEvent: "Wiki",
    PullRequestReviewCommentEvent: "Comentários em revisões",
  };

  return labels[type] ?? type.replace(/Event$/, "");
}

const ACTIVITY_COLORS = ["#249d8c", "#1f7c6f", "#54772c", "#6c6c6a"];

function ActivityChart({ data }: { data: GitHubData }) {
  const maxCount = Math.max(...data.activity.map((day) => day.count), 1);
  const totalEvents = data.activity.reduce((sum, day) => sum + day.count, 0);
  const topActivities = data.top_activities ?? [];
  const maxActivityCount = Math.max(
    ...topActivities.map((activity) => activity.count),
    1,
  );

  return (
    <DashboardCard
      title="Atividade nos últimos 30 dias"
      className="flex h-full flex-col"
    >
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-[#6c6c6a]">
          <span className="text-xl font-bold text-[#1f7c6f]">
            {formatNumber(totalEvents)}
          </span>{" "}
          eventos registrados
        </p>

        <div className="flex min-h-20 flex-1 flex-col gap-1">
          <div className="flex flex-1 items-end gap-1">
            {data.activity.map((day) => {
              const height = day.count === 0 ? 4 : (day.count / maxCount) * 100;

              return (
                <div
                  key={day.date}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className="w-full rounded-t bg-[#249d8c] transition-colors group-hover:bg-[#1f7c6f]"
                    style={{
                      height: `${height}%`,
                      minHeight: day.count > 0 ? 8 : 4,
                    }}
                    title={`${formatShortDate(day.date)}: ${day.count} evento(s)`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-medium tracking-tight text-stone-400">
            <span>{formatShortDate(data.activity[0]?.date ?? "")}</span>
            <span>
              {formatShortDate(
                data.activity[data.activity.length - 1]?.date ?? "",
              )}
            </span>
          </div>
        </div>

        {topActivities.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
            <h3 className="text-sm font-bold tracking-tight text-[#1f7c6f]">
              Principais Atividades
            </h3>
            <div className="flex gap-4">
              <ol className="flex flex-1 flex-col justify-center gap-2">
                {topActivities.map((activity, index) => (
                  <li key={activity.type} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
                      }}
                    />
                    <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-medium text-[#4a4a49]">
                        {formatActivityType(activity.type)}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-[#1f7c6f]">
                        {formatNumber(activity.count)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex flex-1 flex-col justify-center gap-2">
                {topActivities.map((activity, index) => (
                  <div
                    key={activity.type}
                    className="h-2.5 overflow-hidden rounded-full bg-neutral-100"
                    title={`${formatActivityType(activity.type)}: ${formatNumber(activity.count)}`}
                  >
                    <div
                      className="h-full rounded-full transition-opacity hover:opacity-80"
                      style={{
                        width: `${(activity.count / maxActivityCount) * 100}%`,
                        backgroundColor:
                          ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
            <h3 className="text-sm font-bold tracking-tight text-[#1f7c6f]">
              Principais Atividades
            </h3>
            <p className="text-xs text-stone-500">
              Nenhuma atividade registrada nos últimos 30 dias.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

function TopReposCard({ data }: { data: GitHubData }) {
  return (
    <DashboardCard title="Projetos mais relevantes">
      {data.top_repos.length === 0 ? (
        <p className="text-sm text-stone-500">Nenhum repositório encontrado.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.top_repos.map((repo, index) => (
            <li
              key={repo.html_url}
              className="flex gap-4 rounded-lg border border-neutral-100 bg-[#f6f6f6] p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f7c6f] text-sm font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#54772c] underline"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6c6c6a]">
                    {repo.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#4a4a49]">
                  <span>★ {formatNumber(repo.stargazers_count)}</span>
                  {repo.language && (
                    <span className="rounded-full bg-[#e9f6dc] px-2 py-0.5 text-[#54772c]">
                      {repo.language}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Java: "#b07219",
  Go: "#00add8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4f5d95",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#fa7343",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

function LanguagesCard({ data }: { data: GitHubData }) {
  const topLanguages = data.languages.slice(0, 8);

  return (
    <DashboardCard title="Linguagens mais usadas">
      {topLanguages.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nenhuma linguagem encontrada nos repositórios.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {topLanguages.map((language) => {
            const color = LANGUAGE_COLORS[language.name] ?? "#1f7c6f";

            return (
              <div key={language.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#4a4a49]">{language.name}</span>
                  <span className="text-[#6c6c6a]">{language.percentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${language.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}

export function Dashboard({ data }: { data: GitHubData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ProfileCard data={data} />
      <ActivityChart data={data} />
      <TopReposCard data={data} />
      <LanguagesCard data={data} />
    </div>
  );
}
