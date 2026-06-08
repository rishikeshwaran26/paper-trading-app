export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journal Entry</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Entry #{id}
      </p>
    </div>
  );
}
