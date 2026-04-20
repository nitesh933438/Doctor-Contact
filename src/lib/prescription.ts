import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generatePrescription = (appointment: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("DocReserve", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Official Medical Prescription", 20, 26);
  
  // Doctor Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Dr. ${appointment.doctorName}`, 20, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`Specialist in Medical Sciences`, 20, 50);
  
  // Patient Info
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information:", 140, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${appointment.patientName}`, 140, 50);
  doc.text(`ID: ${appointment.patientId.slice(0, 8)}...`, 140, 55);
  doc.text(`Date: ${appointment.date}`, 140, 60);

  // Line
  doc.setDrawColor(241, 245, 249);
  doc.line(20, 70, 190, 70);
  
  // Prescription Symbol
  doc.setFontSize(30);
  doc.text("Rx", 20, 85);

  if (appointment.prescription) {
    const p = appointment.prescription;
    
    // Diagnosis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis:", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(p.diagnosis || "General Observation", 20, 102, { maxWidth: 170 });

    // Medicines Table
    const tableData = (p.medicines || []).map((med: any, i: number) => [
      (i + 1).toString(),
      med.name,
      med.dosage,
      `${med.duration} Days`
    ]);

    if (tableData.length > 0) {
      (doc as any).autoTable({
        startY: 115,
        head: [['#', 'Medicine', 'Dosage', 'Duration']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }

    // Notes/Advice
    const finalY = (doc as any).lastAutoTable?.finalY || 115;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Advice & Notes:", 20, finalY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(p.notes || "Follow-up required as discussed.", 20, finalY + 22, { maxWidth: 170 });

  } else {
    // Fallback/Sample
    const tableData = [
      ["1", "General Checkup Result", "All metrics normal. Continued observation recommended."],
      ["2", "Advice", "Stay hydrated and maintain a balanced diet."],
      ["3", "Next Visit", "In 3 months or as needed."]
    ];
    
    (doc as any).autoTable({
      startY: 95,
      head: [['#', 'Section', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text("This is an automatically generated document. No physical signature required.", 20, pageHeight - 20);
  doc.text(`DocReserve Digital Health System - Session Ref: ${appointment.id}`, 20, pageHeight - 15);
  
  // Save the PDF
  doc.save(`Prescription_${appointment.patientName.replace(/\s+/g, '_')}_${appointment.id.slice(0,4)}.pdf`);
};
