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
                            <th style="width:30%;">Kursname</th>
                            <th style="width:30%;">Beschreibung</th>
                            <th style="width:30%;">Rechte</th>
                            <th></th>
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
                            <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">WebArena</button>
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
                            <th style="width:30%;">Kursname</th>
                            <th style="width:30%;">Beschreibung</th>
                            <th style="width:30%;">Rechte</th>
                            <th></th>
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
                            <button class="btn btn-primary" onclick="window.location = '<?php echo $this->config->base_url() . "webarena/" . $course->getId(); ?>';">WebArena</button>
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
    <hr>
</div>

<script type = "text/javascript" src = "<?php echo $this->config->site_url("assets/js/courses.js"); ?>" ></script>