export type LineItemInput = {
  qty: number;
  unit_price: number;
  discount_pct: number;
};

export function lineComputations(item: LineItemInput) {
  const pretaxGross = item.qty * item.unit_price;
  const discountAmount = pretaxGross * (item.discount_pct / 100);
  const total = pretaxGross - discountAmount;
  return { pretaxGross, discountAmount, total };
}

export function invoiceTotals(items: LineItemInput[], taxRate: number) {
  let netPrice = 0;
  let discountTotal = 0;

  for (const item of items) {
    const { discountAmount, total } = lineComputations(item);
    netPrice += total;
    discountTotal += discountAmount;
  }

  const tax = netPrice * taxRate;
  const totalPrice = netPrice + tax;

  return { netPrice, discountTotal, tax, totalPrice, amountDue: totalPrice };
}

export function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
