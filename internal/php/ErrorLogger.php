<?php

    //  A class that prints errors to screen or to specified file. See below.

    //  simply a shorthand for ErrorLogger::logError($message);
    function customLog($message){
        ErrorLogger::logError($message);
    }

    //  Mostly logs the errors to a specified directory. When using it in a script, do the following:
    //  1. Assign full using ErrorLogger::setLogFolder($pathname);  will create nested directories if needed.
    //      If dump folder is not specified, defaults to the value of 'getcwd() . $DEFAUL_LOCAL_LOG_PATH';
    //  2. Log errors using ErrorLogger::logError($message). By default, writes to a txt file named after today's date.
    //      Will write to screen instead, if ErrorLogger::SET_WRITE_TO_SCREEN(true) is invoked.
    //  
    //  TODO:   Adjust to where it automatically creates a .htaccess file with specified allowed IPs and places it in the error-log folder.
    //          maybe base it on a flag.
    class ErrorLogger{
        public static $errorLogPath;
        public static $WRITE_TO_SCREEN; //  flag. If set to true, the logError($str) will print print to screen.
        public static $DEFAULT_LOCAL_ERROR_FOLDER = "/error_logs/";

        //  specifies whether error logs should be written to the screen or not.
        public static function SET_WRITE_TO_SREEN($bool){
            self::$WRITE_TO_SCREEN = $bool;
        }

        //  assigns the folder where the error logs get dumped to the specified path.
        public static function setLogFolder($folderPath){
            self::$errorLogPath = getcwd() . self::$DEFAULT_LOCAL_ERROR_FOLDER;       //  defaults to the current directory.
            if(file_exists($folderPath)){
                self::$errorLogPath = $folderPath;
            //  If the specified folder does not exist,
            }   else{
                //  if the DEFAULT path does not exist, create it. Nesting allowed.
                if(!file_exists(self::$errorLogPath)){
                    mkdir(self::$errorLogPath,0777,true);
                }
                //self::logError("DEBUGGING: Specified error-log-dump directory $folderPath is not valid. Might be too nested. Will use default instead.");
            }
        }

        //  prints out the error that was passed in, creating a new file if necessary.
        //   Will print to screen instead, if $WRITE_TO_SCREEN flag is set to true.
        public static function logError($message){
            $datestamp = date('Y-m-d');
            $timestamp = date('h:i:s');
            //  sets default error log directory, if not specified.
            if(!self::$errorLogPath){
                self::$errorLogPath = getcwd() . self::$DEFAULT_LOCAL_ERROR_FOLDER;
            }
            //  if the error folder path does not exist, create it; nesting allowed.
            if(!file_exists(self::$errorLogPath)){
                mkdir(self::$errorLogPath,0777,true);
            }
            $fullFilePath = self::$errorLogPath . $datestamp . ".txt";
            if(self::$WRITE_TO_SCREEN){
                print "$datestamp : $timestamp : $message <br/>";
            //  write message to a txt file named after today's date. Automatically creates a new one if necessarry.
            }   else{
                $fp = fopen($fullFilePath,"a");
                fwrite($fp,$message . "\n");
                fclose($fp);
            }
        }
    }


?>