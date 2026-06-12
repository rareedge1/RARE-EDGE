function ROICalculator({ wins, losses, pushes }) {
  return <div style={{color:"white",padding:"20px"}}>ROI: {wins}W {losses}L</div>;
}

function CalibrationDashboard({ isPremium }) {
  return (
    <div style={{color:"white",padding:"20px"}}>
      <div>Calibration Tab Loading...</div>
      <div>Premium: {isPremium ? "yes" : "no"}</div>
      <ROICalculator wins={5} losses={2} pushes={0} />
    </div>
  );
}
