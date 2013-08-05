<div class="container">
    <br></br>
    <br></br>
    <div class="row">
        <div class="span3"></div>
        <div class="span7">
            <form autocomplete="off">
                <table class="table table-striped table-bordered" id="userTable" style="width:100%;">
                    <thead>
                        <tr>
                            <th colspan="2">Mein Profil</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="width:50%;">Benutzername:</td>
                            <td>
                                <?php echo $user->getUsername(); ?>
                            </td>
                        </tr>
                        <tr>
                            <td>Vorname:</td>
                            <td>
                                <input type="text" id="inputFirstName" name="firstName" placeholder="Vorname" value="<?php echo $user->getFirstName();?>" required>
                                <img class="feedbackIcon" src="" />
                            </td>
                        </tr>
                        <tr>
                            <td>Nachname:</td>
                            <td>
                                <input type="text" id="inputLastName" name="lastName" placeholder="Nachname" value="<?php echo $user->getLastName(); ?>" required>
                                <img class="feedbackIcon" src="" />
                            </td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td>
                                <input type="email" id="inputEmail" name="email" placeholder="Email" value="<?php echo $user->getEmail(); ?>" required>
                                <img class="feedbackIcon" src="" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <input type="hidden" id="baseURL" value="<?php echo $this->config->base_url(); ?>">
                <input type="hidden" id="username" value="<?php echo $user->getUsername(); ?>">
            </form>
        </div>
    </div>
    <div class="row">
        <div class="span3"></div>
        <div class="span7">
            <form autocomplete="off" id="passwordForm" onsubmit="return false;">
                <table class="table table-striped table-bordered" id="passwordTable" style="width:100%;">
                    <thead>
                        <tr>
                            <th colspan="2">Passwort ändern</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="width:50%;">Altes Passwort:</td>
                            <td>
                                <input type="password" id="passwordOld" name="passwordOld" placeholder="Altes Passwort" value="" required>
                            </td>
                        </tr>
                        <tr>
                            <td style="width:50%;">Altes Passwort wiederholen:</td>
                            <td>
                                <input type="password" id="passwordOld2" name="passwordOld2" placeholder="Altes Passwort" value="" required>
                            </td>
                        </tr>
                        <tr>
                            <td style="width:50%;">Neues Passwort:</td>
                            <td>
                                <input type="password" id="passwordNew" name="passwordNew" placeholder="Neues Passwort" value="" required>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <center>
                                    <button type="submit" class="btn btn-primary">Passwort ändern</button>
                                    <br><br>
                                    <b id="passwordFeedback"></b>
                                </center>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    </div>
    <hr>
</div>

<script type="text/javascript" src="<?php echo $this->config->site_url("assets/js/home.js"); ?>" ></script>