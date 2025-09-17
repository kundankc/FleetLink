function estimatedRideDurationHours(fromPincode, toPincode) {
  const f = parseInt(fromPincode, 10);
  const t = parseInt(toPincode, 10);
  if (Number.isNaN(f) || Number.isNaN(t)) return 1;
  let hours = Math.abs(t - f) % 24;
  if (hours === 0) hours = 1;
  return hours;
}

module.exports = { estimatedRideDurationHours };
