type SchemaHeadProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** JSON-LD in document head for crawlers (Organization, LocalBusiness, FAQ, Services). */
export function SchemaHead({ data }: SchemaHeadProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
