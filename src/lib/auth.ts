import { supabase } from "@/lib/supabase";

export function isPremium(subscription: any): boolean {
  if (!subscription) return false
  return subscription.status === 'premium' && subscription.current_period_end && new Date(subscription.current_period_end) > new Date()
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