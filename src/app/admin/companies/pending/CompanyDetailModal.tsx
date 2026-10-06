"use client";

import Image from "next/image";

export interface CompanyRequest {
  id: string;
  companyName: string;
  companyType: "HAUTE_MATSIATRA" | "OTHER_REGION" | "INTERNATIONAL";
  nif: string;
  stat: string;
  managerName: string;
  phone: string;
  createdAt: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  kbisUrl?: string;
  rejectionReason?: string;
  email?: string;
  address?: string;
  cityZip?: string;
  sector?: string;
  managerRole?: string;
  website?: string;
  needsDescription?: string;
  employeeCount?: string;
}

interface CompanyDetailModalProps {
  company: CompanyRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  processingAction: "approve" | "reject" | null;
  onReject: (company: CompanyRequest) => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
  onApprove,
  processingAction,
  onReject,
}: CompanyDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Bouton fermer flottant (remplace l'en-tête supprimé) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors shadow-md border border-slate-200"
          aria-label="Fermer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* ============================================================
            Corps (démarre directement, sans en-tête)
            ============================================================ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 pt-14 sm:pt-16 space-y-6">
          {/* Informations de l'entreprise */}
          <section>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-800 rounded-full" />
              Informations de l&apos;entreprise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
              <DetailItem label="Raison sociale" value={company.companyName} />
              <DetailItem label="NIF" value={company.nif} mono />
              <DetailItem label="STAT" value={company.stat} mono />
              <DetailItem
                label="Type d'établissement"
                value={
                  company.companyType === "HAUTE_MATSIATRA"
                    ? "Haute Matsiatra"
                    : company.companyType === "OTHER_REGION"
                    ? "Autre Région"
                    : "International"
                }
              />
              {company.sector && (
                <DetailItem label="Secteur d'activité" value={company.sector} />
              )}
              {company.employeeCount && (
                <DetailItem
                  label="Nombre de salariés"
                  value={company.employeeCount}
                />
              )}
              {company.cityZip && (
                <DetailItem label="Ville / Code postal" value={company.cityZip} />
              )}
              {company.address && (
                <DetailItem label="Adresse" value={company.address} full />
              )}
            </div>
          </section>

          {/* Responsable & Contact */}
          <section>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-800 rounded-full" />
              Responsable &amp; Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
              <DetailItem label="Nom du dirigeant" value={company.managerName} />
              {company.managerRole && (
                <DetailItem label="Fonction" value={company.managerRole} />
              )}
              <DetailItem label="Téléphone" value={company.phone} mono />
              {company.email && (
                <DetailItem label="Email" value={company.email} full />
              )}
              {company.website && (
                <DetailItem
                  label="Site web"
                  value={
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-700 hover:underline font-medium break-all"
                    >
                      {company.website}
                    </a>
                  }
                  full
                />
              )}
            </div>
          </section>

          {/* Description */}
          {company.needsDescription && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-800 rounded-full" />
                Description de l&apos;activité
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                {company.needsDescription}
              </p>
            </section>
          )}

          {/* Pièce jointe */}
          {company.kbisUrl && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-800 rounded-full" />
                Pièce jointe (Kbis / RCS)
              </h3>
              <div className="relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="relative w-full aspect-[16/10] bg-slate-50 flex items-center justify-center">
                  <Image
                    src={company.kbisUrl}
                    alt={`Pièce jointe de ${company.companyName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                        />
                        <polyline
                          points="14 2 14 8 20 8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        Document Kbis
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Cliquez pour ouvrir en grand
                      </p>
                    </div>
                  </div>
                  <a
                    href={company.kbisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white transition shadow-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Ouvrir
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Motif de refus */}
          {company.verificationStatus === "REJECTED" &&
            company.rejectionReason && (
              <section>
                <h3 className="text-[11px] uppercase tracking-wider font-bold text-pink-600 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-pink-500 rounded-full" />
                  Motif du refus
                </h3>
                <p className="text-sm text-pink-700 leading-relaxed bg-pink-50 rounded-2xl p-4 border border-pink-200">
                  {company.rejectionReason}
                </p>
              </section>
            )}
        </div>

        {/* ============================================================
            Pied : actions
            ============================================================ */}
        {company.verificationStatus === "PENDING" && (
          <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={() => onReject(company)}
              disabled={processingAction !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Refuser
            </button>
            <button
              onClick={() => onApprove(company.id)}
              disabled={processingAction !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingAction === "approve" ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Approbation...
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Approuver
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Composant utilitaire : Ligne de détail
   ============================================================ */
function DetailItem({
  label,
  value,
  mono = false,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-slate-800 break-words ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}