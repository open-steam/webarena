<div class="container">
    <br></br>
    <br></br>
    <ul class="nav nav-tabs">
        <li><a href="<?php echo $this->config->site_url("courses"); ?>"><?php echo $this->gettext->getText("Meine Kurse"); ?></a></li>
        <li><a href="<?php echo $this->config->site_url("courses/all"); ?>"><?php echo $this->gettext->getText("Aktive Kurse"); ?></a></li>
        <li class="active"><a>Kurs Details</a></li>
        <?php if ($is_admin) { ?>
            <li><a href="<?php echo $this->config->site_url("courses/create"); ?>"><?php echo $this->gettext->getText("Kurs erstellen"); ?></a></li>
        <?php } ?>
    </ul>
    <div class="row">
        <div class="span3"></div>
        <div class="<?php if ($is_admin) echo "span7";
        else echo "span6"; ?>">
            <form autocomplete="off" onsubmit="return false;">
                <table class="table table-striped table-bordered" id="courseTable" style="width:100%;">
                    <thead>
                        <tr>
                            <th colspan="2">
                                Kurs Details
                                <?php
                                if ($is_admin && !($course->isFrozen())) {
                                    ?>
                                    <button id="freezeButton" class="btn btn-primary" style="float:right;">Kurs einfrieren</button>
                                    <?php
                                }
                                ?>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="width:50%;">Name:</td>
                            <td>
                                <?php
                                if ($is_admin && !($course->isFrozen())) {
                                    ?>
                                    <input type="text" id="inputCourseName" name="courseName" placeholder="Kursname" value="<?php echo htmlspecialchars($course->getName()); ?>" required>
                                    <img class="feedbackIcon" src="" />
                                    <?php
                                } else {
                                    echo $course->getName();
                                }
                                ?>
                            </td>
                        </tr>
                        <tr>
                            <td>Beschreibung:</td>
                            <td>
                                <?php
                                if ($is_admin && !($course->isFrozen())) {
                                    ?>
                                    <textarea id="inputDescription" name="description" placeholder="Beschreibung"><?php echo htmlspecialchars($course->getDescription()); ?></textarea>
                                    <img class="feedbackIcon" src="" />
                                    <?php
                                } else {
                                    echo nl2br($course->getDescription());
                                }
                                ?>
                            </td>
                        </tr>
                        <tr>
                            <td>Bestätigte Mitglieder:</td>
                            <td><?php echo count($course->getMembers()); ?></td>
                        </tr>
                        <tr>
                            <td>Schwebende Anmeldungen:</td>
                            <td><?php echo count($course->getApplied()); ?></td>
                        </tr>
                    </tbody>
                </table>
                <input type="hidden" id="baseURL" value="<?php echo $this->config->base_url(); ?>">
                <input type="hidden" id="courseID" value="<?php echo $course->getId(); ?>">
            </form>
        </div>
        <div class="span3"></div>
    </div>
    <hr>
    <?php
    if ($not_member && !($course->isFrozen())) {
        ?>
        <center>
            <input type="button" class="btn btn-primary" id="applyButton" value="Anmelden"/>
        </center>
        <hr>
        <?php
    } else if (!($course->isFrozen())) {
        ?>
        <center>
            <b>Aktueller Mitgliedstatus: <?php echo $course->getMemberStatus(); ?></b>
            <?php
            if ($course->getMemberStatus() != "Schwebend") {
                ?>
                <br><br>
                <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">Raum anzeigen</button>
                <?php
            }
            ?>
        </center>
        <hr>
        <?php
    } else if ($course->isFrozen()) {
        ?>
        <center>
        Dieser Kurs ist eingefroren.<br>
        Die zugehörigen Räume können weiterhin in der WebArena eingesehen, aber nicht mehr verändert werden.
        <br><br>
        <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">WebArena</button>
        </center>
        <hr>
        <?php
    }
    if ($is_admin) {
        ?>
        <div class="row">
            <div class="span12">
                <?php
                if (count($course->getMembers()) > 0) {
                    ?>
                    <b>Mitglieder</b>
                    <table id="memberTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                        <thead>
                            <tr>
                                <th style="width:28%;">Benutzername</th>
                                <th style="width:28%;">Vorname</th>
                                <th style="width:28%;">Nachname</th>
                                <?php
                                if (!($course->isFrozen())) {
                                    ?>
                                    <th>Schreibrechte</th>
                                    <th style="width:16px;"></th>
                                    <?php
                                }
                                ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $counter = 1;
                            if (count($course->getMembers()) > 0) {
                                foreach ($course->getMembers() as $member) {
                                    ?>
                                    <tr height="30">
                                        <td><?php echo $member->getUsername(); ?></td>
                                        <td><?php echo $member->getFirstName(); ?></td>
                                        <td><?php echo $member->getLastName(); ?></td>
                                        <?php
                                        if (!($course->isFrozen())) {
                                            ?>
                                            <td>
                                                <input type="hidden" class="username" value="<?php echo $member->getUsername(); ?>">
                                                <input type="checkbox" style="" class="writeAccessCheckbox" value="" <?php if ($member->getWriteAccess()) echo "checked=\"checked\""; ?>>
                                                <img id="<?php echo $member->getUsername(); ?>" src="">
                                            </td>
                                            <td>
                                                <input type="hidden" class="username" value="<?php echo $member->getUsername(); ?>">
                                                <img class="deleteUserButton" onemouseover="" style="height:16px; cursor:pointer;" src="<?php echo $this->config->base_url() . "assets/img/delete.png"; ?>">
                                            </td>
                                            <?php
                                        }
                                        ?>
                                    </tr>
                                    <?php
                                    $counter++;
                                }
                            } else {
                                ?>
                                <tr>
                                    <td style="height:21px;" colspan="4">Keine Mitglieder</td>
                                </tr>
                                <?php
                            }
                            ?>
                        </tbody>
                    </table>
                    <?php
                }
                if (count($course->getMembers()) > 0 && count($course->getApplied()) > 0) {
                    ?>
                    <br></br>
                    <?php
                }
                if (count($course->getApplied()) > 0) {
                    ?>
                    <b>Schwebende Anmeldungen</b>
                    <table id="appliedTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                        <thead>
                            <tr>
                                <th style="width:33%;">Benutzername</th>
                                <th style="width:33%;">Vorname</th>
                                <th style="width:33%;">Nachname</th>
                                <?php
                                if (count($course->getApplied()) > 0 && !($course->isFrozen())) {
                                    ?>
                                    <th></th>
                                    <th></th>
                                    <?php
                                }
                                ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $counter = 1;
                            if (count($course->getApplied()) > 0) {
                                foreach ($course->getApplied() as $member) {
                                    ?>
                                    <tr>
                                        <td><?php echo $member->getUsername(); ?></td>
                                        <td><?php echo $member->getFirstName(); ?></td>
                                        <td><?php echo $member->getLastName(); ?></td>
                                        <?php
                                        if ($is_admin &&  !($course->isFrozen())) {
                                            ?>
                                            <td>
                                                <form action="" method="post" style="margin: 0 0 0 0;">
                                                    <input type="hidden" class="username" value="<?php echo $member->getUsername(); ?>">
                                                    <input type="button" class="btn btn-primary verifyButton" value="Anmeldung bestätigen"/>
                                                </form>
                                            </td>
                                            <td>
                                                <form action="" method="post" style="margin: 0 0 0 0;">
                                                    <input type="hidden" class="username" value="<?php echo $member->getUsername(); ?>">
                                                    <input type="button" class="btn btn-primary deleteUserButton" value="Anmeldung ablehnen"/>
                                                </form>
                                            </td>
                                            <?php
                                        }
                                        ?>
                                    </tr>
                                    <?php
                                    $counter++;
                                }
                            } else {
                                ?>
                                <tr>
                                    <td style="height:21px;" colspan="4">Keine schwebenden Anmeldungen</td>
                                </tr>
                                <?php
                            }
                            ?>
                        </tbody>
                    </table>
    <?php } ?>
            </div>
        </div>  
        <hr>
    </div>
    <?php
}
?>

<script type="text/javascript" src="<?php echo $this->config->site_url("assets/js/course.js"); ?>" ></script>