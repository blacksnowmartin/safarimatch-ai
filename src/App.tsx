import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3Modal from 'web3modal';
import { BrowserProvider } from 'ethers';
import { dot, norm } from 'mathjs';
import { mockProfiles } from './mockProfiles';

interface Profile {
  skills: string;
  interests: string;
  location: string;
}

interface MatchProfile extends Profile {
  wallet: string;
  score: number;
}

const getVector = (text: string): number[] => {
  return text.split(',').map(s => s.trim().length);
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = dot(vecA, vecB) as number;
  const normA = norm(vecA) as number;
  const normB = norm(vecB) as number;
  return dotProduct / (normA * normB);
};

const findMatches = (userProfile: Profile): MatchProfile[] => {
  const userVec = getVector(userProfile.skills + ',' + userProfile.interests);
  return mockProfiles
    .map((p: Profile & { wallet: string }) => ({
      ...p,
      score: cosineSimilarity(userVec, getVector(p.skills + ',' + p.interests))
    }))
    .sort((a: MatchProfile, b: MatchProfile) => b.score - a.score)
    .slice(0, 3);
};

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    skills: '',
    interests: '',
    location: ''
  });
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const web3Modal = new Web3Modal({ network: 'mainnet', cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = () => {
    const foundMatches = findMatches(profile);
    setMatches(foundMatches);
  };

  return (
    <div className="App">
      <header className="hero">
        <div className="hero__content">
          <img src={logo} className="hero__logo" alt="SafariMatch logo" />
          <div>
            <p className="eyebrow">Web3 Talent Graph · Africa</p>
            <h1>SafariMatch AI</h1>
            <p className="subtitle">
              Connect your wallet, share your skills, and let our matching engine surface collaborators,
              investors, and opportunities across the continent.
            </p>
            <div className="hero__actions">
              <button
                className="btn btn-primary"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {account ? 'Reconnect Wallet' : isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => window.open('https://reactjs.org', '_blank')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
        <div className="hero__status">
          {account ? (
            <>
              <p className="status-label">Connected Wallet</p>
              <p className="status-value">{account.slice(0, 6)}…{account.slice(-4)}</p>
              <p className="status-hint">Complete your builder profile to discover DAO-ready matches.</p>
            </>
          ) : (
            <>
              <p className="status-label">Wallet not connected</p>
              <p className="status-hint">Tap the button above to authenticate with your preferred wallet.</p>
            </>
          )}
        </div>
      </header>

      <main className="dashboard">
        <section className="panel profile-panel">
          <div className="panel__header">
            <h2>Builder Profile</h2>
            <p>Share the skills and focus areas you want collaborators to see.</p>
          </div>
          <div className="form-grid">
            <label>
              <span>Skills</span>
              <input
                placeholder="react, solidity, growth"
                value={profile.skills}
                disabled={!account}
                onChange={e => setProfile({ ...profile, skills: e.target.value })}
              />
            </label>
            <label>
              <span>Interests</span>
              <input
                placeholder="defi, climate, payments"
                value={profile.interests}
                disabled={!account}
                onChange={e => setProfile({ ...profile, interests: e.target.value })}
              />
            </label>
            <label>
              <span>Location</span>
              <input
                placeholder="Nairobi, Lagos, Accra…"
                value={profile.location}
                disabled={!account}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
              />
            </label>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={handleSubmit}
            disabled={!account || !profile.skills || !profile.interests}
          >
            Generate Matches
          </button>
          {!account && <p className="panel__hint">Connect your wallet to unlock profile editing.</p>}
        </section>

        <section className="panel matches-panel">
          <div className="panel__header">
            <h2>Top Matches</h2>
            <p>Ranked using cosine similarity on your skills and interests.</p>
          </div>
          {matches.length === 0 ? (
            <div className="empty-state">
              <p>{account ? 'Share your profile details to see recommended builders.' : 'Connect your wallet to preview recommendations.'}</p>
            </div>
          ) : (
            <ul className="matches-list">
              {matches.map(match => (
                <li key={match.wallet} className="match-card">
                  <div>
                    <p className="match-wallet">{match.wallet}</p>
                    <p className="match-meta">
                      {match.location} · {match.skills}
                    </p>
                  </div>
                  <span className="match-score">{match.score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
