<?php

class ImageNode{

        //  shared array containing default directories.
        public static $DEFAULT_DIRS = array(
            "SERVER_BASE_DIR"=>"",      //  default colder directory on the SERVER; usually getcwd();
            "URL_BASE_DIR"=>"",         //  URL detailing the location of the 'gallery' folder (inclusive)  
            "default_image_local"=>"",  //  local location of the default placeholder image;
            "default_tile_local"=>"",   //  ditto for the default tile
            "base"=>""
        );
        //  additional parameters the node defaults to if not found in the JSON file.
        public static $DEFAULT_PARAMS = array("width"=>"600","height"=>"450");

        public static $sequenceNames = array(); //  list of sequence names associated with all images. Used internally for processing a node's sequence params.
        
        //  A list of parameters that can be assigned VERBATIM from JSON data directly to HTML
        //  ie, params whose naming conventions are the same in both systems.
       public $directParams = array("title","description","tall","vulgar","width","height","sequence-name");
       
       //   index of the node, to be used for scrolling.
       public $index;

       public $sig; //  internal signature used to identify the file in error logs.


        // the node's constructor.
        //  sets the node's index to passed value and appropriates the passed object's properties.
        function __construct($index,$imageObj,$collection){
            $this->nodeParams["index"] = $index;
            $this->nodeParams["collection"] = $collection;

            //  first copy all the properties that can be assigned literally, taken from $directParams
            foreach($this->directParams as $param){
                //  check if the image HAS that property before assigning.
                if(array_key_exists($param,$imageObj)){
                    $this->nodeParams[$param] = $imageObj[$param];
                }
            }

            //  Set the node's signature, for debugging.
            $this->setSig();

            //  Check extension, and assign 'file-type' as image|flash accordingly.
            
            if(array_key_exists("file-name",$imageObj)){
                $this->assignFileType($imageObj["file-name"]);
                $this->assignImageSrc($imageObj["file-name"]);
            }   else {
                customLog("Property 'file-name' not found in JSON when loading gallery.");
            }

            $this->assignSequenceParams();

            $this->verifyDimensionsPresent();

        }

        //  Assigns a default directory that will be used as a placeholder for missing images.
        //  $type is either "image" or "tile", and $fullDir is the full directory pointing to that image.
        public static function assignDefaultDir($type,$fullDir,$serverSide=true,$local=false){
            //  if it's marked as a 'local' path, pre-pad it with full server directory before checking if file_exissts.
            $padding = "";
            if($local){
                $padding = self::$DEFAULT_DIRS["SERVER_BASE_DIR"];
            }
            if($serverSide && !file_exists($padding . $fullDir)){
                customLog($padding.$fullDir." is not a valid path. Will use default as $type placeholder.");
            }   else{
                self::$DEFAULT_DIRS[$type] = $fullDir;
            }
        }

        //  prints out the node's parameters to the screen.
        function printParams(){
            print '<pre>';
            print_r($this->nodeParams);
            print '</pre>';
        }

        //  extracts an extension from the passed $filename string and assigns it to the node.
        function assignFileType($filename){
            $approvedExtensions = array("jpg","jpeg","gif","png","swf");    //  File extensions approved for display.
            $extension = pathinfo($filename)["extension"];
            //  check if the file extension is a valid image file.
            if(in_array(strtolower($extension),$approvedExtensions)){
                if(strtolower($extension)==="swf"){
                    $this->nodeParams["file-type"] = "flash";   //  If it's a swf file, specify type as 'flash'
                }   else{
                    $this->nodeParams["file-type"] = "image";   //  else, it's an 'image'
                }
            }   else{
                customLog("gallery image file extension was specifed as '$extension' -- not a valid format.");
            }
        }
        
        //  calculates and confirms the location of the image and its tile, assigning them to the .src and .src-tile properties.
        //  assigns the nodeParams->src property based on passed $fileName string and other params.
        //  also checks if the file actually exists on the server...
        function assignImageSrc($fileName){
            $types = array("image","tile");
            foreach($types as $type){
                $tempSrc = "src";   //  if it's an image, gets left as 'src'. If a tile, gets changed to 'tile-src' and recorded as a 'data' parameter.
                //  if it's a tile, pre-pad the tile's src property name and filename.
                if($type=="tile"){
                    //  if it's a .swf file, the tile should not have the same extension. Change to .jpg 
                    if(strtolower(pathinfo($fileName)['extension'])==="swf"){
                        //  okay to mutate $filename because 'image' is already done with it.'
                        $fileName = pathinfo($fileName)['filename'] . ".jpg";
                    }
                    $fileName = "tile " . $fileName;
                    $tempSrc.="-tile";
                }

                $localPath = "collections/". $this->nodeParams['collection'] . "/". $type ."s/" . $fileName;
                $fullServerDir = self::$DEFAULT_DIRS["SERVER_BASE_DIR"] . $localPath;
                //  check if file exists on the server.
                if(!file_exists($fullServerDir)){
                    customLog("$this->sig -- main $type location not valid. Full path: $fullServerDir. Setting src to default ".self::$DEFAULT_DIRS["URL_BASE_DIR"].self::$DEFAULT_DIRS["default_".$type."_local"]);
                    $this->nodeParams[$tempSrc] = self::$DEFAULT_DIRS["URL_BASE_DIR"].self::$DEFAULT_DIRS["default_".$type."_local"];
                }   else{
                    $this->nodeParams[$tempSrc] = self::$DEFAULT_DIRS["URL_BASE_DIR"].$localPath;
                }
            }
        }

        //  adjusts the node's sequence parameters;
        //  everything is based on the JSON node having a "sequence-name" property.
        function assignSequenceParams(){
            //  check if the image is even part of a sequence; if so, mark it an continue.
            if(array_key_exists("sequence-name",$this->nodeParams)){
                $this->nodeParams["sequential"] = "true";
                //  check if the sequence name has already been encountered. If not, add it to the list and mark this node as a 'first-page'
                if(!in_array($this->nodeParams["sequence-name"],self::$sequenceNames)){
                    $this->nodeParams["first-page"] = "true";
                    array_push(self::$sequenceNames,$this->nodeParams["sequence-name"]);
                    $temp = $this->nodeParams["sequence-name"];
                }
            }
        }

        //  checks if the current node has its width and height properties set up, if it's a flash file.
        function verifyDimensionsPresent(){
            //  If the file type has been assigned AND it's a flash file,
            if(array_key_exists("file-type",$this->nodeParams) && $this->nodeParams["file-type"]==="flash"){   
                $dims = array("width","height");
                foreach($dims as $dim){
                    if(!array_key_exists($dim,$this->nodeParams)){
                        customLog($this->sig . " Property '$dim' was not assigned to a flash file. Defaulting to " . self::$DEFAULT_PARAMS[$dim]);
                    }
                }
            }
        }

        //  sets the 'signature' of the node, consisting of properties specified under $sigParams;
        //  If the properties are undefined, defaults to UNSPECIFIED
        //  Intended as a shorthand for debugging.
        function setSig(){
            $sigParams = array("collection","title");
            $sig = "[";
            for($i = 0; $i < sizeof($sigParams); $i++){
                if(array_key_exists($sigParams[$i],$this->nodeParams)){
                    $sig .= $this->nodeParams[$sigParams[$i]]." ";
                }   else{
                    $sig .= "UNSPECIFIED ";
                }   if($i!=(sizeof($sigParams)-1)){
                    $sig.=": ";
                }
            }            
            $sig .= "]";
            $this->sig = $sig;
        }

        //  returns a string representation of all of its $nodeParams properties for use in an HTML template;
        //  each property gets prefixed by "data-" and the list is delimited by spaces.
        function dumpDataAttr(){
            $result = "";
            foreach($this->nodeParams as $key => $val){
                $result.="\n data-$key=\"$val\" ";
            }
            return $result;
        }

        function HTMLtemplate(){
            $strRep = "";
            
            $collection = $this->nodeParams["collection"];
            $index = $this->nodeParams["index"];
            $id = $collection."-".$index;       //  HTML id of element.

            //  check if the node is a 'flash', a 'single' image, or a sequence, and adjust code accordingly.
            $nodeType = $this->nodeType();
            
            $title = $this->nodeParams["title"];
            $src = $this->nodeParams["src"];
            $tileSrc = $this->nodeParams["src-tile"];
            $tileImgHTML = "<img class=\"tile-img\" src=\"$tileSrc\" alt=\"$title\" />";
            $flashLogoSrc = self::$DEFAULT_DIRS["URL_BASE_DIR"] . "images/flash_logo.png";
            $flashLogoHTML = "<img class=\"flash-logo\" src=\"$flashLogoSrc\" alt=\"$title\" />";

            $mouseoverText = $title;
            //  if the image has no name assigned, set mouseover text to its src.
            if(!array_key_exists("title",$this->nodeParams)){
                $mouseoverText = $src;
            }
            //  if the image is part of a sequence, display its name instead.
            if($nodeType==="sequence"){
                $mouseoverText=$this->nodeParams["sequence-name"];
            }

            //  set the aesthetic classes that JS uses to assign hover handlers.
            $outerClasses = "image-node ";
            if(array_key_exists("vulgar",$this->nodeParams)){
                $outerClasses.="vulgar-background ";
            }
            $outerClasses.=" ".$nodeType."-node ";
            if($this->shouldBeHidden()){
                $outerClasses.=" hidden ";
            }            
            //  HTML contents that go inside the ".tile-wrapper" shell. Customized based on nodeType();
            $tileInnards="";
            $tileInnards.="<div class=\"tile-wrapper\">";
            
            if($nodeType==="flash"){
                $tileInnards.=$this->insertImage($tileImgHTML);
                $tileInnards.="</div>";
                $tileInnards.="<div class=\"flash-label\">";
                $tileInnards.=$this->insertImage($flashLogoHTML);
                $tileInnards.="</div>";

            }   else if($nodeType==="sequence"){
                $tileInnards.="<div class=\"inner-tile first-tile\"></div>";
			    $tileInnards.="<div class=\"inner-tile center-tile\"></div>";
			    $tileInnards.="<div class=\"inner-tile last-tile\">";
                $tileInnards.=$this->insertImage($tileImgHTML);
		        $tileInnards.="</div>";
		        $tileInnards.="</div>";
            }else{ 
                $tileInnards.=$this->insertImage($tileImgHTML);
                $tileInnards.="</div>";
            }

            $strRep.="<div id=\"$id\" title=\"$mouseoverText\" class=\"$outerClasses\" onclick=\"galleryNodeClicked('$id')\"".$this->dumpDataAttr().">";

            $strRep.=$tileInnards;

            $strRep.="</div>";

            print $strRep;

        }

        //  temp debugging function
        function insertImage($HTML){
            $EXCLUDE_IMAGES = false; //  debug param for testing on the harddrive, due to images not loading.
            if(!$EXCLUDE_IMAGES){
                return $HTML;
            }   return "";
        }

        //  checks if the node needs to be hidden from view, ir it's part of a sequence and not the first page.'
        function shouldBeHidden(){
            if($this->nodeType()==="sequence"){
                if(!array_key_exists("first-page",$this->nodeParams)){
                    return true;
                }
            }   return false;
        }

        //  internal helper function that checks whether the node is a 'sequence', a 'flash'' file, or a 'single' image. 
        function nodeType(){
            if(array_key_exists("sequence-name",$this->nodeParams)){
                return "sequence";
            }   else if($this->nodeParams["file-type"]==="flash"){
                return "flash";
            }   else{
                return "single";
            }
        }
        //  an internal array storing the node's parameters.
        //  properties still written, mostly for reference.
        public $nodeParams = array(
            //"src"=>"",
            //"src-tile"=>"",
            //"file-type"=>"",
            //"collection"=>"",
            //"index"=>"",
            //"width"=>"",
            //"height"=>"",
            //"tall"=>"",
            //"vulgar"=>"",
            //"description"=>"",
            //"title"=>"",
            //"sequence-name"=>"",
            //"sequential"=>"",
            //"first-page"=>""
        );
    }

?>