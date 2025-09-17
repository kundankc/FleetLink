function validatePincode(pincode) {
  if (!pincode) return false;
  const pincodeRegex = /^\d{5,6}$/;
  return pincodeRegex.test(pincode);
}

module.exports = { validatePincode };
