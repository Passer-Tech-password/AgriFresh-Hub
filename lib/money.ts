export function formatNairaFromKobo(amountKobo: number) {
  const amount = amountKobo / 100;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
}

