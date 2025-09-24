import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoading: convexLoading, isAuthenticated: convexAuthenticated } = useConvexAuth();
  
  const syncUser = useMutation(api.users.syncUserFromClerk);
  const convexUser = useQuery(api.users.currentUser);

  // Sync Clerk user to Convex when user loads
  useEffect(() => {
    if (clerkUser && convexAuthenticated) {
      syncUser({
        clerkUserId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || "",
        imageUrl: clerkUser.imageUrl,
      }).catch(console.error);
    }
  }, [clerkUser, convexAuthenticated, syncUser]);

  const signOut = async () => {
    await clerkSignOut();
  };

  return {
    user: convexUser || null,
    isLoading: !isLoaded || convexLoading,
    isAuthenticated: convexAuthenticated,
    signOut,
    clerkUser,
  };
}