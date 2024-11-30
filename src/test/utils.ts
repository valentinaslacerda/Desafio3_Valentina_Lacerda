// Função para gerar um CPF válido
export function generateValidCPF(): string {
  const randomNumbers = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  const firstVerifier = calculateVerifierDigit(randomNumbers);

  randomNumbers.push(firstVerifier);

  const secondVerifier = calculateVerifierDigit(randomNumbers);

  randomNumbers.push(secondVerifier);

  return randomNumbers.join('');
}

function calculateVerifierDigit(numbers: number[]): number {
  const weight = numbers.length + 1;
  const sum = numbers.reduce(
    (total, num, index) => total + num * (weight - index),
    0
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function generateValidEmail(): string {
  const domain = 'teste.com';
  const username = `user${Math.floor(Math.random() * 10000)}`;
  return `${username}@${domain}`;
}
