export default function Metrics() {
  const metrics = [
    { value: "150 +", label: "Entreprises Régionales", highlight: false },
    { value: "3 450 +", label: "Opportunités Déposées", highlight: true },
    { value: "850 +", label: "Mises en Relation", highlight: false },
    { value: "98 %", label: "Taux de Satisfaction", highlight: false },
  ];

  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <span
                className={`text-3xl sm:text-4xl font-extrabold mb-1.5 ${
                  m.highlight ? "text-teal-600" : "text-corporate-navy"
                }`}
              >
                {m.value}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}