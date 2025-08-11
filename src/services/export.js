import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

class ExportService {
  async exportSlogans(slogans, format) {
    switch (format.toLowerCase()) {
      case 'pdf':
        return this.exportToPDF(slogans);
      case 'csv':
        return this.exportToCSV(slogans);
      case 'txt':
        return this.exportToTXT(slogans);
      default:
        throw new Error('Unsupported export format');
    }
  }

  exportToPDF(slogans) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add title
        doc.fontSize(20).text('Marketing Slogans', { align: 'center' });
        doc.moveDown();

        // Add export date
        doc.fontSize(12).text(`Exported on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Add slogans
        slogans.forEach((slogan, index) => {
          doc.fontSize(14).text(`${index + 1}. ${slogan.text}`, { align: 'left' });
          
          if (slogan.company_name) {
            doc.fontSize(10).text(`   Company: ${slogan.company_name}`, { align: 'left' });
          }
          
          if (slogan.industry) {
            doc.fontSize(10).text(`   Industry: ${slogan.industry}`, { align: 'left' });
          }
          
          if (slogan.brand_personality) {
            doc.fontSize(10).text(`   Personality: ${slogan.brand_personality}`, { align: 'left' });
          }
          
          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  exportToCSV(slogans) {
    const records = slogans.map(slogan => ({
      slogan: slogan.text,
      company: slogan.company_name || '',
      industry: slogan.industry || '',
      personality: slogan.brand_personality || '',
      keywords: slogan.keywords || '',
      created_date: new Date(slogan.created_at).toLocaleDateString()
    }));

    return stringify(records, {
      header: true,
      columns: {
        slogan: 'Slogan',
        company: 'Company',
        industry: 'Industry',
        personality: 'Brand Personality',
        keywords: 'Keywords',
        created_date: 'Created Date'
      }
    });
  }

  exportToTXT(slogans) {
    let content = 'Marketing Slogans\n';
    content += '=================\n\n';
    content += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

    slogans.forEach((slogan, index) => {
      content += `${index + 1}. ${slogan.text}\n`;
      
      if (slogan.company_name) {
        content += `   Company: ${slogan.company_name}\n`;
      }
      
      if (slogan.industry) {
        content += `   Industry: ${slogan.industry}\n`;
      }
      
      if (slogan.brand_personality) {
        content += `   Brand Personality: ${slogan.brand_personality}\n`;
      }
      
      if (slogan.keywords) {
        content += `   Keywords: ${slogan.keywords}\n`;
      }
      
      content += `   Created: ${new Date(slogan.created_at).toLocaleDateString()}\n\n`;
    });

    return content;
  }

  getContentType(format) {
    const contentTypes = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      txt: 'text/plain'
    };
    return contentTypes[format.toLowerCase()] || 'application/octet-stream';
  }
}

export const exportService = new ExportService();