"use client";

import dynamic from "next/dynamic";

// Dynamically import ModalProvider with SSR disabled
const ModalProvider = dynamic(() => import("mui-modal-provider"), {
  ssr: false,
});

export default function ClientModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModalProvider>{children}</ModalProvider>;
}
