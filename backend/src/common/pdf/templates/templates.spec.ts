import { payslipTemplate, PayslipTemplateData } from './payslip.template';
import { invoiceTemplate, InvoiceTemplateData } from './invoice.template';

const basePayslip: PayslipTemplateData = {
  schoolName:      'SMISSI Test School',
  month:           'April 2026',
  staffName:       'Jane Okello',
  staffId:         'STF-001',
  grossSalary:     1_200_000,
  payeDeduction:   285_000,
  nssfEmployee:    60_000,
  nssfEmployer:    120_000,
  saccoDeduction:  50_000,
  otherDeductions: 0,
  netPay:          805_000,
  paymentMethod:   'BANK',
  generatedAt:     '2026-04-30T10:00:00.000Z',
};

const baseInvoice: InvoiceTemplateData = {
  schoolName:    'SMISSI Test School',
  invoiceNumber: 'INV-2026-001',
  studentName:   'Alice Nakato',
  studentClass:  'S.4 East',
  term:          'Term 1',
  academicYear:  '2026',
  issuedDate:    '2026-01-15T00:00:00.000Z',
  items: [
    { description: 'Tuition Fees',       amount: 450_000 },
    { description: 'Boarding Fees',      amount: 300_000 },
    { description: 'Activity Fees',      amount: 50_000  },
  ],
  totalAmount: 800_000,
  paidAmount:  300_000,
  balanceDue:  500_000,
  status:      'PARTIAL',
};

describe('PDF Templates', () => {
  // ── payslipTemplate ───────────────────────────────────────────────────────

  describe('payslipTemplate', () => {
    let html: string;
    beforeAll(() => { html = payslipTemplate(basePayslip); });

    it('returns a non-empty HTML string', () => {
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(500);
    });

    it('contains the school name', () => {
      expect(html).toContain('SMISSI Test School');
    });

    it('contains the staff name', () => {
      expect(html).toContain('Jane Okello');
    });

    it('contains the month', () => {
      expect(html).toContain('April 2026');
    });

    it('formats gross salary as UGX', () => {
      expect(html).toContain('UGX');
      expect(html).toContain('1,200,000');
    });

    it('formats net pay correctly', () => {
      expect(html).toContain('805,000');
    });

    it('includes NSSF employer note', () => {
      expect(html).toContain('NSSF Employer');
      expect(html).toContain('120,000');
    });

    it('includes DOCTYPE and charset', () => {
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('charset="UTF-8"');
    });

    it('omits SACCO row when saccoDeduction is 0', () => {
      const noSacco = { ...basePayslip, saccoDeduction: 0 };
      const result  = payslipTemplate(noSacco);
      expect(result).not.toContain('SACCO');
    });

    it('includes SACCO row when saccoDeduction > 0', () => {
      expect(html).toContain('SACCO');
      expect(html).toContain('50,000');
    });
  });

  // ── invoiceTemplate ───────────────────────────────────────────────────────

  describe('invoiceTemplate', () => {
    let html: string;
    beforeAll(() => { html = invoiceTemplate(baseInvoice); });

    it('returns a non-empty HTML string', () => {
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(500);
    });

    it('contains the invoice number', () => {
      expect(html).toContain('INV-2026-001');
    });

    it('contains the student name', () => {
      expect(html).toContain('Alice Nakato');
    });

    it('contains all line items', () => {
      expect(html).toContain('Tuition Fees');
      expect(html).toContain('Boarding Fees');
      expect(html).toContain('Activity Fees');
    });

    it('shows correct total and balance', () => {
      expect(html).toContain('800,000');
      expect(html).toContain('500,000');
    });

    it('shows PARTIAL status badge', () => {
      expect(html).toContain('PARTIAL');
    });

    it('shows PAID status with green styling', () => {
      const paid = invoiceTemplate({ ...baseInvoice, status: 'PAID', paidAmount: 800000, balanceDue: 0 });
      expect(paid).toContain('PAID');
    });

    it('shows UNPAID status with red styling', () => {
      const unpaid = invoiceTemplate({ ...baseInvoice, status: 'UNPAID', paidAmount: 0, balanceDue: 800000 });
      expect(unpaid).toContain('UNPAID');
    });

    it('renders empty items array without crashing', () => {
      const empty = invoiceTemplate({ ...baseInvoice, items: [], totalAmount: 0, paidAmount: 0, balanceDue: 0 });
      expect(empty).toBeTruthy();
    });
  });
});
