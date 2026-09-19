// IPL Auction Simulator Core Engine
import { formatPrice } from './teams.js';

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBidPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playHammer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Low frequency wood strike
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playSoldFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = this.ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
}

export class AuctionEngine {
  constructor(teams, players, onUpdate) {
    this.teams = teams;
    this.players = players;
    this.onUpdate = onUpdate;
    this.sound = new SoundController();

    this.currentIndex = -1;
    this.activePlayer = null;
    this.currentBid = 0;
    this.leadingTeam = null;
    this.bidHistory = [];
    this.logs = [];

    this.timer = 15;
    this.timerMax = 15;
    this.timerId = null;
    this.aiTimeoutId = null;

    this.status = 'READY'; // READY, BIDDING, SOLD, UNSOLD, PAUSED, FINISHED
    this.userTeamId = 'csk';
    this.autoAdvance = true;
    this.aiEnabled = true;

    this.addLog('SYSTEM', 'Auction Room initialized. ₹100 Cr purse allocated to all 10 franchises.');
  }

  addLog(type, message, team = null) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.unshift({ id: Date.now() + Math.random(), type, message, team, time });
    if (this.logs.length > 50) this.logs.pop();
  }

  setUserTeam(teamId) {
    this.userTeamId = teamId;
    this.teams.forEach(t => {
      t.isUser = (t.id === teamId);
    });
    this.addLog('CONFIG', `You are now managing ${this.getTeam(teamId)?.name}`);
    this.notify();
  }

  getTeam(teamId) {
    return this.teams.find(t => t.id === teamId);
  }

  getUserTeam() {
    return this.teams.find(t => t.id === this.userTeamId);
  }

  getSuggestedIncrement() {
    if (this.currentBid < 200) return 20; // 20 Lakhs
    if (this.currentBid < 500) return 25; // 25 Lakhs
    if (this.currentBid < 1000) return 50; // 50 Lakhs
    return 100; // 1 Cr
  }

  startAuction() {
    if (this.status === 'READY') {
      this.nextPlayer();
    }
  }

  nextPlayer() {
    this.clearTimers();
    this.currentIndex++;

    if (this.currentIndex >= this.players.length) {
      this.status = 'FINISHED';
      this.activePlayer = null;
      this.addLog('CELEBRATE', 'The IPL Mega Auction has concluded! Check final team squads.');
      this.notify();
      return;
    }

    this.activePlayer = this.players[this.currentIndex];
    this.activePlayer.status = 'active';
    this.currentBid = this.activePlayer.basePrice;
    this.leadingTeam = null;
    this.bidHistory = [];
    this.timer = this.timerMax;
    this.status = 'BIDDING';

    this.addLog('ANNOUNCEMENT', `Next up: ${this.activePlayer.name} (${this.activePlayer.role}, ${this.activePlayer.country}). Base Price: ${formatPrice(this.activePlayer.basePrice)}.`);
    
    this.startTimer();
    this.scheduleNextAiBid();
    this.notify();
  }

  startTimer() {
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.status !== 'BIDDING') return;

      this.timer--;
      if (this.timer <= 5 && this.timer > 0) {
        this.sound.playTick();
      }

      if (this.timer <= 0) {
        clearInterval(this.timerId);
        this.handleTimerExpiry();
      } else {
        this.notify();
      }
    }, 1000);
  }

  clearTimers() {
    clearInterval(this.timerId);
    clearTimeout(this.aiTimeoutId);
    this.timerId = null;
    this.aiTimeoutId = null;
  }

  handleTimerExpiry() {
    if (this.leadingTeam) {
      this.sellPlayer();
    } else {
      this.markUnsold();
    }
  }

  canTeamBid(team, amount) {
    if (!team || !this.activePlayer) return false;
    // Squad capacity check
    if (team.players.length >= team.maxPlayers) return false;
    // Overseas limit check
    if (this.activePlayer.isOverseas && team.overseasCount >= team.maxOverseas) return false;
    // Minimum purse reservation check (keep at least 50L per remaining unfilled required slot)
    const emptySlots = Math.max(0, team.minPlayers - (team.players.length + 1));
    const safetyReserve = emptySlots * 50;
    if (team.purse - amount < safetyReserve) return false;
    return true;
  }

  placeBid(teamId, customIncrement = null) {
    if (this.status !== 'BIDDING' || !this.activePlayer) return false;

    const team = this.getTeam(teamId);
    if (!team) return false;

    // Determine new bid amount
    let nextBid;
    if (this.leadingTeam === null) {
      // First bid can be at base price
      nextBid = this.activePlayer.basePrice;
    } else {
      const increment = customIncrement || this.getSuggestedIncrement();
      nextBid = this.currentBid + increment;
    }

    if (this.leadingTeam && this.leadingTeam.id === teamId) {
      // Already highest bidder
      return false;
    }

    if (!this.canTeamBid(team, nextBid)) {
      if (team.isUser) {
        alert(`${team.shortName} cannot bid ${formatPrice(nextBid)}! Check purse reserve, overseas cap (${team.overseasCount}/${team.maxOverseas}), or squad limit.`);
      }
      return false;
    }

    // Apply bid
    this.currentBid = nextBid;
    this.leadingTeam = team;
    this.timer = this.timerMax; // Reset hammer timer on new bid

    this.bidHistory.unshift({
      team: team,
      amount: nextBid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    this.sound.playBidPing();
    this.addLog('BID', `${team.shortName} bids ${formatPrice(nextBid)} for ${this.activePlayer.name}`, team);

    this.scheduleNextAiBid();
    this.notify();
    return true;
  }

  scheduleNextAiBid() {
    clearTimeout(this.aiTimeoutId);
    if (!this.aiEnabled || this.status !== 'BIDDING') return;

    // Pick delay between 1.8s and 4.0s for authentic broadcast tension
    const delay = Math.floor(Math.random() * 2200) + 1800;

    this.aiTimeoutId = setTimeout(() => {
      this.evaluateAiBids();
    }, delay);
  }

  evaluateAiBids() {
    if (this.status !== 'BIDDING' || !this.activePlayer) return;

    const increment = this.getSuggestedIncrement();
    const candidateBid = (this.leadingTeam === null) ? this.activePlayer.basePrice : this.currentBid + increment;

    // Filter available AI teams
    const eligibleTeams = this.teams.filter(t => {
      if (t.isUser) return false; // Never bid on behalf of user
      if (this.leadingTeam && t.id === this.leadingTeam.id) return false;
      return this.canTeamBid(t, candidateBid);
    });

    if (eligibleTeams.length === 0) return;

    // AI valuation based on rating, role priority, and budget percentage
    const interestedTeams = eligibleTeams.filter(team => {
      // Max price this team is willing to pay based on player rating and purse
      const baseValuation = (this.activePlayer.rating / 100) * (team.purse * 0.28);
      const roleBonus = team.priorityRoles.includes(this.activePlayer.role) ? 1.25 : 1.0;
      const marqueeBonus = this.activePlayer.set.includes('Marquee') ? 1.3 : 1.0;
      const maxWillingPrice = Math.max(this.activePlayer.basePrice, baseValuation * roleBonus * marqueeBonus);

      // Random factor (0.85 to 1.15) for unpredictability
      const willingnessFactor = 0.85 + Math.random() * 0.3;
      return candidateBid <= (maxWillingPrice * willingnessFactor);
    });

    if (interestedTeams.length > 0) {
      // Pick the team with the highest appetite
      const chosenTeam = interestedTeams[Math.floor(Math.random() * interestedTeams.length)];
      this.placeBid(chosenTeam.id);
    }
  }

  sellPlayer() {
    this.clearTimers();
    this.status = 'SOLD';
    this.activePlayer.status = 'sold';
    this.activePlayer.soldTo = this.leadingTeam.id;
    this.activePlayer.soldPrice = this.currentBid;

    // Deduct purse and update squad
    this.leadingTeam.purse -= this.currentBid;
    this.leadingTeam.players.push({
      ...this.activePlayer,
      boughtPrice: this.currentBid
    });
    if (this.activePlayer.isOverseas) {
      this.leadingTeam.overseasCount++;
    }

    this.sound.playHammer();
    setTimeout(() => this.sound.playSoldFanfare(), 300);

    this.addLog('SOLD', `🔨 SOLD! ${this.activePlayer.name} goes to ${this.leadingTeam.name} for ${formatPrice(this.currentBid)}!`, this.leadingTeam);
    this.notify();

    if (this.autoAdvance) {
      setTimeout(() => {
        if (this.status === 'SOLD') {
          this.nextPlayer();
        }
      }, 4000);
    }
  }

  markUnsold() {
    this.clearTimers();
    this.status = 'UNSOLD';
    this.activePlayer.status = 'unsold';
    this.sound.playHammer();

    this.addLog('UNSOLD', `🔨 UNSOLD! No bids placed for ${this.activePlayer.name}. Player will return in the accelerated round.`);
    this.notify();

    if (this.autoAdvance) {
      setTimeout(() => {
        if (this.status === 'UNSOLD') {
          this.nextPlayer();
        }
      }, 3500);
    }
  }

  passActivePlayer() {
    if (this.status !== 'BIDDING') return;
    if (this.leadingTeam) {
      this.sellPlayer();
    } else {
      this.markUnsold();
    }
  }

  togglePause() {
    if (this.status === 'BIDDING') {
      this.status = 'PAUSED';
      this.clearTimers();
      this.addLog('PAUSE', 'Auction paused by auctioneer.');
    } else if (this.status === 'PAUSED') {
      this.status = 'BIDDING';
      this.startTimer();
      this.scheduleNextAiBid();
      this.addLog('RESUME', 'Auction resumed.');
    }
    this.notify();
  }

  exportResultsCSV() {
    const headers = ['Player ID', 'Player Name', 'Country', 'Role', 'Set', 'Base Price (Lakhs)', 'Status', 'Sold To Team', 'Sold Price (Lakhs)', 'Sold Price Formatted'];
    const rows = this.players.map(p => {
      const team = p.soldTo ? this.getTeam(p.soldTo)?.shortName : 'N/A';
      return [
        p.id,
        `"${p.name}"`,
        p.country,
        p.role,
        `"${p.set}"`,
        p.basePrice,
        p.status,
        team,
        p.soldPrice || 0,
        p.soldPrice ? `"${formatPrice(p.soldPrice)}"` : 'N/A'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IPL_Auction_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  notify() {
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
}
