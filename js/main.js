//var uri = 'https://cmprod-speakers.azurewebsites.net/api/sessionsdata';
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

                      // Contain the popover within the body NOT the element it was called in.
                      //$('#popover' + item.id).popover({ container: 'body' });
                  } else if (item.categories[0].categoryItems[0].name === 'General Session') {
                      $(formatItem(item)).appendTo($('#regularsessions'));

                      // Contain the popover within the body NOT the element it was called in.
                      //$('#popover' + item.id).popover({ container: 'body', style: 'max-width: 400px; width: auto;' });
                  }
                } else {
                  console.log('failed');
                  console.log(item);
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

            $.ajax({
                type: "POST",
                url: "https://cmsessionvotes.azurewebsites.net/api/vote",
                //url: "http://localhost:4000/api/vote",
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
    var d1 = $('<div />', {
        class: 'checkbox',
    });

    // label that will hold the cbx
    var label = $('<label />', {
        id: 'popover' + item.id
    });

    //label.attr('data-content', item.description);
    //label.attr('data-placement', 'right');
    //label.attr('data-trigger', 'hover');

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
    var abstract_span = $('<span />');
    // create the button
    var show_abstract = $('<a />', {
        class: 'badge badge-dark',
        href: '#collapse' + item.id.toString(),
        role: 'button',
        text: 'Show/Hide Abstract'
    });

    // add the properties
    show_abstract.attr('data-toggle', 'collapse');
    show_abstract.attr('aria-expanded', false);
    show_abstract.attr('aria-controls', 'collapse' + item.id.toString());

    show_abstract.appendTo(abstract_span);
    abstract_span.appendTo(d1);

    // create our pop-down abstract
    var abstract_div = $('<div />', {
        class: 'collapse',
        id: 'collapse' + item.id.toString(),
    });

    var abstract_inner = $('<div />', {
        class: 'card card-body'
    });
    abstract_inner.text(item.description);
    abstract_inner.appendTo(abstract_div);

    abstract_div.appendTo(d1);

    // <p>
    //     <a href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    //         Link with href
    //     </a>
    //     <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
    //         Button with data-target
    //     </button>
    //     </p>



    return d1;
}
