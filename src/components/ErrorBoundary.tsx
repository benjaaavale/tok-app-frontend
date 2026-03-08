"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-1">
            Algo salió mal
          </h3>
          <p className="text-[12px] text-text-muted mb-4 max-w-md">
            {this.state.error?.message || "Ocurrió un error inesperado"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all"
          >
            <RefreshCw size={13} />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
