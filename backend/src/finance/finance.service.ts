import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Payment, PaymentMethod } from './entities/payment.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { Expense, ExpenseStatus } from './entities/expense.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepo: Repository<FeeStructure>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  // ── Collection Summary ─────────────────────────────────────────────────────

  async collectionSummary(
    schoolId: string,
    term: string,
    academicYear: string,
  ): Promise<{
    termTarget: number;
    collected: number;
    collectionRate: number;
    byClass: { classId: string; target: number; collected: number }[];
  }> {
    const invoices = await this.invoiceRepo.find({
      where: { schoolId, term, academicYear },
      relations: ['student', 'student.class'],
    });

    const termTarget = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const collected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const collectionRate = termTarget > 0 ? Math.round((collected / termTarget) * 100) : 0;

    const classMap = new Map<string, { target: number; collected: number }>();
    for (const inv of invoices) {
      const cid = inv.student?.classId ?? 'unknown';
      const entry = classMap.get(cid) ?? { target: 0, collected: 0 };
      entry.target += Number(inv.amount);
      entry.collected += Number(inv.paidAmount);
      classMap.set(cid, entry);
    }

    const byClass = Array.from(classMap.entries()).map(([classId, vals]) => ({ classId, ...vals }));
    return { termTarget, collected, collectionRate, byClass };
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async recentPayments(schoolId: string, limit = 5): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { schoolId },
      relations: ['invoice', 'invoice.student', 'recordedBy'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async recordPayment(data: {
    invoiceId: string;
    schoolId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    recordedById: string;
  }): Promise<Payment> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: data.invoiceId, schoolId: data.schoolId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        invoiceId: data.invoiceId,
        schoolId: data.schoolId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        recordedById: data.recordedById,
      }),
    );

    // Update invoice paid amount and status
    invoice.paidAmount = Number(invoice.paidAmount) + Number(data.amount);
    if (invoice.paidAmount >= invoice.amount) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.paidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIAL;
    }
    await this.invoiceRepo.save(invoice);
    return payment;
  }

  async getPaymentHistory(schoolId: string, studentId?: string, page = 1, limit = 20) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.invoice', 'invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .leftJoinAndSelect('p.recordedBy', 'recordedBy')
      .where('p.school_id = :schoolId', { schoolId });
    if (studentId) {
      qb.andWhere('invoice.student_id = :studentId', { studentId });
    }
    qb.orderBy('p.created_at', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  // ── Invoices ───────────────────────────────────────────────────────────────

  async findInvoices(schoolId: string, page = 1, limit = 20): Promise<{ data: Invoice[]; total: number }> {
    const [data, total] = await this.invoiceRepo.findAndCount({
      where: { schoolId },
      relations: ['student', 'student.class'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    return this.invoiceRepo.save(this.invoiceRepo.create(data));
  }

  async getStudentBalance(studentId: string, schoolId: string, term?: string, academicYear?: string) {
    const where: any = { studentId, schoolId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;

    const invoices = await this.invoiceRepo.find({ where, order: { createdAt: 'DESC' } });
    const totalBilled = invoices.reduce((s, i) => s + Number(i.amount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const balance = totalBilled - totalPaid;

    return { studentId, invoices, totalBilled, totalPaid, balance, status: balance <= 0 ? 'CLEARED' : 'OWING' };
  }

  // ── Defaulters ─────────────────────────────────────────────────────────────

  async getDefaulters(schoolId: string, term: string, academicYear: string) {
    const invoices = await this.invoiceRepo.find({
      where: { schoolId, term, academicYear, status: InvoiceStatus.OVERDUE },
      relations: ['student', 'student.class'],
      order: { paidAmount: 'ASC' },
    });

    // Also include PARTIAL and PENDING past due date
    const pendingPartial = await this.invoiceRepo.find({
      where: [
        { schoolId, term, academicYear, status: InvoiceStatus.PARTIAL },
        { schoolId, term, academicYear, status: InvoiceStatus.PENDING },
      ],
      relations: ['student', 'student.class'],
    });

    const all = [...invoices, ...pendingPartial];
    return all.map((inv) => ({
      invoiceId: inv.id,
      studentId: inv.studentId,
      student: inv.student,
      totalAmount: Number(inv.amount),
      paidAmount: Number(inv.paidAmount),
      balance: Number(inv.amount) - Number(inv.paidAmount),
      status: inv.status,
      dueDate: inv.dueDate,
    }));
  }

  // ── Expenses ───────────────────────────────────────────────────────────────

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    return this.expenseRepo.save(this.expenseRepo.create(data));
  }

  async findExpenses(schoolId: string, term?: string, academicYear?: string, page = 1, limit = 20) {
    const where: any = { schoolId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    const [data, total] = await this.expenseRepo.findAndCount({
      where,
      relations: ['submittedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async updateExpense(id: string, schoolId: string, data: Partial<Expense>): Promise<Expense> {
    const expense = await this.expenseRepo.findOne({ where: { id, schoolId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return this.expenseRepo.save({ ...expense, ...data });
  }

  async approveExpense(id: string, schoolId: string, approvedById: string): Promise<Expense> {
    return this.updateExpense(id, schoolId, {
      status: ExpenseStatus.APPROVED,
      approvedById,
      approvedAt: new Date(),
    });
  }

  async deleteExpense(id: string, schoolId: string): Promise<{ success: boolean }> {
    const expense = await this.expenseRepo.findOne({ where: { id, schoolId } });
    if (!expense) throw new NotFoundException('Expense not found');
    await this.expenseRepo.remove(expense);
    return { success: true };
  }

  async expenseSummary(schoolId: string, term: string, academicYear: string) {
    const expenses = await this.expenseRepo.find({ where: { schoolId, term, academicYear, status: ExpenseStatus.PAID } });
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
    }
    return { total, byCategory, count: expenses.length };
  }
}
