export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="content-card">
        <p>
          Route scaffolded. UI details and business behavior will be implemented
          from the ACC CRM V3 specification and existing application reference.
        </p>
      </div>
    </section>
  );
}
