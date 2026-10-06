import "./Legal.css";

export const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <a href="/" className="legal-back">
        &larr; Back to Game Datacards
      </a>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: February 13, 2026</p>

      <h2>Who We Are</h2>
      <p>
        Game Datacards is operated by Kayma, trading as Game Datacards (eenmanszaak), registered in The Netherlands. We
        are the data controller for the personal data described in this policy.
      </p>
      <ul>
        <li>Address: Den Haag</li>
        <li>KvK: 87827840</li>
        <li>
          Email: <a href="mailto:privacy@game-datacards.eu">privacy@game-datacards.eu</a>
        </li>
      </ul>

      <h2>What Data We Collect</h2>
      <ul>
        <li>
          <strong>Account data</strong>: Email address, display name, and authentication credentials when you create an
          account.
        </li>
        <li>
          <strong>Service data</strong>: Datacards, categories, lists, settings, and other content you create within the
          platform.
        </li>
        <li>
          <strong>Payment data</strong>: Subscription status and billing history. Payment card details are handled
          entirely by our payment provider (Creem) and are never stored on our servers.
        </li>
        <li>
          <strong>Technical data</strong>: IP address, browser type, and device information collected automatically
          through server logs for security and troubleshooting purposes.
        </li>
      </ul>

      <h2>Why and How We Use Your Data</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis (GDPR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Providing the service and managing your account</td>
            <td>Contract performance (Art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Processing payments and subscriptions</td>
            <td>Contract performance (Art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Sending service-related emails (invites, account notices)</td>
            <td>Contract performance (Art. 6(1)(b))</td>
          </tr>
          <tr>
            <td>Security, fraud prevention, and server logs</td>
            <td>Legitimate interest (Art. 6(1)(f))</td>
          </tr>
          <tr>
            <td>Complying with legal obligations (tax, accounting)</td>
            <td>Legal obligation (Art. 6(1)(c))</td>
          </tr>
        </tbody>
      </table>

      <h2>Who We Share Data With</h2>
      <p>
        We do not sell your personal data. We share data only with the following service providers who help us run the
        platform:
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hetzner</td>
            <td>Hosting and database</td>
            <td>EU (Germany/Finland)</td>
          </tr>
          <tr>
            <td>Cloudflare</td>
            <td>CDN and web hosting</td>
            <td>Global</td>
          </tr>
          <tr>
            <td>Creem</td>
            <td>Payment processing</td>
            <td>EU</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Transactional emails</td>
            <td>US</td>
          </tr>
        </tbody>
      </table>
      <p>
        Resend and Cloudflare process data in the United States. These transfers are protected by Standard Contractual
        Clauses (SCCs) as approved by the European Commission. We may also share data when required by law or to protect
        our legal rights.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies required for the service to function, such as authentication session cookies. We
        do not use tracking cookies, advertising cookies, or third-party analytics. Because these cookies are strictly
        necessary, no consent banner is required under the Dutch Telecommunicatiewet.
      </p>

      <h2>How Long We Keep Your Data</h2>
      <ul>
        <li>
          <strong>Account and service data</strong>: kept while your account is active, deleted within 30 days after
          account deletion
        </li>
        <li>
          <strong>Payment records</strong>: kept for 7 years after the transaction as required by Dutch tax law (fiscale
          bewaarplicht)
        </li>
        <li>
          <strong>Server logs</strong>: automatically deleted after 90 days
        </li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We protect your data with encryption in transit (TLS) and at rest, access controls, and regular security
        reviews. All data is stored on servers within the European Union (Hetzner, Germany/Finland).
      </p>

      <h2>Your Rights Under GDPR</h2>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li>
          <strong>Access</strong> &mdash; request a copy of your data
        </li>
        <li>
          <strong>Rectification</strong> &mdash; correct inaccurate data
        </li>
        <li>
          <strong>Erasure</strong> &mdash; request deletion of your data
        </li>
        <li>
          <strong>Restriction</strong> &mdash; limit how we process your data
        </li>
        <li>
          <strong>Portability</strong> &mdash; receive your data in a structured, machine-readable format
        </li>
        <li>
          <strong>Objection</strong> &mdash; object to processing based on legitimate interest
        </li>
        <li>
          <strong>Withdraw consent</strong> &mdash; where processing is based on consent, withdraw it at any time
        </li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <a href="mailto:privacy@game-datacards.eu">privacy@game-datacards.eu</a>. We will respond within one month.
      </p>

      <h2>Complaints</h2>
      <p>
        If you believe we are not handling your data correctly, we encourage you to contact us first so we can resolve
        your concern. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit
        Persoonsgegevens) at{" "}
        <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
          autoriteitpersoonsgegevens.nl
        </a>
        .
      </p>

      <h2>Children</h2>
      <p>
        Game Datacards is not intended for users under 16 years of age. We do not knowingly collect personal data from
        children. If you believe a child under 16 has created an account, please contact us and we will delete it
        promptly.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. We will notify you of material changes via email or through the
        platform at least 30 days before they take effect. The &ldquo;last updated&rdquo; date at the top will always
        reflect the current version.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy-related questions or to exercise your rights, email us at{" "}
        <a href="mailto:privacy@game-datacards.eu">privacy@game-datacards.eu</a>.
      </p>
    </div>
  );
};
