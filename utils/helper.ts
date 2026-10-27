export class Helper {
  // Convert a price string like "$602.00" to a number like 602
  static convertPriceToNumber(price: string): number {
    const cleanedPrice = price.replace(/[^0-9.]/g, "");
    return Number(cleanedPrice);
  }

  // Fixed product test data
  static getProductDetails() {
    return {
      productName: "MacBook",
      productQuantity: "1",
      totalPrice: "$602.00",
    };
  }

  // Fixed login test data
  static getLoginDetails() {
    return {
      email: "farukh32@xyz.com",
      password: "test@123",
    };
  }
}
