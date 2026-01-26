import { supabase } from "@/lib/supabase";

export function isPremium(subscription: any): boolean {
  if (!subscription) return false;
  return (
    subscription.status === "premium" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) > new Date()
  );
}

export async function getUserSubscription(userId: string) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] getUserSubscription error:", error);
    return null;
  }

  return data ?? null;
}

/**
 * Cria conta no Supabase Auth.
 * Ajuste se sua tela de signup pede campos diferentes.
 */
export async function signUp(params: {
  email: string;
  password: string;
  name?: string;
}) {
  const { email, password, name } = params;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    console.error("[auth] signUp error:", error);
    throw error;
  }

  return data;
}

export async function signIn(params: { email: string; password: string }) {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[auth] signIn error:", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] signOut error:", error);
    throw error;
  }
}
