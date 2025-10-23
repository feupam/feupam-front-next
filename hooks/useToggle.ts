'use client';

import { useState, useCallback } from 'react';

/**
 * useToggle - Hook para gerenciar estados booleanos
 * 
 * @example
 * ```tsx
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 * 
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger asChild>
 *     <Button onClick={toggle}>Abrir</Button>
 *   </DialogTrigger>
 * </Dialog>
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
