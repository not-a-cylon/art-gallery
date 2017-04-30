<div id="gallery-content">           

    <?php

        //  the directory to be used for HTTP requests and embedded image srcs. Includes and ends at the gallery folder.
        $URL_BASE_DIR = $parent_website;
        //  the SERVER directory used to check existence of files and load them.
        $SERVER_BASE_DIR = $parent_dir;

        include_once($parent_dir . "/internal/php/functions.php");
        include_once($parent_dir . "/internal/php/ImageNode.php");
        include_once($parent_dir . "/internal/php/ErrorLogger.php");
        
        ErrorLogger::SET_WRITE_TO_SREEN(false);
        ErrorLogger::setLogFolder("/internal/php/error_logs/");

        ImageNode::assignDefaultDir("URL_BASE_DIR",$URL_BASE_DIR,false);
        ImageNode::assignDefaultDir("SERVER_BASE_DIR",$SERVER_BASE_DIR . "/");
        //  assign default image files in case the assigned image is not found 
        ImageNode::assignDefaultDir("default_image_local","images/default_image.png",true,true);
        ImageNode::assignDefaultDir("default_tile_local","images/default_tile.png",true,true);

        loadConfigFlags($parent_dir . "/internal/config/config.ini");
        $NODES_PER_ROW = $GLOBALS['CUSTOM_FLAGS']["NODES_PER_ROW"];
        $collections = json_decode(file_get_contents(getcwd() . "/internal/config/collections.json"),TRUE);

        //  First, create an object for every HTML node and populate it with data from the JSON files.
        foreach($collections as $index => $collection){
            $collections[$index]["nodeList"] = array();
            $collectionDisplayName = $collection['collection-name'];
            $collectionFolderName = $collection['collection-folder'];
            //  if the collection folder cannot be found, throw error.
            $collectionDirectory = $SERVER_BASE_DIR . "collections/" . $collectionFolderName . "/";
            if(!file_exists($collectionDirectory)){
                customLog("Unable to find collection '$collectionDisplayName'; attempted directory: $collectionDirectory");
            }   else{
                //  load corresponding data.json file into memory.
                $collectionJSON = json_decode(file_get_contents($collectionDirectory . "data.json"),TRUE);
                //  cycle through it and load individual image data
                for($i = 0; $i < sizeof($collectionJSON); $i++){
                    $JSONimageObject = $collectionJSON[$i];
                    //  create the image node and populate it with the loaded data.
                    $node = new ImageNode($i+1,$JSONimageObject,$collectionFolderName);
                    //  then push node into collection's array.
                    array_push($collections[$index]["nodeList"],$node);
                }
            }
            
        }

        //  Now display the collections in rows
        $rowStartHTML = "<div class=\"tile-row\">\n";
        foreach($collections as $collection){
            $nodesShownSoFar = 0;
            $nodesInCollection = sizeof($collection["nodeList"]);
            //  print out the collection heading.
            print "<h2 class=\"collection-heading\">". $collection["collection-name"] ."</h2>\n";
            //  start the first row
            print $rowStartHTML;
            $rowOpen = true;        //  indicates whether the HTML row is open atm; toggled accordingly.
            for($num = 0; $num<$nodesInCollection; $num++){
                $node = $collection["nodeList"][$num];
                print $node->HTMLtemplate()."\n";
                if(!$node->shouldBeHidden()){
                    $nodesShownSoFar++;
                    //  if the row is full, close itAND this isn't the last node in the collection
                    if($nodesShownSoFar%$NODES_PER_ROW===0){
                        if($rowOpen){
                            print "</div>\n";
                            $rowOpen = false;
                        }
                        //  if this isn't the last node, open a new row. Empty rows won't hurt anything.
                        if(($num+1)!=$nodesInCollection){
                            if(!$rowOpen){
                                print $rowStartHTML;
                                $rowOpen = true;
                            }
                        }
                    }
                }
            }
            if($rowOpen){
                print "</div>\n";
            }
        }

    ?>
	
</div>
