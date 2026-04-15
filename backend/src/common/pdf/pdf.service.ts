import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Render an HTML string to a PDF buffer using Puppeteer.
   *
   * @param html     Full HTML document string (include <style> blocks inline)
   * @param options  Puppeteer PDF options override
   * @returns        PDF as a Buffer
   */
  async renderHtml(
    html: string,
    options: { format?: 'A4' | 'Letter'; landscape?: boolean } = {},
  ): Promise<Buffer> {
    // Dynamic import — Puppeteer is large; load on first use only
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format:    options.format ?? 'A4',
        landscape: options.landscape ?? false,
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });

      this.logger.debug(`PDF rendered (${pdf.length} bytes)`);
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Render a simple template by replacing {{key}} placeholders.
   * For full templating, inject a proper template engine instead.
   */
  interpolate(template: string, data: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      data[key] !== undefined ? String(data[key]) : `{{${key}}}`,
    );
  }
}
