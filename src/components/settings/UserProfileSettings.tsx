"use client";

import { useRef } from "react";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { authFetch } from "@/lib/api";
import { resolveMediaUrl, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Camera, LogOut } from "lucide-react";

export function UserProfileSettings() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { userAvatarUrl, userInitials, setAvatarUrl, companyNombre } =
    useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await authFetch(
        "/user/avatar",
        { method: "POST", body: form },
        () => getToken()
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
      toast.success("Avatar actualizado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB");
      return;
    }
    uploadAvatar.mutate(file);
  };

  return (
    <SettingsSection title="Mi perfil" description="Avatar y sesión">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative group">
          {userAvatarUrl ? (
            <img
              src={resolveMediaUrl(userAvatarUrl)}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-lg font-semibold">
              {userInitials || getInitials(user?.emailAddresses[0]?.emailAddress || "?")}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            <Camera size={16} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <p className="text-[14px] font-medium text-text-primary">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-[11px] text-text-muted">{companyNombre}</p>
        </div>
      </div>

      {/* Sign out */}
      <div className="pt-4 mt-4 border-t border-border-secondary">
        <SignOutButton>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium text-danger hover:bg-danger/10 transition-all">
            <LogOut size={13} />
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </SettingsSection>
  );
}
