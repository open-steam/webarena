<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Login extends CI_Controller {

    public function index() {
        $this->load->library('session');
        
        if($this->input->is_ajax_request() == TRUE) {
            $this->load->library('encrypt');
            
            $response = array();
            if ($this->input->post('username')) {
                $this->load->model('user');
                if ($this->user->loadUserData($this->input->post('username'))) {
                    $password = $this->encrypt->sha1($this->config->item('encryption_key').$this->input->post('password'));
                    if ($this->user->login($password)) {
                        $this->session->set_userdata('username', $this->input->post('username'));
                        $this->session->set_userdata('logged_in', TRUE);
                        $this->session->set_userdata('password', $password);
                        if (in_array($this->input->post('username'), $this->config->item('admins'))) {
                            $this->session->set_userdata('is_admin', TRUE);
                        } else {
                            $this->session->set_userdata('is_admin', FALSE);
                        }
                        $response["status"] = "success";
                    } else {
                        // login failed
                        $this->session->set_userdata('logged_in', FALSE);
                        $response["status"] = "error";
                        $response["error"] = "password";
                    }
                } else {
                    // username does not exist
                    $this->session->set_userdata('logged_in', FALSE);
                    $response["status"] = "error";
                    $response["error"] = "username";
                }
            }
            echo(json_encode($response));
        } else {
            if ($this->session->userdata('logged_in')) {
                header('Location:' . $this->config->base_url() . "courses");
                return;
            } else {
                $navbar = array("active", "");
                $data = array("navbar" => $navbar, "logged_in" => $this->session->userdata('logged_in'));
                $this->load->view('header', $data);
                $this->load->view('login');
                $this->load->view('footer');
            }
        }
    }
    
    public function password() {
        $this->load->library('session');
        $this->load->library('encrypt');
        
        if($this->input->is_ajax_request() == TRUE) {
            $response = array();
            
            if ($this->input->post('passwordNew') === $this->input->post('passwordNew2')) {
                $this->load->model('user');
                if ($this->user->loadUserData($this->session->userdata('username'))) {
                    $oldPassword = $this->encrypt->sha1($this->config->item('encryption_key').$this->input->post('passwordOld'));
                    if ($oldPassword === $this->user->getPassword()) {
                        $newPassword = $this->encrypt->sha1($this->config->item('encryption_key').$this->input->post('passwordNew'));
                        $this->user->setPassword($newPassword);
                        if ($this->user->saveUserData()) {
                            $response["status"] = "success";
                            $this->session->set_userdata("password", $newPassword);
                        } else {
                            // error in saving new password
                            $response["status"] = "error";
                            $response["error"] = "saving";
                        }
                    } else {
                        // oldPassword not old password
                        $response["status"] = "error";
                        $response["error"] = "invalid";
                    }
                } else {
                    // error loading user data
                    $response["status"] = "error";
                    $response["error"] = "loading";
                }
            } else {
                // passwordNew != passwordNew2
                $response["status"] = "error";
                $response["error"] = "newPassword";
            }
            echo(json_encode($response));
        }
    }
}
?>