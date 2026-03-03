export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center">
          Welcome to <span className="text-blue-600">NexusBite</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          Get started by editing{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
            src/app/page.tsx
          </code>
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm h-10 px-5"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
          <a
            className="rounded-full border border-solid border-gray-300 dark:border-gray-700 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm h-10 px-5"
            href="https://www.prisma.io/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prisma Docs
          </a>
        </div>
      </main>
    </div>
  );
}
