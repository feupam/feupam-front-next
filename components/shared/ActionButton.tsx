'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ActionButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
}

/**
 * ActionButton - Botão reutilizável com estados de loading e ícones
 * 
 * @example
 * ```tsx
 * <ActionButton 
 *   isLoading={isSubmitting}
 *   loadingText="Salvando..."
 *   icon={Save}
 *   onClick={handleSave}
 * >
 *   Salvar
 * </ActionButton>
 * ```
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    { 
      children, 
      isLoading, 
      loadingText, 
      icon: Icon, 
      iconPosition = 'left',
      disabled,
      asChild,
      ...props 
    }, 
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const Comp = asChild ? Slot : 'button';

    // Se asChild e não está loading, renderiza o children diretamente
    if (asChild && !isLoading) {
      return (
        <Button
          ref={ref}
          disabled={isDisabled}
          asChild
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className="mr-2 h-4 w-4" />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className="ml-2 h-4 w-4" />
            )}
          </>
        )}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';
