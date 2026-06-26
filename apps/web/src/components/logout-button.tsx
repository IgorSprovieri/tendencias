"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="
        cursor-pointer py-2 px-4 rounded text-xs font-bold tracking-tight
        border-2 border-[#6c6c6a] text-[#6c6c6a] bg-white
        hover:border-[#249d8c] hover:text-[#249d8c]
        transition-all duration-200 ease-in-out
        disabled:cursor-not-allowed disabled:opacity-60
      "
    >
      {isLoading ? "Saindo..." : "Sair"}
    </button>
  );
}
