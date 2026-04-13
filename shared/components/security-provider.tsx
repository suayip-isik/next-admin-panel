"use client";

import { createContext, useContext, type ReactNode } from "react";

const SecurityContext = createContext<{ nonce: string | null }>({
  nonce: null,
});

export function SecurityProvider({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce: string | null;
}) {
  return (
    <SecurityContext.Provider value={{ nonce }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurityContext() {
  return useContext(SecurityContext);
}
