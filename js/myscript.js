const FITBIT_API = 'https://api.fitbit.com/'

let request = new XMLHttpRequest();
let timelist = [];
let vallist = [];
let data = [];

const urlParams = new URLSearchParams(window.location.search);
const access_token = urlParams.get('access_token');

let dates = [];
let today = new Date();
let date = new Date();
for (var i = 0; i < 7; i++) {
   date.setDate(today.getDate() - i);
   var year = date.getFullYear();
   var month = ('0' + (date.getMonth() + 1)).slice(-2);
   var day = ('0' + date.getDate()).slice(-2);
   dates[i] = year + '-' + month + '-' + day;
}

//=======================chartJS==============================
let ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
   type: 'line',
   data: {
      labels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
      datasets: [{
         label: '心拍数',
         data: [{ x: '10:00', y: 20 }, { x: '12:00', y: 20 }, { x: '13:00', y: 20 },],
         borderColor: 'rgba(132, 99, 255, 1)',
         backgroundColor: 'rgba(132, 99, 255, 0.1)'
      }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
   },
   options: {
      legend: {
         display: false
      },
      scales: {
         xAxes: [{
            scaleLabel: {
               display: true,
               labelString: '時間'
            },
            type: 'time',
            time: {
               parser: 'HH:mm',
               unit: 'hour',
               stepSize: 1,
               displayFormats: {
                  'hour': 'HH:mm'
               }
            },
            ticks: {
               min: '0:00:00',
               max: '24:00:00'
            }
         }],
         yAxes: [{
            scaleLabel: {
               display: true,
               labelString: '心拍数'
            },
            ticks: {
               min: 40,
               max: 160
            }
         }]
      },
      elements: {
         point: {
            radius: 0
         }
      }
   }
});
//======================FitBit==============================
request.onreadystatechange = function () {
   if (request.readyState == 4 && request.status == 200) {
      heart = JSON.parse(request.responseText);
      console.log(heart);
      timelist = [];
      vallist = [];
      data = [];
      for (var i in heart["activities-heart-intraday"]["dataset"]) {
         timelist[i] = heart["activities-heart-intraday"]["dataset"][i]["time"];
         vallist[i] = heart["activities-heart-intraday"]["dataset"][i]["value"];
         data[i] = { x: timelist[i], y: vallist[i] };
      }
      myChart.data.datasets[0].data = data;
      myChart.update();
   } else {
      //console.log("err");
   }
}

function getFitBit(date) {
   try{
      var url = FITBIT_API + "1/user/-/activities/heart/date/" + date + "/1d/1min.json";
      console.log(url);
      request.open('GET', url);
      request.setRequestHeader("Authorization", "Bearer " + access_token);
      request.send();
   } catch (err) {
      console.log(err);
   }
}

//===================layout=====================================
function scheduleInput(num, name, color, start, stop) {
   myChart.data.datasets[num + 1].label = name;
   myChart.data.datasets[num + 1].data = [{ x: start, y: 160 }, { x: stop, y: 160 },];
   myChart.data.datasets[num + 1].borderColor = color;
   myChart.data.datasets[num + 1].backgroundColor = color;
   myChart.update();
}

function scheduleReset(){
   for(i=0; i < 10; i++){
      myChart.data.datasets[i+1].data = [{x:"0:00",y:-1},{x:"0:00",y:-1},];;
   }
   myChart.update();
}

async function graphUpdate(num) {
   await listUpcomingEvents(new Date(dates[num]));
   await getFitBit(dates[num]);
   myChart.update();
   document.getElementById('date').textContent = dates[num];
}

function createButtons(dates) {
   var weekButtons = document.querySelector('.week-buttons');
   weekButtons.innerHTML = '';
   for (var i = 6; i >= 0; i--) {
      button = document.createElement('button');
      button.innerHTML = dates[i];
      (function (j) {
         button.onclick = () => {
            graphUpdate(j);
         };
      }(i));
      weekButtons.appendChild(button);
   }
}

graphUpdate(0);
createButtons(dates);