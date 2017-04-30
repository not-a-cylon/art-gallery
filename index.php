<?php

	$parent_dir = getcwd() . "/";
	// $parent_website = "http://localhost/production/art-gallery/";
	$parent_website = "http://www.sslukin.net/projects/art-gallery/";
	include($parent_dir . "internal/php/functions.php");
	
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Art Gallery</title>

		<link rel="stylesheet" href="styles/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="styles/gallery.css">

		<script type="text/javascript" src="scripts/jquery-3.1.1.min.js"> </script>
		<script type="text/javascript" src="scripts/swfobject.js"> </script>
		<script type="text/javascript" src="scripts/gallery-tiles.js"> </script>
		<script type="text/javascript" src="scripts/gallery.js"> </script>
		<script type="text/javascript" src="scripts/gallery_init.js"> </script>
	</head>

	<body>


		<!-- this div is referenced by jQuery so that the page scrolls up to it when an image is openened -->
		<div id="bannerDiv"></div>
		
		<p>
			Click and scroll through the images to read about how the gallery works. Be sure to hover over the 'i' to pull up the information.
		</p>

		<p>
			To view the JSON data associated with the collection names, click <a href="internal/config/collections.json" target="_blank">here</a>.
		</p>

		<p>
			To see how the image data is formatted (also JSON), click <a href="collections/fruits/data.json" target="_blank">here</a> for the fruits and <a href="collections/animals/data.json" target="_blank">here</a> for the animals.
		</p>

		<p>
			Click <a href="https://github.com/not-a-cylon/art-gallery" target="_blank">here</a> for the github repo.
		</p>


		<?php
			include($parent_dir . "templates/display-window.php"); 
			include($parent_dir . 'internal/php/' . 'ErrorLogger.php'); 
			include($parent_dir . 'internal/php/' . 'gallery.php');
		?>

	</body>
</html>