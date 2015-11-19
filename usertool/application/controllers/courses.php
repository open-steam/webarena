<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Courses extends MY_Controller {

    public function index() {
        $this->load->library('session');
        $this->load->library('getText');

        $this->load->model('user');
        $this->user->loadUserData($this->session->userdata('username'));
        $this->user->loadCourseData(true, $this->session->userdata('is_admin'));

        $data = array(
            "navbar" => array("", "active"),
            "logged_in" => $this->session->userdata('logged_in'),
            "is_admin" => $this->session->userdata('is_admin'),
            "user" => $this->user
        );

        $this->load->view('header', $data);
        $this->load->view('courses', $data);
        $this->load->view('footer');
    }

    public function all() {
        $this->load->library('getText');
        $this->load->library('session');

        $this->load->model('user');
        $this->user->setUsername($this->session->userdata('username'));
        $this->user->loadAllCourseData();

        $data = array(
            "navbar" => array("", "active"),
            "logged_in" => $this->session->userdata('logged_in'),
            "is_admin" => $this->session->userdata('is_admin'),
            "user" => $this->user
        );

        $this->load->view('header', $data);
        $this->load->view('courses_all', $data);
        $this->load->view('footer');
    }

    public function create() {
        //Session is checked
        $this->load->library('session');
        $this->load->library('getText');


        //TODO: The following part can be used to create rooms from outside.
        // import post variables: courseName and description
        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            $this->load->model('course');
            $this->load->library('uuid');
            $this->course->setId($this->uuid->v4());
            $this->course->setName($this->input->post('courseName'));
            $this->course->setDescription($this->input->post('description'));
            $this->course->setRoom($this->course->getId());

            if ($this->course->createCourse()) {
                $response["status"] = "success";
                $response["url"] = $this->config->site_url("courses/" . $this->course->getId());
            } else {
                // error in creation
                $response["status"] = "error";
            }
            echo(json_encode($response));
        } else {
            $data = array(
                "navbar" => array("", "active"),
                "logged_in" => $this->session->userdata('logged_in'),
                "is_admin" => $this->session->userdata('is_admin')
            );

            $this->load->view('header', $data);
            $this->load->view('newcourse', $data);
            $this->load->view('footer');
        }
    }

    public function singleCourse($id) {
        $this->load->library('session');
        $this->load->library('getText');


        $this->load->model('course');
        $this->course->loadCourseData($id);
        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata("is_admin")) {
                if ($this->input->post("name") === "courseName") {
                    $this->course->setName($this->input->post('value'));
                } else if ($this->input->post("name") === "description") {
                    $this->course->setDescription($this->input->post('value'));
                } else {
                    return;
                }
                if ($this->course->saveCourseData()) {
                    $response["status"] = "success";
                    $response["name"] = $this->input->post("name");
                    $response["value"] = $this->input->post("value");
                } else {
                    // error saving course data
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        } else {
            $this->course->loadMemberData(true);
            $this->course->checkMemberStatus($this->session->userdata('username'));
            $not_member = ($this->course->getMemberStatus() === "error") ? true : false;
            $this->course->readableMemberStatus();

            $data = array(
                "navbar" => array("", "active"),
                "logged_in" => $this->session->userdata('logged_in'),
                "is_admin" => $this->session->userdata('is_admin'),
                "not_member" => $not_member,
                "course" => $this->course
            );

            $this->load->view('header', $data);
            $this->load->view('course', $data);
            $this->load->view('footer');
        }
    }

    public function verifyUser() {
        $this->load->library('session');
        $this->load->library('getText');


        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata('is_admin')) {
                $this->load->model('course');
                $this->course->setId($this->input->post("courseID"));
                if ($this->course->verifyUser($this->input->post("username"))) {
                    // success
                    $response["status"] = "success";
                } else {
                    // error
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

    public function changeWriteAccessUser() {
        $this->load->library('session');
        $this->load->library('getText');


        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata('is_admin')) {
                $this->load->model('course');
                $this->course->setId($this->input->post("courseID"));
                $response = array();
                if ($this->course->changeWriteAccessUser($this->input->post("username"), $this->input->post("writeAccess") === "true")) {
                    $response["status"] = "success";
                    $response["username"] = $this->input->post("username");
                } else {
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

    public function apply() {
        $this->load->library('session');
        $this->load->library('getText');


        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            $this->load->model('course');
            $this->course->setId($this->input->post("courseID"));
            if ($this->course->apply($this->session->userdata("username"))) {
                // success
                $response["status"] = "success";
            } else {
                // error
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

    public function deleteUser() {
        $this->load->library('session');
        $this->load->library('getText');


        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata('is_admin')) {
                $this->load->model('course');
                $this->course->setId($this->input->post("courseID"));
                if ($this->course->deleteUser($this->input->post("username"))) {
                    // success
                    $response["status"] = "success";
                } else {
                    // error
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

    public function unfreeze() {
        $this->load->library('session');
        $this->load->library('getText');
        

        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata('is_admin')) {
                $this->load->model('course');
                $this->course->loadCourseData($this->input->post("courseID"));
                $this->course->loadMemberData(false);
                if ($this->course->unfreeze()) {
                    // success
                    $response["status"] = "success";
                } else {
                    // error
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

    public function freeze() {
        $this->load->library('session');
        $this->load->library('getText');


        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata('is_admin')) {
                $this->load->model('course');
                $this->course->loadCourseData($this->input->post("courseID"));
                $this->course->loadMemberData(false);
                if ($this->course->freeze()) {
                    // success
                    $response["status"] = "success";
                } else {
                    // error
                    $response["status"] = "error";
                }
            } else {
                $response["status"] = "error";
            }
            echo(json_encode($response));
        }
    }

}