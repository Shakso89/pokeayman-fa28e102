import type { Provider } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: string, opts?: SignInOptions) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: opts?.redirect_uri || (typeof window !== "undefined" ? `${window.location.origin}/classes` : undefined),
          queryParams: opts?.extraParams,
        },
      });

      if (error) {
        return { error };
      }

      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
        return { redirected: true };
      }

      return { redirected: false };
    },
  },
};
