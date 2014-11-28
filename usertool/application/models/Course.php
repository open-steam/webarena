<?php

class Course extends CI_Model {

    var $id = '';
    var $name = '';
    var $description = '';
    var $room = '';
    var $members = array();
    var $applied = array();
    var $memberStatus = "";
    var $frozen = false;

    function __construct() {
        // Call the Model constructor
        parent::__construct();
    }

    function setId($id) {
        $this->id = $id;
    }

    function getId() {
        return $this->id;
    }

    function setName($name) {
        $this->name = $name;
    }

    function getName() {
        return $this->name;
    }

    function setDescription($description) {
        $this->description = $description;
    }

    function getDescription() {
        return $this->description;
    }

    function setRoom($room) {
        $this->room = $room;
    }

    function getRoom() {
        return $this->room;
    }

    function getMembers() {
        return $this->members;
    }

    function getApplied() {
        return $this->applied;
    }

    function getMemberStatus() {
        return $this->memberStatus;
    }
    
    function isFrozen() {
        return $this->frozen;
    }

    function loadCourseData($id) {
        log_message("debug", "course loadCourseData: id = ".$id);
        
        $filename = $this->config->item('courseFolder') . "/" . $id;
        if (!file_exists($filename)) {
            return false;
        } else {
            // get general information of the course
            $courseData = fopen($filename . "/info.txt", "r");
            if (flock($courseData, LOCK_SH)) { // do a shared lock
                $course = json_decode(file_get_contents($filename . "/info.txt"), true);
                flock($courseData, LOCK_UN); // release the lock
            } else {
                log_message("error", "course loadCourseData: filename = ".$filename);
                return false;
            }
            fclose($courseData);

            $this->id = $course["id"];
            $this->name = $course["name"];
            $this->description = $course["description"];
            $this->room = $course["room"];
            $this->frozen = $course["frozen"];

            return true;
        }
    }

    function loadMemberData($loadUserData = false) {
        log_message("debug", "course loadMemberData: id = ".$this->id." loadUserData = ".$loadUserData);
        
        if (!class_exists('User')) {
            require_once(APPPATH . 'models/User.php');
        }
        
        $filename = $this->config->item('courseFolder') . "/" . $this->id;
        $this->members = array();
        $members = scandir($filename . "/verified");

        foreach ($members as $member) {
            if ($member != "." && $member != "..") {
                if ($loadUserData) {
                    $user = new User();
                    if ($user->loadUserData(basename($member, ".txt"))) {
                        $user->setWriteAccess($this->checkUserAccess(basename($member, ".txt")));
                        array_push($this->members, $user);
                    }
                } else {
                    array_push($this->members, basename($member, ".txt"));
                }
            }
        }

        $this->applied = array();
        $applied = scandir($filename . "/applied");
        foreach ($applied as $member) {
            if ($member != "." && $member != "..") {
                if ($loadUserData) {
                    $user = new User();
                    if ($user->loadUserData(basename($member, ".txt"))) {
                        array_push($this->applied, $user);
                    }
                } else {
                    array_push($this->applied, basename($member, ".txt"));
                }
            }
        }
    }

    function checkUserAccess($member = "") {
        log_message("debug", "course checkUserAccess: id = ".$this->id." member = ".$member);
        
        $userAccessFile = $this->config->item('courseFolder') . "/" . $this->id . "/verified/" . $member . ".txt";
        $userAccess = fopen($userAccessFile, "r");
        if (flock($userAccess, LOCK_SH)) { // do a shared lock
            $access = file_get_contents($userAccessFile);
            if ($access === "write") {
                return true;
            }
            flock($userAccess, LOCK_UN); // release the lock
        } else {
            log_message("error", "course checkUserAccess: id = ".$this->id." userAccessFile = ".$userAccessFile);
            return false;
        }
        fclose($userAccess);
        return false;
    }

    function verifyUser($username = "") {
        log_message("debug", "course verifyUser: id = ".$this->id." username = ".$username);
        
        $userAppliedFile = $this->config->item('courseFolder') . "/" . $this->id . "/applied/" . $username . ".txt";
        if (file_exists($userAppliedFile)) {
            unlink($userAppliedFile);
            $userVerifiedFile = $this->config->item('courseFolder') . "/" . $this->id . "/verified/" . $username . ".txt";
            $userAccess = fopen($userVerifiedFile, "w+");
            if (flock($userAccess, LOCK_EX)) { // do an exclusive lock
                fwrite($userAccess, "write");
                flock($userAccess, LOCK_UN); // release the lock
            } else {
                log_message("error", "course verifyUser: id = ".$this->id." userAppliedFile = ".$userAppliedFile);
                return false;
            }
            fclose($userAccess);
        } else {
            return false;
        }
        return true;
    }

    function changeWriteAccessUser($username = "", $writeAccess = false) {
        log_message("debug", "course changeWriteAccessUser: id = ".$this->id." username = ".$username." writeAccess = ".$writeAccess);
        
        $userAccessFile = $this->config->item('courseFolder') . "/" . $this->id . "/verified/" . $username . ".txt";
        $userAccess = fopen($userAccessFile, "w+");
        if (flock($userAccess, LOCK_EX)) { // do an exclusive lock
            if ($writeAccess) {
                fwrite($userAccess, "write");
            } else {
                fwrite($userAccess, "read");
            }
            flock($userAccess, LOCK_UN); // release the lock
        } else {
            log_message("error", "course changeWriteAccessUser: id = ".$this->id." userAccessFile = ".$userAccessFile);
            return false;
        }
        fclose($userAccess);
        return true;
    }

    function checkMemberStatus($member = "") {
        log_message("debug", "course checkMemberStatus: id = ".$this->id." member = ".$member);
        
        $filename = $this->config->item('courseFolder') . "/" . $this->id;

        $members = scandir($filename . "/verified");
        if (in_array($member . ".txt", $members)) {
            if ($this->checkUserAccess($member)) {
                $this->memberStatus = "write";
                return;
            } else {
                $this->memberStatus = "read";
                return;
            }
        } else {
            $applied = scandir($filename . "/applied");
            if (in_array($member . ".txt", $applied)) {
                $this->memberStatus = "applied";
                return;
            }
        }
        $this->memberStatus = "error";
    }

    function readableMemberStatus() {
        if ($this->memberStatus === "error") {
            $this->memberStatus = "";
        } else if ($this->memberStatus === "applied") {
            $this->memberStatus = "Schwebend";
        } else if ($this->memberStatus === "write") {
            $this->memberStatus = "Mitglied (Schreibrechte)";
        } else {
            $this->memberStatus = "Mitglied (Leserechte)";
        }
    }

    function apply($username = "") {
        log_message("debug", "course apply: id = ".$this->id." username = ".$username);
        
        if (file_exists($this->config->item('courseFolder') . "/" . $this->id . "/verified/" . $username . ".txt") || file_exists($this->config->item('courseFolder') . "/" . $this->id . "/applied/" . $username . ".txt")) {
            return false;
        } else {
            // add currently logged in user to the course
            $userData = fopen($this->config->item('courseFolder') . "/" . $this->id . "/applied/" . $username . ".txt", "w+");
            if (flock($userData, LOCK_EX)) { // do an exclusive lock
                fwrite($userData, "applied");
                flock($userData, LOCK_UN); // release the lock
            } else {
                log_message("error", "course apply: id = ".$this->id." username = ".$username);
                return false;
            }
            fclose($userData);

            // add course to the user data
            $this->load->model('user');
            $this->user->loadUserData($username);
            $courses = $this->user->getCourses();
            array_push($courses, $this->id);
            $this->user->setCourses($courses);
            $this->user->saveUserData();
            return true;
        }
    }

    function createCourse() {
        log_message("debug", "course createCourse: id = ".$this->id);
        
        $this->load->library('session');

        $filename = $this->config->item('courseFolder') . "/" . $this->id;
        if (file_exists($filename)) {
            return false;
        } else {
            $course = array();
            $course["id"] = $this->id;
            $course["name"] = $this->name;
            $course["description"] = $this->description;
            $course["room"] = $this->room;
            $course["frozen"] = $this->frozen;

            // create folders
            mkdir($filename);
            mkdir($filename . "/applied");
            mkdir($filename . "/verified");

            // add currently logged in user to the course
            $adminData = fopen($filename . "/verified/" . $this->session->userdata('username') . ".txt", "w+");
            if (flock($adminData, LOCK_EX)) { // do an exclusive lock
                fwrite($adminData, "write");
                flock($adminData, LOCK_UN); // release the lock
            } else {
                log_message("debug", "course createCourse: id = ".$this->id." admin = ".$this->session->userdata('username'));
                return false;
            }
            fclose($adminData);

            // add course to the user data
            $this->load->model('user');
            $this->user->loadUserData($this->session->userdata('username'));
            $courses = $this->user->getCourses();
            array_push($courses, $this->id);
            $this->user->setCourses($courses);
            $this->user->saveUserData();

            // save general information of the course
            $filename = $filename . "/info.txt";
            $courseData = fopen($filename, "w+");
            if (flock($courseData, LOCK_EX)) { // do an exclusive lock
                fwrite($courseData, json_encode($course));
                flock($courseData, LOCK_UN); // release the lock
            } else {
                log_message("debug", "course createCourse: id = ".$this->id." filename = ".$filename);
                return false;
            }
            fclose($courseData);
            return true;
        }
    }

    function saveCourseData() {
        log_message("debug", "course saveCourseData: id = ".$this->id);
        
        $this->load->library('session');

        $filename = $this->config->item('courseFolder') . "/" . $this->id;

        $course = array();
        $course["id"] = $this->id;
        $course["name"] = $this->name;
        $course["description"] = $this->description;
        $course["room"] = $this->room;
        $course["frozen"] = $this->frozen;

        // save general information of the course
        $filename = $filename . "/info.txt";
        $courseData = fopen($filename, "w+");
        if (flock($courseData, LOCK_EX)) { // do an exclusive lock
            fwrite($courseData, json_encode($course));
            flock($courseData, LOCK_UN); // release the lock
        } else {
            log_message("error", "course saveCourseData: id = ".$this->id." filename = ".$filename);
            return false;
        }
        fclose($courseData);
        return true;
    }
    
    function freeze() {
        log_message("debug", "course freeze: id = ".$this->id);
        
        // change rights to read only for all verified members
        foreach ($this->members as $member) {
            if (!($this->changeWriteAccessUser($member))) {
                return false;
            }
        }
        
        // delete not verified members from this course
        foreach ($this->applied as $applied) {
            if (!($this->deleteUser($applied))) {
                return false;
            }
        }
        
        // save frozen status
        $this->frozen = true;
        if ($this->saveCourseData()) {
            return true;
        } else {
            return false;
        }
    }
    
    function deleteUser($username) {
        log_message("debug", "course deleteUser: id = ".$this->id." username = ".$username);
        
        $userAppliedFile = $this->config->item('courseFolder') . "/" . $this->id . "/applied/" . $username . ".txt";
        $userVerifiedFile = $this->config->item('courseFolder') . "/" . $this->id . "/verified/" . $username . ".txt";
        if (file_exists($userAppliedFile)) {
            unlink($userAppliedFile);
        } else if (file_exists($userVerifiedFile)) {
            unlink($userVerifiedFile);
        } else {
            return false;
        }
        
        // delete course from user data
        $this->load->model('user');
        $this->user->loadUserData($username);
        $courses = $this->user->getCourses();
        for ($count = 0; $count < count($courses); $count++) {
            if ($courses[$count] == $this->id) {
                unset($courses[$count]);
                break;
            }
        }
        $courses = array_values($courses);
        $this->user->setCourses($courses);
        if ($this->user->saveUserData()) {
            return true;
        } else {
            return false;
        }
    }
    function unfreeze(){
        log_message("debug", "course unfreeze: id = ".$this->id);
        
        // save frozen status
        $this->frozen = false;
        if ($this->saveCourseData()) {
            return true;
        } else {
            return false;
        }
    }
}
?>