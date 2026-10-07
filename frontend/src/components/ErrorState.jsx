const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
