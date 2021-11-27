const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var ms = 0;
var schedule;
var pdate = 0;
var pr;

function setDate() {
    var today = new Date();
    var day = days[today.getDay()];
    var month = months[today.getMonth()];
    var date = today.getDate();
    var hr = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();
    var period = "AM";
    ms = ms = today.getMilliseconds();
    if(hr % 4 == 0 && min == 0 && sec == 0) {
        setWeather();
    }
    if(min < 10) {
        min = "0"+min;
    }
    if(hr >= 12) {
        if(hr > 12) {
            hr -= 12;
        }
        period = "PM";
    }
    if(hr == 0) {
        hr += 12;
    }
    $("#date").text(`${day}, ${month} ${date}`);
    $("#time").text(`${hr}:${min} ${period}`);
    pr.then(() => {
        updateSchedule();
    }).catch(() => {
        $("#cycle").text("Something went wrong :(");
        $(".arrows").empty();
        $(".periods").empty();
        $(".start-times").empty();
        $("#next-period").text("No schedule loaded");
    });
    if(pdate != date) {
        setSchedule();
        pdate = date;
    }
}
function setSchedule() {
    pr = new Promise((resolve, reject) => {
        try {
            $.getJSON("https://maclyonsden.com/api/term/current", function(term) {
                if(term === undefined) {
                    reject();
                }
                $.getJSON(`https://maclyonsden.com/api/term/${term.id}/schedule`, function(sched) {
                    if(sched === undefined) {
                        reject();
                    }
                    schedule = sched;
                    $("#cycle").text(schedule[0].cycle);
                    $(".arrows").empty();
                    $(".periods").empty();
                    $(".start-times").empty();
                    $("#next-period").text("No schedule loaded");
                    var time;
                    for(var i = 0; i < schedule.length; i++) {
                        if(i == ~~(schedule.length/2) && i > 0) {
                            time = schedule[i-1].description.time;
                            time = time.slice(time.lastIndexOf('-')+1).trim();
                            $(".arrows").append(`<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`);
                            $(".periods").append(`<h3>Lunch</h3>`);
                            $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
                        }
                        time = schedule[i].description.time;
                        time = time.slice(0, time.indexOf("-")).trim();
                        $(".arrows").append(`<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`);
                        $(".periods").append(`<h3>${schedule[i].description.course}</h3>`);
                        $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
                        $(".arrows").children().css("color", $(":root").css("--bg-grey"));
                    }
                    resolve();
                }).fail(() => {
                    reject();
                });
            }).fail(() => {
                reject();
            });
        } catch(err) {
            reject();
        }
    });
}
function updateSchedule() {
    var curr = new Date();
    var idx = -1;
    try {
        var mid = ~~(schedule.length/2);
        for(var i = 0; i < schedule.length; i++) {
            if(Date.parse(schedule[i].time.start) < curr.getTime() && curr.getTime() < Date.parse(schedule[i].time.end)) {
                idx = i;
                if(i >= mid) {
                    idx += 1;
                }
                break;
            }
        }
        if(idx == -1 && Date.parse(schedule[mid-1].time.end) < curr.getTime() && curr.getTime() < Date.parse(schedule[mid].time.start)) {
            idx = mid;
        }
        $(".arrows").children().css("color", $(":root").css("--bg-grey"));
        if(idx != -1) {
            $(".arrows").children().eq(idx).css("color", $(":root").css("--gold"));
        }
        if(idx == -1) {
            if(curr.getTime() < Date.parse(schedule[0].time.start) && curr.getDate() == new Date(Date.parse(schedule[0].time.start)).getDate()) {
                var next = new Date(Date.parse(schedule[0].time.start));
                var hr = next.getHours() - curr.getHours();
                var min = next.getMinutes() - curr.getMinutes();
                if(min < 0) {
                    min = 60+min;
                    hr--;
                }
                if(min < 10) {
                    min = "0"+min;
                }
                $("#next-period").text(`School starts in ${hr}:${min}`);
            } else {
                $("#next-period").text(`School is over`);
            }
        } else {
            var next;
            if(idx == mid) {
                next = new Date(Date.parse(schedule[mid].time.start));
            } else {
                next = new Date(Date.parse(schedule[(idx < mid ? idx : idx-1)].time.end));
            }
            var hr = next.getHours() - curr.getHours();
            var min = next.getMinutes() - curr.getMinutes();
            if(min < 0) {
                min = 60+min;
                hr--;
            }
            var hours = (hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "");
            var minutes = `${min} minute${min != 1 ? "s" : ""}`;
            $("#next-period").text((idx == schedule.length ? "School" : (idx == mid ? "Lunch" : "Period")) + ` ends in ${hours}${minutes}`);
        }
    } catch(err) {}
}
function setWeather() {
    var weather;
    new Promise((resolve, reject) => {
        var apikey = localStorage.getItem("accuweather-api-key");    
        try {
            $.getJSON(`https://dataservice.accuweather.com/currentconditions/v1/49569?apikey=${apikey}`, function(wth) {
                if(wth == undefined) {
                    reject();
                }
                weather = wth[0];
                resolve();
            }).fail(() => {
                reject();
                console.log('asdf');
            });
        } catch(err) {
            reject();
        }
    }).then(() => {
        $("#w-icon").show();
        $("#w-icon").attr("src", `https://www.accuweather.com/images/weathericons/${weather.WeatherIcon}.svg`);
        $("#temp").text(`${weather.Temperature.Metric.Value.toFixed(1)}°C`)
    }).catch(() => {
        $("#w-icon").hide();
        $("#temp").text("Weather Unavailable");
    });
}

$(document).ready(function() {
    setSchedule();
    setWeather();
    setDate();
    setTimeout(setInterval(setDate, 500), 1000-ms);
});