//// <reference path="jquery-3.1.1.js" /> 
var patternNum = [];
var savedPattern = [];
var cursor = {};
var isRegister = true;

$(document).ready(function() {
    beginPattern();
});

function init() {
    $('div.origin-point').each(function () {
        $(this).on('mousedown', function(e) {
            e.preventDefault();
            var pointId = $(this).attr('point');
            startLinkMode(pointId, e);
        });

        $(this).on('touchstart', function(e) {
            e.preventDefault();
            var pointId = $(this).attr('point');
            startLinkMode(pointId, e);
        });
    });
}

function uninit() {
    $('div.origin-point').each(function () {
        $(this).unbind('mousedown').unbind('touchstart');
    });
}

function startLinkMode(pointId, event) {
    if ($('div.new-link-line').length > 0) {
        return;
    }
    patternNum.push(pointId)
    createLinkMode(pointId);
}

function createLinkMode(pointId) {
    console.log('Create New Link Line X (count): ' + $('div.new-link-line[pointto="x"]').length + '');

    var linkLine = $('<div class="new-link-line" pointfrom="' + pointId + '" pointto="x"></div>').appendTo('div#lines');
    var originX = $('div.origin-point[point="' + pointId + '"]').offset().left + $('div.origin-point[point="' + pointId + '"]').outerWidth() / 2;
    var originY = $('div.origin-point[point="' + pointId + '"]').offset().top + $('div.origin-point[point="' + pointId + '"]').outerHeight() / 2;
    linkLine
        .css('top', originY)
        .css('left', originX);
    console.log('[START]Create New Link Line X (coor): OriX: ' + originX + ' ; OriY: ' + originY + ' ; ');
    $(document).bind('mousemove', function(e) {
        e.preventDefault();
        linkMouseMoveEvent(e, pointId);
    });

    $(document).bind('touchmove', function(e) {
        e.preventDefault();
        linkMouseMoveEvent(e, pointId);
    });

    // Cancel on mouse up or touch end
    $(document).bind('mouseup', function(e) {
        e.preventDefault();
        endLinkMode();
        endPattern();
    });

    $(document).bind('touchend', function(e) {
        e.preventDefault();
        endLinkMode();
        endPattern();
    });
}
    
function linkMouseMoveEvent(event, pointId) {
    if($('div.new-link-line[pointfrom="' + pointId + '"][pointto="x"]').length > 0) {
        var originX = $('div.origin-point[point="' + pointId + '"]').offset().left + $('div.origin-point[point="' + pointId + '"]').outerWidth() / 2;
        var originY = $('div.origin-point[point="' + pointId + '"]').offset().top + $('div.origin-point[point="' + pointId + '"]').outerHeight() / 2;
           
        // var originX = $('div.new-link-line[pointfrom="' + pointId + '"][pointto="x"]').offset().left + $('div.origin-point[point="' + pointId + '"]').outerWidth() / 2;
        // var originY = $('div.new-link-line[pointfrom="' + pointId + '"][pointto="x"]').offset().top + $('div.origin-point[point="' + pointId + '"]').outerHeight() / 2;
        var currPos = normalizePosition(event);
        console.log('MMove New Link Line X (count): ' + $('div.new-link-line[pointto="x"]').length + '');
        $('div.origin-point').each(function () {
            var currX = currPos.x;// + (event.targetTouches? $('div.origin-point[point="' + pointId + '"]').offset().left : 0);
            var currY = currPos.y;// + (event.targetTouches? $('div.origin-point[point="' + pointId + '"]').offset().top : 0);
            var pointXLeft = $(this).offset().left;
            var pointXRight = $(this).offset().left + $(this).outerWidth();
            var pointYTop = $(this).offset().top;
            var pointYBottom = $(this).offset().top + $(this).outerHeight();
            console.log('[BEFORE]MMove New Link Line X (coor): OriX: ' + originX + ' ; OriY: ' + originY + ' ; CurrX: ' + currX + ' ; CurrY: ' + currY + ' ; CurrPosX: ' + currPos.x + ' ; CurrPosY: ' + currPos.y + '');
            if (currX >= pointXLeft && currX <= pointXRight && currY >= pointYTop && currY <= pointYBottom) {
                currX = pointXLeft + ($(this).outerWidth() / 2);
                currY = pointYTop + ($(this).outerHeight() / 2);
                console.log('[IN]MMove New Link Line X (coor): OriX: ' + originX + ' ; OriY: ' + originY + ' ; CurrX: ' + currX + ' ; CurrY: ' + currY + ' ; CurrPosX: ' + currPos.x + ' ; CurrPosY: ' + currPos.y + '');
                setTransformEndPoint(originX, originY, currX, currY, function () {
                    
                });
                storeLinkMode(pointId, $(this).attr('point'));
            }
            else {
                console.log('[OUT]MMove New Link Line X (coor): OriX: ' + originX + ' ; OriY: ' + originY + ' ; CurrX: ' + currX + ' ; CurrY: ' + currY + ' ; CurrPosX: ' + currPos.x + ' ; CurrPosY: ' + currPos.y + '');
                setTransformEndPoint(originX, originY, currX, currY);
            }
        });
    }
}

function normalizePosition(evt){
    var position = {};

    if(evt.targetTouches){
        position.x = evt.targetTouches[0].pageX;
        position.y = evt.targetTouches[0].pageY;
        console.log('[TOUCH]Normalize Pos: pageX: ' + position.x + ' ; pageY: ' + position.y + '');
        // var parent = evt.target;
        // while(parent.offsetParent){
        // position.x -= parent.offsetLeft - parent.scrollLeft;
        // position.y -= parent.offsetTop - parent.scrollTop;

        // parent = parent.offsetParent;
        // }
    }
    else{
        position.x = evt.pageX;
        position.y = evt.pageY;
    }

    return position;
}

function setTransformEndPoint(originX, originY, currX, currY, complete) {
    var length = Math.sqrt((currX - originX) * (currX - originX) 
        + (currY - originY) * (currY - originY));

    var angle = 180 / 3.1415 * Math.acos((currY - originY) / length);
    if(currX > originX)
        angle *= -1;

    $($('div.new-link-line[pointto="x"]')[0])
        .css('height', length)
        .css('-webkit-transform', 'rotate(' + angle + 'deg)')
        .css('-moz-transform', 'rotate(' + angle + 'deg)')
        .css('-o-transform', 'rotate(' + angle + 'deg)')
        .css('-ms-transform', 'rotate(' + angle + 'deg)')
        .css('transform', 'rotate(' + angle + 'deg)');

    if (complete != undefined) {
        complete();
    }
}

function storeLinkMode(pointFrom, pointTo) {
    console.log("PFrom: " + pointFrom + "; PTo: " + pointTo + "");
    if (pointFrom == pointTo) {
        return;
    }
    patternNum.push(pointTo);
    endLinkMode(pointFrom, pointTo, function () {
        
    });
    createLinkMode(pointTo);
}
    
function endLinkMode(pointFrom, pointTo, finished) {
    var link = $('div.new-link-line[pointfrom="' + pointFrom + '"][pointto="x"]');
    $(link[0]).attr('pointto', pointTo);
    $('div.new-link-line[pointto="x"]').each(function () {
        $(this).remove();
    });
    $(document).unbind('mousemove').unbind('touchmove').unbind('mouseup').unbind('touchup').unbind('mousemove.link').unbind('click.link').unbind('keydown.link');
    if (finished != undefined) {
        finished();
    }
}

function beginPattern() {
    if (isRegister) {
        $('#label').html('Please register your key pattern.');
        $('#result').html('');
    }
    else {
        $('#label').html('Please enter your key pattern.');
        $('#result').html('');
    }
    init();
}

function endPattern() {
    uninit();
    if (isRegister) {
        if (savedPattern.length == 0 && patternNum.length == 0) {
            return;
        }
        savedPattern = patternNum;
        isRegister = false;
        $('#result').addClass('success');
        $('#result').removeClass('failed');
        $('#label').html('');
        $('#result').html('Pattern is successfully saved.');
        setTimeout(function () {
            beginPattern();
        }, 2000);
    }
    else {
        if (patternNum.length > 0) {
            if (isValid()) {
                savedPattern = [];
                isRegister = true;
                $('#result').addClass('success');
                $('#result').removeClass('failed');
                $('#label').html('');
                $('#result').html('Congratulation your pattern is matched.');
            }
            else {
                $('#result').addClass('failed');
                $('#result').removeClass('success');
                $('#label').html('');
                $('#result').html('Sorry your pattern is not matched.');
            }
        }
        
        setTimeout(function () {
            beginPattern();
        }, 3000);
    }
    patternNum = [];
    $('div#lines').html('');
}

function isValid() {
    var result = true;
    if (patternNum.length == 0 && savedPattern.length == 0) {
        result = false;
    }

    if (patternNum.length == savedPattern.length) {
        for (var index = 0; index < patternNum.length; index++) {
            var curr = patternNum[index];
            var saved = savedPattern[index];
            result &= (curr == saved);
        }
    }
    else {
        result = false;
    }
    return result;
}