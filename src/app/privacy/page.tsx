import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            Rehi
          </Link>
          <Link
            href="/guide"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Guide
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Privacy Policy for Rehi Extension
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Public Date: November 3, 2025
        </p>

        <p className="mb-4">
          Thank you for using Rehi. We are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use our browser extension.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-3">
          When you use the Rehi extension to save articles and make highlights,
          we collect the following information:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <strong>Article Data:</strong> The URL, title, author (if
            available), and text content of the articles you choose to save.
          </li>
          <li>
            <strong>User-Generated Data:</strong> The text segments you
            &quot;highlight&quot; on those articles.
          </li>
          <li>
            <strong>Automatically-Generated Data:</strong> The extension may
            process the article content to create summaries, reading time
            estimates, and detect language. This data is stored along with your
            saved article.
          </li>
        </ul>
        <p className="mb-6">
          We do not collect your general browsing history or any data from tabs
          or websites you do not interact with using the &quot;Rehi&quot;
          extension.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            <strong>To Provide Core Services:</strong> To save and sync your
            articles and highlights to your personal &quot;Rehi&quot; library.
          </li>
          <li>
            <strong>To Display Your Content:</strong> To allow you to access,
            review, and manage your saved content.
          </li>
          <li>
            <strong>To Improve Features:</strong> To provide features such as
            auto-summaries, reading time estimates, and other described
            functionalities.
          </li>
          <li>
            <strong>Support and Maintenance:</strong> To troubleshoot issues and
            improve the extension&apos;s performance.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          3. Data Storage and Security
        </h2>
        <p className="mb-6">
          Your data (articles and highlights) is stored to allow you to access
          it later. We implement reasonable technical and organizational
          measures to protect your information from unauthorized access,
          alteration, or destruction.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">4. Data Sharing</h2>
        <p className="mb-3">
          We do not sell, trade, or rent your personal information to any third
          parties.
        </p>
        <p className="mb-3">
          Your data is stored solely for your personal use within the extension.
          We may share data with third-party service providers (e.g., cloud
          storage services for data synchronization) only as necessary to
          operate the extension, and these providers are legally obligated to
          protect your data.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">
          5. Your Rights and Control
        </h2>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            <strong>Access and Edit:</strong> Review and edit your saved
            articles or highlights at any time.
          </li>
          <li>
            <strong>Delete Data:</strong> Delete individual articles,
            highlights, or all of your data from the &quot;Rehi&quot; library.
          </li>
          <li>
            <strong>Uninstall:</strong> Uninstalling the extension will prevent
            any new data collection.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          6. Changes to This Policy
        </h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. We will notify
          you of any significant changes by posting the new policy on this page
          or through other means.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">7. Contact Us</h2>
        <p className="mb-10">
          If you have any questions about this Privacy Policy, please contact us
          at:{" "}
          <a
            className="text-blue-400 hover:text-blue-300"
            href="mailto:contact@rehi.app"
          >
            rehimind.campaign@gmail.com
          </a>
        </p>

        <div className="text-sm text-muted-foreground">
          Last updated: November 3, 2025
        </div>
      </section>
    </main>
  );
}
