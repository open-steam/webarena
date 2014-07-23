<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Registration extends CI_Controller {

    public function index() {
        $this->load->library('session');
        $this->load->library('getText');

        $data = array();

        if ($this->input->is_ajax_request() == TRUE) {
            $response = array();

            if (!defined("LOGIN_WITH_EMAIL") || !LOGIN_WITH_EMAIL) {
                $namePattern = "/^[a-z\d]+$/i";
                if (!preg_match($namePattern, $this->input->post('username'))) {
                    $response["status"] = "error";
                    $response["error"] = "characters";
                    echo(json_encode($response));
                    return;
                }
            }

            if ($this->input->post('password') != $this->input->post('passwordRE')) {
                $response["status"] = "error";
                $response["error"] = "passwordRE";
                echo(json_encode($response));
                return;
            }

            $this->load->library('encrypt');
            $password = $this->encrypt->sha1($this->config->item('encryption_key') . $this->input->post('password'));

            $this->load->model('user');
            
            //TODO: Kommt als Username die Email zurueck?
            $this->user->setUsername($this->input->post('username'));
            //$this->user->setUsername($this->input->post('email'));
            
            $this->user->setPassword($password);
            $this->user->setEmail($this->input->post('email'));
            $this->user->setFirstName($this->input->post('firstName'));
            $this->user->setLastName($this->input->post('lastName'));
            $this->user->setCourses(array());
            $this->user->setRoom($this->user->getUsername());

            if (($result = $this->user->createUser()) === "success") {
                $this->session->set_userdata('username', $this->input->post('username'));
                $this->session->set_userdata('password', $password);
                $this->session->set_userdata('logged_in', TRUE);
                if (in_array($this->input->post('username'), $this->config->item('admins'))) {
                    $this->session->set_userdata('is_admin', TRUE);
                } else {
                    $this->session->set_userdata('is_admin', FALSE);
                }
                $response["status"] = "success";
            } else {
                // user already exists
                $response["status"] = "error";
                $response["error"] = $result;
            }
            echo(json_encode($response));
        } else {
            if ($this->session->userdata('logged_in')) {
                header('Location:' . $this->config->base_url() . "courses/all");
                return;
            } else {
                $data["navbar"] = $navbar = array("", "active");
                $data["logged_in"] = $this->session->userdata('logged_in');

                $this->load->view('header', $data);
                $this->load->view('registration');
                $this->load->view('footer');
            }
        }
    }

}