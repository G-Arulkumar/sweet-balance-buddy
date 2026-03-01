import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  age: number | null;
  weight: number | null;
  diabetes_type: string | null;
  daily_carb_limit: number | null;
  recent_glucose_level: number | null;
}

const NO_PROFILE_FOUND = "PGRST116";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error?.code === NO_PROFILE_FOUND) {
        const { data: insertedProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name ?? null,
          })
          .select("*")
          .single();

        if (insertError) {
          throw insertError;
        }

        setProfile(insertedProfile as UserProfile);
        return;
      }

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile | null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) await fetchProfile();
    return error;
  };

  useEffect(() => {
    void fetchProfile();
  }, [user]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
