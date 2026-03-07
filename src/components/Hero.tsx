export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden w-full min-h-[40vh] flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-600/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main id="main-content" className="flex flex-col items-center text-center px-6 sm:px-10 z-10 py-16">
        <p className="text-2xl sm:text-3xl text-amber-200/90 mb-4" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Ameen<span className="text-amber-400">ly</span>
        </h1>
        <p className="text-xl sm:text-2xl mb-4 text-emerald-100 max-w-2xl">
          Share duas. Make duas for others. The fasting person&apos;s dua isn&apos;t rejected.
        </p>
        <p className="text-emerald-200/80 max-w-xl">
          Submit your dua to the public wall or create a private group for family and friends.
        </p>
      </main>
    </div>
  );
}
