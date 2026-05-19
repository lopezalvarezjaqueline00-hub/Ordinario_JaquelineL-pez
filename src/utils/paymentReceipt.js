import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from './formatters'
import { getPaymentPurchaseTotal, normalizePaymentItems } from './payments'

const PAGE = {
  margin: 48,
  bottom: 760,
  width: 595.28,
}

const sanitizeFileName = (value) =>
  String(value || 'pago')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const formatReceiptDate = (value) => {
  if (!value) {
    return formatDate(new Date())
  }

  return formatDate(`${value}T12:00:00`)
}

const ensureSpace = (doc, y, needed = 48) => {
  if (y + needed <= PAGE.bottom) {
    return y
  }

  doc.addPage()
  return 56
}

const addLabelValue = (doc, label, value, x, y) => {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(132, 124, 113)
  doc.text(String(label).toUpperCase(), x, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(27, 25, 23)
  doc.text(String(value || '-'), x, y + 16)
}

export const downloadPaymentReceipt = (payment, settings = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const storeName = settings.storeName || 'Mossi Shop'
  const items = normalizePaymentItems(payment)
  const purchaseTotal = getPaymentPurchaseTotal(payment)
  const paidAmount = Number(payment.amount || 0)
  const pendingAmount = Math.max(purchaseTotal - paidAmount, 0)
  const receiptNumber = String(payment.id || Date.now()).slice(-8).toUpperCase()
  let y = 56

  doc.setFillColor(250, 248, 245)
  doc.rect(0, 0, PAGE.width, 118, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(27, 25, 23)
  doc.text(storeName, PAGE.margin, y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(132, 124, 113)
  doc.text('Comprobante de pago', PAGE.margin, y + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(27, 25, 23)
  doc.text(`Recibo ${receiptNumber}`, PAGE.width - PAGE.margin, y, {
    align: 'right',
  })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(132, 124, 113)
  doc.text(formatReceiptDate(payment.paymentDate), PAGE.width - PAGE.margin, y + 18, {
    align: 'right',
  })

  y = 154
  addLabelValue(doc, 'Clienta', payment.clientName, PAGE.margin, y)
  addLabelValue(doc, 'Tipo de pago', payment.type, 220, y)
  addLabelValue(doc, 'Metodo', payment.method, 390, y)

  y += 64
  doc.setDrawColor(229, 224, 216)
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)

  y += 32
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(27, 25, 23)
  doc.text('Articulos de la compra', PAGE.margin, y)

  y += 26
  doc.setFontSize(8)
  doc.setTextColor(132, 124, 113)
  doc.text('ARTICULO', PAGE.margin, y)
  doc.text('CANT.', 330, y)
  doc.text('PRECIO', 390, y)
  doc.text('TOTAL', PAGE.width - PAGE.margin, y, { align: 'right' })
  y += 12
  doc.setDrawColor(229, 224, 216)
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
  y += 18

  if (items.length) {
    items.forEach((item, index) => {
      y = ensureSpace(doc, y, 54)
      const quantity = Number(item.quantity || 1)
      const price = Number(item.price || 0)
      const total = quantity * price
      const itemTitle = `${index + 1}. ${item.name}`
      const itemLines = doc.splitTextToSize(itemTitle, 250)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(27, 25, 23)
      doc.text(itemLines, PAGE.margin, y)

      if (item.category) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(132, 124, 113)
        doc.text(item.category, PAGE.margin, y + itemLines.length * 12 + 5)
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(27, 25, 23)
      doc.text(String(quantity), 340, y)
      doc.text(formatCurrency(price), 390, y)
      doc.text(formatCurrency(total), PAGE.width - PAGE.margin, y, {
        align: 'right',
      })

      y += Math.max(44, itemLines.length * 14 + 24)
      doc.setDrawColor(241, 237, 231)
      doc.line(PAGE.margin, y - 10, PAGE.width - PAGE.margin, y - 10)
    })
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(132, 124, 113)
    doc.text('Sin articulos registrados.', PAGE.margin, y)
    y += 36
  }

  y = ensureSpace(doc, y, 120)
  doc.setFillColor(250, 248, 245)
  doc.roundedRect(PAGE.width - 240, y, 192, 98, 8, 8, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(132, 124, 113)
  doc.text('Total compra', PAGE.width - 220, y + 26)
  doc.text('Pagado', PAGE.width - 220, y + 50)
  doc.text('Resta', PAGE.width - 220, y + 74)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 25, 23)
  doc.text(formatCurrency(purchaseTotal), PAGE.width - PAGE.margin - 18, y + 26, {
    align: 'right',
  })
  doc.text(formatCurrency(paidAmount), PAGE.width - PAGE.margin - 18, y + 50, {
    align: 'right',
  })
  doc.text(formatCurrency(pendingAmount), PAGE.width - PAGE.margin - 18, y + 74, {
    align: 'right',
  })

  if (payment.notes) {
    y += 132
    y = ensureSpace(doc, y, 72)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(27, 25, 23)
    doc.text('Notas', PAGE.margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(132, 124, 113)
    doc.text(doc.splitTextToSize(payment.notes, 420), PAGE.margin, y + 18)
  }

  const clientName = sanitizeFileName(payment.clientName)
  const datePart = sanitizeFileName(payment.paymentDate)
  doc.save(`mossi-shop-pago-${clientName || 'clienta'}-${datePart}.pdf`)
}
