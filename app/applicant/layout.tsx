export default function ApplicantLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Add any applicant-specific layout elements here */}
      <main className="py-10">{children}</main>
    </div>
  );
}
