"use client";

import { Calendar, Coins, FileText } from "lucide-react";

export interface ContractDetails {
  title: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  signerName?: string;
  contractId?: string;
  reference?: string;
}

type ContractReviewModalProps = {
  contract: ContractDetails;
  onAccept: () => void;
  onCancel: () => void;
};

function formatContractDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

export default function ContractReviewModal({
  contract,
  onAccept,
  onCancel,
}: ContractReviewModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-review-title"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="border-b border-slate-100 pb-4 text-center">
          <h3
            id="contract-review-title"
            className="text-base font-extrabold text-slate-900"
          >
            Proposition de contrat
          </h3>
        </div>

        {/* Objet + Description */}
        <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <FileText className="w-3 h-3" />
              Objet
            </div>
            <p className="text-sm font-bold text-slate-900">{contract.title}</p>
          </div>

          <div className="pt-3 border-t border-slate-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
              {contract.description}
            </p>
          </div>
        </div>

        {/* Montant */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <Coins className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Montant total
            </span>
          </div>
          <p className="text-sm font-extrabold text-emerald-700">
            {contract.amount.toLocaleString("fr-FR")} Ar
          </p>
        </div>

        {/* ✅ Dates séparées clairement */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#F2F2F2] bg-white p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Calendar className="w-3 h-3 text-emerald-500" />
              Début
            </div>
            <p className="text-xs font-extrabold text-slate-900">
              {formatContractDate(contract.startDate)}
            </p>
          </div>

          <div className="rounded-xl border border-[#F2F2F2] bg-white p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Calendar className="w-3 h-3 text-emerald-500" />
              Fin
            </div>
            <p className="text-xs font-extrabold text-slate-900">
              {formatContractDate(contract.endDate)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
