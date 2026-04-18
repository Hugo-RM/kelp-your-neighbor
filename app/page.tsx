export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Kelp Your Neighbor
        </h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Connecting communities through local support and collaboration
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
