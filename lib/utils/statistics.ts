
export function getRandomEmail() {
  return `user${Math.floor(Math.random() * 10000)}@example.com`;
}

export function getRandomCurrency() {
  const currencies = ["UZS", "USD", "EUR"];
  return currencies[Math.floor(Math.random() * currencies.length)];
}

export function getRandomAmount() {
  return (Math.random() * 1000 + 1).toFixed(2);
}

export function getRandomUser() {
  return {
    email: getRandomEmail(),
    userEarnings: [
      {
        currency: getRandomCurrency(),
        amount: getRandomAmount(),
      },
    ],
  };
}

export function getRandomStatistics() {
  return {
    onlineUserCount: Math.floor(Math.random() * 500),
    totalEarned: getRandomAmount(),
    statEarnings: [
      {
        currency: getRandomCurrency(),
        amount: getRandomAmount(),
      },
    ],
    recentUsers: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, getRandomUser),
  };
}