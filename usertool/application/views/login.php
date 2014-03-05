<div class="container">
    <input type="hidden" id="hiddenValue" value="<?php echo defined("LOGIN_WITH_EMAIL") && LOGIN_WITH_EMAIL;?>" />
    <br></br>
    <br></br>
    <div class="row">
        <div class="span12">
            <div class="row">
                <div class="span2"></div>
                <div class="span10">
                    <form class="form-horizontal" id="loginForm">
                        <?php
                        if(defined("LOGIN_WITH_EMAIL") && LOGIN_WITH_EMAIL){
                            echo '<div class="control-group">
                            <label class="control-label" for="inputEmail">Email:</label>
                            <div class="controls">
                                <input type="email" id="inputEmail" name="email" placeholder="Email" required>
                                <label class="error" for="inputEmail" id="email_error" style="display:inline; color:red;"></label>
                            </div>
                        </div>';
                        }else{
                            echo '<div class="control-group">
                            <label class="control-label" for="inputUsername">Benutzername:</label>
                            <div class="controls">
                                <input type="text" id="inputUsername" name="username" placeholder="Benutzername" required>
                                <label class="error" for="inputUsername" id="username_error" style="display:inline; color:red;"></label>
                            </div>
                        </div>';
                        }
                         
                        
                        ?>
                        <div class="control-group">
                            <label class="control-label" for="inputPassword">Passwort:</label>
                            <div class="controls">
                                <input type="password" id="inputPassword" name="password" placeholder="Passwort" required>
                                <label class="error" for="inputPassword" id="password_error" style="display:inline; color:red;"></label>
                            </div>
                        </div>
                        <div class="control-group">
                            <div class="controls">
                                <button id="loginButton" class="btn" type="submit">Anmelden</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>  

    <hr>
</div>

<script type="text/javascript" src="<?php echo $this->config->site_url("assets/js/login.js"); ?>" ></script>