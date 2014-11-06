segm = 512;

//var chart = function()

var LineChart = function() {
    var self = this;
    this.divId = '';
    this.title = '';
    this.type = "line";
    this.data = [];

    this.options = {
        title: {
            text: self.title
        },
        data: [{
            type: self.type,
            dataPoints: self.data
        }],
        axisY: {
            includeZero: false
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

var apply = function(){
    segm = +$('#precision_select').val();
    flag = true;
    $('#check_button').click();
}

var Photo = function(rate) {
    if (flag_p == false) {

        sent_context.fillText(rate, 50, 50);
        var dataURL = sent_canvas.toDataURL();
        $.ajax({
            type: "POST",
            url: "upload.php",
            data: {
                image: dataURL
            }
        }).done(function (o) {
            console.log(o);
            img.src = 'http://heartrate.cardiomood.com/' + o;
            $('#share_img').prepend('<img src="' + img.src + '" />');



            ref = "http://www.facebook.com/sharer/sharer.php?u=heartrate.cardiomood.com/share.php?id="+ o + "&amp;bpm=" + rate;
            $('#share_fb').append('<a target="_blank"' + 'href=' + ref + '>Share</a>');

            console.log(ref);

            $('#share_fb').attr('href', ref);


            $('.fb-share-button').attr('data-href', img.src);
            $('.twitter-share-button').attr('href', img.src);
            document.getElementById('vk_share_button').innerHTML = VK.Share.button(img.src, {type: 'link'});
            console.log(img);
        });
        flag_p = true;
    }
}

var check = function() {
    if (flag == false) {
        alert('Select precision!');
        return;
    }
    video = document.querySelector("video");
    if (navigator.webkitGetUserMedia) {

        navigator.webkitGetUserMedia({video: true}, function (stream) {
            video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;

            forehead_canvas = document.querySelector("#forehead_canvas");
            forehead_context = forehead_canvas.getContext("2d");

            sent_canvas = document.querySelector("#sent_canvas");
            sent_context = sent_canvas.getContext("2d");

            result_canvas = document.querySelector("#result_canvas");
            result_context = result_canvas.getContext("2d");

            img = new Image();

            var greenChart =  new LineChart();
            greenChart.init("green_chart", "Green component");

            var fftChart =  new LineChart();
            fftChart.init("fft_chart", "FFT data");

            var xVal = 0;
            var updateInterval = 20;
            var dataLength = 500; // number of dataPoints visible at any point

            var k = (1000 * 60.0) / updateInterval / segm;

            var fft_input = [];
            var fft_output_real = [];

            //last ten init
            var last_ten = new Array();
            for (i = Math.floor(45 / k); i < Math.floor(150 / k); i++) {
                last_ten[i] = new Array();
                for (j = 0; j < 10; j++) {
                    last_ten[i].push(0);
                }
            }

            var updateChart = function (count) {
                count = count || 1;

                for (var j = 0; j < count; j++) {

                    fft = new FFT(segm);

                    forehead_context.drawImage(video, 285, 170, 40, 20, 0, 0, 40, 20);
                    sent_context.drawImage(video, 0, 0, 320, 240);

                    idata = forehead_context.getImageData(0, 0, 40, 20);
                    data = idata.data;

                    //sum of green component
                    var sum = 0;
                    for (var i = 0; i < data.length; i += 4) {
                        g = data[i + 1];
                        sum += g;
                    }

                    if (fft_input.length === segm) {
                        fft_input.shift();
                        fft_input.push(sum);
                    }
                    else {
                        fft_input.push(sum);
                    }

                    fft_output_real = fft.forward(fft_input).real;
                    for (i = Math.floor(45 / k); i < Math.floor(150 / k); i++) {
                        var yVal = Math.abs(1.0 * fft_output_real[i] / segm);

                        last_ten[i].shift();
                        last_ten[i].push(yVal);

                        var avg = last_ten[i].reduce(function (pv, cv) {
                                return pv + cv;
                            }, 0) / 10;

                        fftChart.push(i*k, avg);
                    }

                    fftChart.push(45, 100);

                    greenChart.push(xVal, sum) ;

                    xVal++;

                    var rate = 50;
                    $('#photo_button').bind('click', function(){Photo(rate)});

                    result_context.drawImage(img, 0, 0, 320, 240);

                }
                ;
                if (greenChart.data.length > dataLength) {
                    greenChart.data.shift();
                }

                fftChart.render();
                greenChart.render();
                fftChart.data.length = 0;

            };

            // generates first set of dataPoints
            updateChart(dataLength);

            // update chart after specified time.
            setInterval(function () {
                updateChart()
            }, updateInterval);
        }, function () {
            alert('denied!!!');
        });

//$('#checkButton').bind('click', function () {
//    $(window.onload = function() {
//        var video = document.getElementById('video');
//        var canvas = document.getElementById('canvas');
//        var context = canvas.getContext('2d');
    }
}

$(function(){
    flag = false;
    flag_p = false;

    $('#apply_button').bind('click', apply );
    $('#check_button').bind('click', check);
});



//face detection

//
//        var tracker = new tracking.ObjectTracker(['face','eye']);
////            tracker.setInitialScale(4);
//        tracker.setStepSize(1.7);
//        tracker.setEdgesDensity(0.1);
//
//        tracking.track('#video', tracker, { camera: true });
//
//        tracker.on('track', function(event) {
//            context.clearRect(0, 0, canvas.width, canvas.height);
//            context.drawImage(video, 0, 0, canvas.width, canvas.height);
//            if(event.data.length == 3) {
//                context.strokeStyle = '#a64ceb';
//                context.strokeRect(event.data[1].x  + 0.75*(event.data[2].x - event.data[1].x), event.data[1].y, event.data[1].width/2 , event.data[1].height/4)
//                console.log(event.data[1].width/2 , event.data[1].height/4);
//
////                event.data.forEach(function (rect) {
////                    context.strokeStyle = '#a64ceb';
////                    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
////                    context.font = '11px Helvetica';
////                    context.fillStyle = "#fff";
//////                context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
//////                context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
////                });
//            }
//        });
//
//    });
//});