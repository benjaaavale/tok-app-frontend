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

  // Step 1: User submits email — detect if account has password
  // - Existing account with password → return { hasPassword: true } so UI shows password step
  // - New signup or account without password → send email code and return { hasPassword: false }
  const handleEmailSubmit = async (email: string): Promise<{ hasPassword: boolean }> => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    try {
      const attempt = await signIn.create({ identifier: email });
      const factors = (attempt.supportedFirstFactors as any) || [];
      const hasPassword = factors.some((f: any) => f.strategy === "password");

      if (hasPassword) {
        // Don't send email yet — wait for user to either type password or request code
        return { hasPassword: true };
      }

      // No password — fall back to email code
      const emailFactor = factors.find((f: any) => f.strategy === "email_code");
      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
      }
      return { hasPassword: false };
    } catch (err: any) {
      // If user not found, create a new account via email code
      if (err?.errors?.[0]?.code === "form_identifier_not_found") {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return { hasPassword: false };
      }
      throw new Error(err?.errors?.[0]?.longMessage || "Error verificando email");
    }
  };

  // Step 2a: Password sign-in
  const handlePasswordSubmit = async (_email: string, password: string) => {
    if (!signInLoaded || !signIn) throw new Error("Auth not loaded");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setTimeout(() => router.push("/dashboard"), 2200);
        return;
      }
      throw new Error("No se pudo iniciar sesión.");
    } catch (err: any) {
      throw new Error(err?.errors?.[0]?.longMessage || err?.message || "Contraseña incorrecta");
    }
  };

  // Step 2b: User requests email code instead of password
  const handleRequestCode = async (_email: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");
    try {
      const factors = (signIn.supportedFirstFactors as any) || [];
      const emailFactor = factors.find((f: any) => f.strategy === "email_code");
      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
      } else {
        // Account without email factor — try sign-up flow
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
    } catch (err: any) {
      throw new Error(err?.errors?.[0]?.longMessage || "No se pudo enviar el código");
    }
  };

  // Step 3: User submits OTP code — verify and set session
  const handleCodeSubmit = async (code: string) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) throw new Error("Auth not loaded");

    if (signIn.status === "needs_first_factor") {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setTimeout(() => router.push("/dashboard"), 2200);
        return;
      }
    }

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
      onPasswordSubmit={handlePasswordSubmit}
      onRequestCode={handleRequestCode}
      onCodeSubmit={handleCodeSubmit}
      onResendCode={handleResendCode}
    />
  );
}
