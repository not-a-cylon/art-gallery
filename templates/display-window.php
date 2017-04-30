<?php
	//	this window pops up when a node is clicked, and displays the associated image.
?>

<!-- background translucent black overlay that fades in when a node is clicked -->
<div class="overlay" onclick="overlayClicked()">
	
</div>

<div id="display-window">
	<!-- inner-wrapper exists only to allow relative positioning for child elements -->
	<div id="display-window-inner-wrapper">

		<!-- the X button -->
		<div class="image-close-button" onclick="overlayClicked()">
            X
        </div>

		<!-- 'link' button -->
		<div class="link-node">
			<a id="img-link" target="_blank" href="http://www.google.com">
				<i class="fa fa-external-link" aria-hidden="true"></i>
			</a>
		</div>

			<!-- navigation buttons -->
			<div class="nav-node" id="nav-node-right" onclick="navNodeClicked('>')">
				<i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
			</div>

			<div class="nav-node" id="nav-node-left" onclick="navNodeClicked('<')">
				<i class="fa fa-arrow-circle-left" aria-hidden="true"></i>
			</div>


			<div id="display-image-outer-wrapper">

				<!-- optional red overlay-->
				<div class="vulgar-overlay vulgar-overlay-right"></div>

				<!-- translucent black overlay-->
				<div id="display-overlay"></div>

				<!-- upper portion of display window, contains requested img or loading icon, as applicable. -->
				<div id="display-image-wrapper">
					<div id="flash-play-button" onclick="flashPlayClicked()">
						<i class="fa fa-play" aria-hidden="true"></i>
					</div>
					<!-- loading div to be displayed/hidden as appropriate -->
					<div id="loading-div">
						<img id="loading-display-img" src="images/loading.gif">
					</div>
					
					<!-- wrapper containing the img to be shown -->
					<div id="image-core-wrapper">
						<img id="shown-img" src="" />
					</div>

					<!-- wrapper containing flash file to be shown-->
					<div id="flash-core-wrapper">
						<!-- below div gets converted to a flash <object> with the same id when page loads -->
						<div id="flash-object">
							<br /><br /><br />
							<!-- default HTML displayed if flash disabled -->
							<p>To view this animation, please make sure that your browser has Flash enabled.</p>
							<script type="text/javascript"> swfobject.embedSWF("test.swf", "flash-object", "854", "480", "8", "#336699"); </script>
						</div>
					</div>		
				</div>
			</div>
			
			<!-- wrapper for the optional bottom panel displaying image data -->
			<div id="display-info-wrapper">

				<!-- optional 'info' tab that pops up -->
				<div class="bringup-node">
					<i class="fa fa-info" aria-hidden="true"></i>
				</div>

				<div id="image-description-node">					
					<div id="image-title">

					</div>

					<div id="image-description-text">

					</div>
				</div>
			
			</div>
		</div>
	</div>