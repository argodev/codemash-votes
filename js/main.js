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
    
    var title = $(`<h5>${item.title}</h5>`, {
        class: 'card-title'
    });

    title.appendTo(cardBody);

    var badgeHolder = $('<p />', {
        class: 'card-text'
    });
    
    badgeHolder.appendTo(cardBody);


    // var scount = 0;
    // // list the speakers
    // $.each(item.speakers, function (key, speaker) {
    //     if (scount > 0) {
    //         spkrs.append(', ' + speaker.name + " ");
    //     } else {
    //         spkrs.append(speaker.name + " ");
    //     }

    //     scount += 1;
    // });

    // label.append(spkrs);

    // // list the track
    // $.each(item.categories[1].categoryItems, function (key, tag) {

    //     $('<span />', {
    //         class: 'badge bg-primary',
    //         html: tag.name 
    //     }).appendTo(label);
    //     label.append(' ');
    // });

    // // list the level
    // $.each(item.categories[2].categoryItems, function (key, tag) {

    //     $('<span />', {
    //         class: 'badge bg-info',
    //         html: tag.name
    //     }).appendTo(label);
    //     label.append(' ');
    // });

    // // list the tags
    // $.each(item.categories[3].categoryItems, function (key, tag) {

    //     $('<span />', {
    //         class: 'badge bg-secondary',
    //         html: tag.name 
    //     }).appendTo(label);
    //     label.append(' ');
    // });
    
    // // attach our label to the div
    // label.appendTo(d1);
    // var abstract_span = $('<span />');
    // // create the button
    // var show_abstract = $('<a />', {
    //     class: 'badge bg-dark',
    //     href: '#collapse' + item.id.toString(),
    //     role: 'button',
    //     text: 'Show/Hide Abstract'
    // });

    // // add the properties
    // show_abstract.attr('data-toggle', 'collapse');
    // show_abstract.attr('aria-expanded', false);
    // show_abstract.attr('aria-controls', 'collapse' + item.id.toString());

    // show_abstract.appendTo(abstract_span);
    // abstract_span.appendTo(d1);

    // // create our pop-down abstract
    // var abstract_div = $('<div />', {
    //     class: 'collapse',
    //     id: 'collapse' + item.id.toString(),
    // });

    // var abstract_inner = $('<div />', {
    //     class: 'card card-body'
    // });
    // abstract_inner.text(item.description);
    // abstract_inner.appendTo(abstract_div);

    // abstract_div.appendTo(d1);

    return card;
}


// <div class="card mb-3">
//     <div class="row g-0">
//         <div class="col-1 talk-checkbox bg-light">
//             <input class="form-check-input" id="cbx2837301" type="checkbox" value="2837301" onclick="handleCheckmark(this.id);">
//         </div>
//         <div class="col">
//            <div class="card-body">
//                <h5 class="card-title">Architecting and Building Serverless Solutions in Azure</h5>
//                <p class="card-text">
// HERE
//                    <span class="badge bg-primary">Architecture</span>
//                    <span class="badge bg-info">Intermediate</span>
//                    <span class="badge bg-secondary">.NET</span>
//                    <span class="badge bg-secondary">Cloud</span>
//                </p>
//                <button class="btn btn-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2837301" aria-expanded="false" aria-controls="collapse2837301">
//                    Show/Hide Abstract
//                </button>
//                <div class="collapse" id="collapse2837301">
//                    <div class="description">
//                    This workshop is a guided activity to learn, architect, and implement a real-world, serverless solution in the Microsoft Azure ecosystem.  
//                    The tools utilized will include Azure Functions, Cosmos DB, Event Grid, Logic Apps, Application Insights, and Azure storage.  
//                    After completing the workshop, attendees will be able to take the skills they've learned and apply them to solutions for both enterprise and personal projects.
//                    </div>
//                </div>
//            </div>
//        </div>
//     </div>
// </div>
