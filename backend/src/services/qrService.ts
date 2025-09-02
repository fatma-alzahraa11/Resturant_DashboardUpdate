import QRCode from 'qrcode';
import { Request, Response } from 'express';

export interface IQRCodeData {
  tableId: string;
  storeId: string;
  restaurantId: string;
  type: 'table' | 'menu' | 'payment';
  url?: string;
  data?: any;
}

// Generate QR code for table
const generateTableQR = async (tableId: string, storeId: string, restaurantId: string, baseUrl: string): Promise<string> => {
  try {
    const qrData: IQRCodeData = {
      tableId,
      storeId,
      restaurantId,
      type: 'table',
      url: `${baseUrl}/menu/${restaurantId}/${storeId}/${tableId}`
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

// Generate QR code for menu
const generateMenuQR = async (restaurantId: string, storeId: string, baseUrl: string): Promise<string> => {
  try {
    const qrData: IQRCodeData = {
      tableId: '',
      storeId,
      restaurantId,
      type: 'menu',
      url: `${baseUrl}/menu/${restaurantId}/${storeId}`
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

// Generate QR code for payment
const generatePaymentQR = async (orderId: string, amount: number, baseUrl: string): Promise<string> => {
  try {
    const qrData: IQRCodeData = {
      tableId: '',
      storeId: '',
      restaurantId: '',
      type: 'payment',
      url: `${baseUrl}/payment/${orderId}`,
      data: {
        orderId,
        amount
      }
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

// Generate multiple QR codes for store
const generateStoreQRCodes = async (storeId: string, restaurantId: string, tableCount: number, baseUrl: string): Promise<Array<{ tableId: string; qrCode: string }>> => {
  try {
    const qrCodes = [];

    for (let i = 1; i <= tableCount; i++) {
      const tableId = `table-${i}`;
      const qrCode = await generateTableQR(tableId, storeId, restaurantId, baseUrl);
      
      qrCodes.push({
        tableId,
        qrCode
      });
    }

    return qrCodes;
  } catch (error) {
    throw new Error(`Failed to generate store QR codes: ${error}`);
  }
};

// Parse QR code data
const parseQRCode = (qrCodeData: string): IQRCodeData => {
  try {
    return JSON.parse(qrCodeData);
  } catch (error) {
    throw new Error('Invalid QR code data');
  }
};

// Validate QR code
const validateQRCode = (qrCodeData: string): boolean => {
  try {
    const data = JSON.parse(qrCodeData);
    return data && data.type && (data.tableId || data.restaurantId);
  } catch (error) {
    return false;
  }
};

export default {
  generateTableQR,
  generateMenuQR,
  generatePaymentQR,
  generateStoreQRCodes,
  parseQRCode,
  validateQRCode
};
