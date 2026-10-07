const StatCard = ({ title, value, accent }) => {
  return (
    <div className={`stat-card ${accent ? `stat-${accent}` : ''}`}>
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
