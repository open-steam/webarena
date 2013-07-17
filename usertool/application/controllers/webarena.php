<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Webarena extends CI_Controller {

    public function index($room) {
        $this->load->library('session');
       
        if ($this->session->userdata('logged_in')) {
            $host = $this->config->item('webarenaHost');
            $port = $this->config->item('webarenaPort');

            $fp = fsockopen($host, $port);

            if ($fp) {
                $data = http_build_query(array(
                    "id" => $this->session->userdata('session_id'),
                    "username" => $this->session->userdata('username'),
                    "password" => $this->session->userdata('password')
                ));

                // send the request headers:
                fputs($fp, "POST /pushSession HTTP/1.1\r\n");
                fputs($fp, "Host: " . $this->config->item('webarenaHost') . "\r\n");

                fputs($fp, "Content-type: application/x-www-form-urlencoded\r\n");
                fputs($fp, "Content-length: " . strlen($data) . "\r\n");
                fputs($fp, "Connection: close\r\n\r\n");
                fputs($fp, $data);

                header("Location: http://" . $host . ":" . $port . "/room/" . $room . "#externalSession/" . $this->session->userdata('username') . "/". $this->session->userdata('session_id'));

            } else {
                throw new Exception("unable to connect to webarena server");
            }
        } else {
            header('Location:' . $this->config->base_url());
        }
    }
}
?>