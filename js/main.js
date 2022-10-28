var uri = "https://sessionize.com/api/v2/stb7qmud/view/Sessions";

const track_mapping = {
  Architecture: "arch",
  "Career Mapping & Development": "career",
  Data: "data",
  DevOps: "devops",
  "Hardware/IoT": "hardware",
  Mobile: "mobile",
  "Programming Principles": "principles",
  Security: "security",
  "Software Quality": "quality",
  "Teams/Leadership/The Future of Work": "teams",
  "UI/Design": "ui",
  "Web/Front-End": "web",
};

const validationInfo = {
  precompilers: { selectedTalks: [], validCount: 4 },
  arch: { selectedTalks: [], validCount: 5 },
  career: { selectedTalks: [], validCount: 3 },
  data: { selectedTalks: [], validCount: 5 },
  devops: { selectedTalks: [], validCount: 5 },
  hardware: { selectedTalks: [], validCount: 3 },
  mobile: { selectedTalks: [], validCount: 3 },
  principles: { selectedTalks: [], validCount: 5 },
  security: { selectedTalks: [], validCount: 3 },
  quality: { selectedTalks: [], validCount: 5 },
  teams: { selectedTalks: [], validCount: 5 },
  ui: { selectedTalks: [], validCount: 3 },
  web: { selectedTalks: [], validCount: 5 },
};

$(document).ready(function () {
  $.getJSON(uri).done(function (data) {
    json_data = data;
    $("#progress").hide();

    //fill in counts in headers
    $.each(validationInfo, function (trackKey, countData) {
      $(`#${trackKey}Count`).text(
        `${countData["selectedTalks"].length}/${countData["validCount"]}`
      );
    });

    $.each(data[0].sessions, function (key, item) {
      if (item.categories[0].categoryItems) {
        var sessionFormat = item.categories[0].categoryItems[0].name;

        if (sessionFormat === "PreCompiler") {
          $(formatItem(item)).appendTo($("#precompilers"));
        } else if (sessionFormat === "General Session") {
          var trackName = item.categories[1].categoryItems[0].name;
          var trackId = track_mapping[trackName];

          $(formatItem(item)).appendTo($("#" + trackId));
        }
      } else {
        console.log("failed");
        console.log(item);
      }
    });
  });

  $("#votingform").submit(function (event) {
    event.preventDefault();

    var tracksWithErrors = [];
    // let's do our count/validation here (rather than on the check handler)
    $.each(validationInfo, function (trackKey, countData) {
      if (countData["selectedTalks"].length > countData["validCount"]) {
        var trackName = Object.keys(track_mapping).find(
          (key) => track_mapping[key] === trackKey
        );
        tracksWithErrors.push(`<li>${trackName}</li>`);
      }
    });

    if (tracksWithErrors.length > 0) {
      var errorList = tracksWithErrors.join("");
      $("#errorList").html(errorList);
      $("#errorModal").modal("show");
    } else {
      // ok, all is good now... we should be able to post/save
      var checkArray = [];

      $.each(validationInfo, function (trackKey, countData) {
        checkArray = checkArray.concat(countData["selectedTalks"]);
      });

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
        traditional: true,
      });
    }
    return false; // return false to cancel form action
  });
});

function clearAllCbxs() {
  $("input[type=checkbox]").each(function () {
    if (this.checked) {
      // clear the checkbox
      this.checked = false;
      // clear the selection
      $(this).parent().parent().removeClass("alert-primary");
    }
  });

  $.each(validationInfo, function (trackKey, countData) {
    countData["selectedTalks"] = [];
    $(`#${trackKey}Count`).text(
      `${countData["selectedTalks"].length}/${countData["validCount"]}`
    );
  });

  $("#trackTabs > li:first > button").click();
}

function handleCheckmark(checkbox) {
  // which pane is showing?
  var $tab = $("#mainContent");
  var $active = $tab.find(".tab-pane.active");
  var trackKey = $active.prop("id");
  var ctrl = $(checkbox);
  var requiredCount = validationInfo[trackKey]["validCount"];

  var $trackSessionsPane = $(`#${trackKey}`);
  var $checkboxes = $trackSessionsPane.find("input[type='checkbox']");
  var $countDisplay = $(`#${trackKey}Count`);
  var count = $checkboxes.filter(":checked").length;

  $countDisplay.text(`${count}/${requiredCount}`);

  if (count > requiredCount) {
    $countDisplay.removeClass("bg-primary");
    $countDisplay.addClass("bg-danger");
  } else {
    $countDisplay.removeClass("bg-danger");
    $countDisplay.addClass("bg-primary");
  }

  var currentTalkId = ctrl.attr("id");

  if (ctrl.prop("checked")) {
    ctrl.parent().parent().addClass("alert-primary");
    validationInfo[trackKey]["selectedTalks"].push(currentTalkId);
  } else {
    ctrl.parent().parent().removeClass("alert-primary");

    validationInfo[trackKey]["selectedTalks"] = $.grep(
      validationInfo[trackKey]["selectedTalks"],
      function (selectedTalkId) {
        return selectedTalkId != currentTalkId;
      }
    );
  }
}

function formatItem(item) {
  // build the holding div
  var card = $("<div />", {
    class: "card mb-3",
  });

  var row = $("<div />", {
    class: "row g-0",
  });

  row.appendTo(card);

  var checkboxColumn1 = $("<div />", {
    class: "col-1 talk-checkbox bg-light",
  });

  checkboxColumn1.appendTo(row);

  $("<input>", {
    id: item.id.toString(),
    type: "checkbox",
    value: item.id,
    onclick: "handleCheckmark(this);",
    class: "form-check-input",
  }).appendTo(checkboxColumn1);

  var contentColumn2 = $("<div />", {
    class: "col",
  });

  contentColumn2.appendTo(row);

  var cardBody = $("<div />", {
    class: "card-body",
  });

  cardBody.appendTo(contentColumn2);

  var title = $(`<h5 />`, {
    html: item.title,
    class: "card-title",
  });

  title.appendTo(cardBody);

  var speakers = $("<p />", {
    class: "card-text",
  });

  // list the speakers
  $.each(item.speakers, function (index, speaker) {
    if (index > 0) {
      speakers.append(", " + speaker.name + " ");
    } else {
      speakers.append(speaker.name);
    }
  });

  speakers.appendTo(cardBody);

  var badgeHolder = $("<p />", {
    class: "card-text",
  });

  badgeHolder.appendTo(cardBody);

  // list the track
  var trackInfo = item.categories.find((category) => category.name === "Track");
  $("<span />", {
    class: "badge bg-primary",
    html: trackInfo.categoryItems[0].name,
  }).appendTo(badgeHolder);

  // list the level
  var levelInfo = item.categories.find((category) => category.name === "Level");
  $("<span />", {
    class: "badge bg-info",
    html: levelInfo.categoryItems[0].name,
  }).appendTo(badgeHolder);

  // list the tags
  var tagsInfo = item.categories.find((category) => category.name === "Tags");
  $.each(tagsInfo.categoryItems, function (key, tag) {
    $("<span />", {
      class: "badge bg-secondary",
      html: tag.name,
    }).appendTo(badgeHolder);
  });

  var showHideButton = $("<button />", {
    class: "btn btn-dark",
    html: "Show / Hide Abstract",
    type: "button",
    "data-bs-toggle": "collapse",
    "data-bs-target": `#collapse${item.id}`,
    "aria-expanded": "false",
    "aria-controls": `collapse${item.id}`,
  });

  showHideButton.appendTo(cardBody);

  var descriptionWrapper = $("<div />", {
    class: "collapse",
    id: `collapse${item.id}`,
  });

  descriptionWrapper.appendTo(cardBody);

  var description = $("<p />", {
    class: "description",
    html: item.description,
  });

  description.appendTo(descriptionWrapper);

  return card;
}
