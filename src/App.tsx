import React, { useEffect, useState } from 'react';
import './App.css';
import Web3Modal from 'web3modal';
import { BrowserProvider } from 'ethers';
import { dot, norm } from 'mathjs';
import { mockProfiles, Profile as MockProfile } from './mockProfiles';

type DraftProfile = { skills: string; interests: string; location: string };
type StoredProfile = MockProfile;
type Match = StoredProfile & { score: number };

const STORAGE_KEY = 'safarimatch_profiles';
const PACK_URL = 'https://docs.google.com/document/d/1c8AM5CO7dLW9AbAAYfPxsJKGipphszg8pBsZHlD0vao/edit';

const toVector = (text: string) =>
  text.split(',').map(token => {
    const len = token.trim().length;
    return len === 0 ? 1 : len;
  });

const cosine = (a: number[], b: number[]) => {
  const longest = Math.max(a.length, b.length);
  if (!longest) return 0;
  const pad = (vec: number[]) =>
    vec.length === longest ? vec : [...vec, ...Array(longest - vec.length).fill(0)];
  const paddedA = pad(a);
  const paddedB = pad(b);
  const numerator = dot(paddedA, paddedB) as number;
  const denominator = (norm(paddedA) as number) * (norm(paddedB) as number);
  if (!denominator) return 0;
  const score = numerator / denominator;
  return Number.isFinite(score) ? score : 0;
};

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;
const safariPackLink = (me: string, peer: string) => `${PACK_URL}?user1=${me}&user2=${peer}`;

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [profile, setProfile] = useState<DraftProfile>({ skills: '', interests: '', location: '' });
  const [profiles, setProfiles] = useState<StoredProfile[]>(mockProfiles);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfiles(JSON.parse(saved));
    } catch {
      setProfiles(mockProfiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      const web3Modal = new Web3Modal({ network: 'mainnet', cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new BrowserProvider(instance);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } catch (err) {
      console.error('wallet error', err);
    } finally {
      setConnecting(false);
    }
  };

  const rankMatches = (source: StoredProfile, pool: StoredProfile[]) => {
    const sourceVec = toVector(`${source.skills},${source.interests}`);
    return pool
      .map(p => ({
        ...p,
        score: cosine(sourceVec, toVector(`${p.skills},${p.interests}`))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleSubmit = () => {
    if (!account) return;
    setLoadingMatches(true);
    setTimeout(() => {
      setProfiles(prev => {
        const updated = [...prev.filter(p => p.wallet !== account), { ...profile, wallet: account }];
        setMatches(rankMatches({ ...profile, wallet: account }, updated.filter(p => p.wallet !== account)));
        setLoadingMatches(false);
        return updated;
      });
    }, 150);
  };

  const resetMatches = () => setMatches([]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">SafariMatch AI</p>
          <h1>Match with builders blazing the savanna.</h1>
          <p className="lede">Share your stack, vibe, and city to discover the top 3 hackers or mentors you should DM next.</p>
        </div>
        <button className="btn primary" onClick={connectWallet} disabled={connecting}>
          {account ? 'Reconnect Wallet' : connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
        <p className="hint">{account ? `Connected: ${short(account)}` : 'No wallet connected yet.'}</p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Your Builder Profile</h2>
          <div className="form">
            {(['skills', 'interests', 'location'] as (keyof DraftProfile)[]).map(field => (
              <label key={field}>
                <span>{field === 'skills' ? 'Skills (comma list)' : field === 'interests' ? 'Interests' : 'Location'}</span>
                <input
                  placeholder={field === 'location' ? 'Nairobi, Lagos…' : 'react, solidity, climate'}
                  value={profile[field]}
                  disabled={!account}
                  onChange={e => setProfile({ ...profile, [field]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="actions">
            <button className="btn primary" disabled={!account || !profile.skills || !profile.interests || loadingMatches} onClick={handleSubmit}>
              {loadingMatches ? 'Scouting…' : 'Find Matches'}
            </button>
            <button className="btn ghost" onClick={resetMatches}>Reset Matches</button>
          </div>
        </section>

        <section className="card accent">
          <h2>Top Safari Allies</h2>
          {matches.length === 0 ? (
            <p className="hint">{account ? 'Fill in your profile to unlock recommendations.' : 'Connect a wallet to start scouting.'}</p>
          ) : (
            <ul className="match-list">
              {matches.map(match => (
                <li key={match.wallet} className="match">
                  <div>
                    <p className="wallet">{short(match.wallet)}</p>
                    <p className="meta">{match.location} · {match.skills}</p>
                    <p className="meta">Interests: {match.interests}</p>
                  </div>
                  <div className="score">
                    <span>{match.score.toFixed(2)}</span>
                    {account && (
                      <a className="btn safari-pack" href={safariPackLink(account, match.wallet)} target="_blank" rel="noreferrer">
                        Safari Pack
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card future">
          <h2>Bold Future</h2>
          <p>Every match can evolve into a Safari Pack NFT—mint it to unlock co-ownership rewards, DAO voting credits, and shared bounties tied to your collab streak.</p>
          <p>Ship together, redeem tusk points, and let the savanna decide who leads the next expedition.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
