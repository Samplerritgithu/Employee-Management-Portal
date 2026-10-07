const Spinner = ({ size = 'md' }) => {
  return <div className={`spinner spinner-${size}`} role="status" aria-label="Loading" />;
};

export default Spinner;
