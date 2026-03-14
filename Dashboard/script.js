
    // Daily Chart
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
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

    // Balance Chart
    const balanceCtx = document.getElementById('balanceChart').getContext('2d');
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
