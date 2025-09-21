import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const setName = useMutation(api.users.setName);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const f = (formData.get("firstName") as string) || "";
      const l = (formData.get("lastName") as string) || "";
      setFirstName(f);
      setLastName(l);

      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      if (firstName.trim() || lastName.trim()) {
        try {
          await setName({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });
        } catch {}
      }
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to login as guest."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-zinc-900 to-black text-white p-6">
      <div className="flex-grow flex items-center justify-center">
        <Card className="max-w-md w-full bg-black/70 backdrop-blur-lg border border-red-700 rounded-lg shadow-xl">
          {step === "signIn" ? (
            <>
              <CardHeader className="pt-10 px-6 pb-4">
                <img
                  src="./ashu_anime_gym.png"
                  alt="Gym Logo"
                  className="mx-auto mb-6 cursor-pointer rounded-lg"
                  width={72}
                  height={72}
                  onClick={() => navigate("/")}
                />
                <CardTitle className="text-4xl font-extrabold text-transparent bg-gradient-to-tr from-red-600 to-pink-600 bg-clip-text">
                  Get Started
                </CardTitle>
                <CardDescription className="text-red-400 mt-2">
                  Enter your email to log in
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleEmailSubmit} className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <Label htmlFor="firstName" className="font-semibold text-red-400">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="bg-black bg-opacity-80 border border-red-700 text-red-300 placeholder-red-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-semibold text-red-400">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="bg-black bg-opacity-80 border border-red-700 text-red-300 placeholder-red-600"
                      required
                    />
                  </div>
                </div>

                <div className="relative flex items-center gap-2">
                  <Mail className="absolute left-3 top-3 text-red-700" />
                  <Input
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    disabled={isLoading}
                    className="pl-10 bg-black bg-opacity-80 border border-red-700 text-red-300 placeholder-red-600"
                    required
                    aria-label="Email address"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="border border-red-600 bg-gradient-to-r from-red-700 to-pink-700 hover:from-pink-700 hover:to-red-700 text-white"
                    aria-label="Send verification code"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {error && (
                  <p className="mt-4 text-red-600 text-center">{error}</p>
                )}

                <div className="mt-8">
                  <div className="flex items-center justify-center space-x-3 text-red-500 text-xs uppercase tracking-widest mb-6">
                    <div className="w-20 border-t border-red-600"></div>
                    <div>Or</div>
                    <div className="w-20 border-t border-red-600"></div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full border border-red-600 bg-gradient-to-r from-red-700 to-pink-700 hover:from-pink-700 hover:to-red-700 text-white font-semibold"
                  >
                    <UserX className="mr-2" /> Continue as Guest
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="pt-10 px-6 pb-4 text-center">
                <CardTitle className="text-4xl font-extrabold text-transparent bg-gradient-to-tr from-red-600 to-pink-600 bg-clip-text">
                  Check your email
                </CardTitle>
                <CardDescription className="text-red-400 mt-2">
                  Verification code sent to <strong>{(step as {email:string}).email}</strong>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit} className="px-6 pb-6">
                <input type="hidden" name="email" value={(step as {email:string}).email} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center mb-6">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    className="border border-red-600 text-red-300 placeholder-red-600"
                    aria-label="One time password input"
                  >
                    <InputOTPGroup>
                      {Array(6)
                        .fill(null)
                        .map((_, idx) => (
                          <InputOTPSlot key={idx} index={idx} />
                        ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="mb-6 text-red-600 text-center">{error}</p>
                )}
                <div className="mb-6 text-center text-xs text-red-400">
                  Didn't receive code? <Button variant="link" onClick={() => setStep("signIn")} className="underline text-red-400">Resend</Button>
                </div>
                <CardFooter className="flex flex-col space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="bg-gradient-to-tr from-red-700 to-pink-700 hover:from-pink-700 hover:to-red-700 text-white"
                    aria-label="Verify code"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Verifying…
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    variant="link"
                    className="text-red-400"
                  >
                    Change Email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
          <div className="mt-8 text-center text-xs text-red-600 select-none">
            Powered by <a href="https://vly.ai" className="underline hover:text-red-400" target="_blank" rel="noreferrer">vly.ai</a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: any) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
