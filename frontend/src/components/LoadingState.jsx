import Spinner from './Spinner';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-state">
      <Spinner />
      <p>{message}</p>
    </div>
  );
};

export default LoadingState;
