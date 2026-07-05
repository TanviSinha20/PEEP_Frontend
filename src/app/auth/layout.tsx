export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 bg-bg-main">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] rounded-[18px] bg-accent-light border border-[rgba(79,70,229,0.15)] flex items-center justify-center mx-auto mb-[14px]">
            <span className="text-accent text-[28px] font-bold">♥</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight">PEEP</h1>
          <p className="text-[13px] text-text-secondary mt-1">Pathology Intelligence Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
