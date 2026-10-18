"use client";

import type { FormEventHandler } from "react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

type ContractProposalModalProps = {
  contractTitle: string;
  contractDescription: string;
  contractAmount: string;
  contractStartDate: string;
  contractEndDate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  title?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
};

// ─────────────────────────────────────────────────────────
// 🛡️ Helpers
// ─────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const MIN_AMOUNT = 10_000;

const sanitizeText = (value: string): string =>
  value
    .replace(/[<>{}[\]\\|`~^=+*%$#@!?_]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

const sanitizeAmount = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 12);

const formatFrenchDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
};

export default function ContractProposalModal({
  contractTitle,
  contractDescription,
  contractAmount,
  contractStartDate,
  contractEndDate,
  onTitleChange,
  onDescriptionChange,
  onAmountChange,
  onStartDateChange,
  onEndDateChange,
  onClose,
  onSubmit,
  title = "Formaliser un accord B2B",
  submitLabel = "Envoyer au partenaire",
  isSubmitting = false,
  error = null,
}: ContractProposalModalProps) {
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    amount?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const handleTitleChange = (value: string) => {
    const cleaned = sanitizeText(value);
    onTitleChange(cleaned);
    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
  };

  const handleDescriptionChange = (value: string) => {
    onDescriptionChange(value);
    if (errors.description)
      setErrors((e) => ({ ...e, description: undefined }));
  };

  const handleAmountChange = (value: string) => {
    const cleaned = sanitizeAmount(value);
    onAmountChange(cleaned);
    if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
  };

  const handleStartDateChange = (value: string) => {
    onStartDateChange(value);
    if (errors.startDate) setErrors((e) => ({ ...e, startDate: undefined }));
  };

  const handleEndDateChange = (value: string) => {
    onEndDateChange(value);
    if (errors.endDate) setErrors((e) => ({ ...e, endDate: undefined }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!contractTitle.trim()) {
      newErrors.title = "L'objet du contrat est requis.";
    } else if (contractTitle.trim().length < 5) {
      newErrors.title = "L'objet doit contenir au moins 5 caractères.";
    } else if (/[<>{}[\]\\|`~^=+*%$#@!?_]/.test(contractTitle)) {
      newErrors.title = "L'objet contient des caractères non autorisés.";
    }

    if (!contractDescription.trim()) {
      newErrors.description = "La description est requise.";
    } else if (contractDescription.trim().length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères.";
    }

    // Montant : > 10 000 Ar
    if (!contractAmount) {
      newErrors.amount = "Le montant est requis.";
    } else if (!/^\d+$/.test(contractAmount)) {
      newErrors.amount = "Le montant doit contenir uniquement des chiffres.";
    } else if (Number(contractAmount) <= MIN_AMOUNT) {
      newErrors.amount = "Le montant doit être supérieur à 10 000 Ar.";
    }

    if (!contractStartDate) {
      newErrors.startDate = "La date de début est requise.";
    } else if (contractStartDate < today) {
      newErrors.startDate = "La date de début ne peut pas être dans le passé.";
    }

    if (!contractEndDate) {
      newErrors.endDate = "La date de fin est requise.";
    } else if (contractStartDate && contractEndDate < contractStartDate) {
      newErrors.endDate = "La date de fin doit être après la date de début.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-5 text-center">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-emerald-600" />
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* TITRE */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Objet / Titre du contrat
            </label>
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={100}
              className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 transition focus:bg-white focus:outline-none ${
                errors.title
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Description
            </label>
            <textarea
              rows={5}
              value={contractDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              maxLength={500}
              className={`w-full resize-y rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 transition focus:bg-white focus:outline-none ${
                errors.description
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* MONTANT */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Montant convenu (Ariary)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={contractAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="10001"
                maxLength={12}
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-3.5 pr-12 text-xs font-medium text-slate-800 transition focus:bg-white focus:outline-none ${
                  errors.amount
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Ar
              </span>
            </div>
            {errors.amount && (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
            {!errors.amount && contractAmount && (
              <p className="mt-1 text-[10px] text-slate-400">
                {contractAmount.length} chiffre
                {contractAmount.length > 1 ? "s" : ""} · Minimum 10 001 Ar
              </p>
            )}
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Date de début
              </label>
              <input
                type="date"
                value={contractStartDate}
                min={today}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-xs font-medium text-slate-800 transition focus:bg-white focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                  errors.startDate
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <p className="mt-1 text-[10px] font-medium text-slate-500">
                {contractStartDate
                  ? formatFrenchDate(contractStartDate)
                  : "Sélectionnez une date de début"}
              </p>
              {errors.startDate && (
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Date de fin
              </label>
              <input
                type="date"
                value={contractEndDate}
                min={contractStartDate || today}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-xs font-medium text-slate-800 transition focus:bg-white focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                  errors.endDate
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <p className="mt-1 text-[10px] font-medium text-slate-500">
                {contractEndDate
                  ? formatFrenchDate(contractEndDate)
                  : "Sélectionnez une date de fin"}
              </p>
              {errors.endDate && (
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* BOUTONS */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Enregistrement..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
