import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Scheme, ChannelPartner } from '../types';
import { formatIndianCurrency } from './calculator';

export interface DossierPdfData {
  applicantName: string;
  scheme: Scheme;
  partner?: ChannelPartner | null;
  projectCost: number;
  loanAmount: number;
  promoterEquity: number;
  interestRate: number;
  routingToken: string;
}

export async function generateDossierPdf(data: DossierPdfData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 23, 42]; // #0f172a
  const accentColor = [3, 105, 161];  // #0369a1

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAMRIDDHI AI - CONCESSIONAL CREDIT DOSSIER', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('National Scheduled Castes Finance & Development Corporation (NSFDC) Portal', 14, 21);

  // Token Badge
  doc.setFillColor(255, 255, 255);
  doc.rect(145, 6, 52, 16, 'F');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL ROUTING TOKEN', 148, 11);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(data.routingToken, 148, 18);

  // Section 1: Applicant & Scheme Info
  let y = 38;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('1. APPLICANT & SCHEME SUMMARY', 14, y);

  doc.setLineWidth(0.4);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Applicant Name: ${data.applicantName}`, 14, y);
  doc.text(`Application Date: ${new Date().toLocaleDateString('en-IN')}`, 120, y);
  y += 7;
  doc.text(`Selected Scheme: ${data.scheme.name} (${data.scheme.code})`, 14, y);
  y += 7;
  doc.text(`Target Demographic: ${data.scheme.targetDemographic}`, 14, y);

  // Section 2: Financial Breakdown
  y += 14;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('2. FINANCIAL ASSISTANCE STRUCTURE', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 32, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Estimated Project Cost: ${formatIndianCurrency(data.projectCost)}`, 20, y + 8);
  doc.text(`Eligible Concessional Credit (90%): ${formatIndianCurrency(data.loanAmount)}`, 20, y + 16);
  doc.text(`Promoter Contribution Required (10%): ${formatIndianCurrency(data.promoterEquity)}`, 20, y + 24);

  doc.text(`Effective Interest Rate: ${data.interestRate}% p.a.`, 120, y + 8);
  doc.text(`Max Moratorium Period: ${data.scheme.maxMoratoriumMonths} Months`, 120, y + 16);
  doc.text(`Max Repayment Tenure: ${data.scheme.maxTenureYears} Years`, 120, y + 24);

  // Section 3: Channel Partner Nodal Office
  y += 42;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('3. ROUTED CHANNEL PARTNER OFFICE', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  if (data.partner) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.partner.name} (${data.partner.typeFullName})`, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Address: ${data.partner.address}, ${data.partner.city}, ${data.partner.state} - ${data.partner.pincode}`, 14, y);
    y += 6;
    doc.text(`Nodal Officer: ${data.partner.nodalOfficer} | Phone: ${data.partner.phone} | Email: ${data.partner.email}`, 14, y);
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Direct Submission to District State Channelizing Agency (SCA) Nodal Office.', 14, y);
  }

  // Section 4: Required Checklist
  y += 16;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('4. MANDATORY VERIFICATION DOCUMENTS CHECKLIST', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  data.scheme.documentsRequired.forEach((docItem, idx) => {
    doc.rect(14, y - 3, 4, 4);
    doc.text(`${idx + 1}. ${docItem}`, 22, y);
    y += 6;
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via SamriddhiAI Platform. This document serves as a digital pre-application dossier for bank evaluation.', 14, 285);

  doc.save(`SamriddhiAI_Dossier_${data.routingToken}.pdf`);
}
