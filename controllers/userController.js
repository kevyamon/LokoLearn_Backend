const loginUser = (req, res) => {
  const { matricule } = req.body;

  if (!matricule) {
    return res.status(400).json({ message: 'Veuillez entrer un matricule' });
  }

  // Expression régulière pour valider le format du matricule
  const matriculeRegex = /^\d{5}-M\d$/;

  if (!matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: 'Format du matricule invalide' });
  }

  // Si le format est bon, on renvoie une réponse positive
  // Plus tard, on vérifiera ici si le matricule existe dans la base de données
  res.status(200).json({
    matricule: matricule,
    isAdmin: matricule === process.env.ADMIN_ID
  });
};

module.exports = { loginUser };