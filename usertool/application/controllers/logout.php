<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Logout extends CI_Controller {

    public function index() {
        $this->load->library('session');
        $this->load->library('getText');
        
        $this->session->sess_destroy();

        header('Location:' . $this->config->base_url());
        return;
    }
    
    public function delete() {
        $this->load->library('session');
        $this->load->library('getText');
        
        $this->load->model('user');
        
        $this->user->loadUserData($this->session->userdata('username'));
        
        $result = array();
        if ($this->user->deleteUser()) {
            $result["status"] = "success";
            $this->session->sess_destroy();
        } else {
            $result["status"] = "error";
        }
        
        echo(json_encode($result));
        return;
    }
}
?>