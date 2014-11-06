<?php
echo '

<!DOCTYPE html>
<html>
<head lang="en">

    <meta property="og:title" content="Check out your heart rate!" />


    <meta property="og:description"
          content="My heart rate is' . htmlspecialchars($_GET["bpm"]). ' bpm" />

    <meta property="og:image"
          content="http://heartrate.cardiomood.com/'.  htmlspecialchars($_GET["id"]). '" />


    <title>Heart Rate Checker</title>
</head>
<body>

<img src="http://heartrate.cardiomood.com/images/544e7c216a756.png" />
<br/>
<a href="/index.html" >Check out your heart
    rate now!</a>

</body>
</html>'


?>
