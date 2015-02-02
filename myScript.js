popup = {
    //height: 580,
    //width: 640,
    toolbar:'no',
    menubar: 'no',
    scrollbars: 'no',
    resizable: 'no',
    location: 'no',
    directories: 'no',
    status: 'no'
}

opts = {
    lines: 11, // The number of lines to draw
    length: 11, // The length of each line
    width: 5, // The line thickness
    radius: 16, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 38, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 46, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
};

lang = undefined;

var getUrlParameter = function (sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

var Translate = function() {
    var self = this;
    this.lang = 'ru';

    this.init = function() {
        self.translateAll();
    }

    this.translateAll = function() {
        $('.translatable').each(function(){
            var attrName = 'data-tr' + self.lang;
            var newContent = $(this).attr(attrName);
            $(this).html(newContent);
        });
    }

}

var CountDown = function() {
    var self = this;
    this.value = 25*1000;
    this.dt = 1000;
    this.intervalId = undefined;
    this.divId = 'myCountDown';

    this.init = function () {
        self.initCountdown();
    }

    this.initCountdown = function () {
        self.intervalId = setInterval(self.onTick, self.dt);
    }

    this.onTick = function () {
        self.value = self.value - self.dt;
        if(lang === "ru") {
            $('#' + self.divId).html("Ждите " + self.value / 1000.0 + " секунд");
        }
        else {
            $('#' + self.divId).html("Wait " + self.value / 1000.0 + " seconds");
        }
        $('#' + self.divId).css('font-size', '18px');
        if(self.value < 0) {
            self.onFinish();
        }
    }

    this.onFinish = function () {
        $('#' + self.divId).remove();
    }
};

var LineChart = function() {
    var self = this;
    this.divId = '';
    this.title = '';
    this.type = "spline";
    this.data = [];

    this.options = {
        title: {
            text: self.title,
            fontSize: 20
        },
        data: [{
            type: self.type,
            dataPoints: self.data,
            markerSize: 0
        }],
        axisX: {
            labelFontSize: 15
        },
        axisY: {
            includeZero: false,
            gridThickness: 0,
            tickLength: 0,
            labelMaxWidth: 0,
            labelFontColor: "white",
            lineColor: "white"
        }
    };

    this.init = function(divId, title) {
        self.divId = divId;
        self.title = title;
        self.options.title.text = title;
        self.plot = new CanvasJS.Chart(self.divId, self.options);

    };

    this.render = function() {
        self.plot.render();
    };

    this.push = function(xVal, yVal) {
        self.data.push({
            x: xVal,
            y: yVal
        });
    };
}

var ArrayMax = function(arr) {
    var maxValue = arr[0].y;
    var maxIndex = arr[0].x;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i].y > maxValue) {
            maxIndex = arr[i].x;
            maxValue = arr[i].y;
        }
    }

    return maxIndex;
}

var SumGreen = function(data) {
    var sum = 0;

    for (var i = 0; i < data.length; i += 4) {
        sum += data[i+1];
    }

    return sum;
}

var RevCanvas = function(ctx) {
    ctx.translate(480, 0);
    ctx.scale(-1, 1);
}

var FillText = function(ctx, text) {
    ctx.font = '23px Calibri';
    ctx.fillStyle = 'green';

    if(lang === "ru") {
        ctx.fillText("Мой пульс", 110, 40);
        ctx.fillStyle = 'red';
        ctx.fillText(text + " bpm", 120, 70);
    }
    else {
        ctx.fillText("My heart rate is", 90, 40);
        ctx.fillStyle = 'red';
        ctx.fillText(text + " bpm", 120, 70);
    }
}

var Check = function(video) {
    var self = this;
    this.video = video;

    this.forehead_canvas  = document.querySelector("#forehead_canvas");
    this.forehead_context = self.forehead_canvas.getContext("2d");
    this.sent_canvas = document.querySelector("#sent_canvas");
    this.sent_context = self.sent_canvas.getContext("2d");
    this.result_canvas = document.querySelector("#result_canvas");
    this.result_context = self.result_canvas.getContext("2d");

    this.greenChart =  new LineChart();
    this.fftChart =  new LineChart();

    this.segm = 512;
    this.cam = 0.04;
    this.updateInterval = 20;
    this.dataLength = 500; // number of dataPoints visible at any point
    this.xVal = 0;

    this.rate = undefined;
    this.stopmark = undefined;
    this.spinner = undefined;

    this.fft_input = [];
    this.fft_output = [];

    this.k = 60/self.segm/self.cam;
    this.left = Math.round(50/self.k);
    this.right = Math.round(200/self.k);

    this.StartCheck = function() {

        RevCanvas(self.sent_context);

        if(lang === "ru") {
            self.greenChart.init("green_chart", "Зеленая компонента");
            self.fftChart.init("fft_chart", "Спектр");
        }
        else {
            self.greenChart.init("green_chart", "Green component");
            self.fftChart.init("fft_chart", "Spectrum");
        }

        self.greenChart.options.axisX.labelFontColor = "white";
        self.greenChart.options.axisX.tickLength = 0;


        //last ten init
        var last_ten = new Array();
        for (var i = self.left; i < self.right; i++) {
            last_ten[i] = new Array();
            for (var j = 0; j < 50; j++) {
                last_ten[i].push(0);
            }
        }


        var updateChart = function (count) {
            count = count || 1;

            for (var j = 0; j < count; j++) {

                var fft = new FFT_one(self.segm);

                self.sent_context.drawImage(video, 0, 0, 480, 360);
                self.forehead_context.drawImage(self.sent_canvas, 210, 110, 60, 30, 0, 0, 60, 30);
                self.result_context.drawImage(self.sent_canvas, 0, 0, 320, 240);

                var data = self.forehead_context.getImageData(0, 0, 40, 20).data;
                var sum = SumGreen(data);

                if (self.fft_input.length === self.segm) {
                    self.fft_input.shift();
                    self.fft_input.push(sum);
                }
                else {
                    self.fft_input.push(sum);
                }

                self.fft_output = fft.forward(self.fft_input);

                for (var i = self.left; i < self.right; i++) {
                    var yVal = Math.sqrt(Math.pow(self.fft_output.real[i], 2) + Math.pow(self.fft_output.imag[i], 2));

                    last_ten[i].shift();
                    last_ten[i].push(yVal);

                    var avg = last_ten[i].reduce(function (pv, cv) {
                            return pv + cv;
                        }, 0) / 50;

                    self.fftChart.push(i*self.k, avg);

                    if(isNaN(avg)) {
                        self.spinner = true;
                    }
                    else {
                        self.spinner = false;
                    }

                }
                self.rate = Math.round(ArrayMax(self.fftChart.data));
                self.greenChart.push(self.xVal, sum);
                self.xVal++;
            }
            ;
            if (self.greenChart.data.length > self.dataLength) {
                self.greenChart.data.shift();
            }

            self.fftChart.render();
            self.greenChart.render();
            self.fftChart.data.length = 0;
        };

        // generates first set of dataPoints
        updateChart(self.dataLength);

        $('#ready_button').on("click", function() {
            $("#ready_button").remove();

            yaCounter28193118.reachGoal('ready');

            CD = new CountDown();
            CD.init();

            setTimeout(function() {
                self.EndCheck();
                location.href="#results";
            }, 25000);
        });

        //update chart after specified time.
        setInterval(function () {
            if (self.stopmark !== true) {
                updateChart();
                if (self.spinner === true) {
                    $('#spinner_fft').show();
                }
                else {
                    $('#spinner_fft').hide();
                }
            }
        }, self.updateInterval);

    }

    this.EndCheck = function() {
        FillText(self.result_context, self.rate);
        self.stopmark = true;
        Photo(self.rate, self.result_canvas);
        $("#results").show();
    }
}

var Photo = function(rate, canv) {

    var dataURL = canv.toDataURL();
    var img = new Image();

    $.ajax({
        type: "POST",
        url: "upload.php",
        data: {
            image: dataURL
        }
    }).done(function (o) {

        var fb = "http://www.facebook.com/sharer/sharer.php?u=heartrate.cardiomood.com/share.php?id=";
        var vk = "http://vk.com/share.php?url=http://heartrate.cardiomood.com/share.php?id=";
        var tw = "https://twitter.com/intent/tweet?url=http://heartrate.cardiomood.com/share.php?id=";
        var ref = o + "_" + rate;

        img.src = 'http://heartrate.cardiomood.com/' + o;

        $('#share_img').prepend('<img src="' + img.src + '" />');
        $('#iframe').attr('src', fb + ref);

        if(lang === "ru") {
            $('#heart_rate').append(rate + " ударов в секунду!");
        }
        else {
            $('#heart_rate').append(rate + " bpm!");
        }

        setTimeout(function() {
            $('#spinner_share').remove();

            $('#share_fb').attr('class', "share_button fa fa-facebook");
            $('#share_vk').attr('class', "share_button fa fa-vk");
            $('#share_tw').attr('class', "share_button fa fa-twitter");

            $('#share_fb').click(function() {
                window.open(fb + ref, 'facebook_share', popup);
            });
            $('#share_vk').click(function() {
                window.open(vk + ref, 'vkontakte_share', popup);
            });
            $('#share_tw').click(function() {
                window.open(tw + ref, 'twitter_share', popup);
            });
        }, 10000);
    });
}

var RunVideo = function() {
    var video = document.querySelector("video");

    yaCounter28193118.reachGoal('checkit');

    var isChromium = window.chrome,
        vendorName = window.navigator.vendor;
    if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {

        if (navigator.webkitGetUserMedia) {

            $("#check_button").remove();

                if(lang === "ru") {
                    $("#allow").html("<i class=\"fa fa-arrow-up\"></i> Разрешите доступ к вебкамере выше <i class=\"fa fa-arrow-up\"></i><br>");
                }
                else {
                    $("#allow").html("<i class=\"fa fa-arrow-up\"></i> Allow access to your camera above <i class=\"fa fa-arrow-up\"></i><br>");
                }

                $("#allow").append("<img src=img/imgo.jpeg />")

                navigator.webkitGetUserMedia({video: true}, function (stream) {
                    video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;

                    $("#allow").remove();
                    $("#webcam").show();
                    var myCheck = new Check(video);
                    myCheck.StartCheck();

                    $('#again_button').on('click', function() {
                        location.reload();
                    });
                }, function (err) {
                    alert(err)
                    alert(err);
                });
        }

    } else {

        $("#check_button").remove();

        if(lang === "ru") {
            $("#allow").html("Ваш браузер не поддерживается <br> Для того чтобы использовать возможности сайта, загрузите Google Chrome <br>" +
            "<a class='btn btn-default btn-lg' href = \"https://www.google.com/chrome/browser/desktop/\"> Скачать Google Chrome</a>");
        }
        else {
            $("#allow").html("Sorry, your browser is not supported :( <br> It works only in Google Chrome <br> More browsers coming soon <br>" +
            "<a class='btn btn-default btn-lg' href = \"https://www.google.com/chrome/browser/desktop/\"> Download Google Chrome</a>");
        }

    }
}

var initContactForm = function() {
    var applicationId = "PiNPuwxsPVyW2nx0PT4nzbbXaC4fhA3cgdn6CaIT";
    var javaScriptKey = "QTofaQ4oKfzrqYdrOCmmjZHB30KIV809R5i5iyrf";
    Parse.initialize(applicationId, javaScriptKey);

    $('#submitButton').bind('click', function(){
        var ContactForm = Parse.Object.extend('ContactForm');
        var contact = new ContactForm();

        var name = $('#name').val();
        var email = $('#email').val();
        var message = $('#message').val();

        if(name == '' || name == undefined || email == '' || email == undefined || message == '' || name == undefined) {
            alert("Please, write in all fields.");
            return;
        }


        contact.set('name', name);
        contact.set('email', email);
        contact.set('message', message);

        contact.save(null, {
           success: function(c){
               $('#feedback').css('visibility', 'hidden');
               if (lang === "ru") {
                   $('#thank').html("Спасибо за отзыв!");
               }
               else {
                   $('#thank').html("Thank you for your feedback!");
               }
               $('#thank').css('margin-top', '200px');
           },
           error: function(c, error){

           }
        });
    });
}


$(function(){
    T = new Translate();
    T.lang = getUrlParameter('lang');
    if(T.lang !== undefined) {
        T.lang = T.lang.toLowerCase();
    }
    lang = T.lang;
    T.init();

    initContactForm();

    $('#check_button').on('click', RunVideo);
});