"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase-ympäristömuuttujat puuttuvat.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
        Sähköposti
        <input
          className="focus-ring rounded-md border border-[#B9C9E4] px-3 py-2 font-normal"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#0D2956]">
        Salasana
        <input
          className="focus-ring rounded-md border border-[#B9C9E4] px-3 py-2 font-normal"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {message ? <p className="rounded-md bg-[#FBEAEA] p-3 text-sm text-[#8F1D1D]">{message}</p> : null}
      <button
        className="focus-ring rounded-md bg-[#0A3A8F] px-4 py-2 font-semibold text-white disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Kirjaudutaan..." : "Kirjaudu"}
      </button>
    </form>
  );
}
