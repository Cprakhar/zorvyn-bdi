import { API_BASE_URL } from "@/lib/api";

interface HeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

export function Header({ isAuthenticated, onSignOut }: HeaderProps) {
  return (
    <header className="hero">
      <div>
        <span className="badge">Live Dashboard</span>
        <h1>Fluxboard Finance Console</h1>
        <p>Track cashflow, analyze trends, and manage records with role-aware controls.</p>
      </div>
      <div className="actions">
        <a className="btn btn-secondary" href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer">
          API Docs
        </a>
        {isAuthenticated ? (
          <button type="button" className="btn btn-secondary" onClick={onSignOut}>
            Sign Out
          </button>
        ) : null}
      </div>
    </header>
  );
}
