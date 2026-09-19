// Main Application Controller
import { INITIAL_TEAMS, formatPrice } from './teams.js';
import { PLAYERS_DATABASE } from './players.js';
import { AuctionEngine } from './auction.js';
import { renderAnalyticsCharts } from './analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  // Deep clone data to allow reset/replays
  const teams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
  const players = JSON.parse(JSON.stringify(PLAYERS_DATABASE));

  let chartsInitialized = false;

  // Initialize Auction Engine
  const auction = new AuctionEngine(teams, players, updateUI);

  // Cache DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');
  const userTeamSelect = document.getElementById('userTeamSelect');
  const btnSoundToggle = document.getElementById('btnSoundToggle');

  // Auction Stage Elements
  const playerAvatar = document.getElementById('playerAvatar');
  const playerTags = document.getElementById('playerTags');
  const playerName = document.getElementById('playerName');
  const playerBio = document.getElementById('playerBio');
  const statMatches = document.getElementById('statMatches');
  const statRuns = document.getElementById('statRuns');
  const statSR = document.getElementById('statSR');
  const statAvg = document.getElementById('statAvg');
  const statBasePrice = document.getElementById('statBasePrice');
  const currentBidDisplay = document.getElementById('currentBidDisplay');
  const timerBox = document.getElementById('timerBox');
  const timerSeconds = document.getElementById('timerSeconds');
  const leadingBadgeCircle = document.getElementById('leadingBadgeCircle');
  const leadingTeamName = document.getElementById('leadingTeamName');
  const leadingTeamSub = document.getElementById('leadingTeamSub');
  const auctionStatePill = document.getElementById('auctionStatePill');
  const btnMainBid = document.getElementById('btnMainBid');
  const btnBidAmount = document.getElementById('btnBidAmount');
  const btnIncList = document.querySelectorAll('.btn-inc');
  const btnSellGavel = document.getElementById('btnSellGavel');
  const btnPassPlayer = document.getElementById('btnPassPlayer');
  const btnPauseAuction = document.getElementById('btnPauseAuction');
  const btnNextPlayer = document.getElementById('btnNextPlayer');
  const auctionLogFeed = document.getElementById('auctionLogFeed');

  // User Quick Tracker Elements
  const userSquadHeader = document.getElementById('userSquadHeader');
  const userSlotsPill = document.getElementById('userSlotsPill');
  const userPurseDisplay = document.getElementById('userPurseDisplay');
  const userPurseBar = document.getElementById('userPurseBar');
  const userOverseasCount = document.getElementById('userOverseasCount');

  // Teams & Players Elements
  const teamsGrid = document.getElementById('teamsGrid');
  const playersTableBody = document.getElementById('playersTableBody');
  const playerSearchInput = document.getElementById('playerSearchInput');
  const setFilterSelect = document.getElementById('setFilterSelect');
  const roleFilterSelect = document.getElementById('roleFilterSelect');
  const statusFilterSelect = document.getElementById('statusFilterSelect');
  const btnExportCSV = document.getElementById('btnExportCSV');

  // Modal Elements
  const squadModal = document.getElementById('squadModal');
  const modalTeamTitle = document.getElementById('modalTeamTitle');
  const modalSquadBody = document.getElementById('modalSquadBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const soldToast = document.getElementById('soldToast');
  const soldToastText = document.getElementById('soldToastText');

  // --- TAB NAVIGATION ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const activeView = document.getElementById(`view${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
      if (activeView) activeView.classList.add('active');

      if (targetTab === 'analytics' && !chartsInitialized) {
        chartsInitialized = true;
        setTimeout(() => renderAnalyticsCharts(), 50);
      }
      if (targetTab === 'teams') {
        renderTeamsGrid();
      }
      if (targetTab === 'players') {
        renderPlayersTable();
      }
    });
  });

  // --- FRANCHISE SELECTOR ---
  userTeamSelect.addEventListener('change', (e) => {
    auction.setUserTeam(e.target.value);
  });

  // --- SOUND TOGGLE ---
  btnSoundToggle.addEventListener('click', () => {
    auction.sound.muted = !auction.sound.muted;
    btnSoundToggle.textContent = auction.sound.muted ? '🔇' : '🔊';
  });

  // --- BIDDING CONTROLS ---
  btnMainBid.addEventListener('click', () => {
    auction.placeBid(auction.userTeamId);
  });

  btnIncList.forEach(btn => {
    btn.addEventListener('click', () => {
      const inc = parseInt(btn.getAttribute('data-inc'), 10);
      auction.placeBid(auction.userTeamId, inc);
    });
  });

  btnSellGavel.addEventListener('click', () => {
    auction.sellPlayer();
  });

  btnPassPlayer.addEventListener('click', () => {
    auction.passActivePlayer();
  });

  btnPauseAuction.addEventListener('click', () => {
    auction.togglePause();
  });

  btnNextPlayer.addEventListener('click', () => {
    auction.nextPlayer();
  });

  btnExportCSV.addEventListener('click', () => {
    auction.exportResultsCSV();
  });

  // --- MODAL CONTROLS ---
  modalCloseBtn.addEventListener('click', () => {
    squadModal.classList.remove('active');
  });

  squadModal.addEventListener('click', (e) => {
    if (e.target === squadModal) {
      squadModal.classList.remove('active');
    }
  });

  // --- PLAYER POOL FILTERS ---
  [playerSearchInput, setFilterSelect, roleFilterSelect, statusFilterSelect].forEach(el => {
    el.addEventListener('input', renderPlayersTable);
  });

  // --- UI UPDATE CALLBACK ---
  let lastSoldId = null;

  function updateUI(state) {
    const p = state.activePlayer;
    const userTeam = state.getUserTeam();

    // 1. Active Player Display
    if (p) {
      playerAvatar.textContent = p.avatar || '🏏';
      playerName.textContent = p.name;
      playerBio.textContent = p.bio || '';
      playerTags.innerHTML = `
        <span class="tag-badge tag-set">${p.set}</span>
        <span class="tag-badge tag-role">${p.role}</span>
        <span class="tag-badge tag-country">${p.country} ${p.isOverseas ? '✈️' : '🇮🇳'}</span>
      `;

      statMatches.textContent = p.stats.matches;
      statRuns.textContent = p.stats.runs ? p.stats.runs.toLocaleString() : '0';
      statSR.textContent = p.stats.strikeRate || '0.0';
      statAvg.textContent = p.stats.average || '0.0';
      statBasePrice.textContent = formatPrice(p.basePrice);
    } else {
      playerName.textContent = state.status === 'FINISHED' ? 'Auction Completed' : 'Waiting to Begin';
      playerBio.textContent = state.status === 'FINISHED' ? 'All sets have been auctioned.' : 'Click Next Player to start the auction.';
    }

    // 2. Current Bid & Timer
    currentBidDisplay.textContent = formatPrice(state.currentBid);
    timerSeconds.textContent = state.timer;
    if (state.timer <= 5 && state.status === 'BIDDING') {
      timerBox.classList.add('warning');
    } else {
      timerBox.classList.remove('warning');
    }

    // 3. Leading Team Display
    if (state.leadingTeam) {
      leadingBadgeCircle.textContent = state.leadingTeam.badgeText;
      leadingBadgeCircle.style.background = state.leadingTeam.color;
      leadingBadgeCircle.style.color = state.leadingTeam.textColor || '#fff';
      leadingTeamName.textContent = state.leadingTeam.name;
      leadingTeamSub.textContent = `Current highest bidder with ${formatPrice(state.currentBid)}`;
    } else {
      leadingBadgeCircle.textContent = '--';
      leadingBadgeCircle.style.background = '#334155';
      leadingTeamName.textContent = 'No Bids Yet';
      leadingTeamSub.textContent = 'Waiting for opening bid';
    }

    // 4. Auction Status Pill
    if (state.status === 'BIDDING') {
      auctionStatePill.textContent = state.timer <= 5 ? 'GOING ONCE... GOING TWICE!' : 'BIDDING OPEN';
      auctionStatePill.style.background = state.timer <= 5 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(243, 168, 18, 0.2)';
      auctionStatePill.style.color = state.timer <= 5 ? '#f43f5e' : '#F3A812';
    } else if (state.status === 'SOLD') {
      auctionStatePill.textContent = '🔨 SOLD';
      auctionStatePill.style.background = 'rgba(16, 185, 129, 0.2)';
      auctionStatePill.style.color = '#10b981';
    } else if (state.status === 'UNSOLD') {
      auctionStatePill.textContent = 'UNSOLD';
      auctionStatePill.style.background = 'rgba(244, 63, 94, 0.2)';
      auctionStatePill.style.color = '#f43f5e';
    } else if (state.status === 'PAUSED') {
      auctionStatePill.textContent = '⏸️ PAUSED';
      auctionStatePill.style.background = 'rgba(255, 255, 255, 0.1)';
      auctionStatePill.style.color = '#fff';
    }

    // 5. Bidding Buttons for User Team
    const increment = state.getSuggestedIncrement();
    btnBidAmount.textContent = `+ ${formatPrice(increment)}`;
    const candidateBid = (state.leadingTeam === null) ? (p ? p.basePrice : 0) : (state.currentBid + increment);
    const canBid = state.status === 'BIDDING' && state.canTeamBid(userTeam, candidateBid) && !(state.leadingTeam && state.leadingTeam.id === userTeam.id);
    btnMainBid.disabled = !canBid;

    btnIncList.forEach(btn => {
      const customInc = parseInt(btn.getAttribute('data-inc'), 10);
      const incCandidate = state.currentBid + customInc;
      btn.disabled = !state.status === 'BIDDING' || !state.canTeamBid(userTeam, incCandidate) || (state.leadingTeam && state.leadingTeam.id === userTeam.id);
    });

    btnPauseAuction.innerHTML = state.status === 'PAUSED' ? '<span>▶️</span> Resume' : '<span>⏸️</span> Pause';

    // 6. User Squad Quick Tracker
    if (userTeam) {
      userSquadHeader.textContent = `${userTeam.badgeText} - ${userTeam.shortName}`;
      userSlotsPill.textContent = `${userTeam.players.length}/${userTeam.maxPlayers} Slots`;
      userPurseDisplay.textContent = formatPrice(userTeam.purse);
      const pct = Math.max(0, Math.min(100, (userTeam.purse / userTeam.initialPurse) * 100));
      userPurseBar.style.width = `${pct}%`;
      userOverseasCount.textContent = `${userTeam.overseasCount} / ${userTeam.maxOverseas}`;
    }

    // 7. Live Auction Logs
    renderLogs(state.logs);

    // 8. Sold Toast Notification
    if (state.status === 'SOLD' && p && lastSoldId !== p.id) {
      lastSoldId = p.id;
      showSoldToast(`🔨 SOLD! ${p.name} acquired by ${state.leadingTeam.name} for ${formatPrice(p.soldPrice)}!`);
    }

    // Render teams grid and players if visible
    renderTeamsGrid();
    renderPlayersTable();
  }

  function renderLogs(logs) {
    auctionLogFeed.innerHTML = logs.map(l => {
      return `
        <div class="log-entry ${l.type}">
          <div class="log-header">
            <span class="log-team">${l.team ? l.team.shortName : 'AUCTIONEER'}</span>
            <span>${l.time}</span>
          </div>
          <div>${l.message}</div>
        </div>
      `;
    }).join('');
  }

  function showSoldToast(msg) {
    soldToastText.textContent = msg;
    soldToast.classList.add('show');
    setTimeout(() => {
      soldToast.classList.remove('show');
    }, 3800);
  }

  // --- RENDER TEAMS GRID (TAB 2) ---
  function renderTeamsGrid() {
    if (!teamsGrid) return;
    teamsGrid.innerHTML = auction.teams.map(t => {
      const isUser = t.id === auction.userTeamId;
      const spent = t.initialPurse - t.purse;
      const spentPct = (spent / t.initialPurse) * 100;

      const playerChips = t.players.slice(0, 6).map(p => {
        return `<span class="player-chip">${p.name} (${formatPrice(p.boughtPrice)})</span>`;
      }).join('');

      const moreCount = t.players.length > 6 ? `<span class="player-chip" style="color: var(--ipl-gold);">+${t.players.length - 6} more</span>` : '';

      return `
        <div class="team-card ${isUser ? 'user-managed' : ''}" data-team-id="${t.id}">
          <div class="team-top">
            <div class="team-title-wrap">
              <div class="team-badge-circle" style="background: ${t.color}; color: ${t.textColor || '#fff'}">
                ${t.badgeText}
              </div>
              <div>
                <h4>${t.name}</h4>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isUser ? '⭐ Managed by You' : 'AI Managed'}</span>
              </div>
            </div>
            <div class="team-purse-val">${formatPrice(t.purse)}</div>
          </div>

          <div class="purse-bar-track">
            <div class="purse-bar-fill" style="width: ${100 - spentPct}%;"></div>
          </div>

          <div class="team-stat-row">
            <span>Squad: <strong>${t.players.length} / ${t.maxPlayers}</strong></span>
            <span>Overseas: <strong>${t.overseasCount} / ${t.maxOverseas}</strong></span>
            <span>Spent: <strong>${formatPrice(spent)}</strong></span>
          </div>

          <div class="player-chips-list">
            ${playerChips || '<span style="font-size: 0.75rem; color: var(--text-dim);">No players acquired yet</span>'}
            ${moreCount}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to team cards to view squad modal
    document.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', () => {
        const teamId = card.getAttribute('data-team-id');
        openTeamSquadModal(teamId);
      });
    });
  }

  // --- SQUAD MODAL ---
  function openTeamSquadModal(teamId) {
    const team = auction.getTeam(teamId);
    if (!team) return;

    modalTeamTitle.textContent = `${team.name} — Full Squad (${team.players.length} Players)`;
    
    if (team.players.length === 0) {
      modalSquadBody.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏏</div>
          <p>No players acquired yet in this auction.</p>
          <p style="font-size: 0.8rem; margin-top: 0.25rem;">Remaining Purse: <strong>${formatPrice(team.purse)}</strong></p>
        </div>
      `;
    } else {
      modalSquadBody.innerHTML = `
        <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <span>Remaining Purse: <strong style="color: var(--ipl-gold);">${formatPrice(team.purse)}</strong></span>
          <span>Overseas Players: <strong>${team.overseasCount} / ${team.maxOverseas}</strong></span>
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Role</th>
              <th>Country</th>
              <th>Rating</th>
              <th>Bought For</th>
            </tr>
          </thead>
          <tbody>
            ${team.players.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="tag-badge tag-role">${p.role}</span></td>
                <td>${p.country} ${p.isOverseas ? '✈️' : '🇮🇳'}</td>
                <td>⭐ ${p.rating}</td>
                <td style="color: var(--ipl-gold); font-weight: 700;">${formatPrice(p.boughtPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    squadModal.classList.add('active');
  }

  // --- RENDER PLAYERS TABLE (TAB 3) ---
  function renderPlayersTable() {
    if (!playersTableBody) return;

    const query = (playerSearchInput?.value || '').toLowerCase();
    const setFilter = setFilterSelect?.value || 'all';
    const roleFilter = roleFilterSelect?.value || 'all';
    const statusFilter = statusFilterSelect?.value || 'all';

    const filtered = auction.players.filter(p => {
      const matchName = p.name.toLowerCase().includes(query) || p.country.toLowerCase().includes(query);
      const matchSet = setFilter === 'all' || p.set.includes(setFilter);
      const matchRole = roleFilter === 'all' || p.role === roleFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchName && matchSet && matchRole && matchStatus;
    });

    playersTableBody.innerHTML = filtered.map(p => {
      const soldTeam = p.soldTo ? auction.getTeam(p.soldTo) : null;
      let statusBadge = '';
      if (p.status === 'sold') {
        statusBadge = '<span class="tag-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">SOLD</span>';
      } else if (p.status === 'unsold') {
        statusBadge = '<span class="tag-badge" style="background: rgba(244, 63, 94, 0.2); color: #f43f5e;">UNSOLD</span>';
      } else if (p.status === 'active') {
        statusBadge = '<span class="tag-badge" style="background: rgba(243, 168, 18, 0.2); color: var(--ipl-gold);">LIVE</span>';
      } else {
        statusBadge = '<span class="tag-badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted);">UPCOMING</span>';
      }

      return `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td><span class="tag-badge tag-role">${p.role}</span></td>
          <td>${p.set}</td>
          <td>${p.country} ${p.isOverseas ? '✈️' : '🇮🇳'}</td>
          <td>${formatPrice(p.basePrice)}</td>
          <td>⭐ ${p.rating}</td>
          <td>${statusBadge}</td>
          <td>${soldTeam ? `<span style="color: ${soldTeam.color}; font-weight: 700;">${soldTeam.shortName}</span>` : '--'}</td>
          <td style="font-weight: 700; color: ${p.soldPrice ? 'var(--ipl-gold)' : 'var(--text-dim)'}">
            ${p.soldPrice ? formatPrice(p.soldPrice) : '--'}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Initial Auction Engine Start
  auction.startAuction();
});
