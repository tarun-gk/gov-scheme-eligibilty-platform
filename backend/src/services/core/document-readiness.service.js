function splitDocuments(documentsRequired) {
  if (!documentsRequired) return [];
  return String(documentsRequired)
    .split(/[,;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function computeDocumentReadiness(profileDocuments = [], scheme) {
  const requiredDocs = splitDocuments(scheme.documents_required);
  if (requiredDocs.length === 0) {
    return {
      requiredDocuments: [],
      availableDocuments: [],
      missingDocuments: [],
      readinessScore: 100,
    };
  }

  const normalizedProfileDocs = new Set(
    profileDocuments.map((doc) => String(doc).trim().toLowerCase())
  );

  const availableDocuments = [];
  const missingDocuments = [];

  for (const doc of requiredDocs) {
    const normalized = doc.toLowerCase();
    if (normalizedProfileDocs.has(normalized)) {
      availableDocuments.push(doc);
    } else {
      missingDocuments.push(doc);
    }
  }

  const readinessScore = Math.round((availableDocuments.length / requiredDocs.length) * 100);

  return {
    requiredDocuments: requiredDocs,
    availableDocuments,
    missingDocuments,
    readinessScore,
  };
}
