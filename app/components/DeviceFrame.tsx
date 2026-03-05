import { ReactNode } from "react";

type DeviceFrameProps = {
  children: ReactNode;
  className?: string;
  floating?: boolean;
};

export default function DeviceFrame({ children, className = "", floating = false }: DeviceFrameProps) {
  return (
    <div
      className={`w-[420px] max-w-full md:w-[460px] lg:w-[520px] ${
        floating ? "[animation:deviceFloat_6.5s_ease-in-out_infinite]" : ""
      } ${className}`.trim()}
    >
      <div className="rounded-[36px] border border-slate-200/80 bg-white p-3 shadow-[0_40px_100px_-40px_rgba(2,6,23,0.55)]">
        <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-300" />
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
            </div>
            <span className="font-medium text-slate-700">Ukepenger</span>
            <span className="w-8" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
