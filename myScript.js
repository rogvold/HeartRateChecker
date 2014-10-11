/**
* Created by IvanK on 10/11/2014.
*/

video = document.querySelector('video');
canvas = document.querySelector("#output")
ctx = canvas.getContext("2d");
img = new Image();
img.src = "img/i.png";


$(function() {
    initCheckButton();



});

function drawToCanvas() {
    ctx.drawImage(video, 0, 0, 600, 400);
    var objects = new tracking.ObjectTracker(['face', 'eye', 'mouth']);

    objects.on('track', function(event) {
        console.log(event);
        if (event.data.length === 0) {
            // No objects were detected in this frame.
        } else {
            event.data.forEach(function(rect) {
                // rect.x, rect.y, rect.height, rect.width
            });
        }
    });


    tracking.track('#output', objects);


//    var comp = ccv.detect_objects({ "canvas": (canvas),
//        "cascade" : cascade,
//        "interval": 5,
//        "min_neighbors": 1 });
//
    // Draw glasses on everyone!
//    for (i = 0; i < comp.length; i++) {
//          ctx.drawImage(img, comp[i].x, comp[i].y,comp[i].width, comp[i].height);
//        console.log(comp[i]);
//    }


}

function initCheckButton(){
    $('#checkButton').bind('click', function(){
        if (navigator.webkitGetUserMedia) {

            navigator.webkitGetUserMedia({video:true}, function(stream){

                video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;
                <!--window.setTimeout(function(){video.src = undefined}, 5000);-->

                setInterval(function() {
                    drawToCanvas();
                },50);

            }, function(){
                alert('denied!!!');
            });
        }
    });
}


