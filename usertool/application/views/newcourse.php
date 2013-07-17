<div class="container">
    <br></br>
    <br></br>
    <ul class="nav nav-tabs">
        <li><a href="<?php echo $this->config->site_url("courses"); ?>">Meine Kurse</a></li>
        <li><a href="<?php echo $this->config->site_url("courses/all"); ?>">Aktive Kurse</a></li>
        <?php if ($is_admin) { ?>
            <li class="active"><a href="<?php echo $this->config->site_url("courses/create"); ?>">Kurs erstellen</a></li>
        <?php } ?>
    </ul>
    <div class="row">
        <div class="span12">
            <div class="row">
                <div class="span2"></div>
                <div class="span10">
                    <form class="form-horizontal" id="newCourseForm">
                        <div class="control-group">
                            <label class="control-label" for="inputCourseName">Kursname:</label>
                            <div class="controls">
                                <input type="text" id="inputCourseName" name="courseName" placeholder="Kursname" required>
                                <label class="error" for="inputCourseName" id="coursename_error" style="display:inline; color:red;"></label>
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label" for="inputDescription">Beschreibung:</label>
                            <div class="controls">
                                <textarea id="inputDescription" name="description" placeholder="Beschreibung"></textarea>
                            </div>
                        </div>
                        <div class="control-group">
                            <div class="controls">
                                <button type="submit" class="btn">Kurs erstellen</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>  
    <hr>
</div>

<script type="text/javascript" src="<?php echo $this->config->site_url("assets/js/newcourse.js"); ?>" ></script>