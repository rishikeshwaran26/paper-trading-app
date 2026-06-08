export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Stock details, price chart, and trading actions.
      </p>
    </div>
  );
}
