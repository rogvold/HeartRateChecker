<?php

$par = htmlspecialchars($_GET["id"]);
$bpm = substr(strstr($par, '.png_'), 5);
$img = str_replace('_'.$bpm, "", $par);


echo '
<!DOCTYPE html>
<html>

<head lang="en">
    <meta property="og:title" content="Check out your heart rate!" />
    <meta property="og:image" content="http://heartrate.cardiomood.com/' . $img . '" />
    <meta property="og:description" content="My heart rate is ' . $bpm . ' bpm" />

    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/stylish-portfolio.css" rel="stylesheet">

    <title>Heart Rate Checker</title>
</head>

<body>

<header id="top" class="header">
    <div class="text-vertical-center">
        <h1> My heart rate is '. $bpm .' bmp. <br> And your? </h1>
        <h2><a href="index.html#webcam" class="btn btn-dark btn-lg" id="check_button" >Check it!</a></h2>
        <img style="display:inline; padding: 50px" src="http://heartrate.cardiomood.com/' . $img . '" />
    </div>
</header>

</body>
</html>'
?>