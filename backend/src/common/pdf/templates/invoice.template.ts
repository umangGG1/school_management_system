export interface InvoiceTemplateData {
  schoolName: string;
  schoolAddress?: string;
  invoiceNumber: string;
  studentName: string;
  studentClass?: string;
  admissionNumber?: string;
  term: string;
  academicYear: string;
  issuedDate: string;
  dueDate?: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
}

const fmt = (n: number) =>
  'UGX ' + Math.round(n).toLocaleString('en-UG');

const statusColor: Record<string, string> = {
  PAID:    '#2d6a3f',
  PARTIAL: '#b45309',
  UNPAID:  '#9b1c1c',
};
const statusBg: Record<string, string> = {
  PAID:    '#e8f4ec',
  PARTIAL: '#fef3c7',
  UNPAID:  '#fee2e2',
};

export function invoiceTemplate(d: InvoiceTemplateData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
  h1 { font-size: 20px; color: #1a3a6b; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a3a6b; padding-bottom: 16px; margin-bottom: 24px; }
  .label { color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-weight: bold; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .info-block { background: #f7f9fc; padding: 10px 14px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1a3a6b; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e5e5; }
  .amount { text-align: right; }
  .total-section { margin-left: auto; width: 280px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e5e5; }
  .total-row.grand { font-weight: bold; font-size: 15px; border-bottom: 2px solid #1a3a6b; padding-bottom: 8px; margin-bottom: 8px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px; }
  .footer { margin-top: 40px; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 12px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${d.schoolName}</h1>
    ${d.schoolAddress ? `<div style="color:#555;font-size:12px;margin-top:4px">${d.schoolAddress}</div>` : ''}
    <div style="margin-top:10px">
      <div class="label">Invoice Number</div>
      <div class="value" style="font-size:16px">#${d.invoiceNumber}</div>
    </div>
  </div>
  <div style="text-align:right">
    <span class="status-badge" style="background:${statusBg[d.status]};color:${statusColor[d.status]}">${d.status}</span>
    <div style="margin-top:12px">
      <div class="label">Issued</div>
      <div class="value" style="font-size:12px">${new Date(d.issuedDate).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
    ${d.dueDate ? `<div style="margin-top:8px"><div class="label">Due Date</div><div class="value" style="font-size:12px;color:#9b1c1c">${new Date(d.dueDate).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>` : ''}
  </div>
</div>

<div class="grid">
  <div class="info-block">
    <div class="label">Student Name</div>
    <div class="value">${d.studentName}</div>
  </div>
  ${d.admissionNumber ? `<div class="info-block"><div class="label">Admission No.</div><div class="value">${d.admissionNumber}</div></div>` : ''}
  ${d.studentClass ? `<div class="info-block"><div class="label">Class</div><div class="value">${d.studentClass}</div></div>` : ''}
  <div class="info-block">
    <div class="label">Term / Year</div>
    <div class="value">${d.term} — ${d.academicYear}</div>
  </div>
</div>

<table>
  <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
  <tbody>
    ${d.items.map(i => `<tr><td>${i.description}</td><td class="amount">${fmt(i.amount)}</td></tr>`).join('')}
  </tbody>
</table>

<div class="total-section">
  <div class="total-row grand">
    <span>Total Billed</span><span>${fmt(d.totalAmount)}</span>
  </div>
  <div class="total-row" style="color:#2d6a3f">
    <span>Amount Paid</span><span>${fmt(d.paidAmount)}</span>
  </div>
  <div class="total-row" style="font-weight:bold;color:${d.balanceDue > 0 ? '#9b1c1c' : '#2d6a3f'}">
    <span>Balance Due</span><span>${fmt(d.balanceDue)}</span>
  </div>
</div>

<div class="footer">
  Please present this invoice when making payment. &nbsp;|&nbsp; ${d.schoolName} &nbsp;|&nbsp; ${d.term} ${d.academicYear}
</div>

</body>
</html>`;
}
