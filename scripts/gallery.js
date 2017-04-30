//	A semi-customizable JS gallery that displays standalone images/flash files, sequential collections of them, and teir associated titles and descriptions, if provided.
//	It also has a built-in 'vulgarity' warning, which flashes the display red if you're about to view a 'vulgar' image. See below how to set it up.
//	Quick note about 'sequences' - they're intended to act like chapters in stories. By default, if the user presses 'back' and enters a sequence, the gallery will go to the story's first page. It prevents the user from starting from the end of a 'chapter', so to speak.


//	It relies on each gallery node having a bunch of 'data-' attributes attached to it. Here's a breakdown of the relevant ones:
//	
//	REQUIRED TAGS
//
//	data-src					=	<string>			-	full URL pointing to the image to be displayed.
//	data-file-type 				=	"flash"|"image"		-	type of file to be displayed.
//	data-collection				=	<string>			-	name of the group the file belongs to. When user is navigating through images, they will stay within that group until they click out of it and open a new group.	
//	data-index					=	<int>				-	index of the image. It's part of calculating which images are adjacent -- current algorithm relies on them being a part of the element's ID.
//	data-width (FLASH ONLY)		=	<int>				-	self-explanatory. The code can't estimate dimensions of .swf files, sothey have to be specified.
//	data-height (FLASH ONLY)	=	<int>				-	
//
//
//
//	OPTIONAL TAGS
//	
//	data-tall			=	"true"			-	if set to true, the image will have a vertical scrollbar attached to it instead of being squeezed into the window.
//	data-vulgar			=	"true"			-	if set to true, the gallery will warn the user that they're about to view a 'vulgar' image by coloring the navigation arrows red, and flashing the screen red.
//	data-description	=	<string>		-	description of the image, will be shown on the display.	IF left blank, the 'info' tab will not be displayed and the window will not pull up when hovered over.
//	data-title	=	<string>		-	name of the image, will be shown on the display. IF left blank, then the part of the window containing image desc and title will not be displayed at all.
//	
//	data-sequence-name	=	<string>		-	name of sequence that the image is a part of. If left blank, the name of the sequence will not be specified before the image title. 
//												This is different from 'collection' -- if the collection is The Adventures of Tom Sawyer, a sequence is 'Chapter 1'. Gets displayed before the image title unless toggled otherwise.  
//	data-sequential		=	"true"			- 	if set to true, indicates that the image is part of a sequence, and the gallery will treat it as such. ie if the user back-stumbles on a sequence, they will go back to page 1 and not 12.
//	data-first-page		=	"true"			-	if set to true, means that this image is the FIRST one of the upcoming sequence.
//
//
//	To make it work, the following have to be set up:
//	1.	Each gallery node (there can be only one, if you wish) must have all of its REQUIRED tags set.
//	2.	Each gallery node has to have an onclick handler setup in the HTML invoking gelleryNodeClicked(<element's id>), which passes the element's ID as the parameter. Otherwise, that node will be unclickable.
//	3.	The index param must be sequential across a COLLECTION; so indices 1 to 5 belonging to COL1 and 24 to 45 in COL2 are still perfectly valid. The index must be present because of the navigating algorithm -- see #4.
//	4.	The id must be formatted like this: "<collection>-<index>". This is because the algorithm uses that format to find adjacent images. Change the prevID() and nextID() functions to adjust it, if you want the nodes browsed in a different way.
//	

//	call gallery_initialize()

var IMAGE_DIRECTORY;					//	Where the 'loading' and other images are stored.	

var DISABLE_VULGAR_FILTER;				//	If set to true, the gallery won't bother checking if preceding/current/next image is vulgar, and will not notify the user.

var DISABLE_NAVIGATION_CONTROLS;		//	If set to true, user will not be able to navigate left/right.
var DISABLE_INFO_DISPLAY;				//	If set to true, the tab containing both the image TITLE and DESCRIPTION will not be visible. This is different from and overrides the individual image description settings;
var DISABLE_IMAGE_DESCRIPTION;			//	If set to true, the little 'info' tab will not be visible, and the window will not pull up when hovered over. The title will still be visible, unless DISABLE_INFO_DISPLAY is set to true;
var OMIT_SEQUENCE_NAME_FROM_TITLE;		//	If set to true, the name of the sequence will not be shown before the image title; by default, it is shown.

//	vars that control the way the UI looks - set when the window is loaded
var INFORMATION_HIDDEN = true;		//	hides the pull-up information tab
var NAVIGATION_HIDDEN = true;		//	hides the navigation arrows.

//	Definitive dimensions of the user's screen; 'window' was chosen over 'document' and 'screen' because it more accurately reflects the width of the document on mobile devices.
var WINDOW_WIDTH;
var WINDOW_HEIGHT;

//	Top and side margins for the display pop-up that shows the image.
var DISPLAY_SIDE_MARGIN;
var DISPLAY_UPPER_MARGIN;

//	anti-glitch var; temporarily set to true while the overlay is fading in; prevents clicking events at the wrong time.
var overlayFading = false;
var displayOpen = false;	//	set to true when the display is open. If true, clicking on tiles will have no effect.
var clickingAllowed = false;	//	states whether clicking on a gallery node will have an effect. This is set to true when the window is fuly loaded.

function gallery_initialize(){

	DISABLE_NAVIGATION_CONTROLS = false;
	DISABLE_VULGAR_FILTER = false;
	DISABLE_INFO_DISPLAY = false;
	DISABLE_IMAGE_DESCRIPTION = false;
	OMIT_SEQUENCE_NAME_FROM_TITLE = false;

	WINDOW_WIDTH = $(window).width();
	WINDOW_HEIGHT = $(window).height();

	DISPLAY_SIDE_MARGIN = WINDOW_WIDTH/7;
	DISPLAY_UPPER_MARGIN = WINDOW_HEIGHT/10;

	adjustDefaultDimensions();
}

//	First-time adjustments of css dimensions of various UI elements based on loaded window and document size;
//	Also adjusts how the interface looks based on config params, and assigns hover handlers.
function adjustDefaultDimensions(){
	adjustOverlayDimensions();
	adjustDisplayDimensions();
	adjustDescriptionDisplaySettings();
	assignNavigationHoverHandlers();
	adjustTileHovers();
	clickingAllowed = true;
}

//	Adjusts dimensions of the window overlay to match those of the window, as opposed to the default "width:100%" css ptoperty.
//	reason being, the overlay element is created deep inside the body, and does not match window dims by default;
function adjustOverlayDimensions(){
	var overlay = $(".overlay");
	overlay.css("width",$(document).width() + "px");
	overlay.css("height",$(document).height() + "px");
}

//	Adjusts dimensions and margins of the pop-up-display window, based on dimensions of the actual WINDOW object
function adjustDisplayDimensions(){
	$("#display-window").css("width", (WINDOW_WIDTH - DISPLAY_SIDE_MARGIN*2) + "px");
	$("#display-window").css("height", (WINDOW_HEIGHT - DISPLAY_UPPER_MARGIN*2) + "px");
	$("#display-window").css("top", (DISPLAY_UPPER_MARGIN) + "px");
	$("#display-window").css("left", (DISPLAY_SIDE_MARGIN) + "px");
}

//	sets hover handlers for the navigation arrows
//	when hovered-over, the nav arrow changes size and applies the 'vulgar' overlay, if applicable.
function assignNavigationHoverHandlers(){
	$(".nav-node").hover(function(){
		$(this).css("font-size","4.5em");
		var dir = getNavigatorDirection(this);
		//	if the gallery's vulgar filter is enabled
		if(!DISABLE_VULGAR_FILTER){
			//	If next/prev image is vulgar, flash the vulgar-overlay.
			if(currentFile.isVulgar(dir)){
				displayVulgarOverlay(dir);
			}
		}
	},function(){
		//	Once the mouse leaves, if the direction is not vulgar, hide the red overlay.
		$(this).css("font-size","2em");
		var dir = getNavigatorDirection(this);
		if(!DISABLE_VULGAR_FILTER){
			if(currentFile.isVulgar(dir)){
				hideVulgarOverlay(dir);
			}
		}
	});
}

// returns the navigation direction of passed nav element...
function getNavigatorDirection(jqueryElem){
	if($(jqueryElem).is("#nav-node-right")){
		return "right";
	}	else if($(jqueryElem).is("#nav-node-left")){
		return "left";
	}
}

//	adjusts the position of the pull-up window containing the image description.
//	Relies on elements "#image-title" and "#display-info-wrapper" having their CSS dimensions explicitl defined in pixels.
//	Relying on measured dimensions of elements is confusing and buggy...  
function adjustDescriptionDisplaySettings(){
	if(!imageDescriptionShouldBeShown()){
		hideInfoTab();
	}
	var titleHeight = parseInt($("#image-title").height());
	var descNode = $("#display-info-wrapper");
	var descNodeHeight = parseInt(descNode.height());
	descNode.css("bottom",(titleHeight - descNodeHeight) + "px");
	//	set descNode's hover handlers
	descNode.hover(
		//	by default and when mouse leaves, descNode is hidden to where only the image title is shown, and the little 'info' tab pops up 
		function(){	//	mouseover
			//	Only bring up the description if it should be shown.
			if(imageDescriptionShouldBeShown()){
				$(this).css("bottom","-5px");
				$(".bringup-node").css("top","0px");
			}
		},
		//	when mouse is over, bring up descNode and hide the little 'info' tab
		function(){	//	mouseleft
			$(this).css("bottom",(titleHeight - descNodeHeight) + "px");
			$(".bringup-node").css("top","-30px");
		});	
}

//	Centers the 'play' button that is shown when a flash file is ready to play.
//	The reason this isn't called when the window loads instead is because it relies on the display-window's dimensions, which get quirky if it isn't open. 
function centerFlashPlayButton(){
	centerDivInsideDiv("#flash-play-button","#display-image-wrapper");	
};

//	Called when a tile on the page is clicked by the user.
//	Loads the data associated with the tile and fills in its display information.
function galleryNodeClicked(elemID){
//	if the window is fully loaded and clicking is allowed
if(clickingAllowed){
	//	only proceed if the display isn't already open.
	if(!displayOpen){
		displayOpen = true;
		$('html, body').animate({						//	Scroll to the top of the page, ie the banner
			scrollTop: $("#bannerDiv").offset().top
		}, 1000);
		displayOverlay.call(this,loadNewTile,elemID);			//	fade in the overlay, which also sends request to load current image
	}
}
}

//	changes the coloring of the display based on vulgarity of prev, current, and next images.
//	dir can be "left","right", "both", or undefined - which is interpreted as 'current'
//	color is passed in. If undefined, defaults to 'red'
function changeDisplayToVulgar(dir,CSScolor){
	CSScolor = CSScolor || "red";	//	vulgar color defaults to red.
	//	if dir not passed, assume current image is vulgar.
	$("#display-window").css("background","");	//	nullifies the gradients, if any.
	if(dir===undefined){
		$("#display-window").css("background-color",CSScolor);
	}	else if(dir==="left" || dir==="right"){
		$("#display-window").css("background","linear-gradient(to " + dir + ", white, white, white, " + CSScolor + ")");
	}	else if(dir==="both"){
		$("#display-window").css("background","linear-gradient(to left, " + CSScolor + ", white, white, " + CSScolor + ")");
	}
}

//	changes color of the background display to specified color; defaults to 'white'
function changeDisplayToDefault(CSScolor){
	var CSScolor = CSScolor || "white";
	$("#display-window").css("background","");	//	nullifies the gradients, if any.
	$("#display-window").css("background-color",CSScolor);
}

//	changes color of specified node ("left" or "right") to specified color;
//	If not passed, color defaults to "red"
function changeNavNodeToVulgar(dir,CSScolor){
	CSScolor = CSScolor || "rgb(255,0,0)";	// defaults to red;
	$("#nav-node-" + dir).css("color",CSScolor);
}

//	changes color of specified node ("left" or "right") to specified color;
//	If not passed, color defaults to "#8CAD86"
function changeNavNodeToDefault(dir,CSScolor){
	CSScolor = CSScolor || "#8CAD86";
	$("#nav-node-" + dir).css("color",CSScolor);
}

//	Fades in the background overlay div over the entire page
//	Takes in an optional callback function to run when the overlay finishes fading in.
//	If no callback is specified, it opens the pop-up display.
function displayOverlay(callback,arg){
	overlayFading = true;
	var overlay = $(".overlay");
	var finishedFading = callback.call(this,arg) || function(){
		overlayFading = false;
		$("#display-window").show();
		displayOpen = true;
		DisplayLoader[currentFile["file-type"]]();
	};
	overlay.fadeIn(1000,finishedFading);
}

//	CALLED when the overlay is clicked.
//	Closes the overlay and blanks out any stored data and display info.
//	Only works if the overlay is not in the process of fading in (ie overlayFading is false)
function overlayClicked(){
	//	only proceed if the overlay isn't already fading out
	if(!overlayFading){
		$(".overlay").hide();				//	hide the overlay
		$("#display-window").hide();		//	hide the display window
		displayOpen = false;
		restoreDisplayToDefaults();
	}
}

////
////	functions below pertain to the display window
////	they show and hide parts associated with displaying an 'image', a 'flash' file, or the 'loading' div.  

function displayLoading(){
	$("#loading-div").show();
	$("#display-overlay").show();
}

function hideLoading(){
	$("#loading-div").hide();
	$("#display-overlay").hide();
}

function displayImage(){
	$("#image-core-wrapper").show();
}

function hideImage(){
	$("#image-core-wrapper").hide();
	$("#display-image-wrapper").css("overflow","hidden");	//	eliminate the scroll bar, jic
}

function displayFlash(){
	$("#flash-core-wrapper").show();
}

function hideInfoTab(){
	$(".bringup-node").hide();
}

function displayInfoTab(){
	$(".bringup-node").show();
}

function hideInfoWindow(){
	$("#display-info-wrapper").hide();
}

function displayInfoWindow(){
	$("#display-info-wrapper").show();
}

function displayVulgarOverlay(dir){
	$(".vulgar-overlay").addClass("vulgar-overlay-" + dir);
	$(".vulgar-overlay").show();
	$(".vulgar-overlay").css("opacity",0.5);
}

//	Hides the red overlay that pops up whe
function hideVulgarOverlay(){
	var dirs = ["left","right"];
	$(".vulgar-overlay").hide();
	$(".vulgar-overlay").css("opacity",0);
	for(var i = 0; i < dirs.length; i++){
		$(".vulgar-overlay").removeClass("vulgar-overlay-" + dirs[i]);
	}
}

function hideFlash(){
	var flashObj = $("#flash-object");
	$("#flash-core-wrapper").hide();
	flashObj.attr("data","");
	flashObj.attr("width","0px");
	flashObj.attr("height","0px");
	$("#flash-play-button").hide();
}

function restoreDisplayToDefaults(){
	hideVulgarOverlay();
	hideLoading();
	hideImage();
	hideFlash();
}

////
////
////

//	Returns boolean stating if the navigation controls should be disabled
function navigationNodesShouldBeShown(){
	if(!DISABLE_NAVIGATION_CONTROLS){
		return true;
	}	return false;
}

//	wrapper function that checks whether the info display with the image title and description should be shown. 
function infoWindowShouldBeShown(){
	//	If it's not disabled by the system AND the user actually provided a title, return true;
	//	If no title is provided, then no window will be displayed.
	if(!DISABLE_INFO_DISPLAY && currentFile["title"]){
		return true;
	}	return false;
}

//	Returns a boolean indicating whether the 'description' tab should be displayed.
//	depends on DISABLE_IMAGE_DESCRIPTION and currentFile's individual setting.
function imageDescriptionShouldBeShown(){
	if(infoWindowShouldBeShown() && !DISABLE_IMAGE_DESCRIPTION && currentFile.description){
		return true;
	}	return false;
}

//	Checks whether the image's sequence name should be displayed before its title.
//	Only works if an image HAS a title...
function displaySequenceName(){
	if(!OMIT_SEQUENCE_NAME_FROM_TITLE && currentFile["sequence-name"] && currentFile["title"]){
		return true;
	}	return false;
}

//	Called when a left-right navigation arrow is clicked.
function navNodeClicked(direction){
	var dirs = ["<",">"];
	//	if to the right, hust check that the file exists.
	if(direction===">"){
		if(currentFile.hasNext.call(currentFile)){
			restoreDisplayToDefaults();
			displayLoading();
			loadNewTile(currentFile.getNextID());
		}
	//	if to the left, run a check though getPrevDisplayableID() to make sure that it's presented properly, ie you're not starting a sequence from the end.
	}	else if(direction==="<"){
		if(currentFile.hasPrev.call(currentFile)){
			restoreDisplayToDefaults();
			displayLoading();
			loadNewTile(currentFile.getPrevDisplayableID());
		}
	}
}

//	Loads a new image and info into memory, and updates the display based on scanned parameters
function loadNewTile(newID){
	currentFile = new TileObject();
	loadFileParams(newID,currentFile);
	adjustNavNodeVisibility();
	adjustDisplayForVulgarity();
	updateLink();
	updateDescriptionSettings();
	fillImageDescription();		//	fill in image desc/title etc
	DisplayLoader[currentFile["file-type"]]();
}

//	Loads properties of tile into memory.
//	Checks for any attributes the specified div has that start with "data", and loads them into the passed targetObj object.
//	I tried making this function a part of the TileObject constructor and/or prototype, but it bugged out, so this function has to be external.
function loadFileParams(tileID,targetObj){
	var tile = $("#" + tileID);
	//	scan through the tile's attributes
	$.each(tile[0].attributes,function(index, attribute){
		//	if any attributes begin with "data-", save them to the object.
		//	Would ave used .startsWith(), but it's ES6 and does not work in IE11. Yet.
		if(attribute.name.substring(0, "data-".length) === "data-"){
			targetObj[attribute.name.slice(5)] = attribute.value;
		}
	});
}

//	adjusts visibility of navigation nodes based on whether there are more images to view before or after the displayed one.
function adjustNavNodeVisibility(){
	if(navigationNodesShouldBeShown()){
		var callbacks = [currentFile.hasPrev,currentFile.hasNext];
		var dirs = ["left","right"];
		for(var i = 0; i < dirs.length; i++){
			if(callbacks[i].call(currentFile)){
				showNavNode(dirs[i]);
			}	else	{
				hideNavNode(dirs[i]);
			}
		}
	}	else	{
		hideNavNode();
	}
}


//	Adjusts the coloring of the navigation arrows and the window background based on vulgarity of prev, current, and next image.
function adjustDisplayForVulgarity(){
	//	If the vulgarity filter is enabled
	if(!DISABLE_VULGAR_FILTER){
		var vulgarityDetected = false;
		var dirs = ["left","right"];
		for(var i = 0; i < dirs.length; i++){
			//	if the corresponding image is vulgar, change color of navigatio node to red
			changeNavNodeToDefault(dirs[i]);
			if(currentFile.isVulgar(dirs[i])){
				changeNavNodeToVulgar(dirs[i]);
				//	if vulgarity was already detected on one side, change it to both.
				if(vulgarityDetected){
					changeDisplayToVulgar("both");
				}	else	{
					changeDisplayToVulgar(dirs[i]);
				}
				vulgarityDetected = true;
			//	if not, change color to default.
			}
		}
		//	if CURRENT image is vulgar, change the display
		if(currentFile.isVulgar()){
			changeDisplayToVulgar();
			vulgarityDetected = true;
		}	//	if no vulgarity whatsoever was detected, change the display back to defaults.
		if(!vulgarityDetected){
			changeDisplayToDefault();
		}	
	}
}

//	Updates the "external link" href by reading currentFile.src
function updateLink(){
	if(currentFile["file-type"]==="flash"){
		$("#img-link").attr("href","");
		$(".link-node").hide();
	}	else	{
		$("#img-link").attr("href",currentFile.src);
		$(".link-node").show();	
	}
}

//	Checks to see if the info window or the image's description should be displayed, and acts accordingly.
function updateDescriptionSettings(){
	if(infoWindowShouldBeShown()){
		displayInfoWindow();
	}	else	{
		hideInfoWindow();
	}
	if(imageDescriptionShouldBeShown()){
		displayInfoTab();
	}	else	{
		hideInfoTab();
	}
}

//	Fills in the description and title of the image in the display;
function fillImageDescription(){
	if(true){
		var description = currentFile.description || "no description provided";
		var title = currentFile["title"];
		if(displaySequenceName()){
			title = currentFile["sequence-name"] + " - " + title;
		}
		$("#image-description-text").html(description);
		$("#image-title").html(title);
	}
}

//	Hides specified navigation node ("left"|"right"). If direction passed is undefined, hides both
function hideNavNode(direction){
	if(direction){
		$("#nav-node-" + direction).hide();
	}	else	{
		$("#nav-node-left").hide();
		$("#nav-node-right").hide();
	}
}

//	Shows specified navigation node ("left"|"right"). If direction passed is undefined, shows both
function showNavNode(direction){
	if(direction){
		$("#nav-node-" + direction).show();
	}	else	{
		$("#nav-node-left").show();
		$("#nav-node-right").show();
	}
}

//	Prepares whatever div 'fileWrapperSelector' points to for resizing, 
//	then resizes its wrapper using centerDivInsideDiv() and centers it.
//	Resizing params depend on how large the image is in relation to the display window, and whether it's specified as needing a scrollbar 
function resizeStoredImage(fileWrapperSelector,parentWrapperSelector){
	parentWrapperSelector = parentWrapperSelector || "#display-image-wrapper";
	var imgParent = $(parentWrapperSelector);
	var dimToResize;
	var dimChange = 0;
	var centeringNeeded = true;
	//	set offsets to zero, if any were leftover from prev image.
	$(fileWrapperSelector).css('top',"0px");
	$(fileWrapperSelector).css('left',"0px");
	//	If a TALL image is shown and it's taller than the display, size the width to fit the screen and dock some width
	//	to allow for an added scrollbar without eating into the image
	if(currentFile.defIs("tall") && currentFile.height > parseInt(imgParent.height())){
		if(currentFile.width > parseInt(imgParent.width())){
			dimToResize = "width";
			centeringNeeded = false;	//	IF the image width exceeds the parent's, no centering is needed.
		}
		dimChange = -20;
		$(parentWrapperSelector).css("overflow","auto");	//	Add a scrollbar
	//	IF the image is not tall, calculate its horizontal and verticall bleedouts
}	else	{
		var hDiff = currentFile.width - parseInt(imgParent.width());
		var vDiff = currentFile.height - parseInt(imgParent.height());
		//	then compare them, pick the most leaked dimension, and prioritize accordingly. 
		if(hDiff > 0 && hDiff > vDiff){
			dimToResize = "width";
		}	else if(vDiff > 0 && vDiff > hDiff){
			dimToResize = "height";
		}
	}
	resizeDivInsideParent(fileWrapperSelector,parentWrapperSelector,dimToResize,dimChange);
	if(centeringNeeded){
		centerDivInsideDiv(fileWrapperSelector,parentWrapperSelector);
	}
}

//	Centers a child div inside the parent div by calculating their dimensions and setting the child's left-top offsets accordingly.
//	The width and height of both divs must be SPECIFIED IN CSS for this to work;
function centerDivInsideDiv(childDIVselector,parentDIVselector){
	//	Dimensions of the child div
	var childDIV = {
		width: parseInt($(childDIVselector).width()),
		height: parseInt($(childDIVselector).height())
	};
	//	Dimensions of the parent div
	var parentDIV = {
		width: parseInt($(parentDIVselector).width()),
		height: parseInt($(parentDIVselector).height())
	};
	//	Calculate the difference in dimensions b/w display window and image
	var wDiff = Math.max(parentDIV.width - childDIV.width,0);
	var hDiff = Math.max(parentDIV.height - childDIV.height,0);
	//	Offset applies to the div wrapper around the image by 1/2 the difference.
	$(childDIVselector).css('top',hDiff/2 + "px");
	$(childDIVselector).css('left',wDiff/2 + "px");
}

// 	Resizes the specified child div inside the parent div
//	prefDim, if specified as ("width"|"height"), is the dimension that gets resized first, with the oter one affected proportionally.
//		if prefDim is undefined, the child retains original dimensions.
//	'change' param is what the dimension gets changed by; intended to accomodate width change for the scrollbar.
function resizeDivInsideParent(childDIVselector,parentDIVselector,prefDim,change){
	change = change || 0;
	var parentWidth = parseInt($(parentDIVselector).width());
	var parentHeight = parseInt($(parentDIVselector).height());
	var ratio, newChildWidth, newChildHeight;
	var origChildWidth = parseInt($(childDIVselector).width());
	var origChildHeight = parseInt($(childDIVselector).height());
	if(prefDim==="width"){
		newChildWidth = parentWidth + change;
		ratio = parentWidth/origChildWidth;
		newChildHeight = origChildHeight*ratio;
	}	else if(prefDim==="height")	{
		newChildHeight = parentHeight + change;
		ratio = parentHeight/origChildHeight;
		newChildWidth = origChildWidth*ratio;
	}
	$(childDIVselector).width(newChildWidth + "px");
	$(childDIVselector).height(newChildHeight + "px");
}

//	Called when a new image is to be loaded.
//	Scrubs the current img from existence and creates a new one from scratch.
function loadNewImage(src){
	displayLoading();
	//	blank out the previous image and create a new one
	$("#image-core-wrapper").empty();
	var newImg = $(document.createElement("img"));
	//	Add handler for when the src is loaded
	newImg.on("load",function(){
		imageLoaded(this.naturalWidth,this.naturalHeight);
	});
	newImg.attr("id","shown-img");
	newImg.attr("src",src);
	newImg.attr("width","100%");				//	makes the image automatically fit to the parent;
	newImg.attr("height","100%");
	$("#image-core-wrapper").append(newImg);
}

//	Handler that's called when the new image is loaded.
//	Assigns its dimensions (passed) to global vars, for reference,
//		then resizes the image according to the container, and displays it.
function imageLoaded(width,height){
	currentFile.width = width;
	currentFile.height = height;
	$("#image-core-wrapper").width(width);
	$("#image-core-wrapper").height(height);
	resizeStoredImage("#image-core-wrapper");
	hideLoading();
	displayImage();
}

//	Called when the Play button is clicked, signaling to start the flash animation.
//	Hides the 'play' button, sets src of flash file to the one stored in memory, and unhides it.
function flashPlayClicked(){
	$("#flash-play-button").hide();
	$("#display-overlay").hide();
	$("#flash-object").attr("data",currentFile.src);
	$("#flash-object").show();
}

//	Stores various functions for displaying specific files.
//	It's an awkward dinosaur block that was not rename because there are already too many functions with 'display' in them.
var DisplayLoader = {
	flash: function(){
		hideVulgarOverlay();
		hideLoading();
		var flashObj = $("#flash-object");
		
		$("#flash-core-wrapper").width(currentFile.width);
		$("#flash-core-wrapper").height(currentFile.height);
		resizeStoredImage("#flash-core-wrapper");

		centerFlashPlayButton();
		$("#flash-play-button").show();

		flashObj.attr("width",$("#flash-core-wrapper").width());
		flashObj.attr("height",$("#flash-core-wrapper").height());

		$("#flash-core-wrapper").show();
		$("#display-overlay").show();
	},
	image: function(){
		hideVulgarOverlay();
		loadNewImage(currentFile.src);
	}
}

//	Note that while you can READ an instance's properties from within the prototype's methods by using 'this' keyword,
//		you CAN'T ASSIGN properties to the instance this way. Weird.
//	Thus any methods attached to the prototype must be read-only.
//	The rest need to be attached through the constructor.

//	Stores data that pertains to the file currently being displayed, which could be an image or a flash file
//	Elsewhere in the code, currentFile is created as an instance of TileObject (see below);
var currentFile = {}

var TileObject = function(){

}

//	checks to see if passed property of the currentFile is set to "true"
//	If the flag is not a valid one (ie not defined in the list), prints an error to console.
//	called defIs after "definitelyIs", to avoid conflicts with jQuery's is(). 
TileObject.prototype.defIs = function(passedFlag){
	var validFlags = ["vulgar","tall","sequential","first-page"];
	if(validFlags.indexOf(passedFlag)>=0){
		if(this.hasOwnProperty(passedFlag) && this[passedFlag]==="true"){
			return true;
		}	return false;
	}	else	{
		console.log("ERROR in defIs: " + passedFlag + " is not a valid property.");
	}
}

//	Checks if there's an image after this one to display.
//	RELIES ON getNextID()
TileObject.prototype.hasNext = function(){
	var nextID = this.getNextID();
	if(nextID){
		return nextID;
	}	return undefined;
}

//	returns the next ID -- to the right of the current image -- that can be displayed.
TileObject.prototype.getNextID = function(){
	var nextID = this.collection + "-" + this.getIndexOf("next");
	if($("#" + nextID).length!==0){
		return nextID;
	}	else	{
		return undefined;
	}
}

//	Checks if there's an image before this to be displayed.
//	RELIES ON getPrevDisplayableID()
TileObject.prototype.hasPrev = function(){
	var nextID = this.getPrevDisplayableID();
	if(nextID){
		return nextID;
	}	return undefined;
}

//	returns the next ID -- to the left of the current image -- that can be displayed.
TileObject.prototype.getPrevID = function(){
	var nextID = this.collection + "-" + this.getIndexOf("prev");
	if($("#" + nextID).length!==0){
		return nextID;
	}	else	{
		return undefined;
	}
}

//	Similar to getPrevID, but it also checks to see if the prev image SHOULD be displayed.
//	It makes for a situation where if a user is currently viewing a standalone image, has a sequence of images before this, and clicks 'prev',
//		they will be directed toward the beginning of that sequence rather than its last page.
//	If no suitable ID is found, returns undefined.
TileObject.prototype.getPrevDisplayableID = function(){
	var index = (parseInt(this.index)-1);
	var nextID = this.collection + "-" + index;
	//	keep the loop running for as long as there's an element that matches this id.
	while(elemExists("#" + nextID)){
		//	If the element is not part of a sequence - success!
		if(IDhasAttr(nextID,"data-sequential")!=="true"){
			return nextID;
		//	if it is part of sequence, but it's also the first page - success!
		} else if((IDhasAttr(nextID,"data-first-page")==="true")){
			return nextID;
		//	If it's not the first page, but current page is sequential, too - so you're browsing the collection from the middle - success!
		}	else if(this.sequential==="true"){
			return nextID;
		//	if all else fails, decrement the index.
		}	else	{
			index-=1;
			nextID = this.collection + "-" + index;
		}
		//	and now if the nextID is non-existent, the while loop will break and function will return undefined.
	}
	return undefined;
}

//	checks to see if the specified file is marked as 'vulgar'
//	if dir is "left" -- checks previous (displayable); "right" - next; undefined - current
TileObject.prototype.isVulgar = function(dir){
	if(dir===undefined){
		return this.defIs("vulgar");
	}	else if(dir==="left"){
		return (IDhasAttr(this.getPrevDisplayableID(),"data-vulgar")==="true");
	}	else if(dir==="right"){
		return (IDhasAttr(this.getNextID(),"data-vulgar")==="true");
	}
}

//	returns index number associated with the current image.
//	if undefined, returns currentFile's; "next" returns ++ and "prev" returns --
TileObject.prototype.getIndexOf = function(ind){
	if(ind==="next"){
		return (parseInt(this.index)+1);
	}	else if(ind==="prev"){
		return (parseInt(this.index)-1);
	}	return parseInt(this.index);
}

//	Checks to see if an element that matches the passed selector actually exists.
function elemExists(selector){
	return ($(selector).length!==0);
}

//	Searchs for an element with targetID and checks if it has targetAttr attribute;
//	If so, returns the property; if not, returns undefined. 
function IDhasAttr(targetID,targetAttr){
	var result;
	var tile = $("#" + targetID);
	//	if the element exists
	if(tile.length!==0){
		result = tile.attr(targetAttr);
	}
	//	if the attribute does not exist, result will be undefined and (result) will be false;
	return result;
}