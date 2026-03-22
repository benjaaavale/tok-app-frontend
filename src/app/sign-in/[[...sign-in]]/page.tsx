"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

export default function SignInRoute() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { setActive } = useClerk();
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

  // Step 1: User submits email — send ONE email code
  const handleEmailSubmit = async (email: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    try {
      // Create sign-in attempt (without strategy — doesn't send email yet)
      const attempt = await signIn.create({ identifier: email });

      // Now prepare the first factor — THIS sends the single email
      const emailFactor = (attempt.supportedFirstFactors as any)?.find(
        (f: any) => f.strategy === "email_code"
      );
      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
      }
    } catch (err: any) {
      // If user not found, create a new account
      if (err?.errors?.[0]?.code === "form_identifier_not_found") {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        throw new Error(err?.errors?.[0]?.longMessage || "Error enviando codigo");
      }
    }
  };

  // Step 2: User submits OTP code — verify and set session
  const handleCodeSubmit = async (code: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    // Try sign-in verification first
    if (signIn.status === "needs_first_factor") {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Small delay so the success animation plays
        setTimeout(() => router.push("/dashboard"), 2200);
        return;
      }
    }

    // Try sign-up verification
    if (signUp.status === "missing_requirements" || signUp.verifications?.emailAddress?.status === "unverified") {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setTimeout(() => router.push("/dashboard"), 2200);
        return;
      }
    }

    throw new Error("Codigo invalido. Intenta de nuevo.");
  };

  // Resend code
  const handleResendCode = async () => {
    if (!signIn || !signUp) return;
    try {
      if (signIn.status === "needs_first_factor") {
        const emailFactor = (signIn.supportedFirstFactors as any)?.find(
          (f: any) => f.strategy === "email_code"
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
        }
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
    } catch {
      // Silently fail resend
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
