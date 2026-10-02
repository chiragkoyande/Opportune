// ============================================================
// Opportune V4 — Reusable Status, Error & Empty States
// High accessibility, semantic feedback with retry triggers
// ============================================================

import React from 'react';
import { AlertCircle, RefreshCw, SearchX, WifiOff, FileQuestion, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// ============================================================
// ErrorState
// ============================================================
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center my-6',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-display font-bold text-base text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs border-destructive/30 hover:bg-destructive/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
};

// ============================================================
// NetworkError
// ============================================================
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <ErrorState
      title="Connection Unavailable"
      message="Unable to communicate with the Opportune discovery network. Please verify your connection."
      onRetry={onRetry}
    />
  );
};

// ============================================================
// EmptyState
// ============================================================
export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  actionLink,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed border-border/80 bg-secondary/15 text-center my-6',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-3">
        {icon || <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="font-display font-bold text-base text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">{message}</p>
      <div className="flex items-center gap-2">
        {actionLink && actionLabel && (
          <Button asChild size="sm" className="text-xs bg-primary text-primary-foreground font-semibold">
            <Link to={actionLink}>{actionLabel}</Link>
          </Button>
        )}
        {!actionLink && actionLabel && onAction && (
          <Button size="sm" onClick={onAction} className="text-xs bg-primary text-primary-foreground font-semibold">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" size="sm" onClick={onSecondaryAction} className="text-xs border-border/60">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
