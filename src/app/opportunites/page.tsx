import OpportunitiesPage from "../components/OpportunitiesPage";
import PublicOpportunitiesHeader from "../components/PublicOpportunitiesHeader";

export default function PublicOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfdfd] to-[#f2faf8]">
      <PublicOpportunitiesHeader />
      <main className="px-4 pb-8 pt-24 sm:px-6">
        <OpportunitiesPage isPublic />
      </main>
    </div>
  );
}
