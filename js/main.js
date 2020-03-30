var polygonSeries;
var polygonTemplate;
var graticuleSeries;
var chart;
var hs;
am4core.ready(function () {
  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  chart = am4core.create("chartdiv", am4maps.MapChart);

  // Set map definition
  chart.geodata = am4geodata_worldLow;

  // Set projection
  chart.projection = new am4maps.projections.Orthographic();
  chart.panBehavior = "rotateLongLat";
  chart.deltaLatitude = -20;
  chart.deltaLongitude = 90;
  chart.padding(20, 20, 20, 20);
  polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

  polygonSeries.useGeodata = true;

  // Configure series
  polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name}-{id}";
  polygonTemplate.fill = am4core.color("#82a1ce"); //#47c78a
  polygonTemplate.stroke = am4core.color("#bbd0f6");
  polygonTemplate.strokeWidth = 0.5;

  graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
  graticuleSeries.mapLines.template.line.stroke = am4core.color("#ffffff");
  graticuleSeries.mapLines.template.line.strokeOpacity = 0.04;
  graticuleSeries.fitExtent = false;


  chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
  chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#6887b7");

  // Create hover state and set alternative fill color
  hs = polygonTemplate.states.create("hover");
  // hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);
  hs.properties.fill = am4core.color("#576c9a");

  // map ready, local home data
  homeLocalData();
});

var animation;

function rotateTo(long, lat) {
  if (animation) {
    animation.stop();
  }
  animation = chart.animate([{
    property: "deltaLongitude",
    to: long
  }, {
    property: "deltaLatitude",
    to: lat
  }], 2000);
}

// homeData from local file,after map ready
function homeLocalData()
{
  $.ajax({
    type: "get",
    async: false,
    url: "data/v1/index/current.json?_t="+Math.random(),
    dataType: "json",
    success: function (res) {
        renderHomeData(res)
    },
    error: function () {
      homeData();
      console.log('fail');
    }
  });
}

// homeData from remote file
// homeData();
function homeData() {
  $.ajax({
    type: "get",
    async: false,
    url: "https://global.juheapi.com/coronavirus/v1/current?apikey=dCKPNUq9ShZO1RMf3smoYcIbKng5T4Mf",
    dataType: "jsonp",
    jsonp: "callback",
    success: function (res) {
        renderHomeData(res)
    },
    error: function () {
      console.log('fail');
    }
  });
}

function renderHomeData(res)
{
    var mapData = res.data.foreignlist;
    var globalData = res.data.globalStatis;
    polygonSeries.data = mapData;
    polygonTemplate.propertyFields.fill = "fill";
    polygonTemplate.tooltipText = "{name}\nConfirmed: {confirm}\nActive: {nowConfirm}\nRecovered: {heal}\nDeaths: {dead}";
    // rotateTo(90, -20);

    let animation;
    setTimeout(function(){
        animation = chart.animate({property:"deltaLongitude", to:100000}, 20000000);
    }, 3000)

    chart.seriesContainer.events.on("down", function(){
        if(animation){
            animation.stop();
        }
    })

    var tbodyHtml = '';
    for (i in mapData) {
        tbodyHtml += `<tr>
        <td>${mapData[i].name_en}</td>
        <td>${mapData[i].confirm}</td>
        <td>${mapData[i].nowConfirm}</td>
        <td>${mapData[i].heal}</td>
        <td>${mapData[i].dead}</td>
      </tr>`
    }
    $('.list-tbody').html(tbodyHtml);
    $('.nums-content .time').html("Last Updated: "+res.data.lastUpdated);

    $('.comfirmed .new-nums').html('+' + globalData.nowConfirmAdd);
    $('.recoverd .new-nums').html('+' + globalData.healAdd);
    $('.deaths .new-nums').html('+' + globalData.deadAdd);

    $('.comfirmed .block-nums').html(globalData.nowConfirm);
    $('.recoverd .block-nums').html(globalData.heal);
    $('.deaths .block-nums').html(globalData.dead);

    $('.total-comfirm').html(globalData.confirm)
}

const shareBtn = document.querySelector('.share-it');

shareBtn.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: "Global COVID-19 Live Map | JUHEAPI",
      text: "Global COVID-19 Live Map | JUHEAPI",
      url: window.location.href
    }).then(() => {
      // $('.dialog-box').show()
    })
    .catch(err => {
      // $('.dialog-box').show()
    });
  } else {
    $('.dialog-box').show()
  }
});

$('.dialog-box').click(function(e){
  var dialogContent = $('.dialog-wrapper');
  if(!dialogContent.is(e.target) && dialogContent.has(e.target).length === 0) {
    $(this).hide()
    $('.hascopyBtn').hide();
    $('.copyBtn').show()
  }
})

$('.copyBtn').click(function(){
  $('.hiddenValue').select();
  document.execCommand('Copy')
  $('.hascopyBtn').show();
  $(this).hide()
})

$(".getTop").click(function () {
  $(window).scrollTop(0)
})
$(window).on("scroll", throttle(function () {
  $(window).scrollTop() > 400 ? $(".getTop").fadeIn(150) : $(".getTop").fadeOut(150)
}))

function throttle(fn) {
  var canRun = true;
  return function () {
    if (!canRun) return;
    canRun = false;
    setTimeout(function () {
      fn.apply(this, arguments);
      canRun = true;
    }, 100)
  }
}