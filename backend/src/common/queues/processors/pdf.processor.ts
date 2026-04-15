import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { QUEUE } from '../queue.constants';
import { PdfService } from '../../pdf/pdf.service';
import { StorageService } from '../../storage/storage.service';
import { payslipTemplate } from '../../pdf/templates/payslip.template';
import { invoiceTemplate } from '../../pdf/templates/invoice.template';
import { Payslip } from '../../../payroll/entities/payslip.entity';
import { StaffMember } from '../../../staff/entities/staff.entity';

export type PdfDocumentType = 'payslip' | 'report-card' | 'financial-report' | 'receipt' | 'invoice';

export interface PdfJobData {
  type: PdfDocumentType;
  schoolId: string;
  entityId: string;
  recipientId?: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

@Processor(QUEUE.PDF)
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<PdfJobData>): Promise<{ url: string }> {
    const { type, entityId, schoolId, html, metadata } = job.data;
    this.logger.log(`Generating PDF: type=${type} entity=${entityId}`);

    let resolvedHtml = html ?? '';

    // Build HTML from template when no pre-rendered HTML is provided
    if (!resolvedHtml) {
      resolvedHtml = await this.buildHtml(type, entityId, schoolId, metadata);
    }

    if (!resolvedHtml) {
      this.logger.warn(`No HTML resolved for PDF job ${job.id} — skipping`);
      return { url: '' };
    }

    const buffer = await this.pdfService.renderHtml(resolvedHtml);
    const key    = `${schoolId}/${type}/${entityId}.pdf`;
    const url    = await this.storageService.upload(buffer, key, 'application/pdf');

    // Persist pdf_url back to the payslip record
    if (type === 'payslip') {
      await this.dataSource.query(
        `UPDATE payslips SET pdf_url = $1 WHERE id = $2`,
        [url, entityId],
      );
    }

    this.logger.log(`PDF uploaded: ${url}`);
    return { url };
  }

  private async buildHtml(
    type: PdfDocumentType,
    entityId: string,
    schoolId: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    if (type === 'payslip') {
      const payslip = await this.dataSource.getRepository(Payslip).findOne({
        where: { id: entityId, schoolId },
      });
      if (!payslip) return '';

      const staff = await this.dataSource.getRepository(StaffMember).findOne({
        where: { id: payslip.staffMemberId, schoolId },
      });

      const month = (metadata?.month as string) ??
        new Date(payslip.createdAt).toLocaleDateString('en-UG', { month: 'long', year: 'numeric' });

      return payslipTemplate({
        schoolName:      (metadata?.schoolName as string) ?? 'SMISSI School',
        month,
        staffName:       staff ? `${staff.firstName} ${staff.lastName}` : payslip.staffMemberId,
        staffId:         staff?.id ?? payslip.staffMemberId,
        grossSalary:     Number(payslip.grossSalary),
        payeDeduction:   Number(payslip.payeDeduction),
        nssfEmployee:    Number(payslip.nssfEmployee),
        nssfEmployer:    Number(payslip.nssfEmployer),
        saccoDeduction:  Number(payslip.saccoDeduction),
        otherDeductions: Number(payslip.otherDeductions),
        netPay:          Number(payslip.netPay),
        paymentMethod:   payslip.paymentMethod,
        paymentRef:      payslip.paymentRef ?? undefined,
        generatedAt:     new Date().toISOString(),
      });
    }

    // Invoice template — minimal; full version needs Invoice entity lookup
    if (type === 'invoice') {
      if (!metadata) return '';
      return invoiceTemplate({
        schoolName:    (metadata.schoolName as string) ?? 'SMISSI School',
        invoiceNumber: (metadata.invoiceNumber as string) ?? entityId,
        studentName:   (metadata.studentName as string) ?? 'Student',
        studentClass:  metadata.studentClass as string | undefined,
        admissionNumber: metadata.admissionNumber as string | undefined,
        term:          (metadata.term as string) ?? 'Term 1',
        academicYear:  (metadata.academicYear as string) ?? new Date().getFullYear().toString(),
        issuedDate:    (metadata.issuedDate as string) ?? new Date().toISOString(),
        dueDate:       metadata.dueDate as string | undefined,
        items:         (metadata.items as { description: string; amount: number }[]) ?? [],
        totalAmount:   Number(metadata.totalAmount ?? 0),
        paidAmount:    Number(metadata.paidAmount ?? 0),
        balanceDue:    Number(metadata.balanceDue ?? 0),
        status:        (metadata.status as 'UNPAID' | 'PARTIAL' | 'PAID') ?? 'UNPAID',
      });
    }

    return '';
  }
}
