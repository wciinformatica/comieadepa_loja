"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setError("E-mail ou senha inválidos");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            className={errors.email ? "border-red-400" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
          <Input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={errors.password ? "border-red-400" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          variant="gold"
          className="w-full font-bold mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-yellow-600 font-medium hover:text-yellow-700">
          Criar cadastro
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-slate-900">COMIEADEPA Loja</h1>
          <p className="text-slate-500 text-sm mt-1">Entre na sua conta para continuar</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-slate-400">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
