import Restaurant from '../models/Restaurant';

/**
 * Generates a unique restaurant code
 * Format: 2 letters + 4 numbers (e.g., RT123456)
 * @returns Promise<string> - Unique restaurant code
 */
export const generateRestaurantCode = async (): Promise<string> => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 2 random letters
    const letter1 = letters[Math.floor(Math.random() * letters.length)];
    const letter2 = letters[Math.floor(Math.random() * letters.length)];
    
    // Generate 4 random numbers
    const num1 = numbers[Math.floor(Math.random() * numbers.length)];
    const num2 = numbers[Math.floor(Math.random() * numbers.length)];
    const num3 = numbers[Math.floor(Math.random() * numbers.length)];
    const num4 = numbers[Math.floor(Math.random() * numbers.length)];
    
    // Combine to form code
    code = `${letter1}${letter2}${num1}${num2}${num3}${num4}`;
    
    // Check if code already exists
    const existingRestaurant = await Restaurant.findOne({ restaurantCode: code });
    if (!existingRestaurant) {
      isUnique = true;
    }
    
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique restaurant code after maximum attempts');
  }

  return code!;
};

/**
 * Validates restaurant code format
 * @param code - Restaurant code to validate
 * @returns boolean - True if valid format
 */
export const validateRestaurantCode = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{6,10}$/;
  return codeRegex.test(code);
};

/**
 * Checks if restaurant code exists
 * @param code - Restaurant code to check
 * @returns Promise<boolean> - True if code exists
 */
export const restaurantCodeExists = async (code: string): Promise<boolean> => {
  const restaurant = await Restaurant.findOne({ restaurantCode: code.toUpperCase() });
  return !!restaurant;
}; 