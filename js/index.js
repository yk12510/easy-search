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
            if (!value || value === ' ') {
                hotword.hide();
            } else if (value !== oldHotword) {
                oldHotword = value;
                var param = engineJson[engine].param;
                for (var i = 0; i < engineJson[engine].hotword.length; i++) {
                    param[engineJson[engine].hotword[i]] = value;
                }
                publicAjax(engineJson[engine].hotwordUrl, 'get', param, engineJson[engine].param2, function (data) {
                    var str = '';
                    var historyKeyword = JSON.parse($.cookie('historyKeyword') || '[]');
                    var res = data[engineJson[engine].resIndex[0]] || [];
                    var count = 0;
                    if (res.length) {
                        for (var i = 0; i < historyKeyword.length; i++) {
                            if (historyKeyword[i].indexOf(value) > -1) {
                                str += '<li>' + boldValue(historyKeyword[i], value) + '</li>';
                                count++;
                            }
                            if (count > 1) break;
                        }
                    } else {
                        for (var i = 0; i < historyKeyword.length; i++) {
                            if (historyKeyword[i].indexOf(value) > -1) {
                                str += '<li>' + boldValue(historyKeyword[i], value) + '</li>';
                                count++;
                            }
                            if (count > 9) break;
                        }
                    }
                    for (var i = 0; i < res.length; i++) {
                        str += '<li>' + boldValue(res[i][engineJson[engine].resIndex[1]], value) + '</li>';
                    }
                    hotword.html(str);
                    hotwordIndex = -1;
                    count || res.length ? hotword.show() : hotword.hide();
                });
            }
        }, 200);
    }).on('focus', function () {
        if ($(this).val() && hotword.find('li').length) {
            hotword.show();
        }
    });
    /*
     * 热词显示隐藏事件处理
     * 选择热词
     * */
    var hotwordIndex = -1;
    $(document).on('mouseup', function (e) {
        var _con = form;   // 设置目标区域
        if (!_con.is(e.target) && _con.has(e.target).length === 0) { // Mark 1
            hotword.hide();
            hotword.find('li').removeClass('active');
        }
    }).on('keyup', function (e) {
        if (!hotword.is(':hidden') && (e.keyCode === 38 || e.keyCode === 40)) {
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
        keyword: 'wd',
        hotwordUrl: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
        hotword: ['wd', 'bs'],
        resIndex: ['g', 'q'],
        param: {
            sugmode: 2,
            json: 1,
            p: 3,
            sid: '1442_19033_21106_22075',
            req: 2,
            csor: 3,
            _: 1515232785712
        },
        param2: {
            dataType : "jsonp",
            jsonp: "cb",
            jsonpCallback:"success"
        }
    },
    google: {
        name: 'Google',
        formUrl: 'https://www.google.com.hk/search',
        keyword: 'q',
        hotwordUrl: 'https://www.google.com.hk/complete/search',
        hotword: ['q'],
        resIndex: [1, 0],
        param: {
            client: 'psy-ab',
            hl: 'zh-CN',
            gs_rn: 64,
            gs_ri: 'psy-ab',
            pq: 'sdsd',
            cp: 3,
            gs_id: '1jm',
            xhr: 't'
        },
        param2: {
            dataType : "jsonp",
            jsonp: "callback",
            jsonpCallback:"success"
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
function publicAjax(url, type, parameter, parameter2, fn) {
    if (typeof parameter2 === 'function') {
        fn = parameter2;
        parameter2 = {};
    }
    if (typeof fn !== 'function') {
        alert("回调必须是个函数,function");
        return;
    }

    $.ajax($.extend({}, {
        url: url,
        type: type,
        data: parameter,
        success: function (data) {
            fn(data);
        },
        error: function (data) {
            console.log("出错la。。。。");
        }
    }, parameter2));
}

/*
* 加粗输入词
* */
function boldValue(str, val) {
    var arr = str.split(val);
    var str1 = '';
    for(var i = 0; i < arr.length; i++) {
        str1 += arr[i] + ((i === arr.length - 1) ? '' : '<b>' + val + '</b>');
    }
    return str1;
}
