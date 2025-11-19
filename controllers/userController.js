// controllers/userController.js

const loginUser = (req, res) => {
  const { matricule } = req.body;

  if (!matricule) {
    return res.status(400).json({ message: 'Veuillez entrer un matricule' });
  }

  // --- MISSION 0 : Validation assouplie ---
  // On retire la Regex stricte pour le moment pour faciliter les tests
  // const matriculeRegex = /^\d{5}-M\d$/;
  
  if (matricule.trim().length < 3) {
     return res.status(400).json({ message: 'Matricule trop court' });
  }

  // Si le format est bon, on renvoie une réponse positive
  // Plus tard, on vérifiera ici si le matricule existe dans la base de données
  res.status(200).json({
    matricule: matricule,
    isAdmin: matricule === process.env.ADMIN_ID
  });
};

module.exports = { loginUser };