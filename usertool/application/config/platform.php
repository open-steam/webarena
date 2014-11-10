<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['admins'] = array("csens");
$config['webarenaHost'] = "localhost";
$config['webarenaPort'] = "8080";
$config['dataFolder'] = "/Users/christophsens/waData/";

$config['userFolder'] = $config['dataFolder'] . "/users";
$config['courseFolder'] = $config['dataFolder'] . "/courses";


defined("PLATTFORM_ID") ||
    define("PLATTFORM_ID", "a");

defined("LOGIN_WITH_EMAIL") ||
    define("LOGIN_WITH_EMAIL", FALSE);


?>
