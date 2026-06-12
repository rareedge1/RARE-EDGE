function ROICalculator({ wins, losses, pushes }) {
  return React.createElement("div", {style:{color:"white",padding:"20px"}}, "ROI: " + wins + "W " + losses + "L");
}

function CalibrationDashboard({ isPremium }) {
  return React.createElement("div", {style:{color:"white",padding:"20px"}}, "Calibration works! Premium: " + isPremium);
}
