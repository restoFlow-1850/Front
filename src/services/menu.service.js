export const menuService = {
  getMenu: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "23", name: "Coca-Cola 0.5L", price: 10000, unit: "0.5L", category: "Ichimliklar", available: true },
          { id: "24", name: "Coca-Cola 1L", price: 16000, unit: "1L", category: "Ichimliklar", available: true },
          { id: "25", name: "Coca-Cola 1.5L", price: 22000, unit: "1.5L", category: "Ichimliklar", available: true },
          { id: "26", name: "Coca-Cola 2L", price: 28000, unit: "2L", category: "Ichimliklar", available: true },

          { id: "27", name: "Fanta 0.5L", price: 10000, unit: "0.5L", category: "Ichimliklar", available: true },
          { id: "28", name: "Fanta 1L", price: 16000, unit: "1L", category: "Ichimliklar", available: true },
          { id: "29", name: "Fanta 1.5L", price: 22000, unit: "1.5L", category: "Ichimliklar", available: true },
          { id: "30", name: "Fanta 2L", price: 28000, unit: "2L", category: "Ichimliklar", available: true },

          { id: "31", name: "Sprite 0.5L", price: 10000, unit: "0.5L", category: "Ichimliklar", available: true },
          { id: "32", name: "Sprite 1L", price: 16000, unit: "1L", category: "Ichimliklar", available: true },
          { id: "33", name: "Sprite 1.5L", price: 22000, unit: "1.5L", category: "Ichimliklar", available: true },
          { id: "34", name: "Sprite 2L", price: 28000, unit: "2L", category: "Ichimliklar", available: true },

          { id: "35", name: "Mineral suv 0.5L", price: 5000, unit: "0.5L", category: "Ichimliklar", available: true },
          { id: "36", name: "Mineral suv 1L", price: 8000, unit: "1L", category: "Ichimliklar", available: true },
          { id: "37", name: "Mineral suv 1.5L", price: 10000, unit: "1.5L", category: "Ichimliklar", available: true },
          { id: "38", name: "Mineral suv 2L", price: 13000, unit: "2L", category: "Ichimliklar", available: true },
        ]);
      }, 300);
    });
  },
};