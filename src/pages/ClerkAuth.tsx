import { 
  SignIn, 
  SignUp, 
  useUser 
} from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ClerkAuthProps {
  redirectAfterAuth?: string;
}

function ClerkAuth({ redirectAfterAuth }: ClerkAuthProps = {}) {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const redirect = redirectAfterAuth || '/dashboard';
      navigate(redirect);
    }
  }, [isLoaded, isSignedIn, navigate, redirectAfterAuth]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Clerk SignIn component with custom styling - Email OTP + Google only */}
            <div className="clerk-auth-container">
              <SignIn
                routing="path"
                path="/auth"
                signUpUrl="/auth/sign-up"
                redirectUrl={redirectAfterAuth || '/dashboard'}
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'bg-transparent shadow-none border-none',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-gray-400',
                    socialButtonsBlockButton: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-colors',
                    socialButtonsBlockButtonText: 'text-white font-medium',
                    formFieldInput: 'bg-gray-800 border-gray-700 text-white placeholder-gray-400',
                    formButtonPrimary: 'bg-primary hover:bg-primary/90 transition-colors',
                    footerActionLink: 'text-primary hover:text-primary/90',
                    identityPreviewText: 'text-gray-300',
                    formFieldLabel: 'text-gray-300',
                    otpCodeFieldInput: 'bg-gray-800 border-gray-700 text-white',
                  },
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                    colorBackground: 'transparent',
                    colorInputBackground: 'hsl(var(--muted))',
                    colorInputText: 'hsl(var(--foreground))',
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default ClerkAuth;