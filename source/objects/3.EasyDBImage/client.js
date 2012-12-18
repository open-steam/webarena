EasyDBImage.justCreated = function () {
    this.execute();
}

EasyDBImage.execute = function () {

    var that = this;

    var pageOneContent = $('' +
        '<div id="easydb-dialog">' +
        '<input id="search-title" class="maxWidth" placeholder="Titel">' +
        '<input id="search-artist" class="maxWidth" placeholder="Künstler">' +
        '<input id="search-location" class="maxWidth" placeholder="Standort">' +
        '<input id="search-presented-location" class="maxWidth" placeholder="Dargestellter Ort">' +
        '<input id="search-reference" class="maxWidth" placeholder="Abbildungsnachweis">' +
        '</div>'
    );

    var createPageTwo = function () {
        var searchParams = {
            title:$(pageOneContent).find("#search-title").val(),
            artist:$(pageOneContent).find("#search-artist").val(),
            location:$(pageOneContent).find("#search-location").val(),
            presentedLocation:$(pageOneContent).find("#search-presented-location").val(),
            reference:$(pageOneContent).find("#search-reference").val()
        };
        var data = {
            roomID:that.getRoomID(),
            objectID:that.getID(),
            searchParams:searchParams
        }

        var pageTwoButtons = {
            "OK":function () {
                var pictureUrl = $('.selected-row').attr('easydbdownloadurl');
                var easyDbId = $('.selected-row').attr('easydbimageid');

                that.setAttribute('remote_url', pictureUrl);
                that.setAttribute('easydb_id', easyDbId);
            },
            "Cancel":function () {
                return false;
            }
        };

        var dialog_pass_through = {
            create:function () {
                Modules.Dispatcher.query('search', data, function (searchResults) {
                    that.searchParams = searchParams;
                    that.renderResultPage(searchResults, ".ui-dialog-content");
                });
            },
            height:600
        }

        return GUI.dialog(
            that.translate("EASYDB_IMAGE_SELECTION"),
            that.renderLoadScreen('.ui-dialog-content'),
            pageTwoButtons,
            500,
            dialog_pass_through
        )
    };

    var pageOneButtons = {
        "OK":function () {
            createPageTwo().on("dblclick", ".result-row", function () {
                $(':button:contains("OK")').click();
            });
        },
        "Cancel":function () {
            return false;
        }
    }


    var dialog = GUI.dialog(
        that.translate("EASYDB_SEARCH_HEADER"),
        pageOneContent, pageOneButtons, 500, {height:500}
    )

    dialog.keyup(function (e) {
        if (e.keyCode == 13) {
            $(':button:contains("OK")').click();
        }
    });
}