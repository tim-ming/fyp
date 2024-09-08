import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-icon-placeholder">
          <img src="/appicon.jpg" alt="App Icon" />
        </div>
        <h1>Hariku</h1>
        <p>Your mental health companion</p>
      </header>

      <main className="content">
        <section className="policy-section">
          <h2>Privacy Policy</h2>
          <p>
            At Hariku, we prioritize your privacy and are committed to
            protecting your personal data. This policy outlines how we collect,
            use, and safeguard your information while you use our mobile app. By
            using Hariku, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </section>

        <section className="policy-section">
          <h2>Terms of Service</h2>
          <p>
            Welcome to Hariku! These terms govern your use of our mobile app. By
            accessing or using the app, you agree to be bound by these terms. We
            may update these terms from time to time, and it's your
            responsibility to review them periodically. If you disagree with any
            part of these terms, please discontinue using the app.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Hariku - All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default App;
