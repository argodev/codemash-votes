var uri = 'https://sessionize.com/api/v2/lo1f0aug/view/Sessions';
var precount = 0;
var regcount = 0;

$(document).ready(function () {
    $.getJSON(uri)
        .done(function (data) {
            $('#progress').hide();
            $.each(data[0].sessions, function (key, item) {
                if (item.categories[0].categoryItems) {
                  if (item.categories[0].categoryItems[0].name === 'PreCompiler') {
                      $(formatItem(item)).appendTo($('#precompilers'));
                  } else if (item.categories[0].categoryItems[0].name === 'General Session') {
                      $(formatItem(item)).appendTo($('#regularsessions'));
                  }
                } else {
                  console.log('failed');
                  console.log(item);
                }
            });
        });

    $('#votingform').submit(function () {
        var pcCount = 0;
        var regCount = 0;

        // loop through all checkboxes and build an array of the 
        // IDs for which boxes are checked.
        var checkArray = new Array();
        $('input[type=checkbox]').each(function () {
            if (this.checked) {
                checkArray.push(this.id);

                // get the tag for this item
                var ctrl = $('#' + this.id);
                var tabid = ctrl.parent().parent().parent().prop('id');

                if (tabid === "precompilers") {
                    pcCount += 1;
                } else if (tabid === "regularsessions") {
                    regCount += 1;
                }
            }
        });

        // let's do our count/validation here (rather than on the check handler)
        if (pcCount > 4) {
            $("#precompModal").modal("show");
        } else if (regCount > 15) {
            $("#regularModal").modal("show");
        } else {
            // ok, all is good now... we should be able to post/save
            var postData = { values: checkArray };

            $.ajax({
                type: "POST",
                url: "https://cmsessionvotes.azurewebsites.net/api/vote",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                processData: false,
                success: function () {
                    clearAllCbxs();
                    $("#successModal").modal("show");
                },
                dataType: "json",
                traditional: true
            });
        }

        return false; // return false to cancel form action
    });
});

function clearAllCbxs() {
    $('input[type=checkbox]').each(function () {
        if (this.checked) {
            // clear the checkbox
            this.checked = false;
            var ctrl = $('#' + this.id)

            // clear the selection
            ctrl.parent().parent().removeClass("alert-primary");
        }
    });

    // clear/reset the counters
    $("#pcCount").text("0/4");
    $("#regCount").text("0/15");
}

function handleCheckmark(cbxid) {
    // which pane is showing?
    var $tab = $('#mainContent')
    var $active = $tab.find('.tab-pane.active')
    var key = $active.prop('id');
    var ctrl = $('#' + cbxid)

    if (key === "precompilers") {
        var $pcSessionsPane = $("#precompilers");
        var $checkboxes = $pcSessionsPane.find("input[type='checkbox']");
        var $countDisplay = $("#pcCount");
        var count = $checkboxes.filter(":checked").length;
        $countDisplay.text(count.toString() + "/4");

        if (count > 4) {
            $countDisplay.removeClass("badge-primary");
            $countDisplay.addClass("badge-danger");
        } else {
            $countDisplay.removeClass("badge-danger");
            $countDisplay.addClass("badge-primary");
        }

        if (ctrl.prop('checked')) {
            ctrl.parent().parent().addClass("alert-primary");
            precount += 1;
        } else {
            ctrl.parent().parent().removeClass("alert-primary");
            precount -= 1;
        }
    } else if (key === "regularsessions") {
        var $regularSessionsPane = $("#regularsessions");
        var $checkboxes = $regularSessionsPane.find("input[type='checkbox']");
        var $countDisplay = $("#regCount");
        var count = $checkboxes.filter(":checked").length;
        $countDisplay.text(count.toString() + "/15");

        if (count > 15) {
            $countDisplay.removeClass("badge-primary");
            $countDisplay.addClass("badge-danger");
        } else {
            $countDisplay.removeClass("badge-danger");
            $countDisplay.addClass("badge-primary");
        }

        if (ctrl.prop('checked')) {
            ctrl.parent().parent().addClass("alert-primary");
            regcount += 1;
        } else {
            ctrl.parent().parent().removeClass("alert-primary");
            regcount -= 1;
        }
    }
}

function formatItem(item) {
    // build the holding div
    var card = $('<div />', {
        class: 'card mb-3',
    });

    var row = $('<div />', {
        class: 'row g-0'
    });

    row.appendTo(card);

    var checkboxColumn1 = $('<div />', {
        class: 'col-1 talk-checkbox bg-light'
    });

    checkboxColumn1.appendTo(row);

    $('<input>', {
        id: 'cbx' + item.id.toString(),
        type: 'checkbox',
        value: item.id,
        onclick: 'handleCheckmark(this.id);',
        class: 'form-check-input'
    }).appendTo(checkboxColumn1);

    var contentColumn2 = $('<div />', {
        class: 'col'
    });

    contentColumn2.appendTo(row);
    
    var cardBody = $('<div />', {
        class: 'card-body'
    });

    cardBody.appendTo(contentColumn2);
    
    var title = $(`<h5 />`, {
        html: item.title,
        class: 'card-title'
    });

    title.appendTo(cardBody);

    var speakers = $('<p />', {
        class: 'card-text'
    });
    
    // list the speakers
    $.each(item.speakers, function (index, speaker) {
        if (index > 0) {
            speakers.append(', ' + speaker.name + " ");
        } else {
            speakers.append(speaker.name);
        }
    });

    speakers.appendTo(cardBody);

    var badgeHolder = $('<p />', {
        class: 'card-text'
    });

    badgeHolder.appendTo(cardBody);


    // list the track
    var trackInfo = item.categories.find(category => category.name === 'Track');
    $('<span />', {
        class: 'badge bg-primary',
        html: trackInfo.categoryItems[0].name
    }).appendTo(badgeHolder);

    // list the level
    var levelInfo = item.categories.find(category => category.name === 'Level');
    $('<span />', {
        class: 'badge bg-info',
        html: levelInfo.categoryItems[0].name 
    }).appendTo(badgeHolder);

    // list the tags
    var tagsInfo = item.categories.find(category => category.name === 'Tags');
    $.each(tagsInfo.categoryItems, function (key, tag) {
        $('<span />', {
            class: 'badge bg-secondary',
            html: tag.name 
        }).appendTo(badgeHolder);
    });

    var showHideButton = $('<button />', {
        class: 'btn btn-dark',
        html: 'Show / Hide Button',
        type: 'button',
        'data-bs-toggle': 'collapse',
        'data-bs-target': `#collapse${item.id}`,
        'aria-expanded': 'false',
        'aria-controls': `collapse${item.id}`
    });

    showHideButton.appendTo(cardBody);

    var descriptionWrapper = $('<div />', {
        class: 'collapse',
        id: `collapse${item.id}`
    });

    descriptionWrapper.appendTo(cardBody);

    var description = $('<p />', {
        class: 'description',
        html: item.description
    });

    description.appendTo(descriptionWrapper);

    return card;
}
