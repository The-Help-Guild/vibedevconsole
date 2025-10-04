import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "moderator" | "developer";

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error, "for user", user.id);
        setRoles([]);
      } else {
        const mapped = data?.map((r) => r.role as UserRole) || [];
        console.log("Fetched roles for user", user.id, mapped);
        setRoles(mapped);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator");
  const isDeveloper = hasRole("developer");

  return { roles, hasRole, isAdmin, isModerator, isDeveloper, loading };
}
