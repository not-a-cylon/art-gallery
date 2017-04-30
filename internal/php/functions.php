<?php

//  loads configuration parameters from specified .ini $filepath, and assigns them to a $GLOBALS['CUSTOM_FLAGS'] associative array;
//  the flags are parsed from .ini verbatim
function loadConfigFlags($filepath){
    if(file_exists($filepath)){
        $globFlags = array();
        $config = parse_ini_file($filepath);
        foreach($config as $flagname => $flagvalue){
            $globFlags[$flagname] = $flagvalue;
        }
        $GLOBALS['CUSTOM_FLAGS'] = $globFlags;
    }   else{
        logError(__FUNCTION__ . " - failed to load config flag file. Check directory.");
    }
}

function loadCollectionsFromFile($directory){
    $collections = json_decode(file_get_contents($directory),TRUE);
    for($i = 0; $i < count($collections); $i++){
        print_r($collections[$i]["collection-folder"]);
    }
    return $collections;
}


?>