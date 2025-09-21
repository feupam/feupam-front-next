import React from "react";

export const LoadingModal = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full border-4 border-t-emerald-400 border-gray-300 h-16 w-16 mb-4" />
        <span className="text-white text-lg font-semibold">Carregando...</span>
      </div>
    </div>
  );
};
