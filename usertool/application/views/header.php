<!DOCTYPE html>
<html>
    <head>
        <title>eLab WebArena Nutzerverwaltung</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Bootstrap -->
        <link href="<?php echo $this->config->site_url("assets/css/bootstrap.min.css"); ?>" rel="stylesheet" media="screen">
        <link href="<?php echo $this->config->site_url("assets/css/style.css"); ?>" rel="stylesheet" media="screen">
        <script src="http://code.jquery.com/jquery.js"></script>
        <script src="<?php echo $this->config->site_url("/assets/js/bootstrap.min.js"); ?>"></script>
        <script type="text/javascript" src="<?php echo $this->config->site_url("/assets/js/jquery.tablesorter.js"); ?>"></script> 
    </head>
    <body>
        <div class="navbar navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container">
                    <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <a class="brand" href="<?php echo $this->config->base_url(); ?>">eLab WebArena Nutzerverwaltung</a>
                    <div class="nav-collapse">
                        <ul class="nav">
                            <?php if ($logged_in) { ?>
                                <li class="<?php echo($navbar[0]); ?>"><a href="<?php echo $this->config->site_url("home"); ?>">Mein Profil</a></li>
                                <li class="<?php echo($navbar[1]); ?>"><a href="<?php echo $this->config->site_url("courses"); ?>">Kurse</a></li>
                                <li><a href="<?php echo $this->config->site_url("logout"); ?>">Logout</a></li>
                            <?php } else { ?>
                                <li class="<?php echo($navbar[0]); ?>"><a href="<?php echo $this->config->site_url("login"); ?>">Anmeldung</a></li>
                                <li class="<?php echo($navbar[1]); ?>"><a href="<?php echo $this->config->site_url("registration"); ?>">Registrierung</a></li>
                            <?php } ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>