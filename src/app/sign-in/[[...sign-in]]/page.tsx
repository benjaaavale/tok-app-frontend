import { redirect } from "next/navigation";

// El login ahora vive en /login
export default function OldSignInPage() {
  redirect("/login");
}
