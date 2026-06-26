"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout, updateUser, type User } from "@/lib/auth";

const inputClassName =
  "peer px-4 py-3 bg-white rounded border-2 border-neutral-400 justify-start items-center gap-6 inline-flex text-[#6c6c6a] text-xs font-medium tracking-tight hover:border-[#249d8c] focus:border-[#249d8c] focus:outline-none focus:shadow w-full self-stretch";

type UserMenuProps = {
  user: Pick<User, "name" | "github_user">;
};

function EditUserModal({
  user,
  onClose,
}: {
  user: Pick<User, "name" | "github_user">;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [githubUser, setGithubUser] = useState(user.github_user);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setGithubUser(user.github_user);
  }, [user.name, user.github_user]);

  const isFormFilled = name.length > 0 && githubUser.length > 0;
  const hasChanges =
    name !== user.name || githubUser !== user.github_user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormFilled || !hasChanges) {
      return;
    }

    setIsSaving(true);

    try {
      await updateUser({
        name,
        github_user: githubUser,
      });
      toast.success("Usuário atualizado com sucesso.");
      onClose();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar usuário.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border-2 border-neutral-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
      >
        <h2
          id="edit-user-title"
          className="mb-5 text-sm font-bold tracking-tight text-[#1f7c6f]"
        >
          Editar usuário
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-user-name"
              className="text-xs font-bold tracking-tight text-[#6c6c6a]"
            >
              Nome
            </label>
            <input
              id="edit-user-name"
              type="text"
              name="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-user-github"
              className="text-xs font-bold tracking-tight text-[#6c6c6a]"
            >
              Usuário do GitHub
            </label>
            <input
              id="edit-user-github"
              type="text"
              name="github_user"
              placeholder="seu-usuario"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="
                cursor-pointer rounded border-2 border-[#6c6c6a] bg-white px-4 py-2
                text-xs font-bold tracking-tight text-[#6c6c6a]
                transition-all duration-200 ease-in-out
                hover:border-[#249d8c] hover:text-[#249d8c]
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormFilled || !hasChanges || isSaving}
              className="
                cursor-pointer rounded border-2 border-[#6c6c6a] bg-[#6c6c6a] px-4 py-2
                text-xs font-bold tracking-tight text-[#f6f6f6]
                transition-all duration-200 ease-in-out
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsMenuOpen(false);

    try {
      await logout();
      toast.success("Sessão encerrada com sucesso.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao encerrar sessão.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    setIsEditOpen(true);
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          disabled={isLoggingOut}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="
            cursor-pointer rounded border-2 border-[#6c6c6a] bg-white px-4 py-2
            text-xs font-bold tracking-tight text-[#6c6c6a]
            transition-all duration-200 ease-in-out
            hover:border-[#249d8c] hover:text-[#249d8c]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          Menu
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 min-w-[180px] overflow-hidden rounded-lg border-2 border-neutral-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleEdit}
              className="
                w-full cursor-pointer px-4 py-2 text-left text-xs font-medium
                tracking-tight text-[#4a4a49] transition-colors
                hover:bg-[#eafbf8] hover:text-[#1f7c6f]
              "
            >
              Editar usuário
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="
                w-full cursor-pointer px-4 py-2 text-left text-xs font-medium
                tracking-tight text-[#4a4a49] transition-colors
                hover:bg-[#eafbf8] hover:text-[#1f7c6f]
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        )}
      </div>

      {isEditOpen && (
        <EditUserModal user={user} onClose={() => setIsEditOpen(false)} />
      )}
    </>
  );
}
