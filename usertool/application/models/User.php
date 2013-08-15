<?php

class User extends CI_Model {

    var $username = '';
    var $password = '';
    var $firstName = '';
    var $lastName = '';
    var $email = '';
    var $courses = array();
    var $courses_member = array();
    var $courses_applied = array();
    var $courses_frozen = array();
    var $room = '';
    var $writeAccess = false;

    function __construct() {
        // Call the Model constructor
        parent::__construct();
    }

    function setUsername($username) {
        $this->username = $username;
    }
    
    function getUsername() {
        return $this->username;
    }

    function setPassword($password) {
        $this->password = $password;
    }
    
    function getPassword() {
        return $this->password;
    }
    
    function setFirstName($firstName) {
        $this->firstName = $firstName;
    }
    
    function getFirstName() {
        return $this->firstName;
    }
    
    function setLastName($lastName) {
        $this->lastName = $lastName;
    }
    
    function getLastName() {
        return $this->lastName;
    }
    
    function getFullName() {
        return $this->firstName . " " . $this->lastName;
    }
    
    function setEmail($email) {
        $this->email = $email;
    }
    
    function getEmail() {
        return $this->email;
    }
    
    function setCourses($courses) {
        $this->courses = $courses;
    }
    
    function getCourses() {
        return $this->courses;
    }
    
    function getCoursesMember() {
        return $this->courses_member;
    }
    
    function getCoursesApplied() {
        return $this->courses_applied;
    }
    
    function getCoursesFrozen() {
        return $this->courses_frozen;
    }

    function setRoom($room) {
        $this->room = $room;
    }
    
    function getRoom() {
        return $this->room;
    }
    
    function setWriteAccess($writeAccess) {
        $this->writeAccess = $writeAccess;
    }
    
    function getWriteAccess() {
        return $this->writeAccess;
    }
    
    function login($password) {
        log_message("debug", "user login: username = ".$this->username." password = ".$this->password);
        
        if ($this->password == $password)
            return true;
        else
            return false;
    }

    function loadUserData($username = "") {
        log_message("debug", "user loadUserData: username = ".$username);
        
        $filename = $this->config->item('userFolder') . "/" . $username . ".user.txt";
        if (file_exists($filename)) {
            $userFile = fopen($filename, "r");
            if (flock($userFile, LOCK_SH)) { // do a shared lock
                $userJSON = file_get_contents($filename);
                $userData = json_decode($userJSON, true);
                $this->username = $userData["username"];
                $this->password = $userData["password"];
                $this->email = $userData["email"];
                $this->firstName = $userData["firstName"];
                $this->lastName = $userData["lastName"];
                $this->room = $userData["room"];
                $this->courses = $userData["courses"];
                flock($userFile, LOCK_UN); // release the lock
            } else {
                log_message("error", "user loadUserData: filename = ".$filename);
                return false;
            }
            fclose($userFile);
            return true;
        }
        else
            return false;
    }
    
    function loadCourseData($frozen = false, $admin = false) {
        log_message("debug", "user loadCourseData: username = ".$this->username);
        
        require_once(APPPATH . 'models/Course.php');
        
        foreach ($this->courses as $courseID) {
            $course = new Course();
            $course->loadCourseData($courseID);
            if ($admin) {
                $course->loadMemberData(true);
            }
            $course->checkMemberStatus($this->username);

            if ($course->getMemberStatus() !== "error") {
                if ($frozen) {
                    if ($course->isFrozen()) {
                        array_push($this->courses_frozen, $course);
                        continue;
                    }
                }
                if ($course->getMemberStatus() === "applied") {
                    array_push($this->courses_applied, $course);
                } else {
                    array_push($this->courses_member, $course);
                }
            }
        }
    }
    
    function loadAllCourseData() {
        log_message("debug", "user loadAllCourseData: username = ".$this->username);
        
        require_once(APPPATH . 'models/Course.php');
        
        $courses = scandir($this->config->item('courseFolder'));
        foreach ($courses as $courseID) {
            if ($courseID !== "." && $courseID !== "..") {
                $course = new Course();
                $course->loadCourseData($courseID);
                $course->checkMemberStatus($this->username);
                $course->readableMemberStatus();
                array_push($this->courses, $course);
            }
        }
    }

    function saveUserData() {
        log_message("debug", "user saveUserData: username = ".$this->username);
        
        $filename = $this->config->item('userFolder') . "/" . $this->username . ".user.txt";

        $user = array();
        $user["username"] = $this->username;
        $user["password"] = $this->password;
        $user["email"] = $this->email;
        $user["firstName"] = $this->firstName;
        $user["lastName"] = $this->lastName;
        $user["courses"] = $this->courses;
        $user["room"] = $this->room;

        $userData = fopen($filename, "w+");
        if (flock($userData, LOCK_EX)) { // do an exclusive lock
            fwrite($userData, json_encode($user));
            flock($userData, LOCK_UN); // release the lock
        } else {
            log_message("error", "user saveUserData: filename = ".$filename);
            return false;
        }
        fclose($userData);
        return true;
    }

    function createUser() {
        log_message("debug", "user createUser: username = ".$this->username);
        
        if (!file_exists($this->config->item('userFolder'))) {
             if (!@mkdir($this->config->item('userFolder'))) {
                log_message("error", "user crateUser: cannot create folders");
                return "writing";
             }
        }
        if (!file_exists($this->config->item('courseFolder'))) {
            if (!@mkdir($this->config->item('courseFolder'))) {
                log_message("error", "user crateUser: cannot create folders");
                return "writing";
            }
        }   
        
        $filename = $this->config->item('userFolder') . "/" . $this->username . ".user.txt";
        if (file_exists($filename)) {
            return "username";
        } else {
            if (trim($this->username) != "" && trim($this->password) != "" && trim($this->firstName) != "" && trim($this->lastName) != "") {
                $user = array();
                $user["username"] = $this->username;
                $user["password"] = $this->password;
                $user["email"] = $this->email;
                $user["firstName"] = $this->firstName;
                $user["lastName"] = $this->lastName;
                $user["courses"] = $this->courses;
                $user["room"] = $this->room;

                $userData = fopen($filename, "w+");
                if (flock($userData, LOCK_EX)) { // do an exclusive lock
                    fwrite($userData, json_encode($user));
                    flock($userData, LOCK_UN); // release the lock
                } else {
                    log_message("error", "user createUser: filename = ".$filename);
                    return "writing";
                }
                fclose($userData);
                return "success";
            } else {
                return "error";
            }
        }
    }
}
?>