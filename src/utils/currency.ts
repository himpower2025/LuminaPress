
export const priceToNumber = (price?: string): number => {
  if (!price) return 0;
  return parseFloat(price.replace('$', ''));
};
