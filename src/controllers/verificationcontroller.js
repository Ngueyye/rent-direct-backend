export const submitVerification = (req, res) => {
  const govId = req.files?.gov_id?.[0];
  const proof = req.files?.ownership_proof?.[0];

  if (!govId || !proof) {
    return res.status(400).json({
      status: 'error',
      message: 'Both gov_id and ownership_proof files are required',
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      verification_status: 'pending',
      gov_id: { name: govId.originalname, size: govId.size },
      ownership_proof: { name: proof.originalname, size: proof.size },
    },
  });
};