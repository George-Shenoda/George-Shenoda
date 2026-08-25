export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}

export function stripCrlf(input: string): string {
  return input.replace(/[\r\n]/g, '');
}