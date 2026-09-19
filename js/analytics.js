// Minor Project IPL Data Analysis & Interactive Visualizations
// Project by: Soumya Ranjan Padhi (Roll: 25/AIML-A6/DEC-8399)

export function renderAnalyticsCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded yet.');
    return;
  }

  // Set global Chart defaults for premium dark mode
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // 1. Top 10 Batsmen Chart
  const batsmenCtx = document.getElementById('chartTopBatsmen');
  if (batsmenCtx) {
    new Chart(batsmenCtx, {
      type: 'bar',
      data: {
        labels: ['V Kohli', 'SK Raina', 'RG Sharma', 'DA Warner', 'S Dhawan', 'CH Gayle', 'MS Dhoni', 'RV Uthappa', 'AB de Villiers', 'G Gambhir'],
        datasets: [{
          label: 'Total IPL Runs',
          data: [5434, 5415, 4914, 4741, 4632, 4560, 4477, 4446, 4428, 4223],
          backgroundColor: [
            'rgba(243, 168, 18, 0.85)',
            'rgba(255, 193, 7, 0.75)',
            'rgba(0, 114, 206, 0.85)',
            'rgba(242, 101, 34, 0.85)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(233, 30, 99, 0.85)',
            'rgba(253, 216, 53, 0.85)',
            'rgba(156, 39, 176, 0.75)',
            'rgba(229, 57, 53, 0.85)',
            'rgba(103, 58, 183, 0.75)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Runs: ${context.raw.toLocaleString()} runs`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Top 10 Teams by Total Runs
  const teamsCtx = document.getElementById('chartTopTeams');
  if (teamsCtx) {
    new Chart(teamsCtx, {
      type: 'bar',
      data: {
        labels: ['MI', 'RCB', 'KKR', 'CSK', 'KXIP', 'DD', 'RR', 'SRH', 'DC', 'PW'],
        datasets: [{
          label: 'Total Franchise Runs',
          data: [28164, 28126, 27419, 26418, 26331, 24388, 22431, 17059, 11463, 6358],
          backgroundColor: 'rgba(56, 189, 248, 0.75)',
          hoverBackgroundColor: 'rgba(56, 189, 248, 1)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 3. Boundaries (4s vs 6s)
  const boundariesCtx = document.getElementById('chartBoundaries');
  if (boundariesCtx) {
    new Chart(boundariesCtx, {
      type: 'bar',
      data: {
        labels: ['MI', 'RCB', 'KKR', 'KXIP', 'CSK', 'DD', 'RR', 'SRH'],
        datasets: [
          {
            label: "Fours (4s)",
            data: [2588, 2514, 2434, 2458, 2193, 2158, 1970, 1444],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 4
          },
          {
            label: "Sixes (6s)",
            data: [1096, 1132, 930, 976, 973, 801, 676, 538],
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#e2e8f0', boxWidth: 14 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 4. Over-wise Run Trend (Overs 1-20)
  const overTrendCtx = document.getElementById('chartOverTrend');
  if (overTrendCtx) {
    const overs = Array.from({ length: 20 }, (_, i) => `Ov ${i + 1}`);
    const runsPerOver = [12100, 11450, 11800, 12200, 12400, 13100, 10200, 10600, 10800, 11100, 11500, 11900, 12300, 12700, 13400, 14200, 15100, 16300, 17200, 18900];

    new Chart(overTrendCtx, {
      type: 'line',
      data: {
        labels: overs,
        datasets: [{
          label: 'Total Runs Scored Across Overs',
          data: runsPerOver,
          borderColor: '#F3A812',
          backgroundColor: 'rgba(243, 168, 18, 0.15)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#F3A812',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Over ${items[0].dataIndex + 1}`,
              label: (context) => `Total Runs: ${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          }
        }
      }
    });
  }

  // 5. Innings Run Split & Extras Breakdown
  const inningsCtx = document.getElementById('chartInningsSplit');
  if (inningsCtx) {
    new Chart(inningsCtx, {
      type: 'doughnut',
      data: {
        labels: ['1st Innings (52.1%)', '2nd Innings (47.7%)', 'Super Overs (0.2%)'],
        datasets: [{
          data: [124000, 114000, 350],
          backgroundColor: [
            'rgba(59, 130, 246, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(244, 63, 94, 0.85)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', padding: 12, boxWidth: 12 }
          }
        }
      }
    });
  }

  // 6. Extras Distribution
  const extrasCtx = document.getElementById('chartExtras');
  if (extrasCtx) {
    new Chart(extrasCtx, {
      type: 'polarArea',
      data: {
        labels: ['Wides (5,161)', 'Leg Byes (3,056)', 'No Balls (618)', 'Byes (501)'],
        datasets: [{
          data: [5161, 3056, 618, 501],
          backgroundColor: [
            'rgba(234, 179, 8, 0.75)',
            'rgba(99, 102, 241, 0.75)',
            'rgba(239, 68, 68, 0.75)',
            'rgba(20, 184, 166, 0.75)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', padding: 12, boxWidth: 12 }
          }
        }
      }
    });
  }
}
