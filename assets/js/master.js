var campaign = getUrlParam("utm_campaign");
var medium = getUrlParam("utm_medium");
var content = getUrlParam("utm_content");
var source = getUrlParam("utm_source");
jQuery(document).ready(function ($) {
  jQuery(document).on(
    "change",
    ".fsFieldRow label.fsOptionLabel input",
    function () {
      jQuery(this)
        .parents(".fsFieldRow")
        .find("label.fsOptionLabel")
        .each(function () {
          if (jQuery(this).find("input").is(":checked"))
            jQuery(this).addClass("checked");
          else jQuery(this).removeClass("checked");
        });
    }
  );
  jQuery(".dropdown-toggle").click(function () {
    jQuery(".dropdown-menu").toggle();
  });
  jQuery(".amt-button").on("click", function () {
    dataLayer.push({
      event: "amt_click",
      button_amount: jQuery(this).data("amt"),
    });
  });
  jQuery('input[type="submit"]').on("click", function () {
    dataLayer.push({ event: "submit_click" });
  });
});
function stripe_on_complete(data) {
  if (data.object == "charge") {
    var widget = {
      confirmationCode: data.id,
      initialCharge: "$" + data.amount / 100.0,
    };
    gaTriggerIndex(widget, "Onetime Gift");
  } else if (data.object == "subscription") {
    var widget = {
      confirmationCode: data.id,
      initialCharge: "$" + data.plan.amount / 100.0,
    };
    var type = "CC";
    if ($form.find(".choose-bankaccount").hasClass("active")) type = "ACH";
    if (data.plan.interval_count == 12) {
      gaTriggerIndex(widget, "Yearly Recurring Gift - " + type);
    } else {
      gaTriggerIndex(widget, "Monthly Recurring Gift - " + type);
    }
  }
}
function gaTriggerIndex(widget, type) {
  var confCode = widget.confirmationCode;
  var initCharge = widget.initialCharge;
  initCharge = initCharge.replace(/\,/g, "").substring(1);
  initCharge = parseFloat(initCharge);
  var category = "Primary Donation";
  var org = jQuery("#primary-ask input[name='org']").val();
  if (
    jQuery("#secondary-ask").length > 0 &&
    jQuery("#secondary-ask").is(":visible")
  ) {
    org = jQuery("#secondary-ask input[name='org']").val();
    category = "Secondary Donation";
  }
  window.dataLayer = window.dataLayer || [];
  dataLayer.push({
    event: "donate",
    gift_category: type,
    amount_rounded: Math.round(initCharge),
    transactionId: confCode,
    transactionAffiliation: org,
    transactionTotal: initCharge,
    transactionTax: 0,
    transactionShipping: 0,
    transactionProducts: [
      {
        sku: org,
        name: document.title,
        category: type,
        price: initCharge,
        quantity: 1,
      },
    ],
  });
  if ("parentIFrame" in window) {
    parentIFrame.sendMessage({
      confCode: confCode,
      initCharge: initCharge,
      type: type,
      category: category,
    });
  }
  if (
    jQuery("#secondary-ask").length > 0 &&
    !jQuery("#secondary-ask").is(":visible")
  ) {
    jQuery("#secondary-ask .k_radioCB[value='Other']").attr(
      "checked",
      "checked"
    );
    if (initCharge < 1000) {
      jQuery("#secondary-ask input[name='DonationLevel_FEE']")
        .val("$" + initCharge)
        .blur();
      jQuery(".stripe-donation-other-amt").val(initCharge);
    }
    if (org == "thf")
      jQuery(".page-header .container").html(
        '<img class="pull-left" src="/wp-content/themes/secured/_img/logo-hafa.png" style="height:48px;">'
      );
    jQuery("#thf_legal").hide();
    jQuery(".parallax-mirror").css("display", "none");
    jQuery("html, body").animate(
      { scrollTop: jQuery("#primary-ask").offset().top },
      1000
    );
    jQuery("#primary-ask").fadeOut(1000, function () {
      jQuery("#secondary-ask").fadeIn(400, function () {
        window.dataLayer.push({
          event: "showSerialAsk",
          org: jQuery("#secondary-ask").find('input[name="org"]').val(),
        });
      });
    });
    jQuery(".k_button.forward").after(
      '<button type="button" class="k_button forward noThanks">No Thanks</button>'
    );
    jQuery(".btn-primary").after(
      '<input type="button" class="btn k_button forward noThanks" value="No Thanks" />'
    );
    jQuery(".noThanks").click(function () {
      jQuery("#secondary-ask").fadeOut(500, function () {
        jQuery("#primary-ask").fadeIn(500);
      });
      window.dataLayer.push({
        event: "hideSerialAsk",
        org: jQuery("#secondary-ask").find('input[name="org"]').val(),
      });
      return false;
    });
  }
  return initCharge;
}
function stripe_on_beforesubmit($form) {
  if (jQuery(".stripe-donation").length > 1) duplicate_to_stripe($form);
  else if (jQuery(".kimbiaDiv").length > 0) duplicate_to_kimbia($form);
}
function duplicate_to_stripe($form) {
  var fromForm = $form;
  var toForm = "#secondary-ask";
  jQuery(toForm + " input[name='first-name']")
    .val($form.find("input[name='first-name']").val())
    .blur();
  jQuery(toForm + " input[name='last-name']")
    .val($form.find("input[name='last-name']").val())
    .blur();
  jQuery(toForm + " input[name='email']")
    .val($form.find("input[name='email']").val())
    .blur();
  jQuery(toForm + " select[name='country']")
    .val($form.find("select[name='country']").val())
    .blur()
    .change();
  jQuery(toForm + " input[name='address']")
    .val($form.find("input[name='address']").val())
    .blur();
  jQuery(toForm + " input[name='city']")
    .val($form.find("input[name='city']").val())
    .blur();
  jQuery(toForm + " select[name='state']")
    .val($form.find("select[name='state']").val())
    .blur();
  jQuery(toForm + " input[name='zip']")
    .val($form.find("input[name='zip']").val())
    .blur();
  jQuery(toForm + " .stripe-donation-card-number")
    .val($form.find(".stripe-donation-card-number").val())
    .blur();
  jQuery(toForm + " .stripe-donation-card-cvc")
    .val($form.find(".stripe-donation-card-cvc").val())
    .blur();
  jQuery(toForm + " .stripe-donation-exp-month")
    .val($form.find(".stripe-donation-exp-month").val())
    .blur();
  jQuery(toForm + " .stripe-donation-exp-year")
    .val($form.find(".stripe-donation-exp-year").val())
    .blur();
  jQuery(toForm + " .stripe-donation-routing-number")
    .val($form.find(".stripe-donation-routing-number").val())
    .blur();
  jQuery(toForm + " .stripe-donation-account-number")
    .val($form.find(".stripe-donation-account-number").val())
    .blur();
  jQuery(toForm + " .stripe-donation-account-number-check")
    .val($form.find(".stripe-donation-account-number-check").val())
    .blur();
  if ($form.find(".choose-bankaccount").hasClass("active"))
    jQuery(toForm + " .choose-bankaccount").addClass("active");
}
function getValueByLabel(aSignup, labelText, sublabelText) {
  for (var a = 0; a < aSignup.length; a++) {
    var formAnswerObject = aSignup[a];
    if (formAnswerObject.questionLabel === labelText) {
      if (
        sublabelText == null ||
        sublabelText == "" ||
        formAnswerObject.questionSubLabel == sublabelText
      ) {
        return formAnswerObject.data;
      }
    }
  }
  return "";
}
function getUrlParam(name) {
  var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  if (!results) {
    return undefined;
  }
  return results[1];
}
function setMetaData(widget) {
  widget.setMetaData("ga_campaign", campaign);
  widget.setMetaData("ga_medium", medium);
  widget.setMetaData("ga_content", content);
  widget.setMetaData("ga_source", source);
}
function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function eraseCookie(name) {
  createCookie(name, "", -1);
}
Number.prototype.formatMoney = function (c, d, t) {
  var n = this,
    c = isNaN((c = Math.abs(c))) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
};
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
function RecurFancybox() {
  var amt = $form.find(".stripe-donation-other-amt").val();
  if ($form.find(".amt-button.active").length == 1)
    amt = $form.find(".amt-button.active").data("amt");
  var origAmg = amt;
  if (amt > 10 && amt < 500) amt = 5 * Math.ceil(amt / 3 / 5);
  if (
    $form.find("input[name='recurring']:checked").val() == "N" &&
    jQuery("#yesRecurring").length == 0 &&
    amt < 500
  ) {
    jQuery("body").append(
      '<div id="fancybox_hider" style="display:none;"><div id="recur_upgrade" class="kimbiaDiv article" style="background: #f9f9f9;" ><h1 style="margin-bottom:0;">Please confirm:</h1><h1 style="font-size:24px;">Your gift has not yet been processed.</h1></div></div>'
    );
    jQuery("#recur_upgrade").append(
      '<p>Did you know that if you <strong>gave less today</strong>, you could actually have <strong>a greater impact in the future?</strong></p><p>When you change your one-time gift to a monthly recurring gift, you will not only <strong>qualify for the prestigious Leaders Club</strong> but your continued support will allow Heritage to continue to fight for your conservative principles now and into the future.</p><p style="font-size:1.1em;"><strong>Will you convert your one-time gift to an ongoing contribution?</strong></p>'
    );
    jQuery("#recur_upgrade").append(
      '<span style="float:left; padding-top: 11px; padding-right: 6px; font-size: 1.4em;">$ </span><input id="updated_amt" type="text" class="k_text" value="' +
        amt +
        '" style="width:30%;">'
    );
    jQuery("#recur_upgrade").append(
      '<span class="fieldCaption"><span id="recur_amt_error" style="display: none; height: auto;" class="k_messages" id="msg_DonationLevel_1">Please enter a valid gift amount (numbers-only)</span></span>'
    );
    jQuery("#recur_upgrade").append(
      '<button type="button" id="yesRecurring" class="k_button forward" style="margin:.5em 0;">Make this gift monthly</button> <button type="button" class="k_button forward noThanks" id="noRecurring" style="margin:.5em 0;">Continue with my $' +
        origAmg +
        " gift</button>"
    );
    $.fancybox("#fancybox_hider", { maxWidth: 600 });
    jQuery("#noRecurring").on("click", function () {
      $form.submit();
      $.fancybox.close(true);
      return true;
    });
    jQuery("#yesRecurring").on("click", function () {
      if (isNaN(jQuery("#updated_amt").val())) {
        jQuery("#recur_amt_error").show();
        return false;
      } else {
        $.fancybox.close(true);
        if ($form.find("input[name='recurring']").length == 1)
          $form.find("input[name='recurring']").val("Y");
        else
          $form
            .find("input[name='recurring'][value='Y']")
            .prop("checked", true);
        $form.find(".amt-button.active").prop("checked", false);
        $form
          .find("input.stripe-donation-other-amt")
          .val(jQuery("#updated_amt").val());
        $form.submit();
      }
    });
    return false;
  }
  return true;
}
