//	This file mostly exists for aesthetics;
//	If added, must precede the main gallery file, b/c the latter checks for the function below.
//	controls graphical tricks and hover handlers for the tils.

function adjustTileHovers(){
	var defaultCSS = {
		innerTiles:{

		}
	};
	defaultCSS.flashWidth = $(".flash-label").css("width");
	defaultCSS.flashHeight = $(".flash-label").css("height");
	
	//	set handler for the flash-nodes
	$(".flash-node").hover(
		function(){
			var flashWrapper = $(this).find(".flash-label");
			flashWrapper.css("width","40%");
			flashWrapper.css("height","40%");
		},function(){
			var flashWrapper = $(this).find(".flash-label");
			flashWrapper.css("width",defaultCSS.flashWidth);
			flashWrapper.css("height",defaultCSS.flashHeight);
		}
	);

	//	save the 'left' and 'center' offsets of tileLoc[i]+"-tile" classes for hover-handler references
	var tileLoc = ["first","last"];		//	components of the tiles' class names.
	var offsets = ["top","left"];		//	array of offset directions to apply to the inner tiles.
	var offsetDiff = [0,20];			//	the % offset assigned to the tile on hover;
	//	check and store the inner-tiles' original offsets.
	for(var i = 0; i < tileLoc.length; i++){
		defaultCSS.innerTiles[tileLoc[i]] = {};
		for(var j = 0; j < offsets.length; j++){
			defaultCSS.innerTiles[tileLoc[i]][offsets[j]] = $("." + tileLoc[i] + "-tile").css(offsets[j]);
		}
	}
	$(".sequence-node").hover(
		//	On hover, spread the tiles apart - first tile to the top-left, last to bottom-right
		function(){
			for(var p = 0; p < tileLoc.length; p++){
				var tile = $(this).find("." + tileLoc[p] + "-tile");
				for(var f = 0; f < offsets.length; f++){
					var origOffset = defaultCSS.innerTiles[tileLoc[p]][offsets[f]]; 
					tile.css(offsets[f],offsetDiff[p] + "%"); 
				}
			}
		//	As mouse leaves, put them back into place.
		},function(){
			for(var p = 0; p < tileLoc.length; p++){
				var tile = $(this).find("." + tileLoc[p] + "-tile");
				for(var f = 0; f < offsets.length; f++){
					var origOffset = defaultCSS.innerTiles[tileLoc[p]][offsets[f]];
					tile.css(offsets[f],origOffset); 
				}
			}
		}
	);

	//	and adjust hover handlers for single-image nodes by making them rotate
	$(".single-node").hover(
		function(){
			var wrapper = $(this).find(".tile-wrapper");
			wrapper.css("transform","rotate(2deg)");
		},function(){
			var wrapper = $(this).find(".tile-wrapper");
			wrapper.css("transform","rotate(0deg)");
		}
	);


}