'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface AnimatedSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Text shown in trigger when no option selected, and as first "clear" option in dropdown */
  placeholder?: string;
  /** Whether to include the placeholder as a selectable "clear" option in the dropdown (default: true) */
  allowEmpty?: boolean;
  disabled?: boolean;
  /** Applied to the wrapper div — use for layout constraints like flex-1, w-full, etc. */
  className?: string;
  size?: 'sm' | 'md';
  /** Show a small colored dot in the trigger (useful for status/etapa selects) */
  dotColor?: string;
  /** Icon shown on the left side of the trigger */
  leftIcon?: ReactNode;
}

export function AnimatedSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  allowEmpty = true,
  disabled = false,
  className,
  size = 'md',
  dotColor,
  leftIcon,
}: AnimatedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydration guard for createPortal
  useEffect(() => setMounted(true), []);

  // Close on outside click (works across portal boundary)
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  // Close on outside scroll (dropdown would float away), but allow scrolling inside the dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    window.addEventListener('scroll', handle, true);
    return () => window.removeEventListener('scroll', handle, true);
  }, [isOpen]);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optValue: string | number) => {
    onChange(String(optValue));
    setIsOpen(false);
  };

  const isSelected = (v: string | number) => String(v) === String(value);

  const itemBase = cn(
    'w-full text-left transition-colors duration-100',
    'border-b border-border-secondary last:border-b-0',
    size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2.5 text-[12px]',
  );

  return (
    <div className={cn('relative', className)}>
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center gap-2 text-left transition-all duration-150',
          'bg-bg-primary border border-border-secondary rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-accent/40 ring-2 ring-accent/20',
          size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-[12px]',
        )}
      >
        {leftIcon && (
          <span className="text-text-muted flex-shrink-0">{leftIcon}</span>
        )}
        {dotColor && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        )}
        <span
          className={cn(
            'flex-1 min-w-0 truncate',
            selectedOption ? 'text-text-primary' : 'text-text-muted',
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 text-text-muted ml-auto"
        >
          <ChevronDown size={size === 'sm' ? 12 : 14} />
        </motion.span>
      </button>

      {/* ── Dropdown (portalled to body to escape overflow clipping) ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  zIndex: 9999,
                }}
                className="bg-bg-primary border border-border-secondary rounded-lg shadow-lg overflow-hidden"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.025 } } }}
                  className="max-h-52 overflow-y-auto"
                >
                  {/* Placeholder / clear option */}
                  {allowEmpty && (
                    <motion.button
                      variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                      type="button"
                      onClick={() => handleSelect('')}
                      className={cn(
                        itemBase,
                        'hover:bg-bg-hover',
                        value === '' || value === undefined
                          ? 'text-accent font-medium bg-accent/5'
                          : 'text-text-muted',
                      )}
                    >
                      {placeholder}
                    </motion.button>
                  )}

                  {/* Options */}
                  {options.map((opt, i) => (
                    <motion.button
                      key={i}
                      variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        itemBase,
                        'hover:bg-bg-hover',
                        isSelected(opt.value)
                          ? 'text-accent font-medium bg-accent/5'
                          : 'text-text-primary',
                      )}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
