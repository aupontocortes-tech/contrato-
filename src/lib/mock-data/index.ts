// Exemplo de estrutura de mock data
export const mockUsers = [
  { id: 1, name: "João Silva", email: "joao@example.com" },
  { id: 2, name: "Maria Santos", email: "maria@example.com" },
];

// Simular delay de rede
export const simulateDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Exemplo de função para buscar dados mockados
export async function getMockUser(id: number) {
  await simulateDelay(500);
  return mockUsers.find((user) => user.id === id);
}
