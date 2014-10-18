
segm = 512;

$(function(){
    $('#checkButton').bind('click', function () {

        video = document.querySelector("video");

        if (navigator.webkitGetUserMedia) {

            navigator.webkitGetUserMedia({video:true}, function(stream){
                video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;

                canvas = document.querySelector("canvas");
                context = canvas.getContext("2d");

                var dps = []; // dataPoints

                var chart = new CanvasJS.Chart("chart",{
                    title :{
                        text: "Live Random Data"
                    },
                    data: [{
                        type: "line",
                        dataPoints: dps
                    }]
                });

                var dps_fft = [];

                var fft_chart = new CanvasJS.Chart("fft_chart",{
                    title :{
                        text: "Live Random Data"
                    },
                    data: [{
                        type: "line",
                        dataPoints: dps_fft
                    }]
                });

                var xVal = 0;
                var updateInterval = 20;
                var dataLength = 500; // number of dataPoints visible at any point

                var fft_input = [];
                var fft_output_real = [];
                var fft_output_imag = [];

                var last_ten = new Array();

                for(i = 3; i < 25; i++){
                    last_ten[i] = new Array();
                    for(j = 0; j < 10; j++){
                        last_ten[i].push(0);
                    }
                }

                var updateChart = function (count) {
                    count = count || 1;

                    for (var j = 0; j < count; j++) {

                        fft = new FFT(segm);

//                        context.drawImage(video, 280, 160, 40, 20, 100, 110, 40, 20) ;
                        context.drawImage(video, 280, 160, 320, 240, 0, 0, 320, 240) ;


                        idata = context.getImageData(100,110,40,20);
                        data = idata.data;

                        var sum = 0;

                        for(var i = 0; i < data.length; i+=4) {
                            g = data[i+1];
                            sum+=g;
                        }

                        if (fft_input.length === segm) {
                            fft_input.shift();
                            fft_input.push(sum);
                        }
                        else {
                            fft_input.push(sum);
                        }

                        fft_output_real = fft.forward(fft_input).real;
                        fft_output_imag = fft.forward(fft_input).imag;


                        for (i = 3; i < 25; i++) {
                            var yVal = Math.abs(1.0 * fft_output_real[i]/segm );

                            last_ten[i].shift();
                            last_ten[i].push(yVal);

                            var avg = last_ten[i].reduce(function(pv, cv) { return pv + cv; }, 0)/10;

                            if (isNaN(yVal)) yVal = 0;

                            dps_fft.push({
                            x: i * (1000 * 60.0) / (segm * updateInterval),
                            y: avg
                            })
                        }


                        dps_fft.push({
                            x: 0,
                            y: 100
                        })



                        dps.push({
                            x: xVal,
                            y: sum
                        });
                        xVal++;
                    };
                    if (dps.length > dataLength)
                    {
                        dps.shift();
                    }

                    fft_chart.render();
                    chart.render();

                    dps_fft.length = 0;

                };

                // generates first set of dataPoints
                updateChart(dataLength);

                // update chart after specified time.
                setInterval(function(){updateChart()}, updateInterval);

//                setInterval(function() {
//
//                    context.drawImage(video, 280, 160, 40, 20, 100, 110, 40, 20) ;
//
//                    idata = context.getImageData(100,110,40,20);
//                    data = idata.data;
//
//                    var sum = 0;
//
//                    for(var i = 0; i < data.length; i+=4) {
//                        g = data[i+1];
//                        sum+=g;
//                    }
//
//                    console.log(sum);
//
//                },30);
//

            }, function(){
                alert('denied!!!');
            });
        }

    });
});

//face detection


//$('#checkButton').bind('click', function () {
//    $(window.onload = function() {
//        var video = document.getElementById('video');
//        var canvas = document.getElementById('canvas');
//        var context = canvas.getContext('2d');
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