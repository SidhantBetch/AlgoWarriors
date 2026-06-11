document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('aw_token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Set Profile Data
    try {
        const user = JSON.parse(localStorage.getItem('aw_user'));
        const profileNameEl = document.getElementById('profileName');
        const profileInitialsEl = document.getElementById('profileInitials');
        if (user && user.name && profileNameEl && profileInitialsEl) {
            profileNameEl.innerText = user.name;
            profileInitialsEl.innerText = user.name.charAt(0).toUpperCase();
        }
    } catch(e) {}

    // Daily Chart
    const dailyCanvas = document.getElementById('dailyChart');
    if (dailyCanvas) {
      const dailyCtx = dailyCanvas.getContext('2d');
    new Chart(dailyCtx, {
      type: 'bar',
      data: {
        labels: ['1 Mar','2 Mar','3 Mar','4 Mar','5 Mar','6 Mar','7 Mar','8 Mar','9 Mar','10 Mar','11 Mar','12 Mar','13 Mar','14 Mar'],
        datasets: [
          {
            label: 'Scores',
            data: [40,60,70,50,80,90,30,60,75,85,55,65,95,70],
            backgroundColor: '#00d4ff'
          },
          {
            label: 'Referrals',
            data: [10,20,15,25,30,20,10,15,25,20,30,15,20,25],
            backgroundColor: '#a020f0'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff' }
          },
          x: {
            ticks: { color: '#fff' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        }
      }
    });

    }

    // Balance Chart
    const balanceCanvas = document.getElementById('balanceChart');
    if (balanceCanvas) {
      const balanceCtx = balanceCanvas.getContext('2d');
    new Chart(balanceCtx, {
      type: 'doughnut',
      data: {
        labels: ['Scores', 'Referrals'],
        datasets: [{
          data: [1872, 500],
          backgroundColor: ['#00d4ff', '#a020f0']
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        }
      }
    });
    }
});
