export default function NotFound({ onBackHome }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20 text-3xl font-extrabold tracking-wider">
        404
      </div>
      <h1 className="text-3xl font-bold mb-3 tracking-tight">Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        The destination you are looking for does not exist or has been moved. You can easily find available verified drivers from our homepage.
      </p>
      <button
        onClick={onBackHome || (() => (window.location.href = '/'))}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
      >
        Return to Homepage
      </button>
    </div>
  );
}
