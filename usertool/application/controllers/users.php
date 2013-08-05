<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Users extends MY_Controller {
    
    public function editProfile($username) {
        $this->load->library('session');
        
        $this->load->model('user');
        $this->user->loadUserData($username);
        if($this->input->is_ajax_request() == TRUE) {
            $response = array();
            if ($this->session->userdata("username") === $username) {
                if ($this->input->post("name") === "firstName") {
                    $this->user->setFirstName($this->input->post('value'));
                } else if ($this->input->post("name") === "lastName") {
                    $this->user->setLastName($this->input->post('value'));
                } else if ($this->input->post("name") === "email") {
                    $this->user->setEmail($this->input->post('value'));
                } else if ($this->input->post("name") === "room") {
                    $this->user->setRoom($this->input->post('value'));
                } else {
                    return;
                }
                if ($this->user->saveUserData()) {
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
        }
    }
}
?>