export const PLANS = [
  { name: "أساسي", price: 300, branches: "5 فروع", students: "500 طالب", featured: false },
  { name: "متوسط", price: 500, branches: "10 فروع", students: "1500 طالب", featured: true },
  { name: "متقدم", price: 800, branches: "فروع غير محدودة", students: "طلاب غير محدودين", featured: false },
] as const;

export const ADDON_BRANCH_PRICE = 50;
