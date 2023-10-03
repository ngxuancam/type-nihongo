import {
  ALL_LIST_HIRAGANA,
  HIRAGANA_TO_ROMAJI,
  ROMAJI_TO_HIRAGANA,
  HIRAGANA_START,
  HIRAGANA_END,
  KATAKANA_START,
  KATAKANA_END

} from './constant.js'

var isCharInRange = function (char, start, end) {
  var code;
  code = char.charCodeAt(0);
  return start <= code && code <= end;
};

var isCharVowel = function (char, includeY) {
  var regexp;
  if (includeY == null) {
    includeY = true;
  }
  regexp = includeY ? /[aeiouy]/ : /[aeiou]/;
  return char.toLowerCase().charAt(0).search(regexp) !== -1;
};

var _isCharConsonant = function (char, includeY) {
  var regexp;
  if (includeY == null) {
    includeY = true;
  }
  regexp = includeY ? /[bcdfghjklmnpqrstvwxyz]/ : /[bcdfghjklmnpqrstvwxz]/;
  return char.toLowerCase().charAt(0).search(regexp) !== -1;
};

var isCharKatakana = function (char) {
  return isCharInRange(char, KATAKANA_START, KATAKANA_END);
};

var isCharHiragana = function (char) {
  return isCharInRange(char, HIRAGANA_START, HIRAGANA_END);
};

var isCharKana = function (char) {
  return isCharHiragana(char) || isCharKatakana(char);
};

var _isCharNotKana = function (char) {
  return !isCharHiragana(char) && !isCharKatakana(char);
};

var katakanaToHiragana = function (kata) {
  var code, hira, hiraChar, kataChar, _i, _len, _ref;
  hira = [];
  _ref = kata.split("");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    kataChar = _ref[_i];
    if (isCharKatakana(kataChar)) {
      code = kataChar.charCodeAt(0);
      code += HIRAGANA_START - KATAKANA_START;
      hiraChar = String.fromCharCode(code);
      hira.push(hiraChar);
    } else {
      hira.push(kataChar);
    }
  }
  return hira.join("");
};

var hiraganaToKatakana = function (hira) {
  var code, hiraChar, kata, kataChar, _i, _len, _ref;
  kata = [];
  _ref = hira.split("");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    hiraChar = _ref[_i];
    if (isCharHiragana(hiraChar)) {
      code = hiraChar.charCodeAt(0);
      code += KATAKANA_START - HIRAGANA_START;
      kataChar = String.fromCharCode(code);
      kata.push(kataChar);
    } else {
      kata.push(hiraChar);
    }
  }
  return kata.join("");
};

var romajiToKana = function (romaji) {
  var isKatakana = $('input[name="kana"]:checked').val() == "katakana";
  var hiragana = ROMAJI_TO_HIRAGANA[romaji];
  if (!hiragana) return null;
  return isKatakana ? hiraganaToKatakana(hiragana) : hiragana;
};

var kanaToRomaji = function (kana) {
  var isKatakana = $('input[name="kana"]:checked').val() == "katakana";
  if (isKatakana) {
    kana = katakanaToHiragana(kana);
  }
  return HIRAGANA_TO_ROMAJI[kana];
};

function rand(a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}

$("body, html").click(function () {
  $(".romaji-container").focus();
});

var score = 0,
  time,
  timer;
var started = false;

$(".btn-start").click(function () {
  started = true;
  $(this)
    .parent()
    .fadeOut(200, function () {
      $(".main-content").slideDown();
      $(".main-container").animate({
        "margin-top": "-150px",
      });
      $(".buttons-score").fadeIn();
      $(".romaji-container").attr("contenteditable", true).focus();

      $(".time").text("0:00");
      $(".score").text("0/100");

      $(".kana-container").html("").attr("style", "");
      for (var i = 0; i < 100; i++) {
        var kanaChar = ALL_LIST_HIRAGANA[rand(0, ALL_LIST_HIRAGANA.length - 1)];
        var isKatakana = $('input[name="kana"]:checked').val() == "katakana";
        kanaChar = isKatakana ? hiraganaToKatakana(kanaChar) : kanaChar;

        $(".kana-container").append(
          '<span class="white" style="margin: 0 10px 0 10px">' +
            kanaChar +
            "</span>"
        );
      }
    });
});

$(".romaji-container").keyup(function () {
  if (!timer) {
    time = +new Date();
    timer = setInterval(function () {
      var deltaTime = (+new Date() - time) / 1000;
      var s = Math.floor(deltaTime % 60);
      if (s < 10) s = "0" + s;
      var m = Math.floor((deltaTime / 60) % 60);
      $(".time").text(m + ":" + s);
    }, 1000);
  }
  var kanaTyped = $(this).text().toLowerCase();
  if (kanaToRomaji($(".white").first().text()).indexOf(kanaTyped) >= 0) {
    $(this).html("");
    var w =
      $(".white").first().addClass("green").removeClass("white").width() + 20;
    $(".kana-container").animate(
      {
        "margin-left": "-=" + w + "px",
      },
      200
    );
    $(".score").html(++score + " / 100");
  } else if (
    ($(this).text().length >= 1 &&
      (kanaToRomaji($(".white").first().text()).indexOf("a") >= 0 ||
        kanaToRomaji($(".white").first().text()).indexOf("i") >= 0 ||
        kanaToRomaji($(".white").first().text()).indexOf("u") >= 0 ||
        kanaToRomaji($(".white").first().text()).indexOf("e") >= 0 ||
        kanaToRomaji($(".white").first().text()).indexOf("o") >= 0)) ||
    ($(this).text().length >= 2 &&
      $(".white").first().text().length === 1 &&
      kanaToRomaji($(".white").first().text()).indexOf("tsu") < 0 &&
      kanaToRomaji($(".white").first().text()).indexOf("chi") < 0 &&
      kanaToRomaji($(".white").first().text()).indexOf("shi") < 0) ||
    ($(this).text().length >= 3 && $(".white").first().text().length === 2)
  ) {
    $(this).html("");
    var w =
      $(".white").first().addClass("red").removeClass("white").width() + 20;
    $(".kana-container").animate(
      {
        "margin-left": "-=" + w + "px",
      },
      200
    );
  }
  if (!$(".white").length) {
    $(".kana-container").animate({
      "margin-left": "-=" + $(window).width() / 2 + "px",
    });
    $(".romaji-container").attr("contenteditable", false);

    clearInterval(timer);
    timer = null;

    score = 0;

    $(".main-content").slideUp();
    $(".main-container").animate({
      "margin-top": "-100px",
    });
    $(".buttons-start").fadeIn();
    $(".btn-start .start").text("Restart");

    started = false;
  }
});

$(document).ready(function() {


  $( ".kana-container" ).delegate( ".red", "mouseenter", function() {
    $('#tool-tip').html(kanaToRomaji($(this).text()).join(" | "));
    $('#tool-tip').css("visibility", "visible");
  });

  $( ".kana-container" ).delegate( ".red", "mouseleave", function() {
    $('#tool-tip').css("visibility", "hidden");
  });

  $( ".kana-container" ).delegate( ".green", "mouseenter", function() {
    $('#tool-tip').html(kanaToRomaji($(this).text()).join(" | "));
    $('#tool-tip').css("visibility", "visible");
  });

  $( ".kana-container" ).delegate( ".green", "mouseleave", function() {
    $('#tool-tip').css("visibility", "hidden");
  });
})
