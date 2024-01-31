function isValidPassword(decryptedData) {
  // Extracting password and email from decrypted data to add email as sensitive info
  // which is not allowed on password
  const { password, email } = decryptedData;
  const sensitiveInfo = [email, 'admin', 'Admin'];
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[|"/(){}?'+!@#$%^&*_;¨-])(?=.{8,})/;

  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  } else if (sensitiveInfo.some((info) => password.includes(info))) {
    throw new Error('There is sensitive info on password, please, repeat');
  } else if (passwordRegex.test(password)) {
    return true;
  } else {
    return false;
  }
}

export { isValidPassword };
