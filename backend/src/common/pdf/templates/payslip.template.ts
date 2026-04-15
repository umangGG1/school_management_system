export interface PayslipTemplateData {
  schoolName: string;
  schoolAddress?: string;
  month: string;              // e.g. "April 2026"
  staffName: string;
  staffId: string;
  designation?: string;
  grossSalary: number;
  payeDeduction: number;
  nssfEmployee: number;
  nssfEmployer: number;
  saccoDeduction: number;
  otherDeductions: number;
  netPay: number;
  paymentMethod?: string;
  paymentRef?: string;
  generatedAt: string;        // ISO date string
}

const fmt = (n: number) =>
  'UGX ' + Math.round(n).toLocaleString('en-UG');

export function payslipTemplate(d: PayslipTemplateData): string {
  const totalDeductions = d.payeDeduction + d.nssfEmployee + d.saccoDeduction + d.otherDeductions;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
  h1 { font-size: 20px; color: #1a3a6b; }
  h2 { font-size: 14px; color: #1a3a6b; margin-bottom: 4px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a3a6b; padding-bottom: 16px; margin-bottom: 24px; }
  .label { color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-weight: bold; font-size: 13px; }
  .section { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a3a6b; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
  td { padding: 7px 12px; border-bottom: 1px solid #e5e5e5; }
  tr:last-child td { border-bottom: none; }
  .amount { text-align: right; }
  .total-row td { font-weight: bold; background: #f0f4ff; }
  .net-box { background: #1a3a6b; color: #fff; padding: 16px 20px; border-radius: 6px; text-align: center; margin-top: 20px; }
  .net-box .net-label { font-size: 12px; opacity: 0.85; margin-bottom: 4px; }
  .net-box .net-amount { font-size: 26px; font-weight: bold; letter-spacing: 1px; }
  .footer { margin-top: 32px; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .info-block { background: #f7f9fc; padding: 10px 14px; border-radius: 4px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${d.schoolName}</h1>
    ${d.schoolAddress ? `<div style="color:#555;font-size:12px;margin-top:4px">${d.schoolAddress}</div>` : ''}
    <div style="margin-top:8px;font-size:12px;color:#555">PAYSLIP — <strong>${d.month}</strong></div>
  </div>
  <div style="text-align:right">
    <div class="label">Generated</div>
    <div class="value" style="font-size:12px">${new Date(d.generatedAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
</div>

<div class="grid">
  <div class="info-block">
    <div class="label">Employee Name</div>
    <div class="value">${d.staffName}</div>
  </div>
  <div class="info-block">
    <div class="label">Employee ID</div>
    <div class="value">${d.staffId}</div>
  </div>
  ${d.designation ? `<div class="info-block"><div class="label">Designation</div><div class="value">${d.designation}</div></div>` : ''}
  ${d.paymentMethod ? `<div class="info-block"><div class="label">Payment Method</div><div class="value">${d.paymentMethod.replace('_', ' ')}</div></div>` : ''}
</div>

<div class="section">
  <table>
    <thead><tr><th>Earnings</th><th class="amount">Amount</th></tr></thead>
    <tbody>
      <tr><td>Basic / Gross Salary</td><td class="amount">${fmt(d.grossSalary)}</td></tr>
      <tr class="total-row"><td>Total Gross</td><td class="amount">${fmt(d.grossSalary)}</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <table>
    <thead><tr><th>Deductions</th><th class="amount">Amount</th></tr></thead>
    <tbody>
      <tr><td>PAYE Tax (URA)</td><td class="amount">${fmt(d.payeDeduction)}</td></tr>
      <tr><td>NSSF (Employee 5%)</td><td class="amount">${fmt(d.nssfEmployee)}</td></tr>
      ${d.saccoDeduction > 0 ? `<tr><td>SACCO Deduction</td><td class="amount">${fmt(d.saccoDeduction)}</td></tr>` : ''}
      ${d.otherDeductions > 0 ? `<tr><td>Other Deductions</td><td class="amount">${fmt(d.otherDeductions)}</td></tr>` : ''}
      <tr class="total-row"><td>Total Deductions</td><td class="amount">${fmt(totalDeductions)}</td></tr>
    </tbody>
  </table>
</div>

<div style="background:#e8f4ec;padding:10px 14px;border-radius:4px;font-size:12px;color:#2d6a3f;margin-bottom:16px">
  NSSF Employer Contribution (10%): <strong>${fmt(d.nssfEmployer)}</strong> — paid by school, not deducted from salary.
</div>

<div class="net-box">
  <div class="net-label">NET PAY</div>
  <div class="net-amount">${fmt(d.netPay)}</div>
  ${d.paymentRef ? `<div style="font-size:11px;margin-top:6px;opacity:0.8">Ref: ${d.paymentRef}</div>` : ''}
</div>

<div class="footer">
  This payslip is computer generated and does not require a signature. &nbsp;|&nbsp; ${d.schoolName} &nbsp;|&nbsp; ${d.month}
</div>

</body>
</html>`;
}
