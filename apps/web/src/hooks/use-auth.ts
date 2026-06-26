"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, LoginInput, register, RegisterInput } from "@/lib/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso!");
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
