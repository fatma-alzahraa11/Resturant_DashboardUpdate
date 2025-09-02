import qrService from '../../services/qrService';

describe('QR Service', () => {
  describe('generateTableQR', () => {
    it('should generate a valid QR code for table', async () => {
      const tableId = 'table-1';
      const storeId = 'store-123';
      const restaurantId = 'restaurant-456';
      const baseUrl = 'http://localhost:3000';

      const qrCode = await qrService.generateTableQR(tableId, storeId, restaurantId, baseUrl);

      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toContain('data:image/png;base64,');
    });

    it('should throw error for invalid parameters', async () => {
      await expect(
        qrService.generateTableQR('', '', '', '')
      ).rejects.toThrow('Failed to generate QR code');
    });
  });

  describe('generateMenuQR', () => {
    it('should generate a valid QR code for menu', async () => {
      const restaurantId = 'restaurant-456';
      const storeId = 'store-123';
      const baseUrl = 'http://localhost:3000';

      const qrCode = await qrService.generateMenuQR(restaurantId, storeId, baseUrl);

      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toContain('data:image/png;base64,');
    });
  });

  describe('generatePaymentQR', () => {
    it('should generate a valid QR code for payment', async () => {
      const orderId = 'order-789';
      const amount = 25.50;
      const baseUrl = 'http://localhost:3000';

      const qrCode = await qrService.generatePaymentQR(orderId, amount, baseUrl);

      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toContain('data:image/png;base64,');
    });
  });

  describe('generateStoreQRCodes', () => {
    it('should generate multiple QR codes for store', async () => {
      const storeId = 'store-123';
      const restaurantId = 'restaurant-456';
      const tableCount = 3;
      const baseUrl = 'http://localhost:3000';

      const qrCodes = await qrService.generateStoreQRCodes(storeId, restaurantId, tableCount, baseUrl);

      expect(qrCodes).toBeDefined();
      expect(Array.isArray(qrCodes)).toBe(true);
      expect(qrCodes).toHaveLength(tableCount);

      qrCodes.forEach((qrCode, index) => {
        expect(qrCode.tableId).toBe(`table-${index + 1}`);
        expect(qrCode.qrCode).toBeDefined();
        expect(typeof qrCode.qrCode).toBe('string');
        expect(qrCode.qrCode).toContain('data:image/png;base64,');
      });
    });
  });

  describe('parseQRCode', () => {
    it('should parse valid QR code data', () => {
      const qrData = {
        tableId: 'table-1',
        storeId: 'store-123',
        restaurantId: 'restaurant-456',
        type: 'table',
        url: 'http://localhost:3000/menu/restaurant-456/store-123/table-1'
      };

      const parsed = qrService.parseQRCode(JSON.stringify(qrData));

      expect(parsed).toEqual(qrData);
    });

    it('should throw error for invalid QR code data', () => {
      expect(() => {
        qrService.parseQRCode('invalid-json');
      }).toThrow('Invalid QR code data');
    });
  });

  describe('validateQRCode', () => {
    it('should validate correct QR code data', () => {
      const qrData = {
        tableId: 'table-1',
        storeId: 'store-123',
        restaurantId: 'restaurant-456',
        type: 'table'
      };

      const isValid = qrService.validateQRCode(JSON.stringify(qrData));

      expect(isValid).toBe(true);
    });

    it('should reject invalid QR code data', () => {
      const invalidData = {
        tableId: 'table-1'
        // Missing required fields
      };

      const isValid = qrService.validateQRCode(JSON.stringify(invalidData));

      expect(isValid).toBe(false);
    });

    it('should reject malformed JSON', () => {
      const isValid = qrService.validateQRCode('invalid-json');

      expect(isValid).toBe(false);
    });
  });
});
