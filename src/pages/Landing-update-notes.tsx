// Updated Landing.tsx - Replace the useAuth import and usage

// OLD:
// import { useAuth } from "@/hooks/use-auth";

// NEW:
import { useAuth } from "@/hooks/use-auth-clerk";
// OR after you replace the file:
// import { useAuth } from "@/hooks/use-auth";

// The rest of the Landing.tsx file remains the same!
// The useAuth hook interface stays identical:
// - isLoading: boolean
// - isAuthenticated: boolean  
// - user: User object with name, email, image
//
// So all your existing code using these properties will work unchanged.