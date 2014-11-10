<?php
// requires php5
define('UPLOAD_DIR', 'images/');
$img = $_POST['image'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
//	$img = str_replace(' ', '+', $img);
//	$data = base64_decode($img);
//	echo  $data;
$file = UPLOAD_DIR . uniqid() . '.png';
$success = file_put_contents($file, $data);

//$html = file_get_contents('http://www.facebook.com/sharer/sharer.php?u=heartrate.cardiomood.com/share.php?id='. $file .'_57');
//echo $html;
echo $success ? $file : 'Unable to save the file.';

?>