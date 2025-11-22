"""
PDF Report Generation Service
Creates professional PDF reports for fraud detection analytics
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from io import BytesIO
import io

def generate_fraud_report_pdf(report_data: dict) -> BytesIO:
    """
    Generate comprehensive fraud detection report as PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#667eea'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#764ba2'),
        spaceAfter=12
    )
    
    # Title
    title = Paragraph("🛡️ FraudGuard AI - Fraud Detection Report", title_style)
    elements.append(title)
    
    # Date
    date_style = ParagraphStyle('DateStyle', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)
    date_text = Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", date_style)
    elements.append(date_text)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Summary Section
    summary_heading = Paragraph("Executive Summary", heading_style)
    elements.append(summary_heading)
    
    summary_data = [
        ['Metric', 'Value'],
        ['Total Transactions', f"{report_data.get('total_transactions', 0):,}"],
        ['Blocked Transactions', f"{report_data.get('blocked', 0):,}"],
        ['Under Review', f"{report_data.get('challenged', 0):,}"],
        ['Approved Transactions', f"{report_data.get('allowed', 0):,}"],
        ['Fraud Rate', f"{report_data.get('fraud_rate', 0):.2f}%"],
        ['Total Volume', f"{report_data.get('total_volume', 0):,.0f} so'm"],
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 0.5 * inch))
    
    # Top Fraud Locations
    if report_data.get('top_locations'):
        location_heading = Paragraph("Top Fraud Locations", heading_style)
        elements.append(location_heading)
        
        location_data = [['Location', 'Fraud Count', 'Fraud Rate']]
        for loc in report_data['top_locations'][:10]:
            location_data.append([
                loc['location'],
                str(loc['count']),
                f"{loc['fraud_rate']:.1f}%"
            ])
        
        location_table = Table(location_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        location_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#764ba2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        
        elements.append(location_table)
        elements.append(Spacer(1, 0.3 * inch))
    
    # Footer
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
    footer = Paragraph("AI Foundry powered by School21 | FraudGuard AI Anti-Fraud Platform", footer_style)
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_transaction_export_pdf(transactions: list) -> BytesIO:
    """
    Generate PDF with transaction list
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Transaction Export Report", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.2 * inch))
    
    # Transaction table
    data = [['ID', 'User', 'Amount (so\'m)', 'Status', 'Date']]
    
    for tx in transactions[:50]:  # Limit to first 50
        data.append([
            tx.transaction_id[:12] + '...',
            tx.user_id[:15],
            f"{tx.amount:,.0f}",
            tx.status,
            tx.timestamp.strftime('%Y-%m-%d')
        ])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
