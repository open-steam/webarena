<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    public function index() {
        $this->load->library('session');
        
        $this->load->model('user');
        $this->user->loadUserdata($this->session->userdata('username'));
        
        $data = array(
            "navbar" => array("active", ""),
            "logged_in" => $this->session->userdata('logged_in'),
            "user" => $this->user
        );

        $this->load->view('header', $data);
        $this->load->view('home', $data);
        $this->load->view('footer');
    }

}