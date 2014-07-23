<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class getText {
    public function __construct()
    {
       
    }

    //returns text depending on plattform 
    public function getText($text) {

        if (defined("PLATTFORM_ID") && (PLATTFORM_ID == "Berufungsverfahren")) {

            switch ($text) {
                case "Meine Kurse":
                    return "Meine Berufungsverfahren";
                    break;
                case "Kurs":
                case "Kurse":
                    return "Berufungsverfahren";
                    break;
                case "Kursen":
                    return "Berufungsverfahren";
                    break;
                case "Aktive Kurse":
                    return "Aktive Berufungsverfahren";
                    break;
                case "Kurs erstellen":
                    return "Berufungsverfahren erstellen";
                    break;
                case "Kursname":
                    return "Berufungsverfahren";
                    break;
                case "Eingefrorene Kurse":
                    return "Eingefrorene Berufungsverfahren";
                    break;
                default:
                    return $text;
                    break;
            }
        } else {

            return $text;
        }
    }

}

?>