export function FormErrorMessage({ message }: { message?: string }) {
  return message ? <p className="error-text">{message}</p> : null
}
