import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useConvexAuth } from 'convex/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useAuth() {
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const { isLoading: isConvexLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  
  // Get user data from Convex (synced from Clerk)
  const convexUser = useQuery(api.users.currentUser);

  // Calculate loading state
  const isLoading = !isClerkLoaded || isConvexLoading || (isSignedIn && !convexUser);

  // User is authenticated if both Clerk and Convex agree
  const isAuthenticated = isSignedIn && isConvexAuthenticated;

  // Sign out function that handles both Clerk and Convex
  const signOut = async () => {
    await clerkSignOut();
  };

  // Format user data consistently
  const user = convexUser ? {
    _id: convexUser._id,
    name: convexUser.name || clerkUser?.fullName,
    email: convexUser.email || clerkUser?.primaryEmailAddress?.emailAddress,
    image: convexUser.image || clerkUser?.imageUrl,
    // Additional fields from Convex user
    role: convexUser.role,
    age: convexUser.age,
    weight: convexUser.weight,
  } : null;

  return {
    isLoading,
    isAuthenticated,
    user,
    signOut,
    // Clerk-specific data for components that need it
    clerkUser,
  };
}