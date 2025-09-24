// Legacy Auth component - redirects to new Clerk authentication
// This file is kept for backward compatibility but should use ClerkAuth.tsx instead

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new Clerk auth page
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-white text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Redirecting to Sign In...</h2>
        <p className="text-gray-300">Please wait while we redirect you to the new authentication page.</p>
      </div>
    </div>
  );
}

export default Auth;