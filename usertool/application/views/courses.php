<div class="container">
    <br></br>
    <br></br>
    <ul class="nav nav-tabs">
        <li class="active"><a href="<?php echo $this->config->site_url("courses"); ?>">Meine Kurse</a></li>
        <li><a href="<?php echo $this->config->site_url("courses/all"); ?>">Aktive Kurse</a></li>
        <?php if ($is_admin) { ?>
            <li><a href="<?php echo $this->config->site_url("courses/create"); ?>">Kurs erstellen</a></li>
        <?php } ?>
    </ul>
    <input type="hidden" id="baseURL" value="<?php echo $this->config->base_url(); ?>">
    <div class="row">
        <div class="span1"></div>
        <div class="span10">
            <b>Angenommene Anmeldungen</b>
            <?php
            if (count($user->getCoursesMember()) > 0) {
                ?>
                <table id="verifiedTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                    <thead>
                        <tr>
                            <th style="width:27%;">Kursname</th>
                            <th style="width:27%;">Beschreibung</th>
                            <th style="width:27%;">Rechte</th>
                            <th style="width:19%;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $counter = 1;
                        foreach ($user->getCoursesMember() as $course) {
                            ?>
                            <tr>
                                <td><a href="<?php echo $this->config->base_url() . "courses/" . $course->getId(); ?>"><?php echo $course->getName(); ?></a></td>
                                <td><?php echo nl2br($course->getDescription()); ?></td>
                                <td><?php echo ($course->getMemberStatus() === "read") ? "Leserechte" : "Schreibrechte"; ?></td>
                                <td>
                        <center>
                            <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">Raum anzeigen</button>
                        </center>
                        </td>
                        </tr>
                        <?php
                        $counter++;
                    }
                    ?>
                    </tbody>
                </table>
                <?php
            } else {
                ?>
                <br>
                Keine angenommenen Anmeldungen
                <?php
            }
            if (count($user->getCoursesMember()) == 0) {
                ?>
                <br><br>
                <?php
            }
            ?>
            <b>Schwebende Anmeldungen</b>
            <?php
            if (count($user->getCoursesApplied()) > 0) {
                ?>
                <table id="appliedTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                    <thead>
                        <tr>
                            <th style="width:40%;">Kursname</th>
                            <th style="width:60%;">Beschreibung</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $counter = 1;
                        foreach ($user->getCoursesApplied() as $course) {
                            ?>
                            <tr>
                                <td><a href="<?php echo $this->config->base_url() . "courses/" . $course->getId(); ?>"><?php echo $course->getName(); ?></a></td>
                                <td><?php echo nl2br($course->getDescription()); ?></td>
                            </tr>
                            <?php
                            $counter++;
                        }
                        ?>
                    </tbody>
                </table>
                <?php
            } else {
                ?>
                <br>
                Keine schwebenden Anmeldungen
                <?php
            }
            if (count($user->getCoursesApplied()) == 0) {
                ?>
                <br><br>
                <?php
            }
            if (count($user->getCoursesFrozen()) > 0) {
                ?>
                <b>Eingefrorene Kurse</b>
                <table id="verifiedTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                    <thead>
                        <tr>
                            <th style="width:27%;">Kursname</th>
                            <th style="width:27%;">Beschreibung</th>
                            <th style="width:27%;">Rechte</th>
                            <th style="width:19%;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $counter = 1;
                        foreach ($user->getCoursesFrozen() as $course) {
                            ?>
                            <tr>
                                <td><a href="<?php echo $this->config->base_url() . "courses/" . $course->getId(); ?>"><?php echo $course->getName(); ?></a></td>
                                <td><?php echo nl2br($course->getDescription()); ?></td>
                                <td><?php echo ($course->getMemberStatus() === "read") ? "Leserechte" : "Schreibrechte"; ?></td>
                                <td>
                        <center>
                            <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">Raum anzeigen</button>
                        </center>
                        </td>
                        </tr>
                        <?php
                        $counter++;
                    }
                    ?>
                    </tbody>
                </table>
                <?php
            }
            ?>
        </div>
        <div class = "span1"></div>
    </div>
    <?php
    $hasApplied = false;
    foreach ($user->getCoursesMember() as $course) {
        if (count($course->getApplied()) > 0) {
            $hasApplied = true;
            break;
        }
    }
    if ($is_admin && $hasApplied) {
        ?>
        <hr>
        <b>Schwebende Anmeldungen in verwalteten Kursen</b>
        <table id="appliedAdminTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
            <thead>
                <tr>
                    <th style="width:50%;">Kurs</th>
                    <th style="width:50%;">Benutzer</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <?php
                foreach ($user->getCoursesMember() as $course) {
                    if (count($course->getApplied()) > 0) {
                        foreach ($course->getApplied() as $applied) {
                            ?>
                            <tr>
                                <td><a href="<?php echo $this->config->base_url() . "courses/" . $course->getId(); ?>"><?php echo $course->getName(); ?></a></td>
                                <td><?php echo $applied->getUsername() . " (" . $applied->getFullName() . ")"; ?></td>
                                <td>
                                    <form action="" method="post" style="margin: 0 0 0 0;">
                                        <input type="hidden" class="username" value="<?php echo $applied->getUsername(); ?>">
                                        <input type="hidden" class="courseID" value="<?php echo $course->getId(); ?>">
                                        <input type="button" class="btn btn-primary verifyButton" value="Anmeldung bestätigen"/>
                                    </form>
                                </td>
                                <td>
                                    <form action="" method="post" style="margin: 0 0 0 0;">
                                        <input type="hidden" class="username" value="<?php echo $applied->getUsername(); ?>">
                                        <input type="hidden" class="courseID" value="<?php echo $course->getId(); ?>">
                                        <input type="hidden" class="courseName" value="<?php echo $course->getName(); ?>">
                                        <input type="button" class="btn btn-primary deleteUserButton" value="Anmeldung ablehnen"/>
                                    </form>
                                </td>
                            </tr>
                            <?php
                        }
                    }
                }
                ?>
            </tbody>
        </table>
        <?php
    }
    ?>
    <hr>
</div>

<script type = "text/javascript" src = "<?php echo $this->config->site_url("assets/js/courses.js"); ?>" ></script>