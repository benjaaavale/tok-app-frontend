"use client";

import { useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { authFetch } from "@/lib/api";
import { resolveMediaUrl, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Camera, KeyRound, Mail, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

export function UserProfileSettings() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { userAvatarUrl, userInitials, setAvatarUrl, companyNombre } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  // Accordion state
  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);

  // Avatar upload
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await authFetch("/user/avatar", { method: "POST", body: form }, () => getToken());
      return res.json();
    },
    onSuccess: (data) => {
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      toast.success("Avatar actualizado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("La imagen no puede superar 2MB"); return; }
    uploadAvatar.mutate(file);
  };

  // Password change
  const changePassword = async () => {
    if (!newPassword || !currentPassword) { toast.error("Completa todos los campos"); return; }
    if (newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    if (newPassword.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return; }
    try {
      await user?.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions: false });
      toast.success("Contraseña actualizada");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setShowPassword(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar la contraseña";
      toast.error(msg);
    }
  };

  // Email change — step 1: send verification
  const sendEmailVerification = async () => {
    if (!newEmail) { toast.error("Ingresa un correo"); return; }
    try {
      const emailAddress = await user?.createEmailAddress({ email: newEmail });
      await emailAddress?.prepareVerification({ strategy: "email_code" });
      setPendingEmailId(emailAddress?.id ?? null);
      toast.success("Código enviado a " + newEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar verificación";
      toast.error(msg);
    }
  };

  // Email change — step 2: verify and set as primary
  const verifyEmail = async () => {
    if (!verificationCode || !pendingEmailId) return;
    try {
      const emailAddress = user?.emailAddresses.find((e) => e.id === pendingEmailId);
      await emailAddress?.attemptVerification({ code: verificationCode });
      await user?.update({ primaryEmailAddressId: pendingEmailId });
      toast.success("Correo actualizado correctamente");
      setNewEmail(""); setVerificationCode(""); setPendingEmailId(null);
      setShowEmail(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Código incorrecto";
      toast.error(msg);
    }
  };

  return (
    <SettingsSection title="Mi perfil" description="Foto, correo y contraseña">
      {/* ── Avatar + info ── */}
      <div className="flex items-center gap-4 pb-4 border-b border-border-secondary mb-4">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          {userAvatarUrl ? (
            <img src={resolveMediaUrl(userAvatarUrl)} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-lg font-semibold">
              {userInitials || getInitials(user?.emailAddresses[0]?.emailAddress || "?")}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={16} className="text-white" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-text-primary">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">{companyNombre}</p>
        </div>
      </div>

      {/* ── Cambiar contraseña ── */}
      <div className="border border-border-secondary rounded-xl overflow-hidden mb-2">
        <button
          onClick={() => { setShowPassword(!showPassword); setShowEmail(false); }}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <KeyRound size={15} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">Cambiar contraseña</span>
          </div>
          {showPassword
            ? <ChevronUp size={15} className="text-text-muted" />
            : <ChevronDown size={15} className="text-text-muted" />}
        </button>

        {showPassword && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border-secondary bg-bg-primary">
            <PwField
              label="Contraseña actual"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPw}
              onToggle={() => setShowCurrentPw(!showCurrentPw)}
            />
            <PwField
              label="Nueva contraseña"
              value={newPassword}
              onChange={setNewPassword}
              show={showNewPw}
              onToggle={() => setShowNewPw(!showNewPw)}
            />
            <PwField
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showNewPw}
              onToggle={() => setShowNewPw(!showNewPw)}
            />
            <button
              onClick={changePassword}
              className="btn-gradient w-full py-2.5 rounded-xl text-[12px] font-medium mt-1"
            >
              Actualizar contraseña
            </button>
          </div>
        )}
      </div>

      {/* ── Cambiar correo ── */}
      <div className="border border-border-secondary rounded-xl overflow-hidden">
        <button
          onClick={() => { setShowEmail(!showEmail); setShowPassword(false); }}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Mail size={15} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">Cambiar correo</span>
          </div>
          {showEmail
            ? <ChevronUp size={15} className="text-text-muted" />
            : <ChevronDown size={15} className="text-text-muted" />}
        </button>

        {showEmail && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border-secondary bg-bg-primary">
            {!pendingEmailId ? (
              <>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Nuevo correo electrónico</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nuevo@correo.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
                <button
                  onClick={sendEmailVerification}
                  className="btn-gradient w-full py-2.5 rounded-xl text-[12px] font-medium"
                >
                  Enviar código de verificación
                </button>
              </>
            ) : (
              <>
                <p className="text-[11px] text-text-muted">
                  Se envió un código a{" "}
                  <span className="text-accent font-medium">{newEmail}</span>
                </p>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Código de verificación</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all tracking-widest text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPendingEmailId(null); setVerificationCode(""); }}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-medium border border-border-secondary text-text-secondary hover:bg-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={verifyEmail}
                    className="btn-gradient flex-1 py-2.5 rounded-xl text-[12px] font-medium"
                  >
                    Verificar y guardar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

function PwField({
  label, value, onChange, show, onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-text-muted block mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-10 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
