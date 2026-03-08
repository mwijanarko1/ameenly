function normalizePublicValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getLegalConfig() {
  const legalEntityName =
    normalizePublicValue(process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME) ?? "Ameenly";
  const postalAddress = normalizePublicValue(
    process.env.NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS
  );
  const contactEmail = normalizePublicValue(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
  const privacyEmail =
    normalizePublicValue(process.env.NEXT_PUBLIC_PRIVACY_EMAIL) ?? contactEmail;

  return {
    legalEntityName,
    postalAddress,
    contactEmail,
    privacyEmail,
    supportHref: contactEmail
      ? `mailto:${contactEmail}`
      : "/privacy#contact-us",
    privacyHref: privacyEmail
      ? `mailto:${privacyEmail}`
      : "/privacy#contact-us",
  };
}
