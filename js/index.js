$(function () {
    var search = $('#search-container');
    var form = search.find('.search-form>form');
    var keyword = form.find('input.keyword');

    var engine = 'google';

    if ($.cookie('engine')) {
        engine = $.cookie('engine');
        setEngine(engine);
    }

    /* Logo字体颜色随机 */
    var randomColor = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];
    search.find('.search-logo .random-color').each(function () {
        $(this).css('color', randomColor[parseInt(getRandomNum(0, 4))]);
    });

    /* 搜索引擎切换 */
    var engineEl = $('#engine');
    var timer = null;
    $('.engine').hover(function () {
        clearTimeout(timer);
        engineEl.show();
    }, function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            engineEl.hide();
        }, 200);
    });
    engineEl.on('click', 'li', function () {
        engine = $(this).attr('engine');
        setEngine(engine);
        engineEl.hide();
    });

    /*
     * 设置搜索引擎,默认Google
     * */
    function setEngine(engine) {
        engine = engine || 'google';
        $('.engine').find('span').text(engineJson[engine].name);
        form.attr('action', engineJson[engine].formUrl);
        keyword.attr('name', engineJson[engine].keyword);
        $.cookie('engine', engine, {expires: 90});
    }

    /*
     * 搜索热词
     * */
    var hotword = $('#guess-word');
    var timer2 = null;
    var oldHotword = '';
    keyword.on('input', function () {
        var obj = $(this);
        clearTimeout(timer2);
        timer2 = setTimeout(function () {
            var value = obj.val();
            if (value && value !== oldHotword) {
                oldHotword = value;
                var engine = 'google';
                var param = engineJson[engine].param;
                param[engineJson[engine].hotword] = value;
                publicAjax(engineJson[engine].hotwordUrl, 'get', param, function (data) {
                    var str = '';
                    var historyKeyword = JSON.parse($.cookie('historyKeyword') || '[]');
                    if (engine === 'google') {
                        var res = data[1];
                        var count = 0;
                        if (res.length) {
                            for (var i = 0; i < historyKeyword.length; i++) {
                                if (historyKeyword[i].indexOf(value) > -1) {
                                    str += '<li>' + historyKeyword[i] + '</li>';
                                    count++;
                                }
                                if (count > 1) break;
                            }
                        } else {
                            for (var i = 0; i < historyKeyword; i++) {
                                if (historyKeyword[i].indexOf(value) > -1) {
                                    str += '<li>' + historyKeyword[i] + '</li>';
                                    count++;
                                }
                                if (count > 9) break;
                            }
                        }
                        for (var i = 0; i < res.length; i ++) {
                            str += '<li>' + res[i][0] + '</li>';
                        }
                        hotword.html(str);
                        if (res.length) {
                            hotwordIndex = -1;
                            hotword.show();
                        }
                    }
                });
            }
        }, 200);
    }).on('focus', function (){
        if ($(this).val()) {
            hotword.show();
        }
    });
    /*
    * 热词显示隐藏事件处理
    * 选择热词
    * */
    var hotwordIndex = -1;
    $(document).on('mouseup',function(e){
        var _con = form;   // 设置目标区域
        if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
            hotword.hide();
            hotword.find('li').removeClass('active');
        }
    }).on('keyup', function(e){
        if(!hotword.is(':hidden') && (e.keyCode === 38 || e.keyCode === 40)){
            var lis = hotword.find('li');
            var len = lis.length;
            if (e.keyCode === 38) { // 上键
                hotwordIndex--;
                if (hotwordIndex < -1) hotwordIndex = len - 1;
            } else if (e.keyCode === 40) {  // 下键
                hotwordIndex++;
                if (hotwordIndex >= len) hotwordIndex = -1;
            }
            lis.removeClass('active');
            if (hotwordIndex <= -1) {
                keyword.focus();
            } else {
                keyword.val(lis.eq(hotwordIndex).addClass('active').text());
                keyword.focus();
            }
        }
    });

    /* 点击热词 */
    hotword.on('click', 'li', function () {
        keyword.val($(this).text());
        form.submit();
    });

    form.on('submit', function () {
        var value = keyword.val();
        if (value) {
            var historyKeyword = JSON.parse($.cookie('historyKeyword') || '[]');
            historyKeyword.unshift(value);
            $.cookie('historyKeyword', JSON.stringify(historyKeyword), {exprise: 365 * 2});
        }
    })
});

/*
 * 搜索引擎配置
 * */
var engineJson = {
    baidu: {
        name: '百度',
        formUrl: 'https://www.baidu.com/s',
        keyword: 'wd'
    },
    google: {
        name: 'Google',
        formUrl: 'https://www.google.com.hk/search',
        keyword: 'q',
        hotwordUrl: 'https://www.google.com.hk/complete/search',
        hotword: 'q',
        param: {
            client: 'psy-ab',
            hl: 'zh-CN',
            gs_rn: 64,
            gs_ri: 'psy-ab',
            pq: 'sdsd',
            cp: 3,
            gs_id: '1jm',
            xhr: 't'
        }
    }
};

/*
 * 获取min-max之间的随机数（不包含max）
 * @min  最小值
 * @max  最大值
 * */
function getRandomNum(min, max) {
    return Math.random() * Math.abs(max - min) + (max > min ? min : max);
}

/*
 * 公用ajax方法
 * */
function publicAjax(url, type, parameter, fn) {
    if (typeof fn != 'function') {
        flavrShowByTime("回调必须是个函数,function", null, "danger", false);
        return;
    }

    $.ajax({
        url: url,
        type: type,
        jsonp: "callback",
        dataType: "jsonp",
        data: parameter,
        success: function (data) {
            fn(data);
        },
        error: function (data) {
            console.log("出错la。。。。");
        }
    });
}
