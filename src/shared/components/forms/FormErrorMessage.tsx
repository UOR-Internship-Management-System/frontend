export function FormErrorMessage({ id, message }: { id?: string; message?: string }) {
  return message ? (
    <p className="error-text" id={id}>
      {message}
    </p>
  ) : null
}
