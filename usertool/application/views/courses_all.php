<div class="container">

    <br></br>
    <br></br>

    <ul class="nav nav-tabs">
        <li><a href="<?php echo $this->config->site_url("courses"); ?>"><?php echo $this->gettext->getText("Meine Kurse"); ?></a></li>
        <li class="active"><a href="<?php echo $this->config->site_url("courses/all"); ?>"><?php echo $this->gettext->getText("Aktive Kurse"); ?></a></li>
        <?php if ($is_admin) { ?>
            <li><a href="<?php echo $this->config->site_url("courses/create"); ?>"><?php echo $this->gettext->getText("Kurs erstellen"); ?></a></li>
        <?php } ?>
    </ul>

    <div class="row">
        <div class="span1"></div>
        <div class="span10">
            <b><?php echo $this->gettext->getText("Aktive Kurse"); ?></b>
            <?php
            if (count($user->getCourses()) > 0) {
                ?>
                <table id="coursesTable" class="table table-striped table-bordered tablesorter" style="width:100%;">
                    <thead>
                        <tr>
                            <th style="width:25%;"><?php echo $this->gettext->getText("Kursname"); ?></th>
                            <th style="width:50%;">Beschreibung</th>
                            <th style="width:25%;">Mitgliedsstatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $counter = 1;

                        foreach ($user->getCourses() as $course) {
                            if (!($course->isFrozen())) {
                                ?>
                                <tr>
                                    <td><a href="<?php echo $this->config->base_url() . "courses/" . $course->getId(); ?>"><?php echo $course->getName(); ?></a></td>
                                    <td><?php echo nl2br($course->getDescription()); ?></td>
                                    <td><?php echo $course->getMemberStatus(); ?></td>
                                </tr>
                                <?php
                                $counter++;
                            }
                        }
                        ?>
                    </tbody>
                </table>
                <?php
            } else {
                ?>
                <br>
                Keine <?php echo $this->gettext->getText("Kurse"); ?> vorhanden
                <?php
            }
            ?>
        </div>  
        <div class="span1"></div>
    </div>
    <hr>
</div>

<script type="text/javascript" src="<?php echo $this->config->site_url("assets/js/courses_all.js"); ?>" ></script>