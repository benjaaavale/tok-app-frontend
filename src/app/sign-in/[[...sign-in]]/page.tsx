"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

export default function SignInRoute() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    if (!signInLoaded || !signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  // Step 1: User submits email — create a sign-in or sign-up attempt with email code
  const handleEmailSubmit = async (email: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    // First try to sign in. If user doesn't exist, fall back to sign up
    try {
      const attempt = await signIn.create({
        identifier: email,
        strategy: "email_code",
      } as any);
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (attempt.supportedFirstFactors as any)?.find(
          (f: any) => f.strategy === "email_code"
        )?.emailAddressId ?? "",
      });
    } catch (err: any) {
      // If user not found, create a new account
      if (err?.errors?.[0]?.code === "form_identifier_not_found") {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        throw new Error(err?.errors?.[0]?.longMessage || "Failed to send code");
      }
    }
  };

  // Step 2: User submits OTP code
  const handleCodeSubmit = async (code: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    // Try sign-in verification first
    if (signIn.status === "needs_first_factor") {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (result.status === "complete") {
        router.push("/dashboard");
        return;
      }
    }

    // Try sign-up verification
    if (signUp.status === "missing_requirements" || signUp.verifications?.emailAddress?.status === "unverified") {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        router.push("/dashboard");
        return;
      }
    }

    throw new Error("Codigo invalido. Intenta de nuevo.");
  };

  // Resend code
  const handleResendCode = async () => {
    if (!signIn || !signUp) return;
    if (signIn.status === "needs_first_factor") {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (signIn.supportedFirstFactors as any)?.find(
          (f: any) => f.strategy === "email_code"
        )?.emailAddressId ?? "",
      });
    } else {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    }
  };

  return (
    <SignInPage
      onGoogleSignIn={handleGoogleSignIn}
      onEmailSubmit={handleEmailSubmit}
      onCodeSubmit={handleCodeSubmit}
      onResendCode={handleResendCode}
    />
  );
}
