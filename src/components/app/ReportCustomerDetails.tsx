import type { ReportCustomer } from "@/lib/export/report-customer";
import { reportCustomerRows } from "@/lib/export/report-customer";

export function ReportCustomerDetails({ customer }: { customer: ReportCustomer }) {
  const rows = reportCustomerRows(customer);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <h2 className="text-sm font-bold text-slate-900">Customer details</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
