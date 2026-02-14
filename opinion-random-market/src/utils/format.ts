export const formatPercentage = (price: string | number): string => {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(p)) return '0%';
  return `${(p * 100).toFixed(0)}%`; // Using 0 decimals for cleaner look, e.g. 50%
};

export const formatCurrency = (value: string | number): string => {
   const v = typeof value === 'string' ? parseFloat(value) : value;
   if (isNaN(v)) return '$0';
   
   if (v >= 1000000) {
     return `$${(v / 1000000).toFixed(1)}M`;
   }
   if (v >= 1000) {
     return `$${(v / 1000).toFixed(1)}K`;
   }
   
   return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}
