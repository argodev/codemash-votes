//var uri = 'https://cmprod-speakers.azurewebsites.net/api/sessionsdata';
var uri = 'https://sessionize.com/api/v2/mqm7pgek/view/sessions';
var precount = 0;
var regcount = 0;

$(document).ready(function () {
    $.getJSON(uri)
        .done(function (data) {
            $('#progress').hide();
            $.each(data[0].sessions, function (key, item) {
                if (item.categories[0].categoryItems[0].name === 'PreCompiler') {

                    $(formatItem(item)).appendTo($('#precompilers'));

                    // Contain the popover within the body NOT the element it was called in.
                    $('#popover' + item.id).popover({ container: 'body' });
                } else if (item.categories[0].categoryItems[0].name === 'General Session') {
                    $(formatItem(item)).appendTo($('#regularsessions'));

                    // Contain the popover within the body NOT the element it was called in.
                    $('#popover' + item.id).popover({ container: 'body', style: 'max-width: 400px; width: auto;' });
                }
            });
        });

    $('#popoverData').popover();

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
            console.log(JSON.stringify(postData));

            $.ajax({
                type: "POST",
                url: "/Votes/Vote",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                processData: false,
                success: function (data) {
                    $("#successModal").modal("show");
                },
                dataType: "json",
                traditional: true
            });
        }

        return false; // return false to cancel form action
    });
});

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
    var d1 = $('<div />', {
        class: 'checkbox',
    });

    // label that will hold the cbx
    var label = $('<label />', {
        id: 'popover' + item.id
    });

    label.attr('data-content', item.description);
    label.attr('data-placement', 'right');
    label.attr('data-trigger', 'hover');

    $('<input>', {
        id: 'cbx' + item.id.toString(),
        type: 'checkbox',
        value: item.id,
        onclick: 'handleCheckmark(this.id);'
    }).appendTo(label);

    // put the title out to the right of the cbx
    label.append(item.title);

    // add the speakers info
    var spkrs = $('<span />');
    spkrs.append(" - ");
    
    var scount = 0;
    // list the speakers
    $.each(item.speakers, function (key, speaker) {
        if (scount > 0) {
            spkrs.append(', ' + speaker.name + " ");
        } else {
            spkrs.append(speaker.name + " ");
        }

        scount += 1;
    });

    label.append(spkrs);

    // list the track
    $.each(item.categories[1].categoryItems, function (key, tag) {

        $('<span />', {
            class: 'badge badge-primary',
            html: tag.name 
        }).appendTo(label);
        label.append(' ');
    });

    // list the level
    $.each(item.categories[2].categoryItems, function (key, tag) {

        $('<span />', {
            class: 'badge badge-info',
            html: tag.name 
        }).appendTo(label);
        label.append(' ');
    });

    // list the tags
    $.each(item.categories[3].categoryItems, function (key, tag) {

        $('<span />', {
            class: 'badge badge-secondary',
            html: tag.name 
        }).appendTo(label);
        label.append(' ');
    });
    
    // attach our label to the div
    label.appendTo(d1);
    
    return d1;
}