// Função para gerar um CPF/Email/Placa válido
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

export function generatePlate(isMercosul: boolean): string {
  const regexPlate = /^[a-zA-Z]{3}[0-9]{4}$/;
  const regexPlateMercosul = /^[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/;

  function randomChar(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  function randomDigit(): string {
    return Math.floor(Math.random() * 10).toString();
  }

  let plate = '';

  if (isMercosul) {
    plate =
      randomChar() +
      randomChar() +
      randomChar() +
      randomDigit() +
      randomChar() +
      randomDigit() +
      randomDigit();
  } else {
    plate =
      randomChar() +
      randomChar() +
      randomChar() +
      randomDigit() +
      randomDigit() +
      randomDigit() +
      randomDigit();
  }

  if (isMercosul && regexPlateMercosul.test(plate)) {
    return plate;
  } else if (!isMercosul && regexPlate.test(plate)) {
    return plate;
  } else {
    throw new Error('Erro ao gerar placa válida');
  }
}
