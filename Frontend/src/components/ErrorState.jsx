import './ErrorState.css';

export default function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  const message =
    (error && error.message) || (error && String(error)) || 'An unknown error occurred.';

  return (
    <div className="error-state" role="alert">
      <span className="error-state__icon" aria-hidden="true">!</span>
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__message">{message}</p>
      {onRetry ? (
        <button className="error-state__btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
